# indicadores-dashboard-view (change delta)

## MODIFIED Requirements

### Requirement: Time-series data fetching for dashboard

The parent component that contains both Lista and Dashboard modes for municipio indicators (`IndicadoresView.vue` or equivalent), or a composable used exclusively by that parent, SHALL fetch time-series data from `/api/indicadores/valores` for each visible (filtered) indicator for the current municipio `codigo_ine`. Fetches SHALL be performed with concurrency control (maximum 5 parallel requests) to avoid overwhelming the server. `IndicadoresDashboardView` SHALL receive time-series data via props (or injected state) and SHALL NOT run its own parallel fetch for the same indicator and INE.

#### Scenario: Data is fetched on dashboard activation

- **WHEN** the user navigates to the Indicadores tab and filtered indicators are shown
- **THEN** the parent SHALL ensure time-series data is loaded (or loading) for those indicators
- **AND** when the user switches to Dashboard view mode, the dashboard SHALL use the shared cache without starting duplicate fetches for indicators already loaded

#### Scenario: Cached data is reused on filter change

- **WHEN** the user changes the ODS filter while viewing indicadores (Lista or Dashboard)
- **AND** some indicators in the new filtered set were already fetched
- **THEN** the system SHALL reuse cached data for those indicators and only fetch data for newly visible indicators

### Requirement: Loading state with skeleton cards

While time-series data is being fetched for visible indicators in the shared layer, and the user is in Dashboard mode, `IndicadoresDashboardView` SHALL display skeleton placeholder cards in the grid for cards whose series are not yet available, to prevent layout shift.

#### Scenario: Skeleton cards during loading

- **WHEN** the dashboard is loading indicator data for one or more cards
- **THEN** skeleton cards with the same dimensions as real cards SHALL be shown
- **AND** they SHALL be replaced by real cards as data arrives
