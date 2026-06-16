# Sidebar (Explicación de Diseño)

## Contexto y Decisiones de Diseño

El sidebar lateral izquierdo actúa como el eje central de navegación del usuario en el dashboard. Se diseñó bajo principios de minimalismo moderno y economía de espacio en pantalla.

### Animación Hover (Expand/Collapse)
* **Problema**: Las barras laterales anchas ocupan mucho espacio en pantallas pequeñas y distraen visualmente. Las barras estrechas con puros iconos no son legibles para usuarios nuevos.
* **Solución**: Una barra de herramientas lateral colapsable dinámica.
  - El ancho por defecto es `w-16` (64px), ocultando las etiquetas de texto de las opciones y mostrando únicamente los iconos.
  - Al posicionar el cursor sobre la barra (`onMouseEnter`), el estado de React `isHovered` pasa a `true`, expandiendo el ancho a `w-64` (256px) con una transición suave controlada por CSS.
  - Las etiquetas de texto de navegación utilizan una animación de opacidad controlada (`opacity-0` a `opacity-100` con `duration-300`) y se deshabilitan sus eventos de puntero cuando colapsa (`pointer-events-none`) para prevenir clics accidentales en áreas invisibles.

### Seguridad basada en Roles (RBAC)
* Las opciones que se renderizan se evalúan condicionalmente basadas en el rol del usuario (`user.role`). Las opciones `admin-tools` ("Herramientas Admin") y `docs` ("Docs") solo se inyectan en el array de menús si `user.role === 'admin'`, previniendo que un cliente visualice o acceda a la vista del panel administrativo o al catálogo de documentación.

### Rendimiento
* Usar SVGs en línea (inline SVG) previene dependencias de paquetes de iconos pesados y asegura que se rendericen instantáneamente a nivel de cliente sin parpadeos o carga retardada.
