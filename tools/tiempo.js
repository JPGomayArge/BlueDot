#!/usr/bin/env node
// COHERENCIA TEMPORAL. El eje que no tenia ningun instrumento.
//
// Las once comprobaciones del proyecto miran CORTES: dado un anio, el mapa es
// valido, no se solapa, no tiene huecos, acierta los sondeos. Ninguna mira la
// SECUENCIA. Y la mitad de lo que un mapa historico afirma esta en la
// secuencia: no solo donde estaba una frontera, sino cuando se movio y cuanto.
//
// Una entidad con la silueta identica durante ochocientos anios y un salto
// brusco despues no esta mal en ningun corte -en cada uno es un poligono
// valido, sin solapes, que acierta sus sondeos- y esta mal en el conjunto.
// Dice que no paso nada durante ocho siglos y que despues paso todo en un anio,
// y eso casi nunca es historia: es el rastro de cuando alguien edito el fichero.
//
// Hay 146 parpadeos y 2.662 saltos detectados hace rondas por una herramienta
// que ya no existe, nunca trabajados y nunca vueltos a medir.
//
// QUE MIRA, Y POR QUE ESTOS TRES
//
//   SALTO      la geometria cambia mucho de un periodo al siguiente. Se mide
//              con tres senales baratas a la vez -area, centroide, caja- y
//              despues **se confirma con la interseccion real** de los dos
//              periodos en los casos que encabezan la lista. Una senal barata
//              sirve para ordenar 15.000 periodos; no sirve para afirmar.
//   PARPADEO   la entidad desaparece y vuelve. Un hueco corto entre dos
//              periodos casi nunca es una caida y una restauracion: es un
//              periodo que falta.
//   CONGELADO  geometria identica durante siglos y despues un salto. No es un
//              defecto por si mismo -hay fronteras estables- pero un tramo
//              congelado seguido de un salto grande marca exactamente donde el
//              mapa no tiene informacion y la esta fingiendo con un escalon.
//
// LO QUE NO PUEDE DECIR. Si la fecha es la correcta. Para eso hace falta una
// fuente externa, igual que para las formas de tierra adentro. Esto solo
// encuentra los sitios donde la forma del cambio es inverosimil, que es
// bastante mas de lo que habia.
//
//   JSX=<mapa> node tiempo.js [n]
//   CONFIRMA=<n> cuantos de los peores verificar con interseccion real (25)
const pc=require('polygon-clipping');
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
const N=+(process.argv[2]||40);
const CONF=+(process.env.CONFIRMA||25);

const ar=p=>p.rings.reduce((s,r)=>s+Math.abs(L.rA(r)),0);
const bbDe=rs=>rs.reduce((a,r)=>{const b=L.bb(r);
 return [Math.min(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.max(a[3],b[3])]},[9e9,-9e9,9e9,-9e9]);
const cen=p=>{let x=0,y=0,n=0;for(const r of p.rings)for(const q of r){x+=q[0];y+=q[1];n++}
 return n?[x/n,y/n]:[0,0]};
const jacCaja=(a,b)=>{
 const ix=Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]));
 const iy=Math.max(0,Math.min(a[3],b[3])-Math.max(a[2],b[2]));
 const inter=ix*iy;
 const ua=(a[1]-a[0])*(a[3]-a[2]), ub=(b[1]-b[0])*(b[3]-b[2]);
 const uni=ua+ub-inter; return uni>0?inter/uni:1;
};
// firma de geometria: si dos periodos tienen exactamente los mismos anillos,
// el mapa no dice nada nuevo entre ellos
const firma=p=>p.rings.map(r=>r.length+':'+r[0][0].toFixed(2)+','+r[0][1].toFixed(2)).sort().join('|');

const saltos=[], parpadeos=[], congelados=[];
for(const c of CIV){
 const ps=c.periods.slice().sort((a,b)=>a.start-b.start);
 let iguales=0, desde=null;
 for(let i=0;i<ps.length;i++){
  const p=ps[i];
  if(i>0){
   const q=ps[i-1];
   const hueco=p.start-q.end;
   if(hueco>0) parpadeos.push({id:c.id,fin:q.end,vuelve:p.start,hueco,
                               a0:ar(q),a1:ar(p)});
   if(hueco<=0){
    const a0=ar(q), a1=ar(p);
    const rel=Math.abs(a1-a0)/Math.max(a0,a1,1e-9);
    const c0=cen(q), c1=cen(p);
    const esc=Math.sqrt(Math.max(a0,a1))||1;
    const mov=Math.hypot(c1[0]-c0[0],c1[1]-c0[1])/esc;
    const jc=jacCaja(bbDe(q.rings),bbDe(p.rings));
    // una senal compuesta: cambia el tamano, se mueve el centro, o la caja
    // deja de parecerse
    const s=Math.max(rel, Math.min(1,mov), 1-jc);
    if(s>0.35&&Math.max(a0,a1)>2)
     saltos.push({id:c.id,anio:p.start,a0,a1,rel,mov,jc,s,q,p,
                  dur0:q.end-q.start,dur1:p.end-p.start});
   }
   if(firma(p)===firma(q)){ if(desde===null)desde=q.start; iguales++ }
   else {
    if(desde!==null&&p.start-desde>=400){
     const a0=ar(q), a1=ar(p);
     const rel=Math.abs(a1-a0)/Math.max(a0,a1,1e-9);
     if(rel>0.2&&Math.max(a0,a1)>2)
      congelados.push({id:c.id,desde,hasta:q.end,anios:q.end-desde,rel,a0,a1,salto:p.start});
    }
    desde=null;
   }
  }
 }
}

// --- CONFIRMACION. Una senal barata ordena; no afirma. -----------------------
saltos.sort((a,b)=>b.s*Math.sqrt(Math.max(b.a0,b.a1))-a.s*Math.sqrt(Math.max(a.a0,a.a1)));
let confirmados=0, desmentidos=0;
for(const x of saltos.slice(0,CONF)){
 try{
  const A=x.q.rings.map(r=>[r.concat([r[0]])]), B=x.p.rings.map(r=>[r.concat([r[0]])]);
  const inter=pc.intersection(A,B), uni=pc.union(A,B);
  const ai=(inter||[]).reduce((s,poly)=>s+Math.abs(L.rA(poly[0])),0);
  const au=(uni||[]).reduce((s,poly)=>s+Math.abs(L.rA(poly[0])),0);
  x.jac=au>0?ai/au:1;
  if(x.jac<0.7)confirmados++; else desmentidos++;
 }catch(e){ x.jac=null }
}

console.log('SALTOS: '+saltos.length+' transiciones con cambio brusco (de '+
 CIV.reduce((s,c)=>s+c.periods.length,0)+' periodos)');
console.log('   de los '+CONF+' peores, confirmados con interseccion real: '+confirmados+
 ', desmentidos por la senal barata: '+desmentidos+'\n');
console.log('entidad                    anio    area antes  despues   jaccard  dur.previa');
for(const x of saltos.slice(0,N))
 console.log(x.id.padEnd(26)+String(x.anio).padStart(6)+x.a0.toFixed(0).padStart(11)+
  x.a1.toFixed(0).padStart(9)+
  (x.jac==null?'      -  ':(x.jac).toFixed(2).padStart(9))+
  String(x.dur0).padStart(10)+' anios');

parpadeos.sort((a,b)=>a.hueco-b.hueco);
console.log('\nPARPADEOS: '+parpadeos.length+' entidades que desaparecen y vuelven');
console.log('entidad                    se va   vuelve  hueco   area antes/despues');
for(const x of parpadeos.slice(0,20))
 console.log(x.id.padEnd(26)+String(x.fin).padStart(6)+String(x.vuelve).padStart(9)+
  String(x.hueco).padStart(7)+'   '+x.a0.toFixed(0)+' / '+x.a1.toFixed(0));

congelados.sort((a,b)=>b.anios*b.rel-a.anios*a.rel);
console.log('\nCONGELADOS: '+congelados.length+' tramos sin ningun cambio seguidos de un salto');
console.log('entidad                    congelado         anios  salto en   cambio');
for(const x of congelados.slice(0,20))
 console.log(x.id.padEnd(26)+String(x.desde).padStart(7)+'..'+String(x.hasta).padEnd(8)+
  String(x.anios).padStart(6)+String(x.salto).padStart(10)+(100*x.rel).toFixed(0).padStart(8)+'%');
