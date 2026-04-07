# Beeswarm: optional color scale and variable size by secondary data

## Why

The beeswarm chart and the map on the home page show the same variable (e.g. ODS average per municipality) but use different encodings: the map uses a color scale aligned to the data range, while the beeswarm uses a single fixed color. Aligning the beeswarm’s fill with the same color scale as the map improves consistency and lets users match dots to map areas by color. Optionally, a second dimension (e.g. population) can be encoded by dot size, so the chart can show “value on X, color from scale, size from secondary data” without the component fetching data—only drawing what the parent passes in.

## What Changes

- **Optional color scale**: BeeswarmChart MAY accept an optional `colorScale?: (value: number) => string` prop (same contract as the map). When provided, each dot’s fill is `colorScale(datapoint.valor)` (same variable as the X axis), so colors match the map. When not provided, the existing `color` prop is used (fixed color for all dots). `color` remains supported for backward compatibility.
- **Optional variable size by secondary data**: BeeswarmChart MAY accept an optional boolean `sizeBySecondaryData?: boolean` and an optional `secondaryValues?: Record<string, number>` (codigoIne → value, e.g. population). When `sizeBySecondaryData` is true and `secondaryValues` is provided, each dot’s radius is proportional to the secondary value (e.g. population) for that municipality. This is independent of the color scale: variable size can be used with or without the color scale.
- **No data loading in the chart**: BeeswarmChart does not fetch data. The parent (e.g. index page) is responsible for loading population or other secondary data (e.g. from the existing DB/regiones or API) and passing it via props. The chart only renders.
- **Backward compatibility**: If neither the color scale nor the size-by-secondary props are passed, the chart behaves exactly as today (fixed color, fixed radius).

## Capabilities

### New Capabilities

- `beeswarm-color-scale-and-variable-size`: Optional color scale prop (priority over fixed `color` when present); optional `sizeBySecondaryData` and `secondaryValues` for radius proportional to a second variable (e.g. population); parent supplies all data, chart only draws.

### Modified Capabilities

- None.

## Impact

- **app/components/BeeswarmChart.vue**: New optional props `colorScale`, `sizeBySecondaryData`, `secondaryValues`; fill logic when `colorScale` is set; radius logic when `sizeBySecondaryData` and `secondaryValues` are set; force simulation may need to account for variable radius (e.g. collision radius per dot).
- **Callers (e.g. app/pages/index.vue)**: May pass the same `colorScale` used for the map, and optionally fetch population (or other secondary data) and pass `secondaryValues` + `sizeBySecondaryData` when the feature is enabled.
- **Data**: Population is already available (e.g. REGIONES.poblacion). No new API is required for the spec; the page or a composable can use existing endpoints or data to build `secondaryValues`. Future preloading at build time is out of scope for this change.
