const WEBSITE_PREFERENCES_SCHEMA_VERSION = 1;
const MAX_PREFERENCE_VALUE_BYTES = 64 * 1024;

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

export const isWebsitePreferenceStorageKey = (key) => (
  EXACT_PREFERENCE_KEYS.has(key) ||
  PREFERENCE_KEY_PREFIXES.some(prefix => key?.startsWith(prefix))
);

const getValueByteSize = (value) => {
  try {
    return new Blob([value || '']).size;
  } catch (error) {
    return (value || '').length;
  }
};

// entries: [{ key, value }] — the caller reads these from whichever storage
// (localStorage/sessionStorage) is relevant; this function only decides which
// of them belong in a backup payload.
export const buildWebsitePreferencesBackup = (entries = []) => {
  const storageEntries = entries
    .filter(entry => (
      isWebsitePreferenceStorageKey(entry?.key) &&
      entry?.value !== null &&
      entry?.value !== undefined &&
      getValueByteSize(entry.value) <= MAX_PREFERENCE_VALUE_BYTES
    ))
    .map(({ key, value }) => ({ key, value }))
    .sort((a, b) => a.key.localeCompare(b.key));

  return {
    schemaVersion: WEBSITE_PREFERENCES_SCHEMA_VERSION,
    preferences: {
      storage: storageEntries
    }
  };
};

export const normalizePreferenceEntries = (backup = {}) => {
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

// Which entries from a fetched backup are actually safe to write back —
// pure filtering only; the caller performs the actual storage.setItem calls.
export const selectApplicableEntries = (backup = {}) => (
  normalizePreferenceEntries(backup)
    .filter(entry => isWebsitePreferenceStorageKey(entry?.key) && typeof entry?.value === 'string')
);

const WebsitePreferences = {
  isWebsitePreferenceStorageKey,
  buildWebsitePreferencesBackup,
  normalizePreferenceEntries,
  selectApplicableEntries
};

export default WebsitePreferences;
