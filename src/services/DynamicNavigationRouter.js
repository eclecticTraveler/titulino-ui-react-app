import { getEnglishCourseMainNavigationConfig } from '../configs/CourseMainNavigationConfig/English/EnglishCourseMainNavigationConfig';
import PortugueseCourseMainNavigationConfig from '../configs/CourseMainNavigationConfig/Portuguese/PortugueseCourseMainNavigationConfig';
import SpanishCourseMainNavigationConfig from '../configs/CourseMainNavigationConfig/Spanish/SpanishCourseMainNavigationConfig';

export const loadMenu = async (lang, isAuthenticated = false) => {
  switch (lang) {
    case "eng":
      return getEnglishCourseMainNavigationConfig(isAuthenticated);
    case "por":
      return PortugueseCourseMainNavigationConfig(isAuthenticated);
    case "spa":
      return SpanishCourseMainNavigationConfig(isAuthenticated);
    default:
      return getEnglishCourseMainNavigationConfig(isAuthenticated);
  }
};

const DynamicNavigationRouter = { loadMenu };

export default DynamicNavigationRouter;


