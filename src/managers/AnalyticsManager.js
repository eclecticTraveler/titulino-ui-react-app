import LocalStorageService from "services/LocalStorageService";
import TitulinoRestService from "services/TitulinoRestService";
import TitulinoNetService from "services/TitulinoNetService";
import GoogleService from "services/GoogleService";
import AdminInsights from "lob/AdminInsights";
// import GeoMapService from "services/GeoMapService";

export const getAllCourses = async() => {
  const localStorageKey = `adminAllCourses`;
  const cachedData = await LocalStorageService.getLocalStorageObjectWithExpiry(localStorageKey);
  if (cachedData) {
    return cachedData;
  }

  const allCourses = await TitulinoRestService.getAllCourses("getAllCourses");
  const transformedCourses = await AdminInsights.courseSelectionConverter(allCourses);
  await LocalStorageService.setEnrolleesByCourse(
    transformedCourses, // Save both and set 60 min expiration     
    localStorageKey,
    60
  );
  
  return transformedCourses;
}

export const getLocationTypesForInsights = async() => {
  const localStorageKey = `locationTypes`;
  const cachedData = await LocalStorageService.getLocalStorageObjectWithExpiry(localStorageKey);
  if (cachedData) {
    return cachedData;
  }

  const locationCategories = await TitulinoRestService.getLocationTypes("getLocationTypes");
  const transformedCategories = await AdminInsights.locationTypeConverter(locationCategories);
  await LocalStorageService.setEnrolleesByCourse(
    transformedCategories, // Save both and set 60 min expiration     
    localStorageKey,
    90
  );
  
  return transformedCategories;
}

export const getCountriesByLocationType = async(courseCodeId, locationType) => {
  const localStorageKey = `locationType_${locationType}_${courseCodeId}`;
  const cachedData = await LocalStorageService.getLocalStorageObjectWithExpiry(localStorageKey);
  if (cachedData) {
    return cachedData;
  }

  const locationCategories = await TitulinoRestService.getLocationTypeCountrySelection(courseCodeId, "getCountriesByLocationType");
  const transformed = await AdminInsights.countrySelectionConverter(locationType, locationCategories);
  await LocalStorageService.setEnrolleesByCourse(
    transformed, //set 60 min expiration     
    localStorageKey,
    0
  );
  
  return transformed;
}

export const getOverviewInfoAdminDashboard = async (courseCodeId, locationType, countryId) => {
  const overview = await TitulinoRestService.getAdminDashboardDemographicEnrolleeOverview(
    courseCodeId, 
    locationType, 
    countryId, 
    "getOverviewInfoAdminDashboard"
  );
  const transformed = await AdminInsights.overviewInfoConvertion(overview);

  return transformed;
};

export const getDemographicInfoAdminDashboard = async (courseCodeId, locationType, countryId) => {
  const isAllLocation = locationType?.toLowerCase() === "all";

  const regionData = isAllLocation
    ? await TitulinoRestService.getEnrolleeCountryCountByCourseCodeId(courseCodeId, "getDemographicInfoAdminDashboard")
    : await TitulinoRestService.getEnrolleeCountryDivisionCount(courseCodeId, countryId, "getDemographicInfoAdminDashboard");

  const transformedArrays = isAllLocation
    ? await AdminInsights.transformEnrolleeGeneralDemographicData(regionData)
    : await AdminInsights.transformEnrolleeDivisionDemographicData(regionData);

  const mapType = (isAllLocation || countryId === 'GI') ? "world" : countryId;
  // const mapJson = await GeoMapService.getJsonGeoMap(isAllLocation ? undefined : countryId);
  const mapJson = await GoogleService.getGeoMapResource(isAllLocation ? undefined : countryId, "getDemographicInfoAdminDashboard");
  console.log("mapJson", mapJson)

  return {
    transformedArrays,
    mapType,
    mapJson
  };
};

export const getEnrolleeInfoAdminDashboard = async (courseCodeId, locationType, countryId) => {
  const isAllLocation = locationType?.toLowerCase() === "all";

  const enrolleeList = isAllLocation
    ? await TitulinoRestService.getEnrolleeGeneralListByCourseCodeId(courseCodeId, "getEnrolleeInfoAdminDashboard")
    : await TitulinoRestService.getEnrolleeCountrylListByCourseCodeId(courseCodeId, countryId, "getEnrolleeInfoAdminDashboard");

  const transformedArrays = isAllLocation
    ? await AdminInsights.enrolleeListConvertor(enrolleeList)
    : await AdminInsights.enrolleeListConvertor(enrolleeList);

  return transformedArrays;
};


const AnalyticsManager = {
  getAllCourses,
  getLocationTypesForInsights,
  getCountriesByLocationType,
  getOverviewInfoAdminDashboard,
  getEnrolleeInfoAdminDashboard,
  getDemographicInfoAdminDashboard
};

export default AnalyticsManager;
