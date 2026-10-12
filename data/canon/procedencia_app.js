#!/usr/bin/env node
// PROCEDENCIA Y CORRECCIONES EN LA APP.
//
// BlueDot quiere ser consultable y auditable por cualquiera, como una
// enciclopedia abierta. Este parche pone en index.jsx lo que eso necesita en
// la pantalla:
//   1. la version de los datos en "Acerca de" (para poder citarla) y el enlace
//      al repositorio publico, con su licencia
//   2. en cada ficha de evento: de donde sale el dato, cuando entro y si
//      alguien lo reviso; y el boton "Proponer una correccion", que abre un
//      issue de GitHub ya rellenado con el formulario de correccion
//   3. lo mismo en la ficha de civilizacion (fuente del periodo y boton)
// Sin servidor: GitHub guarda la propuesta, la discusion y el historial.
//
//   node procedencia_app.js <index.jsx> [--aplica]   REPO=https://github.com/<usuario>/BlueDot
const fs=require('fs'); const ruta=process.argv[2]; const APLICA=process.argv.includes('--aplica');
const REPO=process.env.REPO||'https://github.com/JPGomayArge/BlueDot';
let ver={}; try{ ver=JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','eventos_version.json'),'utf8')) }catch(e){ try{ ver=JSON.parse(fs.readFileSync('/tmp/ev/eventos_version.json','utf8')) }catch(e2){} }
let src=fs.readFileSync(ruta,'utf8');
const cuenta=(s,a)=>{ let n=0,i=0; while((i=s.indexOf(a,i))>=0){n++;i+=a.length} return n };
const VERSION="const DATOS_VERSION = { fecha:'"+(ver.fecha||'2026-10-12')+"', eventos:"+(ver.eventos||0)+", canon:"+(ver.canon||0)+", fondo:"+(ver.fondo||0)+", civilizaciones:'build28c' };";
if(src.includes('const DATOS_VERSION = ')){ src=src.replace(/const DATOS_VERSION = \{[^\n]*\};/,VERSION); src=src.replace(/const REPO_URL = '[^']*';/,"const REPO_URL = '"+REPO+"';"); console.log('ya aplicado: se renuevan DATOS_VERSION y REPO_URL'); if(APLICA){ fs.writeFileSync(ruta,src); console.log('escrito '+ruta) } process.exit(0) }
const P=[]; const parche=(n,a,b)=>P.push({n,a,b});

parche('constantes y componentes de procedencia',
"const INFO_SECTIONS = [",
`// ─── Procedencia y correcciones ──────────────────────────────────────────────
// BlueDot es consultable y auditable: cada dato dice de dónde sale, cuándo
// entró y si alguien lo revisó, y cualquiera puede proponer una corrección.
// La propuesta se abre como issue en el repositorio público, ya rellenada con
// el formulario de corrección (sin servidor propio: GitHub guarda la
// propuesta, la discusión y el historial de cambios).
const REPO_URL = '${REPO}';
${VERSION}
function urlCorreccion(tipo, id, titulo, contexto) {
  const q = (s) => encodeURIComponent(String(s == null ? '' : s));
  return REPO_URL + '/issues/new?template=correccion.yml&title=' + q('[' + tipo + '] ' + titulo)
    + '&tipo=' + q(tipo) + '&identificador=' + q(id) + '&contexto=' + q(contexto || '');
}
function fuenteLegible(f) {
  if (!f) return 'sin fuente registrada';
  if (f.startsWith('wikipedia:')) return 'Wikipedia (' + f.slice(10) + ')';
  if (f.startsWith('wikidata:')) return 'Wikidata ' + f.slice(9);
  if (f === 'wikidata') return 'Wikidata';
  return f;
}
function ProcedenciaLinea({ fuente, alta, revisado }) {
  const rev = revisado && revisado.por ? ('revisado por ' + revisado.por + (revisado.fecha ? ' el ' + revisado.fecha : '')) : 'sin revisar';
  return (
    <Text style={{ color:'rgba(255,255,255,0.45)', fontSize:11, marginTop:12, lineHeight:16 }}>
      {'Fuente: ' + fuenteLegible(fuente) + (alta ? ' · alta ' + alta : '') + ' · ' + rev}
    </Text>
  );
}
function BotonCorreccion({ color, tipo, id, titulo, contexto }) {
  return (
    <TouchableOpacity
      style={[cardStyles.wikiBtn, { borderColor: color + '44', marginHorizontal:0, marginTop:8 }]}
      onPress={() => Linking.openURL(urlCorreccion(tipo, id, titulo, contexto))}>
      <NotePencil size={15} color={color} weight="regular" />
      <Text style={[cardStyles.wikiBtnTxt, { color }]}>Proponer una corrección</Text>
      <Text style={cardStyles.wikiBtnArrow}>↗</Text>
    </TouchableOpacity>
  );
}

const INFO_SECTIONS = [`);
parche('version de datos en Acerca de',
"    content:'BlueDot v0.1.0 — Alpha\\nDesarrollado con React Native + Expo Go.\\nThree.js r128 para visualización 3D.' },",
"    content:'BlueDot v0.1.0 — Alpha\\nDatos: ' + DATOS_VERSION.fecha + ' · ' + DATOS_VERSION.eventos + ' eventos (' + DATOS_VERSION.canon + ' del canon revisado y ' + DATOS_VERSION.fondo + ' de fondo) · civilizaciones ' + DATOS_VERSION.civilizaciones + '.\\nCita esta versión si usas los datos.\\nDesarrollado con React Native + Expo Go.\\nThree.js r128 para visualización 3D.' },");
parche('fuentes: repositorio y licencia',
"Textos contextuales generados por Claude (Anthropic) — tratar como orientativos.' },",
"Textos contextuales generados por Claude (Anthropic) — tratar como orientativos.\\n\\nLos datos propios de BlueDot (el canon de eventos, las tablas de civilizaciones) son abiertos, con licencia CC BY-SA 4.0, y cada entrada lleva su fuente, su fecha de alta y quién la revisó. El historial completo de cambios está en el repositorio público.',\n    action:{ label:'Ver el repositorio y los datos →', url: REPO_URL } },");
parche('precision: boton de correccion',
"Si encuentras un error, escríbenos — nos ayudas a mejorar.' },",
"Si encuentras un error, propón una corrección desde la propia ficha o desde aquí: queda registrada en público, se verifica automáticamente y se revisa antes de entrar en el mapa.',\n    action:{ label:'Proponer una corrección →', url: REPO_URL + '/issues/new/choose' } },");
parche('ficha de evento: procedencia y boton',
"          {/* ── Wikipedia link ──────────────────────────────────────── */}",
"          {/* ── Procedencia y corrección ────────────────────────────── */}\n          <ProcedenciaLinea fuente={event.fuente} alta={event.alta} revisado={event.revisado} />\n          <BotonCorreccion color={color} tipo=\"evento\" id={event.id} titulo={evLabelEs} contexto={evYearStr + (event.lugar ? ' · ' + event.lugar : '') + ' · ' + (event.category || '')} />\n\n          {/* ── Wikipedia link ──────────────────────────────────────── */}");
parche('ficha de civilizacion: procedencia y boton',
"              <Text style={[cardStyles.wikiBtnTxt, { color }]}>Leer en Wikipedia</Text>\n              <Text style={cardStyles.wikiBtnArrow}>{'\\u2197'}</Text>\n            </TouchableOpacity>\n          )}\n          <View style={{ height:8 }} />",
"              <Text style={[cardStyles.wikiBtnTxt, { color }]}>Leer en Wikipedia</Text>\n              <Text style={cardStyles.wikiBtnArrow}>{'\\u2197'}</Text>\n            </TouchableOpacity>\n          )}\n          <ProcedenciaLinea fuente={civilization.periodWikiTitle ? 'wikipedia:' + civilization.periodWikiTitle : (civilization.wikiTitle ? 'wikipedia:' + civilization.wikiTitle : null)} alta={null} revisado={null} />\n          <Text style={{ color:'rgba(255,255,255,0.45)', fontSize:11, lineHeight:16 }}>{'Fronteras: tablas de BlueDot (tools/), ' + DATOS_VERSION.civilizaciones + (civilization.inc ? ' · contorno inferido' : '')}</Text>\n          <BotonCorreccion color={color} tipo=\"civilizacion\" id={civilization.id + (civilization.periodStart != null ? '@' + civilization.periodStart : '')} titulo={civilization.baseName || civilization.name} contexto={periodStr || ''} />\n          <View style={{ height:8 }} />");

let ok=true; for(const p of P){ const n=cuenta(src,p.a); if(n!==1){ console.log('   ?? ancla '+(n===0?'no encontrada':'repetida x'+n)+': '+p.n); ok=false } }
if(!ok){ console.log('no se aplica nada'); process.exit(1) }
for(const p of P){ src=src.replace(p.a,()=>p.b); console.log('   ok '+p.n) }
if(APLICA){ fs.writeFileSync(ruta,src); console.log('escrito '+ruta) } else console.log('(sin --aplica no se escribe)');
