# LoginForm (Explicación de Diseño)

## Contexto y Decisiones de Diseño

El formulario de acceso `LoginForm` es la puerta de entrada para todos los usuarios de la plataforma Impulsar. Su estética está cuidada para impresionar al usuario en su primera interacción.

### Estética Premium y Efecto Glassmorphism
* **Diseño del contenedor**: Implementa un contenedor con fondo semi-transparente oscuro (`bg-slate-900/60`), un borde sutil (`border-slate-800`) y un desenfoque de fondo de alta fidelidad (`backdrop-blur-xl`). Esto le da un aspecto moderno de vidrio flotante que resalta sobre los gradientes decorativos de la página.
* **Typografía y Espaciados**: Sigue una jerarquía visual clara. Las etiquetas de los campos (`Email`, `Contraseña`) usan un estilo en mayúsculas compacto (`text-xs font-semibold text-slate-400 uppercase tracking-wider`) para evocar limpieza y profesionalismo técnico.

### Integración de Métodos de Acceso Híbridos
* **Credenciales Internas**: El formulario permite el acceso clásico por correo y contraseña. El manejo del envío intercepta la recarga de página por defecto (`e.preventDefault()`) y procesa el inicio de sesión asíncronamente con Auth.js, lo que permite renderizar banners de error/éxito dinámicos sin parpadeos de redirección.
* **Google OAuth**: Se ofrece como una opción alternativa rápida mediante un botón secundario estilizado con el logotipo SVG oficial de Google, optimizando la tasa de conversión en el acceso de usuarios.
