## 1. Data wiring (IndicadoresView)

- [x] 1.1 Add a pure helper or computed that maps `OdsHierarchyResponse | null` to `number[17]` using the same `objetivos` / `promedio_indice` logic as `backendOverviewValues`.
- [x] 1.2 Build `comparisons` for the spider from `hierarchyComp1` / `hierarchyComp2` and `nombreByIne` (name + values), only when hierarchy is loaded and values are meaningful.
- [x] 1.3 Pass `nameMunicipio` (primary display name), `values` (unchanged), and optional `comparisons` into `MunicipioOdsPresupuestosChartsDoubleSpiderMinMax`.

## 2. DoubleSpiderMinMax — dots and labels

- [x] 2.1 Remove opacity dimming on ODS vertex `<circle>` elements (full opacity always per spec).
- [x] 2.2 Replace rim-only numeric labels with left/right anchored labels (by axis half-plane), including leader lines from outer axis points to label anchors; keep i18n for label text where applicable.
- [x] 2.3 Adjust layout constants (`outerRadius`, offsets) so labels and leaders fit on narrow widths without breaking the viewBox.

## 3. DoubleSpiderMinMax — multi-series and legend

- [x] 3.1 Extend props with optional `comparisons?: { name: string, values: number[] }[]` (or equivalent) and compute polygon paths + dots per serie with distinct stroke/fill (primary unchanged or slightly dominant).
- [x] 3.2 Render a legend or name row for primary + each comparison; wire `mouseenter` / `mouseleave` to a `hoveredSeries` state that dims non-hovered series’ paths and dots.
- [x] 3.3 Ensure domain (`domainMode`, min/max) is shared across all series so shapes are comparable.

## 4. Verification

- [x] 4.1 Manually verify: no comparison → single polygon; with 1–2 comparisons → extra polygons; hover each name dims others; dots stay opaque when `selectedOds` is a single ODS.
- [x] 4.2 Run lint/typecheck on touched Vue files in `diputacion_tarragona`.
