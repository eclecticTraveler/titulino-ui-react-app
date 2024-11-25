import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { onRenderingCourseRegistration } from "redux/actions/Lrn";
import { Form, Input, Radio, Select, Checkbox, Button, Card, Divider, Row, Col, Space  } from "antd";
import CourseCards from "./CourseCards";

const { Option } = Select;

export const CourseSelection = (props) => {
  const { selectedCoursesToEnroll } = props;

  // Handler to save selected courses on button click
  const handleSaveSelection = () => {
    // console.log("selectedCourses", selectedCourses);
    // onEnrollmentCourseSelection(selectedCourses)
  };
  return (
    <div className="container customerName" >
      <Card bordered={true}>
          <h1>Select Courses to Enroll</h1>
      </Card>
      <Row gutter={[16, 16]} justify="center">
        <CourseCards />
      </Row>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button
          type="primary"
          onClick={handleSaveSelection}
          disabled={selectedCoursesToEnroll?.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        onRenderingCourseRegistration: onRenderingCourseRegistration
    }, dispatch);
}


const mapStateToProps = ({ lrn }) => {
  const { selectedCoursesToEnroll } = lrn;
  return { selectedCoursesToEnroll };
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseSelection);
