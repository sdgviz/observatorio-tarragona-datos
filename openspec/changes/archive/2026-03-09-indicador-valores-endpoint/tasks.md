## 1. Route and validation

- [x] 1.1 Add GET route at `server/api/indicadores/valores.get.ts` in diputacion_tarragona
- [x] 1.2 Validate required query parameter `indicator_id`; return 400 with clear message when missing or empty
- [x] 1.3 Parse optional query parameters `ine` and `year` (year as integer for periodo)

## 2. Query and response logic

- [x] 2.1 When `ine` and `year` are both provided: query INDICADORES for single row (codigo_ine, id_indicador, periodo); return 200 with single JSON object or 404 when no row
- [x] 2.2 When `year` omitted: query INDICADORES for all rows matching indicator_id (and ine if provided); return 200 with JSON array ordered by periodo ASC, codigo_ine ASC
- [x] 2.3 When `ine` omitted: query INDICADORES for all rows matching indicator_id (and year if provided); return 200 with JSON array ordered by periodo ASC, codigo_ine ASC
- [x] 2.4 Ensure all SQL uses parameterized queries (bind indicator_id, ine, year); no string concatenation of user input

## 3. Response shape and edge cases

- [x] 3.1 Response objects include at least `codigo_ine`, `id_indicador`, `periodo`, `valor`; include `indice`, `categoria` from INDICADORES when present
- [x] 3.2 List mode (multiple or zero rows): always return JSON array; empty array when no rows, 200 status
- [x] 3.3 Single-value mode: return one object when exactly one row; 404 when no row (body or status message indicating no value found)
