# Original User Request

## 2026-06-08T19:51:41Z

Rediseño completo y unificado de la plataforma Impulsar (Login, Dashboard de Cliente, Herramientas de Administración y Auditoría) para entorno de producción, aplicando rigurosamente la paleta de colores slate (#f9fafb a #030712) y el estilo visual de tarjetas premium limpias, bien organizadas y con bordes finos.

Working directory: d:\DEV\AuthSndr\ImpulsarPage
Integrity mode: development

## Requirements

### R1. Paleta de Colores y Tipografía (Fidelidad de Tema)
* Definir e integrar la paleta de color slate (de 50 a 950) en el archivo de estilos (`globals.css`) utilizando las variables de Tailwind CSS v4.
* Reemplazar todos los fondos e interfaces anteriores por tonos limpios basados en esta escala (por ejemplo, fondos de página en `#f9fafb`/`#f3f4f6`, bordes finos y limpios en `#e5e7eb`, y textos principales en `#101828` y `#030712`).
* Utilizar una tipografía premium (Inter, Geist o similar de Google Fonts) configurando jerarquías limpias y legibles.

### R2. Rediseño del Dashboard de Clientes
* Modificar la interfaz del cliente final (`DashboardClientContainer`) reemplazando las listas básicas por tarjetas premium con bordes finos redondeados (`rounded-2xl` o similar).
* Implementar un componente de progreso circular gráfico (gráfico de arco/dona) que muestre de forma dinámica la proporción de pasos completados (ej: "Aprobados/Subidos" frente al total de pasos).
* Agregar elementos estéticos distintivos como curvas decorativas o fondos geométricos de círculos concéntricos en las tarjetas principales, manteniendo una disposición limpia y alineada como en la imagen de referencia.

### R3. Rediseño de Herramientas de Administración y Auditoría
* Modificar el panel administrativo (`AdminToolsPanel`) para que la visualización de tarjetas de auditoría de clientes, el selector de filtros y el Split Modal adopten el nuevo diseño.
* Las tarjetas de los clientes deben mostrar un resumen visual limpio con sus datos clave, progreso relativo y selectores integrados de forma orgánica y organizada.

### R4. Rediseño de la Pantalla de Login
* Adaptar el formulario de inicio de sesión (`LoginForm`) y su página contenedora al nuevo esquema slate minimalista, con bordes suaves, inputs modernos y sombras sutiles que emulen el diseño de la segunda imagen.

## Acceptance Criteria

### Visual Style & Colors
- [ ] La paleta slate (#f9fafb a #030712) está completamente configurada en Tailwind v4 y todos los fondos visuales son consistentes con ella (no quedan componentes usando el azul índigo o verde esmeralda brillante anterior como fondo principal).
- [ ] Las fuentes tipográficas y tamaños de encabezado en la pantalla de Login y el Dashboard del Cliente están refinados con pesos semibold/extrabold en color oscuro (`#101828` o `#030712`).

### Client Dashboard Redesign
- [ ] El Dashboard del Cliente muestra tarjetas con bordes redondeados curvos suaves y un gráfico circular/semicircular SVG que renderiza la proporción de pasos aprobados de forma exacta y reactiva.
- [ ] Al menos una de las tarjetas principales en la vista del cliente incorpora un diseño estético con líneas curvas o círculos concéntricos de fondo usando clases de Tailwind.

### Admin & Audit panel
- [ ] La sección "Auditoría de Clientes" en `AdminToolsPanel` se despliega en tarjetas con diseño de rejilla premium y organizado que agrupa a los clientes por tipo de expediente.
- [ ] Los selectores y botones de acción en las tarjetas y en el Split Modal tienen bordes finos de color gris slate claro y no se desalinean en resoluciones móviles ni de escritorio.

### Validation
- [ ] La compilación del proyecto es exitosa (`npm run build` o `npx tsc --noEmit` se ejecuta sin errores de TypeScript).
