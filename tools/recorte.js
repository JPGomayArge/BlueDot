// Limpieza de resultados de polygon-clipping y recorte a la costa.
const pc=require('polygon-clipping');
const L=require('./lib.js');const G=require('./geoutil.js');const T=require('./tierra.js');const {malo}=require('./auto_int_lib.js');
const R2=x=>x.map(q=>[Math.round(q[0]*100)/100,Math.round(q[1]*100)/100]);
const A=r=>{let a=0;for(let i=0;i<r.length;i++){const j=(i+1)%r.length;a+=r[i][0]*r[j][1]-r[j][0]*r[i][1]}return Math.abs(a/2)};
const cajaP=(x0,x1)=>[[[x0,-90],[x1,-90],[x1,90],[x0,90],[x0,-90]]];
// Cuando un recorte deja un agujero interior el poligono se abre con una
// RANURA: un rectangulo de cuatro centesimas de grado que sube desde el vertice
// mas alto del agujero hasta fuera del poligono. Al restarla, el agujero queda
// unido al exterior y el anillo es uno solo, sin huecos. La ranura tiene
// anchura, asi que no es una auto-interseccion (el ojo de cerradura de ancho
// cero si lo era), y el motor no la pinta porque a los dos lados hay el mismo
// territorio.
//
// La version anterior partia el poligono en tiras con cortes verticales por
// cada agujero. Con muchos agujeros salian decenas de tiras, y en el camino
// -recorte a tierra, reparacion- se perdian algunas: en el Kalahari quedaban
// barras verticales de la sabana austral metidas en el territorio khoisan.
function parte(poly,prof){
 if(poly.length===1)return [poly[0]];
 if(prof>4)return [poly[0]];
 // los agujeros de menos de una centesima de grado2, o mas estrechos que la
 // ranura, se rellenan: no se ven y, abiertos, cruzaban sus propias aristas
 const bbx=r=>{let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const p of r){if(p[0]<a)a=p[0];if(p[0]>b)b=p[0];if(p[1]<c)c=p[1];if(p[1]>d)d=p[1]}return [a,b,c,d]};
 const agujeros=poly.slice(1).filter(h=>{ const b=bbx(h); return A(h)>=0.01&&Math.min(b[1]-b[0],b[3]-b[2])>=0.06 });
 if(!agujeros.length)return [poly[0]];
 poly=[poly[0]].concat(agujeros);
 const ranuras=[];
 for(const h of agujeros){ let top=h[0]; for(const p of h) if(p[1]>top[1])top=p;
  // en centesimas exactas y con holgura: al redondear a centesimas (limpia) una
  // ranura de dos centesimas se cerraba en un vertice y el anillo salia malo
  const x=Math.round(top[0]*100)/100, y=Math.round(top[1]*100)/100-0.03;
  ranuras.push([[[x-0.02,y],[x+0.02,y],[x+0.02,200],[x-0.02,200],[x-0.02,y]]]) }
 let res; try{ res=pc.difference(poly,ranuras) }catch(e){ return [poly[0]] }
 const out=[]; for(const q of res||[]){ if(A(q[0])<1e-5)continue; if(q.length>1)out.push(...parte(q,prof+1)); else out.push(q[0]) }
 return out.length?out:[poly[0]];
}
function limpia(mp,min){
 const bruto=[];for(const poly of mp||[])bruto.push(...parte(poly,0));
 const o=[];
 for(const x0 of bruto){const x=R2(x0);const d=[];
  for(const q of x){const l=d[d.length-1];if(!l||l[0]!==q[0]||l[1]!==q[1])d.push(q)}
  if(d.length>1&&d[0][0]===d[d.length-1][0]&&d[0][1]===d[d.length-1][1])d.pop();
  // LAS PUAS DEL REDONDEO. Al pasar a centesimas, dos vertices vecinos pueden
  // caer en el mismo punto y el anillo va y vuelve por la misma arista
  // (a -> b -> a): una auto-interseccion de area cero que `malo` rechazaba y
  // la reparacion por union convertia en agujeros y tiras. Se quitan aqui.
  let hubo=true; while(hubo&&d.length>=4){ hubo=false;
   for(let i=0;i<d.length;i++){ const a=d[(i-1+d.length)%d.length], b=d[(i+1)%d.length];
    if(a[0]===b[0]&&a[1]===b[1]){ if(i+1<d.length)d.splice(i,2); else { d.splice(i,1); d.splice(0,1) } hubo=true; break } }
   for(let i=d.length-1;i>0;i--) if(d[i][0]===d[i-1][0]&&d[i][1]===d[i-1][1])d.splice(i,1);
   if(d.length>1&&d[0][0]===d[d.length-1][0]&&d[0][1]===d[d.length-1][1])d.pop(); }
  // y si aun se toca a si mismo (dos cruces de la ranura con el agujero que el
  // redondeo junta en un vertice), se poda el vertice que sobra, como hace
  // arregla_auto.js, hasta doce veces
  { let k=0, ij; while(d.length>5&&k<12&&(ij=malo(d))){ d.splice(ij[1],1); k++ } }
  if(d.length>=4&&Math.abs(L.rA(d))>(min||3e-4))o.push(L.rA(d)<0?d.reverse():d)}
 return o;
}
// RECORTE A LA COSTA. Tenia DOS fallos, encontrados en la ronda 28, y el
// segundo llevaba toda la campana metiendo mar en el mapa.
//
// 1. EL ANTIMERIDIANO. Usaba `T.PZ`, que son los anillos crudos de la mascara.
//    El anillo euroasiatico cruza la linea de fecha por Chukotka, asi que da
//    dos saltos de ~360 grados que el recortador toma por aristas reales. Es
//    exactamente el fallo que la cabecera de `tierra.js` documenta y que alli
//    se arreglo para `enTierra` con `partirFecha`; `recorte.js` nunca lo
//    heredo. Medido: una caja de tierra pura sobre el Obi (76-90 E, 64,5-66,75
//    N) volvia con 7,6 de sus 31,5 grados cuadrados, y la mitad de lo que
//    devolvia en Kola caia en agua. Ahora se recorta contra `T.PLANO`, que ya
//    esta partido en la linea de fecha: se intersecta con los contornos
//    exteriores y se restan los huecos.
//
// 2. EL RESPALDO QUE DEVOLVIA EL POLIGONO SIN RECORTAR. La ultima linea era
//    `return res.length?res:[R2(p)]`: cuando la interseccion no daba nada
//    -es decir, CUANDO EL POLIGONO ESTABA ENTERO EN EL MAR- devolvia el
//    poligono intacto. Asi es como el mar se convertia en tierra. No es un
//    problema artico: una caja sobre el golfo de Vizcaya, a medio planeta de
//    la linea de fecha, volvia con 12 grados cuadrados de oceano al 0% de
//    tierra. Cualquier poligono mal dibujado por cualquier agente en cualquier
//    ronda entraba entero si caia en agua.
//    Ahora devuelve VACIO. Quien llama debe comprobarlo: `redibuja_anillo` ya
//    lo hacia y avisa; `anade`, `crea`, `crea_periodo` y `sustituye` reciben
//    una lista vacia y no anaden nada, que es lo correcto.
function aTierra(poly){
 const p=(poly[0][0]===poly[poly.length-1][0]&&poly[0][1]===poly[poly.length-1][1])?poly.slice(0,-1):poly;
 const b=G.bbx(p);
 const fuera=[],huecos=[];
 for(const z of T.PLANO){
  for(const f of z.fuera) if(G.hit(b,f.b)) fuera.push([f.r]);
  for(const h of z.huecos) if(G.hit(b,h.b)) huecos.push([h.r]);
 }
 if(!fuera.length)return [];
 let res=[];
 try{
  res=pc.intersection([[p]],fuera);
  if(res&&res.length&&huecos.length){try{res=pc.difference(res,huecos)}catch(e){}}
  // EL UMBRAL QUE BORRABA EL PACIFICO (ronda 59).
  //
  // Aqui habia `limpia(res,0.02)`: toda pieza de menos de 0,02 grado2 se tiraba.
  // Seis de las siete herramientas del proyecto pasan por `aTierra`, y `anade`
  // se salta la operacion EN SILENCIO cuando vuelve vacia. O sea: **ninguna
  // isla de menos de unos 250 km2 podia entrar en el mapa por ninguna via**, ni
  // anadirse ni quitarse.
  //
  // No es que nadie hubiera mirado el Pacifico insular: es que el recortador lo
  // tiraba. Nauru mide 0,0022 grado2; Saipan, Yap y Tutuila, 0,0099; Kosrae y
  // Rarotonga, parecido. Las cuatro salian VACIO en todos los sondeos y no
  // habia forma de arreglarlo.
  //
  // El suelo pasa a 3e-4, que es el que ya usan `anade.js` y `sustituye.js`
  // para sus propios resultados: se mantiene la limpieza de astillas de
  // redondeo y dejan de desaparecer islas de verdad.
  res=limpia(res,3e-4);
 }catch(e){return []}
 return res;
}
module.exports={limpia,aTierra,parte,R2,A};
