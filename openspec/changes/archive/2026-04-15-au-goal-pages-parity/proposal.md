## Why

Agenda Urbana (AUE) already has home-map behaviour and municipio-level views, but there is no equivalent to the ODS “goal hub” experience: a header menu of objectives and dedicated routes with map plus per-indicator beeswarms. Users who work in AU mode need the same exploration pattern, restricted to municipalities that participate in the Agenda Urbana (`id_especial3 === "aue"`), with the map focused on that subset instead of the full province.

## What Changes

- Add a header navigation control for the **10 Agenda Urbana objectives**, parallel to the existing ODS goals dropdown, wired to new routes under `pages/au/`.
- Add **dynamic pages** `/au/1` … `/au/10` (plus a sensible `/au` hub) that mirror `pages/ods/[objetivo].vue`: aggregate choropleth from AU promedios, indicator selector, beeswarms per indicator, cross-highlight with the map, and “explore municipio” using the current visualization mode.
- **Restrict data and map interaction** to AUE municipalities: beeswarm and map values only for those INEs; map uses the same “zoomed / emphasized” treatment as the home page in AU mode (non-AUE municipalities not shown as interactive targets and not part of the focused viewport).
- Add a **catalog API** for AU objective indicators (list of indicator ids under each AUE objective), analogous to `GET /api/ods/objetivo-indicadores`, so the AU goal pages can build the layer list without duplicating SQL in the client.
- Extend **mode-aware navigation** so switching ODS ↔ AU while on a goal page maps `/ods/{n}` ↔ `/au/{n}` when `n` is valid in both taxonomies (1–10), and goal pages set the visualization store mode on mount.

## Capabilities

### New Capabilities

- `header-au-goals-menu`: Header dropdown for the 10 AU objectives (colors and labels from shared config), navigation to `/au/{n}`, trigger reflects active AU goal route; coordinated with visualization mode so the AU menu is the primary goal picker in AU mode.
- `au-goal-pages`: Routes, data fetching, map + beeswarm UX parity with ODS goal pages, scoped to AUE municipios and AUE map viewport behaviour.

### Modified Capabilities

- `mode-aware-navigation`: When the user toggles ODS/AU on a **goal** route (`/ods/{n}` or `/au/{n}`), navigate to the equivalent route for the same objective number when both modes support that number (1–10). AU and ODS goal detail pages SHALL set `visualizationStore` mode on mount so the header toggle and menus stay consistent.

## Impact

- **App repo** (`diputacion_tarragona`): `AppHeader.vue`, new `app/pages/au/` routes, possible shared extraction or duplication from `pages/ods/[objetivo].vue`, `MapTarragona` / `MapWrapper` props for AUE-only mode (reuse patterns from `pages/index.vue`), i18n (`ca.json`, `es.json`), `nuxt.config` prerender entries for `/au` and `/au/1` … `/au/10`.
- **New server route**: `GET /api/au/objetivo-indicadores` (or equivalent name) mirroring the ODS catalog endpoint for objectives 1–10.
- **Data repo**: OpenSpec only for this change; no CSV/SQL pipeline change required if `REGIONES.id_especial3` and existing `PROMEDIOS_AGENDAS` / metadata already support the queries.
