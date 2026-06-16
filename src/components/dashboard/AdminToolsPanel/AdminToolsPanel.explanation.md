# AdminToolsPanel (Explicación de Diseño)

## Por qué se refactorizó

El archivo original `AdminToolsPanel.tsx` había crecido a más de 1,300 líneas, convirtiéndose en un antipatrón de "componente monolítico" que mezclaba lógica de estado, manejo de datos, múltiples vistas de navegación (Hub → Expedientes → Estados) y todo el renderizado en un solo archivo.

## Decisiones de Arquitectura

### 1. Transición a Diseño de Dos Columnas con Scroll Independiente
Para evitar scrolls generales en la ventana que alarguen la página y distraigan al administrador, el panel utiliza ahora un **diseño de dos columnas con scroll interno** adaptativo en pantallas medianas y grandes (`md:h-[calc(100vh-100px)]`):
- **Columna Izquierda (Auditoría de Clientes)**: Muestra permanentemente la barra de búsqueda, filtros de expedientes y la lista de clientes.
- **Columna Derecha (Configuraciones)**: Concentra la administración de los recursos a través de pestañas superiores (`Tabs`).
- Cada columna es un contenedor `flex flex-col overflow-hidden` donde el contenido interior hace scroll vertical de forma independiente a través de `overflow-y-auto min-h-0`.
- En dispositivos móviles o tablets (`max-md`), las columnas se apilan verticalmente y limitan su alto a un tamaño fijo de `h-[450px]` o `h-[500px]` con scroll interno, garantizando que el diseño móvil permanezca compacto.

### 2. Navegación por Pestañas (Tabs) en la Columna de Configuración
En lugar de tener tres secciones apiladas (lo cual forzaba scroll general), la segunda columna integra la **Configuración de Expedientes** y la **Configuración de Estados** mediante un switch de pestañas en la cabecera:
- **Pestaña Expedientes**: Permite visualizar y gestionar tipos de expedientes (`ExpedientesSection`) y despliega dinámicamente la acción `+ Nuevo Expediente`.
- **Pestaña Estados**: Permite visualizar y personalizar badges de estados (`EstadosSection`) y despliega la acción `+ Nuevo Estado`.
- Este patrón permite añadir nuevas vistas de configuración en el futuro sin alterar la distribución de la página principal.

### 3. Descomposición en Subcomponentes Locales
El orquestador ahora solo mantiene el **estado compartido y los handlers de datos**. El renderizado se delega a:
- `KpiStatsBar` — métricas globales en tiempo real.
- `AuditoriaSection` — búsqueda, filtros y tarjetas de clientes (con grid optimizado para dos columnas: `grid-cols-1 xl:grid-cols-2`).
- `ExpedientesSection` — cuadrícula de tipos de expedientes.
- `EstadosSection` — configuración de badges de colores.

### 4. Modales Centralizados en el Orquestador
Los 5 modales del sistema (Nuevo Expediente, Gestionar Pasos, Editar Detalles, Ficha de Cliente, Crear/Editar Estado) se alojan en el orquestador, no en los subcomponentes. Esto evita la duplicación de portales de modal y centraliza el flujo de estado de apertura/cierre.

### 5. Sincronización Reactiva
Al actualizar el estado de un paso de un cliente (`handleUpdateStepStatus`), el modal de detalle se actualiza de forma **optimista** sin esperar `fetchData`. Esto garantiza una UX instantánea al cambiar el dropdown de estado.

## Consecuencia
La combinación del diseño adaptativo a dos columnas, scrolls internos y encapsulamiento modular crea una herramienta administrativa premium que responde de forma fluida y mantiene el contexto operativo de un solo vistazo.
