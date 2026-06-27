import TitulinoRestService from "services/TitulinoRestService";
import TitulinoNetService from "services/TitulinoNetService";
import TitulinoLrnAuthService from "services/Lrn/TitulinoLrnAuthService";
import TitulinoShopAuthService from "services/Shop/TitulinoShopAuthService";
import GoogleService from "services/GoogleService";
import LocalStorageService from "services/LocalStorageService";
import AdminInsights from "lob/AdminInsights";
import KnowMeProfiles from "lob/KnowMeProfiles";
import FacilitadorDashboard from "lob/FacilitadorDashboard";
import DashboardLayout from "lob/DashboardLayout";
import ShopAnalytics from "lob/ShopAnalytics";
import { env } from "configs/EnvironmentConfig";
import utils from 'utils';

// Use unified cache functions
const getCached = LocalStorageService.getCachedObject;
const setCached = LocalStorageService.setCachedObject;

const getUserProfileFromEmail = async (emailId) => {
  if (!emailId) return null;
  return LocalStorageService.getCachedObject(`UserProfile_${emailId}`);
};

const getKnowMeTokenFromUserProfile = (user, fallbackToken) => (
  user?.innerToken || fallbackToken || null
);

const getAdminAuthTokenFromUserProfile = (user) => (
  user?.innerToken || null
);

const getAdminAuthTokenByEmail = async (emailId, whoCalledMe) => {
  const user = await getUserProfileFromEmail(emailId);
  const token = getAdminAuthTokenFromUserProfile(user);

  if (!token) {
    console.warn(`No admin token found for ${whoCalledMe}`);
  }

  return token;
};

const normalizeContactProfileRows = (rows = []) => (
  (Array.isArray(rows) ? rows : []).map(row => ({
    ...row,
    LanguageProficienciesHistory: Array.isArray(row?.LanguageProficienciesHistory)
      ? row.LanguageProficienciesHistory
      : [],
    Emails: Array.isArray(row?.Emails) ? row.Emails : [],
    CoursesHistory: Array.isArray(row?.CoursesHistory) ? row.CoursesHistory : [],
    UserCourseRoles: Array.isArray(row?.UserCourseRoles) ? row.UserCourseRoles : [],
    ContactCourseTiers: Array.isArray(row?.ContactCourseTiers) ? row.ContactCourseTiers : []
  }))
);

const extractLocationScopedRows = (rowsOrGroupedRows, locationType) => {
  if (Array.isArray(rowsOrGroupedRows)) return rowsOrGroupedRows;

  const normalizedLocationType = String(locationType || '').toLowerCase();
  if (normalizedLocationType === 'residency') {
    return rowsOrGroupedRows?.Residency || rowsOrGroupedRows?.residency || [];
  }
  if (normalizedLocationType === 'birth') {
    return rowsOrGroupedRows?.Birth || rowsOrGroupedRows?.birth || [];
  }

  return [];
};

const firstDefined = (...values) => values.find(value => value !== undefined && value !== null);

const normalizeShopOverviewCountItems = (items) => (
  Array.isArray(items)
    ? items.map(item => ({
      ...item,
      Count: firstDefined(item?.Count, item?.PurchaserCount, item?.BuyerCount, item?.PurchaseCount, item?.TotalPurchasers, item?.TotalBuyers),
      EnrolleeCount: firstDefined(item?.EnrolleeCount, item?.PurchaserCount, item?.BuyerCount, item?.PurchaseCount, item?.Count),
      Sex: firstDefined(item?.Sex, item?.Gender, item?.sex, item?.gender),
      Percentage: firstDefined(item?.Percentage, item?.Percent, item?.percentage, item?.percent),
      AverageAge: firstDefined(item?.AverageAge, item?.AvgAge, item?.AgeAverage, item?.averageAge),
      AgeGroup: firstDefined(item?.AgeGroup, item?.AgeRange, item?.Label, item?.label),
      Status: firstDefined(item?.Status, item?.PurchaserStatus, item?.BuyerStatus, item?.Type, item?.type),
      LanguageLevelAbbreviation: firstDefined(item?.LanguageLevelAbbreviation, item?.LanguageLevelId, item?.LanguageLevel, item?.Level)
    }))
    : items
);

const normalizeShopPurchaserOverviewPayload = (overview) => {
  const source = Array.isArray(overview) ? overview[0] : overview;
  if (!source || typeof source !== "object") return overview;

  return {
    ...source,
    EnrolleesCount: firstDefined(
      source?.EnrolleesCount,
      source?.PurchasersCount,
      source?.PurchaserCount,
      source?.BuyersCount,
      source?.BuyerCount,
      source?.TotalPurchasers,
      source?.TotalBuyers,
      source?.TotalPurchases
    ),
    AgesAverageCount: firstDefined(source?.AgesAverageCount, source?.AverageAge, source?.AvgAge),
    AgesDistribution: normalizeShopOverviewCountItems(firstDefined(source?.AgesDistribution, source?.AgeDistribution)),
    GenderDistribution: normalizeShopOverviewCountItems(source?.GenderDistribution),
    AgesAverageBySexCount: normalizeShopOverviewCountItems(firstDefined(
      source?.AgesAverageBySexCount,
      source?.AverageAgeBySex,
      source?.AgesAverageByGenderCount
    )),
    EnrolleeTypeDistribution: normalizeShopOverviewCountItems(firstDefined(
      source?.EnrolleeTypeDistribution,
      source?.PurchaserTypeDistribution,
      source?.BuyerTypeDistribution
    )),
    EnrolleeLanguageProficiencyDistribution: normalizeShopOverviewCountItems(firstDefined(
      source?.EnrolleeLanguageProficiencyDistribution,
      source?.PurchaserLanguageProficiencyDistribution,
      source?.BuyerLanguageProficiencyDistribution
    ))
  };
};

export const getAllCourses = async () => {
  const key = `adminAllCourses`;
  const cached = await getCached(key);
  if (cached) return cached;

  const allCourses = await TitulinoRestService.getAllCourses("getAllCourses");
  const transformed = await AdminInsights.courseSelectionConverter(allCourses);
  await setCached(key, transformed, 60);
  return transformed;
};

export const getLocationTypesForInsights = async () => {
  const key = `locationTypes`;
  const cached = await getCached(key);
  if (cached) return cached;

  const raw = await TitulinoRestService.getLocationTypes("getLocationTypes");
  const transformed = await AdminInsights.locationTypeConverter(raw);
  await setCached(key, transformed, 90);
  return transformed;
};

export const getCountriesByLocationType = async (courseCodeId, locationType) => {
  const key = `locationType_${locationType}_${courseCodeId}`;
  const cached = await getCached(key);
  if (cached) return cached;

  const raw = await TitulinoRestService.getLocationTypeCountrySelection(courseCodeId, "getCountriesByLocationType");
  const transformed = await AdminInsights.countrySelectionConverter(locationType, raw);
  await setCached(key, transformed, 60);
  return transformed;
};

export const getOverviewInfoAdminDashboard = async (courseCodeId, locationType, countryId) => {
  const overview = await TitulinoRestService.getAdminDashboardDemographicEnrolleeOverview(
    courseCodeId,
    locationType,
    countryId,
    "getOverviewInfoAdminDashboard"
  );
  return await AdminInsights.overviewInfoConvertion(overview);
};

export const getCourseProgressOverviewInfoAdminDashboard = async (courseCodeId, locationType, countryId, emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);
  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);

  if (!token) {
    console.warn("No token found for course in getCourseProgressOverviewInfoAdminDashboard");
    return null;
  }

  const progressOverview = await TitulinoLrnAuthService.getCourseProgressDemographicOverview(
    courseCodeId,
    locationType,
    countryId,
    token,
    "getCourseProgressOverviewInfoAdminDashboard"
  );
  return await AdminInsights.overviewInfoConvertion(progressOverview);
};

export const getDemographicInfoAdminDashboard = async (courseCodeId, locationType, countryId) => {
  const isAll = locationType?.toLowerCase() === "all";

  const rawData = isAll
    ? await TitulinoRestService.getEnrolleeCountryCountByCourseCodeId(courseCodeId, "getDemographicInfoAdminDashboard")
    : await TitulinoRestService.getEnrolleeCountryDivisionCount(courseCodeId, countryId, "getDemographicInfoAdminDashboard");

  const transformedArrays = isAll
    ? await AdminInsights.transformEnrolleeGeneralDemographicData(rawData)
    : await AdminInsights.transformEnrolleeDivisionDemographicData(rawData);

  const mapType = (isAll || countryId === 'GI') ? "world" : countryId;
  const mapJson = await GoogleService.getGeoMapResource(isAll ? undefined : countryId, "getDemographicInfoAdminDashboard");

  return {
    transformedArrays,
    mapType,
    mapJson
  };
};

export const getCourseProgressDemographicInfoAdminDashboard = async (courseCodeId, locationType, countryId, emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);
  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);

  if (!token) {
    console.warn("No token found for course in getCourseProgressDemographicInfoAdminDashboard");
    return null;
  }

  const isAll = locationType?.toLowerCase() === "all";

  const rawData = isAll
    ? await TitulinoLrnAuthService.getCourseProgressCountryCount(courseCodeId, token, "getCourseProgressDemographicInfoAdminDashboard")
    : await TitulinoLrnAuthService.getCourseProgressCountryDivisionCount(courseCodeId, countryId, token, "getCourseProgressDemographicInfoAdminDashboard");

  const transformedArrays = isAll
    ? await AdminInsights.transformEnrolleeGeneralDemographicData(rawData)
    : await AdminInsights.transformEnrolleeDivisionDemographicData(rawData);

  const mapType = (isAll || countryId === 'GI') ? "world" : countryId;
  const mapJson = await GoogleService.getGeoMapResource(isAll ? undefined : countryId, "getCourseProgressDemographicInfoAdminDashboard");

  return {
    transformedArrays,
    mapType,
    mapJson
  };
};

export const getEnrolleeInfoAdminDashboard = async (courseCodeId, locationType, countryId, emailId) => {
  const isAll = locationType?.toLowerCase() === "all";

  const enrolleeList = isAll
    ? await TitulinoRestService.getEnrolleeGeneralListByCourseCodeId(courseCodeId, "getEnrolleeInfoAdminDashboard")
    : await TitulinoRestService.getEnrolleeCountrylListByCourseCodeId(courseCodeId, countryId, "getEnrolleeInfoAdminDashboard");

  let extracted = [];
  if (isAll) extracted = enrolleeList;
  else if (locationType?.toLowerCase() === "residency") extracted = enrolleeList?.Residency;
  else if (locationType?.toLowerCase() === "birth") extracted = enrolleeList?.Birth;

  return AdminInsights.handleEnrolleeListConvertor(extracted, locationType, courseCodeId);
};

export const getShopPurchaserOverviewInfoAdminDashboard = async (courseCodeId, locationType, countryId, emailId) => {
  const token = await getAdminAuthTokenByEmail(emailId, "getShopPurchaserOverviewInfoAdminDashboard");
  if (!token) return AdminInsights.overviewInfoConvertion({});

  const overview = await TitulinoShopAuthService.getAdminDashboardShopPurchaserOverview(
    courseCodeId,
    locationType,
    countryId,
    token,
    "getShopPurchaserOverviewInfoAdminDashboard"
  );
  const normalizedOverview = normalizeShopPurchaserOverviewPayload(overview);
  const convertedOverview = await AdminInsights.overviewInfoConvertion(normalizedOverview);

  if (env.ENVIROMENT !== "prod") {
    console.groupCollapsed("[AnalyticsManager] shop purchaser overview payload");
    console.log("params:", { courseCodeId, locationType, countryId });
    console.log("raw overview:", overview);
    console.log("normalized overview:", normalizedOverview);
    console.log("converted overview:", convertedOverview);
    console.groupEnd();
  }

  return convertedOverview;
};

export const getShopPurchaserDemographicInfoAdminDashboard = async (courseCodeId, locationType, countryId, emailId) => {
  const isAll = locationType?.toLowerCase() === "all";
  const token = await getAdminAuthTokenByEmail(emailId, "getShopPurchaserDemographicInfoAdminDashboard");
  if (!token) {
    return {
      transformedArrays: [],
      mapType: isAll ? "world" : countryId,
      mapJson: null
    };
  }

  const rawData = isAll
    ? await TitulinoShopAuthService.getShopPurchaserCountryCountByCourseCodeId(courseCodeId, token, "getShopPurchaserDemographicInfoAdminDashboard")
    : await TitulinoShopAuthService.getShopPurchaserCountryDivisionCount(courseCodeId, countryId, token, "getShopPurchaserDemographicInfoAdminDashboard");

  const transformedArrays = isAll
    ? await AdminInsights.transformEnrolleeGeneralDemographicData(rawData)
    : await AdminInsights.transformEnrolleeDivisionDemographicData(rawData);

  const mapType = (isAll || countryId === 'GI') ? "world" : countryId;
  const mapJson = await GoogleService.getGeoMapResource(isAll ? undefined : countryId, "getShopPurchaserDemographicInfoAdminDashboard");

  return {
    transformedArrays,
    mapType,
    mapJson
  };
};

export const getShopPurchaserInfoAdminDashboard = async (courseCodeId, locationType, countryId, emailId) => {
  const isAll = locationType?.toLowerCase() === "all";
  const token = await getAdminAuthTokenByEmail(emailId, "getShopPurchaserInfoAdminDashboard");
  if (!token) return { tableData: [], columns: [], enrollmentDates: [], purchaseDates: [] };

  const purchaserList = isAll
    ? await TitulinoShopAuthService.getShopPurchasersByCourse(courseCodeId, token, "getShopPurchaserInfoAdminDashboard")
    : await TitulinoShopAuthService.getShopPurchasersByCourseAndCountry(courseCodeId, countryId, token, "getShopPurchaserInfoAdminDashboard");

  const extracted = isAll ? purchaserList : extractLocationScopedRows(purchaserList, locationType);

  const normalizedRows = normalizeContactProfileRows(extracted);
  return ShopAnalytics.buildShopPurchaserTableModel(normalizedRows, {
    courseCodeId,
    locationType
  });
};

export const getEnrolleesCourseProgressAdminDashboard = async (courseCodeId, locationType, countryId, emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);
  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);

  if (!token) {
    console.warn("No token found for course");
    return { tableData: [], columns: [] };
  }

  const progressRows =
    await TitulinoLrnAuthService.getCourseProgress(
      courseCodeId,
      token,
      "getEnrolleesCourseProgressAdminDashboard"
    );

      // 3️⃣ Fetch enrollee list EXACTLY like getEnrolleeInfoAdminDashboard does
  const isAll = locationType?.toLowerCase() === "all";

  const enrolleeList = isAll
    ? await TitulinoRestService.getEnrolleeGeneralListByCourseCodeId(
        courseCodeId,
        "getEnrolleesCourseProgressAdminDashboard"
      )
    : await TitulinoRestService.getEnrolleeCountrylListByCourseCodeId(
        courseCodeId,
        countryId,
        "getEnrolleesCourseProgressAdminDashboard"
      );

  let extracted = [];

    if (isAll) extracted = enrolleeList;
    else if (locationType?.toLowerCase() === "residency")
      extracted = enrolleeList?.Residency;
    else if (locationType?.toLowerCase() === "birth")
      extracted = enrolleeList?.Birth;

    // Build progressMap
    const progressMap = progressRows?.reduce((acc, row) => {
      if (!acc[row.ContactInternalId]) acc[row.ContactInternalId] = [];
      acc[row.ContactInternalId].push(row);
      return acc;
    }, {}) ?? {};

    const courseConfiguration = await TitulinoRestService.getRequestedCourseStructureByCourseCodeId(courseCodeId);

    // 5️⃣ Build final table model    
    const result = await AdminInsights.handleEnrolleeProgressListConvertor(extracted, locationType, progressMap, courseConfiguration, courseCodeId);
    result.progressDates = progressRows?.map(r => r.CreatedAt).filter(Boolean) || [];
    return result;
};

export const getShopAnalyticsDashboard = async (emailId) => {
  const user = await getUserProfileFromEmail(emailId);
  const token = getAdminAuthTokenFromUserProfile(user);

  if (!token) {
    console.warn("No token found for shop analytics dashboard");
    return ShopAnalytics.buildShopAnalyticsDashboard();
  }

  const [
    summary,
    health,
    purchaseRows,
    activeProducts,
    languagePairSales,
    courseLeaderboard,
    repeatCustomers,
    customerLifetimeValue,
    recentlyActiveCustomers
  ] = await Promise.all([
    TitulinoShopAuthService.getAdminDashboardShopSummary(token, null, "getShopAnalyticsDashboard"),
    TitulinoShopAuthService.getShopDashboardHealth(token, "getShopAnalyticsDashboard"),
    TitulinoShopAuthService.searchShopPurchases("", 100, token, "getShopAnalyticsDashboard"),
    TitulinoShopAuthService.getAdminDashboardShopActiveProducts(token, "getShopAnalyticsDashboard"),
    TitulinoShopAuthService.getAdminDashboardShopSalesByLanguagePair(token, "getShopAnalyticsDashboard"),
    TitulinoShopAuthService.getAdminDashboardCoursePerformanceLeaderboard(10, token, "getShopAnalyticsDashboard"),
    TitulinoShopAuthService.getAdminDashboardShopRepeatCustomers(null, token, "getShopAnalyticsDashboard"),
    TitulinoShopAuthService.getAdminDashboardCustomerLifetimeValue(25, token, "getShopAnalyticsDashboard"),
    TitulinoShopAuthService.getAdminDashboardRecentlyActiveCustomers(30, 25, token, "getShopAnalyticsDashboard")
  ]);

  return ShopAnalytics.buildShopAnalyticsDashboard({
    summary,
    health,
    purchaseRows,
    activeProducts,
    languagePairSales,
    courseLeaderboard,
    repeatCustomers,
    customerLifetimeValue,
    recentlyActiveCustomers
  });
};

export const getFacilitadorEnrolleesCourseProgressDashboard = async (courseCodeId, emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);
  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);

  if (!token) {
    console.warn("No token found for course");
    return { tableData: [], columns: [] };
  }

  const progressRows =
    await TitulinoLrnAuthService.getCourseProgress(
      courseCodeId,
      token,
      "getFacilitadorEnrolleesCourseProgressDashboard"
    );

  const enrolleeList = await TitulinoRestService.getEnrolleeGeneralListByCourseCodeId(
    courseCodeId,
    "getFacilitadorEnrolleesCourseProgressDashboard"
  );

  // Normalize IDs if needed (e.g., trim, lowercase)
  const normalizeId = id => (typeof id === 'string' ? id.trim().toLowerCase() : id);

  const progressMap = progressRows?.reduce((acc, row) => {
    const normId = normalizeId(row.ContactInternalId);
    if (!acc[normId]) acc[normId] = [];
    acc[normId].push(row);
    return acc;
  }, {}) ?? {};

  // Also normalize enrollee ContactInternalId before passing to LOB
  const normalizedEnrolleeList = enrolleeList.map(e => ({
    ...e,
    ContactInternalId: normalizeId(e.ContactInternalId)
  }));

  const courseConfiguration = await TitulinoRestService.getRequestedCourseStructureByCourseCodeId(courseCodeId);

  const result = await AdminInsights.handleFacilitadorEnrolleeListConvertor(normalizedEnrolleeList, progressMap, courseConfiguration, courseCodeId);
  result.progressDates = progressRows?.map(r => r.CreatedAt).filter(Boolean) || [];
  return result;
};

export const hydrateAnalyticsAvatarUrls = async (
  emailId,
  tableModels = {},
  existingAvatarUrlMap = {}
) => {
  const user = await getUserProfileFromEmail(emailId);
  const token = getKnowMeTokenFromUserProfile(user);

  if (!token) {
    return {
      avatarUrlMap: existingAvatarUrlMap || {},
      tableModels
    };
  }

  const combinedItems = Object.values(tableModels || {}).flatMap((tableModel) => tableModel?.tableData || []);
  const fetchedAvatarUrlMap = await KnowMeProfiles.getMissingKnowMeProfileUrlMap(
    token,
    combinedItems,
    existingAvatarUrlMap,
    "hydrateAnalyticsAvatarUrls"
  );

  const nextAvatarUrlMap = {
    ...(existingAvatarUrlMap || {}),
    ...fetchedAvatarUrlMap
  };

  const nextTableModels = Object.entries(tableModels || {}).reduce((accumulator, [tableKey, tableModel]) => {
    accumulator[tableKey] = KnowMeProfiles.applyKnowMeProfileUrlMapToTableModel(
      tableModel,
      nextAvatarUrlMap
    );
    return accumulator;
  }, {});

  return {
    avatarUrlMap: nextAvatarUrlMap,
    tableModels: nextTableModels
  };
};

export const getFacilitadorOverviewCardOrder = async (emailId, courseCodeId, defaultCardOrder = []) => {
  const cacheKey = FacilitadorDashboard.getFacilitadorOverviewCardOrderCacheKey(emailId, courseCodeId);
  const savedOrder = await LocalStorageService.getCachedObject(cacheKey);

  return FacilitadorDashboard.normalizeFacilitadorOverviewCardOrder(savedOrder, defaultCardOrder);
};

export const saveFacilitadorOverviewCardOrder = async (emailId, courseCodeId, cardOrder = [], defaultCardOrder = []) => {
  const normalizedOrder = FacilitadorDashboard.normalizeFacilitadorOverviewCardOrder(cardOrder, defaultCardOrder);
  const cacheKey = FacilitadorDashboard.getFacilitadorOverviewCardOrderCacheKey(emailId, courseCodeId);

  await LocalStorageService.setCachedObject(
    cacheKey,
    normalizedOrder,
    FacilitadorDashboard.dashboardLayoutCacheMinutes
  );

  return normalizedOrder;
};

export const getAnalyticsDashboardCardOrder = async (dashboardKey, emailId, courseCodeId, defaultCardOrder = []) => {
  const cacheKey = DashboardLayout.getDashboardCardOrderCacheKey(dashboardKey, emailId, courseCodeId);
  const savedOrder = await LocalStorageService.getCachedObject(cacheKey);

  return DashboardLayout.normalizeDashboardCardOrder(savedOrder, defaultCardOrder);
};

export const saveAnalyticsDashboardCardOrder = async (dashboardKey, emailId, courseCodeId, cardOrder = [], defaultCardOrder = []) => {
  const normalizedOrder = DashboardLayout.normalizeDashboardCardOrder(cardOrder, defaultCardOrder);
  const cacheKey = DashboardLayout.getDashboardCardOrderCacheKey(dashboardKey, emailId, courseCodeId);

  await LocalStorageService.setCachedObject(
    cacheKey,
    normalizedOrder,
    DashboardLayout.dashboardLayoutCacheMinutes
  );

  return normalizedOrder;
};

const getEnrolleeKnowMeProfilePictureForCourse = async (emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;  
  const user = await LocalStorageService.getCachedObject(localStorageKey);

  if (!user?.contactInternalId) {
    console.warn("No contactInternalId found, skipping KnowMe upsert.");
    return null;
  }

  const profile = await TitulinoNetService.getContactEnrolleeKnowMeProfileImage(
    user?.innerToken,
    user?.emailId,
    user?.contactInternalId,
    "getEnrolleeKnowMeProfilePictureForCourse"
  );

  return  profile?.profileUrl ?? null;
}

const upsertAdminEnrolleeCourseProgress = async (progressRecords, courseCodeId, adminEmailId) => {
  try {
    const localStorageKey = `UserProfile_${adminEmailId}`;
    const adminUser = await LocalStorageService.getCachedObject(localStorageKey);
    const token = utils.getCourseTokenFromUserCourses(adminUser?.userCourses, courseCodeId);

  if (!token) {
    console.warn("No token found for course");
    return { tableData: [], columns: [] };
  }

    progressRecords = await TitulinoLrnAuthService.upsertCourseProgress(progressRecords, token, "upsertAdminEnrolleeCourseProgress");
    return progressRecords;  
  }
  catch (error) {
      console.error("Error upserting admin enrollee course progress:", error);
      throw error;
  }
}

export const getFacilitadorDrillDownDemographics = async (courseCodeId, countryId, emailId) => {
  const [generalDivisionData, progressDivisionData] = await Promise.all([
    getDemographicInfoAdminDashboard(courseCodeId, countryId, countryId),
    getCourseProgressDemographicInfoAdminDashboard(courseCodeId, countryId, countryId, emailId)
  ]);

  const mapJson = progressDivisionData?.mapJson || generalDivisionData?.mapJson;
  const generalDivisions = generalDivisionData?.transformedArrays?.transformedResidencyArray || [];
  const progressDivisions = progressDivisionData?.transformedArrays?.transformedResidencyArray || [];
  const progressNames = new Set(progressDivisions.map(d => d.name));
  const noProgressColor = '#B0BEC5';

  const mergedDivisions = generalDivisions.map(entry => {
    const hasProgress = progressNames.has(entry.name);
    const progressEntry = progressDivisions.find(p => p.name === entry.name);
    return {
      ...entry,
      color: hasProgress ? (progressEntry?.color || entry.color) : noProgressColor
    };
  });

  return { mapJson, mergedDivisions };
};

const AnalyticsManager = {
  getAllCourses,
  getLocationTypesForInsights,
  getCountriesByLocationType,
  getOverviewInfoAdminDashboard,
  getCourseProgressOverviewInfoAdminDashboard,
  getDemographicInfoAdminDashboard,
  getCourseProgressDemographicInfoAdminDashboard,
  getEnrolleeInfoAdminDashboard,
  getShopPurchaserOverviewInfoAdminDashboard,
  getShopPurchaserDemographicInfoAdminDashboard,
  getShopPurchaserInfoAdminDashboard,
  getEnrolleeKnowMeProfilePictureForCourse,
  getEnrolleesCourseProgressAdminDashboard,
  getShopAnalyticsDashboard,
  getFacilitadorEnrolleesCourseProgressDashboard,
  hydrateAnalyticsAvatarUrls,
  getFacilitadorOverviewCardOrder,
  saveFacilitadorOverviewCardOrder,
  getAnalyticsDashboardCardOrder,
  saveAnalyticsDashboardCardOrder,
  upsertAdminEnrolleeCourseProgress,
  getFacilitadorDrillDownDemographics
};

export default AnalyticsManager;
