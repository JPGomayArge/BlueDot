// LO QUE SE SALVA DEL VOLCADO DE WIKIDATA, Y CON QUE IMPORTANCIA.
//
// El volcado viejo (20.648 entradas) tiene mucho ruido: 1.105 galaxias NGC
// como inventos, 424 campeonatos como cultura, 4.277 nacimientos, fundaciones
// de pueblos como exploracion. Aqui se decide, entrada por entrada, si se
// conserva y en que categoria nueva; nunca sube de importancia 2. Las personas
// se tiran enteras: el canon trae las suyas, con nacimiento y muerte.
const N=s=>(s||'').toLowerCase();
const RUIDO=/^(ngc|messier|ic \d|cúmulo|cumulo|nebulosa|gliese|arp|campeonato|copa |liga |universiada|eurocopa|clasificación|anexo:|torneo|mundial de|grand prix|temporada)/;
const TEMPLO=/^(iglesia|mezquita|monasterio|catedral|sinagoga|basílica|basilica|abadía|abadia|church|mosque|masjid|cartuja|convento|templo|santuario|capilla|pagoda|gran mezquita|great mosque|grand mosque|stupa|estupa)/;
function filtra(v){
 const es=N(v.labels&&v.labels.es), en=N(v.labels&&v.labels.en);
 if(RUIDO.test(es)||RUIDO.test(en))return null;
 const imp=Math.min(2,Math.max(1,(v.importance||1)-2));   // 5->2 (ya cubierto por el canon), 4->2, 3->1, 2->1, 1->1
 switch(v.category){
  case 'batallas': return {cat:'guerras',imp:Math.min(2,Math.max(1,(v.importance||1)-1))};
  case 'desastres': return {cat:'desastres',imp};
  case 'politica': if(TEMPLO.test(es)||TEMPLO.test(en))return {cat:'cultura',imp:1}; return {cat:'politica',imp};
  case 'religion': if(TEMPLO.test(es)||TEMPLO.test(en))return {cat:'cultura',imp:1}; return {cat:'religion',imp};
  case 'inventos': if(/^(ngc|ic |cúmulo|nebulosa)/.test(es))return null; return {cat:'ciencia',imp:1};
  case 'exploracion': if(/(expedici|viaje|exploraci|descubrimiento|llegada|circunnavega|travesía|travesia|cruza|alcanza)/.test(es))return {cat:'exploracion',imp:1}; return null;
  case 'cultura': if(TEMPLO.test(es))return {cat:'cultura',imp:1}; return null;
  case 'personas': return null;
  default: return null;
 }
}
// region aproximada por coordenadas (solo para el fondo; el canon la declara)
function region(lat,lon){
 if(lon<-130&&lat<25)return 'oceania';                                   // Hawai, Polinesia oriental
 if(lon<-100&&lat<-10)return 'oceania';                                  // Rapa Nui, Pitcairn
 if(lon>=-170&&lon<-30){ const borde=lon<-106.5?32.5:(lon<-97.1?31.8-(lon+106.5)/9.4*5.9:25.5); return lat>=borde?'norteamerica':'latam' }
 if(lon>=110&&lat<-10)return 'oceania';                                  // Australia, Nueva Zelanda
 if(lon>=130&&lat<20)return 'oceania';                                   // Nueva Guinea, Micronesia, Melanesia
 // Africa y MENA
 if(lon>=-20&&lon<52&&lat<38){
  const norteAfrica=(lon<-1&&lat<36.2)||(lon>=-1&&lon<12&&lat<37.6)||(lon>=12&&lon<35&&lat<35);
  if(lat<18&&lon<30)return 'africa';
  if(lat<21&&lon>=24&&lon<40)return 'africa';                            // Nubia, Sudan central, Eritrea
  if(lon>=30&&lon<44&&lat<15)return 'africa';
  if(lon>=44&&lat<12)return 'africa';
  if(lat>=18&&lon<35&&!norteAfrica&&lat>=35)return lon<26?'europa':'mena';
  if(norteAfrica||(lat>=18&&lon<35)||(lon>=35&&lat<38))return 'mena';
 }
 if(lon>=34&&lon<52&&lat>=38&&lat<43)return 'mena';                       // Anatolia oriental, Caucaso
 if(lon>=26&&lon<34&&lat>=36&&lat<42&&!(lon<29&&lat>40.2))return 'mena';  // Anatolia occidental (Estambul europeo a 41N queda en Europa)
 if(lon>=52&&lon<63&&lat<37&&lat>=25)return 'mena';                       // Iran
 if(lon>=34&&lon<60&&lat>=12&&lat<32)return 'mena';                       // Arabia
 if(lon>=52&&lon<100&&lat>=37)return (lon<60&&lat>=43)?'europa':'asia_central';   // Turkmenistan..Kazajistan; Rusia europea hasta el Ural
 if(lon>=-25&&lon<60&&lat>=35)return 'europa';
 if(lon>=60&&lat>=42)return 'asia_central';                                // Siberia, Mongolia
 if(lon>=60&&lon<72&&lat>=33)return 'asia_central';                        // Afganistan
 if(lon>=78&&lon<100&&lat>=28.5)return 'asia_central';                     // Tibet
 if(lon>=100&&lat>=23.5)return 'asia_oriental';
 if(lon>=107&&lat>=22)return 'asia_oriental';
 if(lon>=60&&lon<130&&lat>-11)return 'asia_sur';
 return 'oceania';
}
module.exports={filtra,region};
