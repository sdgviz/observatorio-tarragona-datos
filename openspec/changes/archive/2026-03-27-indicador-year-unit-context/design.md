## Context

- `OdsIndicador` already has `periodo` and `metadata.unidad`; Lista formats value + unit but does not show year in the table.
- `GET /api/indicadores/valores` already selects and returns `periodo` for latest-per-municipio and single-latest modes; consumers may not pass it into charts.
- `GET /api/ods/promedios` selects only `codigo_ine`, `valor`, `n_indicadores` while `PROMEDIOS_ODS` includes `periodo` (nullable for some objective-level aggregate rows in the transform pipeline).
- `GET /api/indicadores/por-comarca` returns latest value per INE but omits `periodo` even though the join uses `MAX(periodo)` per municipio.
- `BeeswarmChart` tooltips show `valor` and optional `unidad`; home page currently passes empty `unidad` and no year. `MapTarragona` tooltips show only the numeric `valor`.

## Goals / Non-Goals

**Goals:**

- Every API response used for “current snapshot” choropleths or beeswarms exposes `periodo` when the database has it (per row).
- Tooltips and Lista surface year + unit clearly, consistent with existing `IndicadorBanCard` treatment of `periodo`.
- When a whole chart uses one shared unit, axis/footer copy still complements per-point tooltips (Barcelona-style context).

**Non-Goals:**

- Redesigning evolution charts (time already on axis).
- Changing how `PROMEDIOS_ODS` is computed when `periodo` is null (pipeline / data team); UI must tolerate null `periodo` without lying.
- Adding `periodo` to responses where the underlying table has no period column for that row kind beyond what is specified.

## Decisions

1. **`/api/ods/promedios`**: Add `periodo` to the SELECT and JSON body for each row. When `periodo` is null in DB, return `null`; frontend shows an empty state for year or omits the year line (no invented year).

2. **`/api/indicadores/por-comarca`**: Extend each row with `periodo: number | null` — the period of the joined latest row for that `codigo_ine`, null when the LEFT JOIN has no match or valor is null (implementation: same join, expose `i1.periodo`).

3. **`/api/indicadores/valores`**: No behavioral change if already compliant; add spec coverage only. If any branch omitted `periodo`, align implementation.

4. **Beeswarm datapoint**: Extend `BeeswarmDatapoint` with optional `periodo?: number | null`. Tooltip second line: formatted value + unit; third line or suffix: year when `periodo` is non-null. When municipalities can differ in latest year (indicator layer), per-dot tooltip uses per-point `periodo`; axis `unitLabel` remains global unit from metadata/first point.

5. **Map tooltips**: Pass per-municipality optional `periodo` and global `unidad` into `MapTarragona` (or a thin wrapper prop bag) so the tooltip can show “Valor · unit · año” without changing the `values` map shape alone — e.g. optional parallel `periodos?: Record<string, number>` or enrich via parent-computed tooltip payload. Prefer **minimal API**: optional `Record<string, number | null>` for `periodoByIne` plus optional `valueUnit?: string | null` for the active layer; omit keys when unused (aggregate layer with single conceptual year may pass one caption via slot or subtitle on parent instead of per-INE period when all rows share the same `periodo`).

6. **Aggregate ODS map (home / goal aggregate layer)**: If all rows share the same non-null `periodo` from `promedios`, parent MAY render a single subtitle “Datos {periodo}” next to the legend; if mixed or null, show only generic copy or hide year line.

## Risks / Trade-offs

- **[Risk] Nullable `periodo` on objective-level promedio rows** → Mitigation: UI never fabricates a year; optional footnote that the composite has no single reference year when null.
- **[Risk] Per-municipio latest years differ for one indicator** → Mitigation: map and beeswarm tooltips use per-INE `periodo` from API; legend subtitle must not claim a single year unless verified equal.
- **[Risk] Tooltip clutter on mobile** → Mitigation: keep one compact line where possible (e.g. `12,3 % · 2023`).

## Migration Plan

- Deploy API first (additive fields), then frontend. Rollback: revert UI; old clients ignore new JSON keys.

## Open Questions

- Whether to add a pipeline change later so objective-level `PROMEDIOS_ODS` rows always get a non-null `periodo` (data product decision).
