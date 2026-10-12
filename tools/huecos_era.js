#!/usr/bin/env node
// DONDE LAS FRONTERAS NO SE TOCAN, Y SI DEBERIAN.
//
// Un hueco entre dos entidades puede ser cuatro cosas distintas, y solo una
// de ellas es correcta:
//
//   VACIO      el registro declara la celda deshabitada ese anio: erg, hielo,
//              isla sin poblar. Correcto por definicion; aqui ni se cuenta.
//   COSTURA    hueco pequeno con dos o mas vecinos alrededor. Nadie vivio en
//              una franja de veinte kilometros entre dos reinos: es el rastro
//              de dos contornos dibujados por separado que no se encontraron.
//   ENCLAVE    hueco rodeado por una sola entidad. Es un agujero dentro de un
//              territorio, no una frontera.
//   REGION     hueco grande. Antes de 1500 puede ser verdad -tierra de nadie,
//              pueblos sin estado que el mapa no tiene como entidad-; despues
//              de 1500 casi siempre es una entidad que falta.
//
// La herramienta rasteriza cada anio a medio grado, encuentra las componentes
// conexas de celdas habitables sin dueno, mira cuantos vecinos distintos las
// tocan y cuanto miden, y las clasifica. No arregla nada: lista, para que se
// decida mirando.
//
//   JSX=<mapa> node huecos_era.js <anio,anio,...> [N]   PASO=<grados> (0.5)
const L=require('./lib.js'); const T=require('./tierra.js'); const V=require('./vacios.js');
const {CIV}=L.load(process.env.JSX);
const ANIOS=(process.argv[2]||'-3000,-1000,1,500,1000,1300,1500,1700,1800,1900').split(',').map(Number);
const N=+(process.argv[3]||12);
const PASO=+(process.env.PASO||0.5);
const X0=-180,X1=180,Y0=-58,Y1=84;
const NX=Math.round((X1-X0)/PASO), NY=Math.round((Y1-Y0)/PASO);
// centros desplazados una fraccion irregular para no caer exactos sobre fronteras compartidas (ver radiografia.js)
const lon=i=>X0+(i+0.5)*PASO+0.0037, lat=j=>Y0+(j+0.5)*PASO+0.0023;
const porId={}; for(const c of CIV)porId[c.id]=c;

const resumen=[];
for(const A of ANIOS){
 const vivos=[];
 for(const c of CIV){ const p=c.periods.find(p=>p.start<=A&&p.end>A);
  if(p&&p.rings.length){ const b=p.rings.reduce((a,r)=>{const bb=L.bb(r);
   return [Math.min(a[0],bb[0]),Math.max(a[1],bb[1]),Math.min(a[2],bb[2]),Math.max(a[3],bb[3])]},[9e9,-9e9,9e9,-9e9]);
   vivos.push({c,p,b}) } }
 // -1 mar o vacio legitimo, -2 habitable sin dueno, k indice de vivos
 const due=new Int32Array(NX*NY).fill(-1);
 for(let i=0;i<NX;i++){ const x=lon(i);
  for(let j=0;j<NY;j++){ const y=lat(j); const pt=[x,y];
   if(!T.enTierra(pt))continue;
   if(V.legitimo(pt,A))continue;
   let d=-2;
   for(let k=0;k<vivos.length;k++){ const v=vivos[k];
    if(x<v.b[0]||x>v.b[1]||y<v.b[2]||y>v.b[3])continue;
    if(L.has(v.p.rings,pt)){d=k;break} }
   due[i*NY+j]=d } }
 // componentes conexas de -2
 const visto=new Uint8Array(NX*NY); const huecos=[];
 for(let i=0;i<NX;i++)for(let j=0;j<NY;j++){
  const s=i*NY+j; if(due[s]!==-2||visto[s])continue;
  const celdas=[]; const pila=[s]; visto[s]=1;
  const vec=new Map(); let costa=0;
  while(pila.length){ const q=pila.pop(); celdas.push(q);
   const qi=Math.floor(q/NY), qj=q%NY;
   for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const ni=qi+di,nj=qj+dj; if(ni<0||ni>=NX||nj<0||nj>=NY)continue;
    const t=ni*NY+nj; const d=due[t];
    if(d===-2){ if(!visto[t]){visto[t]=1;pila.push(t)} }
    else if(d>=0){ vec.set(d,(vec.get(d)||0)+1) }
    else { if(!T.enTierra([lon(ni),lat(nj)]))costa++ } } }
  // area aproximada en grados2 corrigiendo por latitud
  let area=0,cx=0,cy=0;
  for(const q of celdas){ const y=lat(q%NY); area+=PASO*PASO*Math.cos(y*Math.PI/180); cx+=lon(Math.floor(q/NY)); cy+=y }
  cx/=celdas.length; cy/=celdas.length;
  const vecinos=[...vec.entries()].sort((a,b)=>b[1]-a[1]).map(([k,n])=>[vivos[k].c.id,n]);
  let clase;
  if(vecinos.length===0) clase='AISLADO';
  else if(vecinos.length===1) clase='ENCLAVE';
  else if(area<2) clase='COSTURA';
  else clase='REGION';
  huecos.push({A,celdas:celdas.length,area,cx,cy,vecinos,costa,clase});
 }
 const porClase={}; for(const h of huecos){ if(!porClase[h.clase])porClase[h.clase]={n:0,a:0}; porClase[h.clase].n++; porClase[h.clase].a+=h.area }
 resumen.push({A,huecos,porClase});
 const tot=huecos.reduce((s,h)=>s+h.area,0);
 console.log('\n=== '+A+'   '+huecos.length+' huecos, '+tot.toFixed(0)+' grados2 sin dueno (fuera del vacio declarado)');
 for(const k of ['COSTURA','ENCLAVE','REGION','AISLADO']) if(porClase[k])
  console.log('   '+k.padEnd(9)+String(porClase[k].n).padStart(5)+' huecos'+porClase[k].a.toFixed(0).padStart(8)+' grados2');
 huecos.sort((a,b)=>b.area-a.area);
 console.log('   los mayores:');
 for(const h of huecos.slice(0,N))
  console.log('     '+h.clase.padEnd(8)+h.area.toFixed(1).padStart(7)+' g2  en '+h.cx.toFixed(1)+','+h.cy.toFixed(1)+'   vecinos: '+
   (h.vecinos.slice(0,4).map(v=>v[0]).join(', ')||'ninguno')+(h.costa?'  (toca mar)':''));
}
// la foto global
console.log('\nRESUMEN  (grados2 sin dueno por clase)');
console.log('anio     costura  enclave   region  aislado   total');
for(const r of resumen){ const g=k=>(r.porClase[k]?r.porClase[k].a:0);
 console.log(String(r.A).padStart(5)+g('COSTURA').toFixed(0).padStart(10)+g('ENCLAVE').toFixed(0).padStart(9)+
  g('REGION').toFixed(0).padStart(9)+g('AISLADO').toFixed(0).padStart(9)+(g('COSTURA')+g('ENCLAVE')+g('REGION')+g('AISLADO')).toFixed(0).padStart(8)) }
