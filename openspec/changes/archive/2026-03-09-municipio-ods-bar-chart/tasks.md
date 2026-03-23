## 1. Orquestador de datos — MunicipioIndicadores.vue

- [x] 1.1 Añadir `useFetch` al endpoint `/api/ods/indicadores` con el `codigo_ine` de la ruta
- [x] 1.2 Gestionar estado `pending`: mostrar `USkeleton` mientras carga
- [x] 1.3 Gestionar estado `error`: mostrar `UAlert` con mensaje descriptivo
- [x] 1.4 Filtrar (antes de pasar a props) los indicadores con `indice === null` en todos los niveles de la jerarquía
- [x] 1.5 Pasar los datos filtrados como prop a `<MunicipioIndicadoresChart />`

## 2. Componente de gráfico — MunicipioIndicadoresChart.vue

- [x] 2.1 Crear `app/components/municipio/IndicadoresChart.vue` con props tipados (`OdsHierarchyResponse`)
- [x] 2.2 Añadir switch (USwitch) para alternar entre modo ODS y modo indicadores; estado inicial = ODS
- [x] 2.3 Añadir controles de ordenación (USelect o botones): por nombre A→Z, Z→A, valor ↑, valor ↓
- [x] 2.4 Implementar eje superior con marcas en −100, −50, 0, +50, +100
- [x] 2.5 Implementar función de barra divergente CSS: `width` = `|indice|/2 %`, `left` = 50% (positivo) o `50 - |indice|/2 %` (negativo)
- [x] 2.6 Aplicar colores: verde para positivo, rojo para negativo, gris para cero
- [x] 2.7 Mostrar el valor numérico formateado (+XX.X / −XX.X) junto a cada barra

## 3. Modo ODS (agrupado)

- [x] 3.1 Calcular el promedio de `indice` por objetivo (sólo indicadores válidos)
- [x] 3.2 Renderizar cada objetivo con: logo `/svg_ods/sdgs_<N>_0.svg`, nombre, barra resumen y icono chevron
- [x] 3.3 Implementar toggle de expansión por objetivo (Set reactivo de IDs expandidos)
- [x] 3.4 Renderizar los indicadores hijos al expandir, con sus barras individuales
- [x] 3.5 Aplicar ordenación al array de objetivos según el criterio activo

## 4. Modo indicadores (lista plana)

- [x] 4.1 Aplanar todos los indicadores de la jerarquía en un array plano, incluyendo referencia al objetivo padre
- [x] 4.2 Renderizar cada indicador con: logo ODS del objetivo padre, barra, valor y nombre
- [x] 4.3 Aplicar ordenación al array plano según el criterio activo

## 5. Panel de detalle — MunicipioIndicadoresPanel.vue

- [x] 5.1 Crear `app/components/municipio/IndicadoresPanel.vue` que recibe el indicador seleccionado como prop
- [x] 5.2 Usar `USlideover` de Nuxt UI para el panel lateral
- [x] 5.3 Mostrar: nombre, descripción (si existe), valor real (`valor`), índice (`indice`), período, unidad (si existe), fuente (si existe)
- [x] 5.4 Emitir evento `close` al cerrar el panel
- [x] 5.5 Integrar el panel en `IndicadoresChart.vue`: abrir al click en cualquier indicador (modo ODS expandido o modo plano)

## 6. Integración en la página

- [x] 6.1 Verificar que `MunicipioIndicadores` en `[ine].vue` renderiza correctamente sin cambios en la página
- [x] 6.2 Probar en el navegador: carga de datos, modo ODS, expansión, modo plano, ordenación, panel de detalle
- [x] 6.3 Verificar que el componente funciona sin errores de hidratación SSR (no hay D3 ni DOM directo)
