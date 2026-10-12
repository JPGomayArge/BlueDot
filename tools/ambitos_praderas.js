// GRANDES LLANURAS, EN MODO SUMA.
//
// Cinco sustratos se reparten las praderas y solo dos rios las cortan a 1:50m,
// el Misuri y el Arkansas. No alcanza para redibujarlos a cada uno; alcanza
// para que ninguno deje hueco. Cada entrada recibe solo lo que nadie pinta
// dentro de su franja, en orden, asi que el primero que toca una franja se la
// queda y los siguientes rellenan lo que falte.
module.exports = [
 { id:'praderas_noroeste',  region:'GREAT PLAINS', lado:[['Missouri','N']], modo:'suma' },
 { id:'praderas_norte',     region:'GREAT PLAINS', lado:[['Missouri','N']], modo:'suma' },
 { id:'llanos_altos',       region:'GREAT PLAINS', lado:[['Missouri','S'],['Arkansas','N']], modo:'suma' },
 { id:'praderas_centrales', region:'GREAT PLAINS', lado:[['Missouri','S'],['Arkansas','N']], modo:'suma' },
 { id:'praderas_sur',       region:'GREAT PLAINS', lado:[['Arkansas','S']], modo:'suma' },
];
