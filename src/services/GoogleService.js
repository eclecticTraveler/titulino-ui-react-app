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


export const getGrammarClassData = async (whoCalledMe) => {
  if (whoCalledMe) {
      
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };      
    
    // Base URL
    let classDataUrl = `${gcbucketBaseUrl}/${gcBucketName}/grammar-class-data.json`;

    try {
      const response = await fetch(classDataUrl, requestOptions);
      const apiResult = await response.json();
      console.log("Grammar Videos", apiResult)
      return apiResult ?? _results;
    } catch (error) {
      console.log(`Error Retrieving API payload in getGrammarClassData: from ${whoCalledMe}`);
      console.error(error);
      return _results; // Might be better to return a handled response
    }
  }

  return _results;

};

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


export const getGeoMapResource = async (countryId, whoCalledMe) => {
  if (!whoCalledMe) return _results;

  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  // URLs for specific and default maps
  const specificMapUrl = `${gcbucketBaseUrl}/maps/gadm41_${countryId}_1.json`;
  const defaultMapUrl = `${gcbucketBaseUrl}/maps/world-countries-sans-antarctica.json`;

  try {
    // Attempt fetching the specific map
    const response = await fetch(specificMapUrl, requestOptions);

    // If response is not OK (e.g., 404), fetch the default map
    if (!response.ok) {
      console.warn(`Map for ${countryId} not found. Fetching default map.`);
      return await fetchDefaultMap(defaultMapUrl, requestOptions);
    }

    const apiResult = await response.json();
    return apiResult ?? _results;

} catch (error) {
    console.error(`Error fetching map for ${countryId}.`, error);
    return fetchDefaultMap(defaultMapUrl, requestOptions);
  }
};

// Helper function to fetch the default map
const fetchDefaultMap = async (url, requestOptions) => {
  try {
    const defaultResponse = await fetch(url, requestOptions);
    if (!defaultResponse.ok) {
      throw new Error("Failed to load default map.");
    }
    return await defaultResponse.json();
  } catch (error) {
    console.error("Error fetching default map:", error);
    return _results;
  }
};


const GoogleService = {
  getProgressByEmailId,
  getChapterBookData,
  getGCUriForImages,
  getVideoClassData,
  getCourseProgressData,
  getGeoMapResource,
  getGrammarClassData
};

export default GoogleService;
