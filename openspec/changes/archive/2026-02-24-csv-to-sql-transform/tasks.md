## 1. Project Setup

- [x] 1.1 Create `transform/` directory with `package.json` (name, scripts including `"transform"` script, type: module)
- [x] 1.2 Install dependencies: `csv-parse`, `better-sqlite3`, and dev dependencies: `typescript`, `tsx`, `@types/better-sqlite3`
- [x] 1.3 Create `tsconfig.json` with Node.js ESM target configuration
- [x] 1.4 Create the source directory structure: `src/parse/`, `src/schema/`, `src/transform/`, `src/load/`

## 2. CSV Parsers

- [x] 2.1 Create `src/parse/metadata.ts` — parse `metadatos_agendas.csv` into typed records, handling semicolon-separated fields (`ods`, `meta`, `aue1`, `aue2`, `muestra_ods`, `muestra_aue`) as arrays, empty fields as null
- [x] 2.2 Create `src/parse/diccionario.ts` — parse `diccionario.csv` into records with `agenda`, `nivel`, `dimension`, `nombre`, `detalle`, `logo`
- [x] 2.3 Create `src/parse/indicadores.ts` — parse `indicadores_agendas.csv` into records, normalizing indicator IDs to strings, empty optional columns as null
- [x] 2.4 Create `src/parse/descriptivos.ts` — parse `descriptivos.csv` into records with `indicador`, `periodo`, `codigo_ine`, `valor`, `umbral`
- [x] 2.5 Create `src/parse/regiones.ts` — parse `regiones.csv` into records with all columns
- [x] 2.6 Create `src/parse/umbrales.ts` — parse `umbrales.csv` with numeric field coercion for statistical columns
- [x] 2.7 Create `src/parse/promedios.ts` — parse all three promedio CSV files into typed records (meta_ods, objetivo_aue, ods_objetivo)
- [x] 2.8 Create `src/parse/rangos.ts` — parse `rangos_descriptivos.csv` into records
- [x] 2.9 Create `src/parse/index.ts` — export a `parseAll(inputDir)` function that calls all parsers and returns a unified parsed data object

## 3. Schema Definition

- [x] 3.1 Create `src/schema/tables.ts` — define all SQL DDL statements: `METADATA`, `METADATA_ES`, `METADATA_CAT`, `REGIONES`, `INDICADORES_AGENDAS`, `INDICADORES_ODS`, `INDICADORES_DESCRIPTIVOS`, `DICCIONARIO`, `DICCIONARIO_ES`, `DICCIONARIO_CAT`, `ARQUITECTURA_L2`, `PROMEDIOS_ODS`, `PROMEDIOS_AGENDAS`
- [x] 3.2 Include foreign key constraints, NOT NULL where appropriate, and `PRAGMA foreign_keys = ON`
- [x] 3.3 Create `src/schema/index.ts` — export a `createSchema(db)` function that executes all DDL statements in dependency order (REGIONES and METADATA before indicator tables, DICCIONARIO before PROMEDIOS)

## 4. Data Transformation Logic

- [x] 4.1 Create `src/transform/metadata.ts` — transform parsed metadata records into METADATA rows (map `clase` "agendas" → "agenda"), and METADATA_ES rows (nombre, detalle → descripcion)
- [x] 4.2 Create `src/transform/arquitectura.ts` — extract ARQUITECTURA_L2 parent-child rows from metadata's semicolon-separated `ods`/`meta`/`aue1`/`aue2` columns, constructing parent IDs like `"ODS-2.4"`, `"AUE-1.1"`
- [x] 4.3 Create `src/transform/diccionario.ts` — transform diccionario records into DICCIONARIO rows (construct `id_dict` as `"{agenda}-{dimension}"`), and DICCIONARIO_ES rows
- [x] 4.4 Create `src/transform/indicadores.ts` — route indicator rows to correct target table based on metadata type lookup, and transform descriptivos rows separately
- [x] 4.5 Create `src/transform/promedios.ts` — map promedio records to PROMEDIOS_ODS/PROMEDIOS_AGENDAS, constructing `id_dict` from the dimension columns
- [x] 4.6 Create `src/transform/index.ts` — export a `transformAll(parsedData)` function that runs all transformations and returns table-ready record sets

## 5. Database Loader

- [x] 5.1 Create `src/load/loader.ts` — implement `loadAll(db, transformedData)` that inserts records into each table using prepared statements inside transactions, with progress logging (rows per table)
- [x] 5.2 Implement table insertion order respecting foreign key dependencies: REGIONES → METADATA → METADATA_ES → DICCIONARIO → DICCIONARIO_ES → ARQUITECTURA_L2 → INDICADORES_* → PROMEDIOS_*
- [x] 5.3 Handle and log warnings for skipped rows (e.g., indicators referencing missing metadata)

## 6. CLI Entry Point

- [x] 6.1 Create `src/index.ts` — CLI entry point that: parses `--input` and `--output` arguments (with defaults `../dataset/` and `../output/diputacion_tarragona.db`), deletes existing DB file if present, opens SQLite connection, runs parse → schema → transform → load pipeline, logs summary and exit
- [x] 6.2 Add `"transform"` script to `package.json`: `"tsx src/index.ts"`
- [x] 6.3 Ensure `output/` directory is created if it doesn't exist
- [x] 6.4 Verify end-to-end run: execute `npm run transform` against the current dataset and confirm the database file is created with all tables populated
