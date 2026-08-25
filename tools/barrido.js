#!/usr/bin/env node
// Barrido de doble pintado: para cada celda y cada año muestreado, cuenta
// cuantas civilizaciones la pintan. Mas de una es un error.
//   node barrido.js '[-4000,2000,100]'
const fs=require('fs');const L=require('./lib.js');
const CELL=JSON.parse(fs.readFileSync(__dirname+'/celdas.json','utf8'));
const {CIV}=L.load(process.env.JSX);
const ALL=[...new Set([].concat(...Object.values(CELL)).map(p=>p.join(',')))].map(s=>s.split(',').map(Number));
const [ini,fin,paso]=JSON.parse(process.argv[2]||'[-4000,2000,100]');
const tot={},cuando={};
for(let yr=ini;yr<=fin;yr+=paso){
 const act=[];
 for(const c of CIV){const p=c.periods.find(p=>yr>=p.start&&yr<p.end);
  if(p)act.push({id:c.id,rings:p.rings.map(r=>({r,b:L.bb(r)}))})}
 for(const pt of ALL){const w=[];
  for(const A of act){let k=0;
   for(const o of A.rings){const q=o.b;
    if(pt[0]<q[0]||pt[0]>q[1]||pt[1]<q[2]||pt[1]>q[3])continue;
    if(L.pip(pt,o.r))k++}
   if(k%2)w.push(A.id)}
  if(w.length<2)continue;
  for(let i=0;i<w.length;i++)for(let j=i+1;j<w.length;j++){
   const k=[w[i],w[j]].sort().join('+');tot[k]=(tot[k]||0)+1;(cuando[k]=cuando[k]||new Set()).add(yr)}
 }}
const e=Object.entries(tot).sort((a,b)=>b[1]-a[1]);
console.log('pares con doble pintado: '+e.length+' | celda-año total: '+e.reduce((s,x)=>s+x[1],0));
for(const [k,v] of e.slice(0,30))
 console.log('   '+k+' celda-año '+v+' en '+[...cuando[k]].slice(0,4).join(','));
