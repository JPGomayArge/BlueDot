#!/usr/bin/env node
// PAQUETES DE EVENTOS POR ERA EN LA APP.
//
// La app lleva de serie eventos_base.json (canon + fondo de importancia 2) y
// descarga, a eleccion de la persona, el fondo detallado de cada era desde la
// release de GitHub (empaqueta.js los produce; la accion publica_datos los
// sube). Este parche pone en index.jsx:
//   1. EVENTS deja de ser una constante: es base + eras cargadas. Al mover la
//      linea de tiempo se cargan las eras instaladas que toca la ventana y se
//      sueltan las demas, asi la memoria no crece con el tamano del fondo.
//   2. El gestor Paquetes: manifiesto, descarga (fetch + expo-file-system),
//      instalados.json, carga/descarga por era, avisos a la interfaz.
//   3. La seccion "Detalle por era" en el cajon Capas: una fila por era con
//      eventos, peso y estado (Descargar / Actualizar / instalado / Quitar),
//      la era del anio actual marcada, "Instalar todo" y el espacio usado.
//
//   node paquetes_app.js <index.jsx> [--aplica]   REPO=https://github.com/<usuario>/BlueDot
const fs=require('fs'); const ruta=process.argv[2]; const APLICA=process.argv.includes('--aplica');
const REPO=process.env.REPO||'https://github.com/JPGomayArge/BlueDot';
let src=fs.readFileSync(ruta,'utf8');
if(src.includes('const Paquetes = {')){ console.log('ya aplicado'); process.exit(0) }
const cuenta=(s,a)=>{ let n=0,i=0; while((i=s.indexOf(a,i))>=0){n++;i+=a.length} return n };
const P=[]; const parche=(n,a,b)=>P.push({n,a,b});

parche('import: base de serie y expo-file-system',
"import EVENTS_RAW from '../data/events_extended.json';",
`import EVENTS_RAW from '../data/eventos_base.json';
// Lectura y escritura de los paquetes de eventos descargados (ver Paquetes).
import { File, Directory, Paths } from 'expo-file-system';`);

parche('iconos',
"  Check, X, Question, NotePencil, EyeSlash, CaretLeft, ListChecks, SignOut, Export, ClipboardText,\n} from 'phosphor-react-native';",
"  Check, X, Question, NotePencil, EyeSlash, CaretLeft, ListChecks, SignOut, Export, ClipboardText,\n  DownloadSimple, CheckCircle, Trash,\n} from 'phosphor-react-native';");

parche('EVENTS mutable y gestor de paquetes',
"const EVENTS = EVENTS_RAW.map(e => e.wikiTitles ? e : { ...e, wikiTitles: e.labels });",
`const EVENTS_BASE = EVENTS_RAW.map(e => e.wikiTitles ? e : { ...e, wikiTitles: e.labels });
// EVENTS es lo que ve el resto de la app: la base de serie mas las eras
// descargadas que toca la ventana de tiempo. Lo recompone Paquetes.
let EVENTS = EVENTS_BASE;

// ─── Paquetes de eventos por era ─────────────────────────────────────────────
// El fondo detallado (importancia 1) no va dentro de la app: se descarga por
// era desde la release del repositorio, a eleccion de la persona, y se guarda
// en la carpeta de documentos de la app. Asi cada quien decide cuanto detalle
// carga y cuanto espacio ocupa, y los datos se renuevan sin reinstalar.
const PAQUETES_URL = '${REPO}/releases/latest/download/';
const ERAS = [
  { id:'era_00', nombre:'10000 a 3000 a.C.',    desde:-10000, hasta:-3000 },
  { id:'era_01', nombre:'3000 a 1000 a.C.',     desde:-3000,  hasta:-1000 },
  { id:'era_02', nombre:'1000 a.C. a 500 d.C.', desde:-1000,  hasta:500 },
  { id:'era_03', nombre:'500 a 1000',           desde:500,    hasta:1000 },
  { id:'era_04', nombre:'1000 a 1500',          desde:1000,   hasta:1500 },
  { id:'era_05', nombre:'1500 a 1700',          desde:1500,   hasta:1700 },
  { id:'era_06', nombre:'1700 a 1800',          desde:1700,   hasta:1800 },
  { id:'era_07', nombre:'1800 a 1900',          desde:1800,   hasta:1900 },
  { id:'era_08', nombre:'1900 a 1950',          desde:1900,   hasta:1950 },
  { id:'era_09', nombre:'Desde 1950',           desde:1950,   hasta:2100 },
];
const Paquetes = {
  dir: null, manifiesto: null, error: null, listo: false,
  instalados: {},            // id -> { fecha, eventos, bytes }
  cargadas: new Map(),       // id -> eventos expandidos (solo las eras que toca la ventana)
  estado: {},                // id -> 'descargando' | 'error' | undefined
  cargando: {},
  oyentes: new Set(),
  ultimoAnio: 2000, ultimaTol: 0,
  suscribir(fn) { this.oyentes.add(fn); return () => this.oyentes.delete(fn); },
  avisar() { setTimeout(() => { for (const fn of this.oyentes) { try { fn(); } catch (e) {} } }, 0); },
  carpeta() {
    if (!this.dir) {
      this.dir = new Directory(Paths.document, 'paquetes');
      try { if (!this.dir.exists) this.dir.create({ intermediates:true }); } catch (e) {}
    }
    return this.dir;
  },
  archivo(id) { return new File(this.carpeta(), id + '.json'); },
  async iniciar() {
    try {
      const f = new File(this.carpeta(), 'instalados.json');
      if (f.exists) this.instalados = JSON.parse(await f.text()) || {};
    } catch (e) { this.instalados = {}; }
    for (const id of Object.keys(this.instalados)) {
      try { if (!this.archivo(id).exists) delete this.instalados[id]; } catch (e) { delete this.instalados[id]; }
    }
    this.listo = true;
    this.asegurar(this.ultimoAnio, this.ultimaTol);
    this.avisar();
  },
  guardarInstalados() {
    try {
      const f = new File(this.carpeta(), 'instalados.json');
      if (f.exists) f.delete();
      f.create(); f.write(JSON.stringify(this.instalados));
    } catch (e) {}
  },
  async pedirManifiesto(forzar) {
    if (this.manifiesto && !forzar) return this.manifiesto;
    try {
      const r = await fetch(PAQUETES_URL + 'manifiesto.json', { cache:'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const m = await r.json();
      if (!m || !Array.isArray(m.eras)) throw new Error('manifiesto inválido');
      this.manifiesto = m; this.error = null;
    } catch (e) { this.error = 'sin conexión'; }
    this.avisar();
    return this.manifiesto;
  },
  eraDe(anio) { return ERAS.find(r => anio >= r.desde && anio < r.hasta) || ERAS[ERAS.length - 1]; },
  hayNuevo(id) {
    const i = this.instalados[id]; const m = this.manifiesto && this.manifiesto.eras.find(x => x.id === id);
    return !!(i && m && m.fecha && i.fecha && m.fecha > i.fecha);
  },
  espacio() { return Object.values(this.instalados).reduce((s, x) => s + (x.bytes || 0), 0); },
  async descargar(id) {
    if (this.estado[id] === 'descargando') return;
    this.estado[id] = 'descargando'; this.avisar();
    try {
      const m = this.manifiesto && this.manifiesto.eras.find(x => x.id === id);
      const r = await fetch(PAQUETES_URL + ((m && m.archivo) || (id + '.json')), { cache:'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const txt = await r.text();
      const obj = JSON.parse(txt);
      if (!obj || obj.id !== id || !Array.isArray(obj.e)) throw new Error('paquete inválido');
      const f = this.archivo(id);
      if (f.exists) f.delete();
      f.create(); f.write(txt);
      this.instalados[id] = { fecha: obj.fecha || (m && m.fecha) || null, eventos: obj.e.length, bytes: txt.length };
      this.guardarInstalados();
      this.cargadas.delete(id);
      delete this.estado[id];
      this.asegurar(this.ultimoAnio, this.ultimaTol);
    } catch (e) {
      this.estado[id] = 'error';
    }
    this.avisar();
  },
  quitar(id) {
    try { const f = this.archivo(id); if (f.exists) f.delete(); } catch (e) {}
    delete this.instalados[id]; delete this.estado[id];
    this.guardarInstalados();
    if (this.cargadas.delete(id)) this.recomponer(); else this.avisar();
  },
  // Las filas compactas del paquete se vuelven eventos con el esquema de la app.
  expandir(obj) {
    const out = [];
    for (const r of obj.e) {
      const es = r[4] || '', en = r[5] || es;
      out.push({
        id: r[0], year: r[1], lat: r[2], lon: r[3],
        labels: { es, en }, category: r[6], importance: 1, reg: r[7] || undefined,
        wikiTitles: { es: r[9] || es, en: r[10] || en },
        wikidataId: r[8] || undefined, aprox: r[11] ? 1 : undefined,
        fondo: 1, fuente: r[8] ? 'wikidata:' + r[8] : 'wikidata',
        alta: obj.fecha || null, autor: 'wikidata', revisado: null,
      });
    }
    return out;
  },
  async cargar(id) {
    if (this.cargadas.has(id) || !this.instalados[id]) return;
    const obj = JSON.parse(await this.archivo(id).text());
    this.cargadas.set(id, this.expandir(obj));
    this.recomponer();
  },
  recomponer() {
    let ev = EVENTS_BASE;
    for (const v of this.cargadas.values()) ev = ev.concat(v);
    EVENTS = ev;
    _eventWordSets = null; _eventDf = null;   // el índice del buscador se rehace
    this.avisar();
  },
  // Se llama en cada cambio de año: carga las eras instaladas que toca la
  // ventana [anio-tol, anio+tol] y suelta las que ya no.
  asegurar(anio, tol) {
    this.ultimoAnio = anio; this.ultimaTol = tol || 0;
    if (!this.listo) return;
    const necesarias = ERAS.filter(r => anio + this.ultimaTol >= r.desde && anio - this.ultimaTol < r.hasta).map(r => r.id);
    let cambio = false;
    for (const id of Array.from(this.cargadas.keys())) if (!necesarias.includes(id)) { this.cargadas.delete(id); cambio = true; }
    if (cambio) this.recomponer();
    for (const id of necesarias) {
      if (this.instalados[id] && !this.cargadas.has(id) && !this.cargando[id]) {
        this.cargando[id] = true;
        this.cargar(id).catch(() => { delete this.instalados[id]; this.guardarInstalados(); }).then(() => { delete this.cargando[id]; });
      }
    }
  },
};
function fmtBytes(b) { return b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB'; }`);

parche('sendPins: asegurar la era del año',
"    const rounded = Math.round(yr);\n    if (!force && Math.abs(rounded - lastPinsSentRef.current) < 2) return;\n    lastPinsSentRef.current = rounded;\n    const pinsJson = makeEventsJSON(rounded, cats, tol, paletteRef.current);",
"    const rounded = Math.round(yr);\n    Paquetes.asegurar(rounded, tol);\n    if (!force && Math.abs(rounded - lastPinsSentRef.current) < 2) return;\n    lastPinsSentRef.current = rounded;\n    const pinsJson = makeEventsJSON(rounded, cats, tol, paletteRef.current);");

parche('arranque del gestor y repintado al cargar una era',
"  const lastStoreSyncRef = useRef(0);\n  const playIntervalRef = useRef(null);",
`  // Paquetes: al arrancar lee qué eras hay instaladas; cada vez que una era
  // entra o sale de memoria, el globo se repinta con los eventos que toca.
  useEffect(() => {
    const off = Paquetes.suscribir(() => {
      lastPinsSentRef.current = -99999;
      sendPins(yearRef.current, activeCatRef.current, toleranceRef.current, true);
    });
    Paquetes.iniciar();
    return off;
  }, []); // eslint-disable-line

  const lastStoreSyncRef = useRef(0);
  const playIntervalRef = useRef(null);`);

parche('UnifiedDrawer: prop anioActual',
"  showCultures, onToggleCultures,\n  onClose,\n}) {\n  const { fontSize } = useContext(SettingsContext);",
"  showCultures, onToggleCultures,\n  anioActual,\n  onClose,\n}) {\n  const { fontSize } = useContext(SettingsContext);");

parche('UnifiedDrawer: sección Detalle por era',
"          <View style={drawerSt.divider} />\n\n          {/* ── PROCESOS ────────────────────────────── */}",
"          <View style={drawerSt.divider} />\n\n          {/* ── DETALLE POR ERA (paquetes descargables) ── */}\n          <SeccionPaquetes anio={anioActual} fontSize={fontSize} />\n\n          <View style={drawerSt.divider} />\n\n          {/* ── PROCESOS ────────────────────────────── */}");

parche('llamada a UnifiedDrawer con el año',
"            showCultures={processLayers.showCultures} onToggleCultures={toggleCultures}\n            onClose={() => setShowDrawer(false)}\n          />",
"            showCultures={processLayers.showCultures} onToggleCultures={toggleCultures}\n            anioActual={year}\n            onClose={() => setShowDrawer(false)}\n          />");

parche('componente SeccionPaquetes',
"function HamburgerIcon({ color = 'rgba(255,255,255,0.75)' }) {",
`// ─── SeccionPaquetes ─────────────────────────────────────────────────────────
// Una fila por era: nombre, eventos y peso, y el estado del paquete. La era
// del año actual va marcada. Sin red se enseña lo instalado y se dice.
function FilaEra({ era, m, inst, est, actual, nuevo, fontSize }) {
  const info = m ? (m.eventos + ' eventos · ' + fmtBytes(m.bytes)) : inst ? (inst.eventos + ' eventos · ' + fmtBytes(inst.bytes)) : 'sin información';
  const color = actual ? '#fff' : 'rgba(255,255,255,0.55)';
  let derecha;
  if (est === 'descargando') derecha = <ActivityIndicator size="small" color="#378ADD" />;
  else if (est === 'error') derecha = (
    <TouchableOpacity onPress={() => Paquetes.descargar(era.id)} style={paqSt.btn}><Text style={paqSt.btnTxtErr}>Reintentar</Text></TouchableOpacity>);
  else if (inst && nuevo) derecha = (
    <TouchableOpacity onPress={() => Paquetes.descargar(era.id)} style={paqSt.btn}><ArrowsClockwise size={14} color="#378ADD" /><Text style={paqSt.btnTxt}>Actualizar</Text></TouchableOpacity>);
  else if (inst) derecha = (
    <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
      <CheckCircle size={16} color="#5BBF7A" weight="fill" />
      <TouchableOpacity onPress={() => Paquetes.quitar(era.id)} hitSlop={8}><Trash size={15} color="rgba(255,255,255,0.35)" /></TouchableOpacity>
    </View>);
  else if (m) derecha = (
    <TouchableOpacity onPress={() => Paquetes.descargar(era.id)} style={paqSt.btn}><DownloadSimple size={14} color="#378ADD" /><Text style={paqSt.btnTxt}>Descargar</Text></TouchableOpacity>);
  else derecha = <Text style={paqSt.sinRed}>—</Text>;
  return (
    <View style={[drawerSt.row, actual && { borderColor:'rgba(55,138,221,0.45)', backgroundColor:'rgba(55,138,221,0.08)' }]}>
      <View style={{ flex:1 }}>
        <Text style={[drawerSt.rowLabel, { color, fontSize }]}>{era.nombre}</Text>
        <Text style={paqSt.info}>{info + (inst && inst.fecha ? ' · ' + inst.fecha : '')}</Text>
      </View>
      {derecha}
    </View>
  );
}
function SeccionPaquetes({ anio, fontSize }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const off = Paquetes.suscribir(() => tick(t => t + 1));
    Paquetes.pedirManifiesto();
    return off;
  }, []);
  const man = Paquetes.manifiesto;
  const actual = Paquetes.eraDe(anio == null ? 2000 : anio).id;
  const filas = ERAS.map(era => ({ era, m: man && man.eras.find(x => x.id === era.id), inst: Paquetes.instalados[era.id], est: Paquetes.estado[era.id], nuevo: Paquetes.hayNuevo(era.id) }));
  const faltan = filas.filter(f => f.m && (!f.inst || f.nuevo));
  const bytesFaltan = faltan.reduce((s, f) => s + (f.m.bytes || 0), 0);
  const nDesc = filas.filter(f => f.est === 'descargando').length;
  return (
    <View>
      <Text style={[drawerSt.sectionLabel, { marginTop:20 }]}>Detalle por era</Text>
      <Text style={drawerSt.sectionSub}>
        {'La app trae de serie el canon y lo más notable del fondo. Cada era puede descargar su fondo detallado; tú eliges cuánto cargar.'
          + (man && man.fecha ? ' Datos del ' + man.fecha + '.' : '')
          + (!man && Paquetes.error ? ' Sin conexión: se muestra lo instalado.' : '')}
      </Text>
      <View style={drawerSt.section}>
        {filas.map(f => <FilaEra key={f.era.id} {...f} actual={f.era.id === actual} fontSize={fontSize} />)}
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:4, marginTop:4 }}>
          <Text style={paqSt.info}>{'Espacio usado: ' + fmtBytes(Paquetes.espacio())}</Text>
          {faltan.length > 0 && nDesc === 0 && (
            <TouchableOpacity onPress={() => faltan.forEach(f => Paquetes.descargar(f.era.id))} style={paqSt.btn}>
              <DownloadSimple size={14} color="#378ADD" />
              <Text style={paqSt.btnTxt}>{'Instalar todo · ' + fmtBytes(bytesFaltan)}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
const paqSt = StyleSheet.create({
  info:      { color:'rgba(255,255,255,0.32)', fontSize:11, marginTop:2 },
  btn:       { flexDirection:'row', alignItems:'center', gap:5, paddingVertical:6, paddingHorizontal:10, borderRadius:10, borderWidth:0.5, borderColor:'rgba(55,138,221,0.4)', backgroundColor:'rgba(55,138,221,0.10)' },
  btnTxt:    { color:'#378ADD', fontSize:12, fontWeight:'600' },
  btnTxtErr: { color:'#D85A30', fontSize:12, fontWeight:'600' },
  sinRed:    { color:'rgba(255,255,255,0.25)', fontSize:12 },
});

function HamburgerIcon({ color = 'rgba(255,255,255,0.75)' }) {`);

let ok=true; for(const p of P){ const n=cuenta(src,p.a); if(n!==1){ console.log('   ?? ancla '+(n===0?'no encontrada':'repetida x'+n)+': '+p.n); ok=false } }
if(!ok){ console.log('no se aplica nada'); process.exit(1) }
for(const p of P){ src=src.replace(p.a,()=>p.b); console.log('   ok '+p.n) }
if(APLICA){ fs.writeFileSync(ruta,src); console.log('escrito '+ruta) } else console.log('(sin --aplica no se escribe)');
