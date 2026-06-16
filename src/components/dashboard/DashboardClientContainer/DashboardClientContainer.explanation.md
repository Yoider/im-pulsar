# DashboardClientContainer Explanation

El componente `DashboardClientContainer` sirve como la raíz de interacción interactiva dentro del panel de control de Impulsar. Se encarga de gestionar el estado del dashboard sin recargar la página entera, promoviendo una experiencia de Single Page Application (SPA).

## Decisiones de Diseño

### 1. Inyección de Vistas del Lado del Servidor
Para evitar descargas innecesarias y problemas de seguridad de renderizado del lado del cliente, el contenedor recibe `clientView` y `adminDefaultView` como `ReactNode`s pre-renderizados desde el Server Component del Dashboard (`src/app/dashboard/page.tsx`). Esto asegura que:
- Los datos iniciales del usuario se resuelven en el servidor.
- El cliente no tiene que implementar fetching pesado al cargar la pestaña "inicio".
- Se minimiza el código cliente innecesario.

### 2. Coordinación de Pestañas
El estado `activeTab` actúa como el conmutador dinámico de paneles. Al agregar la pestaña `"docs"`, la inyección de `<DocsPanel />` ocurre de manera instantánea sobre la misma área principal de trabajo, manteniendo los gradientes decorativos de fondo y la estructura general sin alterar la barra lateral.

### 3. Redirección de Cierre de Sesión Segura
La integración con Auth.js se maneja centralizadamente a través de `handleLogout`, limpiando las cookies de sesión y forzando una redirección limpia a `/`.
