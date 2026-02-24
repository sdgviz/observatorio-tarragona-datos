## Context

The Diputación de Tarragona sustainability project tracks indicators across three families: ODS (Sustainable Development Goals), Agenda Urbana (AU), and descriptive indicators. Data currently lives in ~10 CSV files with denormalized structures — metadata columns contain semicolon-separated lists of parent references, indicator values are mixed across types in single files, and there are no explicit foreign keys.

The target is a normalized SQLite database following the ER schema in `docs/architecture.md`. This database will be consumed by a Nuxt frontend application. The dataset is incomplete (only 7 municipalities, no Catalan translations yet), so the pipeline must handle partial data gracefully and be re-runnable as new data arrives.

The transform process lives in the `diputacion_tarragona_data` repository, separate from the Nuxt frontend in `diputacion_tarragona`.

## Goals / Non-Goals

**Goals:**
- Produce a correct, normalized SQLite database from the CSV dataset in a single CLI invocation
- Make the pipeline idempotent: re-running with the same input produces the same output
- Structure the code so integrity/validation tests can be inserted before the transformation step in a future task
- Handle the current partial dataset without errors (missing translations, sparse municipalities)
- Keep the pipeline simple and maintainable — this is a batch ETL, not a streaming system

**Non-Goals:**
- Real-time or incremental sync — full rebuild each run is acceptable given the small dataset size
- Catalan translations — `METADATA_CAT` and `DICCIONARIO_CAT` tables will be created empty (schema only)
- Data validation/integrity checks — explicitly deferred to a future task as noted by the user
- Direct Supabase/PostgreSQL loading — SQLite output is the deliverable; migration to other databases is a separate concern
- Frontend integration — the frontend will consume the database independently

## Decisions

### 1. SQLite as output format

**Choice**: Produce a single `.db` SQLite file.

**Rationale**: SQLite is zero-config, portable, and can be directly read by the Nuxt app via `better-sqlite3` or deployed as a static asset. For the current dataset size (~1500 indicator rows, 7 municipalities), there's no benefit to a heavier database. If migration to PostgreSQL/Supabase is needed later, the schema is standard SQL and the data can be dumped.

**Alternatives considered**:
- PostgreSQL directly: Adds infrastructure dependency, not needed at this scale
- JSON output: Loses relational integrity guarantees
- SQL dump files: Harder to validate; SQLite gives us a queryable artifact

### 2. Pipeline architecture: sequential phases

**Choice**: Three-phase pipeline: **Parse → Transform → Load**, executed sequentially in a single process.

```
CSV files → [Parse] → in-memory maps → [Transform] → normalized records → [Load] → SQLite DB
```

**Rationale**: The dataset fits entirely in memory (<10MB). A simple sequential pipeline is easy to reason about, debug, and extend. Each phase is a separate module, so validation hooks can be inserted between Parse and Transform later.

**Alternatives considered**:
- Stream-based processing: Overkill for this data size, adds complexity
- Per-table scripts: Harder to maintain cross-table references (e.g., type routing needs metadata lookup)

### 3. Indicator type routing via metadata lookup

**Choice**: Parse `metadatos_agendas.csv` first to build a `Map<indicador, clase>`. When loading `indicadores_agendas.csv`, look up each indicator's `clase` to route rows to the correct target table (`INDICADORES_AGENDAS` for "agendas", `INDICADORES_ODS` for indicators that have ODS parent references, `INDICADORES_DESCRIPTIVOS` for "descriptivo").

**Rationale**: The source data mixes all non-descriptive indicators in `indicadores_agendas.csv`. The `clase` column in metadata is the authoritative type discriminator. Descriptive indicators are already in a separate file (`descriptivos.csv`).

### 4. Parent-child extraction from semicolon-separated columns

**Choice**: Extract `ARQUITECTURA_L2` relationships by parsing the `ods`/`meta` and `aue1`/`aue2` columns in `metadatos_agendas.csv`. These contain semicolon-separated lists of parent dimension IDs.

**Rationale**: The architecture diagram shows `ARQUITECTURA_L2` as a junction table linking metadata and diccionario entries. The source of these relationships is the indicator metadata, where each indicator lists which L1/L2 dimensions it belongs to.

### 5. Promedio mapping by source file

**Choice**: Map promedio CSV files to target tables based on their source:
- `promedios_municipio_meta_ods.csv` → `PROMEDIOS_ODS`
- `promedios_municipio_ods_objetivo.csv` → `PROMEDIOS_ODS` (higher aggregation level)
- `promedios_municipio_objetivo_aue.csv` → `PROMEDIOS_AGENDAS`

The `id_dict` foreign key maps to the dimension identifier from `diccionario.csv`.

### 6. Technology choices

**Choice**: Node.js with `csv-parse` for CSV parsing and `better-sqlite3` for database operations.

**Rationale**: 
- `csv-parse`: Mature, handles quoted fields and encoding edge cases, supports sync and stream APIs
- `better-sqlite3`: Synchronous API ideal for batch ETL, uses native SQLite bindings for performance, supports transactions

### 7. Project structure

```
transform/
├── package.json
├── src/
│   ├── index.ts          # CLI entry point
│   ├── parse/            # CSV parsers (one per source file type)
│   │   ├── metadata.ts
│   │   ├── diccionario.ts
│   │   ├── indicadores.ts
│   │   ├── descriptivos.ts
│   │   ├── regiones.ts
│   │   ├── promedios.ts
│   │   └── umbrales.ts
│   ├── schema/           # SQL DDL statements
│   │   └── tables.ts
│   ├── transform/        # Data normalization logic
│   │   ├── metadata.ts
│   │   ├── arquitectura.ts
│   │   ├── indicadores.ts
│   │   └── promedios.ts
│   └── load/             # SQLite insertion logic
│       └── loader.ts
└── tsconfig.json
```

## Risks / Trade-offs

- **[Indicator ID inconsistency]** → Some indicators use numeric IDs (e.g., `1`, `3`) while descriptive indicators use string codes (e.g., `D-1`, `D-2-a`). All IDs will be stored as strings in the database. The parse phase must normalize consistently.

- **[Semicolon-separated parent references]** → Parsing `ods`, `meta`, `aue1`, `aue2` columns requires careful handling of empty values and varying formats. Mitigation: unit-testable parser functions isolated in the parse module.

- **[Missing data in current dataset]** → Many metadata fields are empty (fuente, actualizacion, etc.), translations are missing, only 7 municipalities exist. Mitigation: all nullable columns default to NULL; the pipeline does not fail on missing optional data.

- **[Promedio aggregation levels]** → The three promedio files represent different aggregation levels (meta→ODS, objetivo→ODS, objetivo→AUE). The schema has two tables (`PROMEDIOS_ODS`, `PROMEDIOS_AGENDAS`). We need to correctly identify which `id_dict` each row maps to. Mitigation: the `meta_ods` and `ods_objetivo` columns in the CSV directly correspond to diccionario dimensions.

- **[Future validation hook]** → The pipeline architecture deliberately separates Parse from Transform so that validation/integrity checks can be inserted between them. This is a known future requirement — the interface boundary between phases should be kept clean.
