#!/usr/bin/env node
// CALIDAD DEL TRAZO. La otra mitad de `fidelidad.js`.
//
// `fidelidad.js` pregunta si el contorno LLEGA donde tiene que llegar -si el
// litoral tiene dueno-. Esta pregunta otra cosa: si la linea que hay dibujada
// **parece una frontera o parece una herramienta**. Son dos defectos distintos
// y los dos se ven a simple vista en el globo, que es donde aparecieron:
//
// 1. COSTURA INTERNA. Un territorio no es un anillo, son varios, y cuando uno
//    tiene un agujero `recorte.parte` lo trocea con cortes verticales. El
//    corte es correcto para el relleno, pero el renderizador dibujaba el
//    perimetro COMPLETO de cada trozo, asi que **Estados Unidos aparecia
//    cruzado de lineas rectas de costa a costa**, y ademas al doble de brillo
//    porque cada junta se pintaba dos veces, una por cada lado.
//    Se mide: aristas que aparecen dos veces dentro del mismo periodo.
//    Una arista compartida por dos trozos del mismo territorio no es un borde.
//
// 2. RECTITUD INVENTADA. Perimetro alineado a los ejes -Δlon=0 o Δlat=0- que
//    NO comparte ningun vecino. Una frontera recta que otro tambien dibuja es
//    una frontera de verdad: el paralelo 49, el meridiano de Tordesillas, las
//    rectas del Sahara. Una frontera recta que no comparte nadie es **una caja
//    dibujada a mano**, y es lo que produce las formas en H del Amazonas: un
//    rectangulo al que otro rectangulo le ha mordido el centro.
//    El area no dice nada de esto: una caja de 40 grados cuadrados y una
//    cuenca de 40 grados cuadrados miden lo mismo. Lo que las distingue es que
//    la caja tiene cuatro lados y ninguno es de nadie mas.
//
// POR QUE HACE FALTA EL "QUE NO COMPARTE NADIE". Una primera version conto
// solo perimetro recto y marco a media Africa colonial, que tiene fronteras
// rectas de verdad. **Una recta compartida es un acuerdo; una recta solitaria
// es un dibujo.** Es la misma leccion que `redibujar.js` aprendio en la ronda
// 49 al mirar solo dentro de la entidad: *un borde es de dos*.
//
//   JSX=<mapa> node trazo.js [anio,anio,...]
//   TOP=<n> cuantas entidades listar (20)
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
const ANIOS=(process.argv[2]||'1,500,1000,1500,1700,1800,1900,2000').split(',').map(Number);
const TOP=+(process.env.TOP||20);
const R4=v=>v.toFixed(4);
const cla=(a,b)=>{const ka=R4(a[0])+' '+R4(a[1]),kb=R4(b[0])+' '+R4(b[1]);
                  return ka<kb?ka+'|'+kb:kb+'|'+ka};
const largo=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const recta=(a,b)=>{const dx=Math.abs(b[0]-a[0]),dy=Math.abs(b[1]-a[1]);
 // alineada a un eje y de al menos medio grado: por debajo de eso cualquier
 // costa tiene tramos horizontales por puro redondeo a la rejilla de 0,01
 return (dx<1e-9||dy<1e-9) && (dx+dy)>=0.5};

console.log('anio   costura interna     rectitud inventada');
console.log('       grados   % del     grados   % del');
console.log('                perimetro          perimetro');
const acumR={}, acumC={};
for(const A of ANIOS){
 let per=0, cost=0, rect=0;
 // mapa global de aristas del ANIO, para saber si una recta la comparte otro
 const global=new Map();
 const vivos=[];
 for(const c of CIV){ const p=c.periods.find(p=>p.start<=A&&p.end>A);
  if(!p||!p.rings.length)continue; vivos.push({c,p});
  for(const r of p.rings)for(let i=0;i<r.length;i++){
   const k=cla(r[i],r[(i+1)%r.length]);
   let s=global.get(k); if(!s)global.set(k,s=new Set()); s.add(c.id); } }
 for(const {c,p} of vivos){
  const propio=new Map();
  for(const r of p.rings)for(let i=0;i<r.length;i++){
   const k=cla(r[i],r[(i+1)%r.length]); propio.set(k,(propio.get(k)||0)+1); }
  // LA MISMA PRUEBA DE DOS LADOS QUE EL RENDERIZADOR, Y POR LA MISMA RAZON.
  //
  // La primera version solo descontaba las juntas con vertices identicos, y
  // eso dejaba entrar en "rectitud inventada" los cortes de `recorte.parte`
  // que no casan vertice a vertice. El resultado era una lista de peores
  // infractores encabezada por `sami_fineses`, `inuit`, `samoyedos` y
  // `artico_canadiense`, y al mirarlos no eran cajas dibujadas a mano: era
  // Laponia troceada en diez tiras verticales por el recortador, cada una con
  // sus dos lados perfectamente rectos.
  //
  // O sea, otra vez: **una metrica multiplicada por una unidad que otra
  // herramienta manipula mide a esa herramienta.** Van doce. Un corte del
  // recortador no es una frontera inventada: no es una frontera siquiera, y si
  // se cuenta como tal la lista de trabajo pendiente manda a redibujar lo que
  // solo habia que dejar de pintar.
  const dentroTerr=(x,y)=>{ for(const r of p.rings) if(L.pip([x,y],r))return true; return false };
  const junta=(a,b)=>{ const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
   if(len<0.3)return false; if(Math.abs(dx)>1e-9&&Math.abs(dy)>1e-9)return false;
   const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,nx=-dy/len*0.03,ny=dx/len*0.03;
   return dentroTerr(mx+nx,my+ny)&&dentroTerr(mx-nx,my-ny) };
  let pc=0, pr=0;
  for(const r of p.rings)for(let i=0;i<r.length;i++){
   const a=r[i],b=r[(i+1)%r.length], k=cla(a,b), d=largo(a,b);
   per+=d;
   if(propio.get(k)>1 || junta(a,b)){ cost+=d; pc+=d; continue }   // junta interna
   if(recta(a,b) && global.get(k).size<2){ rect+=d; pr+=d }
  }
  if(pc>0.5)acumC[c.id]=Math.max(acumC[c.id]||0,pc);
  if(pr>0.5)acumR[c.id]=Math.max(acumR[c.id]||0,pr);
 }
 console.log(String(A).padStart(5)+'  '+cost.toFixed(0).padStart(6)+'   '+
  (100*cost/per).toFixed(1).padStart(5)+'%   '+rect.toFixed(0).padStart(7)+'   '+
  (100*rect/per).toFixed(1).padStart(5)+'%');
}
const lista=(t,o)=>{ console.log('\n'+t);
 Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,TOP)
  .forEach(([k,v])=>console.log('  '+k.padEnd(28)+v.toFixed(1).padStart(8)+' grados')); };
lista('COSTURA INTERNA - peor corte de cada entidad:',acumC);
lista('RECTITUD INVENTADA - peor corte de cada entidad:',acumR);
