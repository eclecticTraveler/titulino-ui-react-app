import React, { useState, useEffect } from "react";
import { onVerifyingProgressByEmailIdAndCourseCodeId, onSubmittingUserCourseProgress, onFetchingUserAuthenticatedProgressForCourse } from 'redux/actions/Lrn';
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
import ConfettiExplosion from 'react-confetti-explosion';


export const ProgressDashboardByEmailV4 = (props) => {
  const { registeredProgressByEmailId, user,
     nativeLanguage, currentCourseCodeId, courseConfiguration, onSubmittingUserCourseProgress, isUserEmailRegisteredForCourse, onFetchingUserAuthenticatedProgressForCourse,
     studentPercentagesForCourse, studentCategoriesCompletedForCourse, course, selectedCourse, courseTheme, onVerifyingProgressByEmailIdAndCourseCodeId, hasUserInteractedWithModal } = props;

  const [form] = Form.useForm();
  const [selectedLessonsForSubmission, setSelectedLessonsForSubmission] = useState({});
  const [selectedLessons, setSelectedLessons] = useState({});
  const [handleUserProgressSubmit, setHandleUserProgressSubmit] = useState(null); // To hold the child's submit function
  const [activeKey, setActiveKey] = useState('1');
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


  console.log("currentCourseCodeId", currentCourseCodeId);
  console.log("user?.emailId", user?.emailId);
  console.log("user?.yearOfBirth", user?.yearOfBirth);
  console.log("courseConfiguration?.categories", courseConfiguration?.categories);




  const handleSearch = () => {    
    if(currentCourseCodeId && user?.emailId && (user?.yearOfBirth && user?.yearOfBirth > 0)){
      setLoading(true);        
      onVerifyingProgressByEmailIdAndCourseCodeId(user?.yearOfBirth, user?.emailId, currentCourseCodeId, selectedCourse?.localizationId);
      // onFetchingUserAuthenticatedProgressForCourse(currentCourseCodeId, sanitizedEmail)
    }

  };

  useEffect(() => {
    if(user?.emailId && user?.yearOfBirth){
      handleSearch();
    }

  }, [currentCourseCodeId, user?.emailId, user?.yearOfBirth ]);

  // Submit progress and refetch data
useEffect(() => {
  if (selectedLessonsForSubmission?.length > 0) {
    // Submit user progress
    onSubmittingUserCourseProgress(user?.emailId, selectedLessonsForSubmission).then(() => {
      // Refetch progress after submission completes
      onVerifyingProgressByEmailIdAndCourseCodeId(
        user?.yearOfBirth,
        user?.emailId,
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
    setActiveKey("1"); // CLEAN UP LATER
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


  const renderProgressTracking = () => (
    registeredProgressByEmailId && (
      <>
        <UserProgress
          progressData={registeredProgressByEmailId}
          courseCodeId={currentCourseCodeId}
          categories={courseConfiguration?.categories}
          setHandleUserProgressSubmit={setHandleUserProgressSubmit}
          setSelectedLessons={setSelectedLessons}
          email={user?.emailId}
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
    if (activeKey === '2' && user?.emailId) {
      return renderUpsertUserProgressBottom()
    }
  }


  const capitalizeFirstLetter = (str) => {
    return str?.charAt(0)?.toUpperCase() + str?.slice(1);
  };
  
  const renderDashboardTitle = () => {
    if (user?.emailId) {
      return (
        <>
          {setLocale(locale, "resources.myprogress.progressFor")}: {user?.emailId}
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

    <Card bordered loading={loading}>
    {registeredProgressByEmailId && (
      <>
        <h1>{capitalizeFirstLetter(courseTheme)}: {renderMessageResults()}</h1>
      </>
    )} 
      <h4>{renderDashboardTitle()}</h4>
     </Card>

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
    onVerifyingProgressByEmailIdAndCourseCodeId: onVerifyingProgressByEmailIdAndCourseCodeId,
    onFetchingUserAuthenticatedProgressForCourse: onFetchingUserAuthenticatedProgressForCourse
  }, dispatch);
}

const mapStateToProps = ({ lrn, theme, grant }) => {
  const { course } =  theme;
  const { user } = grant;
  const { registeredProgressByEmailId, nativeLanguage, studentPercentagesForCourse, studentCategoriesCompletedForCourse, currentCourseCodeId, courseConfiguration, selectedCourse, courseTheme, isUserEmailRegisteredForCourse, hasUserInteractedWithModal } = lrn;
  return { registeredProgressByEmailId, nativeLanguage, studentPercentagesForCourse, studentCategoriesCompletedForCourse, course, currentCourseCodeId, courseConfiguration, selectedCourse, courseTheme, isUserEmailRegisteredForCourse, hasUserInteractedWithModal, user };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProgressDashboardByEmailV4));