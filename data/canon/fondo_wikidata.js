#!/usr/bin/env node
// EXTRAE EL FONDO DE EVENTOS DE WIKIDATA, SIN EXIGIR COORDENADA.
//
// El volcado original se hizo con "where coordinates is not null": todo
// suceso sin coordenada directa quedo fuera, y por eso faltaban continentes
// enteros. Este extractor consulta Wikidata por clases de suceso (batallas,
// tratados, terremotos, expediciones, revueltas...) y resuelve la ubicacion por
// grados: coordenada propia; si no, la del lugar (P276) o de la unidad
// administrativa (P131), marcada aprox:1; si no, la capital del pais (P17),
// marcada aprox:2. La app enseña lo aproximado como tal.
//
// Corre en una maquina con red (Wikidata no es alcanzable desde el entorno
// de Claude). Es reanudable: guarda cada paso en data/_wikidata_cache/ y, si
// se corta, al volver a lanzarlo sigue donde iba. Es educado con el servidor
// (una consulta a la vez, pausas, reintentos con espera creciente).
//
//   node data/canon/fondo_wikidata.js                    todo (1-3 horas)
//   node data/canon/fondo_wikidata.js --prueba           solo batallas y terremotos de 1600-1700 (minutos)
//   node data/canon/fondo_wikidata.js --desde -1000 --hasta 500
//   node data/canon/fondo_wikidata.js --informe          solo reimprime el informe de clases
//
// Salida: data/fondo_wikidata_nuevo.json (esquema del volcado viejo + aprox,
// clase, sitelinks, v:2) y data/_wikidata_cache/clases_informe.json (cuantos
// sucesos trae cada clase y a que categoria se mando: para afinar la tabla).
const fs=require('fs'), path=require('path');
const ARG=process.argv.slice(2); const flag=f=>ARG.includes(f); const val=(f,d)=>{ const i=ARG.indexOf(f); return i>=0?ARG[i+1]:d };
const PRUEBA=flag('--prueba'); const DESDE=parseInt(val('--desde',PRUEBA?'1600':'-10000')); const HASTA=parseInt(val('--hasta',PRUEBA?'1700':'2026'));
const DATA=path.resolve(__dirname,'..'); const CACHE=path.join(DATA,'_wikidata_cache'); fs.mkdirSync(CACHE,{recursive:true});
const SALIDA=path.join(DATA,PRUEBA?'fondo_wikidata_prueba.json':'fondo_wikidata_nuevo.json');
const ENDPOINT='https://query.wikidata.org/sparql';
const UA='BlueDot/1.0 (https://github.com/JPGomayArge/BlueDot; globo historico libre) node';
const log=(...a)=>{ const t=new Date().toISOString().slice(11,19); console.log(t+'  '+a.join(' ')) };

// --- las raices del arbol de clases ------------------------------------------------
// Cada raiz se expande con sus subclases (P279*). Los ids estan comprobados a
// mano; una raiz equivocada traeria basura en silencio, asi que el informe de
// clases enseña lo que entro por cada una.
const RAICES=[
 ['Q13418847','historical event'],
 ['Q198','war'],
 ['Q178561','battle'],
 ['Q188055','siege'],
 ['Q3839081','massacre'],
 ['Q131569','treaty'],
 ['Q124734','rebellion'],
 ['Q10931','revolution'],
 ['Q45382','coup d\'état'],
 ['Q8065','natural disaster'],
 ['Q3241045','disease outbreak'],
 ['Q12147','famine'],
 ['Q2401485','expedition'],
 ['Q5916','spaceflight'],
 ['Q2223653','terrorist attack'],
 ['Q175331','demonstration'],
 ['Q290178','financial crisis'],
];
const RAICES_PRUEBA=[['Q178561','battle'],['Q7944','earthquake']];

// --- de la clase a la categoria de BlueDot --------------------------------------------
// Por palabras de la etiqueta inglesa de la clase. La primera regla que
// encaja gana; lo que no encaja en ninguna va a 'politica' y queda marcado en
// el informe para decidirlo a mano.
const TIRAR=/\b(feme murders|murder|homicide|killing|shooting|shootout|kidnapping|abduction|robbery|burglary|lynching|suicide|assault|hijacking|hostage|stabbing|poisoning|arson|fraud|scandal|official trip|state funeral|funeral|wedding|election|by-election|tournament|championship|season|match|race|cup|league|award|ceremony|concert|tour|album|film|episode|exhibition match|grand prix|marathon|regatta|olympic|paralympic|games|contest|pageant|conference call)\b/i;
const REGLAS=[
 ['economia',/\b(financial|economic|stock market|market crash|bank run|banking|bubble|bankruptcy|trade|depression|hyperinflation|embargo|tariff|monetary|recession|sovereign default|nationalization|privatization|panic of)\b/i],
 ['desastres',/\b(earthquake|flood|fire|wildfire|famine|epidemic|pandemic|outbreak|eruption|tsunami|landslide|avalanche|storm|hurricane|cyclone|typhoon|tornado|drought|disaster|accident|shipwreck|sinking|crash|collapse|explosion|derailment|stampede|heat wave|blizzard|plague|cholera|smallpox|mudslide|meteor|impact event|catastrophe|shipwrecking|maritime incident|mine disaster)\b/i],
 ['guerras',/\b(battle|siege|war|campaign|military|invasion|raid|massacre|genocide|conquest|offensive|crusade|uprising|bombing|attack|terrorist|naval|skirmish|mutiny|insurgency|blockade|armed|combat|pogrom|rebellion|revolt|insurrection|ambush|landing operation|occupation|annexation by force|ethnic cleansing|expulsion of|conflict|hostilities|ceasefire|armistice|surrender|capitulation|engagement|dogfight|action of|sortie|incursion|expedition against|punitive|series of wars|sack of|sack)\b/i],
 ['exploracion',/\b(expedition|voyage|exploration|circumnavigation|journey|crossing|first ascent|ascent|landing|discovery of|contact|settlement|colonization)\b/i],
 ['ciencia',/\b(discovery|spaceflight|space mission|launch|eclipse|invention|experiment|observation|transit of|comet|scientific|nuclear test|flight|aviation first)\b/i],
 ['religion',/\b(council|synod|schism|pilgrimage|canonization|reformation|conclave|excommunication|religious|missionary|crusade|hajj|revival|papal)\b/i],
 ['sociedad',/\b(protest|demonstration|strike|riot|movement|march|boycott|abolition|emancipation|suffrage|migration|exodus|deportation|resettlement|hunger strike|sit-in|occupation protest|civil disobedience|petition|social|rally|general strike|labor dispute)\b/i],
 ['cultura',/\b(world's fair|exposition|festival|premiere|biennale|exhibition|congress of|competition|games)\b/i],
 ['politica',/\b(treaty|peace|coup|revolution|independence|constitution|referendum|congress|conference|summit|declaration|union|partition|secession|abdication|coronation|accession|proclamation|dissolution|succession|political|crisis|edict|decree|law|act of|charter|plebiscite|unification|federation|assembly|diet|parliament|negotiation|agreement|accord|convention|pact|alliance|state visit|assassination|execution|trial|inauguration|founding|establishment|abolition of|cession|transfer of sovereignty|historical event|incident)\b/i],
];
// Antes de tirar: lo que parece delito pero es historia (un magnicidio, un
// atentado suicida), y lo que parece otra cosa y es un desastre o un viaje.
const ANTES=[
 ['politica',/\b(political murder|assassination|regicide|pronunciamiento|diplomatic visit)\b/i],
 ['guerras',/\b(suicide bombing|suicide attack|suicide car bombing|car bombing|shooting attack|bombing)\b/i],
 ['desastres',/\b(dam failure|tailings dam|crowd collapse|crowd crush|ship collision|bridge collapse|building collapse)\b/i],
 ['exploracion',/\b(oceanographic cruise|research cruise)\b/i],
];
function categoriaDe(etiqueta){ for(const [c,re] of ANTES)if(re.test(etiqueta))return c; if(TIRAR.test(etiqueta))return null; for(const [c,re] of REGLAS)if(re.test(etiqueta))return c; return 'politica?' }

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

// 1. las clases: subclases de cada raiz, con etiqueta inglesa
async function clases(raices){
 const todas=new Map();
 for(const [raiz,nombre] of raices){
  let rs; try{ rs=await cache('clases_'+raiz+'.json',()=>sparql(`SELECT ?cls ?clsLabel WHERE { ?cls wdt:P279* wd:${raiz} . SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }`)) }
  catch(e){ log('raiz '+nombre+': no se pudo expandir ('+e.message.slice(0,80)+'); uso solo la raiz'); rs=[{cls:{value:'http://www.wikidata.org/entity/'+raiz},clsLabel:{value:nombre}}] }
  for(const b of rs){ const id=qid(v(b,'cls')); if(!todas.has(id))todas.set(id,{id,etiqueta:v(b,'clsLabel')||id,raiz:nombre}) }
  log('raiz '+nombre+': '+rs.length+' clases');
 }
 return [...todas.values()];
}
// 2. cuantas instancias con fecha tiene cada clase (para saltar las vacias)
async function cuentas(cls){
 const out={}; const ids=cls.map(c=>c.id);
 for(let i=0;i<ids.length;i+=80){ const lote=ids.slice(i,i+80);
  const rs=await cache('cuenta_'+lote[0]+'_'+lote.length+'.json',()=>sparql(`SELECT ?cls (COUNT(?i) AS ?n) WHERE { VALUES ?cls { ${lote.map(x=>'wd:'+x).join(' ')} } ?i wdt:P31 ?cls . ?i wdt:P585|wdt:P580 ?t . } GROUP BY ?cls`));
  for(const b of rs)out[qid(v(b,'cls'))]=parseInt(v(b,'n'));
 }
 return out;
}
// 3. las instancias de una clase en un tramo de años (parte el tramo si se llena)
const LIMITE=4000;
async function instancias(cls,desde,hasta,prop){
 const q=`SELECT ?item ?t WHERE { ?item wdt:P31 wd:${cls} . ?item p:${prop}/psv:${prop} ?v . ?v wikibase:timeValue ?t ; wikibase:timePrecision ?p . FILTER(?p >= 9) FILTER(?t >= "${fecha(desde<0?desde+1:desde)}"^^xsd:dateTime && ?t < "${fecha(hasta<0?hasta+1:hasta)}"^^xsd:dateTime) ${prop==='P580'?'FILTER NOT EXISTS { ?item wdt:P585 [] }':''} } LIMIT ${LIMITE}`;
 const rs=await sparql(q);
 if(rs.length>=LIMITE&&hasta-desde>1){ const m=Math.floor((desde+hasta)/2); log('   '+cls+' '+prop+' '+desde+'..'+hasta+' lleno, parto'); return (await instancias(cls,desde,m,prop)).concat(await instancias(cls,m,hasta,prop)) }
 return rs.map(b=>({item:qid(v(b,'item')),t:v(b,'t')}));
}
// Wikidata exporta las fechas a.C. en año astronomico (con año 0): "-1762" es 1763 a.C.
// BlueDot, como las cronicas, no tiene año 0: 1763 a.C. es -1763. Se resta uno.
function anioDe(t){ const m=/^(-?\d+)-/.exec(t); if(!m)return null; const y=parseInt(m[1]); return y<0?y-1:y }
// 4. detalles por lotes: etiquetas, articulos, coordenada propia o derivada, sitelinks
async function detalles(ids){
 const q=`SELECT ?item ?es ?en ?artEs ?artEn ?sl ?c0 ?c1 ?c2 ?c3 ?pais WHERE {
  VALUES ?item { ${ids.map(x=>'wd:'+x).join(' ')} }
  OPTIONAL { ?item rdfs:label ?es . FILTER(LANG(?es)="es") }
  OPTIONAL { ?item rdfs:label ?en . FILTER(LANG(?en)="en") }
  OPTIONAL { ?aEs schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?artEs }
  OPTIONAL { ?aEn schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?artEn }
  OPTIONAL { ?item wikibase:sitelinks ?sl }
  OPTIONAL { ?item wdt:P625 ?c0 }
  OPTIONAL { ?item wdt:P276 ?l1 . ?l1 wdt:P625 ?c1 }
  OPTIONAL { ?item wdt:P131 ?l2 . ?l2 wdt:P625 ?c2 }
  OPTIONAL { ?item wdt:P17 ?pais . OPTIONAL { ?pais wdt:P36 ?cap . ?cap wdt:P625 ?c3 } }
 }`;
 const rs=await sparql(q); const out={};
 for(const b of rs){ const id=qid(v(b,'item')); const o=out[id]||(out[id]={});
  for(const k of ['es','en','artEs','artEn','sl','c0','c1','c2','c3'])if(v(b,k)!==undefined&&o[k]===undefined)o[k]=v(b,k);
  if(v(b,'pais')&&!o.pais)o.pais=qid(v(b,'pais'));
 }
 return out;
}
function punto(s){ const m=/Point\(([-\d.e]+) ([-\d.e]+)\)/i.exec(s||''); return m?{lon:+m[1],lat:+m[2]}:null }
const limpia=s=>{ s=String(s||'').trim().replace(/[.\s]+$/,''); return s?s[0].toUpperCase()+s.slice(1):s };
const slug=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,60);

// --- principal ------------------------------------------------------------------------------
(async()=>{
 const t0=Date.now();
 const raices=PRUEBA?RAICES_PRUEBA:RAICES;
 const cls=await clases(raices);
 const cuenta=await cuentas(cls);
 const conInst=cls.filter(c=>(cuenta[c.id]||0)>0).sort((a,b)=>(cuenta[b.id]||0)-(cuenta[a.id]||0));
 log(cls.length+' clases, '+conInst.length+' con instancias fechadas, '+Object.values(cuenta).reduce((s,n)=>s+n,0)+' instancias en bruto (con repetidos entre clases)');
 if(flag('--informe')){ informe(conInst,cuenta,{}); return }

 // descubrimiento
 const items=new Map();   // id -> {anio, clases:[]}
 let k=0;
 for(const c of conInst){ k++;
  const cat=categoriaDe(c.etiqueta); c.cat=cat; if(cat===null){ continue }
  const rs=await cache('inst_'+c.id+'_'+DESDE+'_'+HASTA+'.json',async()=>(await instancias(c.id,DESDE,HASTA,'P585')).concat(await instancias(c.id,DESDE,HASTA,'P580')));
  let n=0; for(const r of rs){ const y=anioDe(r.t); if(y===null||y<DESDE||y>=HASTA)continue; const o=items.get(r.item)||{anio:y,clases:[]}; o.clases.push(c.id); if(o.anio!==y&&o.clases.length===1)o.anio=y; items.set(r.item,o); n++ }
  c.n=n; if(n||k%50===0)log('['+k+'/'+conInst.length+'] '+c.etiqueta+' ('+c.id+'): '+n+' -> '+cat+'   · '+items.size+' acumulados');
 }
 log('descubrimiento: '+items.size+' sucesos distintos, '+nConsultas+' consultas');

 // detalles
 const ids=[...items.keys()]; const det={};
 for(let i=0;i<ids.length;i+=120){ const lote=ids.slice(i,i+120);
  const d=await cache('det_'+lote[0]+'_'+lote.length+'.json',()=>detalles(lote)); Object.assign(det,d);
  if((i/120)%10===0)log('detalles '+Math.min(i+120,ids.length)+'/'+ids.length);
 }

 // fines: año en que termina lo que dura (P582), en una pasada aparte con su
 // propia cache, para que una extraccion ya hecha pueda completarse sin repetir
 const fines={};
 for(let i=0;i<ids.length;i+=200){ const lote=ids.slice(i,i+200);
  const f=await cache('fin_'+lote[0]+'_'+lote.length+'.json',async()=>{ const rs=await sparql(`SELECT ?item ?f WHERE { VALUES ?item { ${lote.map(x=>'wd:'+x).join(' ')} } ?item p:P582/psv:P582 ?v . ?v wikibase:timeValue ?f ; wikibase:timePrecision ?p . FILTER(?p >= 9) }`); const o={}; for(const b of rs){ const id=qid(v(b,'item')); const y=anioDe(v(b,'f')); if(y!==null&&(o[id]===undefined||y>o[id]))o[id]=y } return o });
  Object.assign(fines,f);
 }
 log('fines: '+Object.keys(fines).length+' sucesos con año de final');

 // salida
 const porCat={}, porAprox={0:0,1:0,2:0}, sinUbic=[]; const out=[]; const clsCat=new Map(conInst.map(c=>[c.id,c.cat]));
 const prioridad=['guerras','desastres','exploracion','ciencia','religion','sociedad','economia','cultura','politica','politica?'];
 for(const [id,o] of items){ const d=det[id]; if(!d)continue;
  const es=limpia(d.es||d.en), en=limpia(d.en||d.es); if(!es)continue;
  // la categoria: la mas especifica entre las clases del item
  const cats=o.clases.map(c=>clsCat.get(c)).filter(Boolean); let cat=cats.sort((a,b)=>prioridad.indexOf(a)-prioridad.indexOf(b))[0]||'politica?';
  if(cat==='politica?')cat='politica';
  let p=punto(d.c0), aprox=0; if(!p){ p=punto(d.c1)||punto(d.c2); if(p)aprox=1 } if(!p){ p=punto(d.c3); if(p)aprox=2 }
  if(!p){ sinUbic.push(id); continue }
  const sl=parseInt(d.sl||'0'); const imp=sl>=20?2:1;
  out.push({id:slug(es)+'_'+id.toLowerCase(),year:o.anio,lat:+p.lat.toFixed(3),lon:+p.lon.toFixed(3),labels:{es,en},category:cat,importance:imp,wikiTitles:{es:d.artEs||es,en:d.artEn||en},wikidataId:id,aprox:aprox||undefined,fin:(fines[id]>o.anio&&fines[id]-o.anio<=200)?fines[id]:undefined,clase:o.clases[0],sitelinks:sl,v:2});
  porCat[cat]=(porCat[cat]||0)+1; porAprox[aprox]++;
 }
 out.sort((a,b)=>a.year-b.year||a.id.localeCompare(b.id));
 fs.writeFileSync(SALIDA,JSON.stringify(out));
 informe(conInst,cuenta,porCat);
 log('ubicacion: propia '+porAprox[0]+' · por lugar '+porAprox[1]+' · por pais '+porAprox[2]+' · sin ubicacion (fuera) '+sinUbic.length);
 const bce=out.filter(e=>e.year<0).slice(0,5); if(bce.length)log('comprobar a mano (años a.C., posible desfase de 1): '+bce.map(e=>e.labels.es+' '+e.year).join(' | '));
 log(out.length+' sucesos -> '+SALIDA+' ('+(fs.statSync(SALIDA).size/1048576).toFixed(1)+' MB) · '+nConsultas+' consultas · '+((Date.now()-t0)/60000).toFixed(0)+' min');
})().catch(e=>{ console.error('ERROR: '+e.message); process.exit(1) });

function informe(conInst,cuenta,porCat){
 const filas=conInst.map(c=>({id:c.id,clase:c.etiqueta,raiz:c.raiz,instancias:cuenta[c.id]||0,usadas:c.n||0,categoria:c.cat===undefined?categoriaDe(c.etiqueta):c.cat}));
 fs.writeFileSync(path.join(CACHE,'clases_informe.json'),JSON.stringify({porCategoria:porCat,clases:filas},null,1));
 const dudosas=filas.filter(f=>f.categoria==='politica?'&&f.instancias>=20).slice(0,25);
 log('por categoria: '+JSON.stringify(porCat));
 if(dudosas.length)log('clases sin regla con >=20 instancias (van a politica; decidir en REGLAS): '+dudosas.map(f=>f.clase+'('+f.instancias+')').join(', '));
 const tiradas=filas.filter(f=>f.categoria===null&&f.instancias>=50).slice(0,15);
 if(tiradas.length)log('clases tiradas con >=50 instancias: '+tiradas.map(f=>f.clase+'('+f.instancias+')').join(', '));
}
