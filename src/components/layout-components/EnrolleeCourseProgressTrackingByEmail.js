import React, { useState, useEffect } from "react";
import { Card, Checkbox, Select, Button, Row, Col, Input, message } from 'antd';
import {
  FacebookOutlined,
  YoutubeOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
// import ConfettiExplosion from 'react-confetti-explosion';
// import Confetti from 'react-confetti';
// import useWindowSize from 'react-use/lib/useWindowSize';
import { onRequestingCourseProgressStructure } from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import IntlMessage from "components/util-components/IntlMessage";
import { withRouter } from "react-router-dom";
import utils from 'utils';

const { Meta } = Card;
const { Option } = Select;

const courseCodeId = 'SUPERMARKET_SEP_2024_COURSE_01';
const categories = [
  {
    categoryId: 1,
    name: 'Gatherings',
    isToDisplay: true,
    imageUrl:
      'https://images.unsplash.com/photo-1473649085228-583485e6e4d7?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    participationIds: [
      { participationTypeId: 1, localizationKey: 'nav.live' },
      { participationTypeId: 2, localizationKey: 'nav.recorded' },
    ],
    lessons: [
      {
        classNumber: 1,
        title: 'Regular Gathering',
        description: 'This class covers live gatherings and recorded sessions.',
        isToDisplay: true,
        imageUrl:
          'https://images.unsplash.com/photo-1473649085228-583485e6e4d7?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        links: {
          facebook: 'https://www.facebook.com/share/v/15GW6Bk72G/',
          youtube: 'https://youtu.be/xa9jtftPc0k',
          internal:
            'https://titulino.com/lrn/eng/level-supermarket/chapter-1/class',
        },
      },
      {
        classNumber: 2,
        title: 'Advanced Gathering',
        description: 'An advanced session on gathering practices.',
        isToDisplay: false,
        imageUrl: 'https://example.com/image2.jpg',
        links: {
          facebook: 'https://www.facebook.com/share/v/15GW6Bk72G/',
          youtube: 'https://youtu.be/xa9jtftPc0k',
        },
      },
    ],
  },
  {
    categoryId: 2,
    name: 'Grammar',
    isToDisplay: true,
    imageUrl:
      'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    participationIds: [
      { participationTypeId: 2, localizationKey: 'nav.recorded' },
    ],
    lessons: [
      {
        classNumber: 1,
        title: 'Basic Grammar',
        description: 'Introduction to basic grammar rules.',
        isToDisplay: true,
        imageUrl:
          'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
    ],
  },
  {
    categoryId: 4,
    name: 'Examination',
    isToDisplay: true,
    imageUrl:
      'https://images.unsplash.com/photo-1534644107580-3a4dbd494a95?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    participationIds: [
      { participationTypeId: 3, localizationKey: 'nav.notApplicable' },
    ],
    lessons: [
      {
        classNumber: 0,
        title: 'Final Exam',
        isToDisplay: true,
        description: '150+ Vocabulary test.',
        imageUrl:
          'https://images.unsplash.com/photo-1534644107580-3a4dbd494a95?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
    ],
  },
];

const EnrolleeCourseProgressTrackingByEmail = (props) => {
  const { onRequestingCourseProgressStructure, nativeLanguage, course, location } = props;
  const [selectedClasses, setSelectedClasses] = useState({});
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isConfettiVisible, setIsConfettiVisible] = useState(false);
  const locale = true;
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  useEffect(() => {
    const pathInfo = utils.getThemeCourseInfoFromUrl(location?.pathname); 
    console.log("EFFECT",nativeLanguage?.localizationId, course, pathInfo?.courseTheme);
    onRequestingCourseProgressStructure();

  }, []);

  const success = () => {
    // Show loading message
    const loadingMessage = message.loading('Submitting in progress...', 0); // '0' makes the loading message indefinite

    // Simulate the submission delay
    setTimeout(() => {
      loadingMessage(); // Close loading message

      // Show success message
      message.success('Submission successful!', 0.5); // seconds

      // Trigger confetti explosion after success
      setIsConfettiVisible(true);


      setTimeout(() => {
        //setIsConfettiVisible(false);
        setSelectedClasses({}); // Reset selections
        setEmail('');
        setIsEmailValid(true);
      }, 1000);
    }, 1000); // You can adjust this timeout to match the duration of your API request,  delay in milliseconds before the function inside the setTimeout is executed
  };

  // Handle email input change with validation
  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    setIsEmailValid(emailRegex.test(emailValue));
  };

  // Handle checkbox change for class selection
  const handleCheckboxChange = (categoryId, classNumber) => {
    setSelectedClasses((prev) => {
      const key = `${categoryId}-${classNumber}`;
      const newSelections = { ...prev };
      if (newSelections[key]) {
        delete newSelections[key];
      } else {
        newSelections[key] = {
          categoryId,
          classNumber,
          participationTypeId: null,
        };
      }
      return newSelections;
    });
  };

  // Handle participation type change
  const handleParticipationTypeChange = (
    categoryId,
    classNumber,
    participationTypeId
  ) => {
    const key = `${categoryId}-${classNumber}`;
    setSelectedClasses((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        participationTypeId,
      },
    }));
  };

  // Validate and submit data
  const handleSubmit = () => {
    if (!isEmailValid || !email.trim()) {
      message.error('Please enter a valid email address.');
      return;
    }

    const missingSelections = Object.values(selectedClasses).some(
      (item) =>
        item?.participationTypeId === null &&
        categories?.find((cat) => cat?.categoryId === item?.categoryId)
          .participationIds.length > 1
    );

    if (missingSelections) {
      message.error(
        'Please select a participation type for all required categories.'
      );
      return;
    }

    const formattedData = Object.values(selectedClasses).map(
      ({ categoryId, classNumber, participationTypeId }) => ({
        rawEmail: email,
        classNumber,
        categoryId,
        participationTypeId:
          participationTypeId ||
          categories.find((cat) => cat.categoryId === categoryId)
            .participationIds[0].participationTypeId,
        createdAt: new Date().toISOString(),
        courseCodeId,
      })
    );

    console.log('Data to submit:', formattedData);
    // API submission logic can go here
    success();
  };

  const hasSelections = Object.keys(selectedClasses).length > 0;
  // const { width, height } = useWindowSize();
  return (
    <div className="customerName">
      {/* {isConfettiVisible && <ConfettiExplosion />} */}
            {/* {isConfettiVisible && (
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
      )} */}
      <Card bordered>
        <h1>{`Course Progress Dashboard`}</h1>
        {/* <br /> */}
        {/* <div>{setLocale(locale, "resources.myprogress.requirements")}</div> */}
      </Card>
      <Row justify="center" style={{ marginBottom: 20 }}>
        <Col xs={24} sm={24} lg={8}>
          <Card title="Enter Your Email" bordered>
            <Input
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              style={{ marginBottom: 10 }}
              status={!isEmailValid ? 'error' : ''}
            />
            {!isEmailValid && (
              <div style={{ color: 'red' }}>
                Please enter a valid email address.
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {categories.map((category) =>
          category?.isToDisplay ? (
            <Col xs={24} sm={24} lg={8} key={category?.categoryId}>
              <Card
                title={category?.name}
                style={{ marginBottom: 16 }}
                cover={
                  category?.imageUrl && (
                    <img
                      alt={category?.name}
                      src={category?.imageUrl}
                      style={{ height: 80, objectFit: 'cover' }}
                    />
                  )
                }
                bordered
              >
                {category?.lessons
                  ?.filter((lesson) => lesson?.isToDisplay)
                  ?.map((lesson) => {
                    const { classNumber, title, description, imageUrl, links } =
                      lesson;
                    const key = `${category.categoryId}-${classNumber}`;
                    const isSelected = selectedClasses[key];
                    const requiresDropdown =
                      category.participationIds.length > 1;

                    return (
                      <Card
                        type="inner"
                        key={key}
                        style={{
                          marginBottom: 10,
                          position: 'relative',
                          cursor: 'pointer',
                          textAlign: 'justify'
                        }}
                        className={`course-card ${isSelected ? 'selected' : ''}`}
                        hoverable
                        title={`Class: ${classNumber}`}
                        bordered
                        extra={
                          <Checkbox
                            onChange={(e) =>
                              handleCheckboxChange(
                                category?.categoryId,
                                classNumber
                              )
                            }
                            checked={!!isSelected}
                          >
                            Select
                          </Checkbox>
                        }
                        actions={[
                          links?.facebook && (
                            <a
                              href={links.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FacebookOutlined />
                            </a>
                          ),
                          links?.youtube && (
                            <a
                              href={links.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <YoutubeOutlined />
                            </a>
                          ),
                          links?.internal && (
                            <a href={links.internal}>
                              <PlayCircleOutlined />
                            </a>
                          ),
                        ]}
                        onClick={() =>
                          !requiresDropdown
                            ? handleCheckboxChange(
                                category?.categoryId,
                                classNumber
                              )
                            : null
                        }
                      >
                        <Row gutter={16} align="middle">
                          <Col
                            flex="100px"
                            style={{ display: 'flex', justifyContent: 'center' }}
                            onClick={() =>
                              requiresDropdown
                                ? handleCheckboxChange(
                                    category?.categoryId,
                                    classNumber
                                  )
                                : null
                            }
                          >
                            {imageUrl && (
                              <img
                                alt={title}
                                src={imageUrl}
                                style={{
                                  width: '250px',
                                  height: '200px',
                                  objectFit: 'cover',
                                  borderRadius: 5,
                                  paddingBottom: '10px',
                                  justifyContent: 'center'
                                }}
                              />
                            )}
                          </Col>

                          <Col flex="auto">
                            <Meta
                              title={
                                `Title: ${title}` || `Class ${classNumber}`
                              }
                              description={
                                `Details: ${description}` ||
                                'No description available'
                              }
                              onClick={() =>
                                requiresDropdown
                                  ? handleCheckboxChange(
                                      category?.categoryId,
                                      classNumber
                                    )
                                  : null
                              }
                            />
                            {requiresDropdown && isSelected && (
                              <Select
                                placeholder="Select Participation Type"
                                onChange={(value) =>
                                  handleParticipationTypeChange(
                                    category.categoryId,
                                    classNumber,
                                    value
                                  )
                                }
                                value={
                                  selectedClasses[key]?.participationTypeId ||
                                  undefined
                                }
                                style={{ width: '100%', marginTop: 10 }}
                              >
                                {category.participationIds.map(
                                  (participation) => (
                                    <Option
                                      key={participation.participationTypeId}
                                      value={participation.participationTypeId}
                                    >
                                      {participation.localizationKey}
                                    </Option>
                                  )
                                )}
                              </Select>
                            )}
                            {!requiresDropdown && (
                              <div style={{ marginTop: 10 }}>
                                Participation:{' '}
                                {category.participationIds[0].localizationKey}
                              </div>
                            )}
                          </Col>
                        </Row>
                      </Card>
                    );
                  })}
              </Card>
            </Col>
          ) : null
        )}
      </Row>
      <Row justify="center" align="middle">
        <Col>
          <Button
            type="primary"
            onClick={handleSubmit}
            style={{ marginTop: 20 }}
            disabled={!hasSelections || !isEmailValid}
          >
            Submit Selections
          </Button>
        </Col>
      </Row>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onRequestingCourseProgressStructure,
  }, dispatch);
}

const mapStateToProps = ({ lrn, theme }) => {
  const { course } =  theme;
  const { registeredProgressByEmailId, nativeLanguage, studentPercentagesForCourse, studentCategoriesCompletedForCourse } = lrn;
  return { registeredProgressByEmailId, nativeLanguage, studentPercentagesForCourse, studentCategoriesCompletedForCourse, course };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EnrolleeCourseProgressTrackingByEmail));

