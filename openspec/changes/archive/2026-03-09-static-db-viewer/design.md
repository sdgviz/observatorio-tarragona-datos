## Context

El pipeline de `diputacion_tarragona_data` genera una base de datos SQLite normalizada con información de tres familias de indicadores: ODS, Agenda Urbana (AU) y Agenda Urbana descriptiva. Actualmente existe un informe estático de integridad de CSV que se publica en `docs/csv-integrity/`, pero no hay una vista estática de la propia base de datos que permita a una persona inspeccionar qué indicadores hay por agenda y por municipio.

El objetivo de este diseño es definir cómo construir una mini web estática (sin backend) que se pueda publicar en GitHub Pages y que permita:

- Explorar las agendas y sus indicadores de forma jerárquica, comprensible para humanos.
- Ver, para cada ciudad incluida en una muestra configurable, qué indicadores tiene disponibles dentro de cada agenda.
- Mantener el tamaño del HTML/JSON generado bajo control cuando el número de municipios crezca, mediante una configuración de muestra.

Todo ello debe integrarse de forma ligera con el pipeline existente y reutilizar, cuando sea razonable, la información ya presente en la base de datos normalizada.

## Goals / Non-Goals

**Goals:**

- Generar un conjunto de artefactos estáticos (JSON + HTML/JS sencillo) que representen:
  - La estructura jerárquica de las tres agendas (ODS, AU, descriptiva) y sus indicadores.
  - Un subconjunto de municipios (definido por configuración) con los indicadores disponibles por agenda.
- Producir una mini web estática (por ejemplo `docs/static-db-viewer/`) que:
  - Cargue los JSON generados y permita navegar por agendas, indicadores y municipios.
  - Sea fácilmente publicable en GitHub Pages sin pasos de build adicionales.
- Introducir un mecanismo de configuración de muestra de municipios simple (p.ej. un archivo JSON/YAML) que controle qué ciudades se incluyen en la generación.

**Non-Goals:**

- No se busca replicar toda la funcionalidad de la app Nuxt ni ofrecer filtros avanzados, gráficos interactivos o autenticación.
- No se pretende exponer toda la base de datos completa para todos los municipios posibles; el foco está en una muestra representativa y navegable.
- No se diseñará aún un sistema de internacionalización complejo; con un único idioma (o textos estáticos) es suficiente para esta primera versión.

## Decisions

### 1. Arquitectura general: pre-generación + web estática

**Decisión:** Utilizar un enfoque de pre-generación:

- Un script Node/TypeScript leerá la base de datos SQLite producida por el pipeline.
- A partir de ella, generará uno o varios ficheros JSON con:
  - La estructura jerárquica de agendas e indicadores.
  - Los datos mínimos necesarios por municipio de la muestra.
- Una pequeña web estática (HTML + CSS + JS plano, sin framework) consumirá esos JSON en el navegador y renderizará las vistas.

**Rationale:**

- Permite mantener la web estática y fácil de hospedar en GitHub Pages.
- Evita tener que leer SQLite en el cliente (no hay soporte directo) y mantiene la lógica de extracción en el entorno Node del pipeline.

### 2. Estructura de datos para la web estática

**Decisión:** Definir al menos tres artefactos JSON:

- `agendas.json`:
  - Describe la jerarquía de agendas e indicadores en una estructura tipo árbol, por ejemplo:
    - `agenda`: `"ods" | "au" | "desc"`
    - `niveles`: nodos con `id`, `nombre`, `children` (para objetivos, metas, etc.).
    - `indicadores`: hojas con `id_indicador`, `nombre`, `detalle`, agenda, etc.
- `municipios.json`:
  - Lista de municipios incluidos en la muestra, con:
    - Identificador de municipio (por ejemplo `codigo_ine`) y nombre.
    - Para cada agenda, conjunto de identificadores de indicadores presentes para ese municipio.
- `objetivos_metas_municipios.json`:
  - Lista de objetivos y metas de cada agenda para los municipios de la muestra.
    - Identificador de objetivo o meta (por ejemplo `ods-1.1` o `au-1.1`).
    - Nombre del objetivo o meta.
    - Valor del objetivo o meta para el municipio seleccionado.
    - Identificador del municipio.
    - Identificador de la agenda.
    - Identificador del indicador.
    - Valor del indicador para el municipio seleccionado.

La web estática cargará estos ficheros y construirá las vistas de navegación a partir de ellos.

**Rationale:**

- Separar la estructura de agendas de los datos por municipio mantiene los ficheros razonablemente pequeños y facilita futuras ampliaciones.

### 3. Configuración de muestra de municipios

**Decisión:** Utilizar un archivo de configuración simple en el repositorio de datos (por ejemplo `config/static-viewer-sample.json`) que contenga:

- Una lista explícita de `codigo_ine` de los municipios que se desean incluir en la muestra.
- Opcionalmente, reglas sencillas (p.ej. “incluir todos” o “incluir N aleatorios dentro de un rango”), pero la primera versión se centrará en una lista explícita.

El script de generación:

- Leerá la configuración.
- Filtrará los datos de la base de datos para incluir solo esos municipios en `municipios.json`.

**Rationale:**

- Sencillo de entender y versionar.
- Permite controlar de forma explícita qué ciudades se muestran sin introducir lógica de selección compleja.

### 4. Organización de carpetas y despliegue en GitHub Pages

**Decisión:** Reutilizar el patrón existente de `docs/`:

- Crear una carpeta `docs/static-db-viewer/` que contenga:
  - `index.html` (entrada principal de la mini web).
  - `assets/` (CSS/JS estático si se decide separarlo).
  - `data/agendas.json` y `data/municipios.json` (o nombres equivalentes).

La generación se integrará en un script npm (p.ej. `npm run build:static-viewer`) que:

- Asegure la existencia de la carpeta.
- Use `better-sqlite3` para abrir la base de datos y extraer información.
- Escriba los JSON en `docs/static-db-viewer/data/`.
- Copie/actualice los HTML/CSS/JS necesarios en la carpeta.

**Rationale:**

- Mantiene consistente la convención con el informe de integridad de CSV.
- Facilita que GitHub Actions publique tanto `csv-integrity` como `static-db-viewer` bajo el mismo sitio de GitHub Pages.

### 5. Tecnología de la mini web

**Decisión:** Implementar la mini web únicamente con:

- Un `index.html` estático con estructura básica.
- Una hoja de estilos ligera (CSS inline o local) para una visualización clara.
- Un pequeño script JS (sin framework) que:
  - Cargue `data/agendas.json` y `data/municipios.json`.
  - Rellene menús/desplegables:
    - Selección de agenda (ODS, AU, descriptiva).
    - Selección de municipio (solo muestra).
  - Muestre la jerarquía de indicadores de forma legible (listas anidadas, por ejemplo).

**Rationale:**

- Minimiza dependencias y tamaño de bundle.
- Evita la necesidad de un pipeline de build adicional (Webpack, Vite, etc.).

## Risks / Trade-offs

- **[Tamaño de datos si crece el número de municipios]** → Aunque se introduce una configuración de muestra, si en el futuro se decide incluir muchos más municipios, los JSON generados podrían ser grandes. La configuración explícita de muestra mitiga este riesgo en esta versión.
- **[Desfase entre base de datos y artefactos estáticos]** → Los JSON y la mini web dependen de la versión de la base de datos usada en la generación. Es importante documentar que la web refleja el estado en el momento del último build, no necesariamente el más reciente si hay cambios posteriores.
- **[Complejidad de la jerarquía]** → La estructura de agendas (especialmente ODS y AU) puede tener varios niveles. Una representación demasiado simple puede no capturar toda la semántica; la primera versión se centrará en mostrar algo comprensible aunque no sea exhaustivo a nivel de modelo.
- **[Límite de funcionalidad]** → Al optar por un HTML/JS muy simple, se renuncia a interacciones más avanzadas (búsquedas complejas, gráficos, etc.) en esta fase, aunque siempre se podrán añadir en cambios futuros.

