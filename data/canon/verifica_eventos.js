#!/usr/bin/env node
// COMPRUEBA EL CANON ANTES DE QUE ENTRE EN LA APP.
//
// Lee los canon_*.js (o un events_extended.json ya construido, con --json) y
// no deja pasar: ids repetidos, titulos repetidos en el mismo anio, categoria
// o region invalida, coordenadas en el mar (mascara de tierra 1:50m, con un
// margen de un cuarto de grado para costas y puertos), region declarada que
// no cuadra con las coordenadas, anios fuera del arco, personas sin
// nacimiento. Y escribe la matriz era x region del canon de importancia 3 o
// mas, con las cuotas de CANON.md, para ver de un vistazo donde falta.
//
//   node verifica_eventos.js                 (los canon_*.js de este directorio)
//   node verifica_eventos.js --json <events_extended.json>
//   TIERRA=../tools/tierra.js (ruta a la mascara de tierra; si no esta, no se comprueba el mar)
const fs=require('fs'), path=require('path');
const CATS=['politica','guerras','ciencia','exploracion','religion','cultura','economia','sociedad','desastres','personas'];
const REGS=['europa','mena','africa','asia_oriental','asia_sur','asia_central','norteamerica','latam','oceania'];
const ERAS=[[-10000,-3000],[-3000,-1000],[-1000,500],[500,1000],[1000,1500],[1500,1700],[1700,1800],[1800,1900],[1900,1950],[1950,2026]];
const F=require('./fondo.js');
let T=null; for(const r of [process.env.TIERRA,path.join(__dirname,'..','..','tools','tierra.js'),'/tmp/tools/tierra.js']){ if(!r)continue; try{ T=require(r); break }catch(e){} }
if(!T)console.log('(sin mascara de tierra: no se comprueba el mar)');
const enTierra=(lat,lon)=>{ if(!T)return true; for(const [dx,dy] of [[0,0],[0.25,0],[-0.25,0],[0,0.25],[0,-0.25],[0.25,0.25],[-0.25,-0.25],[0.25,-0.25],[-0.25,0.25]]) if(T.enTierra([lon+dx,lat+dy]))return true; return false };

let items=[];
const JSONIN=process.argv.indexOf('--json');
if(JSONIN>0){ const E=JSON.parse(fs.readFileSync(process.argv[JSONIN+1],'utf8'));
 for(const e of E){ if(e.fondo)continue; if(e.momento==='def')continue; items.push({id:e.persona||e.id,cat:e.category,imp:e.importance,y:e.year,lat:e.lat,lon:e.lon,reg:e.reg,es:e.labels.es,en:e.labels.en,fuente:e.fuente,mar:e.mar,nac:e.momento?{y:e.year,lat:e.lat,lon:e.lon}:undefined,def:e.otro?{y:e.otro.year,lat:e.otro.lat,lon:e.otro.lon}:undefined,_archivo:'json'}) } }
else { for(const f of fs.readdirSync(__dirname).filter(f=>/^canon_.*\.js$/.test(f)).sort()){ for(const e of require(path.join(__dirname,f))){ e._archivo=f; items.push(e) } } }

const err=[], aviso=[]; const ids=new Map(); const titulos=new Map();
const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
for(const e of items){
 const donde=e._archivo+' '+e.id;
 if(!e.id||!/^[a-z0-9_]+$/.test(e.id))err.push(donde+': id invalido (minusculas, digitos y _)');
 if(ids.has(e.id))err.push(donde+': id repetido (tambien en '+ids.get(e.id)+')'); ids.set(e.id,e._archivo);
 if(!CATS.includes(e.cat))err.push(donde+': categoria invalida "'+e.cat+'"');
 if(!REGS.includes(e.reg))err.push(donde+': region invalida "'+e.reg+'"');
 if(!(e.imp>=1&&e.imp<=5))err.push(donde+': importancia invalida');
 if(!e.es)err.push(donde+': sin titulo es');
 if(e._archivo==='json'&&!e.fuente)err.push(donde+': sin fuente');
 if(e.es&&e.es.length>90)aviso.push(donde+': titulo largo ('+e.es.length+')');
 const puntos=[];
 if(e.cat==='personas'){ if(!e.nac)err.push(donde+': persona sin nac'); else puntos.push(['nac',e.nac.y,e.nac.lat,e.nac.lon]); if(e.def)puntos.push(['def',e.def.y,e.def.lat,e.def.lon]); if(e.nac&&e.def&&e.def.y<e.nac.y)err.push(donde+': muere antes de nacer'); if(e.nac&&e.def&&e.def.y-e.nac.y>110)err.push(donde+': vive mas de 110 anios') }
 else { puntos.push(['',e.y,e.lat,e.lon]); const k=e.y+'|'+norm(e.es).slice(0,24); if(titulos.has(k))err.push(donde+': mismo anio y titulo que '+titulos.get(k)); titulos.set(k,e.id) }
 for(const [m,y,lat,lon] of puntos){
  if(typeof y!=='number'||y<-10000||y>2026)err.push(donde+' '+m+': anio fuera del arco');
  if(typeof lat!=='number'||typeof lon!=='number'||Math.abs(lat)>85||Math.abs(lon)>180)err.push(donde+' '+m+': coordenadas invalidas');
  else { if(!enTierra(lat,lon)&&!e.mar)err.push(donde+' '+m+': en el mar ('+lat+','+lon+') -- si es un suceso en el mar o en un islote, marca mar:true');
   const r=F.region(lat,lon); if(e.reg&&r!==e.reg&&!(e.cat==='personas'&&m==='def'))aviso.push(donde+' '+m+': region declarada '+e.reg+' pero las coordenadas caen en '+r) } }
}
// --- matriz era x region (canon, importancia >= 3) ---------------------------------
const M={}; let total=0; const porReg={}, porEra={}, porImp={}, porCat={};
for(const e of items){ const y=e.cat==='personas'?e.nac&&e.nac.y:e.y; if(typeof y!=='number')continue; porImp[e.imp]=(porImp[e.imp]||0)+1; porCat[e.cat]=(porCat[e.cat]||0)+1; if(e.imp<3)continue;
 const er=ERAS.findIndex(([a,b])=>y>=a&&y<b); if(er<0)continue; const k=er+'|'+e.reg; M[k]=(M[k]||0)+1; total++; porReg[e.reg]=(porReg[e.reg]||0)+1; porEra[er]=(porEra[er]||0)+1 }
const pad=(s,n)=>String(s).padStart(n);
console.log('=== CANON: '+items.length+' entradas ('+Object.entries(porCat).map(([k,v])=>k+' '+v).join(', ')+')');
console.log('importancia: '+[5,4,3,2,1].map(i=>i+':'+(porImp[i]||0)).join('  '));
console.log('\nMATRIZ era x region (importancia 3+; '+total+' eventos)   minimo por celda: 6 (2 en America y Oceania antes de -3000)');
console.log('era'.padEnd(14)+REGS.map(r=>pad(r.slice(0,8),10)).join('')+pad('total',8));
let faltan=0;
for(let i=0;i<ERAS.length;i++){ let fila=(ERAS[i][0]+'..'+ERAS[i][1]).padEnd(14);
 for(const r of REGS){ const n=M[i+'|'+r]||0; const min=(i===0&&(r==='oceania'||r==='latam'||r==='norteamerica'))?2:6; const marca=n<min?'!':' '; if(n<min)faltan+=min-n; fila+=pad(n+marca,10) }
 console.log(fila+pad(porEra[i]||0,8)) }
console.log('total'.padEnd(14)+REGS.map(r=>pad(porReg[r]||0,10)).join('')+pad(total,8));
if(total){ console.log('\nCUOTAS (sobre '+total+'):');
 const pct=k=>(100*(porReg[k]||0)/total).toFixed(0)+'%';
 const cuota=[['europa','<=',25],['latam','>=',14],['africa','>=',9],['mena','>=',11],['asia_oriental','>=',11],['asia_sur','>=',9],['asia_central','>=',4],['norteamerica','<=',9],['oceania','>=',2]];
 for(const [r,op,q] of cuota){ const p=100*(porReg[r]||0)/total; const ok=op==='<='?p<=q:p>=q; console.log('  '+(ok?'ok ':'!! ')+r.padEnd(14)+pct(r).padStart(5)+'  ('+op+' '+q+'%)') }
 const pre1500=ERAS.slice(0,5).reduce((s,_,i)=>s+(porEra[i]||0),0), post1800=ERAS.slice(7).reduce((s,_,i)=>s+(porEra[i+7]||0),0), post1950=porEra[9]||0;
 console.log('  '+(pre1500/total>=0.45?'ok ':'!! ')+'antes de 1500   '+(100*pre1500/total).toFixed(0)+'%  (>= 45%)');
 console.log('  '+(post1800/total<=0.40?'ok ':'!! ')+'1800..2025      '+(100*post1800/total).toFixed(0)+'%  (<= 40%)');
 console.log('  '+(post1950/total<=0.15?'ok ':'!! ')+'1950..2025      '+(100*post1950/total).toFixed(0)+'%  (<= 15%)');
 console.log('  celdas por debajo del minimo: faltan '+faltan+' eventos en total'); }
if(aviso.length){ console.log('\nAVISOS ('+aviso.length+')'); for(const a of aviso.slice(0,30))console.log('  '+a) }
if(err.length){ console.log('\nERRORES ('+err.length+')'); for(const e of err.slice(0,60))console.log('  '+e); process.exit(1) }
console.log('\nsin errores');
