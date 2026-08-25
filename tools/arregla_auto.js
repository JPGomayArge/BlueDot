#!/usr/bin/env node
// Repara anillos con auto-interseccion podando el vertice ofensor.
// GUARDA DE AREA: si la poda se lleva mas del 3% del anillo, se descarta la
// reparacion. Sin esa guarda esta herramienta amputo el norte de Vijayanagara
// entre 1490 y 1509 sin avisar.
//   node arregla_auto.js '["id1","id2"]'
const pc=require('polygon-clipping');
const L=require('./lib.js');const R=require('./recorte.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const IDS=process.argv[2]?new Set(JSON.parse(process.argv[2])):null;
const {malo}=require('./auto_int_lib.js');
let n=0,rechazados=0,borrados=0;
for(const c of CIV){if(IDS&&!IDS.has(c.id))continue;
 for(const p of c.periods){const out=[];let ch=false;
  for(const r of p.rings){
   if(!malo(r)){out.push(r);continue}
   const a0=L.rA(r);
   let q=r.slice(),k=0;
   while(malo(q)&&k<12&&q.length>5){const [i,j]=malo(q);q.splice(j,1);k++}
   let res=null;try{res=R.limpia(pc.union([[q]],[[q]]),3e-4)}catch(e){}
   const a1=(res||[]).reduce((s,x)=>s+L.rA(x),0);
   if(res&&res.length&&!res.some(malo)&&a1>=a0*0.97){out.push(...res);ch=true;n++;continue}
   // segundo intento: redondear a dos decimales suele deshacer el cruce
   let res2=null;try{res2=R.limpia(pc.union([[R.R2(r)]],[[R.R2(r)]]),3e-4)}catch(e){}
   const a2=(res2||[]).reduce((s,x)=>s+L.rA(x),0);
   if(res2&&res2.length&&!res2.some(malo)&&a2>=a0*0.95){out.push(...res2);ch=true;n++;continue}
   if(a0<0.5){borrados++;ch=true;continue}   // astilla degenerada: fuera
   out.push(r);rechazados++;}
  if(ch)p.rings=out;}}
console.log('anillos reparados: '+n+' | astillas borradas: '+borrados+' | reparaciones rechazadas por perdida de area: '+rechazados);
L.save(src,BLK,CIV,process.env.JSX);
