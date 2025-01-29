import {
  DEFAULT,
  ON_RENDERING_ADMIN_INSIGHTS_DASHBOARD,
  ON_RENDERING_LOCATION_TYPE_SELECTIONS,
  ON_GETTING_COUNTRIES_BY_LOCATION_TYPE,
  ON_LOADING_ALL_DASHBOARD_CONTENTS
} from '../constants/Analytics';
import TitulinoManager from "managers/AnalyticsManager";

export function onTestingDefault(defaultValue) {
  return {
    type: DEFAULT,
    defaultValue
  };
}


export const onRenderingAdminInsightsDashboard = async () => {
  const allCourses = await TitulinoManager.getAllCourses();
  return {
    type: ON_RENDERING_ADMIN_INSIGHTS_DASHBOARD,
    allCourses: allCourses
  }
}


export const onRenderingLocationTypeSelectionsToDashboard = async () => {
  const locationTypes = await TitulinoManager.getLocationTypesForInsights();
  return {
    type: ON_RENDERING_LOCATION_TYPE_SELECTIONS,
    locationTypes: locationTypes
  }
}

export const onGettingCountriesByLocationToDashboard = async (courseCodeId, locationType) => {
  const countriesByLocationType = await TitulinoManager.getCountriesByLocationType(courseCodeId, locationType);
  return {
    type: ON_GETTING_COUNTRIES_BY_LOCATION_TYPE,
    countriesByLocationType: countriesByLocationType
  }
}

export const onLoadingAllDashboardContents = async (courseCodeId, locationType, countryId) => {
  try {
    const [overviewDashboardData, demographicDashboardData, enrolleDashboardData] = await Promise.all([
      TitulinoManager.getOverviewInfoAdminDashboard(courseCodeId, locationType, countryId),
      TitulinoManager.getDemographicInfoAdminDashboard(courseCodeId, locationType, countryId),
      TitulinoManager.getEnrolleeInfoAdminDashboard(courseCodeId, locationType, countryId)
    ]);

    return {
      type: ON_LOADING_ALL_DASHBOARD_CONTENTS,
      selectedCourseCodeId: courseCodeId,
      selectedLocationType: locationType,
      selectedCountryId: countryId,
      overviewDashboardData,
      demographicDashboardData,
      enrolleDashboardData
    };
  } catch (error) {
    console.error('Error loading admin dashboard data:', error);
    throw error;
  }
};



  