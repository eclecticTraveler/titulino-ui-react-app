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
  ON_KC_AUTHENTICATION,
  ON_SHIPPING_TAB_CHANGE,
  ON_EDIT_ADDRESS_CHANGE,
  ON_EDIT_USER_PROFILE_CHANGE,
  ON_ADDRESS_REQUEST,
  ON_LANDING_PAGE_RELOAD,
  ON_LOADING_DUMMY_DATA,
  ON_SELECTING_CORRECTION_MODAL,
  ON_SELECTING_CORRECTION_RECORD,
  ON_LOADING_LANDING_DASHBOARD
} from "../constants/Lrn";

const initState = {
  shippingTabKey: 'mailing',
  isToEditShippingAddress: false,
  isToEditUserProfile: false,
  isCorrectionModalOpened: false
};

const lrn = (state = initState, action) => {
  switch (action.type) {
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
    case ON_LANDING_PAGE_RELOAD:
      return {
        ...state
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
    case ON_KC_AUTHENTICATION:
      return {
        ...state,
        keycloakRedux: action.keycloakRedux
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