# Línea base de medición — 25 de agosto de 2026

Este archivo existe porque **los instrumentos cambiaron** y hay que dejar
escrito dónde está la discontinuidad.

## Qué pasó

El instrumental original vivía sólo en un contenedor efímero y se perdió. Al
reconstruirlo, tres instrumentos quedaron con la definición cambiada:

- **`celdas.json`**: 6.104 celdas, antes 6.713. Los recuadros de región se
  redefinieron de cero.
- **`audit.js`**: fórmulas deducidas leyendo la salida de la versión anterior.
  Marca 48 contornos donde la vieja marcaba 14.
- **`capitales.js`**: 286 ciudades, red completamente nueva; la anterior tenía
  213 y se perdió.

**Ninguna cifra anterior al 25 de agosto de 2026 es comparable con las de aquí
en adelante.**

## El hallazgo que lo motivó todo

`barrido.js` no mide el doble pintado: lo **muestrea**. Dice "cero" cuando
ninguno de sus ~6.100 puntos cae en zona compartida, no cuando no existe zona
compartida. Cambiar la rejilla cambia el veredicto.

Con la rejilla nueva aparecieron de golpe 21 pares que la vieja pisaba por
casualidad. Eso llevó a escribir `dobles_exacto.js`, que interseca los
polígonos y mide el área real. Resultado en el mismo archivo que el barrido
declaraba limpio:

| instrumento | veredicto |
|---|---|
| `barrido.js` con rejilla | 4 pares, 5 celda-año |
| `dobles_exacto.js` | **1.541 pares, 15.338 grado²-año** |

Se resolvieron 216 pares, que concentraban el 98% del daño. La mayoría venían
de arcos corregidos con buenas fuentes días antes: al alargar la vida de una
entidad no se comprobó con quién chocaba en los años añadidos, porque el
barrido decía que no chocaba con nadie.

## Regla que queda establecida

`dobles_exacto.js` es el instrumento oficial de doble pintado. Es determinista
y no depende de ninguna rejilla, así que su definición no puede volver a
cambiar. `barrido.js` se queda sólo como sonda rápida, y su "cero" **no es una
prueba**.

## Cifras de hoy

| medida | valor |
|---|---|
| civilizaciones | 884 (586 políticas + 298 culturales) |
| periodos | 6.167, ninguno sin nombre |
| anillos | 46.440 |
| anillos malformados / vacíos / desordenados | 0 / 0 / 0 |
| solapes temporales dentro de una entidad | 0 |
| solapes internos entre anillos | 0 |
| auto-intersecciones | 0 de 13.242 anillos únicos |
| **doble pintado exacto** | **1.485 pares, 217,8 grado²-año** |
| red de capitales | 286 ciudades, 0 discrepancias |
| auditoría de figuras | 48 contornos (28 trazo grueso, 17 óvalo, 3 caja) |
| intermitencia | 2.042 tramos, 6.985 celda-siglo |
| esbuild | 0 errores |

De los 1.485 pares que quedan, 1.347 están por debajo de 1 grado²-año: son
astillas de décimas de grado repartidas por milenios. Los tres mayores son
casos donde una entidad queda **contenida entera** dentro de otra, que
`resta_civ.js` ya no arregla en silencio sino que avisa, porque no es un
problema de geometría sino de modelo.

## Cómo mantener esto honesto

Cuando cambies un arco, vuelve a pasar `dobles_exacto.js`: alargar la vida de
una entidad casi siempre la mete encima de su sucesor.

Cuando toques un umbral o la rejilla, añade una entrada nueva a este archivo en
vez de reescribir la anterior. Una medida que se ajusta hasta aprobar deja de
ser una medida: el punto de Constantinopla en la red vieja estaba desplazado a
donde había pintura en lugar de estar en la ciudad real, y así el test pasaba
sin probar nada.


---

# Ronda 3 de verificación — 25 de agosto de 2026

El registro de qué estaba verificado se perdió con el contenedor, así que en
vez de reconstruirlo de memoria se priorizó por **señales medibles de
abandono**: entidades con cuatro o más periodos que comparten el mismo nombre
de fase, geometría congelada, sin `wikiTitle`, o con huecos temporales
internos. Es mejor criterio que la lista perdida, porque no depende de recordar
nada.

Salieron 116 entidades con alguna señal, y **56 con todos sus periodos con el
mismo rótulo**: el Imperio mongol con 18 periodos, los Tang con 19, los Han con
17, y con ellos Song, Liao, Jin, Göktürk, Rouran, Kushan y Kara-Kitán. Nadie
había escrito su historia en el mapa.

Verificadas las 90 de más peso. **43 tenían el arco mal.**

| medida | antes | después |
|---|---|---|
| periodos renombrados | — | **974** en 90 entidades |
| entidades mudas (todos sus periodos igual) | 56 | **19** |
| arcos corregidos con fuente | — | 12 aplicados, 3 revertidos por insostenibles |
| doble pintado exacto | 217,8 | **218,0** grado²-año |

Las extensiones de arco dispararon el solape a 11.013 grado²-año, y esta vez se
vio **en el acto** con `dobles_exacto.js` en vez de a la semana siguiente. Tres
resultaron insostenibles y se revirtieron con su razón anotada: los yaudheya
existían hacia el 400 a.C. pero como sangha dentro del mundo védico y maurya,
no como poder territorial; los Nayak eran gobernadores de Vijayanagara hasta
Talikota; y Buganda siguió siendo reino bajo el protectorado, pero el mapa
pinta el protectorado.

Que la fuente tenga razón sobre la existencia de un grupo no significa que la
tenga sobre quién gobernaba ese territorio esos años. Es la lección de la ronda.

## Estado tras la ronda

884 civilizaciones · 6.163 periodos, ninguno sin nombre · estructura 0/0/0/0/0 ·
auto-intersecciones 0 de 13.250 · capitales 286/286 · esbuild 0 errores ·
doble pintado exacto 218,0 grado²-año.

`verificadas.json` registra qué se revisó y cuándo. Añade una entrada por ronda
en vez de reescribir la anterior.


---

# Los cuatro kanatos mongoles — 25 de agosto de 2026

El hallazgo más gordo de la ronda 3. El mapa pintaba **una sola entidad mongola
de 1206 a 1368**, cuando el imperio unitario termina con la guerra civil
toluida de 1260-1264. Durante más de un siglo el mayor imperio terrestre de la
historia figuraba como una mancha uniforme en un periodo en el que sus partes
se hacían la guerra entre sí. No existían ni el Ilkanato, ni el Chagatai, ni el
Yuan, y la Horda de Oro sólo aparecía a partir de 1368.

| entidad | arco | estado antes |
|---|---|---|
| Imperio mongol | 1206–**1260** | llegaba a 1368 |
| **Ilkanato** | 1256–1370 | no existía |
| **Kanato de Chagatai** | 1260–1370 | no existía |
| **Dinastía Yuan** | 1260–1368 | no existía |
| Horda de Oro | **1260**–1552 | empezaba en 1368 |

Los treinta años entre el fin del ilkanato (1335) y Timur, y los veintitrés
entre la ruptura chagatai (1347) y Timur, se cierran con fases nombradas para
los estados sucesores: yalayiríes, chobaníes y muzafaríes en Persia; los amires
de Transoxiana en el este.

Crear los cuatro disparó el solape a **9.325 grado²-año**. Resueltos 16 pares:
los Song conservan el sur hasta Yamen, los mamelucos frenan al ilkanato en Ain
Yalut, Bagdad no cae hasta 1258, Moghulistán es el chagatai oriental desde
1347, y las colonias genovesas de Crimea no son de la Horda.

## Estado

887 civilizaciones · 6.186 periodos, ninguno sin nombre · estructura 0/0/0/0/0 ·
auto-intersecciones 0 de 13.236 · capitales **294/294** · esbuild 0 errores ·
doble pintado exacto **223,3 grado²-año**.


---

# Entidades fusionadas — 26 de agosto de 2026

Seis identificadores metían dos o más estados distintos bajo una misma ficha.
Se reparten con `divide.js`, que **mueve los periodos con su geometría intacta**:
no redibuja nada, así que no puede aparecer un hueco ni un solape nuevo.

| antes | después |
|---|---|
| `joseon` "Corea" 676–2025 | **`silla`** 676–918 · **`goryeo`** 918–1392 · `joseon` 1392–1910 · **`south_korea`** 1948–2025 |
| `greece` "Grecia" −800–2025, wikiTitle "Antigua Grecia" | **`grecia_antigua`** −800–−146 · `greece` 1830–2025 |
| `rwanda_kingdom` "Reinos de Ruanda y Burundi" | `rwanda_kingdom` "Reino de Ruanda", recortado a Ruanda |
| `ankole` "Ankole y Karagwe" | `ankole` "Reino de Ankole", ya sin comerse Kigali |

Corea llevaba 1.349 años con una sola ficha: Silla Unificada, Goryeo, Joseon,
el Imperio Coreano y la República de Corea con la misma entrada y la misma
capital implícita. Ahora Gyeongju, Kaesong y Seúl pintan cada una lo suyo.

## Dos huecos históricos que aparecieron al mirar

**El Estado mahdista no existía.** Egipto conservaba todo Sudán entre 1885 y
1898, es decir durante los catorce años en que no lo gobernaba: el Mahdi tomó
Jartum en enero de 1885 y el califa Abdallahi gobernó desde Omdurmán hasta
septiembre de 1898. Creado `mahdiyya` con sus dos fases.

**Darfur se contradecía a sí mismo.** Tenía una fase 1880–1898 rotulada
"Ocupación mahdista: el sultanato deja de existir como Estado" mientras el mapa
lo seguía pintando de Darfur. Ese tramo pasa al Estado mahdista, y la
restauración de Ali Dinar se prolonga de 1899 hasta la conquista británica de
1916, que faltaba entera.

## Lo que se dejó a propósito

Noruega (1380) y Austria (1526) empiezan y terminan donde el mapa ya los tenía.
Los verificadores proponían 1397 y 1453, pero el mapa sigue la convención de
pintar la potencia que gobierna durante las uniones personales — Dinamarca en
Kalmar, el Sacro Imperio antes de 1526 — y cambiarlo crearía dobles sin ganar
fidelidad. Se corrigió el `wikiTitle` de Austria, que decía "Archiducado de
Austria" para una entidad llamada "Austria / Habsburgo".

## Estado

892 civilizaciones · 6.193 periodos, ninguno sin nombre · estructura 0/0/0/0/0 ·
auto-intersecciones 0 de 13.241 · capitales **302/302** · esbuild 0 errores ·
doble pintado exacto **~240 grado²-año**.


---

# Ronda 4: los imperios grandes — 26 de agosto de 2026

El indicador de "entidades mudas" quedó agotado en la ronda 3: no quedaba
ninguna. La cuarta ronda ataca las 90 de mayor peso visual — Imperio británico,
Francia, España, Portugal, otomanos, Qing, URSS, Roma, Estados Unidos,
Bizancio — que ya habían recibido trabajo y donde había que buscar el error que
sobrevivió a las revisiones anteriores.

**152 anacronismos de extensión.** El patrón dominante es el mismo que delató a
los Pratihara: **la caja crece justo en la fase cuyo rótulo habla de derrota**.

Aplicados 14 recortes documentados con `recorta_caja.js`, la herramienta nueva
para esta clase de error:

| entidad | qué tenía de más |
|---|---|
| España 1479–1541 | territorio al sur de Cuzco antes de que Valdivia fundara Santiago |
| Gupta 489–550 | las cajas más grandes de su serie en la fase titulada "disgregación" |
| Maurya −232–−185 | expansión al noroeste mientras la dinastía se apagaba |
| Fatimíes 1048–1171 | el Magreb, perdido con la ruptura zirí de 1048 |
| Prusia-Alemania 1525–1884 | África del Sudoeste, colonia desde 1884 |
| Japón 600–1609 | las Ryukyu, reino independiente hasta Satsuma |
| Portugal 1400–1498 | el Índico, antes de que Vasco da Gama lo avistara |
| Otomanos 1299–1345 | el Egeo y los Dardanelos, veinte años antes de Karesi |
| Roma −241–−238 | Liguria, Cerdeña y Córcega, todas posteriores a 238 |
| Sacro Imperio 962–1033 | el reino de Arles, incorporado en 1033 |
| Estados Unidos 1898–1900 | Tutuila, cedida en 1899 |
| Ming 1368–1382 | Yunnan, todavía del Yuan |
| Francos 756–804 | Nordalbingia, sometida sólo en 804 |
| Omeyas 661–712 | el Indo, anterior a Muhammad bin Qasim |

Arcos corregidos: **Champa** 192–**1832** (el mapa la borraba en 1500 y
entregaba el sur a Dai Viet tres siglos antes de tiempo; Panduranga sobrevivió
como principado tributario hasta Minh Mang), **Corasmia** 1077–1223, **fatimíes
909**–1171, **almohades** 1147–**1269**, **Sumeria** hasta −2004, **otomanos**
desde 1299, **España** desde 1479.

292 nombres de fase corregidos en 83 entidades, en modo parcial: sólo los que
estaban mal.

Los recortes dispararon el solape a **5.311 grado²-año** y se resolvió en tres
pasadas hasta **~290**. Como siempre, alargar un arco mete a la entidad encima
de quien ocupaba ese espacio: Castilla y Aragón siguen siendo reinos hasta 1492,
Granada resiste hasta enero de ese año, y los Anushtegin son vasallos qara
khitai hasta 1157.

## Estado

892 civilizaciones · 6.213 periodos, ninguno sin nombre · estructura 0/0/0/0/0 ·
auto-intersecciones 0 de 13.302 · capitales **302/302** · esbuild 0 errores ·
doble pintado exacto **~290 grado²-año**.

Verificadas 189 de 594 entidades políticas.


---

# Ronda 5 — 26 de agosto de 2026

Otras 90 entidades, ya de peso medio. **311 anacronismos y errores fechados**;
sólo `sudan` salió limpia.

Catorce recortes de caja aplicados:

| entidad | qué tenía de más |
|---|---|
| Balhae 698–790 | su extensión máxima, que es del rey Seon (818-830), desde el año de fundación |
| Gojoseon −300–−108 | Liaodong, conquistada por Yan hacia 300-280 a.C. |
| Shang | Ningxia y el norte de Shaanxi |
| Harsha 606–647 | territorio al sur del Narmada, donde Pulakeshin II lo detuvo |
| Bujará 1709–1876 | el valle de Ferganá, independiente como kanato de Kokand desde 1709 |
| Ayubíes | el Tigris medio; su límite fue el Jabur |
| Meriníes 1244–1465 | **Lanzarote y Fuerteventura** |
| Papúa australiana | **Nauru**, que nunca fue territorio australiano de Nueva Guinea |
| Omán 1650–1879 | Dhofar, a 800 km y anexionado dos siglos después |
| Perú 1821–1884 | litoral al sur del río Loa, que era boliviano |
| Uigures 744–766 | Beshbalik y el borde del Tarim |
| Pundra-Vanga | lon 93,9, que es Manipur, no el delta |

Dieciocho arcos corregidos: ayubíes hasta **1260** (Damasco cae con los
mongoles, no con los mamelucos), visigodos hasta **720** (Septimania), Kongo
hasta **1914** (Portugal abolió el reino tras la revuelta de 1913-14), hititas
desde **−1650**, Sui desde **581**, Aragón hasta **1479**, Mari hasta −1759.

212 nombres de fase corregidos en 81 entidades.

## Tres recortes que NO se hicieron

El verificador pedía recortar `wolof` a 1549, `sikh_empire` a 1799 y `zanzibar`
a 1856. Los tres habrían dejado siglos en blanco: son las únicas entidades en
sus regiones. Se conservan como contenedor y se renombran las fases para que
digan quién gobernaba de verdad — los reinos de Cayor, Baol, Waalo, Sine y
Saloum tras Danki; la confederación de misls; la costa suajili bajo los busaidi
de Omán. Un hueco es peor que un rótulo impreciso.

## Estado

892 civilizaciones · 6.227 periodos, ninguno sin nombre · estructura 0/0/0/0/0 ·
auto-intersecciones 0 de 13.338 · capitales **302/302** · esbuild 0 errores ·
doble pintado exacto **~490 grado²-año**.

Verificadas 287 de 594 entidades políticas: casi la mitad.

## Ronda 6 — 2026-08-26

90 entidades sin verificar de mayor peso, repartidas entre seis agentes.
Solo `uzbekistan`, `mozambique` y `south_sudan` volvieron limpias; el resto
sumó 239 anacronismos.

**Aplicado**

- 19 correcciones de arco (merina 1897→1896, taifas 1091→1110, savoy 1046→1003,
  zirid 1048→972, jin_estado −771→−1033, kannauj 783→816, hausa 1804→1808…).
- 214 rótulos de fase en 80 entidades, más 108 rótulos nuevos escritos después
  de los recortes: al partir un periodo, los dos trozos heredaban el mismo texto
  y ya no describían el mismo territorio.
- 93 recortes de caja en 60 entidades, extraídos de los informes por tres
  agentes con la regla de no recortar nada que el informe no documente con
  coordenadas o topónimos verificables. Los agentes descartaron por su cuenta
  unos cincuenta hallazgos: unos porque eran ampliaciones (la herramienta solo
  quita), otros porque el recorte correcto habría dejado siglos en blanco sin
  que el informe nombrase al ocupante.
- 42 pares de solape resueltos por sustracción.

**El hallazgo grande: Mysore bajo Haidar Alí y Tipu**

`british` pintaba Srirangapatna, Mysore y Bangalore desde 1763. Es decir: el
estado indio que más resistió a la Compañía aparecía, durante sus treinta y seis
años de mayor poder, reducido a una franja costera que ni siquiera contenía su
propia capital, mientras el color británico ocupaba su meseta. El defecto venía
de un carve antiguo, no de esta ronda, y ninguna medición lo había delatado
porque no era doble pintado: era una amputación limpia. Se restituyó el
territorio real en dos fases (1763–1792 y, tras Seringapatam, 1792–1799), se
restó de `british`, y se dio Malabar y Baramahal a la Compañía desde 1792 para
que el traspaso no dejara ocho años en blanco.

**Doble pintado exacto**

| momento | grado²-año | peor par |
|---|---|---|
| tras aplicar arcos, rótulos y recortes | 7 793,4 | zirid / bereberes_magreb 2 163,6 |
| tras 42 sustracciones | 330,4 | taifas / almoravid 93,2 |
| tras recortar taifas a Zaragoza | **210,9** | tibet_medieval / tarim_pueblos 6,2 |

Ningún par por encima de 6,2: lo que queda son astillas de frontera.

Las extensiones de arco fueron, otra vez, la fuente principal del solape.
Prolongar la vida de una entidad sin mirar quién ocupaba ese suelo es el error
que esta campaña comete una y otra vez, y la única defensa es medir después.

**Falsa alarma registrada**

Cannanore (75.37, 11.87) y Mangalore (74.85, 12.87) daban «nadie» al comprobar
el traspaso de Malabar. Las dos son agua en land-50m. Es el mismo tropiezo que
Constantinopla: comprobar `tierra.enTierra(pt)` **antes** de declarar un hueco.

**Estado**

civs 892 · periodos 6 306 · anillos 46 956 · estructura 0/0/0/0/0 ·
auto-intersecciones 0 · capitales 302/302 · esbuild sin errores.

**Pendiente que esta ronda ha destapado**

- No existe entidad para el reino **seléucida** en Anatolia: al recortar Pérgamo
  a la ciudadela de Filetero, Sardes y Éfeso quedan sin nadie de −281 a −188.
- No existe el reino **hammadí** (1015–1152): el recorte ziri deja el Magreb
  central vacío.
- `konkan` tiene área 0,0 entre 543 y 1000 — cuatro anillos degenerados. La
  entidad es invisible durante 457 años, y esto es anterior a esta ronda.
- `savoy` es un solo periodo de 1198 a 1720 rotulado como ducado, siendo condado
  hasta 1416; `nepal` mezcla la etapa Thapa y el régimen Rana en un solo tramo;
  `shu_ba` se titula «Shu y Ba» pero ninguna caja cubre Ba.
- Quedan unas 135 entidades políticas sin verificar.

## Ronda 7 — 2026-08-26

Primero se cerraron los tres pendientes que dejó la ronda 6.

- **konkan** llevaba 457 años (543–1000) reducido a tres astillas de cuatro
  vértices y área 0,0: la entidad existía sin pintar nada. La costa la pintan
  chalukyas, rashtrakutas y yadavas de forma continua hasta 1250, así que el
  arco se poda en 543. Los silaharas de Thane quedan anotados como candidatos
  si algún día el mapa decide pintar vasallos.
- **Anatolia seléucida.** Al recortar Pérgamo a la ciudadela de Filetero
  quedó un vacío de casi un siglo en toda la meseta. El mapa figura el mundo
  seléucida bajo `persia`, y ahí faltaba: se añadió Lidia oriental, Frigia,
  Pisidia y Licaonia para −281..−188, con carve, de modo que Galacia, la franja
  ptolemaica de Licia y Caria y el propio Pérgamo quedaran intactos.
- **hammadid**, entidad nueva (1015–1152), en tres fases: la Qalaa de los Beni
  Hammad, el repliegue tras los Banu Hilal, y Bugía. De paso se partió el arco
  ziri en 1015 y se descubrió que **los almorávides tenían la misma
  anacronía atlántica que las taifas**: lon −28,6, en pleno océano a la altura
  de las Azores.

Después, la ronda de verificación propiamente dicha: 96 entidades, seis
agentes, **273 errores**. Ninguna salió limpia. Otros seis agentes convirtieron
los informes en operaciones ejecutables y descartaron por su cuenta más de cien
hallazgos: ampliaciones (la caja solo quita), particiones, creación de
entidades, o recortes que habrían dejado una región sin ocupante nombrado.

**Aplicado:** 34 arcos, 119 rótulos, 113 recortes de caja, 24 pares de solape
resueltos por sustracción.

**Herramientas nuevas:** `ver.js` (periodos con área y caja: es lo que impide
que un agente proponga un recorte que vacía un periodo), `arco.js` (estira o
encoge el primer y el último periodo) y `poda.js` (borra tramos enteros y avisa
si la entidad quedaría vacía, porque eso es una decisión de modelo).

**Hallazgos que merecen nombre**

- **licchavi_nepal** tenía el polígono sobre la cresta del Himalaya, dejando
  fuera el valle de Katmandú, que era todo el reino. No es recortable: hay que
  redibujarlo. Igual **kerma**, cuyo polígono está 220 km al sur de la ciudad
  de Kerma, sobre Napata-Meroe.
- **sicily** y **kingdom_sicily** son la misma cosa entre 1130 y 1282. Un agente
  extendió el arco de `sicily` hasta 1130 siguiendo su informe, y la medición
  lo delató al instante con 400,9 grado²-año de solape. Revertido a 1282.
- **wu_yue** es una entidad llamada «Wu y Yue» que pinta a Yue después de 473
  mientras `yue_estado` existe aparte. No se solapan: coexisten como polígonos
  complementarios. Es una fusión indebida que sigue pendiente. Sí se corrigió
  la frontera del Qiantang: Kuaiji, capital de Yue, caía del lado de Wu por dos
  centésimas de grado.
- **israel_juda** pinta Samaria y Galilea, provincias asirias, mientras el
  rótulo dice Judá: las cajas no contienen Jerusalén.

**Doble pintado exacto**

| momento | grado²-año | peor par |
|---|---|---|
| tras arcos, rótulos y recortes | 1 903,6 | asiria / neo_hitita 655,1 |
| tras 24 sustracciones y revertir sicily | **211,3** | tibet_medieval / tarim_pueblos 6,2 |

Una sola pasada bastó esta vez, y el residuo queda igual que al cerrar la
ronda 6 (210,9). Otra vez todo el solape grande venía de extender arcos.

**Estado**

civs 893 · periodos 6 397 · anillos 47 324 · estructura 0/0/0/0/0 ·
auto-intersecciones 0 · capitales 302/302 · esbuild sin errores.
Verificadas 465 entidades; quedan 130 políticas sin verificar.

**Pendiente**

- Redibujar `licchavi_nepal` y `kerma`: polígonos en el sitio equivocado.
- Resolver la fusión `wu_yue` / `yue_estado`.
- Los agentes anotaron más de sesenta entidades que faltan. Las más citadas:
  Kotte y Jaffna, Banten, Dagbon y Mamprugu, Tidore, Nanyue, Silla antigua y
  Gaya, Antioquía y Edesa latinas, el Reino de Etruria, Hobyo, Kenedougou.
- 48 defectos de forma en `audit.js` (3 cajas, 17 óvalos, 28 trazos gruesos).
- El reino seléucida sigue sin entidad propia: vive dentro de `persia`.

## Ronda 8 — 2026-08-26

Se cerraron primero los tres defectos que la ronda 7 dejó nombrados.

- **licchavi_nepal** tenía el polígono apoyado en la cresta del Himalaya:
  Katmandú, Patan y Bhaktapur, que eran el reino entero, caían fuera y los
  pintaba una cultura. Redibujado sobre el valle.
- **kerma** era un triángulo sobre Napata y Meroe, 200 km al sur de la propia
  ciudad de Kerma. Redibujado como la cuenca de Dongola, con las tres fases
  crecientes: tercera catarata, Batn el-Hayar, y de la cuarta catarata a
  Elefantina en el Kerma clásico.
- **wu_yue** era una entidad llamada «Wu y Yue» que pintaba a Yue después de
  473 mientras `yue_estado` existía aparte, como polígonos complementarios.
  Ahora `wu_yue` es el estado de Wu y muere en −473; `yue_estado` hereda el
  bajo Yangtsé cuando Goujian lo aniquila.

Después, las **130 entidades políticas que quedaban**: seis agentes de
verificación, 253 errores, 33 entidades limpias. Otros seis agentes
convirtieron los informes.

**Operación nueva: adiciones.** Hasta ahora el instrumental solo sabía quitar,
y los informes llevaban rondas señalando territorio que FALTA sin que hubiera
manera de aplicarlo. Se añadió `anade` al repertorio de los agentes, con el
polígono dibujado vértice a vértice. Aparecieron en el mapa Bioko con Malabo
(Guinea Ecuatorial no tenía su capital), Penghu, Kinmen y Matsu, las Ellice
enteras, las Marianas del fideicomiso del Pacífico, Ras Shamra dentro de
Ugarit, Sirmio dentro del reino gépido, las doce póleis de la Magna Grecia,
Trípoli, Beirut y Tiro dentro del Líbano.

**Aplicado:** 22 arcos, 116 rótulos, 59 recortes, 77 adiciones, 50 pares de
solape resueltos, 2 podas de arco.

**Una trampa nueva del carve.** `anade` talla contra los vecinos, así que la
adición que pisa a alguien se borra en silencio antes de guardarse. Restar
después no sirve de nada: la geometría ya no está. De 77 adiciones, 28 se
habían evaporado así. Hay que añadir con NOCARVE y restar al vecino en un
segundo paso, decidiendo a mano quién gana. Escrito aquí para no repetirlo.

**Entidad nueva:** `tesalonica_latina` (1204–1224). Al recortar el Imperio
Latino a su mitad oriental, Macedonia quedaba en blanco; el reino de Bonifacio
de Montferrato es lo que la ocupaba.

**Podas:** `bulgaros` llegaba hasta 2025 duplicando a `bulgaria`; ahora muere
con Vidin en 1396. `bahmani` sobrevivía hasta 1527 encerrado dentro de `bidar`;
muere en 1518. Y su fase 1492–1504 exhibía la firma clásica: 9,3 grado² antes,
7,2 después, y 31,7 justo en el tramo rotulado «los gobernadores se
independizan y el sultán queda tutelado».

**Doble pintado exacto**

| momento | grado²-año | peor par |
|---|---|---|
| tras arcos, rótulos, recortes y adiciones | 3 285,9 | isin_larsa / babilonia 793,3 |
| tras 24 sustracciones y dos podas | 238,4 | bulgaros / tesalonica_latina 16,8 |
| tras seis sustracciones más | **~215** | sin pares grandes |

**Estado**

civs 894 · periodos 6 522 · anillos 47 959 · estructura 0/0/0/0/0 ·
auto-intersecciones 0 · capitales 302/302 · esbuild sin errores.

**Las 595 entidades políticas del mapa están verificadas.** Solo queda sin
pasar por una ronda `tesalonica_latina`, creada en esta misma.

**Pendiente**

- Las 298 culturas nunca se han verificado: son el próximo frente.
- Los agentes anotaron unas cuarenta entidades más que faltan. Las más citadas:
  Tidore, Nanyue, Silla antigua y Gaya, Matamba, el Sultanato de Madurai,
  Kotte y Jaffna, Banten, Dagbon y Mamprugu, el reino ilirio, Elam,
  Chipre del Norte, Tuvalu, los hehe de Mkwawa.
- Fusiones sin resolver: `modena_parma`, `ibadan`, `isin_larsa`, `demak_pajang`,
  `pacifico_frances`, `crusader_states`.
- Enclaves y agujeros interiores que ninguna herramienta sabe hacer: Berlín
  Oeste, Gambia dentro de Senegal, la Zona del Canal, Akrotiri y Dhekelia,
  el Alto Karabaj.
- 48 defectos de forma en `audit.js`.

## Ronda 9 — 2026-08-27 · primera ronda sobre las áreas culturales

96 culturas, seis agentes de verificación: **404 errores**, 4,2 por entidad
frente a 2,5 en las políticas. Ninguna salió limpia.

### El hallazgo estructural

Cuatro agentes señalaron por separado la misma causa, sin haberse leído entre
ellos: **los polígonos coloniales de reclamación se tragan las áreas culturales
décadas o siglos antes de que hubiera control efectivo.** El mapa pintaba la
reclamación, no el gobierno.

| lugar | lo que pintaba el mapa | lo que había |
|---|---|---|
| Sacramento, Los Ángeles, Eureka | españoles desde el siglo XVI | San Diego se funda el 16-VII-1769 |
| Salt Lake City | española desde 1512 | España nunca puso un pie en la Gran Cuenca |
| La Paz (BCS) | española desde 1512 | Fortún Jiménez avista la península en 1533; misión de Loreto, 1697 |
| Alice Springs | británica desde 1788 | Stuart la cruza en 1860 |
| alto Xingu y Purús | portugueses desde 1500 | Chandless remonta el Purús en 1864-67 |
| Chukotka | rusa desde 1650 | Anadirsk se abandona en 1764; la paz chucota es de 1778 |

`california_naciones` valía 0,1 grado² desde 1512. `gran_cuenca` caía de 69,1 a
2,5. Corregir cultura por cultura no habría servido de nada: los recortes
reaparecen mientras el Estado siga ahí. Se recortaron primero `spanish`,
`british`, `portugal` y `russia` a su control efectivo, y después las culturas
recuperaron el hueco.

### Otros hallazgos

- **Duplicados**: `cuyo_sierras`/`huarpe_comechingon` y
  `chukotka_kamchatka`/`chukchi_koryak` son el mismo pueblo dos veces.
- **Territorio que faltaba en la entidad que lo lleva en el nombre**: `jomon`
  sin Hokkaidō ni Sannai-Maruyama, el mayor poblado jōmon; `nordicos` sin
  Dinamarca ni Noruega; `etiopia_baja` sin el bajo Omo; `cree_innu` sin
  Nitassinan; `unangan_yupik` sin el 70 % de las Aleutianas; `inuit` sin
  Groenlandia; `chukchi_koryak` cortada en el antimeridiano, sin el cabo
  Dezhniov.
- **Tierra del Fuego** llevaba 879 años sin selknam ni yámanas: `tehuelche` se
  la comía entera.

**Aplicado:** 62 arcos, 1 014 rótulos, 41 recortes, 133 adiciones, 34
sustracciones, 2 podas.

### Dos errores míos, registrados

1. **Apliqué las adiciones sin tallado.** A los agentes les dije que dibujaran
   con holgura porque el tallado recorta, y luego usé NOCARVE. El solape exacto
   saltó a **3 390 511 grado²-año**. Rehecho desde el respaldo con tallado.
2. **El instrumental dejó de escalar.** Con las adiciones talladas el mapa pasó
   a 62 609 anillos y `dobles_exacto.js` ya no termina: lo dejé más de una hora
   y murió sin escribir nada. Dos cosas hechas al respecto:
   - `astillas.js`, herramienta nueva: borra los anillos por debajo de un
     umbral de área, que son residuo del tallado y no geografía. A 0,005
     grado² quitó 9 373 anillos y 43 893 vértices a cambio del **0,002 % del
     área**. Las islas de referencia (Bioko 0,158, Annobón 0,111, Penghu
     0,480) quedan dos órdenes de magnitud por encima del umbral.
   - `dobles_sub.js`, herramienta nueva: mide solo los pares que tocan una
     lista de entidades, con poda por caja y arco de civilización.

### La medición exacta, recuperada

`dobles_exacto2.js`, herramienta nueva. Mide exactamente lo mismo que la
anterior —interseca polígonos, no muestrea— con tres podas:

1. Los anillos viven una sola vez en el diccionario `__RG`. Se cargan **sin
   copiar**, así que dos periodos con la misma forma comparten índice y su
   intersección se calcula una vez y se memoriza. Una cultura tallada conserva
   la misma geometría durante decenas de periodos seguidos: ahí estaba casi
   todo el trabajo repetido.
2. Caja y arco por civilización antes de mirar sus periodos (389 896 pares
   podados de 399 171).
3. Caja por anillo: a `polygon-clipping` solo se le pasan los pares de anillos
   cuyas cajas se cruzan, no los conjuntos enteros.

Tarda **dos minutos** donde la anterior no terminaba en una hora. Validada
contra el estado de la ronda 8: mismos 8 780 pares comparables, mismos 1 467
con solape, 212,1 frente a 211,3 grado²-año.

### Lo que la rejilla no vio

Con el instrumento de vuelta, la sonda quedó retratada. Donde `barrido.js`
decía **44 celda-año**, la medición exacta decía **15 659,2 grado²-año**. Los
pares grandes —Rusia sobre los ugrofinos del Volga, el Imperio de Brasil sobre
el alto Xingu, los kushan sobre el Hindu Kush— caían entre los puntos de la
rejilla. Es la misma lección de la ronda 5, y esta vez con números al lado.

Resuelto en cuatro pasadas hasta **258,2 grado²-año**, ningún par por encima de
6,5. Lo que quedó:

- **`hindu_kush`** era el peor de todos: su caja llegaba a lon 65,2, es decir
  Kabul y Bamiyán, y chocaba con todos los imperios que pasaron por allí.
  Recortada a los valles nuristaníes y dárdicos.
- **`resta_civ.js` aprendió a borrar.** Cuando el perdedor es un área cultural
  y queda entera dentro de un Estado, ese tramo no se pinta: el hueco temporal
  es lo que hubo. Antes la herramienta avisaba y conservaba el polígono, que
  entre dos Estados es lo correcto, pero entre cultura y Estado dejaba el
  solape puesto. Con `BORRA_CONTENIDOS=1` se elimina el periodo.
- **La Gran Cuenca llegaba al Valle Central.** Sacramento, Fresno,
  Bakersfield y Los Ángeles salían shoshón. La cresta de la Sierra Nevada corre
  en diagonal —lon −120,0 a la altura de Reno, −118,5 a la de Fresno— y una
  caja no puede expresar eso: se ajustó con una adición y dos sustracciones.

### Tres extensiones revertidas

`aboriginal_australia` (a 1931), `ge_cerrado` (a 1850) y `chukchi_koryak` (a
1889) quedaban enteras dentro del Estado que las cubre. Es el mismo caso de
`yaudheya`, `nayaka` y `buganda`: que una fuente tenga razón sobre la
pervivencia de un pueblo no se la da sobre quién gobernaba ese territorio.
Recortadas a 1860, 1700 y 1778.

**Estado**

civs 894 · periodos 7 304 · anillos 53 119 · estructura 0/0/0/0/0 ·
auto-intersecciones 0 (se repararon 205) · capitales 302/302 · esbuild sin
errores · doble pintado exacto **258,2 grado²-año** · 7,08 MB.

Verificadas 692 entidades. **Todas las políticas y 96 de las 298 culturas.**
Quedan 202 culturas.

**Pendiente**

- 202 culturas sin verificar.
- Los duplicados `cuyo_sierras` y `chukotka_kamchatka`.
- El archivo ha crecido de 6,6 a 7,08 MB; conviene vigilarlo.

## Ronda 10 — 2026-08-29 · segunda ronda de culturas

96 culturas, seis agentes: **316 errores**. Dos entidades limpias.

### La reclamación colonial, tercera tanda

Los agentes volvieron a encontrar el patrón por su cuenta, en dos frentes que
la ronda 9 no había tocado:

- **El Suroeste norteamericano.** Phoenix, Santa Fe y El Paso figuraban
  españolas desde 1512. Coronado solo pasa (1540-42) y no funda nada; Oñate
  establece Nuevo México en 1598 y Santa Fe es de 1610; la misión de El Paso es
  de 1659; Kino entra en la Pimería Alta en 1687 y el presidio de Tucson es de
  1775. La Apachería no se sometió nunca: Gerónimo se rinde en 1886, ya frente
  a los Estados Unidos.
- **Angola.** Huambo, Lubango y Menongue figuraban portuguesas desde el siglo
  XVI. Luanda se funda en 1575 y Benguela en 1617; el altiplano no se ocupa
  hasta la guerra de Bailundo (1902-04) y el Cunene hasta Môngua (1915). De
  paso se descubrió lo contrario: **Luanda se la pintaba el Kongo** desde su
  fundación. Devuelta.

### Cuatro pueblos que estaban dos veces

Agentes distintos, en rondas distintas y sin leerse entre ellos, señalaron los
mismos duplicados. Herramienta nueva, `funde_civ.js`: la perdedora aporta su
geometría a la superviviente, que se parte en sus cortes y hereda su arco, y
desaparece del mapa.

| desaparece | sobrevive | por qué |
|---|---|---|
| `cuyo_sierras` | `huarpe_comechingon` | mismo territorio, mismas fechas, mismo wikiTitle |
| `chukotka_kamchatka` | `chukchi_koryak` | mismo pueblo, mismo año final, cajas casi idénticas |
| `saja` | `yakutia_pueblos` | la segunda ya se rotulaba «Llegada de los sajá desde el Baikal» |
| `sotho_tswana_pueblos` | `tswana` | misma tierra, y `tswana` ya llegaba a 1885 |

Fundir une geometría sin tallar contra terceros, así que hubo que deslindar
después: la fusión disparó el solape a 13 608 grado²-año, casi todo
`tswana`/`khoisan`.

### Otros hallazgos

- **`grassfields_camerun` no contenía el Grassfields.** Desde 1394 —el año en
  que se funda Bamum— Bamenda, Bafoussam, Dschang y Kumbo desaparecían del
  mapa, mientras la entidad pintaba Yaundé, Duala y Kribi, o sea la selva del
  sur. El corte se localizó al año.
- **`saja` no contenía Yakutsk**, capital del pueblo sajá: pintaba el Aldán-Maya,
  que es país evenki. Restituido el núcleo Amga-Lena.
- **`ppnb` pintaba casi el reverso del PPNB real**: fuera 'Ain Ghazal, el mayor
  asentamiento conocido; dentro Jarmó, que es Neolítico del Zagros.
- **`eslavos` en el siglo IV** cubría Bohemia, Moravia y Transilvania, tierra de
  marcomanos y godos. La primera cultura arqueológicamente eslava es el
  Dniéper medio. Cracovia, que quedaba vacía, es área Przeworsk: germanos.
- **`megalitismo_atlantico` dejaba fuera Stonehenge, las Orcadas y Antequera**,
  los tres conjuntos emblemáticos del fenómeno que nombra.
- **`san_agustin`** medía 4,8 grado² para una cultura del alto Magdalena de
  0,3: llegaba a Esmeraldas, en Ecuador.

**Aplicado:** 44 arcos, 477 rótulos, 68 recortes, 88 adiciones, 22
sustracciones, 4 fusiones, 3 recortes coloniales.

**Doble pintado exacto**

| momento | grado²-año |
|---|---|
| tras arcos, rótulos, recortes y adiciones | 16 325,5 |
| tras 18 sustracciones | 265,3 |
| tras las fusiones | 13 608,7 |
| tras el deslinde | **264,1** |

Ningún par por encima de 6,5. El instrumento nuevo hizo las cuatro mediciones
en dos minutos cada una: sin él esta ronda no se habría podido cerrar.

**Estado**

civs 890 · periodos 7 521 · anillos 54 675 · estructura 0/0/0/0/0 ·
auto-intersecciones 0 (se repararon 26) · capitales 302/302 · esbuild sin
errores · doble pintado exacto **264,1 grado²-año** · 7,16 MB.

Verificadas 784 entidades: **todas las políticas y 192 de las 298 culturas.**
Quedan 106 culturas.

**Pendiente**

- 106 culturas sin verificar.
- `anade.js` tarda ahora cuarenta minutos: el tallado hace por cada adición lo
  que `dobles_exacto2.js` ya sabe evitar. Le falta la misma poda.
- Duplicados que los agentes sospechan y no se han comprobado: `chokwe` con
  `ovimbundu_lunda`, `wabanaki` con `algonquinos_este`, `etiopia_altiplano` con
  `etiopia_baja` (esta ultima ocupa el altiplano: Gondar, Lalibela, Adís Abeba).
- Más de sesenta pueblos anotados como ausentes a lo largo de las tres rondas
  de culturas.

## Ronda 11 — 2026-08-29 · las últimas 106 culturas

106 culturas, seis agentes: **291 errores**. Ninguna limpia.

**Con esta ronda, las 890 entidades del mapa han pasado por una verificación.**

### La reclamación colonial, cuarta y última tanda

El patrón volvió a aparecer, señalado otra vez por agentes que no se leen entre
ellos, ahora en Norteamérica y el Pacífico con cinco actores nuevos:

| lugar | pintaba | había |
|---|---|---|
| Ohio, Kentucky, Tennessee | británicos desde Jamestown (1607) | la Proclamación de 1763 reserva el interior a las naciones indígenas |
| Nebraska, Dakotas | franceses desde 1682 | la Luisiana de La Salle era un título; las llanuras eran pawnee, osage y wichita |
| Altas Llanuras 1803-1854 | estadounidenses desde la compra | siux, cheyenes, arapajoes y crow siguieron gobernándolas |
| Carolinas (Yap, Pohnpei) | españolas desde 1686 | España no ocupa hasta 1886, tras el arbitraje de León XIII |
| suroeste de Florida | español desde 1565 | el reino calusa resiste hasta mediados del XVIII |

Cuatro rondas, once actores coloniales, siempre el mismo error: **el mapa
pintaba el título y no el gobierno.** Que haya hecho falta encontrarlo cuatro
veces, en cuatro continentes, dice algo sobre cuán profundo estaba metido.

### Dos herramientas que faltaban

- **`quita_caja.js`**, espejo de `recorta_caja`: retira lo que cae DENTRO de una
  caja en vez de conservarlo. Se escribió porque `anade` en modo «menos»
  recorta antes el polígono a la costa, y cuando la región es casi todo océano
  —Micronesia— lo que queda son unas islas que la diferencia no siempre
  elimina. Yap seguía siendo española después de tres intentos.
- **`crea_periodo.js`**: inserta un periodo en un hueco temporal. Es la
  operación que las rondas 9, 10 y 11 descartaron una y otra vez: los informes
  encontraban un pueblo desaparecido del mapa durante un tramo —los cheroqui
  entre 1607 y 1776, los pawnee entre 1682 y 1763— y ninguna de las cuatro
  herramientas sabía rellenarlo. `arco.js` solo mueve los extremos y `anade.js`
  necesita un periodo donde añadir. Con ella, Nashville y Omaha dejan de estar
  vacías en 1750.

### Un intento fallido, registrado

Traté de acelerar el tallado de `anade.js`, que tardaba cuarenta minutos. La
poda por caja de civilización resultó **neutra** —las culturas continentales
solapan con casi todos sus vecinos, así que no poda nada— y la idea siguiente,
hacer una sola diferencia contra la unión de todos los ganadores en vez de una
por ganador, es un 25 % más rápida pero **deja el solape puesto**: cuando
`polygon-clipping` recibe doscientos polígonos de recorte falla, el `catch`
conserva el anillo entero y la prueba sobre cuatro entidades dio 5 336
grado²-año frente a 25,3. Revertido. Queda la precomputación de cajas, que es
idéntica al original y algo más limpia. El tallado sigue siendo lento y sigue
siendo correcto.

### Otros hallazgos

- **`arctico_oriental`** era un parche de 0,2 grado² junto a Nain para un pueblo
  que ocupaba Baffin, Foxe, Ungava y Labrador: le faltaba el 99 % del territorio.
- **`bantu_tierras_altas`** no contenía ni el monte Kenia ni un solo asentamiento
  kikuyu: lo único dentro de su caja eran las colinas Taita.
- **`ife`**: Ile-Ife figuraba como Benín en 1250 y como Oyó desde 1350. Ninguno
  de los dos la gobernó jamás.
- **`hopewell`** dejaba fuera Chillicothe, el yacimiento epónimo, en la fase
  rotulada «apogeo».
- **`el_argar`** medía dos veces y media lo real: incluía Sevilla y Madrid.
- **`hassuna_samarra`** tenía la fase Hassuna dibujada sobre Samarra, con Tell
  Hassuna fuera de la caja.

**Aplicado:** 60 arcos, 315 rótulos, 57 recortes, 97 adiciones, 27
sustracciones, 5 recortes coloniales, 2 periodos creados.

**Doble pintado exacto**

| momento | grado²-año |
|---|---|
| tras arcos, rótulos, recortes y adiciones | 11 053,8 |
| tras 16 sustracciones | 401,6 |
| tras 6 más | 277,5 |
| tras rellenar los huecos de cheroqui y pawnee | 1 087,7 |
| tras el deslinde final | **286,9** |

**Estado**

civs 890 · periodos 7 682 · anillos 56 414 · estructura 0/0/0/0/0 ·
auto-intersecciones 0 (se repararon 41) · capitales 302/302 · esbuild sin
errores · doble pintado exacto **286,9 grado²-año** · 7,25 MB.

**Las 890 entidades verificadas: 592 políticas y 298 culturas.**

**Pendiente**

- Ninguna entidad ha pasado por una SEGUNDA ronda. Cada vez que se ha vuelto
  sobre una ya verificada —bahmani, los almorávides— ha aparecido algo. Una
  entidad verificada es una entidad auditada una vez, no una entidad correcta.
- Más de cien pueblos anotados como ausentes a lo largo de las cinco rondas de
  culturas: otomí (que no está en absoluto), tepehua, terramare, Nanyue, Tidore,
  Silla antigua, Gaya, Matamba, Elam, el reino ilirio, catawba, yuchi, taensa,
  chitimacha, los kipchakos orientales, los diaguitas chilenos.
- Duplicados sospechados sin comprobar: `chokwe`/`ovimbundu_lunda`,
  `wabanaki`/`algonquinos_este`, `etiopia_altiplano`/`etiopia_baja`,
  `dine_apache`/`apache_llanos`, `oodham`/`suroeste_desierto`,
  `aldeanos_misuri`/`praderas_norte`, `xhosa`/`nguni_pueblos`, y el triple
  `inuit`/`artico_canadiense`/`arctico_oriental`.
- 63 defectos de forma en `audit.js`, sin tocar desde la ronda 8.
- Docenas de hallazgos descartados por pedir partir un periodo: hay
  `crea_periodo.js` para huecos, pero sigue faltando «parte este periodo en dos
  y dale a cada mitad su geometría».

## Ronda 12 — 2026-08-30 · formas, segunda verificación y creación

Tres trabajos en una ronda.

### 1. Las formas: 100 defectos, 42 de ellos falsos

La auditoría de figuras marcaba 100 defectos, 28 de ellos cajas. Resultó que
**el auditor no sabía distinguir tres cosas distintas**:

- **Caja de mar.** Un archipiélago se pinta con un rectángulo de océano a
  propósito: un atolón no se ve a escala de globo. Kiribati, las Marshall, el
  Pacífico neozelandés, el fideicomiso: 0% de tierra dentro. Es la convención
  del mapa, no un defecto. `audit.js` ahora las ignora.
- **Tesela de corte vertical.** `recorte.parte` corta un polígono en tiras para
  evitar agujeros, y entonces los lados rectos son **costuras**, no bordes
  dibujados. Se reconocen porque otro anillo del mismo periodo empieza
  exactamente en esa longitud. Reformar una tesela sola abre una franja blanca
  contra su vecina. Lo encontró un agente por su cuenta, comprobando que los
  lados de `paleoesquimales`, `inuit`, `usa` y `abbasid` caían justo en los
  cortes. `audit.js` ahora también las ignora.
- **Rectángulo dibujado a mano.** Los 28 de verdad, casi todos míos: las
  restituciones de las rondas 9, 10 y 11 se escribieron con un ayudante
  `caja(x0,x1,y0,y1)` y el territorio recuperado salió correcto en extensión y
  falso en forma.

Los 28 están **redibujados con contornos apoyados en accidentes con nombre**:
el Kwanza y la escarpa de Chela para el altiplano de Benguela; el Blue Ridge y
la meseta de Cumberland para los cheroqui; el Danubio y el arco carpático para
los gépidos; el borde del Rub al-Jali y el Yabal Tuwayq para el flanco árabe
mameluco. **Cero cajas.** Quedan 32 trazos gruesos y 16 óvalos.

**Un error mío de bulto, cazado por el cuarto agente:** `sustituye.js` escribe
su cuarto argumento en `p.name`, así que los tres primeros lotes de redibujado
**machacaron el rótulo histórico** de cada periodo que tocaron. Diecisiete
rótulos restaurados desde el respaldo. La herramienta no está mal: lo estaba mi
manera de encargar el trabajo.

### 2. La segunda verificación

96 entidades de las rondas 0 y 3, las más antiguas. **271 errores. Nueve
limpias.** Un segundo pase encuentra casi tanto como el primero.

Y hay un motivo que no es el cansancio del auditor: **buena parte de lo que
sobrevivió no sobrevivió por difícil, sino porque la herramienta de entonces no
sabía aplicarlo.** Durante ocho rondas solo se podía quitar, así que todo
hallazgo de territorio que FALTA se descartaba por sistema. Ahora que existen
`anade`, `crea_periodo` y `quita_caja`, esos hallazgos vuelven a estar vivos y
son la mayoría de lo aplicado.

Lo peor encontrado:

- **`sokoto` pierde su capital por un papel.** El rótulo dice literalmente que
  el convenio de 1898 repartió el califato «sobre el papel», y la geometría se
  hunde de 44,4 a 5,5 ese mismo año: Sokoto, Kano y Katsina pasan a británicas
  cinco años antes de que Lugard las tomara.
- **`six_dynasties` está invertida geográficamente**: los nueve anillos de la
  dinastía Chen están en Yunnan, el Gobi y Liaodong, y su propia capital,
  Jiankang, la pinta el Sui.
- **`igala` son dos tiras verticales con el hueco justo encima de Idah**, su
  capital, que la pinta Benín durante 380 de sus 400 años.
- **Transilvania figura otomana durante el reinado de Matías Corvino.**
- **`austria` pinta lo que reclamaba y omite lo que gobernaba**: llega a Kiev
  entre 1526 y 1699 y deja fuera Praga, Bohemia, Silesia y el Tirol.
- **Yunnan no existe entre 1253 y 1368**: Dali termina y el Yuan no lo recoge.

Un detalle de método que cambió el resultado: el primer lote se convirtió sin
conocer `quita_caja` —no estaba en su prompt— y acumuló ocho descartes que los
otros cinco resolvieron sin problema. La herramienta existía desde la ronda
anterior; lo que faltaba era decírselo a quien la necesitaba.

### 3. Veintinueve entidades creadas

Los agentes no pidieron adornos: marcaron cuáles eran **requisito**, porque los
recortes que ellos mismos escribían abrían huecos sin ellas.

| grupo | entidades |
|---|---|
| Herederas de la Horda de Oro | `crimean_khanate` (1441-1783), `kazan_khanate`, `astrakhan_khanate` |
| Sultanatos que el Delhi del XV tapaba | `jaunpur`, `kashmir_sultanate`, `sind_samma`, `multan_langah`, `soomra`, `madurai_sultanate` |
| Sucesores del ilkanato | `yalayiri`, `chobani`, `muzafari`, `kart`, `sarbadar` |
| India | `sur_empire`, `awadh`, `hyderabad_nizam`, `sena` |
| Este y sudeste asiático | `hariphunchai`, `hubaekje`, `guiyijun`, `wuyue`, `northern_han` |
| África | `ahanta_nzema`, `torwa`, `karagwe`, `allada`, `hueda` |
| Europa | `transylvania_principality` |

Bajchisarái llevaba **342 años vacía** y tres agentes distintos lo señalaron sin
leerse entre ellos. Kazán saltaba de la Horda de Oro en 1500 a Rusia en 1600 sin
nada en medio.

Dos decisiones de modelo, anotadas para que se puedan revertir barato:

- **Los estados principescos.** `awadh` duró hasta 1856 y `hyderabad_nizam`
  hasta 1948, pero desde 1818 el mapa pinta el Raj sobre todos ellos —Mysore
  acaba en 1799, el sij en 1849, Baroda, Gwalior, Indore y Jaipur en 1818—.
  Los recorté a 1818 por coherencia con esa docena de vecinos, no porque sea
  más cierto. **Si el mapa debiera pintar los estados principescos es una
  pregunta abierta**, y los periodos están cortados en 1819 y 1853 para que
  cambiar de opinión cueste poco.
- **`kart` empieza en 1335, no en 1244.** De 1244 a 1335 Herat era del imperio
  mongol y del ilkanato, y los malik kartidas eran gobernadores investidos.
  Pintarlos aparte costaba 1.775 grado²-año y abría un boquete de ochenta años
  en el flanco oriental del ilkanato.

**Doble pintado exacto**

| momento | grado²-año |
|---|---|
| tras la segunda verificación aplicada | 7 388,9 |
| tras 9 sustracciones | 243,6 |
| tras crear las 29 entidades | 294,2 |
| tras el deslinde final | **252,0** |

**Estado**

civs **919** · periodos 8 271 · anillos 59 715 · estructura 0/0/0/0/0 ·
auto-intersecciones 0 (se repararon 101) · capitales 302/302 · esbuild sin
errores · doble pintado exacto **252,0 grado²-año** · 7,75 MB.

98 entidades han pasado por dos verificaciones; 821, por una.

**Pendiente**

- 821 entidades esperan su segunda ronda. Si el ritmo se mantiene, cada lote de
  96 dará unos 270 errores.
- Huecos que la creación de esta ronda destapó y no cerró: los inyuidas de Fars
  (1335-1353, Shiraz queda sin dueño diecisiete años), Sistán, Gilán y
  Mazandarán; Bulawayo entre 1100 y 1190, que no es Torwa sino horizonte
  Leopard's Kopje.
- Siguen sin crearse: Nanyue, Tidore, Silla antigua, Gaya, Matamba, Elam, el
  reino ilirio, los otomí, wudai_shiguo, los reinos gibe, Awadh y Haiderabad
  post-1818 si se cambia la convención.
- `anade.js` tardó **dos horas** en esta ronda. Es el cuello de botella real y
  el intento de arreglarlo de la ronda 11 fracasó por una razón documentada.

## Ronda 13 — 2026-08-30 · el cuello de botella, y 96 entidades más

### El tallado, arreglado de verdad

La ronda 11 intentó acelerar `anade.js` y falló; la 12 tardó dos horas. Esta vez
se midió antes de tocar nada, y el perfil dijo dónde estaba:

| entidad | rivales | vértices | llamadas a `difference` (cota) |
|---|---|---|---|
| `british` | 669 | 453 355 | 126 674 |
| `russia` | 217 | 91 140 | 35 958 |
| `pueblos_sahara` | 71 | 11 411 | 34 358 |

El problema no era el algoritmo de recorte: era que **`anade.js` tallaba la
entidad entera después de cada adición**, aunque la adición tocara tres
periodos. Ahora talla solo los periodos que se han tocado. Una adición local a
`british` pasó de **102 segundos a 10**, con geometría idéntica. Y de paso es
más correcto: antes volvía a tallar en silencio geometría que nadie había
modificado.

### La segunda verificación, segundo lote

96 entidades de las rondas 0, 3 y 4. **230 errores, 18 limpias** (frente a 9 en
el lote anterior). Lo que aparece a esta altura ya no son detalles de frontera,
son imperios enteros mal puestos:

- **`dutch_empire` está pintado donde no estuvo.** Su posesión mayor desde 1648
  es Nueva Guinea occidental, donde los neerlandeses no administraron nada hasta
  1898, y faltan Batavia, Ambon, Malaca, Ceilán, El Cabo y Nueva Ámsterdam. Los
  rótulos nombran Brasil, Formosa y Nueva Ámsterdam; el polígono no contiene
  ninguno de los tres.
- **`france` pinta todo su imperio africano en 1880**: el área salta de 124 a
  676 en una sola fase. Tombuctú se ocupa en 1894, Chad en 1900, Madagascar en
  1896 — y el propio mapa deja Bamako en manos toucouleur hasta 1895.
- **`timurid` no tiene Samarcanda**, su capital, entre 1405 y 1500.
- **`spanish` 1479-1492 son 33 astillas**: no hay España, solo restos de una
  sustracción booleana y veinticuatro trozos del Caribe pintados como españoles
  trece años antes de Colón. De rebote, Cataluña y Valencia quedaban sin dueño.
- **`rome` tiene un agujero de 197 años en todo el Magreb** (198-395).
- **`afghanistan`** son once fases con el contorno del Afganistán actual, de 1747
  a 2025, sin Peshawar ni Cachemira ni Sindh.

**Un método que los agentes se pasaron entre ellos.** Uno descubrió que las
retiradas al vecino tienen que aplicarse ANTES que las adiciones —`anade` talla
y el que pierde es siempre la entidad procesada—, y los tres siguientes
escribieron sus archivos ya contando con eso, listando qué pares dependen del
orden. Nadie se lo dijo.

**Aplicado:** 6 arcos, 301 rótulos, 44 recortes, 92 adiciones y **173 retiradas
de caja** — la operación que en la ronda anterior ni siquiera estaba en el
prompt.

### Veintiocho entidades más

Otra vez, requisito y no adorno: los recortes de esta misma ronda abrían los
huecos.

| grupo | entidades |
|---|---|
| Europa carolingia | `bretones`, `sajones`, `obodritas`, `bohemios_samo` |
| Mediterráneo y Europa napoleónica | `emirato_creta`, `montefeltro`, `ducado_varsovia`, `westfalia_berg` |
| Islam y Asia central | `abdelkader_emirate`, `rashidi`, `mamunidas`, `seljuk_iraq`, `ghurid` |
| Corredor de Hexi | `ganzhou_uigures`, `liangzhou` |
| India | `arghun_tarjan`, `kalat`, `varman_vanga`, `baisi_chaubisi` |
| Nubia | `nobatia`, `makuria`, `alodia`, `dotawo` |
| Laos | `luang_prabang`, `vientiane`, `champasak` |
| Otros | `jamaica`, `amatongaland` |

**`nubia` se desdobla.** Fusionaba tres reinos distintos —Nobatia, Makuria y
Alodia— bajo un id. Podada a su fase post-meroítica (400-550) y sustituida por
los tres, más Dotawo. La red de capitales creció a 306 para cubrirlos.

Dos entidades **descartadas tras investigarlas**, que es un resultado tan válido
como crearlas: el exarcado de África no hace falta —`byzantine` ya pinta Cartago
sin interrupción de 543 a 660, y sería una subdivisión contenida entera dentro
de él; lo que está mal es la fecha, porque Cartago cayó en 698— y
`croacia_medieval` ya existía y cubría 925-1102 exactamente.

**Doble pintado exacto**

| momento | grado²-año |
|---|---|
| tras la segunda verificación aplicada | 3 224,7 |
| tras 9 sustracciones y podar `kart` | **225,7** |
| tras crear las 28 entidades | 1 534,1 |
| tras cuatro pasadas de deslinde | **280,3** |

Los 225,7 intermedios son el residuo más bajo de toda la campaña.

**Estado**

civs **947** · periodos 8 700 · anillos 61 995 · estructura 0/0/0/0/0 ·
auto-intersecciones 0 (se repararon 19) · capitales 306/306 · esbuild sin
errores · doble pintado exacto **280,3 grado²-año** · 8,08 MB.

Segunda verificación: **194 de 947, el 20 %.**

**Pendiente**

- 753 entidades esperan su segunda ronda. Al ritmo actual, unas ocho rondas.
- Huecos abiertos y no cerrados: los inyuidas de Fars, Sistán, Gilán,
  Mazandarán; Bulawayo 1100-1190; la Ecuatoria de Emin Pachá; el reino de
  Islandia 1918-1944; Corea entera entre 1945 y 1948.
- Sigue creciendo la lista de entidades ausentes que nadie ha creado: Nanyue,
  Tidore, Silla antigua, Gaya, Matamba, Elam, el reino ilirio, los otomí, Awadh
  y Haiderabad post-1818, Hogbonu, los reinos gibe, wudai_shiguo.
- La tercera verificación no la ha hecho nadie. La segunda encuentra 250 errores
  por cada 96 entidades: no hay motivo para suponer que la tercera encuentre
  cero.

## Ronda 14 — segunda verificación (96 entidades de las rondas 0, 4 y 5)

Seis lotes A-F, 16 entidades cada uno. **81 con error, 15 limpias.** El método
que destapó lo que sobrevivió a la primera pasada fue el mismo en los seis
informes, y ninguno lo copió de otro: **sondeo por punto**. Volcar el anillo a
anillo en vez de la caja envolvente, y preguntar al mapa entero quién pinta un
topónimo en un año dado. Es lo que permite ver al vecino comiéndose a la
entidad, imposible mirando una entidad cada vez.

Las tres peores de cada lote, para memoria:
- `toungoo` con toda la Alta Birmania en 1510, en la fase cuyo propio rótulo
  dice "feudo de Ava". `bukhara_khanate` crece un 50% en 1876, el año exacto en
  que acaba `kokand`: heredado del vecino. `kongo` 1885-1900 sin São Salvador,
  su propia capital.
- `tanganyika` reducida a área 0.3-2.1 durante nueve fases porque toda el África
  Oriental Alemana estaba pintada de británica. `czechoslovakia` con Praga
  VACÍA en 1939 y 1942.
- `mamluk` 1250..1260 no está en Egipto: su único anillo es una franja del
  interior de Arabia, y El Cairo devuelve `ayyubid` en 1255. `almohad` pierde
  Marrakech 24 años antes de 1269, con lo que las dos fases rotuladas "Últimos
  almohades en Marrakech" no contienen un palmo de Marruecos.
- `marinid` con el mismo polígono exacto, área 36.41, para 310 años.
  `alchon_hunas` cuadruplica su área en las dos fases rotuladas "Repliegue a
  Cachemira". `visigoths` con Toledo y Córdoba en 719, ocho años después de la
  conquista.

### Dos herramientas nuevas

**`borra_periodo.js`** — borra periodos INTERIORES, dejando un hueco temporal en
medio del arco. Era el único hueco que quedaba en el juego de operaciones:
`arco.js` sólo mueve los extremos, `poda.js` también, y `resta_civ.js` con
BORRA_CONTENIDOS exige que otra entidad ya cubra el periodo entero. El caso que
se repetía ronda tras ronda es una entidad que dura de corrido a través de un
interregno documentado. Se estrenó abriendo el hueco de Yunnan 902-937 entre
Nanzhao y Dali. Parte en los bordes antes de borrar, y nunca vacía una entidad.

**`norm_anade.js`** — adaptador de formato. Los agentes de conversión escriben
`[ini, fin, poly, 'motivo']` (el formato del encargo, más legible) y `anade.js`
espera `[ini, fin, 'mas'|'menos', poly]`. Dos agentes de la ronda 13 y dos de
ésta lo detectaron por su cuenta y lo convirtieron al vuelo para sus ensayos.
Es idempotente: detecta cuál de los dos formatos recibe.

### La regresión de las cajas, y cómo se evitó repetir la de la ronda 12

Los recortes dejan residuos con los lados rectos de la caja que los cortó: el
audit pasó de 0 cajas a 10. Se redibujaron las 22 anillos afectados sobre
accidentes reales (los dhar de Tichitt-Walata-Nema para Ghana, el Kopet Dag y el
Hari Rud para los selyúcidas, el planalto da Borborema para el Brasil holandés).
Vuelta a **cero cajas**; defectos totales 49, prácticamente los 48 de partida.

La ronda 12 destruyó rótulos históricos con `sustituye.js`, cuyo cuarto
argumento escribe en `p.name`. Esta vez la instrucción al agente no fue
"reproduce el rótulo exactamente" sino **"omite el cuarto argumento"**: el
código es `if(nom)p.name=nom`, así que omitirlo conserva el rótulo. Comprobado
antes de aplicar que las 19 operaciones tenían tres elementos. Cero rótulos
perdidos. La lección: cuando una herramienta tiene un argumento peligroso, es
más seguro prohibirlo que pedir que se rellene bien.

### 44 entidades creadas

Cuatro agentes por región, para que sus polígonos no pudieran chocar. Europa:
suevos, protectorado de Bohemia y Moravia, república eslovaca, Pomerania, Berg,
ciudades hanseáticas, normandos del Loira, taifa de Menorca, guanches. África:
sosso, los cinco reinos wolof-serer (Waalo, Cayor, Baol, Sine, Saloum), soyo,
gonja, al_abwab, dongola, idrisíes del norte, biafra. Oriente: ebla, los cuatro
atabegatos selyúcidas, kara_koyunlu, tahiríes, saffaríes, imamato de Omán,
turk_shahi, República del Extremo Oriente, ejército del Don, Tannu Tuva. Asia y
América: kamboja_gauda, chandra_vanga, kutch, manipur, hanthawaddy restaurado,
sipsong_chau_tai, los tres estados de Yunnan, Vilcabamba.

Descartadas por existir ya: `kaabu`, `dagbon`, `dotawo`. La segunda República
Checoslovaca se descartó con buen criterio: no falta una entidad, falta un
periodo dentro de `czechoslovakia`.

### Dos trampas de orden que los agentes detectaron y yo habría pisado

1. **Canarias.** `castile` mete los siete anillos canarios de golpe en
   1402..1479, pero Gran Canaria cae en 1483, La Palma en 1493 y Tenerife en
   1496. Aplicar el par `['castile','guanches']` sin corregir eso habría dejado
   a los guanches contenidos enteros dentro de castile, y `resta_civ` los habría
   borrado. Se retiraron primero las tres islas de ese tramo. De paso salió un
   hallazgo que no estaba en ningún informe: `almoravid` pintaba Canarias **y
   Madeira** entre 1091 y 1145, el mismo anacronismo atlántico que ya se había
   limpiado en `almohad`.
2. **Yunnan.** Los tres estados de 902-937 caen enteros dentro de
   `nanzhao_dali`. `resta_civ` no servía. El agente avisó: "si ese paso no se
   hace, no se creen las tres". De ahí salió `borra_periodo.js`.

### Cifras

| | antes | después |
|---|---|---|
| civilizaciones | 947 | **991** |
| periodos | 8.700 | 9.200 |
| anillos | 61.995 | 64.386 |
| doble pintado exacto | 280.3 | **244.8** grado²-año |
| cajas | 0 | **0** |
| defectos de forma | 48 | 49 |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| auto-intersecciones | 0 | 0 |
| capitales | 306/306 | 306/306 |

El doble pintado BAJA pese a añadir 44 entidades y 500 periodos. Subió a 1.109
tras aplicar las operaciones y a 1.212 tras crear las entidades; las dos veces
lo devolvieron a su sitio los pares de `resta_civ`. Los seis pares que los
agentes habían marcado DUDOSO resultaron ser casi todo el exceso: `persia` /
`turk_shahi` sola valía 539 grado²-año.

**Segunda verificación: 290 de 991 (29.3%).**

### Pendiente

- Rótulos: los seis periodos de `alodia` llevan todos el mismo texto, incluido
  el de 550..580, que habla de una secesión de 1276.
- `denmark` desde 1397: le falta la franja continental noruega entre lat 65 y
  69 (Helgeland, Salten, Ofoten). Mi contorno de 1380..1397 sí la cubre, así que
  Nordland se enciende en 1380 y se apaga en 1397.
- Tres rectángulos pequeños en `kongo` (1885..1900, 1900..1910, 1910..1914) por
  debajo del umbral de área del audit.
- **`tierra.enTierra` tiene la paridad invertida en la banda lat 66-68 sobre
  Escandinavia**: da tierra en mar abierto a 8E/67N y agua en Mo i Rana. Sólo
  afecta a `esMar` del audit, no a `recorte.aTierra`, pero puede estar
  enmascarando cajas oceánicas en el norte de Europa. Conviene mirarlo.
- Sin aplicar, el hallazgo más grave que queda: el imperio de Tigranes en
  `armenia_ant` (Antioquía devuelve "nadie" de -100 a -66). Exige partir
  -95..-66 y ninguna operación legítima abre ese corte.

## Ronda 18 — RESCATE. Los hallazgos que el encargo tiraba

No es una ronda de verificación. No sube el porcentaje verificado. Es la ronda
que arregla un defecto del método que llevaba catorce rondas funcionando.

### El defecto

El encargo de conversión listaba cinco operaciones y tenía esta regla:

> "Si el informe pide crear una entidad nueva, partir una en dos, o mover un
>  corte intermedio, va a descartes: son operaciones de otra pasada."

Esa otra pasada nunca llegó. Y `parte.js` —que parte periodos en los años que se
le den, duplicando la geometría— existía desde el principio, en el mismo
directorio, sin que se la ofreciéramos a nadie. Cada vez que un verificador
demostraba que una entidad cambia de territorio en un año concreto y el mapa no
tenía corte ahí, el hallazgo se tiraba. Sólo en la ronda 17 fueron más de veinte.

Es la tercera vez que aparece el mismo patrón, y conviene decirlo sin adornos:
- rondas 1-12, sólo se podía QUITAR, así que todo "falta territorio" se descartaba;
- rondas 9-10, el instrumento de medida no escalaba y no se podía comprobar nada;
- rondas 1-17, no se podía PARTIR, así que todo "cambia en el año X" se descartaba.

Las tres veces el límite no estaba en la historia ni en la geometría: estaba en
lo que el encargo permitía pedir. Conviene revisar el encargo antes que el mapa.

### Lo recuperado

Seis agentes sobre doce rondas de informes conservados (v3 a v17). Aplicado:

| | |
|---|---|
| cortes temporales nuevos (`parte.js`) | **224** en 128 entidades |
| recortes de caja | 5 |
| retiradas | 17 |
| adiciones | 21 |
| rótulos | 591 |

Y unos **200 candidatos descartados por estar ya resueltos**, comprobados uno a
uno con ver.js. Ese descarte es el trabajo real del rescate: los informes son de
rondas viejas y el mapa ha cambiado enormemente. Un hallazgo aplicado dos veces
hace más daño que uno no aplicado.

Hallazgo colateral del lote B: al aplicarse el repliegue omeya de 740 sin mover
el salto de `bereberes_magreb`, que seguía en 750, Fez, Tánger, Tremecén,
Siyilmasa y Marrakech llevaban **diez años vacíos, de 740 a 750**. Tapado.

### Dos destrozos propios, encontrados y reparados

**1. Los rótulos de la ronda 17.** `nombres.js` tiene dos modos: con `PARCIAL=1`
la tabla son correcciones sueltas; sin la variable, la tabla se entiende como
partición completa del arco y el primer tramo se estira hacia atrás hasta el
inicio de la entidad, el último hacia delante hasta el final. El encargo describía
a los agentes el modo PARCIAL, ellos escribieron tablas sueltas, y yo las apliqué
sin poner la variable. Resultado en el mapa entregado: `makuria` con "Turan-Shah
toma Qasr Ibrim en 1173" en su fase **543..650**; `maya` con "Mayapán somete
Yucatán" en **-2000..-1800**; `khazar` con "Oleg toma Kiev en 882" en **650..750**;
`carthage` con "Roma toma Panormo (254)" en **-814..-550**. Setenta y siete
entidades. Lo detectó el agente de rescate del lote A, no yo.

Reparado con `repara_nombres.js`, escrito para esto: devuelve los rótulos desde
una copia anterior casando los periodos **por punto medio**, no por (start,end),
porque desde entonces se han partido y fundido. 683 rótulos devueltos, y las
tablas legítimas de la ronda 17 reaplicadas con `PARCIAL=1`.

**2. El corredor del Nilo de `kush`.** El rescate añadió a la dinastía XXV el
valle de Asuán a Menfis con una caja, y era el único rectángulo del mapa. Al
redibujarlo con `sustituye.js` desapareció el núcleo nubio: esa herramienta
REEMPLAZA todos los anillos del periodo, y esa fase tenía dos. De ahí salió
`copia_anillo.js`.

### Cuatro herramientas nuevas

- **`repara_nombres.js`** — devuelve rótulos desde una copia, casando por punto medio.
- **`copia_anillo.js`** — copia anillos entre fases de la misma entidad. Repara lo
  que `sustituye.js` borra cuando el periodo tenía más de un anillo.
- **`tierra.js` reescrito** — ver abajo.
- (`borra_periodo.js` y `norm_anade.js` son de la ronda 17.)

### El fallo de la máscara de tierra

`enTierra()` tenía DOS fallos superpuestos. Decía que Mo i Rana, Tromsø y toda
Laponia eran agua, y que el mar abierto a 8E/67N era tierra.

1. **Paridad global**: contaba cuántos anillos del mundo entero contenían el
   punto y miraba la paridad del total. La paridad sólo vale DENTRO de un
   polígono, entre su contorno y sus propios agujeros.
2. **El antimeridiano**, que es el grave. El contorno euroasiático cruza la línea
   de fecha en Chukotka, así que el anillo tiene dos saltos de casi 360 grados
   entre vértices consecutivos. El trazado de rayo los trata como aristas reales
   que atraviesan el globo y cuenta cruces falsos en toda latitud comprendida en
   el salto. **`lib.pip` es correcto**: lo que no era válido era darle un anillo
   que envuelve el planeta. polygon-clipping falla igual y por lo mismo, así que
   no servía de recambio.

Arreglado partiendo los anillos en la línea de fecha antes de usarlos. Batería de
52 puntos de control en cinco continentes: los únicos desacuerdos que quedan son
Dubái, Manhattan y el golfo de Anadyr, que son la trampa de resolución ya
documentada (1:50 M), la misma de Estambul y Copenhague.

Sólo afectaba a `audit.js` y a los sondeos por punto de los agentes.
`recorte.aTierra` no lo usa, así que la geometría del mapa nunca estuvo mal por
esta vía. El audit no destapó cajas nuevas al arreglarlo, pero los sondeos de las
próximas rondas ya son fiables en el norte de Europa.

### Cifras

| | ronda 17 | ronda 18 |
|---|---|---|
| civilizaciones | 991 | 991 |
| periodos | 9.200 | **9.431** |
| anillos | 64.386 | 65.489 |
| doble pintado exacto | 244.8 | **243.7** grado²-año |
| cajas | 0 | **0** |
| defectos de forma | 49 | 50 |
| entidades con todos los rótulos iguales | 33 | **16** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Pendiente, y ahora ordenado por gravedad

1. **`italy` y Etiopía 1936-1941.** Addis Abeba sigue siendo `ethiopia` en 1937 y
   1940. No se puede aplicar con las herramientas de caja porque `quita_caja` no
   vacía un periodo. Necesita `borra_periodo` + `crea_periodo`. Es el hallazgo
   más grave sin aplicar.
2. **`venice`**: Nauplia, Negroponte y Corfú salen VACÍO pese a que la ronda 17
   los añadió. No es problema de corte: es la máscara o el tallado. Investigar.
3. **`armenia_ant`**: el imperio de Tigranes. Ahora que existe `parte.js` en el
   juego, ya se puede partir -95..-66 y aplicarlo.
4. La cola de entidades a crear, que el rescate ha engordado mucho: wudai_shiguo,
   Nanzhao propiamente dicho, Ryukyu, Kazán, Kosovo, Artsaj, la RSI, Yarkand,
   Siak, el emirato de Abd el-Kader, el reino de Islandia 1918-1944, los estados
   bálticos medievales, y una veintena de pueblos americanos y africanos.
5. `denmark` desde 1397: falta la franja continental noruega entre lat 65 y 69.
6. Los tres rectángulos pequeños de `kongo` bajo el umbral del audit.

**Segunda verificación: sigue en 290 de 991 (29.3%).** El rescate no la mueve, y
no debe: lo que ha hecho es que las catorce rondas anteriores valgan lo que
costaron.

## Ronda 19 — los dos casos pendientes: el Egeo veneciano y el Cuerno de África

Corta y quirúrgica. Los dos hallazgos que la ronda 18 dejó anotados como los más
graves sin aplicar, y los dos resultaron enseñar algo distinto de lo esperado.

### Venecia en Grecia: no era un fallo de instrumento

La sospecha era otro fallo de la máscara de tierra. No lo era, y la investigación
separó el caso en tres cosas que parecían una:

1. **Corfú: falsa alarma.** La ciudad de Corfú es píxel de agua a 1:50 M. El
   interior de la isla SÍ era veneciano desde 1386. La trampa documentada de
   siempre —Estambul, Copenhague, Dubái, Manhattan, Modón, Mogadiscio, Kismaayo—.
   Vale la pena decirlo: de siete "huecos" denunciados en esta ronda, **cuatro
   eran píxeles de agua costeros**. Antes de dar por bueno un hueco en un puerto,
   hay que sondear un punto tierra adentro.

2. **Eubea: el tallado abriéndole un agujero a Venecia.** `ducado_atenas` tenía
   un anillo de área 0,095 sobre Eubea central —el ducado nunca gobernó la isla:
   fue la triarquía lombarda bajo tutela veneciana desde 1209 y veneciana del
   todo desde 1390—. Al tallar, Venecia perdía el centro de la isla y conservaba
   el norte y el sur. Es el mismo mecanismo del hueco de São Salvador en `kongo`
   de la ronda 17: **un anillo intruso pequeño parte en dos al vecino legítimo**.

3. **La Morea: cadena de errores encadenados.** Corón y Modón, los dos ojos de la
   República, venecianos sin interrupción de 1207 a 1500, los pintaba `byzantine`.
   Nauplia (1389-1540) y Argos (1394-1463) salían VACÍAS. Y lo que Venecia perdía
   —Negroponte en 1470, Corón y Modón en 1500, Nauplia en 1540— no lo ganaba
   nadie: tres huecos más.

Y una lección de método que me costó dos intentos: la primera tanda de adiciones
a `venice` **quedó en nada** porque el otomano ya pintaba ese suelo y `anade`
talla siempre en contra de la entidad procesada. Llevo toda la campaña avisando
de esto a los agentes y lo pisé yo mismo. Hubo que retirar primero al otomano.

Para Eubea otomana desde 1470 no se dibujó un contorno nuevo: se **reutilizó el
anillo exacto** que Venecia tenía antes de perderla. Una isla no debe cambiar de
forma al cambiar de dueño. Mismo criterio para el África Oriental Italiana y para
Eritrea.

Resultado, comprobado punto por punto en 1300/1400/1450/1480/1520/1700: Eubea
veneciana hasta 1470 y otomana después; Nauplia veneciana 1389-1540; Corón y
Modón venecianos hasta 1500; Corfú desde 1386; Creta hasta 1669. Tebas y Atenas
sin tocar, como control.

### Etiopía 1936-1941: el periodo que no se podía borrar

El mapa pintaba Etiopía de corrido durante la ocupación italiana, **con un rótulo
que ya decía "Ocupación italiana dentro del África Oriental Italiana"**. El texto
llevaba rondas siendo correcto y la geometría contradiciéndolo, y nadie lo veía
porque quien revisa una entidad sola lee el rótulo y le da la razón.

No se podía arreglar con las herramientas de caja: `quita_caja` nunca vacía un
periodo —conserva los anillos si el resultado sería vacío—, así que retirarle el
país entero no hacía nada, y la adición a Italia se tallaba contra Etiopía. Es
exactamente el bloqueo que el agente del lote C de la ronda 18 diagnosticó y no
pudo resolver. Con `borra_periodo.js`, escrito en la ronda 17 para Yunnan, son
dos órdenes.

De paso, el sondeo destapó dos huecos que nadie había denunciado:
- **Eritrea italiana**: Asmara era italiana pero **Massaua y Keren salían VACÍAS**
  desde 1890. Los anillos eritreos de `italy` estaban dibujados con poca holgura
  y entre ellos quedaban franjas de nadie.
- **Eritrea británica 1941-1952**: la Administración Militar Británica no existía.
  Once años en blanco entre la rendición italiana y la federación con Etiopía.

Somalia se comprobó y está bien: Mogadiscio y Kismaayo son píxeles de agua, pero
Baidoa y el interior siguen la secuencia correcta geledi → italy → somalia.

### Cifras

| | ronda 18 | ronda 19 |
|---|---|---|
| civilizaciones | 991 | 991 |
| periodos | 9.431 | 9.451 |
| anillos | 65.489 | 65.828 |
| doble pintado exacto | 243.7 | **243.2** grado²-año |
| cajas | 0 | 0 |
| defectos de forma | 50 | 50 |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Lo que dejan estos dos casos para el método

Los dos se encontraron por **sondeo por punto sobre varias fechas de una misma
plaza**, no por revisar una entidad. Ninguna verificación entidad-por-entidad los
habría encontrado: Venecia parecía correcta mirándola sola, y Etiopía tenía el
rótulo bien puesto. Conviene que las próximas rondas incluyan un pase de
**plazas-testigo**: una lista de ciudades históricamente disputadas, sondeadas en
una decena de fechas cada una, comparando contra la cronología conocida. Es
barato y encuentra lo que la revisión por entidad no puede ver.

## Ronda 20 — plazas-testigo. El método que ve lo que el otro no puede

La ronda 19 dejó una conclusión: sus dos hallazgos no los habría encontrado
ninguna verificación entidad-por-entidad, porque uno estaba en la RELACIÓN entre
dos entidades y el otro tenía el rótulo correcto tapando la geometría mala. De
ahí salió `plazas.js` y esta ronda.

### El instrumento

Se pregunta al revés: no "qué territorio tiene esta entidad" sino **quién
gobernaba esta plaza en estos años**. Seis agentes construyeron 230 plazas
disputadas con 2.704 sondeos, cada una con la cronología real que sostiene el
`espera`, no con lo que dijera el mapa.

Y hubo que arreglar el instrumento a mitad de camino, porque el lote F encontró
una **segunda trampa, más frecuente que la del píxel de agua**: puntos que SÍ son
tierra según la máscara y que aun así no pinta nadie, porque los anillos de las
civilizaciones están más generalizados que la costa. En su lote sólo 2 plazas de
41 eran píxel de agua, pero **15 eran esto** — Quebec, Montreal, Nueva York,
Veracruz, La Habana, Montevideo, Sitka, Suva, Apia, Numea, Auckland—, todas
resueltas moviéndose una décima de grado. La sonda ahora distingue tres cosas:

  ··  hueco real: no pinta nadie, ni alrededor
  ~~  contorno generalizado: no pinta nadie aquí pero sí a 0,1-0,3 grados
  ==  doble pintado

El arreglo eliminó de golpe **187 huecos falsos y 100 discrepancias falsas**. Sin
él, la mitad de esta ronda habría sido perseguir fantasmas. Y no es cosmético:
un agente reescribió su lote entero al re-sondear, y descubrió que la costa sur
de Crimea, que su informe daba por vacía 300 años, era contorno generalizado.

### Lo encontrado

522 discrepancias reales y 126 huecos, contra 230 plazas. Los mayores:

- **`france` no toca los Grandes Lagos en ningún año.** El mapa entregaba a Gran
  Bretaña en 1763 lo que jamás dio a Francia: Detroit, Michilimackinac, Niágara,
  Vincennes y Kaskaskia salían indígenas o vacíos en 1700-1760 y pasaban a
  `british` de golpe en 1765.
- **Malaca, 360 años con el dueño equivocado**: `malayos` de 1520 a 1879, sin
  Portugal, sin Holanda y sin el arranque británico. El error estaba enmascarado
  porque lo tapaba una capa de pueblos: revisando `portugal` o `dutch_empire` por
  separado no se veía nada.
- **Hueco mongol en el norte de China 1234-1260**: Kaifeng, Xi'an, Luoyang, Jinan
  y Lanzhou vacíos porque a `mongol` nunca se le añadió lo conquistado a los Jin,
  aunque Pekín y Taiyuan sí salían.
- **Los presidios norteafricanos**, más de 800 años falsos entre Ceuta, Melilla,
  Orán y Tánger; y los tres primeros en blanco desde 1970.
- **La franja de Antioquía y el Hatay**, unos 600 años sin dueño porque todas las
  entidades islámicas cortan su borde occidental medio grado al este de la costa.
- **Francia al este del Mosa desde 987**: Estrasburgo, Metz, Nancy y Besançon
  francesas siglos antes de tiempo. Alsacia fue imperial hasta 1648/1681, los
  Tres Obispados hasta 1552, Lorena hasta 1766, el Franco Condado hasta 1678.
- **Luisiana española 1763-1783 y el Río de la Plata sin España desde 1783**, los
  dos por un mismo periodo mal redibujado, `spanish` 1783..1797, que gana el
  Misisipi y pierde el Plata. Y de paso infló dos culturas para tapar el hueco:
  `pampa_pueblos` salta de 2,9 a 37,9 de área exactamente en 1783..1810 y vuelve
  a 2,8 en 1810.
- **El Imperio latino pintando Nicea en 1204-1225**, la capital de sus enemigos:
  el patrón de Eubea otra vez.
- Y el caso `ethiopia` repetido cinco veces en cinco continentes: **el rótulo
  correcto y la geometría contradiciéndolo**. `yemen` con dos periodos rotulados
  "primera ocupación otomana" y "Adén británico" pintando Yemen de corrido;
  `dutch_empire` con un periodo rotulado "Ocupación japonesa de las Indias
  Orientales" pintando Batavia de neerlandés; `ogaden_pueblos` con "Egipto en
  Harar y conquista de Menelik"; `modern_china` con "Macao 1999" y ningún anillo
  sobre Macao.

### Lo aplicado

| | |
|---|---|
| cortes temporales | 29 |
| arcos | 3 |
| retiradas | 69 cajas |
| adiciones | 152 polígonos |
| rótulos | 22 tramos |

Los seis agentes recibieron instrucción explícita de PRIORIZAR y descartar sin
pena: 522 hallazgos no caben en una ronda y aplicar mal es peor que no aplicar.
Descartaron más de la mitad, cada uno con su motivo escrito.

**Resultado sobre las mismas 230 plazas: discrepancias de 522 a 290, huecos
reales de 126 a 79.** Y el doble pintado BAJA de 243,2 a 224,1: las adiciones
llenaron huecos sin pisar a nadie.

### Dos herramientas nuevas

- **`redibuja_anillo.js`** — sustituye UN anillo concreto, identificado por su
  caja, sin tocar los demás ni el rótulo. `sustituye.js` reemplaza todos los
  anillos del periodo, que es lo que borró el núcleo nubio de `kush` en la ronda
  18, y su cuarto argumento escribe en p.name, que destruyó rótulos dos veces.
  Esta hace lo mínimo. Identifica por caja y no por índice porque los índices
  bailan en cuanto otra operación toca la entidad.
- **`plazas.js`** — la sonda descrita arriba.

### El arreglo de tierra.js destapó lo que se predijo

En la ronda 18 quedó anotado que la máscara rota "puede estar enmascarando cajas
oceánicas". Lo hacía: al arreglarla apareció un rectángulo de 4 vértices en la
península del Niágara, en `france` 1608-1649, que `esMar` excluía por creerlo
océano siendo 100% tierra. Redibujado.

### Cifras

| | ronda 19 | ronda 20 |
|---|---|---|
| civilizaciones | 991 | 991 |
| periodos | 9.451 | 9.705 |
| anillos | 65.828 | 71.130 |
| doble pintado exacto | 243.2 | **224.1** grado²-año |
| cajas | 0 | **0** |
| defectos de forma | 50 | 50 |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Pendiente

1. **La cola de creación se ha disparado**, y ahora bloquea correcciones ya
   escritas: Escocia, Malta, Moldavia, Valaquia, Georgia medieval, Armenia
   bagratuní, Karaman, hospitalarios de Rodas, Lusignan de Chipre, hotakíes,
   Hiyaz, shirvanshahs, Cachemira, Arcot, Singapur, Vietnam del Sur, Ryukyu,
   Jin Posteriores, Trinidad y Tobago, Antigua y Barbuda. Es la siguiente ronda
   natural: sin ellas no se pueden aplicar decenas de recortes ya redactados.
2. **`kara_koyunlu` está duplicada**: existe la entidad propia creada en la ronda
   17 y además `aq_qoyunlu` rotula sus periodos 1405-1468 como Kara Koyunlu.
   Pide `funde_civ.js`, no una caja.
3. El Báltico oriental (Reval, Viborg, Carelia) — 300 años mal atribuidos, pero
   exige verificar seis entidades a la vez.
4. Las 290 discrepancias y 79 huecos que quedan, con sus descartes razonados en
   los seis informes de /tmp/v20/.

### Lo que este método enseña sobre los diecinueve anteriores

Ninguno de los hallazgos grandes de esta ronda era invisible: estaban ahí, en
mapas que se han revisado dos veces. Lo que pasa es que **la pregunta que se
hacía no podía verlos**. Revisar `portugal` no enseña que Malaca esté mal si el
hueco lo tapa `malayos`; revisar `mongol` no enseña que falte el norte de China
si Pekín sí sale. Conviene alternar los dos métodos: la revisión por entidad para
la coherencia interna de cada civilización, y las plazas-testigo para las
costuras entre ellas, que es donde de verdad vive el error.

## Ronda 21 — creación. Desbloquear lo que estaba escrito y no se podía aplicar

La ronda 20 dejó un cuello de botella claro: decenas de correcciones redactadas,
documentadas y correctas que NO se podían aplicar porque abrirían huecos sin
dueño. Esta ronda es ese cuello.

### El duplicado de los Koyunlu, que no era lo que parecía

Se venía anotando que `kara_koyunlu` (creada en la ronda 17) duplicaba a
`aq_qoyunlu`, y la conclusión era fundirlas. El sondeo dijo otra cosa: la
geometría ya estaba bien repartida —Tabriz y Van son de la Oveja Negra hasta
1468, Diyarbakir de la Blanca siempre— porque un `resta_civ` de la ronda 17 lo
había resuelto. Lo que quedaba mal eran **los rótulos**: `aq_qoyunlu` contaba la
historia de la Oveja Negra en sus fases 1378-1468, y su propio nombre seguía
siendo "Turcomanos (Kara y Ak Koyunlu)", de cuando una sola entidad modelaba las
dos confederaciones. Devuelta su historia (los Bayandur, Kara Yülük Osman, Uzun
Hasan) y renombrada. Más un error real: Bagdad, que fue de la Oveja **Negra** de
1411 a 1466 y el mapa daba a la Blanca.

Lección: un "duplicado" puede ser sólo un rótulo desfasado. Sondear antes de
fundir entidades, que es irreversible.

### 47 entidades creadas

Seis agentes por regiones para que sus polígonos no pudieran chocar. El mapa pasa
de **991 a 1.038 civilizaciones**.

Europa: Escocia, la Orden de Malta, la Malta independiente, Ragusa, Prusia Real,
la Estonia danesa, la Confederación Helvética, la RSI, Siracusa.
Balcanes y Cáucaso: Moldavia, Valaquia, Georgia medieval, la Armenia bagratuní,
Karaman.
Oriente: los hospitalarios de Rodas, los Lusignan de Chipre, los hotakíes, el
Hiyaz, los shirvanshahs, Tsongkha.
India y sureste: Cachemira, Arcot, Singapur, Vietnam del Sur, Jaffna, Sagaing,
Pinya, Siak, Kamata, Dimasa, Jaintia.
Asia oriental: Ryukyu, la administración estadounidense de Okinawa, los Jin
Posteriores, Zhongshan, Nanyue, Silla antigua, Gaya.
África y América: Somalilandia, Denkyira, Mamprugu, Matamba, Hogbonu, los reinos
gibe, los otomíes, Trinidad y Tobago, Antigua y Barbuda.

**Comprobación:** 24 capitales nuevas sondeadas en 100 años distintos —
**cero discrepancias, cero huecos**. Cada entidad tapa el agujero que se le pidió.

### Trece descartes, y por qué importan

Nueve entidades pedidas **ya existían con otro nombre**, y es la quinta, sexta y
séptima vez que pasa en esta campaña (antes: kaabu, dagbon, dotawo):

- `ducado_prusia` es el primer periodo de `prussia_germany`, con la misma caja.
- `iliria` existe como `ilirios`; Scodra y Rhizon sondeadas doce veces, sin un
  hueco.
- `kazan_kanato` existe como `kazan_khanate`: la ronda 12 hizo lo que dijo.
- `hanthawaddy_pegu` es `hanthawaddy`, con el arco exacto pedido.
- `tidore` está dentro de `ternate`, cuyo nombre es literalmente "Ternate y
  Tidore".
- `matamba` estaba en `ndongo`, llamada "Ndongo y Matamba" — pero sólo hasta
  1671, así que sí había 73 años de hueco y se creó igual.
- `yarkand_kanato`: `moghulistan` tiene doce periodos rotulados "Kanato de
  Yarkand".
- `wudai_shiguo`: `six_dynasties` tiene cinco periodos ya rotulados "Cinco
  Dinastías y Diez Reinos".
- `mandato_siria` e `irak_reino`: `france` e `iraq` ya los pintan y lo dicen en
  el rótulo.

**Esto pide herramienta.** Nueve descartes por duplicado en una sola ronda no es
mala suerte: es que buscar por id no basta y nadie busca por nombre. La próxima
vez que se cree, conviene un `busca_civ.js` que case por id, por nombre, por
wikiTitle y por caja+arco, y que se corra ANTES de escribir nada.

### El pico de doble pintado, y la advertencia que no seguí

Tras crear, el doble pintado saltó a **1.279,8** grado²-año, el mayor desde la
ronda 9. El 60% era un solo par: `poland_lithuania` contra `prusia_real`, 757,6.
El agente que creó Prusia Real lo había advertido con todas las letras —
"recomiendo aplicarlo sólo en 1466-1569; restar tres siglos deja a Polonia sin
costa báltica"— y yo dejé el par fuera de la primera tanda en vez de acortar la
entidad. Prusia Real fue provincia autónoma con dieta y moneda hasta que la Unión
de Lublin (1569) la incorporó a la Corona; después la pinta Polonia. Podada a
1466-1569, el par se aplica sin daño.

Tras nueve tandas de `resta_civ` —83 pares Estado contra Estado y 10 de área
cultural cediendo ante Estado— queda en **236,9**, sólo 12 por encima de la ronda
20 y con 47 entidades más.

### Efecto sobre las plazas-testigo de la ronda 20

Sin volver a tocar ninguno de aquellos hallazgos, sólo por existir las entidades:
huecos reales de **79 a 51**. Las discrepancias apenas se mueven (290 a 297,
dentro del ruido), lo cual es esperable: crear una entidad cierra huecos, no
corrige atribuciones. Las atribuciones son la ronda siguiente, y ahora sí se
pueden aplicar.

### Cifras

| | ronda 20 | ronda 21 |
|---|---|---|
| civilizaciones | 991 | **1.038** |
| periodos | 9.705 | 10.193 |
| anillos | 71.130 | 73.391 |
| doble pintado exacto | 224.1 | 236.9 grado²-año |
| huecos en las plazas de la ronda 20 | 79 | **51** |
| cajas | 0 | **0** |
| defectos de forma | 50 | 51 |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Pendiente, ordenado

1. **Aplicar lo que esto desbloquea.** Cada agente dejó su lista: el recorte de
   Cachemira a `ghaznavid`, retrasar a 1801 la anexión británica del Carnatic,
   recortar el Ceilán portugués a Kotte, sacar a `bhutan` de Cooch Behar, el
   recorte de `bulgaros` sobre Muntenia, el de `british` al sur del Tweed antes
   de 1603, `ottoman`→`france` en Alejandreta, `saudi_arabia` hasta el mar Rojo
   (ya hecho), y una treintena más.
2. **Huecos grandes destapados de paso**, ninguno en los lotes de nadie:
   - **Vietnam del Norte falta entero**: Hanói VACÍO 1954-1976. Los vértices del
     paralelo 17 están calculados en el informe D.
   - **Anatolia 1308-1350 no tiene ni un beylicato**: Ankara, Kayseri, Sivas y
     Kütahya vacíos. Faltan eretnidas, Germiyan y Candar.
   - **Barbados no existe**: Bridgetown vacío en 1900, 1966, 2000 y 2025.
   - **Ginebra**: república independiente 1536-1798, hoy pintada de Saboya.
   - `switzerland` tiene dos periodos con área 0.0 (astillas degeneradas) y toda
     Suiza sale `holy_roman_empire` hasta 1647.
   - Fuzhou VACÍO en 900 y 978; la punta de Liaodong mal recortada por todos.
3. **Decisiones de modelo, no errores**, que convendría zanjar: si `ilirios`
   debe dejar de ser `kind:'cultura'` describiendo un Estado con rey y dinastía;
   si Ryukyu vasallo debe pintarse bajo Satsuma 1609-1879; si desgajar los Diez
   Reinos de `six_dynasties`.

## Ronda 22 — aplicar lo desbloqueado y cerrar los huecos grandes

La ronda 21 creó 47 entidades para desatascar correcciones que llevaban rondas
escritas sin poder aplicarse. Ésta las aplica, más los siete huecos grandes que
habían ido apareciendo de paso y no eran de nadie.

Primero hubo que **escribir en disco las listas de lo desbloqueado**: vivían sólo
en los mensajes de vuelta de los agentes de la ronda 21, que es un sitio pésimo
para guardar trabajo pendiente. Ahora están en `/tmp/v22/DESBLOQUEADO.txt`, con
la fuente de cada punto.

### La mitad ya estaba resuelta, y eso es una buena noticia

Los cuatro agentes comprobaron cada punto contra el mapa de hoy antes de
escribirlo, como se les pidió, y **veinte de los cuarenta ya estaban hechos**:
Cachemira, el Carnatic, Jaffna, Shillong, Cooch Behar, Suceava, Hotin, Tiflis,
Kutaisi, Bucarest, Xining, Metztitlán, el Caribe británico, tres cuartas partes
de Corea y casi todo Zhongshan. Las rondas 20 y 21 habían resuelto más de lo que
sus propios informes registraban.

Eso vale la pena mirarlo de frente: si no se comprueba, se reaplica, y reaplicar
hace más daño que no aplicar.

### Correcciones al enunciado que hicieron los agentes

Ninguno se limitó a ejecutar. Los cuatro corrigieron lo que se les pedía:

- **E1 (Escocia).** El encargo decía "recortar antes de 1603". Falso hoy:
  `british` sólo desborda en UN periodo, 927..1034. Y `scotland` no recogía nada
  porque empezaba en 1034, así que hubo que estirarla a 900 para empalmar con
  `pictos_caledonios`. Además la escalera de cajas Solway-Cheviots-Tweed **no
  servía** —el contorno escocés está generalizado y dejaba 51 muestras de solape
  en Galloway— y se sustituyó por un `resta_civ`, que da 0 y 0.
- **E5 (Suiza).** No eran dos periodos de área cero sino **tres**: alguien había
  partido en 1481.
- **E6 (Cartago).** Ya no pintaba Hímera, sólo Acragante. Y "lo recoge
  `siracusa`" era falso antes de -405: su anillo llega a lon 13.7 y Acragante
  está en 13.58. Quien lo recoge es `grecia_antigua`.
- **H4 (Ginebra).** No la pintaba `savoy` sino `holy_roman_empire`, y en 1700 y
  1790 el punto estaba vacío del todo.
- **H5 (Fuzhou).** No era `six_dynasties`, que sí llega a la costa de Min. Los
  que no llegan son `tang` antes del 907 y `song` desde el 960: 287 celdas de
  Fujian sin dueño, con Fuzhou, Quanzhou, Zhangzhou, Putian y Ningde dentro.
- **H6 (Liaodong).** **Falso positivo**: era contorno generalizado, no hueco. Las
  mismas 77-85 celdas vacías salen en 1880 y en 2000 que en el tramo del arriendo.
  El agente lo demostró contando celdas y no escribió nada.
- **H7 (Báltico).** Riga no tenía hueco: `teutonic_order` la cubre desde 1250. La
  sospecha sólo valía para Dorpat.

### Vietnam del Norte: una decisión de modelo, no de geometría

El encargo ofrecía crear `vietnam_norte`. El agente eligió **alargar `vietnam`
hacia atrás hasta 1954**, y el argumento es bueno: la RDV y la RSV son el mismo
Estado —misma capital, mismo gobierno, misma personalidad jurídica— y 1976 fue un
cambio de nombre más la absorción del Sur, no una fundación. `vietnam_sur` sí es
entidad aparte porque la República de Vietnam se extinguió. Crear el Norte
habría forzado una discontinuidad falsa y habría sido el décimo caso de "crear
algo que ya existe". Arranca en 1954 y no en 1945 porque Ginebra es la fecha con
geometría defendible; la RDV guerrillera del Việt Bắc no se puede dibujar.

De paso: `france` figuraba retirándose en 1956, pero salió de Hanói en octubre de
1954 y de Haiphong en 1955.

### Los beylicatos de Anatolia

Doce entidades para el hueco H2: eretnidas, Burhaneddin, Germiyan, Candar,
Aydinoglu, Saruhan, Karesi, Menteşe, Hamid, Tekeoğlu, Dulkadir y Ramazan. Ankara,
Kayseri, Sivas y Kütahya salían vacíos entre 1308 y 1350. Un barrido fino de
300.492 puntos deja los vacíos de Anatolia en **116.552 → 60.715**, sin un solo
solape nuevo.

Quedan anotados dos huecos vecinos que no cabían: la Cilicia armenia (Adana vacío
1198-1352) y Anatolia oriental 1335-1378, donde faltan Mutahharten y los
artúquidas.

### Barbados y el uso legítimo de NOCARVE

El agente del lote A descartó Barbados colonial por coste, con razón: `british`
tiene 130 periodos en esa ventana y un `anade` con tallado sobre esa entidad es
lo que la ronda 12 pagó caro. Pero el tallado ahí no hacía falta: comprobado
punto a punto en seis años que la isla está **vacía** salvo un rastro kalinago de
1630, que se retiró antes. Aplicado con `NOCARVE=1`.

Conviene dejar dicho por qué esto no contradice la ronda 9, donde 133 adiciones
con NOCARVE llevaron el doble pintado a 3.390.511 grado²-año: **la diferencia es
haber verificado el destino vacío primero**. NOCARVE no es un atajo de
rendimiento, es una afirmación sobre el mapa —"aquí no hay nadie"— y hay que
poder demostrarla.

### Cifras

| | ronda 21 | ronda 22 |
|---|---|---|
| civilizaciones | 1.038 | **1.054** |
| periodos | 10.193 | 10.257 |
| anillos | 73.391 | 73.973 |
| doble pintado exacto | 236.9 | 238.2 grado²-año |
| huecos en las plazas de la ronda 20 | 51 | **51** |
| cajas | 0 | **0** |
| defectos de forma | 51 | 51 |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

Las 20 plazas de control de esta ronda: **cero discrepancias, cero huecos**.

### Pendiente

1. Las **297 discrepancias de atribución** de las plazas-testigo, que siguen
   siendo el grueso. Ahora sin excusas de entidad ausente.
2. **Huecos nuevos apuntados de paso**: Trichinópoli y Madurai vacíos 1736-1780;
   Silchar 1600-1650; Guwahati en 1450; Fuzhou sigue abierto en 1300, 1400 y 1500
   (`yuan` y `ming` tienen el mismo contorno corto que tenían `tang` y `song`);
   Feroe, Santa Lucía y Granada; la isla de Man 1100-1400; Adjara bajo `persia`
   1588-1801; Cilicia armenia; Anatolia oriental 1335-1378.
3. **D4 (acortar `ava`) sigue bloqueado**, y ahora se sabe por qué: borrar sus
   periodos 1313-1364 abre 230 celdas vacías de 493, porque `pinya` y `sagaing`
   cubren 3 y 2 grados² frente a los 12-15 de `ava`. Requisito previo: redibujar
   `pinya` y devolver a `shan` y `tibetano_birmanos` lo que hoy les recorta `ava`.
4. **Decisiones de modelo pendientes**, que no son errores: si `ilirios` debe
   dejar de ser `kind:'cultura'`; si Ryukyu vasallo se pinta bajo Satsuma
   1609-1879; si se desgajan los Diez Reinos de `six_dynasties`; y si el Imperio
   Otomano y la República de Turquía deben ser dos entidades en vez de una
   (`ottoman` va de 1299 a 2025, con las fases posteriores a 1923 ya rotuladas
   "República de Turquía").
5. `jin_posteriores` conserva el `wikiTitle` "Dinastía Jin posterior (1616-1636)"
   pese a arrancar ahora en 1600.

## Ronda 23 — las atribuciones

El grueso de lo que dejó la ronda 20. Seis agentes, uno por región, cada uno con
su informe de entonces y con el mapa de hoy delante.

### Resultado

| | ronda 22 | ronda 23 |
|---|---|---|
| discrepancias en las plazas-testigo | 294 | **207** |
| huecos reales | 51 | **10** |
| civilizaciones | 1.054 | **1.062** |
| periodos | 10.257 | 10.458 |
| anillos | 73.973 | 77.298 |
| doble pintado exacto | 238.2 | **231.1** grado²-año |
| cajas | 0 | **0** |
| defectos de forma | 51 | 50 |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

El doble pintado BAJA pese a 3.325 anillos más. El lote A dejó su región con
**cero huecos** y sus 23 discrepancias restantes son todas `espera` equivocado o
convención declarada: ninguna es un error sin arreglar.

### Cinco hallazgos nuevos que no estaban en ningún informe

Los agentes no se limitaron a ejecutar su lista. Lo mejor de la ronda salió de
mirar alrededor:

1. **Los Qing se vacían por dentro entre 1707 y 1760.** 325 celdas que `qing`
   pinta en 1700, vuelve a pintar en 1760, y en 1710, 1720, 1750 y 1758 no pinta
   nadie: Jaljá occidental, Barga y Hulunbuir, el corredor de Hexi, Ejina,
   Alashán, el borde de Amdo y **Hainan entera**. Jiayuguan —el extremo oeste de
   la Gran Muralla, guarnición Qing— sale VACÍO 45 años.
2. **El otomano pinta Srem y la Bačka meridional de 1690 a 1899.** Novi Sad,
   Sremska Mitrovica y Zemun, habsburguesas desde Karlowitz (1699). 200 años. Y
   ligado a ello, falta el reino habsburgués de Serbia entero (1718-1739):
   Belgrado sale otomana en 1717, 1719, 1730 y 1738.
3. **Ceilán entero vacío de 1232 a 1469.** `sinhala` salta de 1232 a 1469 y la
   isla sólo la pinta el anillo de `jaffna`: Colombo, Kotte, Galle, Kandy,
   Anuradhapura y Trincomalee sin dueño 237 años. Creada `kotte`.
4. **Chile central indígena toda la colonia.** `mapuche` llega a lat −33,8 desde
   1750 mientras su propio rótulo dice "la Corona reconoce la frontera del
   Biobío". De 284 celdas del valle central, en 1810 pinta 266 y `spanish` 18
   —sólo Santiago—: Concepción, Chillán, Talca y Rancagua salen mapuches, y las
   dos últimas hasta 1861.
5. **Galitzia-Volinia vacía de 1240 a 1385**, sobre Leópolis, Halych, Lutsk y
   Volodymyr.

### El patrón `ethiopia` sigue apareciendo

Rótulo correcto, geometría que lo desmiente. Esta ronda salieron cinco más: el
otomano rotulando *pérdida de Bagdad (1623-1638)* y pintándola; el samaní
diciendo *Jorasán tras Balj (900)* sin tenerlo; `idrisidas_norte` diciendo
*Córdoba ocupa Ceuta en 931*; `yemen` diciendo *Adén británico desde 1839*; y
`bahmani` diciendo *aún sin salida al mar de Konkan* mientras pinta Bacaim y
Thana. Van ya once casos en cinco rondas. **Un rótulo que nombra un hecho es una
afirmación comprobable, y comprobarla contra la geometría encuentra errores que
ninguna otra prueba ve.** Convendría una herramienta que extraiga los años
citados en los rótulos y los contraste con la geometría del periodo.

### Fantasmas del propio informe de la ronda 20

El lote B tenía como hallazgo de MÁXIMA GRAVEDAD la península de Kerch sin dueño
de 1475 a 2020, y la costa sur de Crimea vacía 300 años. **Ninguno existe.** La
sonda actual los marca `~~`: es generalización de la costa, no hueco — el anillo
de Crimea llega a lon 36,4 y Kerch cae en 36,47, siete centésimas. Los escribió
la versión de `plazas.js` anterior al arreglo del lote F, que no distinguía hueco
de contorno. Que el hallazgo más grave de un informe resulte ser un artefacto del
instrumento es exactamente por lo que ese arreglo valía la pena.

### Un duplicado que creé yo

Mencioné Santa Lucía y Granada a los lotes A y F, y los dos las dibujaron.
`grenada` la rechazó `crea.js` por id repetido, pero Santa Lucía entró dos veces
con ids distintos —`saint_lucia` y `santa_lucia`— y hubo que fundirlas. Décima
duplicación de la campaña y **la primera que es mía y no heredada**. La lección
ya no es sólo "busca por nombre además de por id": es que los lotes que comparten
frontera necesitan saber qué le he encargado al vecino.

### `espera` equivocado, no errores del mapa

Los seis agentes marcaron en total **unas 80 líneas** donde el mapa tiene razón y
la expectativa del informe de la ronda 20 estaba mal. Un buen puñado son
expectativas que quedaron OBSOLETAS porque las rondas 21 y 22 crearon la entidad
correcta: Edimburgo ya es `scotland` y no `british`; Reval es `estonia_danesa`;
Tiflis es `georgia_medieval`; Bakú es `shirvanshah`; Jaffna es `jaffna`; Mukden
es `jin_posteriores`. El informe pedía lo segundo mejor porque lo mejor no
existía.

Otras son convenciones del mapa que conviene dejar dichas: **la ocupación no
repinta** (Minsk y Kiev siguen soviéticos bajo ocupación alemana, Alsacia sigue
francesa), pero **la anexión formal sí** (Danzig-Prusia Occidental, Zichenau y
Memel pasan a `prussia_germany`).

### Pendiente

1. **207 discrepancias**, ya con rendimientos decrecientes: los agentes
   descartaron por debajo del umbral de años-superficie decenas de casos de 5 a
   20 años sobre enclaves.
2. **Tres regiones piden ronda propia**, con el diagnóstico ya hecho: el país de
   Pskov (frontera intermitente 1590-1680, no una caja); el Cáucaso oriental
   (Derbent bajo capa cultural sin Estado, 500-1700); y la pampa argentina
   (`pampa_pueblos` con un anillo de área 21,8 en 1783-1810 frente a 2,9 antes y
   2,8 después, un globo para tapar el hueco que dejó el redibujo de `spanish`).
3. **El Gobierno General 1939-1945**: Varsovia y Cracovia siguen vacías y no se
   puede arreglar con el juego actual —`poland_lithuania` no tiene periodo ahí y
   `arcos` sólo mueve extremos—. Hace falta `crea_periodo` o una entidad de
   ocupación, y es decisión de campaña porque afecta a varios lotes.
4. **La convención de la ocupación en Asia**: `dutch_empire` sigue pintando
   Batavia y `usa` Manila durante la ocupación japonesa, mientras Birmania y
   Malaya ya pasaron a `japan`. Quedan dos tratamientos en vez de tres, pero
   sigue sin ser uno solo.
5. Islas del Caribe sin dueño: San Vicente, Dominica, San Cristóbal, Martinica,
   Guadalupe y Aruba, mismo caso que Granada y Santa Lucía.
6. El kanato de Turfán 1487-1690, y el sureste afgano 1370-1400.

## Ronda 24 — el auditor de rótulos

Instrumento nuevo y primera cosecha. Once veces en cinco rondas apareció el mismo
defecto y las once lo encontró un agente de casualidad: un rótulo que dice una
cosa y una geometría que dice la contraria. `rotulos.js` es la prueba que las
enfrenta, porque **un rótulo que cita un año o una ciudad es una afirmación
comprobable**.

Hace tres pruebas: anacronismo (el año citado cae lejos del periodo), y dos de
topónimo contra un gazetteer de 416 lugares construido con las 306 capitales de
`capitales.js` y las 230 plazas-testigo de la ronda 20 — el rótulo afirma tener
una plaza y la geometría no la contiene, o afirma NO tenerla y sí la contiene.

### Los dos fallos que tuvo el instrumento antes de servir

Vale la pena anotarlos porque son de la misma familia que los de `tierra.js`:

1. **`/a\.?\s?C\.?/i` para detectar "a.C."** casaba con la palabra **Aceh**, y
   convertía 1629 en −1629. Cualquier "ac" dentro de una palabra valía.
2. **`(-?)\b(\d{3,4})\b`** leía el guion de un rango como signo: en "expediciones
   de 1409-1435" el 1435 salía como −1435, un anacronismo de 2.844 años.

Entre los dos producían 230 falsos positivos de los 503 iniciales. Un instrumento
de medida se equivoca en silencio: hay que probarlo contra casos conocidos antes
de creerle, igual que hicimos con la máscara de tierra.

### Lo que la cosecha enseñó sobre el propio defecto

565 candidatos, repartidos en seis lotes. Los agentes midieron la precisión sin
que se la pidiera nadie: **entre el 36% y el 56% eran reales**, según el lote. Y
todos coinciden en algo que yo no esperaba y que corrige mi hipótesis de partida:

> **Cuando el instrumento acierta, el que miente es el RÓTULO en el 85% de los
> casos, no la geometría.**

Los seis lotes juntos: 154 defectos reales, de los cuales **131 se arreglaban con
`nombres` y sólo 23 con geometría**. La firma dominante no es "el dibujo está
mal": es **un texto correcto copiado a fases donde no vale**. `hindu_kush` tenía
el mismo rótulo en sus 82 fases, del −550 al 1896, diciendo "no musulmán" en el
siglo VI a.C.; `champa` 28 bloques con tres textos; `savoy` uno solo para
1198-1720; `persia` el de Cosroes II repetido en seis fases y derramado a 1510.

### Los falsos positivos son productivos

El lote F lo dijo con todas las letras y los demás lo confirmaron: **tres de los
hallazgos geométricos salieron de acusaciones equivocadas**. El caso limpio es
el del lote D: el aviso sobre `buyid` y Bagdad era ruido de sujeto —"Tughril
entra en Bagdad", el sujeto es el selyúcida— pero su coletilla decía *"lo pinta:
nadie"*, y tirando de ahí apareció que **`seljuk` 1055..1062 se rotula "Gran
Imperio Selyúcida (con Bagdad y Mesopotamia)" y deja veintitrés plazas vacías**:
Bagdad, Samarra, Kufa, Karbala, Nayaf, Basora, Hamadán, Kirkuk. Los buyíes se
repliegan bien en 1055, `abbasid` termina a propósito, y el selyúcida recoge el
suelo siete años tarde.

Conclusión para el instrumento: los falsos positivos por sujeto **no se deben
silenciar, sino bajar de categoría**. El campo "lo pinta: X" es lo que los hace
útiles.

### Otros cuatro hallazgos que sólo aparecieron tirando del hilo

- **Un agujero de 162 años en la tierra de Pskov.** El rótulo de Nóvgorod dice
  "sin Pskov (independiente desde 1348)". Alguien recortó Pskov para que la
  geometría lo dijera **y no creó al ocupante**: de 598 puntos de rejilla, en
  1350, 1400 y 1460 había UNO pintado. Creada `pskov_republic`.
- **El interior de Liberia es británico de 1850 a 1962.** Nimba, Gbarnga,
  Voinjama y Harper: el anillo 32 de `british` funde Sierra Leona y Liberia en un
  polígono al que le falta la frontera del río Mano. `liberia` eran 0,6 grados²
  de hilo costero.
- **Damasco asiria desde el −745.** `arameos` decía "Tiglatpileser III toma
  Damasco" y la ciudad salía asiria desde el primer día del periodo. Tiglatpileser
  sube al trono en el 745 y Damasco no cae hasta el **732**: trece años de reino
  arameo pintados de asirio.
- **Un hueco de 9 años sobre Siria y Palestina**: `byzantine` se retira del
  Oriente en 610 y `persia_occupations` no empezaba hasta 619, la fecha de
  Egipto. Damasco cayó en 613 y Jerusalén en 614.

### Cifras

| | ronda 23 | ronda 24 |
|---|---|---|
| avisos del auditor de rótulos | 565 | **208** |
| de ellos anacronismos | 273 | **47** |
| civilizaciones | 1.062 | 1.063 |
| periodos | 10.458 | 10.498 |
| anillos | 77.298 | 77.606 |
| doble pintado exacto | 231.1 | 231.7 grado²-año |
| discrepancias en las plazas-testigo | 207 | 202 |
| cajas | 0 | **0** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Cómo afinar el instrumento, según los seis lotes

Las clases de ruido, ordenadas por volumen, con el remedio que cada agente propone:

1. **Sujeto equivocado** (la mayor). "Roma toma Cerdeña" en el rótulo de
   `nuragica`, "Francia ocupa Niza" en el de `savoy`. Remedio: exigir que el
   sujeto del verbo sea la entidad rotulada. **Bajar de categoría, no silenciar.**
2. **Subcadena del verbo.** `beduinos_arabia` aportó **30 bloques idénticos**
   porque **"Otomanos" contiene "toma"**; igual "oCUPAcion", "suCEDEn". Remedio:
   límite de palabra en los verbos, metiendo a la vez los plurales.
3. **Gazetteer sucio.** `delta` resuelve al delta del Volga y acusa al "delta del
   Krishna"; `nilo` es un punto nubio; `orilla` es Brazzaville; `lagos` de Nigeria
   choca con "los Grandes Lagos" y con "valles y lagos". Remedio: limpiar los
   paréntesis de las glosas de `capitales.js`, una línea.
4. **Píxel de agua.** Los cuatro avisos sobre Constantinopla eran el Bósforo:
   sondeada en tierra, `byzantine` la pinta en los ocho años probados. Remedio:
   reutilizar la espiral de `plazas.js`.
5. **Mención legítima de un antecedente**, y **hecho en el borde exacto del
   periodo** — `hechoDentro` exige `y < p.end` y debería ser `y <= p.end`.
6. **Las 296 áreas culturales aportan 128 de los anacronismos** y no deberían
   juzgarse por plazas.

Además: agrupar por (marca, id, texto) reduce 508 bloques a 173 defectos, que es
la cifra que de verdad importa.

### Pendiente

1. Afinar `rotulos.js` con las seis reglas de arriba y volver a cosechar: quedan
   208 avisos y la mitad serán reales.
2. **Asiria pinta el Levante entero desde el −745**: Samaria y Hazor también, y
   Samaria cayó en el 722. Mismo vicio de brocha gorda que Damasco.
3. `bhutan` tiene un agujero de arco de dos años (1800-1802) que ninguna
   herramienta actual cierra sin inventar geometría.
4. Tashkent sin dueño 1723-1785; Bassein y Prome vacíos en 1551; Caffa genovesa
   1266-1400; el Algarve de los Banu Mahfuz 1238-1249.
5. Las tres regiones que siguen pidiendo ronda propia: el Cáucaso oriental, la
   pampa argentina y el Gobierno General 1939-1945.

## Ronda 25 — el contorno de Egipto, y una clase de error que nadie había visto

El usuario miró el globo y dijo que Egipto "siempre mantiene la forma de la
frontera actual, como si fuera casi cuadrilátera". Tenía razón, y al abrir los
vértices del polígono del Egipto de Narmer, año −3100, apareció esto:

  24.98/22.00 -> 30.23/22.00 -> 32.52/22.00 -> 36.87/22.00     paralelo 22
  24.98/29.18 -> 24.98/22.00                                    meridiano 25
  30.23/21.99 -> 30.00/21.08 -> 30.17/19.97 -> 31.28/19.97      Wadi Halfa

El paralelo 22 es la frontera Egipto-Sudán, trazada en **1899**. El meridiano 25
es la frontera con Libia, de **1919**. El tercer tramo es el saliente de Wadi
Halfa y el entrante de Bir Tawil, artefacto administrativo de **1902**. Cinco mil
años de historia dibujados sobre el contorno de la república moderna, con un
enclave de un pleito colonial incluido.

Y el área lo confirmaba: `egypt` medía **90-94 grados² planos del −3100 al −30**.
El Egipto de Narmer, el de Ramsés y la república de Nasser ocupaban lo mismo.

### Por qué ninguna prueba lo había visto

Es el defecto más invisible que ha tenido este mapa, y conviene entender por qué,
porque enseña dónde estaban los puntos ciegos:

- No deja **huecos**: la sonda de plazas no lo ve.
- No produce **doble pintado**: `dobles_exacto2` no lo ve.
- La **capital cae dentro**: `capitales.js` no lo ve.
- No es una **caja**: `audit.js` no lo marca, porque el litoral mediterráneo y el
  del mar Rojo son sinuosos y de verdad. Sólo dos de los cuatro lados son rectos.
- El **rótulo** no afirma nada contrastable: `rotulos.js` no lo ve.

Seis instrumentos y ninguno lo tocaba. Lo vio una persona mirando el globo.

### El alcance, medido

`fronteras_modernas.js`, escrito para esto, busca tramos largos y rectos clavados
en meridianos y paralelos redondos dentro de periodos anteriores a la época en
que se trazaron. El resultado sobre el mapa entero:

| raya | trazada | entidades anteriores | periodos |
|---|---|---|---|
| Egipto-Libia (lon 25) | 1919 | 14 | 350 |
| Egipto-Sudán (lat 22) | 1899 | 18 | 349 |
| Sykes-Picot, Siria-Irak (lon 38) | 1922 | 14 | 131 |
| Arabia-Kuwait (lat 26) | 1922 | 10 | 130 |
| Irak-Arabia, Uqair (lat 31.6) | 1922 | 8 | 75 |
| EEUU-Canadá (lat 49) | 1818 | 8 | 63 |
| Chad-Sudán (lon 24) | 1899 | 1 | 31 |
| Sahel colonial (lat 10) | 1900 | 4 | 20 |
| Mauritania-Malí (lat 20) | 1900 | 4 | 15 |

**1.164 periodos.** Los casos que dan la medida: `uruk_periodo` y `ubaid`, del
quinto milenio a.C., apoyados en la línea de Uqair de 1922. `nubia_antigua`
(−4000) y `kerma` (−2500) sobre la frontera de 1899. Los `pies_negros` y los
`anishinaabe` partidos por el paralelo 49, trazado en 1818.

El mecanismo es siempre el mismo: **alguien dibujó el país moderno y esa forma se
convirtió en plantilla** para todos los que gobernaron ese suelo. Quien conquistó
Egipto heredó el polígono de Egipto con sus rayas coloniales dentro.

### Lo hecho

**Egipto redibujado en sus 31 periodos anteriores al −30.** Los contornos se
apoyan en la costa mediterránea, el abanico del Delta, el Fayum, la depresión de
Qattara, la línea de oasis (Siwa, Bahariya, Farafra, Dajla, Jarga), el escarpe
del desierto Occidental, las montañas del mar Rojo, el istmo de Suez, el Sinaí y
—en el sur— **las cataratas**, que es lo que de verdad fue la frontera: la
primera en Elefantina, la segunda en Buhen, el desfiladero de Semna, el Batn
el-Hayar. Una cota cerca de 22 sigue apareciendo, pero como punto de un río y no
como raya.

El área ahora cuenta una historia:

| | grados² | |
|---|---|---|
| Tinita (−3100) | 24,0 | valle hasta Elefantina, sin oasis |
| Imperio Antiguo | 33,5 | entran Dajla y Jarga |
| Primer Periodo Intermedio | **10,3** | sólo Delta y valle |
| Imperio Medio | 41,9 | Fayum, cuatro oasis, fortalezas hasta Semna |
| Segundo Periodo Intermedio | 10,3 | Kerma en Nubia, hicsos en el Delta |
| Tutmosis III | 63,8 | oro del Allaqi, corredor nubio, Levante |
| Tercer Periodo Intermedio | 38,3 | se pierde Nubia |
| **XXV dinastía kushita** | **2,7** | sólo los principados del Delta |
| Saítas | 51,9 | Siwa, los cinco oasis, costa hasta Sallum |
| Ptolomeos | 70,9 | Dodecasqueno, Berenice, Cirene |

**Los vecinos del Nilo**: 23 anillos redibujados en `nubia_antigua`, `kerma`,
`nubia`, `makuria`, `kush`, `dotawo` y `mahdiyya`. De paso apareció que la Baja
Nubia recuperada por Makuria en 1175 estaba dibujada como un **rectángulo
literal** de cuatro vértices.

**Los imperios**: `rome`, `rashidun`, `umayyad`, `abbasid`, `ayyubid`, `mamluk`,
`ottoman` y `france` pierden la plantilla egipcia en la ventana del Nilo, y el
desierto que sueltan pasa a `pueblos_sahara` y a `beja`, que son las entidades que
el propio mapa ya usaba ahí. `british` se comprobó y **su raya es legítima**: sus
periodos van de 1898 a 1956 y su borde ES el condominio anglo-egipcio.

**China.** El usuario decía que empieza muy tarde. La cadena de entidades estaba
completa desde Xia (−2070) y culturas neolíticas antes, pero había ocho huecos
reales en el bronce: Pekín y Chengdu vacíos en −2000, Hangzhou en −2000 y −1000,
Chang'an y Taiyuan en −1500. Cuando acaba Longshan hacia −1900 y antes de que los
estados Zhou se repartan el territorio, media China quedaba a oscuras, porque
`xia` y `shang` son entidades pequeñas de la llanura central — lo cual es
históricamente correcto, no fueron estados territoriales. Lo que faltaban eran las
culturas coetáneas. Creadas ocho: **Shijiahe**, **Baodun**, **Ordos**,
**Xiajiadian inferior**, **Maqiao**, **Qijia**, **Yueshi** y **Guanzhong**. Los
ocho huecos a cero.

Y un noveno hueco que la sonda destapó: entre la caída de Chu (−223) y el imperio
Qin (−221) **todo el sureste quedaba sin dueño**. Lo gobierna el *estado* de Qin,
que aún no era imperio; se le añadió la geometría exacta de Chu y de Yan.

### Cifras

| | ronda 24 | ronda 25 |
|---|---|---|
| civilizaciones | 1.063 | **1.071** |
| periodos | 10.498 | 10.552 |
| anillos | 77.606 | 77.747 |
| doble pintado exacto | 231.7 | **228.7** grado²-año |
| huecos en China temprana | 8 | **0** |
| cajas | 0 | **0** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

**228,7 es la cifra más baja de toda la campaña.**

### Lo que NO queda arreglado, dicho con precisión

El cuadrilátero visible ha desaparecido, pero la raya de 1899 sigue en 292
periodos y la de 1919 en 333, contra 349 y 350 antes. Lo que queda son:

1. **Las dos esquinas** del rectángulo —el vértice del mar Rojo (36.00/22.02) y
   el trípode con Libia (24.98/22.00)—, que sobrevivieron a los cortes porque el
   polígono de corte terminaba ahí.
2. **La costura del traspaso**: al entregar el desierto a `pueblos_sahara` (78
   periodos) y a `beja` (46), el borde que recibieron es el borde viejo. La línea
   no se eliminó, cambió de dueño.

Es un arreglo parcial y conviene no llamarlo de otra manera. La segunda pasada
tiene el trabajo acotado y el instrumento hecho.

### Pendiente

1. **Las ocho rayas restantes**, por orden de volumen: Sykes-Picot (131
   periodos), Arabia-Kuwait (130), Uqair (75), el paralelo 49 sobre los pueblos
   indígenas de las praderas (63). Todas con el mismo método que Egipto.
2. Las dos esquinas y la costura del traspaso egipcio.
3. `egypt` no tiene periodos entre el −30 y 1798: el Egipto romano, árabe,
   fatimí, ayubí, mameluco y otomano se pinta desde las entidades imperiales. Es
   una decisión de modelo defendible, pero conviene saberla.
4. Los rótulos de `egypt` están corridos: el de Ramsés III se arrastra del −1150
   al −525, sobre el Tercer Periodo Intermedio, la XXV dinastía y la XXVI saíta.
5. Huecos que China deja anotados: Kunming −2200..−1200, la punta de Jiaodong,
   Hangzhou y Suzhou en −771..−600, Fuzhou −111..+110 (Minyue).

## Ronda 26 — segunda pasada sobre las fronteras coloniales. PARCIAL

**Esta ronda quedó a medias y conviene decirlo antes que nada.** De seis lotes,
tres terminaron y tres se cortaron por el límite de sesión de la API. Dos de los
cortados (D, Sykes-Picot; E, Arabia) dejaron archivos en disco, pero sus propios
agentes estaban a mitad de corregir cosas cuando se cortaron —"las formas nuevas
crean doble pintado, voy a calcular los solapes exactos", "el escarpe me ha
salido demasiado recto, le doy la curvatura real"—, así que **no se aplicaron**:
aplicar trabajo que su autor declara sin terminar es peor que no aplicarlo. El
lote A no llegó a escribir nada.

### Lo aplicado, y su efecto medido

| raya | antes | después | |
|---|---|---|---|
| Chad-Sudán (lon 24) | 31 | **0** | -100% |
| Egipto-Libia (lon 25) | 335 | 292 | -13% |
| Egipto-Sudán (lat 22) | 294 | 274 | -7% |
| Sykes-Picot (lon 38) | 131 | 131 | lote sin terminar |
| Arabia-Kuwait (lat 26) | 130 | 131 | lote sin terminar |
| Uqair (lat 31.6) | 75 | 75 | lote sin terminar |
| EEUU-Canadá (lat 49) | 63 | 65 | ver abajo |
| Sahel (lat 10) | 20 | 20 | |
| Mauritania-Malí (lat 20) | 15 | 15 | |
| **total** | **1.094** | **1.003** | **-8%** |

Un -8% no es lo que esta ronda pretendía. Lo que sí deja son tres cosas sólidas:

**El corredor nubio otomano.** El kaşiflik de Ibrim tuvo guarnición bosnia desde
1560, o sea que los otomanos sí bajaban por el valle nubio hasta más allá de
Asuán. La ronda 25 lo dejó pendiente porque el corredor generaba
auto-intersecciones. Ahora está, y limpio: el truco fue construirlo como
desplazamiento perpendicular del eje del río con el borde oriental topado en lon
32,88, porque el borde de `beja` está en 32,92 — así el corredor no roza al
vecino y sólo hay una entidad que vaciar. Sigue el río de verdad: Asuán,
Kalabsha, Dakka, el recodo de Korosko, Qasr Ibrim, Abu Simbel, Faras, la segunda
catarata, Semna, Akasha, la isla de Sai.

**`nilo_sudan` entera.** Su borde occidental era el meridiano 24 —Chad-Sudán,
1899— de lat 7 a 10 en los 37 periodos desde el -4000; y el oriental era el
meridiano 35, la frontera Sudán-Etiopía de Gwynn de 1902, otros 38 periodos. Un
área cultural del Neolítico encajonada entre dos rayas del siglo XX. Las dos
fuera: ahora sigue la divisoria Congo-Nilo, la divisoria Chad-Nilo y el pie del
escarpe etíope por el Baro y el Akobo.

**Las cintas del paralelo 49.** `assiniboine` 1783..1800 tenía dos rectángulos de
**0,01 grados de alto** pegados a la raya, de área 0,04 y 0,14; `praderas_noroeste`
otro de 0,08 × 0,01, **área 0,00**. No eran territorio: eran residuo de haber
recortado un pueblo contra una frontera que no existía. Redibujados sobre el Bow,
el Saskatchewan Sur, el valle del Qu'Appelle, el Assiniboine y el río Rojo, pasan
a 8,85 y 2,40 grados².

### Por qué el paralelo 49 SUBE de 63 a 65

Porque la raya no era suya. El agente lo diagnosticó bien: de 1783 a 1818,
`spanish` en Luisiana y luego `usa` tienen su límite septentrional clavado en el
paralelo 49 —también anacrónico—, así que `pies_negros` y `assiniboine` siguen
teniendo aristas ahí: **es el borde del vecino, no el suyo**. Ninguna de esas dos
entidades estaba en el lote. Es la misma lección que la ronda 25: si entregas
suelo sin redibujar el borde del que lo recibe, la línea cambia de dueño en vez
de desaparecer.

Y un dato útil del mismo agente: la raya no se acordó de una vez. De las Rocosas
al Lago de los Bosques es de 1818; de las Rocosas al Pacífico, del Tratado de
Oregón de **1846**. Así que los periodos de 1818-1842 son legítimos al este de
lon -115,22 y no al oeste.

### Hallazgo grande fuera de todos los lotes

`sahel_pueblos` tiene un tramo recto sobre **lat 16,50 de hasta 6 grados** (lon 14
a 20, Chad y Níger) en **58 de sus 63 periodos**: 273 grados acumulados, la recta
más larga y más repetida de cuanto se ha medido. Mayor que cualquiera de las nueve
rayas del catálogo. El límite real ahí es el borde meridional del Sáhara, el Bahr
el Ghazal chadiano y el Djourab.

### Cifras

| | ronda 25 | ronda 26 |
|---|---|---|
| civilizaciones | 1.071 | 1.071 |
| periodos | 10.552 | 10.557 |
| anillos | 77.747 | 77.774 |
| doble pintado exacto | 228.7 | **228.8** grado²-año |
| periodos sobre rayas coloniales | 1.094 | **1.003** |
| cajas | 0 | **0** |
| defectos de forma | 50 | 49 |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Pendiente inmediato

1. **Rehacer los lotes A, D y E** cuando el límite se reponga: las culturas que
   heredaron la raya egipcia (`pueblos_sahara` 174 periodos, `beja` 46),
   Sykes-Picot (131) y las dos rayas de Arabia (205). Sus encargos están escritos
   en /tmp/v26/PROMPT.txt y los datos medidos.
2. **El paralelo 49 por el sur**: `spanish` y `usa`, que no estaban en ningún lote.
3. **`sahel_pueblos` y su lat 16,50**, que es mayor que todo lo demás.
4. `assiniboine` y `praderas_noroeste` tienen un **agujero de arco de 39 años**
   (1803-1842): mueren y resucitan. Por eso no se pudo retirar a `british` la
   llanura oriental en ese tramo — no había a quién dársela.

---

## Ronda 27 — cerrar los cuatro lotes que cortó el límite, y la métrica que mentía

Los lotes A, D, E y G de la ronda 26 se quedaron sin aplicar cuando saltó el
límite de sesión. Los cuatro agentes terminaron con validación completa y aquí
se aplicaron enteros.

- **Lote A**, las culturas que heredaron la raya egipcia: `anade_A` **con
  tallado** → `pueblos_sahara` pasa de 93 periodos con la línea a **2**, `beja`
  de 46 a **0**.
- **Lote D**, el meridiano 38 de Sykes-Picot: `redibuja_D` (52 operaciones, 13
  entidades) y `anade_D` con NOCARVE=1 (287 operaciones, 186 `menos` y 101
  `mas`, legítimo porque el destino estaba verificado vacío) → de 117 periodos
  a **6**.
- **Lote E**, Arabia y Uqair: `quita_E` → `redibuja_E` → `anade_E` → `resta_E`
  (28 pares) → de 131 a **20**.
- **Lote G**, Sahel lat 16,5 y el paralelo 49 por el sur: `parte_G` →
  `redibuja_G` → `anade_G` → `resta_G` → lat 16,5 de 58 periodos a **0**.

Cierre: `fusiona_solapes` 0, `auto_int` 16 encontradas, `arregla_auto` reparó 50,
`astillas` retiró 287 anillos, `funde` 10.911 → 10.579, `estructura` 0/0/0/0/0,
`capitales` 306/306, `audit` 48 (32 trazo grueso, 16 óvalo, **0 cajas**).

### La métrica contaba periodos, y partir un periodo no es un defecto

Al medir el resultado, siete rayas bajaban y dos subían: Arabia-Kuwait de 130 a
140 y el paralelo 49 de 63 a 67. Justo las de los lotes E y G. Parecía que sus
propios lotes las habían empeorado.

No. El contador medía **periodos que contienen un tramo recto**, y `parte.js`
—que los dos lotes usan— corta una fase en dos sin mover un solo vértice. La
misma raya, idéntica, pasa a contarse dos veces. Se ve en crudo comparando las
dos versiones: `praderas_noroeste` tenía lat 52,00 de -107,0 a -102,9 en
`1500..1670` y `1670..1763`; ahora la tiene en `1500..1670`, `1670..1682` y
`1682..1707`. Mismo valor, misma extensión, mismos extremos. Un periodo partido
en tres.

Se sustituyó por **grado-año**: la longitud del tramo recto por los años que
dura el periodo. Partir una fase de 100 años en dos de 50 deja la cifra igual.
Con esa medida:

| raya | grado-año r26 | r27 | | periodos |
|---|---|---|---|---|
| Egipto-Sudán | 1.883 | **12** | −99,4% | 24 → 1 |
| Egipto-Libia | 87.660 | **63** | −99,9% | 130 → 22 |
| paralelo 49 | 2.750 | **890** | −67,6% | 67 → 55 |
| Arabia-Kuwait | 649 | **548** | −15,6% | 12 → 16 |
| Sahel lat10 | 857 | **764** | −10,8% | 5 → 2 |
| Sykes-Picot | 251 | 251 | 0% | 1 → 1 |
| Mauritania-Malí | 1.489 | 1.489 | 0% | 7 → 7 |
| Sahel lat16,5 | 0 | 0 | — | 0 → 0 |
| Uqair | 84 | **104** | **+24,3%** | 6 → 9 |
| **total nueve rayas** | **95.622** | **4.120** | **−95,7%** | 252 → 113 |

Las dos que "subían" bajan: Arabia-Kuwait −15,6% y el paralelo 49 −67,6%. Y se
ve el artefacto en estado puro en las rayas que ningún lote tocó: Rub al-Khali
lat 20, Omán lat 21,5 y Tabuk lat 27 tienen **exactamente el mismo grado-año**
que antes y sin embargo sus periodos suben de 40 a 46, de 21 a 26 y de 28 a 37.
Geometría idéntica, más periodos.

Lección para el instrumental: **ninguna métrica del mapa debe contar periodos.**
Los periodos son una partición de conveniencia que las herramientas mueven todo
el rato. Área, grado-año y grado²-año son invariantes; contar periodos mide el
trabajo de `parte.js`, no el estado del mapa.

### Lo único que sí subió de verdad

Uqair, de 84 a 104 grado-año, y es diagnosticable al vértice: el `anade_E` del
lote dejó a `beduinos_arabia` en 1792-1803 un resto de tallado —anillo de caja
46,07-48,83 / 27,73-29,13— cuyo **borde sur es la propia raya de Uqair**:
`[46.07,28.5] → [47.92,28.5]`, 1,85 grados clavados en lat 28,50. Además el
anillo **se cruza consigo mismo**: sube a `[48.31,28.81]`, baja a `[48.42,28.55]`,
va a `[47.71,28.53]` y vuelve a subir a `[47.46,29]`. Residuo de recorte.

Son 21 grado-año sobre 4.120, pero lo introdujo esta ronda y no se deja atrás.
No se arregló aquí porque al abrirlo apareció algo mayor, abajo.

### `saudi_arabia` 1792-1803 es un rectángulo

El borde de Uqair de `beduinos_arabia` es compartido con `saudi_arabia`, así que
hubo que abrir su anillo. El primer Estado saudí, en su fase de máxima
expansión, tiene **un solo anillo de 48 vértices** y tres de sus cuatro lados
son rectas:

- `[44.5,18.5] → [48.87,18.5]` — lat 18,50, **4,4 grados**, el borde meridional.
- `[50.6,18.8] → [50.6,25.04]` — lon 50,60, **6,2 grados**, en pleno Rub al-Khali.
- `[47.92,28.5] → [44.5,28.5]` — lat 28,50, **3,4 grados**, la de Uqair.

Sólo el litoral del Golfo y el escarpe del Hiyaz son de verdad. El emirato de
Diriya dibujado como una caja con una costa pegada. Ninguna de las tres rectas
está en el catálogo de nueve rayas: lat 18,50 y lon 50,60 son las líneas
saudí-yemení y saudí-omaní de 1913-1934, y el detector no las buscaba.

### Y un hueco en el Hiyaz

Sondeando la vecindad en 1795 con rejilla de 0,25 grados: 1.126 celdas de
`saudi_arabia`, 428 de `ottoman`, 192 de `yemen`, 114 de `beduinos_arabia`, 90
de `persia`, 22 de `kuwait`, 4 de `bahrain` — **cero celdas con dos dueños**, lo
que confirma el doble pintado nulo en la región— y **343 celdas sin nadie**,
agrupadas en lon 42,5-43,0 entre lat 20,5 y 26,0. Es el Hiyaz. En 1795 los
saudíes aún no habían tomado La Meca (1803) ni Medina (1805): debería pintarlo
el otomano por el jerifato, y no lo pinta nadie.

### Cifras

| | ronda 26 | ronda 27 |
|---|---|---|
| civilizaciones | 1.071 | 1.071 |
| periodos | 10.557 | 10.579 |
| anillos | 77.774 | 77.713 |
| doble pintado exacto | 228,8 | **227,2** grado²-año |
| nueve rayas, grado-año | 95.622 | **4.120** |
| cajas | 0 | **0** |
| defectos de forma | 49 | 48 |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

El doble pintado es el más bajo de toda la campaña.

### Pendiente inmediato

1. **Lote Arabia** (ronda 28): el rectángulo de `saudi_arabia` 1792-1803 con sus
   tres rectas, el resto de tallado de `beduinos_arabia` con el borde de Uqair y
   su autocruce, y el hueco del Hiyaz. Van juntos: el borde norte lo comparten
   las dos entidades y no se puede mover uno sin el otro.
2. **Rectas fuera del catálogo**: Rub al-Khali lat 20 (4.687 grado-año), Tabuk
   lat 27 (7.270, y llega hasta el -4000), Omán lat 21,5 (1.653). Las tres son
   mayores que ocho de las nueve rayas catalogadas. El catálogo estaba mal
   elegido.
3. `assiniboine` y `praderas_noroeste`, agujero de arco de 39 años (1803-1842).
4. 202 discrepancias de plazas-testigo y ~10 huecos.
5. 208 avisos del auditor de rótulos.

---

## Ronda 28 — el norte, y el recorte que metía mar en el mapa

La ronda 27 sustituyó la métrica por grado-año. Con ella se hizo un catálogo
EMPÍRICO de rectas (`catalogo.js`) en vez de la lista de nueve fronteras
coloniales elegida a mano, y dijo dos cosas que cambiaron el rumbo de la
campaña.

**Primera: las nueve rayas coloniales eran el 0,05% del problema.** Sumaban
4.120 grado-año. El mapa entero tenía 7.790.591.

**Segunda: los tramos más largos no eran fronteras proyectadas hacia atrás, sino
bordes que nunca se dibujaron.** `russia` resolvía su costa ártica entera —de
Kola a Chukotka, 118,7 grados de longitud— con **tres vértices** sobre la
lat 65,04, en quince periodos de 1613 a 1721. El Taimir, el delta del Lena,
Yamal, Gydán y la Kolimá no existían.

Un rodeo que hubo que descartar por el camino: medido en grado-año, el 90% de la
recta del mapa estaba en áreas culturales, y las 25 entidades con más recta eran
todas `kind:'cultura'`. Parecía un hallazgo. No lo era: las culturas duran
milenios y el grado-año las multiplica. Sin ponderar por años, las culturas son
un 14,1% rectas y los Estados un 13,0% —indistinguibles—, y por longitud pura los
Estados tienen el 70% de la recta. El objetivo correcto no era una clase de
entidad sino **los tramos individuales extremos**, que es donde estaba `russia`.

### El fallo que llevaba toda la campaña metiendo mar en el mapa

El agente del lote B avisó de que `recorte.aTierra` estaba roto en el norte de
Eurasia. Al comprobarlo aparecieron **dos** fallos, y el segundo no era ártico:

1. **El antimeridiano.** `aTierra` recortaba contra `T.PZ`, los anillos crudos de
   la máscara. El anillo euroasiático cruza la línea de fecha por Chukotka, así
   que daba dos saltos de 360 grados que el recortador tomaba por aristas. Es
   exactamente el fallo que la cabecera de `tierra.js` documenta y que allí se
   arregló para `enTierra` con `partirFecha`; `recorte.js` nunca lo heredó.

2. **El respaldo que devolvía el polígono sin recortar.** La última línea era
   `return res.length?res:[R2(p)]`. Cuando la intersección con la costa no daba
   nada —es decir, **cuando el polígono estaba entero en el mar**— devolvía el
   polígono intacto. Así se convertía el océano en tierra. Y no es un problema
   del Ártico: una caja sobre el **golfo de Vizcaya**, a medio planeta de la
   línea de fecha, volvía con 12 grados cuadrados de mar abierto.

Medido antes del arreglo: el mar de Kara devolvía 40,0 grados² al 0% de tierra;
el Obi, 7,6 de sus 31,5 reales; Kola, 8,7 con la mitad en agua; Chukotka, 15,1 de
50,5. Después: 0,0 / 31,5 / 30,5 / 50,5, y validado contra una rejilla
independiente de 0,1 grados en doce regiones del planeta con desvío de 0,0 a
2,9%, que es el propio error de borde de la rejilla.

Esto es, casi con seguridad, **la razón de fondo de que la costa ártica no se
dibujara nunca**: la herramienta no dejaba.

La herramienta nueva `mar.js` mide el daño acumulado: 0,6% del área pintada del
mapa cae en agua. La mayor parte es la convención deliberada de archipiélago
—`pacifico_nz`, `marshall_iroij`, `kiribati_tungaru`, el mandato japonés—, que es
correcta. Lo que no lo es está concentrado en la bahía de Baffin y el estrecho de
Davis, donde `inuit` y `paleoesquimales` tienen anillos al 100% de agua. Queda
como pregunta de modelo, abajo.

### Lo que se arregló

**Lote A, la Tierra de Rupert.** En 1700 el norte de Canadá estaba bien
repartido: `inuit` 921 celdas, `dene` 705, `british` 135 (los fuertes de la
bahía). En 1770: `british` 1.725, `inuit` 66, `dene` **dos**. La Compañía de la
Bahía de Hudson se tragaba el norte entero hasta el Ártico. `inuit` perdía el 68%
del área en 1763..1783 mientras sus anillos pasaban de 222 a 469, y
`artico_canadiense` el 80% pasando de 24 anillos a 100: **área que baja y anillos
que suben es la firma del tallado**. Los pueblos fueron recortados contra una
concesión de papel, violando la regla explícita del mapa: se pinta quien
gobierna, no quien reclama. `british` se retira de 1.453 grado² en 237 cajas,
conservando las siete factorías —York Factory, Prince of Wales, Severn, Albany,
Moose, Rupert House, Eastmain—, y el suelo vuelve a `inuit`, `dene`, `cree_innu`,
`artico_canadiense` y `arctico_oriental`. Los contornos no son inventados: son
los que el propio mapa tenía ANTES del tallado.

**Lote B, el Ártico siberiano.** El techo plano no era sólo de `russia`: la misma
pareja de reglas —lat 65,0 y lat 69,0— estaba en `samoyedos`, `evenkos`,
`yukaguiros`, `sami_fineses`, `ugrios_ob`, `selkup_ket`, `siberia_occidental`,
`yakutia_pueblos` y `chukchi_koryak`. No eran nueve errores: era **un solo par de
reglas trazado a lo ancho de ciento cincuenta grados**, con cuatro grados de
tierra de nadie entre las dos. Ahora los pueblos llegan a la costa que
habitaban, apoyados en el límite del bosque, el Putorana, el Anabar, el Olenek,
la orilla izquierda del Lena por Zhigansk, Verjoyansk y el Kolimá.

**Lote C, Arabia.** El rectángulo de `saudi_arabia` no tenía tres lados rectos
sino **cuatro** —el agente encontró que `catalogo.js` no recorre la arista de
cierre del anillo, y el lado de cierre, lon 42,80 de 5,98 grados, era el más
largo— y no empezaba en 1792: 1744..1773 comparten un anillo de **cuatro
vértices**. Rehechos los tres sobre el Wadi Hanifa, el escarpe de Tuwayq, el
Dahna, el Nafud as-Sirr, el Summan y la orla del Rub al-Jali. Y el hallazgo
grande del lote no estaba en el encargo: `beduinos_arabia` caía de área 112,9 a
19,1 en 1744 y volvía a 111,8 en 1818 —el mismo tallado que la Tierra de
Rupert—, dejando 1.496 celdas de Arabia sin dueño en 1760. Ahora 83.

**Lote D, Groenlandia**, que salió al medir el A. `inuit` tenía área 812,8 en
1380..1658 y **152,3** en 1658..1670, con los anillos subiendo de 49 a 78: los
thule expulsados de Groenlandia por el tallado y nunca devueltos. El 85% de
Groenlandia estaba en blanco en 1700 y el 77% en 1800, hasta que `denmark` la
pinta entera en 1900. Devuelta a `inuit` con tallado, usando el propio anillo de
la máscara de tierra, de modo que la huella colonial danesa se mantiene encima.

### Los huecos, antes y después

| región | año | antes | después |
|---|---|---|---|
| Siberia ártica | -2000 | 68% | **29%** |
| | 1 | 61% | **7%** |
| | 1500 | 58% | **6%** |
| | 1700 | 49% | **3%** |
| Canadá continental e islas | 1700 | 11% | **3%** |
| | 1800 | 7% | **0%** |
| Groenlandia | 1700 | 85% | **1%** |
| | 1800 | 77% | **1%** |
| Arabia (lon 36-60, lat 15-32) | 1760 | 1.496 celdas | **83** |

Y el tramo recto más largo por entidad: `russia` 118,7 → **26,5**; `evenkos`
33,7 → 22,0; `chukchi_koryak` 17,1 → 8,5; `samoyedos` 15,4 → 11,3.

### Una trampa de medida, otra vez

`sami_fineses` parecía empeorar de 16,0 a 31,0 grados de tramo máximo. No era
así: tenía dos tramos contiguos de 15 y 16 grados que se tocaban en lon 26,0, y
la limpieza posterior fusionó el vértice intermedio. Misma línea, un vértice
menos, y el detector la lee como una sola de 31. Es el mismo error de la ronda 27
con los periodos: **cualquier métrica que cuente unidades de partición —periodos,
vértices, anillos— mide el trabajo de las herramientas, no el estado del mapa.**
Sólo área, longitud y grado-año son invariantes.

### Cifras

| | ronda 27 | ronda 28 |
|---|---|---|
| civilizaciones | 1.071 | 1.071 |
| periodos | 10.579 | 10.584 |
| anillos | 77.713 | 83.138 |
| doble pintado exacto | 227,2 | **235,2** grado²-año |
| tramo recto más largo del mapa | 118,7 | **26,5** grados |
| área pintada que cae en agua | sin medir | **0,6%** |
| cajas | 0 | **0** |
| defectos de forma | 48 | **46** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

El doble pintado sube 8 grado²-año, que es lo que cuestan cuatro lotes de
adiciones; los pares nuevos son `samoyedos`/`selkup_ket` 4,2,
`russia`/`samoyedos` 3,9 e `inuit`/`arctico_oriental` 3,9.

### Pendiente inmediato

1. **La taiga komi** —Pechora, Usa y Vichegda, lon 44-60, lat 61-66,5— sigue sin
   dueño en todo el arco. No existe entidad komi ni permia y `ugrofineses_volga`
   se para en 61,9. Es el hueco grande que queda en Eurasia.
2. **`paleoesquimales`** conserva las rectas mayores del mapa (lat 65,00 lat
   69,00 lat 71,00 lon -51,25) y un agujero de arco de tres milenios entre
   -2000 y 1000. Es la entidad más rota que queda.
3. `chukchi_koryak`: el mapa entrega Chukotka a `russia` en 1721, lo que es falso
   —los chukchis no fueron sometidos y Anádyrsk se abandonó en 1764—.
4. Después de 1870 `inuit`, `dene`, `cree_innu` y `artico_canadiense` siguen
   tallados. `artico_canadiense` 1880..1900 tiene área 0,00 con 16 anillos.
5. `assiniboine` y `praderas_noroeste`, agujero de arco de 39 años (1803-1842).
6. 202 discrepancias de plazas-testigo y 208 avisos del auditor de rótulos.

### Preguntas de modelo, que no son mías

- **El hielo marino.** `inuit` y `paleoesquimales` tienen anillos al 100% de agua
  en la bahía de Baffin, el estrecho de Davis y el de Hudson. ¿Es convención
  deliberada —los inuit cazaban sobre el hielo y el mar helado era territorio— o
  es residuo del `aTierra` roto? Si es lo primero hay que documentarlo junto a la
  convención de archipiélago; si es lo segundo hay que recortarlo.
- Hay **tres entidades para el mismo pueblo**: `inuit` (thule),
  `artico_canadiense` y `arctico_oriental`. No se pisan, pero conceptualmente son
  una. ¿Fundirlas?
- `mongol` 1236..1240 tiene un anillo de 21,1 grados² al 76% de agua sobre el
  **mar Caspio**.

---

## Ronda 29 — se pinta quien gobierna

La ronda 28 devolvió el norte de Canadá a sus pueblos: entre 1700 y 1770 la
Compañía de la Bahía de Hudson se tragaba el Ártico entero y `dene` pasaba de 705
celdas a **dos**. Al arreglarlo quedó una firma reconocible, que se convirtió en
la herramienta `triturado.js`:

> **El área cae y el número de anillos sube.**
> Un rediseño cambia el área y deja los anillos donde estaban. Un TALLADO parte el
> polígono en trozos: pierde área y gana anillos a la vez.

Pasada por el mapa entero dio 681 casos, 202 de los cuales recuperan el área más
tarde. Y medida por regiones, la Tierra de Rupert no era un caso aislado: era el
patrón de **todas** las fronteras coloniales. El mapa declaraba una convención
—se pinta quien gobierna, no quien reclama— y no la aplicaba en ningún imperio.
Estaba en contradicción consigo mismo. Esta ronda lo hace consistente.

### Celdas de tierra pintadas por áreas culturales

| región | año | antes | después |
|---|---|---|---|
| Siberia y Extremo Oriente | 1700 | 242 | **469** |
| | 1800 | 32 | **346** |
| | 1850 | 3 | **129** |
| Norteamérica al norte de 50 | 1800 | 883 | **1.024** |
| | 1900 | 18 | **711** |
| Amazonia y Chaco | 1700 | 120 | **169** |
| | 1900 | 1 | **106** |
| Australia | 1850 | 223 | **323** |
| | 1900 | 0 | **127** |

### Lo que se arregló

**Lote A, Siberia.** La conquista rusa fue rápida en extensión y hueca en
profundidad: una red de ostrogs -Tobolsk 1587, Yakutsk 1632, Ojotsk 1639-
separados por cientos de kilómetros para cobrar el yasak, sin tribunales,
catastro ni colonos en el interior hasta el estatuto de Speranski de 1822.
`russia` se retira en seis cajas y conserva la franja meridional de la taiga y
los corredores del Obi, el Yeniséi, el Angará, el Lena y la ruta de Ojotsk.
`chukchi_koryak` pasa de 7,3 a 223 grados² y deja de ser polvo de 46 anillos: la
guerra ruso-chukchi va de 1729 a 1778, Pavlutski murió en combate en 1747, el
Senado ordenó abandonar Anádyrsk en 1764 y en 1779 Catalina II los eximió del
yasak. `yukaguiros` de 3 a 96, `evenkos` de 97 a 292, `samoyedos` de 27 a 102.

**Lote B, Norteamérica y la Alaska rusa.** `british` tenía un anillo de 110
grados² sobre Baffin y Boothia que aparece justo en 1870 -los Territorios
Árticos Británicos- y que habría vuelto a triturar a los inuit. Fuera. La
Compañía Ruso-Americana tenía Kodiak, Sitka y una cadena de factorías costeras y
nunca administró el interior: Zagoskin todavía lo exploraba como desconocido en
1842. `alaska_oeste`, que se apagaba en 1867 -el año exacto de la compra-, llega
ahora a 1900. Canadá conserva los Tratados 1 a 7 al sur del paralelo 55, el
ferrocarril, el San Lorenzo, las Marítimas y la Columbia Británica.

**Lote C, Amazonia y el Chaco.** Nueve pueblos recuperan el macizo interfluvial:
`amazonia_suroeste` el Purús, el Juruá y el Javari; `alto_xingu` el alto Xingu y
el alto Tapajós; `chaco_pueblos` el Gran Chaco. Las coronas y las repúblicas
conservan el litoral, el Nordeste, Minas desde 1690, el eje del Amazonas con
Belém, Santarém, Manaos y Tabatinga, los Andes y las misiones. La retirada se
hizo con **noventa y cuatro tiras verticales** en vez de rectángulos
circunscritos: con rectángulos quedaban 176 celdas sin dueño, con tiras 49. Y
cada contorno lleva escotaduras por donde un río navegable sí metía al Estado
dentro del macizo -el Juruá hasta Cruzeiro do Sul, el Purús hasta Sena
Madureira, el Araguaia del Bananal-, y esas escotaduras se le dejan al Estado.

**Lote D, Australia, Nueva Zelanda, Melanesia y Borneo.** `aboriginal_australia`
conserva en 1900 la cuarta parte del continente: el Gran Desierto de Arena, el
Gibson, el Tanami, el Gran Desierto Victoria, la Tierra de Arnhem, el Simpson y
el cabo York occidental. La línea telegráfica es de 1872, Burke y Wills mueren en
1861 y los Pintupi Nueve salieron del desierto en 1984. `maori` tenía 53 anillos
y 0,6 grados² de polvo: se borran esos cuatro periodos y se reponen con geometría
nueva, con el Rohe Pōtae cerrado por el aukati hasta 1881 y Te Urewera hasta
1907. En Melanesia, `papuan_peoples` caía de 654 puntos en 1880 a UNO en 1930:
recupera las tierras altas centrales, cuyo primer contacto son las expediciones
Leahy de 1930-1935. `dayak` caía de 11,9 a 0,0: recupera los montes Müller y
Schwaner y el Apo Kayan.

**Tasmania** se trató aparte, y es el caso en que la desaparición del área
cultural SÍ es histórica. Sólo se corrige la fecha, de 1829 a 1835: la isla
entera es palawa hasta Risdon Cove (1803), el oeste sigue libre durante la guerra
negra y se pierde cuando Robinson termina las deportaciones a Wybalenna.

### Mi propio error, y por qué se cuenta aquí

Al medir el lote B aparecieron 382 celdas sin dueño en 1900 donde antes había 22.
No era geometría sino calendario: los pueblos terminaban su arco en 1900 y
`british_dominions`, que cubre 1898..1901, había sido vaciado ahí por la retirada.
Con `p.start <= año < p.end`, en el año 1900 exacto no quedaba nadie. Un vacío de
**un año de ancho**.

Lo parcheé estirando cuatro pueblos hasta 1901. Y el doble pintado saltó de 230,4
a **927,3**, lo peor desde la ronda 9: en ese año ya pintaban Dinamarca en
Groenlandia -593 grados²- y Estados Unidos en Alaska. El parche era cuatro veces
peor que el defecto. La solución correcta no era revertirlo sino **tallarlo**:
`resta_civ` con los pueblos como perdedores frente a Dinamarca y Estados Unidos.
El vacío se tapa igual y el doble pintado vuelve a 227,4.

La lección, que ya es la tercera de la misma familia: **los arcos son una
partición como los periodos, y sus extremos son costuras.** Cualquier retirada
que abarque un periodo entero del imperio abre un agujero del ancho de lo que
sobre de ese periodo.

### Las dos cajas

`audit.js` marcó dos cajas por primera vez desde la ronda 21. `evenkos` recibió
la meseta central siberiana como un rectángulo de **cuatro vértices**, 26 x 7,5
grados y 195 grados², en trece periodos; `papuan_peoples`, las tierras altas de
Nueva Guinea como dos rectángulos más. Redibujadas sobre el pie del Putorana, la
divisoria Viliui-Lena y el interfluvio del Angará la primera, y sobre el eje real
de la cordillera central las otras. Al estrecharlas quedaron 40 y 145 celdas sin
dueño, que se devolvieron al vecino con `anade` en modo `mas`: como la entidad
procesada siempre pierde, cada una se quedó sólo con el hueco. Cajas otra vez a
cero, huecos a 0 y 1.

### Cifras

| | ronda 28 | ronda 29 |
|---|---|---|
| civilizaciones | 1.071 | 1.071 |
| periodos | 10.584 | 10.650 |
| anillos | 83.138 | 83.260 |
| doble pintado exacto | 235,2 | **227,5** grado²-año |
| casos de triturado | 681 | **669** |
| cajas | 0 | **0** |
| defectos de forma | 46 | **47** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Pendiente inmediato

1. **África subsahariana**, que no entró en esta ronda y es la mayor: de 433
   celdas de cultura en 1850 a **2** en 1900. El reparto de Berlín pintado como
   gobierno. Ronda propia.
2. **Siberia en el XIX**: los arcos del lote A acaban en 1822 y 1860, así que en
   1900 vuelve a haber cero cultura en Siberia. Falta el tramo final.
3. `brazilian_empire` sigue pintando Brasil hasta 2025, aunque el Imperio acaba
   en 1889.
4. El mapa no tiene entidad para los manao y baniwa del Negro ni para los mura y
   mundurucú del interfluvio Madeira-Tapajós: de ahí el vacío de 1600 en
   Amazonia.
5. `costa_noroeste` y `meseta_naciones` apagan su arco en 1862 y 1855 sin
   sustituto.
6. La taiga komi sigue sin dueño; `paleoesquimales` conserva las rectas mayores
   del mapa; 202 discrepancias de plazas-testigo y 208 avisos de rótulos.

---

## Ronda 30 — África

La ronda 29 aplicó al mapa la convención que el propio mapa declaraba y no
cumplía —se pinta quien gobierna, no quien reclama— en Siberia, Norteamérica,
Amazonia, Australia, Nueva Zelanda, Melanesia y Borneo. África quedó fuera por
ser la mayor y la más enredada. Es ésta, y tenía **dos** defectos superpuestos,
no uno.

### El primero: el Reparto pintado como gobierno

  año    cultura  estado  vacío
  1850      708     713    376
  1880      531     747    519
  1890      196   1.344    257
  1900       12   1.761     24

De 531 celdas de área cultural en 1880 a **doce** en 1900. La Conferencia de
Berlín exigía "ocupación efectiva" precisamente porque no la había, y el mapa
pintaba el reparto como si fuera administración. Once pueblos africanos
terminaban su existencia con **área 0,00 y decenas de anillos** —polvo de
recorte, no territorio—: `chewa_zambeze`, `tsonga_venda`, `bemba_lunda_este`,
`herero_nama`, `benue_jukun`, `ngoni`, `igbo_ibibio`, y `khoisan` en 0,6 tras
haber cubierto medio continente austral desde el -20000.

### El segundo, más viejo y que nadie había mirado

Entre el **20% y el 29% de África no era de nadie** en todo el arco precolonial:
457 celdas vacías en 1500, 418 en 1700. Y no era el Sáhara, que queda fuera de la
ventana medida. Los mayores huecos de 1700: Tanzania y el Congo oriental (57
celdas), la costa de Guinea (32), el alto Nilo (30), el interior de Angola y
Namibia (28), Madagascar (25).

La causa resultó ser doble. Áreas culturales que mueren sin sucesor
—`grandes_lagos_africa` se apaga en el año 900 y ochenta grados² entre el
Tanganica y la meseta tanzana no vuelven a encenderse hasta que llega
`nyamwezi` en 1800— y, sobre todo, **geometrías que nunca llegaron a existir**:
Madagascar entera antes de 1540, el bosque de Guinea de Liberia al Volta en
cualquier fecha, el Nugaal somalí, el Adamawa, el Bahr el Ghazal.

### Lo que se arregló

**Lote A, África occidental y el Sahel.** La conquista francesa del Sudán es
tardía y por columnas: Bamako 1883, Segú 1890, Samory capturado en 1898, el Chad
en 1900-03, el Sáhara central sin administración hasta los años veinte y Kaocen
sublevado en 1916. Sokoto recupera su extensión propia —44,4 grados² en vez de
los 5,5 a que lo dejaba el convenio anglo-francés de 1898— hasta que Lugard lo
destruye en 1903. Doce arcos se alargan a su fecha real: el Aïr a 1917, el Ahaggar
a 1920, los emiratos moros a 1909, Kanem-Bornu a 1902. La retirada se hizo con
`anade` en modo `menos` y polígonos sobre accidentes, no con `quita_caja`,
**precisamente para que Francia no quedara con una recta de veinte grados sobre
el paralelo 18**.

**Lote B, África central.** El Estado Libre del Congo es el caso extremo de
reclamación sin gobierno: Leopoldo II obtuvo en Berlín un territorio del tamaño
de Europa occidental y lo administraba desde puestos fluviales y zonas de caucho.
Pasa de 155 grados² a **18,8** en 1885-91, y crece luego a 36, 60 y 79 conforme
llega de verdad: el Bajo Congo hasta el Pool, una banda de más menos 0,6 grados
sobre el curso navegable, el Kasai desde 1891, el Uele y el Katanga de Lofoi
desde 1895. El Salonga, el Tshuapa y el Ituri quedan fuera hasta el final. Angola
vuelve a ser litoral y presidios: 16 grados² hasta 1902 en vez del salto a 87 en
1890, que era el ultimátum británico pintado como administración.

**Lote C, África oriental, el Cuerno y el sur.** Britania sale del Bahr el Ghazal
y el Sudd conservando el corredor del Nilo Blanco; del interior somalí hasta la
caída de Taleh en 1920; del país masái hasta 1911. Italia sale de Somalia hasta
el arriendo del Benadir de 1892 y del interior hasta 1920. Alemania sale del
interior de Namibia, y `herero_nama` muere en **1908**, la fecha del genocidio, no
en 1900. Y dos Estados africanos también se retiran de donde no gobernaban: el
Transvaal del Soutpansberg venda hasta 1898 y Etiopía de Borana y Guji hasta
1897. Se creó `hehe` (1860-1898) para la guerra de Mkwawa: Uhehe estaba **vacío**
en 1870 y 1884 y desde 1885 lo tapaba el bloque alemán.

**Lote D, el hueco precolonial.** Cierra el segundo defecto. `grandes_lagos_africa`
se prolonga con un periodo nuevo 900..1850 insertado con `crea_periodo` —no con
`arco.js`, que habría estirado el rótulo de Urewe sobre mil seiscientos años— y
diez pueblos recuperan suelo que nunca tuvieron dueño. Se crearon tres áreas
culturales, las tres comprobadas por id, por nombre y por región: `malgaches`
(700..1850), `akan_kru` (-1000..1850, del Cavally al Volta) y `makua_yao`
(200..1850, del Rovuma al bajo Zambeze). Existían `madagascar` y `yao`, pero son
el Estado de 1960 y el sultanato del Lugenda, no los pueblos.

### La costura de 1850, otra vez

El lote D acababa en 1850 y el C empezaba después, así que la franja 1850-1885
quedó sin rellenar y la medida de 1850 no se movía. Es la misma familia de
defecto que costó la ronda 29: **los bordes de ventana entre lotes son costuras**.
Se cerró llevando los mismos polígonos del lote D a los periodos 1850..1890 de
siete entidades. Y el `hehe` recién creado solapaba con el anillo continental de
`zanzibar`, que llega hasta el lon 36: el sultanato gobernaba la costa suajili y
las rutas de caravanas, no Uhehe, así que pierde.

### Los huecos, antes y después

| año | vacío antes | vacío después | cultura antes | cultura después |
|---|---|---|---|---|
| 1500 | 457 | **191** | 950 | **1.216** |
| 1700 | 418 | **144** | 855 | **1.129** |
| 1850 | 376 | **284** | 708 | **808** |
| 1880 | 519 | **283** | 531 | **781** |
| 1890 | 257 | **171** | 196 | **650** |
| 1900 | 24 | 81 | 12 | **375** |
| 1910 | 12 | 48 | 6 | **196** |

### Cifras

| | ronda 29 | ronda 30 |
|---|---|---|
| civilizaciones | 1.071 | **1.075** |
| periodos | 10.650 | 10.923 |
| anillos | 83.260 | 85.398 |
| doble pintado exacto | 227,5 | **237,8** grado²-año |
| cajas | 0 | **0** |
| defectos de forma | 47 | **46** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Pendiente inmediato

1. **1930 sigue con 2 celdas de cultura y 1930 no se tocó**: los cuatro lotes
   trabajaron hasta 1912-1920. El tramo 1920-1930 sigue siendo bloque imperial,
   aunque ahí es en buena parte correcto.
2. **Seis culturas africanas aún terminan en polvo**: `tsonga_venda` 0,04,
   `igbo_ibibio` 0,31, `etiopia_baja` 0,52, `khoisan` 0,61, `ife` 0,72,
   `costa_rios` 0,94.
3. **Pueblos que faltan y se diagnosticaron sin crear**: sukuma, gogo, fipa y
   nyakyusa en Tanganica; makonde; una entidad kordofana para los montes Nuba; el
   Estado de Rabih az-Zubayr. Y los huecos menores de 1700 ya localizados: el
   Gurma, el cinturón medio de Nigeria, el Lomami-Katanga, el Luangwa, el bajo
   veld del Limpopo, el Bale etíope.
4. Alemania sigue pintando Usukuma, Ugogo, Ufipa y el país nyakyusa en 1885-1890
   sin que existan esos pueblos para recibirlos.
5. Siberia en el XIX (los arcos de la ronda 29 acaban en 1822 y 1860);
   `brazilian_empire` hasta 2025; la taiga komi; `paleoesquimales`; 202
   discrepancias de plazas-testigo y 208 avisos de rótulos.

---

## Ronda 31 — un hueco en el mapa suele ser un pueblo que falta

Las rondas 29 y 30 aplicaron la convención del mapa —se pinta quien gobierna, no
quien reclama— en Siberia, Norteamérica, Amazonia, Australia, Melanesia y África.
Al hacerlo, los agentes dejaron por escrito una lista de cosas que diagnosticaron
y NO pudieron arreglar **porque les faltaba a quién dar el suelo**. Esta ronda es
esa lista, y de ella sale la regla que la titula.

Cuando a un imperio se le retira territorio hace falta alguien que lo reciba. Si
ese alguien no existe, o su arco se apaga antes de tiempo, el suelo queda en
blanco y la corrección no se puede hacer.

### Lote B, Siberia en el XIX: el arco era el defecto

La ronda 29 devolvió Siberia a sus pueblos, pero puso los arcos donde tenía
argumento y no más allá, así que el mapa volvía a vaciarse. Los escalones caían
exactamente en el final de tres arcos —`evenkos` 1822, `chukchi_koryak` y
`amur_pueblos` 1860— y siete pueblos más morían con territorio intacto:
`selkup_ket` en 1613 con 24,8 grados², `yakutia_pueblos` en 1632 con 22,4,
`altai_sayan` en 1756 con 27,3. No se extinguieron: los apagaron.

La fecha rectora resultó ser el **estatuto de Speranski de 1822**, que no es un
final sino un corte de fase: crea las administraciones de inorodtsy y reconoce
autogobierno a los pueblos nómadas y errantes hasta bien entrado el siglo XX. La
segunda es el decreto de okrugs nacionales del Norte de 1930.

| Siberia (1.535 celdas) | antes | después |
|---|---|---|
| 1800 | 346 | **612** |
| 1850 | 129 | **583** |
| 1860 | 3 | **573** |
| 1900 | **0** | **572** |
| 1929 | 0 | **471** |

El agente **no usó `arco.js`**, y el argumento es bueno: estirar el último
periodo habría dejado a `evenkos` con un tramo 1800..1930 rotulado "hasta el
estatuto de 1822". Usó `crea_periodo`, que añade detrás del arco con rótulo
propio.

Y evitó el tropiezo 3 por poco: **`ainu` ya existía** como `ainu_nivji`
(-1000..1875), con Hokkaidō, Sajalín, las Kuriles y la costa nivji, y con la
Kaitakushi de 1869 y el canje de 1875 ya escritos en sus rótulos.

### Lotes A y C, los pueblos que faltaban en África oriental

En el interior de Tanganica el 40% del suelo no era de nadie entre 1850 y 1885:
lo que lo cubría se apagaba en 1850 y no lo recogía nadie hasta que llegaba el
bloque alemán. No había entidad para algunos de los pueblos más numerosos de
África oriental. Se crearon **doce**, en dos pasadas:

  sukuma, gogo, fipa, nyakyusa, makonde, montes_nuba      (lote A)
  ha_tongwe, konongo_kimbu, luguru_zaramo, bena_kinga,
  ngindo_matumbi, ngonde                                   (lote C)

| Tanganica interior (476 celdas) | antes | después |
|---|---|---|
| 1860 | 40% vacío | **24%** |
| 1885 | 12% | **12%** |
| 1900 | 9% | **9%** |
| cultura en 1860 | 124 | **232** |

La retirada se hizo con `resta_civ` y **nunca con `quita_caja`**: una caja habría
dejado a Tanganica, Zanzíbar y Britania con borde recto y astillas, mientras que
`resta_civ` resta el contorno exacto del que recibe. Y `resta_civ` parte al
perdedor en los años de corte del ganador, de modo que **la costura de calendario
se cierra sola** y cada imperio recupera su comarca exactamente en 1896, 1897,
1898, 1900 o 1907. Es la primera ronda en que esa costura no ha mordido.

`zanzibar` cede Uluguru, Nguru y el Matandu —el bloque macizo que pintaba desde
1856 desde el lon 36,3 hasta la costa era la ruta de las caravanas, no gobierno—
y conserva intactos Bagamoyo, Dar, Kilwa, Lindi y Mikindani.

### El polvo, y cuándo NO es polvo

`tsonga_venda` estaba en 0,04 repartido en diecisiete astillas del bajo Limpopo,
a quinientos kilómetros del Soutpansberg que nombra su propio rótulo; repuesto en
0,63 sobre la sierra, el Nzhelele y el flanco del Limpopo, lo que además tapa un
hueco de ocho años. `igbo_ibibio` estaba en 0,31 en once astillas caídas sobre
distritos ya británicos; repuesto sobre la meseta de Udi y Nsukka.

Pero tres de los seis casos resultaron **no ser polvo**, y el descarte es tan
valioso como la corrección: `ife` es una ciudad-Estado con un anillo por periodo
y arco 1000..1300 correcto; los dieciséis anillos finales de `costa_rios` son los
esteros del Nunez, la Casamance y los Bijagós, es decir un archipiélago y no un
tallado; y el Danakil de `etiopia_baja` tiene dueño mejor, la entidad `aussa`.

`khoisan` queda diagnosticado con precisión y sin tocar: el corte es 1910, el
anillo perdido es el del Kalahari central (16,84 grados²), pero el único par
posible le restaría a `british` toda la geometría khoisan de 1806 a 1961 y
destriparía la Colonia del Cabo. Necesita otra herramienta.

### Un descuido mío

Escribí los encargos de los lotes A y B y lancé sólo el A, y luego di los dos por
completos. Se vio al ir a aplicar: los archivos del B seguían con sus 21 bytes
originales. No se perdió nada porque el mapa no se había tocado, pero conviene
anotarlo: **comprobar el tamaño de los archivos antes de dar un lote por hecho**
es ahora parte del cierre.

### Cifras

| | ronda 30 | ronda 31 |
|---|---|---|
| civilizaciones | 1.075 | **1.087** |
| periodos | 10.923 | 10.965 |
| anillos | 85.398 | 87.832 |
| doble pintado exacto | 237,8 | **246,8** grado²-año |
| cajas | 0 | **0** |
| defectos de forma | 46 | **47** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Pendiente inmediato

1. **Tanganica sigue al 24% en 1860**: faltan aún pueblos del corredor
   Masasi-Tunduru y del oeste. Y `grandes_lagos_africa` acaba en 1850, que es un
   corte artificial de la ronda 30.
2. **`khoisan`**, que necesita restar sólo un tramo temporal y no todo el arco.
3. `british` pinta Ufipa y Matema después de 1900 al norte de la frontera de
   1890; `zanzibar` no pinta su propia isla entre 1890 y 1895.
4. `chukchi_koryak` tiene anillos al oeste del antimeridiano que son isla de San
   Lorenzo, es decir Alaska, no Chukotka. Se resolvió el doble pintado pero no el
   reparto.
5. Los huecos menores de 1700 en África: el Gurma, el cinturón medio de Nigeria,
   el Lomami-Katanga, el Luangwa, el bajo veld del Limpopo, el Bale etíope.
6. `brazilian_empire` hasta 2025; la taiga komi; `paleoesquimales`; 202
   discrepancias de plazas-testigo y 208 avisos de rótulos.

---

## Ronda 32 — el suelo que se queda huérfano

Midiendo el mapa entero por regiones apareció algo que no puede ser histórico:
**hay sitios donde el mapa empeora al avanzar en el tiempo.** Asia Oriental al
12% de suelo sin dueño en el año 1 y al 30% en el 1000. Oriente Medio al 7% en el
1000 y al 18% en el 1500. Sudamérica que no mejora nunca.

Un hueco antiguo puede ser ignorancia legítima: no sabemos quién vivía allí. Pero
un hueco que APARECE donde antes había dueño no es ignorancia, es **un arco que
se apaga sin relevo**. La herramienta nueva, `reversion.js`, lo busca al revés
que todas las demás: en vez de mirar entidades mira el SUELO y pregunta quién lo
tenía y lo perdió. Sobre rejilla de 3 grados y 22 cortes encontró **644 celdas
huérfanas repartidas entre 223 entidades**.

La regla de la ronda: cuando un imperio cae, su suelo pasa a alguien —a los
Estados sucesores, a los pueblos que ya estaban debajo, o al área cultural de la
región—. **Nunca a nadie.**

### Lote A, la estepa

`mongolia_pueblos` moría en −209, justo cuando nace `xiongnu`: la meseta se
vaciaba en 91-330, otra vez tras cada kanato, y del todo entre 840 y 1206. Cinco
periodos nuevos hasta el kurultai del Onon cierran de golpe las reversiones de
`xiongnu`, `uyghur_khaganate` y `rouran`. No hizo falta entidad kirguís: `kyrgyz`
ya existía. `kara_khitan` resultó no ser un problema de kara-kitanes sino de
Mogulistán, cuyos periodos de las campañas de Tamerlán encogían y dejaban el Ili
vacío: Timur asoló el Semirechie siete veces pero no lo anexionó. Se creó una
sola entidad, `nomadas_ponticos` (375..860), porque entre 469 y 650 la estepa
ponto-cáspica no tenía absolutamente a nadie.

**Una decisión de modelo que corregí al agente.** Proponía dar el cinturón
forestal ruso de 1260 a 1478 a la Horda de Oro. Pero la convención del mapa dice
que la ocupación no repinta, sólo la anexión formal, y los principados rusos
pagaban tributo y se gobernaban solos, con sus príncipes, su iglesia y su
derecho. El polígono se reasignó a `russia`, cuyo arco se adelantó de 1263 a
1240 para recoger lo que deja `kievan_rus` al caer Kiev.

### Lote B, Irán, Asia Central y la India

El agente corrigió el encargo: `timurid` 1400→1500 no era un defecto de arco
—la entidad vive hasta 1507— sino que su periodo 1500..1507 se dibujó con área
53,8 donde el anterior tenía 222,7, y con ese encogimiento se vaciaban a la vez
Jorasán, Sistán, Kandahar, Kabul, Balj, Badajshán y Corasmia. Husayn Bayqara
reina en Herat hasta 1506 y Zunnun Arghun tiene Kandahar hasta 1507.

Se crearon dos entidades por faltar de verdad: `baluchistan_pueblos` (400-1666),
porque `baluchistan_helmand` llegaba sólo a −550 y `kalat` empezaba en 1666, con
Makrán y el Bolán vacíos en 500, 1000, 1200 y 1500; y `reinos_gangeticos`
(−28-320), porque entre los Kanva y los Gupta, Pataliputra, Kausambi y Ayodhya no
tenían a nadie. `mughal` no se alargó: se repartió, como corresponde, entre
afganos durrani, marathas, Ladaj y los Circares del Norte.

### Lote C, Europa

Se creó `britania_posromana` (410..927), la reversión mayor de la ventana:
Inglaterra y Gales estaban en blanco **cinco siglos**, entre el abandono romano y
el `british` de Athelstan, y el mapa no tenía ninguna entidad anglosajona ni
britana. Y `estados_alemanes` (1806..1871), los sesenta y cinco años entre la
disolución del Sacro Imperio y `prussia_germany`, donde sólo había Westfalia,
Berg y las ciudades hanseáticas y faltaban Baviera, Sajonia, Hannover y Hesse.

Para la Edad del Bronce —el 70% de Europa vacío en el −1500, el peor momento del
continente en todo el mapa— el agente propuso y creó dos eslabones:
`bronce_atlantico` (−2200..−800), que cierra `campaniforme`, `neolitico_iberico`
y `megalitismo_atlantico` de una vez, y `tumulos`, que une `unetice` (muere en
−1600) con `campos_urnas` (empieza en −1300). Deja escrito que llevar el bronce
atlántico a −2200 es decisión de modelo y no dato: en sentido estricto se fecha
entre −1300 y −700.

### El error de la ronda, que es de herramienta

Tras aplicar el lote A el doble pintado saltó de 246,8 a **7.282,2**, treinta
veces el total del mapa. La causa: **`arco.js` no talla.** Al alargar `srubna`
trescientos años y `catacumbas` otros trescientos para tapar reversiones, ambas
se metieron encima de los vecinos que ya ocupaban ese tiempo —`srubna` contra
`bosque_europa_oriental` sola sumaba 3.112 grado²-año—. Es la misma familia que
`crea.js` y `crea_periodo.js`, que tampoco tallan.

Se arregló con cinco pares de `resta_civ`, y el aviso se metió en los encargos de
los lotes B y C, que a partir de ahí **no usaron `arco.js` en ningún caso** y
prefirieron `crea_periodo` con rótulo propio. Queda como regla: *toda herramienta
que añade tiempo o geometría sin pasar por `anade` deja doble pintado, y hay que
escribir el par de resta en el mismo momento en que se escribe el alargamiento.*

### Resultado

| | antes | después |
|---|---|---|
| **reversiones** | **644** | **431** |
| entidades que dejan suelo huérfano | 223 | 202 |
| vacío mundial en −1000 | 31,4% | **29,8%** |
| vacío mundial en 500 | 21,6% | **20,3%** |
| vacío mundial en 1000 | 19,1% | **17,3%** |
| vacío mundial en 1500 | 13,0% | **11,6%** |
| vacío mundial en 1850 | 5,2% | **4,3%** |

Desaparecen por completo del cuadro de honor `timurid` (23 celdas),
`uyghur_khaganate` (20), `persia` (14), `sarmatas` (10), `kara_khitan` (10),
`yamnaya` (10) y `srubna` (10).

### Cifras

| | ronda 31 | ronda 32 |
|---|---|---|
| civilizaciones | 1.087 | **1.094** |
| periodos | 10.965 | 11.336 |
| anillos | 87.832 | 89.041 |
| doble pintado exacto | 246,8 | **262,3** grado²-año |
| cajas | 0 | **0** |
| defectos de forma | 47 | **45** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Lotes D y E: Asia oriental y las Américas

**Lote D.** Casi todo se resolvió alargando geometría de quien ya estaba. El
hallazgo fue que las coordenadas [93,40], [96,37], [93,43] y [90,37] son el mismo
sitio —el corredor de Hexi, el Gansu y el Amdo— y que ahí faltaba una entidad: se
creó `kokonor_amdo` (842-1724), que cierra ella sola nueve celdas de tres
encargos distintos. También `kitanes_xi` (388-907), porque el mapa no tenía
kitanes antes de la dinastía y el bajo Liao llevaba cuatro siglos vacío, y
`batak` (1288-1907), seiscientos años de montaña poblada en blanco. `tang`
recuperó la banda del Ordos a Youzhou entre 755 y 907: su anillo posterior a An
Lushan se cortaba en lat 39,8 y dejaba fuera Datong y Youzhou.

El agente corrigió el encargo en un punto: **`liao` no tenía ninguna reversión**.
La celda que yo le atribuía ya la había cerrado el lote A al dársela a
`mongolia_pueblos`; mi medición era anterior a esa corrección.

Y dejó una lección de método: probó 38 pares de `resta_civ` y los 38 daban «área
X → X» mientras partían `kokonor_amdo` en 163 periodos y `batak` en 114. Los
dejó en catorce, los que de verdad hacen frontera. **Un par de resta que no quita
área no es inocuo: parte al perdedor en todos los cortes del ganador.**

**Lote E.** `paleoesquimales` no era un defecto de arco: llega a 1300 y los thule
entran en 1200, así que el solape dorset-thule ya estaba bien modelado. Lo que
fallaba era el anillo del periodo 1000..1200, que caía de 936 a 649 grados²
vaciando el núcleo —los Barren Grounds entre el Coppermine y la bahía de Hudson,
la cuenca de Foxe, Melville, Baffin y Ungava— justo donde el dorset tardío estaba
en su máximo. Restaurados los 283 grados² que faltaban.

Y un solo defecto explicaba cinco reversiones de las llanuras: **el corte de
1682**, cuando La Salle reclama Luisiana. Hunde a `oneota_illini`, `llanos_altos`,
`sureste_pueblos` y `osage_kansa`, pero la Luisiana francesa que pinta el mapa es
un corredor fluvial que por el oeste no pasa de lon -94, y el interior queda sin
nadie hasta 1763. `osage_kansa` desaparecía del arco esos ochenta y un años
exactos.

### Un fallo de mi propio detector

El lote E descartó seis reversiones como falsos positivos, y tenía razón:
`anishinaabe`, `pies_negros` y `assiniboine` en 1850→1900 tienen sus seis celdas
**en el paralelo 49 exacto**. Sondeando a un décimo de grado, el suelo tiene dueño
por los dos lados; el punto cae sobre la costura de dos polígonos que terminan
ambos en 49,0. `reversion.js` usa una rejilla de paso entero y acierta ese
paralelo en toda su longitud. Conviene saberlo al leer sus resultados: **una
reversión sobre una frontera redonda hay que confirmarla a paso fino antes de
creérsela.**

### Resultado de la ronda entera

| | antes | después |
|---|---|---|
| **reversiones** | **644** | **320** |
| entidades que dejan suelo huérfano | 223 | **180** |
| vacío mundial en −1000 | 31,4% | **29,8%** |
| vacío mundial en 500 | 21,6% | **20,2%** |
| vacío mundial en 1000 | 19,1% | **14,7%** |
| vacío mundial en 1500 | 13,0% | **10,9%** |
| vacío mundial en 1700 | 6,5% | **5,6%** |
| vacío mundial en 1900 | 2,6% | **2,1%** |

### Cifras finales

| | ronda 31 | ronda 32 |
|---|---|---|
| civilizaciones | 1.087 | **1.097** |
| periodos | 10.965 | 11.551 |
| anillos | 87.832 | 90.134 |
| doble pintado exacto | 246,8 | **284,1** grado²-año |
| cajas | 0 | **0** |
| defectos de forma | 47 | **45** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Pendiente inmediato

1. **El grupo 1900 → 1950 es ya la mayor reversión que queda**: `russia` en la
   Laponia finlandesa, `chukchi_koryak`, `dene`, `papuan_peoples`, `british`.
   Todas son la misma cuestión de modelo: **desde 1950 no queda ni un área
   cultural en todo el mapa**. Espera decisión del dueño del mapa.
2. **`paleoesquimales` conserva 12 celdas**, ahora en el tramo −1500 → −1000, que
   es un hueco distinto y más antiguo que el que se cerró.
3. **La Edad del Bronce fuera de Europa atlántica**: el −3000 sigue al 41,3% de
   vacío mundial y no se ha movido en toda la ronda. Italia y el Danubio medio
   necesitan lo mismo que se hizo en el Atlántico, y el salto de −500 —donde el
   modelo cambia de cerámicas a pueblos de golpe— sigue sin revisar.
4. `baluchistan_pueblos` queda triturado entre 711 y 945: veinticinco periodos
   con anillos de cuatro vértices y área 0,00.
5. Reversiones anotadas por los agentes y fuera de sus lotes: el Sarikol de 1800
   a 1950; el Asir en 1900; la Herzegovina oriental, hueco crónico del 500 a
   1878; Suabia en el 500 y la Alta Franconia, que necesitarían el reino de
   Turingia; `jin_dynasty` en [123,40]; `song` en [120,34]; y las tres celdas de
   `aldeanos_misuri`, `dakota` y `praderas_norte` del mismo corte de 1682.
6. `assiniboine` (1803-1842) y `dine_apache` (1512-1700) tienen agujeros de arco
   reales que no producen reversión.

---

## Ronda 33 — cerrar la capa moderna

El dueño del mapa fijó el objetivo: **la capa de civilizaciones debe cubrir la
tierra en toda la línea del tiempo, sin huecos y sin solapes.** Las áreas
culturales que se superpondrían a Estados modernos —kurdos, sami, tibetanos— son
una capa distinta y una versión posterior del proyecto.

Y añadió la corrección que ordena todo lo demás: **el objetivo no es cero huecos,
es que haya hueco exactamente donde no había nadie.** Rellenar una isla
deshabitada es tan falso como dejar en blanco una llanura poblada.

### El instrumento

`inventario.js` muestrea la tierra en cortes temporales, agrupa las celdas vacías
por vecindad y las ordena por persistencia, dando para cada grupo su caja, cuántos
cortes lleva vacío y **quién pinta alrededor**, que es la pista de quién debería
rellenarlo. Convierte una medida en una lista de trabajo.

Lleva dentro una tabla de **tierra legítimamente vacía**: Islandia antes de 870,
Nueva Zelanda antes de 1250, Madagascar antes de 400, las Azores, Cabo Verde, las
Mascareñas, las Malvinas, Svalbard antes de 1920, Jan Mayen, la Tierra de
Francisco José, Severnaya Zemlia, el norte de Nueva Zembla, las islas de la Reina
Isabel, Rapa Nui antes de 1200, Hawái antes de 1000, las Bermudas, Santa Elena y
la Antártida. Descontarlas quitó 826 celda-corte de la cuenta antigua y sacó de
la lista de trabajo cuatro grupos que estaban bien como estaban.

### Lo medido y lo conseguido

| | antes | después |
|---|---|---|
| **hueco de 1500 a 2000** | **4,9%** | **2,3%** |
| celda-corte de hueco | 1.463 | **702** |

Y por grupos, los mayores desaparecen del cuadro: el interior de Brasil (168
celda-corte), Laponia (112), Siberia oriental (82), el Sáhara occidental y el
Sahel (78), Chad y Centroáfrica (49), el Congo y Zambia (49), la Patagonia (42),
las praderas (41), el Ártico ruso (40), la India y Pakistán (34). Lo que queda
son 173 grupos de dos a doce celdas, casi todos costuras de rejilla sobre
paralelos redondos y generalización de litoral.

### Los hallazgos

**Laponia era mucho mayor de lo medido.** No lon 14..30 / lat 66..68 sino todo el
interior de Fenoscandia entre lat 65,2 y 68,7: Suecia se paraba en el paralelo 65
clavado y Dinamarca-Noruega sólo pintaba por encima de 68,5. El tercio ártico de
tres países no lo pintaba nadie **hoy**. Se resolvió dando el interior a
`sami_fineses` hasta 1751 —que no es fecha inventada: es Strömstad y el Codicilo
Lapón, y además el fin del arco que la entidad ya tenía— y desde ahí a cada
Estado según lo que el propio mapa ya daba a la costa de encima.

**El lote A corrigió su encargo.** Yo suponía que el hueco de Brasil venía de
culturas que mueren sin relevo del Estado. Los datos decían lo contrario: 287
celdas vacías en 1500 y sólo 2 en 2000. El problema era que los periodos
anteriores a 1600 de las culturas del interior estaban dibujados **más pequeños
que sus propios periodos posteriores**. Alargar arcos habría empeorado el mapa.

**Nueva Guinea occidental tenía dos agujeros mayores que lo medido.**
`papuan_peoples` perdía la mitad occidental de la isla en un recorte de 1648 y no
la recuperaba hasta el reparto colonial de 1884; y `dutch_empire`, al perder las
Indias en 1949, se quedaba con un anillo diminuto en Aru y dejaba en blanco la
Nueva Guinea Neerlandesa entera hasta 1962.

**Tres agujeros de calendario en Norteamérica**: `dakota` y `aldeanos_misuri`
desaparecían del mapa entre 1682 y 1763 —ochenta y un años sin nadie en Minnesota
y en las aldeas de tierra del Heart y el Knife— y `assiniboine` entre 1803 y
1842, que estaba anotado desde la ronda 26.

### Los descartes, que valen tanto como las correcciones

Los agentes dejaron en blanco, con argumento: el El Djouf y la Majabat al-Koubra,
sin un pozo permanente; el Ténéré con el Gran Erg de Bilma; el Djourab y el
Bodélé, fondo de lago desecado; el Desierto Líbico, con menos de cinco milímetros
de lluvia desde que el Wadi Howar se secó hacia el 1000 a.C.; el Altyn Tagh, el
Lop Nur y el Kuruktag; el Baltoro, el K2 y el Siachen; el Aksai Chin; y el Gran
Rann de Kutch. La línea que separa el relleno del descarte en el Sahel es **la
isoyeta de los 50 mm y la presencia de agua permanente**: por eso el Ennedi se
rellenó aunque esté en pleno Sáhara, porque la guelta de Archei tiene agua todo
el año.

Y se descartaron por costura de rejilla, confirmando a un décimo de grado, el
paralelo 49 otra vez, el Erg Chech, el Tanezrouft, el Danakil, el desierto de
Nubia, el Gurma y el Corentyne; y por píxel de agua, el lago Rojo Superior, el
lago de los Bosques y siete puntos del lago Superior.

### Cifras

| | ronda 32 | ronda 33 |
|---|---|---|
| civilizaciones | 1.097 | **1.099** |
| periodos | 11.551 | 11.846 |
| anillos | 90.134 | 96.588 |
| doble pintado exacto | 284,1 | **296,4** grado²-año |
| hueco de 1500 a 2000 | 4,9% | **2,3%** |
| cajas | 0 | **0** |
| defectos de forma | 45 | **44** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Pendiente: la fase 2, que es de otra naturaleza

El hueco anterior a 1400 es del **23,9%**, y el inventario dice algo que cambia
cómo hay que atacarlo: **no son grupos separados.** Uno solo tiene 1.140 celdas y
va del Atlántico a China y del Congo al Ártico. A esa escala las lagunas del
mundo antiguo se tocan entre sí y forman una masa continua. Es decir: en el mundo
antiguo lo pintado son islas dentro del hueco, no al revés.

Eso no se arregla parcheando. Se arregla decidiendo qué **sustrato continuo**
lleva cada continente en cada milenio, como se hizo con `bronce_atlantico` en la
ronda 32. Los grupos que sí están separados y son abordables aparte:

  220 celdas  Sudamérica interior       129  praderas y bosques de Norteamérica
   92 celdas  Siberia nororiental       120  Ártico canadiense
  113 celdas  Groenlandia y Labrador     58  México y el suroeste
   13 celdas  Sumatra                     9  Columbia Británica (nadie, nunca)
   11 celdas  Manchuria y el Amur         9  costa de Bahía (nadie, nunca)

Los marcados "nadie, nunca" son tierra que **ningún periodo de ninguna entidad
pinta en los catorce cortes antiguos**: la costa de la Columbia Británica, Oregón,
la Siberia central en lon 106-112, y Borneo-Célebes en lon 120-122. Ésos son los
más claros y los que conviene mirar primero.

Otros pendientes menores anotados por los agentes: la Columbia Británica entre
1867 y 1871, cuando `british` suelta la colonia y el Dominion aún no la recibe;
Marajó y el Tocantins, vacíos incluso en 2000, que pedirían una entidad aruã;
Garhwal, independiente hasta 1804; los sultanatos malayos de la costa occidental
de Borneo; el distrito común noruego-ruso de Neiden y Pasvik entre 1815 y 1910;
y `brazilian_empire`, que sigue pintando Brasil hasta 2025 aunque el Imperio
acaba en 1889.

---

## Ronda 34 — el sustrato del mundo antiguo

La ronda 33 cerró la capa moderna. Ésta empieza la otra mitad: el mundo anterior
a 1400, que tenía un 23,9% de hueco y es un problema de otra naturaleza.

### El diagnóstico, que estaba en una sola fila de la tabla

Midiendo cobertura por región y milenio, y contando **cuántas entidades
distintas** la cubren:

  region                     -4000       -3000       -2000       -1000
  Australia y Melanesia    98% (2)     98% (2)     98% (2)     98% (2)
  Siberia                  72% (10)    73% (12)    74% (14)    83% (15)
  Europa                   35% (13)    53% (19)    55% (17)    56% (20)
  India y sureste           15% (4)    49% (12)    60% (13)    68% (20)
  Mesoamerica                0% (0)     32% (4)     43% (6)     54% (8)

**Australia está al 98% con dos entidades. Europa, al 35% con trece.** La
diferencia no es cuánto trabajo se ha hecho: es el modelo. Australia tiene un
sustrato ancho y continuo; Europa tiene culturas arqueológicas estrechas —vasos
de embudo, Únětice, campaniforme, megalitismo— que se definen por estilos de
cerámica y por yacimientos y que nunca cubrieron territorio continuo. **Trece
manchas sueltas dejan más hueco que dos áreas grandes.**

De ahí la idea de la ronda: dar a cada región un SUSTRATO CONTINUO para los
milenios anteriores al Estado, y dejar que las entidades finas se dibujen encima
como ya lo hacen. El sustrato responde a "si aquí no hay ni imperio ni cultura
concreta, ¿quién vivía?", y la respuesta casi nunca es "nadie".

### Siete sustratos nuevos

**Las Américas.** `mesoamerica_pueblos` (-7000..1521), del pie de la Sierra Madre
Occidental y el Pánuco hasta el Darién. Su arco llega hasta la conquista a
propósito: el agente probó cortarlo en el -200 y Mesoamérica volvía del 81% al
62% en el año 1, porque Teotihuacán, zapotecas, mixtecas y mexicas nunca han
cubierto Guerrero, la Mixteca baja ni el Soconusco. `andes_norte_pueblos`
(-6000..1536), cordilleras colombianas, Magdalena, Cauca, Sierra Nevada, Chocó y
sierra ecuatoriana. `mata_atlantica_parana` (-5000..1500), el planalto entre el
Río Grande, el Paraguay y la Serra do Mar.

**Asia meridional y el sureste.** `gangetico_pueblos` (-7000..-322), la llanura
del Ganges, el delta de Bengala y el Brahmaputra, apoyado en los Siwaliks, las
colinas Patkai-Naga-Chin y el borde del Chota Nagpur. `indochina_pueblos`
(-8000..1511), del alto Irawadi a Johor más Andamán y Nicobar. `sonda_pueblos`
(-7000..1500), Sumatra, Java, Bali y Borneo en dos anillos separados por el
estrecho de Karimata. `wallacea_filipinas` (-7000..1600), Filipinas, Célebes,
Halmahera y Nusa Tenggara en tres anillos, con la línea de Wallace como límite.

### Resultado

| región | -4000 | -3000 | -2000 | -1000 |
|---|---|---|---|---|
| India y sureste | 15% → **68%** | 49% → **73%** | 60% → **83%** | 68% → **88%** |
| Mesoamérica | 0% → **81%** | 32% → **81%** | 43% → **81%** | 54% → **81%** |
| Sudamérica | 42% → **73%** | 58% → **75%** | 58% → **75%** | 63% → **77%** |
| Norteamérica | 51% → **65%** | 63% → **73%** | 76% → **85%** | 77% → **86%** |
| Australia | 98% → **100%** | | | |

Y el vacío mundial baja en toda la línea del tiempo:

| año | antes | después |
|---|---|---|
| -3000 | 41,3% | **36,1%** |
| -1000 | 29,8% | **25,2%** |
| año 1 | 22,4% | **18,4%** |
| 1000 | 14,7% | **11,6%** |
| 1500 | 10,9% | **4,9%** |
| 1700 | 5,6% | **2,2%** |
| 1900 | 2,1% | **1,3%** |
| 2000 | 1,6% | **0,9%** |

### La regla del sustrato

El doble pintado subió a 384,6 y el diagnóstico enseñó algo aprovechable: las
astillas nuevas tenían áreas de 0,00 a 0,21 grados² por tramo, pero repartidas
sobre milenios, y eso es lo que infla el grado²-año. La regla que las resuelve es
sencilla y vale para toda la fase 2:

> **Un sustrato SIEMPRE CEDE ante la entidad específica.** Es la capa de fondo,
> no un competidor.

Siete pares de `resta_civ` bajo esa regla lo devolvieron a 321,2.

### Método, para las regiones que faltan

Lo que funcionó y conviene repetir: crear la entidad con una **semilla mínima
cuadrada** verificada vacía y darle el contorno grande con `anade` en modo `mas`,
que talla, de modo que el sustrato sólo puede ocupar lo que nadie tiene. Tres
detalles que costaron tiempo a los agentes y quedan escritos:

 - **Las semillas triangulares no valen**: `recorte.limpia` descarta todo anillo
   de menos de cuatro vértices y `aTierra` las devuelve vacías.
 - **Verificar la semilla barriendo el arco de 25 en 25 años**, no en unos pocos
   cortes: a los dos lotes se les coló una semilla ocupada por una entidad que
   sólo existía dos siglos.
 - **Dentro de `anade` el orden de las claves importa**, porque recorre el objeto
   en secuencia y muta el mapa sobre la marcha: los sustratos van primero.

### Dos correcciones que hicieron los agentes

Mi encargo decía que en el Decán "no hay nada antes de `satavahana`": era falso.
`deccan_neolitico` existe desde el -3000 con 56 grados², sólo que cubre menos de
media península y deja Tamil Nadu, Kerala y el litoral de Andhra en blanco. Por
eso se alargó y ensanchó en vez de crear.

Y mi fila de Mesoamérica (0/32/43) salía de una caja que incluye Baja California,
el Caribe y el norte de Venezuela. Medida sólo sobre Mesoamérica propiamente
dicha, la cobertura era del 0% en el -4000 y del **1%** en el -3000, no del 32%.
El agujero era aún mayor de lo que decía mi tabla.

### Cifras

| | ronda 33 | ronda 34 |
|---|---|---|
| civilizaciones | 1.099 | **1.106** |
| periodos | 11.846 | 12.127 |
| anillos | 96.588 | 103.105 |
| doble pintado exacto | 296,4 | **321,2** grado²-año |
| vacío mundial en -3000 | 41,3% | **36,1%** |
| vacío mundial en 2000 | 1,6% | **0,9%** |
| cajas | 0 | **0** |
| defectos de forma | 44 | **44** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Pendiente: las regiones sin sustrato

Quedan cuatro, y son ahora las peores del mapa antiguo:

  Europa                35% (13 entidades) en el -4000
  Africa subsahariana   40% (8)
  Asia Central          42% (9)
  Oriente Medio         46% (15)
  Asia Oriental         49% (11)

Europa es el caso de manual: trece entidades cubriendo un tercio del continente.
La ronda 32 ya creó `bronce_atlantico` y `tumulos` como eslabones, y su agente
dejó escrito que hace falta lo mismo para Italia y el Danubio medio, y una
revisión del salto de -500, donde el modelo cambia de cerámicas a pueblos de
golpe. África subsahariana tiene el problema del Sáhara mezclado: hay que separar
el desierto legítimo del Sahel poblado, como hizo la ronda 33 con la isoyeta de
los 50 mm.

Otros pendientes menores: los Andes venezolanos, la interfluvia Tapajós-Xingu, el
Labrador-Quebec interior, las llanuras de Kansas a Texas, el Punyab alto y el
Afganistán oriental, y el sur de China al este del meridiano 100.

---

## Ronda 35 — Europa y África, y el registro de vacío deliberado

### Primero, una pieza que faltaba: `vacios.js`

El dueño del mapa pidió que lo que se haga quede **documentado, verificado y
verídico**. Y había un problema de fondo: en el mapa el vacío deliberado y el
vacío por hacer se ven igual, y el criterio vivía disperso en los informes de los
agentes de cada ronda.

`vacios.js` lo reúne en **36 entradas** con la razón escrita de cada una, para que
se pueda comprobar y discutir. No es una lista de exclusión cómoda: es una
afirmación sobre el mundo. Tres secciones:

 - **19 islas y archipiélagos de poblamiento tardío**, con la fecha del
   asentamiento permanente documentado, no la del primer avistamiento: Islandia
   870 por el Landnám, Nueva Zelanda 1250 por las dataciones de rata kiore y
   deforestación, Madagascar 400, Svalbard 1920, y las que nunca tuvieron
   población permanente —Francisco José, Severnaya Zemlia, la Reina Isabel—.
 - **13 desiertos absolutos**, y el criterio no es "es desierto" sino "no hay agua
   permanente y por tanto no hay población fija". Por eso **el Ennedi NO está
   aquí** pese a estar en pleno Sáhara: la guelta de Archei tiene agua todo el
   año. La línea útil en el Sahel es la isoyeta de los 50 mm.
 - **5 de hielo y alta montaña**: la Antártida, el casquete groenlandés, el
   Karakórum y el Siachen, el Aksai Chin, el Qiangtang. Los valles habitados
   quedan fuera de esas cajas a propósito.

El archivo tuvo un fallo suyo propio nada más nacer, y queda escrito dentro como
aviso: una entrada de "Groenlandia habitable" con `desde:-2500`, puesta entre las
islas, **enmascaraba al casquete** para todo el arco posterior, porque `legitimo`
devuelve la primera coincidencia. Se corrigió ordenando de más específico a menos
—hielo, desierto, isla— y quitando la entrada, que era una no-exclusión dentro de
una lista de exclusiones. Diez casos de prueba, cero fallos.

### Los sustratos de Europa y África

**Europa era el caso de manual**: trece entidades cubriendo un tercio del
continente, porque el mapa dibujaba culturas arqueológicas —vasos de embudo,
Únětice, campaniforme, campos de urnas— donde debería haber un sustrato de
población. Tres sustratos nuevos, arco -6000..-500, con las fronteras compartidas
vértice a vértice para que sólo se solapen en el mar:
`bosque_templado_europeo`, `mediterraneo_balcanico` —la laguna que la ronda 32
dejó escrita— y `boreal_fenoscandia`.

**África subsahariana** llevaba ocho entidades para el continente entero en el
-4000, y no mejoraba nada entre el -1000 y el año 1. Cinco sustratos, ordenados
por ecosistema **y por el marco de la expansión bantú**, que es lo que hace que un
sustrato único para todo el arco sea falso: `sabana_sudanesa` (-6000..1000),
`selva_ecuatorial_africa` (-6000..500), `sabana_oriental_cuerno` (-6000..900),
`sabana_austral_prebantu` (-6000..200) y `bantu_austral_temprano` (200..1200).

| región | -4000 | -3000 | -2000 | -1000 |
|---|---|---|---|---|
| Europa | 35% → **82%** | 53% → **89%** | 55% → **90%** | 56% → **92%** |
| África subsahariana | 40% → **94%** | 57% → **94%** | 63% → **94%** | 69% → **95%** |

Los dos agentes separaron por escrito **qué es dato y qué es decisión de modelo**,
que era lo que el dueño del mapa había pedido. Dato: que el continente estaba
poblado salvo el desierto absoluto; que las lenguas bantúes salen del Camerún
entre el -1000 y el 500; las mediciones del hueco. Modelo: los cortes de arco, la
anchura de cada franja, y que el sustrato sea uno por ecosistema y no tres o
siete. El de Europa además rehusó alargar `sami_fineses` hasta el -6000 aunque
habría tapado el hueco boreal, porque su rótulo dice "Sami, finlandeses y
carelios" y eso en el -4000 es precisión inventada.

### El hallazgo de la ronda: no hay doble pintado visible

El doble pintado subió de 321 a 450 grado²-año y parecía un problema. No lo era, y
al comprobarlo salió algo que reordena cómo se lee esa cifra.

`dobles_exacto2.js` mide grado²-**año**: área por años. Es la métrica correcta
para priorizar trabajo, pero tiene el mismo sesgo que ya engañó dos veces a esta
campaña —contar periodos en la ronda 27, contar vértices en la 28—: **multiplica
por duración**, así que una entidad de arco largo pesa mucho aunque su solape sea
invisible. Un solape de 0,004 grados² —medio píxel a 1:50 millones— durante 3.000
años da 12 grado²-año y no se ve en el globo. Los sustratos, con arcos de cinco y
seis milenios, inflan la cifra mecánicamente.

La herramienta nueva `solape_max.js` mide lo otro: **el área máxima que se solapa
en un instante**, sin tope de pares. Sobre 41 cortes temporales y 20.313 pares con
cajas que se cruzan:

> **El mayor solape instantáneo de todo el mapa es 0,056 grados²** —unos 600 km²,
> `morocco`/`bereberes_magreb` en 1550— y sólo seis pares superan los 0,02.

Es decir: **el mapa no tiene doble pintado visible en ninguna parte.** Los 450
grado²-año son astillas de frontera de medio píxel acumuladas sobre milenios.

La lección, que es la tercera de la misma familia y ya merece regla: *cualquier
métrica multiplicada por duración estará dominada por las entidades de arco
largo, tengan o no impacto visual. Hace falta siempre una métrica instantánea al
lado.*

### Cifras

| | ronda 34 | ronda 35 |
|---|---|---|
| civilizaciones | 1.106 | **1.114** |
| periodos | 12.127 | 12.252 |
| anillos | 103.105 | 105.876 |
| doble pintado (grado²-año) | 321,2 | 450,1 |
| **mayor solape instantáneo** | sin medir | **0,056 grados²** |
| hueco real, -3000 | 31,9% | **24,7%** |
| hueco real, -1000 | 23,0% | **16,9%** |
| hueco real, año 1 | 17,0% | **14,1%** |
| hueco real acumulado | 13,2% | **10,7%** |
| cajas | 0 | **0** |
| defectos de forma | 44 | **44** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Lotes C y D: Oriente Medio, Asia Central y Asia Oriental

**Oriente Medio y Asia Central.** Cuatro sustratos: `creciente_fertil`
(-8000..-900), el arco fértil de Gaza al Golfo con un segundo anillo para Chipre,
que estaba vacío en todo el arco pese a Khirokitia; `anatolia_meseta`
(-6000..-550); `turan_oasis_estepa` (-6000..-550), del Caspio al Tian Shan; y
`arabia_oasis_pastores` (-6000..-550), tres anillos que **rodean el Rub al-Jali
sin tocarlo**. Y a `meseta_irania` y `culturas_iranias`, que ya encadenaban el
arco, sólo les faltaba anchura.

**Asia Oriental.** Cuatro más: `china_sur_pueblos` (-7000..-214),
`china_norte_pueblos` (-6000..-221) con el límite en la línea Yin Shan-Yan Shan,
que es a la vez la de la Gran Muralla y la de los 400 mm; `corredor_hexi`
(-6000..-121); y `formosa_pueblos` (-4000..1683), **un hueco que el encargo no
mencionaba**: Formosa estaba vacía en todos los cortes desde el -7000 hasta que
aparece `qing`.

| región | -4000 | -3000 | -2000 | -1000 |
|---|---|---|---|---|
| Asia Oriental | 49% → **87%** | 53% → **88%** | 61% → **87%** | 66% → **87%** |
| Oriente Medio | 49% → **69%** | 56% → **76%** | 63% → **76%** | 67% → **78%** |
| Asia Central | 42% → **59%** | 51% → **68%** | 63% → **73%** | 67% → **77%** |

### El registro se equivocó, y lo encontró un agente

El agente de Oriente Medio anotó que **`beduinos_arabia` pintaba el núcleo del Rub
al-Jali desde el -4000**, que `vacios.js` declara nunca poblado. Y no lo corrigió:
dijo que la caja del registro se tragaba Dhofar y que recortar cambiaría un error
por dos. Tenía razón en las dos cosas.

Comprobado: Salalah está en 54,1/17,0 y el Yebel Qara llega a lat 17,5, dentro de
la caja `[45,56,17,23]` que yo había escrito. Es decir, **mi registro declaraba
deshabitado el puerto del incienso**. Se partió en dos cajas —el núcleo
`[45,56,18,23]` y el lóbulo suroeste `[45,52.5,17,18]`— y queda escrito dentro
como segundo fallo del archivo, con la misma lección que el primero: *una caja
gruesa afirma cosas que nadie ha comprobado.*

Y de ahí salió una aclaración que el registro necesitaba y no tenía:

> **`vacios.js` afirma que no había POBLACIÓN PERMANENTE, no que no hubiera
> SOBERANÍA.** Un área cultural no debe pintar ahí, porque representa dónde vivía
> una población. Un Estado moderno sí puede, porque su territorio incluye sus
> desiertos. El mapa pinta quien gobierna, y un Estado gobierna también sus
> vacíos.

Con eso resuelto, a `beduinos_arabia` se le retiraron 6.767 grados² de erg y los
Estados modernos lo conservan.

### Resultado de la ronda entera

| año | hueco real antes | después |
|---|---|---|
| -3000 | 31,9% | **20,0%** |
| -2000 | 25,8% | **16,0%** |
| -1000 | 23,0% | **14,2%** |
| año 1 | 17,0% | **14,1%** |
| 1000 | 10,6% | **10,2%** |
| **acumulado** | **13,2%** | **9,6%** |

Y por regiones, de las cinco que empezaron la ronda sin sustrato quedan dos por
debajo del 75% en el -4000: Oriente Medio (69%) y Asia Central (59%). Europa pasó
del 35% al 89%, África subsahariana del 40% al 95%, Asia Oriental del 49% al 87%.

### Cifras finales

| | ronda 34 | ronda 35 |
|---|---|---|
| civilizaciones | 1.106 | **1.122** |
| periodos | 12.127 | 12.508 |
| anillos | 103.105 | 108.160 |
| **mayor solape instantáneo** | sin medir | **0,056 grados²** |
| hueco real acumulado | 13,2% | **9,6%** |
| cajas | 0 | **0** |
| defectos de forma | 44 | **44** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

### Pendiente

1. **Norteamérica (65% en el -4000), Siberia (72%), África del Norte (72%),
   Sudamérica (73%) y Mesoamérica (81%)**: no les falta sustrato, les falta que
   el que tienen llegue. Segunda pasada, más barata que la primera.
2. **Oriente Medio y Asia Central** no llegaron a donde llegaron las demás: 69% y
   59%. El desierto sirio, el Néguev, el Sinaí y la estepa kazaja siguen
   descubiertos.
3. El **Ennedi** sigue vacío hasta el 800 y debería pintarse; necesita una entidad
   sahariana propia que no arrastre el Erdi y el Mourdi.
4. Los cortes del año 1 y el 500 apenas se han movido en dos rondas (14,1% y
   13,4%): ahí el hueco no es de sustrato sino de las entidades imperiales, que
   dejan intersticios.
5. El salto de -500, donde el modelo cambia de cerámicas a pueblos, sigue sin
   revisar.

---

## Ronda 36 — la segunda pasada, y cuatro fallos en mi propio registro

Las rondas 34 y 35 metieron dieciséis sustratos continentales. Ésta es distinta:
**ya no faltaba modelo, faltaba que el que había llegase**. Los huecos que
quedaban no estaban descubiertos por ausencia de sustrato sino porque los
contornos se quedaban cortos o los arcos no encadenaban.

### La taiga komi, cerrada tras ocho rondas

El hueco más viejo anotado en esta campaña —aparece por primera vez en la ronda
28 y seguía abierto— resultó no ser un contorno corto sino **tres milenios sin
ninguna entidad**: el Vychegda, el Vym, el Pechora, el Izhma, el Usa y el alto
Kama están vacíos desde el -4000 hasta 1478, y no existía entidad permia ni por
id ni por nombre entre las 1.122. `ugrofineses_volga` muere en lat 61,9,
`boreal_fenoscandia` en lon 48,5, `samoyedos` empieza en el paralelo 66.

Se creó `permios` (-2000..1478), y la mitad occidental del mismo hueco —Onega,
Beloye, Sujona, Dvina Septentrional, Pinega— fue a `sami_fineses` como Chud de
Zavolochie y Ves de Beloozero hasta 1136, que es cuando entra Nóvgorod. Laponia
interior también, de -500 a 1478: es exactamente el eslabón entre
`boreal_fenoscandia`, que acaba en -500, y su propio periodo de 1478.

### Y tres entidades más en las Américas

`praderas_centrales` —la banda entre `praderas_norte`, que acaba en lat 43,0, y
`praderas_sur`, que empieza en 38,7—, `chile_central` y `altiplano_pueblos`.

El agente corrigió dos supuestos míos. En las Grandes Llanuras **no faltaba
sustrato**: existen cuatro entidades desde el -4500 y lo que faltaba era sólo la
banda intermedia. Y la caja de la Patagonia septentrional no era sobre todo
Neuquén: la mayor parte del vacío es chilena, y el problema no era la anchura de
`tehuelche` sino que `mapuche` empieza en 1300. Estirarlo hacia atrás habría
resucitado un etnónimo cuatro milenios, así que creó sustrato.

### Cuatro fallos en `vacios.js`, todos encontrados por agentes

El registro que se creó en la ronda 35 para que el vacío quedara documentado ha
resultado ser la pieza que más correcciones ha recibido, y todas por la misma
causa: **una caja gruesa afirma cosas que nadie ha comprobado.**

1. *(ronda 35, yo mismo)* La entrada "Groenlandia habitable" con `desde:-2500`,
   puesta entre las islas, **enmascaraba al casquete** para todo el arco
   posterior, porque `legitimo` devuelve la primera coincidencia. Corregido
   ordenando de más específico a menos.
2. *(ronda 35, agente de Oriente Medio)* La caja del Rub al-Jali `[45,56,17,23]`
   **se comía la costa de Dhofar**: Salalah está en 54,1/17,0. Declaraba
   deshabitado el puerto del incienso. Partida en dos.
3. *(ronda 36, agente de las Américas)* La caja de las islas de la Reina Isabel
   recortaba **la punta norte de la isla de Banks** (74,33 N), que no es una isla
   de la Reina Isabel —ésas están al norte del canal de Parry— y tiene ocupación
   pre-Dorset documentada. Borde subido a 74,7.
4. *(ronda 36, mismo agente)* La caja del Atacama absoluto se comía **la
   precordillera de Tarapacá y el altiplano chileno** —Camiña, Isluga—, poblados
   desde el Formativo. Reducida a la depresión intermedia y la pampa del
   Tamarugal.

Los dos agentes que encontraron los fallos 2, 3 y 4 hicieron lo mismo y lo
correcto: **respetaron el registro y lo dejaron anotado en vez de corregirlo por
su cuenta**. Es lo que permitió comprobarlo y arreglarlo bien.

### Dos cajas de océano en `paleoesquimales`

`audit.js` destapó dos rectángulos de cuatro vértices que contradecían el propio
registro. Uno, en -2600..-900, sobre Islandia: **sólo el 8% de esa caja es
tierra**, o sea 9,6 grados² de océano abierto pintados como paleoesquimales, y el
pedazo de tierra que había es Islandia antes del Landnám. El otro, en 1262..1300,
104 grados² con cuatro vértices sobre **el inlandsis de Groenlandia**, donde la
ocupación de Independencia y Thule es la franja litoral y no la capa de hielo.
Las dos retiradas aplicando el registro.

Queda escrito de paso que la caja del casquete groenlandés se queda corta por el
oeste: el inlandsis llega más allá del meridiano -48. Una caja no describe bien
una capa de hielo con margen litoral estrecho, y conviene saberlo.

### Resultado

| año | hueco real antes | después |
|---|---|---|
| -3000 | 20,0% | **17,3%** |
| -2000 | 16,0% | **12,2%** |
| -1000 | 14,2% | **9,8%** |
| año 1 | 14,1% | **7,9%** |
| 500 | 13,4% | **7,4%** |
| 1000 | 10,2% | **6,0%** |
| **acumulado** | **9,6%** | **6,8%** |

Los cortes del año 1, el 500 y el 1000, que llevaban dos rondas sin moverse, se
han reducido casi a la mitad.

### Cifras

| | ronda 35 | ronda 36 |
|---|---|---|
| civilizaciones | 1.122 | **1.126** |
| periodos | 12.508 | 12.606 |
| anillos | 108.160 | 109.049 |
| mayor solape instantáneo | 0,056 | **0,196 grados²** |
| hueco real acumulado | 9,6% | **6,8%** |
| cajas | 0 | **0** |
| defectos de forma | 44 | **41** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

El mayor solape sigue siendo invisible: 0,196 grados² son unos 2.000 km² en un
mapa de 149 millones.

### Pendiente

1. **Los lotes C y D de esta ronda, no llegados a escribir**: la estepa, Asia
   Central y el Tíbet (93 + 45 celdas en la ventana -500..1000) y el Sáhara con
   el Sahel (36 + 14). Son los dos grupos grandes que quedan de esa ventana.
2. **El -3000 sigue en 17,3%**, que es el corte más alto con diferencia. Ahí el
   trabajo restante es de sustratos que no llegan a su propio principio de arco.
3. Anotado por los agentes y sin tocar: `samoyedos` tiene el borde meridional
   clavado en el paralelo 66,0 a lo largo de setenta grados de longitud, que es
   una caja y merece revisión propia; `kazajos_nomadas` parpadea en la estepa del
   Irtish, encendiéndose y apagándose once veces entre -900 y 1200, que es
   intermitencia y no hueco; el estuario del Amazonas y la costa de Pará; los
   valles de Cochabamba y el callejón de Huaylas, que exigen reformar
   `andes_centrales` y merecen lote propio; y la Kulunda, que necesita que alguien
   de la estepa suba, no que la taiga baje.
4. El **Ennedi** sigue vacío hasta el 800.
5. El salto de -500, donde el modelo cambia de cerámicas a pueblos, sigue sin
   revisar.

---

## Ronda 37 — el milenio más antiguo, y el registro se corrige tres veces más

Al terminar la ronda 36 el hueco estaba concentrado en el extremo antiguo: el
corte del -3000 en 17,3%, más del doble que cualquier otro. Esta ronda ataca esa
ventana.

### Siete sustratos más

**La estepa y el bosque euroasiáticos** eran el hueco mayor que le quedaba al
mapa: 251 celdas y 843 celda-corte, un tercio de todo lo que faltaba en la
ventana antigua. El diagnóstico es el mismo que en Europa y en China: Yamna,
catacumbas, Srubna, Andrónovo, Afanásievo, Okúnev y Karasuk son horizontes
reales pero **sucesivos y parciales**, y entre ellos y debajo de ellos había
población continua. Cuatro sustratos por ecosistema: `estepa_ponto_caspica`
(-4000..-800), `bosque_volga_kama` (-4000..-500), `taiga_obi_yenisei`
(-4000..-500) y `dzungaria_altai` (-4000..-500).

**Siberia nororiental y Alaska**: `taiga_yana_kolima` (-4000..-1000), que entrega
a `yukaguiros` exactamente donde éste arranca; `taiga_lena_ojotsk` (-4000..-500),
que entrega a `evenkos`; y `norte_alaska_antiguo` (-4000..-1000), que entrega a
`alaska_oeste`. Los tres se cortan en la fecha en que empieza quien los releva,
no en una redonda.

### El registro se corrigió tres veces más, y una fue por omisión

`vacios.js` llevaba cuatro fallos documentados al empezar la ronda. Ahora lleva
siete, y los tres nuevos los encontraron los agentes:

5. *(agente de la estepa)* La caja del Taklamakán `[78,90,36,42]` **contradecía
   su propia razón escrita**: el texto decía que el corredor de oasis quedaba
   fuera, y la caja se tragaba Kucha, Aksu y Korla. Al corregir el borde norte
   quedaba dentro Jotán; al corregirlo otra vez, Cherchen. La lección: **los
   oasis del Tarim no rodean el erg por un lado, lo rodean entero**, y cualquier
   caja generosa se come alguno. Reducida al mar de dunas central.
6. *(agente de Siberia nororiental)* La entrada del Ártico americano, creada al
   preparar esta misma ronda, decía cubrir Groenlandia entera y **su borde sur
   plano en lat 66 dejaba fuera** Southampton, Coats, Mansel, media Baffin,
   Nunavik y el suroeste groenlandés, que baja a 59,8 en el cabo Farewell. Y el
   arreglo no era bajar la caja: entre lon -140 y -95 el bosque de dene y cree
   llega a lat 60 y estaba poblado. Se partió en tres entradas ceñidas al este.
7. *(mismo agente, por omisión)* **Las islas de Nueva Siberia** no estaban en el
   registro y nunca tuvieron población permanente: descubiertas en 1712, sólo
   caza estacional de marfil de mamut. Mismo caso que Severnaya Zemlia.

El agente de Siberia nororiental además **descartó su tercer hueco entero**, y el
descarte vale más que un relleno: mi encargo decía que el norte de Quebec era
bosque poblado por antepasados de innu y cree, y midió que las 24 celdas vacías
caen todas **al norte del límite del bosque**, que `cree_innu` ya llega a lat
58,8, y que doce de ellas ni siquiera son Ungava sino Southampton, Coats, Mansel
y el sur de Baffin. La respuesta correcta era que allí no había nadie.

### Una herramienta menos y una fuente de verdad

`queda.js` llevaba su propia lista de desiertos codificada a mano, y se quedaba
desfasada cada vez que el registro se corregía —siete veces entre las rondas 35 y
37—. Se sustituye por **`cobertura.js`**, que no tiene lista propia: pregunta a
`vacios.js`. Una sola fuente de verdad para todo el instrumental.

### Resultado, separando trabajo de medición

Como parte de la mejora viene de que el registro cuenta ahora bien el vacío
legítimo, conviene separarlo. Las tres columnas son: el mapa antes de esta ronda
medido con el registro viejo; el mismo mapa medido con el registro nuevo; y el
mapa después del trabajo.

| año | antes (registro viejo) | antes (registro nuevo) | después |
|---|---|---|---|
| -3000 | 17,3% | 13,0% | **6,8%** |
| -2000 | 12,2% | 11,8% | **6,4%** |
| -1000 | 9,8% | 9,4% | **6,2%** |
| año 1 | 7,9% | 7,0% | **7,0%** |
| 500 | 7,4% | 6,8% | **6,8%** |
| 1000 | 6,0% | 5,7% | **5,7%** |
| **acumulado** | **6,8%** | **6,1%** | **4,6%** |

Es decir: de los 2,2 puntos que baja el acumulado, **0,7 son medición corregida y
1,5 son trabajo**. Y el perfil queda por primera vez plano: entre el 6% y el 7%
en toda la era antigua, por debajo del 4% desde 1500.

### Cifras

| | ronda 36 | ronda 37 |
|---|---|---|
| civilizaciones | 1.126 | **1.133** |
| periodos | 12.606 | 12.673 |
| anillos | 109.049 | 109.422 |
| entradas del registro de vacíos | 38 | **42** |
| hueco real acumulado | 6,8% | **4,6%** |
| hueco real en -3000 | 17,3% | **6,8%** |
| cajas | 0 | **0** |
| defectos de forma | 41 | **42** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

**Se ha alcanzado la meta que se puso en la ronda 33**: 3-5% en el mundo antiguo
y menos del 1% de 1500 en adelante. El mapa está en 4,6% acumulado y 0,7% en el
año 2000.

### Pendiente

1. Los grupos que quedan de la ventana antigua y no dio tiempo a atacar: **el
   Sáhara y el Nilo** (45 celdas, 195 celda-corte, lon 14..38 / lat 14..32), el
   **sureste de Norteamérica** (41), las **praderas del norte** (24), y tres
   manchas marcadas "nadie, nunca": Mauritania (11 celdas), el norte de México
   (7) y el Sáhara nigerino (5).
2. **Inversión de modelo**, señalada por el agente de la estepa y que no produce
   hueco, así que ningún instrumento la ve: `estepa_kazaja` pasa de 292 grados²
   a 31 cuando `andronovo` se la come entera. **El sustrato desaparece bajo la
   cultura concreta en vez de al revés**, que es justo lo que esta campaña
   corrige. Merece una pasada propia buscando ese patrón en todo el mapa.
3. El litoral de Ojotsk entre Ayán y Magadán y el norte de Sajalín, vacíos desde
   el -500; el delta del Kolimá; el Penzhina y la costa oeste de Kamchatka; y el
   delta Yukón-Kuskokwim, porque `unangan_yupik` empieza en el -3000 pese a que
   las Aleutianas tienen ocupación desde el -6500 en Anangula.
4. El Ennedi; `samoyedos` con el borde clavado en el paralelo 66; el parpadeo de
   `kazajos_nomadas` en el Irtish; los valles de Cochabamba y el callejón de
   Huaylas, que exigen reformar `andes_centrales`.
5. El salto de -500, donde el modelo cambia de cerámicas a pueblos.

---

## Ronda 38 — las manchas, y un resultado negativo que valía la pena

Al terminar la ronda 37 el mapa estaba en 4,6% de hueco real y ya no quedaban
regiones enteras descubiertas. Esta ronda cierra manchas.

### Primero, el detector que dice que no hay defecto

La ronda 37 dejó anotado un patrón que preocupaba: `estepa_kazaja` pasa de 292
grados² a 31 cuando `andronovo` aparece. **El sustrato desaparece bajo la cultura
concreta en vez de al revés**, que es lo contrario de la regla que la campaña
lleva cinco rondas aplicando. Y ningún instrumento lo veía: no deja hueco, no
produce solape, no tritura anillos, no revierte cobertura.

Se escribió `sustrato.js` para buscarlo. Encuentra seis casos y 223 grados². Y al
mirar **el suelo** en vez del área de la entidad:

  estepa_kazaja en -2000   234 celdas, CERO sin dueno (andronovo 185)
  cuman en 1236            107 celdas, UNA sin dueno
  celtas en 43             110 celdas, ocho sin dueno (rome 94)
  altai_sayan en 460        91 celdas, TREINTA Y CINCO sin dueno

Es decir: **el patrón no existe en forma dañina.** Cuando un sustrato cede ante
una cultura concreta que cubre el mismo suelo, el mapa está bien; eso es la regla
del sustrato funcionando, no fallando. Y el único caso con suelo huérfano
—`altai_sayan` en el 460— es un hueco corriente que `reversion.js` e
`inventario.js` ya detectan. No hacía falta una clase nueva de defecto.

La herramienta se conserva por el resultado negativo, que vale tanto como uno
positivo, y con la lección escrita dentro: *medir el área de la entidad engaña;
hay que medir el suelo. Un sustrato que se encoge no es noticia; un trozo de
tierra que se queda sin nadie, sí.*

### Las seis manchas más persistentes

Cada una vacía entre 8 y 16 de los 22 cortes temporales, y ninguna necesitaba
entidad nueva: las seis tenían un vecino que se quedaba corto.

| mancha | cortes vacía | resuelta con |
|---|---|---|
| divisoria Viliui-Tunguska | **16 de 22** | `evenkos`, que la rodeaba sin cubrirla |
| cuencas de Wyoming | 14 | `gran_cuenca` y `llanos_altos`, por la divisoria |
| altiplano de Zacatecas | 12 | `pueblos_norte_mexico`, antes de `chichimeca` |
| Azawagh y Tamesna | 12 | `sahel_pueblos`: pastizal, no Ténéré |
| estuario del Amazonas | 11 | `caribes_guayanas` al norte, `ge_cerrado` al sur |
| ceja de selva del Perú | 11 | `andes_centrales`, corta por los dos lados |

### Y los dos grupos grandes del Viejo Mundo

Resueltos también por ensanche, no por creación: `tibet_antiguo` sobre el Ngari,
el Amdo y el Kham —dejando fuera el Changtang y el Qaidam—; `hindu_kush` sobre el
Hazarajat, el Badajshán y el Wakhán; `altai_sayan` sobre la franja entre la
estepa y la taiga; `pueblos_sahara` sobre el Ennedi, el Ouaddaï y el norte de
Darfur; y `nilo_sudan` y `beja` sobre el Atbai y las colinas del Mar Rojo.

**El Ennedi se cerró por el lado contrario.** La ronda 35 lo dejó anotado y sin
resolver porque subir el borde del sustrato sudanés habría metido de paso el Erdi
y el Mourdi, que sí son desierto. La solución era la inversa: no es el Sahel
quien sube, es `pueblos_sahara` quien baja. El Ennedi tiene la guelta de Archei,
con agua todo el año.

### Octava entrada del registro

`vacios.js` gana la **cuenca del Qaidam**: costra salina, lagos secos y yardangs
a 2.700 metros, sin población fija. Explicaba una parte del vacío tibetano de lat
36-38 que el inventario contaba como trabajo pendiente. Esta vez el fallo era por
omisión y lo encontré yo midiendo, no un agente.

### Resultado

| año | antes | después |
|---|---|---|
| -3000 | 6,8% | **5,1%** |
| -2000 | 6,4% | **4,7%** |
| -1000 | 6,2% | **4,6%** |
| año 1 | 7,0% | **5,3%** |
| 500 | 6,8% | **5,4%** |
| 1000 | 5,7% | **4,8%** |
| 1500 | 3,8% | **3,5%** |
| 2000 | 0,7% | **0,7%** |
| **acumulado** | **4,6%** | **3,7%** |

Ningún corte de la línea del tiempo pasa ya del 5,4%.

### Cifras

| | ronda 37 | ronda 38 |
|---|---|---|
| civilizaciones | 1.133 | 1.133 |
| periodos | 12.673 | 12.880 |
| anillos | 109.422 | 111.115 |
| entradas del registro de vacíos | 42 | **43** |
| hueco real acumulado | 4,6% | **3,7%** |
| cajas | 0 | **0** |
| defectos de forma | 42 | **40** |
| estructura | 0/0/0/0/0 | 0/0/0/0/0 |
| capitales | 306/306 | 306/306 |

**Cero entidades creadas en toda la ronda.** Es la primera desde la 33, y es la
señal de que el mapa ha cambiado de fase: ya no le falta modelo, le falta
puntería.

### Pendiente

1. Lo que queda del Viejo Mundo, ya en grupos pequeños: el bosque de Ucrania y el
   Volga medio (75 celdas, intermitente), Arabia meridional (55), el Cáucaso
   (49), Mongolia y Manchuria (101), el Sayán (57).
2. Norteamérica templada: 72 celdas intermitentes del golfo de México a Manitoba.
3. La costa oriental de Groenlandia, donde la ocupación fue real pero intermitente
   y con abandonos documentados: es de los pocos sitios donde el descarte puede
   valer más que el relleno.
4. Marajó y el bajo Tocantins piden una entidad marajoara propia antes que un
   ensanche.
5. Los valles de Cochabamba y el callejón de Huaylas, que exigen reformar
   `andes_centrales`.
6. El salto de -500, donde el modelo cambia de cerámicas a pueblos, sigue sin
   revisar.

---

## RONDA 39 — La pregunta correcta y lo que las herramientas no veían

La ronda empieza con una pregunta del usuario: *«entonces dirías que civs ya
está completado?»*. La respuesta honesta era que no podía contestarse con lo
que se venía midiendo. **La cobertura y el no-solape son topología, no verdad
histórica**: un mapa puede teselar el planeta perfectamente y estar equivocado
en todas partes. Así que se fue a medir lo otro, y lo otro dio dos sorpresas,
una sobre el instrumento y otra sobre el mapa.

### La sorpresa del instrumento: 231 avisos, casi ninguno real

`rotulos.js` declaraba 138 `!T` (dice tener una plaza y no la pinta), 68 `!A`
(anacronismos) y 25 `!N`. Se leyeron uno a uno. De trece `!T` sacados al azar,
**doce eran falsos positivos**, y de los seis `!A` que apuntaban hacia adelante
—los únicos sospechosos— **los seis**. Los textos, literales:

| rótulo | por qué no afirma nada |
|---|---|
| `carthage` «Alalia (535), Himera (480) y los tratados **con Roma**» | Roma es la otra parte del tratado |
| `epiro` «**Nicea** anexiona Tesalónica» | Nicea es el sujeto, no el objeto |
| `crimean_khanate` «**Caffa sigue siendo genovesa**» | dice exactamente lo contrario |
| `gujarat` «Muzaffar **rompe con Delhi**» | ruptura, no posesión |
| `ducado_varsovia` «**Ocupación** rusa…; **Viena** lo disuelve» | «ocupa» casaba dentro de «Ocupación», y era rusa |
| `fatimid` «en La Meca la jutba fatimí **es nominal**» | el propio rótulo se matiza |
| `mossi` «resisten **hasta** la conquista francesa **de 1896**» | 1896 es el término del arco, no la fecha del tramo |

Es la quinta vez en la campaña que aparece la misma familia de error, y por
quinta vez con otro disfraz: contar **periodos** medía el trabajo de `parte.js`
(ronda 27), contar **vértices** se dejaba engañar por las fusiones (28),
multiplicar por **duración** lo dominaban los arcos largos (35), y ahora contar
**coincidencias de cadena** medía el extractor y no el mapa. La regla general ya
se puede escribir de una vez:

> **Una métrica que se calcula sobre una unidad que otra herramienta manipula
> libremente —periodos, vértices, años, coincidencias de texto— mide esa
> herramienta. Siempre hace falta un compañero instantáneo e independiente.**

Cuatro reglas, todas sacadas de leer los casos y no de adivinar, arreglan el
extractor:

1. **El verbo debe preceder al topónimo.** En castellano el orden es
   sujeto-verbo-objeto: «toma Bagdad» afirma; «Nicea anexiona» no dice nada de
   Nicea.
2. **El verbo debe ser palabra entera.** «ocupa» no puede casar dentro de
   «Ocupación».
3. **Una negación explícita manda sobre cualquier verbo suelto** («sigue
   siendo», «es nominal», «rompe con», «presión de», «frente a»).
4. **Un año detrás de HASTA es un término, no una fecha del tramo.**

Y dos correcciones más de la misma lectura: se agrupa por *(entidad,
afirmación)* —`mossi` sola aportaba quince avisos idénticos que `parte.js`
había multiplicado—, se aplica al topónimo la misma espiral de píxel de agua
que ya tenía `plazas.js` (las tres acusaciones sobre Constantinopla eran el
Bósforo), y se separan las marcas débiles de las fuertes: `!a` para las citas
hacia atrás, que casi siempre son legítimas, y `!n` para las negaciones sin
fecha anterior al tramo, que la geometría no puede adjudicar.

| | antes | después |
|---|---|---|
| `!A` anacronismo hacia adelante | 68 | **0** |
| `!T` dice tener y no pinta | 138 | **15** |
| `!N` dice no tener y pinta | 25 | **0** |

De los 15 `!T` que sobreviven, trece son de una sola forma —la frase nombra al
**rival** que sí tomó la plaza: «Baibars toma Antioquía», «Portugal toma Ceuta»,
«Ibn Saud toma La Meca»— y en las trece **el mapa acierta**. Quedaban dos de
verdad. Los dos resultaron ser los defectos más grandes del mapa.

### La sorpresa del mapa: dos reversiones que ningún instrumento veía

**1. La cuña vacía del Guadalquivir (1248–1492).** `castile` «Fernando III toma
Córdoba y Sevilla» y no pintaba Córdoba: la pintaba **nadie**. Al morir
`almohad` en 1248, Castilla no heredaba 36 de sus 50 celdas andaluzas. El hueco
se abría *exactamente* en el traspaso y se cerraba *exactamente* en 1492 con la
aparición de `spanish`: **244 años** con Córdoba, Jaén, Écija, Osuna, Baena y
Lucena sin dueño, en una cuña entre el límite sur de Castilla y el límite oeste
de Granada.

**2. El vacío posterior a Timur (1405–1470).** `moghulistan` «Yunus toma
Tashkent» y no pintaba Tashkent. Tirando del hilo apareció algo mucho mayor:
entre 1400 y 1410 Asia Central pasa de **7 celdas vacías a 281** —el 18% de la
región— y así sigue sesenta años. `timurid` cae de 769 celdas a 427 y **nadie
hereda las 342**: el Sir Daria, Fergana, el Pamir, el Tian Shan y el borde
occidental del Tarim se quedan sin dueño. El estado timúrida no se evaporó en
1405: Shahrukh gobierna Jorasán y Transoxiana hasta 1447 y Ulug Beg tiene
Samarcanda.

Las dos reparaciones usan el mismo mecanismo y la misma garantía: `anade mas`
talla y **la entidad procesada siempre pierde**, así que devolverle a Castilla
la campiña y a los timúridas su contorno de 1400 no puede quitarle un palmo a
Granada, a los kazajos, a la Horda de Oro ni a los nogayos. Solo se rellena lo
que estaba vacío. Granada se procesa antes que Castilla para quedarse la
serranía de Ronda, que fue nazarí hasta 1485.

| región | vacío antes | vacío después |
|---|---|---|
| Andalucía (289 celdas, 1250–1490) | 27 (9,3%) | **0** |
| Asia Central (1595 celdas, 1410–1490) | 281 (18%) | **35 (2%)** |

### Lo incómodo: los tres instrumentos globales no vieron nada

Se rellenaron 378 celdas de tierra que llevaban entre 60 y 244 años sin dueño, y
después de hacerlo:

- `cobertura.js` seguía dando **3,7%** de hueco real acumulado, la misma cifra.
- `plazas.js` seguía dando **208 discrepancias de 2704**, sin mover un dígito.
- `estructura` seguía en 0/0/0/0/0 y `capitales` en 306/306.

No es que los instrumentos fallaran: es que **su resolución es más gruesa que el
defecto**. 378 celdas sobre 37.460 celda-corte planetarias son 1,0%, y se
reparten entre cortes temporales que el promedio se traga. Y de las 230
plazas-testigo, **ninguna caía dentro de Andalucía ni del Sir Daria**. Una red
de testigos con agujeros del tamaño de Andalucía no es una red: se añaden cinco
plazas —Córdoba, Jaén, Tashkent, Samarcanda, Fergana— con su cronología, y las
45 sondas nuevas pasan las 45.

La conclusión metodológica es la que importa para lo que queda: **a partir de
aquí, los defectos son más pequeños que los instrumentos que los buscan.** La
detección tiene que venir de contradicciones internas —un rótulo contra su
propia geometría, un dueño que aparece y desaparece— y no de promedios.

### Estado verificado al cierre

```
civs 1133 | periodos 12891 | anillos 111074
estructura   malformados 0 vacios 0 solapes temporales 0 desordenados 0 solapes internos 0
capitales    306/306
cobertura    hueco real acumulado 3,7%
plazas       235 plazas | 2749 sondeos | 208 discrepancias | 0 solapes
rotulos      !A 0 | !T 15 (13 de ellas con el mapa acertando) | !N 0
solape_max   0,087 grado2 el mayor instantaneo | 46 pares por encima de 0,02
auto_int     1 anillo con autointerseccion -> reparado
astillas     28 anillos borrados, 0,05 grado2
```

**Una correccion al cierre de la ronda 38.** Aquella ronda dio por bueno un
solape instantaneo maximo de 0,196 grado2. Al volver a medirlo con el fichero
en la mano salieron **1,440**, y los dos peores pares —`siberia_occidental` con
`taiga_obi_yenisei` en -1000 y `marajoara` con `ge_cerrado` desde el 400— ya
estaban en el fichero de la 38 exactamente igual. La cifra de la 38 se midio
sobre un estado anterior a sus propias operaciones finales; no era del mapa que
se entrego. Los dos pares se han tallado ahora con la regla del sustrato —el
sustrato siempre cede— y el maximo baja a **0,087 grado2**, unos 900 km2, la
mitad de lo que la 38 creia tener. La leccion no es el numero sino el habito:
**una medida que no se toma sobre el fichero que se entrega no mide el fichero
que se entrega.**

### Pendiente

Se mantiene la lista de la ronda 38, y se le añade lo que esta ronda ha abierto:

1. **Buscar más reversiones del tipo Guadalquivir**: una entidad muere y su
   sucesor no hereda. `reversion.js` existe pero no sacó estas dos; hay que
   entender por qué antes de fiarse de sus 320.
2. Las 42 celdas que siguen vacías en Asia Central entre 1465 y 1500, y las 102
   de 1500 en adelante.
3. Ampliar la red de plazas-testigo por regiones y no por disputas: hoy está
   sesgada hacia fronteras célebres y deja continentes enteros sin un testigo.
4. Lo del Viejo Mundo en grupos pequeños (Ucrania, Volga, Arabia meridional,
   Cáucaso, Mongolia, Sayán) y Norteamérica templada.
5. Groenlandia oriental, Marajó, Cochabamba y Huaylas, el salto de -500.

---

## RONDA 40 — Tejer las dos redes

El usuario pregunto que recomendaba como siguientes pasos. La respuesta fue:
antes de seguir buscando defectos a mano, arreglar los aparatos que deberian
encontrarlos, porque los dos hallazgos de la ronda 39 no los encontro ninguna
herramienta. Esta ronda teje las dos redes que faltaban —el detector de
reversiones y la red de plazas-testigo— y usa la primera para reparar.

### La prueba que decidio empezar por ahi

`reversion.js` existe desde la ronda 31 exactamente para cazar «una entidad
muere y nadie hereda». Corrido sobre el mapa anterior a la ronda 39, donde los
dos defectos estaban:

```
grep -E '^(almohad|timurid) ' <lista de 145 entidades>   ->   nada
```

**`almohad` y `timurid` no aparecen. Ni en el puesto 40, ni en el 145.** Las dos
razones son la enfermedad de siempre, y ya van seis: malla de 3 grados —1.657
celdas de tierra en todo el planeta, Andalucia entera cabe en una— y cortes de
tiempo fijos que saltan de 1200 a 1400 y de 1400 a 1500, justo por encima de
1248 y de 1405.

### `orfandad.js`: ni malla ni cortes

Bajar la malla y meter cortes solo mueve el umbral de ceguera, asi que el
detector nuevo usa la estructura del mapa en vez de muestrearlo. Para cada
periodo de cada entidad calcula por algebra de poligonos **el suelo que cede**
al pasar al siguiente —o todo el suyo, si es el ultimo— y pregunta quien lo
tiene el ano del traspaso. Lo que no tenga nadie es orfandad. De ahi salen el
ANIO exacto, porque es un limite de periodo real y no un corte inventado; el
AREA exacta en grados2; y la CAJA, que es lo que hace falta para reparar.

**Calibracion contra respuesta conocida.** Un buscador que no encuentra lo que
ya sabemos que estaba no puede buscar lo que no sabemos, que es justo lo que le
pasaba al anterior. Corrido sobre el mapa pre-39:

```
timurid 1405   55.12 grado2 x 100 anios = 5512   [61.3 77.4 31.8 46.3]
almohad 1248    1.69 grado2 x 400 anios =  675   [-5.3 -1.8 36.3 37.9]
```

Ano, caja y duracion exactos en los dos. La prueba de calibracion queda escrita
en la cabecera del fichero para que nadie la salte.

**Lo que costo que terminase**, porque las cuatro lecciones sirven para la
proxima herramienta cara:

1. `recorte.aTierra` cuesta 0,1 s POR POLIGONO. Solo puede correr sobre lo que
   ya ha sobrevivido a todo lo demas, jamas sobre los candidatos.
2. Filtrar rivales por caja DE PERIODO no basta; por caja DE ANILLO, los
   rivales de un residuo medio bajan de cientos a diez.
3. `cubierto` se llama cien veces por candidato. Barriendo las 1.133 entidades
   son siete mil millones de comprobaciones: hace falta rejilla espacial.
4. Y lo que de verdad lo ahogaba: **el tamano del sujeto**. La cesion de una
   entidad que muere puede cubrir un continente. Troceada en PIEZAS —cada
   poligono suelto con su caja apretada— el coste se desploma y el resultado no
   cambia, porque la orfandad de una union es la union de las orfandades.

Y una trampa mas, la sexta de la familia, encontrada en la primera corrida
buena: la escalera de sondeo de la duracion era FIJA y sumaba 1.750 anios, asi
que para un hallazgo del -1000 se quedaba corta y devolvia «3.025 anios» por
defecto. `paleoesquimales` encabezaba la lista con 652.000 grado2-anio no por
el mapa sino por la longitud de la escalera de su propia herramienta. Ahora es
geometrica y llega siempre al final. **La regla, ya escrita seis veces: toda
constante interna de una herramienta acaba dominando la medida si no se la
vigila.**

Ademas separa dos listas, porque no se reparan igual: **traspasos fallidos**
(alguien lo recoge, tarde) y **suelo que nunca vuelve a tener dueno**, que casi
siempre es ignorancia legitima. Y consulta `vacios.js`: si la mayoria de los
puntos cae en el registro de vacios deliberados, que nadie lo pinte es la
respuesta correcta y no un defecto.

### La red de testigos, tejida por regiones

La ronda 39 reparo dos defectos de 244 y 60 anios y la sonda dio 208
discrepancias antes y 208 despues, sin mover un digito: **ninguna de las 235
plazas caia dentro de Andalucia ni del Sir Daria**. La red estaba sesgada hacia
fronteras celebres —83 plazas en el norte de Europa, 9 en Norteamerica, 3 en el
sur de Africa— porque se construyo mirando disputas conocidas y no geografia.

Cuatro agentes, uno por region, propusieron 153 plazas con cronologia
documentada. **124 sobrevivieron a la verificacion** —id existente, ano dentro
del arco de esa entidad, sin duplicar las que ya habia—, con cero entradas
malas. La red pasa de 235 plazas y 2.749 sondas a **359 y 3.511**, y ahora
cubre el Sahara y sus oasis, el bosque de Guinea, la cuenca del Congo, el
Cuerno, el Africa austral; el Artico americano, las praderas, el suroeste, la
Amazonia, el Chaco, la Patagonia; el Decan, Bengala, el Himalaya, el
archipielago malayo, Yunnan, Manchuria, el Tarim, el Tibet, la estepa y Siberia
entera; Iberia, Italia insular, Grecia, Escandinavia, el Atlantico norte, los
Alpes, el Magreb; y Oceania de punta a punta. Con sitios arqueologicos de
cronologia firme —Cahokia, Chaco Canyon, Tiwanaku, Chan Chan, Marajo, Germa—
porque la epoca antigua es donde el mapa esta menos probado.

**Lo que trajeron de propina vale mas que las plazas: veinticinco entidades que
al mapa le faltan**, cada una encontrada porque un agente quiso poner un testigo
y no tenia a quien atribuirselo:

| falta | consecuencia |
|---|---|
| `masina`, el imperio fulbe de Hamdallahi (1818-1862) | Tombuctu y Yenne sin dueno entre el ocaso arma y Francia |
| emirato de Harar (1647-1887) | `adal` acaba en 1577: Harar sin titular tres siglos |
| senussi (Cirenaica y Cufra, 1843-1913) | el oasis de Cufra insondeable |
| damagaram (Zinder), kololo (Barotselandia) | plazas descartadas |
| Qocho / uigures de Turfan (843-1284) | cuatro siglos de hueco en el Tarim oriental |
| Manchukuo (1932-1945), Yaqub Beg en Kasgaria (1865-1877) | el mapa dara `qing` donde no estaban |
| Ryukyu tras 1609, Taiping (Nankin 1853-64) | sin sucesor |
| Groenlandia nordica, Curazao, la America rusa aleutiana | Willemstad sale VACIO en 1550, 1650, 1800 y 1900 |
| Natchez espanola (1779-1798), Nutka (1789-1795) | |
| vandalos en Africa (439-533), reino de Mallorca (1276-1344) | Tunez y Tripoli sin sonda un siglo |
| Asturias-Leon (718-1230), Dublin nordico (841-1170) | solo existe `castile` con arco 718..1492 |
| Menorca britanica (1708-1802), Tanger internacional (1912-56) | |
| condominio de las Nuevas Hebridas (1906-1980) | Port Vila descartada |
| kanato uzbeko de Abu-l-Jayr (1428-1468) | encontrado al reparar la cola mongola |

Y ocho **cajas mal recortadas** que impiden sondear ciudades reales:
`orden_malta` y `malta` (caja 14,15,36,36; La Valeta esta en 35,90),
`hospitalarios_rodas` (caja degenerada 28,28,36,36), `ducado_atenas` (caja
23,24,38,39; Atenas esta en 37,98), `chamorro` (145,146; Guam es 144,75),
`saudeleur` y `micronesia_fsm` (Pohnpei es 158,21), `indonesia` (lat max 5;
Banda Aceh es 5,55), `taifa_menorca` (4,4,40,40: ningun punto real de la isla
cae dentro), `arma` (lat 14..17: Yenne, 13,91, queda fuera), `hueda` (caja
degenerada lon 2,2). Ninguna de estas la habria encontrado una herramienta:
salen de que alguien quisiera poner un testigo en un sitio concreto.

### Lo reparado con el detector nuevo

**La sucesion mongola** (segunda de la lista: 382 grado2 huerfanos dos siglos).
Al dividirse el imperio en 1260, los cuatro kanatos sucesores se dibujan mas
pequenos que el imperio que heredan, y la banda de en medio —el Altai,
Dzungaria, la estepa kazaja al norte de Chagatai, la Siberia meridional— no la
pinta nadie hasta 1370. A cada kanato se le dio **el contorno del propio
imperio en 1250 recortado a su zona**, no un dibujo nuevo, asi que la union de
los cuatro no puede salirse de lo que hubo. De 24% de vacio a 5-6%. Al hacerlo
aparecio la cola: la extension acababa en 1370 y ahi no habia relevo, asi que
la Horda de Oro se prolonga hasta 1430 sobre el Sir Daria —el ulus de la Horda
Blanca— y de paso queda anotado que falta el kanato uzbeko de Abu-l-Jayr.

**El salto de -500, la causa individual mas grande del mapa.** Unos 420.000
grado2-anio de los 2,1 millones —el veinte por ciento de toda la orfandad—
vienen de SEIS SUSTRATOS QUE ACABAN EL MISMO ANIO: `taiga_obi_yenisei`,
`boreal_fenoscandia`, `bosque_volga_kama`, `bosque_templado_europeo`,
`dzungaria_altai` y `taiga_lena_ojotsk`, todos -4000/-6000..-500. No es
historia: es la costura del modelo, donde el mapa pasa de organizarse por
culturas arqueologicas a organizarse por pueblos. Los sustratos se cortaron en
la costura y el relevo no cubre. Medido punto a punto sobre el contorno final
de cada uno:

| sustrato | cubierto por el relevo |
|---|---|
| `dzungaria_altai` | **0%** en -500 y en -300. Nadie, en absoluto |
| `bosque_volga_kama` | 28% hasta el 800 |
| `taiga_obi_yenisei` | 64% durante dos mil trescientos anios |
| `bosque_templado_europeo` | 70% hasta el 500 |
| `boreal_fenoscandia` | 91% |
| `taiga_lena_ojotsk` | 95% |

La gente del bosque y de la taiga no desaparecio en -500. Se prolonga cada arco
hasta el ano en que su relevo si cubre —medido, no supuesto— y despues se pasa
`anade mas` sobre el tramo nuevo para TALLARLO contra todos los vecinos. Esto
ultimo no es opcional: **`arco.js` NO TALLA**, y estirar un arco sin tallar es
doble pintado garantizado; fue la leccion de la ronda 32, cuando estirar
`srubna` y `catacumbas` puso 7.036 grado2-anio de doble pintura. Como la
entidad procesada siempre pierde, el sustrato queda debajo de todo: visible
solo donde no hay nadie, que es lo que un sustrato debe ser.

### Sobre el dibujo, que era la otra pregunta

`audit.js` daba 25 «trazo grueso» y 15 «ovalo». Esas tres medidas dicen que un
contorno es LISO; no dicen que este mal, y confundirlo seria el mismo error de
siempre. Un area cultural de taiga o de estepa no tiene ningun accidente al que
agarrarse: su frontera es difusa de verdad y dibujarla lisa es honesto. `dene`
con 34 vertices sobre el escudo canadiense no es un defecto; `ethiopia` como un
ovalo de once vertices si lo es, porque Etiopia tiene una forma que cualquiera
reconoce.

Se anadio un juez que parecia el bueno: que fraccion del area de cada contorno
cae sobre agua. **Salio 0% en los treinta y ocho.** Y no porque el mapa este
bien: porque todo pasa por `recorte.aTierra` antes de entrar, asi que **ningun
poligono puede contener mar por construccion**. La prueba era tautologica. Se
deja escrita en el fichero, con el resultado nulo, porque una prueba que no
puede fallar hay que reconocerla antes de fiarse de ella —y esta la escribi yo
en esta misma ronda, sabiendolo.

Lo que si queda comprobado sobre el dibujo: **las reparaciones de la ronda 39 no
metieron ni un tramo recto**. Las cajas que se usaron para rellenar Andalucia y
el Sir Daria se deshicieron al tallar contra los vecinos y al recortar a tierra;
`fronteras_modernas.js` no marca ni a `castile`, ni a `granada`, ni a `timurid`.
El unico tramo recto de `moghulistan` en lat 45,5 ya estaba antes.

### Y lo que abrio: el traspaso Yuan (1368)

Al cerrar la sucesion mongola de 1260, el detector volvio a correr y el primero
de la lista era nuevo: **`yuan 1368`, 92 grado2 sin dueno durante cuatro
siglos**. Es la misma forma otra vez —`ming` toma China, `northern_yuan` se
retira a Mongolia y entre los dos queda fuera una franja que en 1360 era Yuan—
y se reparo igual, dandoles el contorno de los Yuan en 1360 recortado a su zona.
El vacio de la region pasa de 15% a 2%. **Es la senal de que la lista se trabaja
en cascada: cada reparacion descubre la siguiente, porque un hueco grande tapa
al de al lado.**

### Estado verificado al cierre

```
civs 1133 | periodos 13230 | anillos 116069
estructura   malformados 0 vacios 0 solapes temporales 0 desordenados 0 solapes internos 0
capitales    306/306
cobertura    hueco real acumulado 3,4%   (venia de 3,7%)
plazas       359 plazas | 3511 sondeos | 274 discrepancias | 0 solapes
auto_int     0 anillos con autointerseccion al cerrar
astillas     2.063 anillos borrados en total, 4,10 grado2
orfandad     1.603.185 grado2-anio, de 2.186.292 al empezar: -27% en una ronda
```

### Pendiente

1. La lista de `orfandad.js`, que ahora es de fiar: quedan `macedon -321` (los
   diadocos no cubren lo de Alejandro), `northern_yuan 1634`, `rouran 520`,
   `uyghur_khaganate 840`, `kievan_rus 1240`, `harsha 647`, `mughal 1739`,
   `abbasid 945`, `xiongnu`, `escitas`, `lisimaco`. Todas son la misma forma:
   un imperio se deshace y los sucesores se dibujan mas pequenos.
2. Las veinticinco entidades que faltan, listadas arriba con su consecuencia.
3. Las diez cajas mal recortadas, que son baratas y desbloquean testigos.
4. Los sustratos africanos y asiaticos que ceden sin relevo:
   `selva_ecuatorial_africa 500`, `sabana_sudanesa 1000`,
   `sabana_oriental_cuerno 900`, `bantu_austral_temprano 1200`,
   `tibet_medieval 1162`.
5. Los contornos lisos con forma reconocible: `ethiopia`, `franks`,
   `saudi_arabia`, `tang`, `gupta`, `qin_guanzhong`. Hace falta un juez que no
   sea tautologico; el agua no vale.
6. Lo de siempre: Groenlandia oriental, Marajo, Cochabamba, Huaylas.

---

## RONDA 41 — Diez entidades nuevas, y tres encogimientos que no debieron pasar

Con el detector ya de fiar, esta ronda es la primera que se trabaja **desde la
lista** en vez de desde una corazonada. Y lo primero que enseño la lista es que
el detector señala DONDE, nunca QUE hacer: de los tres casos mas grandes, los
tres resultaron no ser problemas de sucesion.

### Una correccion mia, antes de nada

De las once "cajas mal recortadas" que los agentes de la ronda 40 dieron por
rotas, **diez no lo estaban**. Yo genere el fichero de referencia `ids.txt` con
las cajas redondeadas a grados enteros, y cuatro agentes razonaron
correctamente sobre un dato malo: `orden_malta`, con caja real
14,35..14,57 / 35,82..35,98, salia impresa como "14,15,36,36", y de ahi
concluyeron que La Valeta (35,90) quedaba fuera. Esta dentro. Lo mismo con
Atenas, Guam, Pohnpei, Menorca y Rodas —esta ultima es ademas un pixel de agua,
y el punto de tierra mas cercano si es del Hospital. Yo repeti su conclusion al
usuario como si fuera un hallazgo. **Una referencia redondeada no es una
referencia**, y `ids.txt` se regenera ya con dos decimales.

La unica que si estaba rota: `aceh` pinta Banda Aceh hasta 1949 y `indonesia`
no llega —su contorno acaba en lat 5,48 y la ciudad esta en 5,55—, asi que la
punta norte de Sumatra lleva sin dueno desde 1949. Un hueco en el mapa moderno,
que es el mas visible de todos. Reparado.

### Tres encogimientos que no debieron pasar

| caso | huerfano | dictamen |
|---|---|---|
| `mughal` 1739 | **91%** | no debio encogerse |
| `escitas` -330 | **92%** | costura entre arcos |
| `rouran` 520 | **59%** | no debio encogerse |

**Mughal 1739.** El rotulo del propio periodo lo dice: "Nader Shah saquea Delhi
y se lleva todo lo que hay al oeste del Indo". Eso es exactamente lo que paso:
Nadir saqueo Delhi, se llevo el tesoro y el Trono del Pavo Real, **repuso a
Muhammad Shah en el trono** y se marcho. Se anexiono lo transindico —Kabul,
Ghazni, Peshawar, Bannu, el Derajat, Thatta— y nada mas. Pero la geometria le
quito 86 grado2, de 219,6 a 133,7, y el hueco que dejo **incluye Delhi**. El
rotulo era correcto y el dibujo lo contradecia: la familia de defecto mas
dificil de ver, y la razon de que `rotulos.js` exista. Se le devuelve el
contorno de 1737 recortado al este del Indo hasta 1752, y lo transindico va a
`persia` (afsaridas) y desde 1747 a `afghanistan` (durrani).

**Escitas -330.** El repliegue escita es real pero `sarmatas` no empieza hasta
-300: treinta anios de costura entre dos arcos, con el rotulo escita diciendo
literalmente "presion sarmata". Se extiende el arco sarmata hacia atras
—Herodoto ya situa a los saurmatas al este del Tanais en el siglo V a.C.— y se
le da la estepa oriental que los escitas sueltan.

**Rouran 520.** En 520 no se pierde la estepa: hay una crisis dinastica, Anagui
es depuesto y huye al Wei del Norte, **pero vuelve en 522** y el kanato sigue
siendo la potencia dominante hasta 552, con Bumin de vasallo hasta ese mismo
ano. `gokturk` arranca justo en 552. El error fue adelantar la cesion treinta y
dos anios.

### La regla del sustrato contra el orden de `anade`

Al devolverle a `rouran` su contorno, el hueco se cerro —cero puntos sin
dueno— pero 105 de 260 se los quedaron cuatro sustratos, tres de ellos
prolongados por mi en la ronda 40. Y eso esta al reves. El motivo es mecanico y
conviene tenerlo escrito de una vez:

> `anade mas` talla haciendo que **la entidad procesada siempre pierda**. Eso es
> lo que hace segura la operacion cuando se rellena un hueco —no puede robarle a
> nadie— pero convierte al SUSTRATO en ganador, que es justo lo contrario de la
> regla del sustrato. Cuando se rellena un hueco donde un sustrato ya se ha
> extendido, hay que rematar con `resta_civ` en la direccion correcta.

### Diez entidades nuevas

Dos agentes especificaron, con fechas y anclajes, las que mas hueco dejaban:

| entidad | arco | por que faltaba |
|---|---|---|
| `masina` | 1818-1862 | Tombuctu y Yenne sin dueno entre el ocaso arma y Francia |
| `harar` | 1647-1887 | `adal` acaba en 1577: tres siglos sin titular |
| `senussi` | 1843-1913 | Cufra y el Borku eran sustrato |
| `vandals` | 439-533 | Tunez saltaba de `rome` (100) a `byzantine` (600) |
| `damagaram` | 1731-1899 | Zinder era sustrato del Sahel |
| `qocho` | 843-1284 | cuatro siglos de hueco en el Tarim oriental |
| `kanato_abuljayr` | 1428-1468 | el Sir Daria entre la Horda Blanca y Bujara |
| `yettishar` | 1865-1877 | el mapa daba `qing` donde los Qing no estaban |
| `guptas_posteriores` | 650-720 | Bihar sin dueno tras la muerte de Harsa |
| `manchukuo` | 1932-1945 | — |

**EL ORDEN DEL ALTA, que aprendi equivocandome.** `crea.js` no talla: mete la
geometria y deja el doble pintado. El orden correcto tiene tres pasos y no se
puede invertir:

1. crear sin tallar;
2. `resta_civ` para que pierdan **los vecinos que la entidad desplaza
   historicamente** —sin esto varias nacen invisibles: Harar esta entera dentro
   de la caja de `ethiopia`, Yettishar dentro de `qing`, Masina dentro de `arma`
   y `toucouleur`, Damagaram dentro de `sokoto`—;
3. y solo entonces `anade mas` sin geometria nueva, que dispara el tallado
   contra todo lo demas.

Lo intente al reves con tres de ellas y las tres restas devolvieron `area
4342,3 -> 4342,3`: **una resta no crea suelo, solo lo mueve**, y despues del
tallado la entidad ya no tiene alli nada que dar. Hubo que rehacerlas enteras.

Y tres correcciones que solo aparecen despues de tallar, cada una por una razon
distinta que ninguna herramienta podia anticipar: `manchukuo` perdia el 90%
ante `japan` —el agente que lo especifico ya lo habia avisado—, `vandals`
perdia Bizacena ante `bereberes_magreb`, y `senussi` perdia Cufra ante
`ottoman`. Al arreglar esta ultima la orden se llevo tambien Bengasi y Derna,
que eran otomanas de verdad hasta 1911 con gobernador, guarnicion y aduana: el
desierto era nominalmente otomano y realmente sanusi, pero la costa era otomana
de las dos maneras. Devuelta.

### Cuatro sucesiones repartidas

`saka_masagetas -100` a kangyu_wusun, kazajos_nomadas y turcomanos —cuyos
propios rotulos de esa epoca ya dicen "dahas y masagetas, nomadas iranios del
Caspio, no turcomanos"—; `uyghur_khaganate 840` a **los pueblos y no a un
estado**, porque los kirguises toman el Orjon pero no ocupan la franja gobi;
`harsha 647` a kannauj, karkota, pratihara, samatata, kamarupa, odra_kalinga y
licchavi_nepal; y `kievan_rus 1240` a halych_volinia, lithuania,
novgorod_republic y el bosque mari.

De este ultimo vale la pena guardar el criterio del agente, porque es el que
quiero para todo lo que queda: **el 38% restante lo dejo sin asignar a
proposito.** La banda Smolensk-Briansk y la Polissia no tienen titular en el
mapa, y atribuirla a `russia` —que en 1240 es Moscu y Vladimir— seria falso.
Un hueco honesto vale mas que un relleno falso.

### Estado verificado al cierre

```
civs 1143 (+10) | periodos 13432 | anillos 117134
estructura   malformados 0 vacios 0 solapes temporales 0 desordenados 0 solapes internos 0
capitales    306/306
cobertura    hueco real acumulado 3,4%
plazas       359 plazas | 3511 sondeos | 274 discrepancias | 0 solapes
orfandad     1.478.759 grado2-anio, de 2.186.292 al empezar la ronda 40: -32%
```

**Dos avisos del cierre, los dos utiles.**

El primero: las unicas dos discrepancias NUEVAS de plazas-testigo fueron
Shenyang y Harbin en 1935, donde el testigo esperaba `japan` y el mapa da ahora
`manchukuo`. **Aqui el testigo estaba equivocado y el mapa acerto**: la entidad
no existia cuando se escribio la lista. Corregido el testigo. Es la primera vez
en la campana que la red de testigos falla a favor del mapa, y conviene que
quede escrito que puede pasar.

El segundo: el solape `siberia_occidental` / `taiga_obi_yenisei` de 1,44 grado2
**volvio a aparecer**. Se tallo en la ronda 39; la 40 lo deshizo al prolongar el
arco del sustrato y volver a unir su propio contorno. La leccion:
**una talla no es permanente si despues se vuelve a unir la geometria de
origen**, asi que el solape maximo hay que medirlo en cada cierre y nunca dar
por resuelto lo que ya se resolvio una vez.

### Pendiente

1. En la lista del detector, ahora encabeza `macedon -321` (179 grado2 x 200
   anios): los diadocos no cubren lo de Alejandro. Detras, `abbasid 945`,
   `lisimaco -281` y `beduinos_arabia 1171`, que no llegue a repartir.
2. Los sustratos que ceden sin relevo fuera de Eurasia:
   `selva_ecuatorial_africa 500`, `sabana_sudanesa 1000`,
   `sabana_oriental_cuerno 900`, `bantu_austral_temprano 1200`.
3. Las entidades que siguen faltando, ya con caja y fechas propuestas por los
   agentes: Rohilkhand, los Bangash, los jats de Bharatpur, los estados rajput,
   el Sind kalhora y talpur, los guptas de Magadha ya creados pero con Gauda
   aun sin titular, Smolensk, Briansk, Polotsk, Dayuan, los yuezhi de Bactria,
   Ryukyu tras 1609, el Taiping, la Groenlandia nordica, Curazao, la America
   rusa aleutiana, las Nuevas Hebridas, Asturias-Leon, Mallorca, Menorca
   britanica, Tanger internacional.
4. Los contornos lisos con forma reconocible (`ethiopia`, `franks`,
   `saudi_arabia`, `tang`, `gupta`), que siguen sin juez: el agua salio
   tautologica.
5. Las 274 discrepancias de plazas-testigo, con dos patrones claros: enclaves y
   puertos coloniales mas pequenos que el trazo del mapa, e imperios pintados
   encima de sus propios miembros.

---

## RONDA 42 — Africa no se vacio en el ano 500

Ronda larga y de un solo tipo de trabajo: vaciar la lista del detector y crear
lo que faltaba. Trece entidades nuevas, cuatro sustratos africanos prolongados,
cuatro sucesiones repartidas y dos puertos recuperados.

### Lo mas grande: cuatro sustratos africanos cortados en seco

Cuatro sustratos acaban su arco y nada los releva. Medido punto a punto sobre
el contorno final de cada uno, el porcentaje de su propio suelo que TIENE
DUENO despues de que ellos mueran:

| sustrato | fin del arco | cubierto por el relevo |
|---|---|---|
| `selva_ecuatorial_africa` | 500 | 8% en el 700, 8% en el 900, **CERO en el 1100 y en el 1300**, 60% en 1500 |
| `bantu_austral_temprano` | 1200 | 18% |
| `sabana_sudanesa` | 1000 | 32% |
| `sabana_oriental_cuerno` | 900 | 39% |

Es decir: **la cuenca del Congo entera, sin un solo dueno, durante mil anios.**
Es el mismo defecto que el salto de -500 de la ronda 40 con otra costura: el
modelo pasa de culturas del hierro a estados, y donde no hay estado no queda
nadie. Prolongados los cuatro arcos hasta 1914 y tallados contra todos los
vecinos, el vacio de las cuatro regiones cae al 0-3% entre el 500 y el 1700.

### Trece entidades nuevas

`rajputana`, `rohilkhand`, `bangash_farrukhabad`, `bharatpur`,
`sind_kalhora_talpur`, `asturias_leon`, `mallorca_reino`, `smolensk`,
`briansk_chernigov`, `polotsk`, `groenlandia_nordica`, `curazao_abc`,
`rusia_america`. Con el orden de alta de tres pasos ya aprendido, y aun asi
tres de ellas nacieron invisibles y hubo que rehacerlas: Groenlandia entera
bajo `paleoesquimales`, Polotsk bajo `balticos`, y a Rusia-America le faltaba
`dene`. **Ningun agente puede anticipar esos tres: solo se ven despues de
tallar.** El bucle util es crear, tallar, sondear las capitales de lo creado, y
corregir.

Dos decisiones de los agentes que vale la pena guardar porque son el criterio
que quiero para lo que queda:

- **Rajputana como UNA entidad y no doce.** Razon: cada entidad nueva tiene que
  ganarle por separado a `mughal`, `maratha`, `afghanistan` y `sikh_empire`; con
  doce estados serian doce veces la misma pelea y Sirohi, Karauli o Kishangarh
  naceriean invisibles por ser de pocos pixeles. Hay precedente en el mapa
  (`himalaya_reinos`, `baisi_chaubisi`).
- **Ajmer tallado fuera a proposito.** Las cajas dejan un hueco en
  74,3-74,9 / 25,8-27,0: subah imperial hasta los 1750, maratha despues,
  britanico desde 1818. Un hueco honesto en vez de una atribucion comoda.

Y una recomendacion que anoto sin aplicar: **`castile` tiene arco 718..1492**, lo
cual es un anacronismo de tres siglos y medio. Entre 718 y 910 no existe
Castilla; de 910 a 1037 es un condado vasallo de Leon; de 1037 a 1157 las dos
coronas estan unidas bajo reyes que se titulan de Leon. `asturias_leon` le gana
en todo 718-1157 y en las tres cajas occidentales hasta 1230, pero el arco de
`castile` deberia empezar en 1065 o en 1157.

### Cuatro sucesiones mas

`macedon -321` repartido entre `antigonid` (Anatolia), `egypt` (Levante
meridional), `maurya` (el Indo, que Chandragupta toma en 305) y `persia` (Siria,
Mesopotamia, Iran y Bactria) —el mapa no tiene `seleucid` ni `ptolemaic`: usa
una entidad larga por cada solar—; `lisimaco -281` tras Corupedio entre
`antigonid`, `pergamon` (que nace justo ese ano), `persia` y el sustrato tracio;
`abbasid 945` entre `buyid`, `samanid`, `fatimid`, `saffarid` y el interior de
Arabia; y `beduinos_arabia 1171`, que caia de 101 a 43,8 grado2 con Saladino:
los ayubies toman el Hiyaz, no el Nechd.

### Los dos puertos que el sustrato destapo

Al prolongar los sustratos africanos, dos plazas-testigo que antes salian
VACIAS pasaron a salir con el sustrato encima, y la red las cazo: **Lagos**, que
el testigo espera de `benin`, y **Sofala**, que espera `swahili`. El sustrato no
robaba: rellenaba un sitio donde el estado no llegaba. El defecto era del
estado, y se reparo extendiendo el estado —Lagos fue puesto de avanzada de Benin
desde el siglo XV, Sofala el puerto suajili del oro del Zambeze hasta 1505.
**Este es el mecanismo que buscabamos desde la ronda 39: rellenar un vacio
convierte un hueco invisible en una discrepancia visible.**

### Cuatro testigos corregidos, y por que importa

Perpinan en 1300 esperaba `aragon` y el mapa da `mallorca_reino`; Smolensk en
1150 y 1230 esperaba `kievan_rus` y el mapa da `smolensk`; Unalaska esperaba
`russia` y el mapa da `rusia_america`. **En los cuatro el mapa acerto y el
testigo estaba anticuado**, porque la entidad correcta no existia cuando se
escribio la lista. Es la segunda ronda seguida en que pasa. Un testigo no es
una verdad eterna: es una afirmacion fechada, y cuando el mapa gana hay que
decirlo.

### Estado verificado al cierre

```
civs 1156 (+13) | periodos 13915 | anillos 123639
estructura   malformados 0 vacios 0 solapes temporales 0 desordenados 0 solapes internos 0
capitales    306/306
cobertura    hueco real acumulado 3,2%   (3,4% al empezar la ronda)
plazas       359 plazas | 3511 sondeos | 272 discrepancias | 18 huecos | 0 solapes
orfandad     1.272.862 grado2-anio, de 2.186.292 al empezar la ronda 40: -42%
```

### Pendiente

La lista del detector ha cambiado de naturaleza. Lo que encabeza ya no son
imperios que se deshacen sino **el mundo antiguo**:

```
ppnb            -6000   6,84 grado2 x 3200 anios
ceramica_lineal -4500   2,41 grado2 x 6400 anios
hongshan        -2900   3,02 grado2 x 4925 anios
kura_araxes     -2000   9,91 grado2 x 1600 anios
```

Son islas en un vacio, no huecos en un mapa: culturas arqueologicas que acaban
y no tienen relevo porque en el modelo no hay nada detras. Es el mismo problema
que resolvieron los sustratos continentales de la ronda 33, pero una capa mas
atras en el tiempo. Y con los del Artico y Siberia —`paleoesquimales -500`,
`amur_pueblos -300`, `siberia_occidental -500`— hay que decidir primero si esa
tierra estaba habitada de forma continua o no, que es cuestion del registro de
vacios y no del detector.

Lo demas sigue igual: los contornos lisos con forma reconocible sin juez, las
272 discrepancias de testigos con sus dos patrones -enclaves mas pequenos que
el trazo, imperios pintados encima de sus miembros-, y las entidades que aun
faltan (Bahawalpur, Saharanpur de Najib-ud-Daula, los guptas de Gauda, Dayuan,
los yuezhi de Bactria, Ryukyu tras 1609, el Taiping, las islas SSS, Menorca
britanica, Tanger internacional, las Nuevas Hebridas).

---

## RONDA 43 — El Imperio baja al fondo y los enclaves suben a la superficie

Ronda de las dos decisiones que el usuario tomo: **los enclaves solo los que
fueron eje de un imperio**, y **en los imperios gana el estado concreto**. Las
dos se aplicaron, y las dos destaparon algo mas grande de lo que arreglaban.

### El Sacro Imperio pasa a ser sustrato

Hasta ahora `holy_roman_empire` pintaba de corrido sobre Viena, Praga, Munich,
Dresde y Hamburgo, y el mapa estaba ademas **internamente incoherente**: Milan,
Zurich, Berlin y Bruselas SI aparecian como estados propios y los demas no. Se
crean nueve principados territoriales —`bohemia`, `bavaria`, `saxony`,
`brandenburg`, `hanover`, `wurttemberg`, `palatinate`, `hesse`, `mecklenburg`—
y una entidad `ciudades_libres_imperiales` con veintidos ciudades libres y
hanseaticas. Todos le ganan al Imperio, que queda solo donde no hay nadie: el
mosaico de condados, abadias y senorios que no vale la pena dibujar uno a uno.
Eso es exactamente para lo que sirve un sustrato.

Dos cortes argumentados que merecen quedar escritos:

- **`bohemia` acaba en 1526 y no sigue**, porque el periodo de `austria` que
  arranca ese ano se llama literalmente *"Fernando I hereda Bohemia y Hungria
  tras el desastre de Mohacs"*: seguir seria doble pintado por el mismo titulo y
  el mismo soberano.
- **`brandenburg` acaba en 1618 y no en 1525**, porque lo que se seculariza en
  1525 es el Estado teutonico en Prusia Oriental, feudo polaco de otra rama
  Hohenzollern. Los propios rotulos de `prussia_germany` lo dicen: 1525-1618 son
  "Secularizacion del Estado teutonico", y solo desde 1618 "Union personal con
  Brandeburgo".

### Y lo que eso destapo: Austria no contenia Viena ni Praga

Al hacer sustrato el Imperio salio a la luz un defecto grande y muy viejo:
**`austria` no pintaba Viena hasta 1699 ni Praga hasta 1804**, aunque el rotulo
de su periodo de 1526 dice literalmente *"Fernando I hereda Bohemia y Hungria"*.
Durante ciento setenta anios la entidad dibujaba Hungria y Croacia y no las
tierras patrimoniales de los Habsburgo. **El Imperio pintaba encima y por eso
nadie lo noto en cuarenta y dos rondas.** Es la familia de defecto mas dificil
de ver —el texto correcto y la geometria diciendo lo contrario— y aparecio no
por buscarla sino por quitar la capa que la tapaba.

Devuelto el bloque patrimonial (Austria, Estiria, Carintia, Carniola, Tirol) y
las tierras de la corona de Bohemia desde 1526, Viena, Praga, Brno, Innsbruck y
Graz son austriacas cuando deben, y Breslavia pasa a Prusia con Federico II sin
que haya que dibujarlo aparte: lo hace el tallado.

### Veintiseis enclaves

Goa, Cochin, Diu, Malaca, Ormuz, Mascate, Macao, Colombo, Mombasa, la isla de
Mozambique, Batavia, Dejima, Elmina, Luanda, Santo Tome, Cabo Verde, Gorea,
Ceuta, Gibraltar, Aden, Singapur, Hong Kong, Colonia del Sacramento, Caffa,
Corfu, Modon y Coron. Cuarenta y un tramos, con cambio de titular donde lo hubo.

El agente que los eligio descarto con criterio los que ya estaban bien
—Ragusa, Zanzibar, Malta y Curazao ya existian— y los que no son enclaves sino
provincias del propio imperio (Basora, Cartagena de Indias, Portobelo). Y
descarto **Tana y Azov** con un argumento que vale la pena guardar: la factoria
veneciana era una concesion de la Horda, no una posesion territorial, y no
quiso afirmar dominio.

**Un enclave es lo contrario de un relleno**, y por eso la operacion va al
reves de todo lo demas: aqui la entidad pequena tiene que GANAR a la grande.
Primero el hinterland suelta exactamente la caja durante exactamente el tramo;
despues el imperio la toma con NOCARVE. Al derecho no funciona: `anade mas`
hace perder a la entidad procesada, y Portugal en Goa perderia ante Bijapur.

### El fallo que me costo tres solapes

La sonda de plazas dio **tres solapes**, los primeros en muchas rondas:
`portugal+dutch_empire` en Luanda 1645 y `spanish+portugal` en Colonia del
Sacramento 1780. La causa esta escrita desde hace veinte rondas en la cabecera
de `anade.js` y me la salte:

> *"OJO: opera sobre el periodo ENTERO que solape el rango, asi que conviene
> pasar antes parte.js para alinear los cortes."*

Al dar Luanda a los neerlandeses en 1641-1648 y devolversela a Portugal en 1648,
el `menos` quito la caja del periodo portugues completo —1630..1650— y el `mas`
siguiente se la devolvio a ese mismo periodo. Resultado: los dos pintando. Se
arregla pasando `parte.js` por los 161 cortes de los 35 implicados y rehaciendo.
**La leccion no es tecnica sino de metodo: las advertencias de las cabeceras son
el unico sitio donde vive lo que ya costo caro, y saltarselas es repetir la
factura.**

### El instrumento otra vez mas grueso que el trabajo

Tras crear diez entidades alemanas, veintiseis enclaves y las ciudades libres,
la red de testigos se movio de 92,1% a 92,2%. **Ninguna de las 359 plazas caia
en Goa, en Macao, en Stuttgart ni en Schwerin.** Es exactamente lo de la ronda
40, y por eso el remedio se aplica ahora en el mismo momento y no en la ronda
siguiente: **quien crea algo, pone el testigo que lo vigila.** Veintiocho plazas
nuevas, ochenta y siete sondas afirmadas ANTES de mirar el mapa y comprobadas
despues: las ochenta y siete coinciden.

### Estado verificado al cierre

```
civs 1166 (+10) | periodos 14111 | anillos 126895
estructura   malformados 0 vacios 0 solapes temporales 0 desordenados 0 solapes internos 0
capitales    306/306
cobertura    hueco real acumulado 3,2%
plazas       387 plazas | 3598 sondeos | 267 discrepancias | 18 huecos | 0 solapes
precision    92,4% global
```

Precision por epoca, que es donde se ve lo que hizo la ronda:

| epoca | ronda 42 | ronda 43 |
|---|---|---|
| -500 a 500 | 95,8% | 95,8% |
| 500-1000 | 90,0% | 90,0% |
| 1000-1500 | 90,8% | 90,9% |
| **1500-1800** | **89,1%** | **90,2%** |
| 1800-1900 | 92,1% | 92,3% |
| 1900-hoy | 95,9% | 95,9% |
| **global** | **92,1%** | **92,4%** |

La franja 1500-1800 era la peor del mapa y sube 1,1 puntos, que es lo que se
esperaba: es la epoca de los enclaves y de los imperios sobre sus miembros, los
dos patrones que esta ronda ataco.

### Pendiente

1. Los estados eclesiasticos del Imperio (Colonia, Maguncia, Treveris,
   Salzburgo, Munster) y Lorena, Saboya y Toscana: Salzburgo sale hoy como
   Baviera.
2. La capa antigua (-6000 al ano 1) y la ampliacion del registro de vacios, que
   sigue siendo el mayor bloque de orfandad.
3. La decision del Artico y Siberia: si esa tierra estuvo habitada de forma
   continua.
4. Los contornos lisos con forma reconocible, aun sin juez.
5. `castile` con arco 718..1492 sigue siendo un anacronismo de tres siglos y
   medio: deberia empezar en 1065 o en 1157, ahora que `asturias_leon` existe.

---

## RONDA 43b — `fragmentos.js`: la figura y los anios

El usuario miro el globo y dijo: *"hay veces donde veo partes separadas de la
civ o como burbujas"*. Ninguna herramienta del proyecto medi­a eso.
`astillas.js` borra esquirlas por area pero no pregunta si tenian sentido;
`intermitencias.js` mira celdas que cambian de dueno, no entidades que se
rompen; `audit.js` mira si un contorno es demasiado liso, que es el defecto
contrario.

### La trampa, y es la de siempre

**Contar piezas no mide nada.** El 67% de los periodos del mapa tiene mas de una
pieza, y el campeon absoluto es `inuit` con **263**, que es el archipielago
artico y esta perfectamente bien. Una talasocracia son piezas por definicion.

### El discriminador es el agua, y esta vez no es tautologico

En la ronda 40 intente juzgar los contornos lisos por la fraccion de agua
DENTRO del poligono y salio cero en los treinta y ocho, porque todo pasa por
`recorte.aTierra` y ningun poligono puede contener mar por construccion. Aqui se
mira lo contrario: **el agua que hay alrededor de la pieza, fuera de ella**. Eso
no lo fija ninguna herramienta del proyecto, lo fija la geografia.

```
pieza rodeada de MAR    -> isla. Archipielago, posesion de ultramar, puerto.
pieza rodeada de TIERRA -> o enclave de verdad, o accidente del tallado.
```

Medido sobre cuatro mil piezas pequenas: **87% rodeadas de mar, 13% de tierra**.

Y para separar el enclave real del accidente, **la persistencia**: un enclave
historico dura -Prusia Oriental esta ahi dos siglos-, y una pieza que aparece en
un tramo y no esta ni en el anterior ni en el siguiente no es historia.

### Dos correcciones antes de fiarme de la primera cifra

La primera corrida dio 1.114 burbujas y 181.852 grado2-anio de peso. El hallazgo
numero uno era `sami_fineses` con una pieza de 33,7 grado2 junto al Ladoga, y no
era ninguna burbuja: era territorio sami de verdad durante mil doscientos
cincuenta anios, que en 750 pasa a los eslavos. Dos cosas fallaban:

1. **No se puede juzgar la persistencia en el primer ni en el ultimo tramo.** En
   el primero no hay un "antes", asi que cualquier pieza que se pierda despues
   parece efimera. La prueba solo podia fallar.
2. **Una pieza grande no es una burbuja.** Si mide una fraccion apreciable del
   bloque principal es una region, y ganarla o perderla es historia.

Corregido: **827 burbujas, 29.126 grado2-anio**. Los falsos positivos eran el
84% del peso. Y se anadio la companera instantanea -las mismas burbujas
ordenadas por area sin multiplicar por duracion- porque el peso lo dominan los
tramos antiguos, que duran siglos.

### Lo que la herramienta decide y lo que no

Honestamente: de los tres ejes, **solo uno es decidible sin historia**.

- **PARPADEOS** (171): la figura cambia y vuelve en el tramo siguiente. Eso esta
  mal siempre, diga lo que diga la historia. Es el resultado fiable.
- **BURBUJAS** (827): pieza en tierra que no persiste. Es una LISTA DE TRABAJO,
  no una lista de defectos: verificando tres al azar, una era un traspaso real
  (`andronovo` recibe del srubna y cede a los bashkires en un solo tramo) y otra
  no era ni siquiera efimera. Sirve para mirar, no para concluir.
- **SALTOS** (grandes cambios que no vuelven): puro material de juicio.

### El primer hallazgo verificado

`swahili` marcado como parpadeo en el corte de 1200: pasa de 3,7 grado2 a 16,3 y
vuelve a 3,4. Al mirarlo, **el que estaba mal no era el crecimiento sino el
encogimiento**. El contorno de 1200..1450 llega a lat -1,5 y lon 41,5 -el
archipielago de Lamu y Pate y la costa somali, Barawa y Mogadiscio-, que es
correcto para el apogeo suajili; y el tramo siguiente lo recorta a un tercio
mientras su propio rotulo dice *"Kilwa, Mombasa y Pate EN SU APOGEO antes de la
llegada portuguesa"*. Otra vez el texto correcto y la geometria contradiciendolo.
Devuelto el contorno del apogeo hasta 1600, con la regla del sustrato aplicada
para que los pueblos del interior cedan ante las ciudades del litoral.

### Estado al cierre

```
civs 1166 | periodos 14112 | anillos 126892
estructura 0/0/0/0/0 | capitales 306/306
fragmentos  827 burbujas (lista de trabajo) | 171 parpadeos (defectos) | 98.779 piezas examinadas
```

---

## RONDA 43c — La captura del Indo

El usuario mando una captura del globo en el -2992 con la Civilizacion del
valle del Indo dibujada como un bloque mas dos rectangulos de lados rectos y
una costura vertical entre ellos. Los vertices del segundo anillo eran:

```
[71.55,30.6] [71.8,30.6] [71.8,28.5] [73.5,28.5] [75,29.1]
[75,31.2] [72,31.2] [72,32.2] [71.55,32.2]
```

Nueve puntos, todos sobre coordenadas redondas, todos los tramos horizontales o
verticales. Una caja dibujada a mano con una muesca. Y la raya vertical de la
captura esta en lon 71,55 exacto: una costura de tesela de `recorte.parte`.

### Por que ninguna herramienta lo veia

Dos fallos de `audit.js`, y el segundo es estructural:

1. La prueba 'caja' exige llenar mas del 92% del rectangulo, y este llena el
   69%: **la muesca lo salvaba**. La firma correcta no es llenar el rectangulo
   sino que el PERIMETRO vaya en tramos exactamente horizontales o verticales.
2. **`audit.js` solo informaba del anillo MAS GRANDE de cada entidad.** El
   grande del Indo (22,6 grado2, 21 vertices) no daba la alarma, asi que el
   pequeno (8,8) no llegaba a mirarse nunca. Un apendice dibujado a mano al lado
   de un contorno decente era invisible por construccion.

Corregidas las dos: `audit.js` informa ahora de TODOS los anillos malos y anade
el motivo `rectilineo`. Resultado: **235 anillos con firma de dibujo a mano en
81 entidades** por encima de 10 grado2; barriendo desde 0,5 grado2 son **5.719
anillos en 276 entidades**, una cuarta parte del mapa.

**Y una parte es mia, de esta misma semana.** `kanato_abuljayr`, `senussi` y
otras entidades creadas en las rondas 41-43 salen marcadas como rectilineas:
nacieron de especificaciones por cajas, que es como pedi a los agentes que las
dieran. La caja es un buen formato para *decir donde*, y un mal formato para
*quedarse como contorno*. Habra que repasarlas.

### El Indo, redibujado

Cuatro fases con contornos que siguen la geografia -la costa del Makran, el
borde del Thar, el arco del Kutch, la peninsula de Saurashtra- en vez de
rectangulos:

| fase | que es | vertices | rectilineo |
|---|---|---|---|
| -3300..-2600 | Harappa temprano: Baluchistan y la llanura del Indo | 92 | 1% |
| -2600..-1900 | Harappa maduro: de Sutkagan Dor a Rupar, con Kutch y Saurashtra | 146 | 2% |
| -1900..-1600 | Harappa tardio: se abandona el occidente | 32 | 0% |
| -1600..-1300 | Fase final desplazada al Ghaggar oriental y Guyarat | 19 | 0% |

Comprobado por yacimientos: Mohenjo-daro, Harappa, Kalibangan, Ganweriwala,
Mehrgarh, Sutkagan Dor, Lothal y Rupar caen dentro en las fases que les tocan.
Dholavira en el Harappa tardio queda fuera por un motivo de resolucion y no de
modelo: esta en Khadir Bet, una isla dentro del Rann de Kutch, y a 1:50 millones
el recorte a tierra parte el anillo justo ahi.

### Elam, revisado y absuelto

El usuario nombro tambien a Elam. Sus anillos son 2% y 27% rectilineos, con
vertices en coordenadas reales: **no esta dibujado a mano**. Lo que se ve como
dos partes separadas es historia: Elam era exactamente eso, la Susiana baja y
Anshan en las tierras altas de Fars. Lo unico revisable es que los dos bloques
se tocan solo por una esquina, cuando el corredor de Ram Hormuz los unia.

---

## RONDA 44 — El circuito, no el caso

El usuario lo dijo claro: *"la idea es que puedas identificar estos casos y
revisarlos en vez de que yo haga cada uno. Son mas de 1000 civ con diferentes
topologias, sera imposible solo para mi"*. Tiene razon y era el encargo
correcto: el ojo humano no escala a 1.166 entidades y 14.000 periodos. Esta
ronda monta el circuito.

### 5.717 no era la cifra de trabajo

`redibujar.js` separa las cuatro cosas que producen un tramo recto, porque
confundirlas seria el error de siempre:

```
338    convencion de archipielago  (caja de mar a proposito, documentada)
4.438  costura de tesela           (recorte.parte cortando en tiras)
318    frontera recta posterior a 1700 (el paralelo 49, el reparto de Africa)
623    DIBUJO A MANO               <- el trabajo, en 166 entidades
```

De 5.717 a 623. Y de esas 166 entidades, **101 CONOCIBLES y 65 DIFUSAS**.

### La advertencia que va en la cabecera de la herramienta

> **Redibujar una caja sin saber donde estaba la frontera EMPEORA el mapa.** Una
> caja es fea pero honesta: dice "esto es una aproximacion". Un contorno sinuoso
> inventado dice "esto se sabe con precision", y es mentira.

Por eso la salida tiene dos columnas. CONOCIBLE: estados con frontera
documentada, o contornos con costa, rio o cordillera que seguir. DIFUSO: areas
culturales de estepa, taiga o sabana sin costa dentro, donde la frontera no
existia como linea y la caja es lo honesto. En las difusas la caja se queda.

### Y de las diez primeras de la lista, seis eran mias

`qocho`, `bohemia`, `polotsk`, `smolensk`, `brandenburg`, `saxony`: creadas en
las rondas 41-43 a partir de especificaciones por cajas, que es como se las pedi
a los agentes. **La caja es un buen formato para decir DONDE y un mal formato
para quedarse como contorno.** El circuito se estrena limpiando lo que metio
quien lo construyo.

### La primera tanda: dieciseis entidades

Dos agentes, ocho cada uno. El resultado importa menos que como llegaron a el:
**los dos se negaron a redibujar donde no sabian**, que es exactamente para lo
que se escribio la advertencia.

- `saxony` 1180-1423: *"la Sajonia ascania eran dos bloques inconexos; del
  Kurkreis no conozco el perimetro, y entregarte un anillo bueno y otro
  inventado seria peor que la caja. **Aqui la caja actual es mas honesta que
  cualquier contorno que yo dibuje**"*.
- `bavaria` 1803-1806: la mediatizacion produjo un mosaico de decenas de piezas.
  *"Tres rodajas de un ano con una linea sinuosa fingirian una precision que no
  tengo"*.
- `rashtrakuta` 973-982: tras el saqueo de Manyakheta no queda un imperio sino
  un resto. *"Si la quieres mantener, lo correcto seria redefinirla como Lata"*.
- `bunyoro` 1300-1680: tres fases fundidas en una, *"nadie conoce la frontera de
  Kitara a resolucion de cincuenta anios y tres contornos sutilmente distintos
  serian exactamente la precision inventada que estas quitando"*.

Y encontraron defectos que no estaban en el encargo:

- **`rashtrakuta`: el problema era la extension, no el trazo.** La caja metia
  Kutch, el Sind y Bundelkhand, que nunca fueron rashtrakutas.
- **`tiwanaku`: los rotulos nombraban Moquegua y Cochabamba y las cajas paraban
  antes**, asi que las colonias que el texto citaba caian fuera del poligono.
- **`bunyoro`: las cajas de 1815-1876 llegaban a 31,0 E**, con lo que Hoima y
  Mparo -la capital- quedaban fuera del reino, dentro del lago Alberto.
- **`south_arabia` 525-570 partia Yemen con un corte vertical recto en 44,22 E**,
  y esa particion no existio: Abraha goberno el reino entero desde Sana.
- **`bavaria` 1180**: el rotulo decia "Ratisbona y Amberg quedan dentro" y Amberg
  no fue Wittelsbach hasta 1269.
- **`chu_estado` -286**: el rotulo anunciaba la perdida de Ying ante Bai Qi y la
  geometria no la reflejaba.

Todos son de la misma familia: **el rotulo correcto y el dibujo contradiciendolo**.
Redibujar contornos esta destapando errores de contenido, igual que rellenar
vacios destapaba discrepancias de testigos en la ronda 42. Las dos cosas que
parecian cosmeticas resultan ser puertas.

### Estado

```
DIBUJO A MANO   623 -> 546 anillos  |  166 -> 151 entidades
                101 -> 86 conocibles pendientes
civs 1166 | periodos 14131 | anillos 126935
estructura 0/0/0/0/0 | capitales 306/306
```

A dos agentes y ocho entidades por tanda, las 86 conocibles que quedan son unas
cinco tandas mas. El circuito ya no necesita que el usuario encuentre los casos.

### Ronda 44, segunda tanda: dieciseis entidades mas

`buganda`, `wari`, `kakatiya`, `yan_estado`, `bhutan`, `sinhala`, `sakalava`,
`chalukya`, `briansk_chernigov`, `asiria`, `hanover`, `palatinate`, `ahom`,
`shang`, `jin_estado`, y la Tierra de Rupert de `british`.

**El aviso que salvo el mapa.** El agente encargado de `british` no entrego la
entidad con la clave normal: la llamo `british_SOLO_ANILLO_RUPERT` y escribio
por que. La fase 1670..1682 tiene **61 anillos** -Inglaterra, Irlanda, Jamaica,
Barbados, las Bahamas, las Trece Colonias- y `sustituye.js` reemplaza TODOS los
anillos de los periodos del rango: aplicarlo como una sustitucion normal habria
**borrado Inglaterra del mapa entre 1670 y 1763**. En su lugar dio una regla a
nivel de anillo -borrar los que caen dentro de una caja concreta- y la verifico:
selecciona 23-26 anillos por fase y **ninguno** en la fase anterior. Un agente
que entiende la herramienta lo bastante como para negarse a usarla vale mas que
uno que entrega.

**Y la Tierra de Rupert como prueba de la regla del proyecto.** La carta de 1670
concede a la Compania toda la cuenca de la bahia de Hudson: 519 grado2. Al
tallarla contra los pueblos que el mapa pinta desde la ronda 30 -cree, dene,
anishinaabe, praderas del norte y del noroeste- queda en 188. Winnipeg sale
`praderas_norte` y Edmonton `praderas_noroeste`. Es exactamente lo que el mapa
debe decir: **pinta quien gobernaba de hecho, no quien lo tenia escrito en una
carta real**, y no hizo falta decidirlo a mano, lo decidio el tallado.

**Defectos de contenido que aparecieron redibujando** -otra vez la misma
cosecha, y otra vez rotulos correctos con geometrias que los contradicen:

- **`ahom` 1752-1826: un agujero de setenta y cuatro anios en el corazon del
  reino.** El valle entero entre lon 92,2 y 95,4 vacio, con el reino partido en
  dos fragmentos extremos; Rangpur, Jorhat y Sivasagar -la capital- desaparecian
  justo bajo Rajeswar Singha, que controlaba el valle entero. Ninguna otra
  entidad ocupaba el hueco.
- **`asiria` -612..-609: Harran fuera de su propio contorno.** El rotulo la
  nombra y el anillo era una tira degenerada de cuatro vertices y 0,16 grados de
  alto que no la contenia; y seguia llevando el nucleo con Ninive dentro tres
  anios despues de la caida de Ninive.
- **`sakalava`: el rotulo decia "Menabe y Boina" y la geometria solo tenia
  Menabe.** Boina -Mahajanga, el Betsiboka- no estaba en el mapa.
- **`kakatiya` 1163-1250: el rotulo decia "expansion hasta Kanchi"** y la
  geometria cortaba 240 km antes; Kanchi ni siquiera cae dentro del arco.
- **`bhutan`: la caja se comia Sikkim entero, el valle de Chumbi, Tawang y la
  llanura de Assam**, y ademas tenia un bache de un anio en 1900 en que el reino
  se reducia a un retal de cuarenta kilometros.
- **`hanover`: Sajonia-Lauenburgo llegaba cincuenta y tres anios antes de
  tiempo**, mientras el propio rotulo decia "la linea de Celle lo hereda en
  1689".
- **`chalukya`: tres rotulos anacronicos**, uno de ellos citando a Vikramaditya
  II (733-746) y a Dantidurga (753) en una fase que acaba en 655.
- **`jin_estado` metia la cuenca de Nanyang**, que era de Chu; probable confusion
  con el Nanyang de Jin, que esta al norte del rio Amarillo.
- **`shang` daba una caja de 1,5 x 1,6 grados a Panlongcheng**, que es un solo
  sitio fortificado.

### Estado tras las dos tandas

```
DIBUJO A MANO   623 -> 497 anillos  |  166 -> 137 entidades
                101 ->  72 conocibles pendientes
civs 1166 | periodos 14160 | anillos 127195
estructura 0/0/0/0/0 | capitales 306/306
```

Treinta y dos entidades redibujadas en dos tandas, con cuatro agentes. Quedan
unas cinco tandas para las 72 conocibles.

---

## RONDA 45 — Tercera tanda, y un fallo mio en el detector

Dieciseis entidades mas redibujadas: `lu_estado`, `hesse`, `mecklenburg`,
`rai_sindh`, `qin_guanzhong`, `ikshvaku`, `guptas_posteriores`, `kaffa`,
`fante`, `bamum`, `moghulistan` y el tema de Sirmio de `byzantine`.

**Los agentes se negaron a tres entidades enteras y a varias fases**, con
argumentos que quiero conservar porque definen el criterio:

- `xiongnu`: *"el anillo marcado es una franja sobre el Sayan, Tuva y el
  Baikal. Ahi no hubo frontera: la sujecion de los dingling y los gekun era
  tributaria y estacional. **La caja es lo honesto y recomiendo dejarla**"*.
- `songhai`: los tres tramos marcados son el mismo anillo, el distrito salinero
  del Sahara. *"Ahi no hay frontera. Redibujarla empeoraria el mapa."*
- `adal`: las fases de la conquista de Gragn. *"Fue una ocupacion militar movil,
  sin frontera cartografiable; las rectas dicen 'aproximadamente la mitad
  oriental de Etiopia', que es honesto."*
- `ottoman`: tres anillos, ninguno reparable. Del de Azerbaiyan: *"solo se de
  verdad donde esta el norte; el sur depende de la linea de Ferhad Pasha de
  1590, que no se situar con dos decimales."*

Y encontraron, otra vez, mas errores de contenido que de trazo: `hesse` tenia
la Bergstrasse y el Odenwald **dos siglos antes** de la herencia de
Katzenelnbogen de 1479; `mecklenburg` estaba reducido a cuatro fragmentos de
0,21 grado2 entre 1660 y 1721 por un colapso de teselado, no por una perdida;
`fante` cruzaba el Pra hacia Ahanta; `guptas_posteriores` cruzaba el Ganges y
metia Mithila; `moghulistan` dejaba fuera Chira, Keriya y Niya y metia a cambio
un rectangulo de duna vacia; y `adal` 1529-1531 llevaba el rotulo *"Conquista de
Dawaro, Shewa, Amhara y Tigray"* sobre una geometria que no contiene ninguna de
las cuatro.

### El fallo del detector de parpadeos, y era mio

Ofreci los 171 parpadeos de `fragmentos.js` como *"el unico resultado fiable,
lo que esta mal siempre diga lo que diga la historia"*. Al ir a trabajarlos, el
primero -`cree_innu`, con 41.312 grado2-anio de peso, cuatro veces mas que el
segundo- resulto no ser un parpadeo: la entidad crece de 121 a 327 grado2 en 800
y **se queda ahi**. Depurado, el motivo:

```js
let d3=0;
try{ ...calcular la diferencia con el tramo i+2... }catch(e){}
const f3=d3/...;
if(f3 < frac*0.4) vuelve=true;      // cero diferencia = "vuelve a parecerse"
```

`polygon-clipping` desborda la pila con poligonos grandes -`cree_innu` con 327
grado2 lo tumba-, el catch se tragaba la excepcion, `d3` se quedaba en cero, y
cero diferencia significa "vuelve". **Cada vez que la comparacion fallaba, el
caso se clasificaba como parpadeo.**

> **Un fallo de calculo nunca puede convertirse en un positivo.** Si no se puede
> comparar, no se sabe, y lo que no se sabe va a la lista de juicio, no a la de
> defectos.

Corregido: 171 → 158 parpadeos y el peso total baja de 130.308 a 86.877
grado2-anio. Y sobre todo, el que encabezaba la lista era falso.

Los tres primeros ya validados a mano si son reales y son del tipo que el
usuario ve en el globo:

- `idrisid` 820..900 salta de 4,2 a **29,9** grado2 y vuelve a 5,0: siete veces
  su tamano durante una fase.
- `asiria` -935..-911 recupera **exactamente** el contorno anterior al colapso,
  caja identica incluida: la recuperacion de Adad-nirari II no esta dibujada,
  esta pegada.
- `kanem_bornu` 1100 cambia el 100% de su figura dentro de una caja casi
  identica: el poligono se redibuja entero sin solapar con el anterior.

### Estado

```
DIBUJO A MANO   623 -> 459 anillos  |  166 -> 127 entidades
                101 ->  62 conocibles pendientes  (48 entidades redibujadas)
parpadeos       171 -> 158, y el primero de la lista era un falso positivo
civs 1166 | periodos 14162 | anillos 127226
estructura 0/0/0/0/0 | capitales 306/306
```

---

## Ronda 47 — las tres entidades que el detector de parpadeos senalo, y lo que habia debajo

Las tres se validaron a mano en la ronda 46 y se trabajaron aqui. Ninguna de
las tres resulto ser lo que el detector creia: en los tres casos el parpadeo
era el sintoma y el defecto de verdad era mas grande.

### `kanem_bornu` — el estado estaba dibujado en el sitio equivocado 680 anios

El parpadeo declarado era "el 100% de la figura cambia en 1100 dentro de una
caja casi identica". Medido con algebra de poligonos, los anillos de 800..1100 y
1100..1380 tienen **Jaccard 0,935**: son la misma mancha desplazada 0,1 grados.
El parpadeo era, en el mejor de los casos, cosmetico.

Lo que si habia: el anillo estaba practicamente CONGELADO de 700 a 1902 -caja
lon 11,0..16,5, lat 10,0..15,0- y esa caja es **Bornu**, al oeste y suroeste
del lago Chad. Pero entre 700 y 1380 el estado era **Kanem**, cuyo corazon esta
al NORESTE del lago. Sonda: Njimi/Mao (15,31 E 14,12 N), la capital sayfawa,
**no caia dentro en ningun anio anterior a 1400**. El rotulo de 1100..1380 dice
"Dunama Dabbalemi domina la ruta hasta Zawila" y Zawila esta once grados al
norte del borde del anillo.

Un mapa puede equivocarse en una frontera. Este se equivocaba de sitio.

Reconstruido en 24 fases: Kanem al noreste del lago de 700 a 1380, con la
cadena de oasis de Kawar como anillo aparte desde 1100 y el Fezan de Traghen y
Zawila acotado a **1230..1350** -Ibn Sa'id lo documenta bajo Kanem y el control
se pierde a mediados del siglo XIV-; la huida bulala en 1380 y Bornu desde
entonces. El agente encontro ademas el error inverso, no diagnosticado: la fase
1400..1500 metia Mao dentro en el siglo en que Kanem era bulala, contradiciendo
su propio rotulo. Kawar y Fezan van en anillos separados porque no eran
contiguos -de por medio estan el Tenere y el desierto de Murzuq- y se declaran
esquematicos: son corredores de oasis, no contornos. Kano queda fuera en las 24
fases: era tributario, y **tributo no es territorio**.

### `idrisid` — 22 grado2 de Marruecos que nunca fueron idrisies

La fase 820..900 media 29,93 grado2 con las vecinas en 4,2 y 5,0. El anillo
bajaba al paralelo 30 por el Atlantico, corria tres grados en recta y subia en
diagonal hasta Figuig. Sondas: en el 850 el mapa daba por idrisies Sijilmasa
-emirato midrari, jariyi sufri e independiente desde 758-, Aghmat, Taroudant y
**Marrakech, que no existia hasta 1070**. Y fallaba tambien por defecto:
Tlemcen, sede de la rama sulaymani desde 814, quedaba fuera.

El matiz que hacia dificil el caso: el reparto de 828 si asigno apanages
meridionales -Abdallah recibio Aghmat, Nfis, el Sus y Lamta; Isa recibio Sale,
Azemmour y Tamesna-. Pero eran nominales sobre territorios que llevaban 84 anios
en manos ajenas y siguieron en ellas dos siglos mas. La fuente lo dice en la
misma linea: el estado llegaba "por delante de los principados de Sijilmasa,
Barghawata y Nekor, que quedaron fuera de su control".

Partido en 828 -la fecha que la propia etiqueta nombraba-: 8,26 y 8,87 grado2
en vez de 29,93, con Tlemcen como anillo suelto y el corredor de Angad sin
pintar. Corregidas ademas dos fases vecinas: 789..820 dejaba fuera todo el Habt
y convertia Tanger en una isla desconectada de Fez cuando Arcila acunaba dirhams
idrisies; y 927..974 dejaba fuera al-Basra, una de las dos capitales del exilio.

### `asiria` -935..-911 — un anillo copiado

Confirmado byte a byte: el anillo de -935..-911 era **el mismo objeto** que el
de -1155..-1076, los mismos 72 vertices. El mapa decia que Assur-dan II
recupero de golpe todo lo de Tiglatpileser I, Mediterraneo incluido. Nisibis se
conquista en 896 y el Mediterraneo en 875, los dos despues del tramo.

Sustituido por 3,87 grado2: el Yebel Hamrin al sur, el borde del Wadi Tharthar
y el morro del Sinyar al oeste -recta, porque ahi es estepa aramea y no hay
nada que seguir-, el Tigris hasta Feshkhabur al norte y el frente exterior del
Zagros al este. Assur, Ninive, Arbela y Kalhu dentro; Nisibis, Harran,
Dur-Katlimmu y Sinjar fuera, cada uno con su razon.

El agente dejo dos avisos que no se han trabajado: `-911..-860` con 28,74
grado2 comete el mismo error veinte anios mas tarde -hace que Adad-nirari II
herede el codo del Eufrates el dia de su coronacion- y deberia partirse al
menos en **-875**; y `-1076..-935` deja **Arrapha/Kirkuk fuera**, cuando fue
provincia asiria de forma continua incluso en el peor momento.

### El orden de tres tiempos, otra vez, y una trampa de medida nueva

Las tres se aplicaron con `NOCARVE=1`, despues los sustratos cedieron con
`resta_civ`, y solo entonces se tallo. Invertir los dos ultimos pasos produce
no-ops silenciosos, como en la ronda 43.

Al retirarse, los tres anillos viejos dejaron hueco: en el 850 Sijilmasa,
Aghmat y Taroudant daban VACIO; en el 900 Ngazargamu y Dikwa; en el -920
Nisibis y Dur-Katlimmu. Se rellenaron devolviendo a los sustratos la
**diferencia exacta** entre la geometria anterior y la nueva, leida del
respaldo, y no una caja a ojo.

Y la primera version de ese calculo cayo en la trampa de medida de siempre, en
su octava forma: unia los anillos de todo el arco y restaba la union nueva.
Para `kanem_bornu` eso daba 4,10 grado2 liberados cuando el hueco real es mucho
mayor, porque Ngazargamu esta dentro del anillo VIEJO en el 900 y dentro del
NUEVO en el 1400, y la union se lo comia.

> **Un hueco es un hecho de un instante.** Medirlo sobre un arco de ocho siglos
> lo hace desaparecer. Hay que comparar intervalo a intervalo, con los cortes de
> las dos versiones unidos.

### Y un defecto encontrado por sonda, no por herramienta

Verificando las entidades de la ronda 46 con sondas de punto, Nitra (18,09 E
48,31 N) salio como `eslavos` en el 880 y no como `moravia`. El anillo de
Gran Moravia 833..882 llevaba esta secuencia:

```
[18.6,47.86] [18,48.1] [17,48.5] [19,48.5] [19,48.95]
```

Sale al este hasta 18,6, **retrocede 1,6 grados al oeste** y vuelve al este por
la misma latitud. Ninguna geografia hace eso: es una muesca de edicion, y la
muesca dejaba Nitra fuera. Nitra esta en el rotulo de la propia fase -"Mojmir I
expulsa a Pribina de Nitra y une Moravia"- y el principado de Nitra fue la
mitad oriental del estado desde 833. Quitados los dos vertices del retroceso:
3,94 -> 4,58 grado2.

### Estado

```
precision (plazas)  92,6%   3.654 sondeos, 270 discrepancias
                    antes de -500 100% | -500..500 94,8% | 500-1000 89,8%
                    1000-1500 91,2% | 1500-1800 90,3% | 1800-1900 92,6% | 1900-hoy 96,0%
cobertura           96,7%   -3000 95,0% ... 2000 99,3%
DIBUJO A MANO       459 -> 360 anillos | 127 -> 106 entidades | 41 conocibles pendientes
plazas-testigo      387 -> 396  (las nueve nuevas pasan todas)
civs 1166 | periodos 14192 | anillos 127315
estructura 0/0/0/0/0 | capitales 306/306
```

La cobertura baja una decima y eso es lo correcto: se ha cambiado cobertura
falsa por honestidad. 22 grado2 de Marruecos y 27 de la Yazira estaban pintados
por entidades que no estaban alli.

---

## Rondas 48-50 — el circuito de redibujado se cierra, y lo que aparecio al cerrarlo

Tres tandas de agentes sobre la lista CONOCIBLE de `redibujar.js`, mas los dos
tramos de Asiria que la ronda 47 dejo senalados. El resultado del trabajo
manual es menos importante que dos hallazgos: **la lista de trabajo llevaba dos
rondas siendo en sus siete decimas partes ruido**, y **la mitad de los defectos
graves del mapa no estaban en la lista sino al lado**.

### El fallo del instrumento: una prueba que solo mira dentro no puede juzgar un borde

`redibujar.js` descartaba las costuras de teselado con `esTesela`, que compara
un anillo con **los otros anillos del mismo periodo de la misma entidad**. Pero
la costura tipica de este mapa no es esa: es la que deja el tallado entre DOS
entidades. Se pica un rectangulo en el vecino, el recorte se le da a esta
entidad, y el borde queda repetido vertice a vertice en las dos. Ese borde es
recto, y `esTesela` no lo veia.

Un agente de la ronda 49 lo midio a 1e-6: `cree_innu` firma tres esquinas de
`british`; `persia`, las cuatro de `mughal`; `poland_lithuania`, las cuatro de
`russia`; `france` y `holy_roman_empire`, tres lados de `spanish`. **236 de los
337 anillos de la columna DIBUJO A MANO -el 70%- tenian mas del 60% de su
perimetro recto cosido a un vecino.**

> **Una prueba que solo mira dentro de la entidad no puede juzgar un borde,
> porque un borde es de dos.**

Es la novena forma de la misma trampa de medida. Corregido, la columna pasa de
**337 anillos en 91 entidades a 96 en 23**, y la lista CONOCIBLE de **26
entidades a 2**. El monstruo que encabezaba la columna DIFUSO -`evenkos`, con
247.922 grado2-anio de peso- era una costura.

Toda la tanda 6A -`holy_roman_empire`, `russia`, `spanish`, `mughal`,
`british`- resulto ser costura: el agente entrego `module.exports = []` y ocho
negativas verificadas que capturan 42 de 42 anillos marcados con 0 falsos
positivos.

### Lo que estaba al lado de la lista

**`abbasid` gobernaba Occitania.** Tolosa, Narbona, Carcasona y Nimes eran
abasies entre 750 y 800; en 33 fases y 46 anillos, de 750 a 945. El origen no
era un dibujo sino un reparto mal cerrado: al caer el califato omeya en 750 el
mapa parte su bloque iberico de 62 grado2, `cordoba` -que no empezaba hasta
756- se queda el oeste y el sur, y a `abbasid` le queda el resto. Tan mal
cerrado que **entre 750 y 756 al-Andalus entero era de nadie** mientras el
califato abasi gobernaba Narbona. Repartido por la cresta pirenaica: 8,67
grado2 a `franks` y 3,60 a `cordoba`, con el arco de `cordoba` tirado de 756 a
750. `abbasid` ya no conserva un anillo al oeste de lon 6.

**La Marca Hispanica estaba 250 km demasiado al sur durante tres siglos y
medio.** Lerida, Tortosa y Tarragona eran `franks` en 806 y en 900, y
`barcelona` en 1100; Lerida es musulmana hasta 1149, Tortosa hasta 1148.
Reconstruida en tres tramos con el limite real -Llobregat y Montsec hasta 1010;
la linea entre Camarasa y Balaguer hasta 1106; Lerida, Fraga y Tortosa hasta
1149- y con receptor correcto en cada epoca: `cordoba`, `taifas`, `almoravid`.

**`castile` empezaba en 718.** En 718 lo que hay es el reino de Asturias; el
reino de Castilla no se separa de forma estable hasta 1157. Siete de los trece
rotulos borrados dicen literalmente "Reino de Asturias" o "Reino de Leon": la
entidad llevaba la geometria de otra. Lo que tenia antes de 1157 era Portucale
-que pasa a `asturias_leon`- y la franja del alto Ebro con Logrono, Calahorra,
Estella y **Pamplona**, que pasa a `navarra`, porque meterla en Leon habria
sido cambiar un anacronismo por otro.

**`himalaya_reinos` duplicaba a `licchavi_nepal`**: mismo nombre, mismo
wikiTitle, misma caja, y areas complementarias que suman 1,92 constante.
Katmandu quedaba FUERA de la entidad rotulada "Licchavi" durante 300 anios.

**Najera, sede regia de Navarra, estaba en Leon** de 925 a 1180, con el rotulo
de `navarra` diciendo "Reino de Najera-Pamplona: Najera, sede regia".

Y ademas: `yamhad` -1550..-1524 no contenia Alepo; `tang` tenia un agujero de
nueve anios sobre Jiaohe, la sede de su propio protectorado de Anxi; el
`jin_dynasty` poseia once islas coreanas sin tener un metro de Corea
continental; `bengal_sultanate` rotulaba "Bengala independiente" un periodo en
que el sultanato no existia; `mughal` tenia Kandahar como enclave flotante a 90
km del imperio y no lo devolvia nunca despues de 1622; el Franco Condado de
`spanish` llevaba dentro Belfort y Montbeliard y fuera media Bailliage d'Aval,
con un rotulo que dice lo contrario de lo que paso en 1668.

### La trampa en la que cai yo

Al cerrar los dos ultimos CONOCIBLE sustitui el periodo 878..910 de
`asturias_leon` entregando solo el contorno nuevo de Portucale. El periodo
tenia dos anillos. **Borre el reino de Asturias**: paso de 13,64 a 2,07 grado2
y Oviedo y Leon se quedaron fuera de Asturias-Leon.

Es exactamente lo que la cabecera de `anillo_regla.js` cuenta que hizo un
agente de la ronda 44 al negarse a entregar `british` con la clave normal, y lo
que yo advierto a cada agente en cada encargo. Lo cazo la sonda de Coimbra, que
dio VACIO donde tenia que dar `asturias_leon`.

> **Cuando un periodo tiene mas de un anillo, no se sustituye el periodo: se
> sustituye el anillo.** Y quien escribe la advertencia tambien tiene que
> leerla.

### Asiria, terminada

Los dos avisos de la ronda 47, trabajados: `-911..-860` cometia el mismo error
veinte anios mas tarde -hacia que Adad-nirari II heredase el codo del Eufrates
el dia de su coronacion- y `-1076..-935` dejaba **Arrapha/Kirkuk fuera**, que
fue provincia asiria de forma continua incluso en el peor momento. El arco pasa
de `27,68 -> 2,59 -> 3,87 -> 28,74` a `27,68 -> 9,87 -> 3,40 -> 3,87 -> 5,12 ->
17,82 -> 28,74`, y cada peldano tiene un acontecimiento detras.

### Estado

```
precision (plazas)  92,8%   3.728 sondeos, 269 discrepancias
cobertura           96,7%
DIBUJO A MANO       360 -> 96 anillos | 106 -> 23 entidades | 2 conocibles
                    (el salto es del arreglo del instrumento, no de trabajo manual)
cajas deliberadas   8 -> 44 entradas con razon escrita
plazas-testigo      396 -> 409  (las trece nuevas y sus 74 sondeos pasan todas)
civs 1166 | periodos 14208 | anillos 127407
estructura 0/0/0/0/0 | capitales 306/306
```

---

## Rondas 51-54 — la capa antigua: el mapa empezaba de verdad en el -4000

Tres trabajos: cerrar el hueco de al-Andalus entre almoravides y almohades,
retirar una entidad que era el recorte de otra, y el grande — **la capa
antigua**, que llevaba toda la campana anotada como pendiente y resulto ser el
defecto mas grande que quedaba en el mapa.

### Lo que decia el termometro

```
anio     hueco real
 -6000      54,4%
 -5000      53,5%
 -4000       7,5%
 -3000       5,0%
     1       4,3%
```

**El mapa se vaciaba de golpe antes del -4000.** No era un hecho historico: era
una convencion de autoria. Al listar las areas culturales por su anio de inicio,
ochenta empiezan exactamente en -4500, -4000, -3500 o -3000, con nombres
genericos del tipo "Pueblos de X". Alguien dibujo la capa de sustrato con ese
suelo y ahi se quedo, aunque el arco del mapa llega al -10000 y aunque el propio
mapa ya llevaba `khoisan` desde -20000, `jomon` desde -13000 y
`mesoamerica_pueblos` desde -7000.

Dicho de otro modo: **el mapa afirmaba que en el 6000 a.C. no habia nadie en
America, Siberia ni la India.**

### Lo que se hizo

Dos agentes fecharon 65 arcos con el registro arqueologico en la mano, entidad
por entidad, y un tercero -el mismo, en segunda vuelta- bajo otros 20. No se
eligio un anio uniforme: cada uno tiene su yacimiento detras. Cooper's Ferry
16.000 cal AP, Page-Ladson 14.550, Swan Point 14.150, Huaca Prieta 13.700,
Arroyo Seco 2 14.064, Kisese II con microlitos "a lo largo de todos los estratos
del Pleistoceno tardio y del Holoceno", Xianrendong y su ceramica de 20.000 cal
AP, Ounjougou y la suya del X milenio, Nanzhuangtou, Niah, Tabon, Franchthi.

Y donde la fecha es tardia de verdad, se dijo: `dene` -6000 porque su cola
oriental son las Barren Grounds del Keewatin, deglaciadas hacia 7.000 cal AP;
`boreal_fenoscandia` -8000 porque el manto escandinavo no desaparece hasta 8.900
BP; `samoyedos` -6000 porque en la tundra de Yamal la unica evidencia con
contexto es Tagenar VI; `chono_kaweskar` -5000 porque los fiordos no se ocupan
hasta despues de la erupcion H1 del Hudson.

### El registro de vacio aprende a decir "y luego se vacio"

`vacios.js` solo sabia decir "vacio hasta tal anio". Eso no puede describir un
sitio que se poblo y VOLVIO a vaciarse, y el Sahara es exactamente eso: el
Periodo Humedo Africano lo hizo habitable entre ~14.800 y ~5.500 BP -Gobero, los
pescadores del Tenere- y despues volvio a ser hiperarido. Las cinco cajas
saharianas decian `desde:null`, "nunca poblada", que es falso durante seis mil
anios. Anadido el campo `hasta`.

Y se anadio **el casquete laurentino**, que era la omision mas grande del
registro y afectaba a media Norteamerica: entre el -10000 y el -4500 hay una
superficie enorme de Canada que estaba bajo el hielo y que el inventario contaba
como trabajo pendiente. Con el, las decisiones tardias de `dene` y `cree_innu`
dejan de parecer conservadurismo y se leen como lo que son. Mas Terranova, las
Antillas -el registro no tenia **ni una entrada del Caribe**-, las Bahamas, las
Baleares y el nucleo del manto escandinavo.

### El error que cometi al deshacer los talles

`arco.js` estira el primer periodo copiando su geometria, y esa geometria esta
tallada contra los vecinos que existian EN SU ANIO DE INICIO. Al llevarla cinco
mil anios atras se lleva consigo los agujeros de vecinos que en esa ventana
todavia no existen: al estirar `mediterraneo_balcanico` a -10000, el Danubio
medio se queda sin dueno porque arrastra el hueco de `starcevo`, que es del
-6200. Y ahi esta el Mesolitico de las Puertas de Hierro. **El arreglo es tallar
menos, no mas.**

Mi primera version de la herramienta unia a la entidad estirada la geometria
entera de todo vecino cuya CAJA cruzara la suya. Devolvio **21.908 grado2**:
`meseta_irania` pasaba de 73 a 539, `china_norte_pueblos` de 121 a 453. No
estaba rellenando agujeros: estaba anexionando paises enteros porque sus cajas
se tocaban.

> **Un agujero no es lo que esta cerca: es lo que esta DENTRO.**

La version buena no anade nada, borra: en este modelo un agujero se guarda como
un anillo mas y se resuelve por paridad, asi que deshacer un talle es quitar el
anillo interior, y nada puede crecer mas alla de su contorno.

### Y la regla para los 41 pares que se pisaron

Al retrasar 85 arcos, 41 pares de sustratos se pisaron, 131 grado2. Ninguno es
un solape historico: todos son el mismo artefacto, geometria tallada contra
vecinos con otra extension.

> **El que llega cede.** La entidad cuyo arco se ha retrasado entra en una
> ventana donde la otra ya estaba, con su extension de entonces. Quien ya estaba
> se queda el suelo. Si las dos se han retrasado, cede la mas extensa, que es la
> regla del sustrato de siempre.

### Las otras dos correcciones de la tanda

**Al-Andalus tenia un agujero de dos anios y un anacronismo de veinticinco.**
Entre 1145 y 1147 al-Andalus ENTERO era vacio -6.988 puntos de tierra sin dueno-
porque el anillo almoravide se retira a Marruecos y no lo sustituye nada. Y
desde 1147 los almohades tenian Valencia y Murcia, cuando Ibn Mardanis, el Rey
Lobo, las goberno de forma independiente hasta 1172. Las segundas taifas
(1144-1172) no existian en el mapa. Cinco fases nuevas, y de propina las
**Baleares, que estaban vacias 58 anios** (1145-1203) porque el anillo
almoravide las suelta y `almohad` no las recupera hasta 1203: los Banu Ganiya de
Mallorca no estaban.

**`licchavi_nepal` no era un estado: era el interior de `himalaya_reinos`.**
`polygon-clipping` da interseccion exactamente cero entre las dos en los cinco
tramos que comparten, y su union reproduce la caja que `himalaya_reinos` tenia
entera en 400..450. Lo que le quedaba a `himalaya_reinos` entre 450 y 750 eran
literalmente **las cuatro esquinas de esa caja**, publicadas bajo el rotulo
"Licchavi". Por eso Katmandu quedaba fuera de la entidad llamada Licchavi
durante trescientos anios. Retirada la duplicada y reconstruidas 15 fases: las
areas de 0,46-13,84 grado2 pasan a 0,62-1,67, que es la escala del valle de
Katmandu, y Katmandu y Bhaktapur estan dentro los 1.368 anios sin una laguna.

### Estado

```
                   antes    ahora
-10000              53,7%   33,4%
 -9000              46,7%   25,0%
 -8000              39,2%   16,4%
 -7000              32,9%   14,3%
 -6000              54,4%    8,8%
 -5000              53,5%    7,3%
 -4000               7,5%    6,5%
     1               4,3%    4,3%

precision (plazas)  92,8%
civs 1165 | periodos 14251 | anillos 127666
registro de vacio  44 -> 51 entradas, con campo `hasta`
estructura 0/0/0/0/0 | capitales 306/306
```

El mapa ya no tiene acantilado: degrada suavemente del 4,3% en el anio 1 al 33%
en el -10000, y lo que queda a esa altura es sobre todo plataforma continental
hoy sumergida que la mascara de tierra moderna no puede dibujar.

---

## Rondas 55-60 — la precisión, y dos instrumentos que borraban el mundo

La tanda más larga de la campaña. Doce agentes en dos oleadas sobre las 314
ciudades de la red de plazas-testigo que fallaban, más la ampliación de la
propia red. Y por el camino, dos herramientas que estaban destruyendo geografía
en silencio.

### Primera oleada: las 269 discrepancias del termómetro viejo

Seis agentes, uno por región. El reparto fue casi mitad y mitad: **149 eran
defectos del mapa y 120 eran expectativas equivocadas del testigo**, escritas
antes de que existiera la regla del estado concreto. Para poder corregir las
segundas sin hacerse trampas se escribió `testigos.js`, que exige una `razon`
por cada cambio, igual que `vacios.js` y `cajas_ok.js`.

Lo que afloró al tirar del hilo:

- **Asiria no contenía ninguna de sus cuatro grandes ciudades durante los
  catorce años de la guerra que la destruyó.** Nínive, Assur, Arbela y Harrán
  eran VACÍO de -626 a -612.
- **`british` no tenía nada en la India antes de 1760** -Fort St George es de
  1639, Bombay de 1665- y `delhi_sultanate` empezaba en 1192 con todo el Indo y
  el Ganges, catorce años antes de existir.
- **El principado de Teodoro no existía**: `golden_horde`, `genoa` y
  `crimean_khanate` estaban las tres dibujadas esquivando el mismo bloque de
  Crimea que nadie rellenaba.
- **El Decán no teselaba entre 1187 y 1336**: 1.038 de 2.052 celdas vacías en
  el año 1300.
- `spanish` conservaba Colonia del Sacramento hasta 1828 y la isla de Marajó de
  1600 a 1825; África Oriental Alemana era `tanganyika` desde 1885; y la
  ocupación japonesa del sudeste asiático estaba a medio editar, con medio Hong
  Kong sin dueño.

### El termómetro marcó cero, y eso era el problema

Con las 269 resueltas, la red dio **0 discrepancias sobre 3.719 sondeos**. Eso
no significa que el mapa sea perfecto: significa que el termómetro ha dejado de
medir. Se encontraron además **trece ciudades duplicadas**, una de ellas -Bakú-
con expectativas contradictorias: cuatro fallos irreducibles que ninguna
corrección del mapa podía quitar.

> **Una red que no falla nunca ya no dice nada.**

Tres agentes escribieron 231 testigos nuevos **desde la historia, no desde el
mapa**, concentrados donde estaba desnuda: la capa antigua tenía 60 sondeos
para nueve mil años y Siberia tenía cuatro ciudades. La red pasa de 403 a 634
plazas y de 3.719 a 7.429 sondeos, y destapa **518 discrepancias nuevas**.

### Segunda oleada: las 518

Seis agentes más. 518 -> 1. Lo mayor:

- **Roma estaba al este del Éufrates tres siglos de más.** El anillo sirio
  cruzaba el río hasta lon 44,8 en todos los periodos entre -63 y 363,
  tragándose Carras, Edesa, Nísibis, Amida y toda la Armenia meridional.
- **`napata` estaba dentro de `kush`**, con Kush tallada en forma de rosquilla
  alrededor de su propia capital. Son el mismo estado: fundidos.
- **El Tarim estaba exactamente del revés**: `karakhanid` tenía Kucha, que fue
  de Qocho desde 843, y no tenía Jotán ni Yarkanda, que sí fueron suyas.
- **Cape Coast pintaba `dutch_empire` de 1650 a 1875**, doblemente mal: el
  castillo fue británico desde 1664 y los neerlandeses cedieron la Costa del
  Oro entera el 6 de abril de 1872.
- El condado de Edesa, la frontera árabe-bizantina de Cilicia, los enclaves
  italianos -Benevento, Ferrara, Pisa, Lieja-, el Gran Ducado de Lituania
  reducido a astillas desde 1386, y un agujero continental de siete años en los
  Andes entre el fin del arco inca (1533) y la llegada española al Collao.

### Los dos instrumentos que borraban el mundo

Son el hallazgo de la ronda y los dos son la misma clase de fallo.

**`recorte.aTierra` tiraba las islas.** Terminaba en `limpia(res, 0.02)`, y seis
de las siete herramientas del proyecto pasan por ahí; `anade` se salta la
operación EN SILENCIO cuando vuelve vacía. Es decir: **ninguna isla de menos de
unos 250 km2 podía entrar en el mapa por ninguna vía.** Nauru mide 0,0022
grado2; Kosrae, Tarawa y Rarotonga, parecido. Las cuatro salían VACÍO en todos
los sondeos y no había forma de arreglarlo. El Pacífico insular no estaba vacío
por descuido: estaba vacío porque el recortador lo tiraba.

**Y `astillas.js` las borraba otra vez, y ese error lo cometí yo.** Bajado el
suelo del recortador a 3e-4, entraron las cuatro islas, se aplicó todo... y la
limpieza de astillas las borró acto seguido, porque su umbral de 0,005 es mayor
que las cuatro. El mismo error un piso más abajo y por la misma causa.

> **Lo que define una astilla no es que sea pequeña: es que sea residuo.** Un
> residuo de tallado es delgado -mucho perímetro para poca área- y está pegado
> al anillo del que se desprendió. Una isla es compacta y está sola.

`astillas.js` mide ahora las dos cosas -compacidad isoperimétrica y aislamiento
de la caja- y protege lo que es isla. En la primera corrida protegió **813
anillos** que antes se habrían borrado.

### Y el solape más grande que ha tenido el mapa

`british` y `aboriginal_australia` se pisaban en **134 grado2, el 19,5% de
Australia**. No lo trajo esta ronda: estaba ya, y nadie lo había medido porque
`solape_max` muestrea cada 100 años y el par sólo se cruza en ese tramo.

### Otras dos correcciones de instrumento

`vacios.js` tenía `cual()` sin actualizar tras añadir el campo `hasta`, así que
devolvía null justo cuando `legitimo()` devolvía true: las cinco cajas
saharianas salían como vacío legítimo sin poder decir por qué. **Dos funciones
que responden a la misma pregunta tienen que responder lo mismo.**

Y el modo orbital llegaba sólo al -3000 mientras el mapa tenía dibujados siete
mil años más. `YEAR_MIN` pasa a -10000: en el nivel más alejado el arco entero
son 12,03 vueltas y el dibujo ya soportaba 14.

### Estado

```
precision (plazas)  99,99%   7.429 sondeos, 1 discrepancia, 14 huecos
                    la red es el doble de exigente que hace dos rondas
cobertura           96,7%    (-10000: 33,4% ... 1: 4,2% ... 2000: 0,7%)
solape maximo       0,087 grado2   (134,3 antes de esta ronda)
civs 1171 | periodos 14720 | anillos 134310
plazas-testigo      403 -> 634 | registro de vacio 51 entradas
estructura 0/0/0/0/0 | capitales 306/306 | auto-intersecciones 0
```

La discrepancia que queda es Benevento en 1800, y no se puede arreglar: el
testigo tiene razón pero `papal_states` no existe en el mapa entre 1798 y 1814,
así que no hay a quién darle el enclave.

---

## Ronda 62 — diecisiete entidades que faltaban

Con la precisión al 99,99% y el solape máximo en 0,087 grado², los instrumentos
estaban saturados: lo que quedaba ya no lo encontraba una métrica. Se juntaron
los veintisiete informes de la campaña en `PENDIENTES.md` -115 entradas con
evidencia numérica, agrupadas y con el esfuerzo estimado- y de ahí sale esta
ronda.

Tres de los cinco primeros del inventario resultaron ya hechos: el umbral de
`aTierra`, la costura entre entidades de `redibujar.js` y el bloque abasí del
Languedoc. Lo que se trabajo aqui son las **entidades acotadas** y los **huecos
de cobertura medidos**.

### Las diecisiete

**Mediterráneo y Próximo Oriente (8).** `hatra` 177-240 -y el arco no empieza en
117 porque hasta c. 158 sus gobernantes se titulan *mry'*, "señor", y el paso a
*mlk'* es de c. 176 con Sanatruq I-; `amalfi` 839-1131, la cuarta república
marítima, que el mapa pintaba como `lombards`, "que es justo quien no era";
`danishmend` 1097-1178, con Malatya de capital, cosidos a `seljuk`; `kakuyid`
1008-1141; `bari` 847-871; `shaddadi` 1072-1199; y dos que el encargo daba por
no-entidades y resultaron serlo: `provenza` 1246-1481 -no existe `provence` ni
`anjou` ni `arles`, y `naples` empieza en 1282 cuando Carlos de Anjou era conde
desde 1246- y `negroponte` 1205-1390, porque corregir sólo la fecha de `venice`
abría un hueco de 185 años sobre 3.600 km².

**Asia interior (4 + 2).** `khotan` 842-1006, `turgesh` 699-748, `injuid`
1335-1357, `yuezhi` −125..30, más el arco de `mughal` adelantado a 1504 (el
Kabul de Babur: mismo príncipe, mismo ejército, sin discontinuidad) y un periodo
de `yaz_margiana` −550..−545 para la costura de Balj.

**Himalaya y Decán (5).** `khasa_malla` 1100-1400, el dueño legítimo del
Karnali; `kirat_oriental` 1100-1774 y `sen_vijayapur` 1609-1774, que comparten
los vértices exactos del frente del Chure; `lo_mustang` 1380-1790, sacado de
`himalaya_reinos`; y `kampili`, que el encargo no pedía: en el centro del hueco
del Decán de 1320 había un estado real, destruido en 1327, y por la regla del
estado concreto el suelo es suyo.

### Jotán: 164 años, no mil

El inventario pedía el reino de Jotán entero, c. 56 a 1006, como "el caso más
claro de sustrato tapando un estado". El agente lo acotó y tenía razón: de −176
a 649 el suelo es `tarim`, que **no es un sustrato** sino el agregado político
del que Jotán forma parte, y de 649 a 842 el mapa da `tang` y `tibetan_empire`,
que es lo que el propio testigo espera y acierta. **La violación de la regla
está sólo en 842-1006.** Un Jotán de 164 años bien fechado vale más que uno de
mil inventado.

### Lo que los agentes encontraron sin buscarlo

- **`chalukya` 1026-1163 tenía un agujero de 8,97 grado² dentro de su propia
  caja**, que excluía Gadag, Lakkundi, Hampi, Bellary y Chitradurga: el país
  chalukya. Eso, y no un borde, era por qué Hampi salía vacío.
- **`aq_qoyunlu` pintaba Sivas de 1405 a 1508.** Nunca la tuvieron -su capital
  fue Amid y después Tabriz, y el propio rótulo del mapa lo dice- y Mehmed I la
  recupera en 1408; fue capital del eyalato de Rum. Devuelta a los otomanos
  desde 1408, con el borde este en lon 37,8 porque Divriği y Erzincan sí fueron
  aq qoyunlu.
- `mughal` pintaba Ilam y Dhankuta en veintitrés periodos; `portugal` pinta
  Belgaum a 90 km de la costa; `pratihara` cruza el valle de Katmandú.

### Estado

```
precision (plazas)  99,99%   7.598 sondeos, 1 discrepancia, 13 huecos
cobertura           96,7%
solape maximo       0,087 grado2
civs 1188 | periodos 14.777 | anillos 134.482
plazas-testigo      634 -> 652
estructura 0/0/0/0/0 | capitales 306/306 | auto-intersecciones 0
```

La discrepancia que queda sigue siendo Benevento en 1800: el testigo tiene razón
pero `papal_states` no existe entre 1798 y 1814, así que no hay a quién darle el
enclave.

### Lo que quedó sin hacer, y por qué (cerrado en la ronda 64)

Tres lotes más -Timor y el Pacífico, el Magreb y el Hiyaz, y la capa antigua
(Antillas, Nilo prehistórico, Chipre, Italia e Iberia)- se lanzaron y se
cortaron a los quince minutos por el límite semanal de la cuenta. Sus encargos
están escritos y los huecos, medidos: Timor son 1.060 celdas sin pintar en 1600,
Fez y Ceuta no tienen dueño en 1146, y las Antillas están vacías desde el
-10000.

---

## Ronda 64 — los tres lotes que se habían cortado

Se relanzaron los tres lotes que el límite semanal de la cuenta había cortado a
los quince minutos. Los tres terminaron, y los tres encontraron que el defecto
era mayor que el encargo.

### Timor: 942 celdas vacías, y la causa estaba a la vista

La isla mide 942 celdas de tierra a 0,05°, y **en 1600 estaban vacías las 942**.
La causa: `wallacea_filipinas` **termina en 1600** y no la sustituye nada.
Quedan 3 celdas, que son el redondeo a dos decimales del propio `aTierra`.

El agente eligió la salida intermedia de las tres que se le ofrecieron —crear
`timor_pueblos` como sustrato propio— y descartó la barata con una razón que
conviene guardar: **estirar `wallacea_filipinas` habría puesto un sustrato
encima de las Filipinas españolas**, porque esa misma capa llega hasta 18,6 N.
Y mantuvo la negativa de la ronda anterior: **no dibuja Wehali**, porque su
precedencia sobre unos setenta *rai* era ritual y no una frontera; en su lugar
deja una plaza-testigo en Betun para que se note si alguien lo intenta.

De paso: **Portugal recupera Oecusse 1949-1975**, que el anillo de `indonesia`
se estaba comiendo, y la VOC pierde cinco años de adelanto en Kupang (el fuerte
Concordia es de enero de 1653).

### El Magreb: el defecto era el doble de grande

No era "Fez y Ceuta vacías en 1146": **el último anillo de `almoravid` es el Sus
y el Draa —el solar almohade— y no tiene nada al norte.** Reparto rehecho con
`almohad` recibiendo el complemento exacto dentro del anillo de Marruecos, y al
este el Chelif desde 1147, el Tell desde 1152 (Bugía, agosto) e Ifriquiya desde
1159 (Túnez, marzo). Dos entidades nuevas: `banu_khurasan` (Túnez 1059-1159) y
el reino de África normando. Celdas vacías 46.669 → 29.728.

Y al tirar del Maestrazgo apareció lo de verdad: **todo el reino de Valencia
estaba vacío de 1212 a 1238** —839 celdas— y **Peñíscola y Vinaròs no los
pintaba nadie en ningún año del mapa, hasta 2025**. 2.701 → 105.

Una corrección al encargo que hay que anotar: yo le dije al agente que `macina`
no existía, y sí existe, **con s**. El informe anterior había buscado mal el id.
Un id mal escrito es un defecto que se propaga de informe en informe.

### La capa antigua, y un nombre que bloqueaba la geometría

`neolitico_italiano` y `neolitico_iberico` no son culturas fechadas: son **los
sustratos de sus penínsulas con nombre de periodo**. Por eso Italia e Iberia
estaban vacías en todo el arco anterior al −6000 y nadie podía arreglarlo: para
estirarles el arco había que renombrarlas antes, y **el proyecto no tenía
herramienta de renombrado**. El nombre bloqueaba la geometría. Escrita
`nombres.js`; las dos pasan a "Pueblos prehistóricos de Italia" y "de Iberia".
Iberia 68 → 10 celdas vacías a −10000; Italia 29 → 7.

Más: `antillas_arcaico` (−3400..800, reutilizando los anillos de `taino` para
que el relevo sea exacto), `nilo_prehistorico`, `caspio_meridional`,
`reinos_chipre` −900..−500 y `taxila_ambhi`. El agente corrigió dos cosas del
encargo: la ventana de Taxila es −343..−327 y no −331..−327, y **las dos
entradas caribeñas de `vacios.js` estaban mal** —metían Jamaica, poblada en el
siglo VII d.C., en una caja con `desde:-4000`—, así que las partió en cuatro.

Y descartó la alternativa barata del Nilo con el argumento correcto: estirar
`pueblos_sahara` habría rotulado el Mesolítico de Jartum como "Sáhara húmedo",
que es **el mismo error que este lote corrige en Italia**.

### Lo que ninguno de los tres tenía encargado

- **Chuuk, el estado más poblado de Micronesia, no salía en ningún corte del
  mapa.** Las seis capas que se turnan las Carolinas tienen Yap, Pohnpei y
  Kosrae, y ninguna tenía Chuuk. Quinto caso del patrón "la capa existe y le
  falta la isla principal".
- `pacifico_frances` tenía un rótulo que dice "Wallis y Futuna" con Futuna y sin
  Wallis.
- Kosrae y Tarawa **ya funcionaban**: las coordenadas que yo le pasé al agente
  eran antiguas. La de Kosrae es **literalmente un vértice del anillo**, y `pip`
  sobre el borde devuelve false.

### Estado

```
precision (plazas)  99,99%   7.919 sondeos, 1 discrepancia
cobertura           96,8%    (hueco real acumulado 3,2%)
solape maximo       0,087 grado2
civs 1199 | periodos 14.833 | anillos 135.010
plazas-testigo      652 -> 683 | registro de vacio 54 entradas
estructura 0/0/0/0/0 | capitales 306/306 | auto-intersecciones 0
```

Entre las rondas 62 y 64 se han creado **veintiocho entidades** y la cobertura
ha subido del 96,7% al 96,8% con la red de testigos creciendo de 634 a 683
plazas y de 7.429 a 7.919 sondeos.
