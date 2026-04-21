# Municipio comparison state

## Requirements

### Requirement: Comparison municipios stored in Pinia

The system SHALL maintain application state for ODS municipio comparison as a Pinia store containing at most two municipio identifiers (`codigo_ine`) selected by the user for comparison with the municipio currently in view.

#### Scenario: User selects two distinct municipios

- **WHEN** the user selects two municipios in the comparison control that are not the primary route municipio and are distinct from each other
- **THEN** the store SHALL hold exactly those two INEs in a defined order (e.g. selection order) and expose them to consumers as a read-only or reactive list

#### Scenario: User clears comparison

- **WHEN** the user clears all selections in the comparison control
- **THEN** the store SHALL contain zero comparison INEs and all consumers SHALL behave as single-municipio mode

#### Scenario: Primary municipio cannot be a comparison target

- **WHEN** the user attempts to add the current page municipio INE to the comparison selection
- **THEN** the system SHALL reject or filter out that INE so the store never includes the primary municipio as a comparison entry

#### Scenario: Maximum two comparison municipios

- **WHEN** the user attempts to select a third municipio while two are already selected
- **THEN** the UI SHALL prevent the selection (e.g. disable extra picks or replace behavior per product rule) and the store SHALL never contain more than two comparison INEs
