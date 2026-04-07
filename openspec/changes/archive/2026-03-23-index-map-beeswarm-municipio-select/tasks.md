## 1. MapWrapper

- [x] 1.1 Add prop for region click behavior (`navigate` default vs `emit` / `select-only`) per design
- [x] 1.2 When in emit mode, forward INE to parent via emit and skip `navigateTo`
- [x] 1.3 Confirm ODS goal pages and other consumers keep default navigate behavior without code changes

## 2. BeeswarmChart

- [x] 2.1 Add opt-in prop and emit for click-to-select (`codigoIne`)
- [x] 2.2 Ensure default-off preserves current hover-only behavior on existing pages

## 3. Home page and i18n

- [x] 3.1 Wire `MapWrapper` on `index.vue` to emit mode; on region click set `selectedIneRaw` to clicked INE
- [x] 3.2 Enable beeswarm click selection on home; bind to `selectedIneRaw`
- [x] 3.3 Add explore link/button to the right of the map; show only when `selectedIneRaw` is set; `NuxtLink` to same path as previous map navigation (`visualizationStore` / ODS vs AU)
- [x] 3.4 Add ca/es strings for explore CTA with `{name}` placeholder

## 4. Verification

- [x] 4.1 Manual: home — map click updates combobox and does not navigate; beeswarm click matches; explore link navigates correctly in both modes if testable
- [x] 4.2 Manual: `/ods/[objetivo]` — map click still navigates (or matches current behavior)
