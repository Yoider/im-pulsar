import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { downloadWhatsAppMedia } from "@/backend/services/whatsapp/client";
import { processWhatsAppMessage } from "@/backend/services/whatsapp/flow";

dotenv.config();

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "impulsar_webhook_verify_secure_token_2026";

/**
 * GET Handler: Handshake de verificación inicial de Meta
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("🟢 Webhook de WhatsApp: Verificado con éxito.");
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    } else {
      console.warn("❌ Webhook de WhatsApp: Token de verificación incorrecto o inválido.");
      return new Response("Forbidden", { status: 403 });
    }
  } catch (error) {
    console.error("❌ Error en GET Webhook WhatsApp:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

/**
 * POST Handler: Receptor de mensajes de WhatsApp
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📥 Webhook WhatsApp recibido:", JSON.stringify(body, null, 2));

    // Validar que el objeto corresponda a una cuenta de WhatsApp Business
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];

      if (message) {
        const from = message.from; // Número del remitente (whatsappId)
        const type = message.type; // "text", "image", "document", etc.
        let text = message.text?.body || "";
        let mediaId = "";
        let originalFilename = "archivo.bin";

        // Determinar si hay un adjunto multimedia
        if (type === "image") {
          mediaId = message.image?.id;
          originalFilename = `imagen_${mediaId}.jpg`;
        } else if (type === "document") {
          mediaId = message.document?.id;
          originalFilename = message.document?.filename || `documento_${mediaId}.pdf`;
        }

        // Descargar el medio de forma asíncrona pero antes de despachar el hilo secundario
        let mediaInfo: { buffer: Buffer; mimeType: string; filename: string } | null = null;
        if (mediaId) {
          console.log(`📥 Descargando medio temporal con ID: ${mediaId}`);
          const downloaded = await downloadWhatsAppMedia(mediaId);
          if (downloaded) {
            mediaInfo = {
              buffer: downloaded.buffer,
              mimeType: downloaded.mimeType,
              filename: downloaded.filename || originalFilename,
            };
          }
        }

        // Despachar el flujo de respuesta de forma totalmente ASÍNCRONA
        // para responder con 200 OK inmediatamente a Meta y evitar reintentos por latencia de Gemini
        processWhatsAppMessage(from, text, mediaInfo).catch((err) => {
          console.error(`❌ Error en el procesamiento asíncrono para ${from}:`, err);
        });
      }

      // Responder con 200 de inmediato
      return new Response("EVENT_RECEIVED", { status: 200 });
    } else {
      return new Response("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error("❌ Error de procesamiento en POST Webhook WhatsApp:", error);
    // Devolvemos 200 para evitar que Meta insista con reintentos si el webhook falló por parseo interno
    return new Response("EVENT_RECEIVED", { status: 200 });
  }
}
