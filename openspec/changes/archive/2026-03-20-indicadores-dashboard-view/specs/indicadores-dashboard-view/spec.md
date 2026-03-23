## ADDED Requirements

### Requirement: View-mode toggle between List and Dashboard
The `IndicadoresView` component SHALL provide a toggle control allowing the user to switch between "Lista" (list) and "Dashboard" view modes. The default mode SHALL be "Lista". The toggle SHALL be rendered in the toolbar area alongside the existing ODS multi-select and sort controls.

#### Scenario: User switches to Dashboard mode
- **WHEN** the user clicks the "Dashboard" tab/toggle
- **THEN** the indicator list is replaced by a grid of indicator cards showing inline visualizations
- **AND** the ODS filter and sort controls remain visible and functional

#### Scenario: User switches back to List mode
- **WHEN** the user is in Dashboard mode and clicks the "Lista" tab/toggle
- **THEN** the dashboard grid is replaced by the original flat list of indicators
- **AND** the current ODS filter and sort selections are preserved

### Requirement: List view extracted to dedicated component
The existing flat-list rendering logic SHALL be extracted from `IndicadoresView.vue` into a new `IndicadoresListView.vue` component. This component SHALL receive the sorted and filtered indicator items as props and SHALL render the same UI as the current implementation (ODS badge, name, value, click-to-open panel).

#### Scenario: List view renders identically after extraction
- **WHEN** the "Lista" view mode is active
- **THEN** the rendered output SHALL be visually identical to the current `IndicadoresView` list rendering
- **AND** clicking an indicator row SHALL open the slide-over panel as before

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
When the dashboard view is active, the component SHALL fetch time-series data from `/api/indicadores/valores` for each visible (filtered) indicator. Fetches SHALL be performed with concurrency control (maximum 5–6 parallel requests) to avoid overwhelming the server.

#### Scenario: Data is fetched on dashboard activation
- **WHEN** the user switches to Dashboard view mode
- **THEN** the component SHALL fetch time-series data for all currently filtered indicators
- **AND** skeleton cards SHALL be displayed while data is loading

#### Scenario: Cached data is reused on filter change
- **WHEN** the user changes the ODS filter while in Dashboard mode
- **AND** some indicators in the new filtered set were already fetched
- **THEN** the component SHALL reuse cached data for those indicators and only fetch data for newly visible indicators

### Requirement: Loading state with skeleton cards
While time-series data is being fetched for the dashboard, the component SHALL display skeleton placeholder cards in the grid to prevent layout shift.

#### Scenario: Skeleton cards during loading
- **WHEN** the dashboard is loading indicator data
- **THEN** skeleton cards with the same dimensions as real cards SHALL be shown
- **AND** they SHALL be replaced by real cards as data arrives
