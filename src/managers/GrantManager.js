import LocalStorageService from "services/LocalStorageService";
import TitulinoRestService from "services/TitulinoRestService";
import TitulinoNetService from "services/TitulinoNetService";
import GoogleService from "services/GoogleService";
import AdminInsights from "lob/AdminInsights";


export const getAllCourses = async() => {
  const localStorageKey = `adminAllCourses`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);
  if (user) {
    return user;
  }

  const allCourses = await TitulinoRestService.getAllCourses("getAllCourses");
  const transformedCourses = await AdminInsights.courseSelectionConverter(allCourses);
  await LocalStorageService.setEnrolleesByCourse(
    transformedCourses, // Save both and set 60 min expiration     
    localStorageKey,
    60
  );
  
  return transformedCourses;
}


const getUserProfile = async (emailId, dobOrYob) => {
  const localStorageKey = `UserProfile_${emailId}`;
  // 1. Try to get from encrypted localStorage
  const user = await LocalStorageService.getCachedObject(localStorageKey);

  if (user) {
    return user;
  }

  // 2. Otherwise fetch from backend
  try {
    const userProfile = await TitulinoNetService.getUserProfileByEmailAndYearOfBirth(emailId, dobOrYob);    
    if (userProfile) {      
      // 3. Store encrypted locally with TTL (e.g., 60 minutes)
      const user = {
        userCourses: userProfile?.userCourses ?? null,
        contactId: userProfile?.contactId ?? null,
        contactInternalId: userProfile?.contactInternalId ?? null,
        communicationName: userProfile?.communicationName ?? null,
        expirationDate: userProfile?.expirationDate ?? null,
        hasEverBeenFacilitator: userProfile?.hasEverBeenFacilitador ?? false,
        innerToken: userProfile?.token,
        emailId: emailId,
        yearOfBirth: userProfile?.yearOfBirth,
        contactPaymentProviderId: userProfile?.contactPaymentProviderId ?? null
      };
      
      LocalStorageService.setCachedObject(localStorageKey, user, 60);       
      console.log("contactPaymentProviderId", user);
      return user;
      
    } else {      
      console.warn("No user profile found for:", emailId, dobOrYob);
      return null;
    }
  } catch (err) {
    console.log("ERRO");
    console.error("Error retrieving user profile:", err);
    return null;
  }
};

const getCachedUserProfile = async (emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);
  return user
};


const GrantManager = {
  getUserProfile,
  getCachedUserProfile
};

export default GrantManager;
