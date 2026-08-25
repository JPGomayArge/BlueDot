// Limpieza de resultados de polygon-clipping y recorte a la costa.
const pc=require('polygon-clipping');
const L=require('./lib.js');const G=require('./geoutil.js');const T=require('./tierra.js');
const R2=x=>x.map(q=>[Math.round(q[0]*100)/100,Math.round(q[1]*100)/100]);
const A=r=>{let a=0;for(let i=0;i<r.length;i++){const j=(i+1)%r.length;a+=r[i][0]*r[j][1]-r[j][0]*r[i][1]}return Math.abs(a/2)};
const cajaP=(x0,x1)=>[[[x0,-90],[x1,-90],[x1,90],[x0,90],[x0,-90]]];
// Cuando un recorte deja un agujero interior el poligono se PARTE con cortes
// verticales. Es preferible al ojo de cerradura: las ranuras de ancho cero
// del keyhole disparan el detector de auto-intersecciones, y "repararlas"
// vuelve a rellenar el agujero.
function parte(poly,prof){
 if(prof>5)return [poly[0]];
 if(poly.length===1)return [poly[0]];
 let cx=0,n=0;for(const h of poly.slice(1))for(const p of h){cx+=p[0];n++}
 cx=Math.round((cx/n)*1000)/1000;const out=[];
 for(const c of [cajaP(-200,cx),cajaP(cx,200)]){
  let res;try{res=pc.intersection(poly,c)}catch(e){return [poly[0]]}
  for(const q of res||[]){if(A(q[0])<1e-5)continue;out.push(...parte(q,prof+1))}}
 return out.length?out:[poly[0]];
}
function limpia(mp,min){
 const bruto=[];for(const poly of mp||[])bruto.push(...parte(poly,0));
 const o=[];
 for(const x0 of bruto){const x=R2(x0);const d=[];
  for(const q of x){const l=d[d.length-1];if(!l||l[0]!==q[0]||l[1]!==q[1])d.push(q)}
  if(d.length>1&&d[0][0]===d[d.length-1][0]&&d[0][1]===d[d.length-1][1])d.pop();
  if(d.length>=4&&Math.abs(L.rA(d))>(min||3e-4))o.push(L.rA(d)<0?d.reverse():d)}
 return o;
}
function aTierra(poly){
 const p=(poly[0][0]===poly[poly.length-1][0]&&poly[0][1]===poly[poly.length-1][1])?poly.slice(0,-1):poly;
 const b=G.bbx(p);const cerca=T.PZ.filter(x=>G.hit(b,x.b)).map(x=>x.poly);
 let res=[];try{res=limpia(pc.intersection([[p]],cerca),0.02)}catch(e){}
 return res.length?res:[R2(p)];
}
module.exports={limpia,aTierra,parte,R2,A};
