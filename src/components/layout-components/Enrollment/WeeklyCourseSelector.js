import React, { useState, useMemo  } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onSelectingEnrollmentCourses } from "redux/actions/Lrn";
import { Form, Input, Radio, Select, Checkbox, Button, Card, Divider, Row, Col, Space, message  } from "antd";
import { CheckCircleOutlined, LeftSquareTwoTone } from "@ant-design/icons";
import IntlMessage from "components/util-components/IntlMessage";
import getLocaleText from "components/util-components/IntString";

const { Option } = Select;

// Sample course data (use your own array here)
const courseData = [
  {
    CourseCodeId: "SUPERMARKET_SEP_2024_COURSE_01",
    CourseDetails: [{
      course: "Supermarket",
      gatheringDay: "Tuesdays",
      gatheringTime: "7:00 pm",
      teacher: "Arellano",
      location: "Rexburg, Idaho",
    },
    {
      course: "Supermarket Conversation",
      gatheringDay: "Thursday",
      gatheringTime: "7:00 pm",
      teacher: "Arellano",
      location: "Rexburg, Idaho",
    },
  ]
  },
  {
    CourseCodeId: "DUMMY_TEST_DEC_2024_COURSE_01",
    CourseDetails: {
      course: "Dummy",
      gatheringDay: "Tuesdays",
      gatheringTime: "7:00 pm",
      teacher: "Arellano",
      location: "Rexburg, Idaho",
    },
  },
  {
    CourseCodeId: "WORK_AND_JOBS_JULY_2025_COURSE_01",
    CourseDetails: {
      course: "Work & Jobs Part 1",
      gatheringDay: "Mondays",
      gatheringTime: "4:30 pm",
      teacher: "Bro. Arellano",
      location: "Online from Utah/Idaho",
    },
  },
  {
    CourseCodeId: "HOUSEHOLD_ITEMS_PART_1_JAN_2025_COURSE_01",
    CourseDetails: {
      course: "Household Items - Part 1",
      gatheringDay: "Mondays",
      gatheringTime: "4:30 pm",
      teacher: "Bro. Arellano",
      location: "Online from Rexburg, Idaho",
    },
  },
  {
    CourseCodeId: "HOUSEHOLD_ITEMS_PART_1_JAN_2025_COURSE_02",
    CourseDetails: {
      course: "Household Items - Part 2",
      gatheringDay: "Friday",
      gatheringTime: "4:30 pm",
      teacher: "Bro. Arellano",
      location: "Online from Rexburg, Idaho",
    },
  },
  {
    CourseCodeId: "HOUSEHOLD_ITEMS_PART_1_JAN_2025_COURSE_03",
    CourseDetails: {
      course: "Household Items - Part 3",
      gatheringDay: "Thursday",
      gatheringTime: "4:30 pm",
      teacher: "Bro. Arellano",
      location: "Online from Rexburg, Idaho",
    },
  },
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const WeeklyCourseSelector = (props) => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const { availableCourses, onSelectingEnrollmentCourses } = props;
  let availableCoursesToSelectFrom = [];  
  if(availableCourses){
    // availableCoursesToSelectFrom = [...availableCourses, ...courseData];
    availableCoursesToSelectFrom = [...availableCourses];
  }

    const locale = true;
    const setLocale = (isLocaleOn, localeKey) => {
      return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
    };

    const setLocaleString = (isLocaleOn, localeKey, defaultMessage = "") => {
      return isLocaleOn
        ? getLocaleText(localeKey, defaultMessage) // Uses the new function
        : localeKey.toString(); // Falls back to the key if localization is off
    }; 

  const normalizeCourses = (courses) =>
    courses.map(course => ({
      ...course,
      CourseDetails: Array.isArray(course.CourseDetails)
        ? course.CourseDetails
        : [course.CourseDetails]
    }));

  const normalizedCourseData = normalizeCourses(availableCoursesToSelectFrom);

  const flatCourseDetails = normalizedCourseData.flatMap(course =>
    course.CourseDetails.map((detail, index) => ({
      ...detail,
      CourseCodeId: course.CourseCodeId,
      fullCourse: course
    }))
  );

  const normalizeDay = (day) => {
    const lower = day?.toLowerCase();
    return daysOfWeek.find(d => lower?.includes(d?.toLowerCase()));
  };

  const groupedCourses = useMemo(() => {
    const groups = daysOfWeek?.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {});
  
    flatCourseDetails.forEach(detail => {
      const day = normalizeDay(detail.gatheringDay);
      if (day) {
        groups[day].push(detail);
      }
    });
  
    return groups;
  }, [flatCourseDetails]);
  
  const handleSaveSelection = () => {
    console.log("selectedCourses", selectedCourses);
    // save the contact ids
    onSelectingEnrollmentCourses(selectedCourses)
    
  }; 

  const hasTimeConflict = (newCourseDetail) => {
    const newDay = normalizeDay(newCourseDetail.gatheringDay);
    const newTime = newCourseDetail.gatheringTime;
  
    return selectedCourses.some(code => {
      const course = availableCoursesToSelectFrom?.find(c => c.CourseCodeId === code);
  
      if (!course) return false;
  
      const details = Array.isArray(course.CourseDetails)
        ? course.CourseDetails
        : [course.CourseDetails];
  
      return details.some(detail =>
        normalizeDay(detail.gatheringDay) === newDay &&
        detail.gatheringTime === newTime
      );
    });
  };
  

  const toggleSelection = (courseDetail) => {
    const codeId = courseDetail.CourseCodeId;
    const alreadySelected = selectedCourses.includes(codeId);
  
    const detailsWithSameId = flatCourseDetails.filter(
      detail => detail.CourseCodeId === codeId
    );
  
    if (!alreadySelected && detailsWithSameId.some(hasTimeConflict)) {
      message.warning("Course overlaps with an already selected course.");
      const translation = setLocaleString(locale, "enrollment.timeConflictWarning");
      console.log("translation", translation)
      // message.warning(
      //   translation
      // );
      
      return;
    }
  
    setSelectedCourses(prev =>
      alreadySelected ? prev.filter(id => id !== codeId) : [...prev, codeId]
    );
  };
  

  const daysWithCourses = Object.entries(groupedCourses).filter(
    ([_, courses]) => courses.length > 0
  );

  const weeklyCoverUrl = "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?q=80&w=2352&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const coverUrl = "https://images.unsplash.com/photo-1582812532891-7968f272fc9a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            bordered
            cover={
              <img
                alt="Course Selection Banner"
                src={coverUrl}
                style={{ height: 100, objectFit: "cover" }}
              />
            }
          >
            <h1>
              {setLocale(locale, "enrollment.weeklySelectionTitle")}
            </h1>
          </Card>
        </Col>

        {daysWithCourses.map(([day, courses]) => (
          <Col xs={24} sm={24} md={8} lg={8} key={day}>
            {/* // <Col xs={12} sm={12} lg={courses?.length === 1 ? { span: 12, offset: 6 } : 12} key={day}> */}
            
            <Card
              title={setLocale(locale, `days.${day.toLowerCase()}`)}
              bordered
              style={{ minHeight: 100 }}
              bodyStyle={{ padding: 12 }}
              cover={
                <img
                  alt={day}
                  src={weeklyCoverUrl}
                  style={{ height: 50, objectFit: "cover" }}
                />
              }
            >
            {courses.map((detail) => {
              const selected = selectedCourses.includes(detail.CourseCodeId);
              return (
                <Card
                  key={`${detail.CourseCodeId}-${detail.gatheringDay}`}
                  hoverable
                  style={{
                    marginBottom: 12,
                    backgroundColor: selected ? "#e79547" : "white",
                    borderColor: selected ? "#f7caa5" : "#f0f0f0",
                    boxShadow: selected ? "0 0 0 2px #f7caa5" : "none"
                  }}
                  onClick={() => toggleSelection(detail)}
                >
                  <Row gutter={12} align="middle">
                    <Col flex="100px">
                      <img
                        alt={detail?.course}
                        src={
                          detail?.imageUrl ||
                          process.env.PUBLIC_URL + "/img/avatars/tempProfile.jpg"
                        }
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: selected ? "2px solid #f7caa5" : "1px solid #ccc"
                        }}
                      />
                    </Col>
                    <Col flex="auto">
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <strong>{detail?.course}</strong>
                          <br />
                          <small>{detail?.gatheringTime}</small>
                          <br />
                          <small>{detail?.location}</small>
                        </div>
                        {selected && (
                          <CheckCircleOutlined
                            style={{
                              color: "#f7caa5",
                              fontSize: 24,
                              marginLeft: 12
                            }}
                          />
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card>
              );
            })}


            </Card>
          </Col>
        ))}
        <Col span={24}>
          <Card
            bordered
          >
          <Button type="primary" size="large" block onClick={handleSaveSelection} disabled={selectedCourses?.length === 0}>
            {setLocale(locale, "enrollment.continue")}
          </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        onSelectingEnrollmentCourses: onSelectingEnrollmentCourses
    }, dispatch);
}


const mapStateToProps = ({ lrn }) => {
  const { selectedCoursesToEnroll, availableCourses } = lrn;
  return { selectedCoursesToEnroll, availableCourses };
};

export default connect(mapStateToProps, mapDispatchToProps)(WeeklyCourseSelector);
