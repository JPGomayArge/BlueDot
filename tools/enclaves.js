#!/usr/bin/env node
// UN HUECO RODEADO POR UNA SOLA ENTIDAD ES DE ESA ENTIDAD.
//
// De donde sale. Al sustituir los rectangulos del interior de Sudamerica por
// las cuencas reales, los sustratos se quedaron mas pequenos, y el marco que
// dejaron -la diferencia entre el rectangulo viejo y la cuenca nueva- no lo
// recogio nadie: en el globo se veia un rectangulo NEGRO alrededor de cada
// forma nueva. Brasil no lo ocupo porque Brasil nunca lo habia tenido; era del
// sustrato y el sustrato lo solto.
//
// Pero el problema no es de esa operacion. Es general y estaba ya en el mapa:
// cualquier resta, cualquier redibujo, cualquier tallado deja marcos asi, y
// ninguna herramienta los recogia. `fidelidad.js` los cuenta -son los "huecos
// de region"-, y esta los cierra cuando se puede cerrar sin adivinar.
//
// LA REGLA, Y POR QUE ES SEGURA. Se rellena un hueco SOLO si todo su borde
// pertenece a una misma entidad. Si lo rodean dos, el hueco es una frontera que
// no sabemos donde va y se deja como esta: adivinarla seria inventar. Si no lo
// rodea nadie -da al mar o al borde de la ventana- tampoco, porque entonces no
// es un enclave sino el borde del mundo conocido.
//
// COMO SE CONSTRUYE LA PIEZA, Y LA TRAMPA QUE ESQUIVA. El hueco se encuentra
// sobre una rejilla, asi que su contorno es escalonado. Pegar ese contorno tal
// cual dejaria dientes de sierra donde el hueco toca el borde exterior. Por eso
// la pieza se DILATA una celda y despues se le resta todo lo demas:
//
//   pieza  =  (hueco + una celda)  ∩  tierra  −  (todas las demas entidades)
//
// Al unirla con la entidad que la rodea, el contorno que queda es el de la
// entidad, no el de la rejilla: la escalera cae dentro y no se ve. Es la misma
// construccion de `orilla.js`, y por la misma razon no puede quitarle nada a
// nadie.
//
// LA TRAMPA DE LA RONDA 54 SIGUE VIGENTE. Alli se relleno "lo que estaba cerca"
// uniendo entidades vecinas enteras y salieron 21.908 grados cuadrados de
// regalo. La regla que quedo fue *un agujero no es lo que esta cerca: es lo que
// esta DENTRO*. Aqui el candidato no es nunca una entidad ni una caja de
// entidad: es una componente conexa de celdas vacias, cerrada, y su dueno se
// decide por quien la rodea, no por quien esta cerca.
//
//   JSX=<mapa> node enclaves.js <anio,anio,...> <lonMin,lonMax,latMin,latMax>
//                               [--aplica]     SALIDA=<ruta>
//   PASO=<grados> (0.1)   MAX=<grados2> hueco mayor que no se toca (30)
const pc=require('polygon-clipping');
const L=require('./lib.js'); const R=require('./recorte.js');
const T=require('./tierra.js'); const V=require('./vacios.js');
const {malo}=require('./auto_int_lib.js');
const doc=L.load(process.env.JSX); const CIV=doc.CIV;
const ANIOS=(process.argv[2]||'').split(',').map(Number).filter(n=>!isNaN(n));
const [X0,X1,Y0,Y1]=(process.argv[3]||'-180,180,-56,78').split(',').map(Number);
const APLICA=process.argv.includes('--aplica');
const PASO=+(process.env.PASO||0.1);
const MAX=+(process.env.MAX||30);
const GROSOR=+(process.env.GROSOR||0.5);   // grosor maximo de costura que se cierra

const NX=Math.round((X1-X0)/PASO), NY=Math.round((Y1-Y0)/PASO);
const lon=i=>X0+(i+0.5)*PASO, lat=j=>Y0+(j+0.5)*PASO;
const bbDe=rs=>rs.reduce((a,r)=>{const b=L.bb(r);
 return [Math.min(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.max(a[3],b[3])]},[9e9,-9e9,9e9,-9e9]);

let totalPiezas=0,totalArea=0;
const porEntidad={};
for(const A of ANIOS){
 const vivos=[];
 for(const c of CIV){ const i=c.periods.findIndex(p=>p.start<=A&&p.end>A);
  if(i>=0&&c.periods[i].rings.length){const p=c.periods[i];
   vivos.push({id:c.id,c,i,p,b:bbDe(p.rings)})} }
 // 1. rejilla de dueno:  -1 mar o legitimamente vacio,  -2 sin dueno,  k indice
 const due=new Int32Array(NX*NY).fill(-1);
 for(let i=0;i<NX;i++)for(let j=0;j<NY;j++){
  const pt=[lon(i),lat(j)];
  if(!T.enTierra(pt))continue;
  if(V.legitimo(pt,A))continue;
  let k=-2;
  for(let v=0;v<vivos.length;v++){ const o=vivos[v];
   if(pt[0]<o.b[0]||pt[0]>o.b[1]||pt[1]<o.b[2]||pt[1]>o.b[3])continue;
   if(L.has(o.p.rings,pt)){k=v;break} }
  due[i*NY+j]=k;
 }
 // 2. componentes conexas de celdas sin dueno
 const visto=new Uint8Array(NX*NY);
 const piezas=[];
 for(let i=0;i<NX;i++)for(let j=0;j<NY;j++){
  if(due[i*NY+j]!==-2||visto[i*NY+j])continue;
  const pila=[[i,j]], celdas=[]; const bordes=new Set(); const contactos=new Map(); let abierto=false;
  visto[i*NY+j]=1;
  while(pila.length){
   const [x,y]=pila.pop(); celdas.push([x,y]);
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx, ny=y+dy;
    if(nx<0||ny<0||nx>=NX||ny>=NY){abierto=true;continue}   // toca el borde de la ventana
    const d=due[nx*NY+ny];
    if(d===-2){ if(!visto[nx*NY+ny]){visto[nx*NY+ny]=1;pila.push([nx,ny])} continue }
    if(d===-1)continue;                                      // mar o vacio legitimo: no decide
    bordes.add(d); contactos.set(d,(contactos.get(d)||0)+1);
   }
  }
  if(abierto)continue;
  const estados=[...contactos.keys()].filter(v=>vivos[v].c.kind!=='cultura');
  if(!estados.length)continue;                 // solo lo rodean sustratos: no se toca
  if(estados.length===1){ piezas.push({v:estados[0],celdas}); continue }

  // VARIOS ESTADOS ALREDEDOR: SE REPARTE POR PROXIMIDAD, PERO SOLO SI ES UNA
  // COSTURA Y NO UNA REGION.
  //
  // Los cuatro marcos que quedaban tras remodelar el Amazonas no los bordea un
  // estado sino dos o tres: el del Purus tiene a Peru en el 71% del contacto y
  // a Brasil en el resto; el de las Guayanas lo reparten Venezuela y Brasil al
  // 50%. Con un umbral de mayoria ninguno se cierra nunca, y son justo los que
  // se ven en el globo como bandas negras.
  //
  // Pero tampoco vale dar el hueco entero al que mas toca: eso desplazaria una
  // frontera internacional varios grados. Lo que hay aqui no es un territorio
  // en disputa: es una COSTURA, un vacio de pocas celdas entre dos contornos
  // que deberian tocarse. Y una costura se cierra por el medio.
  //
  // Asi que cada celda va al estado mas proximo -una expansion simultanea desde
  // todos los contornos a la vez-, y la operacion se aplica **solo si todas las
  // celdas estan a menos de `GROSOR` grados de algun estado**. Si alguna esta mas
  // lejos, el hueco no es una costura sino una region sin dueno, y entonces
  // adivinar donde va la frontera si seria inventar: se deja como esta y
  // `fidelidad.js` lo sigue contando como hueco.
  const idx=new Map(celdas.map(([x,y],k)=>[x*NY+y,k]));
  const dist=new Int32Array(celdas.length).fill(-1);
  const deQuien=new Int32Array(celdas.length).fill(-1);
  let frente=[];
  for(let k=0;k<celdas.length;k++){ const [x,y]=celdas[k];
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,ny=y+dy; if(nx<0||ny<0||nx>=NX||ny>=NY)continue;
    const d=due[nx*NY+ny];
    if(d>=0 && vivos[d].c.kind!=='cultura'){ if(dist[k]<0){dist[k]=0;deQuien[k]=d;frente.push(k)} } } }
  while(frente.length){ const sig=[];
   for(const k of frente){ const [x,y]=celdas[k];
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
     const v=idx.get((x+dx)*NY+(y+dy)); if(v==null||dist[v]>=0)continue;
     dist[v]=dist[k]+1; deQuien[v]=deQuien[k]; sig.push(v) } }
   frente=sig; }
  let maxd=0, completo=true;
  for(let k=0;k<celdas.length;k++){ if(dist[k]<0){completo=false;break} if(dist[k]>maxd)maxd=dist[k] }
  if(!completo || maxd*PASO>GROSOR){
   if(process.env.PORQUE&&celdas.length>=40)
    console.log('   sin cerrar: '+celdas.length+' celdas, grosor '+(maxd*PASO).toFixed(1)+
     ' grados, bordes '+[...contactos].map(([k,v])=>vivos[k].id+':'+v).join(' '));
   continue;
  }
  const porDue=new Map();
  for(let k=0;k<celdas.length;k++){ const q=deQuien[k];
   let l=porDue.get(q); if(!l)porDue.set(q,l=[]); l.push(celdas[k]) }
  for(const [q,cs] of porDue) piezas.push({v:q, celdas:cs});
 }
 // 3. construir y aplicar
 let n=0, ar=0;
 for(const pz of piezas){
  const o=vivos[pz.v];
  // caja de celdas dilatada una celda, unida
  let cajas=pz.celdas.map(([x,y])=>{
   const a=X0+x*PASO-PASO, b=X0+(x+1)*PASO+PASO;
   const c2=Y0+y*PASO-PASO, d=Y0+(y+1)*PASO+PASO;
   return [[[a,c2],[b,c2],[b,d],[a,d],[a,c2]]]; });
  let u=null; try{ u=pc.union(...cajas.map(c=>[c])) }catch(e){ continue }
  if(!u)continue;
  const area0=u.reduce((s,poly)=>s+Math.abs(L.rA(poly[0])),0);
  if(area0>MAX)continue;                                     // demasiado grande para no mirarlo
  // ∩ tierra
  let g=null;
  try{ const fuera=[],huecos=[]; const bb=L.bb(u.flatMap(p=>p[0]));
   for(const z of T.PLANO){ for(const f of z.fuera) if(!(bb[1]<f.b[0]||bb[0]>f.b[1]||bb[3]<f.b[2]||bb[2]>f.b[3]))fuera.push([f.r]);
    for(const h of z.huecos) if(!(bb[1]<h.b[0]||bb[0]>h.b[1]||bb[3]<h.b[2]||bb[2]>h.b[3]))huecos.push([h.r]); }
   if(!fuera.length)continue;
   g=pc.intersection(u,fuera);
   if(g&&g.length&&huecos.length)g=pc.difference(g,huecos);
  }catch(e){ continue }
  if(!g||!g.length)continue;
  // − todas las demas entidades vivas en cualquier anio del periodo
  const bbG=L.bb(g.flatMap(p=>p[0]));
  const otros=[];
  for(const c of CIV){ if(c.id===o.id)continue;
   for(const q of c.periods){ if(q.end<=o.p.start||q.start>=o.p.end)continue;
    for(const r of q.rings){ const b=L.bb(r);
     if(bbG[1]<b[0]||bbG[0]>b[1]||bbG[3]<b[2]||bbG[2]>b[3])continue;
     otros.push([r.concat([r[0]])]) } } }
  if(otros.length){ let d=null; try{ d=pc.difference(g,otros) }catch(e){ d=null }
   if(!d)continue; g=d }
  if(!g||!g.length)continue;
  const piezasN=R.limpia(g,3e-4).filter(r=>!malo(r));
  if(!piezasN.length)continue;
  const aN=piezasN.reduce((s,r)=>s+Math.abs(L.rA(r)),0);
  n++; ar+=aN; porEntidad[o.id]=(porEntidad[o.id]||0)+aN;
  if(APLICA){
   // union local con los anillos propios que la tocan
   let rings=o.p.rings.slice();
   for(const r of piezasN){
    const bb=L.bb(r); const idx=[]; const MAR=2*PASO;
    for(let k=0;k<rings.length;k++){ const b=L.bb(rings[k]);
     if(bb[1]<b[0]-MAR||bb[0]>b[1]+MAR||bb[3]<b[2]-MAR||bb[2]>b[3]+MAR)continue;
     let cerca=false;
     for(const q of rings[k]){ if(q[0]>=bb[0]-MAR&&q[0]<=bb[1]+MAR&&q[1]>=bb[2]-MAR&&q[1]<=bb[3]+MAR){cerca=true;break} }
     if(!cerca)for(const q of r){ if(q[0]>=b[0]-MAR&&q[0]<=b[1]+MAR&&q[1]>=b[2]-MAR&&q[1]<=b[3]+MAR){cerca=true;break} }
     if(cerca)idx.push(k) }
    if(!idx.length){ rings.push(r); continue }
    let uu=null;
    try{ uu=pc.union([[r.concat([r[0]])]],...idx.map(k=>[[rings[k].concat([rings[k][0]])]])) }catch(e){ uu=null }
    const cand=uu?R.limpia(uu,3e-4).filter(z=>!malo(z)):null;
    const aV=z=>z.reduce((s,y)=>s+Math.abs(L.rA(y)),0);
    // LA GUARDA DE AREA TENIA QUE SER RELATIVA A LO QUE YA HABIA, NO AL TOTAL.
    //
    // Aqui decia `aV(cand) >= (aV(idx) + |r|) * 0.98`, y con eso **se perdio
    // Terranova**: 13,31 grados cuadrados que desaparecieron del mapa sin que
    // ninguna comprobacion se enterara. El motivo es aritmetico. Los anillos
    // candidatos se elegian por caja, y la caja de Canada continental cruza la
    // de casi cualquier isla suya, asi que la suma de referencia eran unos
    // 1.500 grados cuadrados. Perder una isla de 13 es el 0,9%: por debajo del
    // 2% de tolerancia. **Una tolerancia proporcional al total es ciega a
    // perder una pieza entera cuando la entidad es grande.**
    //
    // Dos cambios. El primero es la invariante correcta: una union no puede
    // devolver MENOS que los anillos que ya estaban -eso es cierto siempre,
    // se solape o no la pieza nueva-, asi que se compara contra `aV(idx)` sin
    // sumar la pieza y con una tolerancia de una milesima.
    // El segundo es no meter en la union lo que no toca: la pieza viene
    // dilatada una celda, asi que solo puede fundirse con anillos que esten a
    // menos de dos celdas. Canada continental deja de entrar en la union de
    // un hueco del Labrador solo porque sus cajas se cruzan.
    if(cand&&cand.length&&aV(cand)>=aV(idx.map(k=>rings[k]))*0.999){
     const st=new Set(idx); rings=rings.filter((_,k)=>!st.has(k)).concat(cand);
    } else rings.push(r);
   }
   o.p.rings=rings;
  }
 }
 totalPiezas+=n; totalArea+=ar;
 console.log(String(A).padStart(6)+': '+String(piezas.length).padStart(4)+
  ' huecos de dueno unico, '+String(n).padStart(4)+' cerrados, '+ar.toFixed(1)+' grados2');
}
console.log('\ntotal '+totalPiezas+' huecos cerrados, '+totalArea.toFixed(0)+' grados cuadrados');
Object.entries(porEntidad).sort((a,b)=>b[1]-a[1]).slice(0,20)
 .forEach(([k,v])=>console.log('   '+k.padEnd(26)+v.toFixed(1).padStart(8)));
if(APLICA){ const s=process.env.SALIDA||process.env.JSX;
 L.save(doc.src,doc.R,doc.CIV,s); console.log('aplicado -> '+s); }
else console.log('(informe. --aplica para escribir)');
