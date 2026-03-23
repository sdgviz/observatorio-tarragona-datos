## 1. CLI y estructura básica de checks

- [x] 1.1 Añadir un script npm en el proyecto de datos (por ejemplo en `transform/package.json`) para ejecutar el comando de verificación de CSV (`"check:csv": "tsx src/check-csv.ts"` o equivalente).
- [x] 1.2 Crear el entry point TypeScript `src/check-csv.ts` que lea la ruta del directorio de dataset (por defecto `../dataset/`), invoque el runner de integridad y establezca el código de salida según el resultado global de los tests.
- [x] 1.3 Crear un módulo de runner de integridad (por ejemplo `src/integrity/runner.ts`) que ejecute todos los checks registrados, agregue sus resultados en una estructura común y devuelva el resumen al entry point.
- [x] 1.4 Definir el tipo de resultado de test (id, description, status, details) y el tipo de resumen global (totales, número de tests por estado, etc.) compartidos por todos los checks.

## 2. Checks de formato de CSV

- [x] 2.1 Definir en un módulo de configuración (por ejemplo `src/integrity/config.ts`) la lista de archivos CSV requeridos y las columnas mínimas obligatorias para cada uno (`regiones.csv`, `indicadores_agendas.csv`, `metadatos_agendas.csv`, etc.).
- [x] 2.2 Implementar un check de existencia de archivos que verifique que todos los CSV requeridos existen en el directorio configurado; devolver `fail` si falta alguno e incluir los nombres de archivo faltantes en `details`.
- [x] 2.3 Implementar un check de parseo que intente leer cada archivo requerido (reutilizando los parsers de `src/parse/` cuando sea posible o un parser de cabeceras minimalista) y marque `fail`/`error` si no se puede parsear, registrando el motivo en `details`.
- [x] 2.4 Implementar un check de columnas requeridas que lea la cabecera de cada CSV requerido y verifique que contiene todas las columnas mínimas definidas; marcar `fail` y listar las columnas que faltan cuando sea necesario.

## 3. Checks de consistencia de datos

- [x] 3.1 Implementar el check “al menos un indicador por región”: leer `regiones.csv` y `indicadores_agendas.csv`, construir el conjunto de regiones y contar cuántos indicadores tiene cada una; marcar `fail` y listar las regiones sin indicadores.
- [x] 3.2 Implementar el check “todos los indicadores tienen metadata”: leer `indicadores_agendas.csv` y `metadatos_agendas.csv`, construir los conjuntos de identificadores de indicadores y verificar que los de `indicadores_agendas.csv` están contenidos en los de `metadatos_agendas.csv`; marcar `fail` y listar los identificadores sin metadata.
- [x] 3.3 Integrar ambos checks en el runner de integridad, asegurando que sus resultados se incluyen en el resumen global y afectan al código de salida.

## 4. Generación de resultados estructurados y carpeta GitHub Pages

- [x] 4.1 Implementar la escritura de un fichero JSON de resultados (por ejemplo `docs/csv-integrity/results.json`) que contenga el resumen global y el detalle de cada test (id, description, status, details).
- [x] 4.2 Asegurar que el CLI crea la carpeta de salida `docs/csv-integrity/` si no existe antes de escribir los ficheros de resultados.
- [x] 4.3 Implementar la generación de un HTML estático sencillo `docs/csv-integrity/index.html` que muestre el número total de tests, cuántos han pasado, cuántos han fallado y cuántos han dado error.
- [x] 4.4 Incluir en el HTML un listado por test (id, descripción, estado) y, cuando existan, los detalles relevantes (por ejemplo, listas de archivos o columnas faltantes, regiones sin indicadores, indicadores sin metadata).
- [x] 4.5 Asegurar que el HTML y cualquier estilo usado no dependen de recursos externos (CDNs, fuentes remotas) para que el informe se pueda ver correctamente offline y desde GitHub Pages sin build adicional.

## 5. Verificación manual y documentación

- [x] 5.1 Ejecutar el nuevo comando de checks localmente contra el dataset actual y confirmar que el JSON y el HTML de resultados se generan en la ruta esperada.
- [x] 5.2 Ajustar o ampliar los mensajes de detalle de los tests para que el informe HTML sea claro y útil para diagnóstico rápido.
- [x] 5.3 Añadir una breve sección en la documentación del proyecto de datos (por ejemplo en el README) explicando cómo ejecutar los checks (`npm run check:csv`), dónde se generan los informes (`docs/csv-integrity/`) y cómo se espera integrarlos en GitHub Actions/GitHub Pages en el futuro.
