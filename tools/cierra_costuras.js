#!/usr/bin/env node
// CERRAR LAS COSTURAS.
//
// Dos contornos dibujados por separado casi nunca se encuentran: entre los
// khoisan y la sabana austral hay una franja de tres grados2 vacia durante
// diez mil anios; entre evenkos y yakutos, otra; entre el Sahara y el Magreb,
// otra. La radiografia las suma: las quince peores costuras juntan mas de
// 250.000 grados2-anio de tierra negra que no significa nada.
//
// El metodo no es ensanchar poligonos ni pegar celdas (escaleras): es CALCAR
// LA FRONTERA DEL VECINO. Cada tramo seguido de vertices del contorno A que
// esta fuera de B y a menos de EPS grados de la frontera de B se sustituye por
// el trozo de la frontera de B que va del punto mas cercano al primero al
// punto mas cercano al ultimo. A sigue entonces la linea de B al centimetro, y
// la forma de A no cambia salvo en la costura, que desaparece. (La primera
// version movia cada vertice por su cuenta al punto mas cercano; sobre una
// frontera dentada los vertices se cruzaban y 925 de 1.500 anillos habia que
// devolverlos.)
//
// Lo que NO se cierra, y por que:
//   - mar: si entre el vertice y su destino hay agua, el hueco es un estrecho.
//   - vacio declarado: si el punto medio cae en un vacio de vacios.js vigente
//     ese anio, el hueco es un desierto, y la regla dice que no se fuerza.
//   - anillos que al moverse se cruzan a si mismos: se deja como estaba.
//   - solapes temporales cortos: si B solo coincide con parte del periodo de
//     A, A se parte en las fronteras de B (como hace remodela_fisico) y solo
//     se acerca el trozo que coincide; trozos de menos de MINA anios no se
//     crean, y esa pareja se deja.
//   - quien se acerca: entre un area cultural y un estado solo se mueve el
//     area cultural (el fondo rellena, el estado no crece). Entre iguales se
//     mueven las dos.
// Al final, lo que quede de A dentro de B se resta (la frontera es de B).
//
//   JSX=<mapa> node cierra_costuras.js [--aplica] [--solo id,id]  EPS=0.5 MINA=20
const pc=require('polygon-clipping');
const L=require('./lib.js'); const R=require('./recorte.js'); const T=require('./tierra.js'); const V=require('./vacios.js');
const {malo}=require('./auto_int_lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const args=process.argv.slice(2); const APLICA=args.includes('--aplica');
const SOLO=args.includes('--solo')?new Set(args[args.indexOf('--solo')+1].split(',')):null;
const EPS=+(process.env.EPS||0.5), MINA=+(process.env.MINA||20);
const t0=Date.now();

// --- indice de segmentos por celda de medio grado, por periodo ----------------
const CEL=0.5; const cel=(x,y)=>Math.floor(x/CEL)+','+Math.floor(y/CEL);
function indice(rings){ const m=new Map(); const segs=[]; const bbs=rings.map(L.bb);
 for(let ri=0;ri<rings.length;ri++){ const r=rings[ri]; for(let i=0;i<r.length;i++){ const a=r[i],b=r[(i+1)%r.length]; const k=segs.push([a,b,ri,i])-1;
  const x0=Math.floor(Math.min(a[0],b[0])/CEL),x1=Math.floor(Math.max(a[0],b[0])/CEL),y0=Math.floor(Math.min(a[1],b[1])/CEL),y1=Math.floor(Math.max(a[1],b[1])/CEL);
  for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){ const kk=x+','+y; let l=m.get(kk); if(!l)m.set(kk,l=[]); l.push(k) } } }
 return {m,segs,bbs,rings} }
function dentro(idx,pt){ let n=0; for(let i=0;i<idx.rings.length;i++){ const b=idx.bbs[i]; if(pt[0]<b[0]||pt[0]>b[1]||pt[1]<b[2]||pt[1]>b[3])continue; if(L.pip(pt,idx.rings[i]))n++ } return n%2===1 }
function masCercano(idx,p){ // punto mas cercano de la frontera, en grados "planos" (lon escalada)
 const cs=Math.cos(p[1]*Math.PI/180); let best=null,bd=EPS*EPS; const cx=Math.floor(p[0]/CEL),cy=Math.floor(p[1]/CEL);
 const n=Math.ceil(EPS/CEL)+1;
 for(let x=cx-n;x<=cx+n;x++)for(let y=cy-n;y<=cy+n;y++){ const l=idx.m.get(x+','+y); if(!l)continue;
  for(const k of l){ const [a,b,ri,si]=idx.segs[k];
   const ax=(a[0]-p[0])*cs,ay=a[1]-p[1],bx=(b[0]-p[0])*cs,by=b[1]-p[1];
   const dx=bx-ax,dy=by-ay; const l2=dx*dx+dy*dy; let t=l2>0?-(ax*dx+ay*dy)/l2:0; t=Math.max(0,Math.min(1,t));
   const qx=ax+t*dx,qy=ay+t*dy; const d=qx*qx+qy*qy;
   if(d<bd){bd=d;best={pt:[p[0]+qx/cs,p[1]+qy],ri,si,t}} } }
 return best }
// el trozo de la frontera de B (anillo ri) entre dos puntos sobre ella, por el lado corto
const dist=(a,b)=>Math.hypot((a[0]-b[0])*Math.cos((a[1]+b[1])/2*Math.PI/180),a[1]-b[1]);
function tramoFrontera(ring,s1,s2){
 const n=ring.length; const out=[]; const largo=path=>{let l=0;for(let i=1;i<path.length;i++)l+=dist(path[i-1],path[i]);return l};
 const adelante=[s1.pt]; for(let k=(s1.si+1)%n,c=0;c<n;k=(k+1)%n,c++){ if(k===(s2.si+1)%n)break; adelante.push(ring[k]) }
 if(s1.si===s2.si&&s1.t<=s2.t)adelante.length=1;
 adelante.push(s2.pt);
 const atras=[s1.pt]; for(let k=s1.si,c=0;c<n;k=(k-1+n)%n,c++){ if(k===s2.si)break; atras.push(ring[k]) }
 if(s1.si===s2.si&&s1.t>=s2.t)atras.length=1;
 atras.push(s2.pt);
 const la=largo(adelante),lb=largo(atras); const path=la<=lb?adelante:atras; const l=Math.min(la,lb);
 if(l>3*dist(s1.pt,s2.pt)+2*EPS)return null;   // daria la vuelta al anillo: no es una costura
 return path }
const R2=q=>[Math.round(q[0]*100)/100,Math.round(q[1]*100)/100];
const camino=(a,b)=>[0.25,0.5,0.75].map(t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
const mueve=(mp,d)=>mp.map(poly=>poly.map(r=>r.map(q=>[q[0]+d,q[1]+d])));
function seguro(op,a,b){ for(const d of [0,1e-6,-1e-6,3e-6]){ try{ return pc[op](a,d?mueve(b,d):b) }catch(e){} } throw new Error(op) }
const cruzaC=(a,b)=>!(a[1]<b[0]||a[0]>b[1]||a[3]<b[2]||a[2]>b[3]);
const copia=p=>{ const n={start:p.start,end:p.end,rings:p.rings.map(r=>r.map(q=>q.slice()))}; if(p.name)n.name=p.name; if(p.wikiTitle)n.wikiTitle=p.wikiTitle; if(p.inc)n.inc=1; return n };

// --- todos los periodos con su caja ------------------------------------------------
const todos=[]; for(const c of CIV)for(const p of c.periods){ if(!p.rings.length)continue;
 const b=p.rings.reduce((a,r)=>{const bb=L.bb(r);return [Math.min(a[0],bb[0]),Math.max(a[1],bb[1]),Math.min(a[2],bb[2]),Math.max(a[3],bb[3])]},[9e9,-9e9,9e9,-9e9]);
 todos.push({c,p,b}) }
const idxCache=new Map(); const idxDe=p=>{ let i=idxCache.get(p); if(!i){ i=indice(p.rings); idxCache.set(p,i); if(idxCache.size>400)idxCache.delete(idxCache.keys().next().value) } return i };

let movidos=0,anillosTocados=0,periodosTocados=0,partidos=0,revertidos=0,restasFallidas=0; const porPar=new Map();
for(const c of CIV){ if(SOLO&&!SOLO.has(c.id))continue;
 const cola=c.periods.slice();
 while(cola.length){ const p=cola.shift(); if(!p.rings.length)continue;
  const b=p.rings.reduce((a,r)=>{const bb=L.bb(r);return [Math.min(a[0],bb[0]),Math.max(a[1],bb[1]),Math.min(a[2],bb[2]),Math.max(a[3],bb[3])]},[9e9,-9e9,9e9,-9e9]);
  const bE=[b[0]-EPS,b[1]+EPS,b[2]-EPS,b[3]+EPS];
  const vecinos=todos.filter(t=>t.c!==c&&t.p.start<p.end&&t.p.end>p.start&&cruzaC(bE,t.b)&&!(c.kind!=='cultura'&&t.c.kind==='cultura'));
  if(!vecinos.length)continue;
  // cortes: fronteras de vecinos dentro del periodo que dejen trozos de MINA anios
  const cortes=new Set();
  for(const v of vecinos)for(const y of [v.p.start,v.p.end]) if(y>p.start&&y<p.end)cortes.add(y);
  const ys=[...cortes].sort((a,b)=>a-b).filter((y,i,arr)=>{ const prev=i?arr[i-1]:p.start; return y-prev>=MINA&&p.end-y>=MINA });
  if(ys.length){ let cur=p; const piezas=[];
   for(const y of ys){ const n=copia(cur); n.start=y; cur.end=y; piezas.push(n); cur=n }
   c.periods.push(...piezas); cola.unshift(...piezas); partidos+=piezas.length;
   for(const n of piezas)todos.push({c,p:n,b}) }
  // ahora p es [p.start,p.end) ya recortado; se acerca a cada vecino que lo cubra entero
  let tocado=false;
  for(const v of vecinos){ if(v.p.start>p.start||v.p.end<p.end)continue;
   const idx=idxDe(v.p); let nMov=0; const nuevos=[];
   for(const r of p.rings){ const rb=L.bb(r); if(!cruzaC([rb[0]-EPS,rb[1]+EPS,rb[2]-EPS,rb[3]+EPS],v.b)){nuevos.push(r);continue}
    // 1. para cada vertice, su punto mas cercano en B si esta en la costura
    const cerca=r.map(pt=>{ if(pt[0]<v.b[0]-EPS||pt[0]>v.b[1]+EPS||pt[1]<v.b[2]-EPS||pt[1]>v.b[3]+EPS)return null; if(dentro(idx,pt))return null;
     const s=masCercano(idx,pt); if(!s)return null;
     const medio=camino(pt,s.pt); if(!medio.every(m=>T.enTierra(m)))return null;
     const anio=Math.max(p.start,-10000); if(V.legitimo(medio[1],anio)||V.legitimo(medio[1],Math.min(p.end-1,2025)))return null;
     return s });
    const nCerca=cerca.filter(Boolean).length; if(!nCerca||nCerca===r.length){nuevos.push(r);continue}
    // 2. rotar para que el indice 0 no este en costura, y calcar cada tramo seguido
    let rot=0; while(cerca[rot])rot++;
    const rr=r.slice(rot).concat(r.slice(0,rot)), cc=cerca.slice(rot).concat(cerca.slice(0,rot));
    const q=[]; let mov=0;
    for(let i=0;i<rr.length;){ if(!cc[i]){q.push(rr[i]);i++;continue}
     let j=i; while(j+1<rr.length&&cc[j+1])j++;
     const s1=cc[i],s2=cc[j]; let path=null;
     if(s1.ri===s2.ri)path=tramoFrontera(idx.rings[s1.ri],s1,s2);
     if(path){ for(const x of path)q.push(R2(x)); mov+=j-i+1 } else { for(let k=i;k<=j;k++)q.push(rr[k]) }
     i=j+1 }
    // vertices repetidos seguidos fuera
    const qq=q.filter((x,k)=>k===0||x[0]!==q[k-1][0]||x[1]!==q[k-1][1]);
    if(mov&&(qq.length<4||malo(qq))){ revertidos++; nuevos.push(r); continue }
    if(mov){ nMov+=mov; anillosTocados++; nuevos.push(qq) } else nuevos.push(r) }
   if(!nMov)continue;
   // lo que haya quedado dentro del vecino es del vecino
   let res=null; try{ res=R.limpia(seguro('difference',nuevos.map(x=>[x]),v.p.rings.map(x=>[x])),3e-4) }catch(e){ restasFallidas++ }
   const a0=nuevos.reduce((s,x)=>s+L.rA(x),0);
   if(res&&res.length&&res.reduce((s,x)=>s+L.rA(x),0)>a0*0.9) p.rings=res; else p.rings=nuevos;
   movidos+=nMov; tocado=true;
   const k=c.id+' -> '+v.c.id; porPar.set(k,(porPar.get(k)||0)+nMov) }
  if(tocado)periodosTocados++;
 }
 c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
}
console.log('vertices acercados: '+movidos+'  anillos: '+anillosTocados+'  periodos: '+periodosTocados+'  periodos partidos: '+partidos+
 '  anillos revertidos por cruce: '+revertidos+'  restas fallidas: '+restasFallidas+'  ('+((Date.now()-t0)/1000).toFixed(0)+'s)');
const pares=[...porPar.entries()].sort((a,b)=>b[1]-a[1]);
console.log('\nparejas con mas vertices movidos:'); for(const [k,n] of pares.slice(0,25))console.log('  '+String(n).padStart(5)+'  '+k);
if(APLICA){ L.save(src,BLK,CIV,process.env.JSX); console.log('\nescrito '+process.env.JSX) } else console.log('\n(sin --aplica no se escribe)');
