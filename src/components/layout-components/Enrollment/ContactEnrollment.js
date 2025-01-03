import React, { useState, useEffect, useRef  } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onRequestingGeographicalDivision } from "redux/actions/Lrn";
import { Form, Input, Radio, Select, DatePicker, Checkbox, Button, Card, Divider, Row, Col, Space  } from "antd";
import Flag from "react-world-flags"; // Correct import for flags
import moment from "moment";
import IntlMessage from "components/util-components/IntlMessage";
import getLocaleText from "components/util-components/IntString";
const { Option } = Select;

export const ContactEnrollment = (props) => {
  const { countries, selfLanguageLevel, onRequestingGeographicalDivision, selectedEmail, selectedYearOfBirth,
     onEmailChange, onFormSubmit, form, setResetChildStates, enrollmentStyle, submittingLoading } = props;
  const [selectedCountryOfResidence, setSelectedCountryOfResidence] = useState(null);
  const [selectedBirthCountry, setSelectedBirthCountry] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [birthDivisions, setBirthDivisions] = useState([]);
  const locale = true;
    
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };
 
  const setLocaleString = (isLocaleOn, localeKey, defaultMessage = "") => {
    return isLocaleOn
      ? getLocaleText(localeKey, defaultMessage) // Uses the new function
      : localeKey.toString(); // Falls back to the key if localization is off
  };

  // Reset function for the child states
  const resetChildStates = () => {
    setSelectedCountryOfResidence(null);
    setSelectedBirthCountry(null);
    setDivisions([]);
    setBirthDivisions([]);
  };

  // Register the reset function with the parent
  useEffect(() => {
    if (setResetChildStates) {
      setResetChildStates(() => resetChildStates); // Pass the resetChildStates function to the parent
    }
  }, [setResetChildStates]);

 // Fetch divisions for country of residence
 useEffect(() => {
  if (selectedCountryOfResidence) {
    const fetchDivisions = async () => {
      const divisions = await onRequestingGeographicalDivision(selectedCountryOfResidence);
      setDivisions(Array.isArray(divisions?.countryDivisions) ? divisions?.countryDivisions : []); // Ensure it's an array
    };
    fetchDivisions();
  }
}, [selectedCountryOfResidence]);

  // Fetch divisions for country of birth
  useEffect(() => {
    console.log("selectedBirthCountry", selectedBirthCountry)
    if (selectedBirthCountry) {
      const fetchBirthDivisions = async () => {
        const birthDivisions = await onRequestingGeographicalDivision(selectedBirthCountry);
        setBirthDivisions(Array.isArray(birthDivisions?.countryDivisions) ? birthDivisions?.countryDivisions : []); // Ensure it's an array
      };
      fetchBirthDivisions();
    }
  }, [selectedBirthCountry]);


  useEffect(() => {
    form.setFieldsValue({ emailAddress: selectedEmail });
  }, [selectedEmail]);
  

  const filterOption = (input, option) => {
    const children = option.children; // Get children from the option
    // Check if children is a string or an array
    const label = typeof children === "string" ? children : children[1]; // Get the country name
    return label.toLowerCase().includes(input.toLowerCase());
  };

  const onFinish = (values) => {
    console.log("Child form values:", values);
    onFormSubmit(values); // Pass the values back to the parent for further processing
  };

  return (
    <div className="container customerName" >
      <Card style={enrollmentStyle} title={setLocale(locale, "enrollment.form.contactEmail")} loading={submittingLoading} bordered={true}>
        <Form.Item
          name="emailAddress"
          rules={[
            { required: true, message: setLocaleString(locale, "profile.login.validEmail") },
            { type: "email", message: setLocaleString(locale, "enrollment.invalidEmail") },
          ]}
        >
          <Input
            placeholder="Enter your contact email"
            value={selectedEmail} // Use the processed value from the parent
            onChange={(e) => onEmailChange(e.target.value)} // Delegate to the parent handler
          />
        </Form.Item>
      </Card>


      <Card  style={enrollmentStyle} title={setLocale(locale, "enrollment.form.languageLevel")} loading={submittingLoading} bordered={true}>
      <Form.Item name="languageLevelAbbreviation" 
      rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectLanguageLevelForCourse") }]}
      >
          <Radio.Group>
            <Space direction="vertical">
              {selfLanguageLevel?.map((level) => (
                <Radio key={level?.LevelAbbreviation} value={level?.LevelAbbreviation}>
                  {setLocale(locale, level.LocalizationKey)}
                </Radio>
              ))}
            </Space>
          </Radio.Group>        
        </Form.Item>
      </Card>

      <Card  style={enrollmentStyle} title={setLocale(locale, "enrollment.form.personalInfo")} loading={submittingLoading} bordered={true}>
          <Form.Item name="lastNames" label={setLocale(locale, "enrollment.form.lastNames")} 
          rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.enterLastNames") }]}>
            <Input placeholder="Enter your last names" />
          </Form.Item>

          <Form.Item name="names" label={setLocale(locale, "enrollment.form.names")} 
          rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.enterFirstMiddleName") }]}>
            <Input placeholder="Enter your first and/or middle name" />
          </Form.Item>

          <Form.Item name="dateOfBirth" label={setLocale(locale, "enrollment.form.dateOfBirth")} 
            rules={[{ required: true, message: setLocaleString(locale, "enrollment.selectDateOfBirth") }]}>
          <DatePicker
            style={{ width: "100%" }}
            disabledDate={(current) => current && current > moment().endOf("day")}
            defaultPickerValue={moment(`${selectedYearOfBirth}-01-01`, "YYYY-MM-DD")} // Opens on selected year from parent component by default
          />
        </Form.Item>

        <Form.Item name="sex" label={setLocale(locale, "enrollment.form.gender")} 
        rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectGender") }]} >
          <Radio.Group>
            <Radio value="M">{setLocale(locale, "enrollment.form.male")}</Radio>
            <Radio value="F">{setLocale(locale, "enrollment.form.female")}</Radio>
          </Radio.Group>
        </Form.Item>
      </Card>


      <Card style={enrollmentStyle} title={setLocale(locale, "enrollment.form.geography")} loading={submittingLoading} bordered={true}>
         <Form.Item name="countryOfResidence" label={setLocale(locale, "enrollment.form.countryOfResidency")} 
         rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectCountryOfResidence") }]}>
          <Select
            showSearch
            placeholder="Select your country of residence"
            optionFilterProp="children"
            onChange={(value) => {
              setSelectedCountryOfResidence(value); // Update selected country
              setDivisions([]); // Reset divisions for residence
              form.setFieldsValue({ countryDivisionOfResidence: null }); // Clear form division value
            }}
            filterOption={filterOption}
          >
            {countries?.map((country) => (
              <Option key={country.CountryId} value={country.CountryId}>
                <Flag code={country.CountryId} style={{ width: 20, marginRight: 10 }} />
                {`${country?.NativeCountryName} | ${country?.CountryName}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedCountryOfResidence && (
        <Form.Item name="countryDivisionOfResidence" label={setLocale(locale, "enrollment.form.stateOrRegion")} 
        rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectStateOrRegion") }]}>
            <Select
            showSearch
            placeholder="Select a state/region where you currently live"
            optionFilterProp="children"
            >
            {divisions?.map((division) => (
                <Option key={division?.CountryDivisionId} value={division?.CountryDivisionId}>
                  <Flag code={division?.CountryId} style={{ width: 20, marginRight: 10 }} />
                {division?.CountryDivisionName}
                </Option>
            ))}
            </Select>
        </Form.Item>
        )}
      
        <Form.Item name="countryOfBirth" label={setLocale(locale, "enrollment.form.countryOfNationalityOfBirth")} 
        rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectCountryOfBirth") }]}>
          <Select
            showSearch
            placeholder="Select country of nationality of birth"
            optionFilterProp="children"
            onChange={(value) => {
              setSelectedBirthCountry(value); // Update selected country
              setBirthDivisions([]); // Reset divisions for birth country
              form.setFieldsValue({ countryDivisionOfBirth: null }); // Clear form division value
            }}
            filterOption={filterOption}
          >
            {countries?.map((country) => (
              <Option key={country.CountryId} value={country.CountryId}>
                <Flag code={country.CountryId} style={{ width: 20, marginRight: 10 }} />
                {`${country?.NativeCountryName} | ${country?.CountryName}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedBirthCountry && (
        <Form.Item name="countryDivisionOfBirth" label={setLocale(locale, "enrollment.form.stateOrRegionOfBirth")} 
        rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectStateOrRegionOfBirth") }]}>
            <Select
            showSearch
            placeholder="Select state/region of nationality of birth"
            optionFilterProp="children"            
            >
            {birthDivisions?.map((division) => (
                <Option key={division.CountryDivisionId} value={division.CountryDivisionId}>
                  <Flag code={division?.CountryId} style={{ width: 20, marginRight: 10 }} />
                {division.CountryDivisionName}
                </Option>
            ))}
            </Select>
        </Form.Item>
        )}

       </Card>
  </div>



     );
};


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        onRequestingGeographicalDivision: onRequestingGeographicalDivision
    }, dispatch);
}


const mapStateToProps = ({ lrn }) => {
  const { countries, selfLanguageLevel, countryDivisions } = lrn;
  return { countries, selfLanguageLevel, countryDivisions };
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactEnrollment);
