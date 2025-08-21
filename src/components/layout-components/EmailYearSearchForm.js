import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Row, Col, DatePicker, Input, Button, message, Card } from 'antd';
import moment from 'moment';
import getLocaleText from "components/util-components/IntString";
import { useHistory } from 'react-router-dom';
import { onRetrievingUserProfile } from 'redux/actions/Grant';
import IntlMessage from "components/util-components/IntlMessage";

const EmailYearSearchForm = (props) => {
  // Destructure props
  const { user, onRetrievingUserProfile, availableCourses, selfLanguageLevel, countries, selectedCourse, nativeLanguage, wasSubmittingEnrolleeSucessful } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [searchParams, setSearchParams] = useState({ email: null, yob: null });
  const [profileData, setProfileData] = useState(null);
  const [yearOfBirth, setYearOfBirth] = useState(null);
  const [askFullBirthDate, setAskFullBirthDate] = useState(false);
  const [fullDateOfBirth, setFullDateOfBirth] = useState(null);
  const [submittedRecords, setSubmittingRecords] = useState([]);
  const [submittingLoading, setSubmittingLoading] = useState(false);
  const [isToDisplayFullEnrollment, setIsToDisplayFullEnrollment] = useState(false);
  const [returningEnrolleeCountryDivisionInfo, setReturningEnrolleeCountryDivisionInfo] = useState(null);


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


   const handleYearOfBirth = (year) => {
    if (year) {
       setYearOfBirth(year);
    } else {
      console.log("No year selected");
    }
  };

  const handleRedirectToEnrollment = () => {
    const dobString = fullDateOfBirth?.format("YYYY-MM-DD"); 
    console.log("fullDateOfBirth", dobString, user?.emailId)
    history.push({
      pathname: "/lrn/enroll",
      state: {
        email: user?.emailId,
        dateOfBirth: dobString,
        isToDoFullEnrollment: true,
        isSubmitBtnEnabled: true
      }
    });
  };

  const handleSearch = () => {

  if (loading) return;

  const email = user?.emailId?.trim()?.toLowerCase();

  const year = form?.getFieldValue("yearOfBirth")?.year();
  const fullDate = form?.getFieldValue("dateOfBirth");

  if (!email || (!year && !fullDate)) {
    message.warning("Please fill in all fields correctly.");
    return;
  }

  const emailToSearch = email;
  const yob = fullDate ? fullDate.year() : year;
  setSearchParams({ email: emailToSearch, yob, fullDate }); // send fullDate for fallback
  setSubmitted(true);
};

  const formatSubmissionData = (values, props, matchedEnrolleeInfo) => {
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
  const formattedDateOfBirth = dateOfBirth
  ? dateOfBirth.format("YYYY-MM-DD")
  : null;
  enrolleeDob = formattedDateOfBirth;

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
    
    termsVersion: termsAndConditionsVersion || "2.0", 
    coursesCodeIds: (availableCourses || []).map((course) => ({
      courseCodeId: course?.CourseCodeId || null,
    })),
    languageProficiencies: [
      {
        languageId: nativeLanguage?.localizationId || 'es', // TODO: For now
        languageLevelAbbreviation: "na", // Default for native language
      },
      {
        languageId: selectedCourse?.localizationId || 'en',
        languageLevelAbbreviation: languageLevelAbbreviation || "ba", // Form-provided or default
      },
    ]
  };

  const recordsToSubmit = formattedData ? [formattedData] : [];
  console.log("RecordsToSubmit", recordsToSubmit)
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
      }, returningEnrolleeCountryDivisionInfo);

      setSubmittingLoading(true);
      setSubmittingRecords(formattedDatatoSubmit);

    } catch (error) {
      // Handle validation failure
      console.log("Form invalid", error);
      alert("Form is invalid. Please check the fields.");
    }
  };


useEffect(() => {
  const fetchProfile = async () => {
    if (!submitted || !searchParams.email || !searchParams.yob) return;

    setLoading(true);
    let result = await onRetrievingUserProfile(
      searchParams.email,
      searchParams.fullDate ? searchParams.fullDate.format("YYYY-MM-DD") : searchParams.yob
    );
    setLoading(false);    
    if (result?.user?.contactId) {      
      setSearchResult(result?.user);
      setProfileData?.(result?.user);
      const existingRedirect = localStorage.getItem("postLoginRedirect");	
      if(existingRedirect){        
        history.push(existingRedirect);
      }else{        
        history.push("/");
      }
      
    } else {      
      if (!askFullBirthDate) {
        // First try failed → prompt for full birth date
        setAskFullBirthDate(true);
        setSubmitted(false); // Reset so user can submit again
        setIsToDisplayFullEnrollment(false);
      } else {
        // Second try failed → render ContactEnrollment (store full DOB in Redux)
        // You can dispatch something like: dispatch(setContactDob(searchParams.fullDate));
        setIsToDisplayFullEnrollment(true);
        setSearchResult(null); // To trigger rendering <ContactEnrollment />
      }
    }
  };

  fetchProfile();
}, [submitted, searchParams, onRetrievingUserProfile, setProfileData, history, askFullBirthDate]);

  const emailYearStyle = {
    maxWidth: 600,
    margin: "0 auto",
    padding: "20px",
    }

  const selectedYearOfBirth = form?.getFieldValue("yearOfBirth")?.format("YYYY") ?? yearOfBirth?.format("YYYY");
  const coverUrl =
    "https://images.unsplash.com/photo-1516382799247-87df95d790b7?q=80&w=1748&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  return (
	<>
      <Card cover={<img alt="Shopping" src={coverUrl} style={{ height: 100, objectFit: "cover" }} />} bordered loading={loading}>
        <h1>{setLocale(locale, "resources.myprogress.searchbyEmailandYear")}</h1>
        <h2>{user?.emailId}</h2>
       </Card>
  <Row justify="center" style={{ marginBottom: 20 }}>
  <Col xs={24}>
    <Card 
      title={!askFullBirthDate && !isToDisplayFullEnrollment && setLocale(locale, "enrollment.yearOfBirth") } 
      loading={loading} 
      bordered
    >
      <Form layout="vertical" onFinish={handleSearch} form={form}>
        {/* Row for input fields */}
        <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={24} lg={6}>
        {!askFullBirthDate && !isToDisplayFullEnrollment && 
            <Form.Item 
              name="yearOfBirth" 
              rules={[{ required: true, message: setLocaleString(locale, "enrollment.form.pleaseSelectYearOfBirth") }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                picker="year"
                defaultPickerValue={moment("1980", "YYYY")}
                disabledDate={(current) =>
                  current && (current.year() > 2017 || current.year() < 1900)
                }
                onChange={(date, dateString) => handleYearOfBirth(date ? date.year() : null)}
              />
            </Form.Item>
        }
          </Col>          
        </Row>
        
          {askFullBirthDate && !isToDisplayFullEnrollment && (  
             <Row gutter={[16, 16]} justify="center">
              <Col xs={24} sm={24} lg={6}>
              <h3>{setLocaleString(locale, "form.user.session.notFoundMessage")}</h3>              
              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[{ required: true, message: "Please select full date of birth" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={current => current && current > moment().endOf("day")}
                  onChange={(date) => setFullDateOfBirth(date)}
                  defaultPickerValue={
                    selectedYearOfBirth
                      ? moment(`${selectedYearOfBirth}-01-01`, "YYYY-MM-DD")
                      : undefined
                  }
                />
              </Form.Item>
              </Col>
            </Row>    
            
            


            
          )}

       <Row justify="center">
                <Col xs={24} sm={24} lg={8}>
                {isToDisplayFullEnrollment && (
                  <>               
                  <Card bordered>
                    <h3>{setLocale(locale, "search.NoRecordsFound")}</h3>
                    <p>{setLocale(locale, "search.WouldYouLikeToEnroll")}</p>
                    <Button type="primary" onClick={handleRedirectToEnrollment}>
                      {setLocale(locale, "search.TakeMeToEnroll")}
                    </Button>
                  </Card>
                  </>
                  )}

              {!isToDisplayFullEnrollment && (

              <Form.Item style={{ marginBottom: "10px" }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                style={{ width: "100%" }} 
                disabled={!(yearOfBirth && user?.emailId)}
              >
                {setLocale(locale, "resources.myprogress.search")}
              </Button>
              </Form.Item>   

              )}
           
            </Col>
        </Row>
      </Form>
    </Card>
  </Col>
</Row>

          
  </>
   
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onRetrievingUserProfile,
    },
    dispatch);
}

const mapStateToProps = ({ grant, lrn, auth }) => {
  const { user } = grant;
  const { token } = auth; 
  const { availableCourses, selfLanguageLevel, countries, selectedCourse, nativeLanguage, wasSubmittingEnrolleeSucessful } = lrn;
  return { user, availableCourses, selfLanguageLevel, countries, selectedCourse, nativeLanguage, wasSubmittingEnrolleeSucessful };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailYearSearchForm);
