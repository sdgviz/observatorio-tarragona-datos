## Why

The map on the homepage currently renders mock data (hash-based colors per municipality). The ODS selector UI is a placeholder with no real data behind it. The SQLite database with real ODS indicators, objectives, and averages per municipality already exists in the data pipeline (`diputacion_tarragona_data`), but the Nuxt app has no backend API or data layer to consume it. This change wires the map to display real ODS objective averages by municipality, making the homepage functional.

## What Changes

- A new **ODS selector component** that lets users pick an ODS objective (1–17) and renders each option with its official icon and color from the existing `ods_list` config.
- A new **Nuxt server API layer** (`server/api/`) that reads ODS data from the SQLite database at build time. The API provides aggregated ODS objective averages per municipality for a given objective.
- The **MapWrapper component** is refactored so it no longer generates mock `mapValues`. Instead, it receives processed data from its parent and passes it to `MapTarragona`.
- The **homepage (`index.vue`)** orchestrates data flow: it calls the API based on the selected ODS objective and feeds the resulting municipality-to-value mapping into MapWrapper.
- The data architecture is designed so that an **Agenda Urbana selector** can be added in the future with the same data flow pattern.

## Capabilities

### New Capabilities
- `ods-selector`: A standalone Vue component for selecting an ODS objective (1–17), displaying icons, names, and colors. Designed to be extensible for future Agenda Urbana selection.
- `ods-api`: Nuxt server API endpoints that read from the SQLite database and return ODS objective averages per municipality. Uses `better-sqlite3` which is already a project dependency.
- `map-data-integration`: Refactored data flow where the homepage orchestrates fetching ODS data from the API and passing processed municipality values to the map components.

### Modified Capabilities

_None — existing specs cover the data pipeline only, not the Nuxt app frontend or backend._

## Impact

- **New files**: `server/api/ods/[objective].get.ts` (or similar), `app/components/OdsSelector.vue`, possibly a composable for data fetching.
- **Modified files**: `app/pages/index.vue`, `app/components/MapWrapper.vue`.
- **Dependencies**: `better-sqlite3` is already in `package.json`. The SQLite database file (`diputacion_tarragona.db`) needs to be accessible to the Nuxt server at build/runtime — a path configuration may be needed.
- **Database**: Read-only access to `PROMEDIOS_ODS`, `DICCIONARIO`, `DICCIONARIO_ES`, and `REGIONES` tables.
- **Build**: Since the project targets static generation, the API routes will be called at build time via `useFetch`/`useAsyncData` and the results will be prerendered.
