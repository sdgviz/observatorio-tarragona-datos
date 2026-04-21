## Why

The presupuestos ODS spider chart (`DoubleSpiderMinMax`) dims non-focused axes and dots, which makes the chart harder to read at a glance. Users comparing municipios see comparison data in list/dashboard views but not on the overview spider, and there is no quick way to isolate one serie when several overlap.

## What Changes

- Primary ODS **vertex dots** at **full opacity** (not dimmed by `selectedOds`); **axis spokes** may still emphasize the focused ODS.
- **Rim labels**: ODS index **1–17** on a ring outside the outer guide circle (**no** leader lines).
- **Comparison** series: extra spider **polygons under** the primary area; **shared auto domain** across all series; **comparison vertex dots only** while that municipio is **legend-hovered**; **primary vertex dots hidden** during any comparison legend hover; **pointer-events** on fills disabled so tooltips hit vertices.
- **Legend row** under the chart (primary + comparisons); **hover** dims other series; **tooltip** shows municipio, ODS label, and value for the **hovered serie**.

## Capabilities

### New Capabilities

- `presupuestos-double-spider-chart`: Requirements for `DoubleSpiderMinMax` and callers: rim ODS numbers, layering and pointer-events, comparison/primary dot visibility rules, shared domain, legend emphasis, and vertex tooltips.

### Modified Capabilities

- (none — no published baseline specs in `openspec/specs/` for this area)

## Impact

- **App**: `app/components/municipio/ods/presupuestos/charts/DoubleSpiderMinMax.vue`; likely `IndicadoresView.vue` (or equivalent) to pass comparison overview values and display names aligned with `useMunicipioOdsComparisonStore` / `comparisonCols`.
- **Data**: May require aggregating per-ODS overview values for comparison INEs (same shape as primary `backendOverviewValues`) if not already available from existing fetches.
