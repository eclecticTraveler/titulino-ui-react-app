import localShoppingCatalogData from '../assets/data/course-shopping-catalog-data.json';
import GoogleService from './GoogleService';
import { env } from "configs/EnvironmentConfig";

const loadLocalShoppingData = async() => {
  console.log("🔄 Loading local shopping catalog data from env.ENVIROMENT...", env.ENVIROMENT);
  if(env.ENVIROMENT === "prod"){
    console.log("🌐 Loading shopping catalog data from Google Bucket PD...");
    const rawData = await GoogleService.getCourseShoppingCatalogData("loadLocalShoppingData");
    return rawData;
  }else{
    console.log("🌐 Loading shopping catalog from local DV...");
    const rawData = localShoppingCatalogData;
    return rawData;  
  }
}

const loadRequestedShoppingCatalog = async(baseLanguageCode, contentLanguageCode) => {  
  const rawShoppingData = await loadLocalShoppingData();
  const filteredShoppingData = rawShoppingData?.filter(c => (c.contentLanguageCode === contentLanguageCode && c.baseLanguages?.includes(baseLanguageCode)))
                                              ?.sort((a, b) => a.displayOrderId - b.displayOrderId);
  return filteredShoppingData ?? [];
}

export const getProductCatalog = async(baseLanguageCode, contentLanguageCode) => {
    const catalog = await loadRequestedShoppingCatalog(baseLanguageCode, contentLanguageCode);
    return catalog;
}

const ShoppingCatalogService = {
  getProductCatalog
};

export default ShoppingCatalogService;
