import { 
  ON_PURCHASING_PRODUCT,
  ON_GETTING_PRODUCTS_FOR_PURCHASE,
  ON_GETTING_PRODUCTS_PURCHASED_BY_USER
} from "../constants/Shop";

const initState = {
};

const shop = (state = initState, action) => {
  switch (action.type) {
    case ON_PURCHASING_PRODUCT:
      return {
        ...state,
        selectedCourse: action.selectedCourse
      }
    case ON_GETTING_PRODUCTS_FOR_PURCHASE:
      return {
        ...state,
        productCatalog: action.productCatalog
      }
    case ON_GETTING_PRODUCTS_PURCHASED_BY_USER:
      return {
        ...state
      }  
    default:
      return state;
  }
};

export default shop