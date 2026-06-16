# Referencia Técnica: Modal

El componente `Modal` es una ventana superpuesta que bloquea la interacción con la interfaz subyacente para capturar la atención o entrada del usuario sobre tareas específicas.

---

## Props

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

| Propiedad | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `isOpen` | `boolean` | Sí | Controla si la ventana modal se renderiza en la pantalla. |
| `onClose` | `() => void` | Sí | Función ejecutada para cerrar el modal al hacer clic en el backdrop, la cruz, o pulsar Escape. |
| `title` | `string` | Sí | Título visible que aparece en la cabecera superior del modal. |
| `children` | `React.ReactNode` | Sí | Contenido interno que se renderizará en el cuerpo del modal. |

---

## Control de Efectos Secundarios

* **Bloqueo de Scroll**: Cuando `isOpen` es `true`, el componente inyecta `overflow: hidden` en el cuerpo del documento (`document.body`) para evitar el scroll accidental de la página inferior, y restablece el estilo a su estado original al desmontarse.
* **Escucha de Teclado**: Añade un oyente global para la tecla `Escape` que dispara el cierre del modal automáticamente para mejorar la accesibilidad de teclado.
