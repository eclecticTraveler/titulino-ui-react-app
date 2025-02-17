import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Card, Tabs, Input } from 'antd';
import IntlMessage from 'components/util-components/IntlMessage';
import DropdownInsightSelection from './DropdownInsightSelection';
import { faPersonPraying, faPieChart, faMapPin } from '@fortawesome/free-solid-svg-icons';
import { SearchOutlined } from '@ant-design/icons';
import IconAdapter from "components/util-components/IconAdapter";
import { onRenderingAdminInsightsDashboard, onRenderingLocationTypeSelectionsToDashboard } from "redux/actions/Analytics";
import CounterDisplay from 'components/layout-components/CounterDisplay';
import DoubleCounterDisplay from 'components/layout-components/DoubleCounterDisplay';
import BarGraph from 'components/layout-components/Graphs/BarGraph';
import PieGraph from 'components/layout-components/Graphs/PieGraph';
import ColumnBar from 'components/layout-components/Graphs/ColumnGraph';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import EnrolleeByRegionWidget from 'components/layout-components/Landing/Unauthenticated/EnrolleeByRegionWidget';
import AbstractTable from 'components/shared-components/Table/AbstractTable';
const { TabPane } = Tabs;

const InsightsLandingDashboard = (props) => {
  const { allCourses, onRenderingAdminInsightsDashboard, locationTypes, onRenderingLocationTypeSelectionsToDashboard, demographicDashboardData,
		  selectedCourseCodeId, selectedLocationType, selectedCountryId, overviewDashboardData, enrolleDashboardData
   } = props;

	const [activeKey, setActiveKey] = useState('1');
	const [loading, setLoading] = useState(false);
	const [searchValue, setSearchValue] = useState('');
  	const [filteredData, setFilteredData] = useState(enrolleDashboardData?.tableData || []);


	const handleTabChange = (key) => {
		setActiveKey(key); // Update active tab key
	};

	const handleSearch = (event) => {
		const value = event.target.value.toLowerCase();
		setSearchValue(value);
	
		if (enrolleDashboardData?.tableData) {
		  const filtered = enrolleDashboardData.tableData.filter((item) =>
			['names', 'lastNames', 'age', 'enrolleeId', 'daysToBday', 'regionOfResidency', 'regionOfBirth'].some((key) =>
			  String(item[key]).toLowerCase().includes(value)
			)
		  );
		  setFilteredData(filtered);
		}
	  };
	

	useEffect(() => {
		if (enrolleDashboardData?.tableData) {
		  setFilteredData(enrolleDashboardData.tableData);
		}
	  }, [enrolleDashboardData]);

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
					<IconAdapter icon={faPersonPraying} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />        
					{setLocale(locale, "admin.dashboard.insights.enrolleeList")}
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
					{filteredData.length > 0 ? (
					<AbstractTable 
						tableData={filteredData}
						tableColumns={enrolleDashboardData?.columns}
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
				key="3"
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
		onRenderingLocationTypeSelectionsToDashboard: onRenderingLocationTypeSelectionsToDashboard
	}, dispatch);
}


const mapStateToProps = ({ analytics }) => {
  const { allCourses, locationTypes, selectedCourseCodeId, selectedLocationType, selectedCountryId, overviewDashboardData, demographicDashboardData, enrolleDashboardData } = analytics;
  return { allCourses, locationTypes, selectedCourseCodeId, selectedLocationType, selectedCountryId, overviewDashboardData, enrolleDashboardData, demographicDashboardData };
};

export default connect(mapStateToProps, mapDispatchToProps)(InsightsLandingDashboard);