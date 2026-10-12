# El canon de eventos de BlueDot

`data/events_extended.json` era un volcado de Wikidata (20.648 entradas, 20.233
con `wikidataId`) con una importancia calculada a máquina: 1.105 galaxias NGC
como "inventos", 424 campeonatos como "cultura", 4.277 nacimientos como
"personas", el 56 % posterior a 1800, el 55 % en Europa, y sin Apolo 11, sin
Hiroshima, sin la Revolución francesa ni la Peste negra. Este directorio lo
sustituye por dos capas:

- **El canon** (`canon_*.js`): eventos escritos y verificados uno a uno, con
  importancia por reglas, región y era explícitas, título en español e inglés y
  artículo de Wikipedia. Es lo que se ve sin acercarse. Meta: ~2.500.
- **El fondo** (`fondo.js`): lo que se salva del volcado de Wikidata, filtrado
  y rebajado a importancia 1-2: batallas, terremotos, tratados, fundaciones de
  estados, templos. Solo aparece al acercarse mucho. Nunca compite con el canon.

`construye_eventos.js` funde las dos capas y escribe `events_extended.json`
con el esquema que la app ya entiende; `verifica_eventos.js` no deja pasar
duplicados, coordenadas en el mar, categorías inválidas ni cuotas incumplidas.

## Las diez categorías

| id | nombre | qué entra |
|---|---|---|
| `politica` | Política y Estados | fundación, unificación, caída de estados; constituciones, tratados, independencias, revoluciones políticas, reformas |
| `guerras` | Guerras y conflictos | batallas, guerras, conquistas, asedios, genocidios |
| `ciencia` | Ciencia y tecnología | inventos, descubrimientos, teorías, medicina, exploración espacial |
| `exploracion` | Exploración y contacto | expediciones, viajes, primeros contactos, poblamientos, cartografía |
| `religion` | Religión y pensamiento | fundaciones y cismas, textos sagrados, filosofía, escuelas de pensamiento |
| `cultura` | Arte y cultura | obras, monumentos, literatura, música, deporte, medios |
| `economia` | Economía y comercio | moneda, rutas, mercados, crisis, industrias, plantaciones, esclavitud como sistema económico |
| `sociedad` | Sociedad y derechos | abolición, sufragio, movimientos sociales, leyes civiles, migraciones, educación |
| `desastres` | Desastres y pandemias | terremotos, erupciones, hambrunas, pandemias, inundaciones, clima |
| `personas` | Personas | figuras mayores, con nacimiento Y muerte (dos pines) |

Correspondencia con las viejas: `batallas → guerras`, `inventos → ciencia`.

## Importancia (reglas, no impresiones)

- **5** — cambió el curso de la historia de más de una civilización, o lo
  reconoce cualquier lector de cualquier continente. Unos 250 en todo el arco.
- **4** — decisivo para una civilización o región entera (una dinastía, una
  independencia, una epidemia continental). Unos 600.
- **3** — significativo a escala de un país o de un campo del saber. Unos 1.400.
- **2** — notable a escala local; lo mejor del fondo.
- **1** — fondo: aparece solo con la ventana de tiempo más estrecha.

Una entrada no sube de 3 por ser europea o reciente ni baja por ser africana o
antigua: la prueba es "¿qué cambió y para cuántos?".

## Regiones (campo `reg`, obligatorio)

`europa` · `mena` (Oriente Medio y norte de África) · `africa` (subsahariana) ·
`asia_oriental` (China, Corea, Japón) · `asia_sur` (India, sudeste asiático,
Indonesia) · `asia_central` (estepa, Siberia, Irán oriental, Tíbet) ·
`norteamerica` (al norte del Río Grande) · `latam` (Mesoamérica, Caribe,
Sudamérica) · `oceania`.

## Eras (se derivan del año)

`-10000..-3000` · `-3000..-1000` · `-1000..500` · `500..1000` · `1000..1500` ·
`1500..1700` · `1700..1800` · `1800..1900` · `1900..1950` · `1950..2025`.

## Cuotas del canon (importancia 3 o más)

Por región, sobre el total: europa ≤ 25 %, latam ≥ 14 %, africa ≥ 9 %, mena ≥
11 %, asia_oriental ≥ 11 %, asia_sur ≥ 9 %, asia_central ≥ 4 %, norteamerica
≤ 9 %, oceania ≥ 2 %. Por era: antes de 1500 ≥ 45 %, 1800..2025 ≤ 40 %,
1950..2025 ≤ 15 %. Y cada celda era × región con población humana tiene al
menos 6 eventos (Oceanía y las Américas antes del -3000, al menos 2).
`verifica_eventos.js` imprime la matriz y marca lo que falta.

## Esquema de una entrada del canon

```js
{ id:'apolo_11_1969', cat:'ciencia', imp:5, y:1969, lat:28.61, lon:-80.6, reg:'norteamerica',
  es:'Apolo 11: los primeros humanos en la Luna', en:'Apollo 11: first humans on the Moon',
  wiki:'Apolo 11', wiki_en:'Apollo 11' }
```
`lat`/`lon`: el lugar donde ocurrió (Cabo Cañaveral para Apolo 11, no la Luna).
Un suceso difuso (una pandemia, un invento sin lugar único) va donde empezó o
donde está mejor documentado. `wiki` es el título exacto en es.wikipedia;
`wiki_en` el de en.wikipedia (la app usa ambos y, si fallan, busca por texto).
`nota` opcional: una línea de contexto para la ficha. `mar:true` cuando el suceso
ocurre en el mar o en un islote que la máscara de tierra no ve (Midway, Krakatoa).

## Esquema de una persona (dos pines: nacimiento y muerte)

```js
{ id:'isaac_newton', cat:'personas', imp:5, reg:'europa',
  es:'Isaac Newton', en:'Isaac Newton', wiki:'Isaac Newton', wiki_en:'Isaac Newton',
  por:'Leyes del movimiento y gravitación universal; cálculo',
  nac:{ y:1643, lat:52.81, lon:-0.63, lugar:'Woolsthorpe, Inglaterra' },
  def:{ y:1727, lat:51.5, lon:-0.13, lugar:'Londres' } }
```
`construye_eventos.js` genera dos eventos (`isaac_newton_nac`, `isaac_newton_def`)
con `persona`, `momento` y el enlace al otro pin; la ficha muestra ambos.
Si la muerte no se conoce, se omite `def` y solo hay un pin. Una persona
entra por lo que hizo (`por`), no por ser famosa: la misma regla de importancia.

## Procedencia (quién lo dice, desde cuándo, quién lo revisó)

Cada entrada lleva `fuente`, `alta`, `autor` y `revisado`. Lo que la entrada no
diga lo pone el `META` de su archivo: `fuente:'wikipedia'` significa "el
artículo de `wiki`", y entonces la fuente de la entrada es `wikipedia:<título>`;
una fuente propia se escribe en la entrada (`fuente:'libro: Restall, Los siete
mitos de la conquista española, 2003'`). `alta` es la fecha en que entró;
`autor`, quién la redactó (`claude`, o un usuario de GitHub); `revisado` es
`null` hasta que una persona la revisa, y entonces `{ por:'usuario', fecha:'AAAA-MM-DD' }`.
El mapa no finge revisiones: una entrada sin revisar se muestra como tal.
`construye_eventos.js` escribe además `eventos_version.json` (cuántos eventos,
de qué fecha) para que la app lo enseñe y cualquiera pueda citar la versión.

## El fondo (lo que se salva del volcado)

Se conservan, con importancia 1-2: `batallas` (→ `guerras`), `desastres`,
`politica` (estados, tratados), y los templos de `religion` (→ `cultura`, 1).
Se tiran: `personas` (sustituidas por el canon), `inventos` (galaxias NGC),
`cultura` (campeonatos), `exploracion` (fundaciones de pueblos), y todo lo que
duplique una entrada del canon (mismo año y título parecido). Un evento del
fondo nunca sube de 2.

## Reglas de redacción

Título en español, corto, que diga qué pasó ("Apolo 11: los primeros humanos en
la Luna", no "Apolo 11"). Sin juicio de valor en el título. Nombres de lugar en
la forma española habitual. Años antes de Cristo en negativo; un suceso que
dura varios años se ancla en el año en que empieza (la Peste negra en 1347) y
se dice en la nota. Nada de "Anexo:", nada de listas.
