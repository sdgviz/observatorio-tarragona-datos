## Context

The `DoubleSpiderMinMax.vue` component renders a radar/spider chart used in the ODS IndicadoresView as an overview of per-objective average index values. It currently has six hardcoded ODS dependencies:

1. `import odsList` from `~/lib/presupuestos/config/ods-list` — per-axis colors
2. `Array.from({ length: 17 })` — three occurrences locking the axis count
3. `index / 17` in `angleForIndex()` — angle distribution
4. `t('ods_${i + 1}_name')` — fallback axis labels
5. `selectedOds` default to 1-17 — selection array
6. The consumer (`IndicadoresView.vue`) builds a 17-element values array in `overviewValuesFromHierarchy`

The AU Seguimiento view (built in Spec 1) needs the same spider overview but with 10 axes and `objetivos_agenda` colors. The `TaxonomyConfig` interface already exists with `objectiveCount`, `colorByNum`, and related fields.

## Goals / Non-Goals

**Goals:**
- Make `DoubleSpiderMinMax` work with any axis count (not just 17)
- Allow callers to supply per-axis colors and labels explicitly
- Add spider overview to AU Seguimiento with comparison support
- Keep existing ODS spider behavior unchanged (no visual regression)

**Non-Goals:**
- Redesigning the chart's visual style or D3 approach
- Adding new chart features (e.g., axis label truncation, responsive text)
- Extracting the overview value computation into a shared composable (Spec 3 territory)

## Decisions

### D1: Three new props instead of passing TaxonomyConfig directly

**Decision**: Add `axisCount`, `axisColors`, and `axisLabels` as individual props rather than a single `TaxonomyConfig` prop.

**Alternatives**: (a) Accept `TaxonomyConfig` as a prop. (b) Accept a structured `SpiderConfig` object.

**Rationale**: The spider chart is a generic D3 visualization component — it should not depend on the `TaxonomyConfig` type, which is a domain concept. Individual primitive props (`number`, `string[]`) keep the chart decoupled and testable. The parent maps from `TaxonomyConfig` to these props, which is a one-liner.

### D2: Prop defaults preserve ODS behavior

**Decision**: `axisCount` defaults to `17`, `axisColors` defaults to ODS colors from `ods_list` (moved to a default function), `axisLabels` defaults to empty (triggering the existing `t('ods_${i+1}_name')` fallback).

**Alternatives**: No defaults — require all callers to pass everything.

**Rationale**: The only current caller (ODS IndicadoresView) passes no axis config today. Defaulting to ODS behavior means zero changes to the ODS consumer — backward compatibility with no code change required. The fallback label logic stays as a last resort.

### D3: AU Seguimiento spider mirrors ODS pattern

**Decision**: Add a spider overview section in `Seguimiento.vue` using the same pattern as `IndicadoresView.vue`: compute `overviewValuesFromHierarchy` (but with 10 slots), derive `axisColors`/`axisLabels` from `objetivos_agenda`, and pass comparisons.

**Alternatives**: Create a separate AU spider component.

**Rationale**: The whole point of this spec is to make the chart reusable. Duplicating the component would defeat the purpose. The only caller-side difference is the number of axes and the color/label arrays.

### D4: Remove `import odsList` from the chart component

**Decision**: The chart component will no longer import `odsList` directly. Instead, default `axisColors` will be derived from the same data but via a default prop function.

**Rationale**: Removing the internal import makes the component truly data-independent. The default prop still provides backward-compatible ODS colors, but the dependency direction is inverted — the consumer decides, not the chart.

## Risks / Trade-offs

- **[Visual regression in ODS spider]** → Mitigated by prop defaults that exactly reproduce current behavior. The ODS consumer doesn't need to change.
- **[Label text differs between ODS and AU]** → AU labels will be the `objetivos_agenda[].name` strings (uppercase, longer). Layout may need the same `text-[10px]` rim labels. Acceptable since the chart already clips long labels — the axis numbers are the primary identifier.
- **[10-axis chart has more whitespace]** → With fewer axes the polygon has wider angles. Visually this works fine for radar charts. No mitigation needed.

## Post-Implementation Fix

- **[AU `promedio_indice` all null]** — The AU API endpoint (`server/api/au/indicadores.get.ts`) was querying the `PROMEDIOS_ODS` table (which only contains `2030-*` entries) instead of `PROMEDIOS_AGENDAS` (which contains `AUE-*` entries). Fixed by replacing the table name in both query branches (filtered and unfiltered periodo). The `PROMEDIOS_AGENDAS` table stores objective-level aggregates only (not meta-level), which is the expected data structure.
