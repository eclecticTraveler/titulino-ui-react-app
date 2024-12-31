import { env } from '../configs/EnvironmentConfig';

const titulinoNetApiUri = `${env.TITULINO_NET_API}/v1/enrollment`;
let _results = [];

// Helper function to create the headers
const getHeaders = (token) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", "application/json");
  
  return myHeaders;
};

export const getRegistrationToken = async (whoCalledMe, userName) => {
 
const loginUrl = `${titulinoNetApiUri}/login`;
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  "userName": "titulinoUiSystem"
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

  try {
    const response = await fetch(loginUrl, requestOptions);
    const apiResult = await response.json();
    return apiResult?.token ?? "";      
  } catch (error) {
    console.log(`Error Retrieving API payload in getRegistrationToken: from ${whoCalledMe}`);
    console.error(error);
    return "";
  }
}

export const upsertEnrollment = async (token, enrolle, whoCalledMe) => {
  const recordsToSubmit = enrolle ? [...enrolle] : [];
  if(recordsToSubmit?.length > 0 && token){
    
     // Base URL
     const upsertEnrolleeUrl = `${titulinoNetApiUri}/enrollees`;

     const raw = JSON.stringify({
       recordsToSubmit
     })

     const requestOptions = {
      method: "POST",
      headers: getHeaders(token),
      body: raw,
      redirect: "follow"
    };

    try {
      const response = await fetch(upsertEnrolleeUrl, requestOptions);
      const apiResult = await response.json();
      return apiResult?.length > 0 ? apiResult : _results;      
    } catch (error) {
      console.log(`Error Retrieving API payload in upsertEnrollment: from ${whoCalledMe}`);
      console.error(error);
      return _results;
    }

  }
  return "ERROR no valid Token or Array Empty"
}


const TitulinoNetService = {
  getRegistrationToken,
  upsertEnrollment
};

export default TitulinoNetService;
