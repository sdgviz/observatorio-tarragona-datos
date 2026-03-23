# Design: Beeswarm optional color scale and variable size

## Context

BeeswarmChart currently accepts `datapoints` (valor, codigoIne, unidad, nombre), a fixed `color`, and optional `highlights`/`highlightedIne`. The map (MapTarragona) uses a `colorScale(value)` so fill is driven by the same variable (e.g. ODS average). The beeswarm does not fetch data; callers pass everything in. Population (or other secondary data) is available in the DB (e.g. REGIONES.poblacion); the parent page or API can expose it and pass a map of codigoIne → value into the chart.

## Goals / Non-Goals

**Goals:**

- Add optional `colorScale?: (value: number) => string`. When present, dot fill = `colorScale(datapoint.valor)` so it matches the map; when absent, keep using `color`.
- Add optional `sizeBySecondaryData?: boolean` and `secondaryValues?: Record<string, number>`. When both are set, dot radius is proportional to `secondaryValues[codigoIne]` (e.g. population). Independent of color scale (can use variable size with or without color scale).
- Keep the chart a pure renderer: no data fetching inside the component.
- Preserve current behavior when the new props are omitted.

**Non-Goals:**

- New API or backend changes (use existing data sources; page/composable wires them).
- Preloading population at build time (future work).
- Changing the X-axis variable or adding further encodings beyond color and size.

## Decisions

### 1. Color scale input: same variable as X axis

- **Choice:** `colorScale` is a function of one number; the chart calls it with `datapoint.valor` (the same value used for the X position).
- **Rationale:** Aligns with the map, which colors by the same metric. No extra field or scale domain needed inside the chart.
- **Alternatives:** Passing a second value per point for color was rejected so the chart stays “one main variable on X, optional scale for color.”

### 2. Secondary data shape: Record&lt;codigoIne, number&gt;

- **Choice:** `secondaryValues?: Record<string, number>` keyed by codigoIne. Missing keys are treated as “no value” (e.g. use default radius or a minimum).
- **Rationale:** Parent can build this from any source (API, REGIONES, composable). Component stays agnostic to the meaning (population, etc.).
- **Alternatives:** Extending `BeeswarmDatapoint` with an optional field (e.g. `poblacion?`) would work but couples the type to one meaning; a generic Record keeps the chart reusable.

### 3. Variable radius and force simulation

- **Choice:** When `sizeBySecondaryData` and `secondaryValues` are used, compute a radius per dot (e.g. scale the secondary value to a min–max pixel range). Use that radius in the D3 force collision so dots do not overlap. When variable size is off, keep the current fixed radius and collision.
- **Rationale:** Variable-size dots need collision by their actual radius; otherwise large dots overlap small ones. Scale domain can be derived from the present `secondaryValues` (e.g. min/max) so the parent does not have to pass a scale.
- **Alternatives:** Fixed collision radius with only visual radius varying would cause overlap; rejected.

### 4. Radius scale domain

- **Choice:** When using variable radius, derive the scale domain from the set of `secondaryValues` for the datapoints actually rendered (e.g. `min` and `max` of those values). Optionally clamp radii to a [minRadius, maxRadius] pixel range to avoid tiny or huge dots.
- **Rationale:** Parent does not need to know pixel bounds; the chart can use a linear (or sqrt) scale from data range to radius range.
- **Alternatives:** Parent could pass a radius scale; adds API surface and is unnecessary if the chart can derive domain from `secondaryValues`.

### 5. Missing secondary value

- **Choice:** If `secondaryValues[codeine]` is missing or invalid for a dot, use a fallback radius (e.g. the default DOT_RADIUS or the minimum of the radius scale).
- **Rationale:** Avoids invisible or zero-size dots and keeps layout stable.
- **Alternatives:** Hiding dots with missing data would change the set of points and could confuse; fallback radius is simpler.

## Risks / Trade-offs

- **Large spread in secondary values:** If e.g. population varies from hundreds to hundreds of thousands, a linear radius scale can make small municipalities nearly invisible. Mitigation: use a sqrt or log scale for radius, or a bounded [minR, maxR] pixel range so the ratio of largest to smallest radius is capped.
- **Simulation with many variable radii:** Collision force must use per-node radius; D3’s `forceCollide` accepts a function. Re-running the simulation when `secondaryValues` or `sizeBySecondaryData` changes may cause dots to move. Mitigation: acceptable; same as when datapoints or domain change today.
- **Color scale and highlights:** When `colorScale` is used, “highlighted” vs “dimmed” dots (existing `highlights`/`highlightedIne`) may still need a distinct treatment (e.g. dimmed = reduce opacity or desaturate, not a different scale input). Mitigation: keep current highlight behavior; dimmed dots can use the same colorScale with lower opacity.

## Migration Plan

- Add optional props only; no breaking changes. Callers that do not pass the new props see no change. Rollback: remove the new props and the branches that use them.

## Open Questions

- None blocking. Optional: whether to use sqrt scaling for radius by default to improve visibility when secondary value range is large.
