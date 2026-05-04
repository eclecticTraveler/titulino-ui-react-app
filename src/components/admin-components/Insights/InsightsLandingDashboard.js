import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Card, Tabs, Input, message } from 'antd';
import { useIntl } from 'react-intl';
import IntlMessage from 'components/util-components/IntlMessage';
import DropdownInsightSelection from './DropdownInsightSelection';
import { faPersonPraying, faPieChart, faMapPin, faPersonHiking, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { SearchOutlined } from '@ant-design/icons';
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
import CounterDisplay from 'components/layout-components/CounterDisplay';
import DoubleCounterDisplay from 'components/layout-components/DoubleCounterDisplay';
import BarGraph from 'components/layout-components/Graphs/BarGraph';
import PieGraph from 'components/layout-components/Graphs/PieGraph';
import ColumnBar from 'components/layout-components/Graphs/ColumnGraph';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import EnrolleeByRegionWidget from 'components/layout-components/Landing/Unauthenticated/EnrolleeByRegionWidget';
import AbstractTable from 'components/shared-components/Table/AbstractTable';
import TimelineTrendGraph from 'components/layout-components/Graphs/TimelineTrendGraph';
import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';
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
    user,
    onLoadingAllDashboardContents,
    onHydratingAnalyticsAvatars,
    avatarUrlMap,
    analyticsDashboardCardOrders,
    onLoadingAnalyticsDashboardCardOrder,
    onSavingAnalyticsDashboardCardOrder
  } = props;

  const intl = useIntl();
  const [activeOuterTabKey, setActiveOuterTabKey] = useState('general');
  const [activeInnerTabs, setActiveInnerTabs] = useState({
    general: 'general-overview',
    progress: 'progress-overview'
  });
	const [loading, setLoading] = useState(false);
	const [searchValue, setSearchValue] = useState('');
  	const [filteredEnrolleeData, setFilteredEnrolleeData] = useState([]);
	const [filteredProgressData, setFilteredProgressData] = useState([]);
  const [localDashboardCardOrders, setLocalDashboardCardOrders] = useState({});


	const handleAdminProgressSubmit = async (formattedData) => {
	try {
		console.log("Submitting admin progress:", formattedData, selectedCourseCodeId);

		// 1) submit (redux action)
		await onSubmittingAdminEnrolleeProgress(
		formattedData,
		selectedCourseCodeId, // ✅ from redux analytics state
		user?.emailId         // ✅ admin email for token/profile
		);

		message.success("Progress saved successfully!");

		// 2) refresh dashboards (recommended: reload current selection)
		if (selectedCourseCodeId && selectedLocationType && selectedCountryId && user?.emailId) {
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
		message.error("Error saving progress.");
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


	const handleInnerTabChange = (outerKey, key) => {
		setActiveInnerTabs((prev) => ({ ...prev, [outerKey]: key }));
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
    if (
      activeOuterTabKey !== 'general' ||
      activeInnerTabs.general !== 'general-enrollee-list' ||
      !user?.emailId ||
      !tableModelHasMissingAvatarResolutions(enrolleDashboardData, avatarUrlMap)
    ) {
      return;
    }

    onHydratingAnalyticsAvatars(user.emailId, avatarUrlMap, {
      enrolleDashboardData
    });
  }, [activeOuterTabKey, activeInnerTabs.general, enrolleDashboardData, user?.emailId, avatarUrlMap, onHydratingAnalyticsAvatars]);

  useEffect(() => {
    if (
      activeOuterTabKey !== 'progress' ||
      activeInnerTabs.progress !== 'progress-enrollee-list' ||
      !user?.emailId ||
      !tableModelHasMissingAvatarResolutions(enrolleesCourseProgressData, avatarUrlMap)
    ) {
      return;
    }

    onHydratingAnalyticsAvatars(user.emailId, avatarUrlMap, {
      enrolleesCourseProgressData
    });
  }, [activeOuterTabKey, activeInnerTabs.progress, enrolleesCourseProgressData, user?.emailId, avatarUrlMap, onHydratingAnalyticsAvatars]);

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
    )?.catch((error) => console.error("Error loading insights overview card order:", error));
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

  const handleDashboardCardOrderChange = (dashboardKey, nextCardOrder) => {
    setLocalDashboardCardOrders(prev => ({
      ...prev,
      [dashboardKey]: nextCardOrder
    }));

    onSavingAnalyticsDashboardCardOrder(
      dashboardKey,
      user?.emailId,
      selectedCourseCodeId,
      nextCardOrder,
      defaultInsightsOverviewCardOrder
    )?.catch((error) => console.error("Error saving insights overview card order:", error));
  };

  const renderOverviewGrid = (overviewData, dashboardKey) => {
    const overviewCards = [
      {
        key: 'totalEnrollees',
        content: <CounterDisplay localizedTitle={"admin.dashboard.insights.overview.totalEnrollees"} count={overviewData?.totalEnrollees} />
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
        onCardOrderChange={(nextCardOrder) => handleDashboardCardOrderChange(dashboardKey, nextCardOrder)}
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
    return renderOverviewGrid(progressOverviewData, insightsOverviewDashboardKey);
  };

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

	const setLocale = (isLocaleOn, localeKey) => {
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	};

	if(user?.emailId && !user?.yearOfBirth){
		return (
			<div id="unathenticated-landing-page-margin">
				<EmailYearSearchForm/>
			</div>
		)
	}

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
        onTabChange={setActiveOuterTabKey}
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
    onSavingAnalyticsDashboardCardOrder: onSavingAnalyticsDashboardCardOrder
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
    avatarUrlMap,
    analyticsDashboardCardOrders,
    user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InsightsLandingDashboard);
