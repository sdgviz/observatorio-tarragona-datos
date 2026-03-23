## ADDED Requirements

### Requirement: Dashboard overview spider section
The indicadores dashboard SHALL render an ODS overview spider chart above the indicator-card grid when dashboard mode is active.

#### Scenario: Dashboard mode displays overview chart
- **WHEN** the user selects dashboard mode in `IndicadoresView`
- **THEN** `IndicadoresDashboardView` SHALL render the overview spider chart before the card grid

### Requirement: Overview values derived from backend ODS hierarchy data
The overview spider chart SHALL use ODS-level values provided by backend (`promedio_indice` in `/api/ods/indicadores` response), producing one value per ODS axis.

#### Scenario: Overview uses backend ODS averages
- **WHEN** the dashboard overview is rendered
- **THEN** each ODS axis value SHALL come from backend `promedio_indice` for that ODS
- **AND** the frontend SHALL NOT recompute those values by averaging visible indicator rows

#### Scenario: ODS selector does not change spider values
- **WHEN** the selected ODS filters change in dashboard mode
- **THEN** the spider chart SHALL keep the same 17 ODS values
- **AND** selection effects MAY be visual-only (highlight/mute), but not value mutation

### Requirement: Spider chart removed from presupuestos view
`PresupuestosView` SHALL no longer render `DoubleSpiderMinMax` in its visualization selector.

#### Scenario: Presupuestos view no longer includes DoubleSpiderMinMax
- **WHEN** the user navigates visualizations in `PresupuestosView`
- **THEN** the old `DoubleSpiderMinMax` slot (`displayViz === 20`) SHALL not be shown
