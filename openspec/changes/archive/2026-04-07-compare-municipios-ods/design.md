## Context

The municipio ODS indicators experience is implemented in the Nuxt app (`diputacion_tarragona`): list mode (`IndicadoresListView.vue`), dashboard mode (`IndicadoresDashboardView.vue`), and evolution cards that read time series from a shared `seriesCache` keyed by **indicator id** (single municipio context today). There is already a Pinia store for **which indicators are picked** (`municipioOdsIndicadoresPicker`), but nothing for **which other municipios to compare**.

Municipio catalog data is already available server-side: `GET /api/municipios/list` returns `REGIONES` rows (`codigo_ine`, `nombre`, …). Indicator payloads for a municipio are served by existing ODS routes (e.g. `GET /api/ods/indicadores` with `codigo_ine`), and series loading uses `loadingIds` / `seriesCache` with keys **`${codigo_ine}:${id_indicador}`** for every municipio (primary + comparisons).

## Goals / Non-Goals

**Goals:**

- Let the user select **0–2** comparison municipios (in addition to the **primary** municipio from the route) via `USelectMenu` with `multiple`, search, and a hard cap at two selections.
- Centralize that selection in a **new Pinia store** so list and dashboard (and future UI) stay in sync.
- In the **list table**, keep the **primary** municipio presentation as in single-municipio mode (indicator title + meta; values in metric columns). For each **comparison** municipio, add **named sub-rows** below: municipio names only in the **Indicador** column; **valor, año, índice, tendencia** show values only, with **shared row heights and `border-t` dividers** aligned across columns (`align-top` on cells). The **ODS** column uses the same vertical rhythm (icon in a fixed-height primary zone + empty comparison rows) so rules line up.
- In **evolution charts**, plot primary as today plus up to two extra series: **comparison 1** = thick **dotted** line (distinct color); **comparison 2** = thick **dashed** line (distinct color), with legend entries that name the municipio.

**Non-Goals:**

- Persisting comparison choices across browser sessions (localStorage) unless explicitly requested later.
- Comparing more than two extra municipios or comparing comarcas/provincias.
- Changing backend aggregation semantics of indicators (only consume existing APIs, possibly with additional `ine` parameters per request).

## Decisions

1. **Municipio catalog**  
   **Decision:** Use existing `GET /api/municipios/list` for `USelectMenu` items (`value-key="codigo_ine"`, `label` from `nombre`), with optional `virtualize` if the list is large.  
   **Rationale:** Avoid duplicate endpoints and keep a single source of truth from `REGIONES`.  
   **Alternative considered:** New slim endpoint with only `ine`+`nombre` — rejected unless profiling shows payload or `SELECT *` cost is problematic.

2. **Pinia store shape**  
   **Decision:** Store `useMunicipioOdsComparisonStore` with `comparisonInes: string[]` (max length 2), `setComparison(primaryIne, ines)`, and `syncPrimaryIne(primaryIne)` so the route municipio is never stored as a comparison target and is dropped when navigating.  
   **Rationale:** Mirrors existing picker pattern; explicit `primaryIne` avoids stale selections.  
   **Alternative considered:** Extend the picker store — rejected to avoid unrelated concerns in one module.

3. **Data fetching for compared municipios**  
   **Decision:** Parent page/composable that already loads primary `sections` and `seriesCache` extends logic to fetch **the same indicator set** for each comparison INE when the store changes (or on demand per row for list-only optimization — see trade-offs). Use the same API contracts as the primary load (`/api/ods/indicadores` + series endpoint already used for trends/evolution).  
   **Rationale:** Reuses validation and shapes already typed as `OdsIndicador` / `IndicadorSeriePoint[]`.  
   **Alternative considered:** One batch API for N INEs — deferred unless N+1 requests become measurable.

4. **List view data model**  
   **Decision:** Pass `comparisonCols: { ine, nombre, indicadorById }[]` plus `primaryIne` / `primaryNombre`; series map uses `indicadorSerieCacheKey(ine, id)`. **Layout:** primary block uses a shared **`min-h` primary zone** across ODS, Indicador, and metric columns; each comparison uses identical **`ROW_COMP`** (`min-h-9`, `border-t`, `pt-2`) so dividers align. **No duplicate label** for the primary municipio in the Indicador column—only comparison names appear under the meta line.  
   **Rationale:** Keeps `IndicadoresListView` presentational; avoids repeating the current municipio name; alignment is predictable without fragile spacers per column.

5. **Chart styling**  
   **Decision:** Extend `MunicipioOdsIndicadorEvolutionCard` (or inner D3 layer) to accept optional `comparisonSeries: { ine: string; nombre: string; points: IndicadorSeriePoint[] }[]` (length 0–2). Stroke: primary = existing style; first comparison = `stroke-dasharray` none + **dot** pattern (or `stroke-dasharray` short-dot as “dotted”) with **thicker** `stroke-width`; second = **long dash** pattern, thick, second color. Legend must list all series with municipio names.  
   **Rationale:** Meets client “dotted / dashed thick” requirement; D3 supports `stroke-dasharray` and multi-line.  
   **Alternative considered:** Only color differentiation — rejected (accessibility + explicit client ask).

## Risks / Trade-offs

- **[Risk] Request multiplication** — Loading full indicator + series for 3 municipios triples work.  
  **Mitigation:** Batch where the API allows; debounce store updates; share indicator catalog; lazy-load series for off-screen rows only if needed.

- **[Risk] Table width** — Many columns (4 metrics × 3 municipios) hurts small screens.  
  **Mitigation:** Horizontal scroll on table container; stack sub-cells per municipio under merged headers; hide comparison columns when none selected.

- **[Risk] Chart readability** — Three lines plus thresholds clutter small cards.  
  **Mitigation:** Slightly taller card when comparing; thinner primary line vs thick comparison; toggle in legend (future).

- **[Trade-off] List fetch strategy** — Eager fetch all compared data vs per-row.  
  **Mitigation:** Start with parent-level fetch aligned with dashboard; optimize later if list-only path needs finer granularity.

## Migration Plan

1. Ship store + UI selector behind no feature flag (simple additive UI).  
2. Default comparison list empty — existing single-municipio behavior unchanged.  
3. No database migrations (read-only SQLite).  
4. **Rollback:** Revert store + props wiring; components fall back to single municipio.

## Open Questions

- Exact **hex / theme tokens** for comparison line colors (should align with ODS card chrome, not clash with threshold bands).
- Whether `USelectMenu` should **exclude** the current municipio from items or only enforce on select (UX preference).
