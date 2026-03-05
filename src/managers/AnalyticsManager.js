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

export const getProgressDemographicInfoAdminDashboard = async (courseCodeId, locationType, countryId) => {
  return getDemographicInfoAdminDashboard(courseCodeId, locationType, countryId);
};

export const getEnrolleeInfoAdminDashboard = async (courseCodeId, locationType, countryId) => {
  const isAll = locationType?.toLowerCase() === "all";

  const enrolleeList = isAll
    ? await TitulinoRestService.getEnrolleeGeneralListByCourseCodeId(courseCodeId, "getEnrolleeInfoAdminDashboard")
    : await TitulinoRestService.getEnrolleeCountrylListByCourseCodeId(courseCodeId, countryId, "getEnrolleeInfoAdminDashboard");

  let extracted = [];
  if (isAll) extracted = enrolleeList;
  else if (locationType?.toLowerCase() === "residency") extracted = enrolleeList?.Residency;
  else if (locationType?.toLowerCase() === "birth") extracted = enrolleeList?.Birth;

  return await AdminInsights.handleEnrolleeListConvertor(extracted, locationType);
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
    return AdminInsights.handleEnrolleeProgressListConvertor(extracted, locationType, progressMap, courseConfiguration, courseCodeId);
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
