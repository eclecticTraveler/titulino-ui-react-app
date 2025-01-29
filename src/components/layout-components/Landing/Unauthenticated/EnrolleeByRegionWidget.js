import React, {Component} from 'react'
import { Row, Col, Card } from 'antd';
import RegiondataWidget from 'components/shared-components/RegiondataWidget';
import IntlMessage from "components/util-components/IntlMessage";
import getLocaleText from "components/util-components/IntString";

const renderRegionTopEntrance = (
	<div className="mb-4">
	  <div className="d-flex align-items-center">
		{/* <Avatar size={20} src="/img/flags/us.png"/> */}
		<h2 className="mb-0 ml-2 font-weight-bold">37.61%</h2>
	  </div>
	  <span className="text-muted">Top entrance region</span>
	</div>
  )
//   const { data, mapSource, mapType, title, content, list } = props
export const EnrolleeByRegionWidget = ({enrolleeRegionData, mapSource, mapType, content}) => {  
	const locale = true;
	const setLocale = (isLocaleOn, localeKey) => {
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	};

	const setLocaleString = (isLocaleOn, localeKey, defaultMessage = "") => {
		return isLocaleOn
		  ? getLocaleText(localeKey, defaultMessage) // Uses the new function
		  : localeKey.toString(); // Falls back to the key if localization is off
	  };
	  console.log("CONTEST", enrolleeRegionData, mapSource, mapType)
	return (
	  <>
		<RegiondataWidget 
			title={setLocale(locale, "unauthenticated.dashboard.studentsByRegion")}
			data={enrolleeRegionData}
			mapSource={mapSource}
			mapType={mapType}
			// content={renderRegionTopEntrance}
		/>		
	  </>
	)
  }
  
  export default EnrolleeByRegionWidget
