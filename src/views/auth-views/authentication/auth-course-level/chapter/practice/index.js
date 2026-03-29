import React, {Component} from 'react'
import {connect} from 'react-redux';
import { getUserBaseLanguage, getQuizletUrl}  from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { env } from 'configs/EnvironmentConfig';
import Loading from 'components/shared-components/Loading';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import utils from 'utils';

class QuizletPractice extends Component {

    loadUrl = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.getQuizletUrl(pathInfo?.modality, pathInfo?.chapterNo, pathInfo?.levelNo, this.props.baseLanguage?.localeCode, this.props.contentLanguage);
    }

    componentDidMount() {            
       this.loadUrl();
    }

    componentDidUpdate() {
     
    }

    render() {  
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
        getUserBaseLanguage: getUserBaseLanguage,
        getQuizletUrl: getQuizletUrl
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { baseLanguage, quizletUrl } = lrn;
    const { locale, direction, contentLanguage } =  theme;
	return { locale, direction, contentLanguage, baseLanguage, quizletUrl }
};

export default connect(mapStateToProps, mapDispatchToProps)(QuizletPractice);