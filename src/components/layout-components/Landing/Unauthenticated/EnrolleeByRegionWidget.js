import React from 'react'
import RegiondataWidget from 'components/shared-components/RegiondataWidget';
import IntlMessage from "components/util-components/IntlMessage";

export const EnrolleeByRegionWidget = ({enrolleeRegionData, mapSource, mapType, content}) => {  
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
		/>		
	  </>
	)
  }
  
  export default EnrolleeByRegionWidget
