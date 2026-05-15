import LocalStorageService from "services/LocalStorageService";
import TitulinoRestService from "services/TitulinoRestService";
import TitulinoNetService from "services/TitulinoNetService";
import TitulinoAdminAuthService from "services/Admin/TitulinoAdminAuthService";
import AdminInsights from "lob/AdminInsights";
import ShopPurchaseExperience from "lob/ShopPurchaseExperience";
import ImpersonationSession from "lob/ImpersonationSession";
import { env } from "configs/EnvironmentConfig";

const USER_PROFILE_CACHE_TTL_MINUTES = env.USER_PROFILE_CACHE_TTL_MINUTES;
const COURSE_DATA_CACHE_TTL_MINUTES = env.COURSE_DATA_CACHE_TTL_MINUTES;

export const getAllCourses = async() => {
  const localStorageKey = `adminAllCourses`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);
  if (user) {
    return user;
  }

  const allCourses = await TitulinoRestService.getAllCourses("getAllCourses");
  const transformedCourses = await AdminInsights.courseSelectionConverter(allCourses);
  await LocalStorageService.setEnrolleesByCourse(
    transformedCourses,
    localStorageKey,
    COURSE_DATA_CACHE_TTL_MINUTES
  );
  
  return transformedCourses;
}

const setCourseAccessForUserCourses = async(purchasedTierAccess, courseCodeIdOfPurchasedItem, emailId)=> {
  const localStorageKey = `UserProfile_${emailId}`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);

  // Get updated courses
  const updatedUserCourses = await ShopPurchaseExperience.setCourseTierAccessPurchasedInUserCourses(
    user?.userCourses,
    courseCodeIdOfPurchasedItem,
    purchasedTierAccess
  );

  // Create a new updated user object instead of mutating the original
  const updatedUser = {
    ...user,
    userCourses: updatedUserCourses,
  };

  await LocalStorageService.setCachedObject(
    localStorageKey,
    updatedUser,
    USER_PROFILE_CACHE_TTL_MINUTES
  );

  return updatedUserCourses;
}


const normalizeResolvedUserProfile = (userProfile = {}, fallbackEmailId = null) => {
  const globalRoles = Array.isArray(userProfile?.globalRoles)
    ? userProfile.globalRoles
    : [];

  return {
    userCourses: userProfile?.userCourses ?? null,
    contactId: userProfile?.contactId ?? null,
    contactInternalId: userProfile?.contactInternalId ?? null,
    communicationName: userProfile?.communicationName ?? null,
    expirationDate: userProfile?.expirationDate ?? null,
    hasEverBeenFacilitator: userProfile?.hasEverBeenFacilitador ?? userProfile?.hasEverBeenFacilitator ?? false,
    isGlobalAccessUser: userProfile?.isGlobalAccessUser ?? globalRoles.length > 0,
    globalRoles,
    innerToken: userProfile?.innerToken || userProfile?.token,
    emailId: userProfile?.emailId ?? fallbackEmailId,
    yearOfBirth: userProfile?.yearOfBirth,
    contactPaymentProviderId: userProfile?.contactPaymentProviderId ?? null,
    ...(userProfile?.impersonation ? { impersonation: userProfile.impersonation } : {})
  };
};

const getValue = (...values) => values.find(value => value !== undefined && value !== null && value !== '');

const normalizeIdentifier = (value) => (
  value == null ? '' : String(value).trim().toLowerCase()
);

const getEmailValues = (profile = {}) => {
  const emailRows = Array.isArray(profile?.Emails || profile?.emails)
    ? (profile?.Emails || profile?.emails)
    : [];

  return emailRows
    .map(email => (typeof email === 'string' ? email : email?.EmailId || email?.emailId))
    .filter(Boolean);
};

const getYearFromDobOrYob = (dobOrYob) => {
  const match = String(dobOrYob || '').match(/^(\d{4})/);
  return match ? match[1] : null;
};

const omitEmptyValues = (values = {}) => (
  Object.entries(values).reduce((accumulator, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      accumulator[key] = value;
    }
    return accumulator;
  }, {})
);

const matchesKnownProfileIdentifier = (profile = {}, { emailId, contactInternalId, contactExternalId } = {}) => {
  const emails = getEmailValues(profile).map(normalizeIdentifier);
  return (
    normalizeIdentifier(profile?.ContactInternalId || profile?.contactInternalId) === normalizeIdentifier(contactInternalId) ||
    normalizeIdentifier(profile?.ContactExternalId || profile?.contactExternalId) === normalizeIdentifier(contactExternalId) ||
    emails.includes(normalizeIdentifier(emailId))
  );
};

const getAuthenticatedContactProfileByKnownId = async ({
  emailId,
  token,
  contactInternalId,
  contactExternalId
} = {}) => {
  if (!token) return null;

  const searchValues = Array.from(new Set([
    contactInternalId,
    contactExternalId,
    emailId
  ].map(value => String(value || '').trim()).filter(Boolean)));

  for (const searchText of searchValues) {
    const rows = await TitulinoAdminAuthService.getContactSegment(
      {
        p_search: searchText,
        p_limit: 5,
        p_offset: 0
      },
      token,
      'GrantManager.getAuthenticatedContactProfileByKnownId'
    );

    const matchedProfile = (rows || []).find(row => matchesKnownProfileIdentifier(row, {
      emailId,
      contactInternalId,
      contactExternalId
    }));

    if (matchedProfile) return matchedProfile;
  }

  return null;
};

const buildQuickLocation = (quickInfo = {}, type) => {
  const isResidency = type === 'residency';
  const location = isResidency
    ? {
      CountryOfResidency: getValue(quickInfo?.countryOfResidencyId, quickInfo?.CountryOfResidencyId),
      CountryOfResidencyName: getValue(quickInfo?.countryOfResidencyName, quickInfo?.CountryOfResidencyName),
      CountryOfResidencyNativeName: getValue(quickInfo?.countryOfResidencyName, quickInfo?.CountryOfResidencyName),
      CountryDivisionResidencyId: getValue(quickInfo?.countryDivisionIdResidency, quickInfo?.CountryDivisionIdResidency),
      CountryDivisionResidencyName: getValue(quickInfo?.countryDivisionResidencyName, quickInfo?.CountryDivisionResidencyName)
    }
    : {
      CountryOfBirth: getValue(quickInfo?.countryOfBirthId, quickInfo?.CountryOfBirthId),
      CountryOfBirthName: getValue(quickInfo?.countryOfBirthName, quickInfo?.CountryOfBirthName),
      CountryOfBirthNativeName: getValue(quickInfo?.countryOfBirthName, quickInfo?.CountryOfBirthName),
      CountryDivisionBirthId: getValue(quickInfo?.countryDivisionIdBirth, quickInfo?.CountryDivisionIdBirth),
      CountryDivisionBirthName: getValue(quickInfo?.countryDivisionBirthName, quickInfo?.CountryDivisionBirthName)
    };

  return omitEmptyValues(location);
};

const mergeAuthenticatedEnrolleeProfile = ({
  loginProfile = {},
  quickInfo = {},
  contactProfile = {},
  fallbackEmailId = null
} = {}) => {
  const profile = contactProfile || {};
  const loginEmails = [loginProfile?.emailId, fallbackEmailId].filter(Boolean);
  const quickEmails = [quickInfo?.email, quickInfo?.emailId, quickInfo?.emailAddress].filter(Boolean);
  const currentEmails = getEmailValues(profile);
  const emailValues = Array.from(new Set([...currentEmails, ...quickEmails, ...loginEmails].filter(Boolean)));

  return {
    ...loginProfile,
    ...profile,
    ContactInternalId: getValue(profile?.ContactInternalId, profile?.contactInternalId, quickInfo?.contactInternalId, loginProfile?.contactInternalId),
    ContactExternalId: getValue(profile?.ContactExternalId, profile?.contactExternalId, quickInfo?.contactExternalId, loginProfile?.contactId),
    Names: getValue(profile?.Names, profile?.names, quickInfo?.names, loginProfile?.communicationName),
    LastNames: getValue(profile?.LastNames, profile?.lastNames, quickInfo?.lastNames),
    FullName: getValue(
      profile?.FullName,
      profile?.fullName,
      quickInfo?.personalCommunicationName,
      loginProfile?.communicationName,
      [quickInfo?.names, quickInfo?.lastNames].filter(Boolean).join(' ')
    ),
    PersonalCommunicationName: getValue(profile?.PersonalCommunicationName, profile?.personalCommunicationName, quickInfo?.personalCommunicationName),
    Sex: getValue(profile?.Sex, profile?.sex, quickInfo?.sex),
    DateOfBirth: getValue(profile?.DateOfBirth, profile?.dateOfBirth, quickInfo?.dateOfBirth),
    Age: getValue(profile?.Age, profile?.age, quickInfo?.age),
    Emails: emailValues.map((emailId, index) => ({
      EmailId: emailId,
      emailId,
      ContactEmailPriority: index,
      HasOptedOutOfCommunication: false,
      hasOptedOutOfCommunication: false
    })),
    CoursesHistory: getValue(profile?.CoursesHistory, profile?.coursesHistory, loginProfile?.userCourses, []),
    Location: {
      ...(profile?.Location || profile?.location || {}),
      ResidencyLocation: {
        ...(profile?.Location?.ResidencyLocation || profile?.location?.residencyLocation || {}),
        ...buildQuickLocation(quickInfo, 'residency')
      },
      BirthLocation: {
        ...(profile?.Location?.BirthLocation || profile?.location?.birthLocation || {}),
        ...buildQuickLocation(quickInfo, 'birth')
      }
    }
  };
};

const getUserProfile = async (emailId, dobOrYob) => {
  const localStorageKey = `UserProfile_${emailId}`;
  // 1. Try to get from encrypted localStorage
  const user = await LocalStorageService.getCachedObject(localStorageKey);

  if (user) {
    const hasGlobalRolesProfile = Array.isArray(user?.globalRoles);
    if (!user?.isGlobalAccessUser || hasGlobalRolesProfile) {
      return {
        ...user,
        globalRoles: hasGlobalRolesProfile ? user.globalRoles : []
      };
    }
  }

  // 2. Otherwise fetch from backend
  try {
    const userProfile = await TitulinoNetService.getUserProfileByEmailAndYearOfBirth(emailId, dobOrYob);    
    if (userProfile) {
      const user = normalizeResolvedUserProfile(userProfile, emailId);
      
      LocalStorageService.setCachedObject(
        localStorageKey,
        user,
        USER_PROFILE_CACHE_TTL_MINUTES
      );
      // console.log("contactPaymentProviderId", user, userProfile);
      return user;
      
    } else {      
      console.warn("No user profile found for:", emailId, dobOrYob);
      return null;
    }
  } catch (err) {
    console.log("ERRO");
    console.error("Error retrieving user profile:", err);
    return null;
  }
};

const getCachedUserProfile = async (emailId) => {
  const activeImpersonationProfile = ImpersonationSession.getActiveImpersonationProfile();
  if (activeImpersonationProfile?.emailId === emailId) {
    return activeImpersonationProfile;
  }

  const localStorageKey = `UserProfile_${emailId}`;
  const user = await LocalStorageService.getCachedObject(localStorageKey);
  return user
};

const getAuthenticatedEnrolleeProfile = async (emailId, dobOrYob) => {
  if (!emailId || !dobOrYob) return null;

  const yearOfBirth = getYearFromDobOrYob(dobOrYob);
  const [userProfile, quickInfo, cachedUser] = await Promise.all([
    TitulinoNetService.getUserProfileByEmailAndYearOfBirth(
      emailId,
      dobOrYob,
      'GrantManager.getAuthenticatedEnrolleeProfile'
    ),
    yearOfBirth
      ? TitulinoRestService.getQuickEnrolleeCountryDivisionInfo(
        emailId,
        yearOfBirth,
        'GrantManager.getAuthenticatedEnrolleeProfile'
      )
      : Promise.resolve(null),
    getCachedUserProfile(emailId)
  ]);

  const normalizedUserProfile = userProfile
    ? normalizeResolvedUserProfile(userProfile, emailId)
    : null;
  const loginProfile = normalizedUserProfile || cachedUser || {};
  const token = loginProfile?.innerToken || cachedUser?.innerToken || null;

  const contactProfile = await getAuthenticatedContactProfileByKnownId({
    emailId,
    token,
    contactInternalId: getValue(loginProfile?.contactInternalId, cachedUser?.contactInternalId, quickInfo?.contactInternalId),
    contactExternalId: getValue(loginProfile?.contactId, cachedUser?.contactId, quickInfo?.contactExternalId)
  });

  return mergeAuthenticatedEnrolleeProfile({
    loginProfile,
    quickInfo: quickInfo || {},
    contactProfile: contactProfile || {},
    fallbackEmailId: emailId
  });
};

const activateImpersonationProfile = async (userProfile) => {
  const user = ImpersonationSession.setActiveImpersonationProfile(userProfile);
  if (!user) return null;

  return user;
};

const stopImpersonationProfile = async () => {
  return ImpersonationSession.clearActiveImpersonationProfile();
};


const GrantManager = {
  getUserProfile,
  getCachedUserProfile,
  getAuthenticatedEnrolleeProfile,
  activateImpersonationProfile,
  stopImpersonationProfile,
  normalizeResolvedUserProfile,
  setCourseAccessForUserCourses
};

export default GrantManager;
