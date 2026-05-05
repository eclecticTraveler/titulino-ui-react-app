import TitulinoNetService from "services/TitulinoNetService";

const KNOW_ME_PROFILE_BATCH_SIZE = 100;
const DEFAULT_PROFILE_URL_AVAILABILITY_MINUTES = 128;

export const normalizeContactInternalId = (value) => (
  value == null ? '' : String(value).trim().toLowerCase()
);

const hasOwnProfileResolution = (profileUrlMap = {}, contactInternalId) => (
  Object.prototype.hasOwnProperty.call(profileUrlMap || {}, normalizeContactInternalId(contactInternalId))
);

const defaultContactInternalIdSelector = (item) => (
  item?.contactInternalId ||
  item?.ContactInternalId ||
  item?.contact_internal_id ||
  ''
);

const chunkArray = (items = [], chunkSize = KNOW_ME_PROFILE_BATCH_SIZE) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
};

const getKnowMeProfileResponses = (apiResult) => {
  if (Array.isArray(apiResult)) return apiResult;

  return (
    apiResult?.KnowMeProfileResponses ||
    apiResult?.knowMeProfileResponses ||
    apiResult?.knowMeProfilesResponse?.KnowMeProfileResponses ||
    apiResult?.knowMeProfilesResponse?.knowMeProfileResponses ||
    []
  );
};

export const extractContactInternalIds = (
  items = [],
  getContactInternalId = defaultContactInternalIdSelector
) => (
  Array.from(new Set(
    (items || [])
      .map(item => normalizeContactInternalId(getContactInternalId(item)))
      .filter(Boolean)
  ))
);

export const buildKnowMeProfileUrlMap = (apiResult) => {
  const profileResponses = getKnowMeProfileResponses(apiResult);

  return (profileResponses || []).reduce((profileUrlMap, row) => {
    const contactInternalId = normalizeContactInternalId(
      row?.ContactInternalId ||
      row?.contactInternalId
    );
    const profileUrl = row?.ProfileUrl || row?.profileUrl || '';

    if (contactInternalId && profileUrl) {
      profileUrlMap[contactInternalId] = profileUrl;
    }

    return profileUrlMap;
  }, {});
};

export const getMissingContactInternalIds = (
  items = [],
  existingProfileUrlMap = {},
  getContactInternalId = defaultContactInternalIdSelector
) => (
  extractContactInternalIds(items, getContactInternalId)
    .filter(contactInternalId => !hasOwnProfileResolution(existingProfileUrlMap, contactInternalId))
);

export const mergeKnowMeProfileUrlsIntoItems = (
  items = [],
  profileUrlMap = {},
  options = {}
) => {
  const {
    getContactInternalId = defaultContactInternalIdSelector,
    avatarField = 'avatarUrl'
  } = options;

  if (!Array.isArray(items) || items.length === 0) return items || [];

  return items.map(item => {
    const normalizedContactInternalId = normalizeContactInternalId(getContactInternalId(item));
    const nextAvatarUrl = profileUrlMap?.[normalizedContactInternalId] || item?.[avatarField] || null;

    if (nextAvatarUrl === item?.[avatarField]) {
      return item;
    }

    return {
      ...item,
      [avatarField]: nextAvatarUrl
    };
  });
};

export const getKnowMeProfileUrlMap = async (
  token,
  contactInternalIds = [],
  whoCalledMe,
  profileUrlAvailabilityUsageTimeInMinutes = DEFAULT_PROFILE_URL_AVAILABILITY_MINUTES
) => {
  const normalizedContactInternalIds = extractContactInternalIds(contactInternalIds, value => value);

  if (!token || normalizedContactInternalIds.length === 0) return {};

  const contactInternalIdBatches = chunkArray(normalizedContactInternalIds, KNOW_ME_PROFILE_BATCH_SIZE);

  const batchResponses = await Promise.all(
    contactInternalIdBatches.map((contactIdsBatch, batchIndex) => (
      TitulinoNetService.getKnowMeProfilesByContactInternalIds(
        token,
        contactIdsBatch,
        profileUrlAvailabilityUsageTimeInMinutes,
        `${whoCalledMe}:batch${batchIndex + 1}`
      )
    ))
  );

  return batchResponses.reduce((profileUrlMap, batchResponse, batchIndex) => {
    const requestedBatchIds = contactInternalIdBatches[batchIndex] || [];
    requestedBatchIds.forEach(contactInternalId => {
      profileUrlMap[contactInternalId] = null;
    });

    Object.assign(profileUrlMap, buildKnowMeProfileUrlMap(batchResponse));
    return profileUrlMap;
  }, {});
};

export const getMissingKnowMeProfileUrlMap = async (
  token,
  items = [],
  existingProfileUrlMap = {},
  whoCalledMe,
  options = {}
) => {
  const {
    getContactInternalId = defaultContactInternalIdSelector,
    profileUrlAvailabilityUsageTimeInMinutes = DEFAULT_PROFILE_URL_AVAILABILITY_MINUTES
  } = options;

  const missingContactInternalIds = getMissingContactInternalIds(
    items,
    existingProfileUrlMap,
    getContactInternalId
  );

  if (!token || missingContactInternalIds.length === 0) return {};

  return getKnowMeProfileUrlMap(
    token,
    missingContactInternalIds,
    whoCalledMe,
    profileUrlAvailabilityUsageTimeInMinutes
  );
};

export const enrichItemsWithKnowMeProfileUrls = async (
  token,
  items = [],
  whoCalledMe,
  options = {}
) => {
  const {
    getContactInternalId = defaultContactInternalIdSelector,
    profileUrlAvailabilityUsageTimeInMinutes = DEFAULT_PROFILE_URL_AVAILABILITY_MINUTES,
    avatarField = 'avatarUrl'
  } = options;

  const profileUrlMap = await getMissingKnowMeProfileUrlMap(
    token,
    items,
    {},
    whoCalledMe,
    {
      getContactInternalId,
      profileUrlAvailabilityUsageTimeInMinutes
    }
  );

  if (Object.keys(profileUrlMap).length === 0) return items;

  return mergeKnowMeProfileUrlsIntoItems(items, profileUrlMap, {
    getContactInternalId,
    avatarField
  });
};

export const applyKnowMeProfileUrlMapToTableModel = (
  tableModel,
  profileUrlMap = {},
  options = {}
) => {
  const tableData = tableModel?.tableData || [];

  if (!tableModel || tableData.length === 0 || !profileUrlMap) return tableModel;

  const nextTableData = mergeKnowMeProfileUrlsIntoItems(tableData, profileUrlMap, options);

  if (nextTableData === tableData) return tableModel;

  return {
    ...tableModel,
    tableData: nextTableData
  };
};

export const enrichTableModelWithKnowMeProfileUrls = async (
  token,
  tableModel,
  whoCalledMe,
  options = {}
) => {
  const tableData = tableModel?.tableData || [];

  if (!tableModel || tableData.length === 0) return tableModel;

  const profileUrlMap = await getMissingKnowMeProfileUrlMap(
    token,
    tableData,
    {},
    whoCalledMe,
    options
  );

  if (Object.keys(profileUrlMap).length === 0) return tableModel;

  return applyKnowMeProfileUrlMapToTableModel(tableModel, profileUrlMap, options);
};

const KnowMeProfiles = {
  normalizeContactInternalId,
  getMissingContactInternalIds,
  extractContactInternalIds,
  buildKnowMeProfileUrlMap,
  mergeKnowMeProfileUrlsIntoItems,
  getKnowMeProfileUrlMap,
  getMissingKnowMeProfileUrlMap,
  applyKnowMeProfileUrlMapToTableModel,
  enrichItemsWithKnowMeProfileUrls,
  enrichTableModelWithKnowMeProfileUrls
};

export default KnowMeProfiles;
