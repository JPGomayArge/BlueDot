#!/usr/bin/env node
// SACA EL DATO DEL MAPA DE index.jsx A data/mapa.json.
//
// index.jsx llevaba dentro el diccionario de anillos (__RG) y la lista de
// entidades (CIVILIZATIONS): 16 de sus 17 MB. Eso hacia que cada parche de
// codigo fuera una operacion sobre un archivo enorme y que un cambio de datos
// se mezclara con un cambio de codigo en el historial. Este paso los separa:
//
//   data/mapa.json   { version, rings:[...], civilizations:[...] }
//   app/index.jsx    import MAPA from '../data/mapa.json';
//                    const __RG = MAPA.rings; const CIVILIZATIONS = MAPA.civilizations;
//
// El formato de los anillos (deltas base36) y de las entidades no cambia, asi
// que el renderizador no se toca: la expansion de anillos al arrancar sigue
// igual. lib.js lee y escribe las dos formas (jsx con el dato dentro, o jsx +
// json), y todas las herramientas pasan por lib.js.
//
//   node separa_mapa.js <index.jsx> <mapa.json> [--aplica] [--version build31]
const fs=require('fs'); const L=require('./lib.js');
const ruta=process.argv[2], salida=process.argv[3]; const APLICA=process.argv.includes('--aplica');
const vi=process.argv.indexOf('--version'); const VERSION=vi>0?process.argv[vi+1]:'build31';
if(!ruta||!salida){ console.log('uso: node separa_mapa.js <index.jsx> <mapa.json> [--aplica] [--version vN]'); process.exit(1) }
let src=fs.readFileSync(ruta,'utf8');
if(src.includes('MAPA.civilizations')){ console.log('ya separado: '+ruta+' no lleva el dato dentro'); process.exit(0) }

// 1. el bloque de entidades y el diccionario, tal cual (sin decodificar anillos)
const R=L.rawBlock(src); const CIV=eval(R.txt);
const g=src.indexOf('const __RG'); if(g<0||g>R.a){ console.log('no encuentro const __RG antes de CIVILIZATIONS'); process.exit(1) }
const a=src.indexOf('[',g); let d=0,i=a; for(;;i++){ const c=src[i]; if(c==='[')d++; else if(c===']'){ d--; if(d===0)break } }
const rings=eval(src.slice(a,i+1)); const finRG=src.indexOf(';',i)+1;
for(const c of CIV)for(const p of c.periods)if(typeof p.rings!=='string'){ console.log('periodo con anillos no comprimidos en '+c.id); process.exit(1) }
const mapa={version:VERSION,rings,civilizations:CIV};

// 2. index.jsx sin el dato: el comentario del diccionario se conserva
const inicioComentario=src.lastIndexOf('// Diccionario de anillos',g);
const corte=inicioComentario>0&&inicioComentario>g-600?inicioComentario:g;
const sustituto=src.slice(corte,g)+"const __RG = MAPA.rings;\nconst CIVILIZATIONS = MAPA.civilizations";
let out=src.slice(0,corte)+sustituto+src.slice(R.b+1);
if(out.includes("import MAPA from")){} else {
 const anc="import EVENTS_RAW from '../data/events_extended.json';";
 if(!out.includes(anc)){ console.log('no encuentro el import de events_extended.json para anclar el de mapa.json'); process.exit(1) }
 out=out.replace(anc,anc+"\n// El dato del mapa (anillos y entidades) vive en data/mapa.json: lo construyen\n// las herramientas de tools/ y se cambia por pull request sobre las tablas.\nimport MAPA from '../data/mapa.json';");
}
console.log('entidades '+CIV.length+' · anillos '+rings.length+' · index.jsx '+(src.length/1e6).toFixed(1)+' MB -> '+(out.length/1e6).toFixed(2)+' MB');
const texto='{"version":'+JSON.stringify(VERSION)+',\n"rings":[\n'+rings.map(e=>JSON.stringify(e)).join(',\n')+'\n],\n"civilizations":[\n'+CIV.map(c=>JSON.stringify(c)).join(',\n')+'\n]}\n';
if(APLICA){ fs.writeFileSync(salida,texto); fs.writeFileSync(ruta,out); console.log('escrito '+salida+' ('+(fs.statSync(salida).size/1e6).toFixed(1)+' MB) y '+ruta) }
else console.log('(sin --aplica no se escribe)');
