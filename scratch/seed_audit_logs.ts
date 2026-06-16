import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL variable de entorno no configurada");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Comenzando la creación de logs de auditoría...");

  // Buscar usuarios
  const adminCarlos = await prisma.user.findFirst({
    where: { email: "admin.carlos@impulsar.com" }
  });
  const adminYodier = await prisma.user.findFirst({
    where: { email: "yodiermurillo@gmail.com" }
  });
  const userAlejandro = await prisma.user.findFirst({
    where: { email: "alejandro.gomez@gmail.com" }
  });
  const userMaria = await prisma.user.findFirst({
    where: { email: "m.torres@outlook.com" }
  });

  if (!adminCarlos || !adminYodier || !userAlejandro || !userMaria) {
    console.error("No se encontraron los usuarios requeridos. Por favor, asegúrate de correr el seed de base de datos primero.");
    return;
  }

  // Limpiar logs existentes
  await prisma.auditLog.deleteMany({});

  // Crear logs de prueba
  const logs = [
    {
      action: "ASSIGN_ROOTS_TYPE",
      entityType: "User",
      entityId: userAlejandro.id,
      performedByUserId: adminCarlos.id,
      clientUserId: userAlejandro.id,
      oldValues: JSON.stringify({ rootsTypeId: null }),
      newValues: JSON.stringify({ rootsTypeId: userAlejandro.rootsTypeId }),
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // hace 4 horas
    },
    {
      action: "UPLOAD_PASSPORT",
      entityType: "User",
      entityId: userAlejandro.id,
      performedByUserId: adminYodier.id,
      clientUserId: userAlejandro.id,
      oldValues: JSON.stringify({ passportUrl: null, passportStatus: "Pending" }),
      newValues: JSON.stringify({ passportUrl: "/uploads/alejandro/passport.pdf", passportStatus: "Uploaded" }),
      createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000) // hace 3.5 horas
    },
    {
      action: "VALIDATE_STEP",
      entityType: "UserProcessProgress",
      entityId: "1",
      performedByUserId: adminCarlos.id,
      clientUserId: userAlejandro.id,
      oldValues: JSON.stringify({ status: "Uploaded" }),
      newValues: JSON.stringify({ status: "Approved", adminComments: null }),
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // hace 3 horas
    },
    {
      action: "VALIDATE_STEP",
      entityType: "UserProcessProgress",
      entityId: "2",
      performedByUserId: adminCarlos.id,
      clientUserId: userAlejandro.id,
      oldValues: JSON.stringify({ status: "Uploaded" }),
      newValues: JSON.stringify({ status: "Rejected", adminComments: "La nómina aportada corresponde al año anterior." }),
      createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000) // hace 2.5 horas
    },
    {
      action: "ASSIGN_ROOTS_TYPE",
      entityType: "User",
      entityId: userMaria.id,
      performedByUserId: adminCarlos.id,
      clientUserId: userMaria.id,
      oldValues: JSON.stringify({ rootsTypeId: null }),
      newValues: JSON.stringify({ rootsTypeId: userMaria.rootsTypeId }),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // hace 2 horas
    },
    {
      action: "UPDATE_CLIENT_DETAILS",
      entityType: "User",
      entityId: userMaria.id,
      performedByUserId: adminYodier.id,
      clientUserId: userMaria.id,
      oldValues: JSON.stringify({ driveFolderUrl: null }),
      newValues: JSON.stringify({ driveFolderUrl: "https://drive.google.com/drive/folders/maria_torres" }),
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // hace 1 hora
    }
  ];

  for (const log of logs) {
    await prisma.auditLog.create({
      data: log
    });
  }

  console.log("Logs de auditoría creados exitosamente! ✨");
}

main()
  .catch((e) => {
    console.error("Error al crear logs de auditoría:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
