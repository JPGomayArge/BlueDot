# Contribuir a BlueDot

Gracias por querer mejorar el mapa. Tres reglas lo resumen todo:

1. **Todo dato lleva fuente.** Un año, una coordenada, una frontera, un nombre:
   si no dice de dónde sale, no entra. Wikipedia vale como punto de partida;
   un libro con página o un artículo académico valen más.
2. **Se cambian las tablas, no los resultados.** `data/mapa.json` y
   `data/events_extended.json` se construyen con las herramientas de `tools/`
   y `data/canon/`. Un cambio hecho a mano sobre ellos se pierde en la
   siguiente construcción y no se puede revisar.
3. **Se mide, no se presume.** Las verificaciones corren solas en cada pull
   request. Si fallan, el cambio no se mezcla hasta que pasen.

## Proponer una corrección (sin tocar código)

Abre un issue con el formulario "Proponer una corrección". Desde la app, el
botón de cada ficha lo abre ya rellenado con el identificador y el contexto.
Di qué está mal, qué debería decir y en qué fuente te apoyas. Alguien del
proyecto lo convierte en un cambio en las tablas y te lo atribuye.

## Hacer el cambio tú mismo (pull request)

### Eventos y personas

Están en `data/canon/canon_*.js`, un archivo por era. El esquema y los
criterios están en `data/canon/CANON.md`. Para añadir o corregir:

```
cd data/canon
# edita canon_05_contemporanea.js (por ejemplo)
node verifica_eventos.js              # esquema, duplicados, mar, cuotas
node construye_eventos.js ../fondo_wikidata.json ../events_extended.json
node empaqueta.js                     # eventos_base.json (va en la app) y paquetes/ por era
node verifica_wiki.js                 # (con red) que los títulos de Wikipedia existan
```

La app lleva dentro `data/eventos_base.json` (el canon y el fondo de
importancia 2). El fondo detallado va en paquetes por era que la acción
`publica datos` sube como release cuando el cambio entra en `main`; la app los
descarga a elección de quien la usa. No se suben a mano.

Cada entrada nueva lleva `fuente`, y pon tu usuario en `autor`. No marques
`revisado` tú mismo: lo marca quien revisa el pull request.

### Fronteras de estados y pueblos

No se dibujan: se describen. Un área cultural se define por bioma, región
física, río o vecino en `tools/ambitos_*.js`; quién cede cuando dos pintan lo
mismo, en `tools/dobles_tabla.js`; dónde no vivió nadie, en `tools/vacios.js`
(con la razón escrita); ciudades testigo de quién debe pintarlas en qué año,
en `tools/plazas_base.js` y `tools/capitales.js`. `tools/README.md` explica
cada tabla. Después:

```
tools/construye.sh data/mapa.json data/mapa.nuevo.json app/index.jsx
```

tarda entre una y dos horas y solo escribe si pasa las compuertas (dobles,
capitales, plazas, estructura, sintaxis). El informe queda al lado.

### Qué se acepta y qué no

- Se acepta lo que viene con fuente y pasa las verificaciones.
- No se aceptan contornos dibujados a mano ni ediciones directas del JSON.
- La importancia sigue las reglas de `CANON.md`, no el gusto: un 5 cambia la
  historia de más de una civilización.
- El mapa pinta lo que un estado **controlaba**, no lo que reclamaba; un área
  cultural pinta donde **vivía** una población.
- Las cuotas por era y región existen para corregir el sesgo contemporáneo y
  occidental de las fuentes. Un pull request que las empeore se discute antes.

## Licencias

Al contribuir aceptas que tu aportación a los datos se publique bajo
CC BY-SA 4.0 y la de código bajo MIT, con tu nombre en el historial.
