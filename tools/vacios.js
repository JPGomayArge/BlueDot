#!/usr/bin/env node
// REGISTRO DE VACÍO DELIBERADO.
//
// Por qué existe. El objetivo del mapa no es que no haya huecos: es que haya
// hueco EXACTAMENTE donde no había nadie. Pero en el mapa el vacío deliberado y
// el vacío por hacer se ven igual, y hasta ahora el criterio vivía disperso en
// los informes de los agentes de cada ronda. Este archivo lo reúne, con la razón
// de cada entrada, para que cualquiera pueda comprobarlo y discutirlo.
//
// No es una lista de exclusión cómoda: es una afirmación sobre el mundo, y por
// eso cada entrada lleva escrito EN QUÉ SE APOYA. Si una entrada está mal, se
// corrige aquí y todas las herramientas lo heredan.
//
// Estructura: { nombre, caja:[lonMin,lonMax,latMin,latMax], desde, razon }
//   `desde` = año en que hay población permanente. El hueco es correcto ANTES de
//             esa fecha. null = nunca poblada de forma permanente en el arco del
//             mapa (-10000 a 2025).
//
//   node vacios.js            lista el registro
//   node vacios.js --csv      lo vuelca en CSV
//
// QUE AFIRMA EXACTAMENTE ESTE REGISTRO, Y QUE NO.
// Afirma que NO HABIA POBLACION PERMANENTE. No afirma que no hubiera soberania.
// Son dos preguntas distintas y conviene no mezclarlas:
//   - Un AREA CULTURAL no debe pintar aqui: representa donde vivia una poblacion,
//     y no vivia ninguna. `beduinos_arabia` pintaba el nucleo del Rub al-Jali
//     desde el -4000; es un error de esta clase y se corrigio en la ronda 35,
//     retirandole 6.767 grados cuadrados de erg.
//   - Un ESTADO MODERNO si puede pintar aqui: el territorio de Arabia Saudi
//     incluye su desierto deshabitado. El mapa pinta quien gobierna, y un Estado
//     gobierna tambien sus vacios.
// Por eso `inventario.js` usa este registro para no contar como TRABAJO PENDIENTE
// un hueco legitimo, pero no obliga a vaciar lo que un Estado si administra.

// ---------------------------------------------------------------------------
// I. ISLAS Y ARCHIPIÉLAGOS DE POBLAMIENTO TARDÍO
// La fecha es la del asentamiento permanente documentado, no la del primer
// avistamiento. Antes de ella el vacío es un hecho, no una laguna del mapa.
const ISLAS=[
 {nombre:"La Espanola y Puerto Rico", caja:[-74.6,-65.3,17.4,20.1], desde:-2600,
  razon:"Modelo bayesiano de Napolitano et al. 2019: Puerto Rico 4655-4305 cal "+
         "BP y La Espanola 4545-3930. Se toma -2600, el extremo antiguo de las "+
         "dos. Barrera-Mordan (Azua) y Maruca son los sitios de referencia."},
 {nombre:"Jamaica", caja:[-78.5,-76,17.6,18.6], desde:800,
  razon:"No hay Arcaico jamaicano conocido: la isla la ocupa la ceramica roja "+
         "ostionoide hacia 650 d.C. (Little River y Alligator Pond). Napolitano "+
         "et al. 2019 modelan 1015-475 cal BP, aun mas tarde. Se toma 800, que "+
         "es cuando la entidad `taino` entra en la isla en el mapa y cae entre "+
         "las dos estimaciones."},
 {nombre:"Delta del Nilo", caja:[30,32.3,30.3,31.6], desde:-5300,
  razon:"El Delta se forma hacia 7.000 AP, cuando el mar alcanza su nivel "+
         "actual, y \"no se ha descrito ningun yacimiento arqueologico anterior a "+
         "7,0 ka en el Delta del Nilo\": los primeros pastores aparecen hacia 7.0 "+
         "ka y los cereales hacia 6.7 ka (Hamdan et al., Communications Earth & "+
         "Environment 3:88, 2022). Antes de eso la llanura estaba bajo "+
         "inundacion permanente o bajo sedimento. El -5300 es el arranque de "+
         "`bajo_egipto_neolitico` (Fayum A, Merimde) en el mapa."},
 // El poblamiento balear es de los mas tardios del Mediterraneo occidental: no
 // hay presencia humana segura antes de ~2400 a.C. (naviforme y talayotico).
 {nombre:'Islas Baleares', caja:[0.9,4.4,38.6,40.2], desde:-2400,
  razon:'Sin presencia humana segura antes del III milenio; el naviforme empieza hacia 1600 a.C.'},
 {nombre:'Islandia', caja:[-25,-13,63,67], desde:870,
  razon:'Landnám nórdico. El Íslendingabók fecha el asentamiento hacia 870-874; antes solo eremitas irlandeses estacionales, sin poblacion permanente.'},
 {nombre:'Feroe', caja:[-8,-6,61,63], desde:800,
  razon:'Asentamiento nordico hacia 800-825. Hay cebada y turba quemada anteriores, del siglo IV al VI, pero sin poblacion continuada.'},
 {nombre:'Nueva Zelanda', caja:[166,179,-48,-34], desde:1250,
  razon:'Llegada polinesia entre 1250 y 1300 segun dataciones de rata kiore y deforestacion; es de los ultimos territorios grandes poblados.'},
 {nombre:'Madagascar', caja:[43,51,-26,-11], desde:400,
  razon:'Austronesios y bantues entre el 350 y el 550. Hay marcas de corte anteriores discutidas, pero sin asentamiento continuado.'},
 {nombre:'Azores', caja:[-32,-24,36,40], desde:1432,
  razon:'Colonizacion portuguesa desde 1432. Deshabitadas antes: no hay evidencia aceptada de ocupacion previa.'},
 {nombre:'Cabo Verde', caja:[-26,-22,14,18], desde:1462,
  razon:'Deshabitadas hasta la colonizacion portuguesa de 1462.'},
 {nombre:'Mascarenas', caja:[55,64,-21,-19], desde:1638,
  razon:'Mauricio, Reunion y Rodrigues deshabitadas hasta el asentamiento neerlandes de 1638.'},
 {nombre:'Malvinas', caja:[-62,-57,-53,-51], desde:1764, hasta:1810,
  razon:'Sin poblacion permanente hasta Port Louis (1764). Restos de zorro warrah, no de humanos.'},
 {nombre:'Bermudas', caja:[-66,-64,32,33], desde:1612,
  razon:'Deshabitadas hasta el asentamiento ingles de 1612.'},
 {nombre:'Santa Elena y Ascension', caja:[-15,-5,-17,-7], desde:1502,
  razon:'Deshabitadas hasta el descubrimiento portugues; asentamiento efectivo en el XVII.'},
 {nombre:'Rapa Nui', caja:[-110,-109,-28,-26], desde:1200,
  razon:'Colonizacion polinesia hacia 1200 segun las dataciones mas aceptadas.'},
 {nombre:'Hawai', caja:[-161,-154,18,23], desde:1000,
  razon:'Colonizacion polinesia entre el 1000 y el 1200.'},
 {nombre:'Svalbard', caja:[9,34,76,81], desde:1920,
  razon:'Terra nullius sin poblacion permanente. Balleneros y cazadores estacionales desde 1596; el Tratado de Svalbard es de 1920 y la administracion noruega de 1925.'},
 {nombre:'Jan Mayen', caja:[-9,-7,70,72], desde:1921,
  razon:'Sin poblacion permanente; estacion noruega desde 1921.'},
 {nombre:'Tierra de Francisco Jose', caja:[44,66,79,82], desde:null,
  razon:'Descubierta en 1873, sin poblacion permanente en el arco del mapa.'},
 {nombre:'Severnaya Zemlia', caja:[90,108,78,82], desde:null,
  razon:'Ultimo archipielago grande cartografiado del planeta (1913-1932). Sin poblacion permanente.'},
 {nombre:'Nueva Zembla septentrional', caja:[52,62,74,77], desde:null,
  razon:'La isla norte carece de poblacion permanente; los nenets ocupaban estacionalmente la isla sur.'},
 // Tercer fallo de caja gruesa de este archivo, encontrado por el agente de las
 // Americas en la ronda 36: el borde sur en lat 74 recortaba la punta norte de
 // la isla de Banks (74,33 N), que NO es una isla de la Reina Isabel -esas estan
 // al norte del canal de Parry- y que tiene ocupacion pre-Dorset documentada.
 // Se sube el borde a 74,7, que es el canal.
 {nombre:'Islas de la Reina Isabel', caja:[-125,-48,74.7,84], desde:null,
  razon:'Alto Artico canadiense al norte del canal de Parry. Ocupacion paleoesquimal y thule intermitente y no continuada; Grise Fiord y Resolute son reasentamientos forzosos de 1953. El borde sur deja fuera Banks y Victoria, que si estuvieron ocupadas.'},
 // EL ARTICO AMERICANO ANTES DEL PALEOESQUIMAL. Es el vacio legitimo mas grande
 // que le quedaba al mapa antiguo y no estaba registrado: 105 celdas en el
 // inventario de -4000 a -1000, atribuidas a `paleoesquimales`, que no podia
 // pintarlas porque todavia no habia llegado nadie.
 // La tradicion Paleoartica de herramientas pequenas -Independencia I,
 // pre-Dorset, Saqqaq- entra desde Siberia hacia el -2500 y alcanza Groenlandia
 // hacia el -2400. Antes de esa fecha el archipielago artico canadiense, la
 // costa artica continental y Groenlandia entera NO TENIAN POBLACION: es de los
 // pocos sitios del planeta donde el vacio prehistorico esta bien fechado.
 // El subartico continental -bosque de dene y cree- si estaba poblado mucho
 // antes, y queda fuera por el sur de esta caja.
 {nombre:'Artico americano antes del Paleoesquimal', caja:[-140,-18,66,84], desde:-2500,
  razon:'La tradicion artica de herramientas pequenas entra desde Siberia hacia el -2500 y llega a Groenlandia hacia el -2400. Antes no hay poblacion en el archipielago, la costa artica continental ni Groenlandia. El bosque subartico queda al sur de esta caja.'},
 // SEXTO Y SEPTIMO FALLO, encontrados por el agente de Siberia nororiental en la
 // ronda 37. La entrada de arriba dice cubrir el archipielago artico y
 // Groenlandia ENTERA, y su borde sur plano en lat 66 no hace eso en el flanco
 // oriental: deja fuera Southampton, Coats, Mansel y la mitad sur de Baffin;
 // deja fuera Nunavik; y deja fuera el suroeste de Groenlandia, que baja a 59,8
 // en el cabo Farewell. El arreglo NO es bajar el borde sur de la caja entera:
 // entre lon -140 y -95 el bosque boreal de dene y cree llega a lat 60 y estaba
 // poblado. Hacen falta entradas aparte, cenidas al este. Y faltaban por omision
 // las islas de Nueva Siberia. Las cuatro se comprobaron celda a celda.
 {nombre:'Islas de la bahia de Hudson y sur de Baffin', caja:[-87,-64,62,66], desde:-2500,
  razon:'Southampton, Coats, Mansel, Nottingham y la mitad sur de Baffin hasta la isla Resolution. Archipielago artico: primera ocupacion predorset. El borde sur en lat 62 deja fuera la peninsula de Ungava continental.'},
 {nombre:'Nunavik, tundra al norte del limite del bosque', caja:[-78,-70,59,62], desde:-2500,
  razon:'Quebec al norte del limite septentrional de los arboles, que va de 56 N en la bahia de Hudson a 58 N en la de Ungava. Primeros ocupantes predorset. El borde sur en 59 deja fuera lo que `cree_innu` ya pinta, cuyo limite norte esta en 58,8.'},
 {nombre:'Groenlandia meridional', caja:[-54,-42,59,66], desde:-2500,
  razon:'Prolongacion sur de la entrada anterior: el Saqqaq llega hacia el -2400 y antes no hay poblacion. La caja de lat 66 la dejaba fuera, de modo que el registro no cubria Groenlandia entera pese a decirlo. El borde oeste en lon -54 deja fuera el Labrador.'},
 {nombre:'Islas de Nueva Siberia', caja:[136,158,73,77], desde:null,
  razon:'Liajovski, Kotelny y Nueva Siberia. Sin poblacion permanente: descubiertas en 1712, solo caza estacional de marfil de mamut; el yacimiento de Zhojov es del Holoceno inicial y quedo abandonado. Mismo caso que Severnaya Zemlia y Tierra de Francisco Jose.'},
];

// ---------------------------------------------------------------------------
// II. DESIERTOS ABSOLUTOS
// El criterio no es "es desierto" sino "no hay agua permanente y por tanto no
// hay poblacion fija". Por eso el Ennedi NO esta aqui pese a estar en pleno
// Sahara: la guelta de Archei tiene agua todo el ano y los bideyat viven en el
// macizo. La linea util en el Sahel es la isoyeta de los 50 mm.
const DESIERTOS=[
 {nombre:'El Djouf y Majabat al-Koubra', caja:[-8,-1,19,24],
  poly:[[-7.6,21],[-7.4,22.4],[-6.6,23.4],[-5.2,24],[-3.4,24.1],[-1.8,23.6],[-1.1,22.6],[-1.2,21.2],[-2,20],[-3.4,19.3],[-5,19.2],[-6.4,19.7],[-7.3,20.3]], desde:-12800, hasta:-3500,
  razon:'Sin un solo pozo permanente entre el Adrar y Taudeni. Documentado en la ronda 33.'},
 {nombre:'Erg Chech y Tanezrouft', caja:[-4,4,21,27],
  poly:[[-4.2,24.5],[-3.6,26.2],[-2.4,27.1],[-0.6,27.2],[1.2,26.6],[2.6,25.4],[3.8,24],[4.1,22.6],[3.2,21.4],[1.6,20.9],[-0.4,21],[-2.2,21.8],[-3.6,22.9]], desde:-12800, hasta:-3500,
  razon:'Erg y reg sin agua; el Tanezrouft se llama la tierra del terror por carecer de pozos.'},
 {nombre:'Tenere y Erg de Bilma', caja:[10,17,16,21],
  poly:[[10.2,18.6],[10.6,20.2],[11.6,21.1],[13.4,21.2],[15.2,20.6],[16.6,19.6],[17,18.2],[16.4,16.8],[15,16.1],[13.2,15.9],[11.6,16.4],[10.5,17.4]], desde:-12800, hasta:-3500,
  razon:'Sin poblacion fija fuera de los oasis de Bilma y Fachi, que quedan fuera de esta caja.',
  salvo:[[12.6,13.3,18.3,19.1],[11.3,11.9,17.9,18.4]]},
 {nombre:'Djourab y Bodele', caja:[16,19,15,17],
  poly:[[16.1,16.2],[16.8,17],[17.9,17.1],[18.9,16.5],[19.1,15.6],[18.4,15],[17.2,14.9],[16.3,15.4]], desde:-12800, hasta:-3500,
  razon:'Fondo del paleolago Chad desecado; fuente principal de polvo del planeta, sin poblacion.'},
 {nombre:'Desierto Libico oriental', caja:[25,31,19,24],
  poly:[[25.1,21.8],[25.4,23.3],[26.4,24.1],[28,24.2],[29.6,23.6],[30.8,22.5],[31.1,20.9],[30.2,19.5],[28.6,18.9],[26.8,19.2],[25.5,20.2]], desde:-12800, hasta:-3500,
  razon:'Menos de 5 mm de lluvia al ano desde que el Wadi Howar se seco hacia el -1000.'},
 // El Rub al-Jali va en DOS cajas y no en una. La caja unica [45,56,17,23] que
 // tuvo este registro hasta la ronda 35 se comia la costa poblada de Dhofar
 // -Salalah esta en 54,1/17,0 y el Yebel Qara llega a lat 17,5-, de modo que
 // declaraba deshabitado un sitio que lleva milenios poblado y que fue el puerto
 // del incienso. Lo detecto el agente de Oriente Medio de la ronda 35, que
 // prefirio respetar el registro antes que corregirlo por su cuenta y dejarlo
 // anotado; tenia razon. Es el segundo fallo de este archivo y la misma leccion:
 // una caja gruesa afirma cosas que nadie ha comprobado.
 {nombre:'Rub al-Jali (nucleo)', caja:[45,56,18,23],
  poly:[[45.2,20.4],[45.8,21.9],[47.4,22.9],[49.6,23.2],[52,22.9],[54.2,22.2],[55.8,21],[56.1,19.6],[55,18.4],[52.6,17.9],[50,18],[47.6,18.6],[45.8,19.4]], desde:null,
  razon:'Mayor mar de arena continuo del mundo, sin poblacion permanente; los beduinos lo bordean. El borde sur se detiene en lat 18 para no invadir el Dhofar.'},
 {nombre:'Rub al-Jali (lobulo suroeste)', caja:[45,52.5,17,18],
  poly:[[45.2,17.6],[46.6,18],[48.8,18.1],[51,17.9],[52.4,17.5],[51.6,17.05],[49.2,16.95],[46.8,17.1]], desde:null,
  razon:'Prolongacion del erg hacia el Hadramaut. Se corta en lon 52,5 para dejar fuera Dhofar y el Yebel Qara, poblados desde la antiguedad.'},
 {nombre:'Dasht-e Lut', caja:[57,61,29,32],
  poly:[[57.2,30.4],[57.6,31.4],[58.6,32],[59.9,31.9],[60.8,31.2],[61,30.1],[60.2,29.2],[58.8,28.9],[57.6,29.4]], desde:null,
  razon:'Temperatura de superficie mas alta medida en la Tierra; sin agua ni poblacion.'},
 // Quinto fallo de caja gruesa, encontrado por el agente de la estepa en la
 // ronda 37, y el mas embarazoso: la razon escrita en la entrada decia que el
 // corredor de oasis quedaba fuera, y la caja [78,90,36,42] se tragaba Kucha
 // (82,94/41,71), Aksu (80,26/41,17) y Korla (86,15/41,76), que son justamente
 // tres de esos oasis. No ocultaba ningun hueco porque `tarim_pueblos` los pinta,
 // pero afirmaba una falsedad. El borde norte baja a lat 41,0 entre lon 78 y 88.
 // Al corregir el borde norte quedaba dentro Jotan (79,92/37,11), y con el
 // siguiente intento, Cherchen (85,5/38,14). Los oasis del Tarim NO rodean el erg
 // por un lado: lo rodean entero, pegados al pie de las montanas, y cualquier
 // caja generosa se come alguno. La caja queda reducida al mar de dunas central.
 {nombre:'Taklamakan', caja:[80,87,38.5,40.5],
  poly:[[80.2,39.4],[81,40.1],[82.6,40.4],[84.4,40.4],[86,40],[86.9,39.4],[86.2,38.8],[84.4,38.5],[82.4,38.6],[80.8,38.9]], desde:null,
  razon:'Mar de dunas central, sin agua ni poblacion. TODO el corredor de oasis queda fuera: Kasgar, Yarkand y Jotan por el suroeste, Keriya, Niya y Cherchen por el sur, Aksu, Kucha y Korla por el norte, Turfan por el este.'},
 {nombre:'Lop Nur y Kuruktag', caja:[88,92,39,42],
  poly:[[88.2,40.2],[88.6,41.3],[89.6,41.9],[91,41.8],[91.9,41],[91.8,39.8],[90.8,39.1],[89.4,39.2],[88.5,39.6]], desde:null,
  razon:'Costra salina y desierto de guijarros. Documentado en la ronda 33.'},
 // Cuarto fallo de caja gruesa, del mismo agente y la misma ronda: el borde
 // oriental en lon -68 se comia la precordillera de Tarapaca y el altiplano
 // chileno -Camina hacia -69,4/-19,3 e Isluga hacia -68,8/-19,25-, poblados
 // desde el Formativo. El nucleo hiperarido es la pampa del Tamarugal y la
 // depresion intermedia, no la precordillera.
 {nombre:'Atacama absoluto', caja:[-70.5,-69.2,-26,-20],
  poly:[[-70.4,-22.6],[-70.2,-24.4],[-69.9,-25.6],[-69.5,-25.9],[-69.25,-24.8],[-69.3,-22.8],[-69.5,-21.2],[-69.8,-20.2],[-70.2,-20.4],[-70.4,-21.4]], desde:null,
  razon:'Nucleo hiperarido de la depresion intermedia y la pampa del Tamarugal, sin lluvia registrada en siglos. La precordillera, el altiplano y los oasis de Pica, Camina e Isluga quedan fuera por el este; la costa, por el oeste.',
  salvo:[[-69.6,-69.2,-20.7,-20.3]]},
 {nombre:'Namib costero', caja:[11,16,-27,-18],
  poly:[[11,-18.2],[11,-27],[15.9,-27],[15.6,-25.4],[15,-23.6],[14.4,-21.8],[13.8,-20.2],[13.2,-18.4]], desde:null,
  razon:'Duna y grava sin agua superficial; los topnaar del Kuiseb quedan fuera de la caja.',
  salvo:[[14.3,15.4,-23.7,-22.9]]},
 {nombre:'Gran Desierto Victoria interior', caja:[124,132,-30,-26],
  poly:[[124.2,-27.6],[124.8,-29.2],[126.4,-29.9],[128.4,-30],[130.4,-29.5],[131.7,-28.4],[131.9,-27],[130.8,-26.1],[128.6,-25.9],[126.4,-26.3],[124.8,-26.9]], desde:null,
  razon:'Nucleo sin aguadas permanentes. Los pueblos del Desierto Occidental ocupaban los corredores de aguadas, fuera de esta caja.'},
 {nombre:'Gran Rann de Kutch', caja:[68,71,23,25],
  poly:[[68.2,23.8],[68.5,24.6],[69.4,24.9],[70.4,24.7],[71,24.1],[70.6,23.4],[69.6,23.1],[68.6,23.2]], desde:null,
  razon:'Marisma salina inundable, sin poblacion fija. Documentado en la ronda 33.'},
];

// ---------------------------------------------------------------------------
// III. HIELO Y ALTA MONTANA
// Por encima del limite de la nieve permanente no hay poblacion. Los valles
// habitados quedan fuera de estas cajas a proposito.
const HIELO=[
 {nombre:'Antartida', caja:[-180,180,-90,-60], desde:null,
  razon:'Sin poblacion indigena ni permanente; las bases son rotatorias.'},
 {nombre:'Casquete de Groenlandia', caja:[-48,-25,66,82], desde:null,
  razon:'Inlandsis de hasta 3 km de espesor. El poblamiento inuit es litoral y queda fuera.'},
 {nombre:'Karakorum y Siachen', caja:[75,78,35,37],
  poly:[[75.3,35.8],[75.6,36.6],[76.4,37],[77.4,36.9],[78,36.3],[77.7,35.5],[76.8,35.1],[75.8,35.2]], desde:null,
  razon:'Baltoro, K2 y el glaciar Siachen. Los valles de Shimshal, Khaplu y Nubra quedan fuera.'},
 {nombre:'Aksai Chin', caja:[78,80,34,36],
  poly:[[78.2,34.9],[78.5,35.6],[79.3,36],[80,35.6],[80.1,34.8],[79.5,34.2],[78.7,34.3]], desde:null,
  razon:'Desierto de altura a 5.000 m sin poblacion permanente ni via de paso habitada.'},
 {nombre:'Qiangtang', caja:[82,89,32,35],
  poly:[[82.4,33.2],[82.8,34.3],[83.8,34.9],[85.4,35.1],[87,34.9],[88.4,34.3],[88.8,33.3],[88.2,32.4],[86.8,31.9],[85,31.8],[83.4,32.2]], desde:null,
  razon:'Meseta interior tibetana sin asentamiento permanente; el pastoreo nomada llega por el borde.'},
 // Anadida en la ronda 38 al medir el hueco tibetano: la cuenca del Qaidam es
 // costra salina y lago seco a 2.700 m, sin poblacion fija fuera de los oasis del
 // borde -Dulan, Golmud es de 1954-. Explicaba una parte del vacio de lat 36-38
 // entre lon 90 y 98 que el inventario contaba como trabajo pendiente.
 {nombre:'Cuenca del Qaidam', caja:[91,97,36,38],
  poly:[[91.4,37],[92,37.7],[93.4,38.1],[95,38.1],[96.4,37.6],[96.9,36.9],[96.2,36.3],[94.6,36],[93,36.2],[91.8,36.5]], desde:null,
  razon:'Costra salina, lagos secos y yardangs a 2.700 m. Sin poblacion fija; los oasis del borde meridional y de Dulan quedan fuera por el sur.'},
];

// El orden importa: `legitimo` devuelve la PRIMERA coincidencia, asi que lo mas
// especifico va delante. Un punto del casquete groenlandes cae tambien dentro de
// la caja de Groenlandia, y debe ganar el casquete. Este archivo ya tuvo ese
// fallo una vez: una entrada de "Groenlandia habitable" con `desde:-2500` puesta
// entre las islas enmascaraba al hielo para todo el arco posterior al -2500.
// EL CASQUETE LAURENTINO (ronda 54). Era la omision mas grande del registro y
// afectaba a media Norteamerica: entre el -10000 y el -4500 hay una superficie
// enorme de Canada que estaba bajo el hielo y que el inventario contaba como
// trabajo pendiente. Explica 317 de las celdas de hueco americano a -8000, y
// explica tambien por que `dene` empieza en -6000 y `cree_innu` en -7000: no es
// conservadurismo, es que su mitad oriental estaba debajo del casquete.
const LAURENTIDE=[
 {nombre:'Cupula del Nuevo Quebec', caja:[-78,-63,51,58], desde:-4800,
  razon:'Ultimo hielo del Quebec-Labrador; desaparece hacia 6.800 cal AP.'},
 {nombre:'Cupula del Keewatin y Barren Grounds', caja:[-105,-92,60,68], desde:-4500,
  razon:'Deglaciacion 7.000-6.500 cal AP. Es la cola oriental del contorno dene.'},
 {nombre:'Bahia de Hudson y tierras bajas', caja:[-95,-78,51,60], desde:-5000,
  razon:'El hielo se parte hacia 8.000 AP; el mar de Tyrrell alcanza su maximo hacia 7.000 AP y las tierras bajas emergen despues.'},
 {nombre:'Nucleo del manto escandinavo', caja:[14,21,65,69], desde:-8000,
  razon:'El manto no desaparece hasta ~8.900 BP y su ultimo resto, en Sarek, hasta ~9,7 ka cal AP.'},
 {nombre:'Terranova', caja:[-59.5,-52.5,46.5,51.8], desde:-3500,
  razon:'El Arcaico Maritimo llega a la isla hacia 5.500 AP; antes esta vacia.'},
 // Las Antillas: el registro no tenia ni una entrada del Caribe, y eran 25
 // celdas contadas como pendientes durante todo el arco del mapa.
 {nombre:'Antillas Mayores', caja:[-85,-74,19.6,23.6], desde:-3400,
  razon:'Ninguna Antilla se puebla antes de ~7.000 AP; Banwari Trace en Trinidad es lo mas antiguo del arco caribeno.'},
 {nombre:'Bahamas y Lucayas', caja:[-79.5,-70.8,20.5,27.3], desde:800,
  razon:'Los lucayos llegan hacia 800; antes las islas estan vacias.'},
];

const TODO=[...HIELO,...LAURENTIDE,...DESIERTOS,...ISLAS];

// EL CAMPO `hasta` (ronda 54). Hasta ahora el registro solo sabia decir "vacio
// hasta tal anio". Eso no puede describir un sitio que se poblo y VOLVIO a
// vaciarse, y el Sahara es exactamente eso: el Periodo Humedo Africano lo hizo
// habitable entre ~14.800 y ~5.500 BP, con Gobero y los pescadores del Tenere
// dentro, y despues volvio a ser hiperarido. Las cinco cajas saharianas decian
// `desde:null` -"nunca poblada"-, que es falso durante seis mil anios.
//
//   desde  = anio en que empieza la poblacion permanente (null = nunca)
//   hasta  = anio en que termina (ausente = sigue hasta hoy)
//
// El hueco es legitimo ANTES de `desde` y DESPUES de `hasta`.
// UNA SOLA FUNCION DECIDE, Y LAS DOS DE FUERA LA LLAMAN. `legitimo` y `cual`
// respondian a la misma pregunta con dos copias de la misma expresion, y ya
// divergieron una vez: al anadir `hasta`, `cual` no se actualizo y las cinco
// cajas saharianas salian como vacio legitimo sin poder decir por que. Con una
// sola implementacion eso no puede repetirse.
//
// `poblado:[[a,b],...]` es la forma general y admite cuantas transiciones haga
// falta. `desde`/`hasta` siguen valiendo y se traducen a ella:
//   desde D, hasta null  ->  poblado [[D, +inf)]
//   desde D, hasta H     ->  poblado [[D, H]]
//   desde null, hasta H  ->  poblado [(-inf, H]]
//   desde null, hasta null -> poblado []   (nunca)
// Hacia falta porque hay sitios con mas de dos cambios y no se podian expresar:
// las Malvinas se pueblan, se despueblan y se vuelven a poblar; el desierto
// libico se habita en el periodo humedo, se vacia al desecarse y vuelve a tener
// poblacion permanente con los oasis. Una caja con una sola fecha convertia
// cualquiera de esas historias en una mentira a medias.
function vacioEn(e,anio){
 if(e.poblado) return !e.poblado.some(([a,b])=>anio>=a && (b==null||anio<=b));
 return e.desde===null ? (e.hasta==null || anio>e.hasta)
      : (anio<e.desde || (e.hasta!=null && anio>e.hasta));
}
// LO QUE LA RAZON DICE QUE QUEDA FUERA, TIENE QUE QUEDAR FUERA DE VERDAD.
//
// Varias entradas nombran en su texto las excepciones -"todo el corredor de
// oasis queda fuera", "los oasis de Pica, Camina e Isluga quedan fuera por el
// este", "los topnaar del Kuiseb quedan fuera de la caja"- y en la geometria no
// estaban. Mientras el registro solo servia para que las metricas ignorasen un
// hueco, la diferencia no hacia dano. En cuanto `despuebla.js` empezo a hacerlo
// cumplir, **Bilma se quedo sin poblacion**: un oasis del Kawar habitado sin
// interrupcion, con caravanas de sal documentadas desde el siglo X, dentro de
// una caja cuya propia razon dice que lo excluye.
//
// `salvo:[caja,...]` mete esas excepciones en la geometria. Una razon escrita
// que la maquina no puede comprobar acaba divirgiendo de lo que la maquina
// hace; es la misma leccion que `legitimo` y `cual`, una capa mas arriba.
function enPoly(pt,r){ let d=false;
 for(let i=0,j=r.length-1;i<r.length;j=i++)
  if((r[i][1]>pt[1])!==(r[j][1]>pt[1]) && pt[0]<(r[j][0]-r[i][0])*(pt[1]-r[i][1])/(r[j][1]-r[i][1])+r[i][0]) d=!d;
 return d }
function enCaja(pt,c){ return pt[0]>=c[0]&&pt[0]<=c[1]&&pt[1]>=c[2]&&pt[1]<=c[3] }
function cubre(e,pt){
 if(!enCaja(pt,e.caja))return false;
 if(e.poly && !enPoly(pt,e.poly))return false;
 if(e.salvo)for(const c of e.salvo) if(enCaja(pt,c))return false;
 return true;
}
function legitimo(pt,anio){
 for(const e of TODO) if(cubre(e,pt)) return vacioEn(e,anio);
 return false;
}
// `cual` NO SE ACTUALIZO AL ANADIR `hasta`, y por eso devolvia null justo
// cuando `legitimo` devolvia true por el campo nuevo: las cinco cajas
// saharianas salian como "vacio legitimo" sin poder decir POR QUE, en todo el
// arco posterior al -3500. Dos funciones que responden a la misma pregunta
// tienen que responder lo mismo; si una cambia, la otra tambien.
function cual(pt,anio){
 for(const e of TODO) if(cubre(e,pt)) return vacioEn(e,anio) ? e : null;
 return null;
}
// Intervalos de VACIO de una entrada, dentro del arco del mapa. Lo necesita
// `despuebla.js` para saber en que tramos hay que quitarle el suelo al sustrato.
function vacios(e,ini,fin){
 ini=ini==null?-10000:ini; fin=fin==null?2025:fin;
 const out=[]; let a=null;
 for(let y=ini;y<=fin;y++){
  const v=vacioEn(e,y);
  if(v&&a===null)a=y;
  if(!v&&a!==null){out.push([a,y]);a=null}
 }
 if(a!==null)out.push([a,fin+1]);
 return out;
}
module.exports={ISLAS,DESIERTOS,HIELO,TODO,legitimo,cual,vacioEn,vacios,cubre,enCaja};

if(require.main===module){
 if(process.argv.includes('--csv')){
  console.log('grupo,nombre,lonMin,lonMax,latMin,latMax,poblada_desde,razon');
  const g=[[ISLAS,'isla'],[DESIERTOS,'desierto'],[HIELO,'hielo']];
  for(const [arr,nom] of g)for(const e of arr)
   console.log([nom,JSON.stringify(e.nombre),...e.caja,e.desde===null?'nunca':e.desde,
                JSON.stringify(e.razon)].join(','));
 }else{
  for(const [arr,tit] of [[ISLAS,'ISLAS Y ARCHIPIELAGOS DE POBLAMIENTO TARDIO'],
                          [DESIERTOS,'DESIERTOS ABSOLUTOS'],[HIELO,'HIELO Y ALTA MONTANA']]){
   console.log('\n=== '+tit+' ('+arr.length+')');
   for(const e of arr){
    console.log('  '+e.nombre.padEnd(32),
     (e.desde===null?'nunca poblada':'poblada desde '+e.desde).padEnd(22),
     '['+e.caja.join(', ')+']');
    console.log('      '+e.razon);
   }}
  console.log('\ntotal de entradas:',TODO.length);
 }
}
