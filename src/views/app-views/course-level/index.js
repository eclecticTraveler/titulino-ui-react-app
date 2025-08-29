import React, {Component, Suspense} from 'react'
import LandingWrapper from '../../../components/layout-components/Landing/LandingWrapper';
import CourseLandingDashboard from 'components/layout-components/Landing/Unauthenticated/CourseLandingDashboard';
import { geteBookUrl, onLoadingEnrolleeByRegion, onLoadingUserResourcesByCourseTheme, onVerifyingIfUserIsEnrolledInCourse }  from 'redux/actions/Lrn';
import { onLoadingAuthenticatedLandingPage, onAuthenticatingWithSSO } from 'redux/actions/Grant';
import ProgressDashboardByEmailV4 from 'components/layout-components/ProgressDashboardByEmailV4';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import utils from 'utils';
import Loading from 'components/shared-components/Loading';

import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';

class CourseLevel extends Component {

    loadPublicCourseLandingData = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        const pathTheme = utils.getThemeCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.geteBookUrl(pathInfo?.levelNo, this.props.nativeLanguage?.localizationId, this.props.course );
        this.props.onLoadingEnrolleeByRegion(pathTheme?.courseTheme)

    }
    
    componentDidMount() {                
        this.loadPublicCourseLandingData();
    }

    componentDidUpdate(prevProps) {       
        if (prevProps?.location?.pathname !== this.props.location?.pathname) {
            this.loadPublicCourseLandingData();
        }
      }

    render() {
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
	const { nativeLanguage, ebookUrl, enrolleeCountByRegion, totalEnrolleeCount, userIsEnrolledInCourse } = lrn;
    const { locale, direction, course } =  theme;
    const { user } = grant;
    const { token } = auth; 
	return { locale, direction, course, nativeLanguage, ebookUrl, enrolleeCountByRegion, totalEnrolleeCount, user, token, userIsEnrolledInCourse }
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseLevel);