# municipio-indicadores-table (delta)

## ADDED Requirements

### Requirement: Lista table includes reference year column

In **Lista** mode (`IndicadoresListView`), the data table SHALL include a dedicated column for the **reference year** of the snapshot value shown in the row. The cell value SHALL be `OdsIndicador.periodo` formatted as a calendar year (e.g. `2023`). When `periodo` is missing or invalid for a row, the cell SHALL use the same empty treatment as other numeric missings (e.g. em dash). The column header SHALL be localized via `useI18n()` (Catalan and Spanish catalogues updated together).

#### Scenario: Row with periodo shows year

- **WHEN** an indicator row has `periodo` set to a positive year
- **THEN** the reference-year column SHALL display that year
- **AND** the existing Valor column SHALL continue to show `valor` with `metadata.unidad` when present

#### Scenario: Missing periodo

- **WHEN** `periodo` is absent or not a valid year for display
- **THEN** the reference-year column SHALL show a clear empty state (e.g. "—")
- **AND** the row SHALL remain selectable for the detail panel

#### Scenario: Column order

- **WHEN** the table renders with ODS, name, valor, índice, and tendencia
- **THEN** the reference-year column SHALL appear in a logical position (e.g. after Valor or immediately before it) documented in the implementation and kept consistent across breakpoints
