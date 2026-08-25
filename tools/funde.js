#!/usr/bin/env node
// Funde periodos consecutivos con la misma geometria y el mismo nombre.
const L=require('./lib.js');const {src,CIV,R}=L.load(process.env.JSX);
const {firma}=require('./carve_lib.js');
let antes=0,despues=0;
for(const c of CIV){
 c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
 antes+=c.periods.length;
 const out=[];
 for(const p of c.periods){
  const l=out[out.length-1];
  if(l&&l.end===p.start&&l.name===p.name&&firma(l.rings)===firma(p.rings)){l.end=p.end;continue}
  out.push(p);}
 c.periods=out;despues+=out.length;}
console.log('periodos '+antes+' -> '+despues);
L.save(src,R,CIV,process.env.JSX);
