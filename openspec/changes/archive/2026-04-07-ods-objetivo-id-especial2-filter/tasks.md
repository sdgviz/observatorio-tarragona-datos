## 1. Types and API contract

- [x] 1.1 Add optional `id_especial2` to `Municipio` in `app/types/municipios.ts` (string | null, aligned with other region codes).

## 2. ODS goal page filters

- [x] 2.1 In `app/pages/ods/[objetivo].vue`, add `filterIdEspecial2` ref (default `REGION_FILTER_ALL`), reset it in `watch(objetivoParam)` and `resetFilters`.
- [x] 2.2 Build `idEspecial2Options` / `idEspecial2SelectItems` from distinct non-empty `m.id_especial2` on the municipios list (same sort/localeCompare pattern as `id_especial`).
- [x] 2.3 Extend `municipioPoolFiltered`, `hasActiveRegionFilter`, `filterEmphasisInes`, and the watcher that clears `selectedIneRaw` when the filtered pool no longer contains the selection to include `id_especial2` with AND semantics.
- [x] 2.4 Add `UFormField` + `USelect` for `id_especial2` in the filter row; adjust responsive grid (e.g. `md:grid-cols-5`) so layout remains usable.
- [x] 2.5 Show the reset button when `filterIdEspecial2` is active (via updated `hasActiveRegionFilter`).

## 3. i18n

- [x] 3.1 Add `odsPage.filterIdEspecial2` (and any placeholder if needed) to `i18n/locales/ca.json` and `i18n/locales/es.json`.

## 4. Verification

- [x] 4.1 Manually verify on `/ods/1`: changing `id_especial2` alone and in combination with `id_especial` / `id_poblacion` updates map emphasis, beeswarm emphasis, and municipio combobox options.
- [x] 4.2 Run relevant tests (e.g. dataset API parity or municipios list tests) and fix expectations if they assert the exact JSON shape of list items.
