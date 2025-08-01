import { env } from '../configs/EnvironmentConfig';

const titulinoNetApiUri = `${env.TITULINO_NET_API}/v1/enrollment`;
let _results = [];

// Helper function to create the headers
const getHeaders = (token) => {
  const myHeaders = new Headers();
  if(token){
    myHeaders.append("Authorization", `Bearer ${token}`);
  }
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("TITULINO-COM-API-KEY", process.env.REACT_APP_BACKEND_NET_TITULINO_API_KEY);
  
  return myHeaders;
};


export const getUserProfileByEmailAndYearOfBirth = async (emailId, dobOrYob, whoCalledMe) => {

  if (!emailId || !dobOrYob) {
    console.error("Email ID or Year of Birth is missing");
    return ""
  }

  const loginUrl = `${titulinoNetApiUri}/login`;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  
  // Decide whether it's a date or a year
  const isFullDate = /^\d{4}-\d{2}-\d{2}$/.test(dobOrYob); // e.g. "2001-04-16"
  const isYear = /^\d{4}$/.test(dobOrYob); // e.g. 2001

  const payload = {
    userName: emailId,
  };

  if (isFullDate) {
    payload.dateOfBirth = dobOrYob;
  } else if (isYear) {
    payload.yearOfBirth = parseInt(dobOrYob, 10);
  } else {
    console.warn("Invalid DOB or YOB format:", dobOrYob);
    return "";
  }

  const raw = JSON.stringify(payload);

  const requestOptions = {
    method: "POST",
    headers: getHeaders(),
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch(loginUrl, requestOptions);
    // If the API returns 404, return null early
    if (response.status === 404) {
      console.warn(`404 Not Found: ${loginUrl}`);
      return null;
    }
  
    // Optionally handle other non-success statuses
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
  
    const apiResult = await response.json();
    return apiResult;

  } catch (error) {
    console.log(`Error Retrieving API payload in getUserProfileByEmailAndYearOfBirth: from ${whoCalledMe}`);
    console.error(error);
    return null;
  }
}

export const getRegistrationToken = async (whoCalledMe, userName) => {
 
const loginUrl = `${titulinoNetApiUri}/auth`;
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
const raw = JSON.stringify({
  "userName": process.env.REACT_APP_BACKEND_NET_SERVICE_USERNAME
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
  if (recordsToSubmit?.length > 0 && token) {
    // Base URL
    const upsertEnrolleeUrl = `${titulinoNetApiUri}/enrollees`;

    const raw = JSON.stringify(
      recordsToSubmit,
    );

    const requestOptions = {
      method: "POST",
      headers: getHeaders(token),
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(upsertEnrolleeUrl, requestOptions);

      // Check if the response is successful and has valid JSON
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      // Check if the response body is not empty
      const text = await response.text();
      if (!text) {
        throw new Error("Received empty response");
      }

      // Attempt to parse JSON only if the response is not empty
      const apiResult = JSON.parse(text);
      return apiResult ? apiResult : _results;
    } catch (error) {
      console.log(`Error Retrieving API payload in upsertEnrollment: from ${whoCalledMe}`);
      console.error(error);
      return _results;
    }
  }
  return "ERROR no valid Token or Array Empty";
};



const TitulinoNetService = {
  getRegistrationToken,
  upsertEnrollment,
  getUserProfileByEmailAndYearOfBirth
};

export default TitulinoNetService;
