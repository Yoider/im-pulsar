# Explicación de Diseño: Switch

Este documento describe el comportamiento interactivo y visual detrás del interruptor de palanca (`Switch`).

---

## Experiencia de Usuario e Interacción

El interruptor de palanca proporciona un método claro para realizar selecciones de encendido/apagado inmediatas.

### 1. Transición de Posición y Color
* **Animación de Desplazamiento**: Para evitar cambios de estado abruptos, la manija interna del interruptor se desplaza horizontalmente usando `transition-transform duration-200`. Al mismo tiempo, el fondo cambia de color (`transition-colors duration-200`) entre gris claro y azul índigo, proporcionando dos niveles redundantes de feedback visual.

### 2. Estado Deshabilitado
* Cuando el componente está deshabilitado (`disabled = true`), el cursor cambia a un estilo bloqueado (`cursor-not-allowed`) y la opacidad se reduce. Además, se intercepta la llamada a `onChange` para evitar cualquier mutación de estado accidental.

---

## Relaciones y Contexto

* **Formularios de Configuración**: El componente `Switch` se utiliza en formularios del panel de control de administración.
* **RootsTypeModal**: Se integra en la tabla de configuración de pasos de expedientes para permitir a los administradores marcar de forma inmediata e interactiva si un paso del flujo es **obligatorio** (`isMandatory`) o condicional.
