import React from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

export const LOG_SOURCE_CONFIGS = [
  {
    key: 'api',
    endpointName: 'GetApiLogEvents',
    localeKey: 'admin.tools.monitoring.processLogs.tab.api',
    category: 'Api'
  },
  {
    key: 'shop',
    endpointName: 'GetShopLogEvents',
    localeKey: 'admin.tools.monitoring.processLogs.tab.shop',
    category: 'Shop'
  },
  {
    key: 'enrollment',
    endpointName: 'GetEnrollmentLogEvents',
    localeKey: 'admin.tools.monitoring.processLogs.tab.enrollment',
    category: 'Enrollment'
  },
  {
    key: 'lrn',
    endpointName: 'GetLrnLogEvents',
    localeKey: 'admin.tools.monitoring.processLogs.tab.lrn',
    category: 'Lrn'
  },
  {
    key: 'missive',
    endpointName: 'GetMissiveLogEvents',
    localeKey: 'admin.tools.monitoring.processLogs.tab.missive',
    category: 'Missive'
  },
  {
    key: 'impersonation',
    endpointName: 'GetImpersonationLogEvents',
    localeKey: 'admin.tools.monitoring.processLogs.tab.impersonation',
    category: 'Impersonation'
  },
  {
    key: 'general',
    endpointName: 'GetGeneralLogEvents',
    localeKey: 'admin.tools.monitoring.processLogs.tab.general',
    category: 'General'
  }
];

export const PROCESS_LOG_SEVERITY_OPTIONS = [
  { value: 'all', labelKey: 'admin.tools.monitoring.processLogs.severity.all' },
  { value: 'debug', labelKey: 'admin.tools.monitoring.processLogs.severity.debug' },
  { value: 'info', labelKey: 'admin.tools.monitoring.processLogs.severity.info' },
  { value: 'warning', labelKey: 'admin.tools.monitoring.processLogs.severity.warning' },
  { value: 'error', labelKey: 'admin.tools.monitoring.processLogs.severity.error' },
  { value: 'critical', labelKey: 'admin.tools.monitoring.processLogs.severity.critical' }
];

export const PROCESS_LOG_LIMIT_OPTIONS = [25, 50, 100, 250].map(value => ({
  value,
  label: String(value)
}));

const EMPTY_LABEL = '-';

export const getLogSourceConfig = (sourceKey = 'api') => (
  LOG_SOURCE_CONFIGS.find(source => source.key === sourceKey) || LOG_SOURCE_CONFIGS[0]
);

const toIsoString = (value) => {
  if (!value) return null;
  if (typeof value?.toISOString === 'function') return value.toISOString();
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
};

export const buildProcessLogPayload = (filters = {}) => {
  const dateRange = filters.dateRange || [];
  const severity = filters.severity && filters.severity !== 'all'
    ? filters.severity
    : null;

  const payload = {
    p_severity: severity,
    p_methodname: filters.methodSearchText?.trim() || null,
    p_createdbyuser: filters.userSearchText?.trim() || null,
    p_createdbyrole: filters.role && filters.role !== 'all' ? filters.role : null,
    p_search: filters.searchText?.trim() || null,
    p_startdate: toIsoString(dateRange?.[0]),
    p_enddate: toIsoString(dateRange?.[1]),
    p_limit: Number(filters.limit || 100),
    p_offset: Number(filters.offset || 0)
  };

  return Object.entries(payload).reduce((accumulator, [key, value]) => {
    if (value === null || value === undefined || value === '') return accumulator;
    accumulator[key] = value;
    return accumulator;
  }, {});
};

const getValue = (row, ...keys) => {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null) return row[key];
  }
  return null;
};

const normalizeSeverity = (severity) => (
  severity ? String(severity).trim().toLowerCase() : ''
);

export const getSeverityColor = (severity) => {
  const normalized = normalizeSeverity(severity);
  if (['critical', 'fatal'].includes(normalized)) return 'magenta';
  if (['error', 'err'].includes(normalized)) return 'red';
  if (['warning', 'warn'].includes(normalized)) return 'orange';
  if (normalized === 'debug') return 'purple';
  if (normalized === 'info') return 'blue';
  return 'default';
};

export const formatLogDateTime = (value) => {
  if (!value) return EMPTY_LABEL;
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return EMPTY_LABEL;
  const iso = date.toISOString();
  return `${iso.substring(0, 10)} ${iso.substring(11, 19)} UTC`;
};

export const normalizeEventData = (eventData) => {
  if (!eventData) return null;
  if (typeof eventData === 'object') return eventData;

  try {
    return JSON.parse(eventData);
  } catch (error) {
    return eventData;
  }
};

export const stringifyEventData = (eventData) => {
  const normalized = normalizeEventData(eventData);
  if (normalized == null || normalized === '') return EMPTY_LABEL;
  if (typeof normalized === 'string') return normalized;
  return JSON.stringify(normalized, null, 2);
};

export const getEventDataJson = (eventData) => {
  const normalized = normalizeEventData(eventData);
  if (normalized == null || normalized === '') return {};
  if (typeof normalized === 'object') return normalized;
  return { value: normalized };
};

export const normalizeLogRow = (row = {}, index = 0, sourceKey = 'api') => {
  const appLogEventId = getValue(row, 'AppLogEventId', 'appLogEventId', 'app_log_event_id') || `${sourceKey}-${index}`;
  const severity = getValue(row, 'Severity', 'severity') || '';
  const message = getValue(row, 'Message', 'message') || '';
  const methodName = getValue(row, 'MethodName', 'methodName', 'method_name') || '';
  const createdByUser = getValue(row, 'CreatedByUser', 'createdByUser', 'created_by_user') || '';
  const createdByRole = getValue(row, 'CreatedByRole', 'createdByRole', 'created_by_role') || '';
  const logCategory = getValue(row, 'LogCategory', 'logCategory', 'log_category') || getLogSourceConfig(sourceKey).category;
  const createdAt = getValue(row, 'CreatedAt', 'createdAt', 'created_at') || null;
  const eventData = getValue(row, 'EventData', 'eventData', 'event_data');

  return {
    ...row,
    key: `${sourceKey}-${appLogEventId}-${index}`,
    appLogEventId,
    sourceKey,
    logCategory,
    severity,
    severityNormalized: normalizeSeverity(severity),
    message,
    methodName,
    createdByUser,
    createdByRole,
    createdAt,
    createdAtLabel: formatLogDateTime(createdAt),
    eventData,
    eventDataJson: getEventDataJson(eventData),
    eventDataText: stringifyEventData(eventData),
    searchText: [
      appLogEventId,
      logCategory,
      severity,
      message,
      methodName,
      createdByUser,
      createdByRole,
      stringifyEventData(eventData)
    ].filter(Boolean).join(' ').toLowerCase()
  };
};

export const normalizeLogRows = (rows = [], sourceKey = 'api') => (
  (Array.isArray(rows) ? rows : []).map((row, index) => normalizeLogRow(row, index, sourceKey))
);

export const getUniqueFilterOptions = (rows = [], fieldName) => (
  Array.from(new Set(
    (rows || [])
      .map(row => row?.[fieldName])
      .filter(value => value !== undefined && value !== null && value !== '')
  ))
    .sort((a, b) => String(a).localeCompare(String(b)))
    .map(value => ({ value, label: String(value) }))
);

export const filterLogRows = (rows = [], filters = {}) => {
  const globalSearch = filters.searchText?.trim().toLowerCase();
  const severity = filters.severity && filters.severity !== 'all' ? filters.severity : null;
  const methodSearch = filters.methodSearchText?.trim().toLowerCase();
  const userSearch = filters.userSearchText?.trim().toLowerCase();
  const role = filters.role && filters.role !== 'all' ? filters.role : null;

  return (rows || []).filter((row) => {
    if (globalSearch && !String(row.searchText || '').includes(globalSearch)) return false;
    if (severity && row.severityNormalized !== severity) return false;
    if (methodSearch && !String(row.methodName || '').toLowerCase().includes(methodSearch)) return false;
    if (userSearch && !String(row.createdByUser || '').toLowerCase().includes(userSearch)) return false;
    if (role && row.createdByRole !== role) return false;
    return true;
  });
};

export const buildLogTableColumns = ({
  t,
  copyTitle,
  onCopyEventData
} = {}) => [
  {
    title: t('admin.tools.monitoring.processLogs.column.severity'),
    dataIndex: 'severity',
    key: 'severity',
    width: 130,
    filters: PROCESS_LOG_SEVERITY_OPTIONS
      .filter(option => option.value !== 'all')
      .map(option => ({ text: option.labelKey ? t(option.labelKey) : option.value, value: option.value })),
    onFilter: (value, record) => record.severityNormalized === value,
    render: severity => (
      <Tag color={getSeverityColor(severity)} style={{ marginRight: 0 }}>
        {severity || EMPTY_LABEL}
      </Tag>
    )
  },
  {
    title: t('admin.tools.monitoring.processLogs.column.message'),
    dataIndex: 'message',
    key: 'message',
    ellipsis: true,
    render: message => message || EMPTY_LABEL
  },
  {
    title: t('admin.tools.monitoring.processLogs.column.methodName'),
    dataIndex: 'methodName',
    key: 'methodName',
    ellipsis: true,
    render: methodName => methodName || EMPTY_LABEL
  },
  {
    title: t('admin.tools.monitoring.processLogs.column.createdByUser'),
    dataIndex: 'createdByUser',
    key: 'createdByUser',
    ellipsis: true,
    render: createdByUser => createdByUser || EMPTY_LABEL
  },
  {
    title: t('admin.tools.monitoring.processLogs.column.createdByRole'),
    dataIndex: 'createdByRole',
    key: 'createdByRole',
    width: 180,
    render: role => role ? <Tag color="geekblue">{role}</Tag> : EMPTY_LABEL
  },
  {
    title: t('admin.tools.monitoring.processLogs.column.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 190,
    sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    defaultSortOrder: 'descend',
    render: (_, record) => record.createdAtLabel
  },
  {
    title: t('admin.tools.monitoring.processLogs.column.eventData'),
    dataIndex: 'eventDataText',
    key: 'eventDataText',
    width: 96,
    render: (eventDataText, record) => (
      eventDataText && eventDataText !== EMPTY_LABEL ? (
        <Tooltip title={copyTitle}>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => onCopyEventData?.(record)}
          />
        </Tooltip>
      ) : EMPTY_LABEL
    )
  }
];

const ProcessLogs = {
  LOG_SOURCE_CONFIGS,
  PROCESS_LOG_SEVERITY_OPTIONS,
  PROCESS_LOG_LIMIT_OPTIONS,
  getLogSourceConfig,
  buildProcessLogPayload,
  normalizeLogRows,
  filterLogRows,
  getUniqueFilterOptions,
  buildLogTableColumns,
  stringifyEventData,
  getSeverityColor,
  formatLogDateTime
};

export default ProcessLogs;
