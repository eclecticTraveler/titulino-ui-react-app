// import grammarClassesData from '../assets/data/grammar-class-data.json';
import CentralCourseThemeService from 'services/CentralCourseThemeService';
import GoogleService from './GoogleService';

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
  nativeLanguage,
  course,
  userProficiencyOrder
) => {
  const rawClassData = await loadGrammarClassData();

  const courseLevelMatch = rawClassData?.find(c =>
    c.level === CentralCourseThemeService.getThemeMappedLevelNo(levelNo) &&
    c.course === course &&
    c.nativeLanguage === nativeLanguage
  );

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
  nativeLanguage,
  course
) => {
  const rawClassData = await loadGrammarClassData();

  const courseLevelMatch = rawClassData?.find(c =>
    c.level === CentralCourseThemeService.getThemeMappedLevelNo(levelNo) &&
    c.course === course &&
    c.nativeLanguage === nativeLanguage
  );

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
  nativeLanguage,
  course,
  userProficiencyOrder
) => {
  const url = await loadRequestedGrammarUrl(levelNo, chapterNo, nativeLanguage, course, userProficiencyOrder);
  return url ?? "";
};

export const getGrammarClassUrlsByChapter = async (
  levelNo,
  chapterNo,
  nativeLanguage,
  course
) => {
  const url = await getRequestedGrammarUrlsByChapter(levelNo, chapterNo, nativeLanguage, course);
  return url ?? "";
};

const GrammarClassService = {
  getGrammarClassUrl,
  getGrammarClassUrlsByChapter,
  getGrammarCategory
};

export default GrammarClassService;
