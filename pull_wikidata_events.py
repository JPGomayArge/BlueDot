#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BlueDot — pull_wikidata_events.py  (v7 — agrega tema "economistas")
────────────────────────────────────────────────────────────────────────────
Genera eventos nuevos consultando la API pública de Wikidata (query.wikidata.org)
y los fusiona con tu data/events_extended.json, evitando duplicados.

CONTRATO DE DATOS DE LA APP (verificado en app/index.jsx):
  category  DEBE ser una de: politica, batallas, personas, inventos,
  desastres, exploracion, religion, cultura, economia (llaves de CAT_ICONS/
  CATEGORY_META/CATEGORY_COLORS_NORMAL). lat/lon numéricos. importance
  1-5 (controla visibilidad por zoom). labels.es/en + wikiTitles.es/en
  para texto y ficha de Wikipedia. wikidataId opcional. id único.

QUÉ CAMBIÓ EN v7: agregue un tema nuevo, "economistas" (ocupacion Q188094
en Wikidata), usando el MISMO patron ya probado 6 veces (ocupacion +
P569 nacimiento + P19 lugar de nacimiento -> coordenada), solo que esta
vez con categoria "economia" en vez de "personas" -- para darle volumen
real a la categoria nueva mas alla de los ~28 eventos que agregue a mano.
Como es un tema nuevo sin probar en vivo, deje SMOKE_TEST = True de
nuevo: corre la prueba de humo, confirmame que "economistas" trajo
resultados con coordenada, y de ahi le subimos a False.

QUÉ CAMBIÓ EN v6 — basado en TU prueba de humo real de v5 (no en suposiciones):

  Los 15 temas de abajo ya se confirmaron funcionando de verdad (guardan
  eventos con coordenadas y titulos validos) en tu corrida real de v5.
  Les subi el limite (full_limit) para recuperar el volumen que se perdio
  al quitar los temas rotos, apuntando a un techo combinado de ~19,960.

  QUITADOS DEFINITIVAMENTE (fallaron 2 veces con enfoques distintos, sin
  mas ideas razonables que probar — no vale la pena una tercera adivinanza
  a ciegas sin acceso a internet en mi entorno):
    - guerras / tratados_y_politica / religion / misiones_espaciales:
      en tu corrida real de v5, los 4 seguian perdiendo el 100% (o casi)
      de sus resultados por falta de coordenada, incluso con las cadenas
      de respaldo (pais->capital, firmante->capital, fundador->nacimiento,
      operador->sede). El patron "instancia de X" de Wikidata simplemente
      no trae coordenada propia de forma confiable para estas clases.
    - inventos_y_descubrimientos, monarcas_china, juegos_olimpicos: 0
      resultados con dos Q-id/propiedades distintas cada uno (ver v5).

  COBERTURA DE REEMPLAZO: la cobertura de "guerras" e "inventos" que se
  pierde aqui ya la tapan en buena parte los eventos que agregue a mano
  (WWI, WWII, guerra fria, etc.) mas personas_ciencia/personas_milicia
  (inventores, cientificos, militares reales con coordenada de nacimiento).

USO:
  1. SMOKE_TEST = True (como esta) -> corre, revisa consola, mandamela.
  2. Si se ve bien -> SMOKE_TEST = False -> corre la version completa.

Requisitos: pip install requests
"""
import json
import re
import time
import unicodedata
from pathlib import Path

import requests

SPARQL_URL = "https://query.wikidata.org/sparql"
HEADERS = {
    "User-Agent": "BlueDot-DataPull/6.0 (educational timeline app)",
    "Accept": "application/sparql-results+json",
}

EVENTS_PATH = Path(__file__).resolve().parent / "data" / "events_extended.json"

VALID_CATEGORIES = {
    "politica", "batallas", "personas", "inventos",
    "desastres", "exploracion", "religion", "cultura",
}

# ─── Interruptor de seguridad ───────────────────────────────────────────────
SMOKE_TEST = True       # <- v7 agrega un tema nuevo (economistas) sin probar aun; valida con humo primero
SMOKE_LIMIT = 8

# ─── Temas ───────────────────────────────────────────────────────────────────
# (name, category, importance, full_limit, min_sitelinks, query)
TOPICS = [
    ("batallas_importantes", "batallas", 3, 3000, 8, """
        SELECT ?item ?date ?coord ?wikiTitleEs ?wikiTitleEn WHERE {
          ?item wdt:P31/wdt:P279* wd:Q178561 .          # instance of: battle
          ?item wdt:P585 ?date .
          ?item wdt:P625 ?coord .
          ?item wikibase:sitelinks ?sitelinks . FILTER(?sitelinks >= %MINLINKS%)
          FILTER(YEAR(?date) >= -3000 && YEAR(?date) <= 2025)
          OPTIONAL { ?eswiki schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?wikiTitleEs . }
          OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?wikiTitleEn . }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT %LIMIT%
    """),
    # v6: quite "guerras" y "tratados_y_politica" -- en tu corrida real de v5
    # seguian perdiendo casi todo por falta de coordenada pese a la cadena
    # de respaldo (pais/firmante -> capital). Ver nota al inicio del archivo.
    #
    # v6: quite "inventos_y_descubrimientos" -- fallo en 0 resultados dos
    # veces con Q-ids/propiedades distintas (Q12370 con P571 y con P575).
    # La cobertura de "inventos" queda en manos de personas_ciencia
    # (inventores/cientificos, SI confirmado funcionando) mas lo que ya
    # agregue a mano.
    ("desastres_naturales", "desastres", 3, 1800, 6, """
        SELECT ?item ?date ?coord ?wikiTitleEs ?wikiTitleEn WHERE {
          ?item wdt:P31/wdt:P279* wd:Q8065 .             # instance of: natural disaster
          ?item wdt:P585 ?date .
          OPTIONAL { ?item wdt:P625 ?coord . }
          ?item wikibase:sitelinks ?sitelinks . FILTER(?sitelinks >= %MINLINKS%)
          FILTER(YEAR(?date) >= -3000 && YEAR(?date) <= 2025)
          OPTIONAL { ?eswiki schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?wikiTitleEs . }
          OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?wikiTitleEn . }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT %LIMIT%
    """),
    # FIX v4: reemplaza la clase de "evento de exploracion" (0 resultados)
    # por el patron confirmado ocupacion+nacimiento (explorador).
    ("exploraciones_personas", "exploracion", 4, 1000, 5, """
        SELECT ?item ?date ?coord ?wikiTitleEs ?wikiTitleEn WHERE {
          ?item wdt:P106 wd:Q1734662 .                   # occupation: explorer
          ?item wdt:P569 ?date .
          ?item wdt:P19 ?bp . ?bp wdt:P625 ?coord .
          ?item wikibase:sitelinks ?sitelinks . FILTER(?sitelinks >= %MINLINKS%)
          FILTER(YEAR(?date) >= -1000 && YEAR(?date) <= 2000)
          OPTIONAL { ?eswiki schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?wikiTitleEs . }
          OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?wikiTitleEn . }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT %LIMIT%
    """),
    # v6: quite "religion" (movimiento religioso) -- en tu corrida real de
    # v5 seguia perdiendo casi todo por falta de coordenada pese a 3
    # respaldos (sede, fundador->nacimiento, ubicacion generica). La
    # cobertura de religion queda en personas_religion (clerigos reales
    # con coordenada de nacimiento, SI confirmado) mas papas y lo agregado
    # a mano (Concilio de Trento, sijismo, etc.)
    ("cultura", "cultura", 3, 800, 5, """
        SELECT ?item ?date ?coord ?wikiTitleEs ?wikiTitleEn WHERE {
          ?item wdt:P31/wdt:P279* wd:Q1497649 .          # instance of: cultural movement
          ?item wdt:P571 ?date .
          OPTIONAL { ?item wdt:P625 ?coord . }
          OPTIONAL { ?item wdt:P276 ?loc . ?loc wdt:P625 ?coordLoc . }
          BIND(COALESCE(?coord, ?coordLoc) AS ?coordFinal)
          ?item wikibase:sitelinks ?sitelinks . FILTER(?sitelinks >= %MINLINKS%)
          FILTER(YEAR(?date) >= -3000 && YEAR(?date) <= 2025)
          OPTIONAL { ?eswiki schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?wikiTitleEs . }
          OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?wikiTitleEn . }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT %LIMIT%
    """),

    # ══ Confirmados en tu prueba de humo — sin cambios ═══════════════════════

    ("paises_independencias", "politica", 4, 600, 3, """
        SELECT ?item ?date ?coord ?wikiTitleEs ?wikiTitleEn WHERE {
          ?item wdt:P31 wd:Q3624078 .                    # sovereign state
          ?item wdt:P571 ?date .
          OPTIONAL { ?item wdt:P36 ?cap . ?cap wdt:P625 ?coordCap . }
          OPTIONAL { ?item wdt:P625 ?coord . }
          BIND(COALESCE(?coord, ?coordCap) AS ?coordFinal)
          ?item wikibase:sitelinks ?sitelinks . FILTER(?sitelinks >= %MINLINKS%)
          FILTER(YEAR(?date) >= 1700 && YEAR(?date) <= 2025)
          OPTIONAL { ?eswiki schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?wikiTitleEs . }
          OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?wikiTitleEn . }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT %LIMIT%
    """),
    ("papas", "religion", 3, 260, 3, """
        SELECT ?item ?date ?coord ?wikiTitleEs ?wikiTitleEn WHERE {
          ?item wdt:P39 wd:Q19546 .                      # position held: pope
          ?item wdt:P569 ?date .
          ?item wdt:P19 ?bp . ?bp wdt:P625 ?coord .
          ?item wikibase:sitelinks ?sitelinks . FILTER(?sitelinks >= %MINLINKS%)
          FILTER(YEAR(?date) >= 0 && YEAR(?date) <= 2000)
          OPTIONAL { ?eswiki schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?wikiTitleEs . }
          OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?wikiTitleEn . }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT %LIMIT%
    """),
    ("emperadores_romanos", "personas", 4, 100, 3, """
        SELECT ?item ?date ?coord ?wikiTitleEs ?wikiTitleEn WHERE {
          ?item wdt:P39 wd:Q842606 .                     # position held: Roman emperor
          ?item wdt:P569 ?date .
          ?item wdt:P19 ?bp . ?bp wdt:P625 ?coord .
          ?item wikibase:sitelinks ?sitelinks . FILTER(?sitelinks >= %MINLINKS%)
          FILTER(YEAR(?date) >= -100 && YEAR(?date) <= 500)
          OPTIONAL { ?eswiki schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?wikiTitleEs . }
          OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?wikiTitleEn . }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT %LIMIT%
    """),
    ("monarcas_uk_fr_es", "personas", 3, 300, 4, """
        SELECT ?item ?date ?coord ?wikiTitleEs ?wikiTitleEn WHERE {
          VALUES ?country { wd:Q145 wd:Q179876 wd:Q142 wd:Q29 }   # UK, Kingdom of England, France, Spain
          ?item wdt:P106 wd:Q116 .                       # occupation: monarch
          ?item wdt:P27 ?country .
          ?item wdt:P569 ?date .
          ?item wdt:P19 ?bp . ?bp wdt:P625 ?coord .
          ?item wikibase:sitelinks ?sitelinks . FILTER(?sitelinks >= %MINLINKS%)
          FILTER(YEAR(?date) >= 800 && YEAR(?date) <= 2000)
          OPTIONAL { ?eswiki schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?wikiTitleEs . }
          OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?wikiTitleEn . }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT %LIMIT%
    """),
    # v5: quite "monarcas_china" -- fallo en 0 resultados con dos enfoques
    # distintos (posicion "Emperador de China" y luego pais=dinastia via
    # P27). El P27 "pais de ciudadania" parece no aplicarse bien a
    # monarcas historicos chinos en el modelo de datos de Wikidata.
    ("premios_nobel", "personas", 4, 900, 5, """
        SELECT ?item ?date ?coord ?wikiTitleEs ?wikiTitleEn WHERE {
          ?item wdt:P166 ?prize .
          ?prize wdt:P279* wd:Q7191 .                    # Nobel Prize (generico)
          ?item wdt:P569 ?date .
          ?item wdt:P19 ?bp . ?bp wdt:P625 ?coord .
          ?item wikibase:sitelinks ?sitelinks . FILTER(?sitelinks >= %MINLINKS%)
          FILTER(YEAR(?date) >= 1800 && YEAR(?date) <= 2000)
          OPTIONAL { ?eswiki schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?wikiTitleEs . }
          OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?wikiTitleEn . }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT %LIMIT%
    """),
    # v6: quite "juegos_olimpicos" y "misiones_espaciales" -- el primero
    # fallo en 0 resultados con dos Q-ids distintos; el segundo seguia
    # perdiendo casi todo por falta de coordenada pese al respaldo via
    # operador->sede y ubicacion generica, en tu corrida real de v5.

    # v7: nuevo -- economistas (ocupacion Q188094), mismo patron probado
    # (ocupacion + nacimiento + lugar de nacimiento) que ya funciona para
    # personas_ciencia/artes/etc, pero con categoria "economia" en vez de
    # "personas" para darle volumen real a esa categoria nueva.
    ("economistas", "economia", 3, 1500, 12, """
        SELECT ?item ?date ?coord ?wikiTitleEs ?wikiTitleEn WHERE {
          ?item wdt:P106 wd:Q188094 .                    # occupation: economist
          ?item wdt:P569 ?date .
          ?item wdt:P19 ?bp . ?bp wdt:P625 ?coord .
          ?item wikibase:sitelinks ?sitelinks . FILTER(?sitelinks >= %MINLINKS%)
          FILTER(YEAR(?date) >= -1000 && YEAR(?date) <= 2010)
          OPTIONAL { ?eswiki schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?wikiTitleEs . }
          OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?wikiTitleEn . }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT %LIMIT%
    """),

    # ══ personas_historicas partida en 6 sub-temas por ocupacion ═════
    # (arregla el timeout 504 de la consulta unica sobre "cualquier humano")
]

_PERSONAS_OCUPACIONES = [
    ("personas_ciencia", "Q901", 2200, 12),        # scientist
    ("personas_artes", "Q483501", 2000, 12),       # artist
    ("personas_politica", "Q82955", 2200, 12),     # politician
    ("personas_literatura", "Q36180", 1700, 12),   # writer
    ("personas_milicia", "Q47064", 1700, 12),      # military personnel
    ("personas_religion", "Q42603", 1400, 12),     # clergyman
]
for _name, _occ_qid, _full_limit, _min_links in _PERSONAS_OCUPACIONES:
    TOPICS.append((_name, "personas", 3, _full_limit, _min_links, f"""
        SELECT ?item ?date ?coord ?wikiTitleEs ?wikiTitleEn WHERE {{
          ?item wdt:P106 wd:{_occ_qid} .
          ?item wdt:P569 ?date .
          ?item wdt:P19 ?bp . ?bp wdt:P625 ?coord .
          ?item wikibase:sitelinks ?sitelinks . FILTER(?sitelinks >= %MINLINKS%)
          FILTER(YEAR(?date) >= -3000 && YEAR(?date) <= 2010)
          OPTIONAL {{ ?eswiki schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?wikiTitleEs . }}
          OPTIONAL {{ ?enwiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?wikiTitleEn . }}
        }}
        ORDER BY DESC(?sitelinks)
        LIMIT %LIMIT%
    """))

# Suma de full_limit -- ver print al arrancar la corrida completa.


def run_query(query, limit, min_links):
    query = query.replace("%LIMIT%", str(limit)).replace("%MINLINKS%", str(min_links))
    r = requests.get(SPARQL_URL, params={"query": query, "format": "json"}, headers=HEADERS, timeout=180)
    r.raise_for_status()
    return r.json()["results"]["bindings"]


def parse_coord(value):
    m = re.match(r"Point\(([-\d.]+)\s+([-\d.]+)\)", value)
    if not m:
        return None, None
    lon, lat = float(m.group(1)), float(m.group(2))
    return lat, lon


def parse_year(date_str):
    """Robusto contra el signo '+' que Wikidata antepone a fechas d.C."""
    if not date_str:
        return None
    sign = -1 if date_str.startswith("-") else 1
    stripped = date_str.lstrip("+-")
    year_part = stripped.split("-", 1)[0]
    try:
        return sign * int(year_part)
    except ValueError:
        return None


def slugify(text):
    text = unicodedata.normalize("NFD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "_", text).strip("_").lower()
    return text[:60] or "evento"


def wikidata_qid(uri):
    return uri.rsplit("/", 1)[-1]


def coord_from_row(row):
    for key in ("coordFinal", "coord"):
        if key in row and row[key].get("value"):
            return parse_coord(row[key]["value"])
    return None, None


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        existing = json.load(f)

    existing_ids = set(e["id"] for e in existing)
    existing_qids = set(e["wikidataId"] for e in existing if e.get("wikidataId"))

    total_target = sum(t[3] for t in TOPICS)
    if SMOKE_TEST:
        print("═" * 70)
        print(" PRUEBA DE HUMO — SMOKE_TEST = True")
        print(f" Cada tema va a traer solo {SMOKE_LIMIT} resultados (no {total_target}).")
        print(" Revisa la salida de cada tema. Si se ve bien, pon SMOKE_TEST = False.")
        print("═" * 70)
    else:
        print(f"Corrida completa — techo objetivo combinado: ~{total_target} eventos.")

    new_events = []
    seen_qids_this_run = set()
    report = []

    for name, category, importance, full_limit, min_links, query in TOPICS:
        assert category in VALID_CATEGORIES, f"categoria invalida en tema {name}: {category}"
        limit = SMOKE_LIMIT if SMOKE_TEST else full_limit
        print(f"\n── Tema: {name}  (categoria={category}, min_sitelinks={min_links}, limit={limit}) ──")
        try:
            rows = run_query(query, limit, min_links)
        except Exception as exc:
            print(f"   ERROR consultando {name}: {exc}")
            report.append((name, 0, 0, "ERROR", str(exc)))
            continue

        fetched = len(rows)
        kept = 0
        skip_no_coord = 0
        skip_no_title = 0
        skip_dup = 0
        skip_no_year = 0

        for row in rows:
            qid = wikidata_qid(row["item"]["value"])
            if qid in existing_qids or qid in seen_qids_this_run:
                skip_dup += 1
                continue

            date_str = row.get("date", {}).get("value")
            year = parse_year(date_str)
            if year is None:
                skip_no_year += 1
                continue

            lat, lon = coord_from_row(row)
            if lat is None:
                skip_no_coord += 1
                continue

            label_es = row.get("wikiTitleEs", {}).get("value")
            label_en = row.get("wikiTitleEn", {}).get("value")
            if not label_es and not label_en:
                skip_no_title += 1
                continue
            label_es = label_es or label_en
            label_en = label_en or label_es

            eid = f"{slugify(label_es)}_{abs(year)}"
            base_eid, suffix = eid, 2
            while eid in existing_ids or eid in {e["id"] for e in new_events}:
                eid = f"{base_eid}_{suffix}"
                suffix += 1

            new_events.append({
                "id": eid,
                "wikidataId": qid,
                "year": year,
                "lat": round(lat, 2),
                "lon": round(lon, 2),
                "labels": {"es": label_es, "en": label_en},
                "wikiTitles": {"es": label_es, "en": label_en},
                "category": category,
                "importance": importance,
            })
            seen_qids_this_run.add(qid)
            kept += 1

        print(f"   trajo={fetched}  guardados={kept}  "
              f"descartados: sin_coord={skip_no_coord} sin_titulo={skip_no_title} "
              f"sin_anyo={skip_no_year} duplicado={skip_dup}")
        if fetched == 0:
            print(f"   AVISO: 0 resultados en '{name}'.")
        if kept > 0:
            example = new_events[-1]
            print(f"   ejemplo: {example['labels']['es']} ({example['year']}) "
                  f"lat={example['lat']} lon={example['lon']}")
        report.append((name, fetched, kept, "OK", ""))
        time.sleep(1)

    print("\n══ Resumen ═════════════════════════════════════════════════════")
    for name, fetched, kept, status, err in report:
        print(f"  {name:28s} trajo={fetched:4d}  guardados={kept:4d}  {status} {err}")
    print(f"\nTotal de eventos nuevos: {len(new_events)}")

    if not new_events:
        print("\nNo se guardo nada nuevo -- no se toca events_extended.json.")
        return

    merged = existing + new_events
    merged.sort(key=lambda d: d["year"])

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Total de eventos en el dataset: {len(merged)}")
    print(f"Archivo actualizado: {EVENTS_PATH}")
    if SMOKE_TEST:
        print("\n(Este fue un run de PRUEBA -- si se ve bien, pon SMOKE_TEST = False y corre de nuevo)")


if __name__ == "__main__":
    main()
