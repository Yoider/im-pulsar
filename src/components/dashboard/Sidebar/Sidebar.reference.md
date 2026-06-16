# Sidebar (Referencia Técnica)

El componente `Sidebar` representa la barra de navegación lateral izquierda en el panel principal (Dashboard) de Impulsar.

## Firma del Componente

```tsx
export default function Sidebar({
  user,
  activeTab,
  onTabChange,
  onLogout
}: SidebarProps)
```

## Propiedades (`SidebarProps`)

| Propiedad | Tipo | Obligatorio | Descripción |
| :--- | :--- | :--- | :--- |
| `user` | `UserSession` | Sí | Objeto que contiene `name`, `email` y `role` del usuario activo. |
| `activeTab` | `string` | Sí | Identificador de la pestaña o vista activa (`"inicio"`, `"admin-tools"` o `"docs"`). |
| `onTabChange` | `(tab: string) => void` | Sí | Callback ejecutado al pulsar en una opción para actualizar la vista activa en el contenedor padre. |
| `onLogout` | `() => void` | Sí | Callback ejecutado para iniciar el proceso de cierre de sesión en Auth.js. |

### Tipado Auxiliar de `UserSession`
```typescript
interface UserSession {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}
```

## Dependencias
* **React**: Biblioteca base (`useState`).
* **Tailwind CSS v4**: Utilizado nativamente para las transiciones e interactividad visual.
