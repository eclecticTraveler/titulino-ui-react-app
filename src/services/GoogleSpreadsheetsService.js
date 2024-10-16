import { env } from '../configs/EnvironmentConfig';

const courseProgressApi = `https://script.google.com/macros/s/AKfycbwx6NF3UhQ_f5ZeXE-QwdyZwZDb_wTUXE0IGB7Jxw_vdruuzE50AMJtNyCwK0DT_VUf/exec`;

let _results = [];

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

const VantageService = {
  getProgressByEmailId
};

export default VantageService;
