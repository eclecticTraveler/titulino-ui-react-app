import { env } from '../configs/EnvironmentConfig';
import SupabaseConfig from '../configs/SupabaseConfig';
import courseProgressData from '../assets/data/course-progress-data.json';
import CentralCourseThemeService from 'services/CentralCourseThemeService';


let _results = [];

// Helper function to create the headers
const getHeaders = () => {
  const myHeaders = new Headers();
  myHeaders.append("apiKey", SupabaseConfig.supabaseAnonApiKey);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept-Profile", "TitulinoApi_v1");
  myHeaders.append("Content-Profile", "TitulinoApi_v1");
  
  return myHeaders;
};

const loadCourseProgressStructure = async() => {
  const rawData = courseProgressData;
  return rawData;
}

const loadRequestedCourseStructure = async(nativeLanguage, course, courseCodeId) => {  
  const rawCourseStructureData = await loadCourseProgressStructure();
  const rawCourseData = rawCourseStructureData?.find(c => (c.courseId === courseCodeId && c.course === course && c.nativeLanguage === nativeLanguage));
  const rawRequestedModule = rawCourseData; //rawCourseData?.chapters.find(ch => ch.chapter === parseInt(chapterNo, 10));
  return rawRequestedModule;
}

export const getCountries = async (whoCalledMe) => {      

  if (whoCalledMe) {

    const requestOptions = {
      method: "GET",
      headers: getHeaders(),
      redirect: "follow"
    };

    const countriesUrl = `${SupabaseConfig.baseApiUrl}/GetCountries`;

    try {
      const response = await fetch(countriesUrl, requestOptions);
      const apiResult = await response.json();
      return apiResult?.length > 0 ? apiResult : _results;
      
    } catch (error) {
      console.log(`Error Retrieving API payload in getCountries: from ${whoCalledMe}`);
      console.error(error);
      return _results; // Might be better to return a handled response
    }
  }

  return _results;
};

export const getCountryDivisionByCountryId = async (countryId, whoCalledMe) => {      

  if (countryId) {
  
    const requestOptions = {
      method: "GET",
      headers: getHeaders(),
      redirect: "follow"
    };
  
      // Base URL
      let countryDivisionUrl = `${SupabaseConfig.baseApiUrl}/GetCountryDivisionByCountryId`;

      // Conditionally append countryId as a query parameter
      if (countryId) {
        countryDivisionUrl += `?p_country_id=${encodeURIComponent(countryId)}`;
      }

    try {
      const response = await fetch(countryDivisionUrl, requestOptions);
      const apiResult = await response.json();
      return apiResult?.length > 0 ? apiResult : _results;
    } catch (error) {
      console.log(`Error Retrieving API payload in getCountryDivisionByCountryId: from ${whoCalledMe}`);
      console.error(error);
      return _results; // Might be better to return a handled response
    }
  }

  return _results;
};

export const getAvailableCourses = async (currentDateTime, whoCalledMe) => {      

    if (whoCalledMe) {
    
      const requestOptions = {
        method: "GET",
        headers: getHeaders(),
        redirect: "follow"
      };
    
          // Base URL
          let currentAvailableCoursesUrl = `${SupabaseConfig.baseApiUrl}/GetAvailableCourses`;

          // Conditionally append currentDateTime as a query parameter
          if (currentDateTime) {
            currentAvailableCoursesUrl += `?currentDateTime=${encodeURIComponent(currentDateTime)}`;
          }

      try {
        const response = await fetch(currentAvailableCoursesUrl, requestOptions);
        const apiResult = await response.json();
        return apiResult?.length > 0 ? apiResult : _results;
      } catch (error) {
        console.log(`Error Retrieving API payload in getAvailableCourses: from ${whoCalledMe}`);
        console.error(error);
        return _results; // Might be better to return a handled response
      }
    }
  
    return _results;
};

export const getSelfDeterminedLanguageLevelCriteria = async (whoCalledMe) => {      

  if (whoCalledMe) {

    const requestOptions = {
      method: "GET",
      headers: getHeaders(),
      redirect: "follow"
    };
  
        // Base URL
    const selfDeterminedLanguageLevelCriteriaUrl = `${SupabaseConfig.baseApiUrl}/GetSelfDeterminedLanguageLevelCriteria`;

    try {
      const response = await fetch(selfDeterminedLanguageLevelCriteriaUrl, requestOptions);
      const apiResult = await response.json();
      return apiResult?.length > 0 ? apiResult : _results;
    } catch (error) {
      console.log(`Error Retrieving API payload in getSelfDeterminedLanguageLevelCriteria: from ${whoCalledMe}`);
      console.error(error);
      return _results; // Might be better to return a handled response
    }
  }

  return _results;
};

export const upsertUnauthenticatedUserCourseProgress = async (email, progressRecords, whoCalledMe) => {

  if(email && progressRecords?.length > 0){
    const recordsToSubmit = [...progressRecords];
     // Base URL
     const courseProgressUrl = `${SupabaseConfig.baseApiUrl}/UpsertUnauthenticatedCourseProgressType`;

     const raw = JSON.stringify({
       "progress_records": recordsToSubmit
     })

     const requestOptions = {
      method: "POST",
      headers: getHeaders(),
      body: raw,
      redirect: "follow"
    };

    try {
      const response = await fetch(courseProgressUrl, requestOptions);
      const apiResult = await response.json();
      return apiResult?.length > 0 ? apiResult : _results;      
    } catch (error) {
      console.log(`Error Retrieving API payload in upsertUnauthenticatedUserCourseProgress: from ${whoCalledMe}`);
      console.error(error);
      return _results;
    }

  }
}

export const getCourseProgressByEmailAndCourseCodeId = async (email, courseCodeId, courseLanguageId, whoCalledMe) => {

  if(email && courseCodeId && courseLanguageId){
    console.log("courseLanguageId", courseLanguageId)
     // Base URL
     const courseProgressByEmailUrl = `${SupabaseConfig.baseApiUrl}/GetUnauthenticatedEnrolleeCourseProgress`;

     const raw = JSON.stringify({
       "p_email": email,
       "p_course_code": courseCodeId,
       "p_language_id": courseLanguageId
     })

     const requestOptions = {
      method: "POST",
      headers: getHeaders(),
      body: raw,
      redirect: "follow"
    };

    try {
      const response = await fetch(courseProgressByEmailUrl, requestOptions);
      const apiResult = await response.json();
      return apiResult?.length > 0 ? apiResult : _results;      
    } catch (error) {
      console.log(`Error Retrieving API payload in getCourseProgressByEmailAndCourseCodeId: from ${whoCalledMe}`);
      console.error(error);
      return _results;
    }

  }
}

export const getQuickEnrolleeCountryDivisionInfo = async (email, year, whoCalledMe) => {      

  if (email && year > 0) {
 
    // Base URL
    const enrolledContactInfoByYearUrl = `${SupabaseConfig.baseApiUrl}/GetEnrolledContactCountryInfoByYear`;

    const raw = JSON.stringify({
      "email": email,
      "dobyear": year
    });
    
    const requestOptions = {
      method: "POST",
      headers: getHeaders(),
      body: raw,
      redirect: "follow"
    };

    // const temp = [
    //   {
    //     "sex": "M",
    //     "email": "largo1019@gmail.com",
    //     "countryOfBirthId": "MX",
    //     "countryOfBirthName": "Mexico",
    //     "countryOfBirthAlpha3": "MEX",
    //     "countryOfResidencyId": "MX",
    //     "countryDivisionIdBirth": null,
    //     "countryOfResidencyName": "Mexico",
    //     "countryDivisionBirthName": null,
    //     "countryOfBirthNativeName": "México",
    //     "countryOfResidencyAlpha3": "MEX",
    //     "personalCommunicationName": "Christian Alberto",
    //     "countryDivisionIdResidency": null,
    //     "countryDivisionResidencyName": null,
    //     "countryOfResidencyNativeName": "México"
    //   }
    // ]


    try {
      const response = await fetch(enrolledContactInfoByYearUrl, requestOptions);
      const apiResult = await response.json();
      return apiResult?.length > 0 ? apiResult[0] : _results;      
    } catch (error) {
      console.log(`Error Retrieving API payload in getQuickEnrolleeInfo: from ${whoCalledMe}`);
      console.error(error);
      return _results; // Might be better to return a handled response
    }
  }

  return _results;
};
  
export const getCourseProgressStructure = async(nativeLanguage, course, courseCodeId) => {
  const structure = await loadRequestedCourseStructure(nativeLanguage, course, courseCodeId);
  return structure ?? [];
}

const TitulinoRestService = {
  getCountries,
  getAvailableCourses,
  getSelfDeterminedLanguageLevelCriteria,
  getCountryDivisionByCountryId,
  getQuickEnrolleeCountryDivisionInfo,
  getCourseProgressStructure,
  getCourseProgressByEmailAndCourseCodeId,
  upsertUnauthenticatedUserCourseProgress
};

export default TitulinoRestService;
