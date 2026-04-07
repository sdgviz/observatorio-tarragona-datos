## Context

- **Data repository** (`diputacion_tarragona_data`) holds canonical CSVs under `dataset/` (e.g. `indicadores_agendas.csv`, `promedios_municipio_ods_objetivo.csv`). A Python/transform pipeline builds `diputacion_tarragona.db`.
- **Application repository** (`diputacion_tarragona`) is Nuxt 4 with Nitro server routes reading that SQLite via `useDatabase()`. Vitest is already configured with `@nuxt/test-utils` and tests live in `test/nuxt/`.
- Existing tests are **pure unit** (utils, small components). The **csv-integrity** CLI in the data repo validates CSV shape and referential rules; it does **not** compare CSV numbers to API responses.

## Goals / Non-Goals

**Goals:**

- Add a **maintainable, small** parity suite: fixed subsets of municipios, indicators, and ODS objectives.
- For each sample, **parse the expected value from the CSV** (same columns the ETL uses), **call the relevant GET API** the app exposes, and **assert equality** within a defined numeric tolerance.
- Keep everything in the **Nuxt test folder** (`test/nuxt/`) per project conventions, with shared helpers colocated or under `test/nuxt/helpers/` if needed.

**Non-Goals:**

- Exhaustive scanning of every CSV row on every test run (optional future “full parity” job is out of scope unless later requested).
- Changing ETL, API contracts, or DB schema.
- Playwright/E2E coverage for this parity (HTTP-level unit/integration under Vitest is enough).

## Decisions

1. **Cross-repo path to CSVs**  
   - **Choice:** Resolve dataset directory via `process.env.DATASET_ROOT` (absolute path preferred in CI) with a **dev default** of the sibling checkout `../diputacion_tarragona_data/dataset` relative to the Nuxt project root (document in README or test file header).  
   - **Rationale:** Matches the user’s two-root workspace layout without copying CSVs into the Nuxt repo.  
   - **Alternative considered:** Submodule or symlink of `dataset` into the app repo — heavier maintenance.

2. **How to invoke the API under test**  
   - **Choice:** Use Nuxt/Vitest integration so handlers run in-process (e.g. `$fetch` / `fetch` against the Nitro local URL pattern supported by `@nuxt/test-utils`, as used elsewhere in the project or per Nuxt 4 docs).  
   - **Rationale:** No separate `nuxt dev` process; stable for CI.  
   - **Alternative considered:** Import handler modules directly — tighter coupling to Nitro internals; avoid unless `$fetch` is impractical.

3. **What to compare (initial scope)**  
   - **Indicadores:** `indicadores_agendas.csv` columns `indicador`, `periodo`, `codigo_ine`, `valor` (and optionally `indice` if the API returns it for the same query) vs `GET /api/indicadores/valores?indicator_id=&ine=&year=`.  
   - **Agregados ODS por municipio y objetivo:** `promedios_municipio_ods_objetivo.csv` — map CSV columns to API fields (`promedio_metas` ↔ response `valor`, `n_metas` ↔ `n_indicadores`, `ods_objetivo` ↔ query `objetivo`) vs `GET /api/ods/promedios?objetivo=`. Confirm exact ETL mapping once during implementation (spec references `openspec/specs/data-transformation` if needed).  
   - **Rationale:** Covers the two clearest “number in CSV → number in API” paths the user asked for; keeps the first iteration small.

4. **Subsets**  
   - **Choice:** Single module e.g. `test/fixtures/datasetApiParitySamples.ts` exporting arrays of `{ codigo_ine, ... }` used by both CSV lookup and API params. Pick 3–5 INEs, 2–3 indicators with known periods, 2–3 objetivo IDs.  
   - **Rationale:** Easy to extend; code review visible.

5. **Numeric comparison**  
   - **Choice:** Helper `expectClose(a, b, eps)` with epsilon ~1e-6 or relative tolerance for large magnitudes; document in test helper.  
   - **Rationale:** Floats from CSV/DB may differ in least significant digits.

6. **Preconditions and skipping**  
   - **Choice:** If `DATASET_ROOT` is missing/unreadable or the SQLite file expected by `useDatabase()` in `server/utils/db.ts` is missing, tests **`skip` with a printed reason** (Vitest `describe.skip` / conditional `it.skip`) rather than failing ambiguously — **or** fail fast with one clear error (pick one approach and apply consistently; preference: **fail** in CI when env explicitly set, **skip** when local dev has no sibling repo).  
   - **Resolution for v1:** Use **skip** when dataset path not found; **fail** when path exists but values mismatch (assertion error).

## Risks / Trade-offs

- **[DB stale vs CSV]** → Mitigation: document that developers must rebuild the DB after changing CSVs; optional note in test failure message suggesting rebuild.
- **[False confidence from tiny subset]** → Mitigation: comments + spec state that scope is regression signal, not full coverage; expand samples over time.
- **[Workspace path assumptions]** → Mitigation: `DATASET_ROOT` for CI; sibling default only for local monorepo-style checkouts.

## Migration Plan

- Land tests behind documented env; no production deploy change.  
- CI: add step to set `DATASET_ROOT` to the checked-out data repo and ensure DB artifact is present before `pnpm test:nuxt` (or a dedicated script `pnpm test:dataset-parity` if we split projects later).

## Open Questions

- Whether to add **meta-level ODS aggregates** (`promedios_municipio_meta_ods.csv` vs `/api/ods/indicadores` `promedio_indice`) in the same change or a follow-up — **defer to follow-up** unless implementation time allows.
