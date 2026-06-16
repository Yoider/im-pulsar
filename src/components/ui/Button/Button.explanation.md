# Explicación de Diseño: Button

Este documento detalla las decisiones arquitectónicas y de diseño detrás del componente interactivo base `Button`.

---

## Decisiones de Diseño e Interacción

El botón utiliza un enfoque de diseño minimalista basado en una paleta de colores neutrales (gama Slate) para facilitar la integración armónica en cualquier sección del sitio web.

### 1. Retroalimentación Táctil (Micro-animaciones)
* El botón incluye la propiedad `active:scale-[0.98]` combinada con una transición suave (`transition-all duration-200`). Esto genera una micro-animación de pulsación física cuando el usuario hace clic, mejorando significativamente la percepción de reactividad de la aplicación.

### 2. Accesibilidad y Estados
* **Estado Deshabilitado (`disabled`)**: El botón reduce su opacidad al `50%` y bloquea cualquier evento de puntero (`pointer-events-none`) cuando está en estado de carga o deshabilitado, previniendo doble envío de formularios.
* **Selección del Navegador (`select-none`)**: Se aplica para prevenir la selección accidental del texto del botón durante clics sucesivos o en dispositivos móviles de pantalla táctil.

---

## Relaciones y Contexto

El componente `Button` es el bloque de construcción atómico principal y se encuentra integrado en:
1. **LoginForm**: Botón de envío de credenciales e inicio con Google OAuth.
2. **AdminToolsPanel**: Botón de crear expedientes, actualizar estados de flujo y descargar PDFs.
3. **RootsTypeModal**: Botón de guardar cambios en la reordenación de pasos y confirmaciones de modales.
4. **HistorialSection / AuditoriaSection**: Botones de refresco y búsquedas de auditoría.
