#!/usr/bin/env node
// LA GEOGRAFIA FISICA, POR FIN DENTRO.
//
// Durante toda la campana el proyecto tuvo un punto ciego declarado: tierra
// adentro no habia NINGUNA fuente. La costa la daba la mascara de tierra, y por
// eso las formas costeras son buenas y las de interior son cajas. Cada informe
// terminaba diciendo lo mismo -"para esto hace falta una fuente externa que el
// proyecto no tiene"- y ahi se quedaba.
//
// Ya esta. Natural Earth 1:50m, la misma escala que la mascara de costa que el
// mapa usa, trae cinco capas que son justo lo que faltaba:
//
//   rios y ejes de lago   Los rios son LA frontera natural del interior. El
//                         Amazonas, el Niger, el Obi, el Zambeze, el Danubio.
//   lagos                 La orilla de un lago tambien es frontera: Titicaca,
//                         Chad, Victoria, Baikal.
//   regiones fisicas      522 poligonos con nombre: SAHARA, SAHEL, KALAHARI,
//                         GOBI, CUENCA DEL AMAZONAS, CUENCA DEL CONGO, ESTEPA
//                         KAZAJA, MESETA DEL TIBET, GRAN CHACO, LLANOS, PAMPAS,
//                         GRANDES LLANURAS, DECCAN. Mas 129 cordilleras, que
//                         son la otra gran frontera natural.
//   playas salinas        Los sebjas y salares, que es donde no vive nadie.
//   glaciares             Hielo permanente, idem.
//
// Esta biblioteca las convierte una vez a un JSON compacto y las sirve a las
// demas herramientas. Las coordenadas se redondean a dos decimales, que es la
// precision con la que el mapa guarda sus anillos: guardar mas seria fingir
// una exactitud que el resto del fichero no tiene.
//
//   node fisico.js --convertir     lee los .shp y escribe fisico.json
//   node fisico.js <patron>        lista las regiones cuyo nombre encaja
//   NE=<carpeta con los .shp>      (por defecto ../data/50m_physical)
const fs=require('fs'); const path=require('path');
const RUTA=process.env.FISICO||path.join(__dirname,'fisico.json');
const ORIGEN=process.env.NE||path.join(__dirname,'..','data','50m_physical');

const R2=p=>[Math.round(p[0]*100)/100,Math.round(p[1]*100)/100];
function limpiaLinea(c){ const o=[]; let ult=null;
 for(const p of c){ const q=R2(p); if(ult&&q[0]===ult[0]&&q[1]===ult[1])continue; o.push(q); ult=q }
 return o.length>1?o:null }
function limpiaAnillo(c){ const o=limpiaLinea(c); if(!o||o.length<4)return null;
 if(o[0][0]===o[o.length-1][0]&&o[0][1]===o[o.length-1][1])o.pop();
 return o.length>=3?o:null }

async function convertir(){
 const shp=require('shapefile');
 const out={regiones:[],rios:[],lagos:[],playas:[],hielo:[]};
 async function leer(nombre,cb){
  // el .dbf de Natural Earth va en UTF-8; sin decirlo, Purus sale como PurAºs
  const src=await shp.open(path.join(ORIGEN,nombre+'.shp'),path.join(ORIGEN,nombre+'.dbf'),{encoding:'utf-8'});
  for(;;){ const r=await src.read(); if(r.done)break; cb(r.value) }
 }
 const polis=g=>g.type==='Polygon'?[g.coordinates]:g.coordinates;
 await leer('ne_50m_geography_regions_polys',f=>{
  const p=f.properties, g=f.geometry; if(!g)return;
  const anillos=[]; for(const poly of polis(g)){ const a=limpiaAnillo(poly[0]); if(a)anillos.push(a) }
  if(anillos.length)out.regiones.push({clase:p.FEATURECLA,nombre:p.NAME,es:p.NAME_ES||null,anillos});
 });
 await leer('ne_50m_rivers_lake_centerlines',f=>{
  const p=f.properties, g=f.geometry; if(!g)return;
  const lineas=g.type==='LineString'?[g.coordinates]:g.coordinates;
  const ls=[]; for(const l of lineas){ const c=limpiaLinea(l); if(c)ls.push(c) }
  if(ls.length)out.rios.push({nombre:p.name||p.NAME||null,rango:p.scalerank!=null?p.scalerank:p.SCALERANK,lineas:ls});
 });
 for(const [cap,arch] of [['lagos','ne_50m_lakes'],['playas','ne_50m_playas'],['hielo','ne_50m_glaciated_areas']]){
  await leer(arch,f=>{ const p=f.properties, g=f.geometry; if(!g)return;
   const anillos=[]; for(const poly of polis(g)){ const a=limpiaAnillo(poly[0]); if(a)anillos.push(a) }
   if(anillos.length)out[cap].push({nombre:p.name||p.NAME||null,anillos}) });
 }
 fs.writeFileSync(RUTA,JSON.stringify(out));
 console.log('regiones '+out.regiones.length+'  rios '+out.rios.length+'  lagos '+out.lagos.length+
  '  playas '+out.playas.length+'  hielo '+out.hielo.length);
 console.log('escrito '+RUTA+'  ('+(fs.statSync(RUTA).size/1048576).toFixed(1)+' MB)');
}

let CACHE=null;
function datos(){ if(!CACHE)CACHE=JSON.parse(fs.readFileSync(RUTA,'utf8')); return CACHE }
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
function region(patron){ const p=norm(patron);
 return datos().regiones.filter(r=>norm(r.nombre).indexOf(p)>=0||norm(r.es).indexOf(p)>=0) }
function rio(patron){ const p=norm(patron);
 return datos().rios.filter(r=>norm(r.nombre).indexOf(p)>=0) }
function rios(rangoMax){ const m=rangoMax==null?99:rangoMax; return datos().rios.filter(r=>r.rango<=m) }

if(require.main===module){
 if(process.argv.includes('--convertir')){ convertir(); }
 else { const p=process.argv[2]||''; const rs=p?region(p):datos().regiones;
  console.log('coincidencias: '+rs.length);
  for(const r of rs.slice(0,60))console.log('  '+String(r.clase).padEnd(16)+String(r.nombre).padEnd(34)+
   r.anillos.length+' anillos, '+r.anillos.reduce((s,a)=>s+a.length,0)+' vertices');
  const rr=p?rio(p):[]; if(rr.length){ console.log('rios: '+rr.length); for(const r of rr.slice(0,20))console.log('  '+r.nombre+'  rango '+r.rango+'  '+r.lineas.length+' tramos') }
 }
} else module.exports={datos,region,rio,rios,norm};
