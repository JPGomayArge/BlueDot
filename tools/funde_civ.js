#!/usr/bin/env node
// Funde una civilizacion en otra: el mismo pueblo estaba dos veces en el mapa
// con ids distintos, cosa que las rondas de verificacion han encontrado cuatro
// veces. La perdedora aporta su geometria a la superviviente y desaparece.
//
//   module.exports = [ [idQueDesaparece, idQueSobrevive], ... ]
//
// La superviviente se parte en los cortes de la otra para no heredar
// geometria en anios que no le tocan, y se extiende su arco si la perdedora
// vivia antes o despues. Luego conviene pasar fusiona_solapes.js, porque dos
// anillos de la misma civilizacion que se solapan se anulan por paridad.
const L=require('./lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const PARES=require(process.argv[2]);
function parteEn(c,y){
 const p=c.periods.find(p=>p.start<y&&p.end>y); if(!p)return;
 const n={start:y,end:p.end,rings:p.rings.map(r=>r.map(q=>q.slice()))};
 if(p.name)n.name=p.name; if(p.wikiTitle)n.wikiTitle=p.wikiTitle;
 p.end=y;c.periods.push(n);c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
}
for(const [idP,idS] of PARES){
 const P=CIV.find(x=>x.id===idP), S=CIV.find(x=>x.id===idS);
 if(!P||!S){console.log('?? falta',idP,idS);continue}
 const p0=Math.min(...P.periods.map(p=>p.start)), p1=Math.max(...P.periods.map(p=>p.end));
 const s0=Math.min(...S.periods.map(p=>p.start)), s1=Math.max(...S.periods.map(p=>p.end));
 // extender el arco de la superviviente si hace falta
 S.periods.sort((a,b)=>a.start-b.start);
 if(p0<s0)S.periods[0].start=p0;
 if(p1>s1)S.periods[S.periods.length-1].end=p1;
 for(const pp of P.periods){parteEn(S,pp.start);parteEn(S,pp.end)}
 let anillos=0;
 for(const sp of S.periods) for(const pp of P.periods){
  if(!(pp.start<sp.end&&pp.end>sp.start))continue;
  for(const r of pp.rings){sp.rings.push(r.map(q=>q.slice()));anillos++}
 }
 CIV.splice(CIV.indexOf(P),1);
 console.log(idP.padEnd(24)+'-> '+idS.padEnd(24)+' arco '+p0+'..'+p1+' aportado, '+anillos+' anillos; queda '+
  Math.min(...S.periods.map(p=>p.start))+'..'+Math.max(...S.periods.map(p=>p.end))+' en '+S.periods.length+' periodos');
}
L.save(src,BLK,CIV,process.env.JSX);
