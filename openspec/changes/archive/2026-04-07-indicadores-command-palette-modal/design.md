## Context

- `IndicadoresView.vue` today filters indicators with `searchQuery` and activates the filter only when `trim().length >= 3`, matching nombre/descripcion. The same filtered set drives `indicadoresSections`, `indicatorIds` (series fetch), and `emptyDueToSearch`.
- Nuxt UI v4 provides [`UCommandPalette`](https://ui.nuxt.com/docs/components/command-palette) with Fuse.js fuzzy search, `v-model:search-term`, `multiple` selection, `#footer` slot, and patterns for use inside [`UModal`](https://ui.nuxt.com/docs/components/modal).

## Goals / Non-Goals

**Goals:**

- Replace the inline search input with a **modal + command palette** listing **all** municipio indicators.
- **Multi-select** with **all selected by default**; **Select all** / **Select none** in the modal.
- Drive list/dashboard visibility and `useIndicadorValoresSeries` ids from the **selected id set**.
- Accessible trigger, i18n (ca/es), and a clear **empty selection** state.
- **Pinia** store so the same selected `id_indicador` set **survives client-side navigation** between municipio ODS routes (`/municipios/ods/[ine]`).

**Non-Goals:**

- Syncing selection to the URL query or server (out of scope unless added later).
- **Full-page reload / new tab** persistence (optional `pinia-plugin-persistedstate` is a follow-up; not required for “navigate to another city” within the SPA).
- Changing ODS hierarchy API or SQLite.
- Replacing Lista/Dashboard tabs or scroll-spy behavior beyond what follows from a smaller indicator set.

## Decisions

1. **Selection model (Pinia)**  
   Add a dedicated store (e.g. `useMunicipioOdsIndicadoresPickerStore`) holding **`selectedIndicadorIds: string[]`** (or equivalent serializable structure). Selection is **global to the SPA session**, not keyed by `codigo_ine`: the user’s last choice is reused when opening another municipio.  
   **Hydration when `flatItems` changes** (new INE or refetch): let `available =` set of `id_indicador` in current `flatItems`. **Effective selection** = `selectedIndicadorIds.filter(id => available.has(id))`.  
   - If the store is still **uninitialized** (e.g. first mount ever): set selection to **all** `available` ids.  
   - If the store is **explicitly empty** (`[]` after “select none”): keep **none** visible for this municipio (empty-selection state).  
   - If the store is non-empty but **intersection is empty** and `available` is non-empty (stale ids, catalog drift): **re-seed to all** `available` ids and update the store so the user is not stuck with a blank list.  
   Rationale: matches “remember across cities” while handling missing ids per municipio.

2. **Filter logic**  
   `filteredItems = flatItems.filter(item => selectedIds.has(item.indicador.id_indicador))`. Remove `searchQuery` / `textFilterActive` / substring filter. Rationale: palette search only affects **finding** rows inside the modal, not the main page until selection changes.

3. **CommandPalette wiring**  
   - One group `id: 'indicadores'` with `items` built from `flatItems`: `label` = indicator nombre, `suffix` = short context (`metaCodigo`, meta name, or ODS num) for Fuse `keys` (default `label`, `suffix`).  
   - `multiple` + `v-model` bound to selected values; use **`valueKey: 'id'`** (or map items to include `id: id_indicador`) so the model is id strings not full objects.  
   - **`fuse`**: optional tweak `resultLimit` if the list is large (100+).  
   - **`#footer`**: `UButton` pair “Select all” / “Select none” updating the model.  
   - Modal **`UCommandPalette`** with `close` prop or modal dismiss to exit; palette `placeholder` from i18n.

4. **Trigger UX**  
   Replace `UInput` with **`UButton`** (neutral/subtle + search icon) showing **count of selected / total** or short label “Indicadores” + badge. Opens `UModal` `v-model:open`.

5. **Empty states**  
   - **None selected**: show a dedicated message (not the “no API data” message).  
   - **No search matches** inside palette: rely on palette empty state or default Fuse behavior.

6. **Components**  
   Prefer **inline in `IndicadoresView.vue`** until >~120 lines of modal logic; then extract `MunicipioOdsIndicadoresPickerModal.vue`. Rationale: keep first PR reviewable.

## Risks / Trade-offs

- **[Risk] CommandPalette selection UX differs from checkboxes** → Mitigation: use `multiple` + selected-icon; verify in browser; document in tasks.  
- **[Risk] Large lists performance** → Mitigation: enable `virtualize` on palette if needed; tune `fuse.resultLimit`.  
- **[Risk] Selection reset surprises user on refetch** → Mitigation: only re-seed when intersection is empty and ids are stale; otherwise preserve store.  
- **[Risk] Pinia SSR double-init** → Mitigation: follow existing project patterns for stores on Nuxt (`stores/*.ts`, no server-only mutations).

## Migration Plan

- Ship behind same route; remove old placeholder “filtra” string from template; add i18n keys.  
- No server deploy dependency order.

## Open Questions

- Exact trigger label and badge format (product/copy).  
- Whether to close modal automatically after “Select all” (probably not).  
- Whether to add **localStorage** persistence later for full page reloads.
