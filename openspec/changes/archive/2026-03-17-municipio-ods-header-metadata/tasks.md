## 1. Backend: Municipio header API

- [x] 1.1 Add server route `GET /api/municipios/[ine]/header` (e.g. `server/api/municipios/[ine]/header.get.ts`) that reads codigo_ine from route params
- [x] 1.2 Query REGIONES by codigo_ine; return 404 if not found; otherwise include poblacion and id_especial in response
- [x] 1.3 For indicator id 48: query INDICADORES for that codigo_ine and id_indicador = '48', take row with MAX(periodo); join METADATA/METADATA_ES for nombre and unidad; add indicador_48 (or equivalent) to response; use parameterized queries only
- [x] 1.4 Validate path param (ine required, non-empty); return 400 when invalid
- [x] 1.5 Define TypeScript type or interface for the header response and use it in the handler

## 2. Frontend: Header metadata on municipio ODS page

- [x] 2.1 In `app/pages/municipios/ods/[ine].vue`, call the new header API with the route's ine (e.g. useFetch with key that includes ine so it refetches on navigation)
- [x] 2.2 Add a metadata block under the municipality name (below the h1) that displays: población (habitantes), comarca (id_especial), and indicador 48 (name, value, units, year)
- [x] 2.3 Handle loading and error states: show fallback or hide block when the API fails or returns nulls; do not break the page
- [x] 2.4 Format numbers and optional i18n for labels (e.g. "Población", "Comarca", indicator name) following project conventions
