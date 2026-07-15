import WebsitePreferences from '../WebsitePreferences';

const {
  isWebsitePreferenceStorageKey,
  buildWebsitePreferencesBackup,
  normalizePreferenceEntries,
  selectApplicableEntries
} = WebsitePreferences;

describe('isWebsitePreferenceStorageKey', () => {
  it('matches exact known preference keys', () => {
    expect(isWebsitePreferenceStorageKey('UserBaseLanguage')).toBe(true);
    expect(isWebsitePreferenceStorageKey('selectedCurrentTheme')).toBe(true);
  });

  it('matches prefixed dashboard card order keys', () => {
    expect(isWebsitePreferenceStorageKey('DashboardCardOrder_123')).toBe(true);
    expect(isWebsitePreferenceStorageKey('FacilitadorOverviewCardOrder_abc')).toBe(true);
  });

  it('rejects unrelated keys', () => {
    expect(isWebsitePreferenceStorageKey('UserProfile_test@example.com')).toBe(false);
    expect(isWebsitePreferenceStorageKey('auth_inner_token')).toBe(false);
  });

  it('handles null/undefined without throwing', () => {
    expect(isWebsitePreferenceStorageKey(null)).toBe(false);
    expect(isWebsitePreferenceStorageKey(undefined)).toBe(false);
  });
});

describe('buildWebsitePreferencesBackup', () => {
  it('keeps only preference-key entries, sorted by key', () => {
    const result = buildWebsitePreferencesBackup([
      { key: 'selectedCurrentTheme', value: 'dark' },
      { key: 'UserBaseLanguage', value: 'es' },
      { key: 'UserProfile_test@example.com', value: '{"a":1}' }
    ]);

    // localeCompare, not plain ASCII — sorts case-insensitively ('s' before 'U')
    expect(result.preferences.storage).toEqual([
      { key: 'selectedCurrentTheme', value: 'dark' },
      { key: 'UserBaseLanguage', value: 'es' }
    ]);
  });

  it('drops entries with null/undefined values', () => {
    const result = buildWebsitePreferencesBackup([
      { key: 'UserBaseLanguage', value: null },
      { key: 'selectedCurrentTheme', value: undefined }
    ]);

    expect(result.preferences.storage).toEqual([]);
  });

  it('drops oversized entries', () => {
    const hugeValue = 'x'.repeat(70 * 1024);
    const result = buildWebsitePreferencesBackup([
      { key: 'UserBaseLanguage', value: hugeValue }
    ]);

    expect(result.preferences.storage).toEqual([]);
  });

  it('returns an empty, well-shaped payload for no entries', () => {
    expect(buildWebsitePreferencesBackup([])).toEqual({
      schemaVersion: 1,
      preferences: { storage: [] }
    });
  });
});

describe('normalizePreferenceEntries', () => {
  it('reads from preferences.storage array shape', () => {
    const entries = normalizePreferenceEntries({
      preferences: { storage: [{ key: 'UserBaseLanguage', value: 'es' }] }
    });
    expect(entries).toEqual([{ key: 'UserBaseLanguage', value: 'es' }]);
  });

  it('reads from a bare storage array shape', () => {
    const entries = normalizePreferenceEntries({
      storage: [{ key: 'UserBaseLanguage', value: 'es' }]
    });
    expect(entries).toEqual([{ key: 'UserBaseLanguage', value: 'es' }]);
  });

  it('reads from a flat preferences object shape, stringifying non-string values', () => {
    const entries = normalizePreferenceEntries({
      preferences: { UserBaseLanguage: 'es', selectedNavigationCollapse: true }
    });
    expect(entries).toEqual(expect.arrayContaining([
      { key: 'UserBaseLanguage', value: 'es' },
      { key: 'selectedNavigationCollapse', value: 'true' }
    ]));
  });

  it('returns an empty array for an unrecognized shape', () => {
    expect(normalizePreferenceEntries({})).toEqual([]);
    expect(normalizePreferenceEntries()).toEqual([]);
  });
});

describe('selectApplicableEntries', () => {
  it('filters out non-preference keys and non-string values', () => {
    const entries = selectApplicableEntries({
      preferences: {
        storage: [
          { key: 'UserBaseLanguage', value: 'es' },
          { key: 'someRandomKey', value: 'ignored' },
          { key: 'selectedCurrentTheme', value: 42 }
        ]
      }
    });

    expect(entries).toEqual([{ key: 'UserBaseLanguage', value: 'es' }]);
  });
});
