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
//   data/paquetes/siglo_NN.json el fondo de importancia 1 de cada siglo, en forma
//                              compacta (filas, no objetos). Se publican en la
//                              release de GitHub y la app los descarga a
//                              eleccion de la persona, por siglo.
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

// Un paquete por siglo desde el año 1000 y cuatro tramos anchos antes (el
// fondo anterior es escaso). Los nombres son rangos, no periodos de una sola
// civilizacion ("Edad Media" no dice nada en Pekin ni en Cuzco). La app lleva
// la misma lista (PAQUETES en index.jsx): si cambia aqui, cambia alli.
const PAQUETES=[
 {id:'antes_m3000',nombre:'Hasta 3000 a.C.',desde:-10000,hasta:-3000,grupo:'antes'},
 {id:'antes_m1000',nombre:'3000 a 1000 a.C.',desde:-3000,hasta:-1000,grupo:'antes'},
 {id:'antes_0500',nombre:'1000 a.C. a 500 d.C.',desde:-1000,hasta:500,grupo:'antes'},
 {id:'antes_1000',nombre:'500 a 1000',desde:500,hasta:1000,grupo:'antes'},
 {id:'siglo_11',nombre:'Siglo XI (1000–1100)',desde:1000,hasta:1100,grupo:'medieval'},
 {id:'siglo_12',nombre:'Siglo XII (1100–1200)',desde:1100,hasta:1200,grupo:'medieval'},
 {id:'siglo_13',nombre:'Siglo XIII (1200–1300)',desde:1200,hasta:1300,grupo:'medieval'},
 {id:'siglo_14',nombre:'Siglo XIV (1300–1400)',desde:1300,hasta:1400,grupo:'medieval'},
 {id:'siglo_15',nombre:'Siglo XV (1400–1500)',desde:1400,hasta:1500,grupo:'medieval'},
 {id:'siglo_16',nombre:'Siglo XVI (1500–1600)',desde:1500,hasta:1600,grupo:'moderna'},
 {id:'siglo_17',nombre:'Siglo XVII (1600–1700)',desde:1600,hasta:1700,grupo:'moderna'},
 {id:'siglo_18',nombre:'Siglo XVIII (1700–1800)',desde:1700,hasta:1800,grupo:'moderna'},
 {id:'siglo_19',nombre:'Siglo XIX (1800–1900)',desde:1800,hasta:1900,grupo:'moderna'},
 {id:'siglo_20',nombre:'Siglo XX (1900–2000)',desde:1900,hasta:2000,grupo:'actual'},
 {id:'siglo_21',nombre:'Siglo XXI (desde 2000)',desde:2000,hasta:2100,grupo:'actual'},
];
const paqueteDe=y=>PAQUETES.find(r=>y>=r.desde&&y<r.hasta)||PAQUETES[PAQUETES.length-1];

// --- base: canon + fondo de importancia 2 ---------------------------------------
const base=E.filter(e=>!e.fondo||(e.importance||1)>=2);
fs.writeFileSync(path.join(DATA,'eventos_base.json'),JSON.stringify(base));
const nCanon=base.filter(e=>!e.fondo).length;
console.log('base: '+base.length+' eventos ('+nCanon+' canon + '+(base.length-nCanon)+' fondo imp 2) -> eventos_base.json '+(fs.statSync(path.join(DATA,'eventos_base.json')).size/1024).toFixed(0)+' KB');

// --- eras: fondo de importancia 1, compacto ----------------------------------------
// Fila: [id, anio, lat, lon, es, en, cat, reg, wikidataId, wiki_es, wiki_en, aprox, fin]
// en vacio = igual que es; wiki_es/wiki_en vacios = iguales a la etiqueta.
const CAMPOS=['id','year','lat','lon','es','en','cat','reg','wd','wiki_es','wiki_en','aprox','fin'];
const DIR=path.join(DATA,'paquetes'); fs.mkdirSync(DIR,{recursive:true});
const resto=E.filter(e=>e.fondo&&(e.importance||1)<2);
const porPaq=new Map(PAQUETES.map(r=>[r.id,[]]));
for(const e of resto){ const es=e.labels.es||e.labels.en||'', en=e.labels.en||'';
 const wes=(e.wikiTitles&&e.wikiTitles.es)||'', wen=(e.wikiTitles&&e.wikiTitles.en)||'';
 porPaq.get(paqueteDe(e.year).id).push([e.id,e.year,+(+e.lat).toFixed(2),+(+e.lon).toFixed(2),es,en===es?'':en,e.category,e.reg||'',e.wikidataId||0,wes===es?'':wes,wen===(en||es)?'':wen,e.aprox||0,e.fin||0]) }
const manifiesto={fecha:FECHA,base:{eventos:base.length,canon:nCanon,fecha:FECHA},campos:CAMPOS,paquetes:[]};
for(const r of PAQUETES){ const filas=porPaq.get(r.id); filas.sort((a,b)=>a[1]-b[1]||(a[0]<b[0]?-1:1));
 const obj={id:r.id,nombre:r.nombre,desde:r.desde,hasta:r.hasta,fecha:FECHA,eventos:filas.length,campos:CAMPOS,e:filas};
 const archivo=path.join(DIR,r.id+'.json'); fs.writeFileSync(archivo,JSON.stringify(obj));
 const bytes=fs.statSync(archivo).size;
 manifiesto.paquetes.push({id:r.id,nombre:r.nombre,grupo:r.grupo,desde:r.desde,hasta:r.hasta,eventos:filas.length,bytes,archivo:r.id+'.json',fecha:FECHA});
  console.log('  '+r.id.padEnd(12)+'  '+r.nombre.padEnd(24)+String(filas.length).padStart(6)+' eventos  '+(bytes/1024).toFixed(0).padStart(5)+' KB') }
fs.writeFileSync(path.join(DIR,'manifiesto.json'),JSON.stringify(manifiesto,null,1));
const total=manifiesto.paquetes.reduce((s,r)=>s+r.eventos,0), bytes=manifiesto.paquetes.reduce((s,r)=>s+r.bytes,0);
console.log('paquetes: '+total+' eventos en '+PAQUETES.length+' paquetes, '+(bytes/1024/1024).toFixed(1)+' MB -> '+DIR);
if(base.length+total!==E.length){ console.log('!! no cuadra: base '+base.length+' + paquetes '+total+' != '+E.length); process.exit(1) }
