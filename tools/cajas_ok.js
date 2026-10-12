// REGISTRO DE CAJAS DELIBERADAS.
//
// Por que existe. `redibujar.js` produce la lista de contornos dibujados a mano.
// Cuatro entidades de la ronda 45 -`xiongnu`, `adal`, `songhai`, `ottoman`- las
// examinaron agentes que se NEGARON a redibujarlas, con razon: ahi no hubo
// frontera y un contorno sinuoso mentiria. Pero en la corrida siguiente las
// cuatro volvieron a encabezar la lista, porque la herramienta no tiene memoria
// de lo que ya se juzgo. Sin registro, el circuito da vueltas sobre lo mismo y
// el trabajo real no aflora nunca.
//
// Es exactamente el problema que resolvio `vacios.js` para los huecos: un mapa
// necesita poder decir "esto esta asi a proposito, y aqui esta la razon". La
// diferencia entre un defecto y una decision es que la decision esta escrita.
//
// CADA ENTRADA LLEVA SU RAZON, Y LA RAZON ES LO QUE SE AUDITA. Quien discrepe
// de una, que discrepe del argumento; quien anada una, que escriba por que.
// Anadir aqui algo solo para que deje de salir en la lista es hacer trampas al
// solitario.
//
//   { id, tramo:[ini,fin]|null, caja:[lon0,lon1,lat0,lat1]|null, razon }
//
// `tramo` y `caja` en null significan "toda la entidad". Se usa `legitima(id,
// periodo, anillo)` desde redibujar.js.

const CAJAS = [
 {
  id:'xiongnu', tramo:[-60,-37], caja:[92.5,108.0,51.6,53.6],
  razon:'Franja sobre el Sayan, Tuva, el Minusinsk y el Baikal. La sujecion de '+
        'los dingling y los gekun del Yenisei era tributaria y estacional, no '+
        'territorial: ahi no hubo frontera. Ademas el borde sur del anillo es '+
        'una costura con el cuerpo principal y buena parte del cuadrante '+
        'oriental cae sobre el lago Baikal, que el recorte a tierra ya limpia.'
 },
 {
  id:'adal', tramo:[1527,1543], caja:null,
  razon:'Las fases de la conquista de Gragn. El limite occidental no es el '+
        'escarpe del altiplano porque Adal estaba DENTRO del altiplano: fue una '+
        'ocupacion militar movil, sin frontera cartografiable en ninguna fuente. '+
        'Las rectas dicen "aproximadamente la mitad oriental de Etiopia", que es '+
        'lo honesto. Las fases 1415-1527 y 1543-1577 ya tienen buena geometria.'
 },
 {
  id:'songhai', tramo:[1500,1585], caja:[-5.5,-3.0,21.5,23.3],
  razon:'El distrito salinero del Sahara, en pleno desierto. Ahi no hay '+
        'frontera y el anillo principal del Niger ya esta bien trazado. '+
        'PENDIENTE DISTINTO: el bloque esta desplazado al sur -contiene '+
        'Taoudenni pero no Taghaza, que es la mina del periodo-, asi que '+
        'conviene MOVERLO a lat 23,2..24,0 y lon -5,4..-4,6, no convertirlo en '+
        'contorno.'
 },
 {
  id:'ottoman', tramo:[1534,1556], caja:[-1.44,4.0,32.5,36.82],
  razon:'Regencia de Argel. El borde recto es el sur, en lat 32,5: el pie del '+
        'Atlas sahariano, donde la autoridad de Argel se disolvia en oasis '+
        'sueltos. No hay linea que seguir y 32,5 aproxima razonablemente el '+
        'control efectivo.'
 },
 {
  id:'ottoman', tramo:[1885,1900], caja:[9.3,10.16,19.6,30.77],
  razon:'Tripolitania y Fezzan: una tira de reclamacion en el desierto pegada a '+
        'la Argelia francesa. La frontera solo se traza por convenio en '+
        '1902-1919, y precisamente como rectas. Dibujarla sinuosa seria falso.'
 },
 {
  id:'ottoman', tramo:[1585,1603], caja:[45.0,50.37,37.8,41.2],
  razon:'Azerbaiyan y Shirvan. El borde oeste en lon 45 es costura con el '+
        'anillo principal. Del resto solo se conoce el norte -la cresta del Gran '+
        'Caucaso-; el sur y el este dependen de la linea de Ferhad Pasha de '+
        '1590, que no se sabe situar con dos decimales.'
 },
 {
  id:'byzantine', tramo:[681,800], caja:[22.4,24.4,41.6,43.0],
  razon:'Saliente interior de Serdica y el alto Estrimon. El marco temporal es '+
        'correcto -Krum toma Serdica en 809- pero el control bizantino del '+
        'interior balcanico entre 681 y 800 es discutido, con esclavinias '+
        'intercaladas, y el tema de Estrimon no se organiza hasta c. 800. '+
        'PENDIENTE DISTINTO: el borde este de 24,4 mete el Rila y el Rodope '+
        'occidental, que eran esclavinia; bajarlo a ~23,7 mejora la caja sin '+
        'pretender saber mas.'
 },
 {
  id:'moghulistan', tramo:[1500,1514], caja:null,
  razon:'La recta de lat 45,5 durante 15,66 grados es la frontera esteparia con '+
        'kazajos y oirates, a traves del Balkhash y Dzungaria, donde no existia '+
        'linea. PENDIENTE DISTINTO Y REAL: el rotulo dice "pierde el Semirechie" '+
        'y la geometria lo sigue conteniendo hasta 45,5; el limite norte deberia '+
        'bajar al frente del Tian Shan (43,2-44,3 N). Eso es un defecto de '+
        'extension, no de trazo.'
 },
 {
  id:"kannauj", tramo:[783,816], caja:[78.6,81.8,26.2,27.9],
  razon:"El encargo decia \"es el Doab del Ganges-Yamuna: hay dos rios que "+
        "seguir\", y la comprobacion punto por punto dice lo contrario: los "+
        "dos rios no son los bordes de este poligono, sino cuerdas que lo "+
        "atraviesan. El Ganges esta DENTRO en Kannauj (79,97/27,09) y en "+
        "Kanpur (80,34/26,50), o sea que la caja monta a caballo de las dos "+
        "orillas y el rio no puede ser su limite. El Yamuna esta DENTRO en "+
        "Etawah (79,02/26,75) y sale por Kalpi (79,73/26,12), pero en el "+
        "extremo oriental corre a 0,77 grados -85 km- al sur del borde "+
        "inferior. Seguir los rios no seria retrazar esta caja: seria MOVERLA "+
        "al suroeste, sobre el interfluvio, y eso equivale a afirmar que los "+
        "Ayudha no tuvieron el Awadh transgangetico, cosa que ninguna fuente "+
        "dice. De Chakrayudha, cliente de Dharmapala entre tres imperios, no "+
        "se conoce ninguna frontera: se conoce la ciudad. Un rectangulo "+
        "centrado en Kannauj dice \"un distrito alrededor de la ciudad, "+
        "aproximadamente\", que es exactamente lo que se sabe. PENDIENTES "+
        "DISTINTOS Y REALES, anotados en tanda5a.md: (1) el rotulo \"vasallos "+
        "de Dharmapala\" arranca en 783 y la clientela pala empieza con "+
        "Chakrayudha hacia 791-800, no con Indrayudha; (2) el periodo previo "+
        "753..783 rotula \"Vajrayudha inaugura la dinastia\" diecisiete anios "+
        "antes de que Vajrayudha reine (h. 770); (3) los periodos 740..750 y "+
        "750..753 arrastran una astilla de 5 vertices y 0,04 grado² en el "+
        "Kumaon (79,60/29,60 a 80,23/29,22), a 250 km de Kannauj y sin "+
        "relacion con la entidad."
 },
 {
  id:"harar", tramo:[1647,1887], caja:null,
  razon:"Las seis fases del emirato son rectangulos EXACTAMENTE CONCENTRICOS "+
        "en 42,175/9,30 -a 4 km de la ciudad amurallada, 42,14/9,31- que "+
        "crecen 0,10 grados por lado en cada corte: 0,27, 0,53, 0,85, 1,21, "+
        "1,32. Es una convencion de radio, no una frontera, y como convencion "+
        "es honesta: Harar era una ciudad-Estado de mercado rodeada de oromo "+
        "y somalies con los que el emir trataba por matrimonio y tributo, no "+
        "por linea. Las unicas cifras de extension que dan las fuentes son de "+
        "maximos tributarios -\"entre el Awash y el Shebelle\", garads hasta "+
        "Dawaro, el Ogaden como tributario- que son cinco veces mayores que "+
        "estas cajas y que tampoco se pueden trazar. Y el altiplano de Harar "+
        "no ofrece la linea que se le podria suponer: el escarpe cae al "+
        "sureste, pero el emirato no llegaba a el, y por el norte y el oeste "+
        "el terreno se degrada sin corte. Redibujar aqui seria inventar "+
        "sinuosidad sobre un centro y un radio. PENDIENTE DISTINTO, en "+
        "tanda5a.md: la progresion monotona 1647->1875 cuenta una expansion "+
        "continua que las fuentes contradicen -en el XIX los oromo estrechan "+
        "a los harari hasta las puertas, y Burton en 1855 describe a un emir "+
        "que teme salir de la muralla-; si se toca algo, que sea el area de "+
        "1834..1875, no el trazo. El hueco 1875..1885 NO es un hueco: es la "+
        "ocupacion egipcia (11 de octubre de 1875 - mayo de 1885) y `egypt` "+
        "cubre Harar, Babille y el altiplano durante todo ese tramo. "+
        "Comprobado."
 },
 {
  id:"kanato_abuljayr", tramo:[1428,1430], caja:[62,74,51.5,57.6],
  razon:"Estepa del Tobol y el Ishim. El bloque esta BIEN SITUADO -contiene "+
        "Chimgi-Tura/Tiumen (65,53 E 57,15 N), donde Abu-l-Jayr es proclamado "+
        "kan en 1428, y cubre las cuencas del Tobol y el Ishim que el rotulo "+
        "nombra-, pero un ulus nomada recien proclamado no tiene frontera: la "+
        "obediencia era de tribus, no de terreno. Los 7 vertices dicen "+
        "\"aproximadamente esto\" y es lo unico que se puede decir. PENDIENTE "+
        "DISTINTO Y REAL: desde 1430 la geometria pierde Chimgi-Tura (queda "+
        "en siberia_occidental), pero Abu-l-Jayr la conservo como residencia "+
        "hasta que en 1446 traslado la capital al Sir Daria. El borde norte "+
        "de 56,8 de las fases 1430-1465 deberia subir a ~57,4 para retenerla."
 },
 {
  id:"kanato_abuljayr", tramo:[1430,1465], caja:null,
  razon:"Dasht-i Kipchak oriental, entre el Yaik y el Irtish. No hay frontera "+
        "que dibujar en ningun borde: el norte es el limite de la taiga, el "+
        "sur el desierto y el este el Irtish, que la geometria ya no sigue. "+
        "Ademas los \"8 y 9 anillos\" de 1438-1457 NO son ocho territorios: son "+
        "rebanadas meridianas de un unico poligono, cortadas por longitudes "+
        "fijas (60,54 / 62,34 / 65,81 / 71,02 / 73,97) y todas con los mismos "+
        "bordes de latitud 45,0 y 56,8 que el anillo entero de 1430-1438. Es "+
        "costura de teselado, no dibujo a mano, y lo correcto es fusionarlas, "+
        "no trazarlas."
 },
 {
  id:"ayutthaya", tramo:[1569,1584], caja:[99.6,101,13,17.1],
  razon:"Franja central del Chao Praya. Los CUATRO bordes del anillo son "+
        "costuras, no fronteras libres: el sur (lat 13,05) empalma con el "+
        "anillo peninsular de la propia Ayutthaya; el este (lon 101,00) mira "+
        "al tercer anillo del reino; y el oeste (lon 99,60) y el norte (lat "+
        "17,05) son costuras con toungoo, que ocupa el otro lado. Moverlas "+
        "unilateralmente no crea un contorno: crea solapes con toungoo o "+
        "huecos nuevos. El defecto real de esta fase esta en el reparto, no "+
        "en el trazo (ver tanda5b.md: pasillo birmano de 0,2 grados y "+
        "Kamphaeng Phet)."
 },
 {
  id:"bengal_sultanate", tramo:[1540,1554], caja:[84,87.1,21,24.2],
  razon:"No es el delta: es la meseta de Chota Nagpur, 150 km tierra adentro "+
        "del Hugli. Contiene Ranchi (85,33 E 23,35 N), Purulia y Dhanbad, que "+
        "fueron del raj nagvanshi y nunca del sultanato. Y sobre todo: entre "+
        "1538 y 1554 el sultanato de Bengala NO EXISTIA -Sher Shah Suri tomo "+
        "Gaur en 1538 y sur_empire ocupa aqui Gaur, Sonargaon, Dacca y "+
        "Chittagong-, de modo que esta caja es el residuo de una resta, la "+
        "periferia que quedo cuando se le arranco el corazon. No se puede "+
        "trazar la frontera de un estado que no existe. Lo que procede es "+
        "borrar la fase, no dibujarla; no la borro aqui porque Chota Nagpur "+
        "esta dentro del sultanato en TODAS las fases 1429-1576 y quitarlo "+
        "solo en esta abriria una intermitencia de 14 anos."
 },
 {
  id:"himalaya_reinos", tramo:[400,750], caja:[84.6,86.4,27,28.15],
  razon:"Es la misma caja que la entidad licchavi_nepal (450-750, anillo de "+
        "84,60-86,40 / 27,00-28,12): dos civilizaciones distintas del mapa, "+
        "con el mismo nombre Licchavi y el mismo wikiTitle \"Reino Licchavi\", "+
        "sobre el mismo rectangulo. Los cuatro \"anillos\" de himalaya_reinos "+
        "en 450-750 son los recortes que quedan al restarle licchavi_nepal, "+
        "cuadrante a cuadrante: por eso Katmandu (85,32 E 27,71 N) cae dentro "+
        "de licchavi_nepal y FUERA de himalaya_reinos entre 450 y 750. "+
        "Redibujar el residuo seria dar cuerpo a un duplicado. Lo que procede "+
        "es borrar las fases 400-750 de himalaya_reinos y dejar "+
        "licchavi_nepal."
 },
 {
  id:"british", tramo:[1670,1700], caja:[-89,-86,55.6,56.34],
  razon:"Costa suroeste de la bahia de Hudson, entre el Severn y el Winisk. "+
        "El anillo tiene 18 vertices y QUINCE DE ELLOS YA SON LA COSTA: la "+
        "polilinea de -86,00/55,69 a -87,91/56,34 se apoya en la orilla punto "+
        "por punto -tierra 0,10 grados al sur y mar 0,10 grados al norte en "+
        "los trece vertices intermedios, comprobado con tierra.js-. Lo unico "+
        "recto es el interior: el sur en lat 55,60 y el oeste en lon -89,00. "+
        "Y esos dos no son mios: cree_innu lleva vertices EXACTOS en [-89,00 "+
        "55,60], [-89,00 56,30] y [-86,00 55,60], que es la linea de talla "+
        "pactada en la ronda de Rupert's Land -la que dejo 188 grado² de los "+
        "519 de la carta de 1670 y puso Winnipeg en praderas_norte y Edmonton "+
        "en praderas_noroeste-. Moverla por el lado britanico sin mover el "+
        "cree abre una franja blanca de tundra o un solape. No hay nada que "+
        "redibujar: el borde libre ya esta dibujado y el otro esta pactado. "+
        "PENDIENTE DISTINTO Y REAL, en tanda6a.md: la franja es britanica de "+
        "1670 a 1700 sin interrupcion, y en esa costa la Compania solo estuvo "+
        "de 1685 a 1690 -New Severn House, fundada en 1685 y destruida por "+
        "d'Iberville en 1690, tras lo cual la costa se quedo sin factoria "+
        "hasta 1759-. El defecto es de calendario, no de linea."
 },
 {
  id:"mughal", tramo:[1595,1622], caja:[65,66.6,31,32.3],
  razon:"Kandahar. Rectangulo de cuatro vertices, y los cuatro lados son el "+
        "agujero que se pico en `persia`: persia tiene vertices exactos en "+
        "las cuatro esquinas 65,00/66,60 x 31,00/32,30 y el muestreo a 0,05 "+
        "grados de cada borde da persia fuera y mughal dentro en los cuatro. "+
        "Ademas no hay frontera que trazar: la Encyclopaedia Iranica, que es "+
        "la ficha de referencia de la ciudad, no da ningun limite territorial "+
        "entre la zona mogola y la safavi; lo que hubo fue una marca de "+
        "tribus gilzai y abdali entre el Registan al sur y el Hazarayat al "+
        "norte, y una plaza que cambio de mano por asedio y por desercion, no "+
        "por tratado. PENDIENTES DISTINTOS Y REALES, en tanda6a.md: (1) la "+
        "caja es un ENCLAVE FLOTANTE -entre su borde este (lon 66,60) y el "+
        "anillo mayor del imperio (lon ~67,50 en esas latitudes) hay 0,9 "+
        "grados, unos 85 km, que el mapa da a persia, y por ese pasillo va el "+
        "camino del Tarnak con Qalat-i Gilzai (66,90 E 32,11 N) en medio; la "+
        "provincia mogola de Kandahar no estaba separada de la de Kabul-; (2) "+
        "el suba de Qandahar incluia Zamindawar (64,60 E 32,30 N) y Bost "+
        "(64,36 E 31,58 N), que el mapa da a persia durante todo el periodo; "+
        "(3) los mogoles RECUPERARON Kandahar en 1638 por la desercion de Ali "+
        "Mardan Jan y la tuvieron hasta el 22 de febrero de 1649, y el mapa "+
        "no se la devuelve nunca: de 1622 a 2025 Kandahar no vuelve a ser "+
        "mogola."
 },
 {
  id:"russia", tramo:[1503,1514], caja:[31,35,51,53.3],
  razon:"Severia. Rectangulo de cuatro vertices y 9,2 grado², el mayor de la "+
        "tanda, y los cuatro lados son el agujero picado en poland_lithuania: "+
        "vertices exactos en las cuatro esquinas y complementariedad limpia a "+
        "0,05 grados de cada borde. Sobre los rios que se me indicaban, la "+
        "comprobacion dice lo mismo que dijo en kannauj: NO SON BORDES, SON "+
        "CUERDAS. El Desna entra por Briansk (34,37 E 53,24 N), cruza en "+
        "diagonal por Trubchevsk (33,77/52,58) y Novgorod-Severski "+
        "(33,26/52,02) y sale por Chernigov (31,30/51,50): los cuatro DENTRO. "+
        "El Seim pasa por Putivl (33,87/51,33) y Rylsk (34,68/51,57), los dos "+
        "DENTRO, y su cabecera en Kursk (36,19/51,73) queda 1,19 grados al "+
        "este del borde. El Sozh si corre casi paralelo al lado oeste, pero "+
        "por FUERA: Gomel esta en 30,98 y el borde en 31,00, o sea que el rio "+
        "no limita la caja, la roza. Y el reparto de 1503 no se conoce como "+
        "linea sino como lista de plazas -70 volosts, 22 ciudades y 13 aldeas "+
        "segun Liubavski-, que es exactamente lo que una caja sabe decir y un "+
        "contorno sinuoso no. PENDIENTE DISTINTO Y GRAVE, en tanda6a.md: la "+
        "caja es un ENCLAVE FLOTANTE. El cuerpo de Rusia baja a lat 54,7 solo "+
        "a partir de lon 34,25, y entre el techo de la caja (53,30) y el, en "+
        "lon 31-36,5, todo es poland_lithuania. Severia queda rodeada de "+
        "Lituania por los cuatro costados. La causa es que el mapa no aplica "+
        "la paz eterna de 1494: Mtsensk (36,58/53,28), Belev (36,13/53,81), "+
        "Vorotinsk (35,99/54,42), Kozelsk (35,78/54,04), Mosalsk "+
        "(34,98/54,49) y Serpeisk (35,28/54,47) siguen siendo lituanos en "+
        "1505 y solo pasan a Rusia en 1514. Falta ademas todo lo demas de "+
        "1503: Gomel, Liubech, Dorogobuzh, Toropets, Belaia. Es un problema "+
        "de reparto, no de trazo."
 },
 {
  id:"spanish", tramo:[1648,1678], caja:[5.2,6.98,46.55,47.85],
  razon:"Franco Condado. De los cuatro lados, el ESTE ya es un contorno real "+
        "y bueno -los nueve vertices de 6,13/46,55 a 6,95/47,43 son el arco "+
        "jurasico y la linea suiza, y no tienen nada de recto- y los otros "+
        "tres son costura: france lleva vertices exactos en la esquina "+
        "5,20/46,55, en la esquina 5,20/47,85 y en el lado sur, y "+
        "holy_roman_empire lleva CUATRO vertices exactos en lat 47,85. El "+
        "unico borde libre ya esta trazado; lo recto es lo que da a Francia y "+
        "al Imperio. Redibujarlo por un lado abre hueco contra los dos. "+
        "PENDIENTES DISTINTOS Y REALES, con coordenadas en tanda6a.md: (1) el "+
        "borde sur de lat 46,55 AMPUTA LA MITAD SUR DEL BAILLIAGE D'AVAL "+
        "-Saint-Amour (5,34/46,43), Orgelet (5,61/46,52), Moirans "+
        "(5,72/46,44), Arinthod (5,56/46,40), Saint-Claude (5,87/46,39), "+
        "Morez (6,02/46,52) y Les Rousses (6,06/46,48) quedan fuera, en "+
        "france y en savoy, cuando el departamento del Jura se formo en 1790 "+
        "justamente con el bailliage d'Aval, Saint-Claude incluido-; (2) por "+
        "el lado contrario el anillo mete DENTRO a Auxonne (5,39/47,19), "+
        "plaza real francesa del ducado de Borgona, y a Belfort (6,86/47,64), "+
        "que era Sundgau habsburgues y paso a Francia en la propia paz de "+
        "Westfalia de 1648, el anio en que empieza este anillo; (3) mete "+
        "tambien Montbeliard (6,80/47,51), que era condado de Wurtemberg y no "+
        "espanol; (4) el rotulo de las fases 1668..1678 dice \"Carlos II cede "+
        "el Franco Condado\" y la paz de Aquisgran de 1668 hizo lo contrario: "+
        "Luis XIV DEVOLVIO el Franco Condado a Espana y se quedo las plazas "+
        "flamencas. La cesion es de Nimega, 1678, y la geometria -que "+
        "conserva la provincia hasta 1678- contradice a su propio rotulo."
 },
 {
  id:"holy_roman_empire", tramo:[1335,1367], caja:[14,16.85,51,52.75],
  razon:"Escalera de quince vertices entre Brandeburgo, Bohemia y Polonia, en "+
        "la Baja Lusacia y el norte de la Baja Silesia. Es un RESIDUO: en "+
        "este mapa `holy_roman_empire` no es el Imperio sino lo que queda del "+
        "Imperio despues de dibujar aparte a Bohemia, Brandeburgo, Sajonia, "+
        "Hannover y las ciudades libres -Praga y Breslau no estan dentro de "+
        "holy_roman_empire en ninguna fase posterior a 1335-, y esta escalera "+
        "es el hueco que dejan tres vecinos. Los tres lo confirman con "+
        "vertices exactos: poland_lithuania en lon 16,85, bohemia en lat "+
        "51,00 y en lon 14,00, brandenburg en lon 14,00 y en lat 52,75. Los "+
        "peldanos de 0,10 grados -la lengua de lon 15,30-15,40 entre lat "+
        "51,00 y 51,45- son astillas de resta, no fronteras. PENDIENTE "+
        "DISTINTO Y REAL, en tanda6a.md: el anillo se mete 80 km dentro de la "+
        "Gran Polonia. Contiene Leszno (16,58/51,84), Wolsztyn (16,12/52,12), "+
        "Ksiaz Wielkopolski (16,10/52,06) y Wschowa (16,31/51,80), que eran "+
        "Wielkopolska y no tierras de la corona de Bohemia; el tratado de "+
        "Trentschin de 1335, que es lo que fecha este anillo, le dio al rey "+
        "de Bohemia Silesia, no la Gran Polonia. Y a su lado Swiebodzin "+
        "(15,53/52,25) y Miedzyrzecz (15,58/52,45) NO SON DE NADIE en el "+
        "mapa."
 },
 {
  id:"holy_roman_empire", tramo:[1423,1526], caja:[11.05,12.2,51.6,52.25],
  razon:"Bloque de Magdeburgo-Halberstadt-Anhalt, seis vertices, repetido "+
        "IDENTICO en las dieciseis fases de 1423 a 1526. Es el mismo objeto "+
        "copiado, no dieciseis dibujos, y es un parche estructural: hasta "+
        "1423 el Imperio esta cortado en este mapa en TIRAS MERIDIANAS por "+
        "longitudes fijas -10,72 / 11,89 / 12,55-, o sea teselado de "+
        "`recorte.parte`; en 1423 las tiras se funden en un anillo unico cuyo "+
        "techo es la recta lat 51,45, y este bloque se pega encima para "+
        "recuperar Magdeburgo. Entre el techo del anillo grande (51,45) y el "+
        "pie del bloque (51,60) queda una franja de 0,15 grados que no es de "+
        "nadie. Costuras: el lado sur lo firma saxony con vertices exactos en "+
        "11,73/51,60 y 12,10/51,60; la esquina noreste la firma brandenburg "+
        "con 12,20/52,25, 12,10/52,25 y 12,20/52,21; y el meridiano 11,05 es "+
        "el que usan hanover y brandenburg mas al norte (52,44 / 52,90 / "+
        "53,10). Solo el tramo oeste entre 51,60 y 52,25 da a hueco. Y en "+
        "1526 el propio bloque se vuelve a partir en dos por lon 11,95: "+
        "teselado otra vez. Lo que hay que arreglar aqui es la estructura "+
        "-fundir las tiras y cerrar la franja-, no trazar una linea sinuosa "+
        "alrededor de una docena de principados distintos. PENDIENTE DISTINTO "+
        "Y REAL, en tanda6a.md: el bloque dice Magdeburgo y deja fuera lo que "+
        "Magdeburgo tenia. Halle (11,97/51,48), residencia de los arzobispos, "+
        "esta en saxony; Dessau (12,24/51,84), capital de Anhalt, Burg "+
        "(11,85/52,27) y Wolmirstedt (11,63/52,25) no son de nadie. Antes de "+
        "1423, con las tiras, Halle y Dessau si estaban dentro: el parche "+
        "perdio terreno respecto de lo que sustituyo."
 },
 {
  id:"holy_roman_empire", tramo:[1648,1681], caja:[5.35,6.91,47.85,48.95],
  razon:"Ducado de Lorena, fases anteriores al reajuste alsaciano de 1681: "+
        "mismo rectangulo de cuatro vertices con el borde este en lon 6,91. "+
        "Vale palabra por palabra la razon de la entrada 1681..1701."
 },
 {
  id:"holy_roman_empire", tramo:[1681,1701], caja:[5.35,7.2,47.85,48.95],
  razon:"Ducado de Lorena, rectangulo de cuatro vertices. Es el resto de una "+
        "resta: hasta 1648 Lorena y el Franco Condado eran un solo anillo de "+
        "catorce vertices (5,20-6,91 / 46,38-48,95) con el arco jurasico ya "+
        "dibujado; en 1648 el Franco Condado se le da a `spanish` y lo que "+
        "sobra queda como caja. Los cuatro lados son costura con france, que "+
        "lleva vertices exactos en las cuatro esquinas, y el muestreo a 0,05 "+
        "grados da france fuera y el Imperio dentro en los cuatro bordes: la "+
        "caja es un enclave imperial dentro de Francia, que es lo que era "+
        "Lorena, y su forma es la del agujero. PENDIENTES DISTINTOS Y REALES, "+
        "en tanda6a.md: (1) la caja se queda con la mitad sur del ducado "+
        "-corta en lat 48,95 y deja fuera todo el norte lorenes- y en cambio "+
        "mete dentro Toul (5,89/48,68), que era de los Tres Obispados "+
        "franceses; (2) sobre todo, Lorena figura como imperial sin "+
        "interrupcion de 1648 a 1714, y estuvo OCUPADA POR FRANCIA de 1670 a "+
        "1697 -Carlos IV expulsado en 1670, restitucion a Leopoldo por la paz "+
        "de Ryswick en 1697- y otra vez de 1702 a 1714. Veintisiete de los "+
        "cincuenta y tres anios que cubre este anillo son de ocupacion "+
        "francesa que el mapa no muestra."
 },
 {
  id:"zhao_estado", tramo:[-260,-256], caja:[109.5,115.9,38.6,41],
  razon:"Mitad NORTE de Zhao, no el reino entero. El borde inferior -lat "+
        "38,60 recta desde lon 110,50 hasta 115,90- es una costura con el "+
        "segundo anillo de la misma fase (112,20-115,87 / 36,02-38,60), y "+
        "encima es una costura MAL CERRADA: los dos anillos solo se tocan en "+
        "un punto (114,40/38,60) y entre el techo del anillo sur y la recta "+
        "de 38,60 queda hueco. Moverla es rehacer los dos anillos, no "+
        "retrazar uno. Los otros tres bordes tampoco se pueden seguir: el "+
        "norte (lat 41,0 de 109,50 a 113,0 y lat 40,4 de 113,0 a 114,06) "+
        "quiere ser la muralla norte del rey Wuling, que segun el Shiji iba "+
        "\"desde Dai, por el pie del Yinshan, hasta Gaoque\": el extremo "+
        "oriental es Zhangbei (114,72/41,16) y a esa latitud el anillo "+
        "termina en lon 113,00, a 1,7 grados; el occidental, Gaoque, se situa "+
        "habitualmente en las Lang Shan (~107 E) aunque su localizacion se "+
        "discute, y el anillo corta en 109,50. El trazado arqueologico de "+
        "esos 650 km no se puede poner con dos decimales desde fuentes de "+
        "web. DEFECTOS DE CONTENIDO, que son el hallazgo real y estan "+
        "detallados en tanda6b.md: (1) Jinyang / Taiyuan (112,55/37,87) esta "+
        "DENTRO de Zhao hasta -260 y FUERA desde -260, pero Qin no se la "+
        "quita a Zhao hasta 248 a.C. (Meng Ao, comandancia de Taiyuan): el "+
        "mapa adelanta doce anios la perdida de la capital historica del "+
        "linaje; (2) la ciudad de Dai (Daiwangcheng, Yuxian, 114,62/39,87) "+
        "esta asignada a yan_estado en TODAS las fases de Zhao, cuando la "+
        "comandancia de Dai la crea el propio rey Wuling sobre el estado de "+
        "Dai que sus antepasados conquistaron hacia 476 a.C."
 },
 {
  id:"zhao_estado", tramo:[-228,-222], caja:[113,114.65,39.2,40.4],
  razon:"El reino rump de Dai del rey Jia, 228-222 a.C., y NO CONTIENE DAI. "+
        "La sede de la comandancia -Daiwangcheng, en Yuxian, 114,62/39,87- "+
        "cae a 0,5 grados al este del borde del poligono, que a esa latitud "+
        "esta en lon 114,13, y el mapa se la da a yan_estado. Un rectangulo "+
        "bautizado con el nombre de una ciudad que no contiene no se arregla "+
        "suavizandole las esquinas: hay que moverlo al este hasta pasar de "+
        "114,7, y eso es quitarle terreno a Yan, decision que no es solo de "+
        "esta entidad. Ademas los tres bordes sur/este/oeste son heredados "+
        "del anillo norte de -256..-228 (comparten los vertices 114,20/39,40 "+
        "y 114,06/40,40), o sea que el rump esta recortado del padre y "+
        "arrastra su error."
 },
 {
  id:"liao", tramo:[926,938], caja:[125,127,39.5,41.5],
  razon:"Saliente en el noroeste de Corea tras la caida de Balhae. El borde "+
        "sur NO es libre: la diagonal "+
        "(125,57/39,50)-(126,54/40,02)-(126,66/40,08)-(127,00/40,26) comparte "+
        "literalmente los vertices 126,54/40,02 y 126,66/40,08 con el anillo "+
        "de goryeo de 930, y el trozo suroeste (125,00-125,37 / 39,50-39,64) "+
        "es linea de costa. Los otros tres bordes -lon 125,0 al oeste, lat "+
        "41,5 al norte, lon 127,0 al este- son cortes de meridiano y paralelo "+
        "que dan a tierra de nadie: en 930 Sinuiju (124,40/40,10), Junggang "+
        "(126,60/41,60) y Hamhung (127,54/39,92) no son de nadie en el mapa. "+
        "No hay frontera Liao dentro de Corea que seguir: tras 926 Dongdan "+
        "traslada la poblacion de Balhae a Liaoyang (928) y el espacio entre "+
        "el Yalu y el Chongchon queda en manos de tribus yurchen hasta que "+
        "Seo Hui lo negocia en 993. El propio mapa lo dice sin querer: el "+
        "saliente existe solo entre 926 y 938 y desaparece despues, y Kanggye "+
        "(126,60/40,97) pasa de balhae (920) a liao (930) a nadie (950). "+
        "Redibujarlo seria dar contorno preciso a doce anios de dominio "+
        "nominal."
 },
 {
  id:"jin_dynasty", tramo:[1211,1215], caja:[116.1,130.58,48.73,50],
  razon:"El encargo preguntaba si aqui lo honesto era una caja. No lo es: lo "+
        "honesto es BORRARLA. Es una tira de 14,5 grados de largo por 1,3 de "+
        "alto sobre el alto Argun, el Amur superior y el Hulunbuir, en la "+
        "fase de la aniquilacion mongola. En 1211-1215 el Jin no solo no "+
        "tenia frontera ahi: habia perdido ya toda la estepa (Yehuling es de "+
        "1211, el foso fronterizo -jiehao- queda desbordado ese mismo anio y "+
        "la corte huye a Kaifeng en 1214). El anillo es ademas defectuoso en "+
        "si mismo: se toca a si mismo en el vertice (130,13/49,00), por el "+
        "que pasa exactamente el segmento (130,58/48,73)-(129,40/49,44). Y no "+
        "es lo unico de esta fase: los otros trece anillos incluyen ONCE "+
        "ISLAS COREANAS -Jeju (126,53/33,37), Jindo, Namhae, Ganghwa "+
        "(126,48/37,72) y siete mas, 0,46 grado² en total- que solo "+
        "pertenecen a jin_dynasty entre 1211 y 1215 y a nadie antes ni "+
        "despues, mientras Goryeo ocupa el continente a su lado. Tamna/Jeju "+
        "es de Goryeo desde 938, anexionada en 1105 y mongola solo desde "+
        "1275. Toda la fase 1211..1215 pide una revision de reparto, no un "+
        "retrazado."
 },
 {
  id:"ming", tramo:[1409,1427], caja:[105.3,106.6,20.5,21.4],
  razon:"Trozo del delta del rio Rojo de la provincia ming de Jiaozhi. El "+
        "borde SUR (lat 20,50, de lon 105,30 a 106,60) es costura exacta con "+
        "el anillo de dai_viet de la misma fase, cuyo techo es la misma lat "+
        "20,50: los dos anillos estan en la lista de esta tanda y moverlos "+
        "por separado abre un hueco o un solape entre los dos. Los otros tres "+
        "bordes son rectos y dan a tierra de nadie. Y el defecto de verdad no "+
        "es el trazo: (1) entre lat 21,40 -techo de este anillo- y lat 21,50 "+
        "-suelo del anillo grande de China- queda una FRANJA VACIA de 0,1 "+
        "grados que cruza el delta por el norte de Hanoi y separa la "+
        "provincia de su metropoli (comprobado en 106,00/21,45 y "+
        "106,30/21,44: indochina_pueblos, ninguna entidad politica); (2) "+
        "Haiphong (106,68/20,86) y todo el delta al este de lon 106,60 quedan "+
        "fuera de Jiaozhi, que segun las fuentes cubria \"casi todo el area al "+
        "norte de la cordillera anamita central\", delta incluido hasta el "+
        "mar. Arreglar eso es ampliar y coser, no suavizar."
 },
 {
  id:"tang", tramo:[640,647], caja:[88.5,89.8,42.6,43.3],
  razon:"Xizhou, la prefectura de Gaochang. Es un RESIDUO, igual que el caso "+
        "himalaya_reinos del registro anterior. La entidad tarim "+
        "(\"Ciudades-oasis del Tarim\") tiene un unico periodo 589..649 y no se "+
        "parte en 640, de modo que en 640-649 sigue ocupando el Turfan; el "+
        "anillo de tang es lo que queda al restarle tarim. Se demuestra "+
        "vertice a vertice: el borde sur del anillo tang -lat 42,60 de 88,50 "+
        "a 89,80- esta EXACTAMENTE sobre el segmento "+
        "(91,00/42,60)-(88,50/42,60) del anillo mayor de tarim, y la muesca "+
        "del noroeste comparte los vertices 89,21/42,92 y 89,18/43,09 con el "+
        "segundo anillo de tarim. Solo dos bordes son libres (lat 43,30 al "+
        "norte y lon 89,80 al este) y dan a tierra de nadie. CONSECUENCIA DE "+
        "CONTENIDO, que es lo grave: esa muesca deja FUERA de los Tang la "+
        "ciudad de Turfan (89,19/42,95) y Jiaohe/Yarkhoto (89,06/42,95) entre "+
        "640 y 649, y Jiaohe es precisamente donde Taizong instala en 640 el "+
        "protectorado general de Anxi. Es un agujero de nueve anios sobre la "+
        "sede del protectorado, y se cierra solo en 650. Ademas el corte "+
        "oriental en lon 89,80 deja fuera Puchang/Pichan (90,22/42,86), uno "+
        "de los cinco distritos de Xizhou, en tierra de nadie. Lo que procede "+
        "es partir el periodo 589..649 de tarim en 640 y recortarle el "+
        "Turfan, no dar cuerpo sinuoso al residuo."
 },
 {
  id:"gojoseon", tramo:[-109,-108], caja:[124.9,127.2,38.6,40.3],
  razon:"Nucleo de Wanggeom-seong en el ultimo anio de Joseon. El oeste y el "+
        "suroeste ya son costa real (el estuario del Taedong y la bahia de "+
        "Nampo, 124,90-125,49 / 38,60-39,69) y no hay nada que retrazar ahi. "+
        "Los dos bordes rectos que quedan son sintomas de una re-teselacion "+
        "rota, no trazos a mano: la fase anterior -111..-109 tiene UN solo "+
        "anillo (124,50-129,40 / 37,50-42,30) y esta, con el MISMO rotulo, lo "+
        "parte en cuatro y pierde territorio por todas partes. Comprobado: "+
        "entre lat 40,30 (techo de este anillo) y lat 40,50 (suelo del anillo "+
        "hermano) queda un HUECO de 0,2 grados a lo largo de 2,2 de longitud "+
        "(lon 125,01 a 127,20), de nadie; y Wonsan (127,44/39,17), Haeju "+
        "(125,71/38,04), Kaesong (126,55/37,97) y Chuncheon (127,73/37,88), "+
        "que en -110 son gojoseon, en -108,5 no son de nadie, y en -107 son "+
        "han. El arreglo es restaurar la geometria de -111..-109 para el "+
        "ultimo anio -o suprimir la particion-, no dibujarle una frontera "+
        "nueva al fragmento."
 },
 {
  id:"toungoo", tramo:[1510,1539], caja:[95.8,97,18.9,19.4],
  razon:"El rectangulo del principado de Taungoo (96,43/18,94 esta dentro por "+
        "0,04 grados del borde inferior). Es una convencion de radio "+
        "alrededor de una plaza, como el caso harar del registro anterior, y "+
        "como convencion es honesta: Taungoo entre 1510 y 1539 es un feudo de "+
        "Ava en el valle del Sittaung cuyo poder se mide en hombres y aldeas, "+
        "no en linea. Los bordes lo confirman: al norte (lat 19,40) empieza "+
        "ava y al sur (lat 18,90) empieza hanthawaddy, o sea dos costuras; al "+
        "este y al oeste no hay nadie. Las unicas referencias de extension "+
        "que dan las fuentes son la ciudad y su distrito. NOTA: los otros dos "+
        "anillos de esta fase -los jirones de costa del delta- no se archivan "+
        "aqui porque no son una caja deliberada sino un error de reparto, y "+
        "van borrados en tanda6b_regla.js."
 },
 {
  id:"toungoo", tramo:[1584,1599], caja:[97.58,98.7,15.7,16.3],
  razon:"Bloque en la sierra entre el Salween y el Dawna, desgajado del "+
        "anillo principal del reino. Solo el borde oeste (97,58-97,74 / "+
        "15,70-16,02) es costa; los otros tres son rectos y dan a tierra de "+
        "nadie, y el este llega a lon 98,70, ya en la vertiente siamesa de la "+
        "divisoria, en un periodo cuyo propio rotulo dice que Nandabayin "+
        "PIERDE Ayutthaya en 1584. No hay ninguna frontera birmano-siamesa "+
        "cartografiable en 1584-1599: la linea de la divisoria "+
        "Dawna-Tenasserim solo se fija por tratado en el XIX. DEFECTO DE "+
        "CONTENIDO ADEMAS: el bloque flota. Ye (97,86/15,25) y Tavoy "+
        "(98,20/14,08) son toungoo en 1560, NO SON DE NADIE en 1590 y vuelven "+
        "a ser toungoo en 1620: la costa de Tenasserim por la que se llega a "+
        "esta comarca entra y sale en quince anios, justo los de esta fase. O "+
        "sobra tambien el bloque de sierra, o falta el litoral que lo une al "+
        "reino."
 },
 {
  id:"dai_viet", tramo:[1409,1427], caja:[104.8,106.2,19.3,20.5],
  razon:"No es \"el delta del rio Rojo\" como decia el encargo: es THANH HOA. "+
        "Hanoi/Dong Quan (105,84/21,03) esta fuera y es ming; dentro estan "+
        "Lam Son (105,36/19,92), Tay Do (105,60/20,08) y la ciudad de Thanh "+
        "Hoa (105,78/19,81). El borde este ya es costa real. De los tres "+
        "rectos, el norte (lat 20,50) es costura exacta con el anillo del "+
        "delta de ming, que tambien esta en esta tanda, y el sur (lat 19,30) "+
        "y el oeste (lon 104,80) dan a tierra de nadie. Y el fondo del asunto "+
        "no es el trazo: Jiaozhi cubria \"casi toda el area al norte de la "+
        "cordillera anamita central\", Thanh Hoa incluido, desde 1407; la "+
        "corte de los Tran tardios aguanta en Nghe An y Thuan Hoa hasta 1413 "+
        "y Le Loi esta encerrado en la montaña del oeste de Thanh Hoa desde "+
        "1418 y no baja a Nghe An hasta 1424. Un bloque fijo de Thanh Hoa "+
        "durante los dieciocho anios no corresponde a ningun momento. Encima "+
        "hay un AGUJERO EN MEDIO: Nghe An (Vinh, 105,67/18,67) no es de nadie "+
        "en 1409-1427 y es justamente la provincia que une los dos trozos de "+
        "dai_viet, el de Thanh Hoa y el de Thuan Hoa."
 },
 {
  id:"ghurid", tramo:[1175,1186], caja:[70.8,71.95,29.2,30.6],
  razon:"Multan y Uch, rectangulo puro de cuatro vertices. Multan "+
        "(71,47/30,20) esta dentro; Uch Sharif (71,06/29,23) entra por 0,03 "+
        "grados. El unico borde con algo detras es el oeste, que corre a la "+
        "altura del Indo (lon 70,8-71,0 en ese tramo), pero seguir el rio "+
        "seria MOVER la caja, no retrazarla, y ademas contradiria al propio "+
        "mapa, que pone la orilla derecha -Dera Ghazi Khan, 70,64/30,05- en "+
        "manos de los gaznavies hasta 1186. Los otros tres bordes no tienen "+
        "fuente: al norte y al este la provincia limitaba con el Punyab "+
        "gaznavi de Lahore, cuya linea nadie da; al sur con los Soomra del "+
        "Sind. De la conquista de 1175-1176 se conocen las dos plazas, no un "+
        "contorno; el rectangulo dice \"el distrito de Multan y Uch, "+
        "aproximadamente\", que es lo que se sabe. PENDIENTE DISTINTO: "+
        "Peshawar (71,58/34,01) sigue siendo gaznavi en 1180 aunque Muizz "+
        "al-Din la toma en 1179."
 },
 {
  id:"chalukya", tramo:[1187,1189], caja:[74.6,76.2,15,15.8],
  razon:"Ultima fase del imperio, y el rectangulo no contiene ni la capital "+
        "ni el destierro. Somesvara IV recupera Kalyani de los kalachuris en "+
        "1183 y la conserva hasta que Bhillama V se la quita en 1189; Kalyani "+
        "(Basavakalyan, 76,95/17,87) esta a 2,1 grados del borde y el mapa se "+
        "la da a yadava ya desde 1187. Y Banavasi (75,02/14,53), donde acaba "+
        "desterrado, esta a 0,5 grados por debajo del borde inferior y es "+
        "hoysala. Lo que queda dentro -Annigeri (75,43/15,42), Gadag, Hubli- "+
        "es coherente con la base efectiva de sus ultimos anios, pero es "+
        "terreno que el propio mapa daba a NADIE en la fase inmediatamente "+
        "anterior (1163-1187, cuyo anillo tiene el borde sur en lat ~16,05), "+
        "asi que el rectangulo no es una frontera que se encogio: es un "+
        "bloque nuevo aparecido en otro sitio. Con la capital fuera, el "+
        "destierro fuera y la fase anterior sin continuidad, retrazarlo seria "+
        "ponerle contorno fino a una ubicacion que primero hay que decidir. "+
        "Ademas el segundo anillo de la fase (74,00-74,17 / 14,78-15,50) es "+
        "una astilla de 0,10 grado² recortada del anillo de 1163-1187: "+
        "comparte con el, uno a uno, los vertices 74,00/15,50, 74,00/15,00 y "+
        "74,17/14,78. PENDIENTE: Badami (75,68/15,92) queda en el hueco entre "+
        "este anillo y yadava."
 },
 {
  id:"khwarezm", tramo:[1219,1220], caja:[58.5,61.5,41.5,43.9],
  razon:"El Jorasmia propiamente dicho, rectangulo puro de 3,0 x 2,4 grados. "+
        "Los cuatro bordes son libres -alrededor no hay nadie- pero no hay "+
        "frontera: el oasis de Corasmia es una isla de regadio en el desierto "+
        "y su limite es el filo de la irrigacion, que se movia con el rio; el "+
        "propio Amu Daria cambia de curso tras la rotura de la presa de "+
        "Gurganj en 1221. Dibujar sinuosidad ahi seria dibujar la mancha de "+
        "riego moderna. Lo que SI procede, con el precedente songhai/Taghaza, "+
        "es MOVER el bloque: como esta, Gurganj (59,15/42,34) y Kath/Beruniy "+
        "(60,75/41,69) caen dentro, pero Khiva (60,36/41,38) y Hazarasp "+
        "(61,07/41,32) -dos plazas del propio oasis- caen FUERA por debajo "+
        "del borde de 41,50 y no son de nadie, mientras el borde norte de "+
        "43,90 se entra en el mar de Aral de la epoca (la orilla sur estaba "+
        "hacia 43,6-43,8 N antes de la desecacion). Bajarlo a algo como "+
        "58,8-61,3 / 41,15-43,55 recoge el oasis entero y sale del lago sin "+
        "fingir contorno. DEFECTO MAYOR APARTE: la fase 1219..1220 -el anio "+
        "1219- ya ha borrado de Corasmia Bujara (64,42/39,77), Samarcanda "+
        "(66,97/39,65), Otrar (68,30/42,85), Merv (61,83/37,60) y Nishapur "+
        "(58,80/36,21), que no son de NADIE; Otrar, Bujara y Samarcanda caen "+
        "en febrero-marzo de 1220 y Merv y Nishapur en 1221. El rotulo de la "+
        "fase nombra tres caidas de 1220 en una fase que termina en 1220."
 },
 {
  id:"garamantes", tramo:[661,667], caja:[10.5,16,26,27.9],
  razon:"El Fezan. El anillo no es un contorno: son CINCO vertices -[10,5/26] "+
        "[16/26] [16/27,9] [13/27,9] [10,5/27]- o sea un rectangulo con la "+
        "esquina noroeste achaflanada, mas una astilla de 0,03 grado2 en "+
        "9,71-9,89 E. En el desierto no hay frontera que seguir: el wadi "+
        "al-Ayal es un corredor de oasis, no una linea, y la propia entidad "+
        "lleva ocho fases desde -400 dibujadas como un poligono redondeado de "+
        "doce vertices sobre 24,40-27,90 N, que es lo honesto. EL DEFECTO ES "+
        "OTRO Y ESTA EN LA FECHA Y EN LA DIRECCION DE LA CONQUISTA, no en el "+
        "trazo: ver tanda6c.md. Comprobado punto por punto: Garama/Germa "+
        "(13,06/26,55) y Zawila (15,11/26,17) estan DENTRO, pero Murzuq "+
        "(13,92/25,91) queda FUERA por 0,09 grados, porque el corte recto de "+
        "lat 26,00 le arranca a los garamantes todo el Fezan meridional seis "+
        "anios ANTES de que llegue Uqba ibn Nafi, y se lo da a `umayyad`. La "+
        "conquista arabe entro por el norte (Waddan, Zawila, Germa), no por "+
        "el sur: el corte esta del reves."
 },
 {
  id:"papal_states", tramo:[1348,1791], caja:[4.55,5.2,43.65,44.35],
  razon:"El rectangulo perfecto de cuatro vertices [4,55/43,65] [5,20/43,65] "+
        "[5,20/44,35] [4,55/44,35] con el que Avinon y el Comtat aparecen "+
        "desde 1348 hasta 1791. NO se redibuja en esta tanda porque el "+
        "encargo pedia el tramo 1278..1348, que si se entrega "+
        "(tanda6c_regla.js); pero queda registrado que este rectangulo "+
        "TAMPOCO es el Comtat: se come Arles (4,63/43,68) y Tarascon "+
        "(4,66/43,80), que fueron de Provenza y luego de Francia y jamas del "+
        "papa, y en cambio PIERDE Valreas (4,99/44,38) y el Mont Ventoux "+
        "(5,28/44,17), que si lo fueron. El contorno correcto es el mismo que "+
        "se entrega para 1278..1348 mas el territorio de Avinon; se deja "+
        "fuera de esta tanda para no encadenar nueve fases a una sola "+
        "comprobacion."
 },
 {
  id:"franks", tramo:[774,796], caja:[0.9,1.95,43.2,44],
  razon:"NO ES LA MARCA HISPANICA. El anillo tiene CUATRO vertices y es un "+
        "rectangulo exacto alineado con los ejes: [0,90/43,20] [1,95/43,20] "+
        "[1,95/44,00] [0,90/44,00]. Esta 1,2 grados al oeste y 1,5 al norte "+
        "del Rosellon: contiene Tolosa (1,44/43,60) y Muret (1,33/43,46) y "+
        "nada mas. La Marca Hispanica si esta en el mapa, y aparece donde "+
        "debe, en la fase 800..804, como el anillo de 1,90-2,45 E / "+
        "41,26-41,70 N sobre Barcelona. Este rectangulo es un PARCHE, y lo "+
        "que parchea es un defecto ajeno: `abbasid` tiene un bloque de 12,27 "+
        "grado2 sobre -1,81..4,50 E / 40,59..44,30 N durante 750-800, y con "+
        "el se traga Narbona, Carcasona, Albi, Foix, Auch y Montauban. "+
        "Alguien rescato Tolosa recortandole al bloque un rectangulo y "+
        "dandoselo a los francos, y dejo el resto dentro. Redibujar el "+
        "rectangulo con vertices sinuosos seria dar aire de precision al "+
        "parche y dejar intacto el bloque. Lo que procede es corregir "+
        "`abbasid` (ver tanda6c.md): los abasies nunca gobernaron al-Andalus "+
        "ni Septimania -al-Andalus se separa en 756 con Abd al-Rahman I, "+
        "omeya- y Narbona cae ante Pipino el Breve en 759."
 },
 {
  id:"crusader_states", tramo:[1099,1171], caja:[35.9,36.6,35.8,36.6],
  razon:"Principado de Antioquia. De los cuatro bordes del anillo, tres no "+
        "son redibujables y el cuarto no es una frontera sino una costura "+
        "rota. El oeste (lon 35,90) y el norte (lat 36,60) ya siguen la "+
        "costa: los vertices [36,12/36,60] [36,03/36,52] [35,90/36,42] y "+
        "[35,90/36,13] [35,96/36,00] [35,90/35,92] son recorte de costa, no "+
        "dibujo. El este (lon 36,60) es la frontera con Alepo, que entre 1119 "+
        "y 1164 fue una linea de razzia y no de territorio: Artah, Harim y "+
        "Azaz cambiaron de mano una decena de veces, y dibujarlas con dos "+
        "decimales seria inventar. Y el sur (lat 35,80) NO es una frontera: "+
        "es un corte plano que deja un HUECO entre este anillo y el anillo "+
        "meridional del propio principado, cuyo borde norte esta en lat "+
        "35,30. En esos cinco decimos de grado caen Latakia (35,79/35,52), "+
        "que Tancredo tomo en 1108 y que fue una de las cuatro grandes "+
        "ciudades del principado hasta 1188, y Jabala (35,92/35,36), tomada "+
        "en 1109. Comprobado: Latakia no es de NADIE en todo el siglo XII y "+
        "Jabala figura como `seljuk`. Mover el borde sur no es retrazar un "+
        "contorno: es tapar un hueco y quitarle territorio a los selyuquies, "+
        "y eso es una operacion distinta, con su propia comprobacion. Anotada "+
        "en tanda6c.md."
 },
 {
  id:"oyo", tramo:[1535,1615], caja:[3.4,4.3,8.5,9.2],
  razon:"Nucleo yoruba del norte durante el exilio de Igboho. El anillo de "+
        "1600..1615 es un rectangulo literal de cuatro vertices -[3,40/8,50] "+
        "[4,30/8,50] [4,30/9,20] [3,40/9,20]- y el de 1535..1600 es el mismo "+
        "rectangulo con dos esquinas recortadas. Aqui la caja es honesta y el "+
        "contorno seria mentira: Oyo en el exilio no era un territorio con "+
        "linde sino una corte trasladada a Oyo-Igboho (3,75/8,85) en la "+
        "sabana, entre el Niger y los nupe, con una obediencia de jefaturas "+
        "que ninguna fuente cartografia. Johnson y las tradiciones orales dan "+
        "capitales y reinados, no fronteras. PENDIENTE DISTINTO, en "+
        "tanda6c.md: el rectangulo contiene Oyo-Ile (4,13/8,98), que es "+
        "precisamente la capital de la que los nupe los expulsaron hacia 1535 "+
        "y a la que no vuelven hasta Abipa; y el salto de area de 0,45 a 0,63 "+
        "grado2 en 1600 no responde a ningun suceso: es el mismo rectangulo "+
        "al que le han devuelto las esquinas."
 },
 {
  id:"barcelona", tramo:[1129,1149], caja:[1.05,1.45,41.05,41.3],
  razon:"EL PRINCIPADO DE TARRAGONA, 1129-1155. El reparto de esta ronda deja "+
        "Tarragona (1,25/41,12) en manos musulmanas hasta 1149, y hay un "+
        "tramo en que eso es discutible: la sede metropolitana se restaura en "+
        "1091, Ramon Berenguer III entrega la ciudad a san Oleguer en 1118 y "+
        "Oleguer se la infeuda al normando Robert Bordet como principe en "+
        "1129. Pero lo que Bordet tuvo entre 1129 y su muerte no fue el Camp "+
        "de Tarragona: fue la ciudad arruinada y un punado de torres, en una "+
        "franja que las razias almoravides recorrian a voluntad, y el "+
        "poblamiento efectivo del Camp -Reus (1,11/41,15), Valls, Montblanc- "+
        "es de los anios cincuenta del siglo XII: Montblanc se funda en 1163. "+
        "Dibujar un enclave cristiano de 0,03 grado2 alrededor de la ciudad "+
        "entre 1129 y 1149 exigiria fijar los limites de lo que Bordet "+
        "controlaba, y ninguna fuente los da: se conoce la infeudacion, no la "+
        "frontera. La caja registrada es la zona en disputa, no una geometria "+
        "a aplicar. Si algun dia se quiere el matiz, el corte es 1129 y el "+
        "receptor `barcelona`."
 },
 {
  id:"almoravid", tramo:[1145,1149], caja:[0.2,1.37,40.59,41.72],
  razon:"LOS CUATRO ANIOS SIN DUENIO DE LERIDA Y TORTOSA. El reparto devuelve "+
        "la llanura de Lerida, Fraga, Mequinenza, Tortosa, el bajo Ebro y "+
        "Siurana a `almoravid` entre 1110 y 1145, y a `aragon` desde 1149, "+
        "que es cuando caen de verdad. Entre 1145 y 1149 queda un hueco de "+
        "0,84 grado2 y lo dejo declarado en vez de taparlo, porque taparlo "+
        "obliga a elegir entre tres cosas que el mapa no tiene: (1) prolongar "+
        "el arco iberico de `almoravid`, que el mapa cierra a proposito en "+
        "1145 -su ultima fase, 1145..1147, es solo Marruecos, con Fez cayendo "+
        "en 1146 y Marrakech el 20 de abril de 1147-; (2) adelantar "+
        "`almohad`, que no estuvo alli -su anillo peninsular no pasa de lon "+
        "0,24 y los almohades no llegaron nunca al Ebro catalan-; o (3) crear "+
        "una entidad para las segundas taifas y los Banu Ganiya, que es lo "+
        "historicamente correcto -Lerida y Tortosa las gobiernan gobernadores "+
        "almoravides y luego senores locales hasta la conquista- pero es una "+
        "entidad nueva y eso no es trabajo de trazo. El hueco es honesto: "+
        "dice \"aqui hubo un poder que este mapa no representa\", que es "+
        "exactamente la situacion."
 },
 {
  id:"cordoba", tramo:[929,1010], caja:[1.4,2.15,41.2,41.6],
  razon:"EL PENEDES ENTRE OLERDOLA (929) Y LA RAZIA DE 1010. El tramo T1 de "+
        "esta ronda mantiene el Penedes -Vilafranca (1,70/41,35), Olerdola "+
        "(1,71/41,30)- en manos musulmanas de 801 a 1010, y hay ochenta anios "+
        "en que eso se puede discutir: Sunyer refortifica Olerdola en 929 y "+
        "con ella los condes se asoman al otro lado del Llobregat. Pero "+
        "Olerdola no era una frontera, era un castillo en un despoblado: la "+
        "comarca queda arrasada por Almanzor en 985, y las cartas de "+
        "poblacion del Penedes son del siglo XI. Bajar la linea del Llobregat "+
        "al Foix o al Gaia en 929 diria que el condado ocupaba el Penedes, y "+
        "lo que tenia era una atalaya. Mantener el Llobregat hasta 1010 es la "+
        "lectura conservadora y la unica que se puede defender con un mapa. "+
        "Queda anotado que si se quiere el matiz, el corte es 929 y afecta "+
        "solo a `franks` 929..987 y a `barcelona` 987..1010."
 },
];

function legitima(id, ini, fin, caja){
 for(const e of CAJAS){
  if(e.id!==id)continue;
  if(e.tramo && !(ini<e.tramo[1] && fin>e.tramo[0]))continue;
  if(e.caja && caja){
   // el anillo tiene que estar contenido en la caja registrada, con holgura
   const h=0.6;
   if(!(caja[0]>=e.caja[0]-h && caja[1]<=e.caja[1]+h &&
        caja[2]>=e.caja[2]-h && caja[3]<=e.caja[3]+h))continue;
  }
  return e;
 }
 return null;
}

module.exports = { CAJAS, legitima };
