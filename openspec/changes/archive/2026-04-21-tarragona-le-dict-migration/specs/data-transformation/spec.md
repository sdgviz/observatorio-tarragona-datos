# data-transformation (delta)

## MODIFIED Requirements

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

## ADDED Requirements

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
