import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { App, Row, Col, Card, Tabs, Input, Checkbox } from 'antd';
import { useIntl } from 'react-intl';
import IntlMessage from 'components/util-components/IntlMessage';
import DropdownInsightSelection from './DropdownInsightSelection';
import { faPersonPraying, faPieChart, faMapPin, faPersonHiking, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import IconAdapter from "components/util-components/IconAdapter";
import {
  onRenderingAdminInsightsDashboard,
  onRenderingLocationTypeSelectionsToDashboard,
  onSubmittingAdminEnrolleeProgress,
  onLoadingAllDashboardContents,
  onHydratingAnalyticsAvatars,
  onLoadingAnalyticsDashboardCardOrder,
  onSavingAnalyticsDashboardCardOrder
} from "redux/actions/Analytics";
import { onSessionTokenExpired } from "redux/actions/Grant";
import useSessionTokenExpiryGuard from "hooks/useSessionTokenExpiryGuard";
import CounterDisplay from 'components/layout-components/CounterDisplay';
import DoubleCounterDisplay from 'components/layout-components/DoubleCounterDisplay';
import BarGraph from 'components/layout-components/Graphs/BarGraph';
import PieGraph from 'components/layout-components/Graphs/PieGraph';
import ColumnBar from 'components/layout-components/Graphs/ColumnGraph';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import EnrolleeByRegionWidget from 'components/layout-components/Landing/Unauthenticated/EnrolleeByRegionWidget';
import AbstractTable from 'components/shared-components/Table/AbstractTable';
import TimelineTrendGraph from 'components/layout-components/Graphs/TimelineTrendGraph';
import DraggableDashboardGrid from 'components/shared-components/DraggableDashboardGrid';

const defaultInsightsOverviewCardOrder = [
  'totalEnrollees',
  'totalMalesVsFemales',
  'genderPercentages',
  'averageAge',
  'avgMaleVsFemaleAge',
  'ageGroups',
  'newVsReturning',
  'enrolleeType',
  'languageProficiencyCount',
  'languageProficiencyPercentage'
];

const insightsOverviewDashboardKey = 'insights-overview';

const innerTabKeysByKind = {
  overview: {
    general: 'general-overview',
    progress: 'progress-overview',
    shop: 'shop-overview'
  },
  list: {
    general: 'general-enrollee-list',
    progress: 'progress-enrollee-list',
    shop: 'shop-list'
  },
  demographics: {
    general: 'general-demographics',
    progress: 'progress-demographics',
    shop: 'shop-demographics'
  },
  trends: {
    general: 'general-trends',
    progress: 'progress-trends',
    shop: 'shop-trends'
  }
};

const getInnerTabKind = (tabKey) => (
  Object.entries(innerTabKeysByKind).find(([, tabsByOuter]) => (
    Object.values(tabsByOuter).includes(tabKey)
  ))?.[0] || null
);

const buildLockedInnerTabs = (tabKind) => (
  innerTabKeysByKind[tabKind] || {}
);

const normalizeContactInternalId = (value) => (
  value == null ? '' : String(value).trim().toLowerCase()
);

const hasAvatarResolution = (avatarUrlMap = {}, contactInternalId) => (
  Object.prototype.hasOwnProperty.call(avatarUrlMap || {}, normalizeContactInternalId(contactInternalId))
);

const tableModelHasMissingAvatarResolutions = (tableModel, avatarUrlMap = {}) => (
  (tableModel?.tableData || []).some(row => (
    row?.contactInternalId && !hasAvatarResolution(avatarUrlMap, row.contactInternalId)
  ))
);

const InsightsLandingDashboard = (props) => {
  const {
    allCourses,
    onRenderingAdminInsightsDashboard,
    locationTypes,
    onRenderingLocationTypeSelectionsToDashboard,
    demographicDashboardData,
    progressDemographicDashboardData,
    onSubmittingAdminEnrolleeProgress,
    selectedCourseCodeId,
    selectedLocationType,
    selectedCountryId,
    overviewDashboardData,
    overviewProgressDashboardData,
    enrolleDashboardData,
    enrolleesCourseProgressData,
    shopOverviewDashboardData,
    shopDemographicDashboardData,
    shopPurchaserDashboardData,
    user,
    onLoadingAllDashboardContents,
    onHydratingAnalyticsAvatars,
    avatarUrlMap,
    analyticsDashboardCardOrders,
    onLoadingAnalyticsDashboardCardOrder,
    onSavingAnalyticsDashboardCardOrder,
    onSessionTokenExpired
  } = props;
  const ensureValidSession = useSessionTokenExpiryGuard(user, onSessionTokenExpired);

  const intl = useIntl();
  const { message: messageApi } = App.useApp();
  const [activeOuterTabKey, setActiveOuterTabKey] = useState('general');
  const [activeInnerTabs, setActiveInnerTabs] = useState({
    general: 'general-overview',
    progress: 'progress-overview',
    shop: 'shop-overview'
  });
  const [areInnerTabsLocked, setAreInnerTabsLocked] = useState(false);
	const [loading, setLoading] = useState(false);
	const [searchValue, setSearchValue] = useState('');
  	const [filteredEnrolleeData, setFilteredEnrolleeData] = useState([]);
	const [filteredProgressData, setFilteredProgressData] = useState([]);
  const [filteredShopPurchaserData, setFilteredShopPurchaserData] = useState([]);
  const [localDashboardCardOrders, setLocalDashboardCardOrders] = useState({});


	const handleAdminProgressSubmit = async (formattedData) => {
	try {
		console.log("Submitting admin progress:", formattedData, selectedCourseCodeId);

		// 1) submit (redux action) — course-token-gated, not user.innerToken; no guard here
		await onSubmittingAdminEnrolleeProgress(
		formattedData,
		selectedCourseCodeId, // ✅ from redux analytics state
		user?.emailId         // ✅ admin email for token/profile
		);

		messageApi.success("Progress saved successfully!");

		// 2) refresh dashboards (recommended: reload current selection)
		if (selectedCourseCodeId && selectedLocationType && selectedCountryId && user?.emailId && ensureValidSession()) {
		await onLoadingAllDashboardContents(
			selectedCourseCodeId,
			selectedLocationType,
			selectedCountryId,
			user.emailId
		);
		} else {
		// fallback (if you prefer)
		onRenderingAdminInsightsDashboard();
		}

	} catch (error) {
		console.error("Error submitting admin progress:", error);
		messageApi.error("Error saving progress.");
	}
	};

	const handleEmailChange = (contactInternalId, email, progress) => {
		setFilteredProgressData(prev => prev.map(row => {
			if (row.contactInternalId === contactInternalId) {
				return {
					...row,
					selectedEmail: email,
					participationPercent: progress?.participationPercent ?? row.participationPercent,
					goldenPercent: progress?.goldenPercent ?? row.goldenPercent
				};
			}
			return row;
		}));
	};


  const handleOuterTabChange = (key) => {
    setActiveOuterTabKey(key);
  };

	const handleInnerTabChange = (outerKey, key) => {
    if (!areInnerTabsLocked) {
      setActiveInnerTabs((prev) => ({ ...prev, [outerKey]: key }));
      return;
    }

    const tabKind = getInnerTabKind(key);
    setActiveInnerTabs((prev) => ({
      ...prev,
      ...(tabKind ? buildLockedInnerTabs(tabKind) : { [outerKey]: key })
    }));
	};

  const handleInnerTabLockChange = (event) => {
    const checked = event.target.checked;
    setAreInnerTabsLocked(checked);

    if (!checked) return;

    const currentTabKind = getInnerTabKind(activeInnerTabs[activeOuterTabKey]);
    if (!currentTabKind) return;

    setActiveInnerTabs((prev) => ({
      ...prev,
      ...buildLockedInnerTabs(currentTabKind)
    }));
  };

	const handleSearch = (event) => {
		const value = event.target.value.toLowerCase();
		setSearchValue(value);

		if (enrolleDashboardData?.tableData) {
			const filtered = enrolleDashboardData.tableData.filter((item) =>
			Object.values(item)
				.join(" ")
				.toLowerCase()
				.includes(value)
			);

			setFilteredEnrolleeData(filtered);
		}

		if (enrolleesCourseProgressData?.tableData) {
			const filtered = enrolleesCourseProgressData.tableData.filter((item) =>
			Object.values(item)
				.join(" ")
				.toLowerCase()
				.includes(value)
			);

			setFilteredProgressData(filtered);
		}

    if (shopPurchaserDashboardData?.tableData) {
      const filtered = shopPurchaserDashboardData.tableData.filter((item) =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(value)
      );

      setFilteredShopPurchaserData(filtered);
    }
	};
	
	useEffect(() => {
		if (enrolleDashboardData?.tableData) {
			setFilteredEnrolleeData(enrolleDashboardData.tableData);
		}
	}, [enrolleDashboardData]);

	useEffect(() => {
		if (enrolleesCourseProgressData?.tableData) {
			setFilteredProgressData(enrolleesCourseProgressData.tableData);
		}
	}, [enrolleesCourseProgressData]);

  useEffect(() => {
    if (shopPurchaserDashboardData?.tableData) {
      setFilteredShopPurchaserData(shopPurchaserDashboardData.tableData);
    }
  }, [shopPurchaserDashboardData]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'general' ||
      activeInnerTabs.general !== 'general-enrollee-list' ||
      !user?.emailId ||
      !tableModelHasMissingAvatarResolutions(enrolleDashboardData, avatarUrlMap)
    ) {
      return;
    }
    if (!ensureValidSession()) return;

    onHydratingAnalyticsAvatars(user.emailId, avatarUrlMap, {
      enrolleDashboardData
    });
  }, [activeOuterTabKey, activeInnerTabs.general, enrolleDashboardData, user?.emailId, avatarUrlMap, onHydratingAnalyticsAvatars, ensureValidSession]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'progress' ||
      activeInnerTabs.progress !== 'progress-enrollee-list' ||
      !user?.emailId ||
      !tableModelHasMissingAvatarResolutions(enrolleesCourseProgressData, avatarUrlMap)
    ) {
      return;
    }
    if (!ensureValidSession()) return;

    onHydratingAnalyticsAvatars(user.emailId, avatarUrlMap, {
      enrolleesCourseProgressData
    });
  }, [activeOuterTabKey, activeInnerTabs.progress, enrolleesCourseProgressData, user?.emailId, avatarUrlMap, onHydratingAnalyticsAvatars, ensureValidSession]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'shop' ||
      activeInnerTabs.shop !== 'shop-list' ||
      !user?.emailId ||
      !tableModelHasMissingAvatarResolutions(shopPurchaserDashboardData, avatarUrlMap)
    ) {
      return;
    }
    if (!ensureValidSession()) return;

    onHydratingAnalyticsAvatars(user.emailId, avatarUrlMap, {
      shopPurchaserDashboardData
    });
  }, [activeOuterTabKey, activeInnerTabs.shop, shopPurchaserDashboardData, user?.emailId, avatarUrlMap, onHydratingAnalyticsAvatars, ensureValidSession]);

	useEffect(() => {
		// Load data only if necessary
		if (!allCourses || !locationTypes) {
		  if (!allCourses) {
			onRenderingAdminInsightsDashboard();
		  }
		  if (!locationTypes) {
			onRenderingLocationTypeSelectionsToDashboard();
		  }
		}
	  // eslint-disable-next-line react-hooks/exhaustive-deps
	  }, [allCourses, locationTypes]);

  useEffect(() => {
    setLocalDashboardCardOrders({
      [insightsOverviewDashboardKey]: defaultInsightsOverviewCardOrder
    });

    if (!selectedCourseCodeId || !user?.emailId) {
      return;
    }

    onLoadingAnalyticsDashboardCardOrder(
      insightsOverviewDashboardKey,
      user.emailId,
      selectedCourseCodeId,
      defaultInsightsOverviewCardOrder
    )?.catch((error) => console.error("Error loading insights dashboard card order:", error));
  }, [selectedCourseCodeId, user?.emailId, onLoadingAnalyticsDashboardCardOrder]);

  useEffect(() => {
    if (analyticsDashboardCardOrders && Object.keys(analyticsDashboardCardOrders).length) {
      setLocalDashboardCardOrders(prev => ({
        ...prev,
        ...analyticsDashboardCardOrders
      }));
    }
  }, [analyticsDashboardCardOrders]);
	  
	  

  const converUrl = 'https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  const titleOfEnrollment = 'insights';
  const locale = true;

  const handleDashboardCardOrderChange = (dashboardKey, nextCardOrder, defaultCardOrder = defaultInsightsOverviewCardOrder) => {
    setLocalDashboardCardOrders(prev => ({
      ...prev,
      [dashboardKey]: nextCardOrder
    }));

    onSavingAnalyticsDashboardCardOrder(
      dashboardKey,
      user?.emailId,
      selectedCourseCodeId,
      nextCardOrder,
      defaultCardOrder
    )?.catch((error) => console.error("Error saving insights dashboard card order:", error));
  };

  const renderOverviewGrid = (overviewData, dashboardKey, titleOverrides = {}) => {
    const overviewCards = [
      {
        key: 'totalEnrollees',
        content: <CounterDisplay localizedTitle={titleOverrides.totalEnrollees || "admin.dashboard.insights.overview.totalEnrollees"} count={overviewData?.totalEnrollees} />
      },
      {
        key: 'totalMalesVsFemales',
        content: <BarGraph localizedTitle={"admin.dashboard.insights.overview.totalMalesVsFemales"} graphData={overviewData?.genderCount} passedValue={"count"} passedType={"sex"} />
      },
      {
        key: 'genderPercentages',
        content: <PieGraph localizedTitle={"admin.dashboard.insights.overview.genderPercentages"} graphData={overviewData?.genderPercentages} passedValue={"percentage"} passedType={"sex"} />
      },
      {
        key: 'averageAge',
        content: <CounterDisplay localizedTitle={"admin.dashboard.insights.overview.averageAge"} count={overviewData?.averageGeneralAge} />
      },
      {
        key: 'avgMaleVsFemaleAge',
        content: (
          <DoubleCounterDisplay
            localizedTitle={"admin.dashboard.insights.overview.avgMaleVsFemaleAge"}
            firstCount={overviewData?.averageMaleAge}
            secondCount={overviewData?.averageFemaleAge}
            firstLabelKey={"enrollment.form.male"}
            secondLabelKey={"enrollment.form.female"}
          />
        )
      },
      {
        key: 'ageGroups',
        content: <BarGraph localizedTitle={"admin.dashboard.insights.overview.agesGroups"} graphData={overviewData?.agesPercentages} passedValue={"count"} passedType={"label"} />
      },
      {
        key: 'newVsReturning',
        content: (
          <DoubleCounterDisplay
            localizedTitle={"admin.dashboard.insights.overview.newVsReturning"}
            firstCount={overviewData?.totalNewEnrollees}
            secondCount={overviewData?.totalReturningEnrollees}
            firstLabelKey={"admin.dashboard.insights.overview.newEnrollees"}
            secondLabelKey={"admin.dashboard.insights.overview.returningEnrollees"}
          />
        )
      },
      {
        key: 'enrolleeType',
        content: <BarGraph localizedTitle={"admin.dashboard.insights.overview.enrolleeType"} graphData={overviewData?.enrolleeTypes} passedValue={"percentage"} passedType={"type"} symbol={"%"} />
      },
      {
        key: 'languageProficiencyCount',
        content: <ColumnBar localizedTitle={"admin.dashboard.insights.overview.languageProficiency"} graphData={overviewData?.enrolleeProficiencyGroups} passedValue={"count"} passedType={"type"} symbol={""} />
      },
      {
        key: 'languageProficiencyPercentage',
        content: <BarGraph localizedTitle={"admin.dashboard.insights.overview.languageProficiency"} graphData={overviewData?.enrolleeProficiencyGroups} passedValue={"percentage"} passedType={"type"} symbol={"%"} />
      }
    ];

    return (
      <DraggableDashboardGrid
        cards={overviewCards}
        cardOrder={localDashboardCardOrders[dashboardKey] || defaultInsightsOverviewCardOrder}
        onCardOrderChange={(nextCardOrder) => handleDashboardCardOrderChange(dashboardKey, nextCardOrder, defaultInsightsOverviewCardOrder)}
        gutter={16}
        colProps={{ xs: 24, sm: 24, md: 24, lg: 8 }}
      />
    );
  };

	const renderGeneralOverview = () => renderOverviewGrid(overviewDashboardData, insightsOverviewDashboardKey);

	const renderGeneralTrends = () => (
		<TimelineTrendGraph localizedTitle="admin.dashboard.insights.trends.enrollmentOverTime" dates={enrolleDashboardData?.enrollmentDates} enableGradientArea />
	);

	const renderProgressOverview = () => {
    const progressOverviewData = overviewProgressDashboardData ?? overviewDashboardData;
    return renderOverviewGrid(
      progressOverviewData,
      insightsOverviewDashboardKey,
      { totalEnrollees: "admin.dashboard.insights.progress.totalEnrolleesWithProgress" }
    );
  };

  const renderShopOverview = () => renderOverviewGrid(
    shopOverviewDashboardData,
    insightsOverviewDashboardKey,
    { totalEnrollees: "admin.dashboard.insights.shop.totalBuyers" }
  );

  const renderEnrolleeListTab = () => (
    <Row gutter={16}>
      <Col span={24}>
        <Input
          placeholder={intl.formatMessage({ id: "admin.dashboard.insights.search.placeholder" })}
          value={searchValue}
          onChange={handleSearch}
          prefix={<SearchOutlined />}
          style={{ marginBottom: 16 }}
        />
      </Col>
      <Col xs={24} sm={24} md={24} lg={24}>
        {filteredEnrolleeData.length > 0 ? (
          <AbstractTable
            tableData={filteredEnrolleeData}
            tableColumns={enrolleDashboardData?.columns}
            tableExpandables={enrolleDashboardData?.expandable}
            isAllowedToEditTableData={false}
            isToRenderActionButton={false}
            paginationConfig={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: ['25', '50'] }}
          />
        ) : (
          <p>{setLocale(locale, "admin.dashboard.insights.progress.noMatchingRecords")}</p>
        )}
      </Col>
    </Row>
  );

  const renderProgressListTab = () => (
    <Row gutter={16}>
      <Col span={24}>
        <Input
          placeholder={intl.formatMessage({ id: "admin.dashboard.insights.search.placeholder" })}
          value={searchValue}
          onChange={handleSearch}
          prefix={<SearchOutlined />}
          style={{ marginBottom: 16 }}
        />
      </Col>

      <Col xs={24} sm={24} md={24} lg={24}>
        {(() => {
          const progressTableData = enrolleesCourseProgressData?.tableData;

          const progressExpandableWithDelegate =
            enrolleesCourseProgressData?.expandable
              ? {
                  ...enrolleesCourseProgressData.expandable,
                  expandedRowRender: (record) =>
                    enrolleesCourseProgressData.expandable.expandedRowRender(
                      record,
                      handleAdminProgressSubmit,
                      handleEmailChange
                    )
                }
              : undefined;

          if (!progressTableData) {
            return <p>{setLocale(locale, "admin.dashboard.insights.progress.loadingData")}</p>;
          }

          if (progressTableData.length === 0) {
            return <p>{setLocale(locale, "admin.dashboard.insights.progress.noRecordsForSelection")}</p>;
          }

          if (filteredProgressData.length === 0) {
            return <p>{setLocale(locale, "admin.dashboard.insights.progress.noMatchingRecords")}</p>;
          }

          return (
            <AbstractTable
              tableData={filteredProgressData}
              tableColumns={enrolleesCourseProgressData?.columns}
              tableExpandables={progressExpandableWithDelegate}
              isAllowedToEditTableData={false}
              isToRenderActionButton={false}
            />
          );
        })()}
      </Col>
    </Row>
  );

  const renderShopListTab = () => {
    const purchaseTableData = shopPurchaserDashboardData?.tableData;

    return (
      <Row gutter={16}>
        <Col span={24}>
          <Input
            placeholder={intl.formatMessage({ id: "admin.dashboard.insights.search.placeholder" })}
            value={searchValue}
            onChange={handleSearch}
            prefix={<SearchOutlined />}
            style={{ marginBottom: 16 }}
          />
        </Col>

        <Col xs={24} sm={24} md={24} lg={24}>
          {!purchaseTableData ? (
            <p>{setLocale(locale, "admin.dashboard.insights.progress.loadingData")}</p>
          ) : purchaseTableData.length === 0 ? (
            <p>{setLocale(locale, "admin.dashboard.insights.shop.noPurchases")}</p>
          ) : filteredShopPurchaserData.length === 0 ? (
            <p>{setLocale(locale, "admin.dashboard.insights.progress.noMatchingRecords")}</p>
          ) : (
            <AbstractTable
              tableData={filteredShopPurchaserData}
              tableColumns={shopPurchaserDashboardData?.columns}
              tableExpandables={shopPurchaserDashboardData?.expandable}
              isAllowedToEditTableData={false}
              isToRenderActionButton={false}
            />
          )}
        </Col>
      </Row>
    );
  };

  const renderDemographicTab = (data) => (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={24} lg={24}>
        {data && (
          <EnrolleeByRegionWidget
            enrolleeRegionData={
              selectedLocationType?.toLowerCase() === "birth"
                ? data?.transformedArrays?.transformedBirthArray
                : data?.transformedArrays?.transformedResidencyArray
            }
            mapSource={data?.mapJson}
            mapType={data?.mapType}
          />
        )}
      </Col>
    </Row>
  );

  const renderShopDemographicsTab = () => renderDemographicTab(shopDemographicDashboardData);

  const renderShopTrends = () => {
    const purchaseDates = shopPurchaserDashboardData?.purchaseDates?.length
      ? shopPurchaserDashboardData.purchaseDates
      : shopPurchaserDashboardData?.enrollmentDates;

    return (
      <TimelineTrendGraph
        localizedTitle="admin.dashboard.insights.shop.purchasesOverTime"
        dates={purchaseDates}
        lineColor="#f08c00"
        enableGradientArea
      />
    );
  };

	const setLocale = (isLocaleOn, localeKey) => {
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	};

  const renderInnerTabLockControl = () => (
    <Checkbox
      checked={areInnerTabsLocked}
      onChange={handleInnerTabLockChange}
      style={{ marginRight: 16 }}
    >
      {setLocale(locale, "admin.dashboard.insights.lockInnerTabs")}
    </Checkbox>
  );

  const renderInnerTabsByOuter = (outerKey) => {
    const innerTabsByOuter = {
      general: [
        {
          key: 'general-overview',
          tab: (
            <span>
              <IconAdapter icon={faPieChart} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
              {setLocale(locale, "resources.myprogress.generalView")}
            </span>
          ),
          content: renderGeneralOverview()
        },
        {
          key: 'general-enrollee-list',
          tab: (
            <span>
              <IconAdapter icon={faPersonPraying} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
              {setLocale(locale, "admin.dashboard.insights.enrolleeList")}
            </span>
          ),
          content: renderEnrolleeListTab()
        },
        {
          key: 'general-demographics',
          tab: (
            <span>
              <IconAdapter icon={faMapPin} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
              {setLocale(locale, "admin.dashboard.insights.demographics")}
            </span>
          ),
          content: renderDemographicTab(demographicDashboardData)
        },
        {
          key: 'general-trends',
          tab: (
            <span>
              <IconAdapter icon={faChartLine} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
              {setLocale(locale, "admin.dashboard.insights.trends")}
            </span>
          ),
          content: renderGeneralTrends()
        }
      ],
      progress: [
        {
          key: 'progress-overview',
          tab: (
            <span>
              <IconAdapter icon={faPieChart} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
              {setLocale(locale, "admin.dashboard.insights.enrolleeProgress")}
            </span>
          ),
          content: renderProgressOverview()
        },
        {
          key: 'progress-enrollee-list',
          tab: (
            <span>
              <IconAdapter icon={faPersonHiking} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
              {setLocale(locale, "admin.dashboard.insights.enrolleeProgress")}
            </span>
          ),
          content: renderProgressListTab()
        },
        {
          key: 'progress-demographics',
          tab: (
            <span>
              <IconAdapter icon={faMapPin} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
              {setLocale(locale, "admin.dashboard.insights.demographics")}
            </span>
          ),
          content: renderDemographicTab(progressDemographicDashboardData ?? demographicDashboardData)
        },
        {
          key: 'progress-trends',
          tab: (
            <span>
              <IconAdapter icon={faChartLine} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
              {setLocale(locale, "admin.dashboard.insights.trends")}
            </span>
          ),
          content: <TimelineTrendGraph localizedTitle="admin.dashboard.insights.trends.progressOverTime" dates={enrolleesCourseProgressData?.progressDates} lineColor="#e35aff" enableGradientArea />
        }
      ],
      shop: [
        {
          key: 'shop-overview',
          tab: (
            <span>
              <IconAdapter icon={faPieChart} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
              {setLocale(locale, "admin.dashboard.insights.shop.general")}
            </span>
          ),
          content: renderShopOverview()
        },
        {
          key: 'shop-list',
          tab: (
            <span>
              <ShoppingCartOutlined style={{ marginRight: 6 }} />
              {setLocale(locale, "admin.dashboard.insights.shop.buyers")}
            </span>
          ),
          content: renderShopListTab()
        },
        {
          key: 'shop-demographics',
          tab: (
            <span>
              <IconAdapter icon={faMapPin} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
              {setLocale(locale, "admin.dashboard.insights.demographics")}
            </span>
          ),
          content: renderShopDemographicsTab()
        },
        {
          key: 'shop-trends',
          tab: (
            <span>
              <IconAdapter icon={faChartLine} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
              {setLocale(locale, "admin.dashboard.insights.trends")}
            </span>
          ),
          content: renderShopTrends()
        }
      ]
    };

    const tabsForOuter = innerTabsByOuter[outerKey] ?? [];
    return (
      <Tabs
        activeKey={activeInnerTabs[outerKey]}
        onChange={(key) => handleInnerTabChange(outerKey, key)}
        items={tabsForOuter.map((tabConfig) => ({
          key: tabConfig.key,
          label: tabConfig.tab,
          children: tabConfig.content,
        }))}
      />
    );
  };

  const outerTabsConfig = [
    {
      key: 'general',
      tab: (
        <span>
          <IconAdapter icon={faPieChart} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
          {setLocale(locale, "admin.dashboard.insights.outer.general")}
        </span>
      )
    },
    {
      key: 'progress',
      tab: (
        <span>
          <IconAdapter icon={faPersonHiking} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
          {setLocale(locale, "admin.dashboard.insights.outer.progress")}
        </span>
      )
    },
    {
      key: 'shop',
      tab: (
        <span>
          <ShoppingCartOutlined style={{ marginRight: 6 }} />
          {setLocale(locale, "admin.dashboard.insights.outer.shop")}
        </span>
      )
    }
  ];

  return (
    <div className="container customerName">
      <Card
        variant="outlined"
        cover={
          <img
            alt={titleOfEnrollment}
            src={converUrl}
            style={{ height: 100, objectFit: 'cover' }}
          />
        }
      >
        <h1 style={{ marginBottom: '10px', textAlign: 'left' }}>
          {setLocale(locale, 'admin.dashboard.insights.title')}
        </h1>
      </Card>

      <Card
        variant="outlined"
        title={setLocale(locale, 'admin.dashboard.selections')}
      >
        <DropdownInsightSelection setLoading={setLoading}/>
      </Card>
      <Card
        loading={loading}
        variant="outlined"
        tabList={outerTabsConfig}
        activeTabKey={activeOuterTabKey}
        onTabChange={handleOuterTabChange}
        tabBarExtraContent={{
          right: renderInnerTabLockControl()
        }}
      >
        {renderInnerTabsByOuter(activeOuterTabKey)}
      </Card>
    </div>
  );
};


function mapDispatchToProps(dispatch) {
	return bindActionCreators({
		onRenderingAdminInsightsDashboard: onRenderingAdminInsightsDashboard,
		onRenderingLocationTypeSelectionsToDashboard: onRenderingLocationTypeSelectionsToDashboard,
		onSubmittingAdminEnrolleeProgress: onSubmittingAdminEnrolleeProgress,
		onLoadingAllDashboardContents: onLoadingAllDashboardContents,
    onHydratingAnalyticsAvatars: onHydratingAnalyticsAvatars,
    onLoadingAnalyticsDashboardCardOrder: onLoadingAnalyticsDashboardCardOrder,
    onSavingAnalyticsDashboardCardOrder: onSavingAnalyticsDashboardCardOrder,
    onSessionTokenExpired
	}, dispatch);
}


const mapStateToProps = ({ analytics, grant }) => {
  const { user } = grant;
  const {
    allCourses,
    locationTypes,
    selectedCourseCodeId,
    selectedLocationType,
    selectedCountryId,
    overviewDashboardData,
    overviewProgressDashboardData,
    demographicDashboardData,
    progressDemographicDashboardData,
    enrolleDashboardData,
    enrolleesCourseProgressData,
    shopOverviewDashboardData,
    shopDemographicDashboardData,
    shopPurchaserDashboardData,
    avatarUrlMap,
    analyticsDashboardCardOrders
  } = analytics;
  return {
    allCourses,
    locationTypes,
    selectedCourseCodeId,
    selectedLocationType,
    selectedCountryId,
    overviewDashboardData,
    overviewProgressDashboardData,
    enrolleDashboardData,
    demographicDashboardData,
    progressDemographicDashboardData,
    enrolleesCourseProgressData,
    shopOverviewDashboardData,
    shopDemographicDashboardData,
    shopPurchaserDashboardData,
    avatarUrlMap,
    analyticsDashboardCardOrders,
    user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InsightsLandingDashboard);
