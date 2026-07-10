import WebsitePreferences from "lob/WebsitePreferences";
import TitulinoLrnNetService from "services/Lrn/TitulinoLrnNetService";
import { env } from "configs/EnvironmentConfig";

const BACKUP_DEBOUNCE_MS = 1800;

// Single explicit sync target instead of scattered module singletons — token,
// storage, and readOnly always move together, atomically, via switchSyncContext.
let syncContext = { token: null, storage: null, readOnly: false };
let pendingSaveTimer = null;
let pendingSaveContext = null;
let isApplyingPreferences = false;
let restoredIdentityKey = null;

const logPreferences = (message, payload = {}) => {
  if (env.ENVIROMENT === 'prod') return;
  console.log(`[WebsitePreferencesManager] ${message}`, payload);
};

const getStorageKeys = (storage) => (
  Array.from({ length: storage?.length || 0 }, (_, index) => storage.key(index)).filter(Boolean)
);

const readPreferenceEntries = (storage) => (
  getStorageKeys(storage)
    .filter(WebsitePreferences.isWebsitePreferenceStorageKey)
    .map((key) => ({ key, value: storage.getItem(key) }))
);

const persistNow = async ({ token, storage, readOnly, whoCalledMe = 'persistNow' } = {}) => {
  if (!token || readOnly || !storage) {
    return { success: false, skipped: true };
  }

  const payload = {
    ...WebsitePreferences.buildWebsitePreferencesBackup(readPreferenceEntries(storage)),
    savedAt: new Date().toISOString()
  };

  if (!payload.preferences.storage.length) {
    return { success: false, skipped: true };
  }

  const result = await TitulinoLrnNetService.putWebsitePreferences(token, payload, whoCalledMe);
  logPreferences('persistNow', { whoCalledMe, success: result?.success === true, count: payload.preferences.storage.length });
  return result;
};

// Cancels any pending debounced save and flushes it immediately against the
// context that's about to be replaced — prevents an in-flight edit (e.g. an
// admin's preference change) from silently being dropped or redirected to a
// different token/storage pair when the context switches mid-debounce
// (impersonation start/stop, a token-expiry session reset, etc.).
const flushPendingSave = () => {
  if (!pendingSaveTimer) return;
  window.clearTimeout(pendingSaveTimer);
  const contextToFlush = pendingSaveContext;
  pendingSaveTimer = null;
  pendingSaveContext = null;
  if (contextToFlush) {
    persistNow({ ...contextToFlush, whoCalledMe: 'flushPendingSave' });
  }
};

export const isApplyingWebsitePreferences = () => isApplyingPreferences;

export const switchSyncContext = ({ token, storage, readOnly = false } = {}) => {
  flushPendingSave();
  syncContext = { token: token || null, storage: storage || syncContext.storage, readOnly };
  logPreferences('switchSyncContext', {
    hasToken: !!syncContext.token,
    readOnly: syncContext.readOnly,
    storage: syncContext.storage === (typeof window !== 'undefined' ? window.sessionStorage : null) ? 'sessionStorage' : 'localStorage'
  });
};

export const scheduleWebsitePreferencesBackup = (triggerKey) => {
  if (
    syncContext.readOnly ||
    isApplyingPreferences ||
    !syncContext.token ||
    !WebsitePreferences.isWebsitePreferenceStorageKey(triggerKey)
  ) {
    return;
  }

  window.clearTimeout(pendingSaveTimer);
  pendingSaveContext = { ...syncContext };
  pendingSaveTimer = window.setTimeout(() => {
    pendingSaveTimer = null;
    pendingSaveContext = null;
    persistNow({ ...syncContext, whoCalledMe: `schedule:${triggerKey}` });
  }, BACKUP_DEBOUNCE_MS);
};

export const saveWebsitePreferencesNow = (whoCalledMe = 'saveWebsitePreferencesNow') => (
  persistNow({ ...syncContext, whoCalledMe })
);

// One retry on a genuine fetch failure — a transient network/server error at
// restore time would otherwise look identical to "nothing was ever saved."
const fetchWebsitePreferencesWithRetry = async (token, whoCalledMe) => {
  const first = await TitulinoLrnNetService.getWebsitePreferences(token, whoCalledMe);
  if (first?.success) return first;
  return TitulinoLrnNetService.getWebsitePreferences(token, `${whoCalledMe}:retry`);
};

export const restoreWebsitePreferences = async ({
  token,
  storage,
  readOnly = false,
  identityKey,
  force = false,
  skipInitialBackup = false,
  whoCalledMe = 'restoreWebsitePreferences'
} = {}) => {
  if (!token || !storage) {
    return { success: false, exists: false, appliedCount: 0 };
  }

  if (!force && restoredIdentityKey === identityKey) {
    switchSyncContext({ token, storage, readOnly });
    return { success: true, skipped: true, appliedCount: 0 };
  }

  const result = await fetchWebsitePreferencesWithRetry(token, whoCalledMe);

  if (!result?.success) {
    // Fetch genuinely failed twice — leave restoredIdentityKey untouched so
    // the next context-change event (or an explicit force) retries instead
    // of permanently treating this identity as "already handled."
    logPreferences('restoreWebsitePreferences:fetchFailed', { whoCalledMe, status: result?.status });
    switchSyncContext({ token, storage, readOnly });
    return { ...result, appliedCount: 0 };
  }

  if (result?.exists === true && result?.preferences) {
    const entries = WebsitePreferences.selectApplicableEntries(result.preferences);
    isApplyingPreferences = true;
    try {
      entries.forEach(({ key, value }) => storage.setItem(key, value));
    } finally {
      isApplyingPreferences = false;
    }
    restoredIdentityKey = identityKey;
    switchSyncContext({ token, storage, readOnly });
    logPreferences('restoreWebsitePreferences:applied', { whoCalledMe, appliedCount: entries.length });
    return { ...result, appliedCount: entries.length };
  }

  // Confirmed (not just assumed) there's nothing saved for this identity yet
  restoredIdentityKey = identityKey;
  switchSyncContext({ token, storage, readOnly });

  if (!skipInitialBackup) {
    persistNow({ token, storage, readOnly, whoCalledMe: `${whoCalledMe}:initialBackup` });
  }

  return { ...result, appliedCount: 0 };
};

const WebsitePreferencesManager = {
  isApplyingWebsitePreferences,
  switchSyncContext,
  scheduleWebsitePreferencesBackup,
  saveWebsitePreferencesNow,
  restoreWebsitePreferences
};

export default WebsitePreferencesManager;
