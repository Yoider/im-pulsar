# Referencia Técnica: DocumentViewerModal

`DocumentViewerModal` es un componente de interfaz atómico global (`ui`) encargado de renderizar de manera integrada y responsiva archivos e imágenes dentro de la aplicación.

---

## Firma de Props

### `DocumentViewerModalProps`
```typescript
interface DocumentViewerModalProps {
  isOpen: boolean;    // Controla la visibilidad del modal.
  onClose: () => void; // Función callback para cerrar el modal y limpiar el estado.
  title: string;      // Título que se muestra en la cabecera del visor.
  url: string;        // Dirección URL o base64 del archivo a previsualizar.
}
```

---

## Comportamiento Técnico

### 1. Detección de Tipo de Archivo
El componente discrimina dinámicamente si el archivo es una imagen o un archivo PDF basándose en su extensión o su cabecera de datos (Data URI):
```typescript
const isImage = /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(url) || url.startsWith("data:image/");
```

### 2. Renderizado Condicional
* **Imágenes**: Se renderizan usando un contenedor responsivo `img` con controles de ajuste de tamaño (`max-w-full`, `max-h-full`, `object-contain`).
* **PDFs y otros**: Se renderizan mediante un elemento `iframe` que apunta a la URL del archivo más el parámetro `#toolbar=1` para forzar la barra de herramientas interactiva nativa del navegador.

### 3. Restricciones del Navegador
* El fondo de la página se congela (`document.body.style.overflow = "hidden"`) mientras el modal está activo para mejorar la experiencia de usuario (UX).
* El modal escucha el evento de teclado `keydown` y se cierra automáticamente al presionar la tecla **Escape**.
