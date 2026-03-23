## 1. EvolutionChart component — scaffold and scales

- [x] 1.1 Create `app/components/EvolutionChart.vue` with typed props (`datapoints`, `color`, `width`, `height`, `valueFormatter`), `<ClientOnly>` wrapper, `<USkeleton>` fallback, and an empty SVG element with ref.
- [x] 1.2 Implement `scaleLinear` for both X axis (min year → max year) and Y axis (0 → max value). Generate a full-range year domain so gap years get tick marks on the X axis.

## 2. EvolutionChart component — area, line, and gap handling

- [x] 2.1 Implement the D3 `area()` and `line()` generators with `.defined()` filtering to skip years without data, so the line breaks at gaps and the area is not filled for missing years.
- [x] 2.2 Render the area `<path>` and line `<path>` inside the SVG. Apply the `color` prop for fill (with opacity) and stroke.
- [x] 2.3 Render data-point circles only at years that have data.

## 3. EvolutionChart component — axes rendering

- [x] 3.1 Render X axis ticks and labels for every integer year in the domain range (including gap years). Format year labels as integers.
- [x] 3.2 Render Y axis with horizontal grid lines and tick labels.

## 4. EvolutionChart component — animation

- [x] 4.1 Add load animation: use a horizontal `clip-path` / `rect` that expands from left to right (CSS transition or D3 transition, 600–1000ms) to reveal the area and line progressively on mount.

## 5. EvolutionChart component — hover interaction

- [x] 5.1 Implement mouse-move handler that calculates the closest year with data using `d3.bisect` on the year domain, and expose reactive state for hovered year/value.
- [x] 5.2 Render a vertical guide line at the hovered data point X position and display year + formatted value as SVG text labels.
- [x] 5.3 Hide the guide line and labels on mouse-leave.

## 6. IndicadoresPanel integration

- [x] 6.1 In `IndicadoresPanel.vue`, add a watcher on `props.item` to fetch `GET /api/indicadores/valores?indicator_id=<id>&ine=<ine>` using `$fetch` when a new indicator is selected. Store the transformed `[{ year, value }]` in a reactive ref.
- [x] 6.2 Add `<EvolutionChart>` to the panel body, passing the fetched datapoints, ODS color, a value formatter using the indicator's `unidad`, and a reasonable size for the slideover width (e.g., 420×260).
- [x] 6.3 Show `<USkeleton>` while the time-series fetch is loading. Hide the chart section when no data is returned.
