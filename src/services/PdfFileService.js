import localPdfData from '../assets/data/pdf-data.json';

const loadLocalPdfData = async() => {
  const rawData = localPdfData;
  return rawData;
}

const loadRequestedPdfPathUrl = async(levelTheme, chapterNo, baseLanguageCode, contentLanguageCode, provider) => {  
  const rawPdfData = await loadLocalPdfData();
  const filteredPdfData = rawPdfData?.pdfs?.find(c => (c.theme === levelTheme && c.contentLanguageCode === contentLanguageCode && c.baseLanguages?.includes(baseLanguageCode)));
  const pdfChapter = filteredPdfData?.chapters.find(ch => ch.chapter === parseInt(chapterNo, 10)) || filteredPdfData?.chapters[filteredPdfData?.chapters.length - 1];
  const embeddableUrl = pdfChapter?.urlPath ? `https://storage.googleapis.com/titulino-bucket${pdfChapter?.urlPath}` : null;
  return embeddableUrl;
}

export const getPdfPathUrl = async(levelTheme, chapterNo, baseLanguageCode, contentLanguageCode, provider) => {
    const url = await loadRequestedPdfPathUrl(levelTheme, chapterNo, baseLanguageCode, contentLanguageCode, provider);
    return url ?? "";
}

const PdfFileService = {
  getPdfPathUrl
};

export default PdfFileService;
