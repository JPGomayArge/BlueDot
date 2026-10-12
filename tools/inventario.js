#!/usr/bin/env node
// INVENTARIO DE HUECOS DE LA CAPA DE CIVILIZACIONES.
//
// El objetivo del mapa es que la capa de civilizaciones CUBRA LA TIERRA ENTERA
// en toda la linea del tiempo, sin huecos y sin solapes. `dobles_exacto2.js` mide
// los solapes; esto mide los huecos, y sobre todo los ORDENA EN UNA LISTA DE
// TRABAJO.
//
// Un hueco suelto no dice nada: puede ser un pixel de agua de la mascara, una
// costura entre dos poligonos que acaban en el mismo paralelo, o un desierto que
// de verdad no era de nadie. Lo que si dice algo es un hueco que PERSISTE: la
// misma comarca vacia durante siglos es una entidad que falta o un contorno que
// no llega.
//
// Asi que se muestrea la tierra en varios cortes temporales, se agrupan las
// celdas vacias por vecindad geografica, y se informa de cada grupo con:
//   - cuantas celdas ocupa y donde
//   - EN CUANTOS CORTES esta vacio (la persistencia)
//   - quien pinta alrededor, que es la pista de quien deberia rellenarlo
//
//   JSX=<mapa> node inventario.js [PASO] [DESDE] [HASTA] [CUANTOS]
const L=require('./lib.js');
const T=require('./tierra.js');
const {CIV}=L.load(process.env.JSX);
const PASO=+(process.argv[2]||2);
const DESDE=+(process.argv[3]||-4000), HASTA=+(process.argv[4]||2000);
const CUANTOS=+(process.argv[5]||25);

// TIERRA QUE LEGITIMAMENTE NO ES DE NADIE.
//
// El objetivo del mapa NO es que no haya huecos: es que haya hueco EXACTAMENTE
// donde no habia nadie. Rellenar una isla deshabitada es tan falso como dejar en
// blanco una llanura poblada. El registro vive en `vacios.js`, con la razon
// escrita de cada entrada para que se pueda comprobar y discutir; aqui solo se
// consulta.
const V=require('./vacios.js');
const legitimo=(pt,A)=>V.legitimo(pt,A);

const TODOS=[-4000,-3000,-2000,-1500,-1000,-500,-200,1,200,500,800,1000,1200,
             1400,1500,1600,1700,1800,1850,1900,1950,2000];
const ANIOS=TODOS.filter(a=>a>=DESDE&&a<=HASTA);

const rej=[];
for(let x=-180;x<180;x+=PASO)for(let y=-56;y<=78;y+=PASO){
 const p=[+x.toFixed(2),+y.toFixed(2)];if(T.enTierra(p))rej.push(p)}
const vivos=ANIOS.map(A=>CIV.map(c=>({c,p:c.periods.find(p=>p.start<=A&&p.end>A)})).filter(x=>x.p));
// para cada celda: en cuantos cortes esta vacia, y quien la pinta cuando no
const vacio=new Map(), duenos=new Map();
rej.forEach((pt,i)=>{
 let n=0; const d=new Set();
 for(let k=0;k<ANIOS.length;k++){
  let q=null;
  for(const {c,p} of vivos[k]) if(L.has(p.rings,pt)){q=c.id;break}
  if(q)d.add(q); else if(!legitimo(pt,ANIOS[k]))n++;
 }
 if(n)vacio.set(i,n);
 duenos.set(i,d);
});
// agrupar por vecindad las celdas que estan vacias en algun corte
const idx=[...vacio.keys()], usado=new Set(), grupos=[];
for(const i of idx){
 if(usado.has(i))continue;
 const g=[i]; usado.add(i);
 for(let k=0;k<g.length;k++){
  const a=rej[g[k]];
  for(const j of idx){
   if(usado.has(j))continue;
   const b=rej[j];
   if(Math.abs(a[0]-b[0])<=PASO*1.4&&Math.abs(a[1]-b[1])<=PASO*1.4){g.push(j);usado.add(j)}
  }}
 grupos.push(g);
}
// peso: celdas por cortes vacios, que es "celda-corte" de hueco
const filas=grupos.map(g=>{
 const cc=g.reduce((s,i)=>s+vacio.get(i),0);
 const pts=g.map(i=>rej[i]);
 const b=[Math.min(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[0])),
          Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[1]))];
 const vec=new Map();
 for(const i of g)for(const d of duenos.get(i))vec.set(d,(vec.get(d)||0)+1);
 return {n:g.length,cc,b,med:cc/g.length,
   vec:[...vec].sort((x,y)=>y[1]-x[1]).slice(0,4).map(([k])=>k).join(', ')||'nadie, nunca'};
});
filas.sort((a,b)=>b.cc-a.cc);
const totalCC=filas.reduce((s,f)=>s+f.cc,0);
console.log('paso',PASO,'| cortes',ANIOS.length,'('+ANIOS[0]+' a '+ANIOS[ANIOS.length-1]+')',
            '| celdas de tierra',rej.length);
console.log('(descontada la tierra legitimamente vacia: islas deshabitadas y Antartida)');
console.log('HUECO TOTAL:',totalCC,'celda-corte de',rej.length*ANIOS.length,
            '('+(totalCC/(rej.length*ANIOS.length)*100).toFixed(1)+'%) en',filas.length,'grupos\n');
console.log('celdas  cortes  medio  caja'.padEnd(46),'quien pinta alrededor');
for(const f of filas.slice(0,CUANTOS))
 console.log(String(f.n).padStart(5),String(f.cc).padStart(7),f.med.toFixed(1).padStart(7),'  ',
  (f.b[0].toFixed(0)+'..'+f.b[1].toFixed(0)+' / '+f.b[2].toFixed(0)+'..'+f.b[3].toFixed(0)).padEnd(22),
  f.vec);
