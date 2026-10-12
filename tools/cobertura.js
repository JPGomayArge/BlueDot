#!/usr/bin/env node
// COBERTURA DE LA CAPA DE CIVILIZACIONES, con el registro de vacios como unica
// fuente de verdad.
//
// Sustituye al viejo `queda.js`, que llevaba su propia lista de desiertos
// codificada a mano y por tanto se quedaba desfasada cada vez que `vacios.js`
// se corregia -siete veces entre las rondas 35 y 37-. Aqui no hay lista propia:
// se pregunta al registro.
//
//   JSX=<mapa> node cobertura.js [PASO]
const L=require('./lib.js');
const T=require('./tierra.js');
const V=require('./vacios.js');
const {CIV}=L.load(process.env.JSX);
const PASO=+(process.argv[2]||2);
const rej=[];
for(let x=-180;x<180;x+=PASO)for(let y=-56;y<=78;y+=PASO){
 const p=[+x.toFixed(2),+y.toFixed(2)];if(T.enTierra(p))rej.push(p)}
const ANIOS=[-3000,-2000,-1000,1,500,1000,1500,1700,1900,2000];
console.log('celdas de tierra',rej.length,'| paso',PASO,'grados');
console.log('registro de vacio deliberado:',V.TODO.length,'entradas\n');
console.log('anio     vacio   legitimo   HUECO REAL   % real');
let sr=0,st=0;
for(const A of ANIOS){
 const vivos=CIV.map(c=>c.periods.find(p=>p.start<=A&&p.end>A)).filter(Boolean);
 let v=0,leg=0;
 for(const pt of rej){let q=false;
  for(const p of vivos) if(L.has(p.rings,pt)){q=true;break}
  if(!q){v++; if(V.legitimo(pt,A))leg++}}
 const real=v-leg; sr+=real; st+=rej.length;
 console.log(String(A).padStart(6),String(v).padStart(9),String(leg).padStart(10),
  String(real).padStart(12),'   '+(real/rej.length*100).toFixed(1)+'%');
}
console.log('\nHUECO REAL ACUMULADO:',sr,'celda-corte de',st,
 '('+(sr/st*100).toFixed(1)+'%)');
