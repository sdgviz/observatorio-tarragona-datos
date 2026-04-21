# Municipios catalog API

## Requirements

### Requirement: Municipio list available for comparison picker

The system SHALL provide a way for the client to obtain the full list of municipios (at minimum `codigo_ine` and display name) suitable for populating a searchable multi-select.

#### Scenario: Client loads catalog for SelectMenu

- **WHEN** the ODS municipio indicators view needs to render the comparison picker
- **THEN** the client SHALL obtain municipio rows from the existing `GET /api/municipios/list` endpoint (or a documented equivalent) without requiring a new bespoke endpoint unless the existing contract is insufficient

#### Scenario: Optional population filter preserved

- **WHEN** the client calls the list endpoint without optional filters
- **THEN** the response SHALL include all municipios needed for comparison across the province dataset exposed by the app
