import React, {Component, Suspense} from 'react'
import LandingWrapper from '../../../components/layout-components/Landing/LandingWrapper';
import CourseLandingDashboard from 'components/layout-components/Landing/Unauthenticated/CourseLandingDashboard';
import { geteBookUrl, onLoadingEnrolleeByRegion }  from 'redux/actions/Lrn';
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
        this.props.onLoadingEnrolleeByRegion(pathTheme?.courseTheme)

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
        const searchTerms = ["supermarket", "household"]; // Array of search terms
        const isFound = searchTerms.some(term => this.props.location?.pathname?.includes(term));
        const selecting = true;
        console.log("-------M", (this.props.user?.emailId && !this.props.user?.dateOfBirth));

        if(this.props.user?.emailId && !this.props.user?.dateOfBirth){
            return (
                <div id="unathenticated-landing-page-margin">
                    <EmailYearSearchForm/>
                </div>
            )
        } else if(this.props.user?.emailId && this.props.user?.dateOfBirth) {
            return (
                <div id="unathenticated-landing-page-margin">
                    <ProgressDashboardByEmailV4 />
                </div>
            )
        }

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

function mapDispatchToProps(dispatch){
	return bindActionCreators({
        geteBookUrl: geteBookUrl,
        onLoadingEnrolleeByRegion: onLoadingEnrolleeByRegion
	}, dispatch)
}

const mapStateToProps = ({lrn, theme, grant}) => {
	const { wasUserConfigSet, selectedCourse, nativeLanguage, ebookUrl, enrolleeCountByRegion, totalEnrolleeCount } = lrn;
    const { locale, direction, course } =  theme;
    const { user } = grant;
	return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, ebookUrl, enrolleeCountByRegion, totalEnrolleeCount, user }
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseLevel);