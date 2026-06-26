/**
 * BlueDot — eventCard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Helper de runtime para las fichas de eventos.
 * Cero costo — solo Wikipedia API (gratis) + cálculos locales.
 *
 * Uso:
 *   import { fetchEventCardData, getMientras } from './eventCard';
 *
 *   const { summary, causas, consecuencias } = await fetchEventCardData(event, lang);
 *   const mientras = getMientras(event, allEvents, lang);
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Config ───────────────────────────────────────────────────────────────────

/** Años de ventana para "mientras tanto" */
const MIENTRAS_WINDOW = 30;

/** Máximo de eventos en "mientras tanto" */
const MIENTRAS_MAX = 4;

/** Importance mínima para aparecer en "mientras tanto" */
const MIENTRAS_MIN_IMPORTANCE = 3;

/** Secciones de Wikipedia que consideramos "causas" */
const CAUSAS_SECTIONS = [
  // español
  'antecedentes', 'causas', 'origen', 'orígenes', 'contexto', 'preludio',
  'background', 'precursors', 'prelude',
  // inglés
  'causes', 'origins', 'context', 'background',
  // francés
  'causes', 'origines', 'contexte', 'antécédents',
  // portugués
  'antecedentes', 'causas', 'contexto',
];

/** Secciones de Wikipedia que consideramos "consecuencias" */
const CONSECUENCIAS_SECTIONS = [
  // español
  'consecuencias', 'resultado', 'resultados', 'aftermath', 'legado',
  'impacto', 'secuelas', 'desenlace', 'efectos',
  // inglés
  'aftermath', 'consequences', 'results', 'legacy', 'impact', 'outcome',
  // francés
  'conséquences', 'résultats', 'bilan', 'legs', 'impact',
  // portugués
  'consequências', 'resultado', 'legado',
];

// ─── Wikipedia API ────────────────────────────────────────────────────────────

/**
 * Idioma → subdomain de Wikipedia
 * Añade más entradas cuando soportes más idiomas
 */
const WIKI_LANG_MAP = {
  es: 'es',
  en: 'en',
  fr: 'fr',
  pt: 'pt',
  de: 'de',
  it: 'it',
  zh: 'zh',
  ar: 'ar',
  ja: 'ja',
};

function wikiSubdomain(lang) {
  return WIKI_LANG_MAP[lang] || 'en';
}

/** Fetch summary de Wikipedia (resumen narrativo) */
async function fetchWikiSummary(wikiTitle, lang) {
  if (!wikiTitle) return null;
  const sub = wikiSubdomain(lang);
  const encoded = encodeURIComponent(wikiTitle.replace(/ /g, '_'));
  try {
    const res = await fetch(
      `https://${sub}.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { 'User-Agent': 'BlueDot/1.0 (educational app)' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      extract: data.extract || null,
      url: data.content_urls?.mobile?.page || null,
    };
  } catch (_) {
    return null;
  }
}

/**
 * Fetch secciones de Wikipedia → causas y consecuencias
 * La API /page/sections devuelve el artículo completo dividido por secciones.
 */
async function fetchWikiSections(wikiTitle, lang) {
  if (!wikiTitle) return { causas: null, consecuencias: null };
  const sub = wikiSubdomain(lang);
  const encoded = encodeURIComponent(wikiTitle.replace(/ /g, '_'));

  try {
    const res = await fetch(
      `https://${sub}.wikipedia.org/api/rest_v1/page/mobile-sections/${encoded}`,
      { headers: { 'User-Agent': 'BlueDot/1.0 (educational app)' } }
    );
    if (!res.ok) return { causas: null, consecuencias: null };
    const data = await res.json();

    const sections = data.remaining?.sections || [];
    let causas = null;
    let consecuencias = null;

    for (const section of sections) {
      const title = (section.line || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quitar acentos para comparar

      // Extraer texto plano del HTML de la sección (strip tags básico)
      const text = stripHtml(section.text || '');
      if (!text || text.length < 50) continue; // sección vacía

      if (!causas && CAUSAS_SECTIONS.some(k => title.includes(k))) {
        causas = text.slice(0, 500).trim(); // máx 500 chars
      }
      if (!consecuencias && CONSECUENCIAS_SECTIONS.some(k => title.includes(k))) {
        consecuencias = text.slice(0, 500).trim();
      }
      if (causas && consecuencias) break;
    }

    return { causas, consecuencias };
  } catch (_) {
    return { causas: null, consecuencias: null };
  }
}

/** Strip básico de HTML → texto plano */
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')       // quitar tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')        // colapsar espacios
    .trim();
}

// ─── API pública principal ────────────────────────────────────────────────────

/**
 * fetchEventCardData(event, lang)
 * ─────────────────────────────────────────────────────────────────────────────
 * Devuelve toda la info para la ficha de un evento.
 * Hace 2 requests en paralelo a Wikipedia (summary + sections).
 *
 * @param {object} event  - Evento del JSON local (nuevo formato multilenguaje)
 * @param {string} lang   - 'es' | 'en' | 'fr' | ...
 * @returns {Promise<EventCardData>}
 */
export async function fetchEventCardData(event, lang = 'es') {
  // Determinar wikiTitle según idioma, con fallbacks
  const wikiTitle = getWikiTitle(event, lang);

  // Fetch en paralelo — si uno falla no bloquea al otro
  const [summaryResult, sectionsResult] = await Promise.allSettled([
    fetchWikiSummary(wikiTitle, lang),
    fetchWikiSections(wikiTitle, lang),
  ]);

  const summary  = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
  const sections = sectionsResult.status === 'fulfilled' ? sectionsResult.value : { causas: null, consecuencias: null };

  return {
    // Info básica del JSON local (instantánea)
    label:    getLabel(event, lang),
    year:     event.year,
    lat:      event.lat,
    lon:      event.lon,
    category: event.category,
    importance: event.importance,

    // Wikipedia (runtime, gratis)
    summary:       summary?.extract || null,
    wikiUrl:       summary?.url || null,
    causas:        sections.causas,
    consecuencias: sections.consecuencias,

    // "Mientras tanto" se calcula aparte con getMientras()
    // porque necesita acceso al array completo de eventos
  };
}

/**
 * getMientras(event, allEvents, lang)
 * ─────────────────────────────────────────────────────────────────────────────
 * Calcula eventos contemporáneos para "mientras tanto".
 * 100% local, cero APIs, instantáneo.
 *
 * @param {object}   event      - Evento actual
 * @param {object[]} allEvents  - Array completo del dataset local
 * @param {string}   lang       - Idioma para los labels
 * @returns {MientrasTanto[]}
 */
export function getMientras(event, allEvents, lang = 'es') {
  return allEvents
    .filter(ev =>
      ev.id !== event.id &&
      Math.abs(ev.year - event.year) <= MIENTRAS_WINDOW &&
      ev.importance >= MIENTRAS_MIN_IMPORTANCE
    )
    .sort((a, b) => {
      // Ordenar por: importancia DESC, luego cercanía temporal ASC
      if (b.importance !== a.importance) return b.importance - a.importance;
      return Math.abs(a.year - event.year) - Math.abs(b.year - event.year);
    })
    .slice(0, MIENTRAS_MAX)
    .map(ev => ({
      id:       ev.id,
      label:    getLabel(ev, lang),
      year:     ev.year,
      lat:      ev.lat,
      lon:      ev.lon,
      category: ev.category,
      // yearDelta: para mostrar "15 años antes" / "8 años después"
      yearDelta: ev.year - event.year,
    }));
}

// ─── Helpers multilenguaje ────────────────────────────────────────────────────

/**
 * Obtiene el label del evento en el idioma solicitado.
 * Fallback: otro idioma disponible → id del evento.
 */
export function getLabel(event, lang = 'es') {
  // Nuevo formato multilenguaje
  if (event.labels && typeof event.labels === 'object') {
    return event.labels[lang] || event.labels.es || event.labels.en || event.id;
  }
  // Formato legacy (eventos core con campo 'label')
  return event.label || event.id;
}

/**
 * Obtiene el wikiTitle correcto para el idioma.
 * Fallback: otro idioma → null (no busca Wikipedia)
 */
export function getWikiTitle(event, lang = 'es') {
  // Nuevo formato
  if (event.wikiTitles && typeof event.wikiTitles === 'object') {
    return event.wikiTitles[lang] || event.wikiTitles.es || event.wikiTitles.en || null;
  }
  // Formato legacy
  return event.wikiTitle || null;
}

// ─── Tipos (para referencia, no TypeScript) ───────────────────────────────────
/*
EventCardData {
  label:         string
  year:          number
  lat:           number
  lon:           number
  category:      'personas'|'politica'|'batallas'|'inventos'|'cultura'
  importance:    number (1-5)
  summary:       string | null
  wikiUrl:       string | null
  causas:        string | null
  consecuencias: string | null
}

MientrasTanto {
  id:        string
  label:     string
  year:      number
  lat:       number
  lon:       number
  category:  string
  yearDelta: number  (negativo = antes, positivo = después)
}
*/
