# Mode-aware navigation (delta)

## ADDED Requirements

### Requirement: Toggle translates between ODS and AU goal routes for shared objectives
When the header toggle changes mode and the user is on a goal detail page whose objective number exists in both taxonomies (1–10), the system SHALL navigate from `/ods/{n}` to `/au/{n}` or from `/au/{n}` to `/ods/{n}`, preserving locale prefix rules used elsewhere.

#### Scenario: Switching from ODS to AU on ODS goal 5
- **WHEN** the user is on `/ods/5`
- **AND** they switch the toggle to Agenda Urbana
- **THEN** the application SHALL navigate to `/au/5`

#### Scenario: Switching from AU to ODS on AU goal 5
- **WHEN** the user is on `/au/5`
- **AND** they switch the toggle to ODS
- **THEN** the application SHALL navigate to `/ods/5`

### Requirement: Toggle from ODS goal with no AU counterpart leaves goal context
When the user is on `/ods/{n}` with n greater than 10 and switches to Agenda Urbana, the system SHALL navigate to a safe AU hub route (`/au`) rather than an invalid objective page.

#### Scenario: Switching from ODS 15 to AU mode
- **WHEN** the user is on `/ods/15`
- **AND** they switch the toggle to Agenda Urbana
- **THEN** the application SHALL navigate to `/au` (or equivalent hub), not `/au/15`

### Requirement: AU goal page syncs Pinia store mode on mount
The system SHALL set the visualization mode to Agenda Urbana when an AU goal detail page is mounted.

#### Scenario: Arriving at AU goal via URL
- **WHEN** a user navigates directly to `/au/3`
- **THEN** `visualizationStore.setMode(VisualizationMode.AU)` SHALL be called on mount
- **AND** the header toggle SHALL show Agenda Urbana as active

### Requirement: ODS goal page syncs Pinia store mode on mount
The system SHALL set the visualization mode to ODS when an ODS goal detail page is mounted.

#### Scenario: Arriving at ODS goal via URL
- **WHEN** a user navigates directly to `/ods/8`
- **THEN** `visualizationStore.setMode(VisualizationMode.ODS)` SHALL be called on mount
- **AND** the header toggle SHALL show ODS as active
