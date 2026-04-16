import chapterBookData from '../assets/data/chapter-book-data.json';
import pdfData from '../assets/data/pdf-data.json';
import speakingData from '../assets/data/speaking-practice-data.json';

const MAX_VOCAB_WORDS = 20;

// Multilingual translations for chapter titles.
// Keyed by English concept; all language variants are indexed so
// a search in any language matches the same chapter.
// To add a new language, add a key (e.g. 'fr') to each entry.
const TITLE_TRANSLATIONS = {
  'vegetables':    { en: 'vegetables',    es: 'verduras',      pt: 'vegetais' },
  'fruits':        { en: 'fruits',        es: 'frutas',        pt: 'frutas' },
  'meat':          { en: 'meat',          es: 'carne',         pt: 'carne' },
  'poultry':       { en: 'poultry',       es: 'aves',          pt: 'aves' },
  'seafood':       { en: 'seafood',       es: 'mariscos',      pt: 'frutos do mar' },
  'containers':    { en: 'containers',    es: 'envases',       pt: 'recipientes' },
  'supermarket':   { en: 'supermarket',   es: 'supermercado',  pt: 'supermercado' },
  'house':         { en: 'house',         es: 'casa',          pt: 'casa' },
  'living room':   { en: 'living room',   es: 'sala',          pt: 'sala de estar' },
  'dining room':   { en: 'dining room',   es: 'comedor',       pt: 'sala de jantar' },
  'kitchen':       { en: 'kitchen',       es: 'cocina',        pt: 'cozinha' },
  'cooking':       { en: 'cooking',       es: 'cocinar',       pt: 'cozinhar' },
  'construction':  { en: 'construction',  es: 'construcción',  pt: 'construção' },
  'office':        { en: 'office',        es: 'oficina',       pt: 'escritório' },
  'school':        { en: 'school',        es: 'escuela',       pt: 'escola' },
  'farming':       { en: 'farming',       es: 'agricultura',   pt: 'agricultura' },
  'hotel':         { en: 'hotel',         es: 'hotel',         pt: 'hotel' },
  'warehouse':     { en: 'warehouse',     es: 'almacén',       pt: 'armazém' },
  'restaurant':    { en: 'restaurant',    es: 'restaurante',   pt: 'restaurante' },
  'hospital':      { en: 'hospital',      es: 'hospital',      pt: 'hospital' },
  'pharmacy':      { en: 'pharmacy',      es: 'farmacia',      pt: 'farmácia' },
  'corporate':     { en: 'corporate',     es: 'corporativo',   pt: 'corporativo' },
  'merchandise':   { en: 'merchandise',   es: 'mercancía',     pt: 'mercadoria' },
  'road work':     { en: 'road work',     es: 'trabajo vial',  pt: 'obra viária' },
  'plumbing':      { en: 'plumbing',      es: 'plomería',      pt: 'encanamento' },
  'logistics':     { en: 'logistics',     es: 'logística',     pt: 'logística' },
  'money':         { en: 'money',         es: 'dinero',        pt: 'dinheiro' },
  'presentation':  { en: 'presentation',  es: 'presentación',  pt: 'apresentação' },
  'extra':         { en: 'extra',         es: 'extra',         pt: 'extra' },
  'test':          { en: 'test',          es: 'examen',        pt: 'exame' },
  'review':        { en: 'review',        es: 'repaso',        pt: 'revisão' },
  'donate':        { en: 'donate',        es: 'donar',         pt: 'doar' },
};

let _index = null;

function buildIndex() {
  const index = {};

  const addToIndex = (theme, chapter, keywords) => {
    const key = `${theme}_${chapter}`;
    if (!index[key]) index[key] = new Set();
    for (const kw of keywords) {
      if (kw != null && String(kw).trim()) {
        index[key].add(String(kw).trim().toLowerCase());
      }
    }
  };

  // 1. Chapter titles from chapter-book-data.json
  const books = chapterBookData?.books || chapterBookData || [];
  for (const book of books) {
    const theme = book.theme;
    if (!theme) continue;
    for (const ch of (book.chapters || [])) {
      const title = ch.title || '';
      const words = title.split(/[\s,&-]+/).filter(Boolean);
      addToIndex(theme, ch.chapter, [title, ...words]);
      // Add all language variants for matching concepts
      const titleLower = title.toLowerCase();
      for (const [concept, translations] of Object.entries(TITLE_TRANSLATIONS)) {
        if (titleLower.includes(concept)) {
          addToIndex(theme, ch.chapter, Object.values(translations));
        }
      }
    }
  }

  // 2. PDF titles from pdf-data.json
  const pdfs = pdfData?.pdfs || pdfData || [];
  for (const pdf of pdfs) {
    const theme = pdf.theme;
    if (!theme) continue;
    for (const ch of (pdf.chapters || [])) {
      const title = ch.title || '';
      // Split on common separators: "Work & Jobs - restaurant" → ["Work", "Jobs", "restaurant"]
      const words = title.split(/[\s,&\-–]+/).filter(Boolean);
      addToIndex(theme, ch.chapter, [title, ...words]);
    }
  }

  // 3. Vocabulary words from speaking-practice-data.json (capped at MAX_VOCAB_WORDS per chapter)
  const speakingSets = speakingData?.speaking || speakingData || [];
  for (const set of speakingSets) {
    const theme = set.theme;
    if (!theme) continue;
    for (const ch of (set.chapters || [])) {
      const chapterWords = (ch.words || []).slice(0, MAX_VOCAB_WORDS);
      const vocabKeywords = [];
      for (const w of chapterWords) {
        if (w.word) vocabKeywords.push(w.word);
        if (w.image) vocabKeywords.push(w.image);
      }
      if (ch.title) {
        vocabKeywords.push(ch.title);
        const titleWords = ch.title.split(/[\s,&\-–:]+/).filter(Boolean);
        vocabKeywords.push(...titleWords);
      }
      addToIndex(theme, ch.chapter, vocabKeywords);
    }
  }

  // 4. Add theme-level keywords (searchable by theme name regardless of chapter)
  const themeAliases = {
    'supermarket': ['supermarket', 'supermercado', 'market', 'grocery', 'food', 'comida', 'mercado', 'compras'],
    'household': ['household', 'hogar', 'house', 'casa', 'home', 'cleaning', 'limpieza', 'lar', 'limpeza'],
    'work-n-jobs': ['work', 'jobs', 'trabajo', 'empleos', 'career', 'carrera', 'profession', 'profesión', 'trabalho', 'empregos', 'profissão'],
  };

  for (const [theme, aliases] of Object.entries(themeAliases)) {
    // Add theme aliases to every chapter in that theme
    for (const key of Object.keys(index)) {
      if (key.startsWith(`${theme}_`)) {
        for (const alias of aliases) {
          index[key].add(alias);
        }
      }
    }
  }

  return index;
}

function getIndex() {
  if (!_index) {
    _index = buildIndex();
  }
  return _index;
}

/**
 * Returns an array of keyword strings for a given theme + chapter.
 * @param {string} theme - e.g. "supermarket", "household", "work-n-jobs"
 * @param {number|string} chapterNo - e.g. 1, 2, "1", "2"
 * @returns {string[]} deduplicated, lowercased keyword array
 */
export const getKeywordsForChapter = (theme, chapterNo) => {
  const index = getIndex();
  const key = `${theme}_${chapterNo}`;
  const set = index[key];
  return set ? Array.from(set) : [];
};

const SearchIndexService = {
  getKeywordsForChapter,
};

export default SearchIndexService;
