# municipio-indicadores-table (change delta)

## ADDED Requirements

### Requirement: Indicator row secondary line uses ODS meta (target) name

In the Lista **name** column, the line below the indicator title SHALL identify the indicator’s **meta (target, nivel 2)** from the ODS hierarchy: the text SHALL use the meta’s **`nombre`** as returned under `objetivos[].metas[].nombre` for the meta that contains the indicator. The line SHALL **not** use only the **goal (objetivo, nivel 1)** name for that role. The ODS goal **number** MAY prefix the line for orientation (e.g. `ODS {n} · {meta nombre}`).

#### Scenario: Row subtitle shows meta, not goal

- **WHEN** the Lista view shows a row for an indicator that belongs to a meta whose name differs from its parent goal name
- **THEN** the secondary line under the indicator name SHALL include that **meta** name
- **AND** SHALL NOT substitute the goal name for the meta name on that line

#### Scenario: Detail panel matches row context

- **WHEN** the user opens the slide-over detail panel from a Lista row
- **THEN** the context line under the indicator title in the panel SHALL use the same **meta** naming rule as the row
