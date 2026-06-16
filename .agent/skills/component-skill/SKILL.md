---
name: component-skill
description: Genera componentes reutilizables de React utilizando Next.js y Tailwind CSS v4 siguiendo principios de arquitectura limpia.
---

# Objetivo
Automatizar la creación de componentes de interfaz de usuario (UI) eficientes, tipados con TypeScript y estilizados con Tailwind CSS v4, decidiendo correctamente su ubicación (global/local), su tipo (Server/Client) y maximizando la reutilización de componentes ya existentes en el proyecto.

# Instrucciones
1. **Auditoría de Código**: Antes de crear cualquier componente, escanear la carpeta `/components/ui` para verificar si ya existen componentes que puedan ser reutilizados o extendidos (ej. usar un botón base existente en lugar de crear uno nuevo).
2. Preguntar al usuario qué función cumplirá el componente, qué datos mostrará y si será un **componente global reutilizable** o un **componente local de único uso**.
3. Basado en la respuesta, definir la ubicación del archivo: `/components/ui` para globales o la carpeta de la vista específica para locales.
4. Evaluar si el componente necesita interactividad (como botones con acciones, formularios o estados de React).
5. Si requiere interactividad, estructurar el código como un 'Client Component' añadiendo "use client" en la primera línea.
6. Si solo muestra información, estructurarlo como un 'Server Component' moderno de Next.js.
7. Generar el código completo asegurando que sea modular y exportado por defecto.

# Restricciones
- Usar exclusivamente utilidades nativas de Tailwind CSS v4.
- Obligar el uso de TypeScript definiendo interfaces claras para las propiedades (Props).
- No incluir código de cliente (como useState) en Server Components.
- El diseño debe ser limpio, responsivo y seguir principios de arquitectura modular.
- Queda prohibido duplicar lógica o estilos si ya existe un componente base aplicable; en su lugar, se debe importar y extender el componente existente.

# Ejemplos / Plantillas

## Ejemplo 1: Server Component (Tarjeta de Usuario)
```tsx
interface UserCardProps {
  name: string;
  role: string;
}

export default function UserCard({ name, role }: UserCardProps) {
  return (
    <div className="p-6 bg-surface border border-outline rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-on-surface">{name}</h3>
      <p className="text-sm text-on-surface-variant font-medium">{role}</p>
    </div>
  );
}
```

## Ejemplo 2: Client Component (Botón Interactivo)
```tsx
"use client";

import { useState } from "react";

interface CounterButtonProps {
  label: string;
}

export default function CounterButton({ label }: CounterButtonProps) {
  const [count, setCount] = useState(0);

  return (
    <button
      onClick={() => setCount(count + 1)}
      className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition-colors"
    >
      {label}: {count}
    </button>
  );
}
```
