import React from "react";
import { Avatar, Button, Image, Table, Tag, Tooltip } from "antd";
import { CopyOutlined, DollarCircleOutlined, UserOutlined } from "@ant-design/icons";
import Flag from "react-world-flags";
import IntlMessage from "components/util-components/IntlMessage";

const EMPTY_TABLE_MODEL = {
  tableData: [],
  columns: [],
  expandable: null,
  purchaseDates: []
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.records)) return value.records;
  if (Array.isArray(value?.Records)) return value.Records;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.Items)) return value.Items;
  return [];
};

const getValue = (item = {}, keys = []) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) return item[key];
  }
  return null;
};

const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const normalizeCurrencyCode = (currency) => {
  const code = String(currency || 'USD').trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : 'USD';
};

const formatCurrency = (value, currency = 'USD') => (
  toNumber(value).toLocaleString('en-US', {
    style: 'currency',
    currency: normalizeCurrencyCode(currency),
    maximumFractionDigits: 2
  })
);

const formatPercent = (value) => {
  const numericValue = toNumber(value);
  const percentValue = numericValue <= 1 && numericValue !== 0 ? numericValue * 100 : numericValue;
  return `${percentValue.toFixed(percentValue % 1 === 0 ? 0 : 1)}%`;
};

const formatNumber = (value) => (
  toNumber(value).toLocaleString('en-US')
);

const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (['true', 'yes', '1'].includes(normalizedValue)) return true;
    if (['false', 'no', '0'].includes(normalizedValue)) return false;
  }
  return Boolean(value);
};

const humanizeKey = (key = '') => (
  String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
);

const normalizeKey = (key = '') => String(key).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const renderLocalizedText = (id, defaultMessage) => (
  <IntlMessage id={id} defaultMessage={defaultMessage} />
);

const revenueColumnTitles = {
  paymentproviderpriceid: ['shop.analytics.table.column.paymentProviderPriceId', 'Payment Provider Price Id'],
  paymentproviderproductid: ['shop.analytics.table.column.paymentProviderProductId', 'Payment Provider Product Id'],
  paymentprovidersessionid: ['shop.analytics.table.column.paymentProviderSessionId', 'Payment Provider Session Id'],
  tierid: ['shop.analytics.table.column.tier', 'Tier'],
  tierlocalizationkey: ['shop.analytics.table.column.tier', 'Tier'],
  isproductactive: ['shop.analytics.table.column.active', 'Active'],
  isactive: ['shop.analytics.table.column.active', 'Active'],
  totalrevenue: ['shop.analytics.table.column.totalRevenue', 'Total Revenue'],
  purchaserevenue: ['shop.analytics.table.column.purchaseRevenue', 'Purchase Revenue'],
  revenue: ['shop.analytics.table.column.revenue', 'Revenue'],
  amount: ['shop.analytics.table.column.amount', 'Amount'],
  currency: ['shop.analytics.table.column.currency', 'Currency'],
  refundedamount: ['shop.analytics.table.column.refundedAmount', 'Refunded Amount'],
  purchasecount: ['shop.analytics.table.column.purchases', 'Purchases'],
  totalpurchases: ['shop.analytics.table.column.purchases', 'Purchases'],
  uniquecustomers: ['shop.analytics.table.column.buyers', 'Buyers'],
  customercount: ['shop.analytics.table.column.buyers', 'Buyers'],
  averageorder: ['shop.analytics.table.column.averageOrder', 'Average Order'],
  averageordervalue: ['shop.analytics.table.column.averageOrder', 'Average Order'],
  lifetimevalue: ['shop.analytics.table.column.lifetimeRevenue', 'Lifetime Revenue'],
  lifetimerevenue: ['shop.analytics.table.column.lifetimeRevenue', 'Lifetime Revenue'],
  firstpurchase: ['shop.analytics.table.column.firstPurchase', 'First Purchase'],
  firstpurchasedate: ['shop.analytics.table.column.firstPurchase', 'First Purchase'],
  lastpurchase: ['shop.analytics.table.column.lastPurchase', 'Last Purchase'],
  lastpurchasedate: ['shop.analytics.table.column.lastPurchase', 'Last Purchase'],
  coursecodeid: ['shop.analytics.table.column.courseCodeId', 'Course Code Id'],
  coursename: ['shop.analytics.table.column.courseName', 'Course Name'],
  customername: ['shop.analytics.table.column.name', 'Name'],
  fullname: ['shop.analytics.table.column.fullName', 'Full Name'],
  emailid: ['shop.analytics.table.column.primaryEmail', 'Primary Email'],
  primaryemail: ['shop.analytics.table.column.primaryEmail', 'Primary Email'],
  contactinternalid: ['shop.analytics.table.column.internalId', 'Internal Id'],
  purchaseid: ['shop.analytics.table.column.purchaseId', 'Purchase Id'],
  transactiondate: ['shop.analytics.table.column.date', 'Date'],
  createdat: ['shop.analytics.table.column.date', 'Date'],
  wasrefunded: ['shop.analytics.table.column.status', 'Status']
};

const getColumnTitle = (key = '') => {
  const normalizedKey = normalizeKey(key);
  const titleConfig = revenueColumnTitles[normalizedKey];
  return titleConfig
    ? renderLocalizedText(titleConfig[0], titleConfig[1])
    : humanizeKey(key);
};

const localizedColumnTitle = (idSuffix, defaultMessage) => (
  renderLocalizedText(`shop.analytics.table.column.${idSuffix}`, defaultMessage)
);

const isMeaningfulDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.getUTCFullYear() > 1901;
};

const formatDate = (value) => {
  if (!isMeaningfulDate(value)) return '-';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

const toDateTimestamp = (value) => (
  isMeaningfulDate(value) ? new Date(value).getTime() : 0
);

const parseMaybeJson = (value) => {
  if (typeof value !== 'string') return value;

  const trimmedValue = value.trim();
  if (!trimmedValue || !['{', '['].includes(trimmedValue[0])) return value;

  try {
    return JSON.parse(trimmedValue);
  } catch (_error) {
    return value;
  }
};

const toOneOrMany = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
};

const extractEmailMatches = (value) => (
  String(value || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []
);

const normalizeTagValue = (item) => {
  const parsedItem = parseMaybeJson(item);
  if (parsedItem == null) return null;
  if (typeof parsedItem === 'object') {
    const nestedValue = getValue(parsedItem, [
      'EmailId',
      'emailId',
      'Email',
      'email',
      'TierId',
      'tierId',
      'Id',
      'id',
      'LanguageLevelAbbreviation',
      'languageLevelAbbreviation',
      'Value',
      'value',
      'Label',
      'label',
      'name',
      'Name'
    ]);
    return nestedValue && typeof nestedValue !== 'object'
      ? String(nestedValue)
      : null;
  }
  return String(parsedItem);
};

const normalizeTagListItems = (items = []) => (
  Array.from(new Set(
    toOneOrMany(parseMaybeJson(items)).flatMap((item) => {
      const parsedItem = parseMaybeJson(item);
      if (Array.isArray(parsedItem)) return normalizeTagListItems(parsedItem);
      if (typeof parsedItem === 'string') {
        const emailMatches = extractEmailMatches(parsedItem);
        if (emailMatches.length > 0) return emailMatches;
      }

      const normalizedValue = normalizeTagValue(parsedItem);
      return normalizedValue ? [normalizedValue] : [];
    })
  ))
);

const normalizeEmailList = (...sources) => (
  Array.from(new Set(
    sources.flatMap(source => normalizeTagListItems(source).filter(value => (
      extractEmailMatches(value).length > 0
    )))
  ))
);

const normalizeTierId = (tierId) => {
  const parsedTier = parseMaybeJson(tierId);
  const tier = typeof parsedTier === 'object'
    ? getValue(parsedTier, ['TierId', 'tierId', 'Tier', 'tier', 'Id', 'id', 'Value', 'value', 'Label', 'label', 'Name', 'name', 'Text', 'text'])
    : parsedTier;

  return tier ? String(tier) : 'Free';
};

const normalizeTierLocalizationKey = (localizationKey) => {
  const parsedLocalizationKey = parseMaybeJson(localizationKey);
  const value = typeof parsedLocalizationKey === 'object'
    ? getValue(parsedLocalizationKey, [
      'TierLocalizationKey',
      'tierLocalizationKey',
      'LocalizationKey',
      'localizationKey'
    ])
    : parsedLocalizationKey;

  return typeof value === 'string' && value.trim() ? value : null;
};

const renderTagList = (items = [], color = 'geekblue') => {
  const tagItems = normalizeTagListItems(items);

  return (
    <>
      {tagItems.length > 0
        ? tagItems.map(item => <Tag color={color} key={item}>{item}</Tag>)
        : <Tag>None</Tag>}
    </>
  );
};

const getTierColor = (tierId) => {
  const tier = normalizeTierId(tierId).toLowerCase();
  if (tier === 'gold') return 'gold';
  if (tier === 'silver') return 'default';
  if (tier === 'free') return 'blue';
  return 'purple';
};

const renderTierTag = (tierId, localizationKey = null) => {
  const tier = normalizeTierId(tierId);
  const safeLocalizationKey = normalizeTierLocalizationKey(localizationKey);
  return (
    <Tag color={getTierColor(tier)}>
      {safeLocalizationKey ? <IntlMessage id={safeLocalizationKey} /> : tier}
    </Tag>
  );
};

const renderBooleanTag = (value) => {
  const boolValue = toBoolean(value);
  return <Tag color={boolValue ? 'green' : 'red'}>{boolValue ? 'True' : 'False'}</Tag>;
};

const renderNumberTag = (value, color = 'blue') => (
  <Tag color={color}>{formatNumber(value)}</Tag>
);

const renderCurrencyTag = (value, currency = 'USD', color = 'green') => (
  <Tag color={color}>{formatCurrency(value, currency)}</Tag>
);

const renderCurrencyCodeTag = (currency = 'USD') => (
  <Tag color="blue" icon={<DollarCircleOutlined />}>
    {normalizeCurrencyCode(currency)}
  </Tag>
);

const renderCopyableText = (value, tooltip = 'Copy') => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: '100%', whiteSpace: 'normal' }}>
    <span style={{ minWidth: 0, whiteSpace: 'normal', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
      {value || '-'}
    </span>
    {value ? (
      <Tooltip title={tooltip}>
        <Button
          type="link"
          size="small"
          icon={<CopyOutlined style={{ color: '#1890ff' }} />}
          style={{ flex: '0 0 auto', paddingInline: 2 }}
          onClick={(event) => {
            event.stopPropagation();
            copyText(value);
          }}
        />
      </Tooltip>
    ) : null}
  </span>
);

const renderLocalizationKey = (value) => {
  if (!value) return '-';
  return (
    <Tooltip title={value}>
      <Tag color="cyan"><IntlMessage id={value} /></Tag>
    </Tooltip>
  );
};

const renderAvatarCell = (avatarUrl) => (
  avatarUrl
    ? (
      <Image
        src={avatarUrl}
        width={40}
        height={40}
        style={{ borderRadius: '50%', objectFit: 'cover' }}
        preview
      />
    )
    : <Avatar icon={<UserOutlined />} />
);

const proficiencyMaps = {
  be: ['purple', 'Beginner'],
  ba: ['yellow', 'Basic'],
  in: ['orange', 'Intermediate'],
  ad: ['green', 'Advanced'],
  na: ['blue', 'Native']
};

const normalizeLanguageLevel = (langLevel) => {
  const parsedLevel = parseMaybeJson(langLevel);
  const value = typeof parsedLevel === 'object'
    ? getValue(parsedLevel, [
      'LanguageLevelAbbreviation',
      'languageLevelAbbreviation',
      'Level',
      'level',
      'Value',
      'value',
      'Label',
      'label'
    ])
    : parsedLevel;

  return typeof value === 'string' ? value.toLowerCase() : '';
};

const renderProficiencyTag = (langLevel) => {
  const safeLangLevel = normalizeLanguageLevel(langLevel);
  const [color, label] = proficiencyMaps[safeLangLevel] || ['default', 'Unknown'];
  return <Tag color={color}>{label}</Tag>;
};

const getCurrentLanguageLevel = (item = {}) => {
  const proficiencyHistory = toArray(item?.LanguageProficienciesHistory);
  const activeLevel = proficiencyHistory.find(entry => entry?.EndDate === null);
  const latestLevel = [...proficiencyHistory]
    .sort((left, right) => toDateTimestamp(right?.StartDate) - toDateTimestamp(left?.StartDate))[0];

  return activeLevel?.LanguageLevelAbbreviation || latestLevel?.LanguageLevelAbbreviation || null;
};

const copyText = (value) => {
  if (!value || !navigator?.clipboard) return;
  navigator.clipboard.writeText(String(value));
};

const normalizeCellValue = (value) => {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(normalizeCellValue).filter(Boolean).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};

const normalizeTableRows = (rows = []) => (
  toArray(rows).map((row, index) => {
    const normalizedRow = Object.entries(row || {}).reduce((accumulator, [key, value]) => ({
      ...accumulator,
      [key]: normalizeCellValue(value)
    }), {});

    return {
      key: getValue(row, ['PaymentProviderSessionId', 'PurchaseId', 'ShopPurchaseId', 'paymentProviderSessionId', 'purchaseId']) || index,
      ...normalizedRow
    };
  })
);

const getRevenueTableColumnPriority = (key = '') => {
  const normalizedKey = normalizeKey(key);
  const priorities = {
    paymentproviderpriceid: 1,
    paymentproviderproductid: 2,
    paymentprovidersessionid: 3,
    tierid: 10,
    tierlocalizationkey: 11,
    isproductactive: 20,
    totalrevenue: 30,
    purchaserevenue: 31,
    revenue: 32,
    amount: 33,
    purchasecount: 40,
    totalpurchases: 41,
    uniquecustomers: 42,
    customercount: 43,
    coursename: 900,
    coursecodeid: 901
  };

  return priorities[normalizedKey] || 500;
};

const isCopyableProviderKey = (key = '') => {
  const normalizedKey = normalizeKey(key);
  return [
    'paymentproviderpriceid',
    'paymentproviderproductid',
    'paymentprovidersessionid'
  ].includes(normalizedKey);
};

const isTierKey = (key = '') => normalizeKey(key) === 'tierid';
const isTierLocalizationKey = (key = '') => normalizeKey(key) === 'tierlocalizationkey';
const isProductActiveKey = (key = '') => ['isproductactive', 'isactive'].includes(normalizeKey(key));
const isCourseCodeKey = (key = '') => normalizeKey(key) === 'coursecodeid';
const isCurrencyKey = (key = '') => {
  const normalizedKey = normalizeKey(key);
  return normalizedKey.includes('revenue') ||
    normalizedKey.includes('amount') ||
    normalizedKey.includes('refunded');
};
const isCountKey = (key = '') => {
  const normalizedKey = normalizeKey(key);
  return normalizedKey.includes('count') ||
    normalizedKey.includes('totalpurchases') ||
    normalizedKey.includes('uniquecustomers');
};

const getDynamicColumnWidth = (key = '') => {
  const normalizedKey = normalizeKey(key);
  if (isCopyableProviderKey(key)) return 320;
  if (isCourseCodeKey(key)) return 260;
  if (normalizedKey === 'coursename') return 220;
  if (isTierLocalizationKey(key)) return 180;
  if (isTierKey(key) || isProductActiveKey(key) || isCurrencyKey(key) || isCountKey(key)) return 130;
  return 180;
};

const renderDynamicCell = (key, value, record = {}) => {
  if (isCopyableProviderKey(key) || isCourseCodeKey(key)) return renderCopyableText(value);
  if (isTierKey(key)) return renderTierTag(value, getValue(record, ['TierLocalizationKey', 'tierLocalizationKey']));
  if (isTierLocalizationKey(key)) return renderLocalizationKey(value);
  if (isProductActiveKey(key)) return renderBooleanTag(value);
  if (isCurrencyKey(key)) {
    const currencyColor = normalizeKey(key).includes('refund') ? 'red' : 'green';
    return renderCurrencyTag(value, record?.Currency || record?.currency || 'USD', currencyColor);
  }
  if (isCountKey(key)) return renderNumberTag(value);

  return value || '-';
};

const buildDynamicFilterOptions = (rows = [], key) => (
  Array.from(new Set(rows.map(row => row?.[key]).filter(value => value !== undefined && value !== null && value !== '')))
    .slice(0, 100)
    .map(value => {
      const sampleRecord = rows.find(row => row?.[key] === value) || {};
      return {
        text: renderDynamicCell(key, value, sampleRecord),
        value
      };
    })
);

const buildDynamicColumns = (rows = []) => {
  const keys = Array.from(new Set(
    rows.flatMap(row => Object.keys(row || {}).filter(key => key !== 'key' && !isTierLocalizationKey(key)))
  )).sort((left, right) => {
    const priorityDelta = getRevenueTableColumnPriority(left) - getRevenueTableColumnPriority(right);
    return priorityDelta || humanizeKey(left).localeCompare(humanizeKey(right));
  });

  return keys.map((key) => ({
    title: getColumnTitle(key),
    dataIndex: key,
    key,
    ellipsis: !(isCopyableProviderKey(key) || isCourseCodeKey(key)),
    width: getDynamicColumnWidth(key),
    filterSearch: true,
    filters: buildDynamicFilterOptions(rows, key),
    onFilter: (value, record) => String(record?.[key] ?? '') === String(value),
    sorter: (a, b) => {
      const left = a?.[key];
      const right = b?.[key];
      const leftNumber = Number(left);
      const rightNumber = Number(right);
      if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber;
      return String(left ?? '').localeCompare(String(right ?? ''));
    },
    render: (value, record) => renderDynamicCell(key, value, record)
  }));
};

const buildTableModel = (rows = []) => {
  const tableData = normalizeTableRows(rows);

  if (tableData.length === 0) return EMPTY_TABLE_MODEL;

  return {
    tableData,
    columns: buildDynamicColumns(tableData),
    expandable: null
  };
};

const buildFilterOptions = (rows = [], key, renderText = value => String(value)) => (
  Array.from(new Set(rows.map(row => row?.[key]).filter(value => value !== undefined && value !== null && value !== '')))
    .map(value => ({
      text: renderText(value),
      value
    }))
);

const buildArrayFilterOptions = (rows = [], key) => (
  Array.from(new Set(rows.flatMap(row => normalizeTagListItems(row?.[key]))))
    .map(value => ({
      text: value,
      value
    }))
);

const getActiveTierForCourse = (item = {}, courseCodeId) => {
  const courseId = item?.CourseCodeId || courseCodeId;
  const courseTier = (item?.ContactCourseTiers || []).find(tier => (
    tier?.CourseCodeId === courseId && tier?.TierId
  ));
  const fallbackTier = (item?.ContactCourseTiers || []).find(tier => tier?.TierId);
  return normalizeTierId(courseTier?.TierId || fallbackTier?.TierId || 'Free');
};

const getPurchasesForCourse = (item = {}, courseCodeId) => {
  const purchases = toArray(item?.PurchasesHistory || item?.PurchaseHistory || item?.Purchases);
  const courseId = item?.CourseCodeId || courseCodeId;
  const coursePurchases = courseId
    ? purchases.filter(purchase => purchase?.CourseCodeId === courseId)
    : purchases;

  return coursePurchases.length > 0 ? coursePurchases : purchases;
};

const normalizePurchaseHistoryRows = (purchases = []) => (
  purchases.map((purchase, index) => {
    const amount = toNumber(purchase?.Amount);
    const currency = normalizeCurrencyCode(purchase?.Currency);
    const wasRefunded = Boolean(purchase?.WasRefunded);

    return {
      key: purchase?.PurchaseId || index,
      purchaseId: purchase?.PurchaseId || '-',
      transactionDate: purchase?.TransactionDate,
      transactionDateLabel: formatDate(purchase?.TransactionDate),
      transactionTimestamp: toDateTimestamp(purchase?.TransactionDate),
      courseName: purchase?.CourseName || '-',
      courseCodeId: purchase?.CourseCodeId || '-',
      tierId: normalizeTierId(purchase?.TierId || 'Free'),
      amount,
      currency,
      amountLabel: formatCurrency(amount, currency),
      wasRefunded
    };
  })
);

const buildShopPurchaserRow = (item = {}, index, options = {}) => {
  const purchasesHistory = normalizePurchaseHistoryRows(getPurchasesForCourse(item, options.courseCodeId));
  const nonRefundedPurchases = purchasesHistory.filter(purchase => !purchase.wasRefunded);
  const refundedPurchases = purchasesHistory.filter(purchase => purchase.wasRefunded);
  const validPurchasesByDate = purchasesHistory
    .filter(purchase => purchase.transactionTimestamp > 0)
    .sort((left, right) => right.transactionTimestamp - left.transactionTimestamp);
  const currency = nonRefundedPurchases[0]?.currency || purchasesHistory[0]?.currency || 'USD';
  const purchaseTotal = nonRefundedPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const refundedTotal = refundedPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const emails = (item?.Emails || [])
    .filter(email => email?.IsEmailParseValid !== false)
    .map(email => email?.EmailId)
    .filter(Boolean);
  const countryOfResidency = item?.Location?.ResidencyLocation?.CountryOfResidency || null;
  const countryOfBirth = item?.Location?.BirthLocation?.CountryOfBirth || null;
  const tierId = getActiveTierForCourse(item, options.courseCodeId);
  const langLevel = getCurrentLanguageLevel(item);

  return {
    key: item?.ContactInternalId || index,
    contactInternalId: item?.ContactInternalId,
    avatarUrl: null,
    langLevel,
    fullName: item?.FullName || [item?.Names, item?.LastNames].filter(Boolean).join(' '),
    age: item?.Age,
    sex: item?.Sex,
    emails,
    countryOfResidency,
    regionOfResidency: item?.Location?.ResidencyLocation?.CountryDivisionResidencyName,
    countryOfBirth,
    regionOfBirth: item?.Location?.BirthLocation?.CountryDivisionBirthName,
    tierId,
    purchaseCount: purchasesHistory.length,
    purchaseTotal,
    purchaseTotalLabel: formatCurrency(purchaseTotal, currency),
    refundedCount: refundedPurchases.length,
    refundedTotal,
    refundedTotalLabel: formatCurrency(refundedTotal, currency),
    lastPurchaseDate: validPurchasesByDate[0]?.transactionDate || null,
    lastPurchaseDateLabel: validPurchasesByDate[0]?.transactionDateLabel || '-',
    lastPurchaseTimestamp: validPurchasesByDate[0]?.transactionTimestamp || 0,
    purchasesHistory,
    searchText: [
      item?.ContactInternalId,
      item?.FullName,
      langLevel,
      item?.Age,
      item?.Sex,
      tierId,
      emails.join(' '),
      countryOfResidency,
      countryOfBirth,
      purchasesHistory.map(purchase => `${purchase.purchaseId} ${purchase.courseName} ${purchase.courseCodeId} ${purchase.amountLabel}`).join(' ')
    ].filter(Boolean).join(' ')
  };
};

const getLocationColumns = (locationType, rows) => ([
  ...(locationType === 'all' || locationType === 'residency' ? [
    {
      title: localizedColumnTitle('residency', 'Residency'),
      children: [
        {
          title: localizedColumnTitle('country', 'Country'),
          width: 130,
          dataIndex: 'countryOfResidency',
          filters: buildFilterOptions(rows, 'countryOfResidency'),
          onFilter: (value, record) => record.countryOfResidency === value,
          sorter: (a, b) => String(a.countryOfResidency || '').localeCompare(String(b.countryOfResidency || '')),
          render: countryCode => countryCode ? <Flag code={countryCode} style={{ width: 35 }} /> : '-'
        },
        {
          title: localizedColumnTitle('region', 'Region'),
          width: 160,
          dataIndex: 'regionOfResidency',
          filterSearch: true,
          filters: buildFilterOptions(rows, 'regionOfResidency'),
          onFilter: (value, record) => record.regionOfResidency === value,
          sorter: (a, b) => String(a.regionOfResidency || '').localeCompare(String(b.regionOfResidency || ''))
        }
      ]
    }
  ] : []),
  ...(locationType === 'all' || locationType === 'birth' ? [
    {
      title: localizedColumnTitle('birth', 'Birth'),
      children: [
        {
          title: localizedColumnTitle('country', 'Country'),
          width: 130,
          dataIndex: 'countryOfBirth',
          filters: buildFilterOptions(rows, 'countryOfBirth'),
          onFilter: (value, record) => record.countryOfBirth === value,
          sorter: (a, b) => String(a.countryOfBirth || '').localeCompare(String(b.countryOfBirth || '')),
          render: countryCode => countryCode ? <Flag code={countryCode} style={{ width: 35 }} /> : '-'
        },
        {
          title: localizedColumnTitle('region', 'Region'),
          width: 160,
          dataIndex: 'regionOfBirth',
          filterSearch: true,
          filters: buildFilterOptions(rows, 'regionOfBirth'),
          onFilter: (value, record) => record.regionOfBirth === value,
          sorter: (a, b) => String(a.regionOfBirth || '').localeCompare(String(b.regionOfBirth || ''))
        }
      ]
    }
  ] : [])
]);

const getShopPurchaserColumns = (rows = [], locationType = 'all') => ([
  {
    title: localizedColumnTitle('profile', 'Profile'),
    children: [
      {
        title: localizedColumnTitle('level', 'Level'),
        dataIndex: 'langLevel',
        width: 130,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'langLevel', renderProficiencyTag),
        onFilter: (value, record) => record.langLevel === value,
        sorter: (a, b) => String(a.langLevel || '').localeCompare(String(b.langLevel || '')),
        render: renderProficiencyTag
      },
      {
        title: localizedColumnTitle('photo', 'Photo'),
        dataIndex: 'avatarUrl',
        width: 90,
        align: 'center',
        render: renderAvatarCell
      },
      {
        title: localizedColumnTitle('internalId', 'Internal Id'),
        dataIndex: 'contactInternalId',
        width: 300,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'contactInternalId'),
        onFilter: (value, record) => record.contactInternalId === value,
        sorter: (a, b) => String(a.contactInternalId || '').localeCompare(String(b.contactInternalId || '')),
        render: (contactInternalId) => (
          <span>
            {contactInternalId || '-'}
            {contactInternalId ? (
              <Tooltip title="Copy internal id">
                <Button
                  type="link"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={(event) => {
                    event.stopPropagation();
                    copyText(contactInternalId);
                  }}
                />
              </Tooltip>
            ) : null}
          </span>
        )
      },
      {
        title: localizedColumnTitle('fullName', 'Full Name'),
        dataIndex: 'fullName',
        width: 240,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'fullName'),
        onFilter: (value, record) => record.fullName === value,
        sorter: (a, b) => String(a.fullName || '').localeCompare(String(b.fullName || ''))
      },
      {
        title: localizedColumnTitle('age', 'Age'),
        dataIndex: 'age',
        width: 90,
        filters: buildFilterOptions(rows, 'age'),
        onFilter: (value, record) => record.age === value,
        sorter: (a, b) => toNumber(a.age) - toNumber(b.age)
      },
      {
        title: localizedColumnTitle('gender', 'Gender'),
        dataIndex: 'sex',
        width: 110,
        filters: buildFilterOptions(rows, 'sex'),
        onFilter: (value, record) => record.sex === value,
        sorter: (a, b) => String(a.sex || '').localeCompare(String(b.sex || '')),
        render: sex => {
          if (sex === 'M') return <Tag color="geekblue">Male</Tag>;
          if (sex === 'F') return <Tag color="pink">Female</Tag>;
          return <Tag>Unknown</Tag>;
        }
      }
    ]
  },
  {
    title: localizedColumnTitle('purchases', 'Purchases'),
    children: [
      {
        title: localizedColumnTitle('tier', 'Tier'),
        dataIndex: 'tierId',
        width: 110,
        filters: buildFilterOptions(rows, 'tierId', renderTierTag),
        onFilter: (value, record) => record.tierId === value,
        sorter: (a, b) => String(a.tierId || '').localeCompare(String(b.tierId || '')),
        render: renderTierTag
      },
      {
        title: localizedColumnTitle('count', 'Count'),
        dataIndex: 'purchaseCount',
        width: 100,
        sorter: (a, b) => toNumber(a.purchaseCount) - toNumber(b.purchaseCount),
        render: value => <Tag color="blue">{value || 0}</Tag>
      },
      {
        title: localizedColumnTitle('total', 'Total'),
        dataIndex: 'purchaseTotal',
        width: 130,
        sorter: (a, b) => toNumber(a.purchaseTotal) - toNumber(b.purchaseTotal),
        render: (_value, record) => record.purchaseTotalLabel
      },
      {
        title: localizedColumnTitle('refunded', 'Refunded'),
        dataIndex: 'refundedCount',
        width: 120,
        filters: [
          { text: 'Has refunds', value: 'hasRefunds' },
          { text: 'No refunds', value: 'noRefunds' }
        ],
        onFilter: (value, record) => (value === 'hasRefunds' ? record.refundedCount > 0 : record.refundedCount === 0),
        sorter: (a, b) => toNumber(a.refundedCount) - toNumber(b.refundedCount),
        render: (value, record) => (
          value > 0
            ? <Tag color="red">{value} / {record.refundedTotalLabel}</Tag>
            : <Tag color="green">None</Tag>
        )
      },
      {
        title: localizedColumnTitle('lastPurchase', 'Last Purchase'),
        dataIndex: 'lastPurchaseDateLabel',
        width: 150,
        sorter: (a, b) => toNumber(a.lastPurchaseTimestamp) - toNumber(b.lastPurchaseTimestamp)
      }
    ]
  },
  ...getLocationColumns(locationType, rows),
  {
    title: localizedColumnTitle('contact', 'Contact'),
    children: [
      {
        title: localizedColumnTitle('emails', 'Emails'),
        dataIndex: 'emails',
        width: 280,
        filterSearch: true,
        filters: buildArrayFilterOptions(rows, 'emails'),
        onFilter: (value, record) => (record.emails || []).includes(value),
        render: emails => renderTagList(emails)
      }
    ]
  }
]);

const getShopPurchaserExpandable = () => ({
  expandedRowRender: (record) => {
    const nestedColumns = [
      {
        title: localizedColumnTitle('purchaseId', 'Purchase Id'),
        dataIndex: 'purchaseId',
        width: 110
      },
      {
        title: localizedColumnTitle('date', 'Date'),
        dataIndex: 'transactionDateLabel',
        width: 140,
        sorter: (a, b) => toNumber(a.transactionTimestamp) - toNumber(b.transactionTimestamp)
      },
      {
        title: localizedColumnTitle('course', 'Course'),
        dataIndex: 'courseName',
        width: 180
      },
      {
        title: localizedColumnTitle('courseCodeId', 'Course Code'),
        dataIndex: 'courseCodeId',
        width: 280
      },
      {
        title: localizedColumnTitle('tier', 'Tier'),
        dataIndex: 'tierId',
        width: 110,
        render: renderTierTag
      },
      {
        title: localizedColumnTitle('amount', 'Amount'),
        dataIndex: 'amountLabel',
        width: 120
      },
      {
        title: localizedColumnTitle('refunded', 'Refunded'),
        dataIndex: 'wasRefunded',
        width: 110,
        render: wasRefunded => wasRefunded ? <Tag color="red">Refunded</Tag> : <Tag color="green">No</Tag>
      }
    ];

    return (
      <Table
        columns={nestedColumns}
        dataSource={record?.purchasesHistory || []}
        pagination={false}
        size="small"
        rowKey="key"
      />
    );
  }
});

export const buildShopPurchaserTableModel = (rows = [], options = {}) => {
  const tableData = toArray(rows).map((row, index) => buildShopPurchaserRow(row, index, options));
  const locationType = String(options.locationType || 'all').toLowerCase();

  if (tableData.length === 0) return EMPTY_TABLE_MODEL;

  return {
    tableData,
    columns: getShopPurchaserColumns(tableData, locationType),
    expandable: getShopPurchaserExpandable(),
    purchaseDates: tableData.flatMap(row => (
      (row.purchasesHistory || [])
        .map(purchase => purchase.transactionDate)
        .filter(isMeaningfulDate)
    ))
  };
};

const getEmailIds = (item = {}, purchase = {}) => {
  const emailCandidates = [
    getValue(purchase, ['EmailId', 'emailId', 'Email', 'email']),
    getValue(item, ['EmailId', 'emailId', 'Email', 'email']),
    ...toArray(item?.Emails).map(email => getValue(email, ['EmailId', 'emailId', 'Email', 'email']))
  ];

  return Array.from(new Set(emailCandidates.filter(Boolean)));
};

const buildShopPurchaseRow = (item = {}, purchase = {}, rowKey) => {
  const courseCodeId = getValue(purchase, ['CourseCodeId', 'courseCodeId']) || getValue(item, ['CourseCodeId', 'courseCodeId']);
  const courseName =
    getValue(purchase, ['CourseName', 'courseName', 'Course', 'course']) ||
    getValue(item, ['CourseName', 'courseName', 'Course', 'course']) ||
    item?.CourseDetails?.course ||
    '-';
  const purchaseId = getValue(purchase, [
    'PurchaseId',
    'purchaseId',
    'ShopPurchaseId',
    'shopPurchaseId',
    'PaymentProviderSessionId',
    'paymentProviderSessionId'
  ]);
  const amount = toNumber(getRevenueValue(purchase));
  const currency = normalizeCurrencyCode(getValue(purchase, ['Currency', 'currency']));
  const transactionDate = getValue(purchase, [
    'TransactionDate',
    'transactionDate',
    'PurchaseDate',
    'purchaseDate',
    'CreatedAt',
    'createdAt'
  ]);
  const tierId = normalizeTierId(getValue(purchase, ['TierId', 'tierId']) || getActiveTierForCourse(item, courseCodeId));
  const contactInternalId = getValue(item, ['ContactInternalId', 'contactInternalId']) ||
    getValue(purchase, ['ContactInternalId', 'contactInternalId']);
  const emails = getEmailIds(item, purchase);
  const wasRefunded = toBoolean(getValue(purchase, ['WasRefunded', 'wasRefunded', 'IsRefunded', 'isRefunded']));

  return {
    key: `${purchaseId || contactInternalId || rowKey}-${rowKey}`,
    purchaseId: purchaseId || '-',
    transactionDate,
    transactionDateLabel: formatDate(transactionDate),
    transactionTimestamp: toDateTimestamp(transactionDate),
    courseName,
    courseCodeId: courseCodeId || '-',
    tierId,
    amount,
    amountLabel: formatCurrency(amount, currency),
    currency,
    wasRefunded,
    fullName: getValue(item, ['FullName', 'fullName', 'CustomerName', 'customerName']) ||
      getValue(purchase, ['FullName', 'fullName', 'CustomerName', 'customerName']) ||
      [item?.Names, item?.LastNames].filter(Boolean).join(' ') ||
      '-',
    contactInternalId,
    primaryEmail: emails[0] || '-',
    emails,
    searchText: [
      purchaseId,
      courseName,
      courseCodeId,
      tierId,
      contactInternalId,
      emails.join(' '),
      getValue(item, ['FullName', 'fullName'])
    ].filter(Boolean).join(' ')
  };
};

const buildShopPurchaseRows = (rows = []) => (
  toArray(rows).flatMap((item, itemIndex) => {
    const purchases = toArray(item?.PurchasesHistory || item?.PurchaseHistory || item?.Purchases);

    if (purchases.length === 0) {
      return [buildShopPurchaseRow(item, item, itemIndex)];
    }

    return purchases.map((purchase, purchaseIndex) => (
      buildShopPurchaseRow(item, purchase, `${itemIndex}-${purchaseIndex}`)
    ));
  })
);

const getShopPurchaseColumns = (rows = []) => ([
  {
    title: localizedColumnTitle('purchase', 'Purchase'),
    children: [
      {
        title: localizedColumnTitle('date', 'Date'),
        dataIndex: 'transactionDateLabel',
        width: 140,
        sorter: (a, b) => toNumber(a.transactionTimestamp) - toNumber(b.transactionTimestamp)
      },
      {
        title: localizedColumnTitle('purchaseId', 'Purchase Id'),
        dataIndex: 'purchaseId',
        width: 130,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'purchaseId'),
        onFilter: (value, record) => record.purchaseId === value
      },
      {
        title: localizedColumnTitle('amount', 'Amount'),
        dataIndex: 'amount',
        width: 120,
        sorter: (a, b) => toNumber(a.amount) - toNumber(b.amount),
        render: (_value, record) => record.amountLabel
      },
      {
        title: localizedColumnTitle('tier', 'Tier'),
        dataIndex: 'tierId',
        width: 110,
        filters: buildFilterOptions(rows, 'tierId', renderTierTag),
        onFilter: (value, record) => record.tierId === value,
        sorter: (a, b) => String(a.tierId || '').localeCompare(String(b.tierId || '')),
        render: renderTierTag
      },
      {
        title: localizedColumnTitle('status', 'Status'),
        dataIndex: 'wasRefunded',
        width: 120,
        filters: [
          { text: 'Refunded', value: true },
          { text: 'Completed', value: false }
        ],
        onFilter: (value, record) => record.wasRefunded === value,
        render: wasRefunded => wasRefunded
          ? <Tag color="red">Refunded</Tag>
          : <Tag color="green">Completed</Tag>
      }
    ]
  },
  {
    title: localizedColumnTitle('course', 'Course'),
    children: [
      {
        title: localizedColumnTitle('course', 'Course'),
        dataIndex: 'courseName',
        width: 220,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'courseName'),
        onFilter: (value, record) => record.courseName === value,
        sorter: (a, b) => String(a.courseName || '').localeCompare(String(b.courseName || ''))
      },
      {
        title: localizedColumnTitle('courseCodeId', 'Course Code'),
        dataIndex: 'courseCodeId',
        width: 300,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'courseCodeId'),
        onFilter: (value, record) => record.courseCodeId === value,
        sorter: (a, b) => String(a.courseCodeId || '').localeCompare(String(b.courseCodeId || ''))
      }
    ]
  },
  {
    title: localizedColumnTitle('buyer', 'Buyer'),
    children: [
      {
        title: localizedColumnTitle('name', 'Name'),
        dataIndex: 'fullName',
        width: 240,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'fullName'),
        onFilter: (value, record) => record.fullName === value,
        sorter: (a, b) => String(a.fullName || '').localeCompare(String(b.fullName || ''))
      },
      {
        title: localizedColumnTitle('primaryEmail', 'Primary Email'),
        dataIndex: 'primaryEmail',
        width: 260,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'primaryEmail'),
        onFilter: (value, record) => record.primaryEmail === value
      },
      {
        title: localizedColumnTitle('internalId', 'Internal Id'),
        dataIndex: 'contactInternalId',
        width: 300,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'contactInternalId'),
        onFilter: (value, record) => record.contactInternalId === value,
        render: (contactInternalId) => (
          <span>
            {contactInternalId || '-'}
            {contactInternalId ? (
              <Tooltip title="Copy internal id">
                <Button
                  type="link"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={(event) => {
                    event.stopPropagation();
                    copyText(contactInternalId);
                  }}
                />
              </Tooltip>
            ) : null}
          </span>
        )
      },
      {
        title: localizedColumnTitle('emails', 'Emails'),
        dataIndex: 'emails',
        width: 300,
        filterSearch: true,
        filters: buildArrayFilterOptions(rows, 'emails'),
        onFilter: (value, record) => (record.emails || []).includes(value),
        render: emails => renderTagList(emails)
      }
    ]
  }
]);

export const buildShopPurchaseTableModel = (rows = []) => {
  const tableData = buildShopPurchaseRows(rows);

  if (tableData.length === 0) return EMPTY_TABLE_MODEL;

  return {
    tableData,
    columns: getShopPurchaseColumns(tableData),
    expandable: null
  };
};

const getContactShopPurchaseHistoryItems = (rows = []) => {
  const arrayRows = toArray(rows);
  return arrayRows.length > 0 ? arrayRows : toOneOrMany(rows);
};

const buildContactShopPurchaseHistoryRows = (rows = [], contactInternalId = null) => (
  getContactShopPurchaseHistoryItems(rows).flatMap((item, itemIndex) => {
    const itemContactInternalId = getValue(item, ['ContactInternalId', 'contactInternalId']) || contactInternalId;
    const nestedPurchases = toArray(item?.PurchasesHistory || item?.purchasesHistory || item?.PurchaseHistory || item?.Purchases);
    const purchases = nestedPurchases.length > 0
      ? nestedPurchases
      : (
        getValue(item, ['PurchaseId', 'purchaseId', 'Amount', 'amount', 'CourseCodeId', 'courseCodeId'])
          ? [item]
          : []
      );

    return purchases.map((purchase, purchaseIndex) => {
      const amount = toNumber(getValue(purchase, ['Amount', 'amount']));
      const currency = normalizeCurrencyCode(getValue(purchase, ['Currency', 'currency']));
      const transactionDate = getValue(purchase, ['TransactionDate', 'transactionDate', 'PurchaseDate', 'purchaseDate']);
      const courseCodeId = getValue(purchase, ['CourseCodeId', 'courseCodeId']);
      const courseName = getValue(purchase, ['CourseName', 'courseName', 'Course', 'course']);
      const purchaseId = getValue(purchase, ['PurchaseId', 'purchaseId', 'ShopPurchaseId', 'shopPurchaseId']);
      const wasRefunded = toBoolean(getValue(purchase, ['WasRefunded', 'wasRefunded', 'IsRefunded', 'isRefunded']));
      const tierId = normalizeTierId(getValue(purchase, ['TierId', 'tierId']));
      const tierLocalizationKey = normalizeTierLocalizationKey(getValue(purchase, ['TierLocalizationKey', 'tierLocalizationKey']));

      return {
        key: `${itemContactInternalId || 'contact'}-${purchaseId || purchaseIndex}-${itemIndex}`,
        contactInternalId: itemContactInternalId,
        purchaseId: purchaseId || '-',
        transactionDate,
        transactionDateLabel: formatDate(transactionDate),
        transactionTimestamp: toDateTimestamp(transactionDate),
        amount,
        amountLabel: formatCurrency(amount, currency),
        currency,
        tierId,
        tierLocalizationKey,
        courseCodeId: courseCodeId || '-',
        courseName: courseName || '-',
        wasRefunded,
        searchText: [
          purchaseId,
          transactionDate,
          amount,
          currency,
          tierId,
          tierLocalizationKey,
          courseCodeId,
          courseName,
          itemContactInternalId
        ].filter(Boolean).join(' ')
      };
    });
  })
);

const getContactShopPurchaseHistoryColumns = (rows = []) => ([
  {
    title: localizedColumnTitle('purchase', 'Purchase'),
    children: [
      {
        title: localizedColumnTitle('date', 'Date'),
        dataIndex: 'transactionDateLabel',
        width: 150,
        sorter: (a, b) => toNumber(a.transactionTimestamp) - toNumber(b.transactionTimestamp)
      },
      {
        title: localizedColumnTitle('purchaseId', 'Purchase Id'),
        dataIndex: 'purchaseId',
        width: 130,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'purchaseId'),
        onFilter: (value, record) => record.purchaseId === value
      },
      {
        title: localizedColumnTitle('amount', 'Amount'),
        dataIndex: 'amount',
        width: 120,
        sorter: (a, b) => toNumber(a.amount) - toNumber(b.amount),
        render: (_value, record) => (
          <Tag color={record.wasRefunded ? 'red' : 'green'}>{record.amountLabel}</Tag>
        )
      },
      {
        title: localizedColumnTitle('currency', 'Currency'),
        dataIndex: 'currency',
        width: 120,
        filters: buildFilterOptions(rows, 'currency', renderCurrencyCodeTag),
        onFilter: (value, record) => record.currency === value,
        sorter: (a, b) => String(a.currency || '').localeCompare(String(b.currency || '')),
        render: renderCurrencyCodeTag
      },
      {
        title: localizedColumnTitle('tier', 'Tier'),
        dataIndex: 'tierId',
        width: 120,
        filters: buildFilterOptions(rows, 'tierId', renderTierTag),
        onFilter: (value, record) => record.tierId === value,
        sorter: (a, b) => String(a.tierId || '').localeCompare(String(b.tierId || '')),
        render: (tierId, record) => renderTierTag(tierId, record?.tierLocalizationKey)
      },
      {
        title: localizedColumnTitle('status', 'Status'),
        dataIndex: 'wasRefunded',
        width: 130,
        filters: [
          { text: 'Refunded', value: true },
          { text: 'Completed', value: false }
        ],
        onFilter: (value, record) => record.wasRefunded === value,
        render: wasRefunded => wasRefunded
          ? <Tag color="red">Refunded</Tag>
          : <Tag color="green">Completed</Tag>
      }
    ]
  },
  {
    title: localizedColumnTitle('course', 'Course'),
    children: [
      {
        title: localizedColumnTitle('course', 'Course'),
        dataIndex: 'courseName',
        width: 220,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'courseName'),
        onFilter: (value, record) => record.courseName === value,
        sorter: (a, b) => String(a.courseName || '').localeCompare(String(b.courseName || ''))
      },
      {
        title: localizedColumnTitle('courseCodeId', 'Course Code Id'),
        dataIndex: 'courseCodeId',
        width: 300,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'courseCodeId'),
        onFilter: (value, record) => record.courseCodeId === value,
        sorter: (a, b) => String(a.courseCodeId || '').localeCompare(String(b.courseCodeId || '')),
        render: courseCodeId => renderCopyableText(courseCodeId, 'Copy course code')
      }
    ]
  }
]);

export const buildContactShopPurchaseHistoryTableModel = (rows = [], contactInternalId = null) => {
  const tableData = buildContactShopPurchaseHistoryRows(rows, contactInternalId);

  if (tableData.length === 0) return EMPTY_TABLE_MODEL;

  return {
    tableData,
    columns: getContactShopPurchaseHistoryColumns(tableData),
    expandable: null
  };
};

const getRevenueValue = (item = {}) => getValue(item, [
  'TotalRevenue',
  'totalRevenue',
  'Revenue',
  'revenue',
  'TotalAmount',
  'totalAmount',
  'Amount',
  'amount'
]);

const getCountValue = (item = {}) => getValue(item, [
  'PurchaseCount',
  'purchaseCount',
  'SalesCount',
  'salesCount',
  'OrderCount',
  'orderCount',
  'Count',
  'count',
  'TotalPurchases',
  'totalPurchases'
]);

const getFirstPurchaseDate = (item = {}) => getValue(item, [
  'FirstPurchaseDate',
  'firstPurchaseDate',
  'FirstPurchase',
  'firstPurchase',
  'FirstTransactionDate',
  'firstTransactionDate'
]);

const getLastPurchaseDate = (item = {}) => getValue(item, [
  'LastPurchaseDate',
  'lastPurchaseDate',
  'LastPurchase',
  'lastPurchase',
  'LastTransactionDate',
  'lastTransactionDate',
  'TransactionDate',
  'transactionDate'
]);

const getCustomerLifetimeRevenue = (item = {}) => getValue(item, [
  'LifetimeRevenue',
  'lifetimeRevenue',
  'LifetimeValue',
  'lifetimeValue',
  'TotalRevenue',
  'totalRevenue',
  'Revenue',
  'revenue'
]);

const getAverageOrderValue = (item = {}, purchaseCount = 0, lifetimeRevenue = 0) => {
  const averageOrder = getValue(item, [
    'AverageOrder',
    'averageOrder',
    'AverageOrderValue',
    'averageOrderValue',
    'AveragePurchase',
    'averagePurchase',
    'AverageCustomerValue',
    'averageCustomerValue'
  ]);

  if (averageOrder !== null && averageOrder !== undefined) return toNumber(averageOrder);
  return purchaseCount > 0 ? lifetimeRevenue / purchaseCount : 0;
};

const buildShopTopCustomerRow = (item = {}, index) => {
  const purchaseCount = toNumber(getCountValue(item));
  const lifetimeRevenue = toNumber(getCustomerLifetimeRevenue(item));
  const averageOrder = getAverageOrderValue(item, purchaseCount, lifetimeRevenue);
  const currency = normalizeCurrencyCode(getValue(item, ['Currency', 'currency']));
  const firstPurchaseDate = getFirstPurchaseDate(item);
  const lastPurchaseDate = getLastPurchaseDate(item);
  const contactInternalId = getValue(item, ['ContactInternalId', 'contactInternalId']);
  const emails = normalizeEmailList(
    getValue(item, ['Emails', 'emails', 'EmailIds', 'emailIds', 'EmailList', 'emailList']),
    getValue(item, ['PrimaryEmail', 'primaryEmail', 'EmailId', 'emailId', 'Email', 'email'])
  );
  const fullName = getValue(item, [
    'FullName',
    'fullName',
    'CustomerName',
    'customerName',
    'Name',
    'name'
  ]) || [item?.Names, item?.LastNames].filter(Boolean).join(' ') || '-';

  return {
    key: contactInternalId || getValue(item, ['CustomerId', 'customerId', 'ContactExternalId', 'contactExternalId']) || index,
    purchaseCount,
    averageOrder,
    averageOrderLabel: formatCurrency(averageOrder, currency),
    lifetimeRevenue,
    lifetimeRevenueLabel: formatCurrency(lifetimeRevenue, currency),
    firstPurchaseDate,
    firstPurchaseDateLabel: formatDate(firstPurchaseDate),
    firstPurchaseTimestamp: toDateTimestamp(firstPurchaseDate),
    lastPurchaseDate,
    lastPurchaseDateLabel: formatDate(lastPurchaseDate),
    lastPurchaseTimestamp: toDateTimestamp(lastPurchaseDate),
    fullName,
    contactInternalId,
    emails,
    searchText: [
      fullName,
      contactInternalId,
      emails.join(' '),
      purchaseCount,
      averageOrder,
      lifetimeRevenue,
      firstPurchaseDate,
      lastPurchaseDate
    ].filter(Boolean).join(' ')
  };
};

const getShopTopCustomerColumns = (rows = []) => ([
  {
    title: localizedColumnTitle('purchases', 'Purchases'),
    children: [
      {
        title: localizedColumnTitle('purchases', 'Purchases'),
        dataIndex: 'purchaseCount',
        width: 120,
        sorter: (a, b) => toNumber(a.purchaseCount) - toNumber(b.purchaseCount),
        render: value => renderNumberTag(value)
      },
      {
        title: localizedColumnTitle('averageOrder', 'Average Order'),
        dataIndex: 'averageOrder',
        width: 150,
        sorter: (a, b) => toNumber(a.averageOrder) - toNumber(b.averageOrder),
        render: (_value, record) => <Tag color="green">{record.averageOrderLabel}</Tag>
      },
      {
        title: localizedColumnTitle('firstPurchase', 'First Purchase'),
        dataIndex: 'firstPurchaseDateLabel',
        width: 160,
        sorter: (a, b) => toNumber(a.firstPurchaseTimestamp) - toNumber(b.firstPurchaseTimestamp)
      },
      {
        title: localizedColumnTitle('lastPurchase', 'Last Purchase'),
        dataIndex: 'lastPurchaseDateLabel',
        width: 160,
        sorter: (a, b) => toNumber(a.lastPurchaseTimestamp) - toNumber(b.lastPurchaseTimestamp)
      },
      {
        title: localizedColumnTitle('lifetimeRevenue', 'Lifetime Revenue'),
        dataIndex: 'lifetimeRevenue',
        width: 160,
        sorter: (a, b) => toNumber(a.lifetimeRevenue) - toNumber(b.lifetimeRevenue),
        render: (_value, record) => <Tag color="green">{record.lifetimeRevenueLabel}</Tag>
      }
    ]
  },
  {
    title: localizedColumnTitle('buyer', 'Buyer'),
    children: [
      {
        title: localizedColumnTitle('fullName', 'Full Name'),
        dataIndex: 'fullName',
        width: 260,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'fullName'),
        onFilter: (value, record) => record.fullName === value,
        sorter: (a, b) => String(a.fullName || '').localeCompare(String(b.fullName || ''))
      },
      {
        title: localizedColumnTitle('internalId', 'Internal Id'),
        dataIndex: 'contactInternalId',
        width: 320,
        filterSearch: true,
        filters: buildFilterOptions(rows, 'contactInternalId'),
        onFilter: (value, record) => record.contactInternalId === value,
        sorter: (a, b) => String(a.contactInternalId || '').localeCompare(String(b.contactInternalId || '')),
        render: contactInternalId => renderCopyableText(contactInternalId, 'Copy internal id')
      },
      {
        title: localizedColumnTitle('emails', 'Emails'),
        dataIndex: 'emails',
        width: 320,
        filterSearch: true,
        filters: buildArrayFilterOptions(rows, 'emails'),
        onFilter: (value, record) => (record.emails || []).includes(value),
        render: emails => renderTagList(emails)
      }
    ]
  }
]);

export const buildShopTopCustomersTableModel = (rows = []) => {
  const tableData = toArray(rows).map(buildShopTopCustomerRow);

  if (tableData.length === 0) return EMPTY_TABLE_MODEL;

  return {
    tableData,
    columns: getShopTopCustomerColumns(tableData),
    expandable: null
  };
};

const normalizeRevenueByTier = (rows = []) => (
  toArray(rows).map(item => ({
    type: normalizeTierId(getValue(item, ['TierId', 'tierId', 'TierName', 'tierName', 'Tier', 'tier']) || 'Unknown'),
    revenue: toNumber(getRevenueValue(item)),
    count: toNumber(getCountValue(item))
  }))
);

const normalizeTopCourses = (rows = []) => (
  toArray(rows).map(item => ({
    type: getValue(item, ['CourseName', 'courseName', 'Course', 'course', 'CourseTitle', 'courseTitle', 'CourseCodeId', 'courseCodeId']) || 'Unknown',
    revenue: toNumber(getRevenueValue(item)),
    count: toNumber(getCountValue(item)),
    courseCodeId: getValue(item, ['CourseCodeId', 'courseCodeId'])
  }))
);

export const buildShopPurchasedCourseSelectionOptions = (courses = [], labels = {}) => {
  const normalizedLabels = typeof labels === 'string'
    ? { allCoursesLabel: labels }
    : (labels || {});
  const {
    allCoursesLabel = 'All Purchased Courses',
    purchasesLabel = 'purchases',
    buyersLabel = 'buyers'
  } = normalizedLabels;

  return [
    {
      value: 'all',
      label: allCoursesLabel
    },
    ...toArray(courses).map((course) => {
    const courseCodeId = getValue(course, ['CourseCodeId', 'courseCodeId']);
    const courseName = getValue(course, ['CourseName', 'courseName', 'Course', 'course']) || courseCodeId;
    const purchaseCount = getCountValue(course);
    const uniqueCustomers = getValue(course, ['UniqueCustomers', 'uniqueCustomers', 'PurchaserCount', 'purchaserCount']);
    const totalRevenue = getRevenueValue(course);
    const stats = [
      purchaseCount != null ? `${formatNumber(purchaseCount)} ${purchasesLabel}` : null,
      uniqueCustomers != null ? `${formatNumber(uniqueCustomers)} ${buyersLabel}` : null,
      totalRevenue != null ? formatCurrency(totalRevenue) : null
    ].filter(Boolean);

    return {
      value: courseCodeId,
      label: `${courseName} - ${courseCodeId}${stats.length ? ` (${stats.join(' · ')})` : ''}`,
      courseName,
      courseCodeId,
      purchaseCount,
      uniqueCustomers,
      totalRevenue
    };
    }).filter(option => option.value)
  ];
};

export const buildProductCourseTierPayload = ({
  paymentProviderPriceId,
  courseCodeId,
  tierId,
  isActive = true
} = {}) => ({
  PaymentProviderPriceId: paymentProviderPriceId,
  CourseCodeId: courseCodeId,
  TierId: tierId,
  IsActive: Boolean(isActive)
});

const normalizeLanguagePairSales = (rows = []) => (
  toArray(rows).map(item => {
    const nativeLanguage = getValue(item, ['NativeLanguageId', 'nativeLanguageId', 'NativeLanguage', 'nativeLanguage']) || 'N/A';
    const targetLanguage = getValue(item, ['TargetLanguageId', 'targetLanguageId', 'TargetLanguage', 'targetLanguage']) || 'N/A';

    return {
      type: `${nativeLanguage} -> ${targetLanguage}`,
      revenue: toNumber(getRevenueValue(item)),
      count: toNumber(getCountValue(item))
    };
  })
);

const normalizeTrendRows = (rows = [], dateKeys = [], valueKeys = []) => (
  toArray(rows)
    .map(item => {
      const rawDate = getValue(item, dateKeys);
      const rawValue = getValue(item, valueKeys);
      const date = isMeaningfulDate(rawDate) ? String(rawDate).substring(0, 10) : null;
      if (!date) return null;

      return {
        date,
        count: toNumber(rawValue)
      };
    })
    .filter(Boolean)
);

const firstNonEmptyArray = (...values) => (
  values.find(value => toArray(value).length > 0) || []
);

const firstObject = (value) => {
  if (Array.isArray(value)) return value[0] || {};
  return value || {};
};

const getRate = (source = {}, keys = []) => {
  const value = getValue(source, keys);
  if (value == null) return 0;
  return toNumber(value);
};

export const buildShopAnalyticsDashboard = ({
  summary = {},
  health = {},
  shopCoursesWithPurchases = [],
  revenueByTier: revenueByTierRows = [],
  monthlyRevenue: monthlyRevenueRows = [],
  dailySales: dailySalesRows = [],
  salesByDateRange = [],
  refundAnalytics: refundAnalyticsRows = {},
  purchaseRows = [],
  activeProducts = [],
  productsByCourse = [],
  productsByTier = [],
  languagePairSales = [],
  courseLeaderboard = [],
  repeatCustomers = {},
  customerLifetimeValue = [],
  recentlyActiveCustomers = [],
  customerCohorts = [],
  conversionMetrics: conversionMetricsRows = {},
  exportSalesReport = []
} = {}) => {
  const revenueByTier = normalizeRevenueByTier(firstNonEmptyArray(
    summary?.RevenueByTier,
    summary?.revenueByTier,
    revenueByTierRows
  ));
  const monthlyRevenue = normalizeTrendRows(
    firstNonEmptyArray(summary?.MonthlyRevenue, summary?.monthlyRevenue, monthlyRevenueRows),
    ['Month', 'month', 'RevenueMonth', 'revenueMonth', 'Date', 'date'],
    ['TotalRevenue', 'totalRevenue', 'Revenue', 'revenue', 'Amount', 'amount']
  );
  const dailySales = normalizeTrendRows(
    firstNonEmptyArray(summary?.DailySales, summary?.dailySales, dailySalesRows),
    ['Day', 'day', 'SalesDate', 'salesDate', 'Date', 'date'],
    ['TotalRevenue', 'totalRevenue', 'Revenue', 'revenue', 'SalesCount', 'salesCount', 'Count', 'count']
  );
  const salesByDateRangeTrend = normalizeTrendRows(
    salesByDateRange,
    ['Day', 'day', 'SalesDate', 'salesDate', 'Date', 'date', 'TransactionDate', 'transactionDate'],
    ['TotalRevenue', 'totalRevenue', 'Revenue', 'revenue', 'SalesCount', 'salesCount', 'Count', 'count', 'Amount', 'amount']
  );
  const summaryConversionMetrics = summary?.ConversionMetrics || summary?.conversionMetrics || {};
  const conversionMetrics = Object.keys(summaryConversionMetrics || {}).length > 0
    ? firstObject(summaryConversionMetrics)
    : firstObject(conversionMetricsRows);
  const summaryRefundAnalytics = summary?.RefundAnalytics || summary?.refundAnalytics || {};
  const refundAnalyticsCandidate = Object.keys(summaryRefundAnalytics || {}).length > 0
    ? firstObject(summaryRefundAnalytics)
    : firstObject(refundAnalyticsRows);
  const refundAnalytics = Object.keys(refundAnalyticsCandidate || {}).length > 0
    ? refundAnalyticsCandidate
    : {};
  const topCourses = normalizeTopCourses(firstNonEmptyArray(
    summary?.TopCourses,
    summary?.topCourses,
    shopCoursesWithPurchases,
    courseLeaderboard
  ));
  const normalizedLanguagePairSales = normalizeLanguagePairSales(languagePairSales);
  const purchaseTable = buildShopPurchaseTableModel(purchaseRows);
  const activeProductsTable = buildTableModel(activeProducts);
  const productsByCourseTable = buildTableModel(productsByCourse);
  const productsByTierTable = buildTableModel(productsByTier);
  const topCustomersTable = buildShopTopCustomersTableModel(customerLifetimeValue);
  const recentlyActiveCustomersTable = buildTableModel(recentlyActiveCustomers);
  const customerCohortsTable = buildTableModel(customerCohorts);
  const salesByDateRangeTable = buildTableModel(salesByDateRange);
  const refundAnalyticsTable = buildTableModel(
    Object.keys(summaryRefundAnalytics || {}).length > 0
      ? [refundAnalytics]
      : (
        Array.isArray(refundAnalyticsRows)
          ? refundAnalyticsRows
          : (Object.keys(refundAnalytics || {}).length > 0 ? [refundAnalytics] : [])
      )
  );
  const exportSalesReportTable = buildTableModel(exportSalesReport);
  const activeProductRows = toArray(activeProducts);
  const activeProductCount = activeProductRows.filter(item => (
    getValue(item, ['IsActive', 'isActive']) !== false
  )).length;
  const topCoursePurchaseCount = topCourses.reduce((sum, item) => sum + toNumber(item.count), 0);
  const topCourseRevenue = topCourses.reduce((sum, item) => sum + toNumber(item.revenue), 0);
  const totalRevenue = revenueByTier.reduce((sum, item) => sum + item.revenue, 0) ||
    monthlyRevenue.reduce((sum, item) => sum + item.count, 0) ||
    salesByDateRangeTrend.reduce((sum, item) => sum + item.count, 0) ||
    topCourseRevenue;
  const totalPurchases = toNumber(getValue(conversionMetrics, [
    'TotalPurchases',
    'totalPurchases',
    'PurchaseCount',
    'purchaseCount',
    'Orders',
    'orders'
  ])) || topCoursePurchaseCount || dailySales.reduce((sum, item) => sum + item.count, 0);
  const repeatCustomerSource = Array.isArray(repeatCustomers) ? repeatCustomers[0] : repeatCustomers;

  return {
    shopCoursesWithPurchases,
    overview: {
      totalRevenue: formatCurrency(totalRevenue),
      totalPurchases: formatNumber(totalPurchases),
      refundRate: formatPercent(getRate(refundAnalytics, ['RefundRate', 'refundRate', 'Rate', 'rate'])),
      refundedAmount: formatCurrency(getValue(refundAnalytics, [
        'RefundedRevenue',
        'refundedRevenue',
        'RefundedAmount',
        'refundedAmount',
        'TotalRefunded',
        'totalRefunded'
      ]) || 0),
      conversionRate: formatPercent(getRate(conversionMetrics, ['ConversionRate', 'conversionRate', 'Rate', 'rate'])),
      repeatCustomerRate: formatPercent(getRate(repeatCustomerSource, ['RepeatCustomerRate', 'repeatCustomerRate', 'Rate', 'rate'])),
      activeProducts: formatNumber(activeProductCount || topCourses.length),
      latestRefresh: getValue(health?.LatestRefresh || health?.latestRefresh || {}, ['SecondsSinceRefresh', 'secondsSinceRefresh']) ?? null
    },
    charts: {
      revenueByTier,
      topCourses,
      languagePairSales: normalizedLanguagePairSales,
      monthlyRevenue,
      dailySales,
      salesByDateRange: salesByDateRangeTrend
    },
    tables: {
      purchases: purchaseTable,
      activeProducts: activeProductsTable,
      productsByCourse: productsByCourseTable,
      productsByTier: productsByTierTable,
      topCustomers: topCustomersTable,
      recentlyActiveCustomers: recentlyActiveCustomersTable,
      customerCohorts: customerCohortsTable,
      salesByDateRange: salesByDateRangeTable,
      refundAnalytics: refundAnalyticsTable,
      exportSalesReport: exportSalesReportTable
    },
    raw: {
      summary,
      health,
      shopCoursesWithPurchases,
      repeatCustomers,
      refundAnalytics,
      salesByDateRange,
      exportSalesReport
    }
  };
};

const ShopAnalytics = {
  buildShopAnalyticsDashboard,
  buildShopPurchaserTableModel,
  buildShopPurchaseTableModel,
  buildContactShopPurchaseHistoryTableModel,
  buildShopTopCustomersTableModel,
  buildShopPurchasedCourseSelectionOptions,
  buildProductCourseTierPayload
};

export default ShopAnalytics;
