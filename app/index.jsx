/**
 * BlueDot — index.jsx (merged single-file app)
 * Two WebViews, always mounted. Orbital + Globe share one React component.
 * No React Navigation. Screen switch = opacity swap + canvas zoom animation.
 *
 * Install: npm install phosphor-react-native
 */
import React, {
  useRef, useState, useCallback, useEffect,
  createContext, useContext,
} from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  StatusBar, Animated, ScrollView, ActivityIndicator,
  Pressable, Linking, TextInput, PanResponder,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTimeStore } from '../store/timeStore';
import EVENTS_RAW from '../data/events_extended.json';
import {
  PROCESS_META,
  getActiveReligions,
} from '../data/events';

// ─── Languages — 20 most spoken, with geographic rings per era ────────────────
// Each language has multiple periods showing geographic expansion over time.
// ring = [[lon,lat], ...] polygon approximating where the language was dominant.
const LANGUAGES = [
  {
    id:'mandarin', name:'Chino Mandarín', color:'#E24B4A', wikiTitle:'Chino mandarín',
    periods:[
      { start:-1000, end:200,  ring:[[105,35],[115,40],[120,35],[118,25],[112,22],[105,25],[100,30],[105,35]] },
      { start:200,   end:1300, ring:[[98,30],[110,42],[122,40],[122,30],[118,22],[108,20],[100,25],[98,30]] },
      { start:1300,  end:2025, ring:[[80,48],[88,52],[100,52],[122,50],[130,42],[128,30],[122,22],[108,18],[98,22],[88,28],[80,38],[80,48]] },
    ],
  },
  {
    id:'english', name:'Inglés', color:'#378ADD', wikiTitle:'Idioma inglés',
    periods:[
      { start:1000,  end:1600, ring:[[-5,50],[2,52],[2,58],[-3,58],[-5,55],[-5,50]] },
      { start:1600,  end:1800, ring:[[-80,48],[-70,44],[-5,50],[2,58],[-3,62],[-80,48]] },
      { start:1800,  end:2025, ring:[[-125,50],[-70,44],[-5,50],[2,58],[10,55],[150,-30],[145,-38],[115,-32],[130,15],[80,30],[60,25],[-125,50]] },
    ],
  },
  {
    id:'spanish', name:'Español', color:'#EF9F27', wikiTitle:'Idioma español',
    periods:[
      { start:1000,  end:1492, ring:[[-9,36],[-9,44],[-3,44],[-3,36],[-9,36]] },
      { start:1492,  end:1600, ring:[[-9,44],[-3,44],[-3,36],[-9,36],[-70,0],[-80,-5],[-75,-15],[-65,-20],[-70,0]] },
      { start:1600,  end:2025, ring:[[-9,44],[-3,44],[-3,36],[-9,36],[-60,12],[-82,8],[-80,-56],[-68,-55],[-35,-5],[0,5],[-9,44]] },
    ],
  },
  {
    id:'hindi', name:'Hindi', color:'#FF6B35', wikiTitle:'Idioma hindi',
    periods:[
      { start:-500,  end:1000, ring:[[72,22],[78,28],[84,26],[82,18],[76,14],[72,18],[72,22]] },
      { start:1000,  end:2025, ring:[[68,24],[74,32],[80,30],[88,26],[86,18],[80,10],[74,10],[68,18],[68,24]] },
    ],
  },
  {
    id:'arabic', name:'Árabe', color:'#9B59B6', wikiTitle:'Idioma árabe',
    periods:[
      { start:-500,  end:630,  ring:[[36,22],[46,22],[50,16],[44,12],[36,16],[36,22]] },
      { start:630,   end:900,  ring:[[36,38],[46,38],[60,24],[50,12],[36,14],[20,28],[10,30],[36,38]] },
      { start:900,   end:2025, ring:[[-18,30],[15,32],[36,38],[56,24],[60,14],[50,10],[36,12],[24,10],[8,10],[-18,20],[-18,30]] },
    ],
  },
  {
    id:'french', name:'Francés', color:'#1ABC9C', wikiTitle:'Idioma francés',
    periods:[
      { start:800,   end:1600, ring:[[-5,44],[8,48],[8,44],[-3,42],[-5,44]] },
      { start:1600,  end:1800, ring:[[-5,44],[8,50],[8,44],[-3,42],[-18,20],[0,5],[-5,44]] },
      { start:1800,  end:2025, ring:[[-5,44],[8,50],[8,44],[28,2],[18,-5],[0,-5],[-18,20],[-5,44]] },
    ],
  },
  {
    id:'bengali', name:'Bengalí', color:'#D85A30', wikiTitle:'Idioma bengalí',
    periods:[
      { start:1000,  end:2025, ring:[[88,28],[92,26],[92,20],[88,18],[84,22],[88,28]] },
    ],
  },
  {
    id:'portuguese', name:'Portugués', color:'#2ECC71', wikiTitle:'Idioma portugués',
    periods:[
      { start:1000,  end:1500, ring:[[-9,42],[-6,42],[-6,36],[-9,36],[-9,42]] },
      { start:1500,  end:2025, ring:[[-9,42],[-6,42],[-6,36],[-9,36],[-35,-5],[-48,-28],[-52,-34],[-44,-23],[-35,-8],[8,-2],[32,-26],[38,-22],[35,-10],[-9,42]] },
    ],
  },
  {
    id:'russian', name:'Ruso', color:'#7F77DD', wikiTitle:'Idioma ruso',
    periods:[
      { start:900,   end:1300, ring:[[32,56],[38,58],[36,52],[30,52],[32,56]] },
      { start:1300,  end:1700, ring:[[28,58],[60,60],[60,50],[40,46],[28,52],[28,58]] },
      { start:1700,  end:2025, ring:[[28,58],[80,68],[140,68],[180,62],[168,52],[136,46],[80,50],[60,44],[40,44],[28,52],[28,58]] },
    ],
  },
  {
    id:'urdu', name:'Urdu', color:'#E67E22', wikiTitle:'Idioma urdu',
    periods:[
      { start:1200,  end:2025, ring:[[62,28],[72,36],[78,32],[76,24],[68,20],[62,24],[62,28]] },
    ],
  },
  {
    id:'javanese', name:'Javanés', color:'#27AE60', wikiTitle:'Idioma javanés',
    periods:[
      { start:-500,  end:2025, ring:[[106,-6],[112,-6],[112,-8],[106,-8],[106,-6]] },
    ],
  },
  {
    id:'german', name:'Alemán', color:'#BDC3C7', wikiTitle:'Idioma alemán',
    periods:[
      { start:500,   end:1200, ring:[[8,48],[16,52],[16,48],[8,46],[8,48]] },
      { start:1200,  end:2025, ring:[[6,48],[16,55],[18,50],[16,46],[12,46],[8,46],[6,48]] },
    ],
  },
  {
    id:'japanese', name:'Japonés', color:'#E74C3C', wikiTitle:'Idioma japonés',
    periods:[
      { start:-500,  end:2025, ring:[[130,34],[142,44],[146,44],[144,40],[136,32],[130,32],[130,34]] },
    ],
  },
  {
    id:'swahili', name:'Suajili', color:'#F39C12', wikiTitle:'Idioma suajili',
    periods:[
      { start:800,   end:1500, ring:[[38,-5],[40,-10],[36,-12],[34,-8],[38,-5]] },
      { start:1500,  end:2025, ring:[[28,-2],[40,-12],[40,-16],[34,-20],[28,-16],[24,-8],[28,-2]] },
    ],
  },
  {
    id:'turkish', name:'Turco', color:'#8E44AD', wikiTitle:'Idioma turco',
    periods:[
      { start:900,   end:1200, ring:[[60,42],[72,44],[72,38],[60,36],[60,42]] },
      { start:1200,  end:2025, ring:[[26,42],[36,42],[44,40],[36,36],[28,36],[26,40],[26,42]] },
    ],
  },
  {
    id:'korean', name:'Coreano', color:'#3498DB', wikiTitle:'Idioma coreano',
    periods:[
      { start:-300,  end:2025, ring:[[124,34],[130,38],[130,34],[126,34],[124,34]] },
    ],
  },
  {
    id:'vietnamese', name:'Vietnamita', color:'#E91E63', wikiTitle:'Idioma vietnamita',
    periods:[
      { start:-200,  end:2025, ring:[[102,22],[108,22],[108,10],[104,10],[102,14],[102,22]] },
    ],
  },
  {
    id:'telugu', name:'Telugu', color:'#FF5722', wikiTitle:'Idioma telugu',
    periods:[
      { start:-500,  end:2025, ring:[[78,18],[84,18],[84,14],[80,12],[78,14],[78,18]] },
    ],
  },
  {
    id:'marathi', name:'Maratí', color:'#009688', wikiTitle:'Idioma maratí',
    periods:[
      { start:1000,  end:2025, ring:[[72,22],[78,22],[80,18],[76,16],[72,18],[72,22]] },
    ],
  },
  {
    id:'persian', name:'Persa', color:'#795548', wikiTitle:'Idioma persa',
    periods:[
      { start:-550,  end:700,  ring:[[44,38],[60,38],[62,26],[54,22],[44,26],[44,38]] },
      { start:700,   end:2025, ring:[[44,38],[62,40],[70,38],[68,28],[56,22],[44,26],[44,38]] },
    ],
  },
];

function getActiveLanguages(year) {
  return LANGUAGES.map(function(lang){
    // Find the latest applicable period
    var period=null;
    for(var i=lang.periods.length-1;i>=0;i--){
      if(year>=lang.periods[i].start){period=lang.periods[i];break;}
    }
    if(!period||year>period.end+200)return null; // fade out 200yr after last period ends
    return { id:lang.id, name:lang.name, color:lang.color, ring:period.ring, wikiTitle:lang.wikiTitle };
  }).filter(Boolean);
}

// ─── Migration flows — 20 routes, -3000 to present ───────────────────────────
const MIGRATIONS = [
  // ── Antigüedad ────────────────────────────────────────────────────────────
  {
    id: 'bantu', name: 'Expansión Bantú', color: '#2ECC71', type: 'land',
    yearStart: -1000, yearEnd: 500,
    waypoints: [
      { lat: 4,  lon: 10 }, { lat: -5, lon: 15 }, { lat: -10, lon: 25 },
      { lat: -20, lon: 30 }, { lat: -30, lon: 30 },
    ],
  },
  {
    id: 'phoenician', name: 'Colonización Fenicia', color: '#9B59B6', type: 'sea',
    yearStart: -1000, yearEnd: -500,
    waypoints: [
      { lat: 34, lon: 36 }, { lat: 36, lon: 18 }, { lat: 37, lon: 12 },
      { lat: 36, lon: 5 },  { lat: 35, lon: -5 }, { lat: 32, lon: -9 },
    ],
  },
  {
    id: 'greek_colonies', name: 'Colonización Griega', color: '#378ADD', type: 'sea',
    yearStart: -800, yearEnd: -500,
    waypoints: [
      { lat: 38, lon: 23 }, { lat: 41, lon: 29 }, { lat: 46, lon: 31 },
      { lat: 43, lon: 25 }, { lat: 38, lon: 15 }, { lat: 37, lon: 7  },
    ],
  },
  {
    id: 'celtic', name: 'Expansión Celta', color: '#EF9F27', type: 'land',
    yearStart: -800, yearEnd: -200,
    waypoints: [
      { lat: 48, lon: 10 }, { lat: 50, lon: 0  }, { lat: 51, lon: -3 },
      { lat: 44, lon: 2  }, { lat: 42, lon: -4 }, { lat: 48, lon: 18 },
    ],
  },
  {
    id: 'silk_road_people', name: 'Migraciones de la Ruta de la Seda', color: '#D85A30', type: 'land',
    yearStart: -200, yearEnd: 500,
    waypoints: [
      { lat: 39, lon: 116 }, { lat: 40, lon: 90 }, { lat: 40, lon: 65 },
      { lat: 38, lon: 55  }, { lat: 36, lon: 45 }, { lat: 37, lon: 36 },
    ],
  },
  {
    id: 'hun', name: 'Invasiones Hunas', color: '#E24B4A', type: 'land',
    yearStart: 370, yearEnd: 455,
    waypoints: [
      { lat: 48, lon: 65 }, { lat: 48, lon: 50 }, { lat: 47, lon: 35 },
      { lat: 47, lon: 20 }, { lat: 48, lon: 10 }, { lat: 46, lon: 2  },
    ],
  },
  // ── Edad Media ────────────────────────────────────────────────────────────
  {
    id: 'arab_expansion', name: 'Expansión Árabe', color: '#E67E22', type: 'land',
    yearStart: 630, yearEnd: 750,
    waypoints: [
      { lat: 24, lon: 45 }, { lat: 30, lon: 35 }, { lat: 32, lon: 20 },
      { lat: 36, lon: 5  }, { lat: 38, lon: -5 },
    ],
  },
  {
    id: 'arab_east', name: 'Expansión Árabe hacia Persia', color: '#E67E22', type: 'land',
    yearStart: 630, yearEnd: 750,
    waypoints: [
      { lat: 24, lon: 45 }, { lat: 32, lon: 55 }, { lat: 36, lon: 65 }, { lat: 34, lon: 70 },
    ],
  },
  {
    id: 'vikings', name: 'Vikingos al Atlántico', color: '#9B59B6', type: 'sea',
    yearStart: 800, yearEnd: 1100,
    waypoints: [
      { lat: 60, lon: 8  }, { lat: 65, lon: -18 }, { lat: 64, lon: -22 },
      { lat: 61, lon: -45 }, { lat: 62, lon: -52 }, { lat: 52, lon: -56 },
    ],
  },
  {
    id: 'polynesia', name: 'Expansión Polinesiana', color: '#1ABC9C', type: 'sea',
    yearStart: -500, yearEnd: 1300,
    waypoints: [
      { lat: 15, lon: 145 }, { lat: 5,  lon: 160 }, { lat: -15, lon: -170 },
      { lat: -20, lon: -150 }, { lat: -18, lon: -138 }, { lat: -27, lon: -109 },
    ],
  },
  {
    id: 'polynesia_nz', name: 'Polinesios a Nueva Zelanda', color: '#1ABC9C', type: 'sea',
    yearStart: 1000, yearEnd: 1300,
    waypoints: [
      { lat: -18, lon: -175 }, { lat: -25, lon: 178 }, { lat: -36, lon: 175 },
    ],
  },
  {
    id: 'mongol', name: 'Expansión Mongola', color: '#888780', type: 'land',
    yearStart: 1206, yearEnd: 1370,
    waypoints: [
      { lat: 48, lon: 106 }, { lat: 47, lon: 80  }, { lat: 45, lon: 55 },
      { lat: 42, lon: 35  }, { lat: 52, lon: 25  }, { lat: 30, lon: 50 },
    ],
  },
  // ── Edad Moderna ──────────────────────────────────────────────────────────
  {
    id: 'slave_trade', name: 'Trata Atlántica de Esclavos', color: '#E24B4A', type: 'sea',
    yearStart: 1500, yearEnd: 1850,
    waypoints: [
      { lat: 5,   lon: 0  }, { lat: 0,   lon: -15 }, { lat: 8,  lon: -40 },
      { lat: 15,  lon: -70 }, { lat: 20,  lon: -80 },
    ],
  },
  {
    id: 'european_americas', name: 'Colonización Europea de América', color: '#7F77DD', type: 'sea',
    yearStart: 1492, yearEnd: 1800,
    waypoints: [
      { lat: 45, lon: -5  }, { lat: 35, lon: -20 }, { lat: 20, lon: -40 },
      { lat: 15, lon: -65 }, { lat: 25, lon: -80 },
    ],
  },
  {
    id: 'portuguese_asia', name: 'Ruta Portuguesa a Asia', color: '#F5A623', type: 'sea',
    yearStart: 1498, yearEnd: 1700,
    waypoints: [
      { lat: 38, lon: -9  }, { lat: 15, lon: -20 }, { lat: -10, lon: 15 },
      { lat: -34, lon: 18 }, { lat: -20, lon: 40  }, { lat: 12, lon: 44 },
      { lat: 20, lon: 65  }, { lat: 10, lon: 76  },
    ],
  },
  // ── Siglos XIX-XX ─────────────────────────────────────────────────────────
  {
    id: 'european_emigration', name: 'Emigración Europea a América', color: '#378ADD', type: 'sea',
    yearStart: 1830, yearEnd: 1950,
    waypoints: [
      { lat: 52, lon: -5  }, { lat: 45, lon: -20 }, { lat: 35, lon: -35 },
      { lat: 25, lon: -55 }, { lat: 40, lon: -74 },
    ],
  },
  {
    id: 'european_australia', name: 'Emigración Europea a Australia', color: '#2980B9', type: 'sea',
    yearStart: 1788, yearEnd: 1950,
    waypoints: [
      { lat: 51, lon: -1  }, { lat: 35, lon: -10 }, { lat: 10, lon: 20 },
      { lat: -10, lon: 50 }, { lat: -20, lon: 80  }, { lat: -33, lon: 115},
    ],
  },
  {
    id: 'great_migration', name: 'Gran Migración Afroamericana', color: '#D85A30', type: 'land',
    yearStart: 1910, yearEnd: 1970,
    waypoints: [
      { lat: 32, lon: -90 }, { lat: 36, lon: -88 }, { lat: 40, lon: -85 },
      { lat: 42, lon: -83 }, { lat: 41, lon: -87 }, { lat: 40, lon: -74 },
    ],
  },
  // ── Contemporáneo ─────────────────────────────────────────────────────────
  {
    id: 'partition_india', name: 'Partición de India-Pakistán', color: '#E74C3C', type: 'land',
    yearStart: 1947, yearEnd: 1950,
    waypoints: [
      { lat: 30, lon: 70 }, { lat: 28, lon: 73 }, { lat: 27, lon: 77 },
      { lat: 25, lon: 80 },
    ],
  },
  {
    id: 'syrian_refugees', name: 'Crisis de Refugiados Sirios', color: '#BDC3C7', type: 'land',
    yearStart: 2011, yearEnd: 2025,
    waypoints: [
      { lat: 35, lon: 38 }, { lat: 37, lon: 36 }, { lat: 39, lon: 30 },
      { lat: 42, lon: 25 }, { lat: 45, lon: 18 }, { lat: 48, lon: 14 },
    ],
  },
];

function getActiveMigrations(year) {
  return MIGRATIONS.filter(m => year >= m.yearStart && year <= m.yearEnd);
}
const EVENTS = EVENTS_RAW;
import {
  Info, Gear, MagnifyingGlass, List,
  User, Buildings, Sword, Flask, MaskHappy,
  MapTrifold, Boat, Compass, Star, ChatCircle,
  Lightning, Globe, BookOpen,
  TextT, Calendar, Eye,
  Tag, Planet, Books, Warning, Heart,
  Skull, Shield, Play, Pause,
  Mountains,
} from 'phosphor-react-native';

const { width: SW, height: SH } = Dimensions.get('window');
const ICON_DIM    = 'rgba(255,255,255,0.55)';
const ICON_BRIGHT = '#fff';

// ─── Settings Context ─────────────────────────────────────────────────────────
export const SettingsContext = createContext({
  fontSize:14, daltonism:false, contrast:false, calendar:'gregorian', language:'es', update:()=>{},
});

// Paleta normal vs daltonismo (deuteranopía-friendly: evita rojo/verde puro)
const PALETTES = {
  normal:   { personas:'#D85A30', politica:'#378ADD', batallas:'#E24B4A', inventos:'#7F77DD', cultura:'#EF9F27', desastres:'#FF6B35', exploracion:'#2ECC71', religion:'#9B59B6' },
  daltonism:{ personas:'#F5A623', politica:'#4A90D9', batallas:'#8E44AD', inventos:'#1ABC9C', cultura:'#3498DB', desastres:'#E67E22', exploracion:'#27AE60', religion:'#D35400' },
};

// ─── Category metadata — label, color, icon key ───────────────────────────────
const CATEGORY_META = {
  personas:   { label:'Personas',    color:'#D85A30', emoji:'👤' },
  politica:   { label:'Política',    color:'#378ADD', emoji:'🏛' },
  batallas:   { label:'Batallas',    color:'#E24B4A', emoji:'⚔️' },
  inventos:   { label:'Inventos',    color:'#7F77DD', emoji:'🔬' },
  cultura:    { label:'Cultura',     color:'#EF9F27', emoji:'🎭' },
  desastres:  { label:'Desastres',   color:'#FF6B35', emoji:'⚠️' },
  exploracion:{ label:'Exploración', color:'#2ECC71', emoji:'🧭' },
  religion:   { label:'Religión',    color:'#9B59B6', emoji:'✨' },
};

// Traducciones
const STRINGS = {
  es: {
    eventos:'Eventos', procesos:'Procesos', ventanaTiempo:'Ventana de tiempo',
    momentosPuntuales:'Momentos puntuales en el tiempo',
    fenomenosEvolucionan:'Fenómenos que evolucionan con el tiempo',
    anyosAlrededor:'Cuántos años alrededor del año actual se muestran',
    anyoExacto:'Año exacto', capas:'Capas',
    buscar:'Buscar evento, persona, año…',
    sinResultados:'Sin resultados para',
    ajustes:'Ajustes', acercaDe:'Acerca de BlueDot',
    lento:'lento', rapido:'rápido',
  },
  en: {
    eventos:'Events', procesos:'Processes', ventanaTiempo:'Time window',
    momentosPuntuales:'Single moments in time',
    fenomenosEvolucionan:'Phenomena that evolve over time',
    anyosAlrededor:'Years shown around current year',
    anyoExacto:'Exact year', capas:'Layers',
    buscar:'Search event, person, year…',
    sinResultados:'No results for',
    ajustes:'Settings', acercaDe:'About BlueDot',
    lento:'slow', rapido:'fast',
  },
  pt: {
    eventos:'Eventos', procesos:'Processos', ventanaTiempo:'Janela de tempo',
    momentosPuntuales:'Momentos pontuais no tempo',
    fenomenosEvolucionan:'Fenômenos que evoluem com o tempo',
    anyosAlrededor:'Anos ao redor do ano atual',
    anyoExacto:'Ano exato', capas:'Camadas',
    buscar:'Buscar evento, pessoa, ano…',
    sinResultados:'Sem resultados para',
    ajustes:'Configurações', acercaDe:'Sobre o BlueDot',
    lento:'lento', rapido:'rápido',
  },
  fr: {
    eventos:'Événements', procesos:'Processus', ventanaTiempo:'Fenêtre temporelle',
    momentosPuntuales:'Moments ponctuels dans le temps',
    fenomenosEvolucionan:'Phénomènes qui évoluent dans le temps',
    anyosAlrededor:'Années autour de l\'année actuelle',
    anyoExacto:'Année exacte', capas:'Couches',
    buscar:'Chercher événement, personne, année…',
    sinResultados:'Aucun résultat pour',
    ajustes:'Paramètres', acercaDe:'À propos de BlueDot',
    lento:'lent', rapido:'rapide',
  },
};

// Format year according to calendar setting
function formatYear(y, calendar) {
  const r = Math.round(y);
  if (calendar === 'islamic') {
    // Approximate Hijri: subtract 622 and divide by 0.97
    const hijri = r > 622 ? Math.round((r - 622) / 0.97) : null;
    if (hijri && hijri > 0) return `${hijri} AH`;
  }
  if (calendar === 'hebrew') {
    // Approximate Hebrew: add 3761
    const hebrew = r + 3761;
    if (hebrew > 0) return `${hebrew} AM`;
  }
  // Gregorian and Julian: same display
  return r < 0 ? `${Math.abs(r)} a.C.` : `${r} d.C.`;
}

export const SettingsProvider = ({ children }) => {
  const [s, setS] = useState({
    fontSize:14, daltonism:false, contrast:false, calendar:'gregorian', language:'es',
  });
  const update = useCallback((p) => setS(prev => ({ ...prev, ...p })), []);
  // Derive theme values
  const palette = s.daltonism ? PALETTES.daltonism : PALETTES.normal;
  const strings = STRINGS[s.language] || STRINGS.es;
  const bgColor = s.contrast ? '#000' : '#04040d';
  const textOpacity = s.contrast ? 1.0 : 0.75;
  return (
    <SettingsContext.Provider value={{ ...s, update, palette, strings, bgColor, textOpacity, formatYear }}>
      {children}
    </SettingsContext.Provider>
  );
};

// ─── Category / Process icon helpers ─────────────────────────────────────────
const CAT_ICONS = {
  personas:   (sz,c)=><User       size={sz} color={c} weight="duotone" />,
  politica:   (sz,c)=><Buildings  size={sz} color={c} weight="duotone" />,
  batallas:   (sz,c)=><Sword      size={sz} color={c} weight="duotone" />,
  inventos:   (sz,c)=><Flask      size={sz} color={c} weight="duotone" />,
  cultura:    (sz,c)=><MaskHappy  size={sz} color={c} weight="duotone" />,
  desastres:  (sz,c)=><Warning    size={sz} color={c} weight="duotone" />,
  exploracion:(sz,c)=><Compass    size={sz} color={c} weight="duotone" />,
  religion:   (sz,c)=><Star       size={sz} color={c} weight="duotone" />,
};
const PROC_ICONS = {
  civilizations:(sz,c)=><MapTrifold size={sz} color={c} weight="duotone" />,
  routes:       (sz,c)=><Boat       size={sz} color={c} weight="duotone" />,
  wars:         (sz,c)=><Shield      size={sz} color={c} weight="duotone" />,
  migration:    (sz,c)=><Compass    size={sz} color={c} weight="duotone" />,
  religion:     (sz,c)=><Star       size={sz} color={c} weight="duotone" />,
  languages:    (sz,c)=><ChatCircle size={sz} color={c} weight="duotone" />,
};
function CatIcon({ cat, size=16, color=ICON_DIM }) {
  const fn = CAT_ICONS[cat]; return fn ? fn(size, color) : null;
}
function ProcIcon({ proc, size=16, color=ICON_DIM }) {
  const fn = PROC_ICONS[proc]; return fn ? fn(size, color) : null;
}

// ─── Cinematics data ─────────────────────────────────────────────────────────
// ─── Datos cinemáticos (copiados de cinematic.jsx) ───────────────────────────
const CIVILIZATIONS = [
  { id:'egypt', name:'Egipto', color:'#EF9F27',
    periods:[{ start:-3100, end:30, ring:[[32,31],[35,30],[37,28],[35,24],[33,22],[30,22],[28,24],[26,27],[24,29],[25,31],[27,32],[30,32],[32,31]]}]},
  { id:'mesopotamia', name:'Mesopotamia', color:'#D85A30',
    periods:[{ start:-3500, end:-539, ring:[[38,37],[44,37],[48,34],[50,30],[47,29],[44,29],[40,31],[36,33],[35,36],[38,37]]}]},
  { id:'persia', name:'Imperio Persa', color:'#7F77DD',
    periods:[
      { start:-550, end:-330, ring:[[35,38],[44,40],[55,38],[62,35],[65,32],[60,25],[54,24],[48,26],[40,30],[36,33],[35,38]]},
      { start:-330, end:651,  ring:[[35,38],[44,40],[55,38],[65,35],[72,33],[68,27],[58,24],[48,26],[40,30],[36,33],[35,38]]}]},
  { id:'greece', name:'Grecia', color:'#378ADD',
    periods:[{ start:-800, end:-146, ring:[[20,42],[24,42],[28,41],[30,38],[28,36],[24,36],[20,37],[18,38],[18,40],[20,42]]}]},
  { id:'rome', name:'Roma', color:'#D4537E',
    periods:[
      { start:-509, end:-264, ring:[[6,44],[8,46],[12,46],[14,44],[16,42],[16,40],[14,38],[12,37],[10,37],[8,38],[7,40],[6,42],[6,44]]},
      { start:-264, end:-100, ring:[[-2,36],[6,44],[8,46],[14,46],[18,46],[24,42],[26,40],[28,38],[24,36],[20,34],[14,38],[8,36],[2,36],[-2,36]]},
      { start:-100, end:14,   ring:[[-6,36],[0,38],[6,44],[10,54],[14,54],[18,50],[24,46],[32,36],[36,34],[36,30],[30,28],[24,28],[20,30],[12,34],[8,36],[2,36],[-4,34],[-6,36]]},
      { start:14,   end:200,  ring:[[-6,36],[0,38],[6,44],[10,54],[14,54],[20,50],[28,46],[36,44],[42,38],[44,36],[36,30],[30,28],[24,28],[20,30],[14,34],[8,36],[2,36],[-4,34],[-6,36]]},
      { start:200,  end:395,  ring:[[-4,36],[0,38],[6,44],[10,52],[14,52],[20,48],[28,44],[36,42],[40,36],[36,30],[30,28],[24,28],[20,30],[14,34],[8,36],[2,36],[-2,34],[-4,36]]},
      { start:395,  end:476,  ring:[[-6,36],[0,38],[6,44],[10,52],[14,52],[16,48],[20,46],[24,44],[22,36],[16,32],[12,34],[8,36],[2,36],[-4,34],[-6,36]]}]},
  { id:'han', name:'Dinastía Han', color:'#1D9E75',
    periods:[{ start:-206, end:220, ring:[[100,40],[108,48],[116,48],[122,40],[122,32],[118,24],[110,22],[106,24],[100,28],[98,32],[100,40]]}]},
  { id:'byzantine', name:'Bizancio', color:'#9F77DD',
    periods:[
      { start:330, end:650,  ring:[[28,42],[36,40],[40,36],[36,30],[30,30],[24,36],[24,40],[28,42]]},
      { start:650, end:1453, ring:[[28,42],[34,40],[36,38],[32,34],[28,34],[26,38],[24,40],[28,42]]}]},
  { id:'umayyad', name:'Califato Omeya', color:'#EF7F27',
    periods:[{ start:661, end:750, ring:[[-6,36],[0,36],[8,36],[20,32],[28,28],[34,20],[42,14],[44,12],[40,10],[36,14],[32,16],[20,22],[10,26],[4,30],[0,32],[-4,34],[-6,36]]}]},
  { id:'abbasid', name:'Califato Abasí', color:'#D8A030',
    periods:[{ start:750, end:1258, ring:[[36,38],[44,40],[54,36],[62,28],[60,22],[52,18],[44,14],[36,16],[30,22],[28,28],[32,34],[36,38]]}]},
  { id:'tang', name:'Dinastía Tang', color:'#1D9E75',
    periods:[{ start:618, end:907, ring:[[74,40],[80,48],[88,48],[100,48],[110,50],[122,42],[122,30],[116,22],[108,20],[100,24],[92,28],[82,32],[74,36],[74,40]]}]},
  { id:'mongol', name:'Imperio Mongol', color:'#888780',
    periods:[{ start:1206, end:1368, ring:[[36,38],[44,40],[60,46],[80,48],[100,48],[116,48],[128,44],[128,38],[120,30],[108,26],[96,26],[80,30],[60,34],[44,34],[36,38]]}]},
  { id:'ottoman', name:'Imperio Otomano', color:'#D4537E',
    periods:[
      { start:1299, end:1453, ring:[[28,42],[36,40],[42,36],[38,30],[32,28],[28,30],[24,36],[24,40],[28,42]]},
      { start:1453, end:1922, ring:[[14,46],[24,48],[36,48],[44,44],[50,38],[44,30],[36,24],[28,24],[20,28],[14,32],[10,36],[12,40],[14,46]]}]},
  { id:'ming', name:'Dinastía Ming', color:'#1DAE85',
    periods:[{ start:1368, end:1644, ring:[[100,40],[108,48],[116,48],[122,40],[122,32],[118,24],[110,20],[106,22],[100,26],[96,30],[100,40]]}]},
  { id:'spanish', name:'Imperio Español', color:'#378ADD',
    periods:[{ start:1492, end:1898, ring:[[-120,48],[-80,32],[-68,0],[-72,-22],[-80,-40],[-76,-55],[-65,-45],[-50,-10],[-35,-5],[-20,4],[-10,4],[-10,36],[-18,28],[-120,48]]}]},
  { id:'british', name:'Imperio Británico', color:'#D85A30',
    periods:[
      { start:1600, end:1750, ring:[[-6,50],[-4,58],[0,60],[2,52],[0,50],[-4,48],[-6,50]]},
      { start:1750, end:1997, ring:[[-6,50],[-4,58],[0,60],[2,52],[0,50],[-4,48],[-6,50]]}]},
  { id:'mughal', name:'Imperio Mughal', color:'#7F77DD',
    periods:[{ start:1526, end:1857, ring:[[62,26],[68,28],[74,30],[80,30],[84,26],[80,18],[76,10],[70,8],[64,12],[58,18],[60,22],[62,26]]}]},
  { id:'qing', name:'Dinastía Qing', color:'#0DAE75',
    periods:[{ start:1644, end:1912, ring:[[80,48],[88,52],[100,52],[110,54],[122,50],[128,48],[130,40],[122,28],[116,22],[108,20],[98,24],[88,28],[80,36],[78,42],[80,48]]}]},
  { id:'usa', name:'Estados Unidos', color:'#5588DD',
    periods:[{ start:1776, end:2025, ring:[[-124,48],[-96,50],[-84,48],[-76,44],[-68,44],[-70,48],[-80,48],[-96,50],[-110,48],[-124,48]]}]},
  { id:'ussr', name:'URSS', color:'#DD3030',
    periods:[{ start:1922, end:1991, ring:[[28,54],[36,56],[48,56],[60,58],[80,60],[100,60],[120,60],[140,58],[140,50],[130,44],[120,38],[108,36],[96,34],[80,36],[68,36],[56,38],[44,40],[36,40],[30,44],[28,50],[28,54]]}]},
];

const TRADE_ROUTES = [
  { id:'silk_road',    name:'Ruta de la Seda',          color:'#EF9F27', wikiTitle:'Ruta de la Seda',
    desc:'Conectó Changan con Roma durante 1500 años. Transportó seda, porcelana, especias y religiones.',
    points:[[34,109],[39,95],[40,66],[38,58],[33,44],[36,36],[38,27],[37,14]], periods:[{start:-130,end:1453}]},
  { id:'spice',        name:'Ruta de las Especias',     color:'#D85A30', wikiTitle:'Comercio de especias',
    desc:'Las Islas Molucas producían clavo y nuez moscada que llegaba hasta Europa vía Arabia.',
    points:[[-3,128],[-7,107],[8,80],[15,42],[27,33],[31,32],[37,14]], periods:[{start:200,end:1600}]},
  { id:'mediterranean',name:'Rutas Mediterráneas',      color:'#378ADD', wikiTitle:'Comercio fenicio',
    desc:'Fenicios, griegos y romanos conectaron el Mediterráneo con cerámica, aceite y metales.',
    points:[[33,35],[37,10],[43,5],[42,13],[38,23],[31,30]], periods:[{start:-1000,end:500}]},
  { id:'roman_trade',  name:'Comercio Romano',          color:'#D4537E', wikiTitle:'Economía del Imperio romano',
    desc:'Roma importaba grano de Egipto, especias de India y seda de China.',
    points:[[51,-1],[42,13],[31,30],[37,10],[36,36],[33,44]], periods:[{start:-100,end:400}]},
  { id:'indian_ocean', name:'Océano Índico',            color:'#1D9E75', wikiTitle:'Comercio en el océano Índico',
    desc:'Los monzones permitieron el comercio regular entre África, Arabia, India y el Sudeste Asiático.',
    points:[[-9,40],[12,45],[26,57],[11,76],[7,80],[2,102]], periods:[{start:100,end:1800}]},
  { id:'trans_sahara', name:'Ruta Transahariana',       color:'#7F77DD', wikiTitle:'Comercio transahariano',
    desc:'Caravanas cruzaban el Sahara con oro y marfil hacia el norte y sal hacia el sur.',
    points:[[16,-3],[16,1],[17,8],[25,10],[33,13],[30,31]], periods:[{start:300,end:1600}]},
  { id:'hanseatic',    name:'Liga Hanseática',          color:'#888780', wikiTitle:'Liga hanseática',
    desc:'Alianza de ciudades del norte de Europa que dominó el comercio báltico (1241-1669).',
    points:[[57,24],[54,18],[54,11],[53,10],[51,3],[51,-1]], periods:[{start:1241,end:1669}]},
  { id:'atlantic',     name:'Comercio Atlántico',       color:'#D4537E', wikiTitle:'Comercio triangular',
    desc:'El triángulo: manufacturas → África → esclavos a América → azúcar y plata a Europa.',
    points:[[38,-9],[5,-2],[10,-75],[23,-82],[37,-8]], periods:[{start:1500,end:1850}]},
  { id:'portuguese',   name:'Ruta Portuguesa a India',  color:'#EF9F27', wikiTitle:'Vasco de Gama',
    desc:'Vasco de Gama abrió en 1498 la ruta marítima a Asia rodeando el Cabo de Buena Esperanza.',
    points:[[38,-9],[28,-15],[15,-24],[-34,18],[-15,40],[11,76]], periods:[{start:1498,end:1700}]},
  { id:'galleon',      name:'Galeón de Manila',         color:'#D85A30', wikiTitle:'Galeón de Manila',
    desc:'Ruta transpacífica (1565-1815). Plata mexicana a Asia; seda y porcelana a América.',
    points:[[17,-99],[30,-120],[40,-140],[38,-160],[20,-175],[15,121]], periods:[{start:1565,end:1815}]},
  { id:'british_routes',name:'Rutas Británicas',        color:'#5588DD', wikiTitle:'Imperio británico',
    desc:'La red del Imperio Británico: algodón de India, té de China, oro de Sudáfrica.',
    points:[[51,-1],[-34,18],[19,73],[22,88],[1,104],[22,114],[-33,151]], periods:[{start:1750,end:1950}]},
];

const WARS = [
  { id:'pelopon',    name:'Guerra del Peloponeso',  color:'#E24B4A', lat:37.9, lon:23.7,  yearStart:-431, yearEnd:-404, radius:5 },
  { id:'alexander',  name:'Conquistas de Alejandro',color:'#E24B4A', lat:32.0, lon:44.0,  yearStart:-336, yearEnd:-323, radius:14 },
  { id:'punic',      name:'Guerras Púnicas',        color:'#E24B4A', lat:36.9, lon:10.3,  yearStart:-264, yearEnd:-146, radius:6 },
  { id:'hunnic',     name:'Invasiones Hunas',       color:'#E24B4A', lat:47.0, lon:60.0,  yearStart:370,  yearEnd:455,  radius:12 },
  { id:'crusades',   name:'Las Cruzadas',           color:'#E24B4A', lat:31.8, lon:35.2,  yearStart:1096, yearEnd:1291, radius:7 },
  { id:'mongol_inv', name:'Invasiones Mongolas',    color:'#E24B4A', lat:47.9, lon:106.9, yearStart:1206, yearEnd:1368, radius:18 },
  { id:'100yrs',     name:'Guerra 100 Años',        color:'#E24B4A', lat:48.9, lon:2.3,   yearStart:1337, yearEnd:1453, radius:5 },
  { id:'30yrs',      name:'Guerra 30 Años',         color:'#E24B4A', lat:50.1, lon:14.4,  yearStart:1618, yearEnd:1648, radius:8 },
  { id:'napoleon_wars',name:'Guerras Napoleónicas', color:'#E24B4A', lat:48.9, lon:2.3,   yearStart:1803, yearEnd:1815, radius:12 },
  { id:'wwi',        name:'Primera Guerra Mundial', color:'#E24B4A', lat:50.5, lon:10.0,  yearStart:1914, yearEnd:1918, radius:14 },
  { id:'wwii',       name:'Segunda Guerra Mundial', color:'#E24B4A', lat:51.0, lon:16.0,  yearStart:1939, yearEnd:1945, radius:20 },
  { id:'vietnam',    name:'Guerra de Vietnam',      color:'#E24B4A', lat:16.0, lon:107.0, yearStart:1955, yearEnd:1975, radius:5 },
];

const NARRATIVES = [
  { start:-70000, end:-3500,  text:'La humanidad coloniza el planeta. Cazadores-recolectores en todos los continentes.' },
  { start:-3500,  end:-2500,  text:'Las primeras ciudades surgen en Mesopotamia y Egipto. Nace la escritura.' },
  { start:-2500,  end:-1000,  text:'Los grandes reinos del Bronce dominan Oriente Próximo. Egipto en su apogeo.' },
  { start:-1000,  end:-500,   text:'Fenicios y griegos colonizan el Mediterráneo. Surgen las polis.' },
  { start:-500,   end:-200,   text:'Persia y Grecia se enfrentan. Alejandro unifica el mundo conocido.' },
  { start:-200,   end:200,    text:'Roma domina el Mediterráneo. La Ruta de la Seda conecta Oriente y Occidente.' },
  { start:200,    end:600,    text:'Caída de Roma en Occidente. Bizancio sobrevive. El budismo se expande por Asia.' },
  { start:600,    end:1000,   text:'El Islam surge y conquista desde España hasta India. La edad de oro árabe.' },
  { start:1000,   end:1200,   text:'Las Cruzadas. La Liga Hanseática. China bajo la Dinastía Song florece.' },
  { start:1200,   end:1350,   text:'Los Mongoles crean el mayor imperio terrestre. La Ruta de la Seda en su apogeo.' },
  { start:1350,   end:1500,   text:'La Peste Negra transforma Europa. El Renacimiento despunta en Italia.' },
  { start:1500,   end:1600,   text:'Europa conquista América. Portugal abre la ruta a Asia. El mundo se globaliza.' },
  { start:1600,   end:1800,   text:'Imperios coloniales europeos dominan el mundo. La Revolución Industrial comienza.' },
  { start:1800,   end:1900,   text:'El Imperio Británico cubre un cuarto del planeta. El nacionalismo remodela Europa.' },
  { start:1900,   end:1950,   text:'Dos guerras mundiales sacuden el planeta. El fin de los imperios coloniales.' },
  { start:1950,   end:2025,   text:'Guerra Fría. Descolonización. Globalización. La era de la información.' },
];

const TOLERANCE_STEPS = [0, 1, 2, 5, 10, 25, 50, 100, 250, 500];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getNarrative(year) {
  return NARRATIVES.find(n => year >= n.start && year <= n.end)?.text || '';
}
function getActiveCivils(year) {
  return CIVILIZATIONS.map(civ => {
    const period = [...civ.periods].reverse().find(p => year >= p.start && year <= p.end);
    if (!period) return null;
    const duration = period.end - period.start;
    const elapsed  = year - period.start;
    const fadeLen  = Math.min(80, duration * 0.08);
    let opacity = 1;
    if (elapsed < fadeLen) opacity = elapsed / fadeLen;
    if (duration - elapsed < fadeLen) opacity = (duration - elapsed) / fadeLen;
    return { ...civ, ring: period.ring, opacity: Math.max(0.05, Math.min(1, opacity)) };
  }).filter(Boolean);
}
function getActiveRoutes(year) {
  return TRADE_ROUTES.filter(r => r.periods.some(p => year >= p.start && year <= p.end));
}
function getActiveWars(year) {
  return WARS.filter(w => year >= w.yearStart && year <= w.yearEnd);
}

// Base colors — overridden by daltonism palette from SettingsContext
const CATEGORY_COLORS_NORMAL = {
  personas:'#D85A30', politica:'#378ADD', batallas:'#E24B4A',
  inventos:'#7F77DD', cultura:'#EF9F27',
  desastres:'#FF6B35', exploracion:'#2ECC71', religion:'#9B59B6',
};
// Used as fallback when palette not available
const CATEGORY_COLORS = CATEGORY_COLORS_NORMAL;

const makeEventsJSON = (year, activeCategories, toleranceBase, colorPalette) => {
  const colors = colorPalette || CATEGORY_COLORS_NORMAL;

  // Importance mínima según ventana de tiempo — evita saturar postMessage
  // con decenas de miles de pines a la vez
  const minImp =
    toleranceBase <= 2   ? 1 :
    toleranceBase <= 10  ? 1 :
    toleranceBase <= 25  ? 2 :
    toleranceBase <= 100 ? 3 :
    toleranceBase <= 250 ? 4 : 4;

  // Cap de pines por postMessage — WebView no maneja bien >3000 pines
  const MAX_PINS = 3000;

  const visible = EVENTS.filter((e) => {
    if (!activeCategories.includes(e.category)) return false;
    if ((e.importance || 3) < minImp) return false;
    return Math.abs(e.year - year) <= toleranceBase;
  });

  // Si hay más del cap, priorizar por importancia
  const sorted = visible.length > MAX_PINS
    ? visible.sort((a, b) => (b.importance || 3) - (a.importance || 3)).slice(0, MAX_PINS)
    : visible;

  console.log('[makeEventsJSON] year='+year+' tol='+toleranceBase+' minImp='+minImp+' visible='+visible.length+' sorted='+sorted.length);
  return JSON.stringify(
    sorted.map((e) => ({
      id: e.id, lat: e.lat, lon: e.lon,
      importance: e.importance,
      color: colors[e.category] || '#378ADD',
    }))
  );
};

// ─── WebView HTML ──────────────────────────────────────────────────────────────

// ─── Orbital WebView HTML ────────────────────────────────────────────────────
const makeOrbitalHTML = (w, h) => `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#04040d;overflow:hidden;width:${w}px;height:${h}px;touch-action:none;}
canvas{display:block;width:${w}px;height:${h}px;}
#hud{position:absolute;bottom:100px;left:0;right:0;text-align:center;font-family:-apple-system,sans-serif;pointer-events:none;transition:opacity 0.4s;}
#yr-wrap{position:absolute;bottom:196px;left:0;right:0;text-align:center;font-family:-apple-system,sans-serif;pointer-events:auto;transition:opacity 0.4s;-webkit-tap-highlight-color:transparent;}
#yr{display:inline-block;font-size:42px;font-weight:300;color:#fff;letter-spacing:-2px;text-shadow:0 0 50px rgba(80,160,255,0.7);padding:10px 24px;}
#yr-hint{font-size:10px;color:rgba(255,255,255,0.18);margin-top:2px;letter-spacing:0.5px;}
#sp{display:inline-block;margin-top:6px;padding:3px 16px;border:0.5px solid rgba(255,255,255,0.18);border-radius:20px;font-size:12px;color:rgba(255,255,255,0.45);}
#ev{margin-top:10px;font-size:15px;font-weight:500;color:#fff;min-height:22px;}
#ht{margin-top:5px;font-size:11px;color:rgba(255,255,255,0.22);}
#hint{position:absolute;bottom:38px;left:0;right:0;text-align:center;font-family:-apple-system,sans-serif;font-size:12px;color:rgba(255,255,255,0.28);pointer-events:none;transition:opacity 0.5s;}
#future{position:absolute;top:28%;left:0;right:0;font-family:-apple-system,sans-serif;font-size:22px;font-weight:300;color:rgba(255,255,255,0.0);letter-spacing:4px;text-align:center;pointer-events:none;transition:color 2s ease;white-space:nowrap;}
</style>
</head>
<body>
<canvas id="c" width="${w*2}" height="${h*2}" style="width:${w}px;height:${h}px;"></canvas>
<div id="yr-wrap"><div id="yr">1492 d.C.</div><div id="yr-hint">doble tap para saltar</div></div>
<div id="hud"><div id="sp">1 vuelta = 1 anno</div><div id="ev"></div><div id="ht">Arrastra la Tierra alrededor del Sol</div></div>
<div id="hint">Pellizca sobre la Tierra para explorar</div>
<div id="future">continuará\u2026</div>
<script>
var cvs=document.getElementById('c'),ctx=cvs.getContext('2d');
var W=${w},H=${h},DPR=2;cvs.width=W*DPR;cvs.height=H*DPR;ctx.scale(DPR,DPR);
var PI2=Math.PI*2,YEAR_MIN=-3000,YEAR_MAX=2025;
var YPO=[1,10,100,1000];
var SLABELS=['1 vuelta = 1 anno','1 vuelta = 1 decada','1 vuelta = 1 siglo','1 vuelta = 1 milenio'];
var SHINTS=['Arrastra la Tierra · Pellizca para décadas','Arrastra · Pellizca para siglos','Arrastra · Pellizca para milenios','Toda la historia humana visible'];
var currentYear=2000.0,velYPS=0.0,scaleLevel=0,targetLevel=0,scaleT=0.0,eraT=0.5;
var earthRot=0.0,isMoving=false,movingTimer=null;
var camZoom=1.0,camFocusX=W/2,camFocusY=H*0.4,camState='idle',camT=0.0;
var CAM_CX=W/2,CAM_CY=H/2;
var EARTH_FILL_ZOOM=Math.min(W,H)/(13*2)*1.4;
var futureShown=false,lastEarthX=W/2,lastEarthY=H*0.4,lastEarthR=13,navigating=false;
var VISIBLE_TURNS=[1,4,8,14],HELIX_STEP_FRAC=[0,0.13,0.10,0.07];
var TILT=[1.0,0.72,0.52,0.32],ORBIT_R_FRAC=[0.30,0.26,0.22,0.18],CY_FRAC=[0.40,0.42,0.44,0.44];
function lerp(a,b,t){return a+(b-a)*t;}
function eio(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function eoe(t){return t>=1?1:1-Math.pow(2,-10*t);}
function glp(lv){return{turns:VISIBLE_TURNS[lv],helixStep:HELIX_STEP_FRAC[lv],tilt:TILT[lv],orbitR:Math.min(W,H)*ORBIT_R_FRAC[lv],cy:H*CY_FRAC[lv]};}
function gp(){if(scaleT===0)return glp(scaleLevel);var e=eio(Math.min(scaleT,1)),A=glp(scaleLevel),B=glp(targetLevel);return{turns:lerp(A.turns,B.turns,e),helixStep:lerp(A.helixStep,B.helixStep,e),tilt:lerp(A.tilt,B.tilt,e),orbitR:lerp(A.orbitR,B.orbitR,e),cy:lerp(A.cy,B.cy,e)};}
function hp(oN,oCur,p,fixBlend){
  var realAngle=(oN%1)*PI2;if(realAngle<0)realAngle+=PI2;
  var angle=lerp(realAngle,savedEarthAngle,fixBlend);
  var rel=oN-oCur;
  return{x:W/2+Math.cos(angle)*p.orbitR,y:p.cy+Math.sin(angle)*p.orbitR*p.tilt-rel*p.orbitR*p.helixStep*PI2};
}
// Saved Earth angle — captured just before a scale transition begins
var savedEarthAngle=0;
function ef2(zoom,fx,fy){var t=(zoom-1)/(EARTH_FILL_ZOOM-1);t=Math.max(0,Math.min(1,t));return{x:lerp(CAM_CX,fx,t),y:lerp(CAM_CY,fy,t)};}
var stars=[];for(var i=0;i<260;i++){var b=Math.random();stars.push({x:Math.random()*W,y:Math.random()*H,r:b>0.92?Math.random()*1.8+0.7:Math.random()*0.8+0.12,a:b>0.92?Math.random()*0.4+0.45:Math.random()*0.22+0.05,tw:Math.random()*PI2,twS:Math.random()*1.1+0.3,warm:Math.random()>0.88});}
var earthImg=new Image();var earthLoaded=false;
earthImg.crossOrigin='anonymous';earthImg.onload=function(){earthLoaded=true;};
earthImg.src='https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/240px-The_Blue_Marble_%28remastered%29.jpg';
var EVENTS=[];
function ne(yr){var th=[3,5,8,15][scaleLevel]||3,best=null,bd=1e9;for(var i=0;i<EVENTS.length;i++){var d=Math.abs(EVENTS[i].y-yr);if(d<bd){bd=d;best=EVENTS[i];}}return bd<=th?best:null;}
function drawSun(sx,sy,ts){var t=ts*0.0003;for(var i=0;i<20;i++){var a=(i/20)*PI2+t,len=22+Math.sin(t*2.5+i*0.9)*9;ctx.beginPath();ctx.moveTo(sx+Math.cos(a)*16,sy+Math.sin(a)*16);ctx.lineTo(sx+Math.cos(a)*(16+len),sy+Math.sin(a)*(16+len));ctx.strokeStyle='rgba(255,160,30,0.09)';ctx.lineWidth=2;ctx.stroke();}var g1=ctx.createRadialGradient(sx,sy,10,sx,sy,60);g1.addColorStop(0,'rgba(255,200,60,0.38)');g1.addColorStop(0.5,'rgba(255,140,20,0.08)');g1.addColorStop(1,'rgba(255,100,0,0)');ctx.beginPath();ctx.arc(sx,sy,60,0,PI2);ctx.fillStyle=g1;ctx.fill();var g2=ctx.createRadialGradient(sx-4,sy-3,1,sx,sy,15);g2.addColorStop(0,'#fffde0');g2.addColorStop(0.4,'#FFD040');g2.addColorStop(1,'#EF5010');ctx.beginPath();ctx.arc(sx,sy,15,0,PI2);ctx.fillStyle=g2;ctx.fill();ctx.beginPath();ctx.arc(sx,sy,15,0,PI2);ctx.strokeStyle='rgba(255,180,40,0.4)';ctx.lineWidth=0.8;ctx.stroke();}
function drawEarth(ex,ey,r,mov){lastEarthX=ex;lastEarthY=ey;lastEarthR=r;var a1=ctx.createRadialGradient(ex,ey,r*0.85,ex,ey,r*1.5);a1.addColorStop(0,'rgba(80,160,255,0.30)');a1.addColorStop(0.35,'rgba(55,120,220,0.12)');a1.addColorStop(1,'rgba(20,60,200,0)');ctx.beginPath();ctx.arc(ex,ey,r*1.5,0,PI2);ctx.fillStyle=a1;ctx.fill();ctx.save();ctx.beginPath();ctx.arc(ex,ey,r,0,PI2);ctx.clip();if(earthLoaded){ctx.save();ctx.translate(ex,ey);ctx.rotate(earthRot);ctx.drawImage(earthImg,-r,-r,r*2,r*2);ctx.restore();var ed=ctx.createRadialGradient(ex,ey,r*0.55,ex,ey,r);ed.addColorStop(0,'rgba(0,0,0,0)');ed.addColorStop(1,'rgba(0,0,30,0.52)');ctx.fillStyle=ed;ctx.fillRect(ex-r,ey-r,r*2,r*2);}else{var oc=ctx.createRadialGradient(ex-r*0.2,ey-r*0.2,0,ex,ey,r);oc.addColorStop(0,'#2a72c0');oc.addColorStop(1,'#0d2d5a');ctx.fillStyle=oc;ctx.fillRect(ex-r,ey-r,r*2,r*2);}ctx.restore();var sp=ctx.createRadialGradient(ex-r*0.3,ey-r*0.35,r*0.02,ex-r*0.15,ey-r*0.2,r*0.6);sp.addColorStop(0,'rgba(255,255,255,0.38)');sp.addColorStop(0.25,'rgba(255,255,255,0.10)');sp.addColorStop(1,'rgba(255,255,255,0)');ctx.beginPath();ctx.arc(ex,ey,r,0,PI2);ctx.fillStyle=sp;ctx.fill();var ni=ctx.createRadialGradient(ex+r*0.55,ey,r*0.1,ex+r*0.75,ey,r*1.15);ni.addColorStop(0,'rgba(0,0,0,0)');ni.addColorStop(0.45,'rgba(0,0,20,0.18)');ni.addColorStop(1,'rgba(0,0,20,0.62)');ctx.beginPath();ctx.arc(ex,ey,r,0,PI2);ctx.fillStyle=ni;ctx.fill();ctx.beginPath();ctx.arc(ex,ey,r,0,PI2);ctx.strokeStyle='rgba(80,150,255,0.35)';ctx.lineWidth=1.5;ctx.stroke();if(mov){ctx.beginPath();ctx.arc(ex,ey,r+3,0,PI2);ctx.strokeStyle='rgba(100,180,255,0.22)';ctx.lineWidth=3;ctx.stroke();}}
function drawSpiral(p,oCur){
  var steps=120,half=p.turns/2;
  ctx.beginPath();var st=false;
  for(var i=0;i<=steps;i++){
    var t=i/steps,rel=-half+t*p.turns,oN=oCur+rel;
    if(oN<0)continue;
    if(currentYear>=YEAR_MAX-1&&rel>0.02)continue;
    var ang=(oN%1)*PI2;if(ang<0)ang+=PI2;
    var pt={x:W/2+Math.cos(ang)*p.orbitR,y:p.cy+Math.sin(ang)*p.orbitR*p.tilt-rel*p.orbitR*p.helixStep*PI2};
    if(!st){ctx.moveTo(pt.x,pt.y);st=true;}else ctx.lineTo(pt.x,pt.y);
  }
  var sr=Math.round(55+eraT*30),sg=Math.round(138-eraT*40),sb=Math.round(221-eraT*20);ctx.strokeStyle='rgba('+sr+','+sg+','+sb+',0.25)';ctx.lineWidth=1;ctx.setLineDash([4,8]);ctx.stroke();ctx.setLineDash([]);
}
function hudVis(v){var o=v?'1':'0';document.getElementById('hud').style.opacity=o;document.getElementById('yr-wrap').style.opacity=o;document.getElementById('hint').style.opacity=o;}
function updateFuture(){var atEnd=currentYear>=YEAR_MAX-0.5,el=document.getElementById('future');if(atEnd&&!futureShown){futureShown=true;el.style.color='rgba(255,255,255,0.38)';hudVis(false);}else if(!atEnd&&futureShown){futureShown=false;el.style.color='rgba(255,255,255,0)';hudVis(true);}}
var lastTs=0,lastMsg=0;
function draw(ts){var dt=Math.min((ts-lastTs)/1000,0.05);lastTs=ts;if(camState==='zoomingIn'){camT+=dt*1.4;if(camT>=1)camT=1;camZoom=lerp(1,EARTH_FILL_ZOOM,eio(camT));camFocusX=lastEarthX;camFocusY=lastEarthY;if(camT>=1&&!navigating){navigating=true;window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'showGlobe',year:Math.round(currentYear)}));}}else if(camState==='zoomingOut'){camT+=dt*1.2;if(camT>=1){camT=1;camState='idle';camZoom=1;camFocusX=CAM_CX;camFocusY=CAM_CY;}camZoom=lerp(EARTH_FILL_ZOOM,1,eoe(camT));camFocusX=lastEarthX;camFocusY=lastEarthY;}if(camState==='idle'&&!dragging){currentYear+=velYPS*dt;velYPS*=0.88;if(Math.abs(velYPS)<0.05)velYPS=0;}currentYear=Math.max(YEAR_MIN,Math.min(YEAR_MAX,currentYear));earthRot+=dt*(isMoving?0.20:0.05);if(scaleT>0&&scaleT<1){scaleT+=dt*1.6;if(scaleT>=1){scaleT=0;scaleLevel=targetLevel;}}var p=gp(),oCur=(currentYear-YEAR_MIN)/YPO[scaleLevel];ctx.clearRect(0,0,W,H);
// Era-based tint (computed inside draw so currentYear is current)
eraT=Math.max(0,Math.min(1,(currentYear+3000)/5000));
var r1=Math.round(4+eraT*2),g1=Math.round(4+eraT*3),b1=Math.round(13+eraT*8);
ctx.fillStyle='rgb('+r1+','+g1+','+b1+')';ctx.fillRect(0,0,W,H);
var eraGlowA=Math.max(0,0.08-eraT*0.05);
if(eraGlowA>0.005){var eg=ctx.createRadialGradient(W*0.5,H*0.4,0,W*0.5,H*0.4,W*0.7);eg.addColorStop(0,'rgba('+(eraT>0.5?40:20)+','+(eraT>0.5?10:20)+','+(eraT>0.5?80:120)+','+eraGlowA+')');eg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=eg;ctx.fillRect(0,0,W,H);}
if(scaleLevel>=2||targetLevel>=2){var na=(Math.max(scaleLevel,targetLevel)>=3)?0.06:0.03;var nb=ctx.createRadialGradient(W*0.3,H*0.35,0,W*0.5,H*0.45,W*0.65);nb.addColorStop(0,'rgba(60,30,100,'+na+')');nb.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=nb;ctx.fillRect(0,0,W,H);}var t2=ts*0.001;for(var i=0;i<stars.length;i++){var s=stars[i],tw=s.a*(0.6+0.4*Math.sin(t2*s.twS+s.tw));ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,PI2);ctx.fillStyle=s.warm?'rgba(255,230,180,'+tw+')':'rgba(255,255,255,'+tw+')';ctx.fill();}var efv=ef2(camZoom,camFocusX,camFocusY);ctx.save();ctx.translate(CAM_CX,CAM_CY);ctx.scale(camZoom,camZoom);ctx.translate(-efv.x,-efv.y);drawSpiral(p,oCur);if(scaleLevel>0||targetLevel>0){var rl=scaleT>0.5?targetLevel:scaleLevel,ry=YPO[rl];for(var e=0;e<EVENTS.length;e++){var evON=(EVENTS[e].y-YEAR_MIN)/ry;if(Math.abs(evON-oCur)>p.turns/2+0.5)continue;var eva=(evON%1)*PI2;if(eva<0)eva+=PI2;var evr=evON-oCur;var evp={x:W/2+Math.cos(eva)*p.orbitR,y:p.cy+Math.sin(eva)*p.orbitR*p.tilt-evr*p.orbitR*p.helixStep*PI2};var ec=EVENTS[e].c||'#D85A30';ctx.beginPath();ctx.arc(evp.x,evp.y,5,0,PI2);ctx.fillStyle=ec;ctx.globalAlpha=0.90;ctx.fill();ctx.globalAlpha=1;ctx.beginPath();ctx.arc(evp.x,evp.y,9,0,PI2);ctx.fillStyle=ec;ctx.globalAlpha=0.15;ctx.fill();ctx.globalAlpha=1;}}drawSun(W/2,p.cy,ts);var ep=hp(oCur,oCur,p,scaleT);drawEarth(ep.x,ep.y,13,isMoving&&camState==='idle');ctx.restore();var yr=Math.round(currentYear);if(camState==='idle'){document.getElementById('yr').textContent=yr<0?Math.abs(yr)+' a.C.':yr+' d.C.';document.getElementById('sp').textContent=SLABELS[scaleLevel];document.getElementById('ht').textContent=SHINTS[scaleLevel];var nv=ne(yr);document.getElementById('ev').textContent=nv?nv.l:'';}updateFuture();if(ts-lastMsg>100){lastMsg=ts;window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'frame',year:yr}));}requestAnimationFrame(draw);}
var dragging=false,lastAngle=null,lastAngleMs=0,pinchDist=null,pinchStartDist=null,pinchFired=false,lastPinchMs=0;
function ta(tx,ty,p){return Math.atan2(ty-p.cy,tx-W/2);}
document.addEventListener('touchstart',function(e){e.preventDefault();if(camState!=='idle')return;if(e.touches.length===2){var dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;pinchDist=pinchStartDist=Math.sqrt(dx*dx+dy*dy);pinchFired=false;dragging=false;lastAngle=null;}else{pinchDist=pinchStartDist=null;pinchFired=false;dragging=true;var p=gp();lastAngle=ta(e.touches[0].clientX,e.touches[0].clientY,p);lastAngleMs=Date.now();velYPS=0;isMoving=true;if(movingTimer)clearTimeout(movingTimer);}},{passive:false});
document.addEventListener('touchmove',function(e){e.preventDefault();if(camState!=='idle')return;var now=Date.now();if(e.touches.length===2&&pinchDist!==null){dragging=false;var dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;var dist=Math.sqrt(dx*dx+dy*dy),spread=dist-pinchStartDist;if(!pinchFired&&spread>40&&scaleLevel===0&&targetLevel===0){pinchFired=true;camState='zoomingIn';camT=0;camFocusX=lastEarthX;camFocusY=lastEarthY;navigating=false;hudVis(false);pinchDist=dist;return;}if(!pinchFired&&now-lastPinchMs>300){var delta=pinchDist-dist;if(delta>14&&targetLevel<3){savedEarthAngle=((currentYear-YEAR_MIN)/YPO[scaleLevel]%1)*PI2;if(savedEarthAngle<0)savedEarthAngle+=PI2;targetLevel++;scaleT=0.001;lastPinchMs=now;}else if(delta<-14&&targetLevel>0){savedEarthAngle=((currentYear-YEAR_MIN)/YPO[scaleLevel]%1)*PI2;if(savedEarthAngle<0)savedEarthAngle+=PI2;targetLevel--;scaleT=0.001;lastPinchMs=now;}}pinchDist=dist;return;}if(e.touches.length===1&&dragging&&lastAngle!==null){var p2=gp();var na=ta(e.touches[0].clientX,e.touches[0].clientY,p2);var da=na-lastAngle;if(da>Math.PI)da-=PI2;if(da<-Math.PI)da+=PI2;var yd=da/PI2*YPO[scaleLevel];currentYear=Math.max(YEAR_MIN,Math.min(YEAR_MAX,currentYear+yd));var dtMs=Math.max(now-lastAngleMs,8);velYPS=(yd/(dtMs/1000))*0.75;lastAngle=na;lastAngleMs=now;isMoving=true;if(movingTimer)clearTimeout(movingTimer);movingTimer=setTimeout(function(){isMoving=false;},350);}},{passive:false});
// Track tap on Earth for double-tap-to-enter
var lastEarthTap=0,tapStartEarthX=null,tapStartEarthY=null;
document.addEventListener('touchstart',function(e){
  if(e.touches.length===1){tapStartEarthX=e.touches[0].clientX;tapStartEarthY=e.touches[0].clientY;}
},{passive:true});
document.addEventListener('touchend',function(e){
  if(e.touches.length<2){pinchDist=null;pinchStartDist=null;pinchFired=false;}
  if(e.touches.length===0){
    dragging=false;lastAngle=null;
    movingTimer=setTimeout(function(){isMoving=false;},400);
    // Sync year to RN on every touchend so navigation always has the latest year
    window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'frame',year:Math.round(currentYear)}));
    // Double-tap on Earth → enter globe (works at any scale level)
    if(tapStartEarthX!==null&&camState==='idle'){
      var dx=tapStartEarthX-lastEarthX,dy=tapStartEarthY-lastEarthY;
      var hitEarth=Math.sqrt(dx*dx+dy*dy)<lastEarthR*4;
      if(hitEarth){
        var now=Date.now();
        if(now-lastEarthTap<320){
          // Double-tap confirmed — reset scale to 0 first, then zoom in
          scaleLevel=0;targetLevel=0;scaleT=0;
          camState='zoomingIn';camT=0;camFocusX=lastEarthX;camFocusY=lastEarthY;navigating=false;hudVis(false);
        }
        lastEarthTap=now;
      }
    }
    tapStartEarthX=null;tapStartEarthY=null;
  }
},{passive:false});
var lastYrTap=0;
document.getElementById('yr').addEventListener('touchend',function(e){e.stopPropagation();var now=Date.now();if(now-lastYrTap<320)window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'doubleTapYear',year:Math.round(currentYear)}));lastYrTap=now;});
document.addEventListener('message',onRN);window.addEventListener('message',onRN);
function onRN(e){try{var m=JSON.parse(e.data);if(m.type==='updateOrbitalEvents'){EVENTS=m.events||[];return;}else if(m.type==='startZoomOut'){if(m.year!==undefined){currentYear=m.year;velYPS=0;}camZoom=EARTH_FILL_ZOOM;camFocusX=lastEarthX;camFocusY=lastEarthY;camState='zoomingOut';camT=0;hudVis(false);setTimeout(function(){hudVis(true);},700);}else if(m.type==='setYear'){if(m.year!==undefined){currentYear=Math.max(YEAR_MIN,Math.min(YEAR_MAX,m.year));velYPS=0;}}}catch(_){}}
requestAnimationFrame(draw);
</script>
</body>
</html>`;

// ─── Globe WebView HTML (was makeHTML in explore.jsx) ────────────────────────
const makeGlobeHTML = (w, h) => `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:#04040d;overflow:hidden;width:${w}px;height:${h}px;touch-action:none;}
  canvas{display:block;}
  #hint{position:absolute;bottom:160px;left:0;right:0;text-align:center;
    font-family:-apple-system,sans-serif;font-size:11px;
    color:rgba(255,255,255,0.18);pointer-events:none;line-height:18px;}
  #loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    flex-direction:column;gap:12px;background:#04040d;z-index:10;}
  #loading-ring{width:36px;height:36px;border-radius:50%;
    border:2px solid rgba(55,138,221,0.2);border-top-color:#378ADD;
    animation:spin 0.9s linear infinite;}
  #loading-txt{font-family:-apple-system,sans-serif;font-size:12px;color:rgba(255,255,255,0.3);}
  @keyframes spin{to{transform:rotate(360deg);}}
</style>
</head>
<body>
<div id="loading"><div id="loading-ring"></div><div id="loading-txt">Cargando globo…</div></div>
<div id="hint">Arrastra para rotar · Pellizca para zoom<br>Zoom-out para regresar</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
var W=${w},H=${h};
var PINS=[];
// Process layer state
var state={civilizations:false,routes:false,wars:false,migration:false,religion:false,languages:false};
var layerMeshes={civils:[],routes:[],wars:[],migration:[],religion:[],languages:[]};
var routeParticles=[];
var particlePhase=0;

// ── Scene ─────────────────────────────────────────────────────────────────────
var renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,precision:'highp',powerPreference:'high-performance'});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(W,H);
renderer.setClearColor(0x04040d,1);
document.body.insertBefore(renderer.domElement,document.getElementById('hint'));
var scene=new THREE.Scene();
var camera=new THREE.PerspectiveCamera(45,W/H,0.1,1000);
camera.position.z=2.8;
scene.add(new THREE.AmbientLight(0x333355,1.2));
var sunLight=new THREE.DirectionalLight(0xffeedd,1.8);
sunLight.position.set(-3,1.5,2);scene.add(sunLight);
var backLight=new THREE.DirectionalLight(0x224488,0.3);
backLight.position.set(3,-1,-2);scene.add(backLight);

// Stars
(function(){
  var g=new THREE.BufferGeometry(),p=new Float32Array(2000*3);
  for(var i=0;i<2000;i++){
    var t=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1),r=80+Math.random()*40;
    p[i*3]=r*Math.sin(ph)*Math.cos(t);p[i*3+1]=r*Math.sin(ph)*Math.sin(t);p[i*3+2]=r*Math.cos(ph);
  }
  g.setAttribute('position',new THREE.BufferAttribute(p,3));
  scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:0.15,sizeAttenuation:true})));
})();

var globeGroup=new THREE.Group();scene.add(globeGroup);
var procesGroup=new THREE.Group();procesGroup.renderOrder=2;scene.add(procesGroup);

function ll2v3(lat,lon,r){
  var phi=(lon+180)*Math.PI/180;
  var theta=(90-lat)*Math.PI/180;
  return new THREE.Vector3(-r*Math.cos(phi)*Math.sin(theta),r*Math.cos(theta),r*Math.sin(phi)*Math.sin(theta));
}

// ── Globe build ───────────────────────────────────────────────────────────────
var loader=new THREE.TextureLoader();loader.crossOrigin='anonymous';
var globeReady=false;

function buildGlobe(dayTex,nightTex,cloudTex,bumpTex){
  // Clear any previous globe meshes
  while(globeGroup.children.length>0)globeGroup.remove(globeGroup.children[0]);

  var mat=new THREE.ShaderMaterial({
    uniforms:{
      dayTexture:{value:dayTex||new THREE.Texture()},
      nightTexture:{value:nightTex||new THREE.Texture()},
      cloudTexture:{value:cloudTex||new THREE.Texture()},
      bumpTexture:{value:bumpTex||new THREE.Texture()},
      hasTextures:{value:dayTex?1.0:0.0},
      sunDirection:{value:new THREE.Vector3(-0.6,0.3,0.75).normalize()},
      cloudOpacity:{value:0.45},
    },
    vertexShader:\`
      varying vec2 vUv;varying vec3 vNormal,vPosition;
      void main(){vUv=uv;vNormal=normalize(normalMatrix*normal);
        vPosition=(modelViewMatrix*vec4(position,1.0)).xyz;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
    \`,
    fragmentShader:\`
      uniform sampler2D dayTexture,nightTexture,cloudTexture,bumpTexture;
      uniform vec3 sunDirection;uniform float cloudOpacity,hasTextures;
      varying vec2 vUv;varying vec3 vNormal,vPosition;
      void main(){
        vec3 n=normalize(vNormal);float NdotL=dot(n,normalize(sunDirection));
        float dm=smoothstep(-0.25,0.25,NdotL);
        vec3 vd=normalize(-vPosition);float rim=pow(1.0-max(dot(vd,n),0.0),3.0);
        if(hasTextures<0.5){
          // Placeholder: deep ocean blue with atmosphere rim
          vec3 col=mix(vec3(0.05,0.12,0.28),vec3(0.10,0.22,0.50),dm);
          col=mix(col,vec3(0.25,0.55,1.0),rim*0.5);
          gl_FragColor=vec4(col,1.0);return;
        }
        vec4 day=texture2D(dayTexture,vUv),night=texture2D(nightTexture,vUv);
        vec4 clouds=texture2D(cloudTexture,vUv);
        vec4 base=mix(night*0.85,day,dm);
        float cb=clouds.r*cloudOpacity*dm;
        base=mix(base,vec4(1.0),cb*0.55);
        base.rgb=mix(base.rgb,vec3(0.25,0.55,1.0),rim*0.45);
        float spec=pow(max(dot(reflect(-normalize(sunDirection),n),vd),0.0),48.0);
        float oc=1.0-clamp(day.g*0.6+day.r*0.15-day.b*0.4+0.4,0.0,1.0);
        base.rgb+=vec3(1.0,0.95,0.85)*spec*oc*0.55*dm;
        gl_FragColor=base;}
    \`,
  });
  var earthMesh=new THREE.Mesh(new THREE.SphereGeometry(1,256,256),mat);
  globeGroup.add(earthMesh);
  var atmMat=new THREE.MeshPhongMaterial({color:0x4488ff,transparent:true,opacity:0.06,side:THREE.FrontSide});
  globeGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.02,32,32),atmMat));
  globeReady=true;
  document.getElementById('loading').style.display='none';
  if(dayTex)buildPins(); // pins only after real textures
}

// Step 1: show instant placeholder globe (no textures needed)
buildGlobe(null,null,null,null);

// Step 2: load real textures and upgrade in background
var TEX_DAY='https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg';
var TEX_DAY_FALLBACK='https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg';
var TEX_NIGHT='https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg';
var TEX_CLOUDS='https://unpkg.com/three-globe@2.31.1/example/img/earth-clouds.png';
var TEX_BUMP='https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png';
var loadedCount=0,textures={};
var maxAniso=renderer.capabilities.getMaxAnisotropy();
function applyTexSettings(tex){
  if(!tex)return;
  tex.anisotropy=maxAniso;
  tex.minFilter=THREE.LinearMipMapLinearFilter;
  tex.magFilter=THREE.LinearFilter;
  tex.needsUpdate=true;
}
function onTexLoad(name,tex){
  if(tex){applyTexSettings(tex);textures[name]=tex;}
  loadedCount++;
  if(loadedCount===4&&textures.day){
    buildGlobe(textures.day,textures.night||null,textures.clouds||null,textures.bump||null);
  }
}
// Try NASA 8K day texture, fall back to unpkg if CORS/network fails
loader.load(TEX_DAY,
  function(t){onTexLoad('day',t);},
  undefined,
  function(){loader.load(TEX_DAY_FALLBACK,function(t){onTexLoad('day',t);},undefined,function(){onTexLoad('day',null);});}
);
loader.load(TEX_NIGHT,function(t){onTexLoad('night',t);},undefined,function(){onTexLoad('night',null);});
loader.load(TEX_CLOUDS,function(t){onTexLoad('clouds',t);},undefined,function(){onTexLoad('clouds',null);});
loader.load(TEX_BUMP,function(t){onTexLoad('bump',t);},undefined,function(){onTexLoad('bump',null);});

// ── Event Pins — light pillars rising from surface ───────────────────────────
function latLonToVec3(lat,lon,r){
  var phi=(lon+180)*Math.PI/180,theta=(90-lat)*Math.PI/180;
  return new THREE.Vector3(-r*Math.cos(phi)*Math.sin(theta),r*Math.cos(theta),r*Math.sin(phi)*Math.sin(theta));
}

var pinMeshes=[];

function buildPins(){
  pinMeshes.forEach(function(m){globeGroup.remove(m);});pinMeshes=[];
  PINS.forEach(function(pin){
    var imp=pin.importance||3;
    var col=parseInt((pin.color||'#378ADD').slice(1),16);
    var base=latLonToVec3(pin.lat,pin.lon,1.0);
    var normal=base.clone().normalize();

    // Pillar dimensions by importance
    var h=0.018+(imp-1)*0.016;  // height: 0.018 (imp1) → 0.082 (imp5)
    var r=0.0015+(imp-1)*0.0005; // radius: thin always

    // Center of pillar sits h/2 above surface
    var center=base.clone().addScaledVector(normal,0.012+h*0.5);

    // Core beam — sharp, mostly opaque
    var beam=new THREE.Mesh(
      new THREE.CylinderGeometry(r*0.4,r,h,6,1,true),
      new THREE.MeshBasicMaterial({
        color:col,transparent:true,opacity:0.75,
        blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,
      })
    );
    beam.position.copy(center);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);
    beam.userData={id:pin.id};
    globeGroup.add(beam);pinMeshes.push(beam);

    // Soft outer glow — wider, very transparent
    var glow=new THREE.Mesh(
      new THREE.CylinderGeometry(r*0.2,r*4,h*0.8,6,1,true),
      new THREE.MeshBasicMaterial({
        color:col,transparent:true,opacity:0.12,
        blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,
      })
    );
    glow.position.copy(base.clone().addScaledVector(normal,0.012+h*0.4));
    glow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);
    globeGroup.add(glow);pinMeshes.push(glow);

    // Tiny base dot — anchor point on surface, tappable
    var dotR=0.004+(imp-1)*0.0015;
    var dot=new THREE.Mesh(
      new THREE.SphereGeometry(dotR,8,8),
      new THREE.MeshPhongMaterial({color:col,emissive:col,emissiveIntensity:1.0,transparent:true,opacity:0.90})
    );
    var dotPos=base.clone().addScaledVector(normal,0.012);
    dot.position.copy(dotPos);dot.userData={id:pin.id};
    globeGroup.add(dot);pinMeshes.push(dot);

    // Invisible generous hit area around base
    var hit=new THREE.Mesh(
      new THREE.SphereGeometry(dotR*6,6,6),
      new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})
    );
    hit.position.copy(dotPos);hit.userData={id:pin.id};
    globeGroup.add(hit);pinMeshes.push(hit);

    // Pulse ring at base for importance >= 4
    if(imp>=4){
      var ring=new THREE.Mesh(
        new THREE.RingGeometry(dotR*2.0,dotR*3.5,24),
        new THREE.MeshBasicMaterial({
          color:col,transparent:true,opacity:0.30,
          side:THREE.DoubleSide,depthWrite:false,
          blending:THREE.AdditiveBlending,
        })
      );
      ring.position.copy(dotPos);
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
      globeGroup.add(ring);pinMeshes.push(ring);
    }
  });
}

// ── Process layers ────────────────────────────────────────────────────────────
function hexToCol(hex){return parseInt(hex.slice(1),16);}

function rebuildCivils(civils){
  layerMeshes.civils.forEach(function(m){procesGroup.remove(m);});layerMeshes.civils=[];
  if(!state.civilizations||!civils)return;
  civils.forEach(function(civ){
    var col=hexToCol(civ.color);
    var pts=civ.ring.map(function(p){return ll2v3(p[1],p[0],1.016);});

    // Filled polygon — use a simple convex fill via fan triangulation around centroid
    var centroid=new THREE.Vector3();
    pts.forEach(function(p){centroid.add(p);});
    centroid.divideScalar(pts.length).normalize().multiplyScalar(1.016);

    var fillVerts=[];
    for(var i=0;i<pts.length;i++){
      fillVerts.push(centroid.x,centroid.y,centroid.z);
      fillVerts.push(pts[i].x,pts[i].y,pts[i].z);
      fillVerts.push(pts[(i+1)%pts.length].x,pts[(i+1)%pts.length].y,pts[(i+1)%pts.length].z);
    }
    var fillGeo=new THREE.BufferGeometry();
    fillGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(fillVerts),3));
    var fillMat=new THREE.MeshBasicMaterial({
      color:col,transparent:true,
      opacity:civ.opacity*0.28,
      side:THREE.DoubleSide,depthWrite:false,
      blending:THREE.AdditiveBlending,
    });
    var fill=new THREE.Mesh(fillGeo,fillMat);fill.renderOrder=2;
    procesGroup.add(fill);layerMeshes.civils.push(fill);

    // Border outline
    var linePts=pts.concat([pts[0]]);
    var lineGeo=new THREE.BufferGeometry().setFromPoints(linePts);
    var line=new THREE.Line(lineGeo,new THREE.LineBasicMaterial({
      color:col,opacity:Math.min(civ.opacity*1.1,0.90),transparent:true,
    }));
    line.renderOrder=3;procesGroup.add(line);layerMeshes.civils.push(line);
  });
}

function rebuildRoutes(routes){
  layerMeshes.routes.forEach(function(m){procesGroup.remove(m);});layerMeshes.routes=[];
  routeParticles=[];
  if(!state.routes||!routes)return;
  routes.forEach(function(r){
    var col=hexToCol(r.color);
    var pts=r.points.map(function(p){return ll2v3(p[0],p[1],1.022);});
    var curve=new THREE.CatmullRomCurve3(pts);
    var tubGeo=new THREE.TubeGeometry(curve,80,0.005,6,false);
    var tubMat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.70});
    var tube=new THREE.Mesh(tubGeo,tubMat);tube.renderOrder=3;
    tube.userData={routeId:r.id};
    procesGroup.add(tube);layerMeshes.routes.push(tube);
    // Particles — also tagged so tap works on them
    var numP=6;
    for(var i=0;i<numP;i++){
      var pGeo=new THREE.SphereGeometry(0.010,6,6);
      var pMat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.9});
      var pMesh=new THREE.Mesh(pGeo,pMat);
      pMesh.renderOrder=4;
      pMesh.userData={routeId:r.id};
      procesGroup.add(pMesh);layerMeshes.routes.push(pMesh);
      routeParticles.push({mesh:pMesh,curve:curve,phase:i/numP,routeId:r.id});
    }
  });
}

function rebuildWars(wars){
  layerMeshes.wars.forEach(function(m){procesGroup.remove(m);});layerMeshes.wars=[];
  if(!state.wars||!wars)return;
  wars.forEach(function(w){
    var col=hexToCol(w.color);
    var center=ll2v3(w.lat,w.lon,1.020);
    var r=0.005+w.radius*0.006;
    var geo=new THREE.RingGeometry(r*0.7,r,40);
    var mat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.75,side:THREE.DoubleSide});
    var mesh=new THREE.Mesh(geo,mat);
    mesh.position.copy(center);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),center.clone().normalize());
    mesh.renderOrder=3;procesGroup.add(mesh);layerMeshes.wars.push(mesh);
    var innerGeo=new THREE.CircleGeometry(r*0.7,40);
    var innerMat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.18,side:THREE.DoubleSide});
    var inner=new THREE.Mesh(innerGeo,innerMat);
    inner.position.copy(center);inner.quaternion.copy(mesh.quaternion);
    inner.renderOrder=3;procesGroup.add(inner);layerMeshes.wars.push(inner);
  });
}

// ── Migration particles state ─────────────────────────────────────────────────
var migrationParticles=[];

function rebuildMigration(flows){
  layerMeshes.migration.forEach(function(m){procesGroup.remove(m);});
  layerMeshes.migration=[];
  migrationParticles=[];
  if(!state.migration||!flows||!flows.length)return;

  flows.forEach(function(f){
    var col=hexToCol(f.color);
    var isSea=f.type==='sea';
    var pts=f.waypoints.map(function(p){return ll2v3(p.lat,p.lon,1.024);});
    var curve=new THREE.CatmullRomCurve3(pts,false,'catmullrom',0.5);

    // ── Route line — dashed-looking via segments ──────────────────────────────
    var linePts=curve.getPoints(120);
    // Draw as alternating visible/gap segments for a dashed effect
    for(var seg=0;seg<linePts.length-1;seg+=2){
      var segGeo=new THREE.BufferGeometry().setFromPoints([linePts[seg],linePts[seg+1]]);
      var segMat=new THREE.LineBasicMaterial({
        color:col, transparent:true,
        opacity: isSea ? 0.55 : 0.50,
      });
      var segLine=new THREE.Line(segGeo,segMat);
      segLine.renderOrder=3;
      procesGroup.add(segLine);layerMeshes.migration.push(segLine);
    }

    // ── Animated icons ────────────────────────────────────────────────────────
    var numIcons=isSea ? 4 : 6;
    for(var i=0;i<numIcons;i++){
      if(isSea){
        // Ship: hull + mast + sail
        var shipGroup=new THREE.Group();

        var hullGeo=new THREE.SphereGeometry(1,8,4);
        hullGeo.scale(0.016,0.005,0.007);
        var hullMat=new THREE.MeshPhongMaterial({
          color:col,transparent:true,opacity:0.82,
          emissive:col,emissiveIntensity:0.25,shininess:40,
        });
        var hull=new THREE.Mesh(hullGeo,hullMat);
        hull.renderOrder=6;
        shipGroup.add(hull);

        var mastGeo=new THREE.CylinderGeometry(0.0010,0.0010,0.022,4);
        var mastMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.70});
        var mast=new THREE.Mesh(mastGeo,mastMat);
        mast.position.y=0.011;
        mast.renderOrder=6;
        shipGroup.add(mast);

        var sailGeo=new THREE.ConeGeometry(0.007,0.016,4);
        var sailMat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.80,side:THREE.DoubleSide});
        var sail=new THREE.Mesh(sailGeo,sailMat);
        sail.position.y=0.020;
        sail.renderOrder=6;
        shipGroup.add(sail);

        var wakeMat2=new THREE.MeshBasicMaterial({color:0x88ccff,transparent:true,opacity:0.35,depthWrite:false});
        var wake1=new THREE.Mesh(new THREE.SphereGeometry(0.004,4,4),wakeMat2);
        var wake2=new THREE.Mesh(new THREE.SphereGeometry(0.003,4,4),wakeMat2.clone());
        wake1.renderOrder=5;wake2.renderOrder=5;

        procesGroup.add(shipGroup);
        procesGroup.add(wake1);
        procesGroup.add(wake2);
        layerMeshes.migration.push(shipGroup,wake1,wake2);
        shipGroup.userData={migId:f.id};
        migrationParticles.push({mesh:shipGroup,wake1:wake1,wake2:wake2,curve:curve,phase:i/numIcons,isSea:true});

      } else {
        // Footprints: pair of ovals
        var footGroup=new THREE.Group();

        var footMat=new THREE.MeshPhongMaterial({
          color:col,transparent:true,opacity:0.80,
          emissive:col,emissiveIntensity:0.35,
        });
        var lGeo=new THREE.SphereGeometry(1,6,4);lGeo.scale(0.006,0.002,0.010);
        var lFoot=new THREE.Mesh(lGeo,footMat);lFoot.position.x=-0.010;lFoot.renderOrder=6;footGroup.add(lFoot);

        var rGeo=new THREE.SphereGeometry(1,6,4);rGeo.scale(0.006,0.002,0.010);
        var rFoot=new THREE.Mesh(rGeo,footMat.clone());rFoot.position.x=0.010;rFoot.renderOrder=6;footGroup.add(rFoot);

        var glowGeo=new THREE.SphereGeometry(0.014,6,4);
        var glowMat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.13,depthWrite:false,blending:THREE.AdditiveBlending});
        var glow=new THREE.Mesh(glowGeo,glowMat);glow.renderOrder=5;footGroup.add(glow);

        procesGroup.add(footGroup);
        footGroup.userData={migId:f.id};
        layerMeshes.migration.push(footGroup);
        migrationParticles.push({mesh:footGroup,wake1:null,wake2:null,curve:curve,phase:i/numIcons,isSea:false,hopOffset:i*0.7});
      }
    }

    // ── Origin pulse ring ─────────────────────────────────────────────────────
    var originPos=pts[0];
    var pRing=new THREE.Mesh(
      new THREE.RingGeometry(0.014,0.022,16),
      new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.70,side:THREE.DoubleSide,depthWrite:false})
    );
    pRing.position.copy(originPos);
    pRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),originPos.clone().normalize());
    pRing.renderOrder=4;
    procesGroup.add(pRing);layerMeshes.migration.push(pRing);

    // ── Destination arrow-like dot ────────────────────────────────────────────
    var destPos=pts[pts.length-1];
    var destDot=new THREE.Mesh(
      new THREE.SphereGeometry(0.014,8,8),
      new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.80,blending:THREE.AdditiveBlending,depthWrite:false})
    );
    destDot.position.copy(destPos);destDot.renderOrder=4;
    procesGroup.add(destDot);layerMeshes.migration.push(destDot);
  });
}

function rebuildReligion(religions){
  layerMeshes.religion.forEach(function(m){procesGroup.remove(m);});layerMeshes.religion=[];
  if(!state.religion||!religions)return;
  religions.forEach(function(rel){
    var col=hexToCol(rel.color);
    var center=ll2v3(rel.center.lat,rel.center.lon,1.018);
    var r=rel.radius*0.018;
    // Draw concentric glow rings
    for(var k=0;k<3;k++){
      var ringR=r*(0.6+k*0.2);
      var geo=new THREE.RingGeometry(ringR,ringR+0.006,48);
      var mat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.20-k*0.05,side:THREE.DoubleSide});
      var mesh=new THREE.Mesh(geo,mat);
      mesh.position.copy(center);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),center.clone().normalize());
      mesh.renderOrder=3;procesGroup.add(mesh);layerMeshes.religion.push(mesh);
    }
    // Center dot
    var dotGeo=new THREE.SphereGeometry(0.014,10,10);
    var dotMat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.85});
    var dot=new THREE.Mesh(dotGeo,dotMat);
    dot.position.copy(center);dot.renderOrder=4;
    procesGroup.add(dot);layerMeshes.religion.push(dot);
  });
}

function rebuildLanguages(langs){
  layerMeshes.languages.forEach(function(m){procesGroup.remove(m);});layerMeshes.languages=[];
  if(!state.languages||!langs)return;
  langs.forEach(function(lang){
    var col=hexToCol(lang.color);
    var pts=lang.ring.map(function(p){return ll2v3(p[1],p[0],1.016);});

    // Filled polygon via fan triangulation
    var centroid=new THREE.Vector3();
    pts.forEach(function(p){centroid.add(p);});
    centroid.divideScalar(pts.length).normalize().multiplyScalar(1.016);

    var fillVerts=[];
    for(var i=0;i<pts.length;i++){
      fillVerts.push(centroid.x,centroid.y,centroid.z);
      fillVerts.push(pts[i].x,pts[i].y,pts[i].z);
      fillVerts.push(pts[(i+1)%pts.length].x,pts[(i+1)%pts.length].y,pts[(i+1)%pts.length].z);
    }
    var fillGeo=new THREE.BufferGeometry();
    fillGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(fillVerts),3));
    var fillMat=new THREE.MeshBasicMaterial({
      color:col,transparent:true,opacity:0.22,
      side:THREE.DoubleSide,depthWrite:false,
      blending:THREE.AdditiveBlending,
    });
    var fill=new THREE.Mesh(fillGeo,fillMat);
    fill.renderOrder=2;
    fill.userData={langId:lang.id};
    procesGroup.add(fill);layerMeshes.languages.push(fill);

    // Border outline
    var linePts=pts.concat([pts[0]]);
    var lineGeo=new THREE.BufferGeometry().setFromPoints(linePts);
    var line=new THREE.Line(lineGeo,new THREE.LineBasicMaterial({
      color:col,opacity:0.75,transparent:true,
    }));
    line.renderOrder=3;
    line.userData={langId:lang.id};
    procesGroup.add(line);layerMeshes.languages.push(line);

    // Center dot for tapping
    var dotGeo=new THREE.SphereGeometry(0.018,8,8);
    var dotMat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.70,blending:THREE.AdditiveBlending,depthWrite:false});
    var dot=new THREE.Mesh(dotGeo,dotMat);
    dot.position.copy(centroid);dot.renderOrder=4;
    dot.userData={langId:lang.id};
    procesGroup.add(dot);layerMeshes.languages.push(dot);
  });
}

// ── Interaction ───────────────────────────────────────────────────────────────
var isDragging=false,lastX=0,lastY=0,lastMs=0;
var velX=0,velY=0;
var targetRotX=0,targetRotY=0;
var pinchDist=null;
var targetScale=1.0,currentScale=1.0;
var tapStartX=null,tapStartY=null,tapStartMs=0;
var raycaster=new THREE.Raycaster();
var mouse=new THREE.Vector2();

function getTappedPin(tx,ty){
  mouse.x=(tx/W)*2-1;mouse.y=-(ty/H)*2+1;
  raycaster.setFromCamera(mouse,camera);
  var dotMeshes=pinMeshes.filter(function(m){return m.userData&&m.userData.id;});
  var hits=raycaster.intersectObjects(dotMeshes,false);
  if(hits.length>0)return hits[0].object.userData.id;
  return null;
}

function getTappedRoute(tx,ty){
  mouse.x=(tx/W)*2-1;mouse.y=-(ty/H)*2+1;
  raycaster.setFromCamera(mouse,camera);
  var routeMeshes=layerMeshes.routes.filter(function(m){return m.userData&&m.userData.routeId;});
  var hits=raycaster.intersectObjects(routeMeshes,false);
  if(hits.length>0)return hits[0].object.userData.routeId;
  return null;
}

function getTappedMigration(tx,ty){
  mouse.x=(tx/W)*2-1;mouse.y=-(ty/H)*2+1;
  raycaster.setFromCamera(mouse,camera);
  var migMeshes=[];
  migrationParticles.forEach(function(mp){
    if(mp.mesh&&mp.mesh.userData&&mp.mesh.userData.migId){
      migMeshes.push(mp.mesh);
    }
  });
  var hits=raycaster.intersectObjects(migMeshes,true);
  if(hits.length>0){
    var obj=hits[0].object;
    while(obj.parent&&!obj.userData.migId)obj=obj.parent;
    return obj.userData.migId||null;
  }
  return null;
}

function getTappedLanguage(tx,ty){
  mouse.x=(tx/W)*2-1;mouse.y=-(ty/H)*2+1;
  raycaster.setFromCamera(mouse,camera);
  var langMeshes=layerMeshes.languages.filter(function(m){return m.userData&&m.userData.langId;});
  var hits=raycaster.intersectObjects(langMeshes,false);
  if(hits.length>0)return hits[0].object.userData.langId;
  return null;
}

document.addEventListener('touchstart',function(e){
  e.preventDefault();
  if(e.touches.length===2){
    var dx=e.touches[0].clientX-e.touches[1].clientX;
    var dy=e.touches[0].clientY-e.touches[1].clientY;
    pinchDist=Math.sqrt(dx*dx+dy*dy);isDragging=false;
  }else{
    isDragging=true;pinchDist=null;
    lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;lastMs=Date.now();
    tapStartX=lastX;tapStartY=lastY;tapStartMs=lastMs;velX=0;velY=0;
  }
},{passive:false});

document.addEventListener('touchmove',function(e){
  e.preventDefault();tapStartX=null;
  var now=Date.now();
  if(e.touches.length===2&&pinchDist!==null){
    isDragging=false;
    var dx=e.touches[0].clientX-e.touches[1].clientX;
    var dy=e.touches[0].clientY-e.touches[1].clientY;
    var dist=Math.sqrt(dx*dx+dy*dy);
    var newScale=targetScale*(dist/pinchDist);
    if(newScale<0.22){
      window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'zoomOutExit'}));
      return;
    }
    targetScale=Math.max(0.25,Math.min(1.8,newScale));pinchDist=dist;return;
  }
  if(e.touches.length===1&&isDragging){
    var dx2=e.touches[0].clientX-lastX;var dy2=e.touches[0].clientY-lastY;
    var dtMs=Math.max(now-lastMs,8);
    // Sensibilidad inversamente proporcional al zoom — más zoom = más suave
    var sens=0.004/Math.max(1,currentScale*currentScale);
    var sensX=sens*0.5; // eje vertical siempre más suave (polos fijos)
    targetRotY+=dx2*sens;targetRotX+=dy2*sensX;
    velX=(dx2*sens)/(dtMs/1000)*0.5;velY=(dy2*sensX)/(dtMs/1000)*0.5;
    lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;lastMs=now;
  }
},{passive:false});

document.addEventListener('touchend',function(e){
  if(e.touches.length<2)pinchDist=null;
  if(e.touches.length===0){
    if(tapStartX!==null&&(Date.now()-tapStartMs)<280){
      var pinId=getTappedPin(tapStartX,tapStartY);
      if(pinId){
        window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'pinTap',id:pinId}));
      }else{
        var routeId=getTappedRoute(tapStartX,tapStartY);
        if(routeId){
          window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'routeTap',id:routeId}));
        }else{
          var migId=getTappedMigration(tapStartX,tapStartY);
          if(migId){
            window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'migrationTap',id:migId}));
          }else{
            var langId=getTappedLanguage(tapStartX,tapStartY);
            if(langId)window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'languageTap',id:langId}));
          }
        }
      }
    }
    isDragging=false;tapStartX=null;
  }
},{passive:false});

// ── Message handler ───────────────────────────────────────────────────────────
document.addEventListener('message',handleRNMsg);
window.addEventListener('message',handleRNMsg);
function handleRNMsg(e){
  try{
    var msg=JSON.parse(e.data);
    if(msg.type==='updatePins'){PINS=msg.pins;console.log('PINS recibidos:',PINS.length);buildPins();}
    else if(msg.type==='rotateTo'){
      var phi=(msg.lon+180)*Math.PI/180;
      var rawRotY=Math.PI/2-phi;
      var curY=globeGroup.rotation.y;
      var diff=((rawRotY-curY)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI;
      targetRotY=curY+diff;
      targetRotX=(msg.lat*Math.PI/180)-0.15;
      targetScale=1.4;
    }
    else if(msg.type==='resetGlobe'){
      targetRotX=0;targetRotY=0;targetScale=1.0;velX=0;velY=0;
    }
    else if(msg.type==='lockRotation'){
      // Called when an event card opens: freeze inertia and auto-spin
      velX=0;velY=0;
      rotationLocked=true;
    }
    else if(msg.type==='unlockRotation'){
      rotationLocked=false;
    }
    else if(msg.type==='updateProcesses'){
      state.civilizations=msg.layers.civilizations;
      state.routes=msg.layers.routes;
      state.wars=msg.layers.wars;
      state.migration=msg.layers.migration;
      state.religion=msg.layers.religion;
      state.languages=msg.layers.languages;
      rebuildCivils(msg.civils||[]);
      rebuildRoutes(msg.routes||[]);
      rebuildWars(msg.wars||[]);
      rebuildMigration(msg.migration||[]);
      rebuildReligion(msg.religion||[]);
      rebuildLanguages(msg.languages||[]);
    }
    else if(msg.type==='updateDivisions'){
      buildDivisions(msg.layers||{});
    }
  }catch(_){}
}

// ── Reference / Divisions layers (static, not time-varying) ──────────────────

// Tectonic plate label positions and names
var TECTONIC_LABELS=[
  {name:'Placa del Pacífico',    lat:0,   lon:-160},
  {name:'Placa Norteamericana',  lat:50,  lon:-100},
  {name:'Placa Euroasiática',    lat:55,  lon:60},
  {name:'Placa Africana',        lat:0,   lon:20},
  {name:'Placa Sudamericana',    lat:-20, lon:-60},
  {name:'Placa Australiana',     lat:-30, lon:120},
  {name:'Placa Antártica',       lat:-80, lon:0},
  {name:'Placa de Nazca',        lat:-20, lon:-90},
  {name:'Placa del Caribe',      lat:15,  lon:-75},
  {name:'Placa Arábiga',         lat:25,  lon:45},
  {name:'Placa India',           lat:20,  lon:78},
  {name:'Placa de Cocos',        lat:12,  lon:-88},
  {name:'Placa de Filipinas',    lat:14,  lon:130},
];

// Geographic lines config
var GEO_LINES=[
  {name:'Ecuador',              lat:0,    color:0x44aaff, opacity:0.65},
  {name:'Trópico de Cáncer',   lat:23.5, color:0xffaa44, opacity:0.45},
  {name:'Trópico de Capricornio',lat:-23.5,color:0xffaa44,opacity:0.45},
  {name:'Círculo Ártico',      lat:66.5, color:0x88ccff, opacity:0.35},
  {name:'Círculo Antártico',   lat:-66.5,color:0x88ccff, opacity:0.35},
];

function makeTextSprite(text,color,scale){
  var canvas=document.createElement('canvas');
  canvas.width=512;canvas.height=64;
  var ctx2=canvas.getContext('2d');
  ctx2.clearRect(0,0,512,64);
  ctx2.font='bold 28px -apple-system,sans-serif';
  ctx2.fillStyle=color||'rgba(255,255,255,0.85)';
  ctx2.textAlign='center';ctx2.textBaseline='middle';
  // Shadow for readability
  ctx2.shadowColor='rgba(0,0,0,0.8)';ctx2.shadowBlur=6;
  ctx2.fillText(text,256,32);
  var tex=new THREE.CanvasTexture(canvas);
  var mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false});
  var sprite=new THREE.Sprite(mat);
  sprite.scale.set(scale||0.35,scale?scale*0.125:0.044,1);
  return sprite;
}

function geoJsonRingToLine(coords,r,col,opacity,width){
  var pts3=coords.map(function(c){return ll2v3(c[1],c[0],r);});
  var geo=new THREE.BufferGeometry().setFromPoints(pts3);
  var line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:col,transparent:true,opacity:opacity||0.55,linewidth:width||1}));
  return line;
}

var divGroup=new THREE.Group();divGroup.renderOrder=10;scene.add(divGroup);
var divMeshes=[];
var countriesLoaded=false,countriesCache=null;
var tectonicLoaded=false,tectonicCache=null;

function buildDivisions(layers){
  divMeshes.forEach(function(m){divGroup.remove(m);});divMeshes=[];

  // ── Geographic lines ─────────────────────────────────────────────────────────
  if(layers.geolines){
    GEO_LINES.forEach(function(gl){
      var pts3=[];
      for(var lon2=-180;lon2<=180;lon2+=1.5){pts3.push(ll2v3(gl.lat,lon2,1.021));}
      var geo2=new THREE.BufferGeometry().setFromPoints(pts3);
      var line=new THREE.Line(geo2,new THREE.LineBasicMaterial({color:gl.color,transparent:true,opacity:gl.opacity}));
      line.renderOrder=10;divGroup.add(line);divMeshes.push(line);
      if(layers.geolines_names){
        var sp=makeTextSprite(gl.name,gl.lat===0?'rgba(100,200,255,0.90)':'rgba(255,180,80,0.85)',0.32);
        sp.position.copy(ll2v3(gl.lat,0,1.030));
        sp.renderOrder=11;divGroup.add(sp);divMeshes.push(sp);
      }
    });
  }

  // ── Country borders from Natural Earth GeoJSON ───────────────────────────────
  if(layers.countries){
    if(countriesCache){
      renderCountries(countriesCache,layers.countries_names);
    } else if(!countriesLoaded){
      countriesLoaded=true;
      fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        .then(function(r){return r.json();})
        .then(function(data){
          countriesCache=data;
          if(layers.countries)renderCountries(data,layers.countries_names);
        })
        .catch(function(){countriesLoaded=false;});
    }
  }

  // ── Tectonic plates from GeoJSON ─────────────────────────────────────────────
  if(layers.tectonic){
    if(tectonicCache){
      renderTectonic(tectonicCache,layers.tectonic_names);
    } else if(!tectonicLoaded){
      tectonicLoaded=true;
      fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
        .then(function(r){return r.json();})
        .then(function(data){
          tectonicCache=data;
          if(layers.tectonic)renderTectonic(data,layers.tectonic_names);
        })
        .catch(function(){tectonicLoaded=false;});
    }
  }
}

function renderCountries(geojson,showNames){
  // Remove existing country meshes only
  var toRemove=divMeshes.filter(function(m){return m.userData&&m.userData.isCountry;});
  toRemove.forEach(function(m){divGroup.remove(m);});
  divMeshes=divMeshes.filter(function(m){return !m.userData||!m.userData.isCountry;});

  geojson.features.forEach(function(feat){
    var name=feat.properties.name||'';
    var geom=feat.geometry;
    var allRings=[];
    if(geom.type==='Polygon'){allRings=[geom.coordinates];}
    else if(geom.type==='MultiPolygon'){allRings=geom.coordinates;}
    allRings.forEach(function(poly){
      var ring=poly[0]; // outer ring only
      if(!ring||ring.length<3)return;
      var line=geoJsonRingToLine(ring,1.020,0xffffff,0.40,1);
      line.renderOrder=10;line.userData={isCountry:true};
      divGroup.add(line);divMeshes.push(line);
    });
    // Country name label — centroid approximation
    if(showNames&&name){
      var coords=geom.type==='Polygon'?geom.coordinates[0]:geom.coordinates[0][0];
      if(coords&&coords.length>0){
        var sumLon=0,sumLat=0;
        var n=Math.min(coords.length,20);
        for(var k=0;k<n;k++){sumLon+=coords[k][0];sumLat+=coords[k][1];}
        var cLon=sumLon/n,cLat=sumLat/n;
        var sp=makeTextSprite(name,'rgba(255,255,255,0.70)',0.22);
        sp.position.copy(ll2v3(cLat,cLon,1.028));
        sp.renderOrder=11;sp.userData={isCountry:true};
        divGroup.add(sp);divMeshes.push(sp);
      }
    }
  });
}

function renderTectonic(geojson,showNames){
  var toRemove=divMeshes.filter(function(m){return m.userData&&m.userData.isTectonic;});
  toRemove.forEach(function(m){divGroup.remove(m);});
  divMeshes=divMeshes.filter(function(m){return !m.userData||!m.userData.isTectonic;});

  var tecColor=0xFF6B35;
  geojson.features.forEach(function(feat){
    var geom=feat.geometry;
    var segments=[];
    if(geom.type==='LineString'){segments=[geom.coordinates];}
    else if(geom.type==='MultiLineString'){segments=geom.coordinates;}
    segments.forEach(function(seg){
      if(!seg||seg.length<2)return;
      // Break into chunks at antimeridian to avoid wrap artifacts
      var chunk=[];
      for(var i=0;i<seg.length;i++){
        if(i>0&&Math.abs(seg[i][0]-seg[i-1][0])>90){
          if(chunk.length>=2){
            var line=geoJsonRingToLine(chunk,1.022,tecColor,0.80,2);
            line.renderOrder=10;line.userData={isTectonic:true};
            divGroup.add(line);divMeshes.push(line);
          }
          chunk=[];
        }
        chunk.push(seg[i]);
      }
      if(chunk.length>=2){
        var line2=geoJsonRingToLine(chunk,1.022,tecColor,0.80,2);
        line2.renderOrder=10;line2.userData={isTectonic:true};
        divGroup.add(line2);divMeshes.push(line2);
      }
    });
  });

  if(showNames){
    TECTONIC_LABELS.forEach(function(lbl){
      var sp=makeTextSprite(lbl.name,'rgba(255,130,60,0.88)',0.30);
      sp.position.copy(ll2v3(lbl.lat,lbl.lon,1.030));
      sp.renderOrder=11;sp.userData={isTectonic:true};
      divGroup.add(sp);divMeshes.push(sp);
    });
  }
}

// ── Animation loop ────────────────────────────────────────────────────────────
var introT=0,clock=new THREE.Clock(),ringPhase=0,warPhase=0;
var rotationLocked=false; // true while an event card is open

function animate(){
  requestAnimationFrame(animate);
  var dt=Math.min(clock.getDelta(),0.05);
  if(introT<1){
    introT+=dt*0.9;if(introT>1)introT=1;
    var eased=introT<0.5?2*introT*introT:1-Math.pow(-2*introT+2,2)/2;
    camera.position.z=5.5-eased*2.7;
  }
  if(!isDragging&&!rotationLocked){
    targetRotY+=velX*dt;targetRotX+=velY*dt;
    velX*=0.85;velY*=0.85;
    if(Math.abs(velX)<0.005)targetRotY+=dt*0.04; // gentle auto-spin
  }
  // No vertical clamp — allow full rotation over poles
  globeGroup.rotation.y+=(targetRotY-globeGroup.rotation.y)*0.12;
  globeGroup.rotation.x+=(targetRotX-globeGroup.rotation.x)*0.12;
  procesGroup.rotation.y=globeGroup.rotation.y;
  procesGroup.rotation.x=globeGroup.rotation.x;
  divGroup.rotation.y=globeGroup.rotation.y;
  divGroup.rotation.x=globeGroup.rotation.x;
  currentScale+=(targetScale-currentScale)*0.1;
  globeGroup.scale.setScalar(currentScale);
  procesGroup.scale.setScalar(currentScale);
  divGroup.scale.setScalar(currentScale);

  // Pulse pins
  ringPhase+=dt*1.8;
  var pulse=Math.sin(ringPhase)*0.5+0.5;
  pinMeshes.forEach(function(m){
    if(m.geometry&&m.geometry.type==='RingGeometry')m.material.opacity=0.15+pulse*0.25;
  });

  // Pulse war rings
  warPhase+=dt*2.5;
  var warPulse=Math.sin(warPhase)*0.5+0.5;
  layerMeshes.wars.forEach(function(m){
    if(m.geometry&&m.geometry.type==='RingGeometry')m.material.opacity=0.40+warPulse*0.35;
  });

  // Move route particles
  particlePhase+=dt*0.12;
  routeParticles.forEach(function(rp){
    var t=((rp.phase+particlePhase)%1);
    var pos=rp.curve.getPoint(t);
    rp.mesh.position.copy(pos);
  });

  // Move migration icons
  var migT=(Date.now()*0.000055)%1;
  migrationParticles.forEach(function(mp){
    var t=((mp.phase+migT)%1);
    var pos=mp.curve.getPoint(t);
    var normal=pos.clone().normalize();

    if(mp.isSea){
      // Direction of travel projected onto tangent plane
      var tAhead=Math.min(t+0.012,0.999);
      var ahead=mp.curve.getPoint(tAhead);
      var travel=ahead.clone().sub(pos);
      // Remove normal component so direction stays on surface
      travel.addScaledVector(normal,-travel.dot(normal)).normalize();
      // right = travel × normal (points starboard)
      var right=new THREE.Vector3().crossVectors(travel,normal).normalize();
      // Build matrix: X=right(starboard), Y=normal(up from surface), Z=travel(bow direction)
      var mat4=new THREE.Matrix4().makeBasis(right,normal,travel);
      mp.mesh.position.copy(pos.clone().addScaledVector(normal,0.003));
      mp.mesh.quaternion.setFromRotationMatrix(mat4);

      // Wake dots trailing behind along the path
      if(mp.wake1){
        var tw1=Math.max(t-0.016,0);
        mp.wake1.position.copy(mp.curve.getPoint(tw1).addScaledVector(mp.curve.getPoint(tw1).clone().normalize(),0.002));
      }
      if(mp.wake2){
        var tw2=Math.max(t-0.030,0);
        mp.wake2.position.copy(mp.curve.getPoint(tw2).addScaledVector(mp.curve.getPoint(tw2).clone().normalize(),0.002));
      }
    } else {
      // Footprints: orient to surface, hop
      var tAhead2=Math.min(t+0.012,0.999);
      var ahead2=mp.curve.getPoint(tAhead2);
      var travel2=ahead2.clone().sub(pos);
      travel2.addScaledVector(normal,-travel2.dot(normal)).normalize();
      var right2=new THREE.Vector3().crossVectors(travel2,normal).normalize();
      var mat4b=new THREE.Matrix4().makeBasis(right2,normal,travel2);
      var hop=Math.max(0,Math.sin((t*(80+mp.hopOffset))%Math.PI))*0.015;
      mp.mesh.position.copy(pos.clone().addScaledVector(normal,0.003+hop));
      mp.mesh.quaternion.setFromRotationMatrix(mat4b);
    }
  });

  renderer.render(scene,camera);
  window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'frame'}));
}
animate();
</script>
</body>
</html>`;


// ─── UI Components (from explore.jsx) ────────────────────────────────────────
// ─── Wikipedia + contexto histórico ─────────────────────────────────────────
// ─── Wikipedia helpers ────────────────────────────────────────────────────────
const WIKI_CAUSAS  = ['antecedentes','causas','origen','origenes','contexto','preludio','background','causes','origins','context'];
const WIKI_CONSEC  = ['consecuencias','resultado','resultados','legado','impacto','secuelas','efectos','aftermath','consequences','results','legacy','impact'];
const CATS_WITH_CAUSES = ['politica', 'batallas', 'inventos', 'cultura', 'desastres', 'exploracion', 'religion'];

function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]+>/g,' ')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ')
    .replace(/\s{2,}/g,' ').trim();
}

async function fetchWikiSummaryLang(title, lang) {
  if (!title) return null;
  try {
    const encoded = encodeURIComponent(title.replace(/ /g,'_'));
    const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encoded}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type === 'disambiguation' || !data.extract) return null;
    return data;
  } catch (_) { return null; }
}

// Obtiene el título exacto de Wikipedia desde Wikidata usando el wikidataId
// Esto garantiza que "Sydney (Nova Scotia)" no cargue el artículo de Sydney Australia
async function fetchWikiTitleFromWikidata(wikidataId, lang) {
  if (!wikidataId) return null;
  try {
    const res = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&props=sitelinks&sitefilter=${lang}wiki&format=json&origin=*`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const sitelink = data.entities?.[wikidataId]?.sitelinks?.[`${lang}wiki`];
    return sitelink?.title || null;
  } catch (_) { return null; }
}

async function fetchWikiSearch(query, lang) {
  if (!query) return null;
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&srlimit=1&format=json&origin=*`);
    if (!res.ok) return null;
    const data = await res.json();
    const hit = data.query?.search?.[0];
    if (!hit) return null;
    return fetchWikiSummaryLang(hit.title, lang);
  } catch (_) { return null; }
}

async function fetchWikiData(searchTitle, event) {
  const wikidataId = event?.wikidataId || null;
  let sumData = null, usedLang = 'es';

  // Paso 1: Usar wikidataId para obtener el título EXACTO de Wikipedia
  // Esto evita ambigüedades como Sydney Nova Scotia vs Sydney Australia
  if (wikidataId) {
    for (const lang of ['es', 'en']) {
      const exactTitle = await fetchWikiTitleFromWikidata(wikidataId, lang);
      if (exactTitle) {
        sumData = await fetchWikiSummaryLang(exactTitle, lang);
        if (sumData) { usedLang = lang; break; }
      }
    }
  }

  // Paso 2: Fallback a wikiTitles del JSON
  if (!sumData) {
    const titlesToTry = [];
    if (event?.wikiTitles?.es) titlesToTry.push({ title: event.wikiTitles.es, lang: 'es' });
    if (event?.wikiTitles?.en) titlesToTry.push({ title: event.wikiTitles.en, lang: 'en' });
    if (searchTitle) {
      titlesToTry.push({ title: searchTitle, lang: 'es' });
      titlesToTry.push({ title: searchTitle, lang: 'en' });
    }
    for (const { title, lang } of titlesToTry) {
      sumData = await fetchWikiSummaryLang(title, lang);
      if (sumData) { usedLang = lang; break; }
    }
  }

  // Paso 3: Búsqueda por texto solo si todo lo anterior falló
  if (!sumData) {
    const searchQuery = event?.labels?.es || event?.labels?.en || searchTitle;
    if (searchQuery) {
      sumData = await fetchWikiSearch(searchQuery, 'es') || await fetchWikiSearch(searchQuery, 'en');
      if (sumData) usedLang = sumData.lang || 'es';
    }
  }

  if (!sumData) return { extract:null, wikiUrl:null, causas:null, consecuencias:null };

  const wikiUrl = sumData.content_urls?.mobile?.page || null;
  const normalizedTitle = sumData.titles?.normalized || sumData.title;

  // Fetch mobile-sections once: grab full intro text + causas/consecuencias
  let extract = sumData.extract || null; // fallback to short summary
  let causas = null, consecuencias = null;
  try {
    const secRes = await fetch(`https://${usedLang}.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(normalizedTitle.replace(/ /g,'_'))}`);
    if (secRes.ok) {
      const secData = await secRes.json();

      // Lead section — full intro paragraphs, much longer than /summary extract
      const leadHtml = secData.lead?.sections?.[0]?.text || '';
      const leadText = stripHtml(leadHtml).trim();
      // Use lead text if it's meaningfully longer than the summary extract
      if (leadText.length > (extract?.length || 0) + 100) {
        // Cap at ~1200 chars to keep card readable; premium will remove this cap
        extract = leadText.slice(0, 1200).trim();
        // If we cut mid-sentence, trim to last full stop
        const lastDot = extract.lastIndexOf('.');
        if (lastDot > 800) extract = extract.slice(0, lastDot + 1);
      }

      // Remaining sections — causas/consecuencias
      const sections = secData.remaining?.sections || [];
      for (const sec of sections) {
        const title = (sec.line||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
        const text  = stripHtml(sec.text||'');
        if (!text || text.length < 50) continue;
        if (!causas       && WIKI_CAUSAS.some(k => title.includes(k))) causas       = text.slice(0,600).trim();
        if (!consecuencias && WIKI_CONSEC.some(k  => title.includes(k))) consecuencias = text.slice(0,600).trim();
        if (causas && consecuencias) break;
      }
    }
  } catch (_) {}
  return { extract, wikiUrl, causas, consecuencias };
}

// "Al mismo tiempo" — 100% local, sin API, accionable
function getMientras(event, allEvents, activeCategories) {
  const toItem = ev => ({
    id:        ev.id,
    titulo:    ev.labels?.es || ev.label || ev.id,
    year:      ev.year,
    lat:       ev.lat,
    lon:       ev.lon,
    category:  ev.category,
    yearDelta: ev.year - event.year,
  });
  const activeCats = activeCategories && activeCategories.length > 0 ? activeCategories : null;
  const byWindow = (window, minImp) =>
    allEvents
      .filter(ev =>
        ev.id !== event.id &&
        Math.abs(ev.year - event.year) <= window &&
        (ev.importance||3) >= minImp &&
        (!activeCats || activeCats.includes(ev.category))
      )
      .sort((a,b) => (b.importance||3) - (a.importance||3))
      .slice(0,4)
      .map(toItem);
  const exact = byWindow(0, 2);
  if (exact.length >= 2) return exact;
  const near = byWindow(2, 2);
  if (near.length >= 2) return near;
  return byWindow(5, 3);
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, onClose, activeCategories }) {
  const { fontSize, palette } = useContext(SettingsContext);
  const [info,       setInfo]       = useState({ extract:null, wikiUrl:null, causas:null, consecuencias:null });
  const [mientras,   setMientras]   = useState([]);
  const [loadingWiki, setLoadingWiki] = useState(true);
  const slideAnim = useRef(new Animated.Value(350)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;
  const color = (palette || CATEGORY_COLORS)[event.category] || '#378ADD';
  const hasCauses = CATS_WITH_CAUSES.includes(event.category);

  useEffect(() => {
    setLoadingWiki(true);
    setInfo({ extract:null, wikiUrl:null, causas:null, consecuencias:null });

    Animated.parallel([
      Animated.spring(slideAnim, { toValue:0, useNativeDriver:true, tension:75, friction:12 }),
      Animated.timing(opacAnim,  { toValue:1, duration:200, useNativeDriver:true }),
    ]).start();

    // Wikipedia: summary + causas/consecuencias desde secciones
    const wikiTitle = event.wikiTitles?.es || event.wikiTitles?.en || event.wikiTitle || event.labels?.es || event.label;
    fetchWikiData(wikiTitle, event).then(d => { setInfo(d); setLoadingWiki(false); });

    // "Al mismo tiempo" — instantáneo, sin API, desde JSON local
    setMientras(getMientras(event, EVENTS, activeCategories));
  }, [event.id]);

  const close = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue:350, duration:200, useNativeDriver:true }),
      Animated.timing(opacAnim,  { toValue:0, duration:180, useNativeDriver:true }),
    ]).start(onClose);
  };

  const evYearStr = event.year < 0 ? `${Math.abs(event.year)} a.C.` : `${event.year} d.C.`;
  const catMeta = CATEGORY_META[event.category] || { label:'', emoji:'', color };

  return (
    <Animated.View style={[cardStyles.backdrop, { opacity: opacAnim }]} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <Animated.View style={[cardStyles.card, { transform:[{ translateY: slideAnim }] }]}>
        <View style={[cardStyles.accentBar, { backgroundColor: color }]} />
        <View style={cardStyles.header}>
          <View style={{ flex:1 }}>
            <Text style={cardStyles.yearLbl}>{evYearStr}</Text>
            <Text style={cardStyles.titleLbl}>{event.labels?.es || event.label}</Text>
          </View>
          <Pressable onPress={close} style={cardStyles.closeBtn}>
            <Text style={cardStyles.closeTxt}>✕</Text>
          </Pressable>
        </View>
        <View style={[cardStyles.tag, { borderColor: color + '55', backgroundColor: color + '14' }]}>
          <CatIcon cat={event.category} size={13} color={color} />
          <Text style={[cardStyles.tagTxt, { color }]}>{catMeta.label.toUpperCase()}</Text>
        </View>

        <ScrollView style={cardStyles.body} showsVerticalScrollIndicator={false} bounces={false}>

          {/* ── Resumen Wikipedia ───────────────────────────────────── */}
          {loadingWiki ? (
            <View style={cardStyles.loadingRow}>
              <ActivityIndicator size="small" color={color} />
              <Text style={cardStyles.loadingTxt}>Buscando en Wikipedia…</Text>
            </View>
          ) : info.extract ? (
            <Text style={cardStyles.summaryTxt}>{info.extract}</Text>
          ) : (
            <Text style={cardStyles.noSummary}>Sin resumen disponible.</Text>
          )}

          {/* ── Causas y consecuencias — desde secciones de Wikipedia ─ */}
          {hasCauses && !loadingWiki && (info.causas || info.consecuencias) && (
            <View style={cardStyles.contextSection}>
              <View style={{flexDirection:"row",alignItems:"center",gap:6,marginBottom:12}}>
                <Lightning size={14} color="rgba(255,255,255,0.70)" weight="fill" />
                <Text style={cardStyles.contextTitle}>Causas y consecuencias</Text>
              </View>
              {info.causas && (
                <View style={cardStyles.contextBlock}>
                  <Text style={cardStyles.contextLabel}>CAUSAS</Text>
                  <Text style={cardStyles.contextText}>{info.causas}</Text>
                </View>
              )}
              {info.consecuencias && (
                <View style={[cardStyles.contextBlock, { marginTop:10 }]}>
                  <Text style={cardStyles.contextLabel}>CONSECUENCIAS</Text>
                  <Text style={cardStyles.contextText}>{info.consecuencias}</Text>
                </View>
              )}
            </View>
          )}

          {/* ── Al mismo tiempo — local, accionable ─────────────────── */}
          {mientras.length > 0 && (
            <View style={cardStyles.contextSection}>
              <View style={{flexDirection:"row",alignItems:"center",gap:6,marginBottom:12}}>
                <Globe size={14} color="rgba(255,255,255,0.70)" weight="fill" />
                <Text style={cardStyles.contextTitle}>Al mismo tiempo</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap:10, paddingRight:4 }}>
                {mientras.map((item) => {
                  const PALETTE = (palette || CATEGORY_COLORS);
                  const chipColor = PALETTE[item.category] || '#378ADD';
                  const deltaLabel = item.yearDelta === 0 ? 'Mismo año'
                    : item.yearDelta < 0 ? `${Math.abs(item.yearDelta)} años antes`
                    : `${item.yearDelta} años después`;
                  return (
                    <TouchableOpacity key={item.id}
                      activeOpacity={0.7}
                      style={[cardStyles.contemporaryChip, { borderColor: chipColor + '55', backgroundColor: chipColor + '10' }]}
                      onPress={() => onClose && onClose({ navigateTo: item })}>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:5, marginBottom:5 }}>
                        <View style={{ width:7, height:7, borderRadius:4, backgroundColor: chipColor }} />
                        <Text style={[cardStyles.contemporaryPlace, { color: chipColor }]}>{deltaLabel}</Text>
                      </View>
                      <Text style={cardStyles.contemporaryTitle} numberOfLines={2}>{item.titulo}</Text>
                      <Text style={[cardStyles.contemporaryDesc, { marginTop:4 }]}>
                        {item.year < 0 ? `${Math.abs(item.year)} a.C.` : `${item.year} d.C.`} · Toca para ver →
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* ── Wikipedia link ──────────────────────────────────────── */}
          {!loadingWiki && info.wikiUrl && (
            <TouchableOpacity
              style={[cardStyles.wikiBtn, { borderColor: color + '44', marginHorizontal:0, marginTop:14 }]}
              onPress={() => Linking.openURL(info.wikiUrl)}>
              <BookOpen size={15} color={color} weight="regular" />
              <Text style={[cardStyles.wikiBtnTxt, { color }]}>Leer en Wikipedia</Text>
              <Text style={cardStyles.wikiBtnArrow}>↗</Text>
            </TouchableOpacity>
          )}

          <View style={{ height:16 }} />
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Route Info Card ──────────────────────────────────────────────────────────
async function fetchWikiSummary(title) {
  try {
    const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return { extract: data.extract || null, url: data.content_urls?.mobile?.page || null };
  } catch (_) { return { extract: null, url: null }; }
}

function RouteInfoCard({ route, onClose }) {
  const [info, setInfo]   = useState({ extract: null, url: null });
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(320)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoading(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue:0, useNativeDriver:true, tension:75, friction:12 }),
      Animated.timing(opacAnim,  { toValue:1, duration:200, useNativeDriver:true }),
    ]).start();
    fetchWikiSummary(route.wikiTitle || route.name).then(d => { setInfo(d); setLoading(false); });
  }, [route.id]);

  const close = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue:320, duration:200, useNativeDriver:true }),
      Animated.timing(opacAnim,  { toValue:0, duration:180, useNativeDriver:true }),
    ]).start(onClose);
  };

  return (
    <Animated.View style={[cardStyles.backdrop, { opacity: opacAnim }]} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <Animated.View style={[cardStyles.card, { transform:[{ translateY: slideAnim }] }]}>
        <View style={[cardStyles.accentBar, { backgroundColor: route.color }]} />
        <View style={cardStyles.header}>
          <View style={{ flex:1 }}>
            <Text style={cardStyles.yearLbl}>RUTA COMERCIAL</Text>
            <Text style={cardStyles.titleLbl}>{route.name}</Text>
          </View>
          <Pressable onPress={close} style={cardStyles.closeBtn}>
            <Text style={cardStyles.closeTxt}>✕</Text>
          </Pressable>
        </View>
        <ScrollView style={cardStyles.body} showsVerticalScrollIndicator={false} bounces={false}>
          <Text style={[cardStyles.summaryTxt, { fontStyle:'italic', color:'rgba(255,255,255,0.55)', marginBottom:10 }]}>{route.desc}</Text>
          {loading ? (
            <View style={cardStyles.loadingRow}><ActivityIndicator size="small" color={route.color} /><Text style={cardStyles.loadingTxt}>Buscando en Wikipedia…</Text></View>
          ) : info.extract ? (
            <Text style={cardStyles.summaryTxt}>{info.extract}</Text>
          ) : null}
          {!loading && info.url && (
            <TouchableOpacity style={[cardStyles.wikiBtn, { borderColor: route.color + '44', marginHorizontal:0, marginTop:14 }]}
              onPress={() => Linking.openURL(info.url)}>
              <BookOpen size={15} color={route.color} weight="regular" />
              <Text style={[cardStyles.wikiBtnTxt, { color: route.color }]}>Leer en Wikipedia</Text>
              <Text style={cardStyles.wikiBtnArrow}>↗</Text>
            </TouchableOpacity>
          )}
          <View style={{ height:8 }} />
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Migration Info Card ──────────────────────────────────────────────────────
function MigrationInfoCard({ migration, onClose }) {
  const [info, setInfo]     = useState({ extract: null, url: null });
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(320)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;
  const color = migration.color || '#2ECC71';

  useEffect(() => {
    setLoading(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue:0, useNativeDriver:true, tension:75, friction:12 }),
      Animated.timing(opacAnim,  { toValue:1, duration:200, useNativeDriver:true }),
    ]).start();
    fetchWikiSummary(migration.name).then(d => { setInfo(d); setLoading(false); });
  }, [migration.id]);

  const close = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue:320, duration:200, useNativeDriver:true }),
      Animated.timing(opacAnim,  { toValue:0, duration:180, useNativeDriver:true }),
    ]).start(onClose);
  };

  const isSea = migration.type === 'sea';
  const typeLabel = isSea ? 'MIGRACIÓN MARÍTIMA' : 'MIGRACIÓN TERRESTRE';
  const periodStr = `${migration.yearStart < 0 ? Math.abs(migration.yearStart)+' a.C.' : migration.yearStart+' d.C.'} — ${migration.yearEnd < 0 ? Math.abs(migration.yearEnd)+' a.C.' : migration.yearEnd === 2025 ? 'presente' : migration.yearEnd+' d.C.'}`;

  return (
    <Animated.View style={[cardStyles.backdrop, { opacity: opacAnim }]} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <Animated.View style={[cardStyles.card, { transform:[{ translateY: slideAnim }] }]}>
        <View style={[cardStyles.accentBar, { backgroundColor: color }]} />
        <View style={cardStyles.header}>
          <View style={{ flex:1 }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:4 }}>
              {isSea
                ? <Boat size={13} color="rgba(255,255,255,0.55)" weight="regular" />
                : <Compass size={13} color="rgba(255,255,255,0.55)" weight="regular" />}
              <Text style={cardStyles.yearLbl}>{typeLabel}</Text>
            </View>
            <Text style={cardStyles.titleLbl}>{migration.name}</Text>
            <Text style={[cardStyles.yearLbl, { marginTop:4, color: color }]}>{periodStr}</Text>
          </View>
          <Pressable onPress={close} style={cardStyles.closeBtn}>
            <Text style={cardStyles.closeTxt}>✕</Text>
          </Pressable>
        </View>
        <ScrollView style={cardStyles.body} showsVerticalScrollIndicator={false} bounces={false}>
          {loading ? (
            <View style={cardStyles.loadingRow}>
              <ActivityIndicator size="small" color={color} />
              <Text style={cardStyles.loadingTxt}>Buscando en Wikipedia…</Text>
            </View>
          ) : info.extract ? (
            <Text style={cardStyles.summaryTxt}>{info.extract}</Text>
          ) : (
            <Text style={cardStyles.noSummary}>Sin resumen disponible.</Text>
          )}
          {!loading && info.url && (
            <TouchableOpacity
              style={[cardStyles.wikiBtn, { borderColor: color+'44', marginHorizontal:0, marginTop:14 }]}
              onPress={() => Linking.openURL(info.url)}>
              <BookOpen size={15} color={color} weight="regular" />
              <Text style={[cardStyles.wikiBtnTxt, { color }]}>Leer en Wikipedia</Text>
              <Text style={cardStyles.wikiBtnArrow}>↗</Text>
            </TouchableOpacity>
          )}
          <View style={{ height:8 }} />
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}
// ─── Language Info Card ───────────────────────────────────────────────────────
function LanguageInfoCard({ language, onClose }) {
  const [info, setInfo]     = useState({ extract: null, url: null });
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(320)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;
  const color = language.color || '#BDC3C7';

  useEffect(() => {
    setLoading(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue:0, useNativeDriver:true, tension:75, friction:12 }),
      Animated.timing(opacAnim,  { toValue:1, duration:200, useNativeDriver:true }),
    ]).start();
    fetchWikiSummary(language.wikiTitle || language.name).then(d => { setInfo(d); setLoading(false); });
  }, [language.id]);

  const close = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue:320, duration:200, useNativeDriver:true }),
      Animated.timing(opacAnim,  { toValue:0, duration:180, useNativeDriver:true }),
    ]).start(onClose);
  };

  return (
    <Animated.View style={[cardStyles.backdrop, { opacity: opacAnim }]} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <Animated.View style={[cardStyles.card, { transform:[{ translateY: slideAnim }] }]}>
        <View style={[cardStyles.accentBar, { backgroundColor: color }]} />
        <View style={cardStyles.header}>
          <View style={{ flex:1 }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:4 }}>
              <ChatCircle size={13} color="rgba(255,255,255,0.55)" weight="regular" />
              <Text style={cardStyles.yearLbl}>IDIOMA</Text>
            </View>
            <Text style={cardStyles.titleLbl}>{language.name}</Text>
          </View>
          <Pressable onPress={close} style={cardStyles.closeBtn}>
            <Text style={cardStyles.closeTxt}>✕</Text>
          </Pressable>
        </View>
        <ScrollView style={cardStyles.body} showsVerticalScrollIndicator={false} bounces={false}>
          {loading ? (
            <View style={cardStyles.loadingRow}>
              <ActivityIndicator size="small" color={color} />
              <Text style={cardStyles.loadingTxt}>Buscando en Wikipedia…</Text>
            </View>
          ) : info.extract ? (
            <Text style={cardStyles.summaryTxt}>{info.extract}</Text>
          ) : (
            <Text style={cardStyles.noSummary}>Sin resumen disponible.</Text>
          )}
          {!loading && info.url && (
            <TouchableOpacity
              style={[cardStyles.wikiBtn, { borderColor: color+'44', marginHorizontal:0, marginTop:14 }]}
              onPress={() => Linking.openURL(info.url)}>
              <BookOpen size={15} color={color} weight="regular" />
              <Text style={[cardStyles.wikiBtnTxt, { color }]}>Leer en Wikipedia</Text>
              <Text style={cardStyles.wikiBtnArrow}>↗</Text>
            </TouchableOpacity>
          )}
          <View style={{ height:8 }} />
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}
function normalize(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function scoreEvent(ev, q) {
  const norm = normalize(q);
  const rawLabel = ev.labels?.es || ev.labels?.en || ev.label || '';
  const label = normalize(rawLabel);
  const yearStr = String(ev.year);
  if (label.startsWith(norm)) return 100;
  if (label.includes(norm)) return 80;
  if (yearStr.includes(norm)) return 60;
  const words = norm.split(' ');
  if (words.every(w => label.includes(w))) return 50;
  return 0;
}

function SearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const results = query.length >= 2
    ? EVENTS.map(e => ({ ...e, score: scoreEvent(e, query) }))
        .filter(e => e.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
    : [];

  return (
    <View style={searchSt.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={searchSt.modal}>
        <View style={searchSt.inputRow}>
          <MagnifyingGlass size={16} color={ICON_DIM} weight="bold" />
          <TextInput
            style={searchSt.input} placeholder="Buscar evento, persona, año…"
            placeholderTextColor="rgba(255,255,255,0.3)" value={query}
            onChangeText={setQuery} autoFocus returnKeyType="search"
            selectionColor="#378ADD" />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}><Text style={searchSt.clear}>✕</Text></Pressable>
          )}
        </View>
        <ScrollView style={searchSt.results} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
          {results.map(ev => {
            const yr = ev.year < 0 ? `${Math.abs(ev.year)} a.C.` : `${ev.year} d.C.`;
            const meta = CATEGORY_META[ev.category] || { emoji:'•', color:'#378ADD' };
            return (
              <Pressable key={ev.id} style={searchSt.result} onPress={() => onSelect(ev)}>
                <CatIcon cat={ev.category} size={15} color={meta.color} />
                <View style={{ flex:1 }}>
                  <Text style={searchSt.resultLabel} numberOfLines={1}>{ev.labels?.es || ev.labels?.en || ev.label}</Text>
                  <Text style={searchSt.resultYear}>{yr}</Text>
                </View>
                <View style={[searchSt.resultDot, { backgroundColor: meta.color }]} />
              </Pressable>
            );
          })}
          {query.length >= 2 && results.length === 0 && (
            <Text style={searchSt.noResults}>Sin resultados para "{query}"</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ on, color }) {
  return (
    <View style={[drawerSt.toggle, on && { backgroundColor: color }]}>
      <View style={[drawerSt.thumb, on && drawerSt.thumbOn]} />
    </View>
  );
}

// ─── Year Editor Modal (double-tap on year) ───────────────────────────────────
function YearEditor({ currentYear, onConfirm, onClose }) {
  const [raw, setRaw] = useState('');
  const [era, setEra]  = useState(currentYear < 0 ? 'aC' : 'dC');
  const slideAnim = useRef(new Animated.Value(200)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const absVal = Math.abs(currentYear);
    setRaw(String(absVal));
    setEra(currentYear < 0 ? 'aC' : 'dC');
    Animated.parallel([
      Animated.spring(slideAnim, { toValue:0, useNativeDriver:true, tension:90, friction:14 }),
      Animated.timing(opacAnim,  { toValue:1, duration:160, useNativeDriver:true }),
    ]).start();
  }, []);

  const confirm = () => {
    const num = parseInt(raw.replace(/\D/g,''), 10);
    if (!isNaN(num) && num > 0) {
      const yr = era === 'aC' ? -num : num;
      const clamped = Math.max(-70000, Math.min(2025, yr));
      onConfirm(clamped);
    }
    close();
  };

  const close = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue:200, duration:180, useNativeDriver:true }),
      Animated.timing(opacAnim,  { toValue:0,   duration:150, useNativeDriver:true }),
    ]).start(onClose);
  };

  return (
    <Animated.View style={[yeSt.backdrop, { opacity: opacAnim }]} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <Animated.View style={[yeSt.panel, { transform:[{ translateY: slideAnim }] }]}>
        <Text style={yeSt.title}>Ir al año</Text>
        <View style={yeSt.inputRow}>
          <TextInput
            style={yeSt.input}
            value={raw}
            onChangeText={v => setRaw(v.replace(/\D/g,''))}
            keyboardType="number-pad"
            placeholder="1492"
            placeholderTextColor="rgba(255,255,255,0.25)"
            autoFocus
            maxLength={6}
            selectionColor="#378ADD"
            returnKeyType="go"
            onSubmitEditing={confirm}
          />
          {/* Era toggle: a.C. / d.C. */}
          <View style={yeSt.eraToggle}>
            <Pressable
              style={[yeSt.eraBtn, era==='aC' && yeSt.eraBtnActive]}
              onPress={() => setEra('aC')}>
              <Text style={[yeSt.eraTxt, era==='aC' && yeSt.eraTxtActive]}>a.C.</Text>
            </Pressable>
            <Pressable
              style={[yeSt.eraBtn, era==='dC' && yeSt.eraBtnActive]}
              onPress={() => setEra('dC')}>
              <Text style={[yeSt.eraTxt, era==='dC' && yeSt.eraTxtActive]}>d.C.</Text>
            </Pressable>
          </View>
        </View>
        <TouchableOpacity style={yeSt.goBtn} onPress={confirm}>
          <Text style={yeSt.goBtnTxt}>Ir →</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Year Wheel ───────────────────────────────────────────────────────────────
function yearStr(y) {
  const r = Math.round(y);
  return r < 0 ? `${Math.abs(r)} a.C.` : `${r} d.C.`;
}

function YearWheel({ year, isPlaying, onYearChange }) {
  const { fontSize, calendar } = useContext(SettingsContext);
  const lastX      = useRef(null);
  const velRef     = useRef(0);
  const frameRef   = useRef(null);
  const yearRef    = useRef(year);
  const [showEditor, setShowEditor] = useState(false);

  // Double-tap detection
  const lastTapRef  = useRef(0);

  useEffect(() => { yearRef.current = year; }, [year]);

  const applyInertia = useCallback(() => {
    if (Math.abs(velRef.current) < 0.05) { velRef.current = 0; return; }
    velRef.current *= 0.82;
    yearRef.current = Math.max(-70000, Math.min(2025, yearRef.current + velRef.current));
    onYearChange(Math.round(yearRef.current));
    frameRef.current = requestAnimationFrame(applyInertia);
  }, [onYearChange]);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: (e) => {
      lastX.current = e.nativeEvent.pageX; velRef.current = 0;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    },
    onPanResponderMove: (e) => {
      if (lastX.current === null) return;
      const dx = e.nativeEvent.pageX - lastX.current;
      const delta = -dx * 0.07;
      velRef.current = delta;
      yearRef.current = Math.max(-70000, Math.min(2025, yearRef.current + delta));
      onYearChange(Math.round(yearRef.current));
      lastX.current = e.nativeEvent.pageX;
    },
    onPanResponderRelease: () => {
      lastX.current = null;
      frameRef.current = requestAnimationFrame(applyInertia);
    },
    onPanResponderTerminate: () => { lastX.current = null; },
  })).current;

  const handleYearPress = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      // Double tap → open editor
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      velRef.current = 0;
      setShowEditor(true);
    }
    lastTapRef.current = now;
  }, []);

  const r = Math.round(year);
  const offset = 1;
  return (
    <>
      <View style={ywSt.container} {...panResponder.panHandlers}>
        <Text style={[ywSt.ghost, ywSt.ghostLeft]}>{formatYear(r - offset, calendar)}</Text>
        <Pressable style={ywSt.center} onPress={handleYearPress}>
          <Text style={[ywSt.year, { fontSize: Math.max(12, fontSize) }]}>{formatYear(r, calendar)}</Text>
          {isPlaying && <View style={ywSt.dot} />}
        </Pressable>
        <Text style={[ywSt.ghost, ywSt.ghostRight]}>{formatYear(r + offset, calendar)}</Text>
      </View>
      {showEditor && (
        <YearEditor
          currentYear={year}
          onConfirm={(y) => { yearRef.current = y; onYearChange(y); }}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  );
}

// ─── Speed Slider ─────────────────────────────────────────────────────────────
function sliderToSpeed(v) { return parseFloat(Math.pow(10, (v / 100) * 2.3 - 1).toFixed(2)); }
function speedToSlider(s) { return Math.round(((Math.log10(s) + 1) / 2.3) * 100); }

function SpeedSlider({ value, onChange }) {
  const trackRef  = useRef(null);
  const trackLeft = useRef(0);
  const trackW    = useRef(1);

  const updateFromPageX = useCallback((pageX) => {
    const x   = pageX - trackLeft.current;
    const pct = Math.max(0, Math.min(1, x / trackW.current));
    onChange(Math.round(pct * 100));
  }, [onChange]);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder:         () => true,
    onStartShouldSetPanResponderCapture:  () => true,
    onMoveShouldSetPanResponder:          () => true,
    onMoveShouldSetPanResponderCapture:   () => true,
    onPanResponderGrant:  (e) => updateFromPageX(e.nativeEvent.pageX),
    onPanResponderMove:   (e) => updateFromPageX(e.nativeEvent.pageX),
    onPanResponderRelease: () => {},
  })).current;

  const filled = (value / 100) * trackW.current;
  return (
    <View
      ref={trackRef}
      style={playSt.track}
      onLayout={(e) => {
        const layout = e.nativeEvent.layout;
        trackW.current = layout.width;
        // measure absolute position for pageX calculations
        trackRef.current?.measure((_x, _y, _w, _h, px) => { trackLeft.current = px; });
      }}
      {...panResponder.panHandlers}>
      <View style={playSt.trackBg} />
      <View style={[playSt.trackFill, { width: Math.max(0, filled) }]} />
      <View style={[playSt.thumb, { left: Math.max(0, filled - 10) }]} />
    </View>
  );
}

function PlayBar({ isPlaying, speed, onToggle, onSpeedChange, onReset }) {
  const sliderVal = speedToSlider(speed);
  const displaySpeed = speed < 1 ? speed.toFixed(1) : Math.round(speed);
  return (
    <View style={playSt.bar}>
      <TouchableOpacity style={playSt.playBtn} onPress={onToggle}>
        {isPlaying
          ? <Pause size={22} color="#fff" weight="fill" />
          : <Play  size={22} color="#fff" weight="fill" />}
      </TouchableOpacity>
      <View style={playSt.sliderWrap}>
        <Text style={playSt.speedLabel}>{displaySpeed}×</Text>
        <SpeedSlider value={sliderVal} onChange={(v) => onSpeedChange(sliderToSpeed(v))} />
        <View style={playSt.sliderLabels}>
          <Text style={playSt.sliderLabelTxt}>lento</Text>
          <Text style={playSt.sliderLabelTxt}>rápido</Text>
        </View>
      </View>
      <TouchableOpacity style={playSt.resetBtn} onPress={onReset}>
        <Planet size={20} color="rgba(255,255,255,0.70)" weight="regular" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Unified Drawer ───────────────────────────────────────────────────────────
// Section: Eventos (5 toggle rows)
// Section: Procesos (6 toggle rows with accordion dropdowns for active items)
// Section: Ventana de tiempo

function ProcessSection({ def, on, items, itemsOn, onToggle, onItemToggle }) {
  const [open, setOpen] = useState(false);
  const rotAnim = useRef(new Animated.Value(0)).current;

  const toggleOpen = () => {
    const toVal = open ? 0 : 1;
    setOpen(!open);
    Animated.spring(rotAnim, { toValue:toVal, useNativeDriver:true, tension:120, friction:14 }).start();
  };
  const arrowRot = rotAnim.interpolate({ inputRange:[0,1], outputRange:['0deg','90deg'] });

  return (
    <View style={drawerSt.section}>
      <Pressable style={[drawerSt.row, on && { borderColor: def.color + '55' }]} onPress={toggleOpen}>
        <View style={[drawerSt.icon, on && { backgroundColor: def.color + '22', borderColor: def.color + '55' }]}>
          <ProcIcon proc={def.id} size={16} color={on ? def.color : ICON_DIM} />
        </View>
        <Text style={[drawerSt.rowLabel, on && { color:'#fff' }]}>{def.label}</Text>
        {items.length > 0 && (
          <Animated.Text style={[drawerSt.chevron, { transform:[{ rotate: arrowRot }] }]}>›</Animated.Text>
        )}
        <Pressable onPress={(e) => { e.stopPropagation(); onToggle(def.id); }} hitSlop={8}>
          <Toggle on={on} color={def.color} />
        </Pressable>
      </Pressable>
      {open && items.length > 0 && (
        <View style={drawerSt.dropdown}>
          {items.map(item => {
            const itemOn = itemsOn[item.id] !== false;
            return (
              <Pressable key={item.id} style={drawerSt.dropItem}
                onPress={() => onItemToggle(def.id, item.id)}>
                <View style={[drawerSt.dropDot, { backgroundColor: item.color || def.color }]} />
                <Text style={[drawerSt.dropLabel, itemOn && { color:'rgba(255,255,255,0.85)' }]}>{item.name}</Text>
                <Toggle on={itemOn} color={item.color || def.color} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function UnifiedDrawer({
  activeCategories, onCategoryToggle,
  processLayers, processItemsOn, onProcessToggle, onProcessItemToggle,
  tolerance, onToleranceChange,
  activeCivils, activeRoutes, activeWars,
  divisionLayers, onDivisionToggle,
  onClose,
}) {
  const { fontSize } = useContext(SettingsContext);
  const slideAnim    = useRef(new Animated.Value(SW)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim,    { toValue:0, useNativeDriver:true, tension:70, friction:14 }),
      Animated.timing(backdropAnim, { toValue:1, duration:250, useNativeDriver:true }),
    ]).start();
  }, []);

  const close = () => {
    Animated.parallel([
      Animated.timing(slideAnim,    { toValue:SW, duration:240, useNativeDriver:true }),
      Animated.timing(backdropAnim, { toValue:0,  duration:200, useNativeDriver:true }),
    ]).start(onClose);
  };

  const processItems = {
    civilizations: activeCivils.map(c => ({ id:c.id, name:c.name, color:c.color })),
    routes:        activeRoutes.map(r => ({ id:r.id, name:r.name, color:r.color })),
    wars:          activeWars.map(w  => ({ id:w.id, name:w.name, color:w.color })),
    migration:     [],
    religion:      [],
    languages:     [],
  };

  const EVENT_CATS = ['personas','politica','batallas','inventos','cultura','desastres','exploracion','religion'];
  const PROCESS_CATS = ['civilizations','routes','wars','migration','religion','languages'];

  const toleranceLabel = (t) => t === 0 ? 'Año exacto' : `± ${t} años`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[drawerSt.backdrop, { opacity: backdropAnim }]} pointerEvents="auto">
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>
      <Animated.View style={[drawerSt.panel, { transform:[{ translateX: slideAnim }] }]} pointerEvents="auto">
        <View style={drawerSt.header}>
          <Text style={drawerSt.title}>Capas</Text>
          <Pressable onPress={close} style={drawerSt.closeBtn}>
            <Text style={drawerSt.closeTxt}>✕</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={drawerSt.content} showsVerticalScrollIndicator={false}>

          {/* ── EVENTOS ─────────────────────────────── */}
          <Text style={drawerSt.sectionLabel}>Eventos</Text>
          <Text style={drawerSt.sectionSub}>Momentos puntuales en el tiempo</Text>
          {EVENT_CATS.map(cat => {
            const meta = CATEGORY_META[cat];
            const on = activeCategories.includes(cat);
            return (
              <Pressable key={cat} style={[drawerSt.row, on && { borderColor: meta.color + '55' }]}
                onPress={() => onCategoryToggle(cat)}>
                <View style={[drawerSt.icon, on && { backgroundColor: meta.color + '22', borderColor: meta.color + '55' }]}>
                  <CatIcon cat={cat} size={16} color={on ? meta.color : ICON_DIM} />
                </View>
                <Text style={[drawerSt.rowLabel, on && { color:'#fff' }, { fontSize }]}>{meta.label}</Text>
                <Toggle on={on} color={meta.color} />
              </Pressable>
            );
          })}

          <View style={drawerSt.divider} />

          {/* ── PROCESOS ────────────────────────────── */}
          <Text style={[drawerSt.sectionLabel, { marginTop:20 }]}>Procesos</Text>
          <Text style={drawerSt.sectionSub}>Fenómenos que evolucionan con el tiempo</Text>
          {PROCESS_CATS.map(pid => {
            const meta = PROCESS_META[pid];
            return (
              <ProcessSection
                key={pid}
                def={{ id:pid, ...meta }}
                on={processLayers[pid]}
                items={processItems[pid] || []}
                itemsOn={processItemsOn[pid] || {}}
                onToggle={onProcessToggle}
                onItemToggle={onProcessItemToggle}
              />
            );
          })}

          <View style={drawerSt.divider} />

          {/* ── DIVISIONES ──────────────────────────── */}
          <Text style={[drawerSt.sectionLabel, { marginTop:20 }]}>Divisiones</Text>
          <Text style={drawerSt.sectionSub}>Capas de referencia fijas para orientación geográfica</Text>
          {[
            { id:'countries', label:'Fronteras de países',   color:'rgba(255,255,255,0.85)', desc:'Límites actuales de los estados',      PhIcon: MapTrifold },
            { id:'tectonic',  label:'Placas tectónicas',     color:'#FF6B35',               desc:'Bordes de las placas de la corteza',   PhIcon: Mountains  },
            { id:'geolines',  label:'Líneas geográficas',    color:'#44aaff',               desc:'Ecuador, trópicos y círculos polares', PhIcon: Globe      },
          ].map(div => {
            const on = divisionLayers[div.id];
            const showNamesOn = divisionLayers[div.id + '_names'];
            return (
              <View key={div.id}>
                <Pressable
                  style={[drawerSt.row, on && { borderColor: div.color + '55' }]}
                  onPress={() => onDivisionToggle(div.id)}>
                  <View style={[drawerSt.icon, on && { backgroundColor: div.color + '22', borderColor: div.color + '55' }]}>
                    <div.PhIcon size={16} color={on ? div.color : ICON_DIM} weight="duotone" />
                  </View>
                  <View style={{ flex:1 }}>
                    <Text style={[drawerSt.rowLabel, on && { color:'#fff' }]}>{div.label}</Text>
                    <Text style={{ color:'rgba(255,255,255,0.28)', fontSize:11, marginTop:2 }}>{div.desc}</Text>
                  </View>
                  <Toggle on={on} color={div.color} />
                </Pressable>
                {on && (
                  <Pressable
                    style={{ flexDirection:'row', alignItems:'center', gap:8, paddingVertical:8, paddingHorizontal:16, marginBottom:4 }}
                    onPress={() => onDivisionToggle(div.id + '_names')}>
                    <TextT size={13} color={showNamesOn ? div.color : 'rgba(255,255,255,0.35)'} weight="regular" />
                    <Text style={{ flex:1, color: showNamesOn ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)', fontSize:12 }}>Mostrar nombres</Text>
                    <Toggle on={!!showNamesOn} color={div.color} />
                  </Pressable>
                )}
              </View>
            );
          })}

          <View style={drawerSt.divider} />

          {/* ── VENTANA DE TIEMPO ───────────────────── */}
          <Text style={[drawerSt.sectionLabel, { marginTop:20 }]}>Ventana de tiempo</Text>
          <Text style={drawerSt.sectionSub}>Cuántos años alrededor del año actual se muestran</Text>
          <View style={drawerSt.stepsRow}>
            {TOLERANCE_STEPS.map(step => {
              const active = tolerance === step;
              return (
                <Pressable key={step} style={[drawerSt.chip, active && drawerSt.chipActive]}
                  onPress={() => onToleranceChange(step)}>
                  <Text style={[drawerSt.chipTxt, active && drawerSt.chipTxtActive, { fontSize: Math.max(11, fontSize - 1) }]}>
                    {step === 0 ? 'Año exacto' : `± ${step} años`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ height:40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// ─── HamburgerIcon ────────────────────────────────────────────────────────────
function HamburgerIcon({ color = 'rgba(255,255,255,0.75)' }) {
  return <List size={20} color={color} weight="regular" />;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

// ─── Year input parser ────────────────────────────────────────────────────────
function parseYearInput(raw) {
  const s = raw.trim().toLowerCase().replace(/\./g, '');
  const numMatch = s.match(/^-?\d+/);
  if (!numMatch) return { year: null, valid: false };
  let num = parseInt(numMatch[0], 10);
  const rest = s.slice(numMatch[0].length).trim();
  const isAC = /a\s*c/.test(rest) || num < 0;
  const isDC = /d\s*c/.test(rest);
  if (isAC && num > 0) num = -num;
  if (isDC && num < 0) num = Math.abs(num);
  return { year: Math.max(-70000, Math.min(2025, num)), valid: true };
}
function displayYear(y) {
  if (y === null) return '';
  return y < 0 ? `${Math.abs(Math.round(y))} a.C.` : `${Math.round(y)} d.C.`;
}

// ─── Year Editor Modal ────────────────────────────────────────────────────────
function YearEditorModal({ currentYear, onConfirm, onClose }) {
  const [raw, setRaw] = useState('');
  const parsed = parseYearInput(raw);

  useEffect(() => {
    const abs = Math.abs(Math.round(currentYear));
    setRaw(currentYear < 0 ? `${abs} aC` : String(abs));
  }, []);

  const canConfirm = raw.trim().length > 0 && parsed.valid;
  const confirm = () => { if (canConfirm) onConfirm(parsed.year); onClose(); };

  const previewLabel = raw.trim().length === 0 ? 'Escribe un año…'
    : parsed.valid ? `→ ${displayYear(parsed.year)}` : 'Formato no reconocido';
  const previewColor = raw.trim().length === 0 ? 'rgba(255,255,255,0.22)'
    : parsed.valid ? '#378ADD' : '#E24B4A';

  return (
    <KeyboardAvoidingView style={yeSt.kv} behavior={Platform.OS==='ios'?'padding':'height'}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={yeSt.panel}>
        <Text style={yeSt.label}>SALTAR AL AÑO</Text>
        <TextInput style={yeSt.input} value={raw} onChangeText={setRaw}
          placeholder="ej: 206 aC · 1492 · -753"
          placeholderTextColor="rgba(255,255,255,0.20)"
          autoFocus autoCorrect={false} autoCapitalize="none"
          returnKeyType="go" onSubmitEditing={confirm} selectionColor="#378ADD" />
        <Text style={[yeSt.preview, { color: previewColor }]}>{previewLabel}</Text>
        <View style={yeSt.chips}>
          {['3000 aC','206 aC','44 aC','622','1492','1789','1945'].map(ex => (
            <Pressable key={ex} style={yeSt.chip} onPress={() => setRaw(ex)}>
              <Text style={yeSt.chipTxt}>{ex}</Text>
            </Pressable>
          ))}
        </View>
        <TouchableOpacity style={[yeSt.goBtn, !canConfirm && yeSt.goBtnOff]}
          onPress={confirm} disabled={!canConfirm}>
          <Text style={yeSt.goBtnTxt}>Ir →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
const yeSt = StyleSheet.create({
  kv:      { ...StyleSheet.absoluteFillObject, justifyContent:'flex-end', zIndex:300 },
  panel:   { backgroundColor:'#0c0c1c', borderTopLeftRadius:28, borderTopRightRadius:28, borderWidth:0.5, borderColor:'rgba(255,255,255,0.10)', paddingHorizontal:24, paddingTop:28, paddingBottom:48 },
  label:   { color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:'700', letterSpacing:1.5, marginBottom:16 },
  input:   { backgroundColor:'rgba(255,255,255,0.06)', borderRadius:16, borderWidth:0.5, borderColor:'rgba(255,255,255,0.16)', color:'#fff', fontSize:28, fontWeight:'300', paddingHorizontal:18, paddingVertical:14, letterSpacing:-0.5, marginBottom:10 },
  preview: { fontSize:14, fontWeight:'600', marginBottom:18, paddingHorizontal:4 },
  chips:   { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:20 },
  chip:    { paddingHorizontal:12, paddingVertical:7, borderRadius:20, backgroundColor:'rgba(255,255,255,0.06)', borderWidth:0.5, borderColor:'rgba(255,255,255,0.12)' },
  chipTxt: { color:'rgba(255,255,255,0.55)', fontSize:13 },
  goBtn:   { backgroundColor:'#378ADD', borderRadius:16, paddingVertical:15, alignItems:'center' },
  goBtnOff:{ backgroundColor:'rgba(55,138,221,0.30)' },
  goBtnTxt:{ color:'#fff', fontSize:16, fontWeight:'600' },
});

// ─── Settings Modal ───────────────────────────────────────────────────────────
const FONT_MIN = 12, FONT_MAX = 20;
const CALENDARS = [
  { id:'gregorian', label:'Gregoriano',       desc:'Estándar internacional' },
  { id:'julian',    label:'Juliano',           desc:'Europa antes del s. XVI' },
  { id:'islamic',   label:'Islámico (Hégira)', desc:'Ciclos lunares' },
  { id:'hebrew',    label:'Hebreo',            desc:'Lunisolar' },
];
const UI_LANGUAGES = [
  { id:'es', label:'Español' }, { id:'en', label:'English' },
  { id:'pt', label:'Português' }, { id:'fr', label:'Français' },
];

function SettingsModal({ onClose }) {
  const { fontSize, daltonism, contrast, calendar, language, update } = useContext(SettingsContext);
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

  return (
    <Animated.View style={[mSt.overlay, { opacity: opacAnim }]} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <Animated.View style={[mSt.sheet, { transform:[{ translateY: slideAnim }] }]}>
        <View style={mSt.handle} />
        <View style={mSt.header}>
          <Text style={mSt.title}>Ajustes</Text>
          <Pressable onPress={close} style={mSt.closeBtn}><Text style={mSt.closeTxt}>✕</Text></Pressable>
        </View>
        <ScrollView style={mSt.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:50 }}>

          {/* Tamaño de letra */}
          <View style={mSt.section}>
            <View style={mSt.sectionHeader}>
              <TextT size={18} color="rgba(255,255,255,0.7)" weight="regular" />
              <Text style={mSt.sectionTitle}>Tamaño de letra</Text>
            </View>
            <View style={mSt.fontPreviewBox}>
              <Text style={[mSt.fontPreviewTxt, { fontSize }]}>En 1492, Colón llegó a América.</Text>
            </View>
            <View style={mSt.stepperRow}>
              <TouchableOpacity style={[mSt.stepBtn, fontSize <= FONT_MIN && mSt.stepBtnOff]}
                onPress={() => update({ fontSize: Math.max(FONT_MIN, fontSize - 1) })}
                disabled={fontSize <= FONT_MIN}>
                <Text style={mSt.stepBtnTxt}>−</Text>
              </TouchableOpacity>
              <Text style={mSt.stepValue}>{fontSize} pt</Text>
              <TouchableOpacity style={[mSt.stepBtn, fontSize >= FONT_MAX && mSt.stepBtnOff]}
                onPress={() => update({ fontSize: Math.min(FONT_MAX, fontSize + 1) })}
                disabled={fontSize >= FONT_MAX}>
                <Text style={mSt.stepBtnTxt}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Accesibilidad */}
          <View style={mSt.section}>
            <View style={mSt.sectionHeader}>
              <Eye size={18} color="rgba(255,255,255,0.7)" weight="regular" />
              <Text style={mSt.sectionTitle}>Accesibilidad</Text>
            </View>
            {[
              { key:'daltonism', val:daltonism, label:'Modo daltonismo', desc:'Paleta accesible para daltonismo' },
              { key:'contrast',  val:contrast,  label:'Alto contraste',  desc:'Mayor contraste entre elementos' },
            ].map(item => (
              <Pressable key={item.key} style={mSt.item} onPress={() => update({ [item.key]: !item.val })}>
                <View style={{ flex:1 }}>
                  <Text style={[mSt.itemLabel, item.val && mSt.itemLabelOn]}>{item.label}</Text>
                  <Text style={mSt.itemDesc}>{item.desc}</Text>
                </View>
                <View style={[mSt.toggle, item.val && mSt.toggleOn]}>
                  <View style={[mSt.thumb, item.val && mSt.thumbOn]} />
                </View>
              </Pressable>
            ))}
          </View>

          {/* Tipo de calendario */}
          <View style={mSt.section}>
            <View style={mSt.sectionHeader}>
              <Calendar size={18} color="rgba(255,255,255,0.7)" weight="regular" />
              <Text style={mSt.sectionTitle}>Tipo de Calendario</Text>
            </View>
            <View style={mSt.pillGroup}>
              {CALENDARS.map(c => (
                <Pressable key={c.id} style={[mSt.pill, calendar===c.id && mSt.pillOn]}
                  onPress={() => update({ calendar: c.id })}>
                  <Text style={[mSt.pillTxt, calendar===c.id && mSt.pillTxtOn]}>{c.label}</Text>
                  {!!c.desc && <Text style={[mSt.pillDesc, calendar===c.id && mSt.pillDescOn]}>{c.desc}</Text>}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Idioma */}
          <View style={mSt.section}>
            <View style={mSt.sectionHeader}>
              <Globe size={18} color="rgba(255,255,255,0.7)" weight="regular" />
              <Text style={mSt.sectionTitle}>Idioma y Región</Text>
            </View>
            <View style={mSt.pillGroupH}>
              {UI_LANGUAGES.map(l => (
                <Pressable key={l.id} style={[mSt.pillH, language===l.id && mSt.pillOn]}
                  onPress={() => update({ language: l.id })}>
                  <Text style={[mSt.pillTxt, language===l.id && mSt.pillTxtOn]}>{l.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={mSt.footer}>El cambio de idioma se aplicará en la próxima sesión.</Text>
          </View>

        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Info Modal ───────────────────────────────────────────────────────────────
const INFO_SECTIONS = [
  { id:'version',      title:'Versión',               icon:'tag',
    content:'BlueDot v0.1.0 — Alpha\nDesarrollado con React Native + Expo Go.\nThree.js r128 para visualización 3D.' },
  { id:'philosophy',   title:'Filosofía',              icon:'planet',
    content:'BlueDot nació de una pregunta simple: ¿qué pasaba en el mundo cuando nació tu abuelo?\n\nLa historia no ocurre en libros — ocurre en el tiempo y en el espacio, simultáneamente, en todos los rincones del planeta. Queremos que cada persona pueda sentirla, no solo leerla.' },
  { id:'howto',        title:'Cómo usar',              icon:'book',
    content:'• Arrastra la Tierra alrededor del Sol para navegar en el tiempo.\n• Pellizca para cambiar la escala (años → décadas → siglos → milenios).\n• Pellizca ampliando o doble tap en la Tierra para entrar al globo interactivo.\n• En el globo, toca los puntos de color para ver fichas de eventos.\n• Usa la lupa para buscar eventos específicos.\n• Doble tap en el año para saltar a cualquier fecha.' },
  { id:'sources',      title:'Fuentes',                icon:'books',
    content:'Datos históricos: Wikipedia (español), Wikidata y revisión editorial propia.\n\nImágenes del globo: NASA Blue Marble, NOAA Earth at Night.\n\nMotor 3D: Three.js (MIT License).\n\nTextos contextuales generados por Claude (Anthropic) — tratar como orientativos.' },
  { id:'transparency', title:'Transparencia',          icon:'search',
    content:'BlueDot es un proyecto independiente sin financiamiento externo ni publicidad.\n\nNo recopilamos datos personales. Sin cuentas de usuario. Sin tracking de comportamiento.\n\nLos datos de Wikipedia se obtienen en tiempo real desde su API pública.' },
  { id:'disclaimer',   title:'Precisión de los datos', icon:'warning',
    content:'La historia es un campo vivo: fechas e interpretaciones pueden variar según la fuente.\n\nAlgunos eventos pueden estar incompletos o simplificados para la visualización.\n\nSi encuentras un error, escríbenos — nos ayudas a mejorar.' },
  { id:'donate',       title:'Apoya el proyecto',      icon:'heart',
    content:'BlueDot es gratuito y sin publicidad. Si te parece valioso, puedes apoyar su desarrollo con una donación voluntaria.',
    action:{ label:'Hacer una donación →', url:'https://buymeacoffee.com/' } },
];

function InfoModal({ onClose }) {
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

  return (
    <Animated.View style={[mSt.overlay, { opacity: opacAnim }]} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <Animated.View style={[mSt.sheet, { transform:[{ translateY: slideAnim }] }]}>
        <View style={mSt.handle} />
        <View style={mSt.header}>
          <Text style={mSt.title}>Acerca de BlueDot</Text>
          <Pressable onPress={close} style={mSt.closeBtn}><Text style={mSt.closeTxt}>✕</Text></Pressable>
        </View>
        <ScrollView style={mSt.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:60 }}>
          {INFO_SECTIONS.map(sec => (
            <View key={sec.id} style={mSt.section}>
              <View style={mSt.sectionHeader}>
                <InfoSectionIcon id={sec.icon} />
                <Text style={mSt.sectionTitle}>{sec.title}</Text>
              </View>
              <Text style={mSt.infoText}>{sec.content}</Text>
              {sec.action && (
                <TouchableOpacity style={mSt.actionBtn} onPress={() => Linking.openURL(sec.action.url)}>
                  <Text style={mSt.actionBtnTxt}>{sec.action.label}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Shared modal styles ──────────────────────────────────────────────────────
const mSt = StyleSheet.create({
  overlay:       { ...StyleSheet.absoluteFillObject, justifyContent:'flex-end', zIndex:200 },
  sheet:         { backgroundColor:'#0c0c1c', maxHeight:SH*0.92, borderTopLeftRadius:28, borderTopRightRadius:28, borderWidth:0.5, borderColor:'rgba(255,255,255,0.08)', shadowColor:'#000', shadowOffset:{width:0,height:-6}, shadowOpacity:0.5, shadowRadius:20, elevation:20 },
  handle:        { width:40, height:4, borderRadius:2, backgroundColor:'rgba(255,255,255,0.15)', alignSelf:'center', marginTop:12, marginBottom:4 },
  header:        { flexDirection:'row', alignItems:'center', paddingHorizontal:24, paddingVertical:18, borderBottomWidth:0.5, borderColor:'rgba(255,255,255,0.07)' },
  title:         { flex:1, color:'#fff', fontSize:18, fontWeight:'600', letterSpacing:-0.3 },
  closeBtn:      { width:30, height:30, borderRadius:15, backgroundColor:'rgba(255,255,255,0.07)', alignItems:'center', justifyContent:'center' },
  closeTxt:      { color:'rgba(255,255,255,0.5)', fontSize:13 },
  scroll:        { paddingHorizontal:24 },
  section:       { paddingVertical:20, borderBottomWidth:0.5, borderColor:'rgba(255,255,255,0.06)' },
  sectionHeader: { flexDirection:'row', alignItems:'center', gap:10, marginBottom:14 },
  sectionTitle:  { color:'rgba(255,255,255,0.80)', fontSize:14, fontWeight:'700' },
  fontPreviewBox:{ backgroundColor:'rgba(255,255,255,0.04)', borderRadius:14, padding:16, marginBottom:14, borderWidth:0.5, borderColor:'rgba(255,255,255,0.08)' },
  fontPreviewTxt:{ color:'rgba(255,255,255,0.78)', lineHeight:24 },
  stepperRow:    { flexDirection:'row', alignItems:'center', gap:16 },
  stepBtn:       { width:44, height:44, borderRadius:22, backgroundColor:'rgba(255,255,255,0.08)', borderWidth:0.5, borderColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center' },
  stepBtnOff:    { opacity:0.3 },
  stepBtnTxt:    { color:'#fff', fontSize:22, fontWeight:'300', lineHeight:28 },
  stepValue:     { flex:1, textAlign:'center', color:'#fff', fontSize:16, fontWeight:'500' },
  item:          { flexDirection:'row', alignItems:'center', paddingVertical:11, gap:12 },
  itemLabel:     { color:'rgba(255,255,255,0.45)', fontSize:14, fontWeight:'500' },
  itemLabelOn:   { color:'#fff' },
  itemDesc:      { color:'rgba(255,255,255,0.28)', fontSize:12, marginTop:2 },
  toggle:        { width:36, height:20, borderRadius:10, backgroundColor:'rgba(255,255,255,0.10)', justifyContent:'center', paddingHorizontal:2 },
  toggleOn:      { backgroundColor:'rgba(55,138,221,0.70)' },
  thumb:         { width:16, height:16, borderRadius:8, backgroundColor:'rgba(255,255,255,0.35)', alignSelf:'flex-start' },
  thumbOn:       { alignSelf:'flex-end', backgroundColor:'#fff' },
  pillGroup:     { gap:8 },
  pillGroupH:    { flexDirection:'row', flexWrap:'wrap', gap:8 },
  pill:          { padding:12, borderRadius:14, borderWidth:0.5, borderColor:'rgba(255,255,255,0.12)', backgroundColor:'rgba(255,255,255,0.04)' },
  pillH:         { paddingHorizontal:16, paddingVertical:10, borderRadius:20, borderWidth:0.5, borderColor:'rgba(255,255,255,0.12)', backgroundColor:'rgba(255,255,255,0.04)' },
  pillOn:        { backgroundColor:'rgba(55,138,221,0.20)', borderColor:'rgba(55,138,221,0.55)' },
  pillTxt:       { color:'rgba(255,255,255,0.45)', fontSize:14, fontWeight:'500' },
  pillTxtOn:     { color:'#fff' },
  pillDesc:      { color:'rgba(255,255,255,0.30)', fontSize:11, marginTop:3 },
  pillDescOn:    { color:'rgba(255,255,255,0.55)' },
  footer:        { color:'rgba(255,255,255,0.22)', fontSize:11, lineHeight:17, marginTop:14 },
  infoText:      { color:'rgba(255,255,255,0.62)', fontSize:14, lineHeight:22 },
  actionBtn:     { marginTop:14, backgroundColor:'rgba(55,138,221,0.20)', borderRadius:12, borderWidth:0.5, borderColor:'rgba(55,138,221,0.50)', paddingVertical:12, paddingHorizontal:16, alignSelf:'flex-start' },
  actionBtnTxt:  { color:'#378ADD', fontSize:13, fontWeight:'600' },
});

// ─── Info section icon renderer ──────────────────────────────────────────────
function InfoSectionIcon({ id }) {
  const props = { size:18, color:'rgba(255,255,255,0.7)', weight:'regular' };
  const map = {
    tag:     <Tag     {...props} />,
    planet:  <Planet  {...props} />,
    book:    <BookOpen {...props} />,
    books:   <Books   {...props} />,
    search:  <MagnifyingGlass {...props} />,
    warning: <Warning {...props} />,
    heart:   <Heart   {...props} />,
  };
  return map[id] || null;
}

// ─── Main App Component ───────────────────────────────────────────────────────
// Single component with two WebViews. Globe is always mounted (opacity 0 when hidden).
// Orbital sends {type:'showGlobe'} → we fade globe in, fade orbital out.
// Pinch-out on globe sends {type:'zoomOutExit'} → we reverse.

export default function BlueDotApp() {
  const storeYear    = useTimeStore(s => s.currentYear);
  const setStoreYear = useTimeStore(s => s.setYear);

  // Consume settings — drives colors, font sizes, contrast across whole app
  const { fontSize, daltonism, contrast, calendar, palette, bgColor } = useContext(SettingsContext);
  const paletteRef = useRef(palette);
  useEffect(() => { paletteRef.current = palette; }, [palette]);

  // Re-send pins with new colors when daltonism toggles
  useEffect(() => {
    sendPins(yearRef.current, activeCatRef.current, toleranceRef.current, true);
  }, [daltonism]);

  // Which view is active: 'orbital' | 'globe'
  const [screen, setScreen] = useState('orbital');
  const screenRef = useRef('orbital'); // ref version for use in callbacks/intervals
  const orbitalOpacity = useRef(new Animated.Value(1)).current;
  const globeOpacity   = useRef(new Animated.Value(0)).current;

  const orbitalRef = useRef(null);
  const globeRef   = useRef(null);

  // ── Globe state (was ExploreScreen state) ─────────────────────────────────
// ─── Globe section state/logic (embedded in BlueDotApp) ─────────────────────

  const [year,            setYear]           = useState(storeYear);
  const [tolerance,       setTolerance]      = useState(25);
  const [activeCategories,setActiveCategories] = useState(['personas','politica','batallas','inventos','cultura','desastres','exploracion','religion']);
  const [processLayers,   setProcessLayers]  = useState({
    civilizations:false, routes:false, wars:false,
    migration:false, religion:false, languages:false,
  });
  const [processItemsOn,  setProcessItemsOn] = useState({
    civilizations:{}, routes:{}, wars:{}, migration:{}, religion:{}, languages:{},
  });
  const [showDrawer,    setShowDrawer]    = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [routeCard,     setRouteCard]     = useState(null);
  const [migrationCard, setMigrationCard] = useState(null);
  const [languageCard,  setLanguageCard]  = useState(null);

  const [divisionLayers, setDivisionLayers] = useState({
    countries: false, countries_names: false,
    tectonic: false,  tectonic_names: false,
    geolines: false,  geolines_names: false,
  });
  const divisionLayersRef = useRef({
    countries: false, countries_names: false,
    tectonic: false,  tectonic_names: false,
    geolines: false,  geolines_names: false,
  });
  useEffect(() => { divisionLayersRef.current = divisionLayers; }, [divisionLayers]);

  const sendDivisions = useCallback((layers) => {
    if (!globeRef.current) return;
    globeRef.current.postMessage(JSON.stringify({ type:'updateDivisions', layers }));
  }, []);

  const toggleDivision = useCallback((id) => {
    setDivisionLayers(prev => {
      const next = { ...prev, [id]: !prev[id] };
      setTimeout(() => sendDivisions(next), 0);
      return next;
    });
  }, [sendDivisions]);

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed,     setSpeed]     = useState(1);

  // webviewRef renamed to globeRef (declared in BlueDotApp)
  const yearRef        = useRef(storeYear);
  const speedRef       = useRef(1);
  const lastPinsSentRef = useRef(-99999);
  const lastProcSentRef = useRef(-99999);
  const processLayersRef  = useRef(processLayers);
  const processItemsOnRef = useRef(processItemsOn);
  const activeCatRef      = useRef(activeCategories);
  const toleranceRef      = useRef(tolerance);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { processLayersRef.current = processLayers; }, [processLayers]);
  useEffect(() => { processItemsOnRef.current = processItemsOn; }, [processItemsOn]);
  useEffect(() => { activeCatRef.current = activeCategories; }, [activeCategories]);
  useEffect(() => { toleranceRef.current = tolerance; }, [tolerance]);

  // ── Derived process data ─────────────────────────────────────────────────
  const roundedYear   = Math.round(year);
  const narrative     = getNarrative(roundedYear);
  const activeCivils  = getActiveCivils(roundedYear);
  const activeRoutes  = getActiveRoutes(roundedYear);
  const activeWars    = getActiveWars(roundedYear);

  const activeItems = [
    ...(processLayers.civilizations ? activeCivils.map(c=>({id:c.id,name:c.name,color:c.color})) : []),
    ...(processLayers.routes  ? activeRoutes.map(r=>({id:r.id,name:r.name,color:r.color})) : []),
    ...(processLayers.wars    ? activeWars.map(w=>({id:w.id,name:w.name,color:w.color})) : []),
  ];

  // ── Send pins to WebView ─────────────────────────────────────────────────
  const sendPins = useCallback((yr, cats, tol, force = false) => {
    if (!globeRef.current) return;
    const rounded = Math.round(yr);
    if (!force && Math.abs(rounded - lastPinsSentRef.current) < 2) return;
    lastPinsSentRef.current = rounded;
    const pinsJson = makeEventsJSON(rounded, cats, tol, paletteRef.current);
    globeRef.current.postMessage(JSON.stringify({ type:'updatePins', pins: JSON.parse(pinsJson) }));
  }, []);

  // ── Send process layers to WebView ───────────────────────────────────────
  const sendProcesses = useCallback((yr, layers, itemsOn, force = false) => {
    if (!globeRef.current) return;
    const rounded = Math.round(yr);
    if (!force && Math.abs(rounded - lastProcSentRef.current) < 3) return;
    lastProcSentRef.current = rounded;

    const curItemsOn = itemsOn || processItemsOnRef.current;
    const civils = getActiveCivils(rounded)
      .filter(c => (curItemsOn.civilizations||{})[c.id] !== false)
      .map(c => ({ id:c.id, color:c.color, ring:c.ring, opacity:c.opacity }));
    const routes = getActiveRoutes(rounded)
      .filter(r => (curItemsOn.routes||{})[r.id] !== false)
      .map(r => ({ id:r.id, color:r.color, points:r.points }));
    const wars = getActiveWars(rounded)
      .filter(w => (curItemsOn.wars||{})[w.id] !== false)
      .map(w => ({ id:w.id, color:w.color, lat:w.lat, lon:w.lon, radius:w.radius }));
    const migration = getActiveMigrations(rounded)
      .map(m => ({ id:m.id, color:m.color, type:m.type, waypoints:m.waypoints, name:m.name }));
    const religion = getActiveReligions(rounded)
      .map(r => ({ id:r.id, color:r.color, center:r.center, radius:r.radius }));
    const languages = getActiveLanguages(rounded)
      .map(l => ({ id:l.id, color:l.color, ring:l.ring, name:l.name, wikiTitle:l.wikiTitle }));

    globeRef.current.postMessage(JSON.stringify({
      type:'updateProcesses', layers, civils, routes, wars, migration, religion, languages,
    }));
  }, []);

  const lastStoreSyncRef = useRef(0);
  const playIntervalRef = useRef(null);

  // ── Play loop: plain setInterval, no RAF, no re-render issues ────────────
  // Called every 50ms (~20fps). Advances year using refs only.
  // setYear called in the same interval to update UI — no separate effect needed.
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        const dt = 0.05; // 50ms in seconds
        const newY = Math.min(2025, yearRef.current + speedRef.current * 5 * dt);
        yearRef.current = newY;
        const rounded = Math.round(newY);

        // Update UI year wheel
        setYear(rounded);

        // Sync store every 500ms
        if (Date.now() - lastStoreSyncRef.current > 500) {
          setStoreYear(rounded);
          lastStoreSyncRef.current = Date.now();
          // Also push year to orbital canvas so it stays in sync
          orbitalRef.current?.postMessage(JSON.stringify({ type:'setYear', year: rounded }));
        }

        // Send to globe WebView
        sendPins(newY, activeCatRef.current, toleranceRef.current, false);
        sendProcesses(newY, processLayersRef.current, processItemsOnRef.current, false);

        // Stop at end
        if (newY >= 2025) {
          setIsPlaying(false);
        }
      }, 50);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      setYear(Math.round(yearRef.current));
      setStoreYear(Math.round(yearRef.current));
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying]); // eslint-disable-line

  // ── Re-send when layers/tolerance change ─────────────────────────────────
  useEffect(() => {
    sendPins(yearRef.current, activeCategories, tolerance, true);
  }, [activeCategories, tolerance]);

  useEffect(() => {
    sendProcesses(yearRef.current, processLayers, processItemsOn, true);
  }, [processLayers, processItemsOn]);

  // Pre-compute orbital events (importance 5) once
  const orbitalEvents = EVENTS
    .filter(e => (e.importance||3) >= 5)
    .map(e => ({
      y: e.year,
      l: e.labels?.es || e.labels?.en || e.label || '',
      c: CATEGORY_COLORS_NORMAL[e.category] || '#D85A30',
    }));

  const onWebViewLoad = useCallback(() => {
    setTimeout(() => {
      sendPins(yearRef.current, activeCatRef.current, toleranceRef.current, true);
      sendProcesses(yearRef.current, processLayersRef.current, processItemsOnRef.current, true);
      sendDivisions(divisionLayersRef.current);
    }, 500);
  }, [sendPins, sendProcesses, sendDivisions]);

  const onOrbitalLoad = useCallback(() => {
    setTimeout(() => {
      orbitalRef.current?.postMessage(JSON.stringify({
        type: 'updateOrbitalEvents',
        events: orbitalEvents,
      }));
    }, 300);
  }, []);

  // ── Camera rotation to event ──────────────────────────────────────────────
  const rotateToEvent = useCallback((ev) => {
    if (!globeRef.current) return;
    globeRef.current.postMessage(JSON.stringify({ type:'rotateTo', lat:ev.lat, lon:ev.lon }));
  }, []);

  // Track whether play was active before opening a card so we can restore it
  const wasPlayingRef = useRef(false);

  const openEvent = useCallback((ev) => {
    // 1. Pause playback
    wasPlayingRef.current = isPlaying;
    setIsPlaying(false);
    // 2. Lock globe inertia and auto-spin
    globeRef.current?.postMessage(JSON.stringify({ type:'lockRotation' }));
    // 3. Rotate to location
    setTimeout(() => rotateToEvent(ev), 80);
    // 4. Show card
    setTimeout(() => setSelectedEvent(ev), 180);
  }, [isPlaying, rotateToEvent]);

  const closeEvent = useCallback((opts) => {
    setSelectedEvent(null);
    globeRef.current?.postMessage(JSON.stringify({ type:'unlockRotation' }));
    if (opts?.navigateTo) {
      const target = EVENTS.find(ev => ev.id === opts.navigateTo.id);
      if (target) {
        // Sync year to the target event before opening its card
        const targetYear = target.year;
        yearRef.current = targetYear;
        setYear(targetYear);
        setStoreYear(targetYear);
        sendPins(targetYear, activeCatRef.current, toleranceRef.current, true);
        setTimeout(() => openEvent(target), 120);
        return;
      }
    }
    if (wasPlayingRef.current) setIsPlaying(true);
  }, [openEvent, setStoreYear, sendPins]);

  // ── Drawer toggles ────────────────────────────────────────────────────────
  const toggleCategory = useCallback((cat) => {
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  const toggleProcess = useCallback((pid) => {
    setProcessLayers(prev => ({ ...prev, [pid]: !prev[pid] }));
  }, []);

  const toggleProcessItem = useCallback((pid, itemId) => {
    setProcessItemsOn(prev => ({
      ...prev,
      [pid]: { ...(prev[pid]||{}), [itemId]: (prev[pid]||{})[itemId] === false ? true : false },
    }));
  }, []);


  // zoom-out handled by switchToOrbital in BlueDotApp

  // ── Screen switch ─────────────────────────────────────────────────────────
  const switchToGlobe = useCallback(() => {
    screenRef.current = 'globe';
    setScreen('globe');
    // Sync orbital canvas to current year immediately so it's correct when user returns
    orbitalRef.current?.postMessage(JSON.stringify({ type:'setYear', year: Math.round(yearRef.current) }));
    Animated.parallel([
      Animated.timing(orbitalOpacity, { toValue:0, duration:0, useNativeDriver:true }),
      Animated.timing(globeOpacity,   { toValue:1, duration:0, useNativeDriver:true }),
    ]).start();
  }, []);

  const switchToOrbital = useCallback((yr) => {
    screenRef.current = 'orbital';
    const finalYear = yr ?? Math.round(yearRef.current);
    // Sync React state immediately — no waiting for orbital frame messages
    yearRef.current = finalYear;
    setYear(finalYear);
    setStoreYear(finalYear);
    setScreen('orbital');
    // Fade suave de globo a orbital — el canvas orbital ya está animando zoom-out
    Animated.sequence([
      Animated.timing(globeOpacity,   { toValue:0, duration:400, useNativeDriver:true }),
      Animated.timing(orbitalOpacity, { toValue:1, duration:300, useNativeDriver:true }),
    ]).start();
    // Tell orbital canvas: jump to year + play zoom-out animation (no setTimeout needed)
    orbitalRef.current?.postMessage(JSON.stringify({ type:'startZoomOut', year: finalYear }));
  }, [setStoreYear]);

  // ── Orbital messages ──────────────────────────────────────────────────────
  const [showOrbSettings, setShowOrbSettings] = useState(false);
  const [showOrbInfo,     setShowOrbInfo]     = useState(false);
  const [showYearEditor,  setShowYearEditor]  = useState(false);
  const [editorYear,      setEditorYear]      = useState(2000);

  const onOrbitalMsg = useCallback((e) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'frame') {
        // Use screenRef (not screen state) — the closure captures the ref, always current
        if (screenRef.current === 'orbital') {
          yearRef.current = msg.year;
          setStoreYear(msg.year);
        }
        // When globe is active: orbital frame messages are ignored.
        // The play interval owns yearRef and advances it independently.
      } else if (msg.type === 'showGlobe') {
        // Orbital canvas sends its current year with showGlobe — sync it
        if (msg.year !== undefined) {
          yearRef.current = msg.year;
          setYear(msg.year);
          setStoreYear(msg.year);
        }
        sendPins(yearRef.current, activeCatRef.current, toleranceRef.current, true);
        sendProcesses(yearRef.current, processLayersRef.current, processItemsOnRef.current, true);
        switchToGlobe();
      } else if (msg.type === 'doubleTapYear') {
        setEditorYear(msg.year);
        setShowYearEditor(true);
      }
    } catch (_) {}
  }, [setStoreYear, switchToGlobe, sendPins, sendProcesses]);

  const handleYearEditorConfirm = useCallback((yr) => {
    orbitalRef.current?.postMessage(JSON.stringify({ type:'setYear', year:yr }));
    setStoreYear(yr);
  }, [setStoreYear]);

  // ── Globe messages ────────────────────────────────────────────────────────
  const onGlobeMsg = useCallback((e) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'pinTap') {
        const ev = EVENTS.find(ev => ev.id === msg.id);
        if (ev) openEvent(ev);
      } else if (msg.type === 'routeTap') {
        const route = TRADE_ROUTES.find(r => r.id === msg.id);
        if (route) {
          wasPlayingRef.current = isPlaying;
          setIsPlaying(false);
          globeRef.current?.postMessage(JSON.stringify({ type:'lockRotation' }));
          setRouteCard(route);
        }
      } else if (msg.type === 'migrationTap') {
        const mig = MIGRATIONS.find(m => m.id === msg.id);
        if (mig) {
          wasPlayingRef.current = isPlaying;
          setIsPlaying(false);
          globeRef.current?.postMessage(JSON.stringify({ type:'lockRotation' }));
          setMigrationCard(mig);
        }
      } else if (msg.type === 'languageTap') {
        const lang = LANGUAGES.find(l => l.id === msg.id);
        if (lang) {
          wasPlayingRef.current = isPlaying;
          setIsPlaying(false);
          globeRef.current?.postMessage(JSON.stringify({ type:'lockRotation' }));
          setLanguageCard(lang);
        }
      } else if (msg.type === 'zoomOutExit') {
        // Return to orbital
        globeRef.current?.postMessage(JSON.stringify({ type:'unlockRotation' }));
        if (wasPlayingRef.current) setIsPlaying(false);
        switchToOrbital(Math.round(yearRef.current));
      }
    } catch (_) {}
  }, [openEvent, isPlaying, switchToOrbital]);

  // ── Settings/Info modals ───────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo,     setShowInfo]     = useState(false);

  return (
    <View style={[appSt.root, { backgroundColor: bgColor }]}>
      {/* High contrast overlay — darkens everything slightly when enabled */}
      {contrast && (
        <View pointerEvents="none" style={{
          ...StyleSheet.absoluteFillObject, zIndex:999,
          backgroundColor:'rgba(0,0,0,0.18)',
        }} />
      )}
      <StatusBar barStyle="light-content" hidden />

      {/* ── ORBITAL WebView ──────────────────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: orbitalOpacity }]}
        pointerEvents={screen === 'orbital' ? 'auto' : 'none'}>
        <WebView
          ref={orbitalRef}
          source={{ html: makeOrbitalHTML(SW, SH) }}
          style={StyleSheet.absoluteFill}
          originWhitelist={['*']} scrollEnabled={false} bounces={false}
          overScrollMode="never" backgroundColor="#04040d"
          javaScriptEnabled domStorageEnabled mixedContentMode="always"
          onMessage={onOrbitalMsg}
          onLoad={onOrbitalLoad}
        />
        {/* Orbital UI */}
        <TouchableOpacity style={[appSt.cornerBtn, appSt.topLeft]}
          onPress={() => setShowInfo(true)} activeOpacity={0.7}>
          <Info size={20} color={ICON_DIM} weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity style={[appSt.cornerBtn, appSt.topRight]}
          onPress={() => setShowSettings(true)} activeOpacity={0.7}>
          <Gear size={20} color={ICON_DIM} weight="regular" />
        </TouchableOpacity>
        {showYearEditor && (
          <YearEditorModal currentYear={editorYear}
            onConfirm={handleYearEditorConfirm}
            onClose={() => setShowYearEditor(false)} />
        )}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {showInfo     && <InfoModal     onClose={() => setShowInfo(false)} />}
      </Animated.View>

      {/* ── GLOBE WebView — always mounted, hidden when not active ───────── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: globeOpacity }]}
        pointerEvents={screen === 'globe' ? 'auto' : 'none'}>
        <WebView
          ref={globeRef}
          source={{ html: makeGlobeHTML(SW, SH) }}
          style={StyleSheet.absoluteFill}
          originWhitelist={['*']} scrollEnabled={false} bounces={false}
          overScrollMode="never" backgroundColor="#04040d"
          javaScriptEnabled domStorageEnabled mixedContentMode="always"
          onLoad={onWebViewLoad}
          onMessage={onGlobeMsg}
        />

        {/* Active process strip */}
        {activeItems.length > 0 && (
          <View style={styles.strip} pointerEvents="none">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripRow}>
              {activeItems.map(item => (
                <View key={item.id} style={[styles.pill, { borderColor: item.color + '70' }]}>
                  <View style={[styles.pillDot, { backgroundColor: item.color }]} />
                  <Text style={styles.pillTxt}>{item.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Narrative */}
        {(processLayers.civilizations || processLayers.routes || processLayers.wars ||
          processLayers.migration || processLayers.religion || processLayers.languages) && !!narrative && (
          <View style={styles.narrative} pointerEvents="none">
            <Text style={styles.narrativeTxt}>{narrative}</Text>
          </View>
        )}

        {/* Top bar */}
        <View style={styles.topBar} pointerEvents="box-none">
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(true)} pointerEvents="auto">
            <MagnifyingGlass size={17} color="rgba(255,255,255,0.75)" weight="bold" />
          </TouchableOpacity>
          <YearWheel year={year} isPlaying={isPlaying}
            onYearChange={(y) => {
              yearRef.current = y; setYear(y); setStoreYear(y);
              sendPins(y, activeCatRef.current, toleranceRef.current, false);
              sendProcesses(y, processLayersRef.current, processItemsOnRef.current, false);
            }}
          />
          <TouchableOpacity
            style={[styles.iconBtn, showDrawer && styles.iconBtnActive]}
            onPress={() => setShowDrawer(true)} pointerEvents="auto">
            <List size={20} color={showDrawer ? '#378ADD' : 'rgba(255,255,255,0.75)'} weight="regular" />
          </TouchableOpacity>
        </View>

        {/* Play bar */}
        <PlayBar isPlaying={isPlaying} speed={speed}
          onToggle={() => setIsPlaying(p => !p)}
          onSpeedChange={setSpeed}
          onReset={() => globeRef.current?.postMessage(JSON.stringify({ type:'resetGlobe' }))} />

        {/* Search */}
        {showSearch && (
          <SearchModal onClose={() => setShowSearch(false)}
            onSelect={(ev) => {
              setShowSearch(false);
              const evYear = ev.year;
              yearRef.current = evYear; setYear(evYear); setStoreYear(evYear);
              sendPins(evYear, activeCatRef.current, toleranceRef.current, true);
              sendProcesses(evYear, processLayersRef.current, processItemsOnRef.current, true);
              setTimeout(() => openEvent(ev), 120);
            }}
          />
        )}
        {selectedEvent && <EventCard event={selectedEvent} onClose={closeEvent} activeCategories={activeCategories} />}
        {routeCard && (
          <RouteInfoCard route={routeCard} onClose={() => {
            setRouteCard(null);
            globeRef.current?.postMessage(JSON.stringify({ type:'unlockRotation' }));
            if (wasPlayingRef.current) setIsPlaying(true);
          }} />
        )}
        {migrationCard && (
          <MigrationInfoCard migration={migrationCard} onClose={() => {
            setMigrationCard(null);
            globeRef.current?.postMessage(JSON.stringify({ type:'unlockRotation' }));
            if (wasPlayingRef.current) setIsPlaying(true);
          }} />
        )}
        {languageCard && (
          <LanguageInfoCard language={languageCard} onClose={() => {
            setLanguageCard(null);
            globeRef.current?.postMessage(JSON.stringify({ type:'unlockRotation' }));
            if (wasPlayingRef.current) setIsPlaying(true);
          }} />
        )}
        {showDrawer && (
          <UnifiedDrawer
            activeCategories={activeCategories} onCategoryToggle={toggleCategory}
            processLayers={processLayers} processItemsOn={processItemsOn}
            onProcessToggle={toggleProcess} onProcessItemToggle={toggleProcessItem}
            tolerance={tolerance} onToleranceChange={setTolerance}
            activeCivils={activeCivils} activeRoutes={activeRoutes} activeWars={activeWars}
            divisionLayers={divisionLayers} onDivisionToggle={toggleDivision}
            onClose={() => setShowDrawer(false)}
          />
        )}
      </Animated.View>
    </View>
  );
}

const appSt = StyleSheet.create({
  root:      { flex:1, backgroundColor:'#04040d' },
  cornerBtn: { position:'absolute', width:40, height:40, borderRadius:20, backgroundColor:'rgba(255,255,255,0.13)', borderWidth:0.5, borderColor:'rgba(255,255,255,0.24)', alignItems:'center', justifyContent:'center' },
  topLeft:   { top:56, left:20 },
  topRight:  { top:56, right:20 },
});
// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor:'#04040d' },
  topBar:       { position:'absolute', top:52, left:16, right:16, flexDirection:'row', alignItems:'center', gap:10 },
  iconBtn:      { width:40, height:40, borderRadius:20, backgroundColor:'rgba(255,255,255,0.12)', borderWidth:0.5, borderColor:'rgba(255,255,255,0.22)', alignItems:'center', justifyContent:'center' },
  iconBtnActive:{ backgroundColor:'rgba(55,138,221,0.18)', borderColor:'rgba(55,138,221,0.55)' },
  searchIcon:   { fontSize:16 },
  strip:        { position:'absolute', top:106, left:0, right:0 },
  stripRow:     { paddingHorizontal:16, gap:7, flexDirection:'row' },
  pill:         { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(0,0,0,0.55)', borderRadius:20, borderWidth:0.5, paddingHorizontal:10, paddingVertical:5 },
  pillDot:      { width:5, height:5, borderRadius:2.5 },
  pillTxt:      { color:'rgba(255,255,255,0.82)', fontSize:11, fontWeight:'500' },
  narrative:    { position:'absolute', bottom:150, left:20, right:20, backgroundColor:'rgba(4,4,13,0.82)', borderRadius:14, borderWidth:0.5, borderColor:'rgba(255,255,255,0.10)', padding:14 },
  narrativeTxt: { color:'rgba(255,255,255,0.78)', fontSize:13, lineHeight:20, textAlign:'center' },
});

const ywSt = StyleSheet.create({
  container: { flex:1, flexDirection:'row', alignItems:'center', backgroundColor:'rgba(0,0,0,0.42)', borderRadius:22, borderWidth:0.5, borderColor:'rgba(255,255,255,0.13)', overflow:'hidden', paddingVertical:9, position:'relative' },
  center:    { flex:1, alignItems:'center', flexDirection:'row', justifyContent:'center', gap:6 },
  year:      { color:'#fff', fontSize:14, fontWeight:'600', letterSpacing:-0.3 },
  dot:       { width:7, height:7, borderRadius:3.5, backgroundColor:'#378ADD' },
  ghost:     { position:'absolute', color:'rgba(255,255,255,0.28)', fontSize:12, fontWeight:'400' },
  ghostLeft: { left:12 },
  ghostRight:{ right:12 },
});

const DRAWER_W = SW * 0.82;
const drawerSt = StyleSheet.create({
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.55)' },
  panel:      { position:'absolute', top:0, right:0, bottom:0, width:DRAWER_W, backgroundColor:'#0c0c18', borderLeftWidth:0.5, borderColor:'rgba(255,255,255,0.08)', shadowColor:'#000', shadowOffset:{width:-8,height:0}, shadowOpacity:0.6, shadowRadius:24, elevation:20 },
  header:     { flexDirection:'row', alignItems:'center', paddingTop:60, paddingBottom:18, paddingHorizontal:20, borderBottomWidth:0.5, borderColor:'rgba(255,255,255,0.07)' },
  title:      { flex:1, color:'#fff', fontSize:18, fontWeight:'600', letterSpacing:-0.3 },
  closeBtn:   { width:30, height:30, borderRadius:15, backgroundColor:'rgba(255,255,255,0.07)', alignItems:'center', justifyContent:'center' },
  closeTxt:   { color:'rgba(255,255,255,0.5)', fontSize:13 },
  content:    { paddingBottom:40, paddingTop:4 },
  sectionLabel:{ color:'rgba(255,255,255,0.55)', fontSize:11, fontWeight:'700', letterSpacing:1, textTransform:'uppercase', paddingHorizontal:20, marginTop:20, marginBottom:4 },
  sectionSub: { color:'rgba(255,255,255,0.28)', fontSize:11, lineHeight:16, paddingHorizontal:20, marginBottom:12 },
  divider:    { height:0.5, backgroundColor:'rgba(255,255,255,0.07)', marginTop:8, marginHorizontal:20 },
  section:    { paddingHorizontal:20, marginBottom:4 },
  row:        { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:11, paddingHorizontal:12, borderRadius:14, marginBottom:6, borderWidth:0.5, borderColor:'rgba(255,255,255,0.06)', backgroundColor:'rgba(255,255,255,0.03)' },
  icon:       { width:34, height:34, borderRadius:10, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.06)', borderWidth:0.5, borderColor:'rgba(255,255,255,0.10)' },
  rowLabel:   { flex:1, color:'rgba(255,255,255,0.45)', fontSize:14, fontWeight:'500' },
  toggle:     { width:36, height:20, borderRadius:10, backgroundColor:'rgba(255,255,255,0.10)', justifyContent:'center', paddingHorizontal:2 },
  thumb:      { width:16, height:16, borderRadius:8, backgroundColor:'rgba(255,255,255,0.35)', alignSelf:'flex-start' },
  thumbOn:    { alignSelf:'flex-end', backgroundColor:'#fff' },
  chevron:    { color:'rgba(255,255,255,0.4)', fontSize:18, marginRight:4 },
  dropdown:   { marginTop:2, marginLeft:16, marginBottom:6, borderLeftWidth:0.5, borderColor:'rgba(255,255,255,0.12)', paddingLeft:12 },
  dropItem:   { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:9, paddingHorizontal:8, borderRadius:10, marginBottom:2 },
  dropDot:    { width:7, height:7, borderRadius:3.5 },
  dropLabel:  { flex:1, color:'rgba(255,255,255,0.42)', fontSize:13, fontWeight:'500' },
  stepsRow:   { flexDirection:'row', flexWrap:'wrap', gap:8, paddingHorizontal:20, marginBottom:16, marginTop:4 },
  chip:       { paddingHorizontal:14, paddingVertical:8, borderRadius:20, borderWidth:0.5, borderColor:'rgba(255,255,255,0.12)', backgroundColor:'rgba(255,255,255,0.04)' },
  chipActive: { backgroundColor:'rgba(55,138,221,0.22)', borderColor:'rgba(55,138,221,0.60)' },
  chipTxt:    { color:'rgba(255,255,255,0.40)', fontSize:13, fontWeight:'500' },
  chipTxtActive:{ color:'#fff' },
});

const playSt = StyleSheet.create({
  bar:          { position:'absolute', bottom:0, left:0, right:0, flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'rgba(4,4,13,0.90)', borderTopWidth:0.5, borderColor:'rgba(255,255,255,0.08)', paddingBottom:38, paddingTop:14, paddingHorizontal:20 },
  playBtn:      { width:50, height:50, borderRadius:25, backgroundColor:'rgba(55,138,221,0.22)', borderWidth:0.5, borderColor:'rgba(55,138,221,0.55)', alignItems:'center', justifyContent:'center' },
  resetBtn:     { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.08)', borderWidth:0.5, borderColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center', marginLeft:8 },
  playIcon:     { color:'#fff', fontSize:20 },
  sliderWrap:   { flex:1 },
  speedLabel:   { color:'#fff', fontSize:13, fontWeight:'600', textAlign:'center', marginBottom:2 },
  sliderLabels: { flexDirection:'row', justifyContent:'space-between', marginTop:4 },
  sliderLabelTxt:{ color:'rgba(255,255,255,0.28)', fontSize:10 },
  track:        { width:'100%', height:28, justifyContent:'center', position:'relative', paddingVertical:8 },
  trackBg:      { position:'absolute', left:0, top:11, right:0, height:6, backgroundColor:'rgba(255,255,255,0.12)', borderRadius:3 },
  trackFill:    { position:'absolute', left:0, top:11, height:6, backgroundColor:'#378ADD', borderRadius:3 },
  thumb:        { position:'absolute', top:5, width:18, height:18, borderRadius:9, backgroundColor:'#fff', shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.3, shadowRadius:2 },
});

const cardStyles = StyleSheet.create({
  backdrop:    { ...StyleSheet.absoluteFillObject, justifyContent:'flex-end' },
  card:        { backgroundColor:'#0d0d1a', borderTopLeftRadius:24, borderTopRightRadius:24, borderWidth:0.5, borderColor:'rgba(255,255,255,0.08)', paddingBottom:44, maxHeight:SH*0.70, overflow:'hidden' },
  accentBar:   { height:3, borderTopLeftRadius:24, borderTopRightRadius:24 },
  header:      { flexDirection:'row', alignItems:'flex-start', paddingHorizontal:20, paddingTop:18, paddingBottom:12 },
  yearLbl:     { color:'rgba(255,255,255,0.50)', fontSize:12, letterSpacing:1.5, textTransform:'uppercase', marginBottom:6, fontWeight:'600' },
  titleLbl:    { color:'#fff', fontSize:24, fontWeight:'700', letterSpacing:-0.5, lineHeight:30 },
  closeBtn:    { width:32, height:32, borderRadius:16, backgroundColor:'rgba(255,255,255,0.10)', borderWidth:0.5, borderColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center', marginLeft:12, marginTop:2 },
  closeTxt:    { color:'rgba(255,255,255,0.70)', fontSize:13, fontWeight:'600' },
  body:        { paddingHorizontal:20, maxHeight:SH*0.42 },
  tag:         { flexDirection:'row', alignItems:'center', gap:6, marginTop:6, marginHorizontal:20, paddingHorizontal:12, paddingVertical:7, borderRadius:20, borderWidth:1, alignSelf:'flex-start', marginBottom:6 },
  tagTxt:      { fontSize:11, fontWeight:'700', letterSpacing:0.8 },
  loadingRow:  { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:14 },
  loadingTxt:  { color:'rgba(255,255,255,0.45)', fontSize:13 },
  summaryTxt:  { color:'rgba(255,255,255,0.82)', fontSize:14, lineHeight:23, paddingBottom:16, paddingTop:8 },
  noSummary:   { color:'rgba(255,255,255,0.35)', fontSize:13, fontStyle:'italic', paddingVertical:14 },
  relSection:  { marginTop:12, marginBottom:4 },
  relTitle:    { color:'rgba(255,255,255,0.38)', fontSize:10, fontWeight:'700', letterSpacing:1.2, textTransform:'uppercase', marginBottom:10 },
  relRow:      { gap:8, paddingRight:20 },
  relChip:     { width:140, padding:11, borderRadius:14, backgroundColor:'rgba(255,255,255,0.04)', borderWidth:0.5 },
  relChipTitle:{ color:'rgba(255,255,255,0.82)', fontSize:13, fontWeight:'600', marginBottom:3 },
  relChipDesc: { color:'rgba(255,255,255,0.38)', fontSize:11, lineHeight:15 },
  wikiBtn:     { flexDirection:'row', alignItems:'center', gap:8, marginTop:12, paddingVertical:12, paddingHorizontal:14, borderRadius:14, borderWidth:0.5, backgroundColor:'rgba(255,255,255,0.03)' },
  wikiBtnIcon: { fontSize:15 },
  wikiBtnTxt:  { flex:1, fontSize:13, fontWeight:'600' },
  wikiBtnArrow:{ color:'rgba(255,255,255,0.35)', fontSize:14 },

  // Context sections: causas/consecuencias + al mismo tiempo
  contextSection: {
    marginTop:18, paddingTop:16,
    borderTopWidth:0.5, borderColor:'rgba(255,255,255,0.07)',
  },
  contextTitle: {
    color:'rgba(255,255,255,0.85)', fontSize:13, fontWeight:'700',
    letterSpacing:0.4, marginBottom:12,
  },
  contextBlock: {
    backgroundColor:'rgba(255,255,255,0.06)', borderRadius:12,
    padding:14, borderWidth:0.5, borderColor:'rgba(255,255,255,0.12)',
  },
  contextLabel: {
    color:'rgba(255,255,255,0.50)', fontSize:10, fontWeight:'700',
    letterSpacing:1.4, textTransform:'uppercase', marginBottom:7,
  },
  contextText: {
    color:'rgba(255,255,255,0.82)', fontSize:13, lineHeight:21,
  },
  contemporaryChip: {
    width:160, padding:12, borderRadius:14,
    backgroundColor:'rgba(255,255,255,0.04)',
    borderWidth:0.5,
  },
  contemporaryPlace: {
    color:'rgba(255,255,255,0.38)', fontSize:10, fontWeight:'700',
    letterSpacing:0.8, textTransform:'uppercase', marginBottom:4,
  },
  contemporaryTitle: {
    color:'rgba(255,255,255,0.85)', fontSize:13, fontWeight:'600',
    lineHeight:18, marginBottom:5,
  },
  contemporaryDesc: {
    color:'rgba(255,255,255,0.45)', fontSize:11, lineHeight:16,
  },
});

const searchSt = StyleSheet.create({
  overlay:     { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(4,4,13,0.88)', justifyContent:'flex-start', paddingTop:60 },
  modal:       { marginHorizontal:16, backgroundColor:'#0c0c18', borderRadius:20, borderWidth:0.5, borderColor:'rgba(255,255,255,0.10)', overflow:'hidden', maxHeight:SH*0.75 },
  inputRow:    { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:14, borderBottomWidth:0.5, borderColor:'rgba(255,255,255,0.08)', gap:10 },
  searchIcon:  { fontSize:15 },
  input:       { flex:1, color:'#fff', fontSize:15, padding:0 },
  clear:       { color:'rgba(255,255,255,0.35)', fontSize:16, paddingHorizontal:4 },
  results:     { maxHeight:SH*0.60 },
  result:      { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingVertical:13, borderBottomWidth:0.5, borderColor:'rgba(255,255,255,0.05)' },
  resultLabel: { color:'rgba(255,255,255,0.85)', fontSize:14, fontWeight:'500', flex:1 },
  resultYear:  { color:'rgba(255,255,255,0.38)', fontSize:12, marginTop:2 },
  resultDot:   { width:8, height:8, borderRadius:4 },
  noResults:   { color:'rgba(255,255,255,0.30)', fontSize:13, textAlign:'center', padding:28 },
});
