import LocalStorageService from "services/LocalStorageService";
import TitulinoRestService from "services/TitulinoRestService";
import TitulinoNetService from "services/TitulinoNetService";
import GoogleService from "services/GoogleService";
import AdminInsights from "lob/AdminInsights";
import StudentProgress from "lob/StudentProgress";


export const getAllCourses = async() => {
  const localStorageKey = `adminAllCourses`;
  const cachedData = await LocalStorageService.getLocalStorageObjectWithExpiry(localStorageKey);
  if (cachedData) {
    return cachedData;
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
  const cachedProfile = LocalStorageService.retrieveEncryptedObjectWithExpiry(localStorageKey);
  if (cachedProfile) {
    return cachedProfile;
  }

  // 2. Otherwise fetch from backend
  try {
    const userProfile = await TitulinoNetService.getUserProfileByEmailAndYearOfBirth(emailId, dobOrYob);
    console.log("userProfile", userProfile);
    if (userProfile) {      
      // 3. Store encrypted locally with TTL (e.g., 60 minutes)
      LocalStorageService.storeEncryptedObjectWithExpiry(localStorageKey, userProfile, 60);
      return userProfile;
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

const getCachedUserProfile = (emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;
  const savedUserProfile = LocalStorageService.retrieveEncryptedObjectWithExpiry(localStorageKey);  
  return savedUserProfile
};


const GrantManager = {
  getUserProfile,
  getCachedUserProfile
};

export default GrantManager;
