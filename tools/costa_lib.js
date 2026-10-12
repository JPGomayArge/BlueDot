// INDICE ESPACIAL DE LA COSTA.
//
// La mascara `tierra.js` trae 1.422 anillos de tierra y 59.995 vertices a
// 1:50 millones. Para preguntar "a que distancia esta este punto de la costa"
// cientos de miles de veces hace falta no recorrerlos todos cada vez: se
// trocean los segmentos en una rejilla de un grado y la consulta mira su celda
// y las ocho vecinas.
const T=require('./tierra.js');
const CEL=1;                       // grados por celda
const REJ=new Map();
const seg=[];
for(const z of T.PLANO){
 for(const f of z.fuera){
  const r=f.r;
  for(let i=0;i<r.length;i++){
   const a=r[i], b=r[(i+1)%r.length];
   if(Math.abs(a[0]-b[0])>90)continue;      // costura de la linea de fecha
   const k=seg.length; seg.push([a,b]);
   const x0=Math.floor(Math.min(a[0],b[0])/CEL), x1=Math.floor(Math.max(a[0],b[0])/CEL);
   const y0=Math.floor(Math.min(a[1],b[1])/CEL), y1=Math.floor(Math.max(a[1],b[1])/CEL);
   for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){
    const kk=x+','+y; let l=REJ.get(kk); if(!l)REJ.set(kk,l=[]); l.push(k);
   }
  }
 }
}
// distancia de un punto a un segmento, en grados planos
function d2seg(p,a,b){
 const dx=b[0]-a[0], dy=b[1]-a[1], l2=dx*dx+dy*dy;
 let t = l2 ? ((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2 : 0;
 t=Math.max(0,Math.min(1,t));
 return Math.hypot(p[0]-(a[0]+t*dx), p[1]-(a[1]+t*dy));
}
// distancia a la costa mas cercana. Devuelve Infinity si no hay costa en el
// radio de busqueda (se amplia el anillo de celdas hasta `max` grados).
function aCosta(p,max){
 max=max||3;
 const cx=Math.floor(p[0]/CEL), cy=Math.floor(p[1]/CEL);
 let mejor=Infinity;
 for(let r=0;r<=Math.ceil(max/CEL);r++){
  for(let x=cx-r;x<=cx+r;x++)for(let y=cy-r;y<=cy+r;y++){
   if(r>0 && Math.abs(x-cx)!==r && Math.abs(y-cy)!==r)continue;   // solo el anillo
   const l=REJ.get(x+','+y); if(!l)continue;
   for(const k of l){const d=d2seg(p,seg[k][0],seg[k][1]); if(d<mejor)mejor=d}
  }
  if(mejor<=r*CEL)break;     // ya no puede mejorar en anillos mas lejanos
 }
 return mejor;
}
// longitud total de costa dentro de una caja, y los puntos medios de sus
// segmentos, para poder preguntar quien los posee.
function costaEn(caja){
 const [x0,x1,y0,y1]=caja; const out=[];
 for(let x=Math.floor(x0/CEL);x<=Math.floor(x1/CEL);x++)
  for(let y=Math.floor(y0/CEL);y<=Math.floor(y1/CEL);y++){
   const l=REJ.get(x+','+y); if(!l)continue;
   for(const k of l){const [a,b]=seg[k];
    const mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2;
    if(mx<x0||mx>x1||my<y0||my>y1)continue;
    out.push({m:[mx,my], len:Math.hypot(b[0]-a[0],b[1]-a[1]), k});
   }}
 // la rejilla puede repetir un segmento en varias celdas
 const vistos=new Set(); return out.filter(s=>!vistos.has(s.k)&&vistos.add(s.k));
}
module.exports={aCosta,costaEn,CEL,nSeg:seg.length};
