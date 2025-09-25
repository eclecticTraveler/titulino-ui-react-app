import React, { useState, useEffect } from "react";
import {
  Card,
  Checkbox,
  Select,
  Button,
  Row,
  Col,
  Input,
  message,
  Badge,
  notification 
} from 'antd';
import {
  FacebookOutlined,
  YoutubeOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import IntlMessage from "components/util-components/IntlMessage";


const { Meta } = Card;
const { Option } = Select;

export const UserProgress = ({ progressData, courseCodeId, categories, setHandleUserProgressSubmit,
   setSelectedLessons, emailId, setIsSmallConfettiVisible, setSelectedLessonsForSubmission, contactId, userProficiency }) => {
    const [selectedLessons, internalSetSelectedLessons] = useState({});
    const [userProgressLessonsToUpsert, internalSetUserProgressLessonsToUpsert] = useState({});
    const locale = true;
    const setLocale = (isLocaleOn, localeKey) => {
      return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
    };

  const success = () => {
    // Show loading message
    // const inProgressMessage = setLocale(locale, "resources.myprogress.submittingInProgress");
    const loadingMessage = message.loading('Submitting in progress...', 0); // '0' makes the loading message indefinite

 
    // Simulate the submission delay
    setTimeout(() => {
      loadingMessage(); // Close loading message
      setIsSmallConfettiVisible(true);

      // Show success message
      message.success('Submission successful!', 0.5); // seconds

      setTimeout(() => {
        setIsSmallConfettiVisible(false);
        internalSetSelectedLessons({}); // Reset selections
      }, 1000);
    }, 1000); // You can adjust this timeout to match the duration of your API request,  delay in milliseconds before the function inside the setTimeout is executed
  };

  // Handle participation type change
  const handleParticipationTypeChange = (
    categoryId,
    classNumber,
    participationTypeId
  ) => {
    const key = `${categoryId}-${classNumber}`;
    internalSetSelectedLessons((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        participationTypeId,
      },
    }));
  };

  // Validate and submit data
  const handleSubmit = () => {

    const missingSelections = Object.values(selectedLessons).some(
      (item) =>
        item.participationTypeId === null &&
        categories?.find((cat) => cat?.categoryId === item?.categoryId)
          .participationIds.length > 1
    );

    if (missingSelections) {
      message.error(
        'Please select a participation type for all required categories.'
      );
      return;
    }
 
    const formattedData = Object.values(selectedLessons)?.map(
      ({ categoryId, classNumber, participationTypeId }) => ({
        contactId,
        classNumber,
        categoryId,
        participationTypeId:
          participationTypeId ||
          categories?.find((cat) => cat?.categoryId === categoryId)
            ?.participationIds?.[0]?.participationTypeId,
        createdAt: new Date().toISOString(),
        courseCodeId,
        emailId
      })
    );
    

    console.log('Data to submit:', formattedData);
    internalSetUserProgressLessonsToUpsert(formattedData);
    // API submission logic can go here
    success();
  };

    // Share state and functions with the parent
    useEffect(() => {
      setSelectedLessons(selectedLessons); // Update parent's selectedLessons
      setHandleUserProgressSubmit(() => handleSubmit); // Provide handleSubmit function to the parent (Function delegate)
      setSelectedLessonsForSubmission(userProgressLessonsToUpsert)
    }, [selectedLessons, userProgressLessonsToUpsert]);

  // Handle checkbox change for class selection
  const handleCheckboxChange = (categoryId, classNumber, participationIds) => {
    internalSetSelectedLessons((prev) => {
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


  // map proficiency to level
const getLevelFromProficiency = (abbr) => {
  if (!abbr) return 1; // default
  const basicLevels = ["be", "ba"];
  const advancedLevels = ["in", "na", "ad"];

  if (basicLevels.includes(abbr)) return 1;
  if (advancedLevels.includes(abbr)) return 2;
  return 1; // fallback
};

const levelToUse = getLevelFromProficiency(userProficiency);

// Combine categories and progress data
const combinedCategories = categories
  ?.filter((category) => {
    // If category has no level, always include
    if (!category?.level) return true;

    // Only include categories matching the derived level
    return category.level === levelToUse;
  })
  ?.map((category) => {
    // Create progressLessons (still tie progress to correct category + level)
    const progressLessons = progressData
      ?.filter(
        (progress) =>
          progress?.CategoryId === category?.categoryId &&
          (!category?.level || category?.level === levelToUse)
      )
      ?.map((progress) => ({
        classNumber: progress?.ClassNumber,
        completedDate: new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(progress?.CreatedAt)),
        isCompleted: true,
      }));

    return {
      ...category,
      lessons: category?.lessons
        ? [...category.lessons].sort((a, b) => a?.classNumber - b?.classNumber)
        : [],
      progressLessons,
    };
  });


  return (
    <div>
      <Row gutter={[16, 16]}>
        {combinedCategories?.map((category) => {
          if (!category.isToDisplay) return null; // If category is not to be displayed, skip it

          return (
            <Col xs={24} sm={24} lg={8} key={category?.categoryId}>
              <Card
                key={category?.categoryId}
                title={`${category?.name}`}
                extra={<span>{category?.localizationKey}</span>}
                style={{ marginBottom: 16, marginTop: 16 }}
                cover={
                  category?.imageUrl && (
                    <img
                      alt={category?.name}
                      src={category?.imageUrl}
                      style={{ height: 100, objectFit: 'cover' }}
                    />
                  )
                }
              >
                {category?.lessons
                  ?.filter((lesson) => lesson?.isToDisplay)
                  ?.map((lesson, index) => {
                    const progressLesson = category?.progressLessons?.find(
                      (progress) => progress?.classNumber === lesson?.classNumber
                    );

                    const {
                      availableDate,
                      classNumber,
                      title,
                      description,
                      imageUrl,
                      links,
                    } = lesson;

                    // For the badge
                    const isCompleted = progressLesson
                      ? progressLesson?.isCompleted
                      : false;
                    const completedDate = progressLesson?.completedDate;
                    const classNo = (
                      <>
                        {setLocale(locale, "resources.userProgress.class")}: {classNumber}
                      </>
                    );
                                        
                    // For selection
                    
                    const key = `${category?.categoryId}-${classNumber}`;
                    const isSelected = selectedLessons[key];
                    const requiresDropdown =
                      category?.participationIds?.length > 1;

                    const today = new Date();
                    const targetDate = new Date(availableDate);

                    // Truncate time to UTC
                    const todayDateOnly = new Date(
                      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
                    );
                    const targetDateOnly = new Date(
                      Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate())
                    );

                    // Compare the dates
                    const lessonIsAvailableForUser =
                      todayDateOnly >= targetDateOnly;

                    return (
                      <Col key={index}>
                        {isCompleted ? (
                          <Badge.Ribbon text={setLocale(locale, "resources.userProgress.completed")} color="#c9930a" style={{
                            marginTop: 40,
                            cursor: 'pointer'
                          }}>
                            <Card
                              hoverable
                              style={{                                
                                height: 368,
                                marginBottom: 16,
                                background: `
                                radial-gradient(ellipse farthest-corner at right top, #FFFFFF 0%, #FFFFAC 8%, #D1B464 25%, #5d4a1f 100%, #5d4a1f 10%),
                                radial-gradient(ellipse farthest-corner at right bottom, #FEDB37 80%, #FDB931 60%, #9f7928 80%, #8A6E2F 80%, transparent 0%)
                              `,
                              }}
                              type="inner"
                              title={
                                <div className="completed-lesson-title">
                                  <Badge
                                    key={index}
                                    color="#c9930a"
                                    text={
                                      completedDate ? (
                                        <>
                                          {classNo}, {setLocale(locale, "resources.userProgress.recordedOn")}: {completedDate}
                                        </>
                                      ) : (
                                        ''
                                      )
                                    }
                                  />
                                </div>
                              }
                            >
                              <Row gutter={16}>
                                <Col flex="100px">
                                  {imageUrl && (
                                    <img
                                      alt={title}
                                      src={imageUrl}
                                      className="responsive-image"
                                    />
                                  )}
                                </Col>
                              </Row>
                              <div className='ant-card-meta-detail-progress'>
                              <Card.Meta                                
                                title={
                                  <div className='card-completed-meta'>
                                     {title ? (
                                      <>
                                        {setLocale(locale, "resources.userProgress.title")}: {title}
                                      </>
                                    ) : (
                                      <>
                                        {setLocale(locale, "resources.userProgress.class")} {classNo}
                                      </>
                                    )}
                                  </div>
                                  
                                } 
                                description={
                                <div className='card-completed-meta'>
                                  {description}
                                </div>                                  
                                }
                              />
                              </div>
                            </Card>
                          </Badge.Ribbon>
                        ) : !isCompleted && lessonIsAvailableForUser ? (
                          <Badge.Ribbon
                            text={setLocale(locale, "resources.userProgress.readyForTracking")}
                            color="green"
                            style={{
                              marginTop: 46,
                              cursor: 'pointer',
                            }}
                          >
                            <Card
                              type="inner"
                              key={key}
                              style={{
                                marginBottom: 10,
                                position: 'relative',
                                cursor: 'pointer',
                              }}
                              className={isSelected ? 'selected-card' : ''}
                              hoverable
                              title={
                                <div className="completed-lesson-title">
                                  <Badge
                                    key={index}
                                    color="green"
                                    text={
                                      <>
                                        {setLocale(locale, "resources.userProgress.class")}: {classNumber}
                                      </>
                                    }
                                  />
                                </div>
                              }
                              bordered
                              extra={
                                <Checkbox
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent the click event from propagating to the Card
                                    if (requiresDropdown) {
                                      handleCheckboxChange(category?.categoryId, classNumber);
                                    }
                                  }}
                                  checked={!!isSelected}
                                >
                                  {setLocale(locale, "resources.userProgress.select")}
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
                                      className="responsive-image tamo-ai-na-atividade"
                                    />
                                  )}
                                </Col>

                                <Col flex="auto">
                                  <Meta
                                    className='ant-card-meta-detail-progress'
                                    title={
                                      <>
                                        {title
                                          ? (
                                              <>
                                                {setLocale(locale, "resources.userProgress.title")}: {title}
                                              </>
                                            )
                                          : (
                                              <>
                                                {setLocale(locale, "resources.userProgress.class")} {classNumber}
                                              </>
                                            )}
                                      </>
                                    }
                                    description={
                                      <>
                                        {description
                                          ? (
                                              <>
                                                {setLocale(locale, "resources.userProgress.details")}: {description}
                                              </>
                                            )
                                          : (
                                              <>
                                                {setLocale(locale, "resources.userProgress.noDescription")}
                                              </>
                                            )}
                                      </>
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
                                    <>
                                    <div style={{color:'red'}}>{setLocale(locale, "resources.userProgress.selectOptions")}:</div>
                                    <Select
                                      placeholder={setLocale(locale, "resources.userProgress.participationType")}
                                      onChange={(value) =>
                                        handleParticipationTypeChange(
                                          category?.categoryId,
                                          classNumber,
                                          value
                                        )
                                      }
                                      value={
                                        selectedLessons[key]
                                          ?.participationTypeId || undefined
                                      }
                                      style={{ width: '100%', marginTop: 10 }}
                                    >
                                      {category?.participationIds?.map(
                                        (participation) => (
                                          <Option
                                            key={
                                              participation.participationTypeId
                                            }
                                            value={
                                              participation.participationTypeId
                                            }
                                          >
                                            {setLocale(locale, participation?.localizationKey)}
                                          </Option>
                                        )
                                      )}
                                    </Select>
                                    </>
                                  )}
                                  {!requiresDropdown && (
                                    <div style={{ marginTop: 10 }}>
                                      {<>{setLocale(locale, "resources.userProgress.participation")}</>}:{' '}
                                      {
                                        <>{setLocale(locale, category?.participationIds[0]?.localizationKey)}</>                                       
                                      }
                                    </div>
                                  )}
                                </Col>
                              </Row>
                            </Card>
                          </Badge.Ribbon>
                        ) : (
                          <Badge.Ribbon 
                          text={
                            <>
                              {setLocale(locale, "resources.userProgress.availableAfter")}: {availableDate}
                            </>
                          }
                          color="red" style={{
                            marginTop: 40,
                            cursor: 'pointer'
                          }}>
                          <Card
                            hoverable
                            style={{
                              marginBottom: 16,
                            }}
                            type="inner"
                            title={
                              <div>
                                <Badge
                                  key={index}
                                  color={'red'}
                                  text={<>{classNo}</>}
                                />
                              </div>
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
                          >
                            <Row gutter={16}>
                              <Col flex="100px">
                                {imageUrl && (
                                  <img
                                    alt={title}
                                    src={imageUrl}
                                    className="responsive-image"
                                  />
                                )}
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Card.Meta
                                className='ant-card-meta-detail-progress'
                                title={
                                  title ? (
                                    <>
                                      {setLocale(locale, "resources.userProgress.title")}: {title}
                                    </>
                                  ) : (
                                    <>
                                      {setLocale(locale, "resources.userProgress.class")} {classNumber}
                                    </>
                                  )
                                }                                
                                description={description}
                              />
                            </Row>
                          </Card>
                          </Badge.Ribbon>
                        )}
                      </Col>
                    );
                  })}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default UserProgress;