import { env } from '../configs/EnvironmentConfig';
import SupabaseConfig from '../configs/SupabaseConfig';

let _results = [];

// Helper function to create the headers
const getHeaders = (token) => {

  const myHeaders = new Headers();
  myHeaders.append("apikey", SupabaseConfig.supabaseAnonApiKey);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept-Profile", "TitulinoApi_v1");
  myHeaders.append("Content-Profile", "TitulinoApi_v1");
  myHeaders.append("Authorization", `Bearer ${token}`);
  
  return myHeaders;
};

export const getCourseProgress = async (courseCodeId, token, whoCalledMe) => {

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

export const upsertUserCourseProgress = async (progressRecords, token, whoCalledMe = "UnknownCaller") => {
  if (!token || !Array.isArray(progressRecords) || progressRecords.length === 0) {
    console.warn(`[${whoCalledMe}] Missing token or progressRecords is empty or invalid`);
    return _results;
  }

  const courseProgressUrl = `${SupabaseConfig.baseApiUrl}/UpsertAuthenticatedCourseProgress`;

  const payload = JSON.stringify({ progress_records: progressRecords });

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
      if (env.ENVIROMENT !== "prod") {
        console.warn(`[${whoCalledMe}] API responded with status ${response.status}`);
        console.warn(`[${whoCalledMe}] Response body: ${errorText}`);
      }
      return _results;
    }

    let apiResult;
    try {
      apiResult = await response.json();
    } catch (parseError) {
      console.error(`[${whoCalledMe}] Failed to parse JSON from response`);
      return _results;
    }

    return Array.isArray(apiResult) && apiResult.length > 0 ? apiResult : _results;

  } catch (error) {
    console.error(`[${whoCalledMe}] Exception during fetch:`, error);
    return _results;
  }
};

export const upsertUserKnowMeSubmission = async (submission_records, token, whoCalledMe = "UnknownCaller") => {
  if (!token || !Array.isArray(submission_records) || submission_records.length === 0) {
    console.warn(`[${whoCalledMe}] Missing token or submission_records is empty or invalid`);
    return _results;
  }

  const courseProgressUrl = `${SupabaseConfig.baseApiUrl}/UpsertAuthenticatedKnowMeSubmission`;

  const payload = JSON.stringify({ submission_records: submission_records });

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
      if (env.ENVIROMENT !== "prod") {
        console.warn(`[${whoCalledMe}] API responded with status ${response.status}`);
        console.warn(`[${whoCalledMe}] Response body: ${errorText}`);
      }
      return _results;
    }

    let apiResult;
    try {
      apiResult = await response.json();
    } catch (parseError) {
      console.error(`[${whoCalledMe}] Failed to parse JSON from response`);
      return _results;
    }

    return Array.isArray(apiResult) && apiResult.length > 0 ? apiResult : _results;

  } catch (error) {
    console.error(`[${whoCalledMe}] Exception upsertUserKnowMeSubmission during fetch:`, error);
    return _results;
  }
};


const TitulinoAuthService = {
  getCourseProgress,
  upsertUserCourseProgress,
  upsertUserKnowMeSubmission
};

export default TitulinoAuthService;
