## Context

The application displays ODS (Sustainable Development Goals) data per municipality. The database already contains all necessary data: `INDICADORES` (indicator values), `METADATA`/`METADATA_ES`/`METADATA_CAT` (indicator metadata and translations), `DICCIONARIO`/`DICCIONARIO_ES`/`DICCIONARIO_CAT` (ODS objectives and metas with translations), and `ARQUITECTURA_L2` (mapping between dictionary entries and indicators). The existing endpoint `/api/ods/promedios` only returns aggregated averages — there is no way to get the full indicator-level detail organized by ODS hierarchy.

The endpoint lives in the `diputacion_tarragona` Nuxt project (not the data project), following the same pattern as the existing `promedios.get.ts` endpoint which uses `useDatabase()` to get a `better-sqlite3` instance.

## Goals / Non-Goals

**Goals:**
- Provide a single endpoint that returns the complete ODS hierarchy (Objetivo -> Metas -> Indicadores) for a given municipality.
- Support filtering by ODS objective, period, and language.
- Return indicator values alongside their full metadata.
- Handle indicators that appear under multiple ODS metas correctly.

**Non-Goals:**
- AUE (Agenda Urbana) hierarchy — could be a future similar endpoint but is out of scope.
- Write operations or data modification.
- Frontend components that consume this endpoint.
- Caching or performance optimization beyond reasonable query design.

## Decisions

### 1. Endpoint path: `GET /api/ods/indicadores`

**Choice**: Place the endpoint under `/api/ods/` alongside the existing `promedios` endpoint.

**Rationale**: Groups all ODS-related endpoints together. The name `indicadores` clearly describes what it returns.

**Parameters**:
- `codigo_ine` (required): Municipality code.
- `objetivo` (optional, 1-17): Filter to a single ODS objective. Without it, returns all 17.
- `periodo` (optional): Filter to a specific year. Without it, returns the most recent period per indicator.
- `lang` (optional, `es`|`ca`): Language for names and descriptions. Defaults to `es`.

### 2. Query strategy: multiple focused queries + in-memory assembly

**Choice**: Execute 4-5 small queries and assemble the hierarchy in TypeScript, rather than one large JOIN.

**Rationale**: The hierarchy construction (objectives -> metas -> indicators) is naturally tree-shaped, which is awkward to build from a flat JOIN result. Separate queries are easier to understand, debug, and each is simple enough to be fast. The data volume is small (max ~130 indicators, 17 objectives, ~100 metas).

**Queries**:
1. Municipality info from `REGIONES` (1 row).
2. ODS objectives (nivel 1) and metas (nivel 2) from `DICCIONARIO` + translations, filtered by `agenda = '2030'`.
3. Indicator-to-dictionary mappings from `ARQUITECTURA_L2` where parent starts with `2030-`.
4. Indicator values from `INDICADORES` for the given `codigo_ine`, with period filtering.
5. Indicator metadata from `METADATA` + translations.

### 3. Period handling: latest per indicator by default

**Choice**: When no `periodo` is specified, select the row with the maximum `periodo` for each (id_indicador, codigo_ine) pair. When specified, filter to that exact period.

**Rationale**: Users typically want current data. The period parameter allows historical queries. Using a subquery with `MAX(periodo)` grouped by `id_indicador` keeps it clean.

### 4. Language: table-driven translation lookup

**Choice**: Use `METADATA_ES`/`DICCIONARIO_ES` for `lang=es` and `METADATA_CAT`/`DICCIONARIO_CAT` for `lang=ca`. Fall back to `es` if the `_CAT` table has no data for that entry.

**Rationale**: The translation tables already exist in the schema. Using COALESCE with a fallback ensures graceful degradation when Catalan translations are not yet populated.

### 5. Response structure

```json
{
  "codigo_ine": "43001",
  "nombre_municipio": "Alcanar",
  "objetivos": [
    {
      "id": "2030-1",
      "nombre": "Fin de la pobreza",
      "logo": "1.svg",
      "metas": [
        {
          "id": "2030-1.1",
          "nombre": "Meta 1.1 description",
          "indicadores": [
            {
              "id_indicador": "1",
              "nombre": "Indicator name",
              "descripcion": "Detail text",
              "valor": 5.2,
              "indice": 0.8,
              "categoria": "bueno",
              "periodo": 2023,
              "metadata": {
                "unidad": "%",
                "tipo": "ods",
                "formula": "d",
                "umbral_optimo": 0,
                "umbral_malo": 9.6,
                "fuente": "INE",
                "actualizacion": "Anual"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

Objectives without any indicators for the given municipality are omitted from the response. Metas without indicators are also omitted.

## Risks / Trade-offs

- **[Empty CAT translations]** → The `METADATA_CAT` and `DICCIONARIO_CAT` tables are currently empty. Mitigation: COALESCE falls back to ES translations, so `lang=ca` works but returns Spanish text until translations are populated.
- **[Indicator in multiple metas]** → The same indicator appears multiple times in the response if it's linked to multiple metas. This is intentional per the requirements, but increases payload size. Mitigation: the data volume is small enough that duplication is negligible.
- **[No pagination]** → The endpoint returns all data at once. Mitigation: with ~130 indicators across 17 objectives, the response is well under 100KB. Pagination would add unnecessary complexity.
