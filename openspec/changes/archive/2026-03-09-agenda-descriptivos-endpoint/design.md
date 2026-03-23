## Context

Descriptive indicators live in `INDICADORES_DESCRIPTIVOS` (id_indicador, codigo_ine, periodo, valor, umbral). Their names and units come from `METADATA` and `METADATA_ES`. Their link to the urban agenda (AUE) is in `ARQUITECTURA_L2`: parents `AUE-1` … `AUE-10` (DICCIONARIO nivel 1) reference indicator IDs as children. The UI needs a flat list of indicators with two values per indicator—reference year and current/latest year—plus metadata and a placeholder THR for range visualization. The database has no THR column yet.

## Goals / Non-Goals

**Goals:**
- Return all descriptive indicators that have at least one value for the given municipality.
- For each indicator: valor at reference year (or first available), valor at requested year (or last available), metadata (aue1, nombre, unidad), and synthetic THR.
- Support optional `year_reference` and `year`; default to first/last period when omitted.
- Single-level grouping or tagging by AUE objective (aue1) for filtering in the UI.

**Non-Goals:**
- Adding a real THR column or ETL changes in this change.
- Nested hierarchy (no meta level like ODS); flat list with aue1 is enough.
- Language parameter (can be added later if needed).

## Decisions

### 1. Endpoint path: `GET /api/agenda/descriptivos`

**Choice**: New route under `/api/agenda/` to group agenda-related endpoints.

**Parameters**: `codigo_ine` (required), `year_reference` (optional integer), `year` (optional integer).

### 2. Resolving reference and current values

**Choice**: Two value fields per indicator: `valor_referencia` (from `year_reference` or MIN(periodo)) and `valor_actual` (from `year` or MAX(periodo)). Both come from `INDICADORES_DESCRIPTIVOS` for the same (id_indicador, codigo_ine). If a requested year has no row, use the closest available (first/last) as already specified.

**Rationale**: Matches the UI need for "Año base" and "Actualizado" and keeps the contract simple.

### 3. AUE1 (1–9 or 1–10)

**Choice**: Derive aue1 from `ARQUITECTURA_L2`: for each indicator, take parent values that match `AUE-<n>` with n in 1..10 (DICCIONARIO has AUE 1–10). Return as array of numbers (e.g. `[1, 3]`) or single primary; spec will say one or multiple. Proposal said "aue1 (1-9)" — use 1–10 from data and document; if UI only needs one objective, return the first linked AUE dimension.

**Rationale**: Matches how ODS linkage works and avoids changing metadata schema.

### 4. THR placeholder

**Choice**: Until the DB has a THR column, return a random value from `["1Q", "2Q", "3Q", "4Q"]` per indicator (deterministic per request is acceptable, e.g. based on id_indicador seed so same indicator gets same THR in one response). Alternative set `["BAJO", "MEDIO BAJO", "MEDIO ALTO", "ALTO"]` can be switched later; we specify one in the spec (e.g. quartiles).

**Rationale**: Allows the frontend to render range/position controls without blocking on schema.

### 5. Response shape

**Choice**: JSON with `codigo_ine`, `nombre_municipio`, and `indicadores`: array of `{ id_indicador, nombre, unidad, aue1, valor_referencia, periodo_referencia, valor_actual, periodo_actual, thr }`. Optional `umbral` from DB can be included if present.

## Risks / Trade-offs

- **[THR random]** → Not comparable across requests; UI is only for layout until real THR exists. Mitigation: document as temporary; later replace with DB column.
- **[Multiple AUE per indicator]** → Some indicators link to several AUE objectives. Mitigation: return array of aue1 values so UI can filter by any of them.
