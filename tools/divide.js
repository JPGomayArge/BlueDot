#!/usr/bin/env node
// Parte una entidad en varias, repartiendo sus periodos por tramos de años.
// Sirve para los casos en que un mismo identificador estaba fusionando estados
// distintos: "Corea" cubriendo Silla, Goryeo, Joseon y Corea del Sur, o
// "Grecia" cubriendo las polis y el reino de 1830.
//
//   module.exports = { id_original: {
//     conservar: [ini, fin],                 // tramo que se queda el original
//     nuevas: [ { id, name, color, wikiTitle?, kind?, desde, hasta, nombre? } ]
//   } }
//
// Los periodos se MUEVEN con su geometria intacta: no se redibuja nada, asi
// que no puede aparecer ni un hueco ni un solape nuevo.
const L=require('./lib.js');const {src,CIV,R}=L.load(process.env.JSX);
const OPS=require(process.argv[2]);
for(const [id,plan] of Object.entries(OPS)){
 const c=CIV.find(x=>x.id===id);
 if(!c){console.log('?? no existe',id);continue}
 const todos=[...c.periods].sort((a,b)=>a.start-b.start||a.end-b.end);
 const antes=todos.length;
 for(const def of plan.nuevas){
  if(CIV.find(x=>x.id===def.id)){console.log('!! ya existe',def.id);continue}
  const mios=todos.filter(p=>p.start>=def.desde&&p.end<=def.hasta);
  if(!mios.length){console.log('!! ningun periodo entre',def.desde,'y',def.hasta,'para',def.id);continue}
  const nueva={id:def.id,name:def.name,color:def.color,
   periods:mios.map(p=>({...p,rings:p.rings.map(r=>r.map(q=>q.slice())),
     name:def.nombre||p.name, wikiTitle:def.wikiTitle||p.wikiTitle}))};
  if(def.kind)nueva.kind=def.kind;
  if(def.wikiTitle)nueva.wikiTitle=def.wikiTitle;
  CIV.push(nueva);
  console.log('  '+def.id.padEnd(18)+mios.length+' periodos  '+
   Math.min(...mios.map(p=>p.start))+'..'+Math.max(...mios.map(p=>p.end)));
 }
 const [a,b]=plan.conservar;
 c.periods=todos.filter(p=>p.start>=a&&p.end<=b);
 if(plan.name)c.name=plan.name;
 if(plan.wikiTitle)c.wikiTitle=plan.wikiTitle;
 console.log('  '+id.padEnd(18)+antes+' -> '+c.periods.length+' periodos  '+
  (c.periods.length?c.periods[0].start+'..'+c.periods[c.periods.length-1].end:'VACIA'));
 if(!c.periods.length)console.log('  !! ATENCION: '+id+' se ha quedado sin periodos');
}
for(const c of CIV)c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
L.save(src,R,CIV,process.env.JSX);
