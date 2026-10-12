#!/usr/bin/env node
// EL DIBUJO DEJA DE ENSENAR LAS COSTURAS DEL DATO.
//
// Tres cambios en el renderizador de index.jsx, todos de como se pinta y
// ninguno de que se pinta:
//
//  1. LAS AREAS CULTURALES NO LLEVAN FRONTERA NITIDA. Un sustrato es "lo que
//     sobra" entre estados y vecinos: sus lados son los lados de otros, y
//     dibujarlos con la misma linea blanca que la frontera de un estado era
//     afirmar una precision que no existe. Ahora el relleno de un area cultural
//     es mas tenue y su contorno es un halo suave sin linea blanca; los
//     estados conservan la linea. Las rectas entre dos sustratos siguen en el
//     dato, pero dejan de ser lo primero que se ve.
//  2. LA TIERRA SIN ENTIDAD LLEVA UN VELO. Donde nadie pinta, el globo
//     ensenaba el satelite a pelo, y eso se lee como error. base_tierra.js
//     genera la tierra firme menos los vacios permanentes (hielo, erg,
//     Antartida); aqui se pinta con un velo neutro bajo las civilizaciones.
//     Un hueco pasa de "agujero negro" a "el mapa no tiene entidad aqui".
//     Se enciende con las areas culturales (es su fondo) y con la capa de
//     civilizaciones.
//  3. React Native manda al globo si cada territorio es area cultural
//     (`cult`) y si el velo va encendido (`baseOn`), y al cargar el WebView le
//     manda los anillos del velo una sola vez (TIERRA_BASE).
//
//   node render_base.js <index.jsx> [--aplica]
// Idempotente: si ya esta aplicado solo renueva TIERRA_BASE.
const fs=require('fs');
const ruta=process.argv[2]; const APLICA=process.argv.includes('--aplica');
let src=fs.readFileSync(ruta,'utf8');
const base=JSON.parse(fs.readFileSync(__dirname+'/base_tierra.json','utf8'));
const CONST='const TIERRA_BASE = '+JSON.stringify(base)+';';
function cuenta(s,a){ let n=0,i=0; while((i=s.indexOf(a,i))>=0){n++;i+=a.length} return n }
const parches=[];
function parche(nombre,ancla,nuevo){ parches.push({nombre,ancla,nuevo}) }

// --- las paredes de las ranuras no son fronteras -------------------------------
// recorte.parte abre cada agujero con una ranura vertical de cuatro centesimas
// hasta el borde. La prueba de "relleno a los dos lados" miraba a tres
// centesimas del medio de la arista: a un lado el territorio, al otro el
// canal vacio de la ranura... y la pared se dibujaba. De ahi las lineas
// paralelas que suben desde cada enclave hasta el borde del territorio. Se
// mira a cinco centesimas, que ya es el otro lado del canal, y se admite
// desde una decima de grado de largo (una ranura puede ser corta).
const RANURA=[
 ["    if(len<0.3)return false;\n    if(Math.abs(dx)>1e-9 && Math.abs(dy)>1e-9)return false;   // ni vertical ni horizontal",
  "    if(len<0.1)return false;\n    if(Math.abs(dx)>1e-9 && Math.abs(dy)>1e-9)return false;   // ni vertical ni horizontal"],
 ["    var nx=-dy/len*0.03, ny=dx/len*0.03;","    var nx=-dy/len*0.05, ny=dx/len*0.05;   // mas alla del canal de la ranura (0,04)"],
];
// --- y el canal de la ranura se cierra al pintar ----------------------------------
// Ocultar las paredes no basta: el canal de cuatro centesimas sigue sin
// relleno y se ve como un pelo oscuro desde cada enclave hasta el borde (el
// "bocadillo" del Rub al-Jali). El dato se queda como esta -un anillo con
// ranura, que es lo que entienden todas las herramientas-, y el renderizador,
// que es el unico que necesita agujeros de verdad, los reconstruye: dos
// paredes verticales de la misma altura a cuatro centesimas son una ranura;
// el arco que cuelga de sus extremos de abajo es el agujero, el resto es el
// contorno. Earcut triangula contorno con agujeros, y el canal desaparece.
RANURA.push(
 ["function triangulatePolygon(ring){\n  var pts=ring.slice();\n  if(pts.length>1){\n    var f=pts[0], l=pts[pts.length-1];\n    if(f[0]===l[0]&&f[1]===l[1]) pts=pts.slice(0,-1);\n  }\n  var n=pts.length;\n  if(n<3) return { pts:pts, tris:[] };\n  if(n===3) return { pts:pts, tris:[[0,1,2]] };",
  "function abreAnillo(r){ var p=r.slice(); if(p.length>1){ var f=p[0], l=p[p.length-1]; if(f[0]===l[0]&&f[1]===l[1]) p=p.slice(0,-1); } return p; }\nfunction triangulatePolygon(ring, holes){\n  var pts=abreAnillo(ring), hi=[];\n  if(holes) for(var h=0;h<holes.length;h++){ var hp=abreAnillo(holes[h]); if(hp.length<3)continue; hi.push(pts.length); pts=pts.concat(hp); }\n  var n=pts.length;\n  if(n<3) return { pts:pts, tris:[] };\n  if(n===3&&!hi.length) return { pts:pts, tris:[[0,1,2]] };"],
 ["  var idx=__earcut(plano);","  var idx=__earcut(plano, hi.length?hi:undefined);"],
 ["function fillVertsFromRing(ring, radius){\n  var t=triangulatePolygon(ring);","function fillVertsFromRing(ring, radius, holes){\n  var t=triangulatePolygon(ring, holes);"],
 ["    var crudo=ringsList[ri];\n    var ring=densifyRing(crudo,4);","    var crudo=ringsList[ri];\n    var san=sanarRanuras(crudo);\n    var ring=densifyRing(san.outer,4);"],
 ["    var fv=fillVertsFromRing(ring,1.014);","    var fv=fillVertsFromRing(ring,1.014,san.holes.map(function(h){return densifyRing(h,4);}));"],
 ["function construirCivil(civ,ringsList){",
`// Reconstruye los agujeros de un anillo con ranuras (recorte.parte): dos
// paredes verticales a cuatro centesimas, de sentidos opuestos y con altura
// en comun, son una ranura. El arco que cuelga de sus extremos de abajo es el
// agujero; el resto, el contorno. Se repite por si hay varias (o anidadas).
function sanarRanuras(crudo){
  var outer=abreAnillo(crudo), holes=[], guard=0;
  while(guard++<16){
    var n=outer.length, walls=[];
    for(var i=0;i<n;i++){ var a=outer[i], b=outer[(i+1)%n];
      if(Math.abs(a[0]-b[0])<1e-9 && Math.abs(a[1]-b[1])>=0.04) walls.push({i:i,x:a[0],y0:Math.min(a[1],b[1]),y1:Math.max(a[1],b[1]),up:b[1]>a[1]}); }
    var found=null;
    for(var p=0;p<walls.length&&!found;p++)for(var q=p+1;q<walls.length&&!found;q++){
      var A=walls[p],B=walls[q]; var dx=Math.abs(A.x-B.x);
      if(dx<0.03||dx>0.05||A.up===B.up)continue;
      if(Math.min(A.y1,B.y1)-Math.max(A.y0,B.y0)<0.04)continue;
      // los dos arcos entre las paredes: uno es el agujero y el otro el
      // contorno. Se prueba en los dos sentidos y se exige que el agujero
      // sea mas chico y este dentro del contorno; si no, no era una ranura
      // (una astilla de cuatro centesimas de ancho tambien tiene dos paredes)
      var arco=function(desde,hasta){ var o=[], k=(desde+1)%n, c=0; while(c++<=n){ o.push(outer[k]); if(k===hasta)break; k=(k+1)%n; } return o; };
      var a1=arco(A.i,B.i), a2=arco(B.i,A.i);
      var cand=[[a1,a2],[a2,a1]];
      for(var v=0;v<2&&!found;v++){ var h=cand[v][0], o=cand[v][1];
        if(o.length<3)continue;
        // un canal sin agujero al fondo (el agujero se rellenó o se recortó)
        // es una muesca de cuatro centesimas: se cierra y no deja nada
        if(h.length<3){ found=[null,o]; break; }
        var ah=areaPlana(h), ao=areaPlana(o);
        if(ah>=ao*0.8)continue;
        if(!puntoEnAnillo(h[Math.floor(h.length/2)],o))continue;
        found=[h,o]; } }
    if(!found)break;
    if(found[0])holes.push(found[0]); outer=found[1];
  }
  return {outer:outer, holes:holes};
}
function areaPlana(r){ var a=0; for(var i=0,j=r.length-1;i<r.length;j=i++)a+=(r[j][0]+r[i][0])*(r[j][1]-r[i][1]); return Math.abs(a/2); }
function puntoEnAnillo(pt,r){ var d=false; for(var i=0,j=r.length-1;i<r.length;j=i++){ if((r[i][1]>pt[1])!==(r[j][1]>pt[1]) && pt[0]<(r[j][0]-r[i][0])*(pt[1]-r[i][1])/(r[j][1]-r[i][1])+r[i][0]) d=!d; } return d; }
function construirCivil(civ,ringsList){`]
);
let nRan=0; for(const [a,b] of RANURA){ if(cuenta(src,a)===1){ src=src.replace(a,()=>b); nRan++ } }
if(nRan)console.log('   ok paredes de ranura ('+nRan+' de '+RANURA.length+')');

if(src.includes('const TIERRA_BASE = ')){
 src=src.replace(/const TIERRA_BASE = \[[^\n]*\];/,CONST);
 console.log('ya aplicado: solo se renueva TIERRA_BASE ('+base.length+' anillos)');
 if(APLICA){ fs.writeFileSync(ruta,src); console.log('escrito '+ruta) } process.exit(0);
}

// --- React Native ---------------------------------------------------------------
parche('cult en el payload',
 "const base = { id:c.id, k, color:c.color, opacity:c.opacity, inc:c.inc, name:c.etiqueta || c.baseName };",
 "const base = { id:c.id, k, color:c.color, opacity:c.opacity, inc:c.inc, cult:c.kind==='cultura'?1:0, name:c.etiqueta || c.baseName };");
parche('baseOn en updateProcesses',
 "type:'updateProcesses', layers, civils, routes, wars, migration, religion, languages,",
 "type:'updateProcesses', layers, civils, routes, wars, migration, religion, languages, baseOn: layers.showCultures !== false,");
parche('envio de TIERRA_BASE al cargar',
 "globeRef.current?.postMessage(JSON.stringify({ type:'revLoad' }));\n      // Reaplicar el modo mapa 2D",
 "globeRef.current?.postMessage(JSON.stringify({ type:'revLoad' }));\n      globeRef.current?.postMessage(JSON.stringify({ type:'baseTierra', rings:TIERRA_BASE }));\n      // Reaplicar el modo mapa 2D");
parche('constante TIERRA_BASE',
 "const REVISION_ORDEN = ",
 CONST+"\nconst REVISION_ORDEN = ");
// --- WebView ----------------------------------------------------------------------
parche('mensaje baseTierra',
 "else if(msg.type==='revSave'){",
 "else if(msg.type==='baseTierra'){ baseTierraRings=msg.rings||[]; construirBaseTierra(); }\n    else if(msg.type==='revSave'){");
parche('estado baseOn',
 "state.wonders_names=!!msg.wondersNamesOn;",
 "state.wonders_names=!!msg.wondersNamesOn;\n  state.baseOn=msg.baseOn!==false;");
parche('visibilidad del velo',
 "rebuildCivils(msg.civils||[]);",
 "rebuildCivils(msg.civils||[]);\n  if(baseTierraMesh)baseTierraMesh.visible=!!state.civilizations&&state.baseOn!==false;");
parche('velo al cambiar de proyeccion',
 "try{if(lastProcMsg)applyProcesses(lastProcMsg);}catch(_){}",
 "try{construirBaseTierra();}catch(_){}\n  try{if(lastProcMsg)applyProcesses(lastProcMsg);}catch(_){}");
parche('malla del velo y lineas de sustrato',
 "function crearMallasCivs(){",
`// ── El velo de la tierra sin entidad ──────────────────────────────────────
// Anillos de base_tierra.js (tierra firme menos vacios permanentes), pintados
// una vez por proyeccion a un radio por debajo de las civilizaciones. Normal
// blending y poca opacidad: un velo, no una capa.
var baseTierraRings=[],baseTierraMesh=null;
function construirBaseTierra(){
  if(baseTierraMesh){procesGroup.remove(baseTierraMesh);baseTierraMesh.geometry.dispose();baseTierraMesh.material.dispose();baseTierraMesh=null;}
  if(!baseTierraRings.length)return;
  var verts=[];
  for(var i=0;i<baseTierraRings.length;i++){
    var fv=fillVertsFromRing(densifyRing(baseTierraRings[i],4),1.011);
    for(var a=0;a<fv.length;a++)verts.push(fv[a]);
  }
  var geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(verts),3));
  geo.computeBoundingSphere();
  baseTierraMesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xcbbd9e,transparent:true,opacity:0.20,side:THREE.DoubleSide,depthWrite:false}));
  baseTierraMesh.renderOrder=1;
  baseTierraMesh.visible=!!state.civilizations&&state.baseOn!==false;
  procesGroup.add(baseTierraMesh);
}
// Las aristas de las areas culturales van en su propia geometria, con un solo
// halo tenue y sin la linea blanca: el contorno de un sustrato no es una
// frontera medida.
var civLineasCult=null;
function crearMallasCivs(){`);
parche('geometria de lineas de sustrato',
 "  civLineas=capas.map(function(c){",
 "  var gC=new THREE.BufferGeometry();\n  civLineasCult=new THREE.LineSegments(gC,new THREE.LineBasicMaterial({vertexColors:true,opacity:0.30,transparent:true,blending:THREE.AdditiveBlending}));\n  civLineasCult.scale.setScalar(1.014);civLineasCult.renderOrder=3;procesGroup.add(civLineasCult);\n  civLineas=capas.map(function(c){");
parche('ocultar lineas de sustrato',
 "  if(civFillMesh)civFillMesh.visible=false;",
 "  if(civFillMesh)civFillMesh.visible=false;\n  if(civLineasCult)civLineasCult.visible=false;");
parche('contar lineas de sustrato',
 "for(var o=0;o<orden.length;o++){nF+=orden[o].fp.length;nL+=orden[o].lp.length;nP+=(orden[o].pp?orden[o].pp.length:0);}",
 "var nQ=0;\n  for(var o=0;o<orden.length;o++){nF+=orden[o].fp.length;nL+=orden[o].lp.length;nP+=(orden[o].pp?orden[o].pp.length:0);nQ+=(orden[o].lq?orden[o].lq.length:0);}\n  var QP=new Float32Array(nQ),QC=new Float32Array(nQ),offQ=0;");
parche('concatenar lineas de sustrato',
 "LP.set(e2.lp,offL);LC.set(e2.lc,offL);offL+=e2.lp.length;",
 "LP.set(e2.lp,offL);LC.set(e2.lc,offL);offL+=e2.lp.length;\n    if(e2.lq&&e2.lq.length){QP.set(e2.lq,offQ);QC.set(e2.lqc,offQ);offQ+=e2.lq.length;}");
parche('subir lineas de sustrato',
 "for(var g3=0;g3<civLineas.length;g3++)civLineas[g3].visible=nL>0;",
 "for(var g3=0;g3<civLineas.length;g3++)civLineas[g3].visible=nL>0;\n  if(civLineasCult){ponerAtributo(civLineasCult.geometry,'position',QP,3);ponerAtributo(civLineasCult.geometry,'color',QC,3);civLineasCult.visible=nQ>0;}");
parche('color de relleno de sustrato',
 "var colF = inc ? {r:col.r*0.74+0.05, g:col.g*0.74+0.05, b:col.b*0.74+0.06} : col;",
 "var cult = !!civ.cult;\n  var colF = inc ? {r:col.r*0.74+0.05, g:col.g*0.74+0.05, b:col.b*0.74+0.06} : col;\n  if(cult) colF = {r:colF.r*0.72, g:colF.g*0.72, b:colF.b*0.72};");
parche('arrays de lineas de sustrato',
 "var fp=[],fc=[],lp=[],lc=[],pp=[],pc=[],etiqueta=null;",
 "var fp=[],fc=[],lp=[],lc=[],pp=[],pc=[],lq=[],lqc=[],etiqueta=null;");
parche('aristas de sustrato a su geometria',
 "          lp.push(vprev.x,vprev.y,vprev.z,vnext.x,vnext.y,vnext.z);\n          lc.push(colF.r,colF.g,colF.b,colF.r,colF.g,colF.b);",
 "          if(cult){ lq.push(vprev.x,vprev.y,vprev.z,vnext.x,vnext.y,vnext.z); lqc.push(colF.r,colF.g,colF.b,colF.r,colF.g,colF.b); }\n          else { lp.push(vprev.x,vprev.y,vprev.z,vnext.x,vnext.y,vnext.z); lc.push(colF.r,colF.g,colF.b,colF.r,colF.g,colF.b); }");
parche('devolver lineas de sustrato',
 "lp:new Float32Array(lp),lc:new Float32Array(lc),",
 "lp:new Float32Array(lp),lc:new Float32Array(lc),\n    lq:new Float32Array(lq),lqc:new Float32Array(lqc),");

let ok=true;
for(const p of parches){ const n=cuenta(src,p.ancla); if(n!==1){ console.log('   ?? ancla '+(n===0?'no encontrada':'repetida x'+n)+': '+p.nombre); ok=false } }
if(!ok){ console.log('no se aplica nada'); process.exit(1) }
for(const p of parches){ src=src.replace(p.ancla,()=>p.nuevo); console.log('   ok '+p.nombre) }
console.log(parches.length+' parches; TIERRA_BASE con '+base.length+' anillos');
if(APLICA){ fs.writeFileSync(ruta,src); console.log('escrito '+ruta) } else console.log('(sin --aplica no se escribe)');
