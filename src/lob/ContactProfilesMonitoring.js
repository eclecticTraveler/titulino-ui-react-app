import { Button, Descriptions, Table, Tag, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import IntlMessage from 'components/util-components/IntlMessage';

const UNKNOWN_LABEL = 'Unknown';
const EMPTY_LABEL = '-';

const toArray = (value) => (Array.isArray(value) ? value : []);

const normalizeIdentifier = (value) => (
  value == null ? '' : String(value).trim().toLowerCase()
);

const getBooleanValue = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return value == null ? fallback : Boolean(value);
};

const formatDate = (value) => {
  if (!value) return EMPTY_LABEL;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_LABEL;
  return date.toISOString().substring(0, 10);
};

const getUniqueFilters = (values = []) => (
  Array.from(new Set(values.filter(value => value !== undefined && value !== null && value !== '')))
    .sort((a, b) => String(a).localeCompare(String(b)))
    .map(value => ({ text: String(value), value }))
);

const getContactInternalId = (profile) => (
  profile?.ContactInternalId || profile?.contactInternalId || profile?.contact_internal_id || ''
);

const getContactExternalId = (profile) => (
  profile?.ContactExternalId ?? profile?.contactExternalId ?? profile?.contact_external_id ?? ''
);

const getFullName = (profile) => (
  profile?.FullName ||
  profile?.fullName ||
  [profile?.Names || profile?.names, profile?.LastNames || profile?.lastNames].filter(Boolean).join(' ') ||
  UNKNOWN_LABEL
);

const getAge = (profile) => profile?.Age ?? profile?.age ?? null;

const getSex = (profile) => profile?.Sex || profile?.sex || UNKNOWN_LABEL;

const normalizeEmail = (email = {}, index = 0) => {
  const emailId = email.EmailId || email.emailId || email.email || '';

  return {
    key: emailId || `email-${index}`,
    emailId,
    emailDomain: email.EmailDomain || email.emailDomain || '',
    emailRawInput: email.EmailRawInput || email.emailRawInput || emailId,
    isEmailParseValid: getBooleanValue(email.IsEmailParseValid ?? email.isEmailParseValid, true),
    contactEmailPriority: email.ContactEmailPriority ?? email.contactEmailPriority ?? null,
    hasOptedOutOfCommunication: getBooleanValue(
      email.HasOptedOutOfCommunication ?? email.hasOptedOutOfCommunication,
      false
    ),
    createdAt: email.CreatedAt || email.createdAt || null
  };
};

const normalizeCourse = (course = {}, index = 0) => {
  const details = course.CourseDetails || course.courseDetails || {};
  const courseCodeId = course.CourseCodeId || course.courseCodeId || '';

  return {
    key: `${courseCodeId || 'course'}-${index}`,
    courseCodeId,
    courseTitle: details.course || details.Course || courseCodeId || UNKNOWN_LABEL,
    teacher: details.teacher || details.Teacher || '',
    startDate: course.StartDate || course.startDate || null,
    endDate: course.EndDate || course.endDate || null,
    creationDate: course.CreationDate || course.creationDate || null,
    nativeLanguageId: course.NativeLanguageId || course.nativeLanguageId || '',
    targetLanguageId: course.TargetLanguageId || course.targetLanguageId || ''
  };
};

const normalizeUserCourseRole = (role = {}, index = 0) => {
  const courseCodeId = role.CourseCodeId || role.courseCodeId || '';
  const userRoleId = role.UserRoleId || role.userRoleId || '';
  const emailId = role.EmailId || role.emailId || '';

  return {
    key: `${userRoleId || 'role'}-${courseCodeId || 'course'}-${emailId || index}-${index}`,
    emailId,
    courseCodeId,
    userRoleId,
    userRolePriority: role.UserRolePriority ?? role.userRolePriority ?? null,
    createdAt: role.CreatedAt || role.createdAt || null,
    modifiedAt: role.ModifiedAt || role.modifiedAt || null,
    isGlobalAccessUserRole: getBooleanValue(
      role.IsGlobalAccessUserRole ?? role.isGlobalAccessUserRole,
      false
    )
  };
};

const buildSearchText = (row) => [
  row.contactInternalId,
  row.contactExternalId,
  row.fullName,
  row.names,
  row.lastNames,
  row.sex,
  row.age,
  row.isActive ? 'active' : 'inactive',
  ...row.emailIds,
  ...row.communicationEmailIds,
  ...row.emailDomains,
  ...row.optedOutEmailIds,
  ...row.courses.map(course => `${course.courseTitle} ${course.courseCodeId}`),
  ...row.userCourseRoles.map(role => `${role.userRoleId} ${role.courseCodeId} ${role.emailId}`)
]
  .filter(Boolean)
  .join(' ')
  .toLowerCase();

const buildContactProfileRow = (profile = {}, index = 0) => {
  const emails = toArray(profile.Emails || profile.emails).map(normalizeEmail);
  const courses = toArray(profile.CoursesHistory || profile.coursesHistory).map(normalizeCourse);
  const userCourseRoles = toArray(profile.UserCourseRoles || profile.userCourseRoles).map(normalizeUserCourseRole);
  const contactInternalId = getContactInternalId(profile);
  const optedOutEmailIds = emails
    .filter(email => email.hasOptedOutOfCommunication)
    .map(email => email.emailId)
    .filter(Boolean);
  const communicationEmailIds = emails
    .filter(email => email.isEmailParseValid && !email.hasOptedOutOfCommunication)
    .map(email => email.emailId)
    .filter(Boolean);

  const latestCourse = courses
    .slice()
    .sort((a, b) => String(b.startDate || b.creationDate || '').localeCompare(String(a.startDate || a.creationDate || '')))[0];

  const row = {
    key: contactInternalId || `contact-profile-${index}`,
    contactInternalId,
    contactExternalId: getContactExternalId(profile),
    fullName: getFullName(profile),
    names: profile?.Names || profile?.names || '',
    lastNames: profile?.LastNames || profile?.lastNames || '',
    personalCommunicationName: profile?.PersonalCommunicationName || profile?.personalCommunicationName || '',
    age: getAge(profile),
    sex: getSex(profile),
    dateOfBirth: profile?.DateOfBirth || profile?.dateOfBirth || null,
    isActive: getBooleanValue(profile?.IsActive ?? profile?.isActive, false),
    emails,
    emailIds: emails.map(email => email.emailId).filter(Boolean),
    communicationEmailIds,
    emailDomains: Array.from(new Set(emails.map(email => email.emailDomain).filter(Boolean))),
    optedOutEmailIds,
    courses,
    courseCount: courses.length,
    latestCourseTitle: latestCourse?.courseTitle || EMPTY_LABEL,
    latestCourseCodeId: latestCourse?.courseCodeId || '',
    userCourseRoles,
    rawProfile: profile
  };

  return {
    ...row,
    searchText: buildSearchText(row)
  };
};

const renderEmailTags = (emailIds = [], options = {}) => {
  const {
    color = 'blue',
    emptyText = EMPTY_LABEL,
    emptyColor = 'default'
  } = options;

  if (!emailIds.length) {
    return emptyText === EMPTY_LABEL
      ? EMPTY_LABEL
      : <Tag color={emptyColor}>{emptyText}</Tag>;
  }

  return (
    <span>
      {emailIds.map(emailId => (
        <Tag key={emailId} color={color}>{emailId}</Tag>
      ))}
    </span>
  );
};

const copyTextToClipboard = async (value, event, onCopy) => {
  event?.stopPropagation?.();
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    onCopy?.(value);
  } catch (error) {
    console.error('Unable to copy contact internal ID:', error);
  }
};

const renderCopyableInternalId = (value, onCopy, copyTitle = 'Copy internal ID') => {
  if (!value) return EMPTY_LABEL;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontFamily: 'monospace' }}>{value}</span>
      <Tooltip title={copyTitle}>
        <Button
          type="text"
          size="small"
          icon={<CopyOutlined />}
          style={{ color: '#1890ff' }}
          onClick={(event) => copyTextToClipboard(value, event, onCopy)}
        />
      </Tooltip>
    </span>
  );
};

const renderProfileExpandedDetails = (record, options = {}) => {
  const optedOutEmailSelection = options.optedOutEmailSelection || null;
  const emailRows = (record.emails || []).map(email => ({
    ...email,
    contactInternalId: record.contactInternalId,
    selectionKey: `${record.contactInternalId}|${email.emailId}`
  }));
  const emailColumns = [
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.email" />,
      dataIndex: 'emailId',
      key: 'emailId',
      render: (emailId) => emailId || EMPTY_LABEL
    },
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.emailDomain" />,
      dataIndex: 'emailDomain',
      key: 'emailDomain',
      render: (value) => value || EMPTY_LABEL
    },
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.optedOut" />,
      dataIndex: 'hasOptedOutOfCommunication',
      key: 'hasOptedOutOfCommunication',
      render: (value) => (
        <Tag color={value ? 'red' : 'green'}>
          <IntlMessage id={value ? 'admin.tools.confirmYes' : 'admin.tools.confirmNo'} />
        </Tag>
      )
    },
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.status" />,
      key: 'status',
      render: (_, email) => (
        email.hasOptedOutOfCommunication ? (
          <Tag color="red"><IntlMessage id="admin.tools.label.optedOut" /></Tag>
        ) : email.isEmailParseValid ? (
          <Tag color="green"><IntlMessage id="admin.tools.label.communicationAllowed" /></Tag>
        ) : (
          <Tag color="orange"><IntlMessage id="admin.tools.monitoring.contactProfile.invalidEmail" /></Tag>
        )
      )
    }
  ];

  const courseColumns = [
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.course" />,
      dataIndex: 'courseTitle',
      key: 'courseTitle'
    },
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.courseCodeId" />,
      dataIndex: 'courseCodeId',
      key: 'courseCodeId',
      render: (value) => value || EMPTY_LABEL
    },
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.startDate" />,
      dataIndex: 'startDate',
      key: 'startDate',
      render: formatDate
    },
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.endDate" />,
      dataIndex: 'endDate',
      key: 'endDate',
      render: formatDate
    }
  ];

  const roleColumns = [
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.role" />,
      dataIndex: 'userRoleId',
      key: 'userRoleId',
      render: (value) => value || EMPTY_LABEL
    },
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.courseCodeId" />,
      dataIndex: 'courseCodeId',
      key: 'courseCodeId',
      render: (value) => value || EMPTY_LABEL
    },
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.email" />,
      dataIndex: 'emailId',
      key: 'emailId',
      render: (value) => value || EMPTY_LABEL
    }
  ];

  return (
    <div>
      <Descriptions size="small" bordered column={{ xs: 1, md: 2 }} style={{ marginBottom: 12 }}>
        <Descriptions.Item label={<IntlMessage id="admin.tools.monitoring.contactProfile.contactInternalId" />}>
          {renderCopyableInternalId(record.contactInternalId, options.onCopyInternalId, options.copyInternalIdTitle)}
        </Descriptions.Item>
        <Descriptions.Item label={<IntlMessage id="admin.tools.monitoring.contactProfile.contactExternalId" />}>
          {record.contactExternalId || EMPTY_LABEL}
        </Descriptions.Item>
        <Descriptions.Item label={<IntlMessage id="admin.tools.monitoring.contactProfile.dateOfBirth" />}>
          {formatDate(record.dateOfBirth)}
        </Descriptions.Item>
        <Descriptions.Item label={<IntlMessage id="admin.tools.monitoring.contactProfile.communicationName" />}>
          {record.personalCommunicationName || EMPTY_LABEL}
        </Descriptions.Item>
        <Descriptions.Item label={<IntlMessage id="admin.tools.monitoring.contactProfile.latestCourse" />}>
          {record.latestCourseTitle || EMPTY_LABEL}
        </Descriptions.Item>
      </Descriptions>

      <Table
        size="small"
        pagination={false}
        columns={emailColumns}
        dataSource={emailRows}
        rowKey="selectionKey"
        rowSelection={optedOutEmailSelection}
        style={{ marginBottom: 12 }}
      />
      <Table
        size="small"
        pagination={false}
        columns={courseColumns}
        dataSource={record.courses}
        rowKey="key"
        style={{ marginBottom: 12 }}
      />
      <Table
        size="small"
        pagination={false}
        columns={roleColumns}
        dataSource={record.userCourseRoles}
        rowKey="key"
      />
    </div>
  );
};

export const buildContactProfileTableModel = (profiles = [], options = {}) => {
  const tableData = toArray(profiles)
    .map(buildContactProfileRow)
    .sort((a, b) => (
      String(a.contactInternalId || '').localeCompare(String(b.contactInternalId || '')) ||
      a.fullName.localeCompare(b.fullName)
    ));

  const columns = [
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.profile" />,
      children: [
        {
          title: <IntlMessage id="admin.tools.monitoring.contactProfile.contactInternalId" />,
          dataIndex: 'contactInternalId',
          key: 'contactInternalId',
          width: 280,
          filterSearch: true,
          filters: getUniqueFilters(tableData.map(row => row.contactInternalId)),
          onFilter: (value, record) => record.contactInternalId === value,
          sorter: (a, b) => String(a.contactInternalId || '').localeCompare(String(b.contactInternalId || '')),
          render: (value) => renderCopyableInternalId(value, options.onCopyInternalId, options.copyInternalIdTitle)
        },
        {
          title: <IntlMessage id="admin.tools.monitoring.contactProfile.fullName" />,
          dataIndex: 'fullName',
          key: 'fullName',
          width: 240,
          sorter: (a, b) => a.fullName.localeCompare(b.fullName)
        },
        {
          title: <IntlMessage id="admin.tools.monitoring.contactProfile.age" />,
          dataIndex: 'age',
          key: 'age',
          width: 90,
          sorter: (a, b) => Number(a.age || 0) - Number(b.age || 0),
          render: (age) => age ?? EMPTY_LABEL
        },
        {
          title: <IntlMessage id="admin.tools.monitoring.contactProfile.sex" />,
          dataIndex: 'sex',
          key: 'sex',
          width: 90,
          filters: getUniqueFilters(tableData.map(row => row.sex)),
          onFilter: (value, record) => record.sex === value,
          sorter: (a, b) => String(a.sex).localeCompare(String(b.sex)),
          render: (sex) => <Tag color={sex === 'F' ? 'magenta' : sex === 'M' ? 'geekblue' : 'default'}>{sex || EMPTY_LABEL}</Tag>
        },
        {
          title: <IntlMessage id="admin.tools.monitoring.contactProfile.active" />,
          dataIndex: 'isActive',
          key: 'isActive',
          width: 110,
          filters: [
            { text: 'Active', value: true },
            { text: 'Inactive', value: false }
          ],
          onFilter: (value, record) => record.isActive === value,
          sorter: (a, b) => Number(a.isActive) - Number(b.isActive),
          render: (isActive) => (
            <Tag color={isActive ? 'green' : 'red'}>
              <IntlMessage id={isActive ? 'admin.tools.label.active' : 'admin.tools.label.inactive'} />
            </Tag>
          )
        }
      ]
    },
    ...(!options.hideCommunicationColumns ? [{
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.communication" />,
      children: [
        {
          title: <IntlMessage id="admin.tools.monitoring.contactProfile.communicationEmails" />,
          dataIndex: 'communicationEmailIds',
          key: 'communicationEmailIds',
          width: 280,
          filters: [
            { text: <IntlMessage id="admin.tools.monitoring.contactProfile.hasCommunicationEmail" />, value: 'hasCommunicationEmail' },
            { text: <IntlMessage id="admin.tools.monitoring.contactProfile.noCommunicationEmail" />, value: 'noCommunicationEmail' }
          ],
          onFilter: (value, record) => (
            value === 'hasCommunicationEmail'
              ? record.communicationEmailIds.length > 0
              : record.communicationEmailIds.length === 0
          ),
          sorter: (a, b) => (a.communicationEmailIds[0] || '').localeCompare(b.communicationEmailIds[0] || ''),
          render: (emailIds) => renderEmailTags(emailIds, {
            color: 'green',
            emptyText: <IntlMessage id="admin.tools.monitoring.contactProfile.noCommunicationEmail" />,
            emptyColor: 'orange'
          })
        },
        {
          title: <IntlMessage id="admin.tools.monitoring.contactProfile.optedOutEmails" />,
          dataIndex: 'optedOutEmailIds',
          key: 'optedOutEmailIds',
          width: 280,
          filterSearch: true,
          filters: getUniqueFilters(tableData.flatMap(row => row.optedOutEmailIds)),
          onFilter: (value, record) => record.optedOutEmailIds.includes(value),
          render: (emailIds) => renderEmailTags(emailIds, {
            color: 'red',
            emptyText: <IntlMessage id="admin.tools.monitoring.contactProfile.noOptedOutEmails" />,
            emptyColor: 'green'
          })
        }
      ]
    }] : []),
    {
      title: <IntlMessage id="admin.tools.monitoring.contactProfile.courseHistory" />,
      children: [
        {
          title: <IntlMessage id="admin.tools.monitoring.contactProfile.courses" />,
          dataIndex: 'courseCount',
          key: 'courseCount',
          width: 110,
          sorter: (a, b) => a.courseCount - b.courseCount,
          render: (count) => <Tag color="purple">{count}</Tag>
        },
        {
          title: <IntlMessage id="admin.tools.monitoring.contactProfile.latestCourse" />,
          dataIndex: 'latestCourseTitle',
          key: 'latestCourseTitle',
          width: 240,
          filterSearch: true,
          filters: getUniqueFilters(tableData.map(row => row.latestCourseTitle)),
          onFilter: (value, record) => record.latestCourseTitle === value,
          sorter: (a, b) => a.latestCourseTitle.localeCompare(b.latestCourseTitle)
        }
      ]
    }
  ];

  return {
    tableData,
    columns,
    expandable: {
      rowExpandable: () => true,
      expandedRowRender: (record) => renderProfileExpandedDetails(record, options)
    }
  };
};

export const filterContactProfileTableData = (tableData = [], searchText = '') => {
  const normalizedSearchText = normalizeIdentifier(searchText);
  if (!normalizedSearchText) return tableData || [];

  return (tableData || []).filter(row => (
    row.searchText?.includes(normalizedSearchText)
  ));
};

export const buildToggleContactEmailOptOutPayload = (selectedRows = []) => {
  const payloadByKey = {};

  toArray(selectedRows).forEach((row) => {
    const contactInternalId = row?.contactInternalId;
    if (row?.emailId) {
      if (contactInternalId) {
        payloadByKey[`${contactInternalId}|${row.emailId}`] = {
          contactInternalId,
          emailId: row.emailId
        };
      }
      return;
    }

    const targetEmails = row?.optedOutEmailIds || [];

    targetEmails.forEach((emailId) => {
      if (!contactInternalId || !emailId) return;
      payloadByKey[`${contactInternalId}|${emailId}`] = {
        contactInternalId,
        emailId
      };
    });
  });

  return Object.values(payloadByKey);
};

export const buildContactEmailOptOutPayload = (contactInternalId, emailId) => (
  contactInternalId && emailId
    ? [{ contactInternalId, emailId }]
    : []
);

export const buildToggleContactActivePayload = (selectedRows = []) => {
  const payloadByContactId = {};

  toArray(selectedRows).forEach((row) => {
    const contactInternalId = row?.contactInternalId;
    if (!contactInternalId) return;
    payloadByContactId[contactInternalId] = { contactInternalId };
  });

  return Object.values(payloadByContactId);
};

export const buildContactActivePayload = (contactInternalId) => (
  contactInternalId
    ? [{ contactInternalId }]
    : []
);

const ContactProfilesMonitoring = {
  buildContactProfileTableModel,
  filterContactProfileTableData,
  buildToggleContactEmailOptOutPayload,
  buildContactEmailOptOutPayload,
  buildToggleContactActivePayload,
  buildContactActivePayload
};

export default ContactProfilesMonitoring;
