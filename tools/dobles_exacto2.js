#!/usr/bin/env node
// DOBLE PINTADO EXACTO, version que cabe en un mapa grande.
//
// Mide lo mismo que dobles_exacto.js -- interseca poligonos y suma area real
// compartida, no muestrea -- pero deja de recorrer el mapa como si cada
// periodo tuviera geometria propia. Tres podas:
//
//  1. Los anillos viven una sola vez en el diccionario __RG. Aqui se cargan
//     SIN copiar, asi que dos periodos con la misma forma comparten indice y
//     su interseccion se calcula una vez y se memoriza. Una cultura tallada
//     conserva la misma geometria durante decenas de periodos seguidos: ahi
//     estaba casi todo el trabajo repetido.
//  2. Caja y arco por civilizacion antes de mirar sus periodos.
//  3. Caja por anillo: a polygon-clipping solo se le pasan los pares de
//     anillos cuyas cajas se cruzan, no los conjuntos enteros.
//
//   JSX=../app/index.jsx node dobles_exacto2.js [areaMinima]
//   IDS=lista.json  -> mide solo los pares que tocan esa lista de ids
const fs=require('fs');
const pc=require('polygon-clipping');
const L=require('./lib.js');

// --- carga que preserva la identidad de cada anillo del diccionario ---
const ruta=process.env.JSX||L.RUTA_POR_DEFECTO;
const src=fs.readFileSync(ruta,'utf8');
const R=L.rawBlock(src);
const CIV=eval(R.txt);
let DIC=null;
{const g=src.indexOf('const __RG');
 if(g>=0&&g<R.a){const a=src.indexOf('[',g);let d=0,i=a;
  for(;;i++){const c=src[i];if(c==='[')d++;else if(c===']'){d--;if(d===0)break}}
  DIC=eval(src.slice(a,i+1)).map(L.decRing);}}
if(!DIC){console.error('este script necesita el diccionario __RG');process.exit(1)}
const CAJA=DIC.map(L.bb);                    // caja de cada anillo unico
for(const c of CIV)for(const p of c.periods){
 p.ix = typeof p.rings==='string' && p.rings.length ? p.rings.split(',').map(k=>parseInt(k,36)) : [];
 p.sig = p.ix.join(',');
 p.rings = p.ix.map(k=>DIC[k]);              // sin copiar: identidad compartida
}

const MIN=Number(process.argv[2]||0.001);
const SOLO=process.env.IDS?new Set(JSON.parse(fs.readFileSync(process.env.IDS,'utf8'))):null;

const cajaCiv=CIV.map(c=>L.caja(c));
const arco=CIV.map(c=>[Math.min(...c.periods.map(p=>p.start)),Math.max(...c.periods.map(p=>p.end))]);

// memoria de intersecciones por par de firmas de geometria
const memo=new Map();
let calculadas=0,memorizadas=0;
function areaComun(a,b){
 const k = a.sig<b.sig ? a.sig+'|'+b.sig : b.sig+'|'+a.sig;
 const v=memo.get(k); if(v!==undefined){memorizadas++;return v}
 // solo los pares de anillos cuyas cajas se cruzan
 const ra=[],rb=[];const usaA=new Set(),usaB=new Set();
 for(const x of a.ix)for(const y of b.ix)
  if(L.cruza(CAJA[x],CAJA[y])){usaA.add(x);usaB.add(y)}
 let ar=0;
 if(usaA.size&&usaB.size){
  for(const x of usaA)ra.push([DIC[x]]);
  for(const y of usaB)rb.push([DIC[y]]);
  calculadas++;
  try{const inter=pc.intersection(ra,rb);
   if(inter)for(const poly of inter)ar+=L.rA(poly[0]);
  }catch(e){ar=0}
 }
 if(ar<1e-6)ar=0;
 memo.set(k,ar);
 return ar;
}

const res=[];let pares=0,podados=0;
for(let i=0;i<CIV.length;i++)for(let j=i+1;j<CIV.length;j++){
 if(SOLO&&!SOLO.has(CIV[i].id)&&!SOLO.has(CIV[j].id))continue;
 if(arco[i][1]<=arco[j][0]||arco[j][1]<=arco[i][0]){podados++;continue}
 if(!L.cruza(cajaCiv[i],cajaCiv[j])){podados++;continue}
 pares++;
 let areaAnios=0,peor=null;
 for(const a of CIV[i].periods)for(const b of CIV[j].periods){
  const ini=Math.max(a.start,b.start),fin=Math.min(a.end,b.end);
  if(fin<=ini)continue;
  const ar=areaComun(a,b);
  if(!ar)continue;
  areaAnios+=ar*(fin-ini);
  if(!peor||ar>peor.ar)peor={ar,ini,fin};
 }
 if(areaAnios>MIN)res.push({a:CIV[i].id,b:CIV[j].id,areaAnios,peor});
}
res.sort((x,y)=>y.areaAnios-x.areaAnios);
const total=res.reduce((s,r)=>s+r.areaAnios,0);
console.log('pares comparables '+pares+' (podados '+podados+') | intersecciones calculadas '+calculadas+', reutilizadas '+memorizadas);
console.log('PARES CON SOLAPE REAL: '+res.length+' | grado2-anio total: '+total.toFixed(1));
console.log('\nid_a                 id_b                   grado2-anio   peor tramo (area en ese tramo)');
for(const r of res.slice(0,40))
 console.log('  '+r.a.padEnd(20)+' '+r.b.padEnd(22)+String(r.areaAnios.toFixed(1)).padStart(10)+
  '   '+r.peor.ini+'..'+r.peor.fin+' ('+r.peor.ar.toFixed(2)+')');
if(res.length>40)console.log('  ... y '+(res.length-40)+' pares mas');
fs.writeFileSync(process.env.SALIDA||'/tmp/dobles.json',JSON.stringify(res));
