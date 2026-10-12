#!/usr/bin/env node
// LISTA DE TRABAJO DE CONTORNOS DIBUJADOS A MANO.
//
// Por que existe. El usuario mando una captura del Indo en el -2992 y era una
// caja de nueve vertices. Al medirlo, el mapa tiene 5.719 anillos rectilineos
// en 276 entidades. Su peticion fue exacta: "la idea es que puedas identificar
// estos casos y revisarlos en vez de que yo haga cada uno. Son mas de 1000 civ
// con diferentes topologias, sera imposible solo para mi". Tiene razon: el ojo
// humano no escala a 1.166 entidades y 14.000 periodos.
//
// PERO 5.719 NO ES LA CIFRA DE TRABAJO, y confundirlas seria el error de
// siempre. Un tramo recto puede ser:
//
//   CONVENCION      un archipielago se pinta con una caja de mar a proposito,
//                   porque un atolon no se ve a escala de globo. Documentado.
//   COSTURA         `recorte.parte` corta un poligono en tiras verticales y el
//                   lado recto es el corte, no una frontera. Reformar una tira
//                   sola abriria una franja blanca.
//   FRONTERA REAL   despues de 1700 hay fronteras rectas de verdad -el paralelo
//                   49, el meridiano 141, el reparto de Africa- y dibujarlas
//                   curvas seria falsear.
//   DIBUJO A MANO   lo que hay que rehacer.
//
// Esta herramienta separa las cuatro y ordena la ultima.
//
// Y UNA ADVERTENCIA QUE VA EN LA CABECERA PORQUE ES LO MAS IMPORTANTE:
// **redibujar una caja sin saber donde estaba la frontera es empeorar el mapa.**
// Una caja es fea pero honesta: dice "esto es una aproximacion". Un contorno
// sinuoso inventado dice "esto se sabe con precision", y es mentira. Por eso la
// salida separa dos columnas:
//
//   CONOCIBLE   estados con fronteras documentadas, culturas con distribucion
//               de yacimientos publicada, entidades con costa o rio que seguir.
//               Aqui redibujar es reparar.
//   DIFUSO      areas culturales de estepa, taiga, sabana o desierto, donde la
//               frontera no existia como linea. Aqui la caja es lo honesto y lo
//               que hay que arreglar es que se NOTE que es una aproximacion,
//               no disfrazarla.
//
// El criterio automatico para separarlas es imperfecto y esta explicito abajo:
// una entidad con `kind:cultura` y sin costa dentro de su contorno se marca
// DIFUSO; todo lo demas, CONOCIBLE. Quien trabaje la lista puede discrepar en
// un caso concreto, pero que discrepe a sabiendas.
//
//   JSX=<mapa> node redibujar.js [CUANTOS]
const L=require('./lib.js');
const T=require('./tierra.js');
const {CIV}=L.load(process.env.JSX);
const OK=require('./cajas_ok.js');
const CUANTOS=+(process.argv[2]||40);

const A=r=>Math.abs(L.rA(r));

// Fraccion del PERIMETRO en tramos exactamente horizontales o verticales. Se
// mide sobre el perimetro y no sobre el numero de vertices porque un contorno
// bueno puede tener dos lados rectos cortos sin ser una caja.
function rectilineo(r){
 let largo=0,recto=0;
 for(let i=0;i<r.length;i++){
  const a=r[i],b=r[(i+1)%r.length];
  const dx=Math.abs(a[0]-b[0]),dy=Math.abs(a[1]-b[1]),d=Math.hypot(dx,dy);
  if(d<1e-9)continue; largo+=d; if(dx<1e-6||dy<1e-6)recto+=d;
 }
 return largo? recto/largo : 0;
}
// Coordenadas redondas: una frontera real rara vez cae en .0 o .5 exactos, y un
// dibujo a mano casi siempre. Es la senal que ya usa `fronteras_modernas.js`.
function redondas(r){
 let n=0;
 for(const p of r){
  const rx=Math.abs(p[0]*10-Math.round(p[0]*10))<1e-6;
  const ry=Math.abs(p[1]*10-Math.round(p[1]*10))<1e-6;
  if(rx&&ry)n++;
 }
 return n/r.length;
}
// Convencion del archipielago: el anillo es casi todo mar.
function esMar(r){
 const b=L.bb(r);const paso=Math.max((b[1]-b[0])/10,(b[3]-b[2])/10,0.2);
 let n=0,t=0;
 for(let x=b[0];x<=b[1];x+=paso)for(let y=b[2];y<=b[3];y+=paso){
  if(!L.pip([x,y],r))continue;n++;if(T.enTierra([x,y]))t++}
 return n>0 && t/n<0.10;
}
// Costura de tesela: otro anillo del mismo periodo empieza o acaba justo en esa
// longitud. Reformar una tira sola abriria una franja blanca.
function esTesela(r,p){
 if(p.rings.length<2)return false;
 const b=L.bb(r);
 for(const o of p.rings){ if(o===r)continue; const c=L.bb(o);
  if(Math.abs(c[0]-b[1])<1e-6||Math.abs(c[1]-b[0])<1e-6)return true; }
 return false;
}

// ---------------------------------------------------------------------------
// COSTURA CON OTRA ENTIDAD (ronda 49). EL FALLO QUE ESTO ARREGLA.
//
// `esTesela` de arriba solo mira los OTROS ANILLOS DEL MISMO PERIODO DE LA
// MISMA ENTIDAD. Pero la costura tipica de este mapa no es esa: es la que deja
// el tallado entre DOS ENTIDADES. Se pica un rectangulo en el vecino, el
// recorte se le da a esta entidad, y el borde queda repetido vertice a vertice
// en las dos. Ese borde es recto, y `esTesela` no lo ve.
//
// Un agente de la ronda 49 lo midio: **236 de los 337 anillos de la columna
// DIBUJO A MANO -el 70%- tienen mas del 60% de su perimetro recto cosido a un
// vecino.** `cree_innu` firma tres esquinas de `british`; `persia`, las cuatro
// de `mughal`; `poland_lithuania`, las cuatro de `russia`. Es decir: durante
// dos rondas la lista de trabajo ha sido en sus siete decimas partes ruido, y
// tres agentes se gastaron enteros en examinar bordes que no eran suyos.
//
// La leccion es la de siempre, en su novena forma: **una prueba que solo mira
// dentro de la entidad no puede juzgar un borde, porque un borde es de dos.**
//
// Se mide sobre el LARGO de los tramos rectos, no sobre su numero: un anillo
// con un lado cosido de tres grados y tres muescas rectas de 0,2 esta cosido.
function tramosRectos(r){
 const out=[];
 for(let i=0;i<r.length;i++){
  const a=r[i],b=r[(i+1)%r.length];
  const dx=Math.abs(a[0]-b[0]),dy=Math.abs(a[1]-b[1]),d=Math.hypot(dx,dy);
  if(d<0.15)continue;
  if(dx<1e-6)out.push(['lon',a[0],Math.min(a[1],b[1]),Math.max(a[1],b[1]),d]);
  else if(dy<1e-6)out.push(['lat',a[1],Math.min(a[0],b[0]),Math.max(a[0],b[0]),d]);
 }
 return out;
}
function cosidoAlVecino(c,p,r){
 const ts=tramosRectos(r);
 if(!ts.length)return null;
 const yr=p.start+0.5;
 const vivos=[];
 for(const o of CIV){ if(o===c)continue;
  const q=o.periods.find(q=>yr>=q.start&&yr<q.end); if(q&&q.rings.length)vivos.push([o,q]); }
 let largo=0, cosido=0; const socios=new Set();
 for(const t of ts){
  largo+=t[4];
  let hay=false;
  for(const [o,q] of vivos){
   for(const rr of q.rings){
    const b=L.bb(rr);
    if(t[0]==='lon'){ if(b[1]<t[1]-1||b[0]>t[1]+1||b[3]<t[2]-1||b[2]>t[3]+1)continue }
    else            { if(b[3]<t[1]-1||b[2]>t[1]+1||b[1]<t[2]-1||b[0]>t[3]+1)continue }
    for(const v of rr){
     const enLinea = t[0]==='lon'
      ? (Math.abs(v[0]-t[1])<1e-6 && v[1]>=t[2]-0.05 && v[1]<=t[3]+0.05)
      : (Math.abs(v[1]-t[1])<1e-6 && v[0]>=t[2]-0.05 && v[0]<=t[3]+0.05);
     if(enLinea){ hay=true; socios.add(o.id) }
    }
    if(hay)break;
   }
   if(hay)break;
  }
  if(hay)cosido+=t[4];
 }
 if(!largo)return null;
 const frac=cosido/largo;
 return frac>=0.60 ? {frac, socios:[...socios]} : null;
}
// Tiene costa dentro? Si la tiene, hay algo real que seguir y el contorno es
// conocible aunque la entidad sea una cultura.
function tieneCosta(r){
 const b=L.bb(r);const paso=Math.max((b[1]-b[0])/14,(b[3]-b[2])/14,0.2);
 let t=0,m=0;
 for(let x=b[0];x<=b[1];x+=paso)for(let y=b[2];y<=b[3];y+=paso){
  if(!L.pip([x,y],r))continue;
  if(T.enTierra([x,y]))t++;else m++;
 }
 return t>0 && m>0;
}

const conv=[], costura=[], vecina=[], moderna=[], decidida=[], trabajo=[];
let vistos=0;

for(const c of CIV){
 const cultura = c.kind==='cultura';
 for(const p of c.periods){
  for(const r of p.rings){
   const a=A(r); if(a<0.5)continue;
   vistos++;
   const rec=rectilineo(r);
   if(rec<=0.70 || r.length>=60)continue;
   const reg={id:c.id, tramo:p.start+'..'+p.end, a, v:r.length, rec,
              red:redondas(r), dur:p.end-p.start, peso:a*(p.end-p.start),
              caja:L.bb(r).map(v=>+v.toFixed(2)), cultura};
   if(esMar(r)){conv.push(reg);continue}
   if(esTesela(r,p)){costura.push(reg);continue}
   // REGISTRO DE CAJAS DELIBERADAS. Lo que un agente ya examino y decidio dejar
   // como caja, con razon escrita, no vuelve a la lista. Sin esto el circuito
   // da vueltas: en la ronda 45 las cuatro entidades rechazadas volvieron a
   // encabezar la corrida siguiente y el trabajo real no afloraba.
   const dec=OK.legitima(c.id,p.start,p.end,reg.caja);
   if(dec){decidida.push({...reg,razon:dec.razon});continue}
   // Costura con OTRA entidad: el borde no es de esta entidad, es de dos.
   // Va despues del registro de cajas deliberadas porque es la prueba cara.
   const cos=cosidoAlVecino(c,p,r);
   if(cos){vecina.push({...reg,frac:cos.frac,socios:cos.socios});continue}
   // Frontera recta real: a partir de 1700 y en una entidad que no es cultura.
   if(p.start>=1700 && !cultura){moderna.push(reg);continue}
   reg.clase = (cultura && !tieneCosta(r)) ? 'DIFUSO' : 'CONOCIBLE';
   trabajo.push(reg);
  }
 }
}

// Se agrupa POR ENTIDAD, no por anillo: quien vaya a redibujar una entidad la
// redibuja entera, y contar anillos sueltos inflaria el trabajo por diez. Es la
// misma razon por la que `rotulos.js` agrupa por afirmacion y no por tramo.
const porEnt=new Map();
for(const r of trabajo){
 let e=porEnt.get(r.id);
 if(!e){e={id:r.id, clase:r.clase, cultura:r.cultura, n:0, peso:0, area:0,
           desde:1e9, hasta:-1e9, caja:r.caja.slice()};porEnt.set(r.id,e)}
 e.n++; e.peso+=r.peso; e.area=Math.max(e.area,r.a);
 const [i,f]=r.tramo.split('..').map(Number);
 e.desde=Math.min(e.desde,i); e.hasta=Math.max(e.hasta,f);
 e.caja=[Math.min(e.caja[0],r.caja[0]),Math.max(e.caja[1],r.caja[1]),
         Math.min(e.caja[2],r.caja[2]),Math.max(e.caja[3],r.caja[3])];
 if(r.clase==='CONOCIBLE')e.clase='CONOCIBLE';
}

const lista=[...porEnt.values()];
const con=lista.filter(e=>e.clase==='CONOCIBLE').sort((a,b)=>b.peso-a.peso);
const dif=lista.filter(e=>e.clase==='DIFUSO').sort((a,b)=>b.peso-a.peso);

console.log('anillos de mas de 0,5 grado2 examinados:',vistos);
console.log('con firma rectilinea:', conv.length+costura.length+vecina.length+moderna.length+decidida.length+trabajo.length);
console.log('  - convencion de archipielago (caja de mar):',conv.length);
console.log('  - costura de tesela (recorte.parte):      ',costura.length);
console.log('  - COSTURA CON OTRA ENTIDAD (>=60% cosido):',vecina.length,
            ' ('+new Set(vecina.map(v=>v.id)).size+' entidades)');
console.log('  - frontera recta posterior a 1700:        ',moderna.length);
console.log('  - DECIDIDA: caja deliberada, con razon escrita:',decidida.length,
            ' ('+new Set(decidida.map(d=>d.id)).size+' entidades)');
console.log('  - DIBUJO A MANO:                          '+trabajo.length+
            '  en '+lista.length+' entidades');

const tabla=(t,v,nota)=>{
 console.log('\n== '+t+': '+v.length+' entidades');
 console.log('   '+nota);
 console.log('     peso  anillos  area  arco                caja                       entidad');
 for(const e of v.slice(0,CUANTOS))
  console.log(String(Math.round(e.peso)).padStart(9)+'  '+String(e.n).padStart(6)+
   '  '+e.area.toFixed(1).padStart(6)+'  '+(e.desde+'..'+e.hasta).padEnd(18)+
   '  '+e.caja.map(x=>x.toFixed(1)).join(',').padEnd(24)+'  '+e.id);
};
tabla('CONOCIBLE -- redibujar repara', con,
 'estados con frontera documentada, o contornos con costa o rio que seguir');
tabla('DIFUSO -- redibujar puede empeorar', dif,
 'areas culturales sin costa: la frontera no existia como linea y la caja es honesta');

if(process.env.JSON) require('fs').writeFileSync(process.env.JSON,
 JSON.stringify({conocible:con, difuso:dif}));
