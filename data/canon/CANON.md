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

Cuando la región declarada no coincide con la que dan las coordenadas (un
tratado sobre Oriente Medio firmado en Washington, un suceso otomano en la
orilla europea de Estambul), la entrada lo dice en `nota`: el verificador lo
avisa pero no lo impide, y la ficha explica el criterio.

Tandas: la primera (`canon_01`..`canon_06`, 1.067 entradas, octubre de 2026)
cubre el arco entero pero quedó corta fuera de Europa y antes del 1500; la
segunda (`canon_07`..`canon_09`, 613 entradas, noviembre de 2026) rellena las
celdas vacías (África, Asia central y del sur antes del -3000, América y
Oceanía antes del 500, el siglo XVIII fuera de Europa) y añade las personas de
los siglos XVIII a XX, que la primera no incluía; la tercera (`canon_10`..
`canon_12`, 895 entradas, noviembre de 2026) va por temas, no por regiones:
ciencia y técnica de todos los continentes, comercio y moneda, exploraciones
anteriores a 1500, desastres y pandemias (la categoría más corta: pasa de 46 a
129), sociedad, religión, arte, y 214 personas más, con las mujeres y los
europeos y norteamericanos de los siglos XIX y XX que faltaban (Napoleón,
Lincoln, Darwin, Marx, Curie, Einstein…). Con las tres, 2.575 entradas y todas
las cuotas se cumplen con algo de margen (Europa 24 %, antes de 1500 46 %).
Después van `canon_13_vitales.js` (lo que la lista de control echó en falta) y
los sucesos paraguas con `fin` (las guerras mundiales, la Guerra Fría, las
cruzadas…), que se ven durante todo su tramo. La cuarta tanda
(`canon_14_mujeres.js`, 126 entradas) es solo de mujeres: en las tres primeras
había unas 70 entre 433 personas y el fondo hereda el mismo desequilibrio de
Wikidata. Ninguna entra por cuota: cada una gobernó, escribió, descubrió o
encabezó algo que su región recuerda; 36 son anteriores a 1500 y una de cada
cinco es europea. Cuando el lugar de nacimiento no se conoce, el pin va donde
actuó y la nota lo dice. Con las cuatro, 2.810 entradas (559 personas).

## La lista de control (`vitales.js`)

Una lista de más de mil sucesos y personas que nadie de su región puede echar
en falta, con año y una expresión que debe aparecer en el título. Comprueba el
archivo construido y dice si cada uno está en el canon, solo en el fondo (se
vería tarde) o falta. Corre en cada push. Es una red contra los olvidos que ya
nos pasaron, no una definición de "la historia": si algo no debería faltar y
no está en la lista, se añade a la lista, una línea por hecho. Unas treinta entradas de la tanda 2 (Kintampo, Urewe, Gedi, el
pacto de Poona, la Declaración de Arusha…) no tienen artículo en la Wikipedia en
español: `verifica_wiki.js` las lista y la ficha pasa al artículo en inglés.
Ninguna entrada está revisada por una persona todavía
(`revisado:null`); la app lo muestra así.

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
`fin` opcional: el año en que termina un suceso con duración (una guerra, una
pandemia); el pin se ve todos los años del tramo y la ficha dice "1618 – 1648".
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

Hay dos extractores de Wikidata: `fondo_wikidata.js` trae sucesos (batallas,
tratados, terremotos, expediciones…) por clases de suceso, y
`fondo_wikidata_entidades.js` trae lo que se funda, se construye, se publica o
se descubre (universidades, bancos, catedrales, ciudades, Estados, obras,
puentes, elementos químicos) y lo convierte en suceso ("Universidad de
Salamanca: fundación"). Cada raíz exige un mínimo de Wikipedias enlazadas para
no traer ruido. `fondo_wikidata_personas.js` trae personas con lugar de
nacimiento (y de muerte si lo hay), dos pines enlazados. Los cuatro volcados se
funden en `construye_eventos.js`; el orden de la lista importa: un volcado
posterior sustituye al anterior cuando traen la misma entidad, así que el viejo
(`fondo_wikidata.json`, sin sitelinks) va primero.

### Contra el sesgo del fondo (paso 2, noviembre de 2026)

Wikidata tiene mucho más escrito de Europa y de los últimos dos siglos, y los
extractores lo heredan. Lo que se hace al respecto, todo en `fondo.js` salvo
lo marcado:

- **Listones por región.** De Europa y Norteamérica un suceso posterior a 1500
  necesita 5 Wikipedias, posterior a 1950, 10, y anterior a 1500, 3 (cada
  escaramuza feudal tiene artículo; con ese listón la Edad Media bajó de 63 % a
  43 % europea). Una entidad europea necesita 35 (un invento, 20). Una persona
  europea necesita 60 Wikipedias (100 si nació desde 1900); del resto del mundo,
  12 (40 desde 1900). Al resto del mundo no se le pide nada más.
- **Fechas por siglo** (extractores): antes de 1500 valen fechas con precisión
  de siglo o década, que es como está datada la Edad Media fuera de Europa; van
  con `fechaAprox` y la app las enseña con "c.".
- **Raíces que cargan fuera de Europa** (entidades): reinos, imperios,
  dinastías, yacimientos arqueológicos, estupas, mezquitas y templos con
  mínimos bajos.
- **Inventos y descubrimientos** (entidades, raíz `*P575`): todo lo que tiene
  "fecha de descubrimiento o invención". Esa propiedad la llevan también
  cúmulos estelares, atolones "descubiertos", tumbas y aperturas de ajedrez, así
  que una pasada clasifica por clase: astronomía, ajedrez y meteoritos quedan
  fuera; los lugares pasan a `exploracion` como "primer registro documentado"
  (quien vivía allí ya lo conocía) y solo con 15 Wikipedias; obras, tumbas y
  hallazgos pasan a `cultura` como "descubrimiento". Un invento sin
  coordenadas se ubica por el lugar del descubrimiento o por donde trabajó o
  nació su autor (`aprox`).
- **Terremotos:** desde 1800 necesitan 8 Wikipedias (de 1.625 quedaron 340).

## Reglas de redacción

Título en español, corto, que diga qué pasó ("Apolo 11: los primeros humanos en
la Luna", no "Apolo 11"). Sin juicio de valor en el título. Nombres de lugar en
la forma española habitual. Años antes de Cristo en negativo; un suceso que
dura varios años se ancla en el año en que empieza (la Peste negra en 1347),
lleva `fin` si se sabe cuándo acaba, y se dice en la nota. Nada de "Anexo:", nada de listas.
