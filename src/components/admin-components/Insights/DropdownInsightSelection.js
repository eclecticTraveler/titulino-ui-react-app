import React, { useState, useEffect } from 'react';
import { Select, Row, Col } from "antd";
import Flag from "react-world-flags";
import IntlMessage from "components/util-components/IntlMessage";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onGettingCountriesByLocationToDashboard, onLoadingAllDashboardContents } from "redux/actions/Analytics";

const DropdownInsightSelection = (props) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLocationType, setSelectedLocationType] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLocationTypeAllSelected, setIsLocationTypeAllSelected] = useState(false);
  const [countriesBySelectedLocationType, setCountriesBySelectedLocationType] = useState([]);
  const { allCourses, locationTypes, onGettingCountriesByLocationToDashboard, onLoadingAllDashboardContents, setLoading, user } = props;

  const CoursesOptions = allCourses ? [...allCourses] : [];
  const LocationTypeOptions = locationTypes ? [...locationTypes] : [];
  const CountryOptions = [...countriesBySelectedLocationType];
  const locale = true;
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  useEffect(() => {
    let isMounted = true;
    if (selectedCourse && selectedLocationType) {
      const fetchCountriesByLocationType = async () => {
        const countriesByLocation = await onGettingCountriesByLocationToDashboard(selectedCourse, selectedLocationType);
        if (isMounted) {
          const countriesByLocationList = Array.isArray(countriesByLocation?.countriesByLocationType)
            ? countriesByLocation?.countriesByLocationType
            : [];
          setCountriesBySelectedLocationType(countriesByLocationList);
        }
      };
      fetchCountriesByLocationType();
    } else {
      setCountriesBySelectedLocationType([]);
    }
    return () => {
      isMounted = false;
    };
  }, [selectedLocationType, selectedCourse, onGettingCountriesByLocationToDashboard]);
  
  

  useEffect(() => {
    if (selectedCourse && selectedLocationType && selectedCountry && user?.emailId) {
      setLoading(true); // Start loading
      // Unleash all the dashboards?
      onLoadingAllDashboardContents(selectedCourse, selectedLocationType, selectedCountry, user?.emailId)
      ?.finally(() => setLoading(false)); // Stop loading after data fetch
    } 
  }, [selectedLocationType, selectedCourse, selectedCountry, onLoadingAllDashboardContents, setLoading, user?.emailId]);


  const handleCourseSelection = (value) => {
    setSelectedCourse(value);
    setSelectedLocationType(null);
    setSelectedCountry(null);
    setCountriesBySelectedLocationType([]);
  };
  

  const handleLocationTypeSelection = (value) => {
    if(value?.toLowerCase() === "all"){
      setIsLocationTypeAllSelected(true);
      setSelectedCountry("All")
    }else{
      setIsLocationTypeAllSelected(false);
      setSelectedCountry(null);
    }
    setSelectedLocationType(value);
  };

  const courseSelectOptions = CoursesOptions?.map((course) => ({
    value: course?.value,
    label: course?.name
  }));

  const locationSelectOptions = LocationTypeOptions?.map((locationType) => ({
    value: locationType?.value,
    label: setLocale(locale, locationType?.name)
  }));

  const countrySelectOptions = CountryOptions?.map((option) => ({
    value: option?.value,
    label: (
      <>
        <Flag code={option?.value} style={{ width: 20, marginRight: 10 }} />
        {option?.name}
      </>
    )
  }));

  return (
    <>
      <Row gutter={16}>
          <Col xs={24} sm={24} md={24} lg={8}>
            <Select
              size="large"
              placeholder="Select Course"
              className="insights-dashboard-select"
              style={{ width: "100%" }}
              value={selectedCourse}
              onChange={(value) => handleCourseSelection(value)}
              options={courseSelectOptions}
            />
          </Col>

          <Col xs={24} sm={24} md={24} lg={8}>
            <Select
              size="large"
              placeholder="Select Location Type"
              className="insights-dashboard-select"
              style={{ width: "100%" }}
              value={selectedLocationType}
              onChange={(value) => handleLocationTypeSelection(value)}
              disabled={!selectedCourse}
              options={locationSelectOptions}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={8}>
            <Select
              size="large"
              placeholder="Select Country"
              className="insights-dashboard-select"
              style={{ width: "100%" }}
              value={selectedCountry}
              onChange={(value) => setSelectedCountry(value)}
              disabled={(!selectedLocationType || isLocationTypeAllSelected)}
              options={countrySelectOptions}
            />
          </Col>
        </Row>
    </>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onGettingCountriesByLocationToDashboard: onGettingCountriesByLocationToDashboard,
    onLoadingAllDashboardContents: onLoadingAllDashboardContents
  }, dispatch);
}


const mapStateToProps = ({ analytics, grant }) => {
  const { user } = grant;
  const { allCourses, locationTypes } = analytics;
  return { allCourses, locationTypes, user };
};

export default connect(mapStateToProps, mapDispatchToProps)(DropdownInsightSelection);
