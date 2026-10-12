// LOS SUSTRATOS QUE FALTAN.
//
// rellena_huecos.js tapa el suelo que ALGUNA area cultural cubrio antes. Lo
// que queda despues -los "huecos sin regla"- es suelo que ninguna entidad del
// mapa cubrio nunca en esa era, y eso no se arregla con geometria: falta una
// entidad. Esta tabla las propone, cada una con su tramo, su recipe de forma
// (bioma de Koppen, region de Natural Earth, caja de trabajo: la misma
// gramatica que ambitos_*.js) y el motivo. Son FONDOS: ceden a cualquier
// estado y a cualquier area cultural ya existente (van las ultimas en el
// orden de tablas), asi que solo pintan donde hoy no pinta nadie.
//
// Los nombres dicen lo que el mapa sabe y no mas: "cazadores y recolectores
// de X" para la prehistoria, "pueblos de X" para despues. Si para una region
// hay una entidad mejor (un nombre propio, una fecha mejor), esa entrada se
// borra de aqui y se anade como entidad normal.
//
//   JSX=<mapa> node anade_entidades.js faltan.js --aplica     crea las entidades (anillo = caja)
//   JSX=<mapa> IGNORA=2 node remodela_fisico.js faltan.js --aplica   les da forma y resta a todos
//
// Columnas: id, name, etiqueta (rotulo corto), color, wikiTitle, start, end,
// y las filas de forma: region | bioma | caja, lado, modo (como en ambitos_*.js).
module.exports = [
 // --- la prehistoria de Asia oriental y central (-10000 hasta que arrancan los pueblos con nombre) ---
 { id:'cazadores_asia_oriental', name:'Cazadores, recolectores y primeros agricultores de Asia oriental', etiqueta:'Asia oriental prehistórica', color:'#8C7B6B', wikiTitle:'Neolítico de China',
   start:-10000, end:-1900,   // hasta china_norte_pueblos (-1900) y china_sur_pueblos
   forma:[ { bioma:'continental|subtropical|taiga|estepa|monzon', caja:[95,135,18,54] } ],
   motivo:'1.003 g2 de media sin dueno entre -10000 y -3000 en China, Mongolia y Manchuria: Yangshao, Hemudu, Hongshan no tienen sustrato debajo.' },
 { id:'cazadores_asia_central', name:'Cazadores y pastores de la estepa y los oasis de Asia central', etiqueta:'Asia central prehistórica', color:'#A3906C', wikiTitle:'Cultura de Andrónovo',
   start:-10000, end:-1900,   // hasta turan_oasis_estepa (-1900) y saka
   forma:[ { bioma:'estepa|desierto|continental', caja:[46,95,35,56] } ],
   motivo:'Kelteminar, Botai, Afanasievo: la estepa entre el Caspio y el Altai no tiene nadie antes del -1900.' },
 { id:'cazadores_tibet', name:'Cazadores y pastores de la meseta tibetana', etiqueta:'Tíbet prehistórico', color:'#9C8A9E', wikiTitle:'Historia del Tíbet',
   start:-10000, end:-1500,   // hasta tibet_antiguo
   forma:[ { region:'PLATEAU OF TIBET' }, { bioma:'tundra|estepa', caja:[78,104,27,40], modo:'suma' } ],
   motivo:'La meseta esta vacia hasta tibet_antiguo (-1500).' },
 // --- la estepa kazaja, en todas las eras (el hueco mas constante del mapa) --------------------
 { id:'estepa_kazaja_pueblos', name:'Pueblos nómadas de la estepa kazaja', etiqueta:'Estepa kazaja', color:'#B09A5B', wikiTitle:'Estepa kazaja',
   start:-1900, end:1446,     // de Andronovo a los kazajos (kazajos_nomadas 1446)
   forma:[ { bioma:'estepa|desierto|continental', caja:[46,88,40,55] } ],
   motivo:'Entre 45 y 88 E, 38 y 48 N quedan 100-170 g2 sin dueno en cada era hasta 1446: saka, kangyu, turcos occidentales y kipchakos solo cubren trozos.' },
 // --- la meseta irani y el Indostan: lo que queda entre reinos ---------------------------------
 { id:'meseta_irani_pueblos', name:'Pueblos de la meseta iraní y el Jorasán', etiqueta:'Meseta iraní', color:'#A67C52', wikiTitle:'Meseta iraní',
   start:-3000, end:1925,     // hasta el Iran moderno
   forma:[ { region:'PLATEAU OF IRAN' }, { bioma:'desierto|estepa|mediterraneo', caja:[44,70,25,40], modo:'suma' } ],
   motivo:'Entre -1000 y 1500 quedan 120-300 g2 por era entre Persia, los kanatos y los sultanatos: Sistan, Kermán, el Jorasán rural.' },
 { id:'indostan_pueblos', name:'Pueblos campesinos y tribales del subcontinente indio', etiqueta:'Indostán rural', color:'#B5895A', wikiTitle:'Historia de la India',
   start:-262, end:1947,      // desde que acaba gangetico_pueblos hasta la independencia
   forma:[ { bioma:'sabana|monzon|subtropical|estepa|selva', caja:[66,93,6,35] } ],
   motivo:'Entre reinos (500..1000: 265 g2 de media; 1300..1500: 74) el interior del Decan, el Rajastán y el Chota Nagpur quedan vacios.' },
 // --- las Americas antes de los sustratos regionales -------------------------------------------
 { id:'cazadores_norteamerica', name:'Cazadores y recolectores de Norteamérica', etiqueta:'Norteamérica paleoindia', color:'#8A9A6B', wikiTitle:'Periodo Arcaico (América)',
   start:-10000, end:-1000,   // los sustratos regionales (dene, cree, bosques, praderas) arrancan entre -8000 y -1000
   forma:[ { bioma:'taiga|continental|estepa|subtropical|tundra|oceanico|mediterraneo|desierto', caja:[-168,-52,25,72] } ],
   motivo:'507 g2 de media sin dueno entre -10000 y -3000 en Canada y el norte de Estados Unidos.' },
 { id:'cazadores_sudamerica', name:'Cazadores y recolectores de Sudamérica', etiqueta:'Sudamérica precerámica', color:'#7E9C7A', wikiTitle:'Poblamiento de América',
   start:-10000, end:-8000,   // los sustratos amazonicos arrancan en -8000
   forma:[ { bioma:'selva|monzon|sabana|subtropical|estepa|desierto|oceanico', caja:[-82,-34,-56,13] } ],
   motivo:'559 g2 sin dueno antes del -8000 entre la Amazonia y el Plata.' },
 { id:'cazadores_mesoamerica', name:'Cazadores y recolectores de Mesoamérica', etiqueta:'Mesoamérica arcaica', color:'#9C8F5A', wikiTitle:'Periodo Arcaico (Mesoamérica)',
   start:-10000, end:-7000,   // hasta mesoamerica_pueblos
   forma:[ { bioma:'sabana|monzon|selva|subtropical|estepa|desierto', caja:[-106,-77,7,24] } ],
   motivo:'92 g2 de media entre -10000 y -7000.' },
 // --- Arabia, Siberia artica y Europa antes de sus sustratos ---------------------------------------
 { id:'cazadores_arabia', name:'Cazadores y pastores neolíticos de Arabia', etiqueta:'Arabia neolítica', color:'#C2A36B', wikiTitle:'Arabia preislámica',
   start:-10000, end:-4000,   // hasta arabia_oasis_pastores / beduinos_arabia
   forma:[ { region:'ARABIAN PENINSULA' }, { bioma:'desierto|estepa|sabana', caja:[32,60,12,34], modo:'suma' } ],
   motivo:'270 g2 sin dueno hasta el -4000; el Rub al-Jali lo quita vacios.js.' },
 { id:'cazadores_siberia', name:'Cazadores y pescadores del norte de Siberia', etiqueta:'Siberia ártica prehistórica', color:'#8FA3A8', wikiTitle:'Pueblos indígenas de Siberia',
   start:-10000, end:-5000,   // hasta samoyedos y los pueblos de la taiga
   forma:[ { bioma:'tundra|taiga', caja:[60,180,60,78] } ],
   motivo:'80 g2 de media en la tundra entre el Obi y el Lena antes del -5000.' },
 { id:'cazadores_europa', name:'Cazadores y recolectores mesolíticos de Europa', etiqueta:'Europa mesolítica', color:'#8E9B8A', wikiTitle:'Mesolítico',
   start:-10000, end:-8000,   // hasta bosque_templado_europeo (-8000)
   forma:[ { bioma:'oceanico|continental|mediterraneo|taiga', caja:[-10,32,36,66] } ],
   motivo:'212 g2 de media entre -10000 y -8000 al oeste del Vístula.' },
];
