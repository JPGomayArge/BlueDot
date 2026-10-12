#!/usr/bin/env node
// Repara rotulos estirados por haber aplicado nombres.js SIN la variable
// PARCIAL. Se escribio en la ronda 18 para deshacer un destrozo de la 17.
//
// QUE PASO. nombres.js tiene dos modos. Con PARCIAL=1 la tabla son correcciones
// sueltas: solo se renombra el periodo cuyo punto medio cae dentro de un tramo
// listado. SIN PARCIAL la tabla se entiende como una PARTICION COMPLETA del
// arco, asi que el primer tramo se estira hacia atras hasta el inicio de la
// entidad y el ultimo hacia delante hasta el final. El encargo de la ronda 17
// describia a los agentes el modo PARCIAL, ellos escribieron tablas sueltas...
// y yo las aplique sin poner la variable. Resultado: `makuria` con el rotulo
// "Turan-Shah toma Qasr Ibrim en 1173" en su fase 543..650, `maya` con
// "Mayapan somete Yucatan" en -2000..-1800, `khazar` con "Oleg toma Kiev en
// 882" en 650..750. Anacronismos creados por la aplicacion, no por los
// informes.
//
// COMO SE REPARA. Se toman los rotulos de una copia ANTERIOR al destrozo y se
// devuelven a los periodos actuales. No se casan por (start,end) porque desde
// entonces los periodos se han partido y fundido: se casa por PUNTO MEDIO, que
// sobrevive a las particiones. Un periodo actual toma el nombre del periodo
// antiguo que contiene su punto medio.
//
//   JSX=<mapa> node repara_nombres.js <copia_buena.jsx> <lista_de_ids.json>
//
// Despues hay que volver a aplicar la tabla de rotulos legitima, esta vez con
// PARCIAL=1, para que las correcciones de verdad se conserven.
const L=require('./lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);

const rutaVieja=process.argv[2];
const VIEJO=L.load(rutaVieja).CIV;
const IDS=process.argv[3]?require(process.argv[3]):null;   // sin lista: todas

let ent=0,puestos=0,igual=0,sinFuente=0;
for(const c of CIV){
 if(IDS&&!IDS.includes(c.id))continue;
 const v=VIEJO.find(x=>x.id===c.id);
 if(!v){sinFuente++;continue}
 let n=0;
 for(const p of c.periods){
  const m=(p.start+p.end)/2;
  const q=v.periods.find(o=>o.start<=m&&o.end>=m);
  if(!q||!q.name)continue;
  if(p.name===q.name){igual++;continue}
  p.name=q.name; n++; puestos++;
 }
 if(n){ent++;console.log(c.id.padEnd(24),'rotulos devueltos',String(n).padStart(3))}
}
console.log('entidades tocadas:',ent,'| rotulos devueltos:',puestos,
            '| ya coincidian:',igual,'| sin fuente en la copia:',sinFuente);
L.save(src,BLK,CIV,process.env.JSX);
