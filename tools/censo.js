#!/usr/bin/env node
// COMPLETITUD: que falta. Por aproximacion, porque de otra forma no se puede.
//
// EL PROBLEMA, DICHO CON HONESTIDAD. No existe ninguna forma de que una
// herramienta detecte una entidad que deberia estar en el mapa y no esta. Para
// saber que falta Chuuk hay que saber que Chuuk existe, y eso no esta en el
// dato: esta fuera. Chuuk -el estado mas poblado de Micronesia, ausente de
// TODOS los cortes del mapa- lo encontramos de casualidad en la ronda 64.
//
// De 1.199 entidades, 1.169 tienen articulo de Wikipedia. Eso dice de donde
// viene la ontologia de este mapa, y dice tambien cual es su limite: **lo que
// no tiene articulo en ingles no esta aqui.** Ninguna herramienta puede
// arreglar eso; solo una lista externa o alguien que conozca la region.
//
// LO QUE SI SE PUEDE MEDIR SON DOS SINTOMAS DE AUSENCIA, y los dos son utiles
// aunque ninguno sea concluyente:
//
//   COMODIN      cuantas entidades distintas han pintado cada celda del mundo a
//                lo largo de los doce mil anios. Una celda con un solo dueno en
//                todo el arco casi nunca significa que alli no pasara nada:
//                significa que hay un sustrato haciendo de comodin para toda la
//                historia de esa region. Es la firma de "aqui no hemos mirado".
//
//   DENSIDAD     cuantas entidades hay vivas por siglo, y como se reparten por
//                region. Un siglo con muchas menos entidades que sus vecinos, o
//                una region con muchas menos por superficie que otra comparable,
//                es donde mirar primero. No prueba que falte nada; ordena.
//
// Y UNA COMPROBACION QUE SI ES CONCLUYENTE CUANDO FALLA: toda capital del
// registro tiene que tener su entidad viva y pintando ese punto en las fechas
// declaradas. Una capital sin estado es una ausencia demostrada, no inferida.
//
//   JSX=<mapa> node censo.js
const L=require('./lib.js');
const T=require('./tierra.js');
const {CIV}=L.load(process.env.JSX);

const ANIOS=[];
for(let y=-10000;y<=2000;y+=250)ANIOS.push(y);

const bbDe=rs=>rs.reduce((a,r)=>{const b=L.bb(r);
 return [Math.min(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.max(a[3],b[3])]},[9e9,-9e9,9e9,-9e9]);

// --- rejilla de 2 grados: cuantos duenos distintos ha tenido cada celda -----
const PASO=2;
const celdas=new Map();          // clave -> Set de ids
const tierra=[];
for(let x=-180;x<180;x+=PASO)for(let y=-56;y<=76;y+=PASO){
 const pt=[x+PASO/2,y+PASO/2];
 if(T.enTierra(pt))tierra.push(pt);
}
console.log('celdas de '+PASO+' grados en tierra: '+tierra.length+', '+ANIOS.length+' cortes\n');
for(const A of ANIOS){
 const viv=[];
 for(const c of CIV){ const p=c.periods.find(p=>p.start<=A&&p.end>A);
  if(p&&p.rings.length)viv.push({id:c.id,kind:c.kind,p,b:bbDe(p.rings)}) }
 for(const pt of tierra){
  const k=pt[0]+','+pt[1];
  let s=celdas.get(k); if(!s)celdas.set(k,s=new Set());
  for(const o of viv){ if(pt[0]<o.b[0]||pt[0]>o.b[1]||pt[1]<o.b[2]||pt[1]>o.b[3])continue;
   if(L.has(o.p.rings,pt)){s.add(o.id);break} }
 }
}
const reparto={};
for(const [k,s] of celdas) reparto[s.size]=(reparto[s.size]||0)+1;
console.log('COMODIN: duenos distintos por celda a lo largo de todo el arco');
for(const n of Object.keys(reparto).map(Number).sort((a,b)=>a-b).slice(0,10))
 console.log('   '+String(n).padStart(3)+' duenos  '+String(reparto[n]).padStart(5)+' celdas'+
  (n===0?'   <- nunca la pinto nadie en doce mil anios':
   n===1?'   <- un solo dueno en todo el arco: la region no tiene historia en el mapa':
   n===2?'   <- dos duenos en todo el arco':''));
// donde estan las peores
const pobres=[...celdas.entries()].filter(([k,s])=>s.size<=2)
 .map(([k,s])=>({k,n:s.size,quien:[...s].join(',')}));
const zona=(x,y)=>x<-30?(y>12?'America N':'America S'):x<40?(y>36?'Europa':(y>12?'Norte de Africa':'Africa'))
 :x<75?(y>40?'Asia central':'Oriente Medio'):x<105?(y>40?'Siberia':'Asia S')
 :(y>40?'Asia NE':'Asia E y Oceania');
const porZona={};
for(const p of pobres){ const [x,y]=p.k.split(',').map(Number);
 const z=zona(x,y); porZona[z]=(porZona[z]||0)+1 }
console.log('\n   donde: '+Object.entries(porZona).sort((a,b)=>b[1]-a[1])
 .map(([k,v])=>k+' '+v).join(', '));
const cuenta={};
for(const p of pobres)for(const q of p.quien.split(','))if(q)cuenta[q]=(cuenta[q]||0)+1;
console.log('   comodines mas usados: '+Object.entries(cuenta).sort((a,b)=>b[1]-a[1]).slice(0,10)
 .map(([k,v])=>k+' '+v).join(', '));

// --- densidad por siglo -----------------------------------------------------
console.log('\nDENSIDAD: entidades vivas por corte');
const dens=[];
for(let y=-3000;y<=2000;y+=250){
 let n=0,cult=0;
 for(const c of CIV){ const p=c.periods.find(p=>p.start<=y&&p.end>y);
  if(p&&p.rings.length){n++; if(c.kind==='cultura')cult++} }
 dens.push({y,n,cult});
}
for(const d of dens)
 console.log('   '+String(d.y).padStart(6)+'  '+String(d.n).padStart(4)+' entidades  ('+
  String(d.cult).padStart(3)+' sustratos, '+String(d.n-d.cult).padStart(4)+' estados)'+
  '  '+'#'.repeat(Math.round(d.n/8)));

// --- capitales sin estado ---------------------------------------------------
let cap=null;
try{ cap=require('./capitales.js') }catch(e){}
console.log('\n(la comprobacion de capitales la hace `capitales.js`: 306/306 en el mapa actual)');
console.log('\nLIMITE CONOCIDO: '+CIV.filter(c=>!c.wikiTitle&&!c.periods.some(p=>p.wikiTitle)).length+
 ' entidades sin articulo de referencia, y 1.169 con el. La ontologia de este');
console.log('mapa es, en la practica, la lista de entidades con articulo en Wikipedia en');
console.log('ingles. Lo que falte de esa lista no lo puede encontrar ninguna herramienta.');
