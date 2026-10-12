#!/usr/bin/env node
// DETECTOR DE ORFANDAD. Suelo que una entidad suelta y que NADIE recoge.
//
// Por que existe, y por que no basta con arreglar reversion.js.
//
// La ronda 39 encontro los dos defectos mas grandes que quedaban en el mapa:
// 244 anios sin dueno en el alto Guadalquivir -al morir `almohad` en 1248
// Castilla no heredaba 36 de sus 50 celdas andaluzas- y sesenta anios sin dueno
// en el Sir Daria -al deshacerse el imperio de Timur en 1405, `timurid` caia de
// 769 celdas a 427 y nadie recogia las 342. Los dos son exactamente la familia
// de defecto que `reversion.js` existe para cazar. Los dos le pasaron por
// delante sin que se enterase. `almohad` y `timurid` NO APARECEN en su lista de
// 145 entidades: ni en el puesto 40, ni en el 145.
//
// La razon es la enfermedad de siempre, y ya van seis veces:
//
//   - Malla de 3 grados. Son 1.657 celdas de tierra en todo el planeta.
//     Andalucia entera cabe en una. Un defecto de 36 celdas a 0,2 grados es
//     UNA celda a 3 grados, y ordenando por numero de celdas queda por debajo
//     del ruido.
//   - Cortes de tiempo fijos y espaciados: ...1200, 1400, 1500... El hueco de
//     Andalucia se abre en 1248 y el de Asia Central en 1405. Los dos caen
//     DENTRO de un salto, donde el muestreo no mira.
//
// Bajar la malla y meter mas cortes no arregla el metodo, solo mueve el umbral
// de ceguera. Asi que este detector no usa malla NI cortes: usa la propia
// estructura del mapa.
//
//   Para cada periodo de cada entidad se calcula, por algebra de poligonos, EL
//   SUELO QUE CEDE al pasar al siguiente -o todo el suyo, si es el ultimo- y se
//   pregunta quien lo tiene el ano del traspaso. Lo que no tenga nadie es
//   orfandad, y se mide en grados2 exactos, no en celdas.
//
// De ahi salen tres cosas que la version de malla no podia dar: el ANIO exacto
// del traspaso, porque es un limite de periodo real y no un corte inventado; el
// AREA exacta; y la CAJA del suelo huerfano, que es lo que hace falta para
// repararlo. La duracion se mide despues, sondeando hacia adelante hasta que
// alguien lo recoge.
//
// Se ordena por GRADO2 x ANIO, no por numero de celdas. Un hueco pequeno que
// dura tres siglos y uno grande que dura veinte anios pesan lo que deben.
//
//   JSX=<mapa> node orfandad.js [MIN_AREA] [CUANTOS]
//
// PRUEBA DE CALIBRACION. Este fichero se valida contra respuesta conocida:
// corriendolo sobre un mapa anterior a la ronda 39 tiene que sacar `almohad`
// en 1248 y `timurid` en 1403/1405 entre los primeros. Un detector que no
// encuentra los defectos que ya sabemos que estaban no sirve para buscar los
// que no sabemos.
const pc=require('polygon-clipping');
const L=require('./lib.js');
const R=require('./recorte.js');
const T=require('./tierra.js');
const V=require('./vacios.js');
const {CIV}=L.load(process.env.JSX);

const MIN=+(process.argv[2]||0.05);      // grados2: por debajo es ruido de talla
const CUANTOS=+(process.argv[3]||40);
const FIN_MAPA=2025;

const area=rings=>rings.reduce((s,r)=>s+Math.abs(L.rA(r)),0);
const areaMP=mp=>mp.reduce((s,pl)=>s+Math.abs(L.rA(pl[0])),0);
const cajaDe=rings=>rings.map(L.bb).reduce((a,x)=>a?
  [Math.min(a[0],x[0]),Math.max(a[1],x[1]),Math.min(a[2],x[2]),Math.max(a[3],x[3])]:x.slice(),null);
const cruza=(a,b)=>!(a[1]<b[0]||b[1]<a[0]||a[3]<b[2]||b[3]<a[2]);

// ---------------------------------------------------------------------------
// PODA. La primera version no terminaba, y no por donde parecia. Medido:
//   - las 4.723 diferencias de cesion cuestan 25 s en total: no es eso;
//   - `recorte.aTierra` cuesta 0,1 s POR POLIGONO, asi que solo puede correr
//     sobre los residuos que ya han sobrevivido, nunca sobre los candidatos;
//   - y lo que la ahogaba era juntar TODOS los anillos de cada rival vivo. Con
//     un filtro de caja POR ANILLO -no por periodo- los rivales de un residuo
//     medio bajan a DIEZ anillos y el residuo entero cuesta 9 ms.
// El orden importa: primero la cesion, luego el residuo contra rivales, y solo
// al final el recorte a tierra.
// ---------------------------------------------------------------------------
const IDX=[];
for(const c of CIV){
 const ps=c.periods.map(p=>({p,b:cajaDe(p.rings),rb:p.rings.map(L.bb)})).filter(x=>x.b);
 if(!ps.length)continue;
 IDX.push({c, b:cajaDe(c.periods.flatMap(p=>p.rings)), ps});
}

// Anillos vivos en `y` que cruzan `caja`, de todos menos `yo`.
function anillosEn(caja,y,yo){
 const out=[];
 for(const e of IDX){
  if(e.c===yo||!cruza(caja,e.b))continue;
  for(const q of e.ps){
   if(!(q.p.start<=y&&q.p.end>y))continue;
   if(cruza(caja,q.b))
    for(let k=0;k<q.p.rings.length;k++) if(cruza(caja,q.rb[k])) out.push([q.p.rings[k]]);
   break;                       // una entidad, un periodo vivo
  }
 }
 return out;
}
function residuoEn(poly,caja,y,yo){
 const otros=anillosEn(caja,y,yo);
 if(!otros.length)return poly;
 try{return pc.difference(poly,otros)}catch(e){return poly}
}

// Puntos representativos dentro de un residuo, para medir la duracion barato.
// Hacer algebra de poligonos diez veces por hallazgo cuesta mas que el hallazgo;
// un punto dentro y `has` es tres ordenes de magnitud mas rapido.
function puntosDe(mp,cuantos){
 const out=[];
 for(const pl of mp){
  const b=L.bb(pl[0]);
  for(let a=1;a<=3&&out.length<cuantos;a++)for(let z=1;z<=3&&out.length<cuantos;z++){
   const pt=[b[0]+(b[1]-b[0])*a/4, b[2]+(b[3]-b[2])*z/4];
   if(L.has(pl,pt)) out.push(pt);
  }
  if(out.length>=cuantos)break;
 }
 if(!out.length&&mp.length){                 // poligono muy fino: vale el centro
  const b=L.bb(mp[0][0]); out.push([(b[0]+b[1])/2,(b[2]+b[3])/2]);
 }
 return out;
}
function cubierto(pt,y){
 const cj=[pt[0],pt[0],pt[1],pt[1]];
 for(const e of IDX){
  if(!cruza(cj,e.b))continue;
  for(const q of e.ps){
   if(!(q.p.start<=y&&q.p.end>y))continue;
   if(cruza(cj,q.b)&&L.has(q.p.rings,pt))return true;
   break;
  }
 }
 return false;
}
// DURACION, y una trampa que la primera corrida dejo a la vista. El sondeo
// llevaba una escalera FIJA de saltos -25, 25, 50, 50, 100...- que suma 1.750
// anios. Para un hallazgo del ano -1000 eso llega al 750 d.C. y se acaba, y al
// acabarse devolvia FIN_MAPA - y0, o sea 3.025 anios, DIJERA LO QUE DIJERA EL
// MAPA. Asi `paleoesquimales` en -1000 encabezaba la lista con 652.000
// grado2-anio de peso, no por estar tres milenios sin dueno sino porque el
// sondeo se quedaba corto y el codigo daba por hecho lo peor.
//
// Es la misma familia que ya ha costado seis rondas: una constante interna de
// la herramienta -aqui la longitud de su propia escalera- acababa dominando la
// medida. La escalera pasa a ser GEOMETRICA y llega siempre al final del mapa:
// 25, 50, 100, 200... duplicando. Doce pasos cubren desde -6000 hasta 2025.
//
// Devuelve tambien si el suelo se recupera alguna vez, porque las dos familias
// no se reparan igual: un traspaso fallido -Andalucia 1248, Asia Central 1405-
// se rellena, y un suelo que NUNCA vuelve a tener dueno casi siempre es
// ignorancia legitima ya documentada en el registro de vacios.
function duracion(pts,y0){
 if(!pts.length)return {dur:0,cierra:true};
 let salto=25;
 for(;;){
  const yn=y0+salto;
  if(yn>=FIN_MAPA){
   let libres=0; for(const pt of pts) if(!cubierto(pt,FIN_MAPA-1))libres++;
   return {dur:FIN_MAPA-y0, cierra: libres<=pts.length/2};
  }
  let libres=0; for(const pt of pts) if(!cubierto(pt,yn))libres++;
  if(libres<=pts.length/2) return {dur:yn-y0, cierra:true};
  salto*=2;
 }
}

const hall=[];
let mirados=0, piezas=0;
const T0=Date.now();
const reloj=()=>((Date.now()-T0)/1000).toFixed(0)+'s';

// UNA PIEZA CADA VEZ. Lo que hacia que el detector no acabase, ya con todo lo
// demas podado, era el tamano del SUJETO. La cesion de una entidad grande al
// morir es una multipoligonal que puede cubrir un continente; restarle todos
// sus rivales de golpe es una sola operacion con miles de anillos, y son
// minutos por caso. Troceada por PIEZAS -cada poligono suelto de la cesion, con
// su propia caja apretada- los rivales de cada pieza son una decena. El
// resultado no cambia: la orfandad de una union es la union de las orfandades.
//
// Ademas se escribe cada hallazgo por el error segun aparece. Una herramienta
// que tarda media hora y no dice nada hasta el final no se puede depurar, y
// esta se reescribio cuatro veces antes de terminar una sola.
for(const {c,ps} of IDX){
 for(let i=0;i<ps.length;i++){
  const {p}=ps[i];
  const ultimo = i===ps.length-1;
  let cede, anio=p.end;
  if(ultimo){
   if(p.end>=FIN_MAPA)continue;
   cede=p.rings.map(r=>[r]);
  }else{
   const sig=ps[i+1];
   if(sig.p.start!==p.end)continue;
   // Prefiltro barato: sin perdida neta por encima del umbral no puede haber
   // residuo grande. Quita miles de recortes caros y no cambia el resultado.
   if(area(p.rings)-area(sig.p.rings) < MIN)continue;
   try{cede=pc.difference(p.rings.map(r=>[r]), sig.p.rings.map(r=>[r]))}catch(e){continue}
  }
  if(!cede||!cede.length||areaMP(cede)<MIN)continue;
  mirados++;
  if(mirados%100===0)process.stderr.write('  '+mirados+' cesiones | '+piezas+
    ' piezas | '+hall.length+' hallazgos | '+reloj()+'\n');
  for(const pieza of cede){
   if(Math.abs(L.rA(pieza[0]))<MIN)continue;
   piezas++;
   const cj=cajaDe(pieza);
   const res=residuoEn([pieza],cj,anio,c);
   if(!res.length||areaMP(res)<MIN)continue;
   // ORDEN DE LAS PRUEBAS. Las tres que quedan cuestan 1 us, 1 ms y 100 ms, asi
   // que van de barata a cara y cada una filtra para la siguiente:
   //   1. puntos de muestra sobre TIERRA. Un residuo entero en el mar no es
   //      orfandad, es costa, y se descarta sin tocar poligonos.
   //   2. DURACION por puntos. Lo que se cierra en menos de un cuarto de siglo
   //      es una transicion, no un hueco.
   //   3. y solo entonces `recorte.aTierra`, para el area exacta.
   // Al reves -recortando primero- el detector no acaba.
   const pts=puntosDe(res,9).filter(pt=>T.enTierra(pt));
   if(!pts.length)continue;
   const {dur,cierra}=duracion(pts,anio);
   // Un hueco que se cierra en el primer sondeo -veinticinco anios- no es
   // orfandad, es el desfase normal entre un arco que acaba y el siguiente.
   if(dur<=25)continue;
   // VACIO DOCUMENTADO. Si la mayoria de los puntos cae en el registro de
   // vacios deliberados -islas de poblamiento tardio, desiertos absolutos,
   // hielo- entonces que nadie lo pinte es la respuesta correcta y no un
   // defecto. El registro manda sobre el detector.
   let doc=0; for(const pt of pts) if(V.legitimo(pt,anio))doc++;
   if(doc>pts.length/2)continue;
   const tierra=[];
   for(const pl of res) for(const r of R.aTierra(pl[0])) tierra.push([r]);
   if(!tierra.length)continue;
   const at=areaMP(tierra);
   if(at<MIN)continue;
   const h={id:c.id, anio, area:at, dur, cierra, peso:at*dur,
            caja:cajaDe(tierra.map(pl=>pl[0]))};
   hall.push(h);
   process.stderr.write('  ! '+(cierra?'>':'=')+' '+h.id+' '+h.anio+'  '+h.area.toFixed(2)+
     ' grado2 x '+h.dur+' anios = '+Math.round(h.peso)+
     '  ['+h.caja.map(v=>v.toFixed(1)).join(' ')+']\n');
  }
 }
}

// DOS LISTAS, no una. Un traspaso fallido y un suelo que nunca vuelve a tener
// dueno son defectos distintos y se reparan distinto, y mezclarlos en un solo
// ranking hace que los segundos -que duran milenios y por tanto pesan mas-
// entierren a los primeros, que son los reparables.
const cierran = hall.filter(h=>h.cierra).sort((a,b)=>b.peso-a.peso);
const nunca   = hall.filter(h=>!h.cierra).sort((a,b)=>b.peso-a.peso);
const suma=v=>v.reduce((s,h)=>s+h.peso,0);
const tabla=(titulo,v,n)=>{
 console.log('\n'+titulo+': '+v.length+' piezas | '+Math.round(suma(v))+' grado2-anio');
 console.log('  grado2-anio    area   anio  dura  entidad                  caja (lon0 lon1 lat0 lat1)');
 for(const h of v.slice(0,n))
  console.log(String(Math.round(h.peso)).padStart(11),
    h.area.toFixed(2).padStart(8), String(h.anio).padStart(6), String(h.dur).padStart(5),
    '  '+h.id.padEnd(24),
    h.caja.map(v=>v.toFixed(1)).join(' '));
};
console.log('cesiones examinadas por encima de',MIN,'grados2:',mirados,'| piezas',piezas);
console.log('CESIONES QUE NADIE RECOGE:',hall.length,'| total',Math.round(suma(hall)),'grado2-anio');
tabla('TRASPASOS FALLIDOS (alguien lo recoge, pero tarde) -- ESTO SE REPARA',cierran,CUANTOS);
tabla('SUELO QUE NUNCA VUELVE A TENER DUENO -- juzgar antes de rellenar',nunca,Math.min(CUANTOS,20));
if(process.env.JSON) require('fs').writeFileSync(process.env.JSON,JSON.stringify(hall));
