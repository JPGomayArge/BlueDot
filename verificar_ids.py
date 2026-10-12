# -*- coding: utf-8 -*-
"""Confirma por ID exacto si los 10 'faltantes' de checklist_gaps.py existen de verdad."""
import json

with open("data/events_extended.json", encoding="utf-8") as f:
    data = json.load(f)

ids = {e["id"]: e for e in data}

CHECK_IDS = [
    "caida_imperio_asirio_612",
    "saqueo_mongol_bagdad_1258",
    "fundacion_onu_1945",
    "asesinato_jfk_1963",
    "dinastias_shang_zhou_1600",
    "fin_califato_otomano_1924",
    "congreso_nacional_africano_1912",
    "apartheid_instituido_1948",
    "union_africana_2002",
    "invencion_polvora_850",
]

for i in CHECK_IDS:
    if i in ids:
        e = ids[i]
        print(f"OK   {i:35s} -> {e['labels']['es']} ({e['year']}) cat={e['category']}")
    else:
        print(f"FALTA {i:35s} -> NO EXISTE DE VERDAD")
