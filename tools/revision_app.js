#!/usr/bin/env node
// MODO REVISION DENTRO DE LA APP.
//
// El usuario eligio revisar las 1.200 entidades a mano, desde el telefono, en
// vez de con capturas. Esta herramienta injerta en index.jsx:
//
//   1. REVISION_ORDEN: la lista de entidades en el orden en que conviene
//      verlas (mas presencia primero, calculado por orden_revision.js), con el
//      año en que cada una esta mas extendida y el centro de su anillo mayor.
//   2. Una barra de revision que sustituye a la de reproduccion: muestra la
//      entidad, el año, el avance, y tres veredictos -bien, mal, no se- mas
//      nota, aislar (apaga el resto para ver solo esa), lista y salir.
//   3. Un listado filtrable (todas / pendientes / bien / mal / no se) desde el
//      que se salta a cualquier entidad, y un boton de exportar que abre la
//      hoja de compartir con el JSON de los veredictos.
//   4. Persistencia en el localStorage del WebView del globo (revSave /
//      revLoad por postMessage), que es lo que hay sin añadir dependencias.
//      Por si ese almacen se vacia -cosa que en WKWebView con HTML en linea
//      puede pasar- el boton de exportar esta a un toque.
//
//   JSX=<index.jsx> ORDEN=<orden_revision.json> node revision_app.js [--aplica]
//
// Cada anclaje tiene que aparecer exactamente una vez; si no, no toca nada.
const fs=require('fs');
const JSX=process.env.JSX||'/tmp/geo/build21.jsx';
const ORDEN=process.env.ORDEN||'/tmp/geo/orden_revision.json';
const APLICA=process.argv.includes('--aplica');

let src=fs.readFileSync(JSX,'utf8');
const orden=JSON.parse(fs.readFileSync(ORDEN,'utf8'));
const compacto=orden.map(e=>[e.id,e.p,e.a,e.lat,e.lon,e.k?1:0]);
if(src.indexOf('REVISION_ORDEN')>=0){
 // ya injertado: solo se renueva la lista (el orden cambia cuando cambian las formas)
 const i=src.indexOf('const REVISION_ORDEN = '); const j=src.indexOf('];',i)+2;
 if(i<0){console.log('ya injertado pero no encuentro la constante'); process.exit(1)}
 src=src.slice(0,i)+'const REVISION_ORDEN = '+JSON.stringify(compacto)+';'+src.slice(j);
 console.log('REVISION_ORDEN renovada ('+compacto.length+' entidades)');
 if(APLICA)fs.writeFileSync(JSX,src); process.exit(0) }

const parches=[];
function parche(nombre,ancla,nuevo){ parches.push({nombre,ancla,nuevo}) }

// 1. iconos --------------------------------------------------------------------
parche('iconos',
"  ArrowsLeftRight, UsersThree,\n} from 'phosphor-react-native';",
"  ArrowsLeftRight, UsersThree,\n  Check, X, Question, NotePencil, EyeSlash, CaretLeft, ListChecks, SignOut, Export, ClipboardText,\n} from 'phosphor-react-native';");

// 2. Share y FlatList de react-native -----------------------------------------
parche('imports rn',
"  KeyboardAvoidingView, Platform, Keyboard,\n} from 'react-native';",
"  KeyboardAvoidingView, Platform, Keyboard, Share, FlatList,\n} from 'react-native';");

// 3. WebView: guardar y cargar veredictos en localStorage ----------------------
parche('webview revSave',
"    else if(msg.type==='resetGlobe'){",
"    else if(msg.type==='revSave'){ try{localStorage.setItem('bluedot_rev',msg.data);}catch(e){} }\n"+
"    else if(msg.type==='revLoad'){ var revD=null; try{revD=localStorage.getItem('bluedot_rev');}catch(e){} avisarRN({type:'revData',data:revD}); }\n"+
"    else if(msg.type==='resetGlobe'){");

// 4. Constante, barra, listado, nota ------------------------------------------
const bloque=`
// ─── Modo revisión ───────────────────────────────────────────────────────────
// Orden de revisión de las entidades del mapa: [id, presencia (celdas de 1°
// sumadas en 12 cortes), año de máxima extensión, lat y lon del centro del
// anillo mayor en ese año, 1 si es área cultural]. Lo calcula
// tools/orden_revision.js; se revisa primero lo que más se ve.
const REVISION_ORDEN = ${JSON.stringify(compacto)};
const REV_VEREDICTOS = [
  { v:'bien', label:'Bien',  color:'#1D9E75' },
  { v:'mal',  label:'Mal',   color:'#D85A30' },
  { v:'duda', label:'No sé', color:'#EF9F27' },
];
const revColor = (v) => (REV_VEREDICTOS.find(x => x.v === v) || {}).color || 'rgba(255,255,255,0.35)';

function RevisionBar({ idx, data, aislar, onPrev, onNext, onVeredicto, onNota, onAislar, onLista, onFicha, onSalir }) {
  const { formatYear, calendar } = useContext(SettingsContext);
  const e = REVISION_ORDEN[idx];
  const civ = CIVILIZATIONS.find(c => c.id === e[0]);
  const nombre = civ ? (civ.etiqueta || civ.name) : e[0];
  const d = data[e[0]];
  const hechas = Object.keys(data).filter(k => data[k] && data[k].v).length;
  const pct = Math.round(hechas * 100 / REVISION_ORDEN.length);
  return (
    <View style={revSt.bar}>
      <View style={revSt.fila}>
        <TouchableOpacity style={revSt.btnSec} onPress={onPrev}>
          <CaretLeft size={16} color="rgba(255,255,255,0.7)" weight="bold" />
        </TouchableOpacity>
        <Pressable style={{ flex:1, alignItems:'center' }} onPress={onFicha}>
          <Text style={revSt.nombre} numberOfLines={1}>{nombre}</Text>
          <Text style={revSt.sub} numberOfLines={1}>
            {(idx + 1) + ' / ' + REVISION_ORDEN.length + '  ·  ' + formatYear(e[2], calendar) + (e[5] ? '  ·  área cultural' : '') + '  ·  ' + pct + '%'}
          </Text>
        </Pressable>
        <TouchableOpacity style={revSt.btnSec} onPress={onNext}>
          <CaretRight size={16} color="rgba(255,255,255,0.7)" weight="bold" />
        </TouchableOpacity>
      </View>
      <View style={revSt.fila}>
        {REV_VEREDICTOS.map(x => {
          const on = d && d.v === x.v;
          return (
            <TouchableOpacity key={x.v} style={[revSt.btnVer, { borderColor: x.color + (on ? 'ff' : '66'), backgroundColor: on ? x.color + '44' : 'rgba(255,255,255,0.04)' }]}
              onPress={() => onVeredicto(x.v)}>
              {x.v === 'bien' && <Check size={16} color={x.color} weight="bold" />}
              {x.v === 'mal'  && <X size={16} color={x.color} weight="bold" />}
              {x.v === 'duda' && <Question size={16} color={x.color} weight="bold" />}
              <Text style={[revSt.btnVerTxt, { color: x.color }]}>{x.label}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={[revSt.btnSec, d && d.n ? revSt.btnSecOn : null]} onPress={onNota}>
          <NotePencil size={16} color={d && d.n ? '#378ADD' : 'rgba(255,255,255,0.7)'} weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity style={[revSt.btnSec, aislar && revSt.btnSecOn]} onPress={onAislar}>
          {aislar ? <EyeSlash size={16} color="#378ADD" weight="regular" /> : <Eye size={16} color="rgba(255,255,255,0.7)" weight="regular" />}
        </TouchableOpacity>
        <TouchableOpacity style={revSt.btnSec} onPress={onLista}>
          <ListChecks size={16} color="rgba(255,255,255,0.7)" weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity style={revSt.btnSec} onPress={onSalir}>
          <SignOut size={16} color="rgba(255,255,255,0.7)" weight="regular" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RevisionLista({ data, idx, onIr, onClose }) {
  const { formatYear, calendar } = useContext(SettingsContext);
  const [filtro, setFiltro] = useState('pend');
  const slideAnim = useRef(new Animated.Value(SH)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue:0, useNativeDriver:true, tension:60, friction:14 }),
      Animated.timing(opacAnim,  { toValue:1, duration:200, useNativeDriver:true }),
    ]).start();
  }, []);
  const close = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue:SH, duration:240, useNativeDriver:true }),
      Animated.timing(opacAnim,  { toValue:0,  duration:200, useNativeDriver:true }),
    ]).start(onClose);
  };
  const nombres = useMemo(() => { const m = {}; for (const c of CIVILIZATIONS) m[c.id] = c.etiqueta || c.name; return m; }, []);
  const filas = useMemo(() => REVISION_ORDEN.map((e, i) => ({ e, i, d: data[e[0]] }))
    .filter(r => filtro === 'todas' ? true : filtro === 'pend' ? !(r.d && r.d.v) : (r.d && r.d.v === filtro)), [filtro, data]);
  const cuenta = { todas: REVISION_ORDEN.length, pend: 0, bien: 0, mal: 0, duda: 0 };
  for (const e of REVISION_ORDEN) { const d = data[e[0]]; if (d && d.v) cuenta[d.v] = (cuenta[d.v] || 0) + 1; else cuenta.pend++; }
  const exportar = async () => {
    const salida = { fecha: new Date().toISOString(), total: REVISION_ORDEN.length, veredictos: data };
    try { await Share.share({ message: JSON.stringify(salida), title: 'Revisión BlueDot' }); } catch (_) {}
  };
  return (
    <Animated.View style={[mSt.overlay, { opacity: opacAnim }]} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <Animated.View style={[mSt.sheet, { transform:[{ translateY: slideAnim }], height: SH * 0.85 }]}>
        <View style={mSt.handle} />
        <View style={mSt.header}>
          <Text style={mSt.title}>Revisión del mapa</Text>
          <TouchableOpacity onPress={exportar} style={[mSt.closeBtn, { marginRight:10 }]}>
            <Export size={15} color="rgba(255,255,255,0.7)" weight="regular" />
          </TouchableOpacity>
          <Pressable onPress={close} style={mSt.closeBtn}><Text style={mSt.closeTxt}>✕</Text></Pressable>
        </View>
        <View style={[mSt.pillGroupH, { paddingHorizontal:24, paddingVertical:12 }]}>
          {[['pend','Pendientes'],['bien','Bien'],['mal','Mal'],['duda','No sé'],['todas','Todas']].map(([k, l]) => (
            <Pressable key={k} style={[mSt.pillH, { paddingHorizontal:12, paddingVertical:7 }, filtro===k && mSt.pillOn]} onPress={() => setFiltro(k)}>
              <Text style={[mSt.pillTxt, { fontSize:12 }, filtro===k && mSt.pillTxtOn]}>{l + ' ' + cuenta[k]}</Text>
            </Pressable>
          ))}
        </View>
        <FlatList
          data={filas}
          keyExtractor={r => r.e[0]}
          getItemLayout={(_, i) => ({ length: 48, offset: 48 * i, index: i })}
          initialNumToRender={20}
          renderItem={({ item: r }) => (
            <Pressable style={[revSt.filaLista, r.i === idx && revSt.filaListaOn]} onPress={() => { onIr(r.i); close(); }}>
              <View style={[revSt.punto, { backgroundColor: revColor(r.d && r.d.v) }]} />
              <View style={{ flex:1 }}>
                <Text style={revSt.listaNombre} numberOfLines={1}>{nombres[r.e[0]] || r.e[0]}</Text>
                <Text style={revSt.listaSub} numberOfLines={1}>
                  {(r.i + 1) + '  ·  ' + formatYear(r.e[2], calendar) + (r.e[5] ? '  ·  cultura' : '') + (r.d && r.d.n ? '  ·  ' + r.d.n : '')}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </Animated.View>
    </Animated.View>
  );
}

function RevisionNota({ nombre, inicial, onGuardar, onClose }) {
  const [txt, setTxt] = useState(inicial || '');
  return (
    <View style={[mSt.overlay, { backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center' }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ marginHorizontal:24 }}>
        <View style={revSt.notaCaja}>
          <Text style={[mSt.sectionTitle, { marginBottom:10 }]} numberOfLines={1}>{nombre}</Text>
          <TextInput value={txt} onChangeText={setTxt} multiline autoFocus
            placeholder="Qué está mal, qué falta, qué sobra" placeholderTextColor="rgba(255,255,255,0.3)"
            style={revSt.notaInput} />
          <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:10, marginTop:12 }}>
            <TouchableOpacity style={[mSt.actionBtn, { marginTop:0, backgroundColor:'rgba(255,255,255,0.06)', borderColor:'rgba(255,255,255,0.15)' }]} onPress={onClose}>
              <Text style={[mSt.actionBtnTxt, { color:'rgba(255,255,255,0.6)' }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[mSt.actionBtn, { marginTop:0 }]} onPress={() => onGuardar(txt.trim())}>
              <Text style={mSt.actionBtnTxt}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const revSt = StyleSheet.create({
  bar:        { position:'absolute', bottom:0, left:0, right:0, backgroundColor:'rgba(4,4,13,0.92)', borderTopWidth:0.5, borderColor:'rgba(255,255,255,0.08)', paddingTop:8, paddingBottom:28, paddingHorizontal:12, gap:8 },
  fila:       { flexDirection:'row', alignItems:'center', gap:8 },
  nombre:     { color:'#fff', fontSize:15, fontWeight:'600', letterSpacing:-0.2 },
  sub:        { color:'rgba(255,255,255,0.45)', fontSize:11, marginTop:2 },
  btnSec:     { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.07)', borderWidth:0.5, borderColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center' },
  btnSecOn:   { backgroundColor:'rgba(55,138,221,0.18)', borderColor:'rgba(55,138,221,0.55)' },
  btnVer:     { flex:1, height:38, borderRadius:19, borderWidth:0.5, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:5 },
  btnVerTxt:  { fontSize:12, fontWeight:'600' },
  filaLista:  { height:48, flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:24, borderBottomWidth:0.5, borderColor:'rgba(255,255,255,0.05)' },
  filaListaOn:{ backgroundColor:'rgba(55,138,221,0.12)' },
  punto:      { width:9, height:9, borderRadius:4.5 },
  listaNombre:{ color:'rgba(255,255,255,0.88)', fontSize:13, fontWeight:'500' },
  listaSub:   { color:'rgba(255,255,255,0.38)', fontSize:11, marginTop:1 },
  notaCaja:   { backgroundColor:'#0c0c1c', borderRadius:18, borderWidth:0.5, borderColor:'rgba(255,255,255,0.1)', padding:18 },
  notaInput:  { minHeight:90, color:'#fff', fontSize:14, lineHeight:20, backgroundColor:'rgba(255,255,255,0.05)', borderRadius:12, padding:12, textAlignVertical:'top' },
});

// ─── Main App Component ───────────────────────────────────────────────────────`;
parche('componentes',"\n// ─── Main App Component ───────────────────────────────────────────────────────",bloque);

// 5. Entrada desde Ajustes -----------------------------------------------------
parche('settings props',"function SettingsModal({ onClose }) {","function SettingsModal({ onClose, onRevision }) {");
parche('settings seccion',
"            <Text style={mSt.footer}>El cambio de idioma se aplicará en la próxima sesión.</Text>\n          </View>\n",
"            <Text style={mSt.footer}>El cambio de idioma se aplicará en la próxima sesión.</Text>\n          </View>\n"+
"\n          {/* Revisión del mapa */}\n"+
"          <View style={mSt.section}>\n"+
"            <View style={mSt.sectionHeader}>\n"+
"              <ListChecks size={18} color=\"rgba(255,255,255,0.7)\" weight=\"regular\" />\n"+
"              <Text style={mSt.sectionTitle}>Revisión del mapa</Text>\n"+
"            </View>\n"+
"            <Text style={mSt.infoText}>Recorre las {REVISION_ORDEN.length} entidades del mapa una por una, cada una en su año de mayor extensión, y marca si su forma está bien, mal o en duda. Los veredictos se guardan en el dispositivo y se pueden exportar.</Text>\n"+
"            <TouchableOpacity style={mSt.actionBtn} onPress={() => { close(); setTimeout(onRevision, 260); }}>\n"+
"              <Text style={mSt.actionBtnTxt}>Entrar en modo revisión</Text>\n"+
"            </TouchableOpacity>\n"+
"          </View>\n");
parche('settings uso',
"        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}",
"        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onRevision={revEntrar} />}");

// 6. Estado y logica en BlueDotApp ---------------------------------------------
parche('estado',
"  // ── Globe messages ────────────────────────────────────────────────────────\n  const onGlobeMsg = useCallback((e) => {",
`  // ── Modo revisión ──────────────────────────────────────────────────────────
  const [revOn,      setRevOn]      = useState(false);
  const [revIdx,     setRevIdx]     = useState(0);
  const [revData,    setRevData]    = useState({});
  const [revAislar,  setRevAislar]  = useState(false);
  const [showRevLista, setShowRevLista] = useState(false);
  const [revNotaDe,  setRevNotaDe]  = useState(null);
  const revDataRef = useRef({});
  const revTodosOff = useMemo(() => { const o = {}; for (const c of CIVILIZATIONS) o[c.id] = false; return o; }, []);
  const revGuardar = useCallback((next) => {
    revDataRef.current = next; setRevData(next);
    globeRef.current?.postMessage(JSON.stringify({ type:'revSave', data: JSON.stringify(next) }));
  }, []);
  const revIr = useCallback((idx, aislar) => {
    const n = REVISION_ORDEN.length; idx = ((idx % n) + n) % n;
    const e = REVISION_ORDEN[idx];
    const y = e[2];
    setIsPlaying(false);
    yearRef.current = y; setYear(y); setStoreYear(y);
    const nextLayers = { ...processLayersRef.current, civilizations:true, showCultures:true };
    const civOn = aislar ? { ...revTodosOff, [e[0]]: true } : { ...(processItemsOnRef.current.civilizations || {}), [e[0]]: true };
    const nextItemsOn = { ...processItemsOnRef.current, civilizations: civOn };
    setProcessLayers(nextLayers); setProcessItemsOn(nextItemsOn);
    processLayersRef.current = nextLayers; processItemsOnRef.current = nextItemsOn;
    sendPins(y, activeCatRef.current, toleranceRef.current, true);
    sendProcesses(y, nextLayers, nextItemsOn, true);
    globeRef.current?.postMessage(JSON.stringify({ type:'rotateTo', lat:e[3], lon:e[4] }));
    setRevIdx(idx);
  }, [sendPins, sendProcesses, revTodosOff]);
  const revSiguientePendiente = useCallback((desde) => {
    const n = REVISION_ORDEN.length;
    for (let k = 1; k <= n; k++) { const j = (desde + k) % n; const d = revDataRef.current[REVISION_ORDEN[j][0]]; if (!(d && d.v)) return j; }
    return (desde + 1) % n;
  }, []);
  const revEntrar = useCallback(() => {
    if (screenRef.current !== 'globe') switchToGlobe();
    setRevOn(true); setRevAislar(false);
    globeRef.current?.postMessage(JSON.stringify({ type:'revLoad' }));
    setTimeout(() => revIr(revSiguientePendiente(-1), false), 150);
  }, [switchToGlobe, revIr, revSiguientePendiente]);
  const revSalir = useCallback(() => {
    setRevOn(false); setShowRevLista(false); setRevNotaDe(null);
    if (revAislar) {
      const nextItemsOn = { ...processItemsOnRef.current, civilizations: {} };
      setProcessItemsOn(nextItemsOn); processItemsOnRef.current = nextItemsOn;
      sendProcesses(yearRef.current, processLayersRef.current, nextItemsOn, true);
    }
    setRevAislar(false);
  }, [revAislar, sendProcesses]);
  const revVeredicto = useCallback((v) => {
    const id = REVISION_ORDEN[revIdx][0];
    const prev = revDataRef.current[id] || {};
    revGuardar({ ...revDataRef.current, [id]: { ...prev, v, y: REVISION_ORDEN[revIdx][2], t: Date.now() } });
    revIr(revSiguientePendiente(revIdx), revAislar);
  }, [revIdx, revAislar, revGuardar, revIr, revSiguientePendiente]);
  const revFicha = useCallback(() => {
    const civ = CIVILIZATIONS.find(c => c.id === REVISION_ORDEN[revIdx][0]);
    if (civ) openProcessCard('civilizations', civ);
  }, [revIdx, openProcessCard]);

  // ── Globe messages ────────────────────────────────────────────────────────
  const onGlobeMsg = useCallback((e) => {`);

// 7b. pedir los veredictos guardados en cuanto carga el globo -----------------
parche('webview load',
"      sendAutoRotate(autoRotateRef.current);\n",
"      sendAutoRotate(autoRotateRef.current);\n      globeRef.current?.postMessage(JSON.stringify({ type:'revLoad' }));\n");

// 7. Recibir los datos guardados ----------------------------------------------
parche('onGlobeMsg revData',
"      if (msg.type === 'cacheOlvidado') {\n        for (const k of (msg.claves || [])) enviadasRef.current.delete(k);\n        return;\n      }",
"      if (msg.type === 'cacheOlvidado') {\n        for (const k of (msg.claves || [])) enviadasRef.current.delete(k);\n        return;\n      }\n"+
"      if (msg.type === 'revData') {\n        let d = {}; try { d = msg.data ? JSON.parse(msg.data) : {}; } catch (_) { d = {}; }\n        if (d && typeof d === 'object') { revDataRef.current = d; setRevData(d); }\n        return;\n      }");

// 8. Barra, lista y nota en pantalla -------------------------------------------
parche('playbar',
"        {/* Play bar */}\n        <PlayBar isPlaying={isPlaying} speed={speed} dir={playDir}",
"        {/* Play bar */}\n        {!revOn && <PlayBar isPlaying={isPlaying} speed={speed} dir={playDir}");
parche('playbar cierre',
"          onReset={() => globeRef.current?.postMessage(JSON.stringify({ type:'resetGlobe' }))} />\n",
"          onReset={() => globeRef.current?.postMessage(JSON.stringify({ type:'resetGlobe' }))} />}\n"+
"        {revOn && (\n"+
"          <RevisionBar idx={revIdx} data={revData} aislar={revAislar}\n"+
"            onPrev={() => revIr(revIdx - 1, revAislar)}\n"+
"            onNext={() => revIr(revIdx + 1, revAislar)}\n"+
"            onVeredicto={revVeredicto}\n"+
"            onNota={() => setRevNotaDe(REVISION_ORDEN[revIdx][0])}\n"+
"            onAislar={() => { const a = !revAislar; setRevAislar(a); revIr(revIdx, a); }}\n"+
"            onLista={() => setShowRevLista(true)}\n"+
"            onFicha={revFicha}\n"+
"            onSalir={revSalir} />\n"+
"        )}\n"+
"        {showRevLista && <RevisionLista data={revData} idx={revIdx} onIr={(i) => revIr(i, revAislar)} onClose={() => setShowRevLista(false)} />}\n"+
"        {revNotaDe && (\n"+
"          <RevisionNota nombre={(CIVILIZATIONS.find(c => c.id === revNotaDe) || {}).name || revNotaDe}\n"+
"            inicial={(revData[revNotaDe] || {}).n}\n"+
"            onGuardar={(n) => { const prev = revDataRef.current[revNotaDe] || {}; revGuardar({ ...revDataRef.current, [revNotaDe]: { ...prev, n, t: Date.now() } }); setRevNotaDe(null); }}\n"+
"            onClose={() => setRevNotaDe(null)} />\n"+
"        )}\n");

// aplicar ---------------------------------------------------------------------
let ok=true;
for(const p of parches){ const n=src.split(p.ancla).length-1;
 if(n!==1){ console.log('ANCLA '+p.nombre+': '+n+' coincidencias'); ok=false } }
if(!ok){ console.log('no se toca nada'); process.exit(1) }
for(const p of parches)src=src.replace(p.ancla,()=>p.nuevo);
console.log('parches: '+parches.length+'  tamaño '+(src.length/1048576).toFixed(2)+' MB');
if(APLICA){ fs.writeFileSync(JSX,src); console.log('escrito '+JSX) } else console.log('(sin --aplica no se escribe)');
