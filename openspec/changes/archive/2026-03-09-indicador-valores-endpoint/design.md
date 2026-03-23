## Context

The app uses a read-only SQLite database (INDICADORES table with `codigo_ine`, `id_indicador`, `periodo`, `valor`, and optionally `indice`, `categoria`). Existing APIs either return ODS hierarchy for one municipio (with optional periodo) or agenda descriptivos per municipio. There is no direct “give me values for this indicator” API that supports single value, time series (all years), or cross-municipio (all municipios) in one endpoint.

## Goals / Non-Goals

**Goals:**

- Single GET endpoint to query indicator values by optional municipio (ine) and optional year.
- Support three usage modes: exact (ine + indicator_id + year), all years (ine + indicator_id), all municipios (indicator_id + year, or indicator_id only).
- Consistent JSON shape (single object when one row, array when multiple); include at least `codigo_ine`, `id_indicador`, `periodo`, `valor` and other INDICADORES columns as useful.
- Use existing `useDatabase()` and parameterized queries only; no schema changes.

**Non-Goals:**

- No authentication or rate limiting (same as rest of public API).
- No bulk “multiple indicators” in one request; one indicator_id per request.
- No changes to existing ODS or agenda endpoints.

## Decisions

- **Route path**: `GET /api/indicadores/valores` implemented as `server/api/indicadores/valores.get.ts`. Keeps “indicadores” namespace clear and separate from ODS hierarchy (`/api/ods/indicadores`).
- **Query parameters**: `indicator_id` (required), `ine` (optional), `year` (optional). Names match frontend/dev expectations; `year` maps to DB column `periodo`.
- **Response shape**: When exactly one row matches (ine + indicator_id + year), return a single JSON object. When multiple rows (all years or all municipios), return a JSON array. Clients can branch on Array.isArray(response). No envelope object to keep the API minimal.
- **404 for single-value mode**: When ine + indicator_id + year are all provided and no row exists, return 404 with a clear message. For “all years” or “all municipios” modes, return 200 with empty array when no data.
- **Ordering**: Array responses: order by `periodo` ascending, then `codigo_ine` ascending for predictable charts and exports.
- **DB**: Single table INDICADORES; no joins to METADATA for this endpoint (metadata can be fetched elsewhere if needed).

## Risks / Trade-offs

- **Large payloads**: indicator_id only (no ine, no year) can return many rows (all municipios × all years). Mitigation: document that combination; optional future limit/cursor if needed.
- **Invalid indicator_id**: Unknown id returns empty array (or 404 in single-value mode). No separate “indicator not found” vs “no data”; both are “no row”. Mitigation: document; optional future validation against METADATA if needed.
