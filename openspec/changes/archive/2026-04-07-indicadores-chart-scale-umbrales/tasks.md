## 1. API and types audit

- [x] 1.1 Inventory Nitro routes and composables that return indicator metadata for the municipal ODS dashboard; confirm `umbral_optimo` and `umbral_malo` are present on every path or add them to the SQL/select mapping to match `app/types/ods.ts`.
- [x] 1.2 Manually verify one `$fetch` / `useFetch` response in dev tools (or a short test) that dashboard indicators include both keys (value or `null`).

## 2. Evolution chart (D3)

- [x] 2.1 Add `Y_AXIS_FOCUS_PADDING_RATIO` (default `0.1`) and `fullScale` prop (default `true`) to `app/components/EvolutionChart.vue`; implement focused Y-domain (min/max of finite `datapoints` ± padding) and preserve zero-based domain when `fullScale` is true; handle degenerate min === max.
- [x] 2.2 Add optional `umbralOptimo` and `umbralMalo` props (`number | null`); draw horizontal dashed lines; extend Y domain to include any finite threshold with the active scale rules.
- [x] 2.3 Keep `ClientOnly` / lifecycle patterns intact; adjust Y ticks if needed so focused mode labels remain readable.

## 3. Card and dashboard wiring

- [x] 3.1 Extend `app/components/municipio/ods/IndicadorEvolutionCard.vue` with `fullScale`, `umbralOptimo`, and `umbralMalo` props and forward them to `EvolutionChart`.
- [x] 3.2 Add a single scale-mode toggle to `app/components/municipio/ods/IndicadoresDashboardView.vue` and pass `fullScale` plus `item.indicador.metadata.umbral_optimo` / `umbral_malo` into each evolution card.
- [x] 3.3 Add i18n strings for the toggle label (Catalan and Spanish) under the existing municipio/ODS key structure.

## 4. Verification

- [x] 4.1 Manually test dashboard: toggle full vs focused, indicators with 0/1/many points, and indicators with none/one/both thresholds; confirm lines and domains behave as specified.
- [x] 4.2 If the project has relevant unit tests for chart scales or API shapes, extend them; otherwise document manual checks in the PR description.
