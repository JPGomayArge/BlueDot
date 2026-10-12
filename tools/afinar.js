#!/usr/bin/env node
// QUITA DENSIDAD A LOS ANILLOS QUE SE CRUZAN CONSIGO MISMOS, en vez de podarles
// el vertice ofensor.
//
// Es el complemento de `arregla_auto.js`, no su recambio, y resuelve otra
// familia de fallo. `arregla_auto` sirve cuando el cruce es un vertice suelto
// mal colocado: lo quita y ya. Pero cuando el anillo viene de la mascara de
// costa -una isla adoptada, la interseccion de un cuadrado con el litoral, la
// fusion de dos anillos costeros- el cruce no lo hace UN vertice: lo hace que
// **el contorno original es mas fino que la rejilla de 0,01 grados en la que el
// mapa guarda los vertices.** En un fiordo o en un delta, tres vertices
// consecutivos caen en la misma celda al redondear y el contorno se pliega.
// Podar de uno en uno no acaba nunca; ralear si.
//
// Y hay una razon para no usar `arregla_auto` en estos anillos: cuando no logra
// reparar uno de menos de 0,5 grados cuadrados, LO BORRA por astilla. Aplicado
// a un mapa al que se le acaban de anadir cientos de islas pequenas se las
// comeria. Es la leccion de la ronda 59 -*una isla no es una astilla*- y aqui
// vuelve a aplicar.
//
// Se conserva el area: si ralear se lleva mas del 15% del anillo, se deja como
// estaba y se informa.
//   JSX=<mapa> node afinar.js
const pc=require('polygon-clipping');
const L=require('./lib.js'); const R=require('./recorte.js');
const {malo}=require('./auto_int_lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
function ralo(r,min){ const o=[r[0]];
 for(let i=1;i<r.length;i++){ const p=r[i],q=o[o.length-1];
  if(Math.hypot(p[0]-q[0],p[1]-q[1])>=min)o.push(p) }
 if(o.length>=4&&Math.hypot(o[0][0]-o[o.length-1][0],o[0][1]-o[o.length-1][1])<min)o.pop();
 return o;
}
let ok=0,no=0;
for(const c of CIV)for(const p of c.periods){
 for(let i=0;i<p.rings.length;i++){
  if(!malo(p.rings[i]))continue;
  const a0=Math.abs(L.rA(p.rings[i])); let hecho=false;
  // PRIMERO, NORMALIZAR. Un anillo grande cruzado -el contorno de `usa` de 66
  // grados cuadrados, el de Islandia- no se puede ralear sin perderle la forma:
  // el 15% de guarda salta antes de que el cruce desaparezca. Pero un cruce en
  // un anillo grande casi siempre es un lazo diminuto en una costa quebrada, y
  // unir el anillo CONSIGO MISMO lo deshace sin tocar el resto: el recortador
  // reescribe el contorno resolviendo el cruce y, si el lazo encerraba area
  // aparte, devuelve dos anillos en vez de uno, que es la respuesta correcta.
  try{ const u=R.limpia(pc.union([[p.rings[i].concat([p.rings[i][0]])]],
                                 [[p.rings[i].concat([p.rings[i][0]])]]),3e-4);
   if(u&&u.length&&!u.some(malo)){
    const a1=u.reduce((s,x)=>s+Math.abs(L.rA(x)),0);
    if(a1>=a0*0.97){ p.rings.splice(i,1,...u); i+=u.length-1; ok++; continue }
   } }catch(e){}
  for(const m of [0.012,0.02,0.03,0.05,0.08,0.12]){
   const q=R.R2(ralo(p.rings[i],m)); const d=[];
   for(const x of q){const l=d[d.length-1]; if(!l||l[0]!==x[0]||l[1]!==x[1])d.push(x)}
   if(d.length<4||malo(d))continue;
   if(Math.abs(L.rA(d))<a0*0.85)continue;
   p.rings[i]=L.rA(d)<0?d.reverse():d; ok++; hecho=true; break;
  }
  if(!hecho){ no++; console.log('  sin afinar: '+c.id+' '+p.start+' area '+a0.toFixed(3)) }
 }
}
console.log('anillos afinados '+ok+' | irreducibles '+no);
L.save(src,BLK,CIV,process.env.JSX);
