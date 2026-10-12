#!/usr/bin/env node
// Espejo de recorta_caja: quita a una entidad, dentro de un rango de anios,
// todo lo que caiga DENTRO de una caja. recorta_caja conserva lo de dentro;
// esta conserva lo de fuera. Es la herramienta para retirar a un imperio la
// reclamacion sobre una region que no administraba.
//
// Se escribio porque anade.js con modo 'menos' recorta antes el poligono a la
// costa, y cuando la region es casi toda oceano (Micronesia) el resultado es
// un puniado de islas que la diferencia no siempre elimina. Aqui se opera
// sobre la caja cruda, sin pasar por la mascara de tierra.
//
//   module.exports = { id: [ [ini, fin, [lonMin,lonMax,latMin,latMax], 'motivo'], ... ] }
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
 for(const [ini,fin,cj,motivo] of ops){
  const [x0,x1,y0,y1]=cj;
  const marco=[[[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]]];
  let a0=0,a1=0,n=0,fuera=0;
  for(const p of c.periods){
   if(p.start<ini||p.end>fin)continue;
   n++; a0+=p.rings.reduce((s,r)=>s+L.rA(r),0);
   const quedan=[];
   for(const r of p.rings){
    const b=L.bb(r);
    if(b[1]<x0||b[0]>x1||b[3]<y0||b[2]>y1){quedan.push(r);continue}      // entero fuera
    if(b[0]>=x0&&b[1]<=x1&&b[2]>=y0&&b[3]<=y1){fuera++;continue}          // entero dentro: se va
    let res;try{res=pc.difference([[r]],marco)}catch(e){quedan.push(r);continue}
    quedan.push(...R.limpia(res,3e-4));
   }
   if(quedan.length)p.rings=quedan;
   a1+=p.rings.reduce((s,r)=>s+L.rA(r),0);
  }
  console.log(id.padEnd(14)+String(ini).padStart(6)+'..'+String(fin).padEnd(6)+
   ' periodos '+String(n).padStart(3)+'  anillos enteros retirados '+String(fuera).padStart(4)+
   '  area '+a0.toFixed(0).padStart(6)+' -> '+a1.toFixed(0).padStart(6)+(motivo?'   '+motivo:''));
 }
 c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
}
L.save(src,BLK,CIV,process.env.JSX);
