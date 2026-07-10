import CryptoJS from "crypto-js";
import { env } from 'configs/EnvironmentConfig';
import ImpersonationSession from "lob/ImpersonationSession";
import WebsitePreferences from "lob/WebsitePreferences";
// Narrow, deliberate exception to the usual Service -> Manager direction:
// WebsitePreferencesManager owns the debounce/apply-guard state this needs,
// and threading it through Redux for every single preference-key write would
// be a much larger change than this cross-cutting hook warrants.
import WebsitePreferencesManager from "managers/WebsitePreferencesManager";
const SECRET_KEY = process.env.REACT_APP_STORAGE_KEY;

const STORAGE_SCHEMA_VERSION = '3';

/**
 * Run once per client after deploy. Clears stale keys from the
 * old naming convention so the app boots cleanly.
 */
export const migrateLocalStorageIfNeeded = () => {
  const current = localStorage.getItem('storageSchemaVersion');
  if (current === STORAGE_SCHEMA_VERSION) return;

  const staleKeys = [
    'UserNativeLanguage',
    'SelectedCourse',
    'UserCourseConfiguration',
    'selectedTheme'
  ];
  staleKeys.forEach(k => localStorage.removeItem(k));

  localStorage.setItem('storageSchemaVersion', STORAGE_SCHEMA_VERSION);
};

const getPreferenceAwareStorage = (key) => (
  WebsitePreferences.isWebsitePreferenceStorageKey(key) &&
  ImpersonationSession.hasActiveImpersonationProfile()
    ? sessionStorage
    : localStorage
);

const schedulePreferenceBackup = (key) => {
  if (
    WebsitePreferences.isWebsitePreferenceStorageKey(key) &&
    !WebsitePreferencesManager.isApplyingWebsitePreferences()
  ) {
    WebsitePreferencesManager.scheduleWebsitePreferencesBackup(key);
  }
};

export const storeEncryptedObject = (key, value) => {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), SECRET_KEY).toString();
  localStorage.setItem(key, encrypted);
};

export const retrieveEncryptedObject = (key) => {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (err) {
    console.error("Error decrypting token:", err);
    return null;
  }
};

export const storeEncryptedObjectWithExpiry = (key, value, ttlMinutes = 60) => {
  const expiry = Date.now() + ttlMinutes * 60 * 1000;
  storeEncryptedObject(key, { value, expiry });
};

export const retrieveEncryptedObjectWithExpiry = (key) => {
  const item = retrieveEncryptedObject(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
};


const setLocalStorageObject = async(objectToStore, localStorageKey) => {
  getPreferenceAwareStorage(localStorageKey).setItem(localStorageKey, JSON.stringify(objectToStore));
  schedulePreferenceBackup(localStorageKey);
}

const getLocalStorageObject = async(localStorageKey) => {
  const retrievedObjected = getPreferenceAwareStorage(localStorageKey).getItem(localStorageKey);
  if (retrievedObjected === null || retrievedObjected === undefined || retrievedObjected === 'undefined') {
    return null;
  }
  const transformedObj = JSON.parse(retrievedObjected);
  return transformedObj
}


const setStorageObjectWithExpiry = async (objectToStore, localStorageKey, ttlMinutes = 30, storage = localStorage) => {
  const now = new Date();
  const ttlMilliseconds = ttlMinutes * 60 * 1000; // Convert minutes to milliseconds

  const item = {
    value: objectToStore,
    expiry: now.getTime() + ttlMilliseconds, // Set expiry timestamp
  };

  storage.setItem(localStorageKey, JSON.stringify(item));
  schedulePreferenceBackup(localStorageKey);
};

const setLocalStorageObjectWithExpiry = async (objectToStore, localStorageKey, ttlMinutes = 30) => (
  setStorageObjectWithExpiry(
    objectToStore,
    localStorageKey,
    ttlMinutes,
    getPreferenceAwareStorage(localStorageKey)
  )
);

const getStorageObjectWithExpiry = async (localStorageKey, storage = localStorage) => {
  const itemStr = storage.getItem(localStorageKey);

  if (!itemStr) {
    return null; // If the item doesn't exist, return null
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    // If the item has expired, remove it and return null
    storage.removeItem(localStorageKey);
    return null;
  }

  return item.value; // Return the stored value if it's not expired
};

const getLocalStorageObjectWithExpiry = async (localStorageKey) => (
  getStorageObjectWithExpiry(localStorageKey, getPreferenceAwareStorage(localStorageKey))
);

const getRandomObjectFromArray = async(objectsArray, storageKey, isToRetrieveByNewDate) => { // eslint-disable-line no-unused-vars

  const localStorageKey = storageKey;  
  const localStorageDateKey = 'RandomObjectSavedDate';
  const randomObject = objectsArray[Math.floor(Math.random() * objectsArray.length)];

  if(isToRetrieveByNewDate){
  const today = new Date().toDateString();

  const existingLocalStorageObject = await getLocalStorageObject(localStorageKey);
  const existingDateLocalStorage = await getLocalStorageObject(localStorageDateKey);

  if ((existingLocalStorageObject && existingDateLocalStorage) && existingDateLocalStorage === today) {
    return existingLocalStorageObject;
  }
  setLocalStorageObject(randomObject, localStorageKey);
  setLocalStorageObject(today, localStorageDateKey)
  return randomObject;

  }

  return randomObject;
}

const processRandomObject = async(randomObject, storageKey, isToRetrieveByNewDate) => {

  const localStorageKey = storageKey;  
  const localStorageDateKey = 'RandomObjectSavedDate';

  if(isToRetrieveByNewDate){
  const today = new Date().toDateString();
  const formedKey = `${today}-${localStorageKey}` // eslint-disable-line no-unused-vars

  const existingLocalStorageObject = await getLocalStorageObject(localStorageKey);
  const existingDateLocalStorage = await getLocalStorageObject(`${localStorageDateKey}-${localStorageKey}`);

  if ((existingLocalStorageObject && existingDateLocalStorage) && existingDateLocalStorage === today) {
    return existingLocalStorageObject;
  }
  setLocalStorageObject(randomObject, localStorageKey);
  setLocalStorageObject(today, `${localStorageDateKey}-${localStorageKey}`)
  return randomObject;

  }

  return randomObject;
}

export const getEnrolleesByCourse = async(key) => {
  const transformedObj = await getLocalStorageObjectWithExpiry(key);
  return transformedObj
}

export const setEnrolleesByCourse = async(enrolleesByCourse, key, ttl) => {
  setLocalStorageObjectWithExpiry(enrolleesByCourse, key, ttl);
}

export const getChapterClassData = async(key) => {
  const transformedObj = await getLocalStorageObjectWithExpiry(key);
  return transformedObj
}

export const setChapterClassData = async(chapterClassData, key, ttl) => {
  setLocalStorageObjectWithExpiry(chapterClassData, key, ttl);
}

export const getUserBaseLanguage = async() => {
  // Backward-compat: try new key first, fall back to old key
  let obj = await getLocalStorageObject("UserBaseLanguage");
  if (!obj) {
    obj = await getLocalStorageObject("UserNativeLanguage");
    if (obj) setLocalStorageObject(obj, "UserBaseLanguage"); // migrate
  }
  return obj;
}

export const setUserBaseLanguage = async(baseLanguage) => {
  setLocalStorageObject(baseLanguage, "UserBaseLanguage");
}

export const getSelectedContentLanguage = async() => {
  // Backward-compat: try new key first, fall back to old key
  let obj = await getLocalStorageObject("SelectedContentLanguage");
  if (!obj) {
    obj = await getLocalStorageObject("SelectedCourse");
    if (obj) setLocalStorageObject(obj, "SelectedContentLanguage"); // migrate
  }
  return obj;
}

export const setSelectedContentLanguage = async(contentLanguage) => {
  setLocalStorageObject(contentLanguage, "SelectedContentLanguage");
}

export const setUserLanguageConfiguration = async(baseLanguage, contentLanguage) => {
  setLocalStorageObject(baseLanguage, "UserBaseLanguage");
  setLocalStorageObject(contentLanguage, "SelectedContentLanguage");
}

export const processLandingPicture = async(pictureObj, isToRetrieveByNewDate) => {
  const pictureObject = await processRandomObject(pictureObj, "LandingPictureOfTheDay", isToRetrieveByNewDate);
  return pictureObject;
}

export const setCurrentThemeConfiguration = async(currentTheme) => {
  setLocalStorageObject(currentTheme, "selectedCurrentTheme");
}

export const getCurrentThemeConfiguration = async() => {
  const transformedObj = await getLocalStorageObject("selectedCurrentTheme");
  return transformedObj
}

export const setCurrentSubnavigationConfiguration = async(currentTheme) => {
  setLocalStorageObject(currentTheme, "selectedSubnavigationPosition");
}

export const getCurrentSubnavigationConfiguration = async() => {
  const transformedObj = await getLocalStorageObject("selectedSubnavigationPosition");
  return transformedObj
}

export const setIsCurrentNavCollapsed = async(isNavCollapsed) => {
  setLocalStorageObject(isNavCollapsed, "selectedNavigationCollapse");
}

export const getIsCurrentNavCollapsed = async() => {
  const transformedObj = await getLocalStorageObject("selectedNavigationCollapse");
  return transformedObj
}

export const setOnLocale = async(locale) => {
  setLocalStorageObject(locale, "selectedLocale");
}

export const getOnLocale = async() => {
  const transformedObj = await getLocalStorageObject("selectedLocale");
  return transformedObj
}

export const getCachedObject = (key) => {
  if (WebsitePreferences.isWebsitePreferenceStorageKey(key)) {
    return getLocalStorageObjectWithExpiry(key);
  }

  return env.ENVIROMENT === "local"
    ? getLocalStorageObjectWithExpiry(key)
    : retrieveEncryptedObjectWithExpiry(key);
};

export const setCachedObject = (key, value, ttlInMinutes) => {
  if (WebsitePreferences.isWebsitePreferenceStorageKey(key)) {
    return setLocalStorageObjectWithExpiry(value, key, ttlInMinutes);
  }

  return env.ENVIROMENT === "local"
    ? setLocalStorageObjectWithExpiry(value, key, ttlInMinutes)
    : storeEncryptedObjectWithExpiry(key, value, ttlInMinutes);
};

export const removeCachedObject = (key) => {
  getPreferenceAwareStorage(key).removeItem(key);
};

const LocalStorageService = {
  getCachedObject,
  setCachedObject,
  removeCachedObject,
  setUserLanguageConfiguration,
  getUserBaseLanguage,
  getSelectedContentLanguage,
  setSelectedContentLanguage,
  setUserBaseLanguage,
  processLandingPicture,
  setCurrentThemeConfiguration,
  getCurrentThemeConfiguration,
  setCurrentSubnavigationConfiguration,
  getCurrentSubnavigationConfiguration,
  setIsCurrentNavCollapsed,
  getIsCurrentNavCollapsed,
  setOnLocale,
  getOnLocale,
  getEnrolleesByCourse,
  setEnrolleesByCourse,
  getChapterClassData,
  setChapterClassData,
  getLocalStorageObjectWithExpiry,
  setLocalStorageObjectWithExpiry,
  storeEncryptedObject,
  retrieveEncryptedObject,
  storeEncryptedObjectWithExpiry,
  retrieveEncryptedObjectWithExpiry
  
};

export default LocalStorageService;
