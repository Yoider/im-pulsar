# Estado Actual del Proyecto: Impulsar

Este documento sirve como la fuente de verdad definitiva del proyecto, describiendo la base de datos relacional, la lógica del backend (Server Actions), la estructura del frontend, y las tareas futuras planificadas en el roadmap.

---

## 1. Modelo de Datos (Prisma & PostgreSQL)
La base de datos relacional está definida por los siguientes modelos clave:
* **`User`**: Almacena los usuarios de la plataforma. Cuenta con un campo `role` ("admin" o "client"). Para los clientes, almacena campos específicos de expediente:
  * `driveFolderUrl`: URL de la carpeta de Google Drive del cliente.
  * `passportUrl`: Ruta relativa del archivo de pasaporte físico subido al servidor.
  * `passportStatus`: Estado de validación del pasaporte ("Pending", "Uploaded", "Approved", "Rejected").
  * `appointmentDate`: Fecha de cita programada para el trámite de extranjería.
  * `registrationMonth`: Período de registro (formato `YYYY-MM`).
* **`RootsType`**: Define los tipos de expedientes del sistema (ej: "Arraigo Sociolaboral", "Regularización Comercial Especial").
* **`Step`**: Catálogo global de pasos o requisitos (ej: "Documento de Identidad", "Justificante de Ingresos").
* **`RootsTypesSteps`**: Tabla intermedia que asocia pasos específicos a un tipo de expediente, definiendo el orden de prioridad (`shortOrder`) y si el paso es obligatorio (`isMandatory`).
* **`UserProcessProgress`**: Trazabilidad del progreso de un cliente en un paso. Almacena el estado actual del paso (ej. "Approved", "Rejected"), valores personalizados ingresados, comentarios de retroalimentación del administrador (`adminComments`), y la relación con el documento adjunto.
* **`Document`**: Almacena el metadato del archivo adjunto al progreso (nombre, extensión y ruta física de almacenamiento).
* **`StatusConfig`**: Configura visualmente los estados de los pasos en la plataforma (badge color, text color y etiquetas personalizadas).
* **`AuditLog`**: Almacena de forma detallada la bitácora de auditoría de todas las acciones del administrador, registrando tipo de acción, entidad, administrador ejecutor, cliente afectado y diferencias (JSON de old/new values).

---

## 2. Lógica del Servidor (Server Actions)
Ubicada en `src/backend/actions.ts`:
* **Gestión de Clientes**:
  * `getUsersAction()`: Consulta y mapea los datos de los clientes incluyendo los campos de perfil, expediente asignado y la lista ordenada de requisitos con sus documentos asociados.
  * `updateClientDetailsAction()`: Guarda los campos de Drive, cita, pasaporte y datos de contacto de un cliente.
  * `uploadClientFileAction()`: Recibe archivos cargados a través de `FormData`, los guarda en el disco local (`public/uploads/[userId]/[filename]`) y registra la ruta relativa en base de datos.
* **Workflow Engine (Progreso)**:
  * `updateUserStepStatusAction()`, `validateStepAction()`: Manejo y validación del estado del expediente del usuario final.
* **CRUDs de Administración & Auditoría**:
  * Configuración de expedientes (`createRootsTypeAction`, `associateStepAction`, `reorderStepsAction`, etc.) y configuración de estados visuales.
  * `getAuditLogsAction()`: Recupera todos los registros de la bitácora de auditoría ordenados de forma descendente, con mapeo de nombres de administradores y clientes.

---

## 3. Interfaz de Usuario (Frontend)
Construida en Next.js (App Router) con Tailwind CSS v4:
* **Dashboard del Cliente**: Vista simple para comprobar el estado de sus requisitos.
* **Herramientas Administrativas**:
  * **Auditoría de Clientes (2/3 ancho)**: Tarjetas interactivas de clientes agrupadas por tipo de expediente. Al seleccionar un cliente, se abre el **Split Modal** de ficha detallada:
    * *Panel Izquierdo*: Avatar, datos estáticos y botón de **Editar**. En modo edición, expone inputs para actualizar campos del cliente y un selector de archivos para cargar el pasaporte físico.
    * *Panel Derecho*: Lista vertical de pasos requeridos por su expediente. Permite cambiar el estado de los requisitos y cargar/visualizar archivos individuales para cada paso.
  * **Configuración de Expedientes, Estados & Historial (1/3 ancho)**: Pestañas para crear expedientes, gestionar el catálogo de pasos mediante arrastrar y soltar (drag-and-drop), configurar badges de colores para los estados del sistema, y consultar la bitácora global de auditoría en una línea de tiempo filtrable.

---

## 4. Hoja de Ruta Tecnológica (Roadmap)

Pasos futuros planificados para el desarrollo del ecosistema Impulsar:
1. **Migración Nativa de Bot de WhatsApp (En Progreso)**: Centralizar el webhook, historial de chat en base de datos y máquina de estados en Next.js.
2. **Clasificación y Validación de Documentos por IA (Próximamente)**: Configurar Gemini para que asigne automáticamente los archivos subidos al paso correspondiente y valide su contenido con la descripción de la expectativa, devolviendo retroalimentación en tiempo real.
3. **Portal del Cliente Avanzado**: Permitir que el usuario final acceda a una interfaz privada donde pueda visualizar en tiempo real su progreso general, ver los comentarios de rechazo del administrador, y subir sus propios archivos de forma segura sin intervención manual del equipo administrativo.
4. **Notificaciones Automatizadas**: Envío automático de notificaciones por correo electrónico o alertas cuando un administrador apruebe o rechace un documento del cliente.

---

## 5. Datos Migrados e Inicializados
El sistema cuenta con la base de datos PostgreSQL poblada y los archivos físicos organizados para los siguientes 7 clientes importados de la carpeta local de expedientes de arraigo:
1. **Adrián Ariel Rabella** (Expediente: *Nacionalidad Española*)
2. **María Isabel Llanos Hinostroza** (Expediente: *Arraigo Socioformativo*)
3. **Anais Pilin Ambulia Manzano** (Expediente: *Reagrupación Familiar de Español*)
4. **Yodier Murillo** (Expediente: *Arraigo Sociolaboral*)
5. **Alba Patricia Torres Cardona** (Expediente: *Arraigo Social*)
6. **Anderson Gabriel Urbano** (Expediente: *Estancia de Estudio*)
7. **Diana Patricia Acevedo Morales** (Expediente: *Renovación de Residencia y Trabajo*)

Cada uno tiene su correspondiente carpeta física bajo `public/uploads/[userId]/` conteniendo sus archivos migrados (pasaportes, certificados, formularios) y sus registros de progreso de requisitos inicializados y vinculados en la base de datos relacional.

