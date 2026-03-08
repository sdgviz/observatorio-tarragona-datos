# pullAndBuild

Scripts para descargar el dataset desde Google Sheets y calcular los archivos de agregados.

## Archivos

| Archivo | Descripción |
|---|---|
| `download_and_build.py` | Orquestador principal: descarga + calcula agregados |
| `exportador_agendas.py` | Exportador original (entrada ZIP → salida ZIP, no modificar) |
| `requirements.txt` | Dependencias Python |
| `credentials.json.example` | Plantilla de credenciales de service account |

## Requisitos previos

### 1. Instalar dependencias

```bash
pip install -r pullAndBuild/requirements.txt
```

### 2. Configurar credenciales de Google

El spreadsheet es privado, por lo que necesitas una **Service Account** de Google Cloud.

#### 2a. Crear el proyecto y la service account

1. Entra en [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto (o usa uno existente)
3. Activa la **Google Sheets API**: APIs & Services → Library → "Google Sheets API" → Activar
4. Ve a: APIs & Services → Credentials → Create Credentials → **Service Account**
5. Dale un nombre (p.ej. `sheets-reader`) y pulsa "Done"
6. Abre la service account creada → pestaña **Keys** → Add Key → Create new key → **JSON**
7. Descarga el JSON generado y renómbralo a `credentials.json`
8. Coloca `credentials.json` en la carpeta `pullAndBuild/`

> `credentials.json` está en `.gitignore` y **nunca debe subirse al repositorio**.

#### 2b. Compartir el spreadsheet con la service account

1. Abre el Google Spreadsheet
2. Pulsa el botón "Compartir"
3. Añade el email de la service account (tiene la forma `nombre@proyecto.iam.gserviceaccount.com`)
4. Asigna rol **Lector** (Viewer)

### 3. Ajustar los nombres de hoja

Abre `download_and_build.py` y edita el diccionario `SHEETS` con los nombres exactos de las pestañas del spreadsheet:

```python
SHEETS = {
    "regiones":            "regiones.csv",
    "indicadores_agendas": "indicadores_agendas.csv",
    "descriptivos":        "descriptivos.csv",
    "diccionario":         "diccionario.csv",
    "metadatos_agendas":   "metadatos_agendas.csv",
    "rangos_descriptivos": "rangos_descriptivos.csv",
    "umbrales":            "umbrales.csv",
}
```

La clave (izquierda) debe coincidir con el nombre exacto de la pestaña en Google Sheets.
El valor (derecha) es el nombre del archivo CSV que se generará en `dataset/`.

## Uso

Desde la raíz del repositorio:

```bash
python pullAndBuild/download_and_build.py
```

El script:
1. Se autentica con Google Sheets API
2. Descarga cada hoja → `dataset/*.csv`
3. Calcula los tres archivos de agregados → `dataset/promedios_*.csv`

### Archivos generados en `dataset/`

**Originales (descargados de Google Sheets):**
- `regiones.csv`
- `indicadores_agendas.csv`
- `descriptivos.csv`
- `diccionario.csv`
- `metadatos_agendas.csv`
- `rangos_descriptivos.csv`
- `umbrales.csv`

**Calculados (agregados):**
- `promedios_municipio_objetivo_aue.csv`
- `promedios_municipio_meta_ods.csv`
- `promedios_municipio_ods_objetivo.csv`

## GitHub Actions (configuración futura)

Para automatizar la descarga y actualización del dataset en un workflow:

### 1. Añadir el secreto

En el repositorio de GitHub: Settings → Secrets and variables → Actions → New repository secret

- Nombre: `GOOGLE_CREDENTIALS_JSON`
- Valor: el contenido completo del archivo `credentials.json`

### 2. Workflow de ejemplo

Crea `.github/workflows/update-dataset.yml`:

```yaml
name: Update dataset

on:
  schedule:
    - cron: "0 6 * * 1"   # cada lunes a las 06:00 UTC
  workflow_dispatch:        # permite ejecución manual

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: pip install -r pullAndBuild/requirements.txt

      - name: Download and build dataset
        env:
          GOOGLE_CREDENTIALS_JSON: ${{ secrets.GOOGLE_CREDENTIALS_JSON }}
        run: python pullAndBuild/download_and_build.py

      - name: Commit updated dataset
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add dataset/
          git diff --cached --quiet || git commit -m "chore: update dataset from Google Sheets"
          git push
```

## Seguridad

- `credentials.json` está en `.gitignore` — nunca subas este archivo al repositorio.
- La service account solo necesita permiso de **Lector** sobre el spreadsheet.
- En GitHub Actions, usa secretos encriptados para pasar las credenciales.
