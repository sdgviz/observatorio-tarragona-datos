# mode-aware-navigation (delta)

## MODIFIED Requirements

### Requirement: Toggle translates between ODS and AU goal routes for shared objectives
When the header toggle changes mode and the user is on a goal detail page whose objective number exists in both taxonomies (`1..6`, the overlap between ODS `1..17` and Tarragona `1..6`), the system SHALL navigate from `/ods/{n}` to `/au/{n}` or from `/au/{n}` to `/ods/{n}`, preserving locale prefix rules used elsewhere.

#### Scenario: Switching from ODS to Tarragona on ODS goal 5
- **WHEN** the user is on `/ods/5`
- **AND** they switch the toggle to Agenda Metropolitana de Tarragona
- **THEN** the application SHALL navigate to `/au/5`

#### Scenario: Switching from Tarragona to ODS on Tarragona goal 5
- **WHEN** the user is on `/au/5`
- **AND** they switch the toggle to ODS
- **THEN** the application SHALL navigate to `/ods/5`

### Requirement: Toggle from ODS goal with no AU counterpart leaves goal context
When the user is on `/ods/{n}` with `n > 6` and switches to Agenda Metropolitana de Tarragona, the system SHALL navigate to a safe AU hub route (`/au`) rather than an invalid objective page.

#### Scenario: Switching from ODS 7 to Tarragona mode
- **WHEN** the user is on `/ods/7`
- **AND** they switch the toggle to Agenda Metropolitana de Tarragona
- **THEN** the application SHALL navigate to `/au` (or equivalent hub), not `/au/7`

#### Scenario: Switching from ODS 15 to Tarragona mode
- **WHEN** the user is on `/ods/15`
- **AND** they switch the toggle to Agenda Metropolitana de Tarragona
- **THEN** the application SHALL navigate to `/au` (or equivalent hub), not `/au/15`

### Requirement: AU goal page syncs Pinia store mode on mount
The system SHALL set the visualization mode to Agenda Metropolitana de Tarragona when a Tarragona goal detail page (`/au/{n}`, `n` in `1..6`) is mounted. The header toggle label SHALL read "Agenda Metropolitana de Tarragona" (or its approved short form) when this mode is active.

#### Scenario: Arriving at Tarragona goal via URL
- **WHEN** a user navigates directly to `/au/3`
- **THEN** `visualizationStore.setMode(VisualizationMode.AU)` SHALL be called on mount
- **AND** the header toggle SHALL show Agenda Metropolitana de Tarragona as active (with the updated label)
