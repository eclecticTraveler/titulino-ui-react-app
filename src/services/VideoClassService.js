import videoClassesData from '../assets/data/chapter-class-data.json';
import CentralCourseThemeService from 'services/CentralCourseThemeService';
import GoogleService from './GoogleService';


const loadVideoClassData = async() => {
  // const rawData = videoClassesData;
    const rawData = await GoogleService.getVideoClassData("loadVideoClassData");
      // console.log("Video DATA", rawVideoData)
  return rawData;
}



const loadRequestedClassUrl = async(levelNo, chapterNo, nativeLanguage, course) => {  
  const rawClassData = await loadVideoClassData();
  const rawCourseData = rawClassData?.find(c => (c.level === CentralCourseThemeService.getThemeMappedLevelNo(levelNo) && c.course === course && c.nativeLanguage === nativeLanguage));
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
