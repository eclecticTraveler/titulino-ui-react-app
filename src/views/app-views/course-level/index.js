import React, {Component, Suspense} from 'react'
import LandingWrapper from '../../../components/layout-components/Landing/LandingWrapper';
import { geteBookUrl }  from 'redux/actions/Lrn';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import utils from 'utils';

class CourseLevel extends Component {

    loadUrl = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.geteBookUrl(pathInfo?.levelNo, this.props.nativeLanguage?.localizationId, this.props.course );
    }
    
    componentDidMount() {                
        this.loadUrl();
    }

    componentDidUpdate(prevProps) {       
        if (prevProps?.location?.pathname !== this.props.location?.pathname) {
            this.loadUrl();
        }
      }

    render() {
        const searchTerm = "supermarket";
        console.log("ebookUrl", this.props.ebookUrl);
        const searchTerms = ["supermarket", "household"]; // Array of search terms
        const isFound = searchTerms.some(term => this.props.location?.pathname?.includes(term));

        if(isFound && this.props.ebookUrl){
            return (
                <div id="unathenticated-landing-page-margin">
                     <InternalIFrame iFrameUrl={this.props.ebookUrl}/>                 
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
        geteBookUrl: geteBookUrl
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { wasUserConfigSet, selectedCourse, nativeLanguage, ebookUrl } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, ebookUrl }
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseLevel);