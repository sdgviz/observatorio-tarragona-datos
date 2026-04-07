## Context

`BeeswarmChart` builds `dataDomain` as `[min(valor), max(valor)]` from `datapoints` when `domain` is omitted, then maps that interval linearly to the chart width. With no padding, forces (`forceX`) place dots at the numeric extremes right at the drawable edges, and small natural spread in the data looks visually “cramped”. Callers such as `/ods/[objetivo]` and the homepage pass **no** `domain` but do pass `color-scale`; coloring is independent of the x domain.

## Goals / Non-Goals

**Goals:**

- When `domain` is **omitted**, expand the data-derived interval symmetrically by a **configurable ratio** of the span (default **10%** on the left and **10%** on the right, i.e. 20% total width added to the numeric range).
- When `domain` is **provided**, use it **exactly** for `scaleLinear().domain()` (no padding added by the component).
- Keep empty / single-value / degenerate cases stable and safe.

**Non-Goals:**

- Changing how `colorScale` is built or aligning auto-domain to map min/max unless the parent passes `domain`.
- Outlier trimming, percentile bands, or log scales.
- Changing collision or simulation parameters beyond what follows from the new domain.

## Decisions

### 1. Padding formula

- **Choice:** Let `lo = min(valor)`, `hi = max(valor)`, `span = hi - lo`. If `span > 0`, use domain `[lo - m*span, hi + m*span]` where `m` is the margin ratio (default `0.1`). If `span === 0`, keep today’s behaviour `[lo - 0.5, hi + 0.5]` (or equivalent) without applying relative padding that would collapse to a point.
- **Rationale:** Symmetric margin “centers” the swarm with breathing room; matches user request.
- **Alternatives:** Pad in pixels instead of data units (rejected — mixes coordinate systems); asymmetric margins (rejected — not requested).

### 2. Tunable margin

- **Choice:** A **file-level named constant** (e.g. `AUTO_DOMAIN_MARGIN_RATIO = 0.1`) as the default, plus an **optional prop** (e.g. `autoDomainMarginRatio?: number`) applied only when `domain` is omitted. If the prop is omitted, use the constant.
- **Rationale:** Satisfies “adjustable constant” and allows a rare caller to override without forking.
- **Alternatives:** Prop only (rejected — callers would have to repeat 0.1 everywhere).

### 3. Explicit `domain`

- **Choice:** `scaleDomain = props.domain ?? paddedDataDomain` where `paddedDataDomain` applies the logic above; no mutation of `props.domain`.
- **Rationale:** Map-aligned charts that pass a fixed domain stay pixel-consistent with the legend.

## Risks / Trade-offs

- **Wider default domain** when `domain` omitted → axis ticks may show values slightly outside observed data → **acceptable** and usual for chart padding.
- **Very large `autoDomainMarginRatio`** from a caller could over-flatten the swarm → **mitigation**: document sensible range (e.g. 0–0.5) in code comment; no hard validation unless product asks.

## Migration Plan

1. Ship change; existing pages without `domain` get padded scale automatically.
2. Rollback: remove padding branch and restore `scaleDomain = props.domain ?? dataDomain`.

## Open Questions

- None for v1.
