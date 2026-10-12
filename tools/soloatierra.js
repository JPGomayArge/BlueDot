#!/usr/bin/env node
// RECORTAR A TIERRA LO QUE NUNCA SE RECORTO.
//
// `enelmar.js` encontro 256 anillos de mas de un grado cuadrado con mas de la
// mitad en agua, y en 1500 el 2,7% de todo lo que el mapa pinta es oceano
// abierto. La cabecera de `fidelidad.js` decia que eso era imposible "por
// construccion" porque todo pasa por `recorte.aTierra`. No todo paso.
//
// Esto lo pasa. Para cada anillo calcula `anillo ∩ tierra` y lo sustituye.
//
// PERO NO TODO ANILLO CON AGUA ES EL MISMO PROBLEMA, y medirlo lo dejo claro
// enseguida. Hay dos familias y solo una se arregla recortando:
//
//   DERRAME COSTERO   un contorno generoso que se sale al mar por los bordes.
//                     `inuit` pasa de 831 a 734 grados cuadrados al recortar:
//                     conserva el 88%. `samoyedos` el 92%. Aqui recortar es
//                     obviamente correcto y no se pierde nada real.
//
//   CAJA DE ARCHIPIELAGO  un rectangulo sobre mar abierto que representa un
//                     archipielago cuyas islas son mas pequenas que la
//                     resolucion de la mascara. `marshall_iroij` pasa de 116,3
//                     grados cuadrados **a 0,02**. `kiribati_tungaru` de 50,7 a
//                     0,02. `pacifico_nz` de 157,9 a 0,02.
//
// La segunda no es un defecto de dibujo: es un conflicto entre decir la verdad
// y ser visible. La caja miente -afirma que el mar es territorio- y es a la vez
// la unica razon por la que Micronesia y la Polinesia se ven en el globo. A
// 1:50 millones los atolones practicamente no existen: Tarawa mide tres
// diezmilesimas de grado cuadrado.
//
// Asi que esta herramienta hace solo lo que es indiscutible. Recorta cuando el
// recorte conserva mas del `UMBRAL` del area -por defecto el 40%- y **deja
// quieto lo demas, con nombre y apellidos**, porque convertir un archipielago
// en cero es una decision sobre que es este mapa y no le toca a una herramienta
// tomarla en silencio.
//
//   JSX=<mapa> node soloatierra.js [--aplica]   UMBRAL=0.4   SALIDA=<ruta>
const L=require('./lib.js'); const R=require('./recorte.js');
const T=require('./tierra.js');
const pc=require('polygon-clipping');
const {malo}=require('./auto_int_lib.js');
const doc=L.load(process.env.JSX); const CIV=doc.CIV;
const APLICA=process.argv.includes('--aplica');
const UMBRAL=+(process.env.UMBRAL||0.4);
const MINABS=+(process.env.MINABS||0.02);   // grados2 que deben quedar tras recortar
const BORRAVACIO=!!process.env.BORRAVACIO;
const vacios=[], salvados=[];
// ACOTAR A QUIEN YA SABEMOS QUE PINTA MAR. Barrer los 144.000 anillos del mapa
// se paso de cuarenta minutos sin terminar, porque `aTierra` interseca contra la
// mascara entera y la practica totalidad de esos anillos ya estan en tierra y no
// tienen nada que recortar. `enelmar.js` ya dice quien es culpable: se le pasa
// esa lista y la pasada baja a minutos. No cambia el resultado -un anillo que
// `enelmar` no marco no tiene mar que quitarle- y cambia mucho el poder iterar.
const IDS=process.env.IDS?new Set(process.env.IDS.split(',')):null;

const irreparables=[];
// UN ANILLO CRUZADO NO ES UN ANILLO VACIO, Y TIRARLO ES BORRAR TIERRA.
//
// Tercer informe seguido de esta herramienta equivocado, y las tres veces por
// lo mismo: un modo de fallo contado como si fuera un hallazgo. Aqui habia un
// `q.filter(x=>!malo(x))`, y en el Artico **eso descartaba el 100% del
// recorte**. Medido sobre tres anillos de `chukchi_koryak`: el recorte devolvia
// 75,73, 21,85 y 12,40 grados cuadrados de tierra perfectamente real, y todas
// las piezas tenian auto-interseccion, asi que el filtro las tiraba y la
// herramienta informaba de que esos anillos "se quedarian en 0,00". De ahi
// salio el 5.290 -> 15,96 que no me cuadraba.
//
// El cruce no es un defecto del mapa: es que el litoral artico es el mas
// quebrado del planeta y al redondear a la rejilla de 0,01 grados dos vertices
// del mismo fiordo caen en la misma celda. Es exactamente lo que `afinar.js`
// resuelve raleando antes de redondear, y lo que `orilla.js` ya hace desde la
// ronda de la costa. Se repara; solo se descarta lo que no admite reparacion,
// y eso se cuenta aparte en vez de mezclarse con el resultado.
function repara(piezas){
 const out=[];
 for(const x of piezas){
  if(!malo(x)){ out.push(x); continue }
  let arreglada=null;
  // normalizar uniendo el anillo consigo mismo deshace el lazo sin tocar el resto
  try{ const u=R.limpia(pc.union([[x.concat([x[0]])]],[[x.concat([x[0]])]]),3e-4);
   if(u&&u.length&&!u.some(malo)&&
      u.reduce((s,y)=>s+Math.abs(L.rA(y)),0)>=Math.abs(L.rA(x))*0.9) arreglada=u }catch(e){}
  if(!arreglada){
   for(const m of [0.012,0.02,0.03,0.05,0.08]){
    const o=[x[0]];
    for(let i=1;i<x.length;i++){ const p=x[i],q2=o[o.length-1];
     if(Math.hypot(p[0]-q2[0],p[1]-q2[1])>=m)o.push(p) }
    if(o.length<4)continue;
    const d=R.R2(o), z=[];
    for(const p of d){ const l=z[z.length-1]; if(!l||l[0]!==p[0]||l[1]!==p[1])z.push(p) }
    if(z.length>=4&&!malo(z)&&Math.abs(L.rA(z))>=Math.abs(L.rA(x))*0.85){ arreglada=[z]; break }
   }
  }
  if(arreglada)out.push(...arreglada); else irreparables.push(Math.abs(L.rA(x)));
 }
 return out;
}

const recortados=[], retenidos=[], fallos=[];
let nAnt=0,nDes=0,aAnt=0,aDes=0;
for(const c of CIV){ if(IDS&&!IDS.has(c.id))continue;
 for(const p of c.periods){
 const out=[]; let cambio=false;
 for(const r of p.rings){
  const a0=Math.abs(L.rA(r));
  nAnt++; aAnt+=a0;
  // CRIBA BARATA ANTES DE LA CARA. `enTierra` sobre unos pocos puntos cuesta
  // microsegundos; la interseccion cuesta decimas de segundo. Si ningun punto
  // de muestra del anillo cae en agua, no hay nada que recortar.
  //
  // La criba solo puede equivocarse por defecto -una laguna de mar pequena
  // entre dos puntos de muestra pasa desapercibida- y nunca al reves. Un falso
  // negativo deja un defecto sin arreglar, que es lo que ya habia; un falso
  // positivo habria borrado territorio.
  let hayAgua=false;
  { const b=L.bb(r); const paso=Math.max(0.05,Math.sqrt(Math.max(a0,1e-4))/6); let n=0;
    for(let x=b[0];x<=b[1]&&!hayAgua;x+=paso)for(let y=b[2];y<=b[3];y+=paso){
     const pt=[x,y]; if(!L.pip(pt,r))continue; n++;
     if(!T.enTierra(pt)){hayAgua=true;break}
     if(n>300)break; }
    if(!hayAgua&&n===0)hayAgua=true;   // anillo diminuto sin muestras: se mira
  }
  if(!hayAgua){ out.push(r); nDes++; aDes+=a0; continue }
  let q=null; try{ q=R.aTierra(r) }catch(e){ q=null }
  if(q&&!q.length&&a0>3){
   // un anillo de mas de tres grados cuadrados que "no toca tierra" es casi
   // siempre un fallo silencioso del recortador, no un poligono oceanico: se
   // reintenta troceandolo en bandas de longitud, que es lo que `aTierra` no
   // aguanta de una pieza.
   const b=L.bb(r); const trozos=[];
   for(let x=Math.floor(b[0]);x<b[1];x+=5){
    const caja=[[[x,b[2]-0.1],[Math.min(x+5,b[1]+0.1),b[2]-0.1],
                 [Math.min(x+5,b[1]+0.1),b[3]+0.1],[x,b[3]+0.1],[x,b[2]-0.1]]];
    let t=null; try{ t=pc.intersection([[r.concat([r[0]])]],[caja]) }catch(e){ t=null }
    if(!t)continue;
    for(const poly of t){ let u=null; try{ u=R.aTierra(poly[0]) }catch(e){ u=null }
     if(u&&u.length)trozos.push(...u) }
   }
   if(trozos.length)q=trozos;
  }
  // UN FALLO DE RECORTE NO PUEDE BORRAR UN ANILLO. Si `aTierra` revienta o
  // devuelve vacio no se sabe si el anillo estaba en el mar o si fallo el
  // calculo, y las dos cosas se distinguen: vacio con area previa grande es
  // sospechoso y se informa, no se tira.
  // TRES DESENLACES, NO DOS, Y CONFUNDIRLOS FALSEA EL INFORME.
  //
  // La primera version metia en el mismo saco "el recorte lo deja en casi nada"
  // y "el recorte fallo", y el informe salia diciendo que `chukchi_koryak`
  // -5.290 grados cuadrados de Siberia continental- se quedaria en 16. No era
  // verdad: `aTierra` revienta con anillos muy grandes y devolvia vacio, y yo
  // estaba contando cada excepcion como si fuera un hallazgo sobre el mapa.
  //
  // Es otra vez lo mismo, en otra herramienta: **un fallo de calculo no puede
  // convertirse en un resultado.** Se separan y se cuentan aparte.
  if(!q){ out.push(r); nDes++; aDes+=a0; fallos.push({id:c.id,start:p.start,a0}); continue }
  if(!q.length){
   // UN ANILLO QUE NO CONTIENE NI UN METRO DE TIERRA NO ES TERRITORIO. Con
   // `BORRAVACIO` se quita en vez de conservarse: son los anillos sobre
   // banquisa y mar abierto -el mar Blanco de `sami_fineses`, la banquisa de
   // `artico_canadiense`- donde no hay isla ninguna que pintar. El hielo marino
   // no es suelo.
   //
   // Con una excepcion que hay que respetar: **nunca se deja un periodo sin
   // anillos**. Un periodo vacio no es una afirmacion de que no habia nadie,
   // es un fallo de estructura, y ademas puede borrar una entidad entera del
   // mapa sin que nadie lo pida. Si el anillo es el ultimo que le queda al
   // periodo, se conserva y se informa.
   if(BORRAVACIO&&a0<9e9){ vacios.push({id:c.id,start:p.start,a0}); cambio=true; continue }
   out.push(r); nDes++; aDes+=a0;
   if(a0>=0.5)retenidos.push({id:c.id,start:p.start,a0,a1:0,por:0,caja:L.bb(r).map(v=>v.toFixed(1)).join(",")});
   continue }
  const lim=repara(q);
  const a1=lim.reduce((s,x)=>s+Math.abs(L.rA(x)),0);
  const por=a0>0?a1/a0:1;
  if(por>=1-1e-9){ out.push(r); nDes++; aDes+=a0; continue }   // ya estaba en tierra
  // EL CRITERIO NO ES QUE FRACCION SOBREVIVE, ES SI QUEDA ALGO REAL.
  //
  // Con un umbral de fraccion, `inuit` se quedaba 1.147 grados cuadrados de
  // banquisa del mar de Baffin sin tocar, porque su recorte "solo" conservaba
  // el 6%. Pero ese 6% son 63,77 grados cuadrados de islas de verdad, que estan
  // en la mascara y se pueden pintar. Que la entidad estuviera dibujada muy
  // generosa no es razon para dejarle el oceano.
  //
  // El caso que el umbral queria proteger es otro y es una sola cosa: el
  // archipielago cuyas islas **no existen en la mascara a 1:50 millones**.
  // Marshall se queda en 0,07 grados cuadrados, Kiribati en 0,05, el
  // fideicomiso del Pacifico en 0,02: eso no es una isla pequena, es nada.
  //
  // Asi que el corte es absoluto y no relativo. Si tras recortar queda mas de
  // `MINABS`, se recorta -haya sobrevivido el 90% o el 6%-. Si queda menos, se
  // deja quieto y se informa, porque ahi la eleccion es entre mentir y
  // desaparecer, y esa no la toma una herramienta.
  if(a1<MINABS){
   out.push(r); nDes++; aDes+=a0;
   if(a0>=0.5)retenidos.push({id:c.id,start:p.start,a0,a1,por,caja:L.bb(r).map(v=>v.toFixed(1)).join(",")});
   continue;
  }
  out.push(...lim); nDes+=lim.length; aDes+=a1; cambio=true;
  if(a0-a1>=0.5)recortados.push({id:c.id,start:p.start,a0,a1,por});
 }
 // LA GUARDA: si el recorte deja el periodo sin un solo anillo, se deshace.
 if(cambio&&!out.length){
  salvados.push({id:c.id,start:p.start,end:p.end});
  cambio=false;
 }
 if(cambio&&APLICA)p.rings=out;
}}
const junta=arr=>{ const m={};
 for(const x of arr){ const k=x.id; m[k]=m[k]||{n:0,q:0,a:0}; m[k].n++; m[k].q+=x.a0-x.a1; m[k].a+=x.a0 }
 return Object.entries(m).sort((a,b)=>b[1].q-a[1].q) };

console.log('RECORTADO (el recorte conserva mas del '+(100*UMBRAL).toFixed(0)+'% del area: derrame costero)');
console.log('entidad                   anillos   agua retirada');
for(const [k,v] of junta(recortados).slice(0,25))
 console.log('   '+k.padEnd(24)+String(v.n).padStart(6)+v.q.toFixed(0).padStart(14)+' grados2');
console.log('   total: '+recortados.length+' anillos, '+
 junta(recortados).reduce((s,x)=>s+x[1].q,0).toFixed(0)+' grados cuadrados de mar retirados');

console.log('\nRETENIDO (tras recortar quedarian menos de '+MINABS+' grados2: islas que no existen en la mascara)');
console.log('entidad                   anillos   area ahora   quedaria en   decision pendiente');
for(const [k,v] of junta(retenidos).slice(0,25)){
 const min=retenidos.filter(x=>x.id===k).reduce((s,x)=>s+x.a1,0);
 console.log('   '+k.padEnd(24)+String(v.n).padStart(6)+v.a.toFixed(1).padStart(13)+
  min.toFixed(2).padStart(14));
}
console.log('   total: '+retenidos.length+' anillos sin tocar');
if(process.env.DETALLE){
 console.log('\n   detalle de los retenidos (cajas distintas):');
 const m=new Map();
 for(const x of retenidos){ const k=x.id+'|'+x.caja;
  const q=m.get(k); if(q){q.n++} else m.set(k,{...x,n:1}) }
 [...m.values()].sort((a,b)=>b.a0*b.n-a.a0*a.n).slice(0,20).forEach(x=>
  console.log('     '+x.id.padEnd(20)+' x'+String(x.n).padStart(4)+'  area '+x.a0.toFixed(2).padStart(9)+
   ' -> '+x.a1.toFixed(2).padStart(8)+'  caja '+x.caja));
}

if(BORRAVACIO){
 const m={}; for(const x of vacios){m[x.id]=m[x.id]||{n:0,a:0}; m[x.id].n++; m[x.id].a+=x.a0}
 console.log('\nANILLOS BORRADOS por no contener nada de tierra: '+vacios.length+', '+
  vacios.reduce((s,x)=>s+x.a0,0).toFixed(0)+' grados2');
 Object.entries(m).sort((a,b)=>b[1].a-a[1].a).slice(0,14).forEach(([k,v])=>
  console.log('   '+k.padEnd(24)+String(v.n).padStart(5)+' anillos '+v.a.toFixed(0).padStart(7)+' grados2'));
 if(salvados.length){
  console.log('\nPERIODOS QUE SE HABRIAN QUEDADO SIN NINGUN ANILLO (no se tocan): '+salvados.length);
  salvados.slice(0,20).forEach(x=>console.log('   '+x.id.padEnd(24)+x.start+'..'+x.end));
 }
}
console.log('\nPIEZAS IRREPARABLES (cruzadas y no se pudieron afinar): '+irreparables.length+' anillos, '+irreparables.reduce((s,x)=>s+x,0).toFixed(1)+' grados2');
console.log('\nFALLOS DEL RECORTADOR (no se tocan, no son hallazgos): '+fallos.length+' anillos, '+
 fallos.reduce((s,x)=>s+x.a0,0).toFixed(0)+' grados2   '+
 Object.entries(fallos.reduce((m,x)=>{m[x.id]=(m[x.id]||0)+1;return m},{})).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>k+' '+v).join(', '));
console.log('\nanillos '+nAnt+' -> '+nDes+'   area '+aAnt.toFixed(0)+' -> '+aDes.toFixed(0));
if(APLICA){ const s=process.env.SALIDA||process.env.JSX;
 L.save(doc.src,doc.R,doc.CIV,s); console.log('aplicado -> '+s) }
else console.log('(informe. --aplica para escribir)');
