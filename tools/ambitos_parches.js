// PARCHES SOBRE LAS TABLAS GRANDES, para no repetir dos horas de Norteamerica
// por una fila. Se corren con NORESTAR=<vecinos que deben ceder> y despues
// resuelve_dobles con TABLAS decide por el orden de las tablas.
module.exports = [
 // Los chipewyan llegaban a la bahia de Hudson al norte de los cree: entre el
 // Athabasca y la bahia, al norte del paralelo 58, es dene, no cree. Sin esto
 // la linde era la prolongacion recta del Athabasca hacia el norte.
 { id:'dene', bioma:'taiga|tundra', caja:[-112,-88,59.5,66], modo:'suma' },
 // La franja de sabana seca entre el Sahel y la sabana sudanesa (11-13 N en el
 // oeste de Africa) quedaba sin dueno: Koppen la da como estepa y la region
 // del Sahel no llega tan al sur. Es de la sabana sudanesa.
 { id:'sabana_sudanesa', bioma:'estepa', caja:[-18,32,8,15], modo:'suma' },
];
