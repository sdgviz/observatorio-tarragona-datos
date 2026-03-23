# Static DB viewer sampling config

## ADDED Requirements

### Requirement: Municipality sampling configuration file
The system SHALL provide a configuration file that defines which municipalities are included in the static DB viewer sample.

#### Scenario: Configuration file defines municipality sample
- **WHEN** the static viewer generation script runs
- **THEN** it SHALL read a configuration file (for example `config/static-viewer-sample.json`)
- **AND THEN** the configuration SHALL specify a list of municipality identifiers (for example `codigo_ine`) to include in the sample

### Requirement: Static viewer respects municipality sample
The static viewer generation process SHALL restrict the municipalities included in the static JSON data to those defined in the sampling configuration file.

#### Scenario: Only configured municipalities appear in viewer
- **WHEN** the configuration file lists a subset of municipalities
- **AND WHEN** the static data generation process runs
- **THEN** the resulting `municipios` JSON used by the viewer SHALL only contain that subset of municipalities
- **AND THEN** the viewer SHALL only offer those municipalities in its selection UI

### Requirement: Fallback behavior when no sample is configured
The sampling configuration capability SHALL define a clear behavior for the case when no explicit sample is configured.

#### Scenario: No sample configuration present
- **WHEN** the static viewer generation script runs and no sampling configuration file is found
- **THEN** the system SHALL either (a) include all available municipalities or (b) use a documented safe default strategy
- **AND THEN** the chosen default strategy SHALL be documented so that users know which municipalities are included
