# Referencia Técnica: BackButton

El componente `BackButton` es un botón de navegación atómico que permite al usuario regresar a la pantalla o vista anterior de forma limpia utilizando el enrutador del cliente de Next.js.

---

## Firma del Componente

Este componente se define como un componente de cliente (`"use client"`) y no acepta ninguna propiedad externa (Props). Su firma de TypeScript es:

```typescript
export default function BackButton(): React.JSX.Element
```

---

## Dependencias de Rutas

* **Navegación**: Utiliza el gancho `useRouter` de `next/navigation` para acceder al historial de navegación local y realizar la acción de retorno en el cliente:
  ```typescript
  const router = useRouter();
  router.back();
  ```

---

## Estilos Visuales (Tailwind CSS)

El botón se visualiza como un cuadrado compacto y estilizado:
* **Estructura**: `w-8 h-8 rounded-lg flex items-center justify-center`
* **Colores y Sombras**: `bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm`
* **Transiciones**: Transición suave en cambios de estado (`transition-all duration-200`)
* **Accesibilidad**: Incluye la etiqueta nativa `title="Volver a la vista anterior"` para lectores de pantalla y tooltips del navegador.
