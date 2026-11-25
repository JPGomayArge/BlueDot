#!/usr/bin/env node
// APLICA LAS BIOGRAFIAS DEL CANON DE CIVILIZACIONES A data/mapa.json.
//
// Las 200 civilizaciones del canon (CIVILIZACIONES_CANON.md) tienen biografia
// en data/canon/civilizaciones/<region>.js. Este paso la vuelca sobre las
// entidades del mapa: nombre, etiqueta, articulo de Wikipedia, resumen propio
// con fuente, capital, dudas declaradas, revision, y la linea de cada periodo
// (que cambio y por que). Marca la entidad con canon:1; la app pinta las
// demas apagadas y su ficha dice "sin revisar".
//
// Las fronteras NO se tocan aqui: una biografia que declare un tramo que el
// mapa no tiene (o al reves) sale en el informe como pendiente, y se arregla en
// las tablas de tools/, nunca a mano.
//
//   node biografias.js [mapa.json] [--aplica]
//
// Esquema de una biografia:
//   { id:'inca', nombre:'Imperio inca', etiqueta:'Incas', wiki:'Imperio incaico',
//     resumen:'Un parrafo propio...', fuente:'libro: Autor, Titulo (editorial, anio)',
//     capital:'Cuzco', dudas:'que no sabemos bien de sus fronteras',
//     tramos:[ { desde:1438, hasta:1471, nota:'Pachacutec...', wiki:'Pachacútec' }, ... ],
//     revisado:null | { por:'usuario', fecha:'AAAA-MM-DD' } }
// Un tramo cubre los periodos del mapa cuyo inicio cae en [desde, hasta).
const fs=require('fs'), path=require('path');
const ARG=process.argv.slice(2); const APLICA=ARG.includes('--aplica');
const RUTA=ARG.find(a=>!a.startsWith('--'))||path.join(__dirname,'..','mapa.json');
const DIR=path.join(__dirname,'civilizaciones');
const M=JSON.parse(fs.readFileSync(RUTA,'utf8')); const porId=new Map(M.civilizations.map(c=>[c.id,c]));
const bios=[]; const archivos=fs.existsSync(DIR)?fs.readdirSync(DIR).filter(f=>/\.js$/.test(f)).sort():[];
for(const f of archivos){ const t=require(path.join(DIR,f)); for(const b of t){ b._archivo=f; bios.push(b) } }
const err=[], pend=[]; let nTramos=0, nPeriodos=0;
const vistos=new Set();
for(const b of bios){
 const d=b._archivo+' › '+b.id;
 if(vistos.has(b.id))err.push(d+': id repetido'); vistos.add(b.id);
 const c=porId.get(b.id); if(!c){ err.push(d+': no existe en el mapa'); continue }
 for(const k of ['nombre','etiqueta','wiki','resumen','fuente'])if(!b[k]||typeof b[k]!=='string')err.push(d+': falta '+k);
 if(b.resumen&&(b.resumen.length<200||b.resumen.length>1200))err.push(d+': el resumen debe tener entre 200 y 1200 caracteres ('+b.resumen.length+')');
 if(b.etiqueta&&b.etiqueta.length>28)err.push(d+': etiqueta de mas de 28 caracteres');
 if(!Array.isArray(b.tramos)||!b.tramos.length){ err.push(d+': sin tramos'); continue }
 for(let i=0;i<b.tramos.length;i++){ const t=b.tramos[i];
  if(typeof t.desde!=='number'||typeof t.hasta!=='number'||t.hasta<=t.desde)err.push(d+': tramo '+i+' con fechas invalidas');
  if(!t.nota||t.nota.length<15)err.push(d+': tramo '+i+' sin nota');
  if(i&&t.desde!==b.tramos[i-1].hasta)err.push(d+': tramo '+i+' no empieza donde acaba el anterior ('+b.tramos[i-1].hasta+' vs '+t.desde+')');
  nTramos++ }
 // el mapa frente a la biografia
 const ini=Math.min(...c.periods.map(p=>p.start)), fin=Math.max(...c.periods.map(p=>p.end));
 const bIni=b.tramos[0].desde, bFin=b.tramos[b.tramos.length-1].hasta;
 if(bIni!==ini||bFin!==fin)pend.push(d+': el mapa va de '+ini+' a '+fin+' y la biografia de '+bIni+' a '+bFin+' (ajustar en tools/)');
 for(const t of b.tramos){ if(!c.periods.some(p=>p.start>=t.desde&&p.start<t.hasta&&p.end>t.desde))pend.push(d+': el tramo '+t.desde+'..'+t.hasta+' no tiene periodo en el mapa (falta una frontera para ese tramo)') }
 for(const p of c.periods){ const t=b.tramos.find(t=>p.start>=t.desde&&p.start<t.hasta); if(!t){ pend.push(d+': el periodo '+p.start+'..'+p.end+' del mapa no cae en ningun tramo'); continue }
  p.name=t.nota; if(t.wiki)p.wikiTitle=t.wiki; else if(b.wiki&&!p.wikiTitle)p.wikiTitle=b.wiki; nPeriodos++ }
 if(APLICA){ c.canon=1; c.name=b.nombre; c.etiqueta=b.etiqueta; c.wikiTitle=b.wiki; c.resumen=b.resumen; c.fuente=b.fuente;
  if(b.capital)c.capital=b.capital; else delete c.capital; if(b.dudas)c.dudas=b.dudas; else delete c.dudas; c.revisado=b.revisado||null }
}
console.log('biografias: '+bios.length+' en '+archivos.length+' archivos · '+nTramos+' tramos · '+nPeriodos+' periodos del mapa con linea');
if(pend.length){ console.log('\nPENDIENTES DE FRONTERA ('+pend.length+'):'); for(const p of pend)console.log('  '+p) }
if(err.length){ console.log('\nERRORES ('+err.length+'):'); for(const e of err)console.log('  '+e); process.exit(1) }
if(APLICA){
 // las entidades que ya no tienen biografia dejan de ser canon
 for(const c of M.civilizations)if(c.canon&&!vistos.has(c.id)){ delete c.canon; delete c.resumen; delete c.fuente; delete c.revisado; delete c.capital; delete c.dudas }
 const L=require(path.join(__dirname,'..','..','tools','lib.js')); const doc=L.load(RUTA);
 // lib.save reescribe desde CIV decodificado; copiamos los campos nuevos sobre esa copia
 const porId2=new Map(doc.CIV.map(c=>[c.id,c]));
 for(const c of M.civilizations){ const o=porId2.get(c.id); if(!o)continue; for(const k of ['canon','name','etiqueta','wikiTitle','resumen','fuente','capital','dudas','revisado']){ if(c[k]===undefined)delete o[k]; else o[k]=c[k] }
  for(let i=0;i<c.periods.length;i++){ if(o.periods[i]){ o.periods[i].name=c.periods[i].name; if(c.periods[i].wikiTitle)o.periods[i].wikiTitle=c.periods[i].wikiTitle } } }
 L.save(null,doc.R,doc.CIV,RUTA); console.log('escrito '+RUTA+' · canon: '+M.civilizations.filter(c=>c.canon).length+' entidades');
} else console.log('(sin --aplica no se escribe)');
