import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Card, Tabs, Input, message } from 'antd';
import { useIntl } from 'react-intl';
import IntlMessage from 'components/util-components/IntlMessage';
import DropdownInsightSelection from './DropdownInsightSelection';
import { faPersonPraying, faPieChart, faMapPin, faPersonHiking } from '@fortawesome/free-solid-svg-icons';
import { SearchOutlined } from '@ant-design/icons';
import IconAdapter from "components/util-components/IconAdapter";
import { onRenderingAdminInsightsDashboard, onRenderingLocationTypeSelectionsToDashboard, onSubmittingAdminEnrolleeProgress, onLoadingAllDashboardContents } from "redux/actions/Analytics";
import CounterDisplay from 'components/layout-components/CounterDisplay';
import DoubleCounterDisplay from 'components/layout-components/DoubleCounterDisplay';
import BarGraph from 'components/layout-components/Graphs/BarGraph';
import PieGraph from 'components/layout-components/Graphs/PieGraph';
import ColumnBar from 'components/layout-components/Graphs/ColumnGraph';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import EnrolleeByRegionWidget from 'components/layout-components/Landing/Unauthenticated/EnrolleeByRegionWidget';
import AbstractTable from 'components/shared-components/Table/AbstractTable';
import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';

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
    onLoadingAllDashboardContents
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
	  
	  

  const converUrl = 'https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  const titleOfEnrollment = 'insights';
  const locale = true;

  const renderOverviewGrid = (data) => (
	<>
		<Row gutter={16}>
			<Col xs={24} sm={24} md={24} lg={8}>
			<CounterDisplay localizedTitle={"admin.dashboard.insights.overview.totalEnrollees"} count={data?.totalEnrollees}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<BarGraph localizedTitle={"admin.dashboard.insights.overview.totalMalesVsFemales"} graphData={data?.genderCount} passedValue={"count"} passedType={"sex"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<PieGraph localizedTitle={"admin.dashboard.insights.overview.genderPercentages"} graphData={data?.genderPercentages} passedValue={"percentage"} passedType={"sex"}/>
			</Col>

			<Col xs={24} sm={24} md={24} lg={8}>
			<CounterDisplay localizedTitle={"admin.dashboard.insights.overview.averageAge"} count={data?.averageGeneralAge} />
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<DoubleCounterDisplay localizedTitle={"admin.dashboard.insights.overview.avgMaleVsFemaleAge"} firstCount={data?.averageMaleAge} secondCount={data?.averageFemaleAge} />
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<BarGraph localizedTitle={"admin.dashboard.insights.overview.agesGroups"} graphData={data?.agesPercentages} passedValue={"count"} passedType={"label"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<DoubleCounterDisplay localizedTitle={"admin.dashboard.insights.overview.newVsReturning"} firstCount={data?.totalNewEnrollees} secondCount={data?.totalReturningEnrollees}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<BarGraph localizedTitle={"admin.dashboard.insights.overview.enrolleeType"} graphData={data?.enrolleeTypes} passedValue={"percentage"} passedType={"type"} symbol={"%"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<ColumnBar localizedTitle={"admin.dashboard.insights.overview.languageProficiency"} graphData={data?.enrolleeProficiencyGroups} passedValue={"count"} passedType={"type"} symbol={""}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<BarGraph localizedTitle={"admin.dashboard.insights.overview.languageProficiency"} graphData={data?.enrolleeProficiencyGroups} passedValue={"percentage"} passedType={"type"} symbol={"%"}/>
			</Col>
		</Row>
	</>
	);

	const renderGeneralOverview = () => renderOverviewGrid(overviewDashboardData);

	const renderProgressOverview = () => {
    const progressOverviewData = overviewProgressDashboardData ?? overviewDashboardData;
    return renderOverviewGrid(progressOverviewData);
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
		onLoadingAllDashboardContents: onLoadingAllDashboardContents
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
    enrolleesCourseProgressData
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
    user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InsightsLandingDashboard);
