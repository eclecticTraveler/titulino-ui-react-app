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

export const buildFullKnowMeProgressWithCourseCodeId = async (
  knowMeProgressInput,
  courseCodeId,
  contactId,
  emailId
) => {
  const array = Array.isArray(knowMeProgressInput)
    ? knowMeProgressInput
    : [knowMeProgressInput]; // wrap single object

  return array.map(({ record, file }) => {
    let renamedFile = file;

    if (file) {
      // build a new filename (example: contactId_timestamp_originalName)
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const baseName = `${contactId}_${record.classNumber || 1}_${timestamp}.${ext}`;

      renamedFile = new File([file], baseName, { type: file.type });
    }

    return {
      contactId,
      emailId,
      courseCodeId,
      classNumber: record.classNumber ?? 1,
      categoryId: record.categoryId ?? 6, // As Per "Lrn"."ClassCategory" table
      answers: record.answers ?? {},
      consent: record.consent ?? false,
      createdAt: record.createdAt || new Date().toISOString(),
      file: renamedFile,
    };
  });
};


export const buildStudentKnowMeFileName = async (
  knowMeProgressInput,
  courseCodeId,
  contactId,
  emailId
) => {
  const array = Array.isArray(knowMeProgressInput)
    ? knowMeProgressInput
    : [knowMeProgressInput]; // wrap single object

  return array.map(({ record, file }) => {
    let renamedFile = file;

    if (file) {
      // build a new filename (example: contactId_timestamp_originalName)
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const baseName = `${contactId}_${record.classNumber || 1}_${timestamp}.${ext}`;

      renamedFile = new File([file], baseName, { type: file.type });
    }

    return {
      contactId,
      emailId,
      courseCodeId,
      classNumber: record.classNumber ?? 1,
      categoryId: record.categoryId ?? 6, // As Per "Lrn"."ClassCategory" table
      answers: record.answers ?? {},
      consent: record.consent ?? false,
      createdAt: record.createdAt || new Date().toISOString(),
      file: renamedFile,
    };
  });
};




const LrnConfiguration = {
  mapUserCoursesByTheme,
  getCourseCodeIdByCourseTheme,
  buildFullKnowMeProgressWithCourseCodeId
};

export default LrnConfiguration;
