import { PrismaClient } from "../../../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Definición de las declaraciones de funciones para Gemini SDK
export const whatsappToolsDeclarations = [
  {
    name: "consultarProgreso",
    description: "Consulta el progreso general y los requisitos de documentos del cliente asociado a esta conversación. Úsala cuando el usuario pregunte por sus documentos, requisitos pendientes o avance.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "obtenerFechaCita",
    description: "Consulta la fecha y hora de la cita programada para el trámite del cliente. Úsala cuando el usuario pregunte cuándo es su cita.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "vincularCorreo",
    description: "Asocia el correo electrónico del cliente para identificarlo en el sistema. Úsala cuando un usuario no identificado o semi-identificado provea su correo electrónico para vincular su cuenta.",
    parameters: {
      type: "OBJECT",
      properties: {
        email: {
          type: "STRING",
          description: "El correo electrónico exacto provisto por el usuario (ej: juan.perez@gmail.com).",
        },
      },
      required: ["email"],
    },
  },
  {
    name: "registrarNuevoCliente",
    description: "Registra un nuevo perfil de cliente en el sistema desde WhatsApp. Se llama cuando el correo provisto no está en la base de datos y ya tenemos su nombre y apellidos.",
    parameters: {
      type: "OBJECT",
      properties: {
        email: {
          type: "STRING",
          description: "El correo electrónico del cliente (ej: juan.perez@gmail.com).",
        },
        name: {
          type: "STRING",
          description: "El nombre del cliente.",
        },
        lastname: {
          type: "STRING",
          description: "El apellido o apellidos del cliente.",
        },
      },
      required: ["email", "name", "lastname"],
    },
  },
];

/**
 * Ejecutor de las funciones llamadas por Gemini
 */
export async function executeWhatsAppTool(
  name: string,
  args: any,
  context: { whatsappId: string }
): Promise<string> {
  const { whatsappId } = context;
  console.log(`🔧 Ejecutando herramienta de Gemini [${name}] para whatsappId: ${whatsappId}`, args);

  try {
    switch (name) {
      case "consultarProgreso": {
        // Buscar el usuario por su whatsappId
        const user = await prisma.user.findFirst({
          where: { whatsappId },
          include: {
            rootsType: true,
            progressList: {
              include: {
                step: true,
              },
            },
          },
        });

        if (!user) {
          return "No estás registrado en el sistema. Por favor, proporciona tu correo electrónico para que pueda vincular tu cuenta.";
        }

        const rootsType = user.rootsType;
        if (!rootsType) {
          return `Hola ${user.name}, veo que estás registrado pero aún no tienes ningún tipo de expediente asignado. Por favor, contacta con un administrador.`;
        }

        // Obtener los pasos asociados a este trámite para conocer la estructura y el orden
        const rootsTypesSteps = await prisma.rootsTypesSteps.findMany({
          where: { rootsTypeId: rootsType.id },
          include: { step: true },
          orderBy: { shortOrder: "asc" },
        });

        if (rootsTypesSteps.length === 0) {
          return `Hola ${user.name}, tu expediente (${rootsType.name}) no tiene pasos configurados en este momento.`;
        }

        // Mapear el estado del progreso de cada paso
        let responseText = `Hola ${user.name}. Aquí tienes el estado de tu expediente: *${rootsType.name}*.\n\n`;
        
        let approvedCount = 0;
        const totalSteps = rootsTypesSteps.length;

        rootsTypesSteps.forEach((rts) => {
          const progress = user.progressList.find((p) => p.stepId === rts.stepId);
          const status = progress?.status || "Pending";
          
          let statusLabel = "⏳ Pendiente de subir";
          if (status === "Uploaded") statusLabel = "📤 Subido (En revisión)";
          if (status === "Approved") {
            statusLabel = "✅ Aprobado";
            approvedCount++;
          }
          if (status === "Rejected") statusLabel = "❌ Rechazado";

          responseText += `• *${rts.step.name}*: ${statusLabel}\n`;
          if (progress?.adminComments) {
            responseText += `  _Nota de validador: ${progress.adminComments}_\n`;
          }
        });

        const percentage = Math.round((approvedCount / totalSteps) * 100);
        responseText += `\n*Progreso General*: ${approvedCount}/${totalSteps} pasos aprobados (${percentage}%).`;
        return responseText;
      }

      case "obtenerFechaCita": {
        const user = await prisma.user.findFirst({
          where: { whatsappId },
        });

        if (!user) {
          return "No estás registrado en el sistema. Por favor, proporciona tu correo electrónico para vincular tu cuenta.";
        }

        if (!user.appointmentDate) {
          return `Hola ${user.name}, actualmente no tienes ninguna cita de extranjería registrada en el sistema.`;
        }

        const dateStr = new Date(user.appointmentDate).toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return `Hola ${user.name}, tu cita programada está confirmada para el: *${dateStr}*. Por favor, asegúrate de llevar todos tus documentos aprobados impresos.`;
      }

      case "vincularCorreo": {
        const email = (args.email || "").trim().toLowerCase();
        if (!email) {
          return "Por favor, proporciona un correo electrónico válido.";
        }

        // Buscar al usuario por correo electrónico
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return `No encontré ningún registro asociado al correo *${email}* en nuestra base de datos. Por favor, verifícalo y vuelve a escribirlo.`;
        }

        const oldWhatsappId = user.whatsappId;

        // Caso de colisión: El correo ya tiene otro whatsappId asignado
        if (oldWhatsappId && oldWhatsappId !== whatsappId) {
          // Actualizar la identidad
          await prisma.user.update({
            where: { id: user.id },
            data: { whatsappId, consentGiven: true },
          });

          // Registrar en la bitácora de auditoría
          await prisma.auditLog.create({
            data: {
              action: "UPDATE_CLIENT_DETAILS",
              entityType: "User",
              entityId: user.id,
              clientUserId: user.id,
              oldValues: JSON.stringify({ whatsappId: oldWhatsappId, consentGiven: user.consentGiven }),
              newValues: JSON.stringify({ whatsappId, consentGiven: true }),
            },
          });

          return `¡Hola ${user.name}! Tu cuenta de WhatsApp ha sido vinculada con éxito a este correo (*${email}*).\n\n⚠️ *Aviso de seguridad*: El número anterior vinculado (${oldWhatsappId}) ha sido reemplazado por tu número actual. Ya puedes consultarme sobre tu progreso o tu cita.`;
        }

        // Caso normal: No tiene whatsappId o es el mismo
        if (oldWhatsappId === whatsappId) {
          if (!user.consentGiven) {
            await prisma.user.update({
              where: { id: user.id },
              data: { consentGiven: true },
            });
          }
          return `¡Hola ${user.name}! Tu cuenta ya estaba correctamente vinculada a este correo (*${email}*). ¿En qué más puedo ayudarte hoy?`;
        }

        // Si no tenía whatsappId previo
        await prisma.user.update({
          where: { id: user.id },
          data: { whatsappId, consentGiven: true },
        });

        // Registrar en auditoría
        await prisma.auditLog.create({
          data: {
            action: "UPDATE_CLIENT_DETAILS",
            entityType: "User",
            entityId: user.id,
            clientUserId: user.id,
            oldValues: JSON.stringify({ whatsappId: null, consentGiven: user.consentGiven }),
            newValues: JSON.stringify({ whatsappId, consentGiven: true }),
          },
        });

        return `¡Perfecto ${user.name}! He vinculado tu WhatsApp con éxito al correo *${email}*. Ya puedes consultarme sobre tu progreso general o la fecha de tu cita.`;
      }

      case "registrarNuevoCliente": {
        const email = (args.email || "").trim().toLowerCase();
        const name = (args.name || "").trim();
        const lastname = (args.lastname || "").trim();

        if (!email || !name) {
          return "Fallo: El correo electrónico y el nombre son obligatorios para el registro.";
        }

        // Verificar de nuevo si el correo ya existe
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return `Fallo: El correo *${email}* ya se encuentra registrado en la base de datos.`;
        }

        // Buscar el rol de cliente
        const role = await prisma.role.findFirst({
          where: { name: "client" },
        });

        // Crear el nuevo usuario sin contraseña y con consentimiento activo
        const newUser = await prisma.user.create({
          data: {
            name,
            lastname,
            email,
            whatsappId,
            consentGiven: true,
            roleId: role?.id,
          },
        });

        // Registrar en auditoría
        await prisma.auditLog.create({
          data: {
            action: "UPDATE_CLIENT_DETAILS",
            entityType: "User",
            entityId: newUser.id,
            clientUserId: newUser.id,
            oldValues: "{}",
            newValues: JSON.stringify({
              name,
              lastname,
              email,
              whatsappId,
              consentGiven: true,
              roleId: role?.id,
            }),
          },
        });

        return `Éxito: Se ha creado correctamente la cuenta para *${name} ${lastname}* con el correo *${email}* y número de WhatsApp *${whatsappId}*. Se ha otorgado el consentimiento de tratamiento de datos.`;
      }

      default:
        return `Lo siento, la herramienta ${name} no está implementada en el backend.`;
    }
  } catch (error) {
    console.error(`❌ Error ejecutando la herramienta ${name}:`, error);
    return "Ocurrió un error al intentar consultar los datos. Por favor, vuelve a intentarlo más tarde.";
  }
}
