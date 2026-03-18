import LocalStorageService from "services/LocalStorageService";
import TitulinoRestService from "services/TitulinoRestService";
import TitulinoNetService from "services/TitulinoNetService";
import TitulinoAuthService from "services/TitulinoAuthService";
import GoogleService from "services/GoogleService";
import AdminInsights from "lob/AdminInsights";
import LrnConfiguration from "lob/LrnConfiguration";
import utils from 'utils';

// Use unified cache functions
const getCached = LocalStorageService.getCachedObject;
const setCached = LocalStorageService.setCachedObject;

const normalizeLocationType = (locationType) =>
  `${locationType ?? ""}`.trim().toLowerCase();

const extractEnrolleeRowsByLocation = (enrolleePayload, locationType) => {
  if (Array.isArray(enrolleePayload)) {
    return enrolleePayload;
  }

  if (!enrolleePayload || typeof enrolleePayload !== "object") {
    return [];
  }

  const normalizedLocationType = normalizeLocationType(locationType);
  const tryArray = (value) => (Array.isArray(value) ? value : []);

  if (normalizedLocationType === "residency") {
    return tryArray(enrolleePayload?.Residency ?? enrolleePayload?.residency);
  }

  if (normalizedLocationType === "birth") {
    return tryArray(enrolleePayload?.Birth ?? enrolleePayload?.birth);
  }

  if (normalizedLocationType === "all") {
    const preferred =
      enrolleePayload?.All ??
      enrolleePayload?.all ??
      enrolleePayload?.Residency ??
      enrolleePayload?.residency ??
      enrolleePayload?.Birth ??
      enrolleePayload?.birth;

    if (Array.isArray(preferred)) {
      return preferred;
    }
  }

  const firstArrayMatch = Object.values(enrolleePayload).find(Array.isArray);
  return Array.isArray(firstArrayMatch) ? firstArrayMatch : [];
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

export const getProgressOverviewInfoAdminDashboard = async (courseCodeId, locationType, countryId) => {
  const progressOverview = await TitulinoRestService.getAdminDashboardProgressOverview(
    courseCodeId,
    locationType,
    countryId,
    "getProgressOverviewInfoAdminDashboard"
  );
  return await AdminInsights.overviewInfoConvertion(progressOverview);
};

export const getDemographicInfoAdminDashboard = async (courseCodeId, locationType, countryId) => {
  const normalizedLocationType = normalizeLocationType(locationType);
  const isAll = normalizedLocationType === "all";

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

export const getProgressDemographicInfoAdminDashboard = async (courseCodeId, locationType, countryId) => {
  return getDemographicInfoAdminDashboard(courseCodeId, locationType, countryId);
};

export const getEnrolleeInfoAdminDashboard = async (courseCodeId, locationType, countryId) => {
  const normalizedLocationType = normalizeLocationType(locationType);
  const isAll = normalizedLocationType === "all";

  const enrolleeList = isAll
    ? await TitulinoRestService.getEnrolleeGeneralListByCourseCodeId(courseCodeId, "getEnrolleeInfoAdminDashboard")
    : await TitulinoRestService.getEnrolleeCountrylListByCourseCodeId(courseCodeId, countryId, "getEnrolleeInfoAdminDashboard");

  const extracted = extractEnrolleeRowsByLocation(enrolleeList, normalizedLocationType);
  console.log("[InsightsDebug][Manager][EnrolleeList]", {
    courseCodeId,
    locationType,
    normalizedLocationType,
    countryId,
    isAll,
    enrolleeListType: Array.isArray(enrolleeList) ? "array" : typeof enrolleeList,
    enrolleeListKeys: enrolleeList && typeof enrolleeList === "object" ? Object.keys(enrolleeList) : [],
    extractedLength: Array.isArray(extracted) ? extracted.length : -1
  });

  return await AdminInsights.handleEnrolleeListConvertor(extracted, normalizedLocationType);
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
    await TitulinoAuthService.getCourseProgress(
      courseCodeId,
      token,
      "getEnrolleesCourseProgressAdminDashboard"
    );

    console.log("Fetched course progress rows:", progressRows);

      // 3️⃣ Fetch enrollee list EXACTLY like getEnrolleeInfoAdminDashboard does
  const normalizedLocationType = normalizeLocationType(locationType);
  const isAll = normalizedLocationType === "all";

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

  const extracted = extractEnrolleeRowsByLocation(enrolleeList, normalizedLocationType);
  console.log("[InsightsDebug][Manager][ProgressList]", {
    courseCodeId,
    locationType,
    normalizedLocationType,
    countryId,
    isAll,
    progressRowsLength: Array.isArray(progressRows) ? progressRows.length : -1,
    enrolleeListType: Array.isArray(enrolleeList) ? "array" : typeof enrolleeList,
    enrolleeListKeys: enrolleeList && typeof enrolleeList === "object" ? Object.keys(enrolleeList) : [],
    extractedLength: Array.isArray(extracted) ? extracted.length : -1
  });

    // Build progressMap
    const progressMap = progressRows?.reduce((acc, row) => {
      if (!acc[row.ContactInternalId]) acc[row.ContactInternalId] = [];
      acc[row.ContactInternalId].push(row);
      return acc;
    }, {}) ?? {};

    const courseConfiguration = await TitulinoRestService.getRequestedCourseStructureByCourseCodeId(courseCodeId);

    // 5️⃣ Build final table model    
    var finalTableData = await AdminInsights.handleEnrolleeProgressListConvertor(
      extracted,
      normalizedLocationType,
      progressMap,
      courseConfiguration,
      courseCodeId
    );

    console.log("finalTableData after conversion:", finalTableData);
    return finalTableData;
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

    progressRecords = await TitulinoAuthService.upsertCourseProgress(progressRecords, token, "upsertAdminEnrolleeCourseProgress");
    return progressRecords;  
  }
  catch (error) {
      console.error("Error upserting admin enrollee course progress:", error);
      throw error;
  }
}

const AnalyticsManager = {
  getAllCourses,
  getLocationTypesForInsights,
  getCountriesByLocationType,
  getOverviewInfoAdminDashboard,
  getProgressOverviewInfoAdminDashboard,
  getDemographicInfoAdminDashboard,
  getProgressDemographicInfoAdminDashboard,
  getEnrolleeInfoAdminDashboard,
  getEnrolleeKnowMeProfilePictureForCourse,
  getEnrolleesCourseProgressAdminDashboard,
  upsertAdminEnrolleeCourseProgress
};

export default AnalyticsManager;
