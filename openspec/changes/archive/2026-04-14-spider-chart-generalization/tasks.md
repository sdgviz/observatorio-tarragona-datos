## 1. Parameterize DoubleSpiderMinMax

- [x] 1.1 Add `axisCount` prop (default `17`) and replace all three `Array.from({ length: 17 })` occurrences with `Array.from({ length: props.axisCount })`
- [x] 1.2 Replace `index / 17` in `angleForIndex()` with `index / props.axisCount`
- [x] 1.3 Add `axisColors` prop (`string[]`, default derived from `ods_list` colors) and replace `odsList[i]?.color` references with `props.axisColors[i]`
- [x] 1.4 Add `axisLabels` prop (`string[]`, default empty) and update the label fallback: use `props.axisLabels[i]` when available, fall back to `t('ods_${i+1}_name')` only when `axisLabels` is empty
- [x] 1.5 Update `selectedOds` default from `Array.from({ length: 17 })` to `Array.from({ length: props.axisCount })`
- [x] 1.6 Remove `import odsList from '~/lib/presupuestos/config/ods-list'` — move the default color array into the prop default function
- [x] 1.7 Update comparison sanitization in `comparisonSanitized` to use `props.axisCount` instead of `17`

## 2. Update ODS Consumer

- [x] 2.1 In `IndicadoresView.vue`, pass `axisColors` and `axisLabels` props explicitly to `DoubleSpiderMinMax` using `ods_list` colors and i18n ODS names — ensures no visual regression even though defaults would still work
- [x] 2.2 Verify ODS spider renders identically after changes (visual check)

## 3. Add Spider to AU Seguimiento

- [x] 3.1 Add `overviewValuesFromHierarchy()` function in `Seguimiento.vue` — same logic as ODS version but with `Array.from({ length: 10 })` using AU taxonomy `objectiveCount`
- [x] 3.2 Add computed properties for spider: `backendOverviewValues`, `overviewHasMeaningfulData`, `isOverviewSkeleton`, `spiderComparisons` (same pattern as ODS)
- [x] 3.3 Compute `axisColors` (from `objetivos_agenda` colors) and `axisLabels` (from `objetivos_agenda` names) for the AU spider
- [x] 3.4 Add the spider overview section to `Seguimiento.vue` template — skeleton, `DoubleSpiderMinMax` with `axisCount=10` / AU colors / AU labels, or empty state, inside a bordered card matching the ODS layout
- [x] 3.5 Wire `selectedOds` to `[focusedObj]` so the spider highlights the currently focused AU objective
- [x] 3.6 Wire `spiderComparisons` from AU comparison hierarchies

## 4. Bug Fix: AU promedios table

- [x] 4.1 Fix AU API endpoint (`server/api/au/indicadores.get.ts`) to query `PROMEDIOS_AGENDAS` instead of `PROMEDIOS_ODS` — the AU promedio_indice values were all null because the wrong table was being queried
