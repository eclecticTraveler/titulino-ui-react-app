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
  buildSingleFullKnowMeProgressWithCourseCodeId,
  buildStudentKnowMeFileName,
  buildMultipleFullKnowMeProgressWithCourseCodeId
};

export default LrnConfiguration;
