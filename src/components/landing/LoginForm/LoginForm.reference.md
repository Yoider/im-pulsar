# LoginForm (Referencia Técnica)

El componente `LoginForm` es el formulario de acceso unificado en la pantalla de bienvenida (Landing) de Impulsar.

## Firma del Componente

```tsx
export default function LoginForm()
```

## Propiedades (`Props`)
Este componente no acepta propiedades externas de momento.

## Lógica Interna de Estados

| Estado | Tipo | Por Defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `email` | `string` | `""` | Almacena el correo electrónico ingresado en el campo de texto. |
| `password` | `string` | `""` | Almacena la contraseña ingresada en el campo de texto. |
| `error` | `string \| null` | `null` | Mensaje de error a mostrar si el login falla. |
| `loading` | `boolean` | `false` | Indica si hay una petición de autenticación en progreso. |
| `successMsg` | `string \| null` | `null` | Mensaje de inicio de sesión exitoso. |

## Métodos de Autenticación

### `handleSubmit(e: React.FormEvent)`
* Llama al proveedor `"credentials"` de Auth.js.
* Configura `redirect: false` para manejar las alertas de error localmente en el cliente de forma reactiva.
* En caso de éxito, redirecciona al usuario a `/dashboard` mediante `window.location.href`.

### `handleGoogleLogin()`
* Llama al proveedor `"google"` de Auth.js para iniciar la redirección y el flujo OAuth externo.

## Dependencias
* **next-auth/react**: Método `signIn`.
* **Button**: Componente de botón atómico importado de `@/components/ui/button`.
