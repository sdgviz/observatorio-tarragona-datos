# indicadores-dashboard-view Specification

## Purpose

Dashboard mode for municipio indicators: overview spider, indicator cards grouped by ODS with shared scroll anchors as Lista, and shared time-series fetching with the parent.

## Requirements

### Requirement: View-mode toggle between List and Dashboard

The `IndicadoresView` component SHALL provide a toggle control allowing the user to switch between "Lista" (list) and "Dashboard" view modes. The default mode SHALL be "Lista". The toggle SHALL be rendered in the **sticky** toolbar together with the ODS strip and text filter (`municipio-indicadores-sticky-toolbar`).

#### Scenario: User switches to Dashboard mode

- **WHEN** the user clicks the "Dashboard" tab/toggle
- **THEN** the indicator list is replaced by a grid of indicator cards showing inline visualizations
- **AND** the ODS strip and text filter remain visible and functional

#### Scenario: User switches back to List mode

- **WHEN** the user is in Dashboard mode and clicks the "Lista" tab/toggle
- **THEN** the dashboard grid is replaced by the Lista table layout
- **AND** the current text filter query and focused ODS state remain coherent across modes

### Requirement: List view extracted to dedicated component

Lista mode SHALL be implemented in `IndicadoresListView.vue`. The component SHALL receive filtered indicator items and time-series cache props from the parent. Table layout, columns (valor, índice, trend), and interaction SHALL conform to the `municipio-indicadores-table` specification.

#### Scenario: List view opens detail panel

- **WHEN** the "Lista" view mode is active
- **THEN** activating a row SHALL open the slide-over panel for that indicator
- **AND** the toolbar controls in `IndicadoresView` SHALL remain functional

### Requirement: Dashboard content grouped by ODS with scroll anchors

Below the overview spider (when present), indicator cards SHALL be **grouped by ODS** in ascending ODS number. Each group SHALL be wrapped in a container with a stable **`id`** matching the same convention as Lista (`municipio-indicadores-ods-{n}`) so activating an ODS in the sticky strip scrolls to the start of that group in Dashboard mode.

#### Scenario: Grupo visible con ancla

- **WHEN** Dashboard mode is active and an ODS has at least one indicator card after filters
- **THEN** that ODS group container SHALL expose the agreed `id` for scroll targets

#### Scenario: Scroll desde la tira ODS

- **WHEN** the user activates ODS *k* in the strip while in Dashboard mode
- **THEN** the view SHALL scroll to the dashboard group for ODS *k*

#### Scenario: ODS sin tarjetas tras filtro

- **WHEN** the text filter removes all indicators for an ODS
- **THEN** that ODS group SHALL not appear or SHALL not receive focus targets (no empty anchor requirement)

### Requirement: Dashboard grid layout
The dashboard view SHALL render indicator cards in a responsive CSS grid layout. The grid SHALL display 1 column on small screens, 2 columns on medium screens (md breakpoint), and 3 columns on large screens (xl breakpoint).

#### Scenario: Responsive grid columns
- **WHEN** the dashboard view is active on a large screen (>= xl breakpoint)
- **THEN** indicator cards SHALL be arranged in 3 columns

#### Scenario: Responsive grid on medium screen
- **WHEN** the dashboard view is active on a medium screen (>= md, < xl)
- **THEN** indicator cards SHALL be arranged in 2 columns

#### Scenario: Responsive grid on small screen
- **WHEN** the dashboard view is active on a small screen (< md)
- **THEN** indicator cards SHALL be arranged in 1 column

### Requirement: Evolution chart card for multi-datapoint indicators
For indicators with more than one datapoint in their time series, the dashboard SHALL render an evolution chart card. The card SHALL include:
- The indicator name and ODS badge
- The latest datapoint value and unit displayed prominently next to the title
- An inline `EvolutionChart` component showing the full time series

#### Scenario: Indicator with multiple datapoints
- **WHEN** an indicator has 2 or more values across different periods
- **THEN** the dashboard card SHALL display an `EvolutionChart` with all available datapoints
- **AND** the latest value (most recent period) SHALL be shown next to the indicator name

#### Scenario: Evolution chart sizing
- **WHEN** an evolution chart card is rendered in the grid
- **THEN** the chart SHALL fill the card width and use a compact height (~200px)

### Requirement: BAN number card for single-datapoint indicators
For indicators with exactly one datapoint, the dashboard SHALL render a BAN (Big Ass Number) card. The card SHALL display:
- The indicator name and ODS badge
- The value in a large, prominent font
- The unit (if available) below or next to the value
- The period (year)

#### Scenario: Indicator with single datapoint
- **WHEN** an indicator has exactly 1 value in its time series
- **THEN** the dashboard card SHALL display the value as a large formatted number
- **AND** the unit and period SHALL be visible

### Requirement: Empty state for indicators with no data
For indicators with no datapoints in their time series, the dashboard SHALL render a card with a placeholder message.

#### Scenario: Indicator with no datapoints
- **WHEN** an indicator's time-series fetch returns zero datapoints
- **THEN** the dashboard card SHALL display a placeholder text such as "Sin datos disponibles"
- **AND** the indicator name and ODS badge SHALL still be visible

### Requirement: Time-series data fetching for dashboard
The parent component that contains both Lista and Dashboard modes for municipio indicators (`IndicadoresView.vue` or equivalent), or a composable used exclusively by that parent, SHALL fetch time-series data from `/api/indicadores/valores` for each visible (filtered) indicator for the current municipio `codigo_ine`. Fetches SHALL be performed with concurrency control (maximum 5 parallel requests) to avoid overwhelming the server. `IndicadoresDashboardView` SHALL receive time-series data via props (or injected state) and SHALL NOT run its own parallel fetch for the same indicator and INE.

#### Scenario: Data is fetched on dashboard activation
- **WHEN** the user navigates to the Indicadores tab and filtered indicators are shown
- **THEN** the parent SHALL ensure time-series data is loaded (or loading) for those indicators
- **AND** when the user switches to Dashboard view mode, the dashboard SHALL use the shared cache without starting duplicate fetches for indicators already loaded

#### Scenario: Cached data is reused on filter change

- **WHEN** the set of visible indicators changes (e.g. text filter or tab switch) while viewing indicadores (Lista or Dashboard)
- **AND** some indicators in the new visible set were already fetched
- **THEN** the system SHALL reuse cached data for those indicators and only fetch data for newly visible indicators

### Requirement: Loading state with skeleton cards
While time-series data is being fetched for visible indicators in the shared layer, and the user is in Dashboard mode, `IndicadoresDashboardView` SHALL display skeleton placeholder cards in the grid for cards whose series are not yet available, to prevent layout shift.

#### Scenario: Skeleton cards during loading
- **WHEN** the dashboard is loading indicator data for one or more cards
- **THEN** skeleton cards with the same dimensions as real cards SHALL be shown
- **AND** they SHALL be replaced by real cards as data arrives

### Requirement: Dashboard overview spider section
The indicadores dashboard SHALL render an ODS overview spider chart above the indicator-card grid when dashboard mode is active.

#### Scenario: Dashboard mode displays overview chart
- **WHEN** the user selects dashboard mode in `IndicadoresView`
- **THEN** `IndicadoresDashboardView` SHALL render the overview spider chart before the card grid

### Requirement: Overview values derived from backend ODS hierarchy data
The overview spider chart SHALL use ODS-level values provided by backend (`promedio_indice` in `/api/ods/indicadores` response), producing one value per ODS axis.

#### Scenario: Overview uses backend ODS averages
- **WHEN** the dashboard overview is rendered
- **THEN** each ODS axis value SHALL come from backend `promedio_indice` for that ODS
- **AND** the frontend SHALL NOT recompute those values by averaging visible indicator rows

#### Scenario: Focused ODS does not change spider axis values

- **WHEN** the focused or highlighted ODS changes in dashboard mode (strip or scroll sync)
- **THEN** the spider chart SHALL keep the same 17 ODS values from backend `promedio_indice`
- **AND** highlight effects MAY be visual-only (highlight/mute), but not value mutation

### Requirement: Spider chart removed from presupuestos view
`PresupuestosView` SHALL no longer render `DoubleSpiderMinMax` in its visualization selector.

#### Scenario: Presupuestos view no longer includes DoubleSpiderMinMax
- **WHEN** the user navigates visualizations in `PresupuestosView`
- **THEN** the old `DoubleSpiderMinMax` slot (`displayViz === 20`) SHALL not be shown

### Requirement: Dashboard indicator cards use meta target code and name in subtitle

For each indicator card in the dashboard grid (evolution chart card, BAN card, and empty-data placeholder card), the **context line** below or beside the indicator name SHALL use the **meta target code** (from `metas[].id` with the `2030-` prefix removed) and the meta **`nombre`**, **not** the goal (objetivo) name alone and **not** the ODS goal index alone in place of the target code. Format SHALL match Lista: `{metaCodigo} · {meta nombre}`. ODS goal **number** MAY still drive badge colour and the section heading.

#### Scenario: Evolution card subtitle

- **WHEN** an evolution chart card is shown for an indicator whose meta name differs from the section goal title
- **THEN** the card’s hierarchy context line SHALL show the **meta target code** and **meta** name

#### Scenario: BAN card subtitle

- **WHEN** a BAN card is shown for an indicator whose meta name differs from the section goal title
- **THEN** the card’s hierarchy context line SHALL show the **meta target code** and **meta** name

#### Scenario: Empty series placeholder card

- **WHEN** the placeholder card is shown for an indicator with no series data
- **THEN** the visible hierarchy context line SHALL show the **meta target code** and **meta** name

