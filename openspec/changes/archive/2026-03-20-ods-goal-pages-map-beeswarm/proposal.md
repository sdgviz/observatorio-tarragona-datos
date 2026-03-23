## Why

The site needs a dedicated experience per UN Sustainable Development Goal (ODS 1–17): a discoverable entry from the main header, a stable URL per goal, and on each goal page a map that can switch between the **aggregated ODS score** and **each underlying indicator**, plus a **beeswarm distribution** per indicator so users can compare municipalities consistently with the rest of the app. This matches the product direction in [Figma (Tarragona — node 5234-2614)](https://www.figma.com/design/5mkHvb1l5bh6CWNhCVcz0i/Tarragona?node-id=5234-2614).

## What Changes

- **Per-goal routes** under `app/pages/ods/`: dynamic `[number].vue` (or equivalent) for objectives 1–17, plus updates to `ods/index` as an entry or hub if needed.
- **Header ODS navigation** in `AppHeader.vue`: replace the flat “all ODS” dropdown with a **popover-style menu** where each row uses the **official ODS color** and label; the trigger shows the **current goal** (number + title) with the goal color as background when on an ODS goal page (per design screenshot).
- **ODS goal page layout**: primary **map** with a **selector** to choose the map layer: **global ODS value** (existing objective-level averages) vs **one indicator** belonging to that ODS (values per municipality).
- **Indicator section**: for the selected ODS, render **one `BeeswarmChart` per indicator** (reuse `app/components/BeeswarmChart.vue`), fed with municipality-level values for that indicator; align highlighting/interaction with existing map/beeswarm patterns where applicable.
- **Data**: reuse `/api/ods/promedios` for the objective layer; reuse `/api/indicadores/valores` for per-indicator all-municipality series where possible; add or document a **single source of truth for “which indicators belong to ODS N”** if not already available without a municipality context (see design).

## Capabilities

### New Capabilities

- `header-ods-menu`: App header control to open a styled ODS list (17 rows, official colors, typography per design), navigate to `/ods/{n}`, and reflect the active goal on goal pages.
- `ods-goal-pages`: Nuxt pages for `/ods/1` … `/ods/17`, shared layout concerns (SEO title, valid range handling), and composition of map + charts sections.
- `ods-goal-map-indicator-selector`: On each goal page, map coloring driven by either objective aggregate or a selected indicator; UI control (select/tabs per Figma) to switch layers; color scale tied to active ODS brand color.
- `ods-goal-indicator-beeswarms`: List or grid of beeswarm visualizations—one chart per indicator under the current ODS—using `BeeswarmChart` props and datapoint shape already used elsewhere.

### Modified Capabilities

- `map-data-integration`: Extend requirements so **ODS goal pages** (not only the homepage) orchestrate map `values` and legend updates when the user switches between objective-level data and a selected indicator; static generation SHOULD cover `/ods/[1-17]` with the same prerender strategy as the homepage where feasible.

### Modified Capabilities (conditional)

- `ods-hierarchy-api` **or** a small new read-only endpoint spec: only if the frontend cannot reliably obtain the **ordered list of indicator IDs** for a given `objetivo` (1–17) from existing APIs or build-time assets. The design phase will choose one approach and, if needed, add a delta spec under the chosen capability name.

## Impact

- **Frontend (`diputacion_tarragona`)**: `AppHeader.vue`, new/updated `pages/ods/*`, map wrapper usage, composables for fetching/caching per layer, `BeeswarmChart` integration, i18n keys (ca/es) for menu labels and page copy.
- **Backend / data**: Likely **no schema change** if indicator lists can be derived from existing SQLite + APIs; otherwise a **narrow new GET** or **query extension** documented in the data repo specs.
- **UX / a11y**: Keyboard-accessible menu; `ClientOnly` + skeletons for D3 map and beeswarms per project conventions.
- **Design reference**: [Figma — ODS page / selector](https://www.figma.com/design/5mkHvb1l5bh6CWNhCVcz0i/Tarragona?node-id=5234-2614).
