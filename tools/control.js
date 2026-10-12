#!/usr/bin/env node
// LA PRUEBA DE QUE LAS PRUEBAS FUNCIONAN.
//
// Todo el instrumental de este proyecto se ha validado de la misma manera: se
// escribe una herramienta, encuentra cosas, y como encuentra cosas se da por
// buena. Eso demuestra que **no calla siempre**. No demuestra lo contrario, que
// es lo que importa de verdad: que no se le escapa lo que tiene que encontrar.
//
// Y esa es exactamente la forma del peor error de esta campana. La ronda 40
// midio 38 anillos, salieron todos al 0% de agua, y de ahi se concluyo -y se
// escribio en una cabecera- que ningun poligono del mapa podia contener mar
// "por construccion". Habia 256 anillos de mas de un grado cuadrado con mas de
// la mitad en agua, y uno de ellos era un rectangulo de 152 grados cuadrados
// flotando en el Pacifico abierto desde el ano 1. **Un silencio se tomo por una
// demostracion.**
//
// Un control positivo es lo unico que distingue las dos cosas. Se inyectan
// defectos conocidos en una copia del mapa y se comprueba que cada detector
// dice lo suyo. Si uno calla, el que estaba roto era el detector, y eso hay que
// saberlo ANTES de correr una ronda de correcciones apoyandose en el.
//
// Los defectos que se inyectan son de las seis familias que las herramientas
// dicen cubrir: mar pintado, forma sintetica, sustrato sobre suelo deshabitado,
// pieza borrada, parpadeo temporal y geometria duplicada. No se inyecta nada
// sutil a proposito: si un detector falla con el caso de manual, no hace falta
// probarlo con casos dificiles.
//
//   JSX=<mapa> node control.js
const fs=require('fs');
const {execFileSync}=require('child_process');
const L=require('./lib.js');
const RUTA=process.env.JSX;
const COPIA='/tmp/geo/_control.jsx';
const doc=L.load(RUTA); const CIV=doc.CIV;

const caja=(x0,x1,y0,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const tri=(x,y,s)=>[[x,y],[x+s,y],[x+s/2,y+s]];
const vivo=(id,A)=>{const c=CIV.find(x=>x.id===id);if(!c)return null;
 const p=c.periods.find(p=>p.start<=A&&p.end>A);return p?{c,p}:null};

const inyectado=[];
function nota(clave,que){ inyectado.push({clave,que}); console.log('   inyectado  '+clave.padEnd(12)+que) }

// 1. MAR: un rectangulo sobre el Pacifico abierto, lejos de cualquier isla.
{
 const v=vivo('spanish',1600)||vivo('british',1600);
 if(v){ v.p.rings.push(caja(-140,-135,-20,-15));
  nota('MAR', v.c.id+' con un rectangulo de 25 grados2 en mar abierto (-140..-135, -20..-15)') }
}
// 2. FORMA: un triangulo de 8 grados2 en mitad de Siberia, sobre tierra.
{
 const v=vivo('russia',1800);
 if(v){ v.p.rings.push(tri(95,60,4));
  nota('FORMA', v.c.id+' con un triangulo de 4 vertices en tierra (95,60)') }
}
// 3. VACIO: un sustrato metido en el corazon del Taklamakan, declarado
//    deshabitado por el registro.
{
 const v=vivo('tarim_pueblos',1500);
 if(v){ v.p.rings.push(caja(82,85,39,40));
  nota('VACIO', v.c.id+' pintando el nucleo del Taklamakan (82..85, 39..40)') }
}
// 4. BORRADO: se quita la pieza mas grande de un periodo cualquiera.
{
 const v=vivo('japan',1600);
 if(v&&v.p.rings.length>1){
  let k=0; for(let i=1;i<v.p.rings.length;i++)
   if(Math.abs(L.rA(v.p.rings[i]))>Math.abs(L.rA(v.p.rings[k])))k=i;
  const a=Math.abs(L.rA(v.p.rings[k])); v.p.rings.splice(k,1);
  nota('BORRADO', v.c.id+' pierde su anillo mayor ('+a.toFixed(1)+' grados2)') }
}
// 5. PARPADEO: se quita un periodo intermedio y se abre un hueco de 4 anios.
{
 const c=CIV.find(x=>x.id==='portugal');
 if(c&&c.periods.length>6){
  const i=Math.floor(c.periods.length/2);
  const p=c.periods[i];
  const a=p.start, b=p.end;
  c.periods.splice(i,1);
  nota('PARPADEO', c.id+' pierde el periodo '+a+'..'+b) }
}
// 6. DUPLICADO: dos entidades con exactamente la misma geometria a la vez.
{
 const a=vivo('denmark',1700), b=vivo('sweden',1700);
 if(a&&b){ b.p.rings=a.p.rings.map(r=>r.map(q=>q.slice()));
  nota('DUPLICADO', b.c.id+' recibe la geometria exacta de '+a.c.id+' en 1700') }
}

L.save(doc.src,doc.R,doc.CIV,COPIA);
console.log('\ncopia con defectos: '+COPIA+'\n');

function corre(cmd,args,env){
 try{ return execFileSync('node',[cmd,...args],
  {cwd:__dirname,env:{...process.env,...env},encoding:'utf8',maxBuffer:64*1024*1024,timeout:1800000}) }
 catch(e){ return (e.stdout||'')+(e.stderr||'') }
}
const E={JSX:COPIA};
console.log('corriendo los detectores sobre la copia...\n');
const salidas={
 enelmar: corre('enelmar.js',[],{...E,ANILLOS:'1'}),
 formas:  corre('formas.js',['400'],E),
 reglas:  corre('reglas.js',['1500,1700'],E),
 perdidas:corre('perdidas.js',[RUTA,COPIA],{}),
 tiempo:  corre('tiempo.js',['400'],E),
};

const pruebas=[
 {clave:'MAR',      det:'enelmar', busca:s=>/lon -140\.0\.\.-135\.0/.test(s)},
 {clave:'MAR',      det:'reglas',  busca:s=>/FALLA R2/.test(s)},
 {clave:'FORMA',    det:'formas',  busca:s=>/TRIANGULO/.test(s)&&/lon 95\.0\.\.99\.0/.test(s)},
 {clave:'VACIO',    det:'reglas',  busca:s=>/FALLA R1/.test(s)},
 {clave:'BORRADO',  det:'perdidas',busca:s=>/PIEZAS ENTERAS/.test(s)&&/japan/.test(s)},
 {clave:'PARPADEO', det:'tiempo',  busca:s=>/PARPADEOS/.test(s)&&/portugal/.test(s)},
 {clave:'DUPLICADO',det:'reglas',  busca:s=>/FALLA R5/.test(s)},
];
console.log('defecto      detector    resultado');
let fallos=0;
for(const p of pruebas){
 const ok=p.busca(salidas[p.det]||'');
 if(!ok)fallos++;
 console.log('  '+p.clave.padEnd(11)+p.det.padEnd(12)+(ok?'LO ENCUENTRA':'>>> NO LO DETECTA <<<'));
}
console.log('\n'+(fallos?fallos+' detectores callan ante un defecto de manual. NO correr una ronda apoyandose en ellos.'
 :'los '+pruebas.length+' controles positivos pasan.'));
