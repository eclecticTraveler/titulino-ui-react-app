const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const ID_PATTERN = /^(.+?)_(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)_\d{4}_COURSE_(\d+)$/i;

/**
 * Find the highest edition number (NN) across all existing IDs that share
 * the same course-name slug, regardless of month/year.
 * E.g. slug "SUPERMARKET" matches SUPERMARKET_SEP_2024_COURSE_01 → max = 1
 */
const getMaxEditionForSlug = (nameSlug, existingIds) => {
  let max = 0;
  const upper = nameSlug.toUpperCase();
  for (const id of existingIds) {
    const m = ID_PATTERN.exec((id || '').toUpperCase());
    if (m && m[1] === upper) {
      const n = parseInt(m[3], 10);
      if (n > max) max = n;
    }
  }
  return max;
};

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
 * NN is a global edition counter per course-name slug — it increments across
 * all months/years.  E.g. if SUPERMARKET_SEP_2024_COURSE_01 exists, the next
 * Supermarket course (any date) becomes SUPERMARKET_JUL_2026_COURSE_02.
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

  // Global edition: find highest NN for this slug across all dates, then +1
  let seq = getMaxEditionForSlug(nameSlug, existingIds) + 1;

  // Safety net: also skip if the exact full ID already exists
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

/**
 * Extract the public image URL from the /course-cover/upload response.
 * Backend may return a string URL or an object with one of several shapes.
 */
export const extractUploadedCoverImageUrl = (uploadResult) => {
  if (!uploadResult) return null;
  if (typeof uploadResult === 'string') return uploadResult;
  return (
    uploadResult.url ||
    uploadResult.Url ||
    uploadResult.imageUrl ||
    uploadResult.ImageUrl ||
    uploadResult.publicUrl ||
    uploadResult.PublicUrl ||
    null
  );
};

/**
 * Strict HTTP/HTTPS URL validation for the manual image-URL entry mode.
 */
export const isValidHttpUrl = (value) => {
  if (!value || typeof value !== 'string') return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const AdminToolsLob = {
  generateCourseCodeId,
  buildCourseUpsertPayload,
  prefillFromTemplate,
  extractUploadedCoverImageUrl,
  isValidHttpUrl
};

export default AdminToolsLob;
