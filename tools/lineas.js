// Metrica INVARIANTE AL PARTIDO de periodos: en vez de contar PERIODOS que
// contienen un tramo recto -que sube en cuanto parte.js corta una fase en dos
// sin cambiar un solo vertice- se mide GRADO-ANIO: la longitud del tramo recto
// multiplicada por los anios que dura el periodo. Partir un periodo de 100
// anios en dos de 50 deja la cifra igual.
const L=require('/tmp/tools/lib.js');
const TOL=0.06,MIN=1.5;
const LINEAS=[
 ['Egipto-Sudan',    'lat',22.00,[24,37],[-4000,1899]],
 ['Egipto-Libia',    'lon',25.00,[20,32],[-4000,1919]],
 ['Sykes-Picot',     'lon',38.00,[30,37],[-4000,1916]],
 ['Arabia-Kuwait',   'lat',29.00,[44,48],[-4000,1922]],
 ['Uqair',           'lat',28.50,[44,51],[-4000,1922]],
 ['paralelo 49',     'lat',49.00,[-125,-95],[-4000,1818]],
 ['Sahel lat10',     'lat',10.00,[-10,25],[-4000,1900]],
 ['Mauritania-Mali', 'lon',-6.00,[15,25],[-4000,1900]],
 ['Sahel lat16.5',   'lat',16.50,[-15,15],[-4000,1900]],
 ['Rub al-Khali 20', 'lat',20.00,[50,60],[-4000,1913]],
 ['Oman 21.5',       'lat',21.50,[50,60],[-4000,1913]],
 ['Tabuk 27',        'lat',27.00,[34,42],[-4000,1925]],
];
function tramos(r){
 const out=[];let i=0;
 while(i<r.length){
  let j=i,lat=r[i][1];
  while(j+1<r.length&&Math.abs(r[j+1][1]-lat)<=TOL)j++;
  if(j>i){const lg=Math.abs(r[j][0]-r[i][0]);
   if(lg>=MIN)out.push({eje:'lat',v:lat,lg,a:Math.min(r[i][0],r[j][0]),b:Math.max(r[i][0],r[j][0])});}
  let k=i,lon=r[i][0];
  while(k+1<r.length&&Math.abs(r[k+1][0]-lon)<=TOL)k++;
  if(k>i){const lg=Math.abs(r[k][1]-r[i][1]);
   if(lg>=MIN)out.push({eje:'lon',v:lon,lg,a:Math.min(r[i][1],r[k][1]),b:Math.max(r[i][1],r[k][1])});}
  i+=Math.max(1,Math.max(j,k)-i);
 }
 return out;
}
function mide(f){
 const {CIV}=L.load(f);const res={};
 for(const [nom,eje,val,rango,vig] of LINEAS){
  let ga=0,per=0,ents=new Set();
  for(const c of CIV)for(const p of c.periods){
   if(p.end>vig[1])continue;
   const dur=Math.max(1,p.end-p.start);let hit=0;
   for(const r of p.rings)for(const t of tramos(r)){
    if(t.eje!==eje)continue;
    if(Math.abs(t.v-val)>0.15)continue;
    if(t.b<rango[0]||t.a>rango[1])continue;
    const sol=Math.min(t.b,rango[1])-Math.max(t.a,rango[0]);
    if(sol<MIN)continue;
    ga+=sol*dur;hit=1;
   }
   if(hit){per++;ents.add(c.id)}
  }
  res[nom]={ga,per,ents:ents.size};
 }
 return res;
}
const A=mide('/tmp/geo/bk_v26.jsx'),B=mide('/tmp/geo/trabajo2.jsx');
console.log('linea'.padEnd(18),'grado-anio v26'.padStart(15),'v27'.padStart(13),'  cambio    periodos');
for(const [nom] of LINEAS){
 const a=A[nom],b=B[nom];
 const d=a.ga?((b.ga-a.ga)/a.ga*100):0;
 console.log(nom.padEnd(18),a.ga.toFixed(0).padStart(15),b.ga.toFixed(0).padStart(13),
   (d>=0?'+':'')+d.toFixed(1)+'%',' ',a.per+'->'+b.per);
}
const NUEVE=['Egipto-Sudan','Egipto-Libia','Sykes-Picot','Arabia-Kuwait','Uqair','paralelo 49','Sahel lat10','Mauritania-Mali','Sahel lat16.5'];
let ga26=0,ga27=0,p26=0,p27=0;
for(const n of NUEVE){ga26+=A[n].ga;ga27+=B[n].ga;p26+=A[n].per;p27+=B[n].per}
console.log('\nTOTAL nueve rayas | grado-anio',ga26.toFixed(0),'->',ga27.toFixed(0),
 ' ('+((ga27-ga26)/ga26*100).toFixed(1)+'%) | periodos',p26,'->',p27);
