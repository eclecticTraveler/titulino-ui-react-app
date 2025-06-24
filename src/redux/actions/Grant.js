import TitulinoManager from "managers/GrantManager";

import {
ON_AUTHENTICATING_WITH_INTERNAL_RESOURCES,
ON_AUTHENTICATING_WITH_SSO,
AUTH_TITULINO_INTERNAL_TOKEN,
ON_RETRIEVING_PROFILE_BY_EMAIL_ID_AND_YEAR_OF_BIRTH
} from '../constants/Grant';

export const onRetrievingProfileByEmailIdAndYearOfBirth = (emailId, dobOrYob) => {
  const userProfile = TitulinoManager.getUserProfile(emailId, dobOrYob);
  return  {
      type: ON_RETRIEVING_PROFILE_BY_EMAIL_ID_AND_YEAR_OF_BIRTH,
      user: {
            generalLoading: false,
            userCourses: userProfile?.userCourses ?? null,
            contactId: userProfile?.contactId ?? null, 
            communicationName: userProfile?.communicationName ?? null,
            expirationDate: userProfile?.expirationDate ?? null,
            hasEverBeenFacilitator: userProfile?.hasEverBeenFacilitador ?? false,
            showMessage: false,
            message: userProfile?.message ?? '',
            emailId: emailId,
            dobOrYob: dobOrYob
          }
    }
  }

export const onAuthenticatingWithInternalResources = (innerToken) => {
  return {
    type: ON_AUTHENTICATING_WITH_INTERNAL_RESOURCES,
    innerToken
  };
}

export const onAuthenticatingWithSSO = (emailId) => {
  return {
    type: ON_AUTHENTICATING_WITH_SSO,
    emailId
  };  
};


///
export const setAuthInnerToken = (token) => {
  localStorage.setItem(AUTH_TITULINO_INTERNAL_TOKEN, token);
  return {
    type: AUTH_TITULINO_INTERNAL_TOKEN,
    token
  };
}
