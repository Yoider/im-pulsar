# DocsPanel Reference

El componente `DocsPanel` sirve como catálogo interactivo de todos los componentes documentados bajo la estructura modular Diátaxis de la plataforma Impulsar.

## Ficha Técnica

- **Tipo**: Client Component (`"use client"`).
- **Ruta física**: `src/components/dashboard/DocsPanel/DocsPanel.tsx`.
- **Estilo Estético**: Cuadrícula de tarjetas con glassmorphism oscuro (`bg-slate-900/20`), bordes responsivos y badges HSL personalizados para cada subdominio.

## Dependencias e Imports

```typescript
import React from "react";
import Link from "next/link";
```

## Estructura de Datos

El componente mantiene un listado estático indexado de componentes:

```typescript
interface DocComponent {
  name: string;        // Nombre real del componente (ej: "LoginForm")
  slug: string;        // Identificador URL en minúsculas (ej: "loginform")
  description: string; // Resumen del propósito del componente
  subdomain: "landing" | "dashboard" | "ui";
  hasReference: boolean;
  hasExplanation: boolean;
}
```

## Comportamiento de Enlaces

Los botones de acción enlazan dinámicamente al Visor Catch-All:
- **Referencia**: `/dashboard/docs/[slug]/reference`
- **Explicación**: `/dashboard/docs/[slug]/explanation`
