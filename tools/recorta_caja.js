#!/usr/bin/env node
// Recorta los periodos de una entidad, dentro de un rango de años, a una caja
// de coordenadas. Es la herramienta para el error mas frecuente en entidades
// grandes: territorio que la caja da a una fase ANTES de que fuera suyo, o que
// conserva DESPUES de perderlo. Suele delatarse porque el area crece justo en
// la fase cuyo rotulo habla de derrota o desmembramiento.
//
//   module.exports = { id: [ [ini, fin, [lonMin,lonMax,latMin,latMax], 'motivo'], ... ] }
//
// Los anillos que quedan enteros fuera se eliminan; los que cruzan el borde se
// cortan. No se añade nada: solo se quita.
const pc=require('polygon-clipping');
const L=require('./lib.js');const R=require('./recorte.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const OPS=require(process.argv[2]);
function parteEn(c,y){
 const p=c.periods.find(p=>p.start<y&&p.end>y); if(!p)return;
 const n={start:y,end:p.end,rings:p.rings.map(r=>r.map(q=>q.slice()))};
 if(p.name)n.name=p.name; if(p.wikiTitle)n.wikiTitle=p.wikiTitle;
 p.end=y;c.periods.push(n);c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
}
for(const [id,ops] of Object.entries(OPS)){
 const c=CIV.find(x=>x.id===id);
 if(!c){console.log('?? no existe',id);continue}
 for(const [ini,fin] of ops){parteEn(c,ini);parteEn(c,fin)}
 for(const [ini,fin,caja,motivo] of ops){
  const [x0,x1,y0,y1]=caja;
  const marco=[[[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]]];
  let a0=0,a1=0,n=0;
  for(const p of c.periods){
   if(p.start<ini||p.end>fin)continue;
   n++; a0+=p.rings.reduce((s,r)=>s+L.rA(r),0);
   const fuera=[];
   for(const r of p.rings){
    const b=L.bb(r);
    if(b[1]<x0||b[0]>x1||b[3]<y0||b[2]>y1)continue;          // entero fuera
    if(b[0]>=x0&&b[1]<=x1&&b[2]>=y0&&b[3]<=y1){fuera.push(r);continue} // entero dentro
    let res;try{res=pc.intersection([[r]],marco)}catch(e){fuera.push(r);continue}
    fuera.push(...R.limpia(res,3e-4));
   }
   if(fuera.length)p.rings=fuera;
   a1+=p.rings.reduce((s,r)=>s+L.rA(r),0);
  }
  console.log(id.padEnd(18)+String(ini).padStart(6)+'..'+String(fin).padEnd(6)+
   ' periodos '+String(n).padStart(3)+'  area '+a0.toFixed(0).padStart(6)+' -> '+a1.toFixed(0).padStart(6)+
   (motivo?'   '+motivo:''));
 }
 c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
}
L.save(src,BLK,CIV,process.env.JSX);
