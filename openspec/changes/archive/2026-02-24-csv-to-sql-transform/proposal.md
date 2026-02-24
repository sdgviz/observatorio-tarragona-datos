## Why

The project has sustainability indicator data (ODS, Agenda Urbana, descriptive) stored across multiple CSV files with denormalized structures. This data needs to be loaded into a relational SQL database following the normalized schema defined in `docs/architecture.md` so the frontend application can query it efficiently. A repeatable Node.js transformation pipeline is needed to parse, normalize, and load this data — and it must be designed to evolve as new data (e.g., translations, additional municipalities) is added incrementally.

## What Changes

- New Node.js CLI process that reads all CSV files from the `dataset/` folder and produces SQL-ready output (SQLite database file)
- Parses `metadatos_agendas.csv` into `METADATA` table, splitting indicator types (`agenda`, `ods`, `descriptivo`) based on the `clase` column
- Parses `diccionario.csv` into `DICCIONARIO` table with level information
- Extracts parent-child relationships from metadata columns (`ods`/`meta`, `aue1`/`aue2`) into `ARQUITECTURA_L2`
- Loads `indicadores_agendas.csv` values into separate `INDICADORES_AGENDAS`, `INDICADORES_ODS` tables, and `descriptivos.csv` into `INDICADORES_DESCRIPTIVOS`, routing by indicator type
- Loads `regiones.csv` into `REGIONES`
- Loads promedio files (`promedios_municipio_meta_ods.csv`, `promedios_municipio_objetivo_aue.csv`, `promedios_municipio_ods_objetivo.csv`) into `PROMEDIOS_ODS` and `PROMEDIOS_AGENDAS`
- Translation tables (`METADATA_ES`, `METADATA_CAT`, `DICCIONARIO_ES`, `DICCIONARIO_CAT`) are created with schema only — populated from `nombre`/`detalle` fields where available in Spanish; Catalan translations deferred to a future dataset delivery
- Loads `umbrales.csv` and `rangos_descriptivos.csv` as extra data attributes within the metadata/indicator structures

## Capabilities

### New Capabilities
- `csv-parsing`: Reading and parsing all CSV source files from the dataset folder with proper encoding and delimiter handling
- `schema-creation`: Creating the SQLite database schema matching the normalized architecture (all tables, foreign keys, indexes)
- `data-transformation`: Transforming and routing denormalized CSV data into the normalized relational tables, including type routing, parent-child extraction, and promedio mapping
- `cli-runner`: CLI entry point to run the full pipeline (parse → create schema → transform → load) with configuration for input/output paths

### Modified Capabilities

_None — this is a greenfield process._

## Impact

- **New dependency**: Node.js process with CSV parsing library (e.g., `csv-parse`) and SQLite driver (e.g., `better-sqlite3`)
- **New files**: Transform scripts under a `transform/` directory in the data project
- **Output artifact**: SQLite `.db` file ready to be consumed by the Nuxt frontend or deployed to Supabase
- **Future extensibility**: The pipeline structure must allow inserting integrity/validation tests before transformation (noted as a future task)
