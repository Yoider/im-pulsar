---
name: skill-generator
description: Automatiza la creación de nuevas habilidades (skills) de Antigravity generando la estructura de carpetas y el archivo SKILL.md correspondiente.
---

# Objetivo
Generar el andamiaje (boilerplate) de una nueva skill dentro del directorio `.agent/skills/` basándose en las especificaciones del usuario o en patrones identificados durante la interacción.

# Instrucciones
1. **Identificar la necesidad**: Determinar el nombre, la descripción y el objetivo principal de la nueva skill que se desea crear.
2. **Crear Directorios**: Crear un nuevo directorio bajo la ruta `.agent/skills/<nombre-de-la-skill>`. El nombre debe ser descriptivo, usando guiones (kebab-case).
3. **Generar SKILL.md**: Escribir el archivo `SKILL.md` dentro del nuevo directorio, iniciando obligatoriamente con el bloque de YAML frontmatter:
   ```yaml
   ---
   name: <nombre-de-la-skill>
   description: <Breve descripción de la skill>
   ---
   ```
4. **Estructura del Contenido**: El archivo `SKILL.md` debe incluir al menos las siguientes secciones estructuradas:
   - `# Objetivo`: Propósito claro y delimitado de la skill.
   - `# Instrucciones`: Guía secuencial paso a paso de cómo el agente debe ejecutar las tareas de esta skill.
   - `# Restricciones`: Límites, reglas críticas o advertencias importantes durante su uso.
   - `# Ejemplos / Plantillas` (opcional): Ejemplos de uso práctico o código base.

# Instrucciones de Análisis de Patrones
1. **Monitoreo Proactivo**: Analizar continuamente el historial de comandos, la creación de archivos y las peticiones recurrentes del usuario durante la sesión.
2. **Detección de Repeticiones**: Identificar si se repite una misma acción estructural o lógica más de 2 veces (por ejemplo, estructurar carpetas similares, repetir la escritura de componentes con la misma base, o procesos manuales de formateo de datos).
3. **Sugerencia Proactiva**: Al detectar este patrón, no esperar a que el usuario lo solicite. Proponer de forma autónoma la creación de una skill dedicada usando `skill-generator` para automatizar dicho flujo en el futuro.
