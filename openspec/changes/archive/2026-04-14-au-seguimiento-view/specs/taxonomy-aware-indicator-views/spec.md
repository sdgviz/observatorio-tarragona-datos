## ADDED Requirements

### Requirement: TaxonomyConfig interface
The system SHALL define a `TaxonomyConfig` interface in `app/types/taxonomy.ts` with the following fields: `key` (`'ods' | 'au'`), `objectiveCount` (number), `idPrefix` (string), `iconPath` (function: number → string), `colorByNum` (function: number → string), `sectionLabel` (function: (number, string) → string), and `scrollAnchorPrefix` (string).

#### Scenario: ODS default config
- **WHEN** no `taxonomyConfig` prop is provided to a shared component
- **THEN** the component SHALL behave identically to its current ODS behavior (icons from `/svg_ods/`, colors from `ods_list`, labels prefixed with "ODS")

#### Scenario: AU config provided
- **WHEN** `taxonomyConfig` with `key: 'au'` is provided
- **THEN** the component SHALL use `iconPath` for section header icons, `colorByNum` for accent colors, `sectionLabel` for section heading text, and `scrollAnchorPrefix` for scroll-spy anchor IDs

### Requirement: IndicadoresListView accepts taxonomy config
`IndicadoresListView` SHALL accept an optional `taxonomyConfig` prop. When provided, section headers SHALL use `taxonomyConfig.iconPath(sec.odsNum)` for the icon, `taxonomyConfig.sectionLabel(sec.odsNum, sec.objetivoNombre)` for the heading text, and `taxonomyConfig.scrollAnchorPrefix` for the section `id` attribute.

#### Scenario: AU list view renders AU icons and labels
- **WHEN** `IndicadoresListView` receives a `taxonomyConfig` with `key: 'au'`
- **THEN** each section header SHALL display the AU objective icon from `/svg_agenda/agenda_N.svg`
- **AND** the heading SHALL read "OE N · {name}" instead of "ODS N · {name}"
- **AND** the section ID SHALL use the AU scroll anchor prefix

#### Scenario: ODS list view unchanged without config
- **WHEN** `IndicadoresListView` does not receive a `taxonomyConfig` prop
- **THEN** rendering SHALL be identical to current behavior

### Requirement: IndicadoresDashboardView accepts taxonomy config
`IndicadoresDashboardView` SHALL accept an optional `taxonomyConfig` prop with the same behavior as `IndicadoresListView` for section headers, icons, and colors.

#### Scenario: AU dashboard view renders AU objective headers
- **WHEN** `IndicadoresDashboardView` receives a `taxonomyConfig` with `key: 'au'`
- **THEN** each section header SHALL display AU icons and labels
- **AND** evolution card accent colors SHALL use `taxonomyConfig.colorByNum`

#### Scenario: ODS dashboard view unchanged without config
- **WHEN** `IndicadoresDashboardView` does not receive a `taxonomyConfig` prop
- **THEN** rendering SHALL be identical to current behavior

### Requirement: IndicadoresPanel accepts taxonomy config
`IndicadoresPanel` SHALL accept an optional `taxonomyConfig` prop to render the correct objective icon in the detail slide-over.

#### Scenario: AU panel shows AU icon
- **WHEN** the panel opens for an AU indicator
- **THEN** the objective icon SHALL be resolved via `taxonomyConfig.iconPath`
