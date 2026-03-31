import bookChapterData from '../assets/data/chapter-book-data.json';
// import GoogleService from './GoogleService';

const loadBookData = async() => {
  const rawData = bookChapterData;
  // const bookData = await GoogleService.getChapterBookData("loadRequestedBookChapterUrl");
  return rawData;
}

const loadRequestedBook = async (rawBookData, levelTheme, contentLanguageCode, baseLanguageCode, tier = "Free") => {
  // TODO HANDLE FOR PORTUGUESE SPEAKING SINCE THEIR DATA IS NOT PRESENT
  return rawBookData?.books?.find(c => 
    c.theme === levelTheme &&
    c.contentLanguageCode === contentLanguageCode &&
    c.baseLanguages?.includes(baseLanguageCode) &&
    (tier == null || c.tier === tier)
  );
};


const loadRequestedBookChapterUrl = async(levelTheme, chapterNo, baseLanguageCode, contentLanguageCode, tier) => {  
  const rawBookData = await loadBookData();
  const filteredBookData = await loadRequestedBook(rawBookData, levelTheme, contentLanguageCode, baseLanguageCode, tier);
  const ebookChapter = filteredBookData?.chapters.find(ch => ch.chapter === parseInt(chapterNo, 10)) || filteredBookData?.chapters[filteredBookData?.chapters.length - 1];
  const embeddableUrl = filteredBookData?.id ? `https://heyzine.com/flip-book/${filteredBookData?.id}.html#page/${ebookChapter?.page}` : null; 
  return embeddableUrl;
}

const loadRequestedBookUrl = async(levelTheme, baseLanguageCode, contentLanguageCode, tier) => {  
  const rawBookData = await loadBookData();
  const filteredBookData = await loadRequestedBook(rawBookData, levelTheme, contentLanguageCode, baseLanguageCode, tier);
  const embeddableUrl = filteredBookData?.id ? `https://heyzine.com/flip-book/${filteredBookData?.id}.html` : null; 
  return embeddableUrl;
}

export const getBookChapterUrl = async(levelTheme, chapterNo, baseLanguageCode, contentLanguageCode) => {
    const url = await loadRequestedBookChapterUrl(levelTheme, chapterNo, baseLanguageCode, contentLanguageCode, null);
    return url ?? "";
}

export const getBookTierChapterUrl = async(levelTheme, chapterNo, baseLanguageCode, contentLanguageCode, tier) => {
  const url = await loadRequestedBookChapterUrl(levelTheme, chapterNo, baseLanguageCode, contentLanguageCode, tier);
  return url ?? "";
}

export const getBookBaseUrl = async(levelTheme, baseLanguageCode, contentLanguageCode) => {
  const url = await loadRequestedBookUrl(levelTheme, baseLanguageCode, contentLanguageCode);
  return url ?? "";
}

export const getBookTierBaseUrl = async(levelTheme, baseLanguageCode, contentLanguageCode, tier) => {
  const url = await loadRequestedBookUrl(levelTheme, baseLanguageCode, contentLanguageCode, tier);
  return url ?? "";
}

const BookChapterService = {
  getBookChapterUrl,
  getBookBaseUrl,
  getBookTierBaseUrl,
  getBookTierChapterUrl
};

export default BookChapterService;