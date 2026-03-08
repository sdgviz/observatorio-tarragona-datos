## Context

The Nuxt 4 app (`diputacion_tarragona`) has a D3-based SVG map of Tarragona municipalities that currently renders mock data (hash-based colors). A placeholder ODS selector (17 gray squares) exists on the homepage. The real ODS data lives in a SQLite database (`diputacion_tarragona.db`) built by the data pipeline in `diputacion_tarragona_data`. The `PROMEDIOS_ODS` table contains pre-aggregated objective averages per municipality — exactly what the map needs.

The app already has `better-sqlite3` as a dependency, a `VisualizationMode` enum (ODS/AU) in a Pinia store, and the homepage is configured for prerendering. No `server/` directory or API routes exist yet.

## Goals / Non-Goals

**Goals:**
- Wire the map to display real ODS objective averages per municipality, colored by a meaningful scale.
- Create an ODS selector component that lets users pick one of the 17 objectives.
- Create Nuxt server API routes that read from SQLite and return structured data.
- Architect the data flow so the map component remains a pure rendering layer (receives data, does not fetch).
- Design the API and component structure so Agenda Urbana can be added later with minimal changes.

**Non-Goals:**
- Implementing the Agenda Urbana data flow (future work).
- Building indicator detail pages or municipality pages.
- Modifying the data pipeline or database schema.
- Supporting runtime database access in production — static generation prerendering is the target.
- The beeswarm chart below the map.

## Decisions

### 1. API architecture: Nuxt server routes with `better-sqlite3`

**Decision**: Create Nitro server API routes under `server/api/` that open the SQLite database and query `PROMEDIOS_ODS`.

**Rationale**: Nuxt 4 uses Nitro as its server engine. Server routes are the idiomatic way to serve data. Since the target is static generation (`prerender: true`), these routes are called only at build time — the SQLite file just needs to be available during `nuxt generate`. No external API server or ORM is needed.

**Alternatives considered**:
- *Direct import of JSON from the data repo*: Would require an extra build step and cross-repo coupling. The DB is the source of truth.
- *GraphQL or REST framework*: Overkill for a read-only, build-time-only use case.
- *Importing the DB in components via Vite plugin*: Not possible — `better-sqlite3` is a native module that only runs server-side.

### 2. Database path configuration

**Decision**: Configure the SQLite database path via an environment variable (`DATABASE_PATH`) with a sensible default pointing to `../diputacion_tarragona_data/output/diputacion_tarragona.db` (relative to the app root).

**Rationale**: Both repos are sibling directories in the workspace. An env var allows overriding for CI/CD or different directory layouts. A `server/utils/db.ts` utility will handle opening the connection and be reusable across all API routes.

### 3. API endpoint design

**Decision**: A single endpoint `GET /api/ods/promedios?objetivo={1-17}` that returns an array of `{ codigo_ine, valor, n_indicadores }` objects for all municipalities.

**Rationale**: The map needs one value per municipality for a given objective. Returning a flat array keeps the response small and easy to transform into a `Record<string, number>` on the client. The query parameter approach is cleaner than dynamic routes for a single filter dimension. Adding a future `/api/agendas/promedios` endpoint follows the same pattern.

**Query**: 
```sql
SELECT p.codigo_ine, p.valor, p.n_indicadores
FROM PROMEDIOS_ODS p
WHERE p.ods_objetivo = ?
```

The `ods_objetivo` column stores values like `2030-1`, `2030-2`, ..., `2030-17`. The endpoint maps the numeric input (1–17) to this format.

### 4. ODS selector as standalone component

**Decision**: Create `OdsSelector.vue` that emits the selected objective number. It uses the existing `ods_list` from `config.js` for names, colors, and icons (SVGs from `public/svg_ods/`).

**Rationale**: The Figma design shows a row of 17 colored squares. Keeping the selector as a standalone component with a `v-model` pattern makes it reusable and testable. The component does not fetch data — it only communicates the user's selection.

### 5. Data flow: top-down from index.vue

**Decision**: `index.vue` owns the state (selected objective) and the data fetch. It uses `useFetch` or `useAsyncData` to call the API, transforms the response into `Record<string, number>`, and passes it to `MapWrapper` as a prop.

**Rationale**: This follows the unidirectional data flow principle. `MapWrapper` and `MapTarragona` stay pure — they receive values and a color scale, nothing more. This makes the map components reusable for Agenda Urbana data in the future.

**Flow**:
```
index.vue
  ├── OdsSelector (emits selected objective)
  ├── useFetch('/api/ods/promedios?objetivo=N')
  └── MapWrapper(:values :color-scale)
        └── MapTarragona(:values :color-scale :zoom-region)
```

### 6. Color scale: ODS-themed continuous scale

**Decision**: Use a sequential color scale based on the selected ODS objective's official color. D3 `scaleLinear` maps the `valor` range (0–100, as these are index averages) from white to the ODS color.

**Rationale**: Each ODS has an official color (already in `ods_list`). Using it for the map creates a visual link between the selector and the choropleth. The legend updates dynamically to show the scale.

### 7. MapWrapper refactoring

**Decision**: Convert `MapWrapper` from a self-contained component (that generates its own data) to a component that receives `values` and `colorScale` as props. Remove the `hashValue` mock logic and CSV import.

**Rationale**: The TODO explicitly states "the map component should not request data from the backend, it should only receive already-processed data." The zoom controls and legend remain inside `MapWrapper`.

## Risks / Trade-offs

- **[DB file availability at build time]** → The SQLite file must be present when running `nuxt generate`. Mitigation: document the required `DATABASE_PATH` env var and add a startup check in `server/utils/db.ts` that logs a clear error if the file is missing.
- **[Cross-repo dependency]** → The app repo depends on the data repo's output. Mitigation: this is inherent to the architecture. The env var and a README note make it explicit.
- **[Static generation with dynamic selector]** → With prerendering, only the default ODS objective data will be embedded in the HTML. Client-side navigation to other objectives triggers a fetch to the prerendered API JSON. Mitigation: use `useFetch` with a reactive key so Nuxt generates all 17 variants at build time (configure `routeRules` or use `prerenderRoutes`).
- **[Scale domain assumptions]** → Using 0–100 assumes `valor` in `PROMEDIOS_ODS` is normalized. If it isn't, the scale will be off. Mitigation: validate actual data range before hardcoding; consider computing min/max from the response.
