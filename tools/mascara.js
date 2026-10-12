#!/usr/bin/env node
// DARLE FORMA REAL A UN AREA CULTURAL SIN PERDER SU HISTORIA.
//
// El problema, tal cual se ve en el globo: en Sudamerica los sustratos
// indigenas estan dibujados como RECTANGULOS. Cuando un estado les talla el
// centro, lo que queda es un rectangulo con un mordisco rectangular, o sea
// **una H**. `alto_xingu` tiene el 90% de su perimetro alineado a los ejes;
// `pantanal_chiquitania` son literalmente cinco vertices.
//
// POR QUE NO VALE REDIBUJAR PERIODO A PERIODO. `redibuja_anillo` sustituye un
// anillo identificado por su caja, y aqui eso no llega: `ge_cerrado` tiene 31
// periodos y 152 anillos, y su contorno cambia en cada uno porque Portugal y
// luego Brasil se lo van comiendo. Sustituir a mano 152 anillos es inviable, y
// sustituir solo el mayor deja los otros 151 en caja. Pero sobre todo seria
// **tirar el trabajo de tallado de toda la campana**: cada uno de esos anillos
// es el resultado de decenas de restas correctas.
//
// LA OPERACION QUE SI SIRVE. Se define UN contorno natural por entidad -la
// cuenca, el escudo, el humedal, dibujado a mano una sola vez- y se INTERSECA
// con el contra todos sus anillos, en todos sus periodos.
//
//   anillo_nuevo = anillo_viejo  ∩  mascara
//
// Tres propiedades, y las tres importan:
//
//   1. **Solo puede quitar.** Una interseccion nunca agranda. Asi que esta
//      herramienta no puede crear doble pintado con nadie, ni inventar
//      territorio, ni desplazar una frontera hacia afuera. Es la unica clase
//      de operacion masiva que se puede correr sobre 150 anillos sin auditar
//      uno por uno.
//   2. **Respeta el tallado.** Los bordes interiores -los que un estado le
//      tallo al sustrato- caen dentro de la mascara y salen intactos. Lo unico
//      que cambia es la SILUETA EXTERIOR, que es justo lo que estaba mal.
//   3. **La mascara se dibuja generosa.** Donde el rectangulo ya cae dentro de
//      la cuenca no pasa nada; el corte ocurre solo en las esquinas, que es
//      donde el rectangulo afirmaba territorio que el rio no explica.
//
// LO QUE CUESTA, Y HAY QUE DECIRLO. Recortar esquinas quita area, y el area
// que se quita no la recoge nadie: se convierte en hueco de cobertura. Es un
// intercambio deliberado -forma real a cambio de algo de cobertura- y por eso
// la herramienta informa de los grados cuadrados perdidos por entidad en vez
// de esconderlos. La alternativa era dejar cajas, y una caja es cobertura
// falsa: dice que alguien vivia en una esquina porque la esquina era comoda
// de dibujar.
//
//   module.exports = { <id>: { poly:[[lon,lat],...], motivo:'...' } }
//   JSX=<mapa> node mascara.js <fichero> [--aplica]
const pc=require('polygon-clipping');
const L=require('./lib.js'); const R=require('./recorte.js');
const {malo}=require('./auto_int_lib.js');
const doc=L.load(process.env.JSX); const CIV=doc.CIV;
const M=require(require('path').resolve(process.argv[2]));
const APLICA=process.argv.includes('--aplica');

console.log('entidad                      anillos  antes    despues  pierde   %');
let totalAntes=0,totalDespues=0;
for(const [id,spec] of Object.entries(M)){
 const c=CIV.find(x=>x.id===id);
 if(!c){console.log('?? no existe '+id);continue}
 const mp=[[spec.poly.concat([spec.poly[0]])]];
 // La mascara tiene que CONTENER la extension historica de la entidad; si no,
 // no se esta redibujando una silueta sino amputando. Se comprueba y se avisa.
 const bbM=L.bb(spec.poly);
 let a0=0,a1=0,nAnt=0,nDes=0,fallos=0,fuera=0,areaFuera=0;
 for(const p of c.periods){
  const out=[];
  for(const r of p.rings){
   const av=Math.abs(L.rA(r)); a0+=av; nAnt++;
   const b=L.bb(r);
   // UN ANILLO FUERA DE LA MASCARA SE DEJA COMO ESTA, NO SE TIRA.
   //
   // La primera version lo descartaba, y con `caribes_guayanas` -que ademas de
   // las Guayanas tiene las Antillas Menores, a 15 grados norte y 46 oeste-
   // eso **borro 105 anillos de islas** de golpe. Una mascara describe una
   // region fisica: la cuenca, el escudo, el humedal. No es una frontera
   // exterior de la entidad y no autoriza a decidir sobre lo que no cubre.
   // Asi que la mascara solo da forma a lo que toca, y lo demas lo deja.
   if(b[1]<bbM[0]||b[0]>bbM[1]||b[3]<bbM[2]||b[2]>bbM[3]){
    out.push(r); a1+=av; nDes++; fuera++; areaFuera+=av; continue }
   let q=null; try{ q=pc.intersection([[r.concat([r[0]])]],mp) }catch(e){ q=null }
   // UN FALLO DE CALCULO NO PUEDE CONVERTIRSE EN UN RESULTADO. Si la
   // interseccion revienta se conserva el anillo VIEJO, que es lo conservador:
   // queda una caja sin arreglar, no un agujero. Lo contrario -tirarlo- seria
   // borrar territorio por un error de la libreria.
   if(!q){ out.push(r); a1+=av; nDes++; fallos++; continue }
   for(const x of R.limpia(q,3e-4)){ if(malo(x))continue; out.push(x); a1+=Math.abs(L.rA(x)); nDes++ }
  }
  if(APLICA)p.rings=out;
 }
 totalAntes+=a0; totalDespues+=a1;
 console.log(id.padEnd(26)+String(nAnt).padStart(5)+'->'+String(nDes).padEnd(5)+
  a0.toFixed(0).padStart(7)+a1.toFixed(0).padStart(9)+(a0-a1).toFixed(0).padStart(8)+
  (100*(a0-a1)/(a0||1)).toFixed(1).padStart(6)+'%'+
  (fuera?'   ('+fuera+' anillos fuera de la mascara, intactos: '+areaFuera.toFixed(0)+' deg2)':'')+
  (fallos?'   ('+fallos+' sin tocar por fallo)':''));
}
console.log('\ntotal: '+totalAntes.toFixed(0)+' -> '+totalDespues.toFixed(0)+
 ' grados cuadrados ('+(totalAntes-totalDespues).toFixed(0)+' perdidos)');
if(APLICA){ const s=process.env.SALIDA||process.env.JSX;
 L.save(doc.src,doc.R,doc.CIV,s); console.log('aplicado -> '+s); }
else console.log('(informe. --aplica para escribir)');
