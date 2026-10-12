#!/usr/bin/env node
// Sustituye UN anillo concreto de unos periodos, dejando los demas intactos.
//
// Por que hacia falta. `sustituye.js` reemplaza TODOS los anillos de los
// periodos que caen en el rango. Sirve cuando el periodo tiene un solo anillo,
// pero en la ronda 18, al redibujar el corredor del Nilo de `kush`, borro de
// paso el nucleo nubio, que era el otro anillo de esa misma fase; hubo que
// escribir `copia_anillo.js` para devolverlo. Y su cuarto argumento escribe en
// p.name, que ya destruyo rotulos historicos dos veces.
//
// Esta herramienta hace lo minimo: cambia el anillo que se le diga y no toca
// nada mas -ni los otros anillos, ni el rotulo, ni los periodos vecinos-.
//
//   module.exports = [ { id, ini, fin, caja:[lonMin,lonMax,latMin,latMax],
//                        poly:[[lon,lat],...], motivo } ]
//
// El anillo a sustituir se identifica por su CAJA, no por su indice: los
// indices bailan en cuanto otra operacion toca la entidad, y una caja es
// estable y legible. Se sustituye el anillo cuya caja este contenida en la
// dada. Si en un periodo hay varios candidatos, avisa y no toca ese periodo:
// mas vale no hacer nada que redibujar el equivocado.
//
// El poligono se recorta a la costa. No se talla contra nadie: si el anillo
// nuevo es mayor que el viejo hay que pasar resta_civ despues.
const L=require('./lib.js');const R=require('./recorte.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const OPS=require(require('path').resolve(process.argv[2]));
let hechos=0,ambiguos=0,sinCandidato=0;
for(const op of OPS){
 const c=CIV.find(x=>x.id===op.id);
 if(!c){console.log('?? no existe',op.id);continue}
 const [x0,x1,y0,y1]=op.caja;
 const nuevos=R.aTierra(op.poly);
 if(!nuevos.length){console.log('!! el poligono no deja nada tras recortar a la costa:',op.id);continue}
 for(const p of c.periods){
  if(p.start<op.ini||p.end>op.fin)continue;
  const cand=[];
  p.rings.forEach((r,i)=>{const b=L.bb(r);
   if(b[0]>=x0&&b[1]<=x1&&b[2]>=y0&&b[3]<=y1)cand.push(i)});
  if(cand.length===0){sinCandidato++;continue}
  if(cand.length>1){ambiguos++;
   console.log('!!',op.id,p.start+'..'+p.end,'hay',cand.length,'anillos dentro de la caja: no se toca');continue}
  const antes=L.rA(p.rings[cand[0]]);
  p.rings.splice(cand[0],1,...nuevos.map(r=>r.map(q=>q.slice())));
  const desp=nuevos.reduce((s,r)=>s+L.rA(r),0);
  hechos++;
  console.log(op.id.padEnd(18),(p.start+'..'+p.end).padEnd(14),
              'area',antes.toFixed(2),'->',desp.toFixed(2),' ',op.motivo||'');
 }
}
console.log('anillos redibujados:',hechos,'| ambiguos no tocados:',ambiguos,'| periodos sin candidato:',sinCandidato);
L.save(src,BLK,CIV,process.env.JSX);
