## ADDED Requirements

### Requirement: Toggle navigates between ODS and AU municipio pages
When the header toggle changes mode and the user is currently on a mode-specific municipio page, the system SHALL automatically navigate to the equivalent page in the other mode, preserving the `ine` parameter.

#### Scenario: Switching from ODS to AU while on an ODS municipio page
- **WHEN** the user is on `/municipios/ods/<ine>`
- **AND** they switch the toggle to Agenda Urbana
- **THEN** the application navigates to `/municipios/au/<ine>`

#### Scenario: Switching from AU to ODS while on an AU municipio page
- **WHEN** the user is on `/municipios/au/<ine>`
- **AND** they switch the toggle to ODS
- **THEN** the application navigates to `/municipios/ods/<ine>`

### Requirement: Toggle does not navigate when not on a municipio page
When the header toggle changes mode and the user is NOT on a mode-specific municipio page, the system SHALL only update the Pinia store — no navigation occurs.

#### Scenario: Switching mode from the home page
- **WHEN** the user is on `/` (or any page other than `/municipios/ods/*` or `/municipios/au/*`)
- **AND** they switch the toggle
- **THEN** `visualizationStore.setMode(...)` is called
- **AND** no route navigation takes place

#### Scenario: Switching mode from a non-municipio page
- **WHEN** the user is on `/ods` or `/metodologia`
- **AND** they switch the toggle
- **THEN** the store mode is updated
- **AND** the user stays on the current page

### Requirement: ODS municipio page syncs Pinia store mode on mount
The system SHALL set the visualization mode to `ODS` in `useVisualizationStore` when the ODS municipio page is mounted.

#### Scenario: Arriving at ODS page directly via URL
- **WHEN** a user navigates directly to `/municipios/ods/<ine>`
- **THEN** `visualizationStore.setMode(VisualizationMode.ODS)` is called on mount
- **AND** the header toggle is in the ODS-on position
