
import ShopManager from "managers/ShopManager";
import { env } from "../../configs/EnvironmentConfig";

import { 
  ON_PURCHASING_PRODUCT,
  ON_GETTING_PRODUCTS_FOR_PURCHASE
} from "../constants/Shop";


export const onProcessingPurchaseOfProduct = async (product, emailId) => {   
  const url = await ShopManager.getProductsForPurchase(product, emailId);
    return {
      type: ON_PURCHASING_PRODUCT,
      sessionUrl: url
    }
}

export const onGettingProductsForPurchase = async (nativeLanguage, course) => {   
  const catalog = await ShopManager.getProductsForPurchase(nativeLanguage, course);
    return {
      type: ON_GETTING_PRODUCTS_FOR_PURCHASE,
      productCatalog: catalog
    }
}