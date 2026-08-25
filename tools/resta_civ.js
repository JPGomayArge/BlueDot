#!/usr/bin/env node
// Resta la geometria de una civilizacion a otra, tramo por tramo, SIN usar el
// ojo de cerradura: cuando el recorte deja un agujero el poligono se PARTE.
//   module.exports = [ [perdedor, ganador], ... ]
const pc=require('polygon-clipping');
const L=require('./lib.js');const R=require('./recorte.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const PARES=require(process.argv[2]);
function parteEn(c,y){
 const p=c.periods.find(p=>p.start<y&&p.end>y); if(!p)return;
 const n={start:y,end:p.end,rings:p.rings.map(r=>r.map(q=>q.slice()))};
 if(p.name)n.name=p.name; if(p.wikiTitle)n.wikiTitle=p.wikiTitle;
 p.end=y;c.periods.push(n);c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
}
let tocados=0;
for(const [idP,idG] of PARES){
 const P=CIV.find(x=>x.id===idP),G=CIV.find(x=>x.id===idG);
 if(!P||!G){console.log('?? falta',idP,idG);continue}
 for(const gp of G.periods){parteEn(P,gp.start);parteEn(P,gp.end)}
 let a0=0,a1=0;const contenidos=[];
 for(const p of P.periods){
  a0+=p.rings.reduce((s,r)=>s+L.rA(r),0);
  const quitar=[];
  for(const gp of G.periods){if(!(gp.start<p.end&&gp.end>p.start))continue;
   for(const r of gp.rings)quitar.push([r])}
  if(quitar.length){
   const cj=quitar.map(q=>L.bb(q[0]));
   const fuera=[];
   for(const r of p.rings){
    const b=L.bb(r);const rel=quitar.filter((q,i)=>L.cruza(b,cj[i]));
    if(!rel.length){fuera.push(r);continue}
    let res;try{res=pc.difference([[r]],rel)}catch(e){fuera.push(r);continue}
    fuera.push(...R.limpia(res,3e-4));}
   // Si la resta vaciaria el periodo, el perdedor esta CONTENIDO ENTERO en el
   // ganador. No lo borramos en silencio: eso no es un problema de geometria
   // sino de modelo (arcos que se pisan, o una entidad que ya no deberia
   // existir en ese tramo). Se avisa para arreglarlo a mano.
   if(fuera.length)p.rings=fuera;
   else contenidos.push(p.start+'..'+p.end);}
  a1+=p.rings.reduce((s,r)=>s+L.rA(r),0);}
 tocados++;
 console.log((idP+' <- '+idG).padEnd(42),'area',a0.toFixed(1),'->',a1.toFixed(1)+
  (contenidos.length?'   !! '+idP+' queda dentro de '+idG+' en '+contenidos.slice(0,4).join(' ')+(contenidos.length>4?' ...':''):''));}
for(const c of CIV)c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
console.log('pares resueltos: '+tocados);
L.save(src,BLK,CIV,process.env.JSX);
