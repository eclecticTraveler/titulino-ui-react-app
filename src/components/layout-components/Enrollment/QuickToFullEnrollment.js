import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onRenderingCourseRegistration, onSearchingForAlreadyEnrolledContact, onRequestingGeographicalDivision, onSubmittingEnrollee, onResetSubmittingEnrollee } from "redux/actions/Lrn";
import { Form, Input, Select, DatePicker, Button, Card, Row, Col, Spin, Radio, Space  } from "antd";
import moment from "moment";
import Flag from "react-world-flags";
import CourseCards from "./CourseCards";
import CourseDetails from "./CourseDetails";
import ContactEnrollment from './ContactEnrollment';
import IntlMessage from "components/util-components/IntlMessage";
import getLocaleText from "components/util-components/IntString";
import TermsModal from "./TermsModal";
import EnrollmentModal from "./EnrollmentModal";

const { Option } = Select;

export const QuickToFullEnrollment = (props) => {
  const { availableCourses, onSearchingForAlreadyEnrolledContact, onRequestingGeographicalDivision, selectedCourse, nativeLanguage,
         onSubmittingEnrollee, selfLanguageLevel, wasSubmittingEnrolleeSucessful, countries } = props;
  const [form] = Form.useForm();
  const [isEmailVisible, setEmailVisible] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [email, setEmail] = useState("");
  const [isFindMeVisible, setFindMeVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [isGeographyInfoVisible, setGeographyInfoVisible] = useState(false);
  const [selectedCountryOfResidence, setSelectedCountryOfResidence] = useState(null);
  const [selectedBirthCountry, setSelectedBirthCountry] = useState(null);
  const [residencyDivisions, setDivisions] = useState([]); // Load divisions based on selected country
  const [birthDivisions, setBirthDivisions] = useState([]);
  const [isSubmitEnabled, setSubmitEnabled] = useState(false);
  const [isFindMeSubmitted, setIsFindMeSubmitted] = useState(false);
  const [isToProceedToFullEnrollment, setIsToProceedToFullEnrollment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [returningEnrolleeCountryDivisionInfo, setReturningEnrolleeCountryDivisionInfo] = useState(null);
  const [resetChildStates, setResetChildStates] = useState(null);
  const [enrolleeResidencyDivision, setEnrolleeResidencyDivision] = useState("");
  const [enrolleeBirthDivision, setEnrolleeBirthDivision] = useState("");
  const [isEnrollmentModalVisible, setIsEnrollmentModalVisible] = useState(false);
  const [submittingLoading, setSubmittingLoading] = useState(false);
  const [submittedRecords, setSubmittingRecords] = useState([]);
    
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
        console.log("submittedRecords", submittedRecords)
        const upsertFormattedData = async () => {
          // onSubmittingEnrollee(formattedDatatoSubmit, isToProceedToFullEnrollment);
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
      if (divisionList.length === 0) {
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
      if (divisionList.length === 0) {
        form.setFieldsValue({ countryDivisionOfBirth: null });
      }
    };
    fetchBirthDivisions();
  } else {
    setBirthDivisions([]); // Reset if no country is selected
  }
}, [selectedBirthCountry]);

  const onBirthDateSelect = () => setEmailVisible(true);

  const onFindMe = async () => {
    setSubmitEnabled(false);
    setIsFindMeSubmitted(true);
    setLoading(true); // Start loading
  
    const values = form.getFieldsValue();
    const year = values.yearOfBirth ? values.yearOfBirth.format("YYYY") : null;
    const email = values.emailAddress;
  
    if (year && email) {
      try {
        const enrolleeInformation = await onSearchingForAlreadyEnrolledContact(email, year);
        setReturningEnrolleeCountryDivisionInfo(enrolleeInformation?.returningEnrollee ?? null);
      } catch (error) {
        console.error("Error searching for enrollee:", error);
        setReturningEnrolleeCountryDivisionInfo(null); // Handle errors gracefully
      }
    } else {
      alert("Please enter both date of birth and email.");
    }
  
    setLoading(false); // Stop loading
  };

  const onYesConfirm = () => {
    setConfirmVisible(false);
    // If there is no missing data then dont display update?
    setGeographyInfoVisible(true);
    // if((!returningEnrolleeCountryDivisionInfo?.countryDivisionResidencyName ||
    //    !returningEnrolleeCountryDivisionInfo?.countryDivisionBirthName ||
    //    !returningEnrolleeCountryDivisionInfo?.countryOfResidencyName ||
    //    !returningEnrolleeCountryDivisionInfo?.countryOfBirthName )){
    //     setGeographyInfoVisible(true);
    //    }else{
    //     setGeographyInfoVisible(false);
    //    }
    setFindMeVisible(false);
    setSubmitEnabled(true);
  };

  const onProceedForFullEnrollment = () => {
    setIsToProceedToFullEnrollment(true);
    setSubmitEnabled(true);
  };

  const onNoConfirm = () => {
    setConfirmVisible(false);
    setIsToProceedToFullEnrollment(true);
    setFindMeVisible(false)
    setSubmitEnabled(true);
  };

  const formatSubmissionData = (values, props, isQuickEnrollment, matchedEnrolleeInfo) => {
    const {
      nativeLanguage,
      selectedCourse,
      availableCourses,
      countries
    } = props;
  
    const {
      emailAddress,
      lastNames,
      names,
      sex,
      yearOfBirth,
      countryOfResidence,
      countryOfBirth,
      languageLevelAbbreviation,
      countryDivisionOfResidence,
      countryDivisionOfBirth,
      dateOfBirth,
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
    if(isQuickEnrollment){
        // Convert dateOfBirth to year if it's a Moment object
        const submittedYear = yearOfBirth ? yearOfBirth.year() : null;
        const matchedYearOfBirth = matchedInfo?.dateOfBirth 
        ? new Date(matchedInfo.dateOfBirth).getFullYear()
        : null;
        if(submittedYear === matchedYearOfBirth){
          enrolleeDob = matchedInfo?.dateOfBirth
        }
    }else{
        const formattedDateOfBirth = dateOfBirth
        ? dateOfBirth.format("YYYY-MM-DD")
        : null;
        enrolleeDob = formattedDateOfBirth
    }

    // Define the base object
    const formattedData = {
      contactExternalId: matchedInfo?.contactExternalId ?? null,
      emailAddress: emailAddress ?? (matchedInfo?.email || null),
      lastNames: lastNames ?? (matchedInfo?.lastNames || null),
      names: names ?? (matchedInfo?.names || null),
      sex: sex ?? (matchedInfo?.sex || null),
      dateOfBirth: enrolleeDob || null,

      countryOfResidence: residencyCountryName ?? (matchedInfo.countryOfResidencyName || null),
      countryDivisionOfResidence: countryDivisionOfResidence ?? (matchedInfo.countryDivisionResidencyName || null),
      countryOfBirth: birthCountryName ?? (matchedInfo.countryOfBirthName || null),
      countryDivisionOfBirth: countryDivisionOfBirth ?? (matchedInfo.countryDivisionBirthName || null),
      
      termsVersion: termsAndConditionsVersion || "1.0", // Default version
      coursesCodeIds: (availableCourses || []).map((course) => ({
        courseCodeId: course?.CourseCodeId || null,
      })),
      languageProficiencies: isQuickEnrollment
        ? [
          {
            languageId: selectedCourse?.localizationId || null,
            languageLevelAbbreviation: languageLevelAbbreviation || "ba", // Form-provided or default
          }
        ]
        : [
            {
              languageId: nativeLanguage?.localizationId || null,
              languageLevelAbbreviation: "na", // Default for native language
            },
            {
              languageId: selectedCourse?.localizationId || null,
              languageLevelAbbreviation: languageLevelAbbreviation || "ba", // Form-provided or default
            },
          ],
    };
  
    const recordsToSubmit = formattedData ? [formattedData] : [];
    return recordsToSubmit;
    
  };
  
  const onFormSubmit = async (values) => {
    try {
      // Trigger validation for the form during submit
      await form.validateFields(); // Ensure all fields are valid before proceeding
      const formattedDatatoSubmit = formatSubmissionData(values, {
        nativeLanguage,
        selectedCourse,
        availableCourses,
        countries
      }, !isToProceedToFullEnrollment, returningEnrolleeCountryDivisionInfo);

      setSubmittingLoading(true);
      setSubmittingRecords(formattedDatatoSubmit);

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
    setEmailVisible(false);
    setIsEmailValid(true); // Reset email validity to default (true)
    setEmail(""); // Clear email input
    setFindMeVisible(false);
    setConfirmVisible(false);
    setGeographyInfoVisible(false);
    setSelectedCountryOfResidence(null);
    setSelectedBirthCountry(null);
    setDivisions([]); // Reset residency divisions
    setBirthDivisions([]); // Reset birth divisions
    setSubmitEnabled(false); // Disable submit button
    setIsFindMeSubmitted(false); // Reset 'Find Me' submission state
    setIsToProceedToFullEnrollment(false); // Reset enrollment proceed state
    setLoading(false); // Reset loading state
    setReturningEnrolleeCountryDivisionInfo(null); // Clear returning enrollee info
    setEnrolleeResidencyDivision("");
    setEnrolleeBirthDivision("");
    setResetChildStates(null);
    onResetSubmittingEnrollee(undefined);
    setSubmittingLoading(false);
    setSubmittingRecords([]);    
  };
  

  const handleEmailChange = (email) => {
    const emailValue = email?.trim()?.toLowerCase(); // Trim spaces and convert to lowercase
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    const isValid = emailRegex.test(emailValue); // Validate the processed email
    
    form.setFieldsValue({ emailAddress: emailValue }); // Update form state
    setEmail(emailValue); // Update the parent component state
    setIsEmailValid(isValid); // Update email validity
    
    if (isValid) {
      setFindMeVisible(true);
    } else {
      setFindMeVisible(false);
      setReturningEnrolleeCountryDivisionInfo(null);
      setIsFindMeSubmitted(false);
    }
  };
  
  const quickEnrollmentStyle = {
    maxWidth: 600,
    margin: "0 auto",
    padding: "20px",
  }

  const titleOfEnrollment = isToProceedToFullEnrollment
                            ? setLocale(locale, "enrollment.fullEnrollment")
                            : returningEnrolleeCountryDivisionInfo?.personalCommunicationName
                            ? setLocale(locale, "enrollment.welcomeBack")
                            : setLocale(locale, "enrollment.quickEnrollment");

  const converUrl = "https://images.unsplash.com/photo-1519406596751-0a3ccc4937fe?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  
  return (
    <div className="container customerName">
      {isEnrollmentModalVisible && 
            <EnrollmentModal             
            closeEnrollmentModal={handleCloseModal}
            visibleModal={isEnrollmentModalVisible} // Pass the modal visibility
            courses={availableCourses}
          />
      }

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
                {titleOfEnrollment}
              </h1>
            </Card>

            {availableCourses?.map((course, index) => (
                <Card
                key={index}
                style={quickEnrollmentStyle}
                bordered
                title={setLocale(locale, "enrollment.courseDetails")}
                loading={submittingLoading}
                >
                <div style={{ display: "flex", alignItems: "center", padding: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "center", paddingRight: "10px" }}>
                    <img
                      src={course?.CourseDetails?.imageUrl || process.env.PUBLIC_URL + '/img/avatars/tempProfile.jpg'}
                      alt={`${course?.CourseDetails?.course} profile`}
                      style={{ width: 200, height: 200, borderRadius: '5%', marginRight:"20px" }}
                    />
                  </div>
                  <CourseDetails course={course} />
                </div>
              </Card>
            ))}
 
            {!isToProceedToFullEnrollment && (
              <Card style={quickEnrollmentStyle}
                    title={setLocale(locale, "enrollment.personalInfo")}
                    loading={submittingLoading}
                    bordered>
              <Form.Item name="yearOfBirth" label={setLocale(locale, "enrollment.yearOfBirth")} 
              rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.pleaseSelectYearOfBirth") }]}>
                <DatePicker
                  style={{ width: "100%" }}
                  picker="year" // Restrict picker to year only
                  defaultPickerValue={moment("1990", "YYYY")} // Open to the 1990-1999 range
                  disabledDate={(current) =>
                    current &&
                    (current.year() > 2014 || // No years beyond 2014
                      current.year() < 1900) // No years earlier than 1900
                  }
                  onChange={onBirthDateSelect}
                />
              </Form.Item>
            </Card>
            )}
 

            {isEmailVisible && !isToProceedToFullEnrollment && (
              <Card style={quickEnrollmentStyle} title={setLocale(locale, "enrollment.form.contactEmail")} loading={submittingLoading} bordered>
                <Form.Item 
                  name="emailAddress" 
                  rules={[
                    { required: true, message: setLocaleString(locale, "profile.login.validEmail") },
                    { type: "email", message: setLocaleString(locale, "enrollment.invalidEmail") },
                  ]}
                  >
                  <Input
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="Enter your contact email"
                    style={{ marginBottom: 10 }}
                    status={!isEmailValid ? 'error email not valid' : ''}
                  />                      
                </Form.Item>

                {loading ? (
                  <Spin tip={setLocale(locale, "enrollment.form.searchingRecord")} />
                ) : isFindMeSubmitted && !returningEnrolleeCountryDivisionInfo?.personalCommunicationName ? (
                  <h4>
                    {setLocale(locale, "enrollment.form.unableToFindRecord")}{` ${form.getFieldValue("emailAddress") || "N/A"} `}
                    {setLocale(locale, "enrollment.form.andYearOfBirth")} {` ${form.getFieldValue("yearOfBirth") ? form.getFieldValue("yearOfBirth").format("YYYY") : "N/A"}`}
                  </h4>
                ) : null}

                
                {isFindMeVisible && (
                  <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <Button type="primary" onClick={onFindMe}>{setLocale(locale, "enrollment.form.findMe")}</Button>
                    <Button type="default" onClick={resetQuickEnrollmentInputValues}>{setLocale(locale, "resources.myprogress.reset")}</Button>
                  </div>
                )}

                {!loading && isFindMeSubmitted && !returningEnrolleeCountryDivisionInfo?.personalCommunicationName && !isToProceedToFullEnrollment && (
                  <div style={quickEnrollmentStyle}>
                    <h3>{setLocale(locale, "enrollment.form.noRecordsProceedEnrollment")}</h3>
                    <Button type="primary" onClick={onProceedForFullEnrollment}>{setLocale(locale, "enrollment.form.yes")}</Button>
                    <Button type="default" onClick={resetQuickEnrollmentInputValues} style={{ marginLeft: 10 }}>{setLocale(locale, "enrollment.form.no")}</Button>
                  </div>
                )}

              </Card>
            )}
         

          { returningEnrolleeCountryDivisionInfo?.personalCommunicationName && !isToProceedToFullEnrollment && (
            <>
              {isConfirmVisible && (
              <Card style={quickEnrollmentStyle} loading={submittingLoading} bordered>                
                <h3><Flag code={returningEnrolleeCountryDivisionInfo?.countryOfResidencyId} style={{ width: 20, marginRight: 10 }} />
                 {returningEnrolleeCountryDivisionInfo?.names}?</h3>
                <Button onClick={onYesConfirm}>{setLocale(locale, "enrollment.form.yes")}</Button>
                <Button onClick={onNoConfirm} style={{ marginLeft: 10 }}>{setLocale(locale, "enrollment.form.no")}</Button>
              </Card>
            )}

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
                      setSelectedBirthCountry(value); // Update selected country
                      setBirthDivisions([]); // Reset divisions for birth country
                      form.setFieldsValue({ countryDivisionOfBirth: null }); // Clear form division value
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
                  <Form.Item name="countryDivisionOfBirth" label={setLocale(locale, "enrollment.form.stateOrRegionOfBirth")} 
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
              </Card>
            )}
            </>
          )
          }

          {returningEnrolleeCountryDivisionInfo?.personalCommunicationName &&
            !isToProceedToFullEnrollment &&
            enrolleeResidencyDivision &&
            enrolleeBirthDivision && (
              <Card style={quickEnrollmentStyle} title={setLocale(locale, "enrollment.form.languageLevelForCourse")} loading={submittingLoading} bordered={true}>
                <Form.Item
                  name="languageLevelAbbreviation"
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
            )}

          { isToProceedToFullEnrollment && (                         
              <ContactEnrollment 
                selectedEmail={form?.getFieldValue("emailAddress")}
                onEmailChange={handleEmailChange}
                selectedYearOfBirth={form?.getFieldValue("yearOfBirth")?.format("YYYY")}
                onFormSubmit={onFormSubmit}
                form={form}
                setResetChildStates={setResetChildStates} // Pass the delegate setter to the child
                enrollmentStyle={quickEnrollmentStyle}
                submittingLoading={submittingLoading}
                />

            )
          }

            <Card style={quickEnrollmentStyle} loading={submittingLoading} bordered>
              <p>
                {setLocale(locale, "enrollment.form.byProceedingTermsAndConditions")}{" "}
                <TermsModal />{" "}
                {setLocale(locale, "enrollment.form.ofUseAndPrivacyPolicy")}
              </p>
              <Button
                type="primary"
                htmlType="submit"
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
    onResetSubmittingEnrollee
  }, dispatch);
}

const mapStateToProps = ({ lrn }) => {
  const { availableCourses, selfLanguageLevel, countries, selectedCourse, nativeLanguage, wasSubmittingEnrolleeSucessful } = lrn;
  return { availableCourses, selfLanguageLevel, countries, selectedCourse, nativeLanguage, wasSubmittingEnrolleeSucessful };
};

export default connect(mapStateToProps, mapDispatchToProps)(QuickToFullEnrollment);
