const pc=require('polygon-clipping');
const L=require('/tmp/tools/lib.js');const T=require('/tmp/tools/tierra.js');
const A=L.load('/tmp/geo/bk_v7b.jsx').CIV;
const B=L.load('/tmp/geo/trabajo2.jsx').CIV;
const OPS=require('/tmp/v7/cortes_todos.js');
const res={};
for(const [id,ops] of Object.entries(OPS)){
 const a=A.find(x=>x.id===id); if(!a)continue;
 for(const [ini,fin] of ops){
  // geometria quitada = union(antes en el rango) menos union(despues en el rango)
  const anillosA=[],anillosB=[];
  for(const p of a.periods) if(p.start<fin&&p.end>ini) for(const r of p.rings) anillosA.push([r]);
  const b=B.find(x=>x.id===id);
  for(const p of b.periods) if(p.start<fin&&p.end>ini) for(const r of p.rings) anillosB.push([r]);
  let dif;try{dif=pc.difference(anillosA,anillosB)}catch(e){continue}
  if(!dif||!dif.length)continue;
  // muestreo
  let bb=[999,-999,999,-999];
  for(const poly of dif) for(const q of poly[0]){if(q[0]<bb[0])bb[0]=q[0];if(q[0]>bb[1])bb[1]=q[0];if(q[1]<bb[2])bb[2]=q[1];if(q[1]>bb[3])bb[3]=q[1]}
  const pasos=[];
  const paso=Math.max(0.25,Math.min((bb[1]-bb[0])/25,(bb[3]-bb[2])/25));
  for(let x=bb[0]+paso/2;x<bb[1];x+=paso)for(let y=bb[2]+paso/2;y<bb[3];y+=paso){
   const pt=[x,y];
   if(!dif.some(poly=>L.has(poly,pt)))continue;
   if(!T.enTierra(pt))continue;
   pasos.push(pt);
  }
  if(!pasos.length)continue;
  const años=[ini+Math.round((fin-ini)*0.25),ini+Math.round((fin-ini)*0.5),ini+Math.round((fin-ini)*0.75)];
  let vacios=0,tot=0;const ejemplos=[];
  for(const yr of años) for(const pt of pasos){
   tot++;
   const hay=B.some(c=>c.periods.some(p=>p.start<=yr&&p.end>=yr&&L.has(p.rings,pt)));
   if(!hay){vacios++;if(ejemplos.length<3)ejemplos.push(pt[0].toFixed(1)+','+pt[1].toFixed(1)+'@'+yr)}
  }
  if(vacios) console.log(id.padEnd(18)+String(ini).padStart(6)+'..'+String(fin).padEnd(6)+
   ' huecos '+String(vacios).padStart(4)+'/'+String(tot).padEnd(5)+' ('+(100*vacios/tot).toFixed(0)+'%)  '+ejemplos.join('  '));
 }
}
