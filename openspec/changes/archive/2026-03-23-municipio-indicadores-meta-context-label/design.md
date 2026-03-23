## Context

- `/api/ods/indicadores` builds `OdsHierarchyResponse`: `objetivos[]` → `metas[]` (`OdsMeta`: `id`, `nombre`, `indicadores[]`).
- `IndicadoresView.vue` flattens to `FlatItem` with `objetivoNombre: obj.nombre` (goal) but does not keep `meta.nombre`.
- UI copies today: `ODS {n} · {objetivoNombre}` on rows, cards, and panel.

## Goals / Non-Goals

**Goals:**

- Add **`metaNombre: string`** (from `meta.nombre` in the flatten loop) on the shared flat item type used by Lista, Dashboard, panel, and `openPanel` payloads.
- Replace **indicator-level** subtitles that currently use the goal name with the **meta name**, preserving **`ODS {n} ·`** (or equivalent) so the goal number stays visible for icons/colour/wayfinding.
- Section **H2** titles remain **goal-level** (`ODS n · {objetivo nombre}`) so scroll anchors and ODS grouping are unchanged.

**Non-Goals:**

- Changing URL anchors, ODS strip, or section grouping.
- Showing meta **id** (`2030-x.y`) to end users unless product asks later.
- Updating `IndicadoresChart.vue` or other non-municipio-indicadores surfaces (out of scope unless same flat model is reused).

## Decisions

1. **Data shape**  
   - **Choice**: Add `metaNombre` on `FlatItem` / `PanelItem`; keep `objetivoNombre` for section headers and any goal-level copy.  
   - **Rationale**: Minimal churn; API already provides `meta.nombre`.

2. **Card props**  
   - **Choice**: Pass `metaNombre` into cards/panel for the subtitle; optionally rename props from `objetivoNombre` to `contextLabel` in a follow-up — prefer **pass meta as the value** for the existing `objetivo-nombre` prop first to limit file churn, or introduce `meta-nombre` and deprecate misleading name in a small refactor (tasks can pick one).  
   - **Alternative**: Rename to `hierarchySubtitle` everywhere (clearer, slightly larger diff).

3. **Fallback**  
   - **Choice**: If `meta.nombre` were ever missing, fall back to `meta.id` or goal name (defensive); API today always sets meta `nombre` from dictionary.

## Risks / Trade-offs

- **Prop naming** → `objetivoNombre` on cards meaning “meta line” is confusing; mitigate with rename in same change if quick.

## Migration Plan

- Ship as a single frontend deploy; no data migration.

## Open Questions

- None blocking.
