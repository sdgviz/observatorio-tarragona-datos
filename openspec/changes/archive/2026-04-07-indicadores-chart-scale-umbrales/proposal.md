## Why

Evolution charts for municipal ODS indicators currently use a Y-axis from zero to the series maximum, which compresses the visible variation and makes year-to-year changes hard to read. At the same time, metadata already defines good/bad reference values (`umbral_optimo`, `umbral_malo`) that are not drawn on the evolution chart, so users cannot relate the series to policy targets at a glance.

## What Changes

- Add a **user-controlled scale mode** for dashboard evolution charts: default “full” scale (0 → max, current behavior) vs **focused scale** around the observed data (min/max of the series with configurable padding, e.g. ±10%). The toggle lives in **`IndicadoresView`**, below the Lista/Dashboard tabs, **visible only on the Dashboard tab**; state is passed into `IndicadoresDashboardView` as `fullScale`.
- Introduce a **`fullScale` prop** on the evolution chart (and card wrapper) so parents can bind that mode; when `fullScale` is false, the Y domain is **only** data extrema ± padding (thresholds do not affect the domain).
- **Plot optional reference lines** for `umbral_optimo` and `umbral_malo` as horizontal **dashed** lines **only when `fullScale` is true**; pass values as props on `IndicadorEvolutionCard` and the chart. When `fullScale` is false, umbrales are ignored for both domain and drawing.
- **API / payload audit**: ensure every response path that feeds evolution views includes `umbral_optimo` and `umbral_malo` in indicator metadata where the DB provides them (the main `/api/ods/indicadores` handler already maps these; any slimmer or serie-only endpoint must be aligned so the UI does not need a second fetch for thresholds).

## Capabilities

### New Capabilities

- `indicadores-evolution-chart`: Evolution chart Y-axis modes (full vs data-focused; focused ignores umbrales), scale toggle in `IndicadoresView` (dashboard tab only) → `IndicadoresDashboardView` → `IndicadorEvolutionCard` → chart; dashed threshold lines only in full-scale mode; `evolutionChartDomain` helper; API payload check for `umbral_*` on indicator metadata.

### Modified Capabilities

- _(none — `openspec/specs/` has no baseline specs yet; this change introduces the first spec for this area.)_

## Impact

- **Frontend** (`diputacion_tarragona`): `IndicadoresView.vue`, `IndicadoresDashboardView.vue`, `IndicadorEvolutionCard.vue`, `EvolutionChart.vue`, `app/utils/evolutionChartDomain.ts`, `IndicadoresPanel.vue` (threshold props only); i18n for toggle label (`municipio.ods.evolutionChart.axisFromZero`).
- **Backend** (`diputacion_tarragona`): any ODS indicator or serie API that currently omits `umbral_optimo` / `umbral_malo` in JSON should include them consistently with `app/types/ods.ts`.
- **Data pipeline** (`diputacion_tarragona_data`): no CSV/schema change required if thresholds already exist in source metadata loaded into SQLite; only if a transform step strips these columns would a data task be needed.
