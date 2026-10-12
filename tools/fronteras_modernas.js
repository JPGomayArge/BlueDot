#!/usr/bin/env node
// DETECTOR DE FRONTERAS MODERNAS PROYECTADAS HACIA ATRAS.
//
// Por que existe. El usuario miro el globo y dijo que Egipto "siempre mantiene
// la forma de la frontera actual, como si fuera casi cuadrilatera". Tenia razon,
// y el indicio estaba a la vista en cuanto se miraron los vertices: el poligono
// del Egipto de Narmer, en el -3100, contiene
//
//   24.98/22.00 -> 30.23/22.00 -> 32.52/22.00 -> 36.87/22.00
//
// que es la linea recta del paralelo 22 N, la frontera Egipto-Sudan trazada en
// 1899; y 24.98/29.18 -> 24.98/22.00, el meridiano 25 E, la frontera con Libia;
// y hasta el entrante de Wadi Halfa y Bir Tawil, un artefacto administrativo de
// 1902. Cinco mil anios de historia dibujados sobre el contorno de la republica
// moderna.
//
// Es el defecto mas invisible de todos los que ha tenido este mapa, porque pasa
// TODAS las pruebas existentes: no deja huecos, no produce doble pintado, la
// capital cae dentro, `audit.js` no lo marca como caja -el litoral mediterraneo
// y el del mar Rojo son sinuosos y de verdad-, y el rotulo no dice nada
// comprobable. Solo se ve mirando los vertices o mirando el globo.
//
// COMO SE DETECTA. Las fronteras modernas, sobre todo las coloniales de Africa
// y Oriente Medio, son rectas sobre meridianos y paralelos enteros. Las
// fronteras antiguas nunca lo son: siguen rios, crestas, desiertos y costas.
// Asi que se buscan tramos LARGOS y RECTOS clavados en una latitud o longitud
// redonda, dentro de periodos ANTERIORES a la epoca en que se trazaron.
//
//   JSX=<mapa> node fronteras_modernas.js [ANTES_DE]
//
// ANTES_DE es el anio limite: solo se avisa de periodos que terminan antes de
// el. Por defecto 1700, que deja fuera casi todo el trazado colonial.
//
// AVISOS DE LECTURA
//  - Un tramo recto puede ser una TESELA de tallado o el borde de una caja de
//    recorte legitima; se cuentan los grados de longitud que abarca para poder
//    distinguir un corte de trabajo de una frontera de Estado.
//  - Los archipielagos se pintan con rectangulos de mar a proposito: se
//    excluyen los anillos que son casi todo oceano.
//  - Que una entidad salga aqui NO prueba que este mal: prueba que hay que
//    mirarla. Egipto, Libia, Sudan, Argelia, Arabia y Chad tienen fronteras
//    rectas de verdad HOY, y es correcto que sus periodos modernos las tengan.
const L=require('./lib.js');
const T=require('./tierra.js');
const {CIV}=L.load(process.env.JSX);
const ANTES=+(process.argv[2]||1700);
const MIN_LARGO=+(process.env.MIN_LARGO||1.5);   // grados minimos de tramo recto
const TOL=+(process.env.TOL||0.06);              // cuanto se admite que se desvie

// Un anillo casi todo oceano es la convencion de archipielago del mapa.
function esMar(r){
 let t=0,n=0;const b=L.bb(r);
 for(let i=0;i<=5;i++)for(let j=0;j<=5;j++){
  const p=[b[0]+(b[1]-b[0])*i/5, b[2]+(b[3]-b[2])*j/5];
  if(!L.pip(p,r))continue; n++; if(T.enTierra(p))t++;
 }
 return n && t/n<0.15;
}

// Devuelve los tramos rectos de un anillo pegados a un paralelo o meridiano
// "redondo": grado entero, medio grado, o el propio valor si es muy repetido.
function tramosRectos(r){
 const out=[];
 let i=0;
 while(i<r.length){
  // horizontal: misma latitud
  let j=i, latRef=r[i][1];
  while(j+1<r.length && Math.abs(r[j+1][1]-latRef)<=TOL) j++;
  if(j>i){
   const largo=Math.abs(r[j][0]-r[i][0]);
   const redonda = Math.abs(latRef-Math.round(latRef))<0.08
                || Math.abs(latRef*2-Math.round(latRef*2))<0.08;
   if(largo>=MIN_LARGO && redonda)
    out.push({eje:'lat', valor:latRef, largo, desde:r[i][0], hasta:r[j][0], vert:j-i+1});
  }
  // vertical: misma longitud
  let k=i, lonRef=r[i][0];
  while(k+1<r.length && Math.abs(r[k+1][0]-lonRef)<=TOL) k++;
  if(k>i){
   const largo=Math.abs(r[k][1]-r[i][1]);
   const redonda = Math.abs(lonRef-Math.round(lonRef))<0.08
                || Math.abs(lonRef*2-Math.round(lonRef*2))<0.08;
   if(largo>=MIN_LARGO && redonda)
    out.push({eje:'lon', valor:lonRef, largo, desde:r[i][1], hasta:r[k][1], vert:k-i+1});
  }
  i += Math.max(1, Math.max(j,k)-i);
 }
 return out;
}

const porEntidad=new Map();
for(const c of CIV){
 const vistos=new Map();          // firma del tramo -> anios en que aparece
 for(const p of c.periods){
  if(p.end>=ANTES)continue;       // solo lo anterior al limite
  for(const r of p.rings){
   if(r.length<4)continue;
   if(esMar(r))continue;
   for(const t of tramosRectos(r)){
    const k=t.eje+' '+t.valor.toFixed(2)+' ('+t.largo.toFixed(1)+' grados)';
    if(!vistos.has(k))vistos.set(k,[]);
    vistos.get(k).push(p.start+'..'+p.end);
   }
  }
 }
 if(vistos.size)porEntidad.set(c.id,vistos);
}

// Se ordena por gravedad: cuanto mas largo el tramo y en mas periodos aparece,
// mas probable es que sea una frontera de Estado y no una costura de trabajo.
const filas=[];
for(const [id,vistos] of porEntidad)
 for(const [k,anios] of vistos){
  const largo=+k.match(/\(([\d.]+) grados\)/)[1];
  filas.push({id,k,n:anios.length,largo,peso:largo*Math.min(anios.length,20),
              ej:anios.slice(0,3).join(', ')+(anios.length>3?' ...':'')});
 }
filas.sort((a,b)=>b.peso-a.peso);

let ult='';
for(const f of filas.slice(0,80)){
 if(f.id!==ult){console.log('');ult=f.id}
 console.log(f.id.padEnd(24), f.k.padEnd(30), 'en', String(f.n).padStart(3), 'periodos |', f.ej);
}
console.log('\nentidades con tramos rectos sospechosos antes de',ANTES+':',porEntidad.size,
            '| tramos distintos:',filas.length);
console.log('MIN_LARGO',MIN_LARGO,'grados | TOL',TOL);
