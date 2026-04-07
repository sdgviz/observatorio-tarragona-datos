## Why

`BeeswarmChart` often looks overcrowded when the horizontal scale uses the raw data minimum and maximum only: points hug the edges and the swarm has no visual breathing room. When the `domain` prop is omitted, the chart should derive the scale from the data but **pad** that range symmetrically so the distribution is centered with configurable margin. When callers pass `domain` explicitly (e.g. to align with a map color scale), the scale must honor that domain unchanged.

## What Changes

- **Auto domain padding**: If `domain` is omitted, compute min/max from `datapoints.valor`, then expand the interval by a **symmetric relative margin** (default **10%** of the span on each side), with a documented tunable constant and optional prop override.
- **Explicit domain unchanged**: If `domain` is provided, use it exactly for the x-scale (no extra padding applied by the component).
- **Edge cases**: Preserve sensible behaviour for empty data, single unique value, and non-finite values as today unless specs require tightening.

## Capabilities

### New Capabilities

- `beeswarm-auto-domain-padding`: Rules for `BeeswarmChart` x-scale domain when `domain` is omitted vs set; default margin ratio and optional override.

### Modified Capabilities

- _(none — new behaviour is scoped to the new capability; existing beeswarm-filter-emphasis does not change domain rules.)_

## Impact

- **Frontend**: `app/components/BeeswarmChart.vue` (and optionally call sites only if a new prop is exposed).
- **No API or data pipeline changes.**
- **Backward compatibility**: Callers that already pass `domain` see **no** change in scale extent. Callers that omit `domain` get a slightly wider numeric range (padding), which may change tick positions and dot spacing—intended improvement.
