import { 
  ON_PURCHASING_PRODUCT,
  ON_GETTING_PRODUCTS_FOR_PURCHASE
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
    default:
      return state;
  }
};

export default shop