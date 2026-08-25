#!/usr/bin/env node
// Parte periodos en los años indicados, duplicando la geometria. Sirve para
// dar resolucion temporal antes de añadir o quitar regiones.
//   module.exports = { id: [año, año, ...] }
const L=require('./lib.js');const {src,CIV,R}=L.load(process.env.JSX);
const OPS=require(process.argv[2]);
for(const [id,años] of Object.entries(OPS)){
  const c=CIV.find(x=>x.id===id);if(!c){console.log('?? no existe',id);continue}
  const antes=c.periods.length;
  for(const y of años){
    const out=[];
    for(const p of c.periods){
      if(y>p.start&&y<p.end){out.push({...p,end:y,rings:p.rings.map(r=>r)});
                             out.push({...p,start:y,rings:p.rings.map(r=>r)})}
      else out.push(p)}
    c.periods=out;}
  c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
  console.log(id.padEnd(20),'periodos '+antes+' -> '+c.periods.length);}
L.save(src,R,CIV,process.env.JSX);
