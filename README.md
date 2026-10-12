# BlueDot

Un globo de la historia: qué pasaba en el mundo en cualquier año, en cualquier
lugar, desde el -10000 hasta hoy. Estados y pueblos con sus fronteras año a
año, eventos, personas, rutas, guerras, migraciones, religiones e idiomas.
Gratis, sin publicidad y sin cuentas.

BlueDot quiere ser una herramienta de consulta libre, como una enciclopedia
abierta: **cada dato dice de dónde sale, cuándo entró y quién lo revisó, y
cualquiera puede proponer una corrección.** Las propuestas quedan en público,
se verifican automáticamente y se revisan antes de entrar en el mapa.

## Cómo está hecho

- `app/index.jsx` — la aplicación (React Native + Expo) y, dentro, el dato del
  mapa: 1.200 entidades (estados y áreas culturales) con sus periodos y
  contornos. Se construye, no se edita a mano.
- `data/events_extended.json` — los eventos que ve la app. Se construye a
  partir de dos capas: el **canon** (`data/canon/canon_*.js`, escrito y
  verificado entrada por entrada) y el **fondo** (`data/fondo_wikidata.json`,
  un volcado de Wikidata filtrado por `data/canon/fondo.js`).
- `data/canon/CANON.md` — los criterios: categorías, reglas de importancia,
  cuotas por era y región, esquema, procedencia.
- `tools/` — las herramientas que construyen y verifican el mapa; `tools/README.md`
  explica el flujo. `tools/construye.sh` reconstruye `app/index.jsx` desde la
  base con compuertas de calidad: si algo falla, no sale.

## Cómo contribuir

Lee `CONTRIBUTING.md`. En corto: una corrección se propone con el formulario
de issue (desde la app, el botón "Proponer una corrección" lo abre ya
rellenado); un cambio en los datos se hace como pull request sobre las tablas,
nunca sobre el JSON ni sobre los contornos, y la verificación automática lo
comprueba antes de que se revise.

## Fuentes y licencias

- Datos propios de BlueDot (canon de eventos, tablas de civilizaciones, vacíos,
  testigos): **CC BY-SA 4.0** (`LICENSE-DATOS.md`).
- Código: **MIT** (`LICENSE`).
- Wikipedia (CC BY-SA) y Wikidata (CC0) para resúmenes, enlaces y el fondo de
  eventos. Fronteras de partida: "historical-basemaps" de Anton Ourednik.
  Tierra firme y regiones físicas: Natural Earth (dominio público). Clima:
  Köppen-Geiger (Beck et al.). Imágenes del globo: NASA Blue Marble, NOAA.
- Los textos contextuales generados con un modelo de lenguaje se marcan como
  orientativos y no sustituyen a la fuente.

## Versión de los datos

La app muestra en "Acerca de" la fecha y el tamaño de los datos que lleva
(`data/eventos_version.json`). Cita esa versión si usas los datos.
