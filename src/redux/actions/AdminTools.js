import AdminToolsManager from 'managers/AdminToolsManager';
import {
  ON_LOADING_ADMIN_TOOLS_INIT,
  ON_ASSIGNING_ENROLLEE_ROLE_TO_COURSE,
  ON_REVOKING_COURSE_FACILITATOR_ACCESS,
  ON_LOADING_GLOBAL_USER_ROLE,
  ON_ASSIGNING_GLOBAL_ROLE,
  ON_REVOKING_GLOBAL_ROLE,
  ON_CLEAR_SELECTED_CONTACT,
  ON_UPSERTING_COURSE,
  ON_LOADING_CONTACT_COURSE_PROGRESS_ACTIVITY,
  ON_LOADING_CONTACT_SHOP_PURCHASE_HISTORY,
  ON_LOADING_CONTACT_LOGIN_FOOTPRINT,
  ON_LOADING_ALL_USER_LOGIN_FOOTPRINT,
  ON_LOADING_CONTACT_PROFILE_MONITORING,
  ON_TOGGLING_CONTACT_EMAIL_OPT_OUT,
  ON_TOGGLING_CONTACT_ACTIVE,
  ON_HYDRATING_ADMIN_TOOLS_AVATARS,
  ON_LOADING_CONTACT_GEO_MAPS,
  ON_UPLOADING_COURSE_COVER_IMAGE,
  ON_UPSERTING_SELECTED_CONTACT_PROFILE,
  ON_LOADING_SHOP_REVENUE_DASHBOARD,
  ON_UPSERTING_SHOP_PRODUCT_COURSE_TIER,
  ON_UPSERTING_SHOP_TIERS,
  ON_UPSERTING_SHOP_PAYMENT_PROVIDERS,
  ON_TOGGLING_SHOP_PRODUCT_ACTIVE,
  ON_STARTING_CONTACT_IMPERSONATION,
  ON_LOADING_PROCESS_LOG_EVENTS,
  ON_LOADING_CONTACT_SEGMENT_METADATA,
  ON_LOADING_CONTACT_SEGMENT_COUNTRY_DIVISIONS,
  ON_LOADING_CONTACT_SEGMENT,
  ON_LOADING_AUDIENCE_MESSAGE_VARIABLES,
  ON_SENDING_AUDIENCE_MESSAGE
} from '../constants/AdminTools';

// Pure helpers re-exported via the manager so components keep a single
// import surface (redux/actions/AdminTools) and stay compliant with the
// Component → Redux → Manager → Service/LOB convention.
export const generateCourseCodeId = (...args) => AdminToolsManager.generateCourseCodeId(...args);
export const buildCourseUpsertPayload = (...args) => AdminToolsManager.buildCourseUpsertPayload(...args);
export const prefillFromTemplate = (...args) => AdminToolsManager.prefillFromTemplate(...args);
export const isValidHttpUrl = (...args) => AdminToolsManager.isValidHttpUrl(...args);
export const buildAccessManagementPolicy = (...args) => AdminToolsManager.buildAccessManagementPolicy(...args);
export const buildShopPurchasedCourseSelectionOptions = (...args) => AdminToolsManager.buildShopPurchasedCourseSelectionOptions(...args);
export const buildShopTierSelectionOptions = (...args) => AdminToolsManager.buildShopTierSelectionOptions(...args);
export const buildShopCustomersTableModel = (...args) => AdminToolsManager.buildShopCustomersTableModel(...args);
export const buildContactProfileTableModel = (...args) => AdminToolsManager.buildContactProfileTableModel(...args);
export const filterContactProfileTableData = (...args) => AdminToolsManager.filterContactProfileTableData(...args);
export const mergeContactProfilePatch = (...args) => AdminToolsManager.mergeContactProfilePatch(...args);
export const setActiveImpersonationProfileInSessionStorage = (...args) => AdminToolsManager.setActiveImpersonationProfileInSessionStorage(...args);
export const getProcessLogSourceConfigs = (...args) => AdminToolsManager.getProcessLogSourceConfigs(...args);
export const getProcessLogSeverityOptions = (...args) => AdminToolsManager.getProcessLogSeverityOptions(...args);
export const getProcessLogLimitOptions = (...args) => AdminToolsManager.getProcessLogLimitOptions(...args);
export const filterProcessLogRows = (...args) => AdminToolsManager.filterProcessLogRows(...args);
export const buildProcessLogTableColumns = (...args) => AdminToolsManager.buildProcessLogTableColumns(...args);
export const buildProcessLogRoleSelectionOptions = (...args) => AdminToolsManager.buildProcessLogRoleSelectionOptions(...args);
export const getAudienceDefaultFilters = (...args) => AdminToolsManager.getAudienceDefaultFilters(...args);
export const buildAudienceMetadataOptions = (...args) => AdminToolsManager.buildAudienceMetadataOptions(...args);
export const buildAudienceCountryOptionsForLocation = (...args) => AdminToolsManager.buildAudienceCountryOptionsForLocation(...args);
export const buildAudienceCountryDivisionOptions = (...args) => AdminToolsManager.buildAudienceCountryDivisionOptions(...args);
export const buildAudienceTableColumns = (...args) => AdminToolsManager.buildAudienceTableColumns(...args);
export const buildAudienceSummary = (...args) => AdminToolsManager.buildAudienceSummary(...args);
export const buildAudienceMessageVariableOptions = (...args) => AdminToolsManager.buildAudienceMessageVariableOptions(...args);
export const hasAudienceMessageContent = (...args) => AdminToolsManager.hasAudienceMessageContent(...args);

export const onLoadingAdminToolsInit = async (emailId) => {
  const { allCourses, allRoles, allEnrollees, allRawCourses } = await AdminToolsManager.initAdminTools(emailId);
  return { type: ON_LOADING_ADMIN_TOOLS_INIT, allCourses, allRoles, allEnrollees, allRawCourses };
};

export const onAssigningEnrolleeRoleToCourse = async (contactInternalId, courseCodeId, roleId, contactEmailId, adminEmailId) => {
  const result = await AdminToolsManager.assignEnrolleeRoleToCourse(contactInternalId, courseCodeId, roleId, contactEmailId, adminEmailId);
  return { type: ON_ASSIGNING_ENROLLEE_ROLE_TO_COURSE, assignResult: result };
};

export const onRevokingCourseFacilitatorAccess = async (contactInternalId, courseCodeId, contactEmailId, adminEmailId, targetRoleId) => {
  const result = await AdminToolsManager.revokeCourseFacilitatorAccess(contactInternalId, courseCodeId, contactEmailId, adminEmailId, targetRoleId);
  return { type: ON_REVOKING_COURSE_FACILITATOR_ACCESS, revokeResult: result };
};

export const onLoadingGlobalUserRole = async (contactInternalId, adminEmailId) => {
  const globalUserRole = await AdminToolsManager.getGlobalUserRole(contactInternalId, adminEmailId);
  return { type: ON_LOADING_GLOBAL_USER_ROLE, contactInternalId, globalUserRole };
};

export const onAssigningGlobalRole = async (contactInternalId, roleId, adminEmailId) => {
  const result = await AdminToolsManager.assignGlobalRole(contactInternalId, roleId, adminEmailId);
  return { type: ON_ASSIGNING_GLOBAL_ROLE, assignResult: result };
};

export const onRevokingGlobalRole = async (contactInternalId, roleId, adminEmailId) => {
  const result = await AdminToolsManager.revokeGlobalRole(contactInternalId, roleId, adminEmailId);
  return { type: ON_REVOKING_GLOBAL_ROLE, revokeResult: result };
};

export const onUpsertingCourse = async (courseDataArray, adminEmailId) => {
  const result = await AdminToolsManager.upsertCourse(courseDataArray, adminEmailId);
  return { type: ON_UPSERTING_COURSE, upsertResult: result };
};

export const onLoadingContactCourseProgressActivity = async (contactInternalId, courseIds, emailId, contactEmails) => {
  const contactCourseProgressActivity = await AdminToolsManager.getContactCourseProgressActivity(
    contactInternalId,
    courseIds,
    emailId,
    contactEmails
  );
  return { type: ON_LOADING_CONTACT_COURSE_PROGRESS_ACTIVITY, contactCourseProgressActivity };
};

export const onLoadingContactShopPurchaseHistory = async (contactInternalId, emailId) => {
  const contactShopPurchaseHistory = await AdminToolsManager.getContactShopPurchaseHistory(contactInternalId, emailId);
  return { type: ON_LOADING_CONTACT_SHOP_PURCHASE_HISTORY, contactShopPurchaseHistory };
};

export const onStartingContactImpersonation = async ({
  contactInternalId,
  selectedEmail,
  reason,
  adminEmailId
}) => {
  const impersonationResult = await AdminToolsManager.startContactImpersonation({
    contactInternalId,
    selectedEmail,
    reason,
    adminEmailId
  });

  return {
    type: ON_STARTING_CONTACT_IMPERSONATION,
    impersonationResult
  };
};

export const onLoadingContactLoginFootprint = async (contactInternalId, emailId) => {
  const contactLoginFootprint = await AdminToolsManager.getContactLoginFootprint(contactInternalId, emailId);
  return { type: ON_LOADING_CONTACT_LOGIN_FOOTPRINT, contactLoginFootprint };
};

export const onLoadingAllUserLoginFootprint = async (emailId) => {
  const allUserLoginFootprint = await AdminToolsManager.getAllUserLoginFootprint(emailId);
  return { type: ON_LOADING_ALL_USER_LOGIN_FOOTPRINT, allUserLoginFootprint };
};

export const onLoadingContactProfileMonitoring = async (emailId) => {
  const contactProfileMonitoring = await AdminToolsManager.getContactProfileMonitoring(emailId);
  return { type: ON_LOADING_CONTACT_PROFILE_MONITORING, contactProfileMonitoring };
};

export const onLoadingProcessLogEvents = async (adminEmailId, sourceKey, filters) => {
  const processLogEvents = await AdminToolsManager.getProcessLogEvents(adminEmailId, sourceKey, filters);
  return {
    type: ON_LOADING_PROCESS_LOG_EVENTS,
    processLogEvents
  };
};

export const onLoadingContactSegmentMetadata = async (adminEmailId) => {
  const contactSegmentMetadata = await AdminToolsManager.getContactSegmentMetadata(adminEmailId);
  return {
    type: ON_LOADING_CONTACT_SEGMENT_METADATA,
    contactSegmentMetadata
  };
};

export const onLoadingContactSegment = async (adminEmailId, filters) => {
  const contactSegment = await AdminToolsManager.getContactSegment(adminEmailId, filters);
  return {
    type: ON_LOADING_CONTACT_SEGMENT,
    contactSegment
  };
};

export const onLoadingContactSegmentCountryDivisions = async (adminEmailId, filters) => {
  const contactSegmentCountryDivisions = await AdminToolsManager.getCountryDivisions(adminEmailId, filters);
  return {
    type: ON_LOADING_CONTACT_SEGMENT_COUNTRY_DIVISIONS,
    contactSegmentCountryDivisions
  };
};

export const onLoadingAudienceMessageVariables = async (adminEmailId, scope = 'audience') => {
  const audienceMessageVariables = await AdminToolsManager.getAudienceMessageVariables(adminEmailId, scope);
  return {
    type: ON_LOADING_AUDIENCE_MESSAGE_VARIABLES,
    audienceMessageVariables
  };
};

export const onSendingAudienceMessage = async (adminEmailId, selectedRows, messageDraft) => {
  const audienceMessageSendResult = await AdminToolsManager.sendAudienceMessage(
    adminEmailId,
    selectedRows,
    messageDraft
  );

  return {
    type: ON_SENDING_AUDIENCE_MESSAGE,
    audienceMessageSendResult
  };
};

export const onTogglingContactEmailOptOut = async (selectedRows, adminEmailId) => {
  const result = await AdminToolsManager.toggleContactEmailOptOut(selectedRows, adminEmailId);
  return {
    type: ON_TOGGLING_CONTACT_EMAIL_OPT_OUT,
    toggleResult: result,
    contactEmailOptOutPatches: result?.contactEmailOptOutPatches || []
  };
};

export const onTogglingSelectedContactEmailOptOut = async (
  contactInternalId,
  emailId,
  adminEmailId,
  nextHasOptedOutOfCommunication
) => {
  const result = await AdminToolsManager.toggleContactEmailOptOutByContact(
    contactInternalId,
    emailId,
    adminEmailId,
    nextHasOptedOutOfCommunication
  );
  return {
    type: ON_TOGGLING_CONTACT_EMAIL_OPT_OUT,
    toggleResult: result,
    contactEmailOptOutPatches: result?.contactEmailOptOutPatches || []
  };
};

export const onTogglingContactActive = async (selectedRows, adminEmailId) => {
  const result = await AdminToolsManager.toggleContactActive(selectedRows, adminEmailId);
  return {
    type: ON_TOGGLING_CONTACT_ACTIVE,
    toggleResult: result,
    contactActivePatches: result?.contactActivePatches || []
  };
};

export const onTogglingSelectedContactActive = async (contactInternalId, adminEmailId, nextIsActive = false) => {
  const result = await AdminToolsManager.toggleContactActiveByContact(contactInternalId, adminEmailId, nextIsActive);
  return {
    type: ON_TOGGLING_CONTACT_ACTIVE,
    toggleResult: result,
    contactActivePatches: result?.contactActivePatches || []
  };
};

export const onHydratingAdminToolAvatars = async (emailId, avatarUrlMap, allEnrollees, contactInternalIds) => {
  const result = await AdminToolsManager.hydrateAdminToolAvatarUrls(
    emailId,
    allEnrollees,
    contactInternalIds,
    avatarUrlMap
  );

  return {
    type: ON_HYDRATING_ADMIN_TOOLS_AVATARS,
    avatarUrlMap: result?.avatarUrlMap || avatarUrlMap || {},
    allEnrollees: result?.allEnrollees || allEnrollees || []
  };
};

export const onClearSelectedContact = () => {
  return { type: ON_CLEAR_SELECTED_CONTACT };
};

export const onLoadingContactGeoMaps = async (selectedContact) => {
  const contactGeoMaps = await AdminToolsManager.getContactGeoMaps(selectedContact);
  return { type: ON_LOADING_CONTACT_GEO_MAPS, contactGeoMaps };
};

export const onUploadingCourseCoverImage = async (adminEmailId, file, courseCodeId) => {
  const uploadResult = await AdminToolsManager.uploadCourseCoverImage(adminEmailId, file, courseCodeId);
  return { type: ON_UPLOADING_COURSE_COVER_IMAGE, uploadResult };
};

export const onUpsertingSelectedContactProfile = async (profileUpdate, adminEmailId) => {
  const upsertResult = await AdminToolsManager.upsertSelectedContactProfile(profileUpdate, adminEmailId);
  return {
    type: ON_UPSERTING_SELECTED_CONTACT_PROFILE,
    upsertResult,
    contactProfilePatch: upsertResult?.contactProfilePatch || null
  };
};

export const onLoadingShopRevenueDashboard = async (adminEmailId, filters) => {
  const shopRevenueDashboard = await AdminToolsManager.getShopRevenueDashboard(adminEmailId, filters);
  return {
    type: ON_LOADING_SHOP_REVENUE_DASHBOARD,
    shopRevenueDashboard,
    shopCoursesWithPurchases: shopRevenueDashboard?.shopCoursesWithPurchases || shopRevenueDashboard?.raw?.shopCoursesWithPurchases || [],
    shopRevenueFilters: filters
  };
};

export const onUpsertingShopProductCourseTier = async (adminEmailId, productCourseTier) => {
  const result = await AdminToolsManager.upsertShopProductCourseTier(adminEmailId, productCourseTier);
  return {
    type: ON_UPSERTING_SHOP_PRODUCT_COURSE_TIER,
    upsertResult: result
  };
};

export const onUpsertingShopTiers = async (adminEmailId, tiers) => {
  const result = await AdminToolsManager.upsertShopTiers(adminEmailId, tiers);
  return {
    type: ON_UPSERTING_SHOP_TIERS,
    upsertResult: result
  };
};

export const onUpsertingShopPaymentProviders = async (adminEmailId, paymentProviders) => {
  const result = await AdminToolsManager.upsertShopPaymentProviders(adminEmailId, paymentProviders);
  return {
    type: ON_UPSERTING_SHOP_PAYMENT_PROVIDERS,
    upsertResult: result
  };
};

export const onTogglingShopProductActive = async (adminEmailId, paymentProviderPriceId, isActive) => {
  const result = await AdminToolsManager.toggleShopProductActive(adminEmailId, paymentProviderPriceId, isActive);
  return {
    type: ON_TOGGLING_SHOP_PRODUCT_ACTIVE,
    toggleResult: result
  };
};
