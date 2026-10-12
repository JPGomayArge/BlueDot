#!/usr/bin/env node
// DONDE DOS PINTAN, UNO SOBRA.
//
// El mapa no admite una celda con dos duenos. La radiografia encontro
// cuarenta y tres pares que la tienen, desde los 117 grados2 de Australia
// entre 1901 y 1930 (el sustrato aborigen no se resto de los dominios
// britanicos, solo del imperio) hasta medio grado de Samoyedos bajo Rusia.
//
// Esta herramienta busca TODOS los solapes entre periodos vivos a la vez de
// entidades distintas -en poligonos, no en celdas- y los resuelve:
//
//   REGLA AUTOMATICA  si uno es area cultural y el otro estado, cede el area
//                     cultural (la regla del sustrato).
//   TABLA             estado-estado y cultura-cultura se deciden a mano, en
//                     dobles_tabla.js: {cede, a, desde?, hasta?}. Sin entrada,
//                     el solape se lista y no se toca.
//
// La resta respeta el tramo: si el periodo del que cede dura mas que el del
// que gana, se parte en la frontera y solo se resta en el tramo comun. Un
// periodo que se queda sin anillos se elimina (todo su suelo era del otro).
//
//   JSX=<mapa> PARES=radiografia.json node resuelve_dobles.js [tabla.js] [--aplica] [--min 0.05]
//
// PARES acota la busqueda a los pares que la radiografia vio solapados: probar
// los 720.000 pares de entidades con poligonos enteros se comio 2,7 GB y el
// sistema mato el proceso. La radiografia a medio grado ve cualquier solape de
// un cuarto de grado2; lo que queda por debajo no se ve en el globo.
const fs=require('fs'); const pc=require('polygon-clipping');
const L=require('./lib.js'); const R=require('./recorte.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const args=process.argv.slice(2);
const APLICA=args.includes('--aplica');
const MIN=args.includes('--min')?+args[args.indexOf('--min')+1]:0.05;
const tablaRuta=args.find(a=>a.endsWith('.js'));
const TABLA=tablaRuta?require(require('path').resolve(tablaRuta)):[];
const porId={}; for(const c of CIV)porId[c.id]=c;
const caja=c=>L.caja(c);
const cruzaC=(a,b)=>!(a[1]<b[0]||a[0]>b[1]||a[3]<b[2]||a[2]>b[3]);
const areaDe=mp=>{let a=0;for(const poly of mp||[])a+=L.rA(poly[0]);return a};
// polygon-clipping se atraganta con lados identicos ("Unable to complete output
// ring"), que es justo lo que hay cuando dos anillos salieron de la misma
// resta. Se reintenta con el segundo operando desplazado una millonesima.
const mueve=(mp,d)=>mp.map(poly=>poly.map(r=>r.map(q=>[q[0]+d,q[1]+d])));
function seguro(op,a,b){
 for(const d of [0,1e-6,-1e-6,3e-6,-3e-6]){ try{ return pc[op](a,d?mueve(b,d):b) }catch(e){} }
 throw new Error('polygon-clipping no pudo: '+op);
}

// 1. encontrar los solapes --------------------------------------------------------
const cajas=CIV.map(caja);
let candidatos=null;
if(process.env.PARES){ candidatos=new Set(); const rad=JSON.parse(fs.readFileSync(process.env.PARES,'utf8'));
 for(const [k] of rad.dobles){ const [x,y]=k.split(' | '); candidatos.add(x<y?x+'|'+y:y+'|'+x) }
 console.log('pares candidatos (de la radiografia): '+candidatos.size) }
const solapes=[]; let fallosMedida=0; // {a,b,pa,pb,area}
for(let i=0;i<CIV.length;i++)for(let j=i+1;j<CIV.length;j++){
 if(!cruzaC(cajas[i],cajas[j]))continue;
 const A=CIV[i],B=CIV[j];
 if(candidatos&&!candidatos.has(A.id<B.id?A.id+'|'+B.id:B.id+'|'+A.id))continue;
 for(const pa of A.periods){ if(!pa.rings.length)continue; const ba=pa.rings.map(L.bb);
  for(const pb of B.periods){ if(!pb.rings.length)continue;
   if(pb.start>=pa.end||pb.end<=pa.start)continue;
   const bb=pb.rings.map(L.bb);
   if(!ba.some(x=>bb.some(y=>cruzaC(x,y))))continue;
   // anillo a anillo, solo los que se cruzan de caja: mucho menos memoria
   let ar=0;
   for(let x=0;x<pa.rings.length;x++)for(let y=0;y<pb.rings.length;y++){ if(!cruzaC(ba[x],bb[y]))continue;
    let r; try{ r=seguro('intersection',[[pa.rings[x]]],[[pb.rings[y]]]) }catch(e){ fallosMedida++; continue } ar+=areaDe(r) }
   if(ar<MIN)continue;
   solapes.push({a:A,b:B,pa,pb,area:ar}) } } }
console.log('solapes de mas de '+MIN+' g2: '+solapes.length+(fallosMedida?'   (anillos que no se pudieron medir: '+fallosMedida+')':''));

// 2. decidir quien cede ------------------------------------------------------------
// TABLAS=a.js,b.js: entre dos areas culturales que esten en las tablas de
// ambitos, cede la que va despues (la misma regla de orden con la que se
// rehicieron), sin tener que escribir cada par en dobles_tabla.js.
const rangoTabla=new Map();
if(process.env.TABLAS){ let n=0; for(const t of process.env.TABLAS.split(',')){ for(const e of require(require('path').resolve(t))){ if(!rangoTabla.has(e.id))rangoTabla.set(e.id,n++) } } }
function decide(s){
 const ini=Math.max(s.pa.start,s.pb.start), fin=Math.min(s.pa.end,s.pb.end);
 for(const t of TABLA){
  if(t.desde!=null&&fin<=t.desde)continue; if(t.hasta!=null&&ini>=t.hasta)continue;
  if(t.cede===s.a.id&&t.a===s.b.id)return {cede:s.a,gana:s.b,por:'tabla'};
  if(t.cede===s.b.id&&t.a===s.a.id)return {cede:s.b,gana:s.a,por:'tabla'} }
 const ka=s.a.kind==='cultura', kb=s.b.kind==='cultura';
 if(ka&&!kb)return {cede:s.a,gana:s.b,por:'sustrato'};
 if(kb&&!ka)return {cede:s.b,gana:s.a,por:'sustrato'};
 if(ka&&kb&&rangoTabla.has(s.a.id)&&rangoTabla.has(s.b.id))
  return rangoTabla.get(s.a.id)<rangoTabla.get(s.b.id)?{cede:s.b,gana:s.a,por:'orden de tabla'}:{cede:s.a,gana:s.b,por:'orden de tabla'};
 return null;
}
const porPar=new Map();
for(const s of solapes){ const d=decide(s); const k=s.a.id+' | '+s.b.id;
 const e=porPar.get(k)||{area:0,n:0,desde:1e9,hasta:-1e9,d:null}; e.area+=s.area; e.n++;
 e.desde=Math.min(e.desde,Math.max(s.pa.start,s.pb.start)); e.hasta=Math.max(e.hasta,Math.min(s.pa.end,s.pb.end));
 e.d=d; porPar.set(k,e); s.d=d }
const pares=[...porPar.entries()].sort((a,b)=>b[1].area-a[1].area);
console.log('\n'+'g2 sumados'.padStart(10)+'  tramos  '+'anios'.padEnd(14)+'  decision');
for(const [k,e] of pares) console.log(e.area.toFixed(1).padStart(10)+String(e.n).padStart(7)+'  '+(e.desde+'..'+e.hasta).padEnd(14)+'  '+
 (e.d?('cede '+e.d.cede.id+' ('+e.d.por+')'):'SIN DECIDIR')+'   '+k);
const sinDecidir=pares.filter(([k,e])=>!e.d);
if(sinDecidir.length)console.log('\nsin decidir: '+sinDecidir.length+' pares; anadelos a la tabla como {cede:"id", a:"id"}');

// 3. restar ------------------------------------------------------------------------
function partirEn(c,y){
 const p=c.periods.find(p=>p.start<y&&p.end>y); if(!p)return;
 const n={start:y,end:p.end,rings:p.rings.map(rr=>rr.map(q=>q.slice()))};
 if(p.name)n.name=p.name; if(p.wikiTitle)n.wikiTitle=p.wikiTitle; if(p.inc)n.inc=1;
 p.end=y; c.periods.push(n); c.periods.sort((a,b)=>a.start-b.start||a.end-b.end);
}
let restas=0,vaciados=0,fallos=0; const tocados=new Set();
if(APLICA){
 // de mayor a menor para que el orden no importe en lo esencial
 for(const s of solapes.sort((a,b)=>b.area-a.area)){ if(!s.d)continue;
  const cede=s.d.cede, gana=s.d.gana, pg=cede===s.a?s.pb:s.pa;
  // pg es el periodo del ganador; se parte el perdedor en sus fronteras
  partirEn(cede,pg.start); partirEn(cede,pg.end);
  for(const p of cede.periods){ if(p.end<=pg.start||p.start>=pg.end)continue; if(!p.rings.length)continue;
   let r; try{ r=seguro('difference',p.rings.map(x=>[x]),pg.rings.map(x=>[x])) }catch(e){ fallos++; console.log('   FALLO '+cede.id+' '+p.start+'..'+p.end+' - '+gana.id); continue }
   const antes=p.rings.reduce((s,x)=>s+L.rA(x),0);
   const nuevo=R.limpia(r,3e-4);
   const despues=nuevo.reduce((s,x)=>s+L.rA(x),0);
   if(despues>antes*1.0001+0.02){fallos++;console.log("   FALLO (crece) "+cede.id+" "+p.start+".."+p.end+" - "+gana.id);continue}
   p.rings=nuevo; restas++; tocados.add(cede.id);
   if(!nuevo.length)vaciados++ } }
 for(const c of CIV){ const n=c.periods.length; c.periods=c.periods.filter(p=>p.rings.length); if(c.periods.length!==n)tocados.add(c.id) }
 L.save(src,BLK,CIV,process.env.JSX);
 console.log('\nrestas: '+restas+'  periodos vaciados (eliminados): '+vaciados+'  fallos: '+fallos+'  entidades tocadas: '+tocados.size);
 console.log('escrito '+process.env.JSX);
} else console.log('\n(sin --aplica no se escribe)');
