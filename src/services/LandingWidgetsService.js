import fiveMinuteSnippetData from '../assets/data/five-minute-lesson-data.json';
import startRandomFullLessonData from '../assets/data/five-minute-lesson-data.json';

const loadFiveMinuteClassData = async() => {
  const rawData = fiveMinuteSnippetData;
  return rawData;
}
const loadStartRandomFullLessonData = async() => {
  const rawData = startRandomFullLessonData;
  return rawData;
}

const loadFiveMinuteRandomLessonModule = async(levelNo, nativeLanguage, course) => {  
  const allModules = await loadFiveMinuteClassData();
  const specificModuleByCriteria = allModules?.find(c => (c.level === parseInt(levelNo, 10) && c.course === course && c.nativeLanguage === nativeLanguage));
  const randomRequestedModule = specificModuleByCriteria?.lessons[Math.floor(Math.random()*specificModuleByCriteria?.lessons?.length)];
  return randomRequestedModule;
}

const loadRandomFullLessonModule = async(levelNo, nativeLanguage, course) => {  
  const allModules = await loadStartRandomFullLessonData();
  const specificModuleByCriteria = allModules?.find(c => (c.level === parseInt(levelNo, 10) && c.course === course && c.nativeLanguage === nativeLanguage));
  const randomRequestedModule = specificModuleByCriteria?.lessons[Math.floor(Math.random()*specificModuleByCriteria?.lessons?.length)];
  return randomRequestedModule;
}

export const getFiveMinuteRandomLesson = async(levelNo, nativeLanguage, course) => {
  return await loadFiveMinuteRandomLessonModule(levelNo, nativeLanguage, course);
}

export const getRandomFullLesson = async(levelNo, nativeLanguage, course) => {
  return await loadRandomFullLessonModule(levelNo, nativeLanguage, course);
}

const LandingWidgetsService = {
  getFiveMinuteRandomLesson,
  getRandomFullLesson
};

export default LandingWidgetsService;
