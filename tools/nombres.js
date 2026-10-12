#!/usr/bin/env node
// RENOMBRA ENTIDADES Y ROTULOS DE PERIODO.
//
// Por que existe. El proyecto no tenia forma de cambiar un nombre. Y hacia
// falta: `neolitico_italiano` y `neolitico_iberico` no son culturas fechadas,
// son **los sustratos de sus peninsulas con nombre de periodo**, y por eso
// Italia e Iberia estaban vacias en todo el arco anterior al -6000: nadie podia
// estirarles el arco sin que el rotulo "Neolitico" pasara a cubrir el -10000.
// El nombre bloqueaba la geometria.
//
// Es el mismo caso que los diez rotulos que hubo que cambiar al retrasar los
// arcos de la capa antigua, pero alli se hizo con un script suelto. Aqui queda
// la herramienta.
//
//   module.exports = { <id>: { name?:'...', wikiTitle?:'...',
//                              periodos?:{ '<anio de inicio>':'<rotulo>' } } }
//
//   JSX=<mapa> node nombres.js <modulo.js> [--seco]
const L=require('./lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const OPS=require(require('path').resolve(process.argv[2]));
const SECO=process.argv.includes('--seco');
let ent=0, rot=0, fallos=0;
for(const [id,op] of Object.entries(OPS)){
 const c=CIV.find(x=>x.id===id);
 if(!c){console.log('?? no existe '+id);fallos++;continue}
 if(op.name && op.name!==c.name){
  console.log('  '+id.padEnd(24)+'"'+c.name+'"  ->  "'+op.name+'"');
  if(!SECO)c.name=op.name; ent++;
 }
 if(op.wikiTitle && op.wikiTitle!==c.wikiTitle){
  console.log('  '+id.padEnd(24)+'wikiTitle "'+(c.wikiTitle||'')+'"  ->  "'+op.wikiTitle+'"');
  if(!SECO)c.wikiTitle=op.wikiTitle;
 }
 for(const [ini,nom] of Object.entries(op.periodos||{})){
  const p=c.periods.find(p=>p.start===+ini);
  if(!p){console.log('   !! '+id+': no hay periodo que empiece en '+ini);fallos++;continue}
  console.log('   '+id.padEnd(23)+String(ini).padStart(7)+'  "'+(p.name||'')+'"  ->  "'+nom+'"');
  if(!SECO)p.name=nom; rot++;
 }
}
console.log('entidades renombradas '+ent+' | rotulos cambiados '+rot+' | fallos '+fallos);
if(!SECO && (ent||rot)) L.save(src,BLK,CIV,process.env.JSX);
