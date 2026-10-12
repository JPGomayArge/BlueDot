#!/usr/bin/env node
// AUDITORIA DE FIGURA Y DE EVOLUCION.
//
// Por que existe. El usuario miro el globo y dijo: "hay veces donde veo partes
// separadas de la civ o como burbujas". Ninguna herramienta del proyecto medi­a
// eso. `astillas.js` borra esquirlas por debajo de un umbral de area, pero no
// pregunta si lo que borra tenia sentido ni mira lo que queda; `intermitencias`
// mira celdas que cambian de dueno, no entidades que se rompen; `audit.js` mira
// si un contorno es demasiado liso, que es el defecto contrario.
//
// LA TRAMPA, Y ES LA DE SIEMPRE. Contar piezas no mide nada: **el 67% de los
// periodos del mapa tiene mas de una pieza**, y el campeon absoluto es `inuit`
// con 263, que es el archipielago artico y esta perfectamente bien. Una
// talasocracia son piezas por definicion. Asi que el numero de trozos es ruido
// y hace falta un discriminador.
//
// EL DISCRIMINADOR ES EL AGUA, Y ESTA VEZ NO ES TAUTOLOGICO. En la ronda 40
// intente juzgar los contornos lisos por la fraccion de agua DENTRO del
// poligono, y salio cero en los treinta y ocho porque todo pasa por
// `recorte.aTierra` y ningun poligono puede contener mar por construccion. Aqui
// se mira otra cosa: el agua que hay ALREDEDOR de la pieza, fuera de ella. Eso
// no lo fija ninguna herramienta del proyecto, lo fija la geografia.
//
//   pieza rodeada de MAR    -> isla. Legitima: un archipielago, una posesion de
//                              ultramar, un puerto. No es defecto.
//   pieza rodeada de TIERRA -> o es un enclave de verdad (Kaliningrado, Ceuta,
//                              Prusia Oriental) o es un accidente del tallado.
//
// Medido sobre cuatro mil piezas pequenas: 87% estan rodeadas de mar y 13% de
// tierra. Las segundas son las que hay que mirar.
//
// Y PARA SEPARAR EL ENCLAVE DE VERDAD DEL ACCIDENTE: LA PERSISTENCIA. Un
// enclave historico dura. Prusia Oriental esta ahi doscientos anios. Una pieza
// que aparece en un tramo y no esta ni en el anterior ni en el siguiente, en el
// mismo sitio, no es historia: es lo que dejo un recorte. Se llama EFIMERA y es
// el defecto que se busca.
//
// SEGUNDO EJE: LOS ANIOS. El usuario pregunto tambien por la evolucion, y es
// otra cosa. Una entidad puede tener la figura bien en cada instante y saltar
// de forma entre un tramo y el siguiente sin motivo. Se mide con la diferencia
// simetrica entre periodos consecutivos dividida por el area mayor: cuanto de
// la entidad cambia de un tramo al que le sigue. Un salto grande puede ser
// historia -una conquista, una particion- pero un salto grande que se DESHACE
// en el tramo siguiente no lo es: eso es un parpadeo, y se marca aparte.
//
//   JSX=<mapa> node fragmentos.js [CUANTOS] [MIN_AREA]
//
// Se ordena por AREA x DURACION, no por numero de piezas ni de saltos, por la
// razon de siempre: cualquier metrica que cuente unidades que otra herramienta
// parte y funde acaba midiendo a esa herramienta y no al mapa.
const L=require('./lib.js');
const T=require('./tierra.js');
const pc=require('polygon-clipping');
const {CIV}=L.load(process.env.JSX);

const CUANTOS=+(process.argv[2]||25);
const MIN=+(process.argv[3]||0.004);     // por debajo de esto es esquirla, no burbuja

const A=r=>Math.abs(L.rA(r));
const centro=r=>{const b=L.bb(r);return [+((b[0]+b[1])/2).toFixed(3), +((b[2]+b[3])/2).toFixed(3)]};
// Un punto representativo DENTRO del anillo, no el centro de la caja: para una
// pieza en forma de arco el centro de la caja cae fuera y la persistencia
// saldria mal.
function dentroDe(r){
 const b=L.bb(r);
 for(let i=1;i<=5;i++)for(let j=1;j<=5;j++){
  const pt=[+(b[0]+(b[1]-b[0])*i/6).toFixed(3), +(b[2]+(b[3]-b[2])*j/6).toFixed(3)];
  if(L.pip(pt,r))return pt;
 }
 return centro(r);
}
// Fraccion de tierra en una corona alrededor de la pieza. Se muestrea a una
// distancia proporcional al tamano de la pieza, con un minimo: una isla grande
// necesita mirar mas lejos que un islote.
function tierraAlrededor(r){
 const b=L.bb(r);
 const rad=Math.max(0.45, Math.max(b[1]-b[0], b[3]-b[2])*0.8);
 const cx=(b[0]+b[1])/2, cy=(b[2]+b[3])/2;
 let t=0,n=0;
 for(let k=0;k<16;k++){
  const a=k*Math.PI/8;
  const pt=[+(cx+rad*Math.cos(a)).toFixed(3), +(cy+rad*Math.sin(a)).toFixed(3)];
  if(L.pip(pt,r))continue;             // sigue dentro de la propia pieza
  n++; if(T.enTierra(pt))t++;
 }
 return n? t/n : 0;
}

const efimeras=[], saltos=[], parpadeos=[];
let piezasVistas=0, periodos=0;

for(const c of CIV){
 const ps=c.periods;
 for(let i=0;i<ps.length;i++){
  const p=ps[i]; periodos++;
  const pz=p.rings.map(r=>({r,a:A(r)})).filter(x=>x.a>0).sort((x,y)=>y.a-x.a);
  if(pz.length>1){
   // LOS DOS FILTROS BARATOS VAN PRIMERO, Y LOS DOS SALEN DE UN FALSO POSITIVO
   // DE LA PRIMERA CORRIDA. El hallazgo numero uno era `sami_fineses` en
   // -500..750 con una pieza de 33,7 grado2 junto al Ladoga, y no era ninguna
   // burbuja: era territorio sami de verdad durante mil doscientos cincuenta
   // anios, que en 750 pasa a los eslavos. Dos cosas fallaban:
   //
   //  1. NO SE PUEDE JUZGAR LA PERSISTENCIA EN EL PRIMER NI EN EL ULTIMO
   //     TRAMO. En el primero no hay un "antes" contra el que comparar, asi que
   //     cualquier pieza que se pierda despues parece efimera. Como el tramo
   //     -500..750 era el primero de la entidad, la prueba solo podia fallar.
   //  2. UNA PIEZA GRANDE NO ES UNA BURBUJA. Si mide una fraccion apreciable
   //     del bloque principal es una region, y que se gane o se pierda es
   //     historia. Una burbuja es pequena por definicion.
   //
   // Es la misma leccion de siempre con otro disfraz: una prueba que no puede
   // distinguir sus dos resultados no es una prueba.
   if(i===0 || i===ps.length-1)continue;
   const principal=pz[0].a;
   for(let k=1;k<pz.length;k++){
    const {r,a}=pz[k];
    if(a<MIN)continue;                 // esquirla: territorio de astillas.js
    if(a > principal*0.30)continue;    // region, no burbuja
    piezasVistas++;
    if(tierraAlrededor(r) < 0.6)continue;   // rodeada de mar: isla legitima
    // PERSISTENCIA: la pieza esta tambien en el tramo anterior y en el siguiente?
    const pt=dentroDe(r);
    if(L.has(ps[i-1].rings, pt) || L.has(ps[i+1].rings, pt))continue;
    efimeras.push({id:c.id, tramo:p.start+'..'+p.end, area:a,
                   dur:p.end-p.start, peso:a*(p.end-p.start), pt});
   }
  }
  // SALTOS entre tramos consecutivos
  if(i<ps.length-1 && ps[i+1].start===p.end){
   const q=ps[i+1];
   const aa=p.rings.reduce((s,r)=>s+A(r),0), ab=q.rings.reduce((s,r)=>s+A(r),0);
   const may=Math.max(aa,ab); if(may<0.5)continue;
   let dif=0;
   try{
    const d1=pc.difference(p.rings.map(r=>[r]), q.rings.map(r=>[r]));
    const d2=pc.difference(q.rings.map(r=>[r]), p.rings.map(r=>[r]));
    for(const pl of d1)dif+=A(pl[0]); for(const pl of d2)dif+=A(pl[0]);
   }catch(e){continue}
   const frac=dif/may;
   if(frac<0.25)continue;
   // PARPADEO: el salto se deshace en el tramo siguiente. Se compara el tramo
   // i con el i+2: si vuelve a parecerse, lo del medio fue un pestaneo.
   //
   // EL FALLO QUE ESTO ARREGLA, Y ERA MIO. La primera version hacia
   //     try{ ...calcular d3... }catch(e){}
   // con d3 inicializado a cero. Cuando `polygon-clipping` desborda la pila
   // -y lo hace con poligonos grandes: `cree_innu` con 327 grado2 lo tumba-
   // el catch se tragaba la excepcion, d3 se quedaba en 0, y CERO DIFERENCIA
   // significa "vuelve a parecerse". Es decir: **cada vez que la comparacion
   // fallaba, el caso se clasificaba como parpadeo**. De los 171 parpadeos que
   // dio la herramienta, la mayoria eran eso.
   //
   // La regla que queda escrita: **un fallo de calculo nunca puede convertirse
   // en un positivo.** Si no se puede comparar, no se sabe, y lo que no se sabe
   // va a la lista de juicio, no a la de defectos.
   let vuelve=false;
   if(i<ps.length-2){
    const w=ps[i+2];
    let d3=0, ok=true;
    try{ for(const pl of pc.difference(p.rings.map(r=>[r]), w.rings.map(r=>[r])))d3+=A(pl[0]);
         for(const pl of pc.difference(w.rings.map(r=>[r]), p.rings.map(r=>[r])))d3+=A(pl[0]); }
    catch(e){ ok=false }
    if(ok){
     const f3=d3/Math.max(aa, w.rings.reduce((s,r)=>s+A(r),0));
     if(f3 < frac*0.4) vuelve=true;
    }
   }
   const reg={id:c.id, corte:p.end, frac, area:may, dur:q.end-q.start,
              peso:dif*(q.end-q.start)};
   if(vuelve)parpadeos.push(reg); else saltos.push(reg);
  }
 }
}

const tabla=(t,v,n,cols)=>{
 console.log('\n'+t+': '+v.length+' | peso total '+Math.round(v.reduce((s,x)=>s+x.peso,0))+' grado2-anio');
 if(!v.length)return;
 console.log(cols);
 for(const x of v.sort((a,b)=>b.peso-a.peso).slice(0,n)) console.log(x._);
};

for(const e of efimeras) e._ = String(Math.round(e.peso)).padStart(9)+'  '+
  e.area.toFixed(3).padStart(8)+'  '+e.tramo.padEnd(14)+'  '+e.id.padEnd(26)+
  '['+e.pt.join(' ')+']';
for(const s of saltos) s._ = String(Math.round(s.peso)).padStart(9)+'  '+
  (100*s.frac).toFixed(0).padStart(4)+'%  '+String(s.corte).padStart(6)+'  '+
  s.id.padEnd(26)+'area '+s.area.toFixed(1);
for(const s of parpadeos) s._ = String(Math.round(s.peso)).padStart(9)+'  '+
  (100*s.frac).toFixed(0).padStart(4)+'%  '+String(s.corte).padStart(6)+'  '+
  s.id.padEnd(26)+'area '+s.area.toFixed(1);

console.log('periodos',periodos,'| piezas secundarias examinadas por encima de',MIN,'grado2:',piezasVistas);
tabla('BURBUJAS: piezas en TIERRA que no estan ni antes ni despues -- accidentes del tallado',
  efimeras, CUANTOS, '     peso      area  tramo           entidad                    punto');
// COMPANERA INSTANTANEA. El peso es area x duracion y por tanto lo dominan los
// tramos antiguos, que duran siglos: sin esta segunda lista una burbuja enorme
// de veinte anios queda enterrada bajo una pequena de mil. La regla del
// proyecto, ya escrita seis veces, es que ninguna metrica multiplicada por una
// unidad que otra herramienta manipula vale sola.
console.log('\n  las mismas burbujas ordenadas por AREA, sin multiplicar por duracion:');
console.log('      area  tramo           entidad                    punto');
for(const e of [...efimeras].sort((a,b)=>b.area-a.area).slice(0,Math.min(CUANTOS,15)))
 console.log('  '+e.area.toFixed(3).padStart(8)+'  '+e.tramo.padEnd(14)+'  '+e.id.padEnd(26)+'['+e.pt.join(' ')+']');
tabla('PARPADEOS: la figura cambia y vuelve en el tramo siguiente -- no es historia',
  parpadeos, CUANTOS, '     peso  cambia   corte  entidad                    ');
tabla('SALTOS: la figura cambia mucho de un tramo al siguiente y no vuelve -- juzgar',
  saltos, Math.min(CUANTOS,15), '     peso  cambia   corte  entidad                    ');
if(process.env.JSON) require('fs').writeFileSync(process.env.JSON,
  JSON.stringify({efimeras,parpadeos,saltos}));
