import React, {Component} from 'react'
import LandingWrapper from '../../../components/layout-components/Landing/LandingWrapper';
import CourseLandingDashboard from 'components/layout-components/Landing/Unauthenticated/CourseLandingDashboard';
import { geteBookUrl, getUserEBookUrl, onLoadingEnrolleeByRegion, onLoadingUserResourcesByCourseTheme, onVerifyingIfUserIsEnrolledInCourse, onResolvingFacilitadorForThemeCourse }  from 'redux/actions/Lrn';
import { onLoadingAuthenticatedLandingPage, onAuthenticatingWithSSO } from 'redux/actions/Grant';
import ProgressDashboardByEmailV4 from 'components/layout-components/ProgressDashboardByEmailV4';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import utils from 'utils';
import Loading from 'components/shared-components/Loading';
import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';
import { env } from 'configs/EnvironmentConfig';
import FacilitatorsLandingDashboard from 'components/admin-components/Insights/FacilitatorsLandingDashboard';

class CourseLevel extends Component {

    loadCourseLandingData = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        const pathTheme = utils.getThemeCourseInfoFromUrl(this.props.location?.pathname); 
        
        this.props.onLoadingEnrolleeByRegion(pathTheme?.courseTheme);
        this.props.onLoadingUserResourcesByCourseTheme(pathTheme?.courseTheme, this.props.baseLanguage?.localeCode, this.props.contentLanguage);
        // check if there is a user object saved and valid and fetch it
        if(this.props.token?.email){            
            this.props.onLoadingAuthenticatedLandingPage(this.props.token?.email);
        }else{
            if(!this.props.user?.emailId){                
                this.props.onAuthenticatingWithSSO(this.props.token?.email);
            }
        }

        if(this.props?.user?.emailId){
            this.props.onVerifyingIfUserIsEnrolledInCourse(pathTheme?.courseTheme, this.props.user?.emailId);
            this.props.onResolvingFacilitadorForThemeCourse(pathTheme?.courseTheme, this.props.user?.emailId);
            this.props.getUserEBookUrl(pathInfo?.levelNo, this.props.baseLanguage?.localeCode, this.props.contentLanguage, this.props.user?.emailId);
        }

    }

    loadPublicCourseLandingData = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.geteBookUrl(pathInfo?.levelNo, this.props.baseLanguage?.localeCode, this.props.contentLanguage );

    }

    
    componentDidMount() {                
        this.loadCourseLandingData();        
    }

    componentDidUpdate(prevProps) {             
        const tokenChanged = this.props.token !== prevProps.token;
        const pathChanged = this.props.location?.pathname !== prevProps?.location?.pathname;
        const isAuthenticated = !!this.props.token;
        const userCoursesChanged = this.props.user?.userCourses !== prevProps.user?.userCourses;

        if (isAuthenticated && pathChanged) {
            // Logged in + navigating around
            this.loadCourseLandingData();
        } else if (!isAuthenticated && (tokenChanged || pathChanged)) {
            // Not logged in, either signed out or navigating
            this.loadPublicCourseLandingData();
        }

        // Re-resolve facilitador when user profile arrives or path changes
        if (userCoursesChanged || pathChanged) {
            const pathTheme = utils.getThemeCourseInfoFromUrl(this.props.location?.pathname);
            if (this.props?.user?.emailId) {
                this.props.onResolvingFacilitadorForThemeCourse(pathTheme?.courseTheme, this.props.user?.emailId);
            }
        }
      }

    render() {
        console.log("this.props.facilitadorCourseCodeId", this.props.facilitadorCourseCodeId);
        if(this.props.token){
            if(this.props.user?.emailId && !this.props.user?.yearOfBirth){
                return (
                    <div id="unathenticated-landing-page-margin">
                        <EmailYearSearchForm/>
                    </div>
                )
            } else if(this.props.user?.emailId && this.props.user?.yearOfBirth) {

                if (this.props.userIsEnrolledInCourse === true) {

                    if(env.IS_TO_DISPLAY_PROGRESS_DASHBOARD) {
                        if (this.props.facilitadorCourseCodeId) {
                            return (
                                <div id="unathenticated-landing-page-margin">
                                    <FacilitatorsLandingDashboard
                                        courseCodeId={this.props.facilitadorCourseCodeId}
                                        showMyProgressTab={true}
                                    />
                                </div>
                            );
                        }
                        return (
                            <div id="unathenticated-landing-page-margin">
                                <ProgressDashboardByEmailV4 />
                            </div>
                        );
                    }else{
                        if (this.props.ebookUrl) {
                                return (
                                    <div id="unathenticated-landing-page-margin">
                                        <InternalIFrame iFrameUrl={this.props.ebookUrl} />
                                    </div>
                                );
                            }
                    }
                } else if (this.props.userIsEnrolledInCourse === false) {
                    if (this.props.ebookUrl) {
                        return (
                            <div id="unathenticated-landing-page-margin">
                                <InternalIFrame iFrameUrl={this.props.ebookUrl} />
                            </div>
                        );
                    } else {
                        return (
                            <div id="unathenticated-landing-page-margin">
                                <LandingWrapper course={this.props?.match?.params?.level} coursePath={this.props?.location.pathname} />
                            </div>
                        );
                    }
                } else {
                    // While waiting for enrollment check to complete
                    return (
                        <div id="unathenticated-landing-page-margin">
                            <Loading cover="content" />
                        </div>
                    );
                }

            } else {
                return (
                    <div id="unathenticated-landing-page-margin">
                        Processing v1
                        <Loading cover="content"/>
                    </div>
                )
            }
        }else{
            if(this.props.ebookUrl){
                return (
                    <div id="unathenticated-landing-page-margin">
                         <CourseLandingDashboard course={this.props?.match?.params?.level} 
                                                 url={this.props.ebookUrl} 
                                                 totalStudentsCount={this.props.totalEnrolleeCount} 
                                                 enrolleeRegion={this.props.enrolleeCountByRegion}/>
                    </div>
                ) 
            }else{
                return (
                    <div id="unathenticated-landing-page-margin">
                         <LandingWrapper course={this.props?.match?.params?.level} coursePath={this.props?.location.pathname}/>              
                    </div>
                ) 
            }  
        }    
    }
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
        onLoadingEnrolleeByRegion: onLoadingEnrolleeByRegion,
        onLoadingUserResourcesByCourseTheme: onLoadingUserResourcesByCourseTheme,
        onLoadingAuthenticatedLandingPage: onLoadingAuthenticatedLandingPage,
        onAuthenticatingWithSSO: onAuthenticatingWithSSO,
        onVerifyingIfUserIsEnrolledInCourse: onVerifyingIfUserIsEnrolledInCourse,
        onResolvingFacilitadorForThemeCourse: onResolvingFacilitadorForThemeCourse,
        getUserEBookUrl: getUserEBookUrl,
        geteBookUrl: geteBookUrl
	}, dispatch)
}

const mapStateToProps = ({lrn, theme, grant, auth}) => {
	const { baseLanguage, ebookUrl, enrolleeCountByRegion, totalEnrolleeCount, userIsEnrolledInCourse, facilitadorCourseCodeId } = lrn;
    const { locale, direction, contentLanguage } =  theme;
    const { user } = grant;
    const { token } = auth; 
	return { locale, direction, contentLanguage, baseLanguage, ebookUrl, enrolleeCountByRegion, totalEnrolleeCount, user, token, userIsEnrolledInCourse, facilitadorCourseCodeId }
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseLevel);