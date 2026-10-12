#!/usr/bin/env node
// AUDITORÍA DE RÓTULOS CONTRA GEOMETRÍA.
//
// Por que existe. Once veces en cinco rondas ha aparecido el mismo defecto, y
// las once lo encontro un agente de casualidad mientras miraba otra cosa:
//
//   `ethiopia` 1936..1941 rotulada "Ocupacion italiana dentro del Africa
//     Oriental Italiana" y pintando Etiopia de corrido.
//   `ottoman` 1612..1629 diciendo "perdida de Bagdad (1623-1638)" y pintandola.
//   `samanid` 900..909 diciendo "Jorasan tras Balj (900)" sin tener Balj.
//   `idrisidas_norte` diciendo "Cordoba ocupa Ceuta en 931".
//   `yemen` 1650..1872 diciendo "Aden britanico desde 1839" y pintando Aden.
//   `bahmani` 1364..1469 diciendo "aun sin salida al mar de Konkan" y pintando
//     Bacaim y Thana.
//   `modern_china` diciendo "Macao 1999" sin un anillo sobre Macao.
//   `toungoo` 1510..1550 rotulada "feudo de Ava" con toda la Alta Birmania.
//   `almohad` con dos fases "Ultimos almohades en Marrakech hasta 1269" que no
//     contienen un palmo de Marruecos.
//   `konbaung` "sin Tenasserim tras Yandabo" con Tenasserim dentro.
//   `mapuche` "la Corona reconoce la frontera del Biobio" llegando a lat -33.8.
//
// El patron es siempre el mismo y es raro entre los defectos de este mapa: el
// texto es CORRECTO y la geometria lo contradice. Por eso sobrevive a la
// verificacion por entidad -quien revisa una civilizacion lee el rotulo y le da
// la razon- y por eso hace falta una prueba que enfrente las dos cosas.
//
// Un rotulo que cita un anio o una ciudad es una AFIRMACION COMPROBABLE. Esta
// herramienta hace dos comprobaciones:
//
//  1. ANACRONISMO. Extrae los anios citados en el texto y avisa si caen fuera
//     del periodo. Es puramente mecanico y no necesita saber nada del mundo.
//     Cuidado: un rotulo puede citar legitimamente un anio anterior -"tras la
//     paz de Westfalia (1648)" en una fase de 1700- asi que se informa de la
//     distancia y se deja el juicio a quien lee. Los saltos de siglos son los
//     que importan.
//
//  2. TOPONIMO. Si el rotulo nombra una ciudad del gazetteer, comprueba si la
//     geometria del periodo la contiene, y contrasta eso con lo que el verbo
//     del rotulo afirma. "toma X", "conquista X", "en X", "desde X" dicen que
//     deberia estar dentro; "pierde X", "sin X", "cede X", "abandona X" dicen
//     lo contrario. Los verbos estan en LISTAS abajo y son ampliables.
//
// El gazetteer sale de dos sitios que ya existen y estan verificados: las 306
// capitales de capitales.js y las 230 plazas-testigo de la ronda 20.
//
//   JSX=<mapa> node rotulos.js [--anios] [--topos] [--todo]
//
// Sin opciones hace las dos. La salida marca:
//   !A  anacronismo: anio citado lejos del periodo
//   !T  el rotulo afirma que una plaza es suya y la geometria dice que no
//   !N  el rotulo afirma que NO es suya y la geometria dice que si
const L=require('./lib.js');
const T=require('./tierra.js');
const {CIV}=L.load(process.env.JSX);
const fs=require('fs');

const ARGS=process.argv.slice(2);
const HAZ_ANIOS = !ARGS.length || ARGS.includes('--anios') || ARGS.includes('--todo');
const HAZ_TOPOS = !ARGS.length || ARGS.includes('--topos') || ARGS.includes('--todo');
const UMBRAL_ANIO = +(process.env.UMBRAL_ANIO||60);   // anios de holgura antes de avisar

// ---------------------------------------------------------------------------
// GAZETTEER
// ---------------------------------------------------------------------------
function normaliza(s){
 return s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g,'')   // quita acentos
  .replace(/[^a-z ]/g,' ').replace(/\s+/g,' ').trim();
}
// Las glosas de capitales.js producen entradas que NO son toponimos -"corte",
// "capital yuan", "la horda", "bagdad tras hulagu", "peninsula"- y cada una de
// ellas genera decenas de falsos positivos, porque "capital" o "corte" salen en
// cualquier rotulo. Se filtran: fuera las palabras genericas y fuera lo que
// tenga mas de dos palabras, que siempre es glosa y no nombre.
const BASURA=new Set(['corte','capital','capitales','peninsula','reino','imperio',
 'ciudad','valle','costa','isla','islas','norte','sur','este','oeste','centro',
 'alto','bajo','nueva','nuevo','gran','vieja','viejo','horda','dinastia','califato',
 // "la orilla izquierda del Mekong" no es una plaza. Entro en el gazetteer
 // como toponimo por una glosa de capitales.js y produjo cuatro avisos.
 'orilla','orillas','ribera','margen','cuenca','delta','llanura','meseta','sierra']);
const GAZ=new Map();   // nombre normalizado -> [lon,lat]
function mete(nombre,pt){
 const k=normaliza(nombre);
 if(k.length<4)return;                 // nombres de tres letras dan falsos positivos
 const pal=k.split(' ');
 if(pal.length>2)return;               // glosa, no toponimo
 if(pal.some(w=>BASURA.has(w)))return;
 if(!GAZ.has(k))GAZ.set(k,pt);
}
// de capitales.js
try{
 const cap=fs.readFileSync(__dirname+'/capitales.js','utf8');
 for(const m of cap.matchAll(/\["([^"]+)",(-?\d+),\[(-?[\d.]+),(-?[\d.]+)\],"([^"]+)"\]/g)){
  const pt=[+m[3],+m[4]];
  // el quinto campo es una glosa: "Gyeongju de Silla", "Hanyang, la actual Seul".
  // Se parten por comas y por " de " para quedarse con los toponimos sueltos.
  for(const trozo of m[5].split(/,| de | del | la actual /i)){
   const t=trozo.trim();
   if(t && !/^(el|la|los|las|actual)$/i.test(t)) mete(t,pt);
  }
 }
}catch(e){console.error('aviso: no se pudo leer capitales.js:',e.message)}
// De las plazas-testigo. Se leen de tools/plazas_base.js, que va con la
// herramienta. Antes se leian de /tmp/v20, que solo existe en la maquina donde
// se hizo la ronda 20: en la Mac el gazetteer se quedaba en 246 lugares en vez
// de 416 y el auditor perdia la mitad de sus avisos SIN DECIR NADA. Por eso el
// catch de abajo ya no es mudo: si la lista falta, avisa.
try{
 for(const p of require(__dirname+'/plazas_base.js')){
  // los nombres llevan glosas entre parentesis: "Nauplia", "Corfu (pixel de agua)"
  mete(p.nombre.replace(/\(.*?\)/g,''), [p.lon,p.lat]);
 }
}catch(e){
 console.error('AVISO: falta tools/plazas_base.js. El gazetteer se queda solo con');
 console.error('las capitales y el auditor vera bastante menos de lo que hay.');
}

// ---------------------------------------------------------------------------
// VERBOS
// ---------------------------------------------------------------------------
// RONDA 39: LA TRAMPA DE LA MENCION. Esta herramienta declaraba 138 !T y 68 !A.
// Se leyeron. De trece !T sacados al azar, DOCE eran falsos positivos, y de los
// seis !A que apuntaban hacia adelante, los SEIS. Ejemplos textuales:
//
//   carthage  "Alalia (535), Himera (480) y los tratados CON ROMA"
//   epiro     "NICEA anexiona Tesalonica; Miguel II retiene Arta"
//   crimean   "Haci Giray acuna en Qirq Yer mientras CAFFA SIGUE SIENDO GENOVESA"
//   gujarat   "Muzaffar ROMPE CON DELHI y Ahmad Shah funda Ahmedabad"
//   varsovia  "OCUPACION rusa tras la retirada de Napoleon; VIENA lo disuelve"
//   fatimid   "en La Meca la jutba fatimi ES NOMINAL"
//   mossi     "Yatenga y Wagadugu resisten HASTA la conquista francesa DE 1896"
//
// Ninguno afirma posesion. El rotulo NOMBRA un lugar -como enemigo, como
// vecino, como termino, como negacion explicita- y el extractor lo leia como
// reclamacion. Es el mismo error que ya costo tres rondas medido de otras
// maneras (periodos en la 27, vertices en la 28, duracion en la 35): UNA
// METRICA QUE CUENTA COINCIDENCIAS DE CADENA MIDE EL EXTRACTOR, NO EL MAPA.
//
// Tres reglas corrigen el extractor, y las tres salen de leer los casos:
//
//  1. EL VERBO DEBE PRECEDER AL TOPONIMO. En castellano el orden es
//     sujeto-verbo-objeto: "toma Bagdad" afirma, "Nicea anexiona" no dice nada
//     de Nicea. Se exige que el verbo este en los 20 caracteres ANTERIORES.
//  2. EL VERBO DEBE SER PALABRA ENTERA. "ocupa" casaba dentro de "Ocupacion",
//     que ademas era rusa y no de Viena.
//  3. UNA NEGACION EXPLICITA MANDA SOBRE TODO. "sigue siendo genovesa",
//     "es nominal", "rompe con", "frente a": el rotulo esta diciendo lo
//     contrario de lo que el verbo suelto sugeriria.
//
// Y para los anacronismos, una cuarta: un anio detras de HASTA es un TERMINO,
// no una fecha del tramo. "resisten hasta 1896" en una fase de 1400 describe
// el arco entero de la entidad; no es un anacronismo, es una prolepsis
// legitima. Los seis !A hacia adelante eran los seis de esta forma.
//
// Ademas se AGRUPA por (entidad, afirmacion). Un mismo rotulo repetido en
// quince tramos que parte.js corto es UN defecto, no quince; `mossi` sola
// aportaba quince avisos identicos.
//
// Afirman posesion: si el rotulo dice esto de una plaza, la geometria deberia
// contenerla.
const TIENE=[ 'toma','tomo','conquista','conquisto','ocupa','ocupo','entra en',
 'anexiona','anexiono','se hace con','capital en','con capital','capital',
 'gobierna','gobierno','domina','domino','desde','incorpora','incorporo',
 'recupera','recupero','reconquista','funda','fundo','establece','somete',
 'sometio','se instala en','corte en','reina en','reino en' ];
// Niegan posesion.
const NO_TIENE=[ 'pierde','perdio','perdida de','sin ','cede','cedio','entrega',
 'entrego','abandona','abandono','evacua','evacuo','se retira de','expulsado de',
 'expulsion de','renuncia a','deja de','ya no' ];
// Frases que niegan o neutralizan la mencion aunque haya un verbo cerca. Salen
// una a una de leer falsos positivos; la lista crece leyendo, no adivinando.
const NEUTRALIZA=[ 'sigue siendo','siguen siendo','es nominal','son nominales',
 'nominal','rompe con','rompio con','frente a','contra','tratados con',
 'tratado con','guerra con','guerras con','presion de','presiones de',
 'amenaza de','amenazas de','vasallo de','tributario de','en la orbita de',
 'orbita de','al servicio de','embajada a','embajadas a','mientras' ];

// Un verbo cuenta solo si esta ENTERO y DELANTE. `antes` es el texto que
// precede al toponimo dentro de la ventana de contexto.
// LA TRAMPA DEL PIXEL DE AGUA, otra vez. `byzantine` "Miguel VIII recupera
// Constantinopla", `ottoman` 1453 y `venice` 1204 salian los tres acusados de
// no pintar Constantinopla, y los tres eran el mismo pixel de agua del
// Bosforo: a 1:50 millones la ciudad cae en el estrecho. plazas.js ya resolvia
// esto buscando tierra alrededor; aqui se hacia la comprobacion y se escribia
// "(OJO: pixel de agua)" sin actuar, asi que el aviso salia igual. Ahora se
// sondea el punto de tierra mas cercano, como alli.
function tierraCerca(lon,lat){
 for(let r=0.05;r<=0.5;r+=0.05)
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
   if(!dx&&!dy)continue;
   const p=[+(lon+dx*r).toFixed(3),+(lat+dy*r).toFixed(3)];
   if(T.enTierra(p))return p;
  }
 return null;
}

// Cualificadores que convierten un toponimo en un accidente geografico: "los
// GRANDES Lagos" no es Lagos de Nigeria, "el ALTO Nilo" no es una plaza.
// `bunyoro domina los Grandes Lagos` y `descenso desde el alto Nilo` eran dos
// de los veintiseis avisos.
const CUALIFICA=['grandes','gran','alto','alta','bajo','baja','medio','media'];

function verboDelante(antes,lista,margen){
 const cola=antes.slice(-(margen||20));
 return lista.some(v=>new RegExp('(^|\\s)'+v.trim().replace(/\s+/g,'\\s+')+'(\\s|$)').test(cola));
}

function frasesCon(texto,plaza){
 // devuelve el trozo de texto alrededor de la mencion, para leer el verbo
 const t=normaliza(texto), p=normaliza(plaza);
 const i=t.indexOf(p);
 if(i<0)return null;
 return t.slice(Math.max(0,i-45), Math.min(t.length,i+p.length+20));
}

function quien(pt,anio){
 const out=[];
 for(const c of CIV){
  const p=c.periods.find(p=>p.start<=anio&&p.end>anio);
  if(!p)continue;
  if(L.has(p.rings,pt))out.push(c.id);
 }
 return out;
}

// ---------------------------------------------------------------------------
let nA=0,nT=0,nN=0,periodos=0,conRotulo=0;
const filas=[];

for(const c of CIV){
 for(const p of c.periods){
  periodos++;
  if(!p.name)continue;
  conRotulo++;
  const txt=p.name;

  // --- 1. anacronismos ---
  if(HAZ_ANIOS){
   // anios de 3 o 4 cifras, y los a.C. escritos como "-350" o "350 a.C."
   const cand=new Set();
   // En las fases anteriores a Cristo los rotulos escriben el anio sin marcar
   // la era -"Caida de Handan en 228", "los cinco reyes se reconocen en el 323"-
   // porque el contexto la da por sabida. Si el periodo entero es a.C., un anio
   // suelto se lee como negativo; si no, como positivo salvo marca explicita.
   const eraNeg = p.end<=0;
   for(const m of txt.matchAll(/(^|[\s(])(-?)(\d{3,4})\b/g)){
    let y=+m[3];
    const cola=txt.slice(m.index+m[0].length, m.index+m[0].length+12);
    // El patron de la era tiene que ser ESTRICTO. Con /a\.?\s?C\.?/i la
    // palabra "Aceh" contaba como marca y convertia 1629 en -1629; se exige el
    // punto tras la a y un limite de palabra delante.
    const marcado=/(^|[\s(])a\.\s?c\b|(^|[\s(])a\.\s?n\.\s?e\b/i.test(cola);
    // El signo solo cuenta si va precedido de espacio o parentesis: en un rango
    // como "1409-1435" el guion es un separador, no un signo, y sin esta guarda
    // 1435 se leia como -1435 y salia como anacronismo de 2.800 anios.
    if(m[2]==='-'||marcado||eraNeg) y=-y;
    cand.add(y);
   }
   // Un rotulo que enumera un rango que ABARCA el periodo esta describiendo el
   // arco entero de la entidad, no fechando este tramo: no es anacronismo.
   const rangos=[...txt.matchAll(/(\d{3,4})\s*[-–]\s*(\d{3,4})/g)]
     .map(m=>[+m[1],+m[2]].map(v=>eraNeg?-v:v)).map(([a,b])=>[Math.min(a,b),Math.max(a,b)]);
   const abarcado=y=>rangos.some(([a,b])=>y>=a&&y<=b&&a<=p.start&&b>=p.end);
   // Regla 4: un anio detras de HASTA (o de SOBREVIVE/DURA/RESISTE ... HASTA)
   // es el TERMINO del arco de la entidad, no la fecha de este tramo. Se busca
   // la palabra en el texto que precede a la cifra.
   const termino=y=>{
    const pat=new RegExp('hasta[^.;]{0,60}?'+Math.abs(y)+'\\b','i');
    return pat.test(txt);
   };
   for(const y of cand){
    // holgura: se admite citar un hecho dentro del periodo o cerca de sus bordes
    if(y>=p.start-UMBRAL_ANIO && y<=p.end+UMBRAL_ANIO)continue;
    if(abarcado(y))continue;
    if(termino(y))continue;
    const d = y<p.start ? p.start-y : y-p.end;
    nA++;
    // Hacia atras y hacia adelante NO valen lo mismo. Citar un hecho anterior
    // -"tras la paz de 1648" en una fase de 1700- es normal y casi siempre
    // legitimo; citar uno POSTERIOR al tramo es la forma sospechosa. Se separan
    // en dos marcas para que el numero que importa no se ahogue en el otro.
    filas.push({m: y<p.start?'!a':'!A', id:c.id, tramo:p.start+'..'+p.end,
      clave:'cita '+y,
      det:'cita '+y+', a '+d+' anios del periodo', txt});
   }
  }

  // --- 2. toponimos ---
  if(HAZ_TOPOS){
   const tn=normaliza(txt);
   for(const [nombre,pt] of GAZ){
    if(!tn.includes(nombre))continue;
    // se evita casar un nombre que es subcadena de otro mas largo del texto
    const re=new RegExp('(^| )'+nombre+'( |$)');
    if(!re.test(tn))continue;
    const ctx=frasesCon(txt,nombre); if(!ctx)continue;
    // "desde" es la palabra mas traicionera del castellano para esto. En "Aden
    // britanico desde 1839" es temporal y afirma posesion; en "primeras entradas
    // desde Quito" es direccional y no afirma nada. La diferencia esta en si va
    // DELANTE del toponimo: si lo precede, es origen y no cuenta.
    const antes = ctx.slice(0, ctx.indexOf(normaliza(nombre)));
    const desdeDireccional = /\bdesde\s*$/.test(antes);
    // Regla 3: una negacion o neutralizacion explicita en toda la ventana manda
    // sobre cualquier verbo suelto.
    if(NEUTRALIZA.some(f=>ctx.includes(f)))continue;
    // Cualificador geografico delante: no es la plaza, es el accidente.
    if(CUALIFICA.some(q=>new RegExp('\\b'+q+'\\s+$').test(antes)))continue;
    // Reglas 1 y 2: verbo entero y delante del toponimo.
    const afirma = verboDelante(antes, TIENE.filter(v=>v!=='desde')) ||
                   (!desdeDireccional && verboDelante(antes,['desde']));
    const niega  = verboDelante(antes, NO_TIENE, 30);
    if(!afirma && !niega)continue;      // mencion neutra: no se juzga
    if(afirma && niega)continue;         // ambiguo
    // Si el rotulo fecha el hecho DENTRO del periodo, la entidad tuvo la plaza
    // parte del tramo y pintarla -o no- es correcto: "Erekle pierde Tiflis en
    // 1795" en la fase 1747..1801 no es contradiccion, es un cambio a mitad de
    // fase. Solo se juzga cuando el hecho es anterior al comienzo del tramo.
    const anios=[...txt.matchAll(/\b(\d{3,4})\b/g)].map(m=>+m[1]);
    // El limite superior es <=p.end, no <p.end. Los cuatro !N que quedaban eran
    // los cuatro de esta forma: `kart` "cede Herat a Timur en 1381" en el tramo
    // 1370..1381, `toungoo` "Pegu cae en 1599" en 1584..1599. La perdida esta
    // fechada EN EL FINAL DEL TRAMO; pintar la plaza durante el tramo es
    // exactamente lo correcto, y acusarlo era acusar al mapa de acertar.
    const hechoDentro = anios.some(y=>y>p.start&&y<=p.end);
    if(hechoDentro)continue;
    const medio=Math.floor((p.start+p.end)/2);
    let sonda=pt, movida=false;
    // Pixel de agua: se sondea el punto de tierra mas cercano en vez de acusar.
    if(!T.enTierra(pt)){
     const alt=tierraCerca(pt[0],pt[1]);
     if(alt){ sonda=alt; movida=true }
    }
    const dentro = L.has(p.rings, sonda);
    if(afirma && !dentro){
     nT++;
     filas.push({m:'!T',id:c.id,tramo:p.start+'..'+p.end,
       det:'dice tener '+nombre+' y no lo pinta'+(movida?' (sondeado en tierra cercana)':'')
           +' | lo pinta: '+(quien(sonda,medio).join('+')||'nadie'), txt});
    }
    if(niega && dentro){
     // Una negacion sin fecha ANTERIOR al tramo no es adjudicable por la
     // geometria: `spanish` 1750..1763 "perdida de La Habana y Manila en la
     // Guerra de los Siete Anios" describe un episodio de 1762-63 dentro del
     // propio tramo, y el mapa pinta bien los trece anios menos el ultimo. Se
     // separa en !n informativo para no inflar la cuenta que importa.
     const fuerte = anios.some(y=>y<p.start);
     nN++;
     filas.push({m: fuerte?'!N':'!n', id:c.id, tramo:p.start+'..'+p.end,
       det:'dice NO tener '+nombre+' y lo pinta', txt});
    }
   }
  }
 }
}

// AGRUPACION. Un rotulo repetido en los quince tramos que parte.js corto es UN
// defecto. Se agrupa por (marca, entidad, afirmacion) y se muestra el arco que
// abarcan los tramos afectados y cuantos son.
const grupos=new Map();
for(const f of filas){
 const k=f.m+'|'+f.id+'|'+(f.clave||f.det.replace(/ \| lo pinta:.*/,''));
 const g=grupos.get(k);
 const [a,b]=f.tramo.split('..').map(Number);
 if(!g) grupos.set(k,{...f,a,b,n:1});
 else { g.n++; g.a=Math.min(g.a,a); g.b=Math.max(g.b,b) }
}
const G=[...grupos.values()].sort((x,y)=> x.m===y.m ? x.id.localeCompare(y.id) : x.m.localeCompare(y.m));
for(const f of G)
 console.log(f.m, f.id.padEnd(24), (f.a+'..'+f.b).padEnd(14),
   (f.n>1?'x'+f.n+' ':''), f.det, '\n', '   ', f.txt);

const cta=m=>G.filter(f=>f.m===m).length;
console.log('\nperiodos',periodos,'| con rotulo',conRotulo,'| gazetteer',GAZ.size,
 '\nAFIRMACIONES DISTINTAS (agrupadas):',
 '\n  !A anacronismo hacia ADELANTE (cita un anio posterior al tramo):',cta('!A'),
 '\n  !a cita hacia atras (informativo; casi siempre legitimo):        ',cta('!a'),
 '\n  !T dice tener una plaza y no la pinta:                           ',cta('!T'),
 '\n  !N dice NO tenerla (con fecha anterior al tramo) y la pinta:     ',cta('!N'),
 '\n  !n niega sin fecha anterior; no adjudicable por geometria:       ',cta('!n'),
 '\navisos sin agrupar (comparables con rondas anteriores):',nA,nT,nN);
