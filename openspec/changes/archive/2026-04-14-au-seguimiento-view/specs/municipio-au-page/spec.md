## MODIFIED Requirements

### Requirement: AU page fetches hierarchy data and renders header
The `pages/municipios/au/[ine].vue` page SHALL fetch the AU hierarchy via `useAsyncData` calling `/api/au/indicadores` and pass the response to `MunicipioAuSeguimiento`. The page SHALL also fetch header metadata (`/api/municipios/{ine}/header`) to display population and comarca information, matching the ODS page header pattern.

#### Scenario: Page loads with AU data
- **WHEN** a user navigates to `/municipios/au/43148`
- **AND** the municipio participates in AU
- **THEN** the page SHALL display the municipio name, population, and comarca in the header
- **AND** the Seguimiento tab SHALL receive the fetched AU hierarchy data

#### Scenario: Page loads for non-AU municipio
- **WHEN** a user navigates to `/municipios/au/43001`
- **AND** the municipio does NOT have `id_especial3 = 'aue'`
- **THEN** the Seguimiento view SHALL display the API error gracefully (error alert from the 404 response)

#### Scenario: Tabs remain functional
- **WHEN** the page loads
- **THEN** the "Seguimiento" and "Descriptivo" tabs SHALL both be present and functional
- **AND** the default active tab SHALL be "Seguimiento"
