import WebsitePreferencesManager from '../WebsitePreferencesManager';
import TitulinoLrnNetService from 'services/Lrn/TitulinoLrnNetService';

jest.mock('services/Lrn/TitulinoLrnNetService', () => ({
  getWebsitePreferences: jest.fn(),
  putWebsitePreferences: jest.fn()
}));

const makeStorage = () => {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, v),
    removeItem: (k) => data.delete(k),
    key: (i) => Array.from(data.keys())[i],
    get length() { return data.size; }
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('debounced save flushes against the OLD context when the sync context switches mid-debounce', async () => {
  TitulinoLrnNetService.putWebsitePreferences.mockResolvedValue({ success: true });
  TitulinoLrnNetService.getWebsitePreferences.mockResolvedValue({ success: true, exists: false });

  const adminStorage = makeStorage();
  adminStorage.setItem('selectedCurrentTheme', 'dark');

  const impersonatedStorage = makeStorage();

  await WebsitePreferencesManager.restoreWebsitePreferences({
    token: 'admin-token',
    storage: adminStorage,
    identityKey: 'admin:normal',
    skipInitialBackup: true
  });

  // Admin edits a preference — schedules a debounced save under the admin context
  WebsitePreferencesManager.scheduleWebsitePreferencesBackup('selectedCurrentTheme');

  // Before the debounce fires, admin starts impersonating — restore switches context
  await WebsitePreferencesManager.restoreWebsitePreferences({
    token: 'impersonated-token',
    storage: impersonatedStorage,
    identityKey: 'contact-123:impersonating',
    skipInitialBackup: true
  });

  // The pending admin save must have been flushed synchronously against the
  // admin's own token/storage BEFORE the switch, not silently dropped or
  // redirected to the impersonated context.
  const putCalls = TitulinoLrnNetService.putWebsitePreferences.mock.calls;
  const adminFlushCall = putCalls.find(([token]) => token === 'admin-token');
  expect(adminFlushCall).toBeDefined();
  expect(adminFlushCall[1].preferences.storage).toEqual([
    { key: 'selectedCurrentTheme', value: 'dark' }
  ]);

  // No stray call attributed the admin's edit to the impersonated token
  const impersonatedCallWithAdminData = putCalls.find(([token]) => token === 'impersonated-token');
  expect(impersonatedCallWithAdminData).toBeUndefined();
});

test('restore retries once on a transient fetch failure before giving up', async () => {
  TitulinoLrnNetService.getWebsitePreferences
    .mockResolvedValueOnce({ success: false, status: 500 })
    .mockResolvedValueOnce({ success: true, exists: true, preferences: { storage: [{ key: 'UserBaseLanguage', value: 'es' }] } });

  const storage = makeStorage();
  const result = await WebsitePreferencesManager.restoreWebsitePreferences({
    token: 'token-1',
    storage,
    identityKey: 'user-1:normal'
  });

  expect(TitulinoLrnNetService.getWebsitePreferences).toHaveBeenCalledTimes(2);
  expect(result.appliedCount).toBe(1);
  expect(storage.getItem('UserBaseLanguage')).toBe('es');
});

test('restore is skipped for the same identity unless forced, but still re-arms the sync target', async () => {
  TitulinoLrnNetService.getWebsitePreferences.mockResolvedValue({ success: true, exists: false });
  TitulinoLrnNetService.putWebsitePreferences.mockResolvedValue({ success: true });

  const storage = makeStorage();
  storage.setItem('selectedCurrentTheme', 'light');

  await WebsitePreferencesManager.restoreWebsitePreferences({
    token: 'token-a',
    storage,
    identityKey: 'user-2:normal',
    skipInitialBackup: true
  });

  // Same identity, new token (e.g. our token-expiry reset + resubmission) —
  // should NOT re-fetch (would clobber local edits), but MUST re-arm so a
  // later preference edit is saved under the new token, not the dead one.
  const second = await WebsitePreferencesManager.restoreWebsitePreferences({
    token: 'token-b',
    storage,
    identityKey: 'user-2:normal',
    skipInitialBackup: true
  });

  expect(second.skipped).toBe(true);
  expect(TitulinoLrnNetService.getWebsitePreferences).toHaveBeenCalledTimes(1);

  WebsitePreferencesManager.scheduleWebsitePreferencesBackup('selectedCurrentTheme');
  jest.advanceTimersByTime(2000);
  await Promise.resolve();
  await Promise.resolve();

  expect(TitulinoLrnNetService.putWebsitePreferences).toHaveBeenCalledWith(
    'token-b',
    expect.anything(),
    expect.anything()
  );
});
