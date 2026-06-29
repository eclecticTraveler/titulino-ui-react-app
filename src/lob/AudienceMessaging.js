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

export const DEFAULT_AUDIENCE_MESSAGE_VARIABLES = [
  {
    token: '{{name}}',
    resolverKey: 'name',
    label: 'Preferred name',
    description: 'PersonalCommunicationName, then FullName, then Names.',
    example: 'Maria'
  },
  {
    token: '{{association}}',
    resolverKey: 'association',
    label: 'Greeting',
    description: 'Gender and proficiency aware greeting used by Missive.',
    example: 'Mi querida hermana/o'
  },
  {
    token: '{{location}}',
    resolverKey: 'location',
    label: 'Location',
    description: 'Residency country native name when available.',
    example: 'Mexico'
  },
  {
    token: '{{fullName}}',
    resolverKey: 'fullName',
    label: 'Full name',
    description: 'Full contact name.',
    example: 'Maria Garcia'
  },
  {
    token: '{{lastNames}}',
    resolverKey: 'lastNames',
    label: 'Last names',
    description: 'Contact last names.',
    example: 'Garcia'
  }
];

const normalizeTemplateToken = (value) => {
  const normalized = normalizeText(value)
    .replace(/^\{\{/, '')
    .replace(/\}\}$/, '')
    .trim();

  return normalized ? `{{${normalized}}}` : '';
};

const normalizeVariableScopes = (value) => (
  (Array.isArray(value) ? value : [])
    .map(scope => normalizeText(scope).toLowerCase())
    .filter(Boolean)
);

export const normalizeMessageTemplateVariables = (catalog = {}, scope = 'audience') => {
  const rawVariables = Array.isArray(catalog)
    ? catalog
    : getValue(catalog, 'variables', 'Variables') || [];
  const normalizedScope = normalizeText(scope).toLowerCase() || 'audience';

  const variables = rawVariables
    .map((variable, index) => {
      const token = normalizeTemplateToken(getValue(variable, 'token', 'Token', 'value'));
      if (!token) return null;

      return {
        token,
        resolverKey: normalizeText(getValue(variable, 'resolverKey', 'ResolverKey')),
        label: normalizeText(getValue(variable, 'label', 'Label')) || token,
        description: normalizeText(getValue(variable, 'description', 'Description')),
        example: normalizeText(getValue(variable, 'example', 'Example')),
        scopes: normalizeVariableScopes(getValue(variable, 'scopes', 'Scopes')),
        sortOrder: Number(getValue(variable, 'sortOrder', 'SortOrder')) || index
      };
    })
    .filter(Boolean)
    .filter(variable => (
      normalizedScope === 'all' ||
      variable.scopes.length === 0 ||
      variable.scopes.includes(normalizedScope)
    ))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));

  return {
    version: getValue(catalog, 'version', 'Version') || 1,
    scope: normalizedScope,
    variables: variables.length > 0 ? variables : DEFAULT_AUDIENCE_MESSAGE_VARIABLES
  };
};

export const buildMessageVariableOptions = (catalog = {}, scope = 'audience') => (
  normalizeMessageTemplateVariables(catalog, scope).variables.map(variable => ({
    value: variable.token,
    label: variable.label === variable.token ? variable.token : `${variable.label} ${variable.token}`,
    title: variable.description,
    searchText: [
      variable.token,
      variable.label,
      variable.description,
      variable.example,
      variable.resolverKey
    ].filter(Boolean).join(' ')
  }))
);

export const getDefaultAudienceFilters = () => ({
  searchText: '',
  sex: 'all',
  minAge: null,
  maxAge: null,
  locationType: 'all',
  countryNameOrId: null,
  locationRegionName: null,
  residencyCountry: null,
  residencyRegion: null,
  residencyExclude: false,
  birthCountry: null,
  birthRegion: null,
  birthExclude: false,
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
    p_countrydivisionnameorid: toNullable(filters.locationRegionName),
    p_residency_country: toNullable(filters.residencyCountry),
    p_residency_region: toStringArrayOrNull(filters.residencyRegion),
    p_residency_exclude: filters.residencyCountry ? Boolean(filters.residencyExclude) : null,
    p_birth_country: toNullable(filters.birthCountry),
    p_birth_region: toStringArrayOrNull(filters.birthRegion),
    p_birth_exclude: filters.birthCountry ? Boolean(filters.birthExclude) : null,
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

export const buildContactSegmentCountPayload = (filters = {}) => {
  const payload = buildContactSegmentPayload(filters);
  delete payload.p_limit;
  delete payload.p_offset;
  return payload;
};

export const buildContactCertificationHistoryPayload = (filters = {}) => {
  const payload = {
    p_contactinternalids: toStringArrayOrNull(filters.contactInternalIds),
    p_coursecodeids: toStringArrayOrNull(filters.courseCodeIds),
    p_certificationkeys: toStringArrayOrNull(filters.certificationKeys),
    p_limit: Number(filters.limit || 500),
    p_offset: Number(filters.offset || 0)
  };

  return Object.entries(payload).reduce((accumulator, [key, value]) => {
    if (value === null || value === undefined || value === '') return accumulator;
    accumulator[key] = value;
    return accumulator;
  }, {});
};

export const buildCountryDivisionsPayload = (filters = {}) => ({
  p_locationtype: filters.locationType || 'all',
  p_countrynameorid: toNullable(filters.countryNameOrId)
});

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
    certificationKeys: Array.from(new Set(
      (getValue(row, 'Certifications', 'certifications', 'CertificationHistory', 'certificationHistory') || [])
        .map(certification => getValue(certification, 'CertificationKey', 'certificationKey'))
        .filter(Boolean)
    )),
    languageId: languageLevel.languageId,
    languageLevel: languageLevel.level
  };
};

export const normalizeContactSegmentRows = (rows = []) => (
  (Array.isArray(rows) ? rows : []).map((row, index) => normalizeContactSegmentRow(row, index))
);

export const normalizeCertificationHistoryRow = (row = {}, index = 0) => {
  const progressId = getValue(row, 'ProgressId', 'progressId');
  const contactInternalId = getValue(row, 'ContactInternalId', 'contactInternalId');
  const courseCodeId = getValue(row, 'CourseCodeId', 'courseCodeId');
  const certificationKey = getValue(row, 'CertificationKey', 'certificationKey');

  return {
    ...row,
    key: [progressId, contactInternalId, courseCodeId, certificationKey, index].filter(Boolean).join('-') || `certification-${index}`,
    progressId,
    contactInternalId,
    emailId: getValue(row, 'EmailId', 'emailId'),
    courseCodeId,
    certificationKey,
    certificationDescription: getValue(row, 'CertificationDescription', 'certificationDescription') || certificationKey,
    createdAt: getValue(row, 'CreatedAt', 'createdAt', 'CreationDate', 'creationDate')
  };
};

export const normalizeCertificationHistoryRows = (rows = []) => (
  (Array.isArray(rows) ? rows : []).map((row, index) => normalizeCertificationHistoryRow(row, index))
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
    certificateTypes: normalized.certificateTypes
      .map(item => buildOption(item, [
        'CertificationKey',
        'certificationKey',
        'CertificateTypeId',
        'certificateTypeId',
        'Key',
        'key',
        'value'
      ], [
        'CertificationDescription',
        'certificationDescription',
        'CertificateTypeName',
        'certificateTypeName',
        'Description',
        'description',
        'Name',
        'name',
        'label'
      ]))
      .filter(Boolean),
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

export const buildCountryDivisionOptions = (countryDivisions = [], notAvailableLabel = 'N/A', unknownLabel = null) => {
  const optionMap = new Map();

  (Array.isArray(countryDivisions) ? countryDivisions : []).forEach((division, index) => {
    const isPrimitive = typeof division === 'string' || typeof division === 'number';
    const rawValue = isPrimitive ? division : getValue(
      division,
      'CountryDivisionName',
      'countryDivisionName',
      'CountryDivisionNativeName',
      'countryDivisionNativeName',
      'CountryDivisionResidencyName',
      'countryDivisionResidencyName',
      'CountryDivisionResidencyNativeName',
      'countryDivisionResidencyNativeName',
      'CountryDivisionBirthName',
      'countryDivisionBirthName',
      'CountryDivisionBirthNativeName',
      'countryDivisionBirthNativeName',
      'DivisionName',
      'divisionName',
      'Name',
      'name',
      'value',
      'CountryDivisionOfResidency',
      'countryDivisionOfResidency',
      'CountryDivisionOfBirth',
      'countryDivisionOfBirth',
      'CountryDivisionCode',
      'countryDivisionCode',
      'CountryDivisionId',
      'countryDivisionId'
    );
    const rawLabel = isPrimitive ? division : getValue(
      division,
      'CountryDivisionNativeName',
      'countryDivisionNativeName',
      'CountryDivisionResidencyNativeName',
      'countryDivisionResidencyNativeName',
      'CountryDivisionBirthNativeName',
      'countryDivisionBirthNativeName',
      'CountryDivisionName',
      'countryDivisionName',
      'CountryDivisionResidencyName',
      'countryDivisionResidencyName',
      'CountryDivisionBirthName',
      'countryDivisionBirthName',
      'DivisionName',
      'divisionName',
      'Name',
      'name',
      'label'
    );
    const value = normalizeText(rawValue) || notAvailableLabel;
    const label = value === '__unknown__'
      ? (unknownLabel || notAvailableLabel)
      : (normalizeText(rawLabel) || notAvailableLabel);
    const key = value || `division-${index}`;

    if (optionMap.has(key)) return;

    optionMap.set(key, {
      value,
      label,
      searchText: [
        value,
        label,
        isPrimitive ? null : getValue(division, 'CountryDivisionId', 'countryDivisionId', 'AlphaKey', 'alphaKey')
      ].filter(Boolean).join(' ')
    });
  });

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
      bodyText: normalizeText(messageDraft.bodyText || messageDraft.bodyHtml)
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
  buildContactSegmentCountPayload,
  buildContactCertificationHistoryPayload,
  buildCountryDivisionsPayload,
  normalizeContactSegmentRows,
  normalizeCertificationHistoryRows,
  normalizeMetadata,
  buildMetadataOptions,
  buildCountryOptionsForLocation,
  buildCountryDivisionOptions,
  buildAudienceTableColumns,
  buildAudienceSummary,
  buildAudienceMessagePayload,
  hasMessageContent,
  normalizeMessageTemplateVariables,
  buildMessageVariableOptions
};

export default AudienceMessaging;
