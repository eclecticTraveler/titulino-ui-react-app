import speakingChapterData from '../assets/data/speaking-practice-data.json';
import GoogleService from './GoogleService';

const loadSpeakingData = async() => {
  const rawData = speakingChapterData;
  // const bookData = await GoogleService.getChapterBookData("loadRequestedBookChapterUrl");
  return rawData;
}

const loadRequestedSpeakingModule = async(rawSpeakingData, levelTheme, course, nativeLanguage) => {
  return await rawSpeakingData?.speaking?.find(c => (c.theme === levelTheme && c.course === course && c.nativeLanguage === nativeLanguage));
}

const loadRequestedSpeakingChapterUrl = async(levelTheme, chapterNo, nativeLanguage, course) => {  
  const rawSpeakingData = await loadSpeakingData();
  const filteredSpeakingData = await loadRequestedSpeakingModule(rawSpeakingData, levelTheme, course, nativeLanguage);
  const speakingChapter = filteredSpeakingData?.chapters.find(ch => ch.chapter === parseInt(chapterNo, 10)) || filteredSpeakingData?.chapters[filteredSpeakingData?.chapters.length - 1];
  return speakingChapter ?? null;;
}

export const getSpeakingChapterModule = async(levelTheme, chapterNo, nativeLanguage, course) => {
    const module = await loadRequestedSpeakingChapterUrl(levelTheme, chapterNo, nativeLanguage, course);
    return module ?? null;
}

const SpeakingPracticeService = {
  getSpeakingChapterModule
};

export default SpeakingPracticeService;
