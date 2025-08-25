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

const loadRequestedShoppingCatalog = async(nativeLanguage, course) => {  
  const rawShoppingData = await loadLocalShoppingData();
  const filteredShoppingData = rawShoppingData?.filter(c => (c.course === course && c.nativeLanguage === nativeLanguage))
                                              ?.sort((a, b) => a.display_order - b.display_order);
  return filteredShoppingData ?? [];
}

export const getProductCatalog = async(nativeLanguage, course) => {
    const catalog = await loadRequestedShoppingCatalog(nativeLanguage, course);
    return catalog;
}

const ShoppingCatalogService = {
  getProductCatalog
};

export default ShoppingCatalogService;
