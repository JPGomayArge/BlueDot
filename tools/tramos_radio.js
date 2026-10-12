// Tramos que la radiografia (1 grado, todo el arco) senalo como parpadeos o
// blips y que son errores mecanicos, no historia. Lo lee tramos.js; despues
// resuelve_dobles.js con dobles_tabla.js quita ese suelo al vecino que lo
// habia invadido.
module.exports = [
 { id:'sokoto', de:[1899,1900], a:[1898,1899] },   // los britanicos no toman Sokoto hasta 1903; en 1898 solo caen Bida e Ilorin
 { id:'bhutan', de:[1773,1800], a:[1800,1802] },   // Butan no fue Qing: dos anios tragados por un periodo Qing partido en 1800
 { id:'dakota', de:[1763,1783], a:[1783,1803] },   // la Luisiana espanola no gobierno Minnesota: los dakota siguen hasta Pike (1805)
];
module.exports.push(
 // Bunyoro: cronologia entera pero 0,2 g2 de 1850 a 1894 y nada de 1815 a
 // 1850; Hoima era un hueco que la selva acabo rellenando. Recupera el reino
 // de 1800 (Kamurasi, Kabarega) y resuelve_dobles lo encaja con Buganda y
 // los vecinos.
 { id:'bunyoro', de:[1800,1815], a:[1815,1894], anillos:true },
);
module.exports.push(
 // pueblos_bosque 1890..1891 tenia otra forma que el anio anterior y el
 // siguiente (sin el Albertino) y la selva, al sumarse la cuna, se lo quedo
 // un solo anio: un destello de 37 g2. Toma los anillos de 1891.
 { id:'pueblos_bosque', de:[1891,1893], a:[1890,1891], anillos:true },
);
