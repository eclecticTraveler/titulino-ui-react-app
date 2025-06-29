import TitulinoManager from "managers/GrantManager";

import {
ON_AUTHENTICATING_WITH_INTERNAL_RESOURCES,
ON_AUTHENTICATING_WITH_SSO,
AUTH_TITULINO_INTERNAL_TOKEN,
ON_RETRIEVING_PROFILE_BY_EMAIL_ID_AND_YEAR_OF_BIRTH
} from '../constants/Grant';

export const onRetrievingUserProfile = async (emailId, dobOrYob) => {
  const userProfile = await TitulinoManager.getUserProfile(emailId, dobOrYob);

  return {
    type: ON_RETRIEVING_PROFILE_BY_EMAIL_ID_AND_YEAR_OF_BIRTH,
    user: {
      userCourses: userProfile?.userCourses ?? null,
      contactId: userProfile?.contactId ?? null,
      communicationName: userProfile?.communicationName ?? null,
      expirationDate: userProfile?.expirationDate ?? null,
      hasEverBeenFacilitator: userProfile?.hasEverBeenFacilitador ?? false,
      innerToken: userProfile?.token,
      emailId: emailId,
      yearOfBirth: userProfile?.yearOfBirth
    },
    message: userProfile?.message ?? '',
    showMessage: false,
    generalLoading: false
  };
};


export const onAuthenticatingWithInternalResources = async (innerToken) => {
  return {
    type: ON_AUTHENTICATING_WITH_INTERNAL_RESOURCES,
    innerToken
  };
}

export const onAuthenticatingWithSSO = async (emailId) => {
  return {
    type: ON_AUTHENTICATING_WITH_SSO,
    emailId
  };  
};


///
export const setAuthInnerToken = async (token) => {
  localStorage.setItem(AUTH_TITULINO_INTERNAL_TOKEN, token);
  return {
    type: AUTH_TITULINO_INTERNAL_TOKEN,
    token
  };
}
