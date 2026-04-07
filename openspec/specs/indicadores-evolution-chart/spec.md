# indicadores-evolution-chart

Evolution charts for municipal ODS indicators: Y-axis full vs focused scale, dashboard-only control in the parent view, optional threshold reference lines when full scale, and API metadata for umbrales.

## Requirements

### Requirement: Evolution chart supports full and focused Y-axis scale

The evolution chart component SHALL expose a boolean prop `fullScale`. When `fullScale` is true, the Y-axis domain SHALL include zero and the maximum of the series values with a small positive headroom consistent with the previous default behavior. When `fullScale` is false, the Y-axis domain SHALL be derived only from the minimum and maximum of the series values present in `datapoints`, expanded by a configurable padding ratio applied below the minimum and above the maximum. The padding ratio SHALL be defined as a single named constant in code (default 0.1) so it can be adjusted without prop drilling. When `fullScale` is false, threshold values SHALL NOT influence the Y-axis domain.

#### Scenario: Default preserves full-scale behavior

- **WHEN** the chart renders with `fullScale` true (or default) and non-empty `datapoints`
- **THEN** the Y-axis domain includes zero and does not clip the series from below at a positive minimum solely due to focused scaling

#### Scenario: Focused scale emphasizes variation

- **WHEN** the chart renders with `fullScale` false and at least two distinct finite values exist in `datapoints`
- **THEN** the Y-axis minimum is strictly less than or equal to the smallest series value minus padding and the Y-axis maximum is greater than or equal to the largest series value plus padding, where padding is computed from the data span and the configured ratio

#### Scenario: Focused scale ignores thresholds for the domain

- **WHEN** the chart renders with `fullScale` false and finite `umbralOptimo` and/or `umbralMalo` props are set
- **THEN** the Y-axis domain is the same as if those threshold props were null (data min/max ± padding only)

#### Scenario: Degenerate series still renders

- **WHEN** the chart renders with `fullScale` false and all finite values are equal (or only one finite value exists)
- **THEN** the chart applies a non-degenerate Y-axis domain around that value so ticks and the line remain visible

### Requirement: Parent view provides scale control for the dashboard tab only

The municipal ODS indicators parent view (`IndicadoresView` or equivalent) SHALL provide one user-visible control that toggles between full-scale and focused-scale modes. The control SHALL be shown only when the user has selected the dashboard (not list) presentation mode. The control SHALL drive the `fullScale` value passed into `IndicadoresDashboardView`, which SHALL pass it to each `IndicadorEvolutionCard` used for evolution visualizations.

#### Scenario: Toggle updates all evolution cards on the dashboard

- **WHEN** the user changes the scale toggle while the dashboard tab is active
- **THEN** every visible evolution card in the dashboard re-renders with the new `fullScale` value

#### Scenario: Control hidden on list tab

- **WHEN** the user selects the list presentation mode
- **THEN** the scale toggle is not visible

### Requirement: Threshold reference lines on the evolution chart when full scale

The evolution chart SHALL accept optional numeric props for optimal and bad thresholds (e.g. `umbralOptimo` and `umbralMalo`, or equivalent names consistent with the codebase). When `fullScale` is true, for each prop that is a finite number, the chart SHALL draw a horizontal dashed line across the plotting area at that Y value, and the Y-axis domain SHALL be extended if necessary so that all drawn threshold lines and the series (with full-scale domain rules above) remain visible. When `fullScale` is false, the chart SHALL NOT draw threshold reference lines regardless of prop values.

#### Scenario: Both thresholds drawn in full-scale mode

- **WHEN** `fullScale` is true and both threshold props are finite numbers
- **THEN** two distinct dashed horizontal reference lines are rendered at those values

#### Scenario: Missing threshold omits line

- **WHEN** a threshold prop is null, undefined, or not a finite number
- **THEN** no reference line is drawn for that threshold

#### Scenario: Focused mode hides threshold lines

- **WHEN** `fullScale` is false and both threshold props are finite numbers
- **THEN** no threshold reference lines are rendered

### Requirement: Card forwards scale and threshold props to the chart

The indicator evolution card SHALL accept `fullScale` and threshold value props and SHALL forward them to the underlying evolution chart without altering their meaning.

#### Scenario: Props reach the chart

- **WHEN** the card is rendered with `fullScale` and threshold props set
- **THEN** the embedded evolution chart receives the same values as props (or equivalent bindings)

### Requirement: Indicator payloads expose threshold metadata for chart use

Every server API response shape that supplies `OdsIndicador` (or equivalent indicator metadata) to the municipal ODS evolution flow SHALL include `umbral_optimo` and `umbral_malo` fields when stored in the database, using `null` when a value is absent. No additional client-only fetch SHALL be required solely to obtain these two fields for dashboard evolution cards.

#### Scenario: Dashboard data includes thresholds

- **WHEN** the client loads indicator metadata used to render the dashboard evolution cards
- **THEN** each indicator object includes `umbral_optimo` and `umbral_malo` keys consistent with `app/types/ods.ts`
