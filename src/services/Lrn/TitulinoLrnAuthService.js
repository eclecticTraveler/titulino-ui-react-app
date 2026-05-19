import { env } from 'configs/EnvironmentConfig';
import SupabaseConfig from 'configs/SupabaseConfig';

const EMPTY_RESULT = [];

const getHeaders = (token) => {
  const myHeaders = new Headers();
  myHeaders.append('apikey', SupabaseConfig.supabaseAnonApiKey);
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Accept-Profile', 'TitulinoApi_v1');
  myHeaders.append('Content-Profile', 'TitulinoApi_v1');
  myHeaders.append('Authorization', `Bearer ${token}`);

  return myHeaders;
};

const postJsonEndpoint = async (endpointName, payload = {}, token, whoCalledMe = endpointName, fallbackResult = EMPTY_RESULT) => {
  if (!token || !endpointName) {
    console.warn(`[${whoCalledMe}] Missing token or endpointName`);
    return fallbackResult;
  }

  const url = `${SupabaseConfig.baseApiUrl}/${endpointName}`;
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload || {}),
    redirect: 'follow'
  };

  if (env.ENVIROMENT !== 'prod') {
    console.log(`[${whoCalledMe}] ${endpointName} endpoint:`, url);
    console.log(`[${whoCalledMe}] ${endpointName} payload:`, payload || {});
  }

  try {
    const response = await fetch(url, requestOptions);
    const responseText = await response.text();

    if (!response.ok) {
      if (env.ENVIROMENT !== 'prod') {
        console.warn(`[${whoCalledMe}] ${endpointName} responded with status ${response.status}`);
        console.warn(`[${whoCalledMe}] Response body: ${responseText}`);
      }
      return fallbackResult;
    }

    if (!responseText) return {};

    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception in ${endpointName}:`, error);
    return fallbackResult;
  }
};

export const getCourseProgress = async (courseCodeId, token, whoCalledMe = 'getCourseProgress') => {
  if (!token || !courseCodeId) {
    console.warn(`[${whoCalledMe}] Missing token or courseCodeId`);
    return EMPTY_RESULT;
  }

  const apiResult = await postJsonEndpoint('GetAuthenticatedCourseProgressByCourseId', {
    p_courseid: courseCodeId
  }, token, whoCalledMe);

  return Array.isArray(apiResult) && apiResult.length > 0 ? apiResult : EMPTY_RESULT;
};

export const getCourseProgressDemographicOverview = async (
  courseCodeId,
  locationType,
  countryId,
  token,
  whoCalledMe = 'getCourseProgressDemographicOverview'
) => {
  if (!token || !courseCodeId || !locationType || !countryId) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }

  const apiResult = await postJsonEndpoint('GetAdminDashboardCourseProgressDemographicOverview', {
    p_locationtype: locationType,
    p_countrynameorid: countryId,
    p_coursecodeid: courseCodeId
  }, token, whoCalledMe, false);

  return apiResult ?? false;
};

export const getCourseProgressCountryCount = async (courseCodeId, token, whoCalledMe = 'getCourseProgressCountryCount') => {
  if (!token || !courseCodeId) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return EMPTY_RESULT;
  }

  return postJsonEndpoint('GetEnrolleeCountryCountWithRecordedCourseProgressByCourseCodeId', {
    p_coursecodeid: courseCodeId
  }, token, whoCalledMe);
};

export const getCourseProgressCountryDivisionCount = async (
  courseCodeId,
  countryId,
  token,
  whoCalledMe = 'getCourseProgressCountryDivisionCount'
) => {
  if (!token || !courseCodeId || !countryId) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return EMPTY_RESULT;
  }

  return postJsonEndpoint('GetEnrolleeCountryDivisionWithRecordedCourseProgressCount', {
    p_coursecodeid: courseCodeId,
    p_countrynameorid: countryId
  }, token, whoCalledMe);
};

export const upsertCourseProgress = async (progressRecords, token, whoCalledMe = 'upsertCourseProgress') => {
  if (!token || !Array.isArray(progressRecords) || progressRecords.length === 0) {
    console.warn(`[${whoCalledMe}] Missing token or progressRecords is empty or invalid`);
    return EMPTY_RESULT;
  }

  const apiResult = await postJsonEndpoint('UpsertAuthenticatedCourseProgress', {
    progress_records: progressRecords
  }, token, whoCalledMe);

  return Array.isArray(apiResult) && apiResult.length > 0 ? apiResult : EMPTY_RESULT;
};

export const upsertUserKnowMeSubmission = async (submissionRecords, token, whoCalledMe = 'upsertUserKnowMeSubmission') => {
  if (!token || !Array.isArray(submissionRecords) || submissionRecords.length === 0) {
    console.warn(`[${whoCalledMe}] Missing token or submissionRecords is empty or invalid`);
    return EMPTY_RESULT;
  }

  const apiResult = await postJsonEndpoint('UpsertAuthenticatedKnowMeSubmission', {
    submission_records: submissionRecords
  }, token, whoCalledMe);

  return Array.isArray(apiResult) && apiResult.length > 0 ? apiResult : EMPTY_RESULT;
};

export const assignEnrolleeRoleToCourse = async (payload, token, whoCalledMe = 'assignEnrolleeRoleToCourse') => {
  if (!token || !Array.isArray(payload) || payload.length === 0) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }

  return postJsonEndpoint('EnrollExistingContactToCourse', {
    p_payload: payload
  }, token, whoCalledMe, false);
};

export const upsertUserRoleCourse = async (payload, token, whoCalledMe = 'upsertUserRoleCourse') => {
  if (!token || !Array.isArray(payload) || payload.length === 0) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }

  return postJsonEndpoint('UpsertUserRoleCourse', {
    p_payload: payload
  }, token, whoCalledMe, false);
};

const TitulinoLrnAuthService = {
  getCourseProgress,
  getCourseProgressDemographicOverview,
  getCourseProgressCountryCount,
  getCourseProgressCountryDivisionCount,
  upsertCourseProgress,
  upsertUserKnowMeSubmission,
  assignEnrolleeRoleToCourse,
  upsertUserRoleCourse
};

export default TitulinoLrnAuthService;
