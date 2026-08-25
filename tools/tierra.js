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
function enTierra(pt){
 const L=require('./lib.js');let n=0;
 for(const poly of LAND)for(let i=0;i<poly.length;i++)if(L.pip(pt,poly[i]))n++;
 return n%2===1;
}
module.exports={LAND,PZ,enTierra};
