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
