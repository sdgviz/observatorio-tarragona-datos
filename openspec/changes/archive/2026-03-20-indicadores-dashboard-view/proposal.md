## Why

The current Indicadores tab at the municipio ODS page (`/municipios/ods/[ine]`) presents indicators as a flat list showing only the name, ODS badge, and latest value. Users must click each indicator to open a slide-over panel to see the evolution chart or any detail. This makes it hard to scan trends across indicators at a glance. A dashboard-like view with inline evolution charts and BAN (Big Ass Number) cards will let users compare indicator trajectories without extra clicks, while keeping the compact list view available for quick scanning.

## What Changes

- Add a view-mode toggle (tabs or segmented control) inside `IndicadoresView.vue` so users can switch between "List" (current) and "Dashboard" modes.
- Extract the existing flat-list rendering into a dedicated `IndicadoresListView.vue` component.
- Create a new `IndicadoresDashboardView.vue` component that renders each indicator as a card in a CSS grid layout:
  - Indicators with **multiple datapoints** show an inline `EvolutionChart` plus the latest value/unit next to the title.
  - Indicators with **a single datapoint** display a BAN (large formatted number) card.
- Fetch the time-series data (`/api/indicadores/valores`) for all visible indicators to render evolution charts inline in the dashboard.
- The component architecture is extensible: future visualization types (gauges, sparklines, etc.) can be added as additional sub-components selected per indicator.

## Capabilities

### New Capabilities
- `indicadores-dashboard-view`: Dashboard grid view for indicators with inline evolution charts and BAN numbers, including view-mode toggling and per-indicator visualization selection logic.

### Modified Capabilities

_(none — existing list view is preserved as-is, just relocated to its own component)_

## Impact

- **Components**: `app/components/municipio/ods/IndicadoresView.vue` (refactored into wrapper with tabs), new `IndicadoresListView.vue`, new `IndicadoresDashboardView.vue`, new `IndicadorBanCard.vue`.
- **Data fetching**: Dashboard view will issue `$fetch('/api/indicadores/valores', { query: { indicator_id, ine } })` per indicator to get time-series data. Requests should be batched or lazy-loaded to avoid a burst of simultaneous fetches.
- **Existing API**: No server-side changes; the existing `/api/indicadores/valores` endpoint already supports the needed query patterns.
- **Dependencies**: No new dependencies. Uses existing `EvolutionChart.vue`, Nuxt UI `UTabs`, and CSS Grid via Tailwind utilities (no need for `UPageGrid` — plain Tailwind grid is lighter and sufficient here).
