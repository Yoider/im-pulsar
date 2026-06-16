---
name: upload-document-skill
description: Guía técnica y procedimental para sanitizar, almacenar archivos físicamente en el servidor e insertarlos en la base de datos del proyecto.
---

# Objetivo
Asegurar la carga estandarizada de archivos y documentación de clientes en el servidor, guiando al agente en el proceso de sanitización, organización física aislada en disco, y vinculación limpia de documentos en la base de datos relacional.

---

# Instrucciones

Cuando el agente necesite procesar y subir archivos de clientes (ej. pasaportes, tasas, matrículas o resoluciones), debe seguir este procedimiento técnico:

## 1. Sanitizar el Nombre del Archivo
Para prevenir problemas de codificación y compatibilidad en las URLs, se debe sanitizar el nombre original del archivo eliminando acentos, caracteres especiales y espacios.
* **Algoritmo de Sanitización (JS/TS)**:
  ```javascript
  const cleanName = filename
    .toLowerCase()
    .normalize("NFD") // Descomponer acentos
    .replace(/[\u0300-\u036f]/g, "") // Remover diacríticos
    .replace(/\s+/g, "_") // Espacios a guiones bajos
    .replace(/[^a-z0-9_.-]/g, ""); // Conservar solo letras, números y caracteres seguros
  ```

## 2. Aislamiento por Cliente
* Todos los archivos de un cliente deben almacenarse de forma estrictamente aislada en el directorio local:
  `public/uploads/[userId]/`
* Antes de copiar o escribir el archivo, verificar la existencia del directorio del cliente y crearlo de forma recursiva:
  ```javascript
  const uploadDir = path.join(process.cwd(), "public", "uploads", userId);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  ```

## 3. Escritura del Archivo en Disco
* Escribir el buffer del archivo en el servidor de forma asíncrona:
  ```javascript
  const filePath = path.join(uploadDir, cleanName);
  await fs.promises.writeFile(filePath, fileBuffer);
  ```

## 4. Registro de Documento en Base de Datos
* Crear el registro en la tabla `Document` utilizando Prisma.
* **Ruta Relativa UNIX**: La URL del documento almacenada debe ser relativa y en formato UNIX para que Next.js la sirva estáticamente de forma directa:
  ```javascript
  const relativeUrl = `/uploads/${userId}/${cleanName}`;
  const document = await prisma.document.create({
    data: {
      name: cleanName,
      extension: cleanName.split('.').pop() || 'pdf',
      url: relativeUrl
    }
  });
  ```
  *(Nota: Nunca guardar rutas locales del sistema de archivos absolutas, ej: `D:\DEV\...`, en el campo `url` de la base de datos).*

## 5. Vinculación con el Progreso o Perfil
Dependiendo del tipo de documento, actualizar la base de datos relacional:
* **Documento de Paso de Expediente**:
  * Buscar el registro `UserProcessProgress` para el cliente (`userId`) y el paso (`stepId`).
  * Si existe, actualizar el `documentId`, limpiar comentarios administrativos y fijar el estado a `"Uploaded"` (Subido).
  * Si no existe, crear el registro de progreso vinculando el documento con el estado `"Uploaded"`.
* **Documento del Pasaporte del Cliente**:
  * Actualizar el campo `passportUrl` en la tabla `User` del cliente con la ruta relativa y cambiar `passportStatus` a `"Uploaded"`.

---

# Restricciones
* **Aislamiento Obligatorio**: Nunca guardar archivos directamente en `public/uploads/` sin la subcarpeta `[userId]/`, para evitar conflictos de nombres de archivos homónimos entre distintos clientes.
* **Transaccionalidad en Fallos**: Si la escritura física del archivo en disco falla, revertir o no proceder con la inserción en la base de datos para evitar registros de documentos huérfanos o inválidos.
