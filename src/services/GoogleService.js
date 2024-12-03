import { env } from '../configs/EnvironmentConfig';

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
    
    const requestOptions = {
      method: "GET"
    };
  
      // Base URL
      let chapterBookDataUrl = `${gcbucketBaseUrl}/${gcBucketName}/chapter-book-data.json`;

    try {
      const response = await fetch(chapterBookDataUrl, requestOptions);
      const apiResult = await response.json();
      return apiResult ?? _objectResults;
    } catch (error) {
      console.log(`Error Retrieving API payload in getChapterBookData: from ${whoCalledMe}`);
      console.error(error);
      return _objectResults; // Might be better to return a handled response
    }
  }

  return _objectResults;

};

const GoogleService = {
  getProgressByEmailId,
  getChapterBookData
};

export default GoogleService;
