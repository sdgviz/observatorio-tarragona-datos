# Design: Municipios list endpoint

## Context

The Nuxt app (diputacion_tarragona) uses a read-only SQLite database via `useDatabase()` and already has server routes under `server/api/` (e.g. `agenda/descriptivos.get.ts`, `ods/promedios.get.ts`). The table `REGIONES` holds municipality records with at least `codigo_ine`, `nombre`, and optionally `poblacion`, `id_poblacion`, `id_especial` (and any extra columns from regiones.csv). The data layer and performance rules already reference `GET /api/municipios/list`; this change implements that endpoint and adds optional filtering by population category (NMUN).

## Goals / Non-Goals

**Goals:**

- Expose a single GET endpoint that returns all municipalities from REGIONES with full row data.
- Support optional query parameter `NMUN` to filter by population category (`id_poblacion` in DB). If omitted, return all municipalities.
- Use parameterized queries and existing DB access patterns; no schema changes.

**Non-Goals:**

- Migrating existing frontend components from CSV to this API (can be done later).
- Adding new columns to REGIONES or changing the data pipeline.
- Pagination or sorting; the list is small (order of hundreds of rows).

## Decisions

### 1. Data source: REGIONES table

**Choice:** Read municipalities from the SQLite `REGIONES` table in the server route.

**Rationale:** REGIONES is the server-side source of truth for municipalities and already used by other API routes (e.g. agenda/descriptivos). Using it keeps a single source and allows filtering by `id_poblacion`. The CSV in `app/assets/data/municipios_tarragona.csv` is a build-time asset; the API should not depend on it.

**Alternative:** Read from a static JSON/CSV in a "municipios folder" on the server. Rejected because the project uses SQLite as the canonical data store and REGIONES already exists with the needed fields.

### 2. Query parameter name: NMUN

**Choice:** Use query parameter name `NMUN` as requested by the user. Map it to the column `id_poblacion` in REGIONES when filtering.

**Rationale:** Keeps the API contract aligned with the product naming (NMUN as category). The implementation maps `NMUN` to `WHERE id_poblacion = ?`.

### 3. Allowed NMUN values

**Choice:** Allow only values that exist in the database. Implementation can either: (a) query `SELECT DISTINCT id_poblacion FROM REGIONES WHERE id_poblacion IS NOT NULL` at startup or on first request and treat NMUN as valid only if it appears in that set, or (b) document the known categories (e.g. `<20.000`, `20.000-50.000`, `50.000-100.000`, `>100.000`) and return 400 for unknown values. Prefer (a) so the API stays in sync with the data without code changes when new categories appear.

**Rationale:** Avoids magic strings in code; invalid NMUN returns 400 with a clear message.

### 4. Response shape

**Choice:** Return a JSON array of objects, one per municipality. Each object contains all columns returned by the query (e.g. `codigo_ine`, `nombre`, `poblacion`, `id_poblacion`, `id_especial`). No wrapper object; the response body is the array.

**Rationale:** Matches "municipios y toda su info" and keeps the contract simple. Frontend can type the response as `Municipio[]` with fields matching REGIONES.

### 5. Route file location

**Choice:** `server/api/municipios/list.get.ts` so the URL is `GET /api/municipios/list`. Nitro maps nested routes to path segments.

**Rationale:** Consistent with existing `server/api/ods/promedios.get.ts` and `server/api/agenda/descriptivos.get.ts`.

## Risks / Trade-offs

- **REGIONES row count:** If REGIONES is very large in the future, returning all rows without pagination could be slow. Mitigation: current dataset is small; if needed later, add optional `limit`/`offset` or rely on caching.
- **Null id_poblacion:** Municipalities with `id_poblacion IS NULL` are excluded when NMUN is provided (they don't match any category). Mitigation: document that filtering by NMUN returns only municipalities with that category set; no change to DB required.
- **Casing/encoding of NMUN:** Values in DB might have specific formatting (e.g. `>100.000`). Use exact match; document accepted values or derive from DB to avoid 400s due to encoding/case.
