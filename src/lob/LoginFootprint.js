import { Card, Tag, Timeline } from 'antd';
import { ClockCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import LoginFootprintAreaGraph from 'components/layout-components/Graphs/LoginFootprintAreaGraph';

const UNKNOWN_LABEL = 'Unknown';
const MAX_TIMELINE_ITEMS = 7;
const TIMELINE_GROUP_BY_DAY_THRESHOLD = 10;
const TIMELINE_GROUP_BY_WEEK_THRESHOLD = 30;

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

const formatUtcDateTime = (value) => {
  if (!value) return UNKNOWN_LABEL;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return UNKNOWN_LABEL;

  const iso = date.toISOString();
  return `${iso.substring(0, 10)} ${iso.substring(11, 19)} UTC`;
};

const formatUtcDate = (value) => {
  if (!value) return UNKNOWN_LABEL;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return UNKNOWN_LABEL;

  return date.toISOString().substring(0, 10);
};

const getUtcWeekStart = (value) => {
  if (!value) return null;

  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const currentUtcDay = date.getUTCDay();
  const offsetFromMonday = currentUtcDay === 0 ? 6 : currentUtcDay - 1;
  date.setUTCDate(date.getUTCDate() - offsetFromMonday);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const getGenderLabel = (value) => {
  if (!value) return null;

  const normalizedValue = String(value).trim().toUpperCase();
  if (normalizedValue === 'M' || normalizedValue === 'MALE') return 'Male';
  if (normalizedValue === 'F' || normalizedValue === 'FEMALE') return 'Female';

  return String(value).trim();
};

const normalizeLoginRow = (row) => {
  const loginParts = getUtcLoginParts(getLoginDateValue(row));
  if (!loginParts) return null;

  const isGlobalAccessUser = getBooleanValue(row?.IsGlobalAccessUser ?? row?.isGlobalAccessUser);
  const primaryRole = row?.PrimaryRole || row?.primaryRole || null;
  const gender = getGenderLabel(row?.Gender || row?.gender);
  const countryOfResidency = row?.CountryOfResidency || row?.countryOfResidency || null;
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
    countryOfResidency: countryOfResidency || UNKNOWN_LABEL,
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

export const buildLoginFootprintTrendData = (rows = []) => {
  const normalizedRows = normalizeLoginFootprintRows(rows);
  const counts = normalizedRows.reduce((groups, row) => {
    if (!groups[row.date]) {
      groups[row.date] = {
        count: 0,
        emailCounts: {}
      };
    }

    groups[row.date].count += 1;
    if (row.emailId) {
      groups[row.date].emailCounts[row.emailId] = (groups[row.date].emailCounts[row.emailId] || 0) + 1;
    }
    return groups;
  }, {});

  return Object.keys(counts)
    .sort()
    .map(date => ({
      date,
      count: counts[date].count,
      uniqueEmails: Object.keys(counts[date].emailCounts).length,
      emailUsageSummary: sortEmailUsageSummary(counts[date].emailCounts)
    }));
};

const getUniqueFilters = (values = []) => (
  Array.from(new Set(values.filter(Boolean)))
    .sort((a, b) => String(a).localeCompare(String(b)))
    .map(value => ({ text: value, value }))
);

const getGenderTagColor = (gender) => {
  if (gender === 'Male') return 'geekblue';
  if (gender === 'Female') return 'magenta';
  return 'default';
};

const sortEmailUsageSummary = (emailCounts = {}) => (
  Object.entries(emailCounts)
    .map(([emailId, count]) => ({ emailId, count }))
    .sort((a, b) => (
      b.count - a.count ||
      a.emailId.localeCompare(b.emailId)
    ))
);

const buildEmailUsageSummary = (rows = []) => {
  const emailCounts = (rows || []).reduce((groups, row) => {
    if (!row?.emailId) return groups;
    groups[row.emailId] = (groups[row.emailId] || 0) + 1;
    return groups;
  }, {});

  return sortEmailUsageSummary(emailCounts);
};

const renderEmailUsageBreakdown = (emailUsageSummary = []) => {
  if (!Array.isArray(emailUsageSummary) || emailUsageSummary.length === 0) return null;

  return (
    <div style={{ marginTop: 4 }}>
      {emailUsageSummary.map(item => (
        <small
          key={item.emailId}
          style={{ color: '#888', display: 'block', lineHeight: 1.45 }}
        >
          {item.emailId} ({item.count})
        </small>
      ))}
    </div>
  );
};

const buildTimelineView = (timelineRows = []) => {
  const safeRows = [...(timelineRows || [])].sort((a, b) => a.loginDate.localeCompare(b.loginDate));

  if (safeRows.length === 0) {
    return {
      descriptor: 'No login activity',
      items: []
    };
  }

  if (safeRows.length > TIMELINE_GROUP_BY_WEEK_THRESHOLD) {
    const groupedByWeek = safeRows.reduce((groups, row) => {
      const weekStart = getUtcWeekStart(row.loginDate);
      const weekKey = weekStart?.toISOString().substring(0, 10);
      if (!weekKey) return groups;

      if (!groups[weekKey]) {
        groups[weekKey] = {
          key: weekKey,
          label: `Week of ${weekKey}`,
          count: 0,
          lastLoginDate: row.loginDate,
          emailCounts: {}
        };
      }

      groups[weekKey].count += 1;
      if (row.emailId) {
        groups[weekKey].emailCounts[row.emailId] = (groups[weekKey].emailCounts[row.emailId] || 0) + 1;
      }
      if (row.loginDate > groups[weekKey].lastLoginDate) {
        groups[weekKey].lastLoginDate = row.loginDate;
      }

      return groups;
    }, {});

    const items = Object.values(groupedByWeek)
      .sort((a, b) => a.lastLoginDate.localeCompare(b.lastLoginDate))
      .slice(-MAX_TIMELINE_ITEMS)
      .map(item => ({
        ...item,
        emailUsageSummary: sortEmailUsageSummary(item.emailCounts)
      }));

    return {
      descriptor: `Last ${items.length} weekly buckets`,
      items
    };
  }

  if (safeRows.length > TIMELINE_GROUP_BY_DAY_THRESHOLD) {
    const groupedByDay = safeRows.reduce((groups, row) => {
      const dayKey = formatUtcDate(row.loginDate);
      if (!groups[dayKey]) {
        groups[dayKey] = {
          key: dayKey,
          label: dayKey,
          count: 0,
          lastLoginDate: row.loginDate,
          emailCounts: {}
        };
      }

      groups[dayKey].count += 1;
      if (row.emailId) {
        groups[dayKey].emailCounts[row.emailId] = (groups[dayKey].emailCounts[row.emailId] || 0) + 1;
      }
      if (row.loginDate > groups[dayKey].lastLoginDate) {
        groups[dayKey].lastLoginDate = row.loginDate;
      }

      return groups;
    }, {});

    const items = Object.values(groupedByDay)
      .sort((a, b) => a.lastLoginDate.localeCompare(b.lastLoginDate))
      .slice(-MAX_TIMELINE_ITEMS)
      .map(item => ({
        ...item,
        emailUsageSummary: sortEmailUsageSummary(item.emailCounts)
      }));

    return {
      descriptor: `Last ${items.length} daily buckets`,
      items
    };
  }

  return {
    descriptor: `Last ${Math.min(MAX_TIMELINE_ITEMS, safeRows.length)} entries`,
    items: safeRows.slice(-MAX_TIMELINE_ITEMS).map(row => ({
      key: row.loginDate,
      label: formatUtcDateTime(row.loginDate),
      count: 1,
      lastLoginDate: row.loginDate,
      emailId: row.emailId,
      emailUsageSummary: row.emailId ? [{ emailId: row.emailId, count: 1 }] : []
    }))
  };
};

const renderLoginExpandedDetails = (record) => {
  const timelineRows = record?.loginTimeline || [];
  const timelineView = buildTimelineView(timelineRows);
  const emailUsageSummary = record?.emailUsageSummary || [];

  if (timelineRows.length === 0) {
    return <Tag>{UNKNOWN_LABEL}</Tag>;
  }

  const timelineItems = timelineView.items.map((row, index) => {
    const isLatest = index === timelineView.items.length - 1;

    return {
      ...(isLatest ? {
        color: 'green',
        icon: <ClockCircleOutlined style={{ fontSize: 18 }} />
      } : {}),
      content: (
        <div style={{ minWidth: 160 }}>
          {isLatest && <Tag color="green" style={{ marginBottom: 4 }}>Latest</Tag>}
          <div><strong>{row.label}</strong></div>
          <div>{row.count} login{row.count === 1 ? '' : 's'}</div>
          {row.count > 1 && (
            <small style={{ color: '#888', display: 'block' }}>
              Last activity: {formatUtcDateTime(row.lastLoginDate)}
            </small>
          )}
          {renderEmailUsageBreakdown(row.emailUsageSummary)}
        </div>
      )
    };
  });

  return (
    <div style={{ padding: '16px 8px 12px', minHeight: 520 }}>
      <Card
        size="small"
        title={<span><ClockCircleOutlined style={{ marginRight: 8 }} />Recent Login Sequence</span>}
        extra={<small style={{ color: '#888' }}>{timelineView.descriptor}</small>}
        style={{ marginBottom: 16 }}
      >
        <div style={{ overflowX: 'auto', padding: '20px 4px 20px', minHeight: 240 }}>
          <div style={{ minWidth: Math.max(760, timelineItems.length * 190) }}>
            <Timeline
              orientation="horizontal"
              mode="end"
              items={timelineItems}
            />
          </div>
        </div>
      </Card>

      <Card
        size="small"
        title={<span><LineChartOutlined style={{ marginRight: 8 }} />Individual Footprint History</span>}
        extra={<small style={{ color: '#888' }}>All history grouped by day</small>}
      >
        {emailUsageSummary.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>
              Emails used to log in
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {emailUsageSummary.map(item => (
                <Tag key={item.emailId} color="blue">
                  {item.emailId} ({item.count})
                </Tag>
              ))}
            </div>
          </div>
        )}
        <LoginFootprintAreaGraph
          hideCard
          trendData={record?.loginTrendData || []}
          emptyDescriptionKey="admin.tools.loginFootprint.noActivity"
        />
      </Card>
    </div>
  );
};

export const buildLoginFootprintTableModel = (rows = []) => {
  const normalizedRows = normalizeLoginFootprintRows(rows);
  const groupedByContact = normalizedRows.reduce((groups, row) => {
    const contactInternalId = row.contactInternalId || UNKNOWN_LABEL;
    if (!groups[contactInternalId]) {
      groups[contactInternalId] = {
        key: contactInternalId,
        contactInternalId,
        gender: row.gender || UNKNOWN_LABEL,
        age: row.age ?? UNKNOWN_LABEL,
        ageGroup: row.ageGroup || UNKNOWN_LABEL,
        firstLoginTime: row.loginDate,
        lastLoginTime: row.loginDate,
        loginCount: 0,
        emails: new Set(),
        loginTimeline: []
      };
    }

    groups[contactInternalId].loginCount += 1;
    groups[contactInternalId].loginTimeline.push(row);
    if (row.emailId) groups[contactInternalId].emails.add(row.emailId);

    if (row.loginDate < groups[contactInternalId].firstLoginTime) {
      groups[contactInternalId].firstLoginTime = row.loginDate;
    }

    if (row.loginDate > groups[contactInternalId].lastLoginTime) {
      groups[contactInternalId].lastLoginTime = row.loginDate;
      groups[contactInternalId].gender = row.gender || groups[contactInternalId].gender;
      groups[contactInternalId].age = row.age ?? groups[contactInternalId].age;
      groups[contactInternalId].ageGroup = row.ageGroup || groups[contactInternalId].ageGroup;
    }

    return groups;
  }, {});

  const tableData = Object.values(groupedByContact)
    .map(group => ({
      ...group,
      emails: Array.from(group.emails),
      firstLoginDisplay: formatUtcDateTime(group.firstLoginTime),
      lastLoginDisplay: formatUtcDateTime(group.lastLoginTime),
      loginTimeline: group.loginTimeline.sort((a, b) => a.loginDate.localeCompare(b.loginDate)),
      loginTrendData: buildLoginFootprintTrendData(group.loginTimeline),
      emailUsageSummary: buildEmailUsageSummary(group.loginTimeline)
    }))
    .sort((a, b) => (
      b.loginCount - a.loginCount ||
      b.lastLoginTime.localeCompare(a.lastLoginTime) ||
      a.contactInternalId.localeCompare(b.contactInternalId)
    ));

  const columns = [
    {
      title: 'Contact Internal ID',
      dataIndex: 'contactInternalId',
      key: 'contactInternalId',
      width: 280,
      filterSearch: true,
      filters: getUniqueFilters(tableData.map(row => row.contactInternalId)),
      onFilter: (value, record) => record.contactInternalId === value,
      sorter: (a, b) => a.contactInternalId.localeCompare(b.contactInternalId),
      render: (contactInternalId) => (
        <span style={{ fontFamily: 'monospace' }}>{contactInternalId}</span>
      )
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 120,
      filters: getUniqueFilters(tableData.map(row => row.gender)),
      onFilter: (value, record) => record.gender === value,
      sorter: (a, b) => a.gender.localeCompare(b.gender),
      render: (gender) => <Tag color={getGenderTagColor(gender)}>{gender}</Tag>
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: 100,
      filters: getUniqueFilters(tableData.map(row => row.ageGroup)),
      onFilter: (value, record) => record.ageGroup === value,
      sorter: (a, b) => (Number(a.age) || 0) - (Number(b.age) || 0),
      render: (age, record) => (
        <span>{age === UNKNOWN_LABEL ? UNKNOWN_LABEL : `${age} (${record.ageGroup})`}</span>
      )
    },
    {
      title: 'Logins',
      dataIndex: 'loginCount',
      key: 'loginCount',
      width: 110,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.loginCount - b.loginCount,
      render: (loginCount) => <Tag color="blue">{loginCount}</Tag>
    },
    {
      title: 'First Login',
      dataIndex: 'firstLoginDisplay',
      key: 'firstLoginDisplay',
      width: 190,
      sorter: (a, b) => a.firstLoginTime.localeCompare(b.firstLoginTime)
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginDisplay',
      key: 'lastLoginDisplay',
      width: 190,
      sorter: (a, b) => a.lastLoginTime.localeCompare(b.lastLoginTime)
    }
  ];

  return {
    tableData,
    columns,
    expandable: {
      rowExpandable: (record) => (record?.loginTimeline || []).length > 0,
      expandedRowRender: renderLoginExpandedDetails
    }
  };
};

const LoginFootprint = {
  normalizeLoginFootprintRows,
  buildLoginFootprintHeatmapData,
  buildLoginFootprintScatterData,
  buildLoginFootprintTrendData,
  buildLoginFootprintSummary,
  buildLoginFootprintTableModel
};

export default LoginFootprint;
