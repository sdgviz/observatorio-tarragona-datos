## Context

The homepage (`index.vue`) loads ODS promedios from `GET /api/ods/promedios`, builds a choropleth via `MapWrapper` → `MapTarragona`, and shows a beeswarm with the same values. The header toggle sets `useVisualizationStore()` to ODS or AU; municipio routes already mount the correct mode. `MapWrapper` today computes `zoomRegion` only from an internal two-state toggle (full province vs hardcoded Camp de Tarragona INEs) and already supports `emphasizedInes` + `fadeUnselected` for dimming. `MapTarragona` computes fit bounds from any non-empty `zoomRegion` INE list. AU objective labels and colors live in `objetivos_agenda` in `config.js`. Objective-level agenda averages are stored per municipio in `PROMEDIOS_AGENDAS` with `id_dict` values `AUE-1` … `AUE-10` (see `server/api/au/indicadores.get.ts`). `GET /api/municipios/list` already returns `id_especial3` from `REGIONES`.

## Goals / Non-Goals

**Goals:**

- In AU mode on the home page, the map zooms to the bounding box of all municipios with `id_especial3 = 'aue'`, tints only those municipios with choropleth values for the selected AU objective, and fades the rest of the province.
- Replace the ODS strip with an AU objective selector (same interaction model as `OdsSelector` if feasible).
- Feed beeswarm, legend, and homogeneous year from AU promedios for the selected objective, preserving selection sync (map ↔ beeswarm ↔ combobox) and the explore CTA with AU URLs.
- Allow the parent to set map `zoomRegion` explicitly (AU INE list) without enabling the Camp de Tarragona zoom buttons on the home page.

**Non-Goals:**

- Changing AU municipio detail pages (`/municipios/au/[ine]`) beyond what already exists.
- New dataset ETL; assume DB already populated for `PROMEDIOS_AGENDAS`.
- Redesigning the home hero or non-map sections.

## Decisions

1. **New API `GET /api/au/promedios`**  
   - **Query**: `objetivo` integer 1–10 (aligned with `objetivos_agenda.id` and `MAX_OBJETIVO` in AU indicadores handler).  
   - **SQL**: Select from `PROMEDIOS_AGENDAS` where `id_dict = ?` with `? = 'AUE-' || objetivo` (same convention as existing AU code).  
   - **Response shape**: Mirror `GET /api/ods/promedios` (`codigo_ine`, `valor`, `n_indicadores`, `periodo`) so `index.vue` can reuse mapping logic with minimal branching.  
   - **Rationale**: Keeps one composable pattern on the client; avoids overloading ODS route with mode flags.

2. **AU INE list**  
   - Derived client-side from existing `useFetch('/api/municipios/list')` by filtering `id_especial3 === 'aue'`, or server-side constant in API — **prefer client-side filter** to avoid a second endpoint and stay consistent with list data.

3. **`MapWrapper` API**  
   - Add optional prop `zoomRegionInes: string[] | null`. When non-null, pass through to `MapTarragona` as `zoomRegion` and **disable** internal Camp/full toggle logic for that render (or ignore internal `zoomed` when override is set). When null, preserve current behavior for other pages.  
   - For AU home: pass filtered AUE INEs; set `emphasizedInes` to the same set and `fadeUnselected` true so non-AUE matches the “faded” requirement while reusing `MapTarragona` opacity rules.

3b. **Hover and tooltip gating in `MapTarragona`**  
   - Add an optional prop (e.g. `interactionInes: string[] | null`) forwarded from `MapWrapper` / home page. When non-null, `mouseenter` / tooltip / `emit('update:highlightedIne')` SHALL run only for paths whose INE is in that set; non-member paths use a non-pointer cursor and skip tooltip and highlight emission. Clicks on non-members are already ignored by the parent in AU mode but MAY also be no-oped in the map for consistency.  
   - Default `null` preserves current behavior everywhere else.

4. **Selector UI**  
   - **Preferred**: Parameterize existing `OdsSelector` with props (`items`, `modelValue` as objective id, labels) or rename internally while keeping one strip component; **fallback**: new `AuObjetivosSelector` duplicating layout but importing `objetivos_agenda`. Choose the option with fewer lines and no duplicate styling.

5. **Color scale**  
   - Reuse `buildOdsValueColorScale` with AU objective color from `objetivos_agenda` for the selected id (same approach as ODS `ods_list`).

6. **`index.vue` data wiring**  
   - Use `visualizationStore.isAU` / `isODS` to choose: (a) which `useFetch` endpoint and query key, (b) which objective ref (can reuse `selectedObjective` 1–10 for AU as long as AU uses same numeric range), (c) `zoomRegionInes` and map props, (d) explore path already uses store — verify explore spec scenario for AU.

## Risks / Trade-offs

- **Single `selectedObjective` ref** for both modes → switching mode might leave objective index > 10 if ODS ever diverges; today both use 1–10 for AU and 1–17 for ODS. → **Mitigation**: clamp or use separate refs if ODS range interaction risks invalid AU objective.  
- **Performance**: second fetch when toggling mode; acceptable with `useFetch` + watch.  
- **MapWrapper complexity**: override prop must not break ODS goal pages — default null override preserves behavior.

## Migration Plan

1. Ship API + types.  
2. Extend `MapWrapper` with backward-compatible default.  
3. Update `index.vue` conditional data and selector.  
4. Verify header toggle on `/` updates map without navigation (`mode-aware-navigation`).  
5. No DB migration if `PROMEDIOS_AGENDAS` already filled.

## Resolved product decisions (AUE mode)

1. **Municipio combobox**: Only municipios with `id_especial3 === 'aue'`.  
2. **Map clicks**: Clicks on non-AUE municipios do **not** update selection (unified selection applies only among AUE municipios).  
3. **Map hover**: Non-AUE municipios do **not** show the map tooltip or hover-driven map highlight.  
4. **Beeswarm**: Plot **only** AUE municipios (intersection of AUE INE set with datapoints that have a value for the layer).  
5. **Mode switch**: When entering AU mode, if the current selected INE is not AUE, clear selection so the combobox never holds an invalid value.
