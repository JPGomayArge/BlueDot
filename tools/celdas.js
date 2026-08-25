#!/usr/bin/env node
// Genera la rejilla de celdas habitables: puntos cada 1,5 grados que caen en
// tierra, agrupados por region. Es la base del barrido de dobles y de la
// medida de intermitencia. Determinista: mismo land-50m, misma rejilla.
//   node celdas.js > celdas.json
const T=require('./tierra.js');
const PASO=1.5;
const REGIONES=[
 ['Europa',                  -25,  45,  35,  72],
 ['Norte de Africa',         -18,  37,  20,  35],
 ['Africa subsahariana',     -18,  52, -35,  20],
 ['Medio Oriente',            34,  63,  12,  42],
 ['Asia Central',             46,  90,  35,  56],
 ['Siberia/Norte de Asia',    60, 190,  56,  78],
 ['Sur de Asia',              60, 100,   5,  38],
 ['China/Asia Oriental',      73, 150,  18,  56],
 ['Sudeste asiatico',         92, 141, -11,  29],
 ['Oceania',                 110, 190, -48, -10],
 ['Norteamerica',           -170, -52,  25,  84],
 ['Centroamerica y Caribe',  -118, -59,   7,  25],
 ['Sudamerica',              -82, -34, -56,   13],
];
function region(lon,lat){
 for(const [n,x0,x1,y0,y1] of REGIONES)
  if(lon>=x0&&lon<=x1&&lat>=y0&&lat<=y1)return n;
 return null;
}
const out={};let total=0;
for(let lat=-56;lat<=78;lat+=PASO){
 for(let lon=-180;lon<=180;lon+=PASO){
  const x=Math.round(lon*100)/100, y=Math.round(lat*100)/100;
  if(!T.enTierra([x,y]))continue;
  const r=region(x,y); if(!r)continue;
  (out[r]=out[r]||[]).push([x,y]); total++;
 }}
console.error('celdas habitables: '+total+' en '+Object.keys(out).length+' regiones');
for(const [k,v] of Object.entries(out))console.error('  '+k.padEnd(26)+v.length);
process.stdout.write(JSON.stringify(out));
