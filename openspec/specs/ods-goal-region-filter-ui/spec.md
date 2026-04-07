# ods-goal-region-filter-ui

## ADDED Requirements

### Requirement: Combined REGIONES filters on the ODS goal page

The ODS goal page SHALL expose at least four controls in a single filter row: **id_especial**, **id_especial2**, **id_poblacion**, and **municipio**. Each control SHALL be clearable independently. Values SHALL come from the municipality list data (`REGIONES` fields on each row). When a control has no value (or the dedicated “all” sentinel), it SHALL impose no constraint on that attribute.

#### Scenario: User selects population category only

- **WHEN** the user chooses a value for `id_poblacion` and leaves `id_especial`, `id_especial2`, and municipio empty (or at “all”)
- **THEN** the system SHALL compute the set of `codigo_ine` for all municipalities with that `id_poblacion`
- **AND** that set SHALL drive map and beeswarm emphasis (see related specs)

#### Scenario: User combines id_especial and id_poblacion

- **WHEN** the user selects both an `id_especial` value and an `id_poblacion` value and leaves `id_especial2` at “all”
- **THEN** the emphasized INE set SHALL be the intersection of municipalities matching both attributes

#### Scenario: User combines id_especial2 with other region filters

- **WHEN** the user selects an `id_especial2` value and may also select `id_especial` and/or `id_poblacion` (each other axis may remain at “all”)
- **THEN** the emphasized INE set SHALL be the intersection of municipalities matching every selected non-“all” region attribute

#### Scenario: User further selects a municipio

- **WHEN** the user selects a specific municipality from the municipio control while one or more region filters are active
- **THEN** the emphasized set SHALL be restricted to that municipality if it belongs to the intersection; otherwise the selection SHALL resolve to zero matches with a clear empty state for emphasis (without removing beeswarm datapoints)

### Requirement: Nuxt UI select consistency

The **map layer** selector and the **id_especial**, **id_especial2**, and **id_poblacion** selectors SHALL use Nuxt UI `USelect` (or equivalent documented select component) with item objects and `value-key` so styling matches the rest of the app. The **municipio** control SHALL remain a searchable combobox (`USelectMenu` or equivalent) with clear. Because `USelect` item values MUST NOT be empty strings, “all / no filter” for region fields SHALL use an internal sentinel value (e.g. `__all__`) mapped in page logic to “no constraint”.

#### Scenario: Region filter cleared to all

- **WHEN** the user chooses the “all” option on `id_especial`, `id_especial2`, or `id_poblacion`
- **THEN** that axis SHALL impose no filter
- **AND** no invalid empty-string item value SHALL be required on `USelect`

### Requirement: Filter row does not remove beeswarm datapoints

Changing filter selections SHALL NOT remove dots from beeswarm simulations; it SHALL only change which municipalities receive emphasis/de-emphasis styling (full distribution remains visible).

#### Scenario: Filters change

- **WHEN** the user changes `id_especial`, `id_especial2`, `id_poblacion`, or municipio
- **THEN** every beeswarm SHALL still render all municipalities that have values for that indicator
- **AND** visual emphasis SHALL update to match the new filter-derived INE set

### Requirement: Empty filter intersection looks filtered, not default

When at least one region filter (`id_especial`, `id_especial2`, or `id_poblacion`) is not “all” and the resulting intersection contains **no** municipalities, the visualization SHALL NOT look like the unfiltered state: the provincial map SHALL show every municipality with reduced fill emphasis (uniformly subdued choropleth), and every beeswarm on the page SHALL show all dots in the same subdued styling used for municipalities outside an active non-empty filter set. Hover emphasis on a municipality or dot SHALL remain visually distinguishable. Datapoints SHALL still be present (this requirement does not remove values from the map or charts).

#### Scenario: Impossible combination of region filters

- **WHEN** the user selects region filter values whose intersection matches zero municipalities
- **THEN** no municipality on the map SHALL appear at full unfiltered fill opacity for the emphasis/fade rules
- **AND** beeswarm dots SHALL appear subdued for all INEs except any dot under active hover emphasis

#### Scenario: Clearing filters restores normal emphasis

- **WHEN** the user clears region filters back to “all” (or resets filters) so the intersection is non-empty or filters are inactive
- **THEN** map and beeswarm emphasis SHALL return to the behaviour defined for matching or inactive filters

### Requirement: Accessibility and i18n

Filter labels and placeholders SHALL use i18n keys (ca/es). Each control SHALL have an accessible name. Keyboard users SHALL be able to open, search (where applicable), select, and clear each control.

#### Scenario: Locale switch

- **WHEN** the user switches between ca and es
- **THEN** filter labels SHALL update without losing the selected logical values (same `codigo_ine` / attribute values)
