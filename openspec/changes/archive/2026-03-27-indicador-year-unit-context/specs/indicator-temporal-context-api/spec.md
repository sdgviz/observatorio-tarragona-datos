# indicator-temporal-context-api

## Purpose

Normative contract: any API response that represents a **snapshot** or **latest-period** value from `INDICADORES` or from `PROMEDIOS_ODS` SHALL expose the reference calendar year (`periodo`) when stored, so clients can label charts and tables without inferring the year from context.

## ADDED Requirements

### Requirement: Indicator valores latest responses include periodo on every object

For `GET /api/indicadores/valores`, whenever the handler returns data for **`latest=true`** (single municipio + latest row, or all municipios with latest row per `codigo_ine`), each JSON object in the response SHALL include **`periodo`** as a JSON number equal to the `INDICADORES.periodo` of the row served. For a single-object 200 response, that object SHALL include `periodo`. For an array response, every element SHALL include `periodo` for each municipio row returned (the handler SHALL NOT omit `periodo` on those objects).

#### Scenario: Latest per municipio array includes periodo

- **WHEN** a client sends `GET /api/indicadores/valores?indicator_id=<id>&latest=true` without `ine` and without `year`
- **AND** at least one municipio has a matching latest row
- **THEN** the response status SHALL be 200
- **AND** each object in the array SHALL include `periodo` (number) alongside `codigo_ine`, `valor`, and `id_indicador`

#### Scenario: Latest single municipio includes periodo

- **WHEN** a client sends `GET /api/indicadores/valores?indicator_id=<id>&ine=<codigo_ine>&latest=true`
- **AND** a latest row exists
- **THEN** the response status SHALL be 200
- **AND** the single JSON object SHALL include `periodo` (number)

### Requirement: Por-comarca latest rows include periodo per municipio

`GET /api/indicadores/por-comarca` SHALL return, for each `codigo_ine`, a **`periodo`** field: the `INDICADORES.periodo` of the row selected by the latest-per-municipio join. When there is no matching indicator row for that municipio (LEFT JOIN miss), `periodo` SHALL be JSON `null`. `valor` nullability rules remain as today.

#### Scenario: Row with value includes periodo

- **WHEN** a client sends `GET /api/indicadores/por-comarca?indicator_id=<id>&id_especial=<comarca>`
- **AND** a returned row has non-null `valor`
- **THEN** that object SHALL include `periodo` as a number matching the underlying latest `INDICADORES` row

#### Scenario: Municipio in comarca without indicator data

- **WHEN** a municipio appears in the comarca list but has no indicator row
- **THEN** the object for that `codigo_ine` SHALL have `valor` null (or documented empty semantics)
- **AND** `periodo` SHALL be null
