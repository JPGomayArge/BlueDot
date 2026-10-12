#!/usr/bin/env node
// Añade ('mas') o quita ('menos') regiones a los periodos que caen dentro de
// un rango de años. OJO: opera sobre el periodo ENTERO que solape el rango,
// asi que conviene pasar antes parte.js para alinear los cortes.
//   module.exports = { id: [ [ini, fin, 'mas'|'menos', poly|[polys] ], ... ] }
// Con NOCARVE=1 no se talla contra rivales.
const pc=require('polygon-clipping');
const L=require('./lib.js');const R=require('./recorte.js');
const {carve,rivales}=require('./carve_lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const OPS=require(process.argv[2]);
for(const [id,ops] of Object.entries(OPS)){
  const c=CIV.find(x=>x.id===id);
  if(!c){console.log('?? no existe',id);continue}
  const antesA=c.periods.map(p=>p.rings.reduce((s,r)=>s+L.rA(r),0));
  for(const [ini,fin,modo,poly] of ops){
    const anillos=Array.isArray(poly[0][0])?poly:[poly];
    const rec=[];for(const q of anillos)rec.push(...R.aTierra(q));
    if(!rec.length)continue;
    const otro=rec.map(r=>[r]);
    for(const p of c.periods){
      if(!(p.start<fin&&p.end>ini))continue;
      const mio=p.rings.map(r=>[r]);
      let res;
      try{res=modo==='menos'?pc.difference(mio,otro):pc.union(mio,otro)}catch(e){continue}
      const lim=R.limpia(res,3e-4);
      if(lim.length)p.rings=lim;}}
  // El tallado se limita a los periodos QUE SE HAN TOCADO. Antes se tallaba la
  // entidad entera despues de cada adicion, y eso, en una entidad global como
  // 'british' -669 rivales, 453.000 vertices-, son mas de cien mil diferencias
  // de poligonos para una adicion que afecta a tres periodos: dos horas de
  // reloj en la ronda 12. Ademas es incorrecto, porque volvia a tallar
  // geometria que nadie habia modificado y podia cambiarla en silencio.
  if(!process.env.NOCARVE){
    const tocado=p=>ops.some(([ini,fin])=>p.start<fin&&p.end>ini);
    const dentro=c.periods.filter(tocado), fuera=c.periods.filter(p=>!tocado(p));
    if(dentro.length){
      const sub={id:c.id,periods:dentro};
      const nuevos=carve(sub,rivales(CIV,sub),3e-4);
      c.periods=fuera.concat(nuevos).sort((a,b)=>a.start-b.start||a.end-b.end);
    }
  }
  const ar=c.periods.map(p=>p.rings.reduce((s,r)=>s+L.rA(r),0));
  console.log(id.padEnd(20),'areas '+antesA.map(x=>x.toFixed(0)).join('/')+'  ->  '+ar.map(x=>x.toFixed(0)).join('/'));}
for(const c of CIV)c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
L.save(src,BLK,CIV,process.env.JSX);
