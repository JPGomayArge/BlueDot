#!/usr/bin/env node
// Adaptador de formato para anade.js. Los agentes de conversion escriben
//   [ini, fin, poly, 'motivo']
// que es el formato del encargo (mas legible: el poligono junto a su razon).
// anade.js espera
//   [ini, fin, 'mas'|'menos', poly]
// Este script detecta cual de los dos es y escribe siempre el segundo. Si el
// tercer elemento ya es 'mas' o 'menos' lo deja intacto, asi que es idempotente
// y se puede pasar sobre cualquier archivo sin mirar antes como esta escrito.
const fs=require('fs'),path=require('path');
const ent=path.resolve(process.argv[2]), sal=path.resolve(process.argv[3]||process.argv[2]);
const OPS=require(ent);
let cambiadas=0,intactas=0;
const out={};
for(const [id,ops] of Object.entries(OPS)){
  out[id]=ops.map(o=>{
    if(o[2]==='mas'||o[2]==='menos'){intactas++;return o}
    cambiadas++;return [o[0],o[1],'mas',o[2]];   // el 4o elemento, el motivo, se pierde: anade.js no lo usa
  });
}
fs.writeFileSync(sal,'module.exports = '+JSON.stringify(out)+';\n');
console.log('normalizadas',cambiadas,'| ya en formato anade',intactas,'->',sal);
