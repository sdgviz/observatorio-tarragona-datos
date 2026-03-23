## Context

`GET /api/ods/indicadores` returns a nested structure (objetivos → metas → indicadores). The `PROMEDIOS_ODS` table already stores, per (id_dict, codigo_ine), a `valor` (average index) for each ODS objective and meta. The API currently does not expose this; the frontend needs it to show aggregates next to each objective and meta.

## Goals / Non-Goals

**Goals:** Add `promedio_indice` (number | null) to each objetivo and each meta in the response, sourced from PROMEDIOS_ODS for the same codigo_ine and id_dict.

**Non-Goals:** Changing period handling for promedios (use same periodo logic as indicator values if needed, or latest row per id_dict/codigo_ine); adding promedios to other endpoints.

## Decisions

### 1. Source and key

**Choice:** Read from `PROMEDIOS_ODS` where `codigo_ine = ?` and `id_dict IN (list of objective and meta id_dicts)`. Use `valor` as `promedio_indice`. If multiple rows exist per (id_dict, codigo_ine) (e.g. different periodo), take the latest periodo or the one that matches the request periodo if we ever align it; for simplicity, take one row per id_dict (e.g. MAX(periodo)).

**Rationale:** Single extra query; no schema change. Null when no row exists.

### 2. Period alignment

**Choice:** Use the same optional `periodo` as the rest of the endpoint when selecting PROMEDIOS_ODS rows: if `periodo` is provided, filter by it; otherwise use the latest period per (id_dict, codigo_ine).

**Rationale:** Keeps response coherent with the year context of the indicators.

## Risks / Trade-offs

- **[Missing promedios]** → Some id_dicts may have no row in PROMEDIOS_ODS for that municipality. Mitigation: return `promedio_indice: null`.
