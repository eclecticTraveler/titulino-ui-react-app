const EMPTY_DASHBOARD = {
  possibleDuplicates: [],
  recentMerges: [],
  generatedAt: null
};

const getValue = (source = {}, ...keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== '') {
      return source[key];
    }
  }
  return null;
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
};

export const normalizeDuplicateCandidate = (candidate = {}, index = 0) => {
  const primaryContactInternalId = getValue(
    candidate,
    'PrimaryContactInternalId',
    'primaryContactInternalId',
    'PrimaryContactId',
    'primaryContactId'
  );
  const secondaryContactInternalId = getValue(
    candidate,
    'SecondaryContactInternalId',
    'secondaryContactInternalId',
    'SecondaryContactId',
    'secondaryContactId'
  );

  return {
    ...candidate,
    key: getValue(candidate, 'key') || [primaryContactInternalId, secondaryContactInternalId, index].filter(Boolean).join('|'),
    primaryContactInternalId,
    secondaryContactInternalId,
    primaryFullName: getValue(candidate, 'PrimaryFullName', 'primaryFullName', 'PrimaryName', 'primaryName'),
    secondaryFullName: getValue(candidate, 'SecondaryFullName', 'secondaryFullName', 'SecondaryName', 'secondaryName'),
    primaryDateOfBirth: getValue(candidate, 'PrimaryDateOfBirth', 'primaryDateOfBirth'),
    secondaryDateOfBirth: getValue(candidate, 'SecondaryDateOfBirth', 'secondaryDateOfBirth'),
    primaryEmailId: getValue(candidate, 'PrimaryEmailId', 'primaryEmailId', 'PrimaryEmail', 'primaryEmail'),
    secondaryEmailId: getValue(candidate, 'SecondaryEmailId', 'secondaryEmailId', 'SecondaryEmail', 'secondaryEmail'),
    confidenceScore: Number(getValue(candidate, 'ConfidenceScore', 'confidenceScore', 'score') || 0),
    matchReasons: toArray(getValue(candidate, 'MatchReasons', 'matchReasons', 'Reasons', 'reasons'))
  };
};

export const normalizeRecentMerge = (merge = {}, index = 0) => {
  const mergeId = getValue(merge, 'MergeId', 'mergeId', 'ContactMergeId', 'contactMergeId', 'Id', 'id');

  return {
    ...merge,
    key: mergeId || index,
    mergeId,
    primaryContactInternalId: getValue(merge, 'PrimaryContactInternalId', 'primaryContactInternalId'),
    secondaryContactInternalId: getValue(merge, 'SecondaryContactInternalId', 'secondaryContactInternalId'),
    primaryFullName: getValue(merge, 'PrimaryFullName', 'primaryFullName', 'PrimaryName', 'primaryName'),
    secondaryFullName: getValue(merge, 'SecondaryFullName', 'secondaryFullName', 'SecondaryName', 'secondaryName'),
    mergedBy: getValue(merge, 'MergedByEmailId', 'mergedByEmailId', 'ExecutedByEmailId', 'executedByEmailId', 'MergedBy', 'mergedBy'),
    mergedAt: getValue(merge, 'MergedAt', 'mergedAt', 'CreatedAt', 'createdAt'),
    reason: getValue(merge, 'Reason', 'reason', 'MergeReason', 'mergeReason'),
    rollbackEligible: getValue(merge, 'RollbackEligible', 'rollbackEligible', 'CanRollback', 'canRollback') !== false
  };
};

export const normalizeMergeDashboard = (apiResult = {}) => {
  const dashboard = Array.isArray(apiResult) ? apiResult[0] : apiResult;

  if (!dashboard || typeof dashboard !== 'object') return EMPTY_DASHBOARD;

  const possibleDuplicates = toArray(getValue(
    dashboard,
    'possibleDuplicates',
    'PossibleDuplicates',
    'duplicates',
    'Duplicates'
  )).map(normalizeDuplicateCandidate);
  const recentMerges = toArray(getValue(
    dashboard,
    'recentMerges',
    'RecentMerges',
    'mergeHistory',
    'MergeHistory'
  )).map(normalizeRecentMerge);

  return {
    possibleDuplicates,
    recentMerges,
    generatedAt: getValue(dashboard, 'generatedAt', 'GeneratedAt'),
    raw: dashboard
  };
};

export const normalizeDuplicateCandidates = (apiResult = []) => (
  toArray(apiResult).map(normalizeDuplicateCandidate)
);

export const buildMergeDashboardPayload = ({ duplicateLimit = 50, recentMergeLimit = 50 } = {}) => ({
  p_duplicate_limit: duplicateLimit,
  p_recent_merge_limit: recentMergeLimit
});

export const buildDuplicateDetectionPayload = ({ limit = 100 } = {}) => ({
  p_limit: limit
});

export const buildMergePreviewPayload = (primaryContactInternalId, secondaryContactInternalId) => ({
  p_primary_contact_internal_id: primaryContactInternalId,
  p_secondary_contact_internal_id: secondaryContactInternalId
});

export const buildMergeExecutionPayload = ({
  primaryContactInternalId,
  secondaryContactInternalId,
  profileOverrides = {},
  reason,
  executedByContactInternalId,
  executedByEmailId
}) => ({
  p_primary_contact_internal_id: primaryContactInternalId,
  p_secondary_contact_internal_id: secondaryContactInternalId,
  p_profile_overrides: profileOverrides || {},
  p_reason: reason,
  p_executed_by_contact_internal_id: executedByContactInternalId,
  p_executed_by_email_id: executedByEmailId
});

export const buildRollbackPayload = ({
  mergeId,
  reason,
  executedByContactInternalId,
  executedByEmailId
}) => ({
  p_merge_id: mergeId,
  p_reason: reason,
  p_executed_by_contact_internal_id: executedByContactInternalId,
  p_executed_by_email_id: executedByEmailId
});

export const isMergeMutationSuccessful = (result) => {
  if (result === true) return true;
  if (!result) return false;
  if (Array.isArray(result)) return result.length > 0 && !result.some(item => item?.Error || item?.error);
  if (result?.success === false || result?.Success === false || result?.Error || result?.error) return false;
  return result?.success === true || result?.Success === true || typeof result === 'object';
};

const ContactStewardship = {
  normalizeDuplicateCandidate,
  normalizeDuplicateCandidates,
  normalizeRecentMerge,
  normalizeMergeDashboard,
  buildMergeDashboardPayload,
  buildDuplicateDetectionPayload,
  buildMergePreviewPayload,
  buildMergeExecutionPayload,
  buildRollbackPayload,
  isMergeMutationSuccessful
};

export default ContactStewardship;
