import TitulinoRestService from "services/TitulinoRestService";
import TitulinoNetService from "services/TitulinoNetService";
import TitulinoAuthService from "services/TitulinoAuthService";
import GoogleService from "services/GoogleService";
import LocalStorageService from "services/LocalStorageService";
import AdminInsights from "lob/AdminInsights";
import KnowMeProfiles from "lob/KnowMeProfiles";
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

  const progressOverview = await TitulinoAuthService.getCourseProgressDemographicOverview(
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
    ? await TitulinoAuthService.getCourseProgressCountryCount(courseCodeId, token, "getCourseProgressDemographicInfoAdminDashboard")
    : await TitulinoAuthService.getCourseProgressCountryDivisionCount(courseCodeId, countryId, token, "getCourseProgressDemographicInfoAdminDashboard");

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

export const getFacilitadorEnrolleesCourseProgressDashboard = async (courseCodeId, emailId) => {
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
  getEnrolleeKnowMeProfilePictureForCourse,
  getEnrolleesCourseProgressAdminDashboard,
  getFacilitadorEnrolleesCourseProgressDashboard,
  hydrateAnalyticsAvatarUrls,
  upsertAdminEnrolleeCourseProgress,
  getFacilitadorDrillDownDemographics
};

export default AnalyticsManager;
