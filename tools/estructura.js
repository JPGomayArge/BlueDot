#!/usr/bin/env node
// Chequeo de integridad. Deberia dar cero en todo.
//   node estructura.js [ruta.jsx]
// polygon-clipping solo hace falta para el chequeo de solapes internos.
// Sin el, el resto de comprobaciones siguen funcionando: asi este script corre
// tambien en entornos sin red donde no se pudo hacer npm install.
let pc=null;try{pc=require('polygon-clipping')}catch(e){}
const L=require('./lib.js');
const {CIV}=L.load(process.argv[2]||process.env.JSX);
let mal=0,vacio=0,solapeT=0,desord=0,solapeI=0,per=0,ani=0;
const detalle=[];
for(const c of CIV){
 const ps=[...c.periods].sort((a,b)=>a.start-b.start||a.end-b.end);
 for(let i=0;i<ps.length;i++){
  const p=ps[i];per++;
  if(p.end<=p.start){desord++;detalle.push('desordenado '+c.id+' '+p.start+'..'+p.end)}
  if(!p.rings.length){vacio++;detalle.push('vacio '+c.id+' '+p.start)}
  if(i>0&&ps[i].start<ps[i-1].end){solapeT++;detalle.push('solape temporal '+c.id+' '+ps[i-1].start+'..'+ps[i-1].end+' y '+p.start+'..'+p.end)}
  // dos anillos de la MISMA entidad que se pisan se anulan por paridad
  const n=p.rings.length;const B=p.rings.map(L.bb);
  for(let a=0;a<n;a++){
   if(p.rings[a].length<4){mal++;continue}
   ani++;
   if(!pc)continue;
   for(let b=a+1;b<n;b++){
    if(!L.cruza(B[a],B[b]))continue;
    let r;try{r=pc.intersection([p.rings[a]],[p.rings[b]])}catch(e){continue}
    if(!r||!r.length)continue;
    let ar=0;for(const poly of r)ar+=L.rA(poly[0]);
    if(ar>2e-4){solapeI++;detalle.push('solape interno '+c.id+' '+p.start+' area '+ar.toFixed(3))}
   }}
 }}
for(const d of detalle.slice(0,30))console.log('  '+d);
if(detalle.length>30)console.log('  ... y '+(detalle.length-30)+' mas');
if(!pc)console.log('(sin polygon-clipping: no se han comprobado los solapes internos)');
console.log('civs '+CIV.length+' periodos '+per+' anillos '+ani+
 ' | malformados '+mal+' vacios '+vacio+' solapes temporales '+solapeT+
 ' desordenados '+desord+' solapes internos '+solapeI);
process.exit(mal+vacio+solapeT+desord+solapeI?1:0);
