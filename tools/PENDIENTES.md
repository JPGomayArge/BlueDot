# Inventario de pendientes

Reunido a partir de los 27 informes de `/tmp/geo/` (tandas 5 y 6, taifas51, nepal52,
antigua_america, antigua_eurasia, antigua_eurasia2, asiria57, informe57, lotes A-F,
lotes de testigos G-I y lotes de precisión J-O). Orden de las rondas, de la más antigua
a la más reciente: `tanda5*`/`tanda6*` → `taifas51`, `nepal52`, `antigua_*` →
`informe_A`…`informe_F`, `asiria57`, `informe57` → `informe_testigos_G/H/I` →
`p2_informe_J`…`p2_informe_O`.

Convenciones de este inventario:

- **Esfuerzo**: `barato` = una operación (`anade`, `arco`, `parte`, `copia_anillo`) con
  geometría que ya existe en el mapa. `medio` = hay que dibujar contornos nuevos con
  fuentes. `caro` = hay que crear entidades y repartir territorio entre varias.
- `(¿resuelto?)` marca una entrada de una ronda antigua que una ronda posterior parece
  haber arreglado. No se borra: se marca para que se compruebe.
- Dentro de cada sección, las entradas van **ordenadas por tamaño medido**. Lo que sólo
  tiene impresión y no medida va al final de su sección.

---

## 1. Entidades que faltan en el mapa

| entidad propuesta | arco | por qué hace falta | quién lo reportó | cuánto arregla | esfuerzo |
|---|---|---|---|---|---|
| `seleucida`, `lagida`, `sasanida` | −312..−63 / −323..−30 / 224..642 | No existen: están **dentro de `persia` y de `egypt`** con rótulos que lo confiesan. `persia` es una sola entidad de 131 periodos (−550..642 y 1501..hoy) cuyos periodos −312..−148 se rotulan «Seleuco recupera Babilonia y funda una era; Persia pasa a manos macedonias» y 224..642 «Ardashir derriba a Artabano IV y funda el imperio sasánida»; `egypt` −323..−30 se rotula «Ptolomeo I y la talasocracia: Chipre, Cirene, Celesiria y el Museo de Alejandría» | **Tres informes independientes**: `p2_informe_J` §2 y §14.1 (comprobado entidad por entidad contra `snap58.jsx`), `p2_informe_K` §14.1 (se nota en Éfeso 201-197, donde la atribución seléucida se adelanta tres años por no haber lágidas), `informe_testigos_G` §2.1 y §7.7 (las expectativas seléucidas se escribieron como `persia` y las ptolemaicas como `egypt` por esta razón) | No cierra ningún hueco —el suelo ya está pintado— pero corrige la atribución de todo el helenismo y de Irán sasánida. Toca Tracia, Anatolia, Siria, Mesopotamia, Irán, Bactria, Chipre, Cirene y Celesiria a la vez | **caro**. Sacar a los seléucidas de `persia` son 24 periodos de una entidad de 131, con 16-20 anillos por periodo en el caso lágida. `p2_J` lo llama «una migración de modelo, no una operación de lote» |
| Entidad para Timor precolonial (reino de **Wehali** o sustrato atoni/tetun/kemak) | ~−1000..1769 | **En toda la isla de Timor, 1.060 celdas de tierra a 0,05°, no hay ni una pintada en 1600.** No es resolución: Timor mide 2,35 grado². Dili 1600 y Kupang 1600 salen VACÍO | `p2_informe_N` §7.4 (medido); `informe_testigos_I` F17 (los detectó como huecos) | Dos plazas-testigo y una isla entera durante todo el periodo precolonial; además el mapa sigue sin cubrir Timor entre 1900 y 1980 en 56-61 celdas de la frontera interior | **medio-caro**. `p2_N` se niega expresamente: Wehali ejercía una precedencia ritual sobre unos setenta *rai*, no una frontera, y dibujarla sería inventar precisión (regla 4) |
| `antillas_arcaico` (pueblos precerámicos: casimiroides y ortoiroides) | −5000..~1500 | **Cuba, La Española occidental y las Bahamas están vacías desde −10000 hasta cerca del año 1000**: 40 celdas de 1° vacías a −6000 y **25 en todo el arco hasta el año 1** (de 56 celdas de tierra del Caribe, rejilla de 1°, lon −85..−60 / lat 10..27). `vacios.js` no tiene **ni una sola** entrada del Caribe, así que el inventario las cuenta como pendientes siempre | `antigua_america` §8 y §9.2 | 25 celdas contadas como trabajo pendiente durante todo el arco del mapa | **medio**. Caja `[-85,-61,17.5,23]` más un lóbulo `[-62,-60,10,11.5]` para Trinidad; secuencia bien establecida (Trinidad ~7.000 AP, Grandes Antillas 6.000-5.000 AP, Jamaica y Bahamas ~800 AP). Necesita además dos entradas en `vacios.js` |
| `nilo_prehistorico` (cazadores, pescadores y pastores del Nilo) | −10000..−4000 | **Todo el Nilo nubio y egipcio, de Jartum al Delta, está sin pintar a −6000** (malla de 1°, lon 30-37 / lat 14-28), salvo la franja lon 30-31 que alcanza `pueblos_sahara`. A −4000 esas mismas celdas son de `naqada`, `nubia_antigua` y `nilo_sudan`; antes, de nadie. Son 42 celdas de 2° a −7000 | `antigua_eurasia` §9.1 y §5.1; confirmado en `antigua_eurasia2` §10 («sigue sin arreglar») | El corredor fluvial mejor fechado de África: Wadi Kubbaniya (~19 ka), Jebel Sahaba (~13,4 ka), Mesolítico de Jartum (~−8000), Faiyum A, Merimde, Badari | **medio**. Parcialmente cubierto por arriba: `p2_J` creó `bajo_egipto_neolitico` (−5300..−3100) para el Delta. Alternativa barata: extender el contorno de `pueblos_sahara` al este hasta lon 37 en su primer periodo |
| `hatra` (reino árabe de Hatra) | 117..240/241 | El mapa deja hoy un **hueco deliberado sobre Hatra entre 198 y 240** (9 celdas nuevas sin dueño en el barrido de `p2_K`), porque ni los arsácidas (caídos en 224) ni los sasánidas la tenían: Hatra rechazó los asedios de Ardashir en 229 y 237/238 y sólo cayó ante Sapor I en 240/241 | `p2_informe_K` §4 y §14.3; `informe_testigos_H` §2.4 (Hatra 229) | Una plaza-testigo y un hueco de 42 años | **medio**. `p2_K` se niega a crearla sola: `hatra` desde 117 le quitaría el suelo a `parthia` en los años 1, 50, 100, 150, 200 y 220, donde el testigo espera `parthia` **y hoy acierta**, convirtiendo dos aciertos en seis fallos. Hay que crearla **junto con** la revisión del testigo |
| `palmira_zenobia` (270-273) e **imperio galo** (260-274) | 270..273 / 260..274 | «Las dos secesiones del siglo III que el mapa no modela». Comprobado: `rome` pinta Palmira en 270-275 **sin corte** | `p2_informe_K` §3 y §14.2 («Confirmado: es real»); `informe_testigos_G` §2.2 (los años se sondearon sin `espera` precisamente porque la entidad no existe) | Dos plazas sondeadas a ciegas; corrige el siglo III occidental y oriental | **medio**. Palmira tiene contorno acotable (la Badiya siria ya dibujada por `p2_K` para `levante_estepa` −100..−63); el imperio galo exige repartir Galia, Britania e Hispania con `rome` |
| Reino budista de **Jotán** (dinastía Yuchi) | c. 56..1006 | Un sustrato cultural (`tarim_pueblos`) tapando **un estado con dinastía, capital, moneda y embajadas a China durante mil años**. El testigo de Jotán deja 850, 950 y 1000 sin expectativa precisamente para detectarlo, y el mapa devuelve `tarim_pueblos` | `p2_informe_M` §8.1 («el caso más claro de la regla 5 que he visto»); `informe_testigos_H` §2.2 (los tres años sin expectativa) | Tres sondeos a ciegas más todo el borde suroeste del Tarim durante un milenio | **caro**. Habría que tallarlo contra `tarim` y `tarim_pueblos` en **más de treinta periodos** |
| `khasa_malla` (reino de Sinja / Yatse) | ~1100..1400 | Es el dueño legítimo del Karnali entre 1100 y 1400. Al retirar el polígono falso de `himalaya_reinos`, **Nepal occidental y oriental quedan sin nadie**: 203 celdas de 0,25° en 1100, 109 en 1300 (malla 80,1-88,2 / 26,4-30,4) | `nepal52` §5 y §6.2 | El hueco mayor que abre la ronda 52; empalma con `baisi_chaubisi` en 1400 | **medio**. Capitales conocidas: Sinja (82,10/29,25) y Dullu (81,70/28,90); con Prithvi Malla llegó a incluir Guge y Purang |
| Kirat / **Limbuwan** del este y los **Sen de Vijayapur** | ~400..1768 | Nepal al este del Sun Koshi (Dhankuta, Ilam, Solu, Vijayapur) **está vacío en todo el arco** salvo por el polígono falso que `nepal52` retira | `nepal52` §6.3 | Cierra el hueco oriental de Nepal, 400-1768 | **medio** |
| `khanatos_caucaso` (Bakú, Quba, Shirván, Shakí, Ganya, Karabaj, Talish) | 1747..1813 | **Toda Transcaucasia oriental (47,5-50 E / 40-41,5 N) queda en blanco en ese tramo**, salvo el enclave de Quba que Persia conserva. El parche de `informe_B` da Bakú a `persia` como solución menos mala | `informe_B` §III.3 (con caja propuesta 44,5-50,5 / 38,5-42,5) | Medio siglo de Transcaucasia, y la coherencia con Quba y Derbent | **caro**: siete kanatos que repartirse el suelo |
| `sharifate_mecca` (Jerifato de La Meca) | 968..1925 | Fuera del tramo 969-1048 que arregló `informe_E`, La Meca y Medina las pinta el **sustrato beduino** o `beja` hasta que llegan ayubíes, mamelucos y otomanos. No hay ningún estado en el Hiyaz | `informe_E` §III.3 (caja propuesta 38,5-42,0 / 20,0-25,5) | Mil años del Hiyaz sin estado | **medio** |
| `tuareg_niger` (confederaciones tuareg del Recodo del Níger) | ~1737..1894 | Entre la caída de los arma (1833) y la ocupación francesa (1893-94), Tombuctú y el Recodo quedan en `sahel_pueblos`. Comprobado que `toucouleur` (caja −12,3..−3,1 / 11,7..15,9) **no contiene Tombuctú** (−3,01/16,77): no es que se quede corto, es que nunca lo tuvo | `informe_E` §III.5 (caja propuesta −5,0..2,0 / 15,0..18,5) | Un siglo del Níger medio con sustrato en vez de estado | **medio** |
| Emiratos **zenetas del Magreb central** (Magrawa, Banu Ifran) | s. X-XI | Orán, Tlemecén y su comarca están en `bereberes_magreb` porque no hay entidad para los poderes reales entre fatimíes y omeyas. Señal independiente: Tlemecén tiene sondeos en 900 y 1000 **sin expectativa escrita**, es decir, otros agentes se toparon con lo mismo | `informe_E` §III.4 | El Magreb central en dos siglos | **medio** |
| Ducado de **Amalfi** (la cuarta república marítima) | 839..1131 | Hoy esos años los pinta `lombards`, «que es justo quien no era». El testigo lo dice explícitamente («no parece tener id») | `p2_informe_L` §3 de defectos y §4 (Amalfi); `informe_testigos_H` §3 | Dos sondeos y tres siglos de la costa amalfitana | **barato-medio**: `p2_L` ya recortó a `lombards` la franja Nápoles-Sorrento-Amalfi para 568-839 |
| `danishmend` (Danismendíes) | 1097..1178 | Tuvieron **Malatya como capital entre 1102 y 1178** y el mapa los cose a `seljuk`. Explica los huecos que el testigo de Melitene deja a propósito en 1080, 1100 y 1150 | `p2_informe_L` §5 de defectos; `informe_testigos_H` §3 | Tres sondeos a ciegas y el centro de Anatolia oriental en el siglo XII | **medio** |
| `kakuyid` (kakuyíes de Isfahán y Rayy) | 1008..1141 | Se están pintando como `buyid`, «que es lo menos malo pero no es verdad». El caso concreto: Rayy en 1040 era kakuyí (Ala al-Dawla la recupera en 1037-38 y Tugril no la toma hasta 1042-43) | `p2_informe_M` §6 (Rayy 1040) y §8.2 | Un sondeo y el Yibal en siglo y medio | **medio** |
| **Turgueses** (699-766), **inyuidas de Shiraz** (1335-1353), **Qara-unas / Kabul de Babur** (hasta 1526) | ver columna | **Los cuatro huecos `··` que quedan en el lote M son exactamente éstos**: Suyab 720, Otrar 750, Shiraz 1340, Ghazni 1510 salen VACÍO y el testigo los dejó sin expectativa por eso | `p2_informe_M` §8.3; `informe_testigos_H` §2.5 y §3 | Cuatro sondeos y cuatro huecos de décadas | **medio** cada una |
| `china_nanjing` (Gobierno Nacional Reorganizado de Wang Jingwei) | 1940..1945 | Sin ella, **Pekín, Nankín y Cantón en 1940 quedan atribuidas a `modern_china`**, es decir a Chongqing, que no gobernaba ninguna de las tres (Pekín ocupada desde julio de 1937, Nankín desde diciembre de 1937, Cantón desde octubre de 1938). El mapa ya distingue anexión (Corea, Taiwán → `japan`) de estado títere (Manchukuo → entidad propia) | `informe_D` (sección «Entidad nueva propuesta», descrita y no dibujada; caja 106-122 E / 22-41 N, excluye Manchukuo y Mengjiang) | Tres de las plazas chinas más sondeadas del mapa | **caro**, y con advertencia expresa: «el frente de 1937-1945 no es una frontera; Japón controlaba ciudades, ferrocarriles y corredores. Cualquier contorno es una convención y debe rotularse como tal» |
| Reino de **Lo (Mustang)** con id propio | 1380..1768 (de hecho hasta 2008) | «El reino de Lo **no es malla del valle**. Está dentro de `himalaya_reinos` por comodidad de recorte». Además su anillo mide 0,045 grado² cuando el reino real mide 53 × 60 km, unos 0,26 | `nepal52` §6.4 | Corrige una atribución y una escala diez veces pequeña | **medio**: agrandarlo obliga a re-recortar `tibet_medieval` y no se conoce su frontera con Ngari |
| Reinos de **Chipre** (Iadnana) | −745..−333 aprox. | Al quitarle Chipre a Asiria —que la tenía por dos episodios de **sumisión nominal**, los reyes de Iadnana ante Sargón II (h. 707) y la lista de diez reyes de la estela de Asarhaddón (h. 673)— la isla queda **sin dueño desde −627 en vez de desde −612**: quince años más de vacío, y no hay entidad que lo recoja | `asiria57` §4 («receptor inexistente, y aun así hay que soltarlo») | Cierra un hueco que el propio arreglo de Asiria abre | **medio** |
| Reino de **Taxila** (Ambhi) | −331..−327 | **El Punyab entre −331 y −327 no tiene entidad.** `p2_J` no lo arregló porque el anillo de `macedon` −330..−327 se acerca a menos de 0,5° de Taxila y resucitar `gandhara_reino` con su contorno de −525 arriesga un solape no acotable | `p2_informe_J` §6 (Taxila) y §14.4; `informe_testigos_G` §5.5 | Un sondeo y cuatro años del Punyab | **barato-medio** |
| **Yuezhi / Bactria** | −130..+30 | Los yuezhi no están en el mapa y el sondeo de Bactra cae en `hindu_kush`, «que es la capa de los valles altos, no la del oasis de Balj». Además `yaz_margiana` cierra en −550 y `persia` no entra en Balj hasta −545: cinco años de costura que tapa `hindu_kush` | `p2_informe_J` §14.5; `informe_testigos_G` §5.1 (Bactra −550 y −100) | Siglo y medio de Bactria | **medio** |
| **Sustrato de Italia y de Iberia** con nombre honesto | −10000..−1700 / −10000..−2200 | No son entidades nuevas sino dos **mal clasificadas**: `neolitico_italiano` (−6000..−1700) es lo único que pinta Italia y `neolitico_iberico` (−5600..−2200) lo único que pinta la Península; los dos son sustratos con nombre de periodo. Medido: Italia 8 celdas de 20 vacías de −10000 a −6000; Iberia **18 de 21 vacías a −10000, 16 a −8000, 9 a −6000** | `antigua_eurasia2` §7.1 y §7.2 | Dos penínsulas enteras en todo el arco anterior al −6000 | **barato** una vez renombradas (es `arco.js`), pero **hay que renombrar primero**: estirarlas sin renombrar produce un rótulo falso, y no hay instrumento de renombrado (ver §4) |
| `caspio_meridional` (o ensanchar `meseta_irania` sobre el flanco norte del Alborz) | −10000..−1000 | **Hotu y Kamarband** (53,5 E / 36,7 N), con secuencia continua desde el **9910 a.C.**, están fuera de todo contorno en todos los cortes probados. 5 celdas de 11 vacías **en todo el arco** (lon 48-56 / lat 35-39) | `antigua_eurasia2` §7.4 | El pasillo de Gilán y Mazandarán, siempre vacío | **medio**; la alternativa barata es ensanchar `meseta_irania` |
| `theodoro` (Principado de Teodoro, Mangup) | 1240..1475 | Crimea suroccidental estaba vacía de 1240 a 1441 y la Horda se comía el macizo en 1368-1439 y 1465-1474 | `informe_B` §III.2 (propuesta) → **`informe57` §1 la creó** (un anillo, 0,086 grado², tres fases) | Crimea en 1240 y 1250 pasa de 102 celdas vacías de 351 a **0** | **(¿resuelto?)** — comprobar que `teodoro_crea.js` se aplicó |
| `ppna`, `bajo_egipto_neolitico`, `hicsos`, `soissons`, `vishnukundina`, `pisa`, `ternate` 1683-1914, `timor` 1999-2002 | varios | Propuestas y creadas en la última ronda | `p2_informe_J` (las cinco primeras), `p2_informe_L` (`pisa`), `p2_informe_N` (las dos últimas) | Cierran el hueco del PPNA en el Levante (16 celdas de 16 vacías a −9000, con Jericó y Göbekli Tepe sin dueño), el Bajo Egipto −5300..−3100, el Delta oriental hicso, la Galia del norte 476-481, el bajo Krishna 450-570, el bajo Arno 1115-1406 y Timor Oriental 1999-2002 | **(¿resuelto?)** — comprobar que los módulos `p2_*_civ.js` se aplicaron |

Entidades de menor tamaño reportadas sin medida, para que consten (`informe_testigos_H` §3,
salvo donde se indique): emirato de **Bari** (847-871, el mapa pinta `byzantine`);
**shaddadíes de Ani** (1072-1199, el mapa pinta `seljuk`); **triarquía de Negroponte**
(1205-1390, el mapa pinta `venice` siglo y medio antes de tiempo); condado de **Provenza**
(Marsella 1250-1470, el mapa pinta `holy_roman_empire`); **Balsic de Zeta** y **Thopia de
Albania** (Escutari 1370/1390 y Durazzo 1370 — `p2_L` dejó el hueco 1368-1392 en Durazzo a
propósito porque los Thopia no tienen id); **Ciudad Libre de Cracovia** (1815-1846);
**comunas de Pisa y Ancona** (Pisa resuelta por `p2_L`; Ancona no); **Meissen** como
margraviato imperial entre 1200 y 1423 (`informe_A` §III.10); **kadamba de Goa**
(resuelto por `informe57` dándoselo a `yadava`, **(¿resuelto?)**).

---

## 2. Defectos de extensión o de fecha

| defecto | entidades | tramo | evidencia | esfuerzo |
|---|---|---|---|---|
| **`british` y `aboriginal_australia` se pisan en el 19,5 % de Australia** | `british`, `british_dominions`, `aboriginal_australia` | 1870-1931 | Rejilla de 0,25° sobre 112-155 E / −44..−9 en 1870, contra las 11.243 celdas de tierra del continente: **2.192 celdas pintadas por los dos a la vez**, 5.558 sólo `british`, 3.386 sólo el sustrato. Bloque continuo 117,5-136,75 E / −30,5..−12,25. Idéntico en 1870-1901 y 1901-1931. `barrido.js '[1600,2000,50]'` lo delata como **el mayor par de doble pintado del mapa** (64 celdas-año en 1900). `plazas.js` sólo lo cazó en Darwin porque es la única plaza de la red dentro del bloque (`p2_informe_N` §3.3 y §7.1; `informe_testigos_I` F16) | **medio**, con un obstáculo técnico duro: son 25 fases anuales de `british` con anillos de 441 vértices y **`polygon-clipping` falla** con estos dos anillos concretos (`pc.intersection` lanza `Unable to complete output ring starting at [123.53, -16.56]`). Quién debe ceder es `british`: el rótulo del sustrato dice «el interior, que nadie administra» y la regla 3 dice que el reparto reparte reclamaciones |
| **`abbasid` gobierna el Languedoc y el Tolosano entre 750 y 800** | `abbasid`, `cordoba`, `franks` | 750-800 | Anillo de **12,27 grado²** sobre −1,81..4,50 E / 40,59..44,30 N (partido en dos mitades por lon 1,32 entre 774 y 796). Comprobado con `L.quien`: en 760 y en 798 son abasíes Tolosa (1,44/43,60), Narbona (3,00/43,18), Carcasona, Albi, Foix, Auch, Montauban y Nimes. Falso tres veces: los abasíes nunca gobernaron al-Ándalus ni Septimania (`cordoba` existe desde 756 y ya pinta Zaragoza en 760); Narbona cae ante Pipino el Breve en **759**; Tolosa nunca fue musulmana después de 721. Y de ahí sale el rectángulo de `franks` 774..796: alguien vio Tolosa en manos abasíes, le recortó 0,84 grado² y se lo dio a los francos (`tanda6c` D1 y §Encargo 3) | **medio**. «Arreglar el rectángulo sin arreglar el bloque es maquillaje»: hay que reasignar el bloque a `cordoba` hasta 759 en Septimania, a `franks` desde 759, y quitarlo de `abbasid` por completo |
| **`spanish` pierde la mitad sur del Franco Condado y mete tres plazas ajenas** | `spanish`, `france`, `savoy`, `holy_roman_empire` | 1648-1678 | Barrido de **598 celdas de 0,02°** en 5,25-6,15 / 46,30-46,56: **las 598 están fuera de `spanish`**, en `france` y en `savoy`. Fuera quedan Saint-Amour, Orgelet, Moirans, Arinthod, Saint-Claude, Morez y Les Rousses, es decir el bailliage d'Aval entero. Y dentro están Auxonne (plaza real francesa del ducado), Belfort (Sundgau habsburgués, cedido a Francia en 1648) y Montbéliard (condado de Wurtemberg) (`tanda6a` §4 y defectos 5 y 6) | **medio**. Aviso metodológico del propio informe: la frontera es *conocible* pero no descargable desde el entorno, y una línea de treinta vértices interpolada entre media docena de pueblos es lo que la regla 4 prohíbe |
| **`russia` 1503-1514: Severia es un enclave flotante** | `russia`, `poland_lithuania` | 1503-1514 | El anillo de Severia mide **9,20 grado²** (caja 31,00-35,00 / 51,00-53,30) y el cuerpo de Rusia no baja de lat 54,72 y sólo desde lon 34,25: **1,42 grados de separación** en el mejor punto, y todo lo que hay en medio (lon 31-36,5 / lat 53,3-54,7) es `poland_lithuania`. Causa identificada: el mapa no aplica la **paz eterna de 1494** (Mtsensk, Belev, Vorotinsk, Kozelsk, Mosalsk y Serpeisk siguen lituanos en 1505 y sólo pasan en 1514). Falta además lo demás de 1503: Gomel, Liubech, Dorogobuzh, Toropets, Belaia (`tanda6a` §3 y defecto 1) | **medio**. Lo que procede es **extender el cuerpo ruso por el alto Oka en 1503**, no redibujar la caja: los cuatro bordes del rectángulo están repetidos vértice a vértice en `poland_lithuania` |
| **El Decán no tesela entre 1187 y 1336** | `yadava`, `hoysala`, `kakatiya`, `delhi_sultanate` | 1187-1336 | Al hundirse los Chalukyas el mapa reparte entre `yadava` (lat 15,8-22,0), `hoysala` (lat 11,5-15,0) y `kakatiya` (lon 77,6-82,5), y las tres piezas dejan una banda continua de costa a costa. Medido en 1300: **1.038 de 2.052 celdas de tierra vacías** en 73-80,5 E / 13,4-16,6 N (`informe57` §2.2). Arreglado en su mayor parte: 1250 pasa de 1.168 a **212** y 1300 de 1.038 a **145** | **(¿resuelto?)** el grueso (`informe57`, `huecos57_anade.js`: `yadava` +Konkan-doab 1187-1317, `hoysala` +Malnad 1189-1336, `kakatiya` +Rayalaseema 1250-1323). **Queda abierto**: Karnataka septentrional 1317-1336 (**374 celdas vacías en 1320**, es el Decán tugluq y le corresponde a `delhi_sultanate`), Rayalaseema 1187-1250 y el rincón Chittoor-Kolar (~15 celdas) |
| **`himalaya_reinos` pintaba todo Nepal con rótulos que dicen «el valle de Katmandú»** | `himalaya_reinos`, `licchavi_nepal`, `baisi_chaubisi` | 400-1768 | Periodos 750-1400 con áreas de 6 a 13,84 grado² y caja 80,07-88,16 / 26,03-30,38 —el contorno del Nepal moderno, 800 km de este a oeste— bajo rótulos «Periodo Thakuri **en el valle de Katmandú**». El valle mide 0,05 grado²; el Nepal Mandala, 0,9. Y las dos entidades eran la misma: intersección **exactamente 0** y áreas complementarias en los cinco tramos en que coexisten (`tanda5b` §2a y D1, D2 → **`nepal52`** lo arregló: fusión, retirada de `licchavi_nepal` y 32 fases entre 0,62 y 1,67 grado²) | **(¿resuelto?)**. Ojo al orden de aplicación que el informe subraya: **primero retirar `licchavi_nepal`, después `sustituye`**, o el `carve` recorta contra el octógono viejo y los periodos 450-750 salen con 0,2 grado² en vez de 1,67 |
| **`castile` no es Castilla antes de 1157** | `castile`, `asturias_leon`, `navarra` | 718-1157 | Trece periodos, siete de ellos rotulados «Reino de Asturias» y «Reino de León». Burgos, Amaya, Osma, Vitoria, Santander y Toledo están en `asturias_leon` de 800 a 1157 y sólo pasan a `castile` en 1157. Lo que `castile` tiene antes es **otra cosa**: la franja del alto Ebro con Logroño, Nájera, Calahorra, Estella, San Sebastián y **Pamplona** (−1,65/42,82), es decir el reino de Pamplona sin Pamplona; más un **rectángulo de 3,21 grado²** sobre Coímbra y Oporto cuyo borde norte (lat 41,20) coincide exactamente con el borde sur de `asturias_leon` (`tanda6c` §Encargo 1 y D2, D8) | **barato** y **ya entregado** en `tanda6c.js` (borrado de 13 periodos + 10 traspasos, comprobados con rejilla de 0,01°: **0 puntos de solape**). **(¿resuelto?)** si se aplicó. Quedan dos secuelas: Soria-Almazán-Medinaceli 1110-1157 (0,85 grado²) hay que reasignarlo a `aragon` 1119-1134 y a `asturias_leon` 1134-1157; y Vitoria y Bilbao pasan a `castile` en 1157 cuando el propio rótulo de `navarra` dice que las pierde en **1200** |
| **El bloque de Magdeburgo deja una franja vacía y pierde Magdeburgo** | `holy_roman_empire`, `saxony`, `brandenburg`, `hanover` | 1423-1526 | Un anillo de 6 vértices repetido **idéntico dieciséis veces** (11,05-12,20 / 51,60-52,25). El anillo grande del Imperio tiene su techo en lat 51,45 y este bloque empieza en 51,60: barrido de 11,05-12,20 / 51,46-51,59, **138 celdas sin dueño**. Y deja fuera Halle (en `saxony`), Dessau, Burg, Wolmirstedt y Wernigerode (**de nadie**) — cuando **antes de 1423, con las tiras meridianas, Halle y Dessau sí estaban dentro del Imperio** (comprobado en 1420 contra 1425) (`tanda6a` §5B y defecto 9) | **medio**. Aviso: bajo ese rectángulo no hay una entidad sino una docena (arzobispado de Magdeburgo, obispado de Halberstadt, principados de Anhalt, abadía de Quedlinburg); un contorno sinuoso diría que tenían un límite común |
| **El Maestrazgo costero no lo pinta nadie de 1171 a 1233** | `almohad` | 1171-1233 | Peñíscola (0,40/40,36), Vinaròs (0,47/40,47) y Benicarló salen **VACÍO**. Causa exacta: una muesca del anillo almohade, los vértices `[0.24,40.20] [0.00,40.20] [0.00,40.75]`, que se meten tierra adentro para esquivar la Tortosa aragonesa. Son **61 puntos** del barrido de 6.988 que siguen vacíos en 1180 y 1200 (`taifas51` §1 y §8.2). Entre 1149 y 1171 el módulo de esa ronda ya lo arregla | **barato**: el informe deja escrito el cuadrilátero exacto que falta, `[0.00,40.20] [0.42,40.36] [0.53,40.56] [0.00,40.75]`, sobre los periodos `almohad` 1171..1203, 1203..1212, 1212..1217 y 1217..1229 |
| **El arco de `bosque_templado_europeo` termina en 800 d.C.** | `bosque_templado_europeo` | −8000..800 | Una capa de cazadores y campesinos del bosque templado que sigue viva hasta Carlomagno **gana el sondeo en cualquier punto de Europa central donde el estado del momento no llegue**: en el 500 ganaba en Colonia, en Tréveris y en Maguncia a la vez. El año correcto de cierre está alrededor del **−800**, cuando Hallstatt, celtas y germanos cubren la misma superficie (`p2_informe_J` §1b y §14.2; `informe_testigos_G` §5.1, donde Colonia 500 → `bosque_templado_europeo` encabeza la lista de sustratos que tapan estados) | **barato** (`arco`), pero es una capa compartida por media docena de lotes: hay que hacerlo de una vez y volver a medir |
| **`cimerios` empieza 286 años antes de su primera mención** | `cimerios` | −1000..−590 | Arco desde −1000 con el rótulo, muy honrado, «Nomadismo póntico según Heródoto, sin respaldo arqueológico». Los cimerios aparecen en las fuentes asirias en **−714**. `p2_J` les quitó Anatolia central y el norte de Siria (y con ello el único solape del lote, `asiria+cimerios` en Karkemish en −610), pero el arco sigue igual (`p2_informe_J` §4 y §14.3; `informe_testigos_G` §5.4) | **barato** (`arco`) |
| **`ottoman` pinta la llanura de Cilicia 127 años antes de tiempo** | `ottoman`, `ramazan`, `mamluk` | 1389-1516 | Los otomanos no entran en Cilicia hasta la conquista del sultanato mameluco por Selim I en **1516-1517**; entre 1389 y 1516 la llanura fue ramazánida bajo soberanía mameluca. El arco de `ramazan` termina en 1389 y el hueco lo tapa `ottoman` (`p2_informe_L` §2 de defectos) | **barato-medio**: exige alargar el arco de `ramazan`, que ya no es una corrección de plaza |
| **`papal_states` no existe entre 1798 y 1814** | `papal_states`, `france`, `naples` | 1798-1814 | El mapa pinta Roma como `france` en 1800, 1805 y 1810. Los Estados Pontificios sí se restauraron con Pío VII en junio de 1800 y no fueron anexionados hasta 1809. **Es lo único que impide cerrar Benevento 1800**, el único fallo que el lote L no pudo resolver (`p2_informe_L` §4 y §1 de defectos; `informe_testigos_H` §5) | **medio**. Rellenarlo bien exige decidir qué pasa con las Legaciones (perdidas ante la Cisalpina en 1797, no devueltas en 1801) |
| **La línea de Nerchinsk (1689) está mal dibujada** | `russia`, `qing` | 1689-1858 | En 1695 y 1720 el mapa da `russia` entre 120 y 125 E **desde 52,5 hasta 54,5 N**, cuando por el tratado todo lo que queda al este del Argún y al sur del Stanovói era Qing. `p2_M` corrigió sólo la cuña de Albazino (121,6-127,2 E × 53,3-54,85 N) (`p2_informe_M` §4.5 y §8.4; `informe_testigos_H` §2.3) | **medio**. «Corregir la frontera entera pide una campaña propia y no me pareció de recibo hacerla a ciegas» |
| **`british` pierde todas las islas escocesas en 1707** | `british`, `scotland` | 1707-2025 | Siguen VACÍO: Hébridas Exteriores (Stornoway −6,39/58,21), Skye (−6,19/57,41), Mull (−6,00/56,45), Islay (−6,20/55,77), Arran (−5,23/55,58) y la **Isla de Wight** (−1,30/50,68). Todas son tierra según la máscara (`T.enTierra` = true) y todas las escocesas las pintaba `scotland` hasta 1707. El anillo de Gran Bretaña de `british` es sólo la isla mayor (`informe_A` §III.2) | **barato**: «es un arreglo de una sola línea con el mismo instrumento que uso para las Orcadas y conviene hacerlo en el mismo pase» |
| **El Tarim y el corredor de Hexi estaban rotos de raíz** | `tarim`, `tang`, `tibetan_empire`, `karakhanid`, `qocho`, `kara_khitan`, `moghulistan` | 619-1634 | El corredor de Hexi **VACÍO entre 618 y 692 y entre 738 y 763** (la arteria de la Ruta de la Seda sin nadie en casi todo el periodo Tang); `tarim` con un periodo `[649,692)` rotulado «Las Cuatro Guarniciones de Anxi… bajo los Tang» pero con geometría de ciudades-oasis; `karakhanid` cubriendo Kucha (que fue de Qocho desde 843) y **no** Jotán ni Yarkanda (que sí fueron karajánidas desde 1006) — exactamente al revés (`p2_informe_M` §3; `informe_testigos_H` §2.2) | **(¿resuelto?)** — 29 fallos corregidos por `p2_M`. **Queda abierto**: `qocho` sigue demasiado pequeño (cinco anillos que suman 8 grado² en el año 1000 para un reino que iba de Kucha a Hami); `uyghur_khaganate` pinta Hami en 760 cuando Yizhou era prefectura Tang hasta los años 780; `ganzhou_uigures` llega a 1036 aunque los tangut tomaron Ganzhou en 1028 |
| **`mughal`: Kandahar es un enclave flotante y nunca se devuelve en 1638** | `mughal`, `persia` | 1595-1649 | Entre el borde este de la caja (lon 66,60) y el anillo mayor del imperio hay **0,90 grados —unos 85 km— de `persia`** en toda la banda lat 31,3-32,3, con Qalat-i Gilzai (66,90/32,11) en medio, sobre el camino del Tarnak. Y el mapa da Kandahar a los mogoles de 1595 a 1622 y **nunca más** (comprobado en 1625, 1640, 1650, 1655 y 1660), cuando Ali Mardan Jan la entregó a Shah Jahan en **1638** y los mogoles la tuvieron once años. Zamindawar (64,60/32,30) y Bost (64,36/31,58), sarkars del suba de Qandahar, están en `persia` todo el periodo (`tanda6a` §2 y defectos 2, 3, 4) | **medio** |
| **`jin_dynasty` tiene once islas coreanas, Jeju y Ganghwa incluidas** | `jin_dynasty`, `goryeo` | 1211-1215 | De los catorce anillos de la fase, **once son islas coreanas** (0,46 grado²) y pertenecen al Jin **sólo** entre 1211 y 1215; en 1210 y 1216 no son de nadie. Entre ellas **Jeju/Tamna** (126,17-126,93 / 33,20-33,55) y **Ganghwa** (126,37-126,52 / 37,60-37,82). Mientras tanto Seúl y Kaesong son `goryeo` y Pyongyang no es del Jin: el Jin no tiene un metro de Corea continental y tiene trece islas. Tamna fue sometida por Goryeo en 938 y anexionada en 1105; Ganghwa es donde la corte de Goryeo se refugia de los mongoles desde 1232 (`tanda6b` §6 y 13.2) | **barato**: es un error de recorte, se borran los anillos. El mismo mecanismo que los dos jirones del delta de `toungoo` (borrados ya en `tanda6b_regla.js`) |
| **`khwarezm` pierde Transoxiana y Jorasán un año antes de tiempo** | `khwarezm`, `mongol` | 1219-1220 | En 1219 ya **no son de nadie** Otrar (cae febrero 1220), Bujará (febrero 1220), Samarcanda (marzo 1220), Merv (febrero **1221**) y Nishapur (abril **1221**). Los cinco son `khwarezm` en 1218. Y la caja del oasis está desplazada: **Khiva (60,36/41,38) y Hazarasp (61,07/41,32) no son de nadie**, mientras el borde superior de 43,90 entra en el Aral de la época (`tanda6b` §13 y 13.8) | **barato**: mover el bloque a 58,80-61,30 / 41,15-43,55, con el precedente `songhai`/Taghaza, y correr las fechas |
| **`tang` no tiene Jiaohe ni Turfán durante nueve años** | `tang`, `tarim` | 640-649 | En 640 Taizong crea Xizhou y Tingzhou y establece el protectorado de Anxi **en la fortaleza de Jiaohe**. Comprobado en 643: Gaochang (89,53/42,85) es `tang`, pero **Turfán ciudad (89,19/42,95) y Jiaohe (89,06/42,95) son `tarim`**, y Pichan/Shanshan (90,22/42,86) no es de nadie. Causa exacta: `tarim` tiene un único periodo 589..649 que no se parte en 640, y el anillo de `tang` es **el residuo de restarle `tarim`** (comprobado vértice a vértice) (`tanda6b` §8 y 13.4) | **barato**: partir `tarim` en 640 y recortarle la esquina del Turfán. «Mientras `tarim` no se parta, redibujar el residuo es darle cuerpo a un duplicado» |
| **`gojoseon` pierde media Corea en una re-teselación** | `gojoseon` | −109..−108 | La fase −111..−109 tiene **un** anillo (124,50-129,40 / 37,50-42,30); la fase siguiente, con el **mismo rótulo**, lo parte en cuatro y pierde territorio: Wonsan, Haeju, Kaesong y Chuncheon pasan de `gojoseon` a **nadie** y luego a `han`. Y abre un hueco interior: el anillo #1 tiene suelo en lat 40,50 y el #2 techo en 40,30, una franja vacía de 0,2° a lo largo de 2,2° de longitud, en el corazón del reino, el último año antes de la conquista (`tanda6b` §9 y 13.6) | **barato**: restaurar la geometría de −111..−109 para el último año o suprimir la partición |
| **`bengal_sultanate` tiene Chota Nagpur siglo y medio, y en 1540-1554 no tiene Bengala** | `bengal_sultanate`, `sur_empire` | 1429-1576 | El borde oeste en lon 84,00 mete la meseta de Chota Nagpur —Ranchi (85,33/23,35), Purulia, Dhanbad— dentro del sultanato en **todas** las fases desde 1429 (comprobado en 1435, 1500, 1530, 1545 y 1560): era el raj nagvanshi. Y en 1540-1554, con Gaur, Sonargaon, Dacca, Chittagong, Murshidabad y Calcuta en `sur_empire`, lo que queda es «un estado de Jharkhand sin Bengala» durante los catorce años en que el sultanato **no existía** (`tanda5b` §6, D3 y D4) | **medio** (13 fases; hay que tratarlo de una vez, no fase a fase). `tanda5b` se niega a borrar sólo 1540-1554 porque cambiaría un error constante por una intermitencia |
| **`moghulistan`: Tashkent diecinueve años antes y un rótulo que dice «pierde el Semirechie» sobre una geometría que lo contiene** | `moghulistan`, `timurid`, `kazakh_khanate` | 1465-1514 | Yunus Kan toma Tashkent en **1484** y la fase que la incluye empieza en 1465 (comprobado: Tashkent es `moghulistan` ya en 1470). Y los anillos r1 y r4 llegan al paralelo 45,50 al sur del Balkash: Almaty (76,90/43,25) es `moghulistan` en 1490, mientras **Sayram (69,65/42,31), que Yunus recibió junto con Tashkent, es `kazakh_khanate`**: pierde lo que ganó y conserva lo que perdió (`tanda5b` §7, D9 y D10; la misma decisión ya estaba archivada para 1500..1514 en `cajas_ok.js`) | **barato** el corte de 1484; **medio** bajar el límite norte al frente del Tian Shan (43,2-44,3 N), porque el borde de 45,50 es además costura entre cinco anillos |
| **`zhao_estado`: Jinyang doce años antes de tiempo y un «reino rump de Dai» que no contiene Dai** | `zhao_estado`, `yan_estado`, `china_norte_pueblos` | −260..−222 | Jinyang/Taiyuan (112,55/37,87) sale de Zhao en −260 y pasa a una **cultura**, pero Qin no le quita Taiyuan a Zhao hasta **−248** (Meng Ao, comandancia de Taiyuan). Y la ciudad de Dai (Daiwangcheng, 114,62/39,87) está en `yan_estado` en **todas** las fases de Zhao, de −700 a −222: el anillo −228..−222, rotulado «el rey Jia resiste en el reino rump de Dai», tiene su borde oriental medio grado —42 km— al oeste de Dai (`tanda6b` §4 y 13.1) | **barato**: mover el corte a −248 y llevar el límite Zhao/Yan hacia lon 115 a lat 40 (la comandancia de Shanggu de Yan tenía su sede en Huailai, 115,5/40,4) |
| **`dai_viet`/`ming` 1409-1427: un agujero sobre Nghe An y una franja vacía sobre Hanoi** | `dai_viet`, `ming` | 1409-1427 | Vinh / Nghe An (105,67/18,67) **no es de nadie** en toda la fase, y es justo la bisagra: donde aguantan los Tran tardíos (1409-1413) y donde Le Loi baja en 1424. Y entre el techo del anillo ming del delta (lat 21,40) y el suelo del anillo grande de China (lat 21,50) queda una **franja vacía de 0,1°** que cruza el delta al norte de Hanoi y separa la provincia de su metrópoli (comprobado: 106,00/21,45 y 106,30/21,44 sin entidad política). Haiphong (106,68/20,86) queda fuera de Jiaozhi, que llegaba al mar (`tanda6b` §7, §12 y 13.3) | **barato** la franja y Haiphong; **medio** Nghe An, porque el reparto 1409-1427 hay que rehacerlo entero (la provincia ming de Jiaozhi cubría «casi toda el área al norte de la cordillera anamita central» desde 1407) |
| **`yamhad`: el reino de Alepo sin Alepo, y la curva de áreas invertida** | `yamhad` | −1810..−1524 | El periodo −1550..−1524 tenía su borde oriental en el segmento `[37.4,35.7] → [36.8,36.6]`, que a la latitud de la ciudad pasa por lon **37,067**; Alepo está en **37,16**. Y el apogeo (−1759..−1600, «con Alalakh como vasalla») medía 2,47 grado² mientras el periodo posterior al saqueo de Mursili I medía **2,88**: el reino crecía al ser destruido (`tanda5a` §3 y defectos 1, 2, 3) | **(¿resuelto?)** los dos últimos periodos, redibujados en `tanda5a.js` (2,47 → 2,17 → 1,56). **Queda abierto**: el periodo −1810..−1600 tiene el rótulo «Hammurabi I y Abba-El, **con Alalakh como vasalla**» y su geometría **no contiene Alalakh**, ni Antioquía ni Ebla, y en cambio sí Iskenderun, al otro lado del Amanos. Es el mismo defecto que tenía `asiria` con Harrán |
| **`asiria`: el corazón del imperio sin dueño durante la guerra que lo destruyó** | `asiria`, `babilonia`, `media` | −627..−609 | Entre −626 y −612 el anillo principal de Asiria es una media luna de nueve puntos pegada al Zagros que pasa **por encima de Nínive y muy por encima de Assur**: en −621, −618, −615 y −613, Nínive, Assur, Arbela y Kalhu **no son de nadie** (ni de Asiria, ni de Babilonia —que no llega hasta −612—, ni de Media —cuyo anillo se queda en lon 44,90—). Catorce años de vacío. Y el tramo −612..−609 no contiene Harrán ni Karkemish, que son los dos sitios que nombra su propio rótulo (`asiria57` §1) | **(¿resuelto?)** — cinco tramos nuevos entregados en `asiria57.js` con 13.355 + 6.957 + 4.846 + 782 + 97 celdas rescatadas del vacío y **cero solapes**. Ojo al orden obligatorio: `asiria57_parte.js` → `asiria57_anade.js` → `asiria57.js`. **Queda abierto**: Arrapha sin dueño −616..−612 (0,97 grado²; el receptor correcto es `media`, cuyo anillo se queda en lon 44,90 — el informe deja el módulo escrito y verificado, `asiria57_parte2.js` y `asiria57_anade2.js`) |
| **El anillo de Tiglatpileser I arranca 41 años antes de que él reinara** | `asiria` | −1155..−1076 | Los periodos −1155..−1100 y −1100..−1076 usan un anillo de 27,68 grado² rotulado «Tiglatpileser I llega al Mediterráneo y al alto Éufrates», y Tiglatpileser I sube al trono en **−1114**. Entre −1155 y −1114 gobiernan Assur-dan I, Ninurta-tukulti-Assur, Mutakkil-Nusku y Assur-res-isi I (`asiria57` §5c: «el defecto más barato de arreglar de toda la entidad») | **barato**: un `parte` en −1114 y una sustitución; la geometría para −1155..−1114 es la del tramo anterior (−1180..−1155, 10,86 grado²), que ya existe |
| **`antigonid` conserva anillos imposibles en Anatolia central y Armenia** | `antigonid` | −281..−277 | Anillos sobre Paflagonia, Capadocia y hasta lon 43 en Armenia (per4 anillos 14 y 16; per5 anillos 14-22) **en los periodos cuyo propio rótulo dice «Sin trono: Gónatas conserva sólo Demetríade, Calcis y Corinto»**. `p2_K` movió el anillo jonio (195/196 vértices sobre toda Anatolia occidental) a `persia`; los otros siguen ahí (`p2_informe_K` §2.4 y §14.4) | **barato**: mover o borrar anillos que ya existen |
| **`antigonid` no existe entre −301 y −294** | `antigonid`, `grecia_antigua` | −301..−294 | Hueco temporal entero entre Ipsos y la toma de Macedonia por Demetrio, que conservó Corinto, Mégara, **Chipre, Tiro y Sidón**. `p2_K` rellenó sólo el Acrocorinto, «deliberadamente parcial: sólo pongo lo que mi lote demuestra» (`p2_informe_K` §6 y §14.5) | **medio** |
| **La Gascuña inglesa no llegaba a Bayona** | `british`, `france` | 1152-1451 | El anillo de `british` tiene la caja `−1,30 … 0,90 × 43,30 … 45,60`: **Burdeos (−0,58/44,84) cae dentro y Bayona (−1,48/43,49) se queda fuera por dieciocho centésimas de grado**. Siete fallos de una sola causa (`informe_testigos_H` §2.1, que ya lo diagnosticó por el contraste con el testigo de Burdeos, que acierta) → **`p2_informe_L` §7 lo arregló** | **(¿resuelto?)** |
| **La frontera árabe-bizantina estaba invertida dos siglos y medio** | `byzantine`, `umayyad`, `abbasid`, `seljuk`, `cilicia_armenia` | 660-1198 | Malatya salía bizantina en 629-749, 800-823 y 878-944, y abasí en 945-1054; Tarso igual, más selyúcida de 1077 a 1197. Los *thughur* están documentados como bloque y las dos bisagras fechadas al día (Melitene 19 de mayo de **934**; Tarso y Mopsuestia, Nicéforo Focas, **965**) (`informe_testigos_H` §2.1; **`p2_informe_L` §2 lo arregló** con dos polígonos, `ZCIL` y `ZMEL`) | **(¿resuelto?)**. **Queda abierto**: los anillos abasíes de 945-1055 llegan por el nordeste hasta **lat 39,9**, bien dentro de lo que tras 934 eran los temas bizantinos de Mesopotamia y Licando (`p2_informe_L` §7 de defectos) |
| **Nísibis está vacía entre 395 y 530** | — | 395-530 | Fue persa desde la cesión de Joviano (363) y capital de la Mesopotamia sasánida. El testigo de Nísibis sólo sondea −920 y −880, así que nadie lo mide (`p2_informe_K` §5 y §14.7) | **barato** |
| **`byzantine` llega a lon 42 en la alta Mesopotamia en los siglos V y VI** | `byzantine`, `persia` | s. V-VI | `p2_K` recortó Arzanene y la bolsa de Dura; el resto de esa frontera queda (`p2_informe_K` §14.8) | **medio** |
| **Ani sigue siendo `seljuk` entre 1236 y 1246** | `seljuk`, `mongol` | 1236-1246 | Los mongoles la tomaron en 1236 y el mapa no abre `mongol` allí hasta 1246. Diez años mal, sin sondeo que los mida (`p2_informe_K` §11) | **barato** |
| **`abbasid` pinta Armenia en 1045-1055** | `abbasid` | 1045-1055 | Aparece al lado del reducto bagrátida (`p2_informe_K` §14.11) | **barato** |
| **`hittite` pinta Biblos en −1200** | `hittite` | −1200 | Los hititas nunca gobernaron la costa fenicia al sur de Ugarit (`p2_informe_J` §14.9) | **barato** |
| **Menfis sale VACÍA en −727 y −700** | `egypt`, `kush` | −727..−671 | `egypt` −727..−671 sólo pinta por encima de 30,3 N y `kush` sube en una tira estrecha: entre las dos queda una franja sin dueño a la altura de Menfis. El mismo agujero que tenía Tebas, que `p2_J` sí arregló (`p2_informe_J` §3b y §14.6) | **barato**: extender el polígono `TEBAIDA` hacia el norte |
| **Tréveris y Maguncia salen VACÍAS entre 480 y 500** | `rome`, `franks`, `germanos` | 476-511 | El agujero renano es más ancho que Colonia; el polígono de `p2_J` sólo cubre el tramo de Colonia (`p2_informe_J` §14.8) | **barato** |
| **`fenicia` conserva un anillo de área cero en −573..−539** | `fenicia` | −573..−539 | Caja 35,1/35,2 × 33,0/33,2, es decir un punto. `p2_J` arregló los dos tramos anteriores, que tenían el mismo defecto y por los que Babilonia se quedaba Tiro desde −605 (`p2_informe_J` §4 y §14.7) | **barato**: geometría fantasma, se sustituye con el contorno de Tiro que `p2_J` ya dibujó |
| **`suevos` tiene periodo desde 409 y los vándalos y alanos no** | `suevos`, `vandals`, `rome` | 409-476 | El mismo hecho jurídico —el sorteo de 411— con **un beneficiario modelado y los otros dos no** (vándalos silingos en la Bética, alanos en la Lusitania y la Cartaginense). «O se modela el sorteo entero, o no se modela ninguno» (`p2_informe_K` §10 y §14.9; `informe_testigos_G` §5.7, que lo cazó con Gades, Cartagena y Numancia) | **caro**: afecta a toda la península y cambiaría de golpe una docena de plazas de otros lotes. **Es trabajo para una ronda de Iberia** |
| **`spanish` en el siglo XVI es un blob continental** | `spanish` | ~1520-1718 | El anillo americano es **un solo polígono** de caja lon −111,05..−58,53 / lat −37,05..44,60 que se traga todo Texas desde los años 1520, cuando Monclova es de 1689, las misiones del este de Texas de 1690, San Antonio de 1718 y Nuevo Santander de 1748. `informe_F` recortó sólo el Texas centro-meridional. Y el polígono del Río de la Plata y el Tucumán «parece dibujado sobre las gobernaciones de papel, no sobre las ciudades fundadas»: `spanish` sobre Córdoba desde 1541 (fundada 1573) y sobre Corrientes desde 1545 (fundada 1588) eran anacronismos de 32 y 43 años (`informe_F` §3 de defectos; `p2_informe_O` §5.10) | **medio**, y «merece una pasada entera» |
| **El contorno de `brazilian_empire` va por dentro de la costa** | `brazilian_empire`, `portugal`, `tupinamba`, `ge_cerrado` | 1535-1930 | `informe_F` lo dio como defecto de escala continental. **`p2_O` lo midió y lo acotó**: sondeando once puertos en cinco años, Recife, Natal, Vitória, São Vicente y Porto Alegre se pintan bien; lo que falla son **bahías y estuarios concretos** donde el contorno corta la boca en línea recta. Arreglados Guanabara y São Marcos. **Siguen VACÍO en todos los años Salvador de Bahía y Florianópolis** (Salvador cae además en píxel de agua, así que el sondeo lo disimula) (`informe_F` §1 de defectos; `p2_informe_O` §3.5 y §5.7) | **barato** por bahía: el arreglo es idéntico al ya aplicado en Guanabara y São Marcos |
| **La costa venezolana de `spanish` va tierra adentro** | `spanish`, `venezuela` | 1550-1821 | Entre 0,15° y 0,30° tierra adentro en todo el tramo central. `p2_O` abrió la caja de Caracas; La Guaira, Puerto Cabello y Barcelona tendrán el mismo problema (`p2_informe_O` §5.8) | **barato** |
| **`ge_cerrado` tapa a `brazilian_empire` en Fortaleza desde 1830** | `ge_cerrado`, `brazilian_empire` | 1830-1900 | El punto es `portugal` hasta 1800 y sustrato después: una capital de provincia del Imperio bajo una cultura del cerrado (`p2_informe_O` §5.6; el mismo patrón que `informe_F` arregló en Recife) | **barato** |
| **`mesoamerica_pueblos` llega hasta el Darién** | `mesoamerica_pueblos`, `istmo_chibcha` | todo su arco | Su borde oriental está en el meridiano −77,2. `p2_O` le quitó Panamá al este de −80,6; el resto de su límite meridional (Honduras, Nicaragua, Costa Rica) no está revisado «y probablemente también sobre» (`p2_informe_O` §5.9) | **medio** |
| **`seljuk` con Siria entera en 1150** | `seljuk` | ~1100-1200 | Un anillo único de caja 28,7-52,1 E / 23,9-42,1 N. `informe_C` talló el corredor de Alepo y `p2_L` le quitó Cilicia y la Osroene, pero el anillo sigue cubriendo Damasco —búrida hasta 1154— y el interior sirio (`informe_C` §15 de defectos) | **medio**. «Hay un lote entero de trabajo ahí» |
| **`british` no tiene factorías en Bengala antes de 1760** | `british` | 1690-1760 | Mismo defecto que `informe_C` arregló en Madrás (Fort St George, 1639) y Bombay (1665): **Fort William es de 1690** y Calcuta no existe para `british` hasta 1760 (`informe_C` §17 de defectos) | **barato**: «es el mismo defecto y conviene arreglarlo de una vez con el mismo método» |
| **`portugal` tiene Trincomalee veinticinco años antes de tomarla** | `portugal`, `sinhala` | 1596-1619 | Un anillo en 81,00-81,22 / 8,60-8,95 en los periodos de 1596 a 1619, y **lo pierde justo cuando empieza la ocupación real** (destruyen Koneswaram en 1622 y terminan el fuerte en 1624) (`informe_D` D-2) | **barato**, pero quitarlo sin más deja hueco: hay que emparejarlo con `sinhala 'mas'` y un `parte` en 1596 |
| **El rótulo de `kotte` nombra Jaffna y la geometría no llega** | `kotte`, `jaffna` | 1412-1469 | Rótulo «Parakramabahu VI reúne la isla desde Kotte y **toma Jaffna en 1450**»; caja 79,7-81,9 / 6,0-**9,0**; Jaffna está en **9,66** (`informe_D` D-1) | **medio** — y antes hay que decidir si 1450-1467 debe pintarse `kotte` (administración directa de un príncipe de Kotte) o seguir siendo `jaffna` con rótulo explicativo. `informe_D` deja la receta escrita para las dos salidas |
| **Tailandia en Camboya y Laos, 1941-1946** | `thailand`, `france` | 1941-1946 | El tratado de Tokio (mayo de 1941) le devolvió Battambang, Siem Reap y la orilla derecha laosiana; se devolvieron en 1946. Siem Reap sale `france` en 1943. Ningún sondeo lo toca (`informe_D` D-6) | **barato**: «la receta sería la misma que la de la sección G, con `parte` en 1941 y 1946» |
| **El Reino de África normando no existe fuera de Trípoli** | `kingdom_sicily` | 1146-1160 | `informe_E` añadió Tripolitania para 1146-1158 tras comprobar que **`kingdom_sicily` no tiene un solo anillo en África en ninguno de sus 5 periodos**. Mahdía, Susa, Sfax, Gabés y las Kerkenna (1148-1160) siguen sin pintar (`informe_E` §III.7) | **medio**; cae sobre plazas de otro lote (Túnez) y pide coordinación |
| **Trípoli entre 1530 y 1551 vuelve al sustrato** | `orden_malta`, `bereberes_magreb` | 1530-1551 | Al terminar el presidio español la ciudad vuelve a `bereberes_magreb` cuando fue de la **Orden de San Juan**, que sí existe en el mapa como `orden_malta`, hasta la conquista otomana de 1551 (`informe_E` §III.8) | **barato**: `anade orden_malta [1530,1551) 'mas' p_tripoli`, escrito en el propio informe |
| **`beja` se derrama sobre el Hiyaz** | `beja` | 969-1054 y más allá | Un pueblo del Sudán y la costa africana del mar Rojo pintaba **La Meca** de 969 a 999 y de 1031 a 1054. `informe_E` se lo quitó en [969,1048); **el anillo cruza el mar Rojo también fuera de ese tramo** (caja 30,8-42,0 / 13,5-26,8) (`informe_E` §III.2) | **barato-medio** |
| **Los paréntesis británicos de San Luis del Senegal y Gorée** | `france`, `british` | 1758-1779, 1809-1817; 1677- | `informe_E` metió a `france` en San Luis de corrido desde 1659 tras comprobar que la plaza francesa más antigua de África **no estaba en el mapa durante 231 años**; los dos paréntesis británicos no se modelan, y **Gorée sigue sin existir** (`informe_E` §III.9 y §III.11) | **barato** |
| **Massawa 1865-1869 sigue en `ottoman`** | `ottoman`, `egypt` | 1865-1869 | Egipto la recibió de los otomanos en 1865. `informe_E` la dio a `egypt` sólo desde 1870 «porque quitárselo a `ottoman` obligaba a tocar una entidad enorme por cuatro años sin ningún sondeo que lo pida» (`informe_E` §III.10) | **barato** |
| **El sur andino sigue con huecos fuera del periodo `inca` 1533-1538** | `inca`, `spanish` | 1538-1548 | La Paz no tiene dueño de 1538 a 1545 y Santiago de Chile de 1538 a 1541: los años en que el Inca ya no está y España todavía no ha fundado la ciudad. `p2_O` creó `inca` 1533-1538 (tres anillos, 27,7 grado², cero solape) y cerró la primera mitad (`p2_informe_O` §3.6 y §5.11; `informe_testigos_I` F14) | **barato**: «un periodo `inca` que llegue a 1541, o un avance escalonado de `spanish`, los cerraría» |
| **`curazao_abc` tiene un hueco 1801-1816 y Willemstad sale VACÍO en 1810** | `curazao_abc`, `british` | 1801-1816 | Corresponde a las ocupaciones británicas de 1800-03 y 1807-16, que el mapa sí modela para Surinam pero no aquí (`informe_F` §5 de defectos) | **barato**: dárselo a `british` en esos años |
| **`natchez` termina su arco en 1682** | `natchez`, `france` | 1682-1731 | Su propio rótulo habla de «Fort Rosalie y **revuelta natchez de 1729**» y el pueblo no se dispersa hasta 1731. Faltan cincuenta años (`informe_F` §4 de defectos) | **barato-medio**: `arco natchez [null,1731]` más `crea_periodo`, pero hay que decidir el reparto con `france` (Fort Rosalie es de 1716) |
| **`praderas_sur` sigue sin periodo entre 1783 y 1803** | `praderas_sur`, `comanche` | 1783-1803 | `informe_F` restauró `osage_kansa` y `wichita` en ese hueco pero **se negó** a restaurar `praderas_sur` porque su anillo pisa a `comanche`, que en esos años ocupa de verdad el Llano Estacado (`informe_F` §7 de defectos) | **medio**: «alguien tiene que decidir el reparto» |
| **La orilla sur del San Lorenzo oscila entre fases** | `france`, `bosques_orientales` | 1650-1763 | En 1650 y 1755 **toda la orilla sur** (Richelieu, Sorel, Saint-Hyacinthe, los Cantones del Este) es `bosques_orientales`; en 1700 sí es `france`. Barrido a 0,1° entre lon −74,4 y −72,0 (`informe_F` §2 de defectos) | **medio**: «hay que revisar las fases de Nueva Francia» |
| **`pratihara` atraviesa el valle de Katmandú** | `pratihara` | 836-910 | Contiene **Patan (85,32/27,67), Kirtipur y Thankot** y **no** contiene Katmandú, cuatro kilómetros al norte: una cuña que parte la capital en dos. Los Gurjara-Pratiharas nunca tuvieron el valle (`nepal52` §6.1) | **barato**: subir el borde norte de `pratihara` por debajo del Mahabharat (lat ~27,2) en el meridiano del valle. «Retocar en `himalaya_reinos` no sirve de nada: `carve` volvería a morder» |
| **Gorkha entre 1744 y 1768 no la tiene nadie** | `baisi_chaubisi`, `nepal` | 1744-1768 | El rótulo de `baisi_chaubisi` 1743-1768 dice «Prithvi Narayan Sah toma **Nuwakot (1744)**» y su caja termina en 84,90 E; Nuwakot está en 85,17 E. `nepal` no empieza hasta 1768 (`nepal52` §6.6) | **barato**: extender el lóbulo oriental de `baisi_chaubisi` o retrasar el arco de `nepal` a 1744 |
| **`nepal` 1790-1818: la máxima extensión gorkha sin acontecimientos detrás** | `nepal` | 1790-1818 | Pinta el Sutlej-Teesta desde 1790, cuando la campaña de Kumaon es de 1790-91 y la de Garhwal de 1804, y la conserva idéntica hasta 1818 pese a **Sugauli (1816)**. Las áreas 14,648 / 14,646 / 14,647 / 14,681 / 14,683 / 14,681 no responden a nada (`nepal52` §6.7) | **medio** |
| **`mughal` sobre las colinas de Nepal y sobre Mustang** | `mughal` | ~1700 | En 1700, (86,20/27,70) y (86,30/27,70) —Nepal oriental al este de Dolakha— son `mughal`; y **Lo Manthang (83,95/29,18), en el trans-Himalaya, también**, mientras sus vecinos inmediatos son `baisi_chaubisi` (`tanda5b` D11) | **medio** |
| **`benin` llega al Níger 150 años antes que su propio rótulo** | `benin` | 1300-1600 | El anillo contiene Asaba (6,73/6,19) desde 1300 y en todas las fases hasta 1600, pero **el rótulo de 1450..1500 dice literalmente «Ewuare y Ozolua expanden las fronteras hasta el Níger»** (`tanda5a` §7 de defectos) | **barato** |
| **`akwamu` cruza el Volta 33 años antes de tiempo** | `akwamu` | 1677-1710 | El anillo 1677..1701 contiene **Ho (0,47/6,60)**, al este del Volta. Akwamu cruza el Volta en **1702** (campaña de Whydah) y somete la región de Ho en 1710. Afecta también a 1701..1702 (`tanda5a` §8 de defectos; el mismo problema en 1600..1677 con Akosombo ya está arreglado) | **barato** |
| **`ayutthaya`: un pasillo birmano de 22 km parte el reino en dos** | `ayutthaya`, `toungoo` | 1569-1584 | El anillo marcado acaba en lon 101,00 y el siguiente anillo del reino empieza en lon 101,20. La franja intermedia —0,2° de ancho por 4 de alto, del paralelo 13 al 17,2, unos 22 × 450 km sobre el Chao Praya y el Pa Sak— es `toungoo`, y **en 1590 vuelve a ser `ayutthaya`**. Residuo de dos cortes distintos. Y el borde oeste recto en lon 99,60 deja **Kamphaeng Phet (99,52/16,48) en `toungoo`** mientras Sukhothai y Phitsanulok siguen en `ayutthaya`, cuando las tres eran las «ciudades del norte» bajo el mismo señor (`tanda5b` §4, D7 y D8) | **barato** el pasillo, pero hay que cerrarlo **en el lado de Toungoo o en los dos a la vez**, no en `ayutthaya` |
| **`toungoo` pierde la costa de Tenasserim quince años** | `toungoo` | 1584-1599 | Ye (97,86/15,25) y Tavoy (98,20/14,08) son `toungoo` en 1560, **de nadie en 1590** y `toungoo` otra vez en 1620, mientras el reino conserva un bloque de sierra al este del Salween que llega a lon 98,70, ya en la vertiente siamesa, y al que no hay por dónde llegar (`tanda6b` §11 y 13.10) | **barato** |
| **`chalukya` 1187-1189: sin la capital y sin el destierro** | `chalukya`, `yadava`, `hoysala` | 1187-1189 | Kalyani (76,95/17,87) pasa a `yadava` **en 1187**, dos años antes del final de la dinastía; Banavasi (75,02/14,53), donde Someshvara IV fue desterrado, es `hoysala`; y **Badami (75,68/15,92) no es de nadie**. Además el rectángulo no es una frontera que se encogió: el mismo terreno **no era de nadie** en la fase anterior (`tanda6b` §13 y 13.7) | **medio**: primero hay que decidir dónde va el bloque |
| **`pandya` 1323-1335: el rótulo va doce años por delante del reparto** | `pandya`, `delhi_sultanate`, `madurai_sultanate` | 1323-1335 | En **1323** Ulugh Khan anexiona Ma'bar y Madurai pasa a ser provincia de Delhi; **Jalaluddin Ahsan Khan no se declara independiente hasta 1335**. Durante esos doce años el mapa da Madurai a `pandya` y no hay ninguna entidad de Delhi en Tamil Nadu (`tanda6b` §1 y 13.5) | **medio**: afecta a `delhi_sultanate` y a `madurai_sultanate`, «no es decisión de una sola entidad». El defecto de costa del mismo anillo ya está redibujado en `tanda6b.js` |
| **Lorena figura como imperial sin las ocupaciones francesas** | `holy_roman_empire`, `france` | 1648-1714 | Nancy, Lunéville, Épinal, Mirecourt, Vaudémont y Saint-Dié están en `holy_roman_empire` en 1660, 1675, 1682, 1690, 1700 y 1710, pero Francia ocupó el ducado **de 1670 a 1697** y **de 1702 a 1714**: veintisiete de los cincuenta y tres años del anillo. Además la caja corta en lat 48,95 —se queda con la mitad sur del ducado— y mete dentro **Toul (5,89/48,68)**, que era de los Tres Obispados franceses (`tanda6a` §5C y defecto 10) | **medio**, y depende de la decisión sobre ocupaciones (§5) |
| **El Imperio metido 80 km en la Gran Polonia** | `holy_roman_empire`, `poland_lithuania` | 1335-1367 | El anillo de la escalera de la Baja Lusacia contiene **Leszno (16,58/51,84), Wolsztyn, Ksiaz Wielkopolski y Wschowa**, que son Wielkopolska, no tierras de la corona de Bohemia: Trentschin (1335) dio Silesia, no la Gran Polonia. Y al lado, **Swiebodzin (15,53/52,25) y Miedzyrzecz (15,58/52,45) no son de nadie**, ni en 1330 ni en 1340 (`tanda6a` §5A y defecto 8) | **medio** |
| **`british` en la bahía de Hudson: quince años de factoría dibujados como treinta** | `british` | 1670-1700 | La franja del Severn es británica de 1670 a 1700 sin interrupción, pero la Compañía sólo tuvo presencia entre **1685 y 1690** (New Severn House fundada en 1685, destruida por d'Iberville en 1690; la costa se queda sin factoría **hasta 1759**). Afecta igual al anillo vecino de York Factory, que tampoco refleja las tomas francesas de 1694-1696 y 1697-1714 (`tanda6a` §1 y defecto 11) | **barato**: es de calendario, no de línea |
| **`garamantes`: la conquista árabe dibujada de sur a norte** | `garamantes`, `umayyad` | 661-667 | En **665** Murzuq (13,92/25,91) ya es `umayyad` mientras Germa (13,06/26,55) y Zawila (15,11/26,17) siguen garamantes. Uqba ibn Nafi entró por el **norte** —Waddan, luego Zawila, luego Germa— en la campaña de 666-667. El corte recto de lat 26,00 va en dirección contraria a la campaña (`tanda6c` §Encargo 1 y D7) | **barato** |
| **`oyo`: el exilio contiene la capital de la que huyeron** | `oyo` | 1535-1615 | El rectángulo rotulado «Exilio en Borgu y Oyo-Igboho tras la invasión nupe» **contiene Oyo-Ile (4,13/8,98)**, que es exactamente la capital abandonada hacia 1535 y no recuperada hasta Abipa. Y el salto de área de 0,45 a 0,63 grado² en 1600 «no responde a ningún suceso: es el mismo rectángulo al que le han devuelto las dos esquinas recortadas» (`tanda6c` D6). Del otro lado, `p2_O` comprobó que los periodos 1300-1535, 1804-1823 y 1823-1836 **no llegaban a su propia capital** y que `sokoto` la cubría desde 1824 cuando Oyo-Ile no se abandona hasta 1835-36 (`p2_informe_O` §3.3; `informe_testigos_I` F3) | **(¿resuelto?)** la extensión de `oyo` a su capital y el recorte a `sokoto`. **Queda abierto** el rótulo del exilio y el corte injustificado de 1600 |
| **`papal_states` tiene Provenza y le falta el Comtat** | `papal_states`, `holy_roman_empire` | 1278-1791 | El pentágono de 1278-1348 contenía **Aviñón (4,81/43,95) setenta años antes de la compra de 1348**, Villeneuve-lès-Avignon (orilla derecha del Ródano, fortaleza del rey de Francia) y Apt, y cruzaba la Durance. `tanda6c_regla.js` lo redibuja (28 vértices, 0,258 grado², Aviñón fuera). **Queda abierto**: Arles y Tarascón dentro de 1348 a 1791; **Mont Ventoux y Valréas fuera** de 1348 a 1791; el principado de Orange, soberano de 1163 a 1713, dentro todo el tiempo; y la cesión es de **1274**, no de 1278 (`tanda6c` §2 y D5) | **medio** para lo que queda |
| **Falta la mitad sur del principado de Antioquía** | `crusader_states`, `seljuk`, `byzantine`, `ayyubid` | s. XII | Entre el anillo de Antioquía (borde sur lat 35,80) y el de Jerusalén-Trípoli (borde norte lat 35,30) hay media grado sin dueño. Comprobado en 1105, 1120, 1140, 1150, 1160 y 1180: **Latakia (35,79/35,52) no es de nadie en todo el siglo XII** (Tancredo la tomó en 1108 y fue una de las cuatro grandes ciudades del principado hasta 1188); **Jabala** figura como `seljuk`; **Sahyun/Saona** figura como `seljuk` (fue el castillo franco más imponente del norte de 1119 a 1188); **Tortosa/Tartús** figura como `byzantine` todo el siglo (fue del condado de Trípoli y de los templarios desde 1152) (`tanda6c` §4 y D4) | **medio** |
| **`israel_juda`: tres periodos rotulados «Reino de Judá» que no contienen Judá** | `israel_juda`, `asiria`, `babilonia` | −745..−586 | El periodo −722..−627 rotulado «Reino de Judá» es **una cuña de la llanura costera del Sarón**, entre Jaffa y el Carmelo; el de −626..−586 —los últimos cuarenta años del reino— es **una aguja de 0,04 grado²** en el Carmelo que no contiene nada. Jerusalén es `asiria` de −745 a −628, `israel_juda` **sólo en −627**, de **nadie** de −626 a −606 y `babilonia` desde −605 (`tanda6c` §6 y D3). Del otro lado: el periodo −745..−722 «Israel reducido a Samaria» pinta **sólo Samaria** y el siguiente, «Reino de Judá», **repite el mismo anillo**, de modo que Judá de verdad (Laquis, Hebrón, el Négueb) se la quedaba `asiria` (`p2_informe_J` §4, Laquis: «el peor caso estructural del lote»; `informe_testigos_G` §5.2) | **(¿resuelto?)** los dos primeros, con `sustituye israel_juda` en `p2_J`, y el tercero con la entrega de `tanda6c.js`. **Comprobar que las dos entregas no se pisan**, porque tocan periodos contiguos de la misma entidad desde rondas distintas |

---

## 3. Huecos de cobertura

Ordenados por tamaño medido. Un hueco es peor que un error de atribución «porque no se ve
mirando la entidad sola» (`informe_testigos_I` F8).

**Los grandes, con medida:**

1. **Timor entera en 1600** — 1.060 celdas de tierra a 0,05° sin una sola pintada. Ver §1.
   (`p2_informe_N` §7.4.)
2. **El Decán, 1187-1336** — 1.038 de 2.052 celdas de tierra vacías en 1300 (73-80,5 E /
   13,4-16,6 N). Arreglado en su mayor parte por `informe57`; quedan **374 celdas en 1320**
   en el Karnataka septentrional (Belgaum, Hampi, el doab), que es el Decán tugluq y le
   corresponde a `delhi_sultanate` — no ampliado porque obliga a tallar esa entidad contra
   centenares de rivales. (`informe57` §2.2 y §2.3.) **Esfuerzo: medio.**
3. **al-Ándalus entera en 1145 y 1146** — **6.988 de 6.988 puntos de tierra sin dueño**, el
   cien por cien del suelo andalusí, más las Baleares vacías de 1145 a 1203 (cincuenta y
   ocho años). Resuelto por `taifas51` con cinco fases de `taifas`. **(¿resuelto?)**
   Quedan los 61 puntos del Maestrazgo costero 1171-1233 (§2) y los huecos del Magreb:
   **Fez (−5,00/34,03) y Ceuta (−5,32/35,89) sin dueño en 1146**, Argel y Túnez sin dueño
   entre 1148 y 1155 (`almoravid` 1145..1147 se reduce a un anillo de lon −10,59..−6,00 /
   lat 29,00..33,00 y `hammadi` y `zirid` acaban antes de que llegue `almohad`).
   «Es el mismo defecto que el de al-Ándalus, en la otra orilla, y merece una ronda propia»
   (`taifas51` §8.8). **Esfuerzo: medio.**
4. **Nepal occidental y oriental, 750-1400** — 203 celdas de 0,25° vacías en 1100, 186 en
   800, 109 en 1300. Es el hueco que `nepal52` abre **a propósito** al quitar un polígono
   falso, y su argumento es explícito: «un vacío dice *no modelado*; un polígono rotulado
   *Periodo Thakuri en el valle de Katmandú* que llega hasta el Mechi dice que los thakuri
   gobernaban de Doti a Ilam, y eso es falso». Lo que corresponde es **crearle dueño**
   (`khasa_malla` y Limbuwan, §1), no rellenarlo con la entidad equivocada.
   **Esfuerzo: medio.**
5. **`british` y las islas escocesas, 1707-2025** — seis islas VACÍO en todo el arco
   moderno, todas tierra según la máscara. Ver §2. **Esfuerzo: barato.**
6. **Polonia, 1939-1945** — Varsovia (21,02/52,23) sale **VACÍO de 1939 a 1945**; en 1946
   vuelve `poland_lithuania`. Leópolis (24,03/49,84) también, en 1940 y 1942, y sólo el
   vecindario a 0,1° pinta `ussr`. Ni el Gobierno General ni la partición germano-soviética
   están modelados. «Es el hueco más grande que he encontrado… no lo arreglo: es toda
   Polonia, no una plaza de mi lote» (`informe_A` §III.1). **Esfuerzo: medio**, y entra en
   la decisión de modelo sobre ocupaciones (§5).
7. **La franja del Magdeburgo imperial** — 138 celdas sin dueño en 11,05-12,20 /
   51,46-51,59, entre el techo del anillo grande (51,45) y el suelo del parche (51,60), de
   1423 a 1526. Ver §2. **Esfuerzo: barato.**
8. **El Nilo nubio y egipcio a −6000** — 42 celdas de 2°. Ver §1. **Esfuerzo: medio.**
9. **Las Antillas en todo el arco** — 25 celdas de 1° hasta cerca del año 1000. Ver §1.
   **Esfuerzo: medio.**
10. **Marianas del Norte, 1947-1986** — **coste declarado** de `p2_N`: al retirar a `usa`
    los anillos de Rota, Tinián y Saipán (que eran territorio en fideicomiso de la ONU, no
    suelo estadounidense), queda al descubierto el hueco que `fideicomiso_pacifico` tiene en
    su caja de las Marianas, tallada en su día alrededor de esos mismos anillos: **5 celdas
    de 24 pasan de `usa` a VACÍO durante 39 años**. `plazas.js` no lo nota porque su regla de
    contorno generalizado encuentra `fideicomiso_pacifico` a 0,1°, «pero el mapa dibujará un
    agujero». La reparación son tres anillos de 0,0056 a 0,0098 grado², escrita en
    `p2_N_anade_BLOQUEADO.js` y **bloqueada por el umbral de `aTierra`** (§4).
    **Esfuerzo: barato**, en cuanto se baje el umbral.
11. **Tundra ártica occidental, anterior a −6000** — 78 de 132 celdas vacías en lon 50-112 /
    lat 66-78. Es **decisión declarada** de `antigua_eurasia2` §6.4: la única evidencia con
    contexto en la tundra de Yamal a Taimir es Tagenar VI (~6.020 BP). «Es ignorancia
    arqueológica declarada, no una afirmación de vacío, y por eso tampoco propongo entrada
    de `vacios.js` para él.» **No tocar**; se lista para que no se cuente dos veces.
12. **Iberia interior e Italia antes del −6000** — 18 de 21 celdas vacías a −10000 y 16 a
    −8000 (Iberia); 8 de 20 (Italia). Ver §1. **Esfuerzo: barato tras renombrar.**
13. **El Danubio medio: el agujero de `starcevo`** — 11 celdas vacías a −8000 y −7000, 13 a
    −10000, en lon 17-29 / lat 42-49, justo donde está el Mesolítico de las Puertas de
    Hierro (Lepenski Vir, Vlasac, Padina, Schela Cladovei, 13.000-6.000 cal a.C.).
    `mediterraneo_balcanico` y `bosque_templado_europeo` tienen recortado el hueco de
    `starcevo` (−6200..−5300) y al estirar sus arcos el hueco queda sin dueño antes de
    −6200. «Es el mayor defecto que introduce esta propuesta si no se corrige»
    (`antigua_eurasia2` §6.2). **Esfuerzo: barato**: tallar menos, no tallar más.
14. **El Caspio meridional, todo el arco** — 5 celdas de 11 vacías en lon 48-56 / lat 35-39,
    con Hotu y Kamarband dentro. Ver §1. **Esfuerzo: medio.**
15. **El Cáucaso meridional hasta el −3000** — 6 celdas de 2° vacías a −4000 y 13 a −6000
    entre lon 42-48 / lat 38-44: Dzudzuana, Satsurblia, Kotias Klde, Ereván y Najicheván
    sin dueño desde el principio del mapa hasta que aparece `kura_araxes`. El primer periodo
    de `caucaso_pueblos` mide 20,5 grado² frente a un máximo de 60: es el Cáucaso norte, el
    Daguestán y el Kurá hasta Tiflis, y deja fuera Imereti, Armenia y Najicheván
    (`antigua_eurasia` §6.3 y §9.5). **Esfuerzo: barato**: ensanchar el primer periodo de
    `caucaso_pueblos` hasta cubrir lo que su propio nombre promete.
16. **Crimea, lo que queda tras `informe57`** — 27 celdas en 1400 (Tarjankut y la costa de
    Azov, costura entre `golden_horde` y `genoa`), 13 en 1450 (costa de Yalta), 6 en 1470, y
    **1440 entero**, un año en que `golden_horde` se encoge y `crimean_khanate` no ha
    empezado: Simferópol, Yevpatoria y Chufut-Kale VACÍOS sólo ese año (`informe57` §1.6).
    **Esfuerzo: barato.**
17. **Siberia en la guerra civil rusa, 1917-1922** — `russia` termina en 1917 y `ussr` no
    cubre Siberia hasta 1919-1922, con `russia_white` tapando sólo una parte: Tobolsk VACÍO
    en 1917-1918 y 1920-1922, Krasnoyarsk en 1917 y 1921, Ojotsk en 1917-1922 (`informe_A`
    §III.6). **Esfuerzo: medio.**

**Huecos acotados, por regiones:**

18. **Nísibis 395-530**; **Derbent 750-1055 y 1279-1382** (abasíes, Ilkanato tardío, Horda
    de Oro; `informe_B` §III.4 deja el corredor `P.derbent` listo para reutilizarse);
    **Salónica bizantina 1403-1423** (el mapa la da a los otomanos desde 1387 sin
    interrupción, cuando Solimán Çelebi la devuelve al Imperio en 1403) (`informe_B` §III.6);
    **Crimea suroccidental 1018-1441** (resuelto por `theodoro`, **(¿resuelto?)**).
19. **Menfis −727 y −700**; **Tréveris y Maguncia 480-500**; **Chipre desde −627**;
    **Arrapha −616..−612**; **el Punyab −331..−327**; **Bactria −130..+30**; **el Levante
    entre −9500 y −8800** (resuelto por `ppna`, **(¿resuelto?)**).
20. **Almalik 1514-1598 y 1613-1634, Otrar 1450-1500** — el Ili y el medio Sir Daria en
    disputa uzbeko-kazaja, sin nadie que los pinte. No están en los sondeos de `p2_M`
    (§8.8). **Esfuerzo: medio.**
21. **Chukotka a medias** — `p2_M` dio a `russia` la cuenca del Anadyr desde 1649, pero el
    mapa sigue teniendo `chukchi_koryak` hasta 1930 en la península entera **mientras pinta
    `russia` en Kamchatka desde 1721 y en la Chukotka oriental desde 1860**: una bolsa en
    medio. La solución coherente sería `russia` en toda Chukotka desde 1779 o desde 1889
    (`p2_informe_M` §8.5). **Esfuerzo: medio**, y es más una decisión (§5) que un hueco.
22. **El Kolimá nunca llega a ser ruso** — Srednekolymsk (153,7/67,46) sale `yukaguiros`
    **de 1600 a 1930**, sin pasar nunca por `russia`, aunque el ostrog es de 1643 y el
    óblast de Yakutsk lo administraba. Es el mismo defecto que `informe_A` arregló en el
    Lena, un poco más al este (`informe_A` §III.7). **Esfuerzo: barato**, con el mismo
    método (`borra_periodo` + `anade` con el anillo que se libera).
23. **Petsamo (31,1/69,6) VACÍO en 1930, 1942 y 1946** — es tierra según la máscara; ni
    Finlandia (que lo tuvo de 1920 a 1944) ni la URSS lo pintan (`informe_A` §III.9).
    **Esfuerzo: barato.**
24. **Salvador de Bahía y Florianópolis VACÍO en todos los años**; **Willemstad 1810**;
    **La Paz 1538-1545 y Santiago de Chile 1538-1541**; **Lisboa (−9,14/38,72) VACÍA en todo
    el siglo XII y posteriores** por un problema de recorte de costa en el estuario del Tajo
    (`taifas51` §8.10). **Esfuerzo: barato** los cuatro.
25. **Las islas Santa Cruz (Temotu) no las pinta nadie, nunca** — Nendö (165,85/−10,72), las
    Reef, Utupua y Vanikoro **no aparecen en ningún corte entre −1000 y 1950**; sólo desde el
    año 2000 las alcanza `solomon_islands` en algunos puntos, y Nendö ni siquiera entonces.
    El contorno de `salomon_pueblos` llega por el este a lon 162,4 (`antigua_eurasia` §9.3).
    Hacen falta las dos cosas: una entrada en `vacios.js` (el informe la deja escrita,
    `desde:-1100`, por el Lapita de RF-2/Nenumbo y SE-SZ-8) **y** los anillos de Temotu en
    `salomon_pueblos` desde −1100. **Esfuerzo: barato.**
26. **`micronesia_fsm` tiene tres anillos para cuatro estados** — Yap, un atolón al oeste
    (probablemente Ulithi) y Pohnpei. Faltan **Chuuk** —el estado más poblado— y **Kosrae**.
    Los dos caen bajo el umbral de `aTierra` (`p2_informe_N` §7.5 y §3.11).
    **Esfuerzo: barato** en cuanto se baje el umbral.
27. **Kosrae, Nauru, Rarotonga y Tarawa: «la capa existe y la isla principal falta»** —
    Kosrae sin dueño de 1914 a 2000 y pintada por `marshall_iroij` de 1700 a 1899 pese a
    estar a 700 km del atolón marshalés más cercano; Nauru VACÍA de 1888 a 1968 (la propia
    entidad `nauru` está partida por un hueco de ochenta años); `cook_maohi` tiene **catorce**
    anillos de islas Cook y **no** tiene Rarotonga, la principal; `pacifico_britanico` tiene
    las ocho Gilbert en 1892-1893 y en 1978-1979 y **una sola, Nonouti, en los ochenta y seis
    años de en medio** (`informe_testigos_I` F8, medido sobre la geometría;
    `p2_informe_N` §3.8 a §3.12). Tarawa y las Marianas **(¿resuelto?)** con `copia_anillo`;
    Kosrae, Nauru y Rarotonga siguen **bloqueadas por el umbral de `aTierra`** (§4).
28. **74 celdas de hueco estructural americano en el año 1** — fragmentos de una y dos celdas
    por costuras y bordes: alto Orinoco, interior de Guayana, Misuri medio, Apalaches y golfo
    de San Lorenzo. «Merecen una pasada de `fragmentos.js`» (`antigua_america` §9.8).
29. **Costura permanente del Altái** — las celdas 82/52, 84/50, 84/52 y 86/50 están vacías
    **tanto a −6000 como a −4000**, en el hueco que dejan entre sí `estepa_kazaja` (hasta
    lon 84,2), `altai_sayan` (desde 84,2) y `dzungaria_altai` (hasta lat 49,8), con Denisova
    al lado. «No lo arregla ningún cambio de arco: es un talle mal cerrado»
    (`antigua_eurasia` §9.2). **Esfuerzo: barato.**
30. **Las Baleares entre −2400 y −1000** — nadie las pinta hasta `talayotica` en el −1000.
    El vacío es legítimo hasta ~−2400 (Cova des Moro, Biniai Nou) y **real después**
    (`antigua_eurasia2` §9.2, con la entrada de `vacios.js` ya escrita).
31. **Costuras menores** ya declaradas por sus autores y que no conviene volver a contar:
    45 celdas al este del anillo de `mapuche` hacia los Andes en 1870-1880 y 85 en las
    Guaitecas y el sur de Chiloé en 1550-1820 (`informe_F` §8 de defectos); 3 celdas de
    redondeo del recortador en (−98,0/37,4) en 1700 y (−100,9/46,5) en 1750 y 1760
    (`informe_F` §Verificación); 2 celdas de una astilla costera junto a Focea en −547 y
    −546 (`p2_informe_K` §13); los 10 puntos del litoral valenciano y el delta del Ebro que
    `aTierra` descarta igual en el anillo original (`taifas51` §7).

---

## 4. Problemas de instrumental

Ordenados por lo que desbloquean.

### 4.1. El suelo de 0,02 grado² de `recorte.aTierra` bloquea todas las islas pequeñas

**El problema más grande de instrumental del inventario, y está medido.**
`recorte.js/aTierra` termina en `limpia(res, 0.02)` (línea 68), que descarta cualquier
pieza de menos de 0,02 grado². Y `anade`, `crea`, `crea_periodo` (con geometría propia),
`sustituye`, `redibuja_anillo` y `anillo_regla` pasan **todos** sus polígonos por `aTierra`.
Cuando vuelve vacío, `anade` hace `if(!rec.length) continue`: **la operación se salta sin
decir nada.**

Medido, pasando por `aTierra` una caja alrededor de cada isla (`p2_informe_N` §1):

| isla | área real en `land-50m` | piezas que devuelve `aTierra` |
|---|---|---|
| Nauru | 0,00223 | 0 |
| Kosrae | 0,00236 | 0 |
| Tarawa | 0,00291 | 0 |
| Rarotonga | 0,00539 | 0 |
| Rota / Ternate / Tinián / Tidore / Majuro / Saipán / Yap / Tutuila | 0,0056 a 0,0099 | 0 |
| Koror (Babeldaob) | 0,02653 | 1 |
| Ambon | 0,05123 | 1 |

Consecuencia: **ninguna isla de menos de ~250 km² puede entrar hoy en el mapa por ninguna
de las siete vías del encargo**, ni añadiéndola ni quitándola (el polígono del `'menos'`
también pasa por `aTierra`). Los anillos de Majuro, Yap o Nauru que el mapa **sí** tiene
son polígonos crudos metidos por generadores de rondas antiguas: hoy no se podrían volver
a poner.

**Propuesta** (`p2_informe_N` §1): que `aTierra` no aplique un umbral absoluto sino que
devuelva lo que la máscara reconoce como tierra, y que el filtro de astillas se aplique
donde tiene sentido —a los recortes de contornos continentales, no a las islas—. Como
mínimo, que `anade`/`crea_periodo`/`sustituye` **avisen** cuando `aTierra` devuelve vacío
en lugar de seguir en silencio. Comprobado a las dos puntas: con `res=limpia(res,3e-4)`
—el mismo suelo que ya usan `anade`, `sustituye` y `arregla_auto` para sus propios
resultados— **las doce operaciones bloqueadas entran limpias y el lote N pasa de 18
discrepancias a 0**.

Lo que desbloquea, ya escrito y verificado en `p2_N_anade_BLOQUEADO.js` +
`p2_N_parte_BLOQUEADO.js`, con los **anillos literales de la máscara**: Kosrae (6
operaciones), Rarotonga, Nauru 1888-1968 y los tres anillos de las Marianas del Norte del
fideicomiso. Efecto medido: **18 discrepancias → 0** y **37 huecos → 4**.
El mismo umbral tira la **Enclave de los papas** (0,0158 grado², trazada y verificada en
`tanda6c` §2, con los cuatro pueblos dentro y cinco fuera) y un enclave genovés en
**Cembalo/Balaklava**, que «vuelve con área cero de `recorte.aTierra` probado con tres
trazados distintos» (`informe57` §1.6).

### 4.2. `redibujar.js/esTesela` sólo mira los anillos del mismo periodo

`esTesela` recorre `p.rings`, es decir **los otros anillos del mismo periodo de la misma
entidad**. Pero la costura típica de este mapa no es interna: es la que deja `quita_caja` /
`recorta_caja` cuando se pica un rectángulo en el vecino, y el borde recto queda repetido,
**vértice a vértice, en dos civilizaciones distintas**. `esTesela` no lo ve nunca.

Medido sobre el mapa entero: **236 de los 337 anillos de la columna DIBUJO A MANO —el
70 %— tienen más del 60 % de su perímetro recto cosido a otra entidad**, con vértices en la
coordenada exacta. Si `esTesela` mirase también a los vecinos, **la lista de trabajo pasaría
de 337 a ~101** y lo que quedase sería mucho más parecido a trabajo de verdad. El script de
medida quedó en `/tmp/geo/_t6_seam.js` (`tanda6a` §0).

Esto no dice que las cajas estén bien: dice que **arreglarlas no es un problema de trazo
sino de reparto**, y que el reparto se hace de a dos, tocando las dos entidades a la vez,
no con una clave que sólo toca una. Es la razón por la que `tanda6a` entrega **cero
contornos y siete negativas** y `tanda6b` una entrega sobre doce.

### 4.3. `vacios.js`: un esquema que no puede decir la verdad

Tres problemas encadenados, reportados por tres rondas distintas:

- **El campo `desde` sólo sabe expresar «vacío antes de X, poblado después».** El Sáhara es
  el caso inverso: el Periodo Húmedo Africano va de ~14.800 a ~5.500 BP, o sea que **en el
  arco del mapa el Sáhara estuvo verde desde el principio hasta ~−3500 y vacío después**.
  Hoy, en las mismas coordenadas, el registro dice «nunca hubo nadie» (`desde:null` en las
  cinco cajas saharianas) y el mapa dice «hubo alguien siempre» (`pueblos_sahara` pinta
  Adrar Bous, el Gilf Kebir, el Tanezrouft y El Djouf en **todos** los cortes de −8000 a
  1920, incluido el año 1000). **Las dos afirmaciones son falsas, y en sentidos opuestos.**
  Propuesta: campo `hasta`, con `legitimo(pt,anio)` verdadero cuando `anio < desde` **o**
  `anio >= hasta`. Las cinco entradas corregidas están **escritas literalmente** en
  `antigua_eurasia` §7 y repetidas en `antigua_eurasia2` §9.1.
- **El campo `hasta` ya existe desde la ronda 54 pero `cual()` no lo usa**, de modo que para
  cualquier punto y año en que el vacío sea legítimo *por `hasta`* y no por `desde`,
  `legitimo()` devuelve `true` y `cual()` devuelve `null`: el registro sabe que el hueco es
  legítimo pero no sabe decir por qué. Le pasa hoy a las cinco cajas saharianas en todo el
  arco posterior al −3500. **`informe57` §3.5 deja el parche escrito** (tres líneas).
- **Ni `desde`/`hasta` ni los dos juntos bastan para las Malvinas**, que tienen **dos**
  intervalos poblados (1764-1811 y 1826-hoy) con un vacío real en medio. El orden del array
  tampoco ayuda: `legitimo` devuelve la primera coincidencia. Propuesta:
  `intervalos:[[desde,hasta],...]`, con `desde`/`hasta` como azúcar del caso de un
  intervalo. La entrada correcta sería `intervalos:[[1764,1810],[1826,null]]`
  (`informe57` §3.3). Mientras tanto `vacios57.js` deja `desde:1764, hasta:1810`, que
  **afirma de más** (declara legítimo también el vacío posterior a 1826) y el informe lo
  dice.

Faltan además entradas enteras, todas con su texto ya redactado por quien las encontró:
el **hielo laurentino** (tres cajas: cúpula del Nuevo Quebec `desde:-4800`, cúpula del
Keewatin `desde:-4500`, bahía de Hudson `desde:-5000` — «la omisión más grande del registro
y afecta a media Norteamérica»); el **Caribe** (dos: Bahamas `desde:1200`, Antillas Mayores
`desde:-4000`); **Terranova**; el **núcleo del manto escandinavo** (Sarek,
`caja:[14,21,65,69], desde:-8000`); **Arabia septentrional antes de la fase húmeda**
(`caja:[38,46,25,31], desde:-8000`, marcada como la menos segura por su propio autor);
**Temotu**; **Baleares** (`desde:-2400`). Y un fallo de caja: el borde oriental de «Islas de
la Reina Isabel» está en lon −60 y su vecina «Casquete de Groenlandia» empieza en lon −48:
entre −60 y −48, por encima de lat 78, queda una franja sin registrar que sale como hueco en
el año 1 (`antigua_america` §9, `antigua_eurasia2` §9).

### 4.4. `plazas.js` no consulta `vacios.js` antes de contar un hueco

Los vacíos legítimos se cuentan igual en «huecos reales `··`». Malvinas 1700 y 1815 son 2 de
los 41 huecos de partida del lote N. **Son ~15 líneas**, escritas en `p2_informe_N` §6 con
dos matices que el propio autor subraya: el campo `hasta` no está documentado en la cabecera
(la interpretación del parche es suya), y el registro afirma que no había **población**, no
que no hubiera soberanía, así que **la exención sólo debe valer para el recuento de huecos,
nunca para tapar una discrepancia de estado**.

### 4.5. `capitales.js` no vigila lo suficiente

- Tras el funde `napata`→`kush`, la línea `["napata",-700,[31.87,18.55],"Napata (Yebel
  Barkal…)"]` da 1 discrepancia. **Hay que cambiar ese `"napata"` por `"kush"`**
  (`p2_informe_J` §3a).
- **Brunéi no está en la lista de 306 capitales**, y por eso `capitales.js` dio cero
  discrepancias mientras el sultanato **no pintaba Brunéi en seis de sus siete fases**,
  incluido el apogeo de Bolkiah. «Merece la pena revisar qué otras capitales de sultanatos
  y estados pequeños del sudeste asiático faltan» (`informe_D` D-8).
- No cazó **Niani** porque comprueba Mali en 1300, cuando ya la cubre; el anillo de
  1240-1255 pasa por lat 11,64 y Niani está en 11,38 (`p2_informe_O` §3.4). Conviene que
  compruebe cada capital **en el primer año de su entidad**, no en uno cualquiera.

### 4.6. La red de plazas-testigo tiene defectos propios

- **Dos registros «Baku» duplicados** en `plazas_base.js` (líneas 2035 y 3649), mismas
  coordenadas (49,87/40,41) y cronologías **contradictorias**: uno espera `ilkhanate` en
  1250 y el otro `mongol` en el mismo año. Los 8 fallos de Bakú son en realidad 6 casos.
  Debería fundirse (`informe_B` §III.9).
- **Pares duplicados ya existentes**: `Ulan Bator`/`Urga`, `Heraklion`/`Candia`,
  `Tunez`/`Tunez y Cartago`, `Ragusa (Dubrovnik)`/`Dubrovnik`, `Palma de Mallorca`/
  `Mallorca`, `Yakutsk`/`Yakutsk (taiga del Lena)`, `Srinagar`/`Srinagar (Cachemira)`,
  `Mrauk U`/`Mrauk U (Arakan)`, `Batavia`/`Batavia (Yakarta)`, `Apia`/`Apia (Samoa)`,
  `Hagatna`/`Hagatna (Guam)`, `Numea`, `Papeete`, `Suva`, `La Valeta`, `Ciudad de Benin`/
  `Benin City`, `Tripoli`/`Tripoli de Libia`, `Dongola`/`Dongola la Vieja`. «No los he
  tocado, pero conviene saberlo antes de leer el porcentaje global» (`informe_testigos_H`
  §4).
- **Fallos dormidos: plazas cuyos sondeos son *todos* `~~`.** El punto de Zadar caía en un
  píxel de tierra **que no pinta nadie en ninguna época**, así que los doce sondeos se
  decidían por votación del vecindario y el informe no lo marcaba como problema porque diez
  acertaban. «Vale la pena barrer la red entera buscando plazas cuyos sondeos sean todos
  `~~`» (`informe_B` §III.10). **Esfuerzo: barato, y es una auditoría, no una corrección.**
- **Refuerzos sugeridos y no hechos** (`informe_testigos_H` §4): `Tobolsk` sólo tiene 7 años
  y salta de 1580 a 1650, justo por encima de la conquista de Yermak; `Dunhuang` no tiene
  ningún año entre 1300 y 1700 (falta toda la etapa Ming); y conviene añadir **Martaban**
  con coordenadas ya corregidas tierra adentro (97,55/16,45) para que su agujero desde 1552
  deje de ser invisible (`informe_D` D-4).
- **La comprobación de ids contra `CIV` debería ser obligatoria antes de entregar**: el id
  es `kara_khitan`, **no** `kara_khitai`, y ocho expectativas de un borrador habrían sido
  «fallos permanentes e inarreglables» (`informe_testigos_H` §3).

### 4.7. Instrumentos que faltan o que no bastan

- **No hay instrumento para renombrar una entidad ni un periodo.** Lo piden, cada uno por su
  lado: `carolinas_pueblos`, cuyo id dice «Pueblos de Yap, Chuuk y Palaos» mientras sus 25
  anillos van de 131,75 E a 155,03 E y cubren también Pohnpei y las Carolinas orientales
  (`p2_informe_N` §7.6); `sinhala`, que cubre −377..1232 (Anuradhapura y Polonnaruwa) y
  1469..1815 (**Kandy**) con 237 años de vacío en medio, y cuyo id hizo que **diez de los
  cuarenta y cuatro fallos del lote D** se escribieran mal (`informe_D` D-7);
  `neolitico_italiano` y `neolitico_iberico` (§1); `tuareg_air`, marcada `kind:'cultura'`
  aunque se llama «Sultanato del Aïr» y su rótulo habla de fundación, vasallaje al Songhay e
  independencia (`informe_E` §III.6); y **nueve rótulos** de `antigua_eurasia` §9.4 más
  **seis** de `antigua_eurasia2` §8 que envejecen mal al estirar los arcos (por ejemplo
  `estepa_kazaja`, «Neolítico de Atbasar y primeros caballos de Botai (**3700 a.C.**)»,
  pasaría a cubrir desde −9000). Todos los recambios están **ya redactados** en esos dos
  informes.
- **`divide.js`** debería aplicarse a `nauru`: un sustrato cultural (−1000..1888) y un estado
  independiente (1968..2025) comparten identificador y color, con ochenta años de silencio en
  medio (`p2_informe_N` §7.8).
- **`intermitencias.js` no ve el patrón Halmahera**: `dutch_empire` usa en las Molucas del
  Norte **dos anillos distintos que se turnan sin criterio visible** —uno de 1,045 grado²
  (40 vértices) en 1683-1699, 1701-1714, 1746-1755…, y otro de 1,395 (91 vértices) en
  1700-1701, 1799-1806, 1900-1906…—, de modo que la costa cambia de dueño y de forma cada
  pocos años sin que pase nada histórico. `p2_N` lo neutralizó para 1683-1914; el patrón
  sigue vivo antes y después (`p2_informe_N` §7.3).
- **`astillas.js` / `fragmentos.js` tienen cola**: 35 astillas de 0,04 grado² en total del
  lote K; los **9 anillos de `kanato_abuljayr`**, que son rebanadas meridianas de un único
  polígono con longitudes de corte fijas y dos astillas de 0,04 y 0,03 grado² de menos de
  5 km de alto («la entidad tiene un solo cuerpo, no nueve», `tanda5b` §3); **`beothuk`
  triturado en 47 anillos** entre 1713 y 1829 (`informe_F` §9 de defectos); la cuña de
  `kannauj` en el Kumaon (5 vértices, 0,04 grado², a 250 km de Kannauj, sobre el Himalaya de
  Almora, sin relación con la entidad ni con el rótulo — `tanda5a` §14 de defectos); la
  astilla de `almohad`/`almoravid` que sube a la latitud de Calatayud (`taifas51` §8.3); las
  cuatro astillas costeras de `castile` y la franja transhimalaya de `himalaya_reinos`.
- **`polygon-clipping` falla** con el par `british`×`aboriginal_australia`
  (`Unable to complete output ring starting at [123.53, -16.56]`), que es justo el mayor
  solape del mapa (`p2_informe_N` §7.1).
- **`dobles_exacto.js` global no cabe en el presupuesto de una ronda** (más de media hora).
  `p2_M` escribió `/tmp/geo/_wM/de_focus.js`, que lo restringe a los pares en que interviene
  una lista de entidades, y `/tmp/geo/_wM/solapes.js`, que para cada `'mas'` enumera quién
  más pinta dentro del anillo y cuánta área. Los dos quedan ahí «por si sirven a otro lote».
- **`barrido.js` es demasiado grueso** para franjas de 0,05°: no vio que el polígono
  `COLONIA` pisaba a `sajones` en diez puntos de la orilla derecha del Rin. Lo cazó un
  **muestreo denso `pip` dentro de cada polígono nuevo**, que es la comprobación que
  `p2_informe_J` recomienda repetir siempre después de aplicar los módulos.
- **`anillo_regla.js` no puede discriminar cuando varias fases comparten caja idéntica hasta
  el segundo decimal**, y hace bien en negarse: cinco periodos de `almohad` tienen la misma
  caja `lon[-9.24,0.24] lat[36.03,41.50]` y la herramienta rechazó las tres reglas. «No es
  un fallo de la regla: es que la caja no discrimina.» La salida es `anade` con `'menos'`
  (`taifas51` §3). Conviene documentarlo en la cabecera.
- **`borra_periodo` tiene una salvaguarda que nunca deja una entidad sin periodos**, de modo
  que no sirve para retirar una entidad duplicada: para eso está `funde_civ.js`, **que no
  está en la lista de instrumentos del encargo** y hubo que pedirlo explícitamente
  (`p2_informe_J` §3a).

### 4.8. Aviso de proceso

**El nombre `/tmp/geo/mi_prueba.jsx` lo usan varios lotes a la vez.** `p2_N` perdió una
verificación entera porque otro agente sobrescribió el fichero entre dos comandos suyos: «el
mapa cambió de contenido sin que yo escribiera nada, y las mediciones de Halmahera salieron
idénticas a las del original». Lo detectó al releer `ternate` y ver que el periodo que
acababa de insertar había desaparecido. **Conviene que la siguiente ronda le diga a cada
lote que use un nombre propio** (`p2_informe_N`, aviso de proceso).

Y dos requisitos que no son fallos pero que hay que escribir en el encargo, porque los
cinco lotes de precisión los descubrieron por separado: **`anade.js` hay que pasarlo con
`NOCARVE=1`** cuando cada `'mas'` va emparejado con el `'menos'` del dueño anterior sobre el
mismo polígono (sin él, «el tallado deshace la mitad de las adiciones, porque el que recibe
es siempre el que pierde»), y **`arregla_auto.js` al final no es opcional**: `pc.union`
reemite todos los anillos del periodo tocado y el redondeo a dos decimales deja
auto-intersecciones en sitios que nadie ha tocado (12 en el lote K, 61 en el M, 10 en el O,
una en el anillo de la India a medio mundo de Tasmania en el N).

---

## 5. Decisiones de modelo sin tomar

No son defectos: son convenciones que el mapa aplica de forma coherente, o que aplica **a
medias**, y que alguien tiene que decidir de una vez. Cada una con las dos opciones y lo que
costaría cada una.

### 5.1. Las ocupaciones militares: o en todas partes o en ninguna

La regla 2 del proyecto dice que el mapa no modela ocupaciones, sólo cambios de iure, y
`informe_F` lo verificó en América con seis casos de control (Buenos Aires 1806-07, Ciudad de
México 1847-48, Manila 1762-64, Santo Domingo 1916-24, La Habana 1762-63, Luisburgo 1745-48):
**el criterio es coherente en todo el continente**. Pero:

- **En Asia el mapa sí las modela, y a medias.** `informe_D` comprobó que `japan` tiene
  periodos 1942-1944 y 1944-1945 rotulados «Birmania, Malaya y Singapur ocupadas hasta la
  reconquista aliada de 1945», que `british` tiene 1942-1943 y 1943-1945 rotulados «Ocupación
  japonesa del imperio asiático y reconquista» y que `dutch_empire` tiene 1942-1945
  «Ocupación japonesa de las Indias Orientales». La edición se quedó a medias con tres
  huellas: restos rectangulares de `british` en Malaca, Johor y Singapur (cajas de 60 × 45 km
  con muescas exactas en el anillo de `japan`); Hong Kong **encogido** en vez de retirado, de
  modo que parte de la ciudad queda VACÍA en 1942-1944; y rótulo sin geometría en las Indias
  y Filipinas. `informe_D` **completó** la edición asiática (Birmania, Malaya, Singapur, Hong
  Kong, Borneo británico, Indias Orientales y Filipinas).
- **Sigue sin modelarse China continental ocupada 1937-1945 y Europa ocupada 1939-1945.**
  París es `france` en 1942 y Atenas es `greece`; Pekín, Nankín y Cantón son `modern_china`
  en 1940.

**Opción A: completar.** Crear `china_nanjing` (y probablemente `mengjiang`) y modelar la
Europa ocupada. **Caro**, y con un aviso técnico que `informe_D` subraya: la línea del frente
sino-japonés «es lo más *ragged* del mapa mundial; Japón tenía ciudades, ferrocarriles y
corredores, no provincias; el trazado cambia todos los años y cada atlas lo dibuja distinto».
Además arrastra Polonia 1939-1945 (§3) y Lorena 1670-1697/1702-1714 (§2).
**Opción B: revertir Asia.** **Medio**, pero significa borrar tres periodos con rótulo
explícito y quitarle a Japón Birmania y Malaya, «una intervención mucho mayor y contra la
intención declarada del mapa».
`informe_A` §I.2 ya alineó cinco testigos (Reval, Riga, Vilna, Lwów, Viborg 1942) con la
convención vigente y **dejó escrito que si algún día se revierte hay que revertirlos a la vez
que París, Oslo, Copenhague, Ámsterdam, Bruselas, Belgrado, Atenas y Minsk, y no sólo esos
cinco**.

### 5.2. La figura jurídica de 1878: protectorado con soberanía retenida

Bosnia (`austria` desde 1878, soberanía otomana hasta 1908), Chipre (`british` desde 1878,
soberanía otomana hasta 1914) y Túnez (`france` desde 1881, beylicato conservado) **son la
misma figura jurídica y el mapa las pinta las tres por el ocupante**, mientras la regla 2
pediría lo contrario. Egipto, en cambio, sale `egypt` en 1900 pese a la ocupación británica
de 1882. Por eso `p2_L` corrigió el testigo de Famagusta «a disgusto»: «de iure tiene razón
el testigo, pero cambiar sólo Chipre dejaría el mapa incoherente consigo mismo»
(`p2_informe_L` §6 y §6 de defectos).

El mismo asunto por el sur: **la franja costera de diez millas de Zanzíbar (1895-1963)**.
Fue arrendada al IBEA y al protectorado y la soberanía del sultán no se extinguió hasta 1963.
El mapa la modela —`zanzibar` tiene de 1895 a 1960 tres anillos costeros muy finos— pero **la
banda va desplazada y no contiene ninguna de las tres ciudades de la franja**: Mombasa,
Malindi y Lamu caen todas fuera y las pinta `british`. «O la banda se corrige para que
contenga sus puertos, o sobra. Hoy no hace ninguna de las dos cosas.» Y el anillo
41,0-43,3 × −1,7/1,2 mantiene a Zanzíbar en el Benadir y Jubalandia hasta 1960, cuando esa
costa se arrienda a Italia en 1892 y se vende en 1905 (`p2_informe_O` §5.1;
`informe_testigos_I` F5, que lo plantea como desacuerdo de interpretación y pide
explícitamente «que se decida y se aplique igual en los dos sitios»).
**Opción A** (de iure): `zanzibar` en la franja y en Chipre, `ottoman`; **caro**, cambia
cuatro plazas de la red que hoy dicen `british` y toca Bosnia y Túnez.
**Opción B** (administración efectiva): dejar como está y **corregir la banda de `zanzibar`
para que contenga sus puertos o borrarla**; **barato**.

### 5.3. `israel_juda`: una entidad para dos reinos

«Con una sola entidad no se puede representar *el norte cae en −722 y el sur no*. Recomiendo
partirla; no es algo que un testigo pueda arreglar» (`informe_testigos_G` §5.2). Y para el
tramo −722..−586, `tanda6c` §6 deja **tres salidas explícitas y pide que se elija**:
**(A)** aceptar un doble con `babilonia` de −605 a −586, porque Judá existió como reino
vasallo (es lo que entrega); **(B)** partir el periodo en −605 y dejar `israel_juda` sólo
hasta ahí, coherente con cómo el mapa trata a Asiria; **(C)** borrar los tres periodos
−722..−586 y aceptar que el mapa pinta a los vasallos dentro del imperio, que es lo que ya
hace de −745 a −627. «Lo que **no** es defendible es lo que hay ahora.»

### 5.4. El sorteo de 411 en Hispania, modelado a medias

`suevos` tiene periodo desde **409** con el rótulo «Hermerico y el sorteo de 411: los suevos
reciben la Gallaecia occidental», y ni los vándalos silingos de la Bética ni los alanos de la
Lusitania y la Cartaginense tienen nada. **Es el mismo hecho jurídico con un beneficiario
modelado y los otros dos no.** «O se modela el sorteo entero, o no se modela ninguno»
(`p2_informe_K` §10 y §14.9). **Caro**: afecta a toda la península y cambia de golpe una
docena de plazas de otros lotes; es trabajo para **una ronda de Iberia**.

### 5.5. Suecia desaparece del mapa entre 1397 y 1523

La Unión de Kalmar está modelada como `denmark` en **toda** Suecia y Finlandia. Históricamente
Suecia siguió siendo un reino aparte, con su Consejo y su derecho, dentro de una unión
personal; por la regla del estado concreto debería pintar `sweden` con `denmark` de sustrato,
**igual que Bohemia pinta bajo el Imperio**. `informe_A` alineó las expectativas de Viborg
1400 y 1500 con la convención vigente y dejó dicho que «si el proyecto restituye `sweden`
para 1397-1523, esas dos expectativas vuelven a `sweden`» (`informe_A` §III.4).
**Opción A**: restituir `sweden`; **medio** (la geometría existe antes y después).
**Opción B**: dejarlo y anotar la convención en el rótulo.

### 5.6. Polonia y el Gran Ducado de Lituania antes de 1569 — **decidido y aplicado**

La red se contradecía: `Kiev` esperaba `golden_horde` en 1280 y `Chernigov`
`briansk_chernigov` en 1250-1350; `Vilna` esperaba `poland_lithuania` en 1400 y `Polotsk`
`lithuania`. `informe_A` §III.5 e `informe_testigos_H` §1 lo señalaron como «fallo de
criterio del proyecto, no del mapa» y **`p2_informe_M` §2 lo resolvió y lo aplicó**:

> Hasta la Unión de Lublin (1569), `poland_lithuania` pinta la Corona de Polonia y
> `lithuania` pinta el Gran Ducado. Desde 1569, `poland_lithuania` pinta la Mancomunidad.

Con cuatro razones: Krewo es una unión personal y el Gran Ducado conservó soberano, ejército,
tesoro, cancillería y derecho propios —los Estatutos Lituanos de 1529 y 1566 son anteriores a
Lublin—; el propio nombre de la entidad dice «Polonia / Mancomunidad Polaco-Lituana»;
cualquier atlas pinta los dos con colores distintos en 1400 y 1500; y `lithuania` estaba
reducida a astillas de 0,03 a 1,4 grado² cuando el Gran Ducado era el estado más extenso de
Europa (ahora sus periodos van de 63 a 84). **(¿resuelto?)**, pero **cinco testigos ajenos
hubo que reescribir** (Vilna 1400 y 1500, Kiev 1500, Smolensk 1420 y 1500) y están declarados
en voz alta en `p2_testigos_M.js`: si alguien revierte el criterio, hay que revertirlos a la
vez. Y la otra mitad del caso **no era contradicción**: Chernigov-Briansk conservó sus
príncipes Ólgovichi bajo la Horda y Kiev quedó bajo *baskaks*, sin príncipe residente, en
administración directa; es la misma regla aplicada a dos hechos distintos.

### 5.7. `crusader_states` es un agregado

El id agrupa Jerusalén, Trípoli, Antioquía y —desde `p2_L`— **Edesa**. «No es un defecto, es
una decisión de diseño, pero conviene que conste que los cuatro estados cruzados comparten
color» (`p2_informe_L` §4 de defectos). `p2_L` se negó expresamente a crear el condado de
Edesa: «crear una entidad para lo que ya tiene id es duplicar».

### 5.8. `zanzibar` con arco desde 1698 y rótulo omaní

«Es el punto más discutible del lote: una entidad llamada *Sultanato de Zanzíbar* cuyos seis
primeros periodos se titulan *La costa suajili bajo los busaidi de Omán* está admitiendo en
el rótulo que quien manda es otro» (`informe_E` §III.12).
**Opción A** (la aplicada): `zanzibar` desde 1698, por la regla del estado concreto y porque
el brief da Zanzíbar como ejemplo canónico. **Opción B**: `zanzibar` desde 1840, cuando Said
bin Sultan traslada la corte, y `oman` de 1698 a 1840; exige `borra_periodo zanzibar
[1698,1840]`, pasar esa geometría a `oman` y **revertir seis correcciones de testigo**.

### 5.9. `kazakh_khanate` y `juzes_kazajos` son dos modelos de lo mismo conviviendo

Arcos 1465-1847 y 1731-1867: **116 años de solape de modelo**. No es solape de suelo —la
sonda no marca `==`— pero es lo que hace que Almaty 1800 se lea distinto según a cuál se
mire. «O el kanato acaba en 1731, o los juces son sus subdivisiones y no una entidad aparte»
(`informe_C` §12 de defectos). **Barato** de decidir, **medio** de aplicar.

### 5.10. El Yemen ayubí: dentro de `yemen` o dentro de `ayyubid`

El hecho no se discute (en 1200 mandaba en Saná el ayubí Ismail ibn Tugtekin), pero el mapa
monta el Yemen ayubí de 1174-1229 como **una fase de `yemen`**, con rótulos propios, y la
misma geometría sigue sin corte al sultanato rasúlida de 1229, que fundó el gobernador ayubí.
`ayyubid` es aquí el sultanato de Egipto y Siria y no baja del Hiyaz en ningún periodo.
`informe_E` corrigió los testigos de Saná y Adén 1200 a `yemen` y **lo dejó señalado como
discutible**: «si el proyecto prefiere que las apanages ayubíes pinten `ayyubid`, la
corrección correcta es la inversa —restar Yemen a `yemen` en [1174,1229) y sumárselo a
`ayyubid`— y entonces habría que revisar también Adén 1100 y Saná 1300».

### 5.11. Las colonias neerlandesas: `curazao_abc` sí, Surinam no

Curazao tiene entidad propia y Surinam se pinta `dutch_empire` hasta 1975. «O bien Surinam
merece la suya, o bien `curazao_abc` sobra. He corregido los testigos hacia la solución que
el mapa ya tiene implementada, pero la decisión de fondo no es mía» (`informe_F` §6 de
defectos).

### 5.12. Nueva Zelanda fuera de la convención de dominios

Ottawa, Canberra y Pretoria salen `british_dominions` en 1925 y pasan a `canada` /
`australia` / `south_africa` en 1931; Dublín pasa a `ireland` en 1937. **Wellington ya sale
`new_zealand` en 1925.** La convención no está aplicada de manera uniforme (`informe_A`
§III.8). **Barato.**

### 5.13. Chukotka: de iure contra de facto en el Ártico

El testigo de Anadyrsk se escribió declarando que era la pregunta de criterio, no un fallo, y
pidiendo que se juzgara (`informe_testigos_H` §2.3). **`p2_M` §4.7 la juzgó y falló contra el
mapa**, con tres razones: hubo fuerte y grande (Anadyrsk, 1649, llegó a 600 hombres y una
batería, abandonado por orden de Catalina II en **1764** porque el yasak no compensaba, «que
es exactamente lo mismo que el mapa considera suficiente para pintar `russia` en Ojotsk,
Tomsk o Nérchinsk»); la retirada de 1764 **no fue una cesión**, y en 1779 Catalina declara
súbditos a los chukchis y en 1889 se crea el ókrug de Anadyr; y el mapa **se contradice a sí
mismo**, pintando `russia` en Kamchatka desde 1721 y en la Chukotka oriental desde 1860 y
dejando una bolsa `chukchi_koryak` en medio hasta 1930. Queda por decidir si se extiende a
toda Chukotka desde 1779 o desde 1889 (§3).

### 5.14. Lo que el mapa no puede representar y hay que asumir

- **El condominio anglo-francés de las Nuevas Hébridas (1906-1980)**: dos soberanos sobre el
  mismo suelo. Port Vila lleva esos años sin expectativa «porque un mapa de un dueño por
  píxel no puede representarlo sin mentir»; el mapa devuelve `pacifico_frances` y
  `informe_testigos_I` §3.8 pide **una nota en el rótulo**, no un cambio de geometría.
- **El condominio macedonio de 288-285** (Pirro y Lisímaco): «a esa resolución el mapa no
  llega: haría falta partir Macedonia en dos mitades cuya línea no conozco»
  (`p2_informe_K` §6).
- **Los tres reinos malla de 1482-1768**: la frontera corría por el Bagmati y el Manohara,
  pero los enclaves estaban entreverados por todo el valle. «Tres polígonos inventados dentro
  de un valle de 25 km dirían una precisión que no existe. **Me niego a redibujar ese
  tramo**» (`nepal52` §6.5).
- **`harar`**: seis fases que son rectángulos **exactamente concéntricos** en 42,175/9,30 que
  crecen 0,10 grados por lado en cada corte. «Es una convención de radio, no una frontera; y
  como convención es honesta» (`tanda5a` §7). Lo que sí habría que mirar es la **progresión
  de áreas**: 0,27 → 0,53 → 0,85 → 1,21 → 1,32, que cuenta una expansión continua cuando en
  el XIX los oromo estrecharon a los harari hasta las puertas de la ciudad y el máximo del
  mapa cae justo en 1856-1875, la fase más débil.
- **Negativas ya archivadas y razonadas**, que no hay que volver a proponer: `kannauj`
  (los ríos son cuerdas que cruzan la caja, no bordes), `oyo` 1600-1615, `khwarezm`,
  `kanato_abuljayr`, `bengal_sultanate`, `ayutthaya` 1569-1584, `garamantes`, `franks`
  774-796, `crusader_states` 1109-1157, `mughal` Kandahar, `russia` Severia, `spanish` Franco
  Condado, `british` bahía de Hudson, los tres grupos de `holy_roman_empire`, `zhao_estado`,
  `liao` 926-938, `jin_dynasty`, `ming` 1409-1427, `tang` 640-647, `gojoseon`, `toungoo`,
  `dai_viet`, `ghurid`, `chalukya`. Están en `cajas5a.js`, `cajas5b.js`, `cajas6a.js`,
  `cajas6b.js`, `cajas6c.js` y `cajas_ok.js`.
- **Si algún día se baja el suelo del arco por debajo de −10000**, hay que revisar hacia atrás
  las entidades americanas y eurasiáticas que hoy se apoyan en ese suelo: el `-10000` de
  estos módulos «no afirma que empezara ahí: afirma *por lo menos tan atrás como el mapa
  dibuja*» (`antigua_america` §2, `antigua_eurasia` §3).

---

## 6. Defectos menores y sueltos

Todos comprobados por quien los reporta, todos de bajo impacto medido. Agrupados por tipo.

**Rótulos que contradicen su propia geometría** (el patrón que la cabecera de `plazas.js`
describe con Etiopía: «quien revisa una entidad sola lee el rótulo y le da la razón»):

- `aboriginal_australia` 1803-1815: «Van Diemen ocupada por el este» con la isla entera
  pintada; y 1870-1901: «el interior, **que nadie administra**» pintando también Palmerston.
  Los dos arreglados por `p2_N` §7.2.
- `fatimid`: **siete periodos seguidos (969-1048) rotulados «…en La Meca la jutba fatimí…»
  cuya geometría no contiene La Meca en ninguno**. Arreglado por `informe_E` §1.
- `adal` 1415-1527: «Los Walashma se rehacen en **Dakkar**», y Harar (42,14/9,31) queda dentro
  de la caja y fuera del anillo. Arreglado por `informe_E` §5.
- `herero_nama` 1820-1870: «Los oorlam de Jonker Afrikaner dominan el centro (**Windhoek**…)»
  y no contiene Windhoek en ninguno de sus diez periodos. Arreglado por `informe_E` §8.
- `tuareg_air`: ocho periodos de 1405 a 1917 con **el mismo anillo único**, y **Agadez
  (7,99/16,97) dentro de la caja y fuera del polígono en los ocho**. «La entidad que ES
  Agadez no contiene Agadez en ningún momento de su historia.» Arreglado por `informe_E` §4.
- `hiraab` (1690-1889): su caja empieza en lat 2,17 y **Mogadiscio está en 2,04**: se queda a
  15 km del puerto que le da sentido. Arreglado por `informe_E` §5.
- `mughal` 1788-1818: «Emperadores títere con pensión británica y **sin territorio propio**»
  sobre un rump con territorio real alrededor de Delhi y Agra. Arreglado por `informe_C` §7-8.
- `delhi_sultanate` 1192-1206: el rótulo dice «Tarain y Qutb al-Din Aibak: **los guridas** se
  quedan el Ganges» y la geometría dice sultanato de Delhi, sobre **todo el Indo, el Ganges y
  Bihar durante catorce años**. Arreglado por `informe_C` §aviso 2.
- `wichita` 1512-1600 y 1600-1682: «aldeas del **Great Bend**» y «expedición de Oñate a
  Quivira (1601)» mientras la geometría los pone 90-180 km al sur. Arreglado por `informe_F`.
- `aldeanos_misuri` 1682-1750: «Aldeas de tierra del **Heart y el Knife**» con el anillo 90 km
  al sureste del Knife. Arreglado por `informe_F`.
- `beothuk` 1713-1763: «Retirada al interior del **río Exploits**» con 47 migajas costeras.
  Arreglado en el interior por `informe_F`; la entidad sigue triturada.
- `armenia_bagratuni` 1045-1064: «**Gagik-Abas conserva Kars** hasta cederla en 1064» y la
  geometría incluye **Ani**, anexionada por Constantino IX en 1045. Arreglado por `p2_K` §11.
- `lusignan_chipre`: «Génova ocupa **Famagusta** en 1373 tras el motín de la coronación de
  Pedro II» y la geometría lo contradice. Arreglado por `p2_L` §6.
- `confederacion_helvetica` 1332-1353: «Entran Lucerna, Zúrich, Glaris, Zug y Berna: los Ocho
  Cantones **en 1353**» con Berna dentro desde 1332. Arreglado por `p2_L` §8.
- `greece` 1832-1912: «Peloponeso, Ática, **Eubea** y las Cícladas» saltándose Calcis.
  Arreglado por `p2_L` §5.
- `indopartos` 19-30: «Gondofares I: Aracosia, Sistán, **Gandhara y el Punyab**» con el anillo
  parado en lon 68,5. Arreglado por `p2_J` §6.
- `ramazan`: el sultanato mameluco **se reservó en administración directa Tarso, Ayas,
  Sarvandikar y Sis**, y el mapa da Tarso a los Ramazánidas. Arreglado por `p2_L` §2.
- **Sin arreglar**: `savoy` 1860-1861, «Cerdeña absorbe Italia: Lombardía, los ducados y las
  Dos Sicilias», que ya no describe la geometría después de la corrección de `informe_B` §9;
  `spanish` 1668-1678, «Carlos II **cede** el Franco Condado», cuando en Aquisgrán (1668)
  Luis XIV **lo devolvió** y la cesión es de Nimega, 1678 — «la propia geometría lo
  desmiente: conserva la provincia hasta 1678, contra su rótulo» (`tanda6a` defecto 7);
  `ming` 1368-1372 y 1372-1382, «conquista de Yunnan en 1381-1383» a caballo de dos fases;
  `liao` 926-938, «Dongdan administra **Manchuria**» sobre un anillo que está en Corea;
  `oyo` 1535-1615, «Exilio… tras la invasión nupe» conteniendo la capital abandonada;
  `pandya` 1310-1345, cuatro fases con el mismo texto «Los Pandya de Madurai suceden a los
  Chola» para un periodo que empieza treinta años después del fin de los Chola;
  `akwamu`, **siete periodos consecutivos con el rótulo «Reino de Akwamu»**, es decir sin
  rótulo (arreglado sólo el primero); `meseta_irania`, «Aldeas neolíticas y cerámica pintada
  de **Sialk**», **y Sialk (51,4/33,9) no está dentro del contorno en ningún corte**.

**Fronteras que fallan por centésimas de grado** (todos arreglados, se listan porque el
patrón se repite y conviene un barrido sistemático de «capital fuera de su entidad»):
`soyo` empieza en 12,38 y Mbanza Soyo está en **12,37**; `dutch_empire` en el Cabo llega a
24,5 y Graaff-Reinet está en **24,53**; `kediri` empieza en 110,40 y Yogyakarta está en
**110,37**; `chenla` llega a 106,62 y Saigón está en **106,70**; `babilonia` llega a 41,0 y
Mari está en **40,89**; `frigia` se quedaba en 34,5 y Hattusa en **34,62**;
`gondwana_pueblos` empieza en 76,0 y Ujjain está en **75,78**; `elam` −745..−627 tiene su
caja en 48,8-53,5 y **Susa, su capital, está en 48,25** (118 años sin pintar su propia
capital); `mali` 1240-1255 pasa por lat 11,64 y Niani está en **11,38**.

**Errores de fecha de uno a cinco años, medidos y menores:**
Ecbatana −549 y Sardes −547 (el mapa adelanta a Persia uno o dos años sobre la cronología
estándar, dentro del margen de incertidumbre de las fuentes); Karkemish −716 (Sargón II la
anexiona en −717, con la advertencia de `p2_J` de que **el corte va en −716, no en −717**, o
se rompe el sondeo de −717); Acragas −261; Carthago Nova −228 y −208; Ujjain −186; Taxila
−80; Balasagún 1130 (Yelü Dashi la conquista en **1134**); Corinto −302 («dos años de desfase
que no arreglo por no partir un periodo ajeno»); Murcia 1171-1172 («el error resultante es de
tres meses sobre Murcia. Anotado y asumido»); Camerún alemán, parcheado hasta 1918 cuando la
bisagra correcta es **1919** (Versalles) — «el arco entero de las colonias alemanas necesita
una revisión que no es de este lote» (`p2_informe_O` §5.2); Tarifa, Algeciras y Jerez
almohades en 1146 con el arco de `almohad` empezando en 1147 (`taifas51` §8.6); la
sublevación del Algarve de agosto de 1144 (§8.7); la Merv corasmia de septiembre de 1201, que
el mapa deja gurida hasta 1203 (`informe_C` §16).

**Solapes preexistentes, pequeños y ya localizados** (`p2_informe_O` §2 y §5):
`ovimbundu_lunda`+`selva_ecuatorial_africa` en 22,5/−8,35 hacia 1535; `bamana`+`arma` en
−4,34/14,09 entre 1770 y 1818 (alguien debería decidir la frontera Segu-tuareg en el Níger
medio); `venezuela`+`venezuela_pueblos` al este de Caracas desde 1830. Y el que se resiste al
recorte fino: `byzantine`+`abbasid`, 1,04 grado²-año en 53 tramos de 0,011 a lo largo de
400 km de la frontera del alto Éufrates, «una cinta de ~0,3 km» que `barrido.js` no ve y
`plazas.js` no ve — «prefiero declararlo a seguir persiguiéndolo con más geometría inventada,
que es como se rompen las fronteras de verdad» (`p2_informe_L`).

**Solapes que aparecerán al aplicar los módulos de arcos antiguos**, con su arreglo escrito:
`estepa_kazaja`×`turan_oasis_estepa` (130 puntos, el mayor, en el Turan septentrional);
`bosque_europa_oriental`×`bosque_templado_europeo` (76 puntos, Volinia y Bielorrusia
meridional); `gangetico_pueblos`×`gondwana_pueblos` (21 puntos, Baghelkhand);
`creciente_fertil`×`meseta_irania` (28, Juzestán — **talle nuevo**, gana `creciente_fertil`);
`arabia_oasis_pastores`×`ppnb` (24, Négueb y Edom — **talle nuevo**, gana `ppnb`); y en
América `gran_cuenca`×`suroeste_desierto` (8,4 grado², Mojave) y
`praderas_norte`×`bosques_orientales` (6,4, Minnesota), **que ya existen hoy** y que la
extensión sólo hace visibles al coincidir en el tiempo. Los tres primeros tienen la misma
causa y el mismo arreglo, que conviene entender porque volverá a pasar: **el talle ya está
hecho, pero sólo en el periodo que empezaba en el −6000**, y el periodo anterior conservó la
geometría ancha; se ve en las áreas (`estepa_kazaja` mide 272 antes y 257 después;
`bosque_europa_oriental` 102 y 89; `gondwana_pueblos` 37 y 33). **Barato**: repetir el mismo
talle en el periodo anterior (`antigua_eurasia` §6.1, `antigua_eurasia2` §5).

**Contornos con avisos de tallado pendientes:** `norte_alaska_antiguo` sube a 71,4 N, o sea
incluye la llanura costera del Beaufort, que no tiene registro anterior a la tradición ártica
microlítica: hay que tallar al norte de ~69,5 N para lo anterior al −2500 (coste de no
aplicar la línea entera: **14 celdas**). `unangan_yupik` tiene 44 anillos de edades muy
distintas: hay que tallar el delta Yukón-Kuskokwim al norte de ~60 N, San Lorenzo, Nunivak y
las islas Near para lo anterior al −1000, o dejarla en −3000 (aporta **6 celdas**: «es la
entrada del módulo con peor relación entre lo que arregla y lo que afirma de más»).
`mediterraneo_balcanico` tiene tres anillos insulares que no aguantan el −10000: **Cerdeña y
Córcega** (mesolítico inicial, ~10.000 años / 8.º milenio) y **Creta** (ocupación permanente
segura sólo desde el Neolítico acerámico de Cnosos, ~−7000); son 4,2 grado² y la
recomendación es darles periodo propio desde −8000 y −7000 (`antigua_america` §6,
`antigua_eurasia2` §6.1).

**Reservas de escala declaradas, que no son defectos** y conviene no volver a «arreglar»:
Bombay (a 1:50 M la máscara no conserva la isla separada de Salsette; el traspaso de 1665
arrastra un pedazo de Salsette que fue portuguesa hasta 1739 — «la alternativa era no
representar la Bombay inglesa en absoluto»); Ambon portuguesa (0,05 grado², «no cabe
repartirla: doy la isla entera a Portugal, que es donde estaba el gobierno»); Cembalo de
Teodoro («error consciente de una celda»); Carmen de Patagones y Hobart («a 1:50 millones un
fuerte aislado no es distinguible de la llanura que lo rodea»); Malaca, Pulicat, Salvador,
Martaban y Moulmein, que caen **en agua** en la máscara `land-50m` y por tanto no son huecos;
el punto de Kosrae del testigo, que era **literalmente el primer vértice** del polígono de la
isla, de modo que `L.pip` devolvía `false` sobre el borde y la plaza salía VACÍA **aunque la
isla estuviera pintada** (movido a 162,96/5,31).

**Sueltos que no encajan en ningún grupo:** `bosque_volga_kama` y `sami_fineses` invertidos en
Finlandia Propia hasta 1249 (arreglado por `informe_A`, pero el patrón —un sustrato profundo
tallado *por encima* de la capa concreta— merece un barrido); **Ingria sueca 17 años antes de
tiempo** (Nyen/San Petersburgo sale `sweden` en 1600 y fue rusa hasta Stolbovo, 1617; puede
ser generalización del istmo de Carelia, declarado como baja confianza en `informe_A`
§III.11); **Silesia y Moravia bajo Matías Corvino (1469-1490) pintadas como Imperio**, con el
rótulo de `bohemia` diciendo «Matías Corvino… arrebata» y `hungary` sin ningún anillo que
llegue a Breslau (`informe_A` §III.3); **Milán sigue austriaca en 1860** (Lombardía se cede a
Cerdeña en 1859, por Villafranca y Zúrich) (`informe_B` §III.7); **la frontera árabe-jázara
de al-Bab en 700-714**, pintada omeya entera por falta de cortes cuando era frontera disputada
con los jázaros, cuyo kanato existe y se para en lat 43,1 (`informe_B` §III.5); **el resto de
la costa crimea otomana directa** —Kerch, Taman, Kilburun, Akkerman, Bender—, que por el mismo
criterio que Azak y el suroeste de Crimea son otomanas y el mapa reparte de forma desigual
(`informe_B` §III.8); **Almería cristiana de 1147 a 1157** y el mapa la da almohade
(`taifas51` §8.1); **Morella aragonesa desde 1171** cuando Blasco de Alagón la tomó en 1232
(§8.4); **Molina de Aragón almohade hasta 1212** cuando Alfonso I la conquistó hacia 1128
(§8.5); **Badajoz leonesa desde 1157** cuando fue almohade hasta 1230 (§8.9); **Tarragona
musulmana hasta 1149** en el anillo almorávide, con arzobispado restaurado desde 1118 —«he
preferido copiar el defecto antes que redibujar la frontera catalana» (§8.11); **el Terai
licchavi 647-750**, que `nepal52` §6.9 no conserva porque «las realidades geográficas de las
colinas limitaban el reino licchavi al valle de Katmandú y los valles vecinos»; y
**«Ibn Hud al-Massi»**, que el encargo de las taifas citaba y que **no aparece en ninguna
fuente**: lo que existe y encaja es Sayf al-Dawla ibn Hud, «Zafadola», muerto en la batalla de
Albacete el 5 de febrero de 1146 (`taifas51` §8.12).

---

## Los cinco primeros

Lo que haría en la próxima ronda, y el argumento de por qué éstos y no otros. El criterio es
el mismo en los cinco: **relación entre lo que desbloquean y lo que cuestan**, y preferencia
por lo que está medido sobre lo que está intuido.

### 1. Bajar el umbral de `recorte.aTierra` (§4.1)

**Por qué primero: es el único pendiente del inventario que hoy hace imposible trabajar, no
sólo difícil.** Ninguna isla de menos de ~250 km² puede entrar en el mapa por ninguna vía, y
—lo que es peor— las operaciones que lo intentan **se saltan en silencio**, de modo que un
informe puede afirmar de buena fe que arregló algo que no se aplicó. El coste es una línea
(`limpia(res, 3e-4)`, el mismo suelo que ya usan `anade`, `sustituye` y `arregla_auto` para
sus propios resultados) más un aviso donde hoy hay un `continue`. El beneficio está medido y
empaquetado: `p2_N_anade_BLOQUEADO.js` y `p2_N_parte_BLOQUEADO.js` llevan los **anillos
literales de la máscara** para Kosrae, Rarotonga, Nauru y las Marianas del fideicomiso, y
llevan el lote N **de 18 discrepancias a 0 y de 37 huecos a 4**. De propina entran la Enclave
de los papas (0,0158 grado², ya trazada y verificada) y Chuuk y Kosrae en `micronesia_fsm`.
No va primero por ser grande: va primero porque **todo lo demás que toque islas depende de
él**.

### 2. Arreglar `esTesela` en `redibujar.js` (§4.2)

**Por qué segundo: porque decide en qué se gastan las próximas rondas.** Hoy la lista de
trabajo de contornos tiene 337 anillos y **236 de ellos —el 70 %— son costuras cosidas a otra
entidad, vértice a vértice**; está medido y el script está escrito (`/tmp/geo/_t6_seam.js`).
Eso explica por qué `tanda6a` entregó cero contornos sobre 42 anillos y `tanda6b` uno sobre
doce: los agentes están siendo enviados a redibujar bordes que **no se pueden mover desde un
solo lado sin abrir un hueco o un solape**. Con la comprobación arreglada la lista baja a
~101 y lo que queda es trabajo real. Es barato, se hace una vez y **ahorra tardes ajenas**,
que es el mismo argumento con que se escribió la trampa del píxel de agua.

### 3. El bloque de `abbasid` sobre el Languedoc y el Tolosano, 750-800 (§2)

**Por qué tercero: es el error de atribución más grande con medida concreta que queda sin
tocar.** **12,27 grado²** en los que Tolosa, Narbona, Carcasona, Albi, Foix, Auch, Montauban
y Nimes son abasíes en 760 y en 798. Es falso tres veces, y las tres son fechas de manual: los
abasíes nunca gobernaron al-Ándalus (`cordoba` existe en el mapa desde 756 y ya pinta Zaragoza
en 760), Narbona cae ante Pipino el Breve en 759, y Tolosa no es musulmana después de 721. Y
tiene un efecto de arrastre que lo hace más rentable de lo que parece: **el rectángulo de
`franks` 774-796 es un parche puesto encima de este error** —alguien vio Tolosa en manos
abasíes y le recortó 0,84 grado²—, de modo que arreglar el bloque arregla los dos. Lo elijo
por delante del solape australiano porque aquél, siendo mayor, **está bloqueado por un fallo
de `polygon-clipping`** y éste no tiene ningún obstáculo técnico.

### 4. Cerrar las entidades que el propio mapa ya está pidiendo a gritos: `hatra`, Amalfi, `danishmend` y los cuatro huecos `··` de Asia interior (§1)

**Por qué cuarto: porque son los únicos pendientes donde una entidad nueva convierte
directamente sondeos a ciegas en sondeos que miden.** Hoy el lote M deja exactamente cuatro
huecos `··` —Otrar 750, Suyab 720, Shiraz 1340, Ghazni 1510— y **son exactamente los
turgueses, los inyuidas y el Kabul de Babur**; el lote K deja un hueco deliberado de 42 años
sobre Hatra; el lote L deja dos huecos que el testigo puso a propósito en Melitene 1080-1150
porque los Danismendíes no tienen id. En todos los casos el diagnóstico está cerrado, el arco
está fechado y el contorno es acotable. Y `hatra` trae además la lección de método que hay que
respetar: **hay que crearla junto con la revisión de su testigo**, o convierte dos aciertos en
seis fallos. No pongo aquí a los seléucidas, lágidas y sasánidas, que son el defecto de
contenido más grande del inventario, precisamente porque **no cierran ningún hueco** —el suelo
ya está pintado— y porque `p2_J` tiene razón en que no es una operación de lote sino una
migración de modelo que hay que planificar aparte, con las cinco o seis regiones coordinadas.

### 5. Decidir las dos convenciones que están bloqueando lotes enteros: las ocupaciones militares y la figura de 1878 (§5.1 y §5.2)

**Por qué quinto, y por qué son una sola tarea: porque no son trabajo, son una decisión, y
mientras no se tome hay agentes corrigiendo testigos «a disgusto» y dejando errores escritos a
propósito para no romper la coherencia.** Tres informes distintos se han parado ante esto:
`p2_L` corrigió el testigo de Famagusta reconociendo que de iure el testigo tenía razón,
`p2_O` se negó a tocar la franja de Zanzíbar «porque cuatro testigos de la red dicen
`british`», e `informe_D` completó media edición asiática dejando dicho que China y Europa
siguen sin modelarse. Cuestan una tarde de decisión y desbloquean, cada una, una ronda entera:
la de Iberia (que arrastra además el sorteo de 411, §5.4), la de las colonias y la de la
Segunda Guerra Mundial. Y hay un beneficio inmediato y barato en cualquiera de las dos
salidas de 1878: **la banda costera de `zanzibar` no contiene ninguno de sus tres puertos**,
así que **o se corrige o sobra**, y eso se arregla en una operación se decida lo que se decida.

**Lo que dejo fuera a propósito, y por qué:** el solape `british`×`aboriginal_australia`, que
es el mayor del mapa (2.192 celdas), porque `polygon-clipping` falla con esos dos anillos
concretos y la próxima ronda se atascaría ahí; los arcos antiguos de América y Eurasia, porque
los tres módulos ya están escritos y verificados y lo que falta es **aplicarlos y hacer los
talles que sus propios autores dejaron listados**, no volver a investigarlos; y todo lo que
está marcado `(¿resuelto?)`, que hay que comprobar antes de tocar, no arreglar otra vez.
