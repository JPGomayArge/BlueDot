# -*- coding: utf-8 -*-
"""
BlueDot -- aplicar_correcciones.py
Aplica SOLO las 8 transiciones de categoria que revisamos y confirmamos
como correcciones reales (no falsos positivos) tras ver el reporte de
auditar_categorias.py. Deja todo lo demas exactamente igual.

Transiciones aprobadas:
  politica  -> religion   (edificios "Iglesia de X" mal puestos)
  politica  -> desastres  (terremotos/epidemias mal puestos)
  cultura   -> religion   (mas iglesias)
  batallas  -> desastres  (masacres/hundimientos, consistente con genocidios)
  politica  -> batallas   (batallas/revueltas reales)
  religion  -> desastres  (Masacre de San Bartolome)
  cultura   -> economia   ("sopa economica")
  politica  -> economia   (Occupy Wall Street)

NO se tocan: personas->religion, exploracion->inventos, batallas->exploracion,
y el resto de casos de un solo evento que revisamos y son falsos positivos
o categorizaciones intencionales (nombres propios como "Cristian"/"Islam",
"guerra de los chimpances" que es sobre primates, "Revolucion neolitica"
e "industrial" que no son politicas, expediciones MILITARES mal detectadas
como exploracion cientifica, etc.)

Corre parado en la carpeta del proyecto:
    cd ~/Documents/BlueDot
    python3 aplicar_correcciones.py
"""
import json
import re
import unicodedata
import collections
from pathlib import Path

EVENTS_PATH = Path(__file__).resolve().parent / "data" / "events_extended.json"

VALID_CATEGORIES = {
    "politica", "batallas", "personas", "inventos",
    "desastres", "exploracion", "religion", "cultura", "economia",
}

# Debe ser IDENTICO al de auditar_categorias.py para que la deteccion
# coincida exactamente con lo que revisamos juntos.
SIGNALS = {
    "economia": [
        "banco central", "bolsa de valores", "crisis financiera", "crisis economica",
        "economico", "economica", "moneda", "divisa", "arancel", r"\bpib\b",
        "inflacion", "recesion", "mercado de valores", "opep", r"\bfmi\b",
        "banco mundial", "reserva federal", "tratado comercial", "bancarrota",
        "quiebra", "precio del petroleo", "wall street", "fondo monetario",
        "libre comercio", "papel moneda", "acuñacion", "burbuja financiera",
        "deuda externa", "deuda publica",
    ],
    "religion": [
        "papa ", "concilio", r"\biglesia\b", "califato", "budis", "islam", "cristian",
        "sinodo", "vaticano", "religios", "mezquita", "sinagoga", "monasterio",
        "orden religiosa", "peregrinacion", "misionero", "arzobispo", "obispo",
        "clero", "sijismo", "hinduis", "judaismo",
    ],
    "desastres": [
        "terremoto", "tsunami", "hambruna", "epidemia", "pandemia", "erupcion",
        "inundacion", "incendio", "genocidio", "masacre", "accidente", "explosion",
        "hundimiento", "naufragio", "derrame de petroleo", "ciclon", "huracan",
        "tornado", "sequia", "desastre",
    ],
    "inventos": [
        "invencion", "invento de", "descubrimiento de", "patente de", "primer vuelo",
        "primera computadora", "vacuna", "telescopio", "microscopio",
        "circuito integrado", "transistor", "microprocesador", "microchip",
    ],
    "exploracion": [
        "expedicion", "circunnavegacion", "polo sur", "polo norte", "descenso a",
        "ascenso al", "sonda espacial", "vuelo espacial", "mision espacial",
        "astronauta", "cosmonauta", "primer humano en el espacio",
    ],
    "cultura": [
        "pintura de", "sinfonia", "estreno de", "festival de", "movimiento artistico",
        "museo", "ballet", "juegos olimpicos", "copa mundial", "renacimiento",
        "manifiesto surrealista", "premio nobel de literatura",
    ],
    "batallas": [
        "batalla de", "guerra de", "guerra civil", "invasion de", "asedio de",
        "sitio de", "conflicto armado", r"\brevuelta\b", r"\brebelion\b",
        "levantamiento armado",
    ],
    "politica": [
        "tratado de", "constitucion", "independencia de", "elecciones",
        "referendum", "golpe de estado", "fundacion de la onu", "acuerdo de",
        "revolucion", "parlamento", "primer ministro", "presidente electo",
    ],
}
CATS = list(SIGNALS.keys())

APPROVED_TRANSITIONS = {
    ("politica", "religion"),
    ("politica", "desastres"),
    ("cultura", "religion"),
    ("batallas", "desastres"),
    ("politica", "batallas"),
    ("religion", "desastres"),
    ("cultura", "economia"),
    ("politica", "economia"),
}


def norm(s):
    if not s:
        return ""
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode("ascii")
    return s.lower()


def matches(blob, cat):
    found = []
    for pat in SIGNALS[cat]:
        if pat.startswith(r"\b"):
            if re.search(pat, blob):
                found.append(pat)
        elif pat in blob:
            found.append(pat)
    return found


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        data = json.load(f)

    changes = []
    for e in data:
        blob = norm(" ".join([
            e.get("id", ""),
            (e.get("labels", {}) or {}).get("es", "") or "",
            (e.get("labels", {}) or {}).get("en", "") or "",
        ]))
        current = e.get("category")

        hits = {}
        for cat in CATS:
            m = matches(blob, cat)
            if m:
                hits[cat] = m

        if current in hits:
            continue
        if len(hits) != 1:
            continue

        (only_cat, kws), = hits.items()
        if (current, only_cat) in APPROVED_TRANSITIONS:
            changes.append((e["id"], current, only_cat))
            e["category"] = only_cat

    # Validacion final antes de guardar
    bad = [e["id"] for e in data if e["category"] not in VALID_CATEGORIES]
    if bad:
        print("ERROR -- quedaron categorias invalidas, no se guarda nada:", bad)
        return

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    by_transition = collections.Counter((c[1], c[2]) for c in changes)
    print(f"Total eventos re-categorizados: {len(changes)}")
    print("Por transicion:")
    for (frm, to), n in sorted(by_transition.items(), key=lambda kv: -kv[1]):
        print(f"  {frm:10s} -> {to:10s}   {n}")
    print(f"\nArchivo actualizado: {EVENTS_PATH}")


if __name__ == "__main__":
    main()
