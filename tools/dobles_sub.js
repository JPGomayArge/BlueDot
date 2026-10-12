#!/usr/bin/env node
// Igual que dobles_exacto pero restringido a los pares en los que al menos una
// de las dos entidades esta en la lista que se pasa. Sirve para medir lo que
// acaba de tocarse sin recorrer el mapa entero.
const pc=require('polygon-clipping');const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
const IDS=new Set(require(process.argv[2]));
const cajas=new Map();
for(const c of CIV)for(const p of c.periods)
 cajas.set(p, p.rings.map(r=>L.bb(r)).reduce((a,x)=>a?[Math.min(a[0],x[0]),Math.max(a[1],x[1]),Math.min(a[2],x[2]),Math.max(a[3],x[3])]:x.slice(),null));
// Caja y arco por CIVILIZACION: si dos entidades no coinciden ni en el espacio
// ni en el tiempo, no hay que mirar sus periodos uno a uno. Sin esta poda el
// recorrido es O(periodos x periodos) sobre entidades de ochenta periodos.
const cajaCiv=new Map(), arcoCiv=new Map();
for(const c of CIV){
 let b=null,a0=Infinity,a1=-Infinity;
 for(const p of c.periods){const x=cajas.get(p);
  b=b?[Math.min(b[0],x[0]),Math.max(b[1],x[1]),Math.min(b[2],x[2]),Math.max(b[3],x[3])]:x.slice();
  if(p.start<a0)a0=p.start; if(p.end>a1)a1=p.end;}
 cajaCiv.set(c,b); arcoCiv.set(c,[a0,a1]);
}
const res=[];let pares=0,podados=0;
for(let i=0;i<CIV.length;i++)for(let j=i+1;j<CIV.length;j++){
 const A=CIV[i],B=CIV[j];
 if(!IDS.has(A.id)&&!IDS.has(B.id))continue;
 const ba=cajaCiv.get(A),bc=cajaCiv.get(B),aa=arcoCiv.get(A),ab=arcoCiv.get(B);
 if(!ba||!bc||ba[1]<bc[0]||bc[1]<ba[0]||ba[3]<bc[2]||bc[3]<ba[2]||aa[1]<=ab[0]||ab[1]<=aa[0]){podados++;continue}
 pares++;let areaAnios=0,peor=null;
 for(const a of A.periods)for(const b of B.periods){
  const ini=Math.max(a.start,b.start),fin=Math.min(a.end,b.end);
  if(fin<=ini)continue;
  const ca=cajas.get(a),cb=cajas.get(b);
  if(ca[1]<cb[0]||cb[1]<ca[0]||ca[3]<cb[2]||cb[3]<ca[2])continue;
  let inter;try{inter=pc.intersection(a.rings.map(r=>[r]),b.rings.map(r=>[r]))}catch(e){continue}
  if(!inter||!inter.length)continue;
  let ar=0;for(const poly of inter)ar+=L.rA(poly[0]);
  if(ar<1e-6)continue;
  areaAnios+=ar*(fin-ini);
  if(!peor||ar>peor.ar)peor={ini,fin,ar};
 }
 if(areaAnios>0)res.push({a:A.id,b:B.id,v:areaAnios,peor});
}
res.sort((x,y)=>y.v-x.v);
console.log('pares examinados '+pares+' (podados '+podados+') | con solape '+res.length+' | grado2-anio total: '+res.reduce((s,x)=>s+x.v,0).toFixed(1));
for(const r of res.slice(0,30))
 console.log('  '+r.a.padEnd(24)+r.b.padEnd(26)+r.v.toFixed(1).padStart(10)+'   '+r.peor.ini+'..'+r.peor.fin+' ('+r.peor.ar.toFixed(2)+')');
