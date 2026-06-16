# Explicación de Diseño: BackButton

Este documento explica las motivaciones y el diseño detrás del botón de retroceso (`BackButton`).

---

## Decisiones de Enrutamiento y UX

El propósito del `BackButton` es proveer un método consistente e intuitivo para que el usuario navegue hacia atrás en el historial del cliente sin provocar una recarga completa de la página.

### 1. Enrutamiento del Lado del Cliente
* Al utilizar `router.back()` en lugar de un enlace estático tradicional (`href="/dashboard"`), el componente respeta el flujo previo del usuario. Esto es crucial cuando se accede a vistas de detalles desde múltiples orígenes (por ejemplo, desde la pestaña de búsqueda o desde un listado directo).

### 2. Estilo Compacto y Ubicación
* Su apariencia es un contenedor circular-cuadrangular minimalista de `32px` que contiene un icono de flecha hacia la izquierda. Se posiciona habitualmente al lado de títulos de páginas o cabeceras de visualización de documentos técnicos para servir como ancla de retorno rápida.

---

## Relaciones y Contexto

* **Enrutador Next.js**: Es una extensión directa de `next/navigation`.
* **Páginas de Detalles**: Se integra en la página dinámica `/dashboard/docs/[...slug]/page.tsx` para permitir a los desarrolladores salir del visor de guías y retornar al panel general del Docs Hub.
