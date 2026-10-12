# -*- coding: utf-8 -*-
"""Corre esto en tu Mac para verificar la salud del dataset. No modifica nada."""
import json, collections

with open("data/events_extended.json", encoding="utf-8") as f:
    data = json.load(f)

print("TOTAL EVENTS:", len(data))

VALID_CATS = {"politica", "batallas", "personas", "inventos",
              "desastres", "exploracion", "religion", "cultura", "economia"}

cats = collections.Counter(e.get("category") for e in data)
print("\n=== Distribucion por categoria ===")
for c, n in cats.most_common():
    ok = "OK" if c in VALID_CATS else "INVALIDA <<<<<"
    print(f"{c!s:15s} {n:6d}  {ok}")

bad_cat = [e for e in data if e.get("category") not in VALID_CATS]
bad_coord = [e for e in data if not isinstance(e.get("lat"), (int, float)) or not isinstance(e.get("lon"), (int, float))]
bad_lat = [e for e in data if isinstance(e.get("lat"), (int, float)) and not (-90 <= e["lat"] <= 90)]
bad_lon = [e for e in data if isinstance(e.get("lon"), (int, float)) and not (-180 <= e["lon"] <= 180)]
missing_year = [e for e in data if not isinstance(e.get("year"), int)]
missing_id = [e for e in data if not e.get("id")]
ids = [e["id"] for e in data if e.get("id")]
dup_ids = [i for i, c in collections.Counter(ids).items() if c > 1]
missing_labels = [e for e in data if not (e.get("labels", {}).get("es") or e.get("labels", {}).get("en"))]
bad_importance = [e for e in data if not isinstance(e.get("importance"), int) or not (1 <= e.get("importance", 0) <= 5)]

print("\n=== Integridad ===")
print("categoria invalida/faltante:", len(bad_cat))
print("coords invalidas/faltantes: ", len(bad_coord))
print("lat fuera de rango:         ", len(bad_lat))
print("lon fuera de rango:         ", len(bad_lon))
print("year invalido/faltante:     ", len(missing_year))
print("id faltante:                ", len(missing_id))
print("ids duplicados:             ", len(dup_ids), dup_ids[:10])
print("sin labels es/en:           ", len(missing_labels))
print("importance invalida:        ", len(bad_importance))

years = [e["year"] for e in data if isinstance(e.get("year"), int)]
print("\n=== Rango de anyos ===")
print("min:", min(years), " max:", max(years))

print("\n=== Chequeo WWI / WWII / hitos clave (agregados a mano) ===")
def buscar(kw):
    kw = kw.lower()
    out = []
    for e in data:
        blob = " ".join([
            e.get("id", ""),
            e.get("labels", {}).get("es", "") or "",
            e.get("labels", {}).get("en", "") or "",
        ]).lower()
        if kw in blob:
            out.append((e["id"], e.get("year")))
    return out

for kw in ["primera guerra mundial", "segunda guerra mundial", "world war",
           "tratado de versalles", "pearl harbor", "normand", "hiroshima",
           "particion de la india", "11 de septiembre", "september 11"]:
    hits = buscar(kw)
    print(f"  {kw:28s} -> {hits[:3] if hits else 'NO ENCONTRADO'}")
