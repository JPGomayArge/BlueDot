#!/usr/bin/env node
// QUE SE PERDIO ENTRE DOS VERSIONES DEL MAPA.
//
// Por que no existia y tenia que existir. Terranova -13,31 grados cuadrados,
// la decimosexta isla del mundo- desaparecio del mapa en un paso de la cadena
// de reconstruccion, y **ninguna de las siete comprobaciones del proyecto se
// entero**: la estructura seguia limpia, no habia solapes, no habia
// auto-intersecciones, las capitales seguian cuadrando y la red de testigos
// solo se quejo porque por casualidad habia una plaza en San Juan. Si la plaza
// no hubiera estado ahi, la isla se habria ido en silencio.
//
// El motivo es que todas las comprobaciones miran UNA version del mapa y se
// preguntan si es coherente. Un mapa al que le falta Terranova es perfectamente
// coherente. Lo unico que delata una perdida es comparar con lo que habia
// antes, y eso no lo hacia nadie.
//
// La comparacion es por periodo y no por entidad: una entidad puede perder area
// legitimamente -la talla un vecino, se reduce con el tiempo- pero que un
// periodo concreto encoja de una version a la siguiente sin que nadie lo haya
// pedido es lo que hay que ver.
//
// Tambien informa de lo que QUEDO SIN DUENO, que es distinto de lo que perdio
// una entidad: si A pierde y B gana lo mismo, no se ha perdido nada del mapa,
// solo ha cambiado de manos. Lo grave es el area que no recogio nadie.
//
//   node perdidas.js <antes.jsx> <despues.jsx> [anio,anio,...]
//   MIN=<grados2> umbral por periodo (0.5)
const L=require('./lib.js');
const A=L.load(process.argv[2]).CIV;
const B=L.load(process.argv[3]).CIV;
const MIN=+(process.env.MIN||0.5);
const ANIOS=(process.argv[4]||'').split(',').map(Number).filter(n=>!isNaN(n));

const ar=p=>p.rings.reduce((s,r)=>s+Math.abs(L.rA(r)),0);
const idx=C=>{const m=new Map();for(const c of C)m.set(c.id,c);return m};
const MA=idx(A), MB=idx(B);

console.log('entidad                    periodo          antes  despues   pierde');
let total=0, n=0;
const perdidos=[];
for(const [id,ca] of MA){
 const cb=MB.get(id);
 if(!cb){ console.log(id.padEnd(26)+'  ENTIDAD ENTERA DESAPARECIDA'); continue }
 for(const pa of ca.periods){
  // el periodo equivalente: el que cubre el mismo instante inicial
  const pb=cb.periods.find(p=>p.start<=pa.start&&p.end>pa.start);
  if(!pb){ console.log(id.padEnd(26)+String(pa.start).padStart(7)+'..'+String(pa.end).padEnd(7)+
    '  PERIODO DESAPARECIDO'); continue }
  const a0=ar(pa), a1=ar(pb);
  if(a0-a1<MIN)continue;
  total+=a0-a1; n++;
  perdidos.push({id,start:pa.start,end:pa.end,a0,a1,pa,pb});
 }
}
perdidos.sort((x,y)=>(y.a0-y.a1)-(x.a0-x.a1));
for(const p of perdidos.slice(0,40))
 console.log(p.id.padEnd(26)+String(p.start).padStart(7)+'..'+String(p.end).padEnd(7)+
  p.a0.toFixed(1).padStart(8)+p.a1.toFixed(1).padStart(9)+(p.a0-p.a1).toFixed(1).padStart(9));
console.log('\n'+n+' periodos con perdida > '+MIN+' grados2, '+total.toFixed(0)+' en total');

// QUE ANILLOS CONCRETOS SE FUERON. Un periodo que encoge puede haberse
// recortado por el borde -normal tras un tallado- o haber perdido una pieza
// entera, que es lo grave. Se busca cada anillo de antes que no tenga ningun
// anillo de despues con la misma caja aproximada.
if(perdidos.length){
 console.log('\nPIEZAS ENTERAS QUE YA NO ESTAN (ningun anillo nuevo en su sitio):');
 let m=0;
 for(const p of perdidos){
  for(const r of p.pa.rings){
   const a=Math.abs(L.rA(r)); if(a<MIN)continue;
   const b=L.bb(r);
   let hay=false;
   for(const q of p.pb.rings){ const c=L.bb(q);
    if(c[1]<b[0]||c[0]>b[1]||c[3]<b[2]||c[2]>b[3])continue;
    if(Math.abs(L.rA(q))>=a*0.5){hay=true;break} }
   if(hay)continue;
   m++;
   if(m<=30)console.log('   '+p.id.padEnd(24)+String(p.start).padStart(7)+
    '  '+a.toFixed(2).padStart(8)+' deg2  lon '+b[0].toFixed(1)+'..'+b[1].toFixed(1)+
    ' lat '+b[2].toFixed(1)+'..'+b[3].toFixed(1));
  }
 }
 console.log('   ('+m+' piezas)');
}

// Y LO QUE NO RECOGIO NADIE. Si A pierde y B gana, el mapa no ha perdido nada.
if(ANIOS.length){
 console.log('\nSUELO QUE DEJO DE TENER DUENO, por corte:');
 const bb=rs=>rs.reduce((a,r)=>{const b=L.bb(r);
  return [Math.min(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.max(a[3],b[3])]},[9e9,-9e9,9e9,-9e9]);
 const T=require('./tierra.js');
 for(const Y of ANIOS){
  const vivo=C=>{const v=[];for(const c of C){const p=c.periods.find(p=>p.start<=Y&&p.end>Y);
   if(p&&p.rings.length)v.push({id:c.id,p,b:bb(p.rings)})}return v};
  const va=vivo(A), vb=vivo(B);
  const due=(v,pt)=>{for(const o of v){ if(pt[0]<o.b[0]||pt[0]>o.b[1]||pt[1]<o.b[2]||pt[1]>o.b[3])continue;
   if(L.has(o.p.rings,pt))return o.id } return null};
  let perdio=0, gano=0; const donde={};
  for(let x=-180;x<180;x+=0.25)for(let y=-56;y<=78;y+=0.25){
   const pt=[+x.toFixed(2),+y.toFixed(2)];
   if(!T.enTierra(pt))continue;
   const da=due(va,pt), db=due(vb,pt);
   if(da&&!db){ perdio++; const k=(Math.floor(y/10)*10)+','+(Math.floor(x/10)*10);
    donde[k]=(donde[k]||0)+1 }
   else if(!da&&db)gano++;
  }
  console.log('  '+String(Y).padStart(6)+': celdas que pierden dueno '+perdio+
   ', que lo ganan '+gano+'   '+Object.entries(donde).sort((a,b)=>b[1]-a[1]).slice(0,5)
   .map(([k,v])=>'['+k+']x'+v).join(' '));
 }
}
