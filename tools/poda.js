#!/usr/bin/env node
// Poda el arco de una entidad: borra los periodos que caen fuera del rango que
// se conserva, y recorta los que lo cruzan. Sirve para retirar tramos fantasma
// (geometria degenerada que no pinta nada) o para acortar un arco que las
// fuentes no sostienen. Si el rango vacia la entidad entera, avisa y no la
// borra: eso es una decision de modelo, no de geometria.
//   module.exports = { id: [ini, fin], ... }      // conservar [ini,fin]
const L=require('./lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const OPS=require(process.argv[2]);
for(const [id,[ini,fin]] of Object.entries(OPS)){
 const c=CIV.find(x=>x.id===id);
 if(!c){console.log('?? no existe',id);continue}
 const antes=c.periods.length;
 const a0=Math.min(...c.periods.map(p=>p.start)),a1=Math.max(...c.periods.map(p=>p.end));
 const quedan=[];
 for(const p of c.periods){
  if(p.end<=ini||p.start>=fin)continue;
  p.start=Math.max(p.start,ini); p.end=Math.min(p.end,fin);
  quedan.push(p);
 }
 if(!quedan.length){console.log('!! '+id+' quedaria vacia: no se toca');continue}
 c.periods=quedan.sort((a,b)=>a.start-b.start||a.end-b.end);
 console.log(id.padEnd(18)+'arco '+a0+'..'+a1+' -> '+quedan[0].start+'..'+quedan[quedan.length-1].end+
  '   periodos '+antes+' -> '+quedan.length);
}
L.save(src,BLK,CIV,process.env.JSX);
