# ods-goal-indicator-beeswarms (delta)

## ADDED Requirements

### Requirement: ODS goal beeswarms use region filter set
On `/ods/{n}`, all `BeeswarmChart` instances on the page SHALL receive the same **filter-derived INE set** from the REGIONES combination controls (`id_especial`, `id_poblacion`, municipio). They SHALL use the chart’s multi-INE filter emphasis capability so multiple municipalities can appear strongly emphasized at once. Hover interaction across charts and the map SHALL remain coordinated.

#### Scenario: Filter set applied to every indicator chart
- **WHEN** the user sets filters that resolve to a non-empty INE set
- **THEN** every beeswarm on the page SHALL emphasize all INEs in that set (and de-emphasize others)
- **AND** changing the filter SHALL update every chart consistently

#### Scenario: No filters
- **WHEN** all filter controls are cleared
- **THEN** beeswarms SHALL NOT apply filter-based multi-emphasis
- **AND** hover-only highlighting SHALL still work as before
