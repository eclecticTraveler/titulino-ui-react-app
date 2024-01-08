import React, {Component} from 'react'
import {connect} from 'react-redux';
import {getWasUserConfigSetFlag, getUserSelectedCourse, getUserNativeLanguage, getVideoClassUrl}  from '../../../../../redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { env } from '../../../../../configs/EnvironmentConfig';
import Loading from '../../../../../components/shared-components/Loading';
import InternalIFrame from '../../../../../components/layout-components/InternalIFrame';
import utils from '../../../../../utils';

class VideoClass extends Component {

    loadUrl = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.getVideoClassUrl(pathInfo?.levelNo, pathInfo?.chapterNo, this.props.nativeLanguage?.localizationId, this.props.course );
    }
    
    componentDidMount() {                

    }

    componentDidUpdate(){
        this.loadUrl();
    }

    render() {  
        this.loadUrl();
        if(!this.props.videoClass) {
            return (
                <div>
                    <Loading cover="content"/>
                </div>
            )
        }else{
            return (
                <div>
                    <InternalIFrame iFrameUrl={`${this.props.videoClass}`}/>                    
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
        getVideoClassUrl: getVideoClassUrl
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { wasUserConfigSet, selectedCourse, nativeLanguage, videoClass } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, videoClass }
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoClass);