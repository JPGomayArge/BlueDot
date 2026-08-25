#!/usr/bin/env node
// Dos anillos de la MISMA civilizacion que se solapan se anulan en la zona
// comun: el motor rellena por paridad y el area compartida queda como agujero.
// Se fusionan en uno solo.
const pc=require('polygon-clipping');
const L=require('./lib.js');const R=require('./recorte.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
let tocados=0,fusionados=0;
for(const c of CIV)for(const p of c.periods){
  const n=p.rings.length;if(n<2)continue;
  const B=p.rings.map(L.bb);
  const padre=[...Array(n).keys()];
  const raiz=x=>{while(padre[x]!==x)x=padre[x]=padre[padre[x]];return x};
  let hay=false;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    if(!L.cruza(B[i],B[j]))continue;
    let r;try{r=pc.intersection([p.rings[i]],[p.rings[j]])}catch(e){continue}
    if(!r||!r.length)continue;
    let ar=0;for(const poly of r)ar+=L.rA(poly[0]);
    if(ar<=2e-4)continue;
    const a=raiz(i),b=raiz(j);if(a!==b){padre[a]=b;hay=true}}
  if(!hay)continue;
  const grupos={};
  for(let i=0;i<n;i++){const g=raiz(i);(grupos[g]=grupos[g]||[]).push(p.rings[i])}
  const salida=[];
  for(const g in grupos){
    const gr=grupos[g];
    if(gr.length===1){salida.push(gr[0]);continue}
    let u;try{u=pc.union(gr.map(r=>[r]))}catch(e){salida.push(...gr);continue}
    const nuevo=R.limpia(u,2e-4);
    const a0=gr.reduce((s,r)=>s+L.rA(r),0),a1=nuevo.reduce((s,r)=>s+L.rA(r),0);
    if(!nuevo.length||a1>a0*1.02){salida.push(...gr);continue}
    salida.push(...nuevo);fusionados+=gr.length-nuevo.length;}
  p.rings=salida;tocados++;}
console.log('periodos corregidos '+tocados+' | anillos fusionados '+fusionados);
L.save(src,CIV.length?BLK:BLK,CIV,process.env.JSX);
