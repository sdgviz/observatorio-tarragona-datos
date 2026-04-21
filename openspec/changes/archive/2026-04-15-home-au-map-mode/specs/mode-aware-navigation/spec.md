# mode-aware-navigation

## ADDED Requirements

### Requirement: Homepage map section reacts to mode toggle

When the user toggles between ODS and Agenda Urbana while on the home route, the map section (objective selector, data fetches, zoom/emphasis, and beeswarm input) SHALL update to match the new mode immediately, with no route change.

#### Scenario: Switching to AU on home refreshes AU visualization

- **WHEN** the user is on `/`
- **AND** they switch the header toggle to Agenda Urbana
- **THEN** `visualizationStore.setMode(AU)` SHALL run as today
- **AND** the home map SHALL apply AU bounding zoom, AUE emphasis, and AU choropleth data
- **AND** no navigation away from `/` SHALL occur

#### Scenario: Switching back to ODS on home restores ODS visualization

- **WHEN** the user is on `/` in AU mode
- **AND** they switch the header toggle to ODS
- **THEN** the home map SHALL restore province-wide default zoom behavior used today for ODS home
- **AND** the ODS objective selector and ODS promedios layer SHALL be shown again
