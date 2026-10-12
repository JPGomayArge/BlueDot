#!/usr/bin/env node
// MIRAR EL MAPA. Rasteriza una ventana del globo en un anio dado.
//
// Toda la campana se ha medido a ciegas: areas, solapes, sondeos, porcentajes.
// Los dos defectos que el usuario senalo -las lineas que cruzan Estados Unidos
// y las formas en H del Amazonas- no los habria encontrado ninguna de esas
// medidas, porque **ninguna miraba**. Un rectangulo y una cuenca del mismo
// tamano dan el mismo numero en todas ellas.
//
// Dibuja lo mismo que el globo: relleno por entidad y contorno por anillo, mas
// la costa de la mascara de tierra como referencia -si el contorno de una
// entidad costera no sigue la linea gris, se ve-. Con `COSTURAS=1` marca en
// rojo las aristas que comparten dos anillos del mismo periodo, que es lo que
// el renderizador dibujaba de mas.
//
//   JSX=<mapa> node pinta.js <anio> <lonMin,lonMax,latMin,latMax> <salida.png>
//   ANCHO=<px> (1200)  COSTURAS=1  SOLO=<id,id,...>
const fs=require('fs');
const L=require('./lib.js');
const T=require('./tierra.js');
const {CIV}=L.load(process.env.JSX);
const A=+process.argv[2];
const [X0,X1,Y0,Y1]=(process.argv[3]||'-180,180,-56,78').split(',').map(Number);
const SAL=process.argv[4]||'/tmp/mapa.png';
const W=+(process.env.ANCHO||1200);
const H=Math.max(1,Math.round(W*(Y1-Y0)/(X1-X0)));
const SOLO=process.env.SOLO?new Set(process.env.SOLO.split(',')):null;
const px=p=>[ (p[0]-X0)/(X1-X0)*W, (1-(p[1]-Y0)/(Y1-Y0))*H ];

const buf=Buffer.alloc(W*H*3, 12);
const pon=(x,y,r,g,b)=>{ x|=0; y|=0; if(x<0||y<0||x>=W||y>=H)return;
 const i=(y*W+x)*3; buf[i]=r; buf[i+1]=g; buf[i+2]=b };
const mezcla=(x,y,r,g,b,a)=>{ x|=0; y|=0; if(x<0||y<0||x>=W||y>=H)return;
 const i=(y*W+x)*3;
 buf[i]=buf[i]*(1-a)+r*a; buf[i+1]=buf[i+1]*(1-a)+g*a; buf[i+2]=buf[i+2]*(1-a)+b*a };
function linea(a,b,r,g,bl,gordo){
 const [x1,y1]=px(a),[x2,y2]=px(b);
 const n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)));
 for(let i=0;i<=n;i++){ const t=i/n, x=x1+(x2-x1)*t, y=y1+(y2-y1)*t;
  pon(x,y,r,g,bl); if(gordo){pon(x+1,y,r,g,bl);pon(x,y+1,r,g,bl)} }
}
// relleno por barrido de lineas horizontales (par-impar sobre un solo anillo)
function rellena(ring,r,g,b,a){
 const ys=ring.map(p=>px(p)[1]);
 let y0=Math.max(0,Math.floor(Math.min(...ys))), y1=Math.min(H-1,Math.ceil(Math.max(...ys)));
 const pts=ring.map(px);
 for(let y=y0;y<=y1;y++){
  const cortes=[];
  for(let i=0;i<pts.length;i++){
   const p=pts[i], q=pts[(i+1)%pts.length];
   if((p[1]<=y+0.5)===(q[1]<=y+0.5))continue;
   cortes.push(p[0]+(y+0.5-p[1])/(q[1]-p[1])*(q[0]-p[0]));
  }
  cortes.sort((u,v)=>u-v);
  for(let k=0;k+1<cortes.length;k+=2)
   for(let x=Math.max(0,Math.ceil(cortes[k]));x<=Math.min(W-1,Math.floor(cortes[k+1]));x++)
    mezcla(x,y,r,g,b,a);
 }
}
// el velo de la tierra sin entidad (base_tierra.json), como en la app: un tono
// neutro bajo todo; lo que quede con velo y sin color es lo que el mapa no sabe
if(!process.env.SINVELO){ try{ const base=JSON.parse(fs.readFileSync(__dirname+'/base_tierra.json','utf8'));
 for(const ring of base){ const bb=L.bb(ring); if(bb[1]<X0||bb[0]>X1||bb[3]<Y0||bb[2]>Y1)continue; rellena(ring,203,189,158,0.20) } }catch(e){} }
// costa de referencia
for(const z of T.PLANO)for(const f of z.fuera){
 const b=f.b; if(b[1]<X0||b[0]>X1||b[3]<Y0||b[2]>Y1)continue;
 for(let i=0;i<f.r.length;i++){ const p=f.r[i],q=f.r[(i+1)%f.r.length];
  if(Math.abs(p[0]-q[0])>90)continue; linea(p,q,70,74,80,false) } }

const col=h=>{ h=(h||'#888').replace('#',''); if(h.length===3)h=h.split('').map(c=>c+c).join('');
 return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)] };
const R4=v=>v.toFixed(4);
const cla=(a,b)=>{const ka=R4(a[0])+' '+R4(a[1]),kb=R4(b[0])+' '+R4(b[1]);return ka<kb?ka+'|'+kb:kb+'|'+ka};
let n=0;
for(const c of CIV){
 if(SOLO&&!SOLO.has(c.id))continue;
 const p=c.periods.find(p=>p.start<=A&&p.end>A); if(!p||!p.rings.length)continue;
 const [r,g,b]=col(c.color);
 const cult=c.kind==='cultura';   // sustrato: relleno mas tenue y borde suave, como en la app
 const cuenta=new Map();
 for(const ring of p.rings)for(let i=0;i<ring.length;i++){
  const k=cla(ring[i],ring[(i+1)%ring.length]); cuenta.set(k,(cuenta.get(k)||0)+1) }
 let visible=false;
 for(const ring of p.rings){ const bb=L.bb(ring);
  if(bb[1]<X0||bb[0]>X1||bb[3]<Y0||bb[2]>Y1)continue; visible=true;
  rellena(ring,r,g,b,cult?0.34:0.45);
 }
 // misma prueba que el renderizador: arista repetida, o arista recta larga con
 // relleno del mismo territorio a los dos lados
 const dentroTerr=(x,y)=>{ for(const rg of p.rings) if(L.pip([x,y],rg))return true; return false };
 const juntaInterior=(a,b)=>{ const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
  if(len<0.1)return false; if(Math.abs(dx)>1e-9&&Math.abs(dy)>1e-9)return false;
  const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,nx=-dy/len*0.05,ny=dx/len*0.05;   // a cinco centesimas: el otro lado del canal de la ranura
  return dentroTerr(mx+nx,my+ny)&&dentroTerr(mx-nx,my-ny) };
 if(!visible)continue; n++;
 for(const ring of p.rings){ const bb=L.bb(ring);
  if(bb[1]<X0||bb[0]>X1||bb[3]<Y0||bb[2]>Y1)continue;
  for(let i=0;i<ring.length;i++){
   const a1=ring[i], a2=ring[(i+1)%ring.length];
   const compartida=cuenta.get(cla(a1,a2))>1 || juntaInterior(a1,a2);
   if(compartida && !process.env.COSTURAS)continue;   // el renderizador ya no la pinta
   if(compartida) linea(a1,a2,255,40,40,true);
   else if(cult) linea(a1,a2,Math.min(255,r+25),Math.min(255,g+25),Math.min(255,b+25),false);
   else linea(a1,a2,Math.min(255,r+90),Math.min(255,g+90),Math.min(255,b+90),false);
  }
 }
}
// PNG sin dependencias: un solo IDAT con deflate almacenado no, mejor zlib
const zlib=require('zlib');
const cruda=Buffer.alloc((W*3+1)*H);
for(let y=0;y<H;y++){ cruda[y*(W*3+1)]=0; buf.copy(cruda,y*(W*3+1)+1,y*W*3,(y+1)*W*3) }
const crc=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}
 return b=>{let c=0xFFFFFFFF;for(const x of b)c=t[(c^x)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}})();
const trozo=(tipo,datos)=>{ const len=Buffer.alloc(4); len.writeUInt32BE(datos.length);
 const cuerpo=Buffer.concat([Buffer.from(tipo),datos]);
 const c=Buffer.alloc(4); c.writeUInt32BE(crc(cuerpo)); return Buffer.concat([len,cuerpo,c]) };
const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(W,0); ihdr.writeUInt32BE(H,4);
ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
fs.writeFileSync(SAL, Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),
 trozo('IHDR',ihdr), trozo('IDAT',zlib.deflateSync(cruda)), trozo('IEND',Buffer.alloc(0))]));
console.log(SAL+'  '+W+'x'+H+'  anio '+A+'  entidades visibles '+n);
