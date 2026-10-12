#!/usr/bin/env node
// SONDA DE PLAZAS-TESTIGO.
//
// Por que existe. Las diecinueve primeras rondas verificaron ENTIDAD POR
// ENTIDAD: se mira una civilizacion, se leen sus fases y se juzga si su
// territorio es correcto. Ese metodo tiene un punto ciego estructural, y la
// ronda 19 lo demostro con dos casos que llevaban toda la campana escondidos:
//
//   - `venice` parecia impecable mirandola sola. Lo que fallaba es que el
//     Ducado de Atenas tenia un anillo intruso sobre Eubea, y al tallar partia
//     a Venecia en dos. El error no estaba en ninguna de las dos entidades:
//     estaba en la RELACION entre ellas.
//   - `ethiopia` tenia el rotulo correcto -"Ocupacion italiana dentro del
//     Africa Oriental Italiana"- y la geometria contradiciendolo. Quien revisa
//     una entidad sola lee el rotulo y le da la razon.
//
// Esta herramienta pregunta al reves: no "que territorio tiene esta entidad"
// sino "QUIEN GOBERNABA ESTA PLAZA EN ESTOS ANIOS". Una ciudad disputada
// sondeada en diez fechas revela de golpe los huecos, los solapes y los
// anacronismos de todos los vecinos a la vez.
//
//   JSX=<mapa> node plazas.js <lista.js> [--csv]
//
//   lista.js:  module.exports = [
//     { nombre:'Nauplia', lon:22.85, lat:37.60,
//       anios:[1250,1400,1480,1560],
//       espera:{1250:'acaya', 1400:'venice', 1480:'venice', 1560:'ottoman'} },  // opcional
//     ...]
//
// `espera` es opcional. Si se da, la sonda marca las discrepancias con !!; si
// no, solo informa de quien pinta y deja el juicio historico a quien lea.
//
// LA TRAMPA DEL PIXEL DE AGUA. A 1:50 millones hay ciudades reales que caen en
// agua: Estambul, Copenhague, Goa, Mahdia, Dubai, Manhattan, Corfu, Modon,
// Mogadiscio, Kismaayo. Un puerto que sale VACIO casi nunca es un hueco: es la
// resolucion de la malla. De los siete huecos revisados en la ronda 19, CUATRO
// eran esto. Asi que la sonda comprueba `enTierra` en cada plaza y, si el punto
// es agua, lo dice y busca automaticamente el punto de tierra mas cercano en
// una espiral de hasta 0.5 grados, sondeando ese en su lugar. Nadie deberia
// volver a perder una tarde con un puerto.
const L=require('./lib.js');
const T=require('./tierra.js');
const {CIV}=L.load(process.env.JSX);
const LISTA=require(require('path').resolve(process.argv[2]));
const CSV=process.argv.includes('--csv');

// Busca tierra alrededor de un punto que cae en agua. Espiral cuadrada de paso
// creciente; devuelve el primer punto en tierra o null.
function tierraCerca(lon,lat){
 for(let r=0.05;r<=0.5;r+=0.05)
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
   if(!dx&&!dy)continue;
   const p=[+(lon+dx*r).toFixed(3),+(lat+dy*r).toFixed(3)];
   if(T.enTierra(p))return p;
  }
 return null;
}

function quien(pt,anio){
 const out=[];
 for(const c of CIV){
  const p=c.periods.find(p=>p.start<=anio&&p.end>anio);
  if(!p)continue;
  if(L.has(p.rings,pt))out.push(c.id);
 }
 return out;
}

// SEGUNDA TRAMPA, encontrada por el lote F de la ronda 20 y mas frecuente que
// la del pixel de agua: un punto que SI es tierra segun la mascara y que aun
// asi no lo pinta nadie, porque los anillos de las civilizaciones estan mas
// generalizados que la costa. En el lote F solo 2 plazas de 41 eran pixel de
// agua, pero 15 eran esto: Quebec, Montreal, Nueva York, Veracruz, La Habana,
// Montevideo, Sitka, Suva, Apia, Numea, Auckland. Todas se resolvian moviendose
// una decima de grado.
//
// Si se cuentan como huecos, el informe se llena de falsos positivos y quien
// aplique se pasa la tarde persiguiendo fantasmas. Pero tampoco se pueden
// ignorar: un punto interior sin nadie SI es un hueco real. La diferencia es si
// hay alguien pintando al lado. Asi que cuando un punto en tierra sale vacio se
// mira un anillo de vecinos a 0.1 y 0.2 grados: si todos los que pintan dicen
// lo mismo, es generalizacion del contorno y se informa con ~; si tampoco pinta
// nadie alrededor, es hueco de verdad y se informa con ··.
function cerca(pt,anio){
 for(const r of [0.1,0.2,0.3]){
  const votos={};
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
   if(!dx&&!dy)continue;
   const q=quien([+(pt[0]+dx*r).toFixed(3),+(pt[1]+dy*r).toFixed(3)],anio);
   if(q.length===1)votos[q[0]]=(votos[q[0]]||0)+1;
  }
  const cs=Object.keys(votos);
  if(cs.length===1)return {id:cs[0],r};        // acuerdo limpio alrededor
  if(cs.length>1){                              // varios: se toma el mayoritario
   cs.sort((a,b)=>votos[b]-votos[a]);
   if(votos[cs[0]]>votos[cs[1]])return {id:cs[0],r,dudoso:true};
  }
 }
 return null;
}

const filas=[];
let discrepancias=0, vacios=0, solapes=0, movidas=0, borde=0;

for(const pl of LISTA){
 let pt=[pl.lon,pl.lat], nota='';
 if(!T.enTierra(pt)){
  const alt=tierraCerca(pl.lon,pl.lat);
  if(alt){pt=alt;nota=' (pixel de agua: sondeado en '+alt.join('/')+')';movidas++}
  else {nota=' (PIXEL DE AGUA y sin tierra a 0.5 grados: no se puede sondear)';}
 }
 for(const anio of pl.anios){
  let q=quien(pt,anio);
  const esp=pl.espera?pl.espera[anio]:undefined;
  let marca='  ', sufijo='';
  if(q.length===0){
   const v=cerca(pt,anio);
   if(v){q=[v.id];borde++;marca='~~';sufijo=' (contorno generalizado: pinta a '+v.r+' grados'+(v.dudoso?', vecindad no unanime':'')+')'}
   else {vacios++;marca='··'}
  }
  if(q.length>1){solapes++;marca='=='}
  if(esp!==undefined){
   const ok = q.length===1 ? q[0]===esp : (esp===''&&q.length===0);
   if(!ok){discrepancias++;marca='!!'}
  }
  filas.push({marca,nombre:pl.nombre+nota,anio,pinta:(q.join('+')||'VACIO')+sufijo,espera:esp===undefined?'':esp});
 }
}

if(CSV){
 console.log('marca,plaza,anio,pinta,espera');
 for(const f of filas)console.log([f.marca.trim(),JSON.stringify(f.nombre),f.anio,f.pinta,f.espera].join(','));
}else{
 let ult='';
 for(const f of filas){
  const cab = f.nombre!==ult ? f.nombre : '';
  ult=f.nombre;
  console.log(f.marca,cab.padEnd(34).slice(0,34),String(f.anio).padStart(6),
              ' ',f.pinta.padEnd(28).slice(0,28), f.espera?('esperado: '+f.espera):'');
 }
}
console.log('\nplazas',LISTA.length,'| sondeos',filas.length,
            '| discrepancias !!',discrepancias,'| huecos reales ··',vacios,
            '| contorno generalizado ~~',borde,
            '| solapes ==',solapes,'| movidas por pixel de agua',movidas);
