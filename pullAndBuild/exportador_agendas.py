import zipfile
import pandas as pd
import re
import io
from pathlib import Path

# ============================================================
# CONFIGURACIÓN — solo ajusta esta ruta
# ============================================================
ZIP_ENTRADA = r"C:\Users\dejua\Desktop\df_prueba_csv.zip"
# El ZIP de salida se generará en la misma carpeta automáticamente
# con el nombre:  df_prueba_csv_export.zip
# ============================================================

# Nombre de los CSVs originales esperados dentro del ZIP
# (se incluirán en el ZIP de salida en este mismo orden)
CSVS_ORIGINALES = [
    "regiones.csv",
    "indicadores_agendas.csv",
    "descriptivos.csv",
    "diccionario.csv",
    "metadatos_agendas.csv",
    "rangos_descriptivos.csv",
    "umbrales.csv",
]


# -------------------------------------------------------------
# Helpers
# -------------------------------------------------------------
def norm(s: str) -> str:
    return re.sub(r"\s+", "", str(s).strip().lower())

def pick_col(df, candidates, contains=True):
    cols  = list(df.columns)
    ncols = [norm(c) for c in cols]
    for cand in candidates:
        nc = norm(cand)
        for c, nc_c in zip(cols, ncols):
            if contains     and nc in nc_c:  return c
            if not contains and nc == nc_c:  return c
    return None

def explode_semicolon(df, id_col, list_col, new_col):
    x = df[[id_col, list_col]].copy()
    x = x.dropna(subset=[list_col])
    x[list_col] = x[list_col].astype(str).str.replace(" ", "", regex=False)
    x[new_col]  = x[list_col].str.split(";")
    x = x.explode(new_col)
    x[new_col] = x[new_col].astype(str).str.strip()
    x = x[(x[new_col] != "") & (x[new_col].str.lower() != "nan")]
    return x[[id_col, new_col]].drop_duplicates()

def df_to_csv_bytes(df: pd.DataFrame) -> bytes:
    """DataFrame → bytes CSV con BOM UTF-8 (Excel es-ES lo abre bien)."""
    buf = io.StringIO()
    df.to_csv(buf, index=False, encoding="utf-8")
    return ("\uFEFF" + buf.getvalue()).encode("utf-8")

def raw_to_bom_bytes(raw: bytes) -> bytes:
    """Añade BOM UTF-8 a bytes de CSV si no lo tienen ya."""
    text = raw.decode("utf-8", errors="replace")
    if text.startswith("\uFEFF"):
        return raw
    return ("\uFEFF" + text).encode("utf-8")


# -------------------------------------------------------------
# 1) Leer todos los CSVs del ZIP de entrada
# -------------------------------------------------------------
print("📂 Leyendo ZIP de entrada...")
raws = {}   # nombre → bytes originales

with zipfile.ZipFile(ZIP_ENTRADA, "r") as z:
    nombres_en_zip = z.namelist()
    print(f"   Archivos encontrados en el ZIP: {nombres_en_zip}")

    for nombre in CSVS_ORIGINALES:
        if nombre in nombres_en_zip:
            with z.open(nombre) as f:
                raws[nombre] = f.read()
            print(f"   ✔ Leído: {nombre}")
        else:
            print(f"   ⚠  No encontrado (se omitirá): {nombre}")

# Los dos que necesitamos para calcular son obligatorios
if "indicadores_agendas.csv" not in raws:
    raise FileNotFoundError("❌ 'indicadores_agendas.csv' no encontrado en el ZIP.")
if "metadatos_agendas.csv" not in raws:
    raise FileNotFoundError("❌ 'metadatos_agendas.csv' no encontrado en el ZIP.")

ind  = pd.read_csv(io.BytesIO(raws["indicadores_agendas.csv"]), dtype=str)
meta = pd.read_csv(io.BytesIO(raws["metadatos_agendas.csv"]),   dtype=str)

print("\n  indicadores_agendas columns :", list(ind.columns))
print("  metadatos_agendas   columns :", list(meta.columns))


# -------------------------------------------------------------
# 2) Detectar columnas automáticamente
# -------------------------------------------------------------
COL_IND  = pick_col(ind,  ["indicador"],                                              contains=True)
COL_INE  = pick_col(ind,  ["codigo_ine","cod_ine","ine","código_ine"],                contains=True)
COL_PER  = pick_col(ind,  ["periodo","anio","año","year"],                            contains=True)
COL_IDX  = pick_col(ind,  ["indice","índice","index"],                                contains=True)

META_IND = pick_col(meta, ["indicador"],                                              contains=True)
# Tarragona Línea Estratégica (Level 1). Exact-match only — ver
# download_and_build.py para la justificación (evitar drift a `aue1`).
COL_LE   = pick_col(meta, ["le"],                                                     contains=False)
COL_ODS  = pick_col(meta, ["meta_ods","metaods","meta","ods"],                        contains=True)

missing = [name for name, col in [
    ("COL_IND",  COL_IND),  ("COL_INE", COL_INE), ("COL_PER", COL_PER), ("COL_IDX", COL_IDX),
    ("META_IND", META_IND), ("COL_LE",  COL_LE),  ("COL_ODS", COL_ODS),
] if col is None]

if missing:
    legacy_present = any(
        norm(c) in ("aue1", "aue2", "objetivo_aue", "aue")
        for c in meta.columns
    )
    hint = (
        "\n   · Se detectaron columnas legacy (aue1/aue2). A partir de la"
        " migración a Tarragona se requiere la columna `le` en"
        " metadatos_agendas.csv; no se aceptará `aue1` como sustituto."
        if legacy_present and "COL_LE" in missing
        else ""
    )
    raise ValueError(
        f"❌ No se encontraron las columnas: {missing}\n"
        "Revisa los nombres reales arriba y ajusta pick_col si es necesario."
        + hint
    )

print("\n✅ Columnas detectadas:")
print("  ind  :", {"indicador": COL_IND, "codigo_ine": COL_INE, "periodo": COL_PER, "indice": COL_IDX})
print("  meta :", {"indicador": META_IND, "le": COL_LE, "meta_ods": COL_ODS})


# -------------------------------------------------------------
# 3) Limpiar y convertir tipos
# -------------------------------------------------------------
ind[COL_IND]   = ind[COL_IND].astype(str).str.strip()
ind[COL_INE]   = ind[COL_INE].astype(str).str.strip()   # código municipio como texto
meta[META_IND] = meta[META_IND].astype(str).str.strip()

ind[COL_PER] = pd.to_numeric(ind[COL_PER], errors="coerce")
ind[COL_IDX] = pd.to_numeric(ind[COL_IDX], errors="coerce")


# -------------------------------------------------------------
# 4) Último valor por municipio + indicador (periodo máximo)
# -------------------------------------------------------------
latest = (
    ind.dropna(subset=[COL_INE, COL_IND, COL_PER, COL_IDX])
       .sort_values([COL_INE, COL_IND, COL_PER])
       .groupby([COL_INE, COL_IND], as_index=False)
       .tail(1)
       [[COL_INE, COL_IND, COL_PER, COL_IDX]]
       .rename(columns={COL_PER: "periodo_latest", COL_IDX: "indice_latest"})
)


# -------------------------------------------------------------
# 5) Explosión de relaciones múltiples (separador ";")
# -------------------------------------------------------------
# La columna de salida se sigue llamando `objetivo_aue` por compatibilidad
# aguas abajo, pero su contenido ahora son ids de Línea Estratégica Tarragona
# (1..6) tomados de `le`.
le_long  = explode_semicolon(meta, META_IND, COL_LE,  "objetivo_aue")
ods_long = explode_semicolon(meta, META_IND, COL_ODS, "meta_ods")

# --- Integrity check: LE ids deben estar en 1..6 ---
le_values = set(le_long["objetivo_aue"].astype(str))
invalid_le = {v for v in le_values if not (v.isdigit() and 1 <= int(v) <= 6)}
if invalid_le:
    raise ValueError(
        f"❌ Valores inválidos en la columna `le` de metadatos_agendas.csv: {sorted(invalid_le)}.\n"
        "   Se esperan ids de Línea Estratégica Tarragona en el rango 1..6."
    )


# -------------------------------------------------------------
# 6) Promedios por municipio × Línea Estratégica (LE)
# -------------------------------------------------------------
aue_muni_avg = (
    latest.merge(le_long, left_on=COL_IND, right_on=META_IND, how="inner")
          .groupby([COL_INE, "objetivo_aue"], as_index=False)
          .agg(
              promedio_indice = ("indice_latest",  "mean"),
              n_indicadores   = (COL_IND,          "nunique"),
              periodo_max     = ("periodo_latest",  "max"),
          )
          .sort_values([COL_INE, "objetivo_aue"])
)

# -------------------------------------------------------------
# 7) Promedios por municipio × meta ODS
# -------------------------------------------------------------
ods_meta_muni_avg = (
    latest.merge(ods_long, left_on=COL_IND, right_on=META_IND, how="inner")
          .groupby([COL_INE, "meta_ods"], as_index=False)
          .agg(
              promedio_indice = ("indice_latest",  "mean"),
              n_indicadores   = (COL_IND,          "nunique"),
              periodo_max     = ("periodo_latest",  "max"),
          )
          .sort_values([COL_INE, "meta_ods"])
)

# -------------------------------------------------------------
# 8) Agregar metas → ODS objetivo (por municipio)
# -------------------------------------------------------------
ods_meta_muni_avg["ods_objetivo"] = (
    ods_meta_muni_avg["meta_ods"].astype(str).str.split(".").str[0]
)

ods_obj_muni_avg = (
    ods_meta_muni_avg.groupby([COL_INE, "ods_objetivo"], as_index=False)
                     .agg(
                         promedio_metas = ("promedio_indice", "mean"),
                         n_metas        = ("meta_ods",        "nunique"),
                     )
                     .sort_values([COL_INE, "ods_objetivo"])
)


# -------------------------------------------------------------
# 9) Construir el ZIP de salida (misma carpeta que el de entrada)
# -------------------------------------------------------------
zip_entrada_path = Path(ZIP_ENTRADA)
ZIP_SALIDA = zip_entrada_path.parent / (zip_entrada_path.stem + "_export.zip")

print(f"\n📦 Generando ZIP de salida: {ZIP_SALIDA}")

archivos_calculados = {
    "promedios_municipio_objetivo_aue.csv" : df_to_csv_bytes(aue_muni_avg),
    "promedios_municipio_meta_ods.csv"     : df_to_csv_bytes(ods_meta_muni_avg),
    "promedios_municipio_ods_objetivo.csv" : df_to_csv_bytes(ods_obj_muni_avg),
}

with zipfile.ZipFile(ZIP_SALIDA, "w", compression=zipfile.ZIP_DEFLATED) as zout:

    # --- Originales (en el orden declarado en CSVS_ORIGINALES) ---
    for nombre in CSVS_ORIGINALES:
        if nombre in raws:
            data = raw_to_bom_bytes(raws[nombre])
            zout.writestr(nombre, data)
            print(f"  ✔ [original]  {nombre}  ({len(data):,} bytes)")

    # --- Calculados ---
    for nombre, data in archivos_calculados.items():
        zout.writestr(nombre, data)
        print(f"  ✔ [calculado] {nombre}  ({len(data):,} bytes)")

print(f"\n✅ ZIP generado correctamente en:\n   {ZIP_SALIDA}")
print(f"   Total archivos: {len([n for n in CSVS_ORIGINALES if n in raws]) + len(archivos_calculados)}")
