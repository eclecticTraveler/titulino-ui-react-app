export const mapUserCoursesByTheme = (userCourses = {}) => {
  const map = {};
  Object.values(userCourses).forEach(course => {
    // Map them to your menu theme keys
    const workAndJobsCodes = ['WORK_AND_JOBS_JULY_2025_COURSE_01', 'WORK_AND_JOBS_JULY_2025_COURSE_02'];
    const supermarketCodes = ['SUPERMARKET_SEP_2024_COURSE_01', 'SUPERMARKET_SEP_2024_COURSE_02'];
    const householdCodes = ['HOUSEHOLD_ITEMS_PART_1_JAN_2025_COURSE_01'];
    const englishConnectCodes = ['ENGLISHCONNECT_01_JUN_2025_COURSE_02', 'ENGLISHCONNECT_01_JUN_2025_COURSE_02'];

    if (workAndJobsCodes.includes(course.courseCodeId)) map['work-n-jobs'] = course;
    else if (householdCodes.includes(course.courseCodeId)) map['household'] = course;
    else if (supermarketCodes.includes(course.courseCodeId)) map['supermarket'] = course;
    else if (englishConnectCodes.includes(course.courseCodeId)) map['english-connect'] = course;
  });
  return map;
};



export const getCourseCodeIdByCourseTheme = async (courseTheme) => {
  switch (courseTheme?.toLowerCase()) {
    case 'supermarket':
      return 'SUPERMARKET_SEP_2024_COURSE_01';      
    case 'household':      
      return 'HOUSEHOLD_ITEMS_PART_1_JAN_2025_COURSE_01'    
    case 'work-n-jobs':
      return 'WORK_AND_JOBS_JULY_2025_COURSE_01';
    default:
      return 'NOT_FOUND' // TODO find a better way to do this!
      // throw new Error(`Invalid course theme: ${courseTheme}`);
  }
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
        // multiple files allowed for this question
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
      categoryId: record.categoryId ?? 6,
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
