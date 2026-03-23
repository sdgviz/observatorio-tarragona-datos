## Context

The Nuxt app already has ODS objective averages via `GET /api/ods/promedios`, per-indicator municipality values via `GET /api/indicadores/valores`, a horizontal `OdsSelector` on the homepage, `MapWrapper` + `MapTarragona`, and `BeeswarmChart` with cross-highlight patterns on `index.vue` ([map–beeswarm design](openspec/changes/archive/2026-03-10-map-beeswarm-cross-highlight/design.md)). `AppHeader.vue` currently exposes ODS navigation as a minimal dropdown linking only to `/ods`, while `pages/ods/index.vue` is a stub.

Product design ([Figma — node 5234-2614](https://www.figma.com/design/5mkHvb1l5bh6CWNhCVcz0i/Tarragona?node-id=5234-2614)) calls for a **header control** styled as a colored SDG bar plus a **popover list** of all 17 goals, and **per-goal pages** with a **map layer selector** (objective vs indicators) and **beeswarms per indicator**.

## Goals / Non-Goals

**Goals:**

- Routes `/ods/1` … `/ods/17` with a consistent layout: map + layer selector + beeswarm section.
- Header menu: 17 rows with official ODS colors, navigation to the matching route; trigger reflects current goal when on an ODS goal page (background = that goal’s color, label = number + localized title).
- Map shows either **PROMEDIOS_ODS-style aggregate** for that objective or **one indicator’s** municipality values; legend and color scale follow the **active ODS brand color** (same pattern as homepage).
- One **BeeswarmChart** instance per indicator under the current ODS, using the same datapoint contract (`valor`, `codigoIne`, `nombre`, `unidad`) as elsewhere.
- Reuse existing cross-highlight behavior where it already exists (optional on this page: single `highlightedIne` shared between map and all beeswarms, or scoped per chart—see Decisions).

**Non-Goals:**

- Redesigning the homepage ODS selector (horizontal strip) unless we later consolidate with the header menu.
- Editing SDG official colors (use existing `ods_list` / config source of truth).
- New database tables or ETL changes unless discovery shows no way to list indicators for an objective.

## Decisions

### 1. Routing

- **Choice:** Single dynamic page `app/pages/ods/[objetivo].vue` with `objetivo` validated as integer 1–17; invalid values → 404 or redirect to `/ods`.
- **Rationale:** Avoids 17 duplicate files; `nuxt generate` can use `nitro.prerender.routes` or `routeRules` to emit static HTML for each number.
- **Alternatives:** 17 static `.vue` files (rejected — high duplication).

### 2. Source of indicator list per ODS

- **Choice (preferred):** Use an existing API or build-time artifact that lists **indicator IDs** (and display names) grouped by ODS objective without requiring a municipality. Candidate paths to validate during implementation:
  - Extend `GET /api/ods/indicadores` with an optional mode (e.g. omit `codigo_ine` and return global catalog for `objetivo`) **only if** the DB can answer this efficiently and securely; or
  - Derive from `GET /api/ods/indicadores?codigo_ine=<reference>` for a canonical reference municipality that has full coverage (acceptable short-term if documented); or
  - Add a small dedicated `GET /api/ods/objetivo/:n/indicadores` read-only endpoint.
- **Rationale:** The UI must know **which** beeswarms to render and **which** options appear in the map layer selector.
- **Alternatives:** Hardcoded JSON in the repo (rejected unless API is impossible — maintenance burden).

### 3. Map layer selector UX

- **Choice:** Implement per Figma: control adjacent to or above the map (e.g. `USelect` or segmented control) with at least: **“ODS (aggregate)”** plus **one entry per indicator** for the current objective. Changing the selection refetches or switches cached series and rebuilds `values` + domain for `MapWrapper`.
- **Rationale:** Matches user request and design link.
- **Alternatives:** Tabs for aggregate vs list (acceptable variant).

### 4. Data fetching and static generation

- **Choice:** Use `useAsyncData` / `useFetch` with keys that include `objetivo`, `layer` (`aggregate` | `indicator`), and `indicatorId` so Nuxt can prerender. For each static route `/ods/n`, prerender **aggregate** payload; indicator payloads may be generated on demand client-side or included in prerender list if build time allows.
- **Rationale:** Aligns with existing `map-data-integration` prerender strategy.
- **Trade-off:** Prerendering aggregate × 17 is cheap; prerendering every indicator × 17 may be large — may defer full indicator prerender to client navigation with skeletons.

### 5. Beeswarm gallery layout

- **Choice:** Vertical stack or responsive grid: each cell has indicator title (and optional meta), then `BeeswarmChart` in `ClientOnly` with skeleton; height/width props consistent with homepage for visual coherence.
- **Rationale:** Reuse `BeeswarmChart` without forking.

### 6. Cross-highlight across many beeswarms

- **Choice:** Single page-level `highlightedIne` synced with the map (same pattern as homepage). Each `BeeswarmChart` receives the same `highlightedIne` / `highlights` and emits `update:highlightedIne` on hover.
- **Rationale:** One municipality highlighted everywhere; matches existing behavior.
- **Alternatives:** Independent charts without map link (rejected — worse UX).

### 7. Header implementation

- **Choice:** Prefer Nuxt UI `UPopover` or `UDropdownMenu` with **custom slot content** (not only text items) so each row can be a full-width colored bar. i18n for “Goal n / Objetivo n” strings in ca/es.
- **Rationale:** Accessibility and focus management from Nuxt UI; custom markup for SDG colors.

## Risks / Trade-offs

- **Indicator catalog gap** → If no global list exists, beeswarm section cannot be complete. Mitigation: implement catalog endpoint or documented reference-INE strategy in the first sprint.
- **Build size / time** → Many indicators × prerender. Mitigation: prerender aggregates only; lazy-fetch indicators.
- **Duplicate ODS UI** → Header menu vs homepage selector. Mitigation: share `ods_list` config and naming helpers only; accept two patterns until a future consolidation change.

## Migration Plan

1. Ship routes and header links; keep `/ods` index as hub or redirect to `/ods/1` per product preference.
2. No database migration expected; optional additive API only.
3. Rollback: remove routes and revert header menu to previous single-item dropdown.

## Open Questions

- Should `/ods` list all goals as cards or redirect to a default objective?
- Which **period/year** is authoritative for map and beeswarm on this page (latest available per indicator vs fixed year)?
- Confirm with design whether the map selector uses native select, custom listbox, or segmented control to match Figma pixel-perfect.

---

## Implementation notes (applied)

- **Indicator catalog (task 1.1):** `GET /api/ods/objetivo-indicadores?objetivo=1..17&lang=es|ca` returns all `id_indicador` under the objective from `DICCIONARIO` + `ARQUITECTURA_L2` + `METADATA` (no `codigo_ine`).
- **Period (task 1.2):** Map and beeswarms use **latest `periodo` per `codigo_ine`** for each indicator via `GET /api/indicadores/valores?indicator_id=…&latest=true` without `ine` or `year` (same idea as existing hierarchy “latest only” behaviour).
