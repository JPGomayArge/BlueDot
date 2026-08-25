# Instrumental del mapa de BlueDot

Scripts de geometría y validación del bloque `CIVILIZATIONS` de `app/index.jsx`.

Vive **dentro del repositorio** a propósito. La primera versión de este
instrumental existió sólo en un contenedor efímero y se perdió entera cuando el
contenedor se recicló, aunque el mapa estaba a salvo. No repitamos eso.

## Instalación

```bash
cd tools && npm install
```

Necesita `polygon-clipping`, `topojson-client` y `world-atlas`. Si el entorno
donde trabajas no tiene red, instala en uno que sí la tenga y copia
`node_modules`.

## Cómo se apunta al mapa

Todos los scripts leen y escriben `../app/index.jsx` por defecto. Para trabajar
sobre otra copia:

```bash
export JSX=/ruta/a/index.jsx
```

Trabaja siempre sobre una copia y valida antes de sustituir el original.

## Formato de los datos

Cada civilización es `{ id, kind?, name, color, wikiTitle?, periods:[...] }`.
`kind:'cultura'` marca las áreas culturales, que el usuario puede apagar por
separado en la interfaz.

Cada periodo es `{ start, end, rings, name?, wikiTitle? }`. Los anillos se
guardan una sola vez en el diccionario `__RG` al principio del archivo y cada
periodo los referencia por índice en base 36. Sin eso el archivo pasaría de
6 MB a más de 30.

## Dos reglas del motor que hay que tener siempre presentes

**Paridad.** El globo rellena cada anillo por separado y combina por paridad.
Dos anillos de la misma entidad que se pisan se **anulan** en la zona común y
dejan un agujero. Por eso `estructura.js` vigila los solapes internos y
`fusiona_solapes.js` los une.

**No hay agujeros.** Un polígono con hueco interior no se puede representar.
Hay dos técnicas: el **ojo de cerradura** (`geoutil.keyhole`, que conecta el
hueco al contorno con una ranura estrecha) y el **corte vertical**
(`recorte.parte`, que trocea el polígono). Preferimos el corte: las ranuras de
ancho cero del ojo de cerradura disparan el detector de auto-intersecciones, y
"repararlas" vuelve a rellenar el agujero y devuelve el doble pintado.

## Validación — pásala entera antes de cada entrega

| script | qué comprueba | resultado esperado |
|---|---|---|
| `estructura.js` | anillos malformados, periodos vacíos, solapes temporales dentro de una entidad, solapes internos entre anillos | todo a cero |
| `auto_int.js` | anillos que se cruzan a sí mismos, que producen cuñas blancas en el WebView | cero |
| `dobles_exacto.js` | doble pintado REAL, intersecando poligonos: la definicion, no una muestra | a la baja; ver BASELINE.md |
| `barrido.js '[-4000,2000,100]'` | sonda rapida por muestreo de celdas. Su "cero" NO es una prueba: solo dice que ninguno de sus ~6.100 puntos cayo en zona compartida | orientativo |
| `capitales.js` | que cada entidad pinte de verdad su propia capital | cero discrepancias |
| `audit.js` | contornos que no parecen geografía: cajas, óvalos, trazos gruesos | mínimo, revisando los nuevos |
| `intermitencias.js` | celdas que se apagan y vuelven a encenderse | a la baja |

Además, fuera de aquí: `npx esbuild app/index.jsx --loader:.jsx=jsx
--jsx=automatic --format=esm --outfile=/tmp/out.js` debe dar cero errores.

`capitales.js` es el que más errores de bulto ha destapado. Cuando falla no es
que la ciudad esté mal: es que un recorte mal dirigido le ha quitado a un
imperio su propia capital.

## Edición

| script | para qué |
|---|---|
| `crea.js defs.js` | crear civilizaciones nuevas |
| `sustituye.js ops.js` | reemplazar la geometría de un tramo de años |
| `anade.js ops.js` | añadir (`mas`) o quitar (`menos`) una región |
| `resta_civ.js pares.js` | resolver doble pintado: `[perdedor, ganador]` |
| `parte.js años.js` | partir periodos en años concretos |
| `funde.js` | fundir periodos consecutivos idénticos |
| `arregla_auto.js '["id"]'` | reparar auto-intersecciones |
| `fusiona_solapes.js` | unir anillos de una misma entidad que se pisan |

`anade.js` opera sobre el **periodo entero** que solape el rango, así que pasa
`parte.js` antes para alinear los cortes. Con `NOCARVE=1` no talla contra
rivales; sin él, la entidad procesada es siempre la que **pierde** el
territorio en disputa.

## Trampas conocidas

**La máscara de tierra tiene resolución 1:50 millones.** Ciudades reales caen
en agua: Estambul, Copenhague, Goa, Mahdia, Tromsø, Srirangapatna. Antes de
declarar un agujero, comprueba con `tierra.enTierra(pt)` que el punto es tierra
para el mapa base. Varias veces hemos perseguido huecos que no existían.

**`arregla_auto.js` lleva guarda de área.** Podar el vértice ofensor puede
amputar medio polígono; si la reparación pierde más del 3%, se descarta. Sin
esa guarda le arrancó el norte a Vijayanagara entre 1490 y 1509 sin avisar.

**Cuidado al rellenar oscuridad.** Un puente sólo debe ampliar la geometría de
periodos que ya existen, nunca crear periodos nuevos: si no, se alargan arcos y
resucitan culturas muertas siglos después de desaparecer. Ya pasó una vez, con
144 arcos estirados, algunos casi cinco mil años.

**Las cifras de `celdas.json` se regeneraron.** La rejilla anterior se perdió y
ésta se generó de nuevo con `celdas.js` (6.104 celdas, antes 6.713). Las
medidas de intermitencia posteriores a la regeneración no son comparables con
las anteriores. Los umbrales de `audit.js` también están recalibrados.

## Qué corre sin dependencias

`capitales.js`, `auto_int.js` y `estructura.js` funcionan con Node pelado, sin
`npm install`. `estructura.js` avisa y se salta el chequeo de solapes internos
si no encuentra `polygon-clipping`. Todo lo que edita geometría sí necesita las
dependencias, así que instálalas en un entorno con red.

## Estado de las herramientas

Las diecisiete se han ejecutado al menos una vez contra el mapa real y todas
funcionan. `geoutil.keyhole` se eliminó: era código muerto y además
implementaba la técnica descartada.

Lo que **no** está resuelto:

- En un entorno sin red no se puede hacer `npm install`, así que allí sólo
  corren `estructura.js`, `auto_int.js` y `capitales.js`. Todo lo que edita
  geometría necesita las dependencias.
- Estos archivos están en el repositorio pero **no versionados**. Hasta que no
  entren en git, un `git clean` se los lleva.

## No ejecutes git a través del puente de dispositivo

Un `git status` lanzado desde la sesión remota sobre la carpeta montada crea
`.git/index.lock` y **no puede borrarlo** después: el archivo queda con el
usuario de la sesión y el puente no tiene permiso de borrado. El resultado es
que el siguiente `git commit` que hagas tú falla con "Unable to create
index.lock: File exists", y hay que quitarlo a mano.

Ya pasó una vez. Los comandos de git se ejecutan desde tu terminal, no desde
aquí.
