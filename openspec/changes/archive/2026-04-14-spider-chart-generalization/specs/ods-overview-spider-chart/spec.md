## MODIFIED Requirements

### Requirement: Parent supplies comparisons
The host view SHALL be able to pass the primary display name, primary value vector, zero or more comparison entries `{ name, values }`, and axis configuration (colors, labels, count) derived from the taxonomy config. The chart SHALL render using these props without relying on internal ODS-specific imports.

#### Scenario: ODS overview with 17 axes
- **WHEN** the ODS IndicadoresView renders the spider overview
- **THEN** it SHALL pass `axisCount=17`, `axisColors` from `ods_list`, and `axisLabels` from i18n ODS name keys
- **AND** the visual result SHALL be identical to the pre-generalization output

#### Scenario: Empty comparisons
- **WHEN** no comparison entries are passed
- **THEN** the chart SHALL render only the primary polygon and primary vertices

### Requirement: ODS selection affects emphasis only
The spider chart SHALL always render all axes and values regardless of the axis count. ODS/AU selector state SHALL affect visual emphasis only and SHALL NOT change underlying axis values.

#### Scenario: Single objective selected in 10-axis chart
- **WHEN** `axisCount` is `10` and the user selects only one objective
- **THEN** the chart SHALL still render values for all 10 axes
- **AND** non-selected axis values SHALL NOT be forced to zero
