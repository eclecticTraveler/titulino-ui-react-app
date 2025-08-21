import LocalStorageService from "services/LocalStorageService";
import TitulinoAuthService from "services/TitulinoAuthService";
import GrammarClassService from "services/GrammarClassService";
import BookChapterService  from "services/BookChapterService";
import DynamicNavigationRouter from "services/DynamicNavigationRouter";
import TitulinoRestService from "services/TitulinoRestService";
import TitulinoNetService from "services/TitulinoNetService";
import ShoppingCatalogService from "services/ShoppingCatalogService";
import StudentProgress from "lob/StudentProgress";
import ShopPurchaseExperience from "lob/ShopPurchaseExperience"
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

const getPurchaseSessionUrlId = async(product, emailId) => {  
  const localStorageKey = `UserProfile_${emailId}`;  
  const user = await LocalStorageService.getCachedObject(localStorageKey);
  const sessionUrl = await TitulinoNetService.getPurchaseSessionUrl(user?.innerToken, product?.priceId, user?.emailId, user?.communicationName, user?.contactPaymentProviderId, user?.contactInternalId, "getPurchaseSessionUrlId");
  return sessionUrl ?? null;
} 

const getProductsForPurchase = async(nativeLanguage, course, emailId) => { 
  const localStorageKey = `UserProfile_${emailId}`;  
  const user = await LocalStorageService.getCachedObject(localStorageKey); 
  const catalog = await ShoppingCatalogService.getProductCatalog(nativeLanguage, course);
  const auditedCatalog = await ShopPurchaseExperience.setUserCoursePurchasesInAvailableCatalog(user?.userCourses, catalog);  
  return auditedCatalog;
} 

const getProductsPurchasedByUser = async(nativeLanguage, course, emailId) => {  
  const localStorageKey = `UserProfile_${emailId}`;  
  const user = await LocalStorageService.getCachedObject(localStorageKey);
  // const purchases = await TitulinoNetService.getUserPurchasedProducts(user?.innerToken, user?.contactInternalId);
  const catalog = await ShoppingCatalogService.getProductCatalog(nativeLanguage, course);

  return [];
  
} 

const ShopManager = {
  getUserCoursesForEnrollment,
  getPurchaseSessionUrlId,
  getProductsForPurchase,
  getProductsPurchasedByUser
};

export default ShopManager;