 
export const getUserSelectedNativeLanguage = async() => {
  const lang = localStorage.getItem("UserNativeLanguage"); 
  const transformedObj = JSON.parse(lang);
  return transformedObj
}

export const setUserSelectedNativeLanguage = async(nativeLanguage) => {
  const lang = JSON.stringify(nativeLanguage);
  localStorage.setItem("UserNativeLanguage", lang);
}

export const getUserSelectedCourse = async() => {
  const course = localStorage.getItem("SelectedCourse");
  const transformedObj = JSON.parse(course);
  return transformedObj
}

export const setUserSelectedCourse = async(courseToLearn) => {
  const convertedObjectString = JSON.stringify(courseToLearn);
  localStorage.setItem("SelectedCourse", convertedObjectString);
}

export const setUserConfiguration = async(nativeLanguage, courseToLearn) => {
  localStorage.setItem("UserNativeLanguage", nativeLanguage);
  localStorage.setItem("SelectedCourse", courseToLearn);
}


const LocalStorageService = {
  setUserConfiguration,
  getUserSelectedNativeLanguage,
  getUserSelectedCourse,
  setUserSelectedCourse,
  setUserSelectedNativeLanguage
};

export default LocalStorageService;
