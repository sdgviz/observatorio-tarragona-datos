# beeswarm-filter-emphasis

## ADDED Requirements

### Requirement: Multi-INE filter emphasis prop
`BeeswarmChart` SHALL accept an optional list prop (e.g. `filterEmphasisInes`) containing zero or more `codigo_ine` values. When the list is non-empty, every dot whose `codigoIne` is in the list SHALL receive **strong** emphasis styling via **fill** (full color scale), **opacity**, and **stroke** comparable to readable emphasis on the chart. Dots not in the list SHALL be de-emphasized relative to emphasized dots when the list is non-empty. **Dot radius SHALL remain data-driven** (same `getBaseRadius` / secondary-size rules as unfiltered dots) for filter-matched dots so the distribution geometry is not distorted; only hover emphasis MAY temporarily enlarge a dot.

#### Scenario: Multiple municipalities emphasized
- **WHEN** `filterEmphasisInes` contains INEs A, B, and C and the chart has datapoints for those INEs
- **THEN** dots A, B, and C SHALL appear visually emphasized (fill/opacity/stroke)
- **AND** other dots SHALL appear visually subdued compared to A, B, and C
- **AND** radii for A, B, and C SHALL match the same sizing rules as if the filter list were empty

#### Scenario: Empty filter list restores default styling
- **WHEN** `filterEmphasisInes` is empty or omitted
- **THEN** the chart SHALL NOT apply filter-based multi-emphasis styling
- **AND** existing behaviour for `highlights` and `highlightedIne` SHALL remain unchanged for callers that do not use the new prop

### Requirement: No matching municipalities — subdued all dots

`BeeswarmChart` SHALL accept an optional boolean prop (e.g. `filterEmphasisNoMatches`). When true, every dot SHALL use the same subdued **fill** and **opacity** as dots outside a non-empty `filterEmphasisInes` set (so the chart does not look unfiltered when the parent has active filters but an empty intersection). **Hover** (`highlightedIne`) SHALL still receive full emphasis for the hovered dot. When `filterEmphasisNoMatches` is false, this rule SHALL not apply.

#### Scenario: Active filters with empty intersection

- **WHEN** `filterEmphasisNoMatches` is true and `filterEmphasisInes` is empty
- **THEN** every dot SHALL render with subdued fill/opacity relative to the normal emphasized state
- **AND** a hovered dot MAY use full color/opacity for readability

#### Scenario: Prop omitted

- **WHEN** `filterEmphasisNoMatches` is omitted or false
- **THEN** behaviour SHALL follow the existing `filterEmphasisInes` / `highlights` rules without this global subdued mode

### Requirement: Hover precedence over filter emphasis
When both `filterEmphasisInes` is non-empty and `highlightedIne` is set (hover), the hovered INE SHALL receive the strongest emphasis (including any permitted radius bump for hover); other filter-matched INEs MAY remain emphasized at a secondary level via stroke/fill, but the chart SHALL NOT throw errors.

#### Scenario: Hover over a filtered dot
- **WHEN** `filterEmphasisInes` is non-empty and the user hovers a dot in the filter set
- **THEN** that dot SHALL be visually distinguishable as the active hover target

#### Scenario: Hover over a non-filtered dot
- **WHEN** `filterEmphasisInes` is non-empty and the user hovers a dot outside the filter set
- **THEN** the chart SHALL update `highlightedIne` as today
- **AND** the simulation SHALL NOT crash

### Requirement: Precedence with `highlights`
When `filterEmphasisInes` is non-empty, filter-based fill/opacity emphasis SHALL take precedence over `highlights` for dimming non-matching dots (non-filtered dots use subdued styling per filter rules).

#### Scenario: Filter active with legacy highlights prop
- **WHEN** both `filterEmphasisInes` and `highlights` are provided and the filter list is non-empty
- **THEN** the chart SHALL apply filter emphasis rules for fill/opacity
- **AND** behaviour SHALL remain defined and stable

### Requirement: Backward compatibility
Existing pages that do not pass `filterEmphasisInes` SHALL require no code changes to preserve current visuals.

#### Scenario: Homepage chart unchanged
- **WHEN** a page uses `BeeswarmChart` without `filterEmphasisInes`
- **THEN** rendering SHALL match pre-change behaviour for the same props
