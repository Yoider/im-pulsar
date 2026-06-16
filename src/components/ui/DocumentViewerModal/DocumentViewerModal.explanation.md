# Explicación del Diseño: DocumentViewerModal

Esta guía explica las decisiones de diseño y el razonamiento arquitectónico detrás de la implementación de `DocumentViewerModal`.

---

## Decisiones de Diseño

### 1. Visor Modal sobre Pestaña Nueva
Anteriormente, los archivos se abrían mediante enlaces `target="_blank"`, lo que provocaba que el usuario tuviera que salir de la aplicación, perdiendo el flujo y contexto de su trabajo (especialmente crítico para el administrador al auditar múltiples expedientes).
* **Solución**: Un modal centralizado mantiene al usuario en la misma interfaz, permitiendo revisar los requisitos en paralelo y cerrar la vista previa de forma instantánea.

### 2. Detección Dinámica de Formato
El modal determina el contenedor apropiado (`img` vs `iframe`) de forma reactiva. Esto previene que las imágenes se descarguen automáticamente en lugar de previsualizarse, y permite que los PDFs aprovechen la funcionalidad de zoom, impresión y descarga nativa del navegador mediante el parámetro `#toolbar=1`.

---

## Interacción de Estados
* **Estado de Bloqueo**: Se implementó un efecto secundario (`useEffect`) que modifica el estilo de desbordamiento (`overflow`) del `body` del documento. Esto bloquea el desplazamiento del fondo mientras el usuario visualiza el archivo, evitando problemas de navegación confusa (UX).
* **Limpieza de Recursos**: Al cerrar el modal, el estado se limpia en cascada en el componente padre (`setViewerUrl(null)`), asegurando que no queden recursos cargados en segundo plano ni fugas de memoria.
