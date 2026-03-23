# Indicador valores endpoint

## Why

The frontend and external consumers need a single, flexible API to query indicator values by municipio and/or year. Today, indicator data is only exposed in aggregate flows (e.g. ODS hierarchy with one municipio + optional periodo). A dedicated endpoint allows “one indicator, one municipio, one year” lookups as well as “all years for one municipio” or “all municipios for one year,” supporting charts, comparisons, and exports without duplicating logic.

## What Changes

- Add **GET** endpoint in `diputacion_tarragona/server/` that accepts query parameters: **ine** (código INE del municipio), **indicator_id** (código del indicador), **year** (año / periodo).
- **indicator_id** is required. **ine** and **year** are optional.
- When all three are provided: return the single indicator value for that municipio in that year (one row or 404 if none).
- **Sin año**: when **year** is omitted, return all values for the given indicator (and optionally municipio) across all years (series temporal).
- **Sin municipio**: when **ine** is omitted, return values for all municipios for the given indicator (and optionally year).
- Response: JSON with at least `codigo_ine`, `id_indicador`, `periodo` (year), `valor`, and any other useful fields from INDICADORES (e.g. `indice`, `categoria`). Structure may be a single object when exactly one result, or an array when multiple (all years or all municipios).
- Use existing read-only SQLite access (`useDatabase()`) and INDICADORES table; parameterized queries only.

## Capabilities

### New Capabilities

- **indicador-valores-api**: GET endpoint for indicator values with optional filters by municipio (ine) and year; returns one value or a list (all years or all municipios) as appropriate.

### Modified Capabilities

- None.

## Impact

- **diputacion_tarragona**: New server route under `server/api/` (exact path TBD in design, e.g. `server/api/indicadores/valores.get.ts` or similar). Uses existing `useDatabase()` and INDICADORES table. No changes to existing ODS/agenda endpoints.
- **Frontend / consumers**: Can call this API for time series (indicator + municipio, all years), cross-municipio (indicator + year, all municipios), or single value (ine + indicator_id + year).
- **Data**: No schema or pipeline changes; INDICADORES already has `codigo_ine`, `id_indicador`, `periodo`, `valor`, etc.
