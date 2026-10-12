#!/usr/bin/env node
// CREA LAS ENTIDADES DE faltan.js EN EL MAPA.
//
// Cada entrada se anade como area cultural con un solo periodo cuyo anillo es
// su caja de trabajo (o la caja de su primera fila de forma); la forma de
// verdad se la da despues remodela_fisico.js con la tabla aplanada que este
// mismo script escribe (ambitos_faltan.js), en orden y restando a todo lo
// que ya existe. Idempotente: si la entidad ya existe, no la toca.
//
//   JSX=<mapa> node anade_entidades.js faltan.js [--aplica]
//   JSX=<mapa> IGNORA=2 node remodela_fisico.js ambitos_faltan.js --aplica
const fs=require('fs'); const L=require('./lib.js');
const ruta=process.argv[2]||'./faltan.js'; const APLICA=process.argv.includes('--aplica');
const T=require(require('path').resolve(ruta));
const doc=L.load(process.env.JSX); const CIV=doc.CIV;
const filas=[]; let nuevas=0;
for(const e of T){
 const f0=e.forma[0]; const caja=f0.caja||(e.caja)||null;
 if(!caja){ console.log('   ?? '+e.id+': la primera fila de forma necesita caja'); continue }
 const anillo=[[caja[0],caja[2]],[caja[1],caja[2]],[caja[1],caja[3]],[caja[0],caja[3]]];
 if(!CIV.find(c=>c.id===e.id)){
  const c={id:e.id,kind:'cultura',name:e.name,color:e.color,periods:[{start:e.start,end:e.end,rings:[anillo]}]};
  if(e.etiqueta)c.etiqueta=e.etiqueta; if(e.wikiTitle)c.wikiTitle=e.wikiTitle;
  CIV.push(c); nuevas++; console.log('   + '+e.id+'  '+e.start+'..'+e.end+'  '+e.name);
 } else console.log('   = '+e.id+' ya existe');
 e.forma.forEach((f,i)=>{ const fila={id:e.id}; for(const k of ['region','bioma','caja','lado','modo','desde','hasta'])if(f[k]!=null)fila[k]=f[k]; if(i===0)fila.guarda=false; filas.push(fila) });
}
const salida=__dirname+'/ambitos_faltan.js';
fs.writeFileSync(salida,'// GENERADO por anade_entidades.js a partir de faltan.js: no editar a mano.\n// Van las ultimas: restan a todo lo que existe y no se restan a nadie.\nmodule.exports = '+JSON.stringify(filas,null,1)+';\n');
console.log(nuevas+' entidades nuevas; '+filas.length+' filas de forma -> '+salida);
if(APLICA){ L.save(doc.src,doc.R,doc.CIV,process.env.JSX); console.log('escrito '+process.env.JSX) } else console.log('(sin --aplica no se escribe el mapa)');
