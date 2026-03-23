## Why

The frontend needs to render tables and charts of descriptive indicators per municipality (e.g. "Año base" vs "Actualizado", filter by strategic objectives, range/THR visualization). There is no API that returns descriptive indicators with reference-year and current-year values, metadata (name, unit, AUE1 category), and a placeholder for the future THR (threshold) field. This endpoint fills that gap in the same way `/api/ods/indicadores` serves ODS hierarchy data.

## What Changes

- New API endpoint `GET /api/agenda/descriptivos` that returns descriptive indicators for a given municipality, suitable for charts and tables (e.g. base year vs updated year, filter by AUE objective).
- **Input**: `codigo_ine` (required), `year_reference` (optional), `year` (optional). Missing year params default to first/last available period per indicator.
- **Output**: For each descriptive indicator: value at reference year (or first available), value at requested year (or last available), metadata (aue1 1–9 or 1–10 from agenda, nombre, unidad), and a temporary **THR** field.
- **THR**: The database does not yet have a THR column. Until a future update, the endpoint SHALL return a random value from the set `["1Q", "2Q", "3Q", "4Q"]` (or alternatively `["BAJO", "MEDIO BAJO", "MEDIO ALTO", "ALTO"]`). This allows the UI to display range/position controls without schema changes.
- Single-level hierarchy: indicators are grouped or tagged by primary urban agenda objective (AUE1), not a deep tree like ODS.

## Capabilities

### New Capabilities
- `agenda-descriptivos-api`: API endpoint that returns descriptive indicators for a municipality with reference/year values, metadata (aue1, nombre, unidad), and placeholder THR.

### Modified Capabilities

_(none)_

## Impact

- **New file**: `server/api/agenda/descriptivos.get.ts` in the `diputacion_tarragona` project.
- **Database**: Read-only queries against `INDICADORES_DESCRIPTIVOS`, `METADATA`, `METADATA_ES`, `ARQUITECTURA_L2`, `DICCIONARIO`, `REGIONES`. AUE1 is derived from `ARQUITECTURA_L2` (parent like `AUE-1` … `AUE-9` or `AUE-10`).
- **Optional**: Shared types in `app/types/agenda.ts` for the response (client and server).
- No schema or transform changes in this change; THR remains synthetic until a later DB update.
