---
name: verification-skill
description: Ejecuta pruebas estáticas de TypeScript y simula la compilación de Next.js de forma automática para asegurar la estabilidad del código antes de finalizar una tarea.
---

# Objetivo
Validar automáticamente que cualquier cambio o adición de código mantenga la integridad del proyecto, previniendo errores de importación y fallos de compilación en producción.

# Instrucciones
1. Ejecutar de forma obligatoria y automática los comandos `npx tsc --noEmit` y `npm run build` inmediatamente después de modificar o crear archivos en el proyecto.
2. Si ambos comandos finalizan con éxito (código de salida 0), dar la tarea por completada exitosamente.
3. Si se detecta un error en la terminal, analizar el mensaje (rutas rotas, errores de tipo, sintaxis) e intentar corregir el código de forma autónoma.
4. Limitar los intentos de autocorrección a un máximo de 2 veces por tarea.
5. Si tras el segundo intento el error persiste, detener el proceso de inmediato, no dar la tarea por terminada, reportar el fallo exacto al usuario y solicitar asistencia.

# Restricciones
- No ignorar las advertencias estrictas de TypeScript (`strict: true`).
- No dar por aprobada ninguna tarea si el comando `npm run build` falla.
- Informar claramente qué archivos fueron modificados durante los intentos de autocorrección.
