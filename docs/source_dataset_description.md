Hay tres tipos de indicadores agrupados en dos familias
- Indicadores de los objetivos de desarrollo sostenible (ODS)
- Indicadores de seguimiento la agenda urbana (AU)
- Indicadores descriptivos de la agenda urbana (DESC)

Los indicadores descriptivos van a un poco a parte ya que tienen caracteristicas un poco diferentes.


Los de la agenda urbana y ods comparten caracteristicas comunes:
- Tienen una jerarquía de tres niveles. Los datos que tenemos medidos son los de nivel 3 y el resto se construyen con promedios a partir de ellos
- Los niveles 1 y 2 de los objetivos de desarrollo sostenible se denominan "objetivos y metas" y los de la agenda urbana se denominan "objetivos generales y objeetivos especficos"

Todos los indicadores tienen una metadata asociada en el archivo metadatos_agendas.csv la columna "clase" dice de que tipo es el indicador.

Diccionario.csv da metadata sobre los niveles 1 y 2 de los indicadores.

umbrales.csv da los umbrales de los indicadores.

Cada indicador tiene un codigo único que es el que se usa para identificarlo en el resto de archivos. Un indicador puede ser parte de varias metas o de la agenda urbana.

Los valores reales del indicador están en los archivos "indicadores_agendas" donde cada indicador está asociado a un municipio y un periodo ( año).
Los municipios se describen en regiones.csv y a futuro habrá datos para cada uno de los municipios de la provincia.

Los datos que tenemos ahora son solo una muestra.

## Relacion entre architecture.md y el resto de archivos:
archiecture.md respresenta como deberia de transformarse este archivo a una forma mas o menos normalizada lista para incluirse en una base de datos relacional.

Hay muchos campos de datos que no están presentes en archictecture.md pero deberán estar en la base de datos relacional. Architecure.md solo representa la estructura de los datos a alto nivel.
- El dataset no tiene todos los datos de los indicadores. Por ejemplo, no tiene las traduccion separadas para cada idioma.
- Las relaciones padre-hijo que se describen en "ARQUITECTURA_L2" son las que se encuentran en las columnas (ods   meta) and  (aue1   aue2)

## Promedios
Los calculos de los promedios de nivel 2 y 1 están en los archivosç
   - "promedios-municipio_meta_ods"
   - "promedios-municipio_objeetivo_aue"
   - "promedios-municipio_ods_objetivo"


