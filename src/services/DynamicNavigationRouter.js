import EnglishCourseMainNavigationConfig from '../configs/CourseMainNavigationConfig/English/EnglishCourseMainNavigationConfig';
import PortugueseCourseMainNavigationConfig from '../configs/CourseMainNavigationConfig/Portuguese/PortugueseCourseMainNavigationConfig';
import SpanishCourseMainNavigationConfig from '../configs/CourseMainNavigationConfig/Spanish/SpanishCourseMainNavigationConfig';

export const loadMenu = async(lang) => { 
  switch (lang) {
    case "eng":      
      return EnglishCourseMainNavigationConfig;
    case "por":
      return PortugueseCourseMainNavigationConfig;
    case "spa":
      return SpanishCourseMainNavigationConfig;        
    default:
      return EnglishCourseMainNavigationConfig;
  }
};

const DynamicNavigationRouter = {
  loadMenu
};
export default DynamicNavigationRouter

