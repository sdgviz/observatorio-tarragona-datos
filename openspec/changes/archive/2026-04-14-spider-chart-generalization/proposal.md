## Why

The `DoubleSpiderMinMax` spider chart component hardcodes 17 axes, ODS-specific colors (`odsList[i].color`), and ODS label i18n keys (`ods_${i+1}_name`). With the Agenda Urbana Seguimiento view now live, we need the same spider overview for AU data — but AU has 10 strategic objectives with different colors and labels. Rather than duplicating the chart, the component should be made data-independent so it works with any axis count and color palette.

## What Changes

- **Parameterize `DoubleSpiderMinMax`**: Replace all hardcoded `17`, `odsList`, and ODS i18n references with props-driven configuration — axis count, colors, and labels come from the caller.
- **Add spider overview to AU Seguimiento**: Wire the generalized spider into `Seguimiento.vue` using the AU taxonomy (10 axes, `objetivos_agenda` colors), mirroring how `IndicadoresView.vue` already uses it for ODS.
- **Leverage existing `TaxonomyConfig`**: The `TaxonomyConfig` interface (created in Spec 1) already provides `objectiveCount`, `colorByNum`, and `iconPath` — the spider can derive its axis configuration from this.

## Capabilities

### New Capabilities
- `data-independent-spider-chart`: The `DoubleSpiderMinMax` component accepts axis count, per-axis colors, and per-axis labels as props instead of importing ODS-specific config. Works for any N-axis radar visualization.

### Modified Capabilities
- `ods-overview-spider-chart`: The ODS IndicadoresView continues to render the spider chart with 17 axes but now passes ODS config explicitly via props rather than relying on the chart's internal imports.
- `au-seguimiento-orchestrator`: The AU Seguimiento view gains a spider overview panel showing per-objective promedio_indice values on 10 axes, with comparison support.

## Impact

- **Components**: `DoubleSpiderMinMax.vue` — internal refactor to accept `axisCount`, `axisColors`, `axisLabels` props; remove `import odsList` and hardcoded `17`.
- **ODS consumer** (`IndicadoresView.vue`): Passes explicit ODS axis config (colors from `ods_list`, labels from i18n) — purely additive, no behavioral change.
- **AU consumer** (`Seguimiento.vue`): Adds spider overview section with overview values computed from hierarchy `promedio_indice`, identical pattern to ODS.
- **No API changes**: Spider data is already available from the hierarchy endpoint's `promedio_indice` on each objetivo.
- **No breaking changes**: Default behavior for existing callers preserved via prop defaults.
