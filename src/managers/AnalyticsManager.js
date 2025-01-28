import LocalStorageService from "services/LocalStorageService";
import TitulinoRestService from "services/TitulinoRestService";
import TitulinoNetService from "services/TitulinoNetService";
import AdminInsights from "lob/AdminInsights";

export const getAllCourses = async() => {
  const localStorageKey = `adminAllCourses`;
  const cachedData = await LocalStorageService.getLocalStorageObjectWithExpiry(localStorageKey);
  if (cachedData) {
    return cachedData;
  }

  const allCourses = await TitulinoRestService.getAllCourses("getAllCourses");
  const transformedCourses = await AdminInsights.CourseSelectionConverter(allCourses);
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
  const transformedCategories = await AdminInsights.LocationTypeConverter(locationCategories);
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
  const transformed = await AdminInsights.CountrySelectionConverter(locationType, locationCategories);
  await LocalStorageService.setEnrolleesByCourse(
    transformed, //set 60 min expiration     
    localStorageKey,
    0
  );
  
  return transformed;
}

export const getOverviewInfoAdminDashboard = async (courseCodeId, locationType, countryId) => {
  const capitalizedLocationType = CapitalizeFirstLetter(locationType);
  const overview = await TitulinoRestService.getAdminDashboardDemographicEnrolleeOverview(
    courseCodeId, 
    capitalizedLocationType, 
    countryId, 
    "getOverviewInfoAdminDashboard"
  );
  const transformed = await AdminInsights.OverviewInfoConvertion(overview);

  return transformed;
};

export const getEnrolleeInfoAdminDashboard = async(courseCodeId, locationType) => {
  const locationCategories = await TitulinoRestService.getLocationTypeCountrySelection(courseCodeId, "getEnrolleeInfoAdminDashboard");
  const transformed = await AdminInsights.CountrySelectionConverter(locationType, locationCategories);  
  return transformed;
}

export const getDemographicInfoAdminDashboard = async(courseCodeId, locationType) => {
  const locationCategories = await TitulinoRestService.getLocationTypeCountrySelection(courseCodeId, "getDemographicInfoAdminDashboard");
  const transformed = await AdminInsights.CountrySelectionConverter(locationType, locationCategories); 
  return transformed;
}

const CapitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);


const AnalyticsManager = {
  getAllCourses,
  getLocationTypesForInsights,
  getCountriesByLocationType,
  getOverviewInfoAdminDashboard,
  getEnrolleeInfoAdminDashboard,
  getDemographicInfoAdminDashboard
};

export default AnalyticsManager;
