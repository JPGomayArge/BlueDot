#!/usr/bin/env node
// CUANTO MAR HAY PINTADO COMO TIERRA.
//
// La ronda 28 encontro que `recorte.aTierra` devolvia el poligono SIN RECORTAR
// cuando la interseccion con la costa no daba nada -es decir, justo cuando el
// poligono estaba entero en el mar-. Una caja sobre el golfo de Vizcaya volvia
// con 12 grados cuadrados de oceano. El fallo estuvo activo toda la campana, de
// modo que cualquier poligono mal dibujado que cayera en agua entro entero.
//
// Esta herramienta mide el danio: muestrea el interior de cada anillo y cuenta
// que fraccion cae en agua segun la mascara. Excluye los anillos que son
// convencion de archipielago -casi todo mar a proposito- solo informando de
// ellos aparte, porque ahi el mar es deliberado.
//
//   JSX=<mapa> node mar.js [MIN_AREA] [CUANTOS]
const L=require('./lib.js');const T=require('./tierra.js');
const {CIV}=L.load(process.env.JSX);
const MIN=+(process.argv[2]||1), CUANTOS=+(process.argv[3]||25);
const N=12;
const filas=[];let areaTot=0,areaMar=0;
for(const c of CIV){
 const vis=new Set();
 for(const p of c.periods)for(const r of p.rings){
  const a=Math.abs(L.rA(r)); if(a<MIN)continue;
  const b=L.bb(r); const f=b.map(v=>v.toFixed(2)).join(',')+':'+r.length;
  if(vis.has(f))continue; vis.add(f);
  let dentro=0,agua=0;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){
   const q=[b[0]+(b[1]-b[0])*(i+0.5)/N, b[2]+(b[3]-b[2])*(j+0.5)/N];
   if(!L.pip(q,r))continue; dentro++; if(!T.enTierra(q))agua++;
  }
  if(!dentro)continue;
  const fr=agua/dentro; areaTot+=a; areaMar+=a*fr;
  if(fr>=0.5)filas.push({id:c.id,per:p.start+'..'+p.end,a,fr,caja:b});
 }
}
filas.sort((x,y)=>y.a*y.fr-x.a*x.fr);
console.log('anillos de area >=',MIN,'con la mitad o mas de su interior en agua:',filas.length,'\n');
console.log('entidad'.padEnd(24),'periodo'.padEnd(14),'area'.padStart(8),' agua  caja');
for(const f of filas.slice(0,CUANTOS))
 console.log(f.id.padEnd(24),f.per.padEnd(14),f.a.toFixed(1).padStart(8),
  ' '+(f.fr*100).toFixed(0)+'%  ',f.caja.map(v=>v.toFixed(1)).join(' '));
console.log('\narea muestreada',areaTot.toFixed(0),'grado2 | estimada en agua',areaMar.toFixed(0),
 '('+(areaMar/areaTot*100).toFixed(1)+'%)');
console.log('AVISO: los archipielagos se pintan con rectangulos de mar A PROPOSITO.');
