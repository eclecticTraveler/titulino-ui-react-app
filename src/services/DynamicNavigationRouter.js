import { getEnglishCourseMainNavigationConfig } from '../configs/CourseMainNavigationConfig/English/EnglishCourseMainNavigationConfig';
import PortugueseCourseMainNavigationConfig from '../configs/CourseMainNavigationConfig/Portuguese/PortugueseCourseMainNavigationConfig';
import SpanishCourseMainNavigationConfig from '../configs/CourseMainNavigationConfig/Spanish/SpanishCourseMainNavigationConfig';

export const loadMenu = async (lang, isAuthenticated = false, coursesByTheme  = {}) => {
  switch (lang) {
    case "eng":
      return getEnglishCourseMainNavigationConfig(isAuthenticated, coursesByTheme);
    case "por":
      return PortugueseCourseMainNavigationConfig(isAuthenticated, coursesByTheme);
    case "spa":
      return SpanishCourseMainNavigationConfig(isAuthenticated);
    default:
      return getEnglishCourseMainNavigationConfig(isAuthenticated, coursesByTheme);
  }
};

const DynamicNavigationRouter = { loadMenu };

export default DynamicNavigationRouter;


