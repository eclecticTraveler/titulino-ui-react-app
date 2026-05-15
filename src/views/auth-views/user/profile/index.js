import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Alert,
  App,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Form,
  Image,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Timeline,
  Upload
} from 'antd';
import {
  BookOutlined,
  EditOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
  UserOutlined
} from '@ant-design/icons';
import Flag from 'react-world-flags';
import langData from 'assets/data/language.data.json';
import WorldMap from 'assets/maps/world-countries-sans-antarctica.json';
import EnrolleeByRegionWidget from 'components/layout-components/Landing/Unauthenticated/EnrolleeByRegionWidget';
import Loading from 'components/shared-components/Loading';
import IntlMessage from 'components/util-components/IntlMessage';
import ContactProfileEditorLob, { CONTACT_PROFILE_EDIT_SCOPES } from 'lob/ContactProfileEditor';
import KnowMeProfiles from 'lob/KnowMeProfiles';
import { onLoadingAuthenticatedEnrolleeProfile } from 'redux/actions/Grant';
import {
  getAllLanguageOptions,
  onRenderingCourseRegistration,
  onRequestingGeographicalDivision
} from 'redux/actions/Lrn';
import {
  onLoadingContactGeoMaps as onLoadingContactGeoMapsAction,
  onLoadingContactCertificationHistory,
  onLoadingContactShopPurchaseHistory,
  onUpsertingSelectedContactProfile
} from 'redux/actions/AdminTools';

const PROFILE_PICTURE_FIELD_NAME = 'profilePictureUpload';
const ACCEPTED_PROFILE_PICTURE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/x-png', 'image/webp', 'image/gif']);

const getValue = (...values) => values.find(value => value !== undefined && value !== null && value !== '');
const normalizeIdentifier = (value) => (value == null ? '' : String(value).trim().toLowerCase());
const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
};

const formatProfileDate = (value) => (
  /^\d{4}$/.test(String(value || '')) ? String(value) : formatDate(value)
);

const getContactInternalId = (profile, user) => (
  getValue(profile?.ContactInternalId, profile?.contactInternalId, user?.contactInternalId)
);

const getContactExternalId = (profile, user) => (
  getValue(profile?.ContactExternalId, profile?.contactExternalId, user?.contactId)
);

const getFullName = (profile, user) => (
  getValue(
    profile?.FullName,
    profile?.fullName,
    profile?.PersonalCommunicationName,
    profile?.personalCommunicationName,
    [profile?.Names || profile?.names, profile?.LastNames || profile?.lastNames].filter(Boolean).join(' '),
    user?.communicationName
  )
);

const getEmails = (profile, user) => {
  const emails = normalizeArray(profile?.Emails || profile?.emails)
    .map(email => (typeof email === 'string' ? email : email?.EmailId || email?.emailId))
    .filter(Boolean);

  return Array.from(new Set([...(emails || []), profile?.EmailId, profile?.emailId, user?.emailId].filter(Boolean)));
};

const getPhones = (profile) => {
  const phoneRows = [
    ...normalizeArray(profile?.Phones || profile?.phones),
    ...normalizeArray(profile?.PhoneNumbers || profile?.phoneNumbers),
    ...normalizeArray(profile?.ContactPhones || profile?.contactPhones),
    ...normalizeArray(profile?.Contact_Phone || profile?.contact_phone)
  ];

  const rawPhones = phoneRows
    .map(phone => (typeof phone === 'string'
      ? { phoneNumber: phone }
      : {
        phoneNumber: getValue(
          phone?.PhoneId_Rfc3966,
          phone?.phoneIdRfc3966,
          phone?.PhoneNumber,
          phone?.phoneNumber,
          phone?.PhoneId,
          phone?.phoneId,
          phone?.PhoneRawInput,
          phone?.phoneRawInput
        ),
        priority: getValue(phone?.ContactPhonePriority, phone?.contactPhonePriority, phone?.PhonePriority, phone?.phonePriority),
        type: getValue(phone?.PhoneType, phone?.phoneType, phone?.PhoneTypeId, phone?.phoneTypeId)
      }))
    .filter(phone => phone.phoneNumber);

  return Array.from(new Map(rawPhones.map(phone => [normalizeIdentifier(phone.phoneNumber), phone])).values());
};

const getProfileNames = (profile, user) => (
  getValue(profile?.Names, profile?.names, user?.communicationName, '-')
);

const getProfileLastNames = (profile) => (
  getValue(profile?.LastNames, profile?.lastNames, '-')
);

const getProfileDateOfBirth = (profile, user) => (
  getValue(profile?.DateOfBirth, profile?.dateOfBirth, user?.yearOfBirth)
);

const getCourseRoleId = (course) => (
  getValue(
    course?.UserRoleId,
    course?.userRoleId,
    course?.RoleId,
    course?.roleId,
    course?.role,
    course?.Role,
    course?.userRoleIdForTheCourse
  )
);

const getCourseRoleLabel = (roleId) => {
  const normalizedRole = normalizeIdentifier(roleId);
  if (!normalizedRole) return 'Unknown';
  if (normalizedRole === 'titulino_user' || normalizedRole.includes('student')) return 'Student';
  if (normalizedRole.includes('facilit') || normalizedRole.includes('faculit')) return 'Facilitator';
  if (normalizedRole.includes('admin')) return 'Admin';
  return 'Unknown';
};

const getCourseRoleColor = (roleId) => {
  const label = getCourseRoleLabel(roleId);
  if (label === 'Student') return 'blue';
  if (label === 'Facilitator') return 'green';
  if (label === 'Admin') return 'purple';
  return 'default';
};

const getLanguageId = (entry) => entry?.LanguageId || entry?.languageId;
const getLanguageLevel = (entry) => entry?.LanguageLevelAbbreviation || entry?.languageLevelAbbreviation;
const getLanguageStart = (entry) => entry?.StartDate || entry?.startDate;
const getLanguageEnd = (entry) => entry?.EndDate || entry?.endDate;

const proficiencyKeyByLevel = {
  be: 'admin.tools.label.proficiency.be',
  ba: 'admin.tools.label.proficiency.ba',
  in: 'admin.tools.label.proficiency.in',
  ad: 'admin.tools.label.proficiency.ad',
  na: 'admin.tools.label.proficiency.na'
};

const getLanguageDefinition = (languageId) => (
  langData.find(language => (
    normalizeIdentifier(language.langId) === normalizeIdentifier(languageId) ||
    normalizeIdentifier(language.lang) === normalizeIdentifier(languageId)
  ))
);

const getLanguageLevelLocalizationKey = (level) => {
  const normalizedLevel = normalizeIdentifier(level);
  return proficiencyKeyByLevel[normalizedLevel] || null;
};

const getLanguageLevelOptionLabel = (level) => {
  const value = typeof level === 'string'
    ? level
    : getValue(level?.LevelAbbreviation, level?.languageLevelAbbreviation);
  const localizationKey = getValue(
    typeof level === 'string' ? null : level?.LocalizationKey,
    typeof level === 'string' ? null : level?.localizationKey,
    getLanguageLevelLocalizationKey(value)
  );
  const fallback = getValue(
    typeof level === 'string' ? null : level?.LocalizationDescription,
    typeof level === 'string' ? null : level?.localizationDescription,
    value ? String(value).toUpperCase() : ''
  );

  return localizationKey ? <IntlMessage id={localizationKey} /> : fallback;
};

const getLanguageHistory = (profile) => (
  normalizeArray(profile?.LanguageProficienciesHistory || profile?.languageProficienciesHistory || profile?.languageProficiencies)
);

const getCurrentLanguageValues = (languageHistory = []) => (
  (languageHistory || []).reduce((accumulator, entry) => {
    const languageId = getLanguageId(entry);
    const level = getLanguageLevel(entry);
    if (!languageId || !level) return accumulator;

    const existing = accumulator[languageId];
    const isCurrent = !getLanguageEnd(entry);
    if (!existing || isCurrent) {
      accumulator[languageId] = level;
    }
    return accumulator;
  }, {})
);

const getLocation = (profile, type) => {
  const location = profile?.Location || profile?.location || {};
  if (type === 'residency') {
    return location?.ResidencyLocation || location?.residencyLocation || {};
  }
  return location?.BirthLocation || location?.birthLocation || {};
};

const getLocationModel = (profile, type) => {
  const location = getLocation(profile, type);
  const isResidency = type === 'residency';
  return {
    countryCode: getValue(
      isResidency ? location?.CountryOfResidency : location?.CountryOfBirth,
      isResidency ? location?.countryOfResidency : location?.countryOfBirth,
      isResidency ? profile?.countryOfResidencyId : profile?.countryOfBirthId,
      isResidency ? profile?.CountryOfResidencyId : profile?.CountryOfBirthId,
      isResidency ? profile?.countryOfResidence : profile?.countryOfBirth
    ),
    countryName: getValue(
      isResidency ? location?.CountryOfResidencyNativeName : location?.CountryOfBirthNativeName,
      isResidency ? location?.countryOfResidencyNativeName : location?.countryOfBirthNativeName,
      isResidency ? location?.CountryOfResidencyName : location?.CountryOfBirthName,
      isResidency ? location?.countryOfResidencyName : location?.countryOfBirthName,
      isResidency ? profile?.countryOfResidencyName : profile?.countryOfBirthName,
      isResidency ? profile?.CountryOfResidencyName : profile?.CountryOfBirthName
    ),
    regionId: getValue(
      isResidency ? location?.CountryDivisionResidencyId : location?.CountryDivisionBirthId,
      isResidency ? location?.countryDivisionResidencyId : location?.countryDivisionBirthId,
      isResidency ? profile?.countryDivisionIdResidency : profile?.countryDivisionIdBirth,
      isResidency ? profile?.CountryDivisionIdResidency : profile?.CountryDivisionIdBirth
    ),
    regionName: getValue(
      isResidency ? location?.CountryDivisionResidencyName : location?.CountryDivisionBirthName,
      isResidency ? location?.countryDivisionResidencyName : location?.countryDivisionBirthName,
      isResidency ? profile?.countryDivisionResidencyName : profile?.countryDivisionBirthName,
      isResidency ? profile?.CountryDivisionResidencyName : profile?.CountryDivisionBirthName
    )
  };
};

const getCourseRows = (profile, user) => {
  const roleRows = normalizeArray(profile?.UserCourseRoles || profile?.userCourseRoles);
  const roleByCourseId = roleRows.reduce((accumulator, roleRow) => {
    const courseCodeId = getValue(roleRow?.CourseCodeId, roleRow?.courseCodeId, roleRow?.courseId, roleRow?.CourseId);
    if (courseCodeId) {
      accumulator[courseCodeId] = getCourseRoleId(roleRow);
    }
    return accumulator;
  }, {});
  const courseRows = [
    ...normalizeArray(profile?.CoursesHistory || profile?.coursesHistory),
    ...normalizeArray(user?.userCourses)
  ];

  const seen = new Set();
  return courseRows.map((course, index) => {
    const details = course?.CourseDetails || course?.courseDetails || {};
    const courseCodeId = getValue(course?.CourseCodeId, course?.courseCodeId, course?.courseId, course?.CourseId);
    const title = getValue(
      details?.course,
      details?.Course,
      course?.CourseTitle,
      course?.courseTitle,
      course?.CourseName,
      course?.courseName,
      courseCodeId
    );
    const startDate = getValue(course?.StartDate, course?.startDate, details?.StartDate, details?.startDate);
    const endDate = getValue(course?.EndDate, course?.endDate, details?.EndDate, details?.endDate);
    const targetLanguageId = getValue(course?.TargetLanguageId, course?.targetLanguageId, details?.TargetLanguageId, details?.targetLanguageId);
    const audienceLanguageId = getValue(
      course?.NativeLanguageId,
      course?.nativeLanguageId,
      course?.AudienceLanguageId,
      course?.audienceLanguageId,
      details?.NativeLanguageId,
      details?.nativeLanguageId,
      details?.targetAudienceNativeLanguageId,
      details?.targetAudienceNativeLanguage
    );
    const imageUrl = getValue(
      course?.imageUrl,
      course?.ImageUrl,
      details?.imageUrl,
      details?.ImageUrl,
      details?.courseProfileImage,
      details?.courseImageUrl,
      details?.thumbnail
    );
    const roleId = getValue(getCourseRoleId(course), roleByCourseId[courseCodeId]);
    const key = [courseCodeId, title, startDate, endDate, roleId || index]
      .filter(Boolean)
      .join('|') || index;
    if (!key || seen.has(key)) return null;
    seen.add(key);
    return { key, courseCodeId, title, imageUrl, targetLanguageId, audienceLanguageId, startDate, endDate, roleId };
  }).filter(Boolean);
};

const normalizeAwardTier = (value) => {
  const normalizedValue = normalizeIdentifier(value);
  if (!normalizedValue) return null;
  if (normalizedValue.includes('gold')) return 'Golden';
  if (normalizedValue.includes('silver') || normalizedValue.includes('participation')) return 'Participation';
  return null;
};

const normalizeAwardCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];

  const hasAwardShape = getValue(
    value?.CourseCodeId,
    value?.courseCodeId,
    value?.CourseId,
    value?.courseId,
    value?.AwardTier,
    value?.awardTier,
    value?.CertificateTypeId,
    value?.certificateTypeId
  );

  if (hasAwardShape) return [value];
  return Object.values(value).flatMap(normalizeAwardCollection);
};

const getAwardCourseCodeId = (award) => (
  getValue(
    award?.CourseCodeId,
    award?.courseCodeId,
    award?.CourseId,
    award?.courseId,
    award?.CourseCode,
    award?.courseCode
  )
);

const getAwardTier = (award) => (
  normalizeAwardTier(getValue(
    award?.AwardTier,
    award?.awardTier,
    award?.AwardType,
    award?.awardType,
    award?.TierId,
    award?.tierId,
    award?.CertificateTypeId,
    award?.certificateTypeId,
    award?.CertificateType,
    award?.certificateType,
    award?.CertificationKey,
    award?.certificationKey,
    award?.CertificationDisplayKey,
    award?.certificationDisplayKey,
    award?.CertificationDescription,
    award?.certificationDescription,
    award?.Name,
    award?.name
  ))
);

const getProfileAwardsByCourse = (profile) => {
  const rawAwards = [
    ...normalizeAwardCollection(profile?.Awards || profile?.awards),
    ...normalizeAwardCollection(profile?.CourseAwards || profile?.courseAwards),
    ...normalizeAwardCollection(profile?.Certificates || profile?.certificates),
    ...normalizeAwardCollection(profile?.CourseCertificates || profile?.courseCertificates)
  ];

  return rawAwards.reduce((accumulator, award) => {
    const courseCodeId = getAwardCourseCodeId(award);
    const awardTier = getAwardTier(award);
    if (!courseCodeId || !awardTier) return accumulator;

    const courseKey = normalizeIdentifier(courseCodeId);
    accumulator[courseKey] = Array.from(new Set([...(accumulator[courseKey] || []), awardTier]));
    return accumulator;
  }, {});
};

const getCertificationRowsByCourse = (certificationRows = []) => (
  normalizeArray(certificationRows).reduce((accumulator, certification) => {
    const courseCodeId = getAwardCourseCodeId(certification);
    const awardTier = getAwardTier(certification);
    if (!courseCodeId || !awardTier) return accumulator;

    const courseKey = normalizeIdentifier(courseCodeId);
    accumulator[courseKey] = [
      ...(accumulator[courseKey] || []),
      {
        ...certification,
        awardTier,
        courseCodeId,
        createdAt: getValue(certification?.createdAt, certification?.CreatedAt)
      }
    ];
  return accumulator;
  }, {})
);

const getUploadValueFromEvent = (event) => (Array.isArray(event) ? event : event?.fileList);

const buildDivisionOptions = (divisions = [], initialValue) => {
  const options = normalizeArray(divisions).map(division => ({
    value: division?.CountryDivisionId,
    searchText: division?.CountryDivisionName || '',
    label: (
      <span>
        {division?.CountryId && <Flag code={division.CountryId} style={{ width: 20, marginRight: 8 }} />}
        {division?.CountryDivisionName || division?.CountryDivisionId}
      </span>
    )
  })).filter(option => option.value);

  if (initialValue && !options.some(option => option.value === initialValue)) {
    options.unshift({
      value: initialValue,
      searchText: String(initialValue),
      label: String(initialValue)
    });
  }

  return options;
};

const sectionStyle = {
  border: '1px solid #e6ebf1',
  borderRadius: 8,
  overflow: 'hidden',
  height: '100%',
  background: '#fff'
};

const sectionHeaderStyle = {
  minHeight: 48,
  padding: '12px 16px',
  borderBottom: '1px solid #e6ebf1',
  background: '#f7f7f8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  fontWeight: 700
};

const sectionBodyStyle = {
  padding: 16
};

const EnrolleeProfile = ({
  user,
  token,
  enrolleeProfile,
  countries,
  selfLanguageLevel,
  languageOptions,
  onLoadingAuthenticatedEnrolleeProfile,
  onRenderingCourseRegistration,
  getAllLanguageOptions,
  onRequestingGeographicalDivision,
  onLoadingContactGeoMaps,
  onLoadingContactCertificationHistory,
  onLoadingContactShopPurchaseHistory,
  onUpsertingSelectedContactProfile
}) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(enrolleeProfile);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [residencyDivisions, setResidencyDivisions] = useState([]);
  const [geoMaps, setGeoMaps] = useState({ birth: null, residency: null });
  const [hydratedAvatarUrl, setHydratedAvatarUrl] = useState(null);
  const [awardRows, setAwardRows] = useState([]);
  const [awardsLoading, setAwardsLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setProfile(enrolleeProfile);
  }, [enrolleeProfile]);

  useEffect(() => {
    if (!token || !user?.emailId || !user?.yearOfBirth) return;

    let isActive = true;
    setLoading(true);
    onLoadingAuthenticatedEnrolleeProfile(user.emailId, String(user.yearOfBirth))
      ?.then((action) => {
        if (!isActive) return;
        setProfile(action?.enrolleeProfile || null);
      })
      ?.finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [onLoadingAuthenticatedEnrolleeProfile, token, user?.emailId, user?.yearOfBirth]);

  useEffect(() => {
    if (!countries?.length || !selfLanguageLevel?.length) {
      onRenderingCourseRegistration?.();
    }
  }, [countries?.length, onRenderingCourseRegistration, selfLanguageLevel?.length]);

  useEffect(() => {
    if (!languageOptions?.length) {
      getAllLanguageOptions?.();
    }
  }, [getAllLanguageOptions, languageOptions?.length]);

  const contactInternalId = getContactInternalId(profile, user);
  const emails = useMemo(() => getEmails(profile, user), [profile, user]);
  const phones = useMemo(() => getPhones(profile), [profile]);
  const languageHistory = useMemo(() => getLanguageHistory(profile), [profile]);
  const currentLanguageValues = useMemo(() => getCurrentLanguageValues(languageHistory), [languageHistory]);
  const residency = useMemo(() => getLocationModel(profile, 'residency'), [profile]);
  const birth = useMemo(() => getLocationModel(profile, 'birth'), [profile]);
  const courseRows = useMemo(() => getCourseRows(profile, user), [profile, user]);
  const profileAwardsByCourse = useMemo(() => getProfileAwardsByCourse(profile), [profile]);
  const awardCourseRows = useMemo(() => (
    Array.from(
      new Map(
        courseRows
          .filter(course => course?.courseCodeId)
          .map(course => [normalizeIdentifier(course.courseCodeId), course])
      ).values()
    )
  ), [courseRows]);
  const profileLocationForMap = useMemo(() => ({
    Location: {
      BirthLocation: {
        CountryOfBirth: birth.countryCode,
        CountryOfBirthNativeName: birth.countryName,
        CountryOfBirthName: birth.countryName,
        CountryDivisionBirthId: birth.regionId,
        CountryDivisionBirthName: birth.regionName || birth.regionId
      },
      ResidencyLocation: {
        CountryOfResidency: residency.countryCode,
        CountryOfResidencyNativeName: residency.countryName,
        CountryOfResidencyName: residency.countryName,
        CountryDivisionResidencyId: residency.regionId,
        CountryDivisionResidencyName: residency.regionName || residency.regionId
      }
    }
  }), [
    birth.countryCode,
    birth.countryName,
    birth.regionId,
    birth.regionName,
    residency.countryCode,
    residency.countryName,
    residency.regionId,
    residency.regionName
  ]);
  const knowMeToken = getValue(profile?.innerToken, profile?.token, user?.innerToken);
  const avatarUrl = getValue(
    hydratedAvatarUrl,
    profile?.AvatarUrl,
    profile?.avatarUrl,
    token?.user_metadata?.avatar_url,
    token?.user_metadata?.picture
  );
  const existingEmailKeys = useMemo(
    () => new Set(emails.map(normalizeIdentifier)),
    [emails]
  );

  useEffect(() => {
    if (!contactInternalId || !knowMeToken) {
      setHydratedAvatarUrl(null);
      return;
    }

    let isActive = true;
    KnowMeProfiles.getKnowMeProfileUrlMap(
      knowMeToken,
      [contactInternalId],
      'EnrolleeProfile.avatarHydration'
    )
      .then((profileUrlMap) => {
        if (!isActive) return;
        setHydratedAvatarUrl(profileUrlMap?.[normalizeIdentifier(contactInternalId)] || null);
      })
      .catch(() => {
        if (isActive) setHydratedAvatarUrl(null);
      });

    return () => {
      isActive = false;
    };
  }, [contactInternalId, knowMeToken]);

  useEffect(() => {
    if (!contactInternalId) {
      setAwardRows([]);
      setAwardsLoading(false);
      return;
    }

    let isActive = true;
    setAwardsLoading(true);

    onLoadingContactCertificationHistory?.(user?.emailId, {
      contactInternalIds: [contactInternalId],
      courseCodeIds: awardCourseRows.map(course => course.courseCodeId).filter(Boolean),
      limit: 500,
      offset: 0
    })
      ?.then((action) => {
        if (!isActive) return;

        const certificationRows = action?.contactCertificationHistory?.rows || [];
        const certificationRowsByCourse = getCertificationRowsByCourse(certificationRows);
        const courseById = awardCourseRows.reduce((accumulator, course) => {
          if (course?.courseCodeId) accumulator[normalizeIdentifier(course.courseCodeId)] = course;
          return accumulator;
        }, {});
        const courseKeys = Array.from(new Set([
          ...Object.keys(courseById),
          ...Object.keys(profileAwardsByCourse),
          ...Object.keys(certificationRowsByCourse)
        ]));

        setAwardRows(courseKeys.map((courseKey) => {
          const course = courseById[courseKey] || {
            key: courseKey,
            courseCodeId: certificationRowsByCourse[courseKey]?.[0]?.courseCodeId || courseKey,
            title: certificationRowsByCourse[courseKey]?.[0]?.courseCodeId || courseKey
          };
          const explicitAwards = profileAwardsByCourse[courseKey] || [];
          const certificationAwards = (certificationRowsByCourse[courseKey] || []).map(certification => certification.awardTier);

          return {
            ...course,
            awards: Array.from(new Set([...explicitAwards, ...certificationAwards])),
            awardRecords: certificationRowsByCourse[courseKey] || []
          };
        }));
      })
      ?.catch((error) => {
        console.error('Failed to load profile certification history', error);
        if (isActive) {
          setAwardRows(awardCourseRows.map(course => ({
            ...course,
            awards: profileAwardsByCourse[normalizeIdentifier(course.courseCodeId)] || [],
            awardRecords: []
          })));
        }
      })
      .finally(() => {
        if (isActive) setAwardsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [awardCourseRows, contactInternalId, onLoadingContactCertificationHistory, profileAwardsByCourse, user?.emailId]);

  useEffect(() => {
    if (!contactInternalId || !user?.emailId) return;

    let isActive = true;
    setPurchaseLoading(true);
    onLoadingContactShopPurchaseHistory(contactInternalId, user.emailId)
      ?.then((action) => {
        if (isActive) setPurchaseHistory(action?.contactShopPurchaseHistory || null);
      })
      ?.finally(() => {
        if (isActive) setPurchaseLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [contactInternalId, onLoadingContactShopPurchaseHistory, user?.emailId]);

  useEffect(() => {
    if (!birth.countryCode && !residency.countryCode) {
      setGeoMaps({ birth: null, residency: null });
      return;
    }

    let isActive = true;
    onLoadingContactGeoMaps?.(profileLocationForMap)
      ?.then((action) => {
        if (isActive) setGeoMaps(action?.contactGeoMaps || { birth: null, residency: null });
      })
      ?.catch(() => {
        if (isActive) setGeoMaps({ birth: null, residency: null });
      });

    return () => {
      isActive = false;
    };
  }, [birth.countryCode, onLoadingContactGeoMaps, profileLocationForMap, residency.countryCode]);

  useEffect(() => {
    if (!editOpen || !residency.countryCode) return;

    onRequestingGeographicalDivision?.(residency.countryCode)
      ?.then((action) => setResidencyDivisions(normalizeArray(action?.countryDivisions)))
      ?.catch(() => setResidencyDivisions([]));
  }, [editOpen, onRequestingGeographicalDivision, residency.countryCode]);

  const countryOptions = useMemo(() => (
    normalizeArray(countries).map(country => ({
      value: country?.CountryId,
      searchText: `${country?.NativeCountryName || ''} ${country?.CountryName || ''} ${country?.CountryId || ''}`,
      label: (
        <span>
          {country?.CountryId && <Flag code={country.CountryId} style={{ width: 20, marginRight: 8 }} />}
          {country?.NativeCountryName || country?.CountryName || country?.CountryId}
          {country?.CountryName && country?.NativeCountryName ? ` | ${country.CountryName}` : ''}
        </span>
      )
    })).filter(option => option.value)
  ), [countries]);

  const languageLevelOptions = useMemo(() => (
    normalizeArray(selfLanguageLevel).map(level => ({
      value: level?.LevelAbbreviation,
      searchText: `${level?.LocalizationDescription || ''} ${level?.LocalizationKey || ''} ${level?.LevelAbbreviation || ''}`,
      label: getLanguageLevelOptionLabel(level)
    })).filter(option => option.value)
  ), [selfLanguageLevel]);

  const residencyDivisionOptions = useMemo(
    () => buildDivisionOptions(residencyDivisions, residency.regionId || residency.regionName),
    [residency.regionId, residency.regionName, residencyDivisions]
  );

  const filterOption = (input, option) => (
    (option?.searchText || '').toString().toLowerCase().includes(input.toLowerCase())
  );

  const beforeUpload = (file) => {
    if (!ACCEPTED_PROFILE_PICTURE_TYPES.has(file.type)) {
      message.error('Please select a JPG, PNG, WEBP, or GIF image.');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const normalizeEmailValues = (values = []) => (
    Array.from(new Set(
      normalizeArray(values)
        .map(email => String(email || '').trim())
        .filter(Boolean)
    ))
  );

  const handleEmailValuesChange = (nextValues = []) => {
    const mergedValues = normalizeEmailValues([...emails, ...nextValues]);
    form.setFieldsValue({ emails: mergedValues });
  };

  const renderEmailTag = ({ label, value, closable, onClose }) => {
    const isExistingEmail = existingEmailKeys.has(normalizeIdentifier(value));
    return (
      <Tag
        color={isExistingEmail ? 'geekblue' : 'green'}
        closable={!isExistingEmail && closable}
        onClose={isExistingEmail ? undefined : onClose}
        style={{ marginInlineEnd: 4, whiteSpace: 'normal' }}
      >
        {label}
      </Tag>
    );
  };

  const renderSection = (title, children, extra = null) => (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <span>{title}</span>
        {extra}
      </div>
      <div style={sectionBodyStyle}>{children}</div>
    </div>
  );

  const renderIdentityDetails = () => (
    <Descriptions bordered size="small" column={1}>
      <Descriptions.Item label="Name">{getProfileNames(profile, user)}</Descriptions.Item>
      <Descriptions.Item label="Last Names">{getProfileLastNames(profile)}</Descriptions.Item>
      <Descriptions.Item label="External ID">{getContactExternalId(profile, user) || '-'}</Descriptions.Item>
      <Descriptions.Item label="Date of Birth">{formatProfileDate(getProfileDateOfBirth(profile, user))}</Descriptions.Item>
      <Descriptions.Item label="Age">{getValue(profile?.Age, profile?.age, '-')}</Descriptions.Item>
      <Descriptions.Item label="Sex">
        {getValue(profile?.Sex, profile?.sex)
          ? <Tag color={getValue(profile?.Sex, profile?.sex) === 'F' ? 'pink' : 'blue'}>{getValue(profile?.Sex, profile?.sex)}</Tag>
          : '-'}
      </Descriptions.Item>
    </Descriptions>
  );

  const renderAwardTag = (award) => (
    <Tag
      key={award}
      color={award === 'Golden' ? 'gold' : undefined}
      style={award === 'Participation' ? {
        background: '#f4f5f7',
        borderColor: '#bfbfbf',
        color: '#595959',
        margin: 0
      } : { margin: 0 }}
    >
      <SafetyCertificateOutlined /> {award}
    </Tag>
  );

  const renderAwardsEmpty = () => (
    <div
      style={{
        minHeight: 260,
        border: '1px dashed #d9e2ec',
        borderRadius: 8,
        background: '#fbfdff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        textAlign: 'center',
        padding: 24
      }}
    >
      <Avatar
        size={72}
        icon={<TrophyOutlined />}
        style={{ background: '#fff7e6', color: '#d48806' }}
      />
      <div>
        <div style={{ fontWeight: 700, color: '#102a43' }}>No awards yet</div>
        <div style={{ color: '#72849a', maxWidth: 260 }}>
          Golden and participation awards will appear here by course once earned.
        </div>
      </div>
    </div>
  );

  const renderAwardBadge = (award, record) => {
    const awardRecord = (record?.awardRecords || []).find(certification => getAwardTier(certification) === award);
    const badgeImageUrl = getValue(
      awardRecord?.BadgeImageUrl,
      awardRecord?.badgeImageUrl
    );
    const badgeSize = 36;

    return (
      <div
        key={award}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 6,
          minWidth: 88
        }}
      >
        {badgeImageUrl && (
          <Image
            src={badgeImageUrl}
            width={badgeSize}
            height={badgeSize}
            preview
            wrapperStyle={{
              width: badgeSize,
              height: badgeSize,
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid #e6ebf1',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            style={{
              width: badgeSize,
              height: badgeSize,
              objectFit: 'contain',
              padding: 2,
              boxSizing: 'border-box',
              display: 'block'
            }}
          />
        )}
        {renderAwardTag(award)}
      </div>
    );
  };

  const renderAwards = () => {
    const earnedAwardRows = awardRows.filter(row => row?.awards?.length);

    if (!awardsLoading && earnedAwardRows.length === 0) {
      return renderAwardsEmpty();
    }

    return (
      <Table
        size="small"
        rowKey="courseCodeId"
        loading={awardsLoading}
        pagination={false}
        dataSource={earnedAwardRows}
        locale={{ emptyText: renderAwardsEmpty() }}
        scroll={{ x: true }}
        columns={[
          {
            title: 'Course',
            dataIndex: 'title',
            key: 'title',
            width: 170,
            render: (_, record) => (
              <Space>
                <Avatar
                  shape="square"
                  size={36}
                  src={record.imageUrl}
                  icon={<BookOutlined />}
                  style={{ borderRadius: 8, flexShrink: 0 }}
                />
                <span style={{ fontWeight: 600 }}>{record.title || '-'}</span>
              </Space>
            )
          },
          {
            title: 'Award',
            dataIndex: 'awards',
            key: 'awards',
            width: 220,
            render: (awards, record) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  flexWrap: 'nowrap',
                  minWidth: 188
                }}
              >
                {awards.map(award => renderAwardBadge(award, record))}
              </div>
            )
          }
        ]}
      />
    );
  };

  const openEditDrawer = () => {
    form.setFieldsValue({
      emails,
      countryOfResidence: residency.countryCode || null,
      countryDivisionOfResidence: residency.regionId || residency.regionName || null,
      languageProficiencies: currentLanguageValues,
      [PROFILE_PICTURE_FIELD_NAME]: []
    });
    setEditOpen(true);
  };

  const handleResidencyCountryChange = async (countryId) => {
    form.setFieldsValue({ countryDivisionOfResidence: null });
    if (!countryId) {
      setResidencyDivisions([]);
      return;
    }

    const action = await onRequestingGeographicalDivision?.(countryId);
    setResidencyDivisions(normalizeArray(action?.countryDivisions));
  };

  const buildProfileUpdate = (values) => {
    const existingEmails = emails.map(email => email.trim()).filter(Boolean);
    const nextEmailValues = Array.from(new Set([...(values.emails || []), ...existingEmails].map(email => email.trim()).filter(Boolean)));
    const birthLocation = getLocationModel(profile, 'birth');

    const updateValues = {
      contactInternalId,
      contactExternalId: getContactExternalId(profile, user),
      names: getValue(profile?.Names, profile?.names, user?.communicationName?.split(' ')?.[0], ''),
      lastNames: getValue(profile?.LastNames, profile?.lastNames, ''),
      sex: getValue(profile?.Sex, profile?.sex, null),
      dateOfBirth: getValue(profile?.DateOfBirth, profile?.dateOfBirth, user?.yearOfBirth ? `${user.yearOfBirth}-01-01` : null),
      emails: nextEmailValues,
      countryOfResidence: values.countryOfResidence,
      countryDivisionOfResidence: values.countryDivisionOfResidence,
      countryOfBirth: birthLocation.countryCode,
      countryDivisionOfBirth: birthLocation.regionId || birthLocation.regionName,
      languageProficiencies: values.languageProficiencies || currentLanguageValues,
      profilePictureUpload: values[PROFILE_PICTURE_FIELD_NAME] || [],
      termsVersion: '2.1'
    };

    const payload = ContactProfileEditorLob.buildUpsertEnrolleeListPayload({
      values: updateValues,
      contact: profile,
      countries,
      residencyDivisions,
      birthDivisions: []
    });

    const patch = ContactProfileEditorLob.buildContactProfilePatch({
      values: updateValues,
      contact: profile,
      countries,
      residencyDivisions,
      birthDivisions: []
    });

    return {
      payload,
      patch,
      filesMap: {
        [PROFILE_PICTURE_FIELD_NAME]: updateValues.profilePictureUpload
      },
      editScope: CONTACT_PROFILE_EDIT_SCOPES.PROFILE_OWNER
    };
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const nextEmails = normalizeArray(values.emails).map(normalizeIdentifier);
    const missingExistingEmails = emails.filter(email => !nextEmails.includes(normalizeIdentifier(email)));

    if (missingExistingEmails.length > 0) {
      message.warning('Existing email addresses cannot be removed from this page. They were kept in the update.');
    }

    setSubmitting(true);
    try {
      const action = await onUpsertingSelectedContactProfile(buildProfileUpdate(values), user?.emailId);
      const result = action?.upsertResult;

      if (result?.success) {
        const nextProfile = ContactProfileEditorLob.mergeContactProfilePatch(
          profile,
          action?.contactProfilePatch || result?.contactProfilePatch
        );
        setProfile(nextProfile);
        setEditOpen(false);
        message.success('Profile update saved.');
      } else {
        message.error('We could not save the profile update. Please contact titulinoenglish@gmail.com.');
      }
    } catch (error) {
      console.error('Failed to save enrollee profile', error);
      message.error('We could not save the profile update. Please contact titulinoenglish@gmail.com.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderProfileImage = () => (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={getFullName(profile, user) || 'Profile image'}
          width="100%"
          height={360}
          style={{ objectFit: 'cover', borderRadius: 8 }}
          fallback={process.env.PUBLIC_URL + '/img/avatars/tempProfile.jpg'}
        />
      ) : (
        <div
          style={{
            width: '100%',
            minHeight: 260,
            border: '1px dashed #d9d9d9',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12
          }}
        >
          <Avatar size={96} icon={<UserOutlined />} />
          <Button icon={<PlusOutlined />} onClick={openEditDrawer}>Add Profile Picture</Button>
        </div>
      )}
    </div>
  );

  const renderLanguageHistory = () => {
    if (!languageHistory.length) {
      return <Empty description="No language history" />;
    }

    const grouped = languageHistory.reduce((accumulator, entry) => {
      const languageId = getLanguageId(entry) || 'unknown';
      accumulator[languageId] = [...(accumulator[languageId] || []), entry];
      return accumulator;
    }, {});

    const items = Object.entries(grouped).map(([languageId, entries]) => {
      const languageInfo = getLanguageDefinition(languageId);
      return {
        key: languageId,
        label: (
          <span>
            {languageInfo?.icon && <Flag code={languageInfo.icon} style={{ width: 18, marginRight: 6 }} />}
            {languageInfo?.langName || languageId.toUpperCase()}
          </span>
        ),
        children: (
          <Timeline
            items={[...entries]
              .sort((a, b) => new Date(getLanguageStart(b) || 0) - new Date(getLanguageStart(a) || 0))
              .map((entry, index) => {
                const isCurrent = !getLanguageEnd(entry);
                return {
                  key: `${languageId}-${index}`,
                  color: isCurrent ? 'green' : 'gray',
                  children: (
                    <div>
                      <Tag color={isCurrent ? 'green' : 'blue'}>{getLanguageLevelOptionLabel(getLanguageLevel(entry)) || '-'}</Tag>
                      {isCurrent && <Tag color="success">Current</Tag>}
                      <div style={{ color: '#72849a', fontSize: 12 }}>
                        {formatDate(getLanguageStart(entry))} - {isCurrent ? 'Current' : formatDate(getLanguageEnd(entry))}
                      </div>
                    </div>
                  )
                };
              })}
          />
        )
      };
    });

    return <Tabs size="small" items={items} />;
  };

  const purchaseTableModel = purchaseHistory?.tableModel || {};
  const purchaseColumns = purchaseTableModel.columns || [
    { title: 'Purchase', dataIndex: 'description', key: 'description' },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: formatDate }
  ];
  const purchaseRows = purchaseTableModel.tableData || purchaseHistory?.rows || [];

  const renderLanguageValue = (languageId) => {
    const languageInfo = getLanguageDefinition(languageId);
    if (!languageId) return '-';

    return (
      <Space size={6}>
        {languageInfo?.icon && <Flag code={languageInfo.icon} style={{ width: 18 }} />}
        <span>{languageInfo?.langName || String(languageId).toUpperCase()}</span>
      </Space>
    );
  };

  const renderCommunication = () => (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <div
        style={{
          border: '1px solid #eef1f5',
          borderRadius: 8,
          padding: 12,
          background: '#fbfdff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Avatar size={32} icon={<MailOutlined />} style={{ background: '#e6f4ff', color: '#1677ff' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>Email Addresses</strong>
            <div style={{ color: '#72849a', fontSize: 12 }}>{emails.length || 'No'} on file</div>
          </div>
        </div>
        {emails.length ? (
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            {emails.map((email, index) => (
              <div
                key={email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: '#fff',
                  border: '1px solid #edf2f7'
                }}
              >
                <span style={{ wordBreak: 'break-word' }}>{email}</span>
                <Tag color={index === 0 ? 'blue' : 'geekblue'} style={{ marginRight: 0 }}>
                  {index === 0 ? 'Primary' : `Email ${index + 1}`}
                </Tag>
              </div>
            ))}
          </Space>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No email addresses" />
        )}
      </div>

      <div
        style={{
          border: '1px solid #eef1f5',
          borderRadius: 8,
          padding: 12,
          background: '#fffdf8'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Avatar size={32} icon={<PhoneOutlined />} style={{ background: '#fff7e6', color: '#d46b08' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>Phone Numbers</strong>
            <div style={{ color: '#72849a', fontSize: 12 }}>{phones.length || 'None'} on file</div>
          </div>
        </div>
        {phones.length ? (
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            {phones.map((phone, index) => (
              <div
                key={phone.phoneNumber}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: '#fff',
                  border: '1px solid #f5ead8'
                }}
              >
                <span style={{ wordBreak: 'break-word' }}>{phone.phoneNumber}</span>
                <Tag color="gold" style={{ marginRight: 0 }}>
                  {phone.type || (phone.priority ? `Priority ${phone.priority}` : `Phone ${index + 1}`)}
                </Tag>
              </div>
            ))}
          </Space>
        ) : (
          <div
            style={{
              padding: '12px 10px',
              border: '1px dashed #f0d7b4',
              borderRadius: 6,
              color: '#8c6d3f',
              background: '#fff'
            }}
          >
            No phone numbers on file.
          </div>
        )}
      </div>
    </Space>
  );

  const renderLocationMap = (location, type) => {
    const isResidency = type === 'residency';
    const regionName = location.regionName || location.regionId;
    const countryName = location.countryName || location.countryCode;
    const mapSource = regionName ? geoMaps[type] : WorldMap;
    const shouldRenderMap = regionName ? Boolean(geoMaps[type]) : Boolean(location.countryCode);

    return (
      <div>
        <Card variant="outlined" size="small" style={{ marginBottom: 8 }}>
          <strong>{countryName || '-'}</strong>
          {regionName && <span> - {regionName}</span>}
        </Card>
        {shouldRenderMap ? (
          <EnrolleeByRegionWidget
            enrolleeRegionData={[{
              name: regionName || countryName,
              nativeName: countryName,
              countryId: location.countryCode,
              color: isResidency ? '#1890ff' : '#f5222d',
              value: ''
            }]}
            mapSource={mapSource}
            mapType={regionName ? location.countryCode : 'world'}
            zoomable={false}
            showRegionList={false}
          />
        ) : (
          <Empty description="Map unavailable" />
        )}
      </div>
    );
  };

  const geographyItems = [
    ...(residency.countryCode ? [{
      key: 'residency',
      label: (
        <span>
          <Flag code={residency.countryCode} style={{ width: 18, marginRight: 6 }} />
          Place of Residency
        </span>
      ),
      children: renderLocationMap(residency, 'residency')
    }] : []),
    ...(birth.countryCode ? [{
      key: 'birth',
      label: (
        <span>
          <Flag code={birth.countryCode} style={{ width: 18, marginRight: 6 }} />
          Place of Birth
        </span>
      ),
      children: renderLocationMap(birth, 'birth')
    }] : [])
  ];

  const renderGeography = () => (
    geographyItems.length ? (
      <Tabs defaultActiveKey={residency.countryCode ? 'residency' : 'birth'} items={geographyItems} />
    ) : (
      <Empty description="No geography details" />
    )
  );

  if (loading && !profile) {
    return <Loading cover="content" />;
  }

  return (
    <div className="container customerName">
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message="Some profile details are read-only."
        description="If read-only information is wrong, contact titulinoenglish@gmail.com to request changes."
      />

      <Card
        title="Profile"
        variant="outlined"
        extra={<Button type="text" icon={<EditOutlined />} onClick={openEditDrawer} />}
      >
        <Tabs
          defaultActiveKey="general"
          items={[
            {
              key: 'general',
              label: <span><UserOutlined /> General</span>,
              children: (
                <Row gutter={[16, 16]} align="stretch">
                  <Col xs={24} lg={8}>
                    {renderSection(
                      <span><IdcardOutlined /> Identity</span>,
                      <>
                        {renderProfileImage()}
                        <Divider />
                        <h2 style={{ marginBottom: 4 }}>{getFullName(profile, user) || user?.emailId}</h2>
                        <Tag color={profile?.IsActive === false || profile?.isActive === false ? 'red' : 'green'}>
                          {profile?.IsActive === false || profile?.isActive === false ? 'Inactive' : 'Active'}
                        </Tag>
                        <div style={{ marginTop: 16 }}>
                          {renderIdentityDetails()}
                        </div>
                      </>
                    )}
                  </Col>

                  <Col xs={24} lg={16}>
                    {renderSection(
                      <span><EnvironmentOutlined /> Geography</span>,
                      renderGeography()
                    )}
                  </Col>

                  <Col xs={24} lg={8}>
                    {renderSection(
                      <span><TrophyOutlined /> Awards</span>,
                      renderAwards()
                    )}
                  </Col>

                  <Col xs={24} lg={8}>
                    {renderSection(
                      <span><MailOutlined /> Communication</span>,
                      renderCommunication()
                    )}
                  </Col>

                  <Col xs={24} lg={8}>
                    {renderSection(
                      <span><GlobalOutlined /> Language History</span>,
                      renderLanguageHistory()
                    )}
                  </Col>
                </Row>
              )
            },
            {
              key: 'courses',
              label: <span><BookOutlined /> Courses</span>,
              children: (
                <>
                  <h3 style={{ marginBottom: 16 }}>Courses History</h3>
                  <Table
                    size="small"
                    rowKey="key"
                    pagination={false}
                    dataSource={courseRows}
                    locale={{ emptyText: 'No course enrollment history' }}
                    scroll={{ x: true }}
                    columns={[
                      {
                        title: 'Course',
                        dataIndex: 'title',
                        key: 'title',
                        render: (_, record) => (
                          <Space>
                            <Avatar
                              shape="square"
                              size={42}
                              src={record.imageUrl}
                              icon={<BookOutlined />}
                              style={{ borderRadius: 8, flexShrink: 0 }}
                            />
                            <span style={{ fontWeight: 600 }}>{record.title || '-'}</span>
                          </Space>
                        )
                      },
                      {
                        title: 'Target Language',
                        dataIndex: 'targetLanguageId',
                        key: 'targetLanguageId',
                        render: renderLanguageValue
                      },
                      {
                        title: 'Audience Language',
                        dataIndex: 'audienceLanguageId',
                        key: 'audienceLanguageId',
                        render: renderLanguageValue
                      },
                      {
                        title: 'Role',
                        dataIndex: 'roleId',
                        key: 'roleId',
                        render: roleId => <Tag color={getCourseRoleColor(roleId)}>{getCourseRoleLabel(roleId)}</Tag>
                      },
                      {
                        title: 'Start Date',
                        dataIndex: 'startDate',
                        key: 'startDate',
                        render: formatDate
                      },
                      {
                        title: 'End Date',
                        dataIndex: 'endDate',
                        key: 'endDate',
                        render: value => (value ? formatDate(value) : 'Current')
                      }
                    ]}
                  />
                </>
              )
            },
            {
              key: 'purchase-history',
              label: <span><ShoppingCartOutlined /> Purchase History</span>,
              children: (
                <Table
                  size="small"
                  rowKey={(record, index) => record?.key || record?.id || index}
                  loading={purchaseLoading}
                  pagination={false}
                  dataSource={purchaseRows}
                  columns={purchaseColumns}
                  locale={{ emptyText: 'No purchases found' }}
                  scroll={{ x: true }}
                />
              )
            }
          ]}
        />
      </Card>

      <Drawer
        title={<span><EditOutlined /> Profile</span>}
        open={editOpen}
        size={640}
        onClose={() => setEditOpen(false)}
        extra={(
          <Space>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={submitting} onClick={handleSave}>Save</Button>
          </Space>
        )}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Editable fields"
          description="You can add email addresses, update residency, update language proficiency, and upload a profile image. Existing emails stay locked here."
        />

        <Form form={form} layout="vertical">
          <Divider titlePlacement="left">Profile Image</Divider>
          <Form.Item
            name={PROFILE_PICTURE_FIELD_NAME}
            valuePropName="fileList"
            getValueFromEvent={getUploadValueFromEvent}
          >
            <Upload.Dragger
              accept="image/*"
              beforeUpload={beforeUpload}
              maxCount={1}
              listType="picture"
            >
              <p className="ant-upload-drag-icon"><PlusOutlined /></p>
              <p className="ant-upload-text">Click or drag a profile picture here</p>
            </Upload.Dragger>
          </Form.Item>

          <Divider titlePlacement="left">Email Addresses</Divider>
          <Form.Item name="emails" label="Emails">
            <Select
              mode="tags"
              tokenSeparators={[',', ' ']}
              tagRender={renderEmailTag}
              onChange={handleEmailValuesChange}
              placeholder="Add another email address"
            />
          </Form.Item>

          <Divider titlePlacement="left">Place of Residency</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="countryOfResidence" label="Country">
                <Select
                  showSearch
                  allowClear
                  filterOption={filterOption}
                  options={countryOptions}
                  onChange={handleResidencyCountryChange}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="countryDivisionOfResidence" label="Region">
                <Select
                  showSearch
                  allowClear
                  filterOption={filterOption}
                  options={residencyDivisionOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left">Language Proficiency</Divider>
          {Object.keys(currentLanguageValues).length > 0 ? (
            Object.keys(currentLanguageValues).map(languageId => {
              const languageInfo = getLanguageDefinition(languageId);
              return (
                <Form.Item
                  key={languageId}
                  name={['languageProficiencies', languageId]}
                  label={(
                    <span>
                      {languageInfo?.icon && <Flag code={languageInfo.icon} style={{ width: 18, marginRight: 6 }} />}
                      {languageInfo?.langName || languageId.toUpperCase()}
                    </span>
                  )}
                >
                  <Select
                    showSearch
                    filterOption={filterOption}
                    options={languageLevelOptions}
                  />
                </Form.Item>
              );
            })
          ) : (
            <Empty description="No editable language rows" />
          )}
        </Form>
      </Drawer>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onLoadingAuthenticatedEnrolleeProfile,
    onRenderingCourseRegistration,
    getAllLanguageOptions,
    onRequestingGeographicalDivision,
    onLoadingContactGeoMaps: onLoadingContactGeoMapsAction,
    onLoadingContactCertificationHistory,
    onLoadingContactShopPurchaseHistory,
    onUpsertingSelectedContactProfile
  }, dispatch);
}

const mapStateToProps = ({ auth, grant, lrn }) => {
  const { token } = auth;
  const { user, enrolleeProfile } = grant;
  const { countries, selfLanguageLevel, languageOptions } = lrn;
  return {
    token,
    user,
    enrolleeProfile,
    countries,
    selfLanguageLevel,
    languageOptions
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EnrolleeProfile);
