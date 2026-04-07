# municipios-list-api (delta)

## ADDED Requirements

### Requirement: id_especial2 on municipality list objects

The JSON objects returned by `GET /api/municipios/list` SHALL include an `id_especial2` property on each municipality element when the `REGIONES` table defines that column. Values SHALL reflect the stored row (JSON string when set, JSON `null` when the column is null for that row).

#### Scenario: Unfiltered list includes id_especial2

- **WHEN** a client receives a successful response from `GET /api/municipios/list` without `NMUN`
- **THEN** each array element SHALL include `id_especial2` (string or null) consistent with the corresponding `REGIONES` row

#### Scenario: NMUN-filtered list includes id_especial2

- **WHEN** a client receives a successful response from `GET /api/municipios/list?NMUN=<valid>`
- **THEN** each array element SHALL include `id_especial2` (string or null) for that municipality as in the unfiltered response shape
