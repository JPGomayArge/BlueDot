#!/usr/bin/env node
// EMPAQUETA LOS EVENTOS: LO QUE VA DENTRO DE LA APP Y LO QUE SE DESCARGA.
//
// La app no puede llevar dentro decenas de miles de eventos (los parsea todos
// al arrancar). Asi que events_extended.json, que sigue siendo el resultado
// completo de construye_eventos.js y lo que verifica la accion de GitHub, se
// reparte en:
//
//   data/eventos_base.json     lo que va de serie en la app: el canon entero
//                              mas el fondo de importancia 2. Siempre cargado.
//   data/paquetes/era_NN.json  el fondo de importancia 1 de cada era, en forma
//                              compacta (filas, no objetos). Se publican en la
//                              release de GitHub y la app los descarga a
//                              eleccion de la persona, por era.
//   data/paquetes/manifiesto.json  que paquetes hay, cuantos eventos, cuanto
//                              pesan y de que fecha. La app lo lee de
//                              <repo>/releases/latest/download/manifiesto.json
//
//   node empaqueta.js [events_extended.json] [dir data]
const fs=require('fs'), path=require('path');
const ENTRADA=process.argv[2]||path.join(__dirname,'..','events_extended.json');
const DATA=process.argv[3]||path.dirname(ENTRADA);
const E=JSON.parse(fs.readFileSync(ENTRADA,'utf8'));
let ver={}; try{ ver=JSON.parse(fs.readFileSync(path.join(path.dirname(ENTRADA),'eventos_version.json'),'utf8')) }catch(e){}
const FECHA=ver.fecha||new Date().toISOString().slice(0,10);

// Las eras de CANON.md. Los nombres son rangos, no periodos de una sola
// civilizacion ("Edad Media" no dice nada en Pekin ni en Cuzco).
const ERAS=[
 {id:'era_00',nombre:'10000 a 3000 a.C.',desde:-10000,hasta:-3000},
 {id:'era_01',nombre:'3000 a 1000 a.C.',desde:-3000,hasta:-1000},
 {id:'era_02',nombre:'1000 a.C. a 500 d.C.',desde:-1000,hasta:500},
 {id:'era_03',nombre:'500 a 1000',desde:500,hasta:1000},
 {id:'era_04',nombre:'1000 a 1500',desde:1000,hasta:1500},
 {id:'era_05',nombre:'1500 a 1700',desde:1500,hasta:1700},
 {id:'era_06',nombre:'1700 a 1800',desde:1700,hasta:1800},
 {id:'era_07',nombre:'1800 a 1900',desde:1800,hasta:1900},
 {id:'era_08',nombre:'1900 a 1950',desde:1900,hasta:1950},
 {id:'era_09',nombre:'Desde 1950',desde:1950,hasta:2100},
];
const eraDe=y=>ERAS.find(r=>y>=r.desde&&y<r.hasta)||ERAS[0];

// --- base: canon + fondo de importancia 2 ---------------------------------------
const base=E.filter(e=>!e.fondo||(e.importance||1)>=2);
fs.writeFileSync(path.join(DATA,'eventos_base.json'),JSON.stringify(base));
const nCanon=base.filter(e=>!e.fondo).length;
console.log('base: '+base.length+' eventos ('+nCanon+' canon + '+(base.length-nCanon)+' fondo imp 2) -> eventos_base.json '+(fs.statSync(path.join(DATA,'eventos_base.json')).size/1024).toFixed(0)+' KB');

// --- eras: fondo de importancia 1, compacto ----------------------------------------
// Fila: [id, anio, lat, lon, es, en, cat, reg, wikidataId, wiki_es, wiki_en, aprox]
// en vacio = igual que es; wiki_es/wiki_en vacios = iguales a la etiqueta.
const CAMPOS=['id','year','lat','lon','es','en','cat','reg','wd','wiki_es','wiki_en','aprox'];
const DIR=path.join(DATA,'paquetes'); fs.mkdirSync(DIR,{recursive:true});
const resto=E.filter(e=>e.fondo&&(e.importance||1)<2);
const porEra=new Map(ERAS.map(r=>[r.id,[]]));
for(const e of resto){ const es=e.labels.es||e.labels.en||'', en=e.labels.en||'';
 const wes=(e.wikiTitles&&e.wikiTitles.es)||'', wen=(e.wikiTitles&&e.wikiTitles.en)||'';
 porEra.get(eraDe(e.year).id).push([e.id,e.year,+(+e.lat).toFixed(2),+(+e.lon).toFixed(2),es,en===es?'':en,e.category,e.reg||'',e.wikidataId||0,wes===es?'':wes,wen===(en||es)?'':wen,e.aprox?1:0]) }
const manifiesto={fecha:FECHA,base:{eventos:base.length,canon:nCanon,fecha:FECHA},campos:CAMPOS,eras:[]};
for(const r of ERAS){ const filas=porEra.get(r.id); filas.sort((a,b)=>a[1]-b[1]||(a[0]<b[0]?-1:1));
 const obj={id:r.id,nombre:r.nombre,desde:r.desde,hasta:r.hasta,fecha:FECHA,eventos:filas.length,campos:CAMPOS,e:filas};
 const archivo=path.join(DIR,r.id+'.json'); fs.writeFileSync(archivo,JSON.stringify(obj));
 const bytes=fs.statSync(archivo).size;
 manifiesto.eras.push({id:r.id,nombre:r.nombre,desde:r.desde,hasta:r.hasta,eventos:filas.length,bytes,archivo:r.id+'.json',fecha:FECHA});
 console.log('  '+r.id+'  '+r.nombre.padEnd(22)+String(filas.length).padStart(6)+' eventos  '+(bytes/1024).toFixed(0).padStart(5)+' KB') }
fs.writeFileSync(path.join(DIR,'manifiesto.json'),JSON.stringify(manifiesto,null,1));
const total=manifiesto.eras.reduce((s,r)=>s+r.eventos,0), bytes=manifiesto.eras.reduce((s,r)=>s+r.bytes,0);
console.log('paquetes: '+total+' eventos en '+ERAS.length+' eras, '+(bytes/1024/1024).toFixed(1)+' MB -> '+DIR);
if(base.length+total!==E.length){ console.log('!! no cuadra: base '+base.length+' + eras '+total+' != '+E.length); process.exit(1) }
