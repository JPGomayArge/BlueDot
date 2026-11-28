#!/usr/bin/env node
// EXTRAE PERSONAS DE WIKIDATA PARA EL FONDO: DOS PINES, NACIMIENTO Y MUERTE.
//
// El canon tiene 432 personas escritas a mano. Este extractor trae las demas
// que importan, con el mismo criterio que el resto del fondo: cuantas Wikipedias
// tienen articulo sobre ellas. Aqui se trae a toda persona con 20 Wikipedias
// (40 si nacio en el siglo XX, que esta lleno de deportistas y actores con muchos
// articulos y poca historia); el liston definitivo lo pone fondo.js segun la
// region: a Europa y Norteamerica, de las que hay registro de sobra, les pide
// 60 y 100. Importancia 2 con 120 o mas, 1 el resto. Se cambia con --min y --min-xx.
//
// Cada persona da dos sucesos: "Nombre: nacimiento" en el lugar de nacimiento
// (P19) y "Nombre: muerte" en el de muerte (P20), enlazados entre si como las
// personas del canon. Si el lugar no tiene coordenada se usa la de su unidad
// administrativa (aprox:1). Sin lugar de nacimiento no entra: un pin en la
// capital del pais seria una mentira.
//
// Corre en una maquina con red. Reanudable (cache en data/_wikidata_cache/).
//
//   node data/canon/fondo_wikidata_personas.js                  todo (1-2 horas)
//   node data/canon/fondo_wikidata_personas.js --prueba         nacidos entre 1450 y 1500
//   node data/canon/fondo_wikidata_personas.js --min 60 --min-xx 90
//   node data/canon/fondo_wikidata_personas.js --desde 1800 --hasta 1900
//
// Salida: data/fondo_wikidata_personas.json. Se funde con los otros volcados:
//   node construye_eventos.js ../fondo_wikidata.json,../fondo_wikidata_nuevo.json,../fondo_wikidata_entidades.json,../fondo_wikidata_personas.json ../events_extended.json
const fs=require('fs'), path=require('path');
const ARG=process.argv.slice(2); const flag=f=>ARG.includes(f); const val=(f,d)=>{ const i=ARG.indexOf(f); return i>=0?ARG[i+1]:d };
const PRUEBA=flag('--prueba');
const DESDE=parseInt(val('--desde',PRUEBA?'1450':'-3000')); const HASTA=parseInt(val('--hasta',PRUEBA?'1500':'2010'));
const MIN=parseInt(val('--min','20')), MIN_XX=parseInt(val('--min-xx','40')), IMP2=parseInt(val('--imp2','120'));
const DATA=path.resolve(__dirname,'..'); const CACHE=path.join(DATA,'_wikidata_cache'); fs.mkdirSync(CACHE,{recursive:true});
const SALIDA=path.join(DATA,PRUEBA?'fondo_wikidata_personas_prueba.json':'fondo_wikidata_personas.json');
const ENDPOINT='https://query.wikidata.org/sparql';
const UA='BlueDot/1.0 (https://github.com/JPGomayArge/BlueDot; globo historico libre) node';
const log=(...a)=>{ const t=new Date().toISOString().slice(11,19); console.log(t+'  '+a.join(' ')) };

// --- consultas ---------------------------------------------------------------------------
const espera=ms=>new Promise(r=>setTimeout(r,ms));
let nConsultas=0;
async function sparql(q,intentos=6){
 for(let k=0;k<intentos;k++){
  nConsultas++;
  try{
   const r=await fetch(ENDPOINT+'?format=json&query='+encodeURIComponent(q),{headers:{'Accept':'application/sparql-results+json','User-Agent':UA}});
   if(r.status===429||r.status>=500){ const ra=parseInt(r.headers.get('retry-after')||'0'); const t=Math.max(ra*1000,5000*Math.pow(2,k)); log('   servidor '+r.status+', espero '+(t/1000)+' s'); await espera(t); continue }
   if(!r.ok){ const txt=await r.text(); throw new Error('HTTP '+r.status+' '+txt.slice(0,200)) }
   const j=await r.json(); await espera(300); return j.results.bindings;
  }catch(e){ if(/timeout|Timeout/.test(String(e))&&k<intentos-1){ await espera(5000); continue } if(k===intentos-1)throw e; await espera(3000*(k+1)) }
 }
 throw new Error('sin respuesta');
}
const v=(b,k)=>b[k]?b[k].value:undefined;
const qid=u=>u?u.replace(/^.*\/(Q\d+)$/,'$1'):undefined;
const fecha=y=>(y<0?'-':'')+String(Math.abs(y)).padStart(4,'0')+'-01-01T00:00:00Z';
function cache(nombre,calc){ const p=path.join(CACHE,nombre); if(fs.existsSync(p))return Promise.resolve(JSON.parse(fs.readFileSync(p,'utf8'))); return calc().then(x=>{ fs.writeFileSync(p,JSON.stringify(x)); return x }) }
function anioDe(t){ const m=/^(-?\d+)-/.exec(t); if(!m)return null; const y=parseInt(m[1]); return y<0?y-1:y }

// 1. humanos con fecha de nacimiento en el tramo y los sitelinks pedidos
const LIMITE=2500;
async function nacidos(minSl,desde,hasta){
 const q=`SELECT ?item ?t ?sl WHERE { ?item wdt:P31 wd:Q5 ; wikibase:sitelinks ?sl . FILTER(?sl >= ${minSl}) ?item p:P569/psv:P569 ?v . ?v wikibase:timeValue ?t ; wikibase:timePrecision ?p . FILTER(?p >= 9) FILTER(?t >= "${fecha(desde<0?desde+1:desde)}"^^xsd:dateTime && ?t < "${fecha(hasta<0?hasta+1:hasta)}"^^xsd:dateTime) } LIMIT ${LIMITE}`;
 let rs; try{ rs=await sparql(q) }catch(e){ if(hasta-desde>1){ const m=Math.floor((desde+hasta)/2); log('   '+desde+'..'+hasta+' falla ('+e.message.slice(0,60)+'), parto'); return (await nacidos(minSl,desde,m)).concat(await nacidos(minSl,m,hasta)) } throw e }
 if(rs.length>=LIMITE&&hasta-desde>1){ const m=Math.floor((desde+hasta)/2); log('   '+desde+'..'+hasta+' lleno, parto'); return (await nacidos(minSl,desde,m)).concat(await nacidos(minSl,m,hasta)) }
 return rs.map(b=>({item:qid(v(b,'item')),t:v(b,'t'),sl:parseInt(v(b,'sl')||'0')}));
}
// 2. detalles: nombres, articulos, lugar y coordenada de nacimiento y de muerte, fecha de muerte
async function detalles(ids){
 const q=`SELECT ?item ?es ?en ?artEs ?artEn ?cn ?cn2 ?ln ?cm ?cm2 ?lm ?fm WHERE {
  VALUES ?item { ${ids.map(x=>'wd:'+x).join(' ')} }
  OPTIONAL { ?item rdfs:label ?es . FILTER(LANG(?es)="es") }
  OPTIONAL { ?item rdfs:label ?en . FILTER(LANG(?en)="en") }
  OPTIONAL { ?aEs schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?artEs }
  OPTIONAL { ?aEn schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?artEn }
  OPTIONAL { ?item wdt:P19 ?pn . OPTIONAL { ?pn wdt:P625 ?cn } OPTIONAL { ?pn wdt:P131 ?pn2 . ?pn2 wdt:P625 ?cn2 } OPTIONAL { ?pn rdfs:label ?ln . FILTER(LANG(?ln)="es") } }
  OPTIONAL { ?item wdt:P20 ?pm . OPTIONAL { ?pm wdt:P625 ?cm } OPTIONAL { ?pm wdt:P131 ?pm2 . ?pm2 wdt:P625 ?cm2 } OPTIONAL { ?pm rdfs:label ?lm . FILTER(LANG(?lm)="es") } }
  OPTIONAL { ?item p:P570/psv:P570 ?vm . ?vm wikibase:timeValue ?fm ; wikibase:timePrecision ?prm . FILTER(?prm >= 9) }
 }`;
 const rs=await sparql(q); const out={};
 for(const b of rs){ const id=qid(v(b,'item')); const o=out[id]||(out[id]={});
  for(const k of ['es','en','artEs','artEn','cn','cn2','ln','cm','cm2','lm','fm'])if(v(b,k)!==undefined&&o[k]===undefined)o[k]=v(b,k);
 }
 return out;
}
function punto(s){ const m=/Point\(([-\d.e]+) ([-\d.e]+)\)/i.exec(s||''); return m?{lon:+m[1],lat:+m[2]}:null }
const limpia=s=>{ s=String(s||'').trim().replace(/[.\s]+$/,''); return s?s[0].toUpperCase()+s.slice(1):s };
const slug=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,50);

// --- principal ------------------------------------------------------------------------------
(async()=>{
 const t0=Date.now();
 const minimo=Math.min(MIN,MIN_XX);
 // descubrimiento por tramos de 50 años (cache por tramo, para reanudar)
 const items=new Map();
 for(let a=DESDE;a<HASTA;a+=50){ const b=Math.min(a+50,HASTA);
  let rs; try{ rs=await cache('per_'+minimo+'_'+a+'_'+b+'.json',()=>nacidos(minimo,a,b)) }catch(e){ log('tramo '+a+'..'+b+': fallo ('+e.message.slice(0,100)+'); sigo'); continue }
  let n=0; for(const r of rs){ const y=anioDe(r.t); if(y===null||y<a||y>=b)continue; const min=y>=1900?MIN_XX:MIN; if(r.sl<min)continue; if(!items.has(r.item)){ items.set(r.item,{anio:y,sl:r.sl}); n++ } }
  log(a+'..'+b+': '+n+' personas   · '+items.size+' acumuladas');
 }
 log('descubrimiento: '+items.size+' personas, '+nConsultas+' consultas');

 const ids=[...items.keys()]; const det={};
 for(let i=0;i<ids.length;i+=100){ const lote=ids.slice(i,i+100);
  let d; try{ d=await cache('detp3_'+lote[0]+'_'+lote.length+'.json',()=>detalles(lote)) }catch(e){ log('detalles '+lote[0]+': fallo ('+e.message.slice(0,80)+')'); continue }
  Object.assign(det,d);
  if((i/100)%20===0)log('detalles '+Math.min(i+100,ids.length)+'/'+ids.length);
 }

 const out=[]; let sinNac=0, sinNombre=0, conMuerte=0; const porSiglo={};
 for(const [id,o] of items){ const d=det[id]; if(!d)continue;
  const es=limpia(d.es||d.en), en=limpia(d.en||d.es); if(!es){ sinNombre++; continue }
  let aproxN=0, pn=punto(d.cn); if(!pn){ pn=punto(d.cn2); aproxN=1 } if(!pn){ sinNac++; continue }
  const imp=o.sl>=IMP2?2:1; const base=slug(es)+'_'+id.toLowerCase();
  const comun={category:'personas',importance:imp,wikiTitles:{es:d.artEs||es,en:d.artEn||en},wikidataId:id,persona:es,sitelinks:o.sl,tipo:'persona',v:2};
  const nac={id:base+'_nac',year:o.anio,lat:+pn.lat.toFixed(3),lon:+pn.lon.toFixed(3),labels:{es:es+': nacimiento',en:en+' born'},momento:'nac',lugar:d.ln||undefined,aprox:aproxN||undefined,...comun};
  const ym=d.fm?anioDe(d.fm):null; let aproxM=0, pm=punto(d.cm); if(!pm){ pm=punto(d.cm2); aproxM=1 }
  if(ym!==null&&pm&&ym>=o.anio&&ym-o.anio<=110){
   const def={id:base+'_def',year:ym,lat:+pm.lat.toFixed(3),lon:+pm.lon.toFixed(3),labels:{es:es+': muerte',en:en+' dies'},momento:'def',lugar:d.lm||undefined,aprox:aproxM||undefined,...comun};
   nac.otro={id:def.id,year:def.year,lat:def.lat,lon:def.lon,lugar:def.lugar}; def.otro={id:nac.id,year:nac.year,lat:nac.lat,lon:nac.lon,lugar:nac.lugar};
   out.push(nac,def); conMuerte++;
  } else out.push(nac);
  const s=Math.floor(o.anio/100)*100; porSiglo[s]=(porSiglo[s]||0)+1;
 }
 out.sort((a,b)=>a.year-b.year||a.id.localeCompare(b.id));
 fs.writeFileSync(SALIDA,JSON.stringify(out));
 log('por siglo de nacimiento: '+Object.entries(porSiglo).sort((a,b)=>+a[0]-+b[0]).map(([s,n])=>s+':'+n).join(' '));
 log('personas con pin de nacimiento: '+(out.length-conMuerte)+' · con pin de muerte ademas: '+conMuerte+' · sin coordenada de nacimiento (fuera): '+sinNac+' · sin nombre: '+sinNombre);
 log(out.length+' pines -> '+SALIDA+' ('+(fs.statSync(SALIDA).size/1048576).toFixed(1)+' MB) · '+nConsultas+' consultas · '+((Date.now()-t0)/60000).toFixed(0)+' min');
})().catch(e=>{ console.error('ERROR: '+e.message); process.exit(1) });
