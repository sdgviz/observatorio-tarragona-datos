## Why

Stakeholders need to see **which reference year** and **which unit** apply to every snapshot value. Without that, users cannot judge whether data is current or compare indicators fairly. Lista de indicadores must expose the year explicitly in the table; map and beeswarm tooltips must not show bare numbers.

## What Changes

- **API**: Responses that return “latest” or snapshot values SHALL include the **reference period (`periodo`)** where the backing row exists: extend `GET /api/ods/promedios` and `GET /api/indicadores/por-comarca`; normatively confirm `GET /api/indicadores/valores` for `latest=true` (and equivalent single-row modes) always includes `periodo` on each value object.
- **Frontend**: `BeeswarmChart` tooltips and province choropleth tooltips (`MapTarragona` / consumers) SHALL show **year + unit** when props/data supply them; pages that build datapoints SHALL pass through `periodo` and `unidad` from APIs.
- **Lista**: `IndicadoresListView` SHALL add a dedicated **reference year** column using `OdsIndicador.periodo`.
- **i18n**: New user-visible labels (column header, tooltip fragments) SHALL use `useI18n()` keys in `ca` and `es` where the app already localizes.

## Capabilities

### New Capabilities

- `indicator-temporal-context-api`: Contract for exposing `periodo` on snapshot / latest-backed ODS promedio rows, por-comarca rows, and valores latest responses.
- `indicator-value-tooltips`: Beeswarm and main choropleth map tooltips display value with unit and reference year when available; optional chart subtitle where a single year applies to the whole view.

### Modified Capabilities

- `ods-api`: Extend the `/api/ods/promedios` response shape to include nullable `periodo` per row (aligned with `PROMEDIOS_ODS`).
- `municipio-indicadores-table`: Lista table gains an explicit reference-year column (in addition to existing value + unit formatting).
- `beeswarm-chart-component`: Datapoint model and hover UI carry optional reference period and show it in the tooltip together with unit.

## Impact

- **Repos / apps**: `diputacion_tarragona` — `server/api/ods/promedios.get.ts`, `server/api/indicadores/por-comarca.get.ts`, `MapTarragona.vue`, `MapWrapper.vue`, `BeeswarmChart.vue`, `index.vue`, `pages/ods/[objetivo].vue`, `IndicadoresListView.vue`, comarca mini-map and any parent that builds map/beeswarm data; tests under `test/nuxt` that assert API shapes or snapshots.
- **Data**: No schema change required for `periodo` on `PROMEDIOS_ODS` (column already populated for some row kinds; nullable for others).
- **Contracts**: Clients parsing `promedios` or `por-comarca` arrays gain new fields (**additive**, non-breaking for well-behaved consumers).
