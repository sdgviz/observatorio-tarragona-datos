## 1. Modelo de datos en vista

- [x] 1.1 En `IndicadoresView.vue`, al aplanar `objetivos → metas → indicadores`, añadir `metaNombre` (desde `meta.nombre`) al ítem plano y propagarlo en `openPanel` / `selectedItem`.

## 2. Lista

- [x] 2.1 Actualizar `FlatItem` / tipos en `IndicadoresListView.vue` y la celda “Indicador” para mostrar `ODS {n} · {metaNombre}` (o equivalente acordado con diseño).

## 3. Dashboard y tarjetas

- [x] 3.1 Actualizar `IndicadoresDashboardView.vue` (`FlatItem`, evolution/BAN/empty blocks) para pasar el nombre de meta a las tarjetas.
- [x] 3.2 Ajustar `IndicadorEvolutionCard.vue` y `IndicadorBanCard.vue` (props y plantilla) si hace falta renombrar o documentar que el subtítulo usa la **meta**.

## 4. Panel

- [x] 4.1 Actualizar `IndicadoresPanel.vue` (`PanelItem` + plantilla) para la misma regla de contexto con `metaNombre`.

## 5. QA

- [x] 5.1 Verificar un municipio con al menos un ODS donde el título de meta ≠ título de objetivo: Lista, Dashboard, panel.
- [x] 5.2 Comprobar que encabezados de sección por ODS y anclas `#municipio-indicadores-ods-{n}` no cambian.
