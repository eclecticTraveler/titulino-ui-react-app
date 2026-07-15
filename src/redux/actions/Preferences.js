import WebsitePreferencesManager from "managers/WebsitePreferencesManager";
import { ON_SYNCING_WEBSITE_PREFERENCES } from '../constants/Preferences';

export const onSyncingWebsitePreferences = async ({
  token,
  storage,
  readOnly,
  identityKey,
  force,
  skipInitialBackup,
  whoCalledMe
} = {}) => {
  const result = await WebsitePreferencesManager.restoreWebsitePreferences({
    token,
    storage,
    readOnly,
    identityKey,
    force,
    skipInitialBackup,
    whoCalledMe
  });

  return {
    type: ON_SYNCING_WEBSITE_PREFERENCES,
    result
  };
};
