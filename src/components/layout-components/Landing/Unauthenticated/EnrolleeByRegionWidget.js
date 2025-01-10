import React, {Component} from 'react'
import { Row, Col, Card } from 'antd';
import RegiondataWidget from 'components/shared-components/RegiondataWidget';
import IntlMessage from "components/util-components/IntlMessage";

const rederRegionTopEntrance = (
	<div className="mb-4">
	  <div className="d-flex align-items-center">
		{/* <Avatar size={20} src="/img/flags/us.png"/> */}
		<h2 className="mb-0 ml-2 font-weight-bold">37.61%</h2>
	  </div>
	  <span className="text-muted">Top entrance region</span>
	</div>
  )

export const EnrolleeByRegionWidget = ({enrolleeRegionData}) => {  
	const locale = true;
	const setLocale = (isLocaleOn, localeKey) => {
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	};
	return (
	  <>
		<RegiondataWidget 
			title={setLocale(locale, "unauthenticated.dashboard.studentsByRegion")}
			data={enrolleeRegionData}
			// content={rederRegionTopEntrance}
		/>
	  </>
	)
  }
  
  export default EnrolleeByRegionWidget
