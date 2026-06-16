# Referencia Técnica: Switch

El componente `Switch` es un interruptor de palanca responsivo que actúa como reemplazo estético de los casilleros de verificación (`checkbox`) tradicionales, permitiendo conmutar entre dos estados opuestos (encendido/apagado).

---

## Props

```typescript
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}
```

| Propiedad | Tipo | Requerido | Por Defecto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `checked` | `boolean` | Sí | - | Determina la posición (activo/inactivo) del interruptor. |
| `onChange` | `(checked: boolean) => void` | Sí | - | Callback invocado cada vez que el usuario presiona el interruptor. Retorna el nuevo estado booleano. |
| `label` | `string` | No | - | Etiqueta de texto descriptiva que se posiciona a la derecha de la palanca. |
| `disabled` | `boolean` | No | `false` | Deshabilita el control y reduce su opacidad al `50%`, bloqueando clics. |

---

## Estilos y Animaciones (Tailwind)

* **Contenedor**: `w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200`
  * Activo (`checked`): `bg-indigo-600`
  * Inactivo: `bg-slate-200`
* **Manija de Desplazamiento**: `bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200`
  * Activo (`checked`): `translate-x-4`
  * Inactivo: `translate-x-0`
