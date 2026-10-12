#!/usr/bin/env node
/*
 * bluedot.js — utilidad para editar a mano los datos de BlueDot
 * Sin dependencias. Node 16+.
 *
 *   node bluedot.js abrir  [app/index.jsx] [civs.json]
 *       Extrae CIVILIZATIONS a un JSON legible (coordenadas [lon,lat] normales).
 *
 *   node bluedot.js guardar [civs.json] [app/index.jsx]
 *       Vuelve a meter el JSON en index.jsx, comprimido como lo espera la app.
 *
 *   node bluedot.js lista  [app/index.jsx] [filtro]
 *       Lista civilizaciones y periodos. El filtro es texto o "lon1,lat1,lon2,lat2".
 *
 *   node bluedot.js revisar [app/index.jsx] lon1,lat1,lon2,lat2 [año,año,...]
 *       Busca solapes (dos civs en la misma celda) y huecos en una caja y unos años.
 *
 *   node bluedot.js quien  [app/index.jsx] lon,lat año
 *       Dice qué civilizaciones ocupan ese punto ese año.
 */
const fs=require('fs');
const A=process.argv.slice(2);
const cmd=A[0]||'ayuda';
const JSX=(x,d)=>x&&x.endsWith('.jsx')?x:d;

function bloque(src){
  const m=src.indexOf('const CIVILIZATIONS'); if(m<0)throw new Error('No encuentro const CIVILIZATIONS');
  const s=src.indexOf('[',m); let d=0,i=s;
  for(;;i++){const c=src[i]; if(c==='[')d++; else if(c===']'){d--; if(d===0)break}}
  return {txt:src.slice(s,i+1),a:s,b:i};
}
function decRing(t){const o=[];let px=0,py=0;
  for(const q of t.split(';')){if(!q)continue;const c=q.indexOf(',');
    px+=parseInt(q.slice(0,c),36);py+=parseInt(q.slice(c+1),36);o.push([px/100,py/100])}return o}
const B36=n=>(n<0?'-':'')+Math.abs(n).toString(36);
function encRing(r){let px=0,py=0,s='';
  for(const p of r){const x=Math.round(p[0]*100),y=Math.round(p[1]*100);
    s+=B36(x-px)+','+B36(y-py)+';';px=x;py=y}return s}
function cargar(path){
  const src=fs.readFileSync(path,'utf8');
  const R=bloque(src);
  const CIV=eval(R.txt);
  // Formato nuevo: los anillos viven una sola vez en __RG y cada periodo los
  // referencia por indice en base36. Se admite tambien el formato viejo
  // (deltas escritos en linea, separados por '|').
  const g=src.indexOf('const __RG');
  let DIC=null;
  if(g>=0&&g<R.a){
    const a=src.indexOf('[',g); let d=0,i=a;
    for(;;i++){const c=src[i]; if(c==='[')d++; else if(c===']'){d--; if(d===0)break}}
    DIC=eval(src.slice(a,i+1)).map(decRing);
  }
  for(const c of CIV)for(const p of c.periods){
    if(typeof p.rings!=='string')continue;
    if(!p.rings.length){p.rings=[];continue}
    p.rings = DIC ? p.rings.split(',').map(k=>DIC[parseInt(k,36)].map(q=>q.slice()))
                  : p.rings.split('|').map(decRing);
  }
  return {src,R,CIV};
}
function escribir(src,R,CIV,path){
  const esc=s=>String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  // Diccionario de anillos: cada silueta se escribe una vez. Sin esto el 62%
  // del archivo eran copias literales del mismo contorno.
  const idx=new Map(), dic=[];
  for(const c of CIV)for(const p of c.periods)for(const r of p.rings){
    const e=encRing(r); if(!idx.has(e)){idx.set(e,dic.length); dic.push(e)}
  }
  const lineas=CIV.map(c=>{
    const per=c.periods.map(p=>{
      const ids=p.rings.map(r=>idx.get(encRing(r)).toString(36)).join(',');
      const f=['start:'+p.start,'end:'+p.end,"rings:'"+ids+"'"];
      if(p.wikiTitle)f.push("wikiTitle:'"+esc(p.wikiTitle)+"'");
      if(p.name)f.push("name:'"+esc(p.name)+"'");
      return '{ '+f.join(', ')+' }'}).join(',\n      ');
    const cf=["id:'"+c.id+"'","name:'"+esc(c.name)+"'","color:'"+c.color+"'"];
    if(c.wikiTitle)cf.push("wikiTitle:'"+esc(c.wikiTitle)+"'");
    return '  { '+cf.join(', ')+',\n    periods:[\n      '+per+'\n    ] }'}).join(',\n');
  let out=src.slice(0,R.a)+'[\n'+lineas+'\n]'+src.slice(R.b+1);
  const nuevoDic='const __RG = [\n'+dic.map(e=>"'"+e+"'").join(',\n')+'\n];';
  const g=out.indexOf('const __RG');
  if(g>=0){
    const a=out.indexOf('[',g); let d=0,i=a;
    for(;;i++){const c=out[i]; if(c==='[')d++; else if(c===']'){d--; if(d===0)break}}
    out=out.slice(0,g)+nuevoDic+out.slice(out.indexOf(';',i)+1);
  } else {
    const pos=out.indexOf('const CIVILIZATIONS');
    out=out.slice(0,pos)+nuevoDic+'\n'+out.slice(pos);
  }
  fs.writeFileSync(path,out);
  return dic.length;
}
const pip=(pt,r)=>{let[x,y]=pt,I=false;
  for(let i=0,j=r.length-1;i<r.length;j=i++){const[a,b]=r[i],[c,d]=r[j];
    if((b>y)!=(d>y)&&x<(c-a)*(y-b)/(d-b)+a)I=!I}return I};
const quien=(CIV,pt,y)=>{const o=[];
  for(const c of CIV)for(const p of c.periods)if(y>=p.start&&y<p.end)
    for(const r of p.rings)if(pip(pt,r)){o.push(c.id);break}
  return o};
const area=r=>{let a=0;for(let i=0;i<r.length;i++){const j=(i+1)%r.length;
  a+=r[i][0]*r[j][1]-r[j][0]*r[i][1]}return Math.abs(a/2)};
const caja=r=>r.reduce((a,q)=>[Math.min(a[0],q[0]),Math.min(a[1],q[1]),Math.max(a[2],q[0]),Math.max(a[3],q[1])],[9e9,9e9,-9e9,-9e9]);

if(cmd==='abrir'){
  const inp=JSX(A[1],'app/index.jsx'), out=A[2]||'civs.json';
  const {CIV}=cargar(inp);
  fs.writeFileSync(out,JSON.stringify(CIV,null,1));
  console.log(`${CIV.length} civilizaciones -> ${out}`);
  console.log('Edita ese archivo y luego: node bluedot.js guardar '+out+' '+inp);
}
else if(cmd==='guardar'){
  const inp=A[1]||'civs.json', dst=JSX(A[2],'app/index.jsx');
  const CIV=JSON.parse(fs.readFileSync(inp,'utf8'));
  const {src,R}=cargar(dst);
  // validaciones antes de escribir
  const errs=[];
  for(const c of CIV){
    if(!c.id||!c.name||!c.color)errs.push('civ sin id/name/color: '+JSON.stringify(c.id));
    if(!Array.isArray(c.periods)||!c.periods.length)errs.push(c.id+': sin periodos');
    for(const p of c.periods||[]){
      if(!(p.end>p.start))errs.push(c.id+': periodo invertido '+p.start+'-'+p.end);
      for(const r of p.rings||[]) if(r.length<3)errs.push(c.id+': anillo con '+r.length+' puntos');
    }
  }
  if(errs.length){console.error('NO se guardó. Errores:');errs.slice(0,20).forEach(e=>console.error(' -',e));process.exit(1)}
  const n=escribir(src,R,CIV,dst);
  console.log(`${CIV.length} civilizaciones -> ${dst}  (${n} anillos unicos en el diccionario)`);
}
else if(cmd==='lista'){
  const inp=JSX(A[1],'app/index.jsx'), f=A[2];
  const {CIV}=cargar(inp);
  let box=null;
  if(f&&/^-?[\d.]+,-?[\d.]+,-?[\d.]+,-?[\d.]+$/.test(f))box=f.split(',').map(Number);
  for(const c of CIV){
    if(box){const dentro=c.periods.some(p=>p.rings.some(r=>{const b=caja(r);
      return !(b[0]>box[2]||b[2]<box[0]||b[1]>box[3]||b[3]<box[1])}));if(!dentro)continue}
    else if(f&&!(c.id+' '+c.name).toLowerCase().includes(f.toLowerCase()))continue;
    console.log(c.id.padEnd(22),c.name);
    for(const p of c.periods)
      console.log('   ',String(p.start).padStart(6)+'-'+String(p.end).padEnd(6),
        p.rings.length+' anillo(s),',p.rings.reduce((a,r)=>a+r.length,0)+' pts,',
        p.rings.reduce((a,r)=>a+area(r),0).toFixed(1)+' grados²  ',p.name||'');
  }
}
else if(cmd==='revisar'){
  const inp=JSX(A[1],'app/index.jsx');
  const box=(A[2]||'-20,-36,55,38').split(',').map(Number);
  const years=(A[3]||'500,1000,1500,1700,1850,1900,1950,2010').split(',').map(Number);
  const {CIV}=cargar(inp);
  const paso=+(A[4]||1);
  for(const y of years){
    let vac=0,tot=0;const dob={};
    for(let lon=box[0];lon<box[2];lon+=paso)for(let lat=box[1];lat<box[3];lat+=paso){
      const pt=[lon+paso/2,lat+paso/2];
      const hoy=quien(CIV,pt,2010); if(!hoy.length)continue; tot++;
      const w=quien(CIV,pt,y);
      if(!w.length)vac++;
      if(w.length>1){for(let i=0;i<w.length;i++)for(let j=i+1;j<w.length;j++){
        const k=[w[i],w[j]].sort().join(' + ');dob[k]=(dob[k]||0)+1}}
    }
    const nd=Object.values(dob).reduce((a,b)=>a+b,0);
    console.log(String(y).padStart(6),
      'sin dueño '+String(Math.round(vac/tot*100)).padStart(3)+'% ('+vac+'/'+tot+')',
      '| solapes '+nd, nd?JSON.stringify(dob):'');
  }
}
else if(cmd==='quien'){
  const inp=JSX(A[1],'app/index.jsx');
  const pt=(A[2]||'0,0').split(',').map(Number), y=+(A[3]||2010);
  const {CIV}=cargar(inp);
  const w=quien(CIV,pt,y);
  console.log(pt.join(','),'en',y+':',w.length?w.join(', '):'(sin dueño)');
  for(const id of w){const c=CIV.find(x=>x.id===id);
    const p=c.periods.find(p=>y>=p.start&&y<p.end);
    console.log('  ',c.name,'—',p.name||'',`(${p.start}-${p.end})`)}
}
else{
  console.log(fs.readFileSync(__filename,'utf8').split('*/')[0].split('/*')[1]);
}
