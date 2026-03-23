# Municipios list endpoint

## Why

The frontend needs a single API to obtain the full list of municipalities (and their metadata) instead of relying on static CSV imports. This enables consistent filtering by population category (NMUN) and a single source of truth from the server database. The existing references to `/api/municipios/list` in the data layer and performance rules assume this endpoint; implementing it completes the contract.

## What Changes

- Add **GET /api/municipios/list** that returns all municipalities with their full info from the server data source (REGIONES table in SQLite).
- Optional query parameter **NMUN**: when present, filter results to municipalities whose population category matches the given value. When omitted, return all municipalities.
- Response: JSON array of municipality objects with all available fields (e.g. `codigo_ine`, `nombre`, `poblacion`, `id_poblacion`, `id_especial`, and any other columns present in REGIONES).
- Population categories (NMUN) must match the values stored in the database (e.g. `<20.000`, `20.000-50.000`, `50.000-100.000`, `>100.000`). The implementation will validate allowed values against distinct `id_poblacion` in REGIONES or a documented allowlist derived from the data.

## Capabilities

### New Capabilities

- **municipios-list-api**: GET /api/municipios/list with optional NMUN filter; returns list of municipalities with full info from REGIONES.

### Modified Capabilities

- None.

## Impact

- **diputacion_tarragona**: New server route `server/api/municipios/list.get.ts`; uses existing `useDatabase()` and REGIONES table. No changes to existing API routes.
- **Frontend**: Can switch from static CSV import to `useFetch('/api/municipios/list')` where a dynamic list is needed (e.g. MunicipiosPickerModal, map, etc.); migration of consumers is out of scope for this change but the endpoint will be ready.
- **Data**: No schema or transform changes; REGIONES already has `id_poblacion` (population category). Values to support for NMUN will be confirmed from the database or regiones source (e.g. `<20.000`, `20.000-50.000`, `50.000-100.000`, `>100.000`).
