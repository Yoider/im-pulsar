# Referencia Técnica: Button

El componente `Button` es el elemento interactivo base de la interfaz de la plataforma Impulsar, diseñado bajo estándares de accesibilidad, micro-animaciones dinámicas y Tailwind CSS v4.

---

## Props

El componente extiende todas las propiedades HTML nativas de un botón (`React.ButtonHTMLAttributes<HTMLButtonElement>`) e introduce las siguientes propiedades de personalización:

| Propiedad | Tipo | Requerido | Por Defecto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `variant` | `"primary" \| "secondary" \| "ghost"` | No | `"primary"` | Define la apariencia visual del botón. |
| `size` | `"sm" \| "md" \| "lg"` | No | `"md"` | Especifica el relleno y el tamaño de fuente. |
| `className` | `string` | No | `""` | Clases de estilo adicionales para el botón. |
| `children` | `React.ReactNode` | Sí | - | Contenido o etiqueta a renderizar dentro del botón. |

---

## Firmas de Estilo y Clases (Tailwind v4)

* **Estilo Base**:
  ```css
  inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 active:scale-[0.98] select-none disabled:opacity-50 disabled:pointer-events-none
  ```

* **Variantes Visuales**:
  * `primary`: `bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-transparent`
  * `secondary`: `bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-950 shadow-sm`
  * `ghost`: `text-slate-500 hover:text-slate-800 hover:bg-slate-100/50`

* **Tamaños**:
  * `sm`: `px-3 py-1.5 text-xs`
  * `md`: `px-5 py-2.5 text-sm`
  * `lg`: `px-7 py-3.5 text-base`
