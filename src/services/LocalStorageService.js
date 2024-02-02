 
const setLocalStorageObject = async(objectToStore, localStorageKey) => {
  localStorage.setItem(localStorageKey, JSON.stringify(objectToStore));
}

const getLocalStorageObject = async(localStorageKey) => {
  const retrievedObjected = localStorage.getItem(localStorageKey);
  const transformedObj = JSON.parse(retrievedObjected);
  return transformedObj
}

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
  getOnLocale
};

export default LocalStorageService;
