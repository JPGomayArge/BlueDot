#!/usr/bin/env node
// LAS REGLAS DECLARADAS, CONVERTIDAS EN ASERCIONES QUE SE EJECUTAN.
//
// POR QUE HACE FALTA. Este proyecto tiene su doctrina escrita en las cabeceras
// de sus herramientas, y esta bien escrita: la regla del sustrato, la regla del
// estado concreto, que una carta de concesion no es territorio, que un area
// cultural no pinta suelo deshabitado, que un poligono no contiene mar. Lo que
// no tenia es ejecutor.
//
// Y una regla sin ejecutor diverge del dato sin que nadie se entere. Dos casos
// de hoy mismo:
//
//   - `vacios.js` decia desde hacia rondas que un sustrato no debe pintar suelo
//     deshabitado. Nunca se comprobo. **Dos de cada tres celdas declaradas
//     vacias tenian un sustrato encima.**
//   - La cabecera de `fidelidad.js` afirmaba que ningun poligono puede contener
//     mar "por construccion". **El 2,7% de lo que el mapa pinta en 1500 es
//     oceano abierto.**
//
// Las dos cosas llevaban meses escritas y las dos eran falsas. Por eso esto no
// es una herramienta mas: es el indice. **Una regla que este escrita en una
// cabecera y no este aqui es una regla que nadie hace cumplir**, y conviene que
// eso se vea de un vistazo en vez de descubrirse por casualidad dos rondas mas
// tarde.
//
// La ultima seccion lista a proposito las reglas que TODAVIA no tienen
// ejecutor. No es una lista de tareas: es la parte del mapa donde la doctrina
// no se puede comprobar, y saber cual es esa parte vale mas que fingir que no
// existe.
//
//   JSX=<mapa> node reglas.js [anio,anio,...]
const L=require('./lib.js');
const T=require('./tierra.js');
const V=require('./vacios.js');
const {CIV}=L.load(process.env.JSX);
const ANIOS=(process.argv[2]||'-2000,1,1000,1500,1800,1900,2000').split(',').map(Number);

const bbDe=rs=>rs.reduce((a,r)=>{const b=L.bb(r);
 return [Math.min(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.max(a[3],b[3])]},[9e9,-9e9,9e9,-9e9]);
function clase(pt){
 for(const z of T.PLANO){
  let dentro=false;
  for(const f of z.fuera){ const b=f.b;
   if(pt[0]<b[0]||pt[0]>b[1]||pt[1]<b[2]||pt[1]>b[3])continue;
   if(L.pip(pt,f.r)){dentro=true;break} }
  if(!dentro)continue;
  for(const h of z.huecos){ const b=h.b;
   if(pt[0]<b[0]||pt[0]>b[1]||pt[1]<b[2]||pt[1]>b[3])continue;
   if(L.pip(pt,h.r))return 'lago' }
  return 'tierra';
 }
 return 'mar';
}

const R={ sustratoEnVacio:0, enMar:0, sustratoSobreEstado:0, celdas:0, bordeCaja:0 };
const culpa={ vacio:{}, mar:{}, solape:{} };
for(const A of ANIOS){
 const viv=[];
 for(const c of CIV){ const p=c.periods.find(p=>p.start<=A&&p.end>A);
  if(p&&p.rings.length)viv.push({c,p,b:bbDe(p.rings)}) }
 for(let x=-180;x<180;x+=0.5)for(let y=-56;y<=78;y+=0.5){
  const pt=[+x.toFixed(2),+y.toFixed(2)];
  const k=clase(pt);
  let sust=null, est=null;
  for(const o of viv){ if(pt[0]<o.b[0]||pt[0]>o.b[1]||pt[1]<o.b[2]||pt[1]>o.b[3])continue;
   if(!L.has(o.p.rings,pt))continue;
   if(o.c.kind==='cultura'){ if(!sust)sust=o.c.id } else { if(!est)est=o.c.id } }
  if(!sust&&!est)continue;
  R.celdas++;
  // R2. Nadie pinta mar abierto.
  if(k==='mar'){ R.enMar++; const q=est||sust; culpa.mar[q]=(culpa.mar[q]||0)+1 }
  // R1. Un area cultural no pinta suelo declarado deshabitado.
  //
  // UNA REGLA MEDIDA JUSTO EN SU PROPIO BORDE FALLA SIEMPRE. La primera version
  // daba 1.116 celdas de violacion despues de que `despuebla.js` hubiera
  // limpiado el mapa, y al mirar donde caian resulto que **las 196 del corte
  // del ano 1 estaban exactamente sobre el borde de la caja y ninguna dentro**.
  // El registro define sus cajas con <= y >=, asi que el borde cuenta como
  // vacio; la resta de poligonos quita el interior y deja el contorno. Las dos
  // cosas son correctas y juntas producen un fallo fantasma en todo el
  // perimetro de cada caja.
  //
  // Es la misma familia que el testigo de Kosrae, que caia literalmente en un
  // vertice del anillo y salia VACIO con la isla pintada. La regla que queda:
  // *para comprobar si un punto cumple una condicion definida por una caja, el
  // punto tiene que estar dentro de la caja, no en su borde.* Se exige un
  // margen de dos centesimas, que es el doble del redondeo de la rejilla.
  if(sust&&k!=='mar'&&V.legitimo(pt,A)){
   const e=V.cual(pt,A);
   const d=e?Math.min(Math.abs(pt[0]-e.caja[0]),Math.abs(pt[0]-e.caja[1]),
                      Math.abs(pt[1]-e.caja[2]),Math.abs(pt[1]-e.caja[3])):9;
   if(d>0.02){ R.sustratoEnVacio++; culpa.vacio[sust]=(culpa.vacio[sust]||0)+1 }
   else R.bordeCaja++;
  }
  // R3. El sustrato cede al estado concreto: no pueden coexistir en la misma celda.
  if(sust&&est){ R.sustratoSobreEstado++; const q=sust+' x '+est; culpa.solape[q]=(culpa.solape[q]||0)+1 }
 }
}
const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>k+' '+v).join(', ');
const linea=(n,ok,det)=>console.log((ok?'  PASA  ':'  FALLA ')+n.padEnd(52)+det);
// ESTO ES UN MUESTREO, NO UNA DEMOSTRACION, Y TIENE QUE DECIRLO.
//
// El control positivo de `control.js` pillo a esta herramienta callando ante un
// sustrato metido a mano en el nucleo del Taklamakan. No estaba rota: la
// violacion se inyecto en el ano 800 y a la herramienta se le habian pedido los
// cortes 1600 y 1800. Miro donde le dijeron y no habia nada.
//
// Es una limitacion de la herramienta igual: **un defecto que solo exista entre
// dos cortes es invisible**, y el mapa tiene 15.000 periodos repartidos por doce
// mil anios, asi que siete cortes tocan una fraccion minima. Por eso la salida
// dice ahora que anios ha mirado y cuantos periodos ha dejado sin tocar. Un
// PASA aqui significa "no hay violaciones en estos cortes", que es bastante
// menos de lo que parece si no se lee la primera linea.
const tocados=new Set();
for(const A of ANIOS)for(const c of CIV){const p=c.periods.find(p=>p.start<=A&&p.end>A); if(p)tocados.add(c.id+'@'+p.start)}
const totalPer=CIV.reduce((s,c)=>s+c.periods.length,0);
console.log('Reglas comprobadas en los cortes '+ANIOS.join(', ')+'.');
console.log('Alcanzan '+tocados.size+' de los '+totalPer+' periodos del mapa ('+
 (100*tocados.size/totalPer).toFixed(0)+'%). Lo que pase solo entre dos cortes no se ve.');
console.log(R.celdas+' celdas pintadas de medio grado\n');
linea('R1 un area cultural no pinta suelo deshabitado', R.sustratoEnVacio===0,
 R.sustratoEnVacio+' celdas'+(R.sustratoEnVacio?'   '+top(culpa.vacio):'')+
 (R.bordeCaja?'   ('+R.bordeCaja+' celdas justo en el borde de una caja, no se cuentan)':''));
linea('R2 nadie pinta mar abierto', R.enMar===0,
 R.enMar+' celdas'+(R.enMar?'   '+top(culpa.mar):''));
linea('R3 el sustrato cede al estado concreto', R.sustratoSobreEstado===0,
 R.sustratoSobreEstado+' celdas'+(R.sustratoSobreEstado?'   '+top(culpa.solape):''));

// R4-R6: estructura del dato, sin rejilla
let sinAnillos=0, sinWiki=0, dup=0;
const firma=p=>p.rings.map(r=>r.length+':'+r[0][0].toFixed(2)+','+r[0][1].toFixed(2)).sort().join('|');
const porFirma=new Map();
for(const c of CIV){
 if(!c.wikiTitle&&!c.periods.some(p=>p.wikiTitle))sinWiki++;
 for(const p of c.periods){
  if(!p.rings.length)sinAnillos++;
  if(p.rings.length){ const f=firma(p)+'@'+p.start;
   const q=porFirma.get(f); if(q&&q!==c.id)dup++; else porFirma.set(f,c.id) }
 }
}
linea('R4 ningun periodo sin anillos', sinAnillos===0, sinAnillos+' periodos');
linea('R5 ninguna geometria identica en dos entidades a la vez', dup===0, dup+' casos');
linea('R6 toda entidad tiene articulo de referencia', sinWiki===0, sinWiki+' entidades sin wikiTitle');

console.log('\nREGLAS ESCRITAS EN LAS CABECERAS QUE TODAVIA NO TIENEN EJECUTOR:');
for(const s of [
 'la regla del estado concreto: donde el grande administraba directamente, el grande',
 '  (Crimea pinta Crimea siendo vasalla otomana; Zanzibar pinta Zanzibar bajo Oman).',
 '  No es comprobable sin saber quien administraba: necesita fuente externa.',
 'una carta de concesion no es territorio: se pinta lo administrado, no lo reclamado.',
 '  Misma razon: no hay dato que distinga una cosa de la otra dentro del mapa.',
 'la ocupacion militar: el mapa borra al ocupado en Europa y no en Asia.',
 '  Es una incoherencia real y la decision es del autor, no de una herramienta.',
 '  `tiempo.js` ya la hace visible: sale como parpadeos de 5-7 anios en 1938-1945.',
 'la resolucion del trazo no declara su incertidumbre: el Rin y una frontera',
 '  sahariana se dibujan con la misma clase de linea. Haria falta un campo nuevo.',
])console.log('   '+s);
