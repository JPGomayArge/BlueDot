#!/usr/bin/env node
// BUSCA EL TITULO CORRECTO DE LOS QUE verifica_wiki.js MARCO COMO INEXISTENTES (necesita red).
//
// Para cada entrada de wiki_malos.json pregunta por el enlace interidioma: si falta
// el titulo en es.wikipedia, pide a en.wikipedia el "langlink" es del articulo
// ingles (y al reves). Es la forma exacta de saber como se llama el articulo en
// el otro idioma, sin adivinar. Lo que encuentra lo anade a wiki_sugerido.json
// (para que `node aplica_wiki.js` lo escriba en los canon_*.js) y lo que no tiene
// articulo en ese idioma lo lista: ahi la app usara el otro idioma.
//   node resuelve_wiki.js
const fs=require('fs'), path=require('path');
const items=new Map(); for(const f of fs.readdirSync(__dirname).filter(f=>/^canon_.*\.js$/.test(f)).sort()) for(const e of require(path.join(__dirname,f))) items.set(e.id,e);
const malos=JSON.parse(fs.readFileSync(path.join(__dirname,'wiki_malos.json'),'utf8'));
const sugPath=path.join(__dirname,'wiki_sugerido.json'); const sug=fs.existsSync(sugPath)?JSON.parse(fs.readFileSync(sugPath,'utf8')):{};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
async function langlinks(desde,hacia,titulos){
 const url='https://'+desde+'.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=langlinks&lllang='+hacia+'&lllimit=500&titles='+encodeURIComponent(titulos.join('|'));
 for(let i=1;i<=6;i++){ const r=await fetch(url,{headers:{'User-Agent':'BlueDot/1.0 (resuelve_wiki; github.com/JPGomayArge/BlueDot)'}});
  if(r.status===429||r.status>=500){ const ra=Number(r.headers.get('retry-after'))||i*5; process.stdout.write('('+r.status+' espera '+ra+'s)'); await espera(ra*1000); continue }
  if(!r.ok)throw new Error(desde+' HTTP '+r.status); return r.json() }
 throw new Error(desde+' HTTP 429 tras seis intentos');
}
(async()=>{
 let hallados=0; const sinArticulo=[];
 for(const [campo,desde,hacia,otro] of [['wiki','en','es','wiki_en'],['wiki_en','es','en','wiki']]){
  const lista=malos.filter(m=>m.campo===campo).map(m=>{ const e=items.get(m.id); return e&&{id:m.id,t:sug[m.id+'|'+otro]||e[otro]||(otro==='wiki'?e.es:e.en)} }).filter(Boolean);
  for(let i=0;i<lista.length;i+=50){ const bloque=lista.slice(i,i+50); let q; try{ q=await langlinks(desde,hacia,bloque.map(x=>x.t)) }catch(err){ console.log('  !! '+err.message); continue }
   const red=new Map(); for(const r of (q.query.redirects||[]))red.set(r.from,r.to); const normal=new Map(); for(const n of (q.query.normalized||[]))normal.set(n.from,n.to);
   const paginas=Object.values(q.query.pages||{});
   for(const x of bloque){ let t=normal.get(x.t)||x.t; if(red.has(t))t=red.get(t); const p=paginas.find(p=>p.title===t);
    const ll=p&&p.langlinks&&p.langlinks.find(l=>l.lang===hacia);
    if(ll){ sug[x.id+'|'+campo]=ll['*']; hallados++; console.log('  '+x.id+' '+campo+" -> '"+ll['*']+"'") }
    else sinArticulo.push(x.id+' ('+campo+', desde "'+x.t+'"'+(p&&p.missing===undefined?'':', el articulo de origen tampoco existe')+')') }
   await espera(400) }
 }
 fs.writeFileSync(sugPath,JSON.stringify(sug,null,1));
 console.log('\nhallados: '+hallados+' -> wiki_sugerido.json (ahora: node aplica_wiki.js)');
 if(sinArticulo.length){ console.log('sin articulo en ese idioma ('+sinArticulo.length+'); la app usara el otro idioma:'); for(const s of sinArticulo)console.log('  '+s) }
})();
