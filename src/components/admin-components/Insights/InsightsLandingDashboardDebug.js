import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs } from 'antd';
// import IntlMessage from 'components/util-components/IntlMessage';
// import DropdownInsightSelection from './DropdownInsightSelection';
import { faPersonThroughWindow, faPieChart, faMapPin } from '@fortawesome/free-solid-svg-icons';
import IconAdapter from "components/util-components/IconAdapter";
import { onRenderingAdminInsightsDashboard, onRenderingLocationTypeSelectionsToDashboard } from "redux/actions/Analytics";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// import CounterDisplay from 'components/layout-components/CounterDisplay';
// import DoubleCounterDisplay from 'components/layout-components/DoubleCounterDisplay';
// import BarGraph from 'components/layout-components/Graphs/BarGraph';
// import PieGraph from 'components/layout-components/Graphs/PieGraph';
// import ColumnBar from 'components/layout-components/Graphs/ColumnGraph';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
// import EnrolleeByRegionWidget from 'components/layout-components/Landing/Unauthenticated/EnrolleeByRegionWidget';
const { TabPane } = Tabs;

const InsightsLandingDashboard = (props) => {
  const { allCourses, onRenderingAdminInsightsDashboard, locationTypes, onRenderingLocationTypeSelectionsToDashboard, demographicDashboardData,
		  selectedCourseCodeId, selectedLocationType, selectedCountryId, overviewDashboardData
   } = props;

	const [activeKey, setActiveKey] = useState('1');

	const handleTabChange = (key) => {
		setActiveKey(key); // Update active tab key
	};

	// useEffect(() => {
	// 	// Load data only if necessary
	// 	if (!allCourses || !locationTypes) {
	// 	  if (!allCourses) {
	// 		onRenderingAdminInsightsDashboard();
	// 	  }
	// 	  if (!locationTypes) {
	// 		onRenderingLocationTypeSelectionsToDashboard();
	// 	  }
	// 	}
	//   }, [allCourses, locationTypes]);
	  
	  

  const converUrl = 'https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  const titleOfEnrollment = 'hello world';
  const locale = true;

	// const renderGeneralOverview = () => (
	// <>

	// </>
	// );


//   const setLocale = (isLocaleOn, localeKey) => {
//     return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
//   };

//   return (
//     <div className="container customerName">
//       <Card
//         loading={false}
//         bordered
//         cover={
//           <img
//             alt={titleOfEnrollment}
//             src={converUrl}
//             style={{ height: 100, objectFit: 'cover' }}
//           />
//         }
//       >
//         <h1 style={{ marginBottom: '10px', textAlign: 'left' }}>
//           Enrollee Insights
//         </h1>
//       </Card>

//       <Card
//         loading={false}
//         bordered
//         title={setLocale(locale, 'admin.dashboard.selections')}
//       >
//         <DropdownInsightSelection />
//       </Card>
//       <Card loading={false} bordered>
//         <Tabs defaultActiveKey="1">
// 			<TabPane 
// 			tab={
// 				<span>
// 				<IconAdapter icon={faPieChart} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />        
// 				{setLocale(locale, "resources.myprogress.generalView")}
// 				</span>
// 			} 
// 			onChange={handleTabChange} activeKey={activeKey}
// 			key="1"
// 			>
// 			{renderGeneralOverview()}
// 			</TabPane>
// 			<TabPane
// 				tab={
// 					<span>
// 					<IconAdapter icon={faPersonThroughWindow} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />        
// 					{setLocale(locale, "admin.dashboard.insights.enrolleeList")}
// 					</span>
// 				} 
// 				key="2"
// 				>
// 				<Row gutter={16}>
// 				<Col xs={24} sm={24} md={24} lg={8}>
// 					Hello
// 				</Col>
// 				</Row>
// 			</TabPane>
// 			<TabPane 
// 				tab={
// 					<span>
// 					<IconAdapter icon={faMapPin} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />        
// 					{setLocale(locale, "admin.dashboard.insights.demographics")}
// 					</span>
// 				} 
// 				key="3"
// 				>
// 				<Row gutter={16}>
// 					<Col xs={24} sm={24} md={24} lg={24}>
// 					{/* {demographicDashboardData && 
// 						<EnrolleeByRegionWidget 
// 						enrolleeRegionData={selectedLocationType?.toLowerCase() === "birth" ? 
// 											demographicDashboardData?.transformedArrays?.transformedBirthArray :
// 											demographicDashboardData?.transformedArrays?.transformedResidencyArray
// 						} 
// 						mapSource={demographicDashboardData?.mapJson}
// 						mapType={demographicDashboardData?.mapType}
// 						/>
// 					} */}
// 					</Col>
// 				</Row>
// 			</TabPane>
//         </Tabs>
//       </Card>
//     </div>
//   );

return (
	<>
	<div>HEllo World</div>
	</>
)
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
// export default InsightsLandingDashboard;