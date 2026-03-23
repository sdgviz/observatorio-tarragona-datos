# map-data-integration (delta)

## ADDED Requirements

### Requirement: ODS goal pages orchestrate map data
An ODS goal page (`/ods/{n}`, n 1–17) SHALL fetch or resolve map values for the selected layer (objective aggregate or a specific indicator) and pass them to `MapWrapper` with a color scale derived from the active objective’s official color. The map component SHALL NOT fetch ODS or indicator series directly.

#### Scenario: ODS page loads with aggregate layer
- **WHEN** the user opens `/ods/4` with the default aggregate layer
- **THEN** the page SHALL load municipality values for objective 4 consistent with `/api/ods/promedios?objetivo=4`
- **AND** the map SHALL render with those values

#### Scenario: ODS page switches to indicator layer
- **WHEN** the user selects an indicator layer on `/ods/4`
- **THEN** the page SHALL load municipality values for that indicator
- **AND** the map and legend SHALL update to the indicator’s domain while preserving ODS 4 color branding

### Requirement: Legend updates on ODS goal pages
The map legend on ODS goal pages SHALL reflect the current layer’s value range and color scale whenever the user changes between aggregate and indicator layers or changes the selected indicator.

#### Scenario: Legend follows layer
- **WHEN** the user changes the map layer selection on an ODS goal page
- **THEN** the legend SHALL update to match the new layer’s min/max (or documented binning) and colors

### Requirement: Static generation covers ODS goal map default layer
Static generation SHALL include prerendering for each `/ods/{n}` route such that the **default aggregate** map data for that objective is available without a client-only fetch on first paint, where consistent with existing prerender constraints.

#### Scenario: Prerendered ODS page includes aggregate data
- **WHEN** a static build completes
- **THEN** each generated `/ods/{n}` page SHALL have the aggregate map dataset available in line with the project’s `useFetch`/`useAsyncData` prerender pattern
