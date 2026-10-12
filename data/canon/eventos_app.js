#!/usr/bin/env node
// LAS DIEZ CATEGORIAS Y LA FICHA DE PERSONA, EN index.jsx.
//
// Parchea la app para el canon nuevo (ver CANON.md):
//   1. categorias: politica, guerras, ciencia, exploracion, religion, cultura,
//      economia, sociedad, desastres, personas (paletas normal y daltonica,
//      etiquetas, iconos phosphor, sugerencias de IA, lista del cajon)
//   2. ficha de persona: nacimiento y muerte, con salto al otro pin
//   3. nota del canon en la ficha, antes del resumen de Wikipedia
// Anclas de texto exactas; si una no aparece una sola vez, no escribe nada.
//
//   node eventos_app.js <index.jsx> [--aplica]
const fs=require('fs'); const ruta=process.argv[2]; const APLICA=process.argv.includes('--aplica');
let src=fs.readFileSync(ruta,'utf8');
if(src.includes("guerras:    { label:'Guerras y conflictos'")){ console.log('ya aplicado'); process.exit(0) }
const cuenta=(s,a)=>{ let n=0,i=0; while((i=s.indexOf(a,i))>=0){n++;i+=a.length} return n };
const P=[];
const parche=(nombre,ancla,nuevo)=>P.push({nombre,ancla,nuevo});

parche('paletas',
"  normal:   { batallas:'#D24141', desastres:'#D2A241', cultura:'#A2D241', exploracion:'#41D241', economia:'#41D2A2', politica:'#41A2D2', inventos:'#4141D2', religion:'#A241D2', personas:'#D241A2' },\n  daltonism:{ batallas:'#D55E00', desastres:'#E69F00', cultura:'#F0E442', exploracion:'#009E73', economia:'#56B4E9', politica:'#0072B2', inventos:'#332288', religion:'#CC79A7', personas:'#999999' },",
"  normal:   { politica:'#41A2D2', guerras:'#D24141', ciencia:'#4141D2', exploracion:'#41D241', religion:'#A241D2', cultura:'#A2D241', economia:'#41D2A2', sociedad:'#D27A41', desastres:'#D2C041', personas:'#D241A2' },\n  daltonism:{ politica:'#0072B2', guerras:'#D55E00', ciencia:'#332288', exploracion:'#009E73', religion:'#CC79A7', cultura:'#F0E442', economia:'#56B4E9', sociedad:'#E69F00', desastres:'#882255', personas:'#999999' },");
parche('CATEGORY_META',
"  batallas:   { label:'Batallas',    color:'#D24141' },\n  desastres:  { label:'Desastres',   color:'#D2A241' },\n  cultura:    { label:'Cultura',     color:'#A2D241' },\n  exploracion:{ label:'Exploración', color:'#41D241' },\n  economia:   { label:'Economía',    color:'#41D2A2' },\n  politica:   { label:'Política',    color:'#41A2D2' },\n  inventos:   { label:'Inventos',    color:'#4141D2' },\n  religion:   { label:'Religión',    color:'#A241D2' },\n  personas:   { label:'Personas',    color:'#D241A2' },",
"  politica:   { label:'Política y Estados',     color:'#41A2D2' },\n  guerras:    { label:'Guerras y conflictos',   color:'#D24141' },\n  ciencia:    { label:'Ciencia y tecnología',   color:'#4141D2' },\n  exploracion:{ label:'Exploración y contacto', color:'#41D241' },\n  religion:   { label:'Religión y pensamiento', color:'#A241D2' },\n  cultura:    { label:'Arte y cultura',         color:'#A2D241' },\n  economia:   { label:'Economía y comercio',    color:'#41D2A2' },\n  sociedad:   { label:'Sociedad y derechos',    color:'#D27A41' },\n  desastres:  { label:'Desastres y pandemias',  color:'#D2C041' },\n  personas:   { label:'Personas',               color:'#D241A2' },");
parche('iconos',
"  personas:   (sz,c)=><User        size={sz} color={c} weight=\"duotone\" />,\n  politica:   (sz,c)=><Buildings   size={sz} color={c} weight=\"duotone\" />,\n  batallas:   (sz,c)=><Sword       size={sz} color={c} weight=\"duotone\" />,\n  inventos:   (sz,c)=><Flask       size={sz} color={c} weight=\"duotone\" />,\n  cultura:    (sz,c)=><MaskHappy   size={sz} color={c} weight=\"duotone\" />,\n  desastres:  (sz,c)=><Warning     size={sz} color={c} weight=\"duotone\" />,\n  exploracion:(sz,c)=><Compass     size={sz} color={c} weight=\"duotone\" />,\n  religion:   (sz,c)=><Star        size={sz} color={c} weight=\"duotone\" />,\n  economia:   (sz,c)=><ChartLineUp size={sz} color={c} weight=\"duotone\" />,",
"  politica:   (sz,c)=><Buildings   size={sz} color={c} weight=\"duotone\" />,\n  guerras:    (sz,c)=><Sword       size={sz} color={c} weight=\"duotone\" />,\n  ciencia:    (sz,c)=><Flask       size={sz} color={c} weight=\"duotone\" />,\n  exploracion:(sz,c)=><Compass     size={sz} color={c} weight=\"duotone\" />,\n  religion:   (sz,c)=><Star        size={sz} color={c} weight=\"duotone\" />,\n  cultura:    (sz,c)=><MaskHappy   size={sz} color={c} weight=\"duotone\" />,\n  economia:   (sz,c)=><ChartLineUp size={sz} color={c} weight=\"duotone\" />,\n  sociedad:   (sz,c)=><UsersThree  size={sz} color={c} weight=\"duotone\" />,\n  desastres:  (sz,c)=><Warning     size={sz} color={c} weight=\"duotone\" />,\n  personas:   (sz,c)=><User        size={sz} color={c} weight=\"duotone\" />,");
parche('sugerencias IA: guerras',"  batallas:    (b) => [{ label:'What caused it?', question:`What led to ${b}?` }","  guerras:     (b) => [{ label:'What caused it?', question:`What led to ${b}?` }");
parche('sugerencias IA: ciencia',"  inventos:    (b) => [{ label:'How did it come about?'","  ciencia:     (b) => [{ label:'How did it come about?'");
parche('sugerencias IA: sociedad',
"  personas:    (b) => [{ label:'Who was involved?', question:`Who was involved in ${b}?` }, { label:'Lasting legacy?', question:`What are they best known for, and what's their lasting legacy?` }],",
"  personas:    (b) => [{ label:'Who was involved?', question:`Who was involved in ${b}?` }, { label:'Lasting legacy?', question:`What are they best known for, and what's their lasting legacy?` }],\n  sociedad:    (b) => [{ label:'Who pushed for it?', question:`Who pushed for ${b}, and against what resistance?` }, { label:'What changed for people?', question:`What changed in everyday life after ${b}?` }],");
parche('colores base',
"  batallas:'#D24141', desastres:'#D2A241', cultura:'#A2D241',\n  exploracion:'#41D241', economia:'#41D2A2', politica:'#41A2D2',\n  inventos:'#4141D2', religion:'#A241D2', personas:'#D241A2',",
"  politica:'#41A2D2', guerras:'#D24141', ciencia:'#4141D2', exploracion:'#41D241', religion:'#A241D2',\n  cultura:'#A2D241', economia:'#41D2A2', sociedad:'#D27A41', desastres:'#D2C041', personas:'#D241A2',");
parche('causas',
"const CATS_WITH_CAUSES = ['politica', 'batallas', 'inventos', 'cultura', 'desastres', 'exploracion', 'religion'];",
"const CATS_WITH_CAUSES = ['politica', 'guerras', 'ciencia', 'cultura', 'desastres', 'exploracion', 'religion', 'economia', 'sociedad'];");
parche('lista del cajon',
"  const EVENT_CATS = ['batallas','desastres','cultura','exploracion','economia','politica','inventos','religion','personas'];",
"  const EVENT_CATS = ['politica','guerras','ciencia','exploracion','religion','cultura','economia','sociedad','desastres','personas'];");
parche('anio de la ficha con momento',
"            <Text style={cardStyles.yearLbl}>{evYearStr}</Text>",
"            <Text style={cardStyles.yearLbl}>{event.momento ? (event.momento === 'nac' ? 'Nacimiento · ' : 'Muerte · ') : ''}{evYearStr}</Text>");
parche('bloque de persona en la ficha',
"          <Text style={[cardStyles.tagTxt, { color }]}>{catMeta.label.toUpperCase()}</Text>\n        </View>\n\n        {onAskAI && (",
`          <Text style={[cardStyles.tagTxt, { color }]}>{catMeta.label.toUpperCase()}</Text>
        </View>

        {/* ── Persona: nacimiento y muerte, con salto al otro pin ──── */}
        {event.persona && (
          <View style={{ paddingHorizontal:20, paddingTop:10 }}>
            {event.por ? <Text style={cardStyles.summaryTxt}>{event.por}</Text> : null}
            <View style={{ flexDirection:'row', gap:12, marginTop:8 }}>
              <View style={{ flex:1 }}>
                <Text style={cardStyles.contextLabel}>{event.momento === 'nac' ? 'NACIMIENTO' : 'MUERTE'}</Text>
                <Text style={cardStyles.contextText}>{event.lugar ? event.lugar + ', ' : ''}{evYearStr}</Text>
              </View>
              {event.otro && (
                <TouchableOpacity style={{ flex:1 }} activeOpacity={0.7}
                  onPress={() => onClose && onClose({ navigateTo: { id: event.otro.id } })}>
                  <Text style={cardStyles.contextLabel}>{event.momento === 'nac' ? 'MUERTE' : 'NACIMIENTO'}</Text>
                  <Text style={[cardStyles.contextText, { color }]}>{event.otro.lugar ? event.otro.lugar + ', ' : ''}{event.otro.year < 0 ? Math.abs(event.otro.year) + ' a.C.' : event.otro.year + ' d.C.'} · Ir →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {onAskAI && (`);
parche('nota del canon',
"          {/* ── Resumen Wikipedia",
"          {event.nota ? <Text style={[cardStyles.summaryTxt, { fontStyle:'italic', marginBottom:8 }]}>{event.nota}</Text> : null}\n          {/* ── Resumen Wikipedia");

let ok=true; for(const p of P){ const n=cuenta(src,p.ancla); if(n!==1){ console.log('   ?? ancla '+(n===0?'no encontrada':'repetida x'+n)+': '+p.nombre); ok=false } }
if(!ok){ console.log('no se aplica nada'); process.exit(1) }
for(const p of P){ src=src.replace(p.ancla,()=>p.nuevo); console.log('   ok '+p.nombre) }
if(APLICA){ fs.writeFileSync(ruta,src); console.log('escrito '+ruta) } else console.log('(sin --aplica no se escribe)');
