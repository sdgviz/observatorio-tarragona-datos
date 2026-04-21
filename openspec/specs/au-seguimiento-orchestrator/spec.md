## ADDED Requirements

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

#### Scenario: Loading state
- **WHEN** data is being fetched
- **THEN** Seguimiento SHALL show skeleton placeholders

#### Scenario: Error state
- **WHEN** the API returns an error
- **THEN** Seguimiento SHALL display an error alert

#### Scenario: No data available
- **WHEN** the API returns an empty `objetivos` array
- **THEN** Seguimiento SHALL display a "no indicators available" message

### Requirement: View mode toggle
Seguimiento SHALL provide a toggle between "Lista" (list) and "Dashboard" view modes, using `UTabs` with pill variant.

#### Scenario: User switches to dashboard mode
- **WHEN** the user selects the "Dashboard" tab
- **THEN** the view SHALL switch to `IndicadoresDashboardView` showing evolution cards grouped by AU objective

#### Scenario: User switches to list mode
- **WHEN** the user selects the "Lista" tab
- **THEN** the view SHALL switch to `IndicadoresListView` showing the tabular indicator list

### Requirement: AU navigation strip integration
Seguimiento SHALL include the `AgendaNavStrip` in a sticky toolbar and synchronize it with scroll position via scroll spy.

#### Scenario: Scrolling updates active objective
- **WHEN** the user scrolls past an AU objective section boundary
- **THEN** the active objective in `AgendaNavStrip` SHALL update to match the visible section

#### Scenario: Clicking objective scrolls to section
- **WHEN** the user clicks an objective in the nav strip
- **THEN** the page SHALL smooth-scroll to the corresponding section

### Requirement: AU municipio comparison
Seguimiento SHALL provide a comparison selector that allows selecting up to 2 other AU-participating municipios for side-by-side indicator comparison.

#### Scenario: Comparison candidates filtered to AU municipios
- **WHEN** the comparison selector is opened
- **THEN** only municipios with `id_especial3 = 'aue'` SHALL appear as options (excluding the current municipio)

#### Scenario: Selecting a comparison municipio
- **WHEN** the user selects a comparison municipio
- **THEN** the AU hierarchy for that municipio SHALL be fetched
- **AND** comparison columns/series SHALL appear in the list/dashboard views

### Requirement: AU indicator panel
Seguimiento SHALL open the shared `IndicadoresPanel` slide-over when a user clicks on an indicator row or card, passing the AU `TaxonomyConfig`.

#### Scenario: Panel opens with indicator details
- **WHEN** the user clicks on an indicator in list or dashboard view
- **THEN** the panel SHALL open showing the evolution chart, metadata, and comarca mini-map for that indicator
- **AND** the objective icon SHALL be the AU icon (not ODS)

### Requirement: AU-specific Pinia stores
The system SHALL provide `municipioAuIndicadoresPicker` and `municipioAuComparison` Pinia stores, separate from the ODS stores, to manage AU indicator selection and comparison state independently.

#### Scenario: AU stores are independent from ODS stores
- **WHEN** the user navigates from the ODS view to the AU view
- **THEN** the AU picker and comparison state SHALL be independent of ODS state
- **AND** the ODS picker and comparison state SHALL remain unchanged
