# tools/ — cómo se construye y se comprueba el mapa de BlueDot

Todo el dato del mapa vive en `data/mapa.json` (`{ version, rings, civilizations }`:
835 estados + 365 áreas culturales, `kind:'cultura'`, con `periods:[{start,end,rings}]`;
los anillos van en un diccionario y cada periodo los referencia por índice). La app
lo importa (`import MAPA from '../data/mapa.json'`) y no lleva dato dentro. Estas
herramientas lo leen y lo reescriben a través de `lib.js`, que también entiende
la forma vieja (el dato dentro de `index.jsx`); `separa_mapa.js` convierte de una
a otra. Ninguna necesita más que Node 18+ y los
módulos de `tools/node_modules` (`polygon-clipping`, `topojson-client`,
`world-atlas`; para `chkjsx.js`, `@babel/parser`: `cd tools && npm i @babel/parser`).

## El único comando que hace falta

    tools/construye.sh data/mapa.json data/mapa.nuevo.json app/index.jsx

Reconstruye el mapa desde la base, pasa todas las herramientas en orden y
**solo escribe la salida si pasa las compuertas** (sintaxis, dobles, capitales,
plazas, estructura). Si una falla, deja `app/index.nuevo.jsx.fallido.jsx` y el
informe en `app/index.nuevo.jsx.informe.txt`. Tarda entre una y dos horas; los
intermedios quedan en `app/_construye/`. Con `SALTAR_AMBITOS=1` no rehace los
sustratos por tablas (unos 40 minutos menos) cuando la base ya los trae.

Lo que decide la forma del mapa está en **tablas**, no en código:

| tabla | qué decide |
|---|---|
| `ambitos_siberia.js`, `ambitos_norteamerica.js`, `ambitos_africa.js`, `ambitos_resto.js` | la forma de cada área cultural: bioma de Köppen (`clima.js`), región física de Natural Earth (`fisico.js`), lado de un río, caja de trabajo; el orden de la tabla decide quién cede |
| `ambitos_parches.js`, `ambitos_parches2.js` | filas sueltas aplicadas después de las tablas |
| `dobles_tabla.js` | cuando dos entidades pintan lo mismo, quién cede `{cede, a, desde?, hasta?}`; sin entrada, el sustrato cede al estado y entre sustratos cede el que va después en las tablas |
| `vacios.js` | dónde no vivió nadie (hielo, erg, islas antes de su poblamiento), con la fuente de cada entrada |
| `plazas_base.js`, `capitales.js` | testigos: ciudad, año, quién debe pintarla |
| `tramos_radio.js` | copias de anillos de un periodo a otro tramo (arreglos puntuales) |

Para cambiar el mapa: se edita la tabla, se vuelve a construir. No se tocan
anillos a mano.

## Qué hace cada paso de `construye.sh`

1. `remodela_fisico.js <tabla>` — rehace las áreas culturales de la tabla a partir de bioma/región/río, restando estados y vecinos ya rehechos (`IGNORA=2`: no resta a los que vienen después en la tabla).
2. `astillas.js` — quita esquirlas (largas, estrechas, diminutas).
3. `radiografia.js` → `resuelve_dobles.js` — localiza y resuelve los solapes con la regla del sustrato y `dobles_tabla.js`.
4. `fusiona_solapes.js`, `arregla_auto.js`, `auto_int.js` — anillos que se cruzan a sí mismos.
5. `rellena_huecos.js` — **el sustrato vuelve donde queda suelo vacío**: si una celda sin dueño la cubrió antes un área cultural viva, se prolonga en el espacio; si la cubrió una que acabó hace menos de 60 años, se prolonga en el tiempo (marcada `inc:1`). Lo que ningún área cultural cubrió nunca queda en `_construye/huecos_pendientes.json`: es una decisión humana (falta una entidad) y va a las tablas.
6. `resuelve_dobles.js` otra vez, `estructura.js`.
7. `capitales.js`, `plazas.js`, `radiografia.js` — comprobaciones.
8. `orden_revision.js` + `revision_app.js` — el modo revisión de la app (orden de entidades a mirar, por tamaño y duración).
9. `base_tierra.js` + `render_base.js` — el renderizador: velo neutro bajo la tierra sin entidad, áreas culturales sin línea nítida.
10. `chksintaxis.js`, `chkjsx.js` — sintaxis del WebView y del JSX.

## Mirar

- `JSX=data/mapa.json node radiografia.js` — el mapa año por año: huecos, dobles, parpadeos, saltos, formas (cajas, púas, motas). `--ano 1648` para una foto. Las rectas que coinciden con una frontera actual (`paises_ne.js`) no cuentan como caja.
- `JSX=data/mapa.json node pinta.js 1700 -125,-30,-56,45 salida.png` — un render de una ventana en un año (`SOLO=id,id` para aislar).
- `JSX=data/mapa.json node rellena_huecos.js` (sin `--aplica`) — informe de qué rellenaría y qué huecos no tienen regla.
- En la app: Ajustes → Revisión del mapa recorre las entidades en el orden de `orden_revision.json`; las notas se exportan como JSON y se convierten en filas de tabla.

## Convenciones

- Anillos en grados, redondeados a centésimas; el renderizador rellena por paridad y no dibuja las aristas rectas que tienen el mismo territorio a los dos lados (`recorte.parte` abre los agujeros con ranuras).
- Un estado pinta lo que **controla**, no lo que reclama. Un área cultural pinta donde **vivía** una población; cede siempre al estado.
- El mapa admite lo que no sabe: `inc:1` en un periodo = contorno inferido (relleno apagado); el velo de `base_tierra.js` = tierra sin entidad registrada; negro = vacío declarado en `vacios.js`.
- Nunca dos herramientas pesadas a la vez (memoria). `rellena_huecos.js` va con `--max-old-space-size=3800`.
