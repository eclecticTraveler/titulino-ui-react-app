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

export const getCourseProgressDemographicOverview = async (courseCodeId, locationType, countryId, token, whoCalledMe) => {
  if (!token || !courseCodeId || !locationType || !countryId) {
    console.warn(`Missing params in getCourseProgressDemographicOverview: from ${whoCalledMe}`);
    return false;
  }

  const progressOverviewUrl = `${SupabaseConfig.baseApiUrl}/GetAdminDashboardCourseProgressDemographicOverview`;

  const payload = JSON.stringify({
    "p_locationtype": locationType,
    "p_countrynameorid": countryId,
    "p_coursecodeid": courseCodeId
  });

  const requestOptions = {
    method: "POST",
    headers: getHeaders(token),
    body: payload,
    redirect: "follow",
  };

  try {
    const response = await fetch(progressOverviewUrl, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      if (env.ENVIROMENT !== "prod") {
        console.warn(`API responded with status ${response.status} in getCourseProgressDemographicOverview: from ${whoCalledMe}`);
        console.warn(`Response body: ${errorText}`);
      }
      return false;
    }

    const apiResult = await response.json();
    return apiResult ?? false;

  } catch (error) {
    console.error(`Exception in getCourseProgressDemographicOverview: from ${whoCalledMe}`, error);
    return false;
  }
};

export const getCourseProgressCountryCount = async (courseCodeId, token, whoCalledMe) => {
  if (!token || !courseCodeId) {
    console.warn(`Missing params in getCourseProgressCountryCount: from ${whoCalledMe}`);
    return _results;
  }

  const countryCountUrl = `${SupabaseConfig.baseApiUrl}/GetEnrolleeCountryCountWithRecordedCourseProgressByCourseCodeId`;

  const payload = JSON.stringify({ "p_coursecodeid": courseCodeId });

  const requestOptions = {
    method: "POST",
    headers: getHeaders(token),
    body: payload,
    redirect: "follow",
  };

  try {
    const response = await fetch(countryCountUrl, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      if (env.ENVIROMENT !== "prod") {
        console.warn(`API responded with status ${response.status} in getCourseProgressCountryCount: from ${whoCalledMe}`);
        console.warn(`Response body: ${errorText}`);
      }
      return _results;
    }

    const apiResult = await response.json();
    return apiResult ?? _results;

  } catch (error) {
    console.error(`Exception in getCourseProgressCountryCount: from ${whoCalledMe}`, error);
    return _results;
  }
};

export const getCourseProgressCountryDivisionCount = async (courseCodeId, countryId, token, whoCalledMe) => {
  if (!token || !courseCodeId || !countryId) {
    console.warn(`Missing params in getCourseProgressCountryDivisionCount: from ${whoCalledMe}`);
    return _results;
  }

  const countryDivisionUrl = `${SupabaseConfig.baseApiUrl}/GetEnrolleeCountryDivisionWithRecordedCourseProgressCount`;

  const payload = JSON.stringify({
    "p_coursecodeid": courseCodeId,
    "p_countrynameorid": countryId
  });

  const requestOptions = {
    method: "POST",
    headers: getHeaders(token),
    body: payload,
    redirect: "follow",
  };

  try {
    const response = await fetch(countryDivisionUrl, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      if (env.ENVIROMENT !== "prod") {
        console.warn(`API responded with status ${response.status} in getCourseProgressCountryDivisionCount: from ${whoCalledMe}`);
        console.warn(`Response body: ${errorText}`);
      }
      return _results;
    }

    const apiResult = await response.json();
    return apiResult ?? _results;

  } catch (error) {
    console.error(`Exception in getCourseProgressCountryDivisionCount: from ${whoCalledMe}`, error);
    return _results;
  }
};

export const upsertCourseProgress = async (progressRecords, token, whoCalledMe = "UnknownCaller") => {
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


// ── Admin Tools: Contact & Role Management ──

export const getAllEnrollees = async (token, whoCalledMe = 'getAllEnrollees') => {
  if (!token) {
    console.warn(`[${whoCalledMe}] Missing token`);
    return _results;
  }
  const url = `${SupabaseConfig.baseApiUrl}/GetAllEnrollees`;
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({}),
    redirect: 'follow',
  };
  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      if (env.ENVIROMENT !== 'prod') console.warn(`[${whoCalledMe}] status ${response.status}`);
      return _results;
    }
    const apiResult = await response.json();
    return Array.isArray(apiResult) ? apiResult : _results;
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return _results;
  }
};

export const getUserRoles = async (token, whoCalledMe = 'getUserRoles') => {
  if (!token) {
    console.warn(`[${whoCalledMe}] Missing token`);
    return _results;
  }
  const url = `${SupabaseConfig.baseApiUrl}/GetUserRoles`;
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({}),
    redirect: 'follow',
  };
  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) return _results;
    const apiResult = await response.json();
    return Array.isArray(apiResult) ? apiResult : _results;
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return _results;
  }
};

export const assignEnrolleeRoleToCourse = async (payload, token, whoCalledMe = 'assignEnrolleeRoleToCourse') => {
  if (!token || !Array.isArray(payload) || payload.length === 0) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }
  const url = `${SupabaseConfig.baseApiUrl}/EnrollExistingContactToCourse`;
  const requestBody = { p_payload: payload };

  if (env.ENVIROMENT !== 'prod') {
    console.log(`[${whoCalledMe}] assignEnrolleeRoleToCourse endpoint:`, url);
    console.log(`[${whoCalledMe}] assignEnrolleeRoleToCourse payload:`, requestBody);
  }

  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(requestBody),
    redirect: 'follow',
  };
  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) return false;
    return (await response.json()) ?? false;
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return false;
  }
};

export const upsertUserRoleCourse = async (payload, token, whoCalledMe = 'upsertUserRoleCourse') => {
  if (!token || !Array.isArray(payload) || payload.length === 0) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }
  const url = `${SupabaseConfig.baseApiUrl}/UpsertUserRoleCourse`;
  const requestBody = { p_payload: payload };

  if (env.ENVIROMENT !== 'prod') {
    console.log(`[${whoCalledMe}] upsertUserRoleCourse endpoint:`, url);
    console.log(`[${whoCalledMe}] upsertUserRoleCourse payload:`, requestBody);
  }

  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(requestBody),
    redirect: 'follow',
  };
  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) return false;
    return (await response.json()) ?? false;
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return false;
  }
};

export const getGlobalUserRole = async (contactInternalId, token, whoCalledMe = 'getGlobalUserRole') => {
  if (!token || !contactInternalId) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return { isGlobal: false, role: null };
  }

  const url = `${SupabaseConfig.baseApiUrl}/GetGlobalUserRole`;
  const requestBody = { p_contact_id: contactInternalId };

  if (env.ENVIROMENT !== 'prod') {
    console.log(`[${whoCalledMe}] getGlobalUserRole endpoint:`, url);
    console.log(`[${whoCalledMe}] getGlobalUserRole payload:`, requestBody);
  }

  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(requestBody),
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) return { isGlobal: false, role: null };
    const apiResult = await response.json();
    if (env.ENVIROMENT !== 'prod') {
      console.log(`[${whoCalledMe}] getGlobalUserRole response:`, apiResult);
    }
    return apiResult || { isGlobal: false, role: null };
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return { isGlobal: false, role: null };
  }
};

export const upsertUserRoleGlobal = async (payload, token, whoCalledMe = 'upsertUserRoleGlobal') => {
  if (!token || !Array.isArray(payload) || payload.length === 0) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }

  const url = `${SupabaseConfig.baseApiUrl}/UpsertUserRoleGlobal`;
  const requestBody = { p_payload: payload };

  if (env.ENVIROMENT !== 'prod') {
    console.log(`[${whoCalledMe}] upsertUserRoleGlobal endpoint:`, url);
    console.log(`[${whoCalledMe}] upsertUserRoleGlobal payload:`, requestBody);
  }

  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(requestBody),
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) return false;
    return (await response.json()) ?? false;
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return false;
  }
};

export const assignGlobalRole = async (contactInternalId, roleId, token, whoCalledMe = 'assignGlobalRole') => {
  if (!token || !contactInternalId || !roleId) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }
  const url = `${SupabaseConfig.baseApiUrl}/AssignGlobalRole`;
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ p_contact_internal_id: contactInternalId, p_role_id: roleId }),
    redirect: 'follow',
  };
  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) return false;
    return (await response.json()) ?? false;
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return false;
  }
};

export const upsertCourse = async (courseData, token, whoCalledMe = 'upsertCourse') => {
  if (!token || !courseData) {
    return {
      success: false,
      data: null,
      status: null,
      errorMessage: 'Missing token or course data.',
    };
  }
  const url = `${SupabaseConfig.baseApiUrl}/UpsertCourse`;
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ p_courses_json: courseData }),
    redirect: 'follow',
  };
  try {
    const response = await fetch(url, requestOptions);
    const responseText = await response.text();
    let parsedResult = null;

    if (responseText) {
      try {
        parsedResult = JSON.parse(responseText);
      } catch (parseError) {
        parsedResult = responseText;
      }
    }

    if (!response.ok) {
      if (env.ENVIROMENT !== 'prod') {
        console.warn(`[${whoCalledMe}] upsertCourse failed with status ${response.status}`);
        console.warn(`[${whoCalledMe}] upsertCourse response body:`, parsedResult);
      }

      return {
        success: false,
        data: parsedResult,
        status: response.status,
        errorMessage:
          parsedResult?.message ||
          parsedResult?.Message ||
          response.statusText ||
          'Course upsert failed.',
      };
    }

    return {
      success: true,
      data: parsedResult,
      status: response.status,
      errorMessage: null,
    };
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return {
      success: false,
      data: null,
      status: null,
      errorMessage: error?.message || 'Course upsert failed.',
    };
  }
};

export const getAllUserLoginFootprint = async (token, whoCalledMe = 'getAllUserLoginFootprint') => {
  if (!token) {
    console.warn(`[${whoCalledMe}] Missing token`);
    return _results;
  }

  const url = `${SupabaseConfig.baseApiUrl}/GetAllUserLoginFootprint`;
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({}),
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      if (env.ENVIROMENT !== 'prod') console.warn(`[${whoCalledMe}] status ${response.status}`);
      return _results;
    }

    const apiResult = await response.json();    
    return Array.isArray(apiResult) ? apiResult : _results;
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return _results;
  }
};

export const getUserLoginFootprintByContact = async (contactInternalId, token, whoCalledMe = 'getUserLoginFootprintByContact') => {
  if (!token || !contactInternalId) {
    console.warn(`[${whoCalledMe}] Missing token or contactInternalId`);
    return _results;
  }

  const url = `${SupabaseConfig.baseApiUrl}/GetUserLoginFootprintByContact`;
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ p_contact_id: contactInternalId }),
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      if (env.ENVIROMENT !== 'prod') console.warn(`[${whoCalledMe}] status ${response.status}`);
      return _results;
    }
    
    const apiResult = await response.json();
    console.log("getUserLoginFootprintByContact apiResult", apiResult);
    return Array.isArray(apiResult) ? apiResult : _results;
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return _results;
  }
};

export const getOptedOutActiveContactProfiles = async (token, whoCalledMe = 'getOptedOutActiveContactProfiles') => {
  if (!token) {
    console.warn(`[${whoCalledMe}] Missing token`);
    return _results;
  }

  const url = `${SupabaseConfig.baseApiUrl}/GetOptedOutActiveContactProfiles`;
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({}),
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      if (env.ENVIROMENT !== 'prod') console.warn(`[${whoCalledMe}] status ${response.status}`);
      return _results;
    }

    const apiResult = await response.json();
    return Array.isArray(apiResult) ? apiResult : _results;
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return _results;
  }
};

export const getInactiveContactProfiles = async (token, whoCalledMe = 'getInactiveContactProfiles') => {
  if (!token) {
    console.warn(`[${whoCalledMe}] Missing token`);
    return _results;
  }

  const url = `${SupabaseConfig.baseApiUrl}/GetInactiveContactProfiles`;
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({}),
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      if (env.ENVIROMENT !== 'prod') console.warn(`[${whoCalledMe}] status ${response.status}`);
      return _results;
    }

    const apiResult = await response.json();
    return Array.isArray(apiResult) ? apiResult : _results;
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return _results;
  }
};

export const toggleContactEmailOptOut = async (payload, token, whoCalledMe = 'toggleContactEmailOptOut') => {
  if (!token || !Array.isArray(payload) || payload.length === 0) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }

  const url = `${SupabaseConfig.baseApiUrl}/ToggleContactEmailOptOut`;
  const requestBody = { p_payload: payload };

  if (env.ENVIROMENT !== 'prod') {
    console.log(`[${whoCalledMe}] toggleContactEmailOptOut endpoint:`, url);
    console.log(`[${whoCalledMe}] toggleContactEmailOptOut payload:`, requestBody);
  }

  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(requestBody),
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) return false;
    const responseText = await response.text();
    if (!responseText) return true;
    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return false;
  }
};

export const toggleContactActive = async (payload, token, whoCalledMe = 'toggleContactActive') => {
  if (!token || !Array.isArray(payload) || payload.length === 0) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }

  const url = `${SupabaseConfig.baseApiUrl}/ToggleContactActive`;
  const requestBody = { p_payload: payload };

  if (env.ENVIROMENT !== 'prod') {
    console.log(`[${whoCalledMe}] toggleContactActive endpoint:`, url);
    console.log(`[${whoCalledMe}] toggleContactActive payload:`, requestBody);
  }

  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(requestBody),
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) return false;
    const responseText = await response.text();
    if (!responseText) return true;
    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return false;
  }
};

export const upsertEnrolleeList = async (enrollees, token, whoCalledMe = 'upsertEnrolleeList') => {
  const recordsToSubmit = Array.isArray(enrollees) ? enrollees : [];
  if (!token || recordsToSubmit.length === 0) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }

  const url = `${SupabaseConfig.baseApiUrl}/UpsertEnrolleeList`;
  const requestBody = { enrollees: recordsToSubmit };

  if (env.ENVIROMENT !== 'prod') {
    console.log(`[${whoCalledMe}] upsertEnrolleeList endpoint:`, url);
    console.log(`[${whoCalledMe}] upsertEnrolleeList payload:`, requestBody);
  }

  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(requestBody),
    redirect: 'follow',
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) return false;
    const responseText = await response.text();
    if (!responseText) return true;
    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception:`, error);
    return false;
  }
};


const TitulinoAuthService = {
  getCourseProgress,
  getCourseProgressDemographicOverview,
  getCourseProgressCountryCount,
  getCourseProgressCountryDivisionCount,
  upsertCourseProgress,
  upsertUserKnowMeSubmission,
  getAllEnrollees,
  getUserRoles,
  assignEnrolleeRoleToCourse,
  upsertUserRoleCourse,
  getGlobalUserRole,
  upsertUserRoleGlobal,
  assignGlobalRole,
  upsertCourse,
  getAllUserLoginFootprint,
  getUserLoginFootprintByContact,
  getOptedOutActiveContactProfiles,
  getInactiveContactProfiles,
  toggleContactEmailOptOut,
  toggleContactActive,
  upsertEnrolleeList
};

export default TitulinoAuthService;
