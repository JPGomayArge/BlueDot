#!/usr/bin/env node
// COMPRUEBA QUE CADA TITULO DE WIKIPEDIA DEL CANON EXISTE (necesita red).
//
// Pregunta a la API de es.wikipedia (y en.wikipedia para wiki_en) por los
// titulos en bloques de 50, siguiendo redirecciones, y lista los que no
// existen o son paginas de desambiguacion. La app tiene una cadena de
// respaldo (wikidataId -> titulos -> busqueda por texto), asi que un titulo
// malo no rompe nada, pero un titulo bueno ahorra una busqueda y evita
// que la ficha caiga en un articulo equivocado.
//
//   node verifica_wiki.js            (todos los canon_*.js)
//   node verifica_wiki.js --arreglar (escribe wiki_sugerido.json con las redirecciones resueltas)
//   node verifica_wiki.js --archivos=canon_07,canon_08   (solo esos archivos)
// Espera 0,4 s entre bloques y reintenta cuando Wikipedia devuelve 429.
const fs=require('fs'), path=require('path');
const soloArg=process.argv.find(a=>a.startsWith('--archivos=')); const solo=soloArg?soloArg.slice(11).split(','):null;
const items=[]; for(const f of fs.readdirSync(__dirname).filter(f=>/^canon_.*\.js$/.test(f)).sort()){ if(solo&&!solo.some(x=>f.startsWith(x)))continue; for(const e of require(path.join(__dirname,f))) items.push({...e,_archivo:f}) }
const malosLista=[];
const espera=ms=>new Promise(r=>setTimeout(r,ms));
async function consulta(lang,titulos){
 const url='https://'+lang+'.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageprops&ppprop=disambiguation&titles='+encodeURIComponent(titulos.join('|'));
 for(let intento=1;intento<=6;intento++){
  const r=await fetch(url,{headers:{'User-Agent':'BlueDot/1.0 (verifica_wiki; github.com/JPGomayArge/BlueDot)'}});
  if(r.status===429||r.status>=500){ const ra=Number(r.headers.get('retry-after'))||intento*5; process.stdout.write('('+r.status+' espera '+ra+'s)'); await espera(ra*1000); continue }
  if(!r.ok)throw new Error(lang+' HTTP '+r.status); return r.json();
 }
 throw new Error(lang+' HTTP 429 tras seis intentos');
}
(async()=>{
 const sugerido={}; let malos=0, desamb=0, redir=0;
 for(const [lang,campo] of [['es','wiki'],['en','wiki_en']]){
  const lista=items.map(e=>({id:e.id,t:e[campo]||(lang==='es'?e.es:e.en)})).filter(x=>x.t);
  for(let i=0;i<lista.length;i+=50){ const bloque=lista.slice(i,i+50); let q; try{ q=await consulta(lang,bloque.map(x=>x.t)) }catch(err){ console.log('  !! '+err.message); continue }
   const red=new Map(); for(const r of (q.query.redirects||[]))red.set(r.from,r.to); const normal=new Map(); for(const n of (q.query.normalized||[]))normal.set(n.from,n.to);
   const paginas=Object.values(q.query.pages||{});
   for(const x of bloque){ let t=normal.get(x.t)||x.t; if(red.has(t)){ redir++; t=red.get(t); sugerido[x.id+'|'+campo]=t }
    const p=paginas.find(p=>p.title===t); if(!p||p.missing!==undefined){ malos++; malosLista.push({id:x.id,campo,titulo:x.t,motivo:'no existe'}); console.log('  NO EXISTE ['+lang+'] '+x.id+': '+x.t); continue }
    if(p.pageprops&&p.pageprops.disambiguation!==undefined){ desamb++; malosLista.push({id:x.id,campo,titulo:x.t,motivo:'desambiguacion'}); console.log('  DESAMBIGUACION ['+lang+'] '+x.id+': '+x.t) } }
   process.stdout.write('.'); await espera(400); }
  console.log('\n'+lang+': '+lista.length+' titulos comprobados');
 }
 console.log('no existen: '+malos+'   desambiguaciones: '+desamb+'   redirecciones: '+redir);
 if(process.argv.includes('--arreglar')){ fs.writeFileSync(path.join(__dirname,'wiki_sugerido.json'),JSON.stringify(sugerido,null,1)); fs.writeFileSync(path.join(__dirname,'wiki_malos.json'),JSON.stringify(malosLista,null,1)); console.log('-> wiki_sugerido.json (titulo final de cada redireccion) y wiki_malos.json (los que no existen); node aplica_wiki.js escribe las redirecciones en los canon_*.js') }
})();
