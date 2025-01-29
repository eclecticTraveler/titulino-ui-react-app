import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs } from 'antd';
import IntlMessage from 'components/util-components/IntlMessage';
import DropdownInsightSelection from './DropdownInsightSelection';
import { faRoad, faPieChart, faMapPin } from '@fortawesome/free-solid-svg-icons';
import IconAdapter from "components/util-components/IconAdapter";
import { onRenderingAdminInsightsDashboard, onRenderingLocationTypeSelectionsToDashboard } from "redux/actions/Analytics";
import { onLoadingEnrolleeByRegion } from "redux/actions/Lrn";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import CounterDisplay from 'components/layout-components/CounterDisplay';
import DoubleCounterDisplay from 'components/layout-components/DoubleCounterDisplay';
import BarGraph from 'components/layout-components/Graphs/BarGraph';
import PieGraph from 'components/layout-components/Graphs/PieGraph';
import ColumnBar from 'components/layout-components/Graphs/ColumnGraph';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import EnrolleeByRegionWidget from 'components/layout-components/Landing/Unauthenticated/EnrolleeByRegionWidget';
const { TabPane } = Tabs;

const InsightsLandingDashboard = (props) => {
  const { allCourses, onRenderingAdminInsightsDashboard, locationTypes, onRenderingLocationTypeSelectionsToDashboard, demographicDashboardData,
		  selectedCourseCodeId, selectedLocationType, selectedCountryId, overviewDashboardData, enrolleeCountByRegion, onLoadingEnrolleeByRegion
   } = props;

	const [activeKey, setActiveKey] = useState('1');

	const handleTabChange = (key) => {
		setActiveKey(key); // Update active tab key
	};

  useEffect(() => {
    // ComponentDidMount and ComponentDidUpdate logic can go here
	if(!allCourses){
		onRenderingAdminInsightsDashboard()
	}

	if(!locationTypes){
		onRenderingLocationTypeSelectionsToDashboard();
	}
  }, [allCourses, locationTypes]);

  useEffect(() => {
	if(!enrolleeCountByRegion){
		onLoadingEnrolleeByRegion()
	}
  }, [enrolleeCountByRegion]);

  

  const converUrl = 'https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  const titleOfEnrollment = 'hello world';
  const locale = true;

	const renderGeneralOverview = () => (
	<>
		<Row gutter={16}>
			<Col xs={24} sm={24} md={24} lg={8}>
			<CounterDisplay count={overviewDashboardData?.totalEnrollees} localizedTitle={"TotalEnrollees"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<BarGraph localizedTitle={"totalMalesVsFemales"} graphData={overviewDashboardData?.genderCount} passedValue={"count"} passedType={"sex"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<PieGraph localizedTitle={"genderPercentages"} graphData={overviewDashboardData?.genderPercentages} passedValue={"percentage"} passedType={"sex"}/>
			</Col>

			<Col xs={24} sm={24} md={24} lg={8}>
			<CounterDisplay count={overviewDashboardData?.averageGeneralAge} localizedTitle={"averageAge"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<DoubleCounterDisplay firstCount={overviewDashboardData?.averageMaleAge} secondCount={overviewDashboardData?.averageFemaleAge} localizedTitle={"avgMaleVsFemaleAge"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<BarGraph localizedTitle={"agesGroups"} graphData={overviewDashboardData?.agesPercentages} passedValue={"count"} passedType={"label"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<DoubleCounterDisplay firstCount={overviewDashboardData?.totalNewEnrollees} secondCount={overviewDashboardData?.totalReturningEnrollees} localizedTitle={"newVsReturning"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<BarGraph localizedTitle={"enrolleeType"} graphData={overviewDashboardData?.enrolleeTypes} passedValue={"percentage"} passedType={"type"} symbol={"%"}/>
			</Col>
			<Col xs={24} sm={24} md={24} lg={8}>
			<ColumnBar localizedTitle={"languageProficiency"} graphData={overviewDashboardData?.enrolleeProficiencyGroups} passedValue={"count"} passedType={"type"} symbol={""}/>
			</Col>
			{/* <Col xs={24} sm={24} md={24} lg={8}>
			<BarGraph localizedTitle={"languageProficiency"} graphData={overviewDashboardData?.enrolleeProficiencyGroups} passedValue={"percentage"} passedType={"type"} symbol={"%"}/>
			</Col> */}

		</Row>
	</>
	);


  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  return (
    <div className="container customerName">
      <Card
        loading={false}
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
        loading={false}
        bordered
        title={setLocale(locale, 'admin.dashboard.selections')}
      >
        <DropdownInsightSelection />
      </Card>
      <Card loading={false} bordered>
        <Tabs defaultActiveKey="1">
			<TabPane 
			tab={
				<span>
				<IconAdapter icon={faPieChart} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />        
				{setLocale(locale, "resources.myprogress.generalView")}
				</span>
			} 
			onChange={handleTabChange} activeKey={activeKey}
			key="1"
			>
			{renderGeneralOverview()}
			</TabPane>
			<TabPane tab="Ebook Renderer" key="2">
				<Row gutter={16}>
				<Col xs={24} sm={24} md={24} lg={8}>
					Hello
				</Col>
				</Row>
			</TabPane>
			<TabPane 
				tab={
					<span>
					<IconAdapter icon={faMapPin} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />        
					{setLocale(locale, "Demographics")}
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
		onRenderingLocationTypeSelectionsToDashboard: onRenderingLocationTypeSelectionsToDashboard,
		onLoadingEnrolleeByRegion: onLoadingEnrolleeByRegion
	}, dispatch);
}


const mapStateToProps = ({ analytics, lrn }) => {
  const { allCourses, locationTypes, selectedCourseCodeId, selectedLocationType, selectedCountryId, overviewDashboardData, demographicDashboardData } = analytics;
  const { enrolleeCountByRegion } = lrn;
  return { allCourses, locationTypes, selectedCourseCodeId, selectedLocationType, selectedCountryId, overviewDashboardData, enrolleeCountByRegion, demographicDashboardData };
};

export default connect(mapStateToProps, mapDispatchToProps)(InsightsLandingDashboard);