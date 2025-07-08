import LocalStorageService from "services/LocalStorageService";
import TitulinoRestService from "services/TitulinoRestService";
import TitulinoNetService from "services/TitulinoNetService";
import GoogleService from "services/GoogleService";
import AdminInsights from "lob/AdminInsights";

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

const AnalyticsManager = {
  getAllCourses,
  getLocationTypesForInsights,
  getCountriesByLocationType,
  getOverviewInfoAdminDashboard,
  getDemographicInfoAdminDashboard,
  getEnrolleeInfoAdminDashboard
};

export default AnalyticsManager;
