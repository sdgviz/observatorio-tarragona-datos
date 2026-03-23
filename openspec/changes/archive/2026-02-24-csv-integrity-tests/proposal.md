## Why

Los CSV de entrada son la fuente única de verdad para construir la base de datos SQLite que consumirá el frontend. Ahora mismo el pipeline asume que los archivos son válidos, pero no hay una verificación previa sistemática que se pueda ejecutar de forma independiente antes de generar la base de datos. Esto hace difícil detectar a tiempo errores de formato o de datos cuando se actualice el dataset manualmente.

Además, en el futuro los checks deberán ejecutarse en GitHub Actions y sus resultados tendrán que ser visibles de forma sencilla (por ejemplo, vía GitHub Pages). Definir desde ahora una batería mínima de tests de integridad y un formato de salida “web-friendly” reducirá riesgos cuando el volumen de datos crezca y cuando más personas toquen los CSV.

## What Changes

- Introducir una herramienta de verificación de integridad para los CSV del proyecto `diputacion_tarragona_data` que se ejecute de forma local (CLI), separada de la construcción de la base de datos.
- Definir una primera batería de pruebas básicas de formato:
  - Comprobar que existe cada uno de los archivos CSV esperados.
  - Comprobar que cada CSV se puede parsear sin errores.
  - Comprobar que en cada archivo están presentes las columnas obligatorias.
- Definir una primera batería de pruebas de consistencia de datos:
  - Para cada región definida en `regiones.csv` existe al menos un indicador asociado en los datos de indicadores.
  - Todos los identificadores de indicadores presentes en `indicadores_agendas.csv` aparecen también en `metadatos_agendas.csv`.
- Definir un formato de salida estructurado (por ejemplo JSON + HTML estático) que resuma el resultado de los checks y que pueda ser servido tal cual desde una carpeta dedicada a GitHub Pages (por ejemplo `docs/` o similar).
- Mantener el alcance acotado a esta primera batería de tests, dejando explícito que en el futuro se añadirán chequeos adicionales (rangos, umbrales, coherencia entre tablas, etc.).

## Capabilities

### New Capabilities
- `csv-integrity-check-cli`: CLI que ejecuta una batería de tests de integridad sobre los CSV de origen y devuelve un resultado estructurado (exit code + fichero(s) de resultados) que puede integrarse en CI.
- `csv-integrity-report-web`: Generación de un pequeño informe estático (HTML/JSON) a partir de los resultados de los tests, listo para ser publicado en una carpeta que pueda servir GitHub Pages.

### Modified Capabilities
- `<existing-name>`: _Ninguna por ahora; este cambio introduce nuevas capacidades sin modificar requerimientos existentes._

## Impact

- **Código afectado**:
  - Repositorio `diputacion_tarragona_data`, añadiendo un pequeño módulo/CLI para correr los tests de integridad y posiblemente una carpeta `tests/` o similar para organizar la lógica de validación.
  - Opcionalmente integración mínima en los scripts de `package.json` del proyecto de datos (p.ej. `npm run check:csv`).
- **Datos afectados**:
  - Archivos CSV de entrada: al menos `regiones.csv`, `indicadores_agendas.csv` y `metadatos_agendas.csv` (y otros que se decida cubrir más adelante).
- **Sistemas y flujos afectados**:
  - Pipeline ETL: el check de CSV se ejecutará antes de construir la base de datos, fallando rápido si los archivos no son válidos.
  - Preparación futura de CI/CD: los resultados que se generen estarán pensados para ser recogidos y publicados por GitHub Actions/GitHub Pages sin cambios estructurales adicionales.
