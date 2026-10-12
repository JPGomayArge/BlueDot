#!/usr/bin/env node
// Ajusta el arco de una entidad: cambia el año en que empieza y/o termina,
// estirando o encogiendo el primer y el ultimo periodo. No mueve los cortes
// intermedios. Para acortar de verdad (borrando periodos enteros) usa poda.js;
// para partir, parte.js.
//   module.exports = { id: [inicio|null, fin|null], ... }
const L=require('./lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const OPS=require(process.argv[2]);
let n=0;
for(const [id,[ini,fin]] of Object.entries(OPS)){
 const c=CIV.find(x=>x.id===id);
 if(!c){console.log('?? no existe',id);continue}
 c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
 const p0=c.periods[0], p1=c.periods[c.periods.length-1];
 const a0=p0.start, a1=p1.end;
 if(ini!=null){
  if(ini>=p0.end){console.log('!! '+id+': inicio '+ini+' invadiria el primer periodo ('+p0.start+'..'+p0.end+'), se ignora');}
  else p0.start=ini;
 }
 if(fin!=null){
  if(fin<=p1.start){console.log('!! '+id+': fin '+fin+' invadiria el ultimo periodo ('+p1.start+'..'+p1.end+'), se ignora');}
  else p1.end=fin;
 }
 if(p0.start!==a0||p1.end!==a1){n++;
  console.log(id.padEnd(20)+String(a0).padStart(6)+'..'+String(a1).padEnd(6)+' -> '+
   String(p0.start).padStart(6)+'..'+p1.end);}
}
console.log('arcos ajustados:',n);
L.save(src,BLK,CIV,process.env.JSX);
