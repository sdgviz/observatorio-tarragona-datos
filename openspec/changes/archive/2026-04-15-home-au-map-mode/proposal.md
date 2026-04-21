## Why

The homepage map and beeswarm are built around ODS objectives. When the user switches the header to Agenda Urbana (AU), the same view should speak the AU taxonomy: choropleth and beeswarm must reflect AU strategic objectives, the map must focus on municipalities that participate in the agenda (`id_especial3 = 'aue'`), and navigation must remain consistent with the existing explore control and mode-aware routing.

## What Changes

- Add a read-only API (or extend an existing one) that returns per-municipio AU objective index averages for a selected AU objective (1–10), aligned with `PROMEDIOS_AGENDAS` / `AUE-{n}` dictionary ids, for use on the home map and beeswarm.
- On `index.vue`, when `visualizationStore` is AU mode:
  - Replace the ODS objective strip with an AU objective selector (reuse `OdsSelector`-like UX if low-cost, or a thin `AgendaObjetivosSelector` sharing the same interaction pattern).
  - Drive map values, color scale, legend, homogeneous year caption, and beeswarm from AU promedios for the selected objective.
  - Set map view to a bounding zoom over all AU-participating municipios (union of their geometries), using data from `REGIONES` / municipio list (`id_especial3 === 'aue'`).
  - Apply choropleth color only meaningfully to AU municipios; non-AU municipios stay visually de-emphasized (faded / dimmed) and **do not** drive map tooltip, hover highlight, or selected municipio when pointed or clicked.
  - Restrict the home municipio combobox to `id_especial3 === 'aue'` in AU mode; clear the selection when switching to AU if the current INE is not AUE.
  - Restrict the beeswarm to AUE municipios only in AU mode (dots only for that INE set, subject to non-null promedio as today).
- Extend `MapWrapper` (and/or `MapTarragona` usage) so the homepage can pass a parent-controlled `zoomRegion` (list of INEs) instead of only the internal “Camp de Tarragona” preset when zoom controls are hidden.
- Keep unchanged: unified municipio selection across map, beeswarm, and combobox (scoped to AUE municipios only when in AU mode), explore button targeting `/municipios/au/{ine}` in AU mode, layout structure, and ODS behavior when the store is ODS.

## Capabilities

### New Capabilities

- `au-home-promedios-api`: HTTP contract and DB access for provincial AU objective averages per municipio (same row shape as ODS home promedios where practical: `codigo_ine`, `valor`, `n_indicadores`, `periodo`).
- `home-index-au-map-visualization`: Homepage behavior in AU mode — agenda objective selector, map zoom/emphasis for AU municipios, beeswarm and legend wired to AU data, `MapWrapper` support for external zoom region.

### Modified Capabilities

- `home-municipio-map-beeswarm`: Extend requirements so the unified home map/beeswarm/combobox flow applies in both ODS and AU mode, with data source and selector driven by the active visualization mode.
- `mode-aware-navigation`: Clarify that toggling mode on the home page updates the store and the home visualization (map + charts) without navigation; AU mode home MUST reflect AU data and links (already implied — make explicit in delta if needed).

## Impact

- **App**: `diputacion_tarragona` — `app/pages/index.vue`, `app/components/MapWrapper.vue`, possible new thin selector component, i18n keys for AU selector labels if not reused from existing strings.
- **API**: New `server/api/au/promedios.get.ts` (or equivalent) querying SQLite `PROMEDIOS_AGENDAS` for objective-level `id_dict` values `AUE-1` … `AUE-10`.
- **Data**: Uses existing `REGIONES.id_especial3` and `PROMEDIOS_AGENDAS`; no CSV pipeline change required unless gaps are found in DB.
