## ADDED Requirements

### Requirement: Route indicators by type
The system SHALL use the `clase` field from parsed metadata to route indicator values to the correct target table: indicators with `clase = "agendas"` go to `INDICADORES_AGENDAS`, indicators with `clase = "ods"` go to `INDICADORES_ODS`, and indicators with `clase = "descriptivo"` go to `INDICADORES_DESCRIPTIVOS`.

#### Scenario: Agenda indicator routing
- **WHEN** an indicator value row from `indicadores_agendas.csv` has an `indicador` whose metadata `clase` is `"agendas"`
- **THEN** the row is inserted into `INDICADORES_AGENDAS`

#### Scenario: ODS indicator routing
- **WHEN** an indicator value row has an `indicador` whose metadata `clase` is `"ods"`
- **THEN** the row is inserted into `INDICADORES_ODS`

#### Scenario: Descriptivo routing from separate file
- **WHEN** a row is read from `descriptivos.csv`
- **THEN** the row is inserted into `INDICADORES_DESCRIPTIVOS` without needing a clase lookup

#### Scenario: Unknown indicator type
- **WHEN** an indicator value row references an `indicador` not found in metadata
- **THEN** the system SHALL log a warning and skip the row

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
The system SHALL parse the semicolon-separated `ods`, `meta`, `aue1`, `aue2` columns from metadata and produce `ARQUITECTURA_L2` rows linking parent dictionary dimensions to child indicators.

#### Scenario: ODS parent-child from meta column
- **WHEN** an indicator has `meta = "2.4"` and `ods = "2"`
- **THEN** `ARQUITECTURA_L2` SHALL contain rows with `parent` referencing the diccionario entry for meta `2.4` (ODS) and `child` = the indicator ID

#### Scenario: AUE parent-child from aue2 column
- **WHEN** an indicator has `aue2 = "1.1;1.2"` and `aue1 = "1"`
- **THEN** `ARQUITECTURA_L2` SHALL contain rows with `parent` referencing diccionario entries for AUE objectives `1.1` and `1.2`, with `child` = the indicator ID

#### Scenario: Multiple parents
- **WHEN** an indicator has `aue1 = "1;2;3"` (semicolon-separated)
- **THEN** one `ARQUITECTURA_L2` row is created for each parent, all pointing to the same child indicator

#### Scenario: Empty parent columns
- **WHEN** an indicator has empty `ods` and `meta` columns
- **THEN** no `ARQUITECTURA_L2` rows are created for that indicator's ODS relationships

### Requirement: Transform diccionario to DICCIONARIO
The system SHALL transform parsed diccionario records into `DICCIONARIO` rows, constructing `id_dict` from the combination of `agenda` and `dimension` (e.g., `"AUE-1.1"`, `"ODS-2.4"`).

#### Scenario: AUE dimension ID
- **WHEN** a diccionario record has `agenda = "AUE"` and `dimension = "1.1"`
- **THEN** the resulting `DICCIONARIO.id_dict` SHALL be `"AUE-1.1"`

#### Scenario: ODS dimension ID
- **WHEN** a diccionario record has `agenda = "ODS"` and `dimension = "2"`
- **THEN** the resulting `DICCIONARIO.id_dict` SHALL be `"ODS-2"`

### Requirement: Populate DICCIONARIO_ES from diccionario names
The system SHALL create `DICCIONARIO_ES` rows using `nombre` and `detalle` from each diccionario record.

#### Scenario: Spanish dictionary translations
- **WHEN** a diccionario record has `nombre = "ORDENAR EL TERRITORIO..."` and `detalle` is empty
- **THEN** `DICCIONARIO_ES` contains a row with that `nombre` and `descripcion = NULL`

### Requirement: Transform promedios to target tables
The system SHALL map promedio records to the correct target tables:
- `promedios_municipio_meta_ods.csv` → `PROMEDIOS_ODS` with `id_dict` constructed from `meta_ods` (e.g., `"ODS-10.2"`)
- `promedios_municipio_ods_objetivo.csv` → `PROMEDIOS_ODS` with `id_dict` from `ods_objetivo` (e.g., `"ODS-10"`)
- `promedios_municipio_objetivo_aue.csv` → `PROMEDIOS_AGENDAS` with `id_dict` from `objetivo_aue` (e.g., `"AUE-1"`)

#### Scenario: Meta ODS promedios mapping
- **WHEN** a promedios_municipio_meta_ods row has `meta_ods = "10.2"` and `codigo_ine = "08096"`
- **THEN** a `PROMEDIOS_ODS` row is created with `id_dict = "ODS-10.2"` and `codigo_ine = "08096"` and `valor` = `promedio_indice`

#### Scenario: AUE promedios mapping
- **WHEN** a promedios_municipio_objetivo_aue row has `objetivo_aue = "1"` and `codigo_ine = "08096"`
- **THEN** a `PROMEDIOS_AGENDAS` row is created with `id_dict = "AUE-1"` and `codigo_ine = "08096"` and `valor` = `promedio_indice`

### Requirement: Load regiones directly
The system SHALL load parsed `regiones.csv` records directly into the `REGIONES` table without transformation, mapping `codigo_ine` → `codigo_ine`, `nombre` → `nombre`, plus extra columns.

#### Scenario: Direct region loading
- **WHEN** `regiones.csv` contains 7 rows
- **THEN** the `REGIONES` table SHALL contain exactly 7 rows with matching data

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
