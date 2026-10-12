#!/usr/bin/env node
// REALISMO DE FORMA: que anillos son geometricamente imposibles como frontera.
//
// POR QUE. Todo lo que se ha encontrado mal en el dibujo de este mapa se ha
// encontrado MIRANDO: las H del Amazonas, la rejilla de Laponia, los
// rectangulos negros del Sahara, el cuadrado rojo de `pacifico_nz` flotando en
// el Pacifico. Ninguna metrica daba senal, porque un rectangulo de 50 grados
// cuadrados y una cuenca de 50 grados cuadrados miden lo mismo en area, en
// perimetro, en solape y en cobertura. Lo unico que los distingue es la FORMA,
// y la forma no se estaba mirando.
//
// Esto automatiza ese ojo. No pregunta si una frontera es correcta -para eso
// hace falta una fuente externa que el proyecto no tiene tierra adentro- sino
// algo mucho mas debil y mucho mas util: **si esa forma puede ser una frontera
// de algo**. Una frontera real, sobre decenas de miles de kilometros cuadrados,
// no es un triangulo, ni una elipse, ni un rectangulo perfecto, ni tiene seis
// vertices. Cuando lo es, no es una afirmacion sobre el mundo: es el rastro de
// la herramienta con la que se dibujo.
//
// LAS CINCO FIRMAS
//   POCOS VERTICES  un anillo grande descrito con muy pocos puntos. Es la firma
//                   mas general y la que mas cosas caza.
//   RECTANGULO      el area casi llena su propia caja. Cajas de `vacios.js`,
//                   sustratos dibujados con la herramienta de cajas.
//   ELIPSE          el radio desde el centroide sigue una elipse. Sale de
//                   generar contornos con seno y coseno.
//   TRIANGULO       tres vertices. No hay ninguna frontera triangular.
//   CONVEXA         area casi igual a la de su envolvente convexa. Un
//                   territorio real tiene entrantes: rios, montanas, vecinos.
//
// Y LA EXCEPCION QUE HAY QUE HACER, PORQUE SI NO LA LISTA ES INUTIL. Hay
// fronteras rectas de verdad, y muchas: el paralelo 49, el meridiano 141 de
// Alaska, casi todo el Sahara colonial, los estados del oeste americano, las
// divisiones internas de Australia. Lo que las distingue de una caja dibujada a
// mano es que **son de dos**: el vecino dibuja la misma linea. Asi que de cada
// anillo sospechoso se mide cuanto de su perimetro lo comparte alguien, y el
// que lo comparte casi todo baja de gravedad. Es la regla de la ronda 49 -*un
// borde es de dos*- aplicada a la forma entera en vez de a un tramo.
//
//   JSX=<mapa> node formas.js [n]        n = cuantas listar (60)
//   TODOS=1 incluye los que comparten perimetro (fronteras rectas legitimas)
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
const N=+(process.argv[2]||60);
const MIN=+(process.env.MIN||1);          // grados cuadrados minimos

const R4=v=>v.toFixed(4);
const cla=(a,b)=>{const ka=R4(a[0])+' '+R4(a[1]),kb=R4(b[0])+' '+R4(b[1]);
                  return ka<kb?ka+'|'+kb:kb+'|'+ka};
const per=r=>{let s=0;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];
 s+=Math.hypot(b[0]-a[0],b[1]-a[1])}return s};

function envolvente(pts){
 const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 if(p.length<3)return p;
 const cruz=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const abajo=[]; for(const q of p){ while(abajo.length>=2&&cruz(abajo[abajo.length-2],abajo[abajo.length-1],q)<=0)abajo.pop(); abajo.push(q) }
 const arriba=[]; for(let i=p.length-1;i>=0;i--){ const q=p[i];
  while(arriba.length>=2&&cruz(arriba[arriba.length-2],arriba[arriba.length-1],q)<=0)arriba.pop(); arriba.push(q) }
 abajo.pop(); arriba.pop(); return abajo.concat(arriba);
}

function firmas(r){
 const a=Math.abs(L.rA(r)); const b=L.bb(r);
 const cajaA=(b[1]-b[0])*(b[3]-b[2]);
 const f=[];
 const v=r.length;
 // 1. pocos vertices para el tamano. El umbral crece con la raiz del area:
 //    un anillo de 1 grado2 con 6 vertices es plausible -una isla pequena-;
 //    uno de 50 con 8 no lo es.
 const esperados=6+6*Math.sqrt(a);
 if(v<Math.min(esperados,40)&&a>=MIN)f.push(['POCOS',v+'v vs ~'+Math.round(Math.min(esperados,40))]);
 if(v<=4)f.push(['TRIANGULO',v+'v']);
 // 2. rectangulo: llena su caja
 if(cajaA>0&&a/cajaA>0.93&&v<=16)f.push(['RECTANGULO',(100*a/cajaA).toFixed(0)+'% de su caja']);
 // 3. elipse: radio desde el centroide ajusta una elipse de la caja
 let cx=0,cy=0; for(const q of r){cx+=q[0];cy+=q[1]} cx/=v; cy/=v;
 const sa=(b[1]-b[0])/2, sb=(b[3]-b[2])/2;
 if(sa>0&&sb>0&&v>=8){
  let s=0,n=0;
  for(const q of r){ const dx=q[0]-cx, dy=q[1]-cy; const rad=Math.hypot(dx,dy);
   if(rad<1e-9)continue; const th=Math.atan2(dy,dx);
   const re=sa*sb/Math.hypot(sb*Math.cos(th),sa*Math.sin(th));
   s+=Math.abs(rad-re)/re; n++ }
  if(n&&s/n<0.06)f.push(['ELIPSE','desvio '+(100*s/n).toFixed(1)+'%']);
 }
 // 4. convexidad
 const h=envolvente(r);
 if(h.length>=3){
  const ah=Math.abs(L.rA(h));
  if(ah>0&&a/ah>0.985&&a>=5)f.push(['CONVEXA',(100*a/ah).toFixed(1)+'%']);
 }
 return f;
}

// --- perimetro compartido, por anio, con cache -----------------------------
const CACHE=new Map();
function mapaAristas(A){
 if(CACHE.has(A))return CACHE.get(A);
 const m=new Map();
 for(const c of CIV){ const p=c.periods.find(p=>p.start<=A&&p.end>A); if(!p)continue;
  for(const r of p.rings)for(let i=0;i<r.length;i++){
   const k=cla(r[i],r[(i+1)%r.length]);
   let s=m.get(k); if(!s)m.set(k,s=new Set()); s.add(c.id) } }
 if(CACHE.size>40)CACHE.clear();
 CACHE.set(A,m); return m;
}
function compartido(r,id,A){
 const m=mapaAristas(A); let tot=0,comp=0;
 for(let i=0;i<r.length;i++){ const a=r[i],b=r[(i+1)%r.length];
  const d=Math.hypot(b[0]-a[0],b[1]-a[1]); tot+=d;
  const s=m.get(cla(a,b)); if(s&&s.size>1)comp+=d }
 return tot?comp/tot:0;
}
// LA FORMA DE UNA REBANADA NO ES UNA FORMA. Trece.
//
// La primera version de esta herramienta puso en cabeza de la lista tiras
// verticales de `usa` -longitud -109,5 a -106,8, de la latitud 31 a la 49, diez
// vertices, llena su caja, convexa- y de `russia`, `mongol` y `spanish`. Las
// cuatro firmas saltaban a la vez y ninguna significaba nada: no son
// territorios mal dibujados, son los TROZOS en que `recorte.parte` corta un
// poligono con agujeros. Un trozo esta limitado por el corte, y el corte no es
// una frontera, asi que juzgar su silueta es juzgar al recortador.
//
// Van trece veces. La regla no cambia -*cualquier metrica multiplicada por una
// unidad que otra herramienta manipula, mide a esa herramienta*- pero sigue sin
// ser automatica: cada herramienta nueva hay que preguntarle explicitamente
// cual es su unidad. Aqui la unidad correcta no es el anillo: es el TERRITORIO.
// Un anillo cuyo perimetro es en su mayor parte junta interna no se juzga.
function juntaInterna(p){
 const cuenta=new Map();
 for(const r of p.rings)for(let i=0;i<r.length;i++){
  const k=cla(r[i],r[(i+1)%r.length]); cuenta.set(k,(cuenta.get(k)||0)+1) }
 const dentro=(x,y)=>{ for(const r of p.rings) if(L.pip([x,y],r))return true; return false };
 return r=>{ let tot=0,ju=0;
  for(let i=0;i<r.length;i++){ const a=r[i],b=r[(i+1)%r.length];
   const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy); tot+=d;
   let es=cuenta.get(cla(a,b))>1;
   if(!es&&d>=0.3&&(Math.abs(dx)<1e-9||Math.abs(dy)<1e-9)){
    const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,nx=-dy/d*0.03,ny=dx/d*0.03;
    es=dentro(mx+nx,my+ny)&&dentro(mx-nx,my-ny) }
   if(es)ju+=d }
  return tot?ju/tot:0 };
}

// --- recorrido --------------------------------------------------------------
const vistos=new Set(), lista=[];
let rebanadas=0;
for(const c of CIV)for(const p of c.periods){
 let ji=null;
 for(const r of p.rings){
  const a=Math.abs(L.rA(r)); if(a<MIN)continue;
  const b=L.bb(r);
  const k=c.id+'|'+b.map(v=>v.toFixed(2)).join(',')+'|'+r.length;
  if(vistos.has(k))continue; vistos.add(k);
  const f=firmas(r); if(!f.length)continue;
  if(!ji)ji=juntaInterna(p);
  const fj=ji(r);
  if(fj>0.35){rebanadas++;continue}          // es un trozo, no una forma
  const A=Math.floor((Math.max(p.start,-10000)+Math.min(p.end,2025))/2);
  const sh=compartido(r,c.id,A);
  lista.push({id:c.id,kind:c.kind||'',start:p.start,end:p.end,a,v:r.length,b,f,sh,fj});
 }
}
// gravedad: cuantas firmas, cuanta area, y cuanto NO comparte
for(const x of lista) x.g = x.f.length * Math.sqrt(x.a) * (1-x.sh);
lista.sort((a,b)=>b.g-a.g);

const mostrar = process.env.TODOS ? lista : lista.filter(x=>x.sh<0.5);
console.log('descartados por ser trozos de un poligono partido, no formas: '+rebanadas);
console.log('anillos unicos de mas de '+MIN+' grado2 con alguna firma de forma sintetica: '+
 lista.length+'  (de ellos '+lista.filter(x=>x.sh>=0.5).length+
 ' comparten mas de la mitad del perimetro con un vecino: fronteras rectas pactadas)\n');
console.log('entidad                  periodo          area  vert  comp   firmas');
for(const x of mostrar.slice(0,N))
 console.log(x.id.padEnd(24)+String(x.start).padStart(7)+'..'+String(x.end).padEnd(7)+
  x.a.toFixed(1).padStart(7)+String(x.v).padStart(6)+(100*x.sh).toFixed(0).padStart(5)+'%  '+
  x.f.map(q=>q[0]).join('+')+'   lon '+x.b[0].toFixed(1)+'..'+x.b[1].toFixed(1)+
  ' lat '+x.b[2].toFixed(1)+'..'+x.b[3].toFixed(1));
const porE={};
for(const x of mostrar){ porE[x.id]=(porE[x.id]||0)+x.a }
console.log('\npor entidad (area acumulada de anillos sospechosos):');
Object.entries(porE).sort((a,b)=>b[1]-a[1]).slice(0,25)
 .forEach(([k,v])=>console.log('   '+k.padEnd(26)+v.toFixed(0).padStart(7)));
