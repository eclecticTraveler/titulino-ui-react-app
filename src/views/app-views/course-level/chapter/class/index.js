import React, {Component} from 'react'
import {connect} from 'react-redux';
import {getUserBaseLanguage, getVideoClassUrl}  from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { env } from '../../../../../configs/EnvironmentConfig';
import Loading from '../../../../../components/shared-components/Loading';
import InternalIFrame from '../../../../../components/layout-components/InternalIFrame';
import UnderConstruccion from '../../../../../components/layout-components/UnderConstruccion';
import utils from 'utils';

class VideoClass extends Component {

    loadUrl = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        console.log("VideoClass pathInfo: ", this.props.location, pathInfo);
        this.props.getVideoClassUrl(pathInfo?.levelNo, pathInfo?.chapterNo, this.props.baseLanguage?.localeCode, this.props.contentLanguage );
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
        if(!this.props.videoClass) {
            return (
                <div>
                    <UnderConstruccion/>                
                </div>
            )
        }else{
            return (
                <div id="unathenticated-page">
                    <InternalIFrame iFrameUrl={`${this.props.videoClass}`}/>                    
                </div>
            )
        }    
    }
}


function mapDispatchToProps(dispatch){
	return bindActionCreators({
        getUserBaseLanguage: getUserBaseLanguage,
        getVideoClassUrl: getVideoClassUrl
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { baseLanguage, videoClass } = lrn;
    const { locale, direction, contentLanguage } =  theme;
	return { locale, direction, contentLanguage, baseLanguage, videoClass }
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoClass);