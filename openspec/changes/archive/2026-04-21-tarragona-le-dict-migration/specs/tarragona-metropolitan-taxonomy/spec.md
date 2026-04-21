# tarragona-metropolitan-taxonomy

## ADDED Requirements

### Requirement: Tarragona taxonomy is sourced from the TARRAGONA dictionary

The system SHALL treat the rows of `diccionario.csv` with `agenda = 'TARRAGONA'` as the single source of truth for the Agenda Metropolitana de Tarragona taxonomy. The taxonomy has exactly two levels:

- **Level 1** — Líneas Estratégicas: the 6 rows with `nivel = 1` and `dimension` in `{1, 2, 3, 4, 5, 6}`.
- **Level 2** — Sub-Líneas: every row with `nivel = 2` and `dimension` matching the pattern `{n}.{m}` where `n` is a level-1 id (`1..6`). The concrete set of valid level-2 dimensions SHALL be whatever the dictionary contains (currently `1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 6.2`).

No level-1 or level-2 entry SHALL be hardcoded in application code; every consumer SHALL read the entries from the dictionary (directly or via a build-time generated module).

#### Scenario: Level-1 set follows the dictionary
- **WHEN** the build reads `diccionario.csv`
- **THEN** the Tarragona level-1 taxonomy SHALL contain exactly the rows where `agenda = 'TARRAGONA'` and `nivel = 1`
- **AND** it SHALL expose ids in ascending numeric order (`1..6`)

#### Scenario: Level-2 set follows the dictionary
- **WHEN** the build reads `diccionario.csv`
- **THEN** the Tarragona level-2 taxonomy SHALL contain exactly the rows where `agenda = 'TARRAGONA'` and `nivel = 2`
- **AND** each level-2 entry SHALL be associated with its parent level-1 via the leading number of its `dimension` (e.g. `4.2` has parent `4`)

### Requirement: Taxonomy entries expose id, name and color

Every Tarragona level-1 entry exposed to the Nuxt app SHALL carry a numeric `id` (`1..6`), a `name` (localized via the existing `DICCIONARIO_ES` / `DICCIONARIO_CAT` translation tables), and a `color` drawn from a fixed 6-slot palette identical to the first 6 entries of the legacy `objetivos_agenda` array (`#84c000, #006ab7, #009a94, #8c1f4f, #ff8a00, #ffbe00`), mapped by `id`.

#### Scenario: Level-1 entries include colors
- **WHEN** the taxonomy is built
- **THEN** the level-1 entry with `id = 1` SHALL have `color = '#84c000'`
- **AND** every level-1 entry SHALL have a non-empty `color`
- **AND** colors SHALL be stable across rebuilds

#### Scenario: Level-1 entries include localized names
- **WHEN** the taxonomy is built
- **THEN** each level-1 entry SHALL expose its Spanish name (the CSV's `nombre`) by default
- **AND** when the Catalan variant is requested the entry SHALL return the Catalan translation from `DICCIONARIO_CAT` when available, falling back to Spanish

### Requirement: Build-time generated taxonomy module for the Nuxt app

The Nuxt app SHALL consume the Tarragona taxonomy through a build-time generated module (e.g. a generated JSON file or virtual module) populated from the bundled SQLite database's `DICCIONARIO` rows with `agenda = 'TARRAGONA'`. The legacy hardcoded `objetivos_agenda` array in `app/assets/config/config.js` SHALL be removed and replaced with a re-export of this generated module so there is exactly one list of 6 entries in the app.

#### Scenario: Generated module is used by config.js
- **WHEN** the Nuxt app is built
- **THEN** `app/assets/config/config.js` SHALL not contain a hardcoded array of Tarragona objetivos
- **AND** `objetivos_agenda` SHALL resolve (directly or via re-export) to the 6-entry array produced from the TARRAGONA dictionary

#### Scenario: Regenerated taxonomy picks up dictionary changes
- **WHEN** the dictionary is updated (new Spanish name for a línea, new level-2 dimension, etc.) and the app is rebuilt
- **THEN** the regenerated module SHALL reflect the new values without any application code change

### Requirement: Canonical id-prefix in SQL artifacts

In all SQL-derived artifacts that reference the Tarragona taxonomy (dictionary `id_dict`, `ARQUITECTURA_L2.parent`, `PROMEDIOS_AGENDAS.id_dict`), the prefix SHALL be the literal string `TARRAGONA-`. The prefix `AUE-` SHALL not appear in rebuilt artifacts.

#### Scenario: Level-1 dict id
- **WHEN** the transform writes the dictionary row for `agenda = 'TARRAGONA'`, `dimension = '3'`
- **THEN** `DICCIONARIO.id_dict` SHALL equal `'TARRAGONA-3'`

#### Scenario: Level-2 dict id
- **WHEN** the transform writes the dictionary row for `agenda = 'TARRAGONA'`, `dimension = '3.2'`
- **THEN** `DICCIONARIO.id_dict` SHALL equal `'TARRAGONA-3.2'`

#### Scenario: Legacy AUE prefix is absent
- **WHEN** the build completes
- **THEN** no row in `DICCIONARIO`, `ARQUITECTURA_L2` or `PROMEDIOS_AGENDAS` SHALL have an `id_dict` or `parent` starting with `'AUE-'`
