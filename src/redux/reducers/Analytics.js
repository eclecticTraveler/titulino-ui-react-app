import {
  DEFAULT,
  ON_RENDERING_ADMIN_INSIGHTS_DASHBOARD,
  ON_RENDERING_LOCATION_TYPE_SELECTIONS,
  ON_GETTING_COUNTRIES_BY_LOCATION_TYPE,
  ON_LOADING_ALL_DASHBOARD_CONTENTS,
  ON_LOADING_USER_AUTHENTICATED_PROGRESS_DASHBOARD,
} from '../constants/Analytics';

const initState = {

};

const analytics = (state = initState, action) => {
  switch (action.type) {
    case ON_LOADING_ALL_DASHBOARD_CONTENTS:
      return {
        ...state,
        selectedCourseCodeId: action.selectedCourseCodeId,
        selectedLocationType: action.selectedLocationType,
        selectedCountryId: action.selectedCountryId,
        overviewDashboardData: action.overviewDashboardData,
        demographicDashboardData: action.demographicDashboardData,
        enrolleDashboardData: action.enrolleDashboardData
      }
    case ON_GETTING_COUNTRIES_BY_LOCATION_TYPE:
      return {
        ...state,
        countriesByLocationType: action.countriesByLocationType
      }
    case ON_RENDERING_LOCATION_TYPE_SELECTIONS:
      return {
        ...state,
        locationTypes: action.locationTypes
      }
    case ON_RENDERING_ADMIN_INSIGHTS_DASHBOARD:
      return {
        ...state,
        allCourses: action.allCourses
      }
    case DEFAULT:
      return {
        ...state,
        defaultValue: action.defaultValue
      }
    case ON_LOADING_USER_AUTHENTICATED_PROGRESS_DASHBOARD:
      return {
        ...state,
        generalLoading: false,
        emailId: action.emailId,
        dateOfBirth: action.dateOfBirth
      }
    default:
      return state;
  }
};

export default analytics