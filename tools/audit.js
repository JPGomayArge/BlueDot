#!/usr/bin/env node
// Auditoria de figuras: detecta contornos que no parecen geografia real.
//   caja          -> el poligono llena casi todo su rectangulo
//   ovalo         -> convexo y con muy pocos vertices para su tamaño
//   trazo grueso  -> banda alargada de anchura casi constante
//   rectilineo    -> el perimetro va casi todo en tramos horizontales o
//                    verticales: la firma de una caja dibujada a mano
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
// Fraccion de vertices que NO estan en la envolvente convexa. Una costa real
// tiene golfos y penínsulas: muchos vertices por dentro. Un ovalo dibujado a
// mano no tiene ninguno.
function concavos(r){
 const pts=r.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo=[];for(const p of pts){while(lo.length>=2&&cross(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
 const up=[];for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(up.length>=2&&cross(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}
 const hull=new Set(lo.slice(0,-1).concat(up.slice(0,-1)).map(p=>p[0]+','+p[1]));
 let n=0;for(const p of r)if(!hull.has(p[0]+','+p[1]))n++;
 return n/r.length;
}
// Los archipielagos se pintan con una caja de mar a proposito: un atolon no
// se ve a escala de globo. No es un defecto de dibujo, es la convencion del
// mapa, asi que un anillo que es todo oceano no se juzga.
const T=require('./tierra.js');
function esMar(r){
 const b=L.bb(r);const paso=Math.max((b[1]-b[0])/10,(b[3]-b[2])/10,0.2);
 let n=0,t=0;
 for(let x=b[0];x<=b[1];x+=paso)for(let y=b[2];y<=b[3];y+=paso){
  if(!L.pip([x,y],r))continue;n++;if(T.enTierra([x,y]))t++}
 return n>0 && t/n < 0.10;
}
// Un anillo con lados rectos puede ser una CAJA dibujada a mano o una TESELA:
// recorte.parte corta un poligono en tiras verticales para evitar agujeros, y
// entonces los lados rectos son costuras entre tiras vecinas. Se reconoce
// porque otro anillo del mismo periodo empieza o acaba exactamente en esa
// longitud. Reformar una tesela sola abriria una franja blanca.
function esTesela(r,p){
 if(p.rings.length<2)return false;
 const b=L.bb(r);
 for(const o of p.rings){ if(o===r)continue; const c2=L.bb(o);
  if(Math.abs(c2[0]-b[1])<1e-6||Math.abs(c2[1]-b[0])<1e-6)return true; }
 return false;
}
function rectilineo(r){
 let largo=0,recto=0;
 for(let i=0;i<r.length;i++){
  const a=r[i],b=r[(i+1)%r.length];
  const dx=Math.abs(a[0]-b[0]),dy=Math.abs(a[1]-b[1]),d=Math.hypot(dx,dy);
  if(d<1e-9)continue; largo+=d; if(dx<1e-6||dy<1e-6)recto+=d;
 }
 return largo? recto/largo : 0;
}
const filas=[];
for(const c of CIV){
 let peor=null;
 for(const p of c.periods)for(const r of p.rings){
  const a=L.rA(r);if(a<10)continue;
  const [x0,x1,y0,y1]=L.bb(r);
  const llena=a/((x1-x0)*(y1-y0)||1e-9);
  const per=r.reduce((s,q,i)=>{const n=r[(i+1)%r.length];return s+Math.hypot(n[0]-q[0],n[1]-q[1])},0);
  const vgr=r.length/(per||1e-9);           // vertices por grado de contorno
  const cv=concavos(r);
  const comp=4*Math.PI*a/(per*per||1e-9);   // compacidad isoperimetrica
  const motivos=[];
  // una costa real tiene detalle: pocos vertices por grado de contorno y el
  // poligono llenando su rectangulo es la firma de un rectangulo dibujado a mano
  if(llena>0.92&&r.length<40)motivos.push('caja');
  if(cv<0.10&&comp>0.82&&r.length<14)motivos.push('ovalo');
  if(vgr<0.45)motivos.push('trazo grueso');
  // RECTILINEO (ronda 43). La firma de una caja dibujada a mano no es llenar el
  // rectangulo -una caja con una muesca no lo llena- sino que sus tramos sean
  // exactamente horizontales o verticales. El usuario mando una captura del
  // Indo en el -2992 con este anillo:
  //   [71.55,30.6] [71.8,30.6] [71.8,28.5] [73.5,28.5] [75,29.1]
  //   [75,31.2] [72,31.2] [72,32.2] [71.55,32.2]
  // Nueve vertices, todos los tramos rectos, y llena solo el 69%: la prueba
  // 'caja' no lo veia. Se mide la fraccion del PERIMETRO en tramos rectos, no
  // la de vertices, porque un contorno bueno puede tener dos lados rectos
  // cortos y eso no lo hace dibujado a mano.
  if(rectilineo(r)>0.70&&r.length<60)motivos.push('rectilineo');
  if(!motivos.length)continue;
  if(esMar(r))continue;   // caja de mar de un archipielago: es la convencion, no un defecto
  if(esTesela(r,p))continue;  // tira de un corte vertical: sus lados rectos son costuras
  // SE INFORMA DE TODOS LOS ANILLOS MALOS, NO SOLO DEL MAYOR. Antes esta
  // herramienta guardaba unicamente el anillo de mas area de cada entidad, y
  // por eso el rectangulo del Indo -8,8 grado2 al lado de un bloque de 22,6-
  // no llego nunca a mirarse. Un apendice dibujado a mano al lado de un
  // contorno decente era invisible por construccion.
  filas.push({id:c.id,a,pts:r.length,vgr,llena,cv,comp,r,
              tramo:p.start+'..'+p.end,motivo:motivos.join('+')});}
 }

// ---------------------------------------------------------------------------
// EL AGUA COMO JUEZ (ronda 40).
//
// Las tres medidas de arriba -llena, ovalo, trazo grueso- dicen que un contorno
// es LISO. No dicen que este mal, y confundir las dos cosas seria el mismo error
// que ya ha costado seis rondas. Un area cultural de la taiga o de la estepa no
// tiene ningun accidente al que agarrarse: su frontera es difusa de verdad, y
// dibujarla lisa es honesto. `dene` con 34 vertices sobre el escudo canadiense
// no es un defecto; `ethiopia` como un ovalo de once vertices si lo es, porque
// Etiopia tiene una forma que cualquiera reconoce.
//
// Lo que separa a los dos es el AGUA. Un contorno liso tierra adentro puede
// estar bien; un contorno liso que se come el mar esta mal SIEMPRE, porque la
// costa es el unico accidente que no admite interpretacion. Se mide que
// fraccion del area del anillo cae sobre agua, muestreando una malla dentro del
// poligono. Por encima del 12% el anillo no sigue la costa: es un borron
// encima de un litoral, y eso si es un defecto comprobable.
//
// Los archipielagos ya se excluyen antes con `esMar`, asi que aqui no hay
// falsos positivos por la convencion de pintar atolones con una caja de mar.
function fraccionAgua(r){
 const b=L.bb(r);
 const paso=Math.max((b[1]-b[0])/24,(b[3]-b[2])/24,0.05);
 let dentro=0, agua=0;
 for(let x=b[0];x<=b[1];x+=paso)for(let y=b[2];y<=b[3];y+=paso){
  if(!L.pip([x,y],r))continue;
  dentro++; if(!T.enTierra([x,y]))agua++;
 }
 return dentro? agua/dentro : 0;
}
filas.sort((a,b)=>b.a-a.a);
// El agua solo se calcula para los que se van a imprimir: es la prueba cara.
const TOPE=+(process.env.TOPE||60);
for(const f of filas.slice(0,TOPE)) f.agua=fraccionAgua(f.r);
console.log('anillos con firma de dibujo a mano: '+filas.length+
 ' en '+new Set(filas.map(f=>f.id)).size+' entidades');
console.log('  area  pts   v/gr  llena   cv  comp  agua  tramo           entidad / motivo');
for(const f of filas.slice(0,TOPE))console.log(String(f.a.toFixed(0)).padStart(6)+
 String(f.pts).padStart(5)+'  '+f.vgr.toFixed(2)+'  '+(f.llena*100).toFixed(0).padStart(4)+'%  '+
 f.cv.toFixed(2)+'  '+f.comp.toFixed(2)+'  '+((f.agua||0)*100).toFixed(0).padStart(3)+'%  '+
 f.tramo.padEnd(14)+'  '+f.id+'  ['+f.motivo+']');
const por={};for(const f of filas)for(const m of f.motivo.split('+'))por[m]=(por[m]||0)+1;
console.log('\npor motivo: '+JSON.stringify(por));
const malos=filas.slice(0,TOPE).filter(f=>f.agua>0.12);
console.log('DE ESOS, LOS QUE SE COMEN LA COSTA (agua > 12%): '+malos.length+
 '  -- son los defectos comprobables');
for(const f of malos) console.log('   '+f.id.padEnd(24)+(f.agua*100).toFixed(0).padStart(3)+
 '% de agua, '+f.a.toFixed(0)+' grado2, '+f.pts+' vertices');
