## ADDED Requirements

### Requirement: Carga de datos ODS del municipio
`MunicipioIndicadores.vue` SHALL llamar al endpoint `GET /api/ods/indicadores?codigo_ine=<ine>` al montarse, usando el parámetro `ine` de la ruta activa. Debe gestionar los estados de carga y error. Los indicadores con `indice: null` SHALL ser excluidos antes de pasarlos al componente de visualización.

#### Scenario: Carga exitosa
- **WHEN** el componente se monta con un `ine` válido
- **THEN** se realiza la petición al endpoint y se muestran los datos en el gráfico

#### Scenario: Indicadores sin índice omitidos
- **WHEN** el endpoint devuelve indicadores con `indice: null`
- **THEN** esos indicadores no aparecen en ninguna vista del gráfico

#### Scenario: Error en la carga
- **WHEN** el endpoint devuelve un error
- **THEN** se muestra un mensaje de error descriptivo (UAlert)

#### Scenario: Estado de carga
- **WHEN** la petición está en curso
- **THEN** se muestra un skeleton o indicador de carga

---

### Requirement: Gráfico de barras divergentes
El componente `MunicipioIndicadoresChart.vue` SHALL renderizar barras horizontales centradas en 0, con rango −100 a +100. Los valores positivos crecen hacia la derecha desde el centro; los negativos hacia la izquierda. El valor mostrado es el campo `indice` del indicador.

#### Scenario: Barra positiva
- **WHEN** un indicador tiene `indice > 0`
- **THEN** la barra se extiende a la derecha del centro, coloreada en verde

#### Scenario: Barra negativa
- **WHEN** un indicador tiene `indice < 0`
- **THEN** la barra se extiende a la izquierda del centro, coloreada en rojo

#### Scenario: Valor cero
- **WHEN** un indicador tiene `indice = 0`
- **THEN** la barra tiene ancho mínimo visible, coloreada en gris

#### Scenario: Eje con escala visible
- **WHEN** se muestra el gráfico
- **THEN** se muestra un eje superior con marcas en −100, −50, 0, +50, +100

---

### Requirement: Modo ODS (agrupado por objetivo)
En modo ODS, el componente SHALL mostrar los 17 objetivos (o los que tengan datos) como filas expandibles. Cada fila de objetivo muestra el logo ODS, el nombre y una barra resumen calculada como la media aritmética de los `indice` de sus indicadores válidos. Al expandir un objetivo, se muestran sus indicadores individuales con sus propias barras.

#### Scenario: Vista de objetivos colapsada
- **WHEN** el modo es ODS y un objetivo está colapsado
- **THEN** se muestra el logo ODS, nombre del objetivo y barra resumen con el promedio de sus indicadores

#### Scenario: Expansión de objetivo
- **WHEN** el usuario hace click en una fila de objetivo
- **THEN** se despliegan los indicadores individuales del objetivo, cada uno con su barra propia

#### Scenario: Colapso de objetivo
- **WHEN** el usuario hace click en un objetivo ya expandido
- **THEN** los indicadores se ocultan

#### Scenario: Logo ODS correcto
- **WHEN** se renderiza una fila de objetivo con id `2030-N`
- **THEN** se muestra el SVG `/svg_ods/sdgs_<N>_0.svg`

---

### Requirement: Modo indicadores (lista plana)
En modo indicadores, el componente SHALL mostrar todos los indicadores como una lista plana sin agrupación, cada uno con su barra, valor numérico, nombre y el logo del ODS al que pertenece.

#### Scenario: Lista plana visible
- **WHEN** el modo es indicadores
- **THEN** se muestran todos los indicadores válidos en una sola lista sin encabezados de objetivo

#### Scenario: Logo ODS en cada indicador
- **WHEN** se renderiza un indicador en modo plano
- **THEN** se muestra el logo SVG del ODS al que pertenece ese indicador

---

### Requirement: Switch de modo
El componente SHALL incluir un control (USwitch o equivalente) que permita alternar entre el modo ODS y el modo indicadores.

#### Scenario: Estado inicial
- **WHEN** el componente se monta
- **THEN** el modo activo es ODS (agrupado)

#### Scenario: Cambio de modo
- **WHEN** el usuario activa el switch
- **THEN** la vista cambia al modo indicadores (lista plana) y viceversa

---

### Requirement: Ordenación
El componente SHALL permitir ordenar las filas por nombre (A→Z / Z→A) o por valor (mayor a menor / menor a mayor). La ordenación se aplica tanto en modo ODS (a los objetivos por su promedio) como en modo indicadores (a todos los indicadores).

#### Scenario: Ordenar por valor descendente
- **WHEN** el usuario selecciona "Valor ↓"
- **THEN** las filas se reordenan de mayor a menor `indice` (o promedio en modo ODS)

#### Scenario: Ordenar por nombre ascendente
- **WHEN** el usuario selecciona "Nombre A→Z"
- **THEN** las filas se reordenan alfabéticamente por nombre

#### Scenario: Ordenación persistente al cambiar modo
- **WHEN** el usuario cambia de modo manteniendo un criterio de ordenación activo
- **THEN** la ordenación seleccionada se mantiene aplicada en el nuevo modo

---

### Requirement: Panel de detalle del indicador
Al hacer click en un indicador, el componente SHALL abrir un `USlideover` con la información detallada del indicador: nombre, descripción, valor real (`valor`), índice (`indice`), período, unidad, fuente y período de actualización.

#### Scenario: Apertura del panel
- **WHEN** el usuario hace click en un indicador
- **THEN** se abre el `USlideover` con los datos de ese indicador

#### Scenario: Cierre del panel
- **WHEN** el usuario hace click fuera del panel o en el botón de cerrar
- **THEN** el `USlideover` se cierra

#### Scenario: Campos opcionales ausentes
- **WHEN** un campo como `descripcion` o `fuente` es `null`
- **THEN** ese campo no se muestra en el panel (o se omite visualmente)
