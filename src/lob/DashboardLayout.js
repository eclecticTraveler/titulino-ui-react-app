const dashboardLayoutCacheMinutes = 60 * 24 * 30;

const normalizeStorageScope = (value, fallback) => {
  const normalized = value == null ? "" : String(value).trim().toLowerCase();
  return encodeURIComponent(normalized || fallback);
};

export const getDashboardCardOrderCacheKey = (dashboardKey, emailId, courseCodeId) => (
  `DashboardCardOrder_${normalizeStorageScope(dashboardKey, "dashboard")}_${normalizeStorageScope(emailId, "anonymous")}_${normalizeStorageScope(courseCodeId, "global")}`
);

export const normalizeDashboardCardOrder = (savedOrder = [], defaultOrder = []) => {
  const defaultKeys = defaultOrder.filter(Boolean);
  const defaultKeySet = new Set(defaultKeys);
  const seenKeys = new Set();
  const orderedKeys = [];

  if (Array.isArray(savedOrder)) {
    savedOrder.forEach((cardKey) => {
      if (defaultKeySet.has(cardKey) && !seenKeys.has(cardKey)) {
        orderedKeys.push(cardKey);
        seenKeys.add(cardKey);
      }
    });
  }

  defaultKeys.forEach((cardKey) => {
    if (!seenKeys.has(cardKey)) {
      orderedKeys.push(cardKey);
    }
  });

  return orderedKeys;
};

const DashboardLayout = {
  dashboardLayoutCacheMinutes,
  getDashboardCardOrderCacheKey,
  normalizeDashboardCardOrder
};

export default DashboardLayout;
