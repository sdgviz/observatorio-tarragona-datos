# Municipio AU page

## ADDED Requirements

### Requirement: Agenda Urbana municipio detail page exists
The system SHALL provide a dedicated Agenda Urbana detail page at `/municipios/au/[ine]` for each municipio, parallel to the existing ODS page at `/municipios/ods/[ine]`.

#### Scenario: Navigating to a valid AU municipio page
- **WHEN** a user navigates to `/municipios/au/<ine>` with a valid INE code
- **THEN** the page renders showing the municipio name and two tabs: "Seguimiento" and "Descriptivo"

#### Scenario: Navigating to an AU municipio page with an invalid INE code
- **WHEN** a user navigates to `/municipios/au/<ine>` with an unrecognised INE code
- **THEN** the application throws a 404 error

### Requirement: AU page syncs Pinia store mode on mount
The system SHALL set the visualization mode to `AU` in `useVisualizationStore` when the Agenda Urbana municipio page is mounted, so the header toggle reflects the active mode.

#### Scenario: Arriving at AU page directly via URL
- **WHEN** a user navigates directly to `/municipios/au/<ine>` (e.g. via a bookmark or shared link)
- **THEN** `visualizationStore.setMode(VisualizationMode.AU)` is called on mount
- **AND** the header toggle is in the ODS-off position (reflecting AU mode)

### Requirement: AU page has "Seguimiento" and "Descriptivo" tabs
The AU municipio page SHALL render two tabs — "Seguimiento" and "Descriptivo" — using a `UTabs` component, in the same structural pattern as the ODS page.

#### Scenario: Default tab on page load
- **WHEN** the AU municipio page loads
- **THEN** the "Seguimiento" tab is active by default

#### Scenario: Switching to "Descriptivo" tab
- **WHEN** a user clicks the "Descriptivo" tab
- **THEN** the `MunicipioAuDescriptivo` component is displayed
- **AND** the "Seguimiento" component is hidden

#### Scenario: Switching to "Seguimiento" tab
- **WHEN** a user clicks the "Seguimiento" tab
- **THEN** the `MunicipioAuSeguimiento` component is displayed
- **AND** the "Descriptivo" component is hidden

### Requirement: AU tab components are empty stubs
The `MunicipioAuSeguimiento` and `MunicipioAuDescriptivo` components SHALL exist as valid, renderable Vue components with no content, serving as placeholders for future implementation.

#### Scenario: Rendering stub components
- **WHEN** either stub component is rendered inside the AU municipio page
- **THEN** no errors are thrown and the component renders an empty or minimal placeholder
