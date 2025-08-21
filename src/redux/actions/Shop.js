
import ShopManager from "managers/ShopManager";
import { env } from "../../configs/EnvironmentConfig";

import { 
  ON_PURCHASING_PRODUCT,
  ON_GETTING_PRODUCTS_FOR_PURCHASE,
  ON_GETTING_PRODUCTS_PURCHASED_BY_USER
} from "../constants/Shop";


export const onProcessingPurchaseOfProduct = async (product, emailId) => {   
  const sessionUrls = await ShopManager.getPurchaseSessionUrlId(product, emailId);  
    return {
      type: ON_PURCHASING_PRODUCT,
      sessionUrl: sessionUrls
    }
}

export const onGettingProductsAvailableForPurchase = async (nativeLanguage, course, emailId) => {   
  const catalog = await ShopManager.getProductsForPurchase(nativeLanguage, course, emailId);
    return {
      type: ON_GETTING_PRODUCTS_FOR_PURCHASE,
      productCatalog: catalog
    }
}

export const onGettingProductsPurchasedByUser = async (nativeLanguage, course, emailId) => {   
  const catalog = await ShopManager.getProductsPurchasedByUser(nativeLanguage, course, emailId);
    return {
      type: ON_GETTING_PRODUCTS_PURCHASED_BY_USER,
      productCatalog: catalog
    }
}