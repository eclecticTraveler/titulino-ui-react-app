import React, {Component} from 'react'
import {connect} from 'react-redux';
import {getUserNativeLanguage, getQuizletUrl}  from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { env } from 'configs/EnvironmentConfig';
import Loading from 'components/shared-components/Loading';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import UnderConstruccion from 'components/layout-components/UnderConstruccion';
import utils from 'utils';

class QuizletPractice extends Component {

    loadUrl = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.getQuizletUrl(pathInfo?.modality, pathInfo?.chapterNo, pathInfo?.levelNo, this.props.nativeLanguage?.localizationId, this.props.course);
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
        if(!this.props.quizletUrl) {
            return (
                <div>
                    <div>
                        <Loading cover="content"/>
                    </div>
                    <UnderConstruccion/>                
                </div>
            )
        }else{
            return (
                <div>
                    <div>
                        <Loading cover="content"/>
                    </div>
                    <InternalIFrame iFrameUrl={`${this.props.quizletUrl}`}/>                    
                </div>
            )
        }
    }
}


function mapDispatchToProps(dispatch){
	return bindActionCreators({
        getUserNativeLanguage: getUserNativeLanguage,
        getQuizletUrl: getQuizletUrl
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { nativeLanguage, quizletUrl } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, nativeLanguage, quizletUrl }
};

export default connect(mapStateToProps, mapDispatchToProps)(QuizletPractice);