# ods-overview-spider-chart Specification

## Purpose
Defines requirements for the spider chart overview used in ODS and AU views. The host view supplies comparisons, axis configuration, and value vectors via props.

## Requirements

### Requirement: Typed reusable ODS overview spider component
The system SHALL provide a reusable spider chart component for ODS overviews with explicitly typed props. The component SHALL accept ODS values and rendering configuration without relying on presupuestos-specific hardcoded data.

#### Scenario: Component receives typed data
- **WHEN** the component is used in a parent view
- **THEN** it SHALL accept a typed `values` prop containing ODS overview numeric values
- **AND** it SHALL render without requiring hardcoded internal comparison arrays

### Requirement: Parent supplies comparisons
The host view SHALL be able to pass the primary display name, primary value vector, zero or more comparison entries `{ name, values }`, and axis configuration (colors, labels, count) derived from the taxonomy config. The chart SHALL render using these props without relying on internal ODS-specific imports.

#### Scenario: ODS overview with 17 axes
- **WHEN** the ODS IndicadoresView renders the spider overview
- **THEN** it SHALL pass `axisCount=17`, `axisColors` from `ods_list`, and `axisLabels` from i18n ODS name keys
- **AND** the visual result SHALL be identical to the pre-generalization output

#### Scenario: Empty comparisons
- **WHEN** no comparison entries are passed
- **THEN** the chart SHALL render only the primary polygon and primary vertices

### Requirement: Dynamic domain mode for positive and signed values
The spider chart SHALL support positive-only and signed domains. In auto mode, it SHALL use `0..100` when all values are non-negative and `-100..100` when at least one value is negative.

#### Scenario: Positive-only values
- **WHEN** all input values are greater than or equal to zero
- **THEN** the chart domain SHALL be `0..100`

#### Scenario: Mixed-sign values
- **WHEN** at least one input value is negative
- **THEN** the chart domain SHALL be `-100..100`

### Requirement: ODS selection affects emphasis only
The spider chart SHALL always render all axes and values regardless of the axis count. ODS/AU selector state SHALL affect visual emphasis only and SHALL NOT change underlying axis values.

#### Scenario: Single objective selected in 10-axis chart
- **WHEN** `axisCount` is `10` and the user selects only one objective
- **THEN** the chart SHALL still render values for all 10 axes
- **AND** non-selected axis values SHALL NOT be forced to zero

#### Scenario: Single ODS selected
- **WHEN** the user selects only one ODS in the selector
- **THEN** the chart SHALL still render values for all 17 ODS
- **AND** non-selected ODS values SHALL NOT be forced to zero

