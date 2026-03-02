import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Card, Tabs, Input, message } from 'antd';
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
const { TabPane } = Tabs;

const InsightsLandingDashboard = (props) => {
  const { allCourses, onRenderingAdminInsightsDashboard, locationTypes, onRenderingLocationTypeSelectionsToDashboard, demographicDashboardData, onSubmittingAdminEnrolleeProgress,
		  selectedCourseCodeId, selectedLocationType, selectedCountryId, overviewDashboardData, enrolleDashboardData, enrolleesCourseProgressData, user, onLoadingAllDashboardContents
   } = props;

	const [activeKey, setActiveKey] = useState('1');
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


	const handleTabChange = (key) => {
		setActiveKey(key); // Update active tab key
	};

	const handleSearch = (event) => {
		const value = event.target.value.toLowerCase();
		setSearchValue(value);

		if (activeKey === "3" && enrolleDashboardData?.tableData) {
			const filtered = enrolleDashboardData.tableData.filter((item) =>
			Object.values(item)
				.join(" ")
				.toLowerCase()
				.includes(value)
			);

			setFilteredEnrolleeData(filtered);
		}

		if (activeKey === "2" && enrolleesCourseProgressData?.tableData) {
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
		setSearchValue("");

		if (activeKey === "3" && enrolleDashboardData?.tableData) {
			setFilteredEnrolleeData(enrolleDashboardData.tableData);
		}

		if (activeKey === "2" && enrolleesCourseProgressData?.tableData) {
			setFilteredProgressData(enrolleesCourseProgressData.tableData);
		}
		}, [activeKey]);

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
	  }, [allCourses, locationTypes]);
	  
	  

  const converUrl = 'https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  const titleOfEnrollment = 'insights';
  const locale = true;

	const renderGeneralOverview = () => (
	<>
		<Row gutter={16}>
			<Col xs={24} sm={24} md={24} lg={8}>
			<CounterDisplay localizedTitle={"admin.dashboard.insights.overview.totalEnrollees"} count={overviewDashboardData?.totalEnrollees}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<BarGraph localizedTitle={"admin.dashboard.insights.overview.totalMalesVsFemales"} graphData={overviewDashboardData?.genderCount} passedValue={"count"} passedType={"sex"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<PieGraph localizedTitle={"admin.dashboard.insights.overview.genderPercentages"} graphData={overviewDashboardData?.genderPercentages} passedValue={"percentage"} passedType={"sex"}/>
			</Col>

			<Col xs={24} sm={24} md={24} lg={8}>
			<CounterDisplay localizedTitle={"admin.dashboard.insights.overview.averageAge"} count={overviewDashboardData?.averageGeneralAge} />
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<DoubleCounterDisplay localizedTitle={"admin.dashboard.insights.overview.avgMaleVsFemaleAge"} firstCount={overviewDashboardData?.averageMaleAge} secondCount={overviewDashboardData?.averageFemaleAge} />
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<BarGraph localizedTitle={"admin.dashboard.insights.overview.agesGroups"} graphData={overviewDashboardData?.agesPercentages} passedValue={"count"} passedType={"label"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<DoubleCounterDisplay localizedTitle={"admin.dashboard.insights.overview.newVsReturning"} firstCount={overviewDashboardData?.totalNewEnrollees} secondCount={overviewDashboardData?.totalReturningEnrollees}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<BarGraph localizedTitle={"admin.dashboard.insights.overview.enrolleeType"} graphData={overviewDashboardData?.enrolleeTypes} passedValue={"percentage"} passedType={"type"} symbol={"%"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<ColumnBar localizedTitle={"admin.dashboard.insights.overview.languageProficiency"} graphData={overviewDashboardData?.enrolleeProficiencyGroups} passedValue={"count"} passedType={"type"} symbol={""}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<BarGraph localizedTitle={"admin.dashboard.insights.overview.languageProficiency"} graphData={overviewDashboardData?.enrolleeProficiencyGroups} passedValue={"percentage"} passedType={"type"} symbol={"%"}/>
			</Col>
		</Row>
	</>
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

  return (
    <div className="container customerName">
      <Card
        bordered
        cover={
          <img
            alt={titleOfEnrollment}
            src={converUrl}
            style={{ height: 100, objectFit: 'cover' }}
          />
        }
      >
        <h1 style={{ marginBottom: '10px', textAlign: 'left' }}>
          Enrollee Insights
        </h1>
      </Card>

      <Card
        bordered
        title={setLocale(locale, 'admin.dashboard.selections')}
      >
        <DropdownInsightSelection setLoading={setLoading}/>
      </Card>
      <Card loading={loading} bordered>
        <Tabs activeKey={activeKey} onChange={handleTabChange}>
			<TabPane 
			tab={
				<span>
				<IconAdapter icon={faPieChart} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />        
				{setLocale(locale, "resources.myprogress.generalView")}
				</span>
			} 
			key="1"
			>
			{renderGeneralOverview()}
			</TabPane>
			<TabPane
			tab={
				<span>
				<IconAdapter icon={faPersonHiking} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />
				{setLocale(locale, "admin.dashboard.insights.enrolleeProgress")}
				</span>
			}
			key="2"
			>
			<Row gutter={16}>
				<Col span={24}>
				<Input
					placeholder="Search by names, last names, or age"
					value={searchValue}
					onChange={handleSearch}
					prefix={<SearchOutlined />}
					style={{ marginBottom: 16 }}
				/>
				</Col>

				<Col xs={24} sm={24} md={24} lg={24}>
				{(() => {
					// 1) Raw redux table data (the truth)
					const progressTableData = enrolleesCourseProgressData?.tableData;

					// 2) Inject the submit delegate into expandedRowRender
					const progressExpandableWithDelegate =
					enrolleesCourseProgressData?.expandable
						? {
							...enrolleesCourseProgressData.expandable,
							expandedRowRender: (record) =>
							enrolleesCourseProgressData.expandable.expandedRowRender(
								record,
								handleAdminProgressSubmit
							)
						}
						: undefined;

					// 3) Render states:
					// - Not loaded yet
					if (!progressTableData) {
					return <p>Loading progress data...</p>;
					}

					// - Loaded but empty (API returned no rows)
					if (progressTableData.length === 0) {
					return <p>No records returned for this selection.</p>;
					}

					// - Loaded but search filter removed everything
					if (filteredProgressData.length === 0) {
					return <p>No matching records found.</p>;
					}

					// - Normal render
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
			</TabPane>	
			<TabPane
				tab={
					<span>
					<IconAdapter icon={faPersonPraying} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />        
					{setLocale(locale, "admin.dashboard.insights.enrolleeList")}
					</span>
				} 
				key="3"
				>
				<Row gutter={16}>
				<Col span={24}>
					<Input
					placeholder="Search by names, last names, or age"
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
					<p>No matching records found.</p>
					)}
				</Col>
				</Row>
			</TabPane>
			<TabPane 
				tab={
					<span>
					<IconAdapter icon={faMapPin} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />        
					{setLocale(locale, "admin.dashboard.insights.demographics")}
					</span>
				} 
				key="4"
				>
				<Row gutter={16}>
					<Col xs={24} sm={24} md={24} lg={24}>
					{demographicDashboardData && 
						<EnrolleeByRegionWidget 
						enrolleeRegionData={selectedLocationType?.toLowerCase() === "birth" ? 
											demographicDashboardData?.transformedArrays?.transformedBirthArray :
											demographicDashboardData?.transformedArrays?.transformedResidencyArray
						} 
						mapSource={demographicDashboardData?.mapJson}
						mapType={demographicDashboardData?.mapType}
						/>
					}
					</Col>
				</Row>
			</TabPane>
        </Tabs>
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
  const { allCourses, locationTypes, selectedCourseCodeId, selectedLocationType, selectedCountryId, overviewDashboardData, demographicDashboardData, enrolleDashboardData, enrolleesCourseProgressData } = analytics;
  return { allCourses, locationTypes, selectedCourseCodeId, selectedLocationType, selectedCountryId, overviewDashboardData, enrolleDashboardData, demographicDashboardData, enrolleesCourseProgressData, user };
};

export default connect(mapStateToProps, mapDispatchToProps)(InsightsLandingDashboard);