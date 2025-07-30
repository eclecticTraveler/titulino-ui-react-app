import React, {Component} from 'react'
import {connect} from 'react-redux';
import {getUserNativeLanguage, getSpeakingPracticeModule}  from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { env } from 'configs/EnvironmentConfig';
import Loading from 'components/shared-components/Loading';
import SpeechPractice from "components/layout-components/SpeechPractice";
import UnderConstruccion from 'components/layout-components/UnderConstruccion';
import utils from 'utils';

class SpeakingSection extends Component {

    loadUrl = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.getSpeakingPracticeModule(pathInfo?.levelNo, pathInfo?.chapterNo, this.props.nativeLanguage?.localizationId, this.props.course );
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
        if(!this.props.speakingChapterModule) {
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
                    <SpeechPractice wordData={this.props.speakingChapterModule} imageUri={this.props.gcBucketUri}/>                    
                </div>
            )
        }    
    }
}


function mapDispatchToProps(dispatch){
	return bindActionCreators({
        getUserNativeLanguage: getUserNativeLanguage,
        getSpeakingPracticeModule: getSpeakingPracticeModule
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { nativeLanguage, speakingChapterModule, gcBucketUri } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, nativeLanguage, speakingChapterModule, gcBucketUri }
};

export default connect(mapStateToProps, mapDispatchToProps)(SpeakingSection);