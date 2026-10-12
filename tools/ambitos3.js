// TERCERA TANDA: lo que la radiografia y las fotos sacaron tras las dos
// primeras. Franjas sin nombre en Natural Earth, con caja y modo suma.
module.exports = [
 // La costa atlantica ecuatorial (Camerun, Gabon, Congo, Cabinda, norte de
 // Angola) se quedo negra al cambiar la selva por la CUENCA DEL CONGO: la
 // cuenca no llega al mar. La franja se suma a la selva y a los pueblos del
 // bosque, que son quienes la tenian antes; la resta contra los demas deja
 // fuera lo que ya sea de un estado o de otro sustrato.
 { id:'selva_ecuatorial_africa', caja:[8,16,-8,5], modo:'suma' },
 { id:'pueblos_bosque',          caja:[8,16,-8,5], modo:'suma' },
];
