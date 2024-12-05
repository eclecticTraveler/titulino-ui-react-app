import React from "react";

const CourseDetails = ({ course }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <div>
      <h4><strong>Theme:</strong> {course?.CourseDetails?.course}</h4>
      <p><strong>Teacher:</strong> {course?.CourseDetails?.teacher}</p>
      <p><strong>Location:</strong> {course?.CourseDetails?.location}</p>
      <p><strong>Time:</strong> {course?.CourseDetails?.gatheringTime} on {course?.CourseDetails?.gatheringDay}</p>
      <p><strong>Duration:</strong> {course?.CourseDetails?.courseWeeksLength} weeks.</p>
      <p><strong>Target Audience:</strong> {course?.CourseDetails?.targetAudienceNativeLanguage} speakers all levels.</p>
    </div>
  </div>
);

export default CourseDetails;
