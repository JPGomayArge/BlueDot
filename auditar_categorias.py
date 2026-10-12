# -*- coding: utf-8 -*-
"""
BlueDot -- auditar_categorias.py  (SOLO REPORTE, no cambia nada)

Revisa los 30,000 eventos y busca casos donde la categoria asignada no
tiene ningun indicio en el texto del evento (id/labels), pero SI hay un
indicio claro y sin ambiguedad de OTRA categoria -- eso sugiere un
posible mal etiquetado.

Tambien sirve para encontrar candidatos a "economia" que hoy estan en
otra categoria (bancos, bolsas, crisis financieras, monedas, comercio,
etc.)

No modifica el archivo. Corre parado en la carpeta del proyecto:

    cd ~/Documents/BlueDot
    python3 auditar_categorias.py > auditoria.txt 2>&1

y pega el resumen (las primeras ~80 lineas del archivo, o todo si no es
muy largo).
"""
import json
import re
import unicodedata
import collections

with open("data/events_extended.json", encoding="utf-8") as f:
    data = json.load(f)


def norm(s):
    if not s:
        return ""
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode("ascii")
    return s.lower()


# (categoria, [frases o patrones]). Frases de mas de 3 letras se buscan como
# substring; las de 3 letras o menos se buscan con limite de palabra (\b) para
# evitar falsos positivos dentro de otras palabras.
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

def matches(blob, cat):
    found = []
    for pat in SIGNALS[cat]:
        if pat.startswith(r"\b"):
            if re.search(pat, blob):
                found.append(pat)
        elif pat in blob:
            found.append(pat)
    return found


suggestions = collections.defaultdict(list)  # (from,to) -> [ (id, matched_kw) ]
ambiguous_count = 0

for e in data:
    blob = " ".join([
        e.get("id", ""),
        (e.get("labels", {}) or {}).get("es", "") or "",
        (e.get("labels", {}) or {}).get("en", "") or "",
    ])
    blob = norm(blob)
    current = e.get("category")

    hits = {}
    for cat in CATS:
        m = matches(blob, cat)
        if m:
            hits[cat] = m

    if current in hits:
        continue  # el texto SI respalda su categoria actual -- ok

    if len(hits) == 1:
        (only_cat, kws), = hits.items()
        suggestions[(current, only_cat)].append((e["id"], kws[0]))
    elif len(hits) > 1:
        ambiguous_count += 1

print(f"Total eventos: {len(data)}")
print(f"Eventos con posible mal etiquetado (1 sola categoria alternativa clara): "
      f"{sum(len(v) for v in suggestions.values())}")
print(f"Eventos ambiguos (calzan con 2+ categorias, no se sugiere nada): {ambiguous_count}")
print()
print("═" * 70)
print(" RESUMEN POR TRANSICION SUGERIDA (de -> a: cantidad)")
print("═" * 70)
for (frm, to), items in sorted(suggestions.items(), key=lambda kv: -len(kv[1])):
    print(f"  {frm:12s} -> {to:12s}   {len(items):5d} eventos   "
          f"(ej: {items[0][0]}  [detectado por: '{items[0][1]}'])")

print()
print("═" * 70)
print(" MUESTRA DETALLADA (hasta 5 ejemplos por transicion)")
print("═" * 70)
for (frm, to), items in sorted(suggestions.items(), key=lambda kv: -len(kv[1])):
    print(f"\n-- {frm} -> {to} --")
    for eid, kw in items[:5]:
        ev = next(x for x in data if x["id"] == eid)
        label = ev.get("labels", {}).get("es") or ev.get("labels", {}).get("en")
        print(f"   {eid:40s} '{label}' (detectado por: '{kw}')")

print()
print(f"Candidatos totales a pasar A 'economia' desde otra categoria: "
      f"{sum(len(v) for (frm,to),v in suggestions.items() if to=='economia')}")
