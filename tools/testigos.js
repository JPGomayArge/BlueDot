#!/usr/bin/env node
// APLICA CORRECCIONES A LA RED DE PLAZAS-TESTIGO.
//
// Por que existe. La ronda 56 midio los 269 sondeos que fallaban y el reparto
// fue casi mitad y mitad: **112 eran defectos del mapa y 118 eran expectativas
// equivocadas del testigo**. Escritas antes de que existiera la regla del
// estado concreto -"Crimea pinta Crimea aunque fuera vasalla otomana"-, o con
// una coordenada que a 1:50 millones cae en agua, o pidiendo un anio en el que
// la entidad esperada ni siquiera existia.
//
// Una red de testigos que no se puede corregir deja de ser un termometro y
// pasa a ser un dogma. Pero corregir un testigo para que deje de fallar es
// hacerse trampas al solitario, asi que **cada correccion lleva su razon
// escrita y la razon es lo que se audita**. Es la misma regla que gobierna
// `vacios.js` y `cajas_ok.js`.
//
//   module.exports = [
//     { nombre, anio, espera:'<id>'|null, anadir?:true, razon },  // expectativa
//     { nombre, lon, lat, razon },                                 // mover punto
//   ]
//
//   JSX=<mapa> node testigos.js <correcciones.js> [--seco]
const fs=require('fs');
const RUTA='/tmp/tools/plazas_base.js';
const P=require(RUTA);
const OPS=require(require('path').resolve(process.argv[2]));
const SECO=process.argv.includes('--seco');
let exp=0, mov=0, add=0, quit=0, fallos=0;
for(const o of OPS){
 const p=P.find(x=>x.nombre===o.nombre);
 if(!p){console.log('?? no existe la plaza '+JSON.stringify(o.nombre));fallos++;continue}
 if(!o.razon){console.log('!! sin razon escrita: '+o.nombre+' '+(o.anio||''));fallos++;continue}
 if(o.lon!=null||o.lat!=null){
  console.log('  mueve   '+p.nombre.padEnd(30)+p.lon+','+p.lat+' -> '+(o.lon??p.lon)+','+(o.lat??p.lat));
  if(!SECO){ if(o.lon!=null)p.lon=o.lon; if(o.lat!=null)p.lat=o.lat }
  mov++; continue;
 }
 if(o.anio==null){console.log('?? sin anio ni coordenada: '+o.nombre);fallos++;continue}
 p.espera=p.espera||{};
 const k=String(o.anio);
 const antes=p.espera[k];
 if(o.espera===null){
  console.log('  quita   '+p.nombre.padEnd(30)+k+'  (era '+antes+')');
  if(!SECO)delete p.espera[k];
  quit++;
 } else {
  console.log('  '+(antes===undefined?'anade  ':'cambia ')+' '+p.nombre.padEnd(30)+k+'  '+
   (antes===undefined?'':antes+' -> ')+o.espera);
  if(!SECO)p.espera[k]=o.espera;
  if(antes===undefined)add++; else exp++;
 }
 if(o.anadir && !p.anios.includes(o.anio)){
  if(!SECO){p.anios.push(o.anio);p.anios.sort((a,b)=>a-b)}
 }
 // si el testigo no sondea ese anio, no sirve de nada cambiar la expectativa
 if(!p.anios.includes(o.anio)){
  if(!SECO){p.anios.push(o.anio);p.anios.sort((a,b)=>a-b)}
  console.log('           (el anio no estaba en la lista de sondeos: anadido)');
 }
}
console.log('expectativas cambiadas '+exp+' | anadidas '+add+' | quitadas '+quit+
            ' | puntos movidos '+mov+' | rechazadas '+fallos);
if(!SECO && (exp||add||quit||mov)){
 const t=fs.readFileSync(RUTA,'utf8');
 fs.writeFileSync(RUTA, t.split('module.exports =')[0]+'module.exports = '+JSON.stringify(P,null,1)+';\n');
}
