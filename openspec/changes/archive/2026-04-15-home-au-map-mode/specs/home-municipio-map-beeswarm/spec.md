# home-municipio-map-beeswarm

## ADDED Requirements

### Requirement: Explore control navigates to AU municipio from home

When the visualization store is in Agenda Urbana mode, the homepage explore control SHALL navigate to the AU municipio detail route for the selected INE.

#### Scenario: Explore opens AU detail

- **WHEN** the user is on `/` in AU mode with a selected municipio
- **AND** they activate the explore control
- **THEN** the app SHALL navigate to `/municipios/au/<ine>`

### Requirement: Home visualization data source follows store mode

The homepage map and beeswarm primary metric layer SHALL use ODS promedios when the store mode is ODS and AU promedios when the store mode is AU. Unified selection between combobox, map, and beeswarm applies to **all** municipios in ODS mode and **only** to municipios with `id_especial3 === 'aue'` in AU mode.

#### Scenario: AU mode uses AU promedios API

- **WHEN** the store mode is AU
- **THEN** the homepage SHALL load provincial averages from `/api/au/promedios` for the selected AU objective
- **AND** map and beeswarm interactions SHALL update `selectedIne` only when the target INE is in the AUE set
- **AND** the map SHALL not show tooltip or hover highlight for non-AUE municipios

#### Scenario: ODS mode unchanged

- **WHEN** the store mode is ODS
- **THEN** the homepage SHALL continue to load `/api/ods/promedios` for the selected ODS objective
- **AND** existing scenarios for unified selection and explore SHALL remain valid
