#!/usr/bin/env node
// EL ORDEN EN QUE SE REVISA A MANO.
//
// Mil doscientas entidades no se revisan por orden alfabetico: se revisan por
// cuanto se ven. Se rasterizan doce cortes del arco y se cuenta, para cada
// entidad, cuantas celdas ocupa sumando los doce. Las 150 primeras llevan el
// 82% de la superficie que un usuario ve; las 300 primeras el 94%.
//
// Para cada entidad se guarda ademas el anio en que mas territorio tiene y el
// centro de su anillo mayor en ese anio: es adonde vuela el globo al tocarla.
//
//   JSX=<mapa> node orden_revision.js > orden_revision.json
const L=require('./lib.js'); const T=require('./tierra.js');
const {CIV}=L.load(process.env.JSX);
const ANIOS=[-3000,-1000,1,500,1000,1300,1500,1700,1800,1900,1950,2000];
const PASO=+(process.env.PASO||1);
const X0=-180,X1=180,Y0=-58,Y1=84, NX=Math.round((X1-X0)/PASO), NY=Math.round((Y1-Y0)/PASO);
const peso={};
for(const A of ANIOS){
 const vivos=[]; for(const c of CIV){const p=c.periods.find(p=>p.start<=A&&p.end>A); if(!p||!p.rings.length)continue;
  const b=p.rings.reduce((a,r)=>{const bb=L.bb(r);return [Math.min(a[0],bb[0]),Math.max(a[1],bb[1]),Math.min(a[2],bb[2]),Math.max(a[3],bb[3])]},[9e9,-9e9,9e9,-9e9]);
  vivos.push({c,p,b})}
 for(let i=0;i<NX;i++){const x=X0+(i+0.5)*PASO; for(let j=0;j<NY;j++){const y=Y0+(j+0.5)*PASO;
  if(!T.enTierra([x,y]))continue;
  for(const v of vivos){ if(x<v.b[0]||x>v.b[1]||y<v.b[2]||y>v.b[3])continue;
   if(L.has(v.p.rings,[x,y])){peso[v.c.id]=(peso[v.c.id]||0)+Math.cos(y*Math.PI/180);break} } } }
}
const out=[];
for(const c of CIV){
 let best=null,ba=-1;
 for(const p of c.periods){ const a=p.rings.reduce((s,r)=>s+Math.abs(L.rA(r)),0); if(a>ba){ba=a;best=p} }
 if(!best)continue;
 let big=null,bb=-1; for(const r of best.rings){const a=Math.abs(L.rA(r)); if(a>bb){bb=a;big=r}}
 let cx=0,cy=0; for(const q of big){cx+=q[0];cy+=q[1]} cx/=big.length; cy/=big.length;
 const anio=Math.round((Math.max(best.start,-10000)+Math.min(best.end,2025))/2);
 out.push({id:c.id,p:Math.round(peso[c.id]||0),a:anio,lat:+cy.toFixed(2),lon:+cx.toFixed(2),k:c.kind==='cultura'?1:0});
}
out.sort((a,b)=>b.p-a.p);
process.stdout.write(JSON.stringify(out));
console.error('entidades: '+out.length+'  con presencia: '+out.filter(x=>x.p>0).length);
