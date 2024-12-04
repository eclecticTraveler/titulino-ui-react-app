import bookChapterData from '../assets/data/chapter-book-data.json';
import GoogleService from './GoogleService';

const loadBookData = async() => {
  const rawData = bookChapterData;
  // const bookData = await GoogleService.getChapterBookData("loadRequestedBookChapterUrl");
  // console.log("BOOK DATA", bookData)
  return rawData;
}

const loadRequestedBook = async(rawBookData, levelTheme, course, nativeLanguage) => {
  return await rawBookData?.books?.find(c => (c.theme === levelTheme && c.course === course && c.nativeLanguage === nativeLanguage));
}

const loadRequestedBookChapterUrl = async(levelTheme, chapterNo, nativeLanguage, course) => {  
  const rawBookData = await loadBookData();
  const filteredBookData = await loadRequestedBook(rawBookData, levelTheme, course, nativeLanguage);
  const ebookChapter = filteredBookData?.chapters.find(ch => ch.chapter === parseInt(chapterNo, 10)) || filteredBookData?.chapters[filteredBookData?.chapters.length - 1];
  const embeddableUrl = filteredBookData?.id ? `https://heyzine.com/flip-book/${filteredBookData?.id}.html#page/${ebookChapter?.page}` : null; 
  return embeddableUrl;
}

const loadRequestedBookUrl = async(levelTheme, nativeLanguage, course) => {  
  const rawBookData = await loadBookData();
  const filteredBookData = await loadRequestedBook(rawBookData, levelTheme, course, nativeLanguage);
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

const BookChapterService = {
  getBookChapterUrl,
  getBookBaseUrl
};

export default BookChapterService;
