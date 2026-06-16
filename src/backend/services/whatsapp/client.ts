import dotenv from "dotenv";
dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const API_VERSION = "v21.0";

/**
 * Envia un mensaje de texto plano a un número de WhatsApp
 */
export async function sendWhatsAppTextMessage(to: string, text: string): Promise<boolean> {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.warn("⚠️ WhatsApp Client: WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID no configurados.");
    return false;
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: {
          preview_url: false,
          body: text,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("❌ Error enviando mensaje de WhatsApp:", data);
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Error de red en sendWhatsAppTextMessage:", error);
    return false;
  }
}

interface WhatsAppMediaInfo {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

/**
 * Obtiene la información y descarga el archivo desde Meta API a memoria (Buffer)
 */
export async function downloadWhatsAppMedia(mediaId: string): Promise<WhatsAppMediaInfo | null> {
  if (!WHATSAPP_TOKEN) {
    console.warn("⚠️ WhatsApp Client: WHATSAPP_TOKEN no configurado.");
    return null;
  }

  try {
    // 1. Obtener los metadatos del medio para extraer la URL de descarga
    const metadataUrl = `https://graph.facebook.com/${API_VERSION}/${mediaId}`;
    const metadataResponse = await fetch(metadataUrl, {
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      },
    });

    const metadata = await metadataResponse.json();
    if (!metadataResponse.ok || !metadata.url) {
      console.error("❌ Error obteniendo metadatos del medio:", metadata);
      return null;
    }

    const downloadUrl = metadata.url;
    const mimeType = metadata.mime_type || "application/octet-stream";
    const filename = metadata.sha256 ? `${metadata.sha256}.${mimeType.split("/")[1] || "bin"}` : "media.bin";

    // 2. Descargar los bytes binarios del archivo al vuelo
    const mediaResponse = await fetch(downloadUrl, {
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      },
    });

    if (!mediaResponse.ok) {
      console.error("❌ Error descargando el archivo desde Meta:", mediaResponse.statusText);
      return null;
    }

    const arrayBuffer = await mediaResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      buffer,
      mimeType,
      filename,
    };
  } catch (error) {
    console.error("❌ Error en downloadWhatsAppMedia:", error);
    return null;
  }
}
