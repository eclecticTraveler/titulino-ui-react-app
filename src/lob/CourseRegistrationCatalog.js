import utils from 'utils';

export const buildAvailableCoursesForRegistration = (availableCourses = [], userCourses = {}, options = {}) => {
  const enrolledCourseCodeIds = new Set(utils.getEnrolledCourseCodeIdsFromUserCourses(userCourses, options));

  return (availableCourses || []).map(course => ({
    ...course,
    alreadyEnrolled: enrolledCourseCodeIds.has(course.CourseCodeId)
  }));
};

export const buildUserCoursesSignature = (userCourses = {}) => {
  if (!userCourses || typeof userCourses !== 'object') return '';

  return Object.entries(userCourses)
    .map(([key, course]) => [
      course?.courseCodeId || course?.CourseCodeId || course?.course_code_id || key,
      course?.courseToken ? '1' : '0',
      course?.userRoleIdForTheCourse || '',
      course?.isEnrolled ?? course?.IsEnrolled ?? ''
    ].join(':'))
    .sort()
    .join('|');
};

const CourseRegistrationCatalog = {
  buildAvailableCoursesForRegistration,
  buildUserCoursesSignature
};

export default CourseRegistrationCatalog;
