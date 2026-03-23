# municipios-list-api (delta)

**Implementation note (v1 shipped):** ODS goal filtering uses the **full** `GET /api/municipios/list` payload and filters **client-side**. The optional server query below was **not** implemented in v1; it remains a future MAY if payload or SSR cost requires it.

## ADDED Requirements (optional / deferred)

### Requirement: Optional filter by id_especial combined with NMUN
The system MAY extend `GET /api/municipios/list` with an optional query parameter (e.g. `id_especial`) that, when present, restricts results to municipalities whose `REGIONES.id_especial` equals the provided value (exact match). When both `NMUN` and `id_especial` are present, the result SHALL satisfy **both** filters (logical AND). Invalid `id_especial` values SHALL yield HTTP 400 using the same validation style as invalid `NMUN`.

#### Scenario: Filter by id_especial only
- **WHEN** a client sends `GET /api/municipios/list?id_especial=<valid>`
- **THEN** the response status is 200
- **AND** every returned row has `id_especial` equal to `<valid>`

#### Scenario: Combined NMUN and id_especial
- **WHEN** a client sends `GET /api/municipios/list?NMUN=<p>&id_especial=<e>` with both valid
- **THEN** every returned row matches both `id_poblacion` and `id_especial`

#### Scenario: Invalid id_especial
- **WHEN** `id_especial` is not among distinct values in REGIONES (or is empty when trimmed)
- **THEN** the response status is 400

#### Scenario: Endpoint remains backward compatible
- **WHEN** no new query parameters are sent
- **THEN** behaviour SHALL match the existing list and NMUN requirements
