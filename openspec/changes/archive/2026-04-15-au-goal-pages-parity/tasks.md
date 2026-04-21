## 1. API — AU objective indicator catalog

- [x] 1.1 Add `server/api/au/objetivo-indicadores.get.ts` mirroring `ods/objetivo-indicadores.get.ts`: query `objetivo` (1–10), `lang` (es|ca); resolve AUE dictionary meta rows and `ARQUITECTURA_L2` children; return `{ objetivo, indicadores: [{ id_indicador, nombre, unidad }] }` in stable order.
- [x] 1.2 Validate error messages and types; smoke-test against SQLite for each objective 1–10.

## 2. Pages — AU goal hub and detail

- [x] 2.1 Add `app/pages/au/index.vue` hub consistent with `/ods` (list, cards, or redirect — match existing ODS hub pattern).
- [x] 2.2 Add `app/pages/au/[objetivo].vue` with `validate` for 1–10; on mount call `visualizationStore.setMode(VisualizationMode.AU)`.
- [x] 2.3 Implement data fetching: `useFetch` to `/api/au/promedios`, `/api/au/objetivo-indicadores`, `/api/municipios/list`; compute `aueIneList` / `aueIneSet` from `id_especial3 === 'aue'`; filter all displayed series and selection to AUE.
- [x] 2.4 Port map + layer selector + beeswarm layout from `pages/ods/[objetivo].vue`: aggregate uses AU promedios; per-indicator uses `$fetch('/api/indicadores/valores', { indicator_id, latest: 'true' })` then filter rows to AUE INEs; objective color from `objetivos_agenda`.
- [x] 2.5 Pass map props for AU-focused viewport (reuse home AU pattern: `zoom-region-ines`, `emphasized-ines`, `interaction-ines` or equivalent supported by `MapTarragona` / `MapWrapper`).
- [x] 2.6 Wire `exploreMunicipioPath` to `/municipios/au/{ine}` when mode is AU; disable or clear selection when selected INE is not AUE.
- [x] 2.7 Add `useHead` / i18n keys for AU page titles (`auPage.metaTitle` pattern parallel to `odsPage.metaTitle`).

## 3. ODS goal page — mode sync

- [x] 3.1 On `app/pages/ods/[objetivo].vue` mount, call `visualizationStore.setMode(VisualizationMode.ODS)` so direct links align with the toggle (`mode-aware-navigation` delta).

## 4. Header — AU goals menu and route switching

- [x] 4.1 Update `AppHeader.vue`: when `visualizationStore.isAU`, render `UDropdownMenu` for `objetivos_agenda` (10 rows, slot styling like ODS); links via `localePath('/au/{id}')`; trigger label/color from active `/au/{n}` route (regex with optional locale prefix, parallel to `activeOdsFromPath`).
- [x] 4.2 When `isODS`, keep existing ODS dropdown behaviour unchanged.
- [x] 4.3 Extend ODS/AU toggle handler: if path matches goal page `/ods/{n}` or `/au/{n}`, navigate to the other mode’s route when `n` is 1–10; if on `/ods/{n}` with `n > 10` and switching to AU, navigate to `/au` hub.
- [x] 4.4 Add i18n strings for AU menu aria label, hub label, and `au_{n}_name` (or equivalent) in `ca.json` and `es.json`.

## 5. Build / prerender

- [x] 5.1 Register `/au`, `/au/1` … `/au/10` in Nuxt prerender / route rules the same way as ODS goal routes.

## 6. Verification

- [x] 6.1 Manually verify: AU menu opens, each link loads, map shows AUE-only focus, beeswarms exclude non-AUE, toggle swaps `/ods/3` ↔ `/au/3`, ODS 15 + switch to AU lands on `/au`.
- [x] 6.2 Run project lint/typecheck on touched files.
