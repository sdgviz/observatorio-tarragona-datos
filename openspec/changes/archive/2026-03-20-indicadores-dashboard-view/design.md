## Context

The municipio ODS page (`/municipios/ods/[ine]`) has an "Indicadores" tab that renders `IndicadoresView.vue`. This component shows a flat list where each row displays the indicator name, ODS badge, and latest value. Clicking a row opens a `USlideover` panel (`IndicadoresPanel.vue`) that fetches and shows the evolution chart plus metadata.

The ODS hierarchy data is already fetched once at the page level via `useAsyncData` and passed down as props. Per-indicator time-series data is fetched on demand from `/api/indicadores/valores?indicator_id=X&ine=Y`.

The project uses Nuxt 4, Vue 3 Composition API, Nuxt UI 4 components, Tailwind CSS, and D3-based `EvolutionChart.vue` wrapped in `<ClientOnly>`.

## Goals / Non-Goals

**Goals:**
- Provide a dashboard grid view where users can scan indicator trends without clicking into each one.
- Support two visualization types per indicator card: evolution chart (multi-datapoint) and BAN number (single datapoint).
- Keep the existing list view intact and accessible via a view-mode toggle.
- Make the architecture extensible for future card types (gauges, sparklines, etc.).
- Manage concurrent API calls gracefully to avoid overwhelming the server.

**Non-Goals:**
- Redesigning the list view or the slide-over panel.
- Adding new API endpoints — the existing `/api/indicadores/valores` is sufficient.
- Implementing pagination or virtual scrolling for the dashboard (typical indicator counts per municipio are ~50–100, manageable in a grid).
- Using `UPageGrid` — plain Tailwind CSS Grid is lighter, avoids coupling to a Nuxt UI layout component, and gives us full control over responsive breakpoints.

## Decisions

### 1. View-mode toggle via `UTabs` inside `IndicadoresView`

**Choice**: Add a small `UTabs` with two items ("Lista" / "Dashboard") at the toolbar level inside `IndicadoresView.vue`, next to the existing ODS multi-select and sort controls.

**Why over alternatives**:
- A segmented control (`UButtonGroup`) was considered but `UTabs` is already used on this page for the parent ODS/Indicadores/Presupuestos switch, so it keeps visual consistency. Using `variant="pill"` or `size="xs"` differentiates it from the parent tabs.
- The toggle state is component-local (a `ref`), not persisted in URL or store — it's a view preference, not navigation.

### 2. Extract list view into `IndicadoresListView.vue`

**Choice**: Move the existing list markup from `IndicadoresView.vue` into a new `app/components/municipio/ods/IndicadoresListView.vue`. The parent `IndicadoresView` becomes a thin orchestrator that owns the data, filters, sort, and view-mode state, and renders either the list or dashboard sub-component.

**Why**: Keeps each view focused and testable. The list component receives the sorted/filtered items as props — no data logic duplication.

### 3. Dashboard grid layout with Tailwind CSS Grid

**Choice**: Use a CSS grid with `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` and `gap-6`. Each card is a `<div>` with consistent height constraints.

**Why over `UPageGrid`**: `UPageGrid` is designed for marketing/page-card layouts with fixed breakpoints (`sm:grid-cols-2 lg:grid-cols-3`). Our needs are simpler, and we avoid an extra component layer. If design changes later require bento-style `col-span` / `row-span`, Tailwind utilities handle that natively.

### 4. Per-indicator data fetching with concurrency control

**Choice**: When the dashboard view mounts, fetch evolution data for all visible (filtered) indicators using `$fetch` in an event-handler style (not `useAsyncData`, since these are conditional child fetches). Use `Promise.allSettled` with a concurrency limiter (batch of 5–6 at a time) to avoid flooding the server.

**Why**: `useAsyncData` would be called per indicator which doesn't scale. A manual fetch approach with concurrency control is more predictable. Results are stored in a reactive `Map<string, EvolutionDatapoint[]>` keyed by `id_indicador`.

### 5. Visualization type selection per indicator

**Choice**: A simple function `getVisualizationType(datapoints)` returns `'evolution'` when datapoints.length > 1, `'ban'` when exactly 1, and `'empty'` when 0. The dashboard iterates cards and renders the appropriate sub-component via `v-if`/`v-else-if`.

**Why**: This is deliberately simple and extensible — when new card types are needed (e.g., gauge for percentage-based indicators), add a new return value and a new component without changing the grid or data logic.

### 6. BAN card component

**Choice**: Create `IndicadorBanCard.vue` — a simple card showing the value in a large font, the unit below it, and the indicator name + ODS badge. No external dependencies needed.

### 7. Evolution card component

**Choice**: Create `IndicadorEvolutionCard.vue` — wraps `EvolutionChart.vue` in a card with the indicator name, ODS badge, and the latest datapoint value displayed prominently next to the title. The chart uses a compact size (e.g., width auto-filling the card, height ~200px).

## Risks / Trade-offs

- **[Many concurrent fetches]** → Mitigated by concurrency limiter (batch of 5–6). If indicator count grows very large, consider a batch API endpoint in the future.
- **[Layout shift during loading]** → Mitigated by using skeleton cards with fixed height while data loads, so the grid doesn't jump.
- **[EvolutionChart fixed-size props]** → The chart currently takes `width`/`height` as props. Inside a responsive grid card, we'll use a `ResizeObserver` or set the chart to fill its container width. This is a known pattern in the codebase (the chart already uses an SVG viewBox approach).
- **[Filter/sort changes trigger re-render]** → The fetched data is cached in the `Map` — changing ODS filter or sort order re-renders cards but doesn't re-fetch data for indicators already loaded.
