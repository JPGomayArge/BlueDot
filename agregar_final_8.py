# -*- coding: utf-8 -*-
"""
BlueDot -- agregar_final_8.py
8 eventos mas para cerrar en 30,000 exactos (partiendo de 29,992).
Misma logica segura: lee tu archivo real, evita duplicados por id.

    cd ~/Documents/BlueDot
    python3 agregar_final_8.py
"""
import json
import collections
from pathlib import Path

EVENTS_PATH = Path(__file__).resolve().parent / "data" / "events_extended.json"

VALID_CATEGORIES = {
    "politica", "batallas", "personas", "inventos",
    "desastres", "exploracion", "religion", "cultura", "economia",
}

NEW_EVENTS = [
    dict(id="fundacion_universidad_bolonia_1088", year=1088, lat=44.49, lon=11.34,
         es="Fundación de la Universidad de Bolonia", en="Founding of the University of Bologna", category="cultura", importance=3),
    dict(id="fundacion_universidad_al_qarawiyyin_859", year=859, lat=34.06, lon=-4.98,
         es="Fundación de la Universidad Al-Qarawiyyin", en="Founding of the University of Al-Qarawiyyin", category="cultura", importance=4),
    dict(id="corpus_juris_civilis_529", year=529, lat=41.01, lon=28.98,
         es="Corpus Juris Civilis de Justiniano", en="Justinian's Corpus Juris Civilis", category="politica", importance=3),
    dict(id="construccion_angkor_wat_1150", year=1150, lat=13.41, lon=103.87,
         es="Construcción de Angkor Wat", en="Construction of Angkor Wat", category="cultura", importance=4),
    dict(id="gran_zimbabue_1200", year=1200, lat=-20.27, lon=30.93,
         es="Auge de Gran Zimbabue", en="Rise of Great Zimbabwe", category="cultura", importance=3),
    dict(id="peregrinacion_mansa_musa_1324", year=1324, lat=16.77, lon=-3.01,
         es="Peregrinación de Mansa Musa a La Meca", en="Mansa Musa's pilgrimage to Mecca", category="economia", importance=4),
    dict(id="fundacion_cruz_roja_1863", year=1863, lat=46.23, lon=6.05,
         es="Fundación de la Cruz Roja Internacional", en="Founding of the International Red Cross", category="politica", importance=4),
    dict(id="convencion_derechos_nino_1989", year=1989, lat=40.71, lon=-74.01,
         es="Convención sobre los Derechos del Niño", en="Convention on the Rights of the Child", category="politica", importance=3),
]


def to_event(e):
    return {
        "id": e["id"], "wikidataId": None, "year": e["year"], "lat": e["lat"], "lon": e["lon"],
        "labels": {"es": e["es"], "en": e["en"]},
        "wikiTitles": {"es": e["es"], "en": e["en"]},
        "category": e["category"], "importance": e["importance"],
    }


def main():
    with open(EVENTS_PATH, encoding="utf-8") as f:
        existing = json.load(f)
    print(f"Eventos existentes: {len(existing)}")

    existing_ids = set(e["id"] for e in existing)
    new_objs = [to_event(e) for e in NEW_EVENTS]
    new_ids = [o["id"] for o in new_objs]
    assert len(new_ids) == len(set(new_ids)), "id duplicado dentro de NEW_EVENTS"

    collisions = [i for i in new_ids if i in existing_ids]
    if collisions:
        print("IDs que ya existian (se omiten):", collisions)

    to_add = [o for o in new_objs if o["id"] not in existing_ids]

    bad_cat = [o for o in to_add if o["category"] not in VALID_CATEGORIES]
    if bad_cat:
        print("ERROR -- categorias invalidas, abortando:", bad_cat)
        return
    bad_coord = [o for o in to_add
                 if not (-90 <= o["lat"] <= 90) or not (-180 <= o["lon"] <= 180)]
    if bad_coord:
        print("ERROR -- coordenadas invalidas, abortando:", bad_coord)
        return

    merged = existing + to_add
    merged.sort(key=lambda d: d["year"])

    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"\nEventos nuevos agregados: {len(to_add)}")
    print(f"Total del dataset ahora: {len(merged)}")
    print(f"Archivo actualizado: {EVENTS_PATH}")


if __name__ == "__main__":
    main()
