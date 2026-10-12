#!/usr/bin/env node
// SUSTRATO QUE DESAPARECE BAJO LA CULTURA CONCRETA.
//
// Por que existe. Lo encontro el agente de la estepa en la ronda 37 y lo dijo
// asi: `estepa_kazaja` pasa de 292 grados cuadrados en -2100..-2000 a 31 en
// -2000..-1900 porque `andronovo` se la come entera.
//
// Es la inversion exacta de la regla que esta campana lleva cuatro rondas
// aplicando. Un sustrato es la CAPA DE FONDO: responde a "si aqui no hay ni
// imperio ni cultura concreta, quien vivia". Cuando entra una cultura concreta,
// el sustrato debe ceder SOLO donde esa cultura esta, y seguir pintando el
// resto. Si desaparece entero, el mapa esta diciendo que la poblacion de fondo
// se extinguio el dia que apareció un estilo de ceramica, que es absurdo.
//
// NINGUN INSTRUMENTO LO VEIA, y ese es el interes del caso:
//   - `huecos` e `inventario` no lo ven porque NO DEJA HUECO: el suelo lo pinta
//     la cultura concreta.
//   - `dobles_exacto` no lo ve porque no hay solape, precisamente.
//   - `triturado` no lo ve porque el area cae pero los anillos no suben.
//   - `reversion` no lo ve porque el suelo no se queda sin dueno.
// Solo se ve comparando lo que PIERDE el sustrato con lo que GANA el recien
// llegado. Si el sustrato pierde mucho mas de lo que el otro ocupa, sobra
// recorte.
//
// ============================================================================
// RESULTADO: EL PATRON NO EXISTE EN FORMA DANINA. Se comprueba y se conserva la
// herramienta por el resultado negativo, que vale tanto como uno positivo.
// ============================================================================
// Pasada por el mapa en la ronda 38 devuelve seis casos y 223 grados cuadrados,
// y al mirar el SUELO -que es lo que importa, no el area de la entidad- sale
// esto:
//
//   estepa_kazaja en -2000   234 celdas, CERO sin dueno (andronovo 185)
//   cuman en 1236            107 celdas, UNA sin dueno
//   celtas en 43             110 celdas, ocho sin dueno (rome 94)
//   altai_sayan en 460        91 celdas, TREINTA Y CINCO sin dueno
//
// Es decir: cuando un sustrato desaparece bajo una cultura concreta que cubre el
// mismo suelo, EL MAPA ESTA BIEN. La preocupacion era de forma, no de fondo: si
// `andronovo` ocupa de verdad toda la estepa kazaja, que `estepa_kazaja` ceda
// entera no es un error, es la regla del sustrato funcionando.
//
// Y donde si queda suelo sin dueno -altai_sayan en el 460- el defecto no es de
// esta familia sino un hueco corriente, que `reversion.js` e `inventario.js` ya
// detectan. No hace falta una clase nueva de defecto.
//
// La leccion, que es la de toda la campana: medir el AREA DE LA ENTIDAD engana;
// hay que medir EL SUELO. Un sustrato que se encoge no es noticia. Un trozo de
// tierra que se queda sin nadie, si.
//
//   JSX=<mapa> node sustrato.js [CAIDA] [CUANTOS]
//
// CAIDA es la fraccion de area que el sustrato pierde de un periodo al siguiente
// para considerarlo sospechoso (0,5 por defecto).
//
// COMO LEERLO. La columna "de mas" es lo que el sustrato perdio POR ENCIMA de lo
// que ocupan los recien llegados: es el area que el mapa ha dejado de pintar sin
// que nadie la haya tomado, salvo que otra entidad ya existente la absorbiera.
// Comprobar eso ultimo es el trabajo de quien lea.
const L=require('./lib.js');
const {CIV}=L.load(process.env.JSX);
const CAIDA=+(process.argv[2]||0.5), CUANTOS=+(process.argv[3]||25);
const ar=p=>p.rings.reduce((s,r)=>s+L.rA(r),0);
// entidades que empiezan en cada anio
const nacen=new Map();
for(const c of CIV){
 const y=c.periods[0].start;
 if(!nacen.has(y))nacen.set(y,[]);
 nacen.get(y).push(c);
}
const filas=[];
for(const c of CIV){
 if(c.kind!=='cultura')continue;            // solo sustratos y areas culturales
 const ps=c.periods;
 for(let i=1;i<ps.length;i++){
  const a0=ar(ps[i-1]), a1=ar(ps[i]);
  if(a0<20)continue;                        // sustratos, no manchas
  const perd=a0-a1;
  if(perd/a0<CAIDA)continue;
  // quien nace justo en ese corte, y cuanto ocupa
  const y=ps[i].start;
  const nuevos=(nacen.get(y)||[]).filter(x=>x.id!==c.id);
  const gan=nuevos.reduce((s,x)=>s+ar(x.periods[0]),0);
  // tambien los que ya existian y crecen en ese corte
  let crece=0;
  for(const x of CIV){
   if(x.id===c.id)continue;
   const q=x.periods.find(p=>p.start===y);
   if(!q)continue;
   const idx=x.periods.indexOf(q);
   if(idx<1)continue;
   const d=ar(q)-ar(x.periods[idx-1]);
   if(d>0)crece+=d;
  }
  const tomado=gan+crece;
  const demas=perd-tomado;
  if(demas<=10)continue;                    // lo que perdio lo tomo alguien
  filas.push({id:c.id,per:ps[i].start+'..'+ps[i].end,a0,a1,perd,tomado,demas,
   quien:nuevos.slice(0,3).map(x=>x.id).join(', ')||'(nadie nace aqui)'});
 }
}
filas.sort((a,b)=>b.demas-a.demas);
console.log('areas culturales que pierden mas del',(CAIDA*100).toFixed(0)+'% de su area de golpe');
console.log('y cuya perdida NO la absorbe quien aparece o crece en ese mismo corte:',filas.length,'\n');
console.log('entidad'.padEnd(24),'periodo'.padEnd(15),'area'.padStart(15),'perdio'.padStart(8),
            'tomado'.padStart(8),'DE MAS'.padStart(8),'  nace ahi');
for(const f of filas.slice(0,CUANTOS))
 console.log(f.id.padEnd(24),f.per.padEnd(15),
  (f.a0.toFixed(0)+' -> '+f.a1.toFixed(0)).padStart(15),
  f.perd.toFixed(0).padStart(8),f.tomado.toFixed(0).padStart(8),
  f.demas.toFixed(0).padStart(8),'  ',f.quien);
console.log('\nsuma de area perdida de mas:',filas.reduce((s,f)=>s+f.demas,0).toFixed(0),'grados2');
