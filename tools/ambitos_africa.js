// AFRICA POR BIOMAS, REGIONES Y RIOS.
//
// La sabana austral y los khoisan sumaban cuarenta grados de lados rectos
// cada uno; el Sahara y el Magreb compartian un paralelo de dos grados y dos
// meridianos de tres. Lo que separa a estos pueblos es el clima -el Sahara,
// el Sahel, la sabana, la selva, lo seco del sur- y, donde el clima no
// cambia, un rio: el Nilo, el Zambeze, el Shire, el Ruvuma, el Volta.
//
// LA REGLA (la misma que en Siberia): cada lado lo pone el bioma de
// clima.js, una region de Natural Earth, un rio o un vecino ya rehecho; las
// cajas van anchas y solo son de trabajo. ORDEN (IGNORA=2): primero lo
// definido por algo propio, al final los fondos que se quedan con el resto.
// Los relevos temporales (sabana austral -> primeros bantues en el 200)
// llevan la misma formula, cada uno en su tramo.
module.exports = [
 // --- el norte: Sahara y Magreb ---------------------------------------------
 { id:'sahel_pueblos', region:'SAHEL', bioma:'estepa|desierto', guarda:false },   // la region de Natural Earth baja hasta los 9 grados: el Sahel es su parte seca; la sabana, de la sabana sudanesa
 { id:'pueblos_sahara', region:'SAHARA', guarda:false },   // el Sahel va antes: las dos regiones de Natural Earth se solapan y el Sahara se lo comia
 { id:'bereberes_magreb', region:'ATLAS MOUNTAINS', guarda:false },
 { id:'bereberes_magreb', region:'ATLAS SAHARIEN', modo:'suma' },
 { id:'bereberes_magreb', region:'HAUT ATLAS', modo:'suma' },
 { id:'bereberes_magreb', region:'Anti Atlas', modo:'suma' },
 { id:'bereberes_magreb', caja:[-13,16,29.5,38], modo:'suma' },          // la costa de Marruecos a Tripolitania; el Sahara ya tiene su borde
 // --- lo definido por cordillera, meseta, cuenca o desierto -----------------------
 { id:'rift_maasai', bioma:'sabana|estepa|subtropical', caja:[34,39,-7,5], guarda:false },
 { id:'rift_maasai', region:'GREAT RIFT VALLEY', caja:[34,39,-7,5], modo:'suma' },
 { id:'grandes_lagos_africa', bioma:'sabana|subtropical|oceanico', caja:[29.5,36,-11,2.5], guarda:false },
 { id:'grandes_lagos_africa', region:'GREAT RIFT VALLEY', caja:[28,36,-11,2], modo:'suma' },
 { id:'grandes_lagos_africa', region:'Iwembere Steppe', modo:'suma' },
 { id:'sabana_oriental_cuerno', region:'ETHIOPIAN HIGHLANDS', guarda:false },
 { id:'sabana_oriental_cuerno', region:'SOMALI PENINSULA', modo:'suma' },
 { id:'sabana_oriental_cuerno', region:'GREAT RIFT VALLEY', caja:[33,45,-5,15], modo:'suma' },
 { id:'sabana_oriental_cuerno', region:'Iwembere Steppe', modo:'suma' },
 { id:'etiopia_baja', bioma:'desierto|estepa', caja:[35,44,3,15.5], guarda:false },       // el bajo Omo, el Afar: lo seco bajo las tierras altas
 { id:'ogaden_pueblos', region:'Ogaden', guarda:false },
 { id:'ogaden_pueblos', region:'SOMALI PENINSULA', caja:[38,52,-2,6], modo:'suma' },
 { id:'pueblos_bosque', region:'CONGO BASIN', guarda:false },
 { id:'pueblos_bosque', region:'CRYSTAL MOUNTAINS', modo:'suma' },
 { id:'pueblos_bosque', bioma:'selva|monzon', caja:[8,32,-10,8], modo:'suma' },
 { id:'selva_ecuatorial_africa', region:'CONGO BASIN', guarda:false },
 { id:'selva_ecuatorial_africa', region:'CRYSTAL MOUNTAINS', modo:'suma' },
 { id:'selva_ecuatorial_africa', region:'MITUMBA MTS.', modo:'suma' },
 { id:'selva_ecuatorial_africa', bioma:'selva|monzon', caja:[8,32,-10,8], modo:'suma' },
 { id:'bemba_lunda_este', region:'KATANGA PLATEAU', guarda:false },
 { id:'bemba_lunda_este', region:'Muchinga Mts.', modo:'suma' },
 { id:'khoisan', region:'KALAHARI DESERT', guarda:false },
 { id:'khoisan', region:'NAMIB DESERT', modo:'suma' },
 { id:'khoisan', bioma:'desierto|estepa|mediterraneo', caja:[11,34,-35,-17], modo:'suma' },   // el Cabo, el Karoo, Namibia: lo seco
 // --- el oeste, por clima y por el Volta ---------------------------------------------
 { id:'costa_rios', bioma:'monzon|selva', caja:[-17.5,-10,6,13], guarda:false },
 { id:'akan_kru', bioma:'monzon|selva|sabana', caja:[-11,2,4,9], guarda:false },
 { id:'mande_senufo', bioma:'sabana', caja:[-16,4,6,15], lado:[['Volta','W']], guarda:false },
 { id:'ubangi_pueblos', region:'Adamawa Plateau', guarda:false },
 { id:'ubangi_pueblos', bioma:'sabana', caja:[12,30,3,12], modo:'suma' },
 { id:'grassfields_camerun', bioma:'monzon|sabana|selva', caja:[9,14,3,8], guarda:false },
 { id:'kordofan_darfur', bioma:'sabana|estepa', caja:[22,32,9,18], guarda:false },
 // --- el sur, por el Zambeze y el Shire ----------------------------------------------
 { id:'ovimbundu_lunda', region:'Bié Plateau', guarda:false },
 { id:'ovimbundu_lunda', region:'Huíla Plateau', modo:'suma' },
 { id:'ovimbundu_lunda', bioma:'sabana|subtropical', caja:[11,25,-19,-6], lado:[['Zambezi','W']], modo:'suma' },
 { id:'zambeze_cazadores', region:'Muchinga Mts.', guarda:false },
 { id:'zambeze_cazadores', bioma:'sabana|subtropical|estepa', caja:[22,37,-21,-9], lado:[['Zambezi','E']], modo:'suma' },
 { id:'makua_yao', bioma:'sabana|subtropical|monzon', caja:[34,41,-18,-8], lado:[['Shire','E']], guarda:false },
 { id:'chewa_zambeze', bioma:'sabana|subtropical', caja:[26,37,-20,-10], lado:[['Zambezi','N'],['Shire','W']], guarda:false },
 { id:'tsonga_venda', region:'DRAKENSBERG', caja:[28,33,-27,-21], guarda:false },
 { id:'tsonga_venda', bioma:'sabana|subtropical', caja:[28,36,-27,-19], modo:'suma' },
 { id:'nguni_pueblos', region:'DRAKENSBERG', caja:[25,33,-34,-26], guarda:false },
 { id:'nguni_pueblos', bioma:'subtropical|oceanico|sabana', caja:[25,34,-35,-26], modo:'suma' },
 // --- los fondos: el Nilo, la sabana sudanesa, la sabana austral ----------------------
 { id:'nilo_sudan', region:'SUDD', guarda:false },
 { id:'nilo_sudan', bioma:'sabana|estepa', caja:[24,36,3,17], modo:'suma' },
 { id:'sabana_sudanesa', bioma:'sabana|monzon|estepa', caja:[-18,32,2,17.5], guarda:false },   // con la estepa que queda fuera de la region del Sahel (el Sahel va antes y se queda con la suya)
 { id:'sabana_sudanesa', bioma:'selva|monzon', caja:[2,10,4,8.5], modo:'suma' },   // el bosque de Nigeria y Benin, que no tiene entidad propia hasta los igbo   // Natural Earth no trae el Nilo Blanco: el meridiano 32 es, ahi, el propio Nilo
 { id:'sabana_oriental_cuerno', bioma:'sabana|estepa|desierto|subtropical', caja:[29,52,-12,15], lado:[['Ruvuma','N']], modo:'suma' },
 { id:'sabana_austral_prebantu', bioma:'sabana|subtropical|monzon|oceanico', caja:[11,41,-35,-6], guarda:false },
 { id:'sabana_austral_prebantu', caja:[11,41,-35,-6], modo:'suma' },
 { id:'bantu_austral_temprano', bioma:'sabana|subtropical|monzon|oceanico', caja:[11,41,-35,-6], guarda:false },
 { id:'bantu_austral_temprano', caja:[11,41,-35,-6], modo:'suma' },
];
