#!/usr/bin/env node
// EL CLIMA COMO FRONTERA.
//
// Los sustratos -los pueblos sin estado que llenan el mapa antes y entre los
// estados- no tienen fronteras politicas: tienen biomas. Los cazadores de la
// taiga acaban donde acaba la taiga; los pastores de renos viven en la tundra;
// los nomadas, en la estepa; los agricultores del bosque, en el bosque. Hasta
// ahora esas lindes eran cajas dibujadas a mano, y por eso el mapa tenia
// ochocientas entidades con lados rectos.
//
// La clasificacion de Koppen-Geiger a medio grado (Kottek et al., del paquete
// npm koppen-climate-lookup) da esos biomas para toda la Tierra. Esta
// herramienta la convierte en poligonos por grupo de clima, y los suaviza:
// la malla de medio grado es una escalera, y una escalera en un globo es peor
// que una caja. Cada contorno pasa dos veces por el corte de esquinas de
// Chaikin y despues se simplifica, con lo que sale una curva del ancho de la
// celda que ya no ensena los pixeles.
//
// Grupos (los que las tablas de ambitos pueden pedir con `bioma:`):
//   hielo      EF            tundra     ET
//   taiga      Dfc Dfd Dwc Dwd Dsc Dsd     continental  Dfa Dfb Dwa Dwb Dsa Dsb
//   estepa     BSk BSh       desierto   BWk BWh
//   mediterraneo Csa Csb Csc  oceanico  Cfb Cfc        subtropical  Cfa Cwa Cwb Cwc
//   sabana     Aw As         monzon     Am             selva        Af
// Es el clima de hoy (1976-2000). Para el Sahara verde o el Holoceno humedo
// manda vacios.js, que ya lleva el tiempo.
//
//   node clima.js --convertir        escribe clima.json
//   node clima.js <grupo> <lon> <lat>   dice si el punto cae en el grupo
const fs=require('fs'); const path=require('path');
const RUTA=process.env.CLIMA||path.join(__dirname,'clima.json');
const GRUPOS={hielo:['EF'],tundra:['ET'],taiga:['Dfc','Dfd','Dwc','Dwd','Dsc','Dsd'],continental:['Dfa','Dfb','Dwa','Dwb','Dsa','Dsb'],
 estepa:['BSk','BSh'],desierto:['BWk','BWh'],mediterraneo:['Csa','Csb','Csc'],oceanico:['Cfb','Cfc'],subtropical:['Cfa','Cwa','Cwb','Cwc'],
 sabana:['Aw','As'],monzon:['Am'],selva:['Af']};
const PASO=0.5, NX=720, NY=360;   // celdas de medio grado, centros en .25/.75

function leerMalla(){
 let src; try{ src=fs.readFileSync(require.resolve('koppen-climate-lookup/dist/index.js'),'utf8') }catch(e){ src=fs.readFileSync(path.join('/tmp/node_modules/koppen-climate-lookup/dist/index.js'),'utf8') }
 const i=src.indexOf('var koppen_default = "')+22, j=src.indexOf('";',i);
 const csv=src.slice(i,j).split('\\n');
 const m=new Array(NX*NY).fill(''); let n=0;
 for(const l of csv.slice(1)){ const [la,lo,k]=l.split(','); if(!k)continue;
  const x=Math.floor((+lo+180)/PASO), y=Math.floor((+la+90)/PASO); if(x<0||x>=NX||y<0||y>=NY)continue; m[x*NY+y]=k; n++ }
 return {m,n};
}
// contornos de una mascara binaria: aristas de celda entre dentro y fuera,
// encadenadas en anillos. Un anillo horario es exterior; antihorario, hueco.
function contornos(dentro){
 const aristas=new Map(); const clave=(x,y)=>x+','+y;
 const add=(a,b)=>{ const k=clave(a[0],a[1]); let l=aristas.get(k); if(!l)aristas.set(k,l=[]); l.push(b) };
 for(let x=0;x<NX;x++)for(let y=0;y<NY;y++){ if(!dentro(x,y))continue;
  // la celda [x,x+1]x[y,y+1] en coordenadas de malla; aristas en sentido horario (interior a la derecha)
  if(!dentro(x,y-1))add([x,y],[x+1,y]);        // sur
  if(!dentro(x+1,y))add([x+1,y],[x+1,y+1]);    // este
  if(!dentro(x,y+1))add([x+1,y+1],[x,y+1]);    // norte
  if(!dentro(x-1,y))add([x,y+1],[x,y]);        // oeste
 }
 const anillos=[];
 for(const [k0,l0] of aristas){ while(l0.length){
  const ini=k0.split(',').map(Number); let cur=l0.pop(); const ring=[ini];
  for(let paso=0;paso<2e6;paso++){ ring.push(cur); const kk=clave(cur[0],cur[1]); if(kk===k0)break;
   const l=aristas.get(kk); if(!l||!l.length)break;
   // preferir girar a la derecha para no mezclar dos anillos que se tocan en un vertice
   let sel=0; if(l.length>1){ const prev=ring[ring.length-2]; const dx=cur[0]-prev[0],dy=cur[1]-prev[1];
    let best=-9; for(let i=0;i<l.length;i++){ const ex=l[i][0]-cur[0],ey=l[i][1]-cur[1]; const cross=dx*ey-dy*ex; const s=-cross; if(s>best){best=s;sel=i} } }
   cur=l.splice(sel,1)[0] }
  ring.pop(); if(ring.length>=4)anillos.push(ring) } }
 return anillos;
}
const area=r=>{let a=0;for(let i=0;i<r.length;i++){const j=(i+1)%r.length;a+=r[i][0]*r[j][1]-r[j][0]*r[i][1]}return a/2};
// media movil sobre el contorno cerrado (ventana 2k+1): quita el escalon de la
// malla antes de redondear; Chaikin solo lo redondeaba, y una escalera
// redondeada sigue siendo una escalera
function suaviza(r,k){ const n=r.length; if(n<2*k+3)return r; const o=[];
 for(let i=0;i<n;i++){ let x=0,y=0; for(let d=-k;d<=k;d++){ const q=r[(i+d+n)%n]; x+=q[0]; y+=q[1] } o.push([x/(2*k+1),y/(2*k+1)]) }
 return o }
function chaikin(r){ const o=[]; const n=r.length;
 for(let i=0;i<n;i++){ const a=r[i],b=r[(i+1)%n]; o.push([0.75*a[0]+0.25*b[0],0.75*a[1]+0.25*b[1]]); o.push([0.25*a[0]+0.75*b[0],0.25*a[1]+0.75*b[1]]) }
 return o }
function rdp(r,eps){ // cerrado: se abre por el vertice 0 y se cierra despues
 const d=(p,a,b)=>{ const dx=b[0]-a[0],dy=b[1]-a[1]; const l2=dx*dx+dy*dy; if(!l2)return Math.hypot(p[0]-a[0],p[1]-a[1]);
  let t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2; t=Math.max(0,Math.min(1,t)); return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy) };
 const rec=(pts)=>{ if(pts.length<3)return pts; let mi=0,md=-1; for(let i=1;i<pts.length-1;i++){const dd=d(pts[i],pts[0],pts[pts.length-1]); if(dd>md){md=dd;mi=i}}
  if(md>eps){ const a=rec(pts.slice(0,mi+1)), b=rec(pts.slice(mi)); return a.slice(0,-1).concat(b) } return [pts[0],pts[pts.length-1]] };
 const abierto=r.concat([r[0]]); const s=rec(abierto); s.pop(); return s }
const R2=p=>[Math.round(p[0]*100)/100,Math.round(p[1]*100)/100];

function convertir(){
 const {m,n}=leerMalla(); console.log('celdas con clase: '+n);
 const out={paso:PASO,grupos:{}};
 for(const [g,clases] of Object.entries(GRUPOS)){ const set=new Set(clases);
  const dentro=(x,y)=>x>=0&&x<NX&&y>=0&&y<NY&&set.has(m[x*NY+y]);
  const rs=contornos(dentro);
  const polis=[]; let nh=0;
  for(const r0 of rs){ const a=area(r0); if(Math.abs(a)<2)continue;   // menos de dos celdas: ruido
   let r=r0.map(p=>[p[0]*PASO-180,p[1]*PASO-90]);
   r=suaviza(r,2); r=chaikin(chaikin(r)); r=rdp(r,0.05).map(R2);
   if(r.length<4)continue;
   polis.push({r,hueco:a>0});   // horario (a>0 en malla) = exterior segun el trazado; se comprueba abajo
   if(a>0)nh++ }
  // en el trazado las aristas van con el interior a la derecha: el exterior sale ANTIHORARIO en coordenadas (x,y) matematicas
  for(const p of polis)p.hueco=!p.hueco;
  // los huecos pequenos se rellenan: un claro de clima de montana de tres
  // grados2 dentro de la taiga no es una frontera entre pueblos, y cada hueco
  // obliga a partir el poligono en tiras (los pueblos del Amur salian con
  // dieciocho mil anillos)
  const areaG=r=>Math.abs(area(r));
  out.grupos[g]={anillos:polis.filter(p=>!p.hueco).map(p=>p.r),huecos:polis.filter(p=>p.hueco&&areaG(p.r)>=6).map(p=>p.r)};
  console.log(g.padEnd(13)+String(out.grupos[g].anillos.length).padStart(5)+' anillos'+String(out.grupos[g].huecos.length).padStart(5)+' huecos  '+
   out.grupos[g].anillos.reduce((s,r)=>s+Math.abs(area(r)),0).toFixed(0)+' g2') }
 fs.writeFileSync(RUTA,JSON.stringify(out)); console.log('escrito '+RUTA+' ('+(fs.statSync(RUTA).size/1048576).toFixed(1)+' MB)');
}
let CACHE=null;
function datos(){ if(!CACHE)CACHE=JSON.parse(fs.readFileSync(RUTA,'utf8')); return CACHE }
function grupo(nombre){ const g=datos().grupos[nombre]; if(!g)throw new Error('bioma desconocido: '+nombre+' (hay '+Object.keys(datos().grupos).join(', ')+')'); return g }
const pip=(pt,r)=>{let[x,y]=pt,I=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const[a,b]=r[i],[c,d]=r[j];if((b>y)!=(d>y)&&x<(c-a)*(y-b)/(d-b)+a)I=!I}return I};
function en(nombre,pt){ const g=grupo(nombre); return g.anillos.some(r=>pip(pt,r))&&!g.huecos.some(r=>pip(pt,r)) }
if(require.main===module){
 if(process.argv.includes('--convertir'))convertir();
 else { const [g,lo,la]=process.argv.slice(2); console.log(en(g,[+lo,+la])) }
} else module.exports={datos,grupo,en,GRUPOS};
