# municipio-indicadores-table (change delta)

## ADDED Requirements

### Requirement: Lista mode uses a data table with raw and normalized values

The Lista view SHALL render indicators as a **data table** (e.g. Nuxt UI `UTable`) with at least the following columns: ODS (icon or label), indicator name (and optional meta line), **raw value** (`valor` formatted with unit from metadata when present), and **normalized value** (`indice` from the ODS hierarchy indicator row when not null, otherwise an em dash or equivalent).

#### Scenario: Table shows hierarchy raw and indice

- **WHEN** the Lista view is active and filtered indicators exist
- **THEN** each row SHALL display the indicator name with ODS context
- **AND** the raw value column SHALL show `valor` formatted consistently with the previous list view (locale + unit)
- **AND** the normalized column SHALL show `indice` when `indice` is non-null
- **AND** when `indice` is null the normalized column SHALL show a clear empty state (e.g. "—")

#### Scenario: Row opens detail panel

- **WHEN** the user activates a row (click or keyboard equivalent)
- **THEN** the same slide-over panel behavior as the previous list SHALL open for that indicator

### Requirement: Trend column from first to latest period in time series

The table SHALL include a **trend** column derived from the municipio time series for that indicator (from `/api/indicadores/valores` with `indicator_id` and `ine`, ordered by `periodo` ascending). The implementation SHALL take the **first** and **last** non-null `valor` in that ordered series. When at least two distinct periods exist, the UI SHALL show a directional cue: **green up** when the indicator **improved**, **red down** when it **worsened**, according to the direction rules in the requirement below.

#### Scenario: Multi-year series shows colored arrow

- **WHEN** the time series has two or more datapoints with non-null `valor`
- **AND** direction can be determined from `umbral_optimo` and `umbral_malo`
- **THEN** the trend column SHALL show a green upward arrow if the change from first to latest `valor` is an improvement
- **AND** SHALL show a red downward arrow if the change is a worsening
- **AND** SHALL NOT show both

#### Scenario: Single year or no series

- **WHEN** the time series has zero or one non-null `valor`
- **THEN** the trend column SHALL not imply direction (e.g. em dash or neutral icon)

#### Scenario: Ambiguous direction without thresholds

- **WHEN** `umbral_optimo` or `umbral_malo` is null or they are equal
- **THEN** the trend column SHALL not show green/red directional arrows for better/worse
- **AND** MAY show a neutral placeholder

### Requirement: Better-or-worse direction uses optimo/malo metadata

Improvement direction SHALL be derived from indicator metadata: if `umbral_optimo > umbral_malo`, higher `valor` SHALL be considered better; if `umbral_optimo < umbral_malo`, lower `valor` SHALL be considered better. If both thresholds are null or equal, directional better/worse SHALL be undefined and the UI SHALL follow the ambiguous-direction scenario above.

#### Scenario: Higher-is-better indicator

- **WHEN** `umbral_optimo` and `umbral_malo` are set and `umbral_optimo > umbral_malo`
- **AND** latest `valor` is greater than first `valor`
- **THEN** the trend SHALL show the green up (improved) treatment

#### Scenario: Lower-is-better indicator

- **WHEN** `umbral_optimo` and `umbral_malo` are set and `umbral_optimo < umbral_malo`
- **AND** latest `valor` is less than first `valor`
- **THEN** the trend SHALL show the green up (improved) treatment

### Requirement: Loading state for table while series are in flight

While time-series data needed for the trend column is still loading for visible rows, the Lista table SHALL show a loading pattern that does not block rendering of static hierarchy columns (e.g. skeleton cells in the trend column or table-level skeleton) consistent with the shared fetch layer used by the dashboard.

#### Scenario: Pending series fetch

- **WHEN** indicator IDs are known but the series for a row is not yet available
- **THEN** the trend column for that row SHALL show a loading or placeholder state distinct from "no data"
