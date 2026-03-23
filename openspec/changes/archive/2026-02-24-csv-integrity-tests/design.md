## Context

El repositorio `diputacion_tarragona_data` contiene el pipeline ETL que transforma varios ficheros CSV de origen en una base de datos SQLite normalizada. Actualmente, el pipeline asume que los CSV tienen la estructura y los datos correctos, y cualquier problema (columnas faltantes, errores de parseo, inconsistencias entre archivos) solo se detecta cuando el proceso de transformación o carga falla.

El objetivo de este cambio es introducir una primera capa de verificación de integridad que se ejecute **antes** de construir la base de datos, como un comando independiente que pueda usarse localmente y que en el futuro se integre en GitHub Actions. Esta verificación debe cubrir:

- Comprobaciones de formato mínimas (archivo existe, se puede parsear, columnas requeridas presentes).
- Comprobaciones de consistencia de datos entre archivos.
- Generación de resultados estructurados que puedan presentarse fácilmente en una página estática (GitHub Pages).

La solución debe integrarse de forma ligera con la estructura actual del proyecto, reutilizando cuando sea razonable la lógica de parseo existente en `src/parse/`.

## Goals / Non-Goals

**Goals:**

- Proveer un **CLI local** (`npm run check:csv` o similar) que ejecute una batería de tests sobre los CSV del dataset actual.
- Implementar las verificaciones concretas pedidas:
  - **Formato**:
    - Verificar que existe cada archivo esperado en el directorio de dataset.
    - Verificar que cada archivo se puede parsear sin errores.
    - Verificar que cada archivo contiene las columnas requeridas.
  - **Datos**:
    - Para cada región en `regiones.csv`, hay al menos un indicador asociado en los datos (p.ej. en `indicadores_agendas.csv`).
    - Todos los indicadores presentes en `indicadores_agendas.csv` aparecen también en `metadatos_agendas.csv`.
- Generar un **artefacto de resultados** (por ejemplo `docs/csv-integrity/report.json` + `report.html`) que resuma el estado de cada test (ok/fallo, mensajes) de forma apta para su publicación en GitHub Pages.
- Diseñar la solución de forma extensible para poder añadir más tests de integridad en el futuro sin romper la interfaz existente.

**Non-Goals:**

- No se implementarán aún checks avanzados (rangos, umbrales, validación estadística, etc.); solo se dejarán preparados los puntos de extensión.
- No se integrará todavía con GitHub Actions; el alcance actual es **ejecución local**, dejando la integración en CI para un cambio posterior.
- No se modificarán las tablas ni el esquema de la base de datos SQLite generada por el pipeline.
- No se construirá una UI compleja; el informe HTML será simple, estático y centrado en mostrar la lista de tests y su resultado.

## Decisions

### 1. Entry point y estructura del CLI

**Decisión:** Crear un nuevo entry point TypeScript en el proyecto `transform` (por ejemplo `src/check-csv.ts`) y exponerlo como script npm (`"check:csv": "tsx src/check-csv.ts"`).

**Rationale:**

- Reutiliza el stack existente (TypeScript + tsx) y la configuración de compilación ya definida.
- Mantiene separado el ciclo de vida: primero `check:csv`, luego (si pasa) `transform`.
- Permite a futuro reutilizar la misma lógica en CI simplemente llamando al script desde GitHub Actions.

**Alternativas:**

- Integrar los checks directamente en `src/index.ts` (pipeline principal). Rechazado para este cambio porque acopla demasiado la verificación con la construcción de la base de datos y dificulta ejecutar el check por separado.

### 2. Organización de los tests

**Decisión:** Implementar los tests como funciones puras agrupadas en un pequeño módulo de “runner” de integridad, por ejemplo:

- `src/integrity/checks/format.ts` → checks de formato (existencia, parseo, columnas).
- `src/integrity/checks/data.ts` → checks de consistencia de datos.
- `src/integrity/runner.ts` → orquesta la ejecución de todos los checks y produce una estructura de resultados común.

Cada test devolverá una estructura homogénea, por ejemplo:

- `id`: identificador estable del test (kebab-case).
- `description`: texto corto.
- `status`: `"pass"` | `"fail"` | `"error"`.
- `details`: mensajes adicionales (por ejemplo qué archivo o qué columna falta).

**Rationale:**

- Facilita añadir más pruebas en el futuro sin tocar el CLI ni la forma de generar informes.
- Permite ejecutar y probar los checks de forma aislada en unit tests si se desea.

### 3. Reutilización de parsers existentes

**Decisión:** Siempre que sea posible, reutilizar las funciones de parseo ya existentes en `src/parse/` (`metadata.ts`, `diccionario.ts`, `indicadores.ts`, `regiones.ts`, etc.) para:

- Comprobar que los archivos se pueden leer sin errores.
- Inspeccionar las columnas disponibles cuando los parsers exponen esa información o la determinan a partir del CSV original.

En los casos en los que las funciones actuales de parseo hagan supuestos fuertes (por ejemplo, lanzar errores difíciles de distinguir), se podrá añadir una pequeña capa de envoltura o, si fuera necesario, un parser minimalista solo para validación de cabeceras.

**Rationale:**

- Evita duplicar lógica de lectura de CSV y mantiene un único lugar donde se define cómo interpretar cada archivo.
- Si en el futuro cambia el formato de un CSV, el cambio en los parsers beneficiará automáticamente al check.

**Alternativas:**

- Escribir parsers ad hoc solo para la verificación. Rechazado para este cambio porque introduce riesgo de divergencia entre lo que “cree” el check y lo que realmente usa el pipeline.

### 4. Lista inicial de archivos y columnas requeridas

**Decisión:** Para este cambio se codificarán explícitamente:

- La lista de archivos requeridos (por ejemplo: `regiones.csv`, `indicadores_agendas.csv`, `metadatos_agendas.csv`).
- Para cada archivo, un conjunto de nombres de columnas mínimas esperadas (por ejemplo, en `indicadores_agendas.csv` los campos de identificador de indicador, código de región y periodo; en `metadatos_agendas.csv` la columna que define el identificador del indicador y columna `clase`; en `regiones.csv` el identificador de región).

La comprobación consistirá en:

- Confirmar que el archivo existe en el directorio `dataset/` configurado.
- Leer la primera línea (cabecera) y comprobar que incluye todas las columnas obligatorias.

**Rationale:**

- Cumple con el requisito de “basic format testing” sin tener que modelar aún todos los campos.
- Hace visible en un único lugar qué columnas se consideran mínimas para que el pipeline tenga sentido.

### 5. Checks de consistencia de datos

**Decisión:** Implementar las dos comprobaciones de datos especificadas como funciones dedicadas:

- `checkAtLeastOneIndicatorPerRegion`:
  - Leer `regiones.csv` para obtener la lista de regiones (códigos INE o IDs equivalentes).
  - Leer `indicadores_agendas.csv`.
  - Verificar que para cada región hay al menos una fila en los datos de indicadores.
- `checkIndicatorsHaveMetadata`:
  - Leer `indicadores_agendas.csv` para obtener el conjunto de identificadores de indicadores usados.
  - Leer `metadatos_agendas.csv` para obtener el conjunto de identificadores definidos en metadata.
  - Verificar que `indicators_in_indicadores` está incluido en `indicators_in_metadatos`.

En ambos casos, cuando el check falle se incluirá en `details` un resumen de los elementos problemáticos (por ejemplo, regiones sin indicadores, identificadores sin metadata).

**Rationale:**

- Responde exactamente a los requisitos de “Data is correct” descritos por el usuario.
- Se apoya en la semántica actual de los archivos sin introducir aún lógica específica de negocio más avanzada.

### 6. Formato de salida y carpeta GitHub Pages

**Decisión:** Definir un formato de salida mínimo pero estructurado, compuesto por:

- Un fichero JSON con el detalle de los resultados de los tests, por ejemplo:
  - `docs/csv-integrity/results.json`
- Un fichero HTML estático que lea ese JSON o renderice directamente un resumen de los resultados:
  - `docs/csv-integrity/index.html`

El CLI:

- Devolverá un código de salida distinto de cero si algún test falla.
- Siempre generará los ficheros de resultados (incluso cuando haya fallos), para poder inspeccionarlos luego.

Se elegirá una estructura sencilla de HTML (sin build step) para facilitar su publicación directa como carpeta estática.

**Rationale:**

- Cumple el requisito de “Save the output in a way that can be visualized in a githubpage folder”.
- Permite que, en el futuro, GitHub Actions solo tenga que subir la carpeta `docs/` a GitHub Pages para mostrar el informe.

**Alternativas:**

- Integrar la visualización en la app Nuxt principal. Rechazado para este cambio: queremos una solución autocontenida en el repo de datos.

## Risks / Trade-offs

- **[Acoplamiento a estructura actual del dataset]** → La lógica de checks se basará en la estructura actual de los CSV. Cambios futuros en nombres de archivos o columnas requerirán actualizar tanto parsers como tests de integridad.
- **[Rendimiento]** → Volver a leer los CSV para las comprobaciones añade algo de coste temporal, pero para el tamaño actual del dataset (pequeño) es aceptable. Si el volumen creciera mucho, se podría optimizar reutilizando resultados de parseo.
- **[Falsos negativos / falsos positivos]** → La primera versión solo cubre un subconjunto de los posibles errores. Algunos problemas seguirán pasando inadvertidos; es importante documentar que esto es una “mínima batería” de tests y no una validación total.
- **[Formato de informe sencillo]** → Al optar por un HTML estático muy simple, se limita inicialmente la riqueza de visualización, aunque esto se puede mejorar en cambios posteriores sin romper el contrato básico (JSON + HTML en la carpeta `docs/`).

