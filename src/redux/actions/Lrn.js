
import courses from "../../assets/data/lang-courses.data.json"; 
import DynamicNavigationRouter from "../../services/DynamicNavigationRouter";
import LocalStorageService from "../../services/LocalStorageService";
import QuizletService from "../../services/QuizletService";
import VideoClassService from "../../services/VideoClassService";
import GrammarClassService from "services/GrammarClassService";
import LandingWidgetsService from "../../services/LandingWidgetsService";
import ProfileService from "../../services/ProfileService";
import dummyData from "../../assets/data/dummyDW.json";
import GraphService from "../../services/Charting/Admin/GraphService";
import BookChapterService from "services/BookChapterService";
import SpeakingPracticeService from "services/SpeakingPracticeService";
import PdfFileService from "services/PdfFileService";
import GoogleService from "services/GoogleService";
import TitulinoRestService from "services/TitulinoRestService";
import TitulinoNetService from "services/TitulinoNetService";
import StudentProgress from "lob/StudentProgress";
import LrnConfiguration from "lob/LrnConfiguration"
import TitulinoManager from "managers/LrnManager";
import $ from 'jquery'; 

import axios from 'axios';
import { env } from "../../configs/EnvironmentConfig";

import { 
  GET_SELECTED_LEVEL_FROM_UPPER_NAV_ON_CLICK,
  GET_ALL_LANGUAGE_COURSES,
  SET_USER_COURSE_CONFIGURATION,
  GET_WAS_USER_CONFIG_SET_FLAG,
  GET_UPPER_NAV_BASED_ON_USER_CONFIG,
  SET_USER_SELECTED_COURSE,
  GET_SELECTED_COURSE_FROM_UPPER_NAV_ON_LOAD,
  SET_USER_NATIVE_LANGUAGE,
  GET_USER_SELECTED_COURSE,
  GET_USER_NATIVE_LANGUAGE,
  CURRENT_ROUTE_INFO,
  GET_QUIZLET_URL,
  GET_VIDEO_CLASS_URL,
  ON_SHIPPING_TAB_CHANGE,
  ON_EDIT_ADDRESS_CHANGE,
  ON_EDIT_USER_PROFILE_CHANGE,
  ON_ADDRESS_REQUEST,
  ON_LOADING_DUMMY_DATA,
  ON_SELECTING_CORRECTION_RECORD,
  ON_SELECTING_CORRECTION_MODAL,
  ON_LOADING_LANDING_DASHBOARD,
  ON_LOADING_LANDING_PAGE,
  ON_LOADING_FIVE_MIN_LESSON,
  GET_BOOK_CHAPTER_URL,
  GET_PDF_PATH_URL,
  ON_SEARCHING_FOR_PROGRESS_BY_EMAIL_ID,
  ON_RENDERING_COURSE_REGISTRATION,
  ON_REQUESTING_GEOGRAPHICAL_DIVISION,
  ON_SEARCHING_FOR_ALREADY_ENROLLED_CONTACT,
  ON_SELECTING_ENROLLMENT_COURSES,
  ON_REQUESTING_COURSE_PROGRESS_STRUCTURE,
  ON_LOADING_USER_RESOURCES_BY_COURSE_THEME,
  ON_SUBMITTING_USER_COURSE_PROGRESS,
  ON_RESETING_USER_PROGRESS_BY_EMAIL_ID,
  ON_SEARCHING_FOR_PROGRESS_BY_EMAIL_ID_COURSE_CODE_ID,
  ON_LOADING_EBOOK_URL,
  ON_SUBMITTING_ENROLLEE,
  ON_LOGIN_FOR_ENROLLMENT,
  ON_UPSERTING_ENROLLMENT_FOR_QUEUE,
  ON_RESET_SUBMITTING_ENROLLEE,
  GET_LISTENING_PRACTICE_MODULE,
  ON_LOADING_ENROLEE_BY_REGION,
  ON_VERIFYING_FOR_PROGRESS_BY_EMAIL_ID_COURSE_CODE_ID,
  ON_MODAL_INTERACTION,
  ON_LOADING_VIDEO_CLASS_ARRAY_URLS,
  ON_FETCHING_USER_AUTHENTICATED_PROGRESS_FOR_COURSE,
  ON_VERIFYING_IF_USER_IS_ENROLLED_IN_COURSE,
  ON_USER_SELECTING_COURSE
} from "../constants/Lrn";
import LrnManager from "managers/LrnManager";

export const onRequestingGraphForLandingDashboard = async() => {
  const graph = await GraphService.getDashboardData();
  return {
    type: ON_LOADING_LANDING_DASHBOARD,
    graphData: graph
  }
}

export const onDummyDataLoad = async() => {  
  return {
    type: ON_LOADING_DUMMY_DATA,
    dummyJSONdata: dummyData
  }
}

export const onAddressRequestLoad = async(id) => {
  const rawUserAddresses =  await ProfileService.getCompanyAddressesByCompanyId("token", 11, "onAddressRequestLoad");
  const addressesTabIndexes = await ProfileService.formCompanyAddressTypesByIdForTabIndexing(rawUserAddresses);
  return {
    type:ON_ADDRESS_REQUEST,
    userAddresses: rawUserAddresses[0]?.companyAddresses,
    tabIndexedAddresses: addressesTabIndexes
  }
}

export const onIsToEditUserProfileChange = async(value) => {
  return {
    type:ON_EDIT_USER_PROFILE_CHANGE,
    isToEditUserProfile: value 
  }
}

export const onIsToEditShippingAddressChange = async(value) => {
  return {
    type: ON_EDIT_ADDRESS_CHANGE,
    isToEditShippingAddress: value
  }
} 

export const onShippingKeyTabChange = async(key) => {
  return {
    type: ON_SHIPPING_TAB_CHANGE,
    shippingTabKey: key
  }
}

export const onLoadingLandingPicture = async (isToRetrieveByNewDate) => {
  const landingPicture = await LandingWidgetsService.getLandingPicture();
  const landingPictureOfTheDay = await LocalStorageService.processLandingPicture(landingPicture, isToRetrieveByNewDate)
  return {
    type: ON_LOADING_LANDING_PAGE,
    landingObjectPictureOfTheDay: landingPictureOfTheDay
  }
}

export const getAllLanguageCourses = async () => {
  const languageCourses = courses; 
  return {
    type: GET_ALL_LANGUAGE_COURSES,
    languageCourses: languageCourses
  }
}

export const getVideoClassUrl = async (levelNo, chapterNo, nativeLanguage, course) => {
const url = await VideoClassService.getVideoClassUrl(levelNo, chapterNo, nativeLanguage, course);
  return {
    type: GET_VIDEO_CLASS_URL,
    videoClass: url
  }
}

export const ongettingVideoClassArrayUrls = async (levelNo, chapterNo, nativeLanguage, course) => {
  const urls = await GrammarClassService.getGrammarClassUrlsByChapter(levelNo, chapterNo, nativeLanguage, course);
    return {
      type: ON_LOADING_VIDEO_CLASS_ARRAY_URLS,
      videoClassUrls: urls
    }
  }

export const getBookChapterUrl = async (levelTheme, chapterNo, nativeLanguage, course) => {
  const url = await BookChapterService.getBookChapterUrl(levelTheme, chapterNo, nativeLanguage, course);
    return {
      type: GET_BOOK_CHAPTER_URL,
      bookChapterUrl: url
    }
  }


export const getSpeakingPracticeModule = async (levelTheme, chapterNo, nativeLanguage, course) => {
  const uri = await GoogleService.getGCUriForImages("getSpeakingPracticeModule", levelTheme); 
  const module = await SpeakingPracticeService.getSpeakingChapterModule(levelTheme, chapterNo, nativeLanguage, course);
    return {
      type: GET_LISTENING_PRACTICE_MODULE,
      speakingChapterModule: module,
      gcBucketUri: uri
    }
  }  


export const geteBookUrl = async (levelTheme, nativeLanguage, course) => {
  const url = await BookChapterService.getBookBaseUrl(levelTheme, nativeLanguage, course);
    return {
      type: ON_LOADING_EBOOK_URL,
      ebookUrl: url
    }
  }

export const getPdfPathUrl = async (levelTheme, chapterNo, nativeLanguage, course) => {
  const url = await PdfFileService.getPdfPathUrl(levelTheme, chapterNo, nativeLanguage, course);
    return {
      type: GET_PDF_PATH_URL,
      pdfPathUrl: url
    }
  }


export const onSelectingEnrollmentCourses = async (selectedCourses) => {
    return {
      type: ON_SELECTING_ENROLLMENT_COURSES,
      selectedCoursesToEnroll: selectedCourses
    }
  }   
  
export const onRenderingCourseRegistration = async () => {
  // Since they dont depend on each other lets call them at the same time
  const [countries, availableCourses, selfLanguageLevel] = await Promise.all([
    TitulinoRestService.getCountries("onRenderingCourseRegistration"),
    TitulinoRestService.getAvailableCourses(null, "onRenderingCourseRegistration"),
    TitulinoRestService.getSelfDeterminedLanguageLevelCriteria("onRenderingCourseRegistration")
  ]);

    return {
      type: ON_RENDERING_COURSE_REGISTRATION,
      countries: countries,
      availableCourses: availableCourses,
      selfLanguageLevel: selfLanguageLevel
    }
  }

  export const onSearchingForAlreadyEnrolledContact = async (email, year) => {
    const returningEnrolleeCountryDivisionInfo = email ? await TitulinoRestService.getQuickEnrolleeCountryDivisionInfo(email, year, "onSearchingForAlreadyEnrolledContact") : [];
    return {
      type: ON_SEARCHING_FOR_ALREADY_ENROLLED_CONTACT,
      returningEnrollee: returningEnrolleeCountryDivisionInfo
    }
  }

export const onLoginForEnrollment = async () => {
  const token = await TitulinoNetService.getRegistrationToken("onLoginEnrolleeContact");
  return {
    type: ON_LOGIN_FOR_ENROLLMENT,
    apiToken: token
  }
}

export const onUpsertingEnrollment = async (apiToken, enrolle) => {
  const enrollee = await TitulinoNetService.upsertEnrollment(apiToken, enrolle, onUpsertingEnrollment)
  return {
    type: ON_UPSERTING_ENROLLMENT_FOR_QUEUE,
  }
}

export const onRequestingGeographicalDivision = async (countryId) => {
  const countryDivisions = await TitulinoRestService.getCountryDivisionByCountryId(countryId);
    return {
      type: ON_REQUESTING_GEOGRAPHICAL_DIVISION,
      countryDivisions: countryDivisions
    }
  }

export const onSubmittingUserCourseProgress = async (email, courseProgress) => {
  const submittedUserCourseProgress = await TitulinoRestService.upsertUnauthenticatedUserCourseProgress(email, courseProgress, "onSubmittingUserCourseProgress");
  let wasSuccessful = false;
  if(email === submittedUserCourseProgress[0]?.email){
    wasSuccessful = true;
  }
  
  return {
    type: ON_SUBMITTING_USER_COURSE_PROGRESS,
    submittedUserCourseProgress: wasSuccessful ? submittedUserCourseProgress : [],
    wasSubmittingUserCourseProgress: wasSuccessful
  }
}

export const onSubmittingEnrollee = async (enrollees, isFullEnrollment) => {
  let submittedEnrollee = [];
  let wasSuccessful = false;
  const token = await TitulinoNetService.getRegistrationToken("onLoginEnrolleeContact");
  if(token){
    submittedEnrollee = await TitulinoNetService.upsertEnrollment(token, enrollees, "onSubmittingEnrollee");
    console.log("submittedEnrollee Net", submittedEnrollee?.length > 0);
    if(submittedEnrollee?.length > 0){
      wasSuccessful = true;
    }else{
      // Backup
      submittedEnrollee = await TitulinoRestService.upsertFullEnrollment(enrollees, "onSubmittingEnrollee");
      console.log("submittedEnrollee DW");
      if(submittedEnrollee?.length > 0){
        wasSuccessful = true;
      }else{
        wasSuccessful = false;
      }
    }
  }else{
    submittedEnrollee = await TitulinoRestService.upsertFullEnrollment(enrollees, "onSubmittingEnrollee");
    console.log("submittedEnrollee 2nd DW");
    if(submittedEnrollee){
      wasSuccessful = true;
    }else{
      wasSuccessful = false;
    }
  }
  return {
    type: ON_SUBMITTING_ENROLLEE,
    wasSubmittingEnrolleeSucessful: wasSuccessful
  }
}

export const onResetSubmittingEnrollee = async (resetValue) => {
  return {
    type: ON_RESET_SUBMITTING_ENROLLEE,
    wasSubmittingEnrolleeSucessful: resetValue
  }
}

export const onRequestingCourseProgressStructure = async (nativeLanguage, course, courseCodeId ) => {
  const courseStructure = await TitulinoRestService.getCourseProgressStructure(nativeLanguage, course, courseCodeId);
    return {
      type: ON_REQUESTING_COURSE_PROGRESS_STRUCTURE,
    }
  }

  export const onLoadingEnrolleeByRegion = async (courseTheme) => {
    //NOTE this will later need to be refactor to get the course via TitulinoNet and 
    // It will handle the caching through REDIS, but for now its okay
    
    // Get `courseCodeId` for the given `courseTheme`
    const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(courseTheme);
  
    // Dynamic local storage key based on `courseCodeId`
    const localStorageKey = `EnrolleesByCourse_${courseCodeId}`;
    
    // Check local storage for cached data
    const cachedData = await LocalStorageService.getEnrolleesByCourse(localStorageKey);
  
    if (cachedData && Object.keys(cachedData).length > 0) {
      // Use cached data if available
      return {
        type: ON_LOADING_ENROLEE_BY_REGION,
        enrolleeCountByRegion: cachedData?.transformedArray,
        totalEnrolleeCount: cachedData?.totalEnrolleeCount,
      };
    }
  
    // Fetch fresh data if no valid cache exists
    const countByRegion = await TitulinoRestService.getEnrolleeCountryCountByCourseCodeId(courseCodeId, "onLoadingEnrolleeByRegion");
    const { transformedArray, totalEnrolleeCount } = await StudentProgress.transformEnrolleeGeographycalResidencyData(countByRegion);
  
    // Save fetched and transformed data to local storage with expiry (e.g., 60 minutes)
    await LocalStorageService.setEnrolleesByCourse(
      { transformedArray, totalEnrolleeCount }, // Save both and set 60 min expiration     
      localStorageKey,
      60
    );
  
    // Return fresh data
    return {
      type: ON_LOADING_ENROLEE_BY_REGION,
      enrolleeCountByRegion: transformedArray,
      totalEnrolleeCount: totalEnrolleeCount,
    };
  };
  
   

export const onSearchingForProgressByEmailId = async (email) => {
  const registeredProgressById = await GoogleService.getProgressByEmailId(email, "onSearchingForProgressByEmailId");
  const [studentPercentagesForCourse, studentCategoriesCompletedForCourse] = await Promise.all([
    StudentProgress.calculatePercentageForSupermarketCertificates(registeredProgressById),
    StudentProgress.getCategoriesObtainedByEmailForSupermarketCourse(registeredProgressById)
  ]);
  
  return {
    type: ON_SEARCHING_FOR_PROGRESS_BY_EMAIL_ID,
    registeredProgressByEmailId: registeredProgressById,
    studentPercentagesForCourse: studentPercentagesForCourse,
    studentCategoriesCompletedForCourse: studentCategoriesCompletedForCourse
  }
}


export const onModalInteraction = async (hasUserInteractedWithModal) => {
  return {
    type: ON_MODAL_INTERACTION,
    hasUserInteractedWithModal: hasUserInteractedWithModal
  }
}

export const onSearchingForProgressByEmailIdAndCourseCodeId = async (email, courseCodeId, courseLanguageId) => {
  // Get courseId in Factory
  const isUserEmailRegisteredForCourse = await TitulinoRestService.isUserEmailRegisteredForGivenCourse(email, courseCodeId, "onSearchingForProgressByEmailIdAndCourseCodeId");
  let registeredProgress = [];
  if(isUserEmailRegisteredForCourse){
    // Get records for registered unauthenticated users
    registeredProgress = await TitulinoRestService.getCourseProgressByEmailCourseCodeIdAndLanguageId(email, courseCodeId, courseLanguageId, "onSearchingForProgressByEmailIdAndCourseCodeId");
  }else{
    // Get records for unregistered users
    registeredProgress = await TitulinoRestService.getCourseProgressByEmailAndCourseCodeId(email, courseCodeId, "onSearchingForProgressByEmailIdAndCourseCodeId");
  }

  const [studentPercentagesForCourse, studentCategoriesCompletedForCourse] = await Promise.all([
    StudentProgress.calculateUserCourseProgressPercentageForCertificates(registeredProgress),
    StudentProgress.getUserCourseProgressCategories(registeredProgress)
  ]);

  return {
    type: ON_SEARCHING_FOR_PROGRESS_BY_EMAIL_ID_COURSE_CODE_ID,
    registeredProgressByEmailId: registeredProgress,
    studentPercentagesForCourse: studentPercentagesForCourse,
    studentCategoriesCompletedForCourse: studentCategoriesCompletedForCourse,
    isUserEmailRegisteredForCourse: isUserEmailRegisteredForCourse
  }
}

export const onVerifyingProgressByEmailIdAndCourseCodeId = async (yearOfBirth, email, courseCodeId, courseLanguageId) => {
  // Get courseId in Factory
  const isUserEmailRegisteredForCourse = await TitulinoRestService.isUserEmailRegisteredInCourse(yearOfBirth, email, courseCodeId, "onSearchingForProgressByEmailIdAndCourseCodeId");
  let registeredProgress = [];
  if(isUserEmailRegisteredForCourse){
    // Get records for registered unauthenticated users
    registeredProgress = await TitulinoRestService.getCourseProgressByYearOfBirthEmailCourseCodeIdAndLanguageId(yearOfBirth, email, courseCodeId, courseLanguageId, "onSearchingForProgressByEmailIdAndCourseCodeId");
  }else{
    // Get records for unregistered users
    registeredProgress = await TitulinoRestService.getCourseProgressByEmailAndCourseCodeId(email, courseCodeId, "onSearchingForProgressByEmailIdAndCourseCodeId");
  }

  const [studentPercentagesForCourse, studentCategoriesCompletedForCourse] = await Promise.all([
    StudentProgress.calculateUserCourseProgressPercentageForCertificates(registeredProgress),
    StudentProgress.getUserCourseProgressCategories(registeredProgress)
  ]);
  
  return {
    type: ON_VERIFYING_FOR_PROGRESS_BY_EMAIL_ID_COURSE_CODE_ID,
    registeredProgressByEmailId: registeredProgress,
    studentPercentagesForCourse: studentPercentagesForCourse,
    studentCategoriesCompletedForCourse: studentCategoriesCompletedForCourse,
    isUserEmailRegisteredForCourse: isUserEmailRegisteredForCourse
  }
}

export const onResetingProgressByEmailIdAndCourseCodeId = async () => {  
  return {
    type: ON_RESETING_USER_PROGRESS_BY_EMAIL_ID,
    registeredProgressByEmailId: null,
    studentPercentagesForCourse: null,
    studentCategoriesCompletedForCourse: null,
    isUserEmailRegisteredForCourse: null,
    hasUserInteractedWithModal: null
  }
}

export const onLoadingFiveMinLesson = async (levelNo, nativeLanguage, course, isToRetrieveByNewDate) => {
  const fiveMinuteLesson = await LandingWidgetsService.getFiveMinuteRandomLesson(levelNo, nativeLanguage, course);
    return {
      type: ON_LOADING_FIVE_MIN_LESSON,
      fiveMinuteLesson: fiveMinuteLesson
    }
  }

export const getQuizletUrl = async (modality, chapterNo, levelNo, nativeLanguage, course) => {
  const url = await QuizletService.getEmbeddableUrl(modality, chapterNo, levelNo, nativeLanguage, course);
  return {
    type: GET_QUIZLET_URL,
    quizletUrl: url
  }
}

export const getUserSelectedCourse = async () => {
  const selectedCourse = await LocalStorageService.getUserSelectedCourse();
  return {
    type: GET_USER_SELECTED_COURSE,
    selectedCourse: selectedCourse
  }
}

export const setUserSelectedCourse = async (courseSelected) => {
  LocalStorageService.setUserSelectedCourse(courseSelected);
  return {
    type: SET_USER_SELECTED_COURSE
  }
}

export const onUserSelectingCourse = async (courseSelected) => { 
  // Save selected course
  await LocalStorageService.setUserSelectedCourse(courseSelected);

  // Retrieve course after setting it
  const selectedCourse = await LocalStorageService.getUserSelectedCourse();
 
  return {
    type: ON_USER_SELECTING_COURSE,
    selectedCourse: selectedCourse
  };
};

export const getUserNativeLanguage = async () => {
  const nativeLanguage = await LocalStorageService.getUserSelectedNativeLanguage();
  return {
    type: GET_USER_NATIVE_LANGUAGE,
    nativeLanguage: nativeLanguage
  }
}

export const setUserNativeLanguage = async (lang) => {	
  LocalStorageService.setUserSelectedNativeLanguage(lang);  
  return {
    type: SET_USER_NATIVE_LANGUAGE,
    nativeLanguage: lang
  }
}

export const setUserCourseConfiguration = async (nativeLanguage, courseToLearn) => {
  LocalStorageService.setUserConfiguration(nativeLanguage, courseToLearn);

  return {
    type: SET_USER_COURSE_CONFIGURATION
  }
}

export const getWasUserConfigSetFlag = async (keyword) => {     
  const nativeLanguage = await LocalStorageService.getUserSelectedNativeLanguage();
  const selectedCourse =  await LocalStorageService.getUserSelectedCourse();
  const wasUserConfigSet = (selectedCourse && nativeLanguage) ? true : false;
  if(keyword === "reset"){
    return {
      type: GET_WAS_USER_CONFIG_SET_FLAG,
      wasUserConfigSet: undefined
    }
  }else{
    return {
      type: GET_WAS_USER_CONFIG_SET_FLAG,
      wasUserConfigSet: wasUserConfigSet
    }
  }
}

export const getUpperNavigationBasedOnUserConfig = async (isAuthenticated, emailId) => {  
  const upperMainNavigation = await LrnManager.getUserUpperNavigationConfig(isAuthenticated, emailId);
  return {
    type: GET_UPPER_NAV_BASED_ON_USER_CONFIG,
    upperMainNavigation: upperMainNavigation
  }
}

export const onCurrentRouteInfo = async (route) => {
  return{
    type: CURRENT_ROUTE_INFO,
    route:route
  }
}

export const toggleUpperNavigationLevelSelection = async (level) => {  
  //TITULINO: To be used no need for now
  const selectedLevel = {};
  return {
    type: GET_SELECTED_LEVEL_FROM_UPPER_NAV_ON_CLICK,
    level:selectedLevel
  }
}

export const toggleSelectedUpperNavigationTabOnLoad = (path, dynamicUpperMainNavigation) => {
  const pathArray = path.split('/');
  const courseOnLoad = pathArray[3]; // Last course in the url

  if (!courseOnLoad || !dynamicUpperMainNavigation) {
    return {
      type: GET_SELECTED_COURSE_FROM_UPPER_NAV_ON_LOAD,
      courseOnLoad,
    };
  }

  // Create a new navigation array, setting 'current' properly without mutation
  const updatedNavigation = dynamicUpperMainNavigation?.map(menuItem => {
    return {
      ...menuItem,
      current: menuItem.key === courseOnLoad
    };
  });

  return {
    type: GET_SELECTED_COURSE_FROM_UPPER_NAV_ON_LOAD,
    courseOnLoad,
    updatedNavigation, // send the updated navigation with current flags set
  };
};


export const onCorrectionsModalChange = async(isCorrectionModalOpened) => {
  return {
    type: ON_SELECTING_CORRECTION_MODAL,
    isCorrectionModalOpened: isCorrectionModalOpened
  }
}

export const onSelectingCorrectionToEdit = async(record) => {
  return {
    type: ON_SELECTING_CORRECTION_RECORD,
    selectedCorrectionRecord: record,
  }
}

/////////////////////////////
// Authenticated Section
/////////////////////////////
export const onFetchingUserAuthenticatedProgressForCourse = async (courseCodeId, emailId) => {
  const { courseFilteredProgress, studentPercentagesForCourse, studentCategoriesCompletedForCourse } =
  await TitulinoManager.getUserCourseProgress(courseCodeId, emailId);

  return {
    type: ON_FETCHING_USER_AUTHENTICATED_PROGRESS_FOR_COURSE,
    userRegisteredProgressByCourse: courseFilteredProgress,
    studentPercentagesForCourse: studentPercentagesForCourse,
    studentCategoriesCompletedForCourse: studentCategoriesCompletedForCourse
  }
}

export const onSubmittingUserAuthenticatedProgressForCourse = async (courseProgress, courseCodeId, emailId) => {
  const submittedUserCourseProgress = await TitulinoManager.upsertUserCourseProgress(courseProgress, courseCodeId, emailId);
  
  return {
    type: ON_SUBMITTING_USER_COURSE_PROGRESS,
    submittedUserCourseProgress:submittedUserCourseProgress,
  }
}

export const onVerifyingIfUserIsEnrolledInCourse = async (courseTheme, emailId) => {

  // Get courseId in Factory
 const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(courseTheme);
 const userIsEnrolled = await TitulinoManager.getCourseToken(courseCodeId, emailId)
 
  return {
    type: ON_VERIFYING_IF_USER_IS_ENROLLED_IN_COURSE,
    userIsEnrolledInCourse: !!userIsEnrolled
  }
}

export const ongettingUserVideoClassArrayUrls = async (levelNo, chapterNo, nativeLanguage, course, emailId) => {
  const { urls, proficiencyLevel } = await LrnManager.getGrammarClasses(levelNo, chapterNo, nativeLanguage, course, emailId);
  return {
    type: ON_LOADING_VIDEO_CLASS_ARRAY_URLS,
    videoClassUrls: urls,
    userProficiencyOrder: proficiencyLevel
  }
}


export const onLoadingUserResourcesByCourseTheme = async (courseTheme, nativeLanguage, course) => {
 const { courseCodeId, courseConfiguration } = await LrnManager.getCourseProgress(courseTheme, nativeLanguage, course)
  return {
    type: ON_LOADING_USER_RESOURCES_BY_COURSE_THEME,
    currentCourseCodeId: courseCodeId,
    courseConfiguration: courseConfiguration,
    courseTheme: courseTheme
  }
}


export const onRenderingUserCoursesAvailableForRegistration = async (emailId) => {
  const {countries, userCoursesAvailableForUserToRegistered, selfLanguageLevel} = await LrnManager.getUserCoursesForEnrollment(emailId);
    return {
      type: ON_RENDERING_COURSE_REGISTRATION,
      countries: countries,
      availableCourses: userCoursesAvailableForUserToRegistered,
      selfLanguageLevel: selfLanguageLevel
    }
  }


  export const getUserEBookUrl = async (levelTheme, nativeLanguage, course, emailId) => {   
    const url = await LrnManager.getUserBookBaseUrl(levelTheme, nativeLanguage, course, emailId);
      return {
        type: ON_LOADING_EBOOK_URL,
        ebookUrl: url
      }
  }

  export const getUserEBookChapterUrl = async (levelTheme, chapterNo, nativeLanguage, course, emailId) => {        
    const url = await LrnManager.getUserEBookChapterUrl(levelTheme, chapterNo, nativeLanguage, course, emailId);
      return {
        type: GET_BOOK_CHAPTER_URL,
        bookChapterUrl: url
      }
    }