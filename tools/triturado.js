#!/usr/bin/env node
// DETECTOR DE TRITURADO POR TALLADO.
//
// Por que existe. Cuatro de los hallazgos mayores de las rondas 27 y 28 -la
// Tierra de Rupert, Groenlandia, `beduinos_arabia` en 1744 y el Artico
// canadiense- se encontraron todos a ojo, mirando la misma firma:
//
//     EL AREA CAE Y EL NUMERO DE ANILLOS SUBE.
//
// Eso no es un rediseno. Cuando alguien redibuja un territorio, el area cambia y
// los anillos se quedan mas o menos igual. Cuando una entidad es TALLADA contra
// un vecino que se le ha echado encima, el poligono se parte en trozos: pierde
// area y gana anillos a la vez. Si ademas la entidad recupera el area unas fases
// mas tarde, ya no es interpretacion historica sino dano de proceso.
//
//   inuit             1380..1658  area 1382 (138 anillos)
//                     1658..1670  area  722 (167)   -48% y +21% de anillos
//   artico_canadiense 1670..1763  area  126 (24)
//                     1763..1783  area   25 (100)   -80% y +317%
//   alaska_oeste      1763..1783  area 14,3 (6)
//                     1783..1799  area 0,00 (7)     entidad reducida a polvo
//
// La herramienta busca esa firma en todo el mapa y ordena por gravedad. No
// afirma que haya error: afirma que hay que mirar. Un pueblo PUEDE perder
// territorio de verdad -y entonces suele perder anillos tambien, o mantenerlos-.
//
//   JSX=<mapa> node triturado.js [CAIDA_MINIMA] [CUANTOS]
//
// CAIDA_MINIMA es la fraccion de area perdida que se considera sospechosa (0.35
// por defecto). Se exige ademas que los anillos NO bajen.
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
const CAIDA=+(process.argv[2]||0.35), CUANTOS=+(process.argv[3]||30);
const filas=[];
for(const c of CIV){
 const ps=c.periods;
 for(let i=1;i<ps.length;i++){
  const a0=ps[i-1].rings.reduce((s,r)=>s+L.rA(r),0);
  const a1=ps[i].rings.reduce((s,r)=>s+L.rA(r),0);
  if(a0<1)continue;
  const n0=ps[i-1].rings.length, n1=ps[i].rings.length;
  const perd=(a0-a1)/a0;
  if(perd<CAIDA)continue;
  if(n1<n0)continue;                 // menos anillos: es rediseno, no triturado
  // se recupera despues? entonces es dano de proceso casi seguro
  let recup=null;
  for(let j=i+1;j<ps.length;j++){
   const aj=ps[j].rings.reduce((s,r)=>s+L.rA(r),0);
   if(aj>=a0*0.85){recup=ps[j].start+'..'+ps[j].end;break}
  }
  filas.push({id:c.id,k:c.kind,per:ps[i].start+'..'+ps[i].end,
    a0,a1,n0,n1,perd,recup,
    peso:(a0-a1)*(1+(n1-n0)/Math.max(1,n0))*(recup?2:1)});
 }
}
filas.sort((x,y)=>y.peso-x.peso);
console.log('caida de area >=',(CAIDA*100).toFixed(0)+'% sin perder anillos:',filas.length,'casos\n');
console.log('entidad'.padEnd(22),'periodo'.padEnd(14),'area'.padStart(16),'  anillos'.padEnd(12),'perdida  se recupera en');
for(const f of filas.slice(0,CUANTOS))
 console.log(f.id.padEnd(22),f.per.padEnd(14),
  (f.a0.toFixed(1)+' -> '+f.a1.toFixed(1)).padStart(16),
  ('  '+f.n0+' -> '+f.n1).padEnd(12),
  (f.perd*100).toFixed(0)+'%'.padEnd(3),'  ',f.recup||'-');
console.log('\nde los',filas.length,'casos,',filas.filter(f=>f.recup).length,
 'recuperan el area despues: esos son dano de proceso casi seguro.');
