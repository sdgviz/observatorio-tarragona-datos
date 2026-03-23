# Design: Map–Beeswarm cross-highlight

## Context

The home page (`index.vue`) renders two visualizations of the same dataset (value per municipality by INE code): **MapTarragona** (via MapWrapper) and **BeeswarmChart**. Both use the same key (`codigo_ine` / `CODEINE`). Today there is no shared interaction: hovering or clicking in one does not affect the other. Users cannot easily see which dot on the beeswarm corresponds to which municipality on the map.

BeeswarmChart already has a `highlights` prop (array of INE codes) that fades non-matching dots. MapTarragona has no highlight concept; it only uses `zoomRegion` for zoom and opacity. The design must introduce a single “highlighted” INE at page level and propagate it to both components, with clear visual treatment in each.

## Goals / Non-Goals

**Goals:**

- One shared “highlighted” INE (single code or null) owned by the page.
- Hover or click on a municipality in the map sets that INE as highlighted; both map and beeswarm reflect it.
- Hover or click on a dot in the beeswarm sets that INE as highlighted; both beeswarm and map reflect it.
- Map: highlighted path has a stronger border and a slight size increase (e.g. scale or stroke) so it stands out.
- Beeswarm: highlighted dot has a border and a larger radius; other dots can stay as-is or be de‑emphasized (existing `highlights` behavior can be reused or extended).
- No backend or API changes; client-only state.

**Non-Goals:**

- Multiple simultaneous highlights (e.g. multi-select). Only one INE is highlighted at a time.
- Persisting highlight in URL or session.
- Changing data shape or INE code format (both sides already use the same codes).

**Independence:**

- MapTarragona (and MapWrapper) and BeeswarmChart SHALL work correctly when used alone on any page (e.g. only the map on a municipio page, or only the beeswarm on another dashboard). The cross-highlight is optional orchestration by the parent; no component SHALL require the other to be present.

## Decisions

### 1. Where to hold highlighted INE state

- **Choice:** Page (`index.vue`) holds a single `ref<string | null>` (e.g. `highlightedIne`).
- **Rationale:** Both MapWrapper and BeeswarmChart are siblings on the same page; the page is the natural owner. No need for Pinia unless we later add cross-page or persistent highlight.
- **Alternatives:** Pinia store (rejected for now — single page, no persistence); provide/inject (acceptable but ref in page is simpler and explicit).

### 2. How to trigger highlight (hover vs click)

- **Choice:** Use **hover** as the primary trigger so that moving the cursor over a municipality or dot immediately highlights it in both views. Optionally support **click** to “pin” the highlight until another click (or click-away) if we want a sticky selection; that can be a follow-up.
- **Rationale:** Hover gives instant feedback and matches “connect both visualizations” without extra clicks. Click-to-pin can be added later without changing the data flow.
- **Alternatives:** Click-only (less discoverable); hover + click to lock (add later if needed).

### 3. Map: how to “increase size” for the path

- **Choice:** Prefer **thicker stroke** (e.g. stroke-width 2–3px) and a **distinct stroke color** (e.g. dark or accent) for the highlighted path. If feasible without breaking layout, apply a small **scale transform** (e.g. 1.02–1.05) from the path’s centroid so the path looks slightly larger.
- **Rationale:** SVG paths don’t have a “radius”; stroke and scale are the levers. Thicker stroke is simple and works with `vector-effect="non-scaling-stroke"` (may need to toggle or adjust so the highlight stroke scales in the zoomed view). Scale-from-centroid avoids shifting the map and keeps the path recognizable.
- **Alternatives:** Only stroke (no scale) if scale causes overlap or clipping issues; drop shadow for emphasis instead of or in addition to stroke.

### 4. Beeswarm: how to show “highlighted” dot

- **Choice:** For the single highlighted INE: **larger radius** (e.g. 1.25–1.5× base radius) and a **stroke/border** (e.g. 2px solid dark or accent). Reuse or align with existing `highlights` so that when `highlightedIne` is set, the beeswarm receives it (e.g. as `highlights: highlightedIne ? [highlightedIne] : []`) and in addition applies the larger radius and border only to that dot.
- **Rationale:** Matches user ask (“larger ball” and “border”). Existing `highlights` already dims non-highlighted dots; adding size and stroke makes the highlighted dot unmistakable.
- **Alternatives:** Only border; only size; or reuse `highlights` for dimming and add a separate `emphasizedIne` prop for size+border to keep “filter” vs “emphasis” separate (both acceptable).

### 5. How components communicate with the page

- **Choice:** **Props down, events up.** Page passes `highlightedIne: string | null` (or `highlightedIne?: string | null`) to MapWrapper and BeeswarmChart. MapWrapper forwards it to MapTarragona. MapTarragona and BeeswarmChart emit an event (e.g. `highlight` or `update:highlightedIne`) with the INE code when the user hovers a feature/dot (and optionally clear on leave). Page updates `highlightedIne` on that event.
- **Rationale:** Keeps state in one place; components stay presentational and testable. Fits Vue’s one-way data flow and v-model pattern if we use `update:highlightedIne`. Because both the prop and the emit are optional, each component works standalone: if the parent does not pass `highlightedIne` or does not listen to the emit, the component still renders and shows hover tooltip; it simply does not participate in cross-highlight.
- **Alternatives:** Provide/inject (works but less explicit); Pinia (unnecessary for single page).

### 6. MapWrapper and MapTarragona props

- **Choice:** Add optional `highlightedIne?: string | null` to MapWrapper; MapWrapper passes it to MapTarragona. MapTarragona accepts `highlightedIne` and applies the border + size treatment. MapTarragona emits when the user hovers a path (e.g. `@mouseenter` with the feature’s codeine). MapWrapper forwards that emit to the page (or MapTarragona is used in a way that the page can listen if we restructure).
- **Rationale:** MapWrapper is a thin wrapper; adding one prop and one emit keeps the API clear. MapTarragona stays responsible for rendering and hover; MapWrapper for layout and zoom controls.
- **Note:** If MapWrapper doesn’t expose MapTarragona’s emit, the page must listen to the map’s highlight event. Easiest is: MapWrapper accepts `highlightedIne` and `@update:highlightedIne` and passes both to MapTarragona; MapTarragona emits `update:highlightedIne` on hover enter/leave.

### 7. BeeswarmChart: props and emit

- **Choice:** Keep or extend `highlights` for “which dots are highlighted” (can be `highlightedIne ? [highlightedIne] : []`). Add optional `highlightedIne?: string | null` if we want an explicit “emphasized” dot for size+border only; or derive from `highlights` (when `highlights.length === 1`, that dot gets the larger radius and border). Emit (e.g. `update:highlightedIne` or `highlight`) with the dot’s `codigoIne` on hover enter, and `null` on hover leave.
- **Rationale:** Minimizes API surface: page sets `highlightedIne`, passes `highlightedIne` (or `highlights: highlightedIne ? [highlightedIne] : []`) and listens for `update:highlightedIne`. BeeswarmChart uses the same value for dimming and for “emphasized” styling (border + size).

## Risks / Trade-offs

- **Map path scale:** Scaling the path can cause overlap with neighboring municipalities or clipping at viewBox edges. Mitigation: use a small scale factor (e.g. 1.02); if issues appear, fall back to stroke-only.
- **Non-scaling stroke:** MapTarragona uses `vector-effect="non-scaling-stroke"` so stroke width is constant when zooming. For the highlighted path we may want the highlight stroke to scale with the map so it stays visible when zoomed. Mitigation: either remove `non-scaling-stroke` for the highlighted path only, or use a fixed stroke width that’s still visible when zoomed.
- **Hover vs touch:** On touch devices, hover is not available. Mitigation: accept that mobile may not have cross-highlight on first iteration, or add tap-to-highlight (single tap sets highlighted INE, tap elsewhere clears) as a follow-up.
- **Performance:** Updating `highlightedIne` on every hover could cause frequent re-renders. Mitigation: state is a single string; Vue’s reactivity is cheap; if needed, debounce or use pointer enter/leave only (no mousemove).

## Migration Plan

- All changes are in the frontend (Nuxt app). No deployment order dependency.
- Implement in order: (1) page state + pass-through and events from one component (e.g. BeeswarmChart), (2) the other component (MapTarragona) consuming and emitting, (3) styling (map path, beeswarm dot). No rollback beyond reverting the commit.

## Open Questions

- None blocking. Optional: click-to-pin highlight; touch support; and whether to use a single `highlightedIne` prop on BeeswarmChart or only `highlights` derived from it.
