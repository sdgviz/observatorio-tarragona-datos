# Map data integration

## ADDED Requirements

### Requirement: Homepage orchestrates ODS data fetching and map rendering
The homepage (`index.vue`) SHALL fetch ODS objective averages from the API based on the currently selected objective and pass the processed data to the map component. The map component SHALL NOT fetch data itself.

#### Scenario: Page loads with default objective
- **WHEN** the homepage loads
- **THEN** it SHALL fetch data for the default ODS objective (objective 1)
- **AND** pass the resulting municipality values to `MapWrapper`
- **AND** the map SHALL render with colors reflecting real ODS data

#### Scenario: User selects a different ODS objective
- **WHEN** the user selects objective 7 from the ODS selector
- **THEN** the homepage SHALL fetch data for objective 7 from `/api/ods/promedios?objetivo=7`
- **AND** the map SHALL re-render with the new municipality values

### Requirement: MapWrapper receives data via props
`MapWrapper` SHALL accept `values` (Record<string, number>) and `colorScale` ((v: number) => string) as props instead of generating mock data internally. The component SHALL remove all mock data generation logic (hashValue function and CSV import).

#### Scenario: MapWrapper renders with provided values
- **WHEN** `MapWrapper` receives `values` containing `{ "43148": 65.2, "43123": 42.8 }` and a color scale function
- **THEN** it SHALL pass these values to `MapTarragona`
- **AND** each municipality path SHALL be colored according to the color scale applied to its value

#### Scenario: MapWrapper handles missing values gracefully
- **WHEN** a municipality in the GeoJSON has no matching entry in the `values` prop
- **THEN** it SHALL render with a neutral/default color (e.g., light gray)

### Requirement: Color scale reflects selected ODS objective
The color scale used for the map SHALL be a sequential scale from white (or a light tint) to the official ODS color of the selected objective. The scale domain SHALL cover the actual data range.

#### Scenario: ODS 3 selected with green color
- **WHEN** ODS objective 3 is selected (official color: #4C9F38)
- **THEN** the color scale SHALL range from a light value to #4C9F38
- **AND** municipalities with higher `valor` SHALL appear in deeper green

#### Scenario: Switching objective updates the color scale
- **WHEN** the user switches from ODS 3 to ODS 6 (official color: #26BDE2)
- **THEN** the color scale SHALL update to range toward #26BDE2
- **AND** the map and legend SHALL re-render with the new color scheme

### Requirement: Legend reflects current data scale
The legend in `MapWrapper` SHALL dynamically display the current color scale with meaningful labels derived from the data range, not hardcoded values.

#### Scenario: Legend updates when objective changes
- **WHEN** the selected ODS objective changes
- **THEN** the legend SHALL update its color swatches and value labels to match the new color scale and data range

### Requirement: Data is prerendered for static generation
The data fetching SHALL use `useFetch` or `useAsyncData` so that Nuxt's static generation can prerender the API responses. All 17 ODS objectives SHALL be prerenderable at build time.

#### Scenario: Static build includes ODS data
- **WHEN** `nuxt generate` is executed
- **THEN** the prerendered homepage SHALL include the data for the default ODS objective
- **AND** the API responses for all 17 objectives SHALL be available as static JSON files

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
