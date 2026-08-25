#!/usr/bin/env node
// Sustituye la geometria de los periodos que caen dentro de un rango, sin
// tocar el resto de la linea temporal. Si el rango no coincide con los cortes
// existentes, el periodo se parte primero.
//   module.exports = { id: [ [ini, fin, poly|[polys], 'nombre opcional'], ... ] }
const L=require('./lib.js');const R=require('./recorte.js');
const {carve,rivales}=require('./carve_lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const OPS=require(process.argv[2]);
function parteEn(c,y){
 const p=c.periods.find(p=>p.start<y&&p.end>y); if(!p)return;
 const n={start:y,end:p.end,rings:p.rings.map(r=>r.map(q=>q.slice()))};
 if(p.name)n.name=p.name; if(p.wikiTitle)n.wikiTitle=p.wikiTitle;
 p.end=y;c.periods.push(n);c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
}
for(const [id,ops] of Object.entries(OPS)){
 const c=CIV.find(x=>x.id===id);
 if(!c){console.log('?? no existe',id);continue}
 const antes=c.periods.length;
 for(const [ini,fin] of ops){parteEn(c,ini);parteEn(c,fin)}
 for(const [ini,fin,poly,nom] of ops){
  const anillos=Array.isArray(poly[0][0])?poly:[poly];
  const rings=[];for(const q of anillos)rings.push(...R.aTierra(q));
  if(!rings.length){console.log('!! sin geometria',id,ini);continue}
  let n=0;
  for(const p of c.periods){if(p.start<ini||p.end>fin)continue;
   p.rings=rings.map(r=>r.map(q=>q.slice()));if(nom)p.name=nom;n++}
  if(!n)console.log('!! ningun periodo dentro de',ini,fin,'en',id);}
 if(!process.env.NOCARVE)c.periods=carve(c,rivales(CIV,c),3e-4);
 console.log(id.padEnd(18),'periodos '+antes+'->'+c.periods.length,
  '| areas '+c.periods.map(p=>p.rings.reduce((s,r)=>s+L.rA(r),0).toFixed(1)).join('/'));}
for(const c of CIV)c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
L.save(src,BLK,CIV,process.env.JSX);
