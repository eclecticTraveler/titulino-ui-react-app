import React from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const EMPTY_LABEL = '-';

const getValue = (row, ...keys) => {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null) return row[key];
  }
  return null;
};

const normalizeText = (value) => (
  value == null ? '' : String(value).trim()
);

const toNullable = (value) => {
  const normalized = normalizeText(value);
  if (!normalized || normalized === 'all') return null;
  return normalized;
};

const normalizeBooleanFilter = (value) => {
  if (value === true || value === false) return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const toStringArrayOrNull = (value) => {
  const values = Array.isArray(value) ? value : [];
  const normalizedValues = values
    .map(item => normalizeText(item))
    .filter(Boolean);

  return normalizedValues.length > 0 ? normalizedValues : null;
};

export const getDefaultAudienceFilters = () => ({
  searchText: '',
  sex: 'all',
  minAge: null,
  maxAge: null,
  locationType: 'all',
  countryNameOrId: null,
  locationRegionName: null,
  languageId: 'all',
  languageLevel: 'all',
  courseCodeIds: [],
  matchAllCourses: false,
  excludeCourseCodeIds: [],
  hasProgress: 'all',
  hasCertifications: 'all',
  hasPurchases: 'all',
  limit: 100,
  offset: 0
});

export const buildContactSegmentPayload = (filters = {}) => {
  const payload = {
    p_sex: toNullable(filters.sex),
    p_minage: toNumberOrNull(filters.minAge),
    p_maxage: toNumberOrNull(filters.maxAge),
    p_locationtype: filters.locationType || 'all',
    p_countrynameorid: toNullable(filters.countryNameOrId),
    p_languageid: toNullable(filters.languageId),
    p_languagelevel: toNullable(filters.languageLevel),
    p_coursecodeids: toStringArrayOrNull(filters.courseCodeIds),
    p_matchallcourses: Boolean(filters.matchAllCourses),
    p_excludecoursecodeids: toStringArrayOrNull(filters.excludeCourseCodeIds),
    p_hasprogress: normalizeBooleanFilter(filters.hasProgress),
    p_hascertifications: normalizeBooleanFilter(filters.hasCertifications),
    p_haspurchases: normalizeBooleanFilter(filters.hasPurchases),
    p_search: toNullable(filters.searchText),
    p_limit: Number(filters.limit || 100),
    p_offset: Number(filters.offset || 0)
  };

  return Object.entries(payload).reduce((accumulator, [key, value]) => {
    if (value === null || value === undefined || value === '') return accumulator;
    accumulator[key] = value;
    return accumulator;
  }, {});
};

const getEmailId = (emailRecord = {}) => (
  getValue(emailRecord, 'EmailId', 'emailId', 'EmailRawInput', 'emailRawInput')
);

export const extractEmailList = (row = {}) => (
  (Array.isArray(row?.Emails) ? row.Emails : [])
    .map(getEmailId)
    .map(normalizeText)
    .filter(Boolean)
);

const getActiveLanguageLevel = (history = []) => {
  const records = Array.isArray(history) ? history : [];
  const activeRecord = records.find(record => !getValue(record, 'EndDate', 'endDate'));
  const fallbackRecord = records[0] || {};
  const record = activeRecord || fallbackRecord;
  return {
    languageId: getValue(record, 'LanguageId', 'languageId'),
    level: getValue(record, 'LanguageLevelAbbreviation', 'languageLevelAbbreviation')
  };
};

export const normalizeContactSegmentRow = (row = {}, index = 0) => {
  const contactInternalId = getValue(row, 'ContactInternalId', 'contactInternalId') || `audience-${index}`;
  const location = getValue(row, 'Location', 'location') || {};
  const residency = getValue(location, 'ResidencyLocation', 'residencyLocation') || {};
  const birth = getValue(location, 'BirthLocation', 'birthLocation') || {};
  const emailList = extractEmailList(row);
  const languageLevel = getActiveLanguageLevel(getValue(row, 'LanguageProficienciesHistory', 'languageProficienciesHistory'));
  const coursesHistory = getValue(row, 'CoursesHistory', 'coursesHistory') || [];

  return {
    ...row,
    key: `${contactInternalId}-${index}`,
    contactInternalId,
    contactExternalId: getValue(row, 'ContactExternalId', 'contactExternalId'),
    names: getValue(row, 'Names', 'names'),
    lastNames: getValue(row, 'LastNames', 'lastNames'),
    fullName: getValue(row, 'FullName', 'fullName') || [
      getValue(row, 'Names', 'names'),
      getValue(row, 'LastNames', 'lastNames')
    ].filter(Boolean).join(' '),
    personalCommunicationName: getValue(row, 'PersonalCommunicationName', 'personalCommunicationName'),
    sex: getValue(row, 'Sex', 'sex'),
    age: getValue(row, 'Age', 'age'),
    isActive: getValue(row, 'IsActive', 'isActive'),
    emails: Array.isArray(row?.Emails) ? row.Emails : [],
    emailList,
    primaryEmail: emailList[0] || '',
    residencyCountryName: getValue(residency, 'CountryOfResidencyNativeName', 'countryOfResidencyNativeName') ||
      getValue(residency, 'CountryOfResidencyName', 'countryOfResidencyName'),
    residencyCountryAlpha3: getValue(residency, 'CountryOfResidencyAlpha3', 'countryOfResidencyAlpha3'),
    residencyRegionName: getValue(residency, 'CountryDivisionResidencyNativeName', 'countryDivisionResidencyNativeName') ||
      getValue(residency, 'CountryDivisionResidencyName', 'countryDivisionResidencyName'),
    birthCountryName: getValue(birth, 'CountryOfBirthNativeName', 'countryOfBirthNativeName') ||
      getValue(birth, 'CountryOfBirthName', 'countryOfBirthName'),
    birthCountryAlpha3: getValue(birth, 'CountryOfBirthAlpha3', 'countryOfBirthAlpha3'),
    birthRegionName: getValue(birth, 'CountryDivisionBirthNativeName', 'countryDivisionBirthNativeName') ||
      getValue(birth, 'CountryDivisionBirthName', 'countryDivisionBirthName'),
    coursesHistory,
    courseCodes: Array.from(new Set(
      (coursesHistory || [])
        .map(course => getValue(course, 'CourseCodeId', 'courseCodeId'))
        .filter(Boolean)
    )),
    courseNames: Array.from(new Set(
      (coursesHistory || [])
        .map(course => getValue(course?.CourseDetails || course?.courseDetails || {}, 'course', 'Course'))
        .filter(Boolean)
    )),
    languageId: languageLevel.languageId,
    languageLevel: languageLevel.level
  };
};

export const normalizeContactSegmentRows = (rows = []) => (
  (Array.isArray(rows) ? rows : []).map((row, index) => normalizeContactSegmentRow(row, index))
);

const normalizeCollection = (metadata = {}, ...keys) => {
  const value = getValue(metadata, ...keys);
  return Array.isArray(value) ? value : [];
};

export const normalizeMetadata = (metadata = {}) => ({
  languages: normalizeCollection(metadata, 'languages', 'Languages'),
  languageLevels: normalizeCollection(metadata, 'languageLevels', 'LanguageLevels'),
  courses: normalizeCollection(metadata, 'courses', 'Courses'),
  tiers: normalizeCollection(metadata, 'tiers', 'Tiers'),
  certificateTypes: normalizeCollection(metadata, 'certificateTypes', 'CertificateTypes'),
  countries: normalizeCollection(metadata, 'countries', 'Countries')
});

const buildOption = (item = {}, valueKeys = [], labelKeys = [], fallbackValue = null) => {
  const value = getValue(item, ...valueKeys) ?? fallbackValue;
  if (!value) return null;
  const label = getValue(item, ...labelKeys) || value;
  return {
    value,
    label,
    searchText: [
      value,
      label,
      getValue(item, 'CourseCodeId', 'courseCodeId'),
      getValue(item, 'CourseName', 'courseName'),
      getValue(item, 'CountryAlpha3', 'countryAlpha3'),
      getValue(item, 'CountryId', 'countryId')
    ].filter(Boolean).join(' ')
  };
};

export const buildMetadataOptions = (metadata = {}, labels = {}) => {
  const normalized = normalizeMetadata(metadata);
  const courseOptions = normalized.courses
    .map((course) => {
      const courseCodeId = getValue(course, 'CourseCodeId', 'courseCodeId', 'value');
      if (!courseCodeId) return null;
      const courseName = getValue(course, 'CourseName', 'courseName', 'Course', 'course', 'label') || courseCodeId;
      return {
        value: courseCodeId,
        label: `${courseName} - ${courseCodeId}`,
        searchText: `${courseName} ${courseCodeId}`
      };
    })
    .filter(Boolean);

  return {
    sex: [
      { value: 'all', label: labels.all || 'All' },
      { value: 'F', label: labels.female || 'Female' },
      { value: 'M', label: labels.male || 'Male' }
    ],
    locationTypes: [
      { value: 'all', label: labels.allLocations || 'All Locations' },
      { value: 'residency', label: labels.residency || 'Residency' },
      { value: 'birth', label: labels.birth || 'Birth' }
    ],
    triState: [
      { value: 'all', label: labels.any || 'Any' },
      { value: 'true', label: labels.with || 'With' },
      { value: 'false', label: labels.without || 'Without' }
    ],
    languages: normalized.languages
      .map(item => buildOption(item, ['LanguageId', 'languageId', 'value'], ['NativeName', 'LanguageName', 'Name', 'label']))
      .filter(Boolean),
    languageLevels: normalized.languageLevels
      .map(item => buildOption(item, [
        'LanguageLevelAbbreviation',
        'languageLevelAbbreviation',
        'LanguageLevelId',
        'languageLevelId',
        'value'
      ], ['LocalizationKey', 'Name', 'label']))
      .filter(Boolean),
    courses: courseOptions,
    countries: normalized.countries
      .map(item => buildOption(item, [
        'CountryOfResidencyAlpha3',
        'CountryOfBirthAlpha3',
        'CountryAlpha3',
        'countryAlpha3',
        'Alpha3',
        'alpha3',
        'CountryId',
        'countryId',
        'value'
      ], [
        'CountryNativeName',
        'countryNativeName',
        'CountryName',
        'countryName',
        'Name',
        'name',
        'label'
      ]))
      .filter(Boolean)
  };
};

export const buildCountryOptionsForLocation = ({
  metadataOptions = [],
  rows = [],
  locationType = 'all'
} = {}) => {
  const optionMap = new Map();
  const addOption = ({ value, label, searchText, alpha3 }) => {
    if (!value || optionMap.has(value)) return;
    optionMap.set(value, {
      value,
      label,
      alpha3,
      searchText: searchText || [value, label, alpha3].filter(Boolean).join(' ')
    });
  };

  const addRowLocation = (row = {}, type = 'residency') => {
    const countryName = type === 'birth' ? row.birthCountryName : row.residencyCountryName;
    const alpha3 = type === 'birth' ? row.birthCountryAlpha3 : row.residencyCountryAlpha3;
    addOption({
      value: alpha3 || countryName,
      label: countryName || alpha3,
      alpha3,
      searchText: [countryName, alpha3].filter(Boolean).join(' ')
    });
  };

  (rows || []).forEach((row) => {
    if (locationType === 'birth') {
      addRowLocation(row, 'birth');
      return;
    }

    if (locationType === 'residency') {
      addRowLocation(row, 'residency');
      return;
    }

    addRowLocation(row, 'residency');
    addRowLocation(row, 'birth');
  });

  if (optionMap.size === 0) {
    (metadataOptions || []).forEach(option => addOption({
      ...option,
      alpha3: option.alpha3 || option.value
    }));
  }

  return Array.from(optionMap.values())
    .sort((a, b) => String(a.label || '').localeCompare(String(b.label || '')));
};

const getTagColorForSex = (sex) => {
  if (sex === 'F') return 'magenta';
  if (sex === 'M') return 'blue';
  return 'default';
};

export const buildAudienceTableColumns = ({
  t,
  onCopyInternalId,
  copyTitle,
  renderCountrySummary,
  getLanguageLevelLabel
} = {}) => [
  {
    title: t('admin.tools.messaging.column.name'),
    dataIndex: 'fullName',
    key: 'fullName',
    width: 240,
    fixed: 'left',
    sorter: (a, b) => String(a.fullName || '').localeCompare(String(b.fullName || '')),
    render: (fullName, record) => (
      <div>
        <strong>{fullName || EMPTY_LABEL}</strong>
        {record.personalCommunicationName ? (
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.personalCommunicationName}</div>
        ) : null}
      </div>
    )
  },
  {
    title: t('admin.tools.messaging.column.emails'),
    dataIndex: 'emailList',
    key: 'emailList',
    width: 260,
    render: emails => (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {(emails || []).length > 0
          ? emails.map(email => <Tag key={email} color="blue">{email}</Tag>)
          : EMPTY_LABEL}
      </div>
    )
  },
  {
    title: t('admin.tools.messaging.column.age'),
    dataIndex: 'age',
    key: 'age',
    width: 80,
    sorter: (a, b) => Number(a.age || 0) - Number(b.age || 0)
  },
  {
    title: t('admin.tools.messaging.column.sex'),
    dataIndex: 'sex',
    key: 'sex',
    width: 90,
    filters: [
      { text: t('admin.tools.messaging.option.female'), value: 'F' },
      { text: t('admin.tools.messaging.option.male'), value: 'M' }
    ],
    onFilter: (value, record) => record.sex === value,
    render: sex => <Tag color={getTagColorForSex(sex)}>{sex || EMPTY_LABEL}</Tag>
  },
  {
    title: t('admin.tools.messaging.column.languageLevel'),
    dataIndex: 'languageLevel',
    key: 'languageLevel',
    width: 140,
    render: (value, record) => {
      if (!value) return EMPTY_LABEL;
      const label = getLanguageLevelLabel?.(value) || value;
      return <Tag color="green">{`${record.languageId || ''} ${label}`.trim()}</Tag>;
    }
  },
  {
    title: t('admin.tools.messaging.column.residency'),
    dataIndex: 'residencyCountryName',
    key: 'residency',
    width: 220,
    render: (country, record) => (
      <div>
        <div>
          {renderCountrySummary
            ? renderCountrySummary(country, record.residencyCountryAlpha3)
            : (country || EMPTY_LABEL)}
        </div>
        {record.residencyRegionName ? <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.residencyRegionName}</div> : null}
      </div>
    )
  },
  {
    title: t('admin.tools.messaging.column.birth'),
    dataIndex: 'birthCountryName',
    key: 'birth',
    width: 220,
    render: (country, record) => (
      <div>
        <div>
          {renderCountrySummary
            ? renderCountrySummary(country, record.birthCountryAlpha3)
            : (country || EMPTY_LABEL)}
        </div>
        {record.birthRegionName ? <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.birthRegionName}</div> : null}
      </div>
    )
  },
  {
    title: t('admin.tools.messaging.column.courses'),
    dataIndex: 'courseCodes',
    key: 'courseCodes',
    width: 260,
    render: courseCodes => (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {(courseCodes || []).slice(0, 4).map(courseCode => <Tag key={courseCode}>{courseCode}</Tag>)}
        {(courseCodes || []).length > 4 ? <Tag>+{courseCodes.length - 4}</Tag> : null}
        {(courseCodes || []).length === 0 ? EMPTY_LABEL : null}
      </div>
    )
  },
  {
    title: t('admin.tools.messaging.column.internalId'),
    dataIndex: 'contactInternalId',
    key: 'contactInternalId',
    width: 290,
    render: contactInternalId => (
      <span>
        <span style={{ wordBreak: 'break-all' }}>{contactInternalId || EMPTY_LABEL}</span>
        {contactInternalId ? (
          <Tooltip title={copyTitle}>
            <Button
              type="link"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => onCopyInternalId?.(contactInternalId)}
              style={{ color: '#1677ff' }}
            />
          </Tooltip>
        ) : null}
      </span>
    )
  }
];

export const buildAudienceSummary = (rows = [], selectedRows = []) => {
  const genderCounts = rows.reduce((accumulator, row) => {
    const sex = row.sex || EMPTY_LABEL;
    accumulator[sex] = (accumulator[sex] || 0) + 1;
    return accumulator;
  }, {});

  const residencyCounts = rows.reduce((accumulator, row) => {
    const country = row.residencyCountryName || EMPTY_LABEL;
    accumulator[country] = (accumulator[country] || 0) + 1;
    return accumulator;
  }, {});

  const residencyCountryAlpha3ByName = rows.reduce((accumulator, row) => {
    const country = row.residencyCountryName || EMPTY_LABEL;
    if (!accumulator[country] && row.residencyCountryAlpha3) {
      accumulator[country] = row.residencyCountryAlpha3;
    }
    return accumulator;
  }, {});

  const languageLevelCounts = rows.reduce((accumulator, row) => {
    const languageId = row.languageId || '';
    const languageLevel = row.languageLevel || EMPTY_LABEL;
    const key = [languageId, languageLevel].filter(Boolean).join(':') || EMPTY_LABEL;
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return {
    totalRows: rows.length,
    selectedRows: selectedRows.length,
    totalEmails: rows.reduce((sum, row) => sum + (row.emailList || []).length, 0),
    selectedEmails: selectedRows.reduce((sum, row) => sum + (row.emailList || []).length, 0),
    genderCounts,
    residencyCounts,
    residencyCountryAlpha3ByName,
    languageLevelCounts
  };
};

export const buildAudienceMessagePayload = (selectedRows = [], messageDraft = {}) => {
  const recipients = (selectedRows || [])
    .filter(row => row?.contactInternalId)
    .map(row => ({
      contactInternalId: row.contactInternalId,
      fullName: row.fullName || null,
      emails: row.emailList || []
    }));

  const contactInternalIds = Array.from(new Set(
    recipients.map(recipient => recipient.contactInternalId).filter(Boolean)
  ));

  return {
    contactInternalIds,
    recipients,
    message: {
      subject: normalizeText(messageDraft.subject),
      bodyHtml: normalizeText(messageDraft.bodyHtml),
      bodyText: normalizeText(messageDraft.bodyText)
    },
    createdAt: new Date().toISOString()
  };
};

export const hasMessageContent = (messageDraft = {}) => (
  normalizeText(messageDraft.subject).length > 0 &&
  normalizeText(messageDraft.bodyText || messageDraft.bodyHtml).length > 0
);

const AudienceMessaging = {
  getDefaultAudienceFilters,
  buildContactSegmentPayload,
  normalizeContactSegmentRows,
  normalizeMetadata,
  buildMetadataOptions,
  buildCountryOptionsForLocation,
  buildAudienceTableColumns,
  buildAudienceSummary,
  buildAudienceMessagePayload,
  hasMessageContent
};

export default AudienceMessaging;
