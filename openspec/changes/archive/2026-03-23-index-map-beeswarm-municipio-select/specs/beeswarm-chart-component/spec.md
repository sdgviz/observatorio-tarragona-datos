# beeswarm-chart-component

## ADDED Requirements

### Requirement: Optional click to commit municipio selection

The `BeeswarmChart` component SHALL support an optional mode in which a primary click (or activation) on a dot emits the clicked datapoint’s `codigoIne` to the parent for binding as persistent selection. When this mode is disabled (default), the component SHALL NOT emit selection on click and SHALL behave as today (hover highlight / tooltip only).

#### Scenario: Opt-in click emits INE
- **WHEN** the parent enables the documented opt-in prop for click selection
- **AND** the user clicks a rendered dot
- **THEN** the component SHALL emit the corresponding `codigoIne` for the parent to store as selection

#### Scenario: Default no selection on click
- **WHEN** the opt-in prop is not enabled
- **AND** the user clicks a dot
- **THEN** the component SHALL NOT emit the selection event used for combobox binding

#### Scenario: Click does not replace hover highlight contract
- **WHEN** click selection is enabled
- **THEN** hover behavior for `update:highlightedIne` and tooltip SHALL remain available unless a future requirement explicitly constrains it
