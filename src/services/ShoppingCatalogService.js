import localShoppingCatalogDataDV from '../assets/data/course-shopping-catalog-data-dv.json';
import localShoppingCatalogDataPD from '../assets/data/course-shopping-catalog-data.json';
import GoogleService from './GoogleService';

import { env } from "configs/EnvironmentConfig";

const loadLocalShoppingData = async() => {
  if(env.ENVIROMENT === "prod"){    
    const rawData = await GoogleService.getCourseShoppingCatalogData("loadLocalShoppingData");
    return rawData;
  }else{
    const rawData = localShoppingCatalogDataDV;
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
