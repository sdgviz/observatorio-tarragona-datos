# beeswarm-color-scale-and-variable-size

## ADDED Requirements

### Requirement: Optional color scale for dot fill

BeeswarmChart SHALL accept an optional prop `colorScale?: (value: number) => string`. When provided, each dot’s fill SHALL be the result of `colorScale(datapoint.valor)` (the same variable as the X axis), so colors align with the map. When `colorScale` is not provided, the chart SHALL use the existing `color` prop (fixed color for all dots). The `color` prop SHALL remain supported and SHALL be used whenever `colorScale` is absent.

#### Scenario: Color scale provided
- **WHEN** the component receives a `colorScale` function
- **THEN** each dot SHALL be filled with `colorScale(datapoint.valor)`
- **AND** the fixed `color` prop SHALL be ignored for fill (but MAY still be used for other cases, e.g. fallback or highlight, if defined)

#### Scenario: Color scale not provided
- **WHEN** the component does not receive `colorScale` (or it is undefined)
- **THEN** all dots SHALL use the `color` prop for fill as they do today
- **AND** behavior SHALL be unchanged from the current implementation

#### Scenario: Same variable as X axis
- **WHEN** `colorScale` is used
- **THEN** the value passed to `colorScale` SHALL be the same as the value used for the dot’s X position (e.g. `datapoint.valor`)

---

### Requirement: Optional variable size by secondary data

BeeswarmChart SHALL accept optional props `sizeBySecondaryData?: boolean` and `secondaryValues?: Record<string, number>` (codigoIne → numeric value, e.g. population). When `sizeBySecondaryData` is true and `secondaryValues` is provided, each dot’s radius SHALL be proportional to the secondary value for that dot’s `codigoIne`. This behavior SHALL be independent of the color scale: variable size MAY be used with or without `colorScale`. The component SHALL NOT fetch data; the parent SHALL supply `secondaryValues` (e.g. from API or DB).

#### Scenario: Variable size enabled with secondary values
- **WHEN** `sizeBySecondaryData` is true and `secondaryValues` is a non-empty Record
- **THEN** each dot’s radius SHALL be derived from `secondaryValues[datapoint.codigoIne]` (e.g. via a scale from data range to a pixel radius range)
- **AND** the force simulation (e.g. collision) SHALL take each dot’s radius into account so dots do not overlap

#### Scenario: Variable size disabled or secondary values missing
- **WHEN** `sizeBySecondaryData` is false/undefined or `secondaryValues` is undefined/empty
- **THEN** all dots SHALL use the default fixed radius (current behavior)
- **AND** the chart SHALL behave as today

#### Scenario: Missing secondary value for a dot
- **WHEN** `sizeBySecondaryData` is true and `secondaryValues` is provided but `secondaryValues[datapoint.codigoIne]` is missing or invalid
- **THEN** that dot SHALL use a fallback radius (e.g. default or minimum radius) so it remains visible and layout is stable

#### Scenario: No data loading inside the chart
- **WHEN** the component is rendered with any combination of the new props
- **THEN** the chart SHALL NOT perform any data fetching (no API calls, no DB access)
- **AND** all values (including secondary data) SHALL come from props provided by the parent

---

### Requirement: Backward compatibility when new props omitted

When neither the color scale nor the size-by-secondary-data props are passed (or are effectively disabled), BeeswarmChart SHALL behave exactly as before this change: fixed `color`, fixed radius, and all existing props and behavior (highlights, highlightedIne, tooltip, etc.) SHALL remain unchanged.

#### Scenario: No new props passed
- **WHEN** the parent does not pass `colorScale`, and does not pass `sizeBySecondaryData` true with `secondaryValues`
- **THEN** the chart SHALL render with a single fill color and fixed dot radius
- **AND** existing behavior (axis, tooltip, highlights, cross-highlight) SHALL be unchanged
