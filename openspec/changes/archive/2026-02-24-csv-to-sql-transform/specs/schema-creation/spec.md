## ADDED Requirements

### Requirement: Create METADATA table
The system SHALL create a `METADATA` table with columns: `id_indicador` (TEXT, PRIMARY KEY), `tipo` (TEXT, one of 'agenda', 'ods', 'descriptivo'), and all extra data columns from the source metadata (unidad, tipo_dato, formula, umbral_optimo, umbral_malo, fuente, actualizacion, corte_muestra, muestra_ods, muestra_aue).

#### Scenario: Table created with correct schema
- **WHEN** the schema creation runs
- **THEN** the `METADATA` table exists with `id_indicador` as PRIMARY KEY and `tipo` as a NOT NULL TEXT column

### Requirement: Create METADATA_ES table
The system SHALL create a `METADATA_ES` table with columns: `id_indicador` (TEXT, FOREIGN KEY to METADATA), `nombre` (TEXT), `descripcion` (TEXT).

#### Scenario: Foreign key to METADATA
- **WHEN** the `METADATA_ES` table is created
- **THEN** `id_indicador` SHALL reference `METADATA(id_indicador)`

### Requirement: Create METADATA_CAT table
The system SHALL create a `METADATA_CAT` table with the same structure as `METADATA_ES`: `id_indicador` (TEXT, FK), `nombre` (TEXT), `descripcion` (TEXT).

#### Scenario: Empty table for future translations
- **WHEN** the schema is created
- **THEN** the `METADATA_CAT` table exists with the correct schema but contains no rows

### Requirement: Create REGIONES table
The system SHALL create a `REGIONES` table with columns: `codigo_ine` (TEXT, PRIMARY KEY), `nombre` (TEXT), and additional columns for `poblacion`, `id_poblacion`, `id_especial`.

#### Scenario: Table with unique municipality codes
- **WHEN** the `REGIONES` table is created
- **THEN** `codigo_ine` is the PRIMARY KEY ensuring uniqueness

### Requirement: Create INDICADORES_AGENDAS table
The system SHALL create an `INDICADORES_AGENDAS` table with columns: `id_indicador` (TEXT, FK to METADATA), `codigo_ine` (TEXT, FK to REGIONES), `periodo` (INTEGER), `valor` (REAL), and additional measurement columns (`indice`, `categoria`, `no_agregar`, `texto`).

#### Scenario: Composite reference integrity
- **WHEN** the table is created
- **THEN** it SHALL have foreign keys to both `METADATA` and `REGIONES`

### Requirement: Create INDICADORES_ODS table
The system SHALL create an `INDICADORES_ODS` table with the same column structure as `INDICADORES_AGENDAS`.

#### Scenario: Separate table for ODS indicators
- **WHEN** the table is created
- **THEN** it SHALL only contain indicators where `METADATA.tipo = 'ods'`

### Requirement: Create INDICADORES_DESCRIPTIVOS table
The system SHALL create an `INDICADORES_DESCRIPTIVOS` table with columns: `id_indicador` (TEXT, FK), `codigo_ine` (TEXT, FK), `periodo` (INTEGER), `valor` (REAL), `umbral` (TEXT).

#### Scenario: Descriptive indicator storage
- **WHEN** the table is created
- **THEN** it includes the `umbral` text column specific to descriptive indicators

### Requirement: Create DICCIONARIO table
The system SHALL create a `DICCIONARIO` table with columns: `id_dict` (TEXT, PRIMARY KEY), `nivel` (INTEGER), `agenda` (TEXT), `logo` (TEXT), and extra data columns.

#### Scenario: Dictionary with composite ID
- **WHEN** the table is created
- **THEN** `id_dict` SHALL encode the dimension identifier (the `dimension` value from the CSV) qualified by agenda type

### Requirement: Create DICCIONARIO_ES and DICCIONARIO_CAT tables
The system SHALL create translation tables for the dictionary with: `id_dict` (TEXT, FK), `nombre` (TEXT), `descripcion` (TEXT).

#### Scenario: Spanish translations populated
- **WHEN** the schema and data are loaded
- **THEN** `DICCIONARIO_ES` contains Spanish names/descriptions from the source CSV

#### Scenario: Catalan translations empty
- **WHEN** the schema is created
- **THEN** `DICCIONARIO_CAT` exists with correct schema but no rows

### Requirement: Create ARQUITECTURA_L2 table
The system SHALL create an `ARQUITECTURA_L2` table with columns: `parent` (TEXT), `child` (TEXT), representing parent-child relationships between dictionary entries and metadata indicators.

#### Scenario: Junction table structure
- **WHEN** the table is created
- **THEN** `parent` references a diccionario dimension and `child` references a metadata indicator

### Requirement: Create PROMEDIOS_ODS table
The system SHALL create a `PROMEDIOS_ODS` table with columns: `id_dict` (TEXT, FK to DICCIONARIO), `codigo_ine` (TEXT, FK to REGIONES), `periodo` (INTEGER), `valor` (REAL), and additional aggregation columns (`n_indicadores`, `ods_objetivo`).

#### Scenario: ODS averages storage
- **WHEN** the table is created
- **THEN** it stores promedio data from both `promedios_municipio_meta_ods` and `promedios_municipio_ods_objetivo` sources

### Requirement: Create PROMEDIOS_AGENDAS table
The system SHALL create a `PROMEDIOS_AGENDAS` table with columns: `id_dict` (TEXT, FK), `codigo_ine` (TEXT, FK), `periodo` (INTEGER), `valor` (REAL), and additional columns (`n_indicadores`).

#### Scenario: Agenda averages storage
- **WHEN** the table is created
- **THEN** it stores promedio data from `promedios_municipio_objetivo_aue`

### Requirement: Enable foreign key enforcement
The system SHALL enable SQLite foreign key enforcement (`PRAGMA foreign_keys = ON`) before any data insertion.

#### Scenario: Foreign key pragma
- **WHEN** the database connection is opened
- **THEN** the system executes `PRAGMA foreign_keys = ON` before creating tables or inserting data
