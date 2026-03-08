## Why

El menú "Municipios" del header actualmente abre un desplegable básico que no permite descubrir ni seleccionar municipios de forma cómoda. Se necesita un selector rápido y accesible que permita al usuario encontrar y navegar a cualquier municipio de Tarragona sin abandonar la página actual.

## What Changes

- El botón "Municipios" del header abre un modal en lugar de un `UDropdownMenu`
- El modal muestra la lista completa de municipios agrupada por letra inicial
- El modal incluye un campo de búsqueda que filtra la lista en tiempo real
- Al hacer click en un municipio se navega a `/municipios/ods/[ine]`
- El modal se abre solo con click (no con hover) y se cierra con la X o pulsando Escape

## Capabilities

### New Capabilities
- `municipios-picker-modal`: Modal de selección de municipios con buscador y lista alfabética, accesible desde el header

### Modified Capabilities
- (ninguna)

## Impact

- `app/components/AppHeader.vue`: reemplaza el `UDropdownMenu` de municipios por un botón que abre el nuevo modal
- `app/components/MunicipiosPickerModal.vue`: nuevo componente
- `app/assets/data/municipios_tarragona.csv`: fuente de datos (import estático con `@rollup/plugin-dsv`)
- Sin cambios en rutas ni API
