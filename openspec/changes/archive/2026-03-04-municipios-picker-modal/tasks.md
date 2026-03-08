## 1. Componente MunicipiosPickerModal

- [x] 1.1 Crear `app/components/MunicipiosPickerModal.vue` con `UModal` de Nuxt UI
- [x] 1.2 Importar el CSV `municipios_tarragona.csv` con import estático
- [x] 1.3 Implementar `computed` de agrupación por letra inicial (ordenado alfabéticamente)
- [x] 1.4 Implementar campo de búsqueda `UInput` con filtrado reactivo (case-insensitive, tolerante a acentos)
- [x] 1.5 Implementar mensaje "sin resultados" cuando el filtro no devuelve municipios
- [x] 1.6 Renderizar la lista agrupada: letra grande + municipios como `NuxtLink` a `/municipios/ods/[codigo_ine]`
- [x] 1.7 Cerrar el modal al hacer click en un municipio (navegar + cerrar)

## 2. Integración en AppHeader

- [x] 2.1 Añadir `ref` booleano `isPickerOpen` en `AppHeader.vue`
- [x] 2.2 Reemplazar el `UDropdownMenu` de municipios por un `UButton` que abre el modal al hacer click
- [x] 2.3 Incluir `<MunicipiosPickerModal v-model="isPickerOpen" />` en el template del header
