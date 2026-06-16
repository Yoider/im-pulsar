---
name: project-roadmap-guide
description: Guía al agente sobre el estado actual del proyecto, la hoja de ruta de desarrollo y los estándares para proponer, estructurar e integrar modificaciones futuras de manera segura.
---

# Objetivo
Establecer las directrices de comportamiento para proponer, estructurar, desarrollar e integrar de forma segura modificaciones en la plataforma Impulsar, utilizando el archivo de estado del proyecto `docs/project_status.md` como la fuente de verdad dinámica y manteniéndolo actualizado tras cada cambio mayor.

---

# Instrucciones

## 1. Leer la Fuente de Verdad del Proyecto
Antes de realizar cualquier propuesta de diseño o modificación en la base de datos, lógica de backend o componentes de frontend, el agente **DEBE consultar y leer el archivo [project_status.md](file:///d:/DEV/AuthSndr/ImpulsarPage/docs/project_status.md)** en el repositorio. Este archivo detalla:
* El modelo relacional actual (Prisma).
* Las Server Actions disponibles en el backend.
* La distribución y componentes del frontend.
* Los hitos de la Hoja de Ruta Tecnológica (Roadmap).

## 2. Modificaciones del Esquema de Base de Datos
Si una tarea requiere extender el modelo relacional:
1. Modificar el archivo `prisma/schema.prisma`.
2. Ejecutar la sincronización y regeneración del cliente Prisma usando el comando:
   ```bash
   npx prisma db push && npx prisma generate
   ```
3. Comprobar que no existan advertencias ni conflictos en los modelos dependientes.

## 3. Desarrollo Aislado del Backend (Server Actions)
* Toda la comunicación con el cliente Prisma debe residir exclusivamente en funciones `"use server"` dentro de `src/backend/actions.ts` o archivos de servicio acoplados en el backend.
* Queda prohibido consultar directamente la base de datos desde componentes de la UI del cliente (frontend).

## 4. Almacenamiento y Carga de Archivos
* Los archivos físicos subidos al servidor deben guardarse en el directorio local:
  `public/uploads/[userId]/[filename]`
* Las referencias de URL guardadas en la base de datos (ej. tabla `Document`) deben ser rutas relativas que Next.js pueda resolver estáticamente:
  `/uploads/[userId]/[filename]`

## 5. Validación y Compilación
Antes de dar por concluida una tarea, el agente debe:
1. Ejecutar la validación estática de tipos: `npx tsc --noEmit`.
2. Simular la compilación de producción para descartar problemas de hidratación o empaquetado: `npm run build`.

## 6. Mantener Sincronizada la Fuente de Verdad
* Una vez que un cambio mayor (nuevas tablas, campos, server actions o vistas) haya sido desarrollado y verificado con éxito, el agente **DEBE actualizar de forma proactiva el archivo [project_status.md](file:///d:/DEV/AuthSndr/ImpulsarPage/docs/project_status.md)**.
* Se debe documentar la adición o modificación realizada para garantizar que la fuente de verdad siempre represente fielmente el estado actual del repositorio.

---

# Restricciones
* **Prohibido realizar cambios sin Plan**: No se debe realizar ninguna modificación de código sin antes proponer y aprobar un plan de implementación en `implementation_plan.md`.
* **RBAC Estricto**: Respetar el control de acceso basado en roles. Solo las Server Actions de administración deben permitir modificar la configuración y auditar clientes.
