import { env } from '../configs/EnvironmentConfig';

const titulinoNetEnrollmentApiUri = `${env.TITULINO_NET_API}/v1/enrollment`;
const titulinoNetShopApiUri = `${env.TITULINO_NET_API}/v1/shop`;
const titulinoNetLrnApiUri = `${env.TITULINO_NET_API}/v1/lrn`;
let _results = [];

const logKnowMeProfileDebug = (message, payload) => {
  if (env.ENVIROMENT !== "prod") {
    console.log(`[KnowMeProfileDebug] ${message}`, payload ?? "");
  }
};

// Helper function to create the headers
const getHeaders = (token, isFormData = false) => {
  const myHeaders = new Headers();
  if (token) {
    myHeaders.append("Authorization", `Bearer ${token}`);
  }
  myHeaders.append("TITULINO-COM-API-KEY", process.env.REACT_APP_BACKEND_NET_TITULINO_API_KEY);

  if (!isFormData) {
    myHeaders.append("Content-Type", "application/json");
  }

  return myHeaders;
};



export const getUserProfileByEmailAndYearOfBirth = async (emailId, dobOrYob, whoCalledMe) => {
  logKnowMeProfileDebug("getUserProfileByEmailAndYearOfBirth:start", {
    emailId: emailId || null,
    dobOrYob: dobOrYob || null,
    whoCalledMe
  });

  if (!emailId || !dobOrYob) {
    console.error("Email ID or Year of Birth is missing");
    return ""
  }

  const loginUrl = `${titulinoNetEnrollmentApiUri}/login`;
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
    logKnowMeProfileDebug("getUserProfileByEmailAndYearOfBirth:response", {
      status: response.status,
      ok: response.ok,
      whoCalledMe
    });
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
    logKnowMeProfileDebug("getUserProfileByEmailAndYearOfBirth:success", {
      hasProfile: !!apiResult,
      contactInternalId: apiResult?.contactInternalId || null,
      hasToken: !!apiResult?.token,
      whoCalledMe
    });
    return apiResult;

  } catch (error) {
    console.log(`Error Retrieving API payload in getUserProfileByEmailAndYearOfBirth: from ${whoCalledMe}`);
    console.error(error);
    return null;
  }
}

export const getRegistrationToken = async (whoCalledMe, userName) => {
  const loginUrl = `${titulinoNetEnrollmentApiUri}/auth`;
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

export const upsertEnrollment = async (token, enrolle, whoCalledMe, recaptchaToken) => {
  const recordsToSubmit = enrolle ? [...enrolle] : [];
  if (recordsToSubmit?.length > 0 && token) {
    const upsertEnrolleeUrl = `${titulinoNetEnrollmentApiUri}/enrollees`;

    const raw = JSON.stringify(
      recordsToSubmit,
    );

    const headers = getHeaders(token);
    if (recaptchaToken) {
      headers.append("X-Recaptcha-Token", recaptchaToken);
    }

    const requestOptions = {
      method: "POST",
      headers,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(upsertEnrolleeUrl, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        if (env.ENVIROMENT !== "prod") {
          console.warn(`[${whoCalledMe}] upsertEnrollment failed with status ${response.status}`);
          console.warn(`[${whoCalledMe}] upsertEnrollment response body: ${errorText}`);
          console.warn(`[${whoCalledMe}] upsertEnrollment payload:`, recordsToSubmit);
        }
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error("Received empty response");
      }

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

export const getPurchaseSessionUrl = async (token, productId, email, name, contactPaymentId, contactInternalId, whoCalledMe) => {
  if (productId && email && token) {
    const checkoutProductUrl = `${titulinoNetShopApiUri}/checkout`;

    const raw = JSON.stringify({
      priceId: productId,
      email: email,
      name: name,
      customerPaymentId: contactPaymentId,
      contactInternalId: contactInternalId
    });

    const requestOptions = {
      method: "POST",
      headers: getHeaders(token),
      body: raw,
    };

    try {
      const response = await fetch(checkoutProductUrl, requestOptions);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const apiResult = await response.json();
      return apiResult;

    } catch (error) {
      console.log(`Error in getPurchaseSessionUrl: from ${whoCalledMe}`);
      console.error(error);
      return null;
    }
  }
  return "ERROR: Missing token, product, or email";
};

export const getUserPurchasedProducts = async (token, contactInternalId, whoCalledMe) => {
  if (contactInternalId && token) {
    const productUrl = `${titulinoNetShopApiUri}/purchase`;

    const raw = JSON.stringify({
      contactInternalId: contactInternalId,
    });

    const requestOptions = {
      method: "POST",
      headers: getHeaders(token), // must include Content-Type: application/json
      body: raw,
    };

    try {
      const response = await fetch(productUrl, requestOptions);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const apiResult = await response.json();
      return apiResult;

    } catch (error) {
      console.log(`Error in getUserPurchasedProducts: from ${whoCalledMe}`);
      console.error(error);
      return null;
    }
  }
  return "ERROR: Missing token or contactInternalId";
};
 

export const getContactEnrolleeKnowMeProfileImage = async (token, email, contactInternalId, whoCalledMe) => {
  if (contactInternalId && email && token) {
    logKnowMeProfileDebug("getContactEnrolleeKnowMeProfileImage:start", {
      email,
      contactInternalId,
      hasToken: !!token,
      whoCalledMe
    });
    const knowMeUrl = `${titulinoNetLrnApiUri}/know-me/profile`;

    const raw = JSON.stringify({
      emailId: email,
      contactInternalId: contactInternalId,
      minutesRequestedForProfileUrlUsage: 128
    });

    const requestOptions = {
      method: "POST",
      headers: getHeaders(token),
      body: raw,
    };

    try {
      const response = await fetch(knowMeUrl, requestOptions);
      logKnowMeProfileDebug("getContactEnrolleeKnowMeProfileImage:response", {
        status: response.status,
        ok: response.ok,
        email,
        contactInternalId,
        whoCalledMe
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const apiResult = await response.json();
      logKnowMeProfileDebug("getContactEnrolleeKnowMeProfileImage:success", {
        email,
        contactInternalId,
        profileUrl: apiResult?.profileUrl || apiResult?.ProfileUrl || null,
        whoCalledMe
      });
      return apiResult;

    } catch (error) {
      console.log(`Error in getContactEnrolleeKnowMeProfileImage: from ${whoCalledMe}`);
      console.error(error);
      return null;
    }
  }
  logKnowMeProfileDebug("getContactEnrolleeKnowMeProfileImage:missingParams", {
    email: email || null,
    contactInternalId: contactInternalId || null,
    hasToken: !!token,
    whoCalledMe
  });
  return "ERROR: Missing token, contactInternalId, courseCodeId, or email";
};

export const getContactEnrolleesKnowMeProfileImages = async (
  token,
  contactInternalIds,
  profileUrlAvailabilityUsageTimeInMinutes,
  whoCalledMe
) => {
  const normalizedContactInternalIds = Array.from(new Set(
    (contactInternalIds || [])
      .map(id => id == null ? '' : String(id).trim())
      .filter(Boolean)
  ));

  if (!token || normalizedContactInternalIds.length === 0) {
    console.warn(`[${whoCalledMe}] Missing token or empty contactInternalIds`);
    return null;
  }

  const knowMeUrl = `${titulinoNetLrnApiUri}/know-me/profiles`;

  const payload = JSON.stringify({
    ContactInternalIds: normalizedContactInternalIds,
    ProfileUrlAvailabilityUsageTimeInMinutes: profileUrlAvailabilityUsageTimeInMinutes ?? 128,
  });

  const requestOptions = {
    method: "POST",
    headers: getHeaders(token),
    body: payload,
  };

  try {
    const response = await fetch(knowMeUrl, requestOptions);
    if (!response.ok) {
      const text = await response.text();
      console.error(`[${whoCalledMe}] ${response.status}: ${text}`);
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const apiResult = await response.json();
    return apiResult;
  } catch (error) {
    console.error(`Error in getContactEnrolleesKnowMeProfileImages (${whoCalledMe}):`, error);
    return null;
  }
};

export const getKnowMeProfilesByContactInternalIds = async (
  token,
  contactInternalIds,
  profileUrlAvailabilityUsageTimeInMinutes,
  whoCalledMe
) => (
  getContactEnrolleesKnowMeProfileImages(
    token,
    contactInternalIds,
    profileUrlAvailabilityUsageTimeInMinutes,
    whoCalledMe
  )
);


export const upsertStudentKnowMeProfileImage = async (token, fileToSubmit, whoCalledMe) => {
  if (!fileToSubmit || !token) {
    logKnowMeProfileDebug("upsertStudentKnowMeProfileImage:missingParams", {
      hasToken: !!token,
      hasFileToSubmit: !!fileToSubmit,
      contactInternalId: fileToSubmit?.contactId || null,
      emailId: fileToSubmit?.emailId || null,
      whoCalledMe
    });
    return "ERROR no valid Token or File";
  }

  const upsertUrl = `${titulinoNetLrnApiUri}/know-me/profile/upload`;

  logKnowMeProfileDebug("upsertStudentKnowMeProfileImage:start", {
    contactInternalId: fileToSubmit?.contactId || null,
    emailId: fileToSubmit?.emailId || null,
    fileName: fileToSubmit?.fileName || fileToSubmit?.file?.name || null,
    hasToken: !!token,
    whoCalledMe
  });

  const formData = new FormData();
  formData.append("ContactInternalId", fileToSubmit.contactId);
  formData.append("EmailId", fileToSubmit.emailId);
  formData.append("File", fileToSubmit.file);

  const requestOptions = {
    method: "POST",
    headers: getHeaders(token, true),
    body: formData,
  };

  try {
    const response = await fetch(upsertUrl, requestOptions);
    logKnowMeProfileDebug("upsertStudentKnowMeProfileImage:response", {
      status: response.status,
      ok: response.ok,
      contactInternalId: fileToSubmit?.contactId || null,
      whoCalledMe
    });
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const apiResult = await response.json();
    logKnowMeProfileDebug("upsertStudentKnowMeProfileImage:success", {
      contactInternalId: fileToSubmit?.contactId || null,
      profileUrl: apiResult?.profileUrl || apiResult?.ProfileUrl || null,
      whoCalledMe
    });
    return apiResult;
  } catch (error) {
    console.error(`Error in upsertStudentKnowMeProfileImage (${whoCalledMe}):`, error);
    return null;
  }
};


export const upsertStudentKnowMeClassFiles = async (token, filesToSubmit, whoCalledMe) => {
  if (!filesToSubmit || filesToSubmit.length === 0 || !token) {
    return "ERROR no valid Token or Array Empty";
  }

  const upsertUrl = `${titulinoNetLrnApiUri}/know-me/class/upload`;
  const formData = new FormData();

  // Contact and metadata once
  formData.append("ContactInternalId", filesToSubmit[0].contactId);
  formData.append("EmailId", filesToSubmit[0].emailId);
  formData.append("CourseCodeId", filesToSubmit[0].courseCodeId);
  formData.append("ClassNumber", filesToSubmit[0].classNumber);

  // Append all files
  for (const f of filesToSubmit) {
    formData.append("Files", f.file); // Ã°Å¸â€˜Ë† matches backend DTO
  }

  const requestOptions = {
    method: "POST",
    headers: getHeaders(token, true),
    body: formData,
  };

  try {
    const response = await fetch(upsertUrl, requestOptions);
    if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Error in upsertStudentKnowMeClassFiles from ${whoCalledMe}`, error);
    return "";
  }
};



export const uploadCourseCoverImage = async (token, file, whoCalledMe) => {
  if (!file || !token) return null;

  const upsertUrl = `${titulinoNetEnrollmentApiUri}/course/cover/upload`;

  const formData = new FormData();
  formData.append("File", file);

  const requestOptions = {
    method: "POST",
    headers: getHeaders(token, true),
    body: formData,
  };

  try {
    const response = await fetch(upsertUrl, requestOptions);
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    const apiResult = await response.json();
    return apiResult;
  } catch (error) {
    console.error(`Error in uploadCourseCoverImage (${whoCalledMe}):`, error);
    return null;
  }
};

const TitulinoNetService = {
  getRegistrationToken,
  upsertEnrollment,
  getUserProfileByEmailAndYearOfBirth,
  getPurchaseSessionUrl,
  getUserPurchasedProducts,
  upsertStudentKnowMeProfileImage,
  getContactEnrolleeKnowMeProfileImage,
  upsertStudentKnowMeClassFiles,
  getContactEnrolleesKnowMeProfileImages,
  getKnowMeProfilesByContactInternalIds,
  uploadCourseCoverImage
};

export default TitulinoNetService;
