## 1. Data and types

- [x] 1.1 Confirm distinct values and display labels for `id_especial` and `id_poblacion` from `REGIONES` / sample API response; document in code comments if labels are raw codes.
- [x] 1.2 Decide client-only filtering vs extend `GET /api/municipios/list` with optional `id_especial` (+ AND with `NMUN`); implement chosen approach.

## 2. BeeswarmChart

- [x] 2.1 Add optional `filterEmphasisInes` (or agreed name) and implement multi-dot strong emphasis + subdued others when non-empty.
- [x] 2.2 Define precedence between `filterEmphasisInes`, `highlights`, and `highlightedIne`; update dot styling helpers and template bindings.
- [x] 2.3 Verify `index.vue` and other callers unchanged when prop omitted.

## 3. Map stack

- [x] 3.1 Add optional multi-INE emphasis prop to `MapTarragona` and forward through `MapWrapper`.
- [x] 3.2 Add `disableSelectionZoom` (or agreed name) to skip single-municipio zoom when true; default false.
- [x] 3.3 Ensure Camp de Tarragona / `zoomRegion` behaviour unaffected when disable flag is false.

## 4. ODS goal page UI

- [x] 4.1 Build filter row: selectors for `id_especial`, `id_poblacion`, municipio (search + clear); derive `filterIneSet` with AND logic.
- [x] 4.2 Wire `filterIneSet` to all `BeeswarmChart` instances and map; set `disableSelectionZoom` when filter set is non-empty (per design).
- [x] 4.3 Add i18n strings (ca/es) for filter labels and placeholders.

## 5. Verification

- [x] 5.1 Manual test: only `id_poblacion`, only `id_especial`, both, plus municipio; empty state when intersection is zero.
- [x] 5.2 Confirm map does not zoom to one municipio when filters active; clears when filters cleared.
- [x] 5.3 Regression: homepage map + beeswarm; municipio ODS page if it shares components.

## 6. Post-implementation refinements (archived with change)

- [x] 6.1 Map: `fadeUnselected` to dim municipalities outside `emphasizedInes` when filters active.
- [x] 6.2 Beeswarm: filter emphasis without inflating dot radius (data-driven radius; hover may still enlarge).
- [x] 6.3 ODS page: `USelect` for layer + region filters; sentinel `__all__` for “no filter” (Nuxt UI constraint).
