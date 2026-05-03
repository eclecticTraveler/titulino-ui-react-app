import React, { useState, useEffect, useMemo } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useIntl } from 'react-intl';
import { Row, Col, Card, Input, InputNumber, Select, Radio, Tag, Button, AutoComplete, Tooltip, message, Descriptions, Empty, Avatar, Divider, Timeline, Tabs, DatePicker, Upload, TimePicker, Popconfirm, Image, Alert } from 'antd';
import { SearchOutlined, UserOutlined, BookOutlined, SafetyCertificateOutlined, SolutionOutlined, CopyOutlined, EnvironmentOutlined, GlobalOutlined, CloseCircleOutlined, EditOutlined, SaveOutlined, PlusOutlined, UploadOutlined, MessageOutlined, LineChartOutlined, LoginOutlined, DashboardOutlined, TableOutlined } from '@ant-design/icons';
import Flag from 'react-world-flags';
import langData from 'assets/data/language.data.json';
import IntlMessage from 'components/util-components/IntlMessage';
import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';
import EnrolleeByRegionWidget from 'components/layout-components/Landing/Unauthenticated/EnrolleeByRegionWidget';
import TimelineTrendGraph from 'components/layout-components/Graphs/TimelineTrendGraph';
import LoginFootprintHeatmapGraph from 'components/layout-components/Graphs/LoginFootprintHeatmapGraph';
import LoginFootprintBubbleScatterGraph from 'components/layout-components/Graphs/LoginFootprintBubbleScatterGraph';
import AbstractTable from 'components/shared-components/Table/AbstractTable';
import WorldMap from 'assets/maps/world-countries-sans-antarctica.json';
import { env } from 'configs/EnvironmentConfig';
import dayjs from 'dayjs';
import {
  onLoadingAdminToolsInit,
  onAssigningEnrolleeRoleToCourse,
  onAssigningGlobalRole,
  onClearSelectedContact,
  onUpsertingCourse,
  onLoadingContactCourseProgressActivity,
  onLoadingContactLoginFootprint,
  onLoadingAllUserLoginFootprint,
  onHydratingAdminToolAvatars,
  onLoadingContactGeoMaps,
  onUploadingCourseCoverImage,
  generateCourseCodeId,
  buildCourseUpsertPayload,
  prefillFromTemplate,
  isValidHttpUrl
} from "redux/actions/AdminTools";

const normalizeContactInternalId = (value) => (
  value == null ? '' : String(value).trim().toLowerCase()
);

const hasAvatarResolution = (avatarUrlMap = {}, contactInternalId) => (
  Object.prototype.hasOwnProperty.call(avatarUrlMap || {}, normalizeContactInternalId(contactInternalId))
);

const GlobalAdminToolsLandingDashboard = (props) => {
  const {
    user,
    allCourses,
    allRoles,
    allEnrollees,
    allRawCourses,
    onLoadingAdminToolsInit,
    onAssigningEnrolleeRoleToCourse,
    onAssigningGlobalRole,
    onClearSelectedContact,
    onUpsertingCourse,
    onLoadingContactCourseProgressActivity,
    onLoadingContactLoginFootprint,
    contactCourseProgressActivity,
    contactLoginFootprint,
    onLoadingAllUserLoginFootprint,
    allUserLoginFootprint,
    onHydratingAdminToolAvatars,
    avatarUrlMap,
    onLoadingContactGeoMaps,
    contactGeoMaps,
    onUploadingCourseCoverImage
  } = props;

  const [activeOuterTabKey, setActiveOuterTabKey] = useState('access');
  const [searchText, setSearchText] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [actionType, setActionType] = useState('enroll');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [contactTabKey, setContactTabKey] = useState('summary');
  const geoMaps = contactGeoMaps || { birth: null, residency: null };
  const [selectedProgressCourseId, setSelectedProgressCourseId] = useState('all');
  const [contactProgressLoading, setContactProgressLoading] = useState(false);
  const [contactLoginLoading, setContactLoginLoading] = useState(false);
  const [monitoringLoading, setMonitoringLoading] = useState(false);

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

  const locale = true;
  const intl = useIntl();
  const setLocale = (isLocaleOn, localeKey) =>
    isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  const t = (key) => intl.formatMessage({ id: key });
  const getCourseUpsertResult = (actionResult) => actionResult?.upsertResult || actionResult || null;
  const isCourseUpsertSuccessful = (actionResult) => getCourseUpsertResult(actionResult)?.success === true;

  const emailId = user?.emailId || null;

  useEffect(() => {
    if (emailId) {
      onLoadingAdminToolsInit(emailId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailId]);

  useEffect(() => {
    if (selectedContact?.Emails?.length > 0) {
      setSelectedEmail(selectedContact.Emails[0].EmailId);
    }
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
  }, [activeOuterTabKey, emailId, allUserLoginFootprint?.emailId]);

  const PROFICIENCY_MAP = {
    be: { color: 'purple', key: 'admin.tools.label.proficiency.be' },
    ba: { color: 'gold', key: 'admin.tools.label.proficiency.ba' },
    in: { color: 'orange', key: 'admin.tools.label.proficiency.in' },
    ad: { color: 'green', key: 'admin.tools.label.proficiency.ad' },
    na: { color: 'blue', key: 'admin.tools.label.proficiency.na' }
  };

  /* ── Client-side search over pre-loaded enrollees ── */
  const filteredEnrollees = useMemo(() => {
    if (!searchText || searchText.length < 2 || !allEnrollees?.length) return [];
    const lower = searchText.toLowerCase();
    return allEnrollees.filter(e =>
      (e.FullName || '').toLowerCase().includes(lower) ||
      (e.Names || '').toLowerCase().includes(lower) ||
      (e.LastNames || '').toLowerCase().includes(lower) ||
      (e.ContactExternalId != null ? String(e.ContactExternalId) : '').toLowerCase().includes(lower) ||
      (e.ContactInternalId != null ? String(e.ContactInternalId) : '').toLowerCase().includes(lower) ||
      (e.Emails || []).some(em => (em.EmailId || '').toLowerCase().includes(lower))
    ).slice(0, 20);
  }, [searchText, allEnrollees]);

  const visibleContactIdsForAvatarHydration = useMemo(() => {
    const visibleIds = filteredEnrollees
      .map(enrollee => enrollee?.ContactInternalId)
      .filter(Boolean);

    if (selectedContact?.ContactInternalId) {
      visibleIds.push(selectedContact.ContactInternalId);
    }

    return Array.from(new Set(visibleIds.map(normalizeContactInternalId).filter(Boolean)));
  }, [filteredEnrollees, selectedContact?.ContactInternalId]);

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
      activeOuterTabKey !== 'access' ||
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

  if (user?.emailId && !user?.yearOfBirth) {
    return (
      <div id="unathenticated-landing-page-margin">
        <EmailYearSearchForm />
      </div>
    );
  }

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

  const handleSearchChange = (value) => setSearchText(value);

  const handleContactSelect = (value, option) => {
    const found = filteredEnrolleeMap?.[option.key] || (allEnrollees || []).find(e => e.ContactInternalId === option.key);
    setSelectedContact(found || null);
  };

  const handleClearContact = () => {
    onClearSelectedContact();
    setSelectedContact(null);
    setSearchText('');
    setSelectedCourse(null);
    setSelectedRole(null);
    setSelectedEmail(null);
    setContactTabKey('summary');
  };

  const handleSubmit = async () => {
    if (!selectedContact) {
      message.warning(t('admin.tools.msg.selectContactFirst'));
      return;
    }

    setSubmitting(true);
    try {
      if (actionType === 'enroll') {
        if (!selectedCourse || !selectedRole) {
          message.warning(t('admin.tools.msg.selectCourseAndRole'));
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
        message.success(t('admin.tools.msg.roleToCourseSuccess'));
      } else {
        if (!selectedRole) {
          message.warning(t('admin.tools.msg.selectRole'));
          setSubmitting(false);
          return;
        }
        await onAssigningGlobalRole(
          selectedContact.ContactInternalId,
          selectedRole,
          emailId
        );
        message.success(t('admin.tools.msg.globalRoleSuccess'));
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      message.error(t('admin.tools.msg.assignError'));
    }
    setSubmitting(false);
  };

  const courseSelectOptions = (allCourses || []).map(c => ({
    key: c.value,
    value: c.value,
    label: c.name || c.value
  }));

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
              children: (
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
        message.success(t('admin.tools.msg.copied'));
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

        <Divider orientation="left" style={{ margin: '16px 0 8px' }}>{setLocale(locale, 'admin.tools.label.permissions')}</Divider>
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
            <div style={{ marginTop: 8 }}>
              {selectedContact.IsActive
                ? <Tag color="green">{t('admin.tools.label.active')}</Tag>
                : <Tag color="red">{t('admin.tools.label.inactive')}</Tag>
              }
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
                            navigator.clipboard.writeText(em).then(() => message.success(t('admin.tools.msg.copied')));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.label.dateOfBirth')} style={{ minWidth: 120 }}>
                {selectedContact.DateOfBirth ? new Date(selectedContact.DateOfBirth).toLocaleDateString() : '—'}
              </Descriptions.Item>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.label.age')}>
                {selectedContact.Age ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.label.sex')}>
                {selectedContact.Sex === 'F'
                  ? <Tag color="pink">F</Tag>
                  : selectedContact.Sex === 'M'
                    ? <Tag color="blue">M</Tag>
                    : (selectedContact.Sex || '—')
                }
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {/* Geography */}
        <Divider orientation="left"><EnvironmentOutlined style={{ marginRight: 6 }} />{setLocale(locale, 'admin.tools.label.geography')}</Divider>
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

        {/* Language History */}
        <Divider orientation="left"><GlobalOutlined style={{ marginRight: 6 }} />{setLocale(locale, 'admin.tools.label.languageHistory')}</Divider>
        {renderLanguageHistory(selectedContact.LanguageProficienciesHistory)}

        {/* Course Progress Activity */}
        <Divider orientation="left"><LineChartOutlined style={{ marginRight: 6 }} />{setLocale(locale, 'admin.tools.label.courseProgressActivity')}</Divider>
        {renderContactProgressActivity()}

        {/* Login Footprint */}
        <Divider orientation="left"><LoginOutlined style={{ marginRight: 6 }} />{setLocale(locale, 'admin.tools.label.loginFootprint')}</Divider>
        {renderContactLoginFootprint()}
      </>
    );

    return (
      <Card variant="outlined" size="small" style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 12 }}>
          <SolutionOutlined style={{ marginRight: 8 }} />
          {setLocale(locale, 'admin.tools.contact')}
        </h4>

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
      </Card>
    );
  };

  const renderAssignAccess = () => {
    if (!selectedContact) return null;
    const isEnroll = actionType === 'enroll';
    const isCourseDisabled = isEnroll && !selectedRole;

    return (
      <>
        <h4 style={{ marginBottom: 12 }}>
          <SafetyCertificateOutlined style={{ marginRight: 8 }} />
          {setLocale(locale, 'admin.tools.assignAccess')}
        </h4>

        <Radio.Group
          value={actionType}
          onChange={(e) => { setActionType(e.target.value); }}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="enroll">{setLocale(locale, 'admin.tools.enrollToCourse')}</Radio.Button>
          <Radio.Button value="global">{setLocale(locale, 'admin.tools.assignGlobalRole')}</Radio.Button>
        </Radio.Group>

        <Row gutter={16}>
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
                disabled={isCourseDisabled}
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
                />
              ) : (
                <Input value={selectedEmail || ''} readOnly />
              )}
            </Col>
          )}
        </Row>

        <Button
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
          style={{ marginTop: 16 }}
          disabled={!selectedRole || (isEnroll && !selectedCourse)}
        >
          {isEnroll ? setLocale(locale, 'admin.tools.assignToCourse') : setLocale(locale, 'admin.tools.assignGlobalRole')}
        </Button>
      </>
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
      </Card>

      {/* Step 2: Contact Summary (with Summary / Detailed / Access tabs) */}
      {renderContactSummary()}

      {!selectedContact && !searchText && (
        <Empty description={setLocale(locale, 'admin.tools.searchToGetStarted')} style={{ marginTop: 40 }} />
      )}
    </>
  );

  /* ══════════════════════════════════════════════════════
     COURSE MANAGEMENT TAB
     ══════════════════════════════════════════════════════ */

  const langOptions = langData.map(l => ({
    value: l.langId,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Flag code={l.icon} style={{ width: 18 }} /> {l.langName}
      </span>
    )
  }));

  const courseSearchOptions = filteredCourses.map(c => {
    const langInfo = langData.find(l => l.langId === c.TargetLanguageId);
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
      message.success(t('admin.tools.course.msg.updateSuccess'));
      setEditingSections(prev => ({ ...prev, [section]: false }));
      // Refresh data
      if (emailId) onLoadingAdminToolsInit(emailId);
    } catch (e) {
      console.error(e);
      message.error(t('admin.tools.course.msg.upsertError'));
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
      message.warning(`${t('admin.tools.course.msg.fillRequired')} ${validation.missingLabels.join(', ')}`);
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
      message.success(t('admin.tools.course.msg.createSuccess'));
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
      message.error(t(fallbackKey));
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
          {c.CourseCodeId ? <>{c.CourseCodeId} <CopyOutlined style={{ cursor: 'pointer', color: '#1890ff', marginLeft: 4 }} onClick={() => { navigator.clipboard.writeText(c.CourseCodeId); message.success(t('admin.tools.copied')); }} /></> : '—'}
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
                {c.CourseCodeId ? <>{c.CourseCodeId} <CopyOutlined style={{ cursor: 'pointer', color: '#1890ff', marginLeft: 4 }} onClick={() => { navigator.clipboard.writeText(c.CourseCodeId); message.success(t('admin.tools.copied')); }} /></> : '—'}
              </Descriptions.Item>
              <Descriptions.Item label={setLocale(locale, 'admin.tools.course.label.creationDate')}>
                {c.CreationDate ? new Date(c.CreationDate).toLocaleDateString() : '—'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {/* Section: Course Info */}
        <Divider orientation="left">
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
        <Divider orientation="left">
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
        <Divider orientation="left">
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
            message={`${t('admin.tools.course.msg.fillRequired')} ${courseCreateValidation.missingLabels.join(', ')}`}
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

  const renderMonitoring = () => (
    <Card variant="outlined" size="small" style={{ marginBottom: 16 }}>
      <h4 style={{ marginBottom: 12 }}>
        <DashboardOutlined style={{ marginRight: 8 }} />
        {setLocale(locale, 'admin.tools.monitoring.title')}
      </h4>
      {(monitoringLoading || (emailId && allUserLoginFootprint?.emailId !== emailId)) ? (
        <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
          {setLocale(locale, 'admin.tools.monitoring.loading')}
        </p>
      ) : (
        <>
          <Divider orientation="left">
            <LoginOutlined style={{ marginRight: 6 }} />
            {setLocale(locale, 'admin.tools.monitoring.loginHeatmap')}
          </Divider>
          <LoginFootprintHeatmapGraph
            hideCard
            heatmapData={allUserLoginFootprint?.heatmapData || []}
            emptyDescriptionKey="admin.tools.loginFootprint.noActivity"
          />

          <Divider orientation="left">
            <LineChartOutlined style={{ marginRight: 6 }} />
            {setLocale(locale, 'admin.tools.monitoring.loginBubbleScatter')}
          </Divider>
          <LoginFootprintBubbleScatterGraph
            hideCard
            scatterData={allUserLoginFootprint?.scatterData || []}
            emptyDescriptionKey="admin.tools.loginFootprint.noActivity"
          />

          <Divider orientation="left">
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
      )}
    </Card>
  );

  const coverUrl = 'https://images.unsplash.com/photo-1593153041370-5ebf6b82886a?q=80&w=1461&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  const outerTabsConfig = [
    { key: 'access', tab: <span><UserOutlined /> {setLocale(locale, 'admin.tools.tab.accessManagement')}</span> },
    { key: 'courses', tab: <span><BookOutlined /> {setLocale(locale, 'admin.tools.tab.courseManagement')}</span> },
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
        {activeOuterTabKey === 'courses' && renderCourseManagement()}
        {activeOuterTabKey === 'monitoring' && renderMonitoring()}
      </Card>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onLoadingAdminToolsInit,
    onAssigningEnrolleeRoleToCourse,
    onAssigningGlobalRole,
    onClearSelectedContact,
    onUpsertingCourse,
    onLoadingContactCourseProgressActivity,
    onLoadingContactLoginFootprint,
    onLoadingAllUserLoginFootprint,
    onHydratingAdminToolAvatars,
    onLoadingContactGeoMaps,
    onUploadingCourseCoverImage
  }, dispatch);
}

const mapStateToProps = ({ adminTools, grant }) => {
  const { user } = grant;
  const {
    allCourses,
    allRoles,
    allEnrollees,
    allRawCourses,
    contactCourseProgressActivity,
    contactLoginFootprint,
    allUserLoginFootprint,
    avatarUrlMap,
    contactGeoMaps
  } = adminTools;
  return {
    user,
    allCourses,
    allRoles,
    allEnrollees,
    allRawCourses,
    contactCourseProgressActivity,
    contactLoginFootprint,
    allUserLoginFootprint,
    avatarUrlMap,
    contactGeoMaps
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalAdminToolsLandingDashboard);
