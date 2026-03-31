import speakingChapterData from '../assets/data/speaking-practice-data.json';
// import GoogleService from './GoogleService';

const loadSpeakingData = async() => {
  const rawData = speakingChapterData;
  // const bookData = await GoogleService.getChapterBookData("loadRequestedBookChapterUrl");
  return rawData;
}

const loadRequestedSpeakingModule = async(rawSpeakingData, levelTheme, contentLanguageCode, baseLanguageCode) => {
  return await rawSpeakingData?.speaking?.find(c => (c.theme === levelTheme && c.contentLanguageCode === contentLanguageCode && c.baseLanguages?.includes(baseLanguageCode)));
}

const loadRequestedSpeakingChapterUrl = async(levelTheme, chapterNo, baseLanguageCode, contentLanguageCode) => {  
  const rawSpeakingData = await loadSpeakingData();
  const filteredSpeakingData = await loadRequestedSpeakingModule(rawSpeakingData, levelTheme, contentLanguageCode, baseLanguageCode);
  const speakingChapter = filteredSpeakingData?.chapters.find(ch => ch.chapter === parseInt(chapterNo, 10)) || filteredSpeakingData?.chapters[filteredSpeakingData?.chapters.length - 1];
  return speakingChapter ?? null;
}

export const getSpeakingChapterModule = async(levelTheme, chapterNo, baseLanguageCode, contentLanguageCode) => {
    const module = await loadRequestedSpeakingChapterUrl(levelTheme, chapterNo, baseLanguageCode, contentLanguageCode);
    return module ?? null;
}

const SpeakingPracticeService = {
  getSpeakingChapterModule
};

export default SpeakingPracticeService;
