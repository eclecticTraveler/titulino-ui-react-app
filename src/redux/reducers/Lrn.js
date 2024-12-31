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
  ON_LOADING_FIVE_MIN_LESSON,
  ON_LOADING_DUMMY_DATA,
  ON_SELECTING_CORRECTION_MODAL,
  ON_SELECTING_CORRECTION_RECORD,
  ON_LOADING_LANDING_DASHBOARD,
  ON_LOADING_LANDING_PAGE,
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
  ON_UPSERTING_ENROLLMENT_FOR_QUEUE
} from "../constants/Lrn";

const initState = {
  shippingTabKey: 'mailing',
  isToEditShippingAddress: false,
  isToEditUserProfile: false,
  isCorrectionModalOpened: false,
  selectedCoursesToEnroll: []
};

const lrn = (state = initState, action) => {
  switch (action.type) {
    case ON_UPSERTING_ENROLLMENT_FOR_QUEUE:
      return {
        ...state
      }
    case ON_LOGIN_FOR_ENROLLMENT:
      return {
        ...state,
        apiToken: action.apiToken
      }
    case ON_SUBMITTING_ENROLLEE:
      return {
        ...state,
        wasSubmittingEnrolleeSucessful: action.wasSubmittingEnrolleeSucessful
      }
    case ON_LOADING_EBOOK_URL:
      return {
        ...state,
        ebookUrl: action.ebookUrl
      }
    case ON_SEARCHING_FOR_PROGRESS_BY_EMAIL_ID_COURSE_CODE_ID:
      return {
        ...state,
        registeredProgressByEmailId: action.registeredProgressByEmailId,
        studentPercentagesForCourse: action.studentPercentagesForCourse,
        studentCategoriesCompletedForCourse: action.studentCategoriesCompletedForCourse,
        isUserEmailRegisteredForCourse: action.isUserEmailRegisteredForCourse
      }
    case ON_RESETING_USER_PROGRESS_BY_EMAIL_ID:
      return{
        ...state,
        registeredProgressByEmailId: action.registeredProgressByEmailId,
        studentPercentagesForCourse: action.studentPercentagesForCourse,
        studentCategoriesCompletedForCourse: action.studentCategoriesCompletedForCourse
      }
    case ON_SUBMITTING_USER_COURSE_PROGRESS:
      return{
        ...state,
        submittedUserCourseProgress: action.submittedUserCourseProgress,
        wasSubmittingUserCourseProgress: action.wasSubmittingUserCourseProgress
      }
    case ON_LOADING_USER_RESOURCES_BY_COURSE_THEME:
      return {
        ...state,
        currentCourseCodeId: action.currentCourseCodeId,
        courseConfiguration: action.courseConfiguration,
        courseTheme: action.courseTheme
      }
    case ON_REQUESTING_COURSE_PROGRESS_STRUCTURE:
      return {
        ...state
      }
    case ON_SELECTING_ENROLLMENT_COURSES:
      return {
        ...state,
        selectedCoursesToEnroll: action.selectedCoursesToEnroll
      }
    case ON_SEARCHING_FOR_ALREADY_ENROLLED_CONTACT:
      return {
        ...state,
        returningEnrollee: action.returningEnrollee
      }
    case ON_REQUESTING_GEOGRAPHICAL_DIVISION:
      return {
        ...state,
        countryDivisions: action.countryDivisions
      }
    case ON_RENDERING_COURSE_REGISTRATION:
      return {
        ...state,
        countries: action.countries,
        availableCourses: action.availableCourses,
        selfLanguageLevel: action.selfLanguageLevel
      }
    case ON_SEARCHING_FOR_PROGRESS_BY_EMAIL_ID:
      return {
        ...state,
        registeredProgressByEmailId: action.registeredProgressByEmailId,
        studentPercentagesForCourse: action.studentPercentagesForCourse,
        studentCategoriesCompletedForCourse: action.studentCategoriesCompletedForCourse
      }
    case ON_LOADING_LANDING_PAGE:
      return {
        ...state,
        landingObjectPictureOfTheDay: action.landingObjectPictureOfTheDay
      }
    case ON_LOADING_LANDING_DASHBOARD:
      return {
        ...state,
        graphData: action.graphData
      }
    case ON_SELECTING_CORRECTION_MODAL:
      return {
        ...state,        
        isCorrectionModalOpened: action.isCorrectionModalOpened
      }
    case ON_SELECTING_CORRECTION_RECORD:      
      return {
        ...state,
        selectedCorrectionRecord: action.selectedCorrectionRecord
      }
    case ON_LOADING_FIVE_MIN_LESSON:
      return {
        ...state,
        fiveMinuteLesson: action.fiveMinuteLesson
      }
    case ON_ADDRESS_REQUEST:
      return {
        ...state,
        userAddresses: action.userAddresses,
        tabIndexedAddresses: action.tabIndexedAddresses
      }
    case ON_EDIT_USER_PROFILE_CHANGE:
      return {
        ...state,
        isToEditUserProfile: action.isToEditUserProfile
      }
    case ON_EDIT_ADDRESS_CHANGE:    
      return {
        ...state,
        isToEditShippingAddress: action.isToEditShippingAddress
      }
    case ON_SHIPPING_TAB_CHANGE:
      return {
        ...state,
        shippingTabKey: action.shippingTabKey
      }
    case GET_PDF_PATH_URL:
      return {
        ...state,
        pdfPathUrl: action.pdfPathUrl
      }
    case GET_BOOK_CHAPTER_URL:
      return {
        ...state,
        bookChapterUrl: action.bookChapterUrl
      }
    case GET_VIDEO_CLASS_URL:
      return {
        ...state,
        videoClass: action.videoClass
      }
    case GET_QUIZLET_URL:
      return {
        ...state,
        quizletUrl: action.quizletUrl
      }
    case CURRENT_ROUTE_INFO:
      return{
        ...state,
        currentRoute: action.route

      }
    case GET_USER_SELECTED_COURSE:
      return {
        ...state,
        selectedCourse: action.selectedCourse
      }
    case SET_USER_NATIVE_LANGUAGE:
    case GET_USER_NATIVE_LANGUAGE:
      return {
        ...state,
        nativeLanguage: action.nativeLanguage
      }
    case GET_SELECTED_COURSE_FROM_UPPER_NAV_ON_LOAD:
      return {
        ...state,
        courseOnLoad: action.courseOnLoad
      }
    case SET_USER_SELECTED_COURSE:
      return {
        ...state
      }
    case SET_USER_COURSE_CONFIGURATION:
      return {
        ...state
      }
    case GET_ALL_LANGUAGE_COURSES:
      return {
        ...state,
        languageCourses: action.languageCourses
      };
    case GET_WAS_USER_CONFIG_SET_FLAG:
      return {
        ...state,
        wasUserConfigSet: action.wasUserConfigSet
      }
    case GET_UPPER_NAV_BASED_ON_USER_CONFIG:
      return {
        ...state,
        dynamicUpperMainNavigation: action.upperMainNavigation
      }
    case ON_LOADING_DUMMY_DATA:
      return {
        ...state,
        dummyJSONdata: action.dummyJSONdata

      }
    case GET_SELECTED_LEVEL_FROM_UPPER_NAV_ON_CLICK:
      return {
        ...state,
        selectedLevel: action.level
      };
    default:
      return state;
  }
};

export default lrn