import LocalStorageService from "services/LocalStorageService";
import TitulinoAuthService from "services/TitulinoAuthService";
import TitulinoNetService from "services/TitulinoNetService";
import GrammarClassService from "services/GrammarClassService";
import BookChapterService  from "services/BookChapterService";
import DynamicNavigationRouter from "services/DynamicNavigationRouter";
import TitulinoRestService from "services/TitulinoRestService";
import StudentProgress from "lob/StudentProgress";
import LrnConfiguration from "lob/LrnConfiguration";
import utils from 'utils';

const getUserCourseProgress = async(courseCodeId, emailId) => {
  let courseProgress = [];
  let courseFilteredProgress = [];
  const localStorageKey = `UserProfile_${emailId}`;

  const user = await LocalStorageService.getCachedObject(localStorageKey);

  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);

  if (token) {
    courseProgress = await TitulinoAuthService.getCourseProgress(courseCodeId, token, "getUserCourseProgress");

    // For now if the user is facilitador, filter to its own results: TODO
    courseFilteredProgress = courseProgress?.filter(item => item?.EmailId === user?.emailId);
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

const getUserUpperNavigationConfig = async (isAuthenticated, emailId) => { 
  const localStorageKey = `UserProfile_${emailId}`;  
  const user = await LocalStorageService.getCachedObject(localStorageKey);

  const isUserAuthenticated = !!isAuthenticated;
  const selectedLanguageForCourse =  await LocalStorageService.getUserSelectedCourse();
  
  const mappedCourseNames = LrnConfiguration.mapUserCoursesByTheme(user?.userCourses);  
  const upperMainNavigation = await DynamicNavigationRouter.loadMenu(selectedLanguageForCourse?.courseAbbreviation, isUserAuthenticated, mappedCourseNames );
  return upperMainNavigation;
}

const getGrammarClasses = async(levelNo, chapterNo, nativeLanguage, course, emailId) => {
    const localStorageKey = `UserProfile_${emailId}`;  
    const user = await LocalStorageService.getCachedObject(localStorageKey);
    const urls = await GrammarClassService.getGrammarClassUrlsByChapter(levelNo, chapterNo, nativeLanguage, course);
    const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(levelNo);
    const level = utils.getuserLanguageProficiencyOrderIdForCourse(user?.userCourses, courseCodeId);
    const proficiencyLevel = await GrammarClassService.getGrammarCategory(level);

    return {
      urls,
      proficiencyLevel
    };
}

const getCourseProgress = async(courseTheme, nativeLanguage, course) => {  
  // Get courseId in Factory
  const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(courseTheme);
  const courseConfiguration = await TitulinoRestService.getCourseProgressStructure(nativeLanguage, course, courseCodeId);

    return {
      courseCodeId,
      courseConfiguration
    };
}

const getUserCoursesForEnrollment = async(emailId) => {  
    const localStorageKey = `UserProfile_${emailId}`;  
    const user = await LocalStorageService.getCachedObject(localStorageKey);

    const [countries, availableCourses, selfLanguageLevel] = await Promise.all([
      TitulinoRestService.getCountries("getUserCoursesForEnrollment"),
      TitulinoRestService.getAvailableCourses(null, "getUserCoursesForEnrollment"),
      TitulinoRestService.getSelfDeterminedLanguageLevelCriteria("getUserCoursesForEnrollment")
    ]);
  
    const userEnrolledCourseIds = utils.getAllCourseCodeIdsFromUserCourses(user?.userCourses);

    const userCoursesAvailableForUserToRegistered = availableCourses?.map(course => ({
      ...course,
      alreadyEnrolled: userEnrolledCourseIds.includes(course.CourseCodeId)
    }));
    
  
    return {
      countries,
      userCoursesAvailableForUserToRegistered,
      selfLanguageLevel
    };
}

const getUserBookBaseUrl = async(levelTheme, nativeLanguage, course, emailId) => {  
  const localStorageKey = `UserProfile_${emailId}`;  

  const user = await LocalStorageService.getCachedObject(localStorageKey);

  const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(levelTheme);

  const tier = utils.getCourseTierFromUserCourses(user?.userCourses, courseCodeId);

  const url = await BookChapterService.getBookTierBaseUrl(levelTheme, nativeLanguage, course, tier ?? "Free");  

  return url;
} 

const getUserEBookChapterUrl = async(levelTheme, chapterNo, nativeLanguage, course, emailId) => {  
  const localStorageKey = `UserProfile_${emailId}`;  

  const user = await LocalStorageService.getCachedObject(localStorageKey);

  const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(levelTheme);

  const tier = utils.getCourseTierFromUserCourses(user?.userCourses, courseCodeId);
  
  const url = await BookChapterService.getBookTierChapterUrl(levelTheme, chapterNo, nativeLanguage, course, tier);

  return url;
} 


const upsertUserKnowMeProgress = async(knowMeProgress, levelTheme, emailId) => {
    const localStorageKey = `UserProfile_${emailId}`;  
    const user = await LocalStorageService.getCachedObject(localStorageKey);
    const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(levelTheme);
    const upsertedStudentKnowMeFileUrl = await TitulinoNetService.upsertStudentKnowMeFile(user?.innerToken, knowMeProgress?.record, "upsertUserKnowMeProgress");


    // const fullKnowMeProgress = await LrnConfiguration.buildFullKnowMeProgressWithCourseCodeId(knowMeProgress, courseCodeId, user?.contactInternalId, emailId);
    return upsertedStudentKnowMeFileUrl;
}

const LrnManager = {
  getUserCourseProgress,
  upsertUserCourseProgress,
  getCourseToken,
  getUserUpperNavigationConfig,
  getGrammarClasses,
  getCourseProgress,
  getUserCoursesForEnrollment,
  getUserBookBaseUrl,
  getUserEBookChapterUrl,
  upsertUserKnowMeProgress
};

export default LrnManager;