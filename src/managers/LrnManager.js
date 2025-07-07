import LocalStorageService from "services/LocalStorageService";
import TitulinoAuthService from "services/TitulinoAuthService";
import GrammarClassService from "services/GrammarClassService";
import DynamicNavigationRouter from "services/DynamicNavigationRouter";
import TitulinoRestService from "services/TitulinoRestService";
import StudentProgress from "lob/StudentProgress";
import utils from 'utils';

const getUserCourseProgress = async(courseCodeId, emailId) => {
  let courseProgress = [];
  let courseFilteredProgress = [];
  const localStorageKey = `UserProfile_${emailId}`;

  const user = await LocalStorageService.getCachedObject(localStorageKey);

  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);

  if (token) {
    courseProgress = await TitulinoAuthService.getCourseProgress(courseCodeId, token, "onFetchingUserAuthenticatedProgressForCourse");

    // For now if the user is facilitador, filter to its own results: TODO
    courseFilteredProgress = courseProgress?.filter(item => item?.EmailId === user?.email);
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
  const token = await getCourseToken(courseCodeId, emailId);
  courseProgress = await TitulinoAuthService.upsertUserCourseProgress(courseProgress, token, "upsertUserCourseProgress");
  return courseProgress;
}

const getCourseToken = async(courseCodeId, emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;

  const user = await LocalStorageService.getCachedObject(localStorageKey);

  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);
  return token;
}

const getUserUpperNavigationConfig = async (isAuthenticated) => {  
  const isUserAuthenticated = !!isAuthenticated;
  console.log("UpperNavigation-isUserAuthenticated", isUserAuthenticated);
  const selectedLanguageForCourse =  await LocalStorageService.getUserSelectedCourse();
  const upperMainNavigation = await DynamicNavigationRouter.loadMenu(selectedLanguageForCourse?.courseAbbreviation, isUserAuthenticated);
  return upperMainNavigation;
}

const getGrammarClasses = async(levelNo, chapterNo, nativeLanguage, course, emailId) => {
    const localStorageKey = `UserProfile_${emailId}`;  
    const user = await LocalStorageService.getCachedObject(localStorageKey);
    const urls = await GrammarClassService.getGrammarClassUrlsByChapter(levelNo, chapterNo, nativeLanguage, course);
    const courseCodeId = await StudentProgress.getCourseCodeIdByCourseTheme(levelNo);
    const level = utils.getuserLanguageProficiencyOrderIdForCourse(user?.userCourses, courseCodeId);
    const proficiencyLevel = await GrammarClassService.getGrammarCategory(level);

    return {
      urls,
      proficiencyLevel
    };
}

const getCourseProgress = async(courseTheme, nativeLanguage, course) => {  
  // Get courseId in Factory
  const courseCodeId = await StudentProgress.getCourseCodeIdByCourseTheme(courseTheme);
  const courseConfiguration = await TitulinoRestService.getCourseProgressStructure(nativeLanguage, course, courseCodeId);

    return {
      courseCodeId,
      courseConfiguration
    };
}



const LrnManager = {
  getUserCourseProgress,
  upsertUserCourseProgress,
  getCourseToken,
  getUserUpperNavigationConfig,
  getGrammarClasses,
  getCourseProgress
};

export default LrnManager;