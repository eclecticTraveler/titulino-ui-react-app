import { env } from 'configs/EnvironmentConfig';
import TitulinoLrnNetService from 'services/Lrn/TitulinoLrnNetService';

const WEBSITE_PREFERENCES_SCHEMA_VERSION = 1;
const MAX_PREFERENCE_VALUE_BYTES = 64 * 1024;
const BACKUP_DEBOUNCE_MS = 1800;

const EXACT_PREFERENCE_KEYS = new Set([
  'UserBaseLanguage',
  'SelectedContentLanguage',
  'selectedLocale',
  'selectedCurrentTheme',
  'selectedSubnavigationPosition',
  'selectedNavigationCollapse'
]);

const PREFERENCE_KEY_PREFIXES = [
  'DashboardCardOrder_',
  'FacilitadorOverviewCardOrder_'
];

let backupToken = null;
let isBackupReadOnly = false;
let backupTimer = null;
let isApplyingPreferences = false;
let backupStorage = typeof window !== 'undefined' ? window.localStorage : null;

export const isWebsitePreferenceStorageKey = (key) => (
  EXACT_PREFERENCE_KEYS.has(key) ||
  PREFERENCE_KEY_PREFIXES.some(prefix => key?.startsWith(prefix))
);

export const isApplyingWebsitePreferences = () => isApplyingPreferences;

const shouldLogPreferences = () => env.ENVIROMENT !== 'prod';

const logPreferences = (message, payload = {}) => {
  if (!shouldLogPreferences()) return;
  console.log(`[WebsitePreferences] ${message}`, payload);
};

const getStorageKeys = (storage) => (
  Array.from({ length: storage?.length || 0 }, (_, index) => storage.key(index)).filter(Boolean)
);

const getValueByteSize = (value) => {
  try {
    return new Blob([value || '']).size;
  } catch (error) {
    return (value || '').length;
  }
};

export const buildWebsitePreferencesBackup = (storage = window.localStorage) => {
  const storageEntries = getStorageKeys(storage)
    .filter(isWebsitePreferenceStorageKey)
    .map((key) => ({
      key,
      value: storage.getItem(key)
    }))
    .filter(entry => entry.value !== null && getValueByteSize(entry.value) <= MAX_PREFERENCE_VALUE_BYTES)
    .sort((a, b) => a.key.localeCompare(b.key));

  return {
    schemaVersion: WEBSITE_PREFERENCES_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    preferences: {
      storage: storageEntries
    }
  };
};

const normalizePreferenceEntries = (backup = {}) => {
  if (Array.isArray(backup?.preferences?.storage)) return backup.preferences.storage;
  if (Array.isArray(backup?.storage)) return backup.storage;
  if (backup?.preferences && typeof backup.preferences === 'object') {
    return Object.entries(backup.preferences)
      .filter(([key]) => isWebsitePreferenceStorageKey(key))
      .map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value)
      }));
  }
  return [];
};

export const applyWebsitePreferencesBackup = (
  backup = {},
  targetStorage = window.localStorage
) => {
  const entries = normalizePreferenceEntries(backup)
    .filter(entry => isWebsitePreferenceStorageKey(entry?.key) && typeof entry?.value === 'string');

  isApplyingPreferences = true;
  try {
    entries.forEach(({ key, value }) => {
      targetStorage.setItem(key, value);
    });
  } finally {
    isApplyingPreferences = false;
  }

  logPreferences('applyWebsitePreferencesBackup', {
    storage: targetStorage === window.sessionStorage ? 'sessionStorage' : 'localStorage',
    appliedCount: entries.length
  });

  return {
    appliedCount: entries.length
  };
};

export const configureWebsitePreferenceSync = ({
  token,
  readOnly = false,
  storage
} = {}) => {
  backupToken = token || null;
  isBackupReadOnly = readOnly === true;
  backupStorage = storage || backupStorage || window.localStorage;

  logPreferences('configureWebsitePreferenceSync', {
    hasToken: !!backupToken,
    readOnly: isBackupReadOnly,
    storage: backupStorage === window.sessionStorage ? 'sessionStorage' : 'localStorage'
  });
};

export const saveWebsitePreferencesNow = async ({
  token = backupToken,
  storage = backupStorage || window.localStorage,
  whoCalledMe = 'saveWebsitePreferencesNow'
} = {}) => {
  if (!token || isBackupReadOnly) {
    return { success: false, skipped: true };
  }

  const payload = buildWebsitePreferencesBackup(storage);
  if (!payload.preferences.storage.length) {
    return { success: false, skipped: true };
  }

  const result = await TitulinoLrnNetService.putWebsitePreferences(token, payload, whoCalledMe);
  logPreferences('saveWebsitePreferencesNow', {
    whoCalledMe,
    success: result?.success === true,
    count: payload.preferences.storage.length
  });
  return result;
};

export const scheduleWebsitePreferencesBackup = (triggerKey) => {
  if (
    isBackupReadOnly ||
    isApplyingPreferences ||
    !backupToken ||
    !isWebsitePreferenceStorageKey(triggerKey)
  ) {
    return;
  }

  window.clearTimeout(backupTimer);
  backupTimer = window.setTimeout(() => {
    saveWebsitePreferencesNow({ whoCalledMe: `schedule:${triggerKey}` });
  }, BACKUP_DEBOUNCE_MS);
};

export const hydrateWebsitePreferences = async ({
  token,
  targetStorage = window.localStorage,
  readOnly = false,
  whoCalledMe = 'hydrateWebsitePreferences'
} = {}) => {
  if (!token) {
    return { success: false, exists: false, appliedCount: 0 };
  }

  const result = await TitulinoLrnNetService.getWebsitePreferences(token, whoCalledMe);
  if (!result?.success || result?.exists !== true || !result?.preferences) {
    configureWebsitePreferenceSync({ token, readOnly, storage: targetStorage });
    return { ...result, appliedCount: 0 };
  }

  const applied = applyWebsitePreferencesBackup(result.preferences, targetStorage);
  configureWebsitePreferenceSync({ token, readOnly, storage: targetStorage });

  return {
    ...result,
    ...applied
  };
};

const WebsitePreferences = {
  isWebsitePreferenceStorageKey,
  isApplyingWebsitePreferences,
  buildWebsitePreferencesBackup,
  applyWebsitePreferencesBackup,
  configureWebsitePreferenceSync,
  saveWebsitePreferencesNow,
  scheduleWebsitePreferencesBackup,
  hydrateWebsitePreferences
};

export default WebsitePreferences;
