## Context

- Municipal ODS indicator evolution uses `EvolutionChart.vue` (D3 scales) inside `IndicadorEvolutionCard.vue`, rendered from `IndicadoresDashboardView.vue` with series data from `useIndicadorValoresSeries` and hierarchy from `/api/ods/indicadores`.
- Today the Y domain is effectively anchored at **zero** with a small headroom (`max * 1.05` in `valueDomain`), which flattens visible variation for many indicators.
- `OdsIndicador.metadata` already types `umbral_optimo` and `umbral_malo` (`app/types/ods.ts`), and the main indicadores API maps them from SQLite; they are not passed into `EvolutionChart` today.

## Goals / Non-Goals

**Goals:**

- Let users switch between **full-scale** (include zero / policy-relevant baseline behavior) and **focused-scale** (emphasize evolution around observed values with configurable padding).
- Surface **optimal / bad thresholds** on the evolution chart as horizontal **dashed** reference lines when values are non-null.
- Keep a single **tunable padding ratio** (default 10%) in one place (module-level const or shared chart util).
- Wire props through **dashboard → card → chart**; ensure JSON used by the page always carries threshold fields when the DB has them.

**Non-Goals:**

- Changing how thresholds are *interpreted* (higher-is-better vs lower-is-better) or trend semantics in `indicadorTrend.ts`.
- New backend business rules for computing thresholds (only expose existing DB/metadata values).
- Legend or detailed threshold tooltips unless trivial to add with existing patterns (can be a follow-up).

## Decisions

1. **Toggle scope**  
   One control in **`IndicadoresView`**: placed below the Lista / Dashboard `UTabs`, **visible only when the Dashboard tab is selected**. Parent holds `chartFullScale` state and passes `fullScale` into `IndicadoresDashboardView`, which forwards it to each `IndicadorEvolutionCard`. Rationale: single place for chrome; list mode stays uncluttered.

2. **`fullScale` semantics**  
   - `fullScale === true` (default): preserve current **zero-based** behavior: domain `[0, maxData * (1 + smallHeadroom)]` (align headroom with existing `1.05` or document if unified).  
   - `fullScale === false`: domain from **min and max of series values** (ignore nulls/gaps), expanded by padding ratio **P** on each side:  
     `span = max - min`; if `span === 0`, use `fallbackSpan = max(abs(value), ε) * P` or similar so the chart is not degenerate.  
   Rationale: matches user request for “around the data ±10%”.

3. **Threshold lines vs focused mode**  
   When `fullScale === true` and `umbral_optimo` / `umbral_malo` are set, extend the Y domain so **data (full-scale rules) and non-null thresholds** are visible; draw dashed reference lines. When `fullScale === false`, **ignore thresholds** for the Y domain (data ± padding only) and **do not draw** threshold lines. Rationale: focused mode is purely for reading variation in the series.

4. **Component API**  
   - `EvolutionChart`: props `fullScale` (boolean, default `true`), `umbralOptimo` / `umbralMalo` (optional `number | null`); Y-axis logic and `Y_AXIS_FOCUS_PADDING_RATIO` live in `app/utils/evolutionChartDomain.ts`.  
   - `IndicadorEvolutionCard`: same props, forwarded to `EvolutionChart`.  
   - `IndicadoresDashboardView`: receives `fullScale` from parent; passes it and metadata thresholds from `item.indicador.metadata`.  
   - `IndicadoresPanel`: may pass thresholds only (default full scale) for consistency in the slide-over chart.

5. **Styling of thresholds**  
   Two horizontal lines across the plot area: `stroke-dasharray`, neutral or semantic colors (e.g. green/red or zinc variants) consistent with existing palette; no requirement to label on-chart in v1 if that adds i18n scope—optional subtitle in spec.

6. **API audit**  
   Grep Nitro routes under `server/api/ods/` (and any composable-only `$fetch` paths) that return `OdsIndicador` or partial indicator objects. If any omit `umbral_optimo` / `umbral_malo`, add them to the SELECT/shape to match `indicadores.get.ts`. Rationale: user asked to “return it from the endpoint” if missing; main route already includes them.

## Risks / Trade-offs

- **[Risk] Focused scale misleads without zero** → Mitigation: toggle label makes mode explicit; default remains full scale.  
- **[Risk] Thresholds far from data squash the series** → Mitigation: in full-scale mode union domain keeps lines visible; focused mode omits thresholds so the series is never squashed by distant umbrales.  
- **[Risk] SSR / hydration** → Mitigation: keep D3 inside existing `ClientOnly` / `onMounted` patterns in `EvolutionChart`.  
- **[Risk] Single datapoint** → Mitigation: `span === 0` branch in design ensures non-zero vertical range.

## Migration Plan

- Ship behind default `fullScale: true` so current visuals are unchanged until the user toggles.  
- No DB migration; no cache key changes unless a new API field is added to a cached response (then bump key or accept one-time refetch).

## Open Questions

- Exact copy for the toggle in **Catalan and Spanish** (`i18n/locales/*.json`) — implementer to add keys under `municipio.*` or `ods.*` consistent with existing structure.  
- Whether **list view** or **panel** should reuse the same toggle (out of scope unless product asks; proposal centers on dashboard).
