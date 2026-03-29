import { getEnglishCourseMainNavigationConfig } from '../configs/CourseMainNavigationConfig/English/EnglishCourseMainNavigationConfig';
import PortugueseCourseMainNavigationConfig from '../configs/CourseMainNavigationConfig/Portuguese/PortugueseCourseMainNavigationConfig';
import SpanishCourseMainNavigationConfig from '../configs/CourseMainNavigationConfig/Spanish/SpanishCourseMainNavigationConfig';

export const loadMenu = async (contentLanguageCode, isAuthenticated = false, coursesByTheme  = {}) => {
  switch (contentLanguageCode) {
    case "en":
      return getEnglishCourseMainNavigationConfig(isAuthenticated, coursesByTheme);
    case "pt":
      return PortugueseCourseMainNavigationConfig(isAuthenticated, coursesByTheme);
    case "es":
      return SpanishCourseMainNavigationConfig(isAuthenticated);
    default:
      return getEnglishCourseMainNavigationConfig(isAuthenticated, coursesByTheme);
  }
};

const DynamicNavigationRouter = { loadMenu };

export default DynamicNavigationRouter;


