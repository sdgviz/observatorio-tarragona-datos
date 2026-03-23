## Why

La página de municipio ODS (`municipios/ods/[ine].vue`) tiene ya tres pestañas (ODS, Indicadores, Presupuestos) pero el contenido de las dos primeras debe alinearse con un modelo claro: una vista por ODS→metas (agregado) y una vista plana de indicadores con filtro por ODS y mostrando valor real. Esto mejora la navegación y permite comparar metas por ODS y explorar indicadores por valor con filtro visual.

## What Changes

- **Tab ODS**: Implementar `MunicipioOdsOdsView` (odsView.vue) para mostrar la jerarquía ODS → metas (no indicadores). Cada meta muestra su `promedio_indice` (ya devuelto por `GET /api/ods/indicadores`). Misma escala y estilo visual que la actual vista de indicadores (barras divergentes −100 a +100).
- **Tab Indicadores**: Ajustar `MunicipioOdsIndicadoresView` (IndicadoresView.vue) para mostrar la lista plana de todos los indicadores con el **valor** (no el índice). Añadir un filtro por ODS con apariencia igual a `OdsSelector.vue` pero con comportamiento multi-selección: por defecto todos los ODS seleccionados; al seleccionar uno o más ODS se muestran solo los indicadores de esos ODS (unión); si se deseleccionan todos, se vuelve a tener todos seleccionados.
- **Tab Presupuestos**: Sin cambios (PresupuestosView se mantiene igual).
- **Un solo endpoint para ODS e Indicadores**: Tanto el tab ODS como el tab Indicadores consumen el **mismo** endpoint `GET /api/ods/indicadores?codigo_ine=<ine>`. Se hará uso del **cacheo por key** de los composables de Nuxt (p. ej. `useFetch` con la misma `key` en ambos componentes) para que una única petición sirva a las dos vistas y no se dupliquen requests al cambiar de tab.

## Capabilities

### New Capabilities

- `ods-metas-view`: Vista del tab ODS: jerarquía objetivos → metas, valor por fila = `promedio_indice` de la meta (API), barras divergentes −100 a +100, expansión por objetivo opcional.
- `indicadores-view-filter`: Vista del tab Indicadores: lista plana de indicadores mostrando campo `valor` (no `indice`), filtro por ODS con apariencia tipo OdsSelector (botones de los 17 ODS), multi-selección (unión), estado por defecto todos seleccionados, y regla deseleccionar todos → volver a seleccionar todos.

### Modified Capabilities

- (ninguna)

## Impact

- **Código**: `app/components/municipio/ods/odsView.vue` (implementación completa), `app/components/municipio/ods/IndicadoresView.vue` (cambiar a valor + integrar filtro ODS). Posible nuevo componente de filtro reutilizable o variante de OdsSelector para multi-selección.
- **API**: Ningún cambio. Un único endpoint `GET /api/ods/indicadores` sirve a ambos tabs (ODS y Indicadores); cacheo por key en Nuxt para reutilizar la misma respuesta.
- **Página**: `app/pages/municipios/ods/[ine].vue` ya tiene los tres tabs y componentes referenciados; a lo sumo se asegura que los slots coincidan con OdsView e IndicadoresView.
- **Dependencias**: `app/assets/config/config.js` (ods_list) y assets `public/svg_ods/sdgs_<N>_0.svg` para el filtro y logos.
