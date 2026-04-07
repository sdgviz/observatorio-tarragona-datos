## 1. BeeswarmChart Component — Scaffold and Props

- [x] 1.1 Create `app/components/BeeswarmChart.vue` with `<script setup lang="ts">`, typed props interface (`datapoints`, `color`, `width`, `height`, `domain`, `highlights`), and default values (480x320, primary color)
- [x] 1.2 Add the `<ClientOnly>` template wrapper with `<USkeleton>` fallback and an empty `<svg>` with correct viewBox/dimensions bound to props

## 2. D3 Scale and Axis

- [x] 2.1 Implement the X scale (`scaleLinear`) computed from `domain` prop or auto-derived from min/max of datapoint values; define chart padding constants
- [x] 2.2 Render the X axis at the bottom of the SVG with tick labels and the unit label at the right end (using the first datapoint's `unidad`)

## 3. Force Simulation and Dot Positioning

- [x] 3.1 Implement the D3 force simulation (`forceSimulation` + `forceX` + `forceY` + `forceCollide`) inside a `watch` on `datapoints`; pre-tick the simulation to completion and store computed node positions in a reactive ref
- [x] 3.2 Render dots via `v-for` over computed positions as `<circle>` elements with `cx`/`cy` bound to simulation output

## 4. Animation

- [x] 4.1 Add CSS transitions on the `<circle>` elements (`cy` property) so dots animate from the vertical center to their force-computed Y position on mount and data changes
- [x] 4.2 Add staggered `transition-delay` per dot (based on index) for a spreading entrance effect

## 5. Tooltip

- [x] 5.1 Add a `hoveredPoint` reactive ref tracking the currently hovered datapoint; attach `@mouseenter` / `@mouseleave` events on each `<circle>`
- [x] 5.2 Render a positioned HTML tooltip div (absolute over the SVG container) showing the municipality name, formatted value, and unit when `hoveredPoint` is set

## 6. Highlight Filtering

- [x] 6.1 Implement the `highlights` prop logic: compute per-dot fill color and opacity based on whether `codigoIne` is in the highlights list (full color) or not (grey `#d4d4d8`, opacity 0.2); when highlights is empty/undefined, all dots use configured color

## 7. Home Page Integration

- [x] 7.1 In `app/pages/index.vue`, transform the existing `promedios` data into the `BeeswarmDatapoint[]` format expected by the component (map `codigo_ine` → `codigoIne`, add `nombre` from municipios data, include `unidad` and `valor`)
- [x] 7.2 Replace the beeswarm placeholder div (lines 119-132) with `<BeeswarmChart>` passing the transformed datapoints, the `selectedOdsColor` as `color`, and appropriate dimensions
- [x] 7.3 Add any missing i18n keys to both `ca.json` and `es.json` locale files for tooltip or axis labels

## 8. Verification

- [x] 8.1 Verify the chart renders correctly with the ODS selector — changing ODS should update both the map and the beeswarm chart with matching data
- [x] 8.2 Verify tooltip appears on hover with correct municipality name and value
- [x] 8.3 Verify animation plays on initial load and on ODS change
- [x] 8.4 Verify the chart renders the SSR skeleton fallback and hydrates correctly
