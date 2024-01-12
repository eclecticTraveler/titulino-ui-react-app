const setLocalStorageObject = async(objectToStore, localStorageKey) => {
  localStorage.setItem(localStorageKey, JSON.stringify(objectToStore));
}

const getLocalStorageObject = async(localStorageKey) => {
  const retrievedObjected = localStorage.getItem(localStorageKey);
  const transformedObj = JSON.parse(retrievedObjected);
  return transformedObj
}

const getRandomObject = async(objectsArray, storageKey, isToRetrieveByNewDate) => {

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

export const getLandingPicture = async(pictureObjectArray, isToRetrieveByNewDate) => {
    const pictureObject = await getRandomObject(pictureObjectArray, "LandingPictureOfTheDay", isToRetrieveByNewDate);
    return pictureObject;
}

const LocalStorageService = {
  setUserConfiguration,
  getUserSelectedNativeLanguage,
  getUserSelectedCourse,
  setUserSelectedCourse,
  setUserSelectedNativeLanguage,
  getLandingPicture
};

export default LocalStorageService;