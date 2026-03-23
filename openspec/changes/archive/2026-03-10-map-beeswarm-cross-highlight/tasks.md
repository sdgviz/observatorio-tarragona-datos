## 1. Page state and wiring

- [x] 1.1 Add `highlightedIne` ref (`string | null`) to the page that renders the map and beeswarm (e.g. `index.vue`)
- [x] 1.2 Pass `highlightedIne` and `@update:highlightedIne` (or equivalent) to MapWrapper and BeeswarmChart
- [x] 1.3 On `update:highlightedIne` from either component, set `highlightedIne` to the emitted value (INE string or null)

## 2. MapTarragona: highlight prop and styling

- [x] 2.1 Add optional prop `highlightedIne?: string | null` to MapTarragona
- [x] 2.2 For the path whose `codeine` matches `highlightedIne`, apply stronger border (e.g. thicker stroke and/or distinct stroke color) and slight size emphasis (e.g. scale from centroid or thicker stroke)
- [x] 2.3 Emit `update:highlightedIne` (or `highlight`) with the path’s `codeine` on path mouseenter, and with `null` on path mouseleave
- [x] 2.4 Ensure default paths keep current styling when `highlightedIne` is null or does not match

## 3. MapWrapper: pass-through

- [x] 3.1 Add optional prop `highlightedIne?: string | null` to MapWrapper
- [x] 3.2 Pass `highlightedIne` to MapTarragona
- [x] 3.3 Forward MapTarragona’s `update:highlightedIne` (or highlight) emit to the parent so the page can update state

## 4. BeeswarmChart: emit and emphasized styling

- [x] 4.1 Emit `update:highlightedIne` (or `highlight`) with the dot’s `codigoIne` on dot mouseenter, and `null` on dot mouseleave
- [x] 4.2 Accept optional `highlightedIne?: string | null` (or derive from existing `highlights` when page passes `highlightedIne ? [highlightedIne] : []`)
- [x] 4.3 For the dot whose `codigoIne` matches the highlighted INE, render with a visible border (e.g. stroke) and larger radius (e.g. 1.25–1.5× default); keep or reuse existing dimming for non-highlighted dots when a highlight is active

## 5. Verification

- [x] 5.1 Manually verify: hovering a municipality on the map highlights the same INE on the beeswarm (border + larger dot)
- [x] 5.2 Manually verify: hovering a dot on the beeswarm highlights the same municipality on the map (border + size emphasis)
- [x] 5.3 Verify pointer leave clears the highlight in both views
- [x] 5.4 Verify standalone use: map alone (e.g. on another page without beeswarm) works with optional `highlightedIne` and optional emit listener; beeswarm alone works the same
