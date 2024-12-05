import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onRenderingCourseRegistration, onSearchingForAlreadyEnrolledContact, onRequestingGeographicalDivision, onSubmittingEnrollee } from "redux/actions/Lrn";
import { Form, Input, Select, DatePicker, Button, Card, Row, Col, Divider, message, Spin  } from "antd";
import moment from "moment";
import Flag from "react-world-flags";
import CourseCards from "./CourseCards";
import CourseDetails from "./CourseDetails";
import ContactEnrollment from './ContactEnrollment';

const { Option } = Select;

export const QuickToFullEnrollment = (props) => {
  const { availableCourses, onSearchingForAlreadyEnrolledContact, onRequestingGeographicalDivision, selectedCourse, nativeLanguage, onSubmittingEnrollee } = props;
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

  console.log("returningEnrolleeCountryDivisionInfo", returningEnrolleeCountryDivisionInfo)
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
    // setUserData(null); // Clear user data after confirmation
    setConfirmVisible(false);
    setGeographyInfoVisible(true);
    setFindMeVisible(false);
    setSubmitEnabled(true);
  };

  const onProceedForFullEnrollment = () => {
    setIsToProceedToFullEnrollment(true);
    setSubmitEnabled(true);
  };

  const onNoConfirm = () => {
    setConfirmVisible(false);
  };

  const formatSubmissionData = (values, props, isQuickEnrollment) => {
    const {
      nativeLanguage,
      selectedCourse,
      availableCourses,
    } = props;
  
    const {
      emailAddress,
      lastNames,
      names,
      sex,
      dateOfBirth,
      countryOfResidence,
      countryOfBirth,
      languageLevelAbbreviation,
      countryDivisionOfResidence,
      countryDivisionOfBirth
    } = values;
  
    // Format dateOfBirth
    const formattedDateOfBirth = dateOfBirth
      ? dateOfBirth.format("MM/DD/YYYY")
      : null;
  
      // Generate coursesCodeIds array
      const coursesCodeIds = (availableCourses || []).map((course) => ({
        courseCodeId: course?.CourseCodeId || null,
      }));
  
    // Generate languageProficiencies array
    const languageProficiencies = isQuickEnrollment ? [] : [
      {
        languageId: nativeLanguage?.localizationId || null,
        languageLevelAbbreviation: "na", // Default for native language
      },
      {
        languageId: selectedCourse?.localizationId || null,
        languageLevelAbbreviation: languageLevelAbbreviation || "ba", // Form-provided or default
      },
    ];
  
    // Return the formatted data
    return {
      contactExternalId: null, // Default to null
      emailAddress: emailAddress || null,
      lastNames: lastNames || null,
      names: names || null,
      sex: sex || null,
      dateOfBirth: formattedDateOfBirth,
      countryOfResidence: countryOfResidence || null,
      countryDivisionOfResidence: countryDivisionOfResidence || null, // Default to null
      countryOfBirth: countryOfBirth || null,
      countryDivisionOfBirth: countryDivisionOfBirth || null, // Default to null
      termsVersion: "1.0", // Default version
      coursesCodeIds: coursesCodeIds,
      languageProficiencies: languageProficiencies,
    };
  };

  

  const onFormSubmit = async (values) => {
    try {
      // Trigger validation for the form during submit
      await form.validateFields(); // Ensure all fields are valid before proceeding

      if(isToProceedToFullEnrollment){
        console.log("isToProceedToFullEnrollment", isToProceedToFullEnrollment)
        // Call the formatSubmissionData function
  

      }else{
        
      }

      const formattedData = formatSubmissionData(values, {
        nativeLanguage,
        selectedCourse,
        availableCourses,
      }, !isToProceedToFullEnrollment);

      console.log("formattedData->", formattedData);

      // onSubmittingEnrollee(formattedData, isToProceedToFullEnrollment)
      
      resetQuickEnrollmentInputValues();

      // console.log("returningEnrolleeCountryDivisionInfo", returningEnrolleeCountryDivisionInfo) // fix to reset enrolle or to clean it up in redux
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

      // Call the reset method from the child
    // if (resetChildStates) {
    //   resetChildStates();
    // }
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
  const titleOfEnrollment = (isToProceedToFullEnrollment
    ? "Full Enrollment"
    : returningEnrolleeCountryDivisionInfo?.personalCommunicationName
    ? `Welcome back ${returningEnrolleeCountryDivisionInfo.personalCommunicationName}`
    : "Quick Enrollment");

  const converUrl = "https://images.unsplash.com/photo-1519406596751-0a3ccc4937fe?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";


  return (
    <div className="container customerName">
      <Form
          form={form}
          onFinish={onFormSubmit}
          layout="vertical"
        >
        <Row gutter={24}>
          <Col lg={24}>
            <Card style={quickEnrollmentStyle} bordered
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
                title="Course Details"
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
              <Card style={quickEnrollmentStyle} title="Personal Info" bordered>
              <Form.Item name="yearOfBirth" label="Year of Birth" rules={[{ required: true, message: "Please select your year of birth" }]}>
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
                  placeholder="Select Year Of Birth"
                />
              </Form.Item>
            </Card>
            )}
 

            {isEmailVisible && !isToProceedToFullEnrollment && (
              <Card style={quickEnrollmentStyle} title="Contact Email" bordered>
                <Form.Item 
                  name="emailAddress" 
                  rules={[
                    { required: true, message: "Please enter your email address" },
                    { type: "email", message: "Invalid email address" },
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
                  <Spin tip="Searching for your record..." />
                ) : isFindMeSubmitted && !returningEnrolleeCountryDivisionInfo?.personalCommunicationName ? (
                  <h4>
                    {`Unable to find your record under email: ${form.getFieldValue("emailAddress") || "N/A"} 
                    and year of birth: ${form.getFieldValue("yearOfBirth") ? form.getFieldValue("yearOfBirth").format("YYYY") : "N/A"}`}
                  </h4>
                ) : null}

                
                {isFindMeVisible && (
                  <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <Button type="primary" onClick={onFindMe}>Find Me</Button>
                    <Button type="default" onClick={resetQuickEnrollmentInputValues}>Reset</Button>
                  </div>
                )}

                {!loading && isFindMeSubmitted && !returningEnrolleeCountryDivisionInfo?.personalCommunicationName && !isToProceedToFullEnrollment && (
                  <div style={quickEnrollmentStyle}>
                    <h3>{`If your birth date and email above are correct then it would seem we do not have your records yet. Let's proceed for full Enrollment..`}</h3>
                    <Button type="primary" onClick={onProceedForFullEnrollment}>Yes</Button>
                    <Button type="default" onClick={resetQuickEnrollmentInputValues} style={{ marginLeft: 10 }}>No</Button>
                  </div>
                )}

              </Card>
            )}
         

          { returningEnrolleeCountryDivisionInfo?.personalCommunicationName && !isToProceedToFullEnrollment && (
            <>
              {isConfirmVisible && (
              <Card style={quickEnrollmentStyle} bordered>                
                <h3><Flag code={returningEnrolleeCountryDivisionInfo?.countryOfResidencyId} style={{ width: 20, marginRight: 10 }} />
                 {returningEnrolleeCountryDivisionInfo?.personalCommunicationName}?</h3>
                <Button onClick={onYesConfirm}>Yes</Button>
                <Button onClick={onNoConfirm} style={{ marginLeft: 10 }}>No</Button>
              </Card>
            )}

            {isGeographyInfoVisible && (
              <Card style={quickEnrollmentStyle} title="Please help me confirm Profile Geography" bordered>
                <Form.Item name="countryOfResidence" label="Country of Residency" rules={[{ required: true }]}
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
                  <Form.Item name="countryDivisionOfResidence" label="State/Region" rules={[{ required: true }]}>
                    <Select
                      showSearch
                      placeholder="Select a state/region where you currently live"
                      optionFilterProp="children"
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
                  label="Country of Nationality of Birth"
                  rules={[{ required: true }]}
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
                  <Form.Item name="countryDivisionOfBirth" label="State/Region of Birth" rules={[{ required: true }]}>
                    <Select
                      showSearch
                      placeholder="Select state/region of nationality of birth"
                      optionFilterProp="children"
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

          { isToProceedToFullEnrollment && (                         
              <ContactEnrollment 
                selectedEmail={form?.getFieldValue("emailAddress")}
                onEmailChange={handleEmailChange}
                selectedYearOfBirth={form?.getFieldValue("yearOfBirth")?.format("YYYY")}
                onFormSubmit={onFormSubmit}
                form={form}
                setResetChildStates={setResetChildStates} // Pass the delegate setter to the child
                enrollmentStyle={quickEnrollmentStyle}
                />

            )
          }

              <Card style={quickEnrollmentStyle} bordered>                         
                <p>By proceeding, you agree to our <a href="#">Terms and Conditions</a> of Use and acknowledge our Privacy Policy.</p>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={(!isSubmitEnabled)}
                  onClick={() => form.submit()} // This will trigger the child form submission
                >
                  Submit
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
    onSubmittingEnrollee
  }, dispatch);
}

const mapStateToProps = ({ lrn }) => {
  const { availableCourses, selfLanguageLevel, countries, selectedCourse, nativeLanguage } = lrn;
  return { availableCourses, selfLanguageLevel, countries, selectedCourse, nativeLanguage };
};

export default connect(mapStateToProps, mapDispatchToProps)(QuickToFullEnrollment);
