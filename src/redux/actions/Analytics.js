import TitulinoManager from "managers/AnalyticsManager";
import {
  DEFAULT,
  ON_RENDERING_ADMIN_INSIGHTS_DASHBOARD,
  ON_RENDERING_LOCATION_TYPE_SELECTIONS,
  ON_GETTING_COUNTRIES_BY_LOCATION_TYPE,
  ON_LOADING_ALL_DASHBOARD_CONTENTS,
  ON_LOADING_USER_AUTHENTICATED_PROGRESS_DASHBOARD,
  ON_SUBMITTING_ADMIN_ENROLLEE_PROGRESS
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
    const requests = [
      TitulinoManager.getOverviewInfoAdminDashboard(courseCodeId, locationType, countryId),
      TitulinoManager.getProgressOverviewInfoAdminDashboard(courseCodeId, locationType, countryId),
      TitulinoManager.getDemographicInfoAdminDashboard(courseCodeId, locationType, countryId),
      TitulinoManager.getProgressDemographicInfoAdminDashboard(courseCodeId, locationType, countryId),
      TitulinoManager.getEnrolleeInfoAdminDashboard(courseCodeId, locationType, countryId),
      TitulinoManager.getEnrolleesCourseProgressAdminDashboard(courseCodeId, locationType, countryId, emailId)
    ];

    const settled = await Promise.allSettled(requests);
    const defaults = [
      {},
      {},
      {},
      {},
      { tableData: [], columns: [] },
      { tableData: [], columns: [] }
    ];

    const values = settled.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }

      console.error(`Dashboard section ${index + 1} failed to load:`, result.reason);
      return defaults[index];
    });

    const [
      overviewDashboardData,
      overviewProgressDashboardData,
      demographicDashboardData,
      progressDemographicDashboardData,
      enrolleDashboardData,
      enrolleesCourseProgressData
    ] = values;

    const getModelCount = (value) => {
      if (Array.isArray(value?.tableData)) return value.tableData.length;
      if (Array.isArray(value)) return value.length;
      return -1;
    };

    console.log("[InsightsDebug][Action][onLoadingAllDashboardContents]", {
      courseCodeId,
      locationType,
      countryId,
      overviewType: typeof overviewDashboardData,
      progressOverviewType: typeof overviewProgressDashboardData,
      demographicType: typeof demographicDashboardData,
      progressDemographicType: typeof progressDemographicDashboardData,
      enrolleeRows: getModelCount(enrolleDashboardData),
      progressRows: getModelCount(enrolleesCourseProgressData),
      enrolleeColumns: Array.isArray(enrolleDashboardData?.columns) ? enrolleDashboardData.columns.length : -1,
      progressColumns: Array.isArray(enrolleesCourseProgressData?.columns) ? enrolleesCourseProgressData.columns.length : -1
    });

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



  
