import React from 'react'
import RegiondataWidget from 'components/shared-components/RegiondataWidget';
import IntlMessage from "components/util-components/IntlMessage";

export const EnrolleeByRegionWidget = ({
	enrolleeRegionData,
	mapSource,
	mapType,
	content,
	zoomable = true,
	showRegionList = true
}) => {
	const locale = true;
	const setLocale = (isLocaleOn, localeKey) => {
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	};

	return (
	  <>
		<RegiondataWidget 
			title={setLocale(locale, "unauthenticated.dashboard.studentsByRegion")}
			data={enrolleeRegionData}
			mapSource={mapSource}
			mapType={mapType}
			content={content} //renderRegionTopEntrance
			zoomable={zoomable}
			showRegionList={showRegionList}
		/>		
	  </>
	)
  }
  
  export default EnrolleeByRegionWidget
