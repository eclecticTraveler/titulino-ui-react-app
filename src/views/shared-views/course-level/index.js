import React, {Component, Suspense} from 'react'
import LandingWrapper from '../../../components/layout-components/Landing/LandingWrapper';
import CourseLandingDashboard from 'components/layout-components/Landing/Unauthenticated/CourseLandingDashboard';
import { getUserEBookUrl, onLoadingEnrolleeByRegion, onLoadingUserResourcesByCourseTheme, onVerifyingIfUserIsEnrolledInCourse }  from 'redux/actions/Lrn';
import { onLoadingAuthenticatedLandingPage, onAuthenticatingWithSSO } from 'redux/actions/Grant';
import ProgressDashboardByEmailV4 from 'components/layout-components/ProgressDashboardByEmailV4';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import utils from 'utils';
import Loading from 'components/shared-components/Loading';

import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';

class CourseLevel extends Component {

    loadCourseLandingData = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        const pathTheme = utils.getThemeCourseInfoFromUrl(this.props.location?.pathname); 
        
        this.props.onLoadingEnrolleeByRegion(pathTheme?.courseTheme);
        this.props.onLoadingUserResourcesByCourseTheme(pathTheme?.courseTheme, this.props.nativeLanguage?.localizationId, this.props.course);
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
            this.props.getUserEBookUrl(pathInfo?.levelNo, this.props.nativeLanguage?.localizationId, this.props.course, this.props.user?.emailId);
        }

    }

    
    componentDidMount() {                
        this.loadCourseLandingData();
    }

    componentDidUpdate(prevProps) {       
        if (prevProps?.location?.pathname !== this.props.location?.pathname) {
            this.loadCourseLandingData();
        }
      }

    render() {
        if(this.props.token){
            if(this.props.user?.emailId && !this.props.user?.yearOfBirth){
                return (
                    <div id="unathenticated-landing-page-margin">
                        <EmailYearSearchForm/>
                    </div>
                )
            } else if(this.props.user?.emailId && this.props.user?.yearOfBirth) {

                if (this.props.userIsEnrolledInCourse === true) {
                    // return (
                    //     <div id="unathenticated-landing-page-margin">
                    //         <ProgressDashboardByEmailV4 />
                    //     </div>
                    // );

                    if (this.props.ebookUrl) {
                        return (
                            <div id="unathenticated-landing-page-margin">
                                <InternalIFrame iFrameUrl={this.props.ebookUrl} />
                            </div>
                        );
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
        getUserEBookUrl: getUserEBookUrl
	}, dispatch)
}

const mapStateToProps = ({lrn, theme, grant, auth}) => {
	const { nativeLanguage, ebookUrl, enrolleeCountByRegion, totalEnrolleeCount, userIsEnrolledInCourse } = lrn;
    const { locale, direction, course } =  theme;
    const { user } = grant;
    const { token } = auth; 
	return { locale, direction, course, nativeLanguage, ebookUrl, enrolleeCountByRegion, totalEnrolleeCount, user, token, userIsEnrolledInCourse }
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseLevel);