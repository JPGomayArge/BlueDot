// LO QUE QUEDA CUADRADO FUERA DE SIBERIA, NORTEAMERICA Y AFRICA.
//
// Asia oriental, Europa, Sudamerica y Arabia: las entidades que la radiografia
// (ya sin contar costuras internas) sigue listando con lados rectos. Misma
// regla que las otras tablas: bioma de clima.js, region de Natural Earth,
// rio, o vecino ya rehecho; cajas anchas; orden de lo propio a lo que sobra.
module.exports = [
 // --- Asia oriental -------------------------------------------------------------
 // (manchuria_pueblos y mohe_jurchen van en ambitos_siberia.js, antes que los pueblos del Amur)
 { id:'mongolia_pueblos', region:'MONGOLIAN PLATEAU', guarda:false },
 { id:'mongolia_pueblos', region:'GOBI DESERT', modo:'suma' },
 { id:'mongolia_pueblos', region:'Hangayn Mts.', modo:'suma' },
 { id:'mongolia_pueblos', region:'Yin Mts.', modo:'suma' },
 { id:'mongolia_pueblos', bioma:'estepa|desierto', caja:[88,121,40,52], modo:'suma' },
 { id:'china_norte_pueblos', region:'NORTH CHINA PLAIN', guarda:false },
 { id:'china_norte_pueblos', region:'Loess Plateau', modo:'suma' },
 { id:'china_norte_pueblos', region:'Taihang Mts.', modo:'suma' },
 { id:'china_norte_pueblos', region:'Lüliang Mts.', modo:'suma' },
 { id:'china_norte_pueblos', region:'Shandong Pen.', modo:'suma' },
 { id:'china_norte_pueblos', region:'Mu Us Desert', modo:'suma' },
 { id:'china_norte_pueblos', bioma:'continental|subtropical', caja:[103,123,32,42], lado:[['Jinsha|Chang Jiang|Yangtze','N']], modo:'suma' },
 // --- Europa -----------------------------------------------------------------------
 { id:'sami_fineses', region:'KOLA PENINSULA', guarda:false },
 { id:'sami_fineses', region:'KJØLEN MOUNTAINS', modo:'suma' },
 { id:'sami_fineses', region:'LAPLAND', modo:'suma' },
 { id:'sami_fineses', bioma:'tundra', caja:[12,47,58,75], modo:'suma' },
 { id:'sami_fineses', bioma:'taiga|continental', caja:[19,47,59,70], lado:[['Severnaya Dvina','W']], modo:'suma' },   // Finlandia, Carelia y el mar Blanco (Turku es Dfb)
 { id:'boreal_fenoscandia', bioma:'taiga', caja:[5,49,54,71], guarda:false },
 { id:'nordicos', region:'SCANDINAVIA', bioma:'continental|oceanico', guarda:false },
 { id:'bosque_volga_kama', bioma:'taiga|continental', caja:[38,62,51,67], guarda:false },
 { id:'bosque_europa_oriental', bioma:'continental|taiga', caja:[21,38,49,60], guarda:false },
 { id:'bosque_templado_europeo', bioma:'oceanico|continental', caja:[-10,30,43,59], guarda:false },
 { id:'mediterraneo_balcanico', region:'BALKAN PEN.', guarda:false },
 { id:'mediterraneo_balcanico', region:'Dinaric Alps', modo:'suma' },
 { id:'mediterraneo_balcanico', region:'Balkan Mts.', modo:'suma' },
 { id:'mediterraneo_balcanico', region:'CARPATHIAN MOUNTAINS', modo:'suma' },
 { id:'mediterraneo_balcanico', bioma:'mediterraneo|subtropical', caja:[2,30,35,49], modo:'suma' },
 { id:'caucaso_pueblos', region:'CAUCASUS MTS.', guarda:false },
 { id:'caucaso_pueblos', region:'Lesser Caucasus', modo:'suma' },
 { id:'caucaso_pueblos', bioma:'subtropical|oceanico|continental|mediterraneo', caja:[37,50,38,47], modo:'suma' },
 // --- Anatolia y Arabia ----------------------------------------------------------------
 { id:'anatolia_meseta', region:'ANATOLIA', guarda:false },
 { id:'anatolia_meseta', region:'PONTIC MOUNTAINS', modo:'suma' },
 // Dos capas que conviven del -4000 al -550: los oasis y pastores de las
 // tierras no deserticas (Yemen, Asir, Oman, el Hiyaz) y los beduinos del
 // desierto. La primera version les daba la peninsula entera a los dos y la
 // resolucion de solapes borraba a los oasis.
 { id:'arabia_oasis_pastores', region:'ARABIAN PENINSULA', bioma:'estepa|subtropical|sabana|mediterraneo', modo:'suma' },   // en suma: su forma vieja (los oasis) se conserva y los beduinos ceden donde se solapan
 { id:'beduinos_arabia', region:'ARABIAN PENINSULA', bioma:'desierto', guarda:false },
 { id:'beduinos_arabia', bioma:'desierto', caja:[35,50,28,35], modo:'suma' },           // el desierto sirio
 // --- Sudamerica -------------------------------------------------------------------------
 { id:'atacama_pueblos', region:'DESIERTO DE ATACAMA', guarda:false },
 { id:'atacama_pueblos', bioma:'desierto', caja:[-72,-65,-28,-16], modo:'suma' },
 { id:'mojos_casarabe', bioma:'sabana|monzon', caja:[-69,-60,-17,-12], guarda:false },
 { id:'alto_xingu', region:'PLANALTO DO MATO GROSSO', caja:[-62,-48,-20,-2], guarda:false },   // sin Santa Cruz, que es chiquitania
 { id:'andes_centrales', region:'CORDILLERA OCCIDENTAL', guarda:false },
 { id:'andes_centrales', region:'CORD. CENTRAL', caja:[-81,-72,-16,-2], modo:'suma' },
 { id:'andes_centrales', region:'CORDILLERA ORIENTAL', caja:[-80,-63,-25,-1], modo:'suma' },
 { id:'andes_centrales', region:'YUNGAS', modo:'suma' },
 { id:'andes_centrales', region:'ANDES', caja:[-81,-65,-22,-1], modo:'suma' },
 { id:'andes_norte_pueblos', region:'ANDES', caja:[-81,-72,-5,12], guarda:false },
 { id:'andes_norte_pueblos', region:'CORDILLERA ORIENTAL', caja:[-77,-62,1,11], modo:'suma' },
 { id:'huarpe_comechingon', bioma:'desierto|estepa|subtropical', caja:[-70,-62,-35,-27], guarda:false },   // las sierras de Cordoba son de los comechingones
 { id:'pampa_pueblos', region:'PAMPAS', guarda:false },
 { id:'pampa_pueblos', region:'Entre Rios', modo:'suma' },
 { id:'pantanal_chiquitania', region:'PANTANAL', guarda:false },
 { id:'pantanal_chiquitania', region:'CHACO BOREAL', caja:[-63,-57,-20,-16], modo:'suma' },
 { id:'pantanal_chiquitania', bioma:'sabana', caja:[-65,-53,-21,-14], modo:'suma' },
 { id:'mata_atlantica_parana', region:'Serra do Mar', guarda:false },
 { id:'mata_atlantica_parana', region:'Serra Geral', modo:'suma' },
 { id:'mata_atlantica_parana', region:'Serra da Mantiqueira', modo:'suma' },
 { id:'mata_atlantica_parana', bioma:'subtropical|oceanico', caja:[-59,-40,-31,-16], modo:'suma' },
 { id:'caribes_guayanas', region:'GUIANA SHIELD', modo:'suma' },   // en suma: la Amazonia ya tiene sus cortes y la sustitucion dejaba Trinidad vacia
 { id:'caribes_guayanas', region:'GUIANA HIGHLANDS', modo:'suma' },
 { id:'caribes_guayanas', region:'AMAZON BASIN', lado:[['Amazonas','N'],['Negro','E']], modo:'suma' },
];
