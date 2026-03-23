# municipio-indicadores-table (change delta)

## MODIFIED Requirements

### Requirement: Lista mode uses a data table with raw and normalized values

The Lista view SHALL render indicators grouped **by ODS goal** in **section** order ODS 1 through 17 (omit sections with no indicators for the current municipio after applying the text filter). Each section SHALL include a visible **heading** (or equivalent) identifying the ODS and SHALL expose a stable **`id`** attribute on the section wrapper so the ODS strip can scroll to it (same `id` convention as Dashboard). Within each section, indicators SHALL appear in a **data table** (`UTable` or equivalent) with at least: ODS visual, name (and meta line), **raw value** (`valor` + unit), **normalized** (`indice`), and **trend** column as already specified.

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

## ADDED Requirements

### Requirement: No global sort control for Lista

The Indicadores Lista mode SHALL **not** expose the previous sort dropdown (e.g. "Por ODS" / name A–Z). Order within each ODS section SHALL follow the **API hierarchy order** (objetivos → metas → indicadores) without user-reorder controls.

#### Scenario: Sin desplegable de ordenación

- **WHEN** the user is in Lista mode
- **THEN** no sort-only `USelect` (or equivalent) is shown in the toolbar
