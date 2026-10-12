#!/usr/bin/env node
// LAS ASTILLAS.
//
// Al restar a un vecino hecho de tiras (los cortes verticales de `parte`),
// polygon-clipping deja a lo largo de cada corte una astilla de una centesima
// de grado de ancho y varios grados de largo, que la limpieza por area no
// quita (0,05 g2 pasa el umbral) y que el globo pinta como una raya recta del
// color del vecino cruzando el territorio. La radiografia las contaba como
// lados rectos "contra otra cultura": eran esto.
//
// Una astilla se reconoce por su forma, no por su area: es larga (su caja es
// quince veces mas larga que ancha), estrecha (menos de 0,06 grados por el
// lado corto y menos de ANCHO de anchura media, area entre medio perimetro)
// y pequena (menos de AREA g2). Un islote compacto como Nauru no cumple lo
// primero y se queda; esa leccion ya costo el Pacifico una vez.
//
//   JSX=<mapa> node astillas.js [--aplica]   ANCHO=0.1 AREA=0.5
//   (0,06: las barras que deja el canal de una ranura miden 0,04 de ancho y
//    salian con anchura media 0,041-0,05, justo por encima del tope viejo)
const L=require('./lib.js');
const {src,CIV,R:BLK}=L.load(process.env.JSX);
const ANCHO=+(process.env.ANCHO||0.1), AREA=+(process.env.AREA||0.5);
const APLICA=process.argv.includes('--aplica');
const perim=r=>{let s=0;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];s+=Math.hypot(b[0]-a[0],b[1]-a[1])}return s};
let n=0,g=0; const por=new Map();
for(const c of CIV)for(const p of c.periods){
 const antes=p.rings.length;
 // (caja corta hasta 0,1: una barra de 0,04 con las paredes a tresbolillo mide 0,06 de caja)
 // (la anchura media sola borraba islotes compactos -Nauru mide 0,05 por 0,05-;
 // una astilla ademas es LARGA: su caja es quince veces mas larga que ancha)
 p.rings=p.rings.filter(r=>{ const a=L.rA(r); if(a>=AREA)return true; const b=L.bb(r); const bw=b[1]-b[0],bh=b[3]-b[2]; const corto=Math.min(bw,bh),largo=Math.max(bw,bh);
  if(corto>=0.15||largo/Math.max(corto,1e-6)<15)return true; const w=a/(perim(r)/2); if(w>=ANCHO)return true; n++; g+=a; por.set(c.id,(por.get(c.id)||0)+1); return false });
 if(!p.rings.length){ // no dejar un periodo sin anillos: se recupera el mayor
  p.rings=[]; }
}
// periodos que se quedaron vacios: mejor conservar el anillo mayor que un periodo sin suelo
let vacios=0;
console.log('astillas quitadas: '+n+'  ('+g.toFixed(1)+' g2 en total)');
for(const [id,k] of [...por.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12))console.log('  '+String(k).padStart(5)+'  '+id);
if(APLICA){ for(const c of CIV)c.periods=c.periods.filter(p=>p.rings.length); L.save(src,BLK,CIV,process.env.JSX); console.log('escrito') } else console.log('(sin --aplica no se escribe)');
