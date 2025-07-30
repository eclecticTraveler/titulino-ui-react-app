import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onRenderingCourseRegistration, onSearchingForAlreadyEnrolledContact, onRequestingGeographicalDivision, onSubmittingEnrollee, onResetSubmittingEnrollee, onSelectingEnrollmentCourses } from "redux/actions/Lrn";
import { Form, Input, Select, DatePicker, Button, Card, Row, Col, Spin, Radio, Space, Tabs  } from "antd";
import moment from "moment";
import Flag from "react-world-flags";
import CourseCards from "./CourseCards";
import CourseDetails from "./CourseDetails";
import IntlMessage from "components/util-components/IntlMessage";
import getLocaleText from "components/util-components/IntString";
import TermsModal from "./TermsModal";
import EnrollmentModal from "./EnrollmentModal";
import { useHistory } from 'react-router-dom';

const { Option } = Select;

export const AuthenticatedQuickEnrollment = (props) => {
  const { availableCourses, onSearchingForAlreadyEnrolledContact, onRequestingGeographicalDivision, nativeLanguage, passedSubmitBtnEnabled,
         onSubmittingEnrollee, selfLanguageLevel, wasSubmittingEnrolleeSucessful, countries, user, token, selectedCoursesToEnroll, onSelectingEnrollmentCourses } = props;
  const [form] = Form.useForm();
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [isGeographyInfoVisible, setGeographyInfoVisible] = useState(false);
  const [selectedCountryOfResidence, setSelectedCountryOfResidence] = useState(null);
  const [selectedBirthCountry, setSelectedBirthCountry] = useState(null);
  const [residencyDivisions, setDivisions] = useState([]); // Load divisions based on selected country
  const [birthDivisions, setBirthDivisions] = useState([]);
  const [isSubmitEnabled, setSubmitEnabled] = useState(passedSubmitBtnEnabled ?? false);
  const [loading, setLoading] = useState(false);
  const [returningEnrolleeCountryDivisionInfo, setReturningEnrolleeCountryDivisionInfo] = useState(null);
  const [enrolleeResidencyDivision, setEnrolleeResidencyDivision] = useState("");
  const [enrolleeBirthDivision, setEnrolleeBirthDivision] = useState("");
  const [isEnrollmentModalVisible, setIsEnrollmentModalVisible] = useState(false);
  const [submittingLoading, setSubmittingLoading] = useState(false);
  const [submittedRecords, setSubmittingRecords] = useState([]);
  const history = useHistory();
  const locale = true;


    const setLocale = (isLocaleOn, localeKey) => {
      return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
    };

    const setLocaleString = (isLocaleOn, localeKey, defaultMessage = "") => {
      return isLocaleOn
        ? getLocaleText(localeKey, defaultMessage) // Uses the new function
        : localeKey.toString(); // Falls back to the key if localization is off
    };  
    
    useEffect(() => {
      if (submittedRecords?.length > 0) {    
        const upsertFormattedData = async () => {
          const upsertedRecords = await onSubmittingEnrollee(submittedRecords, null);
          const wasSuccessful = upsertedRecords?.wasSubmittingEnrolleeSucessful;
          if (wasSuccessful === true) {
            setIsEnrollmentModalVisible(true);
          } else if (wasSuccessful === false) {
            console.log("wasSuccessful", wasSuccessful);
            setIsEnrollmentModalVisible(false);
          }
        };
        upsertFormattedData();
      }
    }, [submittedRecords]);
    
  
    const handleCloseModal = () => {
      setIsEnrollmentModalVisible(false); // Close modal when user clicks close button
      resetQuickEnrollmentInputValues();
    };

  useEffect(() => {
    const checkFormValidity = async () => {
      try {
        const values = await form.validateFields(); // Trigger validation for all fields
        //setSubmitEnabled(true); 
      } catch (error) {
        console.log("Form invalid", error);
      }
    };

    checkFormValidity(); // Run validation on form change
  }, [form]);

  useEffect(() => {
    if(returningEnrolleeCountryDivisionInfo?.countryOfResidencyId){
      setSelectedCountryOfResidence(returningEnrolleeCountryDivisionInfo?.countryOfResidencyId)
    }

    if(returningEnrolleeCountryDivisionInfo?.countryOfBirthId){
      setSelectedBirthCountry(returningEnrolleeCountryDivisionInfo?.countryOfBirthId)
    }

    setConfirmVisible(true);
  }, [returningEnrolleeCountryDivisionInfo]);


useEffect(() => {
  if (selectedCountryOfResidence) {
    const fetchDivisions = async () => {
      const divisions = await onRequestingGeographicalDivision(selectedCountryOfResidence);
      const divisionList = Array.isArray(divisions?.countryDivisions) ? divisions?.countryDivisions : [];
      setDivisions(divisionList);
      
      // Clear the field if no divisions are available
      if (divisionList?.length === 0) {
        form.setFieldsValue({ countryDivisionOfResidence: null });
      }
    };
    fetchDivisions();
  } else {
    setDivisions([]); // Reset if no country is selected
  }
}, [selectedCountryOfResidence]);

useEffect(() => {
  if (selectedBirthCountry) {
    const fetchBirthDivisions = async () => {
      const birthDivisions = await onRequestingGeographicalDivision(selectedBirthCountry);
      const divisionList = Array.isArray(birthDivisions?.countryDivisions) ? birthDivisions?.countryDivisions : [];
      setBirthDivisions(divisionList);

      // Clear the field if no divisions are available
      if (divisionList?.length === 0) {
        form.setFieldsValue({ countryDivisionOfBirth: null });
      }
    };
    fetchBirthDivisions();
  } else {
    setBirthDivisions([]); // Reset if no country is selected
  }
}, [selectedBirthCountry]);

useEffect(() => {

  if (token && user?.contactId) {
    const onFindMe = async () => {
      setSubmitEnabled(false);
      setLoading(true); // Start loading
      const year = user?.yearOfBirth;
      const email = user?.emailId;
      if (year && email) {
        try {
          const enrolleeInformation = await onSearchingForAlreadyEnrolledContact(email, year);
          setReturningEnrolleeCountryDivisionInfo(enrolleeInformation?.returningEnrollee ?? null);          
          if(enrolleeInformation?.returningEnrollee?.contactExternalId){
            setGeographyInfoVisible(true);
            setSubmitEnabled(true);
          }
        } catch (error) {
          console.error("Error searching for enrollee:", error);
          setReturningEnrolleeCountryDivisionInfo(null); // Handle errors gracefully
        }
      } 
      setLoading(false); // Stop loading
    };

    onFindMe();
  }
}, [token, user?.contactId]);

 
const formatSubmissionData = (
    values,
    {
      nativeLanguage,
      enrolledCourses,
      countries
    },
    matchedEnrolleeInfo,
    user
  ) => {
  
    const {
      lastNames,
      names,
      sex,
      countryOfResidence,
      countryOfBirth,
      languageLevelAbbreviation,
      countryDivisionOfResidence,
      countryDivisionOfBirth,
      termsAndConditionsVersion
    } = values;
    
    // Extract properties from matchedEnrolleeInfo
    const matchedInfo = matchedEnrolleeInfo || {};

    // Unfortunate temp fix until I refactor taking ids instead of Alpha3s
    const birthCountryName = countries
    ?.find(country => country.CountryId === countryOfBirth)
    ?.CountryName || null;
    
    const residencyCountryName = countries
      ?.find(country => country.CountryId === countryOfResidence)
      ?.CountryName || null;
 
    let enrolleeDob;
    // Convert dateOfBirth to year if it's a Moment object
    const submittedYear = user?.yearOfBirth ? user?.yearOfBirth : null;
    const matchedYearOfBirth = matchedInfo?.dateOfBirth 
    ? new Date(matchedInfo.dateOfBirth).getUTCFullYear()
    : null;
    if(submittedYear === matchedYearOfBirth){
      enrolleeDob = matchedInfo?.dateOfBirth
    }

    const selectedCourseCodeIds = (enrolledCourses || []).map(c => c?.CourseCodeId);

    const selectedCourseObjects = enrolledCourses || [];
  
    const distinctLanguageTargets = new Set(
      selectedCourseObjects
        ?.map(course => course?.TargetLanguageId)
        .filter(Boolean)
    );
    
    const languageProficiencies = [
      {
        languageId: nativeLanguage?.localizationId || 'na',
        languageLevelAbbreviation: 'na',
      },
      ...Array.from(distinctLanguageTargets).map(languageId => {
        const formKey =
          distinctLanguageTargets.size === 1
            ? 'languageLevelAbbreviation'
            : `languageLevelAbbreviation_${languageId}`;
    
        return {
          languageId,
          languageLevelAbbreviation: values[formKey] || 'ba',
        };
      }),
    ];
        
    
    // Define the base object
    const formattedData = {
      contactExternalId: user?.contactId ?? matchedInfo?.contactExternalId ?? null,
      emailAddress: user?.emailId ?? (matchedInfo?.email || null),
      lastNames: lastNames ?? (matchedInfo?.lastNames || null),
      names: names ?? (matchedInfo?.names || null),
      sex: sex ?? (matchedInfo?.sex || null),
      dateOfBirth: enrolleeDob || null,

      countryOfResidence: residencyCountryName ?? (matchedInfo.countryOfResidencyName || null),
      countryDivisionOfResidence: countryDivisionOfResidence ?? (matchedInfo.countryDivisionIdResidency || null),
      countryOfBirth: birthCountryName ?? (matchedInfo.countryOfBirthName || null),
      countryDivisionOfBirth: countryDivisionOfBirth ?? (matchedInfo.countryDivisionIdBirth || null),
      
      termsVersion: termsAndConditionsVersion || "1.0", // Default version
      coursesCodeIds: selectedCourseCodeIds.map(id => ({
        courseCodeId: id,
      })),
      languageProficiencies: languageProficiencies
    };
  
    const recordsToSubmit = formattedData ? [formattedData] : [];
    console.log("recordsToSubmit", recordsToSubmit)
    return recordsToSubmit;
    
  };
  
  const onFormSubmit = async (values) => {
    try {
      // Trigger validation for the form during submit
      await form.validateFields(); // Ensure all fields are valid before proceeding
      const enrolledCourses = selectedCoursesToEnroll?.length > 0
      ? availableCourses?.filter(course => selectedCoursesToEnroll?.includes(course?.CourseCodeId))
      : availableCourses;

      const formattedDatatoSubmit = formatSubmissionData(
        values,
        {
          nativeLanguage,
          enrolledCourses, // full course objects
          countries
        },
        returningEnrolleeCountryDivisionInfo,
        user
      );

      setSubmittingLoading(true);
      setSubmittingRecords(formattedDatatoSubmit);
      console.log("formattedDatatoSubmit", formattedDatatoSubmit);

    } catch (error) {
      // Handle validation failure
      console.log("Form invalid", error);
      alert("Form is invalid. Please check the fields.");
    }
  };

  const resetQuickEnrollmentInputValues = async () => {
    // Clear the form fields
    form?.resetFields();
  
    // Reset all the states
    setConfirmVisible(false);
    setGeographyInfoVisible(false);
    setSelectedCountryOfResidence(null);
    setSelectedBirthCountry(null);
    setDivisions([]); // Reset residency divisions
    setBirthDivisions([]); // Reset birth divisions
    setSubmitEnabled(false); // Disable submit button
    setLoading(false); // Reset loading state
    setReturningEnrolleeCountryDivisionInfo(null); // Clear returning enrollee info
    setEnrolleeResidencyDivision("");
    setEnrolleeBirthDivision("");
    onResetSubmittingEnrollee(undefined);
    setSubmittingLoading(false);
    setSubmittingRecords([]); 
    onSelectingEnrollmentCourses([]);
    history.push("/");
  };
  

  const handleGoBackSelection = () => {
    // go back by resetting array
    onSelectingEnrollmentCourses([]);
    
  }; 

  const getLanguageName = (id) => {
    const map = {
      en: "English",
      es: "Español",
      pt: "Português"
      // add more if needed
    };
    return map[id] || id;
  };
  

  const quickEnrollmentStyle = {
    maxWidth: 600,
    margin: "0 auto",
    padding: "20px",
  }

  const coursesToDisplay =
  availableCourses?.length === 1
    ? availableCourses
    : availableCourses?.filter(course =>
        selectedCoursesToEnroll?.includes(course.CourseCodeId)
      );

  console.log("coursesToDisplay", coursesToDisplay, availableCourses, selectedCoursesToEnroll);
  const titleOfEnrollment = setLocale(locale, "enrollment.quickEnrollment");
  const converUrl = "https://images.unsplash.com/photo-1655800466797-8ab2598b4274?q=80&w=1690&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const enrollmentVersion = "v3.0";
 
  return (
    <div className="container customerName">
      {isEnrollmentModalVisible && (
        <EnrollmentModal
          closeEnrollmentModal={handleCloseModal}
          visibleModal={isEnrollmentModalVisible}
          courses={coursesToDisplay}
        />
      )}

      <Form
          form={form}
          onFinish={onFormSubmit}
          layout="vertical"
        >
        <Row gutter={24}>
          <Col lg={24}>
            <Card style={quickEnrollmentStyle} loading={submittingLoading} bordered
              cover={
                <img
                alt={titleOfEnrollment}
                src={converUrl}
                style={{ height: 100, objectFit: 'cover' }}
              />
              }
            >
              <h1 style={{ marginBottom: "10px", textAlign: "left" }}>
                {titleOfEnrollment} - {user?.communicationName} - ({enrollmentVersion})
              </h1>
            </Card>

            {coursesToDisplay?.length > 1 ? (
              <Card
                style={quickEnrollmentStyle}
                bordered
                title={setLocale(locale, "enrollment.courseDetails")}
                loading={submittingLoading}
              >
                <h2>
                  {setLocale(locale, "enrollment.numOfCoursesEnrolled")}{" "}
                  {coursesToDisplay?.length}
                </h2>

                <Tabs tabPosition="top" type="line">
                  {coursesToDisplay?.map((course, index) => (
                    <Tabs.TabPane
                      tab={course?.CourseDetails?.course || `Course ${index + 1}`}
                      key={course?.CourseCodeId || index}
                    >
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} lg={12}>
                          <img
                            src={
                              course?.CourseDetails?.imageUrl ||
                              process.env.PUBLIC_URL + "/img/avatars/tempProfile.jpg"
                            }
                            alt={`${course?.CourseDetails?.course} profile`}
                            style={{
                              width: 200,
                              height: 200,
                              borderRadius: "5%",
                              marginBottom: "10px",
                            }}
                          />
                        </Col>
                        <Col xs={24} sm={24} lg={12}>
                          <CourseDetails course={course} />
                        </Col>
                      </Row>
                    </Tabs.TabPane>
                  ))}
                </Tabs>

                {selectedCoursesToEnroll?.length > 0 && (
                  <Button
                    type="dashed"
                    block
                    onClick={handleGoBackSelection}
                    disabled={selectedCoursesToEnroll?.length === 0}
                    style={{ marginTop: 16 }}
                  >
                    {setLocale(locale, "enrollment.form.goBackToCourseSelection")}
                  </Button>
                )}
              </Card>
            ) : (
              coursesToDisplay?.map((course, index) => (
                <Card
                  key={course.id || index}
                  style={quickEnrollmentStyle}
                  bordered
                  title={setLocale(locale, "enrollment.courseDetails")}
                  loading={submittingLoading}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} lg={12}>
                      <img
                        src={
                          course?.CourseDetails?.imageUrl ||
                          process.env.PUBLIC_URL + "/img/avatars/tempProfile.jpg"
                        }
                        alt={`${course?.CourseDetails?.course} profile`}
                        style={{
                          width: 200,
                          height: 200,
                          borderRadius: "5%",
                          marginBottom: "10px",
                        }}
                      />
                    </Col>
                    <Col xs={24} sm={24} lg={12}>
                      <CourseDetails course={course} />
                    </Col>
                  </Row>

                  {selectedCoursesToEnroll?.length > 0 && (
                    <Button
                      type="dashed"
                      block
                      onClick={handleGoBackSelection}
                      disabled={selectedCoursesToEnroll?.length === 0}
                      style={{ marginTop: 16 }}
                    >
                      {setLocale(locale, "enrollment.form.goBackToCourseSelection")}
                    </Button>
                  )}
                </Card>
              ))
            )}

          

          { user?.contactId && returningEnrolleeCountryDivisionInfo?.personalCommunicationName && (
            <>
            {isGeographyInfoVisible && (
              <Card style={quickEnrollmentStyle} title={setLocale(locale, "enrollment.form.confirmProfileGeography")} loading={submittingLoading} bordered>
                <Form.Item name="countryOfResidence" label={setLocale(locale, "enrollment.form.countryOfResidency")} 
                  rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectCountryOfResidence") }]}
                  initialValue={returningEnrolleeCountryDivisionInfo?.countryOfResidencyId ?? undefined}               
                  >
                  <Select
                    showSearch
                    placeholder="Select your country of residence"
                    optionFilterProp="children"
                    onChange={(value) => {
                      setSelectedCountryOfResidence(value); // Update selected country
                      setDivisions([]); // Reset divisions for residence
                      form.setFieldsValue({ countryDivisionOfResidence: null }); // Clear form division value
                    }}
                  >
                    {props.countries?.map((country) => (
                      <Option key={country.CountryId} value={country.CountryId}>
                        <Flag code={country.CountryId} style={{ width: 20, marginRight: 10 }} />
                        {`${country?.NativeCountryName} | ${country?.CountryName}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {selectedCountryOfResidence && residencyDivisions?.length > 0 && (
                  <Form.Item name="countryDivisionOfResidence" label={setLocale(locale, "enrollment.form.stateOrRegion")} 
                  rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectStateOrRegion") }]}
                  initialValue={returningEnrolleeCountryDivisionInfo?.countryDivisionIdResidency ?? undefined}
                  
                  >
                    <Select
                      showSearch
                      placeholder="Select a state/region where you currently live"
                      optionFilterProp="children"
                      onChange={(value) => {
                        setEnrolleeResidencyDivision(value);
                      }}
                    >
                      {residencyDivisions?.map((division) => (
                        <Option key={division?.CountryDivisionId} value={division?.CountryDivisionId}>
                          <Flag code={division?.CountryId} style={{ width: 20, marginRight: 10 }} />
                          {division?.CountryDivisionName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}


          {( 
            !returningEnrolleeCountryDivisionInfo?.countryOfBirthId ||
            !returningEnrolleeCountryDivisionInfo?.countryDivisionIdBirth
          ) && (
          <>
            <Form.Item
                name="countryOfBirth"
                label={setLocale(locale, "enrollment.form.countryOfNationalityOfBirth")}
                rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectCountryOfBirth") }]}
                initialValue={returningEnrolleeCountryDivisionInfo?.countryOfBirthId ?? undefined}
              >
                <Select
                  showSearch
                  placeholder="Select country of nationality of birth"
                  optionFilterProp="children"
                  onChange={(value) => {
                    setSelectedBirthCountry(value);
                    setBirthDivisions([]);
                    form.setFieldsValue({ countryDivisionOfBirth: null });
                  }}
                >
                  {props.countries?.map((country) => (
                    <Option key={country.CountryId} value={country.CountryId}>
                      <Flag code={country.CountryId} style={{ width: 20, marginRight: 10 }} />
                      {`${country.NativeCountryName} | ${country.CountryName}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

            {selectedBirthCountry && birthDivisions?.length > 0 && (
              <Form.Item
                name="countryDivisionOfBirth"
                label={setLocale(locale, "enrollment.form.stateOrRegionOfBirth")}
                rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.selectStateOrRegionOfBirth") }]}
                initialValue={returningEnrolleeCountryDivisionInfo?.countryDivisionIdBirth ?? undefined}
              >
                <Select
                  showSearch
                  placeholder="Select state/region of nationality of birth"
                  optionFilterProp="children"
                  onChange={(value) => {
                    setEnrolleeBirthDivision(value);
                  }}
                >
                  {birthDivisions?.map((division) => (
                    <Option key={division.CountryDivisionId} value={division.CountryDivisionId}>
                      <Flag code={division.CountryId} style={{ width: 20, marginRight: 10 }} />
                      {division.CountryDivisionName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </>
        )}
        </Card>
      )}
      </>
    )
    }

        {(() => {
          const distinctTargetLanguages = Array.from(
            new Set(
              (selectedCoursesToEnroll?.length > 0
                ? availableCourses.filter(course =>
                    selectedCoursesToEnroll?.includes(course.CourseCodeId)
                  )
                : availableCourses)?.map(course => course?.TargetLanguageId).filter(Boolean)
            )
          );

          // Handle 1 or more language levels in a unified way
          if (
            !returningEnrolleeCountryDivisionInfo?.personalCommunicationName ||
            !isGeographyInfoVisible
          ) {
            return null;
          }

          return (
            <>
              {distinctTargetLanguages?.map((langId) => (
                <Card
                  key={langId}
                  style={quickEnrollmentStyle}
                  title={
                    distinctTargetLanguages?.length > 1
                      ? <p>{setLocale(locale, "enrollment.form.languageLevelForCourseIn")} {getLanguageName(langId)}?</p>
                      : setLocale(locale, "enrollment.form.languageLevelForCourse")
                  }
                  loading={submittingLoading}
                  bordered
                >
                  <Form.Item
                    name={
                      distinctTargetLanguages?.length === 1
                        ? "languageLevelAbbreviation"
                        : `languageLevelAbbreviation_${langId}`
                    }
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
              ))}
            </>
          );
        })()}


            <Card style={quickEnrollmentStyle} loading={submittingLoading} bordered>
              <p>
                {setLocale(locale, "enrollment.form.byProceedingTermsAndConditions")} - {enrollmentVersion} - 
                <TermsModal />{" "}
                - {setLocale(locale, "enrollment.form.ofUseAndPrivacyPolicy")}
              </p>
              <Button
                type="primary"
                htmlType="submit"
                block
                disabled={!isSubmitEnabled}
              >
                {setLocale(locale, "enrollment.form.submit")}
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onRenderingCourseRegistration,
    onSearchingForAlreadyEnrolledContact,
    onRequestingGeographicalDivision,
    onSubmittingEnrollee,
    onResetSubmittingEnrollee,
    onSelectingEnrollmentCourses
  }, dispatch);
}

const mapStateToProps = ({ lrn, grant, auth }) => {
  const { availableCourses, selfLanguageLevel, countries, nativeLanguage, wasSubmittingEnrolleeSucessful, selectedCoursesToEnroll } = lrn;
  const { user } = grant;
  const { token } = auth;
  return { availableCourses, selfLanguageLevel, countries, nativeLanguage, wasSubmittingEnrolleeSucessful, user, token, selectedCoursesToEnroll };
};

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticatedQuickEnrollment);
