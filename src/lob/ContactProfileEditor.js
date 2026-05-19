/*
 * Contact-profile edit policy:
 * - globalAdmin can edit profile identity, emails, geography, language levels,
 *   sex, date of birth, active/contact communication state through related tools,
 *   and profile image.
 * - profileOwner is reserved for the future self-service profile page; owners
 *   should not edit system IDs, age, date of birth, birth geography, or global
 *   access details, but may edit residency, sex, display/profile image, and
 *   other fields explicitly enabled by policy.
 * - System IDs and calculated fields are always read-only.
 * - Future notification emails for profile edits should be queued outside this
 *   payload builder after the save succeeds.
 */
export const CONTACT_PROFILE_EDIT_SCOPES = {
  GLOBAL_ADMIN: 'globalAdmin',
  PROFILE_OWNER: 'profileOwner'
};

const normalizeIdentifier = (value) => (
  value == null ? '' : String(value).trim().toLowerCase()
);

const normalizeString = (value) => (
  value == null ? '' : String(value).trim()
);

const getCountryById = (countries = [], countryId) => (
  (countries || []).find(country => normalizeIdentifier(country?.CountryId) === normalizeIdentifier(countryId)) || null
);

const getDivisionByValue = (divisions = [], value) => (
  (divisions || []).find(division => (
    normalizeIdentifier(division?.CountryDivisionId) === normalizeIdentifier(value) ||
    normalizeIdentifier(division?.CountryDivisionName) === normalizeIdentifier(value)
  )) || null
);

const getEmailId = (emailRecord) => (
  typeof emailRecord === 'string'
    ? emailRecord
    : emailRecord?.EmailId || emailRecord?.emailId || ''
);

export const getPrimaryContactEmail = (contact = {}) => (
  (contact?.Emails || contact?.emails || []).map(getEmailId).filter(Boolean)[0] ||
  contact?.EmailId ||
  contact?.emailId ||
  ''
);

export const getContactEmailValues = (contact = {}) => (
  Array.from(new Set(
    (contact?.Emails || contact?.emails || [])
      .map(getEmailId)
      .map(normalizeString)
      .filter(Boolean)
  ))
);

const getCurrentLanguageRows = (contact = {}) => {
  const rows = contact?.LanguageProficienciesHistory || contact?.languageProficienciesHistory || [];
  const rowsByLanguage = {};

  (rows || []).forEach((row) => {
    const languageId = row?.LanguageId || row?.languageId;
    if (!languageId) return;

    const existing = rowsByLanguage[languageId];
    const isCurrent = !row?.EndDate && !row?.endDate;
    if (!existing || isCurrent) {
      rowsByLanguage[languageId] = row;
    }
  });

  return Object.values(rowsByLanguage);
};

export const buildInitialContactProfileValues = (contact = {}) => {
  const residencyLocation = contact?.Location?.ResidencyLocation || {};
  const birthLocation = contact?.Location?.BirthLocation || {};
  const languageLevelValues = getCurrentLanguageRows(contact).reduce((accumulator, row) => {
    const languageId = row?.LanguageId || row?.languageId;
    const level = row?.LanguageLevelAbbreviation || row?.languageLevelAbbreviation;
    if (languageId) accumulator[languageId] = level || null;
    return accumulator;
  }, {});

  return {
    contactInternalId: contact?.ContactInternalId || contact?.contactInternalId || null,
    contactExternalId: contact?.ContactExternalId || contact?.contactExternalId || null,
    names: contact?.Names || contact?.names || '',
    lastNames: contact?.LastNames || contact?.lastNames || '',
    sex: contact?.Sex || contact?.sex || null,
    dateOfBirth: contact?.DateOfBirth || contact?.dateOfBirth || null,
    emails: getContactEmailValues(contact),
    countryOfResidence: residencyLocation?.CountryOfResidency || residencyLocation?.countryOfResidency || null,
    countryDivisionOfResidence: residencyLocation?.CountryDivisionResidencyId ||
      residencyLocation?.countryDivisionResidencyId ||
      residencyLocation?.CountryDivisionResidencyName ||
      residencyLocation?.countryDivisionResidencyName ||
      null,
    countryOfBirth: birthLocation?.CountryOfBirth || birthLocation?.countryOfBirth || null,
    countryDivisionOfBirth: birthLocation?.CountryDivisionBirthId ||
      birthLocation?.countryDivisionBirthId ||
      birthLocation?.CountryDivisionBirthName ||
      birthLocation?.countryDivisionBirthName ||
      null,
    languageProficiencies: languageLevelValues,
    profilePictureUpload: []
  };
};

export const buildEditableLanguageRows = (contact = {}, languageData = []) => {
  const rows = getCurrentLanguageRows(contact);

  return rows.map((row) => {
    const languageId = row?.LanguageId || row?.languageId;
    const languageDefinition = (languageData || []).find(language => language?.langId === languageId);

    return {
      languageId,
      languageName: languageDefinition?.langName || languageId,
      languageIcon: languageDefinition?.icon || null,
      languageLevelAbbreviation: row?.LanguageLevelAbbreviation || row?.languageLevelAbbreviation || null
    };
  }).filter(row => row.languageId);
};

const formatDateValue = (value) => {
  if (!value) return null;
  if (typeof value?.format === 'function') return value.format('YYYY-MM-DD');
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().substring(0, 10);
  }
  return String(value).substring(0, 10);
};

const calculateAge = (dateOfBirth) => {
  const formattedDate = formatDateValue(dateOfBirth);
  if (!formattedDate) return null;

  const birthDate = new Date(`${formattedDate}T00:00:00Z`);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birthDate.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
    age -= 1;
  }

  return age;
};

const buildLanguageProficiencyPayload = (languageValues = {}) => (
  Object.entries(languageValues || {})
    .filter(([languageId, languageLevelAbbreviation]) => languageId && languageLevelAbbreviation)
    .map(([languageId, languageLevelAbbreviation]) => ({
      languageId,
      languageLevelAbbreviation
    }))
);

export const buildUpsertEnrolleeListPayload = ({
  values = {},
  contact = {},
  countries = [],
  residencyDivisions = [],
  birthDivisions = []
}) => {
  const emailValues = (values.emails || []).map(normalizeString).filter(Boolean);
  const residencyCountry = getCountryById(countries, values.countryOfResidence);
  const birthCountry = getCountryById(countries, values.countryOfBirth);
  const residencyDivision = getDivisionByValue(residencyDivisions, values.countryDivisionOfResidence);
  const birthDivision = getDivisionByValue(birthDivisions, values.countryDivisionOfBirth);

  return [{
    contactInternalId: contact?.ContactInternalId || values.contactInternalId || null,
    contactExternalId: contact?.ContactExternalId || values.contactExternalId || null,
    emailAddress: emailValues[0] || getPrimaryContactEmail(contact) || null,
    emails: emailValues.map(emailId => ({ emailId })),
    lastNames: normalizeString(values.lastNames) || null,
    names: normalizeString(values.names) || null,
    sex: values.sex || null,
    dateOfBirth: formatDateValue(values.dateOfBirth),
    countryOfResidence: residencyCountry?.CountryName || values.countryOfResidence || null,
    countryDivisionOfResidence: residencyDivision?.CountryDivisionId || values.countryDivisionOfResidence || null,
    countryOfBirth: birthCountry?.CountryName || values.countryOfBirth || null,
    countryDivisionOfBirth: birthDivision?.CountryDivisionId || values.countryDivisionOfBirth || null,
    languageProficiencies: buildLanguageProficiencyPayload(values.languageProficiencies),
    termsVersion: values.termsVersion || '2.1'
  }];
};

const buildLocationPatch = ({
  countryId,
  divisionValue,
  countryFieldPrefix,
  divisionFieldPrefix,
  countries = [],
  divisions = []
}) => {
  const country = getCountryById(countries, countryId);
  const division = getDivisionByValue(divisions, divisionValue);

  return {
    [`CountryOf${countryFieldPrefix}`]: countryId || null,
    [`CountryOf${countryFieldPrefix}Name`]: country?.CountryName || countryId || null,
    [`CountryOf${countryFieldPrefix}NativeName`]: country?.NativeCountryName || country?.CountryName || countryId || null,
    [`CountryDivision${divisionFieldPrefix}Id`]: division?.CountryDivisionId || divisionValue || null,
    [`CountryDivision${divisionFieldPrefix}Name`]: division?.CountryDivisionName || divisionValue || null
  };
};

const buildEmailPatch = (contact = {}, emailValues = []) => {
  const currentEmailMap = (contact?.Emails || contact?.emails || []).reduce((accumulator, emailRecord) => {
    const emailId = getEmailId(emailRecord);
    if (emailId) accumulator[normalizeIdentifier(emailId)] = emailRecord;
    return accumulator;
  }, {});

  return (emailValues || []).map((emailId, index) => {
    const existing = currentEmailMap[normalizeIdentifier(emailId)] || {};
    return {
      ...existing,
      EmailId: emailId,
      emailId,
      ContactEmailPriority: existing.ContactEmailPriority ?? existing.contactEmailPriority ?? index,
      HasOptedOutOfCommunication: existing.HasOptedOutOfCommunication ?? existing.hasOptedOutOfCommunication ?? false,
      hasOptedOutOfCommunication: existing.hasOptedOutOfCommunication ?? existing.HasOptedOutOfCommunication ?? false
    };
  });
};

const buildLanguageHistoryPatch = (contact = {}, languageValues = {}) => {
  const existingRows = contact?.LanguageProficienciesHistory || contact?.languageProficienciesHistory || [];
  const patchedLanguageIds = new Set(Object.keys(languageValues || {}));
  const patchedRows = (existingRows || []).map((row) => {
    const languageId = row?.LanguageId || row?.languageId;
    if (!patchedLanguageIds.has(languageId)) return row;

    return {
      ...row,
      LanguageId: languageId,
      LanguageLevelAbbreviation: languageValues[languageId],
      languageId,
      languageLevelAbbreviation: languageValues[languageId]
    };
  });

  Object.entries(languageValues || {}).forEach(([languageId, level]) => {
    const alreadyExists = patchedRows.some(row => (row?.LanguageId || row?.languageId) === languageId);
    if (!alreadyExists && level) {
      patchedRows.push({
        LanguageId: languageId,
        LanguageLevelAbbreviation: level,
        StartDate: new Date().toISOString(),
        EndDate: null
      });
    }
  });

  return patchedRows;
};

export const buildContactProfilePatch = ({
  values = {},
  contact = {},
  countries = [],
  residencyDivisions = [],
  birthDivisions = [],
  avatarUrl = null
}) => {
  const emailValues = (values.emails || []).map(normalizeString).filter(Boolean);
  const names = normalizeString(values.names);
  const lastNames = normalizeString(values.lastNames);

  const patch = {
    ContactInternalId: contact?.ContactInternalId || values.contactInternalId || null,
    ContactExternalId: contact?.ContactExternalId || values.contactExternalId || null,
    Names: names,
    LastNames: lastNames,
    FullName: [names, lastNames].filter(Boolean).join(' '),
    Sex: values.sex || null,
    DateOfBirth: formatDateValue(values.dateOfBirth),
    Age: calculateAge(values.dateOfBirth),
    Emails: buildEmailPatch(contact, emailValues),
    Location: {
      ...(contact?.Location || {}),
      ResidencyLocation: {
        ...(contact?.Location?.ResidencyLocation || {}),
        ...buildLocationPatch({
          countryId: values.countryOfResidence,
          divisionValue: values.countryDivisionOfResidence,
          countryFieldPrefix: 'Residency',
          divisionFieldPrefix: 'Residency',
          countries,
          divisions: residencyDivisions
        })
      },
      BirthLocation: {
        ...(contact?.Location?.BirthLocation || {}),
        ...buildLocationPatch({
          countryId: values.countryOfBirth,
          divisionValue: values.countryDivisionOfBirth,
          countryFieldPrefix: 'Birth',
          divisionFieldPrefix: 'Birth',
          countries,
          divisions: birthDivisions
        })
      }
    },
    LanguageProficienciesHistory: buildLanguageHistoryPatch(contact, values.languageProficiencies)
  };

  if (avatarUrl) {
    patch.AvatarUrl = avatarUrl;
    patch.avatarUrl = avatarUrl;
  }

  return patch;
};

const getDisplayValue = (value) => (
  value == null || value === '' ? '—' : String(value)
);

export const buildContactProfileChangeSummary = ({
  initialValues = {},
  values = {},
  countries = [],
  residencyDivisions = [],
  birthDivisions = [],
  languageRows = []
}) => {
  const rows = [];
  const pushIfChanged = (key, label, beforeValue, afterValue) => {
    if (getDisplayValue(beforeValue) === getDisplayValue(afterValue)) return;
    rows.push({
      key,
      label,
      before: getDisplayValue(beforeValue),
      after: getDisplayValue(afterValue)
    });
  };

  pushIfChanged('names', 'Names', initialValues.names, values.names);
  pushIfChanged('lastNames', 'Last Names', initialValues.lastNames, values.lastNames);
  pushIfChanged('sex', 'Sex', initialValues.sex, values.sex);
  pushIfChanged('dateOfBirth', 'Date of Birth', formatDateValue(initialValues.dateOfBirth), formatDateValue(values.dateOfBirth));
  pushIfChanged('emails', 'Emails', (initialValues.emails || []).join(', '), (values.emails || []).join(', '));

  const getCountryLabel = (countryId) => getCountryById(countries, countryId)?.CountryName || countryId;
  const getResidencyDivisionLabel = (divisionValue) => getDivisionByValue(residencyDivisions, divisionValue)?.CountryDivisionName || divisionValue;
  const getBirthDivisionLabel = (divisionValue) => getDivisionByValue(birthDivisions, divisionValue)?.CountryDivisionName || divisionValue;

  pushIfChanged('countryOfResidence', 'Residence Country', getCountryLabel(initialValues.countryOfResidence), getCountryLabel(values.countryOfResidence));
  pushIfChanged('countryDivisionOfResidence', 'Residence Region', getResidencyDivisionLabel(initialValues.countryDivisionOfResidence), getResidencyDivisionLabel(values.countryDivisionOfResidence));
  pushIfChanged('countryOfBirth', 'Birth Country', getCountryLabel(initialValues.countryOfBirth), getCountryLabel(values.countryOfBirth));
  pushIfChanged('countryDivisionOfBirth', 'Birth Region', getBirthDivisionLabel(initialValues.countryDivisionOfBirth), getBirthDivisionLabel(values.countryDivisionOfBirth));

  (languageRows || []).forEach((row) => {
    pushIfChanged(
      `language-${row.languageId}`,
      `${row.languageName} Level`,
      initialValues.languageProficiencies?.[row.languageId],
      values.languageProficiencies?.[row.languageId]
    );
  });

  if ((values.profilePictureUpload || []).length > 0) {
    rows.push({
      key: 'profilePictureUpload',
      label: 'Profile Image',
      before: 'Current image',
      after: 'New upload'
    });
  }

  return rows;
};

export const mergeContactProfilePatch = (contact = {}, patch = {}) => {
  if (!patch) return contact;

  return {
    ...contact,
    ...patch,
    Location: {
      ...(contact?.Location || {}),
      ...(patch?.Location || {}),
      ResidencyLocation: {
        ...(contact?.Location?.ResidencyLocation || {}),
        ...(patch?.Location?.ResidencyLocation || {})
      },
      BirthLocation: {
        ...(contact?.Location?.BirthLocation || {}),
        ...(patch?.Location?.BirthLocation || {})
      }
    }
  };
};

const ContactProfileEditor = {
  CONTACT_PROFILE_EDIT_SCOPES,
  buildInitialContactProfileValues,
  buildEditableLanguageRows,
  buildUpsertEnrolleeListPayload,
  buildContactProfilePatch,
  buildContactProfileChangeSummary,
  getPrimaryContactEmail,
  mergeContactProfilePatch
};

export default ContactProfileEditor;
