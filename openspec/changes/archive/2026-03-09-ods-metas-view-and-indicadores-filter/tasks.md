## 1. Tab ODS — odsView.vue (ODS → metas)

- [x] 1.1 En odsView.vue añadir useFetch a GET /api/ods/indicadores con codigo_ine de la ruta, usando una key de cache (p. ej. `key: ['api/ods/indicadores', ine]`) y estados pending/error (skeleton y UAlert)
- [x] 1.2 Renderizar lista de objetivos; por cada objetivo mostrar logo ODS (sdgs_<N>_0.svg), nombre y barra divergente usando objetivo.promedio_indice (−100 a +100)
- [x] 1.3 Añadir toggle de expansión por objetivo; al expandir mostrar filas de metas con meta.promedio_indice y barra divergente por meta
- [x] 1.4 Añadir ordenación (p. ej. por valor o nombre) para objetivos y, si aplica, para metas
- [x] 1.5 Excluir objetivos sin metas con datos; excluir metas con promedio_indice null si se desea ocultarlas (o mostrarlas con "—")

## 2. Filtro ODS multi-selección (apariencia OdsSelector)

- [x] 2.1 Crear componente OdsMultiSelect.vue (o equivalente) con apariencia igual a OdsSelector: 17 botones con logos y colores de ods_list / svg_ods
- [x] 2.2 Gestionar estado: array o Set de ODS seleccionados (1–17); v-model o props/emit para selected: number[]
- [x] 2.3 Implementar toggle por clic: si el ODS está seleccionado se quita; si no, se añade
- [x] 2.4 Si tras un toggle el conjunto queda vacío, reasignar selección a todos los ODS (1–17)

## 3. Tab Indicadores — IndicadoresView.vue (valor + filtro)

- [x] 3.1 Usar el mismo endpoint y la misma key de useFetch que odsView (GET /api/ods/indicadores, key compartida) para que Nuxt cachee una sola petición; cambiar la lista plana para mostrar el campo valor (no indice) y formatear con unidad si existe en metadata
- [x] 3.2 Integrar el filtro ODS (OdsMultiSelect) en IndicadoresView; estado inicial todos los ODS seleccionados
- [x] 3.3 Filtrar la lista plana de indicadores por objetivo: solo mostrar indicadores cuyo objetivo.id (o número derivado) está en el conjunto de ODS seleccionados
- [x] 3.4 Mantener ordenación existente (por valor o nombre) aplicada sobre la lista ya filtrada
- [x] 3.5 Opcional: mantener panel de detalle al clic en indicador (IndicadoresPanel) mostrando valor e indice en el detalle

## 4. Integración y comprobación

- [x] 4.1 Verificar que ambos tabs (ODS e Indicadores) usan la misma key de cache y que al cambiar de tab no se dispara una segunda petición
- [x] 4.2 Verificar que el tab ODS en [ine].vue muestra odsView con ODS→metas y promedio_indice
- [x] 4.3 Verificar que el tab Indicadores muestra lista con valor y que el filtro ODS filtra por unión; deseleccionar todos vuelve a todos
- [x] 4.4 Verificar que el tab Presupuestos no ha cambiado
