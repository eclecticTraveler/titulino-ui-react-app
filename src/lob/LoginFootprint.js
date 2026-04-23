const UNKNOWN_LABEL = 'Unknown';

const getLoginDateValue = (row) => (
  row?.LoginDate ||
  row?.loginDate ||
  row?.login_date ||
  row?.CreatedAt ||
  row?.createdAt
);

const getContactInternalId = (row) => (
  row?.ContactInternalId ||
  row?.contactInternalId ||
  row?.contact_internal_id ||
  ''
);

const getEmailId = (row) => (
  row?.EmailId ||
  row?.emailId ||
  row?.email_id ||
  ''
);

const getBooleanValue = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
};

const getUtcLoginParts = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const dateKey = date.toISOString().substring(0, 10);
  const hour = date.getUTCHours();

  return {
    date,
    dateKey,
    hour,
    hourLabel: `${String(hour).padStart(2, '0')}:00 UTC`
  };
};

const getAgeGroup = (age) => {
  const numericAge = Number(age);
  if (!Number.isFinite(numericAge) || numericAge <= 0) return UNKNOWN_LABEL;
  if (numericAge < 18) return 'Under 18';
  if (numericAge <= 24) return '18-24';
  if (numericAge <= 34) return '25-34';
  if (numericAge <= 44) return '35-44';
  if (numericAge <= 54) return '45-54';
  if (numericAge <= 64) return '55-64';
  return '65+';
};

const normalizeLoginRow = (row) => {
  const loginParts = getUtcLoginParts(getLoginDateValue(row));
  if (!loginParts) return null;

  const isGlobalAccessUser = getBooleanValue(row?.IsGlobalAccessUser ?? row?.isGlobalAccessUser);
  const primaryRole = row?.PrimaryRole || row?.primaryRole || null;
  const gender = row?.Gender || row?.gender || null;
  const countryOfResidency = row?.CountryOfResidency || row?.countryOfResidency || UNKNOWN_LABEL;
  const age = row?.Age ?? row?.age ?? null;

  return {
    ...row,
    emailId: getEmailId(row),
    contactInternalId: getContactInternalId(row),
    loginDate: loginParts.date.toISOString(),
    date: loginParts.dateKey,
    hour: loginParts.hour,
    hourLabel: loginParts.hourLabel,
    isGlobalAccessUser,
    primaryRole,
    gender: gender || UNKNOWN_LABEL,
    age,
    ageGroup: row?.AgeGroup || row?.ageGroup || getAgeGroup(age),
    countryOfResidency,
    accessProfile: isGlobalAccessUser
      ? (primaryRole || 'Global Access')
      : 'Course User',
    profileSegment: isGlobalAccessUser
      ? (primaryRole || 'Global Access')
      : (gender || 'Course User')
  };
};

const getSegment = (row, groupBy) => {
  switch (groupBy) {
    case 'access':
      return row.accessProfile || UNKNOWN_LABEL;
    case 'gender':
      return row.gender || UNKNOWN_LABEL;
    case 'country':
      return row.countryOfResidency || UNKNOWN_LABEL;
    case 'age':
      return row.ageGroup || UNKNOWN_LABEL;
    case 'profile':
    default:
      return row.profileSegment || row.accessProfile || UNKNOWN_LABEL;
  }
};

export const normalizeLoginFootprintRows = (rows = []) => (
  (rows || [])
    .map(normalizeLoginRow)
    .filter(Boolean)
    .sort((a, b) => a.loginDate.localeCompare(b.loginDate))
);

export const buildLoginFootprintHeatmapData = (rows = []) => {
  const normalizedRows = normalizeLoginFootprintRows(rows);
  if (normalizedRows.length === 0) return [];

  const activeDates = Array.from(new Set(normalizedRows.map(row => row.date))).sort();
  const buckets = normalizedRows.reduce((bucketMap, row) => {
    const key = `${row.date}|${row.hour}`;
    if (!bucketMap[key]) {
      bucketMap[key] = {
        date: row.date,
        hour: row.hour,
        hourLabel: row.hourLabel,
        count: 0,
        uniqueContacts: new Set()
      };
    }

    bucketMap[key].count += 1;
    if (row.contactInternalId) bucketMap[key].uniqueContacts.add(row.contactInternalId);
    return bucketMap;
  }, {});

  return activeDates.flatMap(date => (
    Array.from({ length: 24 }, (_, hour) => {
      const key = `${date}|${hour}`;
      const bucket = buckets[key];
      return {
        date,
        hour,
        hourLabel: `${String(hour).padStart(2, '0')}:00 UTC`,
        count: bucket?.count || 0,
        uniqueUsers: bucket?.uniqueContacts?.size || 0
      };
    })
  ));
};

export const buildLoginFootprintScatterData = (rows = [], options = {}) => {
  const {
    groupBy = 'profile',
    includeSegment = true
  } = options;

  const normalizedRows = normalizeLoginFootprintRows(rows);
  const buckets = {};

  normalizedRows.forEach(row => {
    const segment = includeSegment ? getSegment(row, groupBy) : 'Logins';
    const key = `${row.date}|${row.hour}|${segment}`;

    if (!buckets[key]) {
      buckets[key] = {
        date: row.date,
        hour: row.hour,
        hourLabel: row.hourLabel,
        count: 0,
        segment,
        gender: row.gender,
        ageGroup: row.ageGroup,
        countryOfResidency: row.countryOfResidency,
        accessProfile: row.accessProfile,
        uniqueContacts: new Set(),
        emails: new Set()
      };
    }

    buckets[key].count += 1;
    if (row.contactInternalId) buckets[key].uniqueContacts.add(row.contactInternalId);
    if (row.emailId) buckets[key].emails.add(row.emailId);
  });

  return Object.values(buckets)
    .map(bucket => ({
      date: bucket.date,
      hour: bucket.hour,
      hourLabel: bucket.hourLabel,
      count: bucket.count,
      segment: bucket.segment,
      gender: bucket.gender,
      ageGroup: bucket.ageGroup,
      countryOfResidency: bucket.countryOfResidency,
      accessProfile: bucket.accessProfile,
      uniqueUsers: bucket.uniqueContacts.size,
      uniqueEmails: bucket.emails.size
    }))
    .sort((a, b) => (
      a.date.localeCompare(b.date) ||
      a.hour - b.hour ||
      a.segment.localeCompare(b.segment)
    ));
};

export const buildLoginFootprintSummary = (rows = []) => {
  const normalizedRows = normalizeLoginFootprintRows(rows);
  const uniqueContacts = new Set(normalizedRows.map(row => row.contactInternalId).filter(Boolean));
  const uniqueEmails = new Set(normalizedRows.map(row => row.emailId).filter(Boolean));

  return {
    totalLogins: normalizedRows.length,
    uniqueUsers: uniqueContacts.size,
    uniqueEmails: uniqueEmails.size,
    firstLoginDate: normalizedRows[0]?.loginDate || null,
    lastLoginDate: normalizedRows[normalizedRows.length - 1]?.loginDate || null
  };
};

const LoginFootprint = {
  normalizeLoginFootprintRows,
  buildLoginFootprintHeatmapData,
  buildLoginFootprintScatterData,
  buildLoginFootprintSummary
};

export default LoginFootprint;
