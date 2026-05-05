import DashboardLayout from "lob/DashboardLayout";

const { dashboardLayoutCacheMinutes } = DashboardLayout;

export const getFacilitadorOverviewCardOrderCacheKey = (emailId, courseCodeId) => (
  `FacilitadorOverviewCardOrder_${encodeURIComponent((emailId || "anonymous").toString().trim().toLowerCase())}_${encodeURIComponent((courseCodeId || "global").toString().trim().toLowerCase())}`
);

export const normalizeFacilitadorOverviewCardOrder = (savedOrder = [], defaultOrder = []) => {
  return DashboardLayout.normalizeDashboardCardOrder(savedOrder, defaultOrder);
};

const FacilitadorDashboard = {
  dashboardLayoutCacheMinutes,
  getFacilitadorOverviewCardOrderCacheKey,
  normalizeFacilitadorOverviewCardOrder
};

export default FacilitadorDashboard;
