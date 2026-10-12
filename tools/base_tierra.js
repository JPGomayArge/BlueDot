#!/usr/bin/env node
// LA TIERRA SIN ENTIDAD NO ES UN AGUJERO NEGRO.
//
// Hasta ahora, donde ningun estado ni area cultural pintaba, el globo
// ensenaba la textura de satelite a pelo, y eso se lee como "aqui no hay
// nada": un error del mapa. Pero hay dos clases de vacio y conviene que se
// vean distintas: el deliberado (hielo, erg, Antartida: nadie vivio ahi) y el
// de "el mapa no tiene entidad registrada aqui todavia". Este archivo genera
// la capa de fondo del segundo: la tierra firme menos los vacios permanentes
// de vacios.js, a baja resolucion (1:110m), para que el renderizador la pinte
// con un velo neutro bajo las civilizaciones. Lo que quede con velo es lo
// que el mapa admite que no sabe; lo que quede negro es lo que afirma vacio.
//
//   node base_tierra.js            escribe base_tierra.json  [{anillo},...]
//   PASO=0.1                        tolerancia de simplificacion en grados
const fs=require('fs'),topo=require('topojson-client'),pc=require('polygon-clipping');
const T=require('./tierra.js'); const V=require('./vacios.js'); const R=require('./recorte.js'); const L=require('./lib.js');
const PASO=+(process.env.PASO||0.1);
const ruta=require.resolve('world-atlas/land-110m.json');
const lm=JSON.parse(fs.readFileSync(ruta,'utf8'));
const lf=topo.feature(lm,lm.objects.land); const f0=lf.features?lf.features[0]:lf;
const LAND=(f0.geometry.type==='Polygon'?[f0.geometry.coordinates]:f0.geometry.coordinates);
// anillos partidos en la linea de fecha, como hace tierra.js
let piezas=[]; for(const poly of LAND){ for(const r of poly){ for(const p of T.partirFecha(r)) piezas.push(p) } }
// solo exteriores: los agujeros de la mascara 110m son lagos grandes, que se quedan (el Caspio se pinta de velo: es tierra habitada alrededor, y a esta escala da igual)
let polys=[]; for(const poly of LAND){ const ext=poly[0]; for(const p of T.partirFecha(ext)) polys.push([p.concat([p[0]])]) }
const perm=V.TODO.filter(v=>v.desde==null).map(v=>v.poly?[v.poly.concat([v.poly[0]])]:[[[v.caja[0],v.caja[2]],[v.caja[1],v.caja[2]],[v.caja[1],v.caja[3]],[v.caja[0],v.caja[3]],[v.caja[0],v.caja[2]]]]);
// la resta va poligono a poligono: la pieza euroasiatica partida en la linea
// de fecha hace tropezar a polygon-clipping ("degenerate segment") si va en
// bloque; si una pieza falla igualmente, se reintenta con los vacios
// desplazados una millonesima y, si no, se deja sin restar y se avisa
const mueve=(mp,d)=>mp.map(poly=>poly.map(r=>r.map(q=>[q[0]+d,q[1]+d])));
let g=[], sinRestar=0;
for(const p of polys){ let ok=false;
 for(const d of [0,1e-6,-1e-6,3e-6]){ try{ g.push(...pc.difference([p],d?mueve(perm,d):perm)); ok=true; break }catch(e){} }
 if(!ok){ g.push(p); sinRestar++ } }
if(sinRestar)console.log('piezas sin restar vacios: '+sinRestar);
// simplificar (RDP) y redondear
function rdp(r,eps){ if(r.length<4)return r; const d2=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1];const l=dx*dx+dy*dy;if(!l)return (p[0]-a[0])**2+(p[1]-a[1])**2;let t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l;t=Math.max(0,Math.min(1,t));return (p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2};
 const keep=new Uint8Array(r.length); keep[0]=keep[r.length-1]=1; const st=[[0,r.length-1]];
 while(st.length){ const [a,b]=st.pop(); let m=-1,md=0; for(let i=a+1;i<b;i++){ const d=d2(r[i],r[a],r[b]); if(d>md){md=d;m=i} } if(m>=0&&md>eps*eps){keep[m]=1;st.push([a,m],[m,b])} }
 return r.filter((_,i)=>keep[i]) }
// los agujeros (un vacio dentro de un continente: Taklamakan, Rub al-Jali) se
// abren con la ranura de recorte.parte, porque el renderizador triangula
// anillos sin agujeros; luego cada anillo se simplifica y redondea
const out=[]; let nv=0, conAgujero=0;
for(const poly of g){ if(poly.length>1)conAgujero++;
 for(let r of R.parte(poly,0)){ if(r.length>1&&r[0][0]===r[r.length-1][0]&&r[0][1]===r[r.length-1][1])r=r.slice(0,-1);
 r=rdp(r.concat([r[0]]),PASO).slice(0,-1).map(p=>[Math.round(p[0]*100)/100,Math.round(p[1]*100)/100]);
 if(r.length<4)continue; if(Math.abs(L.rA(r))<0.05)continue;   // islotes que no se ven
 out.push(r); nv+=r.length } }
fs.writeFileSync(__dirname+'/base_tierra.json',JSON.stringify(out));
console.log('anillos: '+out.length+' (de '+conAgujero+' poligonos con agujero)  vertices: '+nv+'  -> base_tierra.json '+(fs.statSync(__dirname+'/base_tierra.json').size/1024).toFixed(0)+' KB');
