## Context

The home page (`index.vue`) already keeps a single selection ref (`selectedIneRaw`) for `USelectMenu` and passes `selectedIne` / highlight state to `MapWrapper` and `BeeswarmChart`. `MapWrapper` currently wires `@click-region` to `navigateTo` municipio detail routes using `visualizationStore.isODS` for the path prefix. `BeeswarmChart` only emits `update:highlightedIne` on hover, not a durable selection.

## Goals / Non-Goals

**Goals:**

- One source of truth for “selected municipio” on the home page: combobox, map click, and beeswarm dot click all set `selectedIneRaw` (or equivalent).
- On the home page only, map click SHALL NOT navigate immediately; it updates selection.
- Show an explore CTA to the right of the map when a municipio is selected, linking to the same destination the map used to open on click.
- Preserve existing map click-to-navigate behavior on other routes (e.g. ODS goal pages) unless they opt into the new mode.

**Non-Goals:**

- Changing ODS goal page region-filter or fade behavior.
- Multi-select on the home page.
- New API endpoints.

## Decisions

1. **`MapWrapper` click policy via prop**  
   - **Choice:** Add something like `regionClickAction?: 'navigate' | 'emit'` (default `'navigate'`) to preserve current behavior. When `'emit'`, emit `clickRegion` / `selectRegion` with INE and do not call `navigateTo`.  
   - **Rationale:** Centralizes routing logic today; home passes `emit` and handles selection + link; other pages omit prop and keep navigate.  
   - **Alternative:** Home uses a forked wrapper or duplicate map — rejected to avoid drift.

2. **Beeswarm: explicit opt-in for click selection**  
   - **Choice:** Prop e.g. `selectOnClick?: boolean` (default `false`). When true, pointer primary click on a dot emits e.g. `selectMunicipio` / `update:selectedIne` with `codigoIne`; hover behavior unchanged.  
   - **Rationale:** Avoid accidental behavior changes on ODS pages that embed the chart.  
   - **Alternative:** Always emit on click — rejected as breaking expectation where click might be unused.

3. **Explore control**  
   - **Choice:** `NuxtLink` or `UButton` as link variant, placed in the map column layout to the right of the map visual (same grid cell, flex row: map flex-1 + link aligned end or column with link under/right per design). User asked “right side of the map”.  
   - **Target URL:** Reuse the same path logic as current `MapWrapper.onRegionClick` (`/municipios/ods/:ine` vs `/municipios/au/:ine`).  
   - **i18n:** String with interpolated municipality name (ca/es).

4. **Click vs hover**  
   - **Choice:** Click sets selection; hover continues to update `highlightedIne` only. Optional: clicking the already-selected municipio clears selection only if product wants it — default **no toggle** (click always sets selection; clear via combobox clear).

## Risks / Trade-offs

- **[Risk]** Teleported map hit targets vs overlay — mitigated by testing pointer events on index after layout change.  
- **[Risk]** Mobile tap conflated with hover on beeswarm — mitigated by using explicit click handler and ensuring dots remain clickable.  
- **[Trade-off]** Extra prop surface on `MapWrapper` / `BeeswarmChart` — small and defaulted.

## Migration Plan

Deploy as a normal frontend release. No data migration. Rollback: revert props and index wiring; restore unconditional `navigateTo` in wrapper for home if needed.

## Open Questions

- Exact visual placement (vertical alignment with map vs sticky) — follow existing spacing tokens; refine in UI review.
