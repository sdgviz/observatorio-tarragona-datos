## Requirements

### Requirement: Primary ODS vertex dots at full opacity

The chart SHALL render each primary-serie ODS vertex circle at full opacity (opacity 1) whenever that serie’s dots are shown. Primary dot visibility SHALL NOT be reduced based on `selectedOds` membership.

#### Scenario: Single focused ODS on axes

- **WHEN** `selectedOds` lists only one ODS and primary dots are visible
- **THEN** every primary vertex circle for all 17 axes SHALL still render at opacity 1

### Requirement: ODS index labels on the outer rim

The chart SHALL display the ODS ordinal (1–17) for each axis without requiring hover. Labels SHALL be placed on a ring outside the outer guide circle, centered on each axis direction (radial placement). The chart SHALL NOT draw connector lines or leaders from the web to those labels.

#### Scenario: Default view

- **WHEN** the chart renders with no pointer interaction
- **THEN** all 17 rim labels SHALL be visible as numbers around the main circle with no polylines attached

#### Scenario: Emphasis aligned with axis selection

- **WHEN** `selectedOds` is a strict subset of 1–17
- **THEN** rim label opacity MAY emphasize selected axes relative to others (implementation-defined), while numbers remain present for every axis

### Requirement: Shared radial domain for all series

When `domainMode` is `auto`, the chart SHALL derive signed vs positive scale from **all** series present (primary and comparisons). All polygons SHALL use the same `domainMin`, `domainMax`, and radius mapping so shapes are comparable.

#### Scenario: Negative values in a comparison serie

- **WHEN** any serie includes a negative value and `domainMode` is `auto`
- **THEN** every serie SHALL use the signed domain (e.g. −100…100) for radius mapping

### Requirement: Comparison polygons behind the primary serie

Comparison closed areas SHALL be painted before the primary polygon in display order so comparison fills and strokes sit **under** the primary spider area. Serie path elements SHALL use non-interactive hit testing (e.g. `pointer-events: none`) so vertex tooltips target circles, not fills.

#### Scenario: Overlapping webs

- **WHEN** comparisons are provided
- **THEN** the primary polygon SHALL visually sit above comparison polygons where they overlap

### Requirement: Comparison vertex dots only when highlighted

Comparison municipio vertex circles SHALL render **only** while the pointer hovers that municipio’s name in the legend row. At all other times comparison vertex markers SHALL not be shown.

#### Scenario: No legend hover

- **WHEN** no legend name is hovered
- **THEN** no comparison vertex circles SHALL be visible

#### Scenario: Comparison legend hover

- **WHEN** the user hovers a comparison municipio name in the legend
- **THEN** vertex circles for that comparison serie only SHALL appear

### Requirement: Primary vertex dots hidden during comparison legend hover

While the pointer hovers **any** comparison municipio name in the legend, the primary serie’s vertex circles SHALL be **hidden** (not drawn), not merely dimmed, so only the highlighted comparison’s dots are visible at vertices.

#### Scenario: Hover comparison then leave

- **WHEN** the user hovers a comparison name and then moves the pointer off the legend without selecting another name
- **THEN** primary vertex circles SHALL become visible again according to default visibility rules

### Requirement: Municipio legend and hover-to-emphasize

The chart SHALL show the primary municipio name and each comparison name in a row below the SVG. Hovering a name SHALL reduce the opacity of all **other** series’ rendered groups (polygons and any visible dots) so the hovered serie reads as dominant; leaving the legend SHALL restore default emphasis.

#### Scenario: Hover primary name

- **WHEN** the user hovers the primary municipio label
- **THEN** comparison series SHALL render at reduced opacity and the primary serie SHALL remain at full emphasis opacity

#### Scenario: Hover comparison name

- **WHEN** the user hovers a comparison municipio label
- **THEN** the primary and other comparisons SHALL render at reduced opacity and the hovered comparison SHALL remain at full emphasis opacity

### Requirement: Vertex tooltip for the active serie

When the pointer hovers a visible vertex circle, the chart SHALL show a tooltip (or equivalent overlay) that includes the hovered serie’s municipio display name, the ODS dimension label for that vertex, and the numeric value for that serie at that ODS index.

#### Scenario: Tooltip matches serie

- **WHEN** the user hovers a comparison vertex after highlighting that comparison in the legend
- **THEN** the tooltip value SHALL reflect that comparison’s data, not the primary serie’s

### Requirement: Parent supplies comparisons

The host view SHALL be able to pass the primary display name, primary 17-value vector, and zero or more comparison entries `{ name, values }` derived from the same per-ODS overview semantics as the primary hierarchy, so the chart can render extra series without new backend contracts beyond existing hierarchy fetches.

#### Scenario: Empty comparisons

- **WHEN** no comparison entries are passed
- **THEN** the chart SHALL render only the primary polygon and primary vertices (subject to other requirements)
