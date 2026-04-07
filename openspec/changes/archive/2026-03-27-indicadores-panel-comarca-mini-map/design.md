## Context

- `MapTarragona.vue` renders the full province with D3 (`geoMercator`, `geoPath`), dynamic viewBox with **animated** zoom toward selection, `useWindowSize`-derived SVG dimensions, and multiple emphasis modes (`zoomRegion`, `fadeUnselected`, etc.). It is tuned for large layouts, not a narrow slide-over.
- `IndicadoresPanel.vue` already loads per-municipio time series for the selected indicator; the parent municipio ODS page already loads `GET /api/municipios/:ine/header` with `id_especial` (comarca code stored in `REGIONES`).
- Home and ODS goal pages build a **choropleth scale** from `d3.hsl(odsColor)`, pale min and slightly darker max, `interpolateHsl`, and a five-point `scaleLinear` domain from data min/max (`app/pages/index.vue`, `app/pages/ods/[objetivo].vue`, `OdsGoalIndicatorBeeswarm.vue`).

## Goals / Non-Goals

**Goals:**

- New **compact SVG map component** that loads the same static GeoJSON as `MapTarragona` (`/Municipios_Tarragona_small2.geojson`), fits the **entire province** in a fixed modest viewBox (e.g. width driven by panel layout, height aspect ratio from projection fit).
- Choropleth **value** = latest (or same period semantics as lista/dashboard) **raw `valor`** for the **panel’s active `id_indicador`**, per `codigo_ine`.
- **Only municipalities where `REGIONES.id_especial` equals the current municipio’s `id_especial`** receive the scale-based fill; all other features use a fixed neutral fill (e.g. white or very light gray) and baseline stroke so the province silhouette stays readable.
- **Colour scale**: reuse the **same algorithm** as the main map (ODS hue from `item.objetivoNum` / `ods_list`, min/max computed from **comarca subset values only** so the legend reflects local spread).
- **Interactivity**: pointer hover shows municipality name and formatted value; optional `click` emit with `codigo_ine` for future navigation (no requirement to navigate in v1). **No** `easeCubicInOut` viewBox animation, no auto-zoom to selected municipio.
- **SSR-safe**: wrap client-only rendering with `<ClientOnly>` and a skeleton, consistent with other D3 usage.

**Non-Goals:**

- Replacing or refactoring `MapTarragona.vue` for main pages.
- Showing beeswarm, legends, or full map chrome from `MapWrapper`.
- Animations, region zoom, or multi-INE emphasis modes from the large map.

## Decisions

1. **New component vs. props on `MapTarragona`**  
   **Decision**: New component (e.g. `IndicadoresComarcaMiniMap.vue`) with a minimal prop surface: `values: Record<string, number>`, `comarcaIneSet: Set<string> | string[]`, `colorScale: (v: number) => string`, `selectedIne?: string | null`, fixed dimensions.  
   **Rationale**: Avoids feature flags and dead code paths in `MapTarragona`; keeps bundle and behaviour easy to reason about for the panel.

2. **Data loading**  
   **Decision**: Add `GET /api/indicadores/por-comarca` (name illustrative) with query `indicator_id` + `id_especial`, returning rows `{ codigo_ine, valor }` for municipalities in that comarca with non-null latest value, using the same “latest period per municipio” rules as existing indicator list/value endpoints.  
   **Rationale**: One round-trip; avoids N calls to `/api/indicadores/valores`; keeps SQL in one place.  
   **Alternative considered**: Filter `GET /api/municipios/list` client-side then N parallel fetches — rejected for latency and server load.

3. **`id_especial` plumbing**  
   **Decision**: Pass `id_especial` from `app/pages/municipios/ods/[ine].vue` into `MunicipioOdsIndicadoresView` → `IndicadoresView` → `IndicadoresPanel` as an optional prop; same for `IndicadoresChart` if it hosts the panel. When null/empty, hide the mini map block (or show empty state).  
   **Rationale**: Header is already fetched on the page; avoids duplicate `header` requests from the panel.

4. **Scale domain**  
   **Decision**: `min`/`max` from **values present in the comarca response only** (not all province).  
   **Rationale**: Matches user expectation of “how does my comarca spread on this indicator”; consistent with local choropleth practice.

5. **Extract shared scale helper (optional)**  
   **Decision**: Prefer a small shared function (e.g. `useOdsChoroplethScale` or `buildOdsValueColorScale` in `composables/` or `utils/`) used by index/ODS pages and the panel **if** duplication exceeds ~15 lines; otherwise duplicate once in the panel with a comment pointing to the canonical pages.  
   **Rationale**: Keeps “same strategy” without a large refactor unless the apply phase prefers deduplication.

## Risks / Trade-offs

- **[Risk] Empty comarca or single municipality** → **Mitigation**: Same `range === 0` branch as home map (two-endpoint linear scale); neutral fills for missing values.
- **[Risk] `id_especial` display string mismatch** → **Mitigation**: Use the same `REGIONES.id_especial` value from header API as filter in SQL (`=`).
- **[Risk] GeoJSON property `CODEINE` vs DB `codigo_ine`** → **Mitigation**: Reuse the same keying as `MapTarragona` (`f.properties.CODEINE`).

## Migration Plan

- Deploy API + UI together; no data migration. Rollback: remove panel section and route file if needed.

## Open Questions

- Exact API path naming under `server/api/indicadores/` (align with existing Nitro tree).
- Whether v1 should `navigateTo` on municipality click or only emit for a later task.
