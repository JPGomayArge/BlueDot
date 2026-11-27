#!/usr/bin/env node
// ESCRIBE EN LOS canon_*.js LOS TITULOS FINALES DE wiki_sugerido.json
// (el archivo que deja `node verifica_wiki.js --arreglar`): cada redireccion
// se sustituye por el titulo real, para que la ficha no tenga que seguirla.
//   node aplica_wiki.js            (aplica y lista los cambios)
//   node aplica_wiki.js --prueba   (solo lista)
const fs=require('fs'), path=require('path');
const sug=JSON.parse(fs.readFileSync(path.join(__dirname,'wiki_sugerido.json'),'utf8'));
const prueba=process.argv.includes('--prueba');
const esc=t=>t.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
let n=0;
for(const f of fs.readdirSync(__dirname).filter(f=>/^canon_.*\.js$/.test(f)).sort()){
 const p=path.join(__dirname,f); const lineas=fs.readFileSync(p,'utf8').split('\n'); let cambios=0;
 for(let i=0;i<lineas.length;i++){ const m=lineas[i].match(/^\s*\{\s*id:'([a-z_0-9]+)'/); if(!m)continue; const id=m[1];
  for(const campo of ['wiki','wiki_en']){ const nuevo=sug[id+'|'+campo]; if(!nuevo)continue;
   const re=new RegExp("(\\b"+campo+":')((?:[^'\\\\]|\\\\.)*)(')"); const mm=lineas[i].match(re); if(!mm)continue; if(mm[2]===esc(nuevo))continue;
   console.log('  '+f+' '+id+' '+campo+": '"+mm[2]+"' -> '"+nuevo+"'"); lineas[i]=lineas[i].replace(re,'$1'+esc(nuevo).replace(/\$/g,'$$$$')+'$3'); cambios++; n++ } }
 if(cambios&&!prueba)fs.writeFileSync(p,lineas.join('\n'));
}
console.log((prueba?'cambiaria ':'cambiados ')+n+' titulos');
