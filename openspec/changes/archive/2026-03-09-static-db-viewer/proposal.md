## Why

La base de datos generada por el pipeline actual es relativamente compleja y no es trivial inspeccionarla a simple vista. Para validar su integridad “humana” (más allá de checks automáticos) es útil disponer de una vista estática que permita navegar por agendas, indicadores y municipios sin necesidad de levantar la app Nuxt principal ni conectar a servicios externos.

Además, queremos que esta vista pueda vivir en GitHub Pages como un sitio completamente estático, de forma que cualquier persona (técnica o no) pueda revisar parte de la estructura y contenido de la base de datos desde un navegador, incluso en entornos donde no sea fácil ejecutar el pipeline completo.

## What Changes

- Crear una mini web estática (sin backend) que consuma artefactos estáticos derivados de la base de datos y los presente en GitHub Pages.
- Mostrar, para cada una de las tres agendas (ODS, Agenda Urbana, Agenda Urbana descriptiva), los indicadores disponibles organizados de forma jerárquica y comprensible para humanos.
- Permitir navegar por municipio: para cada ciudad incluida en la muestra, mostrar qué indicadores tiene disponibles dentro de cada agenda y mostrar el valor de cada indicador junto con su identificador.
- Además del indicador, mostrar también el valor de los objetivos y metas (Level 1 y 2) en el arbol de la agenda urbana y ods
- Introducir un mecanismo de configuración para limitar la muestra de municipios cuando el número total sea grande, dado que la web se generará de forma estática y no puede incluir un volcado completo de toda la base de datos en un único HTML.
- Integrar la generación de esta web estática en el flujo de build del repositorio de datos (o en un paso dedicado) para que se pueda publicar después en GitHub Pages junto con otros informes (por ejemplo, los de integridad de CSV).

## Capabilities

### New Capabilities
- `static-db-viewer-web`: Sitio web estático que permite explorar de forma jerárquica las agendas (ODS, AU y descriptiva) y sus indicadores, y ver para cada municipio de la muestra qué indicadores están disponibles.
- `static-db-viewer-sampling-config`: Configuración de muestra de municipios (por ejemplo, archivo de configuración simple) que define qué subconjunto de ciudades se incluirá en la generación estática del visualizador.

### Modified Capabilities
- `<existing-name>`: _Ninguna; este cambio añade nuevas capacidades sin modificar requerimientos de capacidades existentes._

## Impact

- **Código afectado**:
  - Repositorio de datos (`diputacion_tarragona_data`), añadiendo:
    - Lógica para extraer de la base de datos la información necesaria (estructura de agendas, indicadores y municipios) en formato estático (JSON u otro).
    - Un pequeño generador de sitio estático (HTML/CSS/JS mínimo) que lea esos ficheros y construya vistas navegables.
  - Opcionalmente integración con el repositorio Nuxt solo a efectos de despliegue en GitHub Pages (por ejemplo, compartiendo la carpeta `docs/`), pero la web en sí debe ser autocontenida.
- **Datos afectados**:
  - Lectura de la base de datos SQLite generada por el pipeline para construir artefactos de visualización.
  - Archivo(s) de configuración de muestra de municipios que controlan qué subconjunto se incluye en la generación estática.
- **Sistemas y flujos afectados**:
  - Pipeline de generación de artefactos estáticos (similar al reporte de integridad de CSV) y posterior publicación en GitHub Pages.
  - Proceso manual de verificación visual de integridad de la base de datos por parte de personas no técnicas.

