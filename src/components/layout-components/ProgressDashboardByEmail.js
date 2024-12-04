import React, { useState, useEffect } from "react";
import { onSearchingForProgressByEmailId, onRenderingCourseRegistration } from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Card, Input, Button, Form, Row, Col, Divider, message } from 'antd';
import IntlMessage from "components/util-components/IntlMessage";
import LiquidCirclePercent from "./LiquidCirclePercent";
import LiquidStarPercent from "./LiquidStarPercent";
import { withRouter } from "react-router-dom";
import { getLocalizedConfig } from 'configs/CourseMainNavigationConfig/Submenus/ConfigureNavigationLocalization';


export const ProgressDashboardByEmail = (props) => {
  const { onSearchingForProgressByEmailId, registeredProgressByEmailId, nativeLanguage, onRenderingCourseRegistration,
     studentPercentagesForCourse, studentCategoriesCompletedForCourse, course } = props;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  

  const locale = true;
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!sanitizedEmail || !emailRegex.test(sanitizedEmail)) {
      const messageToDisplay = "Bad Email";
      message.warning(messageToDisplay);
      return;
    }
    
    setLoading(true);
    onSearchingForProgressByEmailId(sanitizedEmail);  // Dispatch Redux action
    onRenderingCourseRegistration();
  };

  // Handle Reset functionality
  const handleReset = () => {
    setEmail(""); 
    setLoading(false); 
  };

  // React to changes in registeredProgressByEmailId and stop the loading indicator
  useEffect(() => {
    if (registeredProgressByEmailId) {
      setLoading(false);
    }

    let timeoutId;
		
		if (!registeredProgressByEmailId) {
			timeoutId = setTimeout(() => {
        handleReset();
        setLoading(false);
			}, 2000);
		}
	
		// Cleanup on unmount
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};

  }, [registeredProgressByEmailId]);


  const renderMessageResults = () => {
    if (!registeredProgressByEmailId || registeredProgressByEmailId?.length === 0) {
      return <h4>{setLocale(locale, "resources.myprogress.noRecordsFound")}</h4>;
    }

    return <h4>{registeredProgressByEmailId?.length} {setLocale(locale, "resources.myprogress.recordsFound")}.</h4>
  }

  const renderResults = () => {
    if (!registeredProgressByEmailId || registeredProgressByEmailId?.length === 0) {
      return <div>{setLocale(locale, "resources.myprogress.noRecordsFound")}</div>;
    }

    return (
      <>
        <div>{registeredProgressByEmailId?.length} {setLocale(locale, "resources.myprogress.recordsFound")}.</div>
        <Row gutter={[16, 16]}>
          {registeredProgressByEmailId?.map((record, index) => (
            <Col key={index} xs={24} sm={12} lg={8}>
              <Card title={`Class: ${record?.Class}`} bordered>
                <h5><strong>{setLocale(locale, "resources.myprogress.participation")}:</strong> {record?.TypeOfParticipation}</h5>
                <p><strong>{setLocale(locale, "resources.myprogress.email")}:</strong> {record?.EmailAddress}</p>
                <p><strong>{setLocale(locale, "resources.myprogress.date")}:</strong> {new Date(record?.Date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </>
    );
  };

  return (
    <div className="search-container">
      <Card title={setLocale(locale, "resources.myprogress.title")} bordered>
      <div>{setLocale(locale, "resources.myprogress.requirements")}</div>
      <br />
        <Row gutter={[16, 16]}>
          {/* Input email and search functionality */}
          <Col xs={24} sm={8}>
            <Card title={setLocale(locale, "resources.myprogress.searchYourEmail")} bordered>
            <Form layout="inline" onFinish={handleSearch}>
              <Form.Item>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {setLocale(locale, "resources.myprogress.search")}
                </Button>
              </Form.Item>
              {/* Reset Button */}
              <Form.Item>
                <Button htmlType="button" onClick={handleReset}>
                  {setLocale(locale, "resources.myprogress.reset")}
                </Button>
              </Form.Item>
            </Form>  
            < br />
            {renderMessageResults()}
            <Divider />
            <h4>{setLocale(locale, "resources.myprogress.recordProgress")}</h4>
              <Button type="primary" onClick={() => props.history.push(getLocalizedConfig(course).progress)}>
              {setLocale(locale, "resources.myprogress.here")}
              </Button>
            </Card>
          </Col>

          {/* LiquidCirclePercent - Participation Certificate */}
          <Col xs={24} sm={8}>
            <Card title={setLocale(locale, "resources.myprogress.participationcert")} bordered>
              <LiquidCirclePercent percent={studentPercentagesForCourse?.participationCertificatePercentage} />
              <h5>{setLocale(locale, "resources.myprogress.requirementsTitle")}</h5>
              <ul>
              <li>{setLocale(locale, "resources.myprogress.tuesdayGatherings")}: {studentCategoriesCompletedForCourse?.category1Total ?? 0}/8</li>
            </ul> 
            </Card>
          </Col>

          {/* LiquidStarPercent - Golden Certificate */}
          <Col xs={24} sm={8}>
            <Card title={setLocale(locale, "resources.myprogress.goldencert")} bordered>
              <LiquidStarPercent percent={studentPercentagesForCourse?.goldenCertificatePercentage} />
            <h5>{setLocale(locale, "resources.myprogress.requirementsTitle")}</h5>
              <ul>
                <li>{setLocale(locale, "resources.myprogress.tuesdayGatherings")}: {studentCategoriesCompletedForCourse?.category1Total ?? 0}/8</li>
                <li>{setLocale(locale, "resources.myprogress.watchedGrammarClasses")}: {studentCategoriesCompletedForCourse?.category2Total ?? 0}/8</li>
                <li>{setLocale(locale, "resources.myprogress.finalExam")}: {studentCategoriesCompletedForCourse?.category3Total ?? 0}/1:</li>
              </ul>  
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Results */}
        {renderResults()}
      </Card>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onSearchingForProgressByEmailId: onSearchingForProgressByEmailId,
    onRenderingCourseRegistration: onRenderingCourseRegistration
  }, dispatch);
}

const mapStateToProps = ({ lrn, theme }) => {
  const { course } =  theme;
  const { registeredProgressByEmailId, nativeLanguage, studentPercentagesForCourse, studentCategoriesCompletedForCourse } = lrn;
  return { registeredProgressByEmailId, nativeLanguage, studentPercentagesForCourse, studentCategoriesCompletedForCourse, course };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProgressDashboardByEmail));

