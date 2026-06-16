import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "../../../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getWhatsAppMessageHistory, saveWhatsAppMessage } from "./history";
import { sendWhatsAppTextMessage } from "./client";
import { whatsappToolsDeclarations, executeWhatsAppTool } from "./tools";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Inicializar el SDK de Google Gen AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

interface MediaAttachment {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

/**
 * Guarda físicamente el archivo del cliente en la carpeta de uploads y registra en la BD
 */
async function handleSaveDocument(
  userId: string,
  stepId: number,
  media: MediaAttachment
): Promise<{ success: boolean; documentId?: number; message?: string }> {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", userId);
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Limpiar nombre de archivo para evitar problemas
    const sanitizedFilename = media.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = path.join(uploadDir, sanitizedFilename);
    
    // Guardar archivo físico en disco
    fs.writeFileSync(filePath, media.buffer);

    // Ruta relativa para la BD ( Next.js puede servir estáticamente desde /uploads/... )
    const fileUrl = `/uploads/${userId}/${sanitizedFilename}`;
    const extension = media.filename.split(".").pop() || "bin";

    // 1. Registrar documento en la tabla Document
    const document = await prisma.document.create({
      data: {
        name: media.filename,
        extension,
        url: fileUrl,
      },
    });

    // 2. Asociar al progreso del cliente y cambiar su estado a "Uploaded"
    await prisma.userProcessProgress.upsert({
      where: {
        id: (await prisma.userProcessProgress.findFirst({
          where: { userId, stepId }
        }))?.id || -1
      },
      update: {
        documentId: document.id,
        status: "Uploaded",
      },
      create: {
        userId,
        stepId,
        documentId: document.id,
        status: "Uploaded",
      },
    });

    return {
      success: true,
      documentId: document.id,
      message: `Archivo guardado exitosamente en: ${fileUrl}`,
    };
  } catch (error) {
    console.error("❌ Error en handleSaveDocument:", error);
    return { success: false, message: "Error interno al guardar el archivo." };
  }
}

/**
 * Procesa la lógica de conversación y orquestación con Gemini
 */
export async function processWhatsAppMessage(
  whatsappId: string,
  messageText: string,
  media: MediaAttachment | null = null
): Promise<void> {
  console.log(`🤖 Bot WhatsApp: Procesando mensaje de [${whatsappId}]: "${messageText}" [Medio: ${media ? "Sí" : "No"}]`);

  // 1. Guardar mensaje recibido en el historial de BD
  await saveWhatsAppMessage(whatsappId, "INCOMING", media ? "image" : "text", messageText || `[Imagen: ${media?.filename || "adjunto"}]`);

  try {
    // 2. Evaluar Identidad del Usuario en base de datos
    const user = await prisma.user.findFirst({
      where: { whatsappId },
      include: { rootsType: true },
    });

    let systemInstruction = "";
    let isIdentified = false;
    let userName = "";
    let rootsTypeName = "";
    let userId = "";

    if (user) {
      isIdentified = true;
      userId = user.id;
      userName = user.name;
      rootsTypeName = user.rootsType?.name || "Sin Asignar";

      if (!user.consentGiven) {
        systemInstruction = `Eres el asistente conversacional oficial de Impulsar.
El usuario actual con el que hablas está identificado como ${user.name} (${user.email}), pero aún no ha otorgado su consentimiento para el tratamiento de datos sensibles.
- Solicita de manera muy atenta su confirmación/consentimiento explícito para el tratamiento de sus datos de extranjería y documentos personales.
- Pídele que responda 'Acepto' o 'Sí'.
- Si confirma que acepta en su respuesta, llama INMEDIATAMENTE a la herramienta \`vincularCorreo\` con su email exacto ${user.email} (lo cual registrará consentGiven: true en la base de datos de manera automática) y continúa la charla.
- Hasta que no haya aceptado, no le proporciones información de su progreso o citas.`;
      } else if (!user.rootsTypeId) {
        systemInstruction = `Eres el asistente conversacional oficial de Impulsar.
El usuario actual con el que hablas es un CLIENTE IDENTIFICADO del sistema, pero su expediente de extranjería específico aún no ha sido asignado por el gestor de la oficina.
- Nombre: ${userName} ${user.lastname || ""}
- Correo: ${user.email}
- Teléfono / WhatsApp: ${user.whatsappId}
- Expediente de extranjería asignado: Sin Asignar

Tu objetivo es informarle de forma muy cordial que su cuenta ya está vinculada, pero su expediente aún no ha sido asignado por el gestor de la oficina.
- Explícale de manera amigable que una vez que el gestor asocie y verifique el tipo de expediente correspondiente, tú comenzarás a guiarle paso a paso con los requisitos y documentos necesarios.
- Pídele amablemente que espere a que el gestor realice esta verificación.`;
      } else {
        systemInstruction = `Eres el asistente conversacional oficial de Impulsar.
El usuario actual con el que hablas es un CLIENTE IDENTIFICADO del sistema.
- Nombre: ${userName} ${user.lastname || ""}
- Correo: ${user.email}
- Teléfono / WhatsApp: ${user.whatsappId}
- Expediente de extranjería asignado: ${rootsTypeName}

Tu objetivo principal es asistirle amablemente sobre el progreso de su expediente y sus requisitos.
Si te saluda o hace preguntas generales, sé cálido, empático y conciso.
- Para consultar los documentos y requisitos aprobados, pendientes o rechazados, utiliza la herramienta \`consultarProgreso\`.
- Para consultar la fecha y hora de su cita, utiliza la herramienta \`obtenerFechaCita\`.
- Si el usuario te envía un documento o imagen, tú no lo guardas directamente aquí por texto, dile que lo estás analizando. El sistema te pedirá clasificarlo y validarlo.`;
      }
    } else {
      systemInstruction = `Eres el asistente conversacional oficial de Impulsar.
El usuario actual con el que hablas es un usuario ANÓNIMO (no registrado en el sistema con este número de WhatsApp).

Debes seguir estrictamente este flujo secuencial:
1. SOLICITAR CONSENTIMIENTO DE DATOS SENSIBLES: Explícale amablemente al iniciar la conversación que, de acuerdo con la LOPD/GDPR, para poder asistirle en sus trámites de extranjería y guardar sus documentos necesitamos su consentimiento explícito. Pídele que confirme respondiendo con un "Acepto" o "Sí".
   - Si no ha aceptado en el historial reciente, NO le solicites su correo ni ningún otro dato.
2. SOLICITAR CORREO ELECTRÓNICO: Una vez otorgado el consentimiento, pídele amablemente su correo electrónico.
   - Si el usuario proporciona un correo electrónico, llama INMEDIATAMENTE a la herramienta \`vincularCorreo\` con el parámetro de email.
3. REGISTRO DE NUEVO CLIENTE (si no existe):
   - Si la herramienta \`vincularCorreo\` indica que no existe el correo en el sistema, indícale cordialmente que no se preocupe y que registrarás su cuenta de inmediato.
   - Solicítale secuencialmente su Nombre y luego su(s) Apellido(s).
   - Una vez que tengas el correo, nombre y apellido(s), llama INMEDIATAMENTE a la herramienta \`registrarNuevoCliente\` con los parámetros correspondientes para crear su perfil (la contraseña se configurará por la web).
- No le ofrezcas consultas de citas ni progreso hasta que esté registrado/vinculado.`;
    }

    // 3. Recuperar historial conversacional (últimos 15 mensajes)
    const history = await getWhatsAppMessageHistory(whatsappId, 15);
    const contents: any[] = [];

    // Mapear historial en la estructura que espera el SDK de Gemini
    history.forEach((msg) => {
      // Ignorar el mensaje recién ingresado ya que lo añadiremos de último
      if (msg.id === history[history.length - 1]?.id && msg.direction === "INCOMING") return;

      contents.push({
        role: msg.direction === "INCOMING" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    });

    // 4. Preparar el mensaje actual (añadiendo la imagen/documento si existe)
    const currentParts: any[] = [{ text: messageText || "Analiza esta imagen adjunta." }];
    if (media) {
      currentParts.push({
        inlineData: {
          mimeType: media.mimeType,
          data: media.buffer.toString("base64"),
        },
      });
    }

    contents.push({
      role: "user",
      parts: currentParts,
    });

    // 5. Caso especial: El usuario está IDENTIFICADO y ha enviado un documento/imagen para validar
    if (isIdentified && media) {
      // Consultar pasos pendientes del cliente
      const pendingSteps = await prisma.userProcessProgress.findMany({
        where: {
          userId,
          status: { in: ["Pending", "Rejected"] }
        },
        include: { step: true }
      });

      if (pendingSteps.length > 0) {
        // Enriquecer la instrucción del sistema para que Gemini clasifique y valide
        const stepsFormatted = pendingSteps.map(ps => {
          let str = `- ID: ${ps.stepId} | Nombre: ${ps.step.name}`;
          if (ps.step.description) {
            str += ` | Requisito: ${ps.step.description}`;
          }
          if (ps.step.triggerCondition) {
            str += ` | Activador/Condición: ${ps.step.triggerCondition}`;
          }
          if (ps.step.geminiInstructions) {
            str += ` | Instrucciones de validación de la IA: ${ps.step.geminiInstructions}`;
          }
          return str;
        }).join("\n");

        systemInstruction += `\n\n⚠️ INSTRUCCIÓN DE CLASIFICACIÓN DE DOCUMENTO:
El cliente ha subido un archivo/imagen. Su expediente tiene los siguientes pasos PENDIENTES o RECHAZADOS:
${stepsFormatted}

Por favor:
1. Revisa detenidamente el documento/imagen adjunto.
2. Identifica si corresponde a alguno de los pasos pendientes de la lista superior comparando el tipo de documento con el nombre y la descripción de la expectativa.
3. Si corresponde a un paso pendiente y es válido (legible, no está vencido y corresponde a lo esperado):
   - Debes indicar al sistema de forma interna la aprobación llamando a la función \`guardarProgresoDocumento\` con el \`stepId\` correspondiente.
   - Responde al cliente de forma alegre indicándole que has identificado y subido con éxito su documento para ese paso.
4. Si corresponde a un paso pero NO es válido (borroso, recortado, vencido o incorrecto):
   - NO llames a la función de guardado.
   - Explícale amablemente al cliente por qué el documento no se acepta y qué debería corregir.
5. Si no corresponde a ninguno de los pasos pendientes, dile amablemente: 'He recibido tu documento, pero no parece corresponder a ninguno de los requisitos pendientes en tu expediente (${rootsTypeName}).'`;
      }
    }

    // Si es ANÓNIMO y envía un documento, le damos instrucciones a Gemini de hacer OCR proactivo
    if (!isIdentified && media) {
      systemInstruction += `\n\n⚠️ INSTRUCCIÓN DE DOCUMENTO ANÓNIMO (OCR Proactivo):
El usuario ha enviado un documento pero es ANÓNIMO.
1. Analiza el documento adjunto.
2. Extrae cualquier nombre de persona, DNI, NIE, Pasaporte o datos identificativos visibles.
3. Respóndele: 'He detectado un documento a nombre de [Nombre extraído]. Para poder subirlo y asociarlo a tu expediente, por favor proporcióname el correo electrónico con el que estás registrado en Impulsar.'
4. Si no logras leer ningún nombre, pídele de manera amable que primero proporcione su correo para identificarlo.`;
    }

    // 6. Configurar las funciones que Gemini puede ejecutar
    const tools: any = [
      {
        functionDeclarations: [
          ...whatsappToolsDeclarations,
          {
            name: "guardarProgresoDocumento",
            description: "Registra y sube el documento aprobado para un paso específico del expediente del cliente en la base de datos.",
            parameters: {
              type: "OBJECT",
              properties: {
                stepId: {
                  type: "INTEGER",
                  description: "El ID numérico del paso pendiente al que corresponde el documento.",
                },
              },
              required: ["stepId"],
            },
          },
        ],
      },
    ];

    // 7. Llamar a Gemini y procesar el bucle de Function Calling
    console.log("⚡ Enviando contexto a Gemini...");
    let response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction,
        tools,
      },
    });

    let finalText = response.text || "";

    // Bucle de ejecución de herramientas (si Gemini solicita invocar alguna función)
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      const name = call.name || "";
      const args: any = call.args || {};

      let toolResultText = "";

      if (name === "guardarProgresoDocumento") {
        // Ejecución especial de guardado físico y de base de datos
        if (isIdentified && media) {
          const stepId = Number(args.stepId);
          const saveResult = await handleSaveDocument(userId, stepId, media);
          
          if (saveResult.success) {
            toolResultText = `Éxito: El documento para el paso con ID ${stepId} ha sido guardado físicamente y registrado como 'Uploaded' en la base de datos para el usuario ${userName}.`;
          } else {
            toolResultText = `Fallo: No se pudo guardar el archivo. Detalle: ${saveResult.message}`;
          }
        } else {
          toolResultText = "Fallo: No se puede guardar progreso de documento para un usuario anónimo o sin adjunto físico.";
        }
      } else if (name) {
        // Ejecución de herramientas estándar (consultar progreso, citas, vincular correo)
        toolResultText = await executeWhatsAppTool(name, args, { whatsappId });
      }

      console.log(`📝 Resultado de la función [${name}]:`, toolResultText);

      // Enviar el resultado de la función de vuelta a Gemini para que elabore la respuesta final al cliente
      const toolResponseContents = [
        ...contents,
        response.candidates?.[0]?.content, // La petición de Gemini de llamar a la función
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name,
                response: { result: toolResultText },
              },
            },
          ],
        },
      ];

      const finalResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: toolResponseContents,
        config: {
          systemInstruction,
        },
      });

      finalText = finalResponse.text || "";
    }

    // 8. Enviar respuesta final al cliente por WhatsApp y guardar en historial de BD
    if (finalText) {
      console.log(`✉️ Enviando respuesta de WhatsApp: "${finalText}"`);
      await sendWhatsAppTextMessage(whatsappId, finalText);
      await saveWhatsAppMessage(whatsappId, "OUTGOING", "text", finalText);
    }

  } catch (error) {
    console.error("❌ Error en el flujo conversacional del bot de WhatsApp:", error);
    const errorMsg = "Lo siento, tuve un problema al procesar tu mensaje. Por favor, inténtalo de nuevo en unos momentos.";
    await sendWhatsAppTextMessage(whatsappId, errorMsg);
    await saveWhatsAppMessage(whatsappId, "OUTGOING", "text", errorMsg);
  }
}
