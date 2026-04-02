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
import GoogleService from "services/GoogleService";
import localLanguageCourses from "assets/data/lang-courses.data.json";
import { env } from "configs/EnvironmentConfig";

const getUserCourseProgress = async(courseCodeId, emailId) => {
  let courseFilteredProgress = [];
  let studentPercentagesForCourse = {};
  let studentCategoriesCompletedForCourse = {};

  try {
    let courseProgress = [];
    const localStorageKey = `UserProfile_${emailId}`;

    const user = await LocalStorageService.getCachedObject(localStorageKey);

    const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);

    if (token) {
      courseProgress = await TitulinoAuthService.getCourseProgress(courseCodeId, token, "getUserCourseProgress");

      // For now if the user is facilitador or admin given that it will bring the progress of all the users for RLS
      // filter to its own results: TODO
      courseFilteredProgress = courseProgress?.filter(item => item?.EmailId === user?.emailId);
    }

    [studentPercentagesForCourse, studentCategoriesCompletedForCourse] = await Promise.all([
      StudentProgress.calculateUserCourseProgressPercentageForCertificates(courseFilteredProgress),
      StudentProgress.getUserCourseProgressCategories(courseFilteredProgress)
    ]);
  } catch (err) {
    console.error("getUserCourseProgress: failed to fetch progress", err);
  }

  return {
    courseFilteredProgress,
    studentPercentagesForCourse,
    studentCategoriesCompletedForCourse
  };
}

const upsertUserCourseProgress = async(courseProgress, courseCodeId, emailId) => {
  const token = await getCourseToken(courseCodeId, emailId);
  courseProgress = await TitulinoAuthService.upsertCourseProgress(courseProgress, token, "upsertUserCourseProgress");
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
  const selectedLanguageForCourse =  await LocalStorageService.getSelectedContentLanguage();
  
  const mappedCourseNames = LrnConfiguration.mapUserCoursesByTheme(user?.userCourses);  
  const upperMainNavigation = await DynamicNavigationRouter.loadMenu(selectedLanguageForCourse?.contentLanguageCode, isUserAuthenticated, mappedCourseNames );
  return upperMainNavigation;
}

const getAllLanguageOptions = async () => {
  const localLanguageOptions = Array.isArray(localLanguageCourses) ? localLanguageCourses : [];

  if (env.IS_TO_USE_LOCAL_LANG_COURSES_DATA) {
    return localLanguageOptions;
  }

  const remoteLanguageOptions = await GoogleService.getLanguageCoursesData("getAllLanguageOptions");
  return Array.isArray(remoteLanguageOptions) && remoteLanguageOptions.length > 0
    ? remoteLanguageOptions
    : localLanguageOptions;
}

const getGrammarClasses = async(levelNo, chapterNo, baseLanguage, contentLanguage, emailId) => {
    const localStorageKey = `UserProfile_${emailId}`;  
    const user = await LocalStorageService.getCachedObject(localStorageKey);
    const urls = await GrammarClassService.getGrammarClassUrlsByChapter(levelNo, chapterNo, baseLanguage, contentLanguage);
    const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(levelNo);
    const level = utils.getuserLanguageProficiencyOrderIdForCourse(user?.userCourses, courseCodeId);
    const proficiencyLevel = await GrammarClassService.getGrammarCategory(level);

    return {
      urls,
      proficiencyLevel
    };
}

const getCourseProgress = async(courseTheme, baseLanguage, contentLanguage) => {  
  // Content lookup by theme (no courseCodeId needed for UI content)
  const courseConfiguration = await TitulinoRestService.getCourseContentByTheme(baseLanguage, contentLanguage, courseTheme);
  // Derive courseCodeId for DB/enrollment operations
  const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(courseTheme);

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

const getUserBookBaseUrl = async(levelTheme, baseLanguage, contentLanguage, emailId) => {  
  const localStorageKey = `UserProfile_${emailId}`;  

  const user = await LocalStorageService.getCachedObject(localStorageKey);

  const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(levelTheme);

  const tier = utils.getCourseTierFromUserCourses(user?.userCourses, courseCodeId);

  const url = await BookChapterService.getBookTierBaseUrl(levelTheme, baseLanguage, contentLanguage, tier ?? "Free");  

  return url;
} 

const getUserEBookChapterUrl = async(levelTheme, chapterNo, baseLanguage, contentLanguage, emailId) => {  
  const localStorageKey = `UserProfile_${emailId}`;  

  const user = await LocalStorageService.getCachedObject(localStorageKey);

  const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(levelTheme);

  const tier = utils.getCourseTierFromUserCourses(user?.userCourses, courseCodeId);
  
  const url = await BookChapterService.getBookTierChapterUrl(levelTheme, chapterNo, baseLanguage, contentLanguage, tier);

  return url;
} 


const upsertKnowMeProfilePicture = async (fileToUpload, emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);

  if (!user?.contactInternalId || !fileToUpload) {
    console.warn("Missing contactInternalId or fileToUpload, skipping KnowMe upload.");
    return null;
  }

  const uploaded = await TitulinoNetService.upsertStudentKnowMeProfileImage(
    user.innerToken,
    fileToUpload,
    "upsertKnowMeProfilePicture"
  );

  // ✅ Return the URL from backend response
  return uploaded?.profileUrl ?? uploaded?.ProfileUrl ?? null;
};



export const upsertUserKnowMeProgress = async (
  knowMeProgress,   // { record, filesMap }
  levelTheme,
  emailId,
  classNumber = 0
) => {
  const localStorageKey = `UserProfile_${emailId}`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);

  if (!user?.contactInternalId) {
    console.warn("No contactInternalId found, skipping KnowMe upsert.");
    return null;
  }

  // 1. Resolve courseCodeId
  const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(levelTheme);

  // 2. Upload all files in filesMap (if any)
  const uploadedFileMap = {};
  for (const [questionId, files] of Object.entries(knowMeProgress.filesMap || {})) {
    for (const file of files) {
      // build file wrapper (renames for consistency)
      const fileToUpload = await LrnConfiguration.buildStudentKnowMeFileName(
        file,
        user.contactInternalId,
        user?.emailId,
        classNumber
      );
      // TODO: REFACTOR TO ITS ONE METHOD FAR FROM PROFILE RATHER A METHOD THAT STORES IMAGES FOR GIVEN TEST:
      //  but for now we can use upsertKnowMeProfilePicture but later it has to have its own method in relation to classes
      const uploadedUrl = await upsertKnowMeProfilePicture(
        fileToUpload,
        emailId
      );

      if (uploadedUrl) {
        if (!uploadedFileMap[questionId]) uploadedFileMap[questionId] = [];
        uploadedFileMap[questionId].push(uploadedUrl);
      }
    }
  }

  // 3. Merge uploadedFileMap into answers
  const fullKnowMeProgress = await LrnConfiguration.buildMultipleFullKnowMeProgressWithCourseCodeId(
    { record: knowMeProgress.record, uploadedFileMap },
    courseCodeId,
    user.contactInternalId,
    user.emailId
  );

  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);

  // 4. Send to Warehouse
  const progressToUpsert = await TitulinoAuthService.upsertUserKnowMeSubmission(
    fullKnowMeProgress,
    token,
    "upsertUserKnowMeProgress"
  );

  // TESTING TO REMOVE TODO
    // const payloadArray = [
    //     { EmailId: user?.emailId, ContactInternalId: user?.contactInternalId },
    //     { EmailId: 'solorzano2020@gmail.com', ContactInternalId: '0053bc40-9b5b-485c-8ae0-d3de0dec389b'}
    //   ];


    // const ttt = await TitulinoNetService.getContactEnrolleesKnowMeProfileImages(
    //   user?.innerToken,
    //   payloadArray,
    //   180,
    //   "getEnrolleeKnowMeProfilePictureForCourse"
    // );

    // console.log("user profile after upsert", user);
    console.log("progressToUpsert", progressToUpsert);
  return progressToUpsert;
};

export const buildStudentKnowMeFileName = async (file, contactId, emailId, classNumber) => {
  let renamedFile = file;

  if (file) {
    const timestamp = Date.now();

    const parts = file.name.split(".");
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
    const baseName = `${contactId}_${timestamp}${ext ? "." + ext : ""}`;

    renamedFile = new File([file], baseName, { type: file.type });
  }

  return {
    contactId,
    emailId,
    classNumber,
    file: renamedFile,
  };
};



const LrnManager = {
  getUserCourseProgress,
  upsertUserCourseProgress,
  getCourseToken,
  getUserUpperNavigationConfig,
  getAllLanguageOptions,
  getGrammarClasses,
  getCourseProgress,
  getUserCoursesForEnrollment,
  getUserBookBaseUrl,
  getUserEBookChapterUrl,
  upsertUserKnowMeProgress,
  upsertKnowMeProfilePicture,
  buildStudentKnowMeFileName
};

export default LrnManager;
