# beeswarm-chart-component (delta)

## ADDED Requirements

### Requirement: Datapoint may include reference period

Each `BeeswarmDatapoint` MAY include an optional **`periodo`** (number | null): the reference calendar year for that dot’s `valor`. The component SHALL accept and preserve this field through simulation and hover state.

#### Scenario: Datapoint with periodo

- **WHEN** a datapoint includes `periodo: 2022`
- **THEN** the component SHALL render without error
- **AND** the hover tooltip SHALL include that year as specified in the modified tooltip requirement below

#### Scenario: Datapoint without periodo

- **WHEN** `periodo` is omitted
- **THEN** the tooltip SHALL not show a year line (unless a future prop supplies a layer-level caption outside this component)

## MODIFIED Requirements

### Requirement: Tooltip on hover

The chart SHALL display a tooltip when the user hovers over a dot.

#### Scenario: Hover shows tooltip

- **WHEN** the user hovers over a dot
- **THEN** a tooltip SHALL appear near the dot showing: municipality name, formatted value with unit when `unidad` is non-empty
- **AND** when the datapoint’s `periodo` is a non-null number, the tooltip SHALL also show the reference year in a user-visible way (same line or second line)

#### Scenario: Hover leaves hides tooltip

- **WHEN** the user moves the mouse away from a dot
- **THEN** the tooltip SHALL disappear
