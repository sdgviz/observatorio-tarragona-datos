# Map–Beeswarm cross-highlight

## Why

The index page shows the same dataset (value per municipality, keyed by INE code) in two visualizations: the Tarragona map and the beeswarm chart. There is no link between them, so users cannot see which municipality in one view corresponds to which in the other. Connecting both so that highlighting a city in one view highlights it in the other improves discoverability and comparison.

## What Changes

- **Shared highlight state**: The page (or a small parent) holds a single “highlighted” INE code (or none). Hover or click on a municipality in either the map or the beeswarm sets this state; both components react to it.
- **Map highlight**: When an INE code is highlighted, the corresponding map path gets a stronger border and a slight size increase (e.g. scale or stroke) so it stands out.
- **Beeswarm highlight**: When an INE code is highlighted, the corresponding dot gets a border and a larger radius so it stands out; other dots can stay as they are or be visually de‑emphasized if already supported.
- **Two-way sync**: Interacting with the map (hover/click) updates the beeswarm highlight, and interacting with the beeswarm (hover/click) updates the map highlight.
- **Standalone use**: Each component (map and beeswarm) SHALL work correctly when used alone on any page. The `highlightedIne` prop and the highlight emit are optional; no component SHALL depend on the other being present. When only one is used, it still shows its own highlight on hover; when both are used on the same page, the parent MAY connect them by passing the same state and listening to both emits.

No backend or API changes. Purely frontend in the Nuxt app (page + MapTarragona or MapWrapper + BeeswarmChart).

## Capabilities

### New Capabilities

- `map-beeswarm-cross-highlight`: Shared highlighted INE state, propagation from map and beeswarm, and highlight styling (map: border + size; beeswarm: border + larger ball).

### Modified Capabilities

- None.

## Impact

- **app/pages/index.vue**: Owns highlighted INE state; passes it to MapWrapper and BeeswarmChart; subscribes to highlight events from both.
- **app/components/MapWrapper.vue**: Accepts optional `highlightedIne` (or similar) and passes it to MapTarragona.
- **app/components/MapTarragona.vue**: Accepts optional `highlightedIne`; applies border and size increase to the matching path.
- **app/components/BeeswarmChart.vue**: Already has `highlights`; extend to support a single “emphasized” INE with border and larger radius; emit highlight-in / highlight-out (or equivalent) so the page can sync the map.

No new dependencies. No changes to API or data repo.
