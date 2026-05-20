import {
  ON_AUTHENTICATING_WITH_INTERNAL_RESOURCES,
  ON_AUTHENTICATING_WITH_SSO,
  AUTH_TITULINO_INTERNAL_TOKEN,
  ON_RETRIEVING_PROFILE_BY_EMAIL_ID_AND_YEAR_OF_BIRTH,
  ON_LOADING_AUTHENTICATED_LANDING_PAGE,
  ON_MODIFYING_COURSE_ACCESS_FOR_USER_AFTER_SUCCESSFUL_PURCHASE_SHORTCUT,
  ON_ACTIVATING_IMPERSONATION_PROFILE,
  ON_STOPPING_IMPERSONATION_PROFILE,
  ON_LOADING_AUTHENTICATED_ENROLLEE_PROFILE
} from '../constants/Grant';

const emptyUser = {
  userCourses: null,
  userCoursesSignature: '',
  contactId: null,
  contactInternalId: null,
  emailId: null,
  yearOfBirth: null,
  communicationName: null,
  expirationDate: null,
  hasEverBeenFacilitator: false,
  isGlobalAccessUser: false,
  globalRoles: [],
  contactPaymentProviderId: null,
  innerToken: localStorage.getItem(AUTH_TITULINO_INTERNAL_TOKEN)
};

const initState = {
  generalLoading: false,
  message: '',
  showMessage: false,
  user: emptyUser,
  enrolleeProfile: null
};

const grant = (state = initState, action) => {
  switch (action.type) {
    case ON_AUTHENTICATING_WITH_INTERNAL_RESOURCES:
      return {
        ...state,
        generalLoading: false,
        user: {
          ...state.user,
          innerToken: action.innerToken
        }
      };
    case ON_MODIFYING_COURSE_ACCESS_FOR_USER_AFTER_SUCCESSFUL_PURCHASE_SHORTCUT:
      return {
        ...state,
        user: {
          ...state.user,
          userCourses: action.userCourses,
          userCoursesSignature: action.userCoursesSignature
        }
      }
    case ON_AUTHENTICATING_WITH_SSO:
      return {
        ...state,
        generalLoading: false,
        user: {
          ...state.user,
          emailId: action.emailId
        }
      };    
    case ON_LOADING_AUTHENTICATED_LANDING_PAGE:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.user,
          innerToken: action.user?.innerToken || state.user?.innerToken || localStorage.getItem(AUTH_TITULINO_INTERNAL_TOKEN)
        }
      };
    case ON_ACTIVATING_IMPERSONATION_PROFILE:
      return {
        ...state,
        generalLoading: false,
        user: {
          ...state.user,
          ...action.user,
          innerToken: action.user?.innerToken || state.user?.innerToken || localStorage.getItem(AUTH_TITULINO_INTERNAL_TOKEN)
        }
      };
    case ON_STOPPING_IMPERSONATION_PROFILE:
      return {
        ...state,
        generalLoading: false,
        user: {
          ...emptyUser,
          innerToken: localStorage.getItem(AUTH_TITULINO_INTERNAL_TOKEN)
        }
      };
    case ON_RETRIEVING_PROFILE_BY_EMAIL_ID_AND_YEAR_OF_BIRTH:
      return {
        ...state,
        generalLoading: false,
        user: {
          ...state.user,
          ...action.user  // <- Carefully overwrite specific user properties from action
        }
      };
    case ON_LOADING_AUTHENTICATED_ENROLLEE_PROFILE:
      return {
        ...state,
        enrolleeProfile: action.enrolleeProfile
      };

    default:
      return state;
  }
};

export default grant;
