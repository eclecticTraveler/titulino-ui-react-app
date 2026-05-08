import TitulinoRestService from "services/TitulinoRestService";
import TitulinoAdminAuthService from "services/Admin/TitulinoAdminAuthService";
import TitulinoLrnAuthService from "services/Lrn/TitulinoLrnAuthService";
import TitulinoNetService from "services/TitulinoNetService";
import TitulinoShopAuthService from "services/Shop/TitulinoShopAuthService";
import LocalStorageService from "services/LocalStorageService";
import { getGeoMapResource } from "services/GoogleService";
import AdminInsights from "lob/AdminInsights";
import StudentProgress from "lob/StudentProgress";
import LoginFootprint from "lob/LoginFootprint";
import KnowMeProfiles from "lob/KnowMeProfiles";
import AdminTools from "lob/AdminTools";
import ContactProfilesMonitoring from "lob/ContactProfilesMonitoring";
import ContactProfileEditor from "lob/ContactProfileEditor";
import LrnConfiguration from "lob/LrnConfiguration";
import ShopAnalytics from "lob/ShopAnalytics";
import utils from 'utils';

const getTokenFromEmail = async (emailId) => {
  const user = await LocalStorageService.getCachedObject(`UserProfile_${emailId}`);
  return user?.innerToken || null;
};

const normalizeIdentifier = (value) => (
  value == null ? '' : String(value).trim().toLowerCase()
);

const toIsoString = (value) => {
  if (!value) return null;
  if (typeof value?.toISOString === 'function') return value.toISOString();
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
};

const getRevenueDateRange = (dateRange = []) => {
  return {
    startDate: toIsoString(dateRange?.[0]),
    endDate: toIsoString(dateRange?.[1])
  };
};

export const initAdminTools = async (emailId) => {
  const token = await getTokenFromEmail(emailId);
  if (!token) {
    console.warn('[AdminToolsManager] No token found for emailId:', emailId);
    return { allCourses: [], allRoles: [], allEnrollees: [] };
  }
  const [rawCourses, allRoles, allEnrollees] = await Promise.all([
    TitulinoRestService.getAllCourses('AdminToolsManager'),
    TitulinoAdminAuthService.getUserRoles(token, 'AdminToolsManager'),
    TitulinoAdminAuthService.getAllEnrollees(token, 'AdminToolsManager')
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
  return TitulinoLrnAuthService.assignEnrolleeRoleToCourse(payload, token, 'AdminToolsManager');
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
  return TitulinoLrnAuthService.upsertUserRoleCourse(payload, token, 'AdminToolsManager');
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

  const result = await TitulinoAdminAuthService.getGlobalUserRole(contactInternalId, token, 'AdminToolsManager');

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
  return TitulinoAdminAuthService.upsertUserRoleGlobal(payload, token, 'AdminToolsManager');
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
  return TitulinoAdminAuthService.upsertCourse(courseData, token, 'AdminToolsManager');
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

    const rows = await TitulinoLrnAuthService.getCourseProgress(
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

export const getContactShopPurchaseHistory = async (contactInternalId, emailId) => {
  const token = await getTokenFromEmail(emailId);

  if (!token || !contactInternalId) {
    return {
      contactInternalId,
      rows: [],
      tableModel: ShopAnalytics.buildContactShopPurchaseHistoryTableModel([], contactInternalId)
    };
  }

  const rows = await TitulinoShopAuthService.getShopPurchaseHistoryByContacts(
    [contactInternalId],
    token,
    'getContactShopPurchaseHistory'
  );

  return {
    contactInternalId,
    rows,
    tableModel: ShopAnalytics.buildContactShopPurchaseHistoryTableModel(rows, contactInternalId)
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

  const rows = await TitulinoAdminAuthService.getUserLoginFootprintByContact(
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

  const rows = await TitulinoAdminAuthService.getAllUserLoginFootprint(
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

export const getContactProfileMonitoring = async (emailId) => {
  const token = await getTokenFromEmail(emailId);

  if (!token) {
    return {
      emailId,
      optedOutActiveContactProfiles: [],
      inactiveContactProfiles: [],
      optedOutActiveContactProfileTableModel: ContactProfilesMonitoring.buildContactProfileTableModel([]),
      inactiveContactProfileTableModel: ContactProfilesMonitoring.buildContactProfileTableModel([])
    };
  }

  const [optedOutActiveContactProfiles, inactiveContactProfiles] = await Promise.all([
    TitulinoAdminAuthService.getOptedOutActiveContactProfiles(
      token,
      'getContactProfileMonitoring'
    ),
    TitulinoAdminAuthService.getInactiveContactProfiles(
      token,
      'getContactProfileMonitoring'
    )
  ]);

  return {
    emailId,
    optedOutActiveContactProfiles,
    inactiveContactProfiles,
    optedOutActiveContactProfileTableModel: ContactProfilesMonitoring.buildContactProfileTableModel(
      optedOutActiveContactProfiles
    ),
    inactiveContactProfileTableModel: ContactProfilesMonitoring.buildContactProfileTableModel(
      inactiveContactProfiles
    )
  };
};

export const getShopRevenueDashboard = async (emailId, filters = {}) => {
  const token = await getTokenFromEmail(emailId);
  if (!token) {
    console.warn('[AdminToolsManager] No token found for shop revenue dashboard');
    return ShopAnalytics.buildShopAnalyticsDashboard();
  }

  const {
    startDate,
    endDate
  } = getRevenueDateRange(filters.dateRange);
  const days = Number(filters.days || 30);
  const limit = Number(filters.limit || 100);
  const courseCodeId = filters.courseCodeId && filters.courseCodeId !== 'all'
    ? filters.courseCodeId
    : null;
  const tierId = filters.tierId && filters.tierId !== 'all'
    ? filters.tierId
    : null;

  const [
    shopCoursesWithPurchases,
    summary,
    health,
    revenueByTier,
    monthlyRevenue,
    dailySales,
    salesByDateRange,
    refundAnalytics,
    conversionMetrics,
    customerLifetimeValue,
    repeatCustomers,
    recentlyActiveCustomers,
    customerCohorts,
    purchaseRows,
    productsByCourse,
    productsByTier,
    activeProducts,
    languagePairSales,
    exportSalesReport
  ] = await Promise.all([
    TitulinoShopAuthService.getShopCoursesWithPurchases(token, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getAdminDashboardShopSummary(token, courseCodeId, startDate, endDate, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getShopDashboardHealth(token, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getAdminDashboardShopRevenueByTier(token, courseCodeId, startDate, endDate, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getAdminDashboardShopMonthlyRevenue(token, courseCodeId, startDate, endDate, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getAdminDashboardShopDailySales(days, token, courseCodeId, startDate, endDate, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getAdminDashboardShopSalesByDateRange(startDate, endDate, token, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getAdminDashboardShopRefundAnalytics(token, courseCodeId, startDate, endDate, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getAdminDashboardShopConversionMetrics(token, courseCodeId, startDate, endDate, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getAdminDashboardCustomerLifetimeValue(25, token, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getAdminDashboardShopRepeatCustomers(days, token, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getAdminDashboardRecentlyActiveCustomers(days, 25, token, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getAdminDashboardCustomerCohorts(token, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.searchShopPurchases(filters.searchText || '', limit, token, 'AdminToolsManager.getShopRevenueDashboard'),
    courseCodeId
      ? TitulinoShopAuthService.getShopProductsByCourse(courseCodeId, token, 'AdminToolsManager.getShopRevenueDashboard')
      : Promise.resolve([]),
    tierId
      ? TitulinoShopAuthService.getShopProductsByTier(tierId, token, 'AdminToolsManager.getShopRevenueDashboard')
      : Promise.resolve([]),
    TitulinoShopAuthService.getAdminDashboardShopActiveProducts(token, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getAdminDashboardShopSalesByLanguagePair(token, 'AdminToolsManager.getShopRevenueDashboard'),
    TitulinoShopAuthService.getExportSalesReport(startDate, endDate, token, 'AdminToolsManager.getShopRevenueDashboard')
  ]);

  return ShopAnalytics.buildShopAnalyticsDashboard({
    summary,
    health,
    shopCoursesWithPurchases,
    revenueByTier,
    monthlyRevenue,
    dailySales,
    salesByDateRange,
    refundAnalytics,
    conversionMetrics,
    customerLifetimeValue,
    repeatCustomers,
    recentlyActiveCustomers,
    customerCohorts,
    purchaseRows,
    courseLeaderboard: shopCoursesWithPurchases,
    productsByCourse,
    productsByTier,
    activeProducts,
    languagePairSales,
    exportSalesReport
  });
};

const isShopApiMutationSuccessful = (result) => {
  if (result === true) return true;
  if (!result) return false;
  if (Array.isArray(result)) return true;
  if (result?.success === false || result?.Success === false) return false;
  return result?.success === true || result?.Success === true || typeof result === 'object' || typeof result === 'string';
};

export const upsertShopProductCourseTier = async (adminEmailId, productCourseTier = {}) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) {
    return { success: false, errorMessage: 'Missing admin token.' };
  }

  const payload = ShopAnalytics.buildProductCourseTierPayload(productCourseTier);
  if (!payload.PaymentProviderPriceId || !payload.CourseCodeId || !payload.TierId) {
    return { success: false, errorMessage: 'Missing required product fields.', payload };
  }

  const apiResult = await TitulinoShopAuthService.upsertProductCourseTier(
    payload,
    token,
    'upsertShopProductCourseTier'
  );

  return {
    success: isShopApiMutationSuccessful(apiResult),
    apiResult,
    payload
  };
};

export const toggleShopProductActive = async (adminEmailId, paymentProviderPriceId, isActive = false) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) {
    return { success: false, errorMessage: 'Missing admin token.' };
  }
  if (!paymentProviderPriceId) {
    return { success: false, errorMessage: 'Missing payment provider price id.' };
  }

  const apiResult = await TitulinoShopAuthService.toggleShopProductActive(
    paymentProviderPriceId,
    isActive,
    token,
    'toggleShopProductActive'
  );

  return {
    success: isShopApiMutationSuccessful(apiResult),
    apiResult,
    paymentProviderPriceId,
    isActive
  };
};

const isToggleApiResultSuccessful = (result) => {
  if (result === true) return true;
  if (!result) return false;
  if (Array.isArray(result)) return true;
  if (result?.success === false || result?.Success === false) return false;
  return result?.success === true || result?.Success === true || typeof result === 'object' || typeof result === 'string';
};

const isUpsertApiResultSuccessful = (result) => {
  if (result === true) return true;
  if (!result) return false;
  if (Array.isArray(result)) return result.length > 0;
  if (result?.success === false || result?.Success === false) return false;
  return result?.success === true || result?.Success === true || typeof result === 'object' || typeof result === 'string';
};

const buildToggleMutationResult = (apiResult, payload = [], mutationPatches = {}) => ({
  success: isToggleApiResultSuccessful(apiResult),
  apiResult,
  payload,
  ...mutationPatches
});

export const toggleContactEmailOptOut = async (selectedRows, adminEmailId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;

  const payload = ContactProfilesMonitoring.buildToggleContactEmailOptOutPayload(selectedRows);
  if (!payload.length) return false;

  const apiResult = await TitulinoAdminAuthService.toggleContactEmailOptOut(
    payload,
    token,
    'AdminToolsManager'
  );

  return buildToggleMutationResult(apiResult, payload, {
    contactEmailOptOutPatches: payload.map(item => ({
      ...item,
      hasOptedOutOfCommunication: false
    }))
  });
};

export const toggleContactEmailOptOutByContact = async (
  contactInternalId,
  emailId,
  adminEmailId,
  nextHasOptedOutOfCommunication
) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;

  const payload = ContactProfilesMonitoring.buildContactEmailOptOutPayload(contactInternalId, emailId);
  if (!payload.length) return false;

  const apiResult = await TitulinoAdminAuthService.toggleContactEmailOptOut(
    payload,
    token,
    'AdminToolsManager'
  );

  return buildToggleMutationResult(apiResult, payload, {
    contactEmailOptOutPatches: payload.map(item => ({
      ...item,
      hasOptedOutOfCommunication: nextHasOptedOutOfCommunication === undefined
        ? true
        : nextHasOptedOutOfCommunication
    }))
  });
};

export const toggleContactActive = async (selectedRows, adminEmailId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;

  const payload = ContactProfilesMonitoring.buildToggleContactActivePayload(selectedRows);
  if (!payload.length) return false;

  const apiResult = await TitulinoAdminAuthService.toggleContactActive(
    payload,
    token,
    'AdminToolsManager'
  );

  return buildToggleMutationResult(apiResult, payload, {
    contactActivePatches: payload.map(item => ({
      ...item,
      isActive: true
    }))
  });
};

export const toggleContactActiveByContact = async (contactInternalId, adminEmailId, nextIsActive = false) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token) return false;

  const payload = ContactProfilesMonitoring.buildContactActivePayload(contactInternalId);
  if (!payload.length) return false;

  const apiResult = await TitulinoAdminAuthService.toggleContactActive(
    payload,
    token,
    'AdminToolsManager'
  );

  return buildToggleMutationResult(apiResult, payload, {
    contactActivePatches: payload.map(item => ({
      ...item,
      isActive: nextIsActive
    }))
  });
};

export const upsertSelectedContactProfile = async (profileUpdate, adminEmailId) => {
  const token = await getTokenFromEmail(adminEmailId);
  if (!token || !profileUpdate?.payload?.length) {
    return {
      success: false,
      submittedEnrollee: null,
      contactProfilePatch: null,
      uploadedProfilePicture: null
    };
  }

  const submittedEnrollee = await TitulinoAdminAuthService.upsertEnrolleeList(
    profileUpdate.payload,
    token,
    'AdminToolsManager.upsertSelectedContactProfile'
  );
  const success = isUpsertApiResultSuccessful(submittedEnrollee);
  let uploadedProfilePicture = null;
  let contactProfilePatch = profileUpdate.patch || null;

  const rawProfileFile = profileUpdate?.filesMap?.profilePictureUpload?.[0]?.originFileObj ||
    profileUpdate?.filesMap?.profilePictureUpload?.[0] ||
    null;

  if (success && rawProfileFile && contactProfilePatch?.ContactInternalId) {
    const emailId = profileUpdate?.payload?.[0]?.emailAddress || ContactProfileEditor.getPrimaryContactEmail(contactProfilePatch);
    const fileToUpload = await LrnConfiguration.buildStudentKnowMeFileName(
      rawProfileFile,
      contactProfilePatch.ContactInternalId,
      emailId,
      0
    );

    uploadedProfilePicture = await TitulinoNetService.upsertStudentKnowMeProfileImage(
      token,
      fileToUpload,
      'AdminToolsManager.upsertSelectedContactProfile'
    );

    const profileUrl = uploadedProfilePicture?.profileUrl || uploadedProfilePicture?.ProfileUrl || null;
    if (profileUrl) {
      contactProfilePatch = {
        ...contactProfilePatch,
        AvatarUrl: profileUrl,
        avatarUrl: profileUrl
      };
    }
  }

  return {
    success,
    submittedEnrollee,
    contactProfilePatch,
    uploadedProfilePicture
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
  getContactShopPurchaseHistory,
  getContactLoginFootprint,
  getAllUserLoginFootprint,
  getContactProfileMonitoring,
  getShopRevenueDashboard,
  upsertShopProductCourseTier,
  toggleShopProductActive,
  toggleContactEmailOptOut,
  toggleContactEmailOptOutByContact,
  toggleContactActive,
  toggleContactActiveByContact,
  upsertSelectedContactProfile,
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
