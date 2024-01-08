import EnglishMainNavigationConfig from '../configs/CourseMainNavigationConfig/English/EnglishMainNavigationConfig';
import PortugueseMainNavigationConfig from '../configs/CourseMainNavigationConfig/Portuguese/PortugueseMainNavigationConfig';
import SpanishMainNavigationConfig from '../configs/CourseMainNavigationConfig/Spanish/SpanishMainNavigationConfig';

export const loadMenu = async(lang) => { 
  switch (lang) {
    case "eng":      
      return EnglishMainNavigationConfig;
    case "por":
      return PortugueseMainNavigationConfig;
    case "spa":
      return SpanishMainNavigationConfig;        
    default:
      return EnglishMainNavigationConfig;
  }
};

const DynamicNavigationRouter = {
  loadMenu
};
export default DynamicNavigationRouter

