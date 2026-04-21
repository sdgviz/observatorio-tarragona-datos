# home-index-au-map-visualization (delta)

## MODIFIED Requirements

### Requirement: AU objective selector on home

When the visualization store mode is Agenda Metropolitana de Tarragona, the homepage SHALL show a Tarragona línea-estratégica selector in place of the ODS objective selector, using labels and colors from the Tarragona taxonomy (provided by `tarragona-metropolitan-taxonomy`; `objetivos_agenda` is now the 6-entry re-export of that taxonomy).

#### Scenario: Selector shows the 6 Tarragona líneas

- **WHEN** the user is on `/` in Agenda Metropolitana de Tarragona mode
- **THEN** the selector SHALL expose exactly 6 options with `id` in `1..6`
- **AND** each option SHALL use the label and color from the Tarragona taxonomy module

#### Scenario: Selector switches Tarragona objective

- **WHEN** the user is on `/` in Agenda Metropolitana de Tarragona mode
- **AND** they choose a different línea estratégica in the selector
- **THEN** subsequent fetches for map and beeswarm data SHALL use that objective id as the query parameter to `/api/au/promedios`
- **AND** the visible active objective styling SHALL match the selected línea color

## ADDED Requirements

### Requirement: Home AU mode uses Tarragona copy

When the visualization store mode is Agenda Metropolitana de Tarragona, user-facing copy on the home page (mode title, selector heading, map legend prefix, page meta title segment) SHALL read "Agenda Metropolitana de Tarragona" (or its short form "Tarragona" / "Líneas Estratégicas" where space is constrained). No user-facing text on the home page SHALL refer to "Agenda Urbana Española" or "AUE" after the migration.

#### Scenario: Home mode heading is Tarragona
- **WHEN** the user is on `/` in Agenda Metropolitana de Tarragona mode
- **THEN** the mode heading SHALL contain "Agenda Metropolitana de Tarragona" (or its approved short form)
- **AND** SHALL NOT contain "Agenda Urbana" or "AUE"
