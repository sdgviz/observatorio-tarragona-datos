## Why

The new indicadores dashboard improves per-indicator visibility, but it still lacks a single overview that summarizes municipality performance across all ODS at once. Adding a top-level overview spider chart will provide fast pattern recognition before users inspect individual indicator cards.

## What Changes

- Add an ODS overview spider chart above the indicator dashboard grid in `IndicadoresDashboardView.vue` (dashboard mode only).
- Reuse and refactor `DoubleSpiderMinMax.vue` so it is no longer tied to the presupuestos view and can be used for indicadores overview data.
- Remove the `DoubleSpiderMinMax` usage from `PresupuestosView.vue`.
- Type and harden the refactored spider component props and internal data handling.
- Add scale behavior for overview values:
  - Use `0..100` when all ODS overview values are non-negative.
  - Use `-100..100` when at least one ODS overview value is negative.

## Capabilities

### New Capabilities
- `ods-overview-spider-chart`: Reusable typed spider overview chart component for ODS distributions that supports positive-only and mixed-sign ranges.

### Modified Capabilities
- `indicadores-dashboard-view`: Adds an overview spider section above the dashboard cards and defines how dashboard-level ODS aggregates are visualized.

## Impact

- **Components**:
  - `app/components/municipio/ods/presupuestos/charts/DoubleSpiderMinMax.vue` (refactor + typing + reusable data contract)
  - `app/components/municipio/ods/IndicadoresDashboardView.vue` (new overview chart section)
  - `app/components/municipio/ods/PresupuestosView.vue` (remove DoubleSpiderMinMax usage/import)
- **Data model**:
  - Dashboard will compute/derive one normalized ODS value per ODS (1..17) from current indicator data cache/state.
- **API/dependencies**:
  - No new backend endpoints and no new npm dependencies required.
