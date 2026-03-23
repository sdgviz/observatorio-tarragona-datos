## 1. Endpoint implementation

- [x] 1.1 Create `server/api/ods/indicadores.get.ts` in the `diputacion_tarragona` project with the event handler skeleton: parse and validate query parameters (`codigo_ine` required, `objetivo` optional 1-17, `periodo` optional integer, `lang` optional `es`|`ca` defaulting to `es`). Return 400 for missing/invalid params.
- [x] 1.2 Query `REGIONES` to validate `codigo_ine` exists. Return 404 if not found. Extract `nombre` for the response.
- [x] 1.3 Query `DICCIONARIO` + translation table (ES or CAT based on `lang`) to get ODS objectives (nivel 1, agenda '2030') and metas (nivel 2). Filter by objetivo if parameter is provided.
- [x] 1.4 Query `ARQUITECTURA_L2` to get all indicator-to-meta mappings where parent starts with `2030-`. Build a map of meta_id -> indicator_ids[].
- [x] 1.5 Query `INDICADORES` for the given `codigo_ine`. Apply period filtering: if `periodo` is specified, filter to that period; otherwise select the row with MAX(periodo) per id_indicador using a subquery.
- [x] 1.6 Query `METADATA` + translation table (ES or CAT with COALESCE fallback to ES) for all indicators found. Build a metadata map by id_indicador.
- [x] 1.7 Assemble the response: iterate objectives -> metas -> indicators, linking values + metadata. Omit objectives and metas with no indicators. Return the JSON response.

## 2. Verification

- [x] 2.1 Start the dev server and test the endpoint with a valid `codigo_ine` (e.g., one from the database). Verify the response structure matches the design (nested objetivos -> metas -> indicadores).
- [x] 2.2 Test parameter validation: missing `codigo_ine` (400), invalid `codigo_ine` (404), invalid `objetivo` (400), `objetivo` filter works, `periodo` filter works.
- [x] 2.3 Verify a multi-ODS indicator (e.g., indicator 54 linked to ODS 5 and 8) appears under both objectives.
