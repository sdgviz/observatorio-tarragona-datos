## 1. API route and types

- [x] 1.1 Add TypeScript type for municipio list response in diputacion_tarragona (e.g. in `app/types/` or inline) matching REGIONES columns: `codigo_ine`, `nombre`, and optional `poblacion`, `id_poblacion`, `id_especial`
- [x] 1.2 Create `server/api/municipios/list.get.ts` in diputacion_tarragona: define GET handler that uses `useDatabase()` and returns 200 with JSON array of all REGIONES rows when no query params

## 2. NMUN filter

- [x] 2.1 Parse optional query parameter `NMUN`; if present and non-empty, query `SELECT DISTINCT id_poblacion FROM REGIONES WHERE id_poblacion IS NOT NULL` (or equivalent) to obtain allowed values and return 400 with a clear message when NMUN is not in that set
- [x] 2.2 When NMUN is valid, filter REGIONES with a parameterized query `WHERE id_poblacion = ?` and return the filtered array; when NMUN is omitted, keep returning all municipalities

## 3. Verification

- [x] 3.1 Manually or via request: call `GET /api/municipios/list` and confirm response is a non-empty array with expected fields
- [x] 3.2 Call `GET /api/municipios/list?NMUN=>100.000` (or a value present in DB) and confirm filtered list; call with invalid NMUN and confirm 400
