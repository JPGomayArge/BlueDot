// AMERICA DEL NORTE POR BIOMAS, REGIONES Y RIOS.
//
// Natural Earth nombra casi todo aqui: el Escudo Canadiense, las Grandes
// Llanuras, la Gran Cuenca, los Apalaches, la Llanura Costera, la Tierra
// Baja Central, los Brooks, los Mackenzie. El clima pone la tundra para los
// inuit, la taiga para dene, cree e innu, la costa oceanica para la costa
// noroeste, el mediterraneo para California. Y los rios que de verdad
// separaban pueblos: el Ohio entre los bosques y el sureste, el Misuri y el
// Arkansas entre praderas, el Peace y el Athabasca entre dene y cree, el
// Misisipi, el Gila, el Colorado, el Fraser.
//
// LA REGLA: cada lado lo pone un bioma, una region, un rio o un vecino ya
// rehecho; las cajas van anchas. Lo unico recto que queda a proposito es el
// meridiano 141 entre Alaska y el Yukon, que el mapa ya tiene como frontera
// de los estados. ORDEN (IGNORA=2): primero lo definido por algo propio, al
// final los fondos. Relevos: norte_alaska_antiguo -> alaska_oeste (-1000),
// paleoesquimales -> inuit (1200), subartico_este -> cree_innu (1670).
module.exports = [
 // --- Artico: los regionales primero (costa de Bering, Ungava y Labrador, la
 //     tundra continental), y los dos horizontes -paleoesquimales, inuit- con
 //     el archipielago, Groenlandia, la costa norte de Alaska y lo que sobre ----
 { id:'norte_alaska_antiguo', region:'NORTH SLOPE', guarda:false },
 { id:'norte_alaska_antiguo', region:'BROOKS RANGE', modo:'suma' },
 { id:'alaska_oeste', bioma:'tundra', caja:[-168,-150,58,68], guarda:false },          // Seward y el delta del Yukon-Kuskokwim
 { id:'arctico_oriental', region:'PÉNINSULE D’UNGAVA', guarda:false },
 { id:'arctico_oriental', bioma:'tundra', caja:[-80,-54,53,63], modo:'suma' },          // la costa del Labrador
 { id:'artico_canadiense', region:'Melville Peninsula', guarda:false },
 { id:'artico_canadiense', bioma:'tundra', caja:[-141,-80,58,72], modo:'suma' },        // la tundra continental, de los Barren Grounds a la bahia de Hudson
 { id:'paleoesquimales', region:'ARCTIC ARCHIPELAGO', guarda:false },
 { id:'paleoesquimales', region:'QUEEN ELIZABETH ISLANDS', modo:'suma' },
 { id:'paleoesquimales', region:'GREENLAND', modo:'suma' },                              // el hielo lo quita vacios.js: queda la costa
 { id:'paleoesquimales', region:'NORTH SLOPE', modo:'suma' },
 { id:'paleoesquimales', bioma:'tundra|hielo', caja:[-168,-18,53,84], modo:'suma' },
 { id:'inuit', region:'GREENLAND', guarda:false },
 { id:'inuit', region:'ARCTIC ARCHIPELAGO', modo:'suma' },
 { id:'inuit', region:'QUEEN ELIZABETH ISLANDS', modo:'suma' },
 { id:'inuit', region:'NORTH SLOPE', modo:'suma' },
 { id:'inuit', bioma:'tundra|hielo', caja:[-168,-18,53,84], modo:'suma' },
 // --- Alaska, la costa del Pacifico, las mesetas ----------------------------------
 { id:'alaska_interior', region:'YUKON PLATEAU', guarda:false },
 { id:'alaska_interior', region:'Yukon Flats', modo:'suma' },
 { id:'alaska_interior', region:'ALASKA RANGE', modo:'suma' },
 { id:'alaska_interior', bioma:'taiga|continental|tundra', caja:[-168,-141,58,70], modo:'suma' },
 { id:'costa_noroeste', region:'COAST MOUNTAINS', guarda:false },
 { id:'costa_noroeste', region:'CASCADE RANGE', modo:'suma' },
 { id:'costa_noroeste', region:'COAST RANGES', caja:[-125,-119,42,49], modo:'suma' },
 { id:'costa_noroeste', region:'Vancouver Island', modo:'suma' },
 { id:'costa_noroeste', region:'Alexander Archipelago', modo:'suma' },
 { id:'costa_noroeste', caja:[-133.5,-130.5,51.8,54.5], modo:'suma' },   // Haida Gwaii: el clima a medio grado no ve la isla
 { id:'costa_noroeste', region:'CHUGACH MTS.', modo:'suma' },
 { id:'costa_noroeste', bioma:'oceanico', caja:[-152,-120,40,62], modo:'suma' },        // la franja litoral que las sierras no cubren
 { id:'california_naciones', region:'Central Valley', guarda:false },
 { id:'california_naciones', region:'COAST RANGES', caja:[-125,-116,32,42], modo:'suma' },
 { id:'california_naciones', region:'SIERRA NEVADA', modo:'suma' },
 { id:'california_naciones', bioma:'mediterraneo|oceanico', caja:[-125,-113,32,43], modo:'suma' },
 { id:'california_naciones', bioma:'estepa|desierto', caja:[-121,-116,32,35], modo:'suma' },   // San Diego y el interior seco de la costa sur
 { id:'gran_cuenca', region:'GREAT BASIN', guarda:false },
 { id:'gran_cuenca', region:'COLORADO PLATEAU', modo:'suma' },
 { id:'gran_cuenca', region:'ROCKY MOUNTAINS', caja:[-116,-104,36,46], modo:'suma' },    // Wasatch, Uinta, Wind River: ute y shoshon
 // --- praderas, por rios ----------------------------------------------------------
 { id:'texas_pueblos', region:'Edwards Plateau', guarda:false },   // coahuiltecos: la meseta antes que las praderas del sur
 { id:'praderas_sur', region:'GREAT PLAINS', lado:[['Arkansas','S']], guarda:false },
 { id:'praderas_noroeste', region:'GREAT PLAINS', lado:[['Missouri','N']], guarda:false },
 { id:'llanos_altos', region:'GREAT PLAINS', lado:[['Missouri','S'],['Arkansas','N']], guarda:false },
 { id:'praderas_centrales', region:'CENTRAL LOWLAND', caja:[-101,-88,34,47], lado:[['Missouri','S'],['Arkansas','N'],['Mississippi','W']], guarda:false },
 { id:'praderas_norte', region:'CENTRAL LOWLAND', caja:[-107,-88,41,53], lado:[['Missouri','N'],['Mississippi','W']], guarda:false },
 // --- el suroeste y el norte de Mexico --------------------------------------------
 { id:'suroeste_desierto', region:'SONORAN DESERT', caja:[-117,-109,30.5,35.5], guarda:false },   // la parte de Arizona: o'odham (Casa Grande)
 { id:'suroeste_desierto', bioma:'desierto|estepa', caja:[-117,-103,31,38], modo:'suma' },
 { id:'pueblos_norte_mexico', region:'ALTI-PLANICIE MEXICANA', guarda:false },
 { id:'pueblos_norte_mexico', region:'CHIHUAHUAN DESERT', modo:'suma' },
 { id:'pueblos_norte_mexico', region:'SIERRA MADRE OCCIDENTAL', modo:'suma' },
 { id:'pueblos_norte_mexico', region:'SIERRA MADRE ORIENTAL', modo:'suma' },
 { id:'pueblos_norte_mexico', bioma:'desierto|estepa|subtropical|sabana', caja:[-109,-97,21,34], lado:[['Rio Grande','S']], modo:'suma' },   // al sur del Bravo
 { id:'pueblos_norte_mexico', bioma:'desierto|estepa|subtropical|sabana', caja:[-115,-108,24,33.5], lado:[['Gila','S']], modo:'suma' },      // Sonora, al sur del Gila
 { id:'baja_california_pueblos', region:'BAJA CALIFORNIA', guarda:false },
 { id:'texas_pueblos', bioma:'estepa|subtropical|desierto', caja:[-104,-93.5,24,34], modo:'suma' },   // tras el norte de Mexico: el Chihuahuense ya tiene dueno y Texas se queda con lo demas
 // --- el este, por el Ohio y el Misisipi; el subartico, por el escudo y el clima -------
 { id:'sureste_pueblos', region:'COASTAL PLAIN', guarda:false },
 { id:'sureste_pueblos', region:'PIEDMONT', modo:'suma' },
 { id:'sureste_pueblos', region:'CUMBERLAND PLAT.', modo:'suma' },
 { id:'sureste_pueblos', region:'FLORIDA', modo:'suma' },
 { id:'sureste_pueblos', region:'Ozark Plateau', modo:'suma' },
 { id:'sureste_pueblos', bioma:'subtropical|sabana|monzon', caja:[-98,-74,24,42], lado:[['Ohio','S'],['Mississippi','E']], modo:'suma' },
 { id:'dene', region:'MACKENZIE MTS.', guarda:false },
 { id:'dene', region:'SELWYN MTS.', modo:'suma' },
 { id:'dene', bioma:'taiga|tundra', caja:[-141,-96,52,71], lado:[['Peace','N'],['Athabasca','W']], modo:'suma' },
 { id:'dene', bioma:'taiga', caja:[-125,-112,53,58.5], lado:[['Athabasca','W']], modo:'suma' },   // el pais del Peace: castores y sekani, tambien dene
 { id:'dene', bioma:'taiga|tundra', caja:[-112,-88,59.5,66], modo:'suma' },   // los chipewyan hasta la bahia de Hudson, al norte de los cree   // Natural Earth no trae el Churchill de Manitoba: el Athabasca hace de linde con los cree
 { id:'interior_bc', region:'FRASER PLATEAU', guarda:false },
 { id:'interior_bc', region:'COLUMBIA MTS.', caja:[-124,-115,49,56], modo:'suma' },
 { id:'interior_bc', region:'ROCKY MOUNTAINS', caja:[-128,-112,47,61], modo:'suma' },   // las Rocosas canadienses
 { id:'interior_bc', bioma:'taiga|continental', caja:[-134,-114,47,61], modo:'suma' },
 { id:'meseta_naciones', region:'COLUMBIA PLAT.', guarda:false },
 { id:'meseta_naciones', bioma:'estepa|continental|mediterraneo|oceanico', caja:[-126,-110,41,53], modo:'suma' },
 { id:'subartico_este', region:'LES LAURENTIDES', guarda:false },
 { id:'subartico_este', region:'LABRADOR', modo:'suma' },
 { id:'subartico_este', bioma:'taiga', caja:[-80,-54,45,61], modo:'suma' },
 { id:'cree_innu', region:'CANADIAN SHIELD', caja:[-120,-54,45,62], guarda:false },
 { id:'cree_innu', bioma:'taiga', caja:[-122,-80,45,62], lado:[['Athabasca','E']], modo:'suma' },   // al este del Athabasca; al oeste mandan dene e interior_bc
 { id:'cree_innu', bioma:'taiga|tundra', caja:[-80,-54,45,62], modo:'suma', desde:1670 },
 { id:'bosques_orientales', region:'Superior Upland', guarda:false },
 { id:'bosques_orientales', region:'ALLEGHENY PLATEAU', modo:'suma' },
 { id:'bosques_orientales', region:'APPALACHIAN MTS.', caja:[-82,-64,38,49], modo:'suma' },
 { id:'bosques_orientales', region:'Nova Scotia', modo:'suma' },
 { id:'bosques_orientales', bioma:'continental|subtropical|oceanico|taiga', caja:[-96,-58,35,52], lado:[['Ohio','N'],['Mississippi','E']], modo:'suma' },
];
