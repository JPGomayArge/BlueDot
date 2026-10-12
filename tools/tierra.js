// Mascara de tierra a 1:50 millones (world-atlas land-50m).
// Se usa para recortar cualquier poligono a la costa. Ojo: a esta resolucion
// hay ciudades reales que caen en agua (Estambul, Copenhague, Goa, Mahdia).
const fs=require('fs'),topo=require('topojson-client');
const G=require('./geoutil.js');
function cargar(){
 const ruta=require.resolve('world-atlas/land-50m.json');
 const lm=JSON.parse(fs.readFileSync(ruta,'utf8'));
 const lf=topo.feature(lm,lm.objects.land); const f0=lf.features?lf.features[0]:lf;
 return (f0.geometry.type==='Polygon'?[f0.geometry.coordinates]:f0.geometry.coordinates);
}
const LAND=cargar();
const PZ=LAND.map(poly=>({b:G.bbx(poly[0]),poly}));

// ---------------------------------------------------------------------------
// enTierra tenia DOS fallos superpuestos, y entre los dos llevaba rondas
// diciendo que Mo i Rana, Tromso y toda Laponia eran AGUA, y que el mar abierto
// a 8E/67N era TIERRA. Se descubrio en la ronda 14, al redibujar una caja
// oceanica de `denmark` que el audit describia como "86% tierra".
//
// FALLO 1 - paridad global. Se contaba cuantos anillos del mundo entero
// contenian el punto y se miraba la paridad del total. La paridad solo es
// valida DENTRO de un poligono, entre su contorno exterior y sus propios
// agujeros: mezclando anillos de poligonos distintos, un punto que cae en dos
// contornos que se solapan suma dos y pasa por agua.
//
// FALLO 2 - el antimeridiano, que es el grave. El contorno euroasiatico cruza
// la linea de fecha en Chukotka, asi que el anillo tiene dos saltos de casi
// 360 grados de longitud entre vertices consecutivos. El trazado de rayo los
// trata como aristas reales que atraviesan el globo entero, y cuenta cruces
// falsos en toda latitud comprendida en el salto. El algoritmo de lib.pip es
// correcto; lo que no era valido es darle un anillo que envuelve el planeta.
// polygon-clipping da exactamente los mismos errores por la misma razon, asi
// que no valia como recambio.
//
// La solucion es partir los anillos en la linea de fecha ANTES de usarlos:
// donde hay un salto se interpola la latitud del cruce, se cierra la pieza en
// +-180 y se empieza otra. Cada pieza queda como un poligono plano normal.
// ---------------------------------------------------------------------------
function partirFecha(anillo){
 let saltos=false;
 for(let i=0;i<anillo.length;i++){
  const q=anillo[(i+1)%anillo.length];
  if(Math.abs(q[0]-anillo[i][0])>180){saltos=true;break}}
 if(!saltos)return [anillo];
 const piezas=[]; let cur=[];
 for(let i=0;i<anillo.length;i++){
  const p=anillo[i], q=anillo[(i+1)%anillo.length];
  cur.push(p);
  const d=q[0]-p[0];
  if(Math.abs(d)>180){
   // Se cruza el antimeridiano. Se desenrolla q al lado de p para interpolar.
   const qx = d<0 ? q[0]+360 : q[0]-360;
   const borde = d<0 ? 180 : -180;
   const t = (borde-p[0])/(qx-p[0]);
   const lat = p[1] + t*(q[1]-p[1]);
   cur.push([borde,lat]);
   piezas.push(cur);
   cur=[[-borde,lat]];                 // la pieza siguiente arranca al otro lado
  }
 }
 if(cur.length)piezas.push(cur);
 // Si la primera y la ultima pieza son continuas -el anillo empezaba a mitad
 // de un tramo- se cosen, para no dejar dos medias piezas abiertas.
 if(piezas.length>1){
  const pri=piezas[0], ult=piezas[piezas.length-1];
  if(Math.abs(ult[ult.length-1][0]-pri[0][0])<1e-9 || Math.abs(ult[0][0]-pri[0][0])>179){
   piezas[0]=ult.concat(pri); piezas.pop();}
 }
 return piezas.filter(p=>p.length>=3);
}

// Cada poligono se guarda ya partido: contorno exterior en trozos planos, y
// sus agujeros igual. La caja de cada trozo sirve para descartar rapido.
const PLANO = LAND.map(poly=>({
 fuera: partirFecha(poly[0]).map(r=>({r,b:G.bbx(r)})),
 huecos: poly.slice(1).flatMap(h=>partirFecha(h)).map(r=>({r,b:G.bbx(r)})),
}));

function enTierra(pt){
 const L=require('./lib.js');
 const [x,y]=pt;
 for(const {fuera,huecos} of PLANO){
  let dentro=false;
  for(const {r,b} of fuera){
   if(x<b[0]||x>b[1]||y<b[2]||y>b[3])continue;
   if(L.pip(pt,r)){dentro=true;break}}
  if(!dentro)continue;
  let enAgujero=false;
  for(const {r,b} of huecos){
   if(x<b[0]||x>b[1]||y<b[2]||y>b[3])continue;
   if(L.pip(pt,r)){enAgujero=true;break}}
  if(!enAgujero)return true;
 }
 return false;
}
module.exports={LAND,PZ,PLANO,partirFecha,enTierra};
