# data-transformation

## Purpose

CSV-to-SQLite data transformation pipeline that ingests the dataset CSV files (metadatos, diccionario, indicadores, descriptivos, promedios, etc.) and loads them into normalized SQLite tables consumed by the Nuxt application.
## Requirements
### Requirement: Map all non-descriptive indicators to INDICADORES
The system SHALL transform all indicator value rows from `indicadores_agendas.csv` whose `indicador` exists in metadata with `clase` of `"agendas"` or `"ods"` into rows for the unified `INDICADORES` table. Indicators with unknown `indicador` (not found in metadata) SHALL be skipped with a warning. Descriptive indicators are handled separately via `descriptivos.csv`.

#### Scenario: Agenda indicator mapping
- **WHEN** an indicator value row from `indicadores_agendas.csv` has an `indicador` whose metadata `clase` is `"agendas"`
- **THEN** the row is inserted into `INDICADORES`

#### Scenario: ODS indicator mapping
- **WHEN** an indicator value row has an `indicador` whose metadata `clase` is `"ods"`
- **THEN** the row is inserted into `INDICADORES`

#### Scenario: Unknown indicator skipped
- **WHEN** an indicator value row references an `indicador` not found in metadata
- **THEN** the system SHALL log a warning and skip the row

#### Scenario: Descriptivo indicators excluded
- **WHEN** an indicator value row has an `indicador` whose metadata `clase` is `"descriptivo"`
- **THEN** the row is NOT inserted into `INDICADORES` (descriptivos come from a separate CSV and go to `INDICADORES_DESCRIPTIVOS`)

#### Scenario: Row count preserved
- **WHEN** the transform completes
- **THEN** the total number of rows in `INDICADORES` SHALL equal the sum of rows that previously went into `INDICADORES_ODS` plus `INDICADORES_AGENDAS`

### Requirement: Populate METADATA from metadatos_agendas
The system SHALL transform each parsed metadata record into a `METADATA` row, mapping `indicador` → `id_indicador`, `clase` → `tipo` (normalizing: `"descriptivo"` stays, `"agendas"` → `"agenda"`, `"ods"` → `"ods"`), and all remaining fields as extra data.

#### Scenario: Type normalization
- **WHEN** a metadata record has `clase = "agendas"`
- **THEN** the `METADATA.tipo` column SHALL contain `"agenda"` (without trailing 's')

#### Scenario: All indicators populated
- **WHEN** all metadata rows are processed
- **THEN** every unique `indicador` from the CSV has exactly one row in `METADATA`

### Requirement: Populate METADATA_ES from metadata names
The system SHALL create `METADATA_ES` rows using `nombre` and `detalle` from each metadata record as `nombre` and `descripcion` respectively.

#### Scenario: Spanish metadata translations
- **WHEN** a metadata record has `nombre = "Superficie de cobertura artificial por municipio"` and `detalle` is empty
- **THEN** `METADATA_ES` contains a row with that `nombre` and `descripcion = NULL`

### Requirement: Extract ARQUITECTURA_L2 relationships
The system SHALL parse the semicolon-separated `ods`, `meta`, `le`, `le2` columns from metadata and produce `ARQUITECTURA_L2` rows linking parent dictionary dimensions to child indicators. The former `aue1` / `aue2` columns SHALL no longer be read.

#### Scenario: ODS parent-child from meta column
- **WHEN** an indicator has `meta = "2.4"` and `ods = "2"`
- **THEN** `ARQUITECTURA_L2` SHALL contain rows with `parent` referencing the diccionario entry for meta `2.4` (ODS) and `child` = the indicator ID

#### Scenario: Tarragona parent-child from le2 column
- **WHEN** an indicator has `le2 = "1.2;4.3"` and `le = "1;4"`
- **THEN** `ARQUITECTURA_L2` SHALL contain rows with `parent = 'TARRAGONA-1.2'` and `parent = 'TARRAGONA-4.3'`, each with `child` = the indicator ID

#### Scenario: Tarragona parent-child from le column
- **WHEN** an indicator has `le = "1;3;5"`
- **THEN** `ARQUITECTURA_L2` SHALL contain rows with `parent = 'TARRAGONA-1'`, `parent = 'TARRAGONA-3'`, `parent = 'TARRAGONA-5'`, each pointing to the same child indicator

#### Scenario: Multiple parents
- **WHEN** an indicator has `le = "1;2;3"` (semicolon-separated)
- **THEN** one `ARQUITECTURA_L2` row is created for each parent, all pointing to the same child indicator

#### Scenario: Empty parent columns
- **WHEN** an indicator has empty `ods` and `meta` columns (or empty `le` and `le2`)
- **THEN** no `ARQUITECTURA_L2` rows are created for that indicator's ODS (resp. Tarragona) relationships

#### Scenario: Legacy AUE columns are ignored
- **WHEN** the CSV still contains non-empty `aue1` or `aue2` columns (e.g. during a transitional client delivery)
- **THEN** the transform SHALL NOT produce `ARQUITECTURA_L2` rows from those columns
- **AND** no row in `ARQUITECTURA_L2` SHALL have a `parent` starting with `'AUE-'`

### Requirement: Transform diccionario to DICCIONARIO
The system SHALL transform parsed diccionario records into `DICCIONARIO` rows, constructing `id_dict` from the combination of `agenda` and `dimension`. Supported agenda values SHALL include `ODS`, `2030`, and `TARRAGONA`; the legacy `AUE` value SHALL no longer appear in rebuilt dictionaries.

#### Scenario: Tarragona dimension ID
- **WHEN** a diccionario record has `agenda = "TARRAGONA"` and `dimension = "1.2"`
- **THEN** the resulting `DICCIONARIO.id_dict` SHALL be `"TARRAGONA-1.2"`

#### Scenario: Tarragona level-1 ID
- **WHEN** a diccionario record has `agenda = "TARRAGONA"` and `dimension = "3"`
- **THEN** the resulting `DICCIONARIO.id_dict` SHALL be `"TARRAGONA-3"`

#### Scenario: ODS dimension ID
- **WHEN** a diccionario record has `agenda = "ODS"` and `dimension = "2"`
- **THEN** the resulting `DICCIONARIO.id_dict` SHALL be `"ODS-2"`

#### Scenario: AUE rows are not emitted
- **WHEN** the input `diccionario.csv` no longer contains rows with `agenda = 'AUE'`
- **THEN** the rebuilt `DICCIONARIO` SHALL contain no row with `id_dict` starting with `'AUE-'`

### Requirement: Populate DICCIONARIO_ES from diccionario names
The system SHALL create `DICCIONARIO_ES` rows using `nombre` and `detalle` from each diccionario record.

#### Scenario: Spanish dictionary translations
- **WHEN** a diccionario record has `nombre = "ORDENAR EL TERRITORIO..."` and `detalle` is empty
- **THEN** `DICCIONARIO_ES` contains a row with that `nombre` and `descripcion = NULL`

### Requirement: Transform promedios to target tables
The system SHALL map promedio records to the correct target tables:
- `promedios_municipio_meta_ods.csv` → `PROMEDIOS_ODS` with `id_dict` constructed from `meta_ods` (e.g., `"ODS-10.2"`)
- `promedios_municipio_ods_objetivo.csv` → `PROMEDIOS_ODS` with `id_dict` from `ods_objetivo` (e.g., `"ODS-10"`)
- `promedios_municipio_objetivo_aue.csv` → `PROMEDIOS_AGENDAS` with `id_dict` from `objetivo_aue`, prefixed with `TARRAGONA-` (e.g., `"TARRAGONA-1"` for a row where `objetivo_aue = "1"`)

Until the source file `promedios_municipio_objetivo_aue.csv` is renamed by the client, the transform SHALL keep reading it from that filename but SHALL reinterpret its `objetivo_aue` values as Tarragona línea-estratégica ids (`1..6`) and emit them under the `TARRAGONA-` prefix.

#### Scenario: Meta ODS promedios mapping
- **WHEN** a promedios_municipio_meta_ods row has `meta_ods = "10.2"` and `codigo_ine = "08096"`
- **THEN** a `PROMEDIOS_ODS` row is created with `id_dict = "ODS-10.2"` and `codigo_ine = "08096"` and `valor` = `promedio_indice`

#### Scenario: Tarragona promedios mapping
- **WHEN** a promedios_municipio_objetivo_aue row has `objetivo_aue = "3"` and `codigo_ine = "43148"`
- **THEN** a `PROMEDIOS_AGENDAS` row is created with `id_dict = "TARRAGONA-3"`, `codigo_ine = "43148"` and `valor` = `promedio_indice`

#### Scenario: No AUE-prefixed promedios emitted
- **WHEN** the promedios CSV is processed
- **THEN** no row SHALL be inserted into `PROMEDIOS_AGENDAS` with an `id_dict` starting with `'AUE-'`

### Requirement: Load regiones directly
The system SHALL load parsed `regiones.csv` records directly into the `REGIONES` table without transformation, mapping `codigo_ine` → `codigo_ine`, `nombre` → `nombre`, `poblacion` → `poblacion`, `id_poblacion` → `id_poblacion`, `id_especial` → `id_especial`, `id_especial2` → `id_especial2`, `id_especial3` → `id_especial3`.

#### Scenario: Direct region loading
- **WHEN** `regiones.csv` contains 7 rows
- **THEN** the `REGIONES` table SHALL contain exactly 7 rows with matching data

#### Scenario: id_especial2 and id_especial3 persisted
- **WHEN** a parsed region row has non-empty `id_especial2` or `id_especial3`
- **THEN** the corresponding `REGIONES` row SHALL store those values in the same-named columns

### Requirement: Wrap insertions in transactions
The system SHALL execute all data insertions within a single SQLite transaction per table group to ensure atomicity and performance.

#### Scenario: Transaction rollback on error
- **WHEN** an insertion error occurs mid-batch
- **THEN** the entire transaction for that table group SHALL be rolled back, leaving the database in a consistent state

### Requirement: Idempotent execution
The system SHALL produce identical output when run multiple times with the same input. The database file SHALL be recreated from scratch on each run (delete if exists, then create).

#### Scenario: Re-run produces same result
- **WHEN** the pipeline runs twice with the same CSV input
- **THEN** the resulting database files SHALL be byte-equivalent

### Requirement: Metadata record exposes le and le2
The `MetadataRecord` produced by the parser SHALL expose the semicolon-parsed `le` (level-1 Tarragona ids) and `le2` (level-2 Tarragona dimensions) columns from `metadatos_agendas.csv`. The legacy `aue1` / `aue2` fields SHALL be removed from the `MetadataRecord` type.

#### Scenario: Parser populates le and le2
- **WHEN** `metadatos_agendas.csv` has a row with `le = "2;3"` and `le2 = "2.1;3.2"`
- **THEN** the parsed `MetadataRecord` SHALL have `le = ["2", "3"]` and `le2 = ["2.1", "3.2"]`

#### Scenario: Empty le/le2 parsed as empty arrays
- **WHEN** a row has empty `le` and `le2` columns
- **THEN** the parsed `MetadataRecord` SHALL have `le = []` and `le2 = []`

### Requirement: Strict validation of Tarragona orphan references
The build SHALL include an integrity check that verifies every distinct value of `le` and `le2` in `metadatos_agendas.csv` corresponds to a row in `diccionario.csv` with `agenda = 'TARRAGONA'` and the matching `nivel` (1 for `le`, 2 for `le2`). If any value is unknown, the build SHALL fail with a non-zero exit code and SHALL print a summary listing each orphan code and the indicator ids in which it appears.

#### Scenario: Unknown le value fails the build
- **WHEN** an indicator has `le = "99"` and no row with `agenda = 'TARRAGONA'`, `nivel = 1`, `dimension = '99'` exists in the dictionary
- **THEN** the integrity check SHALL fail
- **AND** the build SHALL exit with a non-zero status
- **AND** the error message SHALL include the orphan value `"99"` and the indicator id

#### Scenario: Unknown le2 value fails the build
- **WHEN** an indicator has `le2 = "1.1"` and no row with `agenda = 'TARRAGONA'`, `nivel = 2`, `dimension = '1.1'` exists in the dictionary
- **THEN** the integrity check SHALL fail with a clear summary of the orphan code(s) and their indicator ids

#### Scenario: All references known passes the check
- **WHEN** every `le` and `le2` value has a corresponding `TARRAGONA` row in the dictionary at the matching level
- **THEN** the integrity check SHALL pass without output to stderr

