import localPdfData from '../assets/data/pdf-data.json';

const loadLocalPdfData = async() => {
  const rawData = localPdfData;
  return rawData;
}

const loadRequestedPdfPathUrl = async(levelTheme, chapterNo, nativeLanguage, course, provider) => {  
  const rawPdfData = await loadLocalPdfData();
  const filteredPdfData = rawPdfData?.pdfs?.find(c => (c.theme === levelTheme && c.course === course && c.nativeLanguage === nativeLanguage));
  const pdfChapter = filteredPdfData?.chapters.find(ch => ch.chapter === parseInt(chapterNo, 10)) || filteredPdfData?.chapters[filteredPdfData?.chapters.length - 1];
  const embeddableUrl = `https://d2eaaub12s77xu.cloudfront.net${pdfChapter?.urlPath}`;
  return embeddableUrl;
}

export const getPdfPathUrl = async(levelTheme, chapterNo, nativeLanguage, course, provider) => {
    const url = await loadRequestedPdfPathUrl(levelTheme, chapterNo, nativeLanguage, course, provider);
    return url ?? "";
}

const PdfFileService = {
  getPdfPathUrl
};

export default PdfFileService;
