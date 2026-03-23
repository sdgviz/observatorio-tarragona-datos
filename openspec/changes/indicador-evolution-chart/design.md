## Context

El panel lateral `IndicadoresPanel.vue` muestra datos estáticos del indicador seleccionado (valor, índice, período, metadatos). No existe visualización de la evolución temporal. Ya disponemos de:

- **Endpoint** `GET /api/indicadores/valores?indicator_id=X&ine=Y` que devuelve la serie temporal completa (`periodo`, `valor`) ordenada por periodo ASC.
- **Referencia** `references/AreaChart.vue`: un componente D3 con gráfica de área, hover interactivo y ejes. Usa `scalePoint` y un viewBox fijo.
- **D3 y @vueuse/core** ya instalados en el proyecto.

## Goals / Non-Goals

**Goals:**
- Crear un componente `EvolutionChart.vue` genérico reutilizable en cualquier contexto donde se necesite un gráfico de evolución temporal.
- Integrar el gráfico en `IndicadoresPanel.vue` haciendo fetch de datos temporales al abrir el panel.
- Soportar huecos en el eje X (años sin dato): dominio lineal continuo, sin pintar punto en años vacíos.
- Animación de entrada (area path y line aparecen progresivamente).
- Tooltip hover mostrando año y valor.

**Non-Goals:**
- No se soportan múltiples series en la misma gráfica (una sola serie por instancia).
- No se añade zoom, pan ni interacción de click en los datapoints.
- No se modifica el endpoint `/api/indicadores/valores` (se usa tal cual).
- No se añade descarga de imagen del gráfico.

## Decisions

### 1. Escala X: `scaleLinear` en lugar de `scalePoint`

La referencia usa `scalePoint` con un dominio de labels. Para soportar huecos en el eje X (años sin dato), se usará `scaleLinear` con dominio `[minYear, maxYear]`. Esto genera ticks para todos los años en el rango, y simplemente no se pinta un punto ni área en los años sin dato. Se interrumpe la línea en los huecos usando `defined()` de D3.

**Alternativa descartada**: `scalePoint` con todos los años del rango — requeriría inyectar labels artificiales y la distribución de puntos no sería proporcional al tiempo real.

### 2. Componente desacoplado — props genéricos

El componente recibe:
- `datapoints: Array<{ year: number; value: number }>` — serie de datos.
- `color: string` — color del área y línea (por defecto, un azul neutro).
- `width: number` y `height: number` — tamaño del gráfico en píxeles (por defecto 480×320).
- `valueFormatter?: (v: number) => string` — formateador opcional para el tooltip.

Esto lo hace agnóstico a indicadores ODS, reusable en Agenda Urbana u otros contextos.

### 3. Animación de entrada con `stroke-dasharray`/`stroke-dashoffset` y transición CSS del área

- La línea usa la técnica `stroke-dasharray` = longitud total, `stroke-dashoffset` animado de longitud a 0 con transición CSS.
- El área se anima con `clip-path` horizontal que se expande de izquierda a derecha.
- Sin librería adicional; CSS transitions + D3 son suficientes.

### 4. Tooltip hover con línea vertical y texto flotante

Igual que la referencia: se calcula la posición X del ratón, se busca el año más cercano con `bisect`, y se muestra una línea vertical + texto SVG con año y valor. El HTML tooltip se descarta a favor de SVG nativo por consistencia con la referencia y sencillez.

### 5. Integración en IndicadoresPanel

Se añade un bloque dentro del body del panel que:
1. Observa `props.item` — cuando cambia y es no-nulo, lanza `$fetch` a `/api/indicadores/valores`.
2. Transforma la respuesta en `Array<{ year, value }>`.
3. Pasa los datos al `<EvolutionChart>` con el color del ODS correspondiente.
4. Mientras carga, muestra `<USkeleton>` del tamaño del gráfico.

### 6. Ubicación del componente

`app/components/EvolutionChart.vue` — nivel raíz de componentes porque es genérico, no específico de municipio/ods.

## Risks / Trade-offs

- **[Rendimiento en series largas]** → Para indicadores con muchos años (>50 datapoints), D3 path rendering es despreciable. No es un riesgo real dado el dataset actual (períodos anuales, ~10-20 puntos).
- **[Fetch por cada apertura de panel]** → Se hace un `$fetch` cada vez que se abre el panel con un indicador distinto. Es aceptable porque son queries ligeras (un solo indicador + municipio). Se podría cachear en el futuro si se detecta latencia.
- **[SSR y D3]** → D3 requiere el DOM. El componente se envuelve en `<ClientOnly>` con fallback `<USkeleton>`, siguiendo el patrón del proyecto.
