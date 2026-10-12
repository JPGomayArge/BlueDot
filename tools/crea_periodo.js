#!/usr/bin/env node
// Inserta un periodo en un HUECO temporal de una entidad, copiando la
// geometria de un periodo vecino o usando una propia.
//
// Es la operacion que las rondas 9, 10 y 11 descartaron una y otra vez: los
// informes encontraban un pueblo desaparecido del mapa durante un tramo
// (cherokee entre 1607 y 1776, pawnee entre 1682 y 1763, natchez, muscogee,
// dakota...), y ninguna de las cuatro herramientas sabia rellenarlo. arco.js
// solo mueve los extremos y anade.js necesita un periodo donde anadir.
//
//   module.exports = { id: [ [ini, fin, 'antes'|'despues'|poly, 'rotulo'], ... ] }
//
// 'antes' copia la geometria del periodo que termina en ini; 'despues', la del
// que empieza en fin. Si el rango pisa un periodo existente, no se hace nada:
// esta herramienta rellena huecos, no sobrescribe.
const L=require('./lib.js');const R=require('./recorte.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const OPS=require(process.argv[2]);
for(const [id,ops] of Object.entries(OPS)){
 const c=CIV.find(x=>x.id===id);
 if(!c){console.log('?? no existe',id);continue}
 for(const [ini,fin,geo,nom] of ops){
  if(fin<=ini){console.log('!! '+id+' rango invalido '+ini+'..'+fin);continue}
  const choca=c.periods.find(p=>p.start<fin&&p.end>ini);
  if(choca){console.log('!! '+id+' '+ini+'..'+fin+' pisa el periodo '+choca.start+'..'+choca.end+': no se toca');continue}
  let rings=null, de='';
  if(geo==='antes'){const p=c.periods.find(p=>p.end===ini)||[...c.periods].filter(p=>p.end<=ini).sort((a,b)=>b.end-a.end)[0];
   if(p){rings=p.rings.map(r=>r.map(q=>q.slice()));de='copiado de '+p.start+'..'+p.end}}
  else if(geo==='despues'){const p=c.periods.find(p=>p.start===fin)||c.periods.filter(p=>p.start>=fin).sort((a,b)=>a.start-b.start)[0];
   if(p){rings=p.rings.map(r=>r.map(q=>q.slice()));de='copiado de '+p.start+'..'+p.end}}
  else {const anillos=Array.isArray(geo[0][0])?geo:[geo];rings=[];for(const q of anillos)rings.push(...R.aTierra(q));de='geometria propia'}
  if(!rings||!rings.length){console.log('!! '+id+' '+ini+'..'+fin+' sin geometria de la que partir');continue}
  const p={start:ini,end:fin,rings};
  if(nom)p.name=nom;
  const vec=c.periods[0]; if(vec&&vec.wikiTitle)p.wikiTitle=vec.wikiTitle;
  c.periods.push(p);c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
  console.log(id.padEnd(20)+String(ini).padStart(6)+'..'+String(fin).padEnd(6)+' insertado ('+de+', area '+
   rings.reduce((s,r)=>s+L.rA(r),0).toFixed(1)+')');
 }
}
L.save(src,BLK,CIV,process.env.JSX);
