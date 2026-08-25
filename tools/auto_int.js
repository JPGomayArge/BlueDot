#!/usr/bin/env node
// Anillos que se cruzan a si mismos: el recortador de orejas del WebView emite
// triangulos fuera del poligono (las "cuñas blancas" sobre el mar).
//   node auto_int.js '["id1","id2"]'   (sin argumento: todo el mapa)
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
const FILTRO=process.argv[2]?new Set(JSON.parse(process.argv[2])):null;
function cruce(a,b,c,d){const o=(p,q,r)=>{const v=(q[1]-p[1])*(r[0]-q[0])-(q[0]-p[0])*(r[1]-q[1]);return v>1e-12?1:v<-1e-12?-1:0};
 return o(a,b,c)!==o(a,b,d)&&o(c,d,a)!==o(c,d,b)}
function malo(r){const n=r.length;
 for(let i=0;i<n-1;i++)for(let j=i+2;j<n-1;j++){if(i===0&&j===n-2)continue;
  if(cruce(r[i],r[i+1],r[j],r[j+1]))return [i,j]}
 return null}
const vis=new Set();let n=0,k=0;const por={};
for(const c of CIV){ if(FILTRO&&!FILTRO.has(c.id))continue;
 for(const p of c.periods)for(const r of p.rings){
  const key=c.id+'#'+r.length+'#'+r[0][0]+','+r[0][1];
  if(vis.has(key))continue;vis.add(key);n++;
  if(malo(r)){k++;por[c.id]=(por[c.id]||0)+1}}}
console.log('anillos unicos revisados '+n+' | con auto-interseccion '+k+' '+JSON.stringify(por));
module.exports={malo};
