import CryptoJS from "crypto-js";
const SECRET_KEY = process.env.REACT_APP_STORAGE_KEY;

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
  localStorage.setItem(localStorageKey, JSON.stringify(objectToStore));
}

const getLocalStorageObject = async(localStorageKey) => {
  const retrievedObjected = localStorage.getItem(localStorageKey);
  const transformedObj = JSON.parse(retrievedObjected);
  return transformedObj
}


const setLocalStorageObjectWithExpiry = async (objectToStore, localStorageKey, ttlMinutes = 30) => {
  const now = new Date();
  const ttlMilliseconds = ttlMinutes * 60 * 1000; // Convert minutes to milliseconds

  const item = {
    value: objectToStore,
    expiry: now.getTime() + ttlMilliseconds, // Set expiry timestamp
  };

  localStorage.setItem(localStorageKey, JSON.stringify(item));
};

const getLocalStorageObjectWithExpiry = async (localStorageKey) => {
  const itemStr = localStorage.getItem(localStorageKey);

  if (!itemStr) {
    return null; // If the item doesn't exist, return null
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    // If the item has expired, remove it and return null
    localStorage.removeItem(localStorageKey);
    return null;
  }

  return item.value; // Return the stored value if it's not expired
};


const getRandomObjectFromArray = async(objectsArray, storageKey, isToRetrieveByNewDate) => {

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
  const formedKey = `${today}-${localStorageKey}`

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

export const getUserSelectedNativeLanguage = async() => {
  const transformedObj = await getLocalStorageObject("UserNativeLanguage");
  return transformedObj
}

export const setUserSelectedNativeLanguage = async(nativeLanguage) => {
  setLocalStorageObject(nativeLanguage, "UserNativeLanguage");
}

export const getUserSelectedCourse = async() => {
  const transformedObj = await getLocalStorageObject("SelectedCourse");
  return transformedObj
}

export const setUserSelectedCourse = async(courseToLearn) => {
  setLocalStorageObject(courseToLearn, "SelectedCourse");
}

export const setUserConfiguration = async(nativeLanguage, courseToLearn) => {
  setLocalStorageObject(nativeLanguage, "UserNativeLanguage");
  setLocalStorageObject(courseToLearn, "SelectedCourse");
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

const LocalStorageService = {
  setUserConfiguration,
  getUserSelectedNativeLanguage,
  getUserSelectedCourse,
  setUserSelectedCourse,
  setUserSelectedNativeLanguage,
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
