#!/usr/bin/env node
// Borra periodos INTERIORES de una entidad, dejando un hueco temporal en medio
// de su arco.
//   module.exports = { id: [ [ini, fin, 'motivo'], ... ] }
//
// Por que hacia falta. Hasta ahora habia tres formas de quitar tiempo a una
// entidad y ninguna servia para el caso mas comun:
//   arco.js  mueve el principio y el final, nunca el medio.
//   poda.js  conserva un rango y borra lo de fuera: tambien extremos.
//   resta_civ.js con BORRA_CONTENIDOS=1 borra un periodo solo si otra entidad
//            lo cubre ENTERO, y solo si esa otra entidad ya existe y ya lo pinta.
// El caso que se repite ronda tras ronda es otro: una entidad que el mapa hace
// durar de corrido a traves de un interregno documentado -Nanzhao entre 902 y
// 937, los tres estados que median antes de Dali; Checoslovaquia entre 1938 y
// 1945- y hay que abrirle el hueco ANTES de que exista quien lo ocupe, o a la
// vez. Con las tres herramientas de arriba eso no se podia hacer.
//
// Se borra solo lo que queda ENTERAMENTE dentro de [ini,fin]. Los periodos que
// cruzan un borde se parten primero, para no borrar de mas por descuido: si un
// periodo va de 738 a 1050 y se pide borrar 902..937, quedan 738..902 y
// 937..1050, con la misma geometria, y desaparece el de en medio.
//
// SALVAGUARDA: nunca deja una entidad sin periodos. Vaciar una entidad entera
// es una decision de modelo -si de verdad no debe existir, se retira de la
// lista-, no un efecto colateral de un borrado. Si el rango se lo comeria todo,
// avisa y no toca nada.
const L=require('./lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const OPS=require(process.argv[2]);

function parteEn(c,y){
 const p=c.periods.find(p=>p.start<y&&p.end>y); if(!p)return false;
 const n={start:y,end:p.end,rings:p.rings.map(r=>r.map(q=>q.slice()))};
 if(p.name)n.name=p.name; if(p.wikiTitle)n.wikiTitle=p.wikiTitle;
 p.end=y;c.periods.push(n);c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
 return true;
}

let borrados=0,ent=0;
for(const [id,ops] of Object.entries(OPS)){
 const c=CIV.find(x=>x.id===id);
 if(!c){console.log('?? no existe',id);continue}
 let n=0;
 for(const [ini,fin,motivo] of ops){
  parteEn(c,ini); parteEn(c,fin);
  const quedan=c.periods.filter(p=>!(p.start>=ini&&p.end<=fin));
  const van=c.periods.length-quedan.length;
  if(!quedan.length){
   console.log('!!',id,ini+'..'+fin,'borraria la entidad entera: no se toca');
   continue;}
  if(!van){console.log('..',id,ini+'..'+fin,'no habia ningun periodo dentro');continue}
  c.periods=quedan; n+=van; borrados+=van;
  console.log(id.padEnd(24),(ini+'..'+fin).padEnd(14),'periodos borrados',String(van).padStart(2),'  ',motivo||'');
 }
 if(n)ent++;
}
console.log('entidades tocadas:',ent,'| periodos borrados:',borrados);
L.save(src,BLK,CIV,process.env.JSX);
