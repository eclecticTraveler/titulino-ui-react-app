import { env } from 'configs/EnvironmentConfig';

const titulinoNetEnrollmentApiUri = `${env.TITULINO_NET_API}/v1/enrollment`;

const getHeaders = (token) => {
  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  headers.append('TITULINO-COM-API-KEY', process.env.REACT_APP_BACKEND_NET_TITULINO_API_KEY);
  headers.append('Content-Type', 'application/json');
  return headers;
};

const parseJsonResponse = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

export const getCourseFacilitators = async (token, whoCalledMe = 'getCourseFacilitators') => {
  if (!token) {
    return { success: false, status: 401, errorMessage: 'Missing token.', entries: [] };
  }

  const url = `${titulinoNetEnrollmentApiUri}/facilitators`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token),
      redirect: 'follow'
    });
    const result = await parseJsonResponse(response);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        errorMessage: result?.message || result?.error || result?.raw || response.statusText,
        entries: []
      };
    }

    return {
      success: true,
      status: response.status,
      entries: Array.isArray(result) ? result : []
    };
  } catch (error) {
    if (env.ENVIROMENT !== 'prod') {
      console.error(`[TitulinoAdminNetService.getCourseFacilitators] ${whoCalledMe}`, error);
    }
    return {
      success: false,
      status: 500,
      errorMessage: error?.message || 'Unable to fetch course facilitators.',
      entries: []
    };
  }
};

const TitulinoAdminNetService = {
  getCourseFacilitators
};

export default TitulinoAdminNetService;
