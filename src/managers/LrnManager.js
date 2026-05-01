import LocalStorageService from "services/LocalStorageService";
import TitulinoAuthService from "services/TitulinoAuthService";
import TitulinoNetService from "services/TitulinoNetService";
import GrammarClassService from "services/GrammarClassService";
import BookChapterService  from "services/BookChapterService";
import DynamicNavigationRouter from "services/DynamicNavigationRouter";
import TitulinoRestService from "services/TitulinoRestService";
import StudentProgress from "lob/StudentProgress";
import LrnConfiguration from "lob/LrnConfiguration";
import utils from 'utils';
import GoogleService from "services/GoogleService";
import localLanguageCourses from "assets/data/lang-courses.data.json";
import localCourseThemeRegistry from "assets/data/course-theme-registry.data.json";
import { env } from "configs/EnvironmentConfig";

const getUserCourseProgress = async(courseCodeId, emailId) => {
  let courseFilteredProgress = [];
  let studentPercentagesForCourse = {};
  let studentCategoriesCompletedForCourse = {};

  try {
    let courseProgress = [];
    const localStorageKey = `UserProfile_${emailId}`;

    const user = await LocalStorageService.getCachedObject(localStorageKey);

    const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);

    if (token) {
      courseProgress = await TitulinoAuthService.getCourseProgress(courseCodeId, token, "getUserCourseProgress");

      // For now if the user is facilitador or admin given that it will bring the progress of all the users for RLS
      // filter to its own results: TODO
      courseFilteredProgress = courseProgress?.filter(item => item?.EmailId === user?.emailId);
    }

    [studentPercentagesForCourse, studentCategoriesCompletedForCourse] = await Promise.all([
      StudentProgress.calculateUserCourseProgressPercentageForCertificates(courseFilteredProgress),
      StudentProgress.getUserCourseProgressCategories(courseFilteredProgress)
    ]);
  } catch (err) {
    console.error("getUserCourseProgress: failed to fetch progress", err);
  }

  return {
    courseFilteredProgress,
    studentPercentagesForCourse,
    studentCategoriesCompletedForCourse
  };
}

const upsertUserCourseProgress = async(courseProgress, courseCodeId, emailId) => {
  const token = await getCourseToken(courseCodeId, emailId);
  courseProgress = await TitulinoAuthService.upsertCourseProgress(courseProgress, token, "upsertUserCourseProgress");
  return courseProgress;
}

const getCourseToken = async(courseCodeId, emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;

  const user = await LocalStorageService.getCachedObject(localStorageKey);

  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);
  return token;
}

const normalizeIdentifier = (value) => (
  value == null ? "" : String(value).trim().toLowerCase()
);

const shouldDebugEnrollmentProfilePicture = () => env.ENVIROMENT !== "prod";

const logEnrollmentProfilePictureDebug = (message, payload) => {
  if (shouldDebugEnrollmentProfilePicture()) {
    console.log(`[EnrollmentProfilePicture] ${message}`, payload ?? "");
  }
};

const summarizeResolvedProfileContext = ({ emailId, dobOrYob, contactInternalId, token }) => ({
  emailId: emailId || null,
  dobOrYob: dobOrYob || null,
  contactInternalId: contactInternalId || null,
  hasToken: !!token
});

const getProfilePictureUrl = (apiResult) => (
  apiResult?.profileUrl ||
  apiResult?.ProfileUrl ||
  null
);

const getSubmittedEnrolleeRecords = (submittedEnrollee) => {
  if (Array.isArray(submittedEnrollee)) return submittedEnrollee;
  if (Array.isArray(submittedEnrollee?.records)) return submittedEnrollee.records;
  if (submittedEnrollee && typeof submittedEnrollee === "object") return [submittedEnrollee];
  return [];
};

const getSubmittedContactInternalId = (submittedEnrollee) => {
  const records = getSubmittedEnrolleeRecords(submittedEnrollee);
  const record = records[0] || null;

  return (
    record?.ContactInternalId ||
    record?.contactInternalId ||
    record?.contact_internal_id ||
    null
  );
};

const submitEnrollmentRecords = async (enrollees, whoCalledMe = "submitEnrollmentRecords") => {
  let submittedEnrollee = [];
  let wasSuccessful = false;

  const token = await TitulinoNetService.getRegistrationToken(`${whoCalledMe}:getRegistrationToken`);

  if (token) {
    submittedEnrollee = await TitulinoNetService.upsertEnrollment(token, enrollees, whoCalledMe);

    if (submittedEnrollee?.length > 0) {
      wasSuccessful = true;
    } else {
      submittedEnrollee = await TitulinoRestService.upsertFullEnrollment(enrollees, whoCalledMe);
      wasSuccessful = submittedEnrollee?.length > 0;
    }
  } else {
    submittedEnrollee = await TitulinoRestService.upsertFullEnrollment(enrollees, whoCalledMe);
    wasSuccessful = !!submittedEnrollee;
  }

  return {
    submittedEnrollee,
    wasSuccessful,
    registrationToken: token || null
  };
};

const getEnrolleeRecordsFromSubmission = (submittedEnrollee) => {
  if (Array.isArray(submittedEnrollee)) return submittedEnrollee;
  if (Array.isArray(submittedEnrollee?.records)) return submittedEnrollee.records;
  if (Array.isArray(submittedEnrollee?.enrollees)) return submittedEnrollee.enrollees;
  if (submittedEnrollee && typeof submittedEnrollee === "object") return [submittedEnrollee];
  return [];
};

const getContactInternalIdFromSubmittedEnrollee = (submittedEnrollee, emailId) => {
  const records = getEnrolleeRecordsFromSubmission(submittedEnrollee);
  if (records.length === 0) return null;

  const normalizedEmail = normalizeIdentifier(emailId);

  const matchedRecord = records.find((record) => (
    normalizedEmail &&
    [
      record?.emailAddress,
      record?.EmailAddress,
      record?.emailId,
      record?.EmailId,
      record?.email
    ].some((candidateEmail) => normalizeIdentifier(candidateEmail) === normalizedEmail)
  )) || records[0];

  return (
    matchedRecord?.contactInternalId ||
    matchedRecord?.ContactInternalId ||
    matchedRecord?.contact_internal_id ||
    null
  );
};

const resolveEnrollmentProfileContext = async ({
  emailId,
  dobOrYob,
  contactInternalId,
  token,
  submittedEnrollee,
  shouldRetrieveRegistrationToken = false
}) => {
  logEnrollmentProfilePictureDebug("resolveEnrollmentProfileContext:start", {
    emailId: emailId || null,
    dobOrYob: dobOrYob || null,
    contactInternalId: contactInternalId || null,
    hasToken: !!token,
    shouldRetrieveRegistrationToken,
    hasSubmittedEnrollee: !!submittedEnrollee
  });

  let resolvedContactInternalId = contactInternalId || getContactInternalIdFromSubmittedEnrollee(submittedEnrollee, emailId);
  let resolvedToken = token || null;

  if (!resolvedContactInternalId && emailId && dobOrYob) {
    const userProfile = await TitulinoNetService.getUserProfileByEmailAndYearOfBirth(
      emailId,
      dobOrYob,
      "resolveEnrollmentProfileContext"
    );

    resolvedContactInternalId = resolvedContactInternalId || userProfile?.contactInternalId || null;
    resolvedToken = resolvedToken || userProfile?.token || null;

    logEnrollmentProfilePictureDebug("resolveEnrollmentProfileContext:afterUserProfileLookup", {
      hasUserProfile: !!userProfile,
      resolvedContactInternalId,
      hasResolvedToken: !!resolvedToken
    });
  }

  if (shouldRetrieveRegistrationToken && !resolvedToken) {
    resolvedToken = await TitulinoNetService.getRegistrationToken("resolveEnrollmentProfileContext");
    logEnrollmentProfilePictureDebug("resolveEnrollmentProfileContext:afterRegistrationTokenLookup", {
      resolvedContactInternalId,
      hasResolvedToken: !!resolvedToken
    });
  }

  const resolvedContext = {
    contactInternalId: resolvedContactInternalId,
    token: resolvedToken
  };

  logEnrollmentProfilePictureDebug(
    "resolveEnrollmentProfileContext:resolved",
    summarizeResolvedProfileContext({
      emailId,
      dobOrYob,
      contactInternalId: resolvedContext.contactInternalId,
      token: resolvedContext.token
    })
  );

  return resolvedContext;
};

const getUserUpperNavigationConfig = async (isAuthenticated, emailId) => { 
  const localStorageKey = `UserProfile_${emailId}`;  
  const user = await LocalStorageService.getCachedObject(localStorageKey);

  const isUserAuthenticated = !!isAuthenticated;
  const selectedLanguageForCourse =  await LocalStorageService.getSelectedContentLanguage();
  
  const registry = await getCourseThemeRegistry();
  const mappedCourseNames = LrnConfiguration.mapUserCoursesByTheme(user?.userCourses, registry);  
  const upperMainNavigation = await DynamicNavigationRouter.loadMenu(selectedLanguageForCourse?.contentLanguageCode, isUserAuthenticated, mappedCourseNames );
  return upperMainNavigation;
}

const getAllLanguageOptions = async () => {
  const localLanguageOptions = Array.isArray(localLanguageCourses) ? localLanguageCourses : [];

  if (env.IS_TO_USE_LOCAL_LANG_COURSES_DATA) {
    return localLanguageOptions;
  }

  const remoteLanguageOptions = await GoogleService.getLanguageCoursesData("getAllLanguageOptions");
  return Array.isArray(remoteLanguageOptions) && remoteLanguageOptions.length > 0
    ? remoteLanguageOptions
    : localLanguageOptions;
}

const getCourseThemeRegistry = async () => {
  const localRegistry = localCourseThemeRegistry && typeof localCourseThemeRegistry === 'object' ? localCourseThemeRegistry : {};

  if (env.IS_TO_USE_LOCAL_COURSE_THEME_DATA) {
    return localRegistry;
  }

  const remoteRegistry = await GoogleService.getCourseThemeRegistryData("getCourseThemeRegistry");
  return remoteRegistry && typeof remoteRegistry === 'object' && Object.keys(remoteRegistry).length > 0
    ? remoteRegistry
    : localRegistry;
}

const getGrammarClasses = async(levelNo, chapterNo, baseLanguage, contentLanguage, emailId) => {
    const localStorageKey = `UserProfile_${emailId}`;  
    const user = await LocalStorageService.getCachedObject(localStorageKey);
    const urls = await GrammarClassService.getGrammarClassUrlsByChapter(levelNo, chapterNo, baseLanguage, contentLanguage);
    const registry = await getCourseThemeRegistry();
    const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(levelNo, registry);
    const level = utils.getuserLanguageProficiencyOrderIdForCourse(user?.userCourses, courseCodeId);
    const proficiencyLevel = await GrammarClassService.getGrammarCategory(level);

    return {
      urls,
      proficiencyLevel
    };
}

const getCourseProgress = async(courseTheme, baseLanguage, contentLanguage) => {  
  // Content lookup by theme (no courseCodeId needed for UI content)
  const courseConfiguration = await TitulinoRestService.getCourseContentByTheme(baseLanguage, contentLanguage, courseTheme);
  // Derive courseCodeId for DB/enrollment operations
  const registry = await getCourseThemeRegistry();
  const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(courseTheme, registry);

    return {
      courseCodeId,
      courseConfiguration
    };
}

const getUserCoursesForEnrollment = async(emailId) => {  
    const localStorageKey = `UserProfile_${emailId}`;  
    const user = await LocalStorageService.getCachedObject(localStorageKey);

    const [countries, availableCourses, selfLanguageLevel] = await Promise.all([
      TitulinoRestService.getCountries("getUserCoursesForEnrollment"),
      TitulinoRestService.getAvailableCourses(null, "getUserCoursesForEnrollment"),
      TitulinoRestService.getSelfDeterminedLanguageLevelCriteria("getUserCoursesForEnrollment")
    ]);
  
    const userEnrolledCourseIds = utils.getAllCourseCodeIdsFromUserCourses(user?.userCourses);

    const userCoursesAvailableForUserToRegistered = availableCourses?.map(course => ({
      ...course,
      alreadyEnrolled: userEnrolledCourseIds.includes(course.CourseCodeId)
    }));
    
  
    return {
      countries,
      userCoursesAvailableForUserToRegistered,
      selfLanguageLevel
    };
}

const getUserBookBaseUrl = async(levelTheme, baseLanguage, contentLanguage, emailId) => {  
  const localStorageKey = `UserProfile_${emailId}`;  

  const user = await LocalStorageService.getCachedObject(localStorageKey);

  const registry = await getCourseThemeRegistry();
  const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(levelTheme, registry);

  const tier = utils.getCourseTierFromUserCourses(user?.userCourses, courseCodeId);

  const url = await BookChapterService.getBookTierBaseUrl(levelTheme, baseLanguage, contentLanguage, tier ?? "Free");  

  return url;
} 

const getUserEBookChapterUrl = async(levelTheme, chapterNo, baseLanguage, contentLanguage, emailId) => {  
  const localStorageKey = `UserProfile_${emailId}`;  

  const user = await LocalStorageService.getCachedObject(localStorageKey);

  const registry = await getCourseThemeRegistry();
  const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(levelTheme, registry);

  const tier = utils.getCourseTierFromUserCourses(user?.userCourses, courseCodeId);
  
  const url = await BookChapterService.getBookTierChapterUrl(levelTheme, chapterNo, baseLanguage, contentLanguage, tier);

  return url;
} 


const upsertKnowMeProfilePicture = async (fileToUpload, emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);

  if (!user?.contactInternalId || !fileToUpload) {
    console.warn("Missing contactInternalId or fileToUpload, skipping KnowMe upload.");
    return null;
  }

  const uploaded = await TitulinoNetService.upsertStudentKnowMeProfileImage(
    user.innerToken,
    fileToUpload,
    "upsertKnowMeProfilePicture"
  );

  // ✅ Return the URL from backend response
  return uploaded?.profileUrl ?? uploaded?.ProfileUrl ?? null;
};

export const getEnrollmentProfilePictureRequirement = async ({
  emailId,
  dobOrYob,
  contactInternalId,
  token,
  skipExistingProfileLookup = false
}) => {
  logEnrollmentProfilePictureDebug("getEnrollmentProfilePictureRequirement:start", {
    emailId: emailId || null,
    dobOrYob: dobOrYob || null,
    contactInternalId: contactInternalId || null,
    hasToken: !!token,
    forceProfilePictureUpload: !!env.IS_TO_FORCE_ENROLLMENT_PROFILE_PICTURE_UPLOAD,
    skipExistingProfileLookup
  });

  if (!emailId) {
    const result = {
      requiresUpload: false,
      profileUrl: null,
      contactInternalId: contactInternalId || null,
      token: token || null,
      canUploadNow: false
    };
    logEnrollmentProfilePictureDebug("getEnrollmentProfilePictureRequirement:missingEmail", result);
    return result;
  }

  if (skipExistingProfileLookup) {
    const result = {
      requiresUpload: true,
      profileUrl: null,
      contactInternalId: contactInternalId || null,
      token: token || null,
      canUploadNow: !!contactInternalId && !!token
    };
    logEnrollmentProfilePictureDebug("getEnrollmentProfilePictureRequirement:skippingLookup", result);
    return result;
  }

  const resolvedContext = await resolveEnrollmentProfileContext({
    emailId,
    dobOrYob,
    contactInternalId,
    token
  });

  if (env.IS_TO_FORCE_ENROLLMENT_PROFILE_PICTURE_UPLOAD) {
    const result = {
      requiresUpload: true,
      profileUrl: null,
      contactInternalId: resolvedContext.contactInternalId || null,
      token: resolvedContext.token || null,
      canUploadNow: !!resolvedContext.contactInternalId && !!resolvedContext.token
    };

    logEnrollmentProfilePictureDebug("getEnrollmentProfilePictureRequirement:forcedUpload", result);
    return result;
  }

  if (resolvedContext.contactInternalId && resolvedContext.token) {
    const profile = await TitulinoNetService.getContactEnrolleeKnowMeProfileImage(
      resolvedContext.token,
      emailId,
      resolvedContext.contactInternalId,
      "getEnrollmentProfilePictureRequirement"
    );
    const profileUrl = getProfilePictureUrl(profile);

    const result = {
      requiresUpload: !profileUrl,
      profileUrl,
      contactInternalId: resolvedContext.contactInternalId,
      token: resolvedContext.token,
      canUploadNow: true
    };
    logEnrollmentProfilePictureDebug("getEnrollmentProfilePictureRequirement:profileLookupResult", {
      ...result,
      hasProfilePayload: !!profile
    });
    return result;
  }

  const result = {
    requiresUpload: true,
    profileUrl: null,
    contactInternalId: resolvedContext.contactInternalId || null,
    token: resolvedContext.token || null,
    canUploadNow: false
  };
  logEnrollmentProfilePictureDebug("getEnrollmentProfilePictureRequirement:missingContext", result);
  return result;
};

export const ensureEnrollmentProfilePicture = async ({
  file,
  emailId,
  dobOrYob,
  contactInternalId,
  token,
  submittedEnrollee
}) => {
  const rawFile = file?.originFileObj || file || null;

  logEnrollmentProfilePictureDebug("ensureEnrollmentProfilePicture:start", {
    emailId: emailId || null,
    dobOrYob: dobOrYob || null,
    contactInternalId: contactInternalId || null,
    hasToken: !!token,
    hasSubmittedEnrollee: !!submittedEnrollee,
    hasRawFile: !!rawFile
  });

  if (!rawFile || !emailId) {
    const result = {
      wasUploaded: false,
      profileUrl: null,
      skipped: true
    };
    logEnrollmentProfilePictureDebug("ensureEnrollmentProfilePicture:missingFileOrEmail", result);
    return result;
  }

  const resolvedContext = await resolveEnrollmentProfileContext({
    emailId,
    dobOrYob,
    contactInternalId,
    token,
    submittedEnrollee,
    shouldRetrieveRegistrationToken: true
  });

  if (!resolvedContext.contactInternalId || !resolvedContext.token) {
    const result = {
      wasUploaded: false,
      profileUrl: null,
      skipped: false
    };
    logEnrollmentProfilePictureDebug("ensureEnrollmentProfilePicture:missingResolvedContext", {
      ...result,
      resolvedContactInternalId: resolvedContext.contactInternalId || null,
      hasResolvedToken: !!resolvedContext.token
    });
    return result;
  }

  const fileToUpload = await LrnConfiguration.buildStudentKnowMeFileName(
    rawFile,
    resolvedContext.contactInternalId,
    emailId,
    0
  );

  logEnrollmentProfilePictureDebug("ensureEnrollmentProfilePicture:uploading", {
    fileName: fileToUpload?.fileName || rawFile?.name || null,
    contactInternalId: resolvedContext.contactInternalId,
    emailId
  });

  const uploaded = await TitulinoNetService.upsertStudentKnowMeProfileImage(
    resolvedContext.token,
    fileToUpload,
    "ensureEnrollmentProfilePicture"
  );

  const profileUrl = getProfilePictureUrl(uploaded);

  const result = {
    wasUploaded: !!profileUrl,
    profileUrl,
    skipped: false,
    contactInternalId: resolvedContext.contactInternalId
  };
  logEnrollmentProfilePictureDebug("ensureEnrollmentProfilePicture:completed", {
    ...result,
    hasUploadPayload: !!uploaded
  });
  return result;
};

export const submitAuthenticatedEnrollment = async ({
  enrollees,
  filesMap = {},
  user
}) => {
  const { submittedEnrollee, wasSuccessful, registrationToken } = await submitEnrollmentRecords(
    enrollees,
    "submitAuthenticatedEnrollment"
  );

  let uploadResult = null;

  if (wasSuccessful && filesMap?.profilePictureUpload?.length > 0) {
    const file = filesMap.profilePictureUpload[0];
    const enrollee = Array.isArray(enrollees) && enrollees.length > 0 ? enrollees[0] : {};

    uploadResult = await ensureEnrollmentProfilePicture({
      file,
      emailId: user?.emailId || enrollee?.emailAddress || enrollee?.emailId || null,
      dobOrYob: user?.yearOfBirth || enrollee?.dateOfBirth || null,
      contactInternalId: user?.contactInternalId || getSubmittedContactInternalId(submittedEnrollee) || null,
      token: user?.innerToken || registrationToken || null,
      submittedEnrollee
    });
  }

  return {
    submittedEnrollee,
    wasSuccessful,
    uploadResult
  };
};

export const submitUnauthenticatedEnrollment = async ({
  enrollees,
  filesMap = {},
  profilePictureContext = {}
}) => {
  const { submittedEnrollee, wasSuccessful, registrationToken } = await submitEnrollmentRecords(
    enrollees,
    "submitUnauthenticatedEnrollment"
  );

  let uploadResult = null;

  if (wasSuccessful && filesMap?.profilePictureUpload?.length > 0) {
    const file = filesMap.profilePictureUpload[0];
    const enrollee = Array.isArray(enrollees) && enrollees.length > 0 ? enrollees[0] : {};

    uploadResult = await ensureEnrollmentProfilePicture({
      file,
      emailId: profilePictureContext?.emailId || enrollee?.emailAddress || enrollee?.emailId || null,
      dobOrYob: profilePictureContext?.dobOrYob || enrollee?.dateOfBirth || null,
      contactInternalId: profilePictureContext?.contactInternalId || getSubmittedContactInternalId(submittedEnrollee) || null,
      token: profilePictureContext?.token || registrationToken || null,
      submittedEnrollee
    });
  }

  return {
    submittedEnrollee,
    wasSuccessful,
    uploadResult
  };
};



export const upsertUserKnowMeProgress = async (
  knowMeProgress,   // { record, filesMap }
  levelTheme,
  emailId,
  classNumber = 0
) => {
  const localStorageKey = `UserProfile_${emailId}`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);

  if (!user?.contactInternalId) {
    console.warn("No contactInternalId found, skipping KnowMe upsert.");
    return null;
  }

  // 1. Resolve courseCodeId
  const registry = await getCourseThemeRegistry();
  const courseCodeId = await LrnConfiguration.getCourseCodeIdByCourseTheme(levelTheme, registry);

  // 2. Upload all files in filesMap (if any)
  const uploadedFileMap = {};
  for (const [questionId, files] of Object.entries(knowMeProgress.filesMap || {})) {
    for (const file of files) {
      // build file wrapper (renames for consistency)
      const fileToUpload = await LrnConfiguration.buildStudentKnowMeFileName(
        file,
        user.contactInternalId,
        user?.emailId,
        classNumber
      );
      // TODO: REFACTOR TO ITS ONE METHOD FAR FROM PROFILE RATHER A METHOD THAT STORES IMAGES FOR GIVEN TEST:
      //  but for now we can use upsertKnowMeProfilePicture but later it has to have its own method in relation to classes
      const uploadedUrl = await upsertKnowMeProfilePicture(
        fileToUpload,
        emailId
      );

      if (uploadedUrl) {
        if (!uploadedFileMap[questionId]) uploadedFileMap[questionId] = [];
        uploadedFileMap[questionId].push(uploadedUrl);
      }
    }
  }

  // 3. Merge uploadedFileMap into answers
  const fullKnowMeProgress = await LrnConfiguration.buildMultipleFullKnowMeProgressWithCourseCodeId(
    { record: knowMeProgress.record, uploadedFileMap },
    courseCodeId,
    user.contactInternalId,
    user.emailId
  );

  const token = utils.getCourseTokenFromUserCourses(user?.userCourses, courseCodeId);

  // 4. Send to Warehouse
  const progressToUpsert = await TitulinoAuthService.upsertUserKnowMeSubmission(
    fullKnowMeProgress,
    token,
    "upsertUserKnowMeProgress"
  );

  // TESTING TO REMOVE TODO
    // const payloadArray = [
    //     { EmailId: user?.emailId, ContactInternalId: user?.contactInternalId },
    //     { EmailId: 'solorzano2020@gmail.com', ContactInternalId: '0053bc40-9b5b-485c-8ae0-d3de0dec389b'}
    //   ];


    // const ttt = await TitulinoNetService.getContactEnrolleesKnowMeProfileImages(
    //   user?.innerToken,
    //   payloadArray,
    //   180,
    //   "getEnrolleeKnowMeProfilePictureForCourse"
    // );

    // console.log("user profile after upsert", user);
    console.log("progressToUpsert", progressToUpsert);
  return progressToUpsert;
};

export const buildStudentKnowMeFileName = async (file, contactId, emailId, classNumber) => {
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


const resolveFacilitadorCourseCodeId = async (courseTheme, emailId) => {
  const localStorageKey = `UserProfile_${emailId}`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);
  const userCourses = user?.userCourses;
  const registry = await getCourseThemeRegistry();
  const themeCourseCodeIds = registry[courseTheme?.toLowerCase()] || [];
  const facilitadorCourseCodeId = LrnConfiguration.getFacilitadorCourseCodeIdForTheme(
    userCourses,
    themeCourseCodeIds,
    !!user?.isGlobalAccessUser
  );
  return facilitadorCourseCodeId;
};

const LrnManager = {
  getUserCourseProgress,
  upsertUserCourseProgress,
  getCourseToken,
  getUserUpperNavigationConfig,
  getAllLanguageOptions,
  getCourseThemeRegistry,
  getGrammarClasses,
  getCourseProgress,
  getUserCoursesForEnrollment,
  getUserBookBaseUrl,
  getUserEBookChapterUrl,
  upsertUserKnowMeProgress,
  upsertKnowMeProfilePicture,
  getEnrollmentProfilePictureRequirement,
  ensureEnrollmentProfilePicture,
  submitAuthenticatedEnrollment,
  submitUnauthenticatedEnrollment,
  buildStudentKnowMeFileName,
  resolveFacilitadorCourseCodeId
};

export default LrnManager;
