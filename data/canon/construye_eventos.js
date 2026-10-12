#!/usr/bin/env node
// FUNDE EL CANON Y EL FONDO EN events_extended.json.
//
// Lee todos los canon_*.js de este directorio (eventos y personas), el fondo
// filtrado del volcado viejo (fondo.js sobre events_extended.json original) y
// escribe el JSON con el esquema que la app entiende:
//   { id, year, lat, lon, labels:{es,en}, category, importance, wikiTitles:{es,en},
//     wikidataId?, reg, nota?, persona?, momento?, otro? }
// Una persona del canon da dos eventos (nacimiento y muerte) enlazados.
//
//   node construye_eventos.js <events_extended.json viejo> <salida.json> [--sin-fondo]
const fs=require('fs'), path=require('path');
const viejo=process.argv[2], salida=process.argv[3]; const SINFONDO=process.argv.includes('--sin-fondo');
if(!viejo||!salida){ console.log('uso: node construye_eventos.js <viejo.json> <salida.json> [--sin-fondo]'); process.exit(1) }
const CATS=['politica','guerras','ciencia','exploracion','religion','cultura','economia','sociedad','desastres','personas'];
const REGS=['europa','mena','africa','asia_oriental','asia_sur','asia_central','norteamerica','latam','oceania'];

// --- el canon --------------------------------------------------------------------
const canon=[]; const archivos=fs.readdirSync(__dirname).filter(f=>/^canon_.*\.js$/.test(f)).sort();
// PROCEDENCIA. Cada entrada sale con fuente, fecha de alta y revision. Lo que
// la entrada no diga lo pone el META de su archivo (quien lo redacto y cuando);
// la fuente por defecto es su articulo de Wikipedia. `revisado` queda en null
// hasta que una persona lo revise: el mapa no finge revisiones.
for(const f of archivos){ const t=require(path.join(__dirname,f)); const M=t.META||{};
 for(const e of t){ e._archivo=f;
  if(!e.fuente)e.fuente=(M.fuente==='wikipedia'||!M.fuente)?('wikipedia:'+(e.wiki||e.es)):M.fuente;
  if(!e.alta)e.alta=M.alta||null; if(!e.autor)e.autor=M.autor||null; if(e.revisado===undefined)e.revisado=M.revisado||null;
  canon.push(e) } }
const out=[]; const ids=new Set(); let nPer=0;
const err=[]; const pon=(o)=>{ if(ids.has(o.id))err.push('id repetido: '+o.id); ids.add(o.id); out.push(o) };
for(const e of canon){
 if(!CATS.includes(e.cat))err.push(e.id+': categoria invalida '+e.cat);
 if(!REGS.includes(e.reg))err.push(e.id+': region invalida '+e.reg);
 if(!(e.imp>=1&&e.imp<=5))err.push(e.id+': importancia invalida');
 if(e.cat==='personas'){
  if(!e.nac)err.push(e.id+': persona sin nac'); else {
   nPer++;
   const base={labels:{es:e.es,en:e.en||e.es},category:'personas',importance:e.imp,wikiTitles:{es:e.wiki||e.es,en:e.wiki_en||e.en||e.es},reg:e.reg,persona:e.id,por:e.por||undefined,fuente:e.fuente,alta:e.alta,autor:e.autor,revisado:e.revisado};
   const nac={id:e.id+'_nac',year:e.nac.y,lat:e.nac.lat,lon:e.nac.lon,momento:'nac',lugar:e.nac.lugar,...base};
   if(e.def){ const def={id:e.id+'_def',year:e.def.y,lat:e.def.lat,lon:e.def.lon,momento:'def',lugar:e.def.lugar,...base};
    nac.otro={id:def.id,year:def.year,lat:def.lat,lon:def.lon,lugar:def.lugar}; def.otro={id:nac.id,year:nac.year,lat:nac.lat,lon:nac.lon,lugar:nac.lugar}; pon(nac); pon(def) }
   else pon(nac);
  }
 } else {
  if(typeof e.y!=='number')err.push(e.id+': sin anio');
  const o={id:e.id,year:e.y,lat:e.lat,lon:e.lon,labels:{es:e.es,en:e.en||e.es},category:e.cat,importance:e.imp,wikiTitles:{es:e.wiki||e.es,en:e.wiki_en||e.en||e.es},reg:e.reg,fuente:e.fuente,alta:e.alta,autor:e.autor,revisado:e.revisado};
  if(e.mar)o.mar=1; if(e.nota)o.nota=e.nota; if(e.wikidataId)o.wikidataId=e.wikidataId;
  pon(o);
 }
}
console.log('canon: '+canon.length+' entradas en '+archivos.length+' archivos -> '+out.length+' eventos ('+nPer+' personas)');

// --- el fondo ----------------------------------------------------------------------
let nFondo=0, nDup=0;
if(!SINFONDO){
 const F=require('./fondo.js'); const V=JSON.parse(fs.readFileSync(viejo,'utf8'));
 // indice del canon por anio+titulo normalizado, para no duplicar
 const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\b(de|del|la|el|los|las|en|y|the|of|a)\b/g,' ').replace(/\s+/g,' ').trim();
 const claves=new Set(); for(const o of out){ claves.add(o.year+'|'+norm(o.labels.es).slice(0,20)); if(o.wikidataId)claves.add('Q'+o.wikidataId) }
 const palabrasCanon=new Map(); for(const o of out){ const k=norm(o.labels.es).split(' ').filter(w=>w.length>4).slice(0,3).join(' '); if(k)palabrasCanon.set(o.year+'|'+k,o.id) }
 for(const v of V){ const r=F.filtra(v); if(!r)continue;
  if(v.wikidataId&&claves.has('Q'+v.wikidataId)){nDup++;continue}
  if(claves.has(v.year+'|'+norm(v.labels.es).slice(0,20))){nDup++;continue}
  const k=norm(v.labels.es).split(' ').filter(w=>w.length>4).slice(0,3).join(' '); if(k&&palabrasCanon.has(v.year+'|'+k)){nDup++;continue}
  const o={id:v.id,year:v.year,lat:v.lat,lon:v.lon,labels:v.labels,category:r.cat,importance:r.imp,wikiTitles:v.wikiTitles||v.labels,reg:F.region(v.lat,v.lon),fondo:1,fuente:v.wikidataId?'wikidata:'+v.wikidataId:'wikidata',alta:'2026-10-11',autor:'wikidata',revisado:null};
  if(v.wikidataId)o.wikidataId=v.wikidataId;
  if(ids.has(o.id)){nDup++;continue}
  pon(o); nFondo++ }
 console.log('fondo: '+nFondo+' conservados de '+V.length+' ('+nDup+' duplicaban el canon)');
}
if(err.length){ console.log('\nERRORES ('+err.length+'):'); for(const e of err.slice(0,40))console.log('  '+e); process.exit(1) }
out.sort((a,b)=>a.year-b.year||a.id.localeCompare(b.id));
fs.writeFileSync(salida,JSON.stringify(out));
// la version de los datos, para que la app la ensene y cualquiera pueda citarla
const ver={eventos:out.length,canon:out.length-nFondo,fondo:nFondo,fecha:new Date().toISOString().slice(0,10)};
fs.writeFileSync(path.join(path.dirname(salida),'eventos_version.json'),JSON.stringify(ver)); console.log('version: '+JSON.stringify(ver));
const porCat={}; for(const o of out)porCat[o.category]=(porCat[o.category]||0)+1;
console.log('total '+out.length+' -> '+salida+' ('+(fs.statSync(salida).size/1024).toFixed(0)+' KB)'); console.log(JSON.stringify(porCat));
