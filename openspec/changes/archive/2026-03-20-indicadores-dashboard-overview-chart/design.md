## Context

`IndicadoresDashboardView` currently renders per-indicator cards (BAN/evolution) but no global overview. A spider chart already exists as `DoubleSpiderMinMax.vue` under the presupuestos area, but it is tightly coupled to that context (untyped props, hardcoded compare values, assumptions about percentages, and mixed responsibilities).

The requested change introduces a top-level ODS overview chart above the indicator grid and reuses the spider visualization with a refactor to make it typed and reusable for indicadores data.

## Goals / Non-Goals

**Goals:**
- Show a single ODS overview chart above the dashboard cards in dashboard mode.
- Refactor `DoubleSpiderMinMax.vue` for reuse and stronger type safety (typed props at minimum).
- Remove the spider chart from `PresupuestosView.vue`.
- Support dynamic scale domain:
  - `0..100` when all overview values are non-negative.
  - `-100..100` when at least one value is negative.

**Non-Goals:**
- Rebuilding the entire spider visualization from scratch.
- Changing backend APIs.
- Redesigning the whole indicadores dashboard layout.

## Decisions

### 1) Keep component file, but decouple from presupuestos semantics
- Reuse `app/components/municipio/ods/presupuestos/charts/DoubleSpiderMinMax.vue` to avoid duplicate chart logic.
- Refactor it to accept typed generic ODS overview data and optional display config.
- Remove hardcoded compare arrays and unused presupuesto-specific assumptions.

### 2) Typed prop contract for spider chart
- Add explicit TypeScript props:
  - `values: number[]` (length 17 expected; normalized ODS values)
  - `labels?: string[]`
  - `domainMode?: 'auto' | 'positive' | 'signed'`
  - `height?: number`
  - `nameMunicipio?: string`
- Internal computed domain:
  - If `domainMode === 'auto'`: choose signed when any value < 0, else positive.
  - Positive mode => `[0, 100]`
  - Signed mode => `[-100, 100]`

### 3) Placement in indicadores dashboard
- Render spider chart section before the card grid in `IndicadoresDashboardView.vue`.
- The overview uses current dashboard dataset (already filtered indicators) to derive one aggregate value per ODS.
- Aggregation approach: average of available indicator index/value already normalized in dashboard context; if ODS has no valid value, set 0.

### 4) Presupuestos cleanup
- Remove import and `displayViz === 20` block from `PresupuestosView.vue`.
- Keep other visualizations unchanged.

## Risks / Trade-offs

- **[Normalization ambiguity]** → Mitigation: lock the spec to explicit domain behavior and document aggregation assumptions.
- **[Chart regressions after refactor]** → Mitigation: preserve visual primitives and refactor incrementally with typed props first.
- **[Shared component coupling across contexts]** → Mitigation: keep props generic and avoid presupuesto-specific naming in internals.

## Migration Plan

1. Refactor `DoubleSpiderMinMax.vue` props/types and remove hardcoded internal compare data.
2. Integrate spider into `IndicadoresDashboardView.vue` above the grid.
3. Remove spider import/render from `PresupuestosView.vue`.
4. Validate rendering with:
   - all non-negative values
   - mixed values (at least one negative)
5. Update tasks checklist to complete.

## Open Questions

- Exact aggregation metric for ODS overview values (e.g., mean of `indice`, mean of normalized `valor`, or weighted metric) should be fixed during implementation based on available stable field semantics.
