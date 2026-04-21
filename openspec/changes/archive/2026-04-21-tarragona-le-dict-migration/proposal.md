## Why

The client delivers a new version of the dataset that replaces the AUE (Agenda Urbana Española) taxonomy with the Agenda Metropolitana de Tarragona (6 líneas estratégicas instead of 10). In `metadatos_agendas.csv` the hierarchy columns `aue1` / `aue2` are replaced by `le` / `le2`, and in `diccionario.csv` the rows with `agenda=AUE` are replaced by rows with `agenda=TARRAGONA`. The app (database build + Nuxt consumers) currently hardcodes the 10-AUE list in `app/assets/config/config.js` and assumes the AUE taxonomy everywhere, so it must be migrated to the new 6-objetivo Tarragona taxonomy, driven by the dictionary as the single source of truth.

## What Changes

- **BREAKING**: Drop reading of `aue1` / `aue2` columns and of `agenda=AUE` dictionary rows. No backward-compatible fallback — the data pipeline fails fast if only the AUE columns are present.
- **BREAKING**: `data-transformation` hierarchy build now reads `le` / `le2` from metadata and `agenda=TARRAGONA` from the dictionary; the generated SQLite hierarchy tables now expose 6 level-1 líneas estratégicas and the 13 level-2 sub-líneas (as currently listed in the dict) instead of 10 AUE objetivos and their AUE sub-dimensions.
- **BREAKING**: Orphan `le` / `le2` values in `metadatos_agendas.csv` that do not appear in the TARRAGONA dict cause the build step to error (strict validation) so data drift is caught early.
- Introduce a new `tarragona-metropolitan-taxonomy` capability that owns the canonical definition of the Agenda Metropolitana de Tarragona taxonomy (ids, names, colors, display labels) and replaces all hardcoded AUE lists.
- `app/assets/config/config.js`: the hardcoded `objetivos_agenda` array is replaced by a build-time generated module that reads the TARRAGONA rows from the dictionary and joins them with a stable color palette (the first 6 colors currently used by `objetivos_agenda`). Route IDs remain `1..6` so `/au/[objetivo]` paths stay stable (`1..6` now exist, `7..10` no longer resolve).
- Replace user-facing copy from "AUE" / "Agenda Urbana Española" to "Agenda Metropolitana de Tarragona" (or "Líneas Estratégicas" where the short form fits): home map mode label, header menus, goal pages titles, agenda nav strip labels, municipio AU page, spider charts legends.
- Keep the existing `/au/[objetivo]` and `/municipios/au/[ine]` URL segments to preserve external links; remove menu entries and any links pointing to objetivos `7..10`.

## Capabilities

### New Capabilities

- `tarragona-metropolitan-taxonomy`: canonical taxonomy of the Agenda Metropolitana de Tarragona (6 líneas estratégicas + 13 sub-líneas), sourced from the TARRAGONA dictionary rows, exposed to the Nuxt app via a build-time-generated config module and consumed by every AU-flavored view.

### Modified Capabilities

- `data-transformation`: switch hierarchy build from `aue1`/`aue2` + `agenda=AUE` to `le`/`le2` + `agenda=TARRAGONA`, add strict orphan validation.
- `au-hierarchy-api`: return 6 level-1 líneas with their level-2 sub-líneas from the TARRAGONA taxonomy; IDs remain numeric `1..6`.
- `au-home-promedios-api`: compute and serve averages for the 6 Tarragona líneas estratégicas (no more 10-AUE averages).
- `home-index-au-map-visualization`: home map "AU" mode now paints the 6 Tarragona líneas and uses the Tarragona palette / labels.
- `agenda-nav-strip`: the AU strip emits 6 entries (plus level-2 navigation) with Tarragona labels.
- `header-au-goals-menu`: header AU/Goals menu exposes the 6 líneas with Tarragona copy; entries for old objetivos `7..10` are removed.
- `au-goal-pages`: `/au/[objetivo]` pages render for ids `1..6` only, using Tarragona names/colors; unknown ids return 404.
- `mode-aware-navigation`: the "AU" mode in navigation is relabeled as "Agenda Metropolitana de Tarragona" (short label: "Tarragona") and the mode's internal catalog comes from the new taxonomy capability.

## Impact

- Data pipeline (`diputacion_tarragona_data`):
  - Build scripts that read `aue1`/`aue2` (descriptivos/indicadores transformations, hierarchy generation) migrated to `le`/`le2`.
  - Dictionary reader migrated from `agenda=AUE` to `agenda=TARRAGONA`.
  - SQLite output (`output/diputacion_tarragona.db`, copied to `server/assets/dbfile/`) schema stays the same but row counts and dimension IDs change; every AU-consuming API returns the new 6-item list.
- Nuxt app (`diputacion_tarragona`):
  - `app/assets/config/config.js`: `objetivos_agenda` removed; replaced by an auto-generated module (or equivalent composable) fed from the dictionary.
  - AU-related pages, components and APIs (`app/pages/au/[objetivo].vue`, `app/pages/municipios/au/[ine].vue`, `app/components/municipio/au/*`, header and nav strip, home index map) updated for 6-entry taxonomy and Tarragona copy.
  - External links / menus referencing AUE objetivos 7..10 removed; `/au/7` … `/au/10` will 404.
- No change to the ODS taxonomy or any ODS view.
- No change to route segments (`/au/...` preserved) → existing internal links keep working.
