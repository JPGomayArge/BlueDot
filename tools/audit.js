#!/usr/bin/env node
// Auditoria de figuras: detecta contornos que no parecen geografia real.
//   caja          -> el poligono llena casi todo su rectangulo
//   ovalo         -> convexo y con muy pocos vertices para su tamaño
//   trazo grueso  -> banda alargada de anchura casi constante
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
// Fraccion de vertices que NO estan en la envolvente convexa. Una costa real
// tiene golfos y penínsulas: muchos vertices por dentro. Un ovalo dibujado a
// mano no tiene ninguno.
function concavos(r){
 const pts=r.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo=[];for(const p of pts){while(lo.length>=2&&cross(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
 const up=[];for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(up.length>=2&&cross(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}
 const hull=new Set(lo.slice(0,-1).concat(up.slice(0,-1)).map(p=>p[0]+','+p[1]));
 let n=0;for(const p of r)if(!hull.has(p[0]+','+p[1]))n++;
 return n/r.length;
}
const filas=[];
for(const c of CIV){
 let peor=null;
 for(const p of c.periods)for(const r of p.rings){
  const a=L.rA(r);if(a<10)continue;
  const [x0,x1,y0,y1]=L.bb(r);
  const llena=a/((x1-x0)*(y1-y0)||1e-9);
  const per=r.reduce((s,q,i)=>{const n=r[(i+1)%r.length];return s+Math.hypot(n[0]-q[0],n[1]-q[1])},0);
  const vgr=r.length/(per||1e-9);           // vertices por grado de contorno
  const cv=concavos(r);
  const comp=4*Math.PI*a/(per*per||1e-9);   // compacidad isoperimetrica
  const motivos=[];
  // una costa real tiene detalle: pocos vertices por grado de contorno y el
  // poligono llenando su rectangulo es la firma de un rectangulo dibujado a mano
  if(llena>0.92&&r.length<40)motivos.push('caja');
  if(cv<0.10&&comp>0.82&&r.length<14)motivos.push('ovalo');
  if(vgr<0.45)motivos.push('trazo grueso');
  if(!motivos.length)continue;
  if(!peor||a>peor.a)peor={id:c.id,a,pts:r.length,vgr,llena,cv,comp,motivo:motivos.join('+')};}
 if(peor)filas.push(peor);}
filas.sort((a,b)=>b.a-a.a);
console.log('civilizaciones con un anillo grande defectuoso: '+filas.length);
console.log('id                        area  pts   v/gr  llena   cv  comp  motivo');
for(const f of filas)console.log('  '+f.id.padEnd(24)+String(f.a.toFixed(0)).padStart(6)+
 String(f.pts).padStart(5)+'  '+f.vgr.toFixed(2)+'  '+(f.llena*100).toFixed(0).padStart(4)+'%  '+
 f.cv.toFixed(2)+'  '+f.comp.toFixed(2)+'  '+f.motivo);
const por={};for(const f of filas)for(const m of f.motivo.split('+'))por[m]=(por[m]||0)+1;
console.log('\npor motivo: '+JSON.stringify(por));
