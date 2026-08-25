#!/usr/bin/env node
// DOBLE PINTADO EXACTO, sin rejilla.
//
// barrido.js muestrea puntos de celdas: dice "cero" cuando ninguno de sus
// ~6.100 puntos cae en una zona compartida, no cuando no existe zona
// compartida. Cambiar la rejilla cambia el veredicto. Este script no muestrea:
// interseca los poligonos y mide el area real solapada. Es la definicion, no
// una aproximacion.
//
//   JSX=../app/index.jsx node dobles_exacto.js [areaMinima]
const pc=require('polygon-clipping');
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
const MIN=Number(process.argv[2]||0.001);   // grados cuadrados
const cajas=CIV.map(c=>L.caja(c));
const arco=CIV.map(c=>[Math.min(...c.periods.map(p=>p.start)),Math.max(...c.periods.map(p=>p.end))]);
const res=[];
let pares=0,comparados=0;
for(let i=0;i<CIV.length;i++){
 for(let j=i+1;j<CIV.length;j++){
  if(arco[i][1]<=arco[j][0]||arco[j][1]<=arco[i][0])continue;
  if(!L.cruza(cajas[i],cajas[j]))continue;
  pares++;
  let areaAños=0,peor=null;
  for(const a of CIV[i].periods){
   const ba=a.rings.map(L.bb);
   for(const b of CIV[j].periods){
    const ini=Math.max(a.start,b.start),fin=Math.min(a.end,b.end);
    if(fin<=ini)continue;
    // filtro por caja antes de intersecar, que es lo caro
    let toca=false;
    const bb2=b.rings.map(L.bb);
    for(let x=0;x<ba.length&&!toca;x++)for(let y=0;y<bb2.length;y++)if(L.cruza(ba[x],bb2[y])){toca=true;break}
    if(!toca)continue;
    comparados++;
    let inter;try{inter=pc.intersection(a.rings.map(r=>[r]),b.rings.map(r=>[r]))}catch(e){continue}
    if(!inter||!inter.length)continue;
    let ar=0;for(const poly of inter)ar+=L.rA(poly[0]);
    if(ar<1e-6)continue;
    areaAños+=ar*(fin-ini);
    if(!peor||ar>peor.ar)peor={ar,ini,fin};
   }}
  if(areaAños>MIN)res.push({a:CIV[i].id,b:CIV[j].id,areaAños:areaAños,peor});
 }}
res.sort((x,y)=>y.areaAños-x.areaAños);
const total=res.reduce((s,r)=>s+r.areaAños,0);
console.log('pares comparables '+pares+' | periodos intersecados '+comparados);
console.log('PARES CON SOLAPE REAL: '+res.length+' | grado2-año total: '+total.toFixed(1));
console.log('\nid_a                 id_b                   grado2-año   peor tramo (area en ese tramo)');
for(const r of res.slice(0,40))
 console.log('  '+r.a.padEnd(20)+' '+r.b.padEnd(22)+String(r.areaAños.toFixed(1)).padStart(10)+
  '   '+r.peor.ini+'..'+r.peor.fin+' ('+r.peor.ar.toFixed(2)+')');
if(res.length>40)console.log('  ... y '+(res.length-40)+' pares mas');
// el listado completo, para triaje
require('fs').writeFileSync(process.env.SALIDA||'/tmp/dobles.json',JSON.stringify(res));
