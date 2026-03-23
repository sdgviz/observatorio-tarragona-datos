## 1. Extract existing list view

- [x] 1.1 Create `app/components/municipio/ods/IndicadoresListView.vue` — move the flat-list markup and row-click logic from `IndicadoresView.vue` into this new component. Accept `sortedItems`, `codigoIne` as props; emit `open-panel` when a row is clicked.
- [x] 1.2 Refactor `IndicadoresView.vue` to import and render `IndicadoresListView` instead of the inline list markup. Verify the list view renders identically.

## 2. Add view-mode toggle

- [x] 2.1 Add a `viewMode` ref (`'list' | 'dashboard'`) and a `UTabs` (or similar toggle) to `IndicadoresView.vue` in the toolbar row, next to the ODS multi-select and sort controls. Default to `'list'`.
- [x] 2.2 Conditionally render `IndicadoresListView` when `viewMode === 'list'` and the new `IndicadoresDashboardView` (placeholder for now) when `viewMode === 'dashboard'`.

## 3. Create BAN card component

- [x] 3.1 Create `app/components/municipio/ods/IndicadorBanCard.vue`. Accept props: indicator name, ODS number, value, unit, period. Render a card with the value as a large formatted number, unit, period, ODS badge, and indicator name.

## 4. Create Evolution card component

- [x] 4.1 Create `app/components/municipio/ods/IndicadorEvolutionCard.vue`. Accept props: indicator name, ODS number, ODS color, datapoints array, latest value, unit. Render a card with the indicator name, ODS badge, latest value next to the title, and an inline `EvolutionChart` filling the card width (~200px height).
- [x] 4.2 Handle responsive chart width — use a container ref and `ResizeObserver` (or let the chart auto-fill) to pass the correct width to `EvolutionChart`.

## 5. Create Dashboard view component

- [x] 5.1 Create `app/components/municipio/ods/IndicadoresDashboardView.vue`. Accept `sortedItems` (same flat items as list view) and `codigoIne` as props.
- [x] 5.2 Implement time-series data fetching: on mount and when `sortedItems` changes, fetch `/api/indicadores/valores` for each indicator with concurrency control (max 5–6 parallel). Store results in a reactive `Map<string, EvolutionDatapoint[]>`.
- [x] 5.3 Implement the CSS grid layout (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`). For each indicator, determine visualization type (`getVisualizationType`): `'evolution'` if >1 datapoints, `'ban'` if exactly 1, `'empty'` if 0.
- [x] 5.4 Render the appropriate sub-component per indicator: `IndicadorEvolutionCard`, `IndicadorBanCard`, or an empty-state placeholder card.
- [x] 5.5 Add skeleton cards (with fixed height matching real cards) shown while data is loading per indicator.
- [x] 5.6 Implement data caching: when ODS filter/sort changes, reuse already-fetched data and only fetch data for newly visible indicators.

## 6. Wire up and integration

- [x] 6.1 In `IndicadoresView.vue`, pass `sortedItems` and `codigoIne` to `IndicadoresDashboardView` when dashboard mode is active.
- [x] 6.2 Verify that ODS filter changes and sort changes work correctly in both view modes.
- [x] 6.3 Verify the slide-over panel still works from the list view after refactoring.
