## 1. Types

- [x] 1.1 In `app/types/ods.ts`, add `promedio_indice: number | null` to the `OdsObjetivo` and `OdsMeta` interfaces.

## 2. Endpoint

- [x] 2.1 In `server/api/ods/indicadores.get.ts`, after building the list of objective and meta id_dicts that will appear in the response, query `PROMEDIOS_ODS` for the given `codigo_ine` and those `id_dict` values. Apply the same period logic as the rest of the handler (optional `periodo` or latest). Build a map `id_dict -> valor` (or null).
- [x] 2.2 When assembling each objetivo and each meta, set `promedio_indice` from that map (or null if missing).

## 3. Verification

- [x] 3.1 Call the endpoint with a valid `codigo_ine` and verify that objetivos and metas include `promedio_indice` (number or null) as appropriate.
