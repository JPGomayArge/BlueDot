// QUIEN CEDE CUANDO DOS PINTAN LO MISMO Y NINGUNO ES SUSTRATO DEL OTRO.
// Lo lee resuelve_dobles.js. {cede, a, desde?, hasta?}: `cede` pierde el suelo
// comun frente a `a` en el tramo dado (todo el arco si no hay tramo).
module.exports = [
 // cultura - cultura: cede el fondo general ante el horizonte concreto
 { cede:'bosque_templado_europeo', a:'campaniforme' },        // el vaso campaniforme es el horizonte, el bosque el fondo
 { cede:'pueblos_sahara',          a:'toubou' },              // los tubu son el pueblo concreto del Tibesti
 { cede:'norte_alaska_antiguo',    a:'unangan_yupik' },       // la costa es de los yupik; el interior, del fondo
 { cede:'bantu_austral_temprano',  a:'nguni_pueblos' },       // los nguni son los bantues concretos de esa costa
 // estado - estado: pinta quien manda
 { cede:'lan_xang',   a:'vientiane' },                        // desde 1707 Lan Xang es solo Luang Prabang; Vientiane es reino aparte
 { cede:'lanna',      a:'vientiane' },
 { cede:'ibadan',     a:'british' },                          // protectorado efectivo desde 1893
 { cede:'rouran',     a:'six_dynasties' },
 { cede:'grecia_antigua', a:'persia' },                       // Jonia vuelve a Persia tras 412 a.C.
 { cede:'persia',     a:'rashidun' },                         // la conquista arabe
 { cede:'muisca',     a:'spanish' },
 { cede:'byzantine',  a:'persia', hasta:620 },                // Persarmenia; una franja de un grado2 en tres tramos
];
// tramos restaurados por tramos.js (tramos_radio.js): el vecino que los
// habia invadido por error cede en ese tramo
module.exports.push(
 { cede:'british', a:'sokoto', desde:1898, hasta:1899 },
 { cede:'qing',    a:'bhutan', desde:1800, hasta:1802 },
 { cede:'spanish', a:'dakota', desde:1783, hasta:1803 },
);
module.exports.push(
 { cede:'bhutan',  a:'british',  desde:1800, hasta:1802 },   // los duars de Bengala ya eran de la Compania
 { cede:'sokoto',  a:'damagaram', desde:1898, hasta:1899 },  // Zinder es sultanato aparte
 { cede:'sureste_pueblos', a:'cherokee' },                   // el fondo cede al pueblo concreto
);
module.exports.push(
 { cede:'kazakh_khanate', a:'khiva' },                       // el oasis es del kanato sedentario
 { cede:'indochina_pueblos', a:'austroasiaticos' },          // el fondo cede al horizonte concreto
 { cede:'grecia_antigua', a:'lidia' },                       // Jonia tributaria de Creso
);
module.exports.push(
 { cede:'bunyoro', a:'toro' },      // Toro se separa de Bunyoro en 1830
 { cede:'bunyoro', a:'buganda' },   // la frontera del Kafu es de Buganda en el XIX
);
module.exports.push(
 { cede:'selva_ecuatorial_africa', a:'pueblos_bosque', desde:1890, hasta:1891 },
);
module.exports.push(
 { cede:'sabana_oriental_cuerno', a:'oromo' },   // el fondo del Cuerno cede a las confederaciones oromo
);
module.exports.push(
 { cede:'alaska_interior', a:'unangan_yupik' },   // la costa de Bering es de los yupik
);
