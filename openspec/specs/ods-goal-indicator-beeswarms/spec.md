# ODS goal indicator beeswarms

## ADDED Requirements

### Requirement: One beeswarm chart per indicator under the ODS
For the ODS objective shown on the page, the system SHALL render **one** `BeeswarmChart` per indicator associated with that objective. Each chart SHALL receive `datapoints` built from municipality values for that indicator using the same field contract as elsewhere (`valor`, `codigoIne`, `nombre`, `unidad`).

#### Scenario: Page lists all indicators for the objective
- **WHEN** the user views `/ods/n` and indicators A, B, C belong to objective n
- **THEN** the page SHALL render three `BeeswarmChart` instances
- **AND** each instance SHALL plot all municipalities with a value for that indicator

#### Scenario: Chart-only rendering is client-side
- **WHEN** beeswarm charts are rendered
- **THEN** D3 simulation and DOM updates SHALL run only on the client (e.g. wrapped in `ClientOnly` with a skeleton fallback) consistent with project SSR rules

### Requirement: Optional shared highlight with the map
When the map on the same page supports municipality highlight state, each beeswarm SHALL participate in the same **highlighted INE** model: hovering a dot SHALL update shared highlight state, and hovering a municipality on the map SHALL emphasize the corresponding dot in every beeswarm that includes that municipality.

#### Scenario: Hover dot updates map emphasis
- **WHEN** the user hovers a dot representing municipality X in any beeswarm on the page
- **THEN** the shared highlighted municipality SHALL become X
- **AND** the map SHALL visually emphasize municipality X if the map component supports highlight props

#### Scenario: Hover map updates beeswarms
- **WHEN** the user hovers municipality Y on the map
- **THEN** each beeswarm SHALL emphasize or highlight the dot for Y when present in that indicator’s data

### Requirement: Empty or sparse indicators
If an indicator has no usable municipality values for the chosen period, the UI SHALL show an empty state for that indicator’s beeswarm (or omit the chart with explanatory text) without throwing a client error.

#### Scenario: Indicator with no data
- **WHEN** an indicator has zero datapoints after filtering
- **THEN** the page SHALL not crash
- **AND** the user SHALL see a clear empty state for that indicator section

### Requirement: ODS goal beeswarms use region filter set
On `/ods/{n}`, all `BeeswarmChart` instances on the page SHALL receive the same **filter-derived INE set** from the REGIONES combination controls (`id_especial`, `id_poblacion`, municipio). They SHALL use the chart’s multi-INE filter emphasis capability so multiple municipalities can appear strongly emphasized at once. Hover interaction across charts and the map SHALL remain coordinated.

#### Scenario: Filter set applied to every indicator chart
- **WHEN** the user sets filters that resolve to a non-empty INE set
- **THEN** every beeswarm on the page SHALL emphasize all INEs in that set (and de-emphasize others)
- **AND** changing the filter SHALL update every chart consistently

#### Scenario: No filters
- **WHEN** all filter controls are cleared
- **THEN** beeswarms SHALL NOT apply filter-based multi-emphasis
- **AND** hover-only highlighting SHALL still work as before
