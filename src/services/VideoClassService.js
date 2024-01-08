import videoClassesData from '../assets/data/chapter-class-data.json';

const loadVideoClassData = async() => {
  const rawData = videoClassesData;
  return rawData;
}

const loadRequestedClassUrl = async(levelNo, chapterNo, nativeLanguage, course) => {  
  const rawClassData = await loadVideoClassData();
  const rawCourseData = rawClassData?.find(c => (c.level === parseInt(levelNo, 10) && c.course === course && c.nativeLanguage === nativeLanguage))
  const rawRequestedModule = rawCourseData?.chapters.find(ch => ch.chapter === parseInt(chapterNo, 10));
  return rawRequestedModule?.url;
}

export const getVideoClassUrl = async(levelNo, chapterNo, nativeLanguage, course) => {
    const url = await loadRequestedClassUrl(levelNo, chapterNo, nativeLanguage, course);
    return url ?? "";
}

const VideoClassService = {
  getVideoClassUrl
};

export default VideoClassService;
