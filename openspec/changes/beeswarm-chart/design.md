## Context

The home page displays a choropleth map coloring municipalities by their aggregated ODS indicator value. Below the map, a placeholder exists for a beeswarm chart that should show the distribution of individual municipality values for the selected ODS objective. The data for this chart is already fetched via `/api/ods/promedios` and available as a reactive computed `mapValues` in `index.vue`.

The project uses D3 extensively for visualizations (maps, evolution charts) within Vue components wrapped in `<ClientOnly>`. The existing `EvolutionChart.vue` establishes a pattern of receiving datapoints as props with configurable size, color, and tooltips — all rendered with computed SVG paths and D3 scales.

## Goals / Non-Goals

**Goals:**
- Create a generic, reusable `BeeswarmChart.vue` component decoupled from any specific data domain
- Use D3 force simulation (`d3-force`) for collision-free Y-axis positioning with animated entrance
- Provide tooltip on hover with datapoint details
- Support optional highlight filtering (highlighted codes stay colored, others fade to grey)
- Replace the placeholder in `index.vue` synchronized with the ODS selector

**Non-Goals:**
- Population-size scaling of dot radius (the USwitch for "population size" is a separate future feature)
- Custom dot shapes or multi-series support
- Mobile-optimized touch interactions beyond basic responsiveness
- New API endpoints — reuse existing `/api/ods/promedios` data

## Decisions

### 1. SVG rendering approach: Computed SVG in template vs. D3 DOM manipulation

**Decision**: Use a hybrid approach — D3 force simulation runs in a `watch` to compute positions, but dots are rendered declaratively via `v-for` in the template SVG. Tooltip state is managed with Vue reactivity.

**Rationale**: This matches the `EvolutionChart.vue` pattern where D3 computes data (scales, paths) but Vue owns the DOM. It avoids D3/Vue DOM conflicts, keeps reactivity working for tooltips, and is easier to maintain. The force simulation output (x, y positions per node) is stored in a reactive ref that drives the template rendering.

**Alternative considered**: Full D3 DOM manipulation in `onMounted` — rejected because it conflicts with Vue's virtual DOM and makes tooltip/highlight reactivity harder.

### 2. Force simulation strategy

**Decision**: Use `d3.forceSimulation` with:
- `forceX` set to the data-driven X position (mapped by value via a linear scale) with high strength (~1.0) to pin X precisely.
- `forceY` set to the vertical center with low strength (~0.05) for gentle centering.
- `forceCollide` with the dot radius to prevent overlap.

**Rationale**: This is the standard D3 beeswarm approach. The high X-force strength ensures dots align accurately to their value while the collision force pushes them apart vertically. The simulation runs ~120 ticks on initialization and settles quickly.

**Alternative considered**: Manual jitter or grid-based packing — rejected because D3 force gives smoother, more natural distributions and handles edge cases (many similar values) better.

### 3. Animation strategy

**Decision**: Animate dots from the vertical center (y = height/2) to their force-computed positions using CSS transitions on the `cy` attribute. The simulation is pre-computed (ticked to completion), then positions are applied with a staggered delay.

**Rationale**: Pre-computing avoids the visual jitter of a live simulation. CSS transitions on SVG attributes are well-supported and simpler than D3 transitions in a Vue context. Staggering creates a pleasant "spreading" effect.

### 4. Tooltip implementation

**Decision**: Use a custom HTML tooltip div absolutely positioned relative to the chart container, shown/hidden via Vue's reactive state (`hoveredPoint` ref). No external library.

**Rationale**: Consistent with the project's existing tooltip pattern in `EvolutionChart.vue`. An HTML tooltip (vs SVG `<title>`) allows rich formatting and styling with Tailwind classes.

### 5. Highlights (optional prop)

**Decision**: When a `highlights` array of codes is provided, non-matching dots render with `opacity: 0.2` and a grey fill (`#d4d4d8`). Highlighted dots keep the configured color at full opacity.

**Rationale**: Simple CSS opacity change is performant and visually clear. Grey matches the zinc palette used throughout the project.

## Risks / Trade-offs

- **[Performance with many dots]** → The province has ~180+ municipalities. Force simulation with ~200 nodes is fast (<50ms). If data grows, we can increase tick count or reduce simulation iterations.
- **[Force simulation re-run on data change]** → When the ODS objective changes, the simulation must re-run. Using `watch` on the datapoints prop with a debounce ensures this doesn't fire excessively.
- **[SVG vs Canvas]** → SVG limits scalability to ~1000 dots. For this use case (municipalities = ~180), SVG is ideal and supports per-element hover events natively.
