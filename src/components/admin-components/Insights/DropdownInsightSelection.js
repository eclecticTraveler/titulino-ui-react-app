import React, { useState, useEffect } from 'react';
import { Select, Row, Col } from "antd";
import Flag from "react-world-flags";
import { useIntl } from 'react-intl';
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
  const { allCourses, locationTypes, onGettingCountriesByLocationToDashboard, onLoadingAllDashboardContents, setLoading, user } = props;

  const CoursesOptions = allCourses ? [...allCourses] : [];
  const LocationTypeOptions = locationTypes ? [...locationTypes] : [];
  const CountryOptions = [...countriesBySelectedLocationType];
  const intl = useIntl();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocationType, selectedCourse, selectedCountry]);


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

  

  return (
    <>
      <Row gutter={16}>
          <Col xs={24} sm={24} md={24} lg={8}>
              <Select
              placeholder={intl.formatMessage({ id: "admin.dashboard.insights.selectCourse" })}
              style={{ width: "100%" }}
              value={selectedCourse}
              size="medium"
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
              placeholder={intl.formatMessage({ id: "admin.dashboard.insights.selectLocationType" })}
              style={{ width: "100%" }}
              value={selectedLocationType}
              size="medium"
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
              placeholder={intl.formatMessage({ id: "admin.dashboard.insights.selectCountry" })}
              style={{ width: "100%" }}
              value={selectedCountry}
              onChange={(value) => setSelectedCountry(value)}
              size="medium"
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


const mapStateToProps = ({ analytics, grant }) => {
  const { user } = grant;
  const { allCourses, locationTypes } = analytics;
  return { allCourses, locationTypes, user };
};

export default connect(mapStateToProps, mapDispatchToProps)(DropdownInsightSelection);
