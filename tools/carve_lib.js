// Resta de `perdedor` todo lo que los `ganadores` ocupen en cada tramo de
// tiempo. Parte el periodo del perdedor en los años en que cambia el mapa del
// ganador, recorta cada tramo por separado y funde los tramos identicos.
const pc=require('polygon-clipping');
const L=require('./lib.js');const R=require('./recorte.js');
function firma(rings){
  let h=0x811c9dc5;
  for(const r of rings){
    h=(h^r.length)>>>0;h=Math.imul(h,0x01000193)>>>0;
    for(const q of r){
      h=(h^((q[0]*1e4)|0))>>>0;h=Math.imul(h,0x01000193)>>>0;
      h=(h^((q[1]*1e4)|0))>>>0;h=Math.imul(h,0x01000193)>>>0;}
    h=(h^0x5bf03635)>>>0;}
  return rings.length+'#'+h.toString(36);
}
function carve(perdedor,ganadores,minA){
  const cortes=new Set();
  for(const g of ganadores)for(const p of g.periods){cortes.add(p.start);cortes.add(p.end)}
  const salida=[];
  for(const p of perdedor.periods){
    const ys=[p.start,...[...cortes].filter(y=>y>p.start&&y<p.end).sort((a,b)=>a-b),p.end];
    for(let i=0;i<ys.length-1;i++){
      const a=ys[i],b=ys[i+1];
      let rings=p.rings.map(r=>r);
      for(const g of ganadores){
        const gp=g.periods.find(q=>a>=q.start&&a<q.end); if(!gp)continue;
        const quit=gp.rings; if(!quit.length)continue;
        const nuevo=[];
        for(const r of rings){const q1=L.bb(r);
          const rel=quit.filter(w=>L.cruza(q1,L.bb(w)));
          if(!rel.length){nuevo.push(r);continue}
          let res;try{res=pc.difference([r],rel.map(w=>[w]))}catch(e){nuevo.push(r);continue}
          nuevo.push(...R.limpia(res,minA||3e-4));}
        rings=nuevo;}
      if(!rings.length)continue;
      const l=salida[salida.length-1];const k=firma(rings);
      if(l&&l.end===a&&l.k===k&&l.name===p.name){l.end=b;continue}
      salida.push({start:a,end:b,rings,k,name:p.name,wikiTitle:p.wikiTitle});}}
  salida.forEach(s=>delete s.k);
  return salida;
}
function rivales(CIV,c){
 const mi=L.caja(c),i0=c.periods[0].start,f0=c.periods[c.periods.length-1].end;
 return CIV.filter(o=>o.id!==c.id&&o.periods.length&&
  o.periods.some(p=>p.start<f0&&p.end>i0)&&L.cruza(mi,L.caja(o)));
}
module.exports={carve,rivales,firma};
