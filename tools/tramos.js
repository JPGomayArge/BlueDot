#!/usr/bin/env node
// COPIAR UN TRAMO DE UNA ENTIDAD SOBRE OTRO TRAMO DE LA MISMA.
//
// La radiografia encuentra tramos en los que una entidad desaparece o se
// encoge un anio porque un vecino se la comio por error (Sokoto en 1898 bajo
// los britanicos un anio antes de tiempo, Butan dos anios dentro de los Qing,
// los dakota veinte anios bajo la Luisiana espanola). El arreglo es siempre el
// mismo: el tramo malo recupera los anillos del tramo bueno de al lado, y
// luego resuelve_dobles.js, con la tabla, quita ese suelo al vecino.
//
//   JSX=<mapa> node tramos.js tabla.js --aplica
//   tabla: [{id, de:[start,end], a:[start,end]}]   el tramo `a` toma los
//   anillos del periodo que empieza en de[0]; los periodos que ya cubrian `a`
//   se recortan o se eliminan; nombre y wikiTitle se heredan del periodo que
//   cubria `a` si lo habia, si no del de origen.
const L=require('./lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const args=process.argv.slice(2); const APLICA=args.includes('--aplica');
const OPS=require(require('path').resolve(args.find(a=>a.endsWith('.js'))));
const copia=p=>{ const n={start:p.start,end:p.end,rings:p.rings.map(r=>r.map(q=>q.slice()))}; if(p.name)n.name=p.name; if(p.wikiTitle)n.wikiTitle=p.wikiTitle; if(p.inc)n.inc=1; return n };
for(const op of OPS){
 const c=CIV.find(c=>c.id===op.id); if(!c){console.log('no existe '+op.id);continue}
 const origen=c.periods.find(p=>p.start===op.de[0]&&(op.de[1]==null||p.end===op.de[1]));
 if(!origen){console.log(op.id+': no hay periodo '+op.de.join('..'));continue}
 const [a,b]=op.a;
 // idempotente: si el tramo ya lleva exactamente esos anillos, no se repite
 // (repetirlo despues de resuelve_dobles deshace lo que este resto)
 const ya=c.periods.filter(p=>p.start<b&&p.end>a);
 const mismo=rs=>JSON.stringify(rs)===JSON.stringify(origen.rings);
 if(ya.length&&ya.every(p=>p.start>=a&&p.end<=b&&mismo(p.rings))&&ya[0].start===a&&ya[ya.length-1].end===b){ console.log(op.id+': '+a+'..'+b+' ya estaba'); continue }
 if(op.anillos){
  // modo anillos: los periodos que ya existen en el tramo conservan nombre y
  // fechas y solo cambian de anillos; los huecos entre ellos se rellenan con
  // periodos nuevos. Para cuando una entidad tiene su cronologia bien y su
  // geometria rota (Bunyoro con 0,2 g2 entre 1850 y 1894).
  const salida=[]; let cursor=a; let n=0;
  for(const p of c.periods.slice().sort((x,y)=>x.start-y.start)){
   if(p.end<=a||p.start>=b){salida.push(p);continue}
   if(p.start<a){ const q=copia(p); q.end=a; salida.push(q) }
   if(p.end>b){ const q=copia(p); q.start=b; salida.push(q) }
   const s0=Math.max(p.start,a), s1=Math.min(p.end,b);
   if(s0>cursor){ const h=copia(origen); h.start=cursor; h.end=s0; delete h.name; delete h.wikiTitle; salida.push(h); n++ }
   const q=copia(p); q.start=s0; q.end=s1; q.rings=origen.rings.map(r=>r.map(v=>v.slice())); salida.push(q); n++; cursor=s1 }
  if(cursor<b){ const h=copia(origen); h.start=cursor; h.end=b; delete h.name; delete h.wikiTitle; salida.push(h); n++ }
  salida.sort((x,y)=>x.start-y.start||x.end-y.end); const antes=c.periods.length; c.periods=salida;
  console.log(op.id+': '+a+'..'+b+' ('+n+' periodos) toman los anillos de '+origen.start+'..'+origen.end+' ('+origen.rings.reduce((s,r)=>s+L.rA(r),0).toFixed(1)+' g2)   periodos '+antes+' -> '+salida.length);
  continue }
 const cubria=c.periods.find(p=>p.start<b&&p.end>a);
 const nuevo=copia(origen); nuevo.start=a; nuevo.end=b;
 if(cubria){ if(cubria.name)nuevo.name=cubria.name; else delete nuevo.name; if(cubria.wikiTitle)nuevo.wikiTitle=cubria.wikiTitle; else delete nuevo.wikiTitle }
 const salida=[];
 for(const p of c.periods){
  if(p.end<=a||p.start>=b){salida.push(p);continue}
  if(p.start<a){ const q=copia(p); q.end=a; salida.push(q) }
  if(p.end>b){ const q=copia(p); q.start=b; salida.push(q) } }
 salida.push(nuevo); salida.sort((x,y)=>x.start-y.start||x.end-y.end);
 const antes=c.periods.length; c.periods=salida;
 console.log(op.id+': '+a+'..'+b+' toma '+origen.rings.length+' anillos ('+origen.rings.reduce((s,r)=>s+L.rA(r),0).toFixed(1)+' g2) de '+origen.start+'..'+origen.end+'   periodos '+antes+' -> '+salida.length);
}
if(APLICA){ L.save(src,BLK,CIV,process.env.JSX); console.log('escrito '+process.env.JSX) } else console.log('(sin --aplica no se escribe)');
