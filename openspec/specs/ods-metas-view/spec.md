# ODS metas view

## ADDED Requirements

### Requirement: Carga de datos ODS para vista metas
El componente del tab ODS (odsView.vue) SHALL cargar datos llamando a `GET /api/ods/indicadores?codigo_ine=<ine>` usando el `ine` de la ruta. SHALL gestionar estados de carga (pending) y error.

#### Scenario: Carga exitosa
- **WHEN** el componente se monta con un `ine` válido
- **THEN** se realiza la petición al endpoint y se muestran objetivos y metas con sus `promedio_indice`

#### Scenario: Error de red o municipio inexistente
- **WHEN** la petición falla o el municipio no existe
- **THEN** se muestra un mensaje de error apropiado (p. ej. UAlert)

### Requirement: Jerarquía ODS → metas con promedio_indice
La vista SHALL mostrar la jerarquía objetivos → metas (no indicadores). Cada fila de meta SHALL mostrar el valor `promedio_indice` de esa meta (proveniente de la API). Cada objetivo SHALL poder mostrarse con una fila resumen usando su `promedio_indice` cuando aplique.

#### Scenario: Visualización por objetivo
- **WHEN** hay datos cargados
- **THEN** se listan los objetivos ODS con al menos una meta con datos, y bajo cada objetivo sus metas con el valor promedio_indice

#### Scenario: Escala −100 a +100
- **WHEN** se muestra una barra para una meta u objetivo
- **THEN** la barra usa la escala divergente −100 a +100 (0 = referencia) y el valor numérico mostrado es el promedio_indice

### Requirement: Estilo visual coherente con indicadores
La vista SHALL usar la misma apariencia que la actual vista de indicadores por ODS: logos ODS desde `public/svg_ods/sdgs_<N>_0.svg`, barras divergentes (verde/rojo/gris), y formato numérico del valor (+XX.X / −XX.X).

#### Scenario: Logos y colores
- **WHEN** se renderiza un objetivo
- **THEN** se muestra el logo del ODS correspondiente y las barras siguen el mismo esquema de color (positivo/negativo/cero)

### Requirement: Expansión por objetivo (opcional)
Cada objetivo SHALL poder expandirse o colapsarse para mostrar u ocultar sus metas. El estado inicial puede ser todos colapsados o el primero expandido.

#### Scenario: Expandir objetivo
- **WHEN** el usuario hace clic en la fila de un objetivo (o en un control de expansión)
- **THEN** se muestran las filas de metas de ese objetivo con su promedio_indice y barras

#### Scenario: Colapsar objetivo
- **WHEN** el usuario hace clic de nuevo en el objetivo expandido
- **THEN** se ocultan las metas de ese objetivo
