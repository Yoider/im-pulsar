# Explicación de Diseño: Modal

Este documento explica las decisiones detrás de la experiencia de usuario y arquitectura del componente `Modal`.

---

## Experiencia de Usuario e Interacción

El modal implementa varios principios de diseño de interfaz premium para integrarse de forma fluida:

### 1. Difuminado de Fondo y Capas
* **Backdrop**: Utiliza un fondo oscuro semi-transparente `bg-slate-950/60` junto con un filtro de desenfoque (`backdrop-blur-sm`). Esto aísla visualmente el contenido del modal y reduce la carga cognitiva sobre el usuario, eliminando el ruido de la pantalla trasera.

### 2. Animaciones de Entrada y Escala
* **Contenedor**: El modal cuenta con la clase `animate-scale-in` de Tailwind para emerger suavemente desde el centro de la pantalla. El backdrop utiliza una transición de opacidad (`animate-fade-in`), logrando una entrada coordinada.

### 3. Cierre Conveniente y Prevención de Pérdida de Datos
* **Clases de Puntero**: El usuario puede hacer clic fuera de la caja del modal (en el backdrop) o en el botón "X" superior para cerrar la ventana. Sin embargo, para evitar pérdidas accidentales en formularios complejos, el cuerpo del modal tiene su comportamiento aislado.

---

## Relaciones y Contexto

El componente `Modal` actúa como contenedor de primer nivel para interacciones avanzadas del dashboard:
1. **AdminToolsPanel**: Lo utiliza como base para hospedar subsecciones completas como el gestor de pasos y reordenamientos (`RootsTypeModal`), diálogos de confirmación de eliminación de estados o KPI avanzados.
2. **DocumentViewerModal**: Su arquitectura inspira al visor de documentos, aunque este último está especializado en el renderizado responsivo de PDFs e imágenes.
