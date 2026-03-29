import React, {Component} from 'react'
import {connect} from 'react-redux';
import {getUserBaseLanguage, getSpeakingPracticeModule}  from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import Loading from 'components/shared-components/Loading';
import SpeechPractice from "components/layout-components/SpeechPractice";
import UnderConstruccion from 'components/layout-components/UnderConstruccion';
import utils from 'utils';

class SpeakingSection extends Component {

    loadUrl = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.getSpeakingPracticeModule(pathInfo?.levelNo, pathInfo?.chapterNo, this.props.baseLanguage?.localeCode, this.props.contentLanguage );
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
        getUserBaseLanguage: getUserBaseLanguage,
        getSpeakingPracticeModule: getSpeakingPracticeModule
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { baseLanguage, speakingChapterModule, gcBucketUri } = lrn;
    const { locale, direction, contentLanguage } =  theme;
	return { locale, direction, contentLanguage, baseLanguage, speakingChapterModule, gcBucketUri }
};

export default connect(mapStateToProps, mapDispatchToProps)(SpeakingSection);