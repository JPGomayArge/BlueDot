#!/usr/bin/env node
// g.js id year lon0 lon1 lat0 lat1 step  -> mapa ASCII de dentro/fuera
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
const [id,yr,l0,l1,a0,a1,st]=process.argv.slice(2);
const c=CIV.find(x=>x.id===id); if(!c){console.log('no existe');process.exit(1)}
const p=c.periods.find(p=>+yr>=p.start&&+yr<p.end); if(!p){console.log('sin periodo en '+yr);process.exit(1)}
console.log(id+' '+p.start+'..'+p.end+'  '+(p.name||''));
const S=+st;
let hdr='      ';for(let x=+l0;x<=+l1+1e-9;x+=S)hdr+=(Math.round(x)%10===0?String(Math.round(x)).slice(-2).padStart(1):'.');
console.log(hdr);
for(let y=+a1;y>=+a0-1e-9;y-=S){
  let row=String(y.toFixed(1)).padStart(6);
  for(let x=+l0;x<=+l1+1e-9;x+=S) row+= L.has(p.rings,[x,y])?'#':'.';
  console.log(row);
}
