# municipio-indicadores-table Specification

## Purpose

Municipio ODS **Lista** mode presents indicators in a data table with raw value, normalized índice, and a trend column driven by shared time-series data and metadata thresholds.

## Requirements

### Requirement: Lista mode uses a data table with raw and normalized values

The Lista view SHALL render indicators grouped **by ODS goal** in **section** order ODS 1 through 17 (omit sections with no indicators for the current municipio after applying the text filter). Each section SHALL include a visible **heading** (or equivalent) identifying the ODS and SHALL expose a stable **`id`** attribute on the section wrapper so the ODS strip can scroll to it (same `id` convention as Dashboard). Within each section, indicators SHALL appear in a **data table** (`UTable` or equivalent) with at least: ODS visual, name (and meta line), **raw value** (`valor` + unit), **normalized** (`indice`), and **trend** column as specified below.

#### Scenario: Table shows hierarchy raw and indice

- **WHEN** the Lista view is active and indicators exist for an ODS section
- **THEN** each row SHALL display the indicator name with ODS context
- **AND** the raw value column SHALL show `valor` formatted with locale and unit
- **AND** the normalized column SHALL show `indice` when non-null
- **AND** when `indice` is null the normalized column SHALL show a clear empty state (e.g. "—")

#### Scenario: Row opens detail panel

- **WHEN** the user activates a row (click or keyboard equivalent)
- **THEN** the slide-over panel SHALL open for that indicator

#### Scenario: Ancla por ODS

- **WHEN** the Lista view renders an ODS section that contains at least one indicator
- **THEN** the section wrapper SHALL expose an `id` that matches the documented anchor pattern for that ODS number

### Requirement: Trend column from first to latest period in time series

The table SHALL include a **trend** column derived from the municipio time series for that indicator (from `/api/indicadores/valores` with `indicator_id` and `ine`, ordered by `periodo` ascending). The implementation SHALL take the **first** and **last** non-null `valor` in that ordered series for direction. When at least two distinct periods exist and thresholds allow, the UI SHALL show **green up** when the indicator **improved** and **red down** when it **worsened**, subject to the índice magnitude gate in the requirement below.

#### Scenario: Multi-year series shows colored arrow

- **WHEN** the time series has two or more datapoints with non-null `valor`
- **AND** direction can be determined from `umbral_optimo` and `umbral_malo`
- **AND** relative índice change exceeds the configured minimum
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
- **AND** the índice magnitude gate is satisfied
- **THEN** the trend SHALL show the green up (improved) treatment

#### Scenario: Lower-is-better indicator

- **WHEN** `umbral_optimo` and `umbral_malo` are set and `umbral_optimo < umbral_malo`
- **AND** latest `valor` is less than first `valor`
- **AND** the índice magnitude gate is satisfied
- **THEN** the trend SHALL show the green up (improved) treatment

### Requirement: Trend arrows gated by índice change magnitude

Green and red trend arrows SHALL only be shown when the **relative change in índice** between the first and last period in the ordered series is **greater** than a configurable minimum percent threshold (implementation default: 1%). When the relative change is **at or below** that threshold, the UI SHALL show an **equal** (stable) treatment instead of directional arrows. If índice is missing on the first or last period used for the series, the UI SHALL not show directional arrows (treat as insufficient for trend).

#### Scenario: Small índice change

- **WHEN** first and last periods have índice values such that relative change is at or below the configured threshold
- **THEN** the trend column SHALL show the equal/stable treatment
- **AND** SHALL NOT show green or red directional arrows

### Requirement: Loading state for table while series are in flight

While time-series data needed for the trend column is still loading for visible rows, the Lista table SHALL show a loading pattern that does not block rendering of static hierarchy columns (e.g. skeleton cells in the trend column or table-level skeleton) consistent with the shared fetch layer used by the dashboard.

#### Scenario: Pending series fetch

- **WHEN** indicator IDs are known but the series for a row is not yet available
- **THEN** the trend column for that row SHALL show a loading or placeholder state distinct from "no data"

### Requirement: No global sort control for Lista

The Indicadores Lista mode SHALL **not** expose the previous sort dropdown (e.g. "Por ODS" / name A–Z). Order within each ODS section SHALL follow the **API hierarchy order** (objetivos → metas → indicadores) without user-reorder controls.

#### Scenario: Sin desplegable de ordenación

- **WHEN** the user is in Lista mode
- **THEN** no sort-only `USelect` (or equivalent) is shown in the toolbar

### Requirement: Indicator row secondary line uses meta target code and name

In the Lista **name** column, the line below the indicator title SHALL identify the indicator’s **meta (target, nivel 2)** from the ODS hierarchy. It SHALL show a **target code** derived from the meta’s dictionary `id` (`metas[].id`) by stripping the `2030-` agenda prefix (e.g. `2030-7.2` → `7.2`), followed by the meta **`nombre`** (`metas[].nombre`). The line SHALL **not** use only the **goal (objetivo)** name for that role, and SHALL **not** use the ODS goal index alone where the shipped UI uses the meta target code. The agreed format is `{metaCodigo} · {meta nombre}`.

#### Scenario: Row subtitle shows meta code and name, not goal title

- **WHEN** the Lista view shows a row for an indicator that belongs to a meta whose name differs from its parent goal name
- **THEN** the secondary line under the indicator name SHALL include that **meta** name and the **meta target code** as defined above
- **AND** SHALL NOT substitute the goal name for the meta name on that line

#### Scenario: Detail panel matches row context

- **WHEN** the user opens the slide-over detail panel from a Lista row
- **THEN** the context line above the indicator title in the panel SHALL use the same **meta code and name** rule as the row
