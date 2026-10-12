#!/usr/bin/env node
// MUESTRA CIEGA. Saca una lista de casos (lugar, anio) SIN decir lo que
// responde el mapa, para que la conteste una fuente externa.
//
// POR QUE. El 99,99% de precision de `plazas.js` no mide lo que parece. La red
// de 683 plazas-testigo la escribi yo: los lugares, los anios y, sobre todo,
// la respuesta esperada. Y de los 269 fallos de la ronda 56, 120 se resolvieron
// corrigiendo la expectativa en vez del mapa -cada uno con su razon escrita,
// pero la razon tambien la escribi yo-. **El mapa concuerda con mis creencias,
// y un error sistematico en mis creencias es invisible para las once
// comprobaciones del proyecto.** La unica referencia genuinamente externa que
// hay aqui es la linea de costa.
//
// Esto lo rompe: alguien de fuera responde sin ver el mapa, y despues se
// compara. Si el mapa acierta el 90% de una muestra que no ha visto, eso si es
// precision; el 99,99% actual solo dice que esta de acuerdo conmigo.
//
// TRES DECISIONES DE DISENO, Y LAS TRES SON PARA NO HACER TRAMPA.
//
// 1. LOS CASOS SE ELIGEN CON SEMILLA FIJA Y SE ESCRIBEN ANTES DE VER NINGUNA
//    RESPUESTA. Si eligiera despues, o los eligiera a ojo, escogeria sin
//    querer los que se que estan bien. La semilla queda en la cabecera del
//    fichero y el muestreo es reproducible.
// 2. SE SESGA HACIA DONDE MENOS SE. Europa tiene 0,81 testigos por entidad y
//    Africa 0,33; el mapa esta dibujado con 2,3 veces mas vertices por grado de
//    frontera en Europa que en Asia central. O sea que el numero global esta
//    dominado por la region que mejor conozco. La muestra invierte eso a
//    proposito: Africa, Asia central, Siberia, el interior americano y el
//    sudeste asiatico pesan mas de lo que les tocaria por superficie.
//    Se dejan unos pocos casos europeos como CONTROL: si tambien fallan, el
//    problema puede ser la fuente y no el mapa, y hay que saberlo.
// 3. NO SE REPITE UN (lugar, anio) QUE LA RED YA SONDEA. Si no, la muestra
//    estaria comprobando las respuestas que yo ya di, que es justo el circulo
//    que se quiere romper.
//
// Y una cosa que no es de diseno sino de honestidad: la casilla "no lo se"
// tiene que estar. Obligar a contestar convierte el desconocimiento en ruido y
// el ruido, al compararlo, se reparte a favor del mapa.
//
//   JSX=<mapa> node ciego.js <salida.md> [n] [semilla]
const fs=require('fs');
const L=require('./lib.js');
const T=require('./tierra.js');
const LISTA=require('./plazas_base.js');
// EL PAIS ACTUAL NO ES UNA PISTA, ES UN DESAMBIGUADOR. "Sinja" a secas no lo
// encuentra nadie; "Sinja (Nepal)" se busca en diez segundos. Sin esto la
// muestra se llenaria de "no lo se" que no significan que el mapa este bien
// sino que la pregunta estaba mal hecha. Y no filtra la respuesta: saber que
// Otrar esta hoy en Kazajistan no dice quien mandaba alli en el ano 800.
const topo=require('topojson-client');
const PAIS=(()=>{
 const raw=JSON.parse(require('fs').readFileSync(require.resolve('world-atlas/countries-50m.json'),'utf8'));
 const fc=topo.feature(raw,raw.objects.countries);
 return fc.features.map(f=>({n:f.properties.name,
  g:f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates}));
})();
function paisDe(lon,lat){
 let mejor=null,dmin=Infinity;
 for(const c of PAIS)for(const poly of c.g){
  const r=poly[0]; let dentro=false;
  for(let i=0,j=r.length-1;i<r.length;j=i++){
   if((r[i][1]>lat)!==(r[j][1]>lat) &&
      lon<(r[j][0]-r[i][0])*(lat-r[i][1])/(r[j][1]-r[i][1])+r[i][0])dentro=!dentro }
  if(dentro)return c.n;
  for(const q of r){ const d=Math.hypot(q[0]-lon,q[1]-lat); if(d<dmin){dmin=d;mejor=c.n} }
 }
 return dmin<3?mejor:null;
}
const {CIV}=L.load(process.env.JSX);
const N=+(process.argv[3]||50);
const SEMILLA=+(process.argv[4]||20260917);
const SALIDA=process.argv[2]||'/tmp/muestra_ciega.md';

// generador reproducible
let s=SEMILLA>>>0;
const rnd=()=>{ s^=s<<13; s>>>=0; s^=s>>17; s^=s<<5; s>>>=0; return s/4294967296 };

const zona=(lon,lat)=>lon<-30?(lat>12?'America del Norte':'America del Sur')
 :lon<40?(lat>36?'Europa':(lat>12?'Mediterraneo y Oriente Proximo':'Africa'))
 :lon<75?(lat>40?'Asia central':'Oriente Medio')
 :lon<105?(lat>40?'Siberia':'Asia meridional')
 :(lat>40?'Asia nororiental':'Asia oriental y Oceania');

// cuota por zona: se invierte la densidad de testigos por entidad
const CUOTA={
 'Africa':9, 'Asia central':6, 'Siberia':4, 'America del Norte':6,
 'Asia meridional':7, 'Oriente Medio':5, 'Asia oriental y Oceania':5,
 'America del Sur':3, 'Asia nororiental':2,
 'Europa':2, 'Mediterraneo y Oriente Proximo':1,     // control
};
const ANIOS=[-500,1,300,600,800,1000,1200,1300,1400,1500,1600,1700,1800,1880,1950];

// un caso solo vale si en ese anio hay ALGUIEN vivo a menos de 6 grados: si no,
// la pregunta no tiene respuesta posible y solo genera "no lo se".
const bbDe=rs=>rs.reduce((a,r)=>{const b=L.bb(r);
 return [Math.min(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.max(a[3],b[3])]},[9e9,-9e9,9e9,-9e9]);
const VIVOS={};
for(const A of ANIOS){ const v=[];
 for(const c of CIV){ const p=c.periods.find(p=>p.start<=A&&p.end>A);
  if(p&&p.rings.length)v.push({b:bbDe(p.rings)}) }
 VIVOS[A]=v; }
const hayAlguienCerca=(lon,lat,A)=>VIVOS[A].some(o=>lon>=o.b[0]-6&&lon<=o.b[1]+6&&lat>=o.b[2]-6&&lat<=o.b[3]+6);

// candidatos: (plaza, anio) que la red NO sondea ya
const porZona={};
for(const p of LISTA){
 if(!T.enTierra([p.lon,p.lat]))continue;
 const z=zona(p.lon,p.lat);
 const ya=new Set((p.anios||[]).map(Number));
 for(const A of ANIOS){
  if(ya.has(A))continue;
  if(!hayAlguienCerca(p.lon,p.lat,A))continue;
  (porZona[z]=porZona[z]||[]).push({nombre:p.nombre,lon:p.lon,lat:p.lat,anio:A});
 }
}
// barajado reproducible
for(const z in porZona){ const a=porZona[z];
 for(let i=a.length-1;i>0;i--){ const j=(rnd()*(i+1))|0; const t=a[i];a[i]=a[j];a[j]=t } }

const casos=[];
for(const [z,cuota] of Object.entries(CUOTA)){
 const a=porZona[z]||[]; const vistos=new Set(); let n=0;
 for(const c of a){ if(n>=cuota)break;
  if(vistos.has(c.nombre))continue;        // una plaza, un caso: no concentrar
  vistos.add(c.nombre); casos.push({...c,zona:z}); n++ }
 if(n<cuota)console.log('   (solo '+n+' casos disponibles en '+z+', pedidos '+cuota+')');
}
while(casos.length>N)casos.splice((rnd()*casos.length)|0,1);
// orden final aleatorio, para que ni el orden insinue la zona
for(let i=casos.length-1;i>0;i--){ const j=(rnd()*(i+1))|0; const t=casos[i];casos[i]=casos[j];casos[j]=t }

const anioTxt=a=>a<0?Math.abs(a)+' a.C.':a+' d.C.';
let md='# Muestra ciega — BlueDot\n\n';
md+='Semilla `'+SEMILLA+'`, '+casos.length+' casos, elegidos antes de mirar ninguna respuesta.\n\n';
md+='La pregunta es siempre la misma: **en ese año, ¿qué poder mandaba en ese lugar?**\n\n';
md+='Reglas para que la comparación sirva de algo:\n\n';
md+='- Responde con el nombre que te dé la fuente, en cualquier idioma. No hace falta que coincida con ninguna nomenclatura mía.\n';
md+='- Si el lugar estaba fuera de cualquier estado —territorio de pueblos sin organización estatal, tierra de nadie, despoblado—, escríbelo así: «ningún estado», «pueblos X», «deshabitado». **Eso es una respuesta válida y me interesa tanto como las demás.**\n';
md+='- Si no lo encuentras o la fuente no se moja, marca «no lo sé» y sigue. Es mejor que adivinar: una respuesta inventada, al compararla, tiende a darme la razón.\n';
md+='- Apunta la fuente aunque sea de pasada («wiki es», «atlas tal», «un mapa que salió al buscar»). Si el mapa y tú discrepáis, lo primero que miraré es de dónde viene cada uno.\n';
md+='- Las coordenadas están para desambiguar topónimos repetidos, no para que midas nada.\n\n';
md+='---\n\n';
casos.forEach((c,i)=>{
 const pa=paisDe(c.lon,c.lat);
 md+='### '+(i+1)+'. '+c.nombre+(pa?', '+pa:'')+' — '+anioTxt(c.anio)+'\n\n';
 md+='`'+c.lat.toFixed(2)+', '+c.lon.toFixed(2)+'`\n\n';
 md+='- **Quién mandaba:** \n';
 md+='- **Fuente:** \n';
 md+='- **Seguridad:** alta / media / no lo sé\n\n';
});
fs.writeFileSync(SALIDA,md);
// El fichero de casos se guarda aparte para poder comparar despues sin que la
// lista pueda cambiar: si los casos se pudieran reelegir a posteriori, la
// muestra dejaria de ser ciega por el otro lado.
fs.writeFileSync(SALIDA.replace(/\.md$/,'')+'_casos.json',JSON.stringify({semilla:SEMILLA,casos},null,1));
console.log(SALIDA+'  '+casos.length+' casos');
const cuenta={}; for(const c of casos)cuenta[c.zona]=(cuenta[c.zona]||0)+1;
console.log(Object.entries(cuenta).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+v).join(' | '));
