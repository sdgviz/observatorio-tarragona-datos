## 1. BeeswarmChart implementation

- [x] 1.1 Add default constant (e.g. `AUTO_DOMAIN_MARGIN_RATIO = 0.1`) and optional prop (e.g. `autoDomainMarginRatio`) documented in component; prop applies only when `domain` is omitted.
- [x] 1.2 Replace `scaleDomain` logic: if `props.domain` defined → use it; else compute padded domain from data min/max per spec (handle `span === 0` like current `dataDomain`).
- [x] 1.3 Ensure `xScale`, tick generation, and `forceX` use the same `scaleDomain` source; run simulation when domain inputs change (existing watchers should cover if deps are correct).

## 2. Verification

- [x] 2.1 Manual: ODS goal indicator beeswarm (no `domain`) — swarm has horizontal margin, no console errors.
- [x] 2.2 Manual: temporarily pass `domain` on a chart — extent matches prop exactly (optional dev check or story).
- [x] 2.3 Regression: homepage beeswarm (no `domain`) still renders; `pnpm run build` in app repo passes.

## 3. Layout / simulation follow-up (shipped with archive)

- [x] 3.1 Re-run simulation when `width`/`height` change; skip degenerate size; clear cached x when layout changes (F5 vs HMR alignment).
