#!/usr/bin/env node
// MENFIS BAJO LOS KUSHITAS (-727..-671).
// La radiografia y el testigo de El Cairo lo sacaron: entre Piye (-727) y la
// conquista asiria (-663) nadie tenia Menfis -Egipto se habia encogido al
// delta saita, Kush se quedaba en Tebas-, y al rehacer el Sahara el sustrato
// se colo hasta el Nilo. La dinastia XXV gobernaba desde Menfis: el valle
// entre Tebas y Menfis es de Kush en ese tramo. Se toma del Egipto de -750
// lo que no es ni Kush ni el delta que Egipto conserva.
const pc=require('polygon-clipping'); const L=require('./lib.js'); const R=require('./recorte.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const eg=CIV.find(c=>c.id==='egypt'), ku=CIV.find(c=>c.id==='kush');
const fuente=eg.periods.find(p=>p.start===-750);
let n=0;
for(const p of ku.periods){ if(p.start<-727||p.end>-671)continue;   // desde -671 Menfis es asiria (Esarhaddon)
 const delta=eg.periods.find(q=>q.start<=p.start&&q.end>=p.end);
 let r=pc.difference(fuente.rings.map(x=>[x]),p.rings.map(x=>[x]));
 if(delta)r=pc.difference(r,delta.rings.map(x=>[x]));
 const extra=R.limpia(r,0.05).filter(x=>{const b=L.bb(x);return b[3]>26}); // solo el valle medio y Menfis, no el sur ya kushita
 const antes=p.rings.reduce((s,x)=>s+L.rA(x),0);
 const u=R.limpia(pc.union(p.rings.map(x=>[x]),extra.map(x=>[x])),3e-4);
 console.log('kush '+p.start+'..'+p.end+': '+antes.toFixed(1)+' -> '+u.reduce((s,x)=>s+L.rA(x),0).toFixed(1)+' g2  (+'+extra.length+' anillos)');
 p.rings=u; n++ }
if(process.argv.includes('--aplica')){ L.save(src,BLK,CIV,process.env.JSX); console.log('escrito') }
