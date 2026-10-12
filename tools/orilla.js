#!/usr/bin/env node
// LLEVAR EL TRAZO HASTA LA ORILLA. Es la operacion inversa de `recorte.aTierra`.
//
// `aTierra` impide que un contorno se meta en el mar. Nada, en toda la campana,
// obligaba a lo contrario: que un estado costero LLEGUE hasta su propia costa.
// Por eso `fidelidad.js` encuentra que en el anio 2000 -el unico corte donde
// cada metro de litoral tiene dueno historico y no hay ningun sustrato que lo
// tape- solo el 69,2% del litoral del mundo cae dentro de alguna entidad. El
// 16,3% tiene dueno claro a menos de 25 km y el 14,4% no tiene a nadie cerca.
//
// LO QUE HACE, Y POR QUE NO PUEDE ROBAR NADA.
//
// Para cada tramo de litoral sin dueno se busca la entidad viva mas proxima y
// se le anade el suelo que le falta para alcanzarlo. La pieza que se anade se
// construye asi:
//
//   - Si el tramo esta en una ISLA -una pieza de tierra de menos de 300 grados
//     cuadrados- la pieza candidata es la ISLA ENTERA. Una isla no se pinta a
//     medias: o es de alguien o no lo es. Asi es como Ellesmere, Banks, Taveuni
//     o Mindoro entran en el mapa, que estan a grados de distancia del contorno
//     mas proximo y ninguna banda estrecha alcanzaria.
//   - Si esta en un CONTINENTE, la pieza candidata es un cuadrado de 0,7 grados
//     de lado centrado en el tramo. En un continente no se puede adoptar la
//     pieza entera sin regalarle Eurasia a quien toque.
//
// Y despues, SIEMPRE, antes de unir:
//
//   pieza  =  pieza  ∩  tierra  −  (todas las demas entidades vivas en
//                                   cualquier anio del periodo que se edita)
//
// Esa resta es la que hace la operacion segura. No se quita a un vecino para
// dar a otro -eso seria `anade.js` y alli el procesado SIEMPRE PIERDE-: aqui
// **solo se reparte suelo que no es de nadie**, asi que no puede crear doble
// pintado ni en el anio medido ni en ningun otro anio del periodo. La resta se
// hace contra todo el tramo del periodo y no contra el anio del sondeo, porque
// un periodo dura lo que dura y un vecino puede aparecer en su mitad.
//
// LA AMBIGUEDAD. Si dos entidades estan a distancias parecidas del mismo tramo,
// el tramo no se toca. Una costa sin dueno entre dos candidatos no es un
// defecto de trazo: es una frontera que no sabemos donde va, y adivinarla es
// exactamente lo que esta campana no hace. El criterio es que la segunda este
// al menos a `d1*1,6 + 0,1` grados.
//
// LA TRAMPA QUE ESTA ESQUIVA -y es la de la ronda 54, rellena_talles-. Alli se
// relleno "lo que estaba cerca" uniendo entidades vecinas enteras cuya CAJA
// cruzaba, y salieron 21.908 grados cuadrados de regalo. La regla que quedo fue
// *un agujero no es lo que esta cerca: es lo que esta DENTRO*. Aqui la pieza
// candidata nunca es una entidad ni una caja de entidad: es una isla real o un
// cuadrado de 0,7 grados, y las dos estan acotadas por construccion.
//
//   JSX=<mapa> node orilla.js <anio,anio,...> [--aplica]
//   Sin --aplica solo informa. SALIDA=<ruta> para escribir el mapa editado.
//   MAXISLA=<grados2> tamano maximo de isla adoptable (300 por defecto)
const fs=require('fs');
const pc=require('polygon-clipping');
const L=require('./lib.js');
const G=require('./geoutil.js');
const T=require('./tierra.js');
const V=require('./vacios.js');
const C=require('./costa_lib.js');
const R=require('./recorte.js');
const {malo}=require('./auto_int_lib.js');

const RUTA=process.env.JSX||L.RUTA_POR_DEFECTO;
const doc=L.load(RUTA); const CIV=doc.CIV;
const APLICA=process.argv.includes('--aplica');
const ANIOS=(process.argv[2]||'2000').split(',').map(Number).filter(n=>!isNaN(n));
const MAXISLA=+(process.env.MAXISLA||300);

// --- piezas de tierra, con area y caja ------------------------------------
const PIEZAS=[];
T.PLANO.forEach((z,zi)=>{ z.fuera.forEach((f,fi)=>{
 PIEZAS.push({r:f.r, b:f.b, a:R.A(f.r), zi, fi,
              huecos:z.huecos.filter(h=>G.hit(f.b,h.b)).map(h=>h.r)});
})});
PIEZAS.sort((a,b)=>a.a-b.a);
const piezaDe=pt=>{ for(const P of PIEZAS){
  if(pt[0]<P.b[0]||pt[0]>P.b[1]||pt[1]<P.b[2]||pt[1]>P.b[3])continue;
  if(!L.pip(pt,P.r))continue;
  let ag=false; for(const h of P.huecos) if(L.pip(pt,h)){ag=true;break}
  if(!ag)return P;
 } return null };

// --- litoral ---------------------------------------------------------------
const LITORAL=[];
for(const s of C.costaEn([-180,180,-56,78])){
 const [mx,my]=s.m; let dentro=null;
 for(const d of [[0.04,0],[-0.04,0],[0,0.04],[0,-0.04],[0.03,0.03],[-0.03,-0.03],[0.03,-0.03],[-0.03,0.03]]){
  const q=[mx+d[0],my+d[1]]; if(T.enTierra(q)){dentro=q;break} }
 if(dentro)LITORAL.push({p:dentro,len:s.len,m:s.m});
}
console.log('litoral: '+LITORAL.length+' tramos');

const bbDe=rings=>rings.reduce((a,r)=>{const b=L.bb(r);
 return [Math.min(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.max(a[3],b[3])]},[9e9,-9e9,9e9,-9e9]);
const cuad=(p,h)=>[[[p[0]-h,p[1]-h],[p[0]+h,p[1]-h],[p[0]+h,p[1]+h],[p[0]-h,p[1]+h],[p[0]-h,p[1]-h]]];
// LA MASCARA ES MAS FINA QUE LA REJILLA EN LA QUE SE GUARDA, Y ESO PLIEGA
// ANILLOS. El mapa guarda los vertices redondeados a 0,01 grados (`recorte.R2`),
// pero la costa a 1:50 millones trae vertices consecutivos separados por mucho
// menos que eso en los litorales quebrados -fiordos, archipielagos, deltas-.
// Al redondear, dos o tres vertices distintos caen en la misma celda y el
// contorno se cruza consigo mismo: **115 anillos con auto-interseccion donde
// antes habia cero**, casi todos en Indonesia, Papua, el Artico y la Patagonia,
// que son justo las costas mas quebradas del mundo.
//
// La tentacion era repararlo despues con `arregla_auto.js`, y habria sido un
// error: esa herramienta borra el anillo cuando no logra repararlo y mide menos
// de 0,5 grados cuadrados, o sea que se habria comido precisamente las islas
// pequenas que esta operacion acaba de anadir. Es la leccion de `astillas.js`
// en la ronda 59 -*una isla no es una astilla*- y no hace falta volver a
// aprenderla: **se quita la densidad que sobra ANTES de redondear, en vez de
// reparar el pliegue despues.** Se conserva un vertice cada 0,015 grados, que
// es mas fino que la rejilla en la que se va a guardar.
function ralo(r,min){
 min=min||0.015; const o=[r[0]];
 for(let i=1;i<r.length;i++){ const p=r[i], q=o[o.length-1];
  if(Math.hypot(p[0]-q[0],p[1]-q[1])>=min)o.push(p); }
 if(o.length>=4 && Math.hypot(o[0][0]-o[o.length-1][0],o[0][1]-o[o.length-1][1])<min)o.pop();
 return o.length>=4?o:r;
}
// El afinado hay que pasarlo por TODO lo que sale de la mascara, no solo por
// las islas adoptadas: la interseccion de un cuadrado con la costa devuelve los
// vertices densos del litoral igual, y la union local con los anillos propios
// tambien. La primera version solo afinaba las piezas netas y quedaban 25
// anillos cruzados que venian todos del paso de union.
function afina(rings){
 for(let i=0;i<rings.length;i++){
  if(!malo(rings[i]))continue;
  for(const m of [0.015,0.03,0.05,0.08]){
   const q=R.R2(ralo(rings[i],m));
   const d=[]; for(const p of q){const l=d[d.length-1]; if(!l||l[0]!==p[0]||l[1]!==p[1])d.push(p)}
   if(d.length>=4 && !malo(d) && Math.abs(L.rA(d))>=Math.abs(L.rA(rings[i]))*0.85){rings[i]=d;break}
  }
 }
 for(let i=rings.length-1;i>=0;i--) if(malo(rings[i]))rings.splice(i,1);
 return rings;
}
const polyPieza=P=>[ralo(P.r).concat([ralo(P.r)[0]]),
                    ...P.huecos.map(h=>ralo(h)).filter(h=>h.length>=4).map(h=>h.concat([h[0]]))];

// --- acumulador de propuestas: clave = id + '@' + indice de periodo --------
const PROP=new Map();

for(const A of ANIOS){
 const vivos=[];
 for(const c of CIV){ const i=c.periods.findIndex(p=>p.start<=A&&p.end>A);
  if(i>=0&&c.periods[i].rings.length)vivos.push({id:c.id,c,i,p:c.periods[i],b:bbDe(c.periods[i].rings)}); }
 let n=0, gan=0;
 for(const s of LITORAL){
  // dueno?
  let hay=false;
  for(const v of vivos){ if(s.p[0]<v.b[0]-0.1||s.p[0]>v.b[1]+0.1||s.p[1]<v.b[2]-0.1||s.p[1]>v.b[3]+0.1)continue;
   if(L.has(v.p.rings,s.p)){hay=true;break} }
  if(hay)continue;
  if(V.legitimo(s.p,A))continue;
  // los dos mas proximos, de entidades distintas, y aparte el sustrato mas
  // proximo -que puede ser el mismo que e1-
  let d1=Infinity,e1=null,d2=Infinity, ds=Infinity,es=null;
  for(const v of vivos){
   if(s.p[0]<v.b[0]-4||s.p[0]>v.b[1]+4||s.p[1]<v.b[2]-4||s.p[1]>v.b[3]+4)continue;
   let dv=Infinity;
   for(const r of v.p.rings){ const bb=L.bb(r);
    if(s.p[0]<bb[0]-4||s.p[0]>bb[1]+4||s.p[1]<bb[2]-4||s.p[1]>bb[3]+4)continue;
    for(let i=0;i<r.length;i++){ const d=Math.hypot(r[i][0]-s.p[0],r[i][1]-s.p[1]); if(d<dv)dv=d } }
   if(dv<d1){d2=d1;d1=dv;e1=v} else if(dv<d2)d2=dv;
   if(v.c.kind==='cultura'&&dv<ds){ds=dv;es=v}
  }
  if(!e1||d1>4)continue;                       // nadie a quien darselo: hueco de region
  if(d2 < d1*1.6+0.1 && !(es&&es.id===e1.id))continue;  // ambiguo: no se adivina una frontera
  const P=piezaDe(s.p); if(!P)continue;
  // UNA ISLA NUEVA VA AL SUSTRATO, NO AL IMPERIO MAS PROXIMO.
  //
  // Hay dos operaciones distintas aqui y no pueden seguir la misma regla.
  // Alargar el contorno de un estado hasta la orilla DE UNA TIERRA QUE YA
  // PINTA es reparar una linea: no afirma nada nuevo. Adoptar una isla entera
  // que no pintaba nadie SI afirma algo nuevo, y afirmarlo por cercania es
  // exactamente inventar territorio.
  //
  // Sin esta regla la herramienta le daba al `dutch_empire` de 1700 cuarenta y
  // seis islas del archipielago malayo y al `spanish` de 1800 ochenta y cinco,
  // porque en esas aguas el vertice mas proximo a cualquier islote es una
  // factoria. La VOC tenia factorias, no el archipielago.
  //
  // La regla del sustrato dice que el sustrato es el fondo y CEDE ante la
  // entidad concreta. Cede: no desaparece. Donde la entidad concreta no esta
  // atestiguada, el suelo sigue siendo del fondo. Asi que en la adopcion de
  // isla gana el sustrato vivo mas proximo si lo hay, y solo si no hay ninguno
  // -el mundo de 2000, donde no queda sustrato- se la queda el estado. El
  // efecto es que la herramienta **nunca puede agrandar un imperio a una tierra
  // nueva**; como mucho agranda un area cultural, que es una afirmacion sobre
  // donde vivia gente y no sobre quien mandaba.
  //
  // PERO NO SI LA ENTIDAD CONCRETA YA ESTA EN ESA ISLA. La primera version
  // decia "isla sin dueno -> el sustrato mas proximo a menos de cuatro grados",
  // y a cuatro grados cabe media region: le dio Cerdena a `bereberes_magreb`
  // teniendo a Saboya encima, y Ternate a `papuan_peoples` y a
  // `wallacea_filipinas` teniendo al sultanato de Ternate en la propia isla.
  // Cuatro fallos de la red de testigos salieron de ahi.
  //
  // El matiz que faltaba es el de siempre en esta campana: **atestiguado gana a
  // proximo.** Si la entidad concreta YA PINTA un trozo de esa misma pieza de
  // tierra, la isla es suya y no hay nada que decidir; el sustrato solo hereda
  // las islas donde no hay nadie pintado. Asi la regla sigue impidiendo que un
  // imperio se anexione un archipielago por cercania, sin quitarle a un
  // sultanato la isla en la que esta su capital.
  const pisa=(v,P2)=>{ for(const r of v.p.rings){ const b=L.bb(r);
    if(b[1]<P2.b[0]||b[0]>P2.b[1]||b[3]<P2.b[2]||b[2]>P2.b[3])continue;
    for(const q of r) if(L.pip(q,P2.r))return true;
    if(L.has(v.p.rings,[(P2.b[0]+P2.b[1])/2,(P2.b[2]+P2.b[3])/2]))return true;
   } return false };
  let e=e1;
  if(P.a<=MAXISLA && es && es.id!==e1.id && ds<=4 && !pisa(e1,P)) e=es;
  const k=e.id+'@'+e.i;
  let q=PROP.get(k); if(!q){q={id:e.id,c:e.c,i:e.i,islas:new Map(),cuads:[],tramos:0,anios:new Set()};PROP.set(k,q)}
  q.tramos++; q.anios.add(A);
  if(P.a<=MAXISLA) q.islas.set(P.zi+'.'+P.fi,P);
  else q.cuads.push(s.p);
  n++; gan+=s.len;
 }
 console.log('  '+A+': '+n+' tramos adjudicables, '+gan.toFixed(0)+' grados de litoral');
}

console.log('\npropuestas: '+PROP.size+' periodos de '+new Set([...PROP.values()].map(q=>q.id)).size+' entidades');

// --- construir y aplicar ---------------------------------------------------
const filas=[], fallos=[]; let totalGan=0, aplicadas=0;
for(const q of [...PROP.values()]){
 const per=q.c.periods[q.i];
 // pieza candidata bruta
 let bruto=[];
 for(const P of q.islas.values()) bruto.push(polyPieza(P));
 if(q.cuads.length){
  // fundir los cuadrados en bloques para no llamar a pc una vez por punto
  let u=null;
  for(const p of q.cuads){ const c=cuad(p,0.35);
   u = u ? pc.union(u,[c]) : [c]; }
  if(u) for(const poly of u) bruto.push(poly);
 }
 if(!bruto.length)continue;
 let banda; try{ banda=pc.union(...bruto.map(b=>[b])) }catch(e){ continue }
 // ∩ tierra
 try{
  const fuera=[],huecos=[];
  const bb=G.bbx(banda.flat(2).length?banda[0][0]:[]);
  for(const z of T.PLANO){ for(const f of z.fuera) if(G.hit(L.bb(banda.flatMap(p=>p[0])),f.b)) fuera.push([f.r]);
   for(const h of z.huecos) if(G.hit(L.bb(banda.flatMap(p=>p[0])),h.b)) huecos.push([h.r]); }
  if(fuera.length){ banda=pc.intersection(banda,fuera);
   if(banda&&banda.length&&huecos.length)banda=pc.difference(banda,huecos); }
 }catch(e){}
 if(!banda||!banda.length)continue;
 // − todas las demas entidades vivas EN CUALQUIER ANIO DEL PERIODO
 const bbB=L.bb(banda.flatMap(p=>p[0]));
 const otros=[];
 for(const c of CIV){ if(c.id===q.id)continue;
  for(const p of c.periods){ if(p.end<=per.start||p.start>=per.end)continue;
   for(const r of p.rings){ const b=L.bb(r);
    if(bbB[1]<b[0]||bbB[0]>b[1]||bbB[3]<b[2]||bbB[2]>b[3])continue;
    otros.push([r.concat([r[0]])]); } } }
 if(otros.length){ try{ banda=pc.difference(banda,otros) }catch(e){ continue } }
 if(!banda||!banda.length)continue;
 const nuevos=R.limpia(banda,3e-4);
 if(!nuevos.length)continue;
 // LO QUE GANA DE VERDAD. La banda incluye el suelo que la entidad YA tiene
 // -adoptar Islandia entera cuando ya se pintaban sus cuatro quintos "gana"
 // toda Islandia si uno no mira-. Para el informe se resta lo propio. No se
 // resta para la union porque alli da igual, pero un numero que se ensena
 // tiene que ser el numero.
 //
 // Y SI LA RESTA FALLA, SE ABANDONA LA ENTIDAD. Aqui habia `let neto=nuevos`
 // con un `catch(e){}` vacio: cuando `pc.difference` reventaba -y revienta con
 // `usa`, que tiene 300 anillos- `neto` se quedaba valiendo la banda ENTERA, o
 // sea el suelo propio incluido, y el periodo terminaba con sus anillos viejos
 // mas una copia que los solapa. 273 de los 315 solapes internos eran esto.
 // Es literalmente el fallo de `fragmentos.js` en la ronda 45, donde un
 // `catch(e){}` con `d3=0` convertia cada calculo fallido en un parpadeo
 // detectado. La regla es la misma y no ha cambiado: **un fallo de calculo
 // nunca puede convertirse en un resultado positivo.**
 //
 // Y SE HACE ANILLO A ANILLO. Una sola llamada con los 303 anillos de `usa`
 // contra los 224 de la banda revienta -y `usa` era la entidad con mas que
 // ganar de todo el mapa, 68 grados cuadrados de Chesapeake, Outer Banks,
 // Cook Inlet y las Aleutianas-. Restando cada pieza nueva solo contra los
 // anillos propios cuya caja la toca, cada llamada es de dos o tres poligonos
 // y sale siempre. Si aun asi falla una pieza, se cae ESA pieza y no la
 // entidad entera.
 const toca=(bb,o)=>{const b=L.bb(o);return !(bb[1]<b[0]||bb[0]>b[1]||bb[3]<b[2]||bb[2]>b[3])};
 const neto=[]; let caidas=0;
 for(const r of nuevos){
  const bb=L.bb(r);
  const ch=per.rings.filter(o=>toca(bb,o)).map(o=>[o.concat([o[0]])]);
  if(!ch.length){ neto.push(r); continue }
  let d=null; try{ d=pc.difference([[r.concat([r[0]])]],ch) }catch(e){ d=null }
  if(!d){ caidas++; continue }
  neto.push(...R.limpia(d,3e-4));
 }
 afina(neto);
 if(caidas)fallos.push(q.id+' '+per.start+'..'+per.end+' ('+caidas+' piezas)');
 if(!neto.length)continue;
 const area=neto.reduce((s,r)=>s+Math.abs(L.rA(r)),0);
 if(area<1e-3)continue;
 filas.push({id:q.id,i:q.i,start:per.start,end:per.end,area,islas:q.islas.size,
             cuads:q.cuads.length,tramos:q.tramos,anillos:nuevos.length});
 if(process.env.VER&&(!process.env.SOLO||process.env.SOLO===q.id)){
  console.log('  ['+q.id+'] '+neto.length+' piezas netas:');
  neto.map(r=>({a:Math.abs(L.rA(r)),b:L.bb(r)})).sort((x,y)=>y.a-x.a).slice(0,12)
   .forEach(x=>console.log('     '+x.a.toFixed(3).padStart(8)+' deg2  lon '+
     x.b[0].toFixed(1)+'..'+x.b[1].toFixed(1)+'  lat '+x.b[2].toFixed(1)+'..'+x.b[3].toFixed(1)));
 }
 totalGan+=area;
 if(APLICA){
  // Se unen los anillos nuevos con los propios para no dejar una costura
  // visible entre la franja anadida y el contorno viejo.
  //
  // EL RESPALDO TENIA QUE SER `neto` Y NO `nuevos`. La primera version caia
  // aqui con `per.rings.concat(nuevos)`, y `nuevos` es la banda ENTERA -que
  // incluye el suelo que la entidad ya tenia-. Cuando `pc.union` fallaba en
  // una entidad grande, el periodo se quedaba con sus anillos viejos MAS la
  // banda que los solapa: **303 solapes internos, 273 de ellos en `usa`**, en
  // una operacion cuya premisa entera es que no puede solapar con nadie. El
  // respaldo de una operacion segura tiene que ser tan seguro como ella.
  // La union tambien es LOCAL, por la misma razon que la resta: cada pieza
  // nueva se une solo con los anillos propios que la tocan. Si la union de una
  // pieza falla, la pieza se anade suelta -es disjunta de los anillos propios
  // por construccion, asi que suelta tampoco solapa-.
  let rings=per.rings.slice();
  for(const r of neto){
   const bb=L.bb(r); const MAR=0.7;
   const idx=[];
   for(let i=0;i<rings.length;i++){ if(!toca(bb,rings[i]))continue;
    const b=L.bb(rings[i]); let cerca=false;
    for(const q of rings[i]){ if(q[0]>=bb[0]-MAR&&q[0]<=bb[1]+MAR&&q[1]>=bb[2]-MAR&&q[1]<=bb[3]+MAR){cerca=true;break} }
    if(!cerca)for(const q of r){ if(q[0]>=b[0]-MAR&&q[0]<=b[1]+MAR&&q[1]>=b[2]-MAR&&q[1]<=b[3]+MAR){cerca=true;break} }
    if(cerca)idx.push(i) }
   if(!idx.length){ rings.push(r); continue }
   let u=null;
   try{ u=pc.union([[r.concat([r[0]])]], ...idx.map(i=>[[rings[i].concat([rings[i][0]])]])) }catch(e){ u=null }
   const cand=u?afina(R.limpia(u,3e-4)):null;
   const aV=x=>x.reduce((s,y)=>s+Math.abs(L.rA(y)),0);
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
   if(cand&&cand.length&&aV(cand)>=aV(idx.map(i=>rings[i]))*0.999){
    const st=new Set(idx); rings=rings.filter((_,i)=>!st.has(i)).concat(cand);
   } else rings.push(r);
  }
  per.rings=rings;
  aplicadas++;
 }
}
filas.sort((a,b)=>b.area-a.area);
console.log('\nentidad                periodo         gana   islas cuad tramos');
for(const f of filas.slice(0,40))
 console.log(f.id.padEnd(22)+String(f.start).padStart(6)+'..'+String(f.end).padEnd(7)+
  f.area.toFixed(1).padStart(7)+String(f.islas).padStart(6)+String(f.cuads).padStart(5)+String(f.tramos).padStart(7));
console.log('\ntotal: '+totalGan.toFixed(0)+' grados cuadrados en '+filas.length+' periodos');
if(fallos.length)console.log('ABANDONADOS por fallo de geometria ('+fallos.length+'): '+fallos.join(', '));
if(APLICA){ const salida=process.env.SALIDA||RUTA; L.save(doc.src,doc.R,doc.CIV,salida);
 console.log('aplicado a '+aplicadas+' periodos -> '+salida); }
else console.log('(informe. --aplica para escribir)');
