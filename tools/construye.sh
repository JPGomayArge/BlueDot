#!/bin/bash
# CONSTRUYE EL MAPA DE BLUEDOT DESDE LA BASE, CON COMPUERTAS.
#
# Un solo comando reconstruye data/mapa.json a partir de una base y de las
# tablas de tools/, en el orden que hace falta, y SOLO escribe la salida si
# pasa las compuertas de calidad. Si una falla, deja el intermedio en
# <salida>.fallido.json y el informe en <salida>.informe.txt, y sale con error.
# Asi la calidad del mapa deja de depender de que alguien se acuerde de pasar
# cada herramienta: o pasa todo, o no sale nada.
#
#   tools/construye.sh <base.json> <salida.json> [index.jsx]
#     base.json    el dato del mapa de partida (data/mapa.json)
#     salida.json  donde dejar el mapa construido
#     index.jsx    (opcional) la app; se le renuevan el orden de revision y el
#                  velo de tierra en una copia <salida>.index.jsx, nunca en sitio
#   SALTAR_AMBITOS=1     no rehace los sustratos por tablas (la base ya los trae)
#   NODE_PATH=...        donde esta @babel/parser si no esta en tools/node_modules
#   (la forma vieja, con el dato dentro de index.jsx, sigue funcionando si se le
#    da un .jsx como base: lib.js entiende las dos)
#
# PASOS
#   1. sustratos por bioma/region/rio (ambitos_*.js, remodela_fisico.js)
#   2. astillas, dobles (tabla + regla del sustrato), fusion, auto-intersecciones
#   3. rellena_huecos: el sustrato vuelve donde queda suelo vacio
#   4. dobles otra vez (los rellenos pueden rozar), estructura
#   5. comprobaciones: capitales, plazas, radiografia
#   6. modo revision, velo de tierra y lineas de sustrato (revision_app, render_base)
#   7. sintaxis (chksintaxis, chkjsx)
#
# COMPUERTAS (todas tienen que pasar)
#   G1  chkjsx y chksintaxis OK
#   G2  dobles estado-estado: ningun anio por encima de DOBLE_EE_MAX g2 (1: una celda
#       de la radiografia a un grado; un solape de verdad son decenas)
#   G3  dobles con sustrato: media por era por debajo de DOBLE_EC_MAX g2 (2)
#   G4  capitales: discrepancias <= CAP_MAX (0)
#   G5  plazas: discrepancias <= PLAZAS_MAX (12)
#   G6  periodos sin anillos: 0; anillos con auto-interseccion: 0
set -u
AQUI="$(cd "$(dirname "$0")" && pwd)"
BASE="${1:?uso: construye.sh <base.json> <salida.json> [index.jsx]}"; SALIDA="${2:?uso: construye.sh <base.json> <salida.json> [index.jsx]}"; APP="${3:-}"
DOBLE_EE_MAX="${DOBLE_EE_MAX:-1}"; DOBLE_EC_MAX="${DOBLE_EC_MAX:-2}"; CAP_MAX="${CAP_MAX:-0}"; PLAZAS_MAX="${PLAZAS_MAX:-12}"
EXT="${BASE##*.}"; W="$SALIDA.trabajo.$EXT"; INF="$SALIDA.informe.txt"; TMP="$(dirname "$SALIDA")/_construye"
mkdir -p "$TMP"; : > "$INF"
cd "$AQUI"
export JSX="$W"
export NODE_PATH="${NODE_PATH:-$AQUI/node_modules}"
log(){ echo "=== $1  $(date +%H:%M:%S)" | tee -a "$INF"; }
falla(){ echo "!! COMPUERTA FALLIDA: $1" | tee -a "$INF"; mv -f "$W" "$SALIDA.fallido.$EXT"; echo "   intermedio en $SALIDA.fallido.$EXT, informe en $INF"; exit 1; }
# la app: con base .jsx (forma vieja) es el propio trabajo; con base .json es la copia de index.jsx
if [ "$EXT" = "jsx" ]; then WAPP="$W"; elif [ -n "$APP" ]; then WAPP="$SALIDA.index.jsx"; cp "$APP" "$WAPP"; chmod u+w "$WAPP"; else WAPP=""; fi

cp "$BASE" "$W"; chmod u+w "$W"
log "base $BASE ($(du -h "$BASE" | cut -f1))"

# --- 1. sustratos ------------------------------------------------------------
if [ "${SALTAR_AMBITOS:-0}" != "1" ]; then
  for T in ambitos_siberia ambitos_norteamerica ambitos_africa ambitos_resto; do
    log "$T"; IGNORA=2 node remodela_fisico.js $T.js --aplica 2>&1 | grep -v "^   \[" | tail -4 >> "$INF"
  done
  log "parches"; NORESTAR=cree_innu node remodela_fisico.js ambitos_parches.js --aplica 2>&1 | tail -2 >> "$INF"
  IGNORA=2 NORESTAR=boreal_fenoscandia node remodela_fisico.js ambitos_parches2.js --aplica 2>&1 | tail -2 >> "$INF"
fi

# --- 2. astillas, dobles, fusion, auto-intersecciones ----------------------------
log "astillas"; node astillas.js --aplica 2>&1 | head -1 >> "$INF"
log "radiografia a"; SALIDA="$TMP/radio_a.json" node radiografia.js > "$TMP/radio_a.txt" 2>/dev/null
log "dobles"; PARES="$TMP/radio_a.json" TABLAS=ambitos_siberia.js,ambitos_norteamerica.js,ambitos_africa.js,ambitos_resto.js node resuelve_dobles.js dobles_tabla.js --aplica --min 0.002 > "$TMP/dobles_a.txt" 2>&1
grep "sin decidir" "$TMP/dobles_a.txt" >> "$INF"; tail -2 "$TMP/dobles_a.txt" | head -1 >> "$INF"
log "fusiona"; node fusiona_solapes.js 2>&1 | tail -1 >> "$INF"
log "arregla"; node arregla_auto.js 2>&1 | tail -1 >> "$INF"
log "auto_int"; node auto_int.js 2>&1 | tail -1 >> "$INF"

# --- 3. el sustrato vuelve donde queda suelo vacio ---------------------------------
log "rellena_huecos"; INFORME="$TMP/huecos_pendientes.json" node --max-old-space-size=3800 rellena_huecos.js --aplica > "$TMP/rellena.txt" 2>&1
sed -n '/=== RELLENO/,/POR ENTIDAD/p' "$TMP/rellena.txt" | head -3 >> "$INF"

# --- 4. dobles otra vez, estructura ------------------------------------------------
log "radiografia b"; SALIDA="$TMP/radio_b.json" node radiografia.js > "$TMP/radio_b.txt" 2>/dev/null
log "dobles 2"; PARES="$TMP/radio_b.json" TABLAS=ambitos_siberia.js,ambitos_norteamerica.js,ambitos_africa.js,ambitos_resto.js node resuelve_dobles.js dobles_tabla.js --aplica --min 0.002 > "$TMP/dobles_b.txt" 2>&1
tail -2 "$TMP/dobles_b.txt" | head -1 >> "$INF"
log "estructura"; node estructura.js 2>&1 | tail -1 >> "$INF"

# --- 5. comprobaciones -------------------------------------------------------------
log "capitales"; node capitales.js > "$TMP/capitales.txt" 2>&1; CAP=$(grep -o "discrepancias [0-9]*" "$TMP/capitales.txt" | grep -o "[0-9]*$"); echo "capitales: discrepancias $CAP" >> "$INF"
log "plazas"; node plazas.js ./plazas_base.js > "$TMP/plazas.txt" 2>&1; PLZ=$(grep -o "discrepancias !! [0-9]*" "$TMP/plazas.txt" | grep -o "[0-9]*$"); echo "plazas: discrepancias $PLZ" >> "$INF"
log "radiografia final"; SALIDA="$TMP/radio_final.json" node radiografia.js > "$TMP/radio_final.txt" 2>/dev/null
sed -n '/POR ERA/,/PEORES ANIOS POR DOBLE/p' "$TMP/radio_final.txt" | head -15 >> "$INF"
node -e '
const r=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); const f=r.filas;
const eeMax=Math.max(...f.map(x=>x[5])); const eras=[[-10000,-3000],[-3000,-1000],[-1000,1],[1,500],[500,1000],[1000,1300],[1300,1500],[1500,1700],[1700,1800],[1800,1900],[1900,1950],[1950,2026]];
let ecMax=0; for(const [a,b] of eras){ const xs=f.filter(x=>x[0]>=a&&x[0]<b); if(!xs.length)continue; const m=xs.reduce((s,x)=>s+x[6],0)/xs.length; if(m>ecMax)ecMax=m }
console.log("dobleEE_max="+eeMax.toFixed(2)+" dobleEC_era_max="+ecMax.toFixed(2));
require("fs").writeFileSync(process.argv[2],JSON.stringify({eeMax,ecMax}))' "$TMP/radio_final.json" "$TMP/dobles_final.json" >> "$INF"
EE=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1])).eeMax>'"$DOBLE_EE_MAX"'?"MAL":"ok")' "$TMP/dobles_final.json")
EC=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1])).ecMax>'"$DOBLE_EC_MAX"'?"MAL":"ok")' "$TMP/dobles_final.json")
VAC=$(node -e 'const L=require("./lib.js");const {CIV}=L.load(process.env.JSX);let v=0;for(const c of CIV)for(const p of c.periods)if(!p.rings.length)v++;console.log(v)')
AUT=$(node auto_int.js 2>&1 | grep -o "con auto-interseccion [0-9]*" | grep -o "[0-9]*$"); AUT="${AUT:-0}"
echo "periodos vacios: $VAC   anillos con auto-interseccion: $AUT" >> "$INF"

# --- 6. modo revision, velo y lineas de sustrato ------------------------------------
log "revision"; node orden_revision.js > "$TMP/orden_revision.json" 2>/dev/null; cp "$TMP/orden_revision.json" "$AQUI/orden_revision.json"
if [ -n "$WAPP" ]; then
  ORDEN="$TMP/orden_revision.json" JSX="$WAPP" node revision_app.js --aplica 2>&1 | tail -1 >> "$INF"
  log "render"; node base_tierra.js >> "$INF" 2>&1; node render_base.js "$WAPP" --aplica 2>&1 | tail -1 >> "$INF"
else echo "(sin index.jsx: no se renuevan orden de revision ni velo)" >> "$INF"; fi

# --- 7. sintaxis y compuertas ---------------------------------------------------------
if [ -n "$WAPP" ]; then log "sintaxis"; S1=$(node chksintaxis.js "$WAPP" 2>&1 | tail -1); S2=$(node chkjsx.js "$WAPP" 2>&1 | tail -1); else S1="SINTAXIS OK (sin app)"; S2="JSX OK (sin app)"; fi; echo "$S1 / $S2" >> "$INF"
echo "" >> "$INF"; echo "COMPUERTAS" >> "$INF"
G=0
case "$S1" in *"SINTAXIS OK"*) echo "  G1a sintaxis webview: ok" >> "$INF";; *) echo "  G1a sintaxis webview: MAL ($S1)" >> "$INF"; G=1;; esac
case "$S2" in *"JSX OK"*) echo "  G1b jsx: ok" >> "$INF";; *"falta @babel"*) echo "  G1b jsx: no comprobado (falta @babel/parser: npm i @babel/parser en tools/)" >> "$INF";; *) echo "  G1b jsx: MAL ($S2)" >> "$INF"; G=1;; esac
[ "$EE" = "ok" ] && echo "  G2 doble estado-estado <= $DOBLE_EE_MAX g2 por anio: ok" >> "$INF" || { echo "  G2 doble estado-estado: MAL" >> "$INF"; G=1; }
[ "$EC" = "ok" ] && echo "  G3 doble con sustrato <= $DOBLE_EC_MAX g2 de media por era: ok" >> "$INF" || { echo "  G3 doble con sustrato: MAL" >> "$INF"; G=1; }
[ "${CAP:-999}" -le "$CAP_MAX" ] && echo "  G4 capitales (discrepancias $CAP <= $CAP_MAX): ok" >> "$INF" || { echo "  G4 capitales: MAL ($CAP discrepancias)" >> "$INF"; G=1; }
[ "${PLZ:-999}" -le "$PLAZAS_MAX" ] && echo "  G5 plazas (discrepancias $PLZ <= $PLAZAS_MAX): ok" >> "$INF" || { echo "  G5 plazas: MAL ($PLZ discrepancias)" >> "$INF"; G=1; }
[ "$VAC" = "0" ] && [ "$AUT" = "0" ] && echo "  G6 periodos vacios 0, auto-intersecciones 0: ok" >> "$INF" || { echo "  G6 estructura: MAL (vacios $VAC, auto-int $AUT)" >> "$INF"; G=1; }
if [ "$G" != "0" ]; then [ -n "$WAPP" ] && [ "$WAPP" != "$W" ] && rm -f "$WAPP"; falla "ver $INF"; fi
mv -f "$W" "$SALIDA"
log "LISTO -> $SALIDA ($(du -h "$SALIDA" | cut -f1))"
[ -n "$WAPP" ] && [ "$WAPP" != "$W" ] && log "app -> $WAPP (copiar a app/index.jsx junto con $SALIDA en data/mapa.json)"
echo "huecos sin regla (para la tabla): $TMP/huecos_pendientes.json" >> "$INF"
cat "$INF"
