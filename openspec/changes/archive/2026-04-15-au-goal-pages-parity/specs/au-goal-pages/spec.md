# AU goal pages

## ADDED Requirements

### Requirement: Dynamic routes for Agenda Urbana objectives 1–10
The system SHALL provide pages at `/au/1` through `/au/10` that render the AU goal experience: map with layer selector, aggregate choropleth from AU promedios, and indicator beeswarms section aligned with that objective. The segment SHALL be a positive integer between 1 and 10; values outside that range SHALL not render as a valid AU goal page.

#### Scenario: Valid objective renders
- **WHEN** a user requests `/au/5`
- **THEN** the page SHALL render with content scoped to AU objective 5
- **AND** page metadata (title) SHALL include objective 5 in the active locale

#### Scenario: Invalid objective is rejected
- **WHEN** a user requests `/au/0`, `/au/11`, or a non-numeric segment
- **THEN** the application SHALL respond with a 404 or redirect per project convention
- **AND** no AU goal-scoped API calls SHALL be made with invalid objective numbers

### Requirement: AU goal pages are limited to AUE municipalities
All map values, beeswarm datapoints, municipio naming, and selection targets used for the AU goal experience SHALL be restricted to municipalities where `id_especial3` equals `aue` in the municipios catalog. Non-AUE municipalities SHALL not appear as interactive map targets for this page and SHALL not contribute beeswarm points.

#### Scenario: Beeswarm excludes non-AUE municipios
- **WHEN** promedios or indicator values include a row for a municipio that is not AUE
- **THEN** that row SHALL be excluded from beeswarm and map value aggregation on the AU goal page

### Requirement: AU goal map uses AUE-focused viewport
On AU goal pages, the map SHALL apply the same class of viewport and emphasis behaviour used on the home page in Agenda Urbana mode: the view is focused on the AUE municipio set and non-AUE territory is not treated as part of the interactive “zoomed” exploration region (implementation MAY reuse the same map props as the home AU map).

#### Scenario: Map does not emphasize province-wide interaction for non-AUE
- **WHEN** the user views an AU goal page
- **THEN** the map SHALL be constrained or emphasized such that only the AUE municipio subset matches the focused AU exploration pattern
- **AND** clicking or hovering outside that policy SHALL not select non-AUE municipios

### Requirement: AU objective indicator catalog API
The system SHALL expose an HTTP API that returns the ordered list of indicator metadata (id, name, unit) for a given AU objective `n` (1–10), analogous to `GET /api/ods/objetivo-indicadores`, so AU goal pages can populate the indicator layer selector without embedding SQL in the client.

#### Scenario: Client requests indicators for objective 3
- **WHEN** a client calls the AU objective-indicadores endpoint with `objetivo=3` and a supported `lang`
- **THEN** the response SHALL include all indicators linked to AU objective 3 in canonical order
- **AND** invalid `objetivo` values SHALL yield a 400 error

### Requirement: Indicator layer values reuse global valores API
When an AU goal page selects a non-aggregate indicator layer, it SHALL load latest values via the same indicator valores endpoint used by ODS goal pages (`/api/indicadores/valores` with `indicator_id`), then apply the AUE municipio filter client-side for display.

#### Scenario: Per-indicator map layer on AU page
- **WHEN** the user selects a specific indicator on an AU goal page
- **THEN** the map and beeswarms SHALL reflect latest valores for that indicator restricted to AUE municipios

### Requirement: Static generation includes AU goal routes
Static generation SHALL include prerendered output for `/au/1` … `/au/10` (and the `/au` hub route) so deployed static hosting can serve these URLs.

#### Scenario: Generate builds AU pages
- **WHEN** the static build runs
- **THEN** generated artifacts SHALL exist for each `/au/{n}` for n from 1 to 10 and for the `/au` hub per project convention

### Requirement: Explore municipio respects visualization mode
The AU goal page SHALL offer navigation to the municipio detail path that matches the current visualization mode (`/municipios/au/{ine}` when mode is AU), consistent with the existing ODS goal page behaviour.

#### Scenario: User opens municipio from AU goal page
- **WHEN** the user chooses to explore a selected AUE municipio from an AU goal page in AU mode
- **THEN** the application SHALL navigate to `/municipios/au/{ine}`
