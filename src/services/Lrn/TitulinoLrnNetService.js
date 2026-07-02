import { env } from 'configs/EnvironmentConfig';

const titulinoNetLrnApiUri = `${env.TITULINO_NET_API}/v1/lrn`;

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
  } catch (error) {
    return { raw: text };
  }
};

export const getWebsitePreferences = async (token, whoCalledMe = 'getWebsitePreferences') => {
  if (!token) {
    return { success: false, exists: false, status: 401, preferences: null };
  }

  const url = `${titulinoNetLrnApiUri}/preferences`;

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
        exists: false,
        status: response.status,
        errorMessage: result?.message || result?.error || result?.raw || response.statusText,
        preferences: null
      };
    }

    return {
      ...result,
      success: true,
      exists: result?.exists === true,
      preferences: result?.preferences || null,
      status: response.status
    };
  } catch (error) {
    if (env.ENVIROMENT !== 'prod') {
      console.error(`[TitulinoLrnNetService.getWebsitePreferences] ${whoCalledMe}`, error);
    }
    return {
      success: false,
      exists: false,
      status: 500,
      errorMessage: error?.message || 'Unable to get website preferences.',
      preferences: null
    };
  }
};

export const putWebsitePreferences = async (token, preferences, whoCalledMe = 'putWebsitePreferences') => {
  if (!token) {
    return { success: false, status: 401, errorMessage: 'Missing token.' };
  }

  const url = `${titulinoNetLrnApiUri}/preferences`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(preferences || {}),
      redirect: 'follow'
    });
    const result = await parseJsonResponse(response);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        errorMessage: result?.message || result?.error || result?.raw || response.statusText
      };
    }

    return {
      ...result,
      success: true,
      status: response.status
    };
  } catch (error) {
    if (env.ENVIROMENT !== 'prod') {
      console.error(`[TitulinoLrnNetService.putWebsitePreferences] ${whoCalledMe}`, error);
    }
    return {
      success: false,
      status: 500,
      errorMessage: error?.message || 'Unable to save website preferences.'
    };
  }
};

export const getKnowMeAiResult = async (token, courseCodeId, classNumber, whoCalledMe = 'getKnowMeAiResult') => {
  if (!token) {
    return { success: false, status: 401, errorMessage: 'Missing token.' };
  }

  const url = `${titulinoNetLrnApiUri}/know-me/ai-result?courseCodeId=${encodeURIComponent(courseCodeId)}&classNumber=${classNumber}`;

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
        errorMessage: result?.message || result?.error || result?.raw || response.statusText
      };
    }

    return {
      success: true,
      status: response.status,
      aiStatus: result?.status ?? 'not_found',
      originalEssays: result?.originalEssays ?? null,
      correctedEssays: result?.correctedEssays ?? null,
      feedback: result?.feedback ?? null,
      errorMessage: result?.errorMessage ?? null
    };
  } catch (error) {
    if (env.ENVIROMENT !== 'prod') {
      console.error(`[TitulinoLrnNetService.getKnowMeAiResult] ${whoCalledMe}`, error);
    }
    return {
      success: false,
      status: 500,
      errorMessage: error?.message || 'Unable to fetch AI result.'
    };
  }
};

const TitulinoLrnNetService = {
  getWebsitePreferences,
  putWebsitePreferences,
  getKnowMeAiResult
};

export default TitulinoLrnNetService;
