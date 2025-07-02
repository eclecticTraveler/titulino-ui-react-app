import LocalStorageService from "services/LocalStorageService";
import TitulinoAuthService from "services/TitulinoAuthService";
import StudentProgress from "lob/StudentProgress";
import utils from 'utils';


const getUserCourseProgress = async(courseCodeId, emailId) => {
  let courseProgress = [];
  let courseFilteredProgress = [];
  const localStorageKey = `UserProfile_${emailId}`;
  const user = LocalStorageService.retrieveEncryptedObjectWithExpiry(localStorageKey)
  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);
  courseProgress = await TitulinoAuthService.getCourseProgress(courseCodeId, token, "onFetchingUserAuthenticatedProgressForCourse");

  // For now if the user is facilitador filter to its own results: TODO
  if(user?.hasEverBeenFacilitador && courseProgress?.length > 0){
    courseFilteredProgress = courseProgress?.filter(item => item?.EmailId === user?.email);
  }else{
    courseFilteredProgress = courseProgress?.length > 0 ? [...courseProgress] : [];    
  }

  const [studentPercentagesForCourse, studentCategoriesCompletedForCourse] = await Promise.all([
    StudentProgress.calculateUserCourseProgressPercentageForCertificates(courseFilteredProgress),
    StudentProgress.getUserCourseProgressCategories(courseFilteredProgress)
  ]);

  return {
    courseFilteredProgress,
    studentPercentagesForCourse,
    studentCategoriesCompletedForCourse
  };
}

const upsertUserCourseProgress = async(courseProgress, courseCodeId, emailId) => {
const localStorageKey = `UserProfile_${emailId}`;
  const user = LocalStorageService.retrieveEncryptedObjectWithExpiry(localStorageKey)
  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);
  courseProgress = await TitulinoAuthService.upsertUserCourseProgress(courseProgress, token, "upsertUserCourseProgress");
  return courseProgress;
}

const LrnManager = {
  getUserCourseProgress,
  upsertUserCourseProgress
};

export default LrnManager;
