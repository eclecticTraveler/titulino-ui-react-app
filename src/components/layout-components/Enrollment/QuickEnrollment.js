import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onRenderingCourseRegistration, onSearchingForAlreadyEnrolledContact, onRequestingGeographicalDivision } from "redux/actions/Lrn";
import { Form, Input, Select, DatePicker, Button, Card, Row, Col, Divider } from "antd";
import moment from "moment";
import Flag from "react-world-flags";
import CourseCards from "./CourseCards";
import CourseDetails from "./CourseDetails";

const { Option } = Select;

export const QuickEnrollment = (props) => {
  const { availableCourses, onSearchingForAlreadyEnrolledContact, onRequestingGeographicalDivision } = props;
  const [form] = Form.useForm();
  const [isEmailVisible, setEmailVisible] = useState(false);
  const [isFindMeVisible, setFindMeVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [isGeographyInfoVisible, setGeographyInfoVisible] = useState(false);
  const [selectedCountryOfResidence, setSelectedCountryOfResidence] = useState(null);
  const [selectedBirthCountry, setSelectedBirthCountry] = useState(null);
  const [residencyDivisions, setDivisions] = useState([]); // Load divisions based on selected country
  const [birthDivisions, setBirthDivisions] = useState([]);
  const [isSubmitEnabled, setSubmitEnabled] = useState(false);
  const [returningEnrolleeCountryDivisionInfo, setReturningEnrolleeCountryDivisionInfo] = useState(null);

  
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

   // Fetch divisions for country of residence
//  useEffect(() => {
//   if (selectedCountryOfResidence) {
//     const fetchDivisions = async () => {
//       const divisions = await onRequestingGeographicalDivision(selectedCountryOfResidence);
//       console.log("divisions:", divisions);
//       console.log("selectedCountryOfResidence", selectedCountryOfResidence)
//       setDivisions(Array.isArray(divisions?.countryDivisions) ? divisions?.countryDivisions : []); // Ensure it's an array
//     };
//     fetchDivisions();
//   }
// }, [selectedCountryOfResidence]);

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


// Fetch divisions for country of birth
// useEffect(() => {
//   if (selectedBirthCountry) {
//     const fetchBirthDivisions = async () => {
//       const birthDivisions = await onRequestingGeographicalDivision(selectedBirthCountry);
//       setBirthDivisions(Array.isArray(birthDivisions?.countryDivisions) ? birthDivisions?.countryDivisions : []); // Ensure it's an array
//     };
//     fetchBirthDivisions();
//   }
// }, [selectedBirthCountry]);

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
    const values = form.getFieldsValue();
    const year = values.yearOfBirth ? values.yearOfBirth.format("YYYY") : null; // Format the date
    const email = values.emailAddress;

    if (year && email) {
      const enrolleeInfomation = await onSearchingForAlreadyEnrolledContact(email, year);
      setReturningEnrolleeCountryDivisionInfo(enrolleeInfomation?.returningEnrollee ?? null);


    } else {
      alert("Please enter both date of birth and email.");
    }
  };

  const onYesConfirm = () => {
    alert("Yes confirmed");
    // setUserData(null); // Clear user data after confirmation
    setConfirmVisible(false);
    setGeographyInfoVisible(true);
    setFindMeVisible(false);
    setSubmitEnabled(true);
  };

  const onNoConfirm = () => {
    alert("No confirmed");
    setConfirmVisible(false);
  };

  const onFormSubmit = async (values) => {
    try {
      // Trigger validation for the form during submit
      await form.validateFields(); // Ensure all fields are valid before proceeding

      // If validation passes, log the valid values
      console.log("Form submitted with values:", values);
      alert("Form submitted successfully.");
      
      resetQuickEnrollmentInputValues();

      console.log("returningEnrolleeCountryDivisionInfo", returningEnrolleeCountryDivisionInfo) // fix to reset enrolle or to clean it up in redux
    } catch (error) {
      // Handle validation failure
      console.log("Form invalid", error);
      alert("Form is invalid. Please check the fields.");
    }
  };

  const resetQuickEnrollmentInputValues = async () => {
      // Clear the form fields after successful submission
      form.resetFields();
      onSearchingForAlreadyEnrolledContact(null, null);
      setFindMeVisible(false);
      setConfirmVisible(false);
      setGeographyInfoVisible(false);
      setSelectedCountryOfResidence(null);
      setSelectedBirthCountry(null);
      setDivisions([]);
      setBirthDivisions([]);
      setSubmitEnabled(false);
      setEmailVisible(false); // No fully working
  }

  const quickEnrollmentStyle = {
    maxWidth: 600,
    margin: "0 auto",
    padding: "20px",
  }
  
  return (
    <div className="container customerName">
      <Form
          form={form}
          onFinish={onFormSubmit}
          layout="vertical"
        >
        <Row gutter={24}>
          <Col lg={24}>
            <Card
              style={quickEnrollmentStyle}
              bordered
            >
              <h1 style={{ marginBottom: "20px", textAlign: "left" }}>{returningEnrolleeCountryDivisionInfo?.personalCommunicationName ? 
              `Welcome back ${returningEnrolleeCountryDivisionInfo?.personalCommunicationName}` : `Quick Enrollment`}</h1>
            </Card>
            {availableCourses?.map((course, index) => (
              <Card
                key={index}
                style={quickEnrollmentStyle}
                bordered
              >
                <div style={{ display: "flex", alignItems: "center", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "center", paddingRight: "20px" }}>
                    <img
                      src={course?.CourseDetails?.courseProfileImage || process.env.PUBLIC_URL + '/img/avatars/tempProfile.jpg'}
                      alt={`${course?.CourseDetails?.course} profile`}
                      style={{ width: 250, height: 250, borderRadius: '5%' }}
                    />
                  </div>
                  <CourseDetails course={course} />
                </div>
              </Card>
            ))}
 
            <Card style={quickEnrollmentStyle} title="Personal Info" bordered>
              <Form.Item name="yearOfBirth" label="Year of Birth" rules={[{ required: true, message: "Please select your year of birth" }]}>
                <DatePicker
                  style={{ width: "100%" }}
                  picker="year" // Restrict picker to year only
                  defaultPickerValue={moment("1990", "YYYY")} // Open to the 1990-1999 range
                  disabledDate={(current) =>
                    current &&
                    (current > moment().endOf("year") || // No future years
                    current > moment().subtract(10, "years").startOf("year")) // No years less than 10 years ago
                  }
                  onChange={onBirthDateSelect}
                  placeholder="Select Year Of Birth"
                />
              </Form.Item>
            </Card>

            {isEmailVisible && (
              <Card style={quickEnrollmentStyle} title="Contact Email" bordered>
                <Form.Item name="emailAddress" rules={[{ required: true, type: "email" }]}>
                  <Input placeholder="Enter your contact email" onChange={() => setFindMeVisible(true)} />
                </Form.Item>

                {isFindMeVisible && !returningEnrolleeCountryDivisionInfo?.length && (
                  <>
                    <span>{returningEnrolleeCountryDivisionInfo?.length} records found.</span>
                    <h5>
                      {`Unable to find your record under email: ${form.getFieldValue("emailAddress") || "N/A" } 
                      and year of birth: ${form.getFieldValue("yearOfBirth") ? form.getFieldValue("yearOfBirth").format("YYYY") : "N/A"}`}
                    </h5>
                  </>
 
                )}
                
                {isFindMeVisible && (
                  <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <Button type="primary" onClick={onFindMe}>Find Me</Button>
                    <Button type="default" onClick={resetQuickEnrollmentInputValues}>Reset</Button>
                  </div>
                )}
              </Card>
            )}





          { returningEnrolleeCountryDivisionInfo?.length > 0 && (
            <>
              {isConfirmVisible && (
              <Card style={quickEnrollmentStyle} bordered>
                <h3>Are you {returningEnrolleeCountryDivisionInfo?.personalCommunicationName}?</h3>
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
                        {`${country.NativeCountryName} | ${country.CountryName}`}
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
                        <Option key={division.CountryDivisionId} value={division.CountryDivisionId}>
                          <Flag code={division.CountryId} style={{ width: 20, marginRight: 10 }} />
                          {division.CountryDivisionName}
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

            <Card  style={quickEnrollmentStyle} bordered>                         
            <p>By proceeding, you agree to our <a href="#">Terms and Conditions</a> of Use and acknowledge our Privacy Policy.</p>
            <Button type="primary" htmlType="submit" disabled={!isSubmitEnabled}>
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
    onRequestingGeographicalDivision
  }, dispatch);
}

const mapStateToProps = ({ lrn }) => {
  const { availableCourses, selfLanguageLevel, countries } = lrn;
  return { availableCourses, selfLanguageLevel, countries };
};

export default connect(mapStateToProps, mapDispatchToProps)(QuickEnrollment);
