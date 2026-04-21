## Context

`DoubleSpiderMinMax.vue` renders a 17-axis radar of ODS index averages for the presupuestos overview. It already receives `values`, `selectedOds`, `labels`, and `domainMode`. Axis lines and dots currently use reduced opacity when an ODS is not in `selectedOds` (today the parent passes only the focused ODS, so most vertices look dimmed). Labels at the rim show ODS numbers with the same dimming; full names appear only in a hover tooltip.

`IndicadoresView.vue` already loads full `OdsHierarchyResponse` for up to two comparison INEs (`hierarchyComp1`, `hierarchyComp2`) via `/api/ods/indicadores`. Primary overview values are derived from props `data` with the same `objetivos` → `promedio_indice` shape used for `backendOverviewValues`.

## Goals / Non-Goals

**Goals:**

- Dots at data vertices always read at full opacity; optional emphasis for “selected” ODS can remain on **axes** or other cues if still desired for navigation sync.
- ODS labels visible without hover: alternating **left / right** placement (by axis angle or index), with a short **leader line** from the outer ring to the label anchor.
- When comparison hierarchies are loaded, render **one polygon (and dots) per municipio** on the same radial scale, with **distinct stroke/fill** treatments that stay legible when overlaid.
- Expose **municipio names** (primary + comparisons); **hover on a name** lowers opacity of all **other** series (paths + dots) so one serie stands out.

**Non-Goals:**

- Changing how comparison INEs are chosen (existing store/UI).
- New backend endpoints unless reuse of existing hierarchy payloads is insufficient (it should not be).
- Animations beyond simple opacity transitions.

## Decisions

1. **Comparison data source**  
   Reuse `hierarchyComp1` / `hierarchyComp2` in `IndicadoresView.vue`. Extract a small pure helper (or inline computed) that maps `OdsHierarchyResponse | null` → `number[17]` using the same logic as `backendOverviewValues` (iterate `objetivos`, `odsNum(obj.id)`, `promedio_indice`). Pass an array of `{ ine: string, nombre: string, values: number[] }` (or `name` + `values` only) into the chart.

2. **Component API**  
   Extend `DoubleSpiderMinMax` with optional `series?: { key: string, name: string, values: number[] }[]` where the first entry is always the primary (current `values` can remain as primary-only for backward compatibility, or primary is explicit in `series[0]` — prefer **keeping `values` as primary** and adding optional `comparisonSeries` to avoid churn).  
   **Chosen shape**: keep `values` + `nameMunicipio` for primary; add optional `comparisons?: { name: string, values: number[] }[]`.

3. **Label placement**  
   For each axis `i`, use `Math.cos(angle) >= 0` → place label on the **right** (text-anchor start / end accordingly); else **left**. Anchor label at `outerRadius + offset` along the horizontal direction from the axis tip (or perpendicular offset) and draw a **polyline or line** from `(axisX, axisY)` to a elbow point then to the label to avoid overlapping the web. Use compact text: ODS **number** (1–17) plus optional short name truncation if space allows.

4. **Dot opacity**  
   Remove `:opacity` binding on **circles** that depends on `isSelected`. Keep `selectedOds` behavior on **spoke lines** if product still wants focus on one ODS; if that also conflicts with “always readable”, spokes can stay dimmed or move to stroke-width emphasis — **spec defaults**: dots full opacity; spokes may follow existing selected logic unless spec says otherwise. User asked only for dots — design: **dots full opacity**; spokes unchanged unless UX review says otherwise.

5. **Hover emphasis**  
   Track `hoveredSeriesKey: 'primary' | number | null` (index into comparisons). On mouseenter on legend row, set key; on leave, clear. Apply `opacity` ~0.15–0.25 to non-hovered series’ `<path>` and `<circle>` groups; hovered stays 1. When nothing hovered, all series at full (or slightly reduced fill alpha for fill only).

6. **SSR**  
   Chart is pure SVG in template; no change to `ClientOnly` unless new DOM measurement is added — not required for this design.

## Risks / Trade-offs

- **[Risk] Overlapping polygons** obscure individual shapes → **Mitigation**: distinct hues (cycle a small palette), stroke-only or lighter fills for comparisons, emphasis on hover.
- **[Risk] Left/right labels collide on small widths** → **Mitigation**: slightly smaller font, reduce `outerRadius` fraction reserved for labels, or hide secondary line of label text on narrow `canvasWidth`.
- **[Risk] Comparison data still loading** while primary shows → **Mitigation**: only append comparison series when corresponding `values` array is meaningful (same `overviewHasMeaningfulData`-style check per serie or wait for hierarchy non-null).

## Migration Plan

Deploy with frontend-only changes; no DB migration. Rollback: revert component and parent props.

## Open Questions

- Whether **spoke** lines should also stay dimmed for non-`selectedOds` after dots go full opacity (current product uses `focusedOds` for scroll sync — likely keep spoke emphasis).
