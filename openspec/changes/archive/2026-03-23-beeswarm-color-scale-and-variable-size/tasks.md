## 1. Optional color scale

- [x] 1.1 Add optional prop `colorScale?: (value: number) => string` to BeeswarmChart
- [x] 1.2 When `colorScale` is provided, use `colorScale(datapoint.valor)` for each dot fill; when absent, keep using `color` prop
- [x] 1.3 Ensure existing highlight/dim logic (highlights, highlightedIne) still works when colorScale is used (e.g. dimmed dots keep same scale, lower opacity)

## 2. Optional variable size by secondary data

- [x] 2.1 Add optional props `sizeBySecondaryData?: boolean` and `secondaryValues?: Record<string, number>` to BeeswarmChart
- [x] 2.2 When both are set, compute radius per dot from `secondaryValues[codigoIne]` (e.g. linear or sqrt scale from data min/max to a pixel radius range); use fallback radius when value is missing
- [x] 2.3 Update D3 force collision to use per-dot radius when variable size is enabled (e.g. forceCollide with function of node radius)
- [x] 2.4 When `sizeBySecondaryData` is false or `secondaryValues` is missing/empty, keep current fixed radius and collision behavior

## 3. Caller wiring (e.g. index page)

- [x] 3.1 On the page that uses BeeswarmChart with the map, pass the same `colorScale` used for the map when the beeswarm should match map colors
- [x] 3.2 Optionally fetch or obtain population (e.g. from existing API/regiones) and build `secondaryValues: Record<codigoIne, number>`; pass it with `sizeBySecondaryData: true` when variable size is desired

## 4. Verification

- [x] 4.1 Verify: with no new props, chart behavior is unchanged (fixed color, fixed radius)
- [x] 4.2 Verify: with colorScale only, dots use the same colors as the map for the same valor
- [x] 4.3 Verify: with sizeBySecondaryData and secondaryValues, dot radii vary by the secondary value and collisions respect radius
