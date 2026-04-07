# home-municipio-map-beeswarm

## ADDED Requirements

### Requirement: Unified municipio selection on the home page

On the homepage (`index.vue`), the selected municipality shown in the municipio combobox SHALL be the single source of truth for persistent selection. Clicking a municipality region on the map or a dot in the home beeswarm SHALL update that same selection state as if the user had chosen that municipality in the combobox (same INE code).

#### Scenario: Map click selects municipio
- **WHEN** the user clicks a municipality path on the home map
- **THEN** the combobox value SHALL update to that municipality’s INE
- **AND** map and beeswarm highlighting SHALL reflect the selected municipio per existing highlight rules

#### Scenario: Beeswarm dot click selects municipio
- **WHEN** the user clicks a dot in the home beeswarm chart
- **THEN** the combobox value SHALL update to that dot’s `codigoIne`
- **AND** map and beeswarm highlighting SHALL reflect the selected municipio

#### Scenario: Combobox still drives selection
- **WHEN** the user selects a municipality from the combobox without using the map or beeswarm
- **THEN** the map and beeswarm SHALL show the same selected state as today

---

### Requirement: Home map click does not navigate immediately

On the homepage only, clicking the map SHALL NOT navigate to the municipio detail route by itself. Navigation to municipio data SHALL occur only via the explore control defined below (or other explicit navigation elsewhere).

#### Scenario: Map click stays on home
- **WHEN** the user clicks a municipality on the home map
- **THEN** the app SHALL remain on the homepage
- **AND** the selection state SHALL update per the unified selection requirement

#### Scenario: Other pages keep navigate-on-click
- **WHEN** `MapWrapper` is used on a page that configures the default navigate-on-click behavior
- **THEN** a map click SHALL still navigate to the municipio detail route as it does today

---

### Requirement: Explore municipio link next to the map

When a municipality is selected on the homepage, the UI SHALL show a link-style control to the right of the map whose label includes the selected municipality’s display name and expresses intent to explore that municipality’s data (e.g. “Explore … data”). The control SHALL navigate to the municipio detail URL appropriate for the active app mode (ODS vs agenda urbana), consistent with existing routing conventions.

#### Scenario: Link visible when selected
- **WHEN** a municipality is selected on the homepage
- **THEN** the explore link SHALL be visible to the right of the map
- **AND** its text SHALL include that municipality’s name

#### Scenario: Link hidden when none selected
- **WHEN** no municipality is selected on the homepage
- **THEN** the explore link SHALL NOT be shown

#### Scenario: Link navigates to detail
- **WHEN** the user activates the explore link while in ODS mode
- **THEN** the app SHALL navigate to the ODS municipio route for the selected INE

#### Scenario: Localized label
- **WHEN** the user’s locale is Catalan or Spanish
- **THEN** the explore link label SHALL use the corresponding locale string with the municipality name interpolated
