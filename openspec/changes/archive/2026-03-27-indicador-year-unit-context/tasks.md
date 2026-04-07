## 1. API — temporal fields on snapshot endpoints

- [x] 1.1 Extend `GET /api/ods/promedios` to SELECT and return `periodo` (number | null) per row; update route types and any OpenAPI or test fixtures that assert the response shape.
- [x] 1.2 Extend `GET /api/indicadores/por-comarca` to return `periodo` per row from the latest-per-municipio join; null when no indicator row.
- [x] 1.3 Verify `GET /api/indicadores/valores` for all `latest=true` branches includes `periodo` on every returned object; fix any gap and add or extend integration/unit tests under `test/nuxt`.

## 2. Beeswarm

- [x] 2.1 Extend `BeeswarmDatapoint` with optional `periodo`; update `BeeswarmChart` tooltip to show reference year when present (with unit/value as today).
- [x] 2.2 On `index.vue` and `pages/ods/[objetivo].vue`, map API rows into beeswarm datapoints including `periodo` and `unidad` where the API provides them (promedios: `periodo`; indicator latest: `periodo` + metadata `unidad` from catalog or response).

## 3. Province map tooltips

- [x] 3.1 Thread optional `periodoByIne` (or equivalent) and layer `unidad` from home and ODS goal pages through `MapWrapper` into `MapTarragona`; render tooltip value line with unit and year per spec.
- [x] 3.2 Add optional single-year caption near map/legend when all loaded `promedios` rows share the same non-null `periodo` (localized); skip when mixed or null.
- [x] 3.3 Update `IndicadoresComarcaMiniMap` (and its parent) so tooltips receive unit + `periodo` from `por-comarca` / valores responses.

## 4. Lista — reference year column

- [x] 4.1 Add a `UTable` column in `IndicadoresListView.vue` for `periodo` with localized header (`ca.json` / `es.json`).
- [x] 4.2 Confirm empty-state formatting matches existing table conventions.

## 5. Verification

- [x] 5.1 Run `pnpm test` / targeted Nuxt tests for API parity or handlers touched.
- [x] 5.2 Manual smoke: home map + beeswarm, ODS goal indicator layer, municipio Lista, comarca mini-map tooltips.
