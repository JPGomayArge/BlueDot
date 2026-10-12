#!/usr/bin/env node
// EL SOLAPE QUE SE VE.
//
// `dobles_exacto2.js` mide grado2-ANIO: area por anios. Es la metrica correcta
// para priorizar trabajo, pero tiene el mismo sesgo que ya enganio dos veces a
// esta campana -contar periodos en la ronda 27, contar vertices en la 28-:
// multiplica por duracion, asi que una entidad de arco largo pesa mucho aunque
// su solape sea invisible. Un solape de 0,004 grados2 -medio pixel a 1:50
// millones- durante 3.000 anios da 12 grado2-anio y no se ve en el globo.
//
// Esto mide lo otro: EL AREA MAXIMA QUE SE SOLAPA EN UN INSTANTE. Es lo que de
// verdad responde a "se pisan dos civilizaciones en el mapa". Sin tope de pares.
//
//   JSX=<mapa> node solape_max.js [MINIMO]
const pc=require('polygon-clipping');
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
const MIN=+(process.argv[2]||0.02);
// cortes: todos los inicios de periodo distintos
// Muestrear todos los inicios de periodo son ~4.000 cortes y no termina. Se
// muestrea una rejilla temporal densa pero acotada, que basta para encontrar
// cualquier solape que dure mas de unas decadas.
const PASO=+(process.env.PASO||50);
const cortes=[];for(let a=-4000;a<=2020;a+=PASO)cortes.push(a);
const filas=[];
let n=0;
for(const A of cortes){
 const vivos=[];
 for(const c of CIV){const p=c.periods.find(p=>p.start<=A&&p.end>A);
  if(p&&p.rings.length)vivos.push({id:c.id,p,b:p.rings.reduce((acc,r)=>{
   const bb=L.bb(r);return [Math.min(acc[0],bb[0]),Math.max(acc[1],bb[1]),
                            Math.min(acc[2],bb[2]),Math.max(acc[3],bb[3])]},[9e9,-9e9,9e9,-9e9])})}
 for(let i=0;i<vivos.length;i++)for(let j=i+1;j<vivos.length;j++){
  const a=vivos[i],b=vivos[j];
  if(a.b[1]<b.b[0]||b.b[1]<a.b[0]||a.b[3]<b.b[2]||b.b[3]<a.b[2])continue;
  n++;
  let inter;try{inter=pc.intersection(a.p.rings.map(r=>[r]),b.p.rings.map(r=>[r]))}catch(e){continue}
  if(!inter||!inter.length)continue;
  const ar=inter.reduce((s,poly)=>s+Math.abs(L.rA(poly[0])),0);
  if(ar>=MIN)filas.push({A,a:a.id,b:b.id,ar});
 }
}
filas.sort((x,y)=>y.ar-x.ar);
console.log('cortes examinados',cortes.length,'| pares con cajas que se cruzan',n);
console.log('SOLAPES DE AREA >=',MIN,'grados2 EN ALGUN INSTANTE:',filas.length,'\n');
console.log('area'.padStart(8),'  anio'.padEnd(8),'entidades');
for(const f of filas.slice(0,30))
 console.log(f.ar.toFixed(3).padStart(8),' ',String(f.A).padStart(6),' ',f.a,'/',f.b);
if(!filas.length)console.log('  ninguno: no hay dos civilizaciones que se pisen en area visible.');
console.log('\nmayor solape instantaneo del mapa:',filas.length?filas[0].ar.toFixed(3)+' grados2':'0');
