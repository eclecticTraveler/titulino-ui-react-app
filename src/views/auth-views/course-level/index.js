import React, {Component} from 'react'
import LandingWrapper from '../../../components/layout-components/Landing/LandingWrapper';
import CourseLandingDashboard from 'components/layout-components/Landing/Unauthenticated/CourseLandingDashboard';
import LandingAuthenticatedHub from 'views/landing/LandingAuthenticatedHub';
import { env } from 'configs/EnvironmentConfig';
import { geteBookUrl, onLoadingEnrolleeByRegion, onLoadingUserResourcesByCourseTheme, onVerifyingIfUserIsEnrolledInCourse }  from 'redux/actions/Lrn';
import { onLoadingAuthenticatedLandingPage, onAuthenticatingWithSSO } from 'redux/actions/Grant';
import ProgressDashboardByEmailV4 from 'components/layout-components/ProgressDashboardByEmailV4';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import utils from 'utils';
import Loading from 'components/shared-components/Loading';

class AuthCourseLevel extends Component {

    loadCourseLandingData = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        const pathTheme = utils.getThemeCourseInfoFromUrl(this.props.location?.pathname); 

        this.props.geteBookUrl(pathInfo?.levelNo, this.props.baseLanguage?.localeCode, this.props.contentLanguage );
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
        }

    }

    
    componentDidMount() {                
        this.loadCourseLandingData();
    }

    componentDidUpdate(prevProps) {
        const pathChanged = prevProps?.location?.pathname !== this.props.location?.pathname;
        const tokenChanged = prevProps?.token !== this.props.token;
        const userIdentityChanged = (
            this.props.user?.emailId !== prevProps.user?.emailId ||
            this.props.user?.yearOfBirth !== prevProps.user?.yearOfBirth
        );
        const userCoursesChanged = (
            this.props.userCoursesSignature !== prevProps.userCoursesSignature
        );

        if (pathChanged || tokenChanged || userIdentityChanged || userCoursesChanged) {
            this.loadCourseLandingData();
        }
      }

    render() {
        if(this.props.token){
            if(this.props.user?.emailId && this.props.user?.yearOfBirth) {
                if (this.props.userIsEnrolledInCourse === true) {
                    return (
                        <div id="unathenticated-landing-page-margin">
                            <ProgressDashboardByEmailV4 />
                        </div>
                    );
                } else if (this.props.userIsEnrolledInCourse === false) {
                    if (env.IS_ENROLLMENT_LANDING_ON) {
                        return (
                            <div id="unathenticated-landing-page-margin">
                                <LandingAuthenticatedHub />
                            </div>
                        );
                    }
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
        geteBookUrl: geteBookUrl,
        onLoadingEnrolleeByRegion: onLoadingEnrolleeByRegion,
        onLoadingUserResourcesByCourseTheme: onLoadingUserResourcesByCourseTheme,
        onLoadingAuthenticatedLandingPage: onLoadingAuthenticatedLandingPage,
        onAuthenticatingWithSSO: onAuthenticatingWithSSO,
        onVerifyingIfUserIsEnrolledInCourse: onVerifyingIfUserIsEnrolledInCourse
	}, dispatch)
}

const mapStateToProps = ({lrn, theme, grant, auth}) => {
	const { baseLanguage, ebookUrl, enrolleeCountByRegion, totalEnrolleeCount, userIsEnrolledInCourse } = lrn;
    const { locale, direction, contentLanguage } =  theme;
    const { user } = grant;
    const userCoursesSignature = user?.userCoursesSignature || '';
    const { token } = auth; 
	return { locale, direction, contentLanguage, baseLanguage, ebookUrl, enrolleeCountByRegion, totalEnrolleeCount, user, userCoursesSignature, token, userIsEnrolledInCourse }
};

export default connect(mapStateToProps, mapDispatchToProps)(AuthCourseLevel);
