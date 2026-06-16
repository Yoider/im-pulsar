# DashboardClientContainer Reference

El componente `DashboardClientContainer` actúa como el orquestador principal del Dashboard de la plataforma Impulsar, coordinando las pestañas activas e inyectando las vistas correspondientes según el rol de usuario.

## Ficha Técnica

- **Tipo**: Client Component (`"use client"`).
- **Ruta física**: `src/components/dashboard/DashboardClientContainer/DashboardClientContainer.tsx`.
- **Props**:
  ```typescript
  interface DashboardClientContainerProps {
    user: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
      lastname?: string | null;
    };
    clientView: React.ReactNode;      // Vista por defecto para usuarios regulares
    adminDefaultView: React.ReactNode; // Vista por defecto para administradores
  }
  ```

## Estados Internos

- `activeTab` (`string`): Define la pestaña activa actualmente cargada en el área principal de trabajo. Valores válidos:
  - `"inicio"`: Carga `adminDefaultView` para administradores o `clientView` para clientes.
  - `"admin-tools"`: Carga el panel `<AdminToolsPanel />` (solo administradores).
  - `"docs"`: Carga el panel catálogo `<DocsPanel />` (solo administradores).

## Funciones Clave

- `handleLogout`: Llama a la función `signOut` de `next-auth/react` redirigiendo al usuario a la página de bienvenida (`/`).
