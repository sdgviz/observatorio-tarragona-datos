## Context

La página `municipios/ods/[ine].vue` tiene dos tabs: "Indicadores" y "Presupuestos". La tab de Indicadores renderiza `<MunicipioIndicadores />`, que actualmente es un placeholder vacío. El endpoint `/api/ods/indicadores` ya devuelve la jerarquía completa (objetivos → metas → indicadores) con el campo `indice` normalizado entre -100 y +100 (donde 0 es la media provincial). Los logos ODS están disponibles en `public/svg_ods/sdgs_<N>_0.svg`.

## Goals / Non-Goals

**Goals:**
- Visualizar los índices ODS del municipio como gráfico de barras divergentes
- Dos modos: agrupado por ODS (con barra resumen por objetivo) y lista plana de indicadores
- Ordenación por nombre o por valor
- Panel lateral de detalle al hacer click en un indicador
- Omitir indicadores sin `indice`

**Non-Goals:**
- Selector de período (siempre se usa el más reciente)
- Filtrado por ODS (la vista muestra todos)
- Comparativa entre municipios
- Ningún cambio en el servidor ni en el endpoint

## Decisions

### D1: Componentes, no D3

**Decisión**: Implementar el gráfico con CSS puro (Tailwind + posicionamiento absoluto), sin D3.

**Rationale**: Las barras divergentes son geometría simple (offset + width en porcentaje). D3 no aporta valor aquí frente a la complejidad de SSR/ClientOnly que requiere. El resultado visual es idéntico. Evita `<ClientOnly>` y skeletons adicionales.

**Alternativa descartada**: D3 — overhead innecesario para barras CSS.

---

### D2: Estructura de componentes

```
MunicipioIndicadores.vue          ← orquestador: fetch, loading, error
  └── MunicipioIndicadoresChart.vue   ← visualización: modos, sort, barras
        └── MunicipioIndicadoresPanel.vue   ← USlideover con detalles del indicador
```

**Rationale**: Separar responsabilidades. `Indicadores.vue` gestiona datos, `IndicadoresChart.vue` sólo recibe props y emite eventos. El panel de detalle se extrae porque tiene su propio estado (visible/hidden) y usa `USlideover`.

---

### D3: Barra resumen por objetivo ODS

**Decisión**: En modo ODS, calcular el promedio de `indice` de todos los indicadores válidos del objetivo y usarlo como valor de la barra resumen.

**Rationale**: Los objetivos ODS no tienen un `indice` propio en el endpoint. El promedio de sus indicadores da una lectura rápida y coherente con la escala −100/+100.

**Alternativa descartada**: Mostrar el objetivo sin barra — pierde la capacidad comparativa entre ODS.

---

### D4: Colores de las barras por valor

- Valor > 0 → verde (`bg-green-500` / `text-green-600`)
- Valor < 0 → rojo (`bg-red-500` / `text-red-600`)
- Valor = 0 → gris (`bg-gray-400`)

Las barras crecen desde el centro (50%) hacia la derecha para positivos, hacia la izquierda para negativos. Mismo patrón que la referencia `AreasBarChart.vue`.

---

### D5: Ordenación

Estado local (`ref`) en `IndicadoresChart.vue`. Opciones: `nombre_asc`, `nombre_desc`, `valor_asc`, `valor_desc`. En modo ODS, la ordenación aplica a nivel de objetivo (la lista de objetivos se reordena por su promedio o nombre). En modo plano, aplica sobre todos los indicadores.

---

### D6: Logo ODS

Path: `/svg_ods/sdgs_<N>_0.svg` donde `<N>` es el número del objetivo extraído del campo `id` (`2030-<N>`). Se importa `ods_list` de `~/assets/config/config.js` para obtener color y nombre canónico.

## Risks / Trade-offs

- [Promedio como resumen] La media aritmética puede no ser la métrica más representativa si hay muchos nulos. → Mitigación: se calculan sólo sobre indicadores con `indice != null`.
- [Rendimiento] Si un municipio tiene cientos de indicadores, el renderizado de la lista plana puede ser lento. → Por ahora aceptable; si surge el problema se añadirá paginación o virtualización.
- [USlideover] El componente Nuxt UI v4 `USlideover` puede tener comportamientos de scroll diferentes. → Se testea en el navegador al implementar.
