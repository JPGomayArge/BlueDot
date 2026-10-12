#!/usr/bin/env node
// Copia anillos de un periodo de una entidad a otro periodo de la MISMA
// entidad. Se escribio en la ronda 18 para reparar un efecto de sustituye.js:
// esa herramienta REEMPLAZA todos los anillos de los periodos que caen en el
// rango, asi que al redibujar un anillo defectuoso de un periodo que tenia dos
// -el nucleo nubio de `kush` y el corredor del Nilo- el otro desaparece.
//
//   module.exports = [ { id, de:[ini,fin], a:[ini,fin], anillos:[i,...]|null } ]
//
// `de` identifica el periodo de origen por un anio contenido en el; `a`, el de
// destino. `anillos` selecciona por indice; null copia todos. Los anillos se
// AGREGAN a los que el destino ya tenga, no lo sustituyen.
//
// No talla contra nadie: si el anillo copiado pisa a un vecino hay que pasar
// resta_civ despues. Cuando el origen y el destino son fases contiguas de la
// misma entidad, que es el caso para el que se escribio, no pisa a nadie nuevo.
const L=require('./lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const OPS=require(process.argv[2]);
let n=0;
for(const op of OPS){
 const c=CIV.find(x=>x.id===op.id);
 if(!c){console.log('?? no existe',op.id);continue}
 const halla=([i,f])=>c.periods.find(p=>p.start<=i&&p.end>=f)
                   || c.periods.find(p=>p.start<f&&p.end>i);
 const O=halla(op.de), D=halla(op.a);
 if(!O){console.log('?? sin periodo de origen',op.id,op.de.join('..'));continue}
 if(!D){console.log('?? sin periodo de destino',op.id,op.a.join('..'));continue}
 const sel = op.anillos ? op.anillos.map(i=>O.rings[i]).filter(Boolean) : O.rings;
 const antes = D.rings.reduce((s,r)=>s+L.rA(r),0);
 for(const r of sel) D.rings.push(r.map(q=>q.slice()));
 const desp = D.rings.reduce((s,r)=>s+L.rA(r),0);
 n+=sel.length;
 console.log(op.id.padEnd(20),O.start+'..'+O.end,'->',D.start+'..'+D.end,
             '| anillos copiados',sel.length,'| area',antes.toFixed(2),'->',desp.toFixed(2));
}
console.log('anillos copiados en total:',n);
L.save(src,BLK,CIV,process.env.JSX);
