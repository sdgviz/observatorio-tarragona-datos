## Context

Two repositories cooperate:

- `diputacion_tarragona_data` (CSV → SQLite build):
  - `transform/src/parse/metadata.ts` reads `metadatos_agendas.csv` and exposes `aue1` / `aue2` on `MetadataRecord`.
  - `transform/src/transform/arquitectura.ts` builds the `arquitectura_l2` edges using `aue1` / `aue2` and prefixes `AUE-`.
  - `transform/src/transform/promedios.ts` emits `id_dict = AUE-${objetivo_aue}`.
  - `transform/src/build-static-viewer.ts` queries `d.agenda = 'AUE'` and `parent LIKE 'AUE-%'` to build the static viewer catalog.
  - `transform/src/integrity/checks/data.ts` registers file-level integrity checks, including `promedios_municipio_objetivo_aue.csv`.
  - The client now ships `metadatos_agendas.csv` with `le` / `le2` (replacing `aue1` / `aue2`) and `diccionario.csv` with `agenda=TARRAGONA` rows (replacing `agenda=AUE`). The new TARRAGONA taxonomy has 6 level-1 dimensions (`1..6`) and 13 level-2 sub-dimensions (`1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 6.2`).

- `diputacion_tarragona` (Nuxt app):
  - `app/assets/config/config.js` hardcodes `objetivos_agenda` with 10 AUE entries (`id`, `name`, `color`).
  - `server/api/au/*` endpoints use `ID_PREFIX = 'AUE-'`, `AGENDA = 'AUE'`, `id_especial3 = 'aue'` and parent prefix `AUE-{n}.`.
  - `server/api/agenda/descriptivos.get.ts` bucketizes descriptive indicators by scanning `parent LIKE 'AUE-%'` in `arquitectura_l2`.
  - `app/pages/au/[objetivo].vue`, `app/pages/au/index.vue`, `app/pages/municipios/au/[ine].vue`, `app/components/AppHeader*`, `app/components/AgendaNavStrip.vue`, `app/components/municipio/au/*` drive AU views.
  - `app/utils/taxonomyConfigs.ts` centralizes AU-mode taxonomy wiring.
  - `app/types/agenda.ts` declares AU-related types.

The migration is strictly one-way: remove AUE, adopt TARRAGONA. IDs remain numeric (`1..6`), keeping `/au/[objetivo]` route shape stable so external links for `1..6` continue to work; `7..10` start returning 404.

## Goals / Non-Goals

**Goals:**

- Replace `aue1` / `aue2` with `le` / `le2` everywhere in the data pipeline (parser, transform, integrity checks, build-static-viewer).
- Replace the `AUE` agenda literal with `TARRAGONA` in all SQL and parent-prefix builders; use a single prefix constant (`TARRAGONA-` or similar) rather than keeping the `AUE-` strings.
- Generate the Nuxt `objetivos_agenda` config from the TARRAGONA dictionary at build time (single source of truth) so there is exactly one list of 6 entries in the app.
- Fail fast when `le` / `le2` reference dimensions that are not present in the TARRAGONA dictionary (strict orphan validation).
- Rename user-facing copy from "Agenda Urbana Española" to "Agenda Metropolitana de Tarragona" (with short form "Líneas Estratégicas" / "Tarragona") across navigation, page titles, tooltips and legend labels.
- Keep the `/au/` route segment (and `id_especial3 = 'au'` in the Nuxt app / DB) stable to avoid breaking existing links and bookmarks.

**Non-Goals:**

- Any change to the ODS taxonomy (17 ODS and their metas).
- Backward-compatible fallback to the AUE columns or AUE dictionary rows.
- Changes to the descriptivos / indicadores CSVs beyond what the client already delivers.
- New UI features — only relabeling and rewiring existing surfaces to the new taxonomy.
- Schema-level SQL changes (tables and columns stay the same; only the values and dictionary rows change).

## Decisions

### 1. Database parent-id prefix for líneas estratégicas

Use `TARRAGONA-` as the new prefix in `arquitectura_l2.parent`, `diccionario.id_dict`, and the `promedios_municipio_objetivo_*` id_dict values. Introduce a single constant `AGENDA_LE = 'TARRAGONA'` and `AGENDA_LE_PREFIX = 'TARRAGONA-'` in both repos.

- **Alternatives considered:**
  - Keep `AUE-` as prefix (only change row names): rejected, it would make the data misleading and violate the "fully replace" decision.
  - Use `LE-`: rejected, `TARRAGONA` is the exact value the client writes in `diccionario.csv`'s `agenda` column and matches the domain wording (Agenda Metropolitana de Tarragona).

### 2. `MetadataRecord` field renames

Rename `aue1` → `le` and `aue2` → `le2` on the `MetadataRecord` TypeScript interface and in `parseMetadata`. Keep `muestra_aue` field *name* in memory but plan a follow-up to rename it to `muestra_le` once the CSV column is renamed too (client has not renamed `muestra_aue` yet, and the `diccionario.csv` change is the priority for this migration).

- Rationale: `muestra_aue` in metadata is currently populated with level-2 AUE codes (e.g. `1.1.3.a`). The client migration may rename it in a later delivery; deferring that rename keeps this change focused and avoids breaking the integrity checks in this pass. We surface this as an Open Question below.

### 3. Taxonomy source of truth for the Nuxt app

At app build time (Nuxt hook), a generator reads the `TARRAGONA` level-1 rows from the SQLite DB (already embedded under `server/assets/dbfile/`) and emits a virtual module `#taxonomy/tarragona` (or a generated JSON imported by `app/assets/config/config.js`) containing the 6-entry array `{ id, name, color, level }`. `objetivos_agenda` becomes a re-export of that generated array.

- Colors: the generator joins the dict rows with a static palette of 6 colors taken from the current `objetivos_agenda[0..5].color` values (`#84c000, #006ab7, #009a94, #8c1f4f, #ff8a00, #ffbe00`). Palette mapping is by dimension id (`1..6`).
- **Alternatives considered:**
  - Runtime API endpoint `/api/taxonomy/tarragona`: rejected for the initial migration — adds one network request per page load and complicates SSR, with no real benefit because the dictionary is bundled with the DB.
  - Hand-written static list in `config.js`: rejected because the client is expected to tweak level-1 names, which would otherwise require a code change every time.

### 4. Orphan validation (`le` / `le2` not in dictionary)

Add a new integrity check that, after parsing `metadatos_agendas.csv` and `diccionario.csv`, verifies every distinct value of `le` and `le2` exists as a `TARRAGONA` dimension of the correct level in the dictionary. If any value is unknown, the check fails with a summary of orphan codes and halts the build (non-zero exit).

- Rationale: strict fail-fast was selected by the user ("Strict: fail the data build / warn loudly"). Matches the pattern already used by existing integrity checks in `transform/src/integrity/checks/data.ts`.

### 5. Retire or reuse the `muestra_aue` CSV column

Because the client has kept `muestra_aue` in the new delivery (to be confirmed; the current CSV header still includes it), we treat `muestra_aue` as an opaque passthrough string stored in the `metadata` SQL table and ignored by the UI. We remove all code paths that parse or interpret it. (Listed in Open Questions.)

### 6. UI copy, labels and mode naming

- Replace "Agenda Urbana Española" / "AUE" with "Agenda Metropolitana de Tarragona" / "Tarragona" in: `app/components/AppHeader.vue`, `app/components/AppHeaderPrimaryNav.vue`, `app/components/AgendaNavStrip.vue`, `app/pages/au/index.vue`, `app/pages/au/[objetivo].vue`, `app/components/municipio/au/*`, `app/utils/taxonomyConfigs.ts`.
- The URL segment stays `/au/` to preserve bookmarks; the short mode label used internally (`taxonomyConfigs.au`) stays `au`.
- Introduce a constant `LABELS.agendaLe.long = 'Agenda Metropolitana de Tarragona'` and `LABELS.agendaLe.short = 'Tarragona'` (or `'Líneas Estratégicas'` when clarifying context is needed) to keep copy in one place.

### 7. Route collision / invalid objetivos

`/au/7` … `/au/10` used to be valid. After the migration the page component must resolve `params.objetivo` against the new 6-entry list and return `createError({ statusCode: 404 })` when the id is out of range (currently it derives the list from `objetivos_agenda`, so reading from the generated taxonomy will naturally produce the correct 404).

### 8. Test parity

Keep `au-promedios-parity-tests` and any existing snapshot tests. Update expected snapshots to the 6-line Tarragona taxonomy once the pipeline has been migrated. Add a focused test for the orphan validation (crafted CSV with an `le=99` value should fail the build).

## Risks / Trade-offs

- **Risk:** Orphan-strict validation could block the CI build if the client ships a partially-updated CSV. **Mitigation:** print a detailed summary listing all orphan `le` / `le2` codes and their indicator ids so the client can fix the data quickly; document the contract in the `tarragona-metropolitan-taxonomy` spec.
- **Risk:** External links to `/au/7` … `/au/10` will 404 after deploy. **Mitigation:** accepted (the underlying objetivos no longer exist); document in the release notes.
- **Risk:** Build-time generator couples the Nuxt app to the SQLite DB at build. **Mitigation:** the DB is already embedded for production runtime; the generator runs as part of the existing prerender hook and can fall back to a static JSON snapshot in CI.
- **Risk:** Two-level dimensions in TARRAGONA are a subset (e.g. no `1.1`, no `4.4`): the app assumed every level-1 had every level-2 pattern. **Mitigation:** the `au-hierarchy-api` spec now lists the exact 13 allowed level-2 dimensions; the orphan validation catches any mismatch early.
- **Trade-off:** Keeping the `AUE` in route segments and DB `id_especial3` means the identifier in URLs is no longer semantically accurate, but stable URLs are explicitly preferred by the user.

## Migration Plan

1. Update the data pipeline (`diputacion_tarragona_data/transform`):
   - Rename `aue1` / `aue2` fields to `le` / `le2` in `MetadataRecord`; update the CSV reader to the new column names.
   - Switch `arquitectura.ts` and `promedios.ts` to emit `TARRAGONA-` prefixes.
   - Update `build-static-viewer.ts` queries from `agenda = 'AUE'` to `agenda = 'TARRAGONA'`.
   - Add the orphan integrity check.
   - Regenerate `output/diputacion_tarragona.db` with the new CSVs; copy to `diputacion_tarragona/server/assets/dbfile/`.

2. Update the Nuxt app (`diputacion_tarragona`):
   - Replace `ID_PREFIX = 'AUE-'` and `AGENDA = 'AUE'` constants in `server/api/**` with `TARRAGONA-` / `TARRAGONA`.
   - Build-time generator for `objetivos_agenda` from the bundled DB; replace hardcoded array in `app/assets/config/config.js` with a re-export.
   - Update page components (`/au/[objetivo]`, `/au/index`, `/municipios/au/[ine]`) and shared AU components to consume the new taxonomy, show Tarragona copy, and return 404 for unknown ids.
   - Update `app/utils/taxonomyConfigs.ts` AU entry with the new label / title pipeline.
   - Update `app/types/agenda.ts` and any Typescript types referencing AUE.

3. Verification:
   - Run `nuxt generate` (or `nuxt build && nuxt preview`) and smoke-test `/au/1` … `/au/6`, `/au/index`, home map AU mode, `/municipios/au/{ine}`, header menu, nav strip.
   - Re-run parity tests (`au-promedios-parity-tests`).

**Rollback:** revert both repo commits; the old `diputacion_tarragona.db` snapshot in git preserves the previous AUE contents.

## Open Questions

- Does the client intend to rename `muestra_aue` to `muestra_le` (or equivalent) in a future delivery? If yes, a follow-up change should rename the `metadata` column; if no, we keep `muestra_aue` as an opaque passthrough.
- Should we also regenerate the ODS-side level-2 sample codes (`muestra_aue` values currently reference AUE level-2 structure), or are those values already updated in the new CSV? (To be confirmed on reviewing a sample of the new file.)
- `promedios_municipio_objetivo_aue.csv` filename: will the client also rename it (e.g. `promedios_municipio_objetivo_tarragona.csv`)? For now we keep the filename and only change the `id_dict` values.
