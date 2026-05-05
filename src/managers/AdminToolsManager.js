import TitulinoRestService from "services/TitulinoRestService";
import TitulinoAuthService from "services/TitulinoAuthService";
import TitulinoNetService from "services/TitulinoNetService";
import LocalStorageService from "services/LocalStorageService";
import { getGeoMapResource } from "services/GoogleService";
import AdminInsights from "lob/AdminInsights";
import StudentProgress from "lob/StudentProgress";
import LoginFootprint from "lob/LoginFootprint";
import KnowMeProfiles from "lob/KnowMeProfiles";
import AdminTools from "lob/AdminTools";
import utils from 'utils';

const getTokenFromEmail = async (emailId) => {
  const user = await LocalStorageService.getCachedObject(`UserProfile_${emailId}`);
  return user?.innerToken || null;
};

const normalizeIdentifier = (value) => (
  value == null ? '' : String(value).trim().toLowerCase()
);

export const initAdminTools = async (emailId) => {
  const token = await getTokenFromEmail(emailId);
  if (!token) {
    console.warn('[AdminToolsManager] No token found for emailId:', emailId);
    return { allCourses: [], allRoles: [], allEnrollees: [] };
  }
  const [rawCourses, allRoles, allEnrollees] = await Promise.all([
    TitulinoRestService.getAllCourses('AdminToolsManager'),
    TitulinoAuthService.getUserRoles(token, 'AdminToolsManager'),
    TitulinoAuthService.getAllEnrollees(token, 'AdminToolsManager')
  ]);
  const allCourses = await AdminInsights.courseSelectionConverter(rawCourses);
  return { allCourses, allRoles, allEnrollees, allRawCourses: rawCourses };
};

export const hydrateAdminToolAvatarUrls = async (
  emailId,
  allEnrollees = [],
  contactInternalIds = [],
  existingAvatarUrlMap = {}
) => {
  const token = await getTokenFromEmail(emailId);

  if (!token) {
    return {
      avatarUrlMap: existingAvatarUrlMap || {},
      allEnrollees
    };
  }

  const contactIdSet = new Set(
    KnowMeProfiles.extractContactInternalIds(contactInternalIds, value => value)
  );

  const targetItems = contactIdSet.size > 0
    ? (allEnrollees || []).filter(item => contactIdSet.has(normalizeIdentifier(item?.ContactInternalId)))
    : (allEnrollees || []);

  const fetchedAvatarUrlMap = await KnowMeProfiles.getMissingKnowMeProfileUrlMap(
    token,
    targetItems,
    existingAvatarUrlMap,
    'hydrateAdminToolAvatarUrls',
    {
      avatarField: 'AvatarUrl'
    }
  );

  const nextAvatarUrlMap = {
    ...(existingAvatarUrlMap || {}),
    ...fetchedAvatarUrlMap
  };

  return {
    avatarUrlMap: nextAvatarUrlMap,
    allEnrollees: KnowMeProfiles.mergeKnowMeProfileUrlsIntoItems(
      allEnrollees,
      nextAvatarUrlMap,
      {
        avatarField: 'AvatarUrl'
      }
    )
  };
};

export const assignEnrolleeRoleToCourse = async (contactInternalId, courseCodeId, roleId, contactEmailId, adminEmailId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;
  const payload = AdminTools.buildEnrollExistingContactToCoursePayload({
    contactInternalId,
    emailId: contactEmailId,
    courseCodeId,
    roleId
  });
  return TitulinoAuthService.assignEnrolleeRoleToCourse(payload, token, 'AdminToolsManager');
};

export const revokeCourseFacilitatorAccess = async (contactInternalId, courseCodeId, contactEmailId, adminEmailId, targetRoleId = 'titulino_user') => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;
  const payload = AdminTools.buildUpsertUserRoleCoursePayload({
    contactInternalId,
    emailId: contactEmailId,
    courseCodeId,
    userRoleId: targetRoleId || 'titulino_user'
  });
  return TitulinoAuthService.upsertUserRoleCourse(payload, token, 'AdminToolsManager');
};

const getGlobalRoleIdFromItem = (item) => {
  if (!item) return null;
  if (typeof item === 'string') return item;
  return item.role || item.Role || item.userRoleId || item.UserRoleId || item.UserRoleID || null;
};

const isGlobalRoleItem = (item) => {
  if (!item || typeof item === 'string') return true;
  if (item.isGlobal === false || item.IsGlobal === false) return false;
  if (item.isGlobalAccessUserRole === false || item.IsGlobalAccessUserRole === false) return false;
  return true;
};

const normalizeGlobalRoleRecord = (item) => {
  const roleId = getGlobalRoleIdFromItem(item);
  if (!roleId) return null;

  return {
    roleId,
    isGlobalAccessUserRole: typeof item === 'string'
      ? true
      : item.isGlobalAccessUserRole ?? item.IsGlobalAccessUserRole ?? item.isGlobal ?? item.IsGlobal ?? true,
    isActive: typeof item === 'string'
      ? true
      : item.isActive ?? item.IsActive ?? true,
    endDate: typeof item === 'string'
      ? null
      : item.endDate || item.EndDate || null
  };
};

const normalizeGlobalUserRoleResult = (result, contactInternalId) => {
  const rawItems = Array.isArray(result)
    ? result
    : Array.isArray(result?.roles)
      ? result.roles
      : Array.isArray(result?.Roles)
        ? result.Roles
        : Array.isArray(result?.globalRoles)
          ? result.globalRoles
          : [result];

  const roleRecords = rawItems
    .filter(isGlobalRoleItem)
    .map(normalizeGlobalRoleRecord)
    .filter(Boolean);
  const roles = Array.from(new Set(
    roleRecords
      .filter(record => record.isActive !== false)
      .map(record => record.roleId)
  ));
  const allRoles = Array.from(new Set(roleRecords.map(record => record.roleId)));

  return {
    contactInternalId,
    isGlobal: roles.length > 0,
    role: roles[0] || allRoles[0] || null,
    roles,
    allRoles,
    roleRecords
  };
};

export const getGlobalUserRole = async (contactInternalId, adminEmailId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token || !contactInternalId) {
    return { contactInternalId, isGlobal: false, role: null, roles: [], allRoles: [], roleRecords: [] };
  }

  const result = await TitulinoAuthService.getGlobalUserRole(contactInternalId, token, 'AdminToolsManager');

  return normalizeGlobalUserRoleResult(result, contactInternalId);
};

export const upsertGlobalUserRole = async (contactInternalId, roleId, isActive, adminEmailId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;
  const payload = AdminTools.buildUpsertUserRoleGlobalPayload({
    contactInternalId,
    userRoleId: roleId,
    isActive
  });
  return TitulinoAuthService.upsertUserRoleGlobal(payload, token, 'AdminToolsManager');
};

export const assignGlobalRole = async (contactInternalId, roleId, adminEmailId) => {
  return upsertGlobalUserRole(contactInternalId, roleId, true, adminEmailId);
};

export const revokeGlobalRole = async (contactInternalId, roleId, adminEmailId) => {
  return upsertGlobalUserRole(contactInternalId, roleId, false, adminEmailId);
};

export const upsertCourse = async (courseData, adminEmailId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;
  return TitulinoAuthService.upsertCourse(courseData, token, 'AdminToolsManager');
};

export const getContactCourseProgressActivity = async (contactInternalId, courseIds = [], emailId, contactEmails = []) => {
  const adminUser = await LocalStorageService.getCachedObject(`UserProfile_${emailId}`);
  const uniqueCourseIds = Array.from(new Set((courseIds || []).filter(Boolean)));

  if (!adminUser || !contactInternalId || uniqueCourseIds.length === 0) {
    return { contactInternalId, courseIds: uniqueCourseIds, rows: [], progressActivityTrendData: [] };
  }

  const targetContactId = normalizeIdentifier(contactInternalId);
  const targetEmails = new Set((contactEmails || []).map(normalizeIdentifier).filter(Boolean));

  const rowsByCourse = await Promise.all(uniqueCourseIds.map(async (courseCodeId) => {
    const token = utils.getCourseTokenFromUserCourses(adminUser?.userCourses, courseCodeId);
    if (!token) return [];

    const rows = await TitulinoAuthService.getCourseProgress(
      courseCodeId,
      token,
      'getContactCourseProgressActivity'
    );

    return (rows || [])
      .filter(row => (
        normalizeIdentifier(row?.ContactInternalId) === targetContactId ||
        targetEmails.has(normalizeIdentifier(row?.EmailId))
      ))
      .map(row => ({
        ...row,
        CourseCodeId: row?.CourseCodeId || courseCodeId
      }));
  }));

  const rows = rowsByCourse.flat();

  return {
    contactInternalId,
    courseIds: uniqueCourseIds,
    rows,
    progressActivityTrendData: StudentProgress.buildCourseProgressActivityTrendData(rows)
  };
};

export const getContactLoginFootprint = async (contactInternalId, emailId) => {
  const adminUser = await LocalStorageService.getCachedObject(`UserProfile_${emailId}`);
  const token = adminUser?.innerToken;

  if (!token || !contactInternalId) {
    return {
      contactInternalId,
      rows: [],
      heatmapData: [],
      scatterData: [],
      tableModel: LoginFootprint.buildLoginFootprintTableModel([]),
      summary: LoginFootprint.buildLoginFootprintSummary([])
    };
  }

  const rows = await TitulinoAuthService.getUserLoginFootprintByContact(
    contactInternalId,
    token,
    'getContactLoginFootprint'
  );

  return {
    contactInternalId,
    rows,
    heatmapData: LoginFootprint.buildLoginFootprintHeatmapData(rows),
    scatterData: LoginFootprint.buildLoginFootprintScatterData(rows, { includeSegment: false }),
    summary: LoginFootprint.buildLoginFootprintSummary(rows)
  };
};

export const getAllUserLoginFootprint = async (emailId) => {
  const token = await getTokenFromEmail(emailId);

  if (!token) {
    return {
      emailId,
      rows: [],
      heatmapData: [],
      scatterData: [],
      summary: LoginFootprint.buildLoginFootprintSummary([])
    };
  }

  const rows = await TitulinoAuthService.getAllUserLoginFootprint(
    token,
    'getAllUserLoginFootprint'
  );

  return {
    emailId,
    rows,
    heatmapData: LoginFootprint.buildLoginFootprintHeatmapData(rows),
    scatterData: LoginFootprint.buildLoginFootprintScatterData(rows, { groupBy: 'profile', includeSegment: true }),
    tableModel: LoginFootprint.buildLoginFootprintTableModel(rows),
    summary: LoginFootprint.buildLoginFootprintSummary(rows)
  };
};

export const uploadCourseCoverImage = async (adminEmailId, file, courseCodeId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) {
    return { success: false, imageUrl: null, errorMessage: 'Missing admin token.' };
  }
  if (!file) {
    return { success: false, imageUrl: null, errorMessage: 'No file provided.' };
  }
  if (!courseCodeId) {
    return { success: false, imageUrl: null, errorMessage: 'Missing course code ID.' };
  }
  const apiResult = await TitulinoNetService.uploadCourseCoverImage(token, file, courseCodeId, 'AdminToolsManager');
  if (!apiResult) {
    return { success: false, imageUrl: null, errorMessage: 'Course cover upload failed.' };
  }
  const imageUrl = AdminTools.extractUploadedCoverImageUrl(apiResult);
  if (!imageUrl) {
    return { success: false, imageUrl: null, errorMessage: 'Upload response did not include a public image URL.' };
  }
  return { success: true, imageUrl, errorMessage: null };
};

export const getContactGeoMaps = async (selectedContact) => {
  const bCode = selectedContact?.Location?.BirthLocation?.CountryOfBirth;
  const bRegion = selectedContact?.Location?.BirthLocation?.CountryDivisionBirthName;
  const rCode = selectedContact?.Location?.ResidencyLocation?.CountryOfResidency;
  const rRegion = selectedContact?.Location?.ResidencyLocation?.CountryDivisionResidencyName;

  const birthPromise = (bCode && bRegion)
    ? getGeoMapResource(bCode, 'AdminTools-Birth').catch(() => null)
    : Promise.resolve(null);
  const residencyPromise = (rCode && rRegion)
    ? (rCode === bCode && bRegion ? birthPromise : getGeoMapResource(rCode, 'AdminTools-Residency').catch(() => null))
    : Promise.resolve(null);

  const [birth, residency] = await Promise.all([birthPromise, residencyPromise]);
  return { birth, residency };
};

const AdminToolsManager = {
  initAdminTools,
  assignEnrolleeRoleToCourse,
  revokeCourseFacilitatorAccess,
  getGlobalUserRole,
  upsertGlobalUserRole,
  assignGlobalRole,
  revokeGlobalRole,
  upsertCourse,
  getContactCourseProgressActivity,
  getContactLoginFootprint,
  getAllUserLoginFootprint,
  hydrateAdminToolAvatarUrls,
  getContactGeoMaps,
  uploadCourseCoverImage,
  generateCourseCodeId: AdminTools.generateCourseCodeId,
  buildCourseUpsertPayload: AdminTools.buildCourseUpsertPayload,
  buildEnrollExistingContactToCoursePayload: AdminTools.buildEnrollExistingContactToCoursePayload,
  buildUpsertUserRoleCoursePayload: AdminTools.buildUpsertUserRoleCoursePayload,
  buildUpsertUserRoleGlobalPayload: AdminTools.buildUpsertUserRoleGlobalPayload,
  prefillFromTemplate: AdminTools.prefillFromTemplate,
  isValidHttpUrl: AdminTools.isValidHttpUrl
};

export default AdminToolsManager;
