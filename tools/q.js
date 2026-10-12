#!/usr/bin/env node
// q.js "nombre,lon,lat" year year year ...
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
const args=process.argv.slice(2);
const pts=[],yrs=[];
for(const a of args){ if(a.includes(',')){const p=a.split(',');pts.push([p[0],parseFloat(p[1]),parseFloat(p[2])]);} else yrs.push(parseInt(a)); }
for(const [nm,lon,lat] of pts){
  for(const yr of yrs){
    const o=[];
    for(const c of CIV){ const p=c.periods.find(p=>yr>=p.start&&yr<p.end); if(p&&L.has(p.rings,[lon,lat])) o.push(c.id+(c.kind==='cultura'?'*':'')); }
    console.log(nm.padEnd(26)+String(yr).padStart(6)+'  '+(o.join(' ')||'-- VACIO --'));
  }
}
