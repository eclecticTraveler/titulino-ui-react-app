import React, { useState, useEffect } from "react";
import { onModalInteraction, onVerifyingProgressByEmailIdAndCourseCodeId, onSubmittingUserCourseProgress, onResetingProgressByEmailIdAndCourseCodeId } from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Card, Input, Button, Form, Row, Col, Divider, message, Tabs, DatePicker } from 'antd';
import IntlMessage from "components/util-components/IntlMessage";
import LiquidCirclePercent from "./LiquidCirclePercent";
import LiquidStarPercent from "./LiquidStarPercent";
import UserProgress from './UserProgress'
import moment from "moment";
import { withRouter } from "react-router-dom";
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { faRoad, faPieChart } from '@fortawesome/free-solid-svg-icons';
import IconAdapter from "components/util-components/IconAdapter";
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import getLocaleText from "components/util-components/IntString";
import GenericModal from "./GenericModal";
import registerForm from 'assets/lotties/registerForm.json';
import EnrollInvitationMessage from "components/admin-components/ModalMessages/EnrollInvitationMessage";
import ConfettiExplosion from 'react-confetti-explosion';


export const ProgressDashboardByEmailV3 = (props) => {
  const { registeredProgressByEmailId,
     nativeLanguage, currentCourseCodeId, courseConfiguration, onSubmittingUserCourseProgress, onResetingProgressByEmailIdAndCourseCodeId, isUserEmailRegisteredForCourse, onModalInteraction,
     studentPercentagesForCourse, studentCategoriesCompletedForCourse, course, selectedCourse, courseTheme, onVerifyingProgressByEmailIdAndCourseCodeId, hasUserInteractedWithModal } = props;

  const [form] = Form.useForm();
  const [selectedLessonsForSubmission, setSelectedLessonsForSubmission] = useState({});
  const [selectedLessons, setSelectedLessons] = useState({});
  const [handleUserProgressSubmit, setHandleUserProgressSubmit] = useState(null); // To hold the child's submit function
  const [activeKey, setActiveKey] = useState('1');
  const [email, setEmail] = useState("");
  const [userYearOfBirth, setUserYearOfBirth] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isMassiveConfettiVisible, setIsMassiveConfettiVisible] = useState(false);
  const [isSmallConfettiVisible, setIsSmallConfettiVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { TabPane } = Tabs;
  const { width, height } = useWindowSize();
  const locale = true;
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  const setLocaleString = (isLocaleOn, localeKey, defaultMessage = "") => {
    return isLocaleOn
      ? getLocaleText(localeKey, defaultMessage) // Uses the new function
      : localeKey.toString(); // Falls back to the key if localization is off
  }; 

  const handleCloseModal = () => {
    onModalInteraction(true);
    setIsModalVisible(false); // Close modal when user clicks close button

  };

  const handleDirectionModal = () => {
    resetState();
  };

  const resetState = () => {
    //Local
    setSelectedLessonsForSubmission({});
    setSelectedLessons({});
    setHandleUserProgressSubmit(null)
    setEmail("");
    setIsMassiveConfettiVisible(false);
    setIsSmallConfettiVisible(false);
    setLoading(false); 
    setActiveKey("1");
    setIsModalVisible(false);
    onModalInteraction(false);
    setUserYearOfBirth(0);
    form?.resetFields();
    // Global
    onResetingProgressByEmailIdAndCourseCodeId();

  }
 
  const handleYearOfBirth = (year) => {
    if (year) {
      setUserYearOfBirth(year)
    } else {
      console.log("No year selected");
    }
  };
  

  // Trigger the search and set loading to true
  const handleSearch = () => {

    if (!email) {
      const messageToDisplay = "Enter Email";
      message.warning(messageToDisplay);
      return;
    }

    let sanitizedEmail = email?.trim()?.toLowerCase();

      // Basic email format validation (optional, you can use a more strict validation)
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!sanitizedEmail || !emailRegex.test(sanitizedEmail)) {
      const messageToDisplay = "Bad Email";
      message.warning(messageToDisplay);
      return;
    }
    
    // const formEmail = form?.getFieldValue("emailAddress");
    // const formYOB = parseInt(form?.getFieldValue("yearOfBirth")?.format("YYYY"), 10);
    if(currentCourseCodeId && userYearOfBirth > 0){
      setLoading(true);
      setEmail(sanitizedEmail);
      onVerifyingProgressByEmailIdAndCourseCodeId(userYearOfBirth, sanitizedEmail, currentCourseCodeId, selectedCourse?.localizationId);
    }

  };

  // Handle Reset functionality
  const handleReset = () => {
    resetState();
  };

  const handleEmailChange = (email) => {
    const emailValue = email?.trim()?.toLowerCase(); // Trim spaces and convert to lowercase to user input
    setEmail(emailValue);
    
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    setIsEmailValid(emailRegex.test(emailValue));
  };

  // Submit progress and refetch data
useEffect(() => {
  if (selectedLessonsForSubmission?.length > 0) {
    // Submit user progress
    onSubmittingUserCourseProgress(email, selectedLessonsForSubmission).then(() => {
      // Refetch progress after submission completes
      onVerifyingProgressByEmailIdAndCourseCodeId(
        userYearOfBirth,
        email,
        currentCourseCodeId,
        selectedCourse?.localizationId
      );
    });
  }
}, [selectedLessonsForSubmission]);

// Handle progress updates and UI effects
useEffect(() => {
  if((studentPercentagesForCourse?.goldenCertificatePercentage * 100) === 100){
    setIsMassiveConfettiVisible(true);
  }

  // Make the search button not to spin after getting results
    if(registeredProgressByEmailId){
      setLoading(false);
    }

  let timeoutId = setTimeout(() => {
    // handleReset();
    setIsMassiveConfettiVisible(false);
  }, 30000);

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}, [studentPercentagesForCourse, registeredProgressByEmailId ]);


useEffect(() => {
  if (isUserEmailRegisteredForCourse) {
    // Land on key "2" if results are found
    setActiveKey("2");
  } else {
    setActiveKey("1");
  }

  if (isUserEmailRegisteredForCourse === false && !hasUserInteractedWithModal) {
    setIsModalVisible(true);
  }

}, [isUserEmailRegisteredForCourse, hasUserInteractedWithModal]);


useEffect(() => {
  if (selectedLessonsForSubmission && Object.keys(selectedLessonsForSubmission).length > 0) {
    setActiveKey("1");
  }
}, [selectedLessonsForSubmission]);


useEffect(() => {

  // Cleanup function for unmount
  return () => {
    resetState();
  };
}, [onModalInteraction]);

  const renderMessageResults = () => {
    if (!registeredProgressByEmailId || registeredProgressByEmailId?.length === 0) {
      return <div>{setLocale(locale, "resources.myprogress.readyToRegister")}</div>;
    }

    return <div>{registeredProgressByEmailId?.length} {setLocale(locale, "resources.myprogress.recordsFound")}.</div>
  }

  const ProgressDashboardByEmailStyle = {
    height: 600
  }

  const renderGeneralView = () => (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={24} lg={12}>		
        {/* LiquidCirclePercent - Participation Certificate */}    
        <Card title={setLocale(locale, "resources.myprogress.participationcert")} style={ProgressDashboardByEmailStyle}  loading={loading} bordered>
          <LiquidCirclePercent percent={studentPercentagesForCourse?.participationCertificatePercentage} />
          <h5>{setLocale(locale, "resources.myprogress.requirementsTitle")}</h5>
          <ul>
          <li>{setLocale(locale, "resources.myprogress.generalGatherings")}: {studentCategoriesCompletedForCourse?.category1Total ?? 0}/8</li>
        </ul> 
        </Card>
      </Col>
      <Col xs={24} sm={24} lg={12}>
        {/* LiquidStarPercent - Golden Certificate */}
        <Card title={setLocale(locale, "resources.myprogress.goldencert")} style={ProgressDashboardByEmailStyle}  loading={loading} bordered>
          <LiquidStarPercent percent={studentPercentagesForCourse?.goldenCertificatePercentage} />
          <h5>{setLocale(locale, "resources.myprogress.requirementsTitle")}</h5>
          <ul>
            <li>{setLocale(locale, "resources.myprogress.generalGatherings")}: {studentCategoriesCompletedForCourse?.category1Total ?? 0}/8</li>
            <li>{setLocale(locale, "resources.myprogress.watchedGrammarClasses")}: {studentCategoriesCompletedForCourse?.category2Total ?? 0}/8</li>
            <li>{setLocale(locale, "resources.myprogress.finalExam")}: {studentCategoriesCompletedForCourse?.category4Total ?? 0}/1:</li>
          </ul>  
        </Card>
      </Col>	
      </Row>
    </>
  );

  const handleTabChange = (key) => {
    setActiveKey(key); // Update active tab key
  };

  const renderSubtitle = () => {
    if (activeKey === '1') {
      return (
        <Divider>
          <h3>{setLocale(locale, "resources.myprogress.generalDashboard")}</h3>
        </Divider>
      );
    } else if (activeKey === '2') {
      return (
        <Divider>
          <h3>{setLocale(locale, "resources.myprogress.brokenDown")}</h3>
        </Divider>
      );
    }
    return null; // Default if no active key
  };

  const renderProgressTracking = () => (
    registeredProgressByEmailId && (
      <>
        <UserProgress
          progressData={registeredProgressByEmailId}
          courseCodeId={currentCourseCodeId}
          categories={courseConfiguration?.categories}
          setHandleUserProgressSubmit={setHandleUserProgressSubmit}
          setSelectedLessons={setSelectedLessons}
          email={email}
          setIsSmallConfettiVisible={setIsSmallConfettiVisible}
          setSelectedLessonsForSubmission={setSelectedLessonsForSubmission}
        />
      </>
    )
  );
  
  const hasSelections = Object.keys(selectedLessons).length > 0;

  const renderUpsertUserProgressBottom = () => {
    return (
      <>
        <Row justify="center">
          <Col xs={24} sm={24} lg={8}>
            <Button
              type="primary"
              onClick={() => {
                if (handleUserProgressSubmit) {
                  handleUserProgressSubmit(); // Trigger the child's submit function
                } else {
                  message.error('Submit function is not available');
                }
              }}
              style={{ marginBottom: 15, width: "100%" }}
              disabled={!hasSelections || !isEmailValid}
            >
              {setLocale(locale, "resources.myprogress.submitSelections")}
            </Button>
          </Col>
        </Row>
      </>
    );
  };
  
  const renderUpserUserProgressBottom = () => {
    if (activeKey === '2' && email) {
      return renderUpsertUserProgressBottom()
    }
  }

  const renderButtons = () => {
    if (activeKey === '2' && email) {
      return renderUpsertUserProgressBottom()
    } else {
      return (
        <>
          <Row justify="center">
            <Col xs={24} sm={24} lg={8}>
            <Form.Item style={{ marginBottom: "10px" }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              style={{ width: "100%" }} 
              disabled={!(email)}
            >
              {setLocale(locale, "resources.myprogress.search")}
            </Button>
          </Form.Item>              
          <Form.Item>
            <Button 
              htmlType="button" 
              onClick={handleReset} 
              style={{ width: "100%" }} 
            >
              {setLocale(locale, "resources.myprogress.reset")}
            </Button>
          </Form.Item>
                </Col>
            </Row>
        </>
      );
    }
    return null; // Default if no active key
  };

  const capitalizeFirstLetter = (str) => {
    return str?.charAt(0)?.toUpperCase() + str?.slice(1);
  };
  
  const renderDashboardTitle = () => {
    if (email) {
      return (
        <>
          {setLocale(locale, "resources.myprogress.progressFor")}: {email}
        </>
      );
    }
    return <>{setLocale(locale, "resources.myprogress.dashboardInnerTitle")}: {capitalizeFirstLetter(courseTheme)}</>;
  };

  return (
    <div className="container customerName wordBreak">
    {isSmallConfettiVisible && <ConfettiExplosion />}
    {isMassiveConfettiVisible && (
        <Confetti
          width={width}
          height={height}
          drawShape={(ctx) => {
            ctx.beginPath();
            for (let i = 0; i < 22; i++) {
              const angle = 0.35 * i;
              const x = (0.2 + 1.5 * angle) * Math.cos(angle);
              const y = (0.2 + 1.5 * angle) * Math.sin(angle);
              ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.closePath();
          }}
        />
      )}

    {isModalVisible && 
            <GenericModal             
              closeGenericModal={handleCloseModal}
              visibleModal={isModalVisible} // Pass the modal visibility
              title={"userprogress.enrollment.invitationMessage"}
              secondTitle={"userprogress.enrollment.invitationMessageTitle"}
              closeButtonTitle={"enrollment.form.no"}
              animation={registerForm}
              messageToDisplay={<EnrollInvitationMessage handlePostButtonClick={handleDirectionModal}/>}
              transitionTimming={1500}
          />
    }
    <Card bordered loading={loading}>
      <h1>{renderDashboardTitle()}</h1>
     </Card>
     <Row justify="center" style={{ marginBottom: 20 }}>
  <Col xs={24}>
    <Card 
      title={setLocale(locale, "resources.myprogress.searchbyEmailandYear")} 
      loading={loading} 
      bordered
    >
      {registeredProgressByEmailId && <h2>{renderMessageResults()}</h2>}
      <Form layout="vertical" onFinish={handleSearch} form={form}>
        {/* Row for input fields */}
        <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={24} lg={6}>
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
          </Col>
          <Col xs={24} sm={24} lg={12}>
            <Form.Item 
              name="emailAddress" 
              rules={[
                { required: true, message: setLocaleString(locale, "profile.login.validEmail") },
                { type: "email", message: setLocaleString(locale, "enrollment.invalidEmail") },
              ]}
              >
              <Input
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Enter email"
                style={{ marginBottom: 10 }}
                status={!isEmailValid ? 'error' : ''}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Render action buttons */}
        {renderButtons()}
      </Form>
    </Card>
  </Col>
</Row>

      {renderSubtitle()}
      <Tabs defaultActiveKey="1" type="card" onChange={handleTabChange} activeKey={activeKey}>
      <TabPane 
        tab={
          <span>
            <IconAdapter icon={faPieChart} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />        
            {setLocale(locale, "resources.myprogress.generalView")}
          </span>
        } 
        key="1"
      >
        {/* Render your general view content */}
        {renderGeneralView()}
      </TabPane>
      <TabPane 
        tab={
          <span>
            <IconAdapter icon={faRoad} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} /> 
            {setLocale(locale, "resources.myprogress.progress&Tracking")}
          </span>
        } 
        key="2"
      >
        {/* Render your progress tracking content */}
        {renderProgressTracking()}
      </TabPane>
    </Tabs>
    {renderUpserUserProgressBottom()}
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onSubmittingUserCourseProgress: onSubmittingUserCourseProgress,
    onResetingProgressByEmailIdAndCourseCodeId: onResetingProgressByEmailIdAndCourseCodeId,
    onVerifyingProgressByEmailIdAndCourseCodeId: onVerifyingProgressByEmailIdAndCourseCodeId,
    onModalInteraction: onModalInteraction
  }, dispatch);
}

const mapStateToProps = ({ lrn, theme }) => {
  const { course } =  theme;
  const { registeredProgressByEmailId, nativeLanguage, studentPercentagesForCourse, studentCategoriesCompletedForCourse, currentCourseCodeId, courseConfiguration, selectedCourse, courseTheme, isUserEmailRegisteredForCourse, hasUserInteractedWithModal } = lrn;
  return { registeredProgressByEmailId, nativeLanguage, studentPercentagesForCourse, studentCategoriesCompletedForCourse, course, currentCourseCodeId, courseConfiguration, selectedCourse, courseTheme, isUserEmailRegisteredForCourse, hasUserInteractedWithModal };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProgressDashboardByEmailV3));