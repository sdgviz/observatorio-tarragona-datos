## 1. AU Stub Components

- [x] 1.1 Create `app/components/municipio/au/Seguimiento.vue` as an empty placeholder component
- [x] 1.2 Create `app/components/municipio/au/Descriptivo.vue` as an empty placeholder component

## 2. Agenda Urbana Municipio Page

- [x] 2.1 Create `app/pages/municipios/au/[ine].vue` mirroring the ODS page structure
- [x] 2.2 Define two tabs: "Seguimiento" (default) and "Descriptivo" using `UTabs`
- [x] 2.3 Render `MunicipioAuSeguimiento` when "Seguimiento" tab is active
- [x] 2.4 Render `MunicipioAuDescriptivo` when "Descriptivo" tab is active
- [x] 2.5 Throw 404 error if the `ine` param does not match any municipio
- [x] 2.6 Call `visualizationStore.setMode(VisualizationMode.AU)` on page mount

## 3. ODS Page Store Sync

- [x] 3.1 Add `onMounted` hook to `app/pages/municipios/ods/[ine].vue` that calls `visualizationStore.setMode(VisualizationMode.ODS)`

## 4. Mode-Aware Navigation in Header

- [x] 4.1 In `AppHeader.vue`, replace the simple `setMode` call in the toggle setter with a function that:
  - Calls `visualizationStore.setMode(...)` as before
  - Checks if the current route path starts with `/municipios/ods/` or `/municipios/au/`
  - If on an ODS municipio page and switching to AU: navigate to `/municipios/au/<ine>`
  - If on an AU municipio page and switching to ODS: navigate to `/municipios/ods/<ine>`
  - Otherwise: no navigation (store update only)
