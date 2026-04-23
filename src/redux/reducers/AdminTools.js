import {
  ON_LOADING_ADMIN_TOOLS_INIT,
  ON_ASSIGNING_ROLE_TO_COURSE,
  ON_ASSIGNING_GLOBAL_ROLE,
  ON_CLEAR_SELECTED_CONTACT,
  ON_UPSERTING_COURSE,
  ON_LOADING_CONTACT_COURSE_PROGRESS_ACTIVITY,
  ON_LOADING_CONTACT_LOGIN_FOOTPRINT,
  ON_LOADING_ALL_USER_LOGIN_FOOTPRINT
} from '../constants/AdminTools';

const initState = {};

const adminTools = (state = initState, action) => {
  switch (action.type) {
    case ON_LOADING_ADMIN_TOOLS_INIT:
      return { ...state, allCourses: action.allCourses, allRoles: action.allRoles, allEnrollees: action.allEnrollees, allRawCourses: action.allRawCourses };
    case ON_ASSIGNING_ROLE_TO_COURSE:
      return { ...state, lastAssignResult: action.assignResult };
    case ON_ASSIGNING_GLOBAL_ROLE:
      return { ...state, lastAssignResult: action.assignResult };
    case ON_UPSERTING_COURSE:
      return { ...state, lastCourseUpsertResult: action.upsertResult };
    case ON_LOADING_CONTACT_COURSE_PROGRESS_ACTIVITY:
      return { ...state, contactCourseProgressActivity: action.contactCourseProgressActivity };
    case ON_LOADING_CONTACT_LOGIN_FOOTPRINT:
      return { ...state, contactLoginFootprint: action.contactLoginFootprint };
    case ON_LOADING_ALL_USER_LOGIN_FOOTPRINT:
      return { ...state, allUserLoginFootprint: action.allUserLoginFootprint };
    case ON_CLEAR_SELECTED_CONTACT:
      return { ...state, contactCourseProgressActivity: null, contactLoginFootprint: null };
    default:
      return state;
  }
};

export default adminTools;
