
import StudentProgress from "lob/StudentProgress";
import ShopManager from "managers/ShopManager";
import { env } from "../../configs/EnvironmentConfig";

import { 
  ON_PURCHASING_PRODUCT
} from "../constants/Shop";


export const onProcessingPurchaseOfProduct = async (levelTheme, nativeLanguage, course, emailId) => {   
  const url = await ShopManager.getUserBookBaseUrl(levelTheme, nativeLanguage, course, emailId);
    return {
      type: ON_PURCHASING_PRODUCT,
      ebookUrl: url
    }
}