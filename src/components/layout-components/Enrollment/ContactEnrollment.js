import React, { useState, useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onRequestingGeographicalDivision } from "redux/actions/Lrn";
import { Form, Input, Radio, Select, DatePicker, Card, Space  } from "antd";
import Flag from "react-world-flags"; // Correct import for flags
import dayjs from "dayjs";
import { useIntl } from 'react-intl';
import IntlMessage from "components/util-components/IntlMessage";
import getLocaleText from "components/util-components/IntString";
import EnrollmentProfilePictureField from "./EnrollmentProfilePictureField";

export const ContactEnrollment = (props) => {
  const { countries, selfLanguageLevel, onRequestingGeographicalDivision, selectedEmail, selectedYearOfBirth, selectedDateOfBirth,
     onEmailChange, form, setResetChildStates, enrollmentStyle, submittingLoading, selectedCoursesToEnroll, availableCourses,
     isProfilePictureRequirementEnabled = false, profilePictureContactInternalId = null, profilePictureToken = null,
     skipExistingProfilePictureLookup = false } = props;
  const [selectedCountryOfResidence, setSelectedCountryOfResidence] = useState(null);
  const [selectedBirthCountry, setSelectedBirthCountry] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [birthDivisions, setBirthDivisions] = useState([]);
  const locale = true;
  const intl = useIntl();
  const watchedEmailAddress = Form.useWatch("emailAddress", form);
  const watchedDateOfBirth = Form.useWatch("dateOfBirth", form);
    console.log("----->selectedDateOfBirth", selectedDateOfBirth)
    console.log("selectedCoursesToEnroll", selectedCoursesToEnroll);
  const getLanguageName = (id) => {
    const map = {
      en: "English",
      es: "Español",
      pt: "Português"
      // add more if needed
    };
    return map[id] || id;
  };

  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };
 
  const setLocaleString = (isLocaleOn, localeKey, defaultMessage = "") => {
    return isLocaleOn
      ? getLocaleText(localeKey, defaultMessage) // Uses the new function
      : localeKey.toString(); // Falls back to the key if localization is off
  };

  const countryOptions = useMemo(() => (
    (countries || []).map((country) => ({
      value: country.CountryId,
      searchText: `${country?.NativeCountryName} | ${country?.CountryName}`,
      label: (
        <>
          <Flag code={country.CountryId} style={{ width: 20, marginRight: 10 }} />
          {`${country?.NativeCountryName} | ${country?.CountryName}`}
        </>
      )
    }))
  ), [countries]);

  const residencyDivisionOptions = useMemo(() => (
    (divisions || []).map((division) => ({
      value: division?.CountryDivisionId,
      searchText: division?.CountryDivisionName || "",
      label: (
        <>
          <Flag code={division?.CountryId} style={{ width: 20, marginRight: 10 }} />
          {division?.CountryDivisionName}
        </>
      )
    }))
  ), [divisions]);

  const birthDivisionOptions = useMemo(() => (
    (birthDivisions || []).map((division) => ({
      value: division?.CountryDivisionId,
      searchText: division?.CountryDivisionName || "",
      label: (
        <>
          <Flag code={division?.CountryId} style={{ width: 20, marginRight: 10 }} />
          {division?.CountryDivisionName}
        </>
      )
    }))
  ), [birthDivisions]);

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
// eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBirthCountry]);


  useEffect(() => {
    form.setFieldsValue({ emailAddress: selectedEmail });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmail]);
  

  const filterOption = (input, option) => {
    const searchText = option?.searchText || "";
    return searchText.toLowerCase().includes(input.toLowerCase());
  };

  const profilePictureEmail = watchedEmailAddress || selectedEmail || null;
  const profilePictureDobOrYob = watchedDateOfBirth || selectedDateOfBirth || selectedYearOfBirth || null;

  return (
    <div className="container customerName" >
      <Card style={enrollmentStyle} title={setLocale(locale, "enrollment.form.contactEmail")} loading={submittingLoading} variant="outlined">
        <Form.Item
          name="emailAddress"
          rules={[
            { required: true, message: setLocaleString(locale, "profile.login.validEmail") },
            { type: "email", message: setLocaleString(locale, "enrollment.invalidEmail") },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({ id: "enrollment.form.enterContactEmail" })}
            value={selectedEmail} // Use the processed value from the parent
            onChange={(e) => onEmailChange(e.target.value)} // Delegate to the parent handler
          />
        </Form.Item>
      </Card>

      <>
        {Array.from(
          new Set(
            (selectedCoursesToEnroll?.length > 0
              ? availableCourses?.filter(course =>
                  selectedCoursesToEnroll?.includes(course.CourseCodeId)
                )
              : availableCourses
            )?.map(course => course?.TargetLanguageId).filter(Boolean)
          )
        ).map((langId, index, allLanguages) => {
          const isSingle = allLanguages.length === 1;
          const fieldName = isSingle
            ? "languageLevelAbbreviation"
            : `languageLevelAbbreviation_${langId}`;
          const languageName = getLanguageName(langId);

          return (
            <Card
              key={langId}
              style={enrollmentStyle}
              title={
                isSingle
                  ? <p>{setLocale(locale, "enrollment.form.languageLevelForCourseIn")} {languageName}?</p>
                  : setLocale(locale, "enrollment.form.languageLevelForCourse")
              }
              loading={submittingLoading}
              variant="outlined"
            >
              <Form.Item
                name={fieldName}
                rules={[
                  {
                    required: true,
                    message: setLocaleString(locale, "enrollment.form.selectLanguageLevelForCourse")
                  },
                ]}
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
          );
        })}
      </>


      <Card  style={enrollmentStyle} title={setLocale(locale, "enrollment.form.personalInfo")} loading={submittingLoading} variant="outlined">
          <Form.Item name="lastNames" label={setLocale(locale, "enrollment.form.lastNames")} 
          rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.enterLastNames") }]}>
            <Input placeholder={intl.formatMessage({ id: "enrollment.form.enterLastNames" })} />
          </Form.Item>

          <Form.Item name="names" label={setLocale(locale, "enrollment.form.names")} 
          rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.enterFirstMiddleName") }]}>
            <Input placeholder={intl.formatMessage({ id: "enrollment.form.enterFirstMiddleName" })} />
          </Form.Item>

        <Form.Item name="dateOfBirth" label={setLocale(locale, "enrollment.form.dateOfBirth")}
          rules={[{ required: true, message: setLocaleString(locale, "enrollment.selectDateOfBirth") }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            disabledDate={(current) => current && current > dayjs().endOf("day")}
            defaultPickerValue={
              selectedDateOfBirth 
                ? dayjs(selectedDateOfBirth, "YYYY-MM-DD")
                : selectedYearOfBirth
                ? dayjs(`${selectedYearOfBirth}-01-01`, "YYYY-MM-DD")
                : undefined // Opens on selected date or year from parent component by default
            }
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

      <EnrollmentProfilePictureField
        isEnabled={isProfilePictureRequirementEnabled && !!profilePictureEmail && !!profilePictureDobOrYob}
        emailId={profilePictureEmail}
        dobOrYob={profilePictureDobOrYob}
        contactInternalId={profilePictureContactInternalId}
        token={profilePictureToken}
        skipExistingProfileLookup={skipExistingProfilePictureLookup}
        enrollmentStyle={enrollmentStyle}
        submittingLoading={submittingLoading}
      />


      <Card style={enrollmentStyle} title={setLocale(locale, "enrollment.form.geography")} loading={submittingLoading} variant="outlined">
         <Form.Item name="countryOfResidence" label={setLocale(locale, "enrollment.form.countryOfResidency")} 
         rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectCountryOfResidence") }]}>
          <Select
            showSearch
            optionFilterProp="searchText"
            filterOption={filterOption}
            placeholder={intl.formatMessage({ id: "enrollment.form.selectCountryOfResidence" })}
            onChange={(value) => {
              setSelectedCountryOfResidence(value); // Update selected country
              setDivisions([]); // Reset divisions for residence
              form.setFieldsValue({ countryDivisionOfResidence: null }); // Clear form division value
            }}
            options={countryOptions}
          />
        </Form.Item>

        {selectedCountryOfResidence && (
        <Form.Item name="countryDivisionOfResidence" label={setLocale(locale, "enrollment.form.stateOrRegion")} 
        rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectStateOrRegion") }]}>
            <Select
              showSearch
              optionFilterProp="searchText"
              filterOption={filterOption}
              placeholder={intl.formatMessage({ id: "enrollment.form.selectStateOrRegion" })}
              options={residencyDivisionOptions}
            />
        </Form.Item>
        )}
      
        <Form.Item name="countryOfBirth" label={setLocale(locale, "enrollment.form.countryOfNationalityOfBirth")} 
        rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectCountryOfBirth") }]}>
          <Select
            showSearch
            optionFilterProp="searchText"
            filterOption={filterOption}
            placeholder={intl.formatMessage({ id: "enrollment.form.selectCountryOfBirth" })}
            onChange={(value) => {
              setSelectedBirthCountry(value); // Update selected country
              setBirthDivisions([]); // Reset divisions for birth country
              form.setFieldsValue({ countryDivisionOfBirth: null }); // Clear form division value
            }}
            options={countryOptions}
          />
        </Form.Item>

        {selectedBirthCountry && (
        <Form.Item name="countryDivisionOfBirth" label={setLocale(locale, "enrollment.form.stateOrRegionOfBirth")} 
        rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectStateOrRegionOfBirth") }]}>
            <Select
              showSearch
              optionFilterProp="searchText"
              filterOption={filterOption}
              placeholder={intl.formatMessage({ id: "enrollment.form.selectStateOrRegionOfBirth" })}
              options={birthDivisionOptions}
            />
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
  const { countries, selfLanguageLevel, countryDivisions, selectedCoursesToEnroll, availableCourses } = lrn;
  return { countries, selfLanguageLevel, countryDivisions, selectedCoursesToEnroll, availableCourses };
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactEnrollment);
