## ADDED Requirements

### Requirement: Standalone use — no dependency on the other component

MapTarragona (and MapWrapper) and BeeswarmChart SHALL function correctly when used alone on any page. Neither component SHALL require the other to be present. The `highlightedIne` prop SHALL be optional (omit or pass null); the highlight emit (e.g. `update:highlightedIne`) SHALL be optional for the parent to listen to. When used alone, each component SHALL still render, show hover tooltip, and apply highlight styling when the parent passes `highlightedIne`; if the parent does not pass it or does not listen to the emit, the component SHALL behave normally without cross-highlight.

#### Scenario: Map used without beeswarm
- **WHEN** a page renders only the map (or MapWrapper) and does not render BeeswarmChart
- **THEN** the map SHALL render and work normally (fill, tooltip, zoom)
- **AND** the map MAY accept optional `highlightedIne` and emit `update:highlightedIne` on hover; the parent MAY ignore the emit
- **AND** the map SHALL NOT assume or depend on the beeswarm being present

#### Scenario: Beeswarm used without map
- **WHEN** a page renders only BeeswarmChart and does not render the map
- **THEN** the beeswarm SHALL render and work normally (dots, axis, tooltip)
- **AND** the beeswarm MAY accept optional `highlightedIne` (or `highlights`) and emit `update:highlightedIne` on hover; the parent MAY ignore the emit
- **AND** the beeswarm SHALL NOT assume or depend on the map being present

#### Scenario: Both used together — parent may connect them
- **WHEN** a page renders both the map and the beeswarm
- **THEN** the parent MAY hold a single `highlightedIne` state and pass it to both, and listen to both emits, to achieve cross-highlight
- **AND** the parent MAY instead use only one component's highlight (e.g. pass state only to the map and ignore the beeswarm emit)

---

### Requirement: Page owns shared highlighted INE state (when both are present)

When a page renders both the map and the beeswarm and wishes to connect them, it SHALL own a single reactive value for the currently highlighted municipality: one INE code or null. This value SHALL be passed down to whichever of the two components are present (one or both). When either component reports a hover (or equivalent) over a municipality, the page SHALL set this value to that INE code; when the pointer leaves, the page SHALL set it to null (unless a separate “pin” behavior is implemented).

#### Scenario: Page holds highlighted state
- **WHEN** the page is rendered with both the map and beeswarm and connects them
- **THEN** it SHALL maintain a single `highlightedIne` (or equivalent) value of type `string | null`
- **AND** SHALL pass this value to the map component (or MapWrapper) and to the beeswarm component

#### Scenario: Highlight propagates from map hover
- **WHEN** the user hovers over a municipality path in the map
- **THEN** the map SHALL emit an event (e.g. `update:highlightedIne`) with that municipality’s INE code
- **AND** the page SHALL update its highlighted state to that code
- **AND** both the map and the beeswarm SHALL reflect the new highlight

#### Scenario: Highlight propagates from beeswarm hover
- **WHEN** the user hovers over a dot in the beeswarm chart
- **THEN** the beeswarm SHALL emit an event (e.g. `update:highlightedIne`) with that dot’s `codigoIne`
- **AND** the page SHALL update its highlighted state to that code
- **AND** both the beeswarm and the map SHALL reflect the new highlight

#### Scenario: Clear highlight on pointer leave
- **WHEN** the user moves the pointer out of the map path or beeswarm dot that was highlighted
- **THEN** the component SHALL emit a clear (e.g. `null`) for the highlighted INE
- **AND** the page SHALL set highlighted state to null
- **AND** both visualizations SHALL remove the highlight styling

---

### Requirement: Map shows highlight with border and size emphasis

MapTarragona (and MapWrapper where it forwards props) SHALL accept an optional `highlightedIne` prop (`string | null`). The prop SHALL be optional so that the map can be used on pages that do not participate in cross-highlight. When it is set, the municipality path whose INE code matches SHALL be drawn with a stronger border and a slight size increase (e.g. thicker stroke and/or a small scale from the path’s centroid) so it stands out. All other paths SHALL use the default styling.

#### Scenario: No highlight
- **WHEN** `highlightedIne` is null or undefined
- **THEN** all map paths SHALL use the default stroke and size (no emphasis)

#### Scenario: One path highlighted
- **WHEN** `highlightedIne` is set to a valid INE code that exists in the map data
- **THEN** the matching path SHALL be drawn with a visibly stronger border (e.g. thicker stroke and/or distinct stroke color)
- **AND** SHALL have a slight size increase (e.g. scale or stroke) so it is clearly emphasized
- **AND** all other paths SHALL keep default styling

#### Scenario: Map emits highlight on hover
- **WHEN** the user hovers over a municipality path (e.g. mouseenter)
- **THEN** the map component SHALL emit an event (e.g. `update:highlightedIne`) with that path’s INE code
- **WHEN** the user leaves that path (e.g. mouseleave)
- **THEN** the map SHALL emit an event to clear the highlight (e.g. `null`)

---

### Requirement: Beeswarm shows highlight with border and larger dot

BeeswarmChart SHALL accept an optional `highlightedIne` prop (`string | null`), or the page MAY pass the same value via the existing `highlights` prop (e.g. `highlights: highlightedIne ? [highlightedIne] : []`). These props SHALL be optional so that the beeswarm can be used on pages that do not participate in cross-highlight. When a single INE is highlighted, the matching dot SHALL be drawn with a visible border (e.g. stroke) and a larger radius than the default so it stands out. Optionally, non-highlighted dots MAY be de‑emphasized (e.g. reduced opacity) when a highlight is active; existing `highlights` behavior MAY be used for that.

#### Scenario: No highlight
- **WHEN** `highlightedIne` is null (or `highlights` is empty) and no hover is active
- **THEN** all dots SHALL use the default radius and no border (or default styling)

#### Scenario: One dot highlighted
- **WHEN** `highlightedIne` is set to a valid `codigoIne` present in the datapoints
- **THEN** the matching dot SHALL be drawn with a larger radius (e.g. 1.25–1.5× the default)
- **AND** SHALL have a visible border (e.g. stroke) so it is clearly emphasized
- **AND** other dots MAY be drawn with reduced opacity or unchanged, as defined by the component

#### Scenario: Beeswarm emits highlight on hover
- **WHEN** the user hovers over a dot (e.g. mouseenter)
- **THEN** the beeswarm component SHALL emit an event (e.g. `update:highlightedIne`) with that dot’s `codigoIne`
- **WHEN** the user leaves that dot (e.g. mouseleave)
- **THEN** the beeswarm SHALL emit an event to clear the highlight (e.g. `null`)

---

### Requirement: Two-way sync between map and beeswarm

Highlighting a municipality in one visualization SHALL be reflected in the other. The same INE code SHALL be used in both (map uses CODEINE from GeoJSON; beeswarm uses `codigoIne` from datapoints; they SHALL match).

#### Scenario: Hover on map updates beeswarm
- **WHEN** the user hovers a municipality on the map
- **THEN** the corresponding dot in the beeswarm (same INE code) SHALL show the highlight styling (border, larger radius)
- **AND** other beeswarm dots SHALL not be highlighted (or SHALL be de‑emphasized if so specified)

#### Scenario: Hover on beeswarm updates map
- **WHEN** the user hovers a dot in the beeswarm
- **THEN** the corresponding municipality path on the map (same INE code) SHALL show the highlight styling (border, size emphasis)
- **AND** other map paths SHALL not be highlighted
