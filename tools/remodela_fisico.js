#!/usr/bin/env node
// DARLE A UN SUSTRATO LA FORMA DE SU REGION FISICA.
//
// Un area cultural no es un estado: no tiene frontera negociada, tiene un
// AMBITO. Los pueblos del Sahara vivian en el Sahara, los del Sahel en el
// Sahel, los del Gran Chaco en el Gran Chaco. Eso no es una interpretacion:
// es lo que dice su propio nombre.
//
// Y el ambito ahora se puede dibujar, porque Natural Earth 1:50m trae 522
// regiones fisicas con nombre a la misma escala que la mascara de costa del
// mapa. Medido sobre el fichero entregado, `pueblos_sahara` en 1880 tenia 293
// grados cuadrados repartidos en 28 manchas; su ambito real -el Sahara, menos
// lo que reclama un estado, menos lo que el registro declara deshabitado- son
// 483 en 11 piezas.
//
// LA FORMULA, Y POR QUE NO INVENTA NADA:
//
//   nuevo = REGION FISICA  (o: region cortada por rios, ver `lado`)
//         - lo que el registro de vacio declara deshabitado ese anio
//         - todo lo que pinta cualquier otra entidad EN CUALQUIER ANIO DEL PERIODO
//         ∩ tierra
//
// Los cuatro terminos son datos. No hay ni un vertice puesto a ojo, y por
// construccion no puede aparecer doble pintado: lo que ya es de alguien se
// resta antes.
//
// POR QUE "EN CUALQUIER ANIO DEL PERIODO" Y NO "EN EL ANIO MEDIO". La primera
// version restaba a los vecinos vivos en el anio medio, y eso le dio El Cairo
// a `pueblos_sahara` en el -700 -cuando mandaba Kush- y una franja de
// Kanem-Bornu a dos sustratos a la vez. Un periodo de un sustrato dura siglos
// y los estados entran y salen dentro de el. La resta va contra todo el tramo.
//
// LOS RIOS. Cuando una region fisica la comparten varios sustratos -la cuenca
// del Amazonas son cinco- la entrada lleva `lado`: una lista de rios y de que
// lado de cada uno queda la entidad. La region se corta por esas lineas y la
// entidad recibe solo su lado. Un rio es la frontera natural mas honesta que
// hay tierra adentro, y es justo lo que estos sustratos no tenian.
//
// LO QUE NO HACE. No toca a los estados: un estado llega hasta donde llega por
// un tratado, no por donde acaba el erg. Esto es solo para `kind:'cultura'`.
//
// LA GUARDA. Si el resultado sale vacio, o si la entidad perderia mas de la
// mitad de lo que tenia, el periodo se deja como estaba y se avisa.
//
//   JSX=<mapa> node remodela_fisico.js <tabla.js> [--aplica]   SALIDA=<ruta>
//   IGNORA=2  rediseno por grupo: cada entidad resta a los companeros de tabla
//             que van antes (ya rehechos) y no a los que van despues (forma
//             vieja). Una pasada; el orden de la tabla decide quien cede.
//   tabla:  [{ id, region | bioma:'taiga|tundra' | caja:[x0,x1,y0,y1] (region o bioma admiten caja ademas), desde?, hasta?, lado?:[[nombreRio, 'N'|'S'|'E'|'W'],...], modo?:'suma', guarda?:false }]
//   nombreRio admite "A|B" para encadenar tramos con nombre propio (Yenisey|Verkhniy Yenisey).
//
// MODO. Por defecto el ambito SUSTITUYE: la entidad pasa a ser la region y nada
// mas, que es lo correcto cuando su nombre es la region. Con modo:'suma' el
// ambito se ANIADE a lo que ya tiene: para una entidad que ademas tiene costa
// o islas -caribes_guayanas lleva las Antillas Menores- sustituir seria
// borrarselas. Suma = viejo + (region - otros - vacio), sin tocar lo viejo.
const pc=require('polygon-clipping');
const L=require('./lib.js'); const R=require('./recorte.js');
const V=require('./vacios.js'); const F=require('./fisico.js');
const {malo}=require('./auto_int_lib.js');

const doc=L.load(process.env.JSX); const CIV=doc.CIV;
const APLICA=process.argv.includes('--aplica');
const TABLA=require(require('path').resolve(process.argv[2]));
const enTabla=new Set(TABLA.map(e=>e.id));
const NORESTAR=new Set((process.env.NORESTAR||'').split(',').filter(Boolean));
const ordenTabla=new Map(); TABLA.forEach((e,i)=>{ if(!ordenTabla.has(e.id))ordenTabla.set(e.id,i) });
const MINPIEZA=+(process.env.MINPIEZA||0.05);
const idsAnillo=new WeakMap(); let idSig=0; const idAnillo=r=>{ let i=idsAnillo.get(r); if(i==null){ i=++idSig; idsAnillo.set(r,i) } return i };
const A_vac=vac=>vac.map(v=>v[0].length+':'+v[0][0][0]+','+v[0][0][1]).join(';');
let cacheClave=null, cacheEnT=null, cacheUsos=0; const casiVacios=new Set();

const cajaPoly=c=>[[[c[0],c[2]],[c[1],c[2]],[c[1],c[3]],[c[0],c[3]],[c[0],c[2]]]];
const areaR=rs=>rs.reduce((s,r)=>s+Math.abs(L.rA(r)),0);
const bbG=g=>g.reduce((a,p)=>{const b=L.bb(p[0]);
 return [Math.min(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.max(a[3],b[3])]},[9e9,-9e9,9e9,-9e9]);

// Medio plano a un lado de un rio: la polilinea del rio cerrada por fuera de
// la caja de trabajo hacia el lado indicado. Se intersecta con la region.
function ladoDeRio(nombre,lado,caja){
 // "Yenisey|Verkhniy Yenisey": varios nombres para un mismo rio, que Natural
 // Earth registra por tramos con nombre propio; se encadenan como uno.
 let rs=[]; for(const nm of nombre.split('|')){ const todos=F.rio(nm); const ex=todos.filter(r=>F.norm(r.nombre)===F.norm(nm)); rs.push(...(ex.length?ex:todos)) }
 if(!rs.length)return null;
 // EL RIO ENTERO, NO SU TRAMO MAS LARGO. Natural Earth parte el Lena en dos
 // lineas y el Ob en cuatro registros; cortar por el tramo mas largo dejaba
 // media Siberia sin frontera y la prolongacion recta hacia el resto. Se
 // encadenan los tramos cuyos extremos se tocan y se toma la cadena mas larga
 // que pase por la caja. ("Negro" sigue siendo dos rios: la cadena del
 // Amazonas y la de la Patagonia no se tocan, y gana la que pasa por la caja.)
 const dentro=l=>l.some(p=>p[0]>=caja[0]&&p[0]<=caja[1]&&p[1]>=caja[2]&&p[1]<=caja[3]);
 const cerca=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<0.3;
 let piezas=[]; for(const r of rs)for(const l of r.lineas)piezas.push(l.slice());
 let unido=true; while(unido){ unido=false;
  for(let i=0;i<piezas.length&&!unido;i++)for(let j=0;j<piezas.length&&!unido;j++){ if(i===j)continue; const a=piezas[i],b=piezas[j];
   if(cerca(a[a.length-1],b[0])){piezas[i]=a.concat(b.slice(1));piezas.splice(j,1);unido=true}
   else if(cerca(a[a.length-1],b[b.length-1])){piezas[i]=a.concat(b.slice().reverse().slice(1));piezas.splice(j,1);unido=true}
   else if(cerca(a[0],b[0])){piezas[i]=b.slice().reverse().concat(a.slice(1));piezas.splice(j,1);unido=true} } }
 let linea=null,mejor=0;
 for(const l of piezas){ if(!dentro(l))continue; if(l.length>mejor){mejor=l.length;linea=l} }
 if(!linea)return null;
 const M=5, x0=caja[0]-M,x1=caja[1]+M,y0=caja[2]-M,y1=caja[3]+M;
 const a=linea[0], b=linea[linea.length-1];
 // prolongar los extremos hasta el borde de la caja en la direccion del tramo final
 const ext=(p,q)=>{ const dx=p[0]-q[0],dy=p[1]-q[1]; const n=Math.hypot(dx,dy)||1; return [p[0]+dx/n*40,p[1]+dy/n*40] };
 // LA DIRECCION DE SALIDA NO ES LA DEL ULTIMO TRAMO. El primer tramo del Negro
 // mide treinta kilometros y apunta al oeste; prolongarlo por ahi mandaba el
 // rio a la Patagonia otra vez, solo que por otro camino. Se prolonga con la
 // cuerda de los ultimos quince vertices, que es la direccion del rio y no del
 // meandro.
 // ... y tampoco la de los ultimos quince: el Obi acaba en su golfo apuntando
 // al nordeste y la prolongacion cruzaba el Taz por tierra. Se prolonga con la
 // cuerda del ultimo tercio del rio, que es su rumbo general.
 const K=Math.max(2,Math.min(Math.floor(linea.length/3),linea.length-1));
 const A=ext(a,linea[K]), B=ext(b,linea[linea.length-1-K]);
 const poly=[A].concat(linea,[B]);
 // cerrar por el lado pedido
 const cierre={N:[[B[0],y1+40],[A[0],y1+40]],S:[[B[0],y0-40],[A[0],y0-40]],
               E:[[x1+40,B[1]],[x1+40,A[1]]],W:[[x0-40,B[1]],[x0-40,A[1]]]}[lado];
 if(!cierre)return null;
 const ring=poly.concat(cierre); ring.push(ring[0]);
 try{ return pc.intersection([[ring]],cajaPoly([x0,x1,y0,y1])) }catch(e){ return null }
}

console.log('entidad              region fisica            periodos   antes    despues   anillos');
let nTot=0, aAntes=0, aDesp=0, fallosResta=0;
for(let fila=0;fila<TABLA.length;fila++){ const e=TABLA[fila]; cacheClave=null; cacheEnT=null;
 const c=CIV.find(x=>x.id===e.id);
 if(!c){console.log('   ?? no existe '+e.id);continue}
 if(c.kind!=='cultura'){console.log('   ?? '+e.id+' no es un area cultural: no se toca');continue}
 // `caja:[x0,x1,y0,y1]` en vez de `region`: una franja que Natural Earth no
 // nombra (la costa atlantica de Gabon y el Congo, que se quedo sin dueno al
 // sustituir la selva por la CUENCA DEL CONGO). La recorta a tierra y resta a
 // los demas igual que a una region; se usa casi siempre con modo:'suma'.
 let base=[];
 // region y bioma a la vez: la region recortada al bioma (el Escudo Canadiense
 // solo en su taiga; la sabana sudanesa solo donde el clima es de sabana)
 // Los poligonos de clima salen de una malla de medio grado suavizada y se
 // quedan cortos en la costa: Turku, en la costa suroeste de Finlandia, no
 // caia en ningun bioma. Se ensanchan ENSANCHA grados (0,3 por defecto) con
 // cuatro copias desplazadas; el recorte a tierra y la resta de vecinos
 // devuelven el borde exacto donde toca.
 const ENSANCHA=+(process.env.ENSANCHA||0.3);
 const mueveP=(polys,dx,dy)=>polys.map(poly=>poly.map(r=>r.map(q=>[q[0]+dx,q[1]+dy])));
 const ensancha=polys=>{ if(!ENSANCHA)return polys; try{ return pc.union(polys,mueveP(polys,ENSANCHA,0),mueveP(polys,-ENSANCHA,0),mueveP(polys,0,ENSANCHA),mueveP(polys,0,-ENSANCHA)) }catch(err){ return polys } };
 const biomaDe=nombre=>{ const C=require('./clima.js'); let g=[];
  for(const nm of nombre.split('|')){ const gr=C.grupo(nm); let polis=gr.anillos.map(r=>[r.concat([r[0]])]);
   if(gr.huecos.length){ try{ polis=pc.difference(polis,gr.huecos.map(r=>[r.concat([r[0]])])) }catch(err){} }
   g.push(...polis) } return ensancha(g) };
 if(e.bioma&&!e.region){
  // `bioma:'taiga|tundra'`: los poligonos de clima de clima.js (Koppen-Geiger
  // suavizado), unidos; con caja y lado se recortan igual que una region.
  const C=require('./clima.js'); let g=[];
  for(const nm of e.bioma.split('|')){ const gr=C.grupo(nm); let polis=gr.anillos.map(r=>[r.concat([r[0]])]);
   if(gr.huecos.length){ try{ polis=pc.difference(polis,gr.huecos.map(r=>[r.concat([r[0]])])) }catch(err){} }
   g.push(...polis) }
  base=g; e.region='bioma '+e.bioma;
  if(e.caja){ try{ base=pc.intersection(base,[cajaPoly(e.caja)]) }catch(err){ base=[] } if(!base.length){console.log('   ?? la caja deja vacio el bioma en '+e.id);continue} }
 }
 else if(e.caja&&!e.region){ base=[cajaPoly(e.caja)]; e.region='caja '+e.caja.join(',') }
 else {
  const regs=F.region(e.region);
  if(!regs.length){console.log('   ?? no hay region fisica que encaje con '+e.region);continue}
  for(const r of regs)for(const a of r.anillos)base.push([a.concat([a[0]])]);
  // region y caja a la vez: la region recortada a la caja (las COAST RANGES
  // van de California a Washington; a California le toca su mitad)
  if(e.caja){ try{ base=pc.intersection(base,[cajaPoly(e.caja)]) }catch(err){ base=[] } if(!base.length){console.log('   ?? la caja deja vacia la region en '+e.id);continue} }
  if(e.bioma){ try{ base=pc.intersection(base,biomaDe(e.bioma)) }catch(err){ base=[] } if(!base.length){console.log('   ?? el bioma deja vacia la region en '+e.id);continue} e.region+=' & '+e.bioma } }
 const caja=bbG(base);
 if(e.lado){ for(const [rio,ld] of e.lado){ const h=ladoDeRio(rio,ld,caja);
   if(!h){console.log('   ?? rio no encontrado o lado invalido: '+rio+' '+ld);base=null;break}
   try{ base=pc.intersection(base,h) }catch(err){ base=null;break } }
  if(!base||!base.length){console.log('   ?? el corte por rios deja vacio a '+e.id);continue}
  if(process.env.DEBUG)console.log('   base tras rios: '+areaR(base.map(q=>q[0])).toFixed(0)+' g2 en '+base.length+' poligonos') }
 let nP=0, a0=0, a1=0, nAnt=0, nDes=0, saltados=0;
 // UN PERIODO SE PARTE DONDE ENTRA O SALE UN ESTADO. La resta contra todo el
 // tramo es correcta pero ciega: si Corasmia es abasi hasta 821 y el periodo
 // turcomano va de 819 a 900, dos anios de solape le quitan al fondo ochenta.
 // Asi que antes de calcular se parte el periodo del sustrato en cada frontera
 // temporal de un estado cuyo anillo toque la region. Es lo que hace
 // despuebla.js con el registro de vacio, aplicado a los vecinos.
 if(!process.env.SINPARTIR){
  const cortes=new Set();
  const tocaRegion=rs=>rs.some(rr=>rr.some(q=>base.some(b=>L.pip(q,b[0]))));
  for(const o of CIV){ if(o===c||o.kind==="cultura")continue;
   for(const q of o.periods){ const bb=L.bb(q.rings[0]||[[0,0]]);
    if(!q.rings.length)continue;
    const dentro=q.rings.filter(rr=>{const b=L.bb(rr);return !(b[1]<caja[0]||b[0]>caja[1]||b[3]<caja[2]||b[2]>caja[3])});
    if(!dentro.length||!tocaRegion(dentro))continue;
    cortes.add(q.start); cortes.add(q.end) } }
  let partidos=0;
  for(const y of [...cortes].sort((a,b)=>a-b)){
   const p=c.periods.find(p=>p.start<y&&p.end>y); if(!p)continue;
   if(e.desde!=null&&y<=e.desde)continue; if(e.hasta!=null&&y>=e.hasta)continue;
   const n={start:y,end:p.end,rings:p.rings.map(rr=>rr.map(q=>q.slice()))};
   if(p.name)n.name=p.name; if(p.wikiTitle)n.wikiTitle=p.wikiTitle; if(p.inc)n.inc=1;
   p.end=y; c.periods.push(n); partidos++ }
  if(partidos){ c.periods.sort((a,b)=>a.start-b.start||a.end-b.end); if(process.env.DEBUG)console.log("   "+c.id+": "+partidos+" cortes de periodo") }
 }
 for(const p of c.periods){
  if(e.desde!=null&&p.end<=e.desde)continue;
  if(e.hasta!=null&&p.start>=e.hasta)continue;
  if(!p.rings.length)continue;
  const A=Math.floor((Math.max(p.start,-10000)+Math.min(p.end,2025))/2);
  let g=base;
  const vac=[];
  for(const v of V.TODO){ if(!V.vacioEn(v,A))continue;
   if(v.caja[1]<caja[0]||v.caja[0]>caja[1]||v.caja[3]<caja[2]||v.caja[2]>caja[3])continue;
   vac.push(v.poly?[v.poly.concat([v.poly[0]])]:cajaPoly(v.caja)) }
  if(vac.length){ try{ g=pc.difference(g,vac) }catch(err){} }
  const otros=[];
  const claveOtros=[];   // identidad de cada anillo restado, para la cache de abajo
  for(const o of CIV){ if(o===c)continue;
   // IGNORA=1: no restar a los companeros de tabla. En un rediseno por grupo
   // (Siberia entera) las formas viejas de los que aun no se han rehecho
   // taparian las nuevas; se pasa la tabla dos veces, la primera asi y la
   // segunda normal, para que el orden de la tabla decida quien cede.
   if(process.env.IGNORA==='1'&&enTabla.has(o.id))continue;
   // IGNORA=2: no restar a los companeros que vienen DESPUES en la tabla (aun
   // llevan su forma vieja); los de antes ya estan rehechos y si se restan.
   // Con esto basta una pasada y el orden de la tabla decide quien cede.
   // (se compara con la FILA actual, no con la primera fila de la entidad: una
   // entidad puede tener filas tempranas -su cordillera- y una tardia -lo que
   // sobra-, y la tardia tiene que restar a todos los que ya empezaron)
   if(process.env.IGNORA==='2'&&enTabla.has(o.id)&&ordenTabla.get(o.id)>fila)continue;
   // NORESTAR=id,id: vecinos que no se restan (un parche posterior a una tabla
   // entera: la fila nueva de dene tiene que poder entrar donde ya esta cree, y
   // luego resuelve_dobles con TABLAS decide por el orden de la tabla)
   if(NORESTAR.has(o.id))continue;
   for(const q of o.periods){ if(q.end<=p.start||q.start>=p.end)continue;
    for(const r of q.rings){ const b=L.bb(r);
     if(b[1]<caja[0]||b[0]>caja[1]||b[3]<caja[2]||b[2]>caja[3])continue;
     otros.push([r.concat([r[0]])]); claveOtros.push(idAnillo(r)) } } }
  // LA CACHE DE PERIODOS. Una entidad partida en seiscientos periodos repite
  // seiscientas veces la misma resta cuando sus vecinos no han cambiado entre
  // un periodo y el siguiente. Si los anillos restados (y los vacios) son los
  // mismos que en el periodo anterior, el resultado recortado a tierra tambien.
  const clave=claveOtros.join(',')+'|'+vac.length+'|'+A_vac(vac);
  let enT, fin=[];
  if(clave===cacheClave&&cacheEnT){ enT=cacheEnT; cacheUsos++ }
  else {
  // LA RESTA VA POR TANDAS. Una sola diferencia contra cientos de anillos
  // revienta dentro de polygon-clipping con cierta frecuencia, y la primera
  // version se tragaba la excepcion y saltaba el periodo entero sin decirlo:
  // 27 de 52 periodos de caribes_guayanas se quedaron sin la Guayana interior
  // por eso. Ahora se resta de 20 en 20 y, si una tanda falla, de uno en uno.
  for(let i=0;i<otros.length&&g;i+=20){
   const tanda=otros.slice(i,i+20);
   try{ g=pc.difference(g,tanda) }
   catch(err){ for(const o of tanda){ try{ g=pc.difference(g,[o]) }catch(e2){ fallosResta++ } } }
   if(!g||!g.length)break;
  }
  if(!g||!g.length){ saltados++; cacheClave=clave; cacheEnT=[]; if(process.env.DEBUG)console.log("   ["+p.start+"] vacio tras restar"); continue }
  // Un anillo que sale malo de la limpieza (el corte vertical de `parte` deja
  // vertices de contacto) no se tira: se parte en piezas limpias con la union
  // consigo mismo, igual que mas abajo con los de la costa. Tirarlo entero
  // dejaba sin la mitad oriental a toda Siberia occidental.
  const repara=x=>{ if(!malo(x))return [x]; let u=null; try{ u=pc.union([[x.concat([x[0]])]],[[x.concat([x[0]])]]) }catch(err){ return [] }
   return R.limpia(u,3e-4).filter(y=>!malo(y)) };
  fin=[]; for(const x of R.limpia(g,3e-4))fin.push(...repara(x));
  // EL RECORTE A TIERRA DEVUELVE ANILLOS QUE SE TOCAN A SI MISMOS. Al cortar
  // el Escudo Guayanes contra la costa salen anillos con un vertice de contacto,
  // y `malo` los rechaza enteros: 52 de 52 periodos se perdian por eso. La
  // union del anillo consigo mismo los parte en piezas limpias; lo que siga
  // mal despues de eso si se descarta.
  enT=[]; for(const r of fin){ for(const x of R.aTierra(r)){
   if(!malo(x)){enT.push(x);continue}
   // (la union necesita DOS operandos: con uno solo polygon-clipping devuelve el anillo tal cual, y el malo se tiraba entero; medio Siberia occidental se perdia asi)
   let u=null; try{ u=pc.union([[x.concat([x[0]])]],[[x.concat([x[0]])]]) }catch(err){ u=null }
   if(u) for(const y of R.limpia(u,3e-4)) if(!malo(y))enT.push(y);
  } }
  cacheClave=clave; cacheEnT=enT;
  }
  if(process.env.DEBUG)console.log("   ["+p.start+"] g="+(g?g.length:'cache')+" limpia="+fin.length+" enT="+enT.length+" areas="+enT.map(x=>Math.abs(L.rA(x)).toFixed(2)).slice(0,12).join(",")+" malos="+enT.filter(x=>malo(x)).length+
   (process.env.DEBUG==='2'&&global.__dump!==fila&&(global.__dump=fila)>=0&&require('fs').writeFileSync('/tmp/geo/_g_'+fila+'.json',JSON.stringify({base,g,fin:null}))?"":"")+(process.env.DEBUG==='2'?"  g: "+g.map(q=>q.length+"an "+Math.abs(L.rA(q[0])).toFixed(1)+"g2 "+L.bb(q[0]).map(v=>v.toFixed(1)).join(",")).slice(0,6).join(" | "):""));
  // y fuera las astillas (ver astillas.js): largas, estrechas y pequenas
  const perimR=r=>{let t=0;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];t+=Math.hypot(b[0]-a[0],b[1]-a[1])}return t};
  const astilla=r=>{ const a=Math.abs(L.rA(r)); if(a>=0.5)return false; const b=L.bb(r); const corto=Math.min(b[1]-b[0],b[3]-b[2]),largo=Math.max(b[1]-b[0],b[3]-b[2]);
   return corto<0.15&&largo/Math.max(corto,1e-6)>=15&&a/(perimR(r)/2)<0.1 };
  fin=enT.filter(x=>!malo(x)&&Math.abs(L.rA(x))>MINPIEZA&&!astilla(x));
  if(!fin.length){ saltados++; if(process.env.DEBUG)console.log("   ["+p.start+"] nada en tierra"); continue }
  if(e.modo==='suma'){
   // lo nuevo no puede pisar lo viejo de la propia entidad
   let g2=null; try{ g2=pc.difference(fin.map(x=>[x.concat([x[0]])]),p.rings.map(x=>[x.concat([x[0]])])) }catch(err){ g2=null }
   const extra=g2?R.limpia(g2,3e-4).filter(x=>!malo(x)&&Math.abs(L.rA(x))>MINPIEZA):[];
   if(!extra.length){ saltados++; if(process.env.DEBUG)console.log("   ["+p.start+"] sin extra (g2 "+(g2?g2.length:"null")+")"); continue }
   fin=p.rings.concat(extra);
  }
  const va=areaR(p.rings), na=areaR(fin);
  // guarda:false en la fila la desactiva: un rediseno entero (Siberia por
  // rios) cambia a proposito mas de la mitad de lo que habia
  // ni con guarda:false se deja un periodo en nada: si lo que queda no llega
  // a medio grado2 y antes habia mas de cinco, es que la formula no encaja
  // Con guarda:false el resultado se aplica aunque sea diminuto: en un
  // rediseno por grupo, "casi nada" es la respuesta correcta cuando la region
  // ya es de otro, y dejar la forma vieja es lo que producia solapes (Ogaden
  // contra el Cuerno). Solo se avisa para que la tabla se revise.
  if(e.guarda===false&&!e.modo&&na<0.5&&va>5){ casiVacios.add(c.id+' ['+p.start+'] '+va.toFixed(1)+' -> '+na.toFixed(2)) }
  if(e.guarda!==false&&na<va*0.5){ saltados++; if(process.env.DEBUG)console.log("   ["+p.start+"] guarda "+va.toFixed(1)+" -> "+na.toFixed(1)); continue }
  a0+=va; a1+=na; nAnt+=p.rings.length; nDes+=fin.length; nP++;
  if(APLICA){ p.rings=fin; if(p.inc)delete p.inc }   // ya no es un relleno
 }
 if(!nP){console.log('   ?? ningun periodo aplicable en '+e.id+(saltados?' ('+saltados+' saltados por la guarda)':''));continue}
 nTot+=nP; aAntes+=a0; aDesp+=a1;
 console.log(e.id.padEnd(21)+String(e.region).slice(0,24).padEnd(25)+String(nP).padStart(7)+
  a0.toFixed(0).padStart(9)+a1.toFixed(0).padStart(10)+('  '+nAnt+' -> '+nDes)+(saltados?'   ('+saltados+' saltados)':''));
}
console.log('anillos que no se pudieron restar: '+fallosResta);
if(casiVacios.size){ console.log('\n   !! sustituciones casi vacias (la region ya era de otro; revisar la tabla): '+casiVacios.size); for(const x of [...casiVacios].slice(0,12))console.log('      '+x) }
console.log('\n'+nTot+' periodos remodelados, '+aAntes.toFixed(0)+' -> '+aDesp.toFixed(0)+' grados cuadrados'+(cacheUsos?'   (cache de periodos: '+cacheUsos+' reutilizados)':''));
if(APLICA){ const s=process.env.SALIDA||process.env.JSX; L.save(doc.src,doc.R,doc.CIV,s); console.log('aplicado -> '+s) }
else console.log('(informe. --aplica para escribir)');
