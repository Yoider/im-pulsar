# DocsPanel Explanation

El panel de documentación `DocsPanel` fue diseñado como un punto de entrada amigable para los desarrolladores y administradores de la plataforma Impulsar, centralizando el catálogo de componentes en el Dashboard.

## Decisiones de Arquitectura

### 1. Centralización de Metadatos
En lugar de escanear directorios en el frontend (lo cual requeriría APIs adicionales o funciones del lado del servidor de solo lectura que podrían ralentizar el renderizado inicial), optamos por mantener una constante estática de metadatos `COMPONENTS_LIST`. Esto nos permite:
- Describir rápidamente el propósito de cada componente en lenguaje natural.
- Controlar explícitamente cuáles componentes están listos para ser mostrados como documentados.
- Categorizar y agrupar por subdominio (`landing`, `dashboard`, `ui`) instantáneamente en memoria.

### 2. Clasificación Visual por Subdominios
La plataforma sigue una estricta política de co-ubicación por dominios (`documentation-skill`). Agrupar los componentes por sus directorios físicos ayuda al equipo a:
- Comprender el alcance de cada archivo.
- Fomentar la modularidad y prevenir dependencias cruzadas indeseadas.
- Identificar componentes globales (`ui`) frente a componentes locales de pantallas (`dashboard`, `landing`).

### 3. Coherencia de Estilo
Utiliza el estilo de diseño oscuro premium de Impulsar con micro-animaciones:
- Hover sutil en las tarjetas (`hover:border-slate-800/80` y `hover:bg-slate-900/40`).
- Animaciones de desvanecimiento (`animate-fade-in`) para suavizar la carga del componente.
- Colores coordinados para los badges según el subdominio del componente.
