import React, {Component, Suspense} from 'react'
import LandingWrapper from '../../../components/layout-components/Landing/LandingWrapper';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';

class CourseLevel extends Component {

    componentDidMount() {

    }
     
    componentDidUpdate() {

	}

    render() {
        const searchTerm = "supermarket";
        // This has to be refactor as its too weak for an approach
        if(!this.props.location?.pathname?.includes(searchTerm)) {
            return (
                <div id="unathenticated-landing-page-margin">
                     <LandingWrapper course={this.props?.match?.params?.level} coursePath={this.props?.location.pathname}/>              
                </div>
            ) 
        }else{
            return (
                <div id="unathenticated-landing-page-margin">
                     <InternalIFrame iFrameUrl={`https://heyzine.com/flip-book/9d89c42ef1.html`}/>                 
                </div>
            ) 
        }
            
    }
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { wasUserConfigSet, selectedCourse, nativeLanguage } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage }
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseLevel);