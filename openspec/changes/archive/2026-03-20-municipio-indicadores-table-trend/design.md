## Context

- **Current**: `IndicadoresListView` renders a simple clickable row with ODS badge, name, and formatted `valor` from `OdsHierarchyResponse`. `IndicadoresDashboardView` watches visible indicator IDs and fetches `/api/indicadores/valores?indicator_id=&ine=` (full time series) with a concurrency limit of 5, caching results in a local `Map`. Lista mode does not use that series.
- **Page**: `pages/municipios/ods/[ine].vue` already fetches ODS hierarchy once and passes it to `MunicipioOdsIndicadoresView` (`IndicadoresView.vue`). The Indicadores tab is the natural place to hoist series fetching so Lista and Dashboard share one cache.
- **Types**: `OdsIndicador` includes `valor`, `indice` (normalized), `periodo`, and `metadata.umbral_optimo` / `umbral_malo` for context.

## Goals / Non-Goals

**Goals:**

- Present Lista as a **table** with columns: indicator identity (ODS + name), **raw value** (latest or hierarchy-aligned, with unit), **normalized** (`indice` when present), **trend** (first vs last year in the municipio time series).
- **Single fetch pipeline** for time series for all filtered indicators when the user is on the Indicadores tab, reused by Dashboard cards (no second fetch when switching Lista ↔ Dashboard).
- Trend arrows: **green up** = improved, **red down** = worsened, using explicit direction rules from metadata when possible.

**Non-Goals:**

- Changing `/api/indicadores/valores` contract or SQL (unless discovery shows `indice` is only available from hierarchy — then normalized column stays hierarchy-based only).
- **Territory scope beyond one municipio**: no provincia-, comarca-, or multi-municipio tables in this change; data stays keyed by the current `codigo_ine`.
- Backend pagination or batch endpoint for valores (optional future optimization).

## Decisions

1. **Where to hoist fetching**  
   - **Choice**: Implement fetch + cache in `IndicadoresView.vue` (parent of Lista + Dashboard) via a small composable (e.g. `useIndicadorSeriesForIne`) colocated under `composables/`.  
   - **Rationale**: Keeps `[ine].vue` thin; all indicadores UI state (filter, sort, view mode) already lives in `IndicadoresView`. Alternative was page-level fetch — acceptable but couples routing to data orchestration; composable from `IndicadoresView` is enough to satisfy “parent page” intent without duplicating if `IndicadoresView` is ever reused.

2. **When to start fetches**  
   - **Choice**: Start (or refresh) the series batch when the **Indicadores** tab is active **and** `sortedItems` / indicator ID set changes — mirror current dashboard `watch(indicatorIds, { immediate: true })` but owned by parent.  
   - **Rationale**: Avoids fetching valores when the user never opens the Indicadores tab (if implementation stays in `IndicadoresView`, mount only happens when tab is indicadores — verify `v-if` on page: yes, `MunicipioOdsIndicadoresView` is `v-if="activeTab === 'indicadores'"`, so lazy mount already limits work). If product wants data prefetched before tab switch, that would be a follow-up.

3. **Normalized column source**  
   - **Choice**: Display `indicador.indice` from the ODS hierarchy row (same as current API shape). Tooltip or subtitle MAY mention period if it differs from latest series year.  
   - **Rationale**: Stable, already loaded; matches “normalized value” in the product sense. If valores rows include `indice` per period, optional enhancement to align normalized to latest period — non-goal unless trivial.

4. **Trend: first vs latest year**  
   - **Choice**: Sort series by `periodo` ascending; **first** = earliest non-null `valor`, **latest** = last non-null `valor`. Compare numeric `valor` only.  
   - **Direction (better / worse)**  
     - If `umbral_optimo` and `umbral_malo` are both set and `umbral_optimo !== umbral_malo`: movement toward `umbral_optimo` is “better”. Concretely: if `umbral_optimo > umbral_malo`, higher `valor` is better; if `umbral_optimo < umbral_malo`, lower `valor` is better.  
     - If thresholds missing or ambiguous: show **neutral** (e.g. gray dash or horizontal icon) or hide directional arrow; do not guess green/red.  
   - **Single datapoint**: no trend column (em dash or “—”).  
   - **Rationale**: Aligns with displayed thresholds in `IndicadoresPanel`; avoids wrong semantics for inverse indicators.

5. **Table component**  
   - **Choice**: Nuxt UI `UTable` with columns definition and slot cells for ODS badge + trend icons (`UIcon` lucide `arrow-up`, `arrow-down`, neutral).  
   - **Rationale**: Matches project rules; responsive patterns from existing usage.

## Risks / Trade-offs

- **Many indicators × valores requests** → Still N requests; mitigated by existing concurrency cap and tab-level mount. Batch API would be future work.  
- **Threshold metadata incomplete** → Many rows may show neutral trend; document in UI copy if needed.  
- **First vs latest sensitive to outliers** → Product choice; alternative (e.g. rolling avg) is out of scope.

## Migration Plan

- Ship frontend-only: no DB migration. Deploy app; verify Indicadores tab network panel shows valores fetches once per indicator when opening tab, not duplicated on Dashboard toggle.

## Open Questions

- Whether to show trend based on **`indice`** instead of **`valor`** when both exist (current decision: **valor** for trend to match raw physical meaning; normalized column separate).
