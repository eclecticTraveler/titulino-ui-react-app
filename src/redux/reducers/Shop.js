import { 
  ON_PURCHASING_PRODUCT
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
    default:
      return state;
  }
};

export default shop