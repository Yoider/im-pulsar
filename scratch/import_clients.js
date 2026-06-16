const { PrismaClient } = require('../src/generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const srcRootDir = 'd:\\DEV\\AuthSndr\\ImpulsarPage\\expedientes de arraigo';
const uploadsBaseDir = 'd:\\DEV\\AuthSndr\\ImpulsarPage\\public\\uploads';

const clientsSpec = [
  {
    folderName: "1 ADRIAN RABELLA nacionalidad española",
    name: "Adrián Ariel",
    lastname: "Rabella",
    email: "adrian.ariel.rabella@gmail.com",
    whatsappId: "+34 699353535",
    rootsTypeName: "Nacionalidad Española",
    passportFile: "PASAPORTE.pdf",
    driveFolderUrl: null,
    appointmentDate: null,
    registrationMonth: "2025-10",
    filesMap: {
      "NIE.pdf": "Documento de Identidad (DNI/NIE/Pasaporte)",
      "ANTECEDENTESPENALESARGENTINA.pdf": "Antecedentes Penales de Origen",
      "ANTECEDENTESPENALESESPAÑA.pdf": "Antecedentes Penales de España",
      "CERTIFICADOCCSE.pdf": "Certificado de Prueba CCSE",
      "REGISTROCIVIL.pdf": "Certificado de Registro Civil",
      "RESGUARDO SOLICITUD NACIONALIDAD.pdf": "Resguardo de Solicitud de Nacionalidad",
      "TASAS formulario-790-026_.pdf": "Tasas del Expediente"
    }
  },
  {
    folderName: "2 MARIA ISABEL LLANOS socioformativo",
    name: "María Isabel",
    lastname: "Llanos Hinostroza",
    email: "maria.isabel.llanos@gmail.com",
    whatsappId: "+34 600 222 333",
    rootsTypeName: "Arraigo Socioformativo",
    passportFile: null,
    driveFolderUrl: null,
    appointmentDate: new Date("2026-06-25"),
    registrationMonth: "2025-10",
    filesMap: {
      "17-Formulario_TIE.pdf": "Formulario EX17 Solicitud TIE",
      "2  MARIA ISABEL LLANOS HINOSTROZA RESOLUCION CONCESION.pdf": "Resolución de Concesión de Residencia",
      "CITA HUELLAS EXTRANJERÍA.pdf": "Cita para Huellas de Extranjería",
      "Justificante de Presentación REG-4.pdf": "Justificante de Presentación de Trámite",
      "MATRICULA ISABEL LLANOS.pdf": "Matrícula o Certificado de Estudios",
      "RESGUARDO DE TARJETA DE EXTRANJERO.pdf": "Resguardo de Solicitud de Tarjeta",
      "TASAS 790.pdf": "Tasas del Expediente"
    }
  },
  {
    folderName: "36 ANAIS PILIN AMBULIA MANZANO reagrupación familiar de español",
    name: "Anais Pilin",
    lastname: "Ambulia Manzano",
    email: "anais.ambulia@gmail.com",
    whatsappId: "+34 600 333 444",
    rootsTypeName: "Reagrupación Familiar de Español",
    passportFile: "4 PASAPORTE ANAIS AMBULIA.pdf",
    driveFolderUrl: null,
    appointmentDate: null,
    registrationMonth: "2026-03",
    filesMap: {
      "1 EX24. ANAIS autorización de residencia temporal de familiares de personas con nacionalidad española..pdf": "Formulario EX24 Solicitud de Residencia",
      "1.1 EX24. MATTIAS autorización de residencia temporal de familiares de personas con nacionalidad española..pdf": "Formulario EX24 Menor de Edad",
      "10 NOMINAS.pdf": "Justificante de Ingresos (Nóminas)",
      "11 PADRON COLECTIVO CASTELLON.pdf": "Certificado de Padrón Colectivo",
      "12 PODER DE REPRESENTACIÓN.pdf": "Poder de Representación",
      "2 DNI FAMILIAR ESPAÑOL.pdf": "DNI de Familiar Español",
      "3 DECLARACIÓN RESPONSABLE CÓNYUGE ESPAÑOL.pdf": "Declaración Responsable del Cónyuge",
      "5 ANTECEDENTES PENALES ANAIS.pdf": "Antecedentes Penales de Origen",
      "6 CERTIFICADO DE MATRIMONIO.pdf": "Certificado de Matrimonio",
      "7 PASAPORTE HIJO MATIAS.pdf": "Pasaporte del Hijo",
      "8 REGISTRO CIVIL DE NACIMIENTO DE HIJO.pdf": "Certificado de Nacimiento del Hijo",
      "9 DECLARACIÓN DE LA RENTA.pdf": "Declaración de la Renta (IRPF)",
      "RESIDENCIA PARA FAMILIARES CON RESIDENCIA ESPAÑOLA.pdf": "Resolución Residencia de Familiares"
    }
  },
  {
    folderName: "6 YOIDER MURILLO sociolaboral",
    name: "Yodier",
    lastname: "Murillo",
    email: "yodiermurillo@gmail.com",
    whatsappId: "+34 600 111 222",
    rootsTypeName: "Arraigo Sociolaboral",
    passportFile: null,
    driveFolderUrl: null,
    appointmentDate: null,
    registrationMonth: "2025-10",
    filesMap: {
      "AFILIACIÓN SEGURIDAD SOCIAL.pdf": "Justificante de Afiliación a Seguridad Social",
      "EX17. Formulario solicitud Tarjeta de Identidad de Extranjero. Editable.pdf": "Formulario EX17 Solicitud TIE",
      "Justificante de Presentación REG-2.pdf": "Justificante de Presentación de Trámite",
      "RESOLUCION EXPTE CONCESION 08102025[1].pdf": "Resolución de Concesión de Residencia",
      "TASAS TIE.pdf": "Tasas del Expediente"
    }
  },
  {
    folderName: "7 PATRICIA TORRES CARDONA social",
    name: "Alba Patricia",
    lastname: "Torres Cardona",
    email: "kristian.cardona.torres@outlook.com",
    whatsappId: "+34 611686219",
    rootsTypeName: "Arraigo Social",
    passportFile: null,
    driveFolderUrl: null,
    appointmentDate: new Date("2025-11-11"),
    registrationMonth: "2025-10",
    filesMap: {
      "CITA RECOGIDA DE TARJETA.pdf": "Cita Recogida de Tarjeta",
      "EX17. Formulario solicitud Tarjeta de Identidad de Extranjero. Editable.pdf": "Formulario EX17 Solicitud TIE",
      "RECOLUCION CONCESION 16102025.pdf": "Resolución de Concesión de Residencia",
      "TASAS TIE.pdf": "Tasas del Expediente"
    }
  },
  {
    folderName: "ANDERSON estancia de estudio",
    name: "Anderson Gabriel",
    lastname: "Urbano",
    email: "anderson.urbano@gmail.com",
    whatsappId: "+34 600 555 666",
    rootsTypeName: "Estancia de Estudio",
    passportFile: "2 PASAPORTE.pdf",
    driveFolderUrl: null,
    appointmentDate: null,
    registrationMonth: "2026-03",
    filesMap: {
      "1 EX00. Formulario autorización de estancia de larga duración. Editable.pdf": "Formulario EX00 Solicitud Estancia",
      "3 ANTECEDENTES PENALES.pdf": "Antecedentes Penales de Origen",
      "4 CERTIFICADO BANCARIO.pdf": "Certificado de Solvencia Bancaria",
      "5 LISENCIA DE CONDUCCIÓN.pdf": "Licencia de Conducción",
      "6 MATRICULA CERTIFICADOS DE FORMACIONES CONTRATADAS.pdf": "Matrícula de Centro de Formación",
      "7 POLIZA DE SALUD.pdf": "Póliza de Seguro de Salud",
      "8 PODER DE REPRESENTACIÓN.pdf": "Poder de Representación",
      "CARTA DE PAGO AUTOESCUELA_signed.pdf": "Carta de Pago Autoescuela",
      "Declaracion_responsable_suficiencia_recursos.pdf": "Declaración de Suficiencia de Recursos"
    }
  },
  {
    folderName: "DIANA ACEVEDO renovación residencia y trabajo",
    name: "Diana Patricia",
    lastname: "Acevedo Morales",
    email: "diana.acevedo@gmail.com",
    whatsappId: "+34 600 666 777",
    rootsTypeName: "Renovación de Residencia y Trabajo",
    passportFile: "3 PASAPORTE.pdf",
    driveFolderUrl: null,
    appointmentDate: new Date("2026-03-24"),
    registrationMonth: "2026-03",
    filesMap: {
      "2 NIE.pdf": "Documento de Identidad (DNI/NIE/Pasaporte)",
      "4 ANTECEDENTES PENALES.pdf": "Antecedentes Penales de Origen",
      "5 PADRON.pdf": "Certificado de Padrón Municipal",
      "6 VIDA LABORAL.pdf": "Certificado de Vida Laboral",
      "7 PODER DE REPRESENTACIÓN.pdf": "Poder de Representación",
      "Contrato (1).pdf": "Contrato de Trabajo"
    }
  }
];

async function importClients() {
  try {
    // Get role mappings
    const clientRole = await prisma.role.findFirst({ where: { name: "client" } });
    const clientRoleId = clientRole ? clientRole.id : 9;

    console.log(`Using clientRoleId: ${clientRoleId}`);

    for (const spec of clientsSpec) {
      console.log(`\nProcessing client: ${spec.name} ${spec.lastname}...`);

      // 1. Get or create RootsType
      const rootsType = await prisma.rootsType.upsert({
        where: { name: spec.rootsTypeName },
        update: {},
        create: {
          name: spec.rootsTypeName,
          description: `Expediente de tipo ${spec.rootsTypeName}`
        }
      });

      // 2. Get or create User
      let user = await prisma.user.findUnique({ where: { email: spec.email } });
      if (user) {
        // Update user
        user = await prisma.user.update({
          where: { email: spec.email },
          data: {
            name: spec.name,
            lastname: spec.lastname,
            whatsappId: spec.whatsappId,
            rootsTypeId: rootsType.id,
            appointmentDate: spec.appointmentDate,
            registrationMonth: spec.registrationMonth,
            driveFolderUrl: spec.driveFolderUrl
          }
        });
      } else {
        // Create user
        user = await prisma.user.create({
          data: {
            name: spec.name,
            lastname: spec.lastname,
            email: spec.email,
            password: "$2b$10$C8ggs4d0.ugN6C7vTYwlquUXS3zKtsm69IUnRD7DX5XBlJ1e2Zg/6", // default dummy hash
            whatsappId: spec.whatsappId,
            roleId: clientRoleId,
            rootsTypeId: rootsType.id,
            appointmentDate: spec.appointmentDate,
            registrationMonth: spec.registrationMonth,
            driveFolderUrl: spec.driveFolderUrl
          }
        });
      }

      console.log(`User created/updated with ID: ${user.id}`);
      
      const clientUploadDir = path.join(uploadsBaseDir, user.id);
      if (!fs.existsSync(clientUploadDir)) {
        fs.mkdirSync(clientUploadDir, { recursive: true });
      }

      // 3. Process Passport if present
      if (spec.passportFile) {
        const srcPath = path.join(srcRootDir, spec.folderName, spec.passportFile);
        if (fs.existsSync(srcPath)) {
          const destPath = path.join(clientUploadDir, spec.passportFile);
          fs.copyFileSync(srcPath, destPath);
          console.log(`Copied Passport: ${spec.passportFile}`);

          // Update user passport field
          await prisma.user.update({
            where: { id: user.id },
            data: {
              passportUrl: `/uploads/${user.id}/${spec.passportFile}`,
              passportStatus: "Uploaded"
            }
          });
        } else {
          console.warn(`Passport file not found: ${srcPath}`);
        }
      }

      // 4. Process individual files mapped to steps
      let shortOrderIndex = 1;
      for (const [filename, stepName] of Object.entries(spec.filesMap)) {
        const srcFilePath = path.join(srcRootDir, spec.folderName, filename);
        if (!fs.existsSync(srcFilePath)) {
          console.warn(`File not found, skipping step: ${srcFilePath}`);
          continue;
        }

        // Get or create Step
        let step = await prisma.step.findFirst({
          where: { name: stepName }
        });
        if (!step) {
          step = await prisma.step.create({
            data: {
              name: stepName,
              description: `Requisito de ${stepName}`
            }
          });
        }

        // Ensure step is associated with RootsType
        // Find if association exists
        const association = await prisma.rootsTypesSteps.findFirst({
          where: { rootsTypeId: rootsType.id, stepId: step.id }
        });

        if (!association) {
          await prisma.rootsTypesSteps.create({
            data: {
              rootsTypeId: rootsType.id,
              stepId: step.id,
              isMandatory: true,
              shortOrder: shortOrderIndex++
            }
          });
        }

        // Copy file physically
        const destFilePath = path.join(clientUploadDir, filename);
        fs.copyFileSync(srcFilePath, destFilePath);
        console.log(`Copied: ${filename} -> ${destFilePath}`);

        // Create Document record
        const relativeUrl = `/uploads/${user.id}/${filename}`;
        const document = await prisma.document.create({
          data: {
            name: filename,
            extension: filename.split('.').pop() || 'pdf',
            url: relativeUrl
          }
        });

        // Link document and step progress
        const progress = await prisma.userProcessProgress.findFirst({
          where: { userId: user.id, stepId: step.id }
        });

        if (progress) {
          await prisma.userProcessProgress.update({
            where: { id: progress.id },
            data: {
              documentId: document.id,
              status: "Uploaded",
              adminComments: null
            }
          });
        } else {
          await prisma.userProcessProgress.create({
            data: {
              userId: user.id,
              stepId: step.id,
              documentId: document.id,
              status: "Uploaded"
            }
          });
        }
      }
    }

    console.log("\nAll clients and files imported successfully!");
  } catch (err) {
    console.error("Error during import:", err);
  } finally {
    await pool.end();
  }
}

importClients();
