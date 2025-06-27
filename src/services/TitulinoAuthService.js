import { env } from '../configs/EnvironmentConfig';
import SupabaseConfig from '../configs/SupabaseConfig';

let _results = [];

// Helper function to create the headers
const getHeaders = (token) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", "application/json");
  
  return myHeaders;
};

export const getCourseProgress = async (courseCodeId, token, whoCalledMe) => {
  const _results = []; // Default fallback

  if (!token || !courseCodeId) {
    console.warn(`Missing token or courseCodeId in getCourseProgress: from ${whoCalledMe}`);
    return _results;
  }

  const courseProgressUrl = `${SupabaseConfig.baseApiUrl}/GetAuthenticatedCourseProgressByCourseId`;

  const payload = JSON.stringify({ p_courseid: courseCodeId });

  const requestOptions = {
    method: "POST",
    headers: getHeaders(token),
    body: payload,
    redirect: "follow",
  };

  try {
    const response = await fetch(courseProgressUrl, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();

      if(env.ENVIROMENT !== "prod" ){
        console.warn(`API responded with status ${response.status} in getCourseProgress: from ${whoCalledMe}`);
        console.warn(`Response body: ${errorText}`);
      }

      return _results;
    }

    const apiResult = await response.json();

    return Array.isArray(apiResult) && apiResult.length > 0 ? apiResult : _results;

  } catch (error) {
    console.error(`Exception in getCourseProgress: from ${whoCalledMe}`, error);
    return _results;
  }
};




const TitulinoAuthService = {
  getCourseProgress
};

export default TitulinoAuthService;
