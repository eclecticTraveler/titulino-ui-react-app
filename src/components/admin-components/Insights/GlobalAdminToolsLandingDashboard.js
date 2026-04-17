import React, { useState, useEffect, useMemo } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useIntl } from 'react-intl';
import { Row, Col, Card, Input, InputNumber, Select, Radio, Tag, Button, AutoComplete, Tooltip, message, Descriptions, Empty, Avatar, Divider, Timeline, Tabs, DatePicker, Upload, TimePicker, Popconfirm } from 'antd';
import { SearchOutlined, UserOutlined, BookOutlined, SafetyCertificateOutlined, SolutionOutlined, CopyOutlined, EnvironmentOutlined, GlobalOutlined, CloseCircleOutlined, EditOutlined, SaveOutlined, PlusOutlined, UploadOutlined, MessageOutlined } from '@ant-design/icons';
import Flag from 'react-world-flags';
import langData from 'assets/data/language.data.json';
import IntlMessage from 'components/util-components/IntlMessage';
import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';
import EnrolleeByRegionWidget from 'components/layout-components/Landing/Unauthenticated/EnrolleeByRegionWidget';
import WorldMap from 'assets/maps/world-countries-sans-antarctica.json';
import { getGeoMapResource } from 'services/GoogleService';
import { generateCourseCodeId, buildCourseUpsertPayload, prefillFromTemplate } from 'lob/AdminTools';
import dayjs from 'dayjs';
import {
  onLoadingAdminToolsInit,
  onAssigningRoleToCourse,
  onAssigningGlobalRole,
  onClearSelectedContact,
  onUpsertingCourse
} from "redux/actions/AdminTools";

const GlobalAdminToolsLandingDashboard = (props) => {
  const {
    user,
    allCourses,
    allRoles,
    allEnrollees,
    allRawCourses,
    onLoadingAdminToolsInit,
    onAssigningRoleToCourse,
    onAssigningGlobalRole,
    onClearSelectedContact,
    onUpsertingCourse
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
  const [geoMaps, setGeoMaps] = useState({ birth: null, residency: null });

  /* ── Course Management state ── */
  const [courseSearchText, setCourseSearchText] = useState('');
  const [selectedCourseObj, setSelectedCourseObj] = useState(null);
  const [courseTabKey, setCourseTabKey] = useState('summary');
  const [courseFormValues, setCourseFormValues] = useState({});
  const [editingSections, setEditingSections] = useState({});
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [courseTemplateId, setCourseTemplateId] = useState(null);

  const locale = true;
  const intl = useIntl();
  const setLocale = (isLocaleOn, localeKey) =>
    isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  const t = (key) => intl.formatMessage({ id: key });

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
    setGeoMaps({ birth: null, residency: null });
  }, [selectedContact]);

  useEffect(() => {
    if (contactTabKey === 'detailed' && selectedContact) {
      const bCode = selectedContact?.Location?.BirthLocation?.CountryOfBirth;
      const bRegion = selectedContact?.Location?.BirthLocation?.CountryDivisionBirthName;
      const rCode = selectedContact?.Location?.ResidencyLocation?.CountryOfResidency;
      const rRegion = selectedContact?.Location?.ResidencyLocation?.CountryDivisionResidencyName;

      const birthPromise = (bCode && bRegion)
        ? getGeoMapResource(bCode, 'AdminTools-Birth').catch(() => null)
        : Promise.resolve(null);
      const residencyPromise = (rCode && rRegion)
        ? (rCode === bCode && bRegion ? birthPromise : getGeoMapResource(rCode, 'AdminTools-Residency').catch(() => null))
        : Promise.resolve(null);

      Promise.all([birthPromise, residencyPromise]).then(([b, r]) => {
        setGeoMaps({ birth: b, residency: r });
      });
    }
  }, [contactTabKey, selectedContact]);

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

  const createCourseGeneratedId = useMemo(() => {
    if (!courseFormValues.course || !courseFormValues.StartDate) return '';
    const existingIds = (allRawCourses || []).map(c => c.CourseCodeId);
    return generateCourseCodeId(courseFormValues.course, courseFormValues.StartDate, existingIds);
  }, [courseFormValues.course, courseFormValues.StartDate, allRawCourses]);

  if (user?.emailId && !user?.yearOfBirth) {
    return (
      <div id="unathenticated-landing-page-margin">
        <EmailYearSearchForm />
      </div>
    );
  }

  const searchOptions = filteredEnrollees.map(e => ({
    key: e.ContactInternalId,
    value: `${e.FullName || `${e.Names} ${e.LastNames}`} — ${e.Emails?.[0]?.EmailId || ''}`,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {e?.Location?.BirthLocation?.CountryOfBirth && (
          <Flag code={e.Location.BirthLocation.CountryOfBirth} style={{ width: 20, flexShrink: 0 }} />
        )}
        <Avatar size={32} icon={<UserOutlined />} style={{ backgroundColor: '#87d068', flexShrink: 0 }} />
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
    const found = (allEnrollees || []).find(e => e.ContactInternalId === option.key);
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
    setGeoMaps({ birth: null, residency: null });
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
        await onAssigningRoleToCourse(
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

  const roleSelectOptions = (allRoles || []).slice().sort((a, b) => (a.UserRolePriority ?? 999) - (b.UserRolePriority ?? 999)).map(r => ({
    key: r.UserRoleId,
    value: r.UserRoleId,
    label: r.LocalizationKey ? t(r.LocalizationKey) : r.UserRoleId,
    isGlobal: !!r.IsGlobalAccessUserRole
  }));

  const courseRoleOptions = roleSelectOptions.filter(r => !r.isGlobal);
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
                                <Tag color="green" style={{ width: 'fit-content', cursor: 'default' }}>
                                  {friendlyName || ce.CourseCodeId}
                                </Tag>
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
            <Avatar size={96} icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
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
        </Radio.Group>

        {contactTabKey === 'summary' && summaryContent}
        {contactTabKey === 'detailed' && detailedContent}
      </Card>
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

      {/* Step 2: Contact Summary */}
      {renderContactSummary()}

      {/* Step 3: Action Form */}
      {selectedContact && (
        <Card variant="outlined" size="small">
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
            {actionType === 'enroll' && (
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
                  options={courseSelectOptions}
                />
              </Col>
            )}
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
                options={actionType === 'enroll' ? courseRoleOptions : globalRoleOptions}
              />
            </Col>
            {actionType === 'enroll' && (
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
            disabled={!selectedRole || (actionType === 'enroll' && !selectedCourse)}
          >
            {actionType === 'enroll' ? setLocale(locale, 'admin.tools.assignToCourse') : setLocale(locale, 'admin.tools.assignGlobalRole')}
          </Button>
        </Card>
      )}

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
      const payload = [{
        CourseCodeId: selectedCourseObj.CourseCodeId,
        CreationDate: selectedCourseObj.CreationDate,
        StartDate: section === 'dates' ? courseFormValues.StartDate : selectedCourseObj.StartDate,
        EndDate: section === 'dates' ? courseFormValues.EndDate : selectedCourseObj.EndDate,
        CourseDetails: merged,
        NativeLanguageId: section === 'links' ? courseFormValues.NativeLanguageId : selectedCourseObj.NativeLanguageId,
        TargetLanguageId: section === 'links' ? courseFormValues.TargetLanguageId : selectedCourseObj.TargetLanguageId
      }];
      await onUpsertingCourse(payload, emailId);
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
    if (!courseFormValues.course || !courseFormValues.StartDate) {
      message.warning(t('admin.tools.course.msg.fillRequired'));
      return;
    }
    setCourseSubmitting(true);
    try {
      const finalValues = { ...courseFormValues, CourseCodeId: createCourseGeneratedId };
      const payload = buildCourseUpsertPayload(finalValues);
      await onUpsertingCourse(payload, emailId);
      message.success(t('admin.tools.course.msg.createSuccess'));
      setCourseFormValues({});
      setCourseTemplateId(null);
      setCourseTabKey('summary');
      if (emailId) onLoadingAdminToolsInit(emailId);
    } catch (e) {
      console.error(e);
      message.error(t('admin.tools.course.msg.upsertError'));
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
            {cd.imageUrl
              ? <img src={cd.imageUrl} alt="course" style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8 }} />
              : <Avatar size={160} icon={<BookOutlined />} style={{ backgroundColor: '#1890ff' }} />
            }
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
          <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.teacher')}</strong></div><Input value={courseFormValues.teacher || ''} onChange={e => setCourseFormValues(p => ({ ...p, teacher: e.target.value }))} /></Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.startDate')} *</strong></div><DatePicker value={courseFormValues.StartDate ? dayjs(courseFormValues.StartDate) : null} onChange={(d) => { const iso = d ? d.toISOString() : null; setCourseFormValues(p => { const updated = { ...p, StartDate: iso }; if (iso && p.courseWeeksLength) { updated.EndDate = dayjs(iso).add(p.courseWeeksLength, 'week').toISOString(); } if (iso && !p.gatheringStartingDate) { updated.gatheringStartingDate = dayjs(iso).format('MMMM D, YYYY'); } return updated; }); }} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.courseWeeksLength')}</strong></div><InputNumber min={1} max={52} value={courseFormValues.courseWeeksLength} onChange={v => setCourseFormValues(p => { const updated = { ...p, courseWeeksLength: v }; if (p.StartDate && v) { updated.EndDate = dayjs(p.StartDate).add(v, 'week').toISOString(); } return updated; })} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.endDate')}</strong></div><DatePicker value={courseFormValues.EndDate ? dayjs(courseFormValues.EndDate) : null} onChange={(d) => setCourseFormValues(p => ({ ...p, EndDate: d ? d.toISOString() : null }))} style={{ width: '100%' }} /></Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.nativeLanguage')}</strong></div><Select value={courseFormValues.NativeLanguageId || undefined} onChange={v => setCourseFormValues(p => ({ ...p, NativeLanguageId: v }))} options={langOptions} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.targetLanguage')}</strong></div><Select value={courseFormValues.TargetLanguageId || undefined} onChange={v => setCourseFormValues(p => ({ ...p, TargetLanguageId: v }))} options={langOptions} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={8}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.location')}</strong></div><Input value={courseFormValues.location || ''} onChange={e => setCourseFormValues(p => ({ ...p, location: e.target.value }))} /></Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={6}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.gatheringDay')}</strong></div><Select value={courseFormValues.gatheringDay || undefined} onChange={v => setCourseFormValues(p => ({ ...p, gatheringDay: v }))} options={[{value:'Mondays',label:'Mondays'},{value:'Tuesdays',label:'Tuesdays'},{value:'Wednesdays',label:'Wednesdays'},{value:'Thursdays',label:'Thursdays'},{value:'Fridays',label:'Fridays'},{value:'Saturdays',label:'Saturdays'},{value:'Sundays',label:'Sundays'}]} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={6}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.gatheringTime')}</strong></div><TimePicker use12Hours format="h:mm a" value={courseFormValues.gatheringTime ? dayjs(courseFormValues.gatheringTime, 'h:mm a') : null} onChange={(t) => setCourseFormValues(p => ({ ...p, gatheringTime: t ? t.format('h:mm a') : '' }))} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.gatheringStartingDate')}</strong></div><DatePicker value={courseFormValues.gatheringStartingDate ? dayjs(courseFormValues.gatheringStartingDate, 'MMMM D, YYYY') : null} onChange={(d) => setCourseFormValues(p => ({ ...p, gatheringStartingDate: d ? d.format('MMMM D, YYYY') : '' }))} style={{ width: '100%' }} /></Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.targetAudience')}</strong></div><Select value={courseFormValues.targetAudienceNativeLanguage || undefined} onChange={v => setCourseFormValues(p => ({ ...p, targetAudienceNativeLanguage: v }))} options={langData.map(l => ({ value: l.langName, label: l.langName }))} style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={12}><div style={{ marginBottom: 4 }}><strong><MessageOutlined style={{ marginRight: 4, color: '#25D366' }} />{t('admin.tools.course.label.whatsAppLink')}</strong></div><Input value={courseFormValues.whatsAppLink || ''} onChange={e => setCourseFormValues(p => ({ ...p, whatsAppLink: e.target.value }))} /></Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.imageUrl')}</strong></div>
            <Input value={courseFormValues.imageUrl || ''} onChange={e => setCourseFormValues(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginBottom: 4 }}><strong>{t('admin.tools.course.label.uploadImage')}</strong> <small style={{ color: '#999' }}>({t('admin.tools.course.label.orEnterUrl')})</small></div>
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
            {courseFormValues.imageUrl && (
              <Avatar size={48} src={courseFormValues.imageUrl} icon={<BookOutlined />} style={{ marginTop: 8 }} />
            )}
          </Col>
        </Row>

        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCourse} loading={courseSubmitting} style={{ marginTop: 24 }} disabled={!courseFormValues.course || !courseFormValues.StartDate}>
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

  const coverUrl = 'https://images.unsplash.com/photo-1593153041370-5ebf6b82886a?q=80&w=1461&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  const outerTabsConfig = [
    { key: 'access', tab: <span><UserOutlined /> {setLocale(locale, 'admin.tools.tab.accessManagement')}</span> },
    { key: 'courses', tab: <span><BookOutlined /> {setLocale(locale, 'admin.tools.tab.courseManagement')}</span> }
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
      </Card>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onLoadingAdminToolsInit,
    onAssigningRoleToCourse,
    onAssigningGlobalRole,
    onClearSelectedContact,
    onUpsertingCourse
  }, dispatch);
}

const mapStateToProps = ({ adminTools, grant }) => {
  const { user } = grant;
  const { allCourses, allRoles, allEnrollees, allRawCourses } = adminTools;
  return { user, allCourses, allRoles, allEnrollees, allRawCourses };
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalAdminToolsLandingDashboard);
