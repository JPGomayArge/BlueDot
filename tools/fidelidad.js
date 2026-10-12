#!/usr/bin/env node
// FIDELIDAD DEL TRAZO. Mide la LINEA, no el punto.
//
// POR QUE HACE FALTA, Y QUE NO MIDE `plazas.js`.
//
// La red de plazas-testigo marca 99,99% sobre 7.919 sondeos. Eso suena a mapa
// terminado y no lo es, porque **un sondeo es un punto y un mapa es una linea**.
// Tres sesgos, y los tres importan:
//
//   1. UN PUNTO NO JUZGA UNA FORMA. Si Espana se dibujara como un circulo
//      centrado en Madrid, Madrid, Toledo y Burgos seguirian acertando. El
//      mapa tiene 135.000 anillos y la red toca 683 puntos: pasar el test no
//      dice nada del contorno entre ellos.
//   2. LOS TESTIGOS SON CIUDADES, y las ciudades estan en el interior de los
//      estados, cerca de las capitales y de la costa, casi nunca en la
//      frontera. La frontera es justo lo dificil y justo lo que no se prueba.
//   3. LA RED CONVERGIO EN PARTE HACIA EL MAPA. De los 269 fallos de la ronda
//      56, 120 se resolvieron corrigiendo la expectativa. Cada correccion
//      lleva su razon escrita y se audita, pero el efecto neto es que una
//      parte del acuerdo es acuerdo, no comprobacion.
//
// Asi que esta herramienta mide otra cosa: **si el trazo sigue a la geografia**.
//
// LA TRAMPA QUE HAY QUE ESQUIVAR, Y QUE YA ENGANIO A `audit.js` EN LA RONDA 40.
// Alli se midio que fraccion del area de cada anillo cae sobre agua y salio 0%
// en los 38 anillos examinados. No era una buena noticia: **todo poligono del
// mapa pasa por `recorte.aTierra`, asi que por construccion ninguno puede
// contener mar.** La medida no media el mapa, media el recortador. La regla
// que quedo: *cualquier metrica multiplicada por una unidad que otra
// herramienta manipula, mide a esa herramienta.*
//
// De ahi que aqui NO se mida "cuanto mar hay dentro" -siempre cero- sino las
// tres cosas que el recortador no determina:
//
// LA SEGUNDA TRAMPA, Y CASI CAIGO EN ELLA. La primera version daba 69% de
// costa con dueno en el anio 2000, es decir que un tercio del litoral del mundo
// no lo pintaba nadie en pleno siglo XX. Al mirar los puntos concretos, el
// vecino mas proximo estaba **a 0,01, 0,05 y 0,12 grados**: uno, cinco y doce
// kilometros. No era un hueco: era que el contorno de `usa` o de `russia` es
// una version generalizada de la costa y no la sigue vertice a vertice, asi
// que el punto medio de un tramo de litoral cae a veces justo fuera.
//
//   **Un desajuste de trazo no es un hueco de propiedad.** Medir los dos
//   juntos convierte la resolucion del dibujo en territorio sin dueno, que es
//   la misma familia de error que ya costo la ronda 40.
//
// Asi que se separan, y el corte esta en 0,25 grados -unos 25 km, la mitad de
// la resolucion nominal de la mascara-:
//
//   ATRIBUIDA    el tramo cae dentro de una entidad. El trazo llega.
//   DESAJUSTE    no cae dentro, pero hay una entidad a menos de 0,25 grados.
//                El dueno esta claro y lo que falla es el detalle del trazo.
//                Es una medida de RESOLUCION, no de cobertura.
//   HUERFANA     no hay nadie a menos de 0,25 grados. Eso si es un hueco, y es
//                lo que se ve en el globo.
//
//   COSTA HUERFANA   tramos de litoral que no pinta NADIE. El recortador
//                    impide que un contorno se meta en el mar, pero no obliga
//                    a que llegue hasta la orilla. Un estado costero cuyo
//                    poligono corre tierra adentro deja una franja sin dueno,
//                    y eso es exactamente lo que se ve en el globo. Es la
//                    medida principal y es una medida de LINEA: se recorre el
//                    litoral del mundo -59.994 segmentos- y se pregunta por
//                    cada tramo quien lo tiene.
//   ASTILLA DE       huecos que son tiras finas entre DOS entidades. Dos
//   FRONTERA         vecinos que comparten frontera deberian compartir la
//                    misma linea; si cada uno dibujo la suya, entre las dos
//                    queda una astilla. Es el error de frontera interior
//                    hecho visible, y no hay otra forma de medirlo sin una
//                    fuente externa de fronteras historicas.
//   RESOLUCION       vertices por grado de contorno. Una frontera de seis
//                    vertices sobre 500 km afirma un detalle que no tiene.
//                    Se compara con la densidad de la propia costa en la
//                    misma ventana, que es la referencia honesta.
//
// CUANTO DE LA COBERTURA LA PONE EL SUSTRATO. Con `SINSUSTRATO=1` se repite la
// medida ignorando las entidades `kind:'cultura'`. La diferencia entre las dos
// lecturas no es un defecto: es cuanta costa esta pintada por un area cultural
// ancha y no por un estado con contorno. Importa saberlo porque explica por que
// el anio 2000 puntua PEOR que el 1500 -en 1500 media Siberia la cubre un
// sustrato generoso y en 2000 la cubre `russia` con un contorno fino-, y sin
// esa lectura uno concluiria que el mapa antiguo esta mejor dibujado que el
// moderno, que es justo al reves.
//
//   JSX=<mapa> node fidelidad.js [anio,anio,...]   (por defecto una rejilla)
//   JSON=<ruta> para volcar el detalle
//   DETALLE=1 reparto por region y entidad;  SINSUSTRATO=1 solo estados
const L=require('./lib.js');
const T=require('./tierra.js');
const V=require('./vacios.js');
const C=require('./costa_lib.js');
const {CIV}=L.load(process.env.JSX);
const ANIOS=(process.argv[2]||'-2000,1,500,1000,1500,1700,1900,2000').split(',').map(Number);

// --- el litoral del mundo, una sola vez ------------------------------------
// De cada segmento de costa se toma el punto medio y se desplaza 0,04 grados
// TIERRA ADENTRO. Hay que desplazarlo: un punto exactamente sobre el borde no
// esta ni dentro ni fuera -`pip` sobre el contorno devuelve false-, y eso ya
// costo una ronda con Kosrae, cuyo testigo caia justo en un vertice del anillo
// de la mascara y salia VACIO aunque la isla estuviera pintada.
const LITORAL=[];
{
 const todos=C.costaEn([-180,180,-56,78]);
 for(const s of todos){
  const [mx,my]=s.m;
  let dentro=null;
  for(const d of [[0.04,0],[-0.04,0],[0,0.04],[0,-0.04],[0.03,0.03],[-0.03,-0.03],[0.03,-0.03],[-0.03,0.03]]){
   const q=[mx+d[0],my+d[1]];
   if(T.enTierra(q)){dentro=q;break}
  }
  if(!dentro)continue;                       // islote menor que el desplazamiento
  LITORAL.push({p:dentro, len:s.len, m:s.m});
 }
}
const LARGO=LITORAL.reduce((s,x)=>s+x.len,0);
console.log('litoral indexado: '+LITORAL.length+' tramos, '+LARGO.toFixed(0)+' grados de contorno');
console.log('(los tramos de islas menores que el desplazamiento de 0,04 grados quedan fuera)\n');

// --- rejilla de tierra para las astillas ------------------------------------
const PASO=0.5;
const TIERRA=[];
for(let x=-180;x<180;x+=PASO)for(let y=-56;y<=78;y+=PASO){
 const p=[+x.toFixed(2),+y.toFixed(2)]; if(T.enTierra(p))TIERRA.push(p);
}

const quien=(vivos,pt)=>{ for(const v of vivos) if(L.has(v.p.rings,pt))return v.id; return null };

console.log('        litoral del mundo: '+LARGO.toFixed(0)+' grados de contorno\n');
console.log('anio    ATRIBUIDA  desajuste   HUERFANA    astillas   hueco de');
console.log('                   de trazo                frontera   region');
const det={};
for(const A of ANIOS){
 const vivos=[];
 for(const c of CIV){if(process.env.SINSUSTRATO&&c.kind==='cultura')continue;
  const p=c.periods.find(p=>p.start<=A&&p.end>A);
  if(p&&p.rings.length)vivos.push({id:c.id,p,b:p.rings.reduce((a,r)=>{const bb=L.bb(r);
   return [Math.min(a[0],bb[0]),Math.max(a[1],bb[1]),Math.min(a[2],bb[2]),Math.max(a[3],bb[3])]},[9e9,-9e9,9e9,-9e9])})}
 // 1. costa huerfana
 let conD=0, sinD=0, desaj=0; const huerf=[]; const ed={};
 for(const s of LITORAL){
  const cand=vivos.filter(v=>s.p[0]>=v.b[0]-0.1&&s.p[0]<=v.b[1]+0.1&&s.p[1]>=v.b[2]-0.1&&s.p[1]<=v.b[3]+0.1);
  let d=null; for(const v of cand) if(L.has(v.p.rings,s.p)){d=v.id;break}
  if(d){conD+=s.len;continue}
  if(V.legitimo(s.p,A)){conD+=s.len;continue}     // litoral legitimamente vacio
  // QUIEN DEBERIA TENERLO. Un tramo de litoral sin dueno casi nunca esta lejos
  // de quien deberia tenerlo: es el contorno de un vecino que se quedo corto.
  // Se busca la entidad viva mas proxima dentro de dos grados; si no hay
  // ninguna, es hueco de region y no de trazo, y se marca como tal.
  let cerca=null, dmin=Infinity;
  for(const v of vivos){
   if(s.p[0]<v.b[0]-2||s.p[0]>v.b[1]+2||s.p[1]<v.b[2]-2||s.p[1]>v.b[3]+2)continue;
   for(const r of v.p.rings){
    const bb=L.bb(r);
    if(s.p[0]<bb[0]-2||s.p[0]>bb[1]+2||s.p[1]<bb[2]-2||s.p[1]>bb[3]+2)continue;
    for(let i=0;i<r.length;i++){
     const d=Math.hypot(r[i][0]-s.p[0], r[i][1]-s.p[1]);
     if(d<dmin){dmin=d;cerca=v.id}
    }
   }
  }
  if(dmin<=0.25){ desaj+=s.len; if(cerca)ed[cerca]=(ed[cerca]||0)+s.len; continue }
  sinD+=s.len;
  huerf.push({m:s.m, len:s.len, de:(dmin<=2?cerca:null), d:(dmin<=2?+dmin.toFixed(2):null)});
 }
 // 2. astillas de frontera vs hueco de region
 let ast=0, reg=0; const astL=[];
 for(const pt of TIERRA){
  const cand=vivos.filter(v=>pt[0]>=v.b[0]-0.1&&pt[0]<=v.b[1]+0.1&&pt[1]>=v.b[2]-0.1&&pt[1]<=v.b[3]+0.1);
  let d=null; for(const v of cand) if(L.has(v.p.rings,pt)){d=v.id;break}
  if(d)continue;
  if(V.legitimo(pt,A))continue;
  // quien hay alrededor?
  const vec=new Set();
  for(const o of [[PASO,0],[-PASO,0],[0,PASO],[0,-PASO],[PASO,PASO],[-PASO,-PASO],[PASO,-PASO],[-PASO,PASO]]){
   const q=[pt[0]+o[0],pt[1]+o[1]];
   const c2=vivos.filter(v=>q[0]>=v.b[0]-0.1&&q[0]<=v.b[1]+0.1&&q[1]>=v.b[2]-0.1&&q[1]<=v.b[3]+0.1);
   for(const v of c2) if(L.has(v.p.rings,q)){vec.add(v.id);break}
  }
  if(vec.size>=2){ast++; astL.push({pt,entre:[...vec]})} else reg++;
 }
 const pc=100*conD/LARGO, pd=100*desaj/LARGO, ph=100*sinD/LARGO;
 console.log(String(A).padStart(6)+'   '+pc.toFixed(1).padStart(5)+'%'+
  '     '+pd.toFixed(1).padStart(5)+'%'+
  '     '+ph.toFixed(1).padStart(5)+'%'+
  '    '+String(ast).padStart(5)+'      '+String(reg).padStart(5));
 // reparto de la costa huerfana: por region y por entidad que se quedo corta
 const zona=p=>p[0]<-30?(p[1]>12?'America N':'America S'):p[0]<40?(p[1]>36?'Europa':'Africa')
              :p[0]<75?(p[1]>48?'Rusia':'Asia SO'):p[0]<105?(p[1]>48?'Siberia':'Asia S')
              :(p[1]>48?'Siberia E':'Asia E/Oc');
 const zh={}, eh={}; let nadie=0;
 for(const h of huerf){ const k=zona(h.m); zh[k]=(zh[k]||0)+h.len;
  if(h.de) eh[h.de]=(eh[h.de]||0)+h.len; else nadie+=h.len; }
 det[A]={pcCosta:pc, pcDesajuste:pd, pcHuerfana:ph, costaHuerfana:sinD, desajuste:desaj,
         desajustePorEntidad:ed, zonas:zh, entidades:eh, sinVecino:nadie,
         huerf:huerf.slice(0,600), astillas:astL.slice(0,400), regiones:reg};
 if(process.env.DETALLE){
  console.log('         por region: '+Object.entries(zh).sort((a,b)=>b[1]-a[1])
    .map(([k,v])=>k+' '+v.toFixed(0)).join(', '));
  console.log('         desajuste de trazo: '+Object.entries(ed).sort((a,b)=>b[1]-a[1]).slice(0,6)
    .map(([k,v])=>k+' '+v.toFixed(0)).join(', '));
  console.log('         se quedaron cortas: '+Object.entries(eh).sort((a,b)=>b[1]-a[1]).slice(0,8)
    .map(([k,v])=>k+' '+v.toFixed(0)).join(', ')+'  | sin vecino a menos de 2 grados: '+nadie.toFixed(0));
 }
}
if(process.env.JSON)require('fs').writeFileSync(process.env.JSON,JSON.stringify(det));
