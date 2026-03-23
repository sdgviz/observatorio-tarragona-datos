## ADDED Requirements

### Requirement: Objetivos and metas include promedio_indice
Each objetivo and each meta in the response SHALL include a `promedio_indice` field (number or null). The value SHALL be the aggregate average index for that ODS dimension and the requested municipality, from the `PROMEDIOS_ODS` table (column `valor` for the matching `id_dict` and `codigo_ine`). If no row exists for that dimension and municipality, `promedio_indice` SHALL be null.

#### Scenario: Objetivo has promedio_indice
- **WHEN** the response includes an objetivo (e.g. `2030-5`) and `PROMEDIOS_ODS` contains a row for that `id_dict` and the requested `codigo_ine`
- **THEN** that objetivo SHALL include `promedio_indice` with the numeric `valor` from that row

#### Scenario: Meta has promedio_indice
- **WHEN** the response includes a meta (e.g. `2030-5.2`) and `PROMEDIOS_ODS` contains a row for that `id_dict` and the requested `codigo_ine`
- **THEN** that meta SHALL include `promedio_indice` with the numeric `valor` from that row

#### Scenario: No promedio row
- **WHEN** there is no `PROMEDIOS_ODS` row for a given objetivo or meta `id_dict` and the requested `codigo_ine`
- **THEN** that objetivo or meta SHALL include `promedio_indice: null`
