// Parches de la segunda tanda (sobre ambitos_resto.js ya aplicada).
module.exports = [
 { id:'arabia_oasis_pastores', region:'ARABIAN PENINSULA', bioma:'estepa|subtropical|sabana|mediterraneo', modo:'suma' },   // en suma: su forma vieja (los oasis) se conserva y los beduinos ceden donde se solapan
 { id:'beduinos_arabia', region:'ARABIAN PENINSULA', bioma:'desierto', guarda:false },
 { id:'beduinos_arabia', bioma:'desierto', caja:[35,50,28,35], modo:'suma' },
 { id:'sami_fineses', bioma:'taiga|continental', caja:[19,47,59,70], lado:[['Severnaya Dvina','W']], modo:'suma' },
 { id:'evenkos', bioma:'taiga|tundra', caja:[135,160,55,65], modo:'suma', desde:1600 },   // la costa de Ojotsk tras la taiga del Lena
];
