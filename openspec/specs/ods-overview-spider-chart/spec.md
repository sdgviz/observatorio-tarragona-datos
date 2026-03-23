# ods-overview-spider-chart Specification

## Purpose
TBD - created by archiving change indicadores-dashboard-overview-chart. Update Purpose after archive.
## Requirements
### Requirement: Typed reusable ODS overview spider component
The system SHALL provide a reusable spider chart component for ODS overviews with explicitly typed props. The component SHALL accept ODS values and rendering configuration without relying on presupuestos-specific hardcoded data.

#### Scenario: Component receives typed data
- **WHEN** the component is used in a parent view
- **THEN** it SHALL accept a typed `values` prop containing ODS overview numeric values
- **AND** it SHALL render without requiring hardcoded internal comparison arrays

### Requirement: Dynamic domain mode for positive and signed values
The spider chart SHALL support positive-only and signed domains. In auto mode, it SHALL use `0..100` when all values are non-negative and `-100..100` when at least one value is negative.

#### Scenario: Positive-only values
- **WHEN** all input values are greater than or equal to zero
- **THEN** the chart domain SHALL be `0..100`

#### Scenario: Mixed-sign values
- **WHEN** at least one input value is negative
- **THEN** the chart domain SHALL be `-100..100`

### Requirement: ODS selection affects emphasis only
The spider chart SHALL always render all 17 ODS axes and values. ODS selector state SHALL affect visual emphasis only and SHALL NOT change underlying axis values.

#### Scenario: Single ODS selected
- **WHEN** the user selects only one ODS in the selector
- **THEN** the chart SHALL still render values for all 17 ODS
- **AND** non-selected ODS values SHALL NOT be forced to zero

