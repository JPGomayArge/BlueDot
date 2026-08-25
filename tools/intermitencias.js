#!/usr/bin/env node
// Oscuridad intermedia: celdas que estaban pintadas antes y despues pero se
// apagan en medio. No cuenta el silencio inicial ni el final.
const fs=require('fs');const L=require('./lib.js');
const CELL=JSON.parse(fs.readFileSync(__dirname+'/celdas.json','utf8'));
const {CIV}=L.load(process.env.JSX);
const REG={};for(const [k,v] of Object.entries(CELL))for(const p of v)REG[p.join(',')]=k;
const ALL=Object.keys(REG).map(s=>s.split(',').map(Number));
const AÑOS=[];for(let y=-4000;y<=2000;y+=100)AÑOS.push(y);
const quien=new Map(ALL.map(p=>[p.join(','),[]]));
for(const yr of AÑOS){
 const act=[];for(const c of CIV){const p=c.periods.find(p=>yr>=p.start&&yr<p.end);
  if(p)act.push({id:c.id,rings:p.rings.map(r=>({r,b:L.bb(r)}))})}
 for(const pt of ALL){let id=null;
  for(const A of act){let n=0;for(const o of A.rings){const q=o.b;
    if(pt[0]<q[0]||pt[0]>q[1]||pt[1]<q[2]||pt[1]>q[3])continue;if(L.pip(pt,o.r))n++}
   if(n%2){id=A.id;break}}
  quien.get(pt.join(',')).push(id)}}
const tramos=[];
for(const pt of ALL){const k=pt.join(',');const q=quien.get(k);
 let i=0;while(i<q.length&&!q[i])i++;
 let f=q.length-1;while(f>=0&&!q[f])f--;
 let j=i;
 while(j<=f){ if(q[j]){j++;continue}
  const s=j;while(j<=f&&!q[j])j++;
  tramos.push({pt,ini:AÑOS[s],fin:AÑOS[j-1],n:j-s,antes:q[s-1],despues:q[j],reg:REG[k]});}}
const cy=tramos.reduce((s,t)=>s+t.n*100,0)/100;
console.log('tramos de oscuridad intermedia: '+tramos.length+' | celda-siglo: '+cy);
const porReg={};for(const t of tramos)porReg[t.reg]=(porReg[t.reg]||0)+t.n;
console.log('\nPOR REGION:');
for(const [k,v] of Object.entries(porReg).sort((a,b)=>b[1]-a[1]))console.log('  '+k.padEnd(26)+v);
console.log('\nLOS 15 TRAMOS MAS LARGOS:');
for(const t of tramos.sort((a,b)=>b.n-a.n).slice(0,15))
 console.log('  '+String(t.n).padStart(3)+' siglos  '+t.ini+'..'+t.fin+'  '+t.pt.join(',')+'  '+(t.antes||'-')+' -> '+(t.despues||'-'));
