import React, {Component, Suspense} from 'react'
import LandingWrapper from '../../../components/layout-components/Landing/LandingWrapper';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';

class CourseLevel extends Component {

    componentDidMount() {            
    }
     
    componentDidUpdate() {
        // Add here modules that change with the course
	}

    render() {
                 
        return (
            <div id="unathenticated-landing-page-margin">
                 <LandingWrapper course={this.props?.match?.params?.level} coursePath={this.props?.location.pathname}/>              
            </div>
        )             
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