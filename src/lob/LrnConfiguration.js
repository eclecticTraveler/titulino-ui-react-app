import localCourseThemeRegistry from "assets/data/course-theme-registry.data.json";

// Build reverse lookup: courseCodeId → theme
export const buildCodeToTheme = (registry) =>
  Object.entries(registry || {}).reduce((acc, [theme, codes]) => {
    (codes || []).forEach(code => { acc[code] = theme; });
    return acc;
  }, {});

// Module-level defaults built from the bundled JSON (keeps sync callers working)
const DEFAULT_REGISTRY = localCourseThemeRegistry;
const DEFAULT_CODE_TO_THEME = buildCodeToTheme(DEFAULT_REGISTRY);

export const mapUserCoursesByTheme = (userCourses = {}, registry) => {
  const codeToTheme = registry ? buildCodeToTheme(registry) : DEFAULT_CODE_TO_THEME;
  const map = {};
  Object.values(userCourses).forEach(course => {
    const theme = codeToTheme[course.courseCodeId];
    if (theme) map[theme] = course;
  });
  return map;
};

export const getCourseCodeIdByCourseTheme = async (courseTheme, registry) => {
  const reg = registry || DEFAULT_REGISTRY;
  const codes = reg[courseTheme?.toLowerCase()];
  return codes?.[0] ?? 'NOT_FOUND';
};

/**
 * Given the userCourses object and an array of courseCodeIds for a theme,
 * find which courseCodeId the user is a facilitator/facilitador for.
 * @param {Object} userCourses - keyed by courseCodeId
 * @param {string[]} courseCodeIds - from the theme registry
 * @returns {string|null}
 */
export const getFacilitadorCourseCodeIdForTheme = (userCourses, courseCodeIds) => {
  if (!userCourses || typeof userCourses !== 'object') {
    console.log('[LrnConfiguration] getFacilitadorCourseCodeIdForTheme: userCourses is falsy or not an object');
    return null;
  }
  if (!Array.isArray(courseCodeIds) || courseCodeIds.length === 0) {
    console.log('[LrnConfiguration] getFacilitadorCourseCodeIdForTheme: courseCodeIds is not a valid array');
    return null;
  }

  for (const courseCodeId of courseCodeIds) {
    const course = userCourses[courseCodeId];
    const role = course?.userRoleIdForTheCourse;
    const isFacilitator = typeof role === 'string' && role.toLowerCase().includes('facilitat');
    console.log('[LrnConfiguration] checking:', { courseCodeId, role, isFacilitator });
    if (isFacilitator) {
      return courseCodeId;
    }
  }

  return null;
};

export const buildSingleFullKnowMeProgressWithCourseCodeId = async (
  knowMeProgressInput,
  courseCodeId,
  contactId,
  emailId
) => {
  const array = Array.isArray(knowMeProgressInput)
    ? knowMeProgressInput
    : [knowMeProgressInput];

  return array.map(({ record, uploadedFileMap }) => {
    const answers = { ...record.answers };

    for (const key of Object.keys(answers)) {
      const answer = answers[key];
      if (answer && typeof answer === "object" && "fileName" in answer) {
        const url = uploadedFileMap?.[key]; // pick the right one
        if (url) {
          answers[key] = {
            ...answer,
            objectNameOrUrl: url
          };
        }
      }
    }

    return {
      contactId,
      emailId,
      courseCodeId,
      classNumber: record.classNumber ?? 1,
      categoryId: record.categoryId ?? 6,
      answers,
      consent: record.consent ?? false,
      createdAt: record.createdAt || new Date().toISOString(),
    };
  });
};


export const buildMultipleFullKnowMeProgressWithCourseCodeId = async (
  knowMeProgressInput,
  courseCodeId,
  contactId,
  emailId
) => {
  const array = Array.isArray(knowMeProgressInput)
    ? knowMeProgressInput
    : [knowMeProgressInput];

  return array.map(({ record, uploadedFileMap }) => {
    const answers = { ...record.answers };

    for (const key of Object.keys(answers)) {
      const answer = answers[key];
      const urls = uploadedFileMap?.[key];

      if (Array.isArray(answer)) {
        answers[key] = answer.map((a, i) => ({
          ...a,
          objectNameOrUrl: urls?.[i] || null,
        }));
      } else if (answer && typeof answer === "object" && "fileName" in answer) {
        answers[key] = {
          ...answer,
          objectNameOrUrl: urls?.[0] || null,
        };
      }
    }
    
    return {
      contactId,
      emailId,
      courseCodeId,
      classNumber: record.classNumber ?? 1,
      eventCategoryId: record.eventCategoryId || "KnowMe", // ✅ new key name + default text ID
      answers,
      consent: record.consent ?? false,
      createdAt: record.createdAt || new Date().toISOString(),
    };
  });
};


export const buildStudentKnowMeFileName = async (file, contactId, emailId, classNumber = -1) => {
  let renamedFile = file;

  if (file) {
    const timestamp = Date.now();

    const parts = file.name.split(".");
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
    const baseName = `${contactId}_${timestamp}${ext ? "." + ext : ""}`;

    renamedFile = new File([file], baseName, { type: file.type });
  }

  return {
    contactId,
    emailId,
    classNumber,
    file: renamedFile,
  };
};





const LrnConfiguration = {
  mapUserCoursesByTheme,
  getCourseCodeIdByCourseTheme,
  getFacilitadorCourseCodeIdForTheme,
  buildSingleFullKnowMeProgressWithCourseCodeId,
  buildStudentKnowMeFileName,
  buildMultipleFullKnowMeProgressWithCourseCodeId
};

export default LrnConfiguration;
