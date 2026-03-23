# map-multi-ine-highlight

## ADDED Requirements

### Requirement: Map highlights multiple INEs
`MapTarragona` (and `MapWrapper` as its adapter) SHALL accept an optional list of `codigo_ine` values for persistent visual emphasis on multiple municipality paths simultaneously (e.g. stroke treatment). When the list is empty, multi-INE emphasis SHALL not apply.

#### Scenario: Multiple paths emphasized
- **WHEN** the parent passes a non-empty list of INEs present in the GeoJSON
- **THEN** each corresponding path SHALL render with the multi-selection emphasis style
- **AND** municipalities not in the list SHALL not use that style

#### Scenario: Empty list
- **WHEN** the list prop is empty or omitted
- **THEN** the map SHALL behave as before regarding multi-INE emphasis

### Requirement: Fade fill for municipalities outside emphasized set
`MapTarragona` SHALL support an optional boolean prop (e.g. `fadeUnselected`) that, when true and the multi-INE emphasis list is non-empty, reduces **fill opacity** for paths whose `codigo_ine` is not in that list so emphasized municipalities read clearly at a glance. When `fadeUnselected` is false or the emphasis list is empty, this extra dimming SHALL not apply.

#### Scenario: ODS goal page with active filter emphasis
- **WHEN** the parent passes a non-empty emphasized INE set and sets `fadeUnselected` to true
- **THEN** municipalities outside the set SHALL render with reduced fill opacity (e.g. comparable to existing out-of-`zoomRegion` dimming)
- **AND** municipalities in the set SHALL retain full fill opacity for their choropleth color

#### Scenario: Combined with Camp de Tarragona zoom
- **WHEN** `zoomRegion` is active and `fadeUnselected` is true with a non-empty emphasis list
- **THEN** fill opacity for each path SHALL reflect the stricter of the two dimming rules where both apply (implementation MAY use the minimum opacity)

### Requirement: Opt-in disable of selection zoom
`MapTarragona` SHALL support an optional boolean prop (e.g. `disableSelectionZoom`) that, when true, prevents the automatic zoom/pan behaviour tied to a single selected municipio. Other zoom behaviour (e.g. `zoomRegion` for Camp de Tarragona) SHALL remain governed by existing props unless explicitly changed elsewhere.

#### Scenario: ODS goal page with active filters
- **WHEN** the ODS goal page has a non-empty filter-derived INE set and sets `disableSelectionZoom` to true
- **THEN** the map SHALL NOT apply the single-municipio zoom animation that would otherwise run for `selectedIne`
- **AND** multi-INE emphasis SHALL still render

#### Scenario: Homepage unchanged
- **WHEN** `disableSelectionZoom` is omitted
- **THEN** existing zoom-to-selected behaviour SHALL remain

### Requirement: Interaction with hover highlight
Map hover (`highlightedIne`) MAY coexist with multi-INE emphasis; the hovered municipality SHALL remain visually distinguishable.

#### Scenario: Hover while multi-INE emphasis active
- **WHEN** multi-INE emphasis is active and the user hovers a municipality
- **THEN** the map SHALL emit highlight updates as today
- **AND** no runtime error SHALL occur
