## Why

The frontend needs to show the average index (promedio_indice) for each ODS objective and each meta alongside the indicator list, so users can compare municipality indicator values with the aggregate for that objective or meta. The data already exists in `PROMEDIOS_ODS` (id_dict, codigo_ine, valor) but the current `/api/ods/indicadores` response does not include it.

## What Changes

- Extend the response of `GET /api/ods/indicadores` so that each **objetivo** and each **meta** includes a `promedio_indice` field (number or null).
- The value SHALL come from the `PROMEDIOS_ODS` table for the same `codigo_ine` and the corresponding `id_dict` (e.g. `2030-1` for objetivo, `2030-1.1` for meta). If no row exists for that municipality and dimension, return `null`.
- No new query parameters; existing behaviour (codigo_ine, objetivo, periodo, lang) unchanged.
- **Non-breaking**: additive field only; clients that ignore it remain valid.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `ods-hierarchy-api`: Add requirement that each objetivo and each meta in the response includes `promedio_indice` (valor from PROMEDIOS_ODS for that id_dict and codigo_ine, or null).

## Impact

- **Server**: `server/api/ods/indicadores.get.ts` — query `PROMEDIOS_ODS` for the given codigo_ine and id_dicts (objectives and metas), then attach `promedio_indice` when building each objetivo and meta.
- **Types**: `app/types/ods.ts` — add `promedio_indice: number | null` to `OdsObjetivo` and `OdsMeta`.
- **Database**: read-only; no schema changes. Uses existing `PROMEDIOS_ODS.valor`.
