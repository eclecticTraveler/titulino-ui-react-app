import bookChapterData from '../assets/data/chapter-book-data.json';

const loadBookData = async() => {
  const rawData = bookChapterData;
  return rawData;
}

const loadRequestedBookChapterUrl = async(levelTheme, chapterNo, nativeLanguage, course) => {  
  const rawBookData = await loadBookData();
  const filteredBookData = rawBookData?.books?.find(c => (c.theme === levelTheme && c.course === course && c.nativeLanguage === nativeLanguage))
  const ebookChapter = filteredBookData?.chapters.find(ch => ch.chapter === parseInt(chapterNo, 10)) || filteredBookData?.chapters[filteredBookData?.chapters.length - 1];
  const embeddableUrl = filteredBookData?.id ? `https://heyzine.com/flip-book/${filteredBookData?.id}.html#page/${ebookChapter?.page}` : null; 
  return embeddableUrl;
}

export const getBookChapterUrl = async(levelTheme, chapterNo, nativeLanguage, course) => {
    const url = await loadRequestedBookChapterUrl(levelTheme, chapterNo, nativeLanguage, course);
    return url ?? "";
}

const BookChapterService = {
  getBookChapterUrl
};

export default BookChapterService;
