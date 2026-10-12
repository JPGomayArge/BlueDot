#!/usr/bin/env node
// HACER CUMPLIR EL REGISTRO DE VACIO: quitarle a las areas culturales el suelo
// que `vacios.js` declara deshabitado.
//
// La cabecera de `vacios.js` lleva rondas diciendolo con todas las letras:
//
//   "Un AREA CULTURAL no debe pintar aqui: representa donde vivia una
//    poblacion, y no vivia ninguna. Un ESTADO MODERNO si puede pintar aqui: el
//    territorio de Arabia Saudi incluye su desierto deshabitado."
//
// Y nunca se habia hecho cumplir. El registro solo servia para que las METRICAS
// no contaran esos huecos como trabajo pendiente; **ninguna herramienta quitaba
// la pintura del mapa**. Medido sobre el mapa entregado, en celdas de medio
// grado que el registro declara deshabitadas:
//
//   anio     celdas vacias   pintadas por un sustrato
//   -2000        3.796           2.516   (66%)
//    1500        3.380           2.476   (73%)
//    1800        3.370           2.282   (68%)
//
// O sea que dos de cada tres celdas de hielo, erg y archipielago sin poblar
// tenian encima un area cultural. La teselacion forzaba a rellenar y el registro
// no tenia manos para impedirlo.
//
// LA REGLA, Y LO QUE NO HACE. Solo se le quita a `kind:'cultura'`. A un estado
// no se le toca: un estado gobierna tambien sus vacios, y el Rub al-Jali es
// territorio saudi aunque no viva nadie. La distincion no es un detalle de
// implementacion: es la diferencia entre "donde vivia gente" y "quien mandaba",
// que son las dos preguntas que este mapa mezcla con mas facilidad.
//
// LOS PERIODOS SE PARTEN. Un tramo de vacio casi nunca coincide con los limites
// de los periodos del sustrato: las Malvinas se vacian en 1770 y el periodo de
// su area cultural va de 1600 a 1800. Partir es obligatorio; no partir seria
// vaciar tambien los siglos en que si habia gente, que es el error simetrico y
// igual de malo.
//
//   JSX=<mapa> node despuebla.js [--aplica]   SALIDA=<ruta>
const pc=require('polygon-clipping');
const L=require('./lib.js'); const R=require('./recorte.js');
const V=require('./vacios.js');
const {malo}=require('./auto_int_lib.js');
const doc=L.load(process.env.JSX); const CIV=doc.CIV;
const APLICA=process.argv.includes('--aplica');

function parteEn(c,y){
 const p=c.periods.find(p=>p.start<y&&p.end>y); if(!p)return;
 const n={start:y,end:p.end,rings:p.rings.map(r=>r.map(q=>q.slice()))};
 if(p.name)n.name=p.name; if(p.wikiTitle)n.wikiTitle=p.wikiTitle;
 p.end=y; c.periods.push(n); c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
}
const cajaPoly=c=>[[[c[0],c[2]],[c[1],c[2]],[c[1],c[3]],[c[0],c[3]],[c[0],c[2]]]];
// LA PIEZA QUE SE RESTA ES LA CAJA MENOS SUS EXCEPCIONES. La primera version
// restaba `e.caja` entera e ignoraba `salvo`, asi que **Bilma se quedaba sin
// poblacion aunque el registro la excluyera explicitamente**: el registro decia
// una cosa y quien lo hacia cumplir hacia otra. Una regla y su ejecutor tienen
// que leer el mismo dato.
function piezaDe(e){
 let g=[cajaPoly(e.caja)];
 if(e.salvo&&e.salvo.length){
  try{ g=pc.difference(g,e.salvo.map(c=>cajaPoly(c))) }catch(err){ return null }
 }
 return g&&g.length?g:null;
}

const SUSTRATOS=CIV.filter(c=>c.kind==='cultura');
console.log('areas culturales: '+SUSTRATOS.length+' de '+CIV.length);
console.log('entrada del registro              entidad                  quita');
let total=0, n=0, nuevos=0;
for(const e of V.TODO){
 const tramos=V.vacios(e);
 if(!tramos.length)continue;
 const cp=piezaDe(e);
 if(!cp){console.log('   ?? no se pudo construir la pieza de '+e.nombre);continue}
 for(const c of SUSTRATOS){
  // caja de la entidad, para descartar rapido
  let bE=[9e9,-9e9,9e9,-9e9];
  for(const p of c.periods)for(const r of p.rings){const b=L.bb(r);
   bE=[Math.min(bE[0],b[0]),Math.max(bE[1],b[1]),Math.min(bE[2],b[2]),Math.max(bE[3],b[3])]}
  if(bE[1]<e.caja[0]||bE[0]>e.caja[1]||bE[3]<e.caja[2]||bE[2]>e.caja[3])continue;
  let quita=0;
  for(const [a,b] of tramos){
   // partir el periodo en los dos extremos del tramo de vacio
   const antes=c.periods.length;
   if(a>-10000)parteEn(c,a);
   if(b<=2025)parteEn(c,b);
   nuevos+=c.periods.length-antes;
   for(const p of c.periods){
    if(p.end<=a||p.start>=b)continue;
    const dentro=p.rings.filter(r=>{const bb=L.bb(r);
     return !(bb[1]<e.caja[0]||bb[0]>e.caja[1]||bb[3]<e.caja[2]||bb[2]>e.caja[3])});
    if(!dentro.length)continue;
    const a0=p.rings.reduce((s,r)=>s+Math.abs(L.rA(r)),0);
    let d=null;
    try{ d=pc.difference(p.rings.map(r=>[r.concat([r[0]])]),cp) }catch(err){ d=null }
    // UN FALLO DE RESTA NO PUEDE PASAR POR EXITO: si revienta se deja el
    // periodo como esta. Un sustrato que sigue pintando un erg es un defecto
    // conocido; un sustrato borrado por un error de la libreria es una perdida.
    if(!d){ console.log('   ?? resta fallida: '+c.id+' '+p.start+'..'+p.end+' en '+e.nombre); continue }
    const fin=R.limpia(d,3e-4).filter(x=>!malo(x));
    const a1=fin.reduce((s,r)=>s+Math.abs(L.rA(r)),0);
    if(a1>a0+1e-6){ console.log('   ?? la resta agranda: '+c.id+' '+p.start); continue }
    quita+=a0-a1;
    if(APLICA)p.rings=fin;
   }
  }
  if(quita>0.05){
   total+=quita; n++;
   console.log(String(e.nombre).slice(0,32).padEnd(34)+c.id.padEnd(24)+quita.toFixed(1).padStart(8));
  }
 }
}
console.log('\n'+n+' pares (registro x sustrato), '+total.toFixed(0)+
 ' grados cuadrados retirados, '+nuevos+' periodos nuevos por particion');
if(APLICA){ const s=process.env.SALIDA||process.env.JSX;
 // los periodos que se quedan sin anillos se borran: un periodo vacio es un
 // fallo de estructura, no un vacio legitimo
 let vaciados=0;
 for(const c of CIV){ const q=c.periods.filter(p=>p.rings.length);
  vaciados+=c.periods.length-q.length; if(q.length!==c.periods.length)c.periods=q }
 if(vaciados)console.log('periodos que quedaron sin anillos y se retiran: '+vaciados);
 L.save(doc.src,doc.R,doc.CIV,s); console.log('aplicado -> '+s);
} else console.log('(informe. --aplica para escribir)');
