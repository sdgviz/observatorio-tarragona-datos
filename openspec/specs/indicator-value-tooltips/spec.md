# indicator-value-tooltips

## Purpose

Choropleth maps that show a **single snapshot** value per municipio SHALL communicate **unit** and **reference year** in the hover tooltip (and optionally a compact caption when one year applies to the whole layer), matching stakeholder expectations for temporal transparency.

## ADDED Requirements

### Requirement: Province map tooltip shows value with unit and reference year when available

`MapTarragona` (or the documented wrapper used on home and ODS goal pages) SHALL accept optional props supplied by the parent that describe the **active data layer**: at minimum a way to show **unit** (string, may be empty) and **reference year per hovered municipio** when known. When the user hovers a municipality and a numeric value is present, the tooltip SHALL show the municipality name and a value line that includes:

- the formatted numeric value;
- the unit string when non-empty (same locale/formatting conventions as the Lista value column);
- the reference year when known for that `codigo_ine` (e.g. suffix or separate line).

When the reference year is unknown for that point, the tooltip SHALL NOT invent a year; it MAY omit the year fragment or show a neutral empty state consistent with design.

#### Scenario: Indicator layer with per-municipio periodo

- **WHEN** the parent passes per-INE reference periods from `GET /api/indicadores/valores?latest=true` (or equivalent)
- **AND** the user hovers a municipio that has `valor` and `periodo`
- **THEN** the tooltip SHALL show both unit (if any) and that `periodo` as the reference year

#### Scenario: Aggregate layer with shared null periodo

- **WHEN** `periodo` is null for the hovered row in the promedio response
- **THEN** the tooltip SHALL still show value (and unit if the parent provides a layer-level unit string)
- **AND** SHALL NOT display a false year

### Requirement: Optional single-year caption for a map layer

When all visible rows for the current layer share the same non-null `periodo`, the parent page MAY render a single visible caption (e.g. near the legend or map title) stating that reference year. When periods differ across municipios or any is null, the page SHALL NOT imply a single global year in that caption (per-municipio tooltip remains authoritative).

#### Scenario: Homogeneous promedio year

- **WHEN** every row in the loaded `promedios` payload for the current `objetivo` has the same non-null `periodo`
- **THEN** the UI MAY show one shared “Datos {año}” (or localized equivalent) for the map+beeswarm block

#### Scenario: Mixed or missing periods

- **WHEN** any row has a different `periodo` or any is null
- **THEN** the shared caption SHALL not claim a single reference year for the whole layer

### Requirement: Comarca mini-map tooltip aligns with main map rules

`IndicadoresComarcaMiniMap` SHALL use the same tooltip value presentation rules for unit and reference year when the parent supplies them (reusing shared formatters or props pattern agreed in implementation). Data SHALL come from APIs that expose `periodo` per row (`por-comarca` or valores) after this change.

#### Scenario: Hover on mini-map municipio with latest value

- **WHEN** the user hovers a municipio inside the comarca that has a value and `periodo` from the API
- **THEN** the tooltip SHALL show name, formatted value with unit, and reference year
