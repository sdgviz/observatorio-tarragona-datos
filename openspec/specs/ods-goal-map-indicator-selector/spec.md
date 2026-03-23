# ODS goal map indicator selector

## ADDED Requirements

### Requirement: Map layer selection on ODS goal pages
Each ODS goal page SHALL render the territorial map with a user-visible control to choose the **data layer** displayed on the map. The control SHALL offer at least: (1) the **objective-level aggregate** value per municipality for the current ODS, and (2) **each indicator** that belongs to that ODS. Changing the selection SHALL update map choropleth colors and the legend to match the selected layer’s numeric domain.

#### Scenario: Default layer is objective aggregate
- **WHEN** the user opens `/ods/n` with valid n
- **THEN** the map SHALL default to the objective aggregate layer for n
- **AND** data SHALL be consistent with `/api/ods/promedios?objetivo=n` semantics

#### Scenario: User switches to an indicator layer
- **WHEN** the user selects a specific indicator from the layer control
- **THEN** the map SHALL display municipality values for that indicator
- **AND** the legend SHALL reflect the value range for that indicator on the map

### Requirement: Color scale uses active ODS branding
Regardless of whether the layer is aggregate or indicator-level, the sequential color scale applied to the map SHALL anchor to the **official color of the current ODS objective** (same principle as the homepage map integration).

#### Scenario: ODS 6 with indicator layer
- **WHEN** the user views `/ods/6` and selects an indicator under ODS 6
- **THEN** the choropleth scale SHALL still read as ODS 6 (official palette direction), not a generic unrelated hue

### Requirement: Map orchestration lives in the page
The ODS goal page (or a dedicated composable used by that page) SHALL fetch or derive the data for the selected layer and pass `values` and `colorScale` into `MapWrapper` (or equivalent map container). The map component itself SHALL NOT embed indicator-specific fetch logic.

#### Scenario: Layer change triggers data load
- **WHEN** the user changes the map layer from aggregate to a given indicator
- **THEN** the page SHALL obtain municipality-level values for that indicator
- **AND** `MapWrapper` SHALL receive updated props without requiring a full page reload
