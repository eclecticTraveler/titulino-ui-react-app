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

const postJsonEndpoint = async (endpointName, payload = {}, token, whoCalledMe = endpointName) => {
  if (!token || !endpointName) {
    console.warn(`[${whoCalledMe}] Missing token or endpointName`);
    return EMPTY_RESULT;
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
      return EMPTY_RESULT;
    }

    if (!responseText) return {};

    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  } catch (error) {
    console.error(`[${whoCalledMe}] Exception in ${endpointName}:`, error);
    return EMPTY_RESULT;
  }
};

const normalizeShopCourseCodeId = (courseCodeId) => {
  if (courseCodeId === null || courseCodeId === undefined) return null;
  const normalizedCourseCodeId = String(courseCodeId).trim();
  return !normalizedCourseCodeId || normalizedCourseCodeId.toLowerCase() === 'all'
    ? null
    : normalizedCourseCodeId;
};

const buildShopCoursePayload = (courseCodeId) => ({
  p_coursecodeid: normalizeShopCourseCodeId(courseCodeId)
});

const normalizeShopDate = (dateValue) => (
  dateValue ? String(dateValue) : null
);

const buildShopDashboardFilterPayload = (courseCodeId, startDate = null, endDate = null) => ({
  p_coursecodeid: normalizeShopCourseCodeId(courseCodeId),
  p_startdate: normalizeShopDate(startDate),
  p_enddate: normalizeShopDate(endDate)
});

export const getShopCoursesWithPurchases = async (token, whoCalledMe = 'getShopCoursesWithPurchases') => (
  postJsonEndpoint('GetShopCoursesWithPurchases', {}, token, whoCalledMe)
);

export const getAdminDashboardShopSummary = async (
  token,
  courseCodeId = null,
  startDate = null,
  endDate = null,
  whoCalledMe = 'getAdminDashboardShopSummary'
) => (
  postJsonEndpoint('GetAdminDashboardShopSummary', buildShopDashboardFilterPayload(courseCodeId, startDate, endDate), token, whoCalledMe)
);

export const getShopDashboardHealth = async (token, whoCalledMe = 'getShopDashboardHealth') => (
  postJsonEndpoint('GetShopDashboardHealth', {}, token, whoCalledMe)
);

export const getAdminDashboardShopRevenueByTier = async (
  token,
  courseCodeId = null,
  startDate = null,
  endDate = null,
  whoCalledMe = 'getAdminDashboardShopRevenueByTier'
) => (
  postJsonEndpoint('GetAdminDashboardShopRevenueByTier', buildShopDashboardFilterPayload(courseCodeId, startDate, endDate), token, whoCalledMe)
);

export const getAdminDashboardShopMonthlyRevenue = async (
  token,
  courseCodeId = null,
  startDate = null,
  endDate = null,
  whoCalledMe = 'getAdminDashboardShopMonthlyRevenue'
) => (
  postJsonEndpoint('GetAdminDashboardShopMonthlyRevenue', buildShopDashboardFilterPayload(courseCodeId, startDate, endDate), token, whoCalledMe)
);

export const getAdminDashboardShopDailySales = async (
  days = 30,
  token,
  courseCodeId = null,
  startDate = null,
  endDate = null,
  whoCalledMe = 'getAdminDashboardShopDailySales'
) => (
  postJsonEndpoint('GetAdminDashboardShopDailySales', {
    p_days: days,
    ...buildShopDashboardFilterPayload(courseCodeId, startDate, endDate)
  }, token, whoCalledMe)
);

export const getAdminDashboardShopSalesByDateRange = async (startDate, endDate, token, whoCalledMe = 'getAdminDashboardShopSalesByDateRange') => (
  postJsonEndpoint('GetAdminDashboardShopSalesByDateRange', {
    p_startdate: startDate,
    p_enddate: endDate
  }, token, whoCalledMe)
);

export const getAdminDashboardShopRefundAnalytics = async (
  token,
  courseCodeId = null,
  startDate = null,
  endDate = null,
  whoCalledMe = 'getAdminDashboardShopRefundAnalytics'
) => (
  postJsonEndpoint('GetAdminDashboardShopRefundAnalytics', buildShopDashboardFilterPayload(courseCodeId, startDate, endDate), token, whoCalledMe)
);

export const getAdminDashboardShopConversionMetrics = async (
  token,
  courseCodeId = null,
  startDate = null,
  endDate = null,
  whoCalledMe = 'getAdminDashboardShopConversionMetrics'
) => (
  postJsonEndpoint('GetAdminDashboardShopConversionMetrics', buildShopDashboardFilterPayload(courseCodeId, startDate, endDate), token, whoCalledMe)
);

export const getAdminDashboardCustomerLifetimeValue = async (limit = 25, token, whoCalledMe = 'getAdminDashboardCustomerLifetimeValue') => (
  postJsonEndpoint('GetAdminDashboardCustomerLifetimeValue', {
    p_limit: limit
  }, token, whoCalledMe)
);

export const getAdminDashboardShopRepeatCustomers = async (days = null, token, whoCalledMe = 'getAdminDashboardShopRepeatCustomers') => (
  postJsonEndpoint('GetAdminDashboardShopRepeatCustomers', {
    p_days: days
  }, token, whoCalledMe)
);

export const getAdminDashboardRecentlyActiveCustomers = async (days = 30, limit = 25, token, whoCalledMe = 'getAdminDashboardRecentlyActiveCustomers') => (
  postJsonEndpoint('GetAdminDashboardRecentlyActiveCustomers', {
    p_days: days,
    p_limit: limit
  }, token, whoCalledMe)
);

export const getAdminDashboardCustomerCohorts = async (token, whoCalledMe = 'getAdminDashboardCustomerCohorts') => (
  postJsonEndpoint('GetAdminDashboardCustomerCohorts', {}, token, whoCalledMe)
);

export const searchShopPurchases = async (searchText = '', limit = 100, token, whoCalledMe = 'searchShopPurchases') => (
  postJsonEndpoint('SearchShopPurchases', {
    p_search: searchText || '',
    p_limit: limit
  }, token, whoCalledMe)
);

export const getAdminDashboardCoursePerformanceLeaderboard = async (limit = 10, token, whoCalledMe = 'getAdminDashboardCoursePerformanceLeaderboard') => (
  postJsonEndpoint('GetAdminDashboardCoursePerformanceLeaderboard', {
    p_limit: limit
  }, token, whoCalledMe)
);

export const getShopProductsByCourse = async (courseCodeId, token, whoCalledMe = 'getShopProductsByCourse') => (
  postJsonEndpoint('GetShopProductsByCourse', buildShopCoursePayload(courseCodeId), token, whoCalledMe)
);

export const getShopProductsByTier = async (tierId, token, whoCalledMe = 'getShopProductsByTier') => (
  postJsonEndpoint('GetShopProductsByTier', {
    p_tierid: tierId
  }, token, whoCalledMe)
);

export const getAdminDashboardShopActiveProducts = async (token, whoCalledMe = 'getAdminDashboardShopActiveProducts') => (
  postJsonEndpoint('GetAdminDashboardShopActiveProducts', {}, token, whoCalledMe)
);

export const getAdminDashboardShopSalesByLanguagePair = async (token, whoCalledMe = 'getAdminDashboardShopSalesByLanguagePair') => (
  postJsonEndpoint('GetAdminDashboardShopSalesByLanguagePair', {}, token, whoCalledMe)
);

export const getAdminDashboardShopPurchaserOverview = async (
  courseCodeId,
  locationType,
  countryId,
  token,
  whoCalledMe = 'getAdminDashboardShopPurchaserOverview'
) => (
  postJsonEndpoint('GetAdminDashboardShopPurchaserOverview', {
    p_locationtype: locationType,
    p_countrynameorid: countryId,
    p_coursecodeid: normalizeShopCourseCodeId(courseCodeId)
  }, token, whoCalledMe)
);

export const getShopPurchaserCountryCountByCourseCodeId = async (
  courseCodeId,
  token,
  whoCalledMe = 'getShopPurchaserCountryCountByCourseCodeId'
) => (
  postJsonEndpoint('GetShopPurchaserCountryCountByCourseCodeId', buildShopCoursePayload(courseCodeId), token, whoCalledMe)
);

export const getShopPurchaserCountryDivisionCount = async (
  courseCodeId,
  countryId,
  token,
  whoCalledMe = 'getShopPurchaserCountryDivisionCount'
) => (
  postJsonEndpoint('GetShopPurchaserCountryDivisionCount', {
    p_coursecodeid: normalizeShopCourseCodeId(courseCodeId),
    p_countrynameorid: countryId
  }, token, whoCalledMe)
);

export const getShopPurchasersByCourse = async (courseCodeId, token, whoCalledMe = 'getShopPurchasersByCourse') => (
  postJsonEndpoint('GetShopPurchasersByCourse', buildShopCoursePayload(courseCodeId), token, whoCalledMe)
);

export const getShopPurchasersByCourseAndCountry = async (
  courseCodeId,
  countryId,
  token,
  whoCalledMe = 'getShopPurchasersByCourseAndCountry'
) => (
  postJsonEndpoint('GetShopPurchasersByCourseAndCountry', {
    p_coursecodeid: normalizeShopCourseCodeId(courseCodeId),
    p_countrynameorid: countryId
  }, token, whoCalledMe)
);

export const getShopPurchaseHistoryByContacts = async (
  contactInternalIds = [],
  token,
  whoCalledMe = 'getShopPurchaseHistoryByContacts'
) => {
  const normalizedContactInternalIds = Array.from(new Set(
    (Array.isArray(contactInternalIds) ? contactInternalIds : [contactInternalIds])
      .map(contactInternalId => String(contactInternalId || '').trim())
      .filter(Boolean)
  ));

  if (!normalizedContactInternalIds.length) return EMPTY_RESULT;

  const payloadCandidates = [
    { p_contact_ids: normalizedContactInternalIds },
    { p_contact_internal_ids: normalizedContactInternalIds },
    { p_contactinternalids: normalizedContactInternalIds }
  ];

  let fallbackResult = EMPTY_RESULT;
  for (const payload of payloadCandidates) {
    // The backend function accepts a uuid[] argument; deployed names can vary
    // slightly while the SQL call remains positional.
    // Stop at the first payload that returns useful data.
    // eslint-disable-next-line no-await-in-loop
    const result = await postJsonEndpoint('GetShopPurchaseHistoryByContacts', payload, token, whoCalledMe);
    fallbackResult = result;
    if (Array.isArray(result) && result.length > 0) return result;
    if (!Array.isArray(result) && result && Object.keys(result).length > 0) return result;
  }

  return fallbackResult;
};

export const getExportSalesReport = async (startDate, endDate, token, whoCalledMe = 'getExportSalesReport') => (
  postJsonEndpoint('GetExportSalesReport', {
    p_startdate: startDate,
    p_enddate: endDate
  }, token, whoCalledMe)
);

export const upsertProductCourseTier = async (payload, token, whoCalledMe = 'upsertProductCourseTier') => (
  postJsonEndpoint('UpsertProductCourseTier', {
    p_payload: payload
  }, token, whoCalledMe)
);

export const toggleShopProductActive = async (paymentProviderPriceId, isActive, token, whoCalledMe = 'toggleShopProductActive') => (
  postJsonEndpoint('ToggleShopProductActive', {
    p_paymentproviderpriceid: paymentProviderPriceId,
    p_isactive: isActive
  }, token, whoCalledMe)
);

const TitulinoShopAuthService = {
  getShopCoursesWithPurchases,
  getAdminDashboardShopSummary,
  getShopDashboardHealth,
  getAdminDashboardShopRevenueByTier,
  getAdminDashboardShopMonthlyRevenue,
  getAdminDashboardShopDailySales,
  getAdminDashboardShopSalesByDateRange,
  getAdminDashboardShopRefundAnalytics,
  getAdminDashboardShopConversionMetrics,
  getAdminDashboardCustomerLifetimeValue,
  getAdminDashboardShopRepeatCustomers,
  getAdminDashboardRecentlyActiveCustomers,
  getAdminDashboardCustomerCohorts,
  searchShopPurchases,
  getAdminDashboardCoursePerformanceLeaderboard,
  getShopProductsByCourse,
  getShopProductsByTier,
  getAdminDashboardShopActiveProducts,
  getAdminDashboardShopSalesByLanguagePair,
  getAdminDashboardShopPurchaserOverview,
  getShopPurchaserCountryCountByCourseCodeId,
  getShopPurchaserCountryDivisionCount,
  getShopPurchasersByCourse,
  getShopPurchasersByCourseAndCountry,
  getShopPurchaseHistoryByContacts,
  getExportSalesReport,
  upsertProductCourseTier,
  toggleShopProductActive
};

export default TitulinoShopAuthService;
