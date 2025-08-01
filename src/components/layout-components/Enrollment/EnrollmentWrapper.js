import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { Row, Col } from 'antd';
import ContactEnrollment from './ContactEnrollment';
import {toggleCollapsedNav, onMobileNavToggle} from 'redux/actions/Theme';
import { onRenderingCourseRegistration, onLoginForEnrollment, onRenderingUserCoursesAvailableForRegistration } from "redux/actions/Lrn";
import Loading from "components/shared-components/Loading";
import CourseSelection from "./CourseSelection";
import WeeklyCourseSelector from "./WeeklyCourseSelector";
import QuickToFullEnrollment from "./QuickToFullEnrollment";
import AuthenticatedQuickEnrollment from "./AuthenticatedQuickEnrollment";
import CoursesNotAvailableMessage from "components/admin-components/ModalMessages/CoursesNotAvailableMessage";
import { useLocation } from "react-router-dom";

let courseData = [
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
 
export const EnrollmentWrapper = (props) => {
	const { user, token, mobileNav, onMobileNavToggle, toggleCollapsedNav, navCollapsed, onRenderingUserCoursesAvailableForRegistration, 
         onRenderingCourseRegistration, availableCourses, onLoginForEnrollment, apiToken, selectedCoursesToEnroll } = props;
  const location = useLocation();
  const { email, dateOfBirth, isToDoFullEnrollment, isSubmitBtnEnabled } = location.state || {};
    // If you need componentDidMount/componentDidUpdate-like behavior, you can use useEffect:
    useEffect(() => {
        // This runs once on mount (componentDidMount)
        if(token && user?.contactId){
          onRenderingUserCoursesAvailableForRegistration(user?.emailId);
        }else{
          onRenderingCourseRegistration();
        }

    }, []); // Empty array ensures this runs only once, similar to componentDidMount.

    if(!availableCourses){
        return (
            <>
                <Loading cover="content"/>
            </>
        )
    }else if(availableCourses?.length === 0){
        return (
            <>                            
                <CoursesNotAvailableMessage />
            </>
        )
    }else{
        if((availableCourses && availableCourses?.length > 1) && (selectedCoursesToEnroll && selectedCoursesToEnroll?.length === 0)){
            return (
                <div>
                     <WeeklyCourseSelector/>
                </div>
            );
        }
        else if(token && user?.contactId && (selectedCoursesToEnroll && selectedCoursesToEnroll?.length !== 0)){
          return (
            <div>
              <AuthenticatedQuickEnrollment/>
          </div>
          )
        }          
        else{
            return (
                <div>
                     <QuickToFullEnrollment
                        passedEmail={email}
                        passedDateOfBirth={dateOfBirth}
                        isToDoFullEnrollment={isToDoFullEnrollment}
                        passedSubmitBtnEnabled={isSubmitBtnEnabled}
                      />
                </div>
            );
        }
    }
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		toggleCollapsedNav: toggleCollapsedNav,
		onMobileNavToggle: onMobileNavToggle,
    onRenderingCourseRegistration: onRenderingCourseRegistration,
    onLoginForEnrollment: onLoginForEnrollment,
    onRenderingUserCoursesAvailableForRegistration: onRenderingUserCoursesAvailableForRegistration
	}, dispatch)
}

const mapStateToProps = ({ theme, lrn, auth, grant }) => {
	const {currentRoute, availableCourses, apiToken, selectedCoursesToEnroll} = lrn;
	const { sideNavTheme, topNavColor, navCollapsed } = theme;
  const { token } = auth;
  const { user } = grant
	return { sideNavTheme, topNavColor, currentRoute, navCollapsed, availableCourses, apiToken, selectedCoursesToEnroll, token, user };
};

export default connect(mapStateToProps, mapDispatchToProps)(EnrollmentWrapper);