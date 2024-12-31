import React from "react";
import IntlMessage from "components/util-components/IntlMessage";

const CourseDetails = ({ course }) => {
  const locale = true;
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div>
        <h4><strong>{setLocale(locale, "settings.menu.sub.title.1")}:</strong> {course?.CourseDetails?.course}</h4>
        <p><strong>{setLocale(locale, "enrollment.courseDetails.teacher")}:</strong> {course?.CourseDetails?.teacher}</p>
        <p><strong>{setLocale(locale, "enrollment.courseDetails.location")}:</strong> {course?.CourseDetails?.location}</p>
        <p>
          <strong>{setLocale(locale, "enrollment.courseDetails.time")}:</strong> {course?.CourseDetails?.gatheringTime} on{" "}
          {course?.CourseDetails?.gatheringDay}
        </p>
        <p><strong>{setLocale(locale, "enrollment.courseDetails.duration")}:</strong> {course?.CourseDetails?.courseWeeksLength} {" "}{setLocale(locale, "enrollment.courseDetails.weeks")}.</p>
        <p>
          <strong>{setLocale(locale, "enrollment.courseDetails.targetAudience")}:</strong>{" "}
          {setLocale(locale, "enrollment.courseDetails.allLevels")}.
        </p>
      </div>
    </div>
  );
};

export default CourseDetails;
