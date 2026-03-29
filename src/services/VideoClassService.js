// import videoClassesData from '../assets/data/chapter-class-data.json';
import CentralCourseThemeService from 'services/CentralCourseThemeService';
import GoogleService from './GoogleService';

// Map 2-letter ISO 639-1 to legacy 3-letter codes used in old bucket data
const toLegacyCourseCode = (code) => ({ en: 'eng', es: 'spa', pt: 'por' }[code] || code);

const loadVideoClassData = async() => {
  // const rawData = videoClassesData;
  const rawData = await GoogleService.getVideoClassData("loadVideoClassData");    
  return rawData;
}



const loadRequestedClassUrl = async(levelNo, chapterNo, baseLanguageCode, contentLanguageCode) => {  
  const rawClassData = await loadVideoClassData();
  // Adapter: support both old remote format (nativeLanguage/course) and new format (baseLanguages/contentLanguageCode)
  const rawCourseData = rawClassData?.find(c => {
    const langMatch = c.baseLanguages ? c.baseLanguages.includes(baseLanguageCode) : c.nativeLanguage === baseLanguageCode;
    const courseMatch = c.contentLanguageCode ? c.contentLanguageCode === contentLanguageCode : c.course === toLegacyCourseCode(contentLanguageCode);
    return c.level === CentralCourseThemeService.getThemeMappedLevelNo(levelNo) && courseMatch && langMatch;
  });
  const rawRequestedModule = rawCourseData?.chapters.find(ch => ch.chapter === parseInt(chapterNo, 10));
  return rawRequestedModule?.url;
}

export const getVideoClassUrl = async(levelNo, chapterNo, baseLanguageCode, contentLanguageCode) => {
    const url = await loadRequestedClassUrl(levelNo, chapterNo, baseLanguageCode, contentLanguageCode);
    return url ?? "";
}

const VideoClassService = {
  getVideoClassUrl
};

export default VideoClassService;
