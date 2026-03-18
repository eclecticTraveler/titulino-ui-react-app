import React, { useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import {toggleCollapsedNav, onMobileNavToggle} from 'redux/actions/Theme';
import { onRenderingCourseRegistration, onLoginForEnrollment, onRenderingUserCoursesAvailableForRegistration } from "redux/actions/Lrn";
import Loading from "components/shared-components/Loading";
import WeeklyCourseSelector from "./WeeklyCourseSelector";
import QuickToFullEnrollment from "./QuickToFullEnrollment";
import AuthenticatedQuickEnrollment from "./AuthenticatedQuickEnrollment";
import CoursesNotAvailableMessage from "components/admin-components/ModalMessages/CoursesNotAvailableMessage";
import { useLocation } from 'utils/routerCompat';
 
export const EnrollmentWrapper = (props) => {
	const { user, token, onRenderingUserCoursesAvailableForRegistration, onRenderingCourseRegistration, availableCourses, selectedCoursesToEnroll } = props;
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

    }, [token, user?.contactId, user?.emailId, onRenderingCourseRegistration, onRenderingUserCoursesAvailableForRegistration]);

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
	const {currentRoute, availableCourses, selectedCoursesToEnroll} = lrn;
	const { sideNavTheme, topNavColor, navCollapsed } = theme;
  const { token } = auth;
  const { user } = grant
	return { sideNavTheme, topNavColor, currentRoute, navCollapsed, availableCourses, selectedCoursesToEnroll, token, user };
};

export default connect(mapStateToProps, mapDispatchToProps)(EnrollmentWrapper);

