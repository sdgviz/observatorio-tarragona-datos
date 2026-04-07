# indicadores-panel-comarca-mini-map Specification

## Purpose

Provide geographic context in the municipio ODS indicator slide-over: a small full-province map where only the current comarca’s municipalities are choropleth-coloured by the **same indicator** as the panel, using the same ODS-based colour-scale strategy as the main site maps.

## ADDED Requirements

### Requirement: Mini map shows full province with comarca-only choropleth

The indicator detail slide-over (`IndicadoresPanel.vue`) SHALL render a compact map that displays **all** municipalities in the provincial GeoJSON with a consistent outline, but SHALL apply the choropleth fill derived from indicator values **only** to municipalities whose `REGIONES.id_especial` equals the current municipio’s comarca id (`id_especial`). Municipalities outside that comarca SHALL use a neutral fill (and SHALL remain visually subordinate so the coloured comarca is readable).

#### Scenario: User opens panel from a municipio with a known comarca

- **WHEN** the panel is open with a selected indicator and a non-empty `id_especial` for the current municipio
- **THEN** the map SHALL show the full province geometry
- **AND** only features belonging to that `id_especial` SHALL use colours from the value scale
- **AND** other features SHALL use the agreed neutral fill treatment

#### Scenario: Comarca id missing

- **WHEN** `id_especial` is null or empty for the current context
- **THEN** the mini map block SHALL not be shown or SHALL show a clear empty state without implying data error

### Requirement: Values and period match the active indicator

The map SHALL load values for the **same** `id_indicador` as the open panel item, restricted to municipalities in the current comarca, using server-backed data with **latest-per-municipio** semantics consistent with existing indicator value APIs (same period rules as lista/dashboard raw `valor` where applicable).

#### Scenario: Panel switches to another indicator

- **WHEN** the user selects a different indicator while the panel stays open
- **THEN** the map data SHALL refresh for the new `id_indicador`
- **AND** fills SHALL reflect the new values

### Requirement: Colour scale matches main map strategy

The choropleth SHALL derive its scale from the **ODS objetivo** colour for the indicator’s goal (via `ods_list` / objetivo number), using the **same** `hsl` / `interpolateHsl` / five-stop `scaleLinear` domain approach as the home and ODS goal map views. The domain min and max SHALL be computed from **non-null values in the comarca dataset only** (not the whole province).

#### Scenario: Multiple values in comarca

- **WHEN** at least two distinct numeric values exist in the comarca response
- **THEN** the scale SHALL span from min to max with intermediate stops at 25%, 50%, and 75% of the range
- **AND** colours SHALL stay within the ODS hue family (pale low to darker high)

#### Scenario: Single value or zero range in comarca

- **WHEN** all comarca values are equal or only one municipality has a value
- **THEN** the implementation SHALL use the same degenerate-range handling as the main map (two-endpoint scale) without errors

### Requirement: Lightweight map component without MapTarragona animations

The implementation SHALL use a **dedicated** small map component (not `MapTarragona.vue`) that SHALL NOT perform animated viewBox transitions or selection-driven zoom. It MAY use D3 projection/path helpers and the same GeoJSON URL as `MapTarragona`.

#### Scenario: No animated zoom

- **WHEN** the user opens or changes selection in the panel
- **THEN** the map SHALL update fills without long easing-based viewBox animation

### Requirement: Basic interactivity and client-only rendering

The mini map SHALL support hover feedback with at least municipality **name** and **formatted value** when a value exists. It SHALL be rendered inside `<ClientOnly>` with a loading placeholder appropriate to the slide-over. Click-to-navigate is optional; if implemented, it SHALL emit an event with `codigo_ine` rather than hard-coding routes inside the map component.

#### Scenario: Hover over a comarca municipality with data

- **WHEN** the pointer rests over a comarca feature that has a value
- **THEN** the UI SHALL show name and value (tooltip or equivalent)

### Requirement: Backing API for comarca-wide indicator values

The system SHALL expose a read-only HTTP GET endpoint that accepts `indicator_id` and `id_especial` and returns a list of `{ codigo_ine, valor }` (or equivalent) for municipalities in that comarca with available values, using parameterized SQLite queries.

#### Scenario: Valid query

- **WHEN** a client requests the endpoint with valid `indicator_id` and `id_especial`
- **THEN** the response SHALL include only municipalities whose `REGIONES.id_especial` matches
- **AND** SHALL omit or null-handle missing values per agreed API contract
