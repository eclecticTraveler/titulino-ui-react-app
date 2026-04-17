const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * Convert a course name into UPPER_SNAKE_CASE.
 * E.g. "Household Items - Part 1" → "HOUSEHOLD_ITEMS_PART_1"
 */
const toUpperSnake = (name) => {
  if (!name) return '';
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '')   // strip non-alphanumeric (keep spaces)
    .trim()
    .replace(/\s+/g, '_')
    .toUpperCase();
};

/**
 * Generate a unique CourseCodeId following the convention:
 *   <COURSE_NAME_UPPER_SNAKE>_<MMM>_<YYYY>_COURSE_<NN>
 *
 * @param {string} courseName    – e.g. "Household Items - Part 1"
 * @param {Date|string} startDate – course start date
 * @param {string[]} existingIds  – list of all existing CourseCodeIds
 * @returns {string}
 */
export const generateCourseCodeId = (courseName, startDate, existingIds = []) => {
  const nameSlug = toUpperSnake(courseName);
  if (!nameSlug) return '';

  const d = startDate instanceof Date ? startDate : new Date(startDate);
  if (isNaN(d)) return '';

  const month = MONTH_ABBR[d.getMonth()];
  const year = d.getFullYear();
  const prefix = `${nameSlug}_${month}_${year}_COURSE_`;

  let seq = 1;
  const upperIds = existingIds.map(id => (id || '').toUpperCase());
  while (upperIds.includes(`${prefix}${String(seq).padStart(2, '0')}`)) {
    seq++;
  }

  return `${prefix}${String(seq).padStart(2, '0')}`;
};

/**
 * Build the upsert payload that matches the DB course_type:
 *   { CourseCodeId, CreationDate, StartDate, EndDate, CourseDetails (jsonb), NativeLanguageId, TargetLanguageId }
 *
 * Returns the payload wrapped in an array (the endpoint expects an array).
 */
export const buildCourseUpsertPayload = (formValues) => {
  const {
    CourseCodeId,
    StartDate,
    EndDate,
    NativeLanguageId,
    TargetLanguageId,
    course,
    teacher,
    imageUrl,
    location,
    gatheringDay,
    gatheringTime,
    gatheringStartingDate,
    courseWeeksLength,
    whatsAppLink,
    targetAudienceNativeLanguage
  } = formValues;

  return [{
    CourseCodeId,
    CreationDate: new Date().toISOString(),
    StartDate: StartDate || null,
    EndDate: EndDate || null,
    CourseDetails: {
      course: course || '',
      teacher: teacher || '',
      imageUrl: imageUrl || '',
      location: location || '',
      gatheringDay: gatheringDay || '',
      gatheringTime: gatheringTime || '',
      gatheringStartingDate: gatheringStartingDate || '',
      courseWeeksLength: courseWeeksLength ?? null,
      whatsAppLink: whatsAppLink || '',
      targetAudienceNativeLanguage: targetAudienceNativeLanguage || ''
    },
    NativeLanguageId: NativeLanguageId || '',
    TargetLanguageId: TargetLanguageId || ''
  }];
};

/**
 * Clone an existing raw course into a template for creation.
 * Preserves CourseDetails but clears dates and flags so the user fills them in.
 */
export const prefillFromTemplate = (rawCourse) => {
  if (!rawCourse) return {};
  const cd = rawCourse.CourseDetails || {};
  return {
    course: cd.course || '',
    teacher: cd.teacher || '',
    imageUrl: cd.imageUrl || '',
    location: cd.location || '',
    gatheringDay: cd.gatheringDay || '',
    gatheringTime: cd.gatheringTime || '',
    courseWeeksLength: cd.courseWeeksLength ?? null,
    whatsAppLink: cd.whatsAppLink || '',
    targetAudienceNativeLanguage: cd.targetAudienceNativeLanguage || '',
    NativeLanguageId: rawCourse.NativeLanguageId || '',
    TargetLanguageId: rawCourse.TargetLanguageId || '',
    // Dates and generated fields left empty — user fills them
    StartDate: null,
    EndDate: null,
    gatheringStartingDate: '',
    CourseCodeId: ''
  };
};

const AdminToolsLob = {
  generateCourseCodeId,
  buildCourseUpsertPayload,
  prefillFromTemplate
};

export default AdminToolsLob;
