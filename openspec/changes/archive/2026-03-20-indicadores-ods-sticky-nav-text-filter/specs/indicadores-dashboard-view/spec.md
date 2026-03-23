# indicadores-dashboard-view (change delta)

## ADDED Requirements

### Requirement: Dashboard content grouped by ODS with scroll anchors

Below the overview spider (when present), indicator cards SHALL be **grouped by ODS** in ascending ODS number. Each group SHALL be wrapped in a container with a stable **`id`** matching the same convention as Lista (`municipio-indicadores-ods-{n}` or the value documented in implementation) so activating an ODS in the sticky strip scrolls to the start of that group in Dashboard mode.

#### Scenario: Grupo visible con ancla

- **WHEN** Dashboard mode is active and an ODS has at least one indicator card after filters
- **THEN** that ODS group container SHALL expose the agreed `id` for scroll targets

#### Scenario: Scroll desde la tira ODS

- **WHEN** the user activates ODS *k* in the strip while in Dashboard mode
- **THEN** the view SHALL scroll to the dashboard group for ODS *k*

#### Scenario: ODS sin tarjetas tras filtro

- **WHEN** the text filter removes all indicators for an ODS
- **THEN** that ODS group SHALL not appear or SHALL not receive focus targets (no empty anchor requirement)
