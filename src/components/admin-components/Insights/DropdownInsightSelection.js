import React, { useState, useEffect } from 'react';
import { Select, Row, Col } from "antd";
import Flag from "react-world-flags";
import IntlMessage from "components/util-components/IntlMessage";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onGettingCountriesByLocationToDashboard, onLoadingAllDashboardContents } from "redux/actions/Analytics";

const { Option } = Select;

const DropdownInsightSelection = (props) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLocationType, setSelectedLocationType] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLocationTypeAllSelected, setIsLocationTypeAllSelected] = useState(false);
  const [countriesBySelectedLocationType, setCountriesBySelectedLocationType] = useState([]);
  const { allCourses, locationTypes, onGettingCountriesByLocationToDashboard, onLoadingAllDashboardContents } = props;

  // Example data based on your categories
  const CoursesOptions = allCourses ? [...allCourses] : [];
  const LocationTypeOptions = locationTypes ? [...locationTypes] : [];
  const CountryOptions = [...countriesBySelectedLocationType];
  const locale = true;
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  useEffect(() => {
    if (selectedCourse && selectedLocationType) {
      const fetchCountriesByLocationType = async () => {
        const countriesByLocation = await onGettingCountriesByLocationToDashboard(selectedCourse, selectedLocationType);
        const countriesByLocationList = Array.isArray(countriesByLocation?.countriesByLocationType) ? countriesByLocation?.countriesByLocationType : [];
        setCountriesBySelectedLocationType(countriesByLocationList);
      };
      fetchCountriesByLocationType();
    } else {
      setCountriesBySelectedLocationType([]);
    }
  }, [selectedLocationType, selectedCourse]);

  useEffect(() => {
    if (selectedCourse && selectedLocationType && selectedCountry) {
      // Unleash all the dashboards?
      onLoadingAllDashboardContents(selectedCourse, selectedLocationType, selectedCountry)
    } 
  }, [selectedLocationType, selectedCourse, selectedCountry]);

  const handleCourseSelection = (value) => {
    setSelectedCourse(value);
    setSelectedLocationType(null);
    setCountriesBySelectedLocationType([]);
    setSelectedCountry(null);
  };

  const handleLocationTypeSelection = (value) => {
    if(value?.toLowerCase() === "all"){
      setIsLocationTypeAllSelected(true);
    }else{
      setIsLocationTypeAllSelected(false);
    }
    setSelectedLocationType(value);
    setSelectedCountry(null);
  };

  

  return (
    <>
      <Row gutter={16}>
          <Col xs={24} sm={24} md={24} lg={8}>
              <Select
              placeholder="Select Course"
              style={{ width: "100%" }}
              value={selectedCourse}
              onChange={(value) => handleCourseSelection(value)}
            >
              {CoursesOptions?.map((course) => (
                <Option key={course?.index} value={course?.value}>
                  {course?.name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={24} md={24} lg={8}>
              <Select
              placeholder="Select Location Type"
              style={{ width: "100%" }}
              value={selectedLocationType}
              onChange={(value) => handleLocationTypeSelection(value)}
              disabled={!selectedCourse}
            >
              {LocationTypeOptions?.map((locationType) => (
                <Option key={locationType?.index} value={locationType?.value}>                  
                  {setLocale(locale, locationType?.name)}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={24} lg={8}>
              <Select
              placeholder="Select Country"
              style={{ width: "100%" }}
              value={selectedCountry}
              onChange={(value) => setSelectedCountry(value)}
              disabled={(!selectedLocationType || isLocationTypeAllSelected)}
            >
              {CountryOptions?.map((option) => (
                <Option key={option?.index} value={option?.value}>
                  <Flag code={option.value} style={{ width: 20, marginRight: 10 }} />
                  {`${option?.name}`}
                </Option>
              ))}
            </Select>
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


const mapStateToProps = ({ analytics }) => {
  const { allCourses, locationTypes } = analytics;
  return { allCourses, locationTypes };
};

export default connect(mapStateToProps, mapDispatchToProps)(DropdownInsightSelection);
