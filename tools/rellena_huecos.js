#!/usr/bin/env node
// EL SUELO QUE TUVO GENTE NO SE QUEDA VACIO SOLO PORQUE CAMBIO EL MAPA.
//
// Un hueco aparece casi siempre por mecanica, no por historia: un estado se
// acaba y el sustrato que habia debajo no vuelve (lo recorto una resta que
// no sabia que el estado iba a acabar); un area cultural cierra un periodo en
// 1500 y el siguiente empieza en 1600; un rediseno por bioma dejo fuera una
// franja que la version vieja si cubria. Hasta ahora cada uno se tapaba a
// mano con tramos.js. Esta herramienta los tapa todos de una pasada, con una
// regla que se puede defender:
//
//   1. Si una celda de tierra habitable esta sin dueno en el anio A y un AREA
//      CULTURAL VIVA en A la cubrio alguna vez antes, se prolonga esa area
//      cultural sobre la celda (el sustrato de fondo vuelve a asomar cuando el
//      estado que lo tapaba se retira).
//   2. Si no, y un area cultural la cubrio hace menos de VENTANA anios (60 por
//      defecto), se prolonga esa area cultural en el tiempo, marcada con inc:1
//      (es una inferencia: la gente seguia ahi, el registro no lo dice).
//   3. Si no, el hueco se deja y se lista: es una decision humana (quien vivia
//      ahi) y va a la tabla, no al automatismo.
//
// La geometria nunca sale de celdas: el relleno es el anillo de referencia del
// area cultural (el periodo en que cubrio la celda) MENOS todo lo que vive a la
// vez, menos el vacio declarado, recortado a tierra. Por construccion no crea
// dobles. El tramo se parte en cada frontera temporal de un vecino que toque
// la region, igual que hace remodela_fisico.js.
//
//   JSX=<mapa> node rellena_huecos.js [--aplica] [SALIDA=<mapa2>]
//   PASO=1  VENTANA=60  MIN=0.05  DESDE=-10000 HASTA=2025  INFORME=huecos_pendientes.json
const fs=require('fs'); const pc=require('polygon-clipping');
const L=require('./lib.js'); const T=require('./tierra.js'); const V=require('./vacios.js'); const R=require('./recorte.js');
const {malo}=require('./auto_int_lib.js');
const doc=L.load(process.env.JSX); const CIV=doc.CIV;
const APLICA=process.argv.includes('--aplica');
const PASO=+(process.env.PASO||1), VENTANA=+(process.env.VENTANA||60), MIN=+(process.env.MIN||0.05);
const DESDE=+(process.env.DESDE||-10000), HASTA=+(process.env.HASTA||2025);
const INFORME=process.env.INFORME||'';
const X0=-180,X1=180,Y0=-58,Y1=84;
const NX=Math.round((X1-X0)/PASO), NY=Math.round((Y1-Y0)/PASO), NC=NX*NY;
const lon=i=>X0+(i+0.5)*PASO+0.0037, lat=j=>Y0+(j+0.5)*PASO+0.0023;
const cos=new Float32Array(NY); for(let j=0;j<NY;j++)cos[j]=Math.cos(lat(j)*Math.PI/180)*PASO*PASO;
const t0=Date.now(); const seg=()=>((Date.now()-t0)/1000).toFixed(0)+'s';

// --- tierra, vacio, raster de cada periodo (como radiografia.js) ---------------
const tierra=new Uint8Array(NC);
for(let i=0;i<NX;i++)for(let j=0;j<NY;j++) if(T.enTierra([lon(i),lat(j)]))tierra[i*NY+j]=1;
const vacIdx=new Int16Array(NC).fill(-1);
for(let i=0;i<NX;i++)for(let j=0;j<NY;j++){ if(!tierra[i*NY+j])continue; const pt=[lon(i),lat(j)];
 for(let e=0;e<V.TODO.length;e++) if(V.cubre(V.TODO[e],pt)){vacIdx[i*NY+j]=e;break} }
const scratch=new Uint8Array(NC);
function raster(rings){
 let i0=NX,i1=-1,j0=NY,j1=-1;
 for(const r of rings){ const b=L.bb(r);
  const ja=Math.max(0,Math.floor((b[2]-Y0)/PASO-0.5)), jb=Math.min(NY-1,Math.ceil((b[3]-Y0)/PASO-0.5));
  for(let j=ja;j<=jb;j++){ const y=lat(j); const xs=[];
   for(let k=0,m=r.length-1;k<r.length;m=k++){ const [a,bq]=r[k],[c,d]=r[m]; if((bq>y)!==(d>y)) xs.push((c-a)*(y-bq)/(d-bq)+a) }
   if(xs.length<2)continue; xs.sort((p,q)=>p-q);
   for(let k=0;k+1<xs.length;k+=2){ const ia=Math.max(0,Math.floor((xs[k]-X0)/PASO-0.5)+1), ib=Math.min(NX-1,Math.ceil((xs[k+1]-X0)/PASO-0.5)-1);
    for(let i=ia;i<=ib;i++)scratch[i*NY+j]^=1;
    if(ia<=ib){ if(ia<i0)i0=ia; if(ib>i1)i1=ib; if(j<j0)j0=j; if(j>j1)j1=j } } } }
 const out=[]; for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){ const s=i*NY+j; if(scratch[s]){ scratch[s]=0; if(tierra[s])out.push(s) } }
 return Int32Array.from(out);
}
const ENT=[]; let nPer=0;
for(const c of CIV){ const ps=[]; for(const p of c.periods){ if(!p.rings.length)continue; ps.push({p,celdas:raster(p.rings),bb:L.caja({periods:[p]})}); nPer++ }
 ENT.push({c,k:c.kind==='cultura',ps}) }
console.error('malla '+NX+'x'+NY+', '+nPer+' periodos rasterizados ('+seg()+')');

// --- el barrido: historia de cada celda y huecos ---------------------------------
// historia por celda: K ranuras {entidad, ultimo anio en que la cubrio}
const K=4; const histE=new Int16Array(NC*K).fill(-1), histY=new Int32Array(NC*K);
const cnt=new Uint8Array(NC); const vac=new Uint8Array(NC);
const pedidos=new Map();   // 'e|ref' -> {e, ref:{p,celdas}, anios:Set, caso}
// huecos sin regla, por celda y por era (anios-celda), para listarlos por manchas
const ERAS=[[-10000,-3000],[-3000,-1000],[-1000,1],[1,500],[500,1000],[1000,1300],[1300,1500],[1500,1700],[1700,1800],[1800,1900],[1900,1950],[1950,2026]];
const eraDe=A=>{ for(let i=0;i<ERAS.length;i++) if(A>=ERAS[i][0]&&A<ERAS[i][1])return i; return ERAS.length-1 };
const pendN=new Int32Array(NC*ERAS.length);
let nPend=0;
// la referencia se congela aqui (copia de la lista de anillos): el periodo de
// referencia puede recibir despues rellenos de otras peticiones, y usarlos
// como referencia arrastraba suelo de otros anios (Herat aparecia bajo Persia)
function pedir(e,ref,A,caso){ const k=e+'|'+ref.p.start+'|'+ref.p.end; let d=pedidos.get(k); if(!d){ d={e,ref:{p:ref.p,celdas:ref.celdas,bb:ref.bb,rings:ref.p.rings.slice()},anios:new Set(),caso}; pedidos.set(k,d) } d.anios.add(A); if(caso===1)d.caso=1 }
for(let A=DESDE;A<=HASTA;A++){
 cnt.fill(0);
 const vacE=V.TODO.map(e=>V.vacioEn(e,A)?1:0);
 for(let s=0;s<NC;s++){ const v=vacIdx[s]; vac[s]=v>=0?vacE[v]:0 }
 const vivoPer=new Array(ENT.length).fill(null);
 for(let e=0;e<ENT.length;e++){ let pe=null; for(const q of ENT[e].ps) if(q.p.start<=A&&q.p.end>A){pe=q;break} if(!pe)continue; vivoPer[e]=pe;
  for(const s of pe.celdas)cnt[s]++;
  if(ENT[e].k) for(const s of pe.celdas){ // anotar en la historia (ranura propia o la mas vieja)
   let slot=-1,old=0,oldY=1e9; for(let q=0;q<K;q++){ const t=s*K+q; if(histE[t]===e){slot=q;break} if(histE[t]<0){ if(oldY>-1e9){old=q;oldY=-1e9} } else if(histY[t]<oldY){oldY=histY[t];old=q} }
   if(slot<0)slot=old; histE[s*K+slot]=e; histY[s*K+slot]=A } }
 // huecos
 let hueco=[];
 for(let s=0;s<NC;s++){ if(!tierra[s]||vac[s]||cnt[s])continue;
  let mejor1=-1,y1=-1e9,mejor2=-1,y2=-1e9;
  for(let q=0;q<K;q++){ const t=s*K+q; const e=histE[t]; if(e<0||histY[t]>=A)continue;
   if(vivoPer[e]){ if(histY[t]>y1){y1=histY[t];mejor1=e} } else if(histY[t]>y2){y2=histY[t];mejor2=e} }
  if(mejor1>=0){ const ref=ENT[mejor1].ps.find(q=>q.p.start<=y1&&q.p.end>y1); if(ref){pedir(mejor1,ref,A,1);continue} }
  if(mejor2>=0&&A-y2<=VENTANA){ const ref=ENT[mejor2].ps.find(q=>q.p.start<=y2&&q.p.end>y2); if(ref){pedir(mejor2,ref,A,2);continue} }
  hueco.push(s) }
 if(hueco.length){ const er=eraDe(A)*NC; for(const s of hueco){ nPend++; pendN[er+s]++ } }
 if(A%2000===0)console.error('  ... '+A+' ('+seg()+')');
}
console.error('barrido hecho: '+pedidos.size+' peticiones de relleno ('+seg()+')');

// --- construir los rellenos --------------------------------------------------------
const mueve=(mp,d)=>mp.map(poly=>poly.map(r=>r.map(q=>[q[0]+d,q[1]+d])));
function seguro(op,a,b){ for(const d of [0,1e-6,-1e-6,3e-6]){ try{ return pc[op](a,d?mueve(b,d):b) }catch(e){} } return null }
const cajaPoly=c=>[[[c[0],c[2]],[c[1],c[2]],[c[1],c[3]],[c[0],c[3]],[c[0],c[2]]]];
const cruza=(a,b)=>!(a[1]<b[0]||a[0]>b[1]||a[3]<b[2]||a[2]>b[3]);
const areaR=rs=>rs.reduce((s,r)=>s+Math.abs(L.rA(r)),0);
const perimR=r=>{let t=0;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];t+=Math.hypot(b[0]-a[0],b[1]-a[1])}return t};
const astilla=r=>{ const a=Math.abs(L.rA(r)); if(a>=0.5)return false; const b=L.bb(r); const corto=Math.min(b[1]-b[0],b[3]-b[2]),largo=Math.max(b[1]-b[0],b[3]-b[2]); return corto<0.15&&largo/Math.max(corto,1e-6)>=15&&a/(perimR(r)/2)<0.1 };
// (los anillos se comparten entre los dos trozos, no se copian: esta herramienta no los muta y las copias se comian la memoria)
function partirEn(c,y){ const p=c.periods.find(p=>p.start<y&&p.end>y); if(!p)return; const n={start:y,end:p.end,rings:p.rings.slice()}; if(p.name)n.name=p.name; if(p.wikiTitle)n.wikiTitle=p.wikiTitle; if(p.inc)n.inc=1; p.end=y; c.periods.push(n); c.periods.sort((a,b)=>a.start-b.start||a.end-b.end) }
const marca=new Uint8Array(NC);
const cajas=new WeakMap(); const cajaDe=p=>{ let b=cajas.get(p); if(!b){ b=L.caja({periods:[p]}); cajas.set(p,b) } return b };
const cajasA=new WeakMap(); const cajaAnillo=r=>{ let b=cajasA.get(r); if(!b){ b=L.bb(r); cajasA.set(r,b) } return b };
let nTramos=0,nPeriodos=0,aTotal=0,fallos=0; const porEntidad=new Map(); const hechos=[];
let nPed=0;
for(const d of [...pedidos.values()].sort((a,b)=>a.e-b.e)){
 const ent=ENT[d.e], c=ent.c, ref=d.ref;
 if(process.env.DEBUG&&c.id!==process.env.DEBUG)continue;   // DEBUG=<id>: solo esa entidad, con traza
 if(++nPed%100===0)console.error('  peticion '+nPed+'/'+pedidos.size+' ('+seg()+', '+(process.memoryUsage().rss/1e9).toFixed(1)+' GB)');
 // tramos de anios consecutivos
 const anios=[...d.anios].sort((a,b)=>a-b); const runs=[]; let r0=anios[0],r1=anios[0];
 for(let i=1;i<anios.length;i++){ if(anios[i]===r1+1)r1=anios[i]; else {runs.push([r0,r1+1]);r0=r1=anios[i]} } runs.push([r0,r1+1]);
 // cortes: fronteras temporales de periodos (de otros) que tocan la celda de referencia
 // la marca de la referencia se dilata una celda: un vecino que solo la pisa
 // por el borde (menos de una celda) tiene que restarse igual, o deja dobles
 // (2 = celda de la referencia, 1 = celda vecina): un vecino que la pisa por
 // el borde se resta, pero solo los que la pisan de verdad ponen cortes
 // temporales, que es lo que multiplica los subtramos
 marca.fill(0); for(const s of ref.celdas){ const i=(s/NY)|0,j=s%NY; if(i>0)marca[s-NY]=1; if(i<NX-1)marca[s+NY]=1; if(j>0)marca[s-1]=1; if(j<NY-1)marca[s+1]=1 }
 for(const s of ref.celdas)marca[s]=2;
 // un periodo tan pequeno que no llena ni una celda (Caffa, Elmina, Lamu, las
 // factorias) no "toca" por celdas y se quedaba sin restar: el relleno le
 // pintaba encima. Si cruza la caja de la referencia, se resta igual.
 const toca=q=>{ if(!cruza(q.bb,ref.bb))return 0; if(!q.celdas.length)return 1; let m=0; for(const s of q.celdas){ if(marca[s]>m)m=marca[s]; if(m===2)break } return m };
 const cortes=new Set(); const tocanEnt=new Set();
 for(let e2=0;e2<ENT.length;e2++){ if(e2===d.e)continue; for(const q of ENT[e2].ps){ const m=toca(q); if(!m)continue; tocanEnt.add(e2); if(m===2){ cortes.add(q.p.start); cortes.add(q.p.end) } } }
 // y las fronteras de la propia entidad
 for(const q of ent.ps){ cortes.add(q.p.start); cortes.add(q.p.end) }
 // el relleno de [a,b): la referencia menos lo que vive a la vez (vecinos que
 // tocan, la propia entidad, el vacio declarado), limpio y sin astillas
 function rellenoDe(a,b,A){
  // se resta lo que VIVE AHORA en esas entidades (sus periodos actuales, con
  // los rellenos ya aplicados a otras peticiones): si no, dos areas culturales
  // que taparan el mismo hueco se pisaban
  // SE RESTA POR ANILLO, NO POR CELDA. Castro (Chiloe) es un anillo espanol
  // tan chico que no tiene celda a un grado: "no tocaba" la referencia de los
  // chonos y el relleno le pintaba encima. Ahora se mira cada anillo vivo de
  // cada entidad en [a,b): si su caja cruza la de la referencia, se resta.
  // Son pocos anillos (los que caen en la caja) y no se escapa ninguno.
  const otros=[]; for(let e2=0;e2<ENT.length;e2++){ if(e2===d.e)continue; for(const p of ENT[e2].c.periods){ if(p.end<=a||p.start>=b||!p.rings.length)continue; if(!cruza(cajaDe(p),ref.bb))continue;
   for(const rr of p.rings){ if(!cruza(cajaAnillo(rr),ref.bb))continue; otros.push([rr.concat([rr[0]])]) } } }
  const propio=c.periods.find(p=>p.start<=A&&p.end>A);
  if(propio) for(const rr of propio.rings)otros.push([rr.concat([rr[0]])]);
  for(const v of V.TODO){ if(!V.vacioEn(v,A))continue; if(!cruza(v.caja,ref.bb))continue; otros.push(v.poly?[v.poly.concat([v.poly[0]])]:cajaPoly(v.caja)) }
  let g=ref.rings.map(rr=>[rr.concat([rr[0]])]);
  for(let k=0;k<otros.length&&g&&g.length;k+=20){ const tanda=otros.slice(k,k+20); const r=seguro('difference',g,tanda); if(r)g=r; else { for(const o of tanda){ const r2=seguro('difference',g,[o]); if(r2)g=r2; else fallos++ } } }
  if(!g||!g.length)return null;
  let fin=[]; for(const x of R.limpia(g,3e-4)){ if(!malo(x)){fin.push(x);continue} const u=seguro('union',[[x.concat([x[0]])]],[[x.concat([x[0]])]]); if(u)for(const y of R.limpia(u,3e-4))if(!malo(y))fin.push(y) }
  fin=fin.filter(x=>Math.abs(L.rA(x))>MIN&&!astilla(x));
  return fin.length?fin:null;
 }
 for(const [y0,y1] of runs){
  const cs=[y0,...[...cortes].filter(y=>y>y0&&y<y1).sort((a,b)=>a-b),y1];
  // los subtramos se calculan uno a uno, pero si dos consecutivos dan el mismo
  // relleno (el vecino que cambio no tocaba el hueco) se funden en uno: sin
  // esto, turcomanos salia en 148 trozos entre 410 y 1867
  const sub=[];
  for(let i=0;i+1<cs.length;i++){ const a=cs[i], b=cs[i+1]; const A=Math.floor((a+b)/2);
   if(process.env.DEBUG===c.id)console.error('   '+c.id+' ref '+ref.p.start+'..'+ref.p.end+' ('+ref.celdas.length+' celdas) subtramo '+a+'..'+b+' tocan: '+[...tocanEnt].map(x=>ENT[x].c.id).join(',').slice(0,300));
   const fin=rellenoDe(a,b,A); const firma=fin?fin.length+':'+areaR(fin).toFixed(6)+':'+fin.map(r=>r.length).join(','):'';
   const u=sub[sub.length-1]; if(u&&u.firma===firma&&u.b===a){u.b=b;continue}
   sub.push({a,b,fin,firma}) }
  for(const {a,b,fin} of sub){ if(!fin)continue; const A=Math.floor((a+b)/2); const propio=c.periods.find(p=>p.start<=A&&p.end>A);
   const area=areaR(fin); aTotal+=area*(b-a); nTramos++;

   if(APLICA){
    // los periodos propios dentro de [a,b) reciben el relleno; los anios de
    // [a,b) sin periodo propio se cubren con periodos nuevos marcados inc:1
    partirEn(c,a); partirEn(c,b);
    const propios=c.periods.filter(p=>p.start>=a&&p.end<=b).sort((p,q)=>p.start-q.start);
    for(const p of propios)p.rings=p.rings.concat(fin);
    let y=a; const nuevos=[];
    for(const p of propios){ if(p.start>y)nuevos.push([y,p.start]); y=Math.max(y,p.end) }
    if(y<b)nuevos.push([y,b]);
    for(const [s0,s1] of nuevos){ const n={start:s0,end:s1,rings:fin.slice(),inc:1}; if(ref.p.name)n.name=ref.p.name; if(ref.p.wikiTitle)n.wikiTitle=ref.p.wikiTitle; c.periods.push(n); nPeriodos++ }
    c.periods.sort((p,q)=>p.start-q.start||p.end-q.end);
   }
   const pe=porEntidad.get(c.id)||{area:0,tramos:0,desde:1e9,hasta:-1e9,caso:d.caso}; pe.area+=area; pe.tramos++; pe.desde=Math.min(pe.desde,a); pe.hasta=Math.max(pe.hasta,b); porEntidad.set(c.id,pe);
   hechos.push({id:c.id,de:[ref.p.start,ref.p.end],a:[a,b],area:+area.toFixed(2),caso:propio?1:2});
  } }
 if(APLICA)c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
}
console.log('=== RELLENO DE HUECOS  '+DESDE+'..'+HASTA+'  (ventana '+VENTANA+' anios, paso '+PASO+')');
console.log('tramos rellenados: '+nTramos+'  periodos nuevos (inc): '+nPeriodos+'  grados2 (sumados por tramo): '+aTotal.toFixed(0)+'  fallos de resta: '+fallos);
console.log('\nPOR ENTIDAD  (grados2 sumados; tramos; anios)');
for(const [id,pe] of [...porEntidad.entries()].sort((a,b)=>b[1].area-a[1].area).slice(0,40))console.log('  '+id.padEnd(32)+pe.area.toFixed(1).padStart(9)+String(pe.tramos).padStart(6)+'   '+pe.desde+'..'+pe.hasta+(pe.caso===2?'   (prolongado en el tiempo)':''));
// pendientes: las celdas sin regla, por era y agrupadas en manchas conexas;
// cada mancha con su superficie, los anios-celda que pesa y su centro. Es la
// lista corta de decisiones humanas: quien vivia ahi.
const pend=[];
for(let er=0;er<ERAS.length;er++){ const base=er*NC; const visto=new Uint8Array(NC); const manchas=[];
 for(let s0=0;s0<NC;s0++){ if(!pendN[base+s0]||visto[s0])continue; const pila=[s0]; visto[s0]=1; let area=0,peso=0,cx=0,cy=0,n=0,bx0=1e9,bx1=-1e9,by0=1e9,by1=-1e9;
  while(pila.length){ const q=pila.pop(); const qi=(q/NY)|0,qj=q%NY; area+=cos[qj]; peso+=pendN[base+q]*cos[qj]; cx+=lon(qi); cy+=lat(qj); n++;
   bx0=Math.min(bx0,lon(qi));bx1=Math.max(bx1,lon(qi));by0=Math.min(by0,lat(qj));by1=Math.max(by1,lat(qj));
   for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ni=qi+di,nj=qj+dj; if(ni<0||ni>=NX||nj<0||nj>=NY)continue; const t=ni*NY+nj; if(pendN[base+t]&&!visto[t]){visto[t]=1;pila.push(t)} } }
  manchas.push({era:ERAS[er][0]+'..'+ERAS[er][1],area:+area.toFixed(1),aniosCelda:+peso.toFixed(0),cx:+(cx/n).toFixed(1),cy:+(cy/n).toFixed(1),caja:[+bx0.toFixed(1),+bx1.toFixed(1),+by0.toFixed(1),+by1.toFixed(1)]}) }
 manchas.sort((a,b)=>b.aniosCelda-a.aniosCelda); pend.push(...manchas) }
console.log('\nHUECOS SIN REGLA  (ninguna area cultural los cubrio antes: quedan para la tabla): '+nPend+' celdas-anio en '+pend.length+' manchas');
console.log('  era             g2*anios     g2   centro         caja');
for(let er=0;er<ERAS.length;er++){ const xs=pend.filter(p=>p.era===ERAS[er][0]+'..'+ERAS[er][1]); const tot=xs.reduce((s,p)=>s+p.aniosCelda,0); if(!tot)continue;
 console.log('  '+(ERAS[er][0]+'..'+ERAS[er][1]).padEnd(16)+String(tot).padStart(8)+'  ('+xs.length+' manchas; media por anio '+(tot/(ERAS[er][1]-ERAS[er][0])).toFixed(0)+' g2)');
 for(const p of xs.slice(0,6))console.log('     '.padEnd(18)+String(p.aniosCelda).padStart(8)+String(p.area).padStart(7)+'   '+(p.cx+','+p.cy).padEnd(14)+p.caja.join(',')) }
if(INFORME)fs.writeFileSync(INFORME,JSON.stringify({hechos,pendientes:pend}));
if(APLICA){ const s=process.env.SALIDA||process.env.JSX; L.save(doc.src,doc.R,doc.CIV,s); console.log('\naplicado -> '+s) } else console.log('\n(informe. --aplica para escribir)');
