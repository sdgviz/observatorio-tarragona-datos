## 1. Refactor reusable spider chart component

- [x] 1.1 Refactor `app/components/municipio/ods/presupuestos/charts/DoubleSpiderMinMax.vue` to use `<script setup lang="ts">` with explicit typed props (`values`, `labels`, `domainMode`, `height`, `nameMunicipio`).
- [x] 1.2 Remove hardcoded internal compare/mock arrays from `DoubleSpiderMinMax.vue` and make all rendered series driven by props/computed data.
- [x] 1.3 Implement domain selection logic in the component: `0..100` for all non-negative values, `-100..100` when at least one value is negative (`auto` mode).
- [x] 1.4 Keep tooltip and responsive behavior working after refactor, with guards for empty/invalid input arrays.

## 2. Integrate overview chart into indicadores dashboard

- [x] 2.1 In `app/components/municipio/ods/IndicadoresDashboardView.vue`, compute one overview value per ODS (1..17) from currently visible dashboard indicator data.
- [x] 2.2 Add the refactored `DoubleSpiderMinMax` chart above the dashboard card grid, rendering only in dashboard mode context.
- [x] 2.3 Ensure overview chart recomputes/reacts when ODS filters change and when indicator datasets finish loading.
- [x] 2.4 Add loading/empty fallback for overview section when there is not enough data to render meaningful values.

## 3. Remove old usage from presupuestos view

- [x] 3.1 Remove `MunicipioPresupuestosChartsDoubleSpiderMinMax` import from `app/components/municipio/ods/PresupuestosView.vue`.
- [x] 3.2 Remove the `displayViz === 20` rendering block from `PresupuestosView.vue`.
- [x] 3.3 Verify `MunicipioPresupuestosVizNav` flow still works correctly after removing that visualization slot.

## 4. Validation and polish

- [x] 4.1 Validate type-check/lints for all touched files (`DoubleSpiderMinMax.vue`, `IndicadoresDashboardView.vue`, `PresupuestosView.vue`).
- [x] 4.2 Manually verify overview chart scale behavior with (a) all non-negative values and (b) at least one negative value.
- [x] 4.3 Confirm visual layout: overview chart appears above dashboard cards and does not break mobile/desktop grid rendering.
