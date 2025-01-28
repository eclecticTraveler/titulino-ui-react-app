import { env } from '../configs/EnvironmentConfig';
import LocalStorageService from "services/LocalStorageService";

const courseProgressApi = `https://script.google.com/macros/s/AKfycbzUE5iJHp2peLS1eZmm0ED14ihoYv5chFxoU53rgKcGyVjLku8l7CT_5ZsoUf3oOa2u/exec`;
const gcbucketBaseUrl = `https://storage.googleapis.com/titulino-bucket`;
const gcBucketName = `titulino-spine-data`;

let _results = [];
let _objectResults = {};
export const getProgressByEmailId = async (email, whoCalledMe) => {
  if (email) {

    const formdata = new FormData();
    formdata.append("email", email);

      const requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow"
      };


    try {
      const response = await fetch(courseProgressApi, requestOptions);
      const apiResult = await response.json();
      
      console.log("API URL:", courseProgressApi);
      console.log("API Result:", apiResult);

      return apiResult.length > 0 ? apiResult : _results;
    } catch (error) {
      console.log(`Error Retrieving progress by email: from ${whoCalledMe}`);
      console.error(error);
      return _results; // Might be better to return a handled response
    }
  }

  return _results;
};

export const getChapterBookData = async (whoCalledMe) => {
  if (whoCalledMe) {
    // TODO: Refactor on new layer called manager
    // const localStorageKey = `ChapterBookDataKey`;
    // const cachedData = await LocalStorageService.getChapterClassData(localStorageKey);
    // if (cachedData) {
    //   return cachedData;
    // }

    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
  
      // Base URL
      let chapterBookDataUrl = `${gcbucketBaseUrl}/${gcBucketName}/chapter-book-data.json`;

    try {
      const response = await fetch(chapterBookDataUrl, requestOptions);
      const apiResult = await response.json();

      // await LocalStorageService.setChapterClassData(
      //   apiResult,   
      //   localStorageKey,
      //   60
      // );

      return apiResult ?? _objectResults;
    } catch (error) {
      console.log(`Error Retrieving API payload in getChapterBookData: from ${whoCalledMe}`);
      console.error(error);
      return _objectResults; // Might be better to return a handled response
    }
  }

  return _objectResults;

};

export const getGCUriForImages = async(whoCalledMe, theme) => {
  if(whoCalledMe){
    let gcUrl = `${gcbucketBaseUrl}/titulino-images/${theme}/`;
    return gcUrl
  }
}

export const getVideoClassData = async (whoCalledMe) => {
  if (whoCalledMe) {
      
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };      
    
    // Base URL
    let chapterBookDataUrl = `${gcbucketBaseUrl}/${gcBucketName}/chapter-class-data.json`;

    try {
      const response = await fetch(chapterBookDataUrl, requestOptions);
      const apiResult = await response.json();
      console.log("Videos", apiResult)
      return apiResult ?? _results;
    } catch (error) {
      console.log(`Error Retrieving API payload in getVideoClassData: from ${whoCalledMe}`);
      console.error(error);
      return _results; // Might be better to return a handled response
    }
  }

  return _results;

};

export const getCourseProgressData = async (whoCalledMe) => {
  if (whoCalledMe) {
    
    const requestOptions = {
      method: "GET"
    };
  
      // Base URL
      let chapterBookDataUrl = `${gcbucketBaseUrl}/${gcBucketName}/course-progress-data.json`;

    try {
      const response = await fetch(chapterBookDataUrl, requestOptions);
      const apiResult = await response.json();
      return apiResult ?? _objectResults;
    } catch (error) {
      console.log(`Error Retrieving API payload in getCourseProgressData: from ${whoCalledMe}`);
      console.error(error);
      return _objectResults; // Might be better to return a handled response
    }
  }

  return _objectResults;

};

const GoogleService = {
  getProgressByEmailId,
  getChapterBookData,
  getGCUriForImages,
  getVideoClassData,
  getCourseProgressData
};

export default GoogleService;
