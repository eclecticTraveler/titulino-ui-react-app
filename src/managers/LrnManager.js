import LocalStorageService from "services/LocalStorageService";
import TitulinoAuthService from "services/TitulinoAuthService";
import StudentProgress from "lob/StudentProgress";
import utils from 'utils';


const getUserCourseProgress = async(courseCodeId, emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;
  const user = LocalStorageService.retrieveEncryptedObjectWithExpiry(localStorageKey)
  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);
  const courseProgress = await TitulinoAuthService.getCourseProgress(courseCodeId, token, "onFetchingUserAuthenticatedProgressForCourse");

  const [studentPercentagesForCourse, studentCategoriesCompletedForCourse] = await Promise.all([
    StudentProgress.calculateUserCourseProgressPercentageForCertificates(courseProgress),
    StudentProgress.getUserCourseProgressCategories(courseProgress)
  ]);
  
  return {
    courseProgress,
    studentPercentagesForCourse,
    studentCategoriesCompletedForCourse
  };
}


const LrnManager = {
  getUserCourseProgress,
};

export default LrnManager;
