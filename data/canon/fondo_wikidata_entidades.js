#!/usr/bin/env node
// EXTRAE DE WIKIDATA LO QUE SE FUNDA, SE CONSTRUYE, SE PUBLICA O SE DESCUBRE.
//
// fondo_wikidata.js trae sucesos (batallas, tratados, terremotos...). Este trae
// las cosas con fecha de nacimiento que tambien son historia: universidades,
// bancos, catedrales y mezquitas, ciudades, Estados, partidos, obras literarias,
// cuadros, peliculas, puentes, ferrocarriles, elementos quimicos. Cada una se
// convierte en un suceso del fondo ("Universidad de Salamanca: fundacion",
// 1218) con la categoria de su raiz, importancia 1-2 y la misma procedencia
// (wikidata:Q...) que el resto del fondo.
//
// Para no traer basura, cada raiz exige un minimo de enlaces entre Wikipedias
// (sitelinks): un banco con 15 Wikipedias es historia; uno con 2 no. Las raices
// se expanden con subclases (P31/P279*), asi que "universidad" incluye las
// universidades publicas, tecnicas, etc.
//
// Corre en una maquina con red. Reanudable (cache en data/_wikidata_cache/).
//
//   node data/canon/fondo_wikidata_entidades.js                 todo (1-2 horas)
//   node data/canon/fondo_wikidata_entidades.js --prueba        universidades y elementos quimicos, 1500-1700
//   node data/canon/fondo_wikidata_entidades.js --solo Q3918    una sola raiz
//   node data/canon/fondo_wikidata_entidades.js --desde 1800 --hasta 1900
//
// Salida: data/fondo_wikidata_entidades.json (mismo esquema que fondo_wikidata_nuevo.json,
// con tipo:'entidad' y clase). Se funde con los otros volcados:
//   node construye_eventos.js ../fondo_wikidata.json,../fondo_wikidata_nuevo.json,../fondo_wikidata_entidades.json ../events_extended.json
const fs=require('fs'), path=require('path');
const ARG=process.argv.slice(2); const flag=f=>ARG.includes(f); const val=(f,d)=>{ const i=ARG.indexOf(f); return i>=0?ARG[i+1]:d };
const PRUEBA=flag('--prueba'); const SOLO=val('--solo',null);
const DESDE=parseInt(val('--desde',PRUEBA?'1500':'-10000')); const HASTA=parseInt(val('--hasta',PRUEBA?'1700':'2026'));
const DATA=path.resolve(__dirname,'..'); const CACHE=path.join(DATA,'_wikidata_cache'); fs.mkdirSync(CACHE,{recursive:true});
const SALIDA=path.join(DATA,PRUEBA?'fondo_wikidata_entidades_prueba.json':'fondo_wikidata_entidades.json');
const ENDPOINT='https://query.wikidata.org/sparql';
const UA='BlueDot/1.0 (https://github.com/JPGomayArge/BlueDot; globo historico libre) node';
const log=(...a)=>{ const t=new Date().toISOString().slice(11,19); console.log(t+'  '+a.join(' ')) };

// --- las raices ----------------------------------------------------------------------
// [id, nombre, categoria, propiedades de fecha (la primera que tenga), minimo de
//  sitelinks, plantilla del titulo {es,en} con {} por el nombre de la cosa,
//  y un septimo valor true para NO expandir subclases (el arbol trae cosas ajenas:
//  bajo "elemento quimico" cuelgan los diamantes famosos)]
// Las propiedades: P571 fecha de creacion/fundacion, P1619 inauguracion,
// P577 publicacion, P575 descubrimiento.
const FUND={es:'{}: fundación',en:'{} founded'};
const CONS={es:'{}: construcción',en:'{} built'};
const INAU={es:'{}: inauguración',en:'{} opens'};
const PUBL={es:'{}: publicación',en:'{} published'};
const ESTR={es:'{}: estreno',en:'{} premieres'};
const RAICES=[
 // politica: Estados, reinos, dinastias, ciudades, partidos, organizaciones
 ['Q3024240','historical country','politica',['P571'],8,FUND],
 ['Q417175','kingdom','politica',['P571'],8,FUND],
 ['Q48349','empire','politica',['P571'],8,FUND],
 ['Q164950','dynasty','politica',['P571'],8,FUND],
 ['Q3957','town','politica',['P571'],40,FUND],
 ['Q6256','country','politica',['P571'],30,FUND],
 ['Q515','city','politica',['P571'],20,FUND],
 ['Q7278','political party','politica',['P571'],15,FUND],
 ['Q484652','international organization','politica',['P571'],15,FUND],
 // sociedad: universidades, hospitales, movimientos, prensa
 ['Q3918','university','sociedad',['P571'],10,FUND],
 ['Q16917','hospital','sociedad',['P571'],25,FUND],
 ['Q49773','social movement','sociedad',['P571'],10,{es:'{}: nace el movimiento',en:'{} emerges'}],
 ['Q11032','newspaper','sociedad',['P571'],15,FUND],
 // ciencia
 ['Q1371037','research institute','ciencia',['P571'],15,FUND],
 ['Q62832','observatory','ciencia',['P571','P1619'],10,FUND],
 ['Q11344','chemical element','ciencia',['P575'],0,{es:'{}: descubrimiento',en:'{} discovered'},true],
 ['Q1200750','academy of sciences','ciencia',['P571'],10,FUND],
 // descubrimientos e inventos: todo lo que tenga fecha de descubrimiento o invencion (P575),
 // sea cual sea su clase, salvo los cuerpos celestes, que son cientos de miles
 ['*P575','discovery or invention','ciencia',['P575'],12,{es:'{}: descubrimiento o invención',en:'{} discovered or invented'}],
 // religion
 ['Q16970','church building','religion',['P571','P1619'],30,CONS],
 ['Q180642','stupa','religion',['P571'],8,CONS],
 ['Q32815','mosque','religion',['P571','P1619'],10,CONS],
 ['Q44613','monastery','religion',['P571'],12,FUND],
 ['Q34627','synagogue','religion',['P571','P1619'],15,CONS],
 ['Q44539','temple','religion',['P571','P1619'],12,CONS],
 ['Q2742167','religious order','religion',['P571'],10,FUND],
 ['Q1530022','religious organization','religion',['P571'],20,FUND],
 ['Q179461','religious text','religion',['P577','P571'],25,{es:'{}: redacción',en:'{} written'}],
 // economia
 ['Q22687','bank','economia',['P571'],10,FUND],
 ['Q8142','currency','economia',['P571'],10,{es:'{}: creación',en:'{} introduced'}],
 ['Q11691','stock exchange','economia',['P571'],10,FUND],
 ['Q728937','railway line','economia',['P1619','P571'],20,INAU],
 ['Q12284','canal','economia',['P1619','P571'],20,INAU],
 ['Q12323','dam','economia',['P1619','P571'],20,INAU],
 ['Q12280','bridge','economia',['P1619','P571'],30,INAU],
 ['Q820477','mine','economia',['P571'],15,{es:'{}: apertura',en:'{} opens'}],
 ['Q1248784','airport','economia',['P1619','P571'],40,INAU],
 ['Q159719','power station','economia',['P1619','P571'],25,INAU],
 ['Q4830453','business','economia',['P571'],40,FUND],
 // cultura
 ['Q33506','museum','cultura',['P571','P1619'],15,FUND],
 ['Q839954','archaeological site','cultura',['P571'],10,{es:'{}',en:'{}'}],
 ['Q23413','castle','cultura',['P571'],30,CONS],
 ['Q57821','fortification','cultura',['P571'],30,CONS],
 ['Q7075','library','cultura',['P571','P1619'],15,FUND],
 ['Q24354','theatre','cultura',['P1619','P571'],15,INAU],
 ['Q7725634','literary work','cultura',['P577'],25,PUBL],
 ['Q3305213','painting','cultura',['P571'],30,{es:'{}',en:'{}'}],
 ['Q860861','sculpture','cultura',['P571'],30,{es:'{}',en:'{}'}],
 ['Q11424','film','cultura',['P577'],70,ESTR],
 ['Q2188189','musical work/composition','cultura',['P577','P571'],30,ESTR],
 ['Q41176','building','cultura',['P571','P1619'],45,CONS],
 ['Q4989906','monument','cultura',['P571','P1619'],30,{es:'{}: erección',en:'{} erected'}],
 ['Q7889','video game','cultura',['P577'],80,PUBL],
 // desastres: naufragios celebres (Titanic, Lusitania, San Jose, Vasa); bien datados y repartidos por todos los mares
 ['Q852190','shipwreck','desastres',['P585','P576'],15,{es:'{}: naufragio',en:'{} wrecked'}],
];
// Lo que el arbol de clases arrastra y no es historia: las diocesis (cuelgan de
// "orden religiosa"), las federaciones deportivas (de "organizacion internacional"),
// las micronaciones. Se filtra por el nombre, en los dos idiomas.
const RUIDO=/^(di[oó]cesis|archidi[oó]cesis|arquidi[oó]cesis|eparqu[ií]a|exarcado|prelatura|vicariato|ordinariato|administraci[oó]n apost[oó]lica|diocese|archdiocese|eparchy|exarchate|prelature|vicariate|apostolic)\b|\b(federaci[oó]n|confederaci[oó]n|federation|confederation|asociaci[oó]n|association|uni[oó]n|union|comit[eé]|committee|liga|league)\b.*\b(deport|halterofil|f[uú]tbol|football|soccer|atletismo|athletics|baloncesto|basketball|tenis|tennis|rugby|ciclismo|cycling|boxeo|boxing|esqu[ií]|ski|nataci[oó]n|swimming|hockey|voleibol|volleyball|balonmano|handball|golf|gimnasia|gymnastics|remo|rowing|vela|sailing|ajedrez|chess|motociclismo|automovil|motorsport|ol[ií]mpic|olympic|paral[ií]mpic|paralympic|badminton|judo|karate|taekwondo|lucha|wrestling|esgrima|fencing|tiro|shooting|triatl[oó]n|triathlon|equitaci[oó]n|equestrian|cricket|b[eé]isbol|baseball|softbol|softball|squash|bolos|bowling|patinaje|skating|surf|canoa|canoe|kayak|billar|billiards|dardos|darts|petanca|orientaci[oó]n|orienteering|ciegos|blind|sordos|deaf)|\b(ol[ií]mpic\w*|olympic|paral[ií]mpic\w*|paralympic)\b.*\b(comit[eé]|committee)|\b(micronaci[oó]n|micronation)\b/i;
const RAICES_PRUEBA=RAICES.filter(r=>r[0]==='Q3918'||r[0]==='Q11344');

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
// Wikidata exporta las fechas a.C. en año astronomico (con año 0): "-1762" es 1763 a.C.
function anioDe(t){ const m=/^(-?\d+)-/.exec(t); if(!m)return null; const y=parseInt(m[1]); return y<0?y-1:y }

// 1. las instancias de una raiz (con subclases) que tienen la fecha y los sitelinks
//    pedidos, en un tramo de años; si el tramo se llena (LIMITE), se parte en dos.
const LIMITE=4000;
async function instancias(raiz,prop,minSl,desde,hasta,exacta){
 // Antes de 1500 se aceptan fechas con precision de siglo (7) o decada (8): mucha
 // historia de Africa, America y Asia esta fechada asi, y la app lo enseña como "c.".
 const precMin=hasta<=1500?7:9;
 const clase=raiz.startsWith('*')?`?item p:${prop} ?st . FILTER NOT EXISTS { ?item wdt:P31 wd:Q3863 } FILTER NOT EXISTS { ?item wdt:P31 wd:Q3559 } FILTER NOT EXISTS { ?item wdt:P31 wd:Q318 } FILTER NOT EXISTS { ?item wdt:P31 wd:Q523 } FILTER NOT EXISTS { ?item wdt:P31 wd:Q44559 } FILTER NOT EXISTS { ?item wdt:P31 wd:Q16521 } .`:`?item ${exacta?'wdt:P31':'wdt:P31/wdt:P279*'} wd:${raiz} .`;
 const q=`SELECT ?item ?t ?p WHERE { ${clase} ?item wikibase:sitelinks ?sl . FILTER(?sl >= ${minSl}) ?item p:${prop}/psv:${prop} ?v . ?v wikibase:timeValue ?t ; wikibase:timePrecision ?p . FILTER(?p >= ${precMin}) FILTER(?t >= "${fecha(desde<0?desde+1:desde)}"^^xsd:dateTime && ?t < "${fecha(hasta<0?hasta+1:hasta)}"^^xsd:dateTime) } LIMIT ${LIMITE}`;
 let rs; try{ rs=await sparql(q) }catch(e){ if(hasta-desde>1){ const m=Math.floor((desde+hasta)/2); log('   '+raiz+' '+prop+' '+desde+'..'+hasta+' falla ('+e.message.slice(0,60)+'), parto'); return (await instancias(raiz,prop,minSl,desde,m,exacta)).concat(await instancias(raiz,prop,minSl,m,hasta,exacta)) } throw e }
 if(rs.length>=LIMITE&&hasta-desde>1){ const m=Math.floor((desde+hasta)/2); log('   '+raiz+' '+prop+' '+desde+'..'+hasta+' lleno, parto'); return (await instancias(raiz,prop,minSl,desde,m,exacta)).concat(await instancias(raiz,prop,minSl,m,hasta,exacta)) }
 return rs.map(b=>({item:qid(v(b,'item')),t:v(b,'t'),p:parseInt(v(b,'p')||'9')}));
}
// 2. detalles por lotes: etiquetas, articulos, sitelinks y la ubicacion por grados:
//    propia (P625); si no, lugar (P276), unidad administrativa (P131), sede (P159)
//    o lugar de fundacion (P740), marcadas aprox:1; si no, la capital del pais
//    (P17) o del pais de origen (P495), aprox:2.
async function detalles(ids){
 const q=`SELECT ?item ?es ?en ?artEs ?artEn ?sl ?c0 ?c1 ?c2 ?c4 ?c5 ?c3 ?c6 WHERE {
  VALUES ?item { ${ids.map(x=>'wd:'+x).join(' ')} }
  OPTIONAL { ?item rdfs:label ?es . FILTER(LANG(?es)="es") }
  OPTIONAL { ?item rdfs:label ?en . FILTER(LANG(?en)="en") }
  OPTIONAL { ?aEs schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> ; schema:name ?artEs }
  OPTIONAL { ?aEn schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?artEn }
  OPTIONAL { ?item wikibase:sitelinks ?sl }
  OPTIONAL { ?item wdt:P625 ?c0 }
  OPTIONAL { ?item wdt:P276 ?l1 . ?l1 wdt:P625 ?c1 }
  OPTIONAL { ?item wdt:P131 ?l2 . ?l2 wdt:P625 ?c2 }
  OPTIONAL { ?item wdt:P159 ?l4 . ?l4 wdt:P625 ?c4 }
  OPTIONAL { ?item wdt:P740 ?l5 . ?l5 wdt:P625 ?c5 }
  OPTIONAL { ?item wdt:P17 ?pais . ?pais wdt:P36 ?cap . ?cap wdt:P625 ?c3 }
  OPTIONAL { ?item wdt:P495 ?pais2 . ?pais2 wdt:P36 ?cap2 . ?cap2 wdt:P625 ?c6 }
 }`;
 const rs=await sparql(q); const out={};
 for(const b of rs){ const id=qid(v(b,'item')); const o=out[id]||(out[id]={});
  for(const k of ['es','en','artEs','artEn','sl','c0','c1','c2','c3','c4','c5','c6'])if(v(b,k)!==undefined&&o[k]===undefined)o[k]=v(b,k);
 }
 return out;
}
// Un invento o un descubrimiento casi nunca tiene coordenadas ni pais: 9 de cada 10
// se quedaban fuera. Se ubican por donde se hizo: lugar del descubrimiento (P189),
// lugar de trabajo del inventor o descubridor (P61 -> P937), su lugar de nacimiento
// (P61 -> P19), marcados aprox:1; si no, la capital de su pais (P61 -> P27), aprox:2.
async function detallesInventor(ids){
 const q=`SELECT ?item ?c7 ?c8 ?c9 ?c10 WHERE {
  VALUES ?item { ${ids.map(x=>'wd:'+x).join(' ')} }
  OPTIONAL { ?item wdt:P189 ?l7 . ?l7 wdt:P625 ?c7 }
  OPTIONAL { ?item wdt:P61 ?inv8 . ?inv8 wdt:P937 ?l8 . ?l8 wdt:P625 ?c8 }
  OPTIONAL { ?item wdt:P61 ?inv9 . ?inv9 wdt:P19 ?l9 . ?l9 wdt:P625 ?c9 }
  OPTIONAL { ?item wdt:P61 ?inv10 . ?inv10 wdt:P27 ?pais10 . ?pais10 wdt:P36 ?cap10 . ?cap10 wdt:P625 ?c10 }
 }`;
 const rs=await sparql(q); const out={};
 for(const b of rs){ const id=qid(v(b,'item')); const o=out[id]||(out[id]={});
  for(const k of ['c7','c8','c9','c10'])if(v(b,k)!==undefined&&o[k]===undefined)o[k]=v(b,k);
 }
 return out;
}
// La propiedad P575 ("fecha de descubrimiento o invencion") la llevan tambien
// objetos astronomicos (NGC 2451), islas y cabos "descubiertos" por europeos,
// tumbas, estatuas y aperturas de ajedrez. Se clasifican por su clase:
//   drop: objetos astronomicos, aperturas de ajedrez, meteoritos (fuera)
//   geo:  lugares -> exploracion, "primer registro documentado" (que es lo que
//         significa esa fecha: quien lo habitaba ya lo conocia)
//   arte: obras, tumbas, yacimientos, hallazgos arqueologicos -> cultura, "descubrimiento"
//   el resto queda en ciencia como descubrimiento o invencion.
const GRUPOS_P575=[['Q6999','drop'],['Q103632','drop'],['Q60186','drop'],['Q838948','arte'],['Q381885','arte'],['Q839954','arte'],['Q220659','arte'],['Q2221906','geo']];
const PLANTILLA_GRUPO={geo:{cat:'exploracion',es:'{}: primer registro documentado',en:'{} first documented'},arte:{cat:'cultura',es:'{}: descubrimiento',en:'{} discovered'}};
async function clasifica(ids){
 const q=`SELECT ?item ?g WHERE {
  VALUES ?item { ${ids.map(x=>'wd:'+x).join(' ')} }
  VALUES (?root ?g) { ${GRUPOS_P575.map(([r,g])=>'(wd:'+r+' "'+g+'")').join(' ')} }
  ?item wdt:P31/wdt:P279* ?root .
 }`;
 const rs=await sparql(q); const out={}; const rango={drop:3,arte:2,geo:1};
 for(const b of rs){ const id=qid(v(b,'item')), g=v(b,'g'); if(!out[id]||rango[g]>rango[out[id]])out[id]=g }
 return out;
}
function punto(s){ const m=/Point\(([-\d.e]+) ([-\d.e]+)\)/i.exec(s||''); return m?{lon:+m[1],lat:+m[2]}:null }
const limpia=s=>{ s=String(s||'').trim().replace(/[.\s]+$/,''); return s?s[0].toUpperCase()+s.slice(1):s };
const slug=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,60);
// Un nombre que ya es un suceso ("Fundación de Montevideo") no necesita plantilla.
const yaSuceso=/\b(fundaci[oó]n|construcci[oó]n|inauguraci[oó]n|descubrimiento|founding|foundation|construction|opening|discovery)\b/i;
function titulo(plantilla,nombre,lang){ if(yaSuceso.test(nombre))return nombre; return plantilla[lang].replace('{}',nombre) }

// --- principal ------------------------------------------------------------------------------
(async()=>{
 const t0=Date.now();
 let raices=PRUEBA?RAICES_PRUEBA:RAICES; if(SOLO)raices=raices.filter(r=>r[0]===SOLO);
 const items=new Map();   // id -> {anio, raiz, cat, plantilla}
 for(const [raiz,nombre,cat,props,minSl,plantilla,exacta] of raices){
  let n=0;
  for(const prop of props){
   let rs; try{ rs=await cache('ent2_'+raiz.replace('*','p')+'_'+prop+'_'+minSl+(exacta?'_x':'')+'_'+DESDE+'_'+HASTA+'.json',()=>instancias(raiz,prop,minSl,DESDE,HASTA,!!exacta)) }
   catch(e){ log('raiz '+nombre+' '+prop+': fallo ('+e.message.slice(0,100)+'); sigo con la siguiente'); continue }
   for(const r of rs){ const y=anioDe(r.t); if(y===null||y<DESDE||y>=HASTA)continue; if(items.has(r.item))continue; items.set(r.item,{anio:y,raiz:nombre,cat,plantilla,prec:r.p}); n++ }
  }
  log(nombre+' ('+raiz+', sitelinks>='+minSl+'): '+n+' -> '+cat+'   · '+items.size+' acumulados');
 }
 log('descubrimiento: '+items.size+' entidades, '+nConsultas+' consultas');

 const ids=[...items.keys()]; const det={};
 for(let i=0;i<ids.length;i+=120){ const lote=ids.slice(i,i+120);
  let d; try{ d=await cache('dete_'+lote[0]+'_'+lote.length+'.json',()=>detalles(lote)) }catch(e){ log('detalles '+lote[0]+': fallo ('+e.message.slice(0,80)+')'); continue }
  Object.assign(det,d);
  if((i/120)%10===0)log('detalles '+Math.min(i+120,ids.length)+'/'+ids.length);
 }

 // segunda pasada: inventos y descubrimientos sin ubicacion, por su autor
 const sinSitio=ids.filter(id=>{ const d=det[id], o=items.get(id); return d&&o&&o.raiz==='discovery or invention'&&!punto(d.c0)&&!punto(d.c1)&&!punto(d.c2)&&!punto(d.c4)&&!punto(d.c5)&&!punto(d.c3)&&!punto(d.c6) });
 log('inventos sin ubicacion propia: '+sinSitio.length+'; se buscan por su autor');
 for(let i=0;i<sinSitio.length;i+=120){ const lote=sinSitio.slice(i,i+120);
  let d; try{ d=await cache('deti_'+lote[0]+'_'+lote.length+'.json',()=>detallesInventor(lote)) }catch(e){ log('inventor '+lote[0]+': fallo ('+e.message.slice(0,80)+')'); continue }
  for(const id of Object.keys(d))Object.assign(det[id],d[id]);
  if((i/120)%10===0)log('inventores '+Math.min(i+120,sinSitio.length)+'/'+sinSitio.length);
 }
 // tercera pasada: que es cada cosa con fecha de descubrimiento o invencion
 const inventos=ids.filter(id=>{ const o=items.get(id); return o&&o.raiz==='discovery or invention' });
 const grupo={}; const porGrupo={drop:0,geo:0,arte:0};
 for(let i=0;i<inventos.length;i+=60){ const lote=inventos.slice(i,i+60);
  let g; try{ g=await cache('clas_'+lote[0]+'_'+lote.length+'.json',()=>clasifica(lote)) }catch(e){ log('clasificar '+lote[0]+': fallo ('+e.message.slice(0,80)+'); quedan en ciencia'); continue }
  Object.assign(grupo,g);
  if((i/60)%20===0)log('clasificados '+Math.min(i+60,inventos.length)+'/'+inventos.length);
 }
 for(const id of inventos){ const g=grupo[id]; if(!g)continue; porGrupo[g]++; const o=items.get(id);
  if(g==='drop'){ items.delete(id); continue }
  const pl=PLANTILLA_GRUPO[g]; o.cat=pl.cat; o.plantilla={es:pl.es,en:pl.en}; o.raiz=g==='geo'?'place first documented':'find (art, tomb, site)';
 }
 log('inventos y descubrimientos: '+inventos.length+' · fuera (astronomia, ajedrez, meteoritos) '+porGrupo.drop+' · lugares -> exploracion '+porGrupo.geo+' · hallazgos -> cultura '+porGrupo.arte);
 const porCat={}, porRaiz={}, porAprox={0:0,1:0,2:0}; let sinUbic=0, sinNombre=0, ruido=0, porAutor=0; const out=[];
 for(const [id,o] of items){ const d=det[id]; if(!d)continue;
  const nEs=limpia(d.es||d.en), nEn=limpia(d.en||d.es); if(!nEs){ sinNombre++; continue }
  if(RUIDO.test(nEs)||RUIDO.test(nEn)){ ruido++; continue }
  let p=punto(d.c0), aprox=0; if(!p){ p=punto(d.c1)||punto(d.c2)||punto(d.c4)||punto(d.c5); if(p)aprox=1 } if(!p){ p=punto(d.c3)||punto(d.c6); if(p)aprox=2 }
  if(!p){ p=punto(d.c7)||punto(d.c8)||punto(d.c9); if(p){ aprox=1; porAutor++ } } if(!p){ p=punto(d.c10); if(p){ aprox=2; porAutor++ } }
  if(!p){ sinUbic++; continue }
  const sl=parseInt(d.sl||'0'); const imp=sl>=60?2:1;   // 2 = preinstalado en la app; 60 Wikipedias es el listón para no hinchar la base
  const es=titulo(o.plantilla,nEs,'es'), en=titulo(o.plantilla,nEn,'en');
  out.push({id:slug(nEs)+'_'+id.toLowerCase(),year:o.anio,lat:+p.lat.toFixed(3),lon:+p.lon.toFixed(3),labels:{es,en},category:o.cat,importance:imp,wikiTitles:{es:d.artEs||nEs,en:d.artEn||nEn},wikidataId:id,aprox:aprox||undefined,fechaAprox:o.prec===7?'siglo':o.prec===8?'decada':undefined,clase:o.raiz,tipo:'entidad',sitelinks:sl,v:2});
  porCat[o.cat]=(porCat[o.cat]||0)+1; porRaiz[o.raiz]=(porRaiz[o.raiz]||0)+1; porAprox[aprox]++;
 }
 out.sort((a,b)=>a.year-b.year||a.id.localeCompare(b.id));
 fs.writeFileSync(SALIDA,JSON.stringify(out));
 fs.writeFileSync(path.join(CACHE,'entidades_informe.json'),JSON.stringify({porCategoria:porCat,porRaiz},null,1));
 log('por categoria: '+JSON.stringify(porCat));
 log('por raiz: '+Object.entries(porRaiz).sort((a,b)=>b[1]-a[1]).map(([k,n])=>k+' '+n).join(' · '));
 log('ubicacion: propia '+porAprox[0]+' · por lugar o sede '+porAprox[1]+' · por pais '+porAprox[2]+' · por su autor (inventos) '+porAutor+' · sin ubicacion (fuera) '+sinUbic+' · sin nombre '+sinNombre+' · ruido filtrado por nombre '+ruido);
 log(out.length+' entidades -> '+SALIDA+' ('+(fs.statSync(SALIDA).size/1048576).toFixed(1)+' MB) · '+nConsultas+' consultas · '+((Date.now()-t0)/60000).toFixed(0)+' min');
})().catch(e=>{ console.error('ERROR: '+e.message); process.exit(1) });
