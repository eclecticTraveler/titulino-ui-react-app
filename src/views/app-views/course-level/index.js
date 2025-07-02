import React, {Component, Suspense} from 'react'
import LandingWrapper from '../../../components/layout-components/Landing/LandingWrapper';
import CourseLandingDashboard from 'components/layout-components/Landing/Unauthenticated/CourseLandingDashboard';
import { geteBookUrl, onLoadingEnrolleeByRegion, onLoadingUserResourcesByCourseTheme }  from 'redux/actions/Lrn';
import { onLoadingAuthenticatedLandingPage } from 'redux/actions/Grant';
import ProgressDashboardByEmailV4 from 'components/layout-components/ProgressDashboardByEmailV4';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import utils from 'utils';

import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';

class CourseLevel extends Component {

    loadCourseLandingData = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        const pathTheme = utils.getThemeCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.geteBookUrl(pathInfo?.levelNo, this.props.nativeLanguage?.localizationId, this.props.course );
        this.props.onLoadingEnrolleeByRegion(pathTheme?.courseTheme);
        this.props.onLoadingUserResourcesByCourseTheme(pathTheme?.courseTheme, this.props.nativeLanguage?.localizationId, this.props.course);
        // check if there is a user object saved and valid and fetch it
        if(this.props.token?.email){
            console.log("this.props.token?.email", this.props.token?.email);
            this.props.onLoadingAuthenticatedLandingPage(this.props.token?.email);
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
        const searchTerms = ["supermarket", "household", "work-n-jobs"]; // Array of search terms
        const isFound = searchTerms.some(term => this.props.location?.pathname?.includes(term));

        if(this.props.token){
            if(this.props.user?.emailId && !this.props.user?.yearOfBirth){
                return (
                    <div id="unathenticated-landing-page-margin">
                        <EmailYearSearchForm/>
                    </div>
                )
            } else if(this.props.user?.emailId && this.props.user?.yearOfBirth) {
                return (
                    <div id="unathenticated-landing-page-margin">
                        <ProgressDashboardByEmailV4 />
                    </div>
                )
            }
        }else{
            if(isFound && this.props.ebookUrl){
                return (
                    <div id="unathenticated-landing-page-margin">
                         {/* <InternalIFrame iFrameUrl={this.props.ebookUrl}/>                  */}
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
        onLoadingAuthenticatedLandingPage: onLoadingAuthenticatedLandingPage
	}, dispatch)
}

const mapStateToProps = ({lrn, theme, grant, auth}) => {
	const { wasUserConfigSet, selectedCourse, nativeLanguage, ebookUrl, enrolleeCountByRegion, totalEnrolleeCount } = lrn;
    const { locale, direction, course } =  theme;
    const { user } = grant;
    const { token } = auth; 
	return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, ebookUrl, enrolleeCountByRegion, totalEnrolleeCount, user, token }
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseLevel);