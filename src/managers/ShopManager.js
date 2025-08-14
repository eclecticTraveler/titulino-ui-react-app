import LocalStorageService from "services/LocalStorageService";
import TitulinoAuthService from "services/TitulinoAuthService";
import GrammarClassService from "services/GrammarClassService";
import BookChapterService  from "services/BookChapterService";
import DynamicNavigationRouter from "services/DynamicNavigationRouter";
import TitulinoRestService from "services/TitulinoRestService";
import TitulinoNetService from "services/TitulinoNetService";
import ShoppingCatalogService from "services/ShoppingCatalogService";
import StudentProgress from "lob/StudentProgress";
import utils from 'utils';


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

const getPurchaseSessionUrl = async(productId, emailId) => {  
  const localStorageKey = `UserProfile_${emailId}`;  
  const user = await LocalStorageService.getCachedObject(localStorageKey);
  const url = await TitulinoNetService.getPurchaseSessionUrl(user?.innerToken, productId, user?.emailId, user?.communicationName, user?.contactPaymentId);
  return url;
} 

const getProductsForPurchase = async(nativeLanguage, course) => {  
  const catalog = await ShoppingCatalogService.getProductCatalog(nativeLanguage, course)
  return catalog;
  
} 


const ShopManager = {
  getUserCoursesForEnrollment,
  getPurchaseSessionUrl,
  getProductsForPurchase
};

export default ShopManager;