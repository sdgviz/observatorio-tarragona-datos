# Design: Municipio combobox and permanent highlight

## Context

The home page (`index.vue`) shows a map and a beeswarm chart. Both react to hover via `highlightedIne`; there is no way to “pin” a municipality. The page already fetches `/api/municipios/list` (codigo_ine, nombre, poblacion). MapWrapper/MapTarragona and BeeswarmChart accept a single `highlightedIne` (and BeeswarmChart also has a `highlights` array for styling). We need a second, persistent highlight source (combobox selection) that coexists with hover.

## Goals / Non-Goals

**Goals:**

- Add a searchable single-select combobox above the beeswarm; options = municipalities from existing list.
- When user selects a municipality, it is permanently highlighted on the map and beeswarm until the user clears the selection.
- Hover highlight remains; selected and hovered municipality can both be visible with distinct styling where useful.
- Reuse existing API and components; extend with new state and optional props only.

**Non-Goals:**

- No new backend or API changes.
- No automatic map zoom/pan to the selected municipality (optional later enhancement).
- No multi-select; one pinned municipality at a time.

## Decisions

1. **State in index.vue**  
   Add `selectedIne: Ref<string | null>` in the page. Combobox binds to it; clearing the combobox sets it to `null`. This keeps “which municipality is pinned” as page-level state.

2. **Combobox component**  
   Use Nuxt UI: `USelect` with search (or `UCombobox`/autocomplete if available) so users can type to filter by municipality name. Items: `municipiosList` mapped to `{ label: nombre, value: codigo_ine }`. Single selection; include a clear option or allow empty value to clear.

3. **Map permanent highlight**  
   MapWrapper (and MapTarragona) currently take `highlightedIne` for hover. Add an optional prop `selectedIne?: string | null`. MapTarragona SHALL render both: hover = existing stroke/highlight style; selected = additional permanent style (e.g. distinct border/ring or opacity) so both can be visible. If only one is present, existing behavior remains.

4. **Beeswarm permanent highlight**  
   BeeswarmChart already has `highlights: string[]` (INEs that get full color) and `highlightedIne` (hover). Pass `highlights` as the union of `selectedIne` (if set) and `highlightedIne` (if set), deduplicated, so both selected and hovered dots are emphasized. Optionally add a `selectedIne` prop for a distinct style (e.g. ring) on the selected dot; if not added, selected and hover can share the same visual until we add a second style.

5. **Placement and i18n**  
   Combobox is placed above the BeeswarmChart in the same column/section. Add i18n keys for placeholder (e.g. “Buscar municipio”) and clear/empty state if the component exposes them.

## Risks / Trade-offs

- **Risk**: Two highlight types (selected vs hover) might be visually noisy.  
  **Mitigation**: Use a subtle but distinct style for selected (e.g. ring or dashed border) so it doesn’t clash with hover.

- **Risk**: Combobox and map/beeswarm could get out of sync if list and map data differ.  
  **Mitigation**: Both use the same source (municipiosList / same INEs as map); no separate state for “list” vs “map”.

- **Trade-off**: No zoom-to-municipality on select keeps scope small; can be added later if needed.

## Migration Plan

- Frontend-only change; no data or API migration.
- Deploy as usual; no feature flag required. Rollback = revert commit.

## Open Questions

- None. Optional: later iteration could add “scroll/zoom map to selected municipality” when selection changes.
