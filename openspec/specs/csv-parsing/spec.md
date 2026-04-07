## ADDED Requirements

### Requirement: Parse metadata CSV
The system SHALL read `metadatos_agendas.csv` and produce a structured array of metadata records. Each record SHALL contain all columns: `indicador`, `clase`, `nombre`, `detalle`, `fuente`, `actualizacion`, `corte_muestra`, `unidad`, `tipo`, `formula`, `umbral_optimo`, `umbral_malo`, `ods`, `meta`, `aue1`, `aue2`, `muestra_ods`, `muestra_aue`. Empty fields SHALL be represented as `null`.

#### Scenario: Standard metadata file
- **WHEN** the parser reads a valid `metadatos_agendas.csv` with 154 data rows
- **THEN** it produces 154 metadata records with `indicador` as the unique key and `clase` set to one of `"descriptivo"`, `"agendas"`, or `"ods"`

#### Scenario: Semicolon-separated fields
- **WHEN** a metadata row has `ods` value `"1;3"` and `aue1` value `"1;2;3;4;5;6;7;8;9;10"`
- **THEN** the parser produces arrays `[1, 3]` and `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]` respectively

#### Scenario: Empty optional fields
- **WHEN** a metadata row has empty `fuente`, `actualizacion`, `corte_muestra`, `umbral_optimo`, `umbral_malo` fields
- **THEN** those fields SHALL be `null` in the parsed record

### Requirement: Parse diccionario CSV
The system SHALL read `diccionario.csv` and produce structured records with fields: `agenda`, `nivel`, `dimension`, `nombre`, `detalle`, `logo`.

#### Scenario: Standard diccionario file
- **WHEN** the parser reads `diccionario.csv`
- **THEN** it produces records where `dimension` is the unique identifier within each `agenda`, and `nivel` is either `1` or `2`

### Requirement: Parse indicadores agendas CSV
The system SHALL read `indicadores_agendas.csv` and produce records with: `indicador`, `periodo`, `codigo_ine`, `valor`, `indice`, `categoria`, `no_agregar`, `texto`.

#### Scenario: Numeric indicator IDs
- **WHEN** the parser reads `indicadores_agendas.csv` containing rows with numeric `indicador` values like `1`, `3`
- **THEN** indicator IDs SHALL be stored as strings for consistency with the unified ID scheme

#### Scenario: Null optional columns
- **WHEN** a row has empty `categoria`, `no_agregar`, `texto` columns
- **THEN** those fields SHALL be `null`

### Requirement: Parse descriptivos CSV
The system SHALL read `descriptivos.csv` and produce records with: `indicador`, `periodo`, `codigo_ine`, `valor`, `umbral`.

#### Scenario: Standard descriptivos file
- **WHEN** the parser reads `descriptivos.csv`
- **THEN** all records have a string `indicador` starting with `"D-"`, a numeric `valor`, and a string `umbral` category

### Requirement: Parse regiones CSV
The system SHALL read `regiones.csv` and produce records with: `codigo_ine`, `nombre`, `poblacion`, `id_poblacion`, `id_especial`, `id_especial2`, `id_especial3`.

#### Scenario: Standard regiones file
- **WHEN** the parser reads `regiones.csv` with 7 municipality rows
- **THEN** it produces 7 records with `codigo_ine` as the unique key

#### Scenario: Optional id_especial2 and id_especial3
- **WHEN** a row has empty `id_especial2` or `id_especial3` cells
- **THEN** those fields SHALL be `null` in the parsed record

### Requirement: Parse umbrales CSV
The system SHALL read `umbrales.csv` and produce records with all statistical threshold fields: `indicador`, `nombre`, `unidad`, `conteo`, `minimo`, `maximo`, `desv_tipica`, `percentil25`, `percentil75`, `percentil10`, `percentil90`, `origen`, `umbral_optimo`, `umbral_malo`.

#### Scenario: Standard umbrales file
- **WHEN** the parser reads `umbrales.csv`
- **THEN** numeric fields (`conteo`, `minimo`, `maximo`, etc.) SHALL be parsed as numbers, not strings

### Requirement: Parse promedios CSVs
The system SHALL read the three promedio files and produce structured records for each.

#### Scenario: Parse promedios_municipio_meta_ods
- **WHEN** the parser reads `promedios_municipio_meta_ods.csv`
- **THEN** it produces records with: `codigo_ine`, `meta_ods`, `promedio_indice`, `n_indicadores`, `periodo_max`, `ods_objetivo`

#### Scenario: Parse promedios_municipio_objetivo_aue
- **WHEN** the parser reads `promedios_municipio_objetivo_aue.csv`
- **THEN** it produces records with: `codigo_ine`, `objetivo_aue`, `promedio_indice`, `n_indicadores`, `periodo_max`

#### Scenario: Parse promedios_municipio_ods_objetivo
- **WHEN** the parser reads `promedios_municipio_ods_objetivo.csv`
- **THEN** it produces records with: `codigo_ine`, `ods_objetivo`, `promedio_metas`, `n_metas`

### Requirement: Parse rangos descriptivos CSV
The system SHALL read `rangos_descriptivos.csv` and produce records with: `code`, `id`, `NMun`, `1Q`, `MEDIO`, `3Q`.

#### Scenario: Standard rangos file
- **WHEN** the parser reads `rangos_descriptivos.csv`
- **THEN** it produces records where `id` links to a descriptive indicator and `NMun` represents a population range category
