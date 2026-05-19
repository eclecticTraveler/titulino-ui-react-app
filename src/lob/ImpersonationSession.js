import { AUTH_TITULINO_INTERNAL_TOKEN } from 'redux/constants/Grant';
import { AUTH_TOKEN } from 'redux/constants/Auth';

const ACTIVE_IMPERSONATION_PROFILE_KEY = 'TitulinoActiveImpersonationProfile';
const IMPERSONATION_LAUNCH_KEY_PREFIX = 'TitulinoImpersonationLaunch';
const DEFAULT_TTL_MINUTES = 160;

const shouldDebugImpersonation = () => (
  process.env.NODE_ENV !== 'production' ||
  window.localStorage.getItem('debugImpersonation') === 'true'
);

const logImpersonationDebug = (message, payload = {}) => {
  if (!shouldDebugImpersonation()) return;
  console.log(`[ImpersonationSession] ${message}`, payload);
};

const normalizeBoolean = (value, fallback = false) => (
  typeof value === 'boolean' ? value : fallback
);

const normalizeGlobalRoles = (roles) => (
  Array.isArray(roles) ? roles : []
);

export const normalizeImpersonationUserProfile = (userProfile = {}) => {
  const globalRoles = normalizeGlobalRoles(userProfile?.globalRoles || userProfile?.GlobalRoles);
  const impersonation = userProfile?.impersonation || userProfile?.Impersonation || {};

  return {
    userCourses: userProfile?.userCourses ?? userProfile?.UserCourses ?? null,
    contactId: userProfile?.contactId ?? userProfile?.ContactId ?? null,
    contactInternalId: userProfile?.contactInternalId ?? userProfile?.ContactInternalId ?? null,
    communicationName: userProfile?.communicationName ?? userProfile?.CommunicationName ?? null,
    expirationDate: userProfile?.expirationDate ?? userProfile?.ExpirationDate ?? null,
    hasEverBeenFacilitator: userProfile?.hasEverBeenFacilitator ?? userProfile?.hasEverBeenFacilitador ?? false,
    isGlobalAccessUser: userProfile?.isGlobalAccessUser ?? userProfile?.IsGlobalAccessUser ?? globalRoles.length > 0,
    globalRoles,
    innerToken: userProfile?.innerToken || userProfile?.token || userProfile?.InnerToken || userProfile?.Token || null,
    emailId: userProfile?.emailId ?? userProfile?.EmailId ?? null,
    yearOfBirth: userProfile?.yearOfBirth ?? userProfile?.YearOfBirth ?? null,
    contactPaymentProviderId: userProfile?.contactPaymentProviderId ?? userProfile?.ContactPaymentProviderId ?? null,
    impersonation: {
      ...impersonation,
      isImpersonating: normalizeBoolean(
        impersonation?.isImpersonating ?? impersonation?.IsImpersonating,
        true
      )
    }
  };
};

const buildExpiry = (ttlMinutes = DEFAULT_TTL_MINUTES) => (
  Date.now() + ttlMinutes * 60 * 1000
);

const getJsonItem = (storage, key) => {
  if (!storage || !key) return null;
  const rawValue = storage.getItem(key);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    storage.removeItem(key);
    return null;
  }
};

const setJsonItem = (storage, key, value) => {
  if (!storage || !key) return;
  storage.setItem(key, JSON.stringify(value));
};

const getLaunchStorageKey = (launchId) => (
  `${IMPERSONATION_LAUNCH_KEY_PREFIX}_${launchId}`
);

const getLaunchKeys = () => (
  Object.keys(window.localStorage || {}).filter(key => key.startsWith(`${IMPERSONATION_LAUNCH_KEY_PREFIX}_`))
);

export const getImpersonationLaunchDebugSnapshot = (launchId) => {
  const key = launchId ? getLaunchStorageKey(launchId) : null;
  const rawLaunchRecord = key ? window.localStorage.getItem(key) : null;
  const launchRecord = key ? getJsonItem(window.localStorage, key) : null;
  const activeRecord = getJsonItem(window.sessionStorage, ACTIVE_IMPERSONATION_PROFILE_KEY);
  const userProfile = launchRecord?.userProfile || activeRecord?.userProfile || null;
  const now = Date.now();

  return {
    launchId: launchId || null,
    launchStorageKey: key,
    currentOrigin: window.location.origin,
    hasRawLaunchRecord: !!rawLaunchRecord,
    hasParsedLaunchRecord: !!launchRecord,
    launchRecordExpired: !!launchRecord?.expiry && now > launchRecord.expiry,
    launchExpiry: launchRecord?.expiry || null,
    now,
    availableLaunchKeys: getLaunchKeys(),
    hasActiveImpersonationProfile: !!activeRecord?.userProfile,
    hasEmailId: !!userProfile?.emailId,
    hasInnerToken: !!userProfile?.innerToken,
    profileEmailId: userProfile?.emailId || null,
    profileContactInternalId: userProfile?.contactInternalId || null
  };
};

export const buildActiveImpersonationRecord = (userProfile = {}, ttlMinutes = DEFAULT_TTL_MINUTES) => {
  const normalizedUserProfile = normalizeImpersonationUserProfile(userProfile);
  if (!normalizedUserProfile?.emailId || !normalizedUserProfile?.innerToken) {
    return null;
  }

  return {
    userProfile: normalizedUserProfile,
    expiry: buildExpiry(ttlMinutes)
  };
};

export const setActiveImpersonationProfileInSessionStorage = (
  storage,
  userProfile = {},
  ttlMinutes = DEFAULT_TTL_MINUTES
) => {
  const activeRecord = buildActiveImpersonationRecord(userProfile, ttlMinutes);
  if (!activeRecord || !storage) return null;

  setJsonItem(storage, ACTIVE_IMPERSONATION_PROFILE_KEY, activeRecord);
  return activeRecord.userProfile;
};

export const createImpersonationLaunch = (startResult = {}, ttlMinutes = 5) => {
  const userProfile = normalizeImpersonationUserProfile(startResult?.userProfile || startResult?.UserProfile);
  if (!userProfile?.emailId || !userProfile?.innerToken) {
    logImpersonationDebug('createImpersonationLaunch:missing-profile-fields', {
      hasUserProfile: !!(startResult?.userProfile || startResult?.UserProfile),
      hasEmailId: !!userProfile?.emailId,
      hasInnerToken: !!userProfile?.innerToken,
      receivedKeys: Object.keys(startResult || {})
    });
    return null;
  }

  const impersonationSessionId = startResult?.impersonationSessionId || startResult?.ImpersonationSessionId || null;
  const launchId = impersonationSessionId || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const launchRecord = {
    launchId,
    userProfile,
    impersonationSessionId,
    expiresAt: startResult?.expiresAt || startResult?.ExpiresAt || null,
    createdAt: new Date().toISOString(),
    expiry: buildExpiry(ttlMinutes)
  };

  setJsonItem(window.localStorage, getLaunchStorageKey(launchId), launchRecord);
  logImpersonationDebug('createImpersonationLaunch:stored', getImpersonationLaunchDebugSnapshot(launchId));
  return launchRecord;
};

export const getImpersonationLaunch = (launchId) => {
  const key = getLaunchStorageKey(launchId);
  const launchRecord = getJsonItem(window.localStorage, key);

  if (!launchRecord || Date.now() > launchRecord.expiry) {
    logImpersonationDebug('getImpersonationLaunch:missing-or-expired', getImpersonationLaunchDebugSnapshot(launchId));
    window.localStorage.removeItem(key);
    return null;
  }

  logImpersonationDebug('getImpersonationLaunch:found', getImpersonationLaunchDebugSnapshot(launchId));
  return launchRecord;
};

export const consumeImpersonationLaunch = getImpersonationLaunch;

export const clearImpersonationLaunch = (launchId) => {
  window.localStorage.removeItem(getLaunchStorageKey(launchId));
};

export const setActiveImpersonationProfile = (userProfile = {}, ttlMinutes = DEFAULT_TTL_MINUTES) => {
  const normalizedUserProfile = setActiveImpersonationProfileInSessionStorage(
    window.sessionStorage,
    userProfile,
    ttlMinutes
  );
  if (!normalizedUserProfile) return null;

  logImpersonationDebug('setActiveImpersonationProfile:stored', {
    emailId: normalizedUserProfile.emailId,
    contactInternalId: normalizedUserProfile.contactInternalId,
    hasInnerToken: !!normalizedUserProfile.innerToken,
    isImpersonating: normalizedUserProfile?.impersonation?.isImpersonating === true
  });

  return normalizedUserProfile;
};

export const getActiveImpersonationProfile = () => {
  const activeRecord = getJsonItem(window.sessionStorage, ACTIVE_IMPERSONATION_PROFILE_KEY);
  if (!activeRecord) return null;

  if (Date.now() > activeRecord.expiry) {
    window.sessionStorage.removeItem(ACTIVE_IMPERSONATION_PROFILE_KEY);
    return null;
  }

  return activeRecord.userProfile || null;
};

export const hasActiveImpersonationProfile = () => !!getActiveImpersonationProfile();

const clearSharedAuthIfOwnedByImpersonation = (userProfile) => {
  if (!userProfile?.emailId && !userProfile?.innerToken) return;

  const rawAuthToken = window.localStorage.getItem(AUTH_TOKEN);
  try {
    const parsedAuthToken = rawAuthToken ? JSON.parse(rawAuthToken) : null;
    if (
      parsedAuthToken?.impersonation === true &&
      parsedAuthToken?.email === userProfile?.emailId
    ) {
      window.localStorage.removeItem(AUTH_TOKEN);
    }
  } catch (error) {
    // Normal Supabase/auth tokens are not always JSON; leave them alone.
  }

  if (
    userProfile?.innerToken &&
    window.localStorage.getItem(AUTH_TITULINO_INTERNAL_TOKEN) === userProfile.innerToken
  ) {
    window.localStorage.removeItem(AUTH_TITULINO_INTERNAL_TOKEN);
  }
};

export const clearActiveImpersonationProfile = ({ clearSharedAuth = true } = {}) => {
  const activeProfile = getActiveImpersonationProfile();
  if (clearSharedAuth) {
    clearSharedAuthIfOwnedByImpersonation(activeProfile);
  }
  window.sessionStorage.removeItem(ACTIVE_IMPERSONATION_PROFILE_KEY);
  logImpersonationDebug('clearActiveImpersonationProfile:cleared', {
    emailId: activeProfile?.emailId || null,
    contactInternalId: activeProfile?.contactInternalId || null
  });
  return activeProfile;
};

const ImpersonationSession = {
  ACTIVE_IMPERSONATION_PROFILE_KEY,
  IMPERSONATION_LAUNCH_KEY_PREFIX,
  normalizeImpersonationUserProfile,
  createImpersonationLaunch,
  buildActiveImpersonationRecord,
  setActiveImpersonationProfileInSessionStorage,
  getImpersonationLaunch,
  getImpersonationLaunchDebugSnapshot,
  consumeImpersonationLaunch,
  clearImpersonationLaunch,
  setActiveImpersonationProfile,
  getActiveImpersonationProfile,
  hasActiveImpersonationProfile,
  clearActiveImpersonationProfile
};

export default ImpersonationSession;
