#!/usr/bin/env node
// Comprueba que el script del WebView que va dentro del literal de plantilla de
// index.jsx sigue siendo JavaScript valido. Sin esto, un backtick sin escapar o
// una llave de mas en `construirCivil` rompe la app y no se ve hasta que el
// usuario la abre.
const fs=require('fs');
const ruta=process.argv[2];
const s=fs.readFileSync(ruta,'utf8');
const crudo=k=>{ let b=0,m=k-1; while(m>=0&&s[m]==='\\'){b++;m--} return b%2===0 };
let n=0; for(let k=0;k<s.length;k++) if(s[k]==='`'&&crudo(k))n++;
console.log('backticks sin escapar en el fichero: '+n+'  (par: '+(n%2===0)+')');
const i=s.indexOf('function construirCivil');
let ini=-1,c=0;
for(let k=0;k<i;k++) if(s[k]==='`'&&crudo(k)){ c++; if(c%2===1)ini=k }
let fin=-1;
for(let k=i;k<s.length;k++) if(s[k]==='`'&&crudo(k)){ fin=k; break }
if(ini<0||fin<0){ console.log('no se pudo localizar la plantilla'); process.exit(1) }
let html=s.slice(ini+1,fin).replace(/\\`/g,'`').replace(/\\\$/g,'$');
const bloques=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .map(m=>m[1]).filter(x=>x.trim().length);
console.log('bloques <script> con contenido: '+bloques.length);
if(!bloques.length){ console.log('no se encontro ningun script'); process.exit(1) }
let t=bloques[bloques.length-1];
// las interpolaciones ${...} del literal no son JS valido por si solas
t=t.replace(/\$\{[^{}]*\}/g,'0');
const tmp='/tmp/geo/_chk_webview.js';
fs.writeFileSync(tmp,t);
require('child_process').execFileSync('node',['--check',tmp],{stdio:'inherit'});
console.log('SINTAXIS OK  ('+t.length+' bytes)');
