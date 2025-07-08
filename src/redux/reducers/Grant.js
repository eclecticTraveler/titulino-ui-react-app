import {
  ON_AUTHENTICATING_WITH_INTERNAL_RESOURCES,
  ON_AUTHENTICATING_WITH_SSO,
  AUTH_TITULINO_INTERNAL_TOKEN,
  ON_RETRIEVING_PROFILE_BY_EMAIL_ID_AND_YEAR_OF_BIRTH,
  ON_LOADING_AUTHENTICATED_LANDING_PAGE
} from '../constants/Grant';

const initState = {
  generalLoading: false,
  message: '',
  showMessage: false,
  user: {
    userCourses: null,
    contactId: null,
    contactInternalId: null,
    emailId: null,
    yearOfBirth: null,
    communicationName: null,
    expirationDate: null,
    hasEverBeenFacilitator: false,
    innerToken: localStorage.getItem(AUTH_TITULINO_INTERNAL_TOKEN)
  }
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
        user: action.user
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

    default:
      return state;
  }
};

export default grant;
