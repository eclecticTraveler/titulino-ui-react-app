import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onRenderingCourseRegistration, onSelectingEnrollmentCourses } from "redux/actions/Lrn";
import ReusableColCard from "./ReusableColCard";
import CourseDisplayInfo from "./CourseDisplayInfo";

export const CourseCards = (props) => {
  const { availableCourses, onSelectingEnrollmentCourses, selectedCoursesToEnroll } = props;

  const toggleCourseSelection = (courseCodeId) => {
    const updatedSelectedCourses = selectedCoursesToEnroll.includes(courseCodeId)
      ? selectedCoursesToEnroll.filter(id => id !== courseCodeId)
      : [...selectedCoursesToEnroll, courseCodeId];

    onSelectingEnrollmentCourses(updatedSelectedCourses);
  };

  return (
    <>
      {availableCourses?.map((course, index) => (
        <ReusableColCard
          key={index}
          selected={selectedCoursesToEnroll?.includes(course?.CourseCodeId)}
          onClick={() => toggleCourseSelection(course?.CourseCodeId)}
          course={course}
          totalCardsToBeRender={availableCourses?.length}
        >
          <CourseDisplayInfo
            course={course}
            selected={selectedCoursesToEnroll?.includes(course?.CourseCodeId)}
            toggleCourseSelection={toggleCourseSelection}
          />
        </ReusableColCard>
      ))}
    </>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onRenderingCourseRegistration,
    onSelectingEnrollmentCourses,
  }, dispatch);
}

const mapStateToProps = ({ lrn }) => {
  const { availableCourses, selectedCoursesToEnroll } = lrn;
  return { availableCourses, selectedCoursesToEnroll };
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseCards);
