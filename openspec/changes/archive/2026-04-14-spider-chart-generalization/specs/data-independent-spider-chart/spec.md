## ADDED Requirements

### Requirement: Spider chart accepts configurable axis count
The `DoubleSpiderMinMax` component SHALL accept an `axisCount` prop (number) that determines the number of radar axes rendered. All internal calculations — angle distribution, value arrays, guide circles, rim labels — SHALL derive from this prop instead of a hardcoded constant.

#### Scenario: 17-axis chart (ODS default)
- **WHEN** `axisCount` is not provided or set to `17`
- **THEN** the chart SHALL render 17 evenly-spaced radial axes, identical to the current ODS spider behavior

#### Scenario: 10-axis chart (AU)
- **WHEN** `axisCount` is set to `10`
- **THEN** the chart SHALL render 10 evenly-spaced radial axes
- **AND** `values`, `axisColors`, and `axisLabels` arrays SHALL be interpreted as having 10 elements

#### Scenario: Values array shorter than axisCount
- **WHEN** the `values` array has fewer elements than `axisCount`
- **THEN** missing positions SHALL default to `0`

### Requirement: Spider chart accepts per-axis colors
The component SHALL accept an `axisColors` prop (`string[]`) providing a color for each axis vertex dot. When not provided, the component SHALL default to ODS colors from the existing `ods_list` configuration.

#### Scenario: Custom colors provided
- **WHEN** `axisColors` is passed with 10 hex color strings
- **THEN** vertex dot `i` SHALL use `axisColors[i]` as its fill color
- **AND** the ODS color list SHALL NOT be imported or referenced

#### Scenario: No colors provided (ODS default)
- **WHEN** `axisColors` is not provided
- **THEN** vertex dot `i` SHALL use the color from `ods_list[i]` (backward compatibility)

### Requirement: Spider chart accepts per-axis labels
The component SHALL accept an `axisLabels` prop (`string[]`) providing a display label for each axis used in tooltips. When not provided, the component SHALL fall back to the i18n key `ods_${i+1}_name`.

#### Scenario: Custom labels provided
- **WHEN** `axisLabels` is passed with strings matching the axis count
- **THEN** tooltip text for axis `i` SHALL use `axisLabels[i]`

#### Scenario: No labels provided (ODS default)
- **WHEN** `axisLabels` is not provided
- **THEN** tooltip text for axis `i` SHALL use the translated `ods_${i+1}_name` key

### Requirement: Spider chart does not import taxonomy-specific modules
The `DoubleSpiderMinMax` component SHALL NOT directly import `odsList`, `ods_list`, `objetivos_agenda`, or any taxonomy-specific configuration module. All taxonomy-specific data SHALL be received via props.

#### Scenario: Component module dependencies
- **WHEN** inspecting the component's import statements
- **THEN** no import SHALL reference `ods-list`, `config.js`, or taxonomy-specific files
- **AND** the component SHALL only depend on D3, VueUse, and Vue core

### Requirement: Comparison series respect configurable axis count
Comparison series sanitization SHALL use `axisCount` instead of a hardcoded `17` for array length normalization.

#### Scenario: Comparison with 10-axis chart
- **WHEN** `axisCount` is `10` and a comparison has 10 values
- **THEN** the comparison polygon SHALL render with 10 vertices
- **AND** comparison vertex colors SHALL use `axisColors` indices
