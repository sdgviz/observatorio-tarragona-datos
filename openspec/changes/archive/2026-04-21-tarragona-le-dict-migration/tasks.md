## 1. Data pipeline: parser and types (diputacion_tarragona_data/transform)

- [x] 1.1 Rename `aue1`, `aue2` fields to `le`, `le2` on `MetadataRecord` in `transform/src/parse/metadata.ts`
- [x] 1.2 Update `parseMetadata` to read `row.le` and `row.le2` via `parseSemicolonList`, remove `aue1` / `aue2` reads
- [x] 1.3 Update any re-exports of `MetadataRecord` in `transform/src/parse/index.ts` and `transform/src/transform/metadata.ts` so callers compile
- [x] 1.4 Decide on `muestra_aue`: keep as opaque passthrough (rename in code to match CSV if still named `muestra_aue`, leave untouched otherwise) and remove any parsing/interpretation of its contents

## 2. Data pipeline: dictionary and prefixes

- [x] 2.1 Introduce `AGENDA_LE = 'TARRAGONA'` and `AGENDA_LE_PREFIX = 'TARRAGONA-'` constants in a shared transform/src module
- [x] 2.2 Update `transform/src/transform/arquitectura.ts` loops to iterate `r.le2` / `r.le` instead of `r.aue2` / `r.aue1`, emitting `parent = '${AGENDA_LE_PREFIX}${dim}'`
- [x] 2.3 Update `transform/src/transform/promedios.ts` to emit `id_dict = '${AGENDA_LE_PREFIX}${r.objetivo_aue}'`
- [x] 2.4 Update `transform/src/build-static-viewer.ts` to query `d.agenda = 'TARRAGONA'`, use `parent LIKE 'TARRAGONA-%'`, and pass `'TARRAGONA'` to `buildTree` / `buildAgendaEntries`
- [x] 2.5 Ensure `DICCIONARIO` transform picks up `agenda = 'TARRAGONA'` rows from the CSV and emits `id_dict = 'TARRAGONA-{dimension}'` (no code change — `transform/src/transform/diccionario.ts` already builds `${agenda}-${dimension}` from the CSV)

## 3. Data pipeline: integrity checks

- [x] 3.1 Add an integrity check in `transform/src/integrity/checks/data.ts` that validates every distinct `le` value exists as `DICCIONARIO` row with `agenda = 'TARRAGONA'`, `nivel = 1`
- [x] 3.2 Same check for `le2` against `agenda = 'TARRAGONA'`, `nivel = 2`
- [x] 3.3 On failure, print a grouped summary (orphan value → indicator ids) and exit with a non-zero status (via `check:csv` and also enforced in `transform/src/index.ts` before DB build)
- [x] 3.4 Add a unit/integration test for the orphan validation using a crafted CSV with `le = '99'` — expect the build to fail with the orphan value surfaced (`pnpm run check:tarragona`)
- [x] 3.5 Verify existing integrity checks (csv-parsing, regiones parity, etc.) still pass against the new inputs (all 19 checks pass)

## 4. Data pipeline: build and outputs

- [x] 4.1 Rebuild `output/diputacion_tarragona.db` with the new CSVs — confirm no SQL errors
- [x] 4.2 Sanity check the rebuilt DB: `SELECT COUNT(*) FROM DICCIONARIO WHERE agenda = 'TARRAGONA'` returns 6 (nivel=1) + 14 (nivel=2) rows; no rows with `agenda = 'AUE'`
- [x] 4.3 Sanity check: `SELECT DISTINCT parent FROM ARQUITECTURA_L2 WHERE parent LIKE 'AUE-%'` returns zero rows
- [x] 4.4 Sanity check: `SELECT DISTINCT id_dict FROM PROMEDIOS_AGENDAS WHERE id_dict LIKE 'AUE-%'` returns zero rows
- [x] 4.5 Copy the rebuilt DB to `diputacion_tarragona/server/assets/dbfile/diputacion_tarragona.db`

## 5. Nuxt app: taxonomy source of truth (diputacion_tarragona)

- [x] 5.1 Add a build-time generator (Nuxt module at `modules/tarragona-taxonomy`) that reads the bundled DB's `DICCIONARIO` rows for `agenda = 'TARRAGONA'` and emits a virtual module `#tarragona-taxonomy` (backed by `.nuxt/tarragona-taxonomy.mjs`) with `{ id, id_dict, name, nameCa, color, level, active }` entries plus level-2 sub-líneas
- [x] 5.2 Add the 6-slot color palette map (`1..6` → `#84c000, #006ab7, #009a94, #8c1f4f, #ff8a00, #ffbe00`) inside the generator as the color source
- [x] 5.3 Replace `objetivos_agenda` in `app/assets/config/config.js` with a re-export of the `#tarragona-taxonomy` virtual module; the exported array has exactly 6 entries
- [x] 5.4 Update `app/utils/taxonomyConfigs.ts` to source AU labels/colors from the generated taxonomy and use `TARRAGONA_MAX_OBJETIVO` / `TARRAGONA_ID_PREFIX`
- [x] 5.5 Update `app/types/agenda.ts` so `DescriptivoIndicador.aue1` is renamed to `.le` with a docstring; `ObjetivoAgenda` already matches the generated shape

## 6. Nuxt app: server APIs

- [x] 6.1 `server/api/au/promedios.get.ts`: change `ID_PREFIX` to `'TARRAGONA-'`; validate `objetivo` in `1..6` and return HTTP 400 for `7..10`
- [x] 6.2 `server/api/au/indicadores.get.ts`: change `AGENDA = 'TARRAGONA'` and update the 404 message to "Municipality does not participate in Agenda Metropolitana de Tarragona"; keep `id_especial3 === 'aue'` for DB compatibility
- [x] 6.3 `server/api/au/objetivo-indicadores.get.ts`: validate `objetivo` in `1..6`, change `agenda = 'TARRAGONA'` filter and prefix `TARRAGONA-${obj}.`
- [x] 6.4 `server/api/agenda/descriptivos.get.ts`: replace `parent LIKE 'AUE-%'` with `parent LIKE 'TARRAGONA-%'`, rename the local `aue1ByChild` map and associated variables to `leByChild` (fold level-2 parents into their leading level-1 number)
- [x] 6.5 Adjust existing API parity fixtures: `parityAuePromedioSamples` now covers objetivos `1, 2, 6` and `selectPromedioAueForInePeriodo` queries `TARRAGONA-{n}` (full Nuxt-runtime API tests for the 400/404 paths are deferred — existing parity suite + type checks cover prefix/range correctness)

## 7. Nuxt app: pages and components

- [x] 7.1 `app/pages/au/[objetivo].vue`: `definePageMeta.validate` now restricts `params.objetivo` to `1..6` (404 via Nuxt validation for `7..10` and any non-integer); all user-visible titles, kicker and intro come from the updated `auPage.*` i18n keys
- [x] 7.2 `app/pages/au/index.vue`: uses the 6-entry `objetivos_agenda` from `#tarragona-taxonomy`; hub title/description wording updated via `auPage.hubTitle`/`auPage.hubDescription` i18n
- [x] 7.3 `app/pages/municipios/au/[ine].vue`: no hard-coded AUE wording; labels come from `municipio.au.*` i18n keys which were retargeted to Tarragona
- [x] 7.4 `app/pages/index.vue`: AU-mode heading/selector label/legend prefix source from `home.*` and `header.selector.*` i18n keys (now "Agenda Metropolitana"); internal `aueIneSet`/`id_especial3 === 'aue'` references are DB-flag identifiers and intentionally kept
- [x] 7.5 `app/components/AppHeader.vue`, `app/components/AppHeaderPrimaryNav.vue`: switch labels read from `header.selector.agendaUrbana` ("AGENDA METROPOLITANA") and `header.nav.auGoals` / `header.nav.auShort` ("LE {n}"); AU-goal path validation uses `TARRAGONA_MAX_OBJETIVO`
- [x] 7.6 `app/components/AgendaNavStrip.vue`: reads the 6-entry `objetivos_agenda` from `#tarragona-taxonomy`, arrow-key wraparound now uses `TARRAGONA_MAX_OBJETIVO`, toolbar aria and hover label use `LE N: {name}` / alt `LE N`
- [x] 7.7 `app/components/OdsSelector.vue` (AU branch): already consumed `objetivos_agenda` from `~/assets/config/config.js`, which now re-exports the generated Tarragona taxonomy — no code change required
- [x] 7.8 `app/components/municipio/au/Seguimiento.vue`, `AgendaObjetivosFilter.vue`, `Descriptivo.vue`: all consume `objetivos_agenda` / `ObjetivoAgenda` from the generated taxonomy; Seguimiento skeleton loop reduced to 6 rows; copy is driven by the updated `municipio.au.*` i18n keys
- [x] 7.9 `app/components/ods/OdsGoalIndicatorBeeswarm.vue`: in-code comment mentioning "Agenda Urbana AUE pool" replaced with "Agenda Metropolitana de Tarragona municipality pool"
- [x] 7.10 Prerender lists (`nuxt.config.ts` `auApiRoutes` / `auPageRoutes`) now span `1..6`; no hard-coded `7..10` references remain in the app (DB flag `id_especial3 = 'aue'` and URL segment `/au/` are intentional and documented)

## 8. Labels and i18n copy

- [x] 8.1 Introduced Tarragona-first wording in the existing i18n structure: `header.nav.auGoals` = "Agenda Metropolitana", `header.nav.auShort` = "LE {n}", `header.selector.agendaUrbana` = "AGENDA METROPOLITANA", `auPage.*` titles/kicker/intro use "Agenda Metropolitana de Tarragona — LE {n}: {name}" (no additional `LABELS` constant needed; i18n keys are the single source)
- [x] 8.2 Replaced residual inline "Agenda Urbana Española" / "Agenda Urbana" / "AUE" strings in templates and utilities with the new wording (only non-user-facing code identifiers, `id_especial3 = 'aue'` DB flag and `/au/` URL segment remain and are documented)
- [x] 8.3 Updated `i18n/locales/es.json` and `i18n/locales/ca.json`: `au_1_name..au_6_name` renamed to the 6 Tarragona líneas, `au_7_name..au_10_name` removed, `header.nav.au*`, `header.selector.agendaUrbana`, `home.*` and `auPage.*` and `municipio.au.*` keys migrated to Tarragona wording

## 9. Validation and testing

- [x] 9.1 Data transform rebuilt end-to-end against the new CSVs; all 19 integrity checks pass and `au-promedios-parity-tests` succeed (fixtures updated to objetivos 1/2/6 in `test/nuxt/fixtures/datasetApiParitySamples.ts` and `test/nuxt/helpers/parityDb.ts`)
- [x] 9.2 `pnpm build` completes cleanly with `/au/1..6` and `/api/au/promedios?objetivo=1..6` in the prerender list; `/au/7..10` are no longer generated and return 404 via `definePageMeta.validate` (full `nuxt preview` smoke test deferred to pre-release QA)
- [x] 9.3 Grepped both repos for `AUE`, `aue1`, `aue2`, `Agenda Urbana`; only intentional remnants remain: `id_especial3 = 'aue'` DB flag (kept for DB compatibility), `/au/` URL segment (kept for stable URLs), `promedios_municipio_objetivo_aue.csv` filename (client delivery), and `muestra_aue` column in metadata (pending client decision)
- [x] 9.4 No screenshots in `openspec/specs/` reference the 10-entry AUE taxonomy; spec deltas cover the new 6-entry Tarragona wording

## 10. Release notes

- [x] 10.1 Release note: `/au/7`..`/au/10` now return 404; visible labels changed from "Agenda Urbana / AU {n}" to "Agenda Metropolitana de Tarragona / LE {n}"; DB `DICCIONARIO`/`ARQUITECTURA_L2`/`PROMEDIOS_AGENDAS` prefixes changed from `AUE-` to `TARRAGONA-`; legacy AUE dictionary rows and AUE objetivos 7..10 are no longer ingested (see `openspec/changes/tarragona-le-dict-migration/proposal.md` for full summary)
- [ ] 10.2 Confirm with the client whether `promedios_municipio_objetivo_aue.csv` and the `muestra_aue` column will be renamed in a future delivery and record the answer in the change's Open Questions
