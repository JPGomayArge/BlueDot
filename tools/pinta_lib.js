// Rasterizador del mapa. `pinta.js` lo usa para una ventana suelta y
// `contacto.js` para una hoja de contacto de muchas.
//
// Dibuja lo mismo que el globo -relleno por entidad, contorno por anillo- y la
// costa de la mascara en gris como referencia: si el contorno de una entidad
// costera no sigue la linea gris, se ve. Aplica las dos pruebas de junta
// interna del renderizador, asi que lo que sale aqui es lo que se vera en el
// telefono y no una version idealizada.
const zlib=require('zlib');
const fs=require('fs');
const L=require('./lib.js');
const T=require('./tierra.js');

// Fuente de 5x7 para los rotulos. Sin ella una hoja de contacto de doce
// paneles es un acertijo: se ven doce mapas y no se sabe de que anio es cada
// uno, que es justo lo que hace falta saber cuando se busca en que siglo
// aparecio un defecto.
const FUENTE={
 '0':['11111','10001','10001','10001','10001','10001','11111'],
 '1':['00100','01100','00100','00100','00100','00100','01110'],
 '2':['11111','00001','00001','11111','10000','10000','11111'],
 '3':['11111','00001','00001','11111','00001','00001','11111'],
 '4':['10001','10001','10001','11111','00001','00001','00001'],
 '5':['11111','10000','10000','11111','00001','00001','11111'],
 '6':['11111','10000','10000','11111','10001','10001','11111'],
 '7':['11111','00001','00010','00100','01000','01000','01000'],
 '8':['11111','10001','10001','11111','10001','10001','11111'],
 '9':['11111','10001','10001','11111','00001','00001','11111'],
 '-':['00000','00000','00000','11111','00000','00000','00000'],
 ' ':['00000','00000','00000','00000','00000','00000','00000'],
 'a':['11111','10001','10001','11111','10001','10001','10001'],
 'C':['11111','10000','10000','10000','10000','10000','11111'],
 '.':['00000','00000','00000','00000','00000','00000','01100'],
};

function nuevoLienzo(W,H,gris){ const b=Buffer.alloc(W*H*3, gris==null?12:gris); return b }

function texto(buf,W,H,s,x0,y0,esc,r,g,bl){
 let x=x0;
 for(const ch of s){ const gl=FUENTE[ch]||FUENTE[' '];
  for(let j=0;j<7;j++)for(let i=0;i<5;i++){
   if(gl[j][i]!=='1')continue;
   for(let a=0;a<esc;a++)for(let b2=0;b2<esc;b2++){
    const px=x+i*esc+a, py=y0+j*esc+b2;
    if(px<0||py<0||px>=W||py>=H)continue;
    const k=(py*W+px)*3; buf[k]=r; buf[k+1]=g; buf[k+2]=bl; } }
  x+=6*esc; }
}

const col=h=>{ h=(h||'#888').replace('#',''); if(h.length===3)h=h.split('').map(c=>c+c).join('');
 return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)] };
const R4=v=>v.toFixed(4);
const cla=(a,b)=>{const ka=R4(a[0])+' '+R4(a[1]),kb=R4(b[0])+' '+R4(b[1]);return ka<kb?ka+'|'+kb:kb+'|'+ka};

// Pinta una ventana dentro de `buf` en el rectangulo (ox,oy,W,H).
function panel(buf,BW,BH,ox,oy,W,H,CIV,A,caja,opt){
 opt=opt||{};
 const [X0,X1,Y0,Y1]=caja;
 const px=p=>[ ox+(p[0]-X0)/(X1-X0)*W, oy+(1-(p[1]-Y0)/(Y1-Y0))*H ];
 const pon=(x,y,r,g,b)=>{ x|=0;y|=0; if(x<ox||y<oy||x>=ox+W||y>=oy+H||x>=BW||y>=BH)return;
  const i=(y*BW+x)*3; buf[i]=r;buf[i+1]=g;buf[i+2]=b };
 const mezcla=(x,y,r,g,b,a)=>{ x|=0;y|=0; if(x<ox||y<oy||x>=ox+W||y>=oy+H||x>=BW||y>=BH)return;
  const i=(y*BW+x)*3; buf[i]=buf[i]*(1-a)+r*a; buf[i+1]=buf[i+1]*(1-a)+g*a; buf[i+2]=buf[i+2]*(1-a)+b*a };
 const linea=(a,b,r,g,bl,gordo)=>{ const [x1,y1]=px(a),[x2,y2]=px(b);
  const n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)));
  for(let i=0;i<=n;i++){ const t=i/n,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;
   pon(x,y,r,g,bl); if(gordo){pon(x+1,y,r,g,bl);pon(x,y+1,r,g,bl)} } };
 const rellena=(ring,r,g,b,a)=>{
  const pts=ring.map(px);
  let ya=Math.max(oy,Math.floor(Math.min(...pts.map(p=>p[1])))), yb=Math.min(oy+H-1,Math.ceil(Math.max(...pts.map(p=>p[1]))));
  for(let y=ya;y<=yb;y++){ const c=[];
   for(let i=0;i<pts.length;i++){ const p=pts[i],q=pts[(i+1)%pts.length];
    if((p[1]<=y+0.5)===(q[1]<=y+0.5))continue;
    c.push(p[0]+(y+0.5-p[1])/(q[1]-p[1])*(q[0]-p[0])); }
   c.sort((u,v)=>u-v);
   for(let k=0;k+1<c.length;k+=2)
    for(let x=Math.max(ox,Math.ceil(c[k]));x<=Math.min(ox+W-1,Math.floor(c[k+1]));x++) mezcla(x,y,r,g,b,a); } };

 for(const z of T.PLANO)for(const f of z.fuera){ const b=f.b;
  if(b[1]<X0||b[0]>X1||b[3]<Y0||b[2]>Y1)continue;
  for(let i=0;i<f.r.length;i++){ const p=f.r[i],q=f.r[(i+1)%f.r.length];
   if(Math.abs(p[0]-q[0])>90)continue; linea(p,q,68,72,78,false) } }

 let n=0;
 for(const c of CIV){
  if(opt.solo&&!opt.solo.has(c.id))continue;
  const p=c.periods.find(p=>p.start<=A&&p.end>A); if(!p||!p.rings.length)continue;
  const [r,g,b]=col(c.color);
  let visible=false;
  for(const ring of p.rings){ const bb=L.bb(ring);
   if(bb[1]<X0||bb[0]>X1||bb[3]<Y0||bb[2]>Y1)continue; visible=true; rellena(ring,r,g,b,0.48) }
  if(!visible)continue; n++;
  const cuenta=new Map();
  for(const ring of p.rings)for(let i=0;i<ring.length;i++){
   const k=cla(ring[i],ring[(i+1)%ring.length]); cuenta.set(k,(cuenta.get(k)||0)+1) }
  const dentroTerr=(x,y)=>{ for(const rg of p.rings) if(L.pip([x,y],rg))return true; return false };
  const junta=(a,b)=>{ const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
   if(len<0.3)return false; if(Math.abs(dx)>1e-9&&Math.abs(dy)>1e-9)return false;
   const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,nx=-dy/len*0.03,ny=dx/len*0.03;
   return dentroTerr(mx+nx,my+ny)&&dentroTerr(mx-nx,my-ny) };
  for(const ring of p.rings){ const bb=L.bb(ring);
   if(bb[1]<X0||bb[0]>X1||bb[3]<Y0||bb[2]>Y1)continue;
   for(let i=0;i<ring.length;i++){
    const a1=ring[i],a2=ring[(i+1)%ring.length];
    const interna=cuenta.get(cla(a1,a2))>1||junta(a1,a2);
    if(interna){ if(opt.costuras)linea(a1,a2,255,40,40,true); continue }
    linea(a1,a2,Math.min(255,r+90),Math.min(255,g+90),Math.min(255,b+90),false);
   } }
 }
 return n;
}

function png(buf,W,H,ruta){
 const cruda=Buffer.alloc((W*3+1)*H);
 for(let y=0;y<H;y++){ cruda[y*(W*3+1)]=0; buf.copy(cruda,y*(W*3+1)+1,y*W*3,(y+1)*W*3) }
 const tab=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;tab[n]=c>>>0}
 const crc=b=>{let c=0xFFFFFFFF;for(const x of b)c=tab[(c^x)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
 const trozo=(tipo,datos)=>{ const len=Buffer.alloc(4); len.writeUInt32BE(datos.length);
  const cuerpo=Buffer.concat([Buffer.from(tipo),datos]);
  const c=Buffer.alloc(4); c.writeUInt32BE(crc(cuerpo)); return Buffer.concat([len,cuerpo,c]) };
 const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(W,0); ihdr.writeUInt32BE(H,4);
 ihdr[8]=8;ihdr[9]=2;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
 fs.writeFileSync(ruta, Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),
  trozo('IHDR',ihdr), trozo('IDAT',zlib.deflateSync(cruda,{level:9})), trozo('IEND',Buffer.alloc(0))]));
}
module.exports={nuevoLienzo,panel,png,texto};
