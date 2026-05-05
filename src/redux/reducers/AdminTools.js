import KnowMeProfiles from "lob/KnowMeProfiles";
import ContactProfileEditor from "lob/ContactProfileEditor";
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
  ON_LOADING_CONTACT_LOGIN_FOOTPRINT,
  ON_LOADING_ALL_USER_LOGIN_FOOTPRINT,
  ON_LOADING_CONTACT_PROFILE_MONITORING,
  ON_TOGGLING_CONTACT_EMAIL_OPT_OUT,
  ON_TOGGLING_CONTACT_ACTIVE,
  ON_HYDRATING_ADMIN_TOOLS_AVATARS,
  ON_LOADING_CONTACT_GEO_MAPS,
  ON_UPLOADING_COURSE_COVER_IMAGE,
  ON_UPSERTING_SELECTED_CONTACT_PROFILE
} from '../constants/AdminTools';

const initState = {
  avatarUrlMap: {}
};

const applyAvatarCacheToEnrollees = (allEnrollees = [], avatarUrlMap = {}) => (
  KnowMeProfiles.mergeKnowMeProfileUrlsIntoItems(allEnrollees, avatarUrlMap, {
    avatarField: 'AvatarUrl'
  })
);

const normalizeIdentifier = (value) => (
  value == null ? '' : String(value).trim().toLowerCase()
);

const isToggleResultSuccessful = (result) => {
  if (result === true) return true;
  if (!result) return false;
  if (Array.isArray(result)) return true;
  if (result?.success === false || result?.Success === false) return false;
  return result?.success === true || result?.Success === true || typeof result === 'object' || typeof result === 'string';
};

const patchContactEmailOptOut = (contact = {}, emailPatches = []) => {
  const contactInternalId = normalizeIdentifier(contact?.ContactInternalId || contact?.contactInternalId);
  const matchingPatches = (emailPatches || []).filter(patch => (
    normalizeIdentifier(patch?.contactInternalId || patch?.ContactInternalId) === contactInternalId
  ));

  if (!matchingPatches.length) return contact;

  const patchByEmailId = matchingPatches.reduce((accumulator, patch) => {
    const emailId = normalizeIdentifier(patch?.emailId || patch?.EmailId);
    if (!emailId) return accumulator;
    accumulator[emailId] = patch.hasOptedOutOfCommunication ?? patch.HasOptedOutOfCommunication;
    return accumulator;
  }, {});

  const patchEmails = (emails = []) => (emails || []).map((emailRecord) => {
    const emailId = normalizeIdentifier(emailRecord?.EmailId || emailRecord?.emailId);
    if (!Object.prototype.hasOwnProperty.call(patchByEmailId, emailId)) return emailRecord;

    const hasOptedOutOfCommunication = patchByEmailId[emailId];
    return {
      ...emailRecord,
      HasOptedOutOfCommunication: hasOptedOutOfCommunication,
      hasOptedOutOfCommunication
    };
  });

  return {
    ...contact,
    ...(Array.isArray(contact?.Emails) ? { Emails: patchEmails(contact.Emails) } : {}),
    ...(Array.isArray(contact?.emails) ? { emails: patchEmails(contact.emails) } : {})
  };
};

const patchContactActive = (contact = {}, activePatches = []) => {
  const contactInternalId = normalizeIdentifier(contact?.ContactInternalId || contact?.contactInternalId);
  const patch = (activePatches || []).find(item => (
    normalizeIdentifier(item?.contactInternalId || item?.ContactInternalId) === contactInternalId
  ));

  if (!patch) return contact;

  const isActive = patch.isActive ?? patch.IsActive;
  return {
    ...contact,
    IsActive: isActive,
    isActive
  };
};

const patchEnrollees = (allEnrollees = [], { emailPatches = [], activePatches = [] } = {}) => (
  (allEnrollees || []).map((contact) => (
    patchContactActive(
      patchContactEmailOptOut(contact, emailPatches),
      activePatches
    )
  ))
);

const patchEnrolleeContactProfile = (allEnrollees = [], contactProfilePatch = null) => {
  if (!contactProfilePatch?.ContactInternalId) return allEnrollees;
  const targetContactId = normalizeIdentifier(contactProfilePatch.ContactInternalId);

  return (allEnrollees || []).map((contact) => (
    normalizeIdentifier(contact?.ContactInternalId || contact?.contactInternalId) === targetContactId
      ? ContactProfileEditor.mergeContactProfilePatch(contact, contactProfilePatch)
      : contact
  ));
};

const adminTools = (state = initState, action) => {
  switch (action.type) {
    case ON_LOADING_ADMIN_TOOLS_INIT:
      return {
        ...state,
        allCourses: action.allCourses,
        allRoles: action.allRoles,
        allEnrollees: applyAvatarCacheToEnrollees(action.allEnrollees, state.avatarUrlMap),
        allRawCourses: action.allRawCourses
      };
    case ON_ASSIGNING_ENROLLEE_ROLE_TO_COURSE:
      return { ...state, lastAssignResult: action.assignResult };
    case ON_REVOKING_COURSE_FACILITATOR_ACCESS:
      return { ...state, lastRevokeResult: action.revokeResult };
    case ON_LOADING_GLOBAL_USER_ROLE:
      return { ...state, contactGlobalUserRole: action.globalUserRole };
    case ON_ASSIGNING_GLOBAL_ROLE:
      return { ...state, lastAssignResult: action.assignResult };
    case ON_REVOKING_GLOBAL_ROLE:
      return { ...state, lastGlobalRevokeResult: action.revokeResult };
    case ON_UPSERTING_COURSE:
      return { ...state, lastCourseUpsertResult: action.upsertResult };
    case ON_LOADING_CONTACT_COURSE_PROGRESS_ACTIVITY:
      return { ...state, contactCourseProgressActivity: action.contactCourseProgressActivity };
    case ON_LOADING_CONTACT_LOGIN_FOOTPRINT:
      return { ...state, contactLoginFootprint: action.contactLoginFootprint };
    case ON_LOADING_ALL_USER_LOGIN_FOOTPRINT:
      return { ...state, allUserLoginFootprint: action.allUserLoginFootprint };
    case ON_LOADING_CONTACT_PROFILE_MONITORING:
      return { ...state, contactProfileMonitoring: action.contactProfileMonitoring };
    case ON_TOGGLING_CONTACT_EMAIL_OPT_OUT:
      return {
        ...state,
        lastContactEmailOptOutToggleResult: action.toggleResult,
        allEnrollees: isToggleResultSuccessful(action.toggleResult)
          ? patchEnrollees(state.allEnrollees, { emailPatches: action.contactEmailOptOutPatches })
          : state.allEnrollees
      };
    case ON_TOGGLING_CONTACT_ACTIVE:
      return {
        ...state,
        lastContactActiveToggleResult: action.toggleResult,
        allEnrollees: isToggleResultSuccessful(action.toggleResult)
          ? patchEnrollees(state.allEnrollees, { activePatches: action.contactActivePatches })
          : state.allEnrollees
      };
    case ON_HYDRATING_ADMIN_TOOLS_AVATARS:
      return {
        ...state,
        avatarUrlMap: action.avatarUrlMap || state.avatarUrlMap,
        allEnrollees: action.allEnrollees || state.allEnrollees
      };
    case ON_LOADING_CONTACT_GEO_MAPS:
      return { ...state, contactGeoMaps: action.contactGeoMaps };
    case ON_UPLOADING_COURSE_COVER_IMAGE:
      return { ...state, lastCourseCoverUploadResult: action.uploadResult };
    case ON_UPSERTING_SELECTED_CONTACT_PROFILE:
      return {
        ...state,
        lastContactProfileUpsertResult: action.upsertResult,
        allEnrollees: action.upsertResult?.success
          ? patchEnrolleeContactProfile(state.allEnrollees, action.contactProfilePatch)
          : state.allEnrollees
      };
    case ON_CLEAR_SELECTED_CONTACT:
      return { ...state, contactCourseProgressActivity: null, contactLoginFootprint: null, contactGeoMaps: null, contactGlobalUserRole: null };
    default:
      return state;
  }
};

export default adminTools;
