# Municipio ODS page header UI

## ADDED Requirements

### Requirement: Display header metadata under municipality name
The municipio ODS page (`/municipios/ods/[ine]`, e.g. `app/pages/municipios/ods/[ine].vue`) SHALL display a metadata block under the municipality name (h1). The block SHALL show: población (habitantes), comarca (id_especial from the API), and the value of indicator id 48 for the latest available year with its name and units. The data SHALL be loaded from the municipio header API (e.g. `GET /api/municipios/[ine]/header`).

#### Scenario: Header shows metadata when API returns data
- **WHEN** the user navigates to a municipio ODS page and the header API returns 200 with poblacion, id_especial, and indicador_48 (value, periodo, nombre, unidad)
- **THEN** the page SHALL display under the municipality name at least: población (formatted as number of inhabitants), comarca (id_especial or resolved label), and the indicator 48 name, value, units, and year (periodo)

#### Scenario: Graceful fallback when fields are missing
- **WHEN** the header API returns 200 but one or more of poblacion, id_especial, or indicador_48 are null or missing
- **THEN** the page SHALL still render the header section without throwing
- **AND** missing fields SHALL be omitted or shown with a neutral fallback (e.g. "—", "No disponible", or hidden)

#### Scenario: Error or 404 from header API
- **WHEN** the header API returns 4xx/5xx or the request fails
- **THEN** the page SHALL not crash
- **AND** the metadata block SHALL be hidden or show a minimal fallback (e.g. "Datos no disponibles" or nothing) so the rest of the page (tabs, content) remains usable

#### Scenario: Data fetched for current route
- **WHEN** the page is rendered for a given [ine]
- **THEN** the header metadata request SHALL use that ine (codigo_ine) in the API URL
- **AND** when navigating to another municipio, the header SHALL reflect the new municipio's data (re-fetch or reactive key)
