import TitulinoManager from "managers/AnalyticsManager";
import {
  DEFAULT,
  ON_RENDERING_ADMIN_INSIGHTS_DASHBOARD,
  ON_RENDERING_LOCATION_TYPE_SELECTIONS,
  ON_GETTING_COUNTRIES_BY_LOCATION_TYPE,
  ON_LOADING_ALL_DASHBOARD_CONTENTS,
  ON_LOADING_USER_AUTHENTICATED_PROGRESS_DASHBOARD,
  ON_SUBMITTING_ADMIN_ENROLLEE_PROGRESS,
  ON_LOADING_FACILITADOR_DASHBOARD_CONTENTS,
  ON_LOADING_FACILITADOR_DRILLDOWN_DEMOGRAPHICS
} from '../constants/Analytics';

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

export const onLoadingAllDashboardContents = async (courseCodeId, locationType, countryId, emailId) => {

  try {
    const [
      overviewDashboardData,
      overviewProgressDashboardData,
      demographicDashboardData,
      progressDemographicDashboardData,
      enrolleDashboardData,
      enrolleesCourseProgressData
    ] = await Promise.all([
      TitulinoManager.getOverviewInfoAdminDashboard(courseCodeId, locationType, countryId),
      TitulinoManager.getCourseProgressOverviewInfoAdminDashboard(courseCodeId, locationType, countryId, emailId),
      TitulinoManager.getDemographicInfoAdminDashboard(courseCodeId, locationType, countryId),
      TitulinoManager.getCourseProgressDemographicInfoAdminDashboard(courseCodeId, locationType, countryId, emailId),
      TitulinoManager.getEnrolleeInfoAdminDashboard(courseCodeId, locationType, countryId),
      TitulinoManager.getEnrolleesCourseProgressAdminDashboard(courseCodeId, locationType, countryId, emailId)
    ]);

    return {
      type: ON_LOADING_ALL_DASHBOARD_CONTENTS,
      selectedCourseCodeId: courseCodeId,
      selectedLocationType: locationType,
      selectedCountryId: countryId,
      overviewDashboardData,
      overviewProgressDashboardData,
      demographicDashboardData,
      progressDemographicDashboardData,
      enrolleDashboardData,
      enrolleesCourseProgressData
    };
  } catch (error) {
    console.error('Error loading admin dashboard data:', error);
    throw error;
  }
};

export const onSubmittingAdminEnrolleeProgress = async (progressRecords, courseCodeId, adminEmailId) => {
  try {
    const result = await TitulinoManager.upsertAdminEnrolleeCourseProgress(progressRecords, courseCodeId, adminEmailId);

    return {
      type: ON_SUBMITTING_ADMIN_ENROLLEE_PROGRESS,
      submittedAdminEnrolleeProgress: result
    };
  } catch (error) {
    console.error("onSubmittingAdminEnrolleeProgress error:", error);
     throw error;
  }
};

export const onLoadingFacilitadorDrillDownDemographics = async (courseCodeId, countryId, emailId) => {
  try {
    const drillDownData = await TitulinoManager.getFacilitadorDrillDownDemographics(courseCodeId, countryId, emailId);
    return {
      type: ON_LOADING_FACILITADOR_DRILLDOWN_DEMOGRAPHICS,
      drillDownMapJson: drillDownData?.mapJson,
      drillDownDemographicData: drillDownData?.mergedDivisions
    };
  } catch (error) {
    console.error('Error loading facilitador drilldown demographics:', error);
    return {
      type: ON_LOADING_FACILITADOR_DRILLDOWN_DEMOGRAPHICS,
      drillDownMapJson: null,
      drillDownDemographicData: null
    };
  }
};

export const onLoadingFacilitadorDashboardContents = async (courseCodeId, emailId) => {
  try {
    const [
      overviewDashboardData,
      overviewProgressDashboardData,
      demographicDashboardData,
      progressDemographicDashboardData,
      enrolleDashboardData,
      facilitadorEnrolleeData
    ] = await Promise.all([
      TitulinoManager.getOverviewInfoAdminDashboard(courseCodeId, 'all', 'All'),
      TitulinoManager.getCourseProgressOverviewInfoAdminDashboard(courseCodeId, 'all', 'All', emailId),
      TitulinoManager.getDemographicInfoAdminDashboard(courseCodeId, 'all', 'All'),
      TitulinoManager.getCourseProgressDemographicInfoAdminDashboard(courseCodeId, 'all', 'All', emailId),
      TitulinoManager.getEnrolleeInfoAdminDashboard(courseCodeId, 'all', 'All'),
      TitulinoManager.getFacilitadorEnrolleesCourseProgressDashboard(courseCodeId, emailId)
    ]);

    return {
      type: ON_LOADING_FACILITADOR_DASHBOARD_CONTENTS,
      selectedCourseCodeId: courseCodeId,
      overviewDashboardData,
      overviewProgressDashboardData,
      demographicDashboardData,
      progressDemographicDashboardData,
      enrolleDashboardData,
      facilitadorEnrolleeData
    };
  } catch (error) {
    console.error('Error loading facilitador dashboard data:', error);
    throw error;
  }
};

export const onLoadingUserAuthenticatedProgressDashboard = (emailId, dob, course) => {

  // Use a manager to do 

  // Get CourseCodeId associated with the course

  // call TitulinoRestService to get the user progress

  // 
  return {
    type: ON_LOADING_USER_AUTHENTICATED_PROGRESS_DASHBOARD,
    emailId: emailId,
    dateOfBirth: dob
  };
}



  
