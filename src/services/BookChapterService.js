import bookChapterData from '../assets/data/chapter-book-data.json';
import GoogleService from './GoogleService';

const loadBookData = async() => {
  const rawData = bookChapterData;
  // const bookData = await GoogleService.getChapterBookData("loadRequestedBookChapterUrl");
  // console.log("BOOK DATA", bookData)
  return rawData;
}

const loadRequestedBook = async (rawBookData, levelTheme, course, nativeLanguage, tier) => {
  // TODO HANDLE FOR POR SPEAKING  
  return rawBookData?.books?.find(c => 
    c.theme === levelTheme &&
    c.course === course &&
    c.nativeLanguage === nativeLanguage &&
    (tier == null || c.tier === tier) // Only check tier if it's provided
  );
};


const loadRequestedBookChapterUrl = async(levelTheme, chapterNo, nativeLanguage, course, tier) => {  
  const rawBookData = await loadBookData();
  const filteredBookData = await loadRequestedBook(rawBookData, levelTheme, course, nativeLanguage, tier);
  const ebookChapter = filteredBookData?.chapters.find(ch => ch.chapter === parseInt(chapterNo, 10)) || filteredBookData?.chapters[filteredBookData?.chapters.length - 1];
  const embeddableUrl = filteredBookData?.id ? `https://heyzine.com/flip-book/${filteredBookData?.id}.html#page/${ebookChapter?.page}` : null; 
  return embeddableUrl;
}

const loadRequestedBookUrl = async(levelTheme, nativeLanguage, course, tier) => {  
  const rawBookData = await loadBookData();
  const filteredBookData = await loadRequestedBook(rawBookData, levelTheme, course, nativeLanguage, tier);
  const embeddableUrl = filteredBookData?.id ? `https://heyzine.com/flip-book/${filteredBookData?.id}.html` : null; 
  return embeddableUrl;
}

export const getBookChapterUrl = async(levelTheme, chapterNo, nativeLanguage, course) => {
    const url = await loadRequestedBookChapterUrl(levelTheme, chapterNo, nativeLanguage, course);
    return url ?? "";
}

export const getBookBaseUrl = async(levelTheme, nativeLanguage, course) => {
  const url = await loadRequestedBookUrl(levelTheme, nativeLanguage, course);
  return url ?? "";
}

export const getBookTierBaseUrl = async(levelTheme, nativeLanguage, course, tier) => {
  const url = await loadRequestedBookUrl(levelTheme, nativeLanguage, course, tier);
  return url ?? "";
}

const BookChapterService = {
  getBookChapterUrl,
  getBookBaseUrl,
  getBookTierBaseUrl
};

export default BookChapterService;