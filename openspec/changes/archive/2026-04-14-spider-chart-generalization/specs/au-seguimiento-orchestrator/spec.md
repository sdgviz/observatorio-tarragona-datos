## MODIFIED Requirements

### Requirement: Seguimiento view orchestrates AU indicator display
`Seguimiento.vue` SHALL fetch AU hierarchy data via `/api/au/indicadores`, flatten it into sections grouped by AU strategic objective, and render using the shared `IndicadoresListView` or `IndicadoresDashboardView` components with an AU `TaxonomyConfig`. It SHALL also render a spider overview chart showing per-objective average index values.

#### Scenario: Successful render with data
- **WHEN** the municipio participates in AU and has indicator data
- **THEN** Seguimiento SHALL display AU objective sections with indicators in list mode by default
- **AND** each section SHALL be headed by the AU objective icon and label

#### Scenario: Spider overview displayed
- **WHEN** the AU hierarchy data contains at least one objetivo with a non-zero `promedio_indice`
- **THEN** Seguimiento SHALL render a `DoubleSpiderMinMax` chart with 10 axes
- **AND** axis colors SHALL come from `objetivos_agenda` configuration
- **AND** axis labels SHALL be the AU strategic objective names

#### Scenario: Spider overview with comparisons
- **WHEN** the user has selected comparison municipios in the AU view
- **THEN** the spider chart SHALL display comparison series overlaid on the primary polygon
- **AND** comparison data SHALL come from the comparison hierarchy `promedio_indice` values

#### Scenario: Spider overview loading state
- **WHEN** indicator data is still being fetched
- **THEN** a skeleton placeholder SHALL be shown in place of the spider chart

#### Scenario: Spider overview empty state
- **WHEN** no objetivo has meaningful (non-zero) `promedio_indice` data
- **THEN** a "no sufficient data" message SHALL be shown instead of the spider chart

#### Scenario: Spider highlights synced with scroll
- **WHEN** the user scrolls through AU objective sections
- **THEN** the `selectedOds` prop on the spider chart SHALL update to highlight the currently focused AU objective
