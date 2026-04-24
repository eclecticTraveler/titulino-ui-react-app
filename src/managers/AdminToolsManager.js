import TitulinoRestService from "services/TitulinoRestService";
import TitulinoAuthService from "services/TitulinoAuthService";
import LocalStorageService from "services/LocalStorageService";
import AdminInsights from "lob/AdminInsights";
import StudentProgress from "lob/StudentProgress";
import LoginFootprint from "lob/LoginFootprint";
import KnowMeProfiles from "lob/KnowMeProfiles";
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

export const assignRoleToCourse = async (contactInternalId, courseCodeId, roleId, contactEmailId, adminEmailId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;
  return TitulinoAuthService.assignRoleToCourse(contactInternalId, courseCodeId, roleId, contactEmailId, token, 'AdminToolsManager');
};

export const assignGlobalRole = async (contactInternalId, roleId, adminEmailId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;
  return TitulinoAuthService.assignGlobalRole(contactInternalId, roleId, token, 'AdminToolsManager');
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

const AdminToolsManager = {
  initAdminTools,
  assignRoleToCourse,
  assignGlobalRole,
  upsertCourse,
  getContactCourseProgressActivity,
  getContactLoginFootprint,
  getAllUserLoginFootprint,
  hydrateAdminToolAvatarUrls
};

export default AdminToolsManager;
