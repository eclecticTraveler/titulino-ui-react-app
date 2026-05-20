import TitulinoManager from "managers/GrantManager";

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

export const onModifyingCourseAccessForUserAfterSuccessfulPurchaseShortcut = async (purchasedTierAccess, courseCodeIdOfPurchasedItem, emailId) => {   
  const userCourses = await TitulinoManager.setCourseAccessForUserCourses(purchasedTierAccess, courseCodeIdOfPurchasedItem, emailId);
  const userCoursesSignature = TitulinoManager.buildUserCoursesSignature(userCourses);
    return {
      type: ON_MODIFYING_COURSE_ACCESS_FOR_USER_AFTER_SUCCESSFUL_PURCHASE_SHORTCUT,
      userCourses: userCourses,
      userCoursesSignature
    }
}

export const onRetrievingUserProfile = async (emailId, dobOrYob) => {
  const user = await TitulinoManager.getUserProfile(emailId, dobOrYob);

  return {
    type: ON_RETRIEVING_PROFILE_BY_EMAIL_ID_AND_YEAR_OF_BIRTH,
    user,
    message: user?.message ?? '',
    showMessage: false,
    generalLoading: false
  };
};

export const onLoadingAuthenticatedLandingPage = async (emailId) => {
  const userProfile = await TitulinoManager.getCachedUserProfile(emailId);
  return {
    type: ON_LOADING_AUTHENTICATED_LANDING_PAGE,
    user: userProfile
  }
}

export const onLoadingAuthenticatedEnrolleeProfile = async (emailId, dobOrYob) => {
  const enrolleeProfile = await TitulinoManager.getAuthenticatedEnrolleeProfile(emailId, dobOrYob);
  return {
    type: ON_LOADING_AUTHENTICATED_ENROLLEE_PROFILE,
    enrolleeProfile
  };
};

export const onActivatingImpersonationProfile = async (userProfile) => {
  const user = await TitulinoManager.activateImpersonationProfile(userProfile);
  return {
    type: ON_ACTIVATING_IMPERSONATION_PROFILE,
    user
  };
};

export const onStoppingImpersonationProfile = async () => {
  const stoppedUser = await TitulinoManager.stopImpersonationProfile();
  return {
    type: ON_STOPPING_IMPERSONATION_PROFILE,
    stoppedUser
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
