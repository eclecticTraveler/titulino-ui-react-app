import KnowMeProfiles from "lob/KnowMeProfiles";
import {
  DEFAULT,
  ON_RENDERING_ADMIN_INSIGHTS_DASHBOARD,
  ON_RENDERING_LOCATION_TYPE_SELECTIONS,
  ON_GETTING_COUNTRIES_BY_LOCATION_TYPE,
  ON_LOADING_ALL_DASHBOARD_CONTENTS,
  ON_LOADING_USER_AUTHENTICATED_PROGRESS_DASHBOARD,
  ON_SUBMITTING_ADMIN_ENROLLEE_PROGRESS,
  ON_LOADING_FACILITADOR_DASHBOARD_CONTENTS,
  ON_LOADING_FACILITADOR_DRILLDOWN_DEMOGRAPHICS,
  ON_HYDRATING_ANALYTICS_AVATARS
} from '../constants/Analytics';

const initState = {
  avatarUrlMap: {}
};

const applyAvatarCacheToTableModel = (tableModel, avatarUrlMap = {}) => (
  KnowMeProfiles.applyKnowMeProfileUrlMapToTableModel(tableModel, avatarUrlMap)
);

const analytics = (state = initState, action) => {
  switch (action.type) {
    case ON_SUBMITTING_ADMIN_ENROLLEE_PROGRESS:
      return {
        ...state,
        submitProgressSuccess: action.submittedAdminEnrolleeProgress
      }
    case ON_LOADING_FACILITADOR_DASHBOARD_CONTENTS:
      return {
        ...state,
        selectedCourseCodeId: action.selectedCourseCodeId,
        selectedLocationType: 'all',
        selectedCountryId: 'All',
        overviewDashboardData: action.overviewDashboardData,
        overviewProgressDashboardData: action.overviewProgressDashboardData,
        demographicDashboardData: action.demographicDashboardData,
        progressDemographicDashboardData: action.progressDemographicDashboardData,
        enrolleDashboardData: applyAvatarCacheToTableModel(action.enrolleDashboardData, state.avatarUrlMap),
        facilitadorEnrolleeData: applyAvatarCacheToTableModel(action.facilitadorEnrolleeData, state.avatarUrlMap)
      }
    case ON_LOADING_FACILITADOR_DRILLDOWN_DEMOGRAPHICS:
      return {
        ...state,
        drillDownMapJson: action.drillDownMapJson,
        drillDownDemographicData: action.drillDownDemographicData
      }
    case ON_LOADING_ALL_DASHBOARD_CONTENTS:
      return {
        ...state,
        selectedCourseCodeId: action.selectedCourseCodeId,
        selectedLocationType: action.selectedLocationType,
        selectedCountryId: action.selectedCountryId,
        overviewDashboardData: action.overviewDashboardData,
        overviewProgressDashboardData: action.overviewProgressDashboardData,
        demographicDashboardData: action.demographicDashboardData,
        progressDemographicDashboardData: action.progressDemographicDashboardData,
        enrolleDashboardData: applyAvatarCacheToTableModel(action.enrolleDashboardData, state.avatarUrlMap),
        enrolleesCourseProgressData: applyAvatarCacheToTableModel(action.enrolleesCourseProgressData, state.avatarUrlMap)
      }
    case ON_HYDRATING_ANALYTICS_AVATARS:
      return {
        ...state,
        avatarUrlMap: action.avatarUrlMap || state.avatarUrlMap,
        ...(action.tableModels?.enrolleDashboardData && {
          enrolleDashboardData: action.tableModels.enrolleDashboardData
        }),
        ...(action.tableModels?.enrolleesCourseProgressData && {
          enrolleesCourseProgressData: action.tableModels.enrolleesCourseProgressData
        }),
        ...(action.tableModels?.facilitadorEnrolleeData && {
          facilitadorEnrolleeData: action.tableModels.facilitadorEnrolleeData
        })
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
