#!/usr/bin/env node
// Crea civilizaciones nuevas. Los poligonos se recortan a la costa y NO se
// tallan contra nadie: se asume que vienen dibujados para no solaparse.
// Despues conviene pasar barrido.js para comprobarlo.
//   module.exports = [ { id, name, color, wikiTitle?, kind?,
//                        periods:[ [ini,fin, poly|[polys], 'nombre'], ... ] } ]
const L=require('./lib.js');const R=require('./recorte.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const NUEVAS=require(process.argv[2]);
let n=0;
for(const def of NUEVAS){
 if(CIV.find(c=>c.id===def.id)){console.log('!! ya existe',def.id);continue}
 const periods=[];
 for(const [ini,fin,poly,nom] of def.periods){
  const anillos=Array.isArray(poly[0][0])?poly:[poly];
  const rings=[];for(const q of anillos)rings.push(...R.aTierra(q));
  if(!rings.length){console.log('!! sin geometria',def.id,ini);continue}
  const p={start:ini,end:fin,rings};
  if(def.wikiTitle)p.wikiTitle=def.wikiTitle;
  if(nom)p.name=nom;
  periods.push(p);}
 if(!periods.length){console.log('!! sin periodos',def.id);continue}
 periods.sort((a,b)=>a.start-b.start||a.end-b.end);
 const c={id:def.id,name:def.name,color:def.color,periods};
 if(def.kind)c.kind=def.kind;
 if(def.wikiTitle)c.wikiTitle=def.wikiTitle;
 CIV.push(c);n++;
 console.log(def.id.padEnd(16),periods.length+' periodos | areas '+
  periods.map(p=>p.rings.reduce((s,r)=>s+L.rA(r),0).toFixed(1)).join('/'));}
console.log('civilizaciones creadas: '+n+' | total ahora '+CIV.length);
L.save(src,BLK,CIV,process.env.JSX);
