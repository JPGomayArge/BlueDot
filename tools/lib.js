// Carga y guarda el bloque CIVILIZATIONS de app/index.jsx.
// Los anillos se guardan una sola vez en el diccionario __RG y cada periodo
// los referencia por indice en base 36; asi el archivo baja de 30 MB a 6.
const fs=require('fs');
const RUTA_POR_DEFECTO=process.env.BLUEDOT_JSX||require('path').join(__dirname,'..','app','index.jsx');

function decRing(t){const out=[];let px=0,py=0;const parts=t.split(';');
 for(let k=0;k<parts.length;k++){const q=parts[k];if(!q)continue;const c=q.indexOf(',');
  px+=parseInt(q.slice(0,c),36);py+=parseInt(q.slice(c+1),36);out.push([px/100,py/100])}return out}
const B36=n=>(n<0?'-':'')+Math.abs(n).toString(36);
function encRing(r){let px=0,py=0,s='';for(const p of r){const x=Math.round(p[0]*100),y=Math.round(p[1]*100);s+=B36(x-px)+','+B36(y-py)+';';px=x;py=y}return s}

function rawBlock(src){const m=src.indexOf('const CIVILIZATIONS');const s=src.indexOf('[',m);let d=0,i=s;
 for(;;i++){const c=src[i];if(c==='[')d++;else if(c===']'){d--;if(d===0)break}}return {txt:src.slice(s,i+1),a:s,b:i}}

function load(path){
 const p=path||RUTA_POR_DEFECTO;
 const src=fs.readFileSync(p,'utf8');
 const R=rawBlock(src);const CIV=eval(R.txt);
 const g=src.indexOf('const __RG');let DIC=null;
 if(g>=0&&g<R.a){const a=src.indexOf('[',g);let d=0,i=a;
  for(;;i++){const c=src[i];if(c==='[')d++;else if(c===']'){d--;if(d===0)break}}
  DIC=eval(src.slice(a,i+1)).map(decRing);}
 for(const cv of CIV)for(const pe of cv.periods){
  if(typeof pe.rings!=='string')continue;
  if(!pe.rings.length){pe.rings=[];continue}
  pe.rings = DIC ? pe.rings.split(',').map(k=>DIC[parseInt(k,36)].map(q=>q.slice()))
                 : pe.rings.split('|').map(decRing);}
 return {src,CIV,R,ruta:p};
}

function save(src,R,CIV,path){
 const p=path||RUTA_POR_DEFECTO;
 const esc=s=>String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
 const idx=new Map(),dic=[];
 for(const c of CIV)for(const pe of c.periods)for(const r of pe.rings){
  const e=encRing(r); if(!idx.has(e)){idx.set(e,dic.length);dic.push(e)} }
 const lines=CIV.map(c=>{const per=c.periods.map(pe=>{
   const ids=pe.rings.map(r=>idx.get(encRing(r)).toString(36)).join(',');
   const f=['start:'+pe.start,'end:'+pe.end,"rings:'"+ids+"'"];
   if(pe.wikiTitle)f.push("wikiTitle:'"+esc(pe.wikiTitle)+"'");
   if(pe.name)f.push("name:'"+esc(pe.name)+"'");
   // inc:1 marca un periodo cuyo contorno es un relleno y no una frontera
   // conocida. El renderizador lo dibuja apagado y a trazos.
   if(pe.inc)f.push("inc:1");
   return '{ '+f.join(', ')+' }'}).join(',\n      ');
  const cf=["id:'"+c.id+"'"];
  // kind:'cultura' distingue las areas culturales de las entidades politicas
  if(c.kind)cf.push("kind:'"+c.kind+"'");
  cf.push("name:'"+esc(c.name)+"'","color:'"+c.color+"'");
  // etiqueta: el rotulo corto del globo. El nombre largo se queda para la ficha.
  if(c.etiqueta)cf.push("etiqueta:'"+esc(c.etiqueta)+"'");
  if(c.wikiTitle)cf.push("wikiTitle:'"+esc(c.wikiTitle)+"'");
  return '  { '+cf.join(', ')+',\n    periods:[\n      '+per+'\n    ] }'}).join(',\n');
 let out=src.slice(0,R.a)+'[\n'+lines+'\n]'+src.slice(R.b+1);
 const nuevoDic='const __RG = [\n'+dic.map(e=>"'"+e+"'").join(',\n')+'\n];\n';
 const g=out.indexOf('const __RG');
 if(g>=0){const a=out.indexOf('[',g);let d=0,i=a;
  for(;;i++){const c=out[i];if(c==='[')d++;else if(c===']'){d--;if(d===0)break}}
  const fin=out.indexOf(';',i)+1;
  out=out.slice(0,g)+nuevoDic.trim()+out.slice(fin);
 }else{const pos=out.indexOf('const CIVILIZATIONS');out=out.slice(0,pos)+nuevoDic+out.slice(pos)}
 fs.writeFileSync(p,out);return out;
}

// punto en poligono, por cruce de rayos
function pip(pt,r){let[x,y]=pt,I=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const[a,b]=r[i],[c,d]=r[j];if((b>y)!=(d>y)&&x<(c-a)*(y-b)/(d-b)+a)I=!I}return I}
// el motor rellena por paridad: un punto esta dentro si lo contiene un numero impar de anillos
const has=(rs,pt)=>rs.filter(r=>pip(pt,r)).length%2===1;
function quien(CIV,pt,yr){const o=[];for(const c of CIV){const p=c.periods.find(p=>yr>=p.start&&yr<p.end);
 if(p&&has(p.rings,pt))o.push(c.id)}return o}
function rA(r){let a=0;for(let i=0;i<r.length;i++){const j=(i+1)%r.length;a+=r[i][0]*r[j][1]-r[j][0]*r[i][1]}return Math.abs(a/2)}
function bb(r){let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const p of r){if(p[0]<a)a=p[0];if(p[0]>b)b=p[0];if(p[1]<c)c=p[1];if(p[1]>d)d=p[1]}return[a,b,c,d]}
const cruza=(x,y)=>!(x[1]<y[0]||y[1]<x[0]||x[3]<y[2]||y[3]<x[2]);
function caja(c){let a=1e9,b=-1e9,x=1e9,d=-1e9;for(const p of c.periods)for(const r of p.rings){const q=bb(r);
 if(q[0]<a)a=q[0];if(q[1]>b)b=q[1];if(q[2]<x)x=q[2];if(q[3]>d)d=q[3]}return[a,b,x,d]}

module.exports={load,save,decRing,encRing,rawBlock,pip,has,quien,rA,bb,cruza,caja,RUTA_POR_DEFECTO};
