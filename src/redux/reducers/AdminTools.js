import {
  ON_LOADING_ADMIN_TOOLS_INIT,
  ON_ASSIGNING_ROLE_TO_COURSE,
  ON_ASSIGNING_GLOBAL_ROLE,
  ON_CLEAR_SELECTED_CONTACT
} from '../constants/AdminTools';

const initState = {};

const adminTools = (state = initState, action) => {
  switch (action.type) {
    case ON_LOADING_ADMIN_TOOLS_INIT:
      return { ...state, allCourses: action.allCourses, allRoles: action.allRoles, allEnrollees: action.allEnrollees };
    case ON_ASSIGNING_ROLE_TO_COURSE:
      return { ...state, lastAssignResult: action.assignResult };
    case ON_ASSIGNING_GLOBAL_ROLE:
      return { ...state, lastAssignResult: action.assignResult };
    case ON_CLEAR_SELECTED_CONTACT:
      return { ...state };
    default:
      return state;
  }
};

export default adminTools;
