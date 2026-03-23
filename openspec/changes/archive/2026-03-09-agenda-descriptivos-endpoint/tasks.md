## 1. Types and endpoint skeleton

- [x] 1.1 Add shared types in `app/types/agenda.ts`: `DescriptivosResponse`, `DescriptivoIndicador` (id_indicador, nombre, unidad, aue1, valor_referencia, periodo_referencia, valor_actual, periodo_actual, thr, plus optional umbral).
- [x] 1.2 Create `server/api/agenda/descriptivos.get.ts` in `diputacion_tarragona`: validate `codigo_ine` (required), `ano_referencia` and `ano` (optional integers). Return 400 for missing codigo_ine, 404 if municipality not in REGIONES.

## 2. Data queries

- [x] 2.1 Query REGIONES to validate codigo_ine and get nombre_municipio.
- [x] 2.2 Query INDICADORES_DESCRIPTIVOS for the given codigo_ine; restrict to indicators that have METADATA.tipo = 'descriptivo'. For each (id_indicador, codigo_ine) determine first and last periodo, and resolve valor_referencia/periodo_referencia (from ano_referencia or MIN(periodo)) and valor_actual/periodo_actual (from ano or MAX(periodo)).
- [x] 2.3 Join METADATA and METADATA_ES to get nombre and unidad for each descriptive indicator.
- [x] 2.4 Query ARQUITECTURA_L2 for parents matching AUE-1 through AUE-10 where child is the indicator id; build aue1 as array of numeric dimensions (1–10) per indicator.

## 3. Response assembly and THR

- [x] 3.1 For each indicator, add synthetic `thr`: one of "1Q", "2Q", "3Q", "4Q" (deterministic from id_indicador so same indicator gets same THR in one response).
- [x] 3.2 Assemble and return the JSON response typed as DescriptivosResponse. Include optional `umbral` from INDICADORES_DESCRIPTIVOS when present.

## 4. Verification

- [x] 4.1 Call the endpoint with a valid codigo_ine and verify structure (valor_referencia, valor_actual, aue1, nombre, unidad, thr). Test with and without ano_referencia/ano.
- [x] 4.2 Test 400 (missing codigo_ine) and 404 (invalid codigo_ine).
