// AMBITOS FISICOS DE LAS AREAS CULTURALES, SEGUNDA TANDA.
//
// Criterio: solo entran las entidades cuyo nombre o cuya descripcion cita la
// region, o cuya caja actual coincide con ella sin ambiguedad. `modo:'suma'`
// cuando la entidad tiene mas ambito que la region -costa, otra region
// contigua- y sustituir seria amputarla; sin modo cuando la entidad ES la
// region y lo que sobra fuera de ella es dibujo, no territorio.
//
// LO QUE QUEDA FUERA A PROPOSITO, Y POR QUE:
//   - Las praderas norteamericanas (cinco sustratos sobre GREAT PLAINS): hay
//     que repartirlas por rios -Misuri, Platte, Arkansas- como la Amazonia, y
//     eso es una tanda propia.
//   - Europa templada (celtas, germanos, eslavos, campos de urnas...): la
//     NORTHERN EUROPEAN PLAIN de Natural Earth va de Francia a los Urales y
//     no reparte nada; aqui mandan los rios y las cordilleras, tanda propia.
//   - Los que no tienen region con nombre: Baikal, Cáucaso, meseta irania,
//     India central, Yakutia.
module.exports = [

 // --- ASIA INTERIOR ---------------------------------------------------------
 { id:'mongolia_pueblos',   region:'MONGOLIAN PLATEAU' },
 { id:'mongolia_pueblos',   region:'GOBI DESERT', modo:'suma' },
 { id:'estepa_kazaja',      region:'KAZAKH STEPPE' },
 { id:'estepa_kazaja',      region:'KAZAKH UPLAND', modo:'suma' },
 { id:'kazajos_nomadas',    region:'KAZAKH STEPPE' },
 { id:'kazajos_nomadas',    region:'KAZAKH UPLAND', modo:'suma' },
 { id:'kazajos_nomadas',    region:'BETPAQDALA DESERT', modo:'suma' },
 { id:'juzes_kazajos',      region:'KAZAKH STEPPE', modo:'suma' },
 { id:'andronovo',          region:'KAZAKH STEPPE', modo:'suma' },
 { id:'turan_oasis_estepa', region:'TURAN LOWLAND' },
 { id:'turan_oasis_estepa', region:'QIZILQUM DESERT', modo:'suma' },
 { id:'turcomanos',         region:'GARAGUM DESERT' },
 { id:'tarim_pueblos',      region:'TARIM BASIN' },
 { id:'corredor_hexi',      region:'Hexi Corridor' },
 { id:'dzungaria_altai',    region:'Junggar Basin', modo:'suma' },
 { id:'china_norte_pueblos',region:'NORTH CHINA PLAIN' },
 { id:'china_norte_pueblos',region:'Loess Plateau', modo:'suma' },
 { id:'manchuria_pueblos',  region:'MANCHURIAN PLAIN' },
 { id:'mohe_jurchen',       region:'MANCHURIAN PLAIN' },
 { id:'dian_yunnan',        region:'YUNGUI PLATEAU' },
 { id:'china_sur_pueblos',  region:'YUNGUI PLATEAU', modo:'suma' },
 { id:'tibetano_birmanos',  region:'SHAN PLATEAU', modo:'suma' },
 { id:'austroasiaticos',    region:'Khorat Plat.', modo:'suma' },

 // --- SIBERIA Y ARTICO ------------------------------------------------------
 { id:'siberia_occidental', region:'WESTERN SIBERIAN PLAIN' },
 { id:'ugrios_ob',          region:'WESTERN SIBERIAN PLAIN' },
 { id:'evenkos',            region:'CENTRAL SIBERIAN PLATEAU', modo:'suma' },
 { id:'samoyedos',          region:'Bol’shezemel’skaya Tundra', modo:'suma' },
 { id:'samoyedos',          region:'NORTH SIBERIAN LOWLAND', modo:'suma' },
 { id:'samoyedos',          region:'GYDA PENINSULA', modo:'suma' },
 { id:'yukaguiros',         region:'KOLYMA LOWLAND', modo:'suma' },
 { id:'sami_fineses',       region:'LAPLAND', modo:'suma' },
 { id:'bosque_volga_kama',  region:'VYCHEGDA LOWLAND', modo:'suma' },

 // --- ESTEPA PONTICA, POR ERAS ---------------------------------------------
 { id:'yamnaya',            region:'PONTIC STEPPE' },
 { id:'catacumbas',         region:'PONTIC STEPPE' },
 { id:'srubna',             region:'PONTIC STEPPE' },
 { id:'cimerios',           region:'PONTIC STEPPE', modo:'suma' },
 { id:'escitas',            region:'PONTIC STEPPE' },
 { id:'sarmatas',           region:'PONTIC STEPPE' },
 { id:'estepa_ponto_caspica', region:'PONTIC STEPPE' },
 { id:'estepa_ponto_caspica', region:'CASPIAN DEPRESSION', modo:'suma' },
 { id:'nomadas_ponticos',   region:'PONTIC STEPPE' },
 { id:'pecheneg',           region:'PONTIC STEPPE', modo:'suma' },
 { id:'cuman',              region:'PONTIC STEPPE', modo:'suma' },
 { id:'cuman',              region:'CASPIAN DEPRESSION', modo:'suma' },

 // --- ORIENTE PROXIMO Y ARABIA ---------------------------------------------
 { id:'anatolia_meseta',    region:'ANATOLIA' },
 { id:'creciente_fertil',   region:'Mesopotamia', modo:'suma' },
 { id:'beduinos_arabia',    region:'ARABIAN PENINSULA' },
 { id:'beduinos_arabia',    region:'SYRIAN DESERT', modo:'suma' },
 { id:'arabia_oasis_pastores', region:'ARABIAN PENINSULA' },
 { id:'baluchistan_pueblos', region:'BALUCHISTAN' },
 { id:'baluchistan_helmand', region:'BALUCHISTAN' },

 // --- INDIA ------------------------------------------------------------------
 { id:'gangetico_pueblos',  region:'GANGES PLAIN' },
 { id:'deccan_neolitico',   region:'DECCAN PLATEAU' },
 { id:'india_noroeste_pueblos', region:'THAR DESERT', modo:'suma' },

 // --- AFRICA ------------------------------------------------------------------
 { id:'pueblos_bosque',     region:'CONGO BASIN' },
 { id:'selva_ecuatorial_africa', region:'CONGO BASIN' },
 { id:'bemba_lunda_este',   region:'KATANGA PLATEAU' },
 { id:'ovimbundu_lunda',    region:'Bié Plateau', modo:'suma' },
 { id:'ovimbundu_lunda',    region:'Huíla Plateau', modo:'suma' },
 { id:'khoisan',            region:'KALAHARI DESERT', modo:'suma' },
 { id:'sabana_austral_prebantu', region:'KALAHARI DESERT', modo:'suma' },
 { id:'ogaden_pueblos',     region:'Ogaden' },
 { id:'nilo_sudan',         region:'SUDD', modo:'suma' },

 // --- EUROPA, SOLO LO INEQUIVOCO ---------------------------------------------
 { id:'iberos_lusitanos',   region:'PENÍNSULA IBÉRICA' },
 { id:'neolitico_iberico',  region:'PENÍNSULA IBÉRICA' },
 { id:'tracios_dacios',     region:'BALKAN PEN.' },
 { id:'mediterraneo_balcanico', region:'BALKAN PEN.', modo:'suma' },

 // --- AMERICA -----------------------------------------------------------------
 { id:'tehuelche',          region:'PATAGONIA' },
 { id:'altiplano_pueblos',  region:'ALTIPLANO' },
 { id:'andes_centrales',    region:'ALTIPLANO', modo:'suma' },
 { id:'atacama_pueblos',    region:'DESIERTO DE ATACAMA', modo:'suma' },
 { id:'gran_cuenca',        region:'GREAT BASIN' },
 { id:'gran_cuenca',        region:'COLORADO PLATEAU', modo:'suma' },
 { id:'meseta_naciones',    region:'COLUMBIA PLAT.' },
 { id:'suroeste_desierto',  region:'SONORAN DESERT', modo:'suma' },
 { id:'pueblos_norte_mexico', region:'ALTI-PLANICIE MEXICANA' },
 { id:'pueblos_norte_mexico', region:'CHIHUAHUAN DESERT', modo:'suma' },
 { id:'texas_pueblos',      region:'Edwards Plateau', modo:'suma' },
 { id:'sureste_pueblos',    region:'COASTAL PLAIN', modo:'suma' },
 { id:'sureste_pueblos',    region:'PIEDMONT', modo:'suma' },
 { id:'sureste_pueblos',    region:'CUMBERLAND PLAT.', modo:'suma' },
 { id:'dene',               region:'BARREN GROUNDS', modo:'suma' },
 { id:'alaska_interior',    region:'YUKON PLATEAU', modo:'suma' },
 { id:'alaska_interior',    region:'Yukon Flats', modo:'suma' },
 { id:'norte_alaska_antiguo', region:'NORTH SLOPE' },
 { id:'interior_bc',        region:'FRASER PLATEAU', modo:'suma' },
 { id:'subartico_este',     region:'LES LAURENTIDES', modo:'suma' },
];
