#!/usr/bin/env node
// RADIOGRAFIA DEL MAPA, ANIO POR ANIO.
//
// Las demas herramientas miran el mapa en diez o doce cortes. Esta lo mira en
// TODOS los anios del arco -doce mil veinticinco fotos- y apunta, para cada
// una, lo que un ojo entrenado veria mal:
//
//   DOBLE      una celda con dos duenos a la vez. El mapa no admite ninguna.
//              Se separa estado-estado (grave) de lo que toca un sustrato.
//   HUECO      tierra habitable sin dueno, fuera del vacio declarado. Se
//              clasifica como en huecos_era: costura (franja entre vecinos),
//              enclave (agujero dentro de uno), region (grande), aislado.
//   PARPADEO   una entidad que esta en el anio Y-1 y en el Y+1 pero no en Y
//              (o falta uno, dos, tres anios): un tramo que no cierra.
//   BLIP       una entidad cuya superficie en Y difiere mas de la mitad de la
//              que tiene en Y-1 y en Y+1: un periodo de un anio con otra forma.
//   SALTO      en un cambio de periodo la superficie se multiplica o divide
//              por mas de tres. Puede ser una conquista real; se lista para
//              mirarlo, no para arreglarlo a ciegas.
//   FORMA      defectos del contorno en si, por periodo: motas (<0.02 g2),
//              puas (vertice con angulo <4 grados y lados largos), vertices
//              repetidos, anillos que cruzan el antimeridiano por el lado
//              largo, y CAJAS: lados rectos de mas de un grado alineados con
//              el meridiano o el paralelo. Un contorno real no tiene lados
//              asi; una caja dibujada a mano, o el recorte de un vacio en
//              caja, los tiene. Se listan por grados de lado recto.
//
// Para que doce mil fotos quepan en un cafe, cada periodo se rasteriza UNA vez
// por barrido de lineas (paridad de cruces, igual que pinta el motor) y cada
// anio solo suma las celdas de los periodos vivos. Un grado por defecto.
//
//   JSX=<mapa> node radiografia.js                 resumen de todo el arco
//   JSX=<mapa> node radiografia.js --ano 1648      el detalle de una foto
//   DESDE=-3000 HASTA=2025 PASO=1 SALIDA=radiografia.json  N=<filas por lista>
const fs=require('fs');
const L=require('./lib.js'); const T=require('./tierra.js'); const V=require('./vacios.js');
const {CIV}=L.load(process.env.JSX);
const PASO=+(process.env.PASO||1);
const DESDE=+(process.env.DESDE||-10000), HASTA=+(process.env.HASTA||2025);
const N=+(process.env.N||15);
const SALIDA=process.env.SALIDA||'';
const ANO=process.argv.includes('--ano')?+process.argv[process.argv.indexOf('--ano')+1]:null;
const X0=-180,X1=180,Y0=-58,Y1=84;
const NX=Math.round((X1-X0)/PASO), NY=Math.round((Y1-Y0)/PASO), NC=NX*NY;
// Los centros de celda van desplazados una fraccion irregular: el mapa guarda
// sus vertices a centesimas y, a un grado, un centro en x=25.5 cae EXACTO
// sobre la frontera vertical que dos vecinos comparten; la paridad del motor
// deja ese punto fuera de los dos y la foto veia una costura que no existe
// (khoisan | sabana austral sumaba 26.000 "huecos" de un punto cada uno).
const lon=i=>X0+(i+0.5)*PASO+0.0037, lat=j=>Y0+(j+0.5)*PASO+0.0023;
const cos=new Float32Array(NY); for(let j=0;j<NY;j++)cos[j]=Math.cos(lat(j)*Math.PI/180)*PASO*PASO;
const t0=Date.now();

// --- tierra y vacio, una vez -------------------------------------------------
const tierra=new Uint8Array(NC);
for(let i=0;i<NX;i++)for(let j=0;j<NY;j++) if(T.enTierra([lon(i),lat(j)]))tierra[i*NY+j]=1;
// primera entrada de vacios que cubre la celda (mismo orden que V.legitimo)
const vacIdx=new Int16Array(NC).fill(-1);
for(let i=0;i<NX;i++)for(let j=0;j<NY;j++){ if(!tierra[i*NY+j])continue; const pt=[lon(i),lat(j)];
 for(let e=0;e<V.TODO.length;e++) if(V.cubre(V.TODO[e],pt)){vacIdx[i*NY+j]=e;break} }
console.error('malla '+NX+'x'+NY+'  tierra '+tierra.reduce((s,v)=>s+v,0)+' celdas  ('+((Date.now()-t0)/1000).toFixed(1)+'s)');

// --- rasterizar cada periodo una vez -----------------------------------------
const scratch=new Uint8Array(NC);
function raster(rings){
 let i0=NX,i1=-1,j0=NY,j1=-1;
 for(const r of rings){
  const b=L.bb(r);
  const ja=Math.max(0,Math.floor((b[2]-Y0)/PASO-0.5)), jb=Math.min(NY-1,Math.ceil((b[3]-Y0)/PASO-0.5));
  for(let j=ja;j<=jb;j++){ const y=lat(j); const xs=[];
   for(let k=0,m=r.length-1;k<r.length;m=k++){ const [a,bq]=r[k],[c,d]=r[m];
    if((bq>y)!==(d>y)) xs.push((c-a)*(y-bq)/(d-bq)+a) }
   if(xs.length<2)continue; xs.sort((p,q)=>p-q);
   for(let k=0;k+1<xs.length;k+=2){
    const ia=Math.max(0,Math.floor((xs[k]-X0)/PASO-0.5)+1), ib=Math.min(NX-1,Math.ceil((xs[k+1]-X0)/PASO-0.5)-1);
    for(let i=ia;i<=ib;i++){ scratch[i*NY+j]^=1 }
    if(ia<=ib){ if(ia<i0)i0=ia; if(ib>i1)i1=ib; if(j<j0)j0=j; if(j>j1)j1=j } } } }
 const out=[];
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){ const s=i*NY+j; if(scratch[s]){ scratch[s]=0; if(tierra[s])out.push(s) } }
 return Int32Array.from(out);
}
const ENT=[]; // {c, k:cultura?, periods:[{p, celdas, area}]}
let nPer=0;
for(const c of CIV){ const ps=[];
 for(const p of c.periods){ if(!p.rings.length)continue; const celdas=raster(p.rings);
  let area=0; for(const s of celdas)area+=cos[s%NY];
  ps.push({p,celdas,area}); nPer++ }
 ENT.push({c,k:c.kind==='cultura',ps}) }
console.error('periodos rasterizados: '+nPer+'  ('+((Date.now()-t0)/1000).toFixed(1)+'s)');

// --- defectos de forma, por periodo -------------------------------------------
// aristas compartidas dentro de un periodo: clave por extremos redondeados
const aristasDe=new Map();
function compartida(p,r,m,n){ let set=aristasDe.get(p);
 if(!set){ set=new Map(); for(const q of p.rings)for(let k=0;k<q.length;k++){ const a=q[k],b=q[(k+1)%q.length];
   const key=a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1])?a[0]+','+a[1]+'|'+b[0]+','+b[1]:b[0]+','+b[1]+'|'+a[0]+','+a[1]; set.set(key,(set.get(key)||0)+1) } aristasDe.set(p,set) }
 const key=m[0]<n[0]||(m[0]===n[0]&&m[1]<n[1])?m[0]+','+m[1]+'|'+n[0]+','+n[1]:n[0]+','+n[1]+'|'+m[0]+','+m[1];
 return (set.get(key)||0)>=2 }
let PNE=null; try{ PNE=require('./paises_ne.js'); PNE.rectas() }catch(e){ console.error('sin paises_ne.js ('+e.message.slice(0,60)+'): toda recta cuenta') }
let rectosReales=0;
const formas=[];
for(const e of ENT)for(const {p} of e.ps){
 for(const r of p.rings){
  const a=L.rA(r); const b=L.bb(r);
  if(a<0.02){ formas.push({id:e.c.id,start:p.start,end:p.end,tipo:'MOTA',dato:a.toFixed(3)+' g2 en '+((b[0]+b[1])/2).toFixed(1)+','+((b[2]+b[3])/2).toFixed(1)}); continue }
  if(b[1]-b[0]>300) formas.push({id:e.c.id,start:p.start,end:p.end,tipo:'ANTIMERIDIANO',dato:'ancho '+(b[1]-b[0]).toFixed(0)+' grados'});
  let rep=0,puas=0,puaDonde=null;
  for(let k=0;k<r.length;k++){ const q=r[(k+r.length-1)%r.length],m=r[k],n=r[(k+1)%r.length];
   const ux=q[0]-m[0],uy=q[1]-m[1],vx=n[0]-m[0],vy=n[1]-m[1];
   const lu=Math.hypot(ux,uy),lv=Math.hypot(vx,vy);
   if(lv<1e-9){rep++;continue}
   if(lu<1e-9)continue;
   const ang=Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy)/(lu*lv))))*180/Math.PI;
   if(ang<4&&lu>1&&lv>1){puas++; if(!puaDonde)puaDonde=m} }
  if(rep) formas.push({id:e.c.id,start:p.start,end:p.end,tipo:'REPETIDO',dato:rep+' vertices repetidos'});
  // una arista recta que comparten dos anillos del mismo periodo es una
  // costura interna (los cortes de `parte`, las bandas de la mascara de
  // tierra): el motor no la pinta y aqui no cuenta
  let recto=0,nRectos=0;
  for(let k=0;k<r.length;k++){ const m=r[k],n=r[(k+1)%r.length]; const dx=Math.abs(n[0]-m[0]),dy=Math.abs(n[1]-m[1]);
   if(Math.max(m[1],n[1])>80||Math.abs(m[0])>179.5||Math.abs(n[0])>179.5)continue;
   if((dx<0.011&&dy>1)||(dy<0.011&&dx>1)){ if(compartida(p,r,m,n))continue;
    // una recta que coincide con una frontera actual (paises_ne.js) es real:
    // el paralelo 49, el 22 de Egipto, el 141 oeste. No cuenta como caja.
    if(PNE&&PNE.esRectaReal(m,n)){rectosReales++;continue}
    recto+=dx+dy;nRectos++} }
  if(nRectos>=2||recto>=3) formas.push({id:e.c.id,start:p.start,end:p.end,tipo:'CAJA',dato:nRectos+' lados rectos, '+recto.toFixed(1)+' grados',recto});
  if(puas) formas.push({id:e.c.id,start:p.start,end:p.end,tipo:'PUA',dato:puas+' puas, p.ej. en '+puaDonde[0].toFixed(1)+','+puaDonde[1].toFixed(1)});
 }
}

// --- el barrido anual ----------------------------------------------------------
const cnt=new Uint8Array(NC), due=new Int32Array(NC), due2=new Int32Array(NC), vac=new Uint8Array(NC);
const filas=[]; const dobles=new Map(); const costuras=new Map(); const parpadeos=[]; const blips=[]; const saltos=[];
const areaPrev=new Float64Array(ENT.length), areaPrev2=new Float64Array(ENT.length);
const ultimoVisto=new Int32Array(ENT.length).fill(-1e9); const periodoPrev=new Array(ENT.length).fill(null);
const porAnio=ANO!=null?[ANO]:null;
const clave=(a,b)=>a<b?a+' | '+b:b+' | '+a;
const anios=[]; for(let A=DESDE;A<=HASTA;A++)anios.push(A);
let detalle=null;
for(const A of (porAnio||anios)){
 cnt.fill(0);
 // vacio de este anio
 const vacE=V.TODO.map(e=>V.vacioEn(e,A)?1:0);
 for(let s=0;s<NC;s++){ const v=vacIdx[s]; vac[s]=v>=0?vacE[v]:0 }
 // duenos
 const vivos=[]; // indices de ENT con periodo vivo
 const vivoPer=new Array(ENT.length).fill(null);
 for(let e=0;e<ENT.length;e++){ const ps=ENT[e].ps; let pe=null;
  for(const q of ps) if(q.p.start<=A&&q.p.end>A){pe=q;break}
  if(!pe)continue; vivos.push(e); vivoPer[e]=pe;
  for(const s of pe.celdas){ const c=cnt[s]; if(c===0)due[s]=e; else if(c===1)due2[s]=e; cnt[s]=c+1>3?3:c+1 } }
 // dobles
 let dEE=0,dEC=0; const dPares=new Map();
 for(let s=0;s<NC;s++){ if(cnt[s]<2)continue; const a=due[s],b=due2[s]; const w=cos[s%NY];
  const ee=!ENT[a].k&&!ENT[b].k; if(ee)dEE+=w; else dEC+=w;
  const k=clave(ENT[a].c.id,ENT[b].c.id); dPares.set(k,(dPares.get(k)||0)+w) }
 for(const [k,w] of dPares){ const d=dobles.get(k)||{area:0,anios:0,desde:A,hasta:A,max:0}; d.area+=w; d.anios++; d.hasta=A; if(w>d.max)d.max=w; dobles.set(k,d) }
 // huecos: componentes conexas de tierra sin dueno ni vacio
 const visto=new Uint8Array(NC); const porClase={COSTURA:0,ENCLAVE:0,REGION:0,AISLADO:0}; const huecos=[];
 for(let s0=0;s0<NC;s0++){ if(!tierra[s0]||vac[s0]||cnt[s0]||visto[s0])continue;
  const celdas=[]; const pila=[s0]; visto[s0]=1; const vec=new Map(); let area=0,cx=0,cy=0;
  while(pila.length){ const q=pila.pop(); celdas.push(q); const qi=(q/NY)|0,qj=q%NY; area+=cos[qj]; cx+=lon(qi); cy+=lat(qj);
   for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ni=qi+di,nj=qj+dj; if(ni<0||ni>=NX||nj<0||nj>=NY)continue;
    const t=ni*NY+nj; if(!tierra[t])continue;
    if(cnt[t]) vec.set(due[t],(vec.get(due[t])||0)+1);
    else if(!vac[t]&&!visto[t]){visto[t]=1;pila.push(t)} } }
  let clase; if(vec.size===0)clase='AISLADO'; else if(vec.size===1)clase='ENCLAVE'; else if(area<2)clase='COSTURA'; else clase='REGION';
  porClase[clase]+=area;
  const vecinos=[...vec.entries()].sort((a,b)=>b[1]-a[1]).map(([k])=>ENT[k].c.id);
  if(clase==='COSTURA'&&vecinos.length>=2){ const k=clave(vecinos[0],vecinos[1]); const d=costuras.get(k)||{area:0,anios:0,desde:A,hasta:A}; d.area+=area; d.anios++; d.hasta=A; costuras.set(k,d) }
  huecos.push({clase,area,cx:cx/celdas.length,cy:cy/celdas.length,vecinos}) }
 // parpadeos, blips, saltos
 if(!porAnio){
  for(let e=0;e<ENT.length;e++){ const pe=vivoPer[e]; const area=pe?pe.area:0;
   if(pe){ const gap=A-ultimoVisto[e]; if(gap>1&&gap<=4&&ultimoVisto[e]>-1e8) parpadeos.push({id:ENT[e].c.id,desde:ultimoVisto[e]+1,hasta:A-1});
    ultimoVisto[e]=A;
    if(periodoPrev[e]&&periodoPrev[e]!==pe){ const a0=periodoPrev[e].area,a1=pe.area;
     if(a0>1&&a1>1&&(a1/a0>3||a0/a1>3)) saltos.push({id:ENT[e].c.id,anio:A,de:+a0.toFixed(0),a:+a1.toFixed(0)}) }
    periodoPrev[e]=pe }
   else periodoPrev[e]=null;
   // blip: el anio anterior difiere de sus dos vecinos
   const p2=areaPrev2[e],p1=areaPrev[e];
   if(p1>0&&p2>0&&area>0&&Math.abs(p1-p2)/Math.max(p1,p2)>0.5&&Math.abs(p1-area)/Math.max(p1,area)>0.5&&Math.abs(p2-area)/Math.max(p2,area)<0.2)
    blips.push({id:ENT[e].c.id,anio:A-1,antes:+p2.toFixed(0),blip:+p1.toFixed(0),despues:+area.toFixed(0)});
   areaPrev2[e]=p1; areaPrev[e]=area }
 }
 filas.push([A,+porClase.COSTURA.toFixed(1),+porClase.ENCLAVE.toFixed(1),+porClase.REGION.toFixed(1),+porClase.AISLADO.toFixed(1),+dEE.toFixed(1),+dEC.toFixed(1),dPares.size,vivos.length]);
 if(porAnio)detalle={A,huecos,dPares:[...dPares.entries()].sort((a,b)=>b[1]-a[1]),vivos:vivos.length};
 if(!porAnio&&(A%1000===0))console.error('  ... '+A+'  ('+((Date.now()-t0)/1000).toFixed(0)+'s)');
}
console.error('barrido: '+filas.length+' fotos  ('+((Date.now()-t0)/1000).toFixed(1)+'s)');

// --- informe -------------------------------------------------------------------
const f0=x=>x.toFixed(0), pad=(s,n)=>String(s).padStart(n), padE=(s,n)=>String(s).padEnd(n);
if(detalle){
 console.log('=== FOTO DEL '+detalle.A+'   '+detalle.vivos+' entidades vivas');
 const f=filas[0];
 console.log('huecos (g2 sin dueno fuera del vacio): costura '+f[1]+'  enclave '+f[2]+'  region '+f[3]+'  aislado '+f[4]);
 console.log('dobles (g2 con dos duenos): estado-estado '+f[5]+'  con sustrato '+f[6]+'  ('+f[7]+' pares)');
 if(detalle.dPares.length){ console.log('\n  DOBLES'); for(const [k,w] of detalle.dPares.slice(0,N*2))console.log('    '+pad(w.toFixed(1),7)+' g2  '+k) }
 detalle.huecos.sort((a,b)=>b.area-a.area);
 for(const cl of ['COSTURA','ENCLAVE','REGION','AISLADO']){ const hs=detalle.huecos.filter(h=>h.clase===cl); if(!hs.length)continue;
  console.log('\n  '+cl+'  ('+hs.length+')'); for(const h of hs.slice(0,N))console.log('    '+pad(h.area.toFixed(1),7)+' g2  en '+h.cx.toFixed(1)+','+h.cy.toFixed(1)+'   '+(h.vecinos.slice(0,4).join(', ')||'sin vecinos')) }
 process.exit(0);
}
// resumen por era
console.log('=== RADIOGRAFIA  '+DESDE+'..'+HASTA+'  a '+PASO+' grado(s)   ('+nPer+' periodos, '+ENT.length+' entidades)');
console.log('\nPOR ERA  (media de grados2 por foto)');
console.log('era            costura enclave  region aislado | doble E-E doble E-C | vivas');
const eras=[[-10000,-3000],[-3000,-1000],[-1000,1],[1,500],[500,1000],[1000,1300],[1300,1500],[1500,1700],[1700,1800],[1800,1900],[1900,1950],[1950,2026]];
for(const [a,b] of eras){ const fs_=filas.filter(f=>f[0]>=a&&f[0]<b); if(!fs_.length)continue;
 const m=k=>fs_.reduce((s,f)=>s+f[k],0)/fs_.length;
 console.log(padE(a+'..'+b,14)+pad(f0(m(1)),8)+pad(f0(m(2)),8)+pad(f0(m(3)),8)+pad(f0(m(4)),8)+' |'+pad(f0(m(5)),10)+pad(f0(m(6)),10)+' |'+pad(f0(m(8)),6)) }
// peores anios
const peor=(k,t)=>{ const fs_=[...filas].sort((a,b)=>b[k]-a[k]).slice(0,N); console.log('\nPEORES ANIOS POR '+t); for(const f of fs_)console.log('  '+pad(f[0],6)+pad(f[k],9)+' g2') };
peor(5,'DOBLE ESTADO-ESTADO'); peor(1,'COSTURA');
const lista=(m,t)=>{ const xs=[...m.entries()].sort((a,b)=>b[1].area-a[1].area).slice(0,N); console.log('\n'+t+'  (grados2 integrados en el tiempo; max por foto; anios afectados)');
 for(const [k,d] of xs)console.log('  '+pad(f0(d.area),9)+pad(d.max!=null?d.max.toFixed(1):'',8)+pad(d.anios,6)+'  '+d.desde+'..'+d.hasta+'  '+k) };
lista(dobles,'DOBLES, LOS PEORES PARES'); lista(costuras,'COSTURAS, LOS PEORES PARES DE VECINOS');
console.log('\nPARPADEOS  ('+parpadeos.length+')'); for(const p of parpadeos.slice(0,N))console.log('  '+padE(p.id,32)+' falta '+p.desde+'..'+p.hasta);
console.log('\nBLIPS  ('+blips.length+')'); for(const b of blips.slice(0,N))console.log('  '+padE(b.id,32)+' '+pad(b.anio,6)+'   '+b.antes+' -> '+b.blip+' -> '+b.despues+' g2');
saltos.sort((a,b)=>Math.max(b.a/b.de,b.de/b.a)-Math.max(a.a/a.de,a.de/a.a));
console.log('\nSALTOS  ('+saltos.length+', los mayores)'); for(const s of saltos.slice(0,N))console.log('  '+padE(s.id,32)+' '+pad(s.anio,6)+'   '+s.de+' -> '+s.a+' g2');
const porTipo={}; for(const f of formas)porTipo[f.tipo]=(porTipo[f.tipo]||0)+1;
console.log('\nFORMAS  '+JSON.stringify(porTipo)+'   (aristas rectas que son fronteras reales y no cuentan: '+rectosReales+')'); for(const t of ['ANTIMERIDIANO','PUA','REPETIDO','MOTA'])for(const f of formas.filter(f=>f.tipo===t).slice(0,Math.ceil(N/2)))console.log('  '+padE(t,13)+padE(f.id,32)+' '+f.start+'..'+f.end+'  '+f.dato);
// cajas: por entidad, los grados de lado recto sumados sobre sus periodos (pesados por duracion)
const cajas=new Map(); for(const f of formas){ if(f.tipo!=='CAJA')continue; const d=Math.min(f.end,HASTA)-Math.max(f.start,DESDE); if(d<=0)continue;
 const c=cajas.get(f.id)||{g:0,anios:0,max:0}; c.g+=f.recto*d; c.anios+=d; if(f.recto>c.max)c.max=f.recto; cajas.set(f.id,c) }
console.log('\nCAJAS, LAS ENTIDADES MAS RECTAS  (grados de lado recto por anio, media; max en un periodo; anios con cajas)');
for(const [id,c] of [...cajas.entries()].sort((a,b)=>b[1].g-a[1].g).slice(0,N*2))console.log('  '+padE(id,32)+pad((c.g/c.anios).toFixed(1),7)+pad(c.max.toFixed(1),7)+pad(c.anios,7));
if(SALIDA){ fs.writeFileSync(SALIDA,JSON.stringify({paso:PASO,desde:DESDE,hasta:HASTA,columnas:['anio','costura','enclave','region','aislado','dobleEE','dobleEC','paresDobles','vivas'],filas,
 dobles:[...dobles.entries()],costuras:[...costuras.entries()],parpadeos,blips,saltos,formas})); console.log('\nescrito '+SALIDA) }
