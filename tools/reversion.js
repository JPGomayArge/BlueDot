#!/usr/bin/env node
// DETECTOR DE REVERSIONES DE COBERTURA.
//
// Por que existe. Al medir el mapa entero por regiones aparecio algo que no
// puede ser historico: hay sitios donde el mapa EMPEORA al avanzar en el
// tiempo. Asia Oriental esta al 12% de suelo sin dueno en el ano 1 y al 30% en
// el 1000. Oriente Medio, al 7% en el 1000 y al 18% en el 1500. Sudamerica no
// mejora nunca.
//
// Un hueco antiguo puede ser ignorancia legitima: no sabemos quien vivia alli.
// Pero un hueco que APARECE donde antes habia dueno no es ignorancia, es un
// arco que se apaga sin relevo. Es el mismo defecto que la ronda 31 encontro en
// Siberia -`evenkos` terminaba en 1822 y el mapa se vaciaba- y en Tanganica
// -`grandes_lagos_africa` terminaba en 1850-, pero buscado al reves: en vez de
// mirar entidades, se mira el SUELO y se pregunta quien lo tenia y lo perdio.
//
//   JSX=<mapa> node reversion.js [PASO] [CUANTOS]
//
// Para cada celda de tierra se recorre la linea del tiempo. Cuando una celda
// pasa de tener dueno a no tenerlo, se anota el ano y QUIEN ERA EL ULTIMO
// DUENO. Se agrupa por ese ultimo dueno: la entidad que mas veces aparece es la
// que mas suelo esta dejando huerfano al morir.
const L=require('./lib.js');
const T=require('./tierra.js');
const {CIV}=L.load(process.env.JSX);
const PASO=+(process.argv[2]||3), CUANTOS=+(process.argv[3]||25);
const ANIOS=[-4000,-3000,-2000,-1500,-1000,-500,-200,1,200,500,800,1000,1200,
             1400,1500,1600,1700,1800,1850,1900,1950,2000];
const rej=[];
for(let x=-180;x<180;x+=PASO)for(let y=-56;y<=78;y+=PASO){
 const p=[+x.toFixed(2),+y.toFixed(2)];if(T.enTierra(p))rej.push(p)}
// indice: para cada anio, un mapa de entidades vivas
const vivos=ANIOS.map(A=>CIV.map(c=>({c,p:c.periods.find(p=>p.start<=A&&p.end>A)}))
                          .filter(x=>x.p));
const culpa=new Map();     // ultimo dueno -> {celdas, anios:Map}
let total=0;
for(const pt of rej){
 let ant=null;
 for(let i=0;i<ANIOS.length;i++){
  let q=null;
  for(const {c,p} of vivos[i]) if(L.has(p.rings,pt)){q=c.id;break}
  if(ant && !q){                       // tenia dueno y lo perdio
   total++;
   if(!culpa.has(ant))culpa.set(ant,{n:0,anios:new Map(),pts:[]});
   const g=culpa.get(ant); g.n++;
   const k=ANIOS[i-1]+' -> '+ANIOS[i];
   g.anios.set(k,(g.anios.get(k)||0)+1);
   if(g.pts.length<3)g.pts.push(pt);
  }
  ant=q;
 }
}
const filas=[...culpa].sort((a,b)=>b[1].n-a[1].n);
console.log('celdas de tierra',rej.length,'| paso',PASO,'grados | cortes',ANIOS.length);
console.log('REVERSIONES (celda que tenia dueno y deja de tenerlo):',total,'\n');
console.log('ultimo dueno'.padEnd(26),'celdas','  tramo principal'.padEnd(22),'ejemplo');
for(const [id,g] of filas.slice(0,CUANTOS)){
 const top=[...g.anios].sort((a,b)=>b[1]-a[1])[0];
 console.log(id.padEnd(26),String(g.n).padStart(5),'  ',(top[0]+' ('+top[1]+')').padEnd(22),
  JSON.stringify(g.pts[0]));
}
console.log('\nentidades que dejan suelo huerfano:',filas.length);
