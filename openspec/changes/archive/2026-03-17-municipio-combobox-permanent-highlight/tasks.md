# Tasks: Municipio combobox and permanent highlight

## 1. Home page state and combobox

- [x] 1.1 Add `selectedIne` ref (string | null) in `app/pages/index.vue` and keep it in sync with combobox selection
- [x] 1.2 Add a single-select searchable combobox above the beeswarm; options from `municipiosList` (label: nombre, value: codigo_ine); support clear selection
- [x] 1.3 Add i18n keys for combobox placeholder and clear (e.g. home.municipioSearchPlaceholder, home.clearSelection) in ca.json and es.json

## 2. Map permanent highlight

- [x] 2.1 Add optional prop `selectedIne?: string | null` to MapWrapper and pass it through to MapTarragona
- [x] 2.2 In MapTarragona, render permanent highlight for `selectedIne` (e.g. distinct border/ring) when set; keep existing hover highlight for `highlightedIne` so both can be visible

## 3. Beeswarm permanent highlight

- [x] 3.1 In index.vue, pass to BeeswarmChart a `highlights` array that includes both `selectedIne` (if set) and `highlightedIne` (if set), deduplicated, so selected and hovered dots are both emphasized
- [x] 3.2 If desired, add optional `selectedIne` prop to BeeswarmChart for a distinct style (e.g. ring) on the selected dot; otherwise keep using `highlights` for selected + hover

## 4. Verification

- [x] 4.1 Manually verify: select municipality in combobox → map and beeswarm show permanent highlight; clear → highlight gone; hover still works independently and both can show at once
