## Why

On the home page, users can pick a municipality only via the combobox. Map regions and beeswarm dots show hover feedback but do not commit a **selection** aligned with that control, and map clicks currently follow `MapWrapper`’s navigate-to-municipio behavior. Unifying selection across combobox, map, and beeswarm reduces friction and matches mental models from the ODS goal page. A clear **explore** affordance next to the map makes the next step obvious once a municipality is chosen.

## What Changes

- **Home (`index`) municipality selection**: Clicking a map municipality path or a beeswarm dot sets the same persistent selection state as choosing an item in `USelectMenu` (same INE / v-model source of truth).
- **Map click behavior on home**: Map clicks must **not** immediately navigate away when the intent is home-page exploration; they update selection instead (navigation is deferred to the new control below).
- **Explore control**: When a municipality is selected, show a link-style button to the **right** of the map with copy along the lines of “Explore &lt;municipality name&gt; data”, pointing to the appropriate municipio detail route (consistent with existing app mode: ODS vs agenda urbana).
- **Accessibility**: Keyboard-capable controls where the design system allows; visible focus for the new link-button.

## Capabilities

### New Capabilities

- `home-municipio-map-beeswarm`: Home-page behavior for unified municipio selection from combobox, map, and beeswarm; map click does not auto-navigate on home; explore link-button placement and routing.

### Modified Capabilities

- `beeswarm-chart-component`: ADDED requirement for optional primary click (or explicit “select”) interaction that emits the clicked dot’s `codigoIne` so parents can bind the same state as a combobox; default behavior for existing consumers remains hover-only unless the new API is used.

## Impact

- **App**: `app/pages/index.vue`, `app/components/MapWrapper.vue` (conditional navigate vs emit/select), `app/components/BeeswarmChart.vue` (optional click → emit), i18n strings for explore CTA (ca/es).
- **Store / routing**: Reuse existing `visualizationStore` / municipio paths for the explore link target.
- **Other pages**: ODS goal page and others using `MapWrapper` / `BeeswarmChart` unchanged unless they opt into new events or props.
