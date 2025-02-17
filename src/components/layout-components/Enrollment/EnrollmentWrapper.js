import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { Row, Col } from 'antd';
import ContactEnrollment from './ContactEnrollment';
import {toggleCollapsedNav, onMobileNavToggle} from 'redux/actions/Theme';
import { onRenderingCourseRegistration, onLoginForEnrollment } from "redux/actions/Lrn";
import Loading from "components/shared-components/Loading";
import CourseSelection from "./CourseSelection";
import QuickToFullEnrollment from "./QuickToFullEnrollment";
import CoursesNotAvailableMessage from "components/admin-components/ModalMessages/CoursesNotAvailableMessage";

 
export const EnrollmentWrapper = (props) => {
	const { mobileNav, onMobileNavToggle, toggleCollapsedNav, navCollapsed, onRenderingCourseRegistration, availableCourses, onLoginForEnrollment, apiToken } = props;
    // If you need componentDidMount/componentDidUpdate-like behavior, you can use useEffect:
    useEffect(() => {
        // This runs once on mount (componentDidMount)
        // If you have code that should run on component update, add dependencies to the array.
        onRenderingCourseRegistration();
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
        // if(availableCourses?.length > 1){
        //     return (
        //         <div>
                    
        //             {/* <QuickToFullEnrollment/> */}
        //              <CourseSelection/>
        //              {/* <ContactEnrollment /> */}
        //         </div>
        //     );
        // }else{
        //     return (
        //         <div>
        //              <QuickToFullEnrollment/>
        //         </div>
        //     );
        // }
        return (
            <div>
                 <QuickToFullEnrollment/>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		toggleCollapsedNav: toggleCollapsedNav,
		onMobileNavToggle: onMobileNavToggle,
        onRenderingCourseRegistration: onRenderingCourseRegistration,
        onLoginForEnrollment: onLoginForEnrollment
	}, dispatch)
}

const mapStateToProps = ({ theme, lrn }) => {
	const {currentRoute, availableCourses, apiToken} = lrn;
	const { sideNavTheme, topNavColor, navCollapsed } = theme;
	return { sideNavTheme, topNavColor, currentRoute, navCollapsed, availableCourses, apiToken };
};

export default connect(mapStateToProps, mapDispatchToProps)(EnrollmentWrapper);