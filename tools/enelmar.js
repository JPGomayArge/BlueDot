#!/usr/bin/env node
// CUANTO MAR ABIERTO PINTA EL MAPA COMO TERRITORIO.
//
// ESTA MEDIDA LA DI POR IMPOSIBLE Y ME EQUIVOQUE. En la cabecera de
// `fidelidad.js` escribi, para justificar que no la hacia:
//
//   "aqui NO se mide 'cuanto mar hay dentro' -siempre cero- porque todo
//    poligono del mapa pasa por `recorte.aTierra`, asi que por construccion
//    ninguno puede contener mar."
//
// Es falso, y de la peor manera: **no es que la medida fuera trivial, es que yo
// no la habia comprobado.** `aTierra` garantiza que lo que PASA POR ELLA queda
// recortado; no dice nada de los anillos que se dibujaron antes de que existiera
// la herramienta, ni de los que entraron por vias que no la llaman. La ronda 40
// midio 38 anillos, los encontro al 0% de agua y generalizo a 135.000.
//
// El contraejemplo se veia a simple vista en cuanto hubo con que mirar: en la
// hoja de contacto de Oceania hay **un cuadrado rojo perfecto flotando en el
// Pacifico abierto** desde el ano 1 hasta 1850. Es `pacifico_nz`: 152 grados
// cuadrados, ocho vertices, 100% agua. No es el unico -son 256 anillos de mas
// de un grado cuadrado con mas de la mitad en agua-, y en 1500 el 2,7% de todo
// lo que el mapa pinta es oceano.
//
// LA REGLA QUE QUEDA: *una construccion no demuestra una propiedad; la
// demuestra una medida.* Si una herramienta garantiza algo, hay que comprobar
// que todo el dato ha pasado por ella, y eso es otra medida distinta.
//
// LAGO NO ES MAR. La mascara de tierra trata igual el Caspio y el Pacifico: los
// dos son "no tierra". Pero un pais SI incluye sus lagos, asi que contarlos como
// error inflaria la cifra con casos legitimos. Un punto que cae dentro del
// contorno exterior de una pieza de tierra pero en uno de sus huecos es un lago;
// uno que no cae en ninguna pieza es mar abierto. Medido asi, de las 1.563
// celdas pintadas sobre agua en 1500, **1.559 son mar abierto y 4 son lago**:
// la distincion no cambia el resultado, pero sin hacerla el numero no valdria.
//
//   JSX=<mapa> node enelmar.js [anio,anio,...]
//   ANILLOS=1 lista los anillos concretos en vez de las celdas por entidad
const L=require('./lib.js');
const T=require('./tierra.js');
const {CIV}=L.load(process.env.JSX);
const ANIOS=(process.argv[2]||'1,1000,1500,1800,1900,2000').split(',').map(Number);

function clase(pt){
 for(const z of T.PLANO){
  let dentro=false;
  for(const f of z.fuera){ const b=f.b;
   if(pt[0]<b[0]||pt[0]>b[1]||pt[1]<b[2]||pt[1]>b[3])continue;
   if(L.pip(pt,f.r)){dentro=true;break} }
  if(!dentro)continue;
  for(const h of z.huecos){ const b=h.b;
   if(pt[0]<b[0]||pt[0]>b[1]||pt[1]<b[2]||pt[1]>b[3])continue;
   if(L.pip(pt,h.r))return 'lago' }
  return 'tierra';
 }
 return 'mar';
}
const bbDe=rs=>rs.reduce((a,r)=>{const b=L.bb(r);
 return [Math.min(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.max(a[3],b[3])]},[9e9,-9e9,9e9,-9e9]);

if(process.env.ANILLOS){
 // Los anillos concretos, una sola vez cada uno: es la lista de trabajo.
 const vistos=new Set(), malos=[];
 for(const c of CIV)for(const p of c.periods)for(const r of p.rings){
  const a=Math.abs(L.rA(r)); if(a<1)continue;
  const b=L.bb(r);
  const k=c.id+'|'+b.map(v=>v.toFixed(2)).join(',')+'|'+r.length;
  if(vistos.has(k))continue; vistos.add(k);
  let n=0,agua=0;
  const paso=Math.max(0.08,Math.sqrt(a)/10);
  for(let x=b[0];x<=b[1];x+=paso)for(let y=b[2];y<=b[3];y+=paso){
   const pt=[x,y]; if(!L.pip(pt,r))continue; n++; if(clase(pt)==='mar')agua++ }
  if(n>=10&&agua/n>0.5)malos.push({id:c.id,start:p.start,a,f:agua/n,b,v:r.length});
 }
 malos.sort((x,y)=>y.a-x.a);
 console.log('anillos unicos de mas de 1 grado2 con mas de la mitad en MAR ABIERTO: '+malos.length+'\n');
 console.log('entidad                   desde    area   vert  agua   caja');
 for(const x of malos.slice(0,60))
  console.log(x.id.padEnd(24)+String(x.start).padStart(7)+x.a.toFixed(1).padStart(8)+
   String(x.v).padStart(6)+(100*x.f).toFixed(0).padStart(6)+'%  lon '+
   x.b[0].toFixed(1)+'..'+x.b[1].toFixed(1)+' lat '+x.b[2].toFixed(1)+'..'+x.b[3].toFixed(1));
} else {
 console.log('anio    mar abierto   lago   % de lo pintado   principales');
 for(const A of ANIOS){
  const viv=[];
  for(const c of CIV){ const p=c.periods.find(p=>p.start<=A&&p.end>A);
   if(p&&p.rings.length)viv.push({c,p,b:bbDe(p.rings)}) }
  let mar=0,lago=0,tierra=0; const quien={};
  for(let x=-180;x<180;x+=0.5)for(let y=-56;y<=78;y+=0.5){
   const pt=[+x.toFixed(2),+y.toFixed(2)];
   const k=clase(pt);
   for(const o of viv){ if(pt[0]<o.b[0]||pt[0]>o.b[1]||pt[1]<o.b[2]||pt[1]>o.b[3])continue;
    if(L.has(o.p.rings,pt)){
     if(k==='tierra')tierra++; else if(k==='lago')lago++;
     else {mar++; quien[o.c.id]=(quien[o.c.id]||0)+1}
     break } }
  }
  console.log(String(A).padStart(6)+String(mar).padStart(13)+String(lago).padStart(7)+
   (100*mar/(mar+lago+tierra)).toFixed(1).padStart(14)+'%   '+
   Object.entries(quien).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>k+' '+v).join(', '));
 }
}
