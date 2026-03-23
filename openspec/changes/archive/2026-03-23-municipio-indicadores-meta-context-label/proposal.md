## Why

In municipio **Indicadores** Lista and Dashboard, each indicator row/card repeats the **ODS goal** (objetivo, nivel 1) under the indicator name. The API already nests indicators under **metas** (targets, nivel 2) with a distinct `nombre` per meta; showing the meta gives users the correct policy target for the indicator instead of the broader goal title.

## What Changes

- Extend the **flat item** model built from `/api/ods/indicadores` so each indicator carries the **meta `nombre`** (and keeps `objetivoNum` / goal for sections, colours, and anchors).
- **Lista** (`IndicadoresListView`): secondary line under the indicator name SHALL show the **meta (target)** label (with ODS number for orientation), not the goal name alone.
- **Dashboard** (`IndicadoresDashboardView` + `IndicadorEvolutionCard` / `IndicadorBanCard` / empty card): same rule for the subtitle / context line.
- **Slide-over** (`IndicadoresPanel`): context line SHALL match the meta-based label when opening from Lista or Dashboard.
- **No API change**: `server/api/ods/indicadores.get.ts` already returns `objetivos[].metas[].nombre` and groups indicators under each meta.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `municipio-indicadores-table`: Row name column and panel context SHALL reference the hierarchy **meta** name for per-indicator context; section headings remain per **ODS goal** as today.
- `indicadores-dashboard-view`: Per-indicator cards SHALL show **meta (target)** name in the same role where the goal name appeared.

## Impact

- **Frontend** (`diputacion_tarragona`): `IndicadoresView.vue` (flattening), `IndicadoresListView.vue`, `IndicadoresDashboardView.vue`, `IndicadoresPanel.vue`, optionally `IndicadorEvolutionCard.vue` / `IndicadorBanCard.vue` if props are renamed for clarity.
- **API / data**: None.
