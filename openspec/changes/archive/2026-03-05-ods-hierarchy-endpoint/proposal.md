## Why

There is no endpoint that returns the full ODS indicator hierarchy for a municipality. The existing `/api/ods/promedios` only returns aggregated averages per ODS objective, without detail on individual indicators, their values, or their metadata. The frontend needs a structured response that organizes indicators by ODS objective and meta, including all indicator metadata, to render detailed municipality-level ODS dashboards.

## What Changes

- New API endpoint `GET /api/ods/indicadores` that returns the ODS hierarchy for a given municipality (`codigo_ine`), structured as: Objetivo -> Metas -> Indicadores.
- Supports optional `objetivo` parameter to filter to a single ODS (1-17); without it, returns all 17.
- Supports optional `periodo` parameter to filter by year; defaults to the most recent period available per indicator.
- Supports `lang` parameter (`es`/`ca`) to select the language for names and descriptions; defaults to `es`.
- Each indicator includes its value, index, category, and full metadata from `METADATA` + `METADATA_ES`/`METADATA_CAT`.
- An indicator that belongs to multiple ODS objectives (via `ARQUITECTURA_L2`) appears under each one.

## Capabilities

### New Capabilities
- `ods-hierarchy-api`: API endpoint that returns nested ODS objective -> meta -> indicator hierarchy for a municipality, with filtering by objective, period, and language support.

### Modified Capabilities

_(none — this is a new read-only endpoint that queries existing tables without modifying schemas or transforms)_

## Impact

- **New file**: `server/api/ods/indicadores.get.ts` in the `diputacion_tarragona` project.
- **Database**: Read-only queries against existing tables: `INDICADORES`, `METADATA`, `METADATA_ES`, `METADATA_CAT`, `DICCIONARIO`, `DICCIONARIO_ES`, `DICCIONARIO_CAT`, `ARQUITECTURA_L2`, `REGIONES`.
- **No schema changes**: All required data is already in the database.
- **No transform changes**: The hierarchy is constructed at query time from `ARQUITECTURA_L2` + `DICCIONARIO`.
- **No frontend changes** in this change (consumer components are a separate concern).
