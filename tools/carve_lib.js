// Resta de `perdedor` todo lo que los `ganadores` ocupen en cada tramo de
// tiempo. Parte el periodo del perdedor en los años en que cambia el mapa del
// ganador, recorta cada tramo por separado y funde los tramos identicos.
//
// PODA (ronda 11). Sin ella el coste es (numero de cortes) x (numero de
// ganadores) x (pares de anillos), y para un area cultural de alcance
// continental eso son decenas de miles de diferencias de poligonos: anade.js
// llego a tardar cuarenta minutos. Tres cambios, ninguno altera el resultado:
//   1. Las cajas de cada ganador se calculan UNA vez, no en cada anillo de
//      cada tramo.
//   2. Para cada periodo del perdedor solo se consideran los ganadores cuya
//      caja de civilizacion cruza la caja de ESE periodo. Los demas no pueden
//      quitarle nada.
//   3. Los cortes de tiempo se recogen solo de esos ganadores y solo dentro
//      del arco del periodo: antes se partia en todos los cortes del mapa.
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
const cajaDe=(rings)=>rings.map(L.bb).reduce((a,x)=>a?[Math.min(a[0],x[0]),Math.max(a[1],x[1]),Math.min(a[2],x[2]),Math.max(a[3],x[3])]:x.slice(),null);
function carve(perdedor,ganadores,minA){
  // cajas precalculadas
  const cajaCiv=new Map(), cajaPer=new Map(), cajaAnillo=new Map();
  for(const g of ganadores){
    cajaCiv.set(g,L.caja(g));
    for(const p of g.periods){
      cajaPer.set(p,cajaDe(p.rings));
      for(const w of p.rings) if(!cajaAnillo.has(w))cajaAnillo.set(w,L.bb(w));
    }
  }
  const salida=[];
  for(const p of perdedor.periods){
    const cp=cajaDe(p.rings);
    // solo los ganadores que pueden tocar ESTE periodo
    const gs = cp ? ganadores.filter(g=>{const b=cajaCiv.get(g);return b&&L.cruza(cp,b)}) : [];
    const cortes=new Set();
    for(const g of gs)for(const q of g.periods){
      if(q.start>p.start&&q.start<p.end)cortes.add(q.start);
      if(q.end>p.start&&q.end<p.end)cortes.add(q.end);
    }
    const ys=[p.start,...[...cortes].sort((a,b)=>a-b),p.end];
    for(let i=0;i<ys.length-1;i++){
      const a=ys[i],b=ys[i+1];
      let rings=p.rings.map(r=>r);
      // Se resta ganador a ganador, no todos a la vez. Probe a hacer una sola
      // diferencia contra la union de todos y es 25% mas rapido, pero
      // polygon-clipping falla cuando recibe doscientos poligonos de recorte,
      // el catch conserva el anillo entero y el mapa se queda con el solape
      // puesto: 5.336 grado2-anio en una prueba de cuatro entidades frente a
      // 25,3 asi. Mas vale lento y sin solape.
      for(const g of gs){
        const gp=g.periods.find(q=>a>=q.start&&a<q.end); if(!gp)continue;
        const quit=gp.rings; if(!quit.length)continue;
        const bgp=cajaPer.get(gp); if(bgp&&cp&&!L.cruza(cp,bgp))continue;
        const nuevo=[];
        for(const r of rings){const q1=L.bb(r);
          const rel=quit.filter(w=>L.cruza(q1,cajaAnillo.get(w)||L.bb(w)));
          if(!rel.length){nuevo.push(r);continue}
          let res;try{res=pc.difference([r],rel.map(w=>[w]))}catch(e){nuevo.push(r);continue}
          nuevo.push(...R.limpia(res,minA||3e-4));}
        rings=nuevo;
        if(!rings.length)break;}
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
