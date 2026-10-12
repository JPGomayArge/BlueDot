#!/usr/bin/env node
// SUSTITUIR UNA CAJA DIBUJADA A MANO POR LA REGION REAL, EN TODOS LOS PERIODOS.
//
// Que problema resuelve, y por que no lo resolvian las tres herramientas que ya
// habia:
//
//   `sustituye.js`     reemplaza TODOS los anillos de un periodo. Catastrofico
//                      en una entidad de varios anillos: asi se borro
//                      Asturias-Leon en la ronda 50.
//   `redibuja_anillo`  reemplaza UN anillo por su caja, pero uno a uno y sin
//                      tallar. `ge_cerrado` tiene 152 anillos en 31 periodos.
//   `mascara.js`       interseca con un contorno natural. Solo puede QUITAR, y
//                      por eso solo arregla siluetas que se pasan de la region.
//                      **Contra un rectangulo que esta DENTRO de su region no
//                      hace nada**, y ese es justo el caso del Pantanal: cinco
//                      vertices en mitad de un humedal que es mucho mayor.
//
// Esta hace lo que falta: se le da la region real dibujada a mano UNA vez, y en
// cada periodo donde la entidad tiene anillos dentro de la caja los quita y
// pone la region, recortada a tierra y **restandole todas las demas entidades
// vivas en cualquier anio de ese periodo**. Esa resta es la misma de
// `orilla.js` y hace lo mismo: la forma nueva solo puede ocupar suelo que no es
// de nadie, asi que no puede crear doble pintado ni deshacer un tallado.
//
// EL EFECTO SECUNDARIO QUE HAY QUE ENTENDER ANTES DE CORRERLA. Como la region
// real suele ser mayor que la caja, en los periodos tardios el sustrato CRECE
// hasta donde el estado no llega. Eso no es un regalo: es la consecuencia de la
// regla del sustrato. En 1897 los pueblos del alto Xingu ocupaban la cuenca y
// Brasil no tenia alli administracion; si Brasil hubiera tenido suelo, la resta
// se lo dejaria. Lo que crece es exactamente lo que no era de nadie.
//
// LA CAJA SELECCIONA, LA FORMA SUSTITUYE, Y NO SON LA MISMA COSA. La caja es
// solo un criterio para reconocer el anillo malo -estable entre periodos, al
// contrario que el indice-. Si en un periodo no selecciona nada, ese periodo no
// se toca y se informa. Un periodo sin avisar es un periodo que se ha quedado
// en caja.
//
//   module.exports = [ { id, caja:[lonMin,lonMax,latMin,latMax],
//                        poly:[[lon,lat],...], ini?, fin?, motivo } ]
//   JSX=<mapa> node remodela.js <fichero> [--aplica]   SALIDA=<ruta>
const pc=require('polygon-clipping');
const L=require('./lib.js'); const R=require('./recorte.js');
const {malo}=require('./auto_int_lib.js');
const doc=L.load(process.env.JSX); const CIV=doc.CIV;
const OPS=require(require('path').resolve(process.argv[2]));
const APLICA=process.argv.includes('--aplica');

for(const op of OPS){
 const c=CIV.find(x=>x.id===op.id);
 if(!c){console.log('?? no existe '+op.id);continue}
 const [x0,x1,y0,y1]=op.caja;
 const forma=[op.poly.concat([op.poly[0]])];
 let tocados=0,vacios=0,gan=0,per=0;
 for(const p of c.periods){
  if(op.ini!=null&&p.end<=op.ini)continue;
  if(op.fin!=null&&p.start>=op.fin)continue;
  // `minArea` filtra por tamano ademas de por caja, y no es un detalle.
  // `caribes_guayanas` tiene, dentro de la caja del bloque continental, una
  // veintena de anillos costeros diminutos. Sin el filtro los quitaba todos y
  // ponia la region entera en su lugar: **86 -> 183 grados cuadrados**, o sea
  // que "arreglar una forma" duplicaba la entidad. La caja dice DONDE mirar;
  // el tamano dice CUAL es el anillo que se dibujo con la herramienta de cajas.
  const dentro=[],resto=[];
  for(const r of p.rings){ const b=L.bb(r);
   const cabe = b[0]>=x0&&b[1]<=x1&&b[2]>=y0&&b[3]<=y1;
   (cabe && (!op.minArea || Math.abs(L.rA(r))>=op.minArea) ? dentro : resto).push(r) }
  if(!dentro.length){vacios++;continue}
  const areaVieja=dentro.reduce((s,r)=>s+Math.abs(L.rA(r)),0);
  // region real recortada a tierra
  let nueva=R.aTierra(op.poly);
  if(!nueva.length){console.log('?? '+op.id+' '+p.start+': la region no cae en tierra');continue}
  // menos todo lo demas vivo en cualquier anio del periodo, incluidos los
  // anillos de la propia entidad que NO se sustituyen -si no, se solaparia
  // consigo misma-
  const bbN=L.bb(nueva.flat());
  // Los anillos PROPIOS que no se sustituyen se restan siempre, tambien con
  // `nocarve`: una entidad no puede solaparse consigo misma en ningun caso, y
  // `nocarve` es un permiso para desplazar a un vecino, no para romperse.
  const otros=resto.map(r=>[r.concat([r[0]])]);
  if(!op.nocarve) for(const o of CIV){
   if(o.id===c.id)continue;
   for(const q of o.periods){
    if(q.end<=p.start||q.start>=p.end)continue;
    for(const r of q.rings){ const b=L.bb(r);
     if(bbN[1]<b[0]||bbN[0]>b[1]||bbN[3]<b[2]||bbN[2]>b[3])continue;
     otros.push([r.concat([r[0]])]) } } }
  let res=nueva.map(r=>[r.concat([r[0]])]);
  // `nocarve` deja la forma entera y NO resta a los vecinos. Hace falta cuando
  // el hueco que ocupa el sustrato lo dibujo el propio vecino: en 1897 el
  // agujero de `brazilian_empire` sobre el alto Xingu es un rectangulo, asi que
  // por mucho que el sustrato pase a ser una cuenca, restarle Brasil se la
  // volveria a recortar en rectangulo. **Las dos formas son la misma frontera y
  // hay que rehacer las dos.** Se corre `remodela` con nocarve y despues
  // `resta_civ [vecino, sustrato]`, que es el orden de tres pasos de siempre:
  // crear sin tallar, quitar al desplazado, y solo entonces tallar.
  if(otros.length){
   // UN FALLO DE RESTA NO PUEDE PASAR POR EXITO. Si revienta se deja el
   // periodo como estaba: una caja sin arreglar no hace dano, una forma sin
   // restar pisa a los vecinos. Es la regla de la ronda 45.
   let d=null; try{ d=pc.difference(res,otros) }catch(e){ d=null }
   if(!d){ console.log('?? '+op.id+' '+p.start+'..'+p.end+': resta fallida, periodo intacto'); continue }
   res=d.map(poly=>poly);
  }
  const fin=R.limpia(Array.isArray(res[0])&&Array.isArray(res[0][0])&&Array.isArray(res[0][0][0])?res:res,3e-4)
             .filter(r=>!malo(r));
  if(!fin.length){ console.log('?? '+op.id+' '+p.start+'..'+p.end+': no queda nada tras la resta'); continue }
  const areaNueva=fin.reduce((s,r)=>s+Math.abs(L.rA(r)),0);
  gan+=areaNueva-areaVieja; per+=areaVieja; tocados++;
  if(APLICA)p.rings=resto.concat(fin);
 }
 console.log(op.id.padEnd(24)+' periodos tocados '+String(tocados).padStart(3)+
  ' | sin anillo en la caja '+String(vacios).padStart(3)+
  ' | area '+per.toFixed(0)+' -> '+(per+gan).toFixed(0)+' ('+(gan>=0?'+':'')+gan.toFixed(0)+')');
}
if(APLICA){ const s=process.env.SALIDA||process.env.JSX;
 L.save(doc.src,doc.R,doc.CIV,s); console.log('aplicado -> '+s); }
else console.log('(informe. --aplica para escribir)');
