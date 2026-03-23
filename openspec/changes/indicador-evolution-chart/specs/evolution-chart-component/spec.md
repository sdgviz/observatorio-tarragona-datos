## ADDED Requirements

### Requirement: Generic EvolutionChart component

The system SHALL provide a reusable Vue component `EvolutionChart.vue` at `app/components/` that renders a D3 area chart showing the temporal evolution of a data series. The component SHALL be agnostic to any specific data domain (ODS, Agenda Urbana, etc.).

#### Scenario: Render chart with valid datapoints

- **WHEN** the component receives a `datapoints` prop with `[{ year: 2018, value: 12.5 }, { year: 2019, value: 14.0 }, { year: 2020, value: 13.2 }]`
- **THEN** the chart SHALL render an SVG with a filled area and line connecting the three data points, with the X axis showing years 2018, 2019, 2020 and the Y axis scaled to the data range.

#### Scenario: Render chart with empty datapoints

- **WHEN** the component receives an empty `datapoints` array
- **THEN** the component SHALL render an empty state (blank SVG with axes but no area/line).

### Requirement: Customizable color

The component SHALL accept a `color` prop (string, CSS color) that defines the fill color of the area and the stroke color of the line. The area fill SHALL use reduced opacity of the given color. A default color SHALL be provided when the prop is omitted.

#### Scenario: Custom color applied

- **WHEN** the component receives `color="#E5243B"`
- **THEN** the area fill SHALL use `#E5243B` with reduced opacity and the line stroke SHALL use `#E5243B`.

#### Scenario: Default color when prop omitted

- **WHEN** no `color` prop is provided
- **THEN** the chart SHALL render with a default blue color.

### Requirement: Configurable chart size

The component SHALL accept `width` (number, pixels) and `height` (number, pixels) props that control the rendered size of the chart. Default values SHALL be 480 for width and 320 for height.

#### Scenario: Default size

- **WHEN** no `width` or `height` props are provided
- **THEN** the chart SVG SHALL render at 480×320 pixels.

#### Scenario: Custom size

- **WHEN** `width=600` and `height=400` are provided
- **THEN** the chart SVG SHALL render at 600×400 pixels.

### Requirement: Gap-aware X axis

The X axis SHALL use a linear scale spanning from the minimum to maximum year in the datapoints. When there are years in the range without a corresponding datapoint, the axis SHALL still display that year's tick mark, but no data point, line segment, or area fill SHALL be rendered for that year. The line SHALL be interrupted at the gap.

#### Scenario: Continuous years

- **WHEN** datapoints are `[{ year: 2018, value: 10 }, { year: 2019, value: 12 }, { year: 2020, value: 11 }]`
- **THEN** the X axis SHALL show ticks at 2018, 2019, 2020 with a continuous line and filled area connecting all three.

#### Scenario: Years with gaps

- **WHEN** datapoints are `[{ year: 2015, value: 8 }, { year: 2018, value: 12 }, { year: 2020, value: 15 }]`
- **THEN** the X axis SHALL show ticks at 2015, 2016, 2017, 2018, 2019, 2020. No point SHALL be rendered for 2016, 2017, 2019. The line SHALL break at gaps (not connect 2015 directly to 2018 with a single segment through the gap space).

### Requirement: Load animation

The chart SHALL animate on initial mount. The area and line SHALL appear progressively (e.g., expanding from left to right or fading in).

#### Scenario: Chart mounts with animation

- **WHEN** the component is mounted and datapoints are available
- **THEN** the area and line SHALL animate into view over a brief duration (between 500ms and 1200ms).

### Requirement: Hover tooltip

When the user hovers over the chart area, the component SHALL display a vertical guide line at the closest data point's X position and show the year and value of that data point.

#### Scenario: Hover over chart

- **WHEN** the user moves the mouse over the chart area
- **THEN** a vertical line SHALL appear at the X position of the nearest data point, and a text label SHALL display the year and formatted value.

#### Scenario: Mouse leaves chart

- **WHEN** the user moves the mouse out of the chart area
- **THEN** the vertical guide line and tooltip text SHALL disappear.

### Requirement: Optional value formatter

The component SHALL accept an optional `valueFormatter` prop (function `(value: number) => string`). When provided, this function SHALL be used to format the value displayed in the tooltip. When omitted, the raw numeric value SHALL be displayed.

#### Scenario: Custom formatter

- **WHEN** `valueFormatter` is `(v) => v.toFixed(1) + ' %'` and the hovered point has `value: 12.345`
- **THEN** the tooltip SHALL display `12.3 %`.

### Requirement: SSR safety

The component SHALL be wrapped in `<ClientOnly>` with a `<USkeleton>` fallback matching the chart dimensions, since D3 requires the DOM and cannot run server-side.

#### Scenario: Server-side render

- **WHEN** the page is rendered on the server
- **THEN** a `<USkeleton>` placeholder SHALL be shown instead of the chart SVG.

### Requirement: Integration in IndicadoresPanel

`IndicadoresPanel.vue` SHALL fetch the time series from `GET /api/indicadores/valores?indicator_id=<id>&ine=<ine>` when the panel opens with a selected indicator. The response SHALL be transformed into the `datapoints` format and passed to the `EvolutionChart` component. The chart color SHALL correspond to the ODS objetivo color. While loading, a skeleton placeholder SHALL be shown.

#### Scenario: Panel opens with indicator

- **WHEN** the user opens `IndicadoresPanel` for an indicator with `id_indicador = "IND-001"` in municipio with `codigo_ine = "43001"`
- **THEN** the panel SHALL fetch `GET /api/indicadores/valores?indicator_id=IND-001&ine=43001`, transform the response into `[{ year, value }]`, and render an `EvolutionChart` with the data.

#### Scenario: Panel loading state

- **WHEN** the fetch is in progress
- **THEN** a `<USkeleton>` matching the chart dimensions SHALL be shown in the chart area.

#### Scenario: No time series data available

- **WHEN** the fetch returns an empty array
- **THEN** the chart section SHALL not be displayed (or show an empty state message).
