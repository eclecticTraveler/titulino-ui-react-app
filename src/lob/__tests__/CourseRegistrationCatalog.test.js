import CourseRegistrationCatalog from '../CourseRegistrationCatalog';

const { buildAvailableCoursesForRegistration, buildUserCoursesSignature } =
  CourseRegistrationCatalog;

// No mocking — buildAvailableCoursesForRegistration delegates enrollment detection
// to utils.getEnrolledCourseCodeIdsFromUserCourses which is a pure static helper.
// We test with real data shapes that the function actually handles.

// ---------------------------------------------------------------------------
// buildAvailableCoursesForRegistration
// ---------------------------------------------------------------------------
describe('buildAvailableCoursesForRegistration', () => {
  const available = [
    { CourseCodeId: 'SUP_SEP_2024_COURSE_01', name: 'Supermarket' },
    { CourseCodeId: 'HH_JAN_2024_COURSE_01', name: 'Household' },
  ];

  it('marks enrolled courses as alreadyEnrolled true', () => {
    const userCourses = {
      'SUP_SEP_2024_COURSE_01': { isEnrolled: true },
    };
    const result = buildAvailableCoursesForRegistration(available, userCourses);
    expect(result.find(c => c.CourseCodeId === 'SUP_SEP_2024_COURSE_01').alreadyEnrolled).toBe(true);
  });

  it('marks non-enrolled courses as alreadyEnrolled false', () => {
    const userCourses = {
      'SUP_SEP_2024_COURSE_01': { isEnrolled: true },
    };
    const result = buildAvailableCoursesForRegistration(available, userCourses);
    expect(result.find(c => c.CourseCodeId === 'HH_JAN_2024_COURSE_01').alreadyEnrolled).toBe(false);
  });

  it('marks all courses as not enrolled when userCourses is empty', () => {
    const result = buildAvailableCoursesForRegistration(available, {});
    result.forEach(course => expect(course.alreadyEnrolled).toBe(false));
  });

  it('preserves all original course properties', () => {
    const result = buildAvailableCoursesForRegistration(available, {});
    expect(result[0]).toMatchObject({ CourseCodeId: 'SUP_SEP_2024_COURSE_01', name: 'Supermarket' });
  });

  it('returns empty array when availableCourses is empty', () => {
    expect(buildAvailableCoursesForRegistration([], {})).toEqual([]);
  });

  it('does not mutate the original availableCourses items', () => {
    const original = [{ CourseCodeId: 'SUP_SEP_2024_COURSE_01' }];
    buildAvailableCoursesForRegistration(original, {});
    expect(original[0].alreadyEnrolled).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// buildUserCoursesSignature
// ---------------------------------------------------------------------------
describe('buildUserCoursesSignature', () => {
  it('returns empty string for empty object', () => {
    expect(buildUserCoursesSignature({})).toBe('');
  });

  it('returns empty string for falsy input', () => {
    expect(buildUserCoursesSignature(null)).toBe('');
    expect(buildUserCoursesSignature(undefined)).toBe('');
  });

  it('returns a non-empty string for a populated userCourses object', () => {
    const userCourses = {
      'SUP_SEP_2024_COURSE_01': {
        courseCodeId: 'SUP_SEP_2024_COURSE_01',
        courseToken: 'abc',
        userRoleIdForTheCourse: 'titulino_user',
        isEnrolled: true,
      },
    };
    expect(buildUserCoursesSignature(userCourses).length).toBeGreaterThan(0);
  });

  it('produces the same signature on repeated calls with identical input', () => {
    const userCourses = {
      'SUP_SEP_2024_COURSE_01': { courseToken: 'abc', isEnrolled: true },
      'HH_JAN_2024_COURSE_01': { courseToken: null, isEnrolled: false },
    };
    expect(buildUserCoursesSignature(userCourses)).toBe(buildUserCoursesSignature(userCourses));
  });

  it('produces a different signature when a course token changes', () => {
    const withToken = { 'SUP_SEP_2024_COURSE_01': { courseToken: 'abc', isEnrolled: true } };
    const withoutToken = { 'SUP_SEP_2024_COURSE_01': { courseToken: null, isEnrolled: true } };
    expect(buildUserCoursesSignature(withToken)).not.toBe(buildUserCoursesSignature(withoutToken));
  });

  it('produces a different signature when enrollment status changes', () => {
    const enrolled = { 'SUP_SEP_2024_COURSE_01': { isEnrolled: true } };
    const notEnrolled = { 'SUP_SEP_2024_COURSE_01': { isEnrolled: false } };
    expect(buildUserCoursesSignature(enrolled)).not.toBe(buildUserCoursesSignature(notEnrolled));
  });

  it('contains pipe separators between entries', () => {
    const userCourses = {
      'COURSE_A': { isEnrolled: true },
      'COURSE_B': { isEnrolled: false },
    };
    expect(buildUserCoursesSignature(userCourses)).toContain('|');
  });
});
