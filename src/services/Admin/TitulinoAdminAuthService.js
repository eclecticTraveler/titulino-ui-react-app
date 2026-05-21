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

const getArrayEndpoint = async (endpointName, token, whoCalledMe = endpointName) => {
  const apiResult = await postJsonEndpoint(endpointName, {}, token, whoCalledMe);
  return Array.isArray(apiResult) ? apiResult : EMPTY_RESULT;
};

export const getProcessLogEvents = async (
  endpointName,
  payload = {},
  token,
  whoCalledMe = 'getProcessLogEvents'
) => {
  if (!endpointName) {
    console.warn(`[${whoCalledMe}] Missing endpointName`);
    return EMPTY_RESULT;
  }

  const apiResult = await postJsonEndpoint(endpointName, payload, token, whoCalledMe);
  return Array.isArray(apiResult) ? apiResult : EMPTY_RESULT;
};

export const getContactSegment = async (payload = {}, token, whoCalledMe = 'getContactSegment') => {
  const apiResult = await postJsonEndpoint('GetContactSegment', payload, token, whoCalledMe);
  return Array.isArray(apiResult) ? apiResult : EMPTY_RESULT;
};

export const getContactSegmentCount = async (payload = {}, token, whoCalledMe = 'getContactSegmentCount') => {
  const apiResult = await postJsonEndpoint('GetContactSegmentCount', payload, token, whoCalledMe, 0);

  if (typeof apiResult === 'number') return apiResult;
  if (typeof apiResult === 'string') return Number(apiResult) || 0;
  if (Array.isArray(apiResult)) {
    const firstResult = apiResult[0];
    if (typeof firstResult === 'number') return firstResult;
    return Number(
      firstResult?.count ??
      firstResult?.Count ??
      firstResult?.total ??
      firstResult?.Total ??
      firstResult?.getcontactsegmentcount ??
      firstResult?.GetContactSegmentCount
    ) || 0;
  }

  return Number(
    apiResult?.count ??
    apiResult?.Count ??
    apiResult?.total ??
    apiResult?.Total ??
    apiResult?.getcontactsegmentcount ??
    apiResult?.GetContactSegmentCount
  ) || 0;
};

export const getContactSegmentMetadata = async (token, whoCalledMe = 'getContactSegmentMetadata') => {
  const apiResult = await postJsonEndpoint('GetContactSegmentMetadata', {}, token, whoCalledMe, {});
  if (Array.isArray(apiResult)) {
    return apiResult[0] && typeof apiResult[0] === 'object' ? apiResult[0] : {};
  }
  return apiResult && typeof apiResult === 'object' && !Array.isArray(apiResult)
    ? apiResult
    : {};
};

export const getContactCertificationHistory = async (payload = {}, token, whoCalledMe = 'getContactCertificationHistory') => {
  const apiResult = await postJsonEndpoint('GetContactCertificationHistory', payload, token, whoCalledMe);
  return Array.isArray(apiResult) ? apiResult : EMPTY_RESULT;
};

export const detectPossibleDuplicateContacts = async (payload = {}, token, whoCalledMe = 'detectPossibleDuplicateContacts') => {
  const apiResult = await postJsonEndpoint('DetectPossibleDuplicateContacts', payload, token, whoCalledMe);
  return Array.isArray(apiResult) ? apiResult : EMPTY_RESULT;
};

export const getContactMergeDashboard = async (payload = {}, token, whoCalledMe = 'getContactMergeDashboard') => (
  postJsonEndpoint('GetContactMergeDashboard', payload, token, whoCalledMe, {})
);

export const previewContactMerge = async (payload = {}, token, whoCalledMe = 'previewContactMerge') => (
  postJsonEndpoint('PreviewContactMerge', payload, token, whoCalledMe, null)
);

export const mergeContacts = async (payload = {}, token, whoCalledMe = 'mergeContacts') => (
  postJsonEndpoint('MergeContacts', payload, token, whoCalledMe, false)
);

export const rollbackContactMerge = async (payload = {}, token, whoCalledMe = 'rollbackContactMerge') => (
  postJsonEndpoint('RollbackContactMerge', payload, token, whoCalledMe, false)
);

export const getCountryDivisions = async (payload = {}, token, whoCalledMe = 'getCountryDivisions') => {
  const apiResult = await postJsonEndpoint('GetCountryDivisions', payload, token, whoCalledMe);
  return Array.isArray(apiResult) ? apiResult : EMPTY_RESULT;
};

export const getAllEnrollees = async (token, whoCalledMe = 'getAllEnrollees') => (
  getArrayEndpoint('GetAllEnrollees', token, whoCalledMe)
);

export const getUserRoles = async (token, whoCalledMe = 'getUserRoles') => (
  getArrayEndpoint('GetUserRoles', token, whoCalledMe)
);

export const getGlobalUserRole = async (contactInternalId, token, whoCalledMe = 'getGlobalUserRole') => {
  if (!token || !contactInternalId) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return { isGlobal: false, role: null };
  }

  const apiResult = await postJsonEndpoint('GetGlobalUserRole', {
    p_contact_id: contactInternalId
  }, token, whoCalledMe, { isGlobal: false, role: null });

  return apiResult || { isGlobal: false, role: null };
};

export const upsertUserRoleGlobal = async (payload, token, whoCalledMe = 'upsertUserRoleGlobal') => {
  if (!token || !Array.isArray(payload) || payload.length === 0) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }

  return postJsonEndpoint('UpsertUserRoleGlobal', {
    p_payload: payload
  }, token, whoCalledMe, false);
};

export const assignGlobalRole = async (contactInternalId, roleId, token, whoCalledMe = 'assignGlobalRole') => {
  if (!token || !contactInternalId || !roleId) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }

  return postJsonEndpoint('AssignGlobalRole', {
    p_contact_internal_id: contactInternalId,
    p_role_id: roleId
  }, token, whoCalledMe, false);
};

export const upsertCourse = async (courseData, token, whoCalledMe = 'upsertCourse') => {
  if (!token || !courseData) {
    return {
      success: false,
      data: null,
      status: null,
      errorMessage: 'Missing token or course data.'
    };
  }

  const url = `${SupabaseConfig.baseApiUrl}/UpsertCourse`;
  const requestOptions = {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ p_courses_json: courseData }),
    redirect: 'follow'
  };

  if (env.ENVIROMENT !== 'prod') {
    console.log(`[${whoCalledMe}] UpsertCourse endpoint:`, url);
    console.log(`[${whoCalledMe}] UpsertCourse payload:`, { p_courses_json: courseData });
  }

  try {
    const response = await fetch(url, requestOptions);
    const responseText = await response.text();
    let parsedResult = null;

    if (responseText) {
      try {
        parsedResult = JSON.parse(responseText);
      } catch {
        parsedResult = responseText;
      }
    }

    if (!response.ok) {
      if (env.ENVIROMENT !== 'prod') {
        console.warn(`[${whoCalledMe}] UpsertCourse failed with status ${response.status}`);
        console.warn(`[${whoCalledMe}] UpsertCourse response body:`, parsedResult);
      }

      return {
        success: false,
        data: parsedResult,
        status: response.status,
        errorMessage:
          parsedResult?.message ||
          parsedResult?.Message ||
          response.statusText ||
          'Course upsert failed.'
      };
    }

    return {
      success: true,
      data: parsedResult,
      status: response.status,
      errorMessage: null
    };
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception in UpsertCourse:`, error);
    return {
      success: false,
      data: null,
      status: null,
      errorMessage: error?.message || 'Course upsert failed.'
    };
  }
};

export const getAllUserLoginFootprint = async (token, whoCalledMe = 'getAllUserLoginFootprint') => (
  getArrayEndpoint('GetAllUserLoginFootprint', token, whoCalledMe)
);

export const getUserLoginFootprintByContact = async (contactInternalId, token, whoCalledMe = 'getUserLoginFootprintByContact') => {
  if (!token || !contactInternalId) {
    console.warn(`[${whoCalledMe}] Missing token or contactInternalId`);
    return EMPTY_RESULT;
  }

  const apiResult = await postJsonEndpoint('GetUserLoginFootprintByContact', {
    p_contact_id: contactInternalId
  }, token, whoCalledMe);

  return Array.isArray(apiResult) ? apiResult : EMPTY_RESULT;
};

export const getOptedOutActiveContactProfiles = async (token, whoCalledMe = 'getOptedOutActiveContactProfiles') => (
  getArrayEndpoint('GetOptedOutActiveContactProfiles', token, whoCalledMe)
);

export const getInactiveContactProfiles = async (token, whoCalledMe = 'getInactiveContactProfiles') => (
  getArrayEndpoint('GetInactiveContactProfiles', token, whoCalledMe)
);

export const getActiveContactProfilesWithoutCommunicationIdentity = async (token, whoCalledMe = 'getActiveContactProfilesWithoutCommunicationIdentity') => (
  getArrayEndpoint('GetActiveContactProfilesWithoutCommunicationIdentity', token, whoCalledMe)
);

export const toggleContactEmailOptOut = async (payload, token, whoCalledMe = 'toggleContactEmailOptOut') => {
  if (!token || !Array.isArray(payload) || payload.length === 0) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }

  return postJsonEndpoint('ToggleContactEmailOptOut', {
    p_payload: payload
  }, token, whoCalledMe, false);
};

export const toggleContactActive = async (payload, token, whoCalledMe = 'toggleContactActive') => {
  if (!token || !Array.isArray(payload) || payload.length === 0) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }

  return postJsonEndpoint('ToggleContactActive', {
    p_payload: payload
  }, token, whoCalledMe, false);
};

export const upsertEnrolleeList = async (enrollees, token, whoCalledMe = 'upsertEnrolleeList') => {
  const recordsToSubmit = Array.isArray(enrollees) ? enrollees : [];
  if (!token || recordsToSubmit.length === 0) {
    console.warn(`[${whoCalledMe}] Missing required params`);
    return false;
  }

  return postJsonEndpoint('UpsertEnrolleeList', {
    enrollees: recordsToSubmit
  }, token, whoCalledMe, false);
};

const TitulinoAdminAuthService = {
  getAllEnrollees,
  getUserRoles,
  getGlobalUserRole,
  upsertUserRoleGlobal,
  assignGlobalRole,
  upsertCourse,
  getAllUserLoginFootprint,
  getUserLoginFootprintByContact,
  getOptedOutActiveContactProfiles,
  getInactiveContactProfiles,
  getActiveContactProfilesWithoutCommunicationIdentity,
  getProcessLogEvents,
  getContactSegment,
  getContactSegmentCount,
  getContactSegmentMetadata,
  getContactCertificationHistory,
  detectPossibleDuplicateContacts,
  getContactMergeDashboard,
  previewContactMerge,
  mergeContacts,
  rollbackContactMerge,
  getCountryDivisions,
  toggleContactEmailOptOut,
  toggleContactActive,
  upsertEnrolleeList
};

export default TitulinoAdminAuthService;
