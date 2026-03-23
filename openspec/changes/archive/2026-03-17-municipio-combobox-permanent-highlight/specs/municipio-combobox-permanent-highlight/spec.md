# Spec: Municipio combobox and permanent highlight

## ADDED Requirements

### Requirement: Searchable municipality combobox on home

The home page SHALL display a single-select combobox above the beeswarm chart. The combobox SHALL be searchable by municipality name and SHALL list all municipalities from the same data source used by the map and beeswarm (e.g. `/api/municipios/list`). The user SHALL be able to clear the selection.

#### Scenario: User selects a municipality from the combobox

- **WHEN** the user selects a municipality from the combobox
- **THEN** that municipality (by INE code) is stored as the "selected" municipality for the page
- **AND** the selection SHALL persist until the user clears it or selects a different municipality

#### Scenario: User searches in the combobox

- **WHEN** the user types in the combobox
- **THEN** the list SHALL be filtered by municipality name (search/filter)
- **AND** the user SHALL be able to pick one option from the filtered list

#### Scenario: User clears the selection

- **WHEN** the user clears the combobox selection (e.g. clear control or empty value)
- **THEN** the selected municipality SHALL be set to none
- **AND** no permanent highlight SHALL be shown for a selected municipality

### Requirement: Permanent highlight on map and beeswarm

When a municipality is selected in the combobox, it SHALL be permanently highlighted on both the map and the beeswarm chart. This highlight SHALL be independent of the existing hover highlight: hover and selection SHALL be able to be visible at the same time, with distinct styling where applicable.

#### Scenario: Selected municipality is highlighted on map and beeswarm

- **WHEN** a municipality is selected in the combobox
- **THEN** the corresponding region on the map SHALL show a permanent highlight (e.g. border/ring or distinct style)
- **AND** the corresponding point on the beeswarm chart SHALL show a permanent highlight (e.g. included in highlighted set or distinct style)
- **AND** the permanent highlight SHALL remain while the selection is set, regardless of mouse hover

#### Scenario: Hover and selection both visible

- **WHEN** a municipality is selected and the user hovers over another municipality
- **THEN** both the selected municipality and the hovered municipality SHALL be visually emphasized
- **AND** the selected municipality SHALL use a "permanent" style and the hovered one SHALL use the existing hover style (e.g. stroke or opacity) so they are distinguishable

#### Scenario: No permanent highlight when nothing selected

- **WHEN** no municipality is selected in the combobox
- **THEN** only hover SHALL drive highlight on the map and beeswarm
- **AND** behavior SHALL match the previous (pre-change) behavior for hover-only highlighting
