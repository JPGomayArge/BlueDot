#!/usr/bin/env node
// Muestra los periodos de una entidad: años, nombre, nº de anillos, area y caja.
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
for(const id of process.argv.slice(2)){
 const c=CIV.find(x=>x.id===id);
 if(!c){console.log('?? no existe '+id);continue}
 console.log('=== '+c.id+'  '+c.name+(c.kind?'  ['+c.kind+']':'')+'  '+(c.wikiTitle||'(sin wiki)'));
 for(const p of c.periods){
  const b=p.rings.map(r=>L.bb(r)).reduce((a,x)=>a?[Math.min(a[0],x[0]),Math.max(a[1],x[1]),Math.min(a[2],x[2]),Math.max(a[3],x[3])]:x.slice(),null);
  const ar=p.rings.reduce((s,r)=>s+L.rA(r),0);
  console.log(String(p.start).padStart(6)+'..'+String(p.end).padEnd(6)+' anillos '+String(p.rings.length).padStart(2)+
   ' area '+ar.toFixed(1).padStart(8)+
   '  lon['+b[0].toFixed(1)+','+b[1].toFixed(1)+'] lat['+b[2].toFixed(1)+','+b[3].toFixed(1)+']'+
   '  '+(p.name||''));
 }
}
