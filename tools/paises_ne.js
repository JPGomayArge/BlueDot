// PAISES DE HOY SEGUN NATURAL EARTH (admin-0, 1:50m, via world-atlas).
// Mapa id de BlueDot -> nombre de Natural Earth; `poligonos(id)` devuelve el
// multipoligono [[anillo...]] del pais (sin Antartida).
const path=require('path');
const MAPA={egypt:'Egypt',morocco:'Morocco',algeria:'Algeria',tunisia:'Tunisia',libya:'Libya',sudan:'Sudan',south_sudan:'S. Sudan',mauritania:'Mauritania',persia:'Iran',greece:'Greece',ottoman:'Turkey',spanish:'Spain',portugal:'Portugal',tanganyika:'Tanzania',dutch_empire:'Netherlands',british:'United Kingdom',modern_china:'China',mongolia:'Mongolia',taiwan:'Taiwan',russia:'Russia',sweden:'Sweden',zimbabwe:'Zimbabwe',japan:'Japan',mexican_empire:'Mexico',brazilian_empire:'Brazil',argentina:'Argentina',chile:'Chile',peru:'Peru',bolivia:'Bolivia',colombia:'Colombia',venezuela:'Venezuela',ecuador:'Ecuador',paraguay:'Paraguay',uruguay:'Uruguay',guatemala:'Guatemala',honduras:'Honduras',el_salvador:'El Salvador',nicaragua:'Nicaragua',costa_rica:'Costa Rica',usa:'United States of America',ethiopia:'Ethiopia',eritrea:'Eritrea',djibouti:'Djibouti',somalia:'Somalia',austria:'Austria',france:'France',prussia_germany:'Germany',poland_lithuania:'Poland',north_korea:'North Korea',canada:'Canada',ukraine:'Ukraine',slovenia:'Slovenia',croatia:'Croatia',bosnia:'Bosnia and Herz.',serbia:'Serbia',montenegro:'Montenegro',kosovo:'Kosovo',north_macedonia:'Macedonia',albania:'Albania',bulgaria:'Bulgaria',romania:'Romania',moldova:'Moldova',estonia:'Estonia',latvia:'Latvia',lithuania:'Lithuania',india:'India',nepal:'Nepal',bhutan:'Bhutan',sri_lanka:'Sri Lanka',israel:'Israel',iraq:'Iraq',syria:'Syria',lebanon:'Lebanon',jordan:'Jordan',south_africa:'South Africa',lesotho:'Lesotho',eswatini:'eSwatini',indonesia:'Indonesia',papua_new_guinea:'Papua New Guinea',thailand:'Thailand',cuba:'Cuba',haiti:'Haiti',dominican_republic:'Dominican Rep.',guyana:'Guyana',suriname:'Suriname',belize:'Belize',australia:'Australia',new_zealand:'New Zealand',vietnam:'Vietnam',philippines:'Philippines',malaysia:'Malaysia',myanmar:'Myanmar',cambodia:'Cambodia',laos:'Laos',bangladesh:'Bangladesh',brunei:'Brunei',timor:'Timor-Leste',nigeria:'Nigeria',senegal:'Senegal',gambia:'Gambia',guinea_bissau:'Guinea-Bissau',guinea:'Guinea',sierra_leone:'Sierra Leone',liberia:'Liberia',ivory_coast:"Côte d'Ivoire",togo:'Togo',benin_modern:'Benin',burkina_faso:'Burkina Faso',mali_modern:'Mali',niger:'Niger',chad:'Chad',cameroon:'Cameroon',central_african_republic:'Central African Rep.',gabon:'Gabon',congo_republic:'Congo',dr_congo:'Dem. Rep. Congo',equatorial_guinea:'Eq. Guinea',kenya:'Kenya',uganda:'Uganda',rwanda:'Rwanda',burundi:'Burundi',malawi:'Malawi',zambia:'Zambia',mozambique:'Mozambique',botswana:'Botswana',namibia:'Namibia',angola:'Angola',madagascar:'Madagascar',pakistan:'Pakistan',afghanistan:'Afghanistan',kazakhstan:'Kazakhstan',uzbekistan:'Uzbekistan',turkmenistan:'Turkmenistan',kyrgyzstan:'Kyrgyzstan',tajikistan:'Tajikistan',panama:'Panama',italy:'Italy',hungary:'Hungary',czechia:'Czechia',slovakia:'Slovakia',switzerland:'Switzerland',belgium:'Belgium',luxembourg:'Luxembourg',denmark:'Denmark',norway:'Norway',finland:'Finland',iceland:'Iceland',ireland:'Ireland',belarus:'Belarus',georgia:'Georgia',armenia:'Armenia',azerbaijan:'Azerbaijan',cyprus:'Cyprus',ghana:'Ghana',saudi_arabia:'Saudi Arabia',yemen:'Yemen',oman:'Oman',kuwait:'Kuwait',bahrain:'Bahrain',qatar:'Qatar',uae:'United Arab Emirates',tonga:'Tonga',samoa:'Samoa',fiji:'Fiji',vanuatu:'Vanuatu',solomon_islands:'Solomon Is.',kiribati:'Kiribati',palau:'Palau',micronesia_fsm:'Micronesia',marshall_islands:'Marshall Is.',bahamas:'Bahamas',south_korea:'South Korea',jamaica:'Jamaica',malta:'Malta',singapore:'Singapore',somalilandia:'Somaliland',trinidad_tobago:'Trinidad and Tobago',antigua_barbuda:'Antigua and Barb.',barbados:'Barbados',isla_man:'Isle of Man',grenada:'Grenada',santa_lucia:'Saint Lucia',tuvalu:null,curazao_abc:['Curaçao','Aruba'],pacifico_britanico:['Pitcairn Is.'],pacifico_frances:['Fr. Polynesia','New Caledonia','Wallis and Futuna Is.'],pacifico_nz:['Cook Is.','Niue']};
let fc=null;
function carga(){ if(fc)return fc; const t=require('topojson-client'); const topo=require(process.env.NE_TOPO||require.resolve('world-atlas/countries-50m.json')); fc=t.feature(topo,topo.objects.countries); return fc }
function pais(nombre){ const f=carga().features.find(f=>f.properties.name===nombre); if(!f)return null;
 const g=f.geometry; return g.type==='Polygon'?[g.coordinates]:g.coordinates }   // multipolygon [[outer,holes...]]
function poligonos(id){ const nm=MAPA[id]; if(!nm)return null; const ns=Array.isArray(nm)?nm:[nm]; let out=[]; for(const n of ns){ const p=pais(n); if(p)out.push(...p) } return out.length?out:null }
module.exports={MAPA,pais,poligonos,carga};

// LAS RECTAS QUE EXISTEN DE VERDAD. Fronteras actuales (admin-0) con tramos
// rectos alineados al meridiano o al paralelo de mas de medio grado: el
// paralelo 49, el 22 de Egipto, el meridiano 25 de Libia, las lineas
// coloniales de Africa. Una arista recta del mapa que cae sobre una de estas
// no es una caja dibujada a mano: es la frontera. `esRectaReal(m,n)` lo dice.
let RECTAS=null;
function rectas(){ if(RECTAS)return RECTAS; RECTAS={v:[],h:[]};   // v: [x, y0, y1]   h: [y, x0, x1]
 for(const f of carga().features){ const g=f.geometry; const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;
  // Natural Earth trocea sus rectas en pasos de un cuarto de grado: se
  // encadenan los tramos consecutivos del mismo eje y la misma coordenada
  for(const poly of polys)for(const r of poly){ let run=null;
   const cierra=()=>{ if(!run)return; if(run.eje==='v'&&run.hi-run.lo>0.5)RECTAS.v.push([run.c,run.lo,run.hi]); if(run.eje==='h'&&run.hi-run.lo>0.5)RECTAS.h.push([run.c,run.lo,run.hi]); run=null };
   for(let k=0;k+1<r.length;k++){ const a=r[k],b=r[k+1]; const dx=Math.abs(a[0]-b[0]),dy=Math.abs(a[1]-b[1]);
    const eje=dx<0.011&&dy>0.01?'v':(dy<0.011&&dx>0.01?'h':null);
    if(!eje){cierra();continue}
    const c=eje==='v'?a[0]:a[1], lo=eje==='v'?Math.min(a[1],b[1]):Math.min(a[0],b[0]), hi=eje==='v'?Math.max(a[1],b[1]):Math.max(a[0],b[0]);
    if(run&&run.eje===eje&&Math.abs(run.c-c)<0.011){ run.lo=Math.min(run.lo,lo); run.hi=Math.max(run.hi,hi) }
    else { cierra(); run={eje,c,lo,hi} } }
   cierra() } }
 return RECTAS }
function esRectaReal(m,n,tol){ tol=tol||0.1; const R=rectas(); const dx=Math.abs(m[0]-n[0]),dy=Math.abs(m[1]-n[1]);
 const vertical=dx<0.011; const lista=vertical?R.v:R.h; const c=vertical?(m[0]+n[0])/2:(m[1]+n[1])/2;
 const lo=vertical?Math.min(m[1],n[1]):Math.min(m[0],n[0]), hi=vertical?Math.max(m[1],n[1]):Math.max(m[0],n[0]);
 let ok=0; for(let i=0;i<5;i++){ const t=lo+(hi-lo)*(i+0.5)/5; if(lista.some(s=>Math.abs(s[0]-c)<tol&&t>=s[1]-tol&&t<=s[2]+tol))ok++ }
 return ok>=4 }
module.exports.rectas=rectas; module.exports.esRectaReal=esRectaReal;
