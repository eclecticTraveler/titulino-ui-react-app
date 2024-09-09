import React, {Component} from 'react'
import {connect} from 'react-redux';
import {getWasUserConfigSetFlag, getUserSelectedCourse, getUserNativeLanguage, getQuizletUrl}  from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { env } from 'configs/EnvironmentConfig';
import Loading from 'components/shared-components/Loading';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import utils from 'utils';

class QuizletPractice extends Component {

    loadUrl = () => {
        alert("HHH")
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.getQuizletUrl(pathInfo?.modality, pathInfo?.chapterNo, pathInfo?.levelNo, this.props.nativeLanguage?.localizationId, this.props.course);
    }

    componentDidMount() {            
       this.loadUrl();
    }

    componentDidUpdate() {
     
    }

    render() {  
        console.log("YOOOOOOO", pathInfo)
        if(!this.props.quizletUrl) {
            return (
                <div>
                     <Loading cover="content"/>
                </div>
            )
        }else{
            return (
                <div>
                    <InternalIFrame iFrameUrl={`${this.props.quizletUrl}`}/>                    
                </div>
            )
        }
    }
}


function mapDispatchToProps(dispatch){
	return bindActionCreators({
        getWasUserConfigSetFlag: getWasUserConfigSetFlag, 
        getUserSelectedCourse: getUserSelectedCourse,
        getUserNativeLanguage: getUserNativeLanguage,
        getQuizletUrl: getQuizletUrl
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { wasUserConfigSet, selectedCourse, nativeLanguage, quizletUrl } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, quizletUrl }
};

export default connect(mapStateToProps, mapDispatchToProps)(QuizletPractice);