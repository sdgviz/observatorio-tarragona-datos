## 1. Shared time-series loading

- [x] 1.1 Extract or implement a composable (e.g. `useIndicadorValoresSeries`) that accepts `codigoIne`, a reactive list of indicator IDs, concurrency limit 5, and returns `Map`/reactive cache, per-ID loading flags, and fetch-on-IDs-change behavior matching current `IndicadoresDashboardView` semantics.
- [x] 1.2 Move the fetch/watch logic from `IndicadoresDashboardView.vue` into `IndicadoresView.vue` (using the composable); pass series + loading state into `IndicadoresDashboardView` via props.
- [x] 1.3 Remove duplicate fetch/watch from `IndicadoresDashboardView.vue`; keep presentation, `overviewValues`, and card rendering only.
- [x] 1.4 Confirm with DevTools: opening Indicadores tab triggers one batch of `/api/indicadores/valores` requests; toggling Lista ↔ Dashboard does not re-fetch cached IDs.

## 2. Trend helper

- [x] 2.1 Add a pure utility (e.g. `indicadorTrendDirection`) that, given ordered `{ periodo, valor }[]` and `umbral_optimo` / `umbral_malo`, returns `'up' | 'down' | 'neutral' | 'loading'` (or equivalent) per design (first vs latest non-null `valor`).
- [x] 2.2 Unit-test or manually verify higher-is-better and lower-is-better examples and single-point / empty / missing-threshold cases.

## 3. Lista table UI

- [x] 3.1 Replace `IndicadoresListView` row layout with `UTable` (or equivalent) columns: ODS, nombre, valor (raw), `indice` (normalized), trend (icon).
- [x] 3.2 Wire props: `sortedItems`, `codigoIne`, series cache + loading from parent; compute trend per row from utility.
- [x] 3.3 Use green/red Lucide icons (e.g. `i-lucide-trending-up` / `trending-down`) with accessible labels; neutral/loading/empty states per spec.
- [x] 3.4 Preserve `open-panel` on row activation (keyboard + click).

## 4. Specs and QA

- [x] 4.1 Run lint/typecheck on touched Vue/composable files.
- [x] 4.2 Manual QA: filter ODS, sort, Lista table, Dashboard cards, panel open, municipio with sparse data.
