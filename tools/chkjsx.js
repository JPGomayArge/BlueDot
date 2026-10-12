#!/usr/bin/env node
// El lado React Native de index.jsx, parseado entero con Babel (jsx). Es el
// complemento de chksintaxis.js, que solo mira el script del WebView: un
// parche del modo revision que deje una llave sin cerrar en la parte RN no se
// ve hasta que Metro lo rechaza en el telefono.
//   node chkjsx.js <index.jsx>      (usa @babel/parser, que Expo ya instala)
const fs=require('fs');
let parser; try{ parser=require('@babel/parser') }catch(e){ console.log('falta @babel/parser (npm i @babel/parser)'); process.exit(2) }
const ruta=process.argv[2]||process.env.JSX;
const s=fs.readFileSync(ruta,'utf8');
try{ parser.parse(s,{sourceType:'module',plugins:['jsx']}); console.log('JSX OK  ('+(s.length/1048576).toFixed(1)+' MB)') }
catch(e){ console.log('ERROR DE SINTAXIS: '+e.message); process.exit(1) }
