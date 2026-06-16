---
name: documentation-skill
description: Gestiona la documentación modular (Docs-as-Code) bajo el modelo Diátaxis y el principio de co-ubicación por dominios.
---

# Objetivo
Garantizar que el 100% del código de la interfaz de la plataforma Impulsar cuente con documentación técnica modular, estructurada y organizada por subdominios, eliminando por completo el código indocumentado.

# Instrucciones
1. **Estructura de Co-ubicación por Dominios**: Clasificar y organizar cada componente dentro de su subcarpeta correspondiente en `src/components/`:
   - `/ui/[Nombre]/` para componentes atómicos reutilizables globales.
   - `/dashboard/[Nombre]/` para componentes exclusivos del panel de control.
   - `/landing/[Nombre]/` para elementos exclusivos de la pantalla de bienvenida.
   Cada carpeta contendrá el código (`.tsx`) y sus módulos de documentación.

2. **Creación Retroactiva Obligatoria**: Al modificar un componente existente que carezca de documentación modular, detenerse y generar los archivos `.reference.md` e `.explanation.md` desde cero antes de proceder con los cambios de código.

3. **Aplicación Estricta del Modelo Diátaxis**:
   - `[Nombre].reference.md`: Detalles técnicos puros (props, tipos de TypeScript con alias `@/`, y firmas de APIs/Actions).
   - `[Nombre].explanation.md`: Razonamiento arquitectónico, decisiones de diseño de interfaz y manejo de estados.

4. **Sincronización en Cascada**: Si el código del componente es modificado, actualizar de forma obligatoria las especificaciones técnicas en los archivos Markdown asociados durante el mismo turno de trabajo.

# Restricciones
- Queda estrictamente prohibido dar una tarea por finalizada si existe código nuevo o modificado que no tenga sus archivos de documentación correspondientes creados o actualizados en su subdominio exacto.
- Los nombres de los archivos de documentación deben respetar estrictamente el uso de mayúsculas y minúsculas (PascalCase) del componente para evitar fallos de lectura en el servidor.
