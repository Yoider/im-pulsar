import { PrismaClient } from "../../../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Guarda un mensaje en el historial de chat de la base de datos
 */
export async function saveWhatsAppMessage(
  whatsappId: string,
  direction: "INCOMING" | "OUTGOING",
  type: "text" | "image",
  content: string
) {
  try {
    return await prisma.whatsAppMessage.create({
      data: {
        whatsappId,
        direction,
        type,
        content,
      },
    });
  } catch (error) {
    console.error("❌ Error guardando mensaje en la base de datos:", error);
    return null;
  }
}

/**
 * Obtiene los últimos N mensajes del historial conversacional ordenados cronológicamente
 */
export async function getWhatsAppMessageHistory(whatsappId: string, takeN = 10) {
  try {
    const rawMessages = await prisma.whatsAppMessage.findMany({
      where: { whatsappId },
      orderBy: { createdAt: "desc" },
      take: takeN,
    });
    // Invertimos el orden para que quede de más antiguo a más reciente (cronológico ascendente)
    return rawMessages.reverse();
  } catch (error) {
    console.error("❌ Error obteniendo historial de mensajes:", error);
    return [];
  }
}
