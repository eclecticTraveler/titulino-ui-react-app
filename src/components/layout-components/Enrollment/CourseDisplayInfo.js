import React from "react";
import { Checkbox } from "antd";
import CourseDetails from "./CourseDetails";

const CourseDisplayInfo = ({ course, selected, toggleCourseSelection }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginLeft: 16 }}>
    <CourseDetails course={course} />
    <Checkbox
      checked={selected}
      onChange={() => toggleCourseSelection(course?.CourseCodeId)}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
      }}
    />
  </div>
);

export default CourseDisplayInfo;
