// SIBERIA POR BIOMAS, RIOS Y CORDILLERAS.
//
// Seis de las diez entidades mas "cuadradas" del mapa estaban aqui: evenkos
// con dos meridianos de nueve grados, la taiga del Obi con un paralelo de
// once, chukchis con tres meridianos seguidos.
//
// LA REGLA: cada lado de cada entidad lo pone algo que no es una caja. El
// bioma de clima.js (la tundra, la taiga, el bosque continental, la estepa),
// un rio (Obi, Yenisei, Lena, Aldan, Amur, Argun, Kolima), una cordillera o
// meseta con nombre (Altai, Sayan, Verjoyansk, Cherski, Stanovoi, la meseta
// central), o un vecino ya rehecho. Las cajas son solo cajas de trabajo y van
// mas anchas que la entidad, para que no sea la caja la que corte. Un lado
// que quede recto es un error de esta tabla, y la radiografia lo lista.
//
// EL ORDEN manda (IGNORA=2): cada fila resta a los companeros de tabla que
// van antes y no a los que van despues. Primero lo definido por cordillera,
// luego por rios, al final lo que se queda con el resto (la taiga del Obi).
// La tundra va la primera: es el bioma que todos los demas excluyen.
//
// TIEMPO: la taiga del Lena (hasta 1600) y la del Kolima (hasta -1000) dan
// paso a evenkos y yukaguiros; entre el Obi y el Yenisei, la taiga (Dfc) es
// de selkups y kets desde -500 y el bosque continental (Dfb) de la taiga del
// Obi, que antes de -500 lo tenia todo.
const YEN='Yenisey|Verkhniy Yenisey';
const BOREAL='taiga|continental';
module.exports = [
 // --- la tundra primero: todos los demas se definen fuera de ella ---------------
 { id:'samoyedos', bioma:'tundra', caja:[42,124,58,80], guarda:false },
 { id:'samoyedos', caja:[95,125,70,80], lado:[['Khatanga','N']], modo:'suma' },
 { id:'samoyedos', bioma:'taiga', caja:[66,90,65.5,70], modo:'suma' },   // la taiga abierta del Taz y el Pur es nenets (Mangazeya)   // Koppen pinta el Taimyr de taiga hasta el mar; el Jatanga es la linde real
 // --- cordilleras del sur -----------------------------------------------------
 { id:'altai_sayan', region:'ALTAY MOUNTAINS', guarda:false },
 { id:'altai_sayan', region:'EASTERN SAYAN MTS.', modo:'suma' },
 { id:'altai_sayan', region:'Western Sayan Mts.', modo:'suma' },
 { id:'altai_sayan', region:'Tannu-Ola Ra.', modo:'suma' },
 { id:'altai_sayan', region:'Abakanskiy Ra.', modo:'suma' },
 { id:'altai_sayan', bioma:'continental|estepa|taiga', caja:[82,103,47,56], modo:'suma' },   // Tuva, Minusinsk: los valles entre las sierras
 { id:'dzungaria_altai', region:'Junggar Basin', guarda:false },
 { id:'dzungaria_altai', region:'Tarbagatay Ra.', modo:'suma' },
 // --- el nordeste: Verjoyansk, Cherski, Kolima, Chukotka ----------------------
 { id:'taiga_yana_kolima', region:'VERKHOYANSK RANGE', guarda:false },
 { id:'taiga_yana_kolima', region:'CHERSKIY RANGE', modo:'suma' },
 { id:'taiga_yana_kolima', region:'KOLYMA LOWLAND', modo:'suma' },
 { id:'taiga_yana_kolima', bioma:'taiga|tundra', caja:[132,165,58,77], lado:[['Kolyma','W']], modo:'suma' },
 { id:'yukaguiros', region:'VERKHOYANSK RANGE', guarda:false },
 { id:'yukaguiros', region:'CHERSKIY RANGE', modo:'suma' },
 { id:'yukaguiros', region:'KOLYMA LOWLAND', modo:'suma' },
 { id:'yukaguiros', bioma:'taiga|tundra', caja:[132,165,58,77], lado:[['Kolyma','W']], modo:'suma' },
 { id:'chukchi_koryak', region:'KAMCHATKA PENINSULA', guarda:false },
 { id:'chukchi_koryak', region:'Koryak Range', modo:'suma' },
 { id:'chukchi_koryak', region:'KOLYMA RANGE', modo:'suma' },
 { id:'chukchi_koryak', bioma:'tundra|taiga|hielo', caja:[150,180,50,74], lado:[['Kolyma','E']], modo:'suma' },
 { id:'chukchi_koryak', bioma:'tundra|taiga', caja:[-180,-168,60,72], modo:'suma' },
 // --- el Lena y el Amur ----------------------------------------------------------
 { id:'taiga_lena_ojotsk', region:'STANOVOY RANGE', guarda:false },
 { id:'taiga_lena_ojotsk', region:'STANOVOY UPLAND', modo:'suma' },
 { id:'taiga_lena_ojotsk', region:'Aldan Upland', modo:'suma' },
 { id:'taiga_lena_ojotsk', bioma:'taiga|tundra', caja:[112,160,49,65], lado:[['Lena','E'],['Aldan','S'],['Amur','N']], modo:'suma' },
 { id:'yakutia_pueblos', bioma:'taiga|tundra', caja:[118,140,57,77], lado:[['Lena','E']], guarda:false },
 { id:'yakutia_pueblos', bioma:'taiga', caja:[120,135,59,66], modo:'suma' },   // las dos orillas del Lena medio (Yakutsk esta en la izquierda)
 { id:'yakutia_pueblos', region:'Lena Delta', modo:'suma' },
 { id:'buriatos', bioma:'taiga|continental|estepa', caja:[90,121,48,58], lado:[[YEN,'E'],['Lena','S'],['Argun’','W']], guarda:false },
 { id:'buriatos', bioma:'taiga|continental|estepa', caja:[96,110,50,57], lado:[['Angara','S']], modo:'suma' },   // Irkutsk y la orilla oeste del Baikal, al sur del Angara
 // Manchuria es la llanura y los Khingan; lo demas del Amur es de los pueblos del Amur
 { id:'manchuria_pueblos', region:'MANCHURIAN PLAIN', guarda:false },
 { id:'manchuria_pueblos', region:'Lesser Khingan Range', modo:'suma' },
 { id:'manchuria_pueblos', region:'GREATER KHINGAN RANGE', caja:[117,126,41,50], modo:'suma' },
 { id:'manchuria_pueblos', region:'Liaodong Pen.', modo:'suma' },
 { id:'mohe_jurchen', region:'MANCHURIAN PLAIN', guarda:false },
 { id:'mohe_jurchen', region:'Lesser Khingan Range', modo:'suma' },
 { id:'mohe_jurchen', region:'Hamgyong Mts.', modo:'suma' },
 { id:'amur_pueblos', bioma:'taiga|continental|subtropical', caja:[115,142,41,58], lado:[['Argun’','E']], guarda:false },
 { id:'amur_pueblos', region:'SIKHOTE-ALIN’ RANGE', modo:'suma' },
 { id:'amur_pueblos', region:'Lesser Khingan Range', modo:'suma' },
 // --- entre el Obi y el Yenisei: la taiga para selkups y kets, el bosque
 //     continental para la taiga del Obi; antes de -500, todo para esta -------
 { id:'ugrios_ob',  bioma:BOREAL, caja:[56,86,53,70], lado:[['Ob','W']], guarda:false },
 { id:'ugrios_ob',  bioma:'taiga|tundra', caja:[62,78,63,68.5], modo:'suma' },   // el bajo Obi por las dos orillas (Salejard)
 { id:'selkup_ket', bioma:'taiga', caja:[66,97,53,70], lado:[['Ob','E'],[YEN,'W']], guarda:false },
 { id:'taiga_obi_yenisei', bioma:'continental', caja:[66,97,47,70], lado:[['Ob','E'],[YEN,'W']], guarda:false },
 { id:'taiga_obi_yenisei', bioma:'taiga', caja:[66,97,47,70], lado:[['Ob','E'],[YEN,'W']], modo:'suma', hasta:-500 },
 // --- evenkos: la meseta y la taiga entre el Yenisei y el Lena; desde 1600
 //     tambien la taiga del Lena hasta Ojotsk --------------------------------------
 { id:'evenkos', region:'CENTRAL SIBERIAN PLATEAU', guarda:false },
 { id:'evenkos', region:'PUTORANA PLATEAU', modo:'suma' },
 { id:'evenkos', bioma:'taiga', caja:[78,135,49,77], lado:[[YEN,'E'],['Lena','W']], modo:'suma' },
 { id:'evenkos', bioma:'taiga|continental', caja:[100,124,47,58], modo:'suma' },   // Transbaikalia: al este del alto Lena, antes y entre buriatos y amur
 { id:'evenkos', region:'STANOVOY RANGE', modo:'suma', desde:1600 },
 { id:'evenkos', region:'STANOVOY UPLAND', modo:'suma', desde:1600 },
 { id:'evenkos', region:'Aldan Upland', modo:'suma', desde:1600 },
 { id:'evenkos', bioma:'taiga|tundra', caja:[112,160,49,65], lado:[['Lena','E'],['Aldan','S'],['Amur','N']], modo:'suma', desde:1600 },
 // --- lo que queda: la taiga del Obi al oeste del Yenisei ------------------------
 { id:'siberia_occidental', bioma:BOREAL, caja:[56,97,47,72], lado:[[YEN,'W']], guarda:false },
];
