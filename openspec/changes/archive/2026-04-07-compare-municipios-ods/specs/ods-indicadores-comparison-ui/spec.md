## ADDED Requirements

### Requirement: Comparison picker in the municipio ODS indicators UI

The system SHALL expose a Nuxt UI `USelectMenu` (or equivalent documented component) with search and `multiple` selection to choose up to two comparison municipios, bound to the comparison Pinia store.

#### Scenario: Search and select municipios

- **WHEN** the user opens the comparison picker and types a search string
- **THEN** the menu SHALL filter municipio options by name or INE as appropriate and allow toggling membership in the comparison set up to the maximum of two

### Requirement: List view shows multi-municipio metrics per row with aligned layout

The list view (`IndicadoresListView` or successor) SHALL display, for each indicator row, the metrics (valor, año, índice, tendencia) for the **primary** municipio in the same way as single-municipio mode (indicator title and meta in the first data column; values in the metric columns). For each **selected comparison** municipio, the system SHALL add additional sub-rows within the same table row: **municipio names SHALL appear only in the Indicador column** (below the meta line); metric columns SHALL show **values only** for that municipio. All columns SHALL use **consistent row geometry** (shared minimum height for the primary block and identical comparison row styling including horizontal rules) so borders and baselines align across the table; table cells SHALL use **top alignment** so multi-line content does not vertically center in a misleading way. The ODS icon column SHALL follow the same vertical rhythm when comparisons are active (e.g. icon in the primary zone and structurally matching comparison row placeholders).

#### Scenario: One comparison municipio selected

- **WHEN** exactly one comparison municipio is selected and its indicator data has been loaded
- **THEN** each row SHALL show the primary metrics unchanged at the top and one additional aligned sub-row with the comparison municipio name in the Indicador column and that municipio’s metrics in the other columns

#### Scenario: Compared data loading

- **WHEN** a comparison municipio is newly selected and its data is not yet available
- **THEN** the list SHALL show a loading state for that municipio’s cells until data is fetched or SHALL show an em dash if the indicator is missing for that municipio

### Requirement: Dashboard evolution charts show three series with mandated line styles

The dashboard view and its evolution chart component SHALL render the primary municipio series as today and SHALL add up to two additional series for comparison municipios when data exists: the first comparison series as a thick dotted line in one color, the second as a thick dashed line in another color, with a legend identifying each municipio.

#### Scenario: Two comparisons with full series

- **WHEN** two comparison municipios are selected and each has at least two datapoints for an indicator card
- **THEN** the evolution chart SHALL display three lines meeting the stroke styles (primary unchanged; first comparison thick dotted; second thick dashed) and the legend SHALL name all three municipios

#### Scenario: No comparison selected

- **WHEN** no comparison municipio is selected
- **THEN** the chart SHALL display only the primary municipio series and SHALL match prior single-municipio behavior

#### Scenario: Single-point comparison series

- **WHEN** a comparison municipio has only one datapoint for an indicator
- **THEN** the evolution chart MAY render that comparison as a single marked point without a multi-year segment; the primary card visualization type (evolution vs ban vs empty) SHALL still be driven by the primary municipio series only
