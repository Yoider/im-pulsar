import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL variable de entorno no configurada");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const suffixMap: { [key: string]: string } = {
  "nacionalidad española": "Nacionalidad Española",
  "socioformativo": "Arraigo Socioformativo",
  "sociolaboral": "Arraigo Sociolaboral",
  "social": "Arraigo Social",
  "estancia de estudio": "Estancia de Estudio",
  "renovación residencia y trabajo": "Renovación Residencia y Trabajo",
  "reagrupación familiar de español": "Reagrupación Familiar de Español"
};

async function main() {
  console.log("Comenzando el semillado de datos...");

  // Limpiar tablas existentes en orden inverso de dependencias
  console.log("Limpiando base de datos...");
  await prisma.auditLog.deleteMany({});
  await prisma.userProcessProgress.deleteMany({});
  await prisma.rootsTypesSteps.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.step.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.rootsType.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.statusConfig.deleteMany({});

  console.log("Creando roles...");
  const roleClient = await prisma.role.create({ data: { name: "client" } });
  const roleAdmin = await prisma.role.create({ data: { name: "admin" } });

  console.log("Creando configuraciones de estado...");
  await prisma.statusConfig.createMany({
    data: [
      { id: "Pending", label: "Pendiente", color: "#FEF3C7", textColor: "#D97706" }, // Amber
      { id: "Uploaded", label: "Subido", color: "#DBEAFE", textColor: "#2563EB" },   // Blue
      { id: "Approved", label: "Aprobado", color: "#D1FAE5", textColor: "#059669" }, // Emerald
      { id: "Rejected", label: "Rechazado", color: "#FEE2E2", textColor: "#DC2626" }   // Red
    ]
  });

  // 1. Crear trámites base requeridos por los tests E2E
  console.log("Creando tipos de trámite base...");
  const processPersonal = await prisma.rootsType.create({ data: { name: "Regularización de Cuenta Personal" } });
  const processExpress = await prisma.rootsType.create({ data: { name: "Regularización Comercial Express" } });

  // 2. Crear pasos del catálogo base requeridos por los tests E2E
  console.log("Creando catálogo de pasos base...");
  const step1 = await prisma.step.create({ data: { name: "Documento de Identidad (DNI/NIE/Pasaporte)" } });
  const step2 = await prisma.step.create({ data: { name: "Justificante de Ingresos (Nómina Reciente)" } });
  const step3 = await prisma.step.create({ data: { name: "Contrato de Adhesión Firmado" } });
  const step4 = await prisma.step.create({ data: { name: "ID de Contacto de WhatsApp" } });
  const step5 = await prisma.step.create({ data: { name: "Escritura de Constitución" } });

  console.log("Asociando pasos base a trámites...");
  // Personal
  await prisma.rootsTypesSteps.create({ data: { rootsTypeId: processPersonal.id, stepId: step1.id, isMandatory: true, shortOrder: 1 } });
  await prisma.rootsTypesSteps.create({ data: { rootsTypeId: processPersonal.id, stepId: step2.id, isMandatory: true, shortOrder: 2 } });
  await prisma.rootsTypesSteps.create({ data: { rootsTypeId: processPersonal.id, stepId: step3.id, isMandatory: true, shortOrder: 3 } });
  await prisma.rootsTypesSteps.create({ data: { rootsTypeId: processPersonal.id, stepId: step4.id, isMandatory: false, shortOrder: 4 } });

  // Express
  await prisma.rootsTypesSteps.create({ data: { rootsTypeId: processExpress.id, stepId: step1.id, isMandatory: true, shortOrder: 1 } });
  await prisma.rootsTypesSteps.create({ data: { rootsTypeId: processExpress.id, stepId: step5.id, isMandatory: true, shortOrder: 2 } });
  await prisma.rootsTypesSteps.create({ data: { rootsTypeId: processExpress.id, stepId: step3.id, isMandatory: true, shortOrder: 3 } });
  await prisma.rootsTypesSteps.create({ data: { rootsTypeId: processExpress.id, stepId: step4.id, isMandatory: false, shortOrder: 4 } });

  console.log("Creando usuarios de prueba base...");
  const adminCarlosPassword = await bcrypt.hash("admin_secure_password", 10);
  const adminYodierPassword = await bcrypt.hash("yoi1234", 10);
  const userAlejandroPassword = await bcrypt.hash("user_secure_password", 10);
  const userMariaPassword = await bcrypt.hash("user_secure_password_2", 10);

  const adminCarlos = await prisma.user.create({
    data: {
      name: "Carlos",
      lastname: "Validador",
      email: "admin.carlos@impulsar.com",
      password: adminCarlosPassword,
      whatsappId: "+34 600 000 000",
      roleId: roleAdmin.id,
      rootsTypeId: processPersonal.id
    }
  });

  const adminYodier = await prisma.user.create({
    data: {
      name: "Yodier",
      lastname: "Murillo",
      email: "yodiermurillo@gmail.com",
      password: adminYodierPassword,
      whatsappId: "+34 600 111 222",
      roleId: roleAdmin.id,
      rootsTypeId: processPersonal.id
    }
  });

  const userAlejandro = await prisma.user.create({
    data: {
      name: "Alejandro",
      lastname: "Gómez",
      email: "alejandro.gomez@gmail.com",
      password: userAlejandroPassword,
      whatsappId: "+34 612 345 678",
      roleId: roleClient.id,
      rootsTypeId: processPersonal.id
    }
  });

  const userMaria = await prisma.user.create({
    data: {
      name: "María",
      lastname: "Torres",
      email: "m.torres@outlook.com",
      password: userMariaPassword,
      whatsappId: "+34 699 888 777",
      roleId: roleClient.id,
      rootsTypeId: processExpress.id
    }
  });

  // Progreso inicial para Alejandro
  const docDniAlejandro = await prisma.document.create({
    data: { name: "dni_alejandro_frontal.pdf", extension: "pdf", url: "/mock/dni_alejandro_frontal.pdf" }
  });
  await prisma.userProcessProgress.create({
    data: { userId: userAlejandro.id, stepId: step1.id, documentId: docDniAlejandro.id, status: "Approved", validatedByUserId: adminCarlos.id }
  });
  const docNominaAlejandro = await prisma.document.create({
    data: { name: "nomina_antigua_2024.pdf", extension: "pdf", url: "/mock/nomina_antigua_2024.pdf" }
  });
  await prisma.userProcessProgress.create({
    data: { userId: userAlejandro.id, stepId: step2.id, documentId: docNominaAlejandro.id, status: "Rejected", adminComments: "La nómina es antigua.", validatedByUserId: adminCarlos.id }
  });
  await prisma.userProcessProgress.create({ data: { userId: userAlejandro.id, stepId: step3.id, status: "Pending" } });
  await prisma.userProcessProgress.create({ data: { userId: userAlejandro.id, stepId: step4.id, status: "Uploaded", value: "+34 612 345 678" } });

  // Progreso inicial para María
  const docDniMaria = await prisma.document.create({
    data: { name: "dni_maria_completo.pdf", extension: "pdf", url: "/mock/dni_maria_completo.pdf" }
  });
  await prisma.userProcessProgress.create({ data: { userId: userMaria.id, stepId: step1.id, documentId: docDniMaria.id, status: "Uploaded" } });
  await prisma.userProcessProgress.create({ data: { userId: userMaria.id, stepId: step5.id, status: "Pending" } });
  await prisma.userProcessProgress.create({ data: { userId: userMaria.id, stepId: step3.id, status: "Pending" } });
  await prisma.userProcessProgress.create({ data: { userId: userMaria.id, stepId: step4.id, status: "Pending" } });


  // 3. EScanear y poblar dinámicamente desde "expedientes de arraigo"
  const baseDir = path.join(__dirname, "..", "expedientes de arraigo");
  console.log(`Buscando expedientes en: ${baseDir}`);

  if (fs.existsSync(baseDir)) {
    const folders = fs.readdirSync(baseDir);
    const clientPasswordHash = await bcrypt.hash("user_secure_password", 10);

    for (const folderName of folders) {
      const folderPath = path.join(baseDir, folderName);
      if (!fs.statSync(folderPath).isDirectory()) continue;

      console.log(`Procesando carpeta: ${folderName}`);

      // Identificar tipo de expediente a partir del sufijo de la carpeta
      let matchedSuffix = "";
      let rootsTypeName = "Arraigo General"; // fallback

      for (const suffix of Object.keys(suffixMap)) {
        if (folderName.toLowerCase().endsWith(suffix)) {
          matchedSuffix = suffix;
          rootsTypeName = suffixMap[suffix];
          break;
        }
      }

      // Obtener el nombre del cliente eliminando el número del inicio y el sufijo
      let clientFullName = folderName;
      if (matchedSuffix) {
        clientFullName = folderName.slice(0, folderName.toLowerCase().lastIndexOf(matchedSuffix)).trim();
      }
      // Quitar número inicial (ej. "1 ADRIAN" -> "ADRIAN")
      clientFullName = clientFullName.replace(/^\d+\s+/, "").trim();

      if (!clientFullName) continue;

      // Dividir en nombre y apellido
      const nameParts = clientFullName.split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      // Crear/Recuperar el tipo de expediente
      const rootsType = await prisma.rootsType.upsert({
        where: { name: rootsTypeName },
        update: {},
        create: { name: rootsTypeName, description: `Trámite de ${rootsTypeName} gestionado por Impulsar.` }
      });

      // Crear el correo del cliente (evitando colisión con yodiermurillo@gmail.com)
      const cleanName = firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cleanLast = lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".");
      let clientEmail = `${cleanName}.${cleanLast || "client"}@gmail.com`;

      if (clientEmail.includes("yodiermurillo")) {
        clientEmail = "yoider.client@gmail.com";
      }

      // Crear el cliente en la BD
      const clientUser = await prisma.user.upsert({
        where: { email: clientEmail },
        update: {
          rootsTypeId: rootsType.id
        },
        create: {
          name: firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase(),
          lastname: lastName ? lastName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") : null,
          email: clientEmail,
          password: clientPasswordHash,
          whatsappId: "+34 600 999 888",
          roleId: roleClient.id,
          rootsTypeId: rootsType.id
        }
      });

      console.log(`👤 Cliente creado/actualizado: ${clientUser.name} ${clientUser.lastname || ""} (${clientEmail}) -> Trámite: ${rootsTypeName}`);

      // Leer archivos dentro de la carpeta del expediente
      const files = fs.readdirSync(folderPath);
      let order = 1;

      for (const filename of files) {
        const filePath = path.join(folderPath, filename);
        if (fs.statSync(filePath).isDirectory()) continue;

        const fileExt = path.extname(filename).replace(".", "").toLowerCase() || "pdf";
        const stepName = path.basename(filename, path.extname(filename)).toUpperCase();

        // 1. Crear el paso en el catálogo
        const step = await prisma.step.create({
          data: {
            name: stepName.charAt(0) + stepName.slice(1).toLowerCase(),
            description: `Aportar el documento ${stepName.toLowerCase()}.`
          }
        });

        // 2. Asociar el paso al tipo de expediente del cliente
        await prisma.rootsTypesSteps.upsert({
          where: {
            rootsTypeId_stepId: {
              rootsTypeId: rootsType.id,
              stepId: step.id
            }
          },
          update: {},
          create: {
            rootsTypeId: rootsType.id,
            stepId: step.id,
            isMandatory: true,
            shortOrder: order++
          }
        });

        // 3. Crear el documento adjunto físico
        const document = await prisma.document.create({
          data: {
            name: filename,
            extension: fileExt,
            url: `/mock/expedientes_de_arraigo/${folderName}/${filename}`
          }
        });

        // 4. Crear el progreso y marcarlo como aprobado para este cliente
        // Puesto que ya tenemos los archivos físicos, los marcamos como "Approved"
        await prisma.userProcessProgress.create({
          data: {
            userId: clientUser.id,
            stepId: step.id,
            documentId: document.id,
            status: "Approved",
            validatedByUserId: adminCarlos.id
          }
        });
      }
    }
  } else {
    console.log("⚠️ La carpeta 'expedientes de arraigo' no existe en la raíz.");
  }

  console.log("Semillado de datos completado con éxito! ✨");
}

main()
  .catch((e) => {
    console.error("Error durante el semillado:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
