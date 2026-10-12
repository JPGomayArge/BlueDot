#!/usr/bin/env node
// CATALOGO EMPIRICO DE RECTAS. La ronda 27 demostro dos cosas: que contar
// PERIODOS mide el trabajo de parte.js y no el estado del mapa, y que el
// catalogo de nueve rayas coloniales -elegido a mano- dejaba fuera rectas
// mayores que ocho de las nueve. Rub al-Khali lat 20 sumaba 4.687 grado-anio y
// Tabuk lat 27 otros 7.270 sin estar en la lista.
//
// Esta herramienta no parte de una lista: recorre el mapa entero, agrupa los
// tramos rectos por (eje, valor redondeado a 0,25) y los ordena por GRADO-ANIO,
// que es invariante a que un periodo se parta en dos.
//
//   JSX=<mapa> node catalogo.js [ANTES_DE] [CUANTAS]
const L=require('./lib.js');
const T=require('./tierra.js');
const {CIV}=L.load(process.env.JSX);
const ANTES=+(process.argv[2]||1900);
const CUANTAS=+(process.argv[3]||30);
const MIN=+(process.env.MIN_LARGO||1.5), TOL=0.06;
function esMar(r){let t=0,n=0;const b=L.bb(r);
 for(let i=0;i<=5;i++)for(let j=0;j<=5;j++){
  const p=[b[0]+(b[1]-b[0])*i/5,b[2]+(b[3]-b[2])*j/5];
  if(!L.pip(p,r))continue;n++;if(T.enTierra(p))t++}
 return n&&t/n<0.15}
function tramos(r){const out=[];let i=0;
 while(i<r.length){
  let j=i,lat=r[i][1];
  while(j+1<r.length&&Math.abs(r[j+1][1]-lat)<=TOL)j++;
  if(j>i){const lg=Math.abs(r[j][0]-r[i][0]);
   if(lg>=MIN)out.push({eje:'lat',v:lat,lg,a:Math.min(r[i][0],r[j][0]),b:Math.max(r[i][0],r[j][0])})}
  let k=i,lon=r[i][0];
  while(k+1<r.length&&Math.abs(r[k+1][0]-lon)<=TOL)k++;
  if(k>i){const lg=Math.abs(r[k][1]-r[i][1]);
   if(lg>=MIN)out.push({eje:'lon',v:lon,lg,a:Math.min(r[i][1],r[k][1]),b:Math.max(r[i][1],r[k][1])})}
  i+=Math.max(1,Math.max(j,k)-i)}
 return out}
const G=new Map();
for(const c of CIV)for(const p of c.periods){
 if(p.end>ANTES)continue;
 const dur=Math.max(1,p.end-p.start);
 for(const r of p.rings){
  if(r.length<4||esMar(r))continue;
  for(const t of tramos(r)){
   const k=t.eje+' '+(Math.round(t.v*4)/4).toFixed(2);
   if(!G.has(k))G.set(k,{ga:0,ents:new Map(),lgMax:0,ext:[9e9,-9e9],per:0});
   const g=G.get(k);
   g.ga+=t.lg*dur; g.per++;
   g.lgMax=Math.max(g.lgMax,t.lg);
   g.ext[0]=Math.min(g.ext[0],t.a); g.ext[1]=Math.max(g.ext[1],t.b);
   g.ents.set(c.id,(g.ents.get(c.id)||0)+t.lg*dur);
  }}}
const filas=[...G].sort((a,b)=>b[1].ga-a[1].ga).slice(0,CUANTAS);
console.log('rectas anteriores a',ANTES,'ordenadas por grado-anio\n');
console.log('recta'.padEnd(12),'grado-anio'.padStart(11),'  tramo max  extension          entidades principales');
for(const [k,g] of filas){
 const top=[...g.ents].sort((a,b)=>b[1]-a[1]).slice(0,4)
   .map(([id,v])=>id+' '+Math.round(v)).join(', ');
 console.log(k.padEnd(12),Math.round(g.ga).toString().padStart(11),
  ' ',g.lgMax.toFixed(1).padStart(5),
  ' ',(g.ext[0].toFixed(1)+' a '+g.ext[1].toFixed(1)).padEnd(16),' ',top);
}
const tot=[...G.values()].reduce((s,g)=>s+g.ga,0);
console.log('\ngrupos',G.size,'| grado-anio total',Math.round(tot),
 '| en las',CUANTAS,'primeras',Math.round(filas.reduce((s,[,g])=>s+g.ga,0)),
 '('+Math.round(filas.reduce((s,[,g])=>s+g.ga,0)/tot*100)+'%)');
