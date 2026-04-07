## Why

The home page currently shows a placeholder where a beeswarm chart should display per-municipality ODS indicator values. This visualization is critical for allowing users to see the distribution of all municipalities along a single indicator at a glance — complementing the choropleth map above it with a more precise, point-level view. The chart needs to be a reusable, generic D3 component decoupled from any specific data domain so it can be used in other parts of the application in the future.

## What Changes

- Create a generic `BeeswarmChart.vue` component that renders a D3 force-directed beeswarm plot:
  - Receives datapoints, dot color, chart dimensions, and scale domain as props.
  - Uses D3 force simulation to position dots on the Y axis (avoiding collisions) while mapping the X axis to the data value.
  - Animated entrance on load.
  - Tooltip on hover showing datapoint details.
  - Optional `highlights` prop: a list of codes that remain colored while non-highlighted dots are faded to grey.
- Integrate the beeswarm chart into `app/pages/index.vue`, replacing the current placeholder:
  - Synchronized with the ODS selector — shows the same objective displayed in the map.
  - Fed by the existing `/api/ods/promedios` endpoint data (already fetched for the map).

## Capabilities

### New Capabilities
- `beeswarm-chart-component`: Reusable D3 beeswarm chart Vue component with force layout, animated entrance, tooltip, configurable size/scale/color, and optional highlight filtering.

### Modified Capabilities

_(none)_

## Impact

- **New file**: `app/components/BeeswarmChart.vue`
- **Modified file**: `app/pages/index.vue` — replace placeholder with `<BeeswarmChart>`, wire props from existing ODS data.
- **Dependencies**: Uses existing `d3` package (already installed) — specifically `d3-scale`, `d3-force`, `d3-selection`, `d3-transition`.
- **API**: No new endpoints needed; reuses `/api/ods/promedios` data already fetched on the home page.
- **i18n**: May add tooltip-related keys to locale files.
