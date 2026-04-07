## Why

The municipio indicator detail slide-over (`IndicadoresPanel.vue`) shows evolution, índice, and metadata but no geographic context. Users comparing an indicator across neighbours need to see how the **same comarca** (`id_especial` in `REGIONES`) performs on that indicator while still seeing the **full provincial** outline. Embedding a reduced map avoids reusing `MapTarragona.vue`’s large layout, zoom animations, and complexity.

## What Changes

- Add a **small, dedicated map component** (not a slimmed copy of all `MapTarragona` behaviour): full province GeoJSON, **choropleth only for municipalities sharing the current municipio’s `id_especial`**, others neutral/low-emphasis fill.
- Colour fills from the **same indicator** as the open panel row, using the **same colour-scale strategy** as the home / ODS goal maps (`hsl` of ODS colour, `interpolateHsl`, five-stop `scaleLinear` domain from value min/max — as in `app/pages/index.vue` and related views).
- **Basic interactivity** only: hover tooltip (name + value), optional click emit; **no** long `easeCubicInOut` viewBox animation or selection zoom behaviour from `MapTarragona`.
- **Data**: efficient server support to return latest values for one `indicator_id` across all INEs in a given `id_especial` (single query preferred over per-municipio client fan-out).
- **Wiring**: pass `id_especial` from the municipio ODS page header into `IndicadoresView` / `IndicadoresPanel` (and any other parent that renders the panel, e.g. chart view) so the panel does not depend on an extra header round-trip when the page already has it.

## Capabilities

### New Capabilities

- `indicadores-panel-comarca-mini-map`: Mini provincial map inside the indicator slide-over; comarca-only choropleth for the active indicator; shared ODS-based scale strategy; lightweight SVG map component and backing API.

### Modified Capabilities

- (none) — existing table/dashboard specs already require opening the slide-over; this change adds content inside the panel without altering those entry requirements.

## Impact

- **Frontend** (`diputacion_tarragona`): new map component under `app/components/municipio/ods/` (or `app/components/`), `IndicadoresPanel.vue`, `IndicadoresView.vue`, `IndicadoresChart.vue`, `app/pages/municipios/ods/[ine].vue` (prop drilling for `id_especial`).
- **Backend** (`diputacion_tarragona`): new or extended `server/api/indicadores/*.get.ts` (read-only SQLite) returning `{ codigo_ine, valor }[]` filtered by `id_especial` + `indicator_id` for the latest period semantics aligned with existing indicator value APIs.
- **Specs**: new `openspec/specs/indicadores-panel-comarca-mini-map/spec.md` after this change is applied (delta tracked in this change folder).
