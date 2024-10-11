
import courses from "../../assets/data/lang-courses.data.json"; 
import DynamicNavigationRouter from "../../services/DynamicNavigationRouter";
import LocalStorageService from "../../services/LocalStorageService";
import QuizletService from "../../services/QuizletService";
import VideoClassService from "../../services/VideoClassService";
import LandingWidgetsService from "../../services/LandingWidgetsService";
import ProfileService from "../../services/ProfileService";
import dummyData from "../../assets/data/dummyDW.json";
import GraphService from "../../services/Charting/Admin/GraphService";
import BookChapterService from "services/BookChapterService";
import PdfFileService from "services/PdfFileService";
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
  GET_PDF_PATH_URL
} from "../constants/Lrn";

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


export const getBookChapterUrl = async (levelTheme, chapterNo, nativeLanguage, course) => {
  const url = await BookChapterService.getBookChapterUrl(levelTheme, chapterNo, nativeLanguage, course);
    return {
      type: GET_BOOK_CHAPTER_URL,
      bookChapterUrl: url
    }
  }

export const getPdfPathUrl = async (levelTheme, chapterNo, nativeLanguage, course) => {
  const url = await PdfFileService.getPdfPathUrl(levelTheme, chapterNo, nativeLanguage, course);
    return {
      type: GET_PDF_PATH_URL,
      pdfPathUrl: url
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
  const selectedCourse =  await LocalStorageService.getUserSelectedCourse();
  return {
    type: GET_USER_SELECTED_COURSE,
    selectedCourse: selectedCourse
  }
}

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

export const setUserSelectedCourse = async (courseSelected) => {
  LocalStorageService.setUserSelectedCourse(courseSelected);
  return {
    type: SET_USER_SELECTED_COURSE
  }
}

export const getWasUserConfigSetFlag = async () => {   
  const nativeLanguage = await LocalStorageService.getUserSelectedNativeLanguage();
  const selectedCourse =  await LocalStorageService.getUserSelectedCourse();
  const wasUserConfigSet = (selectedCourse && nativeLanguage) ? true : false;
  return {
    type: GET_WAS_USER_CONFIG_SET_FLAG,
    wasUserConfigSet: wasUserConfigSet
  }
}

export const getUpperNavigationBasedOnUserConfig = async () => {  
  const selectedCourse =  await LocalStorageService.getUserSelectedCourse();
  const upperMainNavigation = await DynamicNavigationRouter.loadMenu(selectedCourse?.courseAbbreviation);
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

export const toggleSelectedUpperNavigationTabOnLoad = async(path, dynamicUpperMainNavigation) => {
  const pathArray = path.split('/');
  const courseOnLoad = pathArray[3]; // Last course in the url
  if(courseOnLoad){
    dynamicUpperMainNavigation?.forEach(function(mainNavMenu){
      if(mainNavMenu.current === true ){
        mainNavMenu.current = false;
      }
      if(mainNavMenu.key === courseOnLoad && mainNavMenu.current === false){
        mainNavMenu.current = true;
      }
    })
  }
  
  return {
    type: GET_SELECTED_COURSE_FROM_UPPER_NAV_ON_LOAD,
    courseOnLoad:courseOnLoad
  }
}

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











// export const getLanguageCoursesAvailableByNativeLanguage = async (lang) => {

// }

// export const getNativeLanguagesAvailableBySelectedCourse = async (course) => {

// }

// export const setUserNativeLanguage = async (lang) => {
//   // Set the language
// }

// export const setUserSelectedCourse = async (course) => {
//   // Set Course
// }

// export const getUserNativeLanguage = async (lang) => {
//   // Get the language
// }



// export const setUserBasicConfigurationFlag = async (flag) => {
//   // Set the Flag
// }

// export const getUserBasicConfigurationFlag = async () => {
//   // Get Flag
// }

// export const setExperienceToogleFlagStatus = async (isNewExperienceRequested) => { 
//   UserService.setExagoExperienceFlagStatus(isNewExperienceRequested);
//   return {
//     type: SET_EXPERIENCE_TOOGLE_FLAG
//   }
// }

// export const getExperienceToogleFlagStatus = async () => {   
//   let cachedFlag = await UserService.getExagoExperienceFlagStatus();
//   if(cachedFlag == null){
//     cachedFlag = env.IS_NEW_EXPERIENCE_VIEW_ON ?? EXAGO_EXPERIENCE_DEFAULT;
//   }

//   return {
//     type: GET_EXPERIENCE_TOOGLE_FLAG,
//     exagoRequestedFlag: cachedFlag
//   }
// }


// export const isServiceAvailableForUser = async(serviceName) => {  
//   let mainNav = mainNavigationConfig;
//   let isServiceAvailable = false;
//   mainNav.forEach(function(service){      
//     if(service.key === serviceName){
//       isServiceAvailable = service.isServiceAvailableForUser;
//       if(isServiceAvailable){
//         //setVantageAgency();
//       }
//     }
//   });

//   return {
//     type: IS_SERVICE_AVAILABLE_FOR_USER,
//     isSubscribedToService: isServiceAvailable
//   }
// };



// export const toggleSelectedUpperNavigationTabOnLoad = async(path) => {
//   const pathArray = path.split('/');
//   const serviceOnLoad = pathArray[2];

//   if(serviceOnLoad){
//     mainNavigationConfig.forEach(function(mainNavMenu){
//       if(mainNavMenu.current === true ){
//         mainNavMenu.current = false;
//       }
//       if(mainNavMenu.key === serviceOnLoad && mainNavMenu.current === false){
//         mainNavMenu.current = true;
//       }
//     })
//   }
  
//   return {
//     type: GET_SELECTED_SERVICE_FROM_UPPER_NAV_ON_LOAD,
//     serviceOnLoad:serviceOnLoad
//   }
// }


// export const displayLanguageConfigModal = async(isToDisplay) => {
//   return {
//     type: DISPLAY_TRAINING_LOGIN,
//     isTodisplayTrainingLoging: isToDisplay
//   }
// }

// export const dummyMethod = async(username, password) => {
//   let wasMappedSuccesfully = false;
//   let haveCredentialsbeenSubmited = false;
//   let responseServerMessage = "";

//   if(username && password){

//     const endpointResponse = await mapTrainingCredentials(username, password, UserService.getToken(), "redux call");

//     wasMappedSuccesfully = (endpointResponse?.wasMappedSuccesfully) ? true : false;
//     responseServerMessage = endpointResponse?.responseMessage;
//     haveCredentialsbeenSubmited = true;
//   }

//   return{
//     type: SUBMIT_TRAINING_CREDENTIALS,
//     areCredentialsMappedSuccesfully: wasMappedSuccesfully,
//     haveCredentialsbeenSubmited: haveCredentialsbeenSubmited,
//     responseServerMessage: responseServerMessage
//   }
//}



