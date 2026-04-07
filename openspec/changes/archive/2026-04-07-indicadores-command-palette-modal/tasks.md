## 1. Pinia store and filtering

- [x] 1.1 Add a Pinia store (e.g. `stores/municipioOdsIndicadoresPicker.ts`) holding `selectedIndicadorIds: string[]`, actions to set/replace/toggle/select-all/select-none, and an `initialized` (or equivalent) flag for “first visit → all selected”.
- [x] 1.2 In `IndicadoresView.vue`, watch `flatItems` / available id set: apply **intersection** with the store; implement **uninitialized → all ids**, **store empty → none**, **non-empty store but empty intersection → re-seed all** (per design); write palette changes back to the store.
- [x] 1.3 Remove `searchQuery`, `textFilterActive`, and substring filtering; compute `filteredItems` from `flatItems` ∩ effective selection; update `indicatorIds`, sections, and empty states (selection empty vs API empty).

## 2. Modal + CommandPalette UI

- [x] 2.1 Replace the sticky `UInput` with a `UButton` (or similar) that opens `UModal` (`v-model:open`); add `UCommandPalette` inside modal content with `multiple`, `v-model` bound to selected ids, `valueKey`/`id` field aligned to `id_indicador`, and items built from `flatItems` (`label`, `suffix` for meta/ODS context).
- [x] 2.2 Add **Select all** and **Select none** actions (e.g. `#footer` slot on the palette or a toolbar row) that set `selectedIndicadorIds` to all ids or empty.
- [x] 2.3 Add distinct **empty selection** UI when `selectedIndicadorIds` is empty but `flatItems` is non-empty; tune `fuse`/`virtualize` if the list is large.

## 3. i18n and polish

- [x] 3.1 Add Catalan and Spanish keys for trigger label, modal/palette placeholder, select all, select none, and empty-selection message under `municipio.*` (or existing ODS keys).
- [x] 3.2 Manual test: open/close modal, fuzzy search, toggle items, select all/none, list + dashboard + series loading; navigate to **another municipio** and confirm selection persists (intersection); select none then navigate; keyboard/focus acceptable for modal.

## 4. Optional cleanup

- [x] 4.1 If `IndicadoresView` grows too large, extract `MunicipioOdsIndicadoresPickerModal.vue` with props/emits for `flatItems`, `modelValue` (selected ids), and `open`.
