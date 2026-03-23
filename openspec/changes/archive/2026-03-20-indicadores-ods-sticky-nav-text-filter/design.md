## Context

- `IndicadoresView.vue` today: `OdsMultiSelect` filters which ODS goals contribute rows/cards; `USelect` sorts; Lista uses `UTable`; Dashboard uses a flat grid.
- `OdsMultiSelect` uses non-obvious rules (e.g. all selected → first click collapses to one ODS) while users mainly want to **jump** to a goal area.
- Product ask: **sticky** control row, **click ODS → scroll** to that goal’s block, **remove sort**, **text search** after 3 characters.

## Goals / Non-Goals

**Goals:**

- Sticky toolbar (ODS strip + text filter + Lista/Dashboard tabs) while scrolling the indicadores content.
- Visible **per-ODS sections** in Lista and Dashboard with stable DOM **`id`s** for `scrollIntoView({ behavior: 'smooth', block: 'start' })`.
- **Text filter**: query length **≥ 3** applies case-insensitive match on indicator **name** (and optionally `descripcion` if non-null); **0–2** characters → no text filtering.
- **Remove** sort dropdown and `applySort` logic; order within each ODS = hierarchy order from API.

**Non-Goals:**

- Backend search or pagination.
- Changing trend/spider data APIs.
- i18n key sweep (strings may stay Spanish inline unless project convention requires keys).

## Decisions

1. **ODS strip behaviour (replaces confusing multi-filter as primary UX)**  
   - **Choice**: **Always render sections for ODS 1–17** that have at least one indicator in data (skip empty goals). Clicking an ODS icon **scrolls** to `#municipio-indicadores-ods-{n}` (exact prefix in design; implement consistently in Lista + Dashboard).  
   - **Visual state**: optional **aria-current** / ring on last-clicked ODS for wayfinding; pass **that set** (e.g. `{n}` or `[n]`) to `DoubleSpiderMinMax` as `selected-ods` for highlight parity.  
   - **Rationale**: Matches “scroll to section”; avoids empty-list edge cases from deselect-all.  
   - **Alternative rejected**: retain union-filter + scroll (keeps counterintuitive toggles).

2. **Sticky positioning**  
   - **Choice**: Wrapper `div` with `sticky top-0 z-20` (tune vs site header), **opaque or blurred background** (`bg-white/95` + `backdrop-blur`) and **bottom border** so content does not show through.  
   - **Offset**: if global header is also sticky, add `top-*` class token that matches layout (document in implementation; may use CSS variable later).

3. **Text filter interaction with sections**  
   - **Choice**: Filter **rows/cards**; **hide** an entire ODS section if no indicator matches. Show empty state when **no** section has matches.  
   - **Debounce**: optional 150–300 ms `useDebounceFn` on input to limit re-renders (many rows).

4. **Lista structure**  
   - **Choice**: Either **one `UTable` per ODS** with a heading row + `id` on section wrapper, or **one table** with repeated `thead` blocks — prefer **wrapper per ODS** + single or multiple tables per spec clarity; simplest: **section** with `h2`/`div` anchor + table subset rows.

5. **Dashboard structure**  
   - **Choice**: Wrap each ODS group in a `section` with same `id` as Lista; grid of cards inside. Overview spider stays **above** grouped content.

6. **Scroll-driven ODS highlight**  
   - **Choice**: Composable `useIndicadoresOdsScrollSpy`: VueUse [`useWindowScroll`](https://vueuse.org/core/useWindowScroll/) plus [`watchThrottled`](https://vueuse.org/shared/watchThrottled/) on `y` (e.g. 100 ms) to run a DOM pass over elements with `id` prefix `municipio-indicadores-ods-` and `getBoundingClientRect` against a fixed **activation offset**; `lockScrollSync()` for ~700 ms after programmatic `scrollIntoView` from the strip.  
   - **Rationale**: One simple loop vs one `IntersectionObserver` per section and re-registration when Lista/Dashboard or filtered sections change.  
   - **Alternative**: [`useIntersectionObserver`](https://vueuse.org/core/useIntersectionObserver/) per ODS block with `rootMargin` matching the sticky offset.

## Risks / Trade-offs

- **Many DOM nodes** when all ODS expanded → acceptable for static municipio size; mitigated if needed later with virtualisation (**out of scope**).  
- **Hash in URL**: optional `useRoute` hash sync — **out of scope** unless requested.  
- **Spider “selected Ods”** semantics change → document in release notes for QA.

## Migration Plan

- Ship as single frontend deploy; no data migration.  
- QA: Lista + Dashboard scroll targets, filter at 2 vs 3 chars, mobile sticky overlap.

## Open Questions

- None blocking; confirm `top` offset with `AppHeader` height on first implementation pass.
