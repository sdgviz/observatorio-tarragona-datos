## Context

- `GET /api/au/promedios` (`server/api/au/promedios.get.ts`) queries `PROMEDIOS_AGENDAS` with `id_dict = 'AUE-' + objetivo` (objetivo 1–10) and returns `codigo_ine`, `valor`, `n_indicadores`, `periodo` for **all** municipios.
- ETL (`transform/src/transform/promedios.ts`) loads `promedios_municipio_objetivo_aue.csv` into `PROMEDIOS_AGENDAS` with `id_dict: AUE-${r.objetivo_aue}`, `valor: r.promedio_indice`, `n_indicadores: r.n_indicadores`, `periodo: r.periodo_max`.
- Existing ODS parity in the Nuxt repo uses the Node `dataset-parity` Vitest project, `test/dataset/*.csv`, read-only SQLite under `server/assets/dbfile/`, and extends `dataset-parity-report.json`.

## Goals / Non-Goals

**Goals:**

- Add AU promedio parity alongside ODS parity in the **same** integration test file (or clearly shared module), same skip/report env vars pattern.
- Compare CSV columns to DB using SQL **aligned** with the API’s data source (`PROMEDIOS_AGENDAS`), including **`periodo`** (API exposes it; CSV has `periodo_max`).
- Extend the JSON report with a dedicated array for AU rows (equivalent query: `GET /api/au/promedios?objetivo=<n>`).

**Non-Goals:**

- Parity for `GET /api/au/indicadores` or `GET /api/au/objetivo-indicadores` in this change.
- Changing API or ETL behavior.

## Decisions

1. **Row selection in DB**  
   - **Choice:** `SELECT valor, n_indicadores, periodo FROM PROMEDIOS_AGENDAS WHERE id_dict = ? AND codigo_ine = ? AND periodo = ?` with `id_dict = 'AUE-' + objetivo`, `periodo` from CSV `periodo_max`.  
   - **Rationale:** Matches the unique business row in the CSV; avoids ambiguity if multiple period rows ever exist for the same `(id_dict, codigo_ine)`.

2. **Column mapping**  
   - CSV `promedio_indice` ↔ DB/API `valor`; CSV `n_indicadores` ↔ DB/API `n_indicadores`; CSV `periodo_max` ↔ DB/API `periodo`.  
   - **Rationale:** Matches `transformPromedios` for `objetivoAue`.

3. **Samples**  
   - **Choice:** Reuse the same 20 INEs as ODS parity (`43001`–`43020`) where possible; use **three** `objetivo_aue` values per municipio that **exist for all twenty** in `promedios_municipio_objetivo_aue.csv` — **`1`, `2`, `10`** (verified in current `test/dataset` snapshot).  
   - **Rationale:** ~60 cases, symmetric with the “20 × 3” ODS story; avoids objetivos missing for some municipios (e.g. 5, 7, 8, 9 in parts of the grid).

4. **CSV location**  
   - **Choice:** `test/dataset/promedios_municipio_objetivo_aue.csv` (add file if absent in repo; same sync discipline as other parity CSVs).

5. **Report shape**  
   - **Choice:** Add top-level key `auePromedioTests: [...]` with entries `{ csv: { promedio_indice, n_indicadores, periodo_max }, request: { method, path: '/api/au/promedios', query: { objetivo } }, codigo_ine, db: { valor, n_indicadores, periodo } }` plus optional short `note` that the HTTP API returns the full list per objetivo.

## Risks / Trade-offs

- **[Sparse objetivos]** → If future CSV drops some (ine, objetivo) pairs used in fixtures, tests fail until fixtures are updated — same as ODS parity.
- **[periodo mismatch]** → If ETL ever changes `periodo` semantics, update both SQL and spec.

## Migration Plan

- Land tests + report extension; no deploy change. Regenerate `test/dataset` + DB together when refreshing snapshots.

## Open Questions

- None for this scope; broader AU routes can be a follow-up change.
