// import grammarClassesData from '../assets/data/grammar-class-data.json';
import CentralCourseThemeService from 'services/CentralCourseThemeService';
import GoogleService from './GoogleService';

// Map 2-letter ISO 639-1 to legacy 3-letter codes used in old bucket data
const toLegacyCourseCode = (code) => ({ en: 'eng', es: 'spa', pt: 'por' }[code] || code);

const loadGrammarClassData = async () => {
  const rawData = await GoogleService.getGrammarClassData("loadGrammarClassData");
  return rawData;
};

const getGrammarCategory = async (proficiencyOrderId) => {
  if (proficiencyOrderId === null || proficiencyOrderId === undefined) return 'basic';
  return proficiencyOrderId <= 1 ? 'basic' : 'advanced';
};

const loadRequestedGrammarUrl = async (
  levelNo,
  chapterNo,
  baseLanguageCode,
  contentLanguageCode,
  userProficiencyOrder
) => {
  const rawClassData = await loadGrammarClassData();

  // Adapter: support both old remote format (nativeLanguage/course) and new format (baseLanguages/contentLanguageCode)
  const courseLevelMatch = rawClassData?.find(c => {
    const langMatch = c.baseLanguages ? c.baseLanguages.includes(baseLanguageCode) : c.nativeLanguage === baseLanguageCode;
    const courseMatch = c.contentLanguageCode ? c.contentLanguageCode === contentLanguageCode : c.course === toLegacyCourseCode(contentLanguageCode);
    return c.level === CentralCourseThemeService.getThemeMappedLevelNo(levelNo) && courseMatch && langMatch;
  });

  if (!courseLevelMatch || !courseLevelMatch.chapters?.length) {
    return "";
  }

  const chapters = courseLevelMatch.chapters;
  const chapter = chapters.find(ch => ch.chapter === parseInt(chapterNo, 10));

  const category = getGrammarCategory(userProficiencyOrder);

  const selectedChapter = chapter ?? chapters[chapters.length - 1]; // fallback to last chapter
  return selectedChapter[category] ?? selectedChapter.basic ?? "";
};

const getRequestedGrammarUrlsByChapter = async (
  levelNo,
  chapterNo,
  baseLanguageCode,
  contentLanguageCode
) => {
  const rawClassData = await loadGrammarClassData();

  // Adapter: support both old remote format (nativeLanguage/course) and new format (baseLanguages/contentLanguageCode)
  const courseLevelMatch = rawClassData?.find(c => {
    const langMatch = c.baseLanguages ? c.baseLanguages.includes(baseLanguageCode) : c.nativeLanguage === baseLanguageCode;
    const courseMatch = c.contentLanguageCode ? c.contentLanguageCode === contentLanguageCode : c.course === toLegacyCourseCode(contentLanguageCode);
    return c.level === CentralCourseThemeService.getThemeMappedLevelNo(levelNo) && courseMatch && langMatch;
  });

  if (!courseLevelMatch || !courseLevelMatch.chapters?.length) {
    return "";
  }

  const chapters = courseLevelMatch.chapters;
  const chapter = chapters.find(ch => ch.chapter === parseInt(chapterNo, 10));

  const selectedChapter = chapter ?? chapters[chapters.length - 1]; // fallback to last chapter
  return selectedChapter;
};

export const getGrammarClassUrl = async (
  levelNo,
  chapterNo,
  baseLanguageCode,
  contentLanguageCode,
  userProficiencyOrder
) => {
  const url = await loadRequestedGrammarUrl(levelNo, chapterNo, baseLanguageCode, contentLanguageCode, userProficiencyOrder);
  return url ?? "";
};

export const getGrammarClassUrlsByChapter = async (
  levelNo,
  chapterNo,
  baseLanguageCode,
  contentLanguageCode
) => {
  const url = await getRequestedGrammarUrlsByChapter(levelNo, chapterNo, baseLanguageCode, contentLanguageCode);
  return url ?? "";
};

const GrammarClassService = {
  getGrammarClassUrl,
  getGrammarClassUrlsByChapter,
  getGrammarCategory
};

export default GrammarClassService;
