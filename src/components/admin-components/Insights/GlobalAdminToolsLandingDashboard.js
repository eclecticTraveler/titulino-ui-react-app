import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useIntl } from 'react-intl';
import { App, Row, Col, Card, Input, InputNumber, Select, Radio, Tag, Button, AutoComplete, Tooltip, Descriptions, Empty, Avatar, Divider, Timeline, Tabs, DatePicker, Upload, TimePicker, Popconfirm, Image, Alert, Table, Statistic, Checkbox, Space } from 'antd';
import { SearchOutlined, UserOutlined, BookOutlined, SafetyCertificateOutlined, SolutionOutlined, CopyOutlined, EnvironmentOutlined, GlobalOutlined, CloseCircleOutlined, EditOutlined, SaveOutlined, PlusOutlined, UploadOutlined, MessageOutlined, LineChartOutlined, LoginOutlined, DashboardOutlined, TableOutlined, ReloadOutlined, DollarOutlined, ShoppingCartOutlined, UserSwitchOutlined, MailOutlined, SendOutlined, TeamOutlined, BarChartOutlined, DownloadOutlined } from '@ant-design/icons';
import JsonView from '@uiw/react-json-view';
import Flag from 'react-world-flags';
import langData from 'assets/data/language.data.json';
import IntlMessage from 'components/util-components/IntlMessage';
import EnrolleeByRegionWidget from 'components/layout-components/Landing/Unauthenticated/EnrolleeByRegionWidget';
import TimelineTrendGraph from 'components/layout-components/Graphs/TimelineTrendGraph';
import BarGraph from 'components/layout-components/Graphs/BarGraph';
import LoginFootprintHeatmapGraph from 'components/layout-components/Graphs/LoginFootprintHeatmapGraph';
import LoginFootprintBubbleScatterGraph from 'components/layout-components/Graphs/LoginFootprintBubbleScatterGraph';
import ContactProfileEditor from 'components/shared-components/ContactProfileEditor';
import AbstractTable from 'components/shared-components/Table/AbstractTable';
import WorldMap from 'assets/maps/world-countries-sans-antarctica.json';
import { env } from 'configs/EnvironmentConfig';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import AdminToolsManager from 'managers/AdminToolsManager';
import dayjs from 'dayjs';
import { onRenderingCourseRegistration, onRequestingGeographicalDivision } from 'redux/actions/Lrn';
import {
  onLoadingAdminToolsInit,
  onAssigningEnrolleeRoleToCourse,
  onRevokingCourseFacilitatorAccess,
  onLoadingGlobalUserRole,
  onAssigningGlobalRole,
  onRevokingGlobalRole,
  onClearSelectedContact,
  onUpsertingCourse,
  onLoadingContactCourseProgressActivity,
  onLoadingContactShopPurchaseHistory,
  onLoadingContactLoginFootprint,
  onLoadingAllUserLoginFootprint,
  onLoadingContactProfileMonitoring,
  onLoadingProcessLogEvents,
  onTogglingContactEmailOptOut,
  onTogglingContactActive,
  onTogglingSelectedContactEmailOptOut,
  onTogglingSelectedContactActive,
  onHydratingAdminToolAvatars,
  onLoadingContactGeoMaps,
  onUploadingCourseCoverImage,
  onUpsertingSelectedContactProfile,
  onLoadingShopRevenueDashboard,
  onUpsertingShopProductCourseTier,
  onUpsertingShopTiers,
  onUpsertingShopPaymentProviders,
  onStartingContactImpersonation,
  onLoadingContactSegmentMetadata,
  onLoadingContactSegmentCountryDivisions,
  onLoadingContactSegment,
  onLoadingContactCertificationHistory,
  onLoadingContactMergeDashboard,
  onPreviewingContactMerge,
  onExecutingContactMerge,
  onRollingBackContactMerge,
  onLoadingAudienceMessageVariables,
  onSendingAudienceMessage,
  generateCourseCodeId,
  buildCourseUpsertPayload,
  prefillFromTemplate,
  isValidHttpUrl,
  buildAccessManagementPolicy,
  buildShopPurchasedCourseSelectionOptions,
  buildShopTierSelectionOptions,
  buildShopCustomersTableModel,
  buildContactProfileTableModel,
  filterContactProfileTableData,
  mergeContactProfilePatch,
  setActiveImpersonationProfileInSessionStorage,
  getProcessLogSourceConfigs,
  getProcessLogSeverityOptions,
  getProcessLogLimitOptions,
  filterProcessLogRows,
  buildProcessLogTableColumns,
  buildProcessLogRoleSelectionOptions,
  getAudienceDefaultFilters,
  buildAudienceMetadataOptions,
  buildAudienceCountryOptionsForLocation,
  buildAudienceCountryDivisionOptions,
  buildAudienceTableColumns,
  buildAudienceSummary,
  buildAudienceMessageVariableOptions,
  hasAudienceMessageContent,
  isContactMergeMutationSuccessful
} from "redux/actions/AdminTools";

const normalizeContactInternalId = (value) => (
  value == null ? '' : String(value).trim().toLowerCase()
);

const hasAvatarResolution = (avatarUrlMap = {}, contactInternalId) => (
  Object.prototype.hasOwnProperty.call(avatarUrlMap || {}, normalizeContactInternalId(contactInternalId))
);

const getProductManagementValue = (row = {}, keys = []) => {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && row?.[key] !== '') return row[key];
  }
  return null;
};

const getFirstCourseValue = (...values) => (
  values.find(value => value !== undefined && value !== null && value !== '')
);

const toCourseArray = (value) => (Array.isArray(value) ? value : []);

const getCourseRoleId = (course = {}) => (
  getFirstCourseValue(
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
  const normalizedRole = normalizeContactInternalId(roleId);
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

const getCourseLanguageDefinition = (languageId) => (
  langData.find(language => (
    normalizeContactInternalId(language.langId) === normalizeContactInternalId(languageId) ||
    normalizeContactInternalId(language.lang) === normalizeContactInternalId(languageId)
  ))
);

const buildContactCourseHistoryRows = (contact = {}, rawCourses = []) => {
  const contactCourses = toCourseArray(contact?.CoursesHistory || contact?.coursesHistory);
  const roleRows = toCourseArray(contact?.UserCourseRoles || contact?.userCourseRoles);
  const rawCourseById = toCourseArray(rawCourses).reduce((accumulator, course) => {
    const courseCodeId = course?.CourseCodeId || course?.courseCodeId;
    if (courseCodeId) accumulator[courseCodeId] = course;
    return accumulator;
  }, {});
  const roleByCourseId = roleRows.reduce((accumulator, roleRow) => {
    const courseCodeId = getFirstCourseValue(roleRow?.CourseCodeId, roleRow?.courseCodeId, roleRow?.courseId, roleRow?.CourseId);
    if (courseCodeId) accumulator[courseCodeId] = getCourseRoleId(roleRow);
    return accumulator;
  }, {});
  const rowSources = [
    ...contactCourses,
    ...roleRows.filter(roleRow => !contactCourses.some(course => (
      getFirstCourseValue(course?.CourseCodeId, course?.courseCodeId, course?.courseId, course?.CourseId) ===
      getFirstCourseValue(roleRow?.CourseCodeId, roleRow?.courseCodeId, roleRow?.courseId, roleRow?.CourseId)
    )))
  ];
  const seen = new Set();

  return rowSources.map((course, index) => {
    const courseCodeId = getFirstCourseValue(course?.CourseCodeId, course?.courseCodeId, course?.courseId, course?.CourseId);
    const rawCourse = rawCourseById[courseCodeId] || {};
    const details = course?.CourseDetails || course?.courseDetails || rawCourse?.CourseDetails || rawCourse?.courseDetails || {};
    const title = getFirstCourseValue(
      details?.course,
      details?.Course,
      course?.CourseTitle,
      course?.courseTitle,
      rawCourse?.CourseTitle,
      rawCourse?.courseTitle,
      courseCodeId
    );
    const startDate = getFirstCourseValue(course?.StartDate, course?.startDate, rawCourse?.StartDate, rawCourse?.startDate);
    const endDate = getFirstCourseValue(course?.EndDate, course?.endDate, rawCourse?.EndDate, rawCourse?.endDate);
    const targetLanguageId = getFirstCourseValue(course?.TargetLanguageId, course?.targetLanguageId, rawCourse?.TargetLanguageId, rawCourse?.targetLanguageId);
    const audienceLanguageId = getFirstCourseValue(
      course?.NativeLanguageId,
      course?.nativeLanguageId,
      rawCourse?.NativeLanguageId,
      rawCourse?.nativeLanguageId,
      details?.targetAudienceNativeLanguageId,
      details?.targetAudienceNativeLanguage
    );
    const imageUrl = getFirstCourseValue(
      course?.imageUrl,
      details?.imageUrl,
      details?.ImageUrl,
      details?.courseProfileImage,
      details?.courseImageUrl,
      rawCourse?.CourseDetails?.imageUrl
    );
    const roleId = getFirstCourseValue(getCourseRoleId(course), roleByCourseId[courseCodeId]);
    const key = [courseCodeId, title, startDate, endDate, roleId || index].filter(Boolean).join('|') || index;

    if (seen.has(key)) return null;
    seen.add(key);
    return { key, courseCodeId, title, imageUrl, targetLanguageId, audienceLanguageId, startDate, endDate, roleId };
  }).filter(Boolean);
};

const normalizeAwardTier = (value) => {
  const normalizedValue = normalizeContactInternalId(value);
  if (!normalizedValue) return null;
  if (normalizedValue.includes('gold')) return 'Golden';
  if (normalizedValue.includes('silver') || normalizedValue.includes('participation')) return 'Participation';
  return null;
};

const normalizeAwardCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];

  const hasAwardShape = getFirstCourseValue(
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

const getAwardCourseCodeId = (award = {}) => (
  getFirstCourseValue(
    award?.CourseCodeId,
    award?.courseCodeId,
    award?.CourseId,
    award?.courseId,
    award?.CourseCode,
    award?.courseCode
  )
);

const getAwardTier = (award = {}) => (
  normalizeAwardTier(getFirstCourseValue(
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

const getContactAwardsByCourse = (contact = {}) => {
  const rawAwards = [
    ...normalizeAwardCollection(contact?.Awards || contact?.awards),
    ...normalizeAwardCollection(contact?.CourseAwards || contact?.courseAwards),
    ...normalizeAwardCollection(contact?.Certificates || contact?.certificates),
    ...normalizeAwardCollection(contact?.CourseCertificates || contact?.courseCertificates)
  ];

  return rawAwards.reduce((accumulator, award) => {
    const courseCodeId = getAwardCourseCodeId(award);
    const awardTier = getAwardTier(award);
    if (!courseCodeId || !awardTier) return accumulator;

    const courseKey = normalizeContactInternalId(courseCodeId);
    accumulator[courseKey] = Array.from(new Set([...(accumulator[courseKey] || []), awardTier]));
    return accumulator;
  }, {});
};

const getCertificationRowsByCourse = (certificationRows = []) => (
  toCourseArray(certificationRows).reduce((accumulator, certification) => {
    const courseCodeId = getAwardCourseCodeId(certification);
    const awardTier = getAwardTier(certification);
    if (!courseCodeId || !awardTier) return accumulator;

    const courseKey = normalizeContactInternalId(courseCodeId);
    accumulator[courseKey] = [
      ...(accumulator[courseKey] || []),
      {
        ...certification,
        awardTier,
        courseCodeId,
        createdAt: getFirstCourseValue(certification?.createdAt, certification?.CreatedAt)
      }
    ];
    return accumulator;
  }, {})
);

const normalizeBooleanValue = (value, fallback = true) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (['true', 'yes', '1', 'active'].includes(normalizedValue)) return true;
    if (['false', 'no', '0', 'inactive'].includes(normalizedValue)) return false;
  }
  return value === undefined || value === null ? fallback : Boolean(value);
};

const getMeaningfulCharacterCount = (value = '') => (
  Array.from(String(value).trim()).filter((character) => (
    /[0-9]/.test(character) ||
    character.toLocaleLowerCase() !== character.toLocaleUpperCase()
  )).length
);

const normalizeContactSearchText = (value = '') => (
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9@._+-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

const getContactEmailIds = (contact = {}) => (
  Array.from(new Set([
    ...toCourseArray(contact?.Emails || contact?.emails)
      .map(email => (typeof email === 'string'
        ? email
        : getFirstCourseValue(email?.EmailId, email?.emailId, email?.email))),
    ...toCourseArray(contact?.emailList)
  ].filter(Boolean)))
);

const getContactDisplayName = (contact = {}) => (
  getFirstCourseValue(
    contact?.FullName,
    contact?.fullName,
    contact?.PersonalCommunicationName,
    contact?.personalCommunicationName,
    [
      getFirstCourseValue(contact?.Names, contact?.names),
      getFirstCourseValue(contact?.LastNames, contact?.lastNames)
    ].filter(Boolean).join(' ')
  ) || 'Unknown contact'
);

const getContactSearchDisplayValue = (contact = {}) => {
  const emailText = getContactEmailIds(contact).join(', ');
  return `${getContactDisplayName(contact)}${emailText ? ` - ${emailText}` : ''}`;
};

const getContactInternalIdValue = (contact = {}) => (
  getFirstCourseValue(contact?.ContactInternalId, contact?.contactInternalId)
);

const getContactSearchFieldValues = (contact = {}) => {
  const names = getFirstCourseValue(contact?.Names, contact?.names);
  const lastNames = getFirstCourseValue(contact?.LastNames, contact?.lastNames);
  const displayName = getContactDisplayName(contact);
  const emails = getContactEmailIds(contact);

  return [
    displayName,
    names,
    lastNames,
    [names, lastNames].filter(Boolean).join(' '),
    [lastNames, names].filter(Boolean).join(' '),
    lastNames && names ? `${lastNames}, ${names}` : '',
    getFirstCourseValue(contact?.PersonalCommunicationName, contact?.personalCommunicationName),
    getFirstCourseValue(contact?.ContactExternalId, contact?.contactExternalId),
    getContactInternalIdValue(contact),
    ...emails
  ].filter(Boolean);
};

const scoreContactSearchMatch = (contact = {}, rawQuery = '') => {
  const query = normalizeContactSearchText(rawQuery);
  if (getMeaningfulCharacterCount(query) < 2) return 0;

  const queryTokens = query.split(' ').filter(Boolean);
  const normalizedFields = getContactSearchFieldValues(contact)
    .map(normalizeContactSearchText)
    .filter(Boolean);
  const searchableText = normalizedFields.join(' ');

  if (!searchableText) return 0;
  if (normalizedFields.some(field => field === query)) return 1000;
  if (normalizedFields.some(field => field.startsWith(query))) return 900;
  if (normalizedFields.some(field => field.includes(query))) return 800;

  const hasAllTokens = queryTokens.every(token => (
    normalizedFields.some(field => field.split(' ').some(fieldToken => fieldToken.includes(token)))
  ));

  if (!hasAllTokens) return 0;

  return queryTokens.reduce((score, token) => {
    const exactTokenMatch = normalizedFields.some(field => field.split(' ').includes(token));
    const startsWithTokenMatch = normalizedFields.some(field => field.split(' ').some(fieldToken => fieldToken.startsWith(token)));
    return score + (exactTokenMatch ? 24 : startsWithTokenMatch ? 12 : 4);
  }, 500);
};

const resolveSelectableContact = (contact = {}, allEnrollees = [], avatarUrlMap = {}) => {
  const contactInternalId = getContactInternalIdValue(contact);
  const loadedContact = (allEnrollees || []).find(enrollee => (
    normalizeContactInternalId(enrollee?.ContactInternalId) === normalizeContactInternalId(contactInternalId)
  ));
  const baseContact = loadedContact || contact;
  const emailRecords = toCourseArray(baseContact?.Emails || baseContact?.emails);
  const emailList = toCourseArray(contact?.emailList);
  const normalizedEmails = emailRecords.length > 0
    ? emailRecords
    : emailList.map(emailId => ({ EmailId: emailId }));
  const resolvedContactInternalId = getContactInternalIdValue(baseContact) || contactInternalId;

  return {
    ...baseContact,
    ContactInternalId: resolvedContactInternalId,
    ContactExternalId: getFirstCourseValue(baseContact?.ContactExternalId, baseContact?.contactExternalId, contact?.contactExternalId),
    Names: getFirstCourseValue(baseContact?.Names, baseContact?.names, contact?.names),
    LastNames: getFirstCourseValue(baseContact?.LastNames, baseContact?.lastNames, contact?.lastNames),
    FullName: getContactDisplayName(baseContact),
    PersonalCommunicationName: getFirstCourseValue(
      baseContact?.PersonalCommunicationName,
      baseContact?.personalCommunicationName,
      contact?.personalCommunicationName
    ),
    Sex: getFirstCourseValue(baseContact?.Sex, baseContact?.sex, contact?.sex),
    Age: getFirstCourseValue(baseContact?.Age, baseContact?.age, contact?.age),
    IsActive: getFirstCourseValue(baseContact?.IsActive, baseContact?.isActive, contact?.isActive),
    Emails: normalizedEmails,
    Location: getFirstCourseValue(baseContact?.Location, baseContact?.location, contact?.Location, contact?.location) || {},
    CoursesHistory: toCourseArray(baseContact?.CoursesHistory || baseContact?.coursesHistory || contact?.coursesHistory),
    UserCourseRoles: toCourseArray(baseContact?.UserCourseRoles || baseContact?.userCourseRoles || contact?.userCourseRoles),
    LanguageProficienciesHistory: toCourseArray(
      baseContact?.LanguageProficienciesHistory ||
      baseContact?.languageProficienciesHistory ||
      contact?.languageProficienciesHistory
    ),
    AvatarUrl: getFirstCourseValue(
      baseContact?.AvatarUrl,
      baseContact?.avatarUrl,
      avatarUrlMap?.[normalizeContactInternalId(resolvedContactInternalId)]
    )
  };
};

const buildContactAutocompleteOption = (contact = {}, options = {}) => {
  const contactInternalId = getContactInternalIdValue(contact);
  const displayName = getContactDisplayName(contact);
  const emailText = getContactEmailIds(contact).join(', ');
  const birthCountry = getFirstCourseValue(
    contact?.Location?.BirthLocation?.CountryOfBirth,
    contact?.location?.birthLocation?.countryOfBirth,
    contact?.birthCountryAlpha3
  );

  return {
    key: contactInternalId,
    value: `${displayName}${emailText ? ` - ${emailText}` : ''}`,
    searchText: getContactSearchFieldValues(contact).join(' '),
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {birthCountry && (
          <Flag code={birthCountry} style={{ width: 20, flexShrink: 0 }} />
        )}
        <Avatar
          size={32}
          src={contact?.AvatarUrl || contact?.avatarUrl}
          icon={<UserOutlined />}
          style={{
            backgroundColor: (contact?.AvatarUrl || contact?.avatarUrl) ? 'transparent' : '#87d068',
            flexShrink: 0
          }}
        />
        <div style={{ minWidth: 0 }}>
          <strong>{displayName}</strong>
          {options.sourceLabel ? <Tag style={{ marginLeft: 6 }}>{options.sourceLabel}</Tag> : null}
          <br />
          <small style={{ color: '#888' }}>{emailText || contactInternalId}</small>
        </div>
      </div>
    )
  };
};

const GlobalAdminToolsLandingDashboard = (props) => {
  const {
    user,
    allCourses,
    allRoles,
    allEnrollees,
    allRawCourses,
    countries,
    selfLanguageLevel,
    onLoadingAdminToolsInit,
    onAssigningEnrolleeRoleToCourse,
    onRevokingCourseFacilitatorAccess,
    onLoadingGlobalUserRole,
    onAssigningGlobalRole,
    onRevokingGlobalRole,
    onClearSelectedContact,
    onUpsertingCourse,
    onLoadingContactCourseProgressActivity,
    onLoadingContactShopPurchaseHistory,
    onLoadingContactLoginFootprint,
    contactCourseProgressActivity,
    contactShopPurchaseHistory,
    contactLoginFootprint,
    onLoadingAllUserLoginFootprint,
    allUserLoginFootprint,
    onLoadingContactProfileMonitoring,
    onLoadingProcessLogEvents,
    onTogglingContactEmailOptOut,
    onTogglingContactActive,
    onTogglingSelectedContactEmailOptOut,
    onTogglingSelectedContactActive,
    contactProfileMonitoring,
    contactGlobalUserRole,
    onHydratingAdminToolAvatars,
    avatarUrlMap,
    onLoadingContactGeoMaps,
    contactGeoMaps,
    onUploadingCourseCoverImage,
    onUpsertingSelectedContactProfile,
    onLoadingShopRevenueDashboard,
    onUpsertingShopProductCourseTier,
    onUpsertingShopTiers,
    onUpsertingShopPaymentProviders,
    onStartingContactImpersonation,
    onLoadingContactSegmentMetadata,
    onLoadingContactSegmentCountryDivisions,
    onLoadingContactSegment,
    onLoadingContactCertificationHistory,
    onLoadingContactMergeDashboard,
    onPreviewingContactMerge,
    onExecutingContactMerge,
    onRollingBackContactMerge,
    onLoadingAudienceMessageVariables,
    onSendingAudienceMessage,
    shopRevenueDashboard,
    shopCoursesWithPurchases,
    processLogEventsBySource,
    contactSegmentMetadata,
    contactSegmentCountryDivisions,
    contactSegment,
    contactMergeDashboard,
    contactMergePreview,
    audienceMessageVariables,
    onRenderingCourseRegistration,
    onRequestingGeographicalDivision
  } = props;

  const [activeOuterTabKey, setActiveOuterTabKey] = useState('access');
  const [searchText, setSearchText] = useState('');
  const [advancedContactSearchOpen, setAdvancedContactSearchOpen] = useState(false);
  const [advancedContactFilters, setAdvancedContactFilters] = useState(() => ({
    ...getAudienceDefaultFilters(),
    limit: 10,
    offset: 0
  }));
  const [advancedContactSearchLoading, setAdvancedContactSearchLoading] = useState(false);
  const [advancedContactSearchResult, setAdvancedContactSearchResult] = useState(null);
  const [advancedContactCountryDivisions, setAdvancedContactCountryDivisions] = useState([]);
  const [advancedContactCountryDivisionsLoading, setAdvancedContactCountryDivisionsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [actionType, setActionType] = useState('enroll');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedRevokeCourse, setSelectedRevokeCourse] = useState(null);
  const [selectedRevokeEmail, setSelectedRevokeEmail] = useState(null);
  const [selectedRevokeGlobalRole, setSelectedRevokeGlobalRole] = useState(null);
  const [selectedContactStatusEmail, setSelectedContactStatusEmail] = useState(null);
  const [selectedImpersonationEmail, setSelectedImpersonationEmail] = useState(null);
  const [impersonationReason, setImpersonationReason] = useState('');
  const [impersonationSubmitting, setImpersonationSubmitting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revokeSubmitting, setRevokeSubmitting] = useState(false);
  const [globalRoleLoading, setGlobalRoleLoading] = useState(false);
  const [globalRevokeSubmitting, setGlobalRevokeSubmitting] = useState(false);
  const [contactStatusSubmitting, setContactStatusSubmitting] = useState({
    communication: false,
    active: false
  });
  const [contactTabKey, setContactTabKey] = useState('summary');
  const geoMaps = contactGeoMaps || { birth: null, residency: null };
  const [selectedProgressCourseId, setSelectedProgressCourseId] = useState('all');
  const [contactProgressLoading, setContactProgressLoading] = useState(false);
  const [contactCertificationHistoryLoading, setContactCertificationHistoryLoading] = useState(false);
  const [selectedContactCertificationHistory, setSelectedContactCertificationHistory] = useState(null);
  const [contactPurchaseHistoryLoading, setContactPurchaseHistoryLoading] = useState(false);
  const [contactLoginLoading, setContactLoginLoading] = useState(false);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [monitoringInnerTabKey, setMonitoringInnerTabKey] = useState('general-access');
  const [processLogSourceKey, setProcessLogSourceKey] = useState('general');
  const [processLogLoading, setProcessLogLoading] = useState(false);
  const [processLogFilters, setProcessLogFilters] = useState({
    severity: 'all',
    searchText: '',
    methodSearchText: '',
    userSearchText: '',
    role: 'all',
    dateRange: [],
    limit: 50,
    offset: 0
  });
  const [messagingInnerTabKey, setMessagingInnerTabKey] = useState('message');
  const [audienceFilters, setAudienceFilters] = useState(() => getAudienceDefaultFilters());
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [audienceMetadataLoading, setAudienceMetadataLoading] = useState(false);
  const [audienceCountryDivisionsLoading, setAudienceCountryDivisionsLoading] = useState(false);
  const [selectedAudienceRowKeys, setSelectedAudienceRowKeys] = useState([]);
  const [selectedAudienceRows, setSelectedAudienceRows] = useState([]);
  const [audienceMessageDraft, setAudienceMessageDraft] = useState({
    subject: '',
    bodyHtml: '',
    bodyText: ''
  });
  const [audienceMessageSending, setAudienceMessageSending] = useState(false);
  const [audienceCertificationLoading, setAudienceCertificationLoading] = useState(false);
  const [audienceCertificationHistory, setAudienceCertificationHistory] = useState(null);
  const [audienceCertificationFilters, setAudienceCertificationFilters] = useState({
    source: 'selected',
    courseCodeIds: [],
    certificationKeys: [],
    limit: 500,
    offset: 0
  });
  const [stewardshipInnerTabKey, setStewardshipInnerTabKey] = useState('duplicates');
  const [stewardshipLoading, setStewardshipLoading] = useState(false);
  const [stewardshipPreviewLoading, setStewardshipPreviewLoading] = useState(false);
  const [stewardshipMergeSubmitting, setStewardshipMergeSubmitting] = useState(false);
  const [stewardshipRollbackSubmittingKey, setStewardshipRollbackSubmittingKey] = useState(null);
  const [stewardshipPrimarySearchText, setStewardshipPrimarySearchText] = useState('');
  const [stewardshipSecondarySearchText, setStewardshipSecondarySearchText] = useState('');
  const [stewardshipPrimaryContact, setStewardshipPrimaryContact] = useState(null);
  const [stewardshipSecondaryContact, setStewardshipSecondaryContact] = useState(null);
  const [stewardshipMergeReason, setStewardshipMergeReason] = useState('');
  const [mergePreviewDetailTabKey, setMergePreviewDetailTabKey] = useState('actions');
  const [contactProfileSearchText, setContactProfileSearchText] = useState('');
  const [contactProfileMonitoringLoading, setContactProfileMonitoringLoading] = useState(false);
  const [selectedOptedOutEmailRowKeys, setSelectedOptedOutEmailRowKeys] = useState([]);
  const [selectedOptedOutEmailRowsByKey, setSelectedOptedOutEmailRowsByKey] = useState({});
  const [selectedInactiveProfileRowKeys, setSelectedInactiveProfileRowKeys] = useState([]);
  const [selectedInactiveProfileRows, setSelectedInactiveProfileRows] = useState([]);
  const [contactProfileTableCounts, setContactProfileTableCounts] = useState({
    optedOut: { count: null, hasGridFilters: false },
    inactive: { count: null, hasGridFilters: false },
    noEmail: { count: null, hasGridFilters: false }
  });
  const [contactProfileSubmitLoading, setContactProfileSubmitLoading] = useState({
    optedOut: false,
    inactive: false
  });
  const [revenueInnerTabKey, setRevenueInnerTabKey] = useState('overview');
  const [revenueProductTabKey, setRevenueProductTabKey] = useState('display');
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueProductSubmitting, setRevenueProductSubmitting] = useState(false);
  const [revenueProductFormValues, setRevenueProductFormValues] = useState({
    selectedProductKey: null,
    paymentProviderPriceId: '',
    courseCodeId: null,
    tierId: 'Gold',
    isActive: true
  });
  const [revenueCatalogSubmitting, setRevenueCatalogSubmitting] = useState({
    tiers: false,
    providers: false
  });
  const [revenueTierFormValues, setRevenueTierFormValues] = useState({
    selectedTierId: null,
    tierId: '',
    localizationKey: '',
    displayOrder: 0
  });
  const [revenuePaymentProviderFormValues, setRevenuePaymentProviderFormValues] = useState({
    selectedProviderId: null,
    providerId: '',
    isEnabled: true
  });
  const [revenueFilters, setRevenueFilters] = useState({
    courseCodeId: 'all',
    tierId: 'all',
    days: 30,
    limit: 100,
    searchText: '',
    dateRange: []
  });
  const [isContactProfileEditorOpen, setContactProfileEditorOpen] = useState(false);
  const [contactProfileEditorSubmitting, setContactProfileEditorSubmitting] = useState(false);

  /* ── Course Management state ── */
  const [courseSearchText, setCourseSearchText] = useState('');
  const [selectedCourseObj, setSelectedCourseObj] = useState(null);
  const [courseTabKey, setCourseTabKey] = useState('summary');
  const [courseFormValues, setCourseFormValues] = useState({});
  const [editingSections, setEditingSections] = useState({});
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [courseTemplateId, setCourseTemplateId] = useState(null);
  // 'upload' (default) or 'url' — controls how the cover image is provided when creating a course.
  const [courseImageSourceMode, setCourseImageSourceMode] = useState('upload');
  const audienceSubjectInputRef = useRef(null);
  const audienceSubjectSelectionRef = useRef({ start: 0, end: 0 });
  const audienceBodyTextAreaRef = useRef(null);
  const audienceBodySelectionRef = useRef({ start: 0, end: 0 });

  const locale = true;
  const intl = useIntl();
  const { message: messageApi } = App.useApp();
  const setLocale = (isLocaleOn, localeKey) =>
    isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  const t = useCallback((key, values) => intl.formatMessage({ id: key }, values), [intl]);
  const getSexTagColor = useCallback((sexValue) => {
    const normalizedSex = String(sexValue || '').trim().toUpperCase();
    if (normalizedSex === 'F') return 'pink';
    if (normalizedSex === 'M') return 'blue';
    return 'default';
  }, []);
  const getSexDisplayLabel = useCallback((sexValue) => {
    const normalizedSex = String(sexValue || '').trim().toUpperCase();
    if (normalizedSex === 'F') return t('admin.tools.value.sex.female');
    if (normalizedSex === 'M') return t('admin.tools.value.sex.male');
    if (normalizedSex === 'U' || normalizedSex === 'UNKNOWN') return t('admin.tools.value.sex.unknown');
    return sexValue || '—';
  }, [t]);
  const renderSexTag = useCallback((sexValue) => {
    const label = getSexDisplayLabel(sexValue);
    if (label === '—') return label;
    return <Tag color={getSexTagColor(sexValue)}>{label}</Tag>;
  }, [getSexDisplayLabel, getSexTagColor]);
  const getCourseUpsertResult = (actionResult) => actionResult?.upsertResult || actionResult || null;
  const isCourseUpsertSuccessful = (actionResult) => getCourseUpsertResult(actionResult)?.success === true;

  const emailId = user?.emailId || null;
  const accessManagementPolicy = useMemo(
    () => buildAccessManagementPolicy(user, allRoles),
    [user, allRoles]
  );
  const contactProfileMonitoringAuthorization = accessManagementPolicy.canManageContactProfiles();
  const canManageContactProfileMonitoring = contactProfileMonitoringAuthorization.isAllowed;
  const impersonationAuthorization = accessManagementPolicy.canImpersonateContacts();
  const canStartContactImpersonation = impersonationAuthorization.isAllowed;
  const revenueCourseOptions = useMemo(() => (
    buildShopPurchasedCourseSelectionOptions(
      shopCoursesWithPurchases,
      {
        allCoursesLabel: intl.formatMessage({ id: 'admin.tools.revenue.allCourses' }),
        purchasesLabel: intl.formatMessage({ id: 'admin.tools.revenue.option.purchases' }),
        buyersLabel: intl.formatMessage({ id: 'admin.tools.revenue.option.buyers' })
      }
    )
  ), [shopCoursesWithPurchases, intl]);

  const revenueShopTierRows = useMemo(() => (
    shopRevenueDashboard?.raw?.shopTiers || []
  ), [shopRevenueDashboard?.raw?.shopTiers]);
  const revenuePaymentProviderRows = useMemo(() => (
    shopRevenueDashboard?.raw?.shopPaymentProviders || []
  ), [shopRevenueDashboard?.raw?.shopPaymentProviders]);
  const revenueTierOptions = useMemo(() => {
    const tierOptions = buildShopTierSelectionOptions(revenueShopTierRows);
    const fallbackTierOptions = [
      { value: 'Gold', label: 'Gold', searchText: 'Gold' },
      { value: 'Silver', label: 'Silver', searchText: 'Silver' },
      { value: 'Free', label: 'Free', searchText: 'Free' }
    ];

    return [
      { value: 'all', label: t('admin.tools.revenue.allTiers'), searchText: t('admin.tools.revenue.allTiers') },
      ...(tierOptions.length > 0 ? tierOptions : fallbackTierOptions)
    ];
  }, [revenueShopTierRows, t]);

  const revenuePaymentProviderOptions = useMemo(() => (
    (revenuePaymentProviderRows || []).map((provider) => {
      const providerId = getProductManagementValue(provider, ['ProviderId', 'providerId']);
      return {
        value: providerId,
        label: providerId,
        searchText: providerId
      };
    }).filter(option => option.value)
  ), [revenuePaymentProviderRows]);

  const revenueProductCourseOptions = useMemo(() => (
    (allRawCourses || []).map((course) => {
      const courseCodeId = course?.CourseCodeId;
      const courseName = course?.CourseDetails?.course || courseCodeId;
      return {
        value: courseCodeId,
        label: `${courseName} - ${courseCodeId}`,
        searchText: `${courseName} ${courseCodeId}`
      };
    }).filter(option => option.value)
  ), [allRawCourses]);

  const revenueProductRows = useMemo(() => {
    const tableSources = [
      shopRevenueDashboard?.raw?.productCourseTiers,
      shopRevenueDashboard?.tables?.activeProducts?.tableData,
      shopRevenueDashboard?.tables?.productsByCourse?.tableData,
      shopRevenueDashboard?.tables?.productsByTier?.tableData
    ];
    const rowsByProductId = new Map();

    tableSources.flatMap(source => source || []).forEach((row) => {
      const paymentProviderPriceId = getProductManagementValue(row, [
        'PaymentProviderPriceId',
        'paymentProviderPriceId',
        'PaymentProviderProductId',
        'paymentProviderProductId'
      ]);
      if (!paymentProviderPriceId || rowsByProductId.has(paymentProviderPriceId)) return;

      rowsByProductId.set(paymentProviderPriceId, {
        key: paymentProviderPriceId,
        paymentProviderPriceId,
        courseCodeId: getProductManagementValue(row, ['CourseCodeId', 'courseCodeId']),
        courseName: getProductManagementValue(row, ['CourseName', 'courseName']),
        tierId: getProductManagementValue(row, ['TierId', 'tierId']) || 'Gold',
        isActive: normalizeBooleanValue(getProductManagementValue(row, ['IsProductActive', 'isProductActive', 'IsActive', 'isActive']), true)
      });
    });

    return Array.from(rowsByProductId.values());
  }, [shopRevenueDashboard]);

  const revenueProductOptions = useMemo(() => (
    revenueProductRows.map(product => ({
      value: product.key,
      searchText: [
        product.paymentProviderPriceId,
        product.courseCodeId,
        product.courseName,
        product.tierId
      ].filter(Boolean).join(' '),
      label: `${product.paymentProviderPriceId} - ${product.courseName || product.courseCodeId || product.tierId}`
    }))
  ), [revenueProductRows]);

  const revenueShopCustomersTable = useMemo(() => (
    buildShopCustomersTableModel(
      shopRevenueDashboard?.raw?.shopCustomers || [],
      revenueFilters.searchText || ''
    )
  ), [shopRevenueDashboard?.raw?.shopCustomers, revenueFilters.searchText]);

  const loadShopRevenueDashboard = useCallback((nextFilters = revenueFilters) => {
    if (!emailId || !onLoadingShopRevenueDashboard) return Promise.resolve();

    setRevenueLoading(true);
    return onLoadingShopRevenueDashboard(emailId, nextFilters)
      .finally(() => setRevenueLoading(false));
  }, [emailId, onLoadingShopRevenueDashboard, revenueFilters]);

  const updateRevenueFilters = useCallback((patch, shouldReload = false) => {
    const nextFilters = {
      ...revenueFilters,
      ...patch
    };

    setRevenueFilters(nextFilters);

    if (shouldReload) {
      loadShopRevenueDashboard(nextFilters);
    }
  }, [loadShopRevenueDashboard, revenueFilters]);

  const setRevenueProductFormField = useCallback((fieldName, value) => {
    setRevenueProductFormValues(previousValues => ({
      ...previousValues,
      [fieldName]: value
    }));
  }, []);

  const handleSelectRevenueProduct = useCallback((productKey) => {
    const product = revenueProductRows.find(item => item.key === productKey);

    setRevenueProductFormValues({
      selectedProductKey: productKey || null,
      paymentProviderPriceId: product?.paymentProviderPriceId || '',
      courseCodeId: product?.courseCodeId || null,
      tierId: product?.tierId || 'Gold',
      isActive: product?.isActive ?? true
    });
  }, [revenueProductRows]);

  const handleResetRevenueProductForm = useCallback(() => {
    setRevenueProductFormValues({
      selectedProductKey: null,
      paymentProviderPriceId: '',
      courseCodeId: null,
      tierId: 'Gold',
      isActive: true
    });
  }, []);

  const handleSelectRevenueTier = useCallback((tierId) => {
    const tier = (revenueShopTierRows || []).find(item => (
      getProductManagementValue(item, ['TierId', 'tierId']) === tierId
    ));

    setRevenueTierFormValues({
      selectedTierId: tierId || null,
      tierId: getProductManagementValue(tier, ['TierId', 'tierId']) || '',
      localizationKey: getProductManagementValue(tier, ['LocalizationKey', 'localizationKey']) || '',
      displayOrder: getProductManagementValue(tier, ['DisplayOrder', 'displayOrder']) ?? 0
    });
  }, [revenueShopTierRows]);

  const handleResetRevenueTierForm = useCallback(() => {
    setRevenueTierFormValues({
      selectedTierId: null,
      tierId: '',
      localizationKey: '',
      displayOrder: 0
    });
  }, []);

  const handleSelectRevenuePaymentProvider = useCallback((providerId) => {
    const provider = (revenuePaymentProviderRows || []).find(item => (
      getProductManagementValue(item, ['ProviderId', 'providerId']) === providerId
    ));

    setRevenuePaymentProviderFormValues({
      selectedProviderId: providerId || null,
      providerId: getProductManagementValue(provider, ['ProviderId', 'providerId']) || '',
      isEnabled: normalizeBooleanValue(getProductManagementValue(provider, ['IsEnabled', 'isEnabled']), true)
    });
  }, [revenuePaymentProviderRows]);

  const handleResetRevenuePaymentProviderForm = useCallback(() => {
    setRevenuePaymentProviderFormValues({
      selectedProviderId: null,
      providerId: '',
      isEnabled: true
    });
  }, []);

  const handleUpsertRevenueProduct = useCallback(async () => {
    if (!emailId) return;
    if (
      !revenueProductFormValues.paymentProviderPriceId ||
      !revenueProductFormValues.courseCodeId ||
      !revenueProductFormValues.tierId
    ) {
      messageApi.warning(t('admin.tools.revenue.product.required'));
      return;
    }

    setRevenueProductSubmitting(true);
    try {
      const actionResult = await onUpsertingShopProductCourseTier(emailId, revenueProductFormValues);
      const result = actionResult?.upsertResult || actionResult;
      if (!result?.success) throw new Error(result?.errorMessage || 'Product upsert failed.');

      messageApi.success(t('admin.tools.revenue.product.upsertSuccess'));
      await loadShopRevenueDashboard();
      handleResetRevenueProductForm();
    } catch (error) {
      console.error(error);
      messageApi.error(t('admin.tools.revenue.product.upsertError'));
    } finally {
      setRevenueProductSubmitting(false);
    }
  }, [
    emailId,
    loadShopRevenueDashboard,
    messageApi,
    onUpsertingShopProductCourseTier,
    handleResetRevenueProductForm,
    revenueProductFormValues,
    t
  ]);

  const handleUpsertRevenueTier = useCallback(async () => {
    if (!emailId) return;
    if (!revenueTierFormValues.tierId || !revenueTierFormValues.localizationKey) {
      messageApi.warning(t('admin.tools.revenue.tier.required'));
      return;
    }

    setRevenueCatalogSubmitting(previous => ({ ...previous, tiers: true }));
    try {
      const actionResult = await onUpsertingShopTiers(emailId, [revenueTierFormValues]);
      const result = actionResult?.upsertResult || actionResult;
      if (!result?.success) throw new Error(result?.errorMessage || 'Tier upsert failed.');

      messageApi.success(t('admin.tools.revenue.tier.upsertSuccess'));
      await loadShopRevenueDashboard();
      handleResetRevenueTierForm();
    } catch (error) {
      console.error(error);
      messageApi.error(t('admin.tools.revenue.tier.upsertError'));
    } finally {
      setRevenueCatalogSubmitting(previous => ({ ...previous, tiers: false }));
    }
  }, [
    emailId,
    loadShopRevenueDashboard,
    messageApi,
    onUpsertingShopTiers,
    handleResetRevenueTierForm,
    revenueTierFormValues,
    t
  ]);

  const handleUpsertRevenuePaymentProvider = useCallback(async () => {
    if (!emailId) return;
    if (!revenuePaymentProviderFormValues.providerId) {
      messageApi.warning(t('admin.tools.revenue.provider.required'));
      return;
    }

    setRevenueCatalogSubmitting(previous => ({ ...previous, providers: true }));
    try {
      const actionResult = await onUpsertingShopPaymentProviders(emailId, [revenuePaymentProviderFormValues]);
      const result = actionResult?.upsertResult || actionResult;
      if (!result?.success) throw new Error(result?.errorMessage || 'Payment provider upsert failed.');

      messageApi.success(t('admin.tools.revenue.provider.upsertSuccess'));
      await loadShopRevenueDashboard();
      handleResetRevenuePaymentProviderForm();
    } catch (error) {
      console.error(error);
      messageApi.error(t('admin.tools.revenue.provider.upsertError'));
    } finally {
      setRevenueCatalogSubmitting(previous => ({ ...previous, providers: false }));
    }
  }, [
    emailId,
    loadShopRevenueDashboard,
    messageApi,
    onUpsertingShopPaymentProviders,
    handleResetRevenuePaymentProviderForm,
    revenuePaymentProviderFormValues,
    t
  ]);

  const loadProcessLogs = useCallback(async (
    nextSourceKey = processLogSourceKey,
    nextFilters = processLogFilters
  ) => {
    if (!emailId) return null;

    setProcessLogLoading(true);
    try {
      return await onLoadingProcessLogEvents(emailId, nextSourceKey, nextFilters);
    } finally {
      setProcessLogLoading(false);
    }
  }, [
    emailId,
    onLoadingProcessLogEvents,
    processLogFilters,
    processLogSourceKey
  ]);

  const loadAudienceSegment = useCallback(async (nextFilters = audienceFilters) => {
    if (!emailId || !onLoadingContactSegment) return null;

    setAudienceLoading(true);
    try {
      const result = await onLoadingContactSegment(emailId, nextFilters);
      setSelectedAudienceRowKeys([]);
      setSelectedAudienceRows([]);
      return result;
    } finally {
      setAudienceLoading(false);
    }
  }, [audienceFilters, emailId, onLoadingContactSegment]);

  const loadAudienceMetadata = useCallback(async () => {
    if (!emailId || !onLoadingContactSegmentMetadata) return null;

    setAudienceMetadataLoading(true);
    try {
      return await onLoadingContactSegmentMetadata(emailId);
    } finally {
      setAudienceMetadataLoading(false);
    }
  }, [emailId, onLoadingContactSegmentMetadata]);

  const loadAudienceCountryDivisions = useCallback(async (nextFilters = audienceFilters) => {
    if (!emailId || !onLoadingContactSegmentCountryDivisions || !nextFilters.countryNameOrId) return null;

    setAudienceCountryDivisionsLoading(true);
    try {
      return await onLoadingContactSegmentCountryDivisions(emailId, nextFilters);
    } finally {
      setAudienceCountryDivisionsLoading(false);
    }
  }, [audienceFilters, emailId, onLoadingContactSegmentCountryDivisions]);

  const loadAudienceMessageVariables = useCallback(async () => {
    if (!emailId || !onLoadingAudienceMessageVariables) return null;

    return await onLoadingAudienceMessageVariables(emailId, 'audience');
  }, [emailId, onLoadingAudienceMessageVariables]);

  const updateAudienceFilter = useCallback((fieldName, value, shouldReload = false) => {
    const nextFilters = {
      ...audienceFilters,
      [fieldName]: value,
      ...(fieldName !== 'offset' ? { offset: 0 } : {})
    };

    setAudienceFilters(nextFilters);

    if (shouldReload) {
      loadAudienceSegment(nextFilters);
    }
  }, [audienceFilters, loadAudienceSegment]);

  const resetAudienceFilters = useCallback(() => {
    const defaultFilters = getAudienceDefaultFilters();
    setAudienceFilters(defaultFilters);
    loadAudienceSegment(defaultFilters);
  }, [loadAudienceSegment]);

  const updateAdvancedContactFilter = useCallback((fieldName, value) => {
    setAdvancedContactFilters(previousFilters => ({
      ...previousFilters,
      [fieldName]: value,
      ...(fieldName !== 'offset' ? { offset: 0 } : {})
    }));
  }, []);

  const resetAdvancedContactFilters = useCallback(() => {
    setAdvancedContactFilters({
      ...getAudienceDefaultFilters(),
      limit: 10,
      offset: 0
    });
    setAdvancedContactSearchResult(null);
    setAdvancedContactCountryDivisions([]);
  }, []);

  const loadAdvancedContactSearch = useCallback(async (nextFilters = advancedContactFilters) => {
    if (!emailId) return null;

    const normalizedFilters = {
      ...nextFilters,
      limit: Number(nextFilters.limit || 20),
      offset: Number(nextFilters.offset || 0)
    };

    setAdvancedContactSearchLoading(true);
    try {
      const result = await AdminToolsManager.getContactSegment(emailId, normalizedFilters);
      setAdvancedContactSearchResult(result);
      if ((result?.rows || []).length === 0) {
        messageApi.info('No matching contacts found for those filters.');
      }
      return result;
    } catch (error) {
      console.error('Failed to run advanced contact search', error);
      messageApi.error('Advanced contact search failed.');
      return null;
    } finally {
      setAdvancedContactSearchLoading(false);
    }
  }, [advancedContactFilters, emailId, messageApi]);

  const loadContactMergeDashboard = useCallback(async () => {
    if (!emailId || !onLoadingContactMergeDashboard) return null;

    setStewardshipLoading(true);
    try {
      return await onLoadingContactMergeDashboard(emailId, {
        duplicateLimit: 50,
        recentMergeLimit: 50
      });
    } finally {
      setStewardshipLoading(false);
    }
  }, [emailId, onLoadingContactMergeDashboard]);

  const handlePreviewContactMerge = useCallback(async (primaryContact, secondaryContact) => {
    const primaryContactInternalId = getContactInternalIdValue(primaryContact);
    const secondaryContactInternalId = getContactInternalIdValue(secondaryContact);

    if (!emailId || !primaryContactInternalId || !secondaryContactInternalId) {
      messageApi.warning(t('admin.tools.stewardship.msg.selectBothContacts'));
      return null;
    }

    if (normalizeContactInternalId(primaryContactInternalId) === normalizeContactInternalId(secondaryContactInternalId)) {
      messageApi.warning(t('admin.tools.stewardship.msg.sameContact'));
      return null;
    }

    setStewardshipPrimaryContact(resolveSelectableContact(primaryContact, allEnrollees, avatarUrlMap));
    setStewardshipSecondaryContact(resolveSelectableContact(secondaryContact, allEnrollees, avatarUrlMap));
    setStewardshipInnerTabKey('preview');
    setMergePreviewDetailTabKey('actions');
    setStewardshipPreviewLoading(true);

    try {
      return await onPreviewingContactMerge(emailId, primaryContactInternalId, secondaryContactInternalId);
    } finally {
      setStewardshipPreviewLoading(false);
    }
  }, [
    allEnrollees,
    avatarUrlMap,
    emailId,
    messageApi,
    onPreviewingContactMerge,
    t
  ]);

  const handleSwapStewardshipContacts = useCallback(async () => {
    if (!stewardshipPrimaryContact || !stewardshipSecondaryContact) return null;

    const nextPrimaryContact = stewardshipSecondaryContact;
    const nextSecondaryContact = stewardshipPrimaryContact;

    setStewardshipPrimarySearchText(getContactSearchDisplayValue(nextPrimaryContact));
    setStewardshipSecondarySearchText(getContactSearchDisplayValue(nextSecondaryContact));

    return handlePreviewContactMerge(nextPrimaryContact, nextSecondaryContact);
  }, [
    handlePreviewContactMerge,
    stewardshipPrimaryContact,
    stewardshipSecondaryContact
  ]);

  const handleExecuteContactMerge = useCallback(async () => {
    const primaryContactInternalId = getContactInternalIdValue(stewardshipPrimaryContact);
    const secondaryContactInternalId = getContactInternalIdValue(stewardshipSecondaryContact);
    const reason = stewardshipMergeReason.trim();

    if (!emailId || !primaryContactInternalId || !secondaryContactInternalId || !reason) {
      messageApi.warning(t('admin.tools.stewardship.msg.reasonRequired'));
      return;
    }

    setStewardshipMergeSubmitting(true);
    try {
      const actionResult = await onExecutingContactMerge(emailId, {
        primaryContactInternalId,
        secondaryContactInternalId,
        reason,
        profileOverrides: {},
        executedByContactInternalId: user?.contactInternalId || user?.ContactInternalId,
        executedByEmailId: emailId
      });
      const result = actionResult?.contactMergeResult || actionResult;

      if (!isContactMergeMutationSuccessful(result)) {
        throw new Error(result?.errorMessage || 'Contact merge failed.');
      }

      messageApi.success(t('admin.tools.stewardship.msg.mergeSuccess'));
      setStewardshipMergeReason('');
      setStewardshipSecondaryContact(null);
      setStewardshipSecondarySearchText('');
      await loadContactMergeDashboard();
      await onLoadingAdminToolsInit(emailId);
    } catch (error) {
      console.error(error);
      messageApi.error(t('admin.tools.stewardship.msg.mergeError'));
    } finally {
      setStewardshipMergeSubmitting(false);
    }
  }, [
    emailId,
    loadContactMergeDashboard,
    messageApi,
    onExecutingContactMerge,
    onLoadingAdminToolsInit,
    stewardshipMergeReason,
    stewardshipPrimaryContact,
    stewardshipSecondaryContact,
    t,
    user
  ]);

  const handleRollbackContactMerge = useCallback(async (mergeRecord) => {
    const mergeId = mergeRecord?.mergeId;
    if (!emailId || !mergeId) {
      messageApi.warning(t('admin.tools.stewardship.msg.rollbackMissing'));
      return;
    }

    setStewardshipRollbackSubmittingKey(mergeRecord.key || mergeId);
    try {
      const actionResult = await onRollingBackContactMerge(emailId, {
        mergeId,
        reason: `Rollback requested from Contact Stewardship for merge ${mergeId}`,
        executedByContactInternalId: user?.contactInternalId || user?.ContactInternalId,
        executedByEmailId: emailId
      });
      const result = actionResult?.contactMergeRollbackResult || actionResult;

      if (!isContactMergeMutationSuccessful(result)) {
        throw new Error(result?.errorMessage || 'Rollback failed.');
      }

      messageApi.success(t('admin.tools.stewardship.msg.rollbackSuccess'));
      await loadContactMergeDashboard();
      await onLoadingAdminToolsInit(emailId);
    } catch (error) {
      console.error(error);
      messageApi.error(t('admin.tools.stewardship.msg.rollbackError'));
    } finally {
      setStewardshipRollbackSubmittingKey(null);
    }
  }, [
    emailId,
    loadContactMergeDashboard,
    messageApi,
    onLoadingAdminToolsInit,
    onRollingBackContactMerge,
    t,
    user
  ]);

  const getAudienceSubjectInput = useCallback(() => (
    audienceSubjectInputRef.current?.input || audienceSubjectInputRef.current || null
  ), []);

  const saveAudienceSubjectSelection = useCallback((event) => {
    const input = event?.target || getAudienceSubjectInput();
    if (!input || typeof input.selectionStart !== 'number') return;

    audienceSubjectSelectionRef.current = {
      start: input.selectionStart,
      end: input.selectionEnd
    };
  }, [getAudienceSubjectInput]);

  const getAudienceBodyTextArea = useCallback(() => (
    audienceBodyTextAreaRef.current?.resizableTextArea?.textArea ||
    audienceBodyTextAreaRef.current?.textArea ||
    audienceBodyTextAreaRef.current ||
    null
  ), []);

  const saveAudienceBodySelection = useCallback((event) => {
    const textArea = event?.target || getAudienceBodyTextArea();
    if (!textArea || typeof textArea.selectionStart !== 'number') return;

    audienceBodySelectionRef.current = {
      start: textArea.selectionStart,
      end: textArea.selectionEnd
    };
  }, [getAudienceBodyTextArea]);

  const insertAudienceSubjectVariable = useCallback((variableToken) => {
    if (!variableToken) return;

    setAudienceMessageDraft(previousDraft => ({
      ...previousDraft,
      subject: (() => {
        const subject = previousDraft.subject || '';
        const selectionStart = Number.isFinite(audienceSubjectSelectionRef.current?.start)
          ? audienceSubjectSelectionRef.current.start
          : subject.length;
        const selectionEnd = Number.isFinite(audienceSubjectSelectionRef.current?.end)
          ? audienceSubjectSelectionRef.current.end
          : selectionStart;
        const safeStart = Math.max(0, Math.min(selectionStart, subject.length));
        const safeEnd = Math.max(safeStart, Math.min(selectionEnd, subject.length));
        const nextCursorPosition = safeStart + variableToken.length;

        audienceSubjectSelectionRef.current = {
          start: nextCursorPosition,
          end: nextCursorPosition
        };

        window.setTimeout(() => {
          const input = getAudienceSubjectInput();
          input?.focus?.();
          input?.setSelectionRange?.(nextCursorPosition, nextCursorPosition);
        }, 0);

        return `${subject.slice(0, safeStart)}${variableToken}${subject.slice(safeEnd)}`;
      })()
    }));
  }, [getAudienceSubjectInput]);

  const insertAudienceBodyVariable = useCallback((variableToken) => {
    if (!variableToken) return;

    setAudienceMessageDraft(previousDraft => ({
      ...previousDraft,
      bodyHtml: '',
      bodyText: (() => {
        const bodyText = previousDraft.bodyText || '';
        const selectionStart = Number.isFinite(audienceBodySelectionRef.current?.start)
          ? audienceBodySelectionRef.current.start
          : bodyText.length;
        const selectionEnd = Number.isFinite(audienceBodySelectionRef.current?.end)
          ? audienceBodySelectionRef.current.end
          : selectionStart;
        const safeStart = Math.max(0, Math.min(selectionStart, bodyText.length));
        const safeEnd = Math.max(safeStart, Math.min(selectionEnd, bodyText.length));
        const nextCursorPosition = safeStart + variableToken.length;

        audienceBodySelectionRef.current = {
          start: nextCursorPosition,
          end: nextCursorPosition
        };

        window.setTimeout(() => {
          const textArea = getAudienceBodyTextArea();
          textArea?.focus?.();
          textArea?.setSelectionRange?.(nextCursorPosition, nextCursorPosition);
        }, 0);

        return `${bodyText.slice(0, safeStart)}${variableToken}${bodyText.slice(safeEnd)}`;
      })()
    }));
  }, [getAudienceBodyTextArea]);

  const handleSendAudienceMessage = useCallback(async () => {
    if (!emailId || selectedAudienceRows.length === 0 || !hasAudienceMessageContent(audienceMessageDraft)) return;

    setAudienceMessageSending(true);
    try {
      const actionResult = await onSendingAudienceMessage(
        emailId,
        selectedAudienceRows,
        audienceMessageDraft
      );
      const result = actionResult?.audienceMessageSendResult || actionResult;
      if (!result?.success) throw new Error(result?.errorMessage || 'Audience message failed.');

      messageApi.success(t('admin.tools.messaging.sendSuccess'));
      setAudienceMessageDraft({ subject: '', bodyHtml: '', bodyText: '' });
    } catch (error) {
      console.error(error);
      messageApi.error(t('admin.tools.messaging.sendError'));
    } finally {
      setAudienceMessageSending(false);
    }
  }, [
    audienceMessageDraft,
    emailId,
    messageApi,
    onSendingAudienceMessage,
    selectedAudienceRows,
    t
  ]);

  const updateAudienceCertificationFilter = useCallback((fieldName, value) => {
    setAudienceCertificationFilters(previousFilters => ({
      ...previousFilters,
      [fieldName]: value
    }));
  }, []);

  const handleLoadAudienceCertificationHistory = useCallback(async () => {
    if (!emailId || !onLoadingContactCertificationHistory) return;

    const loadedAudienceRows = contactSegment?.rows || [];
    const sourceRows = audienceCertificationFilters.source === 'all'
      ? loadedAudienceRows
      : selectedAudienceRows;
    const contactInternalIds = Array.from(new Set(
      (sourceRows || [])
        .map(row => row?.contactInternalId)
        .filter(Boolean)
    ));

    if (contactInternalIds.length === 0) {
      messageApi.warning('Select recipients or load an audience before requesting certification history.');
      return;
    }

    setAudienceCertificationLoading(true);
    try {
      const action = await onLoadingContactCertificationHistory(emailId, {
        contactInternalIds,
        courseCodeIds: audienceCertificationFilters.courseCodeIds,
        certificationKeys: audienceCertificationFilters.certificationKeys,
        limit: audienceCertificationFilters.limit,
        offset: audienceCertificationFilters.offset
      });
      setAudienceCertificationHistory(action?.contactCertificationHistory || null);
    } finally {
      setAudienceCertificationLoading(false);
    }
  }, [
    audienceCertificationFilters,
    contactSegment?.rows,
    emailId,
    messageApi,
    onLoadingContactCertificationHistory,
    selectedAudienceRows
  ]);

  const handleExportAudienceCertificationHistory = useCallback(() => {
    const rows = audienceCertificationHistory?.rows || [];
    if (!rows.length) return;

    const headers = ['ContactInternalId', 'EmailId', 'CourseCodeId', 'CertificationKey', 'CertificationDescription', 'CreatedAt'];
    const escapeCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(header => escapeCsvValue(row[header] ?? row[header.charAt(0).toLowerCase() + header.slice(1)])).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certification-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [audienceCertificationHistory?.rows]);

  useEffect(() => {
    if (emailId) {
      onLoadingAdminToolsInit(emailId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailId]);

  useEffect(() => {
    if (activeOuterTabKey !== 'revenue' || !emailId || shopRevenueDashboard) return;

    loadShopRevenueDashboard();
  }, [activeOuterTabKey, emailId, shopRevenueDashboard, loadShopRevenueDashboard]);

  useEffect(() => {
    if ((countries?.length > 0 && selfLanguageLevel?.length > 0) || !onRenderingCourseRegistration) return;

    onRenderingCourseRegistration();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries?.length, selfLanguageLevel?.length]);

  useEffect(() => {
    if (selectedContact?.Emails?.length > 0) {
      setSelectedEmail(selectedContact.Emails[0].EmailId);
      setSelectedRevokeEmail(selectedContact.Emails[0].EmailId);
      setSelectedContactStatusEmail(selectedContact.Emails[0].EmailId);
    } else {
      setSelectedEmail(null);
      setSelectedRevokeEmail(null);
      setSelectedContactStatusEmail(null);
    }
    setSelectedRevokeCourse(null);
    setSelectedRevokeGlobalRole(null);
    setContactTabKey('summary');
    setSelectedProgressCourseId('all');
    setContactProgressLoading(false);
    setContactLoginLoading(false);
  }, [selectedContact]);

  useEffect(() => {
    if (!selectedContact?.ContactInternalId || !allEnrollees?.length) return;

    const refreshedSelectedContact = (allEnrollees || []).find(
      enrollee => enrollee.ContactInternalId === selectedContact.ContactInternalId
    );

    if (refreshedSelectedContact && refreshedSelectedContact !== selectedContact) {
      setSelectedContact(refreshedSelectedContact);
    }
  }, [allEnrollees, selectedContact]);

  useEffect(() => {
    if (contactTabKey === 'detailed' && selectedContact) {
      onLoadingContactGeoMaps(selectedContact);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactTabKey, selectedContact]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'monitoring' ||
      monitoringInnerTabKey !== 'general-access' ||
      !emailId ||
      allUserLoginFootprint?.emailId === emailId
    ) {
      return;
    }

    let isActive = true;
    setMonitoringLoading(true);

    onLoadingAllUserLoginFootprint(emailId)?.finally(() => {
      if (isActive) setMonitoringLoading(false);
    });

    return () => {
      isActive = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOuterTabKey, monitoringInnerTabKey, emailId, allUserLoginFootprint?.emailId]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'monitoring' ||
      monitoringInnerTabKey !== 'contact-profiles' ||
      !emailId ||
      !canManageContactProfileMonitoring ||
      contactProfileMonitoring?.emailId === emailId
    ) {
      return;
    }

    let isActive = true;
    setContactProfileMonitoringLoading(true);

    onLoadingContactProfileMonitoring(emailId)?.finally(() => {
      if (isActive) setContactProfileMonitoringLoading(false);
    });

    return () => {
      isActive = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeOuterTabKey,
    monitoringInnerTabKey,
    emailId,
    canManageContactProfileMonitoring,
    contactProfileMonitoring?.emailId
  ]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'monitoring' ||
      monitoringInnerTabKey !== 'process-logs' ||
      !emailId
    ) {
      return;
    }

    loadProcessLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOuterTabKey, monitoringInnerTabKey, emailId, processLogSourceKey]);

  useEffect(() => {
    if (activeOuterTabKey !== 'messaging' || !emailId) return;

    if (contactSegmentMetadata?.emailId !== emailId) {
      loadAudienceMetadata();
    }

    if (contactSegment?.emailId !== emailId) {
      loadAudienceSegment();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeOuterTabKey,
    emailId,
    contactSegment?.emailId,
    contactSegmentMetadata?.emailId
  ]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'stewardship' ||
      !emailId ||
      contactMergeDashboard?.emailId === emailId
    ) {
      return;
    }

    loadContactMergeDashboard();
  }, [
    activeOuterTabKey,
    contactMergeDashboard?.emailId,
    emailId,
    loadContactMergeDashboard
  ]);

  useEffect(() => {
    if (activeOuterTabKey !== 'stewardship' || !selectedContact || stewardshipPrimaryContact) return;

    setStewardshipPrimaryContact(selectedContact);
    setStewardshipPrimarySearchText(
      `${getContactDisplayName(selectedContact)}${getContactEmailIds(selectedContact)[0] ? ` - ${getContactEmailIds(selectedContact)[0]}` : ''}`
    );
  }, [activeOuterTabKey, selectedContact, stewardshipPrimaryContact]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'access' ||
      !advancedContactSearchOpen ||
      !emailId ||
      contactSegmentMetadata?.emailId === emailId
    ) {
      return;
    }

    loadAudienceMetadata();
  }, [
    activeOuterTabKey,
    advancedContactSearchOpen,
    contactSegmentMetadata?.emailId,
    emailId,
    loadAudienceMetadata
  ]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'access' ||
      !advancedContactSearchOpen ||
      !emailId ||
      advancedContactSearchResult?.emailId === emailId
    ) {
      return;
    }

    loadAdvancedContactSearch();
  }, [
    activeOuterTabKey,
    advancedContactSearchOpen,
    advancedContactSearchResult?.emailId,
    emailId,
    loadAdvancedContactSearch
  ]);

  useEffect(() => {
    if (activeOuterTabKey !== 'messaging' || !emailId) return;

    if (
      audienceMessageVariables?.emailId !== emailId ||
      audienceMessageVariables?.scope !== 'audience'
    ) {
      loadAudienceMessageVariables();
    }
  }, [
    activeOuterTabKey,
    audienceMessageVariables?.emailId,
    audienceMessageVariables?.scope,
    emailId,
    loadAudienceMessageVariables
  ]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'messaging' ||
      !emailId ||
      !audienceFilters.countryNameOrId
    ) {
      return;
    }

    loadAudienceCountryDivisions(audienceFilters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeOuterTabKey,
    emailId,
    audienceFilters.countryNameOrId,
    audienceFilters.locationType
  ]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'access' ||
      !advancedContactSearchOpen ||
      !emailId ||
      !advancedContactFilters.countryNameOrId
    ) {
      setAdvancedContactCountryDivisions([]);
      return;
    }

    let isActive = true;
    setAdvancedContactCountryDivisionsLoading(true);

    AdminToolsManager.getCountryDivisions(emailId, {
      locationType: advancedContactFilters.locationType,
      countryNameOrId: advancedContactFilters.countryNameOrId
    })
      .then((result) => {
        if (isActive) setAdvancedContactCountryDivisions(result?.rows || []);
      })
      .catch((error) => {
        console.error('Failed to load advanced contact search regions', error);
        if (isActive) setAdvancedContactCountryDivisions([]);
      })
      .finally(() => {
        if (isActive) setAdvancedContactCountryDivisionsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [
    activeOuterTabKey,
    advancedContactFilters.countryNameOrId,
    advancedContactFilters.locationType,
    advancedContactSearchOpen,
    emailId
  ]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'access' ||
      !selectedContact?.ContactInternalId ||
      !emailId
    ) {
      return;
    }

    let isActive = true;
    setGlobalRoleLoading(true);

    onLoadingGlobalUserRole(
      selectedContact.ContactInternalId,
      emailId
    )?.finally(() => {
      if (isActive) setGlobalRoleLoading(false);
    });

    return () => {
      isActive = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOuterTabKey, selectedContact?.ContactInternalId, emailId]);

  const PROFICIENCY_MAP = {
    be: { color: 'purple', key: 'admin.tools.label.proficiency.be' },
    ba: { color: 'gold', key: 'admin.tools.label.proficiency.ba' },
    in: { color: 'orange', key: 'admin.tools.label.proficiency.in' },
    ad: { color: 'green', key: 'admin.tools.label.proficiency.ad' },
    na: { color: 'blue', key: 'admin.tools.label.proficiency.na' }
  };

  /* ── Client-side search over pre-loaded enrollees ── */
  const filteredEnrollees = useMemo(() => {
    if (!searchText || getMeaningfulCharacterCount(searchText) < 2 || !allEnrollees?.length) return [];

    return allEnrollees
      .map(enrollee => ({
        enrollee,
        score: scoreContactSearchMatch(enrollee, searchText)
      }))
      .filter(result => result.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 20)
      .map(result => result.enrollee);
  }, [searchText, allEnrollees]);

  const advancedContactResultsWithAvatarUrls = useMemo(() => (
    (advancedContactSearchResult?.rows || [])
      // Same fix as buildStewardshipContactSearchOptions line 1854 — the row IS already the
      // contact, passing allEnrollees causes resolveSelectableContact to do allEnrollees.find()
      // on every iteration = O(rows × allEnrollees).
      .map(row => resolveSelectableContact(row, [], avatarUrlMap))
      .filter(contact => getContactInternalIdValue(contact))
  ), [advancedContactSearchResult?.rows, avatarUrlMap]);

  const buildStewardshipContactSearchOptions = useCallback((rawSearchText, excludedContactInternalId) => {
    if (!rawSearchText || getMeaningfulCharacterCount(rawSearchText) < 2 || !allEnrollees?.length) return [];

    return allEnrollees
      .map(enrollee => ({
        // Pass [] instead of allEnrollees — we already have the enrollee object,
        // so there is no need for resolveSelectableContact to scan allEnrollees.find()
        // again on every iteration. That was O(n²) with 242 prod contacts = 58K ops.
        enrollee: resolveSelectableContact(enrollee, [], avatarUrlMap),
        score: scoreContactSearchMatch(enrollee, rawSearchText)
      }))
      .filter(result => (
        result.score > 0 &&
        normalizeContactInternalId(result.enrollee?.ContactInternalId) !== normalizeContactInternalId(excludedContactInternalId)
      ))
      .sort((left, right) => right.score - left.score)
      .slice(0, 20)
      .map(result => buildContactAutocompleteOption(result.enrollee));
  }, [allEnrollees, avatarUrlMap]);

  const stewardshipPrimarySearchOptions = useMemo(() => (
    buildStewardshipContactSearchOptions(
      stewardshipPrimarySearchText,
      getContactInternalIdValue(stewardshipSecondaryContact)
    )
  ), [buildStewardshipContactSearchOptions, stewardshipPrimarySearchText, stewardshipSecondaryContact]);

  const stewardshipSecondarySearchOptions = useMemo(() => (
    buildStewardshipContactSearchOptions(
      stewardshipSecondarySearchText,
      getContactInternalIdValue(stewardshipPrimaryContact)
    )
  ), [buildStewardshipContactSearchOptions, stewardshipSecondarySearchText, stewardshipPrimaryContact]);

  const resolveStewardshipContactById = useCallback((contactInternalId, fallback = {}) => {
    const found = (allEnrollees || []).find(enrollee => (
      normalizeContactInternalId(enrollee?.ContactInternalId) === normalizeContactInternalId(contactInternalId)
    ));

    return resolveSelectableContact(found || fallback, allEnrollees, avatarUrlMap);
  }, [allEnrollees, avatarUrlMap]);

  const resolveCandidateContact = useCallback((candidate = {}, side = 'primary') => {
    const isPrimary = side === 'primary';
    const contactInternalId = isPrimary
      ? candidate.primaryContactInternalId
      : candidate.secondaryContactInternalId;

    return resolveStewardshipContactById(contactInternalId, {
      ContactInternalId: contactInternalId,
      FullName: isPrimary ? candidate.primaryFullName : candidate.secondaryFullName,
      DateOfBirth: isPrimary ? candidate.primaryDateOfBirth : candidate.secondaryDateOfBirth,
      Emails: [
        {
          EmailId: isPrimary ? candidate.primaryEmailId : candidate.secondaryEmailId
        }
      ].filter(email => email.EmailId)
    });
  }, [resolveStewardshipContactById]);

  const visibleContactIdsForAvatarHydration = useMemo(() => {
    const visibleIds = filteredEnrollees
      .map(enrollee => enrollee?.ContactInternalId)
      .filter(Boolean);

    advancedContactResultsWithAvatarUrls
      .map(contact => contact?.ContactInternalId)
      .filter(Boolean)
      .forEach(contactInternalId => visibleIds.push(contactInternalId));

    if (selectedContact?.ContactInternalId) {
      visibleIds.push(selectedContact.ContactInternalId);
    }

    if (stewardshipPrimaryContact?.ContactInternalId) {
      visibleIds.push(stewardshipPrimaryContact.ContactInternalId);
    }

    if (stewardshipSecondaryContact?.ContactInternalId) {
      visibleIds.push(stewardshipSecondaryContact.ContactInternalId);
    }

    return Array.from(new Set(visibleIds.map(normalizeContactInternalId).filter(Boolean)));
  }, [
    advancedContactResultsWithAvatarUrls,
    filteredEnrollees,
    selectedContact?.ContactInternalId,
    stewardshipPrimaryContact?.ContactInternalId,
    stewardshipSecondaryContact?.ContactInternalId
  ]);

  const filteredEnrolleesWithAvatarUrls = useMemo(() => (
    (filteredEnrollees || []).map((enrollee) => ({
      ...enrollee,
      AvatarUrl: enrollee?.AvatarUrl || enrollee?.avatarUrl || avatarUrlMap?.[normalizeContactInternalId(enrollee?.ContactInternalId)] || null
    }))
  ), [filteredEnrollees, avatarUrlMap]);

  const filteredEnrolleeMap = useMemo(() => (
    (filteredEnrolleesWithAvatarUrls || []).reduce((accumulator, enrollee) => {
      const contactInternalId = enrollee?.ContactInternalId;
      if (contactInternalId) {
        accumulator[contactInternalId] = enrollee;
      }
      return accumulator;
    }, {})
  ), [filteredEnrolleesWithAvatarUrls]);

  useEffect(() => {
    if (
      !['access', 'stewardship'].includes(activeOuterTabKey) ||
      !emailId ||
      !allEnrollees?.length ||
      visibleContactIdsForAvatarHydration.length === 0
    ) {
      return;
    }

    const unresolvedContactIds = visibleContactIdsForAvatarHydration.filter(
      contactInternalId => !hasAvatarResolution(avatarUrlMap, contactInternalId)
    );

    if (unresolvedContactIds.length === 0) return;

    onHydratingAdminToolAvatars(
      emailId,
      avatarUrlMap,
      allEnrollees,
      unresolvedContactIds
    );
  }, [activeOuterTabKey, emailId, allEnrollees, visibleContactIdsForAvatarHydration, avatarUrlMap, onHydratingAdminToolAvatars]);

  /* ── Course search memos (must be before early return) ── */
  const latestCourses = useMemo(() => {
    if (!allRawCourses?.length) return [];
    return [...allRawCourses]
      .sort((a, b) => new Date(b.EndDate || 0) - new Date(a.EndDate || 0))
      .slice(0, 3);
  }, [allRawCourses]);

  const filteredCourses = useMemo(() => {
    if (!courseSearchText || courseSearchText.length < 1 || !allRawCourses?.length) return latestCourses;
    const lower = courseSearchText.toLowerCase();
    return allRawCourses.filter(c =>
      (c.CourseDetails?.course || '').toLowerCase().includes(lower) ||
      (c.CourseCodeId || '').toLowerCase().includes(lower)
    ).slice(0, 20);
  }, [courseSearchText, allRawCourses, latestCourses]);

  const selectedContactCourseIds = useMemo(() => {
    if (!selectedContact) return [];

    const courseIds = [
      ...(selectedContact.CoursesHistory || []).map(c => c?.CourseCodeId),
      ...(selectedContact.UserCourseRoles || []).map(r => r?.CourseCodeId)
    ].filter(Boolean);

    return Array.from(new Set(courseIds));
  }, [selectedContact]);

  const selectedContactCourseIdsKey = selectedContactCourseIds.join('|');

  const selectedContactCourseLabels = useMemo(() => (
    selectedContactCourseIds.reduce((labels, courseCodeId) => {
      const rawCourse = (allRawCourses || []).find(c => c.CourseCodeId === courseCodeId);
      const contactCourse = (selectedContact?.CoursesHistory || []).find(c => c.CourseCodeId === courseCodeId);
      labels[courseCodeId] = rawCourse?.CourseDetails?.course || contactCourse?.CourseDetails?.course || courseCodeId;
      return labels;
    }, {})
  ), [selectedContactCourseIds, allRawCourses, selectedContact]);

  const progressCourseOptions = useMemo(() => {
    const allLabel = intl.formatMessage({ id: 'admin.tools.progress.allCourses' });

    return [
      {
        value: 'all',
        searchText: allLabel,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar size={32} icon={<BookOutlined />} style={{ flexShrink: 0, backgroundColor: '#3e82f7' }} />
            <div>
              <strong>{allLabel}</strong>
              <br />
              <small style={{ color: '#888' }}>{intl.formatMessage({ id: 'admin.tools.label.courses' })}</small>
            </div>
          </div>
        )
      },
      ...selectedContactCourseIds.map(courseCodeId => {
        const rawCourse = (allRawCourses || []).find(c => c.CourseCodeId === courseCodeId);
        const contactCourse = (selectedContact?.CoursesHistory || []).find(c => c.CourseCodeId === courseCodeId);
        const courseDetails = rawCourse?.CourseDetails || contactCourse?.CourseDetails || {};
        const courseTitle = courseDetails?.course || selectedContactCourseLabels[courseCodeId] || courseCodeId;
        const targetLanguageId = rawCourse?.TargetLanguageId || contactCourse?.TargetLanguageId;
        const langInfo = langData.find(l => l.langId === targetLanguageId);

        return {
          value: courseCodeId,
          searchText: `${courseTitle} ${courseCodeId}`,
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar size={32} src={courseDetails?.imageUrl} icon={<BookOutlined />} style={{ flexShrink: 0 }} />
              {langInfo?.icon && <Flag code={langInfo.icon} style={{ width: 20, flexShrink: 0 }} />}
              <div>
                <strong>{courseTitle}</strong>
                <br />
                <small style={{ color: '#888' }}>{courseCodeId}</small>
              </div>
            </div>
          )
        };
      })
    ];
  }, [intl, selectedContactCourseIds, selectedContactCourseLabels, allRawCourses, selectedContact]);

  useEffect(() => {
    if (
      contactTabKey !== 'detailed' ||
      !selectedContact?.ContactInternalId ||
      selectedContactCourseIds.length === 0 ||
      !emailId
    ) {
      return;
    }

    let isActive = true;
    const contactEmails = (selectedContact.Emails || []).map(e => e?.EmailId).filter(Boolean);
    setContactProgressLoading(true);

    onLoadingContactCourseProgressActivity(
      selectedContact.ContactInternalId,
      selectedContactCourseIds,
      emailId,
      contactEmails
    )?.finally(() => {
      if (isActive) setContactProgressLoading(false);
    });

    return () => {
      isActive = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactTabKey, selectedContact?.ContactInternalId, selectedContactCourseIdsKey, emailId]);

  useEffect(() => {
    if (
      contactTabKey !== 'detailed' ||
      !selectedContact?.ContactInternalId ||
      !emailId
    ) {
      return;
    }

    let isActive = true;
    setContactPurchaseHistoryLoading(true);

    onLoadingContactShopPurchaseHistory(
      selectedContact.ContactInternalId,
      emailId
    )?.finally(() => {
      if (isActive) setContactPurchaseHistoryLoading(false);
    });

    return () => {
      isActive = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactTabKey, selectedContact?.ContactInternalId, emailId]);

  useEffect(() => {
    if (
      contactTabKey !== 'detailed' ||
      !selectedContact?.ContactInternalId ||
      !emailId ||
      !onLoadingContactCertificationHistory
    ) {
      setSelectedContactCertificationHistory(null);
      return;
    }

    let isActive = true;
    setContactCertificationHistoryLoading(true);

    onLoadingContactCertificationHistory(emailId, {
      contactInternalIds: [selectedContact.ContactInternalId],
      courseCodeIds: selectedContactCourseIds,
      limit: 500,
      offset: 0
    })
      ?.then((action) => {
        if (isActive) setSelectedContactCertificationHistory(action?.contactCertificationHistory || null);
      })
      ?.finally(() => {
        if (isActive) setContactCertificationHistoryLoading(false);
      });

    return () => {
      isActive = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactTabKey, selectedContact?.ContactInternalId, selectedContactCourseIdsKey, emailId]);

  useEffect(() => {
    if (
      contactTabKey !== 'detailed' ||
      !selectedContact?.ContactInternalId ||
      !emailId
    ) {
      return;
    }

    let isActive = true;
    setContactLoginLoading(true);

    onLoadingContactLoginFootprint(
      selectedContact.ContactInternalId,
      emailId
    )?.finally(() => {
      if (isActive) setContactLoginLoading(false);
    });

    return () => {
      isActive = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactTabKey, selectedContact?.ContactInternalId, emailId]);

  const createCourseGeneratedId = useMemo(() => {
    if (!courseFormValues.course || !courseFormValues.StartDate) return '';
    const existingIds = (allRawCourses || []).map(c => c.CourseCodeId);
    return generateCourseCodeId(courseFormValues.course, courseFormValues.StartDate, existingIds);
  }, [courseFormValues.course, courseFormValues.StartDate, allRawCourses]);

  const hasRequiredCourseValue = (value) => {
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined;
  };

  const getCourseCreateValidation = () => {
    const imageUrl = typeof courseFormValues.imageUrl === 'string'
      ? courseFormValues.imageUrl.trim()
      : '';
    const hasUploadFile = !!courseFormValues._imageFile;
    const hasValidRemoteImageUrl = imageUrl.length > 0 && isValidHttpUrl(imageUrl);
    const hasInvalidImageUrl = imageUrl.length > 0 && !hasUploadFile && !hasValidRemoteImageUrl;

    const requiredFields = [
      { label: t('admin.tools.course.label.courseName'), isValid: hasRequiredCourseValue(courseFormValues.course) },
      { label: t('admin.tools.course.label.teacher'), isValid: hasRequiredCourseValue(courseFormValues.teacher) },
      { label: t('admin.tools.course.label.startDate'), isValid: hasRequiredCourseValue(courseFormValues.StartDate) },
      { label: t('admin.tools.course.label.courseWeeksLength'), isValid: Number(courseFormValues.courseWeeksLength) > 0 },
      { label: t('admin.tools.course.label.endDate'), isValid: hasRequiredCourseValue(courseFormValues.EndDate) },
      { label: t('admin.tools.course.label.nativeLanguage'), isValid: hasRequiredCourseValue(courseFormValues.NativeLanguageId) },
      { label: t('admin.tools.course.label.targetLanguage'), isValid: hasRequiredCourseValue(courseFormValues.TargetLanguageId) },
      { label: t('admin.tools.course.label.location'), isValid: hasRequiredCourseValue(courseFormValues.location) },
      { label: t('admin.tools.course.label.gatheringDay'), isValid: hasRequiredCourseValue(courseFormValues.gatheringDay) },
      { label: t('admin.tools.course.label.gatheringTime'), isValid: hasRequiredCourseValue(courseFormValues.gatheringTime) },
      { label: t('admin.tools.course.label.gatheringStartingDate'), isValid: hasRequiredCourseValue(courseFormValues.gatheringStartingDate) },
      { label: t('admin.tools.course.label.targetAudience'), isValid: hasRequiredCourseValue(courseFormValues.targetAudienceNativeLanguage) },
      { label: t('admin.tools.course.label.whatsAppLink'), isValid: hasRequiredCourseValue(courseFormValues.whatsAppLink) },
      { label: t('admin.tools.course.label.imageSource'), isValid: hasUploadFile || hasValidRemoteImageUrl }
    ];
    const missingLabels = requiredFields
      .filter(field => !field.isValid)
      .map(field => field.label);

    return {
      missingLabels,
      hasInvalidImageUrl,
      isComplete: missingLabels.length === 0 && !hasInvalidImageUrl
    };
  };

  const courseCreateValidation = getCourseCreateValidation();

  // Courses already taken by the selected contact (enrolled or with a course role).
  const selectedContactExistingCourseIds = useMemo(() => {
    if (!selectedContact) return new Set();
    const ids = [
      ...(selectedContact.CoursesHistory || []).map(c => c?.CourseCodeId),
      ...(selectedContact.UserCourseRoles || []).map(r => r?.CourseCodeId)
    ].filter(Boolean);
    return new Set(ids);
  }, [selectedContact]);

  const enrollableCourseSelectOptions = useMemo(() => {
    return (allCourses || [])
      .filter(c => c?.value && !selectedContactExistingCourseIds.has(c.value))
      .map(c => ({
        key: c.value,
        value: c.value,
        label: `${c.value} \u2014 ${c.name || c.value}`
      }));
  }, [allCourses, selectedContactExistingCourseIds]);

  // Clear the selected course whenever the role changes so a stale selection
  // can't survive when the enrollable list might also change.
  useEffect(() => {
    setSelectedCourse(null);
  }, [selectedRole]);

  const selectedOptedOutEmailRows = useMemo(
    () => selectedOptedOutEmailRowKeys
      .map(key => selectedOptedOutEmailRowsByKey[key])
      .filter(Boolean),
    [selectedOptedOutEmailRowKeys, selectedOptedOutEmailRowsByKey]
  );

  const optedOutEmailSelection = useMemo(() => ({
    selectedRowKeys: selectedOptedOutEmailRowKeys,
    preserveSelectedRowKeys: true,
    getCheckboxProps: (emailRecord) => ({
      disabled: !canManageContactProfileMonitoring || emailRecord?.hasOptedOutOfCommunication !== true
    }),
    onSelect: (emailRecord, selected) => {
      const selectionKey = emailRecord?.selectionKey;
      if (!selectionKey) return;

      setSelectedOptedOutEmailRowKeys(prev => (
        selected
          ? Array.from(new Set([...prev, selectionKey]))
          : prev.filter(key => key !== selectionKey)
      ));
      setSelectedOptedOutEmailRowsByKey(prev => {
        if (selected) {
          return { ...prev, [selectionKey]: emailRecord };
        }

        const next = { ...prev };
        delete next[selectionKey];
        return next;
      });
    },
    onSelectAll: (selected, _selectedRows, changedRows = []) => {
      const selectableRows = (changedRows || []).filter(emailRecord => (
        emailRecord?.hasOptedOutOfCommunication === true
      ));

      setSelectedOptedOutEmailRowKeys(prev => {
        const changedKeys = selectableRows.map(emailRecord => emailRecord.selectionKey).filter(Boolean);
        return selected
          ? Array.from(new Set([...prev, ...changedKeys]))
          : prev.filter(key => !changedKeys.includes(key));
      });
      setSelectedOptedOutEmailRowsByKey(prev => {
        const next = { ...prev };
        selectableRows.forEach(emailRecord => {
          if (!emailRecord?.selectionKey) return;
          if (selected) {
            next[emailRecord.selectionKey] = emailRecord;
          } else {
            delete next[emailRecord.selectionKey];
          }
        });
        return next;
      });
    }
  }), [canManageContactProfileMonitoring, selectedOptedOutEmailRowKeys]);

  const handleContactProfileInternalIdCopied = useCallback(() => {
    messageApi.success(intl.formatMessage({ id: 'admin.tools.msg.copied' }));
  }, [intl, messageApi]);
  const copyInternalIdTitle = useMemo(
    () => intl.formatMessage({ id: 'admin.tools.copyInternalId' }),
    [intl]
  );

  const optedOutContactProfileTableModel = useMemo(
    () => buildContactProfileTableModel(
      contactProfileMonitoring?.optedOutActiveContactProfiles || [],
      {
        optedOutEmailSelection,
        onCopyInternalId: handleContactProfileInternalIdCopied,
        copyInternalIdTitle
      }
    ),
    [contactProfileMonitoring?.optedOutActiveContactProfiles, optedOutEmailSelection, handleContactProfileInternalIdCopied, copyInternalIdTitle]
  );
  const inactiveContactProfileTableModel = useMemo(
    () => buildContactProfileTableModel(
      contactProfileMonitoring?.inactiveContactProfiles || [],
      {
        hideCommunicationColumns: true,
        onCopyInternalId: handleContactProfileInternalIdCopied,
        copyInternalIdTitle
      }
    ),
    [contactProfileMonitoring?.inactiveContactProfiles, handleContactProfileInternalIdCopied, copyInternalIdTitle]
  );
  const filteredOptedOutContactProfileData = useMemo(
    () => filterContactProfileTableData(
      optedOutContactProfileTableModel?.tableData || [],
      contactProfileSearchText
    ),
    [optedOutContactProfileTableModel?.tableData, contactProfileSearchText]
  );
  const filteredInactiveContactProfileData = useMemo(
    () => filterContactProfileTableData(
      inactiveContactProfileTableModel?.tableData || [],
      contactProfileSearchText
    ),
    [inactiveContactProfileTableModel?.tableData, contactProfileSearchText]
  );
  const noEmailContactProfileTableModel = useMemo(
    () => buildContactProfileTableModel(
      contactProfileMonitoring?.noEmailActiveContactProfiles || [],
      {
        onCopyInternalId: handleContactProfileInternalIdCopied,
        copyInternalIdTitle
      }
    ),
    [contactProfileMonitoring?.noEmailActiveContactProfiles, handleContactProfileInternalIdCopied, copyInternalIdTitle]
  );
  const filteredNoEmailContactProfileData = useMemo(
    () => filterContactProfileTableData(
      noEmailContactProfileTableModel?.tableData || [],
      contactProfileSearchText
    ),
    [noEmailContactProfileTableModel?.tableData, contactProfileSearchText]
  );
  const isContactProfileMonitoringStale = (
    canManageContactProfileMonitoring &&
    emailId &&
    contactProfileMonitoring?.emailId !== emailId
  );
  const isContactProfileMonitoringTableLoading = (
    contactProfileMonitoringLoading ||
    (monitoringInnerTabKey === 'contact-profiles' && isContactProfileMonitoringStale)
  );
  const activeProcessLogResult = processLogEventsBySource?.[processLogSourceKey] || null;
  const processLogRows = useMemo(
    () => activeProcessLogResult?.rows || [],
    [activeProcessLogResult?.rows]
  );
  const filteredProcessLogRows = useMemo(
    () => filterProcessLogRows(processLogRows, processLogFilters),
    [processLogRows, processLogFilters]
  );
  const processLogRoleOptions = useMemo(
    () => buildProcessLogRoleSelectionOptions(processLogRows, t('admin.tools.monitoring.processLogs.allRoles')),
    [processLogRows, t]
  );
  const handleCopyProcessLogEventData = useCallback((record) => {
    const eventDataText = record?.eventDataText || '';
    if (!eventDataText || eventDataText === '-') return;

    navigator.clipboard?.writeText(eventDataText).then(() => {
      messageApi.success(t('admin.tools.monitoring.processLogs.copiedEventData'));
    }).catch(() => {
      messageApi.error(t('admin.tools.monitoring.processLogs.copyEventDataError'));
    });
  }, [messageApi, t]);
  const processLogColumns = useMemo(
    () => buildProcessLogTableColumns({
      t,
      copyTitle: t('admin.tools.monitoring.processLogs.copyEventData'),
      onCopyEventData: handleCopyProcessLogEventData
    }),
    [handleCopyProcessLogEventData, t]
  );
  const audienceRows = useMemo(
    () => contactSegment?.rows || [],
    [contactSegment?.rows]
  );
  const audienceRowByContactId = useMemo(() => (
    (audienceRows || []).reduce((accumulator, row) => {
      if (row?.contactInternalId) accumulator[normalizeContactInternalId(row.contactInternalId)] = row;
      return accumulator;
    }, {})
  ), [audienceRows]);
  const audienceTotalCount = contactSegment?.count ?? audienceRows.length;
  const audienceMetadata = useMemo(
    () => contactSegmentMetadata?.metadata || {},
    [contactSegmentMetadata?.metadata]
  );
  const audienceOptions = useMemo(
    () => buildAudienceMetadataOptions(audienceMetadata, {
      all: t('admin.tools.messaging.option.all'),
      female: t('admin.tools.messaging.option.female'),
      male: t('admin.tools.messaging.option.male'),
      allLocations: t('admin.tools.messaging.option.allLocations'),
      residency: t('admin.tools.messaging.option.residency'),
      birth: t('admin.tools.messaging.option.birth'),
      any: t('admin.tools.messaging.option.any'),
      with: t('admin.tools.messaging.option.with'),
      without: t('admin.tools.messaging.option.without')
    }),
    [audienceMetadata, t]
  );
  const audienceCourseOptions = useMemo(() => {
    const metadataCourses = audienceOptions.courses || [];
    if (metadataCourses.length > 0) {
      return metadataCourses.map(option => ({
        ...option,
        label: option.label,
        tagLabel: option.value
      }));
    }

    return (allRawCourses || []).map((course) => {
      const courseCodeId = course?.CourseCodeId;
      const courseName = course?.CourseDetails?.course || course?.CourseName || courseCodeId;
      return {
        value: courseCodeId,
        label: `${courseName} - ${courseCodeId}`,
        tagLabel: courseCodeId,
        searchText: `${courseName} ${courseCodeId}`
      };
    }).filter(option => option.value);
  }, [allRawCourses, audienceOptions.courses]);
  const audienceCertificationKeyOptions = useMemo(() => {
    const metadataCertificateTypes = audienceOptions.certificateTypes || [];
    const fallbackOptions = [
      { value: 'GOLD', label: 'Golden', searchText: 'GOLD Gold Golden Certificate' },
      { value: 'Participation', label: 'Participation', searchText: 'Participation Silver Certificate' }
    ];

    return metadataCertificateTypes.length > 0 ? metadataCertificateTypes : fallbackOptions;
  }, [audienceOptions.certificateTypes]);
  const audienceMetadataCountryOptions = useMemo(() => {
    const metadataCountries = audienceOptions.countries || [];
    if (metadataCountries.length > 0) return metadataCountries;

    return (countries || []).map(country => ({
      value: country?.alphaKey || country?.value || country?.name,
      label: country?.nativeName || country?.name || country?.value,
      alpha3: country?.alphaKey,
      searchText: [
        country?.alphaKey,
        country?.value,
        country?.nativeName,
        country?.name
      ].filter(Boolean).join(' ')
    })).filter(option => option.value);
  }, [audienceOptions.countries, countries]);
  const renderCountrySummary = useCallback((countryName, alpha3) => (
    countryName || alpha3 ? (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {alpha3 ? <Flag code={alpha3} style={{ width: 18, height: 12, objectFit: 'cover' }} /> : null}
        <span>{countryName || alpha3}</span>
      </span>
    ) : '-'
  ), []);
  const audienceCountryOptions = useMemo(() => (
    buildAudienceCountryOptionsForLocation({
      metadataOptions: audienceMetadataCountryOptions,
      rows: audienceRows,
      locationType: audienceFilters.locationType
    }).map(option => ({
      ...option,
      label: renderCountrySummary(option.label, option.alpha3)
    }))
  ), [
    audienceFilters.locationType,
    audienceMetadataCountryOptions,
    audienceRows,
    renderCountrySummary
  ]);
  const advancedContactCountryOptions = useMemo(() => (
    buildAudienceCountryOptionsForLocation({
      metadataOptions: audienceMetadataCountryOptions,
      rows: audienceRows,
      locationType: advancedContactFilters.locationType
    }).map(option => ({
      ...option,
      label: renderCountrySummary(option.label, option.alpha3)
    }))
  ), [
    advancedContactFilters.locationType,
    audienceMetadataCountryOptions,
    audienceRows,
    renderCountrySummary
  ]);
  const audienceCountryDivisionRows = useMemo(() => {
    if (!audienceFilters.countryNameOrId) return [];
    if (contactSegmentCountryDivisions?.emailId !== emailId) return [];
    if (contactSegmentCountryDivisions?.payload?.p_countrynameorid !== audienceFilters.countryNameOrId) return [];
    if (
      (contactSegmentCountryDivisions?.payload?.p_locationtype || 'all') !==
      (audienceFilters.locationType || 'all')
    ) {
      return [];
    }

    return contactSegmentCountryDivisions?.rows || [];
  }, [
    audienceFilters.countryNameOrId,
    audienceFilters.locationType,
    contactSegmentCountryDivisions?.emailId,
    contactSegmentCountryDivisions?.payload?.p_countrynameorid,
    contactSegmentCountryDivisions?.payload?.p_locationtype,
    contactSegmentCountryDivisions?.rows,
    emailId
  ]);
  const audienceRegionOptions = useMemo(() => (
    buildAudienceCountryDivisionOptions(
      audienceCountryDivisionRows,
      t('admin.tools.messaging.regionNotAvailable')
    )
  ), [audienceCountryDivisionRows, t]);
  const advancedContactRegionOptions = useMemo(() => (
    buildAudienceCountryDivisionOptions(
      advancedContactCountryDivisions,
      t('admin.tools.messaging.regionNotAvailable')
    )
  ), [advancedContactCountryDivisions, t]);
  const audienceDisplayCount = audienceTotalCount;
  const getAudienceLanguageLevelLabel = useCallback((level) => {
    const normalizedLevel = String(level || '').trim().toLowerCase();
    if (!normalizedLevel) return '';
    const proficiencyKeyByLevel = {
      be: 'admin.tools.label.proficiency.be',
      ba: 'admin.tools.label.proficiency.ba',
      in: 'admin.tools.label.proficiency.in',
      ad: 'admin.tools.label.proficiency.ad',
      na: 'admin.tools.label.proficiency.na'
    };
    const proficiencyKey = proficiencyKeyByLevel[normalizedLevel];
    return proficiencyKey ? t(proficiencyKey) : normalizedLevel;
  }, [t]);
  const audienceLanguageOptions = useMemo(() => {
    const metadataLanguages = audienceOptions.languages || [];
    const fallbackLanguages = langData.map(language => ({
      value: language.langId,
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Flag code={language.icon} style={{ width: 18, height: 12, objectFit: 'cover' }} />
          <span>{language.langName}</span>
        </span>
      ),
      searchText: [language.langName, language.langId, language.lang].filter(Boolean).join(' ')
    }));

    return metadataLanguages.length > 0 ? metadataLanguages : fallbackLanguages;
  }, [audienceOptions.languages]);
  const audienceLanguageLevelOptions = useMemo(() => (
    (
      (audienceOptions.languageLevels || []).length > 0
        ? audienceOptions.languageLevels
        : (selfLanguageLevel || []).map(level => ({
          value: level?.LevelAbbreviation,
          label: level?.LocalizationKey ? t(level.LocalizationKey) : level?.LevelAbbreviation,
          searchText: [level?.LevelAbbreviation, level?.LocalizationKey ? t(level.LocalizationKey) : null].filter(Boolean).join(' ')
        })).filter(option => option.value)
    ).map(option => ({
      ...option,
      label: getAudienceLanguageLevelLabel(option.value) || option.label,
      searchText: [
        option.searchText,
        getAudienceLanguageLevelLabel(option.value),
        option.value
      ].filter(Boolean).join(' ')
    }))
  ), [audienceOptions.languageLevels, getAudienceLanguageLevelLabel, selfLanguageLevel, t]);
  const renderAudienceCourseTag = useCallback((tagProps) => {
    const { value, closable, onClose } = tagProps;
    return (
      <Tag
        closable={closable}
        onClose={onClose}
        style={{
          marginRight: 3,
          maxWidth: 240,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          verticalAlign: 'middle'
        }}
      >
        {value}
      </Tag>
    );
  }, []);
  const handleCopyAudienceInternalId = useCallback((contactInternalId) => {
    if (!contactInternalId) return;
    navigator.clipboard?.writeText(contactInternalId).then(() => {
      messageApi.success(t('admin.tools.msg.copied'));
    }).catch(() => {
      messageApi.error(t('admin.tools.messaging.copyError'));
    });
  }, [messageApi, t]);
  const audienceColumns = useMemo(
    () => buildAudienceTableColumns({
      t,
      copyTitle: t('admin.tools.copyInternalId'),
      onCopyInternalId: handleCopyAudienceInternalId,
      renderCountrySummary,
      getLanguageLevelLabel: getAudienceLanguageLevelLabel
    }),
    [getAudienceLanguageLevelLabel, handleCopyAudienceInternalId, renderCountrySummary, t]
  );
  const audienceSummary = useMemo(
    () => buildAudienceSummary(audienceRows, selectedAudienceRows),
    [audienceRows, selectedAudienceRows]
  );
  const audienceMessageVariableOptions = useMemo(
    () => buildAudienceMessageVariableOptions(audienceMessageVariables, 'audience'),
    [audienceMessageVariables]
  );
  const hasAudienceMessageDraftContent = hasAudienceMessageContent(audienceMessageDraft);
  const canSendAudienceMessage = (
    selectedAudienceRows.length > 0 &&
    hasAudienceMessageDraftContent
  );
  const audienceMessageSendDisabledHint = selectedAudienceRows.length === 0
    ? t('admin.tools.messaging.chooseAudienceHint')
    : !hasAudienceMessageDraftContent
      ? t('admin.tools.messaging.writeMessageHint')
      : '';

  useEffect(() => {
    setContactProfileTableCounts({
      optedOut: { count: null, hasGridFilters: false },
      inactive: { count: null, hasGridFilters: false }
    });
  }, [contactProfileSearchText]);

  const isContactProfileSearchActive = contactProfileSearchText.trim().length > 0;
  const getContactProfileFilteredCount = (tableKey, filteredRows = [], options = {}) => {
    const tableCountState = contactProfileTableCounts[tableKey] || {};
    if (tableCountState.hasGridFilters) {
      return tableCountState.count ?? 0;
    }

    if (isContactProfileSearchActive) {
      return filteredRows.length;
    }

    return options.showDefaultTotal ? filteredRows.length : null;
  };
  const getContactProfileCountSuffix = (count) => (
    count == null ? '' : ` (${count})`
  );
  const handleContactProfileTableChange = (tableKey) => (_pagination, filters, _sorter, extra = {}) => {
    const hasGridFilters = Object.values(filters || {}).some(value => (
      Array.isArray(value) ? value.length > 0 : value != null
    ));

    setContactProfileTableCounts(prev => ({
      ...prev,
      [tableKey]: {
        hasGridFilters,
        count: hasGridFilters ? (extra?.currentDataSource || []).length : null
      }
    }));
  };

  const renderSquarePreviewImage = (src, alt, icon, size = 160, backgroundColor = '#87d068') => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: src ? 'transparent' : '#f5f5f5'
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          fallback="data:image/png;"
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <Avatar
          shape="square"
          size={size}
          icon={icon}
          style={{ backgroundColor }}
        />
      )}
    </div>
  );

  const searchOptions = filteredEnrolleesWithAvatarUrls.map(e => ({
    key: e.ContactInternalId,
    value: `${e.FullName || `${e.Names} ${e.LastNames}`} — ${e.Emails?.[0]?.EmailId || ''}`,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {e?.Location?.BirthLocation?.CountryOfBirth && (
          <Flag code={e.Location.BirthLocation.CountryOfBirth} style={{ width: 20, flexShrink: 0 }} />
        )}
        <Avatar size={32} src={e?.AvatarUrl || e?.avatarUrl} icon={<UserOutlined />} style={{ backgroundColor: (e?.AvatarUrl || e?.avatarUrl) ? 'transparent' : '#87d068', flexShrink: 0 }} />
        <div>
          <strong>{e.FullName || `${e.Names} ${e.LastNames}`}</strong>
          <br />
          <small style={{ color: '#888' }}>{(e.Emails || []).map(em => em.EmailId).join(', ')}</small>
        </div>
      </div>
    ),
  }));

    const formatDateOnly = (date) => {
    if (!date) return '—';

    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [year, month, day] = date.slice(0, 10).split('-');
      return `${month}/${day}/${year}`;
    }

    return date;
  };
  const handleSearchChange = (value) => setSearchText(value);

  const handleContactSelect = (value, option) => {
    const found = filteredEnrolleeMap?.[option.key] || (allEnrollees || []).find(e => e.ContactInternalId === option.key);
    setSelectedContact(found ? resolveSelectableContact(found, allEnrollees, avatarUrlMap) : null);
  };

  const handleAdvancedContactRowSelect = (row = {}) => {
    const contactInternalId = row?.contactInternalId || row?.ContactInternalId;
    const found = advancedContactResultsWithAvatarUrls.find(contact => (
      normalizeContactInternalId(contact?.ContactInternalId) === normalizeContactInternalId(contactInternalId)
    ));
    const resolvedContact = found || resolveSelectableContact(row, allEnrollees, avatarUrlMap);
    const displayName = getContactDisplayName(resolvedContact);
    const firstEmailId = getContactEmailIds(resolvedContact)[0];

    setSelectedContact(resolvedContact);
    setSearchText(`${displayName}${firstEmailId ? ` - ${firstEmailId}` : ''}`);
    setAdvancedContactSearchOpen(false);
  };

  const handleClearContact = () => {
    onClearSelectedContact();
    setSelectedContact(null);
    setSearchText('');
    setSelectedCourse(null);
    setSelectedRole(null);
    setSelectedEmail(null);
    setSelectedRevokeCourse(null);
    setSelectedRevokeEmail(null);
    setSelectedRevokeGlobalRole(null);
    setSelectedContactStatusEmail(null);
    setSelectedImpersonationEmail(null);
    setImpersonationReason('');
    setImpersonationSubmitting(false);
    setContactTabKey('summary');
  };

  const refreshAdminToolsDataAndSelectedContact = async () => {
    if (!emailId || !selectedContact?.ContactInternalId) return null;

    const initAction = await onLoadingAdminToolsInit(emailId);
    const refreshedContact = (initAction?.allEnrollees || []).find(
      enrollee => enrollee?.ContactInternalId === selectedContact.ContactInternalId
    );

    if (refreshedContact) {
      setSelectedContact(refreshedContact);
      return refreshedContact;
    }

    return null;
  };

  const refreshGlobalUserRoleForSelectedContact = async () => {
    if (!emailId || !selectedContact?.ContactInternalId) return null;
    return onLoadingGlobalUserRole(selectedContact.ContactInternalId, emailId);
  };

  const refreshContactProfileMonitoring = async () => {
    if (!emailId || !canManageContactProfileMonitoring) return null;

    setContactProfileMonitoringLoading(true);
    try {
      return await onLoadingContactProfileMonitoring(emailId);
    } finally {
      setContactProfileMonitoringLoading(false);
    }
  };

  const patchSelectedContactEmailOptOut = (targetEmailId, hasOptedOutOfCommunication) => {
    const patchEmails = (emails = []) => (emails || []).map(emailRecord => (
      (emailRecord?.EmailId || emailRecord?.emailId) === targetEmailId
        ? { ...emailRecord, HasOptedOutOfCommunication: hasOptedOutOfCommunication, hasOptedOutOfCommunication }
        : emailRecord
    ));

    setSelectedContact(prev => prev ? ({
      ...prev,
      ...(Array.isArray(prev.Emails) ? { Emails: patchEmails(prev.Emails) } : {}),
      ...(Array.isArray(prev.emails) ? { emails: patchEmails(prev.emails) } : {})
    }) : prev);
  };

  const patchSelectedContactActive = (targetContactInternalId, isActive) => {
    setSelectedContact(prev => (
      prev?.ContactInternalId === targetContactInternalId
        ? {
          ...prev,
          IsActive: isActive,
          isActive
        }
        : prev
    ));
  };

  const handleSubmitSelectedContactProfileUpdate = async (profileUpdate) => {
    if (!selectedContact?.ContactInternalId) {
      messageApi.warning(t('admin.tools.msg.selectContactFirst'));
      return;
    }

    if (!canManageContactProfileMonitoring) {
      messageApi.warning(t(contactProfileMonitoringAuthorization.reasonKey || 'admin.tools.msg.notEnoughContactProfileMonitoringPermissions'));
      return;
    }

    setContactProfileEditorSubmitting(true);
    try {
      const actionResult = await onUpsertingSelectedContactProfile(profileUpdate, emailId);
      const upsertResult = actionResult?.upsertResult || actionResult;

      if (upsertResult?.success === true) {
        const patch = upsertResult?.contactProfilePatch || actionResult?.contactProfilePatch || profileUpdate?.patch;
        if (patch) {
          setSelectedContact(prev => mergeContactProfilePatch(prev, patch));
        }
        messageApi.success(t('admin.tools.profileEditor.saveSuccess'));
        setContactProfileEditorOpen(false);
        if (contactTabKey === 'detailed') {
          onLoadingContactGeoMaps(mergeContactProfilePatch(selectedContact, patch));
        }
      } else {
        messageApi.error(t('admin.tools.profileEditor.saveError'));
      }
    } catch (error) {
      console.error('Error saving selected contact profile:', error);
      messageApi.error(t('admin.tools.profileEditor.saveError'));
    } finally {
      setContactProfileEditorSubmitting(false);
    }
  };

  const handleManualRefreshContactProfileMonitoring = async () => {
    await refreshContactProfileMonitoring();
    messageApi.success(t('admin.tools.monitoring.msg.refreshSuccess'));
  };

  const isToggleResultSuccessful = (actionResult) => {
    const result = actionResult?.toggleResult ?? actionResult;
    if (result === true) return true;
    if (!result) return false;
    if (Array.isArray(result)) return true;
    if (result?.success === false || result?.Success === false) return false;
    return result?.success === true || result?.Success === true || typeof result === 'object';
  };

  const handleRestoreSelectedCommunication = async () => {
    if (!canManageContactProfileMonitoring) {
      messageApi.warning(t(contactProfileMonitoringAuthorization.reasonKey || 'admin.tools.msg.notEnoughContactProfileMonitoringPermissions'));
      return;
    }
    if (!selectedOptedOutEmailRows.length) {
      messageApi.warning(t('admin.tools.monitoring.msg.selectOptedOutContacts'));
      return;
    }

    setContactProfileSubmitLoading(prev => ({ ...prev, optedOut: true }));
    try {
      const actionResult = await onTogglingContactEmailOptOut(
        selectedOptedOutEmailRows,
        emailId
      );

      if (isToggleResultSuccessful(actionResult)) {
        messageApi.success(t('admin.tools.monitoring.msg.restoreCommunicationSuccess'));
        setSelectedOptedOutEmailRowKeys([]);
        setSelectedOptedOutEmailRowsByKey({});
        (selectedOptedOutEmailRows || [])
          .filter(row => row?.contactInternalId === selectedContact?.ContactInternalId)
          .forEach(row => patchSelectedContactEmailOptOut(row.emailId, false));
        await refreshContactProfileMonitoring();
      } else {
        messageApi.error(t('admin.tools.monitoring.msg.restoreCommunicationError'));
      }
    } catch (error) {
      console.error('Error restoring contact communication:', error);
      messageApi.error(t('admin.tools.monitoring.msg.restoreCommunicationError'));
    } finally {
      setContactProfileSubmitLoading(prev => ({ ...prev, optedOut: false }));
    }
  };

  const handleReactivateSelectedContacts = async () => {
    if (!canManageContactProfileMonitoring) {
      messageApi.warning(t(contactProfileMonitoringAuthorization.reasonKey || 'admin.tools.msg.notEnoughContactProfileMonitoringPermissions'));
      return;
    }
    if (!selectedInactiveProfileRows.length) {
      messageApi.warning(t('admin.tools.monitoring.msg.selectInactiveContacts'));
      return;
    }

    setContactProfileSubmitLoading(prev => ({ ...prev, inactive: true }));
    try {
      const actionResult = await onTogglingContactActive(
        selectedInactiveProfileRows,
        emailId
      );

      if (isToggleResultSuccessful(actionResult)) {
        messageApi.success(t('admin.tools.monitoring.msg.reactivateContactsSuccess'));
        setSelectedInactiveProfileRowKeys([]);
        setSelectedInactiveProfileRows([]);
        if ((selectedInactiveProfileRows || []).some(row => row?.contactInternalId === selectedContact?.ContactInternalId)) {
          patchSelectedContactActive(selectedContact.ContactInternalId, true);
        }
        await refreshContactProfileMonitoring();
      } else {
        messageApi.error(t('admin.tools.monitoring.msg.reactivateContactsError'));
      }
    } catch (error) {
      console.error('Error reactivating contact profiles:', error);
      messageApi.error(t('admin.tools.monitoring.msg.reactivateContactsError'));
    } finally {
      setContactProfileSubmitLoading(prev => ({ ...prev, inactive: false }));
    }
  };

  const handleToggleSelectedContactEmailCommunication = async () => {
    if (!selectedContact?.ContactInternalId) {
      messageApi.warning(t('admin.tools.msg.selectContactFirst'));
      return;
    }
    if (!canManageContactProfileMonitoring) {
      messageApi.warning(t(contactProfileMonitoringAuthorization.reasonKey || 'admin.tools.msg.notEnoughContactProfileMonitoringPermissions'));
      return;
    }
    if (!activeContactStatusEmail) {
      messageApi.warning(t('admin.tools.msg.selectEmail'));
      return;
    }
    setContactStatusSubmitting(prev => ({ ...prev, communication: true }));
    try {
      const actionResult = await onTogglingSelectedContactEmailOptOut(
        selectedContact.ContactInternalId,
        activeContactStatusEmail,
        emailId,
        !isSelectedContactStatusEmailOptedOut
      );

      if (isToggleResultSuccessful(actionResult)) {
        messageApi.success(t(isSelectedContactStatusEmailOptedOut
          ? 'admin.tools.monitoring.msg.restoreCommunicationSuccess'
          : 'admin.tools.msg.optOutCommunicationSuccess'));
        patchSelectedContactEmailOptOut(activeContactStatusEmail, !isSelectedContactStatusEmailOptedOut);
        await refreshContactProfileMonitoring();
      } else {
        messageApi.error(t(isSelectedContactStatusEmailOptedOut
          ? 'admin.tools.monitoring.msg.restoreCommunicationError'
          : 'admin.tools.msg.optOutCommunicationError'));
      }
    } catch (error) {
      console.error('Error toggling contact communication:', error);
      messageApi.error(t(isSelectedContactStatusEmailOptedOut
        ? 'admin.tools.monitoring.msg.restoreCommunicationError'
        : 'admin.tools.msg.optOutCommunicationError'));
    } finally {
      setContactStatusSubmitting(prev => ({ ...prev, communication: false }));
    }
  };

  const handleSetSelectedContactInactive = async () => {
    if (!selectedContact?.ContactInternalId) {
      messageApi.warning(t('admin.tools.msg.selectContactFirst'));
      return;
    }
    if (!canManageContactProfileMonitoring) {
      messageApi.warning(t(contactProfileMonitoringAuthorization.reasonKey || 'admin.tools.msg.notEnoughContactProfileMonitoringPermissions'));
      return;
    }
    if (!isSelectedContactActive) {
      messageApi.info(t('admin.tools.msg.contactAlreadyInactive'));
      return;
    }

    setContactStatusSubmitting(prev => ({ ...prev, active: true }));
    try {
      const actionResult = await onTogglingSelectedContactActive(
        selectedContact.ContactInternalId,
        emailId,
        false
      );

      if (isToggleResultSuccessful(actionResult)) {
        messageApi.success(t('admin.tools.msg.setContactInactiveSuccess'));
        patchSelectedContactActive(selectedContact.ContactInternalId, false);
        await refreshContactProfileMonitoring();
      } else {
        messageApi.error(t('admin.tools.msg.setContactInactiveError'));
      }
    } catch (error) {
      console.error('Error setting contact inactive:', error);
      messageApi.error(t('admin.tools.msg.setContactInactiveError'));
    } finally {
      setContactStatusSubmitting(prev => ({ ...prev, active: false }));
    }
  };

  const handleStartContactImpersonation = async () => {
    if (!selectedContact?.ContactInternalId) {
      messageApi.warning(t('admin.tools.msg.selectContactFirst'));
      return;
    }
    if (!activeImpersonationEmail) {
      messageApi.warning(t('admin.tools.msg.selectEmail'));
      return;
    }
    if (!isImpersonationReasonValid) {
      messageApi.warning(t('admin.tools.impersonation.reasonMinimum'));
      return;
    }
    if (!canStartContactImpersonation) {
      messageApi.warning(t(impersonationAuthorization.reasonKey || 'admin.tools.msg.notEnoughImpersonationPermissions'));
      return;
    }

    let impersonationWindow = null;
    setImpersonationSubmitting(true);
    try {
      impersonationWindow = window.open('about:blank', '_blank');

      if (!impersonationWindow) {
        messageApi.error(t('admin.tools.impersonation.popupBlocked'));
        return;
      }

      try {
        impersonationWindow.document.title = 'Titulino';
        impersonationWindow.document.body.innerHTML = '<p>Starting Titulino impersonation...</p>';
      } catch (windowPrepError) {
        // The session handoff below is the important part; the loading text is only a nicety.
      }

      const actionResult = await onStartingContactImpersonation({
        contactInternalId: selectedContact.ContactInternalId,
        selectedEmail: activeImpersonationEmail,
        reason: activeImpersonationReason,
        adminEmailId: emailId
      });
      const result = actionResult?.impersonationResult || actionResult;

      if (!result?.success) {
        impersonationWindow.close();
        if (result?.status === 403) {
          messageApi.error(t('admin.tools.impersonation.permissionError'));
        } else if (result?.status === 409) {
          messageApi.error(t('admin.tools.impersonation.alreadyImpersonating'));
        } else {
          messageApi.error(result?.errorMessage || t('admin.tools.impersonation.startError'));
        }
        return;
      }

      const launchId = result?.impersonationSessionId || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const launchUrl = `${window.location.origin}${APP_PREFIX_PATH}/impersonate?source=session&launchId=${encodeURIComponent(launchId)}`;

      const stagedUserProfile = setActiveImpersonationProfileInSessionStorage(
        impersonationWindow.sessionStorage,
        result.userProfile
      );

      if (!stagedUserProfile?.emailId || !stagedUserProfile?.innerToken) {
        impersonationWindow.close();
        messageApi.error(t('admin.tools.impersonation.startError'));
        return;
      }

      if (env.ENVIROMENT !== 'prod') {
        console.log('[GlobalAdminToolsLandingDashboard] impersonation session handoff', {
          launchUrl,
          launchId,
          emailId: stagedUserProfile.emailId,
          contactInternalId: stagedUserProfile.contactInternalId,
          hasInnerToken: !!stagedUserProfile.innerToken
        });
      }

      try {
        impersonationWindow.opener = null;
      } catch (openerError) {
        // Some browsers do not allow clearing opener on about:blank windows.
      }

      impersonationWindow.location.replace(launchUrl);
      messageApi.success(t('admin.tools.impersonation.startSuccess'));
    } catch (error) {
      if (impersonationWindow && !impersonationWindow.closed) {
        impersonationWindow.close();
      }
      console.error('Error starting impersonation:', error);
      messageApi.error(t('admin.tools.impersonation.startError'));
    } finally {
      setImpersonationSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedContact) {
      messageApi.warning(t('admin.tools.msg.selectContactFirst'));
      return;
    }

    setSubmitting(true);
    try {
      if (actionType === 'enroll') {
        if (!selectedCourse || !selectedRole) {
          messageApi.warning(t('admin.tools.msg.selectCourseAndRole'));
          setSubmitting(false);
          return;
        }
        await onAssigningEnrolleeRoleToCourse(
          selectedContact.ContactInternalId,
          selectedCourse,
          selectedRole,
          selectedEmail,
          emailId
        );
        messageApi.success(t('admin.tools.msg.roleToCourseSuccess'));
        await refreshAdminToolsDataAndSelectedContact();
      } else {
        if (!selectedRole) {
          messageApi.warning(t('admin.tools.msg.selectRole'));
          setSubmitting(false);
          return;
        }
        await onAssigningGlobalRole(
          selectedContact.ContactInternalId,
          selectedRole,
          emailId
        );
        messageApi.success(t('admin.tools.msg.globalRoleSuccess'));
        await refreshAdminToolsDataAndSelectedContact();
        await refreshGlobalUserRoleForSelectedContact();
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      messageApi.error(t('admin.tools.msg.assignError'));
    }
    setSubmitting(false);
  };

  const handleRevokeFacilitatorAccess = async () => {
    if (!selectedContact) {
      messageApi.warning(t('admin.tools.msg.selectContactFirst'));
      return;
    }
    if (!selectedRevokeCourse || !activeRevokeEmail) {
      messageApi.warning(t('admin.tools.msg.selectCourseAndEmail'));
      return;
    }

    setRevokeSubmitting(true);
    try {
      await onRevokingCourseFacilitatorAccess(
        selectedContact.ContactInternalId,
        selectedRevokeCourse,
        activeRevokeEmail,
        emailId,
        userCourseRoleId
      );
      messageApi.success(t('admin.tools.msg.revokeAccessSuccess'));
      setSelectedRevokeCourse(null);
      await refreshAdminToolsDataAndSelectedContact();
    } catch (error) {
      console.error('Error revoking facilitator access:', error);
      messageApi.error(t('admin.tools.msg.revokeAccessError'));
    }
    setRevokeSubmitting(false);
  };

  const handleRevokeGlobalRoleAccess = async () => {
    if (!selectedContact) {
      messageApi.warning(t('admin.tools.msg.selectContactFirst'));
      return;
    }
    if (!activeRevokeGlobalRole) {
      messageApi.warning(t('admin.tools.msg.selectRole'));
      return;
    }

    setGlobalRevokeSubmitting(true);
    try {
      await onRevokingGlobalRole(
        selectedContact.ContactInternalId,
        activeRevokeGlobalRole,
        emailId
      );
      messageApi.success(t('admin.tools.msg.revokeGlobalAccessSuccess'));
      setSelectedRevokeGlobalRole(null);
      await refreshAdminToolsDataAndSelectedContact();
      await refreshGlobalUserRoleForSelectedContact();
    } catch (error) {
      console.error('Error revoking global access:', error);
      messageApi.error(t('admin.tools.msg.revokeGlobalAccessError'));
    }
    setGlobalRevokeSubmitting(false);
  };

  // Course role dropdown is intentionally limited to Facilitator and User.
  const ENROLL_ROLE_LOCALIZATION_KEYS = ['titulino.facilitator', 'titulino.user'];

  const roleSelectOptions = (allRoles || []).slice().sort((a, b) => (a.UserRolePriority ?? 999) - (b.UserRolePriority ?? 999)).map(r => ({
    key: r.UserRoleId,
    value: r.UserRoleId,
    label: r.LocalizationKey ? t(r.LocalizationKey) : r.UserRoleId,
    isGlobal: !!r.IsGlobalAccessUserRole,
    localizationKey: r.LocalizationKey || ''
  }));

  const courseRoleOptions = roleSelectOptions.filter(r =>
    !r.isGlobal && ENROLL_ROLE_LOCALIZATION_KEYS.includes((r.localizationKey || '').toLowerCase())
  );
  const globalRoleOptions = roleSelectOptions.filter(r => r.isGlobal);
  const facilitatorRoleOption = courseRoleOptions.find(r => (r.localizationKey || '').toLowerCase() === 'titulino.facilitator');
  const facilitatorRoleId = facilitatorRoleOption?.value || 'titulino_facilitator';
  const userCourseRoleOption = courseRoleOptions.find(r => (r.localizationKey || '').toLowerCase() === 'titulino.user');
  const userCourseRoleId = userCourseRoleOption?.value || 'titulino_user';
  const selectedAssignAccessScope = actionType === 'global' ? 'global' : 'course';
  const selectedAssignAccessAuthorization = selectedRole
    ? accessManagementPolicy.canManageRole(selectedRole, selectedAssignAccessScope)
    : { isAllowed: true, reasonKey: null };
  const canManageAnySelectedAccessScope = accessManagementPolicy.canManageAnyRole(selectedAssignAccessScope);
  const canAssignSelectedAccess = selectedRole
    ? selectedAssignAccessAuthorization.isAllowed
    : canManageAnySelectedAccessScope;
  const shouldShowAssignAccessPermissionWarning = !canManageAnySelectedAccessScope || (selectedRole && !canAssignSelectedAccess);
  const revokeCourseAccessAuthorization = accessManagementPolicy.canManageRole(facilitatorRoleId, 'course');
  const canRevokeCourseAccess = revokeCourseAccessAuthorization.isAllowed;

  const getRoleDisplayName = (roleId) => {
    const roleDef = (allRoles || []).find(r => r.UserRoleId === roleId);
    return roleDef?.LocalizationKey ? t(roleDef.LocalizationKey) : roleId;
  };

  const getRolePriority = (roleId) => {
    const roleDef = (allRoles || []).find(r => r.UserRoleId === roleId);
    const parsedPriority = Number(roleDef?.UserRolePriority);
    return Number.isFinite(parsedPriority) ? parsedPriority : Number.NEGATIVE_INFINITY;
  };

  const getCourseDisplayInfo = (courseCodeId) => {
    const rawCourse = (allRawCourses || []).find(c => c.CourseCodeId === courseCodeId);
    const contactCourse = (selectedContact?.CoursesHistory || []).find(c => c.CourseCodeId === courseCodeId);
    const courseDetails = rawCourse?.CourseDetails || contactCourse?.CourseDetails || {};

    return {
      courseTitle: courseDetails?.course || selectedContactCourseLabels[courseCodeId] || courseCodeId,
      imageUrl: courseDetails?.imageUrl,
      targetLanguageId: rawCourse?.TargetLanguageId || contactCourse?.TargetLanguageId
    };
  };

  // Pre-build Maps so the loop below does O(1) lookups instead of allRoles.find()
  // and allRawCourses.find() + CoursesHistory.find() on every iteration.
  const rolesByIdMap = new Map((allRoles || []).map(r => [r.UserRoleId, r]));
  const rawCoursesByIdMap = new Map((allRawCourses || []).map(c => [c.CourseCodeId, c]));
  const contactCoursesByIdMap = new Map((selectedContact?.CoursesHistory || []).map(c => [c.CourseCodeId, c]));

  const selectedContactPermissionRows = (selectedContact?.UserCourseRoles || []).map((roleEntry, index) => {
    const roleId = roleEntry?.UserRoleId || roleEntry?.userRoleId || '';
    const courseCodeId = roleEntry?.CourseCodeId || roleEntry?.courseCodeId || '';
    const email = roleEntry?.EmailId || roleEntry?.emailId || '';
    const roleDef = rolesByIdMap.get(roleId);
    const roleName = roleDef?.LocalizationKey ? t(roleDef.LocalizationKey) : roleId;
    const parsedPriority = Number(roleDef?.UserRolePriority);
    const rolePriority = Number.isFinite(parsedPriority) ? parsedPriority : Number.NEGATIVE_INFINITY;
    const rawCourse = courseCodeId ? rawCoursesByIdMap.get(courseCodeId) : null;
    const contactCourse = courseCodeId ? contactCoursesByIdMap.get(courseCodeId) : null;
    const courseDetails = rawCourse?.CourseDetails || contactCourse?.CourseDetails || {};
    const courseInfo = courseCodeId ? {
      courseTitle: courseDetails?.course || selectedContactCourseLabels[courseCodeId] || courseCodeId,
      imageUrl: courseDetails?.imageUrl,
      targetLanguageId: rawCourse?.TargetLanguageId || contactCourse?.TargetLanguageId
    } : {};

    return {
      key: `${roleId}-${courseCodeId || 'global'}-${email || index}-${index}`,
      roleId,
      roleName,
      rolePriority,
      courseCodeId,
      courseTitle: courseInfo.courseTitle || '',
      email,
      createdAt: roleEntry?.CreatedAt || roleEntry?.createdAt || '',
      modifiedAt: roleEntry?.ModifiedAt || roleEntry?.modifiedAt || '',
      isGlobal: !!roleEntry?.IsGlobalAccessUserRole || !courseCodeId,
      isFacilitator: roleId === facilitatorRoleId || roleName?.toLowerCase().includes('facilitator')
    };
  });

  const selectedContactEmailOptions = Array.from(new Set([
    ...(selectedContact?.Emails || []).map(e => e?.EmailId),
    ...selectedContactPermissionRows.map(row => row.email)
  ].filter(Boolean))).map(email => ({ value: email, label: email }));
  const selectedContactStatusEmailOptions = (selectedContact?.Emails || [])
    .map((emailRecord) => {
      const email = emailRecord?.EmailId || emailRecord?.emailId;
      const isOptedOut = emailRecord?.HasOptedOutOfCommunication === true ||
        emailRecord?.hasOptedOutOfCommunication === true;

      return {
        value: email,
        searchText: email,
        label: (
          <span>
            {email}
            <Tag color={isOptedOut ? 'red' : 'green'} style={{ marginLeft: 8, marginRight: 0 }}>
              {isOptedOut
                ? setLocale(locale, 'admin.tools.label.optedOut')
                : setLocale(locale, 'admin.tools.label.communicationAllowed')}
            </Tag>
          </span>
        ),
        isOptedOut
      };
    })
    .filter(option => option.value);

  const comparePermissionRowsByRolePriorityAsc = (a, b) => {
    if (a.rolePriority !== b.rolePriority) {
      return a.rolePriority > b.rolePriority ? 1 : -1;
    }
    return (a.roleName || '').localeCompare(b.roleName || '')
      || (a.courseTitle || a.courseCodeId || '').localeCompare(b.courseTitle || b.courseCodeId || '')
      || (a.email || '').localeCompare(b.email || '');
  };

  const sortedPermissionRows = selectedContactPermissionRows
    .slice()
    .sort((a, b) => comparePermissionRowsByRolePriorityAsc(b, a));

  const permissionRoleFilters = Object.values(
    selectedContactPermissionRows.reduce((filters, row) => {
      if (!row.roleId || filters[row.roleId]) {
        return filters;
      }
      filters[row.roleId] = {
        text: row.roleName || row.roleId,
        value: row.roleId,
        rolePriority: row.rolePriority
      };
      return filters;
    }, {})
  )
    .sort((a, b) => {
      if (a.rolePriority !== b.rolePriority) {
        return a.rolePriority > b.rolePriority ? -1 : 1;
      }
      return (a.text || '').localeCompare(b.text || '');
    })
    .map(({ text, value }) => ({ text, value }));

  const permissionEmailFilters = selectedContactEmailOptions
    .slice()
    .sort((a, b) => (a.label || '').localeCompare(b.label || ''))
    .map(({ label, value }) => ({ text: label, value }));

  const isGlobalUserRoleForSelectedContact = (
    contactGlobalUserRole?.contactInternalId === selectedContact?.ContactInternalId
  );
  const globalRoleRecordsForSelectedContact = (
    isGlobalUserRoleForSelectedContact && Array.isArray(contactGlobalUserRole?.roleRecords)
      ? contactGlobalUserRole.roleRecords
      : []
  );
  const legacyActiveGlobalRoleIds = (
    isGlobalUserRoleForSelectedContact && contactGlobalUserRole?.isGlobal
      ? Array.from(new Set([
          ...(Array.isArray(contactGlobalUserRole?.roles) ? contactGlobalUserRole.roles : []),
          contactGlobalUserRole?.role
        ].filter(Boolean)))
      : []
  );
  const normalizedGlobalRoleRecords = globalRoleRecordsForSelectedContact.length > 0
    ? globalRoleRecordsForSelectedContact
    : legacyActiveGlobalRoleIds.map(roleId => ({
        roleId,
        isGlobalAccessUserRole: true,
        isActive: true,
        endDate: null
      }));
  const globalUserRoleRows = normalizedGlobalRoleRecords
    .map((roleRecord, index) => {
      const roleId = roleRecord?.roleId;
      const isGlobalAccessUserRole = roleRecord?.isGlobalAccessUserRole !== false;
      const isActive = roleRecord?.isActive !== false;

      return {
        key: `${roleId}-${index}-${isActive ? 'active' : 'inactive'}-${roleRecord?.endDate || 'open'}`,
        roleId,
        roleName: getRoleDisplayName(roleId),
        rolePriority: getRolePriority(roleId),
        isGlobalAccessUserRole,
        isActive,
        endDate: roleRecord?.endDate || null,
        scope: isGlobalAccessUserRole ? t('admin.tools.label.global') : '—',
        status: isActive ? t('admin.tools.label.active') : t('admin.tools.label.inactive')
      };
    })
    .filter(row => row.roleId)
    .sort((a, b) => comparePermissionRowsByRolePriorityAsc(b, a));
  const activeGlobalUserRoleRows = globalUserRoleRows.filter(row => row.isGlobalAccessUserRole && row.isActive);
  const revokeGlobalRoleOptions = activeGlobalUserRoleRows.map(row => ({
    key: row.roleId,
    value: row.roleId,
    label: row.roleName
  }));
  const activeRevokeGlobalRole = selectedRevokeGlobalRole || revokeGlobalRoleOptions[0]?.value || null;
  const selectedGlobalRoleRow = activeGlobalUserRoleRows.find(row => row.roleId === activeRevokeGlobalRole);
  const revokeGlobalAccessAuthorization = activeRevokeGlobalRole
    ? accessManagementPolicy.canManageRole(activeRevokeGlobalRole, 'global')
    : { isAllowed: true, reasonKey: null };
  const canRevokeGlobalAccess = revokeGlobalAccessAuthorization.isAllowed;
  const hasGlobalRoleAccess = activeGlobalUserRoleRows.length > 0;
  const renderGlobalAccessTag = () => {
    if (!hasGlobalRoleAccess) return null;
    return (
      <>
        {activeGlobalUserRoleRows.map(row => (
          <Tag key={row.roleId} color="red" style={{ marginRight: 0 }}>
            {t('admin.tools.label.global')}: {row.roleName}
          </Tag>
        ))}
      </>
    );
  };
  const revokeGlobalAccessConfirmMessage = intl.formatMessage(
    { id: 'admin.tools.msg.revokeGlobalAccessConfirm' },
    {
      role: selectedGlobalRoleRow?.roleName || getRoleDisplayName(activeRevokeGlobalRole) || t('admin.tools.label.role')
    }
  );

  const activeRevokeEmail = selectedRevokeEmail || selectedContactEmailOptions[0]?.value || null;
  const activeImpersonationEmail = selectedImpersonationEmail || selectedContactEmailOptions[0]?.value || null;
  const activeImpersonationReason = impersonationReason.trim();
  const isImpersonationReasonValid = getMeaningfulCharacterCount(activeImpersonationReason) > 1;
  const activeContactStatusEmail = selectedContactStatusEmail || selectedContactStatusEmailOptions[0]?.value || null;
  const selectedContactStatusEmailRecord = (selectedContact?.Emails || []).find(emailRecord => (
    (emailRecord?.EmailId || emailRecord?.emailId) === activeContactStatusEmail
  ));
  const isSelectedContactStatusEmailOptedOut = (
    selectedContactStatusEmailRecord?.HasOptedOutOfCommunication === true ||
    selectedContactStatusEmailRecord?.hasOptedOutOfCommunication === true
  );
  const isSelectedContactActive = selectedContact?.IsActive !== false && selectedContact?.isActive !== false;
  const contactStatusName = selectedContact?.FullName || `${selectedContact?.Names || ''} ${selectedContact?.LastNames || ''}`.trim() || t('admin.tools.contact');
  const optOutCommunicationConfirmMessage = intl.formatMessage(
    { id: 'admin.tools.msg.optOutCommunicationConfirm' },
    {
      name: contactStatusName,
      email: activeContactStatusEmail || t('admin.tools.label.email')
    }
  );
  const restoreContactCommunicationConfirmMessage = intl.formatMessage(
    { id: 'admin.tools.msg.restoreContactCommunicationConfirm' },
    {
      name: contactStatusName,
      email: activeContactStatusEmail || t('admin.tools.label.email')
    }
  );
  const contactCommunicationConfirmMessage = isSelectedContactStatusEmailOptedOut
    ? restoreContactCommunicationConfirmMessage
    : optOutCommunicationConfirmMessage;
  const setInactiveConfirmMessage = intl.formatMessage(
    { id: 'admin.tools.msg.setContactInactiveConfirm' },
    {
      name: contactStatusName
    }
  );

  const facilitatorPermissionRows = selectedContactPermissionRows.filter(row => row.isFacilitator && row.courseCodeId);
  const revokeRoleOptions = facilitatorRoleOption
    ? [facilitatorRoleOption]
    : [{ key: facilitatorRoleId, value: facilitatorRoleId, label: t('titulino.facilitator') }];
  const revokeCourseSelectOptions = facilitatorPermissionRows.reduce((options, row) => {
    if (options.some(option => option.value === row.courseCodeId)) {
      return options;
    }
    options.push({
      key: row.courseCodeId,
      value: row.courseCodeId,
      label: `${row.courseCodeId} \u2014 ${row.courseTitle || row.courseCodeId}`,
      email: row.email
    });
    return options;
  }, []);
  const hasFacilitatorCourseAccess = facilitatorPermissionRows.length > 0;
  const selectedRevokePermission = facilitatorPermissionRows.find(row =>
    row.courseCodeId === selectedRevokeCourse && (!activeRevokeEmail || row.email === activeRevokeEmail)
  ) || facilitatorPermissionRows.find(row => row.courseCodeId === selectedRevokeCourse);
  const revokeConfirmRoleName = getRoleDisplayName(facilitatorRoleId);
  const revokeConfirmCourseName = selectedRevokePermission
    ? `${selectedRevokePermission.courseTitle || selectedRevokePermission.courseCodeId} (${selectedRevokePermission.courseCodeId})`
    : selectedRevokeCourse || t('admin.tools.label.course');
  const revokeConfirmEmail = selectedRevokePermission?.email || activeRevokeEmail || '';
  const revokeAccessConfirmMessage = intl.formatMessage(
    { id: 'admin.tools.msg.revokeAccessConfirm' },
    {
      role: revokeConfirmRoleName,
      course: revokeConfirmCourseName,
      email: revokeConfirmEmail
    }
  );

  const handleRevokeCourseChange = (courseCodeId, option) => {
    setSelectedRevokeCourse(courseCodeId);
    const permissionEmail = option?.email || facilitatorPermissionRows.find(row => row.courseCodeId === courseCodeId)?.email;
    if (permissionEmail) {
      setSelectedRevokeEmail(permissionEmail);
    }
  };

  const renderRolesAndCourses = (roles, courses) => (
    <div>
      <strong>{setLocale(locale, 'admin.tools.label.rolesAndCourses')}: </strong>
      {roles.length > 0
        ? (() => {
            const grouped = {};
            roles.forEach(r => {
              if (!grouped[r.UserRoleId]) grouped[r.UserRoleId] = [];
              grouped[r.UserRoleId].push(r);
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {Object.entries(grouped).sort(([aId], [bId]) => {
                  const pa = (allRoles || []).find(r => r.UserRoleId === aId)?.UserRolePriority ?? 999;
                  const pb = (allRoles || []).find(r => r.UserRoleId === bId)?.UserRolePriority ?? 999;
                  return pa - pb;
                }).map(([roleId, entries]) => {
                  const roleDef = (allRoles || []).find(r => r.UserRoleId === roleId);
                  const roleName = roleDef?.LocalizationKey ? t(roleDef.LocalizationKey) : roleId;
                  const isGlobal = entries.some(e => e.IsGlobalAccessUserRole);
                  const courseEntries = entries.filter(e => e.CourseCodeId);

                  return (
                    <div key={roleId}>
                      <Tag color="blue" style={{ width: 'fit-content', fontWeight: 600 }}>
                        {roleName}
                        {isGlobal && (
                          <span style={{ marginLeft: 6, fontWeight: 400, opacity: 0.8 }}>
                            ({t('admin.tools.label.global')})
                          </span>
                        )}
                      </Tag>
                      {courseEntries.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2, marginLeft: 20 }}>
                          {courseEntries.map((ce, i) => {
                            const courseDef = courses.find(c => c.CourseCodeId === ce.CourseCodeId);
                            const friendlyName = courseDef?.CourseDetails?.course;
                            return (
                              <Tooltip title={ce.CourseCodeId} key={i}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <Tag color="green" style={{ width: 'fit-content', cursor: 'default', marginRight: 0 }}>
                                    {friendlyName || ce.CourseCodeId}
                                  </Tag>
                                  <Tag color="geekblue" style={{ width: 'fit-content', cursor: 'default', fontSize: 11, opacity: 0.85, marginRight: 0 }}>
                                    {ce.CourseCodeId}
                                  </Tag>
                                </span>
                              </Tooltip>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()
        : <span style={{ color: '#999' }}>{setLocale(locale, 'admin.tools.label.none')}</span>
      }
    </div>
  );

  const renderLanguageHistory = (langHistory) => {
    if (!langHistory || langHistory.length === 0) return <span style={{ color: '#999' }}>{setLocale(locale, 'admin.tools.label.none')}</span>;

    const grouped = {};
    langHistory.forEach(entry => {
      const lang = (entry.LanguageId || 'unknown').toUpperCase();
      if (!grouped[lang]) grouped[lang] = [];
      grouped[lang].push(entry);
    });

    Object.keys(grouped).forEach(lang => {
      grouped[lang].sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate));
    });

    const langTabs = Object.entries(grouped).map(([lang, entries]) => {
      const langInfo = langData.find(l => l.langId === lang.toLowerCase());
      return {
      key: lang,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {langInfo?.icon && <Flag code={langInfo.icon} style={{ width: 18 }} />}
          {langInfo?.langName || lang}
        </span>
      ),
      children: (
        <Timeline
          items={entries.map((entry, i) => {
            const isCurrent = !entry.EndDate;
            const abbr = entry.LanguageLevelAbbreviation || '';
            const profInfo = PROFICIENCY_MAP[abbr] || { color: 'default', key: '' };
            const profLabel = profInfo.key ? t(profInfo.key) : abbr.toUpperCase();
            const startStr = entry.StartDate ? new Date(entry.StartDate).toLocaleDateString() : '—';
            const endStr = isCurrent ? t('admin.tools.label.current') : (entry.EndDate ? new Date(entry.EndDate).toLocaleDateString() : '—');

            return {
              key: i,
              color: isCurrent ? 'green' : 'gray',
              content: (
                <div>
                  <Tag color={profInfo.color} style={{ marginBottom: 4 }}>{profLabel}</Tag>
                  {isCurrent && <Tag color="green" style={{ marginBottom: 4 }}>{t('admin.tools.label.current')}</Tag>}
                  <div style={{ color: '#666', fontSize: 12 }}>
                    {startStr} → {endStr}
                  </div>
                </div>
              )
            };
          })}
        />
      )
    };
    });

    return <Tabs items={langTabs} size="small" />;
  };

  const renderContactShopPurchaseHistory = () => {
    const currentPurchaseHistory = String(contactShopPurchaseHistory?.contactInternalId || '') === String(selectedContact?.ContactInternalId || '')
      ? contactShopPurchaseHistory
      : null;
    const tableModel = currentPurchaseHistory?.tableModel;

    if (contactPurchaseHistoryLoading) {
      return (
        <p style={{ textAlign: 'center', color: '#999', padding: 32 }}>
          {setLocale(locale, 'admin.tools.label.loadingPurchaseHistory')}
        </p>
      );
    }

    if (!tableModel?.tableData?.length) {
      return <Empty description={setLocale(locale, 'admin.tools.label.noPurchaseHistory')} style={{ marginBottom: 16 }} />;
    }

    return (
      <AbstractTable
        tableData={tableModel.tableData}
        tableColumns={tableModel.columns}
        tableExpandables={tableModel.expandable}
        isAllowedToEditTableData={false}
        isToRenderActionButton={false}
      />
    );
  };

  const renderCourseLanguageValue = (languageId) => {
    const languageInfo = getCourseLanguageDefinition(languageId);
    if (!languageId) return '—';

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {languageInfo?.icon && <Flag code={languageInfo.icon} style={{ width: 18 }} />}
        <span>{languageInfo?.langName || String(languageId).toUpperCase()}</span>
      </span>
    );
  };

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

  const renderContactAwardsEmpty = () => (
    <div
      style={{
        minHeight: 220,
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
        size={64}
        icon={<SafetyCertificateOutlined />}
        style={{ background: '#fff7e6', color: '#d48806' }}
      />
      <div>
        <div style={{ fontWeight: 700, color: '#102a43' }}>No awards yet</div>
        <div style={{ color: '#72849a', maxWidth: 280 }}>
          Golden and participation awards will appear here by course once earned.
        </div>
      </div>
    </div>
  );

  const renderAwardBadge = (award, record) => {
    const awardRecord = (record?.awardRecords || []).find(certification => getAwardTier(certification) === award);
    const badgeImageUrl = getFirstCourseValue(
      awardRecord?.BadgeImageUrl,
      awardRecord?.badgeImageUrl
    );
    const badgeSize = 42;

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

  const renderContactAwards = () => {
    const courseRows = buildContactCourseHistoryRows(selectedContact, allRawCourses);
    const contactAwardsByCourse = getContactAwardsByCourse(selectedContact);
    const currentCertificationHistory = String(selectedContactCertificationHistory?.filters?.contactInternalIds?.[0] || '') === String(selectedContact?.ContactInternalId || '')
      ? selectedContactCertificationHistory
      : null;
    const certificationRowsByCourse = getCertificationRowsByCourse(currentCertificationHistory?.rows || []);
    const courseById = courseRows.reduce((accumulator, course) => {
      if (course?.courseCodeId) accumulator[normalizeContactInternalId(course.courseCodeId)] = course;
      return accumulator;
    }, {});
    const courseKeys = Array.from(new Set([
      ...Object.keys(courseById),
      ...Object.keys(contactAwardsByCourse),
      ...Object.keys(certificationRowsByCourse)
    ]));
    const awardRows = courseKeys.map(courseKey => {
      const course = courseById[courseKey] || {
        key: courseKey,
        courseCodeId: certificationRowsByCourse[courseKey]?.[0]?.courseCodeId || courseKey,
        title: certificationRowsByCourse[courseKey]?.[0]?.courseCodeId || courseKey
      };
      const explicitAwards = contactAwardsByCourse[courseKey] || [];
      const certificationAwards = (certificationRowsByCourse[courseKey] || []).map(certification => certification.awardTier);
      const awards = Array.from(new Set([...explicitAwards, ...certificationAwards]));
      return { ...course, awards, awardRecords: certificationRowsByCourse[courseKey] || [] };
    }).filter(course => course.awards.length > 0);

    if (!contactCertificationHistoryLoading && awardRows.length === 0) {
      return renderContactAwardsEmpty();
    }

    return (
      <Table
        size="small"
        rowKey="key"
        loading={contactCertificationHistoryLoading}
        pagination={false}
        dataSource={awardRows}
        locale={{ emptyText: renderContactAwardsEmpty() }}
        scroll={{ x: true }}
        columns={[
          {
            title: setLocale(locale, 'admin.tools.monitoring.contactProfile.course'),
            dataIndex: 'title',
            key: 'title',
            width: 260,
            render: (_, record) => (
              <Space>
                <Avatar
                  shape="square"
                  size={42}
                  src={record.imageUrl}
                  icon={<BookOutlined />}
                  style={{ borderRadius: 8, flexShrink: 0 }}
                />
                <span style={{ fontWeight: 600 }}>{record.title || 'â€”'}</span>
              </Space>
            )
          },
          {
            title: 'Award',
            dataIndex: 'awards',
            key: 'awards',
            width: 240,
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

  const renderContactCourseHistory = () => {
    const courseRows = buildContactCourseHistoryRows(selectedContact, allRawCourses);

    return (
      <Table
        size="small"
        rowKey="key"
        pagination={false}
        dataSource={courseRows}
        locale={{ emptyText: setLocale(locale, 'admin.tools.label.none') }}
        scroll={{ x: true }}
        columns={[
          {
            title: setLocale(locale, 'admin.tools.monitoring.contactProfile.course'),
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
                <span style={{ fontWeight: 600 }}>{record.title || '—'}</span>
              </Space>
            )
          },
          {
            title: setLocale(locale, 'admin.tools.monitoring.contactProfile.courseCodeId'),
            dataIndex: 'courseCodeId',
            key: 'courseCodeId',
            responsive: ['md']
          },
          {
            title: setLocale(locale, 'admin.tools.monitoring.contactProfile.role'),
            dataIndex: 'roleId',
            key: 'roleId',
            render: roleId => <Tag color={getCourseRoleColor(roleId)}>{getCourseRoleLabel(roleId)}</Tag>
          },
          {
            title: setLocale(locale, 'admin.tools.course.label.targetLanguage'),
            dataIndex: 'targetLanguageId',
            key: 'targetLanguageId',
            render: renderCourseLanguageValue
          },
          {
            title: setLocale(locale, 'admin.tools.course.label.nativeLanguage'),
            dataIndex: 'audienceLanguageId',
            key: 'audienceLanguageId',
            render: renderCourseLanguageValue
          },
          {
            title: setLocale(locale, 'admin.tools.monitoring.contactProfile.startDate'),
            dataIndex: 'startDate',
            key: 'startDate',
            render: value => (value ? new Date(value).toLocaleDateString() : '—')
          },
          {
            title: setLocale(locale, 'admin.tools.monitoring.contactProfile.endDate'),
            dataIndex: 'endDate',
            key: 'endDate',
            render: value => (value ? new Date(value).toLocaleDateString() : t('admin.tools.label.current'))
          }
        ]}
      />
    );
  };

  const renderContactProgressActivity = () => {
    if (selectedContactCourseIds.length === 0) {
      return <Empty description={setLocale(locale, 'admin.tools.label.none')} style={{ marginBottom: 16 }} />;
    }

    const currentActivity = String(contactCourseProgressActivity?.contactInternalId || '') === String(selectedContact?.ContactInternalId || '')
      ? contactCourseProgressActivity
      : null;
    const progressActivityTrendData = currentActivity?.progressActivityTrendData || [];
    const trendData = (selectedProgressCourseId === 'all'
      ? progressActivityTrendData
      : progressActivityTrendData.filter(item => item?.courseCodeId === selectedProgressCourseId)
    ).map(item => ({
      ...item,
      course: selectedContactCourseLabels[item.courseCodeId] || item.courseCodeId
    }));

    return (
      <div style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} justify="start" style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12} md={8} lg={7}>
            <Select
              value={selectedProgressCourseId}
              onChange={setSelectedProgressCourseId}
              style={{ width: '100%' }}
              options={progressCourseOptions}
              showSearch={{
                filterOption: (input, option) =>
                  (option?.searchText || '').toString().toLowerCase().includes(input.toLowerCase())
              }}
            />
          </Col>
        </Row>
        {contactProgressLoading ? (
          <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
            {setLocale(locale, 'admin.tools.progress.loading')}
          </p>
        ) : (
            <TimelineTrendGraph
              trendData={trendData}
              seriesField="course"
              hideCard
              chartSpacingTop={12}
              enableGradientArea
              legendPosition="top-right"
              emptyDescriptionKey="admin.tools.progress.noActivity"
            />
        )}
      </div>
    );
  };

  const renderContactLoginFootprint = () => {
    const currentFootprint = String(contactLoginFootprint?.contactInternalId || '') === String(selectedContact?.ContactInternalId || '')
      ? contactLoginFootprint
      : null;

    if (contactLoginLoading) {
      return (
        <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
          {setLocale(locale, 'admin.tools.loginFootprint.loading')}
        </p>
      );
    }

    const commonGraphProps = {
      hideCard: true,
      emptyDescriptionKey: 'admin.tools.loginFootprint.noActivity'
    };

    return env.IS_LOGIN_FOOTPRINT_INDIVIDUAL_HEATMAP_ON ? (
      <LoginFootprintHeatmapGraph
        heatmapData={currentFootprint?.heatmapData || []}
        {...commonGraphProps}
      />
    ) : (
      <LoginFootprintBubbleScatterGraph
        scatterData={currentFootprint?.scatterData || []}
        {...commonGraphProps}
      />
    );
  };

  const renderContactSummary = () => {
    if (!selectedContact) return null;

    const emails = (selectedContact.Emails || []).map(e => e.EmailId);
    const roles = selectedContact.UserCourseRoles || [];
    const courses = selectedContact.CoursesHistory || [];
    const residencyCode = selectedContact?.Location?.ResidencyLocation?.CountryOfResidency;
    const residencyRegion = selectedContact?.Location?.ResidencyLocation?.CountryDivisionResidencyName;
    const birthCode = selectedContact?.Location?.BirthLocation?.CountryOfBirth;
    const birthNativeName = selectedContact?.Location?.BirthLocation?.CountryOfBirthNativeName;
    const birthRegion = selectedContact?.Location?.BirthLocation?.CountryDivisionBirthName;
    const residencyNativeName = selectedContact?.Location?.ResidencyLocation?.CountryOfResidencyNativeName;
    const birthName = selectedContact?.Location?.BirthLocation?.CountryOfBirthName;
    const residencyName = selectedContact?.Location?.ResidencyLocation?.CountryOfResidencyName;

    const handleCopyInternalId = () => {
      navigator.clipboard.writeText(selectedContact.ContactInternalId || '').then(() => {
        messageApi.success(t('admin.tools.msg.copied'));
      });
    };

    const summaryContent = (
      <>
        <Descriptions column={{ xs: 1, sm: 2, md: 2, lg: 4 }} size="small" bordered>
          <Descriptions.Item label={setLocale(locale, 'admin.tools.label.residency')}>
            {residencyCode
              ? <><Flag code={residencyCode} style={{ width: 24, marginRight: 6, verticalAlign: 'middle' }} />{residencyCode}{residencyRegion ? ` — ${residencyRegion}` : ''}</>
              : '—'}
          </Descriptions.Item>
          <Descriptions.Item label={setLocale(locale, 'admin.tools.label.externalId')} style={{ minWidth: 100 }}>
            {selectedContact.ContactExternalId || '—'}
          </Descriptions.Item>
          <Descriptions.Item label={setLocale(locale, 'admin.tools.label.name')}>
            {selectedContact.FullName || `${selectedContact.Names} ${selectedContact.LastNames}`}
          </Descriptions.Item>
          <Descriptions.Item label={setLocale(locale, 'admin.tools.label.email')}>
            {emails.length > 1 ? (
              <Select
                value={selectedEmail}
                onChange={setSelectedEmail}
                style={{ minWidth: 200 }}
                size="small"
                options={emails.map(e => ({ value: e, label: e }))}
              />
            ) : (
              <span>{emails[0] || '—'}</span>
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider titlePlacement="left" style={{ margin: '16px 0 8px' }}>{setLocale(locale, 'admin.tools.label.permissions')}</Divider>
        {hasGlobalRoleAccess && (
          <div style={{ marginBottom: 8 }}>
            {renderGlobalAccessTag()}
          </div>
        )}
        {renderRolesAndCourses(roles, courses)}
      </>
    );

    const detailedContent = (
      <>
        {/* Profile header */}
        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={6} md={4} style={{ textAlign: 'center' }}>
            {renderSquarePreviewImage(
              selectedContact?.AvatarUrl || selectedContact?.avatarUrl,
              selectedContact?.FullName || 'profile image',
              <UserOutlined />,
              160,
              '#87d068'
            )}
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
              {selectedContact.IsActive
                ? <Tag color="green">{t('admin.tools.label.active')}</Tag>
                : <Tag color="red">{t('admin.tools.label.inactive')}</Tag>
              }
              {renderGlobalAccessTag()}
            </div>
          </Col>
          <Col xs={24} sm={18} md={20}>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" bordered>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.label.name')}>
                {selectedContact.Names || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.label.lastName')}>
                {selectedContact.LastNames || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.label.externalId')} style={{ minWidth: 100 }}>
                {selectedContact.ContactExternalId || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.label.internalId')}>
                <span style={{ marginRight: 8 }}>{selectedContact.ContactInternalId || '—'}</span>
                {selectedContact.ContactInternalId && (
                  <CopyOutlined style={{ cursor: 'pointer', color: '#1890ff' }} onClick={handleCopyInternalId} />
                )}
              </Descriptions.Item>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.label.email')} span={2}>
                {emails.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {emails.map((em, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{em}</span>
                        <CopyOutlined
                          style={{ cursor: 'pointer', color: '#1890ff', fontSize: 12 }}
                          onClick={() => {
                            navigator.clipboard.writeText(em).then(() => messageApi.success(t('admin.tools.msg.copied')));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.label.dateOfBirth')} style={{ minWidth: 120 }}              >
                {formatDateOnly(selectedContact.DateOfBirth)}
              </Descriptions.Item>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.label.age')}>
                {selectedContact.Age ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.label.sex')}>
                {renderSexTag(selectedContact.Sex)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {/* Geography */}
        <Divider titlePlacement="left"><EnvironmentOutlined style={{ marginRight: 6 }} />{setLocale(locale, 'admin.tools.label.geography')}</Divider>
        {(birthCode || residencyCode) ? (
          <Tabs
            size="small"
            style={{ marginBottom: 16 }}
            items={[
              ...(birthCode ? [{
                key: 'birth',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Flag code={birthCode} style={{ width: 18 }} />
                    {setLocale(locale, 'admin.tools.label.birthLocation')}
                  </span>
                ),
                children: (
                  <div>
                    <Card variant="outlined" size="small" style={{ marginBottom: 8 }}>
                      <strong>{birthNativeName || birthCode}</strong>
                      {birthRegion && <span> — {birthRegion}</span>}
                    </Card>
                    {(birthRegion ? geoMaps.birth : true) && (
                      <EnrolleeByRegionWidget
                        enrolleeRegionData={[{
                          name: birthRegion || birthName || birthNativeName,
                          nativeName: birthNativeName || birthName,
                          countryId: birthCode,
                          color: '#f5222d',
                          value: ''
                        }]}
                        mapSource={birthRegion ? geoMaps.birth : WorldMap}
                        mapType={birthRegion ? birthCode : 'world'}
                        zoomable
                        showRegionList
                      />
                    )}
                  </div>
                )
              }] : []),
              ...(residencyCode ? [{
                key: 'residency',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Flag code={residencyCode} style={{ width: 18 }} />
                    {setLocale(locale, 'admin.tools.label.residencyLocation')}
                  </span>
                ),
                children: (
                  <div>
                    <Card variant="outlined" size="small" style={{ marginBottom: 8 }}>
                      <strong>{residencyNativeName || residencyCode}</strong>
                      {residencyRegion && <span> — {residencyRegion}</span>}
                    </Card>
                    {(residencyRegion ? geoMaps.residency : true) && (
                      <EnrolleeByRegionWidget
                        enrolleeRegionData={[{
                          name: residencyRegion || residencyName || residencyNativeName,
                          nativeName: residencyNativeName || residencyName,
                          countryId: residencyCode,
                          color: '#1890ff',
                          value: ''
                        }]}
                        mapSource={residencyRegion ? geoMaps.residency : WorldMap}
                        mapType={residencyRegion ? residencyCode : 'world'}
                        zoomable
                        showRegionList
                      />
                    )}
                  </div>
                )
              }] : [])]
            }
          />
        ) : (
          <Empty description={setLocale(locale, 'admin.tools.label.none')} style={{ marginBottom: 16 }} />
        )}

        <Divider titlePlacement="left"><TableOutlined style={{ marginRight: 6 }} />History</Divider>
        <Tabs
          size="small"
          items={[
            {
              key: 'language',
              label: <span><GlobalOutlined /> Language</span>,
              children: renderLanguageHistory(selectedContact.LanguageProficienciesHistory)
            },
            {
              key: 'awards',
              label: <span><SafetyCertificateOutlined /> Awards</span>,
              children: renderContactAwards()
            },
            {
              key: 'courses',
              label: <span><BookOutlined /> Courses</span>,
              children: renderContactCourseHistory()
            },
            {
              key: 'purchase',
              label: <span><ShoppingCartOutlined /> Purchase</span>,
              children: renderContactShopPurchaseHistory()
            },
            {
              key: 'activity',
              label: <span><LineChartOutlined /> Activity</span>,
              children: renderContactActivityHistory()
            }
          ]}
        />
      </>
    );

    return (
      <Card variant="outlined" size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <h4 style={{ marginBottom: 0 }}>
            <SolutionOutlined style={{ marginRight: 8 }} />
            {setLocale(locale, 'admin.tools.contact')}
          </h4>
          {contactTabKey === 'detailed' && (
            <Tooltip title={setLocale(locale, 'admin.tools.profileEditor.title')}>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => setContactProfileEditorOpen(true)}
                disabled={!canManageContactProfileMonitoring}
              />
            </Tooltip>
          )}
        </div>

        <Radio.Group
          value={contactTabKey}
          onChange={(e) => setContactTabKey(e.target.value)}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="summary">{setLocale(locale, 'admin.tools.tab.summary')}</Radio.Button>
          <Radio.Button value="detailed">{setLocale(locale, 'admin.tools.tab.detailed')}</Radio.Button>
          <Radio.Button value="access">{setLocale(locale, 'admin.tools.tab.access')}</Radio.Button>
        </Radio.Group>

        {contactTabKey === 'summary' && summaryContent}
        {contactTabKey === 'detailed' && detailedContent}
        {contactTabKey === 'access' && renderAssignAccess()}
        <ContactProfileEditor
          open={isContactProfileEditorOpen}
          contact={selectedContact}
          countries={countries}
          selfLanguageLevel={selfLanguageLevel}
          languageData={langData}
          submitting={contactProfileEditorSubmitting}
          canEdit={canManageContactProfileMonitoring}
          onClose={() => setContactProfileEditorOpen(false)}
          onSubmit={handleSubmitSelectedContactProfileUpdate}
          onRequestingGeographicalDivision={onRequestingGeographicalDivision}
        />
      </Card>
    );
  };

  const renderContactLoginHeatmap = () => {
    const currentFootprint = String(contactLoginFootprint?.contactInternalId || '') === String(selectedContact?.ContactInternalId || '')
      ? contactLoginFootprint
      : null;

    if (contactLoginLoading) {
      return (
        <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
          {setLocale(locale, 'admin.tools.loginFootprint.loading')}
        </p>
      );
    }

    return (
      <LoginFootprintHeatmapGraph
        hideCard
        heatmapData={currentFootprint?.heatmapData || []}
        emptyDescriptionKey="admin.tools.loginFootprint.noActivity"
      />
    );
  };

  const renderContactActivityHistory = () => (
    <Tabs
      size="small"
      items={[
        {
          key: 'course-progress',
          label: <span><LineChartOutlined /> {setLocale(locale, 'admin.tools.label.courseProgressActivity')}</span>,
          children: renderContactProgressActivity()
        },
        {
          key: 'login-footprint',
          label: <span><LoginOutlined /> {setLocale(locale, 'admin.tools.label.loginFootprint')}</span>,
          children: renderContactLoginFootprint()
        },
        {
          key: 'heatmap',
          label: <span><TableOutlined /> {setLocale(locale, 'admin.tools.monitoring.loginHeatmap')}</span>,
          children: renderContactLoginHeatmap()
        }
      ]}
    />
  );

  const permissionTableColumns = [
    {
      title: setLocale(locale, 'admin.tools.label.role'),
      dataIndex: 'roleName',
      key: 'roleName',
      filters: permissionRoleFilters,
      filterSearch: true,
      onFilter: (value, record) => record.roleId === value,
      sorter: comparePermissionRowsByRolePriorityAsc,
      defaultSortOrder: 'descend',
      sortDirections: ['descend', 'ascend'],
      render: (roleName, record) => (
        <Tag color={record.isFacilitator ? 'purple' : record.isGlobal ? 'geekblue' : 'blue'} style={{ marginRight: 0 }}>
          {roleName || '—'}
        </Tag>
      )
    },
    {
      title: setLocale(locale, 'admin.tools.label.course'),
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      render: (courseTitle, record) => record.isGlobal ? (
        <Tag color="geekblue" style={{ marginRight: 0 }}>{setLocale(locale, 'admin.tools.label.global')}</Tag>
      ) : (
        courseTitle || record.courseCodeId || '—'
      )
    },
    {
      title: setLocale(locale, 'admin.tools.course.label.courseCodeId'),
      dataIndex: 'courseCodeId',
      key: 'courseCodeId',
      render: courseCodeId => courseCodeId || '—'
    },
    {
      title: setLocale(locale, 'admin.tools.label.email'),
      dataIndex: 'email',
      key: 'email',
      filters: permissionEmailFilters,
      filterSearch: true,
      onFilter: (value, record) => record.email === value,
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
      sortDirections: ['ascend', 'descend'],
      render: email => email || '—'
    }
  ];

  const globalPermissionTableColumns = [
    {
      title: setLocale(locale, 'admin.tools.label.role'),
      dataIndex: 'roleName',
      key: 'roleName',
      render: (roleName) => (
        <Tag color="geekblue" style={{ marginRight: 0 }}>
          {roleName || '—'}
        </Tag>
      )
    },
    {
      title: setLocale(locale, 'admin.tools.label.global'),
      dataIndex: 'scope',
      key: 'scope',
      render: (scope, record) => record.isGlobalAccessUserRole ? (
        <Tag color="red" style={{ marginRight: 0 }}>
          {scope || '—'}
        </Tag>
      ) : '—'
    },
    {
      title: setLocale(locale, 'admin.tools.label.active'),
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tag color={record.isActive ? 'green' : 'red'} style={{ marginRight: 0 }}>
          {status || '—'}
        </Tag>
      )
    },
    {
      title: setLocale(locale, 'admin.tools.course.label.endDate'),
      dataIndex: 'endDate',
      key: 'endDate',
      render: endDate => endDate ? new Date(endDate).toLocaleDateString() : '—'
    }
  ];

  const renderPermissionsTable = () => (
    <Table
      size="small"
      rowKey="key"
      columns={permissionTableColumns}
      dataSource={sortedPermissionRows}
      pagination={false}
      locale={{ emptyText: setLocale(locale, 'admin.tools.label.none') }}
      style={{ marginTop: 12 }}
    />
  );

  const renderGlobalPermissionsTable = () => (
    <Table
      size="small"
      rowKey="key"
      columns={globalPermissionTableColumns}
      dataSource={globalUserRoleRows}
      pagination={false}
      loading={globalRoleLoading}
      locale={{ emptyText: setLocale(locale, 'admin.tools.label.none') }}
      style={{ marginTop: 12 }}
    />
  );

  const renderContactStatusManagement = () => {
    if (!selectedContact) return null;

    return (
      <>
        <Divider titlePlacement="left" style={{ marginTop: 24 }}>
          <SolutionOutlined style={{ marginRight: 6 }} />
          {setLocale(locale, 'admin.tools.contactStatus')}
        </Divider>

        {!canManageContactProfileMonitoring && (
          <Alert
            type="warning"
            showIcon
            title={setLocale(locale, 'admin.tools.msg.notEnoughContactProfileMonitoringPermissions')}
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ opacity: canManageContactProfileMonitoring ? 1 : 0.55 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 8 }}><strong>{setLocale(locale, 'admin.tools.label.email')}</strong></div>
              {selectedContactStatusEmailOptions.length > 1 ? (
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    (option?.searchText || '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                  value={activeContactStatusEmail}
                  onChange={setSelectedContactStatusEmail}
                  style={{ width: '100%' }}
                  options={selectedContactStatusEmailOptions}
                  disabled={!canManageContactProfileMonitoring}
                />
              ) : (
                <Input value={activeContactStatusEmail || ''} readOnly disabled={!canManageContactProfileMonitoring} />
              )}
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 8 }}><strong>{setLocale(locale, 'admin.tools.label.contactStatus')}</strong></div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 4 }}>
                <Tag color={isSelectedContactActive ? 'green' : 'red'}>
                  {isSelectedContactActive
                    ? setLocale(locale, 'admin.tools.label.active')
                    : setLocale(locale, 'admin.tools.label.inactive')}
                </Tag>
                <Tag color={isSelectedContactStatusEmailOptedOut ? 'red' : 'green'}>
                  {isSelectedContactStatusEmailOptedOut
                    ? setLocale(locale, 'admin.tools.label.optedOut')
                    : setLocale(locale, 'admin.tools.label.communicationAllowed')}
                </Tag>
              </div>
            </Col>
          </Row>

          {isSelectedContactStatusEmailOptedOut && (
            <Alert
              type="info"
              showIcon
              title={setLocale(locale, 'admin.tools.msg.contactEmailAlreadyOptedOut')}
              style={{ marginTop: 16 }}
            />
          )}
          {!isSelectedContactActive && (
            <Alert
              type="info"
              showIcon
              title={setLocale(locale, 'admin.tools.msg.contactAlreadyInactive')}
              style={{ marginTop: 16 }}
            />
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            <Popconfirm
              title={contactCommunicationConfirmMessage}
              onConfirm={handleToggleSelectedContactEmailCommunication}
              okText={t('admin.tools.confirmYes')}
              cancelText={t('admin.tools.confirmNo')}
              disabled={!canManageContactProfileMonitoring || !activeContactStatusEmail}
            >
              <Button
                danger={!isSelectedContactStatusEmailOptedOut}
                type={isSelectedContactStatusEmailOptedOut ? 'primary' : 'default'}
                icon={<MessageOutlined />}
                loading={contactStatusSubmitting.communication}
                disabled={!canManageContactProfileMonitoring || !activeContactStatusEmail}
              >
                {isSelectedContactStatusEmailOptedOut
                  ? setLocale(locale, 'admin.tools.monitoring.restoreCommunication')
                  : setLocale(locale, 'admin.tools.optOutCommunication')}
              </Button>
            </Popconfirm>

            <Popconfirm
              title={setInactiveConfirmMessage}
              onConfirm={handleSetSelectedContactInactive}
              okText={t('admin.tools.confirmYes')}
              cancelText={t('admin.tools.confirmNo')}
              disabled={!canManageContactProfileMonitoring || !isSelectedContactActive}
            >
              <Button
                danger
                icon={<CloseCircleOutlined />}
                loading={contactStatusSubmitting.active}
                disabled={!canManageContactProfileMonitoring || !isSelectedContactActive}
              >
                {setLocale(locale, 'admin.tools.setContactInactive')}
              </Button>
            </Popconfirm>
          </div>
        </div>
      </>
    );
  };

  const renderImpersonationAccess = () => {
    if (!selectedContact) return null;

    const confirmationMessage = intl.formatMessage(
      { id: 'admin.tools.impersonation.confirmStart' },
      {
        name: selectedContact.FullName || selectedContact.Names || selectedContact.ContactInternalId,
        email: activeImpersonationEmail || t('admin.tools.label.email')
      }
    );

    return (
      <>
        <Divider titlePlacement="left" style={{ marginTop: 24 }}>
          <UserSwitchOutlined style={{ marginRight: 6 }} />
          {setLocale(locale, 'admin.tools.impersonation.title')}
        </Divider>

        {!canStartContactImpersonation && (
          <Alert
            type="warning"
            showIcon
            title={setLocale(locale, 'admin.tools.msg.notEnoughImpersonationPermissions')}
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ opacity: canStartContactImpersonation ? 1 : 0.55 }}>
          <Row gutter={[16, 12]}>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 8 }}><strong>{setLocale(locale, 'admin.tools.label.email')}</strong></div>
              {selectedContactEmailOptions.length > 1 ? (
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label || '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                  value={activeImpersonationEmail}
                  onChange={setSelectedImpersonationEmail}
                  style={{ width: '100%' }}
                  options={selectedContactEmailOptions}
                  disabled={!canStartContactImpersonation}
                />
              ) : (
                <Input value={activeImpersonationEmail || ''} readOnly disabled={!canStartContactImpersonation} />
              )}
            </Col>
            <Col xs={24} sm={12} md={10}>
              <div style={{ marginBottom: 8 }}><strong>{setLocale(locale, 'admin.tools.impersonation.reason')}</strong></div>
              <Input
                value={impersonationReason}
                onChange={(event) => setImpersonationReason(event.target.value)}
                placeholder={t('admin.tools.impersonation.reasonPlaceholder')}
                status={canStartContactImpersonation && !isImpersonationReasonValid ? 'error' : undefined}
                disabled={!canStartContactImpersonation}
              />
            </Col>
          </Row>

          <Popconfirm
            title={confirmationMessage}
            onConfirm={handleStartContactImpersonation}
            okText={t('admin.tools.confirmYes')}
            cancelText={t('admin.tools.confirmNo')}
            disabled={!canStartContactImpersonation || !activeImpersonationEmail || !isImpersonationReasonValid}
          >
            <Button
              type="primary"
              icon={<UserSwitchOutlined />}
              loading={impersonationSubmitting}
              disabled={!canStartContactImpersonation || !activeImpersonationEmail || !isImpersonationReasonValid}
              style={{ marginTop: 16 }}
            >
              {setLocale(locale, 'admin.tools.impersonation.start')}
            </Button>
          </Popconfirm>
        </div>
      </>
    );
  };

  const renderAssignAccess = () => {
    if (!selectedContact) return null;
    const isEnroll = actionType === 'enroll';
    const isCourseDisabled = isEnroll && !selectedRole;

    return (
      <>
        {renderImpersonationAccess()}

        <Divider titlePlacement="left" style={{ marginTop: 24 }}>
          <SafetyCertificateOutlined style={{ marginRight: 6 }} />
          {setLocale(locale, 'admin.tools.assignAccess')}
        </Divider>

        <Radio.Group
          value={actionType}
          onChange={(e) => { setActionType(e.target.value); }}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="enroll">{setLocale(locale, 'admin.tools.enrollToCourse')}</Radio.Button>
          <Radio.Button value="global">{setLocale(locale, 'admin.tools.assignGlobalRole')}</Radio.Button>
        </Radio.Group>

        {shouldShowAssignAccessPermissionWarning && (
          <Alert
            type="warning"
            showIcon
            title={setLocale(locale, 'admin.tools.msg.notEnoughAccessManagementPermissions')}
            style={{ marginBottom: 16 }}
          />
        )}

        <Row gutter={16} style={{ opacity: selectedRole && !canAssignSelectedAccess ? 0.55 : 1 }}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}><strong>{setLocale(locale, 'admin.tools.label.role')}</strong></div>
            <Select
              showSearch={{
                filterOption: (input, option) =>
                  (option?.label || '').toString().toLowerCase().includes(input.toLowerCase())
              }}
              placeholder={t('admin.tools.selectRole')}
              value={selectedRole}
              onChange={setSelectedRole}
              style={{ width: '100%' }}
              options={isEnroll ? courseRoleOptions : globalRoleOptions}
            />
          </Col>
          {isEnroll && (
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 8 }}><strong>{setLocale(locale, 'admin.tools.label.course')}</strong></div>
              <Select
                showSearch={{
                  filterOption: (input, option) =>
                    (option?.label || '').toString().toLowerCase().includes(input.toLowerCase())
                }}
                placeholder={t('admin.tools.selectCourse')}
                value={selectedCourse}
                onChange={setSelectedCourse}
                style={{ width: '100%' }}
                options={enrollableCourseSelectOptions}
                disabled={isCourseDisabled || (selectedRole && !canAssignSelectedAccess)}
              />
            </Col>
          )}
          {isEnroll && (
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 8 }}><strong>{setLocale(locale, 'admin.tools.label.email')}</strong></div>
              {(selectedContact.Emails || []).length > 1 ? (
                <Select
                  value={selectedEmail}
                  onChange={setSelectedEmail}
                  style={{ width: '100%' }}
                  options={(selectedContact.Emails || []).map(e => ({ value: e.EmailId, label: e.EmailId }))}
                  disabled={selectedRole && !canAssignSelectedAccess}
                />
              ) : (
                <Input value={selectedEmail || ''} readOnly disabled={selectedRole && !canAssignSelectedAccess} />
              )}
            </Col>
          )}
        </Row>

        <Button
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
          style={{ marginTop: 16 }}
          disabled={!selectedRole || (isEnroll && !selectedCourse) || !canAssignSelectedAccess}
        >
          {isEnroll ? setLocale(locale, 'admin.tools.assignToCourse') : setLocale(locale, 'admin.tools.assignGlobalRole')}
        </Button>

        {isEnroll && (
          <>
            <Divider titlePlacement="left" style={{ marginTop: 24 }}>
              <CloseCircleOutlined style={{ marginRight: 6 }} />
              {setLocale(locale, 'admin.tools.revokeAccess')}
            </Divider>
            {!hasFacilitatorCourseAccess && (
              <Alert
                type="info"
                showIcon
                title={setLocale(locale, 'admin.tools.msg.noFacilitatorAccess')}
                style={{ marginBottom: 16 }}
              />
            )}
            {hasFacilitatorCourseAccess && !canRevokeCourseAccess && (
              <Alert
                type="warning"
                showIcon
                title={setLocale(locale, 'admin.tools.msg.notEnoughAccessManagementPermissions')}
                style={{ marginBottom: 16 }}
              />
            )}
            <div style={{ opacity: hasFacilitatorCourseAccess && canRevokeCourseAccess ? 1 : 0.55 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <div style={{ marginBottom: 8 }}><strong>{setLocale(locale, 'admin.tools.label.role')}</strong></div>
                  <Select
                    value={facilitatorRoleId}
                    style={{ width: '100%' }}
                    options={revokeRoleOptions}
                    disabled
                  />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div style={{ marginBottom: 8 }}><strong>{setLocale(locale, 'admin.tools.label.course')}</strong></div>
                  <Select
                    showSearch={{
                      filterOption: (input, option) =>
                        (option?.label || '').toString().toLowerCase().includes(input.toLowerCase())
                    }}
                    placeholder={t('admin.tools.selectCourse')}
                    value={selectedRevokeCourse}
                    onChange={handleRevokeCourseChange}
                    style={{ width: '100%' }}
                    options={revokeCourseSelectOptions}
                    disabled={!hasFacilitatorCourseAccess || !canRevokeCourseAccess}
                  />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div style={{ marginBottom: 8 }}><strong>{setLocale(locale, 'admin.tools.label.email')}</strong></div>
                  {selectedContactEmailOptions.length > 1 ? (
                    <Select
                      value={activeRevokeEmail}
                      onChange={(value) => {
                        setSelectedRevokeEmail(value);
                        setSelectedRevokeCourse(null);
                      }}
                      style={{ width: '100%' }}
                      options={selectedContactEmailOptions}
                      disabled={!hasFacilitatorCourseAccess || !canRevokeCourseAccess}
                    />
                  ) : (
                    <Input value={activeRevokeEmail || ''} readOnly disabled={!hasFacilitatorCourseAccess || !canRevokeCourseAccess} />
                  )}
                </Col>
              </Row>
              <Popconfirm
                title={revokeAccessConfirmMessage}
                onConfirm={handleRevokeFacilitatorAccess}
                okText={t('admin.tools.confirmYes')}
                cancelText={t('admin.tools.confirmNo')}
                disabled={!hasFacilitatorCourseAccess || !canRevokeCourseAccess || !selectedRevokeCourse || !activeRevokeEmail}
              >
                <Button
                  danger
                  loading={revokeSubmitting}
                  style={{ marginTop: 16 }}
                  disabled={!hasFacilitatorCourseAccess || !canRevokeCourseAccess || !selectedRevokeCourse || !activeRevokeEmail}
                >
                  {setLocale(locale, 'admin.tools.revokeAccess')}
                </Button>
              </Popconfirm>
            </div>
          </>
        )}

        {!isEnroll && (
          <>
            <Divider titlePlacement="left" style={{ marginTop: 24 }}>
              <CloseCircleOutlined style={{ marginRight: 6 }} />
              {setLocale(locale, 'admin.tools.revokeAccess')}
            </Divider>
            {!hasGlobalRoleAccess && !globalRoleLoading && (
              <Alert
                type="info"
                showIcon
                title={setLocale(locale, 'admin.tools.msg.noGlobalAccess')}
                style={{ marginBottom: 16 }}
              />
            )}
            {hasGlobalRoleAccess && !canRevokeGlobalAccess && (
              <Alert
                type="warning"
                showIcon
                title={setLocale(locale, 'admin.tools.msg.notEnoughAccessManagementPermissions')}
                style={{ marginBottom: 16 }}
              />
            )}
            <div style={{ opacity: hasGlobalRoleAccess && canRevokeGlobalAccess ? 1 : 0.55 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <div style={{ marginBottom: 8 }}><strong>{setLocale(locale, 'admin.tools.label.role')}</strong></div>
                  <Select
                    showSearch={{
                      filterOption: (input, option) =>
                        (option?.label || '').toString().toLowerCase().includes(input.toLowerCase())
                    }}
                    placeholder={t('admin.tools.selectRole')}
                    value={activeRevokeGlobalRole}
                    onChange={setSelectedRevokeGlobalRole}
                    style={{ width: '100%' }}
                    options={revokeGlobalRoleOptions}
                    loading={globalRoleLoading}
                    disabled={globalRoleLoading || !hasGlobalRoleAccess}
                  />
                </Col>
              </Row>
              <Popconfirm
                title={revokeGlobalAccessConfirmMessage}
                onConfirm={handleRevokeGlobalRoleAccess}
                okText={t('admin.tools.confirmYes')}
                cancelText={t('admin.tools.confirmNo')}
                disabled={globalRoleLoading || !hasGlobalRoleAccess || !canRevokeGlobalAccess || !activeRevokeGlobalRole}
              >
                <Button
                  danger
                  loading={globalRevokeSubmitting}
                  style={{ marginTop: 16 }}
                  disabled={globalRoleLoading || !hasGlobalRoleAccess || !canRevokeGlobalAccess || !activeRevokeGlobalRole}
                >
                  {setLocale(locale, 'admin.tools.revokeAccess')}
                </Button>
              </Popconfirm>
            </div>
          </>
        )}

        <Divider titlePlacement="left" style={{ marginTop: 24 }}>
          <SafetyCertificateOutlined style={{ marginRight: 6 }} />
          {isEnroll
            ? setLocale(locale, 'admin.tools.label.permissions')
            : setLocale(locale, 'admin.tools.globalPermissions')}
        </Divider>
        {isEnroll ? renderPermissionsTable() : renderGlobalPermissionsTable()}
        {renderContactStatusManagement()}
      </>
    );
  };

  const renderAdvancedContactSearch = () => {
    const resultRows = advancedContactSearchResult?.rows || [];
    const resultCount = advancedContactSearchResult?.count ?? resultRows.length;
    const contactResultColumns = [
      ...audienceColumns.filter(column => (
        ['fullName', 'emailList', 'age', 'sex', 'languageLevel', 'residency', 'birth'].includes(column.key)
      )),
      {
        title: '',
        key: 'selectContact',
        width: 120,
        fixed: 'right',
        render: (_, record) => (
          <Button
            type="primary"
            size="small"
            onClick={() => handleAdvancedContactRowSelect(record)}
          >
            {setLocale(locale, 'admin.tools.selectContact')}
          </Button>
        )
      }
    ];

    return (
      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid #f0f0f0'
        }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} lg={8}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder={t('admin.tools.messaging.searchPlaceholder')}
              value={advancedContactFilters.searchText}
              onChange={event => updateAdvancedContactFilter('searchText', event.target.value)}
            />
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Select
              value={advancedContactFilters.sex}
              options={audienceOptions.sex}
              onChange={value => updateAdvancedContactFilter('sex', value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={8} lg={3}>
            <InputNumber
              min={0}
              max={120}
              value={advancedContactFilters.minAge}
              onChange={value => updateAdvancedContactFilter('minAge', value)}
              placeholder={t('admin.tools.messaging.minAge')}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={8} lg={3}>
            <InputNumber
              min={0}
              max={120}
              value={advancedContactFilters.maxAge}
              onChange={value => updateAdvancedContactFilter('maxAge', value)}
              placeholder={t('admin.tools.messaging.maxAge')}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={8} lg={3}>
            <Select
              value={advancedContactFilters.limit}
              options={[10, 20, 50, 100, 250].map(value => ({ value, label: String(value) }))}
              onChange={value => updateAdvancedContactFilter('limit', value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={8} lg={3}>
            <InputNumber
              min={0}
              step={advancedContactFilters.limit}
              value={advancedContactFilters.offset}
              onChange={value => updateAdvancedContactFilter('offset', Number(value || 0))}
              placeholder={t('admin.tools.messaging.offset')}
              style={{ width: '100%' }}
            />
          </Col>

          <Col xs={24} md={8} lg={4}>
            <Select
              value={advancedContactFilters.locationType}
              options={audienceOptions.locationTypes}
              onChange={(value) => {
                setAdvancedContactFilters(previousFilters => ({
                  ...previousFilters,
                  locationType: value,
                  countryNameOrId: null,
                  locationRegionName: null,
                  offset: 0
                }));
              }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={8} lg={5}>
            <Select
              allowClear
              showSearch
              value={advancedContactFilters.countryNameOrId}
              placeholder={t('admin.tools.messaging.countryPlaceholder')}
              options={advancedContactCountryOptions}
              optionFilterProp="searchText"
              onChange={(value) => {
                setAdvancedContactFilters(previousFilters => ({
                  ...previousFilters,
                  countryNameOrId: value || null,
                  locationRegionName: null,
                  offset: 0
                }));
              }}
              loading={audienceMetadataLoading}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={8} lg={5}>
            <Select
              allowClear
              showSearch
              disabled={!advancedContactFilters.countryNameOrId}
              value={advancedContactFilters.locationRegionName}
              placeholder={t('admin.tools.messaging.regionPlaceholder')}
              options={advancedContactRegionOptions}
              optionFilterProp="searchText"
              onChange={value => updateAdvancedContactFilter('locationRegionName', value || null)}
              loading={advancedContactCountryDivisionsLoading}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={8} lg={5}>
            <Select
              allowClear
              showSearch
              value={advancedContactFilters.languageId}
              placeholder={t('admin.tools.messaging.languagePlaceholder')}
              options={[
                { value: 'all', label: t('admin.tools.messaging.option.all') },
                ...audienceLanguageOptions
              ]}
              optionFilterProp="searchText"
              onChange={value => updateAdvancedContactFilter('languageId', value || 'all')}
              loading={audienceMetadataLoading}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={8} lg={5}>
            <Select
              allowClear
              showSearch
              value={advancedContactFilters.languageLevel}
              placeholder={t('admin.tools.messaging.languageLevelPlaceholder')}
              options={[
                { value: 'all', label: t('admin.tools.messaging.option.all') },
                ...audienceLanguageLevelOptions
              ]}
              optionFilterProp="searchText"
              onChange={value => updateAdvancedContactFilter('languageLevel', value || 'all')}
              loading={audienceMetadataLoading}
              style={{ width: '100%' }}
            />
          </Col>

          <Col xs={24} lg={10}>
            <Select
              mode="multiple"
              allowClear
              showSearch
              value={advancedContactFilters.courseCodeIds}
              placeholder={t('admin.tools.messaging.includeCoursesPlaceholder')}
              options={audienceCourseOptions}
              optionFilterProp="searchText"
              onChange={value => updateAdvancedContactFilter('courseCodeIds', value || [])}
              loading={audienceMetadataLoading}
              maxTagCount={2}
              tagRender={renderAudienceCourseTag}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} lg={10}>
            <Select
              mode="multiple"
              allowClear
              showSearch
              value={advancedContactFilters.excludeCourseCodeIds}
              placeholder={t('admin.tools.messaging.excludeCoursesPlaceholder')}
              options={audienceCourseOptions}
              optionFilterProp="searchText"
              onChange={value => updateAdvancedContactFilter('excludeCourseCodeIds', value || [])}
              loading={audienceMetadataLoading}
              maxTagCount={2}
              tagRender={renderAudienceCourseTag}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} lg={4}>
            <Checkbox
              checked={advancedContactFilters.matchAllCourses}
              onChange={event => updateAdvancedContactFilter('matchAllCourses', event.target.checked)}
            >
              {setLocale(locale, 'admin.tools.messaging.matchAllCourses')}
            </Checkbox>
          </Col>

          <Col xs={24} md={6}>
            <Select
              value={advancedContactFilters.hasProgress}
              options={audienceOptions.triState}
              onChange={value => updateAdvancedContactFilter('hasProgress', value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              value={advancedContactFilters.hasCertifications}
              options={audienceOptions.triState}
              onChange={value => updateAdvancedContactFilter('hasCertifications', value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              value={advancedContactFilters.hasPurchases}
              options={audienceOptions.triState}
              onChange={value => updateAdvancedContactFilter('hasPurchases', value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} md={3}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={advancedContactSearchLoading}
              onClick={() => loadAdvancedContactSearch()}
              block
            >
              {setLocale(locale, 'admin.tools.messaging.applyFilters')}
            </Button>
          </Col>
          <Col xs={12} md={3}>
            <Button
              icon={<ReloadOutlined />}
              onClick={resetAdvancedContactFilters}
              block
            >
              {setLocale(locale, 'admin.tools.messaging.clearFilters')}
            </Button>
          </Col>
        </Row>

        {advancedContactSearchResult && (
          <div style={{ marginTop: 12 }}>
            <div style={{ color: '#72849a', fontSize: 12, marginBottom: 6 }}>
              {resultRows.length} shown{resultCount != null ? ` of ${resultCount}` : ''}
            </div>
            <Table
              size="small"
              rowKey={record => record.contactInternalId || record.key}
              columns={contactResultColumns}
              dataSource={resultRows}
              pagination={{
                pageSize: Math.min(Number(advancedContactFilters.limit || 10), 100),
                showSizeChanger: false
              }}
              scroll={{ x: 1200 }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderAccessManagement = () => (
    <>
      {/* Step 1: Search Contact */}
      <Card variant="outlined" size="small" style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 12 }}>
          <UserOutlined style={{ marginRight: 8 }} />
          {setLocale(locale, 'admin.tools.searchContact')}
        </h4>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <AutoComplete
            style={{ flex: 1 }}
            options={searchOptions}
            value={searchText}
            showSearch={{ onSearch: handleSearchChange, filterOption: false }}
            onChange={handleSearchChange}
            onSelect={handleContactSelect}
            placeholder={t('admin.tools.searchPlaceholder')}
          >
            <Input prefix={<SearchOutlined />} size="large" />
          </AutoComplete>
          {selectedContact && (
            <Button type="text" danger icon={<CloseCircleOutlined />} onClick={handleClearContact} size="large">
              {setLocale(locale, 'admin.tools.clearSelection')}
            </Button>
          )}
        </div>
        <div style={{ marginTop: 8 }}>
          <Button
            type="link"
            size="small"
            icon={<SearchOutlined />}
            onClick={() => setAdvancedContactSearchOpen(previousValue => !previousValue)}
            style={{ paddingLeft: 0 }}
          >
            {advancedContactSearchOpen ? 'Hide Advanced Search' : 'Advanced Search'}
          </Button>
        </div>
        {advancedContactSearchOpen && renderAdvancedContactSearch()}
      </Card>

      {/* Step 2: Contact Summary (with Summary / Detailed / Access tabs) */}
      {renderContactSummary()}

      {!selectedContact && !searchText && !advancedContactSearchResult && (
        <Empty description={setLocale(locale, 'admin.tools.searchToGetStarted')} style={{ marginTop: 40 }} />
      )}
    </>
  );

  const renderStewardshipContactCard = (contact, title, tagColor, profileData = null) => {
    const contactInternalId = getContactInternalIdValue(contact);
    const emailIds = getContactEmailIds(contact);
    const sex = getFirstCourseValue(contact?.Sex, contact?.sex, profileData?.Sex, profileData?.sex);

    return (
      <Card size="small" title={<span><UserOutlined /> {title}</span>} variant="outlined">
        {contactInternalId ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Avatar size={56} src={contact?.AvatarUrl || contact?.avatarUrl} icon={<UserOutlined />} style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <Space wrap style={{ marginBottom: 6 }}>
                <strong>{getContactDisplayName(contact)}</strong>
                <Tag color={tagColor}>{title}</Tag>
              </Space>
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label={setLocale(locale, 'admin.tools.label.email')}>
                  {emailIds.join(', ') || '—'}
                </Descriptions.Item>
                <Descriptions.Item label={setLocale(locale, 'admin.tools.label.contactId')}>
                  <span style={{ marginRight: 8 }}>{contactInternalId}</span>
                  <CopyOutlined
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                    onClick={() => navigator.clipboard.writeText(contactInternalId || '').then(() => messageApi.success(t('admin.tools.msg.copied')))}
                  />
                </Descriptions.Item>
                <Descriptions.Item label={setLocale(locale, 'admin.tools.label.dateOfBirth')}>
                  {formatDateOnly(getFirstCourseValue(contact?.DateOfBirth, contact?.dateOfBirth))}
                </Descriptions.Item>
                <Descriptions.Item label={setLocale(locale, 'admin.tools.label.sex')}>
                  {renderSexTag(sex)}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={setLocale(locale, 'admin.tools.stewardship.selectContact')} />
        )}
      </Card>
    );
  };

  const renderContactMergePreview = () => {
    const primaryContactInternalId = getContactInternalIdValue(stewardshipPrimaryContact);
    const secondaryContactInternalId = getContactInternalIdValue(stewardshipSecondaryContact);
    const previewMatchesCurrentSelection = (
      normalizeContactInternalId(contactMergePreview?.primaryContactInternalId) === normalizeContactInternalId(primaryContactInternalId) &&
      normalizeContactInternalId(contactMergePreview?.secondaryContactInternalId) === normalizeContactInternalId(secondaryContactInternalId)
    );
    const currentPreview = previewMatchesCurrentSelection ? contactMergePreview?.preview : null;
    const conflicts = toCourseArray(getFirstCourseValue(
      currentPreview?.Conflicts,
      currentPreview?.conflicts,
      currentPreview?.ProfileConflicts,
      currentPreview?.profileConflicts
    ));
    const warnings = toCourseArray(getFirstCourseValue(
      currentPreview?.Warnings,
      currentPreview?.warnings
    ));
    const mergeActions = toCourseArray(getFirstCourseValue(
      currentPreview?.MergeActions,
      currentPreview?.mergeActions
    ));
    const primaryProfile = getFirstCourseValue(
      currentPreview?.PrimaryProfile,
      currentPreview?.primaryProfile
    );
    const secondaryProfile = getFirstCourseValue(
      currentPreview?.SecondaryProfile,
      currentPreview?.secondaryProfile
    );
    const summary = getFirstCourseValue(
      currentPreview?.Summary,
      currentPreview?.summary,
      currentPreview?.MergeSummary,
      currentPreview?.mergeSummary
    );
    const hasJsonContent = (value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value && typeof value === 'object' && Object.keys(value).length > 0;
    };
    // JsonView traverses the full object tree on mount even with collapsed={1}.
    // Large production contact profiles (courses history, language history, payments, etc.)
    // can block the main thread for seconds. Cap at 80KB serialized — beyond that show
    // a summary of top-level keys so the page stays responsive.
    const JSON_RENDER_LIMIT = 80000;
    const safeJsonValue = (value) => {
      if (!hasJsonContent(value)) return value;
      try {
        if (JSON.stringify(value).length <= JSON_RENDER_LIMIT) return value;
        return Object.fromEntries(
          Object.entries(value).map(([k, v]) => {
            if (Array.isArray(v)) return [k, `[ ${v.length} items — too large to preview ]`];
            if (v && typeof v === 'object') return [k, `{ ${Object.keys(v).length} keys — too large to preview }`];
            return [k, v];
          })
        );
      } catch {
        return { _error: 'Unable to render profile preview.' };
      }
    };
    const renderJsonPanel = (value, emptyDescription = setLocale(locale, 'admin.tools.stewardship.noDetails')) => (
      hasJsonContent(value) ? (
        <div style={{ padding: 12, background: '#f6f8fa', border: '1px solid #e6ebf1', borderRadius: 6, maxHeight: 360, overflow: 'auto' }}>
          <JsonView value={safeJsonValue(value)} collapsed={1} displayDataTypes={false} enableClipboard style={{ background: 'transparent' }} />
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyDescription} />
      )
    );
    const mergeActionColumns = [
      {
        title: setLocale(locale, 'admin.tools.stewardship.action'),
        key: 'action',
        width: 220,
        render: (_, record, index) => getFirstCourseValue(
          record?.Action,
          record?.action,
          record?.ActionType,
          record?.actionType,
          record?.Operation,
          record?.operation,
          `Action ${index + 1}`
        )
      },
      {
        title: setLocale(locale, 'admin.tools.stewardship.target'),
        key: 'target',
        width: 220,
        render: (_, record) => getFirstCourseValue(
          record?.Target,
          record?.target,
          record?.TableName,
          record?.tableName,
          record?.Entity,
          record?.entity,
          '-'
        )
      },
      {
        title: setLocale(locale, 'admin.tools.stewardship.details'),
        key: 'details',
        render: (_, record) => (
          <div style={{ maxHeight: 220, overflow: 'auto' }}>
            <JsonView value={record || {}} collapsed={1} displayDataTypes={false} enableClipboard style={{ background: 'transparent' }} />
          </div>
        )
      }
    ];
    const mergePreviewDetailItems = [
      {
        key: 'actions',
        label: <span><SolutionOutlined /> {setLocale(locale, 'admin.tools.stewardship.tab.mergeActions')}</span>,
        children: mergePreviewDetailTabKey === 'actions' && (
          mergeActions.length > 0 ? (
            <Table
              size="small"
              rowKey={(record, index) => getFirstCourseValue(record?.ActionId, record?.actionId, record?.Key, record?.key, index)}
              columns={mergeActionColumns}
              dataSource={mergeActions}
              pagination={false}
              scroll={{ x: 900 }}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={setLocale(locale, 'admin.tools.stewardship.noMergeActions')} />
          )
        )
      },
      {
        key: 'divided',
        label: <span><UserSwitchOutlined /> {setLocale(locale, 'admin.tools.stewardship.tab.divided')}</span>,
        children: mergePreviewDetailTabKey === 'divided' && (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card size="small" title={setLocale(locale, 'admin.tools.stewardship.primaryProfile')} variant="outlined">
                {renderJsonPanel(primaryProfile, setLocale(locale, 'admin.tools.stewardship.noPrimaryProfile'))}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card size="small" title={setLocale(locale, 'admin.tools.stewardship.secondaryProfile')} variant="outlined">
                {renderJsonPanel(secondaryProfile, setLocale(locale, 'admin.tools.stewardship.noSecondaryProfile'))}
              </Card>
            </Col>
          </Row>
        )
      },
      {
        key: 'warnings',
        label: <span><SafetyCertificateOutlined /> {setLocale(locale, 'admin.tools.stewardship.tab.warningsConflicts')}</span>,
        children: mergePreviewDetailTabKey === 'warnings' && (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card size="small" title={setLocale(locale, 'admin.tools.stewardship.warnings')} variant="outlined">
                {renderJsonPanel(warnings, setLocale(locale, 'admin.tools.stewardship.noWarnings'))}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card size="small" title={setLocale(locale, 'admin.tools.stewardship.conflicts')} variant="outlined">
                {renderJsonPanel(conflicts, setLocale(locale, 'admin.tools.stewardship.noConflicts'))}
              </Card>
            </Col>
          </Row>
        )
      },
      {
        key: 'raw',
        label: <span><TableOutlined /> {setLocale(locale, 'admin.tools.stewardship.tab.whole')}</span>,
        children: mergePreviewDetailTabKey === 'raw' && renderJsonPanel(currentPreview || {}, setLocale(locale, 'admin.tools.stewardship.previewEmpty'))
      }
    ];

    return (
      <div>
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          title={setLocale(locale, 'admin.tools.stewardship.previewSafetyTitle')}
          description={setLocale(locale, 'admin.tools.stewardship.previewSafetyDescription')}
        />

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Button
            icon={<UserSwitchOutlined />}
            onClick={handleSwapStewardshipContacts}
            disabled={!primaryContactInternalId || !secondaryContactInternalId || stewardshipPreviewLoading}
          >
            {setLocale(locale, 'admin.tools.stewardship.swapContacts')}
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            {renderStewardshipContactCard(stewardshipPrimaryContact, t('admin.tools.stewardship.primaryContact'), 'green', primaryProfile)}
          </Col>
          <Col xs={24} lg={12}>
            {renderStewardshipContactCard(stewardshipSecondaryContact, t('admin.tools.stewardship.secondaryContact'), 'orange', secondaryProfile)}
          </Col>
        </Row>

        <Card size="small" variant="outlined" style={{ marginTop: 16 }} loading={stewardshipPreviewLoading}>
          {currentPreview ? (
            <>
              {conflicts.length > 0 && (
                <Alert
                  type="error"
                  showIcon
                  style={{ marginBottom: 12 }}
                  title={setLocale(locale, 'admin.tools.stewardship.conflictsDetected')}
                  description={(
                    <Space wrap>
                      {conflicts.map((conflict, index) => (
                        <Tag color="red" key={conflict?.field || conflict?.Field || index}>
                          {conflict?.field || conflict?.Field || conflict?.name || conflict?.Name || JSON.stringify(conflict)}
                        </Tag>
                      ))}
                    </Space>
                  )}
                />
              )}

              {summary && (
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 12 }}
                  title={setLocale(locale, 'admin.tools.stewardship.mergeSummary')}
                  description={typeof summary === 'string' ? summary : (
                    <JsonView value={summary} collapsed={1} displayDataTypes={false} enableClipboard style={{ background: 'transparent' }} />
                  )}
                />
              )}

              <Tabs
                size="small"
                activeKey={mergePreviewDetailTabKey}
                onChange={setMergePreviewDetailTabKey}
                items={mergePreviewDetailItems}
                style={{ marginBottom: 16 }}
              />
            </>
          ) : (
            <Empty description={setLocale(locale, 'admin.tools.stewardship.previewEmpty')} />
          )}

          <Row gutter={[16, 12]} align="bottom">
            <Col xs={24} lg={18}>
              <Input.TextArea
                rows={2}
                value={stewardshipMergeReason}
                onChange={event => setStewardshipMergeReason(event.target.value)}
                placeholder={t('admin.tools.stewardship.reasonPlaceholder')}
              />
            </Col>
            <Col xs={24} lg={6}>
              <Popconfirm
                title={setLocale(locale, 'admin.tools.stewardship.confirmMergeTitle')}
                description={setLocale(locale, 'admin.tools.stewardship.confirmMergeDescription')}
                okText={setLocale(locale, 'admin.tools.confirmYes')}
                cancelText={setLocale(locale, 'admin.tools.confirmNo')}
                onConfirm={handleExecuteContactMerge}
                disabled={!currentPreview || stewardshipMergeReason.trim().length < 4}
              >
                <Button type="primary" danger block loading={stewardshipMergeSubmitting} disabled={!currentPreview || stewardshipMergeReason.trim().length < 4}>
                  {setLocale(locale, 'admin.tools.stewardship.confirmMerge')}
                </Button>
              </Popconfirm>
            </Col>
          </Row>
        </Card>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════
     COURSE MANAGEMENT TAB
     ══════════════════════════════════════════════════════ */

  const renderContactStewardship = () => {
    const duplicateRows = contactMergeDashboard?.possibleDuplicates || [];
    const recentMergeRows = contactMergeDashboard?.recentMerges || [];
    const generatedAt = contactMergeDashboard?.generatedAt;

    const candidateColumns = [
      {
        title: setLocale(locale, 'admin.tools.stewardship.confidence'),
        dataIndex: 'confidenceScore',
        width: 130,
        sorter: (a, b) => (a.confidenceScore || 0) - (b.confidenceScore || 0),
        defaultSortOrder: 'descend',
        render: (value) => {
          const score = Number(value || 0);
          const percent = score <= 1 ? Math.round(score * 100) : Math.round(score);
          const color = percent >= 90 ? 'green' : percent >= 75 ? 'gold' : 'orange';
          return <Tag color={color}>{percent}%</Tag>;
        }
      },
      {
        title: setLocale(locale, 'admin.tools.stewardship.primaryContact'),
        dataIndex: 'primaryFullName',
        render: (_, record) => (
          <div>
            <strong>{record.primaryFullName || record.primaryContactInternalId || '—'}</strong>
            <div style={{ color: '#72849a', fontSize: 12 }}>{record.primaryEmailId || record.primaryContactInternalId}</div>
            {(record.primaryHasCommunicationIdentity === false || record.primaryExistsInVmEnrollee === false) && (
              <Space size={4} style={{ marginTop: 4 }}>
                {record.primaryHasCommunicationIdentity === false && (
                  <Tag color="red" style={{ fontSize: 11, lineHeight: '18px' }}>{setLocale(locale, 'admin.tools.stewardship.noCommsIdentity')}</Tag>
                )}
                {record.primaryExistsInVmEnrollee === false && (
                  <Tag color="orange" style={{ fontSize: 11, lineHeight: '18px' }}>{setLocale(locale, 'admin.tools.stewardship.noEnrolleeRecord')}</Tag>
                )}
              </Space>
            )}
          </div>
        )
      },
      {
        title: setLocale(locale, 'admin.tools.stewardship.secondaryContact'),
        dataIndex: 'secondaryFullName',
        render: (_, record) => (
          <div>
            <strong>{record.secondaryFullName || record.secondaryContactInternalId || '—'}</strong>
            <div style={{ color: '#72849a', fontSize: 12 }}>{record.secondaryEmailId || record.secondaryContactInternalId}</div>
            {(record.secondaryHasCommunicationIdentity === false || record.secondaryExistsInVmEnrollee === false) && (
              <Space size={4} style={{ marginTop: 4 }}>
                {record.secondaryHasCommunicationIdentity === false && (
                  <Tag color="red" style={{ fontSize: 11, lineHeight: '18px' }}>{setLocale(locale, 'admin.tools.stewardship.noCommsIdentity')}</Tag>
                )}
                {record.secondaryExistsInVmEnrollee === false && (
                  <Tag color="orange" style={{ fontSize: 11, lineHeight: '18px' }}>{setLocale(locale, 'admin.tools.stewardship.noEnrolleeRecord')}</Tag>
                )}
              </Space>
            )}
          </div>
        )
      },
      {
        title: setLocale(locale, 'admin.tools.label.dateOfBirth'),
        width: 160,
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <span>{formatDateOnly(record.primaryDateOfBirth)}</span>
            <span style={{ color: '#72849a' }}>{formatDateOnly(record.secondaryDateOfBirth)}</span>
          </Space>
        )
      },
      {
        title: setLocale(locale, 'admin.tools.stewardship.matchReasons'),
        dataIndex: 'matchReasons',
        render: (reasons = []) => (
          <Space wrap>
            {toCourseArray(reasons).map((reason, index) => (
              <Tag key={`${reason}-${index}`}>{reason}</Tag>
            ))}
          </Space>
        )
      },
      {
        title: '',
        width: 120,
        render: (_, record) => (
          <Button
            type="primary"
            size="small"
            onClick={() => handlePreviewContactMerge(
              resolveCandidateContact(record, 'primary'),
              resolveCandidateContact(record, 'secondary')
            )}
          >
            {setLocale(locale, 'admin.tools.stewardship.previewMerge')}
          </Button>
        )
      }
    ];

    const historyColumns = [
      {
        title: setLocale(locale, 'admin.tools.stewardship.mergedAt'),
        dataIndex: 'mergedAt',
        width: 160,
        render: value => formatDateOnly(value)
      },
      {
        title: setLocale(locale, 'admin.tools.stewardship.primaryContact'),
        dataIndex: 'primaryFullName',
        render: (_, record) => record.primaryFullName || record.primaryContactInternalId || '—'
      },
      {
        title: setLocale(locale, 'admin.tools.stewardship.secondaryContact'),
        dataIndex: 'secondaryFullName',
        render: (_, record) => record.secondaryFullName || record.secondaryContactInternalId || '—'
      },
      {
        title: setLocale(locale, 'admin.tools.stewardship.mergedBy'),
        dataIndex: 'mergedBy',
        render: value => value || '—'
      },
      {
        title: setLocale(locale, 'admin.tools.impersonation.reason'),
        dataIndex: 'reason',
        render: value => value || '—'
      },
      {
        title: '',
        width: 130,
        render: (_, record) => (
          <Popconfirm
            title={setLocale(locale, 'admin.tools.stewardship.rollbackTitle')}
            description={setLocale(locale, 'admin.tools.stewardship.rollbackDescription')}
            okText={setLocale(locale, 'admin.tools.confirmYes')}
            cancelText={setLocale(locale, 'admin.tools.confirmNo')}
            onConfirm={() => handleRollbackContactMerge(record)}
            disabled={!record.rollbackEligible || !record.mergeId}
          >
            <Button
              size="small"
              danger
              disabled={!record.rollbackEligible || !record.mergeId}
              loading={stewardshipRollbackSubmittingKey === (record.key || record.mergeId)}
            >
              {setLocale(locale, 'admin.tools.stewardship.rollback')}
            </Button>
          </Popconfirm>
        )
      }
    ];

    const stewardshipItems = [
      {
        key: 'duplicates',
        destroyInactiveTabPane: true,
        label: <span><TeamOutlined /> {setLocale(locale, 'admin.tools.stewardship.duplicates')}</span>,
        children: (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} md={8}>
                <Statistic title={setLocale(locale, 'admin.tools.stewardship.duplicateCandidates')} value={duplicateRows.length} prefix={<TeamOutlined />} />
              </Col>
              <Col xs={24} md={8}>
                <Statistic title={setLocale(locale, 'admin.tools.stewardship.recentMerges')} value={recentMergeRows.length} prefix={<SafetyCertificateOutlined />} />
              </Col>
              <Col xs={24} md={8}>
                <Button icon={<ReloadOutlined />} loading={stewardshipLoading} onClick={loadContactMergeDashboard}>
                  {setLocale(locale, 'admin.tools.revenue.refresh')}
                </Button>
                {generatedAt && (
                  <div style={{ color: '#72849a', fontSize: 12, marginTop: 6 }}>
                    {setLocale(locale, 'admin.tools.stewardship.generatedAt')}: {formatDateOnly(generatedAt)}
                  </div>
                )}
              </Col>
            </Row>
            <Table size="small" rowKey="key" loading={stewardshipLoading} columns={candidateColumns} dataSource={duplicateRows} pagination={{ pageSize: 10 }} />
          </>
        )
      },
      {
        key: 'preview',
        destroyInactiveTabPane: true,
        label: <span><SolutionOutlined /> {setLocale(locale, 'admin.tools.stewardship.mergePreview')}</span>,
        children: (
          <>
            <Card size="small" variant="outlined" style={{ marginBottom: 16 }}>
              <Alert type="info" showIcon style={{ marginBottom: 16 }} title={setLocale(locale, 'admin.tools.stewardship.manualTitle')} description={setLocale(locale, 'admin.tools.stewardship.manualDescription')} />
              <Row gutter={[16, 16]} align="bottom">
                <Col xs={24} lg={10}>
                  <div style={{ marginBottom: 6 }}><strong>{setLocale(locale, 'admin.tools.stewardship.primaryContact')}</strong></div>
                  <AutoComplete
                    style={{ width: '100%' }}
                    options={stewardshipPrimarySearchOptions}
                    value={stewardshipPrimarySearchText}
                    showSearch
                    onChange={setStewardshipPrimarySearchText}
                    onSelect={(_, option) => {
                      const contact = resolveStewardshipContactById(option.key);
                      setStewardshipPrimaryContact(contact);
                      setStewardshipPrimarySearchText(option.value);
                    }}
                    filterOption={false}
                    placeholder={t('admin.tools.searchPlaceholder')}
                  >
                    <Input prefix={<SearchOutlined />} />
                  </AutoComplete>
                </Col>
                <Col xs={24} lg={10}>
                  <div style={{ marginBottom: 6 }}><strong>{setLocale(locale, 'admin.tools.stewardship.secondaryContact')}</strong></div>
                  <AutoComplete
                    style={{ width: '100%' }}
                    options={stewardshipSecondarySearchOptions}
                    value={stewardshipSecondarySearchText}
                    showSearch
                    onChange={setStewardshipSecondarySearchText}
                    onSelect={(_, option) => {
                      const contact = resolveStewardshipContactById(option.key);
                      setStewardshipSecondaryContact(contact);
                      setStewardshipSecondarySearchText(option.value);
                    }}
                    filterOption={false}
                    placeholder={t('admin.tools.searchPlaceholder')}
                  >
                    <Input prefix={<SearchOutlined />} />
                  </AutoComplete>
                </Col>
                <Col xs={24} lg={4}>
                  <Button type="primary" icon={<SearchOutlined />} block loading={stewardshipPreviewLoading} onClick={() => handlePreviewContactMerge(stewardshipPrimaryContact, stewardshipSecondaryContact)}>
                    {setLocale(locale, 'admin.tools.stewardship.previewMerge')}
                  </Button>
                </Col>
              </Row>
            </Card>
            {renderContactMergePreview()}
          </>
        )
      },
      {
        key: 'history',
        destroyInactiveTabPane: true,
        label: <span><TableOutlined /> {setLocale(locale, 'admin.tools.stewardship.mergeHistory')}</span>,
        children: (
          <Table
            size="small"
            rowKey="key"
            loading={stewardshipLoading}
            columns={historyColumns}
            dataSource={recentMergeRows}
            expandable={{
              expandedRowRender: record => (
                <div style={{ padding: 12, background: '#f6f8fa', border: '1px solid #e6ebf1', borderRadius: 6 }}>
                  <JsonView value={record} collapsed={1} displayDataTypes={false} enableClipboard style={{ background: 'transparent' }} />
                </div>
              )
            }}
            pagination={{ pageSize: 10 }}
          />
        )
      }
    ];

    return (
      <Card size="small" variant="outlined">
        <Alert type="warning" showIcon style={{ marginBottom: 16 }} title={setLocale(locale, 'admin.tools.stewardship.title')} description={setLocale(locale, 'admin.tools.stewardship.description')} />
        <Tabs activeKey={stewardshipInnerTabKey} onChange={setStewardshipInnerTabKey} items={stewardshipItems} />
      </Card>
    );
  };

  const langOptions = langData.map(l => ({
    value: l.langId,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Flag code={l.icon} style={{ width: 18 }} /> {l.langName}
      </span>
    )
  }));

  const langDataById = new Map(langData.map(l => [l.langId, l]));
  const courseSearchOptions = filteredCourses.map(c => {
    const langInfo = langDataById.get(c.TargetLanguageId);
    return {
      key: c.CourseCodeId,
      value: `${c.CourseDetails?.course || c.CourseCodeId} — ${c.CourseCodeId}`,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={32} src={c.CourseDetails?.imageUrl} icon={<BookOutlined />} style={{ flexShrink: 0 }} />
          {langInfo?.icon && <Flag code={langInfo.icon} style={{ width: 20, flexShrink: 0 }} />}
          <div>
            <strong>{c.CourseDetails?.course || c.CourseCodeId}</strong>
            <br />
            <small style={{ color: '#888' }}>{c.CourseCodeId}</small>
          </div>
        </div>
      )
    };
  });

  const handleCourseSearchChange = (value) => setCourseSearchText(value);

  const handleCourseSelect = (value, option) => {
    const found = (allRawCourses || []).find(c => c.CourseCodeId === option.key);
    setSelectedCourseObj(found || null);
    setCourseTabKey('summary');
    setEditingSections({});
  };

  const handleClearCourse = () => {
    setSelectedCourseObj(null);
    setCourseSearchText('');
    setCourseTabKey('summary');
    setCourseFormValues({});
    setEditingSections({});
    setCourseTemplateId(null);
  };

  const handleToggleEdit = (section) => {
    if (!editingSections[section] && selectedCourseObj) {
      const cd = selectedCourseObj.CourseDetails || {};
      setCourseFormValues(prev => ({
        ...prev,
        ...(section === 'info' && { course: cd.course, teacher: cd.teacher, imageUrl: cd.imageUrl, location: cd.location, gatheringDay: cd.gatheringDay, gatheringTime: cd.gatheringTime, gatheringStartingDate: cd.gatheringStartingDate, courseWeeksLength: cd.courseWeeksLength }),
        ...(section === 'dates' && { StartDate: selectedCourseObj.StartDate, EndDate: selectedCourseObj.EndDate }),
        ...(section === 'links' && { whatsAppLink: cd.whatsAppLink, targetAudienceNativeLanguage: cd.targetAudienceNativeLanguage, NativeLanguageId: selectedCourseObj.NativeLanguageId, TargetLanguageId: selectedCourseObj.TargetLanguageId })
      }));
    }
    setEditingSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSaveSection = async (section) => {
    setCourseSubmitting(true);
    try {
      const cd = selectedCourseObj.CourseDetails || {};
      const merged = {
        ...cd,
        ...(section === 'info' && { course: courseFormValues.course, teacher: courseFormValues.teacher, imageUrl: courseFormValues.imageUrl, location: courseFormValues.location, gatheringDay: courseFormValues.gatheringDay, gatheringTime: courseFormValues.gatheringTime, gatheringStartingDate: courseFormValues.gatheringStartingDate, courseWeeksLength: courseFormValues.courseWeeksLength }),
        ...(section === 'links' && { whatsAppLink: courseFormValues.whatsAppLink, targetAudienceNativeLanguage: courseFormValues.targetAudienceNativeLanguage })
      };
      const payload = buildCourseUpsertPayload({
        CourseCodeId: selectedCourseObj.CourseCodeId,
        CreationDate: selectedCourseObj.CreationDate,
        StartDate: section === 'dates' ? courseFormValues.StartDate : selectedCourseObj.StartDate,
        EndDate: section === 'dates' ? courseFormValues.EndDate : selectedCourseObj.EndDate,
        CourseDetails: merged,
        NativeLanguageId: section === 'links' ? courseFormValues.NativeLanguageId : selectedCourseObj.NativeLanguageId,
        TargetLanguageId: section === 'links' ? courseFormValues.TargetLanguageId : selectedCourseObj.TargetLanguageId
      });
      const actionResult = await onUpsertingCourse(payload, emailId);
      if (!isCourseUpsertSuccessful(actionResult)) {
        throw new Error(getCourseUpsertResult(actionResult)?.errorMessage || 'Course update failed.');
      }
      messageApi.success(t('admin.tools.course.msg.updateSuccess'));
      setEditingSections(prev => ({ ...prev, [section]: false }));
      // Refresh data
      if (emailId) onLoadingAdminToolsInit(emailId);
    } catch (e) {
      console.error(e);
      messageApi.error(t('admin.tools.course.msg.upsertError'));
    }
    setCourseSubmitting(false);
  };

  const handleInitCreateTab = () => {
    if (courseTabKey !== 'create') {
      setCourseFormValues({});
      setCourseTemplateId(null);
    }
    setCourseTabKey('create');
  };

  const handleUseTemplate = (courseCodeId) => {
    const raw = (allRawCourses || []).find(c => c.CourseCodeId === courseCodeId);
    if (raw) {
      setCourseFormValues(prefillFromTemplate(raw));
      setCourseTemplateId(courseCodeId);
    }
  };

  const handleCreateCourse = async () => {
    const validation = getCourseCreateValidation();
    if (!validation.isComplete) {
      messageApi.warning(`${t('admin.tools.course.msg.fillRequired')} ${validation.missingLabels.join(', ')}`);
      return;
    }

    setCourseSubmitting(true);
    try {
      let resolvedImageUrl = courseFormValues.imageUrl || '';
      const courseCodeId = createCourseGeneratedId;

      // Step 1 — if the user picked a file in upload mode, upload it first and
      // replace the local data-URL preview with the public URL the backend returns.
      if (courseImageSourceMode === 'upload' && courseFormValues._imageFile) {
        const uploadAction = await onUploadingCourseCoverImage(emailId, courseFormValues._imageFile, courseCodeId);
        const uploadResult = uploadAction?.uploadResult || uploadAction;
        if (!uploadResult?.success || !uploadResult?.imageUrl) {
          throw new Error(uploadResult?.errorMessage || 'Course cover upload failed.');
        }
        resolvedImageUrl = uploadResult.imageUrl;
      }

      // Step 2 — upsert the course with the resolved (public) imageUrl.
      const finalValues = {
        ...courseFormValues,
        imageUrl: resolvedImageUrl,
        CourseCodeId: courseCodeId
      };
      const payload = buildCourseUpsertPayload(finalValues);
      const actionResult = await onUpsertingCourse(payload, emailId);
      if (!isCourseUpsertSuccessful(actionResult)) {
        throw new Error(getCourseUpsertResult(actionResult)?.errorMessage || 'Course create failed.');
      }
      messageApi.success(t('admin.tools.course.msg.createSuccess'));
      setCourseFormValues({});
      setCourseTemplateId(null);
      setCourseImageSourceMode('upload');
      setCourseTabKey('summary');
      if (emailId) onLoadingAdminToolsInit(emailId);
    } catch (e) {
      console.error(e);
      const fallbackKey = courseImageSourceMode === 'upload' && courseFormValues._imageFile
        ? 'admin.tools.course.msg.imageUploadFailed'
        : 'admin.tools.course.msg.upsertError';
      messageApi.error(t(fallbackKey));
    }
    setCourseSubmitting(false);
  };

  const renderCourseSummary = () => {
    if (!selectedCourseObj) return null;
    const c = selectedCourseObj;
    const cd = c.CourseDetails || {};
    const nativeLang = langData.find(l => l.langId === c.NativeLanguageId);
    const targetLang = langData.find(l => l.langId === c.TargetLanguageId);

    const summaryContent = (
      <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" bordered>
        <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.courseCodeId')}>
          {c.CourseCodeId ? <>{c.CourseCodeId} <CopyOutlined style={{ cursor: 'pointer', color: '#1890ff', marginLeft: 4 }} onClick={() => { navigator.clipboard.writeText(c.CourseCodeId); messageApi.success(t('admin.tools.copied')); }} /></> : '—'}
        </Descriptions.Item>
        <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.onGoing')}>
          {c.OnGoing
            ? <Tag color="green">{t('admin.tools.course.label.onGoingYes')}</Tag>
            : <Tag color="red">{t('admin.tools.course.label.onGoingNo')}</Tag>
          }
        </Descriptions.Item>
        <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.nativeLanguage')}>
          {nativeLang ? <><Flag code={nativeLang.icon} style={{ width: 20, marginRight: 6, verticalAlign: 'middle' }} />{nativeLang.langName}</> : (c.NativeLanguageId || '—')}
        </Descriptions.Item>
        <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.targetLanguage')}>
          {targetLang ? <><Flag code={targetLang.icon} style={{ width: 20, marginRight: 6, verticalAlign: 'middle' }} />{targetLang.langName}</> : (c.TargetLanguageId || '—')}
        </Descriptions.Item>
        <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.startDate')}>
          {c.StartDate ? new Date(c.StartDate).toLocaleDateString() : '—'}
        </Descriptions.Item>
        <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.endDate')}>
          {c.EndDate ? new Date(c.EndDate).toLocaleDateString() : '—'}
        </Descriptions.Item>
      </Descriptions>
    );

    const detailedContent = (
      <>
        {/* Profile header */}
        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={6} md={4} style={{ textAlign: 'center' }}>
            {renderSquarePreviewImage(
              cd.imageUrl,
              c.CourseCodeId || 'course image',
              <BookOutlined />,
              160,
              '#1890ff'
            )}
            <div style={{ marginTop: 8 }}>
              {c.OnGoing
                ? <Tag color="green">{t('admin.tools.course.label.onGoingYes')}</Tag>
                : <Tag color="red">{t('admin.tools.course.label.onGoingNo')}</Tag>
              }
            </div>
          </Col>
          <Col xs={24} sm={18} md={20}>
            <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.courseCodeId')}>
                {c.CourseCodeId ? <>{c.CourseCodeId} <CopyOutlined style={{ cursor: 'pointer', color: '#1890ff', marginLeft: 4 }} onClick={() => { navigator.clipboard.writeText(c.CourseCodeId); messageApi.success(t('admin.tools.copied')); }} /></> : '—'}
              </Descriptions.Item>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.creationDate')}>
                {c.CreationDate ? new Date(c.CreationDate).toLocaleDateString() : '—'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {/* Section: Course Info */}
        <Divider titlePlacement="left">
          <BookOutlined style={{ marginRight: 6 }} />{setLocale(locale, 'admin.tools.course.section.courseInfo')}
          <Button type="link" size="small" icon={editingSections.info ? <CloseCircleOutlined /> : <EditOutlined />} onClick={() => handleToggleEdit('info')} style={{ marginLeft: 8 }}>
            {editingSections.info ? t('admin.tools.course.btn.cancel') : t('admin.tools.course.btn.edit')}
          </Button>
        </Divider>
        {editingSections.info ? (
          <div style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.courseName')}</strong></div><Input value={courseFormValues.course || ''} onChange={e => setCourseFormValues(p => ({ ...p, course: e.target.value }))} /></Col>
              <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.teacher')}</strong></div><Input value={courseFormValues.teacher || ''} onChange={e => setCourseFormValues(p => ({ ...p, teacher: e.target.value }))} /></Col>
              <Col xs={24} sm={12} style={{ marginTop: 8 }}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.location')}</strong></div><Input value={courseFormValues.location || ''} onChange={e => setCourseFormValues(p => ({ ...p, location: e.target.value }))} /></Col>
              <Col xs={24} sm={6} style={{ marginTop: 8 }}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.gatheringDay')}</strong></div><Select value={courseFormValues.gatheringDay || undefined} onChange={v => setCourseFormValues(p => ({ ...p, gatheringDay: v }))} options={[{value:'Mondays',label:'Mondays'},{value:'Tuesdays',label:'Tuesdays'},{value:'Wednesdays',label:'Wednesdays'},{value:'Thursdays',label:'Thursdays'},{value:'Fridays',label:'Fridays'},{value:'Saturdays',label:'Saturdays'},{value:'Sundays',label:'Sundays'}]} style={{ width: '100%' }} /></Col>
              <Col xs={24} sm={6} style={{ marginTop: 8 }}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.gatheringTime')}</strong></div><TimePicker use12Hours format="h:mm a" value={courseFormValues.gatheringTime ? dayjs(courseFormValues.gatheringTime, 'h:mm a') : null} onChange={(t) => setCourseFormValues(p => ({ ...p, gatheringTime: t ? t.format('h:mm a') : '' }))} style={{ width: '100%' }} /></Col>
              <Col xs={24} sm={8} style={{ marginTop: 8 }}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.gatheringStartingDate')}</strong></div><DatePicker value={courseFormValues.gatheringStartingDate ? dayjs(courseFormValues.gatheringStartingDate, 'MMMM D, YYYY') : null} onChange={(d) => setCourseFormValues(p => ({ ...p, gatheringStartingDate: d ? d.format('MMMM D, YYYY') : '' }))} style={{ width: '100%' }} /></Col>
              <Col xs={24} sm={4} style={{ marginTop: 8 }}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.courseWeeksLength')}</strong></div><InputNumber min={1} max={52} value={courseFormValues.courseWeeksLength} onChange={v => setCourseFormValues(p => ({ ...p, courseWeeksLength: v }))} style={{ width: '100%' }} /></Col>
              <Col xs={24} sm={12} style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.imageUrl')}</strong></div>
                <Input value={courseFormValues.imageUrl || ''} onChange={e => setCourseFormValues(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
              </Col>
            </Row>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Popconfirm title="Are you sure you want to continue?" onConfirm={() => handleSaveSection('info')} okText="Yes" cancelText="No">
                <Button type="primary" icon={<SaveOutlined />} loading={courseSubmitting}>
                  {t('admin.tools.course.btn.save')}
                </Button>
              </Popconfirm>
              <Button icon={<CloseCircleOutlined />} onClick={() => handleToggleEdit('info')}>
                {t('admin.tools.course.btn.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.courseName')}>{cd.course || '—'}</Descriptions.Item>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.teacher')}>{cd.teacher || '—'}</Descriptions.Item>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.location')}>{cd.location || '—'}</Descriptions.Item>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.gatheringDay')}>{cd.gatheringDay || '—'}</Descriptions.Item>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.gatheringTime')}>{cd.gatheringTime || '—'}</Descriptions.Item>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.gatheringStartingDate')}>{cd.gatheringStartingDate || '—'}</Descriptions.Item>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.courseWeeksLength')}>{cd.courseWeeksLength ?? '—'}</Descriptions.Item>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.imageUrl')}>{cd.imageUrl ? <a href={cd.imageUrl} target="_blank" rel="noreferrer">View</a> : '—'}</Descriptions.Item>
          </Descriptions>
        )}

        {/* Section: Dates */}
        <Divider titlePlacement="left">
          <EnvironmentOutlined style={{ marginRight: 6 }} />{setLocale(locale, 'admin.tools.course.section.dates')}
          <Button type="link" size="small" icon={editingSections.dates ? <CloseCircleOutlined /> : <EditOutlined />} onClick={() => handleToggleEdit('dates')} style={{ marginLeft: 8 }}>
            {editingSections.dates ? t('admin.tools.course.btn.cancel') : t('admin.tools.course.btn.edit')}
          </Button>
        </Divider>
        {editingSections.dates ? (
          <div style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.startDate')}</strong></div><DatePicker value={courseFormValues.StartDate ? dayjs(courseFormValues.StartDate) : null} onChange={(d) => { const iso = d ? d.toISOString() : null; setCourseFormValues(p => { const updated = { ...p, StartDate: iso }; if (iso && p.courseWeeksLength) { updated.EndDate = dayjs(iso).add(p.courseWeeksLength, 'week').toISOString(); } return updated; }); }} style={{ width: '100%' }} /></Col>
              <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.courseWeeksLength')}</strong></div><InputNumber min={1} max={52} value={courseFormValues.courseWeeksLength} onChange={v => setCourseFormValues(p => { const updated = { ...p, courseWeeksLength: v }; if (p.StartDate && v) { updated.EndDate = dayjs(p.StartDate).add(v, 'week').toISOString(); } return updated; })} style={{ width: '100%' }} /></Col>
              <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.endDate')}</strong></div><DatePicker value={courseFormValues.EndDate ? dayjs(courseFormValues.EndDate) : null} onChange={(d) => setCourseFormValues(p => ({ ...p, EndDate: d ? d.toISOString() : null }))} style={{ width: '100%' }} /></Col>
            </Row>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Popconfirm title="Are you sure you want to continue?" onConfirm={() => handleSaveSection('dates')} okText="Yes" cancelText="No">
                <Button type="primary" icon={<SaveOutlined />} loading={courseSubmitting}>
                  {t('admin.tools.course.btn.save')}
                </Button>
              </Popconfirm>
              <Button icon={<CloseCircleOutlined />} onClick={() => handleToggleEdit('dates')}>
                {t('admin.tools.course.btn.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <Descriptions column={{ xs: 1, sm: 3 }} size="small" bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.creationDate')}>{c.CreationDate ? new Date(c.CreationDate).toLocaleDateString() : '—'}</Descriptions.Item>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.startDate')}>{c.StartDate ? new Date(c.StartDate).toLocaleDateString() : '—'}</Descriptions.Item>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.endDate')}>{c.EndDate ? new Date(c.EndDate).toLocaleDateString() : '—'}</Descriptions.Item>
          </Descriptions>
        )}

        {/* Section: Links & Audience */}
        <Divider titlePlacement="left">
          <GlobalOutlined style={{ marginRight: 6 }} />{setLocale(locale, 'admin.tools.course.section.links')}
          <Button type="link" size="small" icon={editingSections.links ? <CloseCircleOutlined /> : <EditOutlined />} onClick={() => handleToggleEdit('links')} style={{ marginLeft: 8 }}>
            {editingSections.links ? t('admin.tools.course.btn.cancel') : t('admin.tools.course.btn.edit')}
          </Button>
        </Divider>
        {editingSections.links ? (
          <div style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong><MessageOutlined style={{ marginRight: 4, color: '#25D366' }} />{t('admin.tools.course.label.whatsAppLink')}</strong></div><Input value={courseFormValues.whatsAppLink || ''} onChange={e => setCourseFormValues(p => ({ ...p, whatsAppLink: e.target.value }))} /></Col>
              <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.targetAudience')}</strong></div><Select value={courseFormValues.targetAudienceNativeLanguage || undefined} onChange={v => setCourseFormValues(p => ({ ...p, targetAudienceNativeLanguage: v }))} options={langData.map(l => ({ value: l.langName, label: l.langName }))} style={{ width: '100%' }} /></Col>
              <Col xs={24} sm={8} style={{ marginTop: 8 }}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.nativeLanguage')}</strong></div><Select value={courseFormValues.NativeLanguageId || undefined} onChange={v => setCourseFormValues(p => ({ ...p, NativeLanguageId: v }))} options={langOptions} style={{ width: '100%' }} /></Col>
              <Col xs={24} sm={8} style={{ marginTop: 8 }}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.targetLanguage')}</strong></div><Select value={courseFormValues.TargetLanguageId || undefined} onChange={v => setCourseFormValues(p => ({ ...p, TargetLanguageId: v }))} options={langOptions} style={{ width: '100%' }} /></Col>
            </Row>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Popconfirm title="Are you sure you want to continue?" onConfirm={() => handleSaveSection('links')} okText="Yes" cancelText="No">
                <Button type="primary" icon={<SaveOutlined />} loading={courseSubmitting}>
                  {t('admin.tools.course.btn.save')}
                </Button>
              </Popconfirm>
              <Button icon={<CloseCircleOutlined />} onClick={() => handleToggleEdit('links')}>
                {t('admin.tools.course.btn.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.nativeLanguage')}>
              {nativeLang ? <><Flag code={nativeLang.icon} style={{ width: 20, marginRight: 6, verticalAlign: 'middle' }} />{nativeLang.langName}</> : (c.NativeLanguageId || '—')}
            </Descriptions.Item>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.targetLanguage')}>
              {targetLang ? <><Flag code={targetLang.icon} style={{ width: 20, marginRight: 6, verticalAlign: 'middle' }} />{targetLang.langName}</> : (c.TargetLanguageId || '—')}
            </Descriptions.Item>
            <Descriptions.Item label={<span><MessageOutlined style={{ marginRight: 4, color: '#25D366' }} />{setLocale(locale, 'admin.tools.course.label.whatsAppLink')}</span>}>
              {cd.whatsAppLink ? <a href={cd.whatsAppLink} target="_blank" rel="noreferrer">{cd.whatsAppLink}</a> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.targetAudience')}>{cd.targetAudienceNativeLanguage || '—'}</Descriptions.Item>
          </Descriptions>
        )}
      </>
    );

    const createContent = (
      <>
        {/* Template selector */}
        <div style={{ marginBottom: 16 }}>
          <strong>{setLocale(locale, 'admin.tools.course.btn.useTemplate')}</strong>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Select
              showSearch={{
                filterOption: (input, option) =>
                  (option?.label || '').toString().toLowerCase().includes(input.toLowerCase())
              }}
              placeholder={t('admin.tools.course.searchPlaceholder')}
              value={courseTemplateId}
              onChange={handleUseTemplate}
              style={{ flex: 1 }}
              allowClear
              onClear={() => { setCourseFormValues({}); setCourseTemplateId(null); }}
              options={(allRawCourses || []).map(c => ({ value: c.CourseCodeId, label: `${c.CourseDetails?.course || ''} — ${c.CourseCodeId}`, imageUrl: c.CourseDetails?.imageUrl }))}
              optionRender={(option) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar size={24} src={option.data.imageUrl} icon={<BookOutlined />} style={{ flexShrink: 0 }} />
                  <span>{option.label}</span>
                </div>
              )}
            />
          </div>
        </div>

        <Divider />

        {/* Generated CourseCodeId preview */}
        {createCourseGeneratedId && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
            <strong>{t('admin.tools.course.label.generatedId')}:</strong>{' '}
            <Tag color="green">{createCourseGeneratedId}</Tag>
          </div>
        )}

        {/* Form fields */}
        <Row gutter={16}>
          <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.courseName')} *</strong></div><Input value={courseFormValues.course || ''} onChange={e => setCourseFormValues(p => ({ ...p, course: e.target.value }))} /></Col>
          <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.teacher')} *</strong></div><Input value={courseFormValues.teacher || ''} onChange={e => setCourseFormValues(p => ({ ...p, teacher: e.target.value }))} /></Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.startDate')} *</strong></div><DatePicker value={courseFormValues.StartDate ? dayjs(courseFormValues.StartDate) : null} onChange={(d) => { const iso = d ? d.toISOString() : null; setCourseFormValues(p => { const updated = { ...p, StartDate: iso }; if (iso && p.courseWeeksLength) { updated.EndDate = dayjs(iso).add(p.courseWeeksLength, 'week').toISOString(); } if (iso && !p.gatheringStartingDate) { updated.gatheringStartingDate = dayjs(iso).format('MMMM D, YYYY'); } return updated; }); }} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.courseWeeksLength')} *</strong></div><InputNumber min={1} max={52} value={courseFormValues.courseWeeksLength} onChange={v => setCourseFormValues(p => { const updated = { ...p, courseWeeksLength: v }; if (p.StartDate && v) { updated.EndDate = dayjs(p.StartDate).add(v, 'week').toISOString(); } return updated; })} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.endDate')} *</strong></div><DatePicker value={courseFormValues.EndDate ? dayjs(courseFormValues.EndDate) : null} onChange={(d) => setCourseFormValues(p => ({ ...p, EndDate: d ? d.toISOString() : null }))} style={{ width: '100%' }} /></Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.nativeLanguage')} *</strong></div><Select value={courseFormValues.NativeLanguageId || undefined} onChange={v => setCourseFormValues(p => ({ ...p, NativeLanguageId: v }))} options={langOptions} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.targetLanguage')} *</strong></div><Select value={courseFormValues.TargetLanguageId || undefined} onChange={v => setCourseFormValues(p => ({ ...p, TargetLanguageId: v }))} options={langOptions} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.location')} *</strong></div><Input value={courseFormValues.location || ''} onChange={e => setCourseFormValues(p => ({ ...p, location: e.target.value }))} /></Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={6}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.gatheringDay')} *</strong></div><Select value={courseFormValues.gatheringDay || undefined} onChange={v => setCourseFormValues(p => ({ ...p, gatheringDay: v }))} options={[{value:'Mondays',label:'Mondays'},{value:'Tuesdays',label:'Tuesdays'},{value:'Wednesdays',label:'Wednesdays'},{value:'Thursdays',label:'Thursdays'},{value:'Fridays',label:'Fridays'},{value:'Saturdays',label:'Saturdays'},{value:'Sundays',label:'Sundays'}]} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={6}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.gatheringTime')} *</strong></div><TimePicker use12Hours format="h:mm a" value={courseFormValues.gatheringTime ? dayjs(courseFormValues.gatheringTime, 'h:mm a') : null} onChange={(t) => setCourseFormValues(p => ({ ...p, gatheringTime: t ? t.format('h:mm a') : '' }))} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.gatheringStartingDate')} *</strong></div><DatePicker value={courseFormValues.gatheringStartingDate ? dayjs(courseFormValues.gatheringStartingDate, 'MMMM D, YYYY') : null} onChange={(d) => setCourseFormValues(p => ({ ...p, gatheringStartingDate: d ? d.format('MMMM D, YYYY') : '' }))} style={{ width: '100%' }} /></Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.targetAudience')} *</strong></div><Select value={courseFormValues.targetAudienceNativeLanguage || undefined} onChange={v => setCourseFormValues(p => ({ ...p, targetAudienceNativeLanguage: v }))} options={langData.map(l => ({ value: l.langName, label: l.langName }))} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong><MessageOutlined style={{ marginRight: 4, color: '#25D366' }} />{t('admin.tools.course.label.whatsAppLink')} *</strong></div><Input value={courseFormValues.whatsAppLink || ''} onChange={e => setCourseFormValues(p => ({ ...p, whatsAppLink: e.target.value }))} /></Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24}>
            <div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.imageSource')} *</strong></div>
            <Radio.Group
              value={courseImageSourceMode}
              onChange={(e) => {
                const next = e.target.value;
                setCourseImageSourceMode(next);
                // Switching modes clears the staged image so the two paths can't bleed into each other.
                setCourseFormValues(p => ({ ...p, imageUrl: '', _imageFile: undefined }));
              }}
              style={{ marginBottom: 8 }}
            >
              <Radio.Button value="upload">
                <UploadOutlined style={{ marginRight: 4 }} />
                {t('admin.tools.course.label.imageSource.upload')}
              </Radio.Button>
              <Radio.Button value="url">
                <GlobalOutlined style={{ marginRight: 4 }} />
                {t('admin.tools.course.label.imageSource.url')}
              </Radio.Button>
            </Radio.Group>
            {courseImageSourceMode === 'url' ? (
              <Input
                value={courseFormValues.imageUrl || ''}
                onChange={e => setCourseFormValues(p => ({ ...p, imageUrl: e.target.value, _imageFile: undefined }))}
                placeholder="https://..."
                status={courseFormValues.imageUrl && !isValidHttpUrl(courseFormValues.imageUrl) ? 'error' : ''}
              />
            ) : (
              <Upload
                accept="image/*"
                maxCount={1}
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = () => setCourseFormValues(p => ({ ...p, imageUrl: reader.result, _imageFile: file }));
                  reader.readAsDataURL(file);
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>{t('admin.tools.course.label.uploadImage')}</Button>
              </Upload>
            )}
            {courseImageSourceMode === 'url' && courseFormValues.imageUrl && !isValidHttpUrl(courseFormValues.imageUrl) && (
              <div style={{ color: '#ff4d4f', marginTop: 4, fontSize: 12 }}>
                {t('admin.tools.course.msg.invalidImageUrl')}
              </div>
            )}
            {courseFormValues.imageUrl && (
              <Avatar size={48} src={courseFormValues.imageUrl} icon={<BookOutlined />} style={{ marginTop: 8 }} />
            )}
          </Col>
        </Row>

        {!courseCreateValidation.isComplete && (
          <Alert
            type={courseCreateValidation.hasInvalidImageUrl ? 'error' : 'info'}
            showIcon
            style={{ marginTop: 16 }}
            title={`${t('admin.tools.course.msg.fillRequired')} ${courseCreateValidation.missingLabels.join(', ')}`}
            description={courseCreateValidation.hasInvalidImageUrl ? t('admin.tools.course.msg.invalidImageUrl') : null}
          />
        )}

        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCourse} loading={courseSubmitting} style={{ marginTop: 16 }} disabled={!courseCreateValidation.isComplete || courseSubmitting}>
          {t('admin.tools.course.btn.create')}
        </Button>
      </>
    );

    return (
      <Card variant="outlined" size="small" style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 12 }}>
          <SolutionOutlined style={{ marginRight: 8 }} />
          {setLocale(locale, 'admin.tools.course.courseSummary')}
        </h4>

        <Radio.Group
          value={courseTabKey}
          onChange={(e) => setCourseTabKey(e.target.value)}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="summary">{setLocale(locale, 'admin.tools.course.tab.summary')}</Radio.Button>
          <Radio.Button value="detailed">{setLocale(locale, 'admin.tools.course.tab.detailed')}</Radio.Button>
          <Radio.Button value="create"><PlusOutlined style={{ marginRight: 4 }} />{setLocale(locale, 'admin.tools.course.tab.create')}</Radio.Button>
        </Radio.Group>

        {courseTabKey === 'summary' && summaryContent}
        {courseTabKey === 'detailed' && detailedContent}
        {courseTabKey === 'create' && createContent}
      </Card>
    );
  };

  const renderCourseManagement = () => (
    <>
      {/* Step 1: Search Course */}
      <Card variant="outlined" size="small" style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 12 }}>
          <BookOutlined style={{ marginRight: 8 }} />
          {setLocale(locale, 'admin.tools.course.searchCourse')}
        </h4>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <AutoComplete
            style={{ flex: 1 }}
            options={courseSearchOptions}
            value={courseSearchText}
            showSearch={{ onSearch: handleCourseSearchChange, filterOption: false }}
            onChange={handleCourseSearchChange}
            onSelect={handleCourseSelect}
            placeholder={t('admin.tools.course.searchPlaceholder')}
          >
            <Input prefix={<SearchOutlined />} size="large" />
          </AutoComplete>
          {selectedCourseObj && (
            <Button type="text" danger icon={<CloseCircleOutlined />} onClick={handleClearCourse} size="large">
              {setLocale(locale, 'admin.tools.course.clearSelection')}
            </Button>
          )}
        </div>
      </Card>

      {/* Step 2: Course Summary/Detail/Create */}
      {renderCourseSummary()}

      {/* Empty state: no course selected and no search text — also offer create */}
      {!selectedCourseObj && !courseSearchText && (
        <div>
          <Empty description={setLocale(locale, 'admin.tools.course.searchToGetStarted')} style={{ marginTop: 40, marginBottom: 16 }} />
          <div style={{ textAlign: 'center' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedCourseObj({ _isNew: true, CourseDetails: {} }); handleInitCreateTab(); }}>
              {setLocale(locale, 'admin.tools.course.btn.createBlank')}
            </Button>
          </div>
        </div>
      )}
    </>
  );

  const buildContactProfileRowSelection = (selectedRowKeys, setRowKeys, setRows) => ({
    selectedRowKeys,
    onChange: (nextSelectedRowKeys, nextSelectedRows) => {
      setRowKeys(nextSelectedRowKeys);
      setRows(nextSelectedRows);
    },
    getCheckboxProps: () => ({
      disabled: !canManageContactProfileMonitoring
    })
  });

  const inactiveContactProfileRowSelection = buildContactProfileRowSelection(
    selectedInactiveProfileRowKeys,
    setSelectedInactiveProfileRowKeys,
    setSelectedInactiveProfileRows
  );

  const renderGeneralAccessMonitoring = () => (
    (monitoringLoading || (emailId && allUserLoginFootprint?.emailId !== emailId)) ? (
      <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
        {setLocale(locale, 'admin.tools.monitoring.loading')}
      </p>
    ) : (
      <>
        <Divider titlePlacement="left">
          <LoginOutlined style={{ marginRight: 6 }} />
          {setLocale(locale, 'admin.tools.monitoring.loginHeatmap')}
        </Divider>
        <LoginFootprintHeatmapGraph
          hideCard
          heatmapData={allUserLoginFootprint?.heatmapData || []}
          emptyDescriptionKey="admin.tools.loginFootprint.noActivity"
        />

        <Divider titlePlacement="left">
          <LineChartOutlined style={{ marginRight: 6 }} />
          {setLocale(locale, 'admin.tools.monitoring.loginBubbleScatter')}
        </Divider>
        <LoginFootprintBubbleScatterGraph
          hideCard
          scatterData={allUserLoginFootprint?.scatterData || []}
          emptyDescriptionKey="admin.tools.loginFootprint.noActivity"
        />

        <Divider titlePlacement="left">
          <TableOutlined style={{ marginRight: 6 }} />
          {setLocale(locale, 'admin.tools.monitoring.loginBreakdownTable')}
        </Divider>
        <AbstractTable
          tableData={allUserLoginFootprint?.tableModel?.tableData || []}
          tableColumns={allUserLoginFootprint?.tableModel?.columns || []}
          tableExpandables={allUserLoginFootprint?.tableModel?.expandable}
          isAllowedToEditTableData={false}
          isToRenderActionButton={false}
        />
      </>
    )
  );

  const renderContactProfilesMonitoring = () => {
    const noEmailFilteredCount = getContactProfileFilteredCount(
      'noEmail',
      filteredNoEmailContactProfileData,
      { showDefaultTotal: true }
    );
    const optedOutFilteredCount = getContactProfileFilteredCount(
      'optedOut',
      filteredOptedOutContactProfileData
    );
    const inactiveFilteredCount = getContactProfileFilteredCount(
      'inactive',
      filteredInactiveContactProfileData,
      { showDefaultTotal: true }
    );
    const restoreCommunicationConfirmMessage = intl.formatMessage(
      { id: 'admin.tools.monitoring.msg.restoreCommunicationConfirm' },
      { count: selectedOptedOutEmailRows.length }
    );
    const reactivateContactsConfirmMessage = intl.formatMessage(
      { id: 'admin.tools.monitoring.msg.reactivateContactsConfirm' },
      { count: selectedInactiveProfileRows.length }
    );

    return (
      <>
        <Divider titlePlacement="left" style={{ marginTop: 0 }}>
          <UserOutlined style={{ marginRight: 6 }} />
          {setLocale(locale, 'admin.tools.monitoring.tab.contactProfiles')}
        </Divider>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            value={contactProfileSearchText}
            onChange={(event) => setContactProfileSearchText(event.target.value)}
            placeholder={t('admin.tools.monitoring.contactProfiles.searchPlaceholder')}
            style={{ maxWidth: 520 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleManualRefreshContactProfileMonitoring}
            loading={contactProfileMonitoringLoading}
            disabled={!canManageContactProfileMonitoring}
          >
            {setLocale(locale, 'admin.tools.monitoring.refresh')}
          </Button>
        </div>

        {!canManageContactProfileMonitoring && (
          <Alert
            type="warning"
            showIcon
            title={setLocale(locale, 'admin.tools.msg.notEnoughContactProfileMonitoringPermissions')}
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ opacity: canManageContactProfileMonitoring ? 1 : 0.55 }}>
          <Divider titlePlacement="left">
            <MailOutlined style={{ marginRight: 6 }} />
            {setLocale(locale, 'admin.tools.monitoring.noEmailProfiles')}
            {getContactProfileCountSuffix(noEmailFilteredCount)}
          </Divider>
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            description={setLocale(locale, 'admin.tools.monitoring.noEmailProfiles.description')}
          />
          <AbstractTable
            key={`no-email-${contactProfileSearchText}`}
            tableData={filteredNoEmailContactProfileData}
            tableColumns={noEmailContactProfileTableModel?.columns || []}
            tableExpandables={noEmailContactProfileTableModel?.expandable}
            isAllowedToEditTableData={false}
            isToRenderActionButton={false}
            rowKey="key"
            loading={isContactProfileMonitoringTableLoading}
            onChange={handleContactProfileTableChange('noEmail')}
          />

          <Divider titlePlacement="left">
            <MessageOutlined style={{ marginRight: 6 }} />
            {setLocale(locale, 'admin.tools.monitoring.communicationOptOuts')}
            {getContactProfileCountSuffix(optedOutFilteredCount)}
          </Divider>
          <AbstractTable
            key={`opted-out-${contactProfileSearchText}`}
            tableData={filteredOptedOutContactProfileData}
            tableColumns={optedOutContactProfileTableModel?.columns || []}
            tableExpandables={optedOutContactProfileTableModel?.expandable}
            isAllowedToEditTableData={false}
            isToRenderActionButton={false}
            rowKey="key"
            loading={isContactProfileMonitoringTableLoading}
            onChange={handleContactProfileTableChange('optedOut')}
          />
          <Popconfirm
            title={restoreCommunicationConfirmMessage}
            onConfirm={handleRestoreSelectedCommunication}
            okText={t('admin.tools.confirmYes')}
            cancelText={t('admin.tools.confirmNo')}
            disabled={!canManageContactProfileMonitoring || selectedOptedOutEmailRows.length === 0}
          >
            <Button
              type="primary"
              icon={<MessageOutlined />}
              loading={contactProfileSubmitLoading.optedOut}
              disabled={!canManageContactProfileMonitoring || selectedOptedOutEmailRows.length === 0}
              style={{ marginTop: 12 }}
            >
              {setLocale(locale, 'admin.tools.monitoring.restoreCommunication')}
            </Button>
          </Popconfirm>

          <Divider titlePlacement="left" style={{ marginTop: 24 }}>
            <CloseCircleOutlined style={{ marginRight: 6 }} />
            {setLocale(locale, 'admin.tools.monitoring.inactiveProfiles')}
            {getContactProfileCountSuffix(inactiveFilteredCount)}
          </Divider>
          <AbstractTable
            key={`inactive-${contactProfileSearchText}`}
            tableData={filteredInactiveContactProfileData}
            tableColumns={inactiveContactProfileTableModel?.columns || []}
            tableExpandables={inactiveContactProfileTableModel?.expandable}
            isAllowedToEditTableData={false}
            isToRenderActionButton={false}
            rowSelection={inactiveContactProfileRowSelection}
            rowKey="key"
            loading={isContactProfileMonitoringTableLoading}
            onChange={handleContactProfileTableChange('inactive')}
          />
          <Popconfirm
            title={reactivateContactsConfirmMessage}
            onConfirm={handleReactivateSelectedContacts}
            okText={t('admin.tools.confirmYes')}
            cancelText={t('admin.tools.confirmNo')}
            disabled={!canManageContactProfileMonitoring || selectedInactiveProfileRows.length === 0}
          >
            <Button
              type="primary"
              danger
              icon={<UserOutlined />}
              loading={contactProfileSubmitLoading.inactive}
              disabled={!canManageContactProfileMonitoring || selectedInactiveProfileRows.length === 0}
              style={{ marginTop: 12 }}
            >
              {setLocale(locale, 'admin.tools.monitoring.reactivateContacts')}
            </Button>
          </Popconfirm>
        </div>
      </>
    );
  };

  const renderProcessLogsMonitoring = () => {
    const updateProcessLogFilter = (fieldName, value) => {
      setProcessLogFilters(prev => ({
        ...prev,
        [fieldName]: value,
        ...(fieldName !== 'offset' ? { offset: 0 } : {})
      }));
    };
    const renderFilterTooltip = (tooltipKey, child) => (
      <Tooltip title={t(tooltipKey)} placement="topLeft">
        <div>{child}</div>
      </Tooltip>
    );

    return (
      <div>
        <Alert
          type="info"
          showIcon
          title={setLocale(locale, 'admin.tools.monitoring.processLogs.description')}
          style={{ marginBottom: 16 }}
        />

        <Tabs
          activeKey={processLogSourceKey}
          onChange={(nextSourceKey) => {
            setProcessLogSourceKey(nextSourceKey);
            setProcessLogFilters(prev => ({ ...prev, offset: 0 }));
          }}
          items={getProcessLogSourceConfigs().map(sourceConfig => ({
            key: sourceConfig.key,
            label: (
              <span>
                <TableOutlined style={{ marginRight: 6 }} />
                {setLocale(locale, sourceConfig.localeKey)}
              </span>
            )
          }))}
        />

        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={4}>
            {renderFilterTooltip('admin.tools.monitoring.processLogs.tooltip.severity', (
              <Select
                value={processLogFilters.severity}
                onChange={value => updateProcessLogFilter('severity', value)}
                options={getProcessLogSeverityOptions().map(option => ({
                  value: option.value,
                  label: option.labelKey ? t(option.labelKey) : option.value
                }))}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={24} sm={12} md={16} lg={6}>
            {renderFilterTooltip('admin.tools.monitoring.processLogs.tooltip.dateRange', (
              <DatePicker.RangePicker
                value={processLogFilters.dateRange?.length ? processLogFilters.dateRange : null}
                onChange={dates => updateProcessLogFilter('dateRange', dates || [])}
                style={{ width: '100%' }}
                allowClear
              />
            ))}
          </Col>
          <Col xs={24} md={12} lg={6}>
            {renderFilterTooltip('admin.tools.monitoring.processLogs.tooltip.search', (
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder={t('admin.tools.monitoring.processLogs.searchPlaceholder')}
                value={processLogFilters.searchText}
                onChange={event => updateProcessLogFilter('searchText', event.target.value)}
              />
            ))}
          </Col>
          <Col xs={24} md={12} lg={4}>
            {renderFilterTooltip('admin.tools.monitoring.processLogs.tooltip.method', (
              <Input
                allowClear
                placeholder={t('admin.tools.monitoring.processLogs.methodSearchPlaceholder')}
                value={processLogFilters.methodSearchText}
                onChange={event => updateProcessLogFilter('methodSearchText', event.target.value)}
              />
            ))}
          </Col>
          <Col xs={24} md={12} lg={4}>
            {renderFilterTooltip('admin.tools.monitoring.processLogs.tooltip.user', (
              <Input
                allowClear
                placeholder={t('admin.tools.monitoring.processLogs.userSearchPlaceholder')}
                value={processLogFilters.userSearchText}
                onChange={event => updateProcessLogFilter('userSearchText', event.target.value)}
              />
            ))}
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            {renderFilterTooltip('admin.tools.monitoring.processLogs.tooltip.role', (
              <Select
                value={processLogFilters.role}
                onChange={value => updateProcessLogFilter('role', value)}
                options={processLogRoleOptions}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            {renderFilterTooltip('admin.tools.monitoring.processLogs.tooltip.limit', (
              <Select
                value={processLogFilters.limit}
                onChange={value => updateProcessLogFilter('limit', value)}
                options={getProcessLogLimitOptions()}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            {renderFilterTooltip('admin.tools.monitoring.processLogs.tooltip.offset', (
              <InputNumber
                min={0}
                step={processLogFilters.limit}
                value={processLogFilters.offset}
                onChange={value => updateProcessLogFilter('offset', Number(value || 0))}
                style={{ width: '100%' }}
                placeholder={t('admin.tools.monitoring.processLogs.offset')}
              />
            ))}
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            {renderFilterTooltip('admin.tools.monitoring.processLogs.tooltip.refresh', (
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={processLogLoading}
                onClick={() => loadProcessLogs()}
                block
              >
                {setLocale(locale, 'admin.tools.monitoring.processLogs.refresh')}
              </Button>
            ))}
          </Col>
        </Row>

        <Table
          size="small"
          rowKey="key"
          columns={processLogColumns}
          dataSource={filteredProcessLogRows}
          loading={processLogLoading}
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 25,
            showSizeChanger: true,
            showTotal: total => t('admin.tools.monitoring.processLogs.totalRows', { total })
          }}
          locale={{
            emptyText: setLocale(locale, 'admin.tools.monitoring.processLogs.noData')
          }}
          expandable={{
            rowExpandable: record => record?.eventDataText && record.eventDataText !== '-',
            expandedRowRender: record => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong>{setLocale(locale, 'admin.tools.monitoring.processLogs.eventData')}</strong>
                  <Button
                    size="small"
                    type="link"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopyProcessLogEventData(record)}
                  >
                    {setLocale(locale, 'admin.tools.monitoring.processLogs.copyEventData')}
                  </Button>
                </div>
                <div
                  style={{
                    padding: 12,
                    background: '#f6f8fa',
                    border: '1px solid #e6ebf1',
                    borderRadius: 6,
                    maxHeight: 360,
                    overflow: 'auto'
                  }}
                >
                  <JsonView
                    value={record.eventDataJson || {}}
                    collapsed={2}
                    displayDataTypes={false}
                    enableClipboard
                    style={{ background: 'transparent' }}
                  />
                </div>
              </div>
            )
          }}
        />
      </div>
    );
  };

  const renderMonitoring = () => (
    <Card variant="outlined" size="small" style={{ marginBottom: 16 }}>
      <h4 style={{ marginBottom: 12 }}>
        <DashboardOutlined style={{ marginRight: 8 }} />
        {setLocale(locale, 'admin.tools.monitoring.title')}
      </h4>

      <Radio.Group
        value={monitoringInnerTabKey}
        onChange={(event) => setMonitoringInnerTabKey(event.target.value)}
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="general-access">{setLocale(locale, 'admin.tools.monitoring.tab.generalAccess')}</Radio.Button>
        <Radio.Button value="contact-profiles">{setLocale(locale, 'admin.tools.monitoring.tab.contactProfiles')}</Radio.Button>
        <Radio.Button value="process-logs">{setLocale(locale, 'admin.tools.monitoring.tab.processLogs')}</Radio.Button>
      </Radio.Group>

      {monitoringInnerTabKey === 'general-access' && renderGeneralAccessMonitoring()}
      {monitoringInnerTabKey === 'contact-profiles' && renderContactProfilesMonitoring()}
      {monitoringInnerTabKey === 'process-logs' && renderProcessLogsMonitoring()}
    </Card>
  );

  const renderMessagingFilters = () => {
    const renderFilterTooltip = (tooltipKey, child) => (
      <Tooltip title={t(tooltipKey)} placement="topLeft">
        <div>{child}</div>
      </Tooltip>
    );

    return (
      <div>
        <Alert
          type="info"
          showIcon
          title={setLocale(locale, 'admin.tools.messaging.filtersDescription')}
          style={{ marginBottom: 12 }}
        />

        <Card
          size="small"
          title={setLocale(locale, 'admin.tools.messaging.filterSection.search')}
          style={{ marginBottom: 12 }}
        >
        <Row gutter={[12, 12]}>
          <Col xs={24}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.search', (
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder={t('admin.tools.messaging.searchPlaceholder')}
                value={audienceFilters.searchText}
                onChange={event => updateAudienceFilter('searchText', event.target.value)}
              />
            ))}
          </Col>
        </Row>
        </Card>

        <Card
          size="small"
          title={setLocale(locale, 'admin.tools.messaging.filterSection.searchAndPaging')}
          style={{ marginBottom: 12 }}
        >
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={8} lg={4}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.sex', (
              <Select
                value={audienceFilters.sex}
                options={audienceOptions.sex}
                onChange={value => updateAudienceFilter('sex', value)}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={12} sm={8} lg={3}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.minAge', (
              <InputNumber
                min={0}
                max={120}
                value={audienceFilters.minAge}
                onChange={value => updateAudienceFilter('minAge', value)}
                placeholder={t('admin.tools.messaging.minAge')}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={12} sm={8} lg={3}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.maxAge', (
              <InputNumber
                min={0}
                max={120}
                value={audienceFilters.maxAge}
                onChange={value => updateAudienceFilter('maxAge', value)}
                placeholder={t('admin.tools.messaging.maxAge')}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={12} sm={8} lg={3}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.limit', (
              <Select
                value={audienceFilters.limit}
                options={[50, 100, 250, 500].map(value => ({ value, label: String(value) }))}
                onChange={value => updateAudienceFilter('limit', value)}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={12} sm={8} lg={3}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.offset', (
              <InputNumber
                min={0}
                step={audienceFilters.limit}
                value={audienceFilters.offset}
                onChange={value => updateAudienceFilter('offset', Number(value || 0))}
                placeholder={t('admin.tools.messaging.offset')}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
        </Row>
        </Card>

        <Card
          size="small"
          title={setLocale(locale, 'admin.tools.messaging.filterSection.demographics')}
          style={{ marginBottom: 12 }}
        >
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12} lg={4}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.locationType', (
              <Select
                value={audienceFilters.locationType}
                options={audienceOptions.locationTypes}
                onChange={(value) => {
                  setAudienceFilters(previousFilters => ({
                    ...previousFilters,
                    locationType: value,
                    countryNameOrId: null,
                    locationRegionName: null,
                    offset: 0
                  }));
                }}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={24} md={12} lg={5}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.country', (
              <Select
                allowClear
                showSearch
                value={audienceFilters.countryNameOrId}
                placeholder={t('admin.tools.messaging.countryPlaceholder')}
                options={audienceCountryOptions}
                optionFilterProp="searchText"
                onChange={(value) => {
                  setAudienceFilters(previousFilters => ({
                    ...previousFilters,
                    countryNameOrId: value || null,
                    locationRegionName: null,
                    offset: 0
                  }));
                }}
                loading={audienceMetadataLoading}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={24} md={12} lg={5}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.region', (
              <Select
                allowClear
                showSearch
                disabled={!audienceFilters.countryNameOrId}
                value={audienceFilters.locationRegionName}
                placeholder={t('admin.tools.messaging.regionPlaceholder')}
                options={audienceRegionOptions}
                optionFilterProp="searchText"
                onChange={value => updateAudienceFilter('locationRegionName', value || null)}
                loading={audienceCountryDivisionsLoading}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={24} md={12} lg={5}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.language', (
              <Select
                allowClear
                showSearch
                value={audienceFilters.languageId}
                placeholder={t('admin.tools.messaging.languagePlaceholder')}
                options={[
                  { value: 'all', label: t('admin.tools.messaging.option.all') },
                  ...audienceLanguageOptions
                ]}
                optionFilterProp="searchText"
                onChange={value => updateAudienceFilter('languageId', value || 'all')}
                loading={audienceMetadataLoading}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={24} md={12} lg={5}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.languageLevel', (
              <Select
                allowClear
                showSearch
                value={audienceFilters.languageLevel}
                placeholder={t('admin.tools.messaging.languageLevelPlaceholder')}
                options={[
                  { value: 'all', label: t('admin.tools.messaging.option.all') },
                  ...audienceLanguageLevelOptions
                ]}
                optionFilterProp="searchText"
                onChange={value => updateAudienceFilter('languageLevel', value || 'all')}
                loading={audienceMetadataLoading}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
        </Row>
        </Card>

        <Card
          size="small"
          title={setLocale(locale, 'admin.tools.messaging.filterSection.coursesAndSignals')}
          style={{ marginBottom: 12 }}
        >
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} lg={10}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.includeCourses', (
              <Select
                mode="multiple"
                allowClear
                showSearch
                value={audienceFilters.courseCodeIds}
                placeholder={t('admin.tools.messaging.includeCoursesPlaceholder')}
                options={audienceCourseOptions}
                optionFilterProp="searchText"
                onChange={value => updateAudienceFilter('courseCodeIds', value || [])}
                loading={audienceMetadataLoading}
                maxTagCount={3}
                tagRender={renderAudienceCourseTag}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={24} lg={10}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.excludeCourses', (
              <Select
                mode="multiple"
                allowClear
                showSearch
                value={audienceFilters.excludeCourseCodeIds}
                placeholder={t('admin.tools.messaging.excludeCoursesPlaceholder')}
                options={audienceCourseOptions}
                optionFilterProp="searchText"
                onChange={value => updateAudienceFilter('excludeCourseCodeIds', value || [])}
                loading={audienceMetadataLoading}
                maxTagCount={3}
                tagRender={renderAudienceCourseTag}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={24} lg={4}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.matchAllCourses', (
              <Checkbox
                checked={audienceFilters.matchAllCourses}
                onChange={event => updateAudienceFilter('matchAllCourses', event.target.checked)}
              >
                {setLocale(locale, 'admin.tools.messaging.matchAllCourses')}
              </Checkbox>
            ))}
          </Col>
        </Row>

        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={6}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.progress', (
              <Select
                value={audienceFilters.hasProgress}
                options={audienceOptions.triState}
                onChange={value => updateAudienceFilter('hasProgress', value)}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={24} md={6}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.certifications', (
              <Select
                value={audienceFilters.hasCertifications}
                options={audienceOptions.triState}
                onChange={value => updateAudienceFilter('hasCertifications', value)}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={24} md={6}>
            {renderFilterTooltip('admin.tools.messaging.tooltip.purchases', (
              <Select
                value={audienceFilters.hasPurchases}
                options={audienceOptions.triState}
                onChange={value => updateAudienceFilter('hasPurchases', value)}
                style={{ width: '100%' }}
              />
            ))}
          </Col>
          <Col xs={12} md={3}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={audienceLoading}
              onClick={() => loadAudienceSegment()}
              block
            >
              {setLocale(locale, 'admin.tools.messaging.applyFilters')}
            </Button>
          </Col>
          <Col xs={12} md={3}>
            <Button
              icon={<ReloadOutlined />}
              onClick={resetAudienceFilters}
              block
            >
              {setLocale(locale, 'admin.tools.messaging.clearFilters')}
            </Button>
          </Col>
        </Row>
        </Card>
      </div>
    );
  };

  const renderAudienceExpandedRow = (record) => (
    <Descriptions size="small" column={2} bordered>
      <Descriptions.Item label={t('admin.tools.messaging.column.firstName')}>
        {record.names || '-'}
      </Descriptions.Item>
      <Descriptions.Item label={t('admin.tools.messaging.column.lastName')}>
        {record.lastNames || '-'}
      </Descriptions.Item>
      <Descriptions.Item label={t('admin.tools.messaging.column.internalId')}>
        {record.contactInternalId ? (
          <span>
            <span style={{ wordBreak: 'break-all' }}>{record.contactInternalId}</span>
            <Tooltip title={t('admin.tools.copyInternalId')}>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopyAudienceInternalId(record.contactInternalId)}
                style={{ color: '#1677ff' }}
              />
            </Tooltip>
          </span>
        ) : '-'}
      </Descriptions.Item>
      <Descriptions.Item label={t('admin.tools.messaging.column.externalId')}>
        {record.contactExternalId || '-'}
      </Descriptions.Item>
      <Descriptions.Item label={t('admin.tools.messaging.column.residency')}>
        {renderCountrySummary(record.residencyCountryName, record.residencyCountryAlpha3)}
        {record.residencyRegionName ? ` / ${record.residencyRegionName}` : ''}
      </Descriptions.Item>
      <Descriptions.Item label={t('admin.tools.messaging.column.birth')}>
        {renderCountrySummary(record.birthCountryName, record.birthCountryAlpha3)}
        {record.birthRegionName ? ` / ${record.birthRegionName}` : ''}
      </Descriptions.Item>
      <Descriptions.Item label={t('admin.tools.messaging.column.courses')} span={2}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(record.courseCodes || []).map(courseCode => <Tag key={courseCode}>{courseCode}</Tag>)}
          {(record.courseCodes || []).length === 0 ? '-' : null}
        </div>
      </Descriptions.Item>
      <Descriptions.Item label={t('admin.tools.messaging.column.emails')} span={2}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(record.emailList || []).map(email => <Tag color="blue" key={email}>{email}</Tag>)}
          {(record.emailList || []).length === 0 ? '-' : null}
        </div>
      </Descriptions.Item>
    </Descriptions>
  );

  const renderAudienceTable = () => (
    <>
      {renderMessagingFilters()}
      <Divider titlePlacement="left">
        <TeamOutlined style={{ marginRight: 8 }} />
        {t('admin.tools.messaging.audienceTitle', { count: audienceDisplayCount })}
      </Divider>
      <Table
        rowKey="key"
        size="small"
        loading={audienceLoading}
        columns={audienceColumns}
        dataSource={audienceRows}
        scroll={{ x: 1550 }}
        rowSelection={{
          selectedRowKeys: selectedAudienceRowKeys,
          onChange: (keys, rows) => {
            setSelectedAudienceRowKeys(keys);
            setSelectedAudienceRows(rows);
          }
        }}
        pagination={{
          pageSize: 25,
          showSizeChanger: true,
          showTotal: total => t('admin.tools.messaging.loadedRows', { total })
        }}
        expandable={{
          expandedRowRender: renderAudienceExpandedRow
        }}
        locale={{
          emptyText: setLocale(locale, 'admin.tools.messaging.noAudienceRows')
        }}
      />
    </>
  );

  const renderAudienceVisualization = () => {
    const genderEntries = Object.entries(audienceSummary.genderCounts || {});
    const countryEntries = Object.entries(audienceSummary.residencyCounts || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
    const languageLevelEntries = Object.entries(audienceSummary.languageLevelCounts || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);

    return (
      <div>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {renderRevenueMetricCard('admin.tools.messaging.metric.backendCount', audienceTotalCount, <TeamOutlined />, '#1677ff')}
          {renderRevenueMetricCard('admin.tools.messaging.metric.loadedRows', audienceSummary.totalRows, <TableOutlined />, '#52c41a')}
          {renderRevenueMetricCard('admin.tools.messaging.metric.selectedRows', audienceSummary.selectedRows, <UserOutlined />, '#722ed1')}
          {renderRevenueMetricCard('admin.tools.messaging.metric.emails', audienceSummary.totalEmails, <MailOutlined />, '#fa8c16')}
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card size="small" title={setLocale(locale, 'admin.tools.messaging.genderSnapshot')}>
              {genderEntries.length > 0 ? genderEntries.map(([sex, count]) => (
                <Tag key={sex} color={getSexTagColor(sex)}>
                  {getSexDisplayLabel(sex)}: {count}
                </Tag>
              )) : <Empty description={setLocale(locale, 'admin.tools.messaging.noAudienceRows')} />}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small" title={setLocale(locale, 'admin.tools.messaging.residencySnapshot')}>
              {countryEntries.length > 0 ? countryEntries.map(([country, count]) => (
                <Tag key={country} color="green" style={{ marginBottom: 6 }}>
                  {renderCountrySummary(country, audienceSummary.residencyCountryAlpha3ByName?.[country])}: {count}
                </Tag>
              )) : <Empty description={setLocale(locale, 'admin.tools.messaging.noAudienceRows')} />}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small" title={setLocale(locale, 'admin.tools.messaging.languageLevelSnapshot')}>
              {languageLevelEntries.length > 0 ? languageLevelEntries.map(([languageLevelKey, count]) => {
                const [languageId, level] = languageLevelKey.split(':');
                const label = level ? `${languageId} ${getAudienceLanguageLevelLabel(level)}`.trim() : languageLevelKey;
                return (
                  <Tag key={languageLevelKey} color="blue" style={{ marginBottom: 6 }}>
                    {label}: {count}
                  </Tag>
                );
              }) : <Empty description={setLocale(locale, 'admin.tools.messaging.noAudienceRows')} />}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderAudienceCertificationReport = () => {
    const certificationRows = [...(audienceCertificationHistory?.rows || [])]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const selectedSourceCount = audienceCertificationFilters.source === 'all'
      ? audienceRows.length
      : selectedAudienceRows.length;
    const sourceOptions = [
      { value: 'selected', label: `Selected audience (${selectedAudienceRows.length})` },
      { value: 'all', label: `Loaded audience (${audienceRows.length})` }
    ];
    const getCourseDisplay = (courseCodeId) => {
      const rawCourse = (allRawCourses || []).find(course => course?.CourseCodeId === courseCodeId);
      const courseTitle = rawCourse?.CourseDetails?.course || rawCourse?.CourseName || courseCodeId;
      return courseTitle ? `${courseTitle}` : courseCodeId || '-';
    };

    return (
      <div>
        <Alert
          type="info"
          showIcon
          message="Certification history drill-down"
          description="Use this after narrowing the audience. It requests certification history for selected rows or the currently loaded audience."
          style={{ marginBottom: 16 }}
        />
        <Card size="small" title="Certification Filters" style={{ marginBottom: 16 }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={6}>
              <Select
                value={audienceCertificationFilters.source}
                options={sourceOptions}
                onChange={value => updateAudienceCertificationFilter('source', value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} md={7}>
              <Select
                mode="multiple"
                allowClear
                showSearch
                value={audienceCertificationFilters.courseCodeIds}
                placeholder="Course"
                options={audienceCourseOptions}
                optionFilterProp="searchText"
                tagRender={renderAudienceCourseTag}
                maxTagCount={2}
                onChange={value => updateAudienceCertificationFilter('courseCodeIds', value || [])}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} md={5}>
              <Select
                mode="multiple"
                allowClear
                showSearch
                value={audienceCertificationFilters.certificationKeys}
                placeholder="Certification"
                options={audienceCertificationKeyOptions}
                optionFilterProp="searchText"
                maxTagCount={2}
                onChange={value => updateAudienceCertificationFilter('certificationKeys', value || [])}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={12} md={3}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                loading={audienceCertificationLoading}
                disabled={selectedSourceCount === 0}
                onClick={handleLoadAudienceCertificationHistory}
                block
              >
                Load
              </Button>
            </Col>
            <Col xs={12} md={3}>
              <Button
                icon={<DownloadOutlined />}
                disabled={!certificationRows.length}
                onClick={handleExportAudienceCertificationHistory}
                block
              >
                Export
              </Button>
            </Col>
          </Row>
        </Card>
        <Table
          size="small"
          rowKey="key"
          loading={audienceCertificationLoading}
          dataSource={certificationRows}
          pagination={{
            pageSize: 25,
            showSizeChanger: true
          }}
          locale={{ emptyText: 'No certification history loaded' }}
          scroll={{ x: 1100 }}
          columns={[
            {
              title: 'Contact',
              dataIndex: 'contactInternalId',
              key: 'contactInternalId',
              width: 260,
              render: contactInternalId => {
                const audienceRow = audienceRowByContactId[normalizeContactInternalId(contactInternalId)] || {};
                return (
                  <div>
                    <strong>{audienceRow.fullName || contactInternalId || '-'}</strong>
                    {audienceRow.primaryEmail ? (
                      <div style={{ color: '#72849a', fontSize: 12 }}>{audienceRow.primaryEmail}</div>
                    ) : null}
                  </div>
                );
              }
            },
            {
              title: 'Email',
              dataIndex: 'emailId',
              key: 'emailId',
              width: 230,
              render: value => value || '-'
            },
            {
              title: 'Course',
              dataIndex: 'courseCodeId',
              key: 'courseCodeId',
              width: 260,
              render: courseCodeId => (
                <div>
                  <strong>{getCourseDisplay(courseCodeId)}</strong>
                  <div style={{ color: '#72849a', fontSize: 12 }}>{courseCodeId || '-'}</div>
                </div>
              )
            },
            {
              title: 'Certification',
              dataIndex: 'certificationKey',
              key: 'certificationKey',
              width: 200,
              render: (_, record) => {
                const displayCertificationKey = record.certificationDisplayKey || getAwardTier(record);
                return (
                  <Tag color={displayCertificationKey === 'Golden' ? 'gold' : 'default'}>
                    {displayCertificationKey || record.certificationDescription || record.certificationKey || '-'}
                  </Tag>
                );
              }
            },
            {
              title: 'Created',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 180,
              sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
              render: value => (value ? new Date(value).toLocaleString() : '-')
            }
          ]}
        />
      </div>
    );
  };

  const renderAudienceMessageComposer = () => (
    <div>
      <Alert
        type="info"
        showIcon
        title={t('admin.tools.messaging.selectedRecipients', {
          count: selectedAudienceRows.length
        })}
        style={{ marginBottom: 16 }}
      />
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        <Col xs={24} md={18}>
          <Input
            ref={audienceSubjectInputRef}
            value={audienceMessageDraft.subject}
            onChange={event => {
              saveAudienceSubjectSelection(event);
              setAudienceMessageDraft(previousDraft => ({
                ...previousDraft,
                subject: event.target.value
              }));
            }}
            onClick={saveAudienceSubjectSelection}
            onFocus={saveAudienceSubjectSelection}
            onKeyUp={saveAudienceSubjectSelection}
            onSelect={saveAudienceSubjectSelection}
            onBlur={saveAudienceSubjectSelection}
            placeholder={t('admin.tools.messaging.subjectPlaceholder')}
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            value={undefined}
            placeholder={t('admin.tools.messaging.editor.variable')}
            options={audienceMessageVariableOptions}
            optionFilterProp="searchText"
            onChange={insertAudienceSubjectVariable}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <Select
          value={undefined}
          placeholder={t('admin.tools.messaging.editor.variable')}
          style={{ width: 240, maxWidth: '100%' }}
          popupMatchSelectWidth={280}
          options={audienceMessageVariableOptions}
          optionFilterProp="searchText"
          onChange={insertAudienceBodyVariable}
        />
      </div>
      <Input.TextArea
        ref={audienceBodyTextAreaRef}
        value={audienceMessageDraft.bodyText}
        rows={10}
        onChange={event => {
          saveAudienceBodySelection(event);
          setAudienceMessageDraft(previousDraft => ({
            ...previousDraft,
            bodyHtml: '',
            bodyText: event.target.value
          }));
        }}
        onClick={saveAudienceBodySelection}
        onFocus={saveAudienceBodySelection}
        onKeyUp={saveAudienceBodySelection}
        onSelect={saveAudienceBodySelection}
        onBlur={saveAudienceBodySelection}
        placeholder={t('admin.tools.messaging.bodyPlaceholder')}
        style={{ marginBottom: 12 }}
      />
      <Tooltip title={audienceMessageSendDisabledHint}>
        <span style={{ display: 'inline-block' }}>
          <Popconfirm
            title={t('admin.tools.messaging.confirmSend', { count: selectedAudienceRows.length })}
            onConfirm={handleSendAudienceMessage}
            okText={t('admin.tools.confirmYes')}
            cancelText={t('admin.tools.confirmNo')}
            disabled={!canSendAudienceMessage}
          >
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={audienceMessageSending}
              disabled={!canSendAudienceMessage}
            >
              {setLocale(locale, 'admin.tools.messaging.sendMessage')}
            </Button>
          </Popconfirm>
        </span>
      </Tooltip>
      {selectedAudienceRows.length === 0 && (
        <div
          style={{
            color: '#72849a',
            fontSize: 12,
            marginTop: 8
          }}
        >
          {setLocale(locale, 'admin.tools.messaging.chooseAudienceHint')}
        </div>
      )}
    </div>
  );

  const renderMessagingDashboard = () => (
    <Card variant="outlined" size="small" style={{ marginBottom: 16 }}>
      <h4 style={{ marginBottom: 12 }}>
        <MailOutlined style={{ marginRight: 8 }} />
        {setLocale(locale, 'admin.tools.messaging.title')}
      </h4>
      <Alert
        type="info"
        showIcon
        title={setLocale(locale, 'admin.tools.messaging.description')}
        style={{ marginBottom: 16 }}
      />
      <Tabs
        activeKey={messagingInnerTabKey}
        onChange={setMessagingInnerTabKey}
        items={[
          {
            key: 'message',
            label: (
              <span>
                <MessageOutlined style={{ marginRight: 6 }} />
                {setLocale(locale, 'admin.tools.messaging.tab.message')}
              </span>
            ),
            children: renderAudienceMessageComposer()
          },
          {
            key: 'audience',
            label: (
              <span>
                <TeamOutlined style={{ marginRight: 6 }} />
                {setLocale(locale, 'admin.tools.messaging.tab.audience')}
              </span>
            ),
            children: renderAudienceTable()
          },
          {
            key: 'visualization',
            label: (
              <span>
                <BarChartOutlined style={{ marginRight: 6 }} />
                {setLocale(locale, 'admin.tools.messaging.tab.visualization')}
              </span>
            ),
            children: renderAudienceVisualization()
          },
          {
            key: 'certifications',
            label: (
              <span>
                <SafetyCertificateOutlined style={{ marginRight: 6 }} />
                Certifications
              </span>
            ),
            children: renderAudienceCertificationReport()
          }
        ]}
      />
    </Card>
  );

  const renderRevenueMetricCard = (titleKey, value, icon, color = '#3e82f7') => (
    <Col xs={24} sm={12} lg={6}>
      <Card variant="outlined" size="small">
        <Statistic
          title={setLocale(locale, titleKey)}
          value={value ?? '0'}
          prefix={icon ? React.cloneElement(icon, { style: { color } }) : null}
          styles={{ content: { color } }}
        />
      </Card>
    </Col>
  );

  const renderRevenueTable = (tableModel, emptyKey = 'admin.tools.revenue.noData') => (
    tableModel?.tableData?.length > 0 ? (
      <AbstractTable
        tableData={tableModel.tableData}
        tableColumns={tableModel.columns}
        tableExpandables={tableModel.expandable}
        isAllowedToEditTableData={false}
        isToRenderActionButton={false}
      />
    ) : (
      <Empty description={setLocale(locale, emptyKey)} />
    )
  );

  const renderRevenueDivider = (titleKey, icon) => (
    <Divider titlePlacement="left">
      <span>
        {icon ? React.cloneElement(icon, { style: { marginRight: 8 } }) : null}
        {setLocale(locale, titleKey)}
      </span>
    </Divider>
  );

  const renderRevenueOverview = () => {
    const overview = shopRevenueDashboard?.overview || {};

    return (
      <>
        <Row gutter={[16, 16]}>
          {renderRevenueMetricCard('admin.tools.revenue.totalRevenue', overview.totalRevenue, <DollarOutlined />, '#1677ff')}
          {renderRevenueMetricCard('admin.tools.revenue.totalPurchases', overview.totalPurchases, <ShoppingCartOutlined />, '#52c41a')}
          {renderRevenueMetricCard('admin.tools.revenue.conversionRate', overview.conversionRate, <LineChartOutlined />, '#722ed1')}
          {renderRevenueMetricCard('admin.tools.revenue.activeProducts', overview.activeProducts, <BookOutlined />, '#fa8c16')}
          {renderRevenueMetricCard('admin.tools.revenue.refundRate', overview.refundRate, <ReloadOutlined />, '#cf1322')}
          {renderRevenueMetricCard('admin.tools.revenue.refundedAmount', overview.refundedAmount, <DollarOutlined />, '#d46b08')}
          {renderRevenueMetricCard('admin.tools.revenue.repeatCustomerRate', overview.repeatCustomerRate, <UserOutlined />, '#08979c')}
          {renderRevenueMetricCard('admin.tools.revenue.latestRefresh', overview.latestRefresh == null ? '-' : `${overview.latestRefresh}s`, <DashboardOutlined />, '#595959')}
        </Row>
      </>
    );
  };

  const renderRevenueCharts = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <BarGraph
          localizedTitle="admin.tools.revenue.revenueByTier"
          graphData={shopRevenueDashboard?.charts?.revenueByTier || []}
          passedValue="revenue"
          passedType="type"
        />
      </Col>
      <Col xs={24} lg={12}>
        <BarGraph
          localizedTitle="admin.tools.revenue.salesByLanguagePair"
          graphData={shopRevenueDashboard?.charts?.languagePairSales || []}
          passedValue="revenue"
          passedType="type"
        />
      </Col>
      <Col xs={24}>
        <BarGraph
          localizedTitle="admin.tools.revenue.topCourses"
          graphData={shopRevenueDashboard?.charts?.topCourses || []}
          passedValue="revenue"
          passedType="type"
        />
      </Col>
    </Row>
  );

  const renderRevenueTrends = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <TimelineTrendGraph
          localizedTitle="admin.tools.revenue.monthlyRevenue"
          trendData={shopRevenueDashboard?.charts?.monthlyRevenue || []}
          lineColor="#1677ff"
          enableGradientArea
        />
      </Col>
      <Col xs={24} lg={12}>
        <TimelineTrendGraph
          localizedTitle="admin.tools.revenue.dailySales"
          trendData={shopRevenueDashboard?.charts?.dailySales || []}
          lineColor="#52c41a"
          enableGradientArea
        />
      </Col>
      <Col xs={24}>
        <TimelineTrendGraph
          localizedTitle="admin.tools.revenue.dateRangeSales"
          trendData={shopRevenueDashboard?.charts?.salesByDateRange || []}
          lineColor="#fa8c16"
          enableGradientArea
        />
      </Col>
    </Row>
  );

  const renderRevenueCustomers = () => (
    <>
      {renderRevenueDivider('admin.tools.revenue.topCustomers', <UserOutlined />)}
      {renderRevenueTable(shopRevenueDashboard?.tables?.topCustomers)}
      {renderRevenueDivider('admin.tools.revenue.allCustomers', <UserOutlined />)}
      {renderRevenueTable(revenueShopCustomersTable)}
      {renderRevenueDivider('admin.tools.revenue.recentCustomers', <LoginOutlined />)}
      {renderRevenueTable(shopRevenueDashboard?.tables?.recentlyActiveCustomers)}
      {renderRevenueDivider('admin.tools.revenue.customerCohorts', <LineChartOutlined />)}
      {renderRevenueTable(shopRevenueDashboard?.tables?.customerCohorts)}
    </>
  );

  const renderRevenueProductDisplay = () => (
    <>
      {renderRevenueDivider('admin.tools.revenue.activeProductsTable', <BookOutlined />)}
      {renderRevenueTable(shopRevenueDashboard?.tables?.activeProducts)}
      {renderRevenueDivider('admin.tools.revenue.productsByCourse', <ShoppingCartOutlined />)}
      {renderRevenueTable(shopRevenueDashboard?.tables?.productsByCourse)}
      {renderRevenueDivider('admin.tools.revenue.productsByTier', <DollarOutlined />)}
      {renderRevenueTable(shopRevenueDashboard?.tables?.productsByTier)}
    </>
  );

  const renderRevenueProductManagement = () => (
    <>
      {renderRevenueDivider('admin.tools.revenue.product.mappingTitle', <ShoppingCartOutlined />)}
      <Alert
        type="info"
        showIcon
        title={setLocale(locale, 'admin.tools.revenue.product.manageNotice')}
        style={{ marginBottom: 16 }}
      />
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 4 }}>
            <strong>{setLocale(locale, 'admin.tools.revenue.product.selectExisting')}</strong>
          </div>
          <Select
            allowClear
            showSearch={{
              filterOption: (input, option) =>
                (option?.searchText || option?.label || '').toString().toLowerCase().includes(input.toLowerCase())
            }}
            value={revenueProductFormValues.selectedProductKey}
            options={revenueProductOptions}
            onChange={handleSelectRevenueProduct}
            placeholder={t('admin.tools.revenue.product.selectExisting')}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 4 }}>
            <strong>{setLocale(locale, 'shop.analytics.table.column.paymentProviderPriceId')} *</strong>
          </div>
          <Input
            value={revenueProductFormValues.paymentProviderPriceId}
            onChange={(event) => setRevenueProductFormField('paymentProviderPriceId', event.target.value)}
            placeholder="price_..."
          />
        </Col>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 4 }}>
            <strong>{setLocale(locale, 'shop.analytics.table.column.courseCodeId')} *</strong>
          </div>
          <Select
            showSearch={{
              filterOption: (input, option) =>
                (option?.searchText || option?.label || '').toString().toLowerCase().includes(input.toLowerCase())
            }}
            value={revenueProductFormValues.courseCodeId}
            options={revenueProductCourseOptions}
            onChange={(value) => setRevenueProductFormField('courseCodeId', value)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} md={8}>
          <div style={{ marginBottom: 4 }}>
            <strong>{setLocale(locale, 'shop.analytics.table.column.tier')} *</strong>
          </div>
          <Select
            value={revenueProductFormValues.tierId}
            options={revenueTierOptions.filter(option => option.value !== 'all')}
            onChange={(value) => setRevenueProductFormField('tierId', value)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} md={8}>
          <div style={{ marginBottom: 4 }}>
            <strong>{setLocale(locale, 'shop.analytics.table.column.active')}</strong>
          </div>
          <Radio.Group
            value={revenueProductFormValues.isActive}
            onChange={(event) => setRevenueProductFormField('isActive', event.target.value)}
          >
            <Radio.Button value>{setLocale(locale, 'admin.tools.revenue.product.active')}</Radio.Button>
            <Radio.Button value={false}>{setLocale(locale, 'admin.tools.revenue.product.inactive')}</Radio.Button>
          </Radio.Group>
        </Col>
        <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={revenueProductSubmitting}
            onClick={handleUpsertRevenueProduct}
          >
            {setLocale(locale, 'admin.tools.revenue.product.save')}
          </Button>
          <Button onClick={handleResetRevenueProductForm}>
            {setLocale(locale, 'admin.tools.revenue.product.clear')}
          </Button>
        </Col>
      </Row>
    </>
  );

  const renderRevenueCatalogManagement = () => (
    <>
      {renderRevenueDivider('admin.tools.revenue.tiers', <DollarOutlined />)}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 4 }}>
            <strong>{setLocale(locale, 'admin.tools.revenue.tier.selectExisting')}</strong>
          </div>
          <Select
            allowClear
            showSearch
            optionFilterProp="searchText"
            value={revenueTierFormValues.selectedTierId}
            options={revenueTierOptions.filter(option => option.value !== 'all')}
            onChange={handleSelectRevenueTier}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 4 }}>
            <strong>{setLocale(locale, 'shop.analytics.table.column.tier')} *</strong>
          </div>
          <Input
            value={revenueTierFormValues.tierId}
            onChange={(event) => setRevenueTierFormValues(previous => ({ ...previous, tierId: event.target.value }))}
            placeholder="Bronze"
          />
        </Col>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 4 }}>
            <strong>{setLocale(locale, 'shop.analytics.table.column.localizationKey')} *</strong>
          </div>
          <Input
            value={revenueTierFormValues.localizationKey}
            onChange={(event) => setRevenueTierFormValues(previous => ({ ...previous, localizationKey: event.target.value }))}
            placeholder="shop.feature.bronzeCost"
          />
        </Col>
        <Col xs={24} md={6}>
          <div style={{ marginBottom: 4 }}>
            <strong>{setLocale(locale, 'shop.analytics.table.column.displayOrder')}</strong>
          </div>
          <InputNumber
            min={0}
            value={revenueTierFormValues.displayOrder}
            onChange={(value) => setRevenueTierFormValues(previous => ({ ...previous, displayOrder: value ?? 0 }))}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} md={6} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={revenueCatalogSubmitting.tiers}
            onClick={handleUpsertRevenueTier}
          >
            {setLocale(locale, 'admin.tools.revenue.tier.save')}
          </Button>
          <Button onClick={handleResetRevenueTierForm}>
            {setLocale(locale, 'admin.tools.revenue.product.clear')}
          </Button>
        </Col>
      </Row>
      {renderRevenueTable(shopRevenueDashboard?.tables?.shopTiers)}

      {renderRevenueDivider('admin.tools.revenue.paymentProviders', <SafetyCertificateOutlined />)}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 4 }}>
            <strong>{setLocale(locale, 'admin.tools.revenue.provider.selectExisting')}</strong>
          </div>
          <Select
            allowClear
            showSearch
            optionFilterProp="searchText"
            value={revenuePaymentProviderFormValues.selectedProviderId}
            options={revenuePaymentProviderOptions}
            onChange={handleSelectRevenuePaymentProvider}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 4 }}>
            <strong>{setLocale(locale, 'shop.analytics.table.column.paymentProvider')} *</strong>
          </div>
          <Input
            value={revenuePaymentProviderFormValues.providerId}
            onChange={(event) => setRevenuePaymentProviderFormValues(previous => ({ ...previous, providerId: event.target.value }))}
            placeholder="PayPal"
          />
        </Col>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 4 }}>
            <strong>{setLocale(locale, 'shop.analytics.table.column.enabled')}</strong>
          </div>
          <Radio.Group
            value={revenuePaymentProviderFormValues.isEnabled}
            onChange={(event) => setRevenuePaymentProviderFormValues(previous => ({ ...previous, isEnabled: event.target.value }))}
          >
            <Radio.Button value>{setLocale(locale, 'admin.tools.revenue.provider.enabled')}</Radio.Button>
            <Radio.Button value={false}>{setLocale(locale, 'admin.tools.revenue.provider.disabled')}</Radio.Button>
          </Radio.Group>
        </Col>
        <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={revenueCatalogSubmitting.providers}
            onClick={handleUpsertRevenuePaymentProvider}
          >
            {setLocale(locale, 'admin.tools.revenue.provider.save')}
          </Button>
          <Button onClick={handleResetRevenuePaymentProviderForm}>
            {setLocale(locale, 'admin.tools.revenue.product.clear')}
          </Button>
        </Col>
      </Row>
      {renderRevenueTable(shopRevenueDashboard?.tables?.shopPaymentProviders)}
    </>
  );

  const renderRevenueProducts = () => (
    <>
      <Radio.Group
        value={revenueProductTabKey}
        onChange={(event) => setRevenueProductTabKey(event.target.value)}
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="display">
          <TableOutlined style={{ marginRight: 4 }} />
          {setLocale(locale, 'admin.tools.revenue.product.display')}
        </Radio.Button>
        <Radio.Button value="manage">
          <EditOutlined style={{ marginRight: 4 }} />
          {setLocale(locale, 'admin.tools.revenue.product.manage')}
        </Radio.Button>
        <Radio.Button value="catalog">
          <SafetyCertificateOutlined style={{ marginRight: 4 }} />
          {setLocale(locale, 'admin.tools.revenue.product.catalog')}
        </Radio.Button>
      </Radio.Group>

      {revenueProductTabKey === 'manage' && renderRevenueProductManagement()}
      {revenueProductTabKey === 'catalog' && renderRevenueCatalogManagement()}
      {revenueProductTabKey === 'display' && renderRevenueProductDisplay()}
    </>
  );

  const renderRevenueReports = () => (
    <>
      {renderRevenueDivider('admin.tools.revenue.salesByDateRangeTable', <LineChartOutlined />)}
      {renderRevenueTable(shopRevenueDashboard?.tables?.salesByDateRange)}
      {renderRevenueDivider('admin.tools.revenue.refundAnalytics', <ReloadOutlined />)}
      {renderRevenueTable(shopRevenueDashboard?.tables?.refundAnalytics)}
      {renderRevenueDivider('admin.tools.revenue.exportSalesReport', <TableOutlined />)}
      {renderRevenueTable(shopRevenueDashboard?.tables?.exportSalesReport)}
    </>
  );

  const renderRevenueDashboard = () => {
    const revenueTabItems = [
      {
        key: 'overview',
        label: <span><DashboardOutlined /> {setLocale(locale, 'admin.tools.revenue.tab.overview')}</span>,
        children: renderRevenueOverview()
      },
      {
        key: 'charts',
        label: <span><LineChartOutlined /> {setLocale(locale, 'admin.tools.revenue.tab.charts')}</span>,
        children: renderRevenueCharts()
      },
      {
        key: 'trends',
        label: <span><LineChartOutlined /> {setLocale(locale, 'admin.tools.revenue.tab.trends')}</span>,
        children: renderRevenueTrends()
      },
      {
        key: 'purchases',
        label: <span><ShoppingCartOutlined /> {setLocale(locale, 'admin.tools.revenue.tab.purchases')}</span>,
        children: renderRevenueTable(shopRevenueDashboard?.tables?.purchases)
      },
      {
        key: 'customers',
        label: <span><UserOutlined /> {setLocale(locale, 'admin.tools.revenue.tab.customers')}</span>,
        children: renderRevenueCustomers()
      },
      {
        key: 'products',
        label: <span><BookOutlined /> {setLocale(locale, 'admin.tools.revenue.tab.products')}</span>,
        children: renderRevenueProducts()
      },
      {
        key: 'reports',
        label: <span><TableOutlined /> {setLocale(locale, 'admin.tools.revenue.tab.reports')}</span>,
        children: renderRevenueReports()
      }
    ];

    return (
      <Card variant="outlined" size="small" style={{ marginBottom: 16 }} loading={revenueLoading}>
        <h4 style={{ marginBottom: 12 }}>
          <DollarOutlined style={{ marginRight: 8 }} />
          {setLocale(locale, 'admin.tools.revenue.title')}
        </h4>
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <Select
              showSearch
              optionFilterProp="label"
              style={{ width: '100%' }}
              value={revenueFilters.courseCodeId}
              options={revenueCourseOptions}
              onChange={(value) => updateRevenueFilters({ courseCodeId: value }, true)}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              style={{ width: '100%' }}
              value={revenueFilters.tierId}
              options={revenueTierOptions}
              onChange={(value) => updateRevenueFilters({ tierId: value }, true)}
            />
          </Col>
          <Col xs={24} md={6}>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={revenueFilters.dateRange?.length === 2 ? revenueFilters.dateRange : null}
              onChange={(value) => updateRevenueFilters({ dateRange: value || [] }, true)}
            />
          </Col>
          <Col xs={24} md={4}>
            <Input
              value={revenueFilters.searchText}
              placeholder={t('admin.tools.revenue.searchPlaceholder')}
              prefix={<SearchOutlined />}
              onChange={(event) => updateRevenueFilters({ searchText: event.target.value })}
            />
          </Col>
          <Col xs={24} md={2}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              block
              loading={revenueLoading}
              onClick={() => loadShopRevenueDashboard()}
            >
              {setLocale(locale, 'admin.tools.revenue.refresh')}
            </Button>
          </Col>
        </Row>

        <Tabs
          activeKey={revenueInnerTabKey}
          onChange={setRevenueInnerTabKey}
          items={revenueTabItems}
        />
      </Card>
    );
  };

  const coverUrl = 'https://images.unsplash.com/photo-1593153041370-5ebf6b82886a?q=80&w=1461&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  const outerTabsConfig = [
    { key: 'access', tab: <span><UserOutlined /> {setLocale(locale, 'admin.tools.tab.accessManagement')}</span> },
    { key: 'stewardship', tab: <span><TeamOutlined /> {setLocale(locale, 'admin.tools.tab.contactStewardship')}</span> },
    { key: 'courses', tab: <span><BookOutlined /> {setLocale(locale, 'admin.tools.tab.courseManagement')}</span> },
    { key: 'revenue', tab: <span><DollarOutlined /> {setLocale(locale, 'admin.tools.tab.revenue')}</span> },
    { key: 'messaging', tab: <span><MailOutlined /> {setLocale(locale, 'admin.tools.tab.messaging')}</span> },
    { key: 'monitoring', tab: <span><DashboardOutlined /> {setLocale(locale, 'admin.tools.tab.monitoring')}</span> }
  ];

  return (
    <div className="container customerName">
      <Card
        variant="outlined"
        cover={<img alt="adminTools" src={coverUrl} style={{ height: 100, objectFit: 'cover' }} />}
      >
        <h1 style={{ marginBottom: '10px', textAlign: 'left' }}>
          {setLocale(locale, 'profile.globalAdminTools')}
        </h1>
      </Card>

      <Card
        variant="outlined"
        tabList={outerTabsConfig}
        activeTabKey={activeOuterTabKey}
        onTabChange={setActiveOuterTabKey}
      >
        {activeOuterTabKey === 'access' && renderAccessManagement()}
        {activeOuterTabKey === 'stewardship' && renderContactStewardship()}
        {activeOuterTabKey === 'courses' && renderCourseManagement()}
        {activeOuterTabKey === 'revenue' && renderRevenueDashboard()}
        {activeOuterTabKey === 'messaging' && renderMessagingDashboard()}
        {activeOuterTabKey === 'monitoring' && renderMonitoring()}
      </Card>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onLoadingAdminToolsInit,
    onAssigningEnrolleeRoleToCourse,
    onRevokingCourseFacilitatorAccess,
    onLoadingGlobalUserRole,
    onAssigningGlobalRole,
    onRevokingGlobalRole,
    onClearSelectedContact,
    onUpsertingCourse,
    onLoadingContactCourseProgressActivity,
    onLoadingContactShopPurchaseHistory,
    onLoadingContactLoginFootprint,
    onLoadingAllUserLoginFootprint,
    onLoadingContactProfileMonitoring,
    onLoadingProcessLogEvents,
    onTogglingContactEmailOptOut,
    onTogglingContactActive,
    onTogglingSelectedContactEmailOptOut,
    onTogglingSelectedContactActive,
    onHydratingAdminToolAvatars,
    onLoadingContactGeoMaps,
    onUploadingCourseCoverImage,
    onUpsertingSelectedContactProfile,
    onLoadingShopRevenueDashboard,
    onUpsertingShopProductCourseTier,
    onUpsertingShopTiers,
    onUpsertingShopPaymentProviders,
    onStartingContactImpersonation,
    onLoadingContactSegmentMetadata,
    onLoadingContactSegmentCountryDivisions,
    onLoadingContactSegment,
    onLoadingContactCertificationHistory,
    onLoadingContactMergeDashboard,
    onPreviewingContactMerge,
    onExecutingContactMerge,
    onRollingBackContactMerge,
    onLoadingAudienceMessageVariables,
    onSendingAudienceMessage,
    onRenderingCourseRegistration,
    onRequestingGeographicalDivision
  }, dispatch);
}

const mapStateToProps = ({ adminTools, grant, lrn }) => {
  const { user } = grant;
  const { countries, selfLanguageLevel } = lrn;
  const {
    allCourses,
    allRoles,
    allEnrollees,
    allRawCourses,
    contactCourseProgressActivity,
    contactShopPurchaseHistory,
    contactLoginFootprint,
    allUserLoginFootprint,
    contactProfileMonitoring,
    contactGlobalUserRole,
    avatarUrlMap,
    contactGeoMaps,
    shopRevenueDashboard,
    shopCoursesWithPurchases,
    processLogEventsBySource,
    contactSegmentMetadata,
    contactSegmentCountryDivisions,
    contactSegment,
    contactMergeDashboard,
    contactMergePreview,
    audienceMessageVariables,
    lastAudienceMessageSendResult
  } = adminTools;
  return {
    user,
    allCourses,
    allRoles,
    allEnrollees,
    allRawCourses,
    countries,
    selfLanguageLevel,
    contactCourseProgressActivity,
    contactShopPurchaseHistory,
    contactLoginFootprint,
    allUserLoginFootprint,
    contactProfileMonitoring,
    contactGlobalUserRole,
    avatarUrlMap,
    contactGeoMaps,
    shopRevenueDashboard,
    shopCoursesWithPurchases,
    processLogEventsBySource,
    contactSegmentMetadata,
    contactSegmentCountryDivisions,
    contactSegment,
    contactMergeDashboard,
    contactMergePreview,
    audienceMessageVariables,
    lastAudienceMessageSendResult
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalAdminToolsLandingDashboard);
