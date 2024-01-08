import React, {Component, Suspense} from 'react'
import {connect} from 'react-redux';
import {getWasUserConfigSetFlag, getUserSelectedCourse, getUserNativeLanguage}  from '../../../../redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import InternalIFrame from '../../../../components/layout-components/InternalIFrame';
import { env } from '../../../../configs/EnvironmentConfig';
import Loading from '../../../../components/shared-components/Loading';
import utils from '../../../../utils';

class CourseLevel extends Component {

    componentDidMount() {                
        console.log("this.props; ")
        console.log(this.props)
        }

    componentDidUpdate(){
            
        }

    render() { 
        const { location, match  } = this.props;         
        console.log("TAKE # course level");
        console.log(location.pathname);
        console.log("MATCH");
        console.log(match)

        return (
            <div>
                 {/* <Loading cover="content"/> */}
                 <div>Success AUTH PAGE Landing page </div>
                 <div>{this.props.match.params.nivel}</div>
                 {/* <div>{this.props.match}</div> */}
            </div>
        )
    }
}


function mapDispatchToProps(dispatch){
	return bindActionCreators({
        getWasUserConfigSetFlag: getWasUserConfigSetFlag, 
        getUserSelectedCourse: getUserSelectedCourse,
        getUserNativeLanguage: getUserNativeLanguage
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { wasUserConfigSet, selectedCourse, nativeLanguage } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage }
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseLevel);